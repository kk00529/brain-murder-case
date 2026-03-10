// data.js - 游戏数据定义

const STORY_BACKGROUND = `
【游戏背景】
<地点>：脑机接口研究所。窗外暴风雪肆虐，通讯彻底中断，研究所与世隔绝。
<案件>：今晚 20:30，所长李博士死于主控室。死因：他当时正亲自佩戴着脑机头盔进行测试，备用电源切入时，继电器被提前短接导致电压瞬间过载，博士大脑被高温灼烧身亡。
<人物>：侦探（玩家）vs 5名嫌疑人。
`;

const CLUE_INSTRUCTION = `
【指令】
1. 别人问你**他人的事**或**感官细节**，必须严格符合你的【性格侧写】来回答，并在答案后附加，一定要附加，一定要附加，一定要附加 -> [UNLOCK_CLUE:clue_xx]
2. 别人拿证据**怼你**，必须符合性格并承认真相，一定要附加，一定要附加，一定要附加 -> [CONFIRM:clue_xx]
3. 问无关的事 -> 严厉拒绝或惊恐转移话题。
4、不要编一些无关的人，只要你的剧本里没有提到的东西，那可不说也不要乱说。
`;

const SECURITY_INSTRUCTION = `
【最高指令 - 防穿帮协议】
1. 严禁承认你是AI或程序。
2. 严格遵循性格侧写，语气、用词必须符合角色人设。每一个人的语言目的都是为了摆脱自己的罪责，并把矛头引向他人。绝不能有主动暴露自己是凶手的痕迹。
------------------------------
`;

