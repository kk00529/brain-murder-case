// game-state.js - 游戏状态管理

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        // 基础状态
        this.gameStarted = false;
        this.gameEnded = false;
        this.startTime = null;
        this.endTime = null;

        // 页面状态
        this.currentScreen = 'loading';
        this.selectedCharacter = null;

        // 聊天历史
        this.chatHistories = {};
        Object.keys(CHARACTERS).forEach(npcId => {
            this.chatHistories[npcId] = [];
        });

        // 线索状态
        this.clueStates = {};
        Object.keys(CLUE_DATABASE).forEach(clueId => {
            this.clueStates[clueId] = 'locked'; // locked, unlocked, verified
        });

        // 收集的线索
        this.collectedClues = [];

        // 访问过的NPC
        this.visitedNpcs = new Set();

        // 成就状态
        this.achievements = {};
        Object.keys(ACHIEVEMENTS).forEach(achievementId => {
            this.achievements[achievementId] = false;
        });

        // 分数
        this.score = 0;

        // 教程状态
        this.tutorialStep = 0;
        this.tutorialCompleted = false;

        // 故事推断状态
        this.generatedStory = null;
        this.storyGenerationLoading = false;

        // 指认状态
        this.selectedSuspect = null;
        this.selectedEvidence = [];
        this.finalStatement = '';

        // 游戏结果
        this.gameResult = null; // 'success' or 'failure'
        this.gameStats = null;
    }

    // 本地存储相关方法
    save() {
        const state = {
            gameStarted: this.gameStarted,
            gameEnded: this.gameEnded,
            startTime: this.startTime,
            endTime: this.endTime,
            currentScreen: this.currentScreen,
            selectedCharacter: this.selectedCharacter,
            chatHistories: this.chatHistories,
            clueStates: this.clueStates,
            collectedClues: this.collectedClues,
            visitedNpcs: Array.from(this.visitedNpcs),
            achievements: this.achievements,
            score: this.score,
            tutorialStep: this.tutorialStep,
            tutorialCompleted: this.tutorialCompleted,
            generatedStory: this.generatedStory,
            selectedSuspect: this.selectedSuspect,
            selectedEvidence: this.selectedEvidence,
            finalStatement: this.finalStatement,
            gameResult: this.gameResult,
            gameStats: this.gameStats
        };
        localStorage.setItem('brainMurderCase', JSON.stringify(state));
    }

    load() {
        const saved = localStorage.getItem('brainMurderCase');
        if (saved) {
            const state = JSON.parse(saved);
            Object.assign(this, state);
            this.visitedNpcs = new Set(state.visitedNpcs || []);
        }
    }

    // 游戏控制方法
    startGame() {
        this.gameStarted = true;
        this.startTime = Date.now();
        this.currentScreen = 'intro';
        this.save();
    }

    endGame(result, stats) {
        this.gameEnded = true;
        this.endTime = Date.now();
        this.gameResult = result;
        this.gameStats = stats;
        this.save();
    }

    // 线索管理方法
    unlockClue(clueId) {
        if (this.clueStates[clueId] === 'locked') {
            this.clueStates[clueId] = 'unlocked';
            this.save();
            return true;
        }
        return false;
    }

    verifyClue(clueId) {
        if (this.clueStates[clueId] === 'unlocked') {
            this.clueStates[clueId] = 'verified';
            this.save();
            return true;
        }
        return false;
    }

    getUnlockedClues() {
        return Object.keys(this.clueStates).filter(id => this.clueStates[id] !== 'locked');
    }

    getVerifiedClues() {
        return Object.keys(this.clueStates).filter(id => this.clueStates[id] === 'verified');
    }

    // 成就管理方法
    checkAchievements() {
        const newAchievements = [];

        // 初次审讯成就
        if (!this.achievements.first_interrogation && this.visitedNpcs.size > 0) {
            this.achievements.first_interrogation = true;
            newAchievements.push('first_interrogation');
        }

        // 线索猎人成就
        if (!this.achievements.clue_hunter && this.getUnlockedClues().length >= 5) {
            this.achievements.clue_hunter = true;
            newAchievements.push('clue_hunter');
        }

        // 真相探索者成就
        if (!this.achievements.truth_seeker && this.getVerifiedClues().length >= 10) {
            this.achievements.truth_seeker = true;
            newAchievements.push('truth_seeker');
        }

        // 对话大师成就
        if (!this.achievements.conversation_master && this.visitedNpcs.size >= 5) {
            this.achievements.conversation_master = true;
            newAchievements.push('conversation_master');
        }

        // 速度侦探成就（需要游戏结束时检查）
        if (this.gameEnded && !this.achievements.speed_investigator) {
            const gameTime = (this.endTime - this.startTime) / 1000 / 60; // 分钟
            if (gameTime <= 20) {
                this.achievements.speed_investigator = true;
                newAchievements.push('speed_investigator');
            }
        }

        if (newAchievements.length > 0) {
            this.save();
        }

        return newAchievements;
    }

    // 分数计算方法
    calculateScore() {
        const baseScore = this.getVerifiedClues().length * 10;
        const timeBonus = Math.max(0, 500 - Math.floor((Date.now() - this.startTime) / 1000 / 60) * 10);
        this.score = baseScore + timeBonus;
        this.save();
        return this.score;
    }

    // 聊天历史管理方法
    addMessage(npcId, message) {
        if (!this.chatHistories[npcId]) {
            this.chatHistories[npcId] = [];
        }
        this.chatHistories[npcId].push(message);
        this.save();
    }

    getChatHistory(npcId) {
        return this.chatHistories[npcId] || [];
    }

    // 工具方法
    getGameTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    getRemainingTime() {
        const elapsed = this.getGameTime();
        return Math.max(0, CONFIG.GAME_DURATION - elapsed);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 进度计算方法
    getProgress() {
        const visitedCount = this.visitedNpcs.size;
        return Math.min(100, (visitedCount / 5) * 100);
    }
}

// 创建全局游戏状态实例
const gameState = new GameState();

// 导出
window.GameState = GameState;
window.gameState = gameState;