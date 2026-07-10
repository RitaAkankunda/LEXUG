require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { auth: firebaseAuth, db, firebaseConfigured } = require('./firebase-config');
const { getChatAnswer, isChatMessage, activeProvider, activeModel } = require('./services/chat');

const app = express();
const PORT = Number(process.env.PORT || 3002);
const JWT_SECRET = process.env.JWT_SECRET || 'lexug-local-development-secret';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || '';
const FIREBASE_DATABASE_URL = (process.env.FIREBASE_DATABASE_URL || '').replace(/\/$/, '');
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CHATS_FILE = path.join(DATA_DIR, 'chats.json');

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const useFirebase = Boolean(firebaseConfigured && FIREBASE_API_KEY);
const FIREBASE_DATABASE_TIMEOUT_MS = 10000;

function withTimeout(promise, message, timeoutMs = FIREBASE_DATABASE_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

function firebaseRestUrl(pathSegment, idToken) {
  return `${FIREBASE_DATABASE_URL}/${pathSegment}.json?auth=${encodeURIComponent(idToken)}`;
}

async function firebaseRestSet(pathSegment, value, idToken) {
  await axios.put(firebaseRestUrl(pathSegment, idToken), value, {
    timeout: FIREBASE_DATABASE_TIMEOUT_MS,
  });
}

async function firebaseRestGet(pathSegment, idToken) {
  const response = await axios.get(firebaseRestUrl(pathSegment, idToken), {
    timeout: FIREBASE_DATABASE_TIMEOUT_MS,
  });
  return response.data;
}

async function firebaseRestDelete(pathSegment, idToken) {
  await axios.delete(firebaseRestUrl(pathSegment, idToken), {
    timeout: FIREBASE_DATABASE_TIMEOUT_MS,
  });
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await ensureJsonFile(USERS_FILE, { users: [] });
  await ensureJsonFile(CHATS_FILE, { chatsByUser: {} });
}

async function ensureJsonFile(filePath, fallback) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
  }
}

