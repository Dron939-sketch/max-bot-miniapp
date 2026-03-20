// ========== script.js ==========
// ПОЛНАЯ ВЕРСИЯ С ПРАВИЛЬНОЙ ЛОГИКОЙ + СОХРАНЕНИЕ ИМЕНИ

const App = {
    userId: 'test_user_123',
    userName: 'Александр',  // Имя по умолчанию
    userData: {},
    userContext: null,
    testProgress: {},

    async init() {
        console.log('🚀 Фреди: инициализация');
        
        // Загружаем сохраненное имя из localStorage
        this.loadUserName();
        
        // Скрываем шапку чата
        const chatHeader = document.getElementById('chatHeader');
        if (chatHeader) chatHeader.style.display = 'none';
        
        // Обновляем имя в левой панели
        this.updateUserNameInUI();
        
        // Получаем статус пользователя с сервера
        await this.checkUserStatus();
        
        // Показываем модальное окно для ввода имени если нужно
        this.checkAndShowNameModal();
    },

    // Загрузка имени из localStorage
    loadUserName() {
        const savedName = localStorage.getItem('userName');
        if (savedName) {
            this.userName = savedName;
        } else {
            // Если нет сохраненного имени, покажем модальное окно
            this.showNameModal = true;
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
        
        // 2. В приветствии (если есть)
        const welcomeNameEl = document.getElementById('welcomeUserName');
        if (welcomeNameEl) welcomeNameEl.textContent = this.userName;
        
        // 3. В сообщениях пользователя (если нужно)
        const messageAuthorEls = document.querySelectorAll('.message.user-message .message-author');
        messageAuthorEls.forEach(el => {
            el.textContent = this.userName;
        });
        
        // 4. В модальном окне (подсказка)
        const nameInput = document.getElementById('userNameInput');
        if (nameInput) nameInput.placeholder = `Например, ${this.userName}`;
    },

    // Показать модальное окно для ввода имени
    showNameModal() {
        // Создаем модальное окно если его нет
        if (!document.getElementById('nameModal')) {
            const modalHTML = `
                <div id="nameModal" class="modal">
                    <div class="modal-content glass-panel">
                        <h2 class="modal-title">👋 Как вас зовут?</h2>
                        <p class="modal-subtitle">Введите ваше имя для персонализации</p>
                        
                        <div class="input-group">
                            <input type="text" id="userNameInput" class="modal-input" 
                                   placeholder="Ваше имя" maxlength="30" value="${this.userName !== 'Александр' ? this.userName : ''}">
                            <button onclick="App.handleNameSubmit()" class="modal-btn primary">
                                Сохранить
                            </button>
                        </div>
                        
                        <button onclick="App.closeNameModal()" class="modal-btn secondary">
                            Позже
                        </button>
                    </div>
                </div>
            `;
            
            // Добавляем стили для модального окна
            const style = document.createElement('style');
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
                }
                
                .modal-subtitle {
                    color: var(--max-text-secondary);
                    margin-bottom: 20px;
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
            `;
            document.head.appendChild(style);
            
            // Добавляем модальное окно в body
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        } else {
            // Если уже есть - показываем
            document.getElementById('nameModal').style.display = 'flex';
        }
    },

    // Обработка отправки имени
    handleNameSubmit() {
        const input = document.getElementById('userNameInput');
        if (!input) return;
        
        const name = input.value.trim();
        if (name) {
            this.saveUserName(name);
            this.closeNameModal();
        } else {
            alert('Пожалуйста, введите ваше имя');
        }
    },

    // Закрыть модальное окно
    closeNameModal() {
        const modal = document.getElementById('nameModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Проверка нужно ли показывать модальное окно
    checkAndShowNameModal() {
        // Показываем если имя не сохранено или это имя по умолчанию
        const savedName = localStorage.getItem('userName');
        if (!savedName || savedName === 'Александр') {
            // Немного задерживаем показ, чтобы не мешать онбордингу
            setTimeout(() => {
                this.showNameModal();
            }, 1000);
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
        
        // Обновляем имя в других местах шаблона
        const welcomeNameSpan = clone.querySelector('#welcomeUserName');
        if (welcomeNameSpan) welcomeNameSpan.textContent = this.userName;
        
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
                        alert('Функция сбора контекста временно недоступна');
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
        
        // Обновляем имя во втором экране
        const nameSpan = clone.querySelector('#userNamePlaceholder');
        if (nameSpan) nameSpan.textContent = this.userName;
        
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
                        alert('Начинаем тест!');
                    }
                });
            }
        }, 100);
    },

    showMainChat() {
        console.log('💬 Показываем основной чат');
        document.getElementById('screenContainer').innerHTML = 
            '<div style="padding: 20px; text-align: center;">Чат с ботом будет здесь</div>';
        document.getElementById('chatHeader').style.display = 'flex';
    }
};

// Запуск
document.addEventListener('DOMContentLoaded', () => App.init());

// Делаем App доступным глобально для вызова из HTML
window.App = App;
