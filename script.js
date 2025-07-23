// Global Configuration
const CONFIG = {
    API_URL: 'https://api.groq.com/openai/v1/chat/completions',
    API_KEY: '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',
    MODEL: 'meta-llama/llama-4-scout-17b-16e-instruct',
    MAX_CHARS: 4000,
    CURRENT_USER: 'Coen-yin',
    CURRENT_DATE: '2025-07-23 08:53:52'
};

// Global State
const state = {
    currentChatId: 'current',
    chatHistory: new Map(),
    settings: {
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: 'You are a helpful, harmless, and honest AI assistant. You provide accurate information and engage in meaningful conversations while being respectful and professional.',
        darkMode: true,
        soundEffects: true
    },
    isTyping: false,
    sidebarCollapsed: false
};

// DOM Elements
const elements = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log(`🚀 NeuroAI Loading... | User: ${CONFIG.CURRENT_USER} | Time: ${CONFIG.CURRENT_DATE}`);
    
    // Get all DOM elements
    getElements();
    
    // Initialize immediately
    initializeApp();
});

function getElements() {
    elements.sidebar = document.getElementById('sidebar');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    elements.welcomeScreen = document.getElementById('welcome-screen');
    elements.chatMessages = document.getElementById('chat-messages');
    elements.messageInput = document.getElementById('message-input');
    elements.sendBtn = document.getElementById('send-btn');
    elements.charCount = document.getElementById('char-count');
    elements.typingIndicator = document.getElementById('typing-indicator');
    elements.settingsModal = document.getElementById('settings-modal');
    elements.modelDropdown = document.getElementById('model-dropdown');
    elements.userMenu = document.getElementById('user-menu');
    elements.chatHistory = document.getElementById('chat-history');
    elements.toastContainer = document.getElementById('toast-container');
    elements.themeIcon = document.getElementById('theme-icon');
}

function initializeApp() {
    console.log('🔧 Initializing NeuroAI...');
    
    // Hide loading immediately and show main interface
    setTimeout(() => {
        hideLoading();
        setupEventListeners();
        loadSettings();
        initializeTheme();
        loadChatHistory();
        setupAutoResize();
        showWelcomeScreen();
        
        showToast('NeuroAI Ready!', 'success');
        console.log('✅ NeuroAI Initialized Successfully');
    }, 1500); // Reduced from 2000ms to 1500ms
}

// Loading Functions
function hideLoading() {
    console.log('🎯 Hiding loading screen...');
    if (elements.loadingOverlay) {
        elements.loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            elements.loadingOverlay.style.display = 'none';
        }, 500);
    }
}

function showWelcomeScreen() {
    if (elements.welcomeScreen) {
        elements.welcomeScreen.style.display = 'flex';
    }
    if (elements.chatMessages) {
        elements.chatMessages.style.display = 'none';
    }
}

function hideWelcomeScreen() {
    if (elements.welcomeScreen) {
        elements.welcomeScreen.style.display = 'none';
    }
    if (elements.chatMessages) {
        elements.chatMessages.style.display = 'block';
    }
}

