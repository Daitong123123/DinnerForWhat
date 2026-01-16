using System;
using System.Collections.Generic;
using UnityEngine;

// 载具数据模型（可序列化）
[Serializable]
public class Vehicle
{
    public string VehicleId { get; set; } // 载具唯一ID
    public string VehicleName { get; set; } // 载具名称
    public int PurchasePrice { get; set; } // 购买价格
    public float MaxWeight { get; set; } // 最大载重
    public List<string> AllowedToolIds { get; set; } // 可搭载的厨具ID列表
    public int MaxToolCount { get; set; } // 最大厨具数量
    public Sprite VehicleSprite { get; set; } // 载具Sprite（关联美术资源）
    public Sprite TableclothSprite { get; set; } // 配套桌布Sprite
    public bool IsUnlocked { get; set; } // 是否解锁

    // 构造函数
    public Vehicle()
    {
        AllowedToolIds = new List<string>();
        IsUnlocked = false;
    }

    /// <summary>
    /// 计算当前已用载重（需结合玩家库存）
    /// </summary>
    /// <returns>已用载重</returns>
    public float CalculateUsedWeight()
    {
        float totalWeight = 0;

        // 1. 食材重量
        foreach (var ing in PlayerDataManager.Instance.CurrentPlayerData.IngredientInventory)
        {
            totalWeight += ing.Weight * ing.Quantity;
        }

        // 2. 厨具重量
        foreach (var toolId in PlayerDataManager.Instance.CurrentPlayerData.OwnedKitchenTools)
        {
            var tool = KitchenToolManager.Instance.GetKitchenTool(toolId);
            if (tool != null)
            {
                totalWeight += tool.Weight;
            }
        }

        return totalWeight;
    }

    /// <summary>
    /// 获取剩余载重
    /// </summary>
    /// <returns>剩余载重</returns>
    public float GetRemainingWeight()
    {
        return MaxWeight - CalculateUsedWeight();
    }

    /// <summary>
    /// 检查是否可添加指定重量
    /// </summary>
    /// <param name="weight">需要的重量</param>
    /// <returns>是否可以</returns>
    public bool CanAddWeight(float weight)
    {
        return GetRemainingWeight() >= weight;
    }
}