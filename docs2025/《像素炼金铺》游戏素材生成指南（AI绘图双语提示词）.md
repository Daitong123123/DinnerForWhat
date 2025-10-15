# 《像素炼金铺》游戏素材生成指南（AI 绘图双语提示词）

## 一、文档说明



1. **风格基准**：所有素材统一遵循 “复古 16 位像素 + 暖棕色系” 风格，色调参考 “#8B4513（棕木色）、#F5DEB3（小麦色）、#CD853F（秘鲁色）” 配色方案

2. **技术规格**：严格按玩法文档要求设定尺寸，场景 Tile 为 32×32px，角色 / 物品为 64×64px，UI 面板为指定尺寸（如合成面板 512×384px）

3. **提示词格式**：每个素材包含 “中文提示词 + 英文提示词”，英文提示词适配 Midjourney/Leonardo.ai 等工具，括号内为可替换变量

## 二、场景类素材（Scene Assets）

### 1. 炼金铺场景 Tile 集（32×32px）



| 素材名称      | 中文提示词                                                 | 英文提示词                                                                                                                        |
| --------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 木质地板 Tile | 像素美术 Tile，炼金铺木质地板，暖棕色纹理，无缝拼接，32×32px，复古 16 位风格        | Pixel art tile, alchemy shop wooden floor, warm brown texture, seamless, 32x32px, retro 16-bit style                         |
| 石墙 Tile   | 像素美术 Tile，炼金铺石墙，浅灰色石块 + 棕褐色 mortar，无缝拼接，32×32px，带细微裂缝 | Pixel art tile, alchemy shop stone wall, light gray stones with brown mortar, seamless, 32x32px, subtle cracks               |
| 货架 Tile   | 像素美术 Tile，炼金铺货架，原木材质，带 3 层置物格，可摆放药剂瓶，32×32px          | Pixel art tile, alchemy shop shelf, solid wood material, 3-layer storage grid, potion bottle compatible, 32x32px             |
| 合成台 Tile  | 像素美术 Tile，炼金铺合成台，深色橡木台面，带金属凹槽，32×32px，中央有炼金阵纹路        | Pixel art tile, alchemy shop synthesis table, dark oak surface with metal grooves, 32x32px, alchemy circle pattern in center |

### 2. 场景装饰元素（64×64px）



| 素材名称 | 中文提示词                                            | 英文提示词                                                                                                                 |
| ---- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 魔法吊灯 | 像素美术，炼金铺魔法吊灯，黄铜支架 + 玻璃灯罩，暖黄色光芒，64×64px，带链条悬挂效果   | Pixel art, alchemy shop magic chandelier, brass frame with glass shade, warm yellow glow, 64x64px, hanging with chain |
| 药剂架  | 像素美术，多层药剂架，木质结构，摆放 6 个不同颜色药剂瓶（红 / 蓝 / 绿），64×64px | Pixel art, multi-layer potion rack, wooden structure, 6 potion bottles (red/blue/green), 64x64px                      |
| 门口地毯 | 像素美术，炼金铺门口地毯，棕红色底色，带金色炼金符号图案，64×64px，边缘有流苏       | Pixel art, alchemy shop entrance rug, reddish-brown base with golden alchemy symbols, 64x64px, tassels on edges       |

## 三、角色类素材（Character Assets）

### 1. 店主角色（64×64px，含动作帧）



| 素材名称      | 中文提示词                                              | 英文提示词                                                                                                                                            |
| --------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 店主 Idle 帧 | 像素美术角色，炼金铺店主，中年男性，棕色短发 + 围裙，手持搅拌棒，站立姿势，64×64px，暖色调 | Pixel art character, alchemy shop owner, middle-aged male, brown short hair with apron, holding stirring rod, standing pose, 64x64px, warm tones |
| 店主递物帧     | 像素美术角色，炼金铺店主，递出药剂瓶动作，身体前倾，手部抬起，64×64px，表情温和        | Pixel art character, alchemy shop owner, handing potion bottle, leaning forward, raised hand, 64x64px, gentle expression                         |
| 店主微笑帧     | 像素美术角色，炼金铺店主，微笑表情，眼睛微眯，嘴角上扬，64×64px，适配 Idle 动画循环   | Pixel art character, alchemy shop owner, smiling expression, squinted eyes, upturned mouth, 64x64px, idle animation compatible                   |

