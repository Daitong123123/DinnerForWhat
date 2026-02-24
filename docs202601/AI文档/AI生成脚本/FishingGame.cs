// 必须的命名空间引用
using UnityEngine;
using System.Collections; // 协程必需
using System.Collections.Generic; // List<>必需
using UnityEngine.UI; // UI组件必需

public class FishingGame : MonoBehaviour
{
    // 单例实例
    public static FishingGame Instance { get; private set; }

    // 钓鱼配置
    [Header("钓鱼配置")]
    public float MinFishingTime = 5f; // 最小钓鱼时间
    public float MaxFishingTime = 15f; // 最大钓鱼时间
    public Slider FishingProgressSlider; // 钓鱼进度条
    public Button ReelButton; // 收杆按钮
    public List<Ingredient> AvailableFish; // 可钓取的鱼类食材（修复List<>报错）
    public float RareFishChance = 0.1f; // 稀有鱼类概率

    // 运行时数据
    private bool isFishing = false; // 是否正在钓鱼
    private float fishingTimer; // 钓鱼计时器
    private float targetFishingTime; // 目标钓鱼时间

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
        // 绑定收杆按钮事件
        ReelButton.onClick.AddListener(OnReelButtonClicked);
        // 初始化UI
        ResetFishingUI();
    }

    private void Update()
    {
        if (!isFishing) return;

        // 更新钓鱼进度
        fishingTimer += Time.deltaTime;
        float progress = Mathf.Clamp01(fishingTimer / targetFishingTime);
        FishingProgressSlider.value = progress;

        // 钓鱼完成
        if (fishingTimer >= targetFishingTime)
        {
            CompleteFishing();
        }
    }

    /// <summary>
    /// 开始钓鱼
    /// </summary>
    public void StartFishing()
    {
        if (isFishing) return;

        // 初始化钓鱼状态
        isFishing = true;
        targetFishingTime = Random.Range(MinFishingTime, MaxFishingTime);
        fishingTimer = 0;

        // 更新UI
        FishingProgressSlider.maxValue = targetFishingTime;
        FishingProgressSlider.value = 0;
        ReelButton.interactable = true;
        
        Debug.Log($"开始钓鱼，预计需要{targetFishingTime:F1}秒");
    }

    /// <summary>
    /// 收杆按钮点击事件
    /// </summary>
    private void OnReelButtonClicked()
    {
        if (!isFishing) return;

        // 加速钓鱼进度
        fishingTimer += 1f; // 点击一次加速1秒
    }

    /// <summary>
    /// 完成钓鱼
    /// </summary>
    private void CompleteFishing()
    {
        isFishing = false;

        // 随机获取鱼类
        Ingredient caughtFish = GetRandomFish();

        // 添加到玩家库存
        IngredientManager.Instance.PurchaseIngredient(caughtFish.IngredientId, 1);
        
        Debug.Log($"钓到了：{caughtFish.IngredientName}");

        // 重置UI
        ResetFishingUI();

        // 触发钓鱼完成事件
        GameEventSystem.Instance.TriggerEvent("FishCaught", caughtFish);
    }

    /// <summary>
    /// 获取随机鱼类
    /// </summary>
    private Ingredient GetRandomFish()
    {
        // 区分普通/稀有鱼类
        List<Ingredient> rareFish = AvailableFish.FindAll(f => f.IsRare);
        List<Ingredient> normalFish = AvailableFish.FindAll(f => !f.IsRare);

        if (Random.value <= RareFishChance && rareFish.Count > 0)
        {
            // 钓到稀有鱼类
            return rareFish[Random.Range(0, rareFish.Count)];
        }
        else
        {
            // 钓到普通鱼类
            return normalFish[Random.Range(0, normalFish.Count)];
        }
    }

    /// <summary>
    /// 重置钓鱼UI
    /// </summary>
    private void ResetFishingUI()
    {
        FishingProgressSlider.value = 0;
        ReelButton.interactable = false;
    }

    /// <summary>
    /// 退出钓鱼小游戏
    /// </summary>
    public void ExitFishingGame()
    {
        isFishing = false;
        ResetFishingUI();
        // 返回地图场景
        MapSystem.Instance.GoToPlace("Map");
    }
}