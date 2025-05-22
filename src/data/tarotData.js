// tarotData.js

// 大阿卡那牌数据
export const majorArcana = [
    {
        id: 0,
        name: "愚者",
        image: "https://picsum.photos/seed/fool/400/600",
        upright: "新的开始、冒险、自发性、无忧无虑",
        reversed: "鲁莽、冒失、不负责任、愚蠢",
        description: "愚者牌代表着新的开始、冒险和自发性。它象征着放下过去，勇敢地迈向未知。正位时，这张牌鼓励你相信自己的直觉，勇于尝试新事物。逆位时，则提醒你要谨慎行事，避免鲁莽决策。"
    },
    {
        id: 1,
        name: "魔术师",
        image: "https://picsum.photos/seed/magician/400/600",
        upright: "创造力、技能、集中力、智慧",
        reversed: "操纵、欺骗、无能、浪费",
        description: "魔术师牌代表创造力、技能和集中力。它象征着将想法转化为现实的能力。正位时，这张牌表示你拥有实现目标所需的一切资源和能力。逆位时，则可能暗示你在使用自己的能力时不够诚实或有效。"
    },
    {
        id: 2,
        name: "女祭司",
        image: "https://picsum.photos/seed/priestess/400/600",
        upright: "直觉、神秘、内在智慧、神圣女性",
        reversed: "隐瞒、秘密、表面、拒绝直觉",
        description: "女祭司牌代表直觉、神秘和内在智慧。它象征着潜意识和灵性世界的力量。正位时，这张牌鼓励你倾听内心的声音，相信自己的直觉。逆位时，则可能表示你忽视了自己的直觉，或者某些事情被隐藏起来。"
    },
    {
        id: 3,
        name: "皇后",
        image: "https://picsum.photos/seed/empress/400/600",
        upright: "创造力、滋养、丰盛、母性",
        reversed: "依赖、自我忽视、生产力低下",
        description: "皇后牌代表创造力、滋养和丰盛。它象征着自然、女性和母性的力量。正位时，这张牌表示你处于一个富有创造力和生产力的时期，能够享受生活的美好。逆位时，则可能暗示你感到缺乏灵感，或者没有照顾好自己的需求。"
    },
    {
        id: 4,
        name: "皇帝",
        image: "https://picsum.photos/seed/emperor/400/600",
        upright: "权威、结构、领导力、父性",
        reversed: "专制、僵化、依赖权威、无能",
        description: "皇帝牌代表权威、结构和领导力。它象征着父性、秩序和理性的力量。正位时，这张牌表示你能够建立稳固的基础，发挥自己的领导能力。逆位时，则可能暗示你过于依赖权威，或者在决策时缺乏自信。"
    },
    {
        id: 5,
        name: "教皇",
        image: "https://picsum.photos/seed/hierophant/400/600",
        upright: "传统、道德、指导、信仰",
        reversed: "反叛、创新、偏离传统、虚伪",
        description: "教皇牌代表传统、道德和指导。它象征着精神导师、机构和集体信仰。正位时，这张牌表示你在寻求指导或遵循传统价值观。逆位时，则可能暗示你需要挑战传统，寻找自己的道路。"
    },
    {
        id: 6,
        name: "恋人",
        image: "https://picsum.photos/seed/lovers/400/600",
        upright: "伙伴关系、选择、和谐、爱情",
        reversed: "不和谐、犹豫不决、分离、价值观冲突",
        description: "恋人牌代表伙伴关系、选择和和谐。它象征着爱情、关系和价值观的平衡。正位时，这张牌表示你面临重要的选择，或者处于一段和谐的关系中。逆位时，则可能暗示关系中的冲突或犹豫不决。"
    },
    {
        id: 7,
        name: "战车",
        image: "https://picsum.photos/seed/chariot/400/600",
        upright: "决心、胜利、前进、意志",
        reversed: "障碍、冲突、失去控制、延迟",
        description: "战车牌代表决心、胜利和前进。它象征着意志力、控制和克服障碍的能力。正位时，这张牌表示你能够集中精力，实现自己的目标。逆位时，则可能暗示你遇到了障碍，或者失去了对局势的控制。"
    },
    {
        id: 8,
        name: "力量",
        image: "https://picsum.photos/seed/strength/400/600",
        upright: "勇气、耐心、自控、内在力量",
        reversed: "脆弱、缺乏信心、滥用力量、屈服",
        description: "力量牌代表勇气、耐心和自控。它象征着内在的力量、温和的力量和情感的控制。正位时，这张牌表示你拥有克服困难所需的勇气和耐心。逆位时，则可能暗示你感到脆弱，或者在处理情绪时遇到困难。"
    },
    {
        id: 9,
        name: "隐士",
        image: "https://picsum.photos/seed/hermit/400/600",
        upright: "独处、内省、智慧、引导",
        reversed: "孤独、退缩、孤立、固执",
        description: "隐士牌代表独处、内省和智慧。它象征着寻找真理、自我反思和精神指导。正位时，这张牌表示你需要一段时间的独处和内省，以寻找答案。逆位时，则可能暗示你过度孤立自己，或者拒绝接受他人的帮助。"
    },
    {
        id: 10,
        name: "命运之轮",
        image: "https://picsum.photos/seed/wheel/400/600",
        upright: "变化、周期、命运、机会",
        reversed: "阻碍、抵抗变化、坏运气、停滞",
        description: "命运之轮牌代表变化、周期和命运。它象征着生命的循环、命运的转变和不可避免的变化。正位时，这张牌表示变化即将到来，可能带来新的机会。逆位时，则可能暗示你在抵抗变化，或者感到陷入困境。"
    },
    {
        id: 11,
        name: "正义",
        image: "https://picsum.photos/seed/justice/400/600",
        upright: "平衡、公正、真理、道德",
        reversed: "不公平、偏见、不平等、不诚实",
        description: "正义牌代表平衡、公正和真理。它象征着道德、法律和伦理的力量。正位时，这张牌表示你在决策中能够保持公正和平衡。逆位时，则可能暗示你在判断中存在偏见，或者需要重新评估情况。"
    },
    {
        id: 12,
        name: "倒吊人",
        image: "https://picsum.photos/seed/hanged/400/600",
        upright: "牺牲、放下、新视角、等待",
        reversed: "延迟、抗拒牺牲、不必要的牺牲",
        description: "倒吊人牌代表牺牲、放下和新视角。它象征着自愿放弃某些东西以获得更高的理解。正位时，这张牌表示你需要暂时放下某些东西，以获得新的视角。逆位时，则可能暗示你在抗拒必要的牺牲，或者做出了不必要的牺牲。"
    },
    {
        id: 13,
        name: "死神",
        image: "https://picsum.photos/seed/death/400/600",
        upright: "结束、转变、过渡、放下",
        reversed: "抵抗变化、停滞、延长的结束",
        description: "死神牌代表结束、转变和过渡。它象征着旧事物的结束和新事物的开始。正位时，这张牌表示某个阶段的结束，通常伴随着积极的转变。逆位时，则可能暗示你在抵抗不可避免的变化，或者陷入停滞状态。"
    },
    {
        id: 14,
        name: "节制",
        image: "https://picsum.photos/seed/temperance/400/600",
        upright: "平衡、调和、中庸、耐心",
        reversed: "不平衡、极端、不和谐、急躁",
        description: "节制牌代表平衡、调和和中庸。它象征着对立面的融合和和谐。正位时，这张牌表示你能够在不同的事物之间找到平衡，保持和谐。逆位时，则可能暗示你处于不平衡状态，或者在处理对立的事物时遇到困难。"
    },
    {
        id: 15,
        name: "恶魔",
        image: "https://picsum.photos/seed/devil/400/600",
        upright: "束缚、成瘾、物质主义、诱惑",
        reversed: "摆脱束缚、克服成瘾、内在力量",
        description: "恶魔牌代表束缚、成瘾和物质主义。它象征着被外在或内在的力量所控制。正位时，这张牌表示你可能被某种成瘾或不健康的模式所束缚。逆位时，则可能暗示你正在努力摆脱这些束缚，重新获得自由。"
    },
    {
        id: 16,
        name: "塔",
        image: "https://picsum.photos/seed/tower/400/600",
        upright: "突然的变化、崩塌、启示、打破结构",
        reversed: "避免灾难、延迟的变化、重建",
        description: "塔牌代表突然的变化、崩塌和启示。它象征着旧有结构的崩溃，为新的开始创造空间。正位时，这张牌表示你可能面临突然的变化或挑战，需要放下旧有的方式。逆位时，则可能暗示你在避免必要的变化，或者正在重建被破坏的事物。"
    },
    {
        id: 17,
        name: "星星",
        image: "https://picsum.photos/seed/star/400/600",
        upright: "希望、灵感、信心、更新",
        reversed: "失望、缺乏信心、能量流失",
        description: "星星牌代表希望、灵感和信心。它象征着灵性的指引和新的可能性。正位时，这张牌表示你处于一个充满希望和灵感的时期，能够看到未来的可能性。逆位时，则可能暗示你感到失望或缺乏信心，需要重新寻找方向。"
    },
    {
        id: 18,
        name: "月亮",
        image: "https://picsum.photos/seed/moon/400/600",
        upright: "潜意识、梦想、直觉、幻觉",
        reversed: "混乱、恐惧、误解、清晰",
        description: "月亮牌代表潜意识、梦想和直觉。它象征着隐藏的事物和情感的世界。正位时，这张牌表示你需要倾听自己的直觉，探索潜意识中的信息。逆位时，则可能暗示你感到困惑或恐惧，需要澄清事实。"
    },
    {
        id: 19,
        name: "太阳",
        image: "https://picsum.photos/seed/sun/400/600",
        upright: "成功、喜悦、活力、乐观",
        reversed: "消沉、不成熟、任性、暂时的挫折",
        description: "太阳牌代表成功、喜悦和活力。它象征着光明、乐观和积极的能量。正位时，这张牌表示你处于一个充满成功和喜悦的时期，能够享受生活的美好。逆位时，则可能暗示你感到消沉或遇到暂时的挫折，需要重新找回乐观的态度。"
    },
    {
        id: 20,
        name: "审判",
        image: "https://picsum.photos/seed/judgment/400/600",
        upright: "重生、自我评估、觉醒、反思",
        reversed: "自我怀疑、拒绝改变、延迟的觉醒",
        description: "审判牌代表重生、自我评估和觉醒。它象征着对过去的反思和新的开始。正位时，这张牌表示你正在经历一个自我评估的时期，可能会有新的觉醒或决定。逆位时，则可能暗示你在怀疑自己，或者拒绝接受必要的改变。"
    },
    {
        id: 21,
        name: "世界",
        image: "https://picsum.photos/seed/world/400/600",
        upright: "完成、整合、成功、旅行",
        reversed: "未完成、延迟、整合不足、重新评估",
        description: "世界牌代表完成、整合和成功。它象征着旅程的结束和新的开始。正位时，这张牌表示你已经完成了一个阶段，达到了某种程度的成功或整合。逆位时，则可能暗示你感到未完成或需要重新评估自己的目标。"
    }
];

