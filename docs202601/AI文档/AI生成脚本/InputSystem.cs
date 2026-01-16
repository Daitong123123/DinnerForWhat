using UnityEngine;
using UnityEngine.EventSystems;

public class InputSystem : MonoBehaviour
{
    // 单例实例
    public static InputSystem Instance { get; private set; }

    // 输入配置
    [Header("输入配置")]
    public float TouchDragThreshold = 5f; // 触摸拖动阈值
    public KeyCode InteractKey = KeyCode.Space; // 交互按键
    public KeyCode CancelKey = KeyCode.Escape; // 取消按键
    public KeyCode PhoneKey = KeyCode.P; // 打开手机按键

    // 输入状态
    private Vector2 touchStartPosition; // 触摸起始位置
    private bool isDragging = false; // 是否正在拖动
    private bool isTouchDown = false; // 是否触摸按下

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

    private void Update()
    {
        // 处理键盘输入
        HandleKeyboardInput();
        
        // 处理触摸输入
        if (Input.touchSupported)
        {
            HandleTouchInput();
        }
        
        // 处理鼠标输入（作为触摸的替代）
        if (!Input.touchSupported || Input.mousePresent)
        {
            HandleMouseInput();
        }
    }

    /// <summary>
    /// 处理键盘输入
    /// </summary>
    private void HandleKeyboardInput()
    {
        // 交互按键
        if (Input.GetKeyDown(InteractKey))
        {
            TriggerInteractInput();
        }

        // 取消按键
        if (Input.GetKeyDown(CancelKey))
        {
            TriggerCancelInput();
        }

        // 打开手机按键
        if (Input.GetKeyDown(PhoneKey))
        {
            TriggerPhoneInput();
        }

        // 数字键快速选择（1-4选择顾客/菜品）
        for (int i = 1; i <= 4; i++)
        {
            if (Input.GetKeyDown(KeyCode.Alpha0 + i))
            {
                TriggerNumberInput(i);
            }
        }
    }

    /// <summary>
    /// 处理触摸输入
    /// </summary>
    private void HandleTouchInput()
    {
        if (Input.touches.Length == 0)
        {
            // 无触摸
            isTouchDown = false;
            isDragging = false;
            return;
        }

        Touch touch = Input.touches[0];

        switch (touch.phase)
        {
            case TouchPhase.Began:
                // 触摸开始
                isTouchDown = true;
                touchStartPosition = touch.position;
                isDragging = false;
                break;

            case TouchPhase.Moved:
                // 触摸移动
                float dragDistance = Vector2.Distance(touch.position, touchStartPosition);
                if (dragDistance > TouchDragThreshold)
                {
                    isDragging = true;
                    // 触发拖动事件
                    TriggerDragInput(touch.position - touchStartPosition);
                }
                break;

            case TouchPhase.Ended:
                // 触摸结束
                isTouchDown = false;
                if (!isDragging)
                {
                    // 点击事件（未拖动）
                    TriggerTapInput(touch.position);
                }
                isDragging = false;
                break;

            case TouchPhase.Canceled:
                // 触摸取消
                isTouchDown = false;
                isDragging = false;
                break;
        }
    }

    /// <summary>
    /// 处理鼠标输入
    /// </summary>
    private void HandleMouseInput()
    {
        // 鼠标按下
        if (Input.GetMouseButtonDown(0))
        {
            isTouchDown = true;
            touchStartPosition = Input.mousePosition;
            isDragging = false;
        }

        // 鼠标移动
        if (Input.GetMouseButton(0) && isTouchDown)
        {
            float dragDistance = Vector2.Distance(Input.mousePosition, touchStartPosition);
            if (dragDistance > TouchDragThreshold)
            {
                isDragging = true;
                // 触发拖动事件
                TriggerDragInput((Vector2)Input.mousePosition - touchStartPosition);
            }
        }

        // 鼠标抬起
        if (Input.GetMouseButtonUp(0))
        {
            isTouchDown = false;
            if (!isDragging && !IsPointerOverUI())
            {
                // 点击事件（未拖动且不在UI上）
                TriggerTapInput(Input.mousePosition);
            }
            isDragging = false;
        }
    }

