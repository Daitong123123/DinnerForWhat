using UnityEngine;

[RequireComponent(typeof(SpriteRenderer))]
public class FoodBase : MonoBehaviour
{
    [Header("食物基础配置")]
    public FoodSO foodSO;          // 关联的FoodSO配置文件
    public int amount = 1;         // 食物数量（堆叠数）
    public int currentFreshness;   // 当前新鲜度（初始=最大新鲜度）
    public bool isDestroyOnSpoil = true; // 新鲜度为0时是否销毁

    [Header("组件引用")]
    [SerializeField] private SpriteRenderer _spriteRenderer; // 食物渲染组件

    // 缓存当前操作类型（与FoodSO联动）
    private FoodOperationType? _currentOperation;

    private void Awake()
    {
        // 初始化组件引用
        if (_spriteRenderer == null)
        {
            _spriteRenderer = GetComponent<SpriteRenderer>();
        }

        // 初始化新鲜度
        if (foodSO != null)
        {
            currentFreshness = foodSO.maxFreshness;
            // 初始化显示默认Sprite和名称
            UpdateFoodSprite();
        }
        else
        {
            Debug.LogError($"[{gameObject.name}] 未配置FoodSO！");
        }
    }

    #region 基础属性获取（封装）
    /// <summary>
    /// 获取当前食物显示名称
    /// </summary>
    public string GetFoodName()
    {
        if (foodSO == null) return "未知食物";
        return foodSO.GetCurrentName();
    }

    /// <summary>
    /// 获取当前食物Sprite
    /// </summary>
    public Sprite GetFoodSprite()
    {
        if (foodSO == null) return null;
        return foodSO.GetCurrentSprite();
    }

    /// <summary>
    /// 获取当前操作类型
    /// </summary>
    public FoodOperationType? GetCurrentOperation()
    {
        if (foodSO == null) return null;
        return foodSO.GetCurrentOperation();
    }

    /// <summary>
    /// 检查食物是否新鲜
    /// </summary>
    public bool IsFresh()
    {
        if (foodSO == null) return false;
        return currentFreshness > 0 && currentFreshness <= foodSO.maxFreshness;
    }
    #endregion

    #region 核心操作方法（可重写扩展）
    /// <summary>
    /// 执行通用操作（底层逻辑，所有操作都走这里）
    /// </summary>
    /// <param name="operation">要执行的操作</param>
    /// <returns>是否执行成功</returns>
    protected virtual bool ExecuteOperation(FoodOperationType operation)
    {
        if (foodSO == null)
        {
            Debug.LogError($"[{gameObject.name}] FoodSO为空，无法执行{operation}操作！");
            return false;
        }

        // 检查操作是否支持
        if (!foodSO.IsOperationSupported(operation))
        {
            Debug.LogWarning($"[{GetFoodName()}] 不支持{operation}操作！");
            return false;
        }

        // 检查食物是否新鲜
        if (!IsFresh())
        {
            Debug.LogWarning($"[{GetFoodName()}] 已变质，无法执行{operation}操作！");
            return false;
        }

        // 关键修复：先初始化FoodSO的字典（防止OnEnable未执行）
        foodSO.InitOperationConfigDict();

        // 设置FoodSO的操作状态
        bool isSuccess = foodSO.SetCurrentOperation(operation);
        if (isSuccess)
        {
            _currentOperation = operation;
            // 强制更新Sprite（新增：立即刷新）
            UpdateFoodSprite();
            Debug.Log($"✅ [{GetFoodName()}] {operation}操作执行成功，Sprite已更新");
            // 触发操作完成事件
            OnOperationCompleted(operation);
        }
        else
        {
            Debug.LogWarning($"[{GetFoodName()}] {operation}操作设置失败！");
        }

        return isSuccess;
    }

    /// <summary>
    /// 切操作（封装）
    /// </summary>
    public virtual bool Cut()
    {
        return ExecuteOperation(FoodOperationType.Cut);
    }

    /// <summary>
    /// 搅拌操作（封装）
    /// </summary>
    public virtual bool Stir()
    {
        return ExecuteOperation(FoodOperationType.Stir);
    }

    /// <summary>
    /// 煮操作（封装）
    /// </summary>
    public virtual bool Boil()
    {
        return ExecuteOperation(FoodOperationType.Boil);
    }

    /// <summary>
    /// 煎操作（封装）
    /// </summary>
    public virtual bool Fry()
    {
        return ExecuteOperation(FoodOperationType.Fry);
    }

    /// <summary>
    /// 蒸操作（封装）
    /// </summary>
    public virtual bool Steam()
    {
        return ExecuteOperation(FoodOperationType.Steam);
    }

