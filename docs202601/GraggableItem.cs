using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.Audio;

[RequireComponent(typeof(Collider2D))] // 2D碰撞体用于检测点击
[RequireComponent(typeof(AudioSource))] // 音频源用于播放音效
public class DraggableItem : MonoBehaviour, IPointerDownHandler, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    [Header("拖动基础设置")]
    [Tooltip("是否允许拖动（可通过代码动态控制）")]
    public bool isDraggable = true;
    [Tooltip("拖动跟随速度（值越大跟随越灵敏）")]
    public float followSpeed = 15f;
    [Tooltip("放手后返回原地的速度（值越大返回越快）")]
    public float returnSpeed = 10f;
    [Tooltip("是否强制绑定（绑定后无法拖动）")]
    private bool _isLocked = false;

    [Header("音效设置")]
    [Tooltip("开始拖动时的音效")]
    public AudioClip dragStartClip;
    [Tooltip("释放物品时的音效")]
    public AudioClip dragEndClip;
    [Tooltip("音效音量")]
    [Range(0f, 1f)]
    public float soundVolume = 0.8f;

    // 核心状态变量
    private Vector2 _originalPosition; // 初始返回点（物体默认位置）
    private Vector2 _targetReturnPosition; // 自定义返回点
    private bool _isReturning = false; // 是否正在返回原地
    private Camera _mainCamera; // 主相机（用于屏幕坐标转世界坐标）
    private AudioSource _audioSource; // 音频源组件
    private Transform _selfTransform; // 缓存自身Transform

    // 静态变量：全局当前拖动物体
    private static DraggableItem _currentDraggedItem;

    #region 生命周期
    private void Awake()
    {
        _selfTransform = transform;
        _audioSource = GetComponent<AudioSource>();
        _mainCamera = Camera.main;

        // 初始化返回点为物体初始位置
        _originalPosition = _selfTransform.position;
        _targetReturnPosition = _originalPosition;

        // 音频源初始化
        _audioSource.volume = soundVolume;
        _audioSource.playOnAwake = false;
    }

    private void Update()
    {
        // 处理返回原地的逻辑
        if (_isReturning)
        {
            ReturnToTargetPosition();
        }
    }
    #endregion

    #region 拖动接口实现
    // 点击按下时（仅检测，不开始拖动）
    public void OnPointerDown(PointerEventData eventData)
    {
        // 如果已有拖动物体/当前物体被锁定/不允许拖动，直接返回
        if (_currentDraggedItem != null || _isLocked || !isDraggable) return;
    }

    // 开始拖动时
    public void OnBeginDrag(PointerEventData eventData)
    {
        if (_currentDraggedItem != null || _isLocked || !isDraggable) return;

        // 设置全局当前拖动物体
        _currentDraggedItem = this;
        // 播放拖动开始音效
        PlaySound(dragStartClip);
        // 停止返回逻辑（如果正在返回）
        _isReturning = false;
    }

    // 拖动过程中
    public void OnDrag(PointerEventData eventData)
    {
        if (_currentDraggedItem != this || _isLocked || !isDraggable) return;

        // 屏幕坐标转世界坐标（适配2D场景）
        Vector2 targetPos = _mainCamera.ScreenToWorldPoint(eventData.position);
        // 顺滑跟随鼠标（Lerp保证移动顺滑）
        _selfTransform.position = Vector2.Lerp(_selfTransform.position, targetPos, Time.deltaTime * followSpeed);
    }

    // 释放拖动时
    public void OnEndDrag(PointerEventData eventData)
    {
        if (_currentDraggedItem != this) return;

        // 播放释放音效
        PlaySound(dragEndClip);
        // 重置全局拖动状态
        _currentDraggedItem = null;
        // 开始返回原地逻辑
        _isReturning = true;
    }
    #endregion

    #region 核心逻辑方法
    // 播放音效
    private void PlaySound(AudioClip clip)
    {
        if (clip == null || _audioSource == null) return;
        _audioSource.PlayOneShot(clip, soundVolume);
    }

    // 返回目标位置（原地/自定义返回点）
    private void ReturnToTargetPosition()
    {
        // 计算当前位置到返回点的距离
        float distance = Vector2.Distance(_selfTransform.position, _targetReturnPosition);
        // 距离小于0.01时，视为到达目标位置
        if (distance < 0.01f)
        {
            _selfTransform.position = _targetReturnPosition;
            _isReturning = false;
            return;
        }

        // 顺滑返回（MoveTowards保证速度恒定，Lerp保证顺滑）
        _selfTransform.position = Vector2.MoveTowards(
            _selfTransform.position,
            _targetReturnPosition,
            returnSpeed * Time.deltaTime
        );
    }
    #endregion

    #region 静态方法（全局获取拖动物体）
    /// <summary>
    /// 静态方法：获取当前正在被拖动的物体
    /// </summary>
    /// <returns>当前拖动的DraggableItem实例，无则返回null</returns>
    public static DraggableItem GetCurrentDraggedItem()
    {
        return _currentDraggedItem;
    }

    /// <summary>
    /// 静态方法：获取当前拖动物体的Transform（快捷方式）
    /// </summary>
    /// <returns>当前拖动物体的Transform，无则返回null</returns>
    public static Transform GetCurrentDraggedTransform()
    {
        return _currentDraggedItem?._selfTransform;
    }

    /// <summary>
    /// 静态方法：强制停止当前所有拖动操作
    /// </summary>
    public static void ForceStopDrag()
    {
        if (_currentDraggedItem != null)
        {
            _currentDraggedItem._isReturning = true;
            _currentDraggedItem = null;
        }
    }
    #endregion

    #region 实例方法（自定义配置）
    /// <summary>
    /// 设置新的返回点（非静态）
    /// </summary>
    /// <param name="newReturnPos">新的返回位置（世界坐标）</param>
    public void SetNewReturnPosition(Vector2 newReturnPos)
    {
        _targetReturnPosition = newReturnPos;
        // 如果物体正在返回，会自动向新返回点移动
        if (_isReturning)
        {
            ReturnToTargetPosition();
        }
    }

    /// <summary>
    /// 重置返回点为初始位置（非静态）
    /// </summary>
    public void ResetReturnPosition()
    {
        _targetReturnPosition = _originalPosition;
        if (_isReturning)
        {
            ReturnToTargetPosition();
        }
    }

    /// <summary>
    /// 强绑定/解锁物品（非静态）
    /// </summary>
    /// <param name="isLocked">true=锁定（禁止拖动），false=解锁（允许拖动）</param>
    public void LockItem(bool isLocked)
    {
        _isLocked = isLocked;
        // 如果锁定时物体正在被拖动，强制停止并返回
        if (isLocked && _currentDraggedItem == this)
        {
            ForceStopDrag();
        }
    }

    /// <summary>
    /// 手动触发返回原地（非静态）
    /// </summary>
    public void ManualReturnToPosition()
    {
        _isReturning = true;
    }
    #endregion

    // 防止场景切换时残留静态变量
    private void OnDestroy()
    {
        if (_currentDraggedItem == this)
        {
            _currentDraggedItem = null;
        }
    }
}