// ui-manager.js - UI管理器，负责界面更新和用户交互

class UIManager {
    constructor() {
        this.currentAudio = null;
        this.timerInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadGameState();
    }

    // 绑定事件监听器
    bindEvents() {
        // 开场动画事件
        document.getElementById('start-game-btn')?.addEventListener('click', () => {
            this.showScreen('game');
            gameState.startGame();
            this.startTimer();
            this.updateUI();
        });

        // 教程事件
        document.querySelectorAll('.tutorial-next-btn').forEach(btn => {
            btn.addEventListener('click', () => this.nextTutorialStep());
        });

        // 角色选择事件
        document.getElementById('character-buttons')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.character-btn');
            if (btn) {
                const npcId = btn.dataset.npcId;
                this.selectCharacter(npcId);
            }
        });

        // 消息发送事件
        document.getElementById('send-btn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // 建议问题点击事件
        document.getElementById('question-suggestions')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('question-suggestion')) {
                const question = e.target.textContent;
                document.getElementById('message-input').value = question;
            }
        });

        // 侧边栏按钮事件
        document.getElementById('story-inference-btn')?.addEventListener('click', () => {
            this.showScreen('story-inference');
        });

        document.getElementById('accuse-btn')?.addEventListener('click', () => {
            this.showScreen('accuse');
        });

        // 故事推断事件
        document.getElementById('generate-story-btn')?.addEventListener('click', () => this.generateStory());
        document.getElementById('back-to-game-btn')?.addEventListener('click', () => {
            this.showScreen('game');
        });
        document.getElementById('accuse-from-story-btn')?.addEventListener('click', () => {
            this.showScreen('accuse');
        });

        // 指认凶手事件
        document.getElementById('submit-accusation-btn')?.addEventListener('click', () => this.submitAccusation());
        document.getElementById('back-from-accuse-btn')?.addEventListener('click', () => {
            this.showScreen('game');
        });

        // 结局事件
        document.getElementById('play-again-btn')?.addEventListener('click', () => this.restartGame());
        document.getElementById('share-btn')?.addEventListener('click', () => this.shareResult());
    }

    // 屏幕切换
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenId}-screen`).classList.add('active');
        gameState.currentScreen = screenId;
        gameState.save();
    }

    // 加载游戏状态
    loadGameState() {
        gameState.load();
        this.updateUI();

        if (gameState.gameStarted && !gameState.gameEnded) {
            this.showScreen(gameState.currentScreen);
            this.startTimer();
        } else if (gameState.gameEnded) {
            this.showEnding();
        }
    }

    // 更新整个UI
    updateUI() {
        this.updateSidebar();
        this.updateGameStatus();
        this.updateChatArea();
        this.updateAchievements();
        this.checkTutorial();
    }

    // 更新侧边栏
    updateSidebar() {
        // 更新时间显示
        const remaining = gameState.getRemainingTime();
        document.getElementById('time-display').textContent = gameState.formatTime(remaining);

        // 更新分数
        document.getElementById('score-display').textContent = gameState.score;

        // 更新线索列表
        this.updateCluesList();

        // 检查时间是否结束
        if (remaining === 0 && !gameState.gameEnded) {
            this.endGame('timeout');
        }
    }

    // 更新线索列表
    updateCluesList() {
        const cluesList = document.getElementById('clues-list');
        const unlockedClues = gameState.getUnlockedClues();

        if (unlockedClues.length === 0) {
            cluesList.innerHTML = '<p class="no-clues">暂无线索</p>';
            return;
        }

        cluesList.innerHTML = unlockedClues.map(clueId => {
            const clue = CLUE_DATABASE[clueId];
            const stateClass = gameState.clueStates[clueId] === 'verified' ? 'verified' : 'unlocked';
            return `
                <div class="clue-item ${stateClass}">
                    ${clue.icon} ${clue.title}
                </div>
            `;
        }).join('');
    }

    // 更新游戏状态面板
    updateGameStatus() {
        // 更新进度条
        const progress = gameState.getProgress();
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `已审讯 ${gameState.visitedNpcs.size}/5 名嫌疑人`;

        // 更新角色按钮
        this.updateCharacterButtons();
    }

    // 更新角色按钮
    updateCharacterButtons() {
        const container = document.getElementById('character-buttons');
        container.innerHTML = Object.entries(CHARACTERS).map(([npcId, npc]) => {
            const isSelected = gameState.selectedCharacter === npcId;
            const isVisited = gameState.visitedNpcs.has(npcId);
            const className = `character-btn ${isSelected ? 'selected' : ''} ${isVisited ? 'visited' : ''}`;

            return `
                <div class="${className}" data-npc-id="${npcId}">
                    <div class="character-icon">${npc.icon}</div>
                    <div class="character-info">
                        <h5>${npc.name}</h5>
                        <p>${npc.role}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 更新聊天区域
    updateChatArea() {
        if (!gameState.selectedCharacter) {
            document.getElementById('chat-title').textContent = '选择嫌疑人开始审讯';
            document.getElementById('character-info').innerHTML = '<span id="character-icon">👤</span><span id="character-name">未选择</span><span id="character-role">未选择</span>';
            document.getElementById('chat-messages').innerHTML = '';
            document.getElementById('question-suggestions').innerHTML = '';
            return;
        }

        const npc = CHARACTERS[gameState.selectedCharacter];
        document.getElementById('chat-title').textContent = `正在审讯：${npc.name}`;
        document.getElementById('character-info').innerHTML = `
            <span id="character-icon">${npc.icon}</span>
            <span id="character-name">${npc.name}</span>
            <span id="character-role">${npc.role}</span>
        `;

        // 更新聊天消息
        this.updateChatMessages();

        // 更新建议问题
        this.updateQuestionSuggestions();
    }

    // 更新聊天消息
    updateChatMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        const messages = gameState.getChatHistory(gameState.selectedCharacter);

        messagesContainer.innerHTML = messages.map(msg => {
            const isUser = msg.role === 'user';
            return `
                <div class="message ${isUser ? 'user' : 'npc'}">
                    <div class="message-avatar">
                        ${isUser ? '🕵️' : CHARACTERS[gameState.selectedCharacter].icon}
                    </div>
                    <div class="message-content">
                        <div class="message-text">${this.formatMessage(msg.content)}</div>
                        <div class="message-time">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
            `;
        }).join('');

        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 更新建议问题
    updateQuestionSuggestions() {
        const suggestions = this.generateQuestionSuggestions();
        const container = document.getElementById('question-suggestions');

        container.innerHTML = suggestions.map(question => `
            <div class="question-suggestion">${question}</div>
        `).join('');
    }

    // 生成建议问题
    generateQuestionSuggestions() {
        const npc = CHARACTERS[gameState.selectedCharacter];
        const unlockedClues = gameState.getUnlockedClues();

        const suggestions = [
            `你今天在研究所都做了什么？`,
            `你对李博士的死有什么看法？`,
            `案发时你在哪里？`
        ];

        // 根据解锁的线索添加针对性问题
        unlockedClues.forEach(clueId => {
            const clue = CLUE_DATABASE[clueId];
            if (clue.keywords.includes('艾娃') && gameState.selectedCharacter !== 'npc1') {
                suggestions.push(`你知道艾娃今天来过研究所吗？`);
            }
            if (clue.keywords.includes('监控')) {
                suggestions.push(`你能解释一下监控系统的情况吗？`);
            }
            if (clue.keywords.includes('钥匙')) {
                suggestions.push(`关于主控室的钥匙，你知道些什么？`);
            }
        });

        return suggestions.slice(0, 6); // 最多显示6个
    }

    // 更新成就
    updateAchievements() {
        const container = document.getElementById('achievements-list');
        container.innerHTML = Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
            const isUnlocked = gameState.achievements[id];
            return `
                <div class="achievement-item ${isUnlocked ? 'unlocked' : ''}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <h5>${achievement.title}</h5>
                        <p>${achievement.description}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 选择角色
    selectCharacter(npcId) {
        gameState.selectedCharacter = npcId;
        gameState.save();
        this.updateUI();

        // 完成教程第一步
        if (gameState.tutorialStep === 0) {
            gameState.tutorialStep = 1;
            gameState.save();
            this.checkTutorial();
        }
    }

    // 发送消息
    async sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();

        if (!message || !gameState.selectedCharacter) return;

        input.value = '';
        input.disabled = true;
        document.getElementById('send-btn').disabled = true;

        try {
            // 显示用户消息
            gameState.addMessage(gameState.selectedCharacter, { role: 'user', content: message });
            this.updateChatMessages();

            // 调用API
            const response = await apiClient.callLLM(gameState.selectedCharacter, message);

            // 显示NPC回复
            gameState.addMessage(gameState.selectedCharacter, { role: 'assistant', content: response });
            this.updateChatMessages();

            // 生成语音
            this.generateVoice(response, gameState.selectedCharacter);

            // 检查成就
            const newAchievements = gameState.checkAchievements();
            if (newAchievements.length > 0) {
                this.showAchievementNotification(newAchievements);
                this.updateAchievements();
            }

            // 更新UI
            this.updateUI();

            // 完成教程第二步
            if (gameState.tutorialStep === 1) {
                gameState.tutorialStep = 2;
                gameState.tutorialCompleted = true;
                gameState.save();
                this.checkTutorial();
            }

        } catch (error) {
            console.error('发送消息失败:', error);
            this.showError('消息发送失败，请重试');
        } finally {
            input.disabled = false;
            document.getElementById('send-btn').disabled = false;
        }
    }

    // 生成语音
    async generateVoice(text, npcId) {
        try {
            const audioUrl = await apiClient.generateVoice(text, npcId);
            if (audioUrl) {
                this.playAudio(audioUrl);
            }
        } catch (error) {
            console.error('语音生成失败:', error);
        }
    }

    // 播放音频
    playAudio(audioUrl) {
        if (this.currentAudio) {
            this.currentAudio.stop();
        }

        this.currentAudio = new Howl({
            src: [audioUrl],
            autoplay: true,
            volume: 0.7
        });
    }

    // 生成故事
    async generateStory() {
        const selectedClues = Array.from(document.querySelectorAll('#inference-clues input:checked'))
            .map(cb => cb.value);

        if (selectedClues.length === 0) {
            this.showError('请至少选择一条线索');
            return;
        }

        const modusOperandi = document.getElementById('modus-operandi').value;
        const motive = document.getElementById('motive').value;

        const resultDiv = document.getElementById('story-result');
        resultDiv.innerHTML = '<div class="loading">🤔 正在生成推理故事...</div>';

        try {
            const story = await apiClient.generateStory(selectedClues, modusOperandi, motive, gameState.selectedCharacter);
            resultDiv.innerHTML = `
                <div class="story-content">
                    ${this.formatMessage(story)}
                </div>
                <div class="story-actions">
                    <button onclick="uiManager.regenerateStory()">🔄 重新生成</button>
                    <button onclick="uiManager.saveStory()">💾 保存推理</button>
                </div>
            `;
            gameState.generatedStory = story;
            gameState.save();
        } catch (error) {
            resultDiv.innerHTML = `<div class="error">❌ 生成失败：${error.message}</div>`;
        }
    }

    // 重新生成故事
    regenerateStory() {
        gameState.generatedStory = null;
        gameState.save();
        this.generateStory();
    }

    // 保存故事
    saveStory() {
        // 这里可以实现保存到本地或分享功能
        this.showSuccess('推理已保存！');
    }

    // 提交指认
    submitAccusation() {
        const selectedSuspect = document.querySelector('input[name="suspect"]:checked')?.value;
        const selectedEvidence = Array.from(document.querySelectorAll('#evidence-selection input:checked'))
            .map(cb => cb.value);

        if (!selectedSuspect) {
            this.showError('请选择嫌疑人');
            return;
        }

        if (selectedEvidence.length === 0) {
            this.showError('请至少选择一条证据');
            return;
        }

        const finalStatement = document.getElementById('final-statement').value;

        // 这里应该实现指认逻辑
        // 暂时直接显示成功结局
        this.endGame('success');
    }

    // 结束游戏
    endGame(result) {
        gameState.endGame(result, this.calculateStats());
        this.showEnding();
    }

    // 显示结局
    showEnding() {
        this.showScreen('ending');
        const resultDiv = document.getElementById('ending-result');

        if (gameState.gameResult === 'success') {
            resultDiv.innerHTML = `
                <div class="ending-success">
                    <h2>🎉 破案成功！</h2>
                    <p>恭喜你成功找出真凶！</p>
                    ${this.generateStatsHTML()}
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="ending-failure">
                    <h2>⏰ 时间到！</h2>
                    <p>很遗憾，时间已经用完。游戏结束。</p>
                    ${this.generateStatsHTML()}
                </div>
            `;
        }
    }

    // 计算统计数据
    calculateStats() {
        return {
            score: gameState.calculateScore(),
            cluesCollected: gameState.getUnlockedClues().length,
            cluesVerified: gameState.getVerifiedClues().length,
            npcsInterviewed: gameState.visitedNpcs.size,
            timeUsed: gameState.getGameTime(),
            achievements: Object.values(gameState.achievements).filter(a => a).length
        };
    }

    // 生成统计HTML
    generateStatsHTML() {
        const stats = gameState.gameStats;
        return `
            <div class="ending-stats">
                <div class="stat-item">
                    <span>最终分数：</span>
                    <span>${stats.score}</span>
                </div>
                <div class="stat-item">
                    <span>收集线索：</span>
                    <span>${stats.cluesCollected}</span>
                </div>
                <div class="stat-item">
                    <span>验证线索：</span>
                    <span>${stats.cluesVerified}</span>
                </div>
                <div class="stat-item">
                    <span>审讯人数：</span>
                    <span>${stats.npcsInterviewed}/5</span>
                </div>
                <div class="stat-item">
                    <span>用时：</span>
                    <span>${gameState.formatTime(stats.timeUsed)}</span>
                </div>
                <div class="stat-item">
                    <span>成就解锁：</span>
                    <span>${stats.achievements}</span>
                </div>
            </div>
        `;
    }

    // 重新开始游戏
    restartGame() {
        gameState.reset();
        this.showScreen('loading');
        setTimeout(() => {
            this.showScreen('intro');
        }, 1000);
    }

    // 分享结果
    shareResult() {
        const stats = gameState.gameStats;
        const text = `我在《脑机接口谋杀案》中获得${stats.score}分，收集了${stats.cluesCollected}条线索，解锁了${stats.achievements}个成就！快来挑战吧！`;

        if (navigator.share) {
            navigator.share({
                title: '脑机接口谋杀案',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                this.showSuccess('结果已复制到剪贴板！');
            });
        }
    }

    // 教程相关
    checkTutorial() {
        if (gameState.tutorialCompleted) {
            document.getElementById('tutorial-overlay').style.display = 'none';
            return;
        }

        document.getElementById('tutorial-overlay').style.display = 'flex';
        document.querySelectorAll('.tutorial-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(`tutorial-step-${gameState.tutorialStep}`).classList.add('active');
    }

    nextTutorialStep() {
        if (gameState.tutorialStep < 2) {
            gameState.tutorialStep++;
            gameState.save();
            this.checkTutorial();
        } else {
            gameState.tutorialCompleted = true;
            gameState.save();
            this.checkTutorial();
        }
    }

    // 计时器
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.updateSidebar();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // 通知方法
    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // 简单的通知实现
        alert(message);
    }

    showAchievementNotification(achievementIds) {
        achievementIds.forEach(id => {
            const achievement = ACHIEVEMENTS[id];
            this.showSuccess(`🏆 解锁成就：${achievement.title}`);
        });
    }

    // 工具方法
    formatMessage(text) {
        return text.replace(/\n/g, '<br>');
    }
}

// 创建全局UI管理器实例
const uiManager = new UIManager();

// 导出
window.UIManager = UIManager;
window.uiManager = uiManager;