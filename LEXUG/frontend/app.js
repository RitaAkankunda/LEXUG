// LexUg Web App - Main JavaScript

// State Management
let currentLanguage = 'en'; // 'en' or 'lg'
let conversationHistory = [];
let savedAnswers = JSON.parse(localStorage.getItem('lexug_saved') || '[]');
let apiKey = localStorage.getItem('lexug_api_key') || '';
let isDemoMode = !apiKey;

// Demo Mode Responses
const demoResponses = {
    en: {
        'arrest': `According to Article 23 of the Ugandan Constitution, you have the following rights if arrested:

1. **Right to be informed of the reason** - Police must tell you why you're being arrested
2. **Right to remain silent** - You don't have to answer questions without a lawyer
3. **Right to legal representation** - You can consult a lawyer before questioning
4. **Right to be brought before court within 48 hours** - Police cannot hold you indefinitely
5. **Right to humane treatment** - No torture or cruel punishment

If police violate these rights, you can report to the Uganda Human Rights Commission or seek legal counsel.

⚠️ Civic education only — not legal advice. For your specific legal situation, please consult a qualified Ugandan lawyer.`,

        'tenant': `Under the Land Act and landlord-tenant laws in Uganda, as a tenant you have:

1. **Right to quiet enjoyment** - Landlord cannot disturb your peaceful use of the property
2. **Right to proper notice** - For rent increases or eviction, proper notice must be given
3. **Right to basic services** - Access to water, electricity, and sanitation
4. **Right to security deposit return** - Deposit returned within reasonable time after leaving
5. **Right to repairs** - Landlord must maintain the property in habitable condition

For eviction, landlords must follow due process through court. Illegal lockouts are not permitted.

⚠️ Civic education only — not legal advice. For your specific legal situation, please consult a qualified Ugandan lawyer.`,

        'employment': `Under the Employment Act 2006 and Uganda's labor laws, workers have:

1. **Right to fair wages** - Must be paid at least minimum wage (if applicable) and on time
2. **Right to safe working conditions** - Employer must provide safe workplace
3. **Right to rest periods** - At least 24 hours rest per week, annual leave
4. **Right to maternity leave** - Female employees entitled to maternity leave
5. **Right to join trade unions** - Freedom of association and collective bargaining
6. **Right to termination notice** - Proper notice period for termination

Maximum working hours are generally 48 hours per week. Overtime should be compensated.

⚠️ Civic education only — not legal advice. For your specific legal situation, please consult a qualified Ugandan lawyer.`,

        'voting': `To vote in Uganda, you must:

1. **Be a citizen** - Ugandan citizenship by birth or naturalization
2. **Be 18 years or older** - Minimum voting age
3. **Be registered** - Have your name on the voters' register
4. **Have a voter card** - Present your voter ID at polling station

**Voting Process:**
- Registration happens at designated centers before elections
- Polling stations open 7:00 AM - 4:00 PM on election day
- You vote by secret ballot
- Results are announced by the Electoral Commission

**Key Rights:**
- Right to vote without intimidation
- Right to secrecy of your vote
- Right to information about candidates

⚠️ Civic education only — not legal advice. For electoral disputes, consult the Electoral Commission or legal counsel.`,

        'default': `I can help you understand Ugandan law and your rights. Here are some topics I can assist with:

• Police & Arrest Rights
• Land & Housing Rights  
• Employment Rights
• Voting & Electoral Rights
• Education Rights
• How Government Works

Please ask a specific question, and I'll provide information with legal citations.

⚠️ Civic education only — not legal advice. For your specific legal situation, please consult a qualified Ugandan lawyer.`
    },
    lg: {
        'arrest': `Okusinzira ku Kika kya 23 eky'Omukulembeze, oba nga obikwatako oba n'olindibwa, oba nga oba n'eddembe lyo:

1. **Eddembe lyo okumanya ensonga** - Police erina okugamba ensonga ki oba bikwatako
2. **Eddembe lyo okutegeera** - Tosobola kuddamu ebanga oba nga toli wa munnamateeka
3. **Eddembe lyo munnamateeka** - Oyinza okubuuza munnamateeka nga obadde
4. **Eddembe lyo okugenda mu kkooti mu maawa 48** - Police tasobola kukujjamu buli ludda
5. **Eddembe lyo okubeerwa obulungi** - Tewali mubbi oba okubonerezibwa

Bwe baaba bagukozesa eddembe lyo, oyinza okwawula eby'okukozesa eddembe lyo eby'abantu ba Uganda oba okubuuza munnamateeka.

⚠️ Kino ky'okusomesa abantu ku mateeka — si kibuuzo kya munnamateeka. Ku nsonga zo za munnamateeka, buuza munnamateeka omukugu.`,

        'tenant': `Wansi w'Enkola ya Buliisa n'amateeka ga bannannyini-ebisaanye, ng'omwisaanya olya:

1. **Eddembe lyo okubeera nga tobyawulana** - Bannannyini tebasobola kukukwatako nga okozesa eby'okubeera
2. **Eddembe lyo okumanya ebikwatako** - Okulongosa oba okugyawo obuyinza okubeerwa nga bannanya
3. **Eddembe lyo by'omukyamu** - Okufuna amazzi, amasanyalaze, n'ensambula
4. **Eddembe lyo okuddamu ensimbi** - Ensano z'okuddamu nga ogenda
5. **Eddembe lyo okulabula** - Bannannyini balina okulabula eby'okubeera

Okugyawo omwisaanya, bannannyini balina okukola nga bwe kiri mu kkooti. Okugyawo nga tebikolebwa kya bujamaizi tekitwala.

⚠️ Kino ky'okusomesa abantu ku mateeka — si kibuuzo kya munnamateeka. Ku nsonga zo za munnamateeka, buuza munnamateeka omukugu.`,

        'default': `Nyinza okuyamba okumanya mateeka ga Uganda n'eddembe lyo. Wano w'ebisinziira ebyinza okuyamba:

• Eddembe lya Police n'Obukwatako
• Eddebbe lya Buliisa n'Eby'okubeera
• Eddebbe lya Abakozesa
• Eddebbe lya Okulonda
• Eddebbe lya Somesa
• Enkola ya Gavumenti

Buuza ekibuuzo ekirina amawulire, nna nkuyamba amawulire aga mateeka.

⚠️ Kino ky'okusomesa abantu ku mateeka — si kibuuzo kya munnamateeka. Ku nsonga zo za munnamateeka, buuza munnamateeka omukugu.`
    }
};

