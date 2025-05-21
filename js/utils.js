// utils.js - 实用工具函数

// 检测WebP支持
function checkWebPSupport() {
    return new Promise(resolve => {
        const webpImage = new Image();
        webpImage.onload = function() { resolve(true); };
        webpImage.onerror = function() { resolve(false); };
        webpImage.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    });
}

// 根据设备和支持情况选择最佳图片格式
async function getOptimalImageSource(basePath, fileName) {
    const isWebPSupported = await checkWebPSupport();
    const isLowBandwidth = navigator.connection && 
                           (navigator.connection.saveData || 
                            navigator.connection.effectiveType.includes('2g') || 
                            navigator.connection.downlink < 1);
    
    let extension, quality;
    
    if (isLowBandwidth) {
        // 低带宽设备优先使用低质量图片
        quality = 'low';
        extension = isWebPSupported ? 'webp' : 'jpg';
    } else {
        // 正常带宽使用高质量图片
        quality = 'high';
        extension = isWebPSupported ? 'webp' : 'png';
    }
    
    return `${basePath}/${quality}/${fileName}.${extension}`;
}

// 创建响应式图片HTML
function createResponsiveImageHTML(basePath, fileName, altText) {
    return `
    <picture>
        <source type="image/webp" 
                srcset="${basePath}/low/${fileName}.webp 480w, 
                        ${basePath}/medium/${fileName}.webp 960w, 
                        ${basePath}/high/${fileName}.webp 1920w"
                sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw">
        <source type="image/jpeg" 
                srcset="${basePath}/low/${fileName}.jpg 480w, 
                        ${basePath}/medium/${fileName}.jpg 960w, 
                        ${basePath}/high/${fileName}.jpg 1920w"
                sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw">
        <img src="${basePath}/medium/${fileName}.jpg" alt="${altText}" class="scene" loading="lazy">
    </picture>
    `;
}

// 预加载关键资源
function preloadCriticalResources() {
    // 预加载常用字体
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.href = 'fonts/zpix.ttf';
    fontPreload.as = 'font';
    fontPreload.type = 'font/ttf';
    fontPreload.crossOrigin = 'anonymous';
    document.head.appendChild(fontPreload);
    
    // 预加载首个场景
    const firstScenePreload = document.createElement('link');
    firstScenePreload.rel = 'preload';
    firstScenePreload.href = 'images/videos/sao.webm';
    firstScenePreload.as = 'video';
    document.head.appendChild(firstScenePreload);
    
    // 预加载图标
    const iconPreload = document.createElement('link');
    iconPreload.rel = 'preload';
    iconPreload.href = 'icons/logo.svg';
    iconPreload.as = 'image';
    document.head.appendChild(iconPreload);
}

// 检测网络状态并相应调整
function setupNetworkMonitoring() {
    if ('connection' in navigator) {
        // 初始检查
        checkNetworkQuality(navigator.connection);
        
        // 监听变化
        navigator.connection.addEventListener('change', function() {
            checkNetworkQuality(this);
        });
    }
}

// 根据网络质量调整资源加载策略
function checkNetworkQuality(connection) {
    const isLowBandwidth = connection.saveData || 
                          connection.effectiveType.includes('2g') || 
                          connection.downlink < 1;
    
    if (isLowBandwidth) {
        // 低带宽模式
        document.body.classList.add('low-bandwidth');
        
        // 暂停所有非活动视频的加载
        document.querySelectorAll('video:not(.active)').forEach(video => {
            video.preload = 'none';
            video.removeAttribute('autoplay');
            
            // 暂停已开始加载的视频
            if (video.readyState > 0) {
                video.pause();
                video.src = '';
                video.load();
            }
        });
        
        console.log('低带宽模式已启用');
    } else {
        // 恢复正常加载
        document.body.classList.remove('low-bandwidth');
    }
}

// 从文件名中去除扩展名
function getFileNameWithoutExtension(fileName) {
    return fileName.replace(/\.[^/.]+$/, "");
}

// 防抖函数 - 用于减少事件处理频率
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// 节流函数 - 用于限制事件触发频率
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// 预加载关键资源并设置网络监控
document.addEventListener('DOMContentLoaded', function() {
    setupNetworkMonitoring();
});

// 在页面加载前预加载关键资源
preloadCriticalResources();

// 将函数导出到全局
window.Utils = {
    checkWebPSupport,
    getOptimalImageSource,
    createResponsiveImageHTML,
    preloadCriticalResources,
    setupNetworkMonitoring,
    checkNetworkQuality,
    getFileNameWithoutExtension,
    debounce,
    throttle
};