// Event Listeners Setup
function setupEventListeners() {
    console.log('📡 Setting up event listeners...');
    
    // Message input
    if (elements.messageInput) {
        elements.messageInput.addEventListener('input', handleInputChange);
        elements.messageInput.addEventListener('keydown', handleKeyPress);
        console.log('✅ Message input listeners added');
    }
    
    // Send button
    if (elements.sendBtn) {
        elements.sendBtn.addEventListener('click', sendMessage);
        console.log('✅ Send button listener added');
    }
    
    // Settings sliders
    setupSettingsListeners();
    
    // Global click handler
    document.addEventListener('click', function(e) {
        // Close dropdowns when clicking outside
        if (!e.target.closest('.model-selector')) {
            if (elements.modelDropdown) {
                elements.modelDropdown.classList.remove('show');
            }
        }
        if (!e.target.closest('.user-profile')) {
            if (elements.userMenu) {
                elements.userMenu.classList.remove('show');
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'k':
                    e.preventDefault();
                    if (elements.messageInput) {
                        elements.messageInput.focus();
                    }
                    break;
                case 'n':
                    e.preventDefault();
                    startNewChat();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    console.log('✅ All event listeners setup complete');
}

function setupSettingsListeners() {
    const temperatureSlider = document.getElementById('temperature');
    const maxTokensSlider = document.getElementById('max-tokens');
    const systemPromptTextarea = document.getElementById('system-prompt');
    
    if (temperatureSlider) {
        temperatureSlider.addEventListener('input', function() {
            state.settings.temperature = parseFloat(this.value);
            const valueSpan = this.parentNode.querySelector('.slider-value');
            if (valueSpan) {
                valueSpan.textContent = this.value;
            }
        });
    }
    
    if (maxTokensSlider) {
        maxTokensSlider.addEventListener('input', function() {
            state.settings.maxTokens = parseInt(this.value);
            const valueSpan = this.parentNode.querySelector('.slider-value');
            if (valueSpan) {
                valueSpan.textContent = this.value;
            }
        });
    }
    
    if (systemPromptTextarea) {
        systemPromptTextarea.addEventListener('change', function() {
            state.settings.systemPrompt = this.value;
        });
    }
}

// Input Handling
function handleInputChange() {
    if (!elements.messageInput || !elements.charCount || !elements.sendBtn) return;
    
    const text = elements.messageInput.value;
    const charCount = text.length;
    
    // Update character count
    if (elements.charCount) {
        elements.charCount.textContent = charCount;
    }
    
    // Update send button state
    const canSend = charCount > 0 && charCount <= CONFIG.MAX_CHARS && !state.isTyping;
    elements.sendBtn.disabled = !canSend;
    
    // Color character count if approaching limit
    if (elements.charCount) {
        if (charCount > CONFIG.MAX_CHARS * 0.9) {
            elements.charCount.style.color = 'var(--danger)';
        } else if (charCount > CONFIG.MAX_CHARS * 0.8) {
            elements.charCount.style.color = 'var(--warning)';
        } else {
            elements.charCount.style.color = '';
        }
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (elements.sendBtn && !elements.sendBtn.disabled) {
            sendMessage();
        }
    }
}

function setupAutoResize() {
    if (!elements.messageInput) return;
    
    elements.messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

// Chat Functions
async function sendMessage() {
    console.log('📤 Sending message...');
    
    if (!elements.messageInput || state.isTyping) return;
    
    const message = elements.messageInput.value.trim();
    if (!message) return;
    
    // Hide welcome screen
    hideWelcomeScreen();
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    handleInputChange();
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        console.log('🤖 Calling AI API...');
        const response = await callAI(message);
        console.log('✅ AI response received');
        
        hideTypingIndicator();
        addMessage(response, 'ai');
        updateChatTitle(message);
        saveChatHistory();
        
    } catch (error) {
        console.error('❌ AI Error:', error);
        hideTypingIndicator();
        addMessage('I apologize, but I encountered an error. Please try again.', 'ai', true);
        showToast('Failed to get AI response', 'error');
    }
}

async function callAI(message) {
    const currentChat = state.chatHistory.get(state.currentChatId) || { messages: [] };
    
    const messages = [
        {
            role: 'system',
            content: state.settings.systemPrompt
        },
        ...currentChat.messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
        })),
        {
            role: 'user',
            content: message
        }
    ];
    
    const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.API_KEY}`
        },
        body: JSON.stringify({
            model: CONFIG.MODEL,
            messages: messages,
            temperature: state.settings.temperature,
            max_tokens: state.settings.maxTokens,
            stream: false
        })
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid AI response');
    }
    
    return data.choices[0].message.content;
}

function addMessage(content, type, isError = false) {
    console.log(`💬 Adding ${type} message`);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${type}-avatar`;
    avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-brain"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    if (isError) {
        messageText.style.borderColor = 'var(--danger)';
        messageText.style.background = 'rgba(255, 68, 68, 0.1)';
    }
    
    // Process content (handle markdown, code blocks, etc.)
    messageText.innerHTML = processContent(content);
    
    const messageActions = document.createElement('div');
    messageActions.className = 'message-actions';
    
    if (type === 'ai') {
        messageActions.innerHTML = `
            <button class="message-btn" onclick="copyMessage(this)" title="Copy">
                <i class="fas fa-copy"></i>
            </button>
            <button class="message-btn" onclick="likeMessage(this)" title="Like">
                <i class="fas fa-thumbs-up"></i>
            </button>
            <button class="message-btn" onclick="dislikeMessage(this)" title="Dislike">
                <i class="fas fa-thumbs-down"></i>
            </button>
        `;
    }
    
    messageContent.appendChild(messageText);
    messageContent.appendChild(messageActions);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    // Add to DOM
    if (elements.chatMessages) {
        elements.chatMessages.appendChild(messageDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
    
    // Store in chat history
    const currentChat = state.chatHistory.get(state.currentChatId) || { 
        id: state.currentChatId,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    currentChat.messages.push({
        content: content,
        type: type,
        timestamp: new Date().toISOString(),
        isError: isError
    });
    
    state.chatHistory.set(state.currentChatId, currentChat);
    
    // Animate message
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    });
}