// DOM Elements
const landingPage = document.getElementById('landing-page');
const chatPage = document.getElementById('chat-page');
const explorePage = document.getElementById('explore-page');
const savedPage = document.getElementById('saved-page');
const startAskingBtn = document.getElementById('start-asking-btn');
const backBtn = document.getElementById('back-btn');
const langToggle = document.getElementById('lang-toggle');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const connectionStatus = document.getElementById('connection-status');
const navItems = document.querySelectorAll('.nav-item');
const quickCards = document.querySelectorAll('.quick-card');
const topicCards = document.querySelectorAll('.topic-card');
const categoryItems = document.querySelectorAll('.category-item');

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageId.replace('-page', ''));
    });
}

// Event Listeners
startAskingBtn.addEventListener('click', () => showPage('chat-page'));

backBtn.addEventListener('click', () => showPage('landing-page'));

document.getElementById('explore-back-btn').addEventListener('click', () => showPage('landing-page'));
document.getElementById('saved-back-btn').addEventListener('click', () => showPage('landing-page'));

langToggle.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'lg' : 'en';
    langToggle.textContent = currentLanguage.toUpperCase();
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const pageId = item.dataset.page + '-page';
        showPage(pageId);
    });
});

// Chat Functionality
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content.replace(/\n/g, '<br>');
    
    if (!isUser) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'action-btn';
        saveBtn.innerHTML = '🔖';
        saveBtn.title = 'Save answer';
        saveBtn.addEventListener('click', () => saveAnswer(content));
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy to clipboard';
        copyBtn.addEventListener('click', () => copyToClipboard(content));
        
        const shareBtn = document.createElement('button');
        shareBtn.className = 'action-btn';
        shareBtn.innerHTML = '📤';
        shareBtn.title = 'Share on WhatsApp';
        shareBtn.addEventListener('click', () => shareOnWhatsApp(content));
        
        actionsDiv.appendChild(saveBtn);
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(shareBtn);
        messageDiv.appendChild(actionsDiv);
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    conversationHistory.push({ role: isUser ? 'user' : 'assistant', content });
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    userInput.value = '';
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing';
    typingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        let response;
        
        if (isDemoMode) {
            // Demo mode - use pre-written responses
            await new Promise(resolve => setTimeout(resolve, 1000));
            const lowerMessage = message.toLowerCase();
            const langResponses = demoResponses[currentLanguage];
            
            if (lowerMessage.includes('arrest') || lowerMessage.includes('police')) {
                response = langResponses.arrest;
            } else if (lowerMessage.includes('tenant') || lowerMessage.includes('land') || lowerMessage.includes('house')) {
                response = langResponses.tenant;
            } else if (lowerMessage.includes('employment') || lowerMessage.includes('work') || lowerMessage.includes('job')) {
                response = langResponses.employment;
            } else if (lowerMessage.includes('vote') || lowerMessage.includes('election')) {
                response = langResponses.voting;
            } else {
                response = langResponses.default;
            }
        } else {
            // Live AI mode
            response = await callClaudeAPI(message);
        }
        
        chatMessages.removeChild(typingDiv);
        addMessage(response);
        
    } catch (error) {
        chatMessages.removeChild(typingDiv);
        addMessage('Sorry, I encountered an error. Please try again or use demo mode.');
        console.error('Error:', error);
    }
}

