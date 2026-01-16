using System.Collections.Generic;
using UnityEngine;

// 场所类型枚举
public enum PlaceType
{
    Stall,      // 摆摊点
    Shop,       // 商店
    Fishing,    // 钓鱼场
    Home        // 家
}

// 场所数据模型
[System.Serializable]
public class PlaceData
{
    public string PlaceId; // 场所ID
    public PlaceType Type; // 场所类型
    public string Name; // 场所名称
    public Vector2 MapPosition; // 地图上的位置
    public Sprite IconSprite; // 图标Sprite
    public string SceneName; // 对应场景名称
}

public class MapSystem : MonoBehaviour
{
    // 单例实例
    public static MapSystem Instance { get; private set; }

    // 地图配置
    [Header("地图配置")]
    public List<PlaceData> AllPlaces; // 所有场所数据
    public Sprite MapBackgroundSprite; // 地图背景Sprite

    // 运行时数据
    private Dictionary<string, PlaceData> placeDictionary; // 场所ID->数据
    private PlaceData currentPlace; // 当前所在场所

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
            InitPlaceDictionary();
        }
    }

    // 初始化场所字典
    private void InitPlaceDictionary()
    {
        placeDictionary = new Dictionary<string, PlaceData>();
        foreach (var place in AllPlaces)
        {
            if (!placeDictionary.ContainsKey(place.PlaceId))
            {
                placeDictionary.Add(place.PlaceId, place);
            }
            else
            {
                Debug.LogError($"重复场所ID：{place.PlaceId}");
            }
        }
    }

    /// <summary>
    /// 前往指定场所
    /// </summary>
    /// <param name="placeId">场所ID</param>
    /// <returns>是否成功</returns>
    public bool GoToPlace(string placeId)
    {
        // 校验场所是否存在
        if (!placeDictionary.TryGetValue(placeId, out var place))
        {
            Debug.LogError($"场所ID不存在：{placeId}");
            return false;
        }

        // 记录当前场所
        currentPlace = place;

        // 停止摆摊（如果正在摆摊）
        if (GameManager.Instance.CurrentGameState == GameState.Stalling)
        {
            GameManager.Instance.EndStall();
        }

        // 加载对应场景
        SceneLoader.Instance.LoadScene(place.SceneName);
        
        Debug.Log($"前往场所：{place.Name}");
        return true;
    }

    /// <summary>
    /// 获取当前所在场所
    /// </summary>
    /// <returns>场所数据</returns>
    public PlaceData GetCurrentPlace()
    {
        return currentPlace;
    }

    /// <summary>
    /// 获取所有场所数据
    /// </summary>
    /// <returns>场所列表</returns>
    public List<PlaceData> GetAllPlaces()
    {
        return new List<PlaceData>(AllPlaces);
    }

    /// <summary>
    /// 获取指定类型的场所
    /// </summary>
    /// <param name="type">场所类型</param>
    /// <returns>场所列表</returns>
    public List<PlaceData> GetPlacesByType(PlaceType type)
    {
        return AllPlaces.FindAll(p => p.Type == type);
    }
}