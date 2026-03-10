// main.js - 应用主入口

document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    initApp();
});

function initApp() {
    // 显示加载界面
    uiManager.showScreen('loading');

    // 模拟加载过程
    setTimeout(() => {
        // 检查是否有保存的游戏状态
        if (gameState.gameStarted && !gameState.gameEnded) {
            // 恢复游戏
            uiManager.loadGameState();
        } else {
            // 显示开场动画
            uiManager.showScreen('intro');
        }
    }, 2000);

    // 初始化背景音乐
    initBackgroundMusic();

    // 绑定全局事件
    bindGlobalEvents();
}

function initBackgroundMusic() {
    const audio = document.getElementById('background-music');
    if (audio) {
        // 设置音量
        audio.volume = 0.3;

        // 添加播放控制（可选）
        document.addEventListener('click', function playMusic() {
            audio.play().catch(e => {
                console.log('自动播放被阻止:', e);
            });
            document.removeEventListener('click', playMusic);
        });
    }
}

function bindGlobalEvents() {
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        // ESC键返回游戏
        if (e.key === 'Escape') {
            if (gameState.currentScreen !== 'game' && gameState.gameStarted) {
                uiManager.showScreen('game');
            }
        }

        // F11全屏
        if (e.key === 'F11') {
            e.preventDefault();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    });

    // 窗口大小改变
    window.addEventListener('resize', function() {
        // 重新计算布局
        uiManager.updateUI();
    });

    // 页面可见性变化
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面不可见时暂停计时器
            uiManager.stopTimer();
        } else {
            // 页面重新可见时恢复计时器
            if (gameState.gameStarted && !gameState.gameEnded) {
                uiManager.startTimer();
            }
        }
    });

    // 防止意外刷新
    window.addEventListener('beforeunload', function(e) {
        if (gameState.gameStarted && !gameState.gameEnded) {
            e.preventDefault();
            e.returnValue = '游戏进行中，确定要离开吗？';
        }
    });
}

// 全局错误处理
window.addEventListener('error', function(e) {
    console.error('应用错误:', e.error);
    uiManager.showError('发生错误，请刷新页面重试');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise错误:', e.reason);
    uiManager.showError('网络请求失败，请检查连接');
});

// 调试信息（仅在开发模式下）
if (CONFIG.DEBUG) {
    window.debugGameState = function() {
        console.log('当前游戏状态:', gameState);
        return gameState;
    };

    window.debugUI = function() {
        console.log('UI管理器:', uiManager);
        return uiManager;
    };

    window.debugAPI = function() {
        console.log('API客户端:', apiClient);
        return apiClient;
    };

    console.log('调试模式已启用。使用 debugGameState()、debugUI()、debugAPI() 查看内部状态。');
}

// 应用初始化完成
console.log('🧠 脑机接口谋杀案 - 前端版本已加载完成');