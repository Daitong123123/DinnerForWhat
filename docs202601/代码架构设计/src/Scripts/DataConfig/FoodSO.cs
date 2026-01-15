using System;
using System.Collections.Generic;
using UnityEngine;

// 重构：整合操作名称+Sprite的序列化结构体
[Serializable]
public struct FoodOperationConfig
{
    [Tooltip("食物操作类型")]
    public FoodOperationType operationType;
    [Tooltip("该操作的显示名称（如“搅拌后的鸡蛋”）")]
    public string operationName;
    [Tooltip("该操作对应的食物Sprite")]
    public Sprite operationSprite;
}

// 核心FoodSO类（调整后）
[CreateAssetMenu(fileName = "New Food", menuName = "Game/Food/FoodSO")]
public class FoodSO : ScriptableObject
{
    [Header("基础信息")]
    public string foodName;          // 基础名称（如“鸡蛋”）
    public Sprite defaultSprite;     // 无操作默认Sprite
    public string defaultName;       // 无操作默认名称（可与foodName一致）
    public int maxFreshness;         // 最大新鲜度

    [Header("操作配置")]
    public List<FoodOperationType> supportedOperations; // 支持的操作列表
    public List<FoodOperationConfig> operationConfigs;  // 操作-名称-Sprite配置

    [Header("运行时状态（仅调试用）")]
    [SerializeField] private FoodOperationType? currentOperation;

    // 缓存字典：操作类型 → 操作配置（名称+Sprite）
    private Dictionary<FoodOperationType, FoodOperationConfig> _operationConfigDict;

    private void OnEnable()
    {
        InitOperationConfigDict();
        ResetCurrentOperation();
        // 补全默认名称（避免空值）
        if (string.IsNullOrEmpty(defaultName))
        {
            defaultName = foodName;
        }
    }

    /// <summary>
    /// 初始化操作配置字典（整合名称+Sprite）→ 改为public，允许外部调用
    /// </summary>
    public void InitOperationConfigDict()
    {
        _operationConfigDict = new Dictionary<FoodOperationType, FoodOperationConfig>();

        if (operationConfigs == null || operationConfigs.Count == 0)
        {
            Debug.LogWarning($"[{foodName}] 操作配置列表为空！");
            return;
        }

        foreach (var config in operationConfigs)
        {
            if (!_operationConfigDict.ContainsKey(config.operationType))
            {
                _operationConfigDict.Add(config.operationType, config);
            }
            else
            {
                Debug.LogError($"[{foodName}] 重复的操作类型：{config.operationType}");
            }
        }
    }

    #region 外部调用方法
    /// <summary>
    /// 设置当前操作（校验是否支持）
    /// </summary>
    public bool SetCurrentOperation(FoodOperationType? operation)
    {
        if (operation == null || operation == FoodOperationType.None)
        {
            currentOperation = null;
            return true;
        }

        if (!supportedOperations.Contains((FoodOperationType)operation))
        {
            Debug.LogWarning($"[{foodName}] 不支持操作：{operation}");
            return false;
        }

        currentOperation = operation;
        return true;
    }

    /// <summary>
    /// 获取当前操作对应的名称
    /// </summary>
    public string GetCurrentName()
    {
        if (currentOperation == null || currentOperation == FoodOperationType.None)
        {
            return defaultName;
        }

        if (_operationConfigDict == null)
        {
            InitOperationConfigDict(); // 兜底初始化
        }

        if (_operationConfigDict.TryGetValue((FoodOperationType)currentOperation, out var config))
        {
            return string.IsNullOrEmpty(config.operationName) ? defaultName : config.operationName;
        }
        return defaultName;
    }

    /// <summary>
    /// 获取当前操作对应的Sprite（强化：增加空值校验）
    /// </summary>
    public Sprite GetCurrentSprite()
    {
        if (currentOperation == null || currentOperation == FoodOperationType.None)
        {
            return defaultSprite;
        }

        if (_operationConfigDict == null)
        {
            InitOperationConfigDict(); // 兜底初始化
        }

        if (_operationConfigDict.TryGetValue((FoodOperationType)currentOperation, out var config))
        {
            return config.operationSprite ?? defaultSprite;
        }
        return defaultSprite;
    }

    /// <summary>
    /// 直接获取指定操作的配置（名称+Sprite）
    /// </summary>
    public FoodOperationConfig? GetOperationConfig(FoodOperationType operation)
    {
        if (_operationConfigDict == null)
        {
            InitOperationConfigDict(); // 兜底初始化
        }

        if (_operationConfigDict.TryGetValue(operation, out var config))
        {
            return config;
        }
        return null;
    }

    /// <summary>
    /// 检查是否支持指定操作
    /// </summary>
    public bool IsOperationSupported(FoodOperationType operation)
    {
        if (supportedOperations == null || supportedOperations.Count == 0)
        {
            Debug.LogWarning($"[{foodName}] 支持的操作列表为空！");
            return false;
        }
        return supportedOperations.Contains(operation);
    }

    /// <summary>
    /// 重置当前操作
    /// </summary>
    public void ResetCurrentOperation()
    {
        currentOperation = null;
    }

    /// <summary>
    /// 获取当前操作类型
    /// </summary>
    public FoodOperationType? GetCurrentOperation()
    {
        return currentOperation;
    }
    #endregion
}