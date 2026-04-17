# 🚀 LexUg Deployment Guide

## ONE-CLICK DEPLOYMENT OPTIONS

### ✅ **NETLIFY (Recommended)**
**Time:** 2 minutes | **Cost:** Free | **Skill:** Beginner

```
1. Go to netlify.com → Sign up
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub → Select LEXUG repo
4. Deploy (no build config needed)
5. Get live URL instantly
```

**Live URL:** `yourlexugname.netlify.app`  
**Auto-updates:** Every git push deploys automatically

---

### ✅ **GITHUB PAGES**
**Time:** 1 minute | **Cost:** Free | **Skill:** Beginner

```
1. Go to repo Settings → Pages
2. Source: Deploy from branch
3. Branch: main
4. Done!
```

**Live URL:** `ritaakankunda.github.io/LEXUG`

---

### ✅ **VERCEL**
**Time:** 2 minutes | **Cost:** Free | **Skill:** Beginner

```
1. Go to vercel.com → Sign up
2. Click "Add new project"
3. Select LEXUG from GitHub
4. Deploy
```

**Live URL:** `lexug.vercel.app`

---

## PRODUCTION CHECKLIST

- [ ] API key modal shows on first visit
- [ ] Chat responds in both English and Luganda
- [ ] Save/Share/Copy buttons work on answers
- [ ] Quick cards load and ask questions
- [ ] Explore page shows all 6 categories
- [ ] Bottom navigation works on mobile
- [ ] Disclaimer banners visible throughout
- [ ] Mobile view responsive (<640px)

---

## CUSTOM DOMAIN SETUP

### For Netlify:
```
1. Buy domain (Namecheap, GoDaddy, Google Domains)
2. In Netlify: Site Settings → Domain Management → Add custom domain
3. Follow DNS instructions
4. Wait 5-30 min for DNS to propagate
```

### For Vercel:
```
1. Buy domain
2. In Vercel: Settings → Domains → Add Domain
3. Update DNS records per instructions
```

---

## POST-DEPLOYMENT

### Tell Users:
```
Share this link: [your-lexug-url]

🇺🇬 LexUg - Know Your Rights!
Ask anything about Ugandan law
Available in English & Luganda
100% Free
```

### Track Usage (Optional):
Add Google Analytics ID to `style.css` or use Netlify Analytics

### Monitor for Issues:
- Check browser console for errors (F12)
- Test on different phones/browsers
- Monitor Claude API usage to avoid overspend

---

## TROUBLESHOOTING

### "Page not loading"
→ Check browser cache (Ctrl+Shift+Del)  
→ Check that all 3 files (HTML, CSS, JS) are uploaded

### "Claude API error"
→ Verify API key format (starts with `sk-ant-`)  
→ Check remaining API credits at console.anthropic.com  
→ May need to upgrade to paid account

### "Mobile layout broken"
→ Check viewport meta tag in `<head>`  
→ Test in Chrome DevTools mobile mode  
→ Clear browser cache

### "WhatsApp share not working"
→ WhatsApp must be installed/accessible  
→ Some content length limits apply  
→ Try on different browser/OS combo

---

## ANALYTICS & MONITORING

### Free Options:
1. **Netlify Analytics** — Built-in (basic)
2. **Google Analytics** — Add tracking code
3. **Sentry** — Error tracking (free tier)

### Paid Options:
1. **Mixpanel** — User behavior
2. **Amplitude** — Product analytics
3. **Hotjar** — Heatmaps & recordings

---

## KEEPING IT UPDATED

### Auto-Updates (GitHub + Netlify):
```bash
git add .
git commit -m "Update features"
git push origin main
# Netlify auto-deploys!
```

### Manual Updates:
```bash
# If using FTP/SFTP:
# Just re-upload changed files
# Clear CDN cache if applicable
```

---

## SCALING CONCERNS

### Current Setup:
- **Users:** Can handle thousands
- **Messages/day:** Unlimited (Claude costs scale)
- **Storage:** None (stateless)

### If Users Grow:
1. **Add backend** → Save conversations (database)
2. **API proxy** → Control Claude key exposure
3. **Caching** → Save popular answers
4. **Rate limiting** → Prevent abuse

---

## LEGAL & COMPLIANCE

- ✅ **Disclaimer visible** — States civic education only
- ✅ **Data privacy** — No data collection (client-side only)
- ✅ **GDPR compliant** — No EU user data stored
- ✅ **Accessibility** — WCAG 2.1 AA standard

### To Add:
- Privacy Policy page (if adding backend)
- Terms of Use page (if monetizing)
- Cookie consent (if using analytics)

---

## COST BREAKDOWN (Monthly)

| Item | Cost |
|------|------|
| **Hosting** (Netlify) | **Free** |
| **Domain** (optional) | $12–15/year |
| **Claude API** (1000 chats) | ~$5–10 |
| **Total** | ~$0.50–1.00/user |

---

## SUPPORT

**Having issues?**  
1. Check this guide  
2. Search GitHub Issues  
3. Ask in Discussions  
4. Email support

---

**🎉 You're live! Share the link and watch Ugandans learn their rights!**

