using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
using UnityEngine.UI;

[RequireComponent(typeof(SpriteRenderer))]
[RequireComponent(typeof(SpriteOutline2D))] // 强制关联描边脚本
[RequireComponent(typeof(AudioSource))]
[RequireComponent(typeof(Animator))]
public class ToolBase : MonoBehaviour
{
    [Header("厨具配置")]
    public ToolSO toolSO; // 关联的厨具配置文件

    [Header("运行时状态")]
    public float remainTime; // 操作剩余时间（秒）
    public FoodOperationType currentOperation = FoodOperationType.None; // 当前执行的操作
    public bool isOperating = false; // 是否正在执行操作

    [Header("组件引用")]
    [SerializeField] private SpriteRenderer _spriteRenderer;
    [SerializeField] private SpriteOutline2D _outlineScript;
    [SerializeField] private AudioSource _audioSource;
    [SerializeField] private Animator _animator;
    [SerializeField] private Text _countdownText; // 倒计时UI文本（可选）

    [Header("音效配置")]
    public AudioClip operateStartClip; // 操作开始音效
    public AudioClip operateCompleteClip; // 操作完成音效
    [Range(0f, 1f)] public float soundVolume = 0.8f;

    [Header("描边配置")]
    public Color matchOutlineColor = Color.yellow; // 操作匹配时的描边色
    public Color defaultOutlineColor = Color.white; // 默认描边色

    [Header("食材接管配置")]
    public List<ToolFoodHandleConfig> foodHandleConfigs; // 不同操作的食材处理配置
    private Dictionary<FoodOperationType, ToolFoodHandleConfig> _foodHandleDict;

    // 缓存变量
    private FoodBase _cachedFood; // 缓存被隐藏的食材
    private FoodOperationType _cachedFoodOperation; // 缓存食材的操作类型
    private FoodBase _currentProcessingFood; // 当前处理的食材

    private void Awake()
    {
        // 自动获取组件
        AutoGetComponents();

        // 初始化配置
        if (toolSO != null)
        {
            _spriteRenderer.sprite = toolSO.toolSprite;
            _outlineScript.outlineColor = defaultOutlineColor;
        }

        // 初始化食材处理配置字典
        InitFoodHandleDict();

        // 初始化倒计时UI
        UpdateCountdownUI();
    }

    private void Update()
    {
        // 1. 检测拖动的食材，匹配操作显描边
        CheckDraggedFoodAndUpdateOutline();

        // 2. 执行操作倒计时
        if (isOperating && remainTime > 0)
        {
            remainTime -= Time.deltaTime;
            UpdateCountdownUI();

            // 操作完成
            if (remainTime <= 0)
            {
                CompleteOperation();
            }
        }
    }

    #region 核心初始化
    /// <summary>
    /// 自动获取组件（避免手动拖配）
    /// </summary>
    private void AutoGetComponents()
    {
        if (_spriteRenderer == null) _spriteRenderer = GetComponent<SpriteRenderer>();
        if (_outlineScript == null) _outlineScript = GetComponent<SpriteOutline2D>();
        if (_audioSource == null) _audioSource = GetComponent<AudioSource>();
        if (_animator == null) _animator = GetComponent<Animator>();
        _audioSource.volume = soundVolume;
        _audioSource.playOnAwake = false;
    }

    /// <summary>
    /// 初始化食材处理配置字典
    /// </summary>
    private void InitFoodHandleDict()
    {
        _foodHandleDict = new Dictionary<FoodOperationType, ToolFoodHandleConfig>();
        if (foodHandleConfigs != null && foodHandleConfigs.Count > 0)
        {
            foreach (var config in foodHandleConfigs)
            {
                if (!_foodHandleDict.ContainsKey(config.operationType))
                {
                    _foodHandleDict.Add(config.operationType, config);
                }
            }
        }
    }
    #endregion

