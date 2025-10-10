# 《像素炼金铺》AI协助开发实操步骤（2D休闲合成模拟）

### 一、前期筹备：定风格 + 搭专属工具栈（1 天）

#### 1. 锁定像素美术风格与技术标准



* **风格定义**：用 Midjourney 生成参考图，明确视觉方向

  提示词：`2D pixel art, alchemy shop interior, warm brown tones, 16-bit detail, cozy lighting, top-down view, potion bottles and cauldron`

  （最终确定 “复古 16 位像素 + 暖色调” 风格，确保后续 AI 生成素材统一）

* **技术规格**：


  * 角色 / 物品像素尺寸：64×64px（便于合成时视觉匹配）

  * 场景 Tile 尺寸：32×32px（适配 Unity Tilemap 快速拼接）

  * 界面分辨率：1920×1080（UI 元素适配此分辨率设计）

#### 2. 搭建《像素炼金铺》专属工具栈



| 模块     | 工具选择（免费 / 低成本）                 | 核心用途                     |
| ------ | ------------------------------ | ------------------------ |
| 像素美术   | Leonardo.ai（像素模型）+ Piskel（帧动画） | 生成元素 / 物品 / 角色像素图、制作合成动画 |
| 合成逻辑代码 | Cursor（代码生成）+ GitHub Copilot   | 实现拖拽合成、配方解锁、订单判定脚本       |
| 音频生成   | Suno V3（BGM）+ Freesound（音效库）   | 炼金主题 BGM、合成成功 / 订单完成音效   |
| 数据管理   | ChatGPT 4o（生成配方表）              | 批量生成 60 + 物品合成公式、订单数据    |
| 场景搭建   | Tiled（地图编辑）+ AI 生成 Tile 集      | 快速制作炼金铺内部场景              |

### 二、美术资产生产：AI 批量生成 + 像素微调（3 天）

#### 1. 核心元素与物品资产（优先级最高）



* **步骤 1：生成基础元素图标**

  工具：Leonardo.ai（选择 “Pixel Art” 模型）

  提示词模板：`pixel art icon, alchemy element {元素名}, 64x64px, flat design, warm color palette`

  需生成：水（蓝色水滴）、火（橙红色火焰）、土（棕黄色石块）、气（淡蓝色气流）4 种基础元素，每种 3 个角度（正面 / 侧面 / 俯视，确保拖拽时视觉连贯）

* **步骤 2：生成合成物品图**

  按 “基础元素→中级物品→高级物品” 分层生成，例如：

  提示词：`pixel art, alchemy item {物品名}, 64x64px, {材质描述}, {关联元素特征}`

  示例：


  * 水 + 火 = 蒸汽：`pixel art, alchemy item steam cloud, 64x64px, translucent white, wispy, with small water droplets and orange sparkles`

  * 蒸汽 + 齿轮 = 蒸汽机：`pixel art, alchemy item steam engine, 64x64px, brass metal, small gears, steam coming out of pipes`

    （批量生成 60 + 物品，按 “基础 / 中级 / 高级” 分类归档）

* **步骤 3：制作合成动画反馈**

  工具：Piskel（在线帧动画）

  操作：用 AI 生成 “合成闪光”“物品融合” 单帧图（提示词：`pixel art animation frame, alchemy synthesis effect, sparkles and smoke, 64x64px`），导入 Piskel 制作 5 帧动画（帧间隔 80ms），导出为 PNG 序列帧

#### 2. 场景与 UI 资产



* **炼金铺场景搭建**：

1. 用 AI 生成 Tile 集：提示词`pixel art tile set, alchemy shop interior, wooden floors, stone walls, shelves with potion bottles, 32x32px, seamless`（通过 Scenario.gg 生成，确保 Tile 边缘可拼接）

2. 导入 Tiled 编辑器，拼接场景（包含柜台、货架、合成台 3 个核心区域），导出为 TMX 格式，再导入 Unity

* **UI 资产**：


  * 合成面板：提示词`pixel art UI panel, alchemy synthesis interface, brown wood frame, glass potion slots, 512x384px`

  * 订单面板：提示词`pixel art UI list, customer order sheet, parchment texture, black ink text slots, 384x512px`

  * 按钮图标：提示词`pixel art UI button, {按钮功能}, 64x64px, wooden texture, gold border`（生成 “合成”“取消”“交付订单” 3 类按钮）

#### 3. 角色资产（顾客 + 店主）



* **顾客角色**：生成 10 种不同形象（区分性别 / 服饰），提示词`pixel art character, alchemy shop customer, {特征描述}, 64x64px, standing pose`（例如 “old wizard with long white beard, purple robe”）

* **店主角色**：生成 1 个主角形象，附带 2 个动作帧（ idle / 递出物品），用 Piskel 制作简单循环动画（8 帧，帧间隔 150ms）

