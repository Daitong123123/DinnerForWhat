// 必须的命名空间引用
using UnityEngine;
using System.Collections; // 协程必需
using System.Collections.Generic; // List集合必需
using UnityEngine.UI; // UI组件必需

public class CookingSystem : MonoBehaviour
{
    // 单例实例
    public static CookingSystem Instance { get; private set; }

    // 烹饪配置
    [Header("烹饪配置")]
    public float BaseCookingTime = 3f; // 基础烹饪时间
    public Slider CookingProgressSlider; // 烹饪进度条
    public GameObject SuccessPopup; // 成功提示
    public GameObject FailPopup; // 失败提示

    // 运行时数据
    private Recipe currentRecipe; // 当前烹饪的食谱
    private int currentStepIndex = 0; // 当前步骤索引
    private float cookingTimer = 0; // 烹饪计时器
    private bool isCooking = false; // 是否正在烹饪
    private string currentSelectedToolId = ""; // 当前选中的厨具ID

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
        }
        else
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
    }

    private void Update()
    {
        if (!isCooking || currentRecipe == null) return;

        // 更新烹饪进度
        cookingTimer += Time.deltaTime;
        float progress = Mathf.Clamp01(cookingTimer / GetCurrentStepTime());
        CookingProgressSlider.value = progress;

        // 步骤完成检测
        if (cookingTimer >= GetCurrentStepTime())
        {
            CompleteCurrentStep();
        }
    }

    /// <summary>
    /// 开始烹饪指定食谱
    /// </summary>
    public bool StartCooking(string recipeId)
    {
        // 检查是否正在烹饪
        if (isCooking)
        {
            Debug.LogWarning("正在烹饪中，无法开始新的烹饪");
            return false;
        }

        // 获取食谱数据
        currentRecipe = RecipeManager.Instance.GetRecipe(recipeId);
        if (currentRecipe == null)
        {
            Debug.LogError($"食谱ID不存在：{recipeId}");
            return false;
        }

        // 检查食材是否足够
        if (!CheckIngredientsEnough())
        {
            Debug.LogWarning("食材不足，无法开始烹饪");
            return false;
        }

        // 初始化烹饪状态
        currentStepIndex = 0;
        cookingTimer = 0;
        isCooking = true;

        // 消耗食材
        ConsumeIngredients();

        // 初始化进度条
        CookingProgressSlider.maxValue = GetCurrentStepTime();
        CookingProgressSlider.value = 0;

        Debug.Log($"开始烹饪：{currentRecipe.RecipeName}");
        return true;
    }

    /// <summary>
    /// 检查食材是否足够
    /// </summary>
    private bool CheckIngredientsEnough()
    {
        foreach (var reqIng in currentRecipe.RequiredIngredients)
        {
            int currentCount = IngredientManager.Instance.GetIngredientCount(reqIng.IngredientId);
            if (currentCount < reqIng.Quantity)
            {
                return false;
            }
        }
        return true;
    }

    /// <summary>
    /// 消耗食材
    /// </summary>
    private void ConsumeIngredients()
    {
        foreach (var reqIng in currentRecipe.RequiredIngredients)
        {
            IngredientManager.Instance.ConsumeIngredient(reqIng.IngredientId, reqIng.Quantity);
        }
    }

    /// <summary>
    /// 获取当前步骤的烹饪时间
    /// </summary>
    private float GetCurrentStepTime()
    {
        if (currentStepIndex >= currentRecipe.CookingSteps.Count) return 0;
        return currentRecipe.CookingSteps[currentStepIndex].TimeRequired;
    }

    /// <summary>
    /// 完成当前步骤
    /// </summary>
    private void CompleteCurrentStep()
    {
        currentStepIndex++;
        cookingTimer = 0;

        // 检查是否所有步骤完成
        if (currentStepIndex >= currentRecipe.CookingSteps.Count)
        {
            CompleteCooking();
            return;
        }

        // 更新进度条最大值
        CookingProgressSlider.maxValue = GetCurrentStepTime();
        Debug.Log($"完成步骤 {currentStepIndex}，开始步骤 {currentStepIndex + 1}");
    }

    /// <summary>
    /// 完成烹饪
    /// </summary>
    private void CompleteCooking()
    {
        isCooking = false;

        // 创建菜品
        Dish newDish = new Dish
        {
            DishId = System.Guid.NewGuid().ToString(),
            RecipeId = currentRecipe.RecipeId,
            Score = CalculateCookingScore(),
            CreateTime = GameTimeSystem.Instance.GetFormattedTime()
        };

        // 存入菜品仓库
        DishStorage.Instance.AddDish(newDish);

        // 显示成功提示
        if (SuccessPopup != null)
        {
            SuccessPopup.SetActive(true);
            Invoke(nameof(HideSuccessPopup), 2f);
        }

        Debug.Log($"烹饪完成：{currentRecipe.RecipeName}，评分：{newDish.Score}");
        
        // 重置当前食谱
        currentRecipe = null;
        currentStepIndex = 0;
    }

    /// <summary>
    /// 隐藏成功提示
    /// </summary>
    private void HideSuccessPopup()
    {
        if (SuccessPopup != null)
        {
            SuccessPopup.SetActive(false);
        }
    }

    /// <summary>
    /// 计算烹饪评分
    /// </summary>
    private int CalculateCookingScore()
    {
        // 基础评分 + 随机波动
        int baseScore = 80;
        int randomBonus = Random.Range(-10, 11);
        return Mathf.Clamp(baseScore + randomBonus, 0, 100);
    }

    /// <summary>
    /// 取消烹饪
    /// </summary>
    public void CancelCooking()
    {
        if (!isCooking) return;

        isCooking = false;
        currentRecipe = null;
        currentStepIndex = 0;
        cookingTimer = 0;
        CookingProgressSlider.value = 0;

        // 显示失败提示
        if (FailPopup != null)
        {
            FailPopup.SetActive(true);
            Invoke(nameof(HideFailPopup), 2f);
        }

        Debug.Log("烹饪已取消");
    }

    /// <summary>
    /// 隐藏失败提示
    /// </summary>
    private void HideFailPopup()
    {
        if (FailPopup != null)
        {
            FailPopup.SetActive(false);
        }
    }

    /// <summary>
    /// 选择厨具用于烹饪
    /// </summary>
    public void SelectKitchenTool(string toolId)
    {
        // 检查厨具是否可用
        var tool = KitchenToolManager.Instance.GetKitchenTool(toolId);
        if (tool == null)
        {
            Debug.LogError($"厨具ID不存在：{toolId}");
            return;
        }

        // 检查是否拥有该厨具
        if (!KitchenToolManager.Instance.HasKitchenTool(toolId))
        {
            Debug.LogError($"未拥有厨具：{toolId}");
            return;
        }

        // 记录选中的厨具
        currentSelectedToolId = toolId;
        Debug.Log($"选中厨具：{tool.ToolName}");

        // 更新摊位展示的选中状态
        StallDisplay.Instance.HighlightSelectedTool(toolId);
    }

    /// <summary>
    /// 使用选中的厨具执行烹饪步骤
    /// </summary>
    /// <returns>是否成功</returns>
    public bool UseSelectedToolForStep()
    {
        if (string.IsNullOrEmpty(currentSelectedToolId))
        {
            Debug.LogWarning("未选中任何厨具");
            return false;
        }

        if (currentRecipe == null || currentStepIndex >= currentRecipe.CookingSteps.Count)
        {
            Debug.LogWarning("无当前烹饪配方或步骤已完成");
            return false;
        }

        var currentStep = currentRecipe.CookingSteps[currentStepIndex];
        
        // 检查厨具是否匹配当前步骤
        if (currentStep.RequiredToolId != currentSelectedToolId)
        {
            Debug.LogWarning($"当前步骤需要{currentStep.RequiredToolId}，但选中的是{currentSelectedToolId}");
            return false;
        }

        // 执行步骤
        CompleteCurrentStep();
        
        // 触发厨具冷却
        StartCoroutine(ToolCooldown(currentSelectedToolId, 2f)); // 2秒冷却
        
        return true;
    }

    /// <summary>
    /// 厨具冷却协程（修复IEnumerator报错）
    /// </summary>
    private IEnumerator ToolCooldown(string toolId, float coolDownTime)
    {
        float timer = coolDownTime;
        StallDisplay.Instance.UpdateToolUsageState(toolId, true, timer);

        while (timer > 0)
        {
            timer -= Time.deltaTime;
            StallDisplay.Instance.UpdateToolUsageState(toolId, true, timer);
            yield return null;
        }

        // 冷却结束
        StallDisplay.Instance.UpdateToolUsageState(toolId, false);
    }

    /// <summary>
    /// 检查是否正在烹饪
    /// </summary>
    public bool IsCooking()
    {
        return isCooking;
    }

    /// <summary>
    /// 获取当前烹饪的食谱
    /// </summary>
    public Recipe GetCurrentRecipe()
    {
        return currentRecipe;
    }
}

// 烹饪步骤数据模型
[System.Serializable]
public class CookingStep
{
    public string StepId;
    public string Description;
    public float TimeRequired;
    public string RequiredToolId; // 所需厨具ID
}