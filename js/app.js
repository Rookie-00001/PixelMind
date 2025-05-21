// 应用主逻辑

document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    initializeApp();
});

function initializeApp() {
    // 初始化主题
    ThemesManager.applyDefaultTheme();
    
    // 初始化计时器显示
    TimerManager.updateFocusTimerDisplay();
    
    // 初始化字体设置 - 默认开启像素字体
    initFontSettings();
    
    // 设置事件处理
    setupEventListeners();
}

// 初始化字体设置
function initFontSettings() {
    const pixelFontToggle = document.getElementById('pixel-font-toggle');
    // 默认使用像素字体
    const storedPreference = localStorage.getItem('pixelFont');
    
    if (storedPreference === 'disabled') {
        // 只有在明确被禁用的情况下才使用默认字体
        document.body.classList.add('default-font');
        pixelFontToggle.checked = false;
    } else {
        // 默认或存储的偏好是启用像素字体
        document.body.classList.remove('default-font');
        pixelFontToggle.checked = true;
        localStorage.setItem('pixelFont', 'enabled');
    }
}

function setupEventListeners() {
    // 导航栏按钮事件
    document.getElementById('home-btn').addEventListener('click', function() {
        window.location.href = window.location.pathname;
    });
    
    document.getElementById('background-btn').addEventListener('click', function() {
        document.getElementById('background-modal').style.display = 'flex';
    });
    
    document.getElementById('theme-btn').addEventListener('click', function() {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
        } else {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('silver-theme', 'wood-theme', 'green-theme', 'pixel-theme', 'retro-theme');
            ThemesManager.changeTheme('dark');
            ThemesManager.updateThemeButtons();
        }
    });
    
    document.getElementById('github-btn').addEventListener('click', function() {
        window.open('https://github.com/Rookie-00001/PixelMind/', '_blank');
    });
    
    // 全屏按钮
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    fullscreenBtn.addEventListener('click', ScenesManager.toggleFullscreen);
    
    // 退出全屏按钮
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    exitFullscreenBtn.addEventListener('click', function() {
        ScenesManager.toggleFullscreen();
        
        // 确保在移动设备上正确退出全屏
        if (window.innerWidth <= 767) {
            document.body.classList.remove('fullscreen');
            ScenesManager.exitMobileFullscreen();
        }
    });
    
    // 播放/暂停按钮
    const playPauseButton = document.getElementById('play-pause');
    playPauseButton.addEventListener('click', AudioManager.toggleNoise);
    
    // 音量滑块
    const volumeSlider = document.getElementById('volume');
    volumeSlider.addEventListener('input', function() {
        AudioManager.updateVolume(this.value / 100);
    });

    // 计时器重置按钮
    document.getElementById('timer-reset').addEventListener('click', TimerManager.resetFocusTimer);
    
    // 场景选择按钮
    const sceneButton = document.getElementById('scene-button');
    const scenesDropdown = document.querySelector('.scenes-dropdown');
    
    sceneButton.addEventListener('click', function(event) {
        event.stopPropagation();
        
        // 定位下拉菜单
        const buttonRect = sceneButton.getBoundingClientRect();
        scenesDropdown.style.position = 'absolute';
        scenesDropdown.style.top = `${buttonRect.bottom}px`;
        scenesDropdown.style.left = `${buttonRect.left}px`;
        scenesDropdown.style.width = `${buttonRect.width}px`;
        
        // 显示/隐藏下拉菜单
        scenesDropdown.classList.toggle('show');
        
        // 隐藏声音下拉菜单
        document.querySelector('.sound-dropdown').classList.remove('show');
    });
    
    // 声音选择按钮
    const soundButton = document.getElementById('sound-button');
    const soundDropdown = document.querySelector('.sound-dropdown');
    
    soundButton.addEventListener('click', function(event) {
        event.stopPropagation();
        
        // 定位下拉菜单
        const buttonRect = soundButton.getBoundingClientRect();
        soundDropdown.style.position = 'absolute';
        soundDropdown.style.top = `${buttonRect.bottom}px`;
        soundDropdown.style.left = `${buttonRect.left}px`;
        soundDropdown.style.width = `${buttonRect.width}px`;
        
        // 显示/隐藏下拉菜单
        soundDropdown.classList.toggle('show');
        
        // 隐藏场景下拉菜单
        scenesDropdown.classList.remove('show');
    });
    
    // 点击页面其他地方关闭下拉菜单
    window.addEventListener('click', function(event) {
        scenesDropdown.classList.remove('show');
        soundDropdown.classList.remove('show');
        
        // 如果点击的不是颜色选择器模态窗口内部元素，则关闭它
        const colorPickerModal = document.getElementById('color-picker-modal');
        if (colorPickerModal.style.display === 'flex' && 
            !event.target.closest('.color-picker-content') && 
            !event.target.classList.contains('theme-custom')) {
            colorPickerModal.style.display = 'none';
        }
    });
    
    // 场景选项点击事件
    const sceneOptions = document.querySelectorAll('.scene-option');
    sceneOptions.forEach(option => {
        option.addEventListener('click', function(event) {
            event.stopPropagation();
            
            const scene = this.getAttribute('data-scene');
            ScenesManager.changeScene(scene);
            sceneButton.querySelector('.current-scene').textContent = this.textContent;
            scenesDropdown.classList.remove('show');
            
            // 如果是自定义图片或视频，显示声音选择器
            const soundSelector = document.querySelector('.sound-selector');
            if (scene.startsWith('user-')) {
                soundSelector.classList.add('show');
            } else {
                soundSelector.classList.remove('show');
            }
        });
    });
    
    // 声音选项点击事件
    const soundOptions = document.querySelectorAll('.sound-option');
    soundOptions.forEach(option => {
        option.addEventListener('click', function(event) {
            event.stopPropagation();
            
            const sound = this.getAttribute('data-sound');
            AudioManager.setCustomSoundType(sound);
            soundButton.querySelector('.current-sound').textContent = this.textContent;
            soundDropdown.classList.remove('show');
            
            // 如果正在播放，更新声音
            if (AudioManager.isPlaying() && ScenesManager.getCurrentScene().startsWith('user-')) {
                AudioManager.fadeOutAudio().then(() => {
                    AudioManager.stopNoise();
                    AudioManager.startNoise();
                });
            }
        });
    });
    
    // 设置按钮
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeButtons = document.querySelectorAll('.close-button');
    
    settingsButton.addEventListener('click', function() {
        settingsModal.style.display = 'flex';
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // 点击模态窗口外部时关闭
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // 动画速度
    const animationSpeedSlider = document.getElementById('animation-speed');
    const speedDisplay = document.getElementById('speed-display');
    
    // 初始化速度显示
    speedDisplay.textContent = '1.00x';
    
    animationSpeedSlider.addEventListener('input', function() {
        // 将滑块值（1-5）转换为播放速度（0.5-1.5）
        // 当值为3时，速度为1.0（原速）
        let speed;
        const value = parseInt(this.value);
        
        if (value === 3) {
            speed = 1.0; // 中间值为原速
        } else if (value < 3) {
            // 1 -> 0.5, 2 -> 0.75
            speed = 0.5 + (value - 1) * 0.25;
        } else {
            // 4 -> 1.25, 5 -> 1.5
            speed = 1.0 + (value - 3) * 0.25;
        }
        
        // 应用新的播放速度
        ScenesManager.setAnimationSpeed(speed);
        
        // 更新显示
        speedDisplay.textContent = speed.toFixed(2) + 'x';
    });
    
    // 字体切换 - 使用点击事件
    const fontToggleContainer = document.querySelector('.toggle-switch');
    const pixelFontToggle = document.getElementById('pixel-font-toggle');
    
    fontToggleContainer.addEventListener('click', function() {
        // 切换复选框状态
        pixelFontToggle.checked = !pixelFontToggle.checked;
        
        // 根据新状态应用字体
        if (pixelFontToggle.checked) {
            // 启用像素字体
            document.body.classList.remove('default-font');
            localStorage.setItem('pixelFont', 'enabled');
        } else {
            // 禁用像素字体
            document.body.classList.add('default-font');
            localStorage.setItem('pixelFont', 'disabled');
        }
    });
    
    // 图片上传
    const uploadImage = document.getElementById('upload-image');
    uploadImage.addEventListener('change', function(event) {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // 创建唯一ID
                const fileId = 'image-' + Date.now();
                const fileName = file.name;
                // 去除文件后缀名，用于显示
                const displayName = Utils.getFileNameWithoutExtension(fileName);
                
                // 创建用户图片容器
                const userImageContainer = document.createElement('div');
                userImageContainer.className = 'user-image-container';
                userImageContainer.id = 'user-' + fileId;
                
                // 创建用户图片元素
                const userImage = document.createElement('img');
                userImage.className = 'user-image';
                userImage.src = e.target.result;
                userImage.alt = displayName;
                
                // 添加到容器中
                userImageContainer.appendChild(userImage);
                document.querySelector('.scene-container').appendChild(userImageContainer);
                
                // 添加到场景选项
                ScenesManager.addSceneOption(fileId, displayName, 'image');
                
                // 添加到用户文件列表
                ScenesManager.addUserFile(fileId, fileName, 'image', e.target.result);
                
                // 自动切换到用户图片场景
                ScenesManager.changeScene('user-' + fileId);
                document.getElementById('scene-button').querySelector('.current-scene').textContent = displayName;
                
                // 显示声音选择器
                document.querySelector('.sound-selector').classList.add('show');
                
                // 关闭设置模态窗口
                settingsModal.style.display = 'none';
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // 视频上传
    const uploadVideo = document.getElementById('upload-video');
    uploadVideo.addEventListener('change', function(event) {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // 创建唯一ID
                const fileId = 'video-' + Date.now();
                const fileName = file.name;
                // 去除文件后缀名，用于显示
                const displayName = Utils.getFileNameWithoutExtension(fileName);
                
                // 使用新的处理函数创建视频容器
                const userVideoContainer = ScenesManager.handleUserVideoUpload(
                    file, 
                    fileId, 
                    fileName, 
                    displayName, 
                    e.target.result
                );
                
                // 添加到场景选项
                ScenesManager.addSceneOption(fileId, displayName, 'video');
                
                // 添加到用户文件列表
                ScenesManager.addUserFile(fileId, fileName, 'video', e.target.result);
                
                // 自动切换到用户视频场景
                ScenesManager.changeScene('user-' + fileId);
                document.getElementById('scene-button').querySelector('.current-scene').textContent = displayName;
                
                // 显示声音选择器
                document.querySelector('.sound-selector').classList.add('show');
                
                // 关闭设置模态窗口
                settingsModal.style.display = 'none';
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // 主题按钮
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            
            const theme = this.getAttribute('data-theme');
            
            if (theme === 'custom') {
                // 显示颜色选择器模态窗口
                const colorPickerModal = document.getElementById('color-picker-modal');
                colorPickerModal.style.display = 'flex';
            } else {
                ThemesManager.changeTheme(theme);
                ThemesManager.updateThemeButtons();
            }
        });
    });
    
    // 颜色选择器按钮事件
    document.getElementById('apply-color').addEventListener('click', function() {
        const colorPicker = document.getElementById('color-picker');
        ThemesManager.applyCustomColor(colorPicker.value);
        document.getElementById('color-picker-modal').style.display = 'none';
    });
    
    // 比例选择器
    const aspectRatioOptions = document.querySelectorAll('.aspect-ratio-option');
    aspectRatioOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除所有选项的活动状态
            aspectRatioOptions.forEach(opt => opt.classList.remove('active'));
            // 添加当前选项的活动状态
            this.classList.add('active');
            
            // 更新场景比例
            ScenesManager.setAspectRatio(this.getAttribute('data-ratio'));
        });
    });
    
    // 专注计时器滑块
    const timerRange = document.getElementById('timer-range');
    timerRange.addEventListener('input', function() {
        TimerManager.setFocusTime(parseInt(this.value));
    });
    
    // 使用Pointer Events API以提高滑块性能
    timerRange.addEventListener('pointerdown', function(e) {
        // 记录初始位置
        const startX = e.clientX;
        const startValue = parseInt(this.value);
        const min = parseInt(this.min);
        const max = parseInt(this.max);
        const width = this.offsetWidth;
        
        const onPointerMove = function(e) {
            // 计算移动距离并转换为值的变化
            const dx = e.clientX - startX;
            const newValue = Math.max(min, Math.min(max, startValue + Math.round(dx * (max - min) / width)));
            
            // 更新滑块值
            timerRange.value = newValue;
            TimerManager.setFocusTime(newValue);
        };
        
        const onPointerUp = function() {
            // 移除事件监听器
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };
        
        // 添加移动和释放事件监听器
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    });
    
    // 检测设备方向变化
    window.matchMedia("(orientation: portrait)").addEventListener("change", function(e) {
        // 如果正在全屏模式下，更新方向
        if (document.body.classList.contains('fullscreen') && window.innerWidth <= 767) {
            ScenesManager.updateMobileFullscreen();
        }
    });
    
    // 处理屏幕尺寸变化 - 使用节流函数避免过多调用
    window.addEventListener('resize', Utils.throttle(function() {
        // 针对全屏模式的调整
        if (document.body.classList.contains('fullscreen') && window.innerWidth <= 767) {
            ScenesManager.updateMobileFullscreen();
        }
    }, 100));
}