    #region 描边逻辑（核心：拖动食材匹配操作）
    /// <summary>
    /// 检测当前拖动的食材，更新描边显示
    /// </summary>
    private void CheckDraggedFoodAndUpdateOutline()
    {
        // 获取当前拖动的食材（对接DraggableItem静态方法）
        DraggableItem draggedItem = DraggableItem.GetCurrentDraggedItem();
        if (draggedItem == null)
        {
            // 无拖动食材，关闭描边
            _outlineScript.SetOutlineEnabled(false);
            return;
        }

        // 获取食材的FoodBase组件
        FoodBase foodBase = draggedItem.GetComponent<FoodBase>();
        if (foodBase == null || foodBase.foodSO == null || toolSO == null)
        {
            _outlineScript.SetOutlineEnabled(false);
            return;
        }

        // 检查食材支持的操作与厨具是否有重叠
        bool isOperationMatch = false;
        foreach (var foodOp in foodBase.foodSO.supportedOperations)
        {
            if (toolSO.IsOperationSupported(foodOp))
            {
                isOperationMatch = true;
                break;
            }
        }

        // 根据匹配结果更新描边
        if (isOperationMatch)
        {
            _outlineScript.outlineColor = matchOutlineColor;
            _outlineScript.SetOutlineEnabled(true);
        }
        else
        {
            _outlineScript.SetOutlineEnabled(false);
        }
    }
    #endregion

    #region 操作方法（核心）
    /// <summary>
    /// 开始执行指定操作（修复：屏蔽Animator警告）
    /// </summary>
    public bool StartOperation(FoodOperationType operation)
    {
        // 校验条件
        if (isOperating)
        {
            Debug.LogWarning($"[{toolSO?.toolName ?? "未知厨具"}] 正在执行其他操作，无法开始{operation}");
            return false;
        }
        if (toolSO == null || !toolSO.IsOperationSupported(operation))
        {
            Debug.LogWarning($"[{toolSO?.toolName ?? "未知厨具"}] 不支持{operation}操作");
            return false;
        }

        // 设置操作状态
        currentOperation = operation;
        isOperating = true;
        remainTime = toolSO.GetOperationDefaultTime(operation);

        // 修复：只在有动画控制器时播放动画，避免警告
        if (_animator != null && _animator.runtimeAnimatorController != null)
        {
            try
            {
                _animator.Play(operation.ToString()); // 动画参数名与枚举名一致
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[{toolSO.toolName}] 动画播放警告（非关键）：{e.Message}");
            }
        }

        // 播放开始音效
        PlaySound(operateStartClip);

        // 更新UI和描边
        UpdateCountdownUI();
        _outlineScript.outlineColor = matchOutlineColor;
        _outlineScript.SetOutlineEnabled(true);

        // 触发操作开始事件
        OnOperationStart(operation);
        return true;
    }

    /// <summary>
    /// 完成当前操作
    /// </summary>
    private void CompleteOperation()
    {
        isOperating = false;
        remainTime = 0;
        FoodOperationType completedOp = currentOperation;
        currentOperation = FoodOperationType.None;

        // 播放完成音效
        PlaySound(operateCompleteClip);

        // 修复：只在有动画控制器时播放Idle动画
        if (_animator != null && _animator.runtimeAnimatorController != null)
        {
            try
            {
                _animator.Play("Idle"); // 假设Idle是默认动画
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[{toolSO?.toolName ?? "未知厨具"}] 动画播放警告（非关键）：{e.Message}");
            }
        }

        // 重置描边
        _outlineScript.outlineColor = defaultOutlineColor;
        _outlineScript.SetOutlineEnabled(false);

        // 更新UI
        UpdateCountdownUI();

        // 触发操作完成事件
        OnOperationComplete(completedOp);
    }

    /// <summary>
    /// 强制停止操作
    /// </summary>
    public void StopOperation()
    {
        isOperating = false;
        remainTime = 0;
        currentOperation = FoodOperationType.None;

        // 修复：动画播放容错
        if (_animator != null && _animator.runtimeAnimatorController != null)
        {
            _animator.Play("Idle");
        }
        _outlineScript.SetOutlineEnabled(false);
        UpdateCountdownUI();

        OnOperationStop();
    }

