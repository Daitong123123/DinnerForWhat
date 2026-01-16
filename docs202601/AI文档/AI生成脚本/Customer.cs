using System;
using UnityEngine;

// 顾客状态枚举
public enum CustomerState
{
    Waiting,        // 等待上菜
    Served,         // 已上菜
    Left,           // 离开（超时/差评）
    Completed       // 完成（付款+评价）
}

// 顾客数据模型（可序列化）
[Serializable]
public class Customer
{
    public string CustomerId { get; set; } // 顾客唯一ID
    public string CustomerName { get; set; } // 顾客名称（显示用）
    public Sprite CustomerSprite { get; set; } // 顾客形象
    public Order CustomerOrder { get; set; } // 顾客订单
    public CustomerState State { get; set; } // 顾客状态
    public float WaitTime { get; set; } // 剩余等待时间（游戏内秒数）
    public bool IsPriority { get; set; } // 是否为优先顾客（第一个）

    // 构造函数
    public Customer()
    {
        CustomerId = Guid.NewGuid().ToString();
        State = CustomerState.Waiting;
        IsPriority = false;
    }

    /// <summary>
    /// 更新顾客等待时间
    /// </summary>
    /// <param name="deltaTime">流逝时间</param>
    /// <returns>是否超时</returns>
    public bool UpdateWaitTime(float deltaTime)
    {
        if (State != CustomerState.Waiting) return false;

        WaitTime -= deltaTime;
        if (WaitTime <= 0)
        {
            State = CustomerState.Left;
            return true;
        }
        return false;
    }

    /// <summary>
    /// 为顾客上菜
    /// </summary>
    /// <param name="dish">菜品</param>
    /// <returns>是否匹配订单</returns>
    public bool ServeDish(Dish dish)
    {
        if (State != CustomerState.Waiting) return false;

        bool isMatch = dish.RecipeId == CustomerOrder.RecipeId;
        if (isMatch)
        {
            State = CustomerState.Served;
            CustomerOrder.IsCompleted = true;
        }
        return isMatch;
    }

    /// <summary>
    /// 完成顾客交互（付款+评价）
    /// </summary>
    /// <param name="dishScore">菜品评分</param>
    public void CompleteInteraction(float dishScore)
    {
        if (State != CustomerState.Served) return;

        State = CustomerState.Completed;
        // 后续由PaymentSystem和EvaluationSystem处理付款和评价
    }
}