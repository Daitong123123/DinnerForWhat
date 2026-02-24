using UnityEngine;

namespace Systems.DragControlSystem
{
    #region 拖拽接口
    /// <summary>
    /// 可拖拽对象接口
    /// 定义可拖拽对象的基本行为
    /// </summary>
    public interface IDraggable
    {
        /// <summary>
        /// 变换组件
        /// </summary>
        Transform Transform { get; }

        /// <summary>
        /// 是否可以拖拽
        /// </summary>
        bool CanDrag { get; }

        /// <summary>
        /// 拖拽层级
        /// </summary>
        int DragLayer { get; }

        /// <summary>
        /// 开始拖拽
        /// </summary>
        /// <param name="startPosition">开始位置</param>
        void OnBeginDrag(Vector2 startPosition);

        /// <summary>
        /// 拖拽中
        /// </summary>
        /// <param name="currentPosition">当前输入位置</param>
        /// <param name="newTransformPosition">新的变换位置</param>
        /// <param name="dragOffset">拖拽偏移量</param>
        void OnDrag(Vector2 currentPosition, Vector3 newTransformPosition, Vector3 dragOffset);

        /// <summary>
        /// 结束拖拽
        /// </summary>
        /// <param name="endPosition">结束位置</param>
        /// <param name="finalTransformPosition">最终变换位置</param>
        /// <param name="wasSuccessful">是否成功拖拽</param>
        void OnEndDrag(Vector2 endPosition, Vector3 finalTransformPosition, bool wasSuccessful);
    }

    /// <summary>
    /// 拖拽目标接口
    /// 定义可接收拖拽对象的目标行为
    /// </summary>
    public interface IDragTarget
    {
        /// <summary>
        /// 变换组件
        /// </summary>
        Transform Transform { get; }

        /// <summary>
        /// 目标类型
        /// </summary>
        string TargetType { get; }

        /// <summary>
        /// 是否可以放置拖拽对象
        /// </summary>
        /// <param name="draggable">可拖拽对象</param>
        /// <returns>是否可以放置</returns>
        bool CanDrop(IDraggable draggable);

        /// <summary>
        /// 放置拖拽对象
        /// </summary>
        /// <param name="draggable">可拖拽对象</param>
        /// <returns>放置是否成功</returns>
        bool OnDrop(IDraggable draggable);

        /// <summary>
        /// 拖拽对象进入目标区域
        /// </summary>
        /// <param name="draggable">可拖拽对象</param>
        void OnDragEnter(IDraggable draggable);

        /// <summary>
        /// 拖拽对象离开目标区域
        /// </summary>
        /// <param name="draggable">可拖拽对象</param>
        void OnDragExit(IDraggable draggable);
    }

    /// <summary>
    /// 拖拽数据接口
    /// 定义拖拽过程中需要传递的数据
    /// </summary>
    public interface IDragData
    {
        /// <summary>
        /// 拖拽数据ID
        /// </summary>
        string DataId { get; }

        /// <summary>
        /// 拖拽数据类型
        /// </summary>
        string DataType { get; }

        /// <summary>
        /// 拖拽数据值
        /// </summary>
        object DataValue { get; }
    }
    #endregion

    #region 拖拽事件
    /// <summary>
    /// 拖拽开始事件
    /// </summary>
    public class DragStartedEvent : Core.IEvent
    {
        /// <summary>
        /// 可拖拽对象
        /// </summary>
        public IDraggable Draggable;

        /// <summary>
        /// 开始位置
        /// </summary>
        public Vector3 StartPosition;

        /// <summary>
        /// 开始输入位置
        /// </summary>
        public Vector2 StartInputPosition;
    }

    /// <summary>
    /// 拖拽更新事件
    /// </summary>
    public class DragUpdatedEvent : Core.IEvent
    {
        /// <summary>
        /// 可拖拽对象
        /// </summary>
        public IDraggable Draggable;

        /// <summary>
        /// 当前位置
        /// </summary>
        public Vector3 CurrentPosition;

        /// <summary>
        /// 当前输入位置
        /// </summary>
        public Vector2 CurrentInputPosition;