    /// <summary>
    /// 接管食材（核心：决定隐藏/保留）
    /// </summary>
    /// <param name="food">待处理的食材</param>
    /// <param name="operation">执行的操作</param>
    public void TakeOverFood(FoodBase food, FoodOperationType operation)
    {
        if (food == null)
        {
            Debug.LogError($"[{toolSO?.toolName ?? "未知厨具"}] TakeOverFood：食材为空！");
            return;
        }

        Debug.Log($"🟢 [TakeOverFood] 接管食材：{food.foodSO?.foodName ?? "未知食材"}，操作：{operation}");

        // 获取该操作的食材处理配置
        ToolFoodHandleConfig config = GetFoodHandleConfig(operation);

        // 1. 隐藏/保留食材
        if (config.hideFoodDuringOperation)
        {
            food.gameObject.SetActive(false);
            // 缓存食材，操作完成后恢复
            _cachedFood = food;
            _cachedFoodOperation = operation;
            Debug.Log($"🟢 [TakeOverFood] 隐藏食材并缓存：{food.foodSO?.foodName}");
        }
        else
        {
            // 保留食材，可调整位置到厨具上
            food.transform.position = transform.position + config.foodOffset;
            _cachedFood = food; // 即使不隐藏，也缓存食材（关键！）
            _cachedFoodOperation = operation;
            Debug.Log($"🟢 [TakeOverFood] 保留食材并缓存：{food.foodSO?.foodName}");
        }

        // 2. 记录食材，用于操作完成后更新状态
        _currentProcessingFood = food;
    }

    /// <summary>
    /// 获取操作对应的食材处理配置
    /// </summary>
    private ToolFoodHandleConfig GetFoodHandleConfig(FoodOperationType operation)
    {
        if (_foodHandleDict.TryGetValue(operation, out var config))
        {
            return config;
        }
        // 默认配置：保留食材
        return new ToolFoodHandleConfig()
        {
            operationType = operation,
            hideFoodDuringOperation = false,
            foodOffset = Vector3.zero
        };
    }
    #endregion

    #region 辅助方法（音效/UI/动画）
    /// <summary>
    /// 播放音效
    /// </summary>
    private void PlaySound(AudioClip clip)
    {
        if (clip == null || _audioSource == null) return;
        _audioSource.PlayOneShot(clip, soundVolume);
    }

    /// <summary>
    /// 更新倒计时UI
    /// </summary>
    private void UpdateCountdownUI()
    {
        if (_countdownText == null) return;

        if (isOperating && remainTime > 0)
        {
            _countdownText.gameObject.SetActive(true);
            _countdownText.text = remainTime.ToString("F1"); // 保留1位小数
        }
        else
        {
            _countdownText.gameObject.SetActive(false);
        }
    }

    /// <summary>
    /// 手动更新描边状态（外部调用）
    /// </summary>
    public void SetOutlineState(bool enabled, Color? color = null)
    {
        if (color.HasValue)
        {
            _outlineScript.outlineColor = color.Value;
        }
        _outlineScript.SetOutlineEnabled(enabled);
    }
    #endregion

    #region 扩展方法（按操作类型封装）
    /// <summary>
    /// 切操作
    /// </summary>
    public bool Cut() => StartOperation(FoodOperationType.Cut);

    /// <summary>
    /// 搅拌操作
    /// </summary>
    public bool Stir() => StartOperation(FoodOperationType.Stir);

    /// <summary>
    /// 煮操作
    /// </summary>
    public bool Boil() => StartOperation(FoodOperationType.Boil);

    /// <summary>
    /// 煎操作
    /// </summary>
    public bool Fry() => StartOperation(FoodOperationType.Fry);

    /// <summary>
    /// 蒸操作
    /// </summary>
    public bool Steam() => StartOperation(FoodOperationType.Steam);

    /// <summary>
    /// 烤操作
    /// </summary>
    public bool Bake() => StartOperation(FoodOperationType.Bake);
    #endregion

    #region 生命周期事件（可重写扩展）
    /// <summary>
    /// 操作开始时触发（可重写）
    /// </summary>
    protected virtual void OnOperationStart(FoodOperationType operation)
    {
        Debug.Log($"[{toolSO?.toolName ?? "未知厨具"}] 开始{operation}操作，耗时{remainTime}秒");
    }

