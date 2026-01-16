public class IngredientSO : ItemSO
{
    public List<IngredientState> possibleStates; // 这个食材能变成的状态列表
}

// 状态定义：生的、切好的、熟的、焦的、加了盐的...
[System.Serializable]
public class IngredientState
{
    public StateTag stateTag; // 标签：Raw, Cut, Cooked, Burnt, Spiced_Salt...
    public Sprite stateSprite; // 不同状态显示不同图片
    public float cookTimeRequired; // 达到此状态需要的烹饪时间
    public float burnTime; // 超过这个时间会变成焦的
}

// 标签系统：用位运算或者列表存储，方便判断
[System.Flags]
public enum StateTag
{
    None = 0,
    Raw = 1 << 0,
    Cut = 1 << 1,
    Cooked = 1 << 2,
    Burnt = 1 << 3,
    // 调料标签
    Spiced_Salt = 1 << 4,
    Spiced_Soy = 1 << 5,
    Spiced_Sugar = 1 << 6,
    // 混合标签（用于成品）
    Mixed = 1 << 30
}