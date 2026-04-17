
const QUICK_CARDS = [
  { icon: '🚔', text: 'What are my rights if I am arrested by police?', },
  { icon: '🏠', text: 'Can my landlord evict me without notice?', },
  { icon: '🗳️', text: 'How do Uganda\'s elections work?', },
  { icon: '👷', text: 'What are my rights as a worker in Uganda?', },
  { icon: '📜', text: 'What does the Uganda Constitution say about free speech?', },
  { icon: '🎓', text: 'Do I have a right to free education in Uganda?', },
  { icon: '⚖️', text: 'What is the right to a fair trial in Uganda?', },
  { icon: '🌿', text: 'What are Uganda\'s environmental rights?', },
];

const EXPLORE_CATEGORIES = [
  {
    id: 'police',
    icon: '👮',
    color: 'rgba(210,16,52,0.15)',
    borderColor: 'rgba(210,16,52,0.3)',
    title: 'Police & Arrest Rights',
    description: 'Know your rights when dealing with police',
    questions: [
      'What are my rights if I am arrested in Uganda?',
      'Can police search my house without a warrant?',
      'How long can police hold me without charging me?',
      'What should I do if police use excessive force on me?',
      'Can I film police in Uganda?',
      'What is police bond and how does it work in Uganda?',
      'Can police arrest me without a warrant in Uganda?',
      'What is the difference between arrest and detention in Uganda?',
    ],
  },
  {
    id: 'land',
    icon: '🏠',
    color: 'rgba(252,220,77,0.1)',
    borderColor: 'rgba(252,220,77,0.25)',
    title: 'Land & Housing Rights',
    description: 'Understand land ownership and tenancy laws',
    questions: [
      'What land tenure systems exist in Uganda?',
      'Can my landlord evict me without notice in Uganda?',
      'What is mailo land in Uganda?',
      'What are the rights of a kibanja holder in Uganda?',
      'How do I register land in Uganda?',
      'Can the government take my land in Uganda?',
      'What is compulsory acquisition in Uganda?',
      'What are my rights as a tenant in Uganda?',
    ],
  },
  {
    id: 'employment',
    icon: '👷',
    color: 'rgba(80,160,80,0.12)',
    borderColor: 'rgba(80,200,80,0.25)',
    title: 'Employment Rights',
    description: 'Your rights in the workplace',
    questions: [
      'What is the minimum wage in Uganda?',
      'Can my employer fire me without notice in Uganda?',
      'What are maternity leave rights for women in Uganda?',
      'What is paternity leave in Uganda?',
      'Can I form or join a trade union in Uganda?',
      'What are overtime pay rules in Uganda?',
      'What protections do workers have against unfair dismissal?',
      'What is the Employment Act in Uganda?',
    ],
  },
  {
    id: 'elections',
    icon: '🗳️',
    color: 'rgba(80,100,200,0.12)',
    borderColor: 'rgba(100,130,255,0.25)',
    title: 'Electoral & Voting Rights',
    description: 'Elections, voting, and political rights',
    questions: [
      'Who can vote in Uganda?',
      'How are Ugandan presidents elected?',
      'What is the electoral commission of Uganda?',
      'How does Uganda\'s parliament work?',
      'What are the qualifications to run for president in Uganda?',
      'How do local council elections work in Uganda?',
      'What is the role of the Electoral Commission?',
      'Can political parties be banned in Uganda?',
    ],
  },
  {
    id: 'education',
    icon: '🎓',
    color: 'rgba(200,100,255,0.1)',
    borderColor: 'rgba(200,130,255,0.25)',
    title: 'Education Rights',
    description: 'Access to education and learning rights',
    questions: [
      'Is education free in Uganda for all children?',
      'What is Universal Primary Education (UPE) in Uganda?',
      'What is Universal Secondary Education (USE) in Uganda?',
      'What rights do children with disabilities have in education?',
      'Can a school expel a student without due process?',
      'What does the Uganda Constitution say about education?',
      'What are the rights of students in Uganda?',
      'Is corporal punishment legal in Uganda schools?',
    ],
  },
  {
    id: 'government',
    icon: '🏛️',
    color: 'rgba(252,150,50,0.1)',
    borderColor: 'rgba(252,180,50,0.25)',
    title: 'How Government Works',
    description: 'Uganda\'s constitution and government structure',
    questions: [
      'What are the three arms of government in Uganda?',
      'What powers does the President of Uganda have?',
      'What is the role of Parliament in Uganda?',
      'What does the Supreme Court of Uganda do?',
      'What is the role of the Attorney General in Uganda?',
      'How is the Uganda budget approved?',
      'What is decentralization in Uganda?',
      'What is the role of the Inspector General of Government (IGG)?',
    ],
  },
];

// ----------------------------------------------------------------
// STATE
// ----------------------------------------------------------------
let currentLanguage = 'en'; // 'en' | 'lg' (Luganda)
let conversationHistory = [];
let savedAnswers = [];
let isTyping = false;
let isDemoMode = false;
let apiKey = '';

