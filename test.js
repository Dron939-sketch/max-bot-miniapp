// ========== test.js ==========
// ПОЛНЫЙ ТЕСТ ИЗ 5 ЭТАПОВ КАК В TELEGRAM
// С расчетом типов, промежуточными результатами и подтверждением

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
    perceptionType: null,
    perceptionDescription: null,
    
    thinkingLevel: null,
    thinkingScores: {},
    
    behavioralLevels: {
        "СБ": [],
        "ТФ": [],
        "УБ": [],
        "ЧВ": []
    },
    
    diltsCounts: {
        "ENVIRONMENT": 0,
        "BEHAVIOR": 0,
        "CAPABILITIES": 0,
        "VALUES": 0,
        "IDENTITY": 0
    },
    
    deepPatterns: null,
    
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
            total: null // Будет определено после этапа 1
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
                    { text: '📚 Ищете похожий опыт у других', scores: { thinking: 5 } },
                    { text: '🧩 Раскладываете на части и анализируете', scores: { thinking: 8 } },
                    { text: '💫 Доверяете интуиции', scores: { thinking: 3 } },
                    { text: '🤝 Советуетесь с экспертами', scores: { thinking: 6 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't2',
                text: 'Что вам легче всего?',
                options: [
                    { text: '🔍 Замечать детали в поведении людей', scores: { thinking: 5 } },
                    { text: '📈 Видеть тренды и тенденции', scores: { thinking: 8 } },
                    { text: '🎯 Находить нестандартные решения', scores: { thinking: 7 } },
                    { text: '📝 Действовать по инструкции', scores: { thinking: 4 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't3',
                text: 'Как вы принимаете важные решения?',
                options: [
                    { text: '⚖️ Взвешиваете все за и против', scores: { thinking: 8 } },
                    { text: '💭 Прислушиваетесь к внутреннему голосу', scores: { thinking: 5 } },
                    { text: '👥 Советуетесь с близкими', scores: { thinking: 4 } },
                    { text: '⏰ Откладываете, пока всё не решится само', scores: { thinking: 2 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't4',
                text: 'Что вы делаете, когда получаете новую информацию?',
                options: [
                    { text: '🔗 Связываю с тем, что уже знаю', scores: { thinking: 7 } },
                    { text: '❓ Задаю много вопросов', scores: { thinking: 6 } },
                    { text: '📝 Запоминаю основные моменты', scores: { thinking: 5 } },
                    { text: '🤔 Думаю, как это можно применить', scores: { thinking: 8 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't5',
                text: 'Как вы относитесь к сложным теориям?',
                options: [
                    { text: '😫 С трудом воспринимаю абстракции', scores: { thinking: 2 } },
                    { text: '📚 Могу разобраться, если нужно', scores: { thinking: 5 } },
                    { text: '💡 Люблю искать глубинные смыслы', scores: { thinking: 8 } },
                    { text: '🛠 Ищу практическое применение', scores: { thinking: 6 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't6',
                text: 'Когда вы объясняете что-то другому, вы:',
                options: [
                    { text: '📖 Рассказываете последовательно, шаг за шагом', scores: { thinking: 6 } },
                    { text: '🎨 Используете метафоры и образы', scores: { thinking: 7 } },
                    { text: '📊 Показываете схему или структуру', scores: { thinking: 8 } },
                    { text: '🤷 Затрудняетесь объяснить', scores: { thinking: 3 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't7',
                text: 'Что для вас важнее при планировании?',
                options: [
                    { text: '🎯 Конкретная цель и сроки', scores: { thinking: 6 } },
                    { text: '🔄 Гибкость и возможность менять план', scores: { thinking: 7 } },
                    { text: '📋 Четкая последовательность шагов', scores: { thinking: 5 } },
                    { text: '🌈 Вдохновение и идеи', scores: { thinking: 8 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't8',
                text: 'Как вы относитесь к критике?',
                options: [
                    { text: '👂 Внимательно слушаю и анализирую', scores: { thinking: 8 } },
                    { text: '🛡️ Защищаюсь и объясняю свою позицию', scores: { thinking: 5 } },
                    { text: '😔 Расстраиваюсь и переживаю', scores: { thinking: 3 } },
                    { text: '🤷 Пропускаю мимо ушей', scores: { thinking: 4 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't9',
                text: 'Как вы запоминаете информацию?',
                options: [
                    { text: '👀 Лучше вижу образы', scores: { thinking: 6 } },
                    { text: '👂 Лучше слышу и проговариваю', scores: { thinking: 5 } },
                    { text: '✍️ Лучше записываю', scores: { thinking: 7 } },
                    { text: '🔄 Лучше проживаю на практике', scores: { thinking: 8 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't10',
                text: 'Что для вас важнее в общении?',
                options: [
                    { text: '🤝 Результат и договоренности', scores: { thinking: 7 } },
                    { text: '💕 Эмоции и атмосфера', scores: { thinking: 5 } },
                    { text: '🔍 Смысл и содержание', scores: { thinking: 8 } },
                    { text: '🎭 Впечатление и статус', scores: { thinking: 4 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't11',
                text: 'Как вы решаете сложные задачи?',
                options: [
                    { text: '🧩 Разбиваю на маленькие шаги', scores: { thinking: 7 } },
                    { text: '💡 Ищу нестандартный подход', scores: { thinking: 8 } },
                    { text: '👥 Привлекаю команду', scores: { thinking: 5 } },
                    { text: '⚡ Делаю быстро, не задумываясь', scores: { thinking: 4 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't12',
                text: 'Что вас вдохновляет?',
                options: [
                    { text: '🏆 Достижения и успехи', scores: { thinking: 6 } },
                    { text: '❤️ Отношения и поддержка', scores: { thinking: 5 } },
                    { text: '🎯 Цели и мечты', scores: { thinking: 8 } },
                    { text: '🌈 Красота и гармония', scores: { thinking: 7 } }
                ],
                measures: 'thinking'
            }
        ],
        
        // Для СМЫСЛО-ОРИЕНТИРОВАННЫЙ и ПРАКТИКО-ОРИЕНТИРОВАННЫЙ (10 вопросов)
        internal: [
            {
                id: 't1',
                text: 'Когда вы сталкиваетесь с проблемой, вы:',
                options: [
                    { text: '📚 Ищете похожий опыт и готовые решения', scores: { thinking: 5 } },
                    { text: '🧩 Раскладываете на части и анализируете', scores: { thinking: 8 } },
                    { text: '💫 Доверяете интуиции и первому впечатлению', scores: { thinking: 4 } },
                    { text: '🤝 Советуетесь с другими', scores: { thinking: 3 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't2',
                text: 'Что вам легче всего?',
                options: [
                    { text: '🔍 Замечать детали и нюансы', scores: { thinking: 7 } },
                    { text: '📈 Видеть общую картину и тенденции', scores: { thinking: 8 } },
                    { text: '🎯 Находить нестандартные решения', scores: { thinking: 6 } },
                    { text: '📝 Действовать по инструкции', scores: { thinking: 4 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't3',
                text: 'Как вы принимаете важные решения?',
                options: [
                    { text: '⚖️ Взвешиваете все за и против', scores: { thinking: 8 } },
                    { text: '💭 Прислушиваетесь к внутреннему голосу', scores: { thinking: 6 } },
                    { text: '👥 Советуетесь с близкими', scores: { thinking: 4 } },
                    { text: '⏰ Откладываете, пока всё не решится само', scores: { thinking: 2 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't4',
                text: 'Что вы делаете, когда получаете новую информацию?',
                options: [
                    { text: '🔗 Связываю с тем, что уже знаю', scores: { thinking: 7 } },
                    { text: '❓ Задаю много вопросов', scores: { thinking: 5 } },
                    { text: '📝 Запоминаю основные моменты', scores: { thinking: 4 } },
                    { text: '🤔 Думаю, как это можно применить', scores: { thinking: 8 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't5',
                text: 'Как вы относитесь к сложным теориям и концепциям?',
                options: [
                    { text: '😫 С трудом воспринимаю абстракции', scores: { thinking: 2 } },
                    { text: '📚 Могу разобраться, если нужно', scores: { thinking: 5 } },
                    { text: '💡 Люблю искать глубинные смыслы', scores: { thinking: 8 } },
                    { text: '🛠 Ищу практическое применение', scores: { thinking: 6 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't6',
                text: 'Когда вы объясняете что-то другому, вы:',
                options: [
                    { text: '📖 Рассказываете последовательно, шаг за шагом', scores: { thinking: 6 } },
                    { text: '🎨 Используете метафоры и образы', scores: { thinking: 7 } },
                    { text: '📊 Показываете схему или структуру', scores: { thinking: 8 } },
                    { text: '🤷 Затрудняетесь объяснить', scores: { thinking: 3 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't7',
                text: 'Что для вас важнее при планировании?',
                options: [
                    { text: '🎯 Конкретная цель и сроки', scores: { thinking: 7 } },
                    { text: '🔄 Гибкость и возможность менять план', scores: { thinking: 6 } },
                    { text: '📋 Четкая последовательность шагов', scores: { thinking: 5 } },
                    { text: '🌈 Вдохновение и идеи', scores: { thinking: 8 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't8',
                text: 'Как вы относитесь к критике?',
                options: [
                    { text: '👂 Внимательно слушаю и анализирую', scores: { thinking: 8 } },
                    { text: '🛡️ Защищаюсь и объясняю свою позицию', scores: { thinking: 5 } },
                    { text: '😔 Расстраиваюсь и переживаю', scores: { thinking: 3 } },
                    { text: '🤷 Пропускаю мимо ушей', scores: { thinking: 4 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't9',
                text: 'Как вы запоминаете информацию?',
                options: [
                    { text: '👀 Лучше вижу образы', scores: { thinking: 6 } },
                    { text: '👂 Лучше слышу и проговариваю', scores: { thinking: 5 } },
                    { text: '✍️ Лучше записываю', scores: { thinking: 7 } },
                    { text: '🔄 Лучше проживаю на практике', scores: { thinking: 8 } }
                ],
                measures: 'thinking'
            },
            {
                id: 't10',
                text: 'Что для вас важнее в общении?',
                options: [
                    { text: '🤝 Результат и договоренности', scores: { thinking: 7 } },
                    { text: '💕 Эмоции и атмосфера', scores: { thinking: 5 } },
                    { text: '🔍 Смысл и содержание', scores: { thinking: 8 } },
                    { text: '🎭 Впечатление и статус', scores: { thinking: 4 } }
                ],
                measures: 'thinking'
            }
        ]
    },
    
    // Вопросы этапа 3 (8 вопросов) - поведение
    behavior_questions: [
        {
            id: 'b1',
            text: 'В стрессовой ситуации вы:',
            options: [
                { text: '🏃‍♂️ Начинаете действовать быстро и активно', strategy: 'СБ', level: 6 },
                { text: '🧊 Замираете и наблюдаете', strategy: 'СБ', level: 1 },
                { text: '🗣 Ищете поддержку у других', strategy: 'СБ', level: 3 },
                { text: '🎭 Делаете вид, что всё нормально', strategy: 'СБ', level: 4 }
            ],
            strategy: 'СБ'
        },
        {
            id: 'b2',
            text: 'Когда кто-то критикует вас, вы:',
            options: [
                { text: '👂 Внимательно слушаете и анализируете', strategy: 'СБ', level: 5 },
                { text: '🛡️ Защищаетесь и объясняете', strategy: 'СБ', level: 4 },
                { text: '😔 Расстраиваетесь и переживаете', strategy: 'СБ', level: 2 },
                { text: '🤷 Пропускаете мимо ушей', strategy: 'СБ', level: 3 }
            ],
            strategy: 'СБ'
        },
        {
            id: 'b3',
            text: 'Ваш типичный способ отдыха:',
            options: [
                { text: '🏠 Побыть в тишине и одиночестве', strategy: 'ЧВ', level: 2 },
                { text: '👥 Встретиться с друзьями', strategy: 'ЧВ', level: 5 },
                { text: '🎮 Заняться любимым хобби', strategy: 'ЧВ', level: 4 },
                { text: '📱 Зависнуть в телефоне/интернете', strategy: 'ЧВ', level: 3 }
            ],
            strategy: 'ЧВ'
        },
        {
            id: 'b4',
            text: 'Как вы реагируете на неожиданные изменения?',
            options: [
                { text: '🔄 Быстро адаптируюсь', strategy: 'УБ', level: 5 },
                { text: '😰 Тревожусь и переживаю', strategy: 'УБ', level: 2 },
                { text: '⏳ Нужно время, чтобы привыкнуть', strategy: 'УБ', level: 3 },
                { text: '🎭 Делаю вид, что всё по плану', strategy: 'УБ', level: 4 }
            ],
            strategy: 'УБ'
        },
        {
            id: 'b5',
            text: 'Когда вы злитесь, вы обычно:',
            options: [
                { text: '💥 Сразу выплескиваете эмоции', strategy: 'СБ', level: 5 },
                { text: '😤 Сдерживаете внутри', strategy: 'СБ', level: 3 },
                { text: '🗣 Обсуждаете с кем-то', strategy: 'СБ', level: 4 },
                { text: '🎯 Направляете энергию в дело', strategy: 'СБ', level: 6 }
            ],
            strategy: 'СБ'
        },
        {
            id: 'b6',
            text: 'Как вы ведете себя в конфликте?',
            options: [
                { text: '🕊 Стараюсь сгладить', strategy: 'СБ', level: 4 },
                { text: '⚔️ Иду в открытое противостояние', strategy: 'СБ', level: 6 },
                { text: '🚪 Ухожу от конфликта', strategy: 'СБ', level: 2 },
                { text: '🧘 Сохраняю спокойствие', strategy: 'СБ', level: 5 }
            ],
            strategy: 'СБ'
        },
        {
            id: 'b7',
            text: 'Что вы делаете, когда устали?',
            options: [
                { text: '🛌 Иду отдыхать', strategy: 'ЧВ', level: 5 },
                { text: '☕ Взбадриваюсь кофе/чаем', strategy: 'ЧВ', level: 3 },
                { text: '💪 Терплю и продолжаю', strategy: 'ЧВ', level: 2 },
                { text: '🔄 Меняю деятельность', strategy: 'ЧВ', level: 4 }
            ],
            strategy: 'ЧВ'
        },
        {
            id: 'b8',
            text: 'Как вы обычно просите о помощи?',
            options: [
                { text: '🗣 Прямо говорю, что нужно', strategy: 'ЧВ', level: 5 },
                { text: '😶 Жду, пока догадаются сами', strategy: 'ЧВ', level: 2 },
                { text: '🤝 Предлагаю взамен что-то', strategy: 'ЧВ', level: 4 },
                { text: '🙏 Мне трудно просить', strategy: 'ЧВ', level: 3 }
            ],
            strategy: 'ЧВ'
        }
    ],
    
    // Вопросы этапа 4 (8 вопросов) - точка роста
    growth_questions: [
        {
            id: 'g1',
            text: 'Что для вас самое сложное?',
            options: [
                { text: '🚀 Начинать новое', dilts: 'CAPABILITIES' },
                { text: '⏸ Останавливаться и отдыхать', dilts: 'BEHAVIOR' },
                { text: '🙏 Просить о помощи', dilts: 'RELATIONSHIP' },
                { text: '🎯 Доводить до конца', dilts: 'BEHAVIOR' }
            ]
        },
        {
            id: 'g2',
            text: 'В чем ваша суперсила?',
            options: [
                { text: '💪 Упорство и дисциплина', dilts: 'BEHAVIOR' },
                { text: '🤝 Эмпатия и понимание людей', dilts: 'RELATIONSHIP' },
                { text: '💡 Креативность и идеи', dilts: 'CAPABILITIES' },
                { text: '⚡ Скорость и реакция', dilts: 'BEHAVIOR' }
            ]
        },
        {
            id: 'g3',
            text: 'Что бы вы хотели в себе изменить?',
            options: [
                { text: '🐢 Меньше тормозить', dilts: 'BEHAVIOR' },
                { text: '🎭 Меньше зависеть от чужого мнения', dilts: 'VALUES' },
                { text: '🧠 Лучше понимать свои эмоции', dilts: 'CAPABILITIES' },
                { text: '📋 Стать более организованным', dilts: 'BEHAVIOR' }
            ]
        },
        {
            id: 'g4',
            text: 'Что вас мотивирует больше всего?',
            options: [
                { text: '🏆 Признание и похвала', dilts: 'VALUES' },
                { text: '💰 Материальное вознаграждение', dilts: 'ENVIRONMENT' },
                { text: '🌱 Личностный рост', dilts: 'IDENTITY' },
                { text: '🤝 Помощь другим', dilts: 'VALUES' }
            ]
        },
        {
            id: 'g5',
            text: 'Что вас демотивирует?',
            options: [
                { text: '👎 Критика и осуждение', dilts: 'VALUES' },
                { text: '💸 Нестабильность', dilts: 'ENVIRONMENT' },
                { text: '🔄 Рутина и однообразие', dilts: 'BEHAVIOR' },
                { text: '🚫 Отсутствие поддержки', dilts: 'RELATIONSHIP' }
            ]
        },
        {
            id: 'g6',
            text: 'Какая сфера для вас наиболее проблемная?',
            options: [
                { text: '👥 Отношения с людьми', dilts: 'RELATIONSHIP' },
                { text: '💰 Финансы и карьера', dilts: 'ENVIRONMENT' },
                { text: '🧠 Понимание себя', dilts: 'IDENTITY' },
                { text: '⚖️ Баланс жизни', dilts: 'VALUES' }
            ]
        },
        {
            id: 'g7',
            text: 'Что вы откладываете на потом?',
            options: [
                { text: '📞 Важные звонки и разговоры', dilts: 'BEHAVIOR' },
                { text: '📝 Планирование и стратегию', dilts: 'CAPABILITIES' },
                { text: '🏃‍♂️ Заботу о здоровье', dilts: 'BEHAVIOR' },
                { text: '🎯 Достижение целей', dilts: 'IDENTITY' }
            ]
        },
        {
            id: 'g8',
            text: 'Где вам нужна поддержка?',
            options: [
                { text: '👥 В отношениях', dilts: 'RELATIONSHIP' },
                { text: '💰 В финансах', dilts: 'ENVIRONMENT' },
                { text: '🧠 В самоопределении', dilts: 'IDENTITY' },
                { text: '💪 В достижении целей', dilts: 'BEHAVIOR' }
            ]
        }
    ],
    
    // Вопросы этапа 5 (10 вопросов) - глубинные паттерны
    deep_questions: [
        {
            id: 'd1',
            text: 'В детстве, когда вы расстраивались, родители обычно:',
            options: [
                { text: '🤗 Утешали и обнимали', pattern: 'secure' },
                { text: '💬 Объясняли и говорили', pattern: 'secure' },
                { text: '⏰ Оставляли побыть одного', pattern: 'avoidant' },
                { text: '🎁 Отвлекали чем-то интересным', pattern: 'anxious' }
            ],
            target: 'attachment'
        },
        {
            id: 'd2',
            text: 'В отношениях вы чаще всего боитесь:',
            options: [
                { text: '👋 Что вас бросят', pattern: 'anxious' },
                { text: '🔗 Потерять себя', pattern: 'anxious' },
                { text: '🙅 Что не поймут', pattern: 'secure' },
                { text: '💔 Что будет больно', pattern: 'avoidant' }
            ],
            target: 'attachment'
        },
        {
            id: 'd3',
            text: 'Какое утверждение про вас?',
            options: [
                { text: '🏰 Я сам по себе, мне никто не нужен', pattern: 'avoidant' },
                { text: '🤝 Я не могу без близких отношений', pattern: 'anxious' },
                { text: '🎭 Я по-разному веду себя с разными людьми', pattern: 'secure' },
                { text: '🌊 Я плыву по течению', pattern: 'disorganized' }
            ],
            target: 'attachment'
        },
        {
            id: 'd4',
            text: 'Как вы справляетесь с сильными эмоциями?',
            options: [
                { text: '🎨 Выражаю их творчеством', pattern: 'sublimation' },
                { text: '🏃‍♂️ Выплескиваю в активность', pattern: 'acting_out' },
                { text: '🧘 Пытаюсь осознать и понять', pattern: 'intellectualization' },
                { text: '🍫 Заедаю/запиваю', pattern: 'regression' }
            ],
            target: 'defense'
        },
        {
            id: 'd5',
            text: 'Что вы думаете о своем детстве?',
            options: [
                { text: '☀️ Оно было счастливым', pattern: 'secure' },
                { text: '🌧 Было много сложностей', pattern: 'trauma' },
                { text: '🤔 Я мало что помню', pattern: 'repression' },
                { text: '🔄 Было по-разному', pattern: 'secure' }
            ],
            target: 'history'
        },
        {
            id: 'd6',
            text: 'Как вы реагируете на несправедливость?',
            options: [
                { text: '⚔️ Борюсь и восстанавливаю справедливость', pattern: 'assertive' },
                { text: '😔 Обижаюсь и замыкаюсь', pattern: 'passive' },
                { text: '🤷 Принимаю как данность', pattern: 'resigned' },
                { text: '📝 Анализирую причины', pattern: 'analytical' }
            ],
            target: 'values'
        },
        {
            id: 'd7',
            text: 'Что для вас значит "быть собой"?',
            options: [
                { text: '🎭 Делать то, что хочется', pattern: 'impulsive' },
                { text: '🤝 Быть честным с другими', pattern: 'authentic' },
                { text: '🧠 Понимать свои желания', pattern: 'reflective' },
                { text: '🌱 Постоянно развиваться', pattern: 'growth' }
            ],
            target: 'identity'
        },
        {
            id: 'd8',
            text: 'Как вы относитесь к одиночеству?',
            options: [
                { text: '😊 Люблю побыть один', pattern: 'secure' },
                { text: '😔 Боюсь оставаться один', pattern: 'anxious' },
                { text: '🔄 Мне комфортно и с людьми, и одному', pattern: 'secure' },
                { text: '🏃 Стараюсь его избегать', pattern: 'avoidant' }
            ],
            target: 'attachment'
        },
        {
            id: 'd9',
            text: 'Что вы чувствуете, когда вас критикуют?',
            options: [
                { text: '🛡️ Защиту и желание оправдаться', pattern: 'defensive' },
                { text: '😞 Стыд и вину', pattern: 'shame' },
                { text: '🤔 Интерес и желание понять', pattern: 'open' },
                { text: '⚡ Желание ответить', pattern: 'aggressive' }
            ],
            target: 'defense'
        },
        {
            id: 'd10',
            text: 'Какая мысль вызывает у вас тревогу?',
            options: [
                { text: '👥 Что подумают другие', pattern: 'social_anxiety' },
                { text: '💰 Что будет с финансами', pattern: 'existential' },
                { text: '🔮 Что ждет в будущем', pattern: 'uncertainty' },
                { text: '💔 Что я не справлюсь', pattern: 'inadequacy' }
            ],
            target: 'fears'
        }
    ],
    
    // Функция расчета типа восприятия
    calculatePerceptionType() {
        const scores = this.perceptionScores;
        const attention = scores.EXTERNAL > scores.INTERNAL ? "EXTERNAL" : "INTERNAL";
        const anxiety = scores.SYMBOLIC > scores.MATERIAL ? "SYMBOLIC" : "MATERIAL";
        
        if (attention === "EXTERNAL" && anxiety === "SYMBOLIC") {
            return {
                type: "СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ",
                description: "Для вас важно, что думают другие, вы чутко считываете настроение и ожидания окружающих.",
                group: "external",
                questionsCount: 12
            };
        }
        else if (attention === "EXTERNAL" && anxiety === "MATERIAL") {
            return {
                type: "СТАТУСНО-ОРИЕНТИРОВАННЫЙ",
                description: "Для вас важны статус, положение и материальные достижения.",
                group: "external",
                questionsCount: 12
            };
        }
        else if (attention === "INTERNAL" && anxiety === "SYMBOLIC") {
            return {
                type: "СМЫСЛО-ОРИЕНТИРОВАННЫЙ",
                description: "Для вас важнее ваши внутренние ощущения и поиск смысла.",
                group: "internal",
                questionsCount: 10
            };
        }
        else {
            return {
                type: "ПРАКТИКО-ОРИЕНТИРОВАННЫЙ",
                description: "Вы ориентированы на практические результаты и конкретные действия.",
                group: "internal",
                questionsCount: 10
            };
        }
    },
    
    // Расчет уровня мышления
    calculateThinkingLevel() {
        let totalScore = 0;
        const scores = this.thinkingScores;
        
        // Суммируем баллы со всех вопросов
        for (let level in scores) {
            totalScore += scores[level];
        }
        
        if (totalScore <= 10) return 1;
        else if (totalScore <= 20) return 2;
        else if (totalScore <= 30) return 3;
        else if (totalScore <= 40) return 4;
        else if (totalScore <= 50) return 5;
        else if (totalScore <= 60) return 6;
        else if (totalScore <= 70) return 7;
        else if (totalScore <= 80) return 8;
        else return 9;
    },
    
    // Расчет финального уровня
    calculateFinalLevel(stage2Level, stage3Scores) {
        if (!stage3Scores || stage3Scores.length === 0) {
            return stage2Level;
        }
        const avgBehavior = stage3Scores.reduce((a, b) => a + b, 0) / stage3Scores.length;
        return Math.round((stage2Level + avgBehavior) / 2);
    },
    
    // Определение доминирующего уровня Дилтса
    determineDominantDilts() {
        const counts = this.diltsCounts;
        let max = 0;
        let dominant = "BEHAVIOR";
        
        for (let level in counts) {
            if (counts[level] > max) {
                max = counts[level];
                dominant = level;
            }
        }
        return dominant;
    },
    
    // Расчет финального профиля
    calculateFinalProfile() {
        // Средние по векторам
        const sbAvg = this.behavioralLevels["СБ"].length > 0 
            ? this.behavioralLevels["СБ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["СБ"].length 
            : 3;
        const tfAvg = this.behavioralLevels["ТФ"].length > 0 
            ? this.behavioralLevels["ТФ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["ТФ"].length 
            : 3;
        const ubAvg = this.behavioralLevels["УБ"].length > 0 
            ? this.behavioralLevels["УБ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["УБ"].length 
            : 3;
        const chvAvg = this.behavioralLevels["ЧВ"].length > 0 
            ? this.behavioralLevels["ЧВ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["ЧВ"].length 
            : 3;
        
        const dominantDilts = this.determineDominantDilts();
        
        const profileCode = `СБ-${Math.round(sbAvg)}_ТФ-${Math.round(tfAvg)}_УБ-${Math.round(ubAvg)}_ЧВ-${Math.round(chvAvg)}`;
        
        return {
            displayName: profileCode,
            perceptionType: this.perceptionType,
            thinkingLevel: this.thinkingLevel,
            sbLevel: Math.round(sbAvg),
            tfLevel: Math.round(tfAvg),
            ubLevel: Math.round(ubAvg),
            chvLevel: Math.round(chvAvg),
            dominantDilts: dominantDilts,
            diltsCounts: this.diltsCounts
        };
    },
    
    // Анализ глубинных паттернов
    analyzeDeepPatterns() {
        // Простой анализ - считаем паттерны
        const patterns = {
            secure: 0,
            anxious: 0,
            avoidant: 0,
            disorganized: 0
        };
        
        const answers = this.deepAnswers || [];
        answers.forEach(answer => {
            if (answer.pattern) {
                patterns[answer.pattern] = (patterns[answer.pattern] || 0) + 1;
            }
        });
        
        // Определяем доминирующий тип
        let maxCount = 0;
        let dominantPattern = "secure";
        
        for (let pattern in patterns) {
            if (patterns[pattern] > maxCount) {
                maxCount = patterns[pattern];
                dominantPattern = pattern;
            }
        }
        
        const attachmentMap = {
            secure: "🤗 Надежный",
            anxious: "😥 Тревожный",
            avoidant: "🛡️ Избегающий",
            disorganized: "🌀 Смешанный"
        };
        
        return {
            attachment: attachmentMap[dominantPattern] || "🤗 Надежный",
            patterns: patterns
        };
    },
    
    // Получить вопросы для текущего этапа
    getCurrentQuestions() {
        const stage = this.stages[this.currentStage];
        
        switch(stage.id) {
            case 'perception':
                return this.perception_questions;
            case 'thinking':
                if (!this.perceptionType) {
                    return this.thinking_questions.internal;
                }
                const result = this.calculatePerceptionType();
                return result.group === 'external' 
                    ? this.thinking_questions.external 
                    : this.thinking_questions.internal;
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
    
    // Инициализация теста
    init(userId) {
        this.userId = userId || App?.userId || 'test_user';
        this.currentStage = 0;
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.perceptionScores = { EXTERNAL: 0, INTERNAL: 0, SYMBOLIC: 0, MATERIAL: 0 };
        this.perceptionType = null;
        this.thinkingScores = {};
        this.behavioralLevels = { "СБ": [], "ТФ": [], "УБ": [], "ЧВ": [] };
        this.diltsCounts = { "ENVIRONMENT": 0, "BEHAVIOR": 0, "CAPABILITIES": 0, "VALUES": 0, "IDENTITY": 0 };
        this.deepAnswers = [];
        
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
                this.thinkingScores = data.thinkingScores || {};
                this.behavioralLevels = data.behavioralLevels || { "СБ": [], "ТФ": [], "УБ": [], "ЧВ": [] };
                this.diltsCounts = data.diltsCounts || { "ENVIRONMENT": 0, "BEHAVIOR": 0, "CAPABILITIES": 0, "VALUES": 0, "IDENTITY": 0 };
                this.deepAnswers = data.deepAnswers || [];
                this.thinkingLevel = data.thinkingLevel || null;
                
                // Если есть тип восприятия, обновляем количество вопросов для этапа 2
                if (this.perceptionType) {
                    const result = this.calculatePerceptionType();
                    this.stages[1].total = result.questionsCount;
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
            thinkingScores: this.thinkingScores,
            behavioralLevels: this.behavioralLevels,
            diltsCounts: this.diltsCounts,
            deepAnswers: this.deepAnswers,
            thinkingLevel: this.thinkingLevel,
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
        this.thinkingScores = {};
        this.behavioralLevels = { "СБ": [], "ТФ": [], "УБ": [], "ЧВ": [] };
        this.diltsCounts = { "ENVIRONMENT": 0, "BEHAVIOR": 0, "CAPABILITIES": 0, "VALUES": 0, "IDENTITY": 0 };
        this.deepAnswers = [];
        this.thinkingLevel = null;
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
            // Если option это объект, берем text
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
                callback(index, option);
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
            // Завершаем этап
            this.completeCurrentStage();
            return;
        }
        
        const question = questions[this.currentQuestionIndex];
        
        // Показываем вопрос с кнопками
        this.addQuestionMessage(
            question.text,
            question.options,
            (selectedIndex, selectedOption) => {
                this.handleAnswer(stage.id, question, selectedIndex, selectedOption);
            },
            this.currentQuestionIndex + 1,
            totalQuestions
        );
    },
    
    // Обработка ответа
    handleAnswer(stageId, question, optionIndex, option) {
        const answerKey = `${stageId}_${question.id}`;
        this.answers[answerKey] = optionIndex;
        
        // Сохраняем данные в зависимости от этапа
        if (stageId === 'perception') {
            // Сохраняем баллы для этапа 1
            if (option.scores) {
                for (let axis in option.scores) {
                    this.perceptionScores[axis] += option.scores[axis];
                }
            }
        } 
        else if (stageId === 'thinking') {
            // Сохраняем баллы для этапа 2
            if (option.scores && option.scores.thinking) {
                const level = optionIndex + 1; // 1-4
                this.thinkingScores[level] = (this.thinkingScores[level] || 0) + option.scores.thinking;
            }
        }
        else if (stageId === 'behavior') {
            // Сохраняем поведенческие уровни
            if (question.strategy && option.level) {
                if (!this.behavioralLevels[question.strategy]) {
                    this.behavioralLevels[question.strategy] = [];
                }
                this.behavioralLevels[question.strategy].push(option.level);
            }
        }
        else if (stageId === 'growth') {
            // Сохраняем уровни Дилтса
            if (option.dilts) {
                this.diltsCounts[option.dilts] = (this.diltsCounts[option.dilts] || 0) + 1;
            }
        }
        else if (stageId === 'deep') {
            // Сохраняем глубинные паттерны
            if (!this.deepAnswers) this.deepAnswers = [];
            this.deepAnswers.push({
                questionId: question.id,
                pattern: option.pattern,
                target: question.target
            });
        }
        
        // Сохраняем прогресс
        this.saveProgress();
        
        // Переходим к следующему вопросу
        this.currentQuestionIndex++;
        
        // Небольшая пауза перед следующим вопросом
        setTimeout(() => {
            this.sendNextQuestion();
        }, 800);
    },
    
    // Завершить текущий этап
    completeCurrentStage() {
        const stage = this.stages[this.currentStage];
        
        // Обрабатываем завершение этапа
        if (stage.id === 'perception') {
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
            
            // Показываем результат этапа 1
            this.showStage1Result();
        } 
        else if (stage.id === 'thinking') {
            this.thinkingLevel = this.calculateThinkingLevel();
            
            // Сохраняем результат
            if (App && App.userId) {
                const userData = JSON.parse(localStorage.getItem(`user_${App.userId}`) || '{}');
                userData.thinkingLevel = this.thinkingLevel;
                localStorage.setItem(`user_${App.userId}`, JSON.stringify(userData));
            }
            
            // Показываем результат этапа 2
            this.showStage2Result();
        }
        else if (stage.id === 'behavior') {
            // Показываем результат этапа 3
            this.showStage3Result();
        }
        else if (stage.id === 'growth') {
            // Показываем результат этапа 4
            this.showStage4Result();
        }
        else if (stage.id === 'deep') {
            this.deepPatterns = this.analyzeDeepPatterns();
            this.showStage5Result();
        }
    },
    
    // Показать результат этапа 1
    showStage1Result() {
        const result = this.calculatePerceptionType();
        
        const text = `✨ **РЕЗУЛЬТАТ ЭТАПА 1**

**Ваш тип восприятия:** ${result.type}

${result.description}

▶️ **ЧТО ДАЛЬШЕ?**

Этап 2: КОНФИГУРАЦИЯ МЫШЛЕНИЯ

Мы узнали, как вы воспринимаете мир. Теперь исследуем, как вы обрабатываете информацию.

📊 Вопросов: ${result.questionsCount}
⏱ Время: ~3-4 минуты`;
        
        this.addBotMessage(text);
        
        setTimeout(() => {
            this.currentStage++;
            this.currentQuestionIndex = 0;
            this.sendStageIntro();
        }, 3000);
    },
    
    // Показать результат этапа 2
    showStage2Result() {
        const level = this.thinkingLevel;
        let levelDesc = "";
        
        if (level <= 3) {
            levelDesc = "Вы хорошо видите отдельные ситуации, но не всегда замечаете общие закономерности.";
        } else if (level <= 6) {
            levelDesc = "Вы замечаете закономерности, но не всегда видите, к чему они приведут в будущем.";
        } else {
            levelDesc = "Вы видите общие законы и можете предсказывать развитие ситуаций.";
        }
        
        const text = `✨ **РЕЗУЛЬТАТ ЭТАПА 2**

**Уровень мышления:** ${level}/9

${levelDesc}

▶️ **ЧТО ДАЛЬШЕ?**

Этап 3: КОНФИГУРАЦИЯ ПОВЕДЕНИЯ

Теперь посмотрим, как вы действуете на автомате.

📊 Вопросов: 8
⏱ Время: ~3 минуты`;
        
        this.addBotMessage(text);
        
        setTimeout(() => {
            this.currentStage++;
            this.currentQuestionIndex = 0;
            this.sendStageIntro();
        }, 3000);
    },
    
    // Показать результат этапа 3
    showStage3Result() {
        // Вычисляем средние по векторам
        const sbAvg = this.behavioralLevels["СБ"].length > 0 
            ? Math.round(this.behavioralLevels["СБ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["СБ"].length) 
            : 3;
        const tfAvg = this.behavioralLevels["ТФ"].length > 0 
            ? Math.round(this.behavioralLevels["ТФ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["ТФ"].length) 
            : 3;
        const ubAvg = this.behavioralLevels["УБ"].length > 0 
            ? Math.round(this.behavioralLevels["УБ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["УБ"].length) 
            : 3;
        const chvAvg = this.behavioralLevels["ЧВ"].length > 0 
            ? Math.round(this.behavioralLevels["ЧВ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["ЧВ"].length) 
            : 3;
        
        // Собираем все баллы поведения
        const allScores = [
            ...this.behavioralLevels["СБ"],
            ...this.behavioralLevels["ТФ"],
            ...this.behavioralLevels["УБ"],
            ...this.behavioralLevels["ЧВ"]
        ];
        
        const finalLevel = this.calculateFinalLevel(this.thinkingLevel, allScores);
        
        const text = `✨ **РЕЗУЛЬТАТ ЭТАПА 3**

**Ваши поведенческие уровни:**
• Реакция на давление (СБ): ${sbAvg}/6
• Отношение к деньгам (ТФ): ${tfAvg}/6
• Понимание мира (УБ): ${ubAvg}/6
• Отношения с людьми (ЧВ): ${chvAvg}/6

**Финальный уровень:** ${finalLevel}/9

▶️ **ЧТО ДАЛЬШЕ?**

Этап 4: ТОЧКА РОСТА

Найдем, где находится рычаг изменений.

📊 Вопросов: 8
⏱ Время: ~3 минуты`;
        
        this.addBotMessage(text);
        
        setTimeout(() => {
            this.currentStage++;
            this.currentQuestionIndex = 0;
            this.sendStageIntro();
        }, 3000);
    },
    
    // Показать результат этапа 4
    showStage4Result() {
        const dominant = this.determineDominantDilts();
        
        const diltsMap = {
            "ENVIRONMENT": "Окружение — измените условия",
            "BEHAVIOR": "Поведение — делайте по-другому",
            "CAPABILITIES": "Способности — развивайте новые навыки",
            "VALUES": "Ценности — поймите, что важно",
            "IDENTITY": "Идентичность — кто вы на самом деле",
            "RELATIONSHIP": "Отношения — измените связи"
        };
        
        const growthPoint = diltsMap[dominant] || "Поведение — делайте по-другому";
        
        // Создаем предварительный профиль
        const profile = this.calculateFinalProfile();
        
        const text = `✨ **РЕЗУЛЬТАТ ЭТАПА 4**

**Ваша точка роста:** ${growthPoint}

**Предварительный профиль:** ${profile.displayName}

▶️ **ЧТО ДАЛЬШЕ?**

Этап 5: ГЛУБИННЫЕ ПАТТЕРНЫ

Заглянем в детство и подсознание.

📊 Вопросов: 10
⏱ Время: ~5 минут

👇 **ЭТО ПОХОЖЕ НА ВАС?**`;
        
        // Показываем сообщение с кнопками подтверждения
        this.addBotMessageWithButtons(text, [
            { text: "✅ ДА", callback: () => this.profileConfirm() },
            { text: "❓ ЕСТЬ СОМНЕНИЯ", callback: () => this.profileDoubt() },
            { text: "🔄 НЕТ", callback: () => this.profileReject() }
        ]);
        
        // Не переходим автоматически к следующему этапу
        // Ждем ответа пользователя
    },
    
    // Показать результат этапа 5
    showStage5Result() {
        const deep = this.deepPatterns || { attachment: "🤗 Надежный" };
        
        const text = `✨ **РЕЗУЛЬТАТ ЭТАПА 5**

**Тип привязанности:** ${deep.attachment}

✅ **ТЕСТ ЗАВЕРШЕН!**

Сейчас я сформирую ваш полный психологический профиль...`;
        
        this.addBotMessage(text);
        
        setTimeout(() => {
            this.showFinalProfile();
        }, 2000);
    },
    
    // Показать финальный профиль
    showFinalProfile() {
        const profile = this.calculateFinalProfile();
        const deep = this.deepPatterns || { attachment: "🤗 Надежный" };
        
        const sbDesc = this.getVectorDescription("СБ", profile.sbLevel);
        const tfDesc = this.getVectorDescription("ТФ", profile.tfLevel);
        const ubDesc = this.getVectorDescription("УБ", profile.ubLevel);
        const chvDesc = this.getVectorDescription("ЧВ", profile.chvLevel);
        
        const text = `🧠 **ВАШ ПСИХОЛОГИЧЕСКИЙ ПОРТРЕТ**

**Профиль:** ${profile.displayName}
**Тип восприятия:** ${profile.perceptionType}
**Уровень мышления:** ${profile.thinkingLevel}/9

📊 **ТВОИ ВЕКТОРЫ:**

• **Реакция на давление (СБ ${profile.sbLevel}/6):** ${sbDesc}

• **Отношение к деньгам (ТФ ${profile.tfLevel}/6):** ${tfDesc}

• **Понимание мира (УБ ${profile.ubLevel}/6):** ${ubDesc}

• **Отношения с людьми (ЧВ ${profile.chvLevel}/6):** ${chvDesc}

🧠 **Глубинный паттерн:** ${deep.attachment}

👇 **Что дальше?**`;
        
        // Сохраняем результаты
        if (App && App.userId) {
            localStorage.setItem(`test_results_${App.userId}`, JSON.stringify({
                profile: profile,
                deepPatterns: deep,
                perceptionType: this.perceptionType,
                thinkingLevel: this.thinkingLevel
            }));
        }
        
        this.addBotMessageWithButtons(text, [
            { text: "🧠 МЫСЛИ ПСИХОЛОГА", callback: () => this.showPsychologistThought() },
            { text: "🎯 ВЫБРАТЬ ЦЕЛЬ", callback: () => this.showGoals() },
            { text: "⚙️ ВЫБРАТЬ РЕЖИМ", callback: () => this.showModes() }
        ]);
    },
    
    // Добавить сообщение с кнопками
    addBotMessageWithButtons(text, buttons) {
        const messagesList = document.getElementById('testMessagesList');
        if (!messagesList) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        let buttonsHtml = '<div class="message-buttons">';
        buttons.forEach((button, index) => {
            buttonsHtml += `
                <button class="message-button" data-callback="${index}">
                    ${button.text}
                </button>
            `;
        });
        buttonsHtml += '</div>';
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-text">${text}</div>
                ${buttonsHtml}
                <div class="message-time">только что</div>
            </div>
        `;
        
        messagesList.appendChild(messageDiv);
        
        // Добавляем обработчики для кнопок
        const buttonsElements = messageDiv.querySelectorAll('.message-button');
        buttonsElements.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.callback);
                
                // Удаляем кнопки
                const buttonsContainer = messageDiv.querySelector('.message-buttons');
                if (buttonsContainer) {
                    buttonsContainer.remove();
                }
                
                // Вызываем callback
                buttons[index].callback();
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
    
    // Получить описание вектора
    getVectorDescription(vector, level) {
        const descriptions = {
            "СБ": {
                1: "Под давлением вы замираете и не можете слова сказать.",
                2: "Вы избегаете конфликтов — уходите, прячетесь, уворачиваетесь.",
                3: "Вы соглашаетесь внешне, но внутри всё кипит.",
                4: "Вы внешне спокойны, но внутри держите всё в себе.",
                5: "Вы умеете защищать себя, но можете и атаковать в ответ.",
                6: "Вы умеете защищать себя и использовать силу во благо."
            },
            "ТФ": {
                1: "Деньги приходят и уходят — как повезёт.",
                2: "Вы ищете возможности, но каждый раз как с нуля.",
                3: "Вы умеете зарабатывать своим трудом.",
                4: "Вы хорошо зарабатываете и можете копить.",
                5: "Вы создаёте системы дохода и управляете финансами.",
                6: "Вы управляете капиталом и создаёте финансовые структуры."
            },
            "УБ": {
                1: "Вы стараетесь не думать о сложном — само как-то решится.",
                2: "Вы верите в знаки, судьбу, высшие силы.",
                3: "Вы доверяете экспертам и авторитетам.",
                4: "Вы ищете скрытые смыслы и заговоры.",
                5: "Вы анализируете факты и делаете выводы сами.",
                6: "Вы строите теории и ищете закономерности."
            },
            "ЧВ": {
                1: "Вы сильно привязываетесь к людям, тяжело без них.",
                2: "Вы подстраиваетесь под других, теряя себя.",
                3: "Вы хотите нравиться, показываете себя с лучшей стороны.",
                4: "Вы умеете влиять на людей, добиваться своего.",
                5: "Вы строите равные партнёрские отношения.",
                6: "Вы создаёте сообщества и сети контактов."
            }
        };
        
        return descriptions[vector]?.[level] || "Информация уточняется";
    },
    
    // Обработчик подтверждения профиля
    profileConfirm() {
        this.addBotMessage("✅ Отлично! Тогда исследуем глубину...");
        
        setTimeout(() => {
            this.currentStage++;
            this.currentQuestionIndex = 0;
            this.sendStageIntro();
        }, 1500);
    },
    
    // Обработчик сомнений
    profileDoubt() {
        this.addBotMessage("❓ Давайте уточним. Какие именно моменты вызывают сомнения?");
        // Здесь можно добавить логику уточняющих вопросов
    },
    
    // Обработчик отклонения
    profileReject() {
        this.addBotMessage("🔄 Хорошо, пройдем тест заново.");
        
        setTimeout(() => {
            this.currentStage = 0;
            this.currentQuestionIndex = 0;
            this.answers = {};
            this.perceptionScores = { EXTERNAL: 0, INTERNAL: 0, SYMBOLIC: 0, MATERIAL: 0 };
            this.perceptionType = null;
            this.thinkingScores = {};
            this.behavioralLevels = { "СБ": [], "ТФ": [], "УБ": [], "ЧВ": [] };
            this.diltsCounts = { "ENVIRONMENT": 0, "BEHAVIOR": 0, "CAPABILITIES": 0, "VALUES": 0, "IDENTITY": 0 };
            this.deepAnswers = [];
            this.thinkingLevel = null;
            this.saveProgress();
            
            this.addBotMessage("🧠 Начинаем тест заново. Этап 1: КОНФИГУРАЦИЯ ВОСПРИЯТИЯ");
            setTimeout(() => {
                this.sendStageIntro();
            }, 1000);
        }, 1500);
    },
    
    // Показать результаты (завершение)
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
    
    // Заглушки для переходов
    showPsychologistThought() {
        if (App && App.showPsychologistThought) {
            App.showPsychologistThought();
        }
    },
    
    showGoals() {
        if (App && App.showDynamicDestinations) {
            App.showDynamicDestinations();
        }
    },
    
    showModes() {
        if (App && App.showModeSelection) {
            App.showModeSelection();
        }
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
