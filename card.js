/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 卡牌系统
 * ============================================================ */

/**
 * 卡牌类型枚举
 */
const CardTypes = {
  ATTACK: 'attack',
  SKILL: 'skill',
  POWER: 'power',
  STATUS: 'status',
  CURSE: 'curse',
};

/**
 * 卡牌稀有度枚举
 */
const CardRarity = {
  MEDIOCRE: 'mediocre', // 平庸
  COMMON: 'common',     // 普通
  QUALITY: 'quality',   // 优质
  EXCELLENT: 'excellent', // 精良
  EPIC: 'epic',         // 史诗
  LEGENDARY: 'legendary', // 传奇
  DARK_GOLD: 'dark_gold', // 暗金
};

/**
 * 卡牌类
 */
class Card {
  constructor(config) {
    this.id = config.id || `card_${generateId()}`;
    this.name = config.name || '未命名卡牌';
    this.type = config.type || CardTypes.ATTACK;
    this.cost = config.cost !== undefined ? config.cost : 1;
    this.description = config.description || '';
    this.rarity = config.rarity || CardRarity.COMMON;
    this.effects = config.effects || [];
    this.exhaust = config.exhaust || false;
    this.ethereal = config.ethereal || false;
    this.innate = config.innate || false;
    this.upgraded = config.upgraded || false;
  }

  /**
   * 播放卡牌
   * @param {Object} battleState - 战斗状态
   * @param {Object} target - 目标（通常是敌人）
   * @returns {Object} - 执行结果
   */
  play(battleState, target) {
    if (battleState.energy < this.cost) {
      return { success: false, message: '能量不足' };
    }

    battleState.energy -= this.cost;
    const results = [];

    for (const effect of this.effects) {
      const result = this.executeEffect(effect, battleState, target);
      results.push(result);
    }

    return { success: true, results };
  }

  /**
   * 执行效果
   * @param {Object} effect - 效果配置
   * @param {Object} battleState - 战斗状态
   * @param {Object} target - 目标
   * @returns {Object} - 效果结果
   */
  executeEffect(effect, battleState, target) {
    switch (effect.type) {
      case 'damage': {
        const damage = effect.value;
        if (target && target.hp !== undefined) {
          const actualDamage = Math.max(0, damage - (target.block || 0));
          target.hp = Math.max(0, target.hp - actualDamage);
          if (target.block) {
            target.block = Math.max(0, target.block - damage);
          }

          // 同步更新GameVariables.battle.enemy（MVU系统）
          if (typeof GameVariables !== 'undefined' && GameVariables.battle.enemy) {
            GameVariables.battle.enemy.hp = target.hp;
            if (GameVariables.battle.enemy.block !== undefined) {
              GameVariables.battle.enemy.block = target.block;
            }

            // 触发变更事件
            if (typeof VariableChangeEmitter !== 'undefined') {
              VariableChangeEmitter.emit('/battle/enemy/hp', target.hp, target.hp + actualDamage);
            }
          }

          return { type: 'damage', value: actualDamage };
        }
        break;
      }

      case 'block':
        battleState.block += effect.value;
        return { type: 'block', value: effect.value };

      case 'draw':
        for (let i = 0; i < effect.value; i++) {
          CardSystem.drawCard(battleState);
        }
        return { type: 'draw', value: effect.value };

      case 'energy':
        battleState.energy += effect.value;
        return { type: 'energy', value: effect.value };

      case 'heal': {
        const healAmount = Math.min(effect.value, battleState.playerMaxHp - battleState.playerHp);
        battleState.playerHp += healAmount;

        // 同步更新GameVariables.battle.core.hp（MVU系统）
        if (typeof GameVariables !== 'undefined') {
          GameVariables.battle.core.hp = battleState.playerHp;

          // 触发变更事件
          if (typeof VariableChangeEmitter !== 'undefined') {
            VariableChangeEmitter.emit('/battle/core/hp', battleState.playerHp, battleState.playerHp - healAmount);
          }
        }

        return { type: 'heal', value: healAmount };
      }

      case 'status':
        if (target && target.statuses) {
          if (!target.statuses[effect.status]) {
            target.statuses[effect.status] = 0;
          }
          target.statuses[effect.status] += effect.value;
        }
        return { type: 'status', status: effect.status, value: effect.value };

      default:
        return { type: 'unknown' };
    }
  }

