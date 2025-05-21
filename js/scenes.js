// 场景管理模块

// 当前场景
let currentScene = 'scene-sao';
let aspectRatio = '16:10';
let isFullscreen = false;
let animationSpeed = 1.0; // 默认为1.0倍速

// 用户上传的文件
let userFiles = {
    images: [],
    videos: []
};

// 初始化视频场景的平滑循环
function initVideoScenes() {
    const videoScenes = document.querySelectorAll('video.scene');
    
    videoScenes.forEach(video => {
        // 设置初始播放速度
        video.playbackRate = animationSpeed;
        
        // 在视频接近结束时触发过渡效果
        video.addEventListener('timeupdate', function() {
            // 当视频接近结束时(剩余0.5秒)，开始淡出效果
            if (this.duration - this.currentTime < 0.5 && this.duration > 0) {
                // 开始应用淡出效果
                this.style.opacity = '0';
                
                // 淡出后重置视频并淡入
                setTimeout(() => {
                    this.currentTime = 0;
                    this.style.opacity = '1';
                }, 400);
            }
        });
        
        // 处理视频加载错误
        video.addEventListener('error', function() {
            console.error('视频加载失败:', this.src);
            // 如果当前场景是这个视频，切换到备用场景
            if (this.id === currentScene) {
                changeScene('scene-forest'); // 切换到静态图片场景作为备用
                document.getElementById('scene-button').querySelector('.current-scene').textContent = '森林探险';
            }
        });
    });
    
    // 为用户上传的视频容器添加相同的处理
    document.querySelectorAll('.user-video-container video').forEach(video => {
        video.playbackRate = animationSpeed;
        
        video.addEventListener('timeupdate', function() {
            if (this.duration - this.currentTime < 0.5 && this.duration > 0) {
                this.style.opacity = '0';
                
                setTimeout(() => {
                    this.currentTime = 0;
                    this.style.opacity = '1';
                }, 400);
            }
        });
    });
}

// 添加设置动画速度的函数
function setAnimationSpeed(speed) {
    animationSpeed = speed;
    updateVideoPlaybackSpeed();
}

// 更新所有视频的播放速度
function updateVideoPlaybackSpeed() {
    // 更新所有场景视频
    document.querySelectorAll('video.scene').forEach(video => {
        video.playbackRate = animationSpeed;
    });
    
    // 更新用户上传的视频
    document.querySelectorAll('.user-video-container video').forEach(video => {
        video.playbackRate = animationSpeed;
    });
}

// 切换场景
function changeScene(scene) {
    // 淡出当前场景
    const currentSceneElem = document.querySelector('.scene.active');
    const userContainers = document.querySelectorAll('.user-image-container, .user-video-container');
    
    // 淡出当前活动的场景
    if (currentSceneElem) {
        currentSceneElem.style.opacity = '0';
    }
    
    userContainers.forEach(container => {
        if (container.classList.contains('active')) {
            container.style.opacity = '0';
        }
    });
    
    // 延迟切换场景，等待淡出完成
    setTimeout(() => {
        // 隐藏所有场景
        document.querySelectorAll('.scene').forEach(sceneElem => {
            sceneElem.classList.remove('active');
            
            // 如果是视频元素，暂停播放
            if (sceneElem.tagName.toLowerCase() === 'video') {
                sceneElem.pause();
                // 重置过渡样式
                sceneElem.style.transition = 'opacity 0.8s ease';
            }
        });
        
        userContainers.forEach(container => {
            container.classList.remove('active');
            
            // 对于视频容器，也暂停其中的视频
            const video = container.querySelector('video');
            if (video) {
                video.pause();
                // 重置过渡样式
                video.style.transition = 'opacity 0.8s ease';
            }
        });
        
        // 显示选中的场景
        if (scene.startsWith('user-')) {
            const userContainer = document.getElementById(scene);
            if (userContainer) {
                userContainer.classList.add('active');
                
                // 如果是视频容器，预加载并准备播放
                const video = userContainer.querySelector('video');
                if (video) {
                    // 确保视频已加载
                    if (video.readyState >= 3) { // HAVE_FUTURE_DATA或更高
                        prepareVideoForPlaying(video);
                    } else {
                        // 如果视频尚未加载，添加加载事件监听器
                        video.addEventListener('canplay', function onCanPlay() {
                            prepareVideoForPlaying(video);
                            video.removeEventListener('canplay', onCanPlay);
                        });
                        
                        // 开始加载视频
                        video.load();
                    }
                }
                
                setTimeout(() => {
                    userContainer.style.opacity = '1';
                }, 50);
            }
        } else {
            const newSceneElem = document.getElementById(scene);
            if (newSceneElem) {
                newSceneElem.classList.add('active');
                
                // 如果是视频元素，预加载并准备播放
                if (newSceneElem.tagName.toLowerCase() === 'video') {
                    // 确保视频已加载
                    if (newSceneElem.readyState >= 3) { // HAVE_FUTURE_DATA或更高
                        prepareVideoForPlaying(newSceneElem);
                    } else {
                        // 如果视频尚未加载，添加加载事件监听器
                        newSceneElem.addEventListener('canplay', function onCanPlay() {
                            prepareVideoForPlaying(newSceneElem);
                            newSceneElem.removeEventListener('canplay', onCanPlay);
                        });
                        
                        // 开始加载视频
                        newSceneElem.load();
                    }
                }
                
                setTimeout(() => {
                    newSceneElem.style.opacity = '1';
                }, 50);
            }
        }
        
        // 更新当前场景
        currentScene = scene;
        
        // 如果正在播放音频，切换到新场景的音频
        if (AudioManager.isPlaying()) {
            AudioManager.fadeOutAudio().then(() => {
                AudioManager.stopNoise();
                AudioManager.startNoise();
            });
        }
    }, 400); // 等待淡出动画完成
}