// 小阿卡那牌数据
export const minorArcana = [
    // 权杖牌组 (1-10, 侍从, 骑士, 王后, 国王)
    { id: 101, name: "权杖Ace", suit: "权杖", upright: "新的开始，创造力的火花", reversed: "潜力未开发，创意受阻", description: "代表新的开始和创造力的迸发，象征着灵感和热情的觉醒。" },
    { id: 102, name: "权杖2", suit: "权杖", upright: "选择，平衡，合作", reversed: "犹豫不决，合作困难", description: "代表面临选择和决策，需要在不同方向之间找到平衡。" },
    { id: 103, name: "权杖3", suit: "权杖", upright: "成长，合作，计划推进", reversed: "延迟，计划不明确", description: "象征着合作和共同努力带来的成长和进步。" },
    { id: 104, name: "权杖4", suit: "权杖", upright: "庆祝，稳定，成就", reversed: "短暂的成功，停滞", description: "代表庆祝成就和建立稳定的基础。" },
    { id: 105, name: "权杖5", suit: "权杖", upright: "竞争，冲突，挑战", reversed: "内部冲突，无谓的竞争", description: "象征着竞争和冲突，需要找到解决分歧的方法。" },
    { id: 106, name: "权杖6", suit: "权杖", upright: "胜利，认可，前进", reversed: "虚假的胜利，骄傲", description: "代表胜利和公众认可，成功正在到来。" },
    { id: 107, name: "权杖7", suit: "权杖", upright: "坚持，防御，克服障碍", reversed: "抵抗徒劳，孤立", description: "象征着面对挑战时的坚持和勇气。" },
    { id: 108, name: "权杖8", suit: "权杖", upright: "快速行动，进展，消息", reversed: "延迟，沟通不畅", description: "代表快速的行动和进展，消息和沟通的顺畅。" },
    { id: 109, name: "权杖9", suit: "权杖", upright: "准备，防御，坚持", reversed: "过度防御，疲惫", description: "象征着为即将到来的挑战做准备，需要坚持和耐心。" },
    { id: 110, name: "权杖10", suit: "权杖", upright: "负担，责任，完成", reversed: "过度负担，压力", description: "代表承担责任和负担，可能需要寻求帮助。" },
    { id: 111, name: "权杖侍从", suit: "权杖", upright: "新想法，热情，年轻的能量", reversed: "不成熟，缺乏方向", description: "象征着新的想法和热情，年轻而充满活力的能量。" },
    { id: 112, name: "权杖骑士", suit: "权杖", upright: "冒险，行动，热情", reversed: "鲁莽，冲动，缺乏耐心", description: "代表冒险精神和果断行动，可能带来变化。" },
    { id: 113, name: "权杖王后", suit: "权杖", upright: "创造力，热情，灵感", reversed: "控制欲，占有欲", description: "象征着创造力和热情，能够激发他人的灵感。" },
    { id: 114, name: "权杖国王", suit: "权杖", upright: "领导力，创造力，热情", reversed: "独裁，傲慢", description: "代表强大的领导力和创造力，能够实现目标。" },

    // 圣杯牌组 (1-10, 侍从, 骑士, 王后, 国王)
    { id: 201, name: "圣杯Ace", suit: "圣杯", upright: "新的感情，情感的开始", reversed: "情感封闭，错过机会", description: "代表新的感情和情感的开始，可能是一段关系的萌芽。" },
    { id: 202, name: "圣杯2", suit: "圣杯", upright: "平衡，伙伴关系，爱情", reversed: "不平衡的关系，依赖", description: "象征着平衡的伙伴关系和爱情，双方平等给予和接受。" },
    { id: 203, name: "圣杯3", suit: "圣杯", upright: "庆祝，友谊，喜悦", reversed: "过度放纵，浅薄的关系", description: "代表庆祝和友谊，与他人分享喜悦。" },
    { id: 204, name: "圣杯4", suit: "圣杯", upright: "反思，不满，选择", reversed: "错过机会，冷漠", description: "象征着反思和不满，需要重新评估自己的需求。" },
    { id: 205, name: "圣杯5", suit: "圣杯", upright: "失落，悲伤，后悔", reversed: "接受损失，向前看", description: "代表失落和悲伤，需要接受过去并继续前进。" },
    { id: 206, name: "圣杯6", suit: "圣杯", upright: "怀旧，回忆，童年", reversed: "停滞在过去，不成熟", description: "象征着怀旧和回忆，可能与童年或过去的关系有关。" },
    { id: 207, name: "圣杯7", suit: "圣杯", upright: "选择，幻想，可能性", reversed: "不切实际的期望，犹豫不决", description: "代表面临多种选择和可能性，需要分清现实与幻想。" },
    { id: 208, name: "圣杯8", suit: "圣杯", upright: "离开，寻找，精神追求", reversed: "逃避，犹豫不决", description: "象征着离开不满意的情况，寻找更高的目标。" },
    { id: 209, name: "圣杯9", suit: "圣杯", upright: "满足，成就，愿望达成", reversed: "物质主义，自我中心", description: "代表满足和成就，愿望得到实现。" },
    { id: 210, name: "圣杯10", suit: "圣杯", upright: "和谐，幸福，家庭", reversed: "家庭冲突，不和谐", description: "象征着和谐的家庭关系和幸福的生活。" },
    { id: 211, name: "圣杯侍从", suit: "圣杯", upright: "新的感情，直觉，创造力", reversed: "不成熟的感情，情绪不稳定", description: "代表新的感情和直觉，可能带来创意和灵感。" },
    { id: 212, name: "圣杯骑士", suit: "圣杯", upright: "浪漫，爱情，敏感", reversed: "不切实际的浪漫，犹豫不决", description: "象征着浪漫和敏感，可能带来新的爱情或感情上的变化。" },
    { id: 213, name: "圣杯王后", suit: "圣杯", upright: "爱，情感，直觉", reversed: "情绪化，依赖", description: "代表爱和情感的深度，能够理解和同情他人。" },
    { id: 214, name: "圣杯国王", suit: "圣杯", upright: "情感成熟，智慧，慈悲", reversed: "情感冷漠，优柔寡断", description: "象征着情感上的成熟和智慧，能够平衡理性和情感。" },

    // 宝剑牌组 (1-10, 侍从, 骑士, 王后, 国王)
    { id: 301, name: "宝剑Ace", suit: "宝剑", upright: "清晰，新的想法，突破", reversed: "混乱，误解，暴力", description: "代表清晰的思维和新的想法，可能带来突破和解决问题的能力。" },
    { id: 302, name: "宝剑2", suit: "宝剑", upright: "选择，平衡，犹豫不决", reversed: "逃避选择，不平衡", description: "象征着面临选择时的犹豫不决，需要找到平衡。" },
    { id: 303, name: "宝剑3", suit: "宝剑", upright: "悲伤，分离，心痛", reversed: "克服悲伤，原谅", description: "代表悲伤和分离，可能是心痛或失望的结果。" },
    { id: 304, name: "宝剑4", suit: "宝剑", upright: "休息，反思，恢复", reversed: "拖延，逃避现实", description: "象征着休息和反思，为未来的行动做准备。" },
    { id: 305, name: "宝剑5", suit: "宝剑", upright: "冲突，胜利，妥协", reversed: "失败，后悔，不和谐", description: "代表冲突和竞争，可能需要妥协或面对失败。" },
    { id: 306, name: "宝剑6", suit: "宝剑", upright: "过渡，旅行，离开", reversed: "延迟，停滞", description: "象征着过渡和旅行，离开困难的情况。" },
    { id: 307, name: "宝剑7", suit: "宝剑", upright: "欺骗，策略，秘密行动", reversed: "被发现，内疚", description: "代表欺骗和策略，可能需要秘密行动或谨慎行事。" },
    { id: 308, name: "宝剑8", suit: "宝剑", upright: "限制，被困，自我束缚", reversed: "突破限制，解放", description: "象征着限制和被困，可能是自我施加的束缚。" },
    { id: 309, name: "宝剑9", suit: "宝剑", upright: "焦虑，恐惧，噩梦", reversed: "克服恐惧，乐观", description: "代表焦虑和恐惧，可能是噩梦或担忧的结果。" },
    { id: 310, name: "宝剑10", suit: "宝剑", upright: "结束，失败，毁灭", reversed: "触底反弹，重建", description: "象征着结束和失败，可能是彻底的毁灭或转折点。" },
    { id: 311, name: "宝剑侍从", suit: "宝剑", upright: "消息，想法，好奇心", reversed: "谣言，误解，不成熟", description: "代表消息和新的想法，可能带来好奇心和学习的机会。" },
    { id: 312, name: "宝剑骑士", suit: "宝剑", upright: "行动，思想敏捷，果断", reversed: "鲁莽，冲动，攻击性", description: "象征着快速的行动和思想敏捷，可能带来果断的决策。" },
    { id: 313, name: "宝剑王后", suit: "宝剑", upright: "智慧，清晰，公正", reversed: "冷酷，批评，无情", description: "代表智慧和清晰的思维，能够公正地判断情况。" },
    { id: 314, name: "宝剑国王", suit: "宝剑", upright: "智慧，权威，公正", reversed: "专制，无情，偏见", description: "象征着智慧和权威，能够公正地领导和决策。" },

    // 钱币牌组 (1-10, 侍从, 骑士, 王后, 国王)
    { id: 401, name: "钱币Ace", suit: "钱币", upright: "物质机会，财务开始", reversed: "错过机会，财务困难", description: "代表物质上的机会和财务上的开始，可能是新的收入来源。" },
    { id: 402, name: "钱币2", suit: "钱币", upright: "平衡，资源分配，选择", reversed: "不平衡，财务问题", description: "象征着平衡和资源分配，需要在不同的责任之间找到平衡。" },
    { id: 403, name: "钱币3", suit: "钱币", upright: "合作，技能发展，团队工作", reversed: "缺乏合作，工作效率低下", description: "代表合作和技能发展，团队工作带来的进步。" },
    { id: 404, name: "钱币4", suit: "钱币", upright: "稳定，安全，保守", reversed: "吝啬，贪婪，过度保护", description: "象征着稳定和安全，可能是财务上的保守态度。" },
    { id: 405, name: "钱币5", suit: "钱币", upright: "贫困，缺乏，困难", reversed: "克服困难，改善财务", description: "代表贫困和缺乏，可能是经济上的困难时期。" },
    { id: 406, name: "钱币6", suit: "钱币", upright: "给予，慈善，分享财富", reversed: "不平衡的给予，剥削", description: "象征着给予和分享财富，可能是慈善或帮助他人。" },
    { id: 407, name: "钱币7", suit: "钱币", upright: "努力，收获，耐心", reversed: "延迟回报，急躁", description: "代表努力和收获，需要耐心等待成果。" },
    { id: 408, name: "钱币8", suit: "钱币", upright: "技能发展，工作，专注", reversed: "缺乏专注，效率低下", description: "象征着技能发展和专注工作，提高专业能力。" },
    { id: 409, name: "钱币9", suit: "钱币", upright: "独立，富足，享受", reversed: "过度放纵，物质主义", description: "代表独立和富足，能够享受自己的劳动成果。" },
    { id: 410, name: "钱币10", suit: "钱币", upright: "财富，遗产，稳定", reversed: "不稳定，失去财富", description: "象征着财富和遗产，长期的稳定和安全。" },
    { id: 411, name: "钱币侍从", suit: "钱币", upright: "新的财务机会，学习", reversed: "错过机会，不成熟", description: "代表新的财务机会和学习，可能是开始学习理财或新的工作。" },
    { id: 412, name: "钱币骑士", suit: "钱币", upright: "财务稳定，保守，务实", reversed: "鲁莽的投资，物质主义", description: "象征着财务上的稳定和务实，可能是谨慎的投资或决策。" },
    { id: 413, name: "钱币王后", suit: "钱币", upright: "富足，稳定，慷慨", reversed: "吝啬，物质主义，控制欲", description: "代表富足和稳定，能够慷慨地分享财富和资源。" },
    { id: 414, name: "钱币国王", suit: "钱币", upright: "成功，富足，责任", reversed: "贪婪，独裁，物质主义", description: "象征着成功和富足，能够负责任地管理财富和资源。" }
];

