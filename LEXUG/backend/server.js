const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { db, auth, firebaseConfigured } = require('./firebase-config');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Serve frontend files
const frontendPath = path.join(__dirname, '..', 'frontend');
console.log('Serving frontend from:', frontendPath);
app.use(express.static(frontendPath));

// Middleware: Verify JWT token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.uid;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireFirebase = (req, res, next) => {
  if (!firebaseConfigured || !db || !auth) {
    return res.status(503).json({
      error: 'Firebase is not configured. Add Firebase credentials to backend/.env.',
    });
  }

  next();
};

// ==================== AUTHENTICATION ENDPOINTS ====================

// Sign up
app.post('/api/auth/signup', requireFirebase, async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    // Create user profile in database
    await db.ref(`users/${userRecord.uid}`).set({
      email,
      displayName,
      createdAt: new Date().toISOString(),
      chatHistory: [],
    });

    // Generate JWT token
    const token = jwt.sign({ uid: userRecord.uid }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', requireFirebase, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verify user credentials using Firebase REST API
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + process.env.FIREBASE_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ uid: data.localId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      uid: data.localId,
      email: data.email,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Login failed' });
  }
});

// ==================== CHAT HISTORY ENDPOINTS ====================

// Save chat message
app.post('/api/chat/save', verifyToken, requireFirebase, async (req, res) => {
  try {
    const { conversationId, messages, question, answer } = req.body;
    const userId = req.userId;

    const chatEntry = {
      timestamp: new Date().toISOString(),
      question,
      answer,
      messages,
    };

    await db.ref(`users/${userId}/chats/${conversationId}`).set(chatEntry);

    res.json({ success: true, conversationId });
  } catch (error) {
    console.error('Save chat error:', error);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

// Get chat history
app.get('/api/chat/history', verifyToken, requireFirebase, async (req, res) => {
  try {
    const userId = req.userId;
    const snapshot = await db.ref(`users/${userId}/chats`).once('value');
    const chats = snapshot.val() || {};

    res.json(chats);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Get specific conversation
app.get('/api/chat/history/:conversationId', verifyToken, requireFirebase, async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    const snapshot = await db.ref(`users/${userId}/chats/${conversationId}`).once('value');
    const chat = snapshot.val();

    if (!chat) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

// Delete conversation
app.delete('/api/chat/history/:conversationId', verifyToken, requireFirebase, async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;

    await db.ref(`users/${userId}/chats/${conversationId}`).remove();

    res.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// ==================== CLAUDE API PROXY ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: !!process.env.CLAUDE_API_KEY,
    firebaseConfigured,
    timestamp: new Date().toISOString(),
  });
});

// Claude API proxy
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;

    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: system,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all: serve frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🇺🇬 LexUg running at http://localhost:${PORT}`);
  console.log(`   Frontend: ${frontendPath}`);
  console.log(`   API Key: ${process.env.CLAUDE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Firebase: ${firebaseConfigured ? 'Configured' : 'Missing'}\n`);
});
