using System;
using System.Collections.Generic;
using UnityEngine;

public class TransactionManager : MonoBehaviour
{
    // 单例实例
    public static TransactionManager Instance { get; private set; }

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
        // 订阅付款事件
        GameEventSystem.Instance.Subscribe(GameEventSystem.EventNames.CustomerPaid, OnCustomerPaid);
        // 订阅收摊事件
        GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
    }

    private void OnDisable()
    {
        GameEventSystem.Instance.Unsubscribe(GameEventSystem.EventNames.CustomerPaid, OnCustomerPaid);
        GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
    }

    /// <summary>
    /// 顾客付款回调
    /// </summary>
    private void OnCustomerPaid(object data)
    {
        if (data is int amount && amount > 0)
        {
            // 创建交易记录
            TransactionRecord record = new TransactionRecord
            {
                RecordId = Guid.NewGuid().ToString(),
                Amount = amount,
                TransactionType = TransactionType.Income,
                TransactionTime = GameTimeSystem.Instance.GetFormattedTime(),
                Day = PlayerDataManager.Instance.CurrentPlayerData.CurrentDay
            };

            // 添加到玩家数据
            PlayerDataManager.Instance.CurrentPlayerData.TransactionRecords.Add(record);
            Debug.Log($"记录交易：+{amount}金币，时间：{record.TransactionTime}");
        }
    }

    /// <summary>
    /// 游戏状态变更回调（收摊时统计当日流水）
    /// </summary>
    private void OnGameStateChanged(GameState newState)
    {
        if (newState == GameState.Idle && GameManager.Instance.PreviousGameState == GameState.Stalling)
        {
            // 收摊，统计当日流水
            var dailyStats = GetDailyStats(PlayerDataManager.Instance.CurrentPlayerData.CurrentDay);
            Debug.Log($"今日统计：总收入{dailyStats.totalIncome}，服务顾客{dailyStats.totalCustomers}，好评率{dailyStats.goodReviewRate:P1}");
            
            // 推进游戏天数
            PlayerDataManager.Instance.CurrentPlayerData.CurrentDay++;
        }
    }

    /// <summary>
    /// 获取指定日期的流水统计
    /// </summary>
    /// <param name="day">天数</param>
    /// <returns>统计数据</returns>
    public (int totalIncome, int totalCustomers, float goodReviewRate) GetDailyStats(int day)
    {
        int totalIncome = 0;
        int totalCustomers = 0;
        int goodReviews = 0;

        // 筛选当日交易记录
        var dailyRecords = PlayerDataManager.Instance.CurrentPlayerData.TransactionRecords
            .FindAll(r => r.Day == day && r.TransactionType == TransactionType.Income);

        totalIncome = dailyRecords.Sum(r => r.Amount);
        totalCustomers = dailyRecords.Count;
        goodReviews = PlayerDataManager.Instance.CurrentPlayerData.TodayGoodReviews;

        // 计算好评率
        float goodReviewRate = totalCustomers > 0 ? (float)goodReviews / totalCustomers : 0;

        return (totalIncome, totalCustomers, goodReviewRate);
    }

    /// <summary>
    /// 获取历史流水数据（用于折线图）
    /// </summary>
    /// <returns>天数->收入的字典</returns>
    public Dictionary<int, int> GetHistoryIncomeData()
    {
        Dictionary<int, int> historyData = new Dictionary<int, int>();

        foreach (var record in PlayerDataManager.Instance.CurrentPlayerData.TransactionRecords)
        {
            if (!historyData.ContainsKey(record.Day))
            {
                historyData[record.Day] = 0;
            }
            historyData[record.Day] += record.Amount;
        }

        return historyData;
    }

    /// <summary>
    /// 重置所有交易记录（测试用）
    /// </summary>
    public void ResetAllTransactions()
    {
        PlayerDataManager.Instance.CurrentPlayerData.TransactionRecords.Clear();
        PlayerDataManager.Instance.CurrentPlayerData.CurrentDay = 1;
    }
}