    /// <summary>
    /// 检查指针是否在UI上
    /// </summary>
    private bool IsPointerOverUI()
    {
        if (EventSystem.current == null) return false;
        return EventSystem.current.IsPointerOverGameObject() || 
               (Input.touchSupported && Input.touches.Length > 0 && 
                EventSystem.current.IsPointerOverGameObject(Input.touches[0].fingerId));
    }

    // ==================== 输入事件触发 ====================
    /// <summary>
    /// 触发交互输入
    /// </summary>
    private void TriggerInteractInput()
    {
        GameEventSystem.Instance.TriggerEvent("Input_Interact", true);
    }

    /// <summary>
    /// 触发取消输入
    /// </summary>
    private void TriggerCancelInput()
    {
        GameEventSystem.Instance.TriggerEvent("Input_Cancel", true);
        
        // 默认取消行为：关闭弹窗/手机/面板
        if (PopupWindow.Instance != null && PopupWindow.Instance.gameObject.activeSelf)
        {
            PopupWindow.Instance.HidePopup();
        }
        else if (PhoneUISystem.Instance != null && PhoneUISystem.Instance.gameObject.activeSelf)
        {
            PhoneUISystem.Instance.HidePhone();
        }
        else
        {
            // 返回主界面UI
            UIManager.Instance.ShowUIPanel(UIType.Main);
        }
    }

    /// <summary>
    /// 触发打开手机输入
    /// </summary>
    private void TriggerPhoneInput()
    {
        GameEventSystem.Instance.TriggerEvent("Input_Phone", true);
        
        // 切换手机显示状态
        if (PhoneUISystem.Instance != null)
        {
            if (PhoneUISystem.Instance.gameObject.activeSelf)
            {
                PhoneUISystem.Instance.HidePhone();
            }
            else
            {
                PhoneUISystem.Instance.ShowPhone();
            }
        }
    }

    /// <summary>
    /// 触发数字输入
    /// </summary>
    private void TriggerNumberInput(int number)
    {
        GameEventSystem.Instance.TriggerEvent("Input_Number", number);
        
        // 默认数字行为：选择对应序号的顾客上菜
        if (GameManager.Instance.CurrentGameState == GameState.Stalling)
        {
            CustomerSpawner.Instance.ServeCustomer(number - 1);
        }
    }

    /// <summary>
    /// 触发点击输入
    /// </summary>
    private void TriggerTapInput(Vector2 position)
    {
        GameEventSystem.Instance.TriggerEvent("Input_Tap", position);
        
        // 转换为世界坐标（用于场景交互）
        Vector3 worldPosition = Camera.main.ScreenToWorldPoint(new Vector3(position.x, position.y, Camera.main.nearClipPlane));
        GameEventSystem.Instance.TriggerEvent("Input_Tap_World", worldPosition);
    }

    /// <summary>
    /// 触发拖动输入
    /// </summary>
    private void TriggerDragInput(Vector2 delta)
    {
        GameEventSystem.Instance.TriggerEvent("Input_Drag", delta);
    }

    // ==================== 公共API ====================
    /// <summary>
    /// 检查是否有任意输入（按键/触摸/鼠标）
    /// </summary>
    public bool HasAnyInput()
    {
        return Input.anyKeyDown || isTouchDown || Input.GetMouseButtonDown(0);
    }

    /// <summary>
    /// 获取当前触摸/鼠标位置
    /// </summary>
    public Vector2 GetCurrentInputPosition()
    {
        if (Input.touchSupported && Input.touches.Length > 0)
        {
            return Input.touches[0].position;
        }
        else
        {
            return Input.mousePosition;
        }
    }

    /// <summary>
    /// 检查是否正在拖动
    /// </summary>
    public bool IsDragging()
    {
        return isDragging;
    }

    /// <summary>
    /// 注册交互输入回调
    /// </summary>
    public void RegisterInteractCallback(System.Action callback)
    {
        GameEventSystem.Instance.Subscribe("Input_Interact", (data) => callback?.Invoke());
    }

    /// <summary>
    /// 注册取消输入回调
    /// </summary>
    public void RegisterCancelCallback(System.Action callback)
    {
        GameEventSystem.Instance.Subscribe("Input_Cancel", (data) => callback?.Invoke());
    }
}