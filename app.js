// ========== app.js ==========
// ПОЛНАЯ ВЕРСИЯ МИНИ-ПРИЛОЖЕНИЯ
// С ПРОВЕРКОЙ ПРОФИЛЯ ПРИ ВХОДЕ И ГОЛОСОВЫМИ СООБЩЕНИЯМИ

// Глобальные переменные
let currentUserId = null;
let currentUser = null;
let currentStage = 1;
let currentQuestionIndex = 0;
let allAnswers = [];
let stageAnswers = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
};
let testResults = null;
let isWaitingForInterpretation = false;
let interpretationPollingInterval = null;

// ============================================
// ГОЛОСОВЫЕ ПЕРЕМЕННЫЕ
// ============================================
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingStartTime = null;
let recordingTimer = null;

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Мини-приложение запущено');
    // 🔥 ВСТАВИТЬ ЭТОТ БЛОК 🔥
    if (window.MAX?.WebApp?.initDataUnsafe?.user?.id) {
        currentUserId = window.MAX.WebApp.initDataUnsafe.user.id;
        currentUser = window.MAX.WebApp.initDataUnsafe.user;
        console.log('👤 Пользователь MAX:', currentUserId);
        window.MAX.WebApp.ready();
        window.MAX.WebApp.expand();
    }
    
    // Получаем ID пользователя из Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        currentUserId = tg.initDataUnsafe?.user?.id;
        currentUser = tg.initDataUnsafe?.user;
        
        console.log('👤 Пользователь Telegram:', currentUserId, currentUser);
        
        // Показываем кнопку "Закрыть"
        tg.MainButton.hide();
        tg.BackButton.hide();
        
        // Расширяем на весь экран
        tg.expand();
        
        // Настройка темы
        if (tg.colorScheme === 'dark') {
            document.body.classList.add('dark');
        }
    } else {
        // Для локальной разработки
        currentUserId = localStorage.getItem('userId') || 123456789;
        currentUser = { id: currentUserId, first_name: 'Тестовый' };
        console.warn('⚠️ Telegram WebApp не найден, используем тестовый режим');
    }
    
    // Загружаем сохраненное имя
    const savedName = loadUserName();
    if (savedName) {
        document.getElementById('userNameDisplay').textContent = savedName;
    } else if (currentUser?.first_name) {
        document.getElementById('userNameDisplay').textContent = currentUser.first_name;
        saveUserName(currentUserId, currentUser.first_name);
    }
    
    // Загружаем профиль пользователя при старте
    await loadUserProfileOnStart();
    
    // Настраиваем обработчики
    setupEventListeners();
});

// ============================================
// API ВЫЗОВЫ
// ============================================

