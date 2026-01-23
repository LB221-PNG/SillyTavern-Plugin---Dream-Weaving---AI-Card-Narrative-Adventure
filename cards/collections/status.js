/**
 * 状态卡牌集合
 * Status Cards Collection
 * 状态卡牌通常是负面卡牌，会被添加到玩家牌组中
 */

// 负面状态卡牌
export const negativeStatusCards = [
  {
    id: 'wound',
    name: '伤口',
    type: 'status',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'negative'],
    description: '无法打出',
    effect: { unplayable: true }
  },
  {
    id: 'dazed',
    name: '眩晕',
    type: 'status',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'negative'],
    description: '无法打出，虚无',
    effect: { unplayable: true, ethereal: true }
  },
  {
    id: 'slimed',
    name: '黏液',
    type: 'status',
    rarity: 'special',
    cost: 1,
    tags: ['status', 'negative'],
    description: '消耗',
    effect: { exhaust: true }
  },
  {
    id: 'burn',
    name: '灼伤',
    type: 'status',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'negative'],
    description: '无法打出，回合结束时受到2点伤害',
    effect: { unplayable: true, damageOnTurnEnd: 2 }
  },
  {
    id: 'void',
    name: '虚空',
    type: 'status',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'negative'],
    description: '无法打出，虚无，抽到时失去1点能量',
    effect: { unplayable: true, ethereal: true, energyLossOnDraw: 1 }
  },
  {
    id: 'curse_pain',
    name: '痛苦诅咒',
    type: 'curse',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'curse'],
    description: '无法打出，抽到时失去1点生命',
    effect: { unplayable: true, damageOnDraw: 1 }
  },
  {
    id: 'curse_decay',
    name: '腐朽诅咒',
    type: 'curse',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'curse'],
    description: '无法打出，回合结束时如果在手牌中，失去1点生命',
    effect: { unplayable: true, damageInHand: 1 }
  },
  {
    id: 'curse_doubt',
    name: '疑虑诅咒',
    type: 'curse',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'curse'],
    description: '无法打出，回合结束时如果在手牌中，获得1层虚弱',
    effect: { unplayable: true, weakInHand: 1 }
  },
  {
    id: 'curse_regret',
    name: '悔恨诅咒',
    type: 'curse',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'curse'],
    description: '无法打出，回合结束时如果在手牌中，失去等同于手牌数的生命',
    effect: { unplayable: true, damageByHandSize: true }
  },
  {
    id: 'curse_shame',
    name: '羞耻诅咒',
    type: 'curse',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'curse'],
    description: '无法打出，回合结束时如果在手牌中，获得1层易伤',
    effect: { unplayable: true, vulnerableInHand: 1 }
  },
  {
    id: 'curse_writhe',
    name: '扭曲诅咒',
    type: 'curse',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'curse'],
    description: '无法打出，抽到时移到手牌最左边',
    effect: { unplayable: true, moveToLeft: true }
  },
  {
    id: 'curse_parasite',
    name: '寄生诅咒',
    type: 'curse',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'curse'],
    description: '无法打出，如果在战斗结束时在牌组中，失去3点最大生命',
    effect: { unplayable: true, maxHpLossOnEnd: 3 }
  },
  {
    id: 'curse_normality',
    name: '平庸诅咒',
    type: 'curse',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'curse'],
    description: '无法打出，你每回合不能打出超过3张牌',
    effect: { unplayable: true, cardPlayLimit: 3 }
  },
  {
    id: 'curse_clumsy',
    name: '笨拙诅咒',
    type: 'curse',
    rarity: 'special',
    cost: -1,
    tags: ['status', 'curse'],
    description: '无法打出，虚无',
    effect: { unplayable: true, ethereal: true }
  }
];

