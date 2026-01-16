using System.Collections.Generic;
using UnityEngine;

public class VehicleManager : MonoBehaviour
{
    // 单例实例
    public static VehicleManager Instance { get; private set; }

    // 所有载具配置表（Inspector中配置）
    public List<Vehicle> AllVehicles;

    // 载具字典（ID->Vehicle）
    private Dictionary<string, Vehicle> vehicleDictionary;

    // 当前使用的载具
    private Vehicle currentVehicle;

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
            InitVehicleDictionary();
            // 初始化默认载具
            SetDefaultVehicle();
        }
    }

    // 初始化载具字典
    private void InitVehicleDictionary()
    {
        vehicleDictionary = new Dictionary<string, Vehicle>();
        foreach (var vehicle in AllVehicles)
        {
            if (!vehicleDictionary.ContainsKey(vehicle.VehicleId))
            {
                vehicleDictionary.Add(vehicle.VehicleId, vehicle);
            }
            else
            {
                Debug.LogError($"重复载具ID：{vehicle.VehicleId}");
            }
        }
    }

    /// <summary>
    /// 设置默认载具（新手初始载具）
    /// </summary>
    private void SetDefaultVehicle()
    {
        string defaultVehicleId = PlayerDataManager.Instance.CurrentPlayerData.CurrentVehicleId;
        if (vehicleDictionary.TryGetValue(defaultVehicleId, out var defaultVehicle))
        {
            currentVehicle = defaultVehicle;
            // 解锁默认载具
            currentVehicle.IsUnlocked = true;
            if (!PlayerDataManager.Instance.CurrentPlayerData.OwnedVehicles.Contains(defaultVehicleId))
            {
                PlayerDataManager.Instance.CurrentPlayerData.OwnedVehicles.Add(defaultVehicleId);
            }
        }
        else
        {
            Debug.LogError($"默认载具ID不存在：{defaultVehicleId}");
        }
    }

    /// <summary>
    /// 购买载具
    /// </summary>
    /// <param name="vehicleId">载具ID</param>
    /// <returns>是否购买成功</returns>
    public bool PurchaseVehicle(string vehicleId)
    {
        // 1. 校验载具是否存在
        if (!vehicleDictionary.ContainsKey(vehicleId))
        {
            Debug.LogError($"载具ID不存在：{vehicleId}");
            return false;
        }

        var vehicle = vehicleDictionary[vehicleId];

        // 2. 校验是否已拥有
        if (PlayerDataManager.Instance.CurrentPlayerData.OwnedVehicles.Contains(vehicleId))
        {
            Debug.Log($"已拥有载具：{vehicle.VehicleName}");
            return true;
        }

        // 3. 校验金币是否足够
        if (!GoldManager.Instance.CheckGoldEnough(vehicle.PurchasePrice))
        {
            Debug.LogError($"金币不足：购买{vehicle.VehicleName}需要{vehicle.PurchasePrice}金币");
            return false;
        }

        // 4. 扣除金币
        GoldManager.Instance.SubtractGold(vehicle.PurchasePrice);

        // 5. 标记为已拥有
        PlayerDataManager.Instance.CurrentPlayerData.OwnedVehicles.Add(vehicleId);
        vehicle.IsUnlocked = true;

        Debug.Log($"成功购买载具：{vehicle.VehicleName}，消耗{vehicle.PurchasePrice}金币");
        return true;
    }

    /// <summary>
    /// 切换当前使用的载具
    /// </summary>
    /// <param name="vehicleId">载具ID</param>
    /// <returns>是否切换成功</returns>
    public bool SwitchVehicle(string vehicleId)
    {
        // 1. 校验是否已拥有
        if (!PlayerDataManager.Instance.CurrentPlayerData.OwnedVehicles.Contains(vehicleId))
        {
            Debug.LogError($"未拥有载具：{vehicleId}");
            return false;
        }

        // 2. 校验载具是否存在
        if (!vehicleDictionary.TryGetValue(vehicleId, out var vehicle))
        {
            Debug.LogError($"载具ID不存在：{vehicleId}");
            return false;
        }

        // 3. 校验当前库存是否超过新载具的载重
        if (vehicle.CalculateUsedWeight() > vehicle.MaxWeight)
        {
            Debug.LogError($"当前库存重量超过{vehicle.VehicleName}的最大载重，无法切换");
            return false;
        }

        // 4. 切换载具
        currentVehicle = vehicle;
        PlayerDataManager.Instance.CurrentPlayerData.CurrentVehicleId = vehicleId;

        // 触发载具切换事件
        GameEventSystem.Instance.TriggerEvent("VehicleSwitched", vehicle);
        
        Debug.Log($"切换到载具：{vehicle.VehicleName}");
        return true;
    }

    /// <summary>
    /// 获取当前使用的载具
    /// </summary>
    /// <returns>当前载具</returns>
    public Vehicle GetCurrentVehicle()
    {
        return currentVehicle;
    }

    /// <summary>
    /// 检查当前载具是否可添加指定重量
    /// </summary>
    /// <param name="weight">需要的重量</param>
    /// <returns>是否可以</returns>
    public bool CheckCurrentVehicleWeightEnough(float weight)
    {
        if (currentVehicle == null) return false;
        return currentVehicle.CanAddWeight(weight);
    }

    /// <summary>
    /// 获取已拥有的载具列表
    /// </summary>
    /// <returns>载具列表</returns>
    public List<Vehicle> GetOwnedVehicles()
    {
        List<Vehicle> owned = new List<Vehicle>();
        foreach (var vehicleId in PlayerDataManager.Instance.CurrentPlayerData.OwnedVehicles)
        {
            if (vehicleDictionary.TryGetValue(vehicleId, out var vehicle))
            {
                owned.Add(vehicle);
            }
        }
        return owned;
    }
}