using UnityEngine;
using TMPro;
using UnityEngine.UI;

// 星露谷风格的游戏时间（仅保留天、时、分，无秒）
[System.Serializable]
public struct StardewStyleGameTime
{
    public int day;     // 游戏天数
    public int hour;    // 小时（0-23，星露谷是6-26，可按需调整）
    public int minute;  // 分钟（0-59）

    // 格式化显示（星露谷风格：Day 1 - 08:30）
    public string GetFormattedTime()
    {
        return $"Day {day} - {hour.ToString("00")}:{minute.ToString("00")}";
    }
}

public class StardewTimeManager : MonoBehaviour
{
    public static StardewTimeManager Instance; // 单例

    [Header("核心时间配置")]
    public StardewStyleGameTime currentGameTime; // 当前游戏时间
    public float realTimePerGameDay = 600f;      // 游戏一天的真实时长（秒），默认10分钟=600秒
    public bool isTimePaused = false;            // 暂停时间

    [Header("UI引用")]
    public Text timeDisplayText;      // 时间显示文本（用UGUI Text则替换为Text）

    // 时间更新事件（供其他系统监听）
    public System.Action<StardewStyleGameTime> OnTimeUpdated;
    // 新一天事件（比如凌晨触发）
    public System.Action<int> OnNewDay;

    private float gameMinutesPerRealSecond;      // 每真实秒对应的游戏分钟数
    private float accumulatedRealTime;           // 累计未处理的真实时间（避免帧丢失）

    private void Awake()
    {
        // 单例初始化
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }

        // 计算核心比例：游戏一天=24*60=1440分钟，对应真实600秒
        gameMinutesPerRealSecond = (24 * 60) / realTimePerGameDay; // 1440/600=2.4 游戏分钟/真实秒

        // 初始化UI
        UpdateTimeUI();
    }

    private void Update()
    {
        if (isTimePaused) return;

        // 累加本次帧的真实时间（用deltaTime保证不同帧率下时间流速一致）
        accumulatedRealTime += Time.deltaTime;

        // 计算累计时间对应的游戏分钟数
        float gameMinutesToAdd = accumulatedRealTime * gameMinutesPerRealSecond;

        // 只处理整数分钟（避免小数分钟，符合星露谷风格）
        int wholeMinutesToAdd = Mathf.FloorToInt(gameMinutesToAdd);
        if (wholeMinutesToAdd > 0)
        {
            // 扣除已处理的时间，剩余的留到下一帧
            accumulatedRealTime -= (wholeMinutesToAdd / gameMinutesPerRealSecond);
            // 更新游戏时间
            AddGameMinutes(wholeMinutesToAdd);
        }
    }

    // 核心方法：增加游戏分钟数，处理进位逻辑
    private void AddGameMinutes(int minutesToAdd)
    {
        if (minutesToAdd <= 0) return;

        // 累加分钟
        currentGameTime.minute += minutesToAdd;

        // 分钟转小时
        if (currentGameTime.minute >= 60)
        {
            int hoursToAdd = currentGameTime.minute / 60;
            currentGameTime.minute = currentGameTime.minute % 60;

            // 小时转天
            currentGameTime.hour += hoursToAdd;
            if (currentGameTime.hour >= 24)
            {
                int daysToAdd = currentGameTime.hour / 24;
                currentGameTime.hour = currentGameTime.hour % 24;

                // 更新天数并触发新一天事件
                currentGameTime.day += daysToAdd;
                OnNewDay?.Invoke(currentGameTime.day);
            }
        }

        // 更新UI和事件
        UpdateTimeUI();
        OnTimeUpdated?.Invoke(currentGameTime);
    }

    // 更新屏幕时间显示
    private void UpdateTimeUI()
    {
        if (timeDisplayText != null)
        {
            timeDisplayText.text = currentGameTime.GetFormattedTime();
        }
    }

    // ========== 外部调用接口 ==========
    // 暂停/恢复时间
    public void ToggleTimePause(bool pause)
    {
        isTimePaused = pause;
    }

    // 直接设置游戏时间（比如任务跳转）
    public void SetGameTime(int day, int hour, int minute)
    {
        currentGameTime.day = day;
        currentGameTime.hour = Mathf.Clamp(hour, 0, 23);
        currentGameTime.minute = Mathf.Clamp(minute, 0, 59);
        UpdateTimeUI();
        OnTimeUpdated?.Invoke(currentGameTime);
    }

    // 调整游戏一天的时长（比如加速/减速，单位：秒）
    public void SetRealTimePerGameDay(float newSeconds)
    {
        if (newSeconds > 0)
        {
            realTimePerGameDay = newSeconds;
            gameMinutesPerRealSecond = (24 * 60) / realTimePerGameDay;
        }
    }
}