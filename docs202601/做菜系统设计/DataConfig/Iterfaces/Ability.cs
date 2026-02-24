// 所有能被“放置”或“作为操作台”的东西（厨具、桌子、砧板）
public interface IUsable
{
    void OnUse(ItemInstance user, ItemInstance target); // user是玩家手里的东西，target是操作台上的东西
}

// 所有能被“手持使用”的东西（调料瓶、手机、特殊道具）
public interface IHoldable
{
    void OnHoldStart(); // 拿起时（比如盐瓶晃动音效）
    void OnHoldEnd();   // 放下时
    void OnInteract(IUsable target); // 对着某个可交互物体使用（比如对着锅倒盐）
}