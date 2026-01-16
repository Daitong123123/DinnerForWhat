public class IngredientScanner
{
    // 定义一个字典来存储扫描结果：Key是食材模板，Value是包含的总数量
    public Dictionary<ItemSO, int> ScanResult { get; private set; }

    public IngredientScanner()
    {
        ScanResult = new Dictionary<ItemSO, int>();
    }

    // 核心方法：扫描一个物品（支持无限层级混合）
    public void Scan(ItemInstance item)
    {
        if (item == null) return;

        // 情况A：如果是混合状态，递归扫描它的子食材
        if (item.currentState.HasFlag(StateTag.Mixed))
        {
            foreach (var subItem in item.subIngredients)
            {
                Scan(subItem); // 递归！这是关键
            }
        }
        // 情况B：如果是基础食材，直接计数
        else
        {
            if (ScanResult.ContainsKey(item.data))
            {
                ScanResult[item.data]++;
            }
            else
            {
                ScanResult[item.data] = 1;
            }
        }
        
        // 额外：扫描状态标签（比如检查是否加了盐）
        // 这里可以根据需要记录状态，比如：是否有烧焦的成分？是否有辣味？
    }

    // 辅助方法：重置扫描
    public void Reset()
    {
        ScanResult.Clear();
    }

    // 辅助方法：检查是否包含某种食材
    public bool Contains(ItemSO target)
    {
        return ScanResult.ContainsKey(target) && ScanResult[target] > 0;
    }

    // 辅助方法：获取某种食材的总数量
    public int GetCount(ItemSO target)
    {
        return ScanResult.TryGetValue(target, out int count) ? count : 0;
    }
}