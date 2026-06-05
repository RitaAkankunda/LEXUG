# LexUg Mobile App

React Native mobile app for LexUg - Ugandan Civic AI Companion using Expo.

## Features

- 🔐 User authentication (signup/login)
- 💬 Chat with Claude AI about Ugandan law & rights
- 📚 Chat history with Firebase
- 👤 User profiles
- 📱 Works on iOS and Android

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API URL
Update `app.json` to point to your backend:
```json
{
  "expo": {
    "extra": {
      "API_URL": "http://localhost:3002"
    }
  }
}
```

### 3. Ensure Backend is Running
```bash
cd ../backend
npm install
npm run dev
```

## Running the App

### Development Server
```bash
npm start
```

### Android Emulator
```bash
npm run android
```

### iOS Simulator (Mac only)
```bash
npm run ios
```

### Web Preview
```bash
npm run web
```

## Project Structure

```
mobile/
├── App.tsx                    # Entry point
├── app.json                   # Expo config
├── package.json               # Dependencies
├── screens/                   # Screen components
│   ├── LoginScreen.tsx
│   ├── SignupScreen.tsx
│   ├── ChatScreen.tsx
│   ├── HistoryScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/                # Navigation setup
│   └── RootNavigator.tsx
├── context/                   # React context
│   └── AuthContext.tsx
├── services/                  # API services
│   └── api.ts
└── assets/                    # Images & icons
```

## API Integration

The app connects to the LexUg backend at `http://localhost:3002` (configurable).

### Key Endpoints

**Authentication:**
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

**Chat:**
- `POST /api/chat` - Send message to Claude (requires auth token)
- `POST /api/chat/save` - Save conversation (requires auth token)
- `GET /api/chat/history` - Get all conversations (requires auth token)
- `DELETE /api/chat/history/:id` - Delete conversation (requires auth token)

### Authentication Flow

1. User signs up/logs in
2. Backend returns JWT token
3. Token stored in AsyncStorage
4. Token included in all subsequent API requests

## Development Tips

### Debugging

- Open Expo DevTools: press `j` in terminal
- View logs: press `l` to open logs
- Hot reload: Save file and watch app update

### Testing API Calls

Use Postman or Insomnia:

```
Authorization: Bearer {token}
Content-Type: application/json
```

### Building for Production

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to app stores
eas submit --platform android
eas submit --platform ios
```

## Troubleshooting

### App won't connect to backend
- Check backend is running on port 3002
- Update `API_URL` in `app.json` to match your setup
- Check device/emulator network connection

### Authentication fails
- Ensure Firebase is configured in backend
- Check FIREBASE_API_KEY in backend `.env`
- Verify Firebase service account credentials

### Can't run on iOS
- Requires macOS and Xcode
- Run `expo prebuild --clean` if issues persist

## Build & Deployment

### First Time Setup
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Build for Store
```bash
# Android (Google Play)
eas build --platform android --auto-submit

# iOS (App Store)
eas build --platform ios --auto-submit
```

## Support

For issues or questions, check the [LexUg main README](../README.md)
