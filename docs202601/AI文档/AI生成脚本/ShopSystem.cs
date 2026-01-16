using UnityEngine;

public class ShopSystem : MonoBehaviour
{
    // 单例实例
    public static ShopSystem Instance { get; private set; }

    // 商店配置
    [Header("商店配置")]
    public float IngredientPriceMultiplier = 1.0f; // 食材价格倍率
    public float RecipePriceMultiplier = 1.0f; // 食谱价格倍率
    public float VehiclePriceMultiplier = 1.0f; // 载具价格倍率

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
        }
    }

    /// <summary>
    /// 购买食材
    /// </summary>
    /// <param name="ingredientId">食材ID</param>
    /// <param name="quantity">数量</param>
    /// <returns>是否购买成功</returns>
    public bool BuyIngredient(string ingredientId, int quantity)
    {
        if (quantity <= 0) return false;

        // 获取食材基础价格
        var ingredient = IngredientManager.Instance.GetIngredient(ingredientId);
        if (ingredient == null) return false;

        // 计算最终价格
        int totalPrice = Mathf.RoundToInt(ingredient.PurchasePrice * quantity * IngredientPriceMultiplier);

        // 校验金币
        if (!GoldManager.Instance.CheckGoldEnough(totalPrice))
        {
            GoldUIManager.Instance.ShowGoldNotEnoughTip();
            return false;
        }

        // 扣除金币
        GoldManager.Instance.SubtractGold(totalPrice);

        // 添加食材到库存
        IngredientManager.Instance.PurchaseIngredient(ingredientId, quantity);
        
        Debug.Log($"商店购买：{quantity}份{ingredient.IngredientName}，花费{totalPrice}金币");
        return true;
    }

    /// <summary>
    /// 购买食谱
    /// </summary>
    /// <param name="recipeId">食谱ID</param>
    /// <returns>是否购买成功</returns>
    public bool BuyRecipe(string recipeId)
    {
        // 校验食谱是否已解锁
        if (RecipeManager.Instance.IsRecipeUnlocked(recipeId))
        {
            Debug.Log($"食谱{recipeId}已解锁，无需重复购买");
            return true;
        }

        // 获取食谱价格
        var recipe = RecipeManager.Instance.GetRecipe(recipeId);
        if (recipe == null) return false;

        // 计算最终价格
        int totalPrice = Mathf.RoundToInt(recipe.UnlockPrice * RecipePriceMultiplier);

        // 校验金币
        if (!GoldManager.Instance.CheckGoldEnough(totalPrice))
        {
            GoldUIManager.Instance.ShowGoldNotEnoughTip();
            return false;
        }

        // 扣除金币
        GoldManager.Instance.SubtractGold(totalPrice);

        // 解锁食谱
        RecipeManager.Instance.UnlockRecipe(recipeId);
        
        Debug.Log($"商店购买：食谱{recipe.RecipeName}，花费{totalPrice}金币");
        return true;
    }

    /// <summary>
    /// 购买载具
    /// </summary>
    /// <param name="vehicleId">载具ID</param>
    /// <returns>是否购买成功</returns>
    public bool BuyVehicle(string vehicleId)
    {
        // 调用载具管理器的购买逻辑
        return VehicleManager.Instance.PurchaseVehicle(vehicleId);
    }

    /// <summary>
    /// 购买厨具
    /// </summary>
    /// <param name="toolId">厨具ID</param>
    /// <returns>是否购买成功</returns>
    public bool BuyKitchenTool(string toolId)
    {
        // 校验厨具是否已拥有
        if (KitchenToolManager.Instance.HasKitchenTool(toolId))
        {
            Debug.Log($"厨具{toolId}已拥有，无需重复购买");
            return true;
        }

        // 获取厨具价格
        var tool = KitchenToolManager.Instance.GetKitchenTool(toolId);
        if (tool == null) return false;

        // 校验金币
        if (!GoldManager.Instance.CheckGoldEnough(tool.PurchasePrice))
        {
            GoldUIManager.Instance.ShowGoldNotEnoughTip();
            return false;
        }

        // 扣除金币
        GoldManager.Instance.SubtractGold(tool.PurchasePrice);

        // 解锁厨具
        KitchenToolManager.Instance.UnlockKitchenTool(toolId);
        
        Debug.Log($"商店购买：厨具{tool.ToolName}，花费{tool.PurchasePrice}金币");
        return true;
    }
}