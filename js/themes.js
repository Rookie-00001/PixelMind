// 主题管理模块

// 当前主题
let currentTheme = 'pixel';

// 更改主题
function changeTheme(theme) {
    // 移除所有主题类
    document.body.classList.remove('dark-theme', 'silver-theme', 'wood-theme', 'green-theme', 'pixel-theme', 'retro-theme');
    document.body.style.backgroundColor = '';
    
    // 添加选定的主题类
    if (theme !== 'white') {
        document.body.classList.add(`${theme}-theme`);
    }
    
    currentTheme = theme;
    
    // 设置颜色选择器
    const themeColors = {
        'white': '#f8f9fa',
        'dark': '#1a1a1a',
        'silver': '#e0e0e0',
        'wood': '#d0b894',
        'green': '#e0f2e9',
        'pixel': '#2c2137',
        'retro': '#f8e8c7'
    };
    
    if (themeColors[theme]) {
        document.getElementById('color-picker').value = themeColors[theme];
    }
}

// 更新主题按钮状态
function updateThemeButtons() {
    document.querySelectorAll('.theme-button').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-theme') === currentTheme) {
            button.classList.add('active');
        }
    });
}

// 应用默认主题
function applyDefaultTheme() {
    // 设置默认为像素主题
    changeTheme('pixel');
    updateThemeButtons();
}

// 应用自定义颜色
function applyCustomColor(color) {
    document.body.style.backgroundColor = color;
    document.body.classList.remove('dark-theme', 'silver-theme', 'wood-theme', 'green-theme', 'pixel-theme', 'retro-theme');
    currentTheme = 'custom';
    updateThemeButtons();
}

// 获取当前主题
function getCurrentTheme() {
    return currentTheme;
}

// 导出API
window.ThemesManager = {
    changeTheme,
    updateThemeButtons,
    applyDefaultTheme,
    applyCustomColor,
    getCurrentTheme
};