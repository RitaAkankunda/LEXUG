# LexUg Mobile App Setup Guide

You're all set! Here's what has been created:

## 📦 What Was Created

### Backend Updates
- ✅ Firebase integration (`firebase-config.js`)
- ✅ User authentication endpoints (signup, login)
- ✅ Chat history management (save, retrieve, delete)
- ✅ JWT token authentication
- ✅ Environment configuration guide (`FIREBASE_SETUP.md`)

### Mobile App (Expo + React Native)
- ✅ Authentication screens (Login, Signup)
- ✅ Chat screen with AI integration
- ✅ Chat history screen
- ✅ User profile screen
- ✅ Firebase context & API service
- ✅ Navigation setup

## 🚀 Getting Started

### Step 1: Firebase Setup (Required)
Go to [Firebase Console](https://console.firebase.google.com/) and follow [backend/FIREBASE_SETUP.md](../backend/FIREBASE_SETUP.md)

You need:
- `FIREBASE_SERVICE_ACCOUNT` - Service account JSON
- `FIREBASE_DATABASE_URL` - Your database URL
- `FIREBASE_API_KEY` - Web API key

### Step 2: Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create .env file from .env.example
cp .env.example .env

# 3. Fill in your Firebase credentials and API keys
# Edit .env with your actual values

# 4. Start the backend
npm run dev
```

The backend should run on `http://localhost:3002`

### Step 3: Mobile App Setup

```bash
cd mobile

# 1. Install Expo CLI globally
npm install -g expo-cli

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

You'll see options:
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator
- Press `w` for web preview
- Press `j` to open Expo DevTools

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│       Mobile App (React Native + Expo)      │
│  ┌────────────────────────────────────────┐ │
│  │ Screens (Login, Chat, History, etc)    │ │
│  ├────────────────────────────────────────┤ │
│  │ Navigation (Stack, Tabs)               │ │
│  ├────────────────────────────────────────┤ │
│  │ Auth Context (User session)            │ │
│  ├────────────────────────────────────────┤ │
│  │ API Service (axios)                    │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
              ↓ HTTP Requests ↓
┌─────────────────────────────────────────────┐
│   Backend (Node.js + Express + Firebase)    │
│  ┌────────────────────────────────────────┐ │
│  │ Authentication (JWT)                   │ │
│  ├────────────────────────────────────────┤ │
│  │ Chat API (Claude AI proxy)             │ │
│  ├────────────────────────────────────────┤ │
│  │ History API (Save/Retrieve)            │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
              ↓ API Calls ↓
┌─────────────────────────────────────────────┐
│   Firebase (Auth + Realtime Database)       │
│   Claude AI API                             │
└─────────────────────────────────────────────┘
```

## 📱 Features

### Authentication
- User signup with email/password
- User login
- JWT token management
- Persistent login (AsyncStorage)

### Chat
- Ask questions about Ugandan law
- Quick card suggestions
- Real-time AI responses
- Message history per conversation

### History
- View all past conversations
- Delete conversations
- Timestamps for reference

### Profile
- View account info
- Logout option
- App version info

## 🔑 Environment Variables

### Backend (.env)
```
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
FIREBASE_DATABASE_URL='https://your-project.firebaseio.com'
FIREBASE_API_KEY='AIza...'
CLAUDE_API_KEY='sk-ant-...'
PORT=3002
JWT_SECRET='random-secret-key'
```

### Mobile
Update `app.json` → `extra.API_URL`:
```json
"extra": {
  "API_URL": "http://localhost:3002"
}
```

For production, use your deployed backend URL.

## 📂 File Structure

```
LEXUG/
├── backend/
│   ├── server.js                 # Updated with Firebase
│   ├── firebase-config.js        # Firebase setup
│   ├── package.json              # Updated dependencies
│   ├── .env.example              # Environment template
│   └── FIREBASE_SETUP.md         # Firebase guide
│
├── mobile/                        # NEW: Mobile app
│   ├── App.tsx                   # Entry point
│   ├── app.json                  # Expo config
│   ├── package.json              # Dependencies
│   ├── babel.config.js           # Babel setup
│   ├── tsconfig.json             # TypeScript config
│   ├── screens/                  # Screens
│   ├── navigation/               # Navigation
│   ├── context/                  # Auth context
│   ├── services/                 # API service
│   ├── README.md                 # Mobile guide
│   └── .gitignore
│
└── frontend/                      # Keep existing web version
    ├── app.js
    ├── index.html
    └── ...
```

## 🧪 Testing the App

### 1. Test Backend Connection
```bash
# From terminal
curl http://localhost:3002/api/health
```

Expected response:
```json
{
  "status": "ok",
  "apiKeyConfigured": true,
  "firebaseConfigured": true
}
```

### 2. Test Signup (Postman/Insomnia)
```
POST http://localhost:3002/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "displayName": "Test User"
}
```

### 3. Test Chat in Mobile App
- Sign up with a test account
- Ask: "What are my rights if I'm arrested in Uganda?"
- Response should come from Claude AI

## ⚙️ Configuration Tips

### API URL for Different Environments

**Development (Local):**
```json
"API_URL": "http://localhost:3002"
```

**Development (Device on Network):**
```json
"API_URL": "http://192.168.x.x:3002"
```
(Find your IP: `ipconfig` on Windows or `ifconfig` on Mac/Linux)

**Production:**
```json
"API_URL": "https://your-deployed-backend.com"
```

## 🐛 Common Issues

### "Can't connect to backend"
- Backend must be running: `npm run dev` in `/backend`
- Check API_URL in mobile app matches your backend
- Check firewall/network connectivity

### "Authentication fails"
- Verify Firebase credentials are correct in `.env`
- Check FIREBASE_API_KEY is valid
- Try restarting backend

### "Emulator won't start"
- Ensure Android Studio/Xcode is installed
- Try: `expo start --clear`
- Check if emulator has enough disk space

### "Module not found errors"
- Run: `npm install` in mobile folder
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## 🚀 Next Steps

1. ✅ Set up Firebase
2. ✅ Configure backend with credentials
3. ✅ Start backend (`npm run dev`)
4. ✅ Install mobile app dependencies (`npm install`)
5. ✅ Start mobile app (`npm start`)
6. Test sign up and chat functionality
7. Build for app stores (See mobile/README.md for details)

## 📚 Deployment

### Backend Deployment
- Deploy to Heroku, Railway, Render, or AWS
- Set environment variables on hosting platform
- Update mobile app `API_URL` to deployed backend

### Mobile App Deployment
- Use EAS (Expo Application Services) for cloud builds
- Submit to Google Play (Android) and App Store (iOS)
- See mobile/README.md for detailed build instructions

## 📞 Support

For issues:
1. Check if backend is running on port 3002
2. Verify all environment variables are set
3. Check console logs (mobile: Expo DevTools, backend: terminal)
4. Restart backend and app

Good luck! 🚀
