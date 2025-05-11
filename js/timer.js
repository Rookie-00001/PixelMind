// 计时器模块

// 专注计时器变量
let focusMinutes = 25;
let focusSeconds = 0;
let focusInterval;
let focusTimerRunning = false;

// 更新专注计时器显示
function updateFocusTimerDisplay() {
    const timerDisplay = document.querySelector('.timer-display');
    timerDisplay.textContent = `${String(focusMinutes).padStart(2, '0')}:${String(focusSeconds).padStart(2, '0')}`;
}

// 开始专注计时器
function startFocusTimer() {
    // 如果设置为0，不启动计时器
    if (focusMinutes === 0 && focusSeconds === 0) {
        return;
    }
    
    // 如果已经在运行，先清除
    if (focusTimerRunning) {
        clearInterval(focusInterval);
    }
    
    focusTimerRunning = true;
    
    focusInterval = setInterval(function() {
        if (focusSeconds > 0) {
            focusSeconds--;
        } else {
            if (focusMinutes > 0) {
                focusMinutes--;
                focusSeconds = 59;
            } else {
                // 计时结束
                clearInterval(focusInterval);
                focusTimerRunning = false;
                
                // 停止播放
                if (AudioManager.isPlaying()) {
                    AudioManager.toggleNoise();
                }
                
                // 播放提示音
                AudioManager.playTimerEndSound();
                
                // 重置计时器
                focusMinutes = parseInt(document.getElementById('timer-range').value);
                focusSeconds = 0;
            }
        }
        
        updateFocusTimerDisplay();
    }, 1000);
}

// 暂停专注计时器
function pauseFocusTimer() {
    clearInterval(focusInterval);
    focusTimerRunning = false;
}

// 重置专注计时器
function resetFocusTimer() {
    // 暂停计时器
    pauseFocusTimer();
    
    // 重置为滑块设定的时间
    focusMinutes = parseInt(document.getElementById('timer-range').value);
    focusSeconds = 0;
    
    // 更新显示
    updateFocusTimerDisplay();
}

// 设置计时时间
function setFocusTime(minutes) {
    focusMinutes = minutes;
    focusSeconds = 0;
    updateFocusTimerDisplay();
}

// 获取计时分钟数
function getFocusMinutes() {
    return focusMinutes;
}

// 获取计时秒数
function getFocusSeconds() {
    return focusSeconds;
}

// 导出API
window.TimerManager = {
    updateFocusTimerDisplay,
    startFocusTimer,
    pauseFocusTimer,
    resetFocusTimer,
    setFocusTime,
    getFocusMinutes,
    getFocusSeconds
};