// voice.js - Голосовой ввод
const Voice = {
    recognition: null,
    isRecording: false,
    onResultCallback: null,
    
    init() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.lang = 'ru-RU';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.showStatus('🎤 Слушаю...');
            };
            
            this.recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                this.showStatus(`📝 Вы сказали: ${text}`);
                if (this.onResultCallback) this.onResultCallback(text);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Ошибка распознавания:', event.error);
                this.showStatus('❌ Ошибка распознавания');
                this.isRecording = false;
            };
            
            this.recognition.onend = () => {
                this.isRecording = false;
                this.hideStatus();
            };
            
            console.log('🎤 Web Speech API инициализирован');
            return true;
        } else {
            console.warn('⚠️ Web Speech API не поддерживается');
            return false;
        }
    },
    
    start(onResult) {
        this.onResultCallback = onResult;
        if (this.recognition && !this.isRecording) {
            try {
                this.recognition.start();
            } catch (e) {
                console.error('Ошибка запуска:', e);
                this.showStatus('❌ Попробуйте еще раз');
                setTimeout(() => this.hideStatus(), 2000);
            }
        } else if (!this.recognition) {
            UI.showToast('Ваш браузер не поддерживает голосовой ввод', 'error');
        }
    },
    
    showStatus(message) {
        let statusDiv = document.getElementById('voiceStatus');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'voiceStatus';
            statusDiv.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--max-blue);
                color: white;
                padding: 8px 16px;
                border-radius: 30px;
                font-size: 14px;
                z-index: 1000;
                white-space: nowrap;
            `;
            document.body.appendChild(statusDiv);
        }
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
    },
    
    hideStatus() {
        const statusDiv = document.getElementById('voiceStatus');
        if (statusDiv) statusDiv.style.display = 'none';
    }
};

window.Voice = Voice;
