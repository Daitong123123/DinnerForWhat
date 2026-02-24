// 确保PlayerData.cs可正确序列化（原有代码基础上补充）
[System.Serializable]
public class PlayerData
{
    // 原有字段保持不变，补充以下内容确保序列化兼容性
    
    // 版本号（用于存档兼容）
    public int SaveVersion = 1;
    
    // 确保所有集合类型使用可序列化的类型
    public List<string> OwnedKitchenTools = new List<string>();
    public List<string> OwnedRecipes = new List<string>();
    public List<string> OwnedVehicles = new List<string>();
    public List<IngredientInventory> IngredientInventory = new List<IngredientInventory>();
    public List<TransactionRecord> TransactionRecords = new List<TransactionRecord>();
    
    // 游戏状态数据
    public int CurrentDay = 1;
    public int Gold = 1000; // 初始金币
    public string CurrentVehicleId = "vehicle_01"; // 默认载具ID
    
    // 当日统计
    public int TodayEarnings = 0;
    public int TodayServedCustomers = 0;
    public int TodayGoodReviews = 0;
    public int TodayBadReviews = 0;
}

// 确保TransactionRecord可序列化
[System.Serializable]
public class TransactionRecord
{
    public string RecordId;
    public int Amount;
    public TransactionType TransactionType;
    public string TransactionTime;
    public int Day;
}

public enum TransactionType
{
    Income,     // 收入
    Expense     // 支出
}

// 确保IngredientInventory可序列化
[System.Serializable]
public class IngredientInventory
{
    public string IngredientId;
    public int Quantity;
    public float Weight; // 单份重量
}