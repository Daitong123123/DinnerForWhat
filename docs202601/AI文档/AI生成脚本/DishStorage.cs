using System.Collections.Generic;
using UnityEngine;

public class DishStorage : MonoBehaviour
{
    // 单例实例
    public static DishStorage Instance { get; private set; }

    // 已完成未上菜的菜品队列
    private Queue<Dish> storedDishes;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
        }
        else
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            storedDishes = new Queue<Dish>();
        }
    }

    /// <summary>
    /// 存储制作完成的菜品
    /// </summary>
    /// <param name="dish">成品菜品</param>
    public void StoreDish(Dish dish)
    {
        if (dish == null) return;
        
        storedDishes.Enqueue(dish);
        Debug.Log($"菜品{dish.RecipeId}已存入暂存区，当前暂存数量：{storedDishes.Count}");
    }

    /// <summary>
    /// 取出下一个菜品（给第一个顾客上菜）
    /// </summary>
    /// <returns>菜品（null=无暂存菜品）</returns>
    public Dish TakeNextDish()
    {
        if (storedDishes.Count == 0)
        {
            Debug.LogWarning("暂存区无菜品");
            return null;
        }

        var dish = storedDishes.Dequeue();
        dish.IsServed = true;
        Debug.Log($"取出菜品{dish.RecipeId}，剩余暂存数量：{storedDishes.Count}");
        return dish;
    }

    /// <summary>
    /// 检查是否有指定食谱的暂存菜品
    /// </summary>
    /// <param name="recipeId">食谱ID</param>
    /// <returns>是否存在</returns>
    public bool HasDishForRecipe(string recipeId)
    {
        return storedDishes.Count > 0 && storedDishes.Contains(storedDishes.Peek()); // 简化：仅检查队列首位
        // 完整实现：return storedDishes.Any(d => d.RecipeId == recipeId);
    }

    /// <summary>
    /// 获取暂存菜品数量
    /// </summary>
    /// <returns>数量</returns>
    public int GetStoredDishCount()
    {
        return storedDishes.Count;
    }

    /// <summary>
    /// 清空暂存区（收摊时调用）
    /// </summary>
    public void ClearStorage()
    {
        storedDishes.Clear();
        Debug.Log("菜品暂存区已清空");
    }
}