// 合并所有塔罗牌数据
export const allTarotCards = [...majorArcana, ...minorArcana];

// 塔罗牌阵类型
export const spreadTypes = [
    {
        id: "three-card",
        name: "三张牌阵",
        description: "简单而有效的牌阵，用于快速洞察过去、现在和未来。",
        positions: [
            { id: 1, name: "过去", description: "过去的影响和事件" },
            { id: 2, name: "现在", description: "当前的情况和状态" },
            { id: 3, name: "未来", description: "可能的发展和结果" }
        ],
        cardCount: 3
    },
    {
        id: "five-card",
        name: "五张牌阵",
        description: "更全面的牌阵，提供问题的多角度分析。",
        positions: [
            { id: 1, name: "现状", description: "问题的核心和当前情况" },
            { id: 2, name: "障碍", description: "阻碍前进的因素" },
            { id: 3, name: "建议", description: "应对问题的建议和指导" },
            { id: 4, name: "机会", description: "潜在的机会和可能性" },
            { id: 5, name: "结果", description: "可能的最终结果" }
        ],
        cardCount: 5
    },
    {
        id: "celtic-cross",
        name: "凯尔特十字",
        description: "最完整的牌阵，提供全面的问题分析和未来预测。",
        positions: [
            { id: 1, name: "现状", description: "问题的核心和当前情况" },
            { id: 2, name: "障碍", description: "阻碍前进的因素" },
            { id: 3, name: "潜意识", description: "隐藏的影响和潜意识因素" },
            { id: 4, name: "过去", description: "过去的影响和事件" },
            { id: 5, name: "未来", description: "可能的发展和结果" },
            { id: 6, name: "近期", description: "即将发生的事情" },
            { id: 7, name: "自我", description: "你的态度和立场" },
            { id: 8, name: "环境", description: "外部环境和周围人的影响" },
            { id: 9, name: "希望与恐惧", description: "你的期望和担忧" },
            { id: 10, name: "结果", description: "最终可能的结果" }
        ],
        cardCount: 10
    }
];