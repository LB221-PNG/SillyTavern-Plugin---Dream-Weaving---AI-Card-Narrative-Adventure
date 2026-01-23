/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 敌人系统
 * ============================================================ */

/**
 * 敌人系统
 */
const EnemySystem = {
  /**
   * 敌人模板库
   */
  templates: {
    slime: {
      name: '史莱姆',
      baseHp: 15,
      hpVariance: 5,
      intents: [
        { type: 'attack', minValue: 5, maxValue: 8 },
        { type: 'defend', value: 3 },
      ],
    },
    goblin: {
      name: '哥布林',
      baseHp: 20,
      hpVariance: 5,
      intents: [
        { type: 'attack', minValue: 6, maxValue: 10 },
        { type: 'attack', minValue: 4, maxValue: 6 },
        { type: 'buff', value: 2 },
      ],
    },
    wolf: {
      name: '野狼',
      baseHp: 25,
      hpVariance: 8,
      intents: [
        { type: 'attack', minValue: 8, maxValue: 12 },
        { type: 'attack', minValue: 5, maxValue: 7 },
      ],
    },
    mechanicalWolf: {
      name: '机械野狼',
      baseHp: 30,
      hpVariance: 10,
      intents: [
        { type: 'attack', minValue: 8, maxValue: 14 },
        { type: 'attack', minValue: 10, maxValue: 16 },
        { type: 'defend', value: 8 },
      ],
    },
    skeleton: {
      name: '骷髅兵',
      baseHp: 18,
      hpVariance: 4,
      intents: [
        { type: 'attack', minValue: 6, maxValue: 9 },
        { type: 'attack', minValue: 6, maxValue: 9 },
        { type: 'defend', value: 5 },
      ],
    },
    darkMage: {
      name: '黑暗法师',
      baseHp: 22,
      hpVariance: 6,
      intents: [
        { type: 'attack', minValue: 10, maxValue: 15 },
        { type: 'debuff', status: 'weak', value: 1 },
        { type: 'defend', value: 6 },
      ],
    },
    golem: {
      name: '石像鬼',
      baseHp: 45,
      hpVariance: 10,
      intents: [
        { type: 'defend', value: 10 },
        { type: 'attack', minValue: 12, maxValue: 18 },
        { type: 'attack', minValue: 8, maxValue: 12 },
      ],
    },
    dragon: {
      name: '幼龙',
      baseHp: 60,
      hpVariance: 15,
      intents: [
        { type: 'attack', minValue: 15, maxValue: 25 },
        { type: 'buff', value: 3 },
        { type: 'attack', minValue: 10, maxValue: 15 },
        { type: 'defend', value: 12 },
      ],
    },
  },

  /**
   * 创建敌人实例
   * @param {string} templateName - 模板名称
   * @param {number} level - 敌人等级
   * @returns {Object} - 敌人实例
   */
  create(templateName, level = 1) {
    const template = this.templates[templateName] || this.templates.slime;
    const hpBonus = Math.floor(Math.random() * template.hpVariance * 2) - template.hpVariance;
    const levelBonus = (level - 1) * 5;
    const hp = template.baseHp + hpBonus + levelBonus;

    return {
      name: template.name,
      level: level,
      hp: hp,
      maxHp: hp,
      block: 0,
      statuses: {},
      intentIndex: 0,
      intents: template.intents,
      currentIntent: null,
    };
  },

  /**
   * 随机生成敌人
   * @param {number} floor - 当前层数
   * @returns {Object} - 敌人实例
   */
  createRandom(floor) {
    const templateNames = Object.keys(this.templates);

    // 根据层数调整可用敌人
    let availableEnemies;
    if (floor <= 3) {
      availableEnemies = ['slime', 'goblin', 'wolf'];
    } else if (floor <= 6) {
      availableEnemies = ['goblin', 'wolf', 'mechanicalWolf', 'skeleton'];
    } else if (floor <= 9) {
      availableEnemies = ['mechanicalWolf', 'skeleton', 'darkMage', 'golem'];
    } else {
      availableEnemies = templateNames;
    }

    const randomIndex = Math.floor(Math.random() * availableEnemies.length);
    const templateName = availableEnemies[randomIndex];
    const level = Math.ceil(floor / 3);

    return this.create(templateName, level);
  },

  /**
   * 滚动敌人意图
   * @param {Object} enemy - 敌人实例
   * @returns {Object} - 当前意图
   */
  rollIntent(enemy) {
    const intentTemplate = enemy.intents[enemy.intentIndex % enemy.intents.length];
    enemy.intentIndex++;

    const intent = { ...intentTemplate };
    if (intent.type === 'attack' && intent.minValue !== undefined) {
      intent.value = Math.floor(Math.random() * (intent.maxValue - intent.minValue + 1)) + intent.minValue;

      // 应用力量加成
      if (enemy.statuses.strength) {
        intent.value += enemy.statuses.strength;
      }
    }

    enemy.currentIntent = intent;
    return intent;
  },

  /**
   * 执行敌人意图
   * @param {Object} enemy - 敌人实例
   * @param {Object} battleState - 战斗状态
   * @returns {Object} - 执行结果
   */
  executeIntent(enemy, battleState) {
    const intent = enemy.currentIntent;
    if (!intent) return { type: 'none' };

    const result = { type: intent.type };

    switch (intent.type) {
      case 'attack': {
        let damage = intent.value;

        // 检查玩家是否有易伤状态
        if (battleState.statuses && battleState.statuses.vulnerable) {
          damage = Math.floor(damage * 1.5);
        }

        if (battleState.block > 0) {
          const blocked = Math.min(battleState.block, damage);
          battleState.block -= blocked;
          damage -= blocked;
          result.blocked = blocked;
        }
        if (damage > 0) {
          battleState.playerHp = Math.max(0, battleState.playerHp - damage);
        }
        result.damage = intent.value;
        result.actualDamage = damage;
        break;
      }

      case 'defend': {
        enemy.block = (enemy.block || 0) + intent.value;
        result.block = intent.value;
        break;
      }

      case 'buff': {
        if (!enemy.statuses.strength) enemy.statuses.strength = 0;
        enemy.statuses.strength += intent.value;
        result.buff = intent.value;
        break;
      }

      case 'debuff': {
        if (!battleState.statuses) battleState.statuses = {};
        if (!battleState.statuses[intent.status]) {
          battleState.statuses[intent.status] = 0;
        }
        battleState.statuses[intent.status] += intent.value;
        result.debuff = { status: intent.status, value: intent.value };
        break;
      }
    }

    return result;
  },

  /**
   * 处理敌人回合开始
   * @param {Object} enemy - 敌人实例
   */
  onTurnStart(enemy) {
    // 清除格挡
    enemy.block = 0;

    // 处理持续效果
    if (enemy.statuses) {
      // 处理灼烧
      if (enemy.statuses.burn && enemy.statuses.burn > 0) {
        enemy.hp = Math.max(0, enemy.hp - enemy.statuses.burn);
      }

      // 处理虚弱
      if (enemy.statuses.weak && enemy.statuses.weak > 0) {
        enemy.statuses.weak--;
      }

      // 处理易伤
      if (enemy.statuses.vulnerable && enemy.statuses.vulnerable > 0) {
        enemy.statuses.vulnerable--;
      }
    }
  },

  /**
   * 获取意图图标
   * @param {string} intentType - 意图类型
   * @returns {string} - 图标SVG
   */
  getIntentIcon(intentType) {
    const icons = {
      attack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>`,
      defend: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>`,
      buff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>`,
      debuff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>`,
      unknown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`,
    };
    return icons[intentType] || icons.unknown;
  },

  /**
   * 获取意图描述
   * @param {Object} intent - 意图对象
   * @returns {string} - 描述文本
   */
  getIntentDescription(intent) {
    if (!intent) return '准备中...';

    switch (intent.type) {
      case 'attack':
        return `攻击 ${intent.value}`;
      case 'defend':
        return `防御 ${intent.value}`;
      case 'buff':
        return `强化 +${intent.value}`;
      case 'debuff':
        return `削弱`;
      default:
        return '准备中...';
    }
  },
};

// 导出
window.EnemySystem = EnemySystem;