        /// <summary>
        /// 拖拽偏移量
        /// </summary>
        public Vector3 DragOffset;
    }

    /// <summary>
    /// 拖拽结束事件
    /// </summary>
    public class DragEndedEvent : Core.IEvent
    {
        /// <summary>
        /// 可拖拽对象
        /// </summary>
        public IDraggable Draggable;

        /// <summary>
        /// 开始位置
        /// </summary>
        public Vector3 StartPosition;

        /// <summary>
        /// 结束位置
        /// </summary>
        public Vector3 EndPosition;

        /// <summary>
        /// 结束输入位置
        /// </summary>
        public Vector2 EndInputPosition;

        /// <summary>
        /// 拖拽距离
        /// </summary>
        public float DragDistance;

        /// <summary>
        /// 是否成功
        /// </summary>
        public bool WasSuccessful;
    }

    /// <summary>
    /// 拖拽进入目标事件
    /// </summary>
    public class DragEnterTargetEvent : Core.IEvent
    {
        /// <summary>
        /// 可拖拽对象
        /// </summary>
        public IDraggable Draggable;

        /// <summary>
        /// 拖拽目标
        /// </summary>
        public IDragTarget Target;
    }

    /// <summary>
    /// 拖拽离开目标事件
    /// </summary>
    public class DragExitTargetEvent : Core.IEvent
    {
        /// <summary>
        /// 可拖拽对象
        /// </summary>
        public IDraggable Draggable;

        /// <summary>
        /// 拖拽目标
        /// </summary>
        public IDragTarget Target;
    }

    /// <summary>
    /// 拖拽放置事件
    /// </summary>
    public class DragDroppedEvent : Core.IEvent
    {
        /// <summary>
        /// 可拖拽对象
        /// </summary>
        public IDraggable Draggable;

        /// <summary>
        /// 拖拽目标
        /// </summary>
        public IDragTarget Target;

        /// <summary>
        /// 放置位置
        /// </summary>
        public Vector2 DropPosition;

        /// <summary>
        /// 是否成功
        /// </summary>
        public bool WasSuccessful;
    }
    #endregion

    #region 基础实现类
    /// <summary>
    /// 基础可拖拽组件
    /// 实现了IDraggable接口的基本功能
    /// </summary>
    public abstract class BaseDraggable : MonoBehaviour, IDraggable
    {
        #region 属性
        /// <summary>
        /// 变换组件
        /// </summary>
        public Transform Transform { get { return transform; } }

        /// <summary>
        /// 是否可以拖拽
        /// </summary>
        public virtual bool CanDrag { get { return true; } }

        /// <summary>
        /// 拖拽层级
        /// </summary>
        public virtual int DragLayer { get { return 0; } }

        /// <summary>
        /// 原始位置
        /// </summary>
        protected Vector3 OriginalPosition { get; set; }

        /// <summary>
        /// 原始层级
        /// </summary>
        protected int OriginalSortingOrder { get; set; }
        #endregion

        #region IDraggable实现
        /// <summary>
        /// 开始拖拽
        /// </summary>
        /// <param name="startPosition">开始位置</param>
        public virtual void OnBeginDrag(Vector2 startPosition)
        {
            OriginalPosition = transform.position;
            Debug.Log($"[BaseDraggable] 开始拖拽 - 物体名称：{gameObject.name}，原始位置：{OriginalPosition}，鼠标起始位置：{startPosition}", this);

            // 如果有SpriteRenderer组件，提高层级
            SpriteRenderer renderer = GetComponent<SpriteRenderer>();
            if (renderer != null)
            {
                OriginalSortingOrder = renderer.sortingOrder;
                renderer.sortingOrder = 100; // 临时提高层级
                Debug.Log($"[BaseDraggable] 提升渲染层级 - 物体名称：{gameObject.name}，原始层级：{OriginalSortingOrder} → 新层级：100", this);
            }
        }

