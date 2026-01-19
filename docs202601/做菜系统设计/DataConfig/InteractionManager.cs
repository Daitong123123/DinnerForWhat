public class InteractionManager : MonoBehaviour
{
    private ItemInstance selectedItem; // 玩家手里拿着的或选中的东西

    // 当玩家点击场景中的一个物品时
    public void OnItemClicked(ItemInstance targetItem)
    {
        if (selectedItem == null)
        {
            // 1. 什么都没选，点击物品 = 拿起/选中
            selectedItem = targetItem;
            UIManager.Instance.ShowSelectedItem(selectedItem);
            return;
        }

        // 2. 已经选中了东西，点击另一个东西 = 尝试交互

        // 情况A：选中的是工具，点击的是食材/容器
        if (selectedItem.data is ToolSO tool)
        {
            TryUseToolOnItem(tool, targetItem);
        }
        // 情况B：选中的是食材，点击的是容器（放入）
        else if (selectedItem.data is IngredientSO && targetItem.data is ContainerSO)
        {
            targetItem.contents.Add(selectedItem);
            RemoveItemFromScene(selectedItem); // 从桌上消失，进入锅里
            selectedItem = null; // 放下
        }
        // 情况C：选中的是食材，点击的是食材（尝试堆叠或混合）
        else if (selectedItem.data is IngredientSO && targetItem.data is IngredientSO)
        {
            // 简单的堆叠逻辑或混合逻辑
        }
    }

    // 核心逻辑：尝试用工具处理物品
    private void TryUseToolOnItem(ToolSO tool, ItemInstance target)
    {
        // 1. 检查环境：工具是否需要搭档？
        foreach (var partner in tool.requiredPartnerTools)
        {
            if (!IsPartnerPresent(partner))
            {
                Debug.LogError($"需要 {partner.itemName} 才能使用 {tool.itemName}！");
                return;
            }
        }

        // 2. 检查动作：玩家想做什么？（这里简化为工具支持的第一个动作，实际可通过UI选择）
        // 假设玩家想执行 Cut 动作
        if (tool.supportedActions.Contains(CookingAction.Cut))
        {
            ProcessCutting(tool, target);
        }
        else if (tool.supportedActions.Contains(CookingAction.Fry))
        {
            // 如果是锅，需要开启加热协程
            StartCoroutine(ProcessFrying(target));
        }
    }

    // 在 InteractionManager 中
private void ProcessMixing(ItemInstance container)
{
    // 1. 检查容器里是否有东西
    if (container.contents.Count == 0) return;

    // 2. 创建一个新的“复合食材”实例
    // 假设我们有一个通用的 "MixedFood" 数据模板，或者根据第一个食材决定
    ItemSO mixedData = Resources.Load<ItemSO>("MixedFoodTemplate"); 
    ItemInstance mixedResult = new ItemInstance(mixedData);

    // 3. 核心步骤：将容器里的所有食材，作为“子食材”添加到新实例中
    foreach (var item in container.contents)
    {
        // 使用深拷贝，确保原食材的状态被冻结在混合体中
        mixedResult.subIngredients.Add(new ItemInstance(item));
    }

    // 4. 设置混合状态标签
    mixedResult.currentState = StateTag.Mixed | StateTag.Cooked; // 假设混合伴随加热

    // 5. 清空容器，并放入混合后的结果
    container.contents.Clear();
    container.contents.Add(mixedResult);

    Debug.Log("食材混合完成！");
}


// 切菜动作（InteractionManager中）
private void ProcessCut(IngredientInstance ingredient)
{
    // 1. 获取该食材的切菜规则
    var cutRule = (ingredient.data as IngredientSO).GetProcessRule(ProcessType.Cut);
    if (cutRule == null)
    {
        Debug.LogError($"{ingredient.data.itemName} 不能切！");
        return;
    }

    // 2. 执行切菜：添加/移除标签（无时间，即时完成）
    ingredient.currentState |= cutRule.addTagOnComplete;
    ingredient.currentState &= ~cutRule.removeTagOnComplete;

    // 3. 更新视觉表现（切完变成“生番茄块”）
    UpdateIngredientVisual(ingredient);
}

    // 切菜逻辑
    private void ProcessCutting(ToolSO tool, ItemInstance target)
    {
        // 检查目标是否可切（通常生的都可以切）
        if ((target.currentState & StateTag.Raw) != 0)
        {
            // 改变状态
            target.currentState &= ~StateTag.Raw; // 移除生的标签
            target.currentState |= StateTag.Cut;   // 添加切好的标签
            
            // 改变外观（如果有对应的Sprite）
            // target.sprite = GetSpriteForState(target.data as IngredientSO, StateTag.Cut);
            
            Debug.Log($"你把 {target.data.itemName} 切好了！");
        }
        else
        {
            Debug.Log("这个东西不能切！");
        }
        
        // 切完后放下工具
        selectedItem = null;
    }

    // 烹饪逻辑（协程）
    private IEnumerator ProcessFrying(ItemInstance pan)
    {
        // 假设pan是一个容器，里面有食材
        foreach (var food in pan.contents)
        {
            food.cookTimer = 0;
            while (true)
            {
                yield return new WaitForSeconds(0.1f);
                food.cookTimer += 0.1f;

                // 模拟烹饪进度
                CheckCookingState(food);

                // 如果玩家点击停止或拿走锅，break
                if (!IsPanOnFire(pan)) break;
            }
        }
    }

    // 检查食材状态变化（生 -> 熟 -> 焦）
    private void CheckCookingState(ItemInstance food)
    {
        IngredientSO data = food.data as IngredientSO;
        
        // 假设我们查表找到这个食材煮熟需要2秒，烧焦需要5秒
        // 这里简化处理
        if (food.cookTimer > 5.0f && !food.currentState.HasFlag(StateTag.Burnt))
        {
            food.currentState |= StateTag.Burnt;
            food.currentState &= ~StateTag.Cooked;
            Debug.LogWarning($"{food.data.itemName} 烧焦了！");
        }
        else if (food.cookTimer > 2.0f && !food.currentState.HasFlag(StateTag.Cooked))
        {
            food.currentState |= StateTag.Cooked;
            food.currentState &= ~StateTag.Raw;
            Debug.Log($"{food.data.itemName} 煮熟了！");
        }
    }
}