using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class OperationSelectUIManager : MonoBehaviour
{
    public static OperationSelectUIManager Instance { get; private set; }

    [Header("UI预制体")]
    public GameObject selectRootPrefab; // World Space的Canvas预制体
    public Button operationButtonPrefab; // 操作按钮预制体

    [Header("按钮布局配置")]
    [Tooltip("按钮之间的间距（像素）")]
    public float buttonSpacing = 20f;
    [Tooltip("单个按钮宽度（像素）")]
    public float buttonWidth = 100f;
    [Tooltip("单个按钮高度（像素）")]
    public float buttonHeight = 50f;
    [Tooltip("UI相对于厨具的高度偏移")]
    public float uiHeightOffset = 1.5f;

    // 当前生成的UI实例（用于销毁）
    private GameObject _currentUIRoot;
    // 当前选中的食材和厨具
    private FoodBase _currentFood;
    private ToolBase _currentTool;
    // 防止重复生成相同操作按钮
    private HashSet<FoodOperationType> _generatedOperations = new HashSet<FoodOperationType>();

    private void Awake()
    {
        // 单例初始化
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("✅ OperationSelectUIManager 单例初始化成功");
        }
        else
        {
            Destroy(gameObject);
            Debug.Log("❌ 存在多个OperationSelectUIManager，已销毁重复实例");
        }
    }

    /// <summary>
    /// 在指定厨具位置显示操作选择UI
    /// </summary>
    public void ShowOperationUI(FoodBase food, ToolBase tool, List<FoodOperationType> matchOperations)
    {
        // 日志：打印调用参数
        Debug.Log($"📢 调用ShowOperationUI：食材={food?.name}，厨具={tool?.name}，匹配操作数={matchOperations?.Count ?? 0}");
        Debug.Log($"📢 预制体配置：selectRootPrefab={(selectRootPrefab == null ? "空" : selectRootPrefab.name)}，operationButtonPrefab={(operationButtonPrefab == null ? "空" : operationButtonPrefab.name)}");

        // 安全校验：参数缺失直接返回
        if (food == null || tool == null || matchOperations == null || matchOperations.Count == 0 ||
            selectRootPrefab == null || operationButtonPrefab == null)
        {
            Debug.LogWarning("操作选择UI初始化失败：参数缺失或预制体未配置");
            return;
        }

        // 销毁旧UI，避免叠加
        HideOperationUI();
        // 清空已生成操作缓存
        _generatedOperations.Clear();

        // 记录当前选中的食材和厨具
        _currentFood = food;
        _currentTool = tool;

        // 1. 生成UI根物体（厨具上方指定高度）
        _currentUIRoot = Instantiate(selectRootPrefab, tool.transform.position + Vector3.up * uiHeightOffset, Quaternion.identity);
        // 确保UI面向相机（透视相机适用）
        _currentUIRoot.transform.LookAt(Camera.main.transform);
        _currentUIRoot.transform.rotation = Quaternion.Euler(0, _currentUIRoot.transform.rotation.y, 0);

        // 2. 获取Content容器（根物体第一个子物体，用于承载按钮）
        Transform contentTransform = _currentUIRoot.transform.GetChild(0);
        if (contentTransform == null)
        {
            Debug.LogError("UI根物体缺少Content子容器！");
            HideOperationUI();
            return;
        }

        // 3. 配置Content的横向布局（核心：解决按钮过小+横向排列）
        SetupHorizontalLayout(contentTransform);

        // 4. 生成操作按钮（去重）
        foreach (var op in matchOperations)
        {
            if (!_generatedOperations.Contains(op))
            {
                CreateOperationButton(op, contentTransform);
                _generatedOperations.Add(op);
            }
        }
    }

    /// <summary>
    /// 配置Content的横向布局（修复按钮过小的核心逻辑）
    /// </summary>
    private void SetupHorizontalLayout(Transform content)
    {
        // 添加/获取横向布局组
        HorizontalLayoutGroup layout = content.GetComponent<HorizontalLayoutGroup>();
        if (layout == null)
        {
            layout = content.gameObject.AddComponent<HorizontalLayoutGroup>();
        }

        // 布局核心配置（关键：不控制按钮高度）
        layout.spacing = buttonSpacing;                  // 按钮间距
        layout.childAlignment = TextAnchor.MiddleCenter; // 按钮居中对齐
        layout.childControlWidth = true;                 // 控制按钮宽度
        layout.childControlHeight = false;               // 不控制按钮高度（修复过小）
        layout.childForceExpandWidth = false;            // 不强制扩展宽度
        layout.childForceExpandHeight = false;           // 不强制扩展高度

        // 添加/获取内容大小适配
        ContentSizeFitter fitter = content.GetComponent<ContentSizeFitter>();
        if (fitter == null)
        {
            fitter = content.gameObject.AddComponent<ContentSizeFitter>();
        }
        fitter.horizontalFit = ContentSizeFitter.FitMode.PreferredSize; // 水平自适应宽度
        fitter.verticalFit = ContentSizeFitter.FitMode.Unconstrained;   // 垂直不限制（修复高度）
    }

    /// <summary>
    /// 创建单个操作按钮（固定尺寸+居中锚点）
    /// </summary>
    private void CreateOperationButton(FoodOperationType operation, Transform parent)
    {
        // 实例化按钮
        Button btn = Instantiate(operationButtonPrefab, parent);
        RectTransform btnRect = btn.GetComponent<RectTransform>();
        if (btnRect != null)
        {
            // 固定按钮尺寸（关键：设置按钮宽高）
            btnRect.sizeDelta = new Vector2(buttonWidth, buttonHeight);
            // 按钮锚点居中（避免位置偏移）
            btnRect.anchorMin = new Vector2(0.5f, 0.5f);
            btnRect.anchorMax = new Vector2(0.5f, 0.5f);
            btnRect.pivot = new Vector2(0.5f, 0.5f);
        }

        // 设置按钮文本
        Text btnText = btn.GetComponentInChildren<Text>();
        if (btnText != null)
        {
            btnText.text = GetOperationDisplayName(operation);
            btnText.alignment = TextAnchor.MiddleCenter; // 文本居中
        }

        // 按钮点击事件
        btn.onClick.AddListener(() =>
        {
            OnOperationSelected(operation);
            HideOperationUI(); // 点击后销毁UI
        });
    }

    /// <summary>
    /// 转换操作枚举为中文显示名
    /// </summary>
    private string GetOperationDisplayName(FoodOperationType operation)
    {
        switch (operation)
        {
            case FoodOperationType.Cut: return "切";
            case FoodOperationType.Stir: return "搅拌";
            case FoodOperationType.Boil: return "煮";
            case FoodOperationType.Fry: return "煎";
            case FoodOperationType.Steam: return "蒸";
            case FoodOperationType.Bake: return "烤";
            default: return operation.ToString();
        }
    }

    /// <summary>
    /// 玩家选择操作后的逻辑（接管食材+启动操作）
    /// </summary>
    private void OnOperationSelected(FoodOperationType operation)
    {
        if (_currentTool == null || _currentFood == null)
        {
            Debug.LogWarning("❌ OnOperationSelected：食材/厨具为空，无法执行操作！");
            return;
        }

        Debug.Log($"🔵 [OnOperationSelected] 开始执行{operation}操作，食材：{_currentFood.name}，厨具：{_currentTool.name}");

        // 1. 先接管食材（缓存到ToolBase）
        _currentTool.TakeOverFood(_currentFood, operation);
        // 2. 启动操作
        bool success = _currentTool.StartOperation(operation);

        if (success)
        {
            Debug.Log($"✅ [OnOperationSelected] {operation}操作已成功启动");
        }
        else
        {
            Debug.LogError($"❌ [OnOperationSelected] {operation}操作启动失败！");
        }
    }

    /// <summary>
    /// 隐藏并销毁UI（清理缓存）
    /// </summary>
    public void HideOperationUI()
    {
        if (_currentUIRoot != null)
        {
            Destroy(_currentUIRoot);
            _currentUIRoot = null;
            Debug.Log("🗑️ 操作选择UI已销毁");
        }
        // 清空缓存
        _currentFood = null;
        _currentTool = null;
        _generatedOperations.Clear();
    }

    // 场景切换时清理UI
    private void OnDestroy()
    {
        HideOperationUI();
    }

    // 兼容旧方法名（避免其他脚本调用报错）
    public void CloseOperationUI()
    {
        HideOperationUI();
    }
}