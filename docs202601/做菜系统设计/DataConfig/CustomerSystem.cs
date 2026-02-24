//结算系统
public class CustomerSystem : MonoBehaviour
{
public void EvaluateDish(ItemInstance plate, RecipeSO targetRecipe)
{
    // 1. 初始化扫描仪
    IngredientScanner scanner = new IngredientScanner();
    
    // 2. 扫描盘子里的所有东西（假设盘子里只有一个混合后的大菜）
    foreach (var food in plate.contents)
    {
        scanner.Scan(food);
    }

    // 3. 验证菜谱需求
    bool isSuccess = true;
    
    foreach (var req in targetRecipe.requirements)
    {
        int foundCount = 0;
        
        // 遍历扫描结果，检查哪些食材符合要求
        foreach (var kvp in scanner.ScanResult)
        {
            ItemSO ingredient = kvp.Key;
            int count = kvp.Value;

            // 检查食材类型是否匹配
            if (req.allowedIngredients.Contains(ingredient))
            {
                foundCount += count;
            }
        }

        if (foundCount < req.minCount)
        {
            Debug.LogError($"缺少材料：{req.allowedIngredients[0].itemName}，需要{req.minCount}，实际{foundCount}");
            isSuccess = false;
        }
        else if (foundCount > req.maxCount)
        {
            Debug.LogWarning($"材料过多：{req.allowedIngredients[0].itemName}，建议{req.maxCount}，实际{foundCount}");
            // 可以扣分，但不算完全失败
        }
    }

    // 4. 检查“黑暗料理”情况（放了不该放的东西）
    // 逻辑：扫描结果里有的食材，不在菜谱允许列表里
    foreach (var kvp in scanner.ScanResult)
    {
        bool isAllowed = false;
        
        // 检查这个食材是否被菜谱的任何一个需求允许
        foreach (var req in targetRecipe.requirements)
        {
            if (req.allowedIngredients.Contains(kvp.Key))
            {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed)
        {
            Debug.LogError($"非法添加物：{kvp.Key.itemName}！顾客要吐了！");
            isSuccess = false;
            // 这里可以触发特殊的差评动画
        }
    }

    if (isSuccess)
    {
        Debug.Log("完美！这就是顾客要的菜！");
    }
}
}