    /// <summary>
    /// 烤操作（封装）
    /// </summary>
    public virtual bool Bake()
    {
        return ExecuteOperation(FoodOperationType.Bake);
    }

    /// <summary>
    /// 重置操作（恢复初始状态）
    /// </summary>
    public virtual void ResetOperation()
    {
        if (foodSO != null)
        {
            foodSO.ResetCurrentOperation();
            _currentOperation = null;
            UpdateFoodSprite();
            OnOperationReset();
        }
    }
    #endregion

    #region 辅助方法
    /// <summary>
    /// 更新食物Sprite显示（强化：增加日志排查）
    /// </summary>
    public void UpdateFoodSprite()
    {
        if (_spriteRenderer == null)
        {
            Debug.LogError($"[{gameObject.name}] SpriteRenderer组件缺失！");
            return;
        }

        if (foodSO == null)
        {
            Debug.LogError($"[{gameObject.name}] FoodSO为空，无法更新Sprite！");
            return;
        }

        Sprite targetSprite = foodSO.GetCurrentSprite();
        if (targetSprite == null)
        {
            Debug.LogWarning($"[{GetFoodName()}] 当前操作{foodSO.GetCurrentOperation()}无对应Sprite，使用默认Sprite");
            targetSprite = foodSO.defaultSprite;
        }

        _spriteRenderer.sprite = targetSprite;
        Debug.Log($"🎨 [{GetFoodName()}] Sprite更新完成，当前Sprite：{targetSprite?.name ?? "空"}");
    }

    /// <summary>
    /// 减少新鲜度（对接时间系统）
    /// </summary>
    /// <param name="value">减少的数值</param>
    public void ReduceFreshness(int value)
    {
        if (foodSO == null) return;

        currentFreshness = Mathf.Max(0, currentFreshness - value);
        // 检查是否变质
        if (currentFreshness <= 0)
        {
            OnFoodSpoil();
        }
    }

    /// <summary>
    /// 设置新的返回点（对接拖动脚本）
    /// </summary>
    public void SetReturnPosition(Vector2 newPos)
    {
        // 可对接之前的拖动脚本，比如：
        // DraggableItem draggable = GetComponent<DraggableItem>();
        // if (draggable != null) draggable.SetNewReturnPosition(newPos);
    }

    /// <summary>
    /// 堆叠食物数量
    /// </summary>
    /// <param name="addAmount">要添加的数量</param>
    public void AddAmount(int addAmount)
    {
        amount = Mathf.Max(1, amount + addAmount);
    }
    #endregion

    #region 生命周期事件（可重写扩展）
    /// <summary>
    /// 操作完成时触发（可重写）
    /// </summary>
    protected virtual void OnOperationCompleted(FoodOperationType operation)
    {
        Debug.Log($"[{GetFoodName()}] 完成{operation}操作！");
        // 可扩展：播放操作音效、触发食谱检测、更新UI等
    }

    /// <summary>
    /// 食物变质时触发（可重写）
    /// </summary>
    protected virtual void OnFoodSpoil()
    {
        Debug.Log($"[{GetFoodName()}] 已变质！");
        // 变质后更新Sprite（可在FoodSO中配置变质Sprite）
        // 这里简化处理：变色或销毁
        if (isDestroyOnSpoil)
        {
            Destroy(gameObject);
        }
        else
        {
            _spriteRenderer.color = new Color(0.5f, 0.5f, 0.5f, 0.8f); // 变灰
        }
    }

    /// <summary>
    /// 操作重置时触发（可重写）
    /// </summary>
    protected virtual void OnOperationReset()
    {
        Debug.Log($"[{GetFoodName()}] 操作已重置！");
    }
    #endregion

    #region 外部调用接口（灵活扩展）
    /// <summary>
    /// 强制更新Sprite（外部调用）
    /// </summary>
    public void ForceUpdateSprite()
    {
        UpdateFoodSprite();
    }

    /// <summary>
    /// 设置新的FoodSO（动态切换食物配置）
    /// </summary>
    public void SetFoodSO(FoodSO newFoodSO)
    {
        foodSO = newFoodSO;
        currentFreshness = foodSO.maxFreshness;
        UpdateFoodSprite();
    }

    /// <summary>
    /// 手动设置新鲜度
    /// </summary>
    public void SetFreshness(int newValue)
    {
        currentFreshness = Mathf.Clamp(newValue, 0, foodSO.maxFreshness);
        if (currentFreshness <= 0)
        {
            OnFoodSpoil();
        }
    }
    #endregion
}