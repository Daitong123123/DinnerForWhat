using UnityEngine;
using UnityEngine.UI;

public class PhoneUISystem : MonoBehaviour
{
    // 单例实例
    public static PhoneUISystem Instance { get; private set; }

    // 手机UI配置
    [Header("手机UI配置")]
    public GameObject PhonePanel; // 手机面板
    public Image PhoneBackground; // 手机背景
    public Sprite PhoneHomeScreen; // 手机主屏
    public Sprite PhoneStatsScreen; // 数据统计屏
    public Sprite PhoneRecipeScreen; // 食谱屏
    public Sprite PhoneMapScreen; // 地图屏
    public Button PhoneHomeButton; // 手机主页按钮
    public Button PhoneStatsButton; // 数据统计按钮
    public Button PhoneRecipeButton; // 食谱按钮
    public Button PhoneMapButton; // 地图按钮
    public Button ClosePhoneButton; // 关闭手机按钮

    // 手机状态
    private enum PhoneScreen
    {
        Home,       // 主页
        Stats,      // 数据统计
        Recipe,     // 食谱
        Map         // 地图
    }
    private PhoneScreen currentScreen = PhoneScreen.Home;

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
        PhoneHomeButton.onClick.AddListener(() => SwitchPhoneScreen(PhoneScreen.Home));
        PhoneStatsButton.onClick.AddListener(() => SwitchPhoneScreen(PhoneScreen.Stats));
        PhoneRecipeButton.onClick.AddListener(() => SwitchPhoneScreen(PhoneScreen.Recipe));
        PhoneMapButton.onClick.AddListener(() => SwitchPhoneScreen(PhoneScreen.Map));
        ClosePhoneButton.onClick.AddListener(HidePhone);