async function readJson(filePath, fallback) {
  await ensureStore();
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function mapFirebaseAuthError(error) {
  const code = error.response?.data?.error?.message || error.code || '';

  if (code.includes('EMAIL_EXISTS')) return 'An account with this email already exists';
  if (code.includes('EMAIL_NOT_FOUND') || code.includes('INVALID_PASSWORD') || code.includes('INVALID_LOGIN_CREDENTIALS')) {
    return 'Invalid email or password';
  }
  if (code.includes('WEAK_PASSWORD')) return 'Password must be at least 6 characters';
  if (code.includes('INVALID_EMAIL')) return 'Please enter a valid email address';
  if (code.includes('CONFIGURATION_NOT_FOUND')) {
    return 'Firebase Authentication is not enabled for this project. Enable Email/Password sign-in in Firebase Console.';
  }

  return 'Authentication failed';
}

function createLocalToken(user) {
  return jwt.sign(
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function publicUser(user) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}

async function firebaseSignup(email, password, displayName) {
  const signupResponse = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      email,
      password,
      returnSecureToken: true,
    }
  );

  const { idToken, localId: uid } = signupResponse.data;

  await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`,
    {
      idToken,
      displayName,
      returnSecureToken: true,
    }
  );

  await firebaseRestSet(
    `profiles/${uid}`,
    {
      email,
      displayName,
      createdAt: new Date().toISOString(),
    },
    idToken
  );

  return {
    uid,
    email,
    displayName,
    token: idToken,
  };
}

async function firebaseLogin(email, password) {
  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      email,
      password,
      returnSecureToken: true,
    }
  );

  const { idToken, localId: uid, displayName = '' } = response.data;

  return {
    uid,
    email,
    displayName,
    token: idToken,
  };
}

async function localSignup(email, password, displayName) {
  const store = await readJson(USERS_FILE, { users: [] });
  const existingUser = store.users.find((user) => user.email === email);

  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = {
    uid: crypto.randomUUID(),
    email,
    displayName,
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  await writeJson(USERS_FILE, store);

  return {
    ...publicUser(user),
    token: createLocalToken(user),
  };
}

async function localLogin(email, password) {
  const store = await readJson(USERS_FILE, { users: [] });
  const user = store.users.find((candidate) => candidate.email === email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return {
    ...publicUser(user),
    token: createLocalToken(user),
  };
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (useFirebase) {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || '',
      };
      req.authToken = token;
      return next();
    }

    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}


async function saveConversation(uid, conversationId, conversation, idToken) {
  if (useFirebase) {
    await firebaseRestSet(`chats/${uid}/${conversationId}`, conversation, idToken);
    return;
  }

  const store = await readJson(CHATS_FILE, { chatsByUser: {} });
  const userChats = store.chatsByUser[uid] || {};
  userChats[conversationId] = conversation;
  store.chatsByUser[uid] = userChats;
  await writeJson(CHATS_FILE, store);
}

async function getUserConversations(uid, idToken) {
  if (useFirebase) {
    return (await firebaseRestGet(`chats/${uid}`, idToken)) || {};
  }

  const store = await readJson(CHATS_FILE, { chatsByUser: {} });
  return store.chatsByUser[uid] || {};
}

async function getConversation(uid, conversationId, idToken) {
  const conversations = await getUserConversations(uid, idToken);
  return conversations[conversationId] || null;
}

async function deleteConversation(uid, conversationId, idToken) {
  if (useFirebase) {
    await firebaseRestDelete(`chats/${uid}/${conversationId}`, idToken);
    return;
  }

  const store = await readJson(CHATS_FILE, { chatsByUser: {} });
  const userChats = store.chatsByUser[uid] || {};
  delete userChats[conversationId];
  store.chatsByUser[uid] = userChats;
  await writeJson(CHATS_FILE, store);
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: activeProvider !== 'demo',
    firebaseConfigured: useFirebase,
    firebaseAdminConfigured: firebaseConfigured,
    firebaseApiKeyConfigured: Boolean(FIREBASE_API_KEY),
    storage: useFirebase ? 'firebase-realtime-database' : 'local-json',
    ai: activeModel,
    aiProvider: activeProvider,
  });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const displayName = String(req.body.displayName || '').trim();

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const result = useFirebase
      ? await firebaseSignup(email, password, displayName)
      : await localSignup(email, password, displayName);

    return res.status(201).json(result);
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    return res.status(error.statusCode || 400).json({
      error: useFirebase ? mapFirebaseAuthError(error) : error.message || 'Failed to create account',
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = useFirebase ? await firebaseLogin(email, password) : await localLogin(email, password);
    return res.json(result);
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return res.status(error.statusCode || 401).json({
      error: useFirebase ? mapFirebaseAuthError(error) : error.message || 'Failed to log in',
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];

    if (!messages.some(isChatMessage)) {
      return res.status(400).json({ error: 'At least one chat message is required' });
    }

    const answer = await getChatAnswer(messages);
    return res.json(answer);
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to get chat response' });
  }
});

app.post('/api/chat/save', requireAuth, async (req, res) => {
  try {
    const conversationId = String(req.body.conversationId || '').trim();
    const messages = Array.isArray(req.body.messages) ? req.body.messages.filter(isChatMessage) : [];
    const question = String(req.body.question || '').trim();
    const answer = String(req.body.answer || '').trim();

    if (!conversationId || messages.length === 0 || !question || !answer) {
      return res.status(400).json({ error: 'Conversation id, messages, question, and answer are required' });
    }

    await saveConversation(
      req.user.uid,
      conversationId,
      {
        timestamp: new Date().toISOString(),
        question,
        answer,
        messages,
      },
      req.authToken
    );

    return res.json({ ok: true, conversationId });
  } catch (error) {
    console.error('Save chat error:', error);
    return res.status(500).json({ error: 'Failed to save chat' });
  }
});

app.get('/api/chat/history', requireAuth, async (req, res) => {
  try {
    const history = await getUserConversations(req.user.uid, req.authToken);
    return res.json(history);
  } catch (error) {
    console.error('History error:', error);
    return res.status(500).json({ error: 'Failed to load history' });
  }
});

app.get('/api/chat/history/:conversationId', requireAuth, async (req, res) => {
  try {
    const conversation = await getConversation(req.user.uid, req.params.conversationId, req.authToken);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.json(conversation);
  } catch (error) {
    console.error('Conversation error:', error);
    return res.status(500).json({ error: 'Failed to load conversation' });
  }
});

app.delete('/api/chat/history/:conversationId', requireAuth, async (req, res) => {
  try {
    await deleteConversation(req.user.uid, req.params.conversationId, req.authToken);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

ensureStore()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`LexUg backend listening on http://0.0.0.0:${PORT}`);
      console.log(`Storage: ${useFirebase ? 'Firebase Realtime Database' : 'local JSON fallback'}`);
      console.log(`AI: ${activeProvider === 'demo' ? 'demo fallback' : `${activeProvider} (${activeModel})`}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start backend:', error);
    process.exit(1);
  });
