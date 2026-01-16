using UnityEngine;
using UnityEngine.UI;

public class PopupWindow : MonoBehaviour
{
    // 单例实例
    public static PopupWindow Instance { get; private set; }

    // 弹窗UI引用
    [Header("弹窗UI配置")]
    public GameObject PopupCanvas; // 弹窗画布
    public Image PopupBackground; // 弹窗背景
    public Text PopupTitleText; // 标题文本
    public Text PopupContentText; // 内容文本
    public Button ConfirmButton; // 确认按钮
    public Button CancelButton; // 取消按钮
    public Text ConfirmButtonText; // 确认按钮文本
    public Text CancelButtonText; // 取消按钮文本

    // 弹窗回调
    private System.Action confirmCallback;
    private System.Action cancelCallback;

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

    private void Start()
    {
        // 绑定按钮事件
        ConfirmButton.onClick.AddListener(OnConfirmClicked);
        CancelButton.onClick.AddListener(OnCancelClicked);

        // 默认隐藏弹窗
        HidePopup();
    }

    /// <summary>
    /// 显示基础弹窗（仅确认按钮）
    /// </summary>
    /// <param name="title">标题</param>
    /// <param name="content">内容</param>
    /// <param name="confirmText">确认按钮文本</param>
    /// <param name="confirmCallback">确认回调</param>
    public void ShowBasicPopup(string title, string content, string confirmText = "确认", System.Action confirmCallback = null)
    {
        // 配置弹窗内容
        PopupTitleText.text = title;
        PopupContentText.text = content;
        ConfirmButtonText.text = confirmText;
        
        // 配置按钮显示
        ConfirmButton.gameObject.SetActive(true);
        CancelButton.gameObject.SetActive(false);
        
        // 保存回调
        this.confirmCallback = confirmCallback;
        this.cancelCallback = null;
        
        // 显示弹窗
        PopupCanvas.SetActive(true);
    }

    /// <summary>
    /// 显示确认弹窗（确认+取消按钮）
    /// </summary>
    /// <param name="title">标题</param>
    /// <param name="content">内容</param>
    /// <param name="confirmText">确认按钮文本</param>
    /// <param name="cancelText">取消按钮文本</param>
    /// <param name="confirmCallback">确认回调</param>
    /// <param name="cancelCallback">取消回调</param>
    public void ShowConfirmPopup(string title, string content, string confirmText = "确认", string cancelText = "取消", 
        System.Action confirmCallback = null, System.Action cancelCallback = null)
    {
        // 配置弹窗内容
        PopupTitleText.text = title;
        PopupContentText.text = content;
        ConfirmButtonText.text = confirmText;
        CancelButtonText.text = cancelText;
        
        // 配置按钮显示
        ConfirmButton.gameObject.SetActive(true);
        CancelButton.gameObject.SetActive(true);
        
        // 保存回调
        this.confirmCallback = confirmCallback;
        this.cancelCallback = cancelCallback;
        
        // 显示弹窗
        PopupCanvas.SetActive(true);
    }

    /// <summary>
    /// 显示提示弹窗（自动关闭）
    /// </summary>
    /// <param name="title">标题</param>
    /// <param name="content">内容</param>
    /// <param name="autoCloseTime">自动关闭时间</param>
    public void ShowTipPopup(string title, string content, float autoCloseTime = 3f)
    {
        // 配置弹窗内容
        PopupTitleText.text = title;
        PopupContentText.text = content;
        
        // 配置按钮显示（无按钮）
        ConfirmButton.gameObject.SetActive(false);
        CancelButton.gameObject.SetActive(false);
        
        // 清空回调
        confirmCallback = null;
        cancelCallback = null;
        
        // 显示弹窗
        PopupCanvas.SetActive(true);
        
        // 自动关闭
        Invoke(nameof(HidePopup), autoCloseTime);
    }

    /// <summary>
    /// 隐藏弹窗
    /// </summary>
    public void HidePopup()
    {
        PopupCanvas.SetActive(false);
        
        // 清空回调
        confirmCallback = null;
        cancelCallback = null;
    }

    /// <summary>
    /// 确认按钮点击事件
    /// </summary>
    private void OnConfirmClicked()
    {
        // 执行回调
        confirmCallback?.Invoke();
        
        // 隐藏弹窗
        HidePopup();
    }

    /// <summary>
    /// 取消按钮点击事件
    /// </summary>
    private void OnCancelClicked()
    {
        // 执行回调
        cancelCallback?.Invoke();
        
        // 隐藏弹窗
        HidePopup();
    }

    /// <summary>
    /// 设置弹窗背景透明度
    /// </summary>
    public void SetPopupBackgroundAlpha(float alpha)
    {
        Color bgColor = PopupBackground.color;
        bgColor.a = alpha;
        PopupBackground.color = bgColor;
    }

    /// <summary>
    /// 设置弹窗内容文本颜色
    /// </summary>
    public void SetContentTextColor(Color color)
    {
        PopupContentText.color = color;
    }
}