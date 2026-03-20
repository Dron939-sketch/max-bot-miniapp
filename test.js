// ========== test.js ==========
// ПОЛНЫЙ ТЕСТ ИЗ 5 ЭТАПОВ КАК В TELEGRAM
// С ЭКРАНАМИ ПОСЛЕ КАЖДОГО ЭТАПА И КНОПКАМИ

const Test = {
    // Текущее состояние
    currentStage: 0,
    currentQuestionIndex: 0,
    userId: null,
    answers: [],
    
    // Данные для расчетов
    perceptionScores: {
        EXTERNAL: 0,
        INTERNAL: 0,
        SYMBOLIC: 0,
        MATERIAL: 0
    },
    perceptionType: null,
    
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
    
    deepAnswers: [],
    deepPatterns: null,
    profileData: null,
    
    clarificationIteration: 0,
    discrepancies: [],
    clarifyingAnswers: [],
    
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
            total: null
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
    
    // Вопросы этапа 1 (8 вопросов)
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
    
    // Вопросы этапа 2 (зависят от типа восприятия)
    thinking_questions: {
        external: [
            {
                id: 't1',
                text: 'Когда вы сталкиваетесь с проблемой, вы:',
                options: [
                    { text: '📚 Ищете похожий опыт у других', level: 5 },
                    { text: '🧩 Раскладываете на части и анализируете', level: 8 },
                    { text: '💫 Доверяете интуиции', level: 3 },
                    { text: '🤝 Советуетесь с экспертами', level: 6 }
                ],
                measures: 'thinking'
            },
            {
                id: 't2',
                text: 'Что вам легче всего?',
                options: [
                    { text: '🔍 Замечать детали в поведении людей', level: 5 },
                    { text: '📈 Видеть тренды и тенденции', level: 8 },
                    { text: '🎯 Находить нестандартные решения', level: 7 },
                    { text: '📝 Действовать по инструкции', level: 4 }
                ],
                measures: 'thinking'
            },
            {
                id: 't3',
                text: 'Как вы принимаете важные решения?',
                options: [
                    { text: '⚖️ Взвешиваете все за и против', level: 8 },
                    { text: '💭 Прислушиваетесь к внутреннему голосу', level: 5 },
                    { text: '👥 Советуетесь с близкими', level: 4 },
                    { text: '⏰ Откладываете, пока всё не решится само', level: 2 }
                ],
                measures: 'thinking'
            },
            {
                id: 't4',
                text: 'Что вы делаете, когда получаете новую информацию?',
                options: [
                    { text: '🔗 Связываю с тем, что уже знаю', level: 7 },
                    { text: '❓ Задаю много вопросов', level: 6 },
                    { text: '📝 Запоминаю основные моменты', level: 5 },
                    { text: '🤔 Думаю, как это можно применить', level: 8 }
                ],
                measures: 'thinking'
            },
            {
                id: 't5',
                text: 'Как вы относитесь к сложным теориям?',
                options: [
                    { text: '😫 С трудом воспринимаю абстракции', level: 2 },
                    { text: '📚 Могу разобраться, если нужно', level: 5 },
                    { text: '💡 Люблю искать глубинные смыслы', level: 8 },
                    { text: '🛠 Ищу практическое применение', level: 6 }
                ],
                measures: 'thinking'
            },
            {
                id: 't6',
                text: 'Когда вы объясняете что-то другому, вы:',
                options: [
                    { text: '📖 Рассказываете последовательно, шаг за шагом', level: 6 },
                    { text: '🎨 Используете метафоры и образы', level: 7 },
                    { text: '📊 Показываете схему или структуру', level: 8 },
                    { text: '🤷 Затрудняетесь объяснить', level: 3 }
                ],
                measures: 'thinking'
            },
            {
                id: 't7',
                text: 'Что для вас важнее при планировании?',
                options: [
                    { text: '🎯 Конкретная цель и сроки', level: 6 },
                    { text: '🔄 Гибкость и возможность менять план', level: 7 },
                    { text: '📋 Четкая последовательность шагов', level: 5 },
                    { text: '🌈 Вдохновение и идеи', level: 8 }
                ],
                measures: 'thinking'
            },
            {
                id: 't8',
                text: 'Как вы относитесь к критике?',
                options: [
                    { text: '👂 Внимательно слушаю и анализирую', level: 8 },
                    { text: '🛡️ Защищаюсь и объясняю свою позицию', level: 5 },
                    { text: '😔 Расстраиваюсь и переживаю', level: 3 },
                    { text: '🤷 Пропускаю мимо ушей', level: 4 }
                ],
                measures: 'thinking'
            },
            {
                id: 't9',
                text: 'Как вы запоминаете информацию?',
                options: [
                    { text: '👀 Лучше вижу образы', level: 6 },
                    { text: '👂 Лучше слышу и проговариваю', level: 5 },
                    { text: '✍️ Лучше записываю', level: 7 },
                    { text: '🔄 Лучше проживаю на практике', level: 8 }
                ],
                measures: 'thinking'
            },
            {
                id: 't10',
                text: 'Что для вас важнее в общении?',
                options: [
                    { text: '🤝 Результат и договоренности', level: 7 },
                    { text: '💕 Эмоции и атмосфера', level: 5 },
                    { text: '🔍 Смысл и содержание', level: 8 },
                    { text: '🎭 Впечатление и статус', level: 4 }
                ],
                measures: 'thinking'
            },
            {
                id: 't11',
                text: 'Как вы решаете сложные задачи?',
                options: [
                    { text: '🧩 Разбиваю на маленькие шаги', level: 7 },
                    { text: '💡 Ищу нестандартный подход', level: 8 },
                    { text: '👥 Привлекаю команду', level: 5 },
                    { text: '⚡ Делаю быстро, не задумываясь', level: 4 }
                ],
                measures: 'thinking'
            },
            {
                id: 't12',
                text: 'Что вас вдохновляет?',
                options: [
                    { text: '🏆 Достижения и успехи', level: 6 },
                    { text: '❤️ Отношения и поддержка', level: 5 },
                    { text: '🎯 Цели и мечты', level: 8 },
                    { text: '🌈 Красота и гармония', level: 7 }
                ],
                measures: 'thinking'
            }
        ],
        internal: [
            {
                id: 't1',
                text: 'Когда вы сталкиваетесь с проблемой, вы:',
                options: [
                    { text: '📚 Ищете похожий опыт и готовые решения', level: 5 },
                    { text: '🧩 Раскладываете на части и анализируете', level: 8 },
                    { text: '💫 Доверяете интуиции и первому впечатлению', level: 4 },
                    { text: '🤝 Советуетесь с другими', level: 3 }
                ],
                measures: 'thinking'
            },
            {
                id: 't2',
                text: 'Что вам легче всего?',
                options: [
                    { text: '🔍 Замечать детали и нюансы', level: 7 },
                    { text: '📈 Видеть общую картину и тенденции', level: 8 },
                    { text: '🎯 Находить нестандартные решения', level: 6 },
                    { text: '📝 Действовать по инструкции', level: 4 }
                ],
                measures: 'thinking'
            },
            {
                id: 't3',
                text: 'Как вы принимаете важные решения?',
                options: [
                    { text: '⚖️ Взвешиваете все за и против', level: 8 },
                    { text: '💭 Прислушиваетесь к внутреннему голосу', level: 6 },
                    { text: '👥 Советуетесь с близкими', level: 4 },
                    { text: '⏰ Откладываете, пока всё не решится само', level: 2 }
                ],
                measures: 'thinking'
            },
            {
                id: 't4',
                text: 'Что вы делаете, когда получаете новую информацию?',
                options: [
                    { text: '🔗 Связываю с тем, что уже знаю', level: 7 },
                    { text: '❓ Задаю много вопросов', level: 5 },
                    { text: '📝 Запоминаю основные моменты', level: 4 },
                    { text: '🤔 Думаю, как это можно применить', level: 8 }
                ],
                measures: 'thinking'
            },
            {
                id: 't5',
                text: 'Как вы относитесь к сложным теориям и концепциям?',
                options: [
                    { text: '😫 С трудом воспринимаю абстракции', level: 2 },
                    { text: '📚 Могу разобраться, если нужно', level: 5 },
                    { text: '💡 Люблю искать глубинные смыслы', level: 8 },
                    { text: '🛠 Ищу практическое применение', level: 6 }
                ],
                measures: 'thinking'
            },
            {
                id: 't6',
                text: 'Когда вы объясняете что-то другому, вы:',
                options: [
                    { text: '📖 Рассказываете последовательно, шаг за шагом', level: 6 },
                    { text: '🎨 Используете метафоры и образы', level: 7 },
                    { text: '📊 Показываете схему или структуру', level: 8 },
                    { text: '🤷 Затрудняетесь объяснить', level: 3 }
                ],
                measures: 'thinking'
            },
            {
                id: 't7',
                text: 'Что для вас важнее при планировании?',
                options: [
                    { text: '🎯 Конкретная цель и сроки', level: 7 },
                    { text: '🔄 Гибкость и возможность менять план', level: 6 },
                    { text: '📋 Четкая последовательность шагов', level: 5 },
                    { text: '🌈 Вдохновение и идеи', level: 8 }
                ],
                measures: 'thinking'
            },
            {
                id: 't8',
                text: 'Как вы относитесь к критике?',
                options: [
                    { text: '👂 Внимательно слушаю и анализирую', level: 8 },
                    { text: '🛡️ Защищаюсь и объясняю свою позицию', level: 5 },
                    { text: '😔 Расстраиваюсь и переживаю', level: 3 },
                    { text: '🤷 Пропускаю мимо ушей', level: 4 }
                ],
                measures: 'thinking'
            },
            {
                id: 't9',
                text: 'Как вы запоминаете информацию?',
                options: [
                    { text: '👀 Лучше вижу образы', level: 6 },
                    { text: '👂 Лучше слышу и проговариваю', level: 5 },
                    { text: '✍️ Лучше записываю', level: 7 },
                    { text: '🔄 Лучше проживаю на практике', level: 8 }
                ],
                measures: 'thinking'
            },
            {
                id: 't10',
                text: 'Что для вас важнее в общении?',
                options: [
                    { text: '🤝 Результат и договоренности', level: 7 },
                    { text: '💕 Эмоции и атмосфера', level: 5 },
                    { text: '🔍 Смысл и содержание', level: 8 },
                    { text: '🎭 Впечатление и статус', level: 4 }
                ],
                measures: 'thinking'
            }
        ]
    },
    
    // Вопросы этапа 3 (8 вопросов)
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
                { text: '👂 Внимательно слушаете и анализирую', strategy: 'СБ', level: 5 },
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
    
    // Вопросы этапа 4 (8 вопросов)
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
    
    // Вопросы этапа 5 (10 вопросов)
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
    
    // ============================================
    // ФУНКЦИИ РАСЧЕТА
    // ============================================
    
    determinePerceptionType() {
        const external = this.perceptionScores.EXTERNAL;
        const internal = this.perceptionScores.INTERNAL;
        const symbolic = this.perceptionScores.SYMBOLIC;
        const material = this.perceptionScores.MATERIAL;
        
        const attention = external > internal ? "EXTERNAL" : "INTERNAL";
        const anxiety = symbolic > material ? "SYMBOLIC" : "MATERIAL";
        
        if (attention === "EXTERNAL" && anxiety === "SYMBOLIC") {
            return {
                type: "СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ",
                group: "external",
                questionsCount: 12
            };
        } else if (attention === "EXTERNAL" && anxiety === "MATERIAL") {
            return {
                type: "СТАТУСНО-ОРИЕНТИРОВАННЫЙ",
                group: "external",
                questionsCount: 12
            };
        } else if (attention === "INTERNAL" && anxiety === "SYMBOLIC") {
            return {
                type: "СМЫСЛО-ОРИЕНТИРОВАННЫЙ",
                group: "internal",
                questionsCount: 10
            };
        } else {
            return {
                type: "ПРАКТИКО-ОРИЕНТИРОВАННЫЙ",
                group: "internal",
                questionsCount: 10
            };
        }
    },
    
    calculateThinkingLevel() {
        let totalScore = 0;
        for (let level in this.thinkingScores) {
            totalScore += this.thinkingScores[level];
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
    
    calculateFinalLevel(stage2Level, stage3Scores) {
        if (!stage3Scores || stage3Scores.length === 0) return stage2Level;
        const avg = stage3Scores.reduce((a, b) => a + b, 0) / stage3Scores.length;
        return Math.round((stage2Level + avg) / 2);
    },
    
    determineDominantDilts() {
        let max = 0;
        let dominant = "BEHAVIOR";
        for (let level in this.diltsCounts) {
            if (this.diltsCounts[level] > max) {
                max = this.diltsCounts[level];
                dominant = level;
            }
        }
        return dominant;
    },
    
    calculateFinalProfile() {
        const sbAvg = this.behavioralLevels["СБ"].length 
            ? this.behavioralLevels["СБ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["СБ"].length 
            : 3;
        const tfAvg = this.behavioralLevels["ТФ"].length 
            ? this.behavioralLevels["ТФ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["ТФ"].length 
            : 3;
        const ubAvg = this.behavioralLevels["УБ"].length 
            ? this.behavioralLevels["УБ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["УБ"].length 
            : 3;
        const chvAvg = this.behavioralLevels["ЧВ"].length 
            ? this.behavioralLevels["ЧВ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["ЧВ"].length 
            : 3;
        
        return {
            displayName: `СБ-${Math.round(sbAvg)}_ТФ-${Math.round(tfAvg)}_УБ-${Math.round(ubAvg)}_ЧВ-${Math.round(chvAvg)}`,
            perceptionType: this.perceptionType,
            thinkingLevel: this.thinkingLevel,
            sbLevel: Math.round(sbAvg),
            tfLevel: Math.round(tfAvg),
            ubLevel: Math.round(ubAvg),
            chvLevel: Math.round(chvAvg),
            dominantDilts: this.determineDominantDilts(),
            diltsCounts: this.diltsCounts
        };
    },
    
    analyzeDeepPatterns() {
        const patterns = { secure: 0, anxious: 0, avoidant: 0, disorganized: 0 };
        (this.deepAnswers || []).forEach(a => {
            if (a.pattern) patterns[a.pattern] = (patterns[a.pattern] || 0) + 1;
        });
        
        let max = 0, dominant = "secure";
        for (let p in patterns) {
            if (patterns[p] > max) { max = patterns[p]; dominant = p; }
        }
        
        const map = {
            secure: "🤗 Надежный",
            anxious: "😥 Тревожный",
            avoidant: "🛡️ Избегающий",
            disorganized: "🌀 Смешанный"
        };
        
        return { attachment: map[dominant] || "🤗 Надежный", patterns };
    },
    
    convertToSimpleLanguage() {
        const sbLevel = this.behavioralLevels["СБ"].length 
            ? Math.round(this.behavioralLevels["СБ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["СБ"].length) 
            : 3;
        const tfLevel = this.behavioralLevels["ТФ"].length 
            ? Math.round(this.behavioralLevels["ТФ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["ТФ"].length) 
            : 3;
        const ubLevel = this.behavioralLevels["УБ"].length 
            ? Math.round(this.behavioralLevels["УБ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["УБ"].length) 
            : 3;
        const chvLevel = this.behavioralLevels["ЧВ"].length 
            ? Math.round(this.behavioralLevels["ЧВ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["ЧВ"].length) 
            : 3;
        
        const sbDesc = {
            1: "Под давлением вы замираете и не можете слова сказать.",
            2: "Вы избегаете конфликтов — уходите, прячетесь, уворачиваетесь.",
            3: "Вы соглашаетесь внешне, но внутри всё кипит.",
            4: "Вы внешне спокойны, но внутри держите всё в себе.",
            5: "Вы пытаетесь сгладить конфликт, перевести в шутку.",
            6: "Вы умеете защищать себя, но можете и атаковать в ответ."
        }[sbLevel] || "Вы по-разному реагируете на давление.";
        
        const tfDesc = {
            1: "Деньги приходят и уходят — как повезёт.",
            2: "Вы ищете возможности, но каждый раз как с нуля.",
            3: "Вы умеете зарабатывать своим трудом.",
            4: "Вы хорошо зарабатываете и можете копить.",
            5: "Вы создаёте системы дохода и управляете финансами.",
            6: "Вы управляете капиталом и создаёте финансовые структуры."
        }[tfLevel] || "У вас свои отношения с деньгами.";
        
        const ubDesc = {
            1: "Вы стараетесь не думать о сложном — само как-то решится.",
            2: "Вы верите в знаки, судьбу, высшие силы.",
            3: "Вы доверяете экспертам и авторитетам.",
            4: "Вы ищете скрытые смыслы и заговоры.",
            5: "Вы анализируете факты и делаете выводы сами.",
            6: "Вы строите теории и ищете закономерности."
        }[ubLevel] || "Вы по-своему понимаете мир.";
        
        const chvDesc = {
            1: "Вы сильно привязываетесь к людям, тяжело без них.",
            2: "Вы подстраиваетесь под других, теряя себя.",
            3: "Вы хотите нравиться, показываете себя с лучшей стороны.",
            4: "Вы умеете влиять на людей, добиваться своего.",
            5: "Вы строите равные партнёрские отношения.",
            6: "Вы создаёте сообщества и сети контактов."
        }[chvLevel] || "У вас свои паттерны в отношениях.";
        
        const growthMap = {
            "ENVIRONMENT": "Посмотрите вокруг — может, дело в обстоятельствах?",
            "BEHAVIOR": "Попробуйте делать хоть что-то по-другому — маленькие шаги многое меняют.",
            "CAPABILITIES": "Развивайте новые навыки — они откроют новые возможности.",
            "VALUES": "Поймите, что для вас действительно важно — это изменит всё.",
            "IDENTITY": "Ответьте себе на вопрос «кто я?» — в этом ключ к изменениям."
        };
        
        return {
            attentionDesc: this.perceptionType?.includes("СОЦИАЛЬНО") || this.perceptionType?.includes("СТАТУСНО")
                ? "Для вас важно, что думают другие, вы чутко считываете настроение и ожидания окружающих."
                : "Для вас важнее ваши внутренние ощущения и чувства, чем мнение других.",
            
            thinkingDesc: this.thinkingLevel <= 3 
                ? "Вы хорошо видите отдельные ситуации, но не всегда замечаете общие закономерности."
                : this.thinkingLevel <= 6
                ? "Вы замечаете закономерности, но не всегда видите, к чему они приведут в будущем."
                : "Вы видите общие законы и можете предсказывать развитие ситуаций.",
            
            sbDesc,
            tfDesc,
            ubDesc,
            chvDesc,
            
            growthPoint: growthMap[this.determineDominantDilts()] || "Начните с малого — и увидите, куда приведёт."
        };
    },
    
    calculateProfileConfidence() {
        let confidence = 0.5;
        if (this.perceptionType) confidence += 0.1;
        if (this.thinkingLevel) confidence += 0.1;
        if (Object.keys(this.behavioralLevels).some(k => this.behavioralLevels[k].length > 0)) confidence += 0.1;
        if (Object.values(this.diltsCounts).some(v => v > 0)) confidence += 0.1;
        if (this.deepPatterns) confidence += 0.1;
        confidence += this.clarificationIteration * 0.05;
        return Math.min(1.0, confidence);
    },
    
    // ============================================
    // ЛОГИКА ТЕСТА - ИСПРАВЛЕННЫЕ МЕТОДЫ
    // ============================================
    
    getCurrentQuestions() {
        const stage = this.stages[this.currentStage];
        if (stage.id === 'perception') return this.perception_questions;
        if (stage.id === 'thinking') {
            const group = this.perceptionType 
                ? (this.determinePerceptionType().group === 'external' ? 'external' : 'internal')
                : 'internal';
            return this.thinking_questions[group];
        }
        if (stage.id === 'behavior') return this.behavior_questions;
        if (stage.id === 'growth') return this.growth_questions;
        if (stage.id === 'deep') return this.deep_questions;
        return [];
    },
    
    init(userId) {
        this.userId = userId || App?.userId || 'test_user';
        this.currentStage = 0;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.perceptionScores = { EXTERNAL: 0, INTERNAL: 0, SYMBOLIC: 0, MATERIAL: 0 };
        this.perceptionType = null;
        this.thinkingScores = {};
        this.behavioralLevels = { "СБ": [], "ТФ": [], "УБ": [], "ЧВ": [] };
        this.diltsCounts = { "ENVIRONMENT": 0, "BEHAVIOR": 0, "CAPABILITIES": 0, "VALUES": 0, "IDENTITY": 0 };
        this.deepAnswers = [];
        this.deepPatterns = null;
        this.profileData = null;
        this.clarificationIteration = 0;
        this.discrepancies = [];
        this.clarifyingAnswers = [];
        
        this.loadProgress();
        console.log('📝 Тест инициализирован для пользователя:', this.userId);
    },
    
    loadProgress() {
        const saved = localStorage.getItem(`test_${this.userId}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentStage = data.currentStage || 0;
                this.currentQuestionIndex = data.currentQuestionIndex || 0;
                this.answers = data.answers || [];
                this.perceptionScores = data.perceptionScores || { EXTERNAL: 0, INTERNAL: 0, SYMBOLIC: 0, MATERIAL: 0 };
                this.perceptionType = data.perceptionType || null;
                this.thinkingScores = data.thinkingScores || {};
                this.behavioralLevels = data.behavioralLevels || { "СБ": [], "ТФ": [], "УБ": [], "ЧВ": [] };
                this.diltsCounts = data.diltsCounts || { "ENVIRONMENT": 0, "BEHAVIOR": 0, "CAPABILITIES": 0, "VALUES": 0, "IDENTITY": 0 };
                this.deepAnswers = data.deepAnswers || [];
                this.deepPatterns = data.deepPatterns || null;
                this.profileData = data.profileData || null;
                this.clarificationIteration = data.clarificationIteration || 0;
                this.discrepancies = data.discrepancies || [];
                this.clarifyingAnswers = data.clarifyingAnswers || [];
                
                if (this.perceptionType) {
                    const result = this.determinePerceptionType();
                    this.stages[1].total = result.questionsCount;
                }
            } catch (e) { console.warn('❌ Ошибка загрузки прогресса:', e); }
        }
    },
    
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
            deepPatterns: this.deepPatterns,
            profileData: this.profileData,
            clarificationIteration: this.clarificationIteration,
            discrepancies: this.discrepancies,
            clarifyingAnswers: this.clarifyingAnswers,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(`test_${this.userId}`, JSON.stringify(data));
        console.log('💾 Прогресс сохранен');
    },
    
    start() {
        this.currentStage = 0;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.perceptionScores = { EXTERNAL: 0, INTERNAL: 0, SYMBOLIC: 0, MATERIAL: 0 };
        this.perceptionType = null;
        this.thinkingScores = {};
        this.behavioralLevels = { "СБ": [], "ТФ": [], "УБ": [], "ЧВ": [] };
        this.diltsCounts = { "ENVIRONMENT": 0, "BEHAVIOR": 0, "CAPABILITIES": 0, "VALUES": 0, "IDENTITY": 0 };
        this.deepAnswers = [];
        this.deepPatterns = null;
        this.profileData = null;
        this.clarificationIteration = 0;
        this.discrepancies = [];
        this.clarifyingAnswers = [];
        this.saveProgress();
        this.showTestScreen();
        
        setTimeout(() => {
            this.addBotMessage('🧠 Начинаем тест из 5 этапов. Я буду задавать вопросы, а ты выбирай ответы.');
            setTimeout(() => this.sendStageIntro(), 1000);
        }, 100);
    },
    
    showTestScreen() {
        const container = document.getElementById('screenContainer');
        container.innerHTML = `
            <div class="test-messages-container" id="testMessagesContainer">
                <div class="test-messages-list" id="testMessagesList"></div>
            </div>
        `;
    },
    
    sendStageIntro() {
        const stage = this.stages[this.currentStage];
        let text = `${stage.name}\n\n${stage.description}`;
        if (stage.id === 'thinking' && this.perceptionType) {
            text += `\n\nВаш тип восприятия: ${this.perceptionType}`;
        }
        text += `\n\n📊 Всего вопросов: ${stage.total}`;
        this.addBotMessage(text);
        setTimeout(() => this.sendNextQuestion(), 2000);
    },
    
    addBotMessage(text) {
        const list = document.getElementById('testMessagesList');
        if (!list) return;
        const msg = document.createElement('div');
        msg.className = 'message bot-message';
        msg.innerHTML = `<div class="message-bubble"><div class="message-text">${text}</div><div class="message-time">только что</div></div>`;
        list.appendChild(msg);
        this.scrollToBottom();
    },
    
    addUserMessage(text) {
        const list = document.getElementById('testMessagesList');
        if (!list) return;
        const msg = document.createElement('div');
        msg.className = 'message user-message';
        msg.innerHTML = `<div class="message-bubble"><div class="message-text">${text}</div><div class="message-time">только что</div><div class="message-status"><span class="status-icon sent"></span></div></div>`;
        list.appendChild(msg);
        this.scrollToBottom();
    },
    
    // ===== ИСПРАВЛЕННЫЙ МЕТОД addQuestionMessage =====
    addQuestionMessage(text, options, callback, current, total) {
        const list = document.getElementById('testMessagesList');
        if (!list) return;
        
        const msg = document.createElement('div');
        msg.className = 'message bot-message';
        
        // Создаем пузырек сообщения
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // Текст вопроса
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = text;
        
        // Контейнер для кнопок
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'message-buttons';
        
        // Добавляем кнопки
        options.forEach((opt, idx) => {
            const optText = typeof opt === 'object' ? opt.text : opt;
            const btn = document.createElement('button');
            btn.className = 'message-button';
            btn.setAttribute('data-option-index', idx);
            btn.textContent = optText;
            
            // Добавляем обработчик
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.optionIndex);
                const option = options[index];
                const optionText = typeof option === 'object' ? option.text : option;
                
                this.addUserMessage(optionText);
                
                // Удаляем контейнер с кнопками
                const buttonsContainer = msg.querySelector('.message-buttons');
                if (buttonsContainer) {
                    buttonsContainer.remove();
                }
                
                callback(index, option);
            });
            
            buttonsDiv.appendChild(btn);
        });
        
        // Время и прогресс
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = `📊 Вопрос ${current}/${total}`;
        
        // Собираем сообщение
        bubble.appendChild(textDiv);
        bubble.appendChild(buttonsDiv);
        bubble.appendChild(timeDiv);
        msg.appendChild(bubble);
        
        // Добавляем в список
        list.appendChild(msg);
        
        // Прокрутка вниз
        this.scrollToBottom();
    },
    
    // ===== ИСПРАВЛЕННЫЙ МЕТОД addMessageWithButtons =====
    addMessageWithButtons(text, buttons) {
        const list = document.getElementById('testMessagesList');
        if (!list) return;
        
        const msg = document.createElement('div');
        msg.className = 'message bot-message';
        
        // Создаем пузырек сообщения
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // Текст сообщения
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = text;
        
        // Контейнер для кнопок
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'message-buttons';
        
        // Добавляем кнопки
        buttons.forEach((btn, i) => {
            const button = document.createElement('button');
            button.className = 'message-button';
            button.setAttribute('data-callback', i);
            button.textContent = btn.text;
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(button.dataset.callback);
                
                // Удаляем контейнер с кнопками
                const buttonsContainer = msg.querySelector('.message-buttons');
                if (buttonsContainer) {
                    buttonsContainer.remove();
                }
                
                buttons[idx].callback();
            });
            
            buttonsDiv.appendChild(button);
        });
        
        // Время
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = 'только что';
        
        // Собираем сообщение
        bubble.appendChild(textDiv);
        bubble.appendChild(buttonsDiv);
        bubble.appendChild(timeDiv);
        msg.appendChild(bubble);
        
        // Добавляем в список
        list.appendChild(msg);
        
        // Прокрутка вниз
        this.scrollToBottom();
    },
    
    // ===== НОВЫЙ МЕТОД ДЛЯ АВТО-ПРОКРУТКИ =====
    scrollToBottom() {
        setTimeout(() => {
            const container = document.getElementById('testMessagesContainer');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 50);
    },
    
    sendNextQuestion() {
        if (this.currentStage >= this.stages.length) {
            this.showFinalProfile();
            return;
        }
        
        const stage = this.stages[this.currentStage];
        const questions = this.getCurrentQuestions();
        
        if (this.currentQuestionIndex >= stage.total) {
            this.completeCurrentStage();
            return;
        }
        
        const q = questions[this.currentQuestionIndex];
        this.addQuestionMessage(
            q.text,
            q.options,
            (idx, opt) => this.handleAnswer(stage.id, q, idx, opt),
            this.currentQuestionIndex + 1,
            stage.total
        );
    },
    
    handleAnswer(stageId, q, idx, opt) {
        this.answers.push({
            stage: stageId,
            questionIndex: this.currentQuestionIndex,
            questionId: q.id,
            question: q.text,
            answer: opt.text,
            option: idx
        });
        
        if (stageId === 'perception' && opt.scores) {
            for (let axis in opt.scores) {
                this.perceptionScores[axis] += opt.scores[axis];
            }
        } else if (stageId === 'thinking' && opt.level) {
            this.thinkingScores[opt.level] = (this.thinkingScores[opt.level] || 0) + 1;
        } else if (stageId === 'behavior' && q.strategy && opt.level) {
            this.behavioralLevels[q.strategy].push(opt.level);
        } else if (stageId === 'growth' && opt.dilts) {
            this.diltsCounts[opt.dilts] = (this.diltsCounts[opt.dilts] || 0) + 1;
        } else if (stageId === 'deep') {
            this.deepAnswers.push({
                questionId: q.id,
                pattern: opt.pattern,
                target: q.target
            });
        }
        
        this.saveProgress();
        this.currentQuestionIndex++;
        setTimeout(() => this.sendNextQuestion(), 800);
    },
    
    completeCurrentStage() {
        const stage = this.stages[this.currentStage];
        
        if (stage.id === 'perception') {
            const result = this.determinePerceptionType();
            this.perceptionType = result.type;
            this.stages[1].total = result.questionsCount;
            this.showStage1Result();
            
        } else if (stage.id === 'thinking') {
            this.thinkingLevel = this.calculateThinkingLevel();
            this.showStage2Result();
            
        } else if (stage.id === 'behavior') {
            this.showStage3Result();
            
        } else if (stage.id === 'growth') {
            this.profileData = this.calculateFinalProfile();
            this.showStage4Result();
            
        } else if (stage.id === 'deep') {
            this.deepPatterns = this.analyzeDeepPatterns();
            this.showStage5Result();
        }
    },
    
    // ============================================
    // ЭКРАН 1: РЕЗУЛЬТАТ ЭТАПА 1
    // ============================================
    showStage1Result() {
        const result = this.determinePerceptionType();
        const feedback = {
            "СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ": "Вы ориентированы на других, чутко считываете настроение и ожидания окружающих. Ваше внимание направлено вовне, а тревога связана с отвержением.",
            "СТАТУСНО-ОРИЕНТИРОВАННЫЙ": "Для вас важны статус, положение и материальные достижения. Вы ориентированы на внешние атрибуты успеха, а тревожитесь о потере контроля.",
            "СМЫСЛО-ОРИЕНТИРОВАННЫЙ": "Вы ищете глубинные смыслы и ориентируетесь на внутренние ощущения. Ваша тревога связана с отвержением и непониманием.",
            "ПРАКТИКО-ОРИЕНТИРОВАННЫЙ": "Вы ориентированы на практические результаты и конкретные действия. Ваше внимание направлено внутрь, а тревога — о потере контроля."
        }[result.type];
        
        const text = `✨ РЕЗУЛЬТАТ ЭТАПА 1\n\nВаш тип восприятия: ${result.type}\n\n${feedback}\n\n▶️ ЧТО ДАЛЬШЕ?\n\nЭтап 2: КОНФИГУРАЦИЯ МЫШЛЕНИЯ\n\nМы узнали, как вы воспринимаете мир. Теперь исследуем, как вы обрабатываете информацию.\n\n📊 Вопросов: ${result.questionsCount}\n⏱ Время: ~3-4 минуты`;
        
        this.addMessageWithButtons(text, [
            { text: "▶️ Перейти к этапу 2", callback: () => this.goToNextStage() }
        ]);
    },
    
    // ============================================
    // ЭКРАН 2: РЕЗУЛЬТАТ ЭТАПА 2
    // ============================================
    showStage2Result() {
        const level = this.thinkingLevel;
        const desc = level <= 3 
            ? "Вы хорошо видите отдельные ситуации, но не всегда замечаете общие закономерности."
            : level <= 6
            ? "Вы замечаете закономерности, но не всегда видите, к чему они приведут в будущем."
            : "Вы видите общие законы и можете предсказывать развитие ситуаций.";
        
        const group = level <= 3 ? "1-3" : level <= 6 ? "4-6" : "7-9";
        
        const feedback = {
            "СОЦИАЛЬНО-ОРИЕНТИРОВАННЫЙ": {
                "1-3": "Ваше мышление конкретно и привязано к социальным ситуациям.",
                "4-6": "Вы замечаете социальные закономерности и тренды.",
                "7-9": "Вы видите глубинные социальные механизмы и законы."
            },
            "СТАТУСНО-ОРИЕНТИРОВАННЫЙ": {
                "1-3": "Ваше мышление направлено на достижение статуса.",
                "4-6": "Вы стратегически мыслите в категориях статуса.",
                "7-9": "Вы видите иерархические закономерности."
            },
            "СМЫСЛО-ОРИЕНТИРОВАННЫЙ": {
                "1-3": "Вы ищете смыслы в отдельных событиях.",
                "4-6": "Вы находите закономерности в жизненных историях.",
                "7-9": "Вы постигаете глубинные смыслы бытия."
            },
            "ПРАКТИКО-ОРИЕНТИРОВАННЫЙ": {
                "1-3": "Ваше мышление конкретно и практично.",
                "4-6": "Вы видите практические закономерности.",
                "7-9": "Вы создаёте эффективные практические модели."
            }
        }[this.perceptionType]?.[group] || desc;
        
        const text = `✨ РЕЗУЛЬТАТ ЭТАПА 2\n\nУровень мышления: ${level}/9\n\n${feedback}\n\n▶️ ЧТО ДАЛЬШЕ?\n\nЭтап 3: КОНФИГУРАЦИЯ ПОВЕДЕНИЯ\n\nТеперь посмотрим, как вы действуете на автомате.\n\n📊 Вопросов: 8\n⏱ Время: ~3 минуты`;
        
        this.addMessageWithButtons(text, [
            { text: "▶️ Перейти к этапу 3", callback: () => this.goToNextStage() }
        ]);
    },
    
    // ============================================
    // ЭКРАН 3: РЕЗУЛЬТАТ ЭТАПА 3
    // ============================================
    showStage3Result() {
        const sbAvg = this.behavioralLevels["СБ"].length 
            ? Math.round(this.behavioralLevels["СБ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["СБ"].length) 
            : 3;
        const tfAvg = this.behavioralLevels["ТФ"].length 
            ? Math.round(this.behavioralLevels["ТФ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["ТФ"].length) 
            : 3;
        const ubAvg = this.behavioralLevels["УБ"].length 
            ? Math.round(this.behavioralLevels["УБ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["УБ"].length) 
            : 3;
        const chvAvg = this.behavioralLevels["ЧВ"].length 
            ? Math.round(this.behavioralLevels["ЧВ"].reduce((a, b) => a + b, 0) / this.behavioralLevels["ЧВ"].length) 
            : 3;
        
        const allScores = [
            ...this.behavioralLevels["СБ"],
            ...this.behavioralLevels["ТФ"],
            ...this.behavioralLevels["УБ"],
            ...this.behavioralLevels["ЧВ"]
        ];
        const finalLevel = this.calculateFinalLevel(this.thinkingLevel, allScores);
        
        const behaviorLevel = finalLevel <= 2 ? 1 : finalLevel <= 4 ? 2 : finalLevel <= 6 ? 3 : finalLevel <= 8 ? 4 : 5;
        
        const feedback = {
            1: "Ваше поведение реактивно — вы скорее отвечаете на стимулы, чем действуете осознанно.",
            2: "Вы начинаете осознавать свои автоматические реакции.",
            3: "Вы можете выбирать реакции, но не всегда.",
            4: "Вы управляете своим поведением в большинстве ситуаций.",
            5: "Поведение становится инструментом для достижения целей."
        }[behaviorLevel] || "Вы по-разному реагируете в разных ситуациях.";
        
        const text = `✨ РЕЗУЛЬТАТ ЭТАПА 3\n\nВаши поведенческие уровни:\n• Реакция на давление (СБ): ${sbAvg}/6\n• Отношение к деньгам (ТФ): ${tfAvg}/6\n• Понимание мира (УБ): ${ubAvg}/6\n• Отношения с людьми (ЧВ): ${chvAvg}/6\n\nФинальный уровень: ${finalLevel}/9\n\n${feedback}\n\n▶️ ЧТО ДАЛЬШЕ?\n\nЭтап 4: ТОЧКА РОСТА\n\nНайдем, где находится рычаг изменений.\n\n📊 Вопросов: 8\n⏱ Время: ~3 минуты`;
        
        this.addMessageWithButtons(text, [
            { text: "▶️ Перейти к этапу 4", callback: () => this.goToNextStage() }
        ]);
    },
    
    // ============================================
    // ЭКРАН 4: ПРЕДВАРИТЕЛЬНЫЙ ПРОФИЛЬ (после этапа 4)
    // ============================================
    showStage4Result() {
        const simple = this.convertToSimpleLanguage();
        const confidence = this.calculateProfileConfidence();
        const bar = "█".repeat(Math.floor(confidence * 10)) + "░".repeat(10 - Math.floor(confidence * 10));
        
        const text = `🧠 ПРЕДВАРИТЕЛЬНЫЙ ПОРТРЕТ\n\n${simple.attentionDesc}\n\n${simple.thinkingDesc}\n\n📊 ТВОИ ВЕКТОРЫ:\n• Реакция на давление: ${simple.sbDesc}\n• Отношение к деньгам: ${simple.tfDesc}\n• Понимание мира: ${simple.ubDesc}\n• Отношения с людьми: ${simple.chvDesc}\n\n🎯 Точка роста: ${simple.growthPoint}\n\n📊 Уверенность: ${bar} ${Math.floor(confidence * 100)}%\n\n👇 ЭТО ПОХОЖЕ НА ВАС?`;
        
        this.addMessageWithButtons(text, [
            { text: "✅ ДА", callback: () => this.profileConfirm() },
            { text: "❓ ЕСТЬ СОМНЕНИЯ", callback: () => this.profileDoubt() },
            { text: "🔄 НЕТ", callback: () => this.profileReject() }
        ]);
    },
    
    // ============================================
    // ЭКРАН 5: УТОЧНЕНИЯ (при сомнениях)
    // ============================================
    profileDoubt() {
        const text = `🔍 ДАВАЙ УТОЧНИМ\n\nЧто именно вам не подходит?\n(можно выбрать несколько)\n\n🎭 Про людей — я не так сильно завишу от чужого мнения\n💰 Про деньги — у меня с ними по-другому\n🔍 Про знаки — я вполне себе анализирую\n🤝 Про отношения — я знаю, чего хочу\n🛡 Про давление — я реагирую иначе\n\n👇 Выберите и нажмите ДАЛЬШЕ`;
        
        this.addMessageWithButtons(text, [
            { text: "🎭 Про людей", callback: () => this.toggleDiscrepancy("people") },
            { text: "💰 Про деньги", callback: () => this.toggleDiscrepancy("money") },
            { text: "🔍 Про знаки", callback: () => this.toggleDiscrepancy("signs") },
            { text: "🤝 Про отношения", callback: () => this.toggleDiscrepancy("relations") },
            { text: "🛡 Про давление", callback: () => this.toggleDiscrepancy("sb") },
            { text: "➡️ ДАЛЬШЕ", callback: () => this.clarifyNext() }
        ]);
    },
    
    toggleDiscrepancy(type) {
        if (this.discrepancies.includes(type)) {
            this.discrepancies = this.discrepancies.filter(d => d !== type);
        } else {
            this.discrepancies.push(type);
        }
        this.saveProgress();
    },
    
    clarifyNext() {
        if (this.discrepancies.length === 0) {
            alert("Выберите хотя бы одно расхождение!");
            return;
        }
        
        // Упрощенные уточняющие вопросы
        const questions = [
            {
                text: "Расскажите подробнее, что именно не так с описанием вашей реакции на давление?",
                options: ["Я спокойнее", "Я агрессивнее", "Я вообще не такой"]
            },
            {
                text: "А что с отношением к деньгам?",
                options: ["У меня их больше", "Мне всё равно", "Я иначе к ним отношусь"]
            }
        ];
        
        this.clarifyingQuestions = questions;
        this.clarifyingCurrent = 0;
        this.askClarifyingQuestion();
    },
    
    askClarifyingQuestion() {
        if (this.clarifyingCurrent >= this.clarifyingQuestions.length) {
            this.updateProfileWithClarifications();
            return;
        }
        
        const q = this.clarifyingQuestions[this.clarifyingCurrent];
        const text = `🔍 УТОЧНЯЮЩИЙ ВОПРОС ${this.clarifyingCurrent + 1}/${this.clarifyingQuestions.length}\n\n${q.text}`;
        
        this.addMessageWithButtons(text, q.options.map((opt, i) => ({
            text: opt,
            callback: () => {
                this.clarifyingAnswers.push({
                    question: q.text,
                    answer: opt
                });
                this.clarifyingCurrent++;
                this.askClarifyingQuestion();
            }
        })));
    },
    
    updateProfileWithClarifications() {
        this.clarificationIteration++;
        this.saveProgress();
        this.showStage4Result();
    },
    
    // ============================================
    // ЭКРАН 6: АНЕКДОТ (при нажатии НЕТ)
    // ============================================
    profileReject() {
        const anecdote = `🧠 ЧЕСТНОСТЬ - ЛУЧШАЯ ПОЛИТИКА\n\nДве подруги решили сходить на ипподром. Приходят, а там скачки, все ставки делают. Решили и они ставку сделать — вдруг повезёт? Одна другой и говорит: «Слушай, у тебя какой размер груди?». Вторая: «Второй… а у тебя?». Первая: «Третий… ну давай на пятую поставим — чтоб сумма была…».\n\nПоставили на пятую, лошадь приходит первая, они счастливые прибегают домой с деньгами и мужьям рассказывают, как было дело.\n\nНа следующий день мужики тоже решили сходить на скачки — а вдруг им повезёт? Когда решали, на какую ставить, один говорит: «Ты сколько раз за ночь свою жену можешь удовлетворить?». Другой говорит: «Ну, три…». Первый: «А я четыре… ну давай на седьмую поставим».\n\nПоставили на седьмую, первой пришла вторая.\n\nМужики переглянулись: «Не напиздили бы — выиграли…».\n\nМораль: Если врать в тесте — результат будет как у мужиков на скачках. Хотите попробовать еще раз?`;
        
        this.addMessageWithButtons(anecdote, [
            { text: "🔄 ПРОЙТИ ТЕСТ ЕЩЕ РАЗ", callback: () => this.restartTest() },
            { text: "👋 ДОСВИДУЛИ", callback: () => this.goToChat() }
        ]);
        
        this.currentStage = 0;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.perceptionScores = { EXTERNAL: 0, INTERNAL: 0, SYMBOLIC: 0, MATERIAL: 0 };
        this.perceptionType = null;
        this.thinkingScores = {};
        this.behavioralLevels = { "СБ": [], "ТФ": [], "УБ": [], "ЧВ": [] };
        this.diltsCounts = { "ENVIRONMENT": 0, "BEHAVIOR": 0, "CAPABILITIES": 0, "VALUES": 0, "IDENTITY": 0 };
        this.deepAnswers = [];
        this.saveProgress();
    },
    
    restartTest() {
        this.start();
    },
    
    goToChat() {
        this.addBotMessage('👋 До свидания!\n\nБуду рад помочь, если решите вернуться.');
        setTimeout(() => {
            if (App && App.showMainChat) {
                App.showMainChat();
            }
        }, 2000);
    },
    
    // ============================================
    // ЭКРАН 7: РЕЗУЛЬТАТ ЭТАПА 5 (краткий)
    // ============================================
    showStage5Result() {
        const deep = this.deepPatterns || { attachment: "🤗 Надежный" };
        const text = `✨ РЕЗУЛЬТАТ ЭТАПА 5\n\nТип привязанности: ${deep.attachment}\n\n✅ ТЕСТ ЗАВЕРШЕН!\n\nСейчас я сформирую ваш полный психологический портрет...`;
        this.addBotMessage(text);
        setTimeout(() => this.showFinalProfile(), 2000);
    },
    
    // ============================================
    // ЭКРАН 8: ФИНАЛЬНЫЙ ПРОФИЛЬ (после этапа 5)
    // ============================================
    showFinalProfile() {
        const profile = this.calculateFinalProfile();
        const deep = this.deepPatterns || { attachment: "🤗 Надежный" };
        
        const sbDesc = {
            1: "Под давлением замираете",
            2: "Избегаете конфликтов",
            3: "Внешне соглашаетесь",
            4: "Внешне спокойны",
            5: "Умеете защищать",
            6: "Защищаете и используете силу"
        }[profile.sbLevel] || "Информация уточняется";
        
        const tfDesc = {
            1: "Деньги как повезёт",
            2: "Ищете возможности с нуля",
            3: "Зарабатываете трудом",
            4: "Хорошо зарабатываете",
            5: "Создаёте системы дохода",
            6: "Управляете капиталом"
        }[profile.tfLevel] || "Информация уточняется";
        
        const ubDesc = {
            1: "Не думаете о сложном",
            2: "Верите в знаки",
            3: "Доверяете экспертам",
            4: "Ищете заговоры",
            5: "Анализируете факты",
            6: "Строите теории"
        }[profile.ubLevel] || "Информация уточняется";
        
        const chvDesc = {
            1: "Сильно привязываетесь",
            2: "Подстраиваетесь",
            3: "Хотите нравиться",
            4: "Умеете влиять",
            5: "Строите равные отношения",
            6: "Создаёте сообщества"
        }[profile.chvLevel] || "Информация уточняется";
        
        const text = `🧠 ВАШ ПСИХОЛОГИЧЕСКИЙ ПОРТРЕТ\n\nПрофиль: ${profile.displayName}\nТип восприятия: ${profile.perceptionType}\nУровень мышления: ${profile.thinkingLevel}/9\n\n📊 ТВОИ ВЕКТОРЫ:\n\n• Реакция на давление (СБ ${profile.sbLevel}/6): ${sbDesc}\n\n• Отношение к деньгам (ТФ ${profile.tfLevel}/6): ${tfDesc}\n\n• Понимание мира (УБ ${profile.ubLevel}/6): ${ubDesc}\n\n• Отношения с людьми (ЧВ ${profile.chvLevel}/6): ${chvDesc}\n\n🧠 Глубинный паттерн: ${deep.attachment}\n\n👇 Что дальше?`;
        
        if (App?.userId) {
            localStorage.setItem(`test_results_${App.userId}`, JSON.stringify({
                profile,
                deepPatterns: deep,
                perceptionType: this.perceptionType,
                thinkingLevel: this.thinkingLevel
            }));
        }
        
        this.addMessageWithButtons(text, [
            { text: "🧠 МЫСЛИ ПСИХОЛОГА", callback: () => this.showPsychologistThought() },
            { text: "🎯 ВЫБРАТЬ ЦЕЛЬ", callback: () => this.showGoals() },
            { text: "⚙️ ВЫБРАТЬ РЕЖИМ", callback: () => this.showModes() }
        ]);
    },
    
    // ============================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================
    
    profileConfirm() {
        this.addBotMessage("✅ Отлично! Тогда исследуем глубину...");
        setTimeout(() => this.goToNextStage(), 1500);
    },
    
    goToNextStage() {
        this.currentStage++;
        this.currentQuestionIndex = 0;
        this.sendStageIntro();
    },
    
    showPsychologistThought() {
        if (App && App.showPsychologistThought) {
            App.showPsychologistThought();
        } else {
            alert("Мысли психолога будут доступны позже");
        }
    },
    
    showGoals() {
        if (App && App.showDynamicDestinations) {
            App.showDynamicDestinations();
        } else {
            alert("Выбор целей будет доступен позже");
        }
    },
    
    showModes() {
        if (App && App.showModeSelection) {
            App.showModeSelection();
        } else {
            alert("Выбор режима будет доступен позже");
        }
    }
};

window.Test = Test;