  /**
   * 生成卡牌HTML（完整版）
   * @param {number} index - 卡牌索引
   * @returns {string} - HTML字符串
   */
  toHTML(index) {
    const typeClass = this.type;
    const rarityClass = this.rarity;
    return `
            <div class="game-card ${typeClass} ${rarityClass}" data-index="${index}" data-id="${this.id}">
                <div class="card-cost">${this.cost}</div>
                <div class="card-name">${this.name}</div>
                <div class="card-type">${this.getTypeLabel()} · ${this.getRarityLabel()}</div>
                <div class="card-desc">${this.description}</div>
            </div>
        `;
  }

  /**
   * 生成卡牌HTML（迷你版）
   * @param {number} index - 卡牌索引
   * @returns {string} - HTML字符串
   */
  toMiniHTML(index) {
    const typeClass = this.type;
    const rarityClass = this.rarity;
    return `
            <div class="deck-card-mini ${typeClass} ${rarityClass}" data-index="${index}" data-id="${this.id}">
                <div class="card-cost">${this.cost}</div>
                <div class="card-name">${this.name}</div>
            </div>
        `;
  }

  /**
   * 获取卡牌类型标签
   * @returns {string} - 类型中文名称
   */
  getTypeLabel() {
    const labels = {
      [CardTypes.ATTACK]: '攻击',
      [CardTypes.SKILL]: '技能',
      [CardTypes.POWER]: '能力',
      [CardTypes.STATUS]: '状态',
      [CardTypes.CURSE]: '诅咒',
    };
    return labels[this.type] || '未知';
  }

  /**
   * 获取卡牌稀有度标签
   * @returns {string} - 稀有度中文名称
   */
  getRarityLabel() {
    const labels = {
      [CardRarity.MEDIOCRE]: '平庸',
      [CardRarity.COMMON]: '普通',
      [CardRarity.QUALITY]: '优质',
      [CardRarity.EXCELLENT]: '精良',
      [CardRarity.EPIC]: '史诗',
      [CardRarity.LEGENDARY]: '传奇',
      [CardRarity.DARK_GOLD]: '暗金',
    };
    return labels[this.rarity] || '未知';
  }

  /**
   * 转换为存档数据
   * @returns {Object} - 存档数据对象
   */
  toSaveData() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      cost: this.cost,
      description: this.description,
      rarity: this.rarity,
      effects: this.effects,
      exhaust: this.exhaust,
      ethereal: this.ethereal,
      innate: this.innate,
      upgraded: this.upgraded,
    };
  }

  /**
   * 从存档数据创建卡牌
   * @param {Object} data - 存档数据
   * @returns {Card} - 卡牌实例
   */
  static fromSaveData(data) {
    return new Card(data);
  }
}

/**
 * 卡牌系统
 */
