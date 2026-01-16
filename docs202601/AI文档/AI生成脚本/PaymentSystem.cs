using UnityEngine;

public class PaymentSystem : MonoBehaviour
{
    // 单例实例
    public static PaymentSystem Instance { get; private set; }

    // 评分与价格倍率配置
    [Header("价格倍率")]
    public float PerfectScoreMultiplier = 1.5f; // 满分(90-100)倍率
    public float GoodScoreMultiplier = 1.2f;    // 良好(70-89)倍率
    public float NormalScoreMultiplier = 1.0f;  // 普通(50-69)倍率
    public float BadScoreMultiplier = 0.5f;     // 差评(0-49)倍率

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
    /// 处理顾客付款
    /// </summary>
    /// <param name="customer">顾客</param>
    /// <param name="dish">菜品</param>
    public void ProcessPayment(Customer customer, Dish dish)
    {
        if (customer.State != CustomerState.Served) return;

        // 获取食谱基础价格
        var recipe = RecipeManager.Instance.GetRecipe(dish.RecipeId);
        if (recipe == null) return;

        // 根据评分计算最终价格
        float multiplier = GetScoreMultiplier(dish.DishScore);
        int finalPrice = Mathf.RoundToInt(recipe.Price * multiplier);

        // 增加玩家金币
        PlayerDataManager.Instance.UpdateGold(finalPrice);

        // 更新当日收入
        PlayerDataManager.Instance.CurrentPlayerData.TodayEarnings += finalPrice;
        PlayerDataManager.Instance.CurrentPlayerData.TodayServedCustomers += 1;

        // 触发付款完成事件
        GameEventSystem.Instance.TriggerEvent(GameEventSystem.EventNames.CustomerPaid, finalPrice);
        
        Debug.Log($"顾客{customer.CustomerName}付款：{finalPrice}金币（基础{recipe.Price}×{multiplier:F1}）");
    }

    /// <summary>
    /// 根据评分获取价格倍率
    /// </summary>
    /// <param name="score">菜品评分</param>
    /// <returns>倍率</returns>
    private float GetScoreMultiplier(float score)
    {
        if (score >= 90) return PerfectScoreMultiplier;
        if (score >= 70) return GoodScoreMultiplier;
        if (score >= 50) return NormalScoreMultiplier;
        return BadScoreMultiplier;
    }
}