/**
 * 职业专属卡牌集合
 * Exclusive Cards Collection
 * 这些卡牌只能被特定职业使用
 */

// 战士专属卡牌
export const warriorExclusiveCards = [
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
];

// 狂战士专属卡牌
export const barbarianExclusiveCards = [
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
];

// 剑圣专属卡牌
export const swordmasterExclusiveCards = [
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
];

// 盗贼专属卡牌
export const rogueExclusiveCards = [
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
];

// 游侠专属卡牌
export const rangerExclusiveCards = [
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
];

// 武僧专属卡牌
export const monkExclusiveCards = [
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
];

// 法师专属卡牌
export const mageExclusiveCards = [
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
];

// 术士专属卡牌
export const warlockExclusiveCards = [
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
];

// 巫师专属卡牌
export const sorcererExclusiveCards = [
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
];

// 牧师专属卡牌
export const priestExclusiveCards = [
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
];

// 圣骑士专属卡牌
export const paladinExclusiveCards = [
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
];

// 德鲁伊专属卡牌
export const druidExclusiveCards = [
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
];

// 萨满专属卡牌
export const shamanExclusiveCards = [
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
];

// 魔剑士专属卡牌
export const spellbladeExclusiveCards = [
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
];

// 暗影骑士专属卡牌
export const shadowKnightExclusiveCards = [
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
];

// 战斗法师专属卡牌
export const battlemageExclusiveCards = [
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
];

// 导出所有职业专属卡牌
export const exclusiveCards = [
  ...warriorExclusiveCards,
  ...barbarianExclusiveCards,
  ...swordmasterExclusiveCards,
  ...rogueExclusiveCards,
  ...rangerExclusiveCards,
  ...monkExclusiveCards,
  ...mageExclusiveCards,
  ...warlockExclusiveCards,
  ...sorcererExclusiveCards,
  ...priestExclusiveCards,
  ...paladinExclusiveCards,
  ...druidExclusiveCards,
  ...shamanExclusiveCards,
  ...spellbladeExclusiveCards,
  ...shadowKnightExclusiveCards,
  ...battlemageExclusiveCards
];

export default exclusiveCards;
