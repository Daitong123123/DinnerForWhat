// 加工类型：明确区分不同的加工动作（切/煮/炸/腌等）
public enum ProcessType
{
    Cut,        // 切（无时间，即时完成）
    Boil,       // 煮（加热类，有时间/烧焦）
    Fry,        // 炸（加热类，有时间/烧焦）
    Steam,      // 蒸（加热类，有时间/烧焦）
    Marinate,   // 腌制（有时间，无烧焦）
    Spice       // 加调料（即时完成，仅打标签）
}

// 单个加工动作的规则（比如“煮番茄需要3秒，超过5秒会烧焦”）
[System.Serializable]
public class IngredientProcessRule
{
    public ProcessType processType; // 加工动作类型（切/煮/炸）
    
    [Header("仅加热类动作生效（Boil/Fry/Steam）")]
    public float processTimeRequired; // 完成该动作需要的时间（比如煮3秒）
    public float burnTimeThreshold;   // 超过这个时间会烧焦（比如煮5秒）
    
    [Header("动作完成后添加的标签")]
    public StateTag addTagOnComplete; // 比如煮完加Cooked，切完加Cut
    
    [Header("动作完成后移除的标签（可选）")]
    public StateTag removeTagOnComplete; // 比如煮完移除Raw
}

// 最终状态的视觉表现（仅负责“什么标签组合显示什么样子”）
[System.Serializable]
public class IngredientVisualState
{
    public string displayName; // 显示名称：生番茄块、熟番茄块、焦番茄块
    public StateTag requiredTags; // 触发该视觉的标签组合（Cut | Cooked）
    public Sprite stateSprite; // 对应的图片
    public Vector2 colliderSize; // 碰撞体大小（可选）
}