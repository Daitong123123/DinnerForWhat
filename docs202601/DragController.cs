using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using Core;

namespace Systems.DragControlSystem
{
    /// <summary>
    /// 拖拽控制系统管理器
    /// 负责处理所有拖拽相关的逻辑和交互
    /// </summary>
    public class DragController : MonoBehaviour
    {
        #region 单例模式
        private static DragController _instance;
        public static DragController Instance
        {
            get
            {
                if (_instance == null)
                {
                    GameObject managerObj = new GameObject("DragController");
                    _instance = managerObj.AddComponent<DragController>();
                    DontDestroyOnLoad(managerObj);
                    Debug.Log("[DragController] 单例初始化：创建新的DragController对象");
                }
                return _instance;
            }
        }
        #endregion

        #region 字段和属性
        /// <summary>
        /// 当前正在拖拽的对象
        /// </summary>
        private IDraggable _currentDraggable;
        
        /// <summary>
        /// 当前鼠标悬停的拖拽目标
        /// </summary>
        private IDragTarget _currentDragTarget;
        
        /// <summary>
        /// 鼠标点击的起始位置
        /// </summary>
        private Vector3 _startMousePosition;
        
        /// <summary>
        /// 拖拽对象的起始位置
        /// </summary>
        private Vector3 _startDragPosition;
        
        /// <summary>
        /// 拖拽的阈值（像素）
        /// </summary>
        public float DragThreshold = 10f;
        
        /// <summary>
        /// 是否正在拖拽
        /// </summary>
        public bool IsDragging { get { return _currentDraggable != null; } }
        
        /// <summary>
        /// 当前正在拖拽的对象
        /// </summary>
        public IDraggable CurrentDraggable { get { return _currentDraggable; } }

        /// <summary>
        /// 是否启用详细日志
        /// </summary>
        public bool EnableDetailedLog = true;
        #endregion

        #region 生命周期方法
        private void Awake()
        {
            // 确保单例唯一性
            if (_instance != null && _instance != this)
            {
                Debug.LogWarning("[DragController] 检测到重复的DragController实例，销毁当前对象", this);
                Destroy(gameObject);
                return;
            }
            
            _instance = this;
            DontDestroyOnLoad(gameObject);
            
            // 检查必要的组件
            if (Camera.main == null)
            {
                Debug.LogError("[DragController] 场景中未找到主相机（Camera.main），拖拽功能可能无法正常工作！", this);
            }
            
            Debug.Log($"[DragController] 初始化完成 - 拖拽阈值：{DragThreshold}像素，是否启用详细日志：{EnableDetailedLog}", this);
        }
        
        private void Update()
        {
            HandleMouseInput();
            HandleTouchInput();
        }

        private void OnDestroy()
        {
            if (_instance == this)
            {
                _instance = null;
                Debug.Log("[DragController] 实例被销毁，单例引用已重置", this);
            }
        }
        #endregion

        #region 日志工具方法
        /// <summary>
        /// 打印调试日志（带开关控制）
        /// </summary>
        private void LogDebug(string message)
        {
            if (EnableDetailedLog)
            {
                Debug.Log($"[DragController] {message}", this);
            }
        }

        /// <summary>
        /// 打印警告日志
        /// </summary>
        private void LogWarn(string message)
        {
            Debug.LogWarning($"[DragController] {message}", this);
        }

        /// <summary>
        /// 打印错误日志
        /// </summary>
        private void LogError(string message)
        {
            Debug.LogError($"[DragController] {message}", this);
        }
        #endregion

        #region 输入处理
        /// <summary>
        /// 处理鼠标输入
        /// </summary>
        private void HandleMouseInput()
        {
            // 鼠标按下
            if (Input.GetMouseButtonDown(0))
            {
                LogDebug($"鼠标左键按下 - 位置：{Input.mousePosition}");
                HandleBeginDrag(Input.mousePosition);
            }
            
            // 鼠标拖拽
            if (Input.GetMouseButton(0) && _currentDraggable != null)
            {
                HandleDrag(Input.mousePosition);
            }
            
            // 鼠标释放
            if (Input.GetMouseButtonUp(0) && _currentDraggable != null)
            {
                LogDebug($"鼠标左键释放 - 位置：{Input.mousePosition}");
                HandleEndDrag(Input.mousePosition);
            }
        }
        
