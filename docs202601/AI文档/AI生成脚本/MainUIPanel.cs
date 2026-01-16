using UnityEngine;
using UnityEngine.UI;

public class MainUIPanel : MonoBehaviour
{
    // 单例实例
    public static MainUIPanel Instance { get; private set; }

    // 主界面UI引用
    [Header("主界面UI")]
    public Button StartStallButton; // 开始摆摊按钮
    public Button EndStallButton; // 结束摆摊按钮
    public Button MapButton; // 地图按钮
    public Button RecipeButton; // 食谱按钮
    public Button StatsButton; // 数据统计按钮
    public Button VehicleButton; // 载具按钮
    public Button SaveButton; // 保存按钮
    public Text DayDisplayText; // 天数显示
    public Text TodayEarningsText; // 今日收入显示
    public Text QueueCountText; // 排队人数显示

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

    private void Start()
    {
        // 绑定按钮事件
        StartStallButton.onClick.AddListener(OnStartStallClicked);
        EndStallButton.onClick.AddListener(OnEndStallClicked);
        MapButton.onClick.AddListener(OnMapButtonClicked);
        RecipeButton.onClick.AddListener(OnRecipeButtonClicked);
        StatsButton.onClick.AddListener(OnStatsButtonClicked);
        VehicleButton.onClick.AddListener(OnVehicleButtonClicked);
        SaveButton.onClick.AddListener(OnSaveButtonClicked);

        // 初始化按钮状态
        UpdateButtonStates(GameManager.Instance.CurrentGameState);
        // 初始化显示
        UpdateMainUI();
    }

    private void OnEnable()
    {
        // 订阅事件
        GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
        GameEventSystem.Instance.Subscribe("QueueCountUpdated", OnQueueCountUpdated);
        GameEventSystem.Instance.Subscribe(GameEventSystem.EventNames.GoldChanged, OnGoldChanged);
    }

    private void OnDisable()
    {
        GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
        GameEventSystem.Instance.Unsubscribe("QueueCountUpdated", OnQueueCountUpdated);
        GameEventSystem.Instance.Unsubscribe(GameEventSystem.EventNames.GoldChanged, OnGoldChanged);
    }

    private void Update()
    {
        // 实时更新今日收入
        if (GameManager.Instance.CurrentGameState == GameState.Stalling)
        {
            TodayEarningsText.text = $"今日收入：{PlayerDataManager.Instance.CurrentPlayerData.TodayEarnings}金币";
        }
    }

    /// <summary>
    /// 游戏状态变更回调
    /// </summary>
    private void OnGameStateChanged(GameState newState)
    {
        UpdateButtonStates(newState);
        UpdateMainUI();
    }

    /// <summary>
    /// 排队人数更新回调
    /// </summary>
    private void OnQueueCountUpdated(object data)
    {
        if (data is int count)
        {
            QueueCountText.text = $"排队人数：{count}";
        }
    }

    /// <summary>
    /// 金币变更回调
    /// </summary>
    private void OnGoldChanged(object data)
    {
        UpdateMainUI();
    }

    /// <summary>
    /// 更新按钮状态
    /// </summary>
    private void UpdateButtonStates(GameState state)
    {
        switch (state)
        {
            case GameState.Idle:
                // 闲置状态
                StartStallButton.interactable = true;
                EndStallButton.interactable = false;
                MapButton.interactable = true;
                RecipeButton.interactable = true;
                StatsButton.interactable = true;
                VehicleButton.interactable = true;
                SaveButton.interactable = true;
                break;
            case GameState.Stalling:
                // 摆摊中
                StartStallButton.interactable = false;
                EndStallButton.interactable = true;
                MapButton.interactable = false;
                RecipeButton.interactable = false;
                StatsButton.interactable = false;
                VehicleButton.interactable = false;
                SaveButton.interactable = true;
                break;
        }
    }

    /// <summary>
    /// 更新主界面显示
    /// </summary>
    private void UpdateMainUI()
    {
        // 更新天数
        DayDisplayText.text = $"第 {PlayerDataManager.Instance.CurrentPlayerData.CurrentDay} 天";
        
        // 更新今日收入
        TodayEarningsText.text = $"今日收入：{PlayerDataManager.Instance.CurrentPlayerData.TodayEarnings}金币";
        
        // 更新排队人数（初始值）
        QueueCountText.text = $"排队人数：{CustomerSpawner.Instance.GetTotalQueueCount()}";
    }

    // ==================== 按钮点击事件 ====================
    /// <summary>
    /// 开始摆摊按钮
    /// </summary>
    private void OnStartStallClicked()
    {
        GameManager.Instance.StartStall();
    }

    /// <summary>
    /// 结束摆摊按钮
    /// </summary>
    private void OnEndStallClicked()
    {
        // 确认弹窗
        UIManager.Instance.ShowPopup("确认结束摆摊", "结束摆摊后今日无法再次摆摊，是否确认？", OnConfirmEndStall);
    }

    /// <summary>
    /// 确认结束摆摊
    /// </summary>
    private void OnConfirmEndStall()
    {
        GameManager.Instance.EndStall();
        UIManager.Instance.HidePopup();
    }

    /// <summary>
    /// 地图按钮
    /// </summary>
    private void OnMapButtonClicked()
    {
        UIManager.Instance.ShowUIPanel(UIType.Map);
    }

    /// <summary>
    /// 食谱按钮
    /// </summary>
    private void OnRecipeButtonClicked()
    {
        UIManager.Instance.ShowUIPanel(UIType.Recipe);
        RecipeUIManager.Instance.RefreshRecipeList();
    }

    /// <summary>
    /// 数据统计按钮
    /// </summary>
    private void OnStatsButtonClicked()
    {
        UIManager.Instance.ShowUIPanel(UIType.Stats);
    }

    /// <summary>
    /// 载具按钮
    /// </summary>
    private void OnVehicleButtonClicked()
    {
        // 显示载具选择UI（省略具体实现）
        UIManager.Instance.ShowPopup("载具管理", "载具管理界面即将上线");
    }

    /// <summary>
    /// 保存按钮
    /// </summary>
    private void OnSaveButtonClicked()
    {
        SaveLoadSystem.Instance.SaveGame();
        UIManager.Instance.ShowPopup("保存成功", "游戏数据已保存");
        
        // 3秒后自动关闭弹窗
        Invoke(nameof(HideSavePopup), 3f);
    }

    /// <summary>
    /// 隐藏保存成功弹窗
    /// </summary>
    private void HideSavePopup()
    {
        UIManager.Instance.HidePopup();
    }
}