/* ============================================================
 * 职业定义
 * 包含所有职业的配置信息
 * ============================================================ */

export const Professions = {
  // --- 物理职业 ---
  warrior: {
    id: 'warrior',
    name: '战士',
    description: '力量与防御的平衡型职业',
    inherits: ['physical', 'defense'],
    extraTags: ['universal'],
    exclusiveCards: ['battle_cry', 'shield_bash'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash'],
  },
  barbarian: {
    id: 'barbarian',
    name: '野蛮人',
    description: '狂暴战斗风格，高伤害但防御较弱',
    inherits: ['physical', 'rage'],
    extraTags: ['universal'],
    exclusiveCards: ['berserker_rage', 'blood_fury'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'rage_strike'],
  },
  swordmaster: {
    id: 'swordmaster',
    name: '剑圣',
    description: '精准打击与连续攻击的大师',
    inherits: ['physical', 'stealth'],
    extraTags: ['universal', 'blade'],
    exclusiveCards: ['perfect_strike', 'blade_dance'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'quick_slash'],
  },

  // --- 敏捷职业 ---
  rogue: {
    id: 'rogue',
    name: '盗贼',
    description: '擅长毒素、欺诈和暗杀',
    inherits: ['stealth', 'shadow'],
    extraTags: ['universal'],
    exclusiveCards: ['backstab', 'smoke_bomb'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'neutralize'],
  },
  ranger: {
    id: 'ranger',
    name: '游侠',
    description: '远程攻击与自然之力的结合',
    inherits: ['stealth', 'nature'],
    extraTags: ['universal', 'ranged'],
    exclusiveCards: ['multishot', 'hunters_mark'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'aimed_shot'],
  },
  monk: {
    id: 'monk',
    name: '武僧',
    description: '内功与拳脚的完美结合',
    inherits: ['physical', 'holy'],
    extraTags: ['universal', 'chi'],
    exclusiveCards: ['inner_peace', 'flurry_of_blows'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'palm_strike'],
  },

  // --- 魔法职业 ---
  mage: {
    id: 'mage',
    name: '魔法师',
    description: '元素魔法的大师',
    inherits: ['magic', 'fire', 'ice', 'lightning'],
    extraTags: ['universal'],
    exclusiveCards: ['arcane_intellect', 'mana_surge'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'fireball', 'frost_bolt'],
  },
  warlock: {
    id: 'warlock',
    name: '术士',
    description: '黑暗魔法与诅咒的使用者',
    inherits: ['magic', 'shadow', 'fire'],
    extraTags: ['universal', 'demon'],
    exclusiveCards: ['soul_tap', 'demonic_pact'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'shadow_bolt', 'life_drain'],
  },
  sorcerer: {
    id: 'sorcerer',
    name: '巫师',
    description: '原始魔力的操控者',
    inherits: ['magic', 'lightning'],
    extraTags: ['universal', 'chaos'],
    exclusiveCards: ['wild_magic', 'chaos_bolt'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'arcane_missile', 'energy_shield'],
  },

  // --- 神圣职业 ---
  priest: {
    id: 'priest',
    name: '牧师',
    description: '神圣治疗与祝福的使者',
    inherits: ['holy', 'magic'],
    extraTags: ['universal'],
    exclusiveCards: ['divine_intervention', 'mass_heal'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'heal', 'smite'],
  },
  paladin: {
    id: 'paladin',
    name: '圣骑士',
    description: '神圣与武力的结合',
    inherits: ['physical', 'holy', 'defense'],
    extraTags: ['universal'],
    exclusiveCards: ['divine_shield', 'holy_strike'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'holy_light', 'consecrate'],
  },

  // --- 自然职业 ---
  druid: {
    id: 'druid',
    name: '德鲁伊',
    description: '自然之力与变形术的掌控者',
    inherits: ['nature', 'magic'],
    extraTags: ['universal', 'shapeshift'],
    exclusiveCards: ['wild_growth', 'bear_form'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'wrath', 'rejuvenation'],
  },
  shaman: {
    id: 'shaman',
    name: '萨满',
    description: '元素与图腾的召唤者',
    inherits: ['nature', 'fire', 'lightning'],
    extraTags: ['universal', 'totem'],
    exclusiveCards: ['totemic_call', 'elemental_mastery'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'lightning_bolt', 'earth_shock'],
  },

  // --- 混合职业 ---
  spellblade: {
    id: 'spellblade',
    name: '魔剑士',
    description: '剑术与魔法的完美融合',
    inherits: ['physical', 'magic'],
    extraTags: ['universal', 'spellblade'],
    exclusiveCards: ['arcane_blade', 'spell_strike', 'mana_slash'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'enchanted_strike', 'arcane_shield'],
  },
  shadowKnight: {
    id: 'shadowKnight',
    name: '暗黑骑士',
    description: '黑暗力量与武技的结合',
    inherits: ['physical', 'shadow', 'defense'],
    extraTags: ['universal', 'deathknight'],
    exclusiveCards: ['death_coil', 'dark_presence'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'shadow_strike', 'bone_armor'],
  },
  battlemage: {
    id: 'battlemage',
    name: '战斗法师',
    description: '近战与法术的双重威胁',
    inherits: ['physical', 'magic', 'fire'],
    extraTags: ['universal'],
    exclusiveCards: ['flame_blade', 'arcane_armor'],
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'fire_punch', 'mage_armor'],
  },
};