### 三、核心玩法开发：代码生成 + 逻辑整合（5 天）

#### 1. 数据驱动：批量生成配方与订单数据（1 天）



* **步骤 1：用 AI 生成配方表**

  工具：ChatGPT 4o

  提示词模板：`帮我生成《像素炼金铺》的物品合成配方表，包含60个物品，分3级（基础4个/中级30个/高级26个），格式：物品ID,物品名,所需材料1,所需材料2,解锁条件,合成耗时（秒）`

  示例输出：



```
1,水,,,"初始解锁",0

2,火,,,"初始解锁",0

3,土,,,"初始解锁",0

4,气,,,"初始解锁",0

5,蒸汽,1(水),2(火),"解锁基础元素后",2

6,蒸汽机,5(蒸汽),7(齿轮),"解锁蒸汽后",5
```



* **步骤 2：生成订单数据**

  提示词模板：`帮我生成《像素炼金铺》30个顾客订单，格式：订单ID,顾客ID,所需物品ID,数量,时限（秒）,奖励金币,订单描述`

  示例输出：



```
1,1,5(蒸汽),2,60,100,"铁匠需要蒸汽清洁工具，限时1分钟"

2,2,6(蒸汽机),1,120,300,"工坊主需要蒸汽机带动机器，限时2分钟"
```



* **步骤 3：导入 Unity 数据**

  用 ChatGPT 生成 ScriptableObject 脚本，将配方表和订单数据转换为 Unity 可读取的 SO 文件，示例代码：



```
\[CreateAssetMenu(fileName = "AlchemyRecipe", menuName = "Alchemy/Recipe")]

public class AlchemyRecipe : ScriptableObject

{

&#x20;   public int itemID;

&#x20;   public string itemName;

&#x20;   public List\<Ingredient> requiredIngredients; // 包含材料ID和数量

&#x20;   public string unlockCondition;

&#x20;   public float craftTime;

}

// 生成Ingredient类存储材料信息

\[System.Serializable]

public class Ingredient

{

&#x20;   public int materialID;

&#x20;   public int quantity;

}
```

#### 2. 核心功能实现（3 天）



* **功能 1：拖拽合成系统**

  用 Cursor 生成核心脚本，提示词：`Unity C# 2D拖拽合成系统脚本，功能：1. 拖拽元素/物品到合成台格子；2. 检测是否满足配方条件；3. 满足条件时播放合成动画并生成物品；4. 合成过程中显示倒计时。需引用之前创建的AlchemyRecipe ScriptableObject`

  关键逻辑：


  * 拖拽检测：通过 OnMouseDown/OnMouseDrag/OnMouseUp 实现物品跟随鼠标

  * 配方匹配：遍历配方表，对比合成台格子中的材料 ID 与数量

  * 动画触发：合成成功时调用之前制作的 “合成闪光” 动画预制体

* **功能 2：订单系统**

  提示词：`Unity C#订单系统脚本，功能：1. 随机生成顾客订单（从订单数据SO中读取）；2. 显示订单要求（物品、数量、时限）；3. 检测玩家是否完成订单并交付；4. 超时未完成扣除金币。需关联UI订单面板`

  关键逻辑：


  * 订单刷新：每完成 1 个订单，延迟 5 秒随机生成下 1 个（避免玩家等待）

  * 时限管理：用 Coroutine 倒计时，剩余 10 秒时 UI 变红提醒

  * 奖励发放：交付成功后更新金币 UI，解锁新配方（按配方表解锁条件判断）

* **功能 3：图鉴系统**

  提示词：`Unity C#图鉴系统脚本，功能：1. 记录已解锁的物品；2. 显示物品合成配方和图标；3. 按“基础/中级/高级”分类查看。需关联UI图鉴面板`

  关键逻辑：


  * 解锁判定：玩家首次合成物品时，更新图鉴解锁状态

  * 图鉴 UI：用 Grid Layout Group 自动排列物品图标，点击图标显示详情

#### 3. 调试与优化（1 天）



* **常见 BUG 修复**：


  * 拖拽时物品穿透 UI：用 Cursor 生成 “UI 阻挡检测” 代码，提示词：`Unity C# 2D拖拽时检测UI遮挡，当鼠标经过UI时停止拖拽`

  * 合成配方误判：让 AI 检查代码逻辑，提示词：`帮我检查以下合成配方匹配代码，是否存在“材料数量判断错误”的问题，若有则修复`

* **性能优化**：


  * 批量生成物品预制体时，用 AI 写 “对象池” 脚本，提示词：`Unity C# 2D对象池脚本，用于管理合成物品预制体的创建和回收，减少Instantiate和Destroy调用`

### 四、音频与动效：氛围营造 + 反馈强化（1 天）

#### 1. 背景音乐（BGM）



