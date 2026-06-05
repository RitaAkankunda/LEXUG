const admin = require('firebase-admin');
require('dotenv').config();

let db = null;
let auth = null;
let firebaseConfigured = false;

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.FIREBASE_DATABASE_URL) {
    throw new Error('Firebase environment variables are not configured');
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  db = admin.database();
  auth = admin.auth();
  firebaseConfigured = true;
} catch (error) {
  console.warn('Firebase not configured:', error.message);
}

module.exports = { admin, db, auth, firebaseConfigured };