        /// <summary>
        /// 拖拽中
        /// </summary>
        /// <param name="currentPosition">当前输入位置</param>
        /// <param name="newTransformPosition">新的变换位置</param>
        /// <param name="dragOffset">拖拽偏移量</param>
        public virtual void OnDrag(Vector2 currentPosition, Vector3 newTransformPosition, Vector3 dragOffset)
        {
            // 修复：直接使用计算好的世界坐标（不再重复转换）
            // 保留Z轴，避免物体Z轴偏移
            Vector3 targetPos = newTransformPosition;
            targetPos.z = transform.position.z;

            // 更新物体位置
            transform.position = targetPos;

            Debug.Log($"[BaseDraggable] 拖拽中 - 物体名称：{gameObject.name}，当前鼠标屏幕位置：{currentPosition}，物体新位置：{transform.position}，世界坐标偏移量：{dragOffset}", this);
        }

        /// <summary>
        /// 结束拖拽
        /// </summary>
        /// <param name="endPosition">结束位置</param>
        /// <param name="finalTransformPosition">最终变换位置</param>
        /// <param name="wasSuccessful">是否成功拖拽</param>
        public virtual void OnEndDrag(Vector2 endPosition, Vector3 finalTransformPosition, bool wasSuccessful)
        {
            // 如果有SpriteRenderer组件，恢复原始层级
            SpriteRenderer renderer = GetComponent<SpriteRenderer>();
            if (renderer != null)
            {
                renderer.sortingOrder = OriginalSortingOrder;
                Debug.Log($"[BaseDraggable] 恢复渲染层级 - 物体名称：{gameObject.name}，恢复层级：{OriginalSortingOrder}", this);
            }

            // 如果拖拽失败，恢复原始位置
            if (!wasSuccessful)
            {
                transform.position = OriginalPosition;
                Debug.Log($"[BaseDraggable] 拖拽失败，恢复原始位置 - 物体名称：{gameObject.name}，恢复位置：{OriginalPosition}", this);
            }

            Debug.Log($"[BaseDraggable] 结束拖拽 - 物体名称：{gameObject.name}，鼠标结束位置：{endPosition}，最终位置：{transform.position}，拖拽是否成功：{wasSuccessful}", this);
        }
        #endregion
    }

    /// <summary>
    /// 基础拖拽目标组件
    /// 实现了IDragTarget接口的基本功能
    /// </summary>
    public abstract class BaseDragTarget : MonoBehaviour, IDragTarget
    {
        #region 属性
        /// <summary>
        /// 变换组件
        /// </summary>
        public Transform Transform { get { return transform; } }

        /// <summary>
        /// 目标类型
        /// </summary>
        public virtual string TargetType { get { return "Generic"; } }
        #endregion

        #region IDragTarget实现
        /// <summary>
        /// 是否可以放置拖拽对象
        /// </summary>
        /// <param name="draggable">可拖拽对象</param>
        /// <returns>是否可以放置</returns>
        public virtual bool CanDrop(IDraggable draggable)
        {
            bool canDrop = true;
            Debug.Log($"[BaseDragTarget] 检查是否可放置 - 目标名称：{gameObject.name}，拖拽对象：{draggable.Transform.name}，是否可放置：{canDrop}", this);
            return canDrop;
        }

        /// <summary>
        /// 放置拖拽对象
        /// </summary>
        /// <param name="draggable">可拖拽对象</param>
        /// <returns>放置是否成功</returns>
        public abstract bool OnDrop(IDraggable draggable);

        /// <summary>
        /// 拖拽对象进入目标区域
        /// </summary>
        /// <param name="draggable">可拖拽对象</param>
        public virtual void OnDragEnter(IDraggable draggable)
        {
            Debug.Log($"[BaseDragTarget] 拖拽对象进入目标区域 - 目标名称：{gameObject.name}，拖拽对象：{draggable.Transform.name}", this);
            // 可以在这里添加视觉反馈，比如高亮效果
        }

        /// <summary>
        /// 拖拽对象离开目标区域
        /// </summary>
        /// <param name="draggable">可拖拽对象</param>
        public virtual void OnDragExit(IDraggable draggable)
        {
            Debug.Log($"[BaseDragTarget] 拖拽对象离开目标区域 - 目标名称：{gameObject.name}，拖拽对象：{draggable.Transform.name}", this);
            // 可以在这里移除视觉反馈
        }
        #endregion
    }
    #endregion
}