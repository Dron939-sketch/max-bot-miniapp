// ========== test.js ==========
// ТЕСТ КАК В TELEGRAM - ТОЧНОЕ КОЛИЧЕСТВО ВОПРОСОВ

const Test = {
    // Текущее состояние
    currentStage: 0,
    currentQuestionIndex: 0,
    userId: null,
    answers: {},
    
    // Структура теста с точным количеством вопросов
    stages: [
        { 
            id: 'perception', 
            name: '🧠 ЭТАП 1/5: КОНФИГУРАЦИЯ ВОСПРИЯТИЯ',
            description: 'Линза, через которую вы смотрите на мир',
            total: 8  // ✅ ТОЧНО: 8 вопросов
        },
        { 
            id: 'thinking', 
            name: '🧠 ЭТАП 2/5: КОНФИГУРАЦИЯ МЫШЛЕНИЯ',
            description: 'Как вы обрабатываете информацию',
            total: 8  // ✅ ТОЧНО: 8 вопросов
        },
        { 
            id: 'behavior', 
            name: '🧠 ЭТАП 3/5: КОНФИГУРАЦИЯ ПОВЕДЕНИЯ',
            description: 'Ваши автоматические реакции',
            total: 8  // ✅ ТОЧНО: 8 вопросов
        },
        { 
            id: 'growth', 
            name: '🧠 ЭТАП 4/5: ТОЧКА РОСТА',
            description: 'Где находится рычаг изменений',
            total: 8  // ✅ ТОЧНО: 8 вопросов
        },
        { 
            id: 'deep', 
            name: '🧠 ЭТАП 5/5: ГЛУБИННЫЕ ПАТТЕРНЫ',
            description: 'Тип привязанности, защитные механизмы',
            total: 10  // ✅ ТОЧНО: 10 вопросов
        }
    ],
    
    // Вопросы этапа 1 (8 вопросов) - ВОСПРИЯТИЕ
    perception_questions: [
        {
            id: 'p1',
            text: 'Когда вы заходите в новую компанию, что замечаете в первую очередь?',
            options: [
                '👥 Кто с кем общается и какие между ними отношения',
                '🤔 Что здесь происходит и каковы правила',
                '💡 Какие здесь есть возможности и идеи',
                '⚡ Кто здесь главный и какую позицию занять'
            ]
        },
        {
            id: 'p2',
            text: 'Какое утверждение больше про вас?',
            options: [
                '🎨 Я чувствую атмосферу и настроение людей',
                '📊 Я анализирую факты и логику',
                '🔮 Я вижу потенциал и будущие возможности',
                '🏃 Я действую быстро, не задумываясь'
            ]
        },
        {
            id: 'p3',
            text: 'В конфликтной ситуации вы обычно:',
            options: [
                '❤️ Стараетесь сгладить и сохранить отношения',
                '⚖️ Ищете справедливое решение',
                '💭 Анализируете причины конфликта',
                '🛡️ Защищаете свои интересы'
            ]
        },
        {
            id: 'p4',
            text: 'Что для вас важнее в работе?',
            options: [
                '🤝 Хорошие отношения в коллективе',
                '💰 Достойная оплата труда',
                '💡 Интересные задачи',
                '🏆 Признание и статус'
            ]
        },
        {
            id: 'p5',
            text: 'Когда вы принимаете важное решение, вы опираетесь на:',
            options: [
                '🗣 Мнение близких людей',
                '📊 Факты и цифры',
                '💭 Интуицию и внутреннее чутье',
                '⚖️ Анализ рисков и выгоды'
            ]
        },
        {
            id: 'p6',
            text: 'Что вас чаще всего тревожит?',
            options: [
                '👥 Что обо мне подумают другие',
                '💰 Материальная нестабильность',
                '🔮 Неопределенность будущего',
                '⚡ Потеря контроля над ситуацией'
            ]
        },
        {
            id: 'p7',
            text: 'Как вы обычно проводите выходной день?',
            options: [
                '👫 Встречаюсь с друзьями или семьей',
                '🏠 Занимаюсь домашними делами',
                '📚 Читаю, учусь новому',
                '🎮 Отдыхаю, ничего не делаю'
            ]
        },
        {
            id: 'p8',
            text: 'Что для вас значит успех?',
            options: [
                '❤️ Гармоничные отношения с близкими',
                '💰 Финансовая независимость',
                '🎯 Самореализация и развитие',
                '🏅 Признание и уважение'
            ]
        }
    ],
    
    // Вопросы этапа 2 (8 вопросов) - МЫШЛЕНИЕ
    thinking_questions: [
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
        }
    ],
    
    // Вопросы этапа 3 (8 вопросов) - ПОВЕДЕНИЕ
    behavior_questions: [
        {
            id: 'b1',
            text: 'В стрессовой ситуации вы:',
            options: [
                '🏃‍♂️ Начинаете действовать быстро и активно',
                '🧊 Замираете и наблюдаете',
                '🗣 Ищете поддержку у других',
                '🎭 Делаете вид, что всё нормально'
            ]
        },
        {
            id: 'b2',
            text: 'Когда кто-то критикует вас, вы:',
            options: [
                '👂 Внимательно слушаете и анализируете',
                '🛡️ Защищаетесь и объясняете',
                '😔 Расстраиваетесь и переживаете',
                '🤷 Пропускаете мимо ушей'
            ]
        },
        {
            id: 'b3',
            text: 'Ваш типичный способ отдыха:',
            options: [
                '🏠 Побыть в тишине и одиночестве',
                '👥 Встретиться с друзьями',
                '🎮 Заняться любимым хобби',
                '📱 Зависнуть в телефоне/интернете'
            ]
        },
        {
            id: 'b4',
            text: 'Как вы реагируете на неожиданные изменения?',
            options: [
                '🔄 Быстро адаптируюсь',
                '😰 Тревожусь и переживаю',
                '⏳ Нужно время, чтобы привыкнуть',
                '🎭 Делаю вид, что всё по плану'
            ]
        },
        {
            id: 'b5',
            text: 'Когда вы злитесь, вы обычно:',
            options: [
                '💥 Сразу выплескиваете эмоции',
                '😤 Сдерживаете внутри',
                '🗣 Обсуждаете с кем-то',
                '🎯 Направляете энергию в дело'
            ]
        },
        {
            id: 'b6',
            text: 'Как вы ведете себя в конфликте?',
            options: [
                '🕊 Стараюсь сгладить',
                '⚔️ Иду в открытое противостояние',
                '🚪 Ухожу от конфликта',
                '🧘 Сохраняю спокойствие'
            ]
        },
        {
            id: 'b7',
            text: 'Что вы делаете, когда устали?',
            options: [
                '🛌 Иду отдыхать',
                '☕ Взбадриваюсь кофе/чаем',
                '💪 Терплю и продолжаю',
                '🔄 Меняю деятельность'
            ]
        },
        {
            id: 'b8',
            text: 'Как вы обычно просите о помощи?',
            options: [
                '🗣 Прямо говорю, что нужно',
                '😶 Жду, пока догадаются сами',
                '🤝 Предлагаю взамен что-то',
                '🙏 Мне трудно просить'
            ]
        }
    ],
    
    // Вопросы этапа 4 (8 вопросов) - ТОЧКА РОСТА
    growth_questions: [
        {
            id: 'g1',
            text: 'Что для вас самое сложное?',
            options: [
                '🚀 Начинать новое',
                '⏸ Останавливаться и отдыхать',
                '🙏 Просить о помощи',
                '🎯 Доводить до конца'
            ]
        },
        {
            id: 'g2',
            text: 'В чем ваша суперсила?',
            options: [
                '💪 Упорство и дисциплина',
                '🤝 Эмпатия и понимание людей',
                '💡 Креативность и идеи',
                '⚡ Скорость и реакция'
            ]
        },
        {
            id: 'g3',
            text: 'Что бы вы хотели в себе изменить?',
            options: [
                '🐢 Меньше тормозить',
                '🎭 Меньше зависеть от чужого мнения',
                '🧠 Лучше понимать свои эмоции',
                '📋 Стать более организованным'
            ]
        },
        {
            id: 'g4',
            text: 'Что вас мотивирует больше всего?',
            options: [
                '🏆 Признание и похвала',
                '💰 Материальное вознаграждение',
                '🌱 Личностный рост',
                '🤝 Помощь другим'
            ]
        },
        {
            id: 'g5',
            text: 'Что вас демотивирует?',
            options: [
                '👎 Критика и осуждение',
                '💸 Нестабильность',
                '🔄 Рутина и однообразие',
                '🚫 Отсутствие поддержки'
            ]
        },
        {
            id: 'g6',
            text: 'Какая сфера для вас наиболее проблемная?',
            options: [
                '👥 Отношения с людьми',
                '💰 Финансы и карьера',
                '🧠 Понимание себя',
                '⚖️ Баланс жизни'
            ]
        },
        {
            id: 'g7',
            text: 'Что вы откладываете на потом?',
            options: [
                '📞 Важные звонки и разговоры',
                '📝 Планирование и стратегию',
                '🏃‍♂️ Заботу о здоровье',
                '🎯 Достижение целей'
            ]
        },
        {
            id: 'g8',
            text: 'Где вам нужна поддержка?',
            options: [
                '👥 В отношениях',
                '💰 В финансах',
                '🧠 В самоопределении',
                '💪 В достижении целей'
            ]
        }
    ],
    
    // Вопросы этапа 5 (10 вопросов) - ГЛУБИННЫЕ ПАТТЕРНЫ
    deep_questions: [
        {
            id: 'd1',
            text: 'В детстве, когда вы расстраивались, родители обычно:',
            options: [
                '🤗 Утешали и обнимали',
                '💬 Объясняли и говорили',
                '⏰ Оставляли побыть одного',
                '🎁 Отвлекали чем-то интересным'
            ]
        },
        {
            id: 'd2',
            text: 'В отношениях вы чаще всего боитесь:',
            options: [
                '👋 Что вас бросят',
                '🔗 Потерять себя',
                '🙅 Что не поймут',
                '💔 Что будет больно'
            ]
        },
        {
            id: 'd3',
            text: 'Какое утверждение про вас?',
            options: [
                '🏰 Я сам по себе, мне никто не нужен',
                '🤝 Я не могу без близких отношений',
                '🎭 Я по-разному веду себя с разными людьми',
                '🌊 Я плыву по течению'
            ]
        },
        {
            id: 'd4',
            text: 'Как вы справляетесь с сильными эмоциями?',
            options: [
                '🎨 Выражаю их творчеством',
                '🏃‍♂️ Выплескиваю в активность',
                '🧘 Пытаюсь осознать и понять',
                '🍫 Заедаю/запиваю'
            ]
        },
        {
            id: 'd5',
            text: 'Что вы думаете о своем детстве?',
            options: [
                '☀️ Оно было счастливым',
                '🌧 Было много сложностей',
                '🤔 Я мало что помню',
                '🔄 Было по-разному'
            ]
        },
        {
            id: 'd6',
            text: 'Как вы реагируете на несправедливость?',
            options: [
                '⚔️ Борюсь и восстанавливаю справедливость',
                '😔 Обижаюсь и замыкаюсь',
                '🤷 Принимаю как данность',
                '📝 Анализирую причины'
            ]
        },
        {
            id: 'd7',
            text: 'Что для вас значит "быть собой"?',
            options: [
                '🎭 Делать то, что хочется',
                '🤝 Быть честным с другими',
                '🧠 Понимать свои желания',
                '🌱 Постоянно развиваться'
            ]
        },
        {
            id: 'd8',
            text: 'Как вы относитесь к одиночеству?',
            options: [
                '😊 Люблю побыть один',
                '😔 Боюсь оставаться один',
                '🔄 Мне комфортно и с людьми, и одному',
                '🏃 Стараюсь его избегать'
            ]
        },
        {
            id: 'd9',
            text: 'Что вы чувствуете, когда вас критикуют?',
            options: [
                '🛡️ Защиту и желание оправдаться',
                '😞 Стыд и вину',
                '🤔 Интерес и желание понять',
                '⚡ Желание ответить'
            ]
        },
        {
            id: 'd10',
            text: 'Какая мысль вызывает у вас тревогу?',
            options: [
                '👥 Что подумают другие',
                '💰 Что будет с финансами',
                '🔮 Что ждет в будущем',
                '💔 Что я не справлюсь'
            ]
        }
    ],
    
    // Получить вопросы для текущего этапа
    getCurrentQuestions() {
        const stage = this.stages[this.currentStage];
        switch(stage.id) {
            case 'perception': return this.perception_questions;
            case 'thinking': return this.thinking_questions;
            case 'behavior': return this.behavior_questions;
            case 'growth': return this.growth_questions;
            case 'deep': return this.deep_questions;
            default: return [];
        }
    },
    
    // Инициализация теста
    init(userId) {
        this.userId = userId || App?.userId || 'test_user';
        this.currentStage = 0;
        this.currentQuestionIndex = 0;
        this.answers = {};
        
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
    
    // Отправить вступление к этапу
    sendStageIntro() {
        const stage = this.stages[this.currentStage];
        const total = stage.total;
        this.addBotMessage(`${stage.name}\n${stage.description}\n\n📊 Всего вопросов: ${total}`);
        
        setTimeout(() => {
            this.sendNextQuestion();
        }, 2000);
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
            buttonsHtml += `
                <button class="message-button" data-option-index="${index}">
                    ${option}
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
                
                // Добавляем сообщение пользователя
                this.addUserMessage(options[index]);
                
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
    
    // Отправить следующий вопрос
    sendNextQuestion() {
        if (this.currentStage >= this.stages.length) {
            this.showResults();
            return;
        }
        
        const stage = this.stages[this.currentStage];
        const questions = this.getCurrentQuestions();
        const totalQuestions = stage.total;
        
        if (this.currentQuestionIndex >= totalQuestions) {
            // Переходим к следующему этапу
            this.currentStage++;
            this.currentQuestionIndex = 0;
            
            if (this.currentStage < this.stages.length) {
                this.sendStageIntro();
            } else {
                this.showResults();
            }
            return;
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
    
    // Обработка ответа
    handleAnswer(stageId, questionId, optionIndex, optionText) {
        const answerKey = `${stageId}_${questionId}`;
        this.answers[answerKey] = optionIndex;
        
        // Сохраняем прогресс
        this.saveProgress();
        
        // Переходим к следующему вопросу
        this.currentQuestionIndex++;
        
        // Небольшая пауза перед следующим вопросом
        setTimeout(() => {
            this.sendNextQuestion();
        }, 800);
    },
    
    // Показать результаты
    showResults() {
        this.addBotMessage('✅ Тест завершен! Спасибо за ответы.');
        
        // Сохраняем результаты
        if (App && App.userId) {
            localStorage.setItem(`test_results_${App.userId}`, JSON.stringify(this.answers));
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
