using System.Collections.Generic;
using UnityEngine;

public class RecipeManager : MonoBehaviour
{
    // 单例实例
    public static RecipeManager Instance { get; private set; }

    // 所有食谱配置表（在Inspector中配置）
    public List<Recipe> AllRecipes;

    // 已加载的食谱字典（ID->Recipe）
    private Dictionary<string, Recipe> recipeDictionary;

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
            InitRecipeDictionary();
        }
    }

    // 初始化食谱字典
    private void InitRecipeDictionary()
    {
        recipeDictionary = new Dictionary<string, Recipe>();
        foreach (var recipe in AllRecipes)
        {
            if (!recipeDictionary.ContainsKey(recipe.RecipeId))
            {
                recipeDictionary.Add(recipe.RecipeId, recipe);
            }
            else
            {
                Debug.LogError($"重复的食谱ID：{recipe.RecipeId}，请检查配置表");
            }
        }
    }

    /// <summary>
    /// 检查食谱是否已解锁
    /// </summary>
    /// <param name="recipeId">食谱ID</param>
    /// <returns>是否解锁</returns>
    public bool IsRecipeUnlocked(string recipeId)
    {
        return PlayerDataManager.Instance.CurrentPlayerData.UnlockedRecipes.Contains(recipeId);
    }

    /// <summary>
    /// 解锁食谱（需扣除金币）
    /// </summary>
    /// <param name="recipeId">食谱ID</param>
    /// <returns>是否解锁成功</returns>
    public bool UnlockRecipe(string recipeId)
    {
        // 检查食谱是否存在
        if (!recipeDictionary.ContainsKey(recipeId))
        {
            Debug.LogError($"食谱ID不存在：{recipeId}");
            return false;
        }

        // 检查是否已解锁
        if (IsRecipeUnlocked(recipeId))
        {
            Debug.Log($"食谱已解锁：{recipeId}");
            return true;
        }

        var recipe = recipeDictionary[recipeId];
        // 简化处理：食谱解锁价格暂定为售价的2倍（可自定义）
        int unlockPrice = recipe.Price * 2;

        // 检查金币是否足够
        if (PlayerDataManager.Instance.CurrentPlayerData.Gold < unlockPrice)
        {
            Debug.LogError($"金币不足，解锁食谱{recipeId}需要{unlockPrice}金币，当前{PlayerDataManager.Instance.CurrentPlayerData.Gold}");
            return false;
        }

        // 扣除金币
        PlayerDataManager.Instance.UpdateGold(-unlockPrice);
        // 解锁食谱
        PlayerDataManager.Instance.UnlockRecipe(recipeId);
        
        Debug.Log($"成功解锁食谱：{recipe.RecipeName}，消耗{unlockPrice}金币");
        return true;
    }

    /// <summary>
    /// 获取食谱数据
    /// </summary>
    /// <param name="recipeId">食谱ID</param>
    /// <returns>食谱数据（null=不存在）</returns>
    public Recipe GetRecipe(string recipeId)
    {
        if (recipeDictionary.TryGetValue(recipeId, out var recipe))
        {
            return recipe;
        }
        return null;
    }

    /// <summary>
    /// 获取所有已解锁的食谱列表
    /// </summary>
    /// <returns>已解锁食谱列表</returns>
    public List<Recipe> GetUnlockedRecipes()
    {
        List<Recipe> unlockedRecipes = new List<Recipe>();
        foreach (var recipeId in PlayerDataManager.Instance.CurrentPlayerData.UnlockedRecipes)
        {
            var recipe = GetRecipe(recipeId);
            if (recipe != null)
            {
                unlockedRecipes.Add(recipe);
            }
        }
        return unlockedRecipes;
    }

    /// <summary>
    /// 检查制作食谱的食材是否充足
    /// </summary>
    /// <param name="recipeId">食谱ID</param>
    /// <returns>是否充足</returns>
    public bool CheckIngredientEnough(string recipeId)
    {
        var recipe = GetRecipe(recipeId);
        if (recipe == null) return false;

        foreach (var ingredientId in recipe.TotalRequiredIngredients)
        {
            // 检查食材库存
            var inventoryItem = PlayerDataManager.Instance.CurrentPlayerData.IngredientInventory.Find(x => x.IngredientId == ingredientId);
            if (inventoryItem == null || inventoryItem.Quantity <= 0)
            {
                Debug.LogError($"食材不足：{ingredientId}");
                return false;
            }
        }

        return true;
    }
}