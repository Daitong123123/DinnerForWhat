public abstract class ItemSO : ScriptableObject
{
    public string itemName;
    public Sprite icon;
    public float weight; // 用于小车载重
    public ItemType itemType;
}

public enum ItemType { Ingredient, Tool, Container, Dish }