// 准备视频播放的辅助函数
function prepareVideoForPlaying(videoElement) {
    // 从头开始播放
    videoElement.currentTime = 0;
    
    // 确保视频设置正确
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playbackRate = animationSpeed; // 应用当前的播放速度
    
    // 播放视频
    const playPromise = videoElement.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.error('视频播放失败:', error);
            
            // 如果自动播放被阻止，添加点击事件以允许用户交互后播放
            document.addEventListener('click', function enableAutoplay() {
                videoElement.play().then(() => {
                    document.removeEventListener('click', enableAutoplay);
                }).catch(err => console.error('用户交互后播放仍失败:', err));
            });
        });
    }
}

// 切换全屏模式
function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    
    // 获取场景容器
    const sceneContainer = document.querySelector('.scene-container');
    
    if (isFullscreen) {
        document.body.classList.add('fullscreen');
        
        // 尝试使用浏览器原生全屏API
        if (sceneContainer.requestFullscreen) {
            sceneContainer.requestFullscreen();
        } else if (sceneContainer.mozRequestFullScreen) { /* Firefox */
            sceneContainer.mozRequestFullScreen();
        } else if (sceneContainer.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            sceneContainer.webkitRequestFullscreen();
        } else if (sceneContainer.msRequestFullscreen) { /* IE/Edge */
            sceneContainer.msRequestFullscreen();
        }
        
        // 添加全屏改变事件监听器
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
        document.addEventListener('MSFullscreenChange', onFullscreenChange);
    } else {
        document.body.classList.remove('fullscreen');
        
        // 退出浏览器原生全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    }
}

// 处理全屏变化事件
function onFullscreenChange() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        
        // 如果原生全屏被退出，同时更新我们的UI状态
        isFullscreen = false;
        document.body.classList.remove('fullscreen');
        
        // 移除事件监听器
        document.removeEventListener('fullscreenchange', onFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
        document.removeEventListener('mozfullscreenchange', onFullscreenChange);
        document.removeEventListener('MSFullscreenChange', onFullscreenChange);
    }
}

// 更新场景比例
function updateSceneRatio() {
    const sceneContainer = document.querySelector('.scene-container');
    
    // 如果在全屏模式，不更改比例
    if (isFullscreen) return;
    
    // 移除当前类
    sceneContainer.classList.remove('square');
    
    // 根据比例设置容器样式
    switch(aspectRatio) {
        case '16:9':
            sceneContainer.style.aspectRatio = '16/9';
            break;
        case '4:3':
            sceneContainer.style.aspectRatio = '4/3';
            break;
        case '1:1':
            sceneContainer.classList.add('square');
            sceneContainer.style.aspectRatio = '1/1';
            break;
        default:
            sceneContainer.style.aspectRatio = '16/10';
    }
}

// 添加场景选项
function addSceneOption(id, name, type) {
    const scenesDropdown = document.querySelector('.scenes-dropdown');
    
    // 创建选项元素
    const sceneOption = document.createElement('div');
    sceneOption.className = 'scene-option';
    sceneOption.setAttribute('data-scene', 'user-' + id);
    sceneOption.textContent = name;
    
    // 添加点击事件
    sceneOption.addEventListener('click', function(event) {
        event.stopPropagation();
        
        const scene = this.getAttribute('data-scene');
        changeScene(scene);
        document.getElementById('scene-button').querySelector('.current-scene').textContent = this.textContent;
        document.querySelector('.scenes-dropdown').classList.remove('show');
        
        // 显示声音选择器
        document.querySelector('.sound-selector').classList.add('show');
    });
    
    // 添加到下拉菜单
    scenesDropdown.appendChild(sceneOption);
}

