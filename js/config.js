// config.js - 游戏配置文件

const CONFIG = {
    // API配置
    API_BASE_URL: 'https://api.deepseek.com',
    API_KEY: 'sk-f2e357b79e544be08d5538ed63d6ff24', // 注意：生产环境应该使用环境变量
    MODEL_NAME: 'deepseek-chat',

    // MiniMax TTS配置
    TTS_API_KEY: 'sk-api-f5EEEwdG4hfZ-OWwkhSlQPUO7T5RNQFr8EfswG_AyDPyC7YBQeo1XR2-pSVxo3cGzHBJOkHKACCPh-fU6-f6sRLmY90E8_MFy4rz7HmE7YpvHa5YQsVJeIU',
    TTS_API_KEY_2: 'sk-api-uStXxWuQPENpMmg58nAiw_haS7g6-EpxqofJzYOLPWH7FOwtUkxSs2StZcyd8wIxiQvcGNPvQvzOhoJgNcV9nc71f3qiV_3rTYeuiPbwu6jKqGxHKFBrtDQ',
    TTS_BASE_URL: 'https://api.minimaxi.com/v1/t2a_v2',
    TTS_MODEL: 'speech-02-hd',

    // NPC语音配置
    TTS_VOICE_IDS: {
        'npc3': 'ttv-voice-2026030800314526-OXjUeJXt', // 苏珊
        'npc2': 'ttv-voice-2026030800344826-Ctn56RuR', // 雷诺
        'npc5': 'ttv-voice-2026030800415726-hVpJcMAW', // 小林
        'npc1': 'ttv-voice-2026030800314526-OXjUeJXt', // 艾娃（使用第一个key）
        'npc4': 'ttv-voice-2026030800590726-o9Tx9eXO', // 陈工（使用第二个key）
    },

    // 使用第二个API Key的NPC
    TTS_ACCOUNT2_NPCS: ['npc1', 'npc4'],

    // 游戏配置
    GAME_DURATION: 30 * 60, // 30分钟，单位秒
    TUTORIAL_STEPS: 3,

    // UI配置
    MESSAGES_PER_PAGE: 50,
    MAX_CLUES_DISPLAY: 10,

    // 调试模式
    DEBUG: false
};

// 导出配置
window.CONFIG = CONFIG;