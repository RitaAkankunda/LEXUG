const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function parseServiceAccount() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    return serviceAccount;
  }

  if (serviceAccountPath) {
    const resolvedPath = path.resolve(__dirname, serviceAccountPath);
    return JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  }

  return null;
}

function initializeFirebase() {
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  const serviceAccount = parseServiceAccount();

  if (!databaseURL || !serviceAccount) {
    return {
      admin: null,
      auth: null,
      db: null,
      firebaseConfigured: false,
    };
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  }

  return {
    admin,
    auth: admin.auth(),
    db: admin.database(),
    firebaseConfigured: true,
  };
}

module.exports = initializeFirebase();