const api = {
    async request(endpoint, options = {}) {
        const url = `/api${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        const config = {
            ...options,
            headers
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API Error ${endpoint}:`, error);
            throw error;
        }
    },
    
    async getUserFullStatus(userId) {
        return this.request(`/user-status?user_id=${userId}`);
    },
    
    async getUserProfile(userId) {
        return this.request(`/get-profile?user_id=${userId}`);
    },
    
    async getTestInterpretation(userId) {
        return this.request(`/get-test-interpretation?user_id=${userId}`);
    },
    
    async saveTestResults(userId, results) {
        return this.request('/save-test-results', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, results })
        });
    },
    
    async getTestQuestion(userId, stage, index) {
        return this.request(`/test/question?user_id=${userId}&stage=${stage}&index=${index}`);
    },
    
    async submitTestAnswer(userId, stage, index, answer, option) {
        return this.request('/test/answer', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, stage, question_index: index, answer, option })
        });
    },
    
    async sendQuestion(userId, message, mode = null) {
        return this.request('/chat/message', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, message, mode })
        });
    },
    
    async getPsychologistThought(userId) {
        const response = await this.request(`/thought?user_id=${userId}`);
        return response.thought;
    },
    
    async getWeekendIdeas(userId) {
        const response = await this.request(`/ideas?user_id=${userId}`);
        return response.ideas || [];
    },
    
    async getAvailableModes() {
        const response = await this.request('/modes');
        return response.modes || [];
    },
    
    async saveCommunicationMode(userId, mode) {
        return this.request('/save-mode', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, mode })
        });
    },
    
    // ============================================
    // ГОЛОСОВЫЕ API
    // ============================================
    
    async sendVoiceMessage(userId, audioBlob) {
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('voice', audioBlob, 'voice.webm');
        
        try {
            const response = await fetch('https://max-bot-1-ywpz.onrender.com/api/voice/process', {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Voice API Error:', error);
            throw error;
        }
    },
    
    async textToSpeech(text, mode = 'coach') {
        const response = await this.request('/tts', {
            method: 'POST',
            body: JSON.stringify({ text, mode })
        });
        return response;
    }
};

// ============================================
// ЛОКАЛЬНОЕ ХРАНЕНИЕ
// ============================================

function loadUserName() {
    return localStorage.getItem(`user_name_${currentUserId}`);
}

function saveUserName(userId, name) {
    localStorage.setItem(`user_name_${userId}`, name);
}

// ============================================
// ПРОВЕРКА ПРОФИЛЯ ПРИ ВХОДЕ
// ============================================

async function loadUserProfileOnStart() {
    console.log('🔄 Загрузка профиля пользователя', currentUserId);
    showLoading('Проверка данных...');
    
    try {
        const status = await api.getUserFullStatus(currentUserId);
        console.log('📊 Статус пользователя:', status);
        
        if (status.success) {
            if (status.has_interpretation && status.interpretation_ready) {
                console.log('✅ Найдена готовая интерпретация');
                const profile = await api.getUserProfile(currentUserId);
                if (profile && profile.ai_generated_profile) {
                    hideLoading();
                    showProfileScreen(profile.ai_generated_profile);
                    updateUIWithProfile();
                    return true;
                }
            }
            
            if (status.has_profile && !status.has_interpretation) {
                console.log('📊 Данные теста есть, интерпретация формируется...');
                hideLoading();
                showMessage('🧠 Ваш профиль анализируется... Это займет несколько секунд.', 'info');
                startWaitingForInterpretation();
                return false;
            }
        }
        
        const localProfile = localStorage.getItem(`profile_${currentUserId}`);
        if (localProfile) {
            console.log('📦 Найден локальный профиль');
            try {
                const profile = JSON.parse(localProfile);
                if (profile.ai_generated_profile) {
                    hideLoading();
                    showProfileScreen(profile.ai_generated_profile);
                    updateUIWithProfile();
                    return true;
                }
            } catch (e) {
                console.warn('Ошибка парсинга локального профиля:', e);
            }
        }
        
        console.log('👋 Новый пользователь');
        hideLoading();
        showWelcomeScreen();
        return false;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки профиля:', error);
        hideLoading();
        showWelcomeScreen();
        return false;
    }
}

function startWaitingForInterpretation() {
    if (isWaitingForInterpretation) return;
    
    isWaitingForInterpretation = true;
    let attempts = 0;
    const maxAttempts = 30;
    const interval = 2000;
    
    interpretationPollingInterval = setInterval(async () => {
        attempts++;
        console.log(`📡 Проверка интерпретации (${attempts}/${maxAttempts})...`);
        
        try {
            const result = await api.getTestInterpretation(currentUserId);
            
            if (result.success && result.ready && result.interpretation) {
                console.log('✅ Интерпретация получена!');
                clearInterval(interpretationPollingInterval);
                isWaitingForInterpretation = false;
                
                localStorage.setItem(`profile_${currentUserId}`, JSON.stringify({
                    ai_generated_profile: result.interpretation,
                    timestamp: Date.now()
                }));
                
                hideLoading();
                showProfileScreen(result.interpretation);
                updateUIWithProfile();
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.warn('⚠️ Таймаут ожидания интерпретации');
                clearInterval(interpretationPollingInterval);
                isWaitingForInterpretation = false;
                hideLoading();
                showMessage('Интерпретация формируется дольше обычного. Попробуйте обновить страницу позже.', 'warning');
                showWelcomeScreen();
            }
        } catch (error) {
            console.error('❌ Ошибка при опросе интерпретации:', error);
        }
    }, interval);
    
    showMessage('🧠 Анализируем ваш профиль... Пожалуйста, подождите.', 'info', true);
}

function updateUIWithProfile() {
    const startTestBtn = document.getElementById('startTestBtn');
    if (startTestBtn) startTestBtn.style.display = 'none';
    
    const profileActions = document.getElementById('profileActions');
    if (profileActions) profileActions.style.display = 'flex';
    
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.style.display = 'flex';
}

// ============================================
// СОХРАНЕНИЕ РЕЗУЛЬТАТОВ ТЕСТА
// ============================================

async function saveTestResultsToServer() {
    if (!testResults) return false;
    
    showLoading('Сохраняем результаты...');
    
    try {
        const response = await api.saveTestResults(currentUserId, testResults);
        console.log('📡 Ответ сервера:', response);
        
        if (response.success) {
            localStorage.setItem(`profile_${currentUserId}`, JSON.stringify({
                profile_data: testResults.profile_data,
                ai_generated_profile: response.interpretation,
                timestamp: Date.now()
            }));
            
            if (response.interpretation) {
                hideLoading();
                showProfileScreen(response.interpretation);
                updateUIWithProfile();
                return true;
            } else {
                hideLoading();
                startWaitingForInterpretation();
                return true;
            }
        } else {
            hideLoading();
            showMessage('Ошибка сохранения результатов. Попробуйте еще раз.', 'error');
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        hideLoading();
        showMessage('Ошибка соединения. Результаты сохранены локально.', 'warning');
        localStorage.setItem(`profile_${currentUserId}`, JSON.stringify({
            profile_data: testResults.profile_data,
            timestamp: Date.now(),
            pending_sync: true
        }));
        return true;
    }
}

// ============================================
// ЭКРАН ПРОФИЛЯ
// ============================================

function showProfileScreen(interpretation) {
    const mainContent = document.getElementById('mainContent');
    const profileContent = document.getElementById('profileContent');
    const interpretationText = document.getElementById('interpretationText');
    
    if (!interpretationText) return;
    
    let formattedText = interpretation
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    
    interpretationText.innerHTML = formattedText;
    
    if (mainContent) mainContent.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';
    
    updateActiveTab('profile');
    
    localStorage.setItem(`profile_${currentUserId}`, JSON.stringify({
        ai_generated_profile: interpretation,
        timestamp: Date.now()
    }));
}

function showWelcomeScreen() {
    const mainContent = document.getElementById('mainContent');
    const profileContent = document.getElementById('profileContent');
    const welcomeContent = document.getElementById('welcomeContent');
    
    if (mainContent) mainContent.style.display = 'none';
    if (profileContent) profileContent.style.display = 'none';
    if (welcomeContent) welcomeContent.style.display = 'block';
    
    const startTestBtn = document.getElementById('startTestBtn');
    if (startTestBtn) startTestBtn.style.display = 'block';
}

// ============================================
// UI КОМПОНЕНТЫ
// ============================================

function showLoading(message = 'Загрузка...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) loadingMessage.textContent = message;
    if (loadingOverlay) loadingOverlay.classList.add('active');
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('active');
}

function showMessage(message, type = 'info', persistent = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    if (!persistent) {
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ============================================
// ГОЛОСОВЫЕ ФУНКЦИИ
// ============================================

async function startVoiceRecording() {
    if (isRecording) {
        stopVoiceRecording();
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
        });
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(track => track.stop());
            
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await sendVoiceToServer(audioBlob);
        };
        
        mediaRecorder.start(1000);
        isRecording = true;
        recordingStartTime = Date.now();
        
        const voiceBtn = document.getElementById('voiceRecordBtn');
        if (voiceBtn) {
            voiceBtn.textContent = '⏹️';
            voiceBtn.classList.add('recording');
        }
        
        startRecordingTimer();
        
        setTimeout(() => {
            if (isRecording) {
                stopVoiceRecording();
            }
        }, 30000);
        
    } catch (error) {
        console.error('❌ Ошибка доступа к микрофону:', error);
        showMessage('Не удалось получить доступ к микрофону. Проверьте разрешения.', 'error');
    }
}

function startRecordingTimer() {
    const timerElement = document.getElementById('recordingTimer');
    if (!timerElement) return;
    
    if (recordingTimer) clearInterval(recordingTimer);
    
    recordingTimer = setInterval(() => {
        if (isRecording && recordingStartTime) {
            const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
            timerElement.textContent = `${elapsed}s`;
            timerElement.style.display = 'inline';
            
            if (elapsed >= 30) {
                timerElement.textContent = '30s';
            }
        }
    }, 1000);
}

function stopRecordingTimer() {
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
    const timerElement = document.getElementById('recordingTimer');
    if (timerElement) {
        timerElement.style.display = 'none';
        timerElement.textContent = '';
    }
}

function stopVoiceRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        stopRecordingTimer();
        
        const voiceBtn = document.getElementById('voiceRecordBtn');
        if (voiceBtn) {
            voiceBtn.textContent = '🎤';
            voiceBtn.classList.remove('recording');
        }
    }
}

