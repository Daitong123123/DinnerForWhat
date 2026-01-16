using UnityEngine;

public class GoldManager : MonoBehaviour
{
    // 单例实例
    public static GoldManager Instance { get; private set; }

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

    /// <summary>
    /// 获取当前金币数量
    /// </summary>
    /// <returns>金币数</returns>
    public int GetCurrentGold()
    {
        return PlayerDataManager.Instance.CurrentPlayerData.Gold;
    }

    /// <summary>
    /// 增加金币
    /// </summary>
    /// <param name="amount">增加数量</param>
    public void AddGold(int amount)
    {
        if (amount <= 0) return;
        PlayerDataManager.Instance.UpdateGold(amount);
    }

    /// <summary>
    /// 扣除金币
    /// </summary>
    /// <param name="amount">扣除数量</param>
    /// <returns>是否扣除成功</returns>
    public bool SubtractGold(int amount)
    {
        if (amount <= 0) return false;
        if (GetCurrentGold() < amount) return false;

        PlayerDataManager.Instance.UpdateGold(-amount);
        return true;
    }

    /// <summary>
    /// 检查金币是否足够
    /// </summary>
    /// <param name="amount">需要的数量</param>
    /// <returns>是否足够</returns>
    public bool CheckGoldEnough(int amount)
    {
        return GetCurrentGold() >= amount;
    }

    /// <summary>
    /// 重置金币（测试用）
    /// </summary>
    /// <param name="amount">重置数量</param>
    public void ResetGold(int amount)
    {
        int diff = amount - GetCurrentGold();
        PlayerDataManager.Instance.UpdateGold(diff);
    }
}