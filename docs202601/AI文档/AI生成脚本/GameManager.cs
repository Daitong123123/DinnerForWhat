using UnityEngine;
using System;

// 游戏全局状态枚举
public enum GameState
{
    Idle,           // 闲置（未摆摊）
    Stalling,       // 摆摊中
    Exploring,      // 地图探索中
    Closed          // 收摊/结束
}

public class GameManager : MonoBehaviour
{
    // 单例实例
    public static GameManager Instance { get; private set; }

    // 当前游戏状态
    public GameState CurrentGameState { get; private set; }

    // 事件定义（解耦模块通信）
    public event Action<GameState> OnGameStateChanged;

    private void Awake()
    {
        // 单例初始化
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
        }
        else
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        // 初始状态
        CurrentGameState = GameState.Idle;
    }

    /// <summary>
    /// 设置游戏状态
    /// </summary>
    /// <param name="newState">新的游戏状态</param>
    public void SetGameState(GameState newState)
    {
        if (CurrentGameState == newState) return;
        
        CurrentGameState = newState;
        OnGameStateChanged?.Invoke(newState);
        
        Debug.Log($"游戏状态变更: {CurrentGameState}");
    }

    /// <summary>
    /// 收摊操作（触发当日结算）
    /// </summary>
    public void CloseStall()
    {
        if (CurrentGameState != GameState.Stalling) return;
        
        SetGameState(GameState.Closed);
        // 触发收摊相关逻辑（后续由其他模块订阅事件处理）
    }

    /// <summary>
    /// 开始摆摊
    /// </summary>
    public void StartStalling()
    {
        if (CurrentGameState != GameState.Idle) return;
        
        SetGameState(GameState.Stalling);
        // 触发摆摊相关逻辑
    }
}