function processContent(content) {
    // Handle code blocks
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">${lang || 'code'}</span>
                    <button class="copy-btn" onclick="copyCode(this)">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
                <div class="code-content">${escapeHtml(code.trim())}</div>
            </div>
        `;
    });
    
    // Handle inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle line breaks
    content = content.replace(/\n/g, '<br>');
    
    // Handle URLs
    content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    
    return content;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showTypingIndicator() {
    state.isTyping = true;
    if (elements.typingIndicator) {
        elements.typingIndicator.style.display = 'flex';
    }
    if (elements.sendBtn) {
        elements.sendBtn.disabled = true;
    }
    
    // Scroll to bottom
    if (elements.chatMessages) {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
}

function hideTypingIndicator() {
    state.isTyping = false;
    if (elements.typingIndicator) {
        elements.typingIndicator.style.display = 'none';
    }
    handleInputChange(); // Re-evaluate send button state
}

// UI Functions
function startNewChat() {
    console.log('🆕 Starting new chat...');
    
    state.currentChatId = 'chat_' + Date.now();
    
    // Clear current chat
    if (elements.chatMessages) {
        elements.chatMessages.innerHTML = '';
    }
    
    // Show welcome screen
    showWelcomeScreen();
    
    // Update chat history UI
    updateChatHistoryUI();
    
    showToast('New chat started', 'success');
}

function updateChatTitle(firstMessage) {
    const currentChat = state.chatHistory.get(state.currentChatId);
    if (currentChat && currentChat.title === 'New Conversation') {
        currentChat.title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
        updateChatHistoryUI();
    }
}

function updateChatHistoryUI() {
    if (!elements.chatHistory) return;
    
    const historyHTML = `
        <div class="history-section">
            <div class="history-label">Today</div>
            ${Array.from(state.chatHistory.values()).map(chat => `
                <div class="chat-item ${chat.id === state.currentChatId ? 'active' : ''}" data-chat-id="${chat.id}" onclick="loadChat('${chat.id}')">
                    <i class="fas fa-message"></i>
                    <span class="chat-title">${chat.title}</span>
                    <div class="chat-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); renameChat('${chat.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); deleteChat('${chat.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    elements.chatHistory.innerHTML = historyHTML;
}

function loadChat(chatId) {
    console.log(`📂 Loading chat: ${chatId}`);
    
    state.currentChatId = chatId;
    const chat = state.chatHistory.get(chatId);
    
    if (!chat || !elements.chatMessages) return;
    
    // Clear current messages
    elements.chatMessages.innerHTML = '';
    
    // Load messages
    if (chat.messages.length === 0) {
        showWelcomeScreen();
    } else {
        hideWelcomeScreen();
        chat.messages.forEach(msg => {
            addMessageToUI(msg);
        });
    }
    
    // Update UI
    updateChatHistoryUI();
}

function addMessageToUI(messageData) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${messageData.type}`;
    
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${messageData.type}-avatar`;
    avatar.innerHTML = messageData.type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-brain"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    if (messageData.isError) {
        messageText.style.borderColor = 'var(--danger)';
        messageText.style.background = 'rgba(255, 68, 68, 0.1)';
    }
    
    messageText.innerHTML = processContent(messageData.content);
    
    const messageActions = document.createElement('div');
    messageActions.className = 'message-actions';
    
    if (messageData.type === 'ai') {
        messageActions.innerHTML = `
            <button class="message-btn" onclick="copyMessage(this)" title="Copy">
                <i class="fas fa-copy"></i>
            </button>
            <button class="message-btn" onclick="likeMessage(this)" title="Like">
                <i class="fas fa-thumbs-up"></i>
            </button>
            <button class="message-btn" onclick="dislikeMessage(this)" title="Dislike">
                <i class="fas fa-thumbs-down"></i>
            </button>
        `;
    }
    
    messageContent.appendChild(messageText);
    messageContent.appendChild(messageActions);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    if (elements.chatMessages) {
        elements.chatMessages.appendChild(messageDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
}

// Suggestion Functions
function useSuggestion(suggestion) {
    console.log(`💡 Using suggestion: ${suggestion}`);
    
    if (elements.messageInput) {
        elements.messageInput.value = suggestion;
        handleInputChange();
        elements.messageInput.focus();
    }
}

// Theme Functions
function initializeTheme() {
    const theme = state.settings.darkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    if (elements.themeIcon) {
        elements.themeIcon.className = state.settings.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    state.settings.darkMode = !state.settings.darkMode;
    initializeTheme();
    saveSettings();
    showToast(`${state.settings.darkMode ? 'Dark' : 'Light'} mode enabled`, 'success');
}

// Settings Functions
function loadSettings() {
    try {
        const saved = localStorage.getItem('neurochat-settings');
        if (saved) {
            state.settings = { ...state.settings, ...JSON.parse(saved) };
        }
        updateSettingsUI();
        console.log('⚙️ Settings loaded');
    } catch (error) {
        console.warn('Failed to load settings:', error);
    }
}

function saveSettings() {
    try {
        localStorage.setItem('neurochat-settings', JSON.stringify(state.settings));
        console.log('💾 Settings saved');
    } catch (error) {
        console.warn('Failed to save settings:', error);
    }
}

function updateSettingsUI() {
    const temperatureSlider = document.getElementById('temperature');
    const maxTokensSlider = document.getElementById('max-tokens');
    const systemPromptTextarea = document.getElementById('system-prompt');
    const darkModeToggle = document.getElementById('dark-mode');
    
    if (temperatureSlider) {
        temperatureSlider.value = state.settings.temperature;
        const valueSpan = temperatureSlider.parentNode.querySelector('.slider-value');
        if (valueSpan) valueSpan.textContent = state.settings.temperature;
    }
    
    if (maxTokensSlider) {
        maxTokensSlider.value = state.settings.maxTokens;
        const valueSpan = maxTokensSlider.parentNode.querySelector('.slider-value');
        if (valueSpan) valueSpan.textContent = state.settings.maxTokens;
    }
    
    if (systemPromptTextarea) {
        systemPromptTextarea.value = state.settings.systemPrompt;
    }
    
    if (darkModeToggle) {
        darkModeToggle.checked = state.settings.darkMode;
    }
}

function openSettings() {
    if (elements.settingsModal) {
        elements.settingsModal.classList.add('show');
    }
}

function closeSettings() {
    if (elements.settingsModal) {
        elements.settingsModal.classList.remove('show');
    }
}

function saveSettingsFromModal() {
    saveSettings();
    closeSettings();
    showToast('Settings saved', 'success');
}

function resetSettings() {
    state.settings = {
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: 'You are a helpful, harmless, and honest AI assistant. You provide accurate information and engage in meaningful conversations while being respectful and professional.',
        darkMode: true,
        soundEffects: true
    };
    updateSettingsUI();
    saveSettings();
    initializeTheme();
    showToast('Settings reset to default', 'success');
}

// Chat History Functions
function loadChatHistory() {
    try {
        const saved = localStorage.getItem('neurochat-history');
        if (saved) {
            const historyArray = JSON.parse(saved);
            state.chatHistory = new Map(historyArray);
        }
        updateChatHistoryUI();
        console.log('📚 Chat history loaded');
    } catch (error) {
        console.warn('Failed to load chat history:', error);
    }
}

function saveChatHistory() {
    try {
        const historyArray = Array.from(state.chatHistory.entries());
        localStorage.setItem('neurochat-history', JSON.stringify(historyArray));
    } catch (error) {
        console.warn('Failed to save chat history:', error);
    }
}

function deleteChat(chatId) {
    if (confirm('Are you sure you want to delete this chat?')) {
        state.chatHistory.delete(chatId);
        
        if (chatId === state.currentChatId) {
            startNewChat();
        } else {
            updateChatHistoryUI();
        }
        
        saveChatHistory();
        showToast('Chat deleted', 'success');
    }
}

function renameChat(chatId) {
    const chat = state.chatHistory.get(chatId);
    if (!chat) return;
    
    const newTitle = prompt('Enter new chat title:', chat.title);
    if (newTitle && newTitle.trim()) {
        chat.title = newTitle.trim();
        updateChatHistoryUI();
        saveChatHistory();
        showToast('Chat renamed', 'success');
    }
}

// UI Helper Functions
function toggleSidebar() {
    if (elements.sidebar) {
        elements.sidebar.classList.toggle('show');
    }
}

function toggleModelSelector() {
    if (elements.modelDropdown) {
        elements.modelDropdown.classList.toggle('show');
    }
}

function toggleUserMenu() {
    if (elements.userMenu) {
        elements.userMenu.classList.toggle('show');
    }
}

function closeAllModals() {
    if (elements.settingsModal) {
        elements.settingsModal.classList.remove('show');
    }
    if (elements.modelDropdown) {
        elements.modelDropdown.classList.remove('show');
    }
    if (elements.userMenu) {
        elements.userMenu.classList.remove('show');
    }
}

// Message Actions
function copyMessage(button) {
    const messageText = button.closest('.message-content').querySelector('.message-text');
    const text = messageText.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.color = 'var(--success)';
        
        setTimeout(() => {
            button.innerHTML = originalIcon;
            button.style.color = '';
        }, 2000);
        
        showToast('Message copied', 'success');
    }).catch(() => {
        showToast('Failed to copy message', 'error');
    });
}

function likeMessage(button) {
    button.style.color = 'var(--success)';
    showToast('Feedback recorded', 'success');
}

function dislikeMessage(button) {
    button.style.color = 'var(--danger)';
    showToast('Feedback recorded', 'success');
}

function copyCode(button) {
    const codeContent = button.closest('.code-block').querySelector('.code-content');
    const text = codeContent.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied';
        button.style.color = 'var(--success)';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.color = '';
        }, 2000);
        
        showToast('Code copied', 'success');
    }).catch(() => {
        showToast('Failed to copy code', 'error');
    });
}

// Utility Functions
function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-title">${message}</div>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function attachFile() {
    showToast('File attachment coming soon!', 'info');
}

function shareChat() {
    showToast('Chat sharing coming soon!', 'info');
}

function viewUsage() {
    showToast('Usage statistics coming soon!', 'info');
}

function openHelp() {
    showToast('Help documentation coming soon!', 'info');
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        showToast('Logged out successfully', 'success');
        // Add logout logic here
    }
}

// Global function exposure
window.startNewChat = startNewChat;
window.sendMessage = sendMessage;
window.useSuggestion = useSuggestion;
window.toggleSidebar = toggleSidebar;
window.toggleModelSelector = toggleModelSelector;
window.toggleUserMenu = toggleUserMenu;
window.toggleTheme = toggleTheme;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettingsFromModal;
window.resetSettings = resetSettings;
window.loadChat = loadChat;
window.deleteChat = deleteChat;
window.renameChat = renameChat;
window.copyMessage = copyMessage;
window.likeMessage = likeMessage;
window.dislikeMessage = dislikeMessage;
window.copyCode = copyCode;
window.attachFile = attachFile;
window.shareChat = shareChat;
window.viewUsage = viewUsage;
window.openHelp = openHelp;
window.logout = logout;

console.log('🤖 NeuroAI JavaScript Loaded Successfully');
console.log(`👤 Current User: ${CONFIG.CURRENT_USER}`);
console.log(`📅 Current Time: ${CONFIG.CURRENT_DATE}`);