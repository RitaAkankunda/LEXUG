# LexUg — Uganda's Civic AI Companion 🇺🇬

> **Know Your Rights. Speak Your Language.**

LexUg is a free, web-based civic AI companion that helps every Ugandan understand their rights, laws, and how government works — in plain English or Luganda.

---

## ✨ Features

### 🎯 Core Functionality
- ✅ **Landing Page** — Clean welcome screen with tagline, "Start Asking" CTA, and topic preview
- ✅ **Smart Chat Interface** — Ask questions about Ugandan law, get instant AI-powered answers
- ✅ **Conversation Memory** — Follow-up questions work naturally; AI remembers context
- ✅ **Legal Citations** — Every answer cites specific articles (Constitution, Acts, etc.)
- ✅ **Persistent Disclaimers** — Clear messaging that LexUg is civic education, not legal advice

### 🗣️ Multilingual Support
- ✅ **English & Luganda Toggle** — Switch responses between EN and LG
- ✅ **Luganda System Prompt** — Optimized Claude instructions for accurate Luganda answers
- ✅ **Language Persistence** — Choice is remembered during session

### 🗂️ Topic Organization
- ✅ **Quick Topic Cards** — Pre-populated questions on:
  - 👮 Police & Arrest Rights
  - 🏠 Land & Housing Rights
  - 👷 Employment Rights
  - 🗳️ Electoral & Voting Rights
  - 🎓 Education Rights
  - 🏛️ How Government Works
  - + 2 more

- ✅ **Explore Page** — Browse all topics by category
  - Expandable sections with legal questions
  - Color-coded categories
  - Direct "Ask" buttons for each topic

### 💾 User Engagement
- ✅ **Save Answers** — Bookmark important responses for later
- ✅ **Share on WhatsApp** — Send answers directly to friends/family
- ✅ **Copy to Clipboard** — Easy answer sharing
- ✅ **Saved Answers Page** — Dedicated section to view all bookmarks

### 📱 Mobile Experience
- ✅ **Mobile-First Design** — Optimized for phone browsers (primary user access method)
- ✅ **Bottom Navigation** — Easy switching between Home, Chat, Explore, Saved
- ✅ **Responsive Layout** — Works perfectly on screens from 320px to 4K
- ✅ **Touch-Friendly UI** — Large buttons, smooth interactions

### 🎨 Design & Branding
- ✅ **Ugandan Flag Colors** — Black (#0d0d0d), Yellow (#FCDC4D), Red (#D21034)
- ✅ **Modern Design System** — Glassmorphism, smooth animations, accessible contrast
- ✅ **Professional Typography** — Inter (body), Space Grotesk (display)
- ✅ **Dark Mode** — Battery-efficient dark theme for African mobile users

### 🤖 AI Integration
- ✅ **Claude 3.5 Sonnet API** — Latest Anthropic model
- ✅ **System Prompts** — Context-aware Ugandan law expertise
- ✅ **Demo Mode** — Pre-loaded sample responses for testing
- ✅ **API Key Management** — Secure local storage (never sent anywhere)

---

## 🚀 Quick Start

### 1. **Set Up Locally**
```bash
git clone https://github.com/RitaAkankunda/LEXUG.git
cd LEXUG

# Serve locally (you need a local HTTP server)
# Option A: Python 3
python -m http.server 8000

# Option B: Node.js with http-server
npx http-server

# Then open: http://localhost:8000
```

### 2. **Get a Claude API Key**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up for free (get $5 free credits)
3. Create an API key
4. Paste into LexUg when prompted

### 3. **Test Features**
- Click "Start Asking" → Ask a question about Ugandan law
- Try "Browse by Topic" → Explore categories
- Click language toggle (top right) → Switch to Luganda
- Save an answer → Check "Saved" page
- Share to WhatsApp → Send to a friend

---

## 📋 File Structure

```
LEXUG/
├── index.html          # Full page structure + all sections
├── app.js              # JavaScript logic, Claude API, state management
├── style.css           # Design system, responsive layout, animations
├── README.md           # This file
└── .github/
    └── workflows/
        └── deploy.yml  # (Optional) CI/CD for auto-deploy
```

---

## ⚙️ Configuration

### API Key Management
Keys are **stored locally in browser localStorage** under `lexug_api_key`. They never leave your device.

```javascript
// In app.js:
apiKey = localStorage.getItem('lexug_api_key') || '';
```

### Demo Mode
If no API key is provided, LexUg runs in **Demo Mode** with pre-loaded responses:

```javascript
isDemoMode = true; // Simulated responses for testing
```

### System Prompt
Customized for Ugandan legal context with proper citations:

**English:**
```
You are LexUg — Uganda's trusted civic AI companion. 
Answer in plain English, cite laws (e.g., "Article 23 of the Constitution").
Always end with: "⚠️ Civic education only — not legal advice..."
```

**Luganda:**
```
Oli LexUg — omukozi w'amateeka g'obuwangwa bwa Uganda.
Ddamu mu Luganda... [structured for law answers]
```

---

## 🌐 Deployment Options

### **Option 1: Netlify (Recommended - Free)**
Easiest option for static sites + serverless functions.

1. **Push to GitHub** (if not already)
   ```bash
   git remote add origin https://github.com/RitaAkankunda/LEXUG.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → Connect to Git
   - Select your `LEXUG` repo
   - Build settings: Leave blank (no build needed for static site)
   - Deploy!

3. **Your URL:** `lexug.netlify.app` (or custom domain)

**Why Netlify?**
- Free forever for static sites
- Auto-deploys on git push
- 100GB/month bandwidth
- SSL/HTTPS included
- Africa-friendly CDN

---

### **Option 2: GitHub Pages (Very Free)**
Simplest deployment — hosted directly from GitHub.

1. Go to your repo Settings → Pages
2. Source: Deploy from branch
3. Branch: `main` / root
4. **Your URL:** `ritaakankunda.github.io/LEXUG`

**Pros:** No build, no server, instant updates
**Cons:** Slower than CDN for some regions

---

### **Option 3: Vercel (Free)**
Great if you want to add backend features later.

1. Go to [vercel.com](https://vercel.com)
2. Click "Add new project" → Import `LEXUG` from GitHub
3. Deploy

**Your URL:** `lexug.vercel.app`

---

### **Option 4: Traditional Hosting (Paid)**
Shared hosting, VPS, or cloud:

**Upload via FTP/SFTP:**
```bash
# After uploading index.html, app.js, style.css...
# Visit: yoursite.com
```

**Providers:** Hostinger, Bluehost, AWS, Google Cloud, Azure

---

## 🔒 Security Notes

1. **API Keys are Client-Side** — Users store their own Claude keys in browser
2. **No Backend** — LexUg is entirely frontend; no database to breach
3. **HTTPS Required** — Always deploy with SSL (all options above handle this)
4. **localStorage is Safe** — Stored locally on user's device; not sent to servers

**To add a backend (optional):**
```javascript
// Currently: Direct Anthropic API calls from browser
// If adding backend: Route through your server to proxy API
fetch('https://yourdomain.com/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message, apiKey }), // Backend handles auth
});
```

---

## 📊 Performance & Analytics (Optional)

Add Google Analytics to track usage:

```html
<!-- Add to <head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Track events:
```javascript
// Track when user asks a question
gtag('event', 'ask_question', { category: 'engagement' });
```

