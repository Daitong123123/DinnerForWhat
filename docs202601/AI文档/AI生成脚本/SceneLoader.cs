// 必须的命名空间引用
using UnityEngine;
using System.Collections; // 协程必需
using System.Collections.Generic; // List集合必需
using UnityEngine.UI; // Image组件必需
using UnityEngine.SceneManagement; // 场景管理必需

public class SceneLoader : MonoBehaviour
{
    // 单例实例
    public static SceneLoader Instance { get; private set; }

    // 过渡效果配置
    [Header("过渡配置")]
    public Image FadeImage; // 过渡遮罩图片（修复Image找不到）
    public float FadeDuration = 0.5f; // 过渡时长
    public Color FadeColor = Color.black; // 过渡颜色

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
            
            // 初始化过渡图片
            if (FadeImage != null)
            {
                FadeImage.color = new Color(FadeColor.r, FadeColor.g, FadeColor.b, 0);
                FadeImage.gameObject.SetActive(true);
            }
        }
    }

    /// <summary>
    /// 加载场景（带过渡效果）
    /// </summary>
    /// <param name="sceneName">场景名称</param>
    public void LoadScene(string sceneName)
    {
        StartCoroutine(LoadSceneWithFade(sceneName)); // 修复IEnumerator报错
    }

    /// <summary>
    /// 带过渡效果加载场景的协程
    /// </summary>
    private IEnumerator LoadSceneWithFade(string sceneName)
    {
        // 淡出（遮罩显示）
        yield return StartCoroutine(Fade(1)); // 修复IEnumerator报错

        // 加载场景
        AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneName);
        while (!asyncLoad.isDone)
        {
            yield return null;
        }

        // 淡入（遮罩隐藏）
        yield return StartCoroutine(Fade(0)); // 修复IEnumerator报错
    }

    /// <summary>
    /// 过渡效果协程
    /// </summary>
    /// <param name="targetAlpha">目标透明度</param>
    private IEnumerator Fade(float targetAlpha)
    {
        if (FadeImage == null) yield break;

        float startAlpha = FadeImage.color.a;
        float elapsedTime = 0;

        while (elapsedTime < FadeDuration)
        {
            elapsedTime += Time.deltaTime;
            float alpha = Mathf.Lerp(startAlpha, targetAlpha, elapsedTime / FadeDuration);
            FadeImage.color = new Color(FadeColor.r, FadeColor.g, FadeColor.b, alpha);
            yield return null;
        }

        // 确保最终透明度准确
        FadeImage.color = new Color(FadeColor.r, FadeColor.g, FadeColor.b, targetAlpha);
    }

    /// <summary>
    /// 加载摆摊场景
    /// </summary>
    public void LoadStallScene()
    {
        LoadScene("StallScene"); // 假设摆摊场景名为StallScene
    }

    /// <summary>
    /// 加载主菜单场景
    /// </summary>
    public void LoadMainMenuScene()
    {
        LoadScene("MainMenuScene"); // 假设主菜单场景名为MainMenuScene
    }
}