### 2. 顾客角色（64×64px，10 种形象）



| 素材名称  | 中文提示词                                        | 英文提示词                                                                                                                       |
| ----- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 老巫师顾客 | 像素美术角色，炼金铺顾客，老巫师，白色长胡子 + 紫色长袍，手持魔杖，64×64px   | Pixel art character, alchemy shop customer, old wizard, long white beard with purple robe, holding wand, 64x64px            |
| 铁匠顾客  | 像素美术角色，炼金铺顾客，铁匠，肌肉发达，黑色短发 + 皮围裙，带铁手套，64×64px | Pixel art character, alchemy shop customer, blacksmith, muscular, short black hair with leather apron, iron gloves, 64x64px |
| 农夫顾客  | 像素美术角色，炼金铺顾客，农夫，棕色头发 + 草帽，蓝色布衣，手持麦穗，64×64px  | Pixel art character, alchemy shop customer, farmer, brown hair with straw hat, blue cloth clothes, holding wheat, 64x64px   |
| 贵族顾客  | 像素美术角色，炼金铺顾客，贵族女士，金色卷发 + 粉色长裙，带珍珠项链，64×64px  | Pixel art character, alchemy shop customer, noble lady, golden curly hair with pink dress, pearl necklace, 64x64px          |

## 四、物品类素材（Item Assets）

### 1. 基础元素（64×64px，3 个角度）



| 素材名称    | 中文提示词                                     | 英文提示词                                                                                                           |
| ------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 水元素（正面） | 像素美术图标，水元素，蓝色水滴造型，带波纹效果，64×64px，透明背景，正面视角 | Pixel art icon, water element, blue water drop shape with ripples, 64x64px, transparent background, front view  |
| 火元素（侧面） | 像素美术图标，火元素，橙红色火焰，带火星粒子，64×64px，透明背景，侧面视角  | Pixel art icon, fire element, orange-red flame with sparks, 64x64px, transparent background, side view          |
| 土元素（俯视） | 像素美术图标，土元素，棕黄色石块，带泥土纹理，64×64px，透明背景，俯视视角  | Pixel art icon, earth element, yellow-brown stone with soil texture, 64x64px, transparent background, top view  |
| 气元素（正面） | 像素美术图标，气元素，淡蓝色气流，带漩涡效果，64×64px，透明背景，正面视角  | Pixel art icon, air element, light blue airflow with vortex effect, 64x64px, transparent background, front view |

### 2. 合成物品（64×64px，按等级分类）

#### （1）中级物品（30 种示例）



| 素材名称 | 中文提示词                                       | 英文提示词                                                                                                                        |
| ---- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 蒸汽   | 像素美术，炼金物品蒸汽，半透明白色云朵，带蓝色水滴与橙色火星，64×64px，透明背景 | Pixel art, alchemy item steam, translucent white cloud with blue droplets and orange sparks, 64x64px, transparent background |
| 齿轮   | 像素美术，炼金物品齿轮，黄铜材质，带齿纹，中心有圆孔，64×64px，金属光泽     | Pixel art, alchemy item gear, brass material with tooth pattern, circular hole in center, 64x64px, metallic sheen            |
| 泥浆   | 像素美术，炼金物品泥浆，棕褐色糊状，带小石块，64×64px，粘稠质感         | Pixel art, alchemy item mud, brownish 糊状 with small stones, 64x64px, sticky texture                                          |

#### （2）高级物品（26 种示例）



| 素材名称 | 中文提示词                                          | 英文提示词                                                                                                                       |
| ---- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 蒸汽机  | 像素美术，炼金物品蒸汽机，黄铜机身 + 黑色管道，蒸汽从管口冒出，64×64px，带齿轮细节 | Pixel art, alchemy item steam engine, brass body with black pipes, steam coming out of pipes, 64x64px, gear details         |
| 贤者之石 | 像素美术，炼金物品贤者之石，红色菱形宝石，带金色纹路与光芒，64×64px，透明背景     | Pixel art, alchemy item Philosopher's Stone, red diamond gem with golden patterns and glow, 64x64px, transparent background |
| 机械臂  | 像素美术，炼金物品机械臂，金属材质，带关节与抓手，64×64px，银灰色 + 黄铜点缀    | Pixel art, alchemy item mechanical arm, metal material with joints and gripper, 64x64px, silver-gray with brass accents     |