        // 默认隐藏手机
        PhonePanel.SetActive(false);
    }

    /// <summary>
    /// 显示手机UI
    /// </summary>
    public void ShowPhone()
    {
        PhonePanel.SetActive(true);
        // 默认显示主页
        SwitchPhoneScreen(PhoneScreen.Home);
    }

    /// <summary>
    /// 隐藏手机UI
    /// </summary>
    public void HidePhone()
    {
        PhonePanel.SetActive(false);
    }

    /// <summary>
    /// 切换手机屏幕
    /// </summary>
    private void SwitchPhoneScreen(PhoneScreen screen)
    {
        currentScreen = screen;
        
        // 更新手机背景
        switch (screen)
        {
            case PhoneScreen.Home:
                PhoneBackground.sprite = PhoneHomeScreen;
                // 显示基础信息
                UpdateHomeScreenInfo();
                break;
            case PhoneScreen.Stats:
                PhoneBackground.sprite = PhoneStatsScreen;
                // 生成统计图表（在手机面板内）
                GeneratePhoneStatsChart();
                break;
            case PhoneScreen.Recipe:
                PhoneBackground.sprite = PhoneRecipeScreen;
                // 显示简化版食谱列表
                ShowPhoneRecipeList();
                break;
            case PhoneScreen.Map:
                PhoneBackground.sprite = PhoneMapScreen;
                // 显示简化版地图
                ShowPhoneMap();
                break;
        }

        // 更新按钮状态（高亮当前屏幕按钮）
        UpdatePhoneButtonStates();
    }

    /// <summary>
    /// 更新主页信息
    /// </summary>
    private void UpdateHomeScreenInfo()
    {
        // 获取手机主页信息文本
        Text infoText = PhonePanel.transform.Find("HomeScreen/InfoText").GetComponent<Text>();
        if (infoText != null)
        {
            int currentGold = GoldManager.Instance.GetCurrentGold();
            int currentDay = PlayerDataManager.Instance.CurrentPlayerData.CurrentDay;
            int todayEarnings = PlayerDataManager.Instance.CurrentPlayerData.TodayEarnings;
            
            infoText.text = $"第 {currentDay} 天\n当前金币：{currentGold}\n今日收入：{todayEarnings}";
        }
    }

    /// <summary>
    /// 生成手机版统计图表
    /// </summary>
    private void GeneratePhoneStatsChart()
    {
        // 获取手机内的图表容器
        Transform chartContainer = PhonePanel.transform.Find("StatsScreen/ChartContainer");
        if (chartContainer != null)
        {
            // 复用ChartSystem的逻辑生成适配手机尺寸的图表
            // 这里简化处理，直接调用ChartSystem生成图表到手机容器
            ChartSystem.Instance.GenerateIncomeChart();
        }
    }

    /// <summary>
    /// 显示手机版食谱列表
    /// </summary>
    private void ShowPhoneRecipeList()
    {
        // 获取手机食谱列表容器
        Transform recipeContainer = PhonePanel.transform.Find("RecipeScreen/RecipeList");
        if (recipeContainer != null)
        {
            // 清空现有内容
            foreach (Transform child in recipeContainer)
            {
                Destroy(child.gameObject);
            }

            // 只显示已解锁的食谱（简化版）
            var unlockedRecipes = RecipeManager.Instance.GetUnlockedRecipes();
            foreach (var recipe in unlockedRecipes)
            {
                // 创建简化的食谱项
                GameObject recipeItem = new GameObject("PhoneRecipeItem");
                recipeItem.transform.SetParent(recipeContainer);
                
                // 添加文本组件
                Text recipeText = recipeItem.AddComponent<Text>();
                recipeText.text = recipe.RecipeName;
                recipeText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
                recipeText.color = Color.black;
            }
        }
    }

    /// <summary>
    /// 显示手机版地图
    /// </summary>
    private void ShowPhoneMap()
    {
        // 获取手机地图容器
        Transform mapContainer = PhonePanel.transform.Find("MapScreen/MapContent");
        if (mapContainer != null)
        {
            // 显示简化版地图（仅显示场所名称）
            Text mapText = mapContainer.GetComponent<Text>();
            if (mapText != null)
            {
                string mapInfo = "当前位置：";
                var currentPlace = MapSystem.Instance.GetCurrentPlace();
                if (currentPlace != null)
                {
                    mapInfo += currentPlace.Name;
                }
                else
                {
                    mapInfo += "未知";
                }
                
                mapInfo += "\n\n可前往：\n- 摆摊点\n- 商店\n- 钓鱼场\n- 家";
                mapText.text = mapInfo;
            }
        }
    }

    /// <summary>
    /// 更新手机按钮状态
    /// </summary>
    private void UpdatePhoneButtonStates()
    {
        // 重置所有按钮颜色
        SetPhoneButtonColor(PhoneHomeButton, Color.white);
        SetPhoneButtonColor(PhoneStatsButton, Color.white);
        SetPhoneButtonColor(PhoneRecipeButton, Color.white);
        SetPhoneButtonColor(PhoneMapButton, Color.white);

        // 高亮当前屏幕按钮
        switch (currentScreen)
        {
            case PhoneScreen.Home:
                SetPhoneButtonColor(PhoneHomeButton, Color.yellow);
                break;
            case PhoneScreen.Stats:
                SetPhoneButtonColor(PhoneStatsButton, Color.yellow);
                break;
            case PhoneScreen.Recipe:
                SetPhoneButtonColor(PhoneRecipeButton, Color.yellow);
                break;
            case PhoneScreen.Map:
                SetPhoneButtonColor(PhoneMapButton, Color.yellow);
                break;
        }
    }

    /// <summary>
    /// 设置手机按钮颜色
    /// </summary>
    private void SetPhoneButtonColor(Button button, Color color)
    {
        Image buttonImage = button.GetComponent<Image>();
        if (buttonImage != null)
        {
            buttonImage.color = color;
        }
    }

    /// <summary>
    /// 从手机快速前往指定场所
    /// </summary>
    public void QuickTravelFromPhone(string placeId)
    {
        MapSystem.Instance.GoToPlace(placeId);
        HidePhone();
    }
}