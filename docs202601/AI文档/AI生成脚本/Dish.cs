using System;
using UnityEngine;

// 成品菜品数据模型（可序列化）
[Serializable]
public class Dish
{
    public string DishId { get; set; } // 菜品唯一ID（自动生成）
    public string RecipeId { get; set; } // 关联食谱ID
    public float DishScore { get; set; } // 菜品评分（0-100）
    public string CreateTime { get; set; } // 制作时间
    public bool IsServed { get; set; } // 是否已上菜

    // 构造函数
    public Dish()
    {
        DishId = Guid.NewGuid().ToString(); // 自动生成唯一ID
        IsServed = false;
    }
}