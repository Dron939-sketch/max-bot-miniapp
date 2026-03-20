// ========== script.js ==========
// ПОЛНАЯ ВЕРСИЯ С ПРАВИЛЬНОЙ ЛОГИКОЙ + СОХРАНЕНИЕ ИМЕНИ + ИНТЕГРАЦИЯ С MAX + ТЕСТ + ЭКРАНЫ ПОСЛЕ ТЕСТА

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
    profileData: null,        // Данные профиля после теста
    currentMode: 'coach',     // Текущий режим: coach, psychologist, trainer
    psychologistThought: null, // Сохраненная мысль психолога
    currentGoals: [],         // Список целей

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
            try {
                const userData = await window.api.getUserStatus(this.userId);
                if (userData?.user_name) {
                    this.saveUserName(userData.user_name);
                }
                if (userData?.profile_data) {
                    this.profileData = userData.profile_data;
                }
                if (userData?.communication_mode) {
                    this.currentMode = userData.communication_mode;
                }
            } catch (e) {
                console.warn('Ошибка загрузки данных:', e);
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
        
        // Меню в шапке
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.showContextMenu();
            });
        }
    },
    
    showContextMenu() {
        // Можно добавить контекстное меню
        console.log('Контекстное меню');
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
        
        const goalUserName = document.getElementById('goalUserName');
        if (goalUserName) goalUserName.textContent = this.userName;
        
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
        
        // Добавляем стили для модального окна если их нет
        if (!document.getElementById('modalStyles')) {
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
                    background: var(--max-panel-bg);
                    border: 1px solid var(--glass-border);
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
                    background: var(--max-blue);
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
        }
        
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
            // Проверяем, есть ли данные профиля
            if (this.profileData) {
                // Тест пройден - показываем финальный профиль
                await this.showFinalProfile();
                return;
            }
            
            // Проверяем, есть ли контекст
            const hasContext = this.userContext.city || this.userContext.gender || this.userContext.age;
            
            if (!hasContext) {
                this.showOnboardingScreen1();
            } else {
                this.showCompleteScreen();
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            this.showOnboardingScreen1();
        }
    },

    // ========== ЭКРАНЫ ОНБОРДИНГА И КОНТЕКСТА ==========

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
                    this.showContextScreen('city');
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
                    this.showContextScreen('city');
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

    // ========== ЭКРАНЫ ПОСЛЕ ТЕСТА ==========

    async showFinalProfile() {
        console.log('📊 Показываем финальный профиль');
        
        const template = document.getElementById('finalProfileScreen');
        if (!template) {
            console.error('❌ Шаблон finalProfileScreen не найден!');
            return;
        }
        
        const clone = document.importNode(template.content, true);
        const profileTextDiv = clone.querySelector('#profileText');
        
        // Генерируем текст профиля
        let profileHtml = '';
        
        if (this.profileData) {
            const profileCode = this.profileData.display_name || 'СБ-4_ТФ-4_УБ-4_ЧВ-4';
            const scores = this.profileData.scores || {};
            
            profileHtml = `
                <div class="profile-section">
                    <h3>🧠 Твой профиль: ${profileCode}</h3>
                </div>
                
                <div class="profile-section">
                    <h4>🎭 Восприятие</h4>
                    <p>${this.getPerceptionDescription()}</p>
                </div>
                
                <div class="profile-section">
                    <h4>💭 Мышление</h4>
                    <p>${this.getThinkingDescription()}</p>
                </div>
                
                <div class="profile-section">
                    <h4>⚡ Поведение</h4>
                    <p>${this.getBehaviorDescription(scores)}</p>
                </div>
                
                <div class="profile-section">
                    <h4>🎯 Точка роста</h4>
                    <p>${this.getGrowthPoint(scores)}</p>
                </div>
            `;
        } else {
            profileHtml = `
                <div class="profile-section">
                    <p>🧠 Психологический портрет формируется...</p>
                    <p>Пройдите тест, чтобы получить полный анализ.</p>
                </div>
            `;
        }
        
        if (profileTextDiv) profileTextDiv.innerHTML = profileHtml;
        
        const container = document.getElementById('screenContainer');
        container.innerHTML = '';
        container.appendChild(clone);
        
        // Показываем шапку чата
        const chatHeader = document.getElementById('chatHeader');
        if (chatHeader) chatHeader.style.display = 'flex';
        
        // Обновляем статус в шапке
        const botStatus = document.getElementById('botStatus');
        if (botStatus) {
            const modeNames = {
                coach: '🔮 коуч',
                psychologist: '🧠 психолог',
                trainer: '⚡ тренер'
            };
            botStatus.textContent = modeNames[this.currentMode] || '🧠 психолог';
        }
        
        setTimeout(() => {
            // Кнопка "Мысли психолога"
            const thoughtBtn = document.getElementById('psychologistThoughtBtn');
            if (thoughtBtn) {
                thoughtBtn.addEventListener('click', () => {
                    this.showPsychologistThought();
                });
            }
            
            // Кнопка "Хочу высказаться"
            const askBtn = document.getElementById('askQuestionBtn');
            if (askBtn) {
                askBtn.addEventListener('click', () => {
                    this.showAskQuestionScreen();
                });
            }
            
            // Кнопка "Выбрать цель"
            const goalBtn = document.getElementById('chooseGoalBtn');
            if (goalBtn) {
                goalBtn.addEventListener('click', () => {
                    this.showChooseGoalScreen();
                });
            }
            
            // Кнопка "Выбрать режим"
            const modeBtn = document.getElementById('chooseModeBtn');
            if (modeBtn) {
                modeBtn.addEventListener('click', () => {
                    this.showChooseModeScreen();
                });
            }
        }, 100);
    },

    getPerceptionDescription() {
        const perceptionType = this.profileData?.perception_type || 'СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ';
        const descriptions = {
            'СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ': 'Ты тонко чувствуешь настроение окружающих. Часто ориентируешься на мнение других. Это делает тебя хорошим собеседником, но иногда сложно услышать себя.',
            'ИНТРОВЕРТИРОВАННЫЙ': 'Твой внутренний мир богаче внешнего. Ты много рефлексируешь, анализируешь. Это даёт глубину, но может вызывать перегрузку.',
            'СИМВОЛИЧЕСКИЙ': 'Ты видишь знаки и смыслы там, где другие видят случайности. Развитая интуиция помогает находить нестандартные решения.',
            'МАТЕРИАЛИСТИЧНЫЙ': 'Ты ценишь факты, доказательства, практичность. Твои решения взвешенны, но иногда не хватает гибкости.'
        };
        return descriptions[perceptionType] || descriptions['СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ'];
    },

    getThinkingDescription() {
        const thinkingLevel = this.profileData?.thinking_level || 5;
        if (thinkingLevel <= 3) {
            return 'Ты склонен к быстрым, интуитивным решениям. Это помогает действовать быстро, но иногда хочется большей глубины анализа.';
        } else if (thinkingLevel <= 6) {
            return 'Ты умеешь анализировать, видишь причинно-следственные связи. Баланс между скоростью и глубиной — твоя сильная сторона.';
        } else {
            return 'Твоё мышление системное, ты видишь сложные взаимосвязи. Это позволяет находить неочевидные решения, но иногда приводит к излишней рефлексии.';
        }
    },

    getBehaviorDescription(scores) {
        const sb = scores['СБ'] || 3;
        const tf = scores['ТФ'] || 3;
        const ub = scores['УБ'] || 3;
        const chv = scores['ЧВ'] || 3;
        
        let desc = '';
        if (sb <= 2) desc += '• Давление выбивает из колеи. ';
        else if (sb >= 4) desc += '• Спокоен под давлением. ';
        
        if (tf <= 2) desc += '• С деньгами сложно. ';
        else if (tf >= 4) desc += '• Деньги — инструмент. ';
        
        if (ub <= 2) desc += '• Мир кажется хаотичным. ';
        else if (ub >= 4) desc += '• Видишь системность. ';
        
        if (chv <= 2) desc += '• Отношения напрягают. ';
        else if (chv >= 4) desc += '• Ценишь людей. ';
        
        return desc || 'Сбалансированный профиль, есть куда расти.';
    },

    getGrowthPoint(scores) {
        const vectors = ['СБ', 'ТФ', 'УБ', 'ЧВ'];
        let minVector = 'СБ';
        let minValue = 5;
        
        for (const v of vectors) {
            const val = scores[v] || 3;
            if (val < minValue) {
                minValue = val;
                minVector = v;
            }
        }
        
        const growthPoints = {
            'СБ': 'Работа с реакцией на давление и страхи. Научиться защищать свои границы.',
            'ТФ': 'Проработка денежных блоков. Формирование мышления изобилия.',
            'УБ': 'Развитие системного мышления. Поиск смыслов и паттернов.',
            'ЧВ': 'Исцеление привязанности. Углубление отношений.'
        };
        
        return growthPoints[minVector] || 'Исследование себя и своих паттернов.';
    },

    // ========== ЭКРАН "ЗАДАТЬ ВОПРОС" ==========

    showAskQuestionScreen() {
        const template = document.getElementById('askQuestionScreen');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        const container = document.getElementById('screenContainer');
        container.innerHTML = '';
        container.appendChild(clone);
        
        setTimeout(() => {
            const sendBtn = document.getElementById('sendQuestionBtn');
            const questionInput = document.getElementById('questionInput');
            const backBtn = document.getElementById('backToProfileBtn');
            
            if (sendBtn && questionInput) {
                sendBtn.addEventListener('click', async () => {
                    const question = questionInput.value.trim();
                    if (question) {
                        await this.sendQuestion(question);
                        questionInput.value = '';
                    }
                });
                
                questionInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendBtn.click();
                    }
                });
            }
            
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.showFinalProfile();
                });
            }
        }, 100);
    },

    async sendQuestion(question) {
        // Показываем индикатор загрузки
        const container = document.getElementById('screenContainer');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'thought-loading-container';
        loadingDiv.innerHTML = `
            <div class="thought-loading-content">
                <div class="loading-spinner">🤔</div>
                <div class="loading-text">Думаю над ответом...</div>
            </div>
        `;
        
        const originalContent = container.innerHTML;
        container.innerHTML = '';
        container.appendChild(loadingDiv);
        
        try {
            // Отправляем вопрос через API
            let response = '';
            if (window.api && window.api.sendQuestion) {
                const result = await window.api.sendQuestion(this.userId, question);
                response = result.response || 'Я вас слушаю. Расскажите подробнее.';
            } else {
                // Имитация ответа
                await new Promise(r => setTimeout(r, 2000));
                response = `Спасибо за вопрос, ${this.userName}! Это интересная тема. Давай разберёмся вместе. Что именно тебя беспокоит?`;
            }
            
            // Показываем ответ
            container.innerHTML = originalContent;
            
            // Добавляем ответ в виде сообщения
            const messagesList = document.getElementById('messagesList');
            if (messagesList) {
                const botMessage = document.createElement('div');
                botMessage.className = 'message bot-message';
                botMessage.innerHTML = `
                    <div class="message-bubble">
                        <div class="message-text">${response}</div>
                        <div class="message-time">только что</div>
                    </div>
                `;
                messagesList.appendChild(botMessage);
                
                const messagesContainer = document.querySelector('.messages-container');
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            } else {
                // Если нет чата, показываем просто текст
                alert(response);
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            container.innerHTML = originalContent;
            alert('Извините, произошла ошибка. Попробуйте позже.');
        }
    },

    // ========== ЭКРАН "ВЫБРАТЬ ЦЕЛЬ" ==========

    async showChooseGoalScreen() {
        const template = document.getElementById('chooseGoalScreen');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        
        // Заполняем данные
        const goalUserName = clone.querySelector('#goalUserName');
        if (goalUserName) goalUserName.textContent = this.userName;
        
        const profileCodeSpan = clone.querySelector('#profileCode');
        if (profileCodeSpan && this.profileData) {
            profileCodeSpan.textContent = this.profileData.display_name || 'СБ-4_ТФ-4_УБ-4_ЧВ-4';
        }
        
        const modeCodeSpan = clone.querySelector('#modeCode');
        if (modeCodeSpan) {
            const modeNames = {
                coach: '🔮 КОУЧ',
                psychologist: '🧠 ПСИХОЛОГ',
                trainer: '⚡ ТРЕНЕР'
            };
            modeCodeSpan.textContent = modeNames[this.currentMode] || '🔮 КОУЧ';
        }
        
        // Генерируем цели
        const goalsList = clone.querySelector('#goalsList');
        if (goalsList) {
            const goals = this.getGoalsForProfile();
            this.currentGoals = goals;
            
            goalsList.innerHTML = goals.map(goal => `
                <div class="goal-item" data-goal-id="${goal.id}">
                    <div class="goal-name">${goal.emoji || '🎯'} ${goal.name}</div>
                    <div class="goal-time">⏱ ${goal.time}</div>
                    <div class="goal-difficulty">${this.getDifficultyEmoji(goal.difficulty)} ${goal.difficulty}</div>
                </div>
            `).join('');
            
            // Добавляем обработчики кликов на цели
            setTimeout(() => {
                const goalItems = goalsList.querySelectorAll('.goal-item');
                goalItems.forEach(item => {
                    item.addEventListener('click', () => {
                        const goalId = item.dataset.goalId;
                        const goal = goals.find(g => g.id === goalId);
                        if (goal) {
                            this.selectGoal(goal);
                        }
                    });
                });
            }, 100);
        }
        
        const container = document.getElementById('screenContainer');
        container.innerHTML = '';
        container.appendChild(clone);
        
        setTimeout(() => {
            const customGoalBtn = document.getElementById('customGoalBtn');
            const backBtn = document.getElementById('backToProfileFromGoalBtn');
            
            if (customGoalBtn) {
                customGoalBtn.addEventListener('click', () => {
                    this.showCustomGoalInput();
                });
            }
            
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.showFinalProfile();
                });
            }
        }, 100);
    },

    getGoalsForProfile() {
        // Определяем слабые и сильные стороны на основе профиля
        const scores = this.profileData?.scores || { СБ: 3, ТФ: 3, УБ: 3, ЧВ: 3 };
        
        // Находим самый слабый вектор
        let weakest = 'СБ';
        let weakestValue = 5;
        for (const [key, val] of Object.entries(scores)) {
            if (val < weakestValue) {
                weakestValue = val;
                weakest = key;
            }
        }
        
        // База целей
        const goalsDb = {
            coach: {
                weak: {
                    'СБ': [
                        { id: 'fear_work', name: 'Проработать страхи', time: '3-4 недели', difficulty: 'medium', emoji: '🛡️' },
                        { id: 'boundaries', name: 'Научиться защищать границы', time: '2-3 недели', difficulty: 'medium', emoji: '🔒' },
                        { id: 'calm', name: 'Найти внутреннее спокойствие', time: '3-5 недель', difficulty: 'hard', emoji: '🧘' }
                    ],
                    'ТФ': [
                        { id: 'money_blocks', name: 'Проработать денежные блоки', time: '3-4 недели', difficulty: 'medium', emoji: '💰' },
                        { id: 'income_growth', name: 'Увеличить доход', time: '4-6 недель', difficulty: 'hard', emoji: '📈' },
                        { id: 'financial_plan', name: 'Создать финансовый план', time: '2-3 недели', difficulty: 'easy', emoji: '📊' }
                    ],
                    'УБ': [
                        { id: 'meaning', name: 'Найти смысл и предназначение', time: '4-6 недель', difficulty: 'hard', emoji: '🎯' },
                        { id: 'system_thinking', name: 'Развить системное мышление', time: '3-5 недель', difficulty: 'medium', emoji: '🧩' },
                        { id: 'trust', name: 'Научиться доверять миру', time: '3-4 недели', difficulty: 'medium', emoji: '🤝' }
                    ],
                    'ЧВ': [
                        { id: 'relations', name: 'Улучшить отношения', time: '4-6 недель', difficulty: 'hard', emoji: '💕' },
                        { id: 'boundaries_people', name: 'Выстроить границы с людьми', time: '3-4 недели', difficulty: 'medium', emoji: '🚧' },
                        { id: 'attachment', name: 'Проработать тип привязанности', time: '5-7 недель', difficulty: 'hard', emoji: '🪢' }
                    ]
                },
                general: [
                    { id: 'purpose', name: 'Найти предназначение', time: '5-7 недель', difficulty: 'hard', emoji: '🌟' },
                    { id: 'balance', name: 'Обрести баланс', time: '4-6 недель', difficulty: 'medium', emoji: '⚖️' },
                    { id: 'growth', name: 'Личностный рост', time: '6-8 недель', difficulty: 'medium', emoji: '🌱' }
                ]
            },
            psychologist: {
                weak: {
                    'СБ': [
                        { id: 'fear_origin', name: 'Найти источник страхов', time: '4-6 недель', difficulty: 'hard', emoji: '🔍' },
                        { id: 'trauma', name: 'Проработать травму', time: '6-8 недель', difficulty: 'hard', emoji: '🩹' },
                        { id: 'safety', name: 'Сформировать чувство безопасности', time: '5-7 недель', difficulty: 'hard', emoji: '🛡️' }
                    ],
                    'ТФ': [
                        { id: 'money_psychology', name: 'Понять психологию денег', time: '4-5 недель', difficulty: 'medium', emoji: '🧠💰' },
                        { id: 'worth', name: 'Проработать чувство ценности', time: '5-7 недель', difficulty: 'hard', emoji: '💎' },
                        { id: 'scarcity', name: 'Проработать сценарий дефицита', time: '4-6 недель', difficulty: 'medium', emoji: '🔄' }
                    ],
                    'УБ': [
                        { id: 'core_beliefs', name: 'Найти глубинные убеждения', time: '5-7 недель', difficulty: 'hard', emoji: '🏛️' },
                        { id: 'schemas', name: 'Проработать жизненные сценарии', time: '6-8 недель', difficulty: 'hard', emoji: '📜' },
                        { id: 'meaning_deep', name: 'Экзистенциальный поиск', time: '7-9 недель', difficulty: 'hard', emoji: '🌌' }
                    ],
                    'ЧВ': [
                        { id: 'attachment_style', name: 'Проработать тип привязанности', time: '6-8 недель', difficulty: 'hard', emoji: '🪢' },
                        { id: 'inner_child', name: 'Исцелить внутреннего ребёнка', time: '5-7 недель', difficulty: 'hard', emoji: '🧸' },
                        { id: 'family_system', name: 'Проработать семейную систему', time: '6-8 недель', difficulty: 'hard', emoji: '🏠' }
                    ]
                },
                general: [
                    { id: 'self_discovery', name: 'Глубинное самопознание', time: '7-9 недель', difficulty: 'hard', emoji: '🔮' },
                    { id: 'healing', name: 'Исцеление внутренних ран', time: '8-10 недель', difficulty: 'hard', emoji: '💖' },
                    { id: 'integration', name: 'Интеграция личности', time: '9-12 недель', difficulty: 'hard', emoji: '🧩' }
                ]
            },
            trainer: {
                weak: {
                    'СБ': [
                        { id: 'assertiveness', name: 'Развить ассертивность', time: '3-4 недели', difficulty: 'medium', emoji: '💪' },
                        { id: 'conflict_skills', name: 'Освоить навыки конфликта', time: '4-5 недель', difficulty: 'medium', emoji: '⚔️' },
                        { id: 'courage', name: 'Тренировка смелости', time: '3-5 недель', difficulty: 'hard', emoji: '🦁' }
                    ],
                    'ТФ': [
                        { id: 'money_skills', name: 'Освоить навыки управления деньгами', time: '3-4 недели', difficulty: 'easy', emoji: '💰' },
                        { id: 'income_skills', name: 'Навыки увеличения дохода', time: '4-6 недель', difficulty: 'medium', emoji: '📊' },
                        { id: 'investment_skills', name: 'Навыки инвестирования', time: '5-7 недель', difficulty: 'hard', emoji: '📈' }
                    ],
                    'УБ': [
                        { id: 'thinking_tools', name: 'Освоить инструменты мышления', time: '4-5 недель', difficulty: 'medium', emoji: '🧠' },
                        { id: 'triz', name: 'Научиться ТРИЗ', time: '5-7 недель', difficulty: 'hard', emoji: '💡' },
                        { id: 'decision_making', name: 'Навыки принятия решений', time: '3-4 недели', difficulty: 'easy', emoji: '✅' }
                    ],
                    'ЧВ': [
                        { id: 'communication_skills', name: 'Развить навыки общения', time: '3-4 недели', difficulty: 'easy', emoji: '💬' },
                        { id: 'negotiation', name: 'Навыки переговоров', time: '4-6 недель', difficulty: 'medium', emoji: '🤝' },
                        { id: 'influence', name: 'Навыки влияния', time: '5-7 недель', difficulty: 'hard', emoji: '⚡' }
                    ]
                },
                general: [
                    { id: 'productivity', name: 'Повысить продуктивность', time: '4-6 недель', difficulty: 'medium', emoji: '⚡' },
                    { id: 'habit_building', name: 'Сформировать полезные привычки', time: '3-5 недель', difficulty: 'easy', emoji: '🔄' },
                    { id: 'skill_mastery', name: 'Мастерство в ключевых навыках', time: '8-10 недель', difficulty: 'hard', emoji: '🏆' }
                ]
            }
        };
        
        const modeDb = goalsDb[this.currentMode] || goalsDb.coach;
        const goals = [];
        
        // Добавляем цели для слабого вектора
        if (modeDb.weak && modeDb.weak[weakest]) {
            goals.push(...modeDb.weak[weakest]);
        }
        
        // Добавляем общие цели
        if (modeDb.general) {
            goals.push(...modeDb.general);
        }
        
        // Возвращаем первые 6 целей
        return goals.slice(0, 6);
    },

    getDifficultyEmoji(difficulty) {
        const emojis = {
            'easy': '🟢',
            'medium': '🟡',
            'hard': '🔴'
        };
        return emojis[difficulty] || '⚪';
    },

    selectGoal(goal) {
        alert(`Цель выбрана: ${goal.name}\n\nВремя: ${goal.time}\n\nСкоро появится подробный план достижения!`);
        console.log('Выбрана цель:', goal);
    },

    showCustomGoalInput() {
        const goal = prompt('Сформулируйте свою цель своими словами:');
        if (goal && goal.trim()) {
            alert(`Цель принята: "${goal}"\n\nСкоро появится план достижения!`);
        }
    },

    // ========== ЭКРАН "ВЫБРАТЬ РЕЖИМ" ==========

    showChooseModeScreen() {
        const template = document.getElementById('chooseModeScreen');
        if (!template) return;
        
        const clone = document.importNode(template.content, true);
        
        // Заполняем профиль
        const profileCodeSpan = clone.querySelector('#modeProfileCode');
        if (profileCodeSpan && this.profileData) {
            profileCodeSpan.textContent = this.profileData.display_name || 'СБ-4_ТФ-4_УБ-4_ЧВ-4';
        }
        
        const container = document.getElementById('screenContainer');
        container.innerHTML = '';
        container.appendChild(clone);
        
        setTimeout(() => {
            const modeCards = document.querySelectorAll('.mode-card');
            const backBtn = document.getElementById('backToProfileFromModeBtn');
            
            modeCards.forEach(card => {
                card.addEventListener('click', () => {
                    // Убираем выделение со всех
                    modeCards.forEach(c => c.classList.remove('selected'));
                    // Выделяем выбранный
                    card.classList.add('selected');
                    
                    const mode = card.dataset.mode;
                    this.setMode(mode);
                });
            });
            
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.showFinalProfile();
                });
            }
        }, 100);
    },

    setMode(mode) {
        this.currentMode = mode;
        
        const modeNames = {
            coach: '🔮 КОУЧ',
            psychologist: '🧠 ПСИХОЛОГ',
            trainer: '⚡ ТРЕНЕР'
        };
        
        // Обновляем статус в шапке
        const botStatus = document.getElementById('botStatus');
        if (botStatus) {
            botStatus.textContent = modeNames[mode] || '🧠 психолог';
        }
        
        // Сохраняем в API если есть
        if (window.api && window.api.setMode) {
            window.api.setMode(this.userId, mode);
        }
        
        alert(`Режим ${modeNames[mode]} активирован!`);
        
        // Возвращаемся к профилю
        this.showFinalProfile();
    },

    // ========== ЭКРАН "МЫСЛИ ПСИХОЛОГА" ==========

    async showPsychologistThought() {
        // Показываем загрузку
        const loadingTemplate = document.getElementById('psychologistThoughtLoadingScreen');
        if (loadingTemplate) {
            const clone = document.importNode(loadingTemplate.content, true);
            const container = document.getElementById('screenContainer');
            container.innerHTML = '';
            container.appendChild(clone);
        }
        
        try {
            let thought = '';
            
            if (window.api && window.api.generateThought) {
                thought = await window.api.generateThought(this.userId);
            } else {
                // Имитация генерации
                await new Promise(r => setTimeout(r, 3000));
                thought = this.generateMockThought();
            }
            
            this.psychologistThought = thought;
            this.showPsychologistThoughtResult(thought);
            
        } catch (error) {
            console.error('Ошибка:', error);
            this.showPsychologistThoughtResult('Не удалось сгенерировать мысли психолога. Попробуйте позже.');
        }
    },

    generateMockThought() {
        const scores = this.profileData?.scores || { СБ: 3, ТФ: 3, УБ: 3, ЧВ: 3 };
        const weakVectors = [];
        
        for (const [key, val] of Object.entries(scores)) {
            if (val <= 2.5) weakVectors.push(key);
        }
        
        let thought = `🧠 ${this.userName}, я проанализировал твой профиль.\n\n`;
        
        if (weakVectors.includes('СБ')) {
            thought += `Я вижу, что давление и конфликты выводят тебя из равновесия. Это не слабость — это твоя чувствительность. Ты словно радар, который ловит каждую вибрацию. Но этот радар иногда мешает слышать себя.\n\n`;
        }
        
        if (weakVectors.includes('ТФ')) {
            thought += `С деньгами у тебя особая история. Они для тебя не просто цифры — это что-то более глубокое, связанное с ценностью себя. Посмотри, в каких моментах ты обесцениваешь свой труд.\n\n`;
        }
        
        if (weakVectors.includes('УБ')) {
            thought += `Ты часто ищешь систему в хаосе, но мир не всегда подчиняется логике. Может быть, стоит иногда позволить себе просто быть, не анализируя?\n\n`;
        }
        
        if (weakVectors.includes('ЧВ')) {
            thought += `В отношениях ты либо слишком близко, либо слишком далеко. Золотая середина — это не компромисс, это способность быть рядом, сохраняя себя.\n\n`;
        }
        
        thought += `Твой главный вызов сейчас — не исправить то, что "сломано", а увидеть, как твои особенности становятся твоей суперсилой.\n\n`;
        thought += `Что скажешь? Это откликается?`;
        
        return thought;
    },

    showPsychologistThoughtResult(thought) {
        const resultTemplate = document.getElementById('psychologistThoughtResultScreen');
        if (!resultTemplate) return;
        
        const clone = document.importNode(resultTemplate.content, true);
        const thoughtTextDiv = clone.querySelector('#thoughtText');
        
        if (thoughtTextDiv) {
            thoughtTextDiv.innerHTML = thought.replace(/\n/g, '<br>');
        }
        
        const container = document.getElementById('screenContainer');
        container.innerHTML = '';
        container.appendChild(clone);
        
        setTimeout(() => {
            const backBtn = document.getElementById('backToProfileFromThoughtBtn');
            const askBtn = document.getElementById('askQuestionFromThoughtBtn');
            
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.showFinalProfile();
                });
            }
            
            if (askBtn) {
                askBtn.addEventListener('click', () => {
                    this.showAskQuestionScreen();
                });
            }
        }, 100);
    },

    // ========== ОСНОВНОЙ ЧАТ ==========

    showMainChat() {
        console.log('💬 Показываем основной чат');
        
        // Показываем шапку чата
        const chatHeader = document.getElementById('chatHeader');
        if (chatHeader) chatHeader.style.display = 'flex';
        
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
                <button class="attach-btn" id="attachBtn">📎</button>
                <div class="message-input-wrapper">
                    <input type="text" class="message-input" placeholder="Сообщение..." id="messageInput">
                    <button class="send-btn" id="sendMessageBtn">➡️</button>
                </div>
                <button class="voice-btn" id="voiceBtn">🎤</button>
            </div>
        `;
        
        // Добавляем стили для чата если их нет
        if (!document.getElementById('chatStyles')) {
            const style = document.createElement('style');
            style.id = 'chatStyles';
            style.textContent = `
                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                }
                
                .messages-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .message {
                    display: flex;
                    width: 100%;
                }
                
                .message.user-message {
                    justify-content: flex-end;
                }
                
                .message.bot-message {
                    justify-content: flex-start;
                }
                
                .message-bubble {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    position: relative;
                }
                
                .user-message .message-bubble {
                    background: var(--max-message-user);
                    border-bottom-right-radius: 4px;
                }
                
                .bot-message .message-bubble {
                    background: var(--max-message-bot);
                    border-bottom-left-radius: 4px;
                }
                
                .message-text {
                    font-size: 15px;
                    line-height: 1.4;
                }
                
                .message-time {
                    font-size: 10px;
                    color: var(--max-text-secondary);
                    margin-top: 4px;
                    text-align: right;
                }
                
                .input-panel {
                    padding: 12px 16px;
                    background: var(--max-panel-bg);
                    border-top: 1px solid var(--max-border);
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                
                .attach-btn, .voice-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--glass-bg);
                    border: none;
                    color: var(--max-text);
                    font-size: 20px;
                    cursor: pointer;
                }
                
                .message-input-wrapper {
                    flex: 1;
                    display: flex;
                    gap: 8px;
                    background: var(--glass-bg);
                    border-radius: 24px;
                    padding: 4px 4px 4px 16px;
                }
                
                .message-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--max-text);
                    font-size: 16px;
                    outline: none;
                    padding: 8px 0;
                }
                
                .send-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--max-blue);
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                }
                
                @media (max-width: 480px) {
                    .message-bubble {
                        max-width: 90%;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            const sendBtn = document.getElementById('sendMessageBtn');
            const messageInput = document.getElementById('messageInput');
            const messagesList = document.getElementById('messagesList');
            const voiceBtn = document.getElementById('voiceBtn');
            const attachBtn = document.getElementById('attachBtn');
            
            const sendMessage = async () => {
                const text = messageInput.value.trim();
                if (text) {
                    // Сообщение пользователя
                    const userMessage = document.createElement('div');
                    userMessage.className = 'message user-message';
                    userMessage.innerHTML = `
                        <div class="message-bubble">
                            <div class="message-text">${escapeHtml(text)}</div>
                            <div class="message-time">только что</div>
                        </div>
                    `;
                    messagesList.appendChild(userMessage);
                    
                    messageInput.value = '';
                    
                    const container = document.querySelector('.messages-container');
                    if (container) container.scrollTop = container.scrollHeight;
                    
                    // Отправляем вопрос
                    await this.sendQuestion(text);
                }
            };
            
            if (sendBtn) sendBtn.addEventListener('click', sendMessage);
            if (messageInput) {
                messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') sendMessage();
                });
            }
            
            if (voiceBtn) {
                voiceBtn.addEventListener('click', () => {
                    alert('Голосовой ввод будет доступен в следующей версии');
                });
            }
            
            if (attachBtn) {
                attachBtn.addEventListener('click', () => {
                    alert('Прикрепление файлов будет доступно позже');
                });
            }
        }, 100);
    }
};

// Вспомогательная функция для экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
            test_completed: false,
            profile_data: null
        };
    },
    
    async sendQuestion(userId, question) {
        console.log('📝 Вопрос от', userId, ':', question);
        return {
            response: `Спасибо за вопрос, ${localStorage.getItem('userName') || 'друг'}! Давайте разберёмся вместе. Что именно вас беспокоит?`
        };
    },
    
    async generateThought(userId) {
        return `🧠 Анализ показывает, что вы находитесь в поиске. Ваш профиль указывает на сильную чувствительность к внешней оценке. Это не слабость — это ваш внутренний компас, который иногда даёт ложные сигналы.

Попробуйте в ближайшие дни задавать себе вопрос: "Это действительно моё желание или я хочу понравиться другим?"

Вы увидите, как много решений принимается на автомате. Осознанность — первый шаг к свободе.`;
    }
};
