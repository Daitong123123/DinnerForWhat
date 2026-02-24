using UnityEngine;

public class UIManager : MonoBehaviour
{
    // 单例实例
    public static UIManager Instance { get; private set; }

    // UI面板引用
    [Header("UI面板配置")]
    public GameObject MainUIPanel; // 主界面UI
    public GameObject MapUIPanel; // 地图UI
    public GameObject RecipeUIPanel; // 食谱UI
    public GameObject StatsUIPanel; // 数据统计UI
    public GameObject ShopUIPanel; // 商店UI
    public GameObject HomeUIPanel; // 家UI
    public GameObject FishingUIPanel; // 钓鱼UI
    public GameObject PopupPanel; // 通用弹窗UI

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
            InitUIPanels();
        }
    }

    // 初始化UI面板（默认隐藏）
    private void InitUIPanels()
    {
        SetAllUIPanelsActive(false);
        // 默认显示主界面
        if (MainUIPanel != null)
        {
            MainUIPanel.SetActive(true);
        }
    }

    /// <summary>
    /// 设置所有UI面板的激活状态
    /// </summary>
    private void SetAllUIPanelsActive(bool active)
    {
        if (MainUIPanel != null) MainUIPanel.SetActive(active);
        if (MapUIPanel != null) MapUIPanel.SetActive(active);
        if (RecipeUIPanel != null) RecipeUIPanel.SetActive(active);
        if (StatsUIPanel != null) StatsUIPanel.SetActive(active);
        if (ShopUIPanel != null) ShopUIPanel.SetActive(active);
        if (HomeUIPanel != null) HomeUIPanel.SetActive(active);
        if (FishingUIPanel != null) FishingUIPanel.SetActive(active);
        if (PopupPanel != null) PopupPanel.SetActive(active);
    }

    /// <summary>
    /// 显示指定类型的UI面板
    /// </summary>
    /// <param name="uiType">UI类型</param>
    public void ShowUIPanel(UIType uiType)
    {
        // 先隐藏所有面板
        SetAllUIPanelsActive(false);

        // 显示指定面板
        switch (uiType)
        {
            case UIType.Main:
                if (MainUIPanel != null) MainUIPanel.SetActive(true);
                break;
            case UIType.Map:
                if (MapUIPanel != null) MapUIPanel.SetActive(true);
                break;
            case UIType.Recipe:
                if (RecipeUIPanel != null) RecipeUIPanel.SetActive(true);
                break;
            case UIType.Stats:
                if (StatsUIPanel != null) StatsUIPanel.SetActive(true);
                // 生成统计图表
                ChartSystem.Instance.GenerateIncomeChart();
                break;
            case UIType.Shop:
                if (ShopUIPanel != null) ShopUIPanel.SetActive(true);
                break;
            case UIType.Home:
                if (HomeUIPanel != null) HomeUIPanel.SetActive(true);
                break;
            case UIType.Fishing:
                if (FishingUIPanel != null) FishingUIPanel.SetActive(true);
                break;
        }
    }

    /// <summary>
    /// 显示通用弹窗
    /// </summary>
    /// <param name="title">标题</param>
    /// <param name="content">内容</param>
    public void ShowPopup(string title, string content)
    {
        if (PopupPanel == null) return;

        // 设置弹窗内容（需根据实际UI结构调整）
        Text titleText = PopupPanel.transform.Find("Title").GetComponent<Text>();
        Text contentText = PopupPanel.transform.Find("Content").GetComponent<Text>();
        
        if (titleText != null) titleText.text = title;
        if (contentText != null) contentText.text = content;

        // 显示弹窗
        PopupPanel.SetActive(true);
    }

    /// <summary>
    /// 隐藏通用弹窗
    /// </summary>
    public void HidePopup()
    {
        if (PopupPanel != null)
        {
            PopupPanel.SetActive(false);
        }
    }

    /// <summary>
    /// 隐藏所有UI（全屏场景时使用）
    /// </summary>
    public void HideAllUI()
    {
        SetAllUIPanelsActive(false);
        HidePopup();
    }
}

// UI类型枚举
public enum UIType
{
    Main,       // 主界面
    Map,        // 地图
    Recipe,     // 食谱
    Stats,      // 数据统计
    Shop,       // 商店
    Home,       // 家
    Fishing     // 钓鱼
}