// ----------------------------------------------------------------
// INIT
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Register service worker for PWA functionality
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }

  initApiKey();
  renderLandingCards();
  renderExploreCategoryPreviews();
  renderChatQuickCards();
  renderExploreCategories();
  renderSavedAnswers();
  loadSavedAnswers();
  updateOnlineStatus(); // Initialize online status
});

function initApiKey() {
  apiKey = localStorage.getItem('lexug_api_key') || '';
  isDemoMode = !apiKey; // Enable demo mode if no API key
  updateDemoIndicator();

  // Hide API key modal since we're using demo mode automatically
  const modal = document.getElementById('api-key-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function updateDemoIndicator() {
  const indicator = document.getElementById('demo-indicator');
  if (indicator) {
    indicator.style.display = isDemoMode ? 'block' : 'none';
  }
}

// PWA: Online/Offline detection
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  const statusIndicator = document.getElementById('online-status');

  if (statusIndicator) {
    statusIndicator.textContent = isOnline ? '🟢 Online' : '🔴 Offline';
    statusIndicator.className = isOnline ? 'online' : 'offline';
  }

  // Update send button state
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn && !isOnline && !isDemoMode) {
    sendBtn.disabled = true;
    sendBtn.textContent = 'Offline';
  } else if (sendBtn) {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  }
}

// PWA: Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;

  // Show install button
  showInstallPrompt();
});

function showInstallPrompt() {
  if (!deferredPrompt) return;

  // Create install prompt
  const installToast = document.createElement('div');
  installToast.className = 'install-prompt';
  installToast.innerHTML = `
    <div class="install-content">
      <span>📱 Install LexUg for offline access!</span>
      <button onclick="installPWA()" class="install-btn">Install</button>
      <button onclick="dismissInstall()" class="dismiss-btn">×</button>
    </div>
  `;

  document.body.appendChild(installToast);

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (installToast.parentNode) {
      installToast.remove();
    }
  }, 10000);
}

function installPWA() {
  if (!deferredPrompt) return;

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      showToast('✅ LexUg installed successfully!');
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredPrompt = null;

    // Hide install prompt
    const prompt = document.querySelector('.install-prompt');
    if (prompt) prompt.remove();
  });
}

function dismissInstall() {
  const prompt = document.querySelector('.install-prompt');
  if (prompt) prompt.remove();
  deferredPrompt = null;
}

function showApiKeyModal() {
  document.getElementById('api-key-modal').classList.remove('hidden');
  document.getElementById('api-key-input').focus();
  document.getElementById('api-key-input').value = '';
}

function saveApiKey() {
  const input = document.getElementById('api-key-input').value.trim();
  if (!input || !input.startsWith('sk-ant-')) {
    showToast('⚠️ Please enter a valid Claude API key (starts with sk-ant-)');
    return;
  }
  apiKey = input;
  localStorage.setItem('lexug_api_key', apiKey);
  isDemoMode = false;
  document.getElementById('api-key-modal').classList.add('hidden');
  showToast('✅ API key saved! LexUg is ready.');
  // Navigate to chat after saving key
  setTimeout(() => showPage('chat-page'), 200);
}

function skipApiKey() {
  isDemoMode = true;
  apiKey = '';
  document.getElementById('api-key-modal').classList.add('hidden');
  showToast('🔓 Running in Demo Mode — responses are simulated');
  // Go to chat page after skipping
  setTimeout(() => showPage('chat-page'), 200);
}

function proceedToChat() {
  // Called after API key is saved, navigate to chat
  showPage('chat-page');
}

// ----------------------------------------------------------------
// PAGE NAVIGATION
// ----------------------------------------------------------------
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  // Update bottom nav
  const navMap = {
    'landing-page': 'nav-home',
    'chat-page': 'nav-chat',
    'explore-page': 'nav-explore',
    'saved-page': 'nav-saved',
  };
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.getElementById(navMap[pageId]);
  if (navEl) navEl.classList.add('active');

  // Scroll to top
  const page = document.getElementById(pageId);
  if (page) page.scrollTop = 0;
}

// ----------------------------------------------------------------
// LANDING CARDS RENDER
// ----------------------------------------------------------------
function renderLandingCards() {
  const grid = document.getElementById('landing-quick-cards');
  if (!grid) return;
  const subset = QUICK_CARDS.slice(0, 4);
  grid.innerHTML = subset.map(card => `
    <button class="quick-card" onclick="askFromCard(${JSON.stringify(card.text).replace(/"/g, '&quot;')})">
      <span class="qc-icon">${card.icon}</span>
      <span class="qc-text">${card.text}</span>
    </button>
  `).join('');
}

