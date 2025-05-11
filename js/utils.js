// 工具函数

// 检查浏览器支持
function checkBrowserSupport() {
    // 检查Web Audio API支持
    const hasWebAudio = !!(window.AudioContext || window.webkitAudioContext);
    
    // 检查全屏API支持
    const hasFullscreenSupport = !!(
        document.documentElement.requestFullscreen ||
        document.documentElement.mozRequestFullScreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.msRequestFullscreen
    );
    
    return {
        webAudio: hasWebAudio,
        fullscreen: hasFullscreenSupport
    };
}

// 获取不带后缀的文件名
function getFileNameWithoutExtension(fileName) {
    return fileName.split('.').slice(0, -1).join('.');
}

// 简单的UUID生成器（用于ID）
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}