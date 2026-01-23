# 克劳德 - AI卡牌叙事冒险 更新日志

**项目创建者**: 梦运

**维护者**: 梦运、白菜🥬

---

## 版本更新记录

### v0.2.7 (2026-01-20)

#### 🔧 API管理中心

##### 核心功能
- **统一API配置管理**：将主API和地图API的设置整合到一个管理中心
- **多API配置支持**：每个API配置都是完整独立的（格式、端点、密钥、模型、温度、Top P等所有参数）
- **配置复用机制**：地图API可选择复用主API配置或使用独立配置
- **导入/导出功能**：支持API配置的JSON导入/导出，可选择是否包含密钥

##### 数据结构
- **`GameState.settings.apiProfiles`** - API配置存储
  ```javascript
  {
    main: {
      name: '主API（叙事/对话）',
      enabled: true,
      apiFormat: 'openai',
      apiEndpoint: '',
      apiKey: '',
      modelName: 'gpt-4',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    },
    map: {
      name: '地图API',
      enabled: true,
      useMainApi: true,  // 复用主API配置
      apiFormat: 'openai',
      apiEndpoint: '',
      apiKey: '',
      modelName: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    }
  }
  ```

##### 界面改进
- **标签页切换**：主API和地图API使用标签页切换显示
- **复用开关**：地图API面板顶部有"复用主API配置"开关
- **状态指示**：显示当前API配置状态（已配置/未配置/复用中）
- **导入/导出按钮**：底部提供配置导入导出功能

##### 文件修改
- **`state.js`** - 添加 `apiProfiles` 数据结构
- **`index.html`** - 添加API管理中心界面（标签页、配置面板、导入导出按钮）
- **`settings.js`** - 添加API管理中心功能方法：
  - `initApiProfileTabs()` - 标签页切换
  - `initMapApiToggle()` - 地图API复用开关
  - `loadMapApiSettings()` / `saveMapApiSettings()` - 地图API设置读写
  - `initApiImportExport()` - 导入/导出功能
  - `exportApiConfig()` / `importApiConfig()` - 配置导入导出
- **`settings.css`** - 添加API管理中心样式
- **`mapApi.js`** - 更新 `getApiConfig()` 支持从 `apiProfiles` 读取配置

##### 设计特点
- ✅ 向后兼容：保留旧版配置字段用于迁移
- ✅ 灵活配置：每个API可独立配置或复用
- ✅ 安全导出：导出时可选择是否包含API密钥
- ✅ 三种模式：酒馆API、复用主API、独立配置

---

#### 🗺️ 动态地图系统

##### 核心功能
- **AI驱动的动态地图**：地图内容完全由AI根据叙事内容动态生成
- **SVG矢量渲染**：使用SVG进行地图可视化，支持缩放和平移
- **双向交互**：
  - 用户点击地图上的地点或NPC触发叙事
  - 叙事内容自动更新地图状态

##### 新增文件
- **`mapApi.js`** - 地图API模块
  - `MapAPI.initializeMap(context)` - 初始化地图
  - `MapAPI.updateMap(userInput, storyContent)` - 更新地图
  - `MapAPI.handleInteraction(type, targetId)` - 处理用户交互
  - `MapAPI.applyPatches(patches)` - 应用JSON Patch更新
  
- **`mapRenderer.js`** - SVG地图渲染器
  - `MapRenderer.init(containerId)` - 初始化渲染器
  - `MapRenderer.render()` - 渲染地图
  - `MapRenderer.renderLocation(location)` - 渲染地点节点
  - `MapRenderer.renderNPC(npc)` - 渲染NPC标记
  - `MapRenderer.renderPlayer()` - 渲染玩家位置
  - `MapRenderer.bindEvents()` - 绑定交互事件

- **`map.css`** - 地图样式文件（约400行）
  - 地图容器和SVG画布样式
  - 地点节点样式（不同类型不同颜色）
  - NPC标记样式
  - 玩家标记样式（带脉冲动画）
  - 路径连线样式
  - 工具提示和图例
  - 移动端适配