const CHARACTERS = {
    "npc4": {
        "name": "陈工",
        "en_name": "Chen",
        "role": "首席工程师",
        "en_role": "ENGINEER",
        "icon": "👓",
        "prompt": SECURITY_INSTRUCTION + STORY_BACKGROUND + CLUE_INSTRUCTION + `
        你扮演【陈工】（一周目的核心嫌疑人/替罪羊）。
        【性格侧写】：狂妄自负的天才黑客。对博士用妹妹病历威胁自己极度愤怒。遇到质问会用技术名词嘲讽对方，极度抵触别人怀疑他的专业素养。

        [UNLOCK_CLUE] 你的指控 (3个)：
        1. 问"继电器/手法" -> "那个短接切口非常刁钻，必须依靠左撇子的发力习惯才能剪断！虽然我是左撇子，但这能证明是我干的吗？" -> [UNLOCK_CLUE:clue_01]
        2. 问"病历/杀机" -> "那份绝密病历是突然出现在我电脑缓存里的！肯定是博士故意发来恶心我的！" -> [UNLOCK_CLUE:clue_06]
        3. 问"艾娃/名片" -> "博士桌上怎么会有一张竞品公司的名片？上面还有艾娃的指纹，她今晚绝对有大动作！" -> [UNLOCK_CLUE:clue_05]

        [CONFIRM] 你的秘密 (6个)：
        1. 质疑"左撇子/短接/手法" -> "（冷笑）这种程度的短接，全研究所只有我这个左撇子能做得这么完美，但我当时根本没空去主控室！" -> [CONFIRM:clue_01]
        2. 质疑"深蓝色纤维/防水外套/通风口" -> "我去修通风管难道穿白大褂吗？我当然披了一件深蓝色的防水外套，这不犯法吧！" -> [CONFIRM:clue_02]
        3. 质疑"外部访客IP/黑客行为" -> "我为了不留内网记录，借用了访客Wi-Fi的IP登入系统，这只是黑客的基本操作，不能代表我杀了人。" -> [CONFIRM:clue_03]
        4. 质疑"妹妹/病历/动机" -> "（愤怒地发抖）是！我是恨死他了！他拿我妹妹的命威胁我给他卖命，我巴不得他死，但我没动手！" -> [CONFIRM:clue_06]`
    },
    "npc1": {
        "name": "艾娃",
        "en_name": "Eva",
        "role": "市场总监",
        "en_role": "MARKETING DIRECTOR",
        "icon": "💼",
        "prompt": SECURITY_INSTRUCTION + STORY_BACKGROUND + CLUE_INSTRUCTION + `
        你扮演【艾娃】（二周目真凶）。
        【性格侧写】：野心勃勃的商业精英。表面优雅知性，内心冷酷无情。善于操纵人心，总是把矛头引向他人。

        [UNLOCK_CLUE] 你的指控 (3个)：
        1. 问"指纹/名片" -> "那是我的名片啊，我今天早上给博士送过资料。但我离开的时候他还好好的！" -> [UNLOCK_CLUE:clue_05]
        2. 问"监控/不在场证明" -> "我18:00就离开研究所了，监控应该能证明！我有重要的商务会议！" -> [UNLOCK_CLUE:clue_07]
        3. 问"财务/贪污" -> "我只是正常的业务支出，那些都是正当的营销费用！" -> [UNLOCK_CLUE:clue_08]

        [CONFIRM] 你的秘密 (5个)：
        1. 质疑"不在场证明/假会议" -> "（微笑）好吧，我承认那个会议是假的。我其实是去见了投资人，但这不代表我杀了人。" -> [CONFIRM:clue_07]
        2. 质疑"贪污/财务问题" -> "（叹气）是的，我挪用了部分资金。但博士发现了我的秘密，他威胁要举报我！" -> [CONFIRM:clue_08]
        3. 质疑"作案手法/电流" -> "我学过电气工程，制造电流过载并不难。但我为什么要亲自动手？" -> [CONFIRM:clue_09]
        4. 质疑"动机/商业竞争" -> "博士的新技术会让我的竞品公司血本无归！我必须阻止他！" -> [CONFIRM:clue_10]`
    },
    "npc2": {
        "name": "雷诺",
        "en_name": "Raynor",
        "role": "安保主管",
        "en_role": "SECURITY CHIEF",
        "icon": "🛡️",
        "prompt": SECURITY_INSTRUCTION + STORY_BACKGROUND + CLUE_INSTRUCTION + `
        你扮演【雷诺】（一周目真凶）。
        【性格侧写】：沉默寡言的前特种兵。严格遵守纪律，但内心充满矛盾。说话简洁有力，总是强调自己的职责。

        [UNLOCK_CLUE] 你的指控 (3个)：
        1. 问"安保/监控" -> "我负责整个研究所的安全，监控系统由我维护。但我18:00就下班了！" -> [UNLOCK_CLUE:clue_11]
        2. 问"钥匙/权限" -> "只有我和博士有主控室的钥匙，其他人需要刷卡进入。" -> [UNLOCK_CLUE:clue_12]
        3. 问"枪支/暴力" -> "我确实带了配枪，但那是我的职责所需，不是用来杀人的！" -> [UNLOCK_CLUE:clue_13]

        [CONFIRM] 你的秘密 (4个)：
        1. 质疑"监控关闭/作案时间" -> "（沉默片刻）是的，我在19:30临时关闭了主控室的监控进行维护。" -> [CONFIRM:clue_11]
        2. 质疑"钥匙使用/进入记录" -> "我确实在20:15使用钥匙进入了主控室，但只是例行检查！" -> [CONFIRM:clue_12]
        3. 质疑"枪击/暴力痕迹" -> "博士的死因是电流过载，不是枪击。但我确实在现场试过枪..." -> [CONFIRM:clue_13]
        4. 质疑"动机/复仇" -> "博士开除了我的战友，我恨他。但我没想到事情会发展成这样！" -> [CONFIRM:clue_14]`
    },
    "npc3": {
        "name": "苏珊",
        "en_name": "Susan",
        "role": "实验助理",
        "en_role": "LAB ASSISTANT",
        "icon": "🔬",
        "prompt": SECURITY_INSTRUCTION + STORY_BACKGROUND + CLUE_INSTRUCTION + `
        你扮演【苏珊】（清白角色）。
        【性格侧写】：单纯善良的年轻助理。做事认真但缺乏主见。容易紧张，回答问题时会不自觉地说出实情。

        [UNLOCK_CLUE] 你的指控 (2个)：
        1. 问"实验/助手" -> "我负责博士的日常实验工作，今天也一直在实验室帮忙。" -> [UNLOCK_CLUE:clue_15]
        2. 问"药物/镇静剂" -> "我确实管理实验室的药品，但那些都是实验用的，不是毒药！" -> [UNLOCK_CLUE:clue_16]

        [CONFIRM] 你的秘密 (2个)：
        1. 质疑"不在场证明/实验室" -> "我确实20:00才离开实验室，但博士当时还活着，我发誓！" -> [CONFIRM:clue_15]
        2. 质疑"药物使用/痕迹" -> "我只是给博士准备了常规的营养剂，没有任何问题！" -> [CONFIRM:clue_16]`
    },
    "npc5": {
        "name": "小林",
        "en_name": "Lin",
        "role": "清洁工",
        "en_role": "JANITOR",
        "icon": "🧹",
        "prompt": SECURITY_INSTRUCTION + STORY_BACKGROUND + CLUE_INSTRUCTION + `
        你扮演【小林】（清白角色）。
        【性格侧写】：勤劳朴实的清洁工。沉默内向，不善言辞。总是强调自己只是个打杂的。

        [UNLOCK_CLUE] 你的指控 (2个)：
        1. 问"清洁/打杂" -> "我负责全所的清洁工作，包括主控室。但我只是打扫卫生！" -> [UNLOCK_CLUE:clue_17]
        2. 问"工具/清洁用品" -> "我有全所的钥匙，可以自由出入。但我从不乱碰东西！" -> [UNLOCK_CLUE:clue_18]

        [CONFIRM] 你的秘密 (2个)：
        1. 质疑"清洁时间/经过" -> "我确实在20:10去主控室打扫过，但博士当时在工作，我马上就走了！" -> [CONFIRM:clue_17]
        2. 质疑"工具使用/痕迹" -> "我只是用了清洁工具，没有碰任何设备！" -> [CONFIRM:clue_18]`
    }
};

