public class RecipeSO : ScriptableObject
{
    public string dishName;
    public int price;
    
    // 配方：需要包含哪些标签的食材
    public List<RecipeRequirement> requirements;
    
    // 评分权重：什么是完美？
    public float perfectCookedTime; // 建议烹饪时长
}

[System.Serializable]
public class RecipeRequirement
{
    public StateTag requiredState; // 必须是：切好的 + 熟的 + 加了盐的
    public int minCount;           // 至少几个
    public int maxCount;           // 最多几个
    public IngredientSO[] allowedIngredients; // 允许的食材列表（留空则任意）
}