// 主题管理模块

// 当前主题
let currentTheme = 'retro'; // 从'pixel'改为'retro'

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
    
    // 保存选择
    localStorage.setItem('theme', theme);
}

// 应用自定义颜色
function applyCustomColor(color) {
    // 移除所有主题类
    document.body.classList.remove('dark-theme', 'silver-theme', 'wood-theme', 'green-theme', 'pixel-theme', 'retro-theme');
    
    // 应用自定义颜色
    document.body.style.backgroundColor = color;
    
    currentTheme = 'custom';
    
    // 保存选择
    localStorage.setItem('theme', 'custom');
    localStorage.setItem('customColor', color);
}

// 更新主题按钮状态
function updateThemeButtons() {
    // 移除所有按钮的active类
    document.querySelectorAll('.theme-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // 添加当前主题按钮的active类
    const currentButton = document.querySelector(`.theme-button[data-theme="${currentTheme}"]`);
    if (currentButton) {
        currentButton.classList.add('active');
    }
}

// 应用默认主题
function applyDefaultTheme() {
    // 检查是否有保存的主题
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        if (savedTheme === 'custom') {
            const customColor = localStorage.getItem('customColor');
            if (customColor) {
                applyCustomColor(customColor);
            } else {
                changeTheme('retro'); // 如果没有自定义颜色，使用复古主题
            }
        } else {
            changeTheme(savedTheme);
        }
    } else {
        // 设置默认为复古主题
        changeTheme('retro');
    }
    
    updateThemeButtons();
}

// 导出API
window.ThemesManager = {
    changeTheme,
    applyCustomColor,
    updateThemeButtons,
    applyDefaultTheme
};
