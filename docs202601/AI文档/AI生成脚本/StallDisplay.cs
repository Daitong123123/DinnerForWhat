// 必须的命名空间引用
using UnityEngine;
using System.Collections.Generic; // Dictionary/List必需
using UnityEngine.UI; // Image组件必需

public class StallDisplay : MonoBehaviour
{
    // 单例实例
    public static StallDisplay Instance { get; private set; }

    // 摊位配置
    [Header("摊位展示配置")]
    public GameObject KitchenToolPrefab; // 厨具展示预制体
    public Transform ToolDisplayArea; // 厨具展示区域
    public Sprite TableclothSpriteDefault; // 默认桌布
    public Image TableclothImage; // 桌布图片（修复Image找不到）
    public Vector2 ToolDisplaySpacing = new Vector2(50, 0); // 厨具展示间距

    // 运行时数据
    private Dictionary<string, GameObject> toolDisplays = new Dictionary<string, GameObject>(); // 厨具ID->展示对象

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
        // 订阅事件
        GameEventSystem.Instance.Subscribe("VehicleSwitched", OnVehicleSwitched);
        GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
    }

    private void OnDisable()
    {
        GameEventSystem.Instance.Unsubscribe("VehicleSwitched", OnVehicleSwitched);
        GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
    }

    /// <summary>
    /// 游戏状态变更回调
    /// </summary>
    private void OnGameStateChanged(GameState newState)
    {
        if (newState == GameState.Stalling)
        {
            // 开始摆摊，初始化摊位展示
            InitializeStallDisplay();
        }
        else
        {
            // 收摊，清空摊位展示
            ClearStallDisplay();
        }
    }

    /// <summary>
    /// 载具切换回调
    /// </summary>
    private void OnVehicleSwitched(object data)
    {
        if (data is Vehicle vehicle && GameManager.Instance.CurrentGameState == GameState.Stalling)
        {
            // 更新桌布和厨具展示
            UpdateTablecloth(vehicle);
            UpdateToolDisplay(vehicle);
        }
    }

    /// <summary>
    /// 初始化摊位展示
    /// </summary>
    private void InitializeStallDisplay()
    {
        // 获取当前载具
        var currentVehicle = VehicleManager.Instance.GetCurrentVehicle();
        if (currentVehicle == null) return;

        // 更新桌布
        UpdateTablecloth(currentVehicle);

        // 更新厨具展示
        UpdateToolDisplay(currentVehicle);
    }

    /// <summary>
    /// 更新桌布显示
    /// </summary>
    private void UpdateTablecloth(Vehicle vehicle)
    {
        TableclothImage.sprite = vehicle.TableclothSprite != null ? vehicle.TableclothSprite : TableclothSpriteDefault;
    }

    /// <summary>
    /// 更新厨具展示
    /// </summary>
    private void UpdateToolDisplay(Vehicle vehicle)
    {
        // 清空现有厨具展示
        ClearToolDisplay();

        // 获取玩家拥有的、且当前载具允许的厨具
        var ownedTools = PlayerDataManager.Instance.CurrentPlayerData.OwnedKitchenTools;
        var allowedTools = vehicle.AllowedToolIds;
        var displayTools = new List<string>();

        foreach (var toolId in ownedTools)
        {
            if (allowedTools.Contains(toolId) && displayTools.Count < vehicle.MaxToolCount)
            {
                displayTools.Add(toolId);
            }
        }

        // 创建厨具展示对象
        Vector2 startPos = new Vector2(-(displayTools.Count - 1) * ToolDisplaySpacing.x / 2, 0);
        for (int i = 0; i < displayTools.Count; i++)
        {
            string toolId = displayTools[i];
            var tool = KitchenToolManager.Instance.GetKitchenTool(toolId);
            if (tool == null) continue;

            // 计算位置
            Vector2 pos = startPos + new Vector2(i * ToolDisplaySpacing.x, ToolDisplaySpacing.y);

            // 创建展示对象
            GameObject toolObj = Instantiate(KitchenToolPrefab, ToolDisplayArea);
            toolObj.transform.localPosition = pos;
            
            // 设置厨具图标
            Image toolImage = toolObj.GetComponent<Image>();
            toolImage.sprite = tool.ToolSprite;
            
            // 设置厨具名称
            Text toolNameText = toolObj.transform.Find("ToolName").GetComponent<Text>();
            toolNameText.text = tool.ToolName;

            // 绑定点击事件（选中厨具用于烹饪）
            Button toolButton = toolObj.GetComponent<Button>();
            toolButton.onClick.AddListener(() => SelectToolForCooking(toolId));

            // 加入字典
            toolDisplays.Add(toolId, toolObj);
        }
    }

    /// <summary>
    /// 选择厨具用于烹饪
    /// </summary>
    private void SelectToolForCooking(string toolId)
    {
        // 通知烹饪系统选中的厨具
        CookingSystem.Instance.SelectKitchenTool(toolId);
        
        // 高亮选中的厨具
        HighlightSelectedTool(toolId);
    }

    /// <summary>
    /// 高亮选中的厨具
    /// </summary>
    private void HighlightSelectedTool(string selectedToolId)
    {
        foreach (var kvp in toolDisplays)
        {
            Image toolImage = kvp.Value.GetComponent<Image>();
            // 选中的厨具高亮，其他恢复默认
            toolImage.color = kvp.Key == selectedToolId ? Color.yellow : Color.white;
        }
    }

    /// <summary>
    /// 清空厨具展示
    /// </summary>
    private void ClearToolDisplay()
    {
        foreach (var toolObj in toolDisplays.Values)
        {
            Destroy(toolObj);
        }
        toolDisplays.Clear();
    }

    /// <summary>
    /// 清空摊位展示
    /// </summary>
    private void ClearStallDisplay()
    {
        ClearToolDisplay();
        // 恢复默认桌布
        TableclothImage.sprite = TableclothSpriteDefault;
    }

    /// <summary>
    /// 更新厨具使用状态（显示正在使用/冷却）
    /// </summary>
    public void UpdateToolUsageState(string toolId, bool isInUse, float coolDownTime = 0)
    {
        if (!toolDisplays.ContainsKey(toolId)) return;

        GameObject toolObj = toolDisplays[toolId];
        Image cooldownOverlay = toolObj.transform.Find("CooldownOverlay").GetComponent<Image>();
        Text cooldownText = toolObj.transform.Find("CooldownText").GetComponent<Text>();

        if (isInUse)
        {
            // 显示冷却中
            cooldownOverlay.fillAmount = 1;
            cooldownOverlay.gameObject.SetActive(true);
            cooldownText.text = $"{coolDownTime:F0}s";
            cooldownText.gameObject.SetActive(true);
            
            // 禁用按钮
            toolObj.GetComponent<Button>().interactable = false;
        }
        else
        {
            // 隐藏冷却
            cooldownOverlay.gameObject.SetActive(false);
            cooldownText.gameObject.SetActive(false);
            
            // 启用按钮
            toolObj.GetComponent<Button>().interactable = true;
        }
    }
}

// 游戏状态枚举
public enum GameState
{
    Idle,       // 闲置状态
    Stalling    // 摆摊中
}