// 临时生成的卡牌
export const generatedCards = [
  {
    id: 'shiv',
    name: '小刀',
    type: 'attack',
    rarity: 'special',
    cost: 0,
    tags: ['stealth', 'generated'],
    description: '造成4点伤害，消耗',
    effect: { damage: 4, exhaust: true }
  },
  {
    id: 'smite',
    name: '惩击',
    type: 'attack',
    rarity: 'special',
    cost: 1,
    tags: ['holy', 'generated'],
    description: '造成12点伤害，消耗，保留',
    effect: { damage: 12, exhaust: true, retain: true }
  },
  {
    id: 'safety',
    name: '安全',
    type: 'skill',
    rarity: 'special',
    cost: 1,
    tags: ['holy', 'generated'],
    description: '获得12点护甲，消耗，保留',
    effect: { armor: 12, exhaust: true, retain: true }
  },
  {
    id: 'miracle',
    name: '奇迹',
    type: 'skill',
    rarity: 'special',
    cost: 0,
    tags: ['holy', 'generated'],
    description: '获得1点能量，消耗，保留',
    effect: { energy: 1, exhaust: true, retain: true }
  },
  {
    id: 'insight',
    name: '洞察',
    type: 'skill',
    rarity: 'special',
    cost: 0,
    tags: ['magic', 'generated'],
    description: '抽1张牌，消耗，保留',
    effect: { draw: 1, exhaust: true, retain: true }
  },
  {
    id: 'beta',
    name: 'Beta',
    type: 'skill',
    rarity: 'special',
    cost: 2,
    tags: ['magic', 'generated'],
    description: '将一张Omega加入抽牌堆',
    effect: { addToDrawPile: 'omega' }
  },
  {
    id: 'omega',
    name: 'Omega',
    type: 'power',
    rarity: 'special',
    cost: 3,
    tags: ['magic', 'generated'],
    description: '每回合结束时，对所有敌人造成50点伤害',
    effect: { damageAllPerTurnEnd: 50 }
  },
  {
    id: 'expunger',
    name: '抹除者',
    type: 'attack',
    rarity: 'special',
    cost: 1,
    tags: ['magic', 'generated'],
    description: '造成9点伤害×充能球数量',
    effect: { damagePerOrb: 9 }
  }
];

// 特殊机制卡牌
export const specialMechanicCards = [
  {
    id: 'anger',
    name: '愤怒',
    type: 'attack',
    rarity: 'common',
    cost: 0,
    tags: ['rage'],
    description: '造成6点伤害，将一张愤怒加入弃牌堆',
    effect: { damage: 6, addCopyToDiscard: true }
  },
  {
    id: 'rampage',
    name: '狂暴',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    tags: ['rage'],
    description: '造成8点伤害，每次打出此牌伤害永久增加5',
    effect: { damage: 8, permanentDamageIncrease: 5 }
  },
  {
    id: 'ritual_dagger',
    name: '仪式匕首',
    type: 'attack',
    rarity: 'special',
    cost: 1,
    tags: ['shadow'],
    description: '造成15点伤害，消耗，如果击杀敌人，伤害永久增加3',
    effect: { damage: 15, exhaust: true, damageIncreaseOnKill: 3 }
  },
  {
    id: 'genetic_algorithm',
    name: '遗传算法',
    type: 'skill',
    rarity: 'rare',
    cost: 1,
    tags: ['magic'],
    description: '获得1点护甲，每次打出此牌护甲永久增加2',
    effect: { armor: 1, permanentArmorIncrease: 2 }
  },
  {
    id: 'searing_blow',
    name: '灼热打击',
    type: 'attack',
    rarity: 'uncommon',
    cost: 2,
    tags: ['fire', 'physical'],
    description: '造成12点伤害，可以无限升级',
    effect: { damage: 12, infiniteUpgrade: true }
  }
];

// 导出所有状态卡牌
export const statusCards = [
  ...negativeStatusCards,
  ...generatedCards,
  ...specialMechanicCards
];

export default statusCards;
