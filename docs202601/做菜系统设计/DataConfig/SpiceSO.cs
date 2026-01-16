public class SpiceSO : ItemSO
{
    public StateTag applyTag; // 倒出来后给食材加什么标签 (Spiced_Salt)
    public int maxCount = 100; // 一瓶盐最多用100次
}

public class SpiceInstance : ItemInstance, IHoldable
{
    public int currentCount; // 当前剩余量

    public void OnHoldStart()
    {
        Debug.Log("拿起了调料瓶，准备倒");
        // 播放拿起音效
    }

    public void OnHoldEnd()
    {
        Debug.Log("放下了调料瓶");
    }

    // 核心逻辑：当玩家拿着调料瓶，点击了锅（IUsable）
    public void OnInteract(IUsable target)
    {
        // 1. 检查目标是否是容器（锅、碗）
        if (target is ContainerInstance container)
        {
            // 2. 检查调料是否用完
            if (currentCount <= 0) return;

            // 3. 消耗调料
            currentCount--;

            // 4. 给容器里的所有东西打标签
            foreach (var food in container.Contents)
            {
                food.currentState |= (Data as SpiceSO).applyTag;
                Debug.Log($"给 {food.data.itemName} 加了 {Data.itemName}");
            }

            // 5. 播放特效（粒子系统）
            // SpawnParticle(container.transform.position);
        }
    }
}