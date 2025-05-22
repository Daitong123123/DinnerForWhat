// readingSpreads.js
import { spreadTypes } from './tarotData.js';

// 塔罗牌阵布局定义
export const readingSpreads = {
    "three-card": {
        name: "三张牌阵",
        description: "简单而有效的牌阵，用于快速洞察过去、现在和未来。",
        positions: [
            { id: 1, name: "过去", description: "过去的影响和事件" },
            { id: 2, name: "现在", description: "当前的情况和状态" },
            { id: 3, name: "未来", description: "可能的发展和结果" }
        ],
        cardCount: 3,
        layout: {
            1: { x: -1.5, y: 0, rotation: 0 },
            2: { x: 0, y: 0, rotation: 0 },
            3: { x: 1.5, y: 0, rotation: 0 }
        }
    },
    "five-card": {
        name: "五张牌阵",
        description: "更全面的牌阵，提供问题的多角度分析。",
        positions: [
            { id: 1, name: "现状", description: "问题的核心和当前情况" },
            { id: 2, name: "障碍", description: "阻碍前进的因素" },
            { id: 3, name: "建议", description: "应对问题的建议和指导" },
            { id: 4, name: "机会", description: "潜在的机会和可能性" },
            { id: 5, name: "结果", description: "可能的最终结果" }
        ],
        cardCount: 5,
        layout: {
            1: { x: 0, y: 0, rotation: 0 },
            2: { x: -1.5, y: -1.5, rotation: 0 },
            3: { x: 1.5, y: -1.5, rotation: 0 },
            4: { x: -1.5, y: 1.5, rotation: 0 },
            5: { x: 1.5, y: 1.5, rotation: 0 }
        }
    },
    "celtic-cross": {
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
        cardCount: 10,
        layout: {
            1: { x: 0, y: 0, rotation: 0 },
            2: { x: 0, y: 0, rotation: 90 },
            3: { x: 0, y: -1.5, rotation: 0 },
            4: { x: -1.5, y: 0, rotation: 0 },
            5: { x: 1.5, y: 0, rotation: 0 },
            6: { x: 0, y: 1.5, rotation: 0 },
            7: { x: -2, y: -2, rotation: 0 },
            8: { x: 2, y: -2, rotation: 0 },
            9: { x: -2, y: 2, rotation: 0 },
            10: { x: 2, y: 2, rotation: 0 }
        }
    }
};