async function sendVoiceToServer(audioBlob) {
    showLoading('Распознаю речь...');
    
    try {
        const formData = new FormData();
        formData.append('user_id', currentUserId);
        formData.append('voice', audioBlob, 'voice.webm');
        
        const response = await fetch('https://max-bot-1-ywpz.onrender.com/api/voice/process', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (result.recognized_text) {
                addMessageToChat(`🎤 Вы сказали: ${result.recognized_text}`, 'user');
            }
            
            if (result.answer) {
                addMessageToChat(result.answer, 'bot', result.buttons);
            }
            
            if (result.audio_url) {
                playAudioResponse(result.audio_url);
            }
        } else {
            addMessageToChat('Не удалось распознать голос. Попробуйте еще раз.', 'bot');
        }
    } catch (error) {
        console.error('❌ Ошибка отправки голоса:', error);
        addMessageToChat('Ошибка при обработке голосового сообщения. Попробуйте позже.', 'bot');
    }
    
    hideLoading();
}

function playAudioResponse(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.error('Ошибка воспроизведения:', e));
}

// ============================================
// НАВИГАЦИЯ
// ============================================

function setupEventListeners() {
    const startTestBtn = document.getElementById('startTestBtn');
    if (startTestBtn) {
        startTestBtn.addEventListener('click', () => startTest());
    }
    
    const showProfileBtn = document.getElementById('showProfileBtn');
    if (showProfileBtn) {
        showProfileBtn.addEventListener('click', async () => {
            showLoading('Загрузка профиля...');
            const profile = await api.getUserProfile(currentUserId);
            if (profile && profile.ai_generated_profile) {
                showProfileScreen(profile.ai_generated_profile);
            } else {
                showMessage('Профиль еще не готов', 'warning');
            }
            hideLoading();
        });
    }
    
    const retestBtn = document.getElementById('retestBtn');
    if (retestBtn) {
        retestBtn.addEventListener('click', () => startTest());
    }
    
    const voiceRecordBtn = document.getElementById('voiceRecordBtn');
    if (voiceRecordBtn) {
        voiceRecordBtn.addEventListener('click', () => startVoiceRecording());
    }
    
    const navProfile = document.getElementById('navProfile');
    const navChat = document.getElementById('navChat');
    const navModes = document.getElementById('navModes');
    
    if (navProfile) navProfile.addEventListener('click', () => showProfileFromNav());
    if (navChat) navChat.addEventListener('click', () => showChatScreen());
    if (navModes) navModes.addEventListener('click', () => showModesScreen());
    
    const sendBtn = document.getElementById('sendMessageBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => sendChatMessage());
    }
    
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
}

