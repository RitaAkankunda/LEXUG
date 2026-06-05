# Firebase Setup Guide for LexUg

## Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a new project"
3. Enter project name: `lexug-app`
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Realtime Database
1. In Firebase Console, go to **Build > Realtime Database**
2. Click **Create Database**
3. Choose location (closest to your users)
4. Start in **Test mode** (for development)
5. Click **Enable**

## Step 3: Enable Authentication
1. Go to **Build > Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
4. Click **Enable**

## Step 4: Get Your Configuration
1. Go to **Project Settings** (gear icon)
2. Under **Service Accounts** tab:
   - Click **Generate New Private Key**
   - Save the downloaded JSON file
   - Copy the entire content as `FIREBASE_SERVICE_ACCOUNT`

3. Under **General** tab:
   - Find "Your apps" section
   - Note your `Database URL` - this is `FIREBASE_DATABASE_URL`

4. Go back to **Authentication > Settings**
   - Find **Web API Key** - this is `FIREBASE_API_KEY`

## Step 5: Update Backend Environment
1. Create `.env` file in `/backend` directory
2. Copy from `.env.example`
3. Fill in your Firebase credentials:

```
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
FIREBASE_DATABASE_URL='https://your-project.firebaseio.com'
FIREBASE_API_KEY='AIza...'
CLAUDE_API_KEY='sk-ant-...'
JWT_SECRET='generate-a-random-secret'
```

## Step 6: Install Dependencies
```bash
cd backend
npm install
```

## Step 7: Test Firebase Connection
```bash
npm run dev
```

Check console for:
✅ Firebase Configured
✅ API Key Configured

## Database Structure
Your Firebase Realtime Database will look like:
```
users/
  ├── {userId}/
  │   ├── email: "user@example.com"
  │   ├── displayName: "John Doe"
  │   ├── createdAt: "2026-06-05T..."
  │   └── chats/
  │       ├── {conversationId}/
  │       │   ├── timestamp: "..."
  │       │   ├── question: "..."
  │       │   ├── answer: "..."
  │       │   └── messages: [...]
```

## Security Rules (Production)
Update your Realtime Database rules in Firebase Console:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        ".validate": "newData.hasChildren(['email', 'displayName', 'createdAt'])"
      }
    }
  }
}
```

## Next Steps
- Mobile app will authenticate and fetch/save chats using these endpoints
- Test with Postman or Insomnia:
  - POST `/api/auth/signup`
  - POST `/api/auth/login`
  - POST `/api/chat/save` (with auth token)
  - GET `/api/chat/history` (with auth token)
