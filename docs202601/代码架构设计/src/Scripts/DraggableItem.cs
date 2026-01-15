using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections.Generic;

[RequireComponent(typeof(Collider2D))]
[RequireComponent(typeof(AudioSource))]
public class DraggableItem : MonoBehaviour, IPointerDownHandler, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    [Header("拖动手感配置（核心）")]
    public bool isDraggable = true;
    public float dragSmoothTime = 0.05f; // 顺滑时间（越小越跟手，推荐0.03-0.08）
    public float returnSpeed = 8f;       // 返回速度（匀速）
    public float dragDeadZone = 0.01f;   // 死区（防止微小抖动）

    [Header("音效设置")]
    public AudioClip dragStartClip;
    public AudioClip dragEndClip;
    [Range(0f, 1f)] public float soundVolume = 0.8f;

    [Header("厨具检测")]
    public LayerMask toolLayer; // 赋值为厨具所在Layer（如Tool）
    private bool _isOverTool = false; // 是否悬浮在厨具上
    private ToolBase _currentOverTool; // 当前悬浮的厨具

    // 核心顺滑变量（纯2D，仅X/Y）
    private Vector2 _dragVelocity;
    private Vector2 _targetPosition;
    private Vector2 _originalPosition;
    private Vector2 _targetReturnPosition;
    private bool _isReturning = false;
    private Camera _mainCamera;
    private AudioSource _audioSource;
    private Transform _selfTransform;

    // 全局拖动状态
    private static DraggableItem _currentDraggedItem;

    private void Awake()
    {
        _selfTransform = transform;
        _audioSource = GetComponent<AudioSource>();
        _mainCamera = Camera.main;

        // 初始化2D位置（仅X/Y）
        _originalPosition = new Vector2(_selfTransform.position.x, _selfTransform.position.y);
        _targetReturnPosition = _originalPosition;
        _targetPosition = _originalPosition;

        // 音效初始化
        _audioSource.volume = soundVolume;
        _audioSource.playOnAwake = false;
    }

    private void Update()
    {
        if (_currentDraggedItem == this)
        {
            // 1. 实时检测是否悬浮在厨具上
            CheckHoverTool();

            // 2. 纯2D丝滑跟随鼠标（SmoothDamp 最丝滑的2D跟随算法）
            Vector2 currentPos = new Vector2(_selfTransform.position.x, _selfTransform.position.y);
            Vector2 smoothPos = Vector2.SmoothDamp(
                currentPos,
                _targetPosition,
                ref _dragVelocity,
                dragSmoothTime,
                Mathf.Infinity,
                Time.unscaledDeltaTime // 不受时间缩放影响
            );

            // 仅更新X/Y轴（彻底移除Z轴）
            _selfTransform.position = new Vector3(smoothPos.x, smoothPos.y, _selfTransform.position.z);

            // 死区优化：距离过小时直接吸附
            if (Vector2.Distance(currentPos, _targetPosition) < dragDeadZone)
            {
                _selfTransform.position = new Vector3(_targetPosition.x, _targetPosition.y, _selfTransform.position.z);
                _dragVelocity = Vector2.zero;
            }
        }
        else if (_isReturning)
        {
            // 返回原地用 MoveTowards 匀速更丝滑（纯2D）
            ReturnToPosition();
        }
    }

    #region 拖动接口实现（纯2D）
    public void OnPointerDown(PointerEventData eventData)
    {
        if (_currentDraggedItem != null || !isDraggable) return;
        // 按下时预计算2D目标位置
        Vector2 mouseWorldPos = _mainCamera.ScreenToWorldPoint(eventData.position);
        _targetPosition = new Vector2(mouseWorldPos.x, mouseWorldPos.y);
    }

    public void OnBeginDrag(PointerEventData eventData)
    {
        if (_currentDraggedItem != null || !isDraggable) return;

        // 全局状态标记
        _currentDraggedItem = this;
        _isReturning = false;
        _isOverTool = false;
        _currentOverTool = null;

        // 播放音效
        PlaySound(dragStartClip);

        // 初始化拖动速度
        _dragVelocity = Vector2.zero;
    }

    public void OnDrag(PointerEventData eventData)
    {
        if (_currentDraggedItem != this || !isDraggable) return;

        // 仅更新2D目标位置（移除Z轴）
        Vector2 mouseWorldPos = _mainCamera.ScreenToWorldPoint(eventData.position);
        _targetPosition = new Vector2(mouseWorldPos.x, mouseWorldPos.y);
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        if (_currentDraggedItem != this) return;

        // 播放音效
        PlaySound(dragEndClip);

        // 全局状态重置
        _currentDraggedItem = null;

        // 核心逻辑：悬浮在厨具上则触发UI，否则返回原地
        if (_isOverTool && _currentOverTool != null)
        {
            TriggerToolOperation();
            _isReturning = false; // 不返回
        }
        else
        {
            _isReturning = true; // 返回原地
            _dragVelocity = Vector2.zero; // 清空速度防止惯性
        }
    }
    #endregion

    #region 核心：2D厨具检测（无Z轴）
    /// <summary>
    /// 实时检测鼠标是否悬浮在厨具上（纯2D射线检测）
    /// </summary>
    private void CheckHoverTool()
    {
        // 1. 获取纯2D鼠标世界坐标（仅X/Y）
        Vector2 mouseWorldPos = _mainCamera.ScreenToWorldPoint(Input.mousePosition);
        mouseWorldPos = new Vector2(mouseWorldPos.x, mouseWorldPos.y);

        // 2. 2D射线检测（仅检测Tool层，无Z轴）
        RaycastHit2D hit = Physics2D.Raycast(
            mouseWorldPos,
            Vector2.zero, // 2D射线方向为0，仅检测当前点
            0f,
            toolLayer
        );

        // 新增：打印检测结果
        Debug.Log($"🎯 鼠标位置：{mouseWorldPos}，检测到物体：{(hit ? hit.collider.gameObject.name : "无")}");

        // 3. 检测结果处理
        if (hit)
        {
            ToolBase tool = hit.collider.GetComponent<ToolBase>();
            if (tool != null && tool.toolSO != null)
            {
                Debug.Log($"🔧 检测到厨具：{tool.toolSO.toolName}，支持的操作：{string.Join(",", tool.toolSO.supportedOperations)}"); // 新增
                                                                                                                         // 检查操作是否匹配
                FoodBase food = GetComponent<FoodBase>();
                Debug.Log($"🍅 食材支持的操作：{string.Join(",", food.foodSO.supportedOperations)}"); // 新增
                bool isMatch = IsOperationMatch(food, tool);
                Debug.Log($"✅ 操作匹配结果：{isMatch}"); // 新增

                if (isMatch)
                {
                    // 悬浮在匹配的厨具上
                    _isOverTool = true;
                    _currentOverTool = tool;
                    return;
                }
            }
        }

        // 未检测到匹配厨具
        _isOverTool = false;
        _currentOverTool = null;
    }

    /// <summary>
    /// 检查食材与厨具的操作是否匹配
    /// </summary>
    private bool IsOperationMatch(FoodBase food, ToolBase tool)
    {
        if (food == null || food.foodSO == null || tool == null || tool.toolSO == null)
            return false;

        foreach (var foodOp in food.foodSO.supportedOperations)
        {
            if (tool.toolSO.IsOperationSupported(foodOp))
                return true;
        }
        return false;
    }

    /// <summary>
    /// 触发厨具操作UI（纯2D）
    /// </summary>
    private void TriggerToolOperation()
    {
        FoodBase food = GetComponent<FoodBase>();
        if (food == null || _currentOverTool == null)
        {
            Debug.Log("❌ TriggerToolOperation失败：食材或厨具为空"); // 新增
            return;
        }

        // 获取匹配的操作列表
        List<FoodOperationType> matchOps = GetMatchOperations(food, _currentOverTool);
        Debug.Log($"🔍 匹配的操作数：{matchOps.Count}，操作列表：{string.Join(",", matchOps)}"); // 新增

        if (matchOps.Count == 0)
        {
            Debug.LogWarning("❌ 无匹配的操作，无法生成UI"); // 新增
            return;
        }

        // 调用UI管理器生成操作按钮（2D厨具位置）
        if (OperationSelectUIManager.Instance != null)
        {
            Debug.Log("✅ 开始调用ShowOperationUI生成UI"); // 新增
            OperationSelectUIManager.Instance.ShowOperationUI(food, _currentOverTool, matchOps);
        }
        else
        {
            Debug.LogError("❌ OperationSelectUIManager.Instance 为空！"); // 新增
        }
    }
    #endregion

    #region 辅助方法（纯2D）
    /// <summary>
    /// 2D匀速返回原地（仅X/Y轴）
    /// </summary>
    private void ReturnToPosition()
    {
        Vector2 currentPos = new Vector2(_selfTransform.position.x, _selfTransform.position.y);
        float distance = Vector2.Distance(currentPos, _targetReturnPosition);

        // 到达目标位置
        if (distance < dragDeadZone)
        {
            _selfTransform.position = new Vector3(_targetReturnPosition.x, _targetReturnPosition.y, _selfTransform.position.z);
            _isReturning = false;
            _dragVelocity = Vector2.zero;
            return;
        }

        // 2D匀速移动（仅X/Y）
        Vector2 movePos = Vector2.MoveTowards(
            currentPos,
            _targetReturnPosition,
            returnSpeed * Time.unscaledDeltaTime
        );

        _selfTransform.position = new Vector3(movePos.x, movePos.y, _selfTransform.position.z);
    }

    /// <summary>
    /// 获取食材与厨具的匹配操作列表
    /// </summary>
    private List<FoodOperationType> GetMatchOperations(FoodBase food, ToolBase tool)
    {
        List<FoodOperationType> matchOps = new List<FoodOperationType>();
        foreach (var foodOp in food.foodSO.supportedOperations)
        {
            if (tool.toolSO.IsOperationSupported(foodOp))
            {
                matchOps.Add(foodOp);
            }
        }
        return matchOps;
    }

    /// <summary>
    /// 播放音效
    /// </summary>
    private void PlaySound(AudioClip clip)
    {
        if (clip == null || _audioSource == null) return;
        _audioSource.PlayOneShot(clip);
    }
    #endregion

    #region 外部接口（纯2D）
    public static DraggableItem GetCurrentDraggedItem() => _currentDraggedItem;

    public void SetNewReturnPosition(Vector2 newPos)
    {
        // 仅设置2D返回位置
        _targetReturnPosition = new Vector2(newPos.x, newPos.y);
        if (_isReturning) _isReturning = true;
    }

    public void ResetReturnPosition() => _targetReturnPosition = _originalPosition;

    private void OnDestroy()
    {
        if (_currentDraggedItem == this)
        {
            _currentDraggedItem = null;
        }
    }
    #endregion
}