// 处理上传的视频文件
function handleUserVideoUpload(file, fileId, fileName, displayName, videoSrc) {
    // 创建视频容器
    const userVideoContainer = document.createElement('div');
    userVideoContainer.className = 'user-video-container';
    userVideoContainer.id = 'user-' + fileId;
    
    // 创建视频元素
    const videoElement = document.createElement('video');
    videoElement.className = 'media-element';
    videoElement.src = videoSrc;
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playbackRate = animationSpeed;
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.objectFit = 'cover';
    
    // 添加平滑循环处理
    videoElement.addEventListener('timeupdate', function() {
        if (this.duration - this.currentTime < 0.5 && this.duration > 0) {
            this.style.opacity = '0';
            
            setTimeout(() => {
                this.currentTime = 0;
                this.style.opacity = '1';
            }, 400);
        }
    });
    
    // 添加到容器中
    userVideoContainer.appendChild(videoElement);
    document.querySelector('.scene-container').appendChild(userVideoContainer);
    
    return userVideoContainer;
}

// 添加用户文件到列表
function addUserFile(id, name, type, src) {
    // 添加到用户文件数组
    const fileObj = { id, name, type, src };
    
    if (type === 'image') {
        userFiles.images.push(fileObj);
    } else {
        userFiles.videos.push(fileObj);
    }
    
    // 更新UI
    updateUserFilesList();
}

// 更新用户文件列表UI
function updateUserFilesList() {
    const filesList = document.getElementById('user-files-list');
    const noFilesMessage = document.getElementById('no-files-message');
    
    // 清空列表
    filesList.innerHTML = '';
    
    // 合并所有文件
    const allFiles = [...userFiles.images, ...userFiles.videos];
    
    if (allFiles.length === 0) {
        filesList.appendChild(noFilesMessage);
        return;
    }
    
    // 为每个文件创建列表项
    allFiles.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'user-file-item';
        
        const fileName = document.createElement('div');
        fileName.className = 'user-file-name';
        fileName.textContent = `${file.type === 'image' ? '图片' : '视频'}: ${file.name}`;
        
        const fileActions = document.createElement('div');
        fileActions.className = 'user-file-actions';
        
        const selectBtn = document.createElement('button');
        selectBtn.className = 'user-file-btn select';
        selectBtn.textContent = '选择';
        selectBtn.addEventListener('click', () => {
            changeScene('user-' + file.id);
            // 使用去掉后缀名的文件名显示
            const displayName = getFileNameWithoutExtension(file.name);
            document.getElementById('scene-button').querySelector('.current-scene').textContent = displayName;
            document.querySelector('.sound-selector').classList.add('show');
            document.getElementById('settings-modal').style.display = 'none';
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'user-file-btn delete';
        deleteBtn.textContent = '删除';
        deleteBtn.addEventListener('click', () => {
            deleteUserFile(file.id, file.type);
        });
        
        fileActions.appendChild(selectBtn);
        fileActions.appendChild(deleteBtn);
        
        fileItem.appendChild(fileName);
        fileItem.appendChild(fileActions);
        
        filesList.appendChild(fileItem);
    });
}

// 删除用户文件
function deleteUserFile(id, type) {
    // 从数组中删除
    if (type === 'image') {
        userFiles.images = userFiles.images.filter(file => file.id !== id);
    } else {
        userFiles.videos = userFiles.videos.filter(file => file.id !== id);
    }
    
    // 从场景选项中删除
    const sceneOption = document.querySelector(`.scene-option[data-scene="user-${id}"]`);
    if (sceneOption) {
        sceneOption.remove();
    }
    
    // 从DOM中删除容器
    const container = document.getElementById('user-' + id);
    if (container) {
        container.remove();
    }
    
    // 如果当前显示的是被删除的场景，切换到默认场景
    if (currentScene === 'user-' + id) {
        changeScene('scene-sao');
        document.getElementById('scene-button').querySelector('.current-scene').textContent = '刀剑神域';
        document.querySelector('.sound-selector').classList.remove('show');
    }
    
    // 更新UI
    updateUserFilesList();
}

// 设置场景比例
function setAspectRatio(ratio) {
    aspectRatio = ratio;
    updateSceneRatio();
}

// 获取当前场景
function getCurrentScene() {
    return currentScene;
}

// 初始化场景管理器
function initSceneManager() {
    // 初始化视频场景平滑循环
    initVideoScenes();
}

// 导出API
window.ScenesManager = {
    changeScene,
    toggleFullscreen,
    updateSceneRatio,
    addSceneOption,
    addUserFile,
    updateUserFilesList,
    deleteUserFile,
    setAspectRatio,
    getCurrentScene,
    initSceneManager,
    handleUserVideoUpload,
    setAnimationSpeed
};

// 当文档加载完成后初始化场景管理器
document.addEventListener('DOMContentLoaded', function() {
    initSceneManager();
});
