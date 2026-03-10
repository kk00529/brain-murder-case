// game-logic.js - 游戏逻辑处理

class GameLogic {
    constructor() {
        this.init();
    }

    init() {
        // 初始化逻辑
    }

    // 验证指认结果
    validateAccusation(suspectId, evidenceIds, statement) {
        // 这里实现指认验证逻辑
        // 暂时返回成功
        return {
            isCorrect: true,
            feedback: "指认正确！"
        };
    }

    // 计算最终分数
    calculateFinalScore() {
        return gameState.calculateScore();
    }

    // 生成游戏报告
    generateGameReport() {
        const stats = gameState.gameStats;
        return {
            score: stats.score,
            cluesCollected: stats.cluesCollected,
            cluesVerified: stats.cluesVerified,
            npcsInterviewed: stats.npcsInterviewed,
            timeUsed: stats.timeUsed,
            achievements: stats.achievements,
            result: gameState.gameResult
        };
    }

    // 检查游戏结束条件
    checkGameEnd() {
        // 时间结束
        if (gameState.getRemainingTime() === 0) {
            return 'timeout';
        }

        // 所有线索验证完成
        if (gameState.getVerifiedClues().length >= 10) {
            return 'completed';
        }

        return null;
    }

    // 获取游戏提示
    getGameTips() {
        const tips = [
            "💡 多与不同嫌疑人对话，收集更多线索",
            "🔍 注意NPC回复中的关键词，可能包含重要信息",
            "⚡ 时间有限，优先验证关键线索",
            "🎯 使用故事推断功能整合线索信息"
        ];

        // 根据游戏进度返回不同提示
        const progress = gameState.getProgress();
        if (progress < 20) {
            return tips[0];
        } else if (progress < 60) {
            return tips[1];
        } else if (gameState.getRemainingTime() < 600) { // 10分钟
            return tips[2];
        } else {
            return tips[3];
        }
    }
}

// 创建全局游戏逻辑实例
const gameLogic = new GameLogic();

// 导出
window.GameLogic = GameLogic;
window.gameLogic = gameLogic;