async function callClaudeAPI(message) {
    const systemPrompt = currentLanguage === 'en' 
        ? 'You are LexUg — Uganda\'s trusted civic AI companion. Answer questions about Ugandan law, rights, and government in plain English. Always cite specific laws (e.g., "Article 23 of the Constitution"). Always end with: "⚠️ Civic education only — not legal advice. For your specific legal situation, please consult a qualified Ugandan lawyer."'
        : 'Oli LexUg — omukozi w\'amateeka g\'obuwangwa bwa Uganda. Ddamu ebibuuzo ku mateeka ga Uganda, eddembe, n\'enkola ya gavumenti mu Luganda. Tereeza ebyamateeka ebirina amawulire (omugezi: "Kika kya 23 eky\'Omukulembeze"). Maliriza n\'ebino: "⚠️ Kino ky\'okusomesa abantu ku mateeka — si kibuuzo kya munnamateeka. Ku nsonga zo za munnamateeka, buuza munnamateeka omukugu."';
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                ...conversationHistory,
                { role: 'user', content: message }
            ]
        })
    });
    
    const data = await response.json();
    return data.content[0].text;
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Quick Cards and Topic Cards
quickCards.forEach(card => {
    card.addEventListener('click', () => {
        const question = card.dataset.question;
        userInput.value = question;
        sendMessage();
    });
});

topicCards.forEach(card => {
    card.addEventListener('click', () => {
        const topic = card.dataset.topic;
        const questions = {
            police: 'What are my rights if I\'m arrested in Uganda?',
            land: 'What are my rights as a tenant in Uganda?',
            employment: 'What are my employment rights in Uganda?',
            voting: 'How do I vote in Uganda?'
        };
        userInput.value = questions[topic] || '';
        showPage('chat-page');
        sendMessage();
    });
});

categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        const question = item.dataset.question;
        userInput.value = question;
        showPage('chat-page');
        sendMessage();
    });
});

// Save, Copy, Share Functions
function saveAnswer(content) {
    const answer = {
        id: Date.now(),
        content: content,
        timestamp: new Date().toISOString()
    };
    savedAnswers.push(answer);
    localStorage.setItem('lexug_saved', JSON.stringify(savedAnswers));
    updateSavedList();
    alert('Answer saved!');
}

function copyToClipboard(content) {
    navigator.clipboard.writeText(content).then(() => {
        alert('Copied to clipboard!');
    });
}

function shareOnWhatsApp(content) {
    const text = encodeURIComponent(content);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function updateSavedList() {
    const savedList = document.getElementById('saved-list');
    if (savedAnswers.length === 0) {
        savedList.innerHTML = '<p class="empty-state">No saved answers yet. Save important responses by clicking the bookmark icon.</p>';
        return;
    }
    
    savedList.innerHTML = savedAnswers.map(answer => `
        <div class="saved-item">
            <div class="saved-content">${answer.content.substring(0, 200)}...</div>
            <div class="saved-meta">
                <span class="saved-date">${new Date(answer.timestamp).toLocaleDateString()}</span>
                <button class="delete-btn" onclick="deleteSaved(${answer.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

window.deleteSaved = function(id) {
    savedAnswers = savedAnswers.filter(a => a.id !== id);
    localStorage.setItem('lexug_saved', JSON.stringify(savedAnswers));
    updateSavedList();
};

// Connection Status
function updateConnectionStatus() {
    const isOnline = navigator.onLine;
    connectionStatus.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
    connectionStatus.querySelector('.status-text').textContent = isOnline ? 'Online' : 'Offline';
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();

// Initialize
updateSavedList();
showPage('landing-page');
