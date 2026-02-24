public class PotInstance : ItemInstance, IUsable, IContainer
{
    public List<ItemInstance> Contents { get; set; } = new List<ItemInstance>();

    // 当玩家拿着东西点击锅时
    public void OnUse(ItemInstance handItem, ItemInstance targetOnPot)
    {
        // 情况A：玩家手里是空的，点击锅 = 打开锅盖/查看
        if (handItem == null)
        {
            Debug.Log("查看锅内");
            return;
        }

        // 情况B：玩家手里拿着食材 = 放入锅中
        if (handItem is IngredientInstance)
        {
            Contents.Add(handItem);
            handItem.Destroy(); // 从场景中移除
            Debug.Log("食材入锅");
            return;
        }

        // 情况C：玩家手里拿着工具（比如铲子） = 触发烹饪动作
        if (handItem is ToolInstance tool)
        {
            // 检查工具是否支持搅拌/翻炒
            var action = tool.GetAction(CookingAction.Stir);
            if (action != null)
            {
                Debug.Log("开始翻炒！");
                // 启动协程处理翻炒逻辑
            }
        }
    }
}

public class CuttingBoardInstance : ItemInstance, IUsable
{
    public void OnUse(ItemInstance handItem, ItemInstance targetOnBoard)
    {
        // 只有当玩家手里拿着刀，且砧板上有食材时，才能切
        if (handItem is ToolInstance knife && targetOnBoard is IngredientInstance food)
        {
            // 检查刀是否支持切动作
            if (knife.SupportsAction(CookingAction.Cut))
            {
                food.currentState |= StateTag.Cut;
                Debug.Log("切菜完成");
            }
        }
    }
}