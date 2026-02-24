using System;
using UnityEngine;

// 订单数据模型（可序列化）
[Serializable]
public class Order
{
    public string OrderId { get; set; } // 订单唯一ID
    public string CustomerId { get; set; } // 关联顾客ID
    public string RecipeId { get; set; } // 需求食谱ID
    public float OrderCreateTime { get; set; } // 订单创建时间（游戏时间戳）
    public float MaxWaitTime { get; set; } // 最大等待时间（游戏内秒数）
    public bool IsCompleted { get; set; } // 是否完成
    public bool IsPriority { get; set; } // 是否为优先订单（第一个顾客）

    // 构造函数
    public Order()
    {
        OrderId = Guid.NewGuid().ToString();
        IsCompleted = false;
        IsPriority = false;
        // 默认最大等待时间60秒（可根据难度调整）
        MaxWaitTime = 60f;
    }

    /// <summary>
    /// 获取订单剩余等待时间百分比
    /// </summary>
    /// <param name="currentWaitTime">当前剩余等待时间</param>
    /// <returns>0-1的百分比</returns>
    public float GetWaitTimePercentage(float currentWaitTime)
    {
        return Mathf.Clamp01(currentWaitTime / MaxWaitTime);
    }
}