using System.Collections.Generic;
using UnityEngine;

public class CustomerSpawner : MonoBehaviour
{
    // 单例实例
    public static CustomerSpawner Instance { get; private set; }

    // 配置参数
    [Header("生成配置")]
    public int MaxDisplayCustomers = 4; // 最大显示顾客数（界面上的4个）
    public float SpawnIntervalMin = 10f; // 最小生成间隔（秒）
    public float SpawnIntervalMax = 20f; // 最大生成间隔（秒）
    public List<Sprite> CustomerSprites; // 顾客形象列表（关联美术资源）
    public List<string> AvailableRecipeIds; // 可生成订单的食谱ID

    // 运行时数据
    private List<Customer> currentCustomers = new List<Customer>(); // 当前显示的顾客
    private Queue<Customer> waitingCustomers = new Queue<Customer>(); // 排队顾客队列
    private float nextSpawnTime; // 下次生成时间

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
            ResetSpawner();
        }
    }

    private void OnEnable()
    {
        // 订阅游戏状态变更事件
        GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
    }

    private void OnDisable()
    {
        GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
    }

    private void Update()
    {
        if (GameManager.Instance.CurrentGameState != GameState.Stalling) return;

        // 1. 更新顾客等待时间
        UpdateCustomerWaitTime();

        // 2. 检查是否需要生成新顾客
        if (Time.time >= nextSpawnTime && currentCustomers.Count < MaxDisplayCustomers)
        {
            SpawnNewCustomer();
            // 重置生成计时器
            nextSpawnTime = Time.time + Random.Range(SpawnIntervalMin, SpawnIntervalMax);
        }

        // 3. 更新排队人数事件
        GameEventSystem.Instance.TriggerEvent("QueueCountUpdated", GetTotalQueueCount());
    }

    /// <summary>
    /// 游戏状态变更回调
    /// </summary>
    private void OnGameStateChanged(GameState newState)
    {
        if (newState == GameState.Stalling)
        {
            // 开始摆摊，初始化生成计时器
            nextSpawnTime = Time.time + Random.Range(SpawnIntervalMin / 2, SpawnIntervalMax / 2);
        }
        else
        {
            // 收摊/闲置，重置生成器
            ResetSpawner();
        }
    }

    /// <summary>
    /// 生成新顾客
    /// </summary>
    private void SpawnNewCustomer()
    {
        if (AvailableRecipeIds.Count == 0)
        {
            Debug.LogWarning("无可用食谱ID，无法生成顾客订单");
            return;
        }

        // 创建顾客
        Customer newCustomer = new Customer();
        newCustomer.CustomerName = $"顾客{currentCustomers.Count + 1}";
        newCustomer.CustomerSprite = CustomerSprites[Random.Range(0, CustomerSprites.Count)];
        newCustomer.WaitTime = 60f; // 默认等待60秒

        // 创建订单
        Order newOrder = new Order();
        newOrder.CustomerId = newCustomer.CustomerId;
        newOrder.RecipeId = AvailableRecipeIds[Random.Range(0, AvailableRecipeIds.Count)];
        newOrder.OrderCreateTime = Time.time;
        newOrder.IsPriority = currentCustomers.Count == 0; // 第一个顾客为优先订单

        // 关联订单
        newCustomer.CustomerOrder = newOrder;
        newCustomer.IsPriority = newOrder.IsPriority;

        // 添加到显示列表
        currentCustomers.Add(newCustomer);

        // 触发新订单事件
        GameEventSystem.Instance.TriggerEvent(GameEventSystem.EventNames.OrderCreated, newOrder);
        
        Debug.Log($"生成新顾客：{newCustomer.CustomerName}，需求：{newOrder.RecipeId}");
    }

    /// <summary>
    /// 更新顾客等待时间
    /// </summary>
    private void UpdateCustomerWaitTime()
    {
        List<Customer> leftCustomers = new List<Customer>();

        foreach (var customer in currentCustomers)
        {
            if (customer.State == CustomerState.Waiting)
            {
                bool isTimeout = customer.UpdateWaitTime(Time.deltaTime);
                if (isTimeout)
                {
                    leftCustomers.Add(customer);
                    Debug.Log($"顾客{customer.CustomerName}等待超时离开");
                }
            }
        }

        // 移除超时离开的顾客
        foreach (var customer in leftCustomers)
        {
            RemoveCustomer(customer);
            // 补充排队顾客
            TryAddWaitingCustomerToDisplay();
        }
    }

    /// <summary>
    /// 为指定顾客上菜
    /// </summary>
    /// <param name="customerIndex">顾客索引（0为第一个）</param>
    /// <returns>是否上菜成功</returns>
    public bool ServeCustomer(int customerIndex)
    {
        if (customerIndex < 0 || customerIndex >= currentCustomers.Count) return false;

        var customer = currentCustomers[customerIndex];
        if (customer.State != CustomerState.Waiting) return false;

        // 从暂存区取菜品
        var dish = DishStorage.Instance.TakeNextDish();
        if (dish == null) return false;

        // 匹配订单
        bool isMatch = customer.ServeDish(dish);
        if (isMatch)
        {
            // 触发付款和评价
            PaymentSystem.Instance.ProcessPayment(customer, dish);
            EvaluationSystem.Instance.EvaluateDish(customer, dish.DishScore);

            // 完成顾客交互
            customer.CompleteInteraction(dish.DishScore);

            // 移除已完成的顾客
            RemoveCustomer(customer);

            // 补充排队顾客
            TryAddWaitingCustomerToDisplay();
            
            return true;
        }
        else
        {
            // 菜品不匹配，归还到暂存区（简化处理）
            DishStorage.Instance.StoreDish(dish);
            Debug.Log($"菜品不匹配：顾客{customer.CustomerName}需求{customer.CustomerOrder.RecipeId}，实际{ish.RecipeId}");
            return false;
        }
    }

    /// <summary>
    /// 移除顾客
    /// </summary>
    private void RemoveCustomer(Customer customer)
    {
        currentCustomers.Remove(customer);
        // 若有排队顾客，加入显示列表
        TryAddWaitingCustomerToDisplay();
    }

    /// <summary>
    /// 尝试将排队顾客加入显示列表
    /// </summary>
    private void TryAddWaitingCustomerToDisplay()
    {
        if (waitingCustomers.Count > 0 && currentCustomers.Count < MaxDisplayCustomers)
        {
            var waitingCustomer = waitingCustomers.Dequeue();
            waitingCustomer.IsPriority = currentCustomers.Count == 0;
            waitingCustomer.CustomerOrder.IsPriority = waitingCustomer.IsPriority;
            currentCustomers.Add(waitingCustomer);
        }
    }

    /// <summary>
    /// 获取总排队人数（显示+等待）
    /// </summary>
    /// <returns>总人数</returns>
    public int GetTotalQueueCount()
    {
        return currentCustomers.Count + waitingCustomers.Count;
    }

    /// <summary>
    /// 获取当前显示的顾客列表
    /// </summary>
    /// <returns>顾客列表</returns>
    public List<Customer> GetCurrentDisplayCustomers()
    {
        return new List<Customer>(currentCustomers);
    }

    /// <summary>
    /// 重置生成器
    /// </summary>
    private void ResetSpawner()
    {
        currentCustomers.Clear();
        waitingCustomers.Clear();
        nextSpawnTime = 0;
    }
}