    /// <summary>
    /// 操作完成时触发（核心修复：强化食材状态更新）
    /// </summary>
    protected virtual void OnOperationComplete(FoodOperationType operation)
    {
        string toolName = toolSO?.toolName ?? "未知厨具";
        Debug.Log($"[{toolName}] {operation}操作完成");

        // 1. 恢复隐藏的食材 + 更新状态
        if (_cachedFood != null)
        {
            // 确保食材激活
            if (!_cachedFood.gameObject.activeSelf)
            {
                _cachedFood.gameObject.SetActive(true);
            }

            // 补充空值校验
            if (_cachedFood.foodSO == null)
            {
                Debug.LogError($"[{toolName}] 缓存食材未配置FoodSO！");
                _cachedFood = null;
                _cachedFoodOperation = FoodOperationType.None;
                _currentProcessingFood = null;
                return;
            }

            Debug.Log($"🔔 恢复食材显示：{_cachedFood.foodSO.foodName}");

            // 2. 调用食材对应操作方法 + 强制刷新Sprite
            bool isOpSuccess = false;
            switch (operation)
            {
                case FoodOperationType.Cut:
                    isOpSuccess = _cachedFood.Cut();
                    break;
                case FoodOperationType.Stir:
                    isOpSuccess = _cachedFood.Stir();
                    break;
                case FoodOperationType.Boil:
                    isOpSuccess = _cachedFood.Boil();
                    break;
                case FoodOperationType.Fry:
                    isOpSuccess = _cachedFood.Fry();
                    break;
                case FoodOperationType.Steam:
                    isOpSuccess = _cachedFood.Steam();
                    break;
                case FoodOperationType.Bake:
                    isOpSuccess = _cachedFood.Bake();
                    break;
                default:
                    Debug.LogWarning($"[{toolName}] 未处理的操作类型：{operation}");
                    break;
            }

            // 3. 操作成功则强制刷新Sprite + 调整位置
            if (isOpSuccess)
            {
                _cachedFood.ForceUpdateSprite(); // 强制刷新Sprite（兜底）
                Debug.Log($"✅ [{_cachedFood.foodSO.foodName}] {operation}操作执行成功，外观已更新");

                // 调整食材位置
                Vector3 offset = GetFoodHandleConfig(operation).foodOffset;
                _cachedFood.transform.position = transform.position + offset;
            }
            else
            {
                Debug.LogError($"❌ [{_cachedFood.foodSO.foodName}] {operation}操作执行失败！");
            }

            // 4. 重置缓存
            _cachedFood = null;
            _cachedFoodOperation = FoodOperationType.None;
        }

        // 5. 重置当前处理的食材
        _currentProcessingFood = null;
    }

    /// <summary>
    /// 操作停止时触发（可重写）
    /// </summary>
    protected virtual void OnOperationStop()
    {
        Debug.Log($"[{toolSO?.toolName ?? "未知厨具"}] 操作已停止");
    }
    #endregion

    #region 外部配置接口
    /// <summary>
    /// 设置新的厨具配置
    /// </summary>
    public void SetToolSO(ToolSO newToolSO)
    {
        toolSO = newToolSO;
        if (_spriteRenderer != null && newToolSO != null)
        {
            _spriteRenderer.sprite = newToolSO.toolSprite;
        }
    }

    /// <summary>
    /// 手动设置操作耗时
    /// </summary>
    public void SetOperationTime(FoodOperationType operation, float customTime)
    {
        if (toolSO != null && toolSO.IsOperationSupported(operation))
        {
            remainTime = customTime;
        }
    }
    #endregion

    // 防止组件丢失导致空引用
    private void OnValidate()
    {
        AutoGetComponents();
    }
}

// 食材处理配置结构体
[Serializable]
public struct ToolFoodHandleConfig
{
    public FoodOperationType operationType;
    public bool hideFoodDuringOperation; // 操作期间是否隐藏食材
    public Vector3 foodOffset; // 食材相对于厨具的偏移位置
}