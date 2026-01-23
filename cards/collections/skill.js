/**
 * 技能卡牌集合
 * Skill Cards Collection
 */

// 通用技能卡牌
export const universalSkillCards = [
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
];

// 物理技能卡牌
export const physicalSkillCards = [
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
];

// 潜行技能卡牌
export const stealthSkillCards = [
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
];

// 魔法技能卡牌
export const magicSkillCards = [
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
];

// 神圣技能卡牌
export const holySkillCards = [
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
];

// 自然技能卡牌
export const natureSkillCards = [
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
];

// 暗影技能卡牌
export const shadowSkillCards = [
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
];

// 元素技能卡牌
export const elementalSkillCards = [
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
];

// 导出所有技能卡牌
export const skillCards = [
  ...universalSkillCards,
  ...physicalSkillCards,
  ...stealthSkillCards,
  ...magicSkillCards,
  ...holySkillCards,
  ...natureSkillCards,
  ...shadowSkillCards,
  ...elementalSkillCards
];

export default skillCards;
