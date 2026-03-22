// ============================================
// АНИМИРОВАННЫЙ АВАТАР - ПРОФЕССИОНАЛЬНАЯ ВЕРСИЯ 2.0
// Полноценная анимация лица, эмоции, аура, частицы, слежение
// ============================================

class AnimatedAvatar {
    constructor(userId, userName, profileData = null) {
        // Основные данные
        this.userId = userId;
        this.userName = userName || 'Друг';
        this.profileData = profileData;
        
        // Canvas
        this.canvas = null;
        this.ctx = null;
        this.width = 120;
        this.height = 120;
        
        // Состояние аватара
        this.currentMood = 'neutral';
        this.isAnimating = false;
        this.animationFrame = null;
        this.time = 0;
        this.deltaTime = 0;
        this.lastTimestamp = 0;
        
        // Анатомия лица (золотое сечение)
        this.anatomy = {
            // Основные пропорции
            faceRadius: 52,
            faceCenterY: 60,
            
            // Глаза
            eyeDistance: 32,
            eyeSize: 11,
            pupilSize: 5,
            irisSize: 7,
            eyeHeight: 9,
            eyePositionY: 44,
            
            // Брови
            eyebrowDistance: 34,
            eyebrowHeight: 32,
            eyebrowThickness: 3,
            eyebrowAngle: 0,
            
            // Нос
            noseWidth: 8,
            noseHeight: 12,
            nosePositionY: 52,
            
            // Рот
            mouthWidth: 28,
            mouthHeight: 6,
            mouthPositionY: 72,
            
            // Скулы
            cheekboneWidth: 24,
            cheekboneHeight: 58,
            
            // Подбородок
            chinWidth: 20,
            chinHeight: 78
        };
        
        // Анимационные параметры
        this.animation = {
            blink: { progress: 0, speed: 0, target: 0 },
            breath: { value: 0, speed: 0.03, amplitude: 1.5 },
            eyebrow: { left: 0, right: 0, target: { left: 0, right: 0 } },
            mouth: { curve: 0, target: 0, width: 0, targetWidth: 0 },
            eyes: { leftX: 0, leftY: 0, rightX: 0, rightY: 0, target: { x: 0, y: 0 } },
            glow: { intensity: 0.3, target: 0.3 },
            pulse: { value: 0, speed: 0.02 },
            particles: []
        };
        
        // Частицы (аура, эмоции)
        this.particleSystems = {
            aura: [],
            sparkles: [],
            mood: []
        };
        
        // Цветовая схема (профессиональная палитра)
        this.colors = {
            // Основные цвета
            background: '#0f172a',
            skin: {
                light: '#f5e6d3',
                medium: '#e6d5b8',
                dark: '#c9b28b',
                shadow: '#b89a6e',
                highlight: '#fff5e8'
            },
            // Акцентные цвета (зависят от профиля)
            primary: '#4a9eff',
            secondary: '#2c3e66',
            accent: '#7c4dff',
            glow: '#4a9eff',
            
            // Детали
            eyeWhite: '#ffffff',
            eyeIris: '#2c3e50',
            eyePupil: '#1a2634',
            eyeHighlight: '#ffffff',
            
            eyebrow: '#2c3e50',
            lips: '#d4756e',
            blush: '#ffaaa5',
            
            // Эффекты
            shadow: 'rgba(0,0,0,0.3)',
            highlight: 'rgba(255,255,255,0.3)',
            glowColor: 'rgba(74,158,255,0.3)'
        };
        
        // Эффекты
        this.effects = {
            mouseTracking: { x: 0, y: 0, active: false },
            particles: [],
            trails: []
        };
        
        this.init();
    }
    
    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    
    async init() {
        console.log('🎨 Инициализация анимированного аватара v2.0...');
        
        this._updateColorsFromProfile();
        this._initParticleSystems();
        
        // Создаём canvas с высоким разрешением
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.className = 'animated-avatar';
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.canvas.style.borderRadius = '50%';
        this.canvas.style.cursor = 'pointer';
        this.canvas.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2), 0 0 0 2px rgba(74,158,255,0.1)';
        this.canvas.style.transition = 'box-shadow 0.3s ease';
        
        this.ctx = this.canvas.getContext('2d');
        
        // Запускаем анимации
        this._startAnimation();
        this._startBlinkCycle();
        this._startMoodCycle();
        
