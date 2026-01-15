using System;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "New Tool", menuName = "Game/Tool/ToolSO")]
public class ToolSO : ScriptableObject
{
    [Header("基础信息")]
    public string toolName;          // 厨具名称（如“菜刀”“砧板”）
    public Sprite toolSprite;        // 厨具显示图片
    public bool isChildTool = false; // 是否为子工具（如砧板是菜刀的子工具）

    [Header("操作配置")]
    public List<FoodOperationType> supportedOperations; // 支持的操作列表（如菜刀支持Cut）

    [Header("子工具配置")]
    public List<ToolSO> childTools; // 关联的子工具（如菜刀关联砧板）

    [Header("操作参数配置")]
    [Tooltip("不同操作的默认耗时（秒）")]
    public List<ToolOperationTimeConfig> operationTimeConfigs;

    // 缓存：操作类型 → 操作耗时
    private Dictionary<FoodOperationType, float> _operationTimeDict;

    private void OnEnable()
    {
        InitOperationTimeDict();
        // 子工具自动标记为isChildTool
        foreach (var childTool in childTools)
        {
            if (childTool != null && !childTool.isChildTool)
            {
                childTool.isChildTool = true;
            }
        }
    }

    /// <summary>
    /// 初始化操作耗时字典
    /// </summary>
    private void InitOperationTimeDict()
    {
        _operationTimeDict = new Dictionary<FoodOperationType, float>();
        foreach (var config in operationTimeConfigs)
        {
            if (!_operationTimeDict.ContainsKey(config.operationType))
            {
                _operationTimeDict.Add(config.operationType, config.defaultTime);
            }
            else
            {
                Debug.LogError($"[{toolName}] 重复的操作耗时配置：{config.operationType}");
            }
        }
    }

    /// <summary>
    /// 获取指定操作的默认耗时
    /// </summary>
    public float GetOperationDefaultTime(FoodOperationType operation)
    {
        if (_operationTimeDict.TryGetValue(operation, out float time))
        {
            return time;
        }
        // 默认耗时1秒
        Debug.LogWarning($"[{toolName}] 未配置{operation}操作耗时，使用默认1秒");
        return 1f;
    }

    /// <summary>
    /// 检查是否支持指定操作
    /// </summary>
    public bool IsOperationSupported(FoodOperationType operation)
    {
        return supportedOperations.Contains(operation);
    }
}

// 操作耗时配置结构体（序列化）
[Serializable]
public struct ToolOperationTimeConfig
{
    public FoodOperationType operationType;
    public float defaultTime; // 该操作的默认耗时（秒）
}