* 用 Suno V3 生成炼金主题 BGM，提示词：`relaxing pixel art game BGM, alchemy shop theme, acoustic guitar and harp, 75 BPM, loopable, warm tone`（生成 2 首，主菜单 1 首 + 游戏内 1 首）

* 导入 Unity 后设置 “Loop” 为 true，用 Audio Mixer 调整音量，确保不掩盖音效

#### 2. 音效设计



* **核心反馈音效**：


  * 合成成功：提示词`short pixel art game sound effect, alchemy synthesis success, bell chime and sparkles, 0.5 seconds`（Freesound 下载免费音效，或用 ElevenLabs 生成）

  * 订单交付：提示词`short sound effect, coin clinking, positive feedback, 0.3 seconds`

  * 拖拽元素：提示词`soft click sound, 0.2 seconds, low volume`

* **场景氛围音效**：


  * 顾客进店：提示词`short door creak sound, 0.8 seconds`

  * 炼金台冒泡：提示词`soft bubbling sound, loopable, 2 seconds`（合成时播放）

#### 3. 动效整合



* 合成成功时：播放闪光动画 + 成功音效 + 轻微屏幕震动（用 DOTween 实现，代码提示词：`Unity C# DOTween屏幕震动效果，合成成功时触发，震动强度0.1，持续0.5秒`）

* 订单超时：播放警告音效 + UI 闪烁（提示词：`Unity C# UI闪烁动画，订单超时后UI每0.2秒切换透明度，持续2秒`）

### 五、整合与测试：场景搭建 + 玩家反馈（2 天）

#### 1. 场景与 UI 整合



* **主场景搭建**：

1. 将 Tiled 制作的炼金铺场景导入 Unity，添加 Tilemap 碰撞体（防止玩家角色穿模）

2. 放置合成台、订单面板、图鉴面板 UI，设置初始显示 / 隐藏状态（主菜单隐藏游戏 UI，进入游戏后显示）

3. 添加顾客生成点（设置在门口，订单刷新时生成顾客预制体）

* **UI 交互逻辑**：

  用 AI 写 “UI 管理器” 脚本，提示词：`Unity C# UI管理器脚本，功能：1. 切换主菜单/游戏/图鉴面板；2. 更新金币和订单倒计时UI；3. 显示合成进度条。需关联所有UI元素`

#### 2. 测试与调整



* **内部测试**：


  * 按 “新手流程” 测试：从主菜单→进入游戏→合成首个物品→接订单→交付，检查每个环节是否流畅

  * 用 AI 生成测试用例，提示词：`帮我生成《像素炼金铺》10个测试场景，覆盖新手引导、合成失败、订单超时、图鉴解锁等场景`

* **玩家反馈收集**：

1. 生成简易测试问卷（ChatGPT 4o），包含 “合成逻辑清晰度”“UI 易用性”“音效满意度” 等 5 个核心问题

2. 邀请 3-5 名休闲游戏玩家测试，根据反馈调整：例如合成台格子尺寸太小→增大 UI；订单时限太短→延长至 120 秒

### 六、上线准备：轻量化发布 + 创意工坊预留（1 天）

#### 1. 上架素材制作



* **Steam 商店图**：用 Midjourney 生成封面，提示词：`pixel art game cover, alchemy shop, main character holding a potion, customers in background, text space at bottom, warm color`

* **商店描述**：用 Claude 3 生成，提示词：`帮我写《像素炼金铺》Steam商店描述，突出“60+合成物品”“30个订单关卡”“像素治愈风格”卖点，语言简洁，适合休闲玩家`

#### 2. 创意工坊功能预留



* 用 AI 写 “自定义配方导入” 脚本，提示词：`Unity C# 读取外部CSV文件导入自定义合成配方，支持玩家通过Steam创意工坊上传自己的配方表，需处理文件格式验证`

  （无需完全实现，预留接口，后续可通过更新开放）

### 关键避坑指南（针对《像素炼金铺》）



1. **合成逻辑清晰性**：AI 生成的配方表需人工校验，避免 “循环合成”（如 A 需要 B，B 需要 A），确保新手能按 “基础→中级→高级” 逐步解锁

2. **像素资产一致性**：所有 AI 生成的像素图统一用 Piskel 调整色调（按参考图的暖棕色系校准），避免出现 “冷色调物品混入暖色调场景” 的违和感

3. **订单难度梯度**：前期订单仅需 1-2 步合成（如水 + 火 = 蒸汽），后期才需要 3-4 步（如蒸汽 + 齿轮 = 蒸汽机 + 金属 = 高级机械），用 AI 生成 “难度梯度表” 辅助调整

4. **移动端适配预留**：若后续想发布移动端，开发时让 AI 写 “触摸拖拽” 兼容代码，提示词：`Unity C# 2D拖拽支持触摸输入，同时兼容鼠标和触屏设备`

> （注：文档部分内容可能由 AI 生成）