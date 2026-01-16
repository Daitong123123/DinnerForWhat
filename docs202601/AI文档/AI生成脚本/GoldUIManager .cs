using UnityEngine;
using UnityEngine.UI;

public class GoldUIManager : MonoBehaviour
{
    // UI引用
    [Header("UI组件")]
    public Text GoldDisplayText; // 金币显示文本
    public Image GoldIcon; // 金币图标
    public Text GoldNotEnoughText; // 金币不足提示文本

    private void OnEnable()
    {
        // 订阅金币变更事件
        GameEventSystem.Instance.Subscribe(GameEventSystem.EventNames.GoldChanged, OnGoldChanged);
    }

    private void OnDisable()
    {
        GameEventSystem.Instance.Unsubscribe(GameEventSystem.EventNames.GoldChanged, OnGoldChanged);
    }

    private void Start()
    {
        // 初始化金币显示
        UpdateGoldDisplay(PlayerDataManager.Instance.CurrentPlayerData.Gold);
        // 隐藏金币不足提示
        if (GoldNotEnoughText != null)
        {
            GoldNotEnoughText.gameObject.SetActive(false);
        }
    }

    /// <summary>
    /// 金币变更回调
    /// </summary>
    private void OnGoldChanged(object data)
    {
        if (data is int gold)
        {
            UpdateGoldDisplay(gold);
        }
    }

    /// <summary>
    /// 更新金币显示
    /// </summary>
    private void UpdateGoldDisplay(int gold)
    {
        if (GoldDisplayText != null)
        {
            GoldDisplayText.text = $"金币：{gold}";
        }
    }

    /// <summary>
    /// 显示金币不足提示
    /// </summary>
    public void ShowGoldNotEnoughTip()
    {
        if (GoldNotEnoughText != null)
        {
            GoldNotEnoughText.gameObject.SetActive(true);
            // 3秒后隐藏
            Invoke(nameof(HideGoldNotEnoughTip), 3f);
        }
    }

    /// <summary>
    /// 隐藏金币不足提示
    /// </summary>
    private void HideGoldNotEnoughTip()
    {
        if (GoldNotEnoughText != null)
        {
            GoldNotEnoughText.gameObject.SetActive(false);
        }
    }
}