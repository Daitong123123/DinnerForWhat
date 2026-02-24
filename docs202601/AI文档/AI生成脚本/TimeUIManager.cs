using UnityEngine;
using UnityEngine.UI;

public class TimeUIManager : MonoBehaviour
{
    // UI引用
    [Header("UI组件")]
    public Text TimeDisplayText; // 时间显示文本
    public Slider TimeRemainingSlider; // 剩余时间进度条
    public Text RemainingTimeText; // 剩余时间文本

    private void OnEnable()
    {
        // 订阅时间更新事件
        GameTimeSystem.Instance.OnTimeUpdated += UpdateTimeUI;
        // 订阅游戏状态变更事件
        GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
    }

    private void OnDisable()
    {
        GameTimeSystem.Instance.OnTimeUpdated -= UpdateTimeUI;
        GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
    }

    private void Start()
    {
        // 初始化UI
        UpdateTimeUI(GameTimeSystem.Instance.GameTime);
    }

    /// <summary>
    /// 更新时间UI
    /// </summary>
    private void UpdateTimeUI(GameTimeData timeData)
    {
        if (TimeDisplayText != null)
        {
            TimeDisplayText.text = GameTimeSystem.Instance.GetFormattedTime();
        }

        if (TimeRemainingSlider != null)
        {
            TimeRemainingSlider.value = GameTimeSystem.Instance.GetRemainingTimePercentage();
        }

        if (RemainingTimeText != null)
        {
            // 转换剩余时间为分钟:秒
            int remainingSeconds = Mathf.RoundToInt(timeData.RemainingStallTime);
            int minutes = remainingSeconds / 60;
            int seconds = remainingSeconds % 60;
            RemainingTimeText.text = $"剩余时间：{minutes}:{seconds:D2}";
        }
    }

    /// <summary>
    /// 游戏状态变更回调
    /// </summary>
    private void OnGameStateChanged(GameState newState)
    {
        // 仅在摆摊中显示时间UI
        bool isVisible = newState == GameState.Stalling;
        if (TimeDisplayText != null) TimeDisplayText.gameObject.SetActive(isVisible);
        if (TimeRemainingSlider != null) TimeRemainingSlider.gameObject.SetActive(isVisible);
        if (RemainingTimeText != null) RemainingTimeText.gameObject.SetActive(isVisible);
    }
}