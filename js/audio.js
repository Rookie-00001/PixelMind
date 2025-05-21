// 音频管理模块

// 音频上下文
let audioContext;
let noiseNode;
let gainNode;
let audioElement = null;
let playing = false;
let customSoundType = 'white';

// 音量淡入淡出时间（毫秒）
const fadeTime = 800;

// 切换噪音播放状态
function toggleNoise() {
    const playPauseButton = document.getElementById('play-pause');
    const statusIndicator = playPauseButton.querySelector('.status-indicator');
    
    if (!playing) {
        startNoise();
        playPauseButton.innerHTML = '<span class="status-indicator status-on"></span>暂停';
        playing = true;
        
        // 如果设置了计时时间，启动计时器
        if (TimerManager.getFocusMinutes() > 0 || TimerManager.getFocusSeconds() > 0) {
            TimerManager.startFocusTimer();
        }
    } else {
        fadeOutAudio().then(() => {
            stopNoise();
            playPauseButton.innerHTML = '<span class="status-indicator status-off"></span>播放';
            playing = false;
            
            // 暂停计时器
            TimerManager.pauseFocusTimer();
        });
    }
}

// 音频淡出
function fadeOutAudio() {
    return new Promise(resolve => {
        if (!gainNode) {
            resolve();
            return;
        }
        
        const startVolume = gainNode.gain.value;
        const volumeStep = startVolume / (fadeTime / 50);
        let currentVolume = startVolume;
        
        const fadeInterval = setInterval(() => {
            currentVolume -= volumeStep;
            
            if (currentVolume <= 0) {
                clearInterval(fadeInterval);
                gainNode.gain.value = 0;
                resolve();
            } else {
                gainNode.gain.value = currentVolume;
            }
        }, 50);
    });
}

// 音频淡入
function fadeInAudio(targetVolume) {
    if (!gainNode) return;
    
    gainNode.gain.value = 0;
    
    const volumeStep = targetVolume / (fadeTime / 50);
    let currentVolume = 0;
    
    const fadeInterval = setInterval(() => {
        currentVolume += volumeStep;
        
        if (currentVolume >= targetVolume) {
            clearInterval(fadeInterval);
            gainNode.gain.value = targetVolume;
        } else {
            gainNode.gain.value = currentVolume;
        }
    }, 50);
}

// 开始播放噪音
function startNoise() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
    }
    
    // 停止之前的音频
    if (noiseNode) {
        noiseNode.disconnect();
    }
    
    if (audioElement) {
        audioElement.pause();
        audioElement = null;
    }
    
    // 设置初始音量为0（用于淡入）
    gainNode.gain.value = 0;
    
    // 根据当前场景选择合适的声音
    if (ScenesManager.getCurrentScene().startsWith('user-')) {
        // 使用用户选择的声音类型
        playSoundByType(customSoundType);
    } else {
        // 根据场景选择适当的声音
        switch(ScenesManager.getCurrentScene()) {
            case 'scene-sao':
                playSoundByType('rain');
                break;
            case 'scene-dilao':
                playSoundByType('fire');
                break;
            case 'scene-nature':
                playSoundByType('nature');
                break;
            case 'scene-night':
            case 'scene-night2': // 夜晚2使用相同音效
                playSoundByType('night');
                break;
            case 'scene-forest':
            case 'scene-jingling': // 精灵森林使用森林音效
                playSoundByType('forest');
                break;
            case 'scene-city':
            case 'scene-city2': // 初始城市2使用相同音效
                playSoundByType('city');
                break;
            case 'scene-book':
                playSoundByType('rain');
                break;
            case 'scene-jiuguan':
            case 'scene-jiuguan2': // 酒馆2使用相同音效
            case 'scene-jiuguan3': // 酒馆3使用相同音效
                playSoundByType('coffee');
                break;
            case 'scene-BOSS':
            case 'scene-BOSS2': // BOSS战2使用相同音效
                playSoundByType('boss');
                break;
            default:
                playSoundByType('nosiy');
        }
    }
    
    // 设置音量并淡入
    const volumeSlider = document.getElementById('volume');
    const targetVolume = volumeSlider.value / 100;
    fadeInAudio(targetVolume);
}

// 根据类型播放对应的音效
function playSoundByType(type) {
    audioElement = new Audio();
    
    switch(type) {
        case 'nosiy':
            audioElement.src = 'sounds/nosiy.mp3';
            connectAudioElement();
            break;
        case 'rain':
            audioElement.src = 'sounds/rain.mp3';
            connectAudioElement();
            break;
        case 'forest':
            audioElement.src = 'sounds/forest.mp3';
            connectAudioElement();
            break;
        case 'coffee':
            audioElement.src = 'sounds/coffee.mp3';
            connectAudioElement();
            break;
        case 'city':
            audioElement.src = 'sounds/city.mp3';
            connectAudioElement();
            break;
        case 'fire':
            audioElement.src = 'sounds/fire.mp3';
            connectAudioElement();
            break;
        case 'waves':
            audioElement.src = 'sounds/swim.mp3';
            connectAudioElement();
            break;
        case 'nature':
            audioElement.src = 'sounds/nature.mp3';
            connectAudioElement();
            break;
        case 'keyboard':
            audioElement.src = 'sounds/keyboard.mp3';
            connectAudioElement();
            break;
        case 'wind':
            audioElement.src = 'sounds/wind.mp3';
            connectAudioElement();
            break;
        case 'night':
            audioElement.src = 'sounds/night.mp3';
            connectAudioElement();
            break;
        case 'boss':
            audioElement.src = 'sounds/boss.mp3';
            connectAudioElement();
            break;
        default:
            createWhiteNoise();
    }
}

// 连接音频元素到音频上下文
function connectAudioElement() {
    audioElement.loop = true;
    audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
    });
    
    try {
        // 连接到Web Audio API进行音量控制
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(gainNode);
        
        // 保存引用以便停止
        noiseNode = {
            disconnect: function() {
                if (audioElement) {
                    audioElement.pause();
                    source.disconnect();
                }
            }
        };
    } catch (error) {
        console.error('Error connecting audio element:', error);
    }
}

// 停止播放噪音
function stopNoise() {
    if (noiseNode) {
        noiseNode.disconnect();
        noiseNode = null;
    }
    
    if (audioElement) {
        audioElement.pause();
        audioElement = null;
    }
}

// 创建白噪音
function createWhiteNoise() {
    try {
        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.start(0);
        
        whiteNoise.connect(gainNode);
        
        noiseNode = {
            disconnect: function() {
                whiteNoise.stop();
                whiteNoise.disconnect();
            }
        };
    } catch (error) {
        console.error('Error creating white noise:', error);
    }
}

// 更新音量
function updateVolume(volume) {
    if (gainNode) {
        gainNode.gain.value = volume;
    }
}

// 设置自定义声音类型
function setCustomSoundType(type) {
    customSoundType = type;
}

// 获取播放状态
function isPlaying() {
    return playing;
}

// 播放计时器结束提示音
function playTimerEndSound() {
    const audio = new Audio();
    audio.src = 'sounds/timer-end.mp3'; // 提示音文件路径
    audio.play().catch(error => {
        console.error('Error playing timer end sound:', error);
    });
}

// 导出API
window.AudioManager = {
    toggleNoise,
    fadeOutAudio,
    fadeInAudio,
    startNoise,
    stopNoise,
    updateVolume,
    setCustomSoundType,
    isPlaying,
    playTimerEndSound
};
