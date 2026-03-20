// ========== test.js ==========
// ТЕСТ КАК В TELEGRAM - С РАСЧЕТОМ ТИПА ВОСПРИЯТИЯ

const Test = {
    // Текущее состояние
    currentStage: 0,
    currentQuestionIndex: 0,
    userId: null,
    answers: {},
    
    // Данные для расчетов
    perceptionScores: {
        EXTERNAL: 0,
        INTERNAL: 0,
        SYMBOLIC: 0,
        MATERIAL: 0
    },
    perceptionType: null,  // Будет определен после этапа 1
    perceptionDescription: null,
    
    // Структура теста
    stages: [
        { 
            id: 'perception', 
            name: '🧠 ЭТАП 1/5: КОНФИГУРАЦИЯ ВОСПРИЯТИЯ',
            description: 'Линза, через которую вы смотрите на мир',
            total: 8
        },
        { 
            id: 'thinking', 
            name: '🧠 ЭТАП 2/5: КОНФИГУРАЦИЯ МЫШЛЕНИЯ',
            description: 'Как вы обрабатываете информацию',
            total: null  // Будет определено после этапа 1
        },
        { 
            id: 'behavior', 
            name: '🧠 ЭТАП 3/5: КОНФИГУРАЦИЯ ПОВЕДЕНИЯ',
            description: 'Ваши автоматические реакции',
            total: 8
        },
        { 
            id: 'growth', 
            name: '🧠 ЭТАП 4/5: ТОЧКА РОСТА',
            description: 'Где находится рычаг изменений',
            total: 8
        },
        { 
            id: 'deep', 
            name: '🧠 ЭТАП 5/5: ГЛУБИННЫЕ ПАТТЕРНЫ',
            description: 'Тип привязанности, защитные механизмы',
            total: 10
        }
    ],
    
    // Вопросы этапа 1 (8 вопросов) - с баллами для расчета
    perception_questions: [
        {
            id: 'p1',
            text: 'Когда вы заходите в новую компанию, что замечаете в первую очередь?',
            options: [
                { text: '👥 Кто с кем общается и какие между ними отношения', scores: { EXTERNAL: 2, SYMBOLIC: 1 } },
                { text: '🤔 Что здесь происходит и каковы правила', scores: { EXTERNAL: 1, MATERIAL: 2 } },
                { text: '💡 Какие здесь есть возможности и идеи', scores: { INTERNAL: 2, SYMBOLIC: 1 } },
                { text: '⚡ Кто здесь главный и какую позицию занять', scores: { EXTERNAL: 2, MATERIAL: 2 } }
            ]
        },
        {
            id: 'p2',
            text: 'Какое утверждение больше про вас?',
            options: [
                { text: '🎨 Я чувствую атмосферу и настроение людей', scores: { EXTERNAL: 2, SYMBOLIC: 2 } },
                { text: '📊 Я анализирую факты и логику', scores: { INTERNAL: 2, MATERIAL: 1 } },
                { text: '🔮 Я вижу потенциал и будущие возможности', scores: { INTERNAL: 2, SYMBOLIC: 2 } },
                { text: '🏃 Я действую быстро, не задумываясь', scores: { EXTERNAL: 1, MATERIAL: 2 } }
            ]
        },
        {
            id: 'p3',
            text: 'В конфликтной ситуации вы обычно:',
            options: [
                { text: '❤️ Стараетесь сгладить и сохранить отношения', scores: { EXTERNAL: 2, SYMBOLIC: 2 } },
                { text: '⚖️ Ищете справедливое решение', scores: { INTERNAL: 2, MATERIAL: 1 } },
                { text: '💭 Анализируете причины конфликта', scores: { INTERNAL: 2, SYMBOLIC: 1 } },
                { text: '🛡️ Защищаете свои интересы', scores: { EXTERNAL: 1, MATERIAL: 2 } }
            ]
        },
        {
            id: 'p4',
            text: 'Что для вас важнее в работе?',
            options: [
                { text: '🤝 Хорошие отношения в коллективе', scores: { EXTERNAL: 2, SYMBOLIC: 2 } },
                { text: '💰 Достойная оплата труда', scores: { EXTERNAL: 1, MATERIAL: 2 } },
                { text: '💡 Интересные задачи', scores: { INTERNAL: 2, SYMBOLIC: 1 } },
                { text: '🏆 Признание и статус', scores: { EXTERNAL: 2, MATERIAL: 2 } }
            ]
        },
        {
            id: 'p5',
            text: 'Когда вы принимаете важное решение, вы опираетесь на:',
            options: [
                { text: '🗣 Мнение близких людей', scores: { EXTERNAL: 2, SYMBOLIC: 1 } },
                { text: '📊 Факты и цифры', scores: { INTERNAL: 2, MATERIAL: 2 } },
                { text: '💭 Интуицию и внутреннее чутье', scores: { INTERNAL: 2, SYMBOLIC: 2 } },
                { text: '⚖️ Анализ рисков и выгоды', scores: { EXTERNAL: 1, MATERIAL: 2 } }
            ]
        },
        {
            id: 'p6',
            text: 'Что вас чаще всего тревожит?',
            options: [
                { text: '👥 Что обо мне подумают другие', scores: { EXTERNAL: 2, SYMBOLIC: 2 } },
                { text: '💰 Материальная нестабильность', scores: { EXTERNAL: 1, MATERIAL: 2 } },
                { text: '🔮 Неопределенность будущего', scores: { INTERNAL: 2, SYMBOLIC: 1 } },
                { text: '⚡ Потеря контроля над ситуацией', scores: { INTERNAL: 1, MATERIAL: 2 } }
            ]
        },
        {
            id: 'p7',
            text: 'Как вы обычно проводите выходной день?',
            options: [
                { text: '👫 Встречаюсь с друзьями или семьей', scores: { EXTERNAL: 2, SYMBOLIC: 1 } },
                { text: '🏠 Занимаюсь домашними делами', scores: { INTERNAL: 1, MATERIAL: 2 } },
                { text: '📚 Читаю, учусь новому', scores: { INTERNAL: 2, SYMBOLIC: 2 } },
                { text: '🎮 Отдыхаю, ничего не делаю', scores: { INTERNAL: 1, SYMBOLIC: 1 } }
            ]
        },
        {
            id: 'p8',
            text: 'Что для вас значит успех?',
            options: [
                { text: '❤️ Гармоничные отношения с близкими', scores: { EXTERNAL: 2, SYMBOLIC: 2 } },
                { text: '💰 Финансовая независимость', scores: { EXTERNAL: 1, MATERIAL: 2 } },
                { text: '🎯 Самореализация и развитие', scores: { INTERNAL: 2, SYMBOLIC: 1 } },
                { text: '🏅 Признание и уважение', scores: { EXTERNAL: 2, MATERIAL: 2 } }
            ]
        }
    ],
    
    // Вопросы этапа 2 для разных типов восприятия
    thinking_questions: {
        // Для СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ и СТАТУСНО-ОРИЕНТИРОВАННЫЙ (12 вопросов)
        external: [
            {
                id: 't1',
                text: 'Когда вы сталкиваетесь с проблемой, вы:',
                options: [
                    '📚 Ищете похожий опыт у других',
                    '🧩 Раскладываете на части и анализируете',
                    '💫 Доверяете интуиции',
                    '🤝 Советуетесь с экспертами'
                ]
            },
            {
                id: 't2',
                text: 'Что вам легче всего?',
                options: [
                    '🔍 Замечать детали в поведении людей',
                    '📈 Видеть тренды и тенденции',
                    '🎯 Находить нестандартные решения',
                    '📝 Действовать по инструкции'
                ]
            },
            {
                id: 't3',
                text: 'Как вы принимаете важные решения?',
                options: [
                    '⚖️ Взвешиваете все за и против',
                    '💭 Прислушиваетесь к внутреннему голосу',
                    '👥 Советуетесь с близкими',
                    '⏰ Откладываете, пока всё не решится само'
                ]
            },
            {
                id: 't4',
                text: 'Что вы делаете, когда получаете новую информацию?',
                options: [
                    '🔗 Связываю с тем, что уже знаю',
                    '❓ Задаю много вопросов',
                    '📝 Запоминаю основные моменты',
                    '🤔 Думаю, как это можно применить'
                ]
            },
            {
                id: 't5',
                text: 'Как вы относитесь к сложным теориям и концепциям?',
                options: [
                    '😫 С трудом воспринимаю абстракции',
                    '📚 Могу разобраться, если нужно',
                    '💡 Люблю искать глубинные смыслы',
                    '🛠 Ищу практическое применение'
                ]
            },
            {
                id: 't6',
                text: 'Когда вы объясняете что-то другому, вы:',
                options: [
                    '📖 Рассказываете последовательно, шаг за шагом',
                    '🎨 Используете метафоры и образы',
                    '📊 Показываете схему или структуру',
                    '🤷 Затрудняетесь объяснить'
                ]
            },
            {
                id: 't7',
                text: 'Что для вас важнее при планировании?',
                options: [
                    '🎯 Конкретная цель и сроки',
                    '🔄 Гибкость и возможность менять план',
                    '📋 Четкая последовательность шагов',
                    '🌈 Вдохновение и идеи'
                ]
            },
            {
                id: 't8',
                text: 'Как вы относитесь к критике?',
                options: [
                    '👂 Внимательно слушаю и анализирую',
                    '🛡️ Защищаюсь и объясняю свою позицию',
                    '😔 Расстраиваюсь и переживаю',
                    '🤷 Пропускаю мимо ушей'
                ]
            },
            {
                id: 't9',
                text: 'Как вы запоминаете информацию?',
                options: [
                    '👀 Лучше вижу образы',
                    '👂 Лучше слышу и проговариваю',
                    '✍️ Лучше записываю',
                    '🔄 Лучше проживаю на практике'
                ]
            },
            {
                id: 't10',
                text: 'Что для вас важнее в общении?',
                options: [
                    '🤝 Результат и договоренности',
                    '💕 Эмоции и атмосфера',
                    '🔍 Смысл и содержание',
                    '🎭 Впечатление и статус'
                ]
            },
            {
                id: 't11',
                text: 'Как вы решаете сложные задачи?',
                options: [
                    '🧩 Разбиваю на маленькие шаги',
                    '💡 Ищу нестандартный подход',
                    '👥 Привлекаю команду',
                    '⚡ Делаю быстро, не задумываясь'
                ]
            },
            {
                id: 't12',
                text: 'Что вас вдохновляет?',
                options: [
                    '🏆 Достижения и успехи',
                    '❤️ Отношения и поддержка',
                    '🎯 Цели и мечты',
                    '🌈 Красота и гармония'
                ]
            }
        ],
        
        // Для СМЫСЛО-ОРИЕНТИРОВАННЫЙ и ПРАКТИКО-ОРИЕНТИРОВАННЫЙ (10 вопросов)
        internal: [
            {
                id: 't1',
                text: 'Когда вы сталкиваетесь с проблемой, вы:',
                options: [
                    '📚 Ищете похожий опыт и готовые решения',
                    '🧩 Раскладываете на части и анализируете',
                    '💫 Доверяете интуиции и первому впечатлению',
                    '🤝 Советуетесь с другими'
                ]
            },
            {
                id: 't2',
                text: 'Что вам легче всего?',
                options: [
                    '🔍 Замечать детали и нюансы',
                    '📈 Видеть общую картину и тенденции',
                    '🎯 Находить нестандартные решения',
                    '📝 Действовать по инструкции'
                ]
            },
            {
                id: 't3',
                text: 'Как вы принимаете важные решения?',
                options: [
                    '⚖️ Взвешиваете все за и против',
                    '💭 Прислушиваетесь к внутреннему голосу',
                    '👥 Советуетесь с близкими',
                    '⏰ Откладываете, пока всё не решится само'
                ]
            },
            {
                id: 't4',
                text: 'Что вы делаете, когда получаете новую информацию?',
                options: [
                    '🔗 Связываю с тем, что уже знаю',
                    '❓ Задаю много вопросов',
                    '📝 Запоминаю основные моменты',
                    '🤔 Думаю, как это можно применить'
                ]
            },
            {
                id: 't5',
                text: 'Как вы относитесь к сложным теориям и концепциям?',
                options: [
                    '😫 С трудом воспринимаю абстракции',
                    '📚 Могу разобраться, если нужно',
                    '💡 Люблю искать глубинные смыслы',
                    '🛠 Ищу практическое применение'
                ]
            },
            {
                id: 't6',
                text: 'Когда вы объясняете что-то другому, вы:',
                options: [
                    '📖 Рассказываете последовательно, шаг за шагом',
                    '🎨 Используете метафоры и образы',
                    '📊 Показываете схему или структуру',
                    '🤷 Затрудняетесь объяснить'
                ]
            },
            {
                id: 't7',
                text: 'Что для вас важнее при планировании?',
                options: [
                    '🎯 Конкретная цель и сроки',
                    '🔄 Гибкость и возможность менять план',
                    '📋 Четкая последовательность шагов',
                    '🌈 Вдохновение и идеи'
                ]
            },
            {
                id: 't8',
                text: 'Как вы относитесь к критике?',
                options: [
                    '👂 Внимательно слушаю и анализирую',
                    '🛡️ Защищаюсь и объясняю свою позицию',
                    '😔 Расстраиваюсь и переживаю',
                    '🤷 Пропускаю мимо ушей'
                ]
            },
            {
                id: 't9',
                text: 'Как вы запоминаете информацию?',
                options: [
                    '👀 Лучше вижу образы',
                    '👂 Лучше слышу и проговариваю',
                    '✍️ Лучше записываю',
                    '🔄 Лучше проживаю на практике'
                ]
            },
            {
                id: 't10',
                text: 'Что для вас важнее в общении?',
                options: [
                    '🤝 Результат и договоренности',
                    '💕 Эмоции и атмосфера',
                    '🔍 Смысл и содержание',
                    '🎭 Впечатление и статус'
                ]
            }
        ]
    },
    
    // Остальные вопросы (этапы 3, 4, 5) - как в предыдущей версии
    behavior_questions: [ /* ... 8 вопросов ... */ ],
    growth_questions: [ /* ... 8 вопросов ... */ ],
    deep_questions: [ /* ... 10 вопросов ... */ ],
    
    // Функция расчета типа восприятия
    calculatePerceptionType() {
        const scores = this.perceptionScores;
        const attention = scores.EXTERNAL > scores.INTERNAL ? "EXTERNAL" : "INTERNAL";
        const anxiety = scores.SYMBOLIC > scores.MATERIAL ? "SYMBOLIC" : "MATERIAL";
        
        if (attention === "EXTERNAL" && anxiety === "SYMBOLIC") {
            return {
                type: "СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ",
                description: "Вам важно, что думают другие, вы чутко считываете настроение и ожидания окружающих.",
                questionsCount: 12
            };
        }
        else if (attention === "EXTERNAL" && anxiety === "MATERIAL") {
            return {
                type: "СТАТУСНО-ОРИЕНТИРОВАННЫЙ",
                description: "Для вас важны статус, положение и материальные достижения.",
                questionsCount: 12
            };
        }
        else if (attention === "INTERNAL" && anxiety === "SYMBOLIC") {
            return {
                type: "СМЫСЛО-ОРИЕНТИРОВАННЫЙ",
                description: "Для вас важнее ваши внутренние ощущения и поиск смысла.",
                questionsCount: 10
            };
        }
        else {
            return {
                type: "ПРАКТИКО-ОРИЕНТИРОВАННЫЙ",
                description: "Вы ориентированы на практические результаты и конкретные действия.",
                questionsCount: 10
            };
        }
    },
    
    // Получить вопросы для этапа 2
    getThinkingQuestions() {
        if (!this.perceptionType) {
            // Если еще не рассчитан, используем внешние как запасной вариант
            return this.thinking_questions.external;
        }
        
        if (this.perceptionType === "СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ" || 
            this.perceptionType === "СТАТУСНО-ОРИЕНТИРОВАННЫЙ") {
            return this.thinking_questions.external;
        } else {
            return this.thinking_questions.internal;
        }
    },
    
    // Получить текущий набор вопросов
    getCurrentQuestions() {
        const stage = this.stages[this.currentStage];
        
        switch(stage.id) {
            case 'perception':
                return this.perception_questions;
            case 'thinking':
                return this.getThinkingQuestions();
            case 'behavior':
                return this.behavior_questions;
            case 'growth':
                return this.growth_questions;
            case 'deep':
                return this.deep_questions;
            default:
                return [];
        }
    },
    
    // Обработка ответа на этапе 1
    handlePerceptionAnswer(questionIndex, optionIndex) {
        const question = this.perception_questions[questionIndex];
        const option = question.options[optionIndex];
        
        // Суммируем баллы
        if (option.scores) {
            this.perceptionScores.EXTERNAL += option.scores.EXTERNAL || 0;
            this.perceptionScores.INTERNAL += option.scores.INTERNAL || 0;
            this.perceptionScores.SYMBOLIC += option.scores.SYMBOLIC || 0;
            this.perceptionScores.MATERIAL += option.scores.MATERIAL || 0;
        }
    },
    
    // Завершение этапа 1
    finishStage1() {
        const result = this.calculatePerceptionType();
        this.perceptionType = result.type;
        this.perceptionDescription = result.description;
        
        // Устанавливаем количество вопросов для этапа 2
        this.stages[1].total = result.questionsCount;
        
        // Сохраняем результат
        if (App && App.userId) {
            const userData = JSON.parse(localStorage.getItem(`user_${App.userId}`) || '{}');
            userData.perceptionType = this.perceptionType;
            userData.perceptionDescription = this.perceptionDescription;
            localStorage.setItem(`user_${App.userId}`, JSON.stringify(userData));
        }
        
        // Показываем результат
        this.addBotMessage(`✨ **ТИП ВОСПРИЯТИЯ ОПРЕДЕЛЕН**\n\n${this.perceptionType}\n\n${this.perceptionDescription}`);
        
        setTimeout(() => {
            this.sendStageIntro();
        }, 2000);
    },
    
    // Обработка ответа
    handleAnswer(stageId, questionId, optionIndex, optionText) {
        const answerKey = `${stageId}_${questionId}`;
        this.answers[answerKey] = optionIndex;
        
        // Если это этап 1, считаем баллы
        if (stageId === 'perception') {
            this.handlePerceptionAnswer(this.currentQuestionIndex, optionIndex);
        }
        
        // Сохраняем прогресс
        this.saveProgress();
        
        // Переходим к следующему вопросу
        this.currentQuestionIndex++;
        
        // Проверяем, завершен ли этап
        const stage = this.stages[this.currentStage];
        if (this.currentQuestionIndex >= stage.total) {
            // Завершаем этап
            this.currentQuestionIndex = 0;
            
            if (stageId === 'perception') {
                // Для этапа 1 - показываем результат и переходим к этапу 2
                setTimeout(() => {
                    this.finishStage1();
                }, 800);
            } else {
                // Для остальных этапов
                this.currentStage++;
                
                if (this.currentStage < this.stages.length) {
                    setTimeout(() => {
                        this.sendStageIntro();
                    }, 1000);
                } else {
                    setTimeout(() => {
                        this.showResults();
                    }, 1000);
                }
            }
        } else {
            // Небольшая пауза перед следующим вопросом
            setTimeout(() => {
                this.sendNextQuestion();
            }, 800);
        }
    },
    
    // Отправить вступление к этапу
    sendStageIntro() {
        const stage = this.stages[this.currentStage];
        
        // Для этапа 2 показываем информацию о типе восприятия
        if (stage.id === 'thinking' && this.perceptionType) {
            this.addBotMessage(`${stage.name}\n${stage.description}\n\n🧠 Ваш тип восприятия: ${this.perceptionType}\n📊 Всего вопросов: ${stage.total}`);
        } else {
            this.addBotMessage(`${stage.name}\n${stage.description}\n\n📊 Всего вопросов: ${stage.total}`);
        }
        
        setTimeout(() => {
            this.sendNextQuestion();
        }, 2000);
    },
    
    // Добавить сообщение бота с вопросом и кнопками
    addQuestionMessage(text, options, callback, currentQuestion, totalQuestions) {
        const messagesList = document.getElementById('testMessagesList');
        if (!messagesList) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        // Добавляем прогресс
        const progress = `📊 Вопрос ${currentQuestion}/${totalQuestions}`;
        
        let buttonsHtml = '<div class="message-buttons">';
        options.forEach((option, index) => {
            // Если option это объект (с текстом и баллами), берем текст
            const optionText = typeof option === 'object' ? option.text : option;
            buttonsHtml += `
                <button class="message-button" data-option-index="${index}">
                    ${optionText}
                </button>
            `;
        });
        buttonsHtml += '</div>';
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-text">${text}</div>
                ${buttonsHtml}
                <div class="message-time">${progress}</div>
            </div>
        `;
        
        messagesList.appendChild(messageDiv);
        
        // Добавляем обработчики для кнопок
        const buttons = messageDiv.querySelectorAll('.message-button');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.optionIndex);
                
                // Получаем текст опции
                const option = options[index];
                const optionText = typeof option === 'object' ? option.text : option;
                
                // Добавляем сообщение пользователя
                this.addUserMessage(optionText);
                
                // Удаляем кнопки из сообщения бота
                const buttonsContainer = messageDiv.querySelector('.message-buttons');
                if (buttonsContainer) {
                    buttonsContainer.remove();
                }
                
                // Вызываем callback
                callback(index);
            });
        });
        
        // Прокрутка вниз
        setTimeout(() => {
            const container = document.getElementById('testMessagesContainer');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 50);
    },
    
    // Инициализация теста
    init(userId) {
        this.userId = userId || App?.userId || 'test_user';
        this.currentStage = 0;
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.perceptionScores = { EXTERNAL: 0, INTERNAL: 0, SYMBOLIC: 0, MATERIAL: 0 };
        this.perceptionType = null;
        
        // Загружаем сохраненные ответы если есть
        this.loadProgress();
        
        console.log('📝 Тест инициализирован для пользователя:', this.userId);
    },
    
    // Загрузка прогресса
    loadProgress() {
        const saved = localStorage.getItem(`test_${this.userId}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentStage = data.currentStage || 0;
                this.currentQuestionIndex = data.currentQuestionIndex || 0;
                this.answers = data.answers || {};
                this.perceptionScores = data.perceptionScores || { EXTERNAL: 0, INTERNAL: 0, SYMBOLIC: 0, MATERIAL: 0 };
                this.perceptionType = data.perceptionType || null;
                
                // Если есть тип восприятия, обновляем количество вопросов для этапа 2
                if (this.perceptionType) {
                    if (this.perceptionType === "СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ" || 
                        this.perceptionType === "СТАТУСНО-ОРИЕНТИРОВАННЫЙ") {
                        this.stages[1].total = 12;
                    } else {
                        this.stages[1].total = 10;
                    }
                }
                
                console.log('📂 Загружен прогресс теста, этап:', this.currentStage + 1, 'вопрос:', this.currentQuestionIndex + 1);
            } catch (e) {
                console.warn('❌ Ошибка загрузки прогресса:', e);
            }
        }
    },
    
    // Сохранение прогресса
    saveProgress() {
        const data = {
            currentStage: this.currentStage,
            currentQuestionIndex: this.currentQuestionIndex,
            answers: this.answers,
            perceptionScores: this.perceptionScores,
            perceptionType: this.perceptionType,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(`test_${this.userId}`, JSON.stringify(data));
        console.log('💾 Прогресс сохранен');
    },
    
    // Начать тест
    start() {
        this.currentStage = 0;
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.perceptionScores = { EXTERNAL: 0, INTERNAL: 0, SYMBOLIC: 0, MATERIAL: 0 };
        this.perceptionType = null;
        this.saveProgress();
        this.showTestScreen();
        
        // Показываем приветственное сообщение
        setTimeout(() => {
            this.addBotMessage(
                '🧠 Начинаем тест из 5 этапов. Я буду задавать вопросы, а ты выбирай ответы.'
            );
            
            // Через секунду показываем первый этап
            setTimeout(() => {
                this.sendStageIntro();
            }, 1000);
        }, 100);
    },
    
    // Показать экран теста
    showTestScreen() {
        const container = document.getElementById('screenContainer');
        
        container.innerHTML = `
            <div class="test-messages-container" id="testMessagesContainer">
                <div class="test-messages-list" id="testMessagesList"></div>
            </div>
        `;
        
        // Добавляем стили
        this.addTestStyles();
    },
    
    // Отправить следующий вопрос
    sendNextQuestion() {
        if (this.currentStage >= this.stages.length) {
            this.showResults();
            return;
        }
        
        const stage = this.stages[this.currentStage];
        const questions = this.getCurrentQuestions();
        const totalQuestions = stage.total;
        
        // Проверяем, что индекс в пределах
        if (this.currentQuestionIndex >= totalQuestions) {
            return; // Должно обрабатываться в handleAnswer
        }
        
        const question = questions[this.currentQuestionIndex];
        
        // Показываем вопрос с кнопками
        this.addQuestionMessage(
            question.text,
            question.options,
            (selectedIndex) => {
                this.handleAnswer(stage.id, question.id, selectedIndex, question.options[selectedIndex]);
            },
            this.currentQuestionIndex + 1,
            totalQuestions
        );
    },
    
    // Добавить сообщение бота (без кнопок)
    addBotMessage(text) {
        const messagesList = document.getElementById('testMessagesList');
        if (!messagesList) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-text">${text}</div>
                <div class="message-time">только что</div>
            </div>
        `;
        
        messagesList.appendChild(messageDiv);
        
        // Прокрутка вниз
        setTimeout(() => {
            const container = document.getElementById('testMessagesContainer');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 50);
    },
    
    // Добавить сообщение пользователя
    addUserMessage(text) {
        const messagesList = document.getElementById('testMessagesList');
        if (!messagesList) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-text">${text}</div>
                <div class="message-time">только что</div>
                <div class="message-status">
                    <span class="status-icon sent"></span>
                </div>
            </div>
        `;
        
        messagesList.appendChild(messageDiv);
        
        // Прокрутка вниз
        setTimeout(() => {
            const container = document.getElementById('testMessagesContainer');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 50);
    },
    
    // Показать результаты
    showResults() {
        this.addBotMessage('✅ Тест завершен! Спасибо за ответы.');
        
        // Сохраняем результаты
        if (App && App.userId) {
            localStorage.setItem(`test_results_${App.userId}`, JSON.stringify(this.answers));
            
            // Сохраняем тип восприятия
            if (this.perceptionType) {
                const userData = JSON.parse(localStorage.getItem(`user_${App.userId}`) || '{}');
                userData.perceptionType = this.perceptionType;
                userData.perceptionDescription = this.perceptionDescription;
                localStorage.setItem(`user_${App.userId}`, JSON.stringify(userData));
            }
        }
        
        // Через 2 секунды переходим в чат
        setTimeout(() => {
            if (App && App.showMainChat) {
                App.showMainChat();
            }
        }, 2000);
    },
    
    // Добавление стилей теста
    addTestStyles() {
        if (document.getElementById('testStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'testStyles';
        style.textContent = `
            .test-messages-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                overflow-y: auto;
                padding: 16px;
                position: relative;
            }
            
            .test-messages-list {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .message-buttons {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-top: 12px;
            }
            
            .message-button {
                width: 100%;
                padding: 12px 16px;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 30px;
                color: var(--max-text);
                font-size: 15px;
                text-align: left;
                cursor: pointer;
                transition: all 0.2s;
                backdrop-filter: blur(8px);
            }
            
            .message-button:hover {
                background: var(--max-hover);
                border-color: var(--max-blue);
                transform: translateY(-1px);
            }
            
            .message-button:active {
                transform: translateY(0);
            }
            
            /* Анимации */
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .message {
                animation: slideIn 0.3s ease;
            }
            
            .message-button {
                animation: slideIn 0.3s ease;
            }
        `;
        
        document.head.appendChild(style);
    }
};

// Делаем Test доступным глобально
window.Test = Test;