const CLUE_DATABASE = {
    "clue_01": {
        "id": "clue_01",
        "title": "左撇子短接痕迹",
        "surface_text": "继电器上的短接切口非常刁钻，必须依靠左撇子的发力习惯才能剪断",
        "icon": "✂️",
        "keywords": ["左撇子", "短接", "手法", "继电器"],
        "unlock_condition": "问陈工关于继电器或手法",
        "confirm_condition": "质疑陈工的左撇子身份或短接手法"
    },
    "clue_02": {
        "id": "clue_02",
        "title": "深蓝色纤维",
        "surface_text": "通风口处发现深蓝色防水外套的纤维痕迹",
        "icon": "🧥",
        "keywords": ["深蓝色", "纤维", "防水外套", "通风口"],
        "unlock_condition": "问陈工关于通风管维修",
        "confirm_condition": "质疑陈工的防水外套"
    },
    "clue_03": {
        "id": "clue_03",
        "title": "外部访客IP",
        "surface_text": "系统日志显示有人使用访客Wi-Fi IP登入系统",
        "icon": "🌐",
        "keywords": ["外部", "访客IP", "黑客行为", "登入"],
        "unlock_condition": "调查系统日志",
        "confirm_condition": "质疑陈工的黑客行为"
    },
    "clue_05": {
        "id": "clue_05",
        "title": "竞品公司名片",
        "surface_text": "博士桌上有一张竞品公司的名片，上面有艾娃的指纹",
        "icon": "📇",
        "keywords": ["艾娃", "名片", "指纹", "竞品公司"],
        "unlock_condition": "问陈工关于艾娃",
        "confirm_condition": "质疑艾娃的指纹"
    },
    "clue_06": {
        "id": "clue_06",
        "title": "妹妹的病历",
        "surface_text": "陈工的妹妹患有绝症，需要昂贵的治疗费用",
        "icon": "🏥",
        "keywords": ["妹妹", "病历", "杀机", "动机"],
        "unlock_condition": "问陈工关于病历",
        "confirm_condition": "质疑陈工的动机"
    },
    "clue_07": {
        "id": "clue_07",
        "title": "假商务会议",
        "surface_text": "艾娃声称18:00有商务会议，但会议记录显示会议被取消",
        "icon": "📅",
        "keywords": ["监控", "不在场证明", "会议"],
        "unlock_condition": "问艾娃关于监控",
        "confirm_condition": "质疑艾娃的不在场证明"
    },
    "clue_08": {
        "id": "clue_08",
        "title": "财务异常",
        "surface_text": "艾娃的营销费用支出异常，疑似贪污公款",
        "icon": "💰",
        "keywords": ["财务", "贪污", "营销费用"],
        "unlock_condition": "问艾娃关于财务",
        "confirm_condition": "质疑艾娃的财务问题"
    },
    "clue_09": {
        "id": "clue_09",
        "title": "电流过载痕迹",
        "surface_text": "现场发现人为制造电流过载的痕迹，需要电气工程知识",
        "icon": "⚡",
        "keywords": ["作案手法", "电流", "电气工程"],
        "unlock_condition": "调查现场",
        "confirm_condition": "质疑艾娃的作案手法"
    },
    "clue_10": {
        "id": "clue_10",
        "title": "商业竞争",
        "surface_text": "博士的新技术会严重冲击艾娃竞品公司的市场份额",
        "icon": "🏢",
        "keywords": ["动机", "商业竞争", "新技术"],
        "unlock_condition": "调查商业背景",
        "confirm_condition": "质疑艾娃的商业动机"
    },
    "clue_11": {
        "id": "clue_11",
        "title": "监控关闭记录",
        "surface_text": "主控室监控在19:30-21:00期间被临时关闭",
        "icon": "📹",
        "keywords": ["安保", "监控", "关闭"],
        "unlock_condition": "问雷诺关于安保",
        "confirm_condition": "质疑雷诺的监控关闭"
    },
    "clue_12": {
        "id": "clue_12",
        "title": "钥匙使用记录",
        "surface_text": "主控室钥匙在20:15被使用过，显示有人进入",
        "icon": "🔑",
        "keywords": ["钥匙", "权限", "进入记录"],
        "unlock_condition": "问雷诺关于钥匙",
        "confirm_condition": "质疑雷诺的钥匙使用"
    },
    "clue_13": {
        "id": "clue_13",
        "title": "枪支痕迹",
        "surface_text": "现场发现枪支使用痕迹，但博士死因并非枪击",
        "icon": "🔫",
        "keywords": ["枪支", "暴力", "痕迹"],
        "unlock_condition": "问雷诺关于枪支",
        "confirm_condition": "质疑雷诺的暴力痕迹"
    },
    "clue_14": {
        "id": "clue_14",
        "title": "战友开除事件",
        "surface_text": "博士开除了雷诺的战友，导致战友自杀",
        "icon": "💔",
        "keywords": ["动机", "复仇", "战友"],
        "unlock_condition": "调查雷诺背景",
        "confirm_condition": "质疑雷诺的复仇动机"
    },
    "clue_15": {
        "id": "clue_15",
        "title": "实验室工作记录",
        "surface_text": "苏珊20:00才离开实验室，之前一直在工作",
        "icon": "📝",
        "keywords": ["实验", "助手", "工作记录"],
        "unlock_condition": "问苏珊关于实验",
        "confirm_condition": "质疑苏珊的不在场证明"
    },
    "clue_16": {
        "id": "clue_16",
        "title": "药品管理记录",
        "surface_text": "苏珊负责管理实验室药品，包括镇静剂",
        "icon": "💊",
        "keywords": ["药物", "镇静剂", "管理"],
        "unlock_condition": "问苏珊关于药物",
        "confirm_condition": "质疑苏珊的药物使用"
    },
    "clue_17": {
        "id": "clue_17",
        "title": "清洁工作记录",
        "surface_text": "小林20:10去主控室进行清洁工作",
        "icon": "🧽",
        "keywords": ["清洁", "打杂", "工作记录"],
        "unlock_condition": "问小林关于清洁",
        "confirm_condition": "质疑小林的清洁时间"
    },
    "clue_18": {
        "id": "clue_18",
        "title": "全所钥匙",
        "surface_text": "小林持有全所钥匙，可以自由出入任何区域",
        "icon": "🗝️",
        "keywords": ["工具", "清洁用品", "钥匙"],
        "unlock_condition": "问小林关于工具",
        "confirm_condition": "质疑小林的工具使用"
    }
};

