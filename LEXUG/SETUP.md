# 🛠️ LexUg Local Development Setup

## Prerequisites

- **Browser** — Chrome, Firefox, Safari, or Edge (any modern browser)
- **Internet** — For Claude API calls
- **API Key** — Free from [console.anthropic.com](https://console.anthropic.com)
- **Text Editor** — VS Code recommended (or any editor)

---

## Quick Start (5 Minutes)

### 1. Clone the Repository
```bash
cd your-projects-folder
git clone https://github.com/RitaAkankunda/LEXUG.git
cd LEXUG
```

### 2. Start a Local Server

**Option A: Python 3** (Recommended — usually pre-installed)
```bash
python -m http.server 8000

# Output:
# Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

**Option B: Python 2**
```bash
python -m SimpleHTTPServer 8000
```

**Option C: Node.js**
```bash
# Install globally (first time only)
npm install -g http-server

# Run
http-server
```

**Option D: VS Code Live Server**
```
1. Install "Live Server" extension (ID: ritwickdey.LiveServer)
2. Right-click index.html → "Open with Live Server"
3. Opens automatically at http://localhost:5500
```

### 3. Open in Browser
```
http://localhost:8000
```

### 4. Test in Demo Mode (No API Key)
1. Click "Start Asking"
2. Type any question about Ugandan law
3. Click the "Skip" button when prompted for API key
4. See pre-loaded demo responses

---

## Full Setup with Claude API

### Step 1: Get Free API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click "Sign up" (takes 1 minute)
3. Receive $5 free credits (enough for ~100 chats)
4. Copy your API key (looks like: `sk-ant-v0-xxxxx...`)

### Step 2: Enter Key in LexUg
1. Open http://localhost:8000
2. Paste your API key when prompted
3. Click "Start Using LexUg"
4. Your key is stored locally (never sent anywhere)

### Step 3: Test Features

**Test Chat:**
```
Q: "What are my rights if arrested?"
Expected: Full answer citing Article 23 of Constitution
```

**Test Language Toggle:**
1. Click "🇺🇬 EN" button (top-right of chat)
2. Ask a new question
3. Should respond in Luganda now

**Test Quick Cards:**
1. Home page → See "Popular questions" section
2. Click any card
3. Auto-fills and asks the question

**Test Explore:**
1. Click "📚 Browse by Topic"
2. Find "Police & Arrest Rights" section
3. Click category header to expand
4. Click any question
5. Auto-navigates to chat and asks it

**Test Save Feature:**
1. Get an answer from LexUg
2. Click "🔖 Save" button below answer
3. Go to "Saved" page (bottom nav)
4. See your saved answer there

**Test Share:**
1. Click "📱 Share" button below any answer
2. Opens WhatsApp (if installed)
3. Can send excerpt to contacts

**Test Mobile:**
1. Press F12 (DevTools)
2. Click device toggle icon (top-left of DevTools)
3. Select "iPhone 12" or "iPad"
4. Resize browser window to test responsiveness

---

## File Structure Explained

```
LEXUG/
│
├── index.html           ← All HTML structure
│                          • Landing page section
│                          • Chat page section
│                          • Explore page section
│                          • Saved answers page
│                          • Bottom navigation
│
├── app.js               ← All JavaScript logic
│                          • QUICK_CARDS & EXPLORE_CATEGORIES data
│                          • Page navigation functions
│                          • Chat/message handling
│                          • Claude API integration
│                          • Language toggle
│                          • Save/Share functionality
│                          • localStorage for persistent data
│
├── style.css            ← All styling + responsive
│                          • CSS Variables (colors, fonts, sizes)
│                          • Landing page styles
│                          • Chat interface styles
│                          • Explore page styles
│                          • Mobile responsive media queries
│                          • Animations & transitions
│
├── README.md            ← Project overview (you are here)
├── DEPLOYMENT.md        ← How to deploy online
├── SETUP.md             ← Local dev guide (this file)
└── .gitignore           ← Files not to commit to GitHub
```

---

## Making Changes

### Add a New Quick Card Question
1. Open `app.js`
2. Find the `QUICK_CARDS` array (around line 10)
3. Add a new object:
```javascript
{ icon: '⚖️', text: 'New question here?' }
```
4. Save file
5. Refresh browser to see changes

### Add a New Category to Explore
1. Open `app.js`
2. Find `EXPLORE_CATEGORIES` array
3. Add a new category object with questions array
4. Refresh to see it appear

### Change Colors
1. Open `style.css`
2. Find `:root { /* CSS Variables */ }`
3. Change values:
```css
--yellow: #FCDC4D;  /* Change this */
--red: #D21034;     /* Or this */
```
4. Refresh page

### Improve System Prompt (for better AI answers)
1. Open `app.js`
2. Find `function getSystemPrompt()`
3. Edit the English or Luganda prompt text
4. Restart app to test

---

## Debugging

### View Console Errors
1. Press F12 (or Cmd+Option+I on Mac)
2. Click "Console" tab
3. See errors/logs highlighted in red

### Common Issues

**Problem:** "API key invalid"  
**Solution:** Paste full key starting with `sk-ant-`

**Problem:** "Page won't load"  
**Solution:** Check server is running (`python -m http.server 8000`)

**Problem:** "Luganda text looks weird"  
**Solution:** Check browser language encoding (usually UTF-8 by default)

**Problem:** "WhatsApp share doesn't work"  
**Solution:** WhatsApp must be installed or accessible in browser

---

## Testing Checklist

Before deploying, test everything:

- [ ] **Landing Page**
  - [ ] Page loads
  - [ ] Logo visible
  - [ ] Disclaimer banner shows
  - [ ] "Start Asking" button works
  - [ ] Quick cards clickable
  - [ ] "Browse Topics" works

- [ ] **Chat Page**
  - [ ] Input field works
  - [ ] Send button sends message
  - [ ] Bot responds (in demo or with API key)
  - [ ] Message appears in chat
  - [ ] Auto-scrolls to bottom
  - [ ] Typing indicator shows

- [ ] **Language Toggle**
  - [ ] Clicking button switches EN ↔ LG
  - [ ] Label updates
  - [ ] Next response in new language
  - [ ] Persists during session

- [ ] **Explore Page**
  - [ ] All 6 categories visible
  - [ ] Can expand/collapse each
  - [ ] Questions clickable
  - [ ] Clicking question goes to chat

- [ ] **Save/Share/Copy**
  - [ ] Save button works (→ saved-item appears)
  - [ ] Share button opens WhatsApp
  - [ ] Copy button copies text to clipboard
  - [ ] Saved page shows all saved items

- [ ] **Mobile View**
  - [ ] Bottom nav shows on mobile
  - [ ] Text readable
  - [ ] Buttons tappable (no zoom needed)
  - [ ] Chat input visible with keyboard open
  - [ ] Quick cards stack properly

- [ ] **Performance**
  - [ ] Page loads in <3 seconds
  - [ ] Chat responds in <5 seconds
  - [ ] Smooth scrolling
  - [ ] No jank/lag on interactions

---

## API Cost Management

### Monitor Usage
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click "Usage" → See tokens used
3. Estimate: ~100–200 tokens per chat = ~$0.05–0.10 per answer

### Set Spending Limit
1. Go to Billing settings
2. Set monthly budget notification
3. Disable API key if overspending

### Optimize Costs
- Keep `max_tokens: 1500` (balance quality/cost)
- Use demo mode for testing (no API calls)
- Cache common Q&As

---

## Next Steps

1. **Test locally** ← You are here
2. **Deploy** → Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Share link** → Get feedback from Ugandans
4. **Iterate** → Improve based on feedback

---

## Still Stuck?

1. **Check console** (F12 → Console tab)
2. **Compare with GitHub** — Maybe something didn't save properly
3. **Ask for help** — GitHub Issues or Discussions
4. **Email support** (if available)

---

**Happy developing! 🚀**