        // Добавляем обработчики
        this.canvas.addEventListener('click', (e) => this._onClick(e));
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this._onMouseLeave());
        
        console.log('✅ Анимированный аватар создан');
        return this.canvas;
    }
    
    // ============================================
    // ЦВЕТОВАЯ СХЕМА НА ОСНОВЕ ПРОФИЛЯ
    // ============================================
    
    _updateColorsFromProfile() {
        const scores = this.profileData?.profile_data || {};
        
        // Определяем доминирующий вектор
        const vectors = [
            { name: 'sb', value: scores.sb_level || 4, color: '#5c6bc0', accent: '#7986cb' },
            { name: 'tf', value: scores.tf_level || 4, color: '#ffb74d', accent: '#ffcc80' },
            { name: 'ub', value: scores.ub_level || 4, color: '#4db6ac', accent: '#80cbc4' },
            { name: 'chv', value: scores.chv_level || 4, color: '#f06292', accent: '#f48fb1' }
        ];
        
        const dominant = vectors.reduce((a, b) => a.value > b.value ? a : b, vectors[0]);
        
        this.colors.primary = dominant.color;
        this.colors.accent = dominant.accent;
        this.colors.glow = dominant.color;
        
        // Интенсивность цвета зависит от уровня
        const intensity = Math.min(1, Math.max(0.4, dominant.value / 6));
        this.colors.glowColor = `${dominant.color}${Math.floor(intensity * 60).toString(16).padStart(2, '0')}`;
    }
    
    // ============================================
    // ЧАСТИЦЫ
    // ============================================
    
    _initParticleSystems() {
        // Аура (постоянные частицы вокруг аватара)
        for (let i = 0; i < 48; i++) {
            const angle = (i / 48) * Math.PI * 2;
            const radius = 58 + Math.random() * 12;
            this.particleSystems.aura.push({
                angle: angle,
                radius: radius,
                speed: 0.3 + Math.random() * 0.5,
                size: 1 + Math.random() * 2.5,
                opacity: 0.1 + Math.random() * 0.25,
                color: this.colors.primary,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        // Блестки (случайные искорки)
        for (let i = 0; i < 24; i++) {
            this.particleSystems.sparkles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3 - 0.2,
                size: 1 + Math.random() * 2,
                life: Math.random() * 1,
                maxLife: 1 + Math.random(),
                color: Math.random() > 0.7 ? this.colors.accent : this.colors.primary
            });
        }
    }
    
    _updateParticles() {
        // Обновляем ауру
        for (const p of this.particleSystems.aura) {
            p.angle += p.speed * 0.01;
            p.radius += Math.sin(Date.now() * 0.001 * p.speed) * 0.1;
        }
        
        // Обновляем блестки
        for (let i = 0; i < this.particleSystems.sparkles.length; i++) {
            const p = this.particleSystems.sparkles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.008;
            p.opacity = p.life / p.maxLife;
            
            if (p.life <= 0 || p.y < -20 || p.y > this.height + 20 || p.x < -20 || p.x > this.width + 20) {
                // Возрождаем частицу
                this.particleSystems.sparkles[i] = {
                    x: Math.random() * this.width,
                    y: this.height + 10,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: -0.5 - Math.random() * 0.8,
                    size: 1 + Math.random() * 2.5,
                    life: 0.8 + Math.random() * 0.5,
                    maxLife: 1.5,
                    color: Math.random() > 0.7 ? this.colors.accent : this.colors.primary
                };
            }
        }
    }
    
    // ============================================
    // АНИМАЦИОННЫЕ ЦИКЛЫ
    // ============================================
    
    _startAnimation() {
        const animate = (timestamp) => {
            if (!this.ctx) return;
            
            this.deltaTime = Math.min(0.033, (timestamp - this.lastTimestamp) / 1000);
            this.lastTimestamp = timestamp;
            this.time = timestamp / 1000;
            
            this._updateAnimations();
            this._updateParticles();
            this._draw();
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.lastTimestamp = performance.now();
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    _startBlinkCycle() {
        // Случайные интервалы моргания (2-5 секунд)
        const scheduleBlink = () => {
            const delay = 2000 + Math.random() * 3000;
            setTimeout(() => {
                this._blink();
                scheduleBlink();
            }, delay);
        };
        scheduleBlink();
    }
    
    _startMoodCycle() {
        // Периодическая смена микро-выражений
        setInterval(() => {
            if (this.currentMood === 'neutral') {
                const subtleMoods = ['happy', 'thoughtful', 'calm'];
                const randomMood = subtleMoods[Math.floor(Math.random() * subtleMoods.length)];
                this._setSubtleMood(randomMood);
                setTimeout(() => {
                    if (this.currentMood === randomMood) {
                        this._setSubtleMood('neutral');
                    }
                }, 1500);
            }
        }, 8000);
    }
    
    _updateAnimations() {
        // Дыхание
        this.animation.breath.value += this.animation.breath.speed;
        
        // Пульсация
        this.animation.pulse.value += this.animation.pulse.speed;
        
        // Плавное движение бровей к цели
        this.animation.eyebrow.left += (this.animation.eyebrow.target.left - this.animation.eyebrow.left) * 0.15;
        this.animation.eyebrow.right += (this.animation.eyebrow.target.right - this.animation.eyebrow.right) * 0.15;
        
        // Плавное движение рта
        this.animation.mouth.curve += (this.animation.mouth.target - this.animation.mouth.curve) * 0.12;
        this.animation.mouth.width += (this.animation.mouth.targetWidth - this.animation.mouth.width) * 0.12;
        
        // Плавное движение зрачков
        this.animation.eyes.leftX += (this.animation.eyes.target.x - this.animation.eyes.leftX) * 0.1;
        this.animation.eyes.leftY += (this.animation.eyes.target.y - this.animation.eyes.leftY) * 0.1;
        this.animation.eyes.rightX += (this.animation.eyes.target.x - this.animation.eyes.rightX) * 0.1;
        this.animation.eyes.rightY += (this.animation.eyes.target.y - this.animation.eyes.rightY) * 0.1;
        
        // Плавное изменение свечения
        this.animation.glow.intensity += (this.animation.glow.target - this.animation.glow.intensity) * 0.08;
        
        // Моргание
        this.animation.blink.progress = Math.max(0, this.animation.blink.progress - this.animation.blink.speed);
    }
    
    _blink() {
        this.animation.blink.progress = 1;
        this.animation.blink.speed = 0.08;
    }
    
    _setSubtleMood(mood) {
        const previousMood = this.currentMood;
        this.currentMood = mood;
        
        switch(mood) {
            case 'happy':
                this.animation.mouth.target = 8;
                this.animation.mouth.targetWidth = 2;
                this.animation.eyebrow.target = { left: 2, right: 2 };
                break;
            case 'thoughtful':
                this.animation.mouth.target = 0;
                this.animation.mouth.targetWidth = 0;
                this.animation.eyebrow.target = { left: -2, right: -2 };
                break;
            case 'calm':
                this.animation.mouth.target = 2;
                this.animation.mouth.targetWidth = 0;
                this.animation.eyebrow.target = { left: 0, right: 0 };
                break;
            default:
                this.animation.mouth.target = 0;
                this.animation.mouth.targetWidth = 0;
                this.animation.eyebrow.target = { left: 0, right: 0 };
        }
        
        // Небольшая пульсация при смене настроения
        this.animation.glow.target = 0.6;
        setTimeout(() => { this.animation.glow.target = 0.3; }, 500);
        
        // Добавляем искорки
        this._addSparkles(8);
    }
    
    _addSparkles(count) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 30;
            
            this.particleSystems.sparkles.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5 - 1,
                size: 2 + Math.random() * 3,
                life: 0.6,
                maxLife: 0.8,
                color: this.colors.accent
            });
        }
    }
    
    // ============================================
    // ОТРИСОВКА
    // ============================================
    
    _draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        
        const centerX = this.width / 2;
        const centerY = this.height / 2 + Math.sin(this.animation.breath.value) * this.animation.breath.amplitude;
        
        // 1. Аура (глубокий слой)
        this._drawAura(ctx, centerX, centerY);
        
        // 2. Тени и объём
        this._drawShadows(ctx, centerX, centerY);
        
        // 3. Основа лица
        this._drawFaceBase(ctx, centerX, centerY);
        
        // 4. Скулы и контур
        this._drawCheekbones(ctx, centerX, centerY);
        
        // 5. Глаза
        this._drawEyes(ctx, centerX, centerY);
        
        // 6. Брови
        this._drawEyebrows(ctx, centerX, centerY);
        
        // 7. Нос
        this._drawNose(ctx, centerX, centerY);
        
        // 8. Рот
        this._drawMouth(ctx, centerX, centerY);
        
        // 9. Румянец
        this._drawBlush(ctx, centerX, centerY);
        
        // 10. Блестки и частицы
        this._drawParticles(ctx);
        
        // 11. Свечение
        this._drawGlow(ctx, centerX, centerY);
        
        // 12. Блик на глазах
        this._drawEyeHighlights(ctx, centerX, centerY);
    }
    
    _drawAura(ctx, cx, cy) {
        ctx.save();
        ctx.shadowBlur = 0;
        
        for (const p of this.particleSystems.aura) {
            const angle = p.angle + this.time * p.speed;
            const radius = p.radius + Math.sin(this.time * 2 + p.phase) * 1.5;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${Math.floor(p.opacity * 40 + 20 * this.animation.glow.intensity).toString(16).padStart(2, '0')}`;
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    _drawShadows(ctx, cx, cy) {
        const radius = this.anatomy.faceRadius;
        
        // Основная тень
        ctx.beginPath();
        ctx.ellipse(cx + 3, cy + 4, radius, radius * 1.05, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.shadow;
        ctx.fill();
        
        // Тень под скулами
        ctx.beginPath();
        ctx.ellipse(cx - 12, cy + 15, 12, 6, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(cx + 12, cy + 15, 12, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    _drawFaceBase(ctx, cx, cy) {
        const radius = this.anatomy.faceRadius;
        
        // Основной градиент лица
        const gradient = ctx.createRadialGradient(
            cx - 8, cy - 8, 15,
            cx, cy, radius
        );
        gradient.addColorStop(0, this.colors.skin.light);
        gradient.addColorStop(0.5, this.colors.skin.medium);
        gradient.addColorStop(1, this.colors.skin.dark);
        
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 1.08, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Контур лица
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 1.08, 0, 0, Math.PI * 2);
        ctx.strokeStyle = this.colors.skin.shadow;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Световой блик на лбу
        ctx.beginPath();
        ctx.ellipse(cx - 5, cy - 18, 12, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fill();
    }
    
    _drawCheekbones(ctx, cx, cy) {
        const cheekY = cy + this.anatomy.cheekboneHeight;
        const cheekX = this.anatomy.cheekboneWidth;
        
        ctx.beginPath();
        ctx.ellipse(cx - cheekX, cheekY, 14, 6, -0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,240,220,0.3)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(cx + cheekX, cheekY, 14, 6, 0.1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    _drawEyes(ctx, cx, cy) {
        const eyeY = cy + this.anatomy.eyePositionY - this.animation.breath.value * 0.5;
        const leftX = cx - this.anatomy.eyeDistance;
        const rightX = cx + this.anatomy.eyeDistance;
        const blinkFactor = Math.max(0, Math.min(1, this.animation.blink.progress));
        const eyeHeight = this.anatomy.eyeHeight * (1 - blinkFactor * 0.85);
        
        // Левое око
        this._drawEye(ctx, leftX, eyeY, eyeHeight);
        // Правое око
        this._drawEye(ctx, rightX, eyeY, eyeHeight);
    }
    
    _drawEye(ctx, x, y, eyeHeight) {
        // Белок
        ctx.beginPath();
        ctx.ellipse(x, y, this.anatomy.eyeSize, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.eyeWhite;
        ctx.fill();
        
        // Радужка
        ctx.beginPath();
        ctx.ellipse(
            x + this.animation.eyes.leftX * 1.5,
            y + this.animation.eyes.leftY * 1.2,
            this.anatomy.irisSize,
            this.anatomy.irisSize * 0.9,
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = this.colors.eyeIris;
        ctx.fill();
        
        // Зрачок
        ctx.beginPath();
        ctx.ellipse(
            x + this.animation.eyes.leftX * 2,
            y + this.animation.eyes.leftY * 1.5,
            this.anatomy.pupilSize,
            this.anatomy.pupilSize * 0.9,
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = this.colors.eyePupil;
        ctx.fill();
        
        // Контур века
        ctx.beginPath();
        ctx.ellipse(x, y, this.anatomy.eyeSize, eyeHeight, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    _drawEyeHighlights(ctx, cx, cy) {
        const eyeY = cy + this.anatomy.eyePositionY;
        const leftX = cx - this.anatomy.eyeDistance;
        const rightX = cx + this.anatomy.eyeDistance;
        
        const highlightSize = 2;
        
        ctx.beginPath();
        ctx.arc(leftX - 2 + this.animation.eyes.leftX, eyeY - 2 + this.animation.eyes.leftY, highlightSize, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.eyeHighlight;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightX - 2 + this.animation.eyes.rightX, eyeY - 2 + this.animation.eyes.rightY, highlightSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(leftX - 1 + this.animation.eyes.leftX, eyeY - 1 + this.animation.eyes.leftY, highlightSize * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightX - 1 + this.animation.eyes.rightX, eyeY - 1 + this.animation.eyes.rightY, highlightSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    _drawEyebrows(ctx, cx, cy) {
        const browY = cy + this.anatomy.eyebrowHeight - this.animation.breath.value * 0.3;
        const leftX = cx - this.anatomy.eyebrowDistance;
        const rightX = cx + this.anatomy.eyebrowDistance;
        
        ctx.beginPath();
        ctx.moveTo(leftX - 8, browY + this.animation.eyebrow.left);
        ctx.quadraticCurveTo(leftX - 2, browY - 1 + this.animation.eyebrow.left, leftX + 6, browY + this.animation.eyebrow.left);
        ctx.lineWidth = this.anatomy.eyebrowThickness;
        ctx.strokeStyle = this.colors.eyebrow;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(rightX + 8, browY + this.animation.eyebrow.right);
        ctx.quadraticCurveTo(rightX + 2, browY - 1 + this.animation.eyebrow.right, rightX - 6, browY + this.animation.eyebrow.right);
        ctx.stroke();
    }
    
    _drawNose(ctx, cx, cy) {
        const noseY = cy + this.anatomy.nosePositionY;
        
        ctx.beginPath();
        ctx.moveTo(cx, noseY - 4);
        ctx.lineTo(cx, noseY + 4);
        ctx.lineTo(cx - 3, noseY + 6);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = this.colors.skin.shadow;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.ellipse(cx, noseY + 2, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.skin.shadow;
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(cx, noseY + 1, 1.5, 1, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.skin.medium;
        ctx.fill();
    }
    
    _drawMouth(ctx, cx, cy) {
        const mouthY = cy + this.anatomy.mouthPositionY;
        const mouthX = cx;
        const curve = this.animation.mouth.curve;
        const width = this.anatomy.mouthWidth + this.animation.mouth.width;
        
        ctx.beginPath();
        
        if (curve > 3) {
            // Улыбка
            ctx.arc(mouthX, mouthY, width * 0.5, 0.1, Math.PI - 0.1, false);
        } else if (curve < -2) {
            // Грусть
            ctx.arc(mouthX, mouthY + 4, width * 0.5, Math.PI + 0.1, Math.PI * 2 - 0.1, true);
        } else if (Math.abs(curve) < 1) {
            // Прямая линия (нейтрально)
            ctx.moveTo(mouthX - width * 0.5, mouthY);
            ctx.lineTo(mouthX + width * 0.5, mouthY);
        } else {
            // Лёгкая улыбка
            ctx.moveTo(mouthX - width * 0.5, mouthY);
            ctx.quadraticCurveTo(mouthX, mouthY + 2, mouthX + width * 0.5, mouthY);
        }
        
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = this.colors.lips;
        ctx.stroke();
        
        // Тень под губой
        ctx.beginPath();
        ctx.moveTo(mouthX - width * 0.3, mouthY + 2);
        ctx.quadraticCurveTo(mouthX, mouthY + 4, mouthX + width * 0.3, mouthY + 2);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fill();
    }
    
    _drawBlush(ctx, cx, cy) {
        const blushY = cy + this.anatomy.cheekboneHeight;
        const intensity = this.currentMood === 'happy' ? 0.4 : 0.2;
        
        ctx.beginPath();
        ctx.ellipse(cx - 24, blushY - 2, 12, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 170, 165, ${intensity * (0.5 + this.animation.pulse.value * 0.2)})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(cx + 24, blushY - 2, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    _drawParticles(ctx) {
        for (const p of this.particleSystems.sparkles) {
            if (p.life <= 0) continue;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${Math.floor(p.life * 80).toString(16).padStart(2, '0')}`;
            ctx.fill();
        }
    }
    
    _drawGlow(ctx, cx, cy) {
        const radius = this.anatomy.faceRadius + 5;
        const intensity = this.animation.glow.intensity;
        
        ctx.save();
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 1.05, 0, 0, Math.PI * 2);
        ctx.fillStyle = `${this.colors.glowColor}${Math.floor(intensity * 40).toString(16).padStart(2, '0')}`;
        ctx.fill();
        
        ctx.restore();
    }
    
    // ============================================
    // ВЗАИМОДЕЙСТВИЕ
    // ============================================
    
    setMood(mood) {
        const validMoods = ['neutral', 'happy', 'sad', 'thoughtful', 'energetic', 'calm'];
        if (!validMoods.includes(mood)) return;
        
        this.currentMood = mood;
        
        switch(mood) {
            case 'happy':
                this.animation.mouth.target = 10;
                this.animation.mouth.targetWidth = 3;
                this.animation.eyebrow.target = { left: 3, right: 3 };
                this._addSparkles(12);
                break;
            case 'sad':
                this.animation.mouth.target = -8;
                this.animation.mouth.targetWidth = -2;
                this.animation.eyebrow.target = { left: -4, right: -4 };
                break;
            case 'thoughtful':
                this.animation.mouth.target = 0;
                this.animation.mouth.targetWidth = -2;
                this.animation.eyebrow.target = { left: -3, right: -3 };
                this.animation.eyes.target = { x: -0.5, y: 0 };
                setTimeout(() => { this.animation.eyes.target = { x: 0, y: 0 }; }, 2000);
                break;
            case 'energetic':
                this.animation.mouth.target = 12;
                this.animation.mouth.targetWidth = 4;
                this.animation.eyebrow.target = { left: 5, right: 5 };
                this._addSparkles(20);
                this.animation.glow.target = 0.8;
                setTimeout(() => { this.animation.glow.target = 0.3; }, 800);
                break;
            case 'calm':
                this.animation.mouth.target = 2;
                this.animation.mouth.targetWidth = 0;
                this.animation.eyebrow.target = { left: 0, right: 0 };
                break;
            default:
                this.animation.mouth.target = 0;
                this.animation.mouth.targetWidth = 0;
                this.animation.eyebrow.target = { left: 0, right: 0 };
        }
        
        // Анимация пульсации
        this.animation.glow.target = 0.6;
        setTimeout(() => {
            if (this.currentMood !== 'energetic') {
                this.animation.glow.target = 0.3;
            }
        }, 500);
        
        if (this.onMoodChange) this.onMoodChange(mood);
    }
    
    _onClick(e) {
        this.animation.glow.target = 0.9;
        setTimeout(() => { this.animation.glow.target = 0.3; }, 400);
        
        const moods = ['happy', 'thoughtful', 'calm', 'energetic'];
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        this.setMood(randomMood);
        
        setTimeout(() => this.setMood('neutral'), 2000);
        
        if (this.onAvatarClick) this.onAvatarClick();
    }
    
    _onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.width;
        const y = (e.clientY - rect.top) / this.height;
        
        // Нормализация от -1 до 1
        this.animation.eyes.target.x = (x - 0.5) * 1.2;
        this.animation.eyes.target.y = (y - 0.5) * 0.8;
    }
    
    _onMouseLeave() {
        this.animation.eyes.target = { x: 0, y: 0 };
    }
    
    // ============================================
    // ПУБЛИЧНЫЕ МЕТОДЫ
    // ============================================
    
    updateFromProfile() {
        fetch(`/api/get-profile?user_id=${this.userId}`)
            .then(r => r.json())
            .then(data => {
                if (data?.profile_data) {
                    this.profileData = data;
                    this._updateColorsFromProfile();
                    this._initParticleSystems();
                }
            })
            .catch(console.error);
    }
    
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        // Переинициализируем частицы под новый размер
        this._initParticleSystems();
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        console.log('🗑️ Анимированный аватар уничтожен');
    }
    
    // ============================================
    // КОЛБЭКИ
    // ============================================
    
    set onAvatarClick(callback) {
        this._onAvatarClick = callback;
    }
    
    set onMoodChange(callback) {
        this._onMoodChange = callback;
    }
}

window.AnimatedAvatar = AnimatedAvatar;
console.log('✅ Анимированный аватар загружен (профессиональная версия 2.0)');
