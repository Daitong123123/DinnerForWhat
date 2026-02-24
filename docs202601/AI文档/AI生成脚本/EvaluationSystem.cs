using UnityEngine;

public class EvaluationSystem : MonoBehaviour
{
    // 单例实例
    public static EvaluationSystem Instance { get; private set; }

    // 评价阈值配置
    [Header("评价阈值")]
    public float GoodReviewThreshold = 70f; // 好评阈值
    public float BadReviewThreshold = 50f;  // 差评阈值

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
    /// 评价菜品
    /// </summary>
    /// <param name="customer">顾客</param>
    /// <param name="dishScore">菜品评分</param>
    public void EvaluateDish(Customer customer, float dishScore)
    {
        // 判定评价类型
        if (dishScore >= GoodReviewThreshold)
        {
            // 好评
            AddGoodReview(customer);
        }
        else if (dishScore < BadReviewThreshold)
        {
            // 差评
            AddBadReview(customer);
        }
        // 中等评价不记录，仅更新统计

        // 触发评价事件
        GameEventSystem.Instance.TriggerEvent("EvaluationCompleted", new
        {
            CustomerId = customer.CustomerId,
            Score = dishScore,
            IsGoodReview = dishScore >= GoodReviewThreshold
        });
    }

    /// <summary>
    /// 记录好评
    /// </summary>
    private void AddGoodReview(Customer customer)
    {
        PlayerDataManager.Instance.CurrentPlayerData.TodayGoodReviews += 1;
        Debug.Log($"顾客{customer.CustomerName}给出好评");
    }

    /// <summary>
    /// 记录差评
    /// </summary>
    private void AddBadReview(Customer customer)
    {
        PlayerDataManager.Instance.CurrentPlayerData.TodayBadReviews += 1;
        Debug.Log($"顾客{customer.CustomerName}给出差评");
    }

    /// <summary>
    /// 获取当日评价统计
    /// </summary>
    /// <returns>好评数、差评数、总服务数</returns>
    public (int good, int bad, int total) GetTodayEvaluationStats()
    {
        int good = PlayerDataManager.Instance.CurrentPlayerData.TodayGoodReviews;
        int bad = PlayerDataManager.Instance.CurrentPlayerData.TodayBadReviews;
        int total = PlayerDataManager.Instance.CurrentPlayerData.TodayServedCustomers;
        return (good, bad, total);
    }

    /// <summary>
    /// 获取好评率
    /// </summary>
    /// <returns>0-1的好评率</returns>
    public float GetGoodReviewRate()
    {
        int total = PlayerDataManager.Instance.CurrentPlayerData.TodayServedCustomers;
        if (total == 0) return 0;
        return (float)PlayerDataManager.Instance.CurrentPlayerData.TodayGoodReviews / total;
    }
}