// ========== api.js ==========
// ПОЛНАЯ ВЕРСИЯ С РЕАЛЬНЫМИ ВЫЗОВАМИ API
// ВКЛЮЧАЕТ ВСЕ ЭНДПОИНТЫ ДЛЯ ТЕСТА И ИНТЕРПРЕТАЦИИ

// URL вашего бэкенда на Render
const API_BASE = 'https://max-bot-1-ywpz.onrender.com';

const api = {
    /**
     * Получает статус пользователя (базовая версия)
     */
    async getUserStatus(userId) {
        try {
            const response = await fetch(`${API_BASE}/api/user-data?user_id=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Преобразуем ответ бэкенда в формат, ожидаемый фронтендом
            return {
                user_id: data.user_id,
                user_name: data.user_name || 'друг',
                context_complete: false,
                test_completed: data.has_profile || false,
                first_visit: !data.has_profile
            };
        } catch (error) {
            console.error('❌ Ошибка получения статуса пользователя:', error);
            return {
                user_id: userId,
                user_name: 'друг',
                context_complete: false,
                test_completed: false,
                first_visit: true
            };
        }
    },
    
    /**
     * Получает полный статус пользователя (расширенная версия)
     */
    async getUserFullStatus(userId) {
        try {
            const response = await fetch(`${API_BASE}/api/user-status?user_id=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения полного статуса:', error);
            return {
                success: false,
                has_profile: false,
                has_interpretation: false,
                test_completed: false,
                interpretation_ready: false,
                profile_code: null
            };
        }
    },
    
    /**
     * Получает погоду для города
     */
    async getWeather(city) {
        try {
            // Пока нет отдельного эндпоинта для погоды, 
            // возвращаем тестовые данные
            return {
                icon: '🌤',
                description: 'тестовый режим',
                temp: '+15'
            };
        } catch (error) {
            console.error('❌ Ошибка получения погоды:', error);
            return null;
        }
    },
    
    /**
     * Сохраняет контекст пользователя (город, пол, возраст)
     */
    async saveContext(userId, contextData) {
        try {
            const response = await fetch(`${API_BASE}/api/save-context`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    context: contextData
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка сохранения контекста:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Получает профиль пользователя
     */
    async getUserProfile(userId) {
        try {
            const response = await fetch(`${API_BASE}/api/get-profile?user_id=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения профиля:', error);
            return null;
        }
    },
    
    /**
     * Сохраняет профиль пользователя
     */
    async saveUserProfile(userId, profileData) {
        try {
            const response = await fetch(`${API_BASE}/api/save-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    profile: profileData
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка сохранения профиля:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Получает мысли психолога
     */
    async getPsychologistThought(userId) {
        try {
            const response = await fetch(`${API_BASE}/api/thought?user_id=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.thought;
        } catch (error) {
            console.error('❌ Ошибка получения мыслей:', error);
            return null;
        }
    },
    
    /**
     * Получает идеи на выходные
     */
    async getWeekendIdeas(userId) {
        try {
            const response = await fetch(`${API_BASE}/api/ideas?user_id=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.ideas || [];
        } catch (error) {
            console.error('❌ Ошибка получения идей:', error);
            return [];
        }
    },
    
    /**
     * Получает прогресс теста
     */
    async getTestProgress(userId) {
        try {
            const response = await fetch(`${API_BASE}/api/get-test-progress?user_id=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения прогресса теста:', error);
            return {
                stage1_complete: false,
                stage2_complete: false,
                stage3_complete: false,
                stage4_complete: false,
                stage5_complete: false,
                answers_count: 0,
                current_stage: 1
            };
        }
    },
    
    /**
     * Сохраняет прогресс теста (поэтапно)
     */
    async saveTestProgress(userId, stage, answers) {
        try {
            const response = await fetch(`${API_BASE}/api/save-test-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    stage: stage,
                    answers: answers
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка сохранения прогресса теста:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Сохраняет полные результаты теста (после завершения всех этапов)
     */
    async saveTestResults(userId, results) {
        try {
            const response = await fetch(`${API_BASE}/api/save-test-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    results: results
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка сохранения результатов теста:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Получает интерпретацию теста (опрашивает сервер)
     */
    async getTestInterpretation(userId) {
        try {
            const response = await fetch(`${API_BASE}/api/get-test-interpretation?user_id=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения интерпретации:', error);
            return { success: false, ready: false, interpretation: null };
        }
    },
    
    /**
     * Сохраняет режим общения
     */
    async saveCommunicationMode(userId, mode) {
        try {
            const response = await fetch(`${API_BASE}/api/save-mode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    mode: mode
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка сохранения режима:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Синхронизирует все данные
     */
    async syncAllData(userId, data) {
        try {
            const response = await fetch(`${API_BASE}/api/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    data: data
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка синхронизации:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Получает вопрос теста
     */
    async getTestQuestion(userId, stage, index) {
        try {
            const response = await fetch(`${API_BASE}/api/test/question?user_id=${userId}&stage=${stage}&index=${index}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения вопроса:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Отправляет ответ на вопрос теста
     */
    async submitTestAnswer(userId, stage, questionIndex, answer, option) {
        try {
            const response = await fetch(`${API_BASE}/api/test/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    stage: stage,
                    question_index: questionIndex,
                    answer: answer,
                    option: option
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка отправки ответа:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Получает результаты этапа теста
     */
    async getTestStageResults(userId, stage) {
        try {
            const response = await fetch(`${API_BASE}/api/test/results?user_id=${userId}&stage=${stage}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения результатов этапа:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Проверяет работу базы данных
     */
    async checkDatabase() {
        try {
            const response = await fetch(`${API_BASE}/api/check-db`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка проверки БД:', error);
            return { status: 'error', message: error.message };
        }
    },
    
    /**
     * Получает логи пользователя (только для админов)
     */
    async getUserLogs(userId) {
        try {
            const response = await fetch(`${API_BASE}/api/logs/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('❌ Ошибка получения логов:', error);
            return { error: error.message };
        }
    }
};

// Делаем API доступным глобально
window.api = api;

// Для отладки
console.log('✅ API инициализирован, базовый URL:', API_BASE);
console.log('✅ Доступные методы:', Object.keys(api));