        /// <summary>
        /// 处理触摸输入
        /// </summary>
        private void HandleTouchInput()
        {
            if (Input.touchCount == 0) return;

            Touch touch = Input.GetTouch(0);
            LogDebug($"触摸输入 - 状态：{touch.phase}，位置：{touch.position}，触摸ID：{touch.fingerId}");
            
            switch (touch.phase)
            {
                case TouchPhase.Began:
                    HandleBeginDrag(touch.position);
                    break;
                case TouchPhase.Moved:
                    if (_currentDraggable != null)
                    {
                        HandleDrag(touch.position);
                    }
                    break;
                case TouchPhase.Ended:
                case TouchPhase.Canceled:
                    if (_currentDraggable != null)
                    {
                        HandleEndDrag(touch.position);
                    }
                    break;
            }
        }
        #endregion

        #region 拖拽处理
        /// <summary>
        /// 处理开始拖拽
        /// </summary>
        /// <param name="position">输入位置</param>
        private void HandleBeginDrag(Vector2 position)
        {
            // 检查是否点击了UI元素（恢复UI穿透检测）
            //if (EventSystem.current != null && EventSystem.current.IsPointerOverGameObject())
            //{
            //    LogDebug($"点击位置在UI上，跳过拖拽检测 - 位置：{position}");
            //    return;
            //}

            // 检查主相机是否可用
            if (Camera.main == null)
            {
                LogError("主相机为空，无法执行射线检测！");
                return;
            }

            // 射线检测获取点击的对象
            Ray ray = Camera.main.ScreenPointToRay(position);
            RaycastHit2D hit = Physics2D.Raycast(ray.origin, ray.direction);
            
            if (hit.collider == null)
            {
                LogDebug($"射线检测未命中任何碰撞体 - 射线起点：{ray.origin}，方向：{ray.direction}");
                return;
            }

            LogDebug($"射线检测命中对象：{hit.collider.gameObject.name}，标签：{hit.collider.tag}");
            
            IDraggable draggable = hit.collider.GetComponent<IDraggable>();
            if (draggable == null)
            {
                LogDebug($"命中对象不包含IDraggable接口实现 - 对象名称：{hit.collider.gameObject.name}");
                return;
            }

            if (!draggable.CanDrag)
            {
                LogWarn($"拖拽对象被禁用 - 对象名称：{draggable.Transform.name}，CanDrag：{draggable.CanDrag}");
                return;
            }

            // 初始化拖拽状态
            _currentDraggable = draggable;
            _startMousePosition = position;
            _startDragPosition = draggable.Transform.position;
            
            // 触发拖拽开始事件
            try
            {
                _currentDraggable.OnBeginDrag(_startMousePosition);
                LogDebug($"开始拖拽 - 对象名称：{draggable.Transform.name}，拖拽层级：{draggable.DragLayer}，起始位置：{_startDragPosition}");
            }
            catch (System.Exception ex)
            {
                LogError($"调用OnBeginDrag时发生异常 - 对象：{draggable.Transform.name}，异常信息：{ex.Message}");
                _currentDraggable = null;
                return;
            }

            // 触发全局事件
            if (EventManager.Instance != null)
            {
                EventManager.Instance.TriggerEvent(new DragStartedEvent
                {
                    Draggable = draggable,
                    StartPosition = _startDragPosition,
                    StartInputPosition = _startMousePosition
                });
                LogDebug("已触发DragStartedEvent全局事件");
            }
            else
            {
                LogWarn("EventManager.Instance为空，无法触发DragStartedEvent全局事件");
            }
        }
        