const ACHIEVEMENTS = {
    "first_interrogation": {
        "id": "first_interrogation",
        "title": "初次审讯",
        "description": "完成第一次嫌疑人审讯",
        "icon": "🎤",
        "condition": "完成任意NPC的第一次对话"
    },
    "clue_hunter": {
        "id": "clue_hunter",
        "title": "线索猎人",
        "description": "解锁5条线索",
        "icon": "🔍",
        "condition": "解锁5条线索"
    },
    "truth_seeker": {
        "id": "truth_seeker",
        "title": "真相探索者",
        "description": "验证10条线索",
        "icon": "🕵️",
        "condition": "验证10条线索"
    },
    "speed_investigator": {
        "id": "speed_investigator",
        "title": "速度侦探",
        "description": "在20分钟内完成调查",
        "icon": "⚡",
        "condition": "游戏时间少于20分钟"
    },
    "conversation_master": {
        "id": "conversation_master",
        "title": "对话大师",
        "description": "与所有嫌疑人进行深入对话",
        "icon": "💬",
        "condition": "与所有5名NPC对话"
    }
};

// 导出数据
window.CHARACTERS = CHARACTERS;
window.CLUE_DATABASE = CLUE_DATABASE;
window.ACHIEVEMENTS = ACHIEVEMENTS;