/**
 * 能力卡牌集合
 * Power Cards Collection
 * 能力卡牌在战斗中持续生效，通常提供被动效果
 */

// 物理能力卡牌
export const physicalPowerCards = [
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
];

// 潜行能力卡牌
export const stealthPowerCards = [
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
];

// 魔法能力卡牌
export const magicPowerCards = [
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
];

// 神圣能力卡牌
export const holyPowerCards = [
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
];

// 自然能力卡牌
export const naturePowerCards = [
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
];

// 暗影能力卡牌
export const shadowPowerCards = [
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
];

// 元素能力卡牌
export const elementalPowerCards = [
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
];

// 导出所有能力卡牌
export const powerCards = [
  ...physicalPowerCards,
  ...stealthPowerCards,
  ...magicPowerCards,
  ...holyPowerCards,
  ...naturePowerCards,
  ...shadowPowerCards,
  ...elementalPowerCards
];

export default powerCards;