        /// <summary>
        /// 处理拖拽中
        /// </summary>
        /// <param name="position">输入位置</param>
        private void HandleDrag(Vector2 position)
        {
            if (_currentDraggable == null)
            {
                LogWarn("HandleDrag被调用，但当前无拖拽对象");
                return;
            }

            // 修复：将屏幕坐标转换为世界坐标后再计算偏移
            if (Camera.main == null)
            {
                LogError("主相机为空，无法转换坐标！");
                return;
            }

            // 关键修复：把鼠标屏幕坐标转世界坐标（保持Z轴一致）
            Vector3 currentWorldPos = Camera.main.ScreenToWorldPoint(new Vector3(position.x, position.y, Camera.main.WorldToScreenPoint(_startDragPosition).z));
            Vector3 startWorldPos = Camera.main.ScreenToWorldPoint(new Vector3(_startMousePosition.x, _startMousePosition.y, Camera.main.WorldToScreenPoint(_startDragPosition).z));

            // 计算世界坐标的偏移（而非屏幕像素偏移）
            Vector3 dragOffset = currentWorldPos - startWorldPos;
            float dragDistance = Vector3.Distance(_startMousePosition, position);

            // 应用拖拽位置
            Vector3 newPosition = _startDragPosition + dragOffset;

            LogDebug($"拖拽中 - 对象：{_currentDraggable.Transform.name}，当前屏幕位置：{position}，世界坐标：{currentWorldPos}，偏移量：{dragOffset}，拖拽距离：{dragDistance:F2}像素");

            try
            {
                _currentDraggable.OnDrag(position, newPosition, dragOffset);
            }
            catch (System.Exception ex)
            {
                LogError($"调用OnDrag时发生异常 - 对象：{_currentDraggable.Transform.name}，异常信息：{ex.Message}");
                return;
            }

            // 更新悬停的拖拽目标
            UpdateHoveringTarget(position);

            // 触发全局事件
            if (EventManager.Instance != null)
            {
                EventManager.Instance.TriggerEvent(new DragUpdatedEvent
                {
                    Draggable = _currentDraggable,
                    CurrentPosition = _currentDraggable.Transform.position,
                    CurrentInputPosition = position,
                    DragOffset = dragOffset
                });
            }
        }
        
        /// <summary>
        /// 处理结束拖拽
        /// </summary>
        /// <param name="position">输入位置</param>
        private void HandleEndDrag(Vector2 position)
        {
            if (_currentDraggable == null)
            {
                LogWarn("HandleEndDrag被调用，但当前无拖拽对象");
                return;
            }

            // 获取拖拽结束位置
            Vector3 endPosition = _currentDraggable.Transform.position;
            
            // 检查是否拖拽了足够的距离
            float dragDistance = Vector3.Distance(_startMousePosition, position);
            bool dragCompleted = dragDistance >= DragThreshold;
            
            LogDebug($"结束拖拽 - 对象：{_currentDraggable.Transform.name}，拖拽距离：{dragDistance:F2}像素，阈值：{DragThreshold}像素，是否完成：{dragCompleted}");

            try
            {
                _currentDraggable.OnEndDrag(position, endPosition, dragCompleted);
            }
            catch (System.Exception ex)
            {
                LogError($"调用OnEndDrag时发生异常 - 对象：{_currentDraggable.Transform.name}，异常信息：{ex.Message}");
            }

            // 处理放置
            HandleDrop(_currentDraggable, position);

            // 触发全局拖拽结束事件
            if (EventManager.Instance != null)
            {
                EventManager.Instance.TriggerEvent(new DragEndedEvent
                {
                    Draggable = _currentDraggable,
                    StartPosition = _startDragPosition,
                    EndPosition = endPosition,
                    EndInputPosition = position,
                    DragDistance = dragDistance,
                    WasSuccessful = dragCompleted
                });
                LogDebug("已触发DragEndedEvent全局事件");
            }
            else
            {
                LogWarn("EventManager.Instance为空，无法触发DragEndedEvent全局事件");
            }
            
            // 重置状态
            LogDebug($"重置拖拽状态 - 清空当前拖拽对象：{_currentDraggable.Transform.name}，当前拖拽目标：{_currentDragTarget?.Transform?.name ?? "空"}");
            _currentDraggable = null;
            _currentDragTarget = null;
        }
        