### 3. 合成特效（64×64px，动画帧）



| 素材名称    | 中文提示词                                         | 英文提示词                                                                                                                         |
| ------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 合成闪光帧 1 | 像素美术动画帧，炼金合成闪光，金色光芒 + 白色火花，64×64px，透明背景，第 1 帧 | Pixel art animation frame, alchemy synthesis sparkle, golden glow with white sparks, 64x64px, transparent background, frame 1 |
| 合成融合帧 3 | 像素美术动画帧，炼金物品融合，两种元素（水 + 火）半透明重叠，带渐变效果，64×64px | Pixel art animation frame, alchemy item fusion, two elements (water+fire) translucent overlap with gradient, 64x64px          |

## 五、UI 类素材（UI Assets）

### 1. 功能面板（指定尺寸）



| 素材名称            | 中文提示词                                                    | 英文提示词                                                                                                                                 |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 合成面板（512×384px） | 像素美术 UI 面板，炼金合成界面，棕木边框 + 玻璃插槽，2 个物品格子，512×384px，羊皮纸背景    | Pixel art UI panel, alchemy synthesis interface, brown wood frame with glass slots, 2 item grids, 512x384px, parchment background     |
| 订单面板（384×512px） | 像素美术 UI 面板，顾客订单列表，羊皮纸纹理，带顾客头像槽 + 物品需求槽，384×512px，羽毛笔装饰   | Pixel art UI panel, customer order list, parchment texture, customer avatar slot + item requirement slot, 384x512px, quill decoration |
| 图鉴面板（600×800px） | 像素美术 UI 面板，物品图鉴，棕木封面 + 金色花纹，分类标签（基础 / 中级 / 高级），600×800px | Pixel art UI panel, item encyclopedia, brown wood cover with golden patterns, category tabs (basic/intermediate/advanced), 600x800px  |

### 2. 按钮与图标（64×64px）



| 素材名称 | 中文提示词                                                    | 英文提示词                                                                                                                                     |
| ---- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 合成按钮 | 像素美术 UI 按钮，“合成” 功能，木质纹理 + 金色边框，中央有烧瓶图标，64×64px，按下状态有凹陷效果 | Pixel art UI button, "Synthesize" function, wooden texture with golden border, flask icon in center, 64x64px, pressed state with indent   |
| 交付按钮 | 像素美术 UI 按钮，“交付” 功能，木质纹理 + 金色边框，中央有金币图标，64×64px，满足条件时亮金色  | Pixel art UI button, "Deliver" function, wooden texture with golden border, coin icon in center, 64x64px, bright gold when conditions met |
| 图鉴按钮 | 像素美术 UI 图标，“图鉴” 功能，棕木底色，中央有打开的书本图标，64×64px，鼠标悬停时放大 10%   | Pixel art UI icon, "Encyclopedia" function, brown wood base, open book icon in center, 64x64px, 10% scale up on hover                     |

### 3. 信息显示元素（自定义尺寸）



| 素材名称             | 中文提示词                                            | 英文提示词                                                                                                                |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 金币图标（32×32px）    | 像素美术图标，金币，圆形，带花纹与数字槽，32×32px，金色光泽                | Pixel art icon, gold coin, circular with pattern and number slot, 32x32px, golden luster                             |
| 倒计时进度条（200×20px） | 像素美术进度条，订单倒计时，棕木边框，绿色填充（正常）/ 红色填充（超时警告），200×20px | Pixel art progress bar, order countdown, brown wood border, green fill (normal)/red fill (timeout warning), 200x20px |
| 物品数量标签（24×24px）  | 像素美术标签，物品数量，黑色数字 + 半透明背景，24×24px，适配物品图标右下角       | Pixel art label, item quantity, black number with translucent background, 24x24px, fits bottom-right of item icon    |

> （注：文档部分内容可能由 AI 生成）