# 🇺🇬 LexUg — 6 Minute Hackathon Pitch
**Claude Builder Club Hackathon | Makerere University | May 14, 2026**

---

## ⏱️ TIMING BREAKDOWN
- **0:00-3:00** — Presentation (140 words/min = ~420 words)
- **3:00-5:00** — Live Demo (2 minutes)
- **5:00-6:00** — Q&A (1 minute)

---

## 📝 PRESENTATION SCRIPT (3 MINUTES)

### Opening (15 seconds)
"Hi, I'm [Name]. I built **LexUg** — an AI-powered civic education assistant for Uganda, built entirely on Claude AI.

**The problem:** 46 million Ugandans. Most don't know their constitutional rights. Legal information is scattered, expensive, and in English — but 40% speak Luganda at home. People need to know: Can a landlord evict me without court? What are my arrest rights? Is this employment legal?

**The solution:** LexUg. Ask Claude about Ugandan law in English or Luganda. Get instant, accurate, cited answers. Free. Offline-capable. Mobile-first."

### The Build (1 minute 15 seconds)
"**Why Claude?** Three reasons:

1. **Nuance** — Uganda's legal system is complex. Claude understands constitutional context, not just keyword matching.

2. **Language** — I built custom system prompts in both English AND Luganda. Not translations — native prompts that respect Ugandan legal terminology.

3. **Cost-effective** — Using Claude 3.5 Sonnet keeps API costs low (~$0.02/query), making this sustainable for African markets.

**The tech stack:**
- Frontend: Vanilla JS + PWA (works offline via service workers)
- Backend: Node.js + Express + Claude API
- Design: Ugandan flag colors, glassmorphic UI, mobile-first
- Deployed: Ready for Netlify/Vercel

Quick features: Save answers, share to WhatsApp, 50+ pre-loaded legal Q&As, language toggle, demo mode."

### Impact (45 seconds)
"**Why this matters for Africa:**

We built for our context. Ugandans asking Ugandan questions. Claude understanding African legal systems. This is the 'BUILD FOR AFRICA' moment — not porting Western tools, but creating solutions for our reality.

**What's next:** Deploy to 100K users in Q3 2026. Partner with legal clinics. Expand to Kenya, Nigeria. Integrate SMS for feature phones.

This is open-source. Other developers can fork this pattern for their countries."

### Close (15 seconds)
"LexUg shows how Claude AI + local context = real impact. Join the movement. Let's build for Africa. Thanks."

---

## 🎬 DEMO WALKTHROUGH (2 MINUTES)

### Screen 1: Landing Page (30 seconds)
```
Show: Hero section with law-hero.jpg background
Point out:
- Ugandan flag colors (Black, Yellow, Red)
- "Know Your Rights. Speak Your Language."
- Quick cards showing popular questions
- Features strip (Claude AI Powered, Mobile First, Luganda & English)
```
**Say:** "Clean, modern, mobile-first design. Users can see immediate value — popular legal questions right there."

### Screen 2: Chat with English Question (45 seconds)
```
Click "Start Asking" → Chat page
Type: "What are my rights if arrested in Uganda?"
Show the AI response with citations
Point to:
- Full answer with constitutional references
- Save button
- Share to WhatsApp
- Copy buttons
```
**Say:** "Watch Claude understand Ugandan constitutional law. It cites Article 23, mentions the 48-hour rule, gives practical next steps. Not generic — specific to Uganda. And users can save, share, or copy the answer."

### Screen 3: Language Toggle (45 seconds)
```
Click "🇺🇬 EN" button
Ask in Luganda: "Nsonga za 'landlord' ku nkizo?"
Show response in Luganda
```
**Say:** "Here's the Luganda toggle. Same question about landlord rights — but in natural Luganda. Notice Claude responds in proper Luganda legal terminology, not a translation. That's the custom system prompt at work."

---

## 🎯 Q&A TALKING POINTS (1 MINUTE)

**Q: How do you ensure accuracy of legal info?**  
A: "Claude 3.5 Sonnet has been trained on global legal databases. For Uganda specifically, I used the Constitution of Uganda 1995 as core context. Every response includes disclaimers — LexUg is civic education, not legal advice. For critical cases, we recommend consulting a lawyer."

**Q: How do you make money?**  
A: "Multiple models: (1) Free tier with ads, (2) Premium subscription for organizations/NGOs, (3) White-label licensing to Ugandan legal clinics, (4) API access for other African projects."

**Q: Why Node.js + PWA?**  
A: "Uganda has 45% smartphone penetration. PWAs work on cheap phones, low bandwidth, and offline. Service workers cache responses. Once you load a question, you can read it without data."

**Q: Can this work in other African countries?**  
A: "100%. The architecture is plug-and-play. Change the system prompt, swap the constitution, retrain the demo responses — same codebase works for Kenya, Ghana, Nigeria, etc. That's why it's open-source."

---

## 💡 LIVE DEMO BACKUP PLAN
If the server isn't running:
- Use browser DevTools to show the frontend code
- Show the deployed version (if available)
- Walk through the GitHub repo
- Explain the API architecture with a diagram

---

## 🚀 KEY STATS TO MENTION
- ✅ 27 submissions received (yours is one of them)
- ✅ Built with Claude 3.5 Sonnet
- ✅ Supports 2 languages (English + Luganda)
- ✅ 50+ pre-loaded legal Q&As
- ✅ Mobile-first for African markets
- ✅ Free, open-source, sustainable

---

## 🎪 PRESENTATION TIPS
1. **Speak slowly** — you have 6 minutes, not 3. Pause after key points.
2. **Make eye contact** — developer audience appreciates authenticity.
3. **Show enthusiasm** — this solves a real problem for real people.
4. **Be humble** — acknowledge this is v1. There's much more to build.
5. **End strong** — leave them wanting to fork your repo or build for their country.

---

## 📱 DEMO FALLBACK (If live demo fails)
Have a **screenshot slideshow ready**:
1. Landing page with hero image
2. Chat response in English
3. Same question in Luganda
4. Explore page showing legal categories
5. Save/Share feature demo

Good luck tomorrow! 🇺🇬🚀
