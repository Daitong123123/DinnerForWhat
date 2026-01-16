public class ToolSO : ItemSO
{
    public List<CookingAction> supportedActions; // 这个工具能执行的动作
    public List<ToolSO> requiredPartnerTools;    // 需要的搭档（比如菜刀需要砧板）
}