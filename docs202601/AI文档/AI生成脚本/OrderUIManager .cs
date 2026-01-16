using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class OrderUIManager : MonoBehaviour
{
    // 单例实例
    public static OrderUIManager Instance { get; private set; }

    // UI预制体与容器
    [Header("UI配置")]
    public GameObject OrderPanelPrefab; // 订单面板预制体
    public Transform OrderPanelContainer; // 订单面板容器
    public Sprite PriorityIconSprite; // 优先级标识Sprite
    public Sprite TimeoutWarningSprite; // 超时警告Sprite
    public Sprite GoodReviewSprite; // 好评Sprite
    public Sprite BadReviewSprite; // 差评Sprite

    // 运行时数据
    private Dictionary<string, GameObject> orderUIPanels = new Dictionary<string, GameObject>(); // 订单ID->UI面板

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
        GameEventSystem.Instance.Subscribe("OrderCreated", OnOrderCreated);
        GameEventSystem.Instance.Subscribe("EvaluationCompleted", OnEvaluationCompleted);
        GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
    }

    private void OnDisable()
    {
        GameEventSystem.Instance.Unsubscribe("OrderCreated", OnOrderCreated);
        GameEventSystem.Instance.Unsubscribe("EvaluationCompleted", OnEvaluationCompleted);
        GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
    }

    private void Update()
    {
        if (GameManager.Instance.CurrentGameState != GameState.Stalling) return;
        
        // 更新所有订单UI的等待时间进度
        UpdateAllOrderWaitTimeUI();
    }

    /// <summary>
    /// 游戏状态变更回调
    /// </summary>
    private void OnGameStateChanged(GameState newState)
    {
        if (newState != GameState.Stalling)
        {
            // 收摊/闲置，清空订单UI
            ClearAllOrderUI();
        }
    }

    /// <summary>
    /// 新订单创建回调
    /// </summary>
    private void OnOrderCreated(object data)
    {
        if (data is Order order)
        {
            CreateOrderUI(order);
        }
    }

    /// <summary>
    /// 评价完成回调
    /// </summary>
    private void OnEvaluationCompleted(object data)
    {
        var evalData = data as dynamic;
        string customerId = evalData.CustomerId;
        float score = evalData.Score;
        
        // 找到对应订单
        var customer = CustomerSpawner.Instance.GetCurrentDisplayCustomers().Find(c => c.CustomerId == customerId);
        if (customer == null) return;
        
        // 更新评价显示
        UpdateOrderEvaluationUI(customer.CustomerOrder.OrderId, score);
    }

    /// <summary>
    /// 创建订单UI
    /// </summary>
    private void CreateOrderUI(Order order)
    {
        if (orderUIPanels.ContainsKey(order.OrderId)) return;

        // 实例化订单面板
        GameObject panelObj = Instantiate(OrderPanelPrefab, OrderPanelContainer);
        orderUIPanels.Add(order.OrderId, panelObj);

        // 获取面板组件
        Text recipeNameText = panelObj.transform.Find("RecipeName").GetComponent<Text>();
        Image priorityIcon = panelObj.transform.Find("PriorityIcon").GetComponent<Image>();
        Slider waitTimeSlider = panelObj.transform.Find("WaitTimeSlider").GetComponent<Slider>();
        Image timeoutWarning = panelObj.transform.Find("TimeoutWarning").GetComponent<Image>();
        Image evaluationIcon = panelObj.transform.Find("EvaluationIcon").GetComponent<Image>();

        // 配置面板内容
        var recipe = RecipeManager.Instance.GetRecipe(order.RecipeId);
        recipeNameText.text = recipe != null ? recipe.RecipeName : "未知菜品";
        
        // 优先级标识
        priorityIcon.sprite = order.IsPriority ? PriorityIconSprite : null;
        priorityIcon.enabled = order.IsPriority;
        
        // 等待时间滑块
        waitTimeSlider.maxValue = order.MaxWaitTime;
        waitTimeSlider.value = order.MaxWaitTime;
        
        // 隐藏超时警告和评价图标
        timeoutWarning.enabled = false;
        evaluationIcon.enabled = false;

        // 绑定上菜按钮事件
        Button serveButton = panelObj.transform.Find("ServeButton").GetComponent<Button>();
        serveButton.onClick.AddListener(() => 
        {
            int customerIndex = CustomerSpawner.Instance.GetCurrentDisplayCustomers()
                .FindIndex(c => c.CustomerOrder.OrderId == order.OrderId);
            CustomerSpawner.Instance.ServeCustomer(customerIndex);
        });
    }

    /// <summary>
    /// 更新所有订单等待时间UI
    /// </summary>
    private void UpdateAllOrderWaitTimeUI()
    {
        var customers = CustomerSpawner.Instance.GetCurrentDisplayCustomers();
        foreach (var customer in customers)
        {
            if (!orderUIPanels.ContainsKey(customer.CustomerOrder.OrderId)) continue;

            GameObject panelObj = orderUIPanels[customer.CustomerOrder.OrderId];
            Slider waitTimeSlider = panelObj.transform.Find("WaitTimeSlider").GetComponent<Slider>();
            Image timeoutWarning = panelObj.transform.Find("TimeoutWarning").GetComponent<Image>();

            // 更新滑块值
            waitTimeSlider.value = customer.WaitTime;
            
            // 显示超时警告（剩余时间<20%）
            bool showWarning = customer.WaitTime / customer.CustomerOrder.MaxWaitTime < 0.2f;
            timeoutWarning.sprite = TimeoutWarningSprite;
            timeoutWarning.enabled = showWarning;
        }
    }

    /// <summary>
    /// 更新订单评价UI
    /// </summary>
    private void UpdateOrderEvaluationUI(string orderId, float score)
    {
        if (!orderUIPanels.ContainsKey(orderId)) return;

        GameObject panelObj = orderUIPanels[orderId];
        Image evaluationIcon = panelObj.transform.Find("EvaluationIcon").GetComponent<Image>();

        // 设置评价图标
        evaluationIcon.sprite = score >= EvaluationSystem.Instance.GoodReviewThreshold 
            ? GoodReviewSprite : BadReviewSprite;
        evaluationIcon.enabled = true;

        // 禁用上菜按钮
        Button serveButton = panelObj.transform.Find("ServeButton").GetComponent<Button>();
        serveButton.interactable = false;
    }

    /// <summary>
    /// 清空所有订单UI
    /// </summary>
    private void ClearAllOrderUI()
    {
        foreach (var panelObj in orderUIPanels.Values)
        {
            Destroy(panelObj);
        }
        orderUIPanels.Clear();
    }
}