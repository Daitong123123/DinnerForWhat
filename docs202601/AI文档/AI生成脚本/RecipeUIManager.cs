using UnityEngine;
using UnityEngine.UI;

public class RecipeUIManager : MonoBehaviour
{
    // 单例实例
    public static RecipeUIManager Instance { get; private set; }

    // UI配置
    [Header("食谱UI配置")]
    public GameObject RecipeItemPrefab; // 食谱项预制体
    public Transform RecipeListContainer; // 食谱列表容器
    public GameObject RecipeDetailPanel; // 食谱详情面板
    public Image RecipeIconImage; // 食谱图标
    public Text RecipeNameText; // 食谱名称
    public Text RecipeIngredientsText; // 食材列表
    public Text RecipeStepsText; // 步骤说明
    public Text RecipePriceText; // 售价
    public Button UnlockRecipeButton; // 解锁按钮

    // 运行时数据
    private Recipe currentSelectedRecipe; // 当前选中的食谱

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

    private void Start()
    {
        // 初始化解锁按钮事件
        UnlockRecipeButton.onClick.AddListener(OnUnlockRecipeClicked);
        // 初始化食谱列表
        RefreshRecipeList();
        // 默认隐藏详情面板
        RecipeDetailPanel.SetActive(false);
    }

    /// <summary>
    /// 刷新食谱列表
    /// </summary>
    public void RefreshRecipeList()
    {
        // 清空现有列表项
        foreach (Transform child in RecipeListContainer)
        {
            Destroy(child.gameObject);
        }

        // 获取所有食谱
        var allRecipes = RecipeManager.Instance.GetAllRecipes();
        foreach (var recipe in allRecipes)
        {
            // 创建食谱项
            GameObject itemObj = Instantiate(RecipeItemPrefab, RecipeListContainer);
            
            // 获取组件
            Text recipeNameText = itemObj.transform.Find("RecipeName").GetComponent<Text>();
            Image recipeIcon = itemObj.transform.Find("RecipeIcon").GetComponent<Image>();
            Text unlockStatusText = itemObj.transform.Find("UnlockStatus").GetComponent<Text>();
            
            // 设置内容
            recipeNameText.text = recipe.RecipeName;
            recipeIcon.sprite = recipe.IconSprite;
            
            // 解锁状态
            bool isUnlocked = RecipeManager.Instance.IsRecipeUnlocked(recipe.RecipeId);
            unlockStatusText.text = isUnlocked ? "已解锁" : $"未解锁（{recipe.UnlockPrice}金币）";
            unlockStatusText.color = isUnlocked ? Color.green : Color.red;

            // 绑定点击事件
            Button selectButton = itemObj.GetComponent<Button>();
            selectButton.onClick.AddListener(() => ShowRecipeDetail(recipe));
            selectButton.interactable = true;
        }
    }

    /// <summary>
    /// 显示食谱详情
    /// </summary>
    private void ShowRecipeDetail(Recipe recipe)
    {
        currentSelectedRecipe = recipe;
        
        // 显示详情面板
        RecipeDetailPanel.SetActive(true);
        
        // 设置详情内容
        RecipeIconImage.sprite = recipe.IconSprite;
        RecipeNameText.text = recipe.RecipeName;
        RecipePriceText.text = $"售价：{recipe.Price}金币";

        // 拼接食材列表
        string ingredientsText = "食材：\n";
        foreach (var ing in recipe.RequiredIngredients)
        {
            var ingredient = IngredientManager.Instance.GetIngredient(ing.IngredientId);
            ingredientsText += $"- {ingredient.IngredientName} × {ing.Quantity}\n";
        }
        RecipeIngredientsText.text = ingredientsText;

        // 拼接步骤说明
        string stepsText = "制作步骤：\n";
        for (int i = 0; i < recipe.CookingSteps.Count; i++)
        {
            var step = recipe.CookingSteps[i];
            stepsText += $"{i+1}. {step.Description}\n";
        }
        RecipeStepsText.text = stepsText;

        // 设置解锁按钮状态
        bool isUnlocked = RecipeManager.Instance.IsRecipeUnlocked(recipe.RecipeId);
        UnlockRecipeButton.gameObject.SetActive(!isUnlocked);
        if (!isUnlocked)
        {
            UnlockRecipeButton.GetComponentInChildren<Text>().text = $"解锁（{recipe.UnlockPrice}金币）";
        }
    }

    /// <summary>
    /// 解锁食谱按钮点击事件
    /// </summary>
    private void OnUnlockRecipeClicked()
    {
        if (currentSelectedRecipe == null) return;

        // 调用商店系统解锁食谱
        bool success = ShopSystem.Instance.BuyRecipe(currentSelectedRecipe.RecipeId);
        if (success)
        {
            // 刷新UI
            RefreshRecipeList();
            ShowRecipeDetail(currentSelectedRecipe);
            
            // 显示提示
            UIManager.Instance.ShowPopup("解锁成功", $"已解锁食谱：{currentSelectedRecipe.RecipeName}");
        }
    }

    /// <summary>
    /// 关闭食谱详情面板
    /// </summary>
    public void CloseRecipeDetail()
    {
        RecipeDetailPanel.SetActive(false);
        currentSelectedRecipe = null;
    }

    /// <summary>
    /// 只显示已解锁的食谱
    /// </summary>
    public void ShowOnlyUnlockedRecipes()
    {
        // 清空现有列表项
        foreach (Transform child in RecipeListContainer)
        {
            Destroy(child.gameObject);
        }

        // 获取已解锁食谱
        var unlockedRecipes = RecipeManager.Instance.GetUnlockedRecipes();
        foreach (var recipe in unlockedRecipes)
        {
            // 创建食谱项（逻辑同RefreshRecipeList）
            GameObject itemObj = Instantiate(RecipeItemPrefab, RecipeListContainer);
            
            Text recipeNameText = itemObj.transform.Find("RecipeName").GetComponent<Text>();
            Image recipeIcon = itemObj.transform.Find("RecipeIcon").GetComponent<Image>();
            Text unlockStatusText = itemObj.transform.Find("UnlockStatus").GetComponent<Text>();
            
            recipeNameText.text = recipe.RecipeName;
            recipeIcon.sprite = recipe.IconSprite;
            unlockStatusText.text = "已解锁";
            unlockStatusText.color = Color.green;

            Button selectButton = itemObj.GetComponent<Button>();
            selectButton.onClick.AddListener(() => ShowRecipeDetail(recipe));
        }
    }
}