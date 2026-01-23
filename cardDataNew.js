/* ============================================================
 * 卡牌数据兼容层
 * Card Data Compatibility Layer
 * ============================================================
 * 
 * 此文件将模块化的卡牌数据转换为全局可用的格式
 * 用于兼容现有的非模块化代码
 * 
 * 注意：这是一个临时解决方案，未来应该将整个项目迁移到 ES6 模块
 * ============================================================ */

// ============================================================
// 元数据定义
// ============================================================
const CardMeta = {
  rarities: {
    basic: { name: '基础', color: '#808080', weight: 0, dropRate: 0 },
    common: { name: '普通', color: '#FFFFFF', weight: 50, dropRate: 0.55 },
    uncommon: { name: '稀有', color: '#4169E1', weight: 30, dropRate: 0.30 },
    rare: { name: '史诗', color: '#FFD700', weight: 15, dropRate: 0.12 },
    legendary: { name: '传奇', color: '#FF8C00', weight: 5, dropRate: 0.03 },
  },
  types: {
    attack: { name: '攻击', color: '#FF6B6B' },
    skill: { name: '技能', color: '#4ECDC4' },
    power: { name: '能力', color: '#FFE66D' },
    status: { name: '状态', color: '#95A5A6' },
    curse: { name: '诅咒', color: '#8B0000' },
  },
};

// ============================================================
// 标签组定义
// ============================================================
const TagGroups = {
  physical: ['weapon', 'armor', 'strength', 'melee', 'physical'],
  magic: ['spell', 'arcane', 'mana', 'magic'],
  fire: ['fire', 'burn'],
  ice: ['ice', 'frost', 'freeze'],
  lightning: ['lightning', 'shock'],
  shadow: ['dark', 'curse', 'drain', 'shadow'],
  holy: ['light', 'heal', 'blessing', 'holy'],
  nature: ['beast', 'plant', 'wild', 'nature'],
  stealth: ['poison', 'trap', 'agility', 'stealth'],
  rage: ['berserk', 'fury', 'rage'],
  defense: ['block', 'shield', 'fortify', 'defense'],
};

