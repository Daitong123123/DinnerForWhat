public class IngredientSO : ItemSO
{
    [Header("加工规则：该食材支持的所有加工动作")]
    public List<IngredientProcessRule> processRules;
    
    [Header("视觉表现：不同标签组合对应的显示效果")]
    public List<IngredientVisualState> visualStates;

    // 获取某个加工动作的规则（比如“煮”的规则）
    public IngredientProcessRule GetProcessRule(ProcessType type)
    {
        return processRules.Find(rule => rule.processType == type);
    }

    // 根据当前标签组合，获取对应的视觉表现
    public IngredientVisualState GetVisualState(StateTag currentTags)
    {
        // 优先匹配最精准的标签组合（比如先匹配Cut+Cooked，再匹配仅Cut）
        foreach (var visual in visualStates.OrderByDescending(v => CountTags(v.requiredTags)))
        {
            if ((currentTags & visual.requiredTags) == visual.requiredTags)
            {
                return visual;
            }
        }
        // 默认返回第一个视觉状态（生的）
        return visualStates.Count > 0 ? visualStates[0] : null;
    }

    // 辅助方法：计算标签数量（用于精准匹配）
    private int CountTags(StateTag tags)
    {
        int count = 0;
        foreach (StateTag tag in Enum.GetValues(typeof(StateTag)))
        {
            if (tag != StateTag.None && (tags & tag) == tag)
            {
                count++;
            }
        }
        return count;
    }
}