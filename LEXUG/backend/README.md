# LexUg Backend

Node/Express API server for the LexUg Expo mobile app.

This backend follows the project architecture:

- Firebase Auth for account signup/login
- Firebase Realtime Database for saved chat history
- Claude / Anthropic Messages API proxy for AI answers
- Local JSON + demo AI fallback when Firebase or Claude credentials are not present

## Start

```bash
npm install
copy .env.example .env
npm start
```

The server listens on `http://localhost:3002`.

For phone testing with Expo Go, keep the phone and computer on the same Wi-Fi. The app will call the backend through the computer's LAN IP, for example `http://10.114.3.224:3002`.

## Required Firebase Config

Create a Firebase project, enable Email/Password authentication, and create a Realtime Database.

Add these values to `.env`:

```bash
FIREBASE_API_KEY=your_web_api_key
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

You can also store the service account JSON in a file and set:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
```

## Claude Config

Add one of these to `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
# or
CLAUDE_API_KEY=sk-ant-...
```

## Endpoints

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/chat`
- `POST /api/chat/save`
- `GET /api/chat/history`
- `GET /api/chat/history/:conversationId`
- `DELETE /api/chat/history/:conversationId`

Without a Claude API key, `/api/chat` returns helpful demo civic-education answers so the app remains testable.
Without Firebase credentials, auth and history use local JSON storage in `backend/data/`.
