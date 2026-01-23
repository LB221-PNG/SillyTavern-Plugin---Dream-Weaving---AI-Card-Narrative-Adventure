/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 初始化系统 - 角色与世界初始化
 * ============================================================ */

/**
 * 初始化系统 - 处理游戏开始时的AI初始化
 */
const InitializationSystem = {
  isInitializing: false,

  /**
   * 构建初始化提示词
   * @returns {string} - 完整的初始化提示词
   */
  buildInitializationPrompt() {
    const char = GameState.character;
    const world = GameState.world;

    // 角色信息汇总
    const characterInfo = `
# 角色信息
- 姓名: ${char.name || '未命名'}
- 性别: ${char.gender === 'male' ? '男' : char.gender === 'female' ? '女' : '其他'}
- 年龄: ${char.age || 24}
- 种族: ${getRaceLabel(char.race)}
- 职业: ${char.class || '冒险者'}
- 外貌: ${char.appearance || '普通外表'}
- 背景故事: ${char.background || '无特殊背景'}
`;

    // 世界信息汇总
    let worldInfo = '\n# 世界设定\n';
    if (world.prompt) {
      worldInfo += world.prompt + '\n';
    } else {
      worldInfo += '一个充满魔法与冒险的奇幻世界。\n';
    }

    // 世界书条目
    if (world.entries && world.entries.length > 0) {
      worldInfo += '\n## 世界书条目\n';
      world.entries.slice(0, 15).forEach(entry => {
        worldInfo += `- ${entry.name || entry.key}: ${entry.content?.substring(0, 200) || ''}\n`;
      });
    }

    // 初始化规则提示词
    const initializationRules = `
# 初始化要求
你需要根据上述角色设定和世界信息，为这个角色创建完整的初始状态。在输出剧情部分后，必须输出初始化的变量数据。

## 需要初始化的内容

### 1. 基础属性初始化
根据角色设定，初始化以下内容：
- 剧情设定：当前的时间、地点、天气
- 角色设定：职业描述、永久性状态、临时状态
- 服装：根据角色背景，详细描述全身穿着（头部、颈部、手部、上身、下身、内衣、腿部、脚部）
- 持有物品：根据背景合理分配的非战斗物品
- HP和Lust上限：默认为100，可根据角色特性调整
  - 身强体壮：适当增加HP上限
  - 身体敏感：适当减少Lust上限
- 初始等级：根据角色的超自然力量动态生成（普通人1级，有一定能力2-3级，强大能力4-5级）

### 2. 卡牌初始化
生成一套具有一定体系的初始卡组：
- 必须包含5张基础防御卡和5张基础攻击卡
- 必须包含1-3张不同的特殊卡
- 总卡牌数量（quantity总和）不少于10张
- 基础卡牌可以有多张（用quantity表示），强力卡牌一般只有1张
- 卡牌应该体现角色的战斗风格和能力特点
- 避免只有单一效果的无聊卡牌，尽量有复合效果

卡牌格式示例：
{
  "name": "卡牌名称",
  "type": "attack/skill/power",
  "cost": 1,
  "description": "效果描述",
  "rarity": "basic/common/uncommon/rare",
  "quantity": 5,
  "effects": [
    { "type": "damage", "value": 6 },
    { "type": "block", "value": 3 }
  ]
}

### 3. 道具遗物初始化
- 生成1-2个能够代表角色特性的遗物
- 遗物要能和卡组配合，或提供通用增强
- 根据剧情生成初始道具（可选）

遗物格式示例：
{
  "name": "遗物名称",
  "description": "效果描述",
  "effect": { "type": "效果类型", "value": 数值 }
}

### 4. 阵营和倾向初始化
- 生成角色的九宫格道德阵营（守序善良/中立善良/混沌善良/守序中立/绝对中立/混沌中立/守序邪恶/中立邪恶/混沌邪恶）
- 如有必要，生成与角色相关的势力关系

### 5. 状态效果定义初始化
如果卡牌、道具、遗物涉及到特殊状态效果（buff/debuff），需要在此处注册：
{
  "id": "状态ID",
  "name": "状态名称",
  "description": "效果描述",
  "type": "buff/debuff",
  "stackable": true/false
}

### 6. NPC关系初始化
如果开场剧情中出现重要NPC，需要初始化该NPC的信息：
{
  "id": "npc_id",
  "name": "NPC名称",
  "relationship": "关系描述",
  "affection": 0,
  "description": "外貌和性格描述"
}

# 输出格式要求
你必须按照以下格式输出：

<Story>
在这里写开场剧情，描述角色醒来或开始冒险的场景。
剧情应该：
1. 符合世界设定
2. 自然引入角色的背景
3. 为接下来的冒险做铺垫
4. 控制在200-400字
</Story>

<InitializeData>
{
  "status": {
    "time": "具体日期和时间",
    "location_weather": "位置名称（区域描述） 天气",
    "profession": "职业描述，包含特殊能力",
    "permanent_status": [
      { "name": "状态名", "description": "描述" }
    ],
    "temporary_status": [],
    "clothing": {
      "head": "头部装备",
      "neck": "颈部装备",
      "hands": "手部装备",
      "upper_body": "上身服装",
      "lower_body": "下身服装",
      "underwear": "内衣",
      "legs": "腿部装备",
      "feet": "脚部装备"
    },
    "inventory": ["物品1", "物品2"]
  },
  "battle": {
    "core": {
      "hp": 100,
      "max_hp": 100,
      "lust": 0,
      "max_lust": 100
    },
    "cards": [
      {
        "name": "卡牌名",
        "type": "attack",
        "cost": 1,
        "description": "描述",
        "rarity": "basic",
        "quantity": 5,
        "effects": [{ "type": "damage", "value": 6 }]
      }
    ],
    "artifacts": [
      {
        "name": "遗物名",
        "description": "描述",
        "effect": { "type": "类型", "value": 1 }
      }
    ],
    "items": [],
    "statuses": [],
    "level": 1,
    "exp": 0
  },
  "factions": {
    "player_alignment": "阵营",
    "relations": []
  },
  "npcs": {}
}
</InitializeData>
`;

    return characterInfo + worldInfo + initializationRules;
  },

  /**
   * 执行初始化
   * @returns {Promise<Object>} - 初始化结果
   */
  async performInitialization() {
    if (this.isInitializing) {
      return { success: false, message: '正在初始化中...' };
    }

    this.isInitializing = true;

    // 检查是否使用酒馆API
    const useTavernApi = GameState.settings.useTavernApi;
    
    // 检查API配置（如果不使用酒馆API）
    if (!useTavernApi && (!GameState.settings.apiKey || !GameState.settings.apiEndpoint)) {
      this.isInitializing = false;
      // 使用默认初始化
      return this.performDefaultInitialization();
    }

    try {
      // 显示加载提示
      if (typeof GameUI !== 'undefined') {
        GameUI.showProcessingIndicator('正在生成角色初始状态...');
      }

      const systemPrompt = this.buildInitializationPrompt();
      let aiResponse = '';

      // 使用统一的 callLLMApi 函数，它会自动处理酒馆API和自定义API
      const response = await callLLMApi({
        endpoint: GameState.settings.apiEndpoint,
        apiKey: GameState.settings.apiKey,
        model: GameState.settings.modelName,
        messages: [
          {
            role: 'system',
            content: '你是一个奇幻冒险游戏的初始化系统。你需要根据玩家的角色设定和世界设定，生成合适的初始状态数据和开场剧情。严格按照要求的JSON格式输出数据。',
          },
          { role: 'user', content: systemPrompt },
        ],
        temperature: GameState.settings.temperature || 0.7,
        maxTokens: GameState.settings.maxTokens || 4096,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`API请求失败: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // 兼容 Anthropic 和 OpenAI 格式
      if (data.content && Array.isArray(data.content)) {
        aiResponse = data.content.map(c => c.text).join('');
      } else if (data.choices && data.choices[0] && data.choices[0].message) {
        aiResponse = data.choices[0].message.content;
      } else if (typeof data === 'string') {
        // 酒馆API可能直接返回字符串
        aiResponse = data;
      } else {
        // 尝试其他可能的格式
        aiResponse = data.content || data.generated_text || JSON.stringify(data);
      }

      // 解析AI响应
      const result = this.parseInitializationResponse(aiResponse);

      if (result.success) {
        // 应用初始化数据
        this.applyInitializationData(result.data);

        // 初始化动态地图（异步执行，不阻塞主流程）
        this.initializeMapAsync(result.story);

        // 返回剧情内容
        return {
          success: true,
          story: result.story,
          data: result.data,
        };
      } else {
        console.error('解析初始化数据失败:', result.error);
        return this.performDefaultInitialization();
      }
    } catch (error) {
      console.error('初始化失败:', error);
      return this.performDefaultInitialization();
    } finally {
      this.isInitializing = false;
      if (typeof GameUI !== 'undefined') {
        GameUI.hideProcessingIndicator();
      }
    }
  },

  /**
   * 解析AI的初始化响应
   * @param {string} response - AI响应文本
   * @returns {Object} - 解析结果
   */
  parseInitializationResponse(response) {
    try {
      // 提取Story部分
      const storyMatch = response.match(/<Story>([\s\S]*?)<\/Story>/);
      const story = storyMatch ? storyMatch[1].trim() : '';

      // 提取InitializeData部分
      const dataMatch = response.match(/<InitializeData>([\s\S]*?)<\/InitializeData>/);
      if (!dataMatch) {
        return { success: false, error: '未找到初始化数据' };
      }

      const jsonStr = dataMatch[1].trim();
      const data = JSON.parse(jsonStr);

      return {
        success: true,
        story: story,
        data: data,
      };
    } catch (error) {
      console.error('解析初始化响应失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 应用初始化数据到游戏状态
   * @param {Object} data - 初始化数据
   */
  applyInitializationData(data) {
    // 应用状态数据
    if (data.status) {
      if (data.status.time) GameVariables.status.time = data.status.time;
      if (data.status.location_weather) GameVariables.status.location_weather = data.status.location_weather;
      if (data.status.profession) GameVariables.status.profession = data.status.profession;
      if (data.status.permanent_status) GameVariables.status.permanent_status = data.status.permanent_status;
      if (data.status.temporary_status) GameVariables.status.temporary_status = data.status.temporary_status;

      // 应用服装
      if (data.status.clothing) {
        const clothing = data.status.clothing;
        if (clothing.head) GameVariables.status.clothing.head = clothing.head;
        if (clothing.neck) GameVariables.status.clothing.neck = clothing.neck;
        if (clothing.hands) GameVariables.status.clothing.hands = clothing.hands;
        if (clothing.upper_body) GameVariables.status.clothing.upper_body = clothing.upper_body;
        if (clothing.lower_body) GameVariables.status.clothing.lower_body = clothing.lower_body;
        if (clothing.underwear) GameVariables.status.clothing.underwear = clothing.underwear;
        if (clothing.legs) GameVariables.status.clothing.legs = clothing.legs;
        if (clothing.feet) GameVariables.status.clothing.feet = clothing.feet;
      }

      if (data.status.inventory) GameVariables.status.inventory = data.status.inventory;
    }

    // 应用战斗数据
    if (data.battle) {
      if (data.battle.core) {
        if (data.battle.core.hp !== undefined) GameVariables.battle.core.hp = data.battle.core.hp;
        if (data.battle.core.max_hp !== undefined) GameVariables.battle.core.max_hp = data.battle.core.max_hp;
        if (data.battle.core.lust !== undefined) GameVariables.battle.core.lust = data.battle.core.lust;
        if (data.battle.core.max_lust !== undefined) GameVariables.battle.core.max_lust = data.battle.core.max_lust;

        // 同步到GameState.character
        GameState.character.hp = data.battle.core.hp;
        GameState.character.maxHp = data.battle.core.max_hp;
      }

      if (data.battle.level !== undefined) GameVariables.battle.level = data.battle.level;
      if (data.battle.exp !== undefined) GameVariables.battle.exp = data.battle.exp;

      // 应用卡牌
      if (data.battle.cards && Array.isArray(data.battle.cards)) {
        GameVariables.battle.cards = data.battle.cards;
        // 生成实际的卡组
        this.generateDeckFromCards(data.battle.cards);
      }

      // 应用遗物
      if (data.battle.artifacts) GameVariables.battle.artifacts = data.battle.artifacts;

      // 应用道具
      if (data.battle.items) GameVariables.battle.items = data.battle.items;

      // 应用状态效果定义
      if (data.battle.statuses) GameVariables.battle.statuses = data.battle.statuses;
    }

    // 应用阵营数据
    if (data.factions) {
      if (data.factions.player_alignment) GameVariables.factions.player_alignment = data.factions.player_alignment;
      if (data.factions.relations) GameVariables.factions.relations = data.factions.relations;
    }

    // 应用NPC数据
    if (data.npcs) {
      GameVariables.npcs = data.npcs;
    }

    console.log('初始化数据已应用:', data);
  },

  /**
   * 从卡牌数据生成实际卡组
   * @param {Array} cardsData - 卡牌数据数组
   */
  generateDeckFromCards(cardsData) {
    const deck = [];

    cardsData.forEach(cardData => {
      const quantity = cardData.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        const card = new Card({
          name: cardData.name,
          type: cardData.type || CardTypes.ATTACK,
          cost: cardData.cost !== undefined ? cardData.cost : 1,
          description: cardData.description || '',
          rarity: cardData.rarity || CardRarity.BASIC,
          effects: cardData.effects || [],
          exhaust: cardData.exhaust || false,
          ethereal: cardData.ethereal || false,
          innate: cardData.innate || false,
        });
        deck.push(card);
      }
    });

    // 存储到战斗状态
    BattleState.deck = deck;

    console.log(`已生成卡组，共 ${deck.length} 张卡牌`);
  },

  /**
   * 执行默认初始化（无AI时使用）
   * @returns {Object} - 初始化结果
   */
  performDefaultInitialization() {
    const char = GameState.character;

    // 设置默认状态
    GameVariables.status.time = '1月1日，周一，清晨，08:00';
    GameVariables.status.location_weather = '未知之地（起点） ☁阴天';
    GameVariables.status.profession = `${char.class || '冒险者'}，初出茅庐`;

    // 根据职业设置HP
    const classLower = (char.class || '').toLowerCase();
    if (
      classLower.includes('剑') ||
      classLower.includes('战') ||
      classLower.includes('士') ||
      classLower.includes('骑')
    ) {
      GameVariables.battle.core.hp = 100;
      GameVariables.battle.core.max_hp = 100;
    } else if (
      classLower.includes('法') ||
      classLower.includes('魔') ||
      classLower.includes('术') ||
      classLower.includes('巫')
    ) {
      GameVariables.battle.core.hp = 70;
      GameVariables.battle.core.max_hp = 70;
    } else {
      GameVariables.battle.core.hp = 80;
      GameVariables.battle.core.max_hp = 80;
    }

    GameState.character.hp = GameVariables.battle.core.hp;
    GameState.character.maxHp = GameVariables.battle.core.max_hp;

    // 生成默认卡组
    const deck = CardSystem.generateInitialDeck(char);
    BattleState.deck = deck;

    // 生成默认遗物
    GameVariables.battle.artifacts = [
      {
        name: '旅人护符',
        description: '一枚普通的护符，据说能带来好运。战斗开始时获得1点格挡。',
        effect: { type: 'start_battle_block', value: 1 },
      },
    ];

    // 生成开场故事
    const story = this.generateDefaultStory();

    // 初始化动态地图（异步执行，不阻塞主流程）
    this.initializeMapAsync(story);

    return {
      success: true,
      story: story,
      data: null,
    };
  },

  /**
   * 生成默认开场故事
   * @returns {string} - 开场故事
   */
  generateDefaultStory() {
    const char = GameState.character;
    const world = GameState.world;

    let story = `${char.name || '冒险者'}，`;

    if (world.prompt) {
      story += `你睁开眼睛，发现自己身处一个陌生的世界——${world.prompt.substring(0, 100)}...\n\n`;
    } else {
      story += '你从沉睡中醒来，周围弥漫着淡淡的雾气...\n\n';
    }

    if (char.background) {
      story += `作为一名${char.class || '冒险者'}，你的过去仍历历在目：${char.background.substring(0, 100)}...\n\n`;
    }

    story += '命运的齿轮开始转动，你的冒险，从这里开始。';

    return story;
  },

  /**
   * 异步初始化动态地图
   * @param {string} openingNarrative - 开场叙事内容
   */
  async initializeMapAsync(openingNarrative) {
    // 检查 MapAPI 是否可用
    if (typeof MapAPI === 'undefined') {
      console.log('MapAPI 未加载，跳过地图初始化');
      return;
    }

    // 检查 MapRenderer 是否可用
    if (typeof MapRenderer === 'undefined') {
      console.log('MapRenderer 未加载，跳过地图初始化');
      return;
    }

    try {
      // 初始化地图渲染器
      MapRenderer.init('map-container');

      // 构建初始化上下文
      const context = {
        narrative: openingNarrative,
        location: GameVariables.status.location_weather,
        worldPrompt: GameState.world.prompt || '',
        character: {
          name: GameState.character.name,
          class: GameState.character.class,
        },
      };

      // 调用 MapAPI 初始化地图
      await MapAPI.initializeMap(context);

      console.log('动态地图初始化完成');
    } catch (error) {
      console.warn('动态地图初始化失败:', error);
      // 地图初始化失败不影响游戏主流程
    }
  },
};

// 导出
window.InitializationSystem = InitializationSystem;
