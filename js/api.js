// api.js - API вызовы к бэкенду
const API = {
    baseUrl: 'https://max-bot-1-ywpz.onrender.com',
    
    async getUserFullStatus(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/user-status?user_id=${userId}`);
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения статуса:', error);
            return { success: false, has_profile: false, has_interpretation: false };
        }
    },
    
    async getUserProfile(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/get-profile?user_id=${userId}`);
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения профиля:', error);
            return null;
        }
    },
    
    async getTestInterpretation(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/get-test-interpretation?user_id=${userId}`);
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения интерпретации:', error);
            return { success: false, ready: false };
        }
    },
    
    async sendQuestion(userId, question) {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, message: question })
            });
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка отправки вопроса:', error);
            return { success: false, response: 'Ошибка соединения' };
        }
    },
    
    async saveContext(userId, contextData) {
        try {
            const response = await fetch(`${this.baseUrl}/api/save-context`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, context: contextData })
            });
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка сохранения контекста:', error);
            return { success: false };
        }
    },
    
    async setMode(userId, mode) {
        try {
            const response = await fetch(`${this.baseUrl}/api/save-mode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, mode: mode })
            });
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка сохранения режима:', error);
            return { success: false };
        }
    },
    
    async getSmartQuestions(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/smart-questions?user_id=${userId}`);
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения умных вопросов:', error);
            return { success: false, questions: [] };
        }
    },
    
    async getGoals(userId, mode = 'coach') {
        try {
            const response = await fetch(`${this.baseUrl}/api/goals?user_id=${userId}&mode=${mode}`);
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения целей:', error);
            return { success: false, goals: [] };
        }
    },
    
    async getThought(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/thought?user_id=${userId}`);
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения мыслей:', error);
            return { thought: null };
        }
    },
    
    async getIdeas(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/ideas?user_id=${userId}`);
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения идей:', error);
            return { ideas: [] };
        }
    }
};

window.API = API;
