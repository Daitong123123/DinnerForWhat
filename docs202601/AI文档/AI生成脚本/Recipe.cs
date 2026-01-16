using System;
using System.Collections.Generic;
using UnityEngine;

// 烹饪步骤类型枚举
public enum CookingStepType
{
    Cut,        // 切菜（需要菜刀+砧板）
    Fry,        // 煎（需要平底锅）
    Boil,       // 煮（需要汤锅）
    Bake,       // 烤（需要烤箱）
    AddSeasoning,// 加调料
    Serve       // 上菜
}

// 单步烹饪要求（可序列化）
[Serializable]
public class CookingStepRequirement
{
    public string KitchenToolId; // 所需厨具ID
    public float StepTime;       // 步骤耗时（游戏内秒数）
    public List<string> RequiredIngredientIds; // 步骤所需食材ID
}

// 单条烹饪步骤（可序列化）
[Serializable]
public class CookingStep
{
    public string StepId;                  // 步骤ID
    public CookingStepType StepType;       // 步骤类型
    public string StepDescription;         // 步骤描述（如"切西红柿"）
    public CookingStepRequirement Requirement; // 步骤要求
    public bool IsCompleted;               // 是否完成
}

// 食谱数据模型（可序列化）
[Serializable]
public class Recipe
{
    public string RecipeId;                // 食谱唯一ID
    public string RecipeName;              // 菜品名称
    public int Price;                      // 售价
    public float ScoreWeightTime;          // 耗时评分权重
    public float ScoreWeightAccuracy;      // 步骤准确率权重
    public List<CookingStep> CookingSteps; // 烹饪步骤列表
    public List<string> TotalRequiredIngredients; // 总所需食材ID列表
    public float TotalDishWeight;          // 成品重量（用于载具展示）
    public Sprite RecipeIcon;              // 食谱图标（关联美术资源）
    public Sprite DishSprite;              // 成品菜品Sprite
}