---

## 🎓 API Costs

**Claude 3.5 Sonnet Pricing (as of 2024):**
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens

**Estimate:** ~$0.05–0.10 per chat answer

**Free Credits:** New accounts get ~$5 free trial

---

## 🛠️ Development

### Local Testing
```bash
# Python 3
python -m http.server 8000

# Then: http://localhost:8000
#       Toggle demo mode → test without API key
```

### Customization

**Add more education topics:**
Edit `QUICK_CARDS` and `EXPLORE_CATEGORIES` in `app.js`

**Change colors:**
Edit CSS variables in `style.css`:
```css
--yellow: #FCDC4D;
--red: #D21034;
--black: #0d0d0d;
```

**Improve AI responses:**
Refine system prompts in `getSystemPrompt()` function

---

## 📈 Future Enhancements

- [ ] **Backend API** — Proxy Claude calls for better control
- [ ] **Database** — Save user interactions (with consent)
- [ ] **Push Notifications** — Alert users to new laws/updates
- [ ] **Offline Mode** — Cache common Q&As for offline access
- [ ] **Mobile App** — React Native version for app stores
- [ ] **More Languages** — Acholi, Teso, Swahili, etc.
- [ ] **Video Explanations** — Short clips explaining rights
- [ ] **Community Answers** — User-submitted Q&As (moderated)

---

## 🤝 Contributing

We welcome contributions! To help:

1. **Report Issues** — Found a bug? Create an issue
2. **Suggest Features** — Have ideas? Open a discussion
3. **Improve Translations** — Help translate to more Ugandan languages
4. **Test on Mobile** — Feedback from real users is gold
5. **Share Feedback** — Email: [your email]

---

## 📜 License

MIT License — Free to use, modify, and share.

---

## ⚖️ Legal Disclaimer

**LexUg provides civic education only** — it is not legal advice. For your specific legal situation, please consult a **qualified Ugandan lawyer**.

LexUg is powered by Claude AI and is not affiliated with the Government of Uganda or official legal bodies.

---

## 🙏 Credits

Built with ❤️ for Ugandans by [Rita Akankunda](https://github.com/RitaAkankunda)

Powered by:
- [Claude 3.5 Sonnet](https://anthropic.com) — AI responses
- [Netlify](https://netlify.com) — Hosting
- [Inter & Space Grotesk](https://fonts.google.com) — Fonts

---

## 📞 Support

- **Questions?** Check GitHub Issues
- **Bug Report?** Open an issue with details
- **General Feedback?** We'd love to hear it!

---

**Last Updated:** April 2026  
**Status:** ✅ Production Ready