// ============================================================
// 职业定义
// ============================================================
const Professions = {
  warrior: {
    id: 'warrior',
    name: '战士',
    description: '力量与防御的平衡型职业',
    inherits: ['physical', 'defense'],
    extraTags: ['universal'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash'],
  },
  barbarian: {
    id: 'barbarian',
    name: '野蛮人',
    description: '狂暴战斗风格，高伤害但防御较弱',
    inherits: ['physical', 'rage'],
    extraTags: ['universal'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'bash'],
  },
  swordmaster: {
    id: 'swordmaster',
    name: '剑圣',
    description: '精准打击与连续攻击的大师',
    inherits: ['physical', 'stealth'],
    extraTags: ['universal', 'blade'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash'],
  },
  rogue: {
    id: 'rogue',
    name: '盗贼',
    description: '擅长毒素、欺诈和暗杀',
    inherits: ['stealth', 'shadow'],
    extraTags: ['universal'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'neutralize'],
  },
  ranger: {
    id: 'ranger',
    name: '游侠',
    description: '远程攻击与自然之力的结合',
    inherits: ['stealth', 'nature'],
    extraTags: ['universal', 'ranged'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash'],
  },
  monk: {
    id: 'monk',
    name: '武僧',
    description: '内功与拳脚的完美结合',
    inherits: ['physical', 'holy'],
    extraTags: ['universal', 'chi'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash'],
  },
  mage: {
    id: 'mage',
    name: '魔法师',
    description: '元素魔法的大师',
    inherits: ['magic', 'fire', 'ice', 'lightning'],
    extraTags: ['universal'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash', 'bash'],
  },
  warlock: {
    id: 'warlock',
    name: '术士',
    description: '黑暗魔法与诅咒的使用者',
    inherits: ['magic', 'shadow', 'fire'],
    extraTags: ['universal', 'demon'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash', 'bash'],
  },
  sorcerer: {
    id: 'sorcerer',
    name: '巫师',
    description: '原始魔力的操控者',
    inherits: ['magic', 'lightning'],
    extraTags: ['universal', 'chaos'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash', 'bash'],
  },
  priest: {
    id: 'priest',
    name: '牧师',
    description: '神圣治疗与祝福的使者',
    inherits: ['holy', 'magic'],
    extraTags: ['universal'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash', 'bash'],
  },
  paladin: {
    id: 'paladin',
    name: '圣骑士',
    description: '神圣与武力的结合',
    inherits: ['physical', 'holy', 'defense'],
    extraTags: ['universal'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash', 'bash'],
  },
  druid: {
    id: 'druid',
    name: '德鲁伊',
    description: '自然之力与变形术的掌控者',
    inherits: ['nature', 'magic'],
    extraTags: ['universal', 'shapeshift'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash', 'bash'],
  },
  shaman: {
    id: 'shaman',
    name: '萨满',
    description: '元素与图腾的召唤者',
    inherits: ['nature', 'fire', 'lightning'],
    extraTags: ['universal', 'totem'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash', 'bash'],
  },
  spellblade: {
    id: 'spellblade',
    name: '魔剑士',
    description: '剑术与魔法的完美融合',
    inherits: ['physical', 'magic'],
    extraTags: ['universal', 'spellblade'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash', 'bash'],
  },
  shadowKnight: {
    id: 'shadowKnight',
    name: '暗黑骑士',
    description: '黑暗力量与武技的结合',
    inherits: ['physical', 'shadow', 'defense'],
    extraTags: ['universal', 'deathknight'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash', 'bash'],
  },
  battlemage: {
    id: 'battlemage',
    name: '战斗法师',
    description: '近战与法术的双重威胁',
    inherits: ['physical', 'magic', 'fire'],
    extraTags: ['universal'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash', 'bash'],
  },
};

// ============================================================
// 基础卡牌
// ============================================================
const basicCards = [
  {
    id: 'strike',
    name: '打击',
    type: 'attack',
    cost: 1,
    rarity: 'basic',
    description: '造成 6 点伤害',
    tags: ['universal'],
    effects: [{ type: 'damage', value: 6 }],
  },
  {
    id: 'defend',
    name: '防御',
    type: 'skill',
    cost: 1,
    rarity: 'basic',
    description: '获得 5 点格挡',
    tags: ['universal'],
    effects: [{ type: 'block', value: 5 }],
  },
  {
    id: 'bash',
    name: '痛击',
    type: 'attack',
    cost: 2,
    rarity: 'basic',
    description: '造成 8 点伤害，施加 2 层易伤',
    tags: ['physical', 'weapon'],
    effects: [
      { type: 'damage', value: 8 },
      { type: 'status', status: 'vulnerable', value: 2 },
    ],
  },
  {
    id: 'neutralize',
    name: '中和',
    type: 'attack',
    cost: 0,
    rarity: 'basic',
    description: '造成 3 点伤害，施加 1 层虚弱',
    tags: ['stealth', 'poison'],
    effects: [
      { type: 'damage', value: 3 },
      { type: 'status', status: 'weak', value: 1 },
    ],
  },
];

// ============================================================
// 攻击卡牌
// ============================================================
const attackCards = {
  // 单体伤害
  single: [
    {
      id: 'heavy_slash',
      name: '重斩',
      type: 'attack',
      cost: 2,
      rarity: 'common',
      description: '造成 12 点伤害',
      tags: ['physical', 'weapon', 'melee'],
      effects: [{ type: 'damage', value: 12 }],
    },
    {
      id: 'quick_slash',
      name: '快斩',
      type: 'attack',
      cost: 1,
      rarity: 'common',
      description: '造成 8 点伤害，抽 1 张牌',
      tags: ['physical', 'blade'],
      effects: [
        { type: 'damage', value: 8 },
        { type: 'draw', value: 1 },
      ],
    },
    {
      id: 'fireball',
      name: '火球术',
      type: 'attack',
      cost: 2,
      rarity: 'common',
      description: '造成 10 点伤害，施加 2 层灼烧',
      tags: ['spell', 'fire'],
      effects: [
        { type: 'damage', value: 10 },
        { type: 'status', status: 'burn', value: 2 },
      ],
    },
    {
      id: 'frost_bolt',
      name: '寒冰箭',
      type: 'attack',
      cost: 1,
      rarity: 'common',
      description: '造成 7 点伤害，施加 1 层冰冻',
      tags: ['spell', 'ice', 'frost'],
      effects: [
        { type: 'damage', value: 7 },
        { type: 'status', status: 'frozen', value: 1 },
      ],
    },
    {
      id: 'shadow_bolt',
      name: '暗影箭',
      type: 'attack',
      cost: 1,
      rarity: 'common',
      description: '造成 9 点伤害',
      tags: ['spell', 'dark', 'shadow'],
      effects: [{ type: 'damage', value: 9 }],
    },
    {
      id: 'smite',
      name: '惩击',
      type: 'attack',
      cost: 1,
      rarity: 'common',
      description: '造成 6 点伤害，恢复 2 点生命',
      tags: ['spell', 'holy', 'light'],
      effects: [
        { type: 'damage', value: 6 },
        { type: 'heal', value: 2 },
      ],
    },
    {
      id: 'bludgeon',
      name: '重击',
      type: 'attack',
      cost: 3,
      rarity: 'rare',
      description: '造成 32 点伤害',
      tags: ['physical', 'weapon', 'strength'],
      effects: [{ type: 'damage', value: 32 }],
    },
  ],

  // 多段伤害
  multi: [
    {
      id: 'twin_strike',
      name: '双斩',
      type: 'attack',
      cost: 1,
      rarity: 'common',
      description: '造成 4 点伤害 2 次',
      tags: ['physical', 'weapon', 'blade'],
      effects: [{ type: 'damage', value: 4, times: 2 }],
    },
    {
      id: 'pummel',
      name: '连击',
      type: 'attack',
      cost: 1,
      rarity: 'uncommon',
      description: '造成 2 点伤害 4 次',
      tags: ['physical', 'melee'],
      exhaust: true,
      effects: [{ type: 'damage', value: 2, times: 4 }],
    },
  ],

  // 群体伤害
  aoe: [
    {
      id: 'cleave',
      name: '顺劈斩',
      type: 'attack',
      cost: 1,
      rarity: 'common',
      description: '对所有敌人造成 8 点伤害',
      tags: ['physical', 'weapon', 'melee'],
      effects: [{ type: 'damage', value: 8, target: 'all' }],
    },
    {
      id: 'consecrate',
      name: '奉献',
      type: 'attack',
      cost: 1,
      rarity: 'common',
      description: '对所有敌人造成 5 点伤害',
      tags: ['holy', 'light'],
      effects: [{ type: 'damage', value: 5, target: 'all' }],
    },
  ],

  // 吸血攻击
  lifesteal: [
    {
      id: 'life_drain',
      name: '生命吸取',
      type: 'attack',
      cost: 1,
      rarity: 'common',
      description: '造成 6 点伤害，恢复等量生命',
      tags: ['spell', 'dark', 'drain'],
      effects: [{ type: 'damage_lifesteal', value: 6 }],
    },
    {
      id: 'vampiric_strike',
      name: '吸血打击',
      type: 'attack',
      cost: 2,
      rarity: 'uncommon',
      description: '造成 10 点伤害，恢复 5 点生命',
      tags: ['dark', 'drain', 'shadow'],
      effects: [
        { type: 'damage', value: 10 },
        { type: 'heal', value: 5 },
      ],
    },
  ],
};

// ============================================================
// 防御卡牌
// ============================================================
const defenseCards = {
  // 基础防御卡牌
  basic: [
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
  ],

  // 高级防御卡牌
  advanced: [
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
  ],

  // 魔法防御卡牌
  magic: [
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
  ],

  // 神圣防御卡牌
  holy: [
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
  ],

  // 自然防御卡牌
  nature: [
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
  ],

  // 暗影防御卡牌
  shadow: [
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
  ]
};

// ============================================================
// 技能卡牌
// ============================================================
const skillCards = {
  // 通用技能卡牌
  universal: [
    {
      id: 'quick_draw',
      name: '快速抽牌',
      type: 'skill',
      rarity: 'common',
      cost: 1,
      tags: ['universal'],
      description: '抽2张牌',
      effect: { draw: 2 }
    },
    {
      id: 'preparation',
      name: '准备',
      type: 'skill',
      rarity: 'common',
      cost: 0,
      tags: ['universal'],
      description: '抽1张牌，获得1点能量',
      effect: { draw: 1, energy: 1 }
    },
    {
      id: 'adrenaline',
      name: '肾上腺素',
      type: 'skill',
      rarity: 'uncommon',
      cost: 0,
      tags: ['universal'],
      description: '获得2点能量，抽1张牌',
      effect: { energy: 2, draw: 1 }
    },
    {
      id: 'second_wind',
      name: '喘息',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['universal'],
      description: '恢复6点生命',
      effect: { heal: 6 }
    }
  ],

  // 物理技能卡牌
  physical: [
    {
      id: 'battle_cry',
      name: '战吼',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['physical', 'rage'],
      description: '获得2层力量',
      effect: { strength: 2 }
    },
    {
      id: 'flex',
      name: '屈伸',
      type: 'skill',
      rarity: 'common',
      cost: 0,
      tags: ['physical'],
      description: '获得2层力量（回合结束时消失）',
      effect: { tempStrength: 2 }
    },
    {
      id: 'intimidate',
      name: '威吓',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['physical'],
      description: '所有敌人获得1层虚弱',
      effect: { weakAll: 1 }
    },
    {
      id: 'shrug_it_off',
      name: '无视伤痛',
      type: 'skill',
      rarity: 'common',
      cost: 1,
      tags: ['physical', 'defense'],
      description: '获得8点护甲，抽1张牌',
      effect: { armor: 8, draw: 1 }
    },
    {
      id: 'bloodletting',
      name: '放血',
      type: 'skill',
      rarity: 'uncommon',
      cost: 0,
      tags: ['physical'],
      description: '失去3点生命，获得2点能量',
      effect: { selfDamage: 3, energy: 2 }
    }
  ],

  // 潜行技能卡牌
  stealth: [
    {
      id: 'backstab_prep',
      name: '背刺准备',
      type: 'skill',
      rarity: 'common',
      cost: 1,
      tags: ['stealth'],
      description: '获得2层潜行',
      effect: { stealth: 2 }
    },
    {
      id: 'smoke_bomb',
      name: '烟雾弹',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['stealth'],
      description: '获得3层潜行，抽1张牌',
      effect: { stealth: 3, draw: 1 }
    },
    {
      id: 'blade_dance',
      name: '刀刃之舞',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['stealth', 'physical'],
      description: '将3张小刀加入手牌',
      effect: { addCards: { id: 'shiv', count: 3 } }
    },
    {
      id: 'calculated_gamble',
      name: '精算赌博',
      type: 'skill',
      rarity: 'rare',
      cost: 0,
      tags: ['stealth'],
      description: '弃掉所有手牌，抽等量的牌',
      effect: { discardAndDraw: true }
    },
    {
      id: 'expertise',
      name: '专精',
      type: 'skill',
      rarity: 'rare',
      cost: 0,
      tags: ['stealth'],
      description: '抽牌直到手牌数为6',
      effect: { drawToHand: 6 }
    }
  ],

  // 魔法技能卡牌
  magic: [
    {
      id: 'arcane_intellect',
      name: '奥术智慧',
      type: 'skill',
      rarity: 'uncommon',
      cost: 2,
      tags: ['magic'],
      description: '抽3张牌',
      effect: { draw: 3 }
    },
    {
      id: 'mana_surge',
      name: '法力涌动',
      type: 'skill',
      rarity: 'rare',
      cost: 0,
      tags: ['magic'],
      description: '获得3点能量',
      effect: { energy: 3 }
    },
    {
      id: 'spell_focus',
      name: '法术专注',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['magic'],
      description: '下一张法术卡牌消耗减少2',
      effect: { nextSpellCostReduction: 2 }
    },
    {
      id: 'channeling',
      name: '引导',
      type: 'skill',
      rarity: 'common',
      cost: 1,
      tags: ['magic'],
      description: '获得2层聚能',
      effect: { focus: 2 }
    }
  ],

  // 神圣技能卡牌
  holy: [
    {
      id: 'prayer',
      name: '祈祷',
      type: 'skill',
      rarity: 'common',
      cost: 1,
      tags: ['holy'],
      description: '恢复5点生命，抽1张牌',
      effect: { heal: 5, draw: 1 }
    },
    {
      id: 'blessing',
      name: '祝福',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['holy'],
      description: '获得1层力量和1层敏捷',
      effect: { strength: 1, dexterity: 1 }
    },
    {
      id: 'purify',
      name: '净化',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['holy'],
      description: '移除所有负面效果',
      effect: { cleanseAll: true }
    },
    {
      id: 'divine_favor',
      name: '神恩',
      type: 'skill',
      rarity: 'rare',
      cost: 2,
      tags: ['holy'],
      description: '恢复8点生命，获得8点护甲',
      effect: { heal: 8, armor: 8 }
    }
  ],

  // 自然技能卡牌
  nature: [
    {
      id: 'wild_growth',
      name: '野性生长',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['nature'],
      description: '获得1点最大能量（仅本场战斗）',
      effect: { maxEnergy: 1 }
    },
    {
      id: 'rejuvenation',
      name: '回春术',
      type: 'skill',
      rarity: 'common',
      cost: 1,
      tags: ['nature'],
      description: '获得3层再生',
      effect: { regeneration: 3 }
    },
    {
      id: 'natures_gift',
      name: '自然之赐',
      type: 'skill',
      rarity: 'rare',
      cost: 1,
      tags: ['nature'],
      description: '抽2张牌，恢复4点生命',
      effect: { draw: 2, heal: 4 }
    },
    {
      id: 'entangle',
      name: '纠缠',
      type: 'skill',
      rarity: 'uncommon',
      cost: 2,
      tags: ['nature'],
      description: '所有敌人获得2层缠绕',
      effect: { rootAll: 2 }
    }
  ],

  // 暗影技能卡牌
  shadow: [
    {
      id: 'dark_pact',
      name: '黑暗契约',
      type: 'skill',
      rarity: 'uncommon',
      cost: 0,
      tags: ['shadow'],
      description: '失去5点生命，抽2张牌',
      effect: { selfDamage: 5, draw: 2 }
    },
    {
      id: 'soul_drain',
      name: '灵魂汲取',
      type: 'skill',
      rarity: 'rare',
      cost: 2,
      tags: ['shadow'],
      description: '对敌人造成8点伤害，恢复等量生命',
      effect: { damage: 8, lifesteal: true }
    },
    {
      id: 'shadow_step',
      name: '暗影步',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['shadow', 'stealth'],
      description: '获得2层潜行，抽1张牌',
      effect: { stealth: 2, draw: 1 }
    },
    {
      id: 'corruption',
      name: '腐蚀',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['shadow'],
      description: '敌人获得3层中毒',
      effect: { poison: 3 }
    }
  ],

  // 元素技能卡牌
  elemental: [
    {
      id: 'frost_nova',
      name: '冰霜新星',
      type: 'skill',
      rarity: 'uncommon',
      cost: 2,
      tags: ['ice', 'magic'],
      description: '所有敌人获得2层冰冻',
      effect: { freezeAll: 2 }
    },
    {
      id: 'ignite',
      name: '点燃',
      type: 'skill',
      rarity: 'common',
      cost: 1,
      tags: ['fire', 'magic'],
      description: '敌人获得4层灼烧',
      effect: { burn: 4 }
    },
    {
      id: 'static_charge',
      name: '静电充能',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['magic'],
      description: '获得3层电荷',
      effect: { lightning: 3 }
    }
  ]
};

// ============================================================
// 能力卡牌
// ============================================================
const powerCards = {
  // 物理能力卡牌
  physical: [
    {
      id: 'demon_form',
      name: '恶魔形态',
      type: 'power',
      rarity: 'rare',
      cost: 3,
      tags: ['physical', 'rage'],
      description: '每回合开始时获得2层力量',
      effect: { strengthPerTurn: 2 }
    },
    {
      id: 'inflame',
      name: '燃烧意志',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['physical', 'rage'],
      description: '获得2层力量',
      effect: { strength: 2 }
    },
    {
      id: 'metallicize',
      name: '金属化',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['physical', 'defense'],
      description: '每回合结束时获得3点护甲',
      effect: { armorPerTurnEnd: 3 }
    },
    {
      id: 'juggernaut',
      name: '势不可挡',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['physical', 'defense'],
      description: '每当获得护甲时，对随机敌人造成5点伤害',
      effect: { damageOnArmor: 5 }
    },
    {
      id: 'combust',
      name: '燃烧',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['physical', 'rage'],
      description: '每回合结束时，失去1点生命，对所有敌人造成5点伤害',
      effect: { selfDamagePerTurn: 1, damageAllPerTurn: 5 }
    },
    {
      id: 'rupture',
      name: '破裂',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['physical'],
      description: '每当你失去生命时，获得1层力量',
      effect: { strengthOnLifeLoss: 1 }
    },
    {
      id: 'feel_no_pain',
      name: '无痛',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['physical', 'defense'],
      description: '每当一张牌被消耗时，获得3点护甲',
      effect: { armorOnExhaust: 3 }
    }
  ],

  // 潜行能力卡牌
  stealth: [
    {
      id: 'infinite_blades',
      name: '无尽刀刃',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['stealth'],
      description: '每回合开始时，将1张小刀加入手牌',
      effect: { shivPerTurn: 1 }
    },
    {
      id: 'a_thousand_cuts',
      name: '千刀万剐',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['stealth'],
      description: '每当你打出一张牌，对所有敌人造成1点伤害',
      effect: { damageOnCardPlay: 1 }
    },
    {
      id: 'envenom',
      name: '淬毒',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['stealth', 'shadow'],
      description: '每当你造成无护甲伤害时，施加1层中毒',
      effect: { poisonOnUnblockedDamage: 1 }
    },
    {
      id: 'accuracy',
      name: '精准',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['stealth'],
      description: '小刀造成的伤害增加4点',
      effect: { shivDamageBonus: 4 }
    },
    {
      id: 'after_image',
      name: '残影',
      type: 'power',
      rarity: 'rare',
      cost: 1,
      tags: ['stealth'],
      description: '每当你打出一张牌，获得1点护甲',
      effect: { armorOnCardPlay: 1 }
    }
  ],

  // 魔法能力卡牌
  magic: [
    {
      id: 'loop',
      name: '循环',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['magic'],
      description: '每回合开始时，你的充能球触发一次额外效果',
      effect: { orbTriggerBonus: 1 }
    },
    {
      id: 'creative_ai',
      name: '创造性AI',
      type: 'power',
      rarity: 'rare',
      cost: 3,
      tags: ['magic'],
      description: '每回合开始时，将一张随机能力牌加入手牌',
      effect: { randomPowerPerTurn: 1 }
    },
    {
      id: 'echo_form',
      name: '回响形态',
      type: 'power',
      rarity: 'rare',
      cost: 3,
      tags: ['magic'],
      description: '每回合第一张牌打出两次',
      effect: { doubleFirstCard: true }
    },
    {
      id: 'storm',
      name: '风暴',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['magic'],
      description: '每当你打出一张能力牌，引导1个闪电球',
      effect: { lightningOrbOnPower: 1 }
    },
    {
      id: 'defragment',
      name: '碎片整理',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['magic'],
      description: '获得1层聚能',
      effect: { focus: 1 }
    },
    {
      id: 'biased_cognition',
      name: '偏执认知',
      type: 'power',
      rarity: 'rare',
      cost: 1,
      tags: ['magic'],
      description: '获得4层聚能，每回合开始时失去1层聚能',
      effect: { focus: 4, focusLossPerTurn: 1 }
    }
  ],

  // 神圣能力卡牌
  holy: [
    {
      id: 'devotion',
      name: '虔诚',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['holy'],
      description: '每回合开始时获得2层神圣',
      effect: { divinityPerTurn: 2 }
    },
    {
      id: 'establishment',
      name: '建立',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['holy'],
      description: '保留的牌费用减少1',
      effect: { retainCostReduction: 1 }
    },
    {
      id: 'like_water',
      name: '如水',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['holy'],
      description: '如果你处于平静姿态，回合结束时获得5点护甲',
      effect: { armorInCalm: 5 }
    },
    {
      id: 'mental_fortress',
      name: '心灵堡垒',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['holy'],
      description: '每当你切换姿态时，获得4点护甲',
      effect: { armorOnStanceChange: 4 }
    },
    {
      id: 'fasting',
      name: '斋戒',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['holy'],
      description: '每回合开始时获得2层力量和2层敏捷，但少获得1点能量',
      effect: { strengthPerTurn: 2, dexterityPerTurn: 2, energyReduction: 1 }
    }
  ],

  // 自然能力卡牌
  nature: [
    {
      id: 'natures_blessing',
      name: '自然祝福',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['nature'],
      description: '每回合开始时恢复2点生命',
      effect: { healPerTurn: 2 }
    },
    {
      id: 'overgrowth',
      name: '过度生长',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['nature'],
      description: '每当你恢复生命时，获得等量护甲',
      effect: { armorOnHeal: true }
    },
    {
      id: 'symbiosis',
      name: '共生',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['nature'],
      description: '每当你打出一张能力牌，抽1张牌',
      effect: { drawOnPower: 1 }
    },
    {
      id: 'photosynthesis',
      name: '光合作用',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['nature'],
      description: '每回合开始时，如果你有再生，获得1点能量',
      effect: { energyOnRegeneration: 1 }
    }
  ],

  // 暗影能力卡牌
  shadow: [
    {
      id: 'sadistic_nature',
      name: '虐待本性',
      type: 'power',
      rarity: 'rare',
      cost: 0,
      tags: ['shadow'],
      description: '每当你施加负面效果时，获得5金币',
      effect: { goldOnDebuff: 5 }
    },
    {
      id: 'nightmare',
      name: '噩梦',
      type: 'power',
      rarity: 'rare',
      cost: 3,
      tags: ['shadow'],
      description: '选择一张手牌，下回合开始时将3张该牌的复制加入手牌',
      effect: { tripleCardNextTurn: true }
    },
    {
      id: 'wraith_form',
      name: '幽灵形态',
      type: 'power',
      rarity: 'rare',
      cost: 3,
      tags: ['shadow'],
      description: '获得2层无实体，每回合开始时失去1层敏捷',
      effect: { intangible: 2, dexterityLossPerTurn: 1 }
    },
    {
      id: 'corpse_explosion',
      name: '尸体爆炸',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['shadow'],
      description: '每当敌人死亡时，对所有敌人造成其最大生命值的伤害',
      effect: { explodeOnDeath: true }
    },
    {
      id: 'the_specimen',
      name: '标本',
      type: 'power',
      rarity: 'rare',
      cost: 1,
      tags: ['shadow'],
      description: '每当敌人死亡时，将其中毒层数转移给随机敌人',
      effect: { transferPoisonOnDeath: true }
    }
  ],

  // 元素能力卡牌
  elemental: [
    {
      id: 'frozen_core',
      name: '冰冻核心',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['ice', 'magic'],
      description: '如果回合结束时没有充能球，引导1个冰霜球',
      effect: { frostOrbOnEmpty: 1 }
    },
    {
      id: 'burning_blood',
      name: '燃烧之血',
      type: 'power',
      rarity: 'uncommon',
      cost: 1,
      tags: ['fire'],
      description: '战斗结束时恢复6点生命',
      effect: { healOnCombatEnd: 6 }
    },
    {
      id: 'electrodynamics',
      name: '电动力学',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['magic'],
      description: '闪电球现在攻击所有敌人，引导1个闪电球',
      effect: { lightningHitsAll: true, channelLightning: 1 }
    }
  ]
};

// ============================================================
// 状态卡牌
// ============================================================
const statusCards = {
  // 负面状态卡牌
  negative: [
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
    }
  ],

  // 诅咒卡牌
  curse: [
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
  ],

  // 临时生成的卡牌
  generated: [
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
      id: 'smite_generated',
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
  ],

  // 特殊机制卡牌
  special: [
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
  ]
};

// ============================================================
// 职业专属卡牌
// ============================================================
const exclusiveCards = {
  // 战士专属卡牌
  warrior: [
    {
      id: 'warriors_resolve',
      name: '战士的决心',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['physical', 'defense'],
      exclusiveTo: ['warrior'],
      description: '每当你的护甲被打破时，获得2层力量',
      effect: { strengthOnArmorBreak: 2 }
    },
    {
      id: 'shield_wall',
      name: '盾墙',
      type: 'skill',
      rarity: 'uncommon',
      cost: 3,
      tags: ['physical', 'defense'],
      exclusiveTo: ['warrior'],
      description: '获得20点护甲，下回合护甲不消失',
      effect: { armor: 20, retainArmor: true }
    }
  ],

  // 狂战士专属卡牌
  barbarian: [
    {
      id: 'berserker_rage',
      name: '狂战士之怒',
      type: 'power',
      rarity: 'rare',
      cost: 1,
      tags: ['physical', 'rage'],
      exclusiveTo: ['barbarian'],
      description: '每当你失去生命时，获得2层力量',
      effect: { strengthOnLifeLoss: 2 }
    },
    {
      id: 'reckless_charge',
      name: '鲁莽冲锋',
      type: 'attack',
      rarity: 'uncommon',
      cost: 0,
      tags: ['physical', 'rage'],
      exclusiveTo: ['barbarian'],
      description: '造成8点伤害，将一张眩晕加入抽牌堆',
      effect: { damage: 8, addDazedToDrawPile: 1 }
    },
    {
      id: 'bloodbath',
      name: '血浴',
      type: 'attack',
      rarity: 'rare',
      cost: 2,
      tags: ['physical', 'rage'],
      exclusiveTo: ['barbarian'],
      description: '造成20点伤害，失去5点生命',
      effect: { damage: 20, selfDamage: 5 }
    }
  ],

  // 剑圣专属卡牌
  swordmaster: [
    {
      id: 'blade_mastery',
      name: '剑术精通',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['physical'],
      exclusiveTo: ['swordmaster'],
      description: '攻击牌造成的伤害增加25%',
      effect: { attackDamageBonus: 0.25 }
    },
    {
      id: 'perfect_strike',
      name: '完美一击',
      type: 'attack',
      rarity: 'uncommon',
      cost: 2,
      tags: ['physical'],
      exclusiveTo: ['swordmaster'],
      description: '造成6点伤害×牌组中"打击"类卡牌数量',
      effect: { damagePerStrike: 6 }
    },
    {
      id: 'flurry',
      name: '疾风连斩',
      type: 'attack',
      rarity: 'rare',
      cost: 1,
      tags: ['physical'],
      exclusiveTo: ['swordmaster'],
      description: '造成4点伤害4次',
      effect: { damage: 4, times: 4 }
    }
  ],

  // 盗贼专属卡牌
  rogue: [
    {
      id: 'assassinate',
      name: '暗杀',
      type: 'attack',
      rarity: 'rare',
      cost: 2,
      tags: ['stealth', 'physical'],
      exclusiveTo: ['rogue'],
      description: '造成20点伤害，如果处于潜行状态，伤害翻倍',
      effect: { damage: 20, doubleIfStealth: true }
    },
    {
      id: 'pickpocket',
      name: '扒窃',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['stealth'],
      exclusiveTo: ['rogue'],
      description: '抽2张牌，获得10金币',
      effect: { draw: 2, gold: 10 }
    },
    {
      id: 'evasion',
      name: '闪避',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['stealth'],
      exclusiveTo: ['rogue'],
      description: '获得3层潜行',
      effect: { stealth: 3 }
    }
  ],

  // 游侠专属卡牌
  ranger: [
    {
      id: 'multishot',
      name: '多重射击',
      type: 'attack',
      rarity: 'uncommon',
      cost: 2,
      tags: ['physical'],
      exclusiveTo: ['ranger'],
      description: '对所有敌人造成8点伤害',
      effect: { damageAll: 8 }
    },
    {
      id: 'hunters_mark',
      name: '猎人印记',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['physical'],
      exclusiveTo: ['ranger'],
      description: '敌人获得3层易伤',
      effect: { vulnerable: 3 }
    },
    {
      id: 'snipe',
      name: '狙击',
      type: 'attack',
      rarity: 'rare',
      cost: 3,
      tags: ['physical'],
      exclusiveTo: ['ranger'],
      description: '造成30点伤害',
      effect: { damage: 30 }
    }
  ],

  // 武僧专属卡牌
  monk: [
    {
      id: 'inner_peace',
      name: '内心平静',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['holy'],
      exclusiveTo: ['monk'],
      description: '进入平静姿态，抽2张牌',
      effect: { enterCalm: true, draw: 2 }
    },
    {
      id: 'flurry_of_blows',
      name: '连环拳',
      type: 'attack',
      rarity: 'common',
      cost: 0,
      tags: ['physical'],
      exclusiveTo: ['monk'],
      description: '造成4点伤害，每当你切换姿态时，将此牌从弃牌堆加入手牌',
      effect: { damage: 4, returnOnStanceChange: true }
    },
    {
      id: 'tantrum',
      name: '暴怒',
      type: 'attack',
      rarity: 'uncommon',
      cost: 1,
      tags: ['rage'],
      exclusiveTo: ['monk'],
      description: '造成3点伤害3次，进入愤怒姿态',
      effect: { damage: 3, times: 3, enterWrath: true }
    }
  ],

  // 法师专属卡牌
  mage: [
    {
      id: 'arcane_mastery',
      name: '奥术精通',
      type: 'power',
      rarity: 'rare',
      cost: 3,
      tags: ['magic'],
      exclusiveTo: ['mage'],
      description: '每回合开始时，将一张随机法术牌加入手牌',
      effect: { randomSpellPerTurn: 1 }
    },
    {
      id: 'meteor',
      name: '陨石术',
      type: 'attack',
      rarity: 'rare',
      cost: 5,
      tags: ['magic', 'fire'],
      exclusiveTo: ['mage'],
      description: '对所有敌人造成30点伤害',
      effect: { damageAll: 30 }
    },
    {
      id: 'time_warp',
      name: '时间扭曲',
      type: 'skill',
      rarity: 'rare',
      cost: 2,
      tags: ['magic'],
      exclusiveTo: ['mage'],
      description: '获得额外一个回合',
      effect: { extraTurn: true }
    }
  ],

  // 术士专属卡牌
  warlock: [
    {
      id: 'life_tap',
      name: '生命分流',
      type: 'skill',
      rarity: 'uncommon',
      cost: 0,
      tags: ['shadow'],
      exclusiveTo: ['warlock'],
      description: '失去3点生命，抽2张牌',
      effect: { selfDamage: 3, draw: 2 }
    },
    {
      id: 'demonic_pact',
      name: '恶魔契约',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['shadow'],
      exclusiveTo: ['warlock'],
      description: '每回合开始时失去2点生命，获得2点能量',
      effect: { selfDamagePerTurn: 2, energyPerTurn: 2 }
    },
    {
      id: 'hellfire',
      name: '地狱火',
      type: 'attack',
      rarity: 'rare',
      cost: 2,
      tags: ['shadow', 'fire'],
      exclusiveTo: ['warlock'],
      description: '对所有敌人造成15点伤害，对自己造成5点伤害',
      effect: { damageAll: 15, selfDamage: 5 }
    }
  ],

  // 巫师专属卡牌
  sorcerer: [
    {
      id: 'wild_magic',
      name: '狂野魔法',
      type: 'skill',
      rarity: 'rare',
      cost: 1,
      tags: ['magic'],
      exclusiveTo: ['sorcerer'],
      description: '触发一个随机效果',
      effect: { randomEffect: true }
    },
    {
      id: 'chaos_bolt',
      name: '混沌箭',
      type: 'attack',
      rarity: 'uncommon',
      cost: 1,
      tags: ['magic'],
      exclusiveTo: ['sorcerer'],
      description: '造成8-16点随机伤害',
      effect: { randomDamage: { min: 8, max: 16 } }
    },
    {
      id: 'metamagic',
      name: '超魔',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['magic'],
      exclusiveTo: ['sorcerer'],
      description: '法术牌费用减少1',
      effect: { spellCostReduction: 1 }
    }
  ],

  // 牧师专属卡牌
  priest: [
    {
      id: 'mass_heal',
      name: '群体治疗',
      type: 'skill',
      rarity: 'rare',
      cost: 3,
      tags: ['holy'],
      exclusiveTo: ['priest'],
      description: '恢复15点生命',
      effect: { heal: 15 }
    },
    {
      id: 'holy_nova',
      name: '神圣新星',
      type: 'skill',
      rarity: 'uncommon',
      cost: 2,
      tags: ['holy'],
      exclusiveTo: ['priest'],
      description: '对所有敌人造成8点伤害，恢复8点生命',
      effect: { damageAll: 8, heal: 8 }
    },
    {
      id: 'resurrection',
      name: '复活',
      type: 'power',
      rarity: 'rare',
      cost: 3,
      tags: ['holy'],
      exclusiveTo: ['priest'],
      description: '当你的生命值降至0时，恢复至50%生命（每场战斗一次）',
      effect: { revive: 0.5 }
    }
  ],

  // 圣骑士专属卡牌
  paladin: [
    {
      id: 'divine_shield',
      name: '圣盾术',
      type: 'skill',
      rarity: 'rare',
      cost: 2,
      tags: ['holy', 'defense'],
      exclusiveTo: ['paladin'],
      description: '获得1层无敌（免疫下一次伤害）',
      effect: { invincible: 1 }
    },
    {
      id: 'consecration',
      name: '奉献',
      type: 'attack',
      rarity: 'uncommon',
      cost: 2,
      tags: ['holy'],
      exclusiveTo: ['paladin'],
      description: '对所有敌人造成10点伤害，获得10点护甲',
      effect: { damageAll: 10, armor: 10 }
    },
    {
      id: 'lay_on_hands',
      name: '圣疗术',
      type: 'skill',
      rarity: 'rare',
      cost: 4,
      tags: ['holy'],
      exclusiveTo: ['paladin'],
      description: '恢复全部生命值',
      effect: { fullHeal: true }
    }
  ],

  // 德鲁伊专属卡牌
  druid: [
    {
      id: 'wild_shape',
      name: '野性变形',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['nature'],
      exclusiveTo: ['druid'],
      description: '变形为熊形态，获得10点护甲和2层力量',
      effect: { armor: 10, strength: 2, transform: 'bear' }
    },
    {
      id: 'moonfire',
      name: '月火术',
      type: 'attack',
      rarity: 'common',
      cost: 0,
      tags: ['nature', 'magic'],
      exclusiveTo: ['druid'],
      description: '造成5点伤害',
      effect: { damage: 5 }
    },
    {
      id: 'tranquility',
      name: '宁静',
      type: 'skill',
      rarity: 'rare',
      cost: 3,
      tags: ['nature'],
      exclusiveTo: ['druid'],
      description: '获得5层再生',
      effect: { regeneration: 5 }
    }
  ],

  // 萨满专属卡牌
  shaman: [
    {
      id: 'lightning_bolt',
      name: '闪电箭',
      type: 'attack',
      rarity: 'common',
      cost: 1,
      tags: ['magic', 'nature'],
      exclusiveTo: ['shaman'],
      description: '造成10点伤害',
      effect: { damage: 10 }
    },
    {
      id: 'totemic_might',
      name: '图腾之力',
      type: 'power',
      rarity: 'uncommon',
      cost: 2,
      tags: ['nature'],
      exclusiveTo: ['shaman'],
      description: '召唤一个图腾，每回合提供随机增益',
      effect: { summonTotem: true }
    },
    {
      id: 'chain_lightning',
      name: '闪电链',
      type: 'attack',
      rarity: 'rare',
      cost: 2,
      tags: ['magic', 'nature'],
      exclusiveTo: ['shaman'],
      description: '对敌人造成12点伤害，对其他敌人造成6点伤害',
      effect: { damage: 12, chainDamage: 6 }
    }
  ],

  // 魔剑士专属卡牌
  spellblade: [
    {
      id: 'arcane_blade',
      name: '奥术之刃',
      type: 'attack',
      rarity: 'uncommon',
      cost: 1,
      tags: ['physical', 'magic'],
      exclusiveTo: ['spellblade'],
      description: '造成8点伤害，获得4点护甲',
      effect: { damage: 8, armor: 4 }
    },
    {
      id: 'spell_strike',
      name: '法术打击',
      type: 'attack',
      rarity: 'rare',
      cost: 2,
      tags: ['physical', 'magic'],
      exclusiveTo: ['spellblade'],
      description: '造成12点伤害，抽1张牌',
      effect: { damage: 12, draw: 1 }
    },
    {
      id: 'blade_ward',
      name: '剑刃结界',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['physical', 'magic', 'defense'],
      exclusiveTo: ['spellblade'],
      description: '每当你打出攻击牌时，获得3点护甲',
      effect: { armorOnAttack: 3 }
    }
  ],

  // 暗影骑士专属卡牌
  shadowKnight: [
    {
      id: 'death_coil',
      name: '死亡缠绕',
      type: 'attack',
      rarity: 'uncommon',
      cost: 1,
      tags: ['shadow'],
      exclusiveTo: ['shadowKnight'],
      description: '造成10点伤害，恢复5点生命',
      effect: { damage: 10, heal: 5 }
    },
    {
      id: 'dark_presence',
      name: '黑暗存在',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['shadow', 'defense'],
      exclusiveTo: ['shadowKnight'],
      description: '每回合开始时获得5点护甲，敌人获得1层虚弱',
      effect: { armorPerTurn: 5, weakAllPerTurn: 1 }
    },
    {
      id: 'soul_reaper',
      name: '灵魂收割',
      type: 'attack',
      rarity: 'rare',
      cost: 3,
      tags: ['shadow'],
      exclusiveTo: ['shadowKnight'],
      description: '造成25点伤害，如果击杀敌人，恢复全部生命',
      effect: { damage: 25, fullHealOnKill: true }
    }
  ],

  // 战斗法师专属卡牌
  battlemage: [
    {
      id: 'arcane_armor',
      name: '奥术护甲',
      type: 'skill',
      rarity: 'uncommon',
      cost: 1,
      tags: ['magic', 'defense'],
      exclusiveTo: ['battlemage'],
      description: '获得8点护甲，获得1点能量',
      effect: { armor: 8, energy: 1 }
    },
    {
      id: 'battle_trance',
      name: '战斗恍惚',
      type: 'power',
      rarity: 'rare',
      cost: 2,
      tags: ['physical', 'magic'],
      exclusiveTo: ['battlemage'],
      description: '每当你打出技能牌时，获得1层力量',
      effect: { strengthOnSkill: 1 }
    },
    {
      id: 'elemental_fury',
      name: '元素狂怒',
      type: 'attack',
      rarity: 'rare',
      cost: 3,
      tags: ['magic', 'fire', 'ice'],
      exclusiveTo: ['battlemage'],
      description: '造成15点伤害，敌人获得2层灼烧和2层冰冻',
      effect: { damage: 15, burn: 2, freeze: 2 }
    }
  ]
};

// ============================================================
// CardDatabase 对象
// ============================================================
const CardDatabase = {
  meta: CardMeta,
  tagGroups: TagGroups,
  professions: Professions,
  cards: {
    basic: basicCards,
    attack: attackCards,
    defense: defenseCards,
    skill: skillCards,
    power: powerCards,
    status: statusCards,
    exclusive: exclusiveCards,
  },

  /**
   * 获取职业的所有可用标签
   */
  getProfessionTags(professionId) {
    const profession = this.professions[professionId];
    if (!profession) return new Set();

    const tags = new Set(profession.extraTags || []);
    (profession.inherits || []).forEach(groupName => {
      const groupTags = this.tagGroups[groupName] || [];
      groupTags.forEach(tag => tags.add(tag));
    });

    return tags;
  },

  /**
   * 判断职业是否可以使用某张卡牌
   */
  canProfessionUseCard(professionId, card) {
    const profession = this.professions[professionId];
    if (!profession) return false;

    // 检查卡牌是否专属于其他职业
    if (card.exclusiveTo && !card.exclusiveTo.includes(professionId)) {
      return false;
    }

    // 获取职业的所有可用标签
    const profTags = this.getProfessionTags(professionId);

    // 检查卡牌标签是否与职业标签有交集
    return (card.tags || []).some(tag => profTags.has(tag));
  },

  /**
   * 获取职业可用的所有卡牌
   */
  getCardsForProfession(professionId, rarity = null) {
    const availableCards = [];

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
   */
  getStarterDeck(professionId) {
    const profession = this.professions[professionId];
    if (!profession || !profession.starterDeck) return [];

    return profession.starterDeck.map(cardId => this.getCardById(cardId)).filter(card => card !== null);
  },

  /**
   * 获取所有卡牌（扁平化数组）
   */
  getAllCards() {
    const allCards = [];
    const traverseCards = (obj) => {
      if (Array.isArray(obj)) {
        allCards.push(...obj);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(value => traverseCards(value));
      }
    };
    traverseCards(this.cards);
    return allCards;
  },

  /**
   * 按稀有度获取卡牌
   */
  getCardsByRarity(rarity) {
    return this.getAllCards().filter(card => card.rarity === rarity);
  },

  /**
   * 按类型获取卡牌
   */
  getCardsByType(type) {
    return this.getAllCards().filter(card => card.type === type);
  },

  /**
   * 注册新的卡牌集合
   */
  registerCollection(collectionName, cards) {
    if (this.cards[collectionName]) {
      console.warn(`CardDatabase: 集合 "${collectionName}" 已存在，将被覆盖`);
    }
    this.cards[collectionName] = cards;
    console.log(`CardDatabase: 已注册卡牌集合 "${collectionName}"`);
  },
};

// 导出到全局
window.CardDatabase = CardDatabase;
window.CardMeta = CardMeta;
window.TagGroups = TagGroups;
window.Professions = Professions;

// 为了向后兼容，也导出扁平化的卡牌数组
window.AllCards = CardDatabase.getAllCards();

console.log('CardDatabase 已加载（兼容层）- 共 ' + window.AllCards.length + ' 张卡牌');
