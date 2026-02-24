using UnityEngine;
using System.Collections.Generic;

public class PlayerDataManager : MonoBehaviour
{
    // 单例实例
    public static PlayerDataManager Instance { get; private set; }

    // 玩家数据实例
    public PlayerData CurrentPlayerData { get; private set; }

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
            // 初始化玩家数据
            CurrentPlayerData = new PlayerData();
            // 初始解锁基础食谱和厨具
            InitBasicData();
        }
    }

    // 初始化基础数据（新手初始资源）
    private void InitBasicData()
    {
        // 初始金币
        CurrentPlayerData.Gold = 100;
        // 初始解锁基础食谱
        CurrentPlayerData.UnlockedRecipes.Add("fried_egg");
        CurrentPlayerData.UnlockedRecipes.Add("noodles");
        // 初始拥有基础厨具
        CurrentPlayerData.OwnedKitchenTools.Add("knife");
        CurrentPlayerData.OwnedKitchenTools.Add("cutting_board");
        CurrentPlayerData.OwnedKitchenTools.Add("pan");
        // 初始食材库存
        AddIngredientToInventory("egg", 10, 0.1f);
        AddIngredientToInventory("noodle", 5, 0.2f);
        AddIngredientToInventory("oil", 3, 0.5f);
    }

    /// <summary>
    /// 添加食材到库存
    /// </summary>
    /// <param name="ingredientId">食材ID</param>
    /// <param name="quantity">数量</param>
    /// <param name="singleWeight">单重</param>
    public void AddIngredientToInventory(string ingredientId, int quantity, float singleWeight)
    {
        // 检查是否已有该食材
        var existingIngredient = CurrentPlayerData.IngredientInventory.Find(x => x.IngredientId == ingredientId);
        if (existingIngredient != null)
        {
            existingIngredient.Quantity += quantity;
        }
        else
        {
            CurrentPlayerData.IngredientInventory.Add(new IngredientInventory
            {
                IngredientId = ingredientId,
                Quantity = quantity,
                Weight = singleWeight
            });
        }

        // 触发金币变更事件（若为购买食材则会先扣金币）
        GameEventSystem.Instance.TriggerEvent(GameEventSystem.EventNames.GoldChanged, CurrentPlayerData.Gold);
    }

    /// <summary>
    /// 消耗食材（制作菜品时调用）
    /// </summary>
    /// <param name="ingredientId">食材ID</param>
    /// <param name="quantity">消耗数量</param>
    /// <returns>是否消耗成功</returns>
    public bool ConsumeIngredient(string ingredientId, int quantity)
    {
        var existingIngredient = CurrentPlayerData.IngredientInventory.Find(x => x.IngredientId == ingredientId);
        if (existingIngredient == null || existingIngredient.Quantity < quantity)
        {
            Debug.LogError($"食材不足：{ingredientId} 剩余{existingIngredient?.Quantity ?? 0}，需要{quantity}");
            return false;
        }

        existingIngredient.Quantity -= quantity;
        if (existingIngredient.Quantity <= 0)
        {
            CurrentPlayerData.IngredientInventory.Remove(existingIngredient);
        }

        return true;
    }

    /// <summary>
    /// 更新金币数量
    /// </summary>
    /// <param name="amount">变动量（正数=增加，负数=减少）</param>
    public void UpdateGold(int amount)
    {
        CurrentPlayerData.Gold += amount;
        // 确保金币不为负
        CurrentPlayerData.Gold = Mathf.Max(0, CurrentPlayerData.Gold);
        // 触发金币变更事件
        GameEventSystem.Instance.TriggerEvent(GameEventSystem.EventNames.GoldChanged, CurrentPlayerData.Gold);
    }

    /// <summary>
    /// 解锁新食谱
    /// </summary>
    /// <param name="recipeId">食谱ID</param>
    public void UnlockRecipe(string recipeId)
    {
        if (!CurrentPlayerData.UnlockedRecipes.Contains(recipeId))
        {
            CurrentPlayerData.UnlockedRecipes.Add(recipeId);
            Debug.Log($"解锁新食谱：{recipeId}");
        }
    }

    /// <summary>
    /// 记录当日交易
    /// </summary>
    /// <param name="date">游戏日期</param>
    /// <param name="earnings">收入</param>
    /// <param name="expenses">支出</param>
    public void RecordTransaction(string date, int earnings, int expenses)
    {
        var record = new TransactionRecord
        {
            Date = date,
            Earnings = earnings,
            Expenses = expenses,
            NetProfit = earnings - expenses,
            CustomerCount = CurrentPlayerData.TodayServedCustomers
        };

        CurrentPlayerData.TransactionHistory.Add(record);
        // 重置当日数据
        CurrentPlayerData.TodayEarnings = 0;
        CurrentPlayerData.TodayServedCustomers = 0;
        CurrentPlayerData.TodayGoodReviews = 0;
        CurrentPlayerData.TodayBadReviews = 0;
    }
}