function renderExploreCategoryPreviews() {
  const grid = document.getElementById('explore-preview');
  if (!grid) return;
  grid.innerHTML = EXPLORE_CATEGORIES.map(cat => `
    <div class="explore-cat-card" onclick="showPage('explore-page'); openCategory('${cat.id}')">
      <span class="cat-emoji">${cat.icon}</span>
      <span class="cat-name">${cat.title}</span>
    </div>
  `).join('');
}

function renderChatQuickCards() {
  const grid = document.getElementById('chat-quick-cards');
  if (!grid) return;
  grid.innerHTML = QUICK_CARDS.map(card => `
    <button class="quick-card" onclick="askFromCard(${JSON.stringify(card.text).replace(/"/g, '&quot;')})">
      <span class="qc-icon">${card.icon}</span>
      <span class="qc-text">${card.text}</span>
    </button>
  `).join('');
}

// ----------------------------------------------------------------
// EXPLORE PAGE RENDER
// ----------------------------------------------------------------
function renderExploreCategories() {
  const container = document.getElementById('explore-categories');
  if (!container) return;
  container.innerHTML = EXPLORE_CATEGORIES.map(cat => `
    <div class="explore-cat-section" id="cat-section-${cat.id}">
      <div class="explore-cat-header" onclick="toggleCategory('${cat.id}')">
        <div class="cat-icon-circle" style="background:${cat.color}; border:1px solid ${cat.borderColor};">
          ${cat.icon}
        </div>
        <div class="cat-header-text">
          <div class="cat-title">${cat.title}</div>
          <div class="cat-count">${cat.questions.length} topics</div>
        </div>
        <svg class="cat-chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div class="explore-cat-questions">
        ${cat.questions.map(q => `
          <div class="explore-question" onclick="askFromCard(${JSON.stringify(q).replace(/"/g, '&quot;')})">
            <span>${q}</span>
            <span class="eq-arrow">→</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function toggleCategory(catId) {
  const section = document.getElementById(`cat-section-${catId}`);
  if (!section) return;
  section.classList.toggle('open');
}

