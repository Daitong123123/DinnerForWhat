// 必须的命名空间引用
using UnityEngine;
using System.Collections; // 协程必需
using System.Collections.Generic; // List集合必需
using UnityEngine.UI; // UI组件必需

public class HomeSystem : MonoBehaviour
{
    // 单例实例
    public static HomeSystem Instance { get; private set; }

    // 回家奖励配置
    [Header("回家配置")]
    public int DailyRestReward = 100; // 每日休息奖励金币
    public float RestTime = 5f; // 休息时长（秒）
    public int MaxDailyRestCount = 1; // 每日最大休息次数

    // 运行时数据
    private int todayRestCount = 0; // 今日休息次数

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

    private void OnEnable()
    {
        // 订阅天数变更事件
        GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
    }

    private void OnDisable()
    {
        GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
    }

    /// <summary>
    /// 游戏状态变更回调（重置每日休息次数）
    /// </summary>
    private void OnGameStateChanged(GameState newState)
    {
        if (newState == GameState.Idle && GameManager.Instance.PreviousGameState == GameState.Stalling)
        {
            // 收摊，重置今日休息次数
            todayRestCount = 0;
        }
    }

    /// <summary>
    /// 休息恢复（获取奖励）
    /// </summary>
    /// <returns>是否成功</returns>
    public bool RestAtHome()
    {
        // 校验休息次数
        if (todayRestCount >= MaxDailyRestCount)
        {
            Debug.LogWarning("今日休息次数已达上限");
            return false;
        }

        // 开始休息协程（修复IEnumerator报错）
        StartCoroutine(RestCoroutine());
        
        return true;
    }

    /// <summary>
    /// 休息协程
    /// </summary>
    private IEnumerator RestCoroutine()
    {
        // 显示休息中UI（省略）
        Debug.Log("开始休息...");

        // 等待休息时长
        yield return new WaitForSeconds(RestTime);

        // 发放奖励
        GoldManager.Instance.AddGold(DailyRestReward);
        todayRestCount++;
        
        Debug.Log($"休息完成，获得{DailyRestReward}金币奖励");

        // 触发休息完成事件
        GameEventSystem.Instance.TriggerEvent("RestCompleted", DailyRestReward);
    }

    /// <summary>
    /// 整理库存（重置载具载重）
    /// </summary>
    public void OrganizeInventory()
    {
        // 简化：整理库存可增加临时载重上限
        var currentVehicle = VehicleManager.Instance.GetCurrentVehicle();
        float tempWeightBoost = currentVehicle.MaxWeight * 0.1f; // 临时增加10%载重
        
        Debug.Log($"整理库存完成，临时增加{tempWeightBoost}载重上限");
        GameEventSystem.Instance.TriggerEvent("InventoryOrganized", tempWeightBoost);
    }

    /// <summary>
    /// 查看游戏手册（显示教程）
    /// </summary>
    public void ViewGameManual()
    {
        // 显示游戏教程UI（省略）
        Debug.Log("打开游戏手册");
    }

    /// <summary>
    /// 保存游戏
    /// </summary>
    public void SaveGameAtHome()
    {
        // 调用存档系统
        SaveLoadSystem.Instance.SaveGame();
        Debug.Log("游戏已保存");
    }
}