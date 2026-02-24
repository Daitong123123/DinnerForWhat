using System;
using UnityEngine;

// 食材类型枚举
public enum IngredientType
{
    Vegetable,      // 蔬菜
    Meat,           // 肉类
    Seafood,        // 海鲜/鱼类
    Seasoning,      // 调料
    Grain,          // 主食/谷物
    Other           // 其他
}

// 食材获取途径枚举
[Flags]
public enum IngredientSource
{
    Shop = 1,       // 商店购买
    Fishing = 2,    // 钓鱼获得
    HomeGrown = 4,  // 家里种植
    Reward = 8      // 任务奖励
}

// 食材数据模型（可序列化）
[Serializable]
public class Ingredient
{
    public string IngredientId;            // 食材唯一ID
    public string IngredientName;          // 食材名称
    public IngredientType Type;            // 食材类型
    public IngredientSource Source;        // 获取途径
    public int PurchasePrice;              // 购买价格
    public float Weight;                   // 单份重量（用于载具载重）
    public int FreshnessDuration;          // 新鲜度时长（游戏内分钟）
    public Sprite IngredientSprite;        // 食材Sprite（关联美术资源）
    public bool IsUnlocked;                // 是否解锁（部分稀有食材需解锁）
}