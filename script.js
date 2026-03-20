// ========== script.js ==========
// ПОЛНАЯ ВЕРСИЯ С ПРАВИЛЬНОЙ ЛОГИКОЙ + СОХРАНЕНИЕ ИМЕНИ + ИНТЕГРАЦИЯ С MAX + ТЕСТ

const App = {
    userId: 'test_user_123',
    userName: 'Загрузка...',
    userData: {},
    userContext: {
        city: null,
        gender: null,
        age: null
    },
    testProgress: {},

    async init() {
        console.log('🚀 Фреди: инициализация');
        
        // Получаем user_id от MAX если есть
        if (window.maxContext?.user_id) {
            this.userId = window.maxContext.user_id;
            console.log('👤 Получен ID от MAX:', this.userId);
        }
        
        // Загружаем сохраненное имя из localStorage
        this.loadUserName();
        
        // Скрываем шапку чата
        const chatHeader = document.getElementById('chatHeader');
        if (chatHeader) chatHeader.style.display = 'none';
        
        // Обновляем имя в левой панели
        this.updateUserNameInUI();
        
        // Загружаем данные пользователя если есть API
        if (window.api) {
            const userData = await window.api.getUserStatus(this.userId);
            if (userData?.user_name) {
                this.saveUserName(userData.user_name);
            }
        }
        
        // Получаем статус пользователя
        await this.checkUserStatus();
        
        // Показываем модальное окно для ввода имени если нужно
        this.checkAndShowNameModal();
        
        // Добавляем обработчики для левой панели
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Мобильное меню
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const chatsPanel = document.getElementById('chatsPanel');
        
        if (mobileMenuBtn && chatsPanel) {
            mobileMenuBtn.addEventListener('click', () => {
                chatsPanel.classList.toggle('visible');
            });
        }
        
        // Поиск по чатам
        const searchInput = document.getElementById('chatSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                console.log('🔍 Поиск:', e.target.value);
            });
        }
        
        // Клик на профиль
        const userProfile = document.getElementById('userMiniProfile');
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                this.showNameModal();
            });
        }
        
        // Новая переписка
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                alert('Новая переписка будет доступна позже');
            });
        }
    },

    // Загрузка имени из localStorage
    loadUserName() {
        const savedName = localStorage.getItem('userName');
        
        if (savedName) {
            this.userName = savedName;
        } else {
            this.userName = 'Гость';
        }
    },

    // Сохранение имени
    saveUserName(name) {
        if (name && name.trim() !== '') {
            const trimmedName = name.trim();
            this.userName = trimmedName;
            localStorage.setItem('userName', trimmedName);
            this.updateUserNameInUI();
            
            // Создаем событие для уведомления других частей
            const event = new CustomEvent('userNameSaved', { 
                detail: { name: trimmedName } 
            });
            window.dispatchEvent(event);
            
            return true;
        }
        return false;
    },

    // Обновление имени во всех местах интерфейса
    updateUserNameInUI() {
        // 1. В левой панели
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = this.userName;
        
        // 2. В статусе
        const userStatus = document.getElementById('userStatus');
        if (userStatus) {
            if (this.userName === 'Гость') {
                userStatus.textContent = '👤 войдите';
            } else {
                userStatus.textContent = '🧠 онлайн';
            }
        }
        
        // 3. В приветствии
        const nameSpan = document.getElementById('userNamePlaceholder');
        if (nameSpan) nameSpan.textContent = this.userName;
        
        const welcomeNameSpan = document.getElementById('welcomeUserName');
        if (welcomeNameSpan) welcomeNameSpan.textContent = this.userName;
        
        // 4. В аватарке
        const avatarImg = document.getElementById('userAvatar');
        if (avatarImg) {
            const firstLetter = this.userName.charAt(0).toUpperCase();
            avatarImg.src = `https://ui-avatars.com/api/?name=${firstLetter}&background=248bf2&color=fff&size=64`;
        }
        
        // 5. В модальном окне
        const nameInput = document.getElementById('userNameInput');
        if (nameInput) {
            nameInput.placeholder = `Например, ${this.userName === 'Гость' ? 'Александр' : this.userName}`;
        }
    },

    // Показать модальное окно для ввода имени
    showNameModal() {
        // Убираем предыдущее модальное окно если есть
        const oldModal = document.getElementById('nameModal');
        if (oldModal) oldModal.remove();
        
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.id = 'nameModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content glass-panel">
                <h2 class="modal-title">👋 Как вас зовут?</h2>
                <p class="modal-subtitle">Введите ваше имя для персонализации</p>
                
                <div class="input-group">
                    <input type="text" id="userNameInput" class="modal-input" 
                           placeholder="Ваше имя" maxlength="30" value="${this.userName !== 'Гость' ? this.userName : ''}">
                    <button onclick="App.handleNameSubmit()" class="modal-btn primary">
                        Сохранить
                    </button>
                </div>
                
                <button onclick="App.closeNameModal()" class="modal-btn secondary">
                    Позже
                </button>
            </div>
        `;
        
        // Добавляем стили для модального окна
        const style = document.createElement('style');
        style.id = 'modalStyles';
        style.textContent = `
            .modal {
                display: flex;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: modalFadeIn 0.3s ease;
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            .modal-content {
                width: 90%;
                max-width: 320px;
                padding: 24px;
                border-radius: 30px;
                text-align: center;
            }
            
            .modal-title {
                font-size: 24px;
                margin-bottom: 8px;
                color: var(--max-text);
            }
            
            .modal-subtitle {
                color: var(--max-text-secondary);
                margin-bottom: 20px;
                font-size: 14px;
            }
            
            .input-group {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .modal-input {
                flex: 1;
                padding: 12px 16px;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 30px;
                color: var(--max-text);
                font-size: 16px;
                outline: none;
                transition: border-color 0.2s;
            }
            
            .modal-input:focus {
                border-color: var(--max-blue);
            }
            
            .modal-btn {
                width: 100%;
                padding: 12px;
                border-radius: 30px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
                margin-bottom: 8px;
            }
            
            .modal-btn.primary {
                background: linear-gradient(135deg, var(--max-blue), #5a9eff);
                color: white;
            }
            
            .modal-btn.secondary {
                background: transparent;
                color: var(--max-text);
                border: 1px solid var(--glass-border);
            }
            
            .modal-btn:hover {
                transform: scale(1.02);
            }
            
            .modal-btn:active {
                transform: scale(0.98);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Фокус на поле ввода
        setTimeout(() => {
            const input = document.getElementById('userNameInput');
            if (input) input.focus();
        }, 100);
    },

    // Обработка отправки имени
    handleNameSubmit() {
        const input = document.getElementById('userNameInput');
        if (!input) return;
        
        const name = input.value.trim();
        if (name) {
            this.saveUserName(name);
            this.closeNameModal();
            
            // Обновляем статус
            const userStatus = document.getElementById('userStatus');
            if (userStatus) userStatus.textContent = '🧠 онлайн';
        } else {
            alert('Пожалуйста, введите ваше имя');
        }
    },

    // Закрыть модальное окно
    closeNameModal() {
        const modal = document.getElementById('nameModal');
        if (modal) {
            modal.style.animation = 'modalFadeIn 0.3s reverse';
            setTimeout(() => {
                modal.remove();
                const style = document.getElementById('modalStyles');
                if (style) style.remove();
            }, 300);
        }
    },

    // Проверка нужно ли показывать модальное окно
    checkAndShowNameModal() {
        const savedName = localStorage.getItem('userName');
        if (!savedName || savedName === 'Гость') {
            setTimeout(() => {
                this.showNameModal();
            }, 1500);
        }
    },

    async checkUserStatus() {
        try {
            // Здесь должен быть запрос к вашему API
            // Пока используем тестовые данные
            const status = {
                first_visit: true,
                context_complete: false,
                test_completed: false
            };
            
            if (status.first_visit || !status.context_complete) {
                this.showOnboardingScreen1();
            } else if (!status.test_completed) {
                // Контекст есть, тест не пройден
                if (typeof Context !== 'undefined') {
                    Context.showCompleteScreen(this.userContext);
                } else {
                    this.showOnboardingScreen1();
                }
            } else {
                // Всё пройдено - показываем чат
                this.showMainChat();
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            this.showOnboardingScreen1();
        }
    },

    showOnboardingScreen1() {
        const template = document.getElementById('onboardingScreen1');
        if (!template) {
            console.error('❌ Шаблон onboardingScreen1 не найден!');
            return;
        }
        
        const clone = document.importNode(template.content, true);
        
        // Обновляем имя в приветствии
        const nameSpan = clone.querySelector('#userNamePlaceholder');
        if (nameSpan) nameSpan.textContent = this.userName;
        
        const container = document.getElementById('screenContainer');
        if (!container) {
            console.error('❌ Контейнер screenContainer не найден!');
            return;
        }
        
        container.innerHTML = '';
        container.appendChild(clone);
        
        setTimeout(() => {
            const startBtn = document.getElementById('startTestBtn');
            const whoBtn = document.getElementById('whoAreYouBtn');
            
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    if (typeof Context !== 'undefined') {
                        Context.startCollection();
                    } else {
                        // ЗАПУСК ТЕСТА
                        if (typeof Test !== 'undefined') {
                            Test.init(this.userId);
                            Test.start();
                        } else {
                            alert('Функция теста временно недоступна');
                        }
                    }
                });
            }
            
            if (whoBtn) {
                whoBtn.addEventListener('click', () => {
                    this.showOnboardingScreen2();
                });
            }
        }, 100);
    },

    showOnboardingScreen2() {
        const template = document.getElementById('onboardingScreen2');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        const container = document.getElementById('screenContainer');
        container.innerHTML = '';
        container.appendChild(clone);
        
        setTimeout(() => {
            const letsGoBtn = document.getElementById('letsGoBtn');
            if (letsGoBtn) {
                letsGoBtn.addEventListener('click', () => {
                    if (typeof Context !== 'undefined') {
                        Context.startCollection();
                    } else {
                        // ЗАПУСК ТЕСТА
                        if (typeof Test !== 'undefined') {
                            Test.init(this.userId);
                            Test.start();
                        } else {
                            alert('Начинаем тест!');
                        }
                    }
                });
            }
        }, 100);
    },

    showContextScreen(type) {
        let templateId = '';
        switch(type) {
            case 'city':
                templateId = 'contextCityScreen';
                break;
            case 'gender':
                templateId = 'contextGenderScreen';
                break;
            case 'age':
                templateId = 'contextAgeScreen';
                break;
            default:
                templateId = 'contextCityScreen';
        }
        
        const template = document.getElementById(templateId);
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        const container = document.getElementById('screenContainer');
        container.innerHTML = '';
        container.appendChild(clone);
        
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
                            this.showContextScreen('gender');
                        } else {
                            alert('Введите название города');
                        }
                    });
                    
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            submitBtn.click();
                        }
                    });
                }
                
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.showContextScreen('gender');
                    });
                }
            }
            
            if (type === 'gender') {
                const maleBtn = document.getElementById('genderMaleBtn');
                const femaleBtn = document.getElementById('genderFemaleBtn');
                const skipBtn = document.getElementById('skipGenderBtn');
                
                if (maleBtn) {
                    maleBtn.addEventListener('click', () => {
                        this.userContext.gender = 'male';
                        this.showContextScreen('age');
                    });
                }
                
                if (femaleBtn) {
                    femaleBtn.addEventListener('click', () => {
                        this.userContext.gender = 'female';
                        this.showContextScreen('age');
                    });
                }
                
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.showContextScreen('age');
                    });
                }
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
                            this.showCompleteScreen();
                        } else {
                            alert('Введите корректный возраст');
                        }
                    });
                    
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            submitBtn.click();
                        }
                    });
                }
                
                if (skipBtn) {
                    skipBtn.addEventListener('click', () => {
                        this.showCompleteScreen();
                    });
                }
            }
        }, 100);
    },

    showCompleteScreen() {
        const template = document.getElementById('contextCompleteScreen');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        
        // Заполняем данные
        const citySpan = clone.querySelector('#infoCity');
        const genderSpan = clone.querySelector('#infoGender');
        const ageSpan = clone.querySelector('#infoAge');
        const weatherSpan = clone.querySelector('#infoWeather');
        
        if (citySpan) citySpan.textContent = this.userContext.city || 'не указан';
        if (genderSpan) {
            let genderText = 'не указан';
            if (this.userContext.gender === 'male') genderText = 'Мужчина';
            if (this.userContext.gender === 'female') genderText = 'Женщина';
            genderSpan.textContent = genderText;
        }
        if (ageSpan) ageSpan.textContent = this.userContext.age || 'не указан';
        if (weatherSpan) {
            weatherSpan.style.display = 'none';
        }
        
        const container = document.getElementById('screenContainer');
        container.innerHTML = '';
        container.appendChild(clone);
        
        setTimeout(() => {
            const startTestBtn = document.getElementById('startRealTestBtn');
            const whatGivesBtn = document.getElementById('whatTestGivesBtn');
            const askQuestionBtn = document.getElementById('askQuestionPreBtn');
            
            if (startTestBtn) {
                startTestBtn.addEventListener('click', () => {
                    // ЗАПУСК ТЕСТА
                    if (typeof Test !== 'undefined') {
                        Test.init(this.userId);
                        Test.start();
                    } else {
                        alert('Тест будет запущен!');
                    }
                });
            }
            
            if (whatGivesBtn) {
                whatGivesBtn.addEventListener('click', () => {
                    this.showBenefitsScreen();
                });
            }
            
            if (askQuestionBtn) {
                askQuestionBtn.addEventListener('click', () => {
                    this.showMainChat();
                });
            }
        }, 100);
    },

    showBenefitsScreen() {
        const template = document.getElementById('benefitsScreen');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        const container = document.getElementById('screenContainer');
        container.innerHTML = '';
        container.appendChild(clone);
        
        setTimeout(() => {
            const startTestBtn = document.getElementById('startTestFromBenefitsBtn');
            const backBtn = document.getElementById('backToContextBtn');
            
            if (startTestBtn) {
                startTestBtn.addEventListener('click', () => {
                    // ЗАПУСК ТЕСТА
                    if (typeof Test !== 'undefined') {
                        Test.init(this.userId);
                        Test.start();
                    } else {
                        alert('Тест будет запущен!');
                    }
                });
            }
            
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.showCompleteScreen();
                });
            }
        }, 100);
    },

    showMainChat() {
        console.log('💬 Показываем основной чат');
        const container = document.getElementById('screenContainer');
        container.innerHTML = `
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
                <button class="attach-btn">📎</button>
                <div class="message-input-wrapper">
                    <input type="text" class="message-input" placeholder="Сообщение..." id="messageInput">
                    <button class="send-btn" id="sendMessageBtn">➡️</button>
                </div>
                <button class="voice-btn">🎤</button>
            </div>
        `;
        
        const chatHeader = document.getElementById('chatHeader');
        if (chatHeader) chatHeader.style.display = 'flex';
        
        setTimeout(() => {
            const sendBtn = document.getElementById('sendMessageBtn');
            const messageInput = document.getElementById('messageInput');
            const messagesList = document.getElementById('messagesList');
            
            if (sendBtn && messageInput && messagesList) {
                const sendMessage = () => {
                    const text = messageInput.value.trim();
                    if (text) {
                        // Сообщение пользователя
                        const userMessage = document.createElement('div');
                        userMessage.className = 'message user-message';
                        userMessage.innerHTML = `
                            <div class="message-bubble">
                                <div class="message-text">${text}</div>
                                <div class="message-time">только что</div>
                                <div class="message-status">
                                    <span class="status-icon sent"></span>
                                </div>
                            </div>
                        `;
                        messagesList.appendChild(userMessage);
                        
                        messageInput.value = '';
                        
                        const container = document.querySelector('.messages-container');
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                        
                        // Ответ бота
                        setTimeout(() => {
                            const botMessage = document.createElement('div');
                            botMessage.className = 'message bot-message';
                            botMessage.innerHTML = `
                                <div class="message-bubble">
                                    <div class="message-text">Спасибо за сообщение, ${this.userName}! Я обязательно отвечу.</div>
                                    <div class="message-time">только что</div>
                                </div>
                            `;
                            messagesList.appendChild(botMessage);
                            
                            if (container) {
                                container.scrollTop = container.scrollHeight;
                            }
                        }, 1000);
                    }
                };
                
                sendBtn.addEventListener('click', sendMessage);
                messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });
            }
        }, 100);
    }
};

// Запуск
document.addEventListener('DOMContentLoaded', () => App.init());

// Делаем App доступным глобально
window.App = App;

// API для совместимости
window.api = window.api || {
    async getUserStatus(userId) {
        console.log('📊 Запрос статуса для:', userId);
        return {
            user_name: localStorage.getItem('userName') || 'Гость',
            context_complete: false,
            test_completed: false
        };
    }
};
