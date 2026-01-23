/**
 * 防御卡牌集合
 * Defense Cards Collection
 */

// 基础防御卡牌
export const basicDefenseCards = [
  {
    id: 'iron_wall',
    name: '铁壁',
    type: 'skill',
    rarity: 'common',
    cost: 2,
    tags: ['defense', 'physical'],
    description: '获得12点护甲',
    effect: { armor: 12 }
  },
  {
    id: 'parry',
    name: '格挡',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    tags: ['defense', 'physical'],
    description: '获得5点护甲，抽1张牌',
    effect: { armor: 5, draw: 1 }
  },
  {
    id: 'brace',
    name: '戒备',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    tags: ['defense', 'universal'],
    description: '获得7点护甲',
    effect: { armor: 7 }
  }
];

// 高级防御卡牌
export const advancedDefenseCards = [
  {
    id: 'fortify',
    name: '强化防御',
    type: 'skill',
    rarity: 'uncommon',
    cost: 2,
    tags: ['defense', 'physical'],
    description: '获得15点护甲，下回合护甲不消失',
    effect: { armor: 15, retainArmor: true }
  },
  {
    id: 'shield_bash',
    name: '盾击',
    type: 'attack',
    rarity: 'uncommon',
    cost: 2,
    tags: ['defense', 'physical'],
    description: '造成等同于当前护甲值的伤害',
    effect: { damageFromArmor: true }
  },
  {
    id: 'entrench',
    name: '固守',
    type: 'skill',
    rarity: 'uncommon',
    cost: 2,
    tags: ['defense', 'physical'],
    description: '护甲值翻倍',
    effect: { doubleArmor: true }
  },
  {
    id: 'barricade',
    name: '壁垒',
    type: 'power',
    rarity: 'rare',
    cost: 3,
    tags: ['defense', 'physical'],
    description: '护甲不再在回合结束时消失',
    effect: { permanentArmor: true }
  }
];

// 魔法防御卡牌
export const magicDefenseCards = [
  {
    id: 'mana_shield',
    name: '法力护盾',
    type: 'skill',
    rarity: 'uncommon',
    cost: 2,
    tags: ['defense', 'magic'],
    description: '获得8点护甲，获得1点能量',
    effect: { armor: 8, energy: 1 }
  },
  {
    id: 'arcane_barrier',
    name: '奥术屏障',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    tags: ['defense', 'magic'],
    description: '获得10点护甲，本回合受到的伤害减少25%',
    effect: { armor: 10, damageReduction: 0.25 }
  },
  {
    id: 'frost_armor',
    name: '霜甲术',
    type: 'skill',
    rarity: 'uncommon',
    cost: 2,
    tags: ['defense', 'ice', 'magic'],
    description: '获得8点护甲，攻击你的敌人获得1层冰冻',
    effect: { armor: 8, frostRetaliate: 1 }
  },
  {
    id: 'flame_shield',
    name: '烈焰护盾',
    type: 'skill',
    rarity: 'uncommon',
    cost: 2,
    tags: ['defense', 'fire', 'magic'],
    description: '获得6点护甲，攻击你的敌人受到4点伤害',
    effect: { armor: 6, fireRetaliate: 4 }
  }
];

// 神圣防御卡牌
export const holyDefenseCards = [
  {
    id: 'divine_protection',
    name: '神圣守护',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    tags: ['defense', 'holy'],
    description: '获得10点护甲，恢复3点生命',
    effect: { armor: 10, heal: 3 }
  },
  {
    id: 'sanctuary',
    name: '庇护所',
    type: 'power',
    rarity: 'rare',
    cost: 3,
    tags: ['defense', 'holy'],
    description: '每回合开始时获得5点护甲',
    effect: { armorPerTurn: 5 }
  },
  {
    id: 'holy_shield',
    name: '圣盾术',
    type: 'skill',
    rarity: 'uncommon',
    cost: 1,
    tags: ['defense', 'holy'],
    description: '获得5点护甲，净化1层负面效果',
    effect: { armor: 5, cleanse: 1 }
  }
];

// 自然防御卡牌
export const natureDefenseCards = [
  {
    id: 'bark_skin',
    name: '树皮术',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    tags: ['defense', 'nature'],
    description: '获得6点护甲，获得1层再生',
    effect: { armor: 6, regeneration: 1 }
  },
  {
    id: 'natures_embrace',
    name: '自然之拥',
    type: 'skill',
    rarity: 'uncommon',
    cost: 2,
    tags: ['defense', 'nature'],
    description: '获得8点护甲，恢复4点生命',
    effect: { armor: 8, heal: 4 }
  },
  {
    id: 'thorns',
    name: '荆棘术',
    type: 'power',
    rarity: 'uncommon',
    cost: 1,
    tags: ['defense', 'nature'],
    description: '每当受到攻击时，对攻击者造成3点伤害',
    effect: { thorns: 3 }
  }
];

// 暗影防御卡牌
export const shadowDefenseCards = [
  {
    id: 'shadow_cloak',
    name: '暗影斗篷',
    type: 'skill',
    rarity: 'uncommon',
    cost: 1,
    tags: ['defense', 'shadow', 'stealth'],
    description: '获得5点护甲，获得1层潜行',
    effect: { armor: 5, stealth: 1 }
  },
  {
    id: 'void_barrier',
    name: '虚空屏障',
    type: 'skill',
    rarity: 'rare',
    cost: 2,
    tags: ['defense', 'shadow'],
    description: '获得12点护甲，下一次受到的伤害减半',
    effect: { armor: 12, halfNextDamage: true }
  }
];

// 导出所有防御卡牌
export const defenseCards = [
  ...basicDefenseCards,
  ...advancedDefenseCards,
  ...magicDefenseCards,
  ...holyDefenseCards,
  ...natureDefenseCards,
  ...shadowDefenseCards
];

export default defenseCards;
