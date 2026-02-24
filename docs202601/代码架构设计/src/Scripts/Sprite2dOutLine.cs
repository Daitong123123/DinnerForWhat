using UnityEngine;

[RequireComponent(typeof(SpriteRenderer))]
public class SpriteOutline2D : MonoBehaviour
{
    [Header("描边控制")]
    [Tooltip("是否启用描边效果")]
    public bool isOutlineEnabled = false;

    [Header("描边样式配置")]
    [Tooltip("描边颜色")]
    public Color outlineColor = Color.white;
    [Tooltip("描边宽度（像素单位，根据Sprite大小调整）")]
    [Range(0.01f, 0.2f)]
    public float outlineWidth = 0.1f;

    // 描边Sprite的渲染器（动态创建）
    private SpriteRenderer _outlineRenderer;
    // 原物品的Sprite渲染器
    private SpriteRenderer _mainRenderer;

    private void Awake()
    {
        // 获取原物品的SpriteRenderer
        _mainRenderer = GetComponent<SpriteRenderer>();

        // 初始化描边Sprite（作为子物体）
        CreateOutlineSprite();
    }

    private void Start()
    {
        // 初始化时根据变量设置描边状态
        UpdateOutlineState();
    }

    // 当在Inspector修改变量时触发（实时生效）
    private void OnValidate()
    {
        // 防止未初始化时报错
        if (_outlineRenderer != null)
        {
            UpdateOutlineState();
        }
    }

    // 创建描边用的Sprite子物体
    private void CreateOutlineSprite()
    {
        // 创建描边物体（作为当前物体的子物体）
        GameObject outlineObj = new GameObject($"[{gameObject.name}_Outline]");
        outlineObj.transform.SetParent(transform);
        outlineObj.transform.localPosition = Vector3.zero;
        outlineObj.transform.localRotation = Quaternion.identity;
        outlineObj.transform.localScale = Vector3.one;

        // 添加描边的SpriteRenderer
        _outlineRenderer = outlineObj.AddComponent<SpriteRenderer>();
        // 描边Sprite与原Sprite保持一致
        _outlineRenderer.sprite = _mainRenderer.sprite;
        // 描边层级低于原Sprite（确保在底层）
        _outlineRenderer.sortingLayerID = _mainRenderer.sortingLayerID;
        _outlineRenderer.sortingOrder = _mainRenderer.sortingOrder - 1;
        // 描边使用纯色（不显示纹理）
        _outlineRenderer.color = outlineColor;
        // 禁用批处理（避免描边和原Sprite合并导致效果失效）
        _outlineRenderer.drawMode = SpriteDrawMode.Simple;
        _outlineRenderer.enabled = false;
    }

    // 更新描边显示状态
    private void UpdateOutlineState()
    {
        if (_outlineRenderer == null) return;

        // 控制描边是否显示
        _outlineRenderer.enabled = isOutlineEnabled;

        if (isOutlineEnabled)
        {
            // 更新描边样式
            _outlineRenderer.color = outlineColor;
            // 放大描边Sprite实现描边效果（基于原尺寸缩放）
            _outlineRenderer.transform.localScale = Vector3.one * (1 + outlineWidth);
            // 同步原Sprite的变化（比如换图时）
            _outlineRenderer.sprite = _mainRenderer.sprite;
            _outlineRenderer.flipX = _mainRenderer.flipX;
            _outlineRenderer.flipY = _mainRenderer.flipY;
        }
    }

    // 提供外部调用的方法（可选，方便代码控制描边）
    public void SetOutlineEnabled(bool enabled)
    {
        isOutlineEnabled = enabled;
        UpdateOutlineState();
    }

    // 可选：监听原Sprite的变化，同步到描边
    private void LateUpdate()
    {
        if (isOutlineEnabled && _outlineRenderer.sprite != _mainRenderer.sprite)
        {
            _outlineRenderer.sprite = _mainRenderer.sprite;
        }
    }
}