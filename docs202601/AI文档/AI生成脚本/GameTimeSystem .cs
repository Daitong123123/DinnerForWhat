using UnityEngine;
using System;

// 游戏时间数据模型
[Serializable]
public class GameTimeData
{
    public int CurrentHour;          // 当前小时（8-24）
    public int CurrentMinute;        // 当前分钟
    public int GameDay;              // 当前游戏天数
    public float TimeScale = 60f;    // 时间流速：1秒现实时间 = 60秒游戏时间（可调整）
    public float RemainingStallTime; // 剩余摆摊时间（秒，现实时间）
}

public class GameTimeSystem : MonoBehaviour
{
    // 单例实例
    public static GameTimeSystem Instance { get; private set; }

    // 游戏时间配置
    public GameTimeData GameTime;

    // 摆摊总时长（现实时间，秒）：15分钟=900秒
    private const float TotalStallTimeReal = 900f;

    // 时间更新事件
    public event Action<GameTimeData> OnTimeUpdated;

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
            // 初始化游戏时间
            InitGameTime();
        }
    }

    private void OnEnable()
    {
        // 订阅游戏状态变更事件
        GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
    }

    private void OnDisable()
    {
        // 取消订阅
        GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
    }

    // 初始化游戏时间（第一天8:00）
    private void InitGameTime()
    {
        GameTime = new GameTimeData
        {
            CurrentHour = 8,
            CurrentMinute = 0,
            GameDay = 1,
            TimeScale = 60f,
            RemainingStallTime = TotalStallTimeReal
        };
    }

    // 游戏状态变更回调
    private void OnGameStateChanged(GameState newState)
    {
        if (newState == GameState.Stalling)
        {
            // 开始摆摊，重置剩余时间
            GameTime.RemainingStallTime = TotalStallTimeReal;
        }
        else if (newState == GameState.Closed || newState == GameState.Idle)
        {
            // 收摊/闲置，停止时间流逝
            GameTime.RemainingStallTime = 0;
        }
    }

    private void Update()
    {
        // 仅在摆摊中时更新时间
        if (GameManager.Instance.CurrentGameState != GameState.Stalling) return;

        // 减少剩余摆摊时间（现实时间）
        GameTime.RemainingStallTime -= Time.deltaTime;
        if (GameTime.RemainingStallTime <= 0)
        {
            // 时间到，自动收摊
            GameTime.RemainingStallTime = 0;
            GameManager.Instance.CloseStall();
            return;
        }

        // 更新游戏内时间
        UpdateInGameTime();

        // 触发时间更新事件
        OnTimeUpdated?.Invoke(GameTime);
        GameEventSystem.Instance.TriggerEvent(GameEventSystem.EventNames.GameTimeUpdated, GameTime);
    }

    /// <summary>
    /// 更新游戏内时间（小时/分钟）
    /// </summary>
    private void UpdateInGameTime()
    {
        // 计算本次更新的游戏分钟数：deltaTime * 时间流速
        float gameMinutesPassed = Time.deltaTime * GameTime.TimeScale;
        GameTime.CurrentMinute += Mathf.FloorToInt(gameMinutesPassed);

        // 处理分钟进位
        while (GameTime.CurrentMinute >= 60)
        {
            GameTime.CurrentMinute -= 60;
            GameTime.CurrentHour += 1;

            // 处理小时进位（24点后结束当天）
            if (GameTime.CurrentHour >= 24)
            {
                GameTime.CurrentHour = 8;
                GameTime.CurrentMinute = 0;
                GameTime.GameDay += 1;
            }
        }
    }

    /// <summary>
    /// 获取格式化的游戏时间字符串（如 "8:00" "18:30"）
    /// </summary>
    /// <returns>格式化时间</returns>
    public string GetFormattedTime()
    {
        return $"{GameTime.CurrentHour}:{GameTime.CurrentMinute:D2}";
    }

    /// <summary>
    /// 获取剩余摆摊时间的百分比（用于UI进度条）
    /// </summary>
    /// <returns>0-1的百分比</returns>
    public float GetRemainingTimePercentage()
    {
        return GameTime.RemainingStallTime / TotalStallTimeReal;
    }
}