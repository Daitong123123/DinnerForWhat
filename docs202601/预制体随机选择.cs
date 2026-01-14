using UnityEngine;
using System.Collections; // 核心：引入非泛型IEnumerator的命名空间
using System.Collections.Generic;

#if UNITY_EDITOR
using UnityEditor;
#endif

public class CharacterSpawner : MonoBehaviour
{
    [Header("生成配置")]
    public List<GameObject> characterPrefabs;
    public int maxCharacterCount = 4;

    [Header("排列间距配置")]
    public float characterSpacing = 2.0f;

    [Header("按键触发配置")]
    public KeyCode spawnSingleKey = KeyCode.G;
    public KeyCode spawnAllKey = KeyCode.F;
    public KeyCode clearAllKey = KeyCode.R;
    public KeyCode randomRemoveKey = KeyCode.T;

    [Header("平滑移动配置")]
    public float moveDuration = 0.2f;
    public AnimationCurve moveCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);

    [Header("调试预览配置")]
    public float labelYOffset = 0.5f;
    public float labelXOffset = 0f;

    private List<GameObject> spawnedCharacters = new List<GameObject>();
    private bool isRearranging = false;

    void Update()
    {
        if (Input.GetKeyDown(spawnSingleKey)) SpawnSingleCharacter();
        if (Input.GetKeyDown(spawnAllKey)) SpawnAllCharacters();
        if (Input.GetKeyDown(clearAllKey)) ClearAllCharacters();
        if (Input.GetKeyDown(randomRemoveKey)) RandomRemoveCharacterAndFillGap();
    }

    public void SpawnSingleCharacter()
    {
        if (!ValidateBasicSetup()) return;
        if (spawnedCharacters.Count >= maxCharacterCount)
        {
            Debug.LogWarning("已达到最大角色生成数量");
            return;
        }

        int currentIndex = spawnedCharacters.Count;
        Vector2 spawnPos = GetSpawnPositionByIndex(currentIndex);

        GameObject randomPrefab = characterPrefabs[Random.Range(0, characterPrefabs.Count)];
        GameObject newCharacter = Instantiate(randomPrefab, spawnPos, Quaternion.identity);
        newCharacter.transform.parent = transform;

        spawnedCharacters.Add(newCharacter);

        CharacterDestroyer destroyer = newCharacter.AddComponent<CharacterDestroyer>();
        destroyer.onDestroyCallback = () =>
        {
            spawnedCharacters.Remove(newCharacter);
            StartCoroutine(RearrangeCharactersSmooth()); // 启动协程
        };
    }

    public void SpawnAllCharacters()
    {
        ClearAllCharacters();
        for (int i = 0; i < maxCharacterCount; i++)
        {
            SpawnSingleCharacter();
        }
    }

    public void ClearAllCharacters()
    {
        foreach (GameObject character in spawnedCharacters)
        {
            if (character != null) Destroy(character);
        }
        spawnedCharacters.Clear();
    }

    public void RandomRemoveCharacterAndFillGap()
    {
        if (spawnedCharacters.Count == 0)
        {
            Debug.LogWarning("当前没有生成的角色可移除！");
            return;
        }

        int removeIndex = Random.Range(0, spawnedCharacters.Count);
        GameObject removeCharacter = spawnedCharacters[removeIndex];

        if (removeCharacter != null)
        {
            Destroy(removeCharacter);
        }
    }

    // 修复核心：使用非泛型IEnumerator（协程专用）
    private IEnumerator RearrangeCharactersSmooth()
    {
        if (isRearranging) yield break;
        isRearranging = true;

        float elapsed = 0f;
        Dictionary<GameObject, Vector2> targetPositions = new Dictionary<GameObject, Vector2>();

        // 记录所有角色的目标位置
        for (int i = 0; i < spawnedCharacters.Count; i++)
        {
            GameObject character = spawnedCharacters[i];
            if (character == null) continue;
            targetPositions[character] = GetSpawnPositionByIndex(i);
        }

        // 平滑移动逻辑
        while (elapsed < moveDuration)
        {
            elapsed += Time.deltaTime;
            float t = moveCurve.Evaluate(elapsed / moveDuration); // 用曲线控制平滑度

            foreach (var pair in targetPositions)
            {
                pair.Key.transform.position = Vector2.Lerp(
                    pair.Key.transform.position,
                    pair.Value,
                    t
                );
            }
            yield return null; // 等待下一帧
        }

        // 最终修正位置（避免浮点误差）
        foreach (var pair in targetPositions)
        {
            pair.Key.transform.position = pair.Value;
        }

        isRearranging = false;
    }

    private Vector2 GetSpawnPositionByIndex(int index)
    {
        Vector2 spawnerPos = transform.position;
        float targetX = spawnerPos.x + index * characterSpacing;
        float targetY = spawnerPos.y;
        return new Vector2(targetX, targetY);
    }

    private bool ValidateBasicSetup()
    {
        if (characterPrefabs == null || characterPrefabs.Count == 0)
        {
            Debug.LogError("请添加至少一个角色预制体到列表中！");
            return false;
        }

        foreach (GameObject prefab in characterPrefabs)
        {
            if (prefab == null)
            {
                Debug.LogError("预制体列表中包含空对象，请检查！");
                return false;
            }
        }

        if (characterSpacing <= 0)
        {
            Debug.LogWarning("间距不能≤0，已自动设为2.0");
            characterSpacing = 2.0f;
        }

        return true;
    }

    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.blue;
        Gizmos.DrawSphere(transform.position, 0.2f);

        if (characterSpacing <= 0) return;

        Gizmos.color = Color.red;
        for (int i = 0; i < maxCharacterCount; i++)
        {
            Vector2 previewPos = GetSpawnPositionByIndex(i);
            Gizmos.DrawSphere(previewPos, 0.15f);
        }

#if UNITY_EDITOR
        Vector2 startLabelPos = new Vector2(transform.position.x + labelXOffset,
                                           transform.position.y + labelYOffset);
        Handles.Label(startLabelPos, "生成起点");

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