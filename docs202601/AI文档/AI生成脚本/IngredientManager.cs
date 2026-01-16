using System.Collections.Generic;
using UnityEngine;

public class IngredientManager : MonoBehaviour
{
    // 单例实例
    public static IngredientManager Instance { get; private set; }

    // 所有食材配置表（Inspector中配置）
    public List<Ingredient> AllIngredients;

    // 食材字典（ID->Ingredient）
    private Dictionary<string, Ingredient> ingredientDictionary;

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
            InitIngredientDictionary();
        }
    }

    // 初始化食材字典
    private void InitIngredientDictionary()
    {
        ingredientDictionary = new Dictionary<string, Ingredient>();
        foreach (var ingredient in AllIngredients)
        {
            if (!ingredientDictionary.ContainsKey(ingredient.IngredientId))
            {
                ingredientDictionary.Add(ingredient.IngredientId, ingredient);
            }
            else
            {
                Debug.LogError($"重复食材ID：{ingredient.IngredientId}");
            }
        }
    }

    /// <summary>
    /// 购买食材（校验载具载重）
    /// </summary>
    /// <param name="ingredientId">食材ID</param>
    /// <param name="quantity">购买数量</param>
    /// <returns>是否购买成功</returns>
    public bool PurchaseIngredient(string ingredientId, int quantity)
    {
        // 1. 校验食材是否存在
        if (!ingredientDictionary.ContainsKey(ingredientId))
        {
            Debug.LogError($"食材ID不存在：{ingredientId}");
            return false;
        }

        var ingredient = ingredientDictionary[ingredientId];
        // 2. 校验金币是否足够
        int totalPrice = ingredient.PurchasePrice * quantity;
        if (PlayerDataManager.Instance.CurrentPlayerData.Gold < totalPrice)
        {
            Debug.LogError($"金币不足：购买{quantity}份{ingredient.IngredientName}需要{totalPrice}金币");
            return false;
        }

        // 3. 校验载具载重（需结合VehicleManager，此处先实现基础逻辑）
        float totalWeight = ingredient.Weight * quantity;
        if (!CheckVehicleWeightEnough(totalWeight))
        {
            Debug.LogError($"载具载重不足：购买{quantity}份{ingredient.IngredientName}需{totalWeight}重量，剩余载重不足");
            return false;
        }

        // 4. 扣除金币
        PlayerDataManager.Instance.UpdateGold(-totalPrice);
        // 5. 添加到库存
        PlayerDataManager.Instance.AddIngredientToInventory(ingredientId, quantity, ingredient.Weight);
        
        Debug.Log($"成功购买{quantity}份{ingredient.IngredientName}，消耗{totalPrice}金币");
        return true;
    }

    /// <summary>
    /// 消耗食材（制作菜品）
    /// </summary>
    /// <param name="ingredientId">食材ID</param>
    /// <param name="quantity">消耗数量</param>
    /// <returns>是否消耗成功</returns>
    public bool ConsumeIngredient(string ingredientId, int quantity)
    {
        return PlayerDataManager.Instance.ConsumeIngredient(ingredientId, quantity);
    }

    /// <summary>
    /// 批量消耗食材（制作整道菜品）
    /// </summary>
    /// <param name="recipeId">食谱ID</param>
    /// <returns>是否消耗成功</returns>
    public bool ConsumeRecipeIngredients(string recipeId)
    {
        var recipe = RecipeManager.Instance.GetRecipe(recipeId);
        if (recipe == null) return false;

        // 先校验所有食材是否充足
        foreach (var ingId in recipe.TotalRequiredIngredients)
        {
            var inventoryItem = PlayerDataManager.Instance.CurrentPlayerData.IngredientInventory.Find(x => x.IngredientId == ingId);
            if (inventoryItem == null || inventoryItem.Quantity <= 0)
            {
                Debug.LogError($"食材{ingId}不足，无法制作{recipe.RecipeName}");
                return false;
            }
        }

        // 批量消耗
        foreach (var ingId in recipe.TotalRequiredIngredients)
        {
            ConsumeIngredient(ingId, 1); // 简化：每份菜品消耗1份食材，可扩展为多份
        }

        return true;
    }

    /// <summary>
    /// 检查载具剩余载重是否足够（占位方法，后续对接VehicleManager）
    /// </summary>
    /// <param name="needWeight">需要的重量</param>
    /// <returns>是否足够</returns>
    private bool CheckVehicleWeightEnough(float needWeight)
    {
        // 临时实现：默认返回true，后续替换为真实载重计算
        return true;
    }

    /// <summary>
    /// 获取食材数据
    /// </summary>
    /// <param name="ingredientId">食材ID</param>
    /// <returns>食材数据</returns>
    public Ingredient GetIngredient(string ingredientId)
    {
        if (ingredientDictionary.TryGetValue(ingredientId, out var ing))
        {
            return ing;
        }
        return null;
    }

    /// <summary>
    /// 获取食材库存数量
    /// </summary>
    /// <param name="ingredientId">食材ID</param>
    /// <returns>库存数量</returns>
    public int GetIngredientStock(string ingredientId)
    {
        var item = PlayerDataManager.Instance.CurrentPlayerData.IngredientInventory.Find(x => x.IngredientId == ingredientId);
        return item?.Quantity ?? 0;
    }
}