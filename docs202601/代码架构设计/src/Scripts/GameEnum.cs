using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


// 食物操作类型枚举（保持不变）
[Serializable]
public enum FoodOperationType
{
    None,           // 无操作（默认）
    Stir,           // 搅拌
    Boil,           // 煮
    Fry,            // 煎
    Cut,            // 切
    Steam,          // 蒸
    Bake            // 烤
}
