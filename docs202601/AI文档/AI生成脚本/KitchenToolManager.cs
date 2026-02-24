// 必须的命名空间引用
using UnityEngine;
using System.Collections.Generic; // List<>必需



public class KitchenToolManager : MonoBehaviour
{
    // 单例实例
    public static KitchenToolManager Instance { get; private set; }

    // 厨具配置
    [Header("厨具配置")]
    public List<KitchenTool> AllKitchenTools; // 所有厨具数据

    // 运行时数据
    private Dictionary<string, KitchenTool> toolDictionary; // 厨具ID->数据

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
            InitToolDictionary();
        }
    }

    // 初始化厨具字典
    private void InitToolDictionary()
    {
        toolDictionary = new Dictionary<string, KitchenTool>();
        foreach (var tool in AllKitchenTools)
        {
            if (!toolDictionary.ContainsKey(tool.ToolId))
            {
                toolDictionary.Add(tool.ToolId, tool);
            }
            else
            {
                Debug.LogError($"重复厨具ID：{tool.ToolId}");
            }
        }
    }

    /// <summary>
    /// 获取厨具数据
    /// </summary>
    public KitchenTool GetKitchenTool(string toolId)
    {
        if (toolDictionary.TryGetValue(toolId, out var tool))
        {
            return tool;
        }
        Debug.LogError($"厨具ID不存在：{toolId}");
        return null;
    }

    /// <summary>
    /// 检查是否拥有指定厨具
    /// </summary>
    public bool HasKitchenTool(string toolId)
    {
        return PlayerDataManager.Instance.CurrentPlayerData.OwnedKitchenTools.Contains(toolId);
    }

    /// <summary>
    /// 解锁厨具
    /// </summary>
    public void UnlockKitchenTool(string toolId)
    {
        if (!HasKitchenTool(toolId))
        {
            PlayerDataManager.Instance.CurrentPlayerData.OwnedKitchenTools.Add(toolId);
        }
    }

    /// <summary>
    /// 获取所有已解锁的厨具
    /// </summary>
    public List<KitchenTool> GetUnlockedKitchenTools()
    {
        List<KitchenTool> unlockedTools = new List<KitchenTool>();
        foreach (var toolId in PlayerDataManager.Instance.CurrentPlayerData.OwnedKitchenTools)
        {
            var tool = GetKitchenTool(toolId);
            if (tool != null)
            {
                unlockedTools.Add(tool);
            }
        }
        return unlockedTools;
    }
}