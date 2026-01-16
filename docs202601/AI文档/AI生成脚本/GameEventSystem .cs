// 必须的命名空间引用
using UnityEngine; // MonoBehaviour必需
using System;
using System.Collections.Generic; // List/Dictionary必需

public class GameEventSystem : MonoBehaviour
{
    // 单例实例
    public static GameEventSystem Instance { get; private set; }

    // 事件字典：事件名称 -> 回调函数列表
    private Dictionary<string, List<Action<object>>> eventDictionary;

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
            InitEventDictionary();
        }
    }

    // 初始化事件字典
    private void InitEventDictionary()
    {
        if (eventDictionary == null)
        {
            eventDictionary = new Dictionary<string, List<Action<object>>>();
        }
    }

    /// <summary>
    /// 订阅事件
    /// </summary>
    /// <param name="eventName">事件名称</param>
    /// <param name="listener">回调函数</param>
    public void Subscribe(string eventName, Action<object> listener)
    {
        InitEventDictionary();

        // 如果事件不存在，创建新列表
        if (!eventDictionary.ContainsKey(eventName))
        {
            eventDictionary.Add(eventName, new List<Action<object>>());
        }

        // 添加回调（避免重复添加）
        if (!eventDictionary[eventName].Contains(listener))
        {
            eventDictionary[eventName].Add(listener);
        }
    }

    /// <summary>
    /// 取消订阅事件
    /// </summary>
    /// <param name="eventName">事件名称</param>
    /// <param name="listener">回调函数</param>
    public void Unsubscribe(string eventName, Action<object> listener)
    {
        InitEventDictionary();

        // 检查事件是否存在
        if (eventDictionary.ContainsKey(eventName))
        {
            // 移除回调
            if (eventDictionary[eventName].Contains(listener))
            {
                eventDictionary[eventName].Remove(listener);
                
                // 如果列表为空，移除事件
                if (eventDictionary[eventName].Count == 0)
                {
                    eventDictionary.Remove(eventName);
                }
            }
        }
    }

    /// <summary>
    /// 触发事件
    /// </summary>
    /// <param name="eventName">事件名称</param>
    /// <param name="data">事件数据</param>
    public void TriggerEvent(string eventName, object data = null)
    {
        InitEventDictionary();

        // 检查事件是否存在
        if (eventDictionary.ContainsKey(eventName))
        {
            // 复制列表防止执行中修改
            List<Action<object>> listeners = new List<Action<object>>(eventDictionary[eventName]);
            
            // 执行所有回调
            foreach (var listener in listeners)
            {
                try
                {
                    listener?.Invoke(data);
                }
                catch (Exception e)
                {
                    Debug.LogError($"事件{eventName}执行失败：{e.Message}");
                }
            }
        }
    }

    /// <summary>
    /// 移除所有事件
    /// </summary>
    public void ClearAllEvents()
    {
        if (eventDictionary != null)
        {
            eventDictionary.Clear();
        }
    }

    // 常用事件名称常量
    public static class EventNames
    {
        public const string GoldChanged = "GoldChanged";
        public const string CustomerPaid = "CustomerPaid";
        public const string GameSaved = "GameSaved";
        public const string GameLoaded = "GameLoaded";
    }
}