const CardSystem = {
  /**
   * 生成初始卡组
   * @param {Object} character - 角色信息
   * @returns {Array<Card>} - 卡组数组
   */
  generateInitialDeck(character) {
    const deck = [];

    // 尝试从 CardDatabase 获取职业初始卡组
    if (typeof CardDatabase !== 'undefined' && character.class) {
      const professionId = this.matchProfession(character.class);
      if (professionId) {
        const starterDeck = CardDatabase.getStarterDeck(professionId);
        if (starterDeck && starterDeck.length > 0) {
          starterDeck.forEach(cardData => {
            deck.push(new Card({
              id: cardData.id,
              name: cardData.name,
              type: cardData.type,
              cost: cardData.cost,
              description: cardData.description,
              rarity: cardData.rarity,
              effects: cardData.effects,
              exhaust: cardData.exhaust,
              ethereal: cardData.ethereal,
              innate: cardData.innate,
            }));
          });
          console.log(`使用 CardDatabase 生成 ${professionId} 职业初始卡组，共 ${deck.length} 张牌`);
          return deck;
        }
      }
    }

    // 回退：使用默认初始卡组
    console.log('使用默认初始卡组');

    // 基础打击牌 x5
    for (let i = 0; i < 5; i++) {
      deck.push(
        new Card({
          name: '打击',
          type: CardTypes.ATTACK,
          cost: 1,
          description: '造成 6 点伤害',
          rarity: CardRarity.MEDIOCRE,
          effects: [{ type: 'damage', value: 6 }],
        }),
      );
    }

    // 基础防御牌 x4
    for (let i = 0; i < 4; i++) {
      deck.push(
        new Card({
          name: '防御',
          type: CardTypes.SKILL,
          cost: 1,
          description: '获得 5 点格挡',
          rarity: CardRarity.MEDIOCRE,
          effects: [{ type: 'block', value: 5 }],
        }),
      );
    }

    // 根据背景添加特殊牌
    if (character.class) {
      const specialCards = this.generateClassCards(character.class);
      deck.push(...specialCards);
    }

    return deck;
  },

  /**
   * 匹配职业名称到 CardDatabase 中的职业ID
   * @param {string} characterClass - 角色职业名称
   * @returns {string|null} - 职业ID或null
   */
  matchProfession(characterClass) {
    if (!characterClass || typeof CardDatabase === 'undefined') return null;

    const classLower = characterClass.toLowerCase();

    // 职业关键词映射
    const professionKeywords = {
      warrior: ['战士', '勇士', '武士'],
      barbarian: ['野蛮人', '狂战士', '蛮族'],
      swordmaster: ['剑圣', '剑士', '剑客', '剑豪'],
      rogue: ['盗贼', '刺客', '暗杀者'],
      ranger: ['游侠', '猎人', '弓箭手', '射手'],
      monk: ['武僧', '僧侣', '拳师'],
      mage: ['魔法师', '法师', '巫师', '元素师'],
      warlock: ['术士', '邪术师', '黑魔法师'],
      sorcerer: ['巫师', '秘术师'],
      priest: ['牧师', '神官', '祭司'],
      paladin: ['圣骑士', '圣武士', '神圣骑士'],
      druid: ['德鲁伊', '自然使者'],
      shaman: ['萨满', '萨满祭司', '元素萨满'],
      spellblade: ['魔剑士', '法剑士', '魔法剑士'],
      shadowKnight: ['暗黑骑士', '死亡骑士', '黑暗骑士'],
      battlemage: ['战斗法师', '战法师'],
    };

    // 精确匹配
    for (const [profId, keywords] of Object.entries(professionKeywords)) {
      for (const keyword of keywords) {
        if (classLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(classLower)) {
          return profId;
        }
      }
    }

    // 模糊匹配
    if (classLower.includes('剑') || classLower.includes('战') || classLower.includes('士')) {
      return 'warrior';
    }
    if (classLower.includes('法') || classLower.includes('魔') || classLower.includes('术')) {
      return 'mage';
    }
    if (classLower.includes('游') || classLower.includes('盗') || classLower.includes('刺')) {
      return 'rogue';
    }
    if (classLower.includes('牧') || classLower.includes('神') || classLower.includes('圣')) {
      return 'priest';
    }
    if (classLower.includes('德') || classLower.includes('自然')) {
      return 'druid';
    }

    return null;
  },

  /**
   * 根据职业生成特殊卡牌
   * @param {string} characterClass - 角色职业
   * @returns {Array<Card>} - 特殊卡牌数组
   */
  generateClassCards(characterClass) {
    const cards = [];

    // 尝试从 CardDatabase 获取职业卡牌
    if (typeof CardDatabase !== 'undefined') {
      const professionId = this.matchProfession(characterClass);
      if (professionId) {
        // 获取该职业的稀有卡牌（作为特殊牌）
        const professionCards = CardDatabase.getCardsForProfession(professionId, 'uncommon');
        if (professionCards && professionCards.length > 0) {
          // 随机选择1-2张
          const count = Math.min(2, professionCards.length);
          const shuffled = professionCards.sort(() => Math.random() - 0.5);
          for (let i = 0; i < count; i++) {
            const cardData = shuffled[i];
            cards.push(new Card({
              id: cardData.id,
              name: cardData.name,
              type: cardData.type,
              cost: cardData.cost,
              description: cardData.description,
              rarity: cardData.rarity,
              effects: cardData.effects,
              exhaust: cardData.exhaust,
              ethereal: cardData.ethereal,
              innate: cardData.innate,
            }));
          }
          return cards;
        }
      }
    }

    // 回退：使用原有逻辑
    const classLower = characterClass.toLowerCase();

    if (classLower.includes('剑') || classLower.includes('战') || classLower.includes('士')) {
      cards.push(
        new Card({
          name: '重斩',
          type: CardTypes.ATTACK,
          cost: 2,
          description: '造成 12 点伤害',
          rarity: CardRarity.COMMON,
          effects: [{ type: 'damage', value: 12 }],
        }),
      );
    }

    if (classLower.includes('法') || classLower.includes('魔') || classLower.includes('术')) {
      cards.push(
        new Card({
          name: '火球术',
          type: CardTypes.ATTACK,
          cost: 2,
          description: '造成 10 点伤害，施加 2 层灼烧',
          rarity: CardRarity.COMMON,
          effects: [
            { type: 'damage', value: 10 },
            { type: 'status', status: 'burn', value: 2 },
          ],
        }),
      );
    }

    if (classLower.includes('游') || classLower.includes('盗') || classLower.includes('刺')) {
      cards.push(
        new Card({
          name: '疾步',
          type: CardTypes.SKILL,
          cost: 1,
          description: '获得 3 点格挡，抽 1 张牌',
          rarity: CardRarity.COMMON,
          effects: [
            { type: 'block', value: 3 },
            { type: 'draw', value: 1 },
          ],
        }),
      );
    }

    // 如果没有匹配到任何职业，添加通用牌
    if (cards.length === 0) {
      cards.push(
        new Card({
          name: '勇气',
          type: CardTypes.SKILL,
          cost: 0,
          description: '抽 2 张牌',
          rarity: CardRarity.COMMON,
          effects: [{ type: 'draw', value: 2 }],
        }),
      );
    }

    return cards;
  },

  /**
   * 抽一张牌
   * @param {Object} battleState - 战斗状态
   * @returns {Card|null} - 抽到的牌或null
   */
  drawCard(battleState) {
    if (battleState.drawPile.length === 0) {
      if (battleState.discardPile.length === 0) {
        return null;
      }
      battleState.drawPile = shuffleArray(battleState.discardPile);
      battleState.discardPile = [];
    }

    const card = battleState.drawPile.pop();
    if (card) {
      battleState.hand.push(card);
    }
    return card;
  },

  /**
   * 抽多张牌
   * @param {Object} battleState - 战斗状态
   * @param {number} count - 抽牌数量
   * @returns {Array<Card>} - 抽到的牌数组
   */
  drawCards(battleState, count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      const card = this.drawCard(battleState);
      if (card) drawn.push(card);
    }
    return drawn;
  },

  /**
   * 弃掉所有手牌
   * @param {Object} battleState - 战斗状态
   */
  discardHand(battleState) {
    while (battleState.hand.length > 0) {
      const card = battleState.hand.pop();
      if (card.ethereal) {
        battleState.exhaustPile.push(card);
      } else {
        battleState.discardPile.push(card);
      }
    }
  },

  /**
   * 获取卡牌模板库
   * @returns {Object} - 卡牌模板库
   */
  getCardTemplates() {
    return {
      // 基础攻击牌
      strike: {
        name: '打击',
        type: CardTypes.ATTACK,
        cost: 1,
        description: '造成 6 点伤害',
        rarity: CardRarity.BASIC,
        effects: [{ type: 'damage', value: 6 }],
      },
      // 基础防御牌
      defend: {
        name: '防御',
        type: CardTypes.SKILL,
        cost: 1,
        description: '获得 5 点格挡',
        rarity: CardRarity.BASIC,
        effects: [{ type: 'block', value: 5 }],
      },
      // 重斩
      heavySlash: {
        name: '重斩',
        type: CardTypes.ATTACK,
        cost: 2,
        description: '造成 12 点伤害',
        rarity: CardRarity.COMMON,
        effects: [{ type: 'damage', value: 12 }],
      },
      // 双斩
      twinStrike: {
        name: '双斩',
        type: CardTypes.ATTACK,
        cost: 1,
        description: '造成 4 点伤害两次',
        rarity: CardRarity.COMMON,
        effects: [
          { type: 'damage', value: 4 },
          { type: 'damage', value: 4 },
        ],
      },
      // 铁壁
      ironWall: {
        name: '铁壁',
        type: CardTypes.SKILL,
        cost: 2,
        description: '获得 12 点格挡',
        rarity: CardRarity.COMMON,
        effects: [{ type: 'block', value: 12 }],
      },
      // 冥想
      meditation: {
        name: '冥想',
        type: CardTypes.SKILL,
        cost: 1,
        description: '获得 1 点能量',
        rarity: CardRarity.UNCOMMON,
        effects: [{ type: 'energy', value: 1 }],
      },
      // 战吼
      battleCry: {
        name: '战吼',
        type: CardTypes.POWER,
        cost: 2,
        description: '每回合开始时获得 2 点格挡',
        rarity: CardRarity.UNCOMMON,
        effects: [{ type: 'power', power: 'battleCry', value: 2 }],
      },
    };
  },

  /**
   * 根据模板创建卡牌
   * @param {string} templateName - 模板名称
   * @returns {Card|null} - 卡牌实例或null
   */
  createFromTemplate(templateName) {
    const templates = this.getCardTemplates();
    const template = templates[templateName];
    if (!template) return null;
    return new Card(template);
  },

  /**
   * 从数据对象创建卡牌
   * 用于从GameVariables或存档中恢复卡牌
   * @param {Object} cardData - 卡牌数据对象
   * @returns {Card} - 卡牌实例
   */
  createFromData(cardData) {
    if (!cardData) {
      console.warn('CardSystem.createFromData: 收到空的卡牌数据');
      return null;
    }

    // 如果已经是Card实例，直接返回
    if (cardData instanceof Card) {
      return cardData;
    }

    // 从数据对象创建新的Card实例
    return new Card({
      id: cardData.id || `card_${generateId()}`,
      name: cardData.name || '未命名卡牌',
      type: cardData.type || CardTypes.ATTACK,
      cost: cardData.cost !== undefined ? cardData.cost : 1,
      description: cardData.description || '',
      rarity: cardData.rarity || CardRarity.COMMON,
      effects: cardData.effects || [],
      exhaust: cardData.exhaust || false,
      ethereal: cardData.ethereal || false,
      innate: cardData.innate || false,
      upgraded: cardData.upgraded || false,
    });
  },

  /**
   * 从数据数组批量创建卡牌
   * @param {Array} cardsData - 卡牌数据数组
   * @returns {Array<Card>} - 卡牌实例数组
   */
  createDeckFromData(cardsData) {
    if (!Array.isArray(cardsData)) {
      console.warn('CardSystem.createDeckFromData: 期望数组，收到', typeof cardsData);
      return [];
    }

    const deck = [];
    cardsData.forEach(cardData => {
      // 处理quantity字段，用于批量创建同类卡牌
      const quantity = cardData.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        const card = this.createFromData(cardData);
        if (card) {
          deck.push(card);
        }
      }
    });

    return deck;
  },

  /**
   * 将卡牌添加到仓库
   * 当获得卡牌奖励时，自动添加到仓库
   * @param {Object} cardData - 卡牌数据对象
   * @returns {Card} - 创建的卡牌实例
   */
  addCardToWarehouse(cardData) {
    if (!cardData) {
      console.warn('CardSystem.addCardToWarehouse: 收到空的卡牌数据');
      return null;
    }

    // 确保仓库存在
    if (!GameVariables.battle.warehouse) {
      GameVariables.battle.warehouse = [];
    }

    // 创建卡牌实例
    const card = this.createFromData(cardData);
    if (!card) {
      console.warn('CardSystem.addCardToWarehouse: 创建卡牌失败');
      return null;
    }

    // 将卡牌数据添加到仓库
    const saveData = card.toSaveData();
    GameVariables.battle.warehouse.push(saveData);

    // 触发MVU变更事件
    if (typeof VariableChangeEmitter !== 'undefined') {
      VariableChangeEmitter.emit('/battle/warehouse', GameVariables.battle.warehouse, null);
    }

    console.log('卡牌已添加到仓库:', saveData.name);
    return card;
  },

  /**
   * 批量将卡牌添加到仓库
   * @param {Array} cardsData - 卡牌数据数组
   * @returns {Array<Card>} - 创建的卡牌实例数组
   */
  addCardsToWarehouse(cardsData) {
    if (!Array.isArray(cardsData) || cardsData.length === 0) {
      return [];
    }

    const addedCards = [];
    cardsData.forEach(cardData => {
      const card = this.addCardToWarehouse(cardData);
      if (card) {
        addedCards.push(card);
      }
    });

    if (addedCards.length > 0 && typeof showToast === 'function') {
      showToast(`获得 ${addedCards.length} 张新卡牌，已添加到仓库`);
    }

    return addedCards;
  },

  /**
   * 生成职业限定的随机卡牌奖励
   * 用于战斗胜利、事件奖励等场景
   * @param {number} count - 生成数量，默认3张供选择
   * @returns {Array} - 卡牌数据数组
   */
  generateProfessionCardRewards(count = 3) {
    const professionId = this.matchProfession(GameState.character?.class);
    
    if (professionId && typeof CardDatabase !== 'undefined') {
      // 使用 CardDatabase 的随机抽卡方法，自动应用职业限制
      return CardDatabase.drawRandomCards(professionId, count);
    }
    
    // 回退：返回通用卡牌
    const fallbackCards = [
      {
        id: 'reward_strike',
        name: '强力打击',
        type: 'attack',
        cost: 1,
        rarity: 'common',
        description: '造成 8 点伤害',
        tags: ['universal'],
        effects: [{ type: 'damage', value: 8 }],
      },
      {
        id: 'reward_defend',
        name: '坚固防御',
        type: 'skill',
        cost: 1,
        rarity: 'common',
        description: '获得 7 点格挡',
        tags: ['universal'],
        effects: [{ type: 'block', value: 7 }],
      },
      {
        id: 'reward_draw',
        name: '洞察',
        type: 'skill',
        cost: 1,
        rarity: 'common',
        description: '抽 2 张牌',
        tags: ['universal'],
        effects: [{ type: 'draw', value: 2 }],
      },
    ];
    
    // 随机选择指定数量
    const shuffled = fallbackCards.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },

  /**
   * 处理卡牌奖励
   * 从GameVariables.reward.card中获取奖励卡牌并添加到仓库
   * 会自动过滤掉不属于当前职业的卡牌
   * @returns {Array<Card>} - 添加的卡牌数组
   */
  processCardRewards() {
    const rewardCards = GameVariables.reward.card || [];
    if (rewardCards.length === 0) {
      return [];
    }

    // 获取当前角色的职业ID
    const professionId = this.matchProfession(GameState.character?.class);
    
    // 过滤卡牌：只保留当前职业可以使用的卡牌
    let filteredCards = rewardCards;
    if (professionId && typeof CardDatabase !== 'undefined') {
      filteredCards = rewardCards.filter(cardData => {
        // 如果卡牌有 tags，检查职业是否可以使用
        if (cardData.tags && cardData.tags.length > 0) {
          return CardDatabase.canProfessionUseCard(professionId, cardData);
        }
        // 没有 tags 的卡牌默认可用（可能是AI生成的自定义卡牌）
        return true;
      });
      
      // 如果有卡牌被过滤掉，记录日志
      const filteredCount = rewardCards.length - filteredCards.length;
      if (filteredCount > 0) {
        console.log(`职业限制：过滤掉 ${filteredCount} 张不属于 ${professionId} 职业的卡牌`);
      }
    }

    // 添加到仓库
    const addedCards = this.addCardsToWarehouse(filteredCards);

    // 清空奖励卡牌列表
    GameVariables.reward.card = [];

    // 触发奖励变更事件
    if (typeof VariableChangeEmitter !== 'undefined') {
      VariableChangeEmitter.emit('/reward/card', [], rewardCards);
    }

    return addedCards;
  },
};

// 导出
window.CardTypes = CardTypes;
window.CardRarity = CardRarity;
window.Card = Card;
window.CardSystem = CardSystem;
