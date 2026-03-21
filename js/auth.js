// auth.js - Получение данных пользователя из MAX
const Auth = {
    userId: null,
    userName: 'Гость',
    
    async init() {
        console.log('🔐 Auth: инициализация');
        
        if (window.maxContext) {
            console.log('📱 MAX контекст найден:', window.maxContext);
            
            if (window.maxContext.user_id) {
                this.userId = String(window.maxContext.user_id);
                console.log('👤 ID пользователя от MAX:', this.userId);
            }
            
            if (window.maxContext.user_name) {
                this.userName = window.maxContext.user_name;
                this.saveUserName(this.userName);
            }
            
            if (window.maxAPI && window.maxAPI.expand) {
                try {
                    window.maxAPI.expand();
                    console.log('📱 MAX приложение расширено');
                } catch (e) {
                    console.warn('Не удалось расширить приложение:', e);
                }
            }
        } else {
            // Для локальной разработки
            const urlParams = new URLSearchParams(window.location.search);
            this.userId = urlParams.get('user_id') || localStorage.getItem('userId') || 'test_user_123';
            this.userName = urlParams.get('user_name') || localStorage.getItem('userName') || 'Гость';
            console.warn('⚠️ MAX контекст не найден, режим разработки');
        }
        
        localStorage.setItem('userId', this.userId);
        
        return {
            userId: this.userId,
            userName: this.userName
        };
    },
    
    saveUserName(name) {
        if (name && name.trim()) {
            this.userName = name.trim();
            localStorage.setItem('userName', this.userName);
            
            if (window.maxAPI && window.maxAPI.sendEvent) {
                window.maxAPI.sendEvent({
                    type: 'user_name_updated',
                    data: { name: this.userName }
                });
            }
            return true;
        }
        return false;
    },
    
    getUserName() {
        return localStorage.getItem('userName') || this.userName;
    }
};

window.Auth = Auth;
