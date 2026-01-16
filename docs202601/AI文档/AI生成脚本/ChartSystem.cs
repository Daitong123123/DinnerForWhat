using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ChartSystem : MonoBehaviour
{
    // 单例实例
    public static ChartSystem Instance { get; private set; }

    // 图表配置
    [Header("图表配置")]
    public Image ChartBackground; // 图表背景
    public RectTransform ChartContainer; // 图表容器
    public Color LineColor = Color.green; // 折线颜色
    public float LineWidth = 2f; // 折线宽度
    public int MaxDisplayDays = 7; // 最大显示天数

    // 运行时数据
    private LineRenderer lineRenderer; // 折线渲染器

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
            InitLineRenderer();
        }
    }

    // 初始化折线渲染器
    private void InitLineRenderer()
    {
        // 创建折线对象
        GameObject lineObj = new GameObject("IncomeChartLine");
        lineObj.transform.SetParent(ChartContainer);
        lineObj.transform.localPosition = Vector3.zero;

        // 添加LineRenderer组件
        lineRenderer = lineObj.AddComponent<LineRenderer>();
        lineRenderer.material = new Material(Shader.Find("UI/Default"));
        lineRenderer.startColor = LineColor;
        lineRenderer.endColor = LineColor;
        lineRenderer.startWidth = LineWidth;
        lineRenderer.endWidth = LineWidth;
        lineRenderer.positionCount = 0;

        // 默认隐藏图表
        SetChartVisible(false);
    }

    /// <summary>
    /// 生成收入折线图
    /// </summary>
    public void GenerateIncomeChart()
    {
        // 获取历史收入数据
        var historyData = TransactionManager.Instance.GetHistoryIncomeData();
        if (historyData.Count == 0)
        {
            Debug.LogWarning("无历史流水数据，无法生成折线图");
            return;
        }

        // 显示图表
        SetChartVisible(true);

        // 筛选最近N天的数据
        var sortedDays = new List<int>(historyData.Keys);
        sortedDays.Sort();
        if (sortedDays.Count > MaxDisplayDays)
        {
            sortedDays = sortedDays.GetRange(sortedDays.Count - MaxDisplayDays, MaxDisplayDays);
        }

        // 计算最大值（用于归一化）
        int maxIncome = 0;
        foreach (var day in sortedDays)
        {
            maxIncome = Mathf.Max(maxIncome, historyData[day]);
        }
        maxIncome = Mathf.Max(maxIncome, 1); // 避免除以0

        // 配置折线点
        lineRenderer.positionCount = sortedDays.Count;
        float containerWidth = ChartContainer.rect.width;
        float containerHeight = ChartContainer.rect.height;
        float stepX = containerWidth / (sortedDays.Count - 1);

        for (int i = 0; i < sortedDays.Count; i++)
        {
            int day = sortedDays[i];
            int income = historyData[day];
            
            // 计算点的位置（归一化到容器尺寸）
            float x = i * stepX - containerWidth / 2;
            float y = (float)income / maxIncome * containerHeight - containerHeight / 2;
            
            lineRenderer.SetPosition(i, new Vector3(x, y, 0));
        }
    }

    /// <summary>
    /// 设置图表可见性
    /// </summary>
    private void SetChartVisible(bool visible)
    {
        ChartBackground.gameObject.SetActive(visible);
        lineRenderer.gameObject.SetActive(visible);
    }

    /// <summary>
    /// 隐藏图表
    /// </summary>
    public void HideChart()
    {
        SetChartVisible(false);
    }
}