# AI 叙事卡牌冒险 (AI Narrative Card Adventure)

**项目创建者**: 梦运
**项目维护者**: 梦运、白菜🥬

这是一个结合了 AI 动态叙事与卡牌战斗策略的冒险游戏前端。它可以作为独立的 Web 应用运行，也针对 SillyTavern (酒馆) 环境进行了深度优化。

## ✨ 核心特性

*   **AI 驱动叙事**：利用 LLM (大语言模型) 实时生成剧情、世界观和 NPC 互动。
*   **卡牌战斗系统**：构建你的卡组，使用攻击、防御和特殊技能卡牌与敌人战斗。
*   **角色扮演**：自定义角色背景、种族和职业，AI 会根据设定生成独特的冒险体验。
*   **动态世界**：世界环境、天气和遭遇都会随剧情动态变化。
*   **状态管理**：可视化的 HP、状态栏和物品栏。

## 🚀 最新更新 (v1.1)

本次更新重点优化了 API 连接稳定性和多模型支持：

*   **全面支持 Anthropic (Claude)**：
    *   底层 API 调用逻辑重构，原生支持 Anthropic API 格式。
    *   自动处理 `x-api-key` 和 `anthropic-version` 请求头。
    *   兼容解析 Claude 模型的响应格式。
*   **SillyTavern (酒馆) 深度集成**：
    *   修复了 API 连接测试中忽略酒馆模式的 Bug。
    *   初始化、剧情生成和世界扩展现在都能完美调用酒馆的全局 `generate` 接口。
*   **统一 API 架构**：
    *   引入 `callLLMApi` 统一处理所有外部请求。
    *   增强了错误处理和响应验证机制。

## 📖 使用指南

### 方式一：在 SillyTavern (酒馆) 中使用

本项目设计为可以直接在 SillyTavern 环境中运行，利用酒馆的 API 转发功能。

1.  确保你的 SillyTavern 已正确安装并配置好后端 API。
2.  将本项目文件放入 SillyTavern 的扩展目录或作为静态资源加载。
3.  在设置中勾选 **"使用酒馆API"**。
4.  系统会自动检测酒馆环境，并直接使用酒馆配置的模型进行生成，无需额外填写 API Key。

### 方式二：独立运行

你也可以直接在浏览器中打开 `index.html` 运行游戏。

1.  打开 `index.html`。
2.  进入 **设置** 页面。
3.  取消勾选 "使用酒馆API"。
4.  填写你的 API Endpoint (例如 `https://api.openai.com/v1` 或 `https://api.openai.com/v1/chat/completions`)。系统会自动识别并补全路径。
5.  填写 API Key。
6.  选择模型并保存。

## 🛠️ 技术细节

*   **前端框架**：原生 JavaScript (ES6+), HTML5, CSS3。无繁重依赖。
*   **API 兼容性**：
    *   OpenAI 格式 (GPT-3.5, GPT-4 等)
    *   Anthropic 格式 (Claude 3, Claude 3.5 Sonnet 等)
    *   SillyTavern 内部接口
*   **数据持久化**：使用 LocalStorage 保存游戏进度和设置。

## 📝 插件/扩展介绍

本项目包含以下核心模块：

*   **InitializationSystem**: 负责游戏开局的角色生成和世界初始化。
*   **NarrativeSystem**: 处理剧情推进、对话交互和流式文本生成。
*   **BattleSystem**: 独立的回合制卡牌战斗逻辑。
*   **WorldSystem**: 管理世界观条目和动态环境描述。
*   **CardSystem**: 卡牌管理、抽牌堆/弃牌堆逻辑。

## 🃏 卡牌系统架构

### 目录结构

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

### 全局 API

```javascript
// 主数据库对象
window.CardDatabase

// 核心方法
CardDatabase.getCardById(cardId)                      // 根据ID获取卡牌
CardDatabase.getAllCards()                            // 获取所有卡牌（178张）
CardDatabase.getCardsForProfession(professionId)      // 获取职业可用卡牌
CardDatabase.canProfessionUseCard(professionId, card) // 判断职业能否使用卡牌
CardDatabase.getStarterDeck(professionId)             // 获取职业初始卡组
CardDatabase.getCardsByRarity(rarity)                 // 按稀有度获取卡牌
CardDatabase.getCardsByType(type)                     // 按类型获取卡牌
```

### 职业系统

支持 16 个职业，通过标签继承系统实现卡牌限制：

| 类型 | 职业 |
|------|------|
| 物理职业 | 战士、野蛮人、剑圣 |
| 敏捷职业 | 盗贼、游侠、武僧 |
| 魔法职业 | 魔法师、术士、巫师 |
| 神圣职业 | 牧师、圣骑士 |
| 自然职业 | 德鲁伊、萨满 |
| 混合职业 | 魔剑士、暗黑骑士、战斗法师 |

### 稀有度系统

| 稀有度 | 名称 | 掉落率 |
|--------|------|--------|
| basic | 基础 | 不掉落 |
| common | 普通 | 55% |
| uncommon | 稀有 | 30% |
| rare | 史诗 | 12% |
| legendary | 传奇 | 3% |

---

## 📜 许可证 (License)

<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">
  <img alt="知识共享许可协议" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" />
</a>

本项目采用 **CC BY-NC 4.0**（知识共享 署名-非商业性使用 4.0 国际）许可协议。

### 您可以自由地：

- **共享** — 在任何媒介以任何形式复制、发行本作品
- **演绎** — 修改、转换或以本作品为基础进行创作

### 惟须遵守下列条件：

- **署名** — 您必须给出适当的署名，提供指向本许可协议的链接，同时标明是否对原始作品作了修改
- **非商业性使用** — 您不得将本作品用于商业目的

### 完整许可证

详细条款请参阅：[CC BY-NC 4.0 完整协议](https://creativecommons.org/licenses/by-nc/4.0/legalcode.zh-Hans)

```
Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)

Copyright (c) 2024 梦运

本作品采用知识共享 署名-非商业性使用 4.0 国际许可协议进行许可。
This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.

https://creativecommons.org/licenses/by-nc/4.0/
```

**简单来说：**
- ✅ 可以自由使用、修改、分发本项目
- ✅ 可以用于个人学习、研究、非商业项目
- ❌ **不可用于商业目的**
- ⚠️ 需要注明原作者（梦运）并提供许可证链接

---
*Created for AI storytelling enthusiasts.*