async function showProfileFromNav() {
    showLoading('Загрузка...');
    
    const status = await api.getUserFullStatus(currentUserId);
    
    if (status.has_interpretation) {
        const profile = await api.getUserProfile(currentUserId);
        if (profile && profile.ai_generated_profile) {
            showProfileScreen(profile.ai_generated_profile);
        }
    } else if (status.has_profile) {
        showMessage('Интерпретация формируется...', 'info');
        startWaitingForInterpretation();
    } else {
        showWelcomeScreen();
    }
    
    hideLoading();
}

function showChatScreen() {
    const mainContent = document.getElementById('mainContent');
    const profileContent = document.getElementById('profileContent');
    const welcomeContent = document.getElementById('welcomeContent');
    const testContent = document.getElementById('testContent');
    const chatContent = document.getElementById('chatContent');
    const modesContent = document.getElementById('modesContent');
    
    if (mainContent) mainContent.style.display = 'none';
    if (profileContent) profileContent.style.display = 'none';
    if (welcomeContent) welcomeContent.style.display = 'none';
    if (testContent) testContent.style.display = 'none';
    if (modesContent) modesContent.style.display = 'none';
    if (chatContent) chatContent.style.display = 'block';
    
    updateActiveTab('chat');
}

function showModesScreen() {
    const mainContent = document.getElementById('mainContent');
    const profileContent = document.getElementById('profileContent');
    const welcomeContent = document.getElementById('welcomeContent');
    const testContent = document.getElementById('testContent');
    const chatContent = document.getElementById('chatContent');
    const modesContent = document.getElementById('modesContent');
    
    if (mainContent) mainContent.style.display = 'none';
    if (profileContent) profileContent.style.display = 'none';
    if (welcomeContent) welcomeContent.style.display = 'none';
    if (testContent) testContent.style.display = 'none';
    if (chatContent) chatContent.style.display = 'none';
    if (modesContent) modesContent.style.display = 'block';
    
    updateActiveTab('modes');
    loadModes();
}

