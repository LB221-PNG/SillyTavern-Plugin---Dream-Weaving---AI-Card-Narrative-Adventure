/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 卡牌数据库入口文件
 * ============================================================
 * 
 * 此文件负责：
 * 1. 导入所有卡牌模块
 * 2. 合并卡牌数据
 * 3. 提供统一的 CardDatabase API
 * 
 * 目录结构：
 * cards/
 * ├── index.js          - 入口文件（本文件）
 * ├── meta.js           - 元数据定义（稀有度、类型等）
 * ├── professions.js    - 职业定义
 * ├── tags.js           - 标签组定义
 * └── collections/      - 卡牌集合目录
 *     ├── basic.js      - 基础卡牌
 *     ├── attack.js     - 攻击卡牌
 *     ├── defense.js    - 防御卡牌
 *     ├── skill.js      - 技能卡牌
 *     ├── power.js      - 能力卡牌
 *     ├── status.js     - 状态卡牌
 *     └── exclusive.js  - 职业专属卡牌
 * 
 * ============================================================ */

// 导入元数据
import { CardMeta } from './meta.js';

// 导入标签组
import { TagGroups } from './tags.js';

// 导入职业定义
import { Professions } from './professions.js';

// 导入卡牌集合
import { basicCards } from './collections/basic.js';
import { attackCards } from './collections/attack.js';
import { defenseCards } from './collections/defense.js';
import { skillCards } from './collections/skill.js';
import { powerCards } from './collections/power.js';
import { statusCards } from './collections/status.js';
import { exclusiveCards } from './collections/exclusive.js';

/**
 * 卡牌数据库
 * 统一管理所有卡牌数据和职业信息
 */
const CardDatabase = {
  // 元数据
  meta: CardMeta,
  
  // 标签组定义
  tagGroups: TagGroups,
  
  // 职业定义
  professions: Professions,
  
  // 卡牌数据（合并所有集合）
  cards: {
    basic: basicCards,
    attack: attackCards,
    defense: defenseCards,
    skill: skillCards,
    power: powerCards,
    status: statusCards,
    exclusive: exclusiveCards,
  },

  // ============================================================
  // 辅助方法
  // ============================================================

  /**
   * 获取职业的所有可用标签
   * @param {string} professionId - 职业ID
   * @returns {Set<string>} - 可用标签集合
   */
  getProfessionTags(professionId) {
    const profession = this.professions[professionId];
    if (!profession) return new Set();

    const tags = new Set(profession.extraTags || []);

    // 添加继承的标签组中的所有标签
    (profession.inherits || []).forEach(groupName => {
      const groupTags = this.tagGroups[groupName] || [];
      groupTags.forEach(tag => tags.add(tag));
    });

    return tags;
  },

  /**
   * 判断职业是否可以使用某张卡牌
   * @param {string} professionId - 职业ID
   * @param {Object} card - 卡牌对象
   * @returns {boolean}
   */
  canProfessionUseCard(professionId, card) {
    const profession = this.professions[professionId];
    if (!profession) return false;

    // 1. 检查是否是该职业的专属卡
    if (profession.exclusiveCards && profession.exclusiveCards.includes(card.id)) {
      return true;
    }

    // 2. 检查卡牌是否专属于其他职业
    if (card.exclusiveTo && !card.exclusiveTo.includes(professionId)) {
      return false;
    }

    // 3. 获取职业的所有可用标签
    const profTags = this.getProfessionTags(professionId);

    // 4. 检查卡牌标签是否与职业标签有交集
    return (card.tags || []).some(tag => profTags.has(tag));
  },

  /**
   * 获取职业可用的所有卡牌
   * @param {string} professionId - 职业ID
   * @param {string} rarity - 可选，筛选稀有度
   * @returns {Array} - 可用卡牌数组
   */
  getCardsForProfession(professionId, rarity = null) {
    const availableCards = [];

    // 遍历所有卡牌分类
    const traverseCards = (obj) => {
      if (Array.isArray(obj)) {
        obj.forEach(card => {
          if (this.canProfessionUseCard(professionId, card)) {
            if (!rarity || card.rarity === rarity) {
              availableCards.push(card);
            }
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(value => traverseCards(value));
      }
    };

    traverseCards(this.cards);
    return availableCards;
  },

  /**
   * 根据ID获取卡牌
   * @param {string} cardId - 卡牌ID
   * @returns {Object|null} - 卡牌对象或null
   */
  getCardById(cardId) {
    const findCard = (obj) => {
      if (Array.isArray(obj)) {
        return obj.find(card => card.id === cardId);
      } else if (typeof obj === 'object' && obj !== null) {
        for (const value of Object.values(obj)) {
          const found = findCard(value);
          if (found) return found;
        }
      }
      return null;
    };

    return findCard(this.cards);
  },

  /**
   * 获取职业的初始卡组
   * @param {string} professionId - 职业ID
   * @returns {Array} - 初始卡组卡牌数组
   */
  getStarterDeck(professionId) {
    const profession = this.professions[professionId];
    if (!profession || !profession.starterDeck) return [];

    return profession.starterDeck.map(cardId => this.getCardById(cardId)).filter(card => card !== null);
  },

  /**
   * 按稀有度随机抽取卡牌
   * @param {string} professionId - 职业ID
   * @param {number} count - 抽取数量
   * @returns {Array} - 抽取的卡牌数组
   */
  drawRandomCards(professionId, count = 1) {
    const rarities = this.meta.rarities;
    const result = [];

    for (let i = 0; i < count; i++) {
      // 根据掉落率随机选择稀有度
      const roll = Math.random();
      let cumulative = 0;
      let selectedRarity = 'common';

      for (const [rarity, config] of Object.entries(rarities)) {
        cumulative += config.dropRate;
        if (roll < cumulative) {
          selectedRarity = rarity;
          break;
        }
      }

      // 获取该稀有度的可用卡牌
      const cards = this.getCardsForProfession(professionId, selectedRarity);
      if (cards.length > 0) {
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        result.push({ ...randomCard }); // 返回副本
      }
    }

    return result;
  },

  /**
   * 注册新的卡牌集合
   * 用于动态添加卡牌（如MOD支持）
   * @param {string} collectionName - 集合名称
   * @param {Array|Object} cards - 卡牌数据
   */
  registerCollection(collectionName, cards) {
    if (this.cards[collectionName]) {
      console.warn(`CardDatabase: 集合 "${collectionName}" 已存在，将被覆盖`);
    }
    this.cards[collectionName] = cards;
    console.log(`CardDatabase: 已注册卡牌集合 "${collectionName}"`);
  },

  /**
   * 获取所有卡牌的统计信息
   * @returns {Object} - 统计信息
   */
  getStats() {
    let totalCards = 0;
    const byRarity = {};
    const byType = {};
    const byCollection = {};

    const countCards = (obj, collectionName = 'unknown') => {
      if (Array.isArray(obj)) {
        obj.forEach(card => {
          totalCards++;
          byRarity[card.rarity] = (byRarity[card.rarity] || 0) + 1;
          byType[card.type] = (byType[card.type] || 0) + 1;
          byCollection[collectionName] = (byCollection[collectionName] || 0) + 1;
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          countCards(value, collectionName === 'unknown' ? key : collectionName);
        });
      }
    };

    countCards(this.cards);

    return {
      totalCards,
      byRarity,
      byType,
      byCollection,
      professionCount: Object.keys(this.professions).length,
    };
  },
};

// 导出
export { CardDatabase };

// 兼容非模块化环境
if (typeof window !== 'undefined') {
  window.CardDatabase = CardDatabase;
}
