t -# LexUg Backend

This is the backend server for LexUg, handling API requests to Claude AI.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Claude API key:
   ```
   CLAUDE_API_KEY=your_actual_api_key_here
   PORT=3002
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3002`.

## API Endpoints

- `POST /api/chat` - Send chat messages to Claude
- `GET /api/health` - Health check

## Security

The API key is stored server-side and not exposed to the frontend, improving security.