async function loadModes() {
    const modesList = document.getElementById('modesList');
    if (!modesList) return;
    
    showLoading('Загрузка режимов...');
    
    try {
        const modes = await api.getAvailableModes();
        modesList.innerHTML = '';
        
        for (const mode of modes) {
            const modeCard = document.createElement('div');
            modeCard.className = 'mode-card';
            modeCard.innerHTML = `
                <div class="mode-emoji">${mode.emoji}</div>
                <div class="mode-name">${mode.name}</div>
                <div class="mode-description">${mode.description}</div>
                <button class="mode-select-btn" data-mode="${mode.id}">Выбрать</button>
            `;
            
            const selectBtn = modeCard.querySelector('.mode-select-btn');
            selectBtn.addEventListener('click', () => selectMode(mode.id));
            
            modesList.appendChild(modeCard);
        }
    } catch (error) {
        console.error('Ошибка загрузки режимов:', error);
        modesList.innerHTML = '<p>Ошибка загрузки режимов</p>';
    }
    
    hideLoading();
}

async function selectMode(mode) {
    showLoading('Сохранение режима...');
    
    try {
        const result = await api.saveCommunicationMode(currentUserId, mode);
        if (result.success) {
            showMessage(`Режим ${mode} выбран!`, 'success');
            showChatScreen();
        } else {
            showMessage('Ошибка сохранения режима', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка соединения', 'error');
    }
    
    hideLoading();
}

async function sendChatMessage() {
    const input = document.getElementById('messageInput');
    const message = input?.value.trim();
    if (!message) return;
    
    input.value = '';
    addMessageToChat(message, 'user');
    
    showLoading('Думаю...');
    
    try {
        const response = await api.sendQuestion(currentUserId, message);
        if (response.success) {
            addMessageToChat(response.response, 'bot', response.buttons);
        } else {
            addMessageToChat('Извините, произошла ошибка. Попробуйте позже.', 'bot');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        addMessageToChat('Ошибка соединения. Попробуйте позже.', 'bot');
    }
    
    hideLoading();
}

function addMessageToChat(text, sender, buttons = null) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <div class="message-text">${formattedText}</div>
        ${buttons ? '<div class="message-buttons"></div>' : ''}
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    if (buttons && buttons.length > 0) {
        const buttonsContainer = messageDiv.querySelector('.message-buttons');
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'chat-btn';
            button.textContent = btn.text;
            button.onclick = () => handleChatAction(btn.action, btn.data);
            buttonsContainer.appendChild(button);
        });
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleChatAction(action, data) {
    if (action === 'start_test') startTest();
    else if (action === 'show_profile') showProfileFromNav();
    else if (action === 'show_thoughts') showPsychologistThought();
    else if (action === 'show_weekend') showWeekendIdeas();
}

async function showPsychologistThought() {
    showLoading('Загрузка...');
    try {
        const thought = await api.getPsychologistThought(currentUserId);
        addMessageToChat(thought || 'Мысли психолога еще не сгенерированы.', 'bot');
    } catch (error) {
        addMessageToChat('Ошибка загрузки мыслей психолога', 'bot');
    }
    hideLoading();
}

async function showWeekendIdeas() {
    showLoading('Генерация идей...');
    try {
        const ideas = await api.getWeekendIdeas(currentUserId);
        if (ideas && ideas.length > 0) {
            let text = '🎨 **Идеи на выходные:**\n\n';
            ideas.forEach((idea, idx) => {
                text += `${idx + 1}. ${idea.title || idea.description}\n`;
            });
            addMessageToChat(text, 'bot');
        } else {
            addMessageToChat('Пока нет идей для вас. Пройдите тест, чтобы я лучше понимал ваш профиль.', 'bot');
        }
    } catch (error) {
        addMessageToChat('Ошибка генерации идей', 'bot');
    }
    hideLoading();
}

function updateActiveTab(tab) {
    const navProfile = document.getElementById('navProfile');
    const navChat = document.getElementById('navChat');
    const navModes = document.getElementById('navModes');
    
    if (navProfile) navProfile.classList.remove('active');
    if (navChat) navChat.classList.remove('active');
    if (navModes) navModes.classList.remove('active');
    
    if (tab === 'profile' && navProfile) navProfile.classList.add('active');
    if (tab === 'chat' && navChat) navChat.classList.add('active');
    if (tab === 'modes' && navModes) navModes.classList.add('active');
}

// ============================================
// ТЕСТ
// ============================================

function startTest() {
    currentStage = 1;
    currentQuestionIndex = 0;
    allAnswers = [];
    stageAnswers = {1: [], 2: [], 3: [], 4: [], 5: []};
    testResults = null;
    
    const welcomeContent = document.getElementById('welcomeContent');
    const profileContent = document.getElementById('profileContent');
    const mainContent = document.getElementById('mainContent');
    const testContent = document.getElementById('testContent');
    const chatContent = document.getElementById('chatContent');
    const modesContent = document.getElementById('modesContent');
    
    if (welcomeContent) welcomeContent.style.display = 'none';
    if (profileContent) profileContent.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    if (chatContent) chatContent.style.display = 'none';
    if (modesContent) modesContent.style.display = 'none';
    if (testContent) testContent.style.display = 'block';
    
    loadQuestion(1, 0);
}

async function loadQuestion(stage, index) {
    currentStage = stage;
    currentQuestionIndex = index;
    
    showLoading('Загрузка вопроса...');
    
    try {
        const question = await api.getTestQuestion(currentUserId, stage, index);
        if (question.success) {
            displayQuestion(question);
        } else {
            showMessage('Ошибка загрузки вопроса', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка соединения', 'error');
    }
    
    hideLoading();
}

function displayQuestion(question) {
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const progress = document.getElementById('testProgress');
    const stageIndicator = document.getElementById('stageIndicator');
    
    if (questionText) questionText.textContent = question.text;
    if (stageIndicator) stageIndicator.textContent = `Этап ${question.stage}/5`;
    
    if (progress) {
        const percent = ((question.index + 1) / question.total) * 100;
        progress.style.width = `${percent}%`;
        progress.textContent = `${question.index + 1}/${question.total}`;
    }
    
    if (optionsContainer && question.options) {
        optionsContainer.innerHTML = '';
        question.options.forEach((option, idx) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = `${option.id}. ${option.text}`;
            button.onclick = () => submitAnswer(question.stage, question.index, option.text, option.value);
            optionsContainer.appendChild(button);
        });
    }
}

async function submitAnswer(stage, index, answerText, answerValue) {
    showLoading('Сохранение...');
    
    try {
        const result = await api.submitTestAnswer(currentUserId, stage, index, answerText, answerValue);
        
        if (result.success) {
            allAnswers.push({
                stage: stage,
                question_index: index,
                answer: answerText,
                option: answerValue,
                timestamp: new Date().toISOString()
            });
            
            stageAnswers[stage].push({
                index: index,
                answer: answerText,
                option: answerValue
            });
            
            const nextIndex = index + 1;
            const stageTotal = {1: 4, 2: 6, 3: 24, 4: 12, 5: 8}[stage];
            
            if (nextIndex < stageTotal) {
                await loadQuestion(stage, nextIndex);
            } else if (stage < 5) {
                await loadQuestion(stage + 1, 0);
            } else {
                await completeTest();
            }
        } else {
            showMessage('Ошибка сохранения ответа', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('Ошибка соединения', 'error');
    }
    
    hideLoading();
}

async function completeTest() {
    showLoading('Формируем результаты...');
    
    testResults = {
        all_answers: allAnswers,
        stage1_answers: stageAnswers[1],
        stage2_answers: stageAnswers[2],
        stage3_answers: stageAnswers[3],
        stage4_answers: stageAnswers[4],
        stage5_answers: stageAnswers[5],
        perception_type: calculatePerceptionType(),
        thinking_level: calculateThinkingLevel(),
        behavioral_levels: calculateBehavioralLevels(),
        deep_patterns: calculateDeepPatterns(),
        profile_data: calculateProfileData(),
        completed_at: new Date().toISOString()
    };
    
    const saved = await saveTestResultsToServer();
    
    if (saved) {
        const testContent = document.getElementById('testContent');
        if (testContent) testContent.style.display = 'none';
    }
    
    hideLoading();
}

function calculatePerceptionType() {
    const scores = { visual: 0, kinesthetic: 0, auditory: 0, digital: 0 };
    stageAnswers[1].forEach(answer => {
        const option = answer.option;
        if (option === 'visual') scores.visual++;
        if (option === 'kinesthetic') scores.kinesthetic++;
        if (option === 'auditory') scores.auditory++;
        if (option === 'digital') scores.digital++;
    });
    const maxType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const types = { visual: 'ВИЗУАЛЬНЫЙ', kinesthetic: 'КИНЕСТЕТИЧЕСКИЙ', auditory: 'АУДИАЛЬНЫЙ', digital: 'ДИГИТАЛЬНЫЙ' };
    return types[maxType] || 'СМЕШАННЫЙ';
}

function calculateThinkingLevel() {
    let sum = 0;
    stageAnswers[2].forEach(answer => sum += parseInt(answer.option) || 3);
    return Math.round(sum / stageAnswers[2].length) || 5;
}

function calculateBehavioralLevels() {
    const levels = { "СБ": [], "ТФ": [], "УБ": [], "ЧВ": [] };
    const vectorMap = { 0: "СБ", 1: "СБ", 2: "СБ", 3: "ТФ", 4: "ТФ", 5: "ТФ", 6: "УБ", 7: "УБ", 8: "УБ", 9: "ЧВ", 10: "ЧВ", 11: "ЧВ", 12: "СБ", 13: "ТФ", 14: "УБ", 15: "ЧВ", 16: "СБ", 17: "ТФ", 18: "УБ", 19: "ЧВ", 20: "СБ", 21: "ТФ", 22: "УБ", 23: "ЧВ" };
    
    stageAnswers[3].forEach((answer, idx) => {
        const vector = vectorMap[idx] || "СБ";
        const value = parseInt(answer.option) || 3;
        if (!levels[vector]) levels[vector] = [];
        levels[vector].push(value);
    });
    
    for (const key of ["СБ", "ТФ", "УБ", "ЧВ"]) {
        if (!levels[key] || levels[key].length === 0) levels[key] = [3, 3, 3, 3, 3, 3];
        while (levels[key].length < 6) levels[key].push(3);
    }
    return levels;
}

function calculateDeepPatterns() {
    return {
        attachment: "надежный",
        defense_mechanisms: ["интеллектуализация"],
        core_fears: ["потеря контроля"],
        core_beliefs: ["я справлюсь"],
        stress_response: "анализ",
        core_values: ["честность"],
        anger_style: "анализ",
        social_role: "наблюдатель",
        criticism_response: "анализ",
        core_issue: "поиск смысла"
    };
}

function calculateProfileData() {
    const behavioral = calculateBehavioralLevels();
    const sb = Math.round(behavioral["СБ"].reduce((s, v) => s + v, 0) / 6 * 10) / 10;
    const tf = Math.round(behavioral["ТФ"].reduce((s, v) => s + v, 0) / 6 * 10) / 10;
    const ub = Math.round(behavioral["УБ"].reduce((s, v) => s + v, 0) / 6 * 10) / 10;
    const chv = Math.round(behavioral["ЧВ"].reduce((s, v) => s + v, 0) / 6 * 10) / 10;
    
    return {
        display_name: `СБ-${Math.round(sb)}_ТФ-${Math.round(tf)}_УБ-${Math.round(ub)}_ЧВ-${Math.round(chv)}`,
        sb_level: sb,
        tf_level: tf,
        ub_level: ub,
        chv_level: chv
    };
}

// ============================================
// ЭКСПОРТ ГЛОБАЛЬНЫХ ФУНКЦИЙ
// ============================================

window.startTest = startTest;
window.showProfile = showProfileFromNav;
window.showChat = showChatScreen;
window.showModes = showModesScreen;
window.sendChatMessage = sendChatMessage;
window.startVoiceRecording = startVoiceRecording;