        /// <summary>
        /// 更新悬停的拖拽目标
        /// </summary>
        /// <param name="position">输入位置</param>
        private void UpdateHoveringTarget(Vector2 position)
        {
            if (Camera.main == null)
            {
                LogError("主相机为空，无法执行射线检测更新拖拽目标！");
                return;
            }

            // 射线检测获取当前悬停的对象
            Ray ray = Camera.main.ScreenPointToRay(position);
            RaycastHit2D hit = Physics2D.Raycast(ray.origin, ray.direction);
            
            IDragTarget newTarget = null;
            if (hit.collider != null)
            {
                newTarget = hit.collider.GetComponent<IDragTarget>();
                LogDebug($"检测到悬停对象：{hit.collider.gameObject.name}，是否为拖拽目标：{newTarget != null}");
            }
            else
            {
                LogDebug("射线检测未命中任何碰撞体，无悬停目标");
            }
            
            // 如果目标变化，触发相应事件
            if (newTarget != _currentDragTarget)
            {
                // 离开旧目标
                if (_currentDragTarget != null)
                {
                    try
                    {
                        _currentDragTarget.OnDragExit(_currentDraggable);
                        LogDebug($"离开拖拽目标 - 目标名称：{_currentDragTarget.Transform.name}，拖拽对象：{_currentDraggable.Transform.name}");
                    }
                    catch (System.Exception ex)
                    {
                        LogError($"调用OnDragExit时发生异常 - 目标：{_currentDragTarget.Transform.name}，异常信息：{ex.Message}");
                    }

                    if (EventManager.Instance != null)
                    {
                        EventManager.Instance.TriggerEvent(new DragExitTargetEvent
                        {
                            Draggable = _currentDraggable,
                            Target = _currentDragTarget
                        });
                        LogDebug("已触发DragExitTargetEvent全局事件");
                    }
                }
                
                // 进入新目标
                if (newTarget != null)
                {
                    try
                    {
                        newTarget.OnDragEnter(_currentDraggable);
                        LogDebug($"进入拖拽目标 - 目标名称：{newTarget.Transform.name}，目标类型：{newTarget.TargetType}，拖拽对象：{_currentDraggable.Transform.name}");
                    }
                    catch (System.Exception ex)
                    {
                        LogError($"调用OnDragEnter时发生异常 - 目标：{newTarget.Transform.name}，异常信息：{ex.Message}");
                    }

                    if (EventManager.Instance != null)
                    {
                        EventManager.Instance.TriggerEvent(new DragEnterTargetEvent
                        {
                            Draggable = _currentDraggable,
                            Target = newTarget
                        });
                        LogDebug("已触发DragEnterTargetEvent全局事件");
                    }
                }
                
                _currentDragTarget = newTarget;
            }
        }
        
        /// <summary>
        /// 处理放置
        /// </summary>
        /// <param name="draggable">拖拽对象</param>
        /// <param name="position">放置位置</param>
        private void HandleDrop(IDraggable draggable, Vector2 position)
        {
            // 检查是否有有效的放置目标
            if (_currentDragTarget == null)
            {
                LogDebug($"无有效放置目标 - 拖拽对象：{draggable.Transform.name}，放置位置：{position}");
                return;
            }

            LogDebug($"处理放置逻辑 - 拖拽对象：{draggable.Transform.name}，目标对象：{_currentDragTarget.Transform.name}，目标类型：{_currentDragTarget.TargetType}");

            bool canDrop = false;
            try
            {
                canDrop = _currentDragTarget.CanDrop(draggable);
                LogDebug($"检查是否可放置 - 结果：{canDrop}");
            }
            catch (System.Exception ex)
            {
                LogError($"调用CanDrop时发生异常 - 目标：{_currentDragTarget.Transform.name}，异常信息：{ex.Message}");
                canDrop = false;
            }

            if (canDrop)
            {
                bool dropSuccess = false;
                try
                {
                    dropSuccess = _currentDragTarget.OnDrop(draggable);
                    LogDebug($"执行放置操作 - 结果：{dropSuccess}");
                }
                catch (System.Exception ex)
                {
                    LogError($"调用OnDrop时发生异常 - 目标：{_currentDragTarget.Transform.name}，异常信息：{ex.Message}");
                    dropSuccess = false;
                }

                if (EventManager.Instance != null)
                {
                    EventManager.Instance.TriggerEvent(new DragDroppedEvent
                    {
                        Draggable = draggable,
                        Target = _currentDragTarget,
                        DropPosition = position,
                        WasSuccessful = dropSuccess
                    });
                    LogDebug($"已触发DragDroppedEvent全局事件 - 放置是否成功：{dropSuccess}");
                }

                if (dropSuccess)
                {
                    LogDebug($"成功放置 - 拖拽对象：{draggable.Transform.name} → 目标对象：{_currentDragTarget.Transform.name}");
                }
                else
                {
                    LogWarn($"放置失败 - 拖拽对象：{draggable.Transform.name} → 目标对象：{_currentDragTarget.Transform.name}");
                }
            }
            else
            {
                LogWarn($"不允许放置 - 拖拽对象：{draggable.Transform.name} 无法放置到目标：{_currentDragTarget.Transform.name}");

                if (EventManager.Instance != null)
                {
                    EventManager.Instance.TriggerEvent(new DragDroppedEvent
                    {
                        Draggable = draggable,
                        Target = _currentDragTarget,
                        DropPosition = position,
                        WasSuccessful = false
                    });
                    LogDebug("已触发DragDroppedEvent全局事件 - 放置失败（不允许放置）");
                }
            }
        }
        #endregion
    }
}