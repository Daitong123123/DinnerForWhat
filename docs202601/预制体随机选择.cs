using UnityEngine;
using System.Collections.Generic;

// 仅在Unity Editor中启用DrawLabel（避免编译错误）
#if UNITY_EDITOR
using UnityEditor;
#endif

public class CharacterSpawner : MonoBehaviour
{
    [Header("生成配置")]
    [Tooltip("角色预制体列表（每个预制体可自带动画/精灵，随机生成其中一个）")]
    public List<GameObject> characterPrefabs; // 核心修改：单预制体→预制体列表
    [Tooltip("最大生成数量")]
    public int maxCharacterCount = 4;

    [Header("排列间距配置（核心）")]
    [Tooltip("角色之间的总间距（从一个角色中心到下一个角色中心的距离）")]
    public float characterSpacing = 2.0f;

    [Header("按键触发配置")]
    [Tooltip("生成单个角色的按键")]
    public KeyCode spawnSingleKey = KeyCode.G;
    [Tooltip("一次性生成全部角色的按键")]
    public KeyCode spawnAllKey = KeyCode.F;
    [Tooltip("清除所有角色的按键")]
    public KeyCode clearAllKey = KeyCode.R;

    [Header("调试预览配置（可选）")]
    [Tooltip("预览标签的垂直偏移量（2D Y轴方向，正数向上）")]
    public float labelYOffset = 0.5f;
    [Tooltip("预览标签的水平偏移量（2D X轴方向，正数向右）")]
    public float labelXOffset = 0f;

    // 存储已生成的角色
    private List<GameObject> spawnedCharacters = new List<GameObject>();

    void Update()
    {
        // 按键触发逻辑
        if (Input.GetKeyDown(spawnSingleKey)) SpawnSingleCharacter();
        if (Input.GetKeyDown(spawnAllKey)) SpawnAllCharacters();
        if (Input.GetKeyDown(clearAllKey)) ClearAllCharacters();
    }

    /// <summary>
    /// 生成单个角色（以生成器位置为起点，向右排列，随机选预制体）
    /// </summary>
    public void SpawnSingleCharacter()
    {
        // 验证基础配置
        if (!ValidateBasicSetup()) return;

        // 检查是否达最大数量
        if (spawnedCharacters.Count >= maxCharacterCount)
        {
            Debug.LogWarning("已达到最大角色生成数量", this);
            return;
        }

        // 当前要生成的是第几个角色（索引从0开始）
        int currentIndex = spawnedCharacters.Count;
        // 计算位置：生成器位置为起点，向右偏移 索引×间距
        Vector2 spawnPos = GetSpawnPositionByIndex(currentIndex);

        // 核心修改：从预制体列表中随机选一个
        GameObject randomPrefab = characterPrefabs[Random.Range(0, characterPrefabs.Count)];
        // 实例化选中的预制体
        GameObject newCharacter = Instantiate(randomPrefab, spawnPos, Quaternion.identity);
        newCharacter.transform.parent = transform; // 设为生成器子物体，方便管理

        // 添加到列表，绑定销毁回调
        spawnedCharacters.Add(newCharacter);
        CharacterDestroyer destroyer = newCharacter.AddComponent<CharacterDestroyer>();
        destroyer.onDestroyCallback = () => spawnedCharacters.Remove(newCharacter);
    }

    /// <summary>
    /// 一次性生成所有角色
    /// </summary>
    public void SpawnAllCharacters()
    {
        ClearAllCharacters();
        for (int i = 0; i < maxCharacterCount; i++)
        {
            SpawnSingleCharacter();
        }
    }

    /// <summary>
    /// 清除所有角色
    /// </summary>
    public void ClearAllCharacters()
    {
        foreach (GameObject character in spawnedCharacters)
        {
            if (character != null) Destroy(character);
        }
        spawnedCharacters.Clear();
    }

    /// <summary>
    /// 核心：根据索引计算生成位置（以生成器为起点向右排列）
    /// </summary>
    /// <param name="index">角色索引（0=第一个，1=第二个...）</param>
    /// <returns>世界坐标位置</returns>
    private Vector2 GetSpawnPositionByIndex(int index)
    {
        // 生成器的世界坐标（脚本挂载物体的位置）
        Vector2 spawnerPos = transform.position;
        // 第index个角色的X位置 = 生成器X + index × 间距
        float targetX = spawnerPos.x + index * characterSpacing;
        // Y位置和生成器保持一致
        float targetY = spawnerPos.y;

        return new Vector2(targetX, targetY);
    }

    /// <summary>
    /// 验证基础配置是否正确（适配预制体列表）
    /// </summary>
    private bool ValidateBasicSetup()
    {
        // 核心修改：校验预制体列表
        if (characterPrefabs == null || characterPrefabs.Count == 0)
        {
            Debug.LogError("请添加至少一个角色预制体到列表中！", this);
            return false;
        }

        // 校验列表中的每个预制体是否有效
        foreach (GameObject prefab in characterPrefabs)
        {
            if (prefab == null)
            {
                Debug.LogError("预制体列表中包含空对象，请检查！", this);
                return false;
            }
            // 可选：校验预制体是否有动画组件（如果需要确保有动画）
            // if (!prefab.GetComponent<Animator>())
            // {
            //     Debug.LogWarning($"预制体{prefab.name}缺少Animator组件，可能无法播放动画", this);
            // }
        }

        if (characterSpacing <= 0)
        {
            Debug.LogWarning("间距不能≤0，已自动设为2.0", this);
            characterSpacing = 2.0f;
        }

        return true;
    }

    /// <summary>
    /// Scene视图绘制预览（无编译错误，兼容所有环境）
    /// </summary>
    void OnDrawGizmosSelected()
    {
        // 绘制生成器位置（蓝色原点）
        Gizmos.color = Color.blue;
        Gizmos.DrawSphere(transform.position, 0.2f);

        // 绘制所有角色的预览位置（红色原点）
        if (characterSpacing <= 0) return; // 间距无效时不绘制
        Gizmos.color = Color.red;
        for (int i = 0; i < maxCharacterCount; i++)
        {
            Vector2 previewPos = GetSpawnPositionByIndex(i);
            Gizmos.DrawSphere(previewPos, 0.15f);
        }

        // 仅在Unity Editor中绘制标签（避免编译错误）
#if UNITY_EDITOR
        // 生成起点标签
        Vector2 startLabelPos = new Vector2(transform.position.x + labelXOffset,
                                           transform.position.y + labelYOffset);
        Handles.Label(startLabelPos, "生成起点");

        // 角色标签
        for (int i = 0; i < maxCharacterCount; i++)
        {
            Vector2 previewPos = GetSpawnPositionByIndex(i);
            Vector2 characterLabelPos = new Vector2(previewPos.x + labelXOffset,
                                                   previewPos.y + labelYOffset);
            Handles.Label(characterLabelPos, $"角色{i + 1}");
        }
#endif
    }
}

/// <summary>
/// 角色销毁回调辅助类
/// </summary>
public class CharacterDestroyer : MonoBehaviour
{
    public System.Action onDestroyCallback;

    void OnDestroy()
    {
        onDestroyCallback?.Invoke();
    }
}