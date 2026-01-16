public class ItemInstance
{
    public ItemSO data; // 基础数据模板
    public StateTag currentState; // 当前状态标签（生、熟、切好、混合...）
    public float cookTimer; // 烹饪计时器

    // 核心改动：如果是混合状态，这个列表存储混合前的所有食材
    public List<ItemInstance> subIngredients; 

    // 构造函数
    public ItemInstance(ItemSO data)
    {
        this.data = data;
        this.currentState = StateTag.Raw; // 默认是生的
        this.subIngredients = new List<ItemInstance>();
    }

    // 复制构造函数（深拷贝，非常重要）
    public ItemInstance(ItemInstance other)
    {
        this.data = other.data;
        this.currentState = other.currentState;
        this.cookTimer = other.cookTimer;
        
        // 深拷贝子食材列表，防止引用错乱
        this.subIngredients = new List<ItemInstance>();
        foreach (var sub in other.subIngredients)
        {
            this.subIngredients.Add(new ItemInstance(sub));
        }
    }
}