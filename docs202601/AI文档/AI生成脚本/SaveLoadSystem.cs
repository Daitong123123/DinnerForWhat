using System.IO;
using UnityEngine;
using System.Runtime.Serialization.Formatters.Binary;

public class SaveLoadSystem : MonoBehaviour
{
    // 单例实例
    public static SaveLoadSystem Instance { get; private set; }

    // 存档配置
    [Header("存档配置")]
    public string SaveFileName = "game_save.dat"; // 存档文件名
    public bool AutoSaveOnQuit = true; // 退出时自动存档
    public bool AutoSaveOnEndStall = true; // 收摊时自动存档

    // 存档路径
    private string saveFilePath;

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
            // 初始化存档路径（持久化数据路径）
            saveFilePath = Path.Combine(Application.persistentDataPath, SaveFileName);
        }
    }

    private void OnEnable()
    {
        // 订阅收摊事件
        GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
    }

    private void OnDisable()
    {
        GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
    }

    private void OnApplicationQuit()
    {
        // 退出游戏时自动存档
        if (AutoSaveOnQuit)
        {
            SaveGame();
        }
    }

    /// <summary>
    /// 游戏状态变更回调（收摊时自动存档）
    /// </summary>
    private void OnGameStateChanged(GameState newState)
    {
        if (AutoSaveOnEndStall && newState == GameState.Idle && GameManager.Instance.PreviousGameState == GameState.Stalling)
        {
            SaveGame();
        }
    }

    /// <summary>
    /// 保存游戏
    /// </summary>
    public void SaveGame()
    {
        try
        {
            // 创建二进制格式化器
            BinaryFormatter formatter = new BinaryFormatter();
            // 创建文件流
            using (FileStream stream = new FileStream(saveFilePath, FileMode.Create))
            {
                // 序列化玩家数据
                formatter.Serialize(stream, PlayerDataManager.Instance.CurrentPlayerData);
            }
            Debug.Log($"游戏已保存到：{saveFilePath}");
            
            // 触发存档成功事件
            GameEventSystem.Instance.TriggerEvent("GameSaved", true);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"存档失败：{e.Message}");
            GameEventSystem.Instance.TriggerEvent("GameSaved", false);
        }
    }

    /// <summary>
    /// 加载游戏
    /// </summary>
    /// <returns>是否加载成功</returns>
    public bool LoadGame()
    {
        // 检查存档文件是否存在
        if (!File.Exists(saveFilePath))
        {
            Debug.LogWarning("存档文件不存在，使用默认数据");
            return false;
        }

        try
        {
            // 创建二进制格式化器
            BinaryFormatter formatter = new BinaryFormatter();
            // 打开文件流
            using (FileStream stream = new FileStream(saveFilePath, FileMode.Open))
            {
                // 反序列化玩家数据
                PlayerData loadedData = (PlayerData)formatter.Deserialize(stream);
                // 更新玩家数据
                PlayerDataManager.Instance.CurrentPlayerData = loadedData;
            }
            Debug.Log($"游戏已从：{saveFilePath} 加载");
            
            // 触发读档成功事件
            GameEventSystem.Instance.TriggerEvent("GameLoaded", true);
            return true;
        }
        catch (System.Exception e)
        {
            Debug.LogError($"读档失败：{e.Message}");
            GameEventSystem.Instance.TriggerEvent("GameLoaded", false);
            return false;
        }
    }

    /// <summary>
    /// 删除存档
    /// </summary>
    public void DeleteSave()
    {
        if (File.Exists(saveFilePath))
        {
            File.Delete(saveFilePath);
            Debug.Log("存档已删除");
        }
        else
        {
            Debug.LogWarning("无存档文件可删除");
        }
    }

    /// <summary>
    /// 检查是否有存档
    /// </summary>
    /// <returns>是否存在存档</returns>
    public bool HasSaveFile()
    {
        return File.Exists(saveFilePath);
    }
}