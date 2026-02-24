using System;
using UnityEngine;

// 厨具类型枚举
public enum KitchenToolType
{
    Knife,          // 菜刀
    CuttingBoard,   // 砧板
    Pan,            // 平底锅
    Pot,            // 汤锅
    Oven,           // 烤箱
    SeasoningBottle // 调料瓶
}

// 厨具数据模型（可序列化）
[System.Serializable]
public class KitchenTool
{
    public string ToolId; // 厨具ID
    public string ToolName; // 厨具名称
    public string Description; // 描述
    public int PurchasePrice; // 购买价格
    public Sprite ToolSprite; // 厨具图标
    public float Weight; // 重量
    public List<string> SuitableRecipes; // 适用的食谱ID列表（修复List<>报错）
    public float EfficiencyBonus; // 效率加成（减少烹饪时间）
}