##### 数据结构
- **`GameVariables.map`** - 地图状态数据
  ```javascript
  {
    player: { locationId, x, y },
    locations: [{ id, name, type, x, y, discovered, description }],
    npcs: [{ id, name, locationId, x, y, attitude, description }],
    paths: [{ from, to, type, discovered }],
    viewport: { centerX, centerY, scale },
    initialized: false,
    lastUpdated: null
  }
  ```

##### 集成修改
- **`state.js`** - 添加 `GameVariables.map` 数据结构
- **`narrative.js`** - 添加 `updateMapAsync()` 方法，叙事更新后异步更新地图
- **`initialization.js`** - 添加 `initializeMapAsync()` 方法，游戏初始化时异步初始化地图
- **`index.html`** - 添加地图容器和脚本引用

##### 设计特点
- ✅ 异步初始化，不阻塞游戏主流程
- ✅ 使用JSON Patch (RFC 6902) 进行增量更新
- ✅ 完全由AI动态生成，无预设固定地图
- ✅ 支持地点发现、NPC移动、路径探索
- ✅ 响应式设计，适配移动端

---

### v0.2.6 (2026-01-15)

#### 🎨 主题系统扩展

##### 新增4个主题风格
- **🚀 科幻 (scifi)** - 赛博朋克霓虹风格
  - 深蓝黑色背景 (#0d1f3c)
  - 霓虹青色强调 (#00f5ff)
  - 科技感十足的视觉效果

- **👑 典雅 (elegant)** - 复古优雅紫金风格
  - 深紫色背景 (#1f1a2e)
  - 古典金色强调 (#d4af37)
  - 高贵典雅的视觉体验

- **🌸 粉嫩 (pink)** - 柔和粉色少女风格
  - 粉色背景 (#ffe4ec)
  - 粉色强调 (#ff6b9d)
  - 温柔可爱的视觉风格

- **🌿 青葱 (green)** - 清新自然绿色风格
  - 绿色背景 (#e0f2e8)
  - 绿色强调 (#4caf50)
  - 清新自然的视觉感受

##### 主题系统改进
- 每个主题包含完整的 CSS 变量覆盖
- 全局样式覆盖确保一致的视觉体验
- 主题预览颜色展示

#### ⚙️ API 设置增强

##### 新增 API 参数
- **Top P** - 核采样参数 (0-1)
- **Frequency Penalty** - 频率惩罚 (0-2)
- **Presence Penalty** - 存在惩罚 (0-2)

##### 参数输入方式优化
- 将滑块输入改为文字框输入
- 支持更精确的数值设置
- 每个参数都有详细的说明提示

---

### v0.2.5 (2026-01-14)

#### 🗂️ 卡牌数据架构模块化重构

##### 新架构结构
- **模块化目录结构**：将单文件 `cardData.js` 拆分为 `cards/` 目录下的多个模块
  ```
  cards/
  ├── index.js          # ES6模块入口（CardDatabase类）
  ├── meta.js           # 元数据定义（稀有度、类型配置）
  ├── tags.js           # 标签组定义
  ├── professions.js    # 16个职业定义
  └── collections/      # 卡牌集合
      ├── basic.js      # 基础卡牌
      ├── attack.js     # 攻击卡牌
      ├── defense.js    # 防御卡牌
      ├── skill.js      # 技能卡牌
      ├── power.js      # 能力卡牌
      ├── status.js     # 状态卡牌
      └── exclusive.js  # 16个职业专属卡牌
  ```

##### 兼容层实现
- **新增 `cardDataNew.js`**：兼容层文件，将模块化数据转换为全局可用格式
- **全局导出**：
  - `window.CardDatabase` - 主数据库对象
  - `window.CardMeta` - 元数据（稀有度、类型）
  - `window.TagGroups` - 标签组定义
  - `window.Professions` - 16个职业定义
  - `window.AllCards` - 所有卡牌数组（178张）

##### 核心 API
- `CardDatabase.getCardById(cardId)` - 根据ID获取卡牌
- `CardDatabase.getAllCards()` - 获取所有卡牌
- `CardDatabase.getCardsForProfession(professionId, rarity)` - 获取职业可用卡牌
- `CardDatabase.canProfessionUseCard(professionId, card)` - 判断职业能否使用卡牌
- `CardDatabase.getStarterDeck(professionId)` - 获取职业初始卡组
- `CardDatabase.getCardsByRarity(rarity)` - 按稀有度获取卡牌
- `CardDatabase.getCardsByType(type)` - 按类型获取卡牌
- `CardDatabase.registerCollection(name, cards)` - 注册新卡牌集合

##### 卡牌数量统计
- 总计 **178 张卡牌**
- 基础卡牌：4张
- 攻击卡牌：15张
- 防御卡牌：18张
- 技能卡牌：42张
- 能力卡牌：45张
- 状态卡牌：24张
- 职业专属卡牌：30张

##### 优势
- ✅ 便于单独修改某类卡牌
- ✅ 便于添加新职业或新卡牌集合
- ✅ 代码结构清晰，易于维护
- ✅ 支持未来迁移到 ES6 模块系统

---

### v0.2.4 (2026-01-12)

#### 🃏 卡牌系统重构

##### 新增卡牌数据库 (`cardData.js`)
- **双向绑定 + 继承系统**：灵活的职业-卡牌关联机制
- **标签组系统**：定义可被职业继承的标签集合
  - 物理系 (physical)、魔法系 (magic)、元素系 (fire/ice/lightning)
  - 暗影系 (shadow)、神圣系 (holy)、自然系 (nature)
  - 隐匿系 (stealth)、狂暴系 (rage)、防御系 (defense)
- **16 个职业定义**：
  - 物理职业：战士、野蛮人、剑圣
  - 敏捷职业：盗贼、游侠、武僧
  - 魔法职业：魔法师、术士、巫师
  - 神圣职业：牧师、圣骑士
  - 自然职业：德鲁伊、萨满
  - 混合职业：魔剑士、暗黑骑士、战斗法师
- **100+ 张卡牌**：按功能分类存储
  - 攻击牌：单体/多段/群体/吸血/条件/毒素
  - 防御牌：格挡/反伤/闪避
  - 技能牌：抽牌/能量/治疗/毒素/工具
  - 能力牌：增益/减益/被动
  - 状态牌：诅咒/负面效果
  - 职业专属牌

##### 卡牌系统集成 (`card.js`)
- 新增 `matchProfession()` 方法：智能匹配职业名称到职业ID
- 修改 `generateInitialDeck()`：优先从 CardDatabase 获取职业初始卡组
- 修改 `generateClassCards()`：从 CardDatabase 获取职业特殊卡牌
- 保留回退逻辑：CardDatabase 不可用时使用原有默认卡组

##### 稀有度系统
- basic (基础) - 不掉落
- common (普通) - 55% 掉落率
- uncommon (稀有) - 30% 掉落率
- rare (史诗) - 12% 掉落率
- legendary (传奇) - 3% 掉落率

---

### v0.2.3 (2026-01-10)

#### 🏗️ 代码架构优化
- **模态框动态化**：将所有模态框 HTML 从 `index.html` 迁移到独立的 `modals.js` 文件
  - 新增 `ModalsManager` 对象，统一管理 12 个模态框的动态创建
  - `index.html` 从约 2000 行精简到约 1200 行（减少约 40%）
  - 页面加载时自动初始化，功能与之前完全一致

---

### v0.2.2 (2026-01-10)

#### 🎨 主题系统完善

- 主题切换现在影响所有界面元素（背景、面板、按钮、输入框等）
- 按钮阴影光颜色随主题变化

---

### v0.2.1 (2026-01-10)

#### ✨ 新增功能

##### 🎨 界面设置与主题切换

- 在游戏设置页面新增"界面设置"区域
- 支持三种主题风格：
  - 🏛️ **羊皮纸** (默认) - 经典的羊皮纸风格
  - 🌙 **暗黑** - 深色护眼主题
  - ☀️ **明亮** - 清新明亮主题
- 主题设置自动保存，刷新页面后保持用户选择

##### 📜 存档管理界面美化

- 存档列表区域使用自定义滚动条样式

---

*最后更新: 2026-01-20*