function openCategory(catId) {
  // Close all, then open the target
  document.querySelectorAll('.explore-cat-section').forEach(s => s.classList.remove('open'));
  const section = document.getElementById(`cat-section-${catId}`);
  if (section) {
    section.classList.add('open');
    setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

// ----------------------------------------------------------------
// CHAT LOGIC
// ----------------------------------------------------------------
function askFromCard(question) {
  showPage('chat-page');
  setTimeout(() => {
    document.getElementById('user-input').value = question;
    sendMessage();
  }, 150);
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text || isTyping) return;

  // Hide welcome state
  const welcome = document.getElementById('chat-welcome');
  if (welcome) welcome.classList.add('hidden');

  // Append user message
  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  // Clear input
  input.value = '';
  input.style.height = 'auto';

  // Disable send button
  setTyping(true);

  // Scroll to bottom
  scrollToBottom();

  // Show typing indicator
  const typingId = showTypingIndicator();

  try {
    let responseText;
    if (isDemoMode || !apiKey) {
      responseText = await getDemoResponse(text);
    } else {
      responseText = await callClaudeAPI(text);
    }

    removeTypingIndicator(typingId);
    appendMessage('bot', responseText);
    conversationHistory.push({ role: 'assistant', content: responseText });
  } catch (err) {
    removeTypingIndicator(typingId);
    const errMsg = `I'm sorry, I encountered an error: ${err.message}. Please check your API key or try again.`;
    appendMessage('bot', errMsg);
  }

  setTyping(false);
  scrollToBottom();
}

async function callClaudeAPI(userMessage) {
  const systemPrompt = getSystemPrompt();

  const response = await fetch('http://localhost:3002/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system: systemPrompt,
      messages: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function getSystemPrompt() {
  if (currentLanguage === 'lg') {
    return `Oli LexUg — omukozi w'amateeka g'obuwangwa bwa Uganda. DDAMU EBIBUZO BYONA MU LUGANDA YOKKA! Toggula mukka kugamba ebintu mu Luganda omulembe.

EMPISA Z'OKUDDAMU:
1. **DDAMU MU LUGANDA YOKKA** — Tekka kugamba kintu kyonna mu Lungereza
2. Tegeka ebibuuzo ebikwata ku Constitution ya 1995, Magambo g'amateeka ga Parliament, ne bitundu ebirala
3. Yisa ekigazi kya mateeka ku buri nkubisa (e.g., "Article 23 ya Constitution", "Employment Act, Section 58")
4. Kola mu ssannyalwadde ey'Ugandan — manyi amateeka n'emiwendo gya bantu
5. Ekigazi ky'okukoma: BULI ddamu maliredde wamu ne disclaimer:
---
⚠️ **Mulamusi:** LexUg yagala okufuna amateeka abafuna, si ky'okukola law. Wa mutegeza w'amateeka ow'Uganda ow'omuloole.

CONTEXT: Tusobola okufuna abantu okumanya amateeka gaabwe — abawanikazi, abakubiri, abantu abakola, n'abantu abanayingira mu politiki.`;
  }

  return `You are LexUg — Uganda's trusted civic AI companion. You help Ugandans understand their rights, laws, and how their government works.

RESPONSE RULES:
1. Answer in plain, simple English that any Ugandan can understand — avoid legal jargon
2. Always ground your answers in actual Ugandan law: the Constitution of Uganda 1995, Acts of Parliament, case law, etc.
3. Cite specific articles, sections, or laws (e.g., "Article 23 of the Uganda Constitution", "The Employment Act 2006, Section 58")
4. Be warm, respectful, and culturally aware of the Ugandan context
5. If a question is outside Ugandan law, politely redirect
6. Keep answers thorough but digestible — use short paragraphs or bullet points
7. ALWAYS end every response with this exact disclaimer on a new line:
---
⚠️ **Important:** LexUg provides civic education, not legal advice. For your specific situation, please consult a qualified Ugandan lawyer.

CONTEXT: You are helping everyday Ugandans — workers, students, tenants, voters — understand their rights in plain language.`;
}

// ----------------------------------------------------------------
// DEMO MODE — Simulated responses
// ----------------------------------------------------------------
const DEMO_RESPONSES = {  default: `Great question! Uganda has a rich legal framework rooted in the **Constitution of Uganda 1995**, which is the supreme law of the land.

Here's what you need to know:

**Your Constitutional Rights:**
• Every Ugandan citizen has fundamental rights and freedoms guaranteed under **Chapter 4 of the Constitution**
• These rights include the right to life, personal liberty, fair trial, privacy, and freedom of expression
• **Article 50** allows you to go to court if your rights are violated

**Key Laws to Know:**
• The **Magistrates Courts Act** — how local courts work
• The **Judicature Act** — structure of Uganda's courts
• Various sector-specific Acts passed by Parliament

For your specific question, I'd recommend visiting the **Uganda Legal Information Institute (ULII)** at ulii.org for free access to Uganda's laws.

---
⚠️ **Important:** LexUg provides civic education, not legal advice. For your specific situation, please consult a qualified Ugandan lawyer.`,

  arrest: `If you are arrested in Uganda, you have important rights protected by the **Constitution of Uganda 1995**.

**Your Rights Upon Arrest (Article 23):**
• You must be **informed immediately** of the reason for your arrest, in a language you understand
• You have the **right to remain silent** — you do not have to say anything that could incriminate you
• You have the right to a **lawyer of your choice** — if you can't afford one, the state must provide one for serious offences
• You must be **brought before a court within 48 hours** (police bond or court appearance)
• You cannot be held without charge —  if police keep you beyond 48 hours without charging you, this is illegal

**What To Do:**
1. Calmly ask why you are being arrested
2. Do not resist arrest, even if you believe it is unlawful
3. Contact a lawyer or relative as soon as possible
4. Remember you can challenge unlawful detention in court (**habeas corpus**)

**Key Law:** Article 23 of the Constitution of Uganda 1995 — "Protection of personal liberty"

---
⚠️ **Important:** LexUg provides civic education, not legal advice. For your specific situation, please consult a qualified Ugandan lawyer.`,

  landlord: `Uganda's laws give tenants real protections against unlawful eviction.

**Can a landlord evict you without notice?**
Generally, **No**. Under the **Landlord and Tenant Act 2022** and common law principles, a landlord must follow proper procedures:

**Legal Eviction Requirements:**
• **Written notice** must be given — the period depends on your tenancy agreement (usually 1–3 months)
• The landlord must have a **valid legal reason** (e.g., non-payment of rent, expiry of lease)
• If you refuse to leave, the landlord must get a **court order** — they cannot forcefully remove you
• It is **illegal** for a landlord to change locks, remove your belongings, or cut off utilities to force you out — this is called "self-help eviction" and is unlawful

**Kibanja Holders:** If you are a kibanja holder on mailo land, **Article 237** of the Constitution protects your right of occupancy, and the **Land Act Cap 227** gives you additional protections.

**If Your Landlord Evicts You Illegally:**
• You can file a complaint at the **Magistrate's Court**
• You may be entitled to damages

---
⚠️ **Important:** LexUg provides civic education, not legal advice. For your specific situation, please consult a qualified Ugandan lawyer.`,

  elections: `Uganda's electoral system is governed by the **Constitution of Uganda 1995** and the **Presidential Elections Act**.

**How Presidential Elections Work:**
• The President is elected by **direct vote** of all registered Ugandan citizens
• A candidate needs **more than 50% of valid votes** to win in the first round
• Elections are held every **5 years**
• Candidates must be Ugandan citizens, aged 35–75, and a registered voter (**Article 102**)

**Parliament:**
• Uganda has a **unicameral Parliament** (one chamber)
• Members of Parliament (MPs) are elected every 5 years
• Parliament includes directly elected MPs, Woman MPs (one per district), army representatives, and special interest group seats
• Parliament makes laws, approves the budget, and oversees government (**Article 79**)

**The Electoral Commission:**
• Independent body responsible for conducting elections (**Article 60**)
• Ensures free, fair, and credible elections
• Registers voters and political parties

---
⚠️ **Important:** LexUg provides civic education, not legal advice. For your specific situation, please consult a qualified Ugandan lawyer.`,

  worker: `Uganda has strong labor laws to protect workers' rights under the **Employment Act 2006** and **Labour Unions Act 2006**.

**Key Worker Rights:**
• **Minimum wage** — varies by sector, check with Department of Labour
• **Working hours** — maximum 48 hours per week, 8 hours per day
• **Overtime pay** — 1.5 times normal rate for hours over 48 per week
• **Annual leave** — 21 working days for first year, 28 days thereafter
• **Sick leave** — up to 6 months with full pay for work-related illness
• **Maternity leave** — 60 working days with full pay
• **Paternity leave** — 4 working days with full pay

**Unfair Dismissal Protections:**
• Employer must give **valid reason** for termination
• **Notice period** — 1-3 months depending on service length
• **Severance pay** — 1 month's salary per year of service (max 12 months)
• Can challenge unfair dismissal at **Industrial Court**

**Trade Union Rights:**
• Right to form and join trade unions (**Article 29** of Constitution)
• Collective bargaining for better working conditions
• Protection from discrimination for union activities

---
⚠️ **Important:** LexUg provides civic education, not legal advice. For your specific situation, please consult a qualified Ugandan lawyer.`,
};

// ----------------------------------------------------------------
// DEMO MODE — Simulated responses (Luganda)
// ----------------------------------------------------------------
const DEMO_RESPONSES_LG = {
  default: `Ekibuuzo ekirungi!`,

  arrest: `Bw'okwatibwa mu Uganda, olina eddembe.`,

  landlord: `Amateeka g'ensi ya Uganda gatwala abasikiriza eddembe ku okugobebwa okutali mateeka.

**Omusajja ayinza okugoba nga taategeeza?**
Okujjereza, **Nedda**. Ku **Landlord and Tenant Act 2022** n'amateeka ag'ekika, omusajja ateekwa okugoberera enteekateeka:

**Enteekateeka z'okugoba ezitali mateeka:**
• **Obubaka obuwandiiko** buteekwa okutegeeza — ebbanga ly'ebweru ly'esinziira ku kontrakiti y'obuyimba (okujjereza 1-3 myazzi)
• Omusajja ateekwa okuba n'**ensonga etaliisa** (okutasa ssente, okuggwawo kw'obuyimba)
• Bw'ogaanuka okuva, omusajja ateekwa okufuna **kibono ky'akkooti** — tayinza kukugoba mu bukambwe
• **Si mateeka** okukyusa mikalo, okuggya ebintu byo, oba okukata amazzi okukugoba — kino kiyitibwa "self-help eviction" era si mateeka

**Abafuzi b'ebibanja:** Bw'oli mufuzi w'ekibanja ku ttaka lya mailo, **Article 237** ya Constitution ekukuuma eddembe lyo ly'okubeera, n'**Land Act Cap 227** ekukuwa eddembe endala.

**Bw'omusajja akugoba nga si mateeka:**
• Oyinza okuŋŋaanya ekireese mu **Magistrate's Court**
• Oyinza okufuna empeesazze

---
⚠️ **Okujjukira:** LexUg yagala okufuna amateeka abafuna, si ky'okukola law. Wa mutegeza w'amateeka ow'Uganda ow'omuloole.`,

  elections: `Enteekateeka y'okulonda mu Uganda esinziira ku **Constitution ya Uganda 1995** n'**Presidential Elections Act**.

**Engeri Pulezidenti g'okulondwa:**
• Pulezidenti alondwa **okuvota kw'abantu bonna** abaali balambula mu Uganda
• Omulondi ateekwa okufuna **waggulu wa 50% y'amavoti amataliisa** okweyimirizaawo mu kiseera ekisooka
• Okulonda kuba **buli myaka 5**
• Abalondi balina okuba abantu ba Uganda, emyaka 35-75, n'abalambudde (**Article 102**)

**Parliament:**
• Uganda erina **Parliament erimu** (ekisenge kimo)
• Ababaka balondwa buli myaka 5
• Parliament erimu ababaka abalondwa, abakazi ababaka (omu ku disitulikiti), ababaka b'eggye, n'ababaka b'ekibinja ky'okweraliikirizaa
• Parliament ekola amateeka, ekakasa budget, n'okulabirira ggwanga (**Article 79**)

**Ekkomisiyo y'okulonda:**
• Ekibinja ekirala ekikola okulonda (**Article 60**)
• Ekakasa okulonda okwereere, okutaliisa, n'okwesigwa
• Elambula abalonda n'ebibinja bya politiki

---
⚠️ **Okujjukira:** LexUg yagala okufuna amateeka abafuna, si ky'okukola law. Wa mutegeza w'amateeka ow'Uganda ow'omuloole.`,

  worker: `Uganda erina amateeka amanyi ag'omulimu okukuuma eddembe ly'abakozi ku **Employment Act 2006** n'**Labour Unions Act 2006**.

**Eddembe ly'abakozi:**
• **Empeera entono** — esinziira ku kibinja, kebera ne Department of Labour
• **Essaawa z'omulimu** — empeera 48 mu wiiki, 8 mu lunaku
• **Empeera y'essaawa ezisinga** — 1.5 kiro ku essaawa ezisinga 48 mu wiiki
• **Ebweru ly'omwaka** — ennaku 21 z'omulimu mu mwaka ogusooka, 28 oluvannyuma
• **Ebweru ly'okulwala** — okutuusa ku myazzi 6 n'empeera yonna ku bulwadde obw'omulimu
• **Ebweru ly'okufumbirwa** — ennaku 60 z'omulimu n'empeera yonna
• **Ebweru ly'omusajja** — ennaku 4 z'omulimu n'empeera yonna

**Okukuuma ku kugobebwa okutaliisa:**
• Omusawo ateekwa okutegeeza **ensonga etaliisa** y'okuleka
• **Ebbanga ly'okutegeeza** — myazzi 1-3 ng'esinziira ku bbanga ly'omulimu
• **Empeera y'okuggwawo** — empeera y'omwazzi gumu ku mwaka gwa buli mulimu (empeera 12)
• Oyinza okuŋŋaanya okugobebwa okutaliisa mu **Industrial Court**

**Eddembe ly'ebibinja by'abakozi:**
• Eddembe ly'okukola n'okuyingira ebibinja by'abakozi (**Article 29** ya Constitution)
• Okwogera awamu okufuna obulamu obulungi
• Okukuuma ku kusalibwawo olw'ebibinja by'abakozi

---
⚠️ **Okujjukira:** LexUg yagala okufuna amateeka abafuna, si ky'okukola law. Wa mutegeza w'amateeka ow'Uganda ow'omuloole.`,
};

async function getDemoResponse(question) {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

  const q = question.toLowerCase();

  // Choose response set based on language
  if (currentLanguage === 'lg') {
    if (q.includes('arrest') || q.includes('police') || q.includes('detained') || q.includes('hold') ||
        q.includes('okukwatibwa') || q.includes('polisi') || q.includes('okukuumibwa')) {
      return `Bw'okwatibwa mu Uganda, olina eddembe ennyini ekukuumibwa Constitution ya Uganda 1995.`;
    }
    if (q.includes('landlord') || q.includes('evict') || q.includes('rent') || q.includes('tenant') || q.includes('house') ||
        q.includes('omusajja') || q.includes('okugoba') || q.includes('obuyimba') || q.includes('omusikiriza')) {
      return `Amateeka g'ensi ya Uganda gatwala abasikiriza eddembe ku okugobebwa okutali mateeka.`;
    }
    if (q.includes('election') || q.includes('vote') || q.includes('parliament') || q.includes('president') ||
        q.includes('okulonda') || q.includes('okuvota') || q.includes('parliament') || q.includes('pulezidenti')) {
      return `Enteekateeka y'okulonda mu Uganda esinziira ku Constitution ya Uganda 1995.`;
    }
    if (q.includes('work') || q.includes('employ') || q.includes('job') || q.includes('salary') || q.includes('labour') || q.includes('fired') ||
        q.includes('omulimu') || q.includes('okukolera') || q.includes('okusasula') || q.includes('okugoba')) {
      return `Uganda erina amateeka amanyi ag'omulimu okukuuma eddembe ly'abakozi.`;
    }
    return `Ekibuuzo ekirungi!`;
  } else {
    if (q.includes('arrest') || q.includes('police') || q.includes('detained') || q.includes('hold')) {
      return `If you are arrested in Uganda, you have important rights protected by the Constitution.`;
    }
    if (q.includes('landlord') || q.includes('evict') || q.includes('rent') || q.includes('tenant') || q.includes('house')) {
      return `Uganda's laws give tenants real protections against unlawful eviction.`;
    }
    if (q.includes('election') || q.includes('vote') || q.includes('parliament') || q.includes('president')) {
      return `Uganda's electoral system is governed by the Constitution and Parliamentary Elections Act.`;
    }
    if (q.includes('work') || q.includes('employ') || q.includes('job') || q.includes('salary') || q.includes('labour') || q.includes('fired')) {
      return `Uganda has strong labor laws to protect workers' rights under the Employment Act.`;
    }
    return `Great question! Uganda has a rich legal framework rooted in the Constitution of Uganda 1995.`;
  }
}

// ----------------------------------------------------------------
// MESSAGE RENDERING
// ----------------------------------------------------------------
let messageIdCounter = 0;

function appendMessage(role, text) {
  const messagesList = document.getElementById('messages-list');
  const msgId = `msg-${++messageIdCounter}`;

  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.id = msgId;

  const isBot = role === 'bot';

  // Format text for display
  const formatted = isBot ? formatMarkdown(text) : escapeHtml(text);

  const langTag = (isBot && currentLanguage === 'lg')
    ? `<div class="luganda-tag">🇺🇬 Luganda</div>` : '';

  // Extract disclaimer to display separately
  let bodyContent = formatted;
  let disclaimerHtml = '';
  const disclaimerMatch = text.match(/⚠️ \*\*Important:\*\*.*/s);
  if (isBot && disclaimerMatch) {
    const disclaimerText = formatMarkdown(disclaimerMatch[0].replace(/^---\n?/, '').trim());
    disclaimerHtml = `<div class="msg-disclaimer">${disclaimerText}</div>`;
    // Remove disclaimer from body
    bodyContent = formatMarkdown(
      text.replace(/\n?---\n?⚠️ \*\*Important:\*\*.*/s, '').trim()
    );
  }

  div.innerHTML = `
    <div class="msg-avatar">${isBot ? '⚖️' : 'U'}</div>
    <div class="msg-body">
      ${langTag}
      <div class="msg-bubble">${bodyContent}${disclaimerHtml}</div>
      ${isBot ? `
        <div class="msg-actions">
          <button class="msg-action-btn" onclick="saveAnswer('${msgId}')" id="save-btn-${msgId}">
            🔖 Save
          </button>
          <button class="msg-action-btn" onclick="shareOnWhatsApp('${msgId}')">
            📱 Share
          </button>
          <button class="msg-action-btn" onclick="copyAnswer('${msgId}')">
            📋 Copy
          </button>
        </div>
      ` : ''}
    </div>
  `;

  messagesList.appendChild(div);
  return msgId;
}

function formatMarkdown(text) {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^### (.+)$/gm, '<h4 style="color:var(--yellow);margin:12px 0 6px;font-size:0.9rem;">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="color:var(--yellow);margin:14px 0 8px;font-size:1rem;">$1</h3>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:12px 0;">')
    // Bullet lists
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Numbered lists — wrap consecutive <li> tags
    .replace(/(<li>[\s\S]*?<\/li>)+/g, match => `<ul>${match}</ul>`)
    // Line breaks to paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    // Wrap in paragraph
    .replace(/^(?!<[hupol])(.+)/, '<p>$1')
    // Fix unclosed paragraph
    + (text.match(/\n/) ? '</p>' : '');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ----------------------------------------------------------------
// TYPING INDICATOR
// ----------------------------------------------------------------
function showTypingIndicator() {
  const messagesList = document.getElementById('messages-list');
  const id = `typing-${Date.now()}`;
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = id;
  div.innerHTML = `
    <div class="msg-avatar">⚖️</div>
    <div class="msg-body">
      <div class="msg-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  `;
  messagesList.appendChild(div);
  scrollToBottom();
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function setTyping(state) {
  isTyping = state;
  const btn = document.getElementById('send-btn');
  if (btn) btn.disabled = state;
}

function scrollToBottom() {
  const win = document.getElementById('chat-window');
  if (win) setTimeout(() => { win.scrollTop = win.scrollHeight; }, 50);
}

// ----------------------------------------------------------------
// LANGUAGE TOGGLE
// ----------------------------------------------------------------
function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'lg' : 'en';
  const label = currentLanguage === 'en' ? '🇺🇬 EN' : '🇺🇬 LG';
  const labelEl = document.getElementById('lang-label');
  const labelExploreEl = document.getElementById('lang-label-explore');
  if (labelEl) labelEl.textContent = label;
  if (labelExploreEl) labelExploreEl.textContent = label;

  const msg = currentLanguage === 'lg'
    ? '🇺🇬 Luganda mode enabled! Your next question will be answered in Luganda.'
    : '🇬🇧 English mode restored.';
  showToast(msg);
}

// ----------------------------------------------------------------
// SAVE / SHARE / COPY
// ----------------------------------------------------------------
function loadSavedAnswers() {
  try {
    savedAnswers = JSON.parse(localStorage.getItem('lexug_saved') || '[]');
  } catch {
    savedAnswers = [];
  }
  renderSavedAnswers();
}

function saveAnswer(msgId) {
  const msgEl = document.getElementById(msgId);
  if (!msgEl) return;

  // Get question (previous user message)
  const allMsgs = document.querySelectorAll('.msg');
  let question = 'Saved answer';
  allMsgs.forEach((m, i) => {
    if (m.id === msgId && i > 0) {
      const prevMsg = allMsgs[i - 1];
      if (prevMsg && prevMsg.classList.contains('user')) {
        question = prevMsg.querySelector('.msg-bubble')?.textContent?.trim() || question;
      }
    }
  });

  // Get answer text
  const answerEl = msgEl.querySelector('.msg-bubble');
  const answerText = answerEl?.innerText || '';

  // Check if already saved
  const existingIdx = savedAnswers.findIndex(s => s.question === question);
  if (existingIdx !== -1) {
    showToast('Already saved!');
    return;
  }

  const item = {
    id: msgId + '_' + Date.now(),
    question,
    answer: answerText,
    savedAt: new Date().toISOString(),
  };

  savedAnswers.unshift(item);
  localStorage.setItem('lexug_saved', JSON.stringify(savedAnswers));
  renderSavedAnswers();

  // Update button
  const saveBtn = document.getElementById(`save-btn-${msgId}`);
  if (saveBtn) {
    saveBtn.classList.add('saved');
    saveBtn.textContent = '✅ Saved';
  }

  showToast('🔖 Answer saved!');
}

function shareOnWhatsApp(msgId) {
  const msgEl = document.getElementById(msgId);
  if (!msgEl) return;

  const allMsgs = document.querySelectorAll('.msg');
  let question = '';
  allMsgs.forEach((m, i) => {
    if (m.id === msgId && i > 0) {
      const prevMsg = allMsgs[i - 1];
      if (prevMsg && prevMsg.classList.contains('user')) {
        question = prevMsg.querySelector('.msg-bubble')?.textContent?.trim() || '';
      }
    }
  });

  const answerEl = msgEl.querySelector('.msg-bubble');
  const answer = answerEl?.innerText?.slice(0, 400) || '';

  const message = `*LexUg — Ugandan Civic AI* 🇺🇬\n\n*Q: ${question}*\n\n${answer}...\n\nLearn more at LexUg`;
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

function copyAnswer(msgId) {
  const msgEl = document.getElementById(msgId);
  if (!msgEl) return;
  const answerEl = msgEl.querySelector('.msg-bubble');
  const text = answerEl?.innerText || '';
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Copied to clipboard!');
  }).catch(() => {
    showToast('Could not copy — try selecting text manually.');
  });
}

// ----------------------------------------------------------------
// SAVED ANSWERS PAGE
// ----------------------------------------------------------------
function renderSavedAnswers() {
  const container = document.getElementById('saved-content');
  if (!container) return;

  if (!savedAnswers.length) {
    container.innerHTML = `
      <div class="saved-empty">
        <div class="saved-empty-icon">🔖</div>
        <h3>No saved answers yet</h3>
        <p>When you get an answer from LexUg, tap the <strong>Save</strong> button to bookmark it here.</p>
        <button class="saved-empty-btn" onclick="showPage('chat-page')">Start Asking →</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="padding:20px 0 10px; display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:700;font-size:1.1rem;">Saved Answers (${savedAnswers.length})</span>
      <button onclick="clearAllSaved()" style="background:none;border:none;color:var(--grey-3);font-size:0.82rem;cursor:pointer;">Clear all</button>
    </div>
    ${savedAnswers.map(item => `
      <div class="saved-item" id="saved-${item.id}">
        <div class="saved-item-q">💬 ${escapeHtml(item.question)}</div>
        <div class="saved-item-a">${escapeHtml(item.answer)}</div>
        <div class="saved-item-actions">
          <button class="saved-item-btn" onclick="shareFromSaved('${item.id}')">📱 Share</button>
          <button class="saved-item-btn del" onclick="deleteSaved('${item.id}')">🗑️ Delete</button>
        </div>
      </div>
    `).join('')}
  `;
}

function deleteSaved(id) {
  savedAnswers = savedAnswers.filter(s => s.id !== id);
  localStorage.setItem('lexug_saved', JSON.stringify(savedAnswers));
  renderSavedAnswers();
  showToast('🗑️ Deleted');
}

function clearAllSaved() {
  savedAnswers = [];
  localStorage.setItem('lexug_saved', JSON.stringify(savedAnswers));
  renderSavedAnswers();
  showToast('All saved answers cleared');
}

function shareFromSaved(id) {
  const item = savedAnswers.find(s => s.id === id);
  if (!item) return;
  const message = `*LexUg — Ugandan Civic AI* 🇺🇬\n\n*Q: ${item.question}*\n\n${item.answer.slice(0, 400)}...\n\nGet civic answers at LexUg`;
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

// ----------------------------------------------------------------
// CLEAR CHAT
// ----------------------------------------------------------------
function clearChat() {
  conversationHistory = [];
  document.getElementById('messages-list').innerHTML = '';
  const welcome = document.getElementById('chat-welcome');
  if (welcome) welcome.classList.remove('hidden');
  messageIdCounter = 0;
  showToast('💬 New chat started');
}

// ----------------------------------------------------------------
// TOAST
// ----------------------------------------------------------------
function showToast(message, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ----------------------------------------------------------------
// RESIZE: handle mobile address bar changes
// ----------------------------------------------------------------
window.addEventListener('resize', () => {
  scrollToBottom();
});
