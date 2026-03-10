// api-client.js - API客户端，处理与外部API的通信

class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.apiKey = CONFIG.API_KEY;
        this.model = CONFIG.MODEL_NAME;
    }

    // LLM API调用
    async callLLM(npcId, userMessage) {
        try {
            // 记录访问的NPC
            gameState.visitedNpcs.add(npcId);

            const npc = CHARACTERS[npcId];

            // 构建系统提示
            let systemPrompt = npc.prompt;

            // 添加已掌握的线索上下文
            const clueContext = this._buildClueContext(npcId);
            if (clueContext) {
                systemPrompt += clueContext;
            }

            // 构建消息历史
            const messages = [
                { role: "system", content: systemPrompt },
                ...gameState.getChatHistory(npcId).map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                { role: "user", content: userMessage }
            ];

            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.8,
                    max_tokens: 1000,
                    timeout: 30000
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            // 处理回复
            const cleanContent = this._processNpcResponse(content, npc.name);

            // 添加到聊天历史
            gameState.addMessage(npcId, { role: 'user', content: userMessage });
            gameState.addMessage(npcId, { role: 'assistant', content: cleanContent });

            // 分析线索
            this._analyzeClue(cleanContent, npcId);

            return cleanContent;

        } catch (error) {
            console.error('LLM API调用失败:', error);
            return `API 调用出错: ${error.message}`;
        }
    }

    // 故事推断API调用
    async generateStory(selectedClues, modusOperandi = '', motive = '', currentNpcId = '') {
        try {
            // 构建线索信息
            const clueInfo = selectedClues.map(clueId => {
                const clue = CLUE_DATABASE[clueId];
                return `- ${clue.title}：${clue.surface_text}`;
            }).join('\n');

            // 获取当前NPC信息
            let currentNpcName = '';
            if (currentNpcId && CHARACTERS[currentNpcId]) {
                currentNpcName = CHARACTERS[currentNpcId].name;
            }

            const prompt = `你是一个专业的侦探推理专家。你正在帮助侦探分析目前已收集的线索。

【重要限制 - 必须遵守】
1. 你只能基于下面提供的线索进行推断，不能编造、推测或引入任何未在线索中出现的信息
2. 不能凭空创造证据或细节
3. 如果线索信息不足以完整推断真凶或作案手法，请明确说出缺失的关键信息
4. 不能通过猜测来补齐缺失的信息

【当前审讯对象】
${currentNpcName || '未指定'}

【已收集的线索】（只能基于这些信息推断）
${clueInfo || '未选择线索'}

【玩家的额外分析】
作案手法描述：${modusOperandi || '未提供'}
作案动机描述：${motive || '未提供'}

【任务】
请根据ONLY上述信息，生成500-600字的推理分析，包括：

1. 线索的相关性分析
   - 这些线索之间的逻辑关联
   - 每条线索指向的方向

2. 初步推论
   - 基于现有线索能推断出什么
   - 还有哪些关键信息缺失

3. 调查建议
   - 应该继续追问哪些问题
   - 需要收集哪些关键证据

4. 警告信息
   - 如果某些推论缺乏充分证据，请标记"证据不足"
   - 如果信息太少无法确定凶手，请说"无法确定真凶"

【禁止行为】
❌ 不要编造线索列表中没有的证据
❌ 不要假设玩家已收集了其他线索
❌ 不要推断超出已有信息的细节
❌ 不要进行纯粹的猜测性推理

请生成严格遵守上述限制的推理分析。`;

            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: "system",
                            content: "你是一个严谨的侦探推理专家。你必须严格遵守用户的限制条件，只基于提供的信息进行推理。不能创造、编造或推测任何未明确提供的信息。"
                        },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.5,
                    max_tokens: 1200,
                    timeout: 45000
                })
            });

            if (!response.ok) {
                throw new Error(`故事生成失败: ${response.status}`);
            }

            const data = await response.json();
            let story = data.choices[0].message.content;

            // 检查是否需要添加警告
            if (story.includes("无法确定") || story.includes("证据不足")) {
                story = `⚠️ **警告**：根据目前收集的线索信息还不够完整\n\n${story}`;
            }

            return story;

        } catch (error) {
            console.error('故事生成API调用失败:', error);
            return `❌ 故事生成失败：${error.message}\n\n请检查网络连接或API配置。`;
        }
    }

    // TTS API调用
    async generateVoice(text, npcId) {
        try {
            const voiceId = CONFIG.TTS_VOICE_IDS[npcId];
            if (!voiceId) {
                return null;
            }

            // 选择API Key
            const useSecondKey = CONFIG.TTS_ACCOUNT2_NPCS.includes(npcId);
            const apiKey = useSecondKey ? CONFIG.TTS_API_KEY_2 : CONFIG.TTS_API_KEY;

            const response = await fetch(CONFIG.TTS_BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: CONFIG.TTS_MODEL,
                    text: text,
                    stream: false,
                    voice_setting: {
                        voice_id: voiceId,
                        speed: 1,
                        vol: 1,
                        pitch: 0
                    },
                    audio_setting: {
                        sample_rate: 32000,
                        bitrate: 128000,
                        format: "mp3",
                        channel: 1
                    },
                    subtitle_enable: false
                })
            });

            if (!response.ok) {
                throw new Error(`TTS API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const audioHex = data.data?.audio;

            if (!audioHex) {
                return null;
            }

            // 转换hex为blob
            const audioBlob = new Blob([new Uint8Array(audioHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))], { type: 'audio/mp3' });
            return URL.createObjectURL(audioBlob);

        } catch (error) {
            console.error('TTS API调用失败:', error);
            return null;
        }
    }

    // 私有方法
    _buildClueContext(npcId) {
        const unlocked = [];
        const verified = [];

        for (const [clueId, state] of Object.entries(gameState.clueStates)) {
            if (state === 'locked') continue;

            const clue = CLUE_DATABASE[clueId];
            const clueText = `  - ${clueId}: ${clue.title}（${clue.surface_text}）`;

            if (state === 'unlocked') {
                unlocked.push(clueText);
            } else if (state === 'verified') {
                verified.push(clueText);
            }
        }

        if (!unlocked.length && !verified.length) {
            return '';
        }

        const lines = ['\n【侦探目前已掌握的证据】'];
        lines.push('当侦探拿以下任何证据质问你时，你必须按照你的[CONFIRM]剧本回应，并在末尾附加 [CONFIRM:clue_xx] 标签。');

        if (unlocked.length) {
            lines.push('已解锁（表面线索）：');
            lines.push(...unlocked);
        }

        if (verified.length) {
            lines.push('已验证（真相已揭露）：');
            lines.push(...verified);
        }

        return '\n'.join(lines);
    }

    _processNpcResponse(content, npcName) {
        // 处理[UNLOCK_CLUE:clue_xx]标签
        const unlockMatch = content.match(/\[UNLOCK_CLUE:(\w+)\]/);
        if (unlockMatch) {
            const clueId = unlockMatch[1];
            if (CLUE_DATABASE[clueId]) {
                gameState.unlockClue(clueId);
                // 添加到收集的线索列表
                if (!gameState.collectedClues.find(c => c.id === clueId)) {
                    gameState.collectedClues.push({
                        id: clueId,
                        content: content.replace(/\[UNLOCK_CLUE:\w+\]/, '').trim(),
                        keywords: CLUE_DATABASE[clueId].keywords,
                        timestamp: Date.now()
                    });
                }
            }
            return content.replace(/\[UNLOCK_CLUE:\w+\]/, '').trim();
        }

        // 处理[CONFIRM:clue_xx]标签
        const confirmMatch = content.match(/\[CONFIRM:(\w+)\]/);
        if (confirmMatch) {
            const clueId = confirmMatch[1];
            if (CLUE_DATABASE[clueId]) {
                gameState.verifyClue(clueId);
            }
            return content.replace(/\[CONFIRM:\w+\]/, '').trim();
        }

        return content;
    }

    _analyzeClue(content, npcId) {
        // 分析回复中的关键词，自动添加到线索列表
        const existingClueIds = new Set(gameState.collectedClues.map(c => c.id));

        for (const [clueId, clue] of Object.entries(CLUE_DATABASE)) {
            if (existingClueIds.has(clueId)) continue;

            // 检查是否包含关键词
            const hasKeywords = clue.keywords.some(keyword =>
                content.toLowerCase().includes(keyword.toLowerCase())
            );

            if (hasKeywords) {
                gameState.collectedClues.push({
                    id: clueId,
                    content: content,
                    keywords: clue.keywords,
                    timestamp: Date.now()
                });
                break; // 只添加一个线索
            }
        }
    }
}

// 创建全局API客户端实例
const apiClient = new APIClient();

// 导出
window.APIClient = APIClient;
window.apiClient = apiClient;