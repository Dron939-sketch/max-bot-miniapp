// app.js - Главный файл приложения
const App = {
    userId: null,
    userName: 'Гость',
    userContext: { city: null, gender: null, age: null },
    profileData: null,
    currentMode: 'coach',
    isWaitingForInterpretation: false,
    interpretationPollingInterval: null,
    
    async init() {
        console.log('🚀 App: инициализация');
        
        // 1. Получаем данные пользователя
        const authData = await Auth.init();
        this.userId = authData.userId;
        this.userName = authData.userName;
        UI.updateUserNameInUI(this.userName);
        
        // 2. Загружаем данные с бэкенда
        await this.loadUserData();
        
        // 3. Показываем нужный экран
        await this.checkUserStatus();
        
        // 4. Настраиваем обработчики
        this.setupEventListeners();
        
        // 5. Инициализируем голосовой ввод
        Voice.init();
        
        console.log('✅ App инициализирован, userId:', this.userId);
    },
    
    async loadUserData() {
        try {
            const status = await API.getUserFullStatus(this.userId);
            console.log('📊 Статус пользователя:', status);
            
            if (status.success && status.has_interpretation && status.interpretation_ready) {
                const profile = await API.getUserProfile(this.userId);
                if (profile?.ai_generated_profile) {
                    this.profileData = profile.profile_data;
                    return;
                }
            }
            
            if (status.success && status.has_profile && !status.has_interpretation) {
                this.startWaitingForInterpretation();
                return;
            }
            
            const localProfile = localStorage.getItem(`profile_${this.userId}`);
            if (localProfile) {
                const profile = JSON.parse(localProfile);
                if (profile.ai_generated_profile) {
                    this.profileData = profile.profile_data;
                }
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки данных:', error);
        }
    },
    
    startWaitingForInterpretation() {
        if (this.isWaitingForInterpretation) return;
        
        this.isWaitingForInterpretation = true;
        let attempts = 0;
        const maxAttempts = 30;
        
        this.interpretationPollingInterval = setInterval(async () => {
            attempts++;
            console.log(`📡 Проверка интерпретации (${attempts}/${maxAttempts})...`);
            
            try {
                const result = await API.getTestInterpretation(this.userId);
                
                if (result.success && result.ready && result.interpretation) {
                    clearInterval(this.interpretationPollingInterval);
                    this.isWaitingForInterpretation = false;
                    
                    localStorage.setItem(`profile_${this.userId}`, JSON.stringify({
                        ai_generated_profile: result.interpretation,
                        timestamp: Date.now()
                    }));
                    
                    await this.showFinalProfile();
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(this.interpretationPollingInterval);
                    this.isWaitingForInterpretation = false;
                    UI.showToast('Интерпретация формируется дольше обычного', 'warning');
                    this.showCompleteScreen();
                }
            } catch (error) {
                console.error('Ошибка:', error);
            }
        }, 2000);
        
        UI.showToast('🧠 Анализируем ваш профиль...', 'info', 5000);
    },
    
    async checkUserStatus() {
        if (this.profileData) {
            await this.showFinalProfile();
            return;
        }
        
        const hasContext = this.userContext.city || this.userContext.gender || this.userContext.age;
        if (!hasContext) {
            this.showOnboardingScreen1();
        } else {
            this.showCompleteScreen();
        }
    },
    
    showOnboardingScreen1() {
        const template = document.getElementById('onboardingScreen1');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        const nameSpan = clone.querySelector('#userNamePlaceholder');
        if (nameSpan) nameSpan.textContent = this.userName;
        
        UI.setScreenContent('');
        document.getElementById('screenContainer').appendChild(clone);
        
        setTimeout(() => {
            const startBtn = document.getElementById('startTestBtn');
            const whoBtn = document.getElementById('whoAreYouBtn');
            if (startBtn) startBtn.addEventListener('click', () => this.showContextScreen('city'));
            if (whoBtn) whoBtn.addEventListener('click', () => this.showOnboardingScreen2());
        }, 100);
    },
    
    showOnboardingScreen2() {
        const template = document.getElementById('onboardingScreen2');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        UI.setScreenContent('');
        document.getElementById('screenContainer').appendChild(clone);
        
        setTimeout(() => {
            const letsGoBtn = document.getElementById('letsGoBtn');
            if (letsGoBtn) letsGoBtn.addEventListener('click', () => this.showContextScreen('city'));
        }, 100);
    },
    
    showContextScreen(type) {
        const templates = {
            city: 'contextCityScreen',
            gender: 'contextGenderScreen',
            age: 'contextAgeScreen'
        };
        
        const template = document.getElementById(templates[type] || 'contextCityScreen');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        UI.setScreenContent('');
        document.getElementById('screenContainer').appendChild(clone);
        
        this.setupContextHandlers(type);
    },
    
    setupContextHandlers(type) {
        setTimeout(() => {
            if (type === 'city') {
                const submitBtn = document.getElementById('submitCityBtn');
                const input = document.getElementById('cityInput');
                const skipBtn = document.getElementById('skipContextBtn');
                
                if (submitBtn && input) {
                    submitBtn.addEventListener('click', () => {
                        const city = input.value.trim();
                        if (city) {
                            this.userContext.city = city;
                            API.saveContext(this.userId, { city });
                            this.showContextScreen('gender');
                        } else {
                            UI.showToast('Введите название города', 'warning');
                        }
                    });
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') submitBtn.click();
                    });
                }
                if (skipBtn) skipBtn.addEventListener('click', () => this.showContextScreen('gender'));
            }
            
            if (type === 'gender') {
                const maleBtn = document.getElementById('genderMaleBtn');
                const femaleBtn = document.getElementById('genderFemaleBtn');
                const skipBtn = document.getElementById('skipGenderBtn');
                
                if (maleBtn) maleBtn.addEventListener('click', () => {
                    this.userContext.gender = 'male';
                    API.saveContext(this.userId, { gender: 'male' });
                    this.showContextScreen('age');
                });
                if (femaleBtn) femaleBtn.addEventListener('click', () => {
                    this.userContext.gender = 'female';
                    API.saveContext(this.userId, { gender: 'female' });
                    this.showContextScreen('age');
                });
                if (skipBtn) skipBtn.addEventListener('click', () => this.showContextScreen('age'));
            }
            
            if (type === 'age') {
                const submitBtn = document.getElementById('submitAgeBtn');
                const input = document.getElementById('ageInput');
                const skipBtn = document.getElementById('skipAgeBtn');
                
                if (submitBtn && input) {
                    submitBtn.addEventListener('click', () => {
                        const age = parseInt(input.value);
                        if (age && age > 0 && age < 120) {
                            this.userContext.age = age;
                            API.saveContext(this.userId, { age });
                            this.showCompleteScreen();
                        } else {
                            UI.showToast('Введите корректный возраст', 'warning');
                        }
                    });
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') submitBtn.click();
                    });
                }
                if (skipBtn) skipBtn.addEventListener('click', () => this.showCompleteScreen());
            }
        }, 100);
    },
    
    showCompleteScreen() {
        const template = document.getElementById('contextCompleteScreen');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        
        const citySpan = clone.querySelector('#infoCity');
        const genderSpan = clone.querySelector('#infoGender');
        const ageSpan = clone.querySelector('#infoAge');
        
        if (citySpan) citySpan.textContent = this.userContext.city || 'не указан';
        if (genderSpan) {
            const genderText = this.userContext.gender === 'male' ? 'Мужчина' : 
                              this.userContext.gender === 'female' ? 'Женщина' : 'не указан';
            genderSpan.textContent = genderText;
        }
        if (ageSpan) ageSpan.textContent = this.userContext.age || 'не указан';
        
        UI.setScreenContent('');
        document.getElementById('screenContainer').appendChild(clone);
        
        setTimeout(() => {
            const startTestBtn = document.getElementById('startRealTestBtn');
            const whatGivesBtn = document.getElementById('whatTestGivesBtn');
            const askQuestionBtn = document.getElementById('askQuestionPreBtn');
            
            if (startTestBtn) startTestBtn.addEventListener('click', () => this.startTest());
            if (whatGivesBtn) whatGivesBtn.addEventListener('click', () => this.showBenefitsScreen());
            if (askQuestionBtn) askQuestionBtn.addEventListener('click', () => this.showMainChat());
        }, 100);
    },
    
    showBenefitsScreen() {
        const template = document.getElementById('benefitsScreen');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        UI.setScreenContent('');
        document.getElementById('screenContainer').appendChild(clone);
        
        setTimeout(() => {
            const startTestBtn = document.getElementById('startTestFromBenefitsBtn');
            const backBtn = document.getElementById('backToContextBtn');
            if (startTestBtn) startTestBtn.addEventListener('click', () => this.startTest());
            if (backBtn) backBtn.addEventListener('click', () => this.showCompleteScreen());
        }, 100);
    },
    
    startTest() {
        if (typeof Test !== 'undefined') {
            Test.init(this.userId);
            Test.start();
        } else {
            UI.showToast('Тест будет запущен!', 'info');
        }
    },
    
    async showFinalProfile() {
        console.log('📊 Показываем финальный профиль');
        
        const template = document.getElementById('finalProfileScreen');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        const profileTextDiv = clone.querySelector('#profileText');
        
        let profileHtml = '';
        if (this.profileData) {
            const profileCode = this.profileData.display_name || 'СБ-4_ТФ-4_УБ-4_ЧВ-4';
            profileHtml = `
                <div class="profile-section"><h3>🧠 Твой профиль: ${profileCode}</h3></div>
                <div class="profile-section"><h4>🎭 Восприятие</h4><p>${this.getPerceptionDescription()}</p></div>
                <div class="profile-section"><h4>💭 Мышление</h4><p>${this.getThinkingDescription()}</p></div>
                <div class="profile-section"><h4>⚡ Поведение</h4><p>${this.getBehaviorDescription(this.profileData.scores || {})}</p></div>
                <div class="profile-section"><h4>🎯 Точка роста</h4><p>${this.getGrowthPoint(this.profileData.scores || {})}</p></div>
            `;
        } else {
            profileHtml = `<div class="profile-section"><p>🧠 Психологический портрет формируется...</p></div>`;
        }
        
        if (profileTextDiv) profileTextDiv.innerHTML = profileHtml;
        
        UI.setScreenContent('');
        document.getElementById('screenContainer').appendChild(clone);
        
        const chatHeader = document.getElementById('chatHeader');
        if (chatHeader) chatHeader.style.display = 'flex';
        
        const botStatus = document.getElementById('botStatus');
        if (botStatus) {
            const modeNames = { coach: '🔮 коуч', psychologist: '🧠 психолог', trainer: '⚡ тренер' };
            botStatus.textContent = modeNames[this.currentMode] || '🧠 психолог';
        }
        
        this.setupProfileButtons();
    },
    
    setupProfileButtons() {
        setTimeout(() => {
            const thoughtBtn = document.getElementById('psychologistThoughtBtn');
            const askBtn = document.getElementById('askQuestionBtn');
            const goalBtn = document.getElementById('chooseGoalBtn');
            const modeBtn = document.getElementById('chooseModeBtn');
            
            if (thoughtBtn) thoughtBtn.addEventListener('click', () => this.showPsychologistThought());
            if (askBtn) askBtn.addEventListener('click', () => this.showAskQuestionScreen());
            if (goalBtn) goalBtn.addEventListener('click', () => this.showChooseGoalScreen());
            if (modeBtn) modeBtn.addEventListener('click', () => this.showChooseModeScreen());
            
            const smartQuestionsBtn = document.createElement('button');
            smartQuestionsBtn.className = 'onboarding-btn secondary';
            smartQuestionsBtn.textContent = '❓ УМНЫЕ ВОПРОСЫ';
            smartQuestionsBtn.style.marginTop = '12px';
            smartQuestionsBtn.addEventListener('click', () => this.showSmartQuestions());
            
            const profileButtons = document.querySelector('.profile-buttons');
            if (profileButtons) profileButtons.appendChild(smartQuestionsBtn);
        }, 100);
    },
    
    getPerceptionDescription() {
        const perceptionType = this.profileData?.perception_type || 'СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ';
        const descriptions = {
            'СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ': 'Ты тонко чувствуешь настроение окружающих. Часто ориентируешься на мнение других.',
            'ИНТРОВЕРТИРОВАННЫЙ': 'Твой внутренний мир богаче внешнего. Ты много рефлексируешь, анализируешь.',
            'СИМВОЛИЧЕСКИЙ': 'Ты видишь знаки и смыслы там, где другие видят случайности.',
            'МАТЕРИАЛИСТИЧНЫЙ': 'Ты ценишь факты, доказательства, практичность.'
        };
        return descriptions[perceptionType] || descriptions['СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ'];
    },
    
    getThinkingDescription() {
        const thinkingLevel = this.profileData?.thinking_level || 5;
        if (thinkingLevel <= 3) return 'Ты склонен к быстрым, интуитивным решениям.';
        if (thinkingLevel <= 6) return 'Ты умеешь анализировать, видишь причинно-следственные связи.';
        return 'Твоё мышление системное, ты видишь сложные взаимосвязи.';
    },
    
    getBehaviorDescription(scores) {
        const sb = scores['СБ'] || 3, tf = scores['ТФ'] || 3, ub = scores['УБ'] || 3, chv = scores['ЧВ'] || 3;
        let desc = '';
        if (sb <= 2) desc += '• Давление выбивает из колеи. ';
        if (tf <= 2) desc += '• С деньгами сложно. ';
        if (ub <= 2) desc += '• Мир кажется хаотичным. ';
        if (chv <= 2) desc += '• Отношения напрягают. ';
        return desc || 'Сбалансированный профиль, есть куда расти.';
    },
    
    getGrowthPoint(scores) {
        const vectors = ['СБ', 'ТФ', 'УБ', 'ЧВ'];
        let minVector = 'СБ', minValue = 5;
        for (const v of vectors) {
            const val = scores[v] || 3;
            if (val < minValue) { minValue = val; minVector = v; }
        }
        const growthPoints = {
            'СБ': 'Работа с реакцией на давление и страхи.',
            'ТФ': 'Проработка денежных блоков.',
            'УБ': 'Развитие системного мышления.',
            'ЧВ': 'Исцеление привязанности.'
        };
        return growthPoints[minVector] || 'Исследование себя и своих паттернов.';
    },
    
    showMainChat() {
        const chatHeader = document.getElementById('chatHeader');
        if (chatHeader) chatHeader.style.display = 'flex';
        
        UI.setScreenContent(`
            <div class="messages-container">
                <div class="messages-list" id="messagesList">
                    <div class="message bot-message">
                        <div class="message-bubble">
                            <div class="message-text">Привет, ${this.userName}! Чем могу помочь?</div>
                            <div class="message-time">только что</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="input-panel">
                <button class="attach-btn" id="attachBtn">📎</button>
                <div class="message-input-wrapper">
                    <input type="text" class="message-input" placeholder="Сообщение..." id="messageInput">
                    <button class="send-btn" id="sendMessageBtn">➡️</button>
                </div>
                <button class="voice-btn" id="voiceBtn">🎤</button>
            </div>
        `);
        
        this.addChatStyles();
        this.setupChatHandlers();
    },
    
    addChatStyles() {
        if (document.getElementById('chatStyles')) return;
        const style = document.createElement('style');
        style.id = 'chatStyles';
        style.textContent = `
            .messages-container { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; }
            .messages-list { display: flex; flex-direction: column; gap: 12px; }
            .message { display: flex; width: 100%; }
            .message.user-message { justify-content: flex-end; }
            .message.bot-message { justify-content: flex-start; }
            .message-bubble { max-width: 80%; padding: 12px 16px; border-radius: 18px; position: relative; }
            .user-message .message-bubble { background: var(--max-message-user); border-bottom-right-radius: 4px; }
            .bot-message .message-bubble { background: var(--max-message-bot); border-bottom-left-radius: 4px; }
            .message-text { font-size: 15px; line-height: 1.4; }
            .message-time { font-size: 10px; color: var(--max-text-secondary); margin-top: 4px; text-align: right; }
            .input-panel { padding: 12px 16px; background: var(--max-panel-bg); border-top: 1px solid var(--max-border); display: flex; gap: 8px; align-items: center; }
            .attach-btn, .voice-btn { width: 40px; height: 40px; border-radius: 50%; background: var(--glass-bg); border: none; color: var(--max-text); font-size: 20px; cursor: pointer; }
            .message-input-wrapper { flex: 1; display: flex; gap: 8px; background: var(--glass-bg); border-radius: 24px; padding: 4px 4px 4px 16px; }
            .message-input { flex: 1; background: transparent; border: none; color: var(--max-text); font-size: 16px; outline: none; padding: 8px 0; }
            .send-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--max-blue); border: none; color: white; font-size: 18px; cursor: pointer; }
        `;
        document.head.appendChild(style);
    },
    
    setupChatHandlers() {
        setTimeout(() => {
            const sendBtn = document.getElementById('sendMessageBtn');
            const messageInput = document.getElementById('messageInput');
            const voiceBtn = document.getElementById('voiceBtn');
            
            const sendMessage = async () => {
                const text = messageInput.value.trim();
                if (text) {
                    UI.addMessageToChat(text, 'user');
                    messageInput.value = '';
                    UI.showLoading('Думаю...');
                    const result = await API.sendQuestion(this.userId, text);
                    UI.hideLoading();
                    if (result.success) {
                        UI.addMessageToChat(result.response, 'bot');
                    } else {
                        UI.addMessageToChat('Извините, произошла ошибка. Попробуйте позже.', 'bot');
                    }
                }
            };
            
            if (sendBtn) sendBtn.addEventListener('click', sendMessage);
            if (messageInput) messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
            if (voiceBtn) voiceBtn.addEventListener('click', () => {
                Voice.start(async (text) => {
                    UI.addMessageToChat(text, 'user');
                    UI.showLoading('Думаю...');
                    const result = await API.sendQuestion(this.userId, text);
                    UI.hideLoading();
                    if (result.success) {
                        UI.addMessageToChat(result.response, 'bot');
                    } else {
                        UI.addMessageToChat('Извините, произошла ошибка.', 'bot');
                    }
                });
            });
        }, 100);
    },
    
    showAskQuestionScreen() {
        const template = document.getElementById('askQuestionScreen');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        UI.setScreenContent('');
        document.getElementById('screenContainer').appendChild(clone);
        
        setTimeout(() => {
            const sendBtn = document.getElementById('sendQuestionBtn');
            const questionInput = document.getElementById('questionInput');
            const backBtn = document.getElementById('backToProfileBtn');
            
            const sendQuestion = async () => {
                const question = questionInput.value.trim();
                if (question) {
                    UI.showLoading('Думаю...');
                    const result = await API.sendQuestion(this.userId, question);
                    UI.hideLoading();
                    if (result.success) {
                        UI.addMessageToChat(result.response, 'bot');
                        questionInput.value = '';
                    } else {
                        UI.showToast('Ошибка отправки вопроса', 'error');
                    }
                }
            };
            
            if (sendBtn) sendBtn.addEventListener('click', sendQuestion);
            if (questionInput) questionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendQuestion();
            });
            if (backBtn) backBtn.addEventListener('click', () => this.showFinalProfile());
            
            // Голосовая кнопка
            const voiceButton = document.createElement('button');
            voiceButton.innerHTML = '🎤';
            voiceButton.style.cssText = `width:48px;height:48px;border-radius:50%;background:var(--max-blue);border:none;color:white;font-size:24px;cursor:pointer;margin-left:8px;`;
            voiceButton.addEventListener('click', () => {
                Voice.start(async (text) => {
                    questionInput.value = text;
                    sendQuestion();
                });
            });
            const inputGroup = document.querySelector('.input-group');
            if (inputGroup) inputGroup.appendChild(voiceButton);
        }, 100);
    },
    
    async showPsychologistThought() {
        UI.showLoading('Анализирую...');
        const result = await API.getThought(this.userId);
        UI.hideLoading();
        
        if (result.thought) {
            UI.setScreenContent(`
                <div class="thought-container" style="padding: 20px;">
                    <h2 style="text-align:center;">🧠 МЫСЛИ ПСИХОЛОГА</h2>
                    <div style="background: var(--glass-bg); border-radius: 20px; padding: 20px; margin: 20px 0;">
                        ${result.thought.replace(/\n/g, '<br>')}
                    </div>
                    <button id="backToProfileFromThoughtBtn" class="onboarding-btn secondary">◀️ НАЗАД</button>
                </div>
            `);
            document.getElementById('backToProfileFromThoughtBtn')?.addEventListener('click', () => this.showFinalProfile());
        } else {
            UI.showToast('Не удалось сгенерировать мысли психолога', 'error');
        }
    },
    
    async showChooseGoalScreen() {
        UI.showLoading('Загрузка целей...');
        const result = await API.getGoals(this.userId, this.currentMode);
        UI.hideLoading();
        
        const goals = result.goals || [];
        
        UI.setScreenContent(`
            <div style="padding: 20px;">
                <h2 style="text-align:center;">🎯 ВЫБЕРИ ЦЕЛЬ</h2>
                <p style="text-align:center; color: var(--max-text-secondary);">${this.userName}, вот цели, которые подходят твоему профилю</p>
                <div id="goalsList" style="margin: 20px 0;"></div>
                <button id="customGoalBtn" class="onboarding-btn secondary" style="width:100%; margin-bottom: 12px;">✏️ СВОЯ ЦЕЛЬ</button>
                <button id="backToProfileFromGoalBtn" class="onboarding-btn secondary" style="width:100%;">◀️ НАЗАД</button>
            </div>
        `);
        
        const goalsList = document.getElementById('goalsList');
        if (goalsList && goals.length) {
            goalsList.innerHTML = goals.map(goal => `
                <div class="goal-item" data-goal-id="${goal.id}" style="background: var(--glass-bg); border-radius: 20px; padding: 16px; margin-bottom: 12px; cursor: pointer;">
                    <div style="font-size: 18px; font-weight: bold;">${goal.emoji || '🎯'} ${goal.name}</div>
                    <div style="color: var(--max-text-secondary);">⏱ ${goal.time} • ${goal.difficulty}</div>
                </div>
            `).join('');
            
            document.querySelectorAll('.goal-item').forEach(item => {
                item.addEventListener('click', () => {
                    const goalId = item.dataset.goalId;
                    const goal = goals.find(g => g.id === goalId);
                    if (goal) UI.showToast(`Цель выбрана: ${goal.name}`, 'success');
                });
            });
        }
        
        document.getElementById('customGoalBtn')?.addEventListener('click', () => {
            const goal = prompt('Сформулируйте свою цель:');
            if (goal) UI.showToast(`Цель принята: "${goal}"`, 'success');
        });
        document.getElementById('backToProfileFromGoalBtn')?.addEventListener('click', () => this.showFinalProfile());
    },
    
    async showChooseModeScreen() {
        UI.setScreenContent(`
            <div style="padding: 20px;">
                <h2 style="text-align:center;">⚙️ ВЫБЕРИ РЕЖИМ</h2>
                <p style="text-align:center; color: var(--max-text-secondary);">Выбери стиль общения</p>
                <div id="modesList" style="margin: 20px 0;"></div>
                <button id="backToProfileFromModeBtn" class="onboarding-btn secondary" style="width:100%;">◀️ НАЗАД</button>
            </div>
        `);
        
        const modes = [
            { id: 'coach', name: '🔮 КОУЧ', desc: 'Помогаю найти ответы внутри себя' },
            { id: 'psychologist', name: '🧠 ПСИХОЛОГ', desc: 'Исследую глубинные паттерны' },
            { id: 'trainer', name: '⚡ ТРЕНЕР', desc: 'Даю четкие инструменты и задания' }
        ];
        
        const modesList = document.getElementById('modesList');
        if (modesList) {
            modesList.innerHTML = modes.map(mode => `
                <div class="mode-card" data-mode="${mode.id}" style="background: var(--glass-bg); border-radius: 20px; padding: 16px; margin-bottom: 12px; cursor: pointer; border: 2px solid ${this.currentMode === mode.id ? 'var(--max-blue)' : 'transparent'}">
                    <div style="font-size: 20px; font-weight: bold;">${mode.name}</div>
                    <div style="color: var(--max-text-secondary);">${mode.desc}</div>
                </div>
            `).join('');
            
            document.querySelectorAll('.mode-card').forEach(card => {
                card.addEventListener('click', async () => {
                    const mode = card.dataset.mode;
                    this.currentMode = mode;
                    await API.setMode(this.userId, mode);
                    UI.showToast(`Режим ${card.querySelector('div:first-child').textContent} активирован`, 'success');
                    this.showFinalProfile();
                });
            });
        }
        
        document.getElementById('backToProfileFromModeBtn')?.addEventListener('click', () => this.showFinalProfile());
    },
    
    async showSmartQuestions() {
        UI.showLoading('Загрузка вопросов...');
        const result = await API.getSmartQuestions(this.userId);
        UI.hideLoading();
        
        const questions = result.questions || [
            'Как перестать бояться конфликтов?',
            'Как увеличить доход без новых вложений?',
            'С чего начать изменения?',
            'Почему я злюсь внутри, но молчу?',
            'Как защищать границы без агрессии?'
        ];
        
        UI.setScreenContent(`
            <div class="smart-questions-container" style="padding: 20px;">
                <div style="text-align:center; margin-bottom: 24px;">
                    <div style="font-size: 48px;">❓</div>
                    <h2>УМНЫЕ ВОПРОСЫ</h2>
                    <p style="color: var(--max-text-secondary);">Выберите вопрос или напишите свой</p>
                </div>
                <div id="smartQuestionsList" style="margin-bottom: 20px;"></div>
                <div class="input-group" style="display: flex; gap: 8px;">
                    <input type="text" id="smartQuestionInput" class="modal-input" placeholder="Или напишите свой вопрос...">
                    <button id="sendSmartQuestionBtn" style="width:48px;height:48px;border-radius:50%;background:var(--max-blue);border:none;color:white;font-size:20px;">➡️</button>
                </div>
                <button id="backFromSmartQuestionsBtn" class="onboarding-btn secondary" style="width:100%; margin-top: 20px;">◀️ НАЗАД</button>
            </div>
        `);
        
        const questionsList = document.getElementById('smartQuestionsList');
        if (questionsList) {
            questionsList.innerHTML = questions.map(q => `
                <div class="smart-question-item" data-question="${UI.escapeHtml(q)}" style="background: var(--glass-bg); border-radius: 20px; padding: 14px; margin-bottom: 12px; cursor: pointer;">
                    💭 ${UI.escapeHtml(q)}
                </div>
            `).join('');
            
            document.querySelectorAll('.smart-question-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const question = item.dataset.question;
                    UI.showLoading('Думаю...');
                    const result = await API.sendQuestion(this.userId, question);
                    UI.hideLoading();
                    if (result.success) {
                        this.showMainChat();
                        setTimeout(() => UI.addMessageToChat(result.response, 'bot'), 100);
                    }
                });
            });
        }
        
        const sendBtn = document.getElementById('sendSmartQuestionBtn');
        const input = document.getElementById('smartQuestionInput');
        if (sendBtn && input) {
            sendBtn.addEventListener('click', async () => {
                const question = input.value.trim();
                if (question) {
                    UI.showLoading('Думаю...');
                    const result = await API.sendQuestion(this.userId, question);
                    UI.hideLoading();
                    if (result.success) {
                        this.showMainChat();
                        setTimeout(() => UI.addMessageToChat(result.response, 'bot'), 100);
                    }
                    input.value = '';
                }
            });
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendBtn.click();
            });
        }
        
        document.getElementById('backFromSmartQuestionsBtn')?.addEventListener('click', () => this.showFinalProfile());
    },
    
    setupEventListeners() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const chatsPanel = document.getElementById('chatsPanel');
        if (mobileMenuBtn && chatsPanel) {
            mobileMenuBtn.addEventListener('click', () => chatsPanel.classList.toggle('visible'));
        }
        
        const userProfile = document.getElementById('userMiniProfile');
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                UI.showNameModal((name) => {
                    Auth.saveUserName(name);
                    this.userName = name;
                    UI.updateUserNameInUI(name);
                });
            });
        }
        
        // Проверяем нужно ли показать модалку с именем
        if (!localStorage.getItem('userName') || localStorage.getItem('userName') === 'Гость') {
            setTimeout(() => {
                UI.showNameModal((name) => {
                    Auth.saveUserName(name);
                    this.userName = name;
                    UI.updateUserNameInUI(name);
                });
            }, 1500);
        }
    }
};

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
