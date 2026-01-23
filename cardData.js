/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 卡牌数据库 - 双向绑定 + 继承系统
 * 灵感来源：杀戮尖塔 (Slay the Spire)
 * ============================================================
 * 
 * 架构说明：
 * 1. tagGroups - 标签组定义，可被职业继承
 * 2. professions - 职业定义，包含继承的标签组和专属卡
 * 3. cards - 卡牌数据，按功能分类存储
 * 
 * 职业可用卡牌判断逻辑：
 * - 职业继承标签组 → 获得该组所有标签
 * - 卡牌标签与职业标签有交集 → 可用
 * - 卡牌在职业exclusiveCards中 → 可用
 * - 卡牌exclusiveTo不包含该职业 → 不可用
 * 
 * ============================================================ */

const CardDatabase = {
  // ============================================================
  // 元数据定义
  // ============================================================
  meta: {
    // 稀有度定义
    rarities: {
      basic: { name: '基础', color: '#808080', weight: 0, dropRate: 0 },
      common: { name: '普通', color: '#FFFFFF', weight: 50, dropRate: 0.55 },
      uncommon: { name: '稀有', color: '#4169E1', weight: 30, dropRate: 0.30 },
      rare: { name: '史诗', color: '#FFD700', weight: 15, dropRate: 0.12 },
      legendary: { name: '传奇', color: '#FF8C00', weight: 5, dropRate: 0.03 },
    },
    // 卡牌类型定义
    types: {
      attack: { name: '攻击', color: '#FF6B6B' },
      skill: { name: '技能', color: '#4ECDC4' },
      power: { name: '能力', color: '#FFE66D' },
      status: { name: '状态', color: '#95A5A6' },
      curse: { name: '诅咒', color: '#8B0000' },
    },
  },

  // ============================================================
  // 标签组定义 - 可被职业继承
  // ============================================================
  tagGroups: {
    // 物理系
    physical: ['weapon', 'armor', 'strength', 'melee', 'physical'],
    // 魔法系
    magic: ['spell', 'arcane', 'mana', 'magic'],
    // 元素系
    fire: ['fire', 'burn'],
    ice: ['ice', 'frost', 'freeze'],
    lightning: ['lightning', 'shock'],
    // 暗影系
    shadow: ['dark', 'curse', 'drain', 'shadow'],
    // 神圣系
    holy: ['light', 'heal', 'blessing', 'holy'],
    // 自然系
    nature: ['beast', 'plant', 'wild', 'nature'],
    // 隐匿系
    stealth: ['poison', 'trap', 'agility', 'stealth'],
    // 狂暴系
    rage: ['berserk', 'fury', 'rage'],
    // 防御系
    defense: ['block', 'shield', 'fortify', 'defense'],
  },

  // ============================================================
  // 职业定义
  // ============================================================
  professions: {
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
  },

  // ============================================================
  // 卡牌数据 - 按功能分类
  // ============================================================
  cards: {
    // --------------------------------------------------------
    // 攻击牌
    // --------------------------------------------------------
    attack: {
      // 单体伤害
      single: [
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
          id: 'anger',
          name: '愤怒',
          type: 'attack',
          cost: 0,
          rarity: 'common',
          description: '造成 6 点伤害，将此牌的复制加入弃牌堆',
          tags: ['physical', 'rage'],
          effects: [
            { type: 'damage', value: 6 },
            { type: 'copy_to_discard' },
          ],
        },
        {
          id: 'body_slam',
          name: '躯体撞击',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '造成等同于你当前格挡的伤害',
          tags: ['physical', 'defense'],
          effects: [{ type: 'damage_from_block' }],
        },
        {
          id: 'uppercut',
          name: '上勾拳',
          type: 'attack',
          cost: 2,
          rarity: 'uncommon',
          description: '造成 13 点伤害，施加 1 层虚弱和 1 层易伤',
          tags: ['physical', 'melee'],
          effects: [
            { type: 'damage', value: 13 },
            { type: 'status', status: 'weak', value: 1 },
            { type: 'status', status: 'vulnerable', value: 1 },
          ],
        },
        {
          id: 'carnage',
          name: '大屠杀',
          type: 'attack',
          cost: 2,
          rarity: 'uncommon',
          description: '虚无。造成 20 点伤害',
          tags: ['physical', 'rage'],
          ethereal: true,
          effects: [{ type: 'damage', value: 20 }],
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
        {
          id: 'wild_strike',
          name: '狂野打击',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '造成 12 点伤害，将 1 张伤口加入抽牌堆',
          tags: ['physical', 'rage'],
          effects: [
            { type: 'damage', value: 12 },
            { type: 'add_card', card: 'wound', to: 'draw' },
          ],
        },
        {
          id: 'reckless_charge',
          name: '鲁莽冲锋',
          type: 'attack',
          cost: 0,
          rarity: 'common',
          description: '造成 7 点伤害，将 1 张眩晕加入抽牌堆',
          tags: ['physical', 'melee'],
          effects: [
            { type: 'damage', value: 7 },
            { type: 'add_card', card: 'dazed', to: 'draw' },
          ],
        },
        {
          id: 'perfected_strike',
          name: '完美打击',
          type: 'attack',
          cost: 2,
          rarity: 'common',
          description: '造成 6 点伤害，卡组中每有 1 张"打击"类卡牌伤害+2',
          tags: ['physical', 'weapon'],
          effects: [{ type: 'damage_per_strike', value: 6, bonus: 2 }],
        },
        {
          id: 'thunderclap',
          name: '雷鸣',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '对所有敌人造成 4 点伤害，施加 1 层易伤',
          tags: ['physical', 'lightning'],
          effects: [
            { type: 'damage', value: 4, target: 'all' },
            { type: 'status', status: 'vulnerable', value: 1, target: 'all' },
          ],
        },
        // 魔法单体攻击
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
          id: 'lightning_bolt',
          name: '闪电箭',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '造成 8 点伤害，有 25% 几率再造成 8 点伤害',
          tags: ['spell', 'lightning', 'shock'],
          effects: [
            { type: 'damage', value: 8 },
            { type: 'chance_damage', value: 8, chance: 0.25 },
          ],
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
          id: 'wrath',
          name: '愤怒',
          type: 'attack',
          cost: 0,
          rarity: 'common',
          description: '造成 5 点伤害',
          tags: ['spell', 'nature'],
          effects: [{ type: 'damage', value: 5 }],
        },
        {
          id: 'arcane_missile',
          name: '奥术飞弹',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '造成 4 点伤害 3 次（随机目标）',
          tags: ['spell', 'arcane', 'magic'],
          effects: [{ type: 'damage', value: 4, times: 3, random: true }],
        },
        {
          id: 'pyroblast',
          name: '炎爆术',
          type: 'attack',
          cost: 4,
          rarity: 'rare',
          description: '造成 25 点伤害，施加 5 层灼烧',
          tags: ['spell', 'fire'],
          effects: [
            { type: 'damage', value: 25 },
            { type: 'status', status: 'burn', value: 5 },
          ],
        },
      ],

      // 多段伤害/连击
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
          id: 'sword_boomerang',
          name: '回旋剑',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '随机造成 3 点伤害 3 次',
          tags: ['physical', 'weapon'],
          effects: [{ type: 'damage', value: 3, times: 3, random: true }],
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
        {
          id: 'flurry_of_blows',
          name: '疾风连击',
          type: 'attack',
          cost: 0,
          rarity: 'uncommon',
          description: '造成 4 点伤害，每打出 1 张牌时自动打出此牌',
          tags: ['chi'],
          exclusiveTo: ['monk'],
          effects: [{ type: 'damage', value: 4 }],
          trigger: 'on_card_play',
        },
        {
          id: 'multishot',
          name: '多重射击',
          type: 'attack',
          cost: 2,
          rarity: 'uncommon',
          description: '造成 6 点伤害 3 次',
          tags: ['ranged'],
          exclusiveTo: ['ranger'],
          effects: [{ type: 'damage', value: 6, times: 3 }],
        },
        {
          id: 'glass_knife',
          name: '玻璃刀',
          type: 'attack',
          cost: 1,
          rarity: 'rare',
          description: '造成 8 点伤害 2 次，此牌本场战斗伤害-2',
          tags: ['stealth', 'agility'],
          effects: [
            { type: 'damage', value: 8, times: 2 },
            { type: 'permanent_downgrade', stat: 'damage', value: 2 },
          ],
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
          id: 'whirlwind',
          name: '旋风斩',
          type: 'attack',
          cost: 'X',
          rarity: 'uncommon',
          description: '对所有敌人造成 5 点伤害 X 次',
          tags: ['physical', 'weapon'],
          effects: [{ type: 'damage', value: 5, times: 'X', target: 'all' }],
        },
        {
          id: 'immolate',
          name: '献祭',
          type: 'attack',
          cost: 2,
          rarity: 'rare',
          description: '对所有敌人造成 21 点伤害，将 1 张灼伤加入弃牌堆',
          tags: ['fire', 'spell'],
          effects: [
            { type: 'damage', value: 21, target: 'all' },
            { type: 'add_card', card: 'burn', to: 'discard' },
          ],
        },
        {
          id: 'dagger_spray',
          name: '飞刀',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '对所有敌人造成 4 点伤害 2 次',
          tags: ['stealth', 'agility'],
          effects: [{ type: 'damage', value: 4, times: 2, target: 'all' }],
        },
        {
          id: 'blizzard',
          name: '暴风雪',
          type: 'attack',
          cost: 3,
          rarity: 'rare',
          description: '对所有敌人造成 12 点伤害，施加 2 层冰冻',
          tags: ['spell', 'ice', 'frost'],
          effects: [
            { type: 'damage', value: 12, target: 'all' },
            { type: 'status', status: 'frozen', value: 2, target: 'all' },
          ],
        },
        {
          id: 'chain_lightning',
          name: '闪电链',
          type: 'attack',
          cost: 2,
          rarity: 'uncommon',
          description: '对所有敌人造成 7 点伤害',
          tags: ['spell', 'lightning'],
          effects: [{ type: 'damage', value: 7, target: 'all' }],
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
          id: 'reaper',
          name: '收割',
          type: 'attack',
          cost: 2,
          rarity: 'rare',
          description: '对所有敌人造成 4 点伤害，每造成 1 点未被格挡的伤害恢复 1 点生命',
          tags: ['dark', 'drain'],
          effects: [{ type: 'damage_lifesteal', value: 4, target: 'all' }],
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
        {
          id: 'death_coil',
          name: '死亡缠绕',
          type: 'attack',
          cost: 2,
          rarity: 'uncommon',
          description: '造成 12 点伤害，恢复 6 点生命',
          tags: ['deathknight'],
          exclusiveTo: ['shadowKnight'],
          effects: [
            { type: 'damage', value: 12 },
            { type: 'heal', value: 6 },
          ],
        },
      ],

      // 条件攻击
      conditional: [
        {
          id: 'clash',
          name: '冲撞',
          type: 'attack',
          cost: 0,
          rarity: 'common',
          description: '只能在手牌全是攻击牌时使用，造成 14 点伤害',
          tags: ['physical'],
          condition: 'all_attacks',
          effects: [{ type: 'damage', value: 14 }],
        },
        {
          id: 'finisher',
          name: '终结',
          type: 'attack',
          cost: 1,
          rarity: 'uncommon',
          description: '本回合每打出 1 张攻击牌造成 6 点伤害',
          tags: ['stealth', 'agility'],
          effects: [{ type: 'damage_per_attack', value: 6 }],
        },
        {
          id: 'grand_finale',
          name: '大终结',
          type: 'attack',
          cost: 0,
          rarity: 'rare',
          description: '只能在抽牌堆为空时使用，造成 50 点伤害',
          tags: ['stealth'],
          condition: 'empty_draw',
          effects: [{ type: 'damage', value: 50 }],
        },
        {
          id: 'rampage',
          name: '暴走',
          type: 'attack',
          cost: 1,
          rarity: 'uncommon',
          description: '造成 8 点伤害，每次打出此牌伤害永久+5',
          tags: ['rage', 'berserk'],
          effects: [
            { type: 'damage', value: 8 },
            { type: 'permanent_upgrade', stat: 'damage', value: 5 },
          ],
        },
        {
          id: 'feed',
          name: '吞噬',
          type: 'attack',
          cost: 1,
          rarity: 'rare',
          description: '造成 10 点伤害，若致死则永久增加 3 点最大生命',
          tags: ['dark', 'drain'],
          exhaust: true,
          effects: [
            { type: 'damage', value: 10 },
            { type: 'on_kill', effect: { type: 'max_hp', value: 3 } },
          ],
        },
        {
          id: 'backstab',
          name: '背刺',
          type: 'attack',
          cost: 0,
          rarity: 'uncommon',
          description: '固有。造成 11 点伤害',
          tags: ['stealth'],
          exclusiveTo: ['rogue'],
          innate: true,
          exhaust: true,
          effects: [{ type: 'damage', value: 11 }],
        },
      ],

      // 毒素攻击
      poison: [
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
        {
          id: 'poisoned_stab',
          name: '淬毒匕首',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '造成 6 点伤害，施加 3 层中毒',
          tags: ['stealth', 'poison'],
          effects: [
            { type: 'damage', value: 6 },
            { type: 'status', status: 'poison', value: 3 },
          ],
        },
        {
          id: 'envenom',
          name: '剧毒',
          type: 'attack',
          cost: 2,
          rarity: 'uncommon',
          description: '造成 8 点伤害，施加 5 层中毒',
          tags: ['stealth', 'poison'],
          effects: [
            { type: 'damage', value: 8 },
            { type: 'status', status: 'poison', value: 5 },
          ],
        },
      ],
    },

    // --------------------------------------------------------
    // 防御牌
    // --------------------------------------------------------
    defense: {
      // 格挡
      block: [
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
          id: 'shrug_it_off',
          name: '耸肩',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '获得 8 点格挡，抽 1 张牌',
          tags: ['physical', 'armor'],
          effects: [
            { type: 'block', value: 8 },
            { type: 'draw', value: 1 },
          ],
        },
        {
          id: 'iron_wall',
          name: '铁壁',
          type: 'skill',
          cost: 2,
          rarity: 'common',
          description: '获得 12 点格挡',
          tags: ['physical', 'armor', 'defense'],
          effects: [{ type: 'block', value: 12 }],
        },
        {
          id: 'iron_wave',
          name: '铁浪',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '获得 5 点格挡，造成 5 点伤害',
          tags: ['physical', 'armor'],
          effects: [
            { type: 'block', value: 5 },
            { type: 'damage', value: 5 },
          ],
        },
        {
          id: 'true_grit',
          name: '坚毅',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '获得 7 点格挡，消耗 1 张手牌',
          tags: ['physical', 'defense'],
          effects: [
            { type: 'block', value: 7 },
            { type: 'exhaust_random', value: 1 },
          ],
        },
        {
          id: 'impervious',
          name: '坚不可摧',
          type: 'skill',
          cost: 2,
          rarity: 'rare',
          description: '获得 30 点格挡',
          tags: ['defense', 'armor'],
          exhaust: true,
          effects: [{ type: 'block', value: 30 }],
        },
        {
          id: 'deflect',
          name: '偏斜',
          type: 'skill',
          cost: 0,
          rarity: 'common',
          description: '获得 4 点格挡',
          tags: ['stealth', 'agility'],
          effects: [{ type: 'block', value: 4 }],
        },
        {
          id: 'ghostly_armor',
          name: '幽灵护甲',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '获得 10 点格挡，虚无',
          tags: ['dark', 'shadow', 'defense'],
          ethereal: true,
          effects: [{ type: 'block', value: 10 }],
        },
        {
          id: 'sentinel',
          name: '哨兵',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '获得 5 点格挡，若此牌被消耗，获得 2 点能量',
          tags: ['defense', 'armor'],
          effects: [
            { type: 'block', value: 5 },
            { type: 'on_exhaust', effect: { type: 'energy', value: 2 } },
          ],
        },
        {
          id: 'entrench',
          name: '固守',
          type: 'skill',
          cost: 2,
          rarity: 'uncommon',
          description: '格挡翻倍',
          tags: ['defense', 'fortify'],
          effects: [{ type: 'double_block' }],
        },
        {
          id: 'dodge_and_roll',
          name: '闪避翻滚',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '获得 4 点格挡，下回合获得等量格挡',
          tags: ['stealth', 'agility'],
          effects: [
            { type: 'block', value: 4 },
            { type: 'block_next_turn', value: 4 },
          ],
        },
        {
          id: 'energy_shield',
          name: '能量护盾',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '获得 8 点格挡',
          tags: ['spell', 'arcane'],
          effects: [{ type: 'block', value: 8 }],
        },
        {
          id: 'bone_armor',
          name: '骨甲术',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '获得 10 点格挡',
          tags: ['dark', 'shadow'],
          effects: [{ type: 'block', value: 10 }],
        },
        {
          id: 'arcane_shield',
          name: '奥术护盾',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '获得 6 点格挡，抽 1 张牌',
          tags: ['spell', 'arcane', 'spellblade'],
          effects: [
            { type: 'block', value: 6 },
            { type: 'draw', value: 1 },
          ],
        },
      ],

      // 反伤
      thorns: [
        {
          id: 'flame_barrier',
          name: '烈焰屏障',
          type: 'skill',
          cost: 2,
          rarity: 'uncommon',
          description: '获得 12 点格挡，本回合每次受到攻击时对攻击者造成 4 点伤害',
          tags: ['fire', 'defense'],
          effects: [
            { type: 'block', value: 12 },
            { type: 'thorns_turn', value: 4 },
          ],
        },
        {
          id: 'thorns',
          name: '荆棘',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '每次受到攻击时对攻击者造成 3 点伤害',
          tags: ['nature', 'defense'],
          effects: [{ type: 'power', power: 'thorns', value: 3 }],
        },
        {
          id: 'retribution',
          name: '惩戒',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '获得 6 点格挡，本回合受到攻击时反弹 50% 伤害',
          tags: ['holy', 'defense'],
          effects: [
            { type: 'block', value: 6 },
            { type: 'reflect', value: 0.5 },
          ],
        },
      ],

      // 闪避/减伤
      evasion: [
        {
          id: 'blur',
          name: '模糊',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '获得 5 点格挡，下回合格挡不消失',
          tags: ['stealth', 'agility'],
          effects: [
            { type: 'block', value: 5 },
            { type: 'retain_block' },
          ],
        },
        {
          id: 'leg_sweep',
          name: '扫堂腿',
          type: 'skill',
          cost: 2,
          rarity: 'uncommon',
          description: '获得 11 点格挡，施加 2 层虚弱',
          tags: ['physical', 'agility'],
          effects: [
            { type: 'block', value: 11 },
            { type: 'status', status: 'weak', value: 2 },
          ],
        },
        {
          id: 'disarm',
          name: '缴械',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '敌人失去 2 点力量',
          tags: ['stealth'],
          exhaust: true,
          effects: [{ type: 'debuff', debuff: 'strength', value: 2 }],
        },
        {
          id: 'piercing_wail',
          name: '刺耳尖啸',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '所有敌人本回合造成的伤害-6',
          tags: ['stealth'],
          exhaust: true,
          effects: [{ type: 'debuff_turn', debuff: 'damage', value: 6, target: 'all' }],
        },
      ],
    },

    // --------------------------------------------------------
    // 技能牌
    // --------------------------------------------------------
    skill: {
      // 抽牌
      draw: [
        {
          id: 'battle_trance',
          name: '战斗恍惚',
          type: 'skill',
          cost: 0,
          rarity: 'uncommon',
          description: '抽 3 张牌，本回合无法再抽牌',
          tags: ['physical', 'rage'],
          effects: [
            { type: 'draw', value: 3 },
            { type: 'no_draw' },
          ],
        },
        {
          id: 'acrobatics',
          name: '杂技',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '抽 3 张牌，弃 1 张牌',
          tags: ['stealth', 'agility'],
          effects: [
            { type: 'draw', value: 3 },
            { type: 'discard', value: 1 },
          ],
        },
        {
          id: 'prepared',
          name: '准备',
          type: 'skill',
          cost: 0,
          rarity: 'common',
          description: '抽 1 张牌，弃 1 张牌',
          tags: ['stealth'],
          effects: [
            { type: 'draw', value: 1 },
            { type: 'discard', value: 1 },
          ],
        },
        {
          id: 'warcry',
          name: '战吼',
          type: 'skill',
          cost: 0,
          rarity: 'common',
          description: '抽 1 张牌，将 1 张手牌放到牌堆顶',
          tags: ['physical'],
          exhaust: true,
          effects: [
            { type: 'draw', value: 1 },
            { type: 'put_on_deck', value: 1 },
          ],
        },
        {
          id: 'pommel_strike',
          name: '剑柄打击',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '造成 9 点伤害，抽 1 张牌',
          tags: ['physical', 'weapon'],
          effects: [
            { type: 'damage', value: 9 },
            { type: 'draw', value: 1 },
          ],
        },
        {
          id: 'arcane_intellect',
          name: '奥术智慧',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '抽 3 张牌',
          tags: ['arcane'],
          exclusiveTo: ['mage'],
          effects: [{ type: 'draw', value: 3 }],
        },
        {
          id: 'blade_dance',
          name: '剑舞',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '将 3 张切割加入手牌',
          tags: ['blade'],
          exclusiveTo: ['swordmaster'],
          effects: [{ type: 'add_card', card: 'shiv', to: 'hand', count: 3 }],
        },
      ],

      // 能量
      energy: [
        {
          id: 'meditation',
          name: '冥想',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '获得 1 点能量',
          tags: ['chi', 'holy'],
          effects: [{ type: 'energy', value: 1 }],
        },
        {
          id: 'bloodletting',
          name: '放血',
          type: 'skill',
          cost: 0,
          rarity: 'uncommon',
          description: '失去 3 点生命，获得 2 点能量',
          tags: ['rage', 'dark'],
          effects: [
            { type: 'self_damage', value: 3 },
            { type: 'energy', value: 2 },
          ],
        },
        {
          id: 'seeing_red',
          name: '怒火中烧',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '获得 2 点能量',
          tags: ['rage'],
          exhaust: true,
          effects: [{ type: 'energy', value: 2 }],
        },
        {
          id: 'offering',
          name: '祭品',
          type: 'skill',
          cost: 0,
          rarity: 'rare',
          description: '失去 6 点生命，获得 2 点能量，抽 3 张牌',
          tags: ['dark', 'rage'],
          exhaust: true,
          effects: [
            { type: 'self_damage', value: 6 },
            { type: 'energy', value: 2 },
            { type: 'draw', value: 3 },
          ],
        },
        {
          id: 'mana_surge',
          name: '法力涌动',
          type: 'skill',
          cost: 0,
          rarity: 'uncommon',
          description: '获得 2 点能量',
          tags: ['mana'],
          exclusiveTo: ['mage'],
          exhaust: true,
          effects: [{ type: 'energy', value: 2 }],
        },
        {
          id: 'soul_tap',
          name: '灵魂分流',
          type: 'skill',
          cost: 0,
          rarity: 'uncommon',
          description: '失去 2 点生命，获得 1 点能量，抽 1 张牌',
          tags: ['demon'],
          exclusiveTo: ['warlock'],
          effects: [
            { type: 'self_damage', value: 2 },
            { type: 'energy', value: 1 },
            { type: 'draw', value: 1 },
          ],
        },
      ],

      // 治疗
      heal: [
        {
          id: 'heal',
          name: '治疗术',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '恢复 8 点生命',
          tags: ['holy', 'heal'],
          effects: [{ type: 'heal', value: 8 }],
        },
        {
          id: 'rejuvenation',
          name: '回春术',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '恢复 5 点生命，下回合再恢复 5 点',
          tags: ['nature', 'heal'],
          effects: [
            { type: 'heal', value: 5 },
            { type: 'heal_next_turn', value: 5 },
          ],
        },
        {
          id: 'bandage_up',
          name: '包扎',
          type: 'skill',
          cost: 0,
          rarity: 'uncommon',
          description: '恢复 4 点生命',
          tags: ['universal'],
          exhaust: true,
          effects: [{ type: 'heal', value: 4 }],
        },
        {
          id: 'reaper_form',
          name: '收割形态',
          type: 'skill',
          cost: 2,
          rarity: 'rare',
          description: '本回合每造成 1 点伤害恢复 1 点生命',
          tags: ['dark', 'drain'],
          exhaust: true,
          effects: [{ type: 'lifesteal_turn' }],
        },
        {
          id: 'holy_light',
          name: '圣光术',
          type: 'skill',
          cost: 2,
          rarity: 'uncommon',
          description: '恢复 12 点生命',
          tags: ['holy', 'light', 'heal'],
          effects: [{ type: 'heal', value: 12 }],
        },
        {
          id: 'mass_heal',
          name: '群体治疗',
          type: 'skill',
          cost: 3,
          rarity: 'rare',
          description: '恢复 20 点生命',
          tags: ['holy'],
          exclusiveTo: ['priest'],
          exhaust: true,
          effects: [{ type: 'heal', value: 20 }],
        },
      ],

      // 毒素技能
      poison_skill: [
        {
          id: 'deadly_poison',
          name: '致命毒药',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '施加 5 层中毒',
          tags: ['poison', 'stealth'],
          effects: [{ type: 'status', status: 'poison', value: 5 }],
        },
        {
          id: 'crippling_cloud',
          name: '致残毒云',
          type: 'skill',
          cost: 2,
          rarity: 'uncommon',
          description: '对所有敌人施加 4 层中毒和 2 层虚弱',
          tags: ['poison', 'stealth'],
          exhaust: true,
          effects: [
            { type: 'status', status: 'poison', value: 4, target: 'all' },
            { type: 'status', status: 'weak', value: 2, target: 'all' },
          ],
        },
        {
          id: 'bouncing_flask',
          name: '弹跳药瓶',
          type: 'skill',
          cost: 2,
          rarity: 'uncommon',
          description: '随机施加 3 层中毒 3 次',
          tags: ['poison'],
          effects: [{ type: 'status', status: 'poison', value: 3, times: 3, random: true }],
        },
        {
          id: 'catalyst',
          name: '催化剂',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '敌人的中毒层数翻倍',
          tags: ['poison'],
          exhaust: true,
          effects: [{ type: 'double_status', status: 'poison' }],
        },
      ],

      // 工具/杂项
      utility: [
        {
          id: 'armaments',
          name: '武装',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '获得 5 点格挡，升级手中 1 张牌',
          tags: ['physical', 'armor'],
          effects: [
            { type: 'block', value: 5 },
            { type: 'upgrade_hand', value: 1 },
          ],
        },
        {
          id: 'flex',
          name: '屈伸',
          type: 'skill',
          cost: 0,
          rarity: 'common',
          description: '获得 2 点力量，回合结束时失去 2 点力量',
          tags: ['physical', 'strength'],
          effects: [
            { type: 'buff', buff: 'strength', value: 2 },
            { type: 'debuff_end_turn', debuff: 'strength', value: 2 },
          ],
        },
        {
          id: 'havoc',
          name: '浩劫',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '打出抽牌堆顶的牌并消耗它',
          tags: ['rage', 'chaos'],
          effects: [{ type: 'play_top_exhaust' }],
        },
        {
          id: 'headbutt',
          name: '头槌',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '造成 9 点伤害，将弃牌堆中 1 张牌放到抽牌堆顶',
          tags: ['physical'],
          effects: [
            { type: 'damage', value: 9 },
            { type: 'discard_to_top', value: 1 },
          ],
        },
        {
          id: 'second_wind',
          name: '喘息',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '消耗所有非攻击牌，每消耗 1 张获得 5 点格挡',
          tags: ['physical', 'defense'],
          effects: [{ type: 'exhaust_non_attacks_block', value: 5 }],
        },
        {
          id: 'dark_shackles',
          name: '黑暗枷锁',
          type: 'skill',
          cost: 0,
          rarity: 'uncommon',
          description: '敌人本回合力量-9',
          tags: ['dark', 'shadow'],
          exhaust: true,
          effects: [{ type: 'debuff_turn', debuff: 'strength', value: 9 }],
        },
        {
          id: 'concentrate',
          name: '集中',
          type: 'skill',
          cost: 0,
          rarity: 'uncommon',
          description: '弃 3 张牌，获得 2 点能量',
          tags: ['stealth'],
          effects: [
            { type: 'discard', value: 3 },
            { type: 'energy', value: 2 },
          ],
        },
        {
          id: 'calculated_gamble',
          name: '精算赌博',
          type: 'skill',
          cost: 0,
          rarity: 'uncommon',
          description: '弃掉所有手牌，抽等量的牌',
          tags: ['stealth'],
          exhaust: true,
          effects: [{ type: 'discard_draw_equal' }],
        },
        {
          id: 'expertise',
          name: '专业知识',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '抽牌直到手牌有 6 张',
          tags: ['stealth'],
          effects: [{ type: 'draw_to_hand_size', value: 6 }],
        },
        {
          id: 'escape_plan',
          name: '逃跑计划',
          type: 'skill',
          cost: 0,
          rarity: 'uncommon',
          description: '抽 1 张牌，若抽到技能牌获得 3 点格挡',
          tags: ['stealth', 'agility'],
          effects: [{ type: 'draw_conditional_block', value: 1, block: 3, condition: 'skill' }],
        },
        {
          id: 'setup',
          name: '准备就绪',
          type: 'skill',
          cost: 1,
          rarity: 'common',
          description: '将 1 张手牌放到抽牌堆顶，它下回合费用为 0',
          tags: ['stealth'],
          effects: [{ type: 'put_on_deck_zero_cost', value: 1 }],
        },
        {
          id: 'smoke_bomb',
          name: '烟雾弹',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '获得 6 点格挡，下回合抽 2 张牌',
          tags: ['stealth', 'trap'],
          exclusiveTo: ['rogue'],
          effects: [
            { type: 'block', value: 6 },
            { type: 'draw_next_turn', value: 2 },
          ],
        },
      ],
    },

    // --------------------------------------------------------
    // 能力牌 (Power)
    // --------------------------------------------------------
    power: {
      // 增益
      buff: [
        {
          id: 'inflame',
          name: '燃烧',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '获得 2 点力量',
          tags: ['physical', 'strength'],
          effects: [{ type: 'buff', buff: 'strength', value: 2 }],
        },
        {
          id: 'demon_form',
          name: '恶魔形态',
          type: 'power',
          cost: 3,
          rarity: 'rare',
          description: '每回合开始时获得 2 点力量',
          tags: ['dark', 'demon'],
          effects: [{ type: 'power', power: 'demon_form', value: 2 }],
        },
        {
          id: 'limit_break',
          name: '极限突破',
          type: 'skill',
          cost: 1,
          rarity: 'rare',
          description: '力量翻倍',
          tags: ['physical', 'strength'],
          exhaust: true,
          effects: [{ type: 'double_buff', buff: 'strength' }],
        },
        {
          id: 'footwork',
          name: '步法',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '获得 2 点敏捷',
          tags: ['stealth', 'agility'],
          effects: [{ type: 'buff', buff: 'dexterity', value: 2 }],
        },
        {
          id: 'accuracy',
          name: '精准',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '切割造成的伤害+4',
          tags: ['blade'],
          effects: [{ type: 'power', power: 'accuracy', value: 4 }],
        },
        {
          id: 'inner_peace',
          name: '内心平静',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '每回合开始时获得 1 点能量',
          tags: ['chi'],
          exclusiveTo: ['monk'],
          effects: [{ type: 'power', power: 'inner_peace', value: 1 }],
        },
      ],

      // 减益
      debuff: [
        {
          id: 'noxious_fumes',
          name: '毒雾',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '每回合开始时对所有敌人施加 2 层中毒',
          tags: ['poison', 'stealth'],
          effects: [{ type: 'power', power: 'noxious_fumes', value: 2 }],
        },
        {
          id: 'dark_presence',
          name: '黑暗存在',
          type: 'power',
          cost: 2,
          rarity: 'uncommon',
          description: '每回合开始时对所有敌人施加 1 层虚弱',
          tags: ['deathknight'],
          exclusiveTo: ['shadowKnight'],
          effects: [{ type: 'power', power: 'dark_presence', value: 1 }],
        },
      ],

      // 被动效果
      passive: [
        {
          id: 'metallicize',
          name: '金属化',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '每回合结束时获得 3 点格挡',
          tags: ['defense', 'armor'],
          effects: [{ type: 'power', power: 'metallicize', value: 3 }],
        },
        {
          id: 'barricade',
          name: '壁垒',
          type: 'power',
          cost: 3,
          rarity: 'rare',
          description: '格挡不再在回合开始时消失',
          tags: ['defense', 'armor'],
          effects: [{ type: 'power', power: 'barricade' }],
        },
        {
          id: 'combust',
          name: '燃烧',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '每回合结束时失去 1 点生命，对所有敌人造成 5 点伤害',
          tags: ['fire', 'rage'],
          effects: [{ type: 'power', power: 'combust', value: 5 }],
        },
        {
          id: 'berserk',
          name: '狂暴',
          type: 'power',
          cost: 0,
          rarity: 'uncommon',
          description: '获得 2 层易伤，每回合开始时获得 1 点能量',
          tags: ['rage', 'berserk'],
          effects: [
            { type: 'status', status: 'vulnerable', value: 2, target: 'self' },
            { type: 'power', power: 'berserk', value: 1 },
          ],
        },
        {
          id: 'brutality',
          name: '残暴',
          type: 'power',
          cost: 0,
          rarity: 'rare',
          description: '每回合开始时失去 1 点生命，抽 1 张牌',
          tags: ['rage'],
          effects: [{ type: 'power', power: 'brutality', value: 1 }],
        },
        {
          id: 'thousand_cuts',
          name: '千刀万剐',
          type: 'power',
          cost: 2,
          rarity: 'rare',
          description: '每打出 1 张牌对所有敌人造成 1 点伤害',
          tags: ['blade', 'stealth'],
          effects: [{ type: 'power', power: 'thousand_cuts', value: 1 }],
        },
        {
          id: 'after_image',
          name: '残影',
          type: 'power',
          cost: 1,
          rarity: 'rare',
          description: '每打出 1 张牌获得 1 点格挡',
          tags: ['stealth', 'agility'],
          effects: [{ type: 'power', power: 'after_image', value: 1 }],
        },
        {
          id: 'wild_growth',
          name: '野性成长',
          type: 'power',
          cost: 2,
          rarity: 'uncommon',
          description: '每回合开始时获得 1 点能量',
          tags: ['nature'],
          exclusiveTo: ['druid'],
          effects: [{ type: 'power', power: 'wild_growth', value: 1 }],
        },
        {
          id: 'juggernaut',
          name: '主宰',
          type: 'power',
          cost: 2,
          rarity: 'rare',
          description: '每次获得格挡时对随机敌人造成 5 点伤害',
          tags: ['physical', 'defense'],
          effects: [{ type: 'power', power: 'juggernaut', value: 5 }],
        },
        {
          id: 'feel_no_pain',
          name: '无痛',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '每消耗 1 张牌获得 3 点格挡',
          tags: ['rage', 'defense'],
          effects: [{ type: 'power', power: 'feel_no_pain', value: 3 }],
        },
        {
          id: 'dark_embrace',
          name: '黑暗拥抱',
          type: 'power',
          cost: 2,
          rarity: 'uncommon',
          description: '每消耗 1 张牌抽 1 张牌',
          tags: ['dark', 'shadow'],
          effects: [{ type: 'power', power: 'dark_embrace', value: 1 }],
        },
        {
          id: 'corruption',
          name: '腐化',
          type: 'power',
          cost: 3,
          rarity: 'rare',
          description: '技能牌费用变为 0，打出后消耗',
          tags: ['dark', 'shadow'],
          effects: [{ type: 'power', power: 'corruption' }],
        },
        {
          id: 'rupture',
          name: '破裂',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '每次失去生命时获得 1 点力量',
          tags: ['rage', 'berserk'],
          effects: [{ type: 'power', power: 'rupture', value: 1 }],
        },
        {
          id: 'envenom',
          name: '淬毒',
          type: 'power',
          cost: 2,
          rarity: 'rare',
          description: '每次造成未被格挡的伤害时施加 1 层中毒',
          tags: ['poison', 'stealth'],
          effects: [{ type: 'power', power: 'envenom', value: 1 }],
        },
        {
          id: 'a_thousand_cuts',
          name: '凌迟',
          type: 'power',
          cost: 2,
          rarity: 'rare',
          description: '每打出 1 张牌对所有敌人造成 1 点伤害',
          tags: ['blade', 'stealth'],
          effects: [{ type: 'power', power: 'a_thousand_cuts', value: 1 }],
        },
        {
          id: 'infinite_blades',
          name: '无尽飞刃',
          type: 'power',
          cost: 1,
          rarity: 'uncommon',
          description: '每回合开始时将 1 张切割加入手牌',
          tags: ['blade', 'stealth'],
          effects: [{ type: 'power', power: 'infinite_blades', value: 1 }],
        },
      ],
    },

    // --------------------------------------------------------
    // 状态牌（负面）
    // --------------------------------------------------------
    status: {
      // 诅咒
      curse: [
        {
          id: 'wound',
          name: '伤口',
          type: 'status',
          cost: -1,
          rarity: 'basic',
          description: '不可打出',
          tags: [],
          unplayable: true,
          effects: [],
        },
        {
          id: 'dazed',
          name: '眩晕',
          type: 'status',
          cost: -1,
          rarity: 'basic',
          description: '虚无。不可打出',
          tags: [],
          unplayable: true,
          ethereal: true,
          effects: [],
        },
        {
          id: 'burn',
          name: '灼伤',
          type: 'status',
          cost: -1,
          rarity: 'basic',
          description: '不可打出。回合结束时受到 2 点伤害',
          tags: [],
          unplayable: true,
          effects: [{ type: 'self_damage_end_turn', value: 2 }],
        },
        {
          id: 'void',
          name: '虚空',
          type: 'status',
          cost: -1,
          rarity: 'basic',
          description: '虚无。不可打出。抽到时失去 1 点能量',
          tags: [],
          unplayable: true,
          ethereal: true,
          effects: [{ type: 'lose_energy_on_draw', value: 1 }],
        },
        {
          id: 'slimed',
          name: '黏液',
          type: 'status',
          cost: 1,
          rarity: 'basic',
          description: '消耗',
          tags: [],
          exhaust: true,
          effects: [],
        },
      ],
    },

    // --------------------------------------------------------
    // 职业专属牌（独占）
    // --------------------------------------------------------
    exclusive: {
      // 战士专属
      warrior: [
        {
          id: 'battle_cry',
          name: '战斗怒吼',
          type: 'skill',
          cost: 0,
          rarity: 'uncommon',
          description: '抽 2 张牌，本回合攻击牌伤害+2',
          tags: [],
          exclusiveTo: ['warrior'],
          effects: [
            { type: 'draw', value: 2 },
            { type: 'buff_turn', buff: 'attack_damage', value: 2 },
          ],
        },
        {
          id: 'shield_bash',
          name: '盾击',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '造成等同于你当前格挡的伤害',
          tags: [],
          exclusiveTo: ['warrior'],
          effects: [{ type: 'damage_from_block' }],
        },
      ],

      // 野蛮人专属
      barbarian: [
        {
          id: 'berserker_rage',
          name: '狂战士之怒',
          type: 'power',
          cost: 1,
          rarity: 'rare',
          description: '生命值每低于 50%，力量+2',
          tags: [],
          exclusiveTo: ['barbarian'],
          effects: [{ type: 'power', power: 'berserker_rage' }],
        },
        {
          id: 'blood_fury',
          name: '血怒',
          type: 'attack',
          cost: 2,
          rarity: 'uncommon',
          description: '失去 5 点生命，造成 20 点伤害',
          tags: [],
          exclusiveTo: ['barbarian'],
          effects: [
            { type: 'self_damage', value: 5 },
            { type: 'damage', value: 20 },
          ],
        },
        {
          id: 'rage_strike',
          name: '狂怒打击',
          type: 'attack',
          cost: 1,
          rarity: 'basic',
          description: '造成 8 点伤害，获得 1 点力量',
          tags: [],
          exclusiveTo: ['barbarian'],
          effects: [
            { type: 'damage', value: 8 },
            { type: 'buff', buff: 'strength', value: 1 },
          ],
        },
      ],

      // 剑圣专属
      swordmaster: [
        {
          id: 'perfect_strike',
          name: '完美一击',
          type: 'attack',
          cost: 2,
          rarity: 'rare',
          description: '造成 15 点伤害，卡组中每有 1 张"打击"类卡牌伤害+3',
          tags: [],
          exclusiveTo: ['swordmaster'],
          effects: [{ type: 'damage_per_strike', value: 15, bonus: 3 }],
        },
      ],

      // 魔剑士专属
      spellblade: [
        {
          id: 'arcane_blade',
          name: '奥术之刃',
          type: 'attack',
          cost: 1,
          rarity: 'uncommon',
          description: '造成 8 点伤害，获得 4 点格挡',
          tags: ['spellblade'],
          exclusiveTo: ['spellblade'],
          effects: [
            { type: 'damage', value: 8 },
            { type: 'block', value: 4 },
          ],
        },
        {
          id: 'spell_strike',
          name: '法术打击',
          type: 'attack',
          cost: 2,
          rarity: 'rare',
          description: '造成 12 点伤害，抽 1 张牌，获得 1 点能量',
          tags: ['spellblade'],
          exclusiveTo: ['spellblade'],
          effects: [
            { type: 'damage', value: 12 },
            { type: 'draw', value: 1 },
            { type: 'energy', value: 1 },
          ],
        },
        {
          id: 'mana_slash',
          name: '法力斩',
          type: 'attack',
          cost: 1,
          rarity: 'common',
          description: '造成 6 点伤害，每有 1 点未使用的能量伤害+3',
          tags: ['spellblade'],
          exclusiveTo: ['spellblade'],
          effects: [{ type: 'damage_per_energy', value: 6, bonus: 3 }],
        },
        {
          id: 'enchanted_strike',
          name: '附魔打击',
          type: 'attack',
          cost: 1,
          rarity: 'basic',
          description: '造成 7 点伤害，获得 3 点格挡',
          tags: ['spellblade'],
          exclusiveTo: ['spellblade'],
          effects: [
            { type: 'damage', value: 7 },
            { type: 'block', value: 3 },
          ],
        },
      ],

      // 暗黑骑士专属
      shadowKnight: [
        {
          id: 'dark_blade',
          name: '黑暗之刃',
          type: 'attack',
          cost: 2,
          rarity: 'uncommon',
          description: '造成 14 点伤害，施加 2 层虚弱',
          tags: ['deathknight'],
          exclusiveTo: ['shadowKnight'],
          effects: [
            { type: 'damage', value: 14 },
            { type: 'status', status: 'weak', value: 2 },
          ],
        },
        {
          id: 'shadow_strike',
          name: '暗影打击',
          type: 'attack',
          cost: 1,
          rarity: 'basic',
          description: '造成 8 点伤害，恢复 2 点生命',
          tags: ['deathknight'],
          exclusiveTo: ['shadowKnight'],
          effects: [
            { type: 'damage', value: 8 },
            { type: 'heal', value: 2 },
          ],
        },
      ],

      // 游侠专属
      ranger: [
        {
          id: 'aimed_shot',
          name: '瞄准射击',
          type: 'attack',
          cost: 1,
          rarity: 'basic',
          description: '造成 10 点伤害',
          tags: ['ranged'],
          exclusiveTo: ['ranger'],
          effects: [{ type: 'damage', value: 10 }],
        },
        {
          id: 'hunters_mark',
          name: '猎人印记',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '施加 3 层易伤，抽 1 张牌',
          tags: ['ranged'],
          exclusiveTo: ['ranger'],
          effects: [
            { type: 'status', status: 'vulnerable', value: 3 },
            { type: 'draw', value: 1 },
          ],
        },
      ],

      // 武僧专属
      monk: [
        {
          id: 'palm_strike',
          name: '掌击',
          type: 'attack',
          cost: 1,
          rarity: 'basic',
          description: '造成 7 点伤害，抽 1 张牌',
          tags: ['chi'],
          exclusiveTo: ['monk'],
          effects: [
            { type: 'damage', value: 7 },
            { type: 'draw', value: 1 },
          ],
        },
      ],

      // 牧师专属
      priest: [
        {
          id: 'divine_intervention',
          name: '神圣干预',
          type: 'skill',
          cost: 3,
          rarity: 'rare',
          description: '恢复 15 点生命，获得 15 点格挡',
          tags: [],
          exclusiveTo: ['priest'],
          exhaust: true,
          effects: [
            { type: 'heal', value: 15 },
            { type: 'block', value: 15 },
          ],
        },
      ],

      // 德鲁伊专属
      druid: [
        {
          id: 'bear_form',
          name: '熊形态',
          type: 'power',
          cost: 2,
          rarity: 'rare',
          description: '获得 10 点格挡，每回合开始时获得 5 点格挡',
          tags: ['shapeshift'],
          exclusiveTo: ['druid'],
          effects: [
            { type: 'block', value: 10 },
            { type: 'power', power: 'bear_form', value: 5 },
          ],
        },
      ],

      // 术士专属
      warlock: [
        {
          id: 'demonic_pact',
          name: '恶魔契约',
          type: 'power',
          cost: 2,
          rarity: 'rare',
          description: '每回合开始时失去 2 点生命，获得 2 点力量',
          tags: ['demon'],
          exclusiveTo: ['warlock'],
          effects: [{ type: 'power', power: 'demonic_pact', value: 2 }],
        },
      ],

      // 巫师专属
      sorcerer: [
        {
          id: 'wild_magic',
          name: '狂野魔法',
          type: 'skill',
          cost: 1,
          rarity: 'rare',
          description: '随机施放 3 个法术效果',
          tags: ['chaos'],
          exclusiveTo: ['sorcerer'],
          effects: [{ type: 'random_spell', count: 3 }],
        },
        {
          id: 'chaos_bolt',
          name: '混沌箭',
          type: 'attack',
          cost: 1,
          rarity: 'uncommon',
          description: '造成 5-15 点随机伤害',
          tags: ['chaos'],
          exclusiveTo: ['sorcerer'],
          effects: [{ type: 'damage_random', min: 5, max: 15 }],
        },
      ],

      // 圣骑士专属
      paladin: [
        {
          id: 'divine_shield',
          name: '圣盾术',
          type: 'skill',
          cost: 2,
          rarity: 'rare',
          description: '本回合免疫所有伤害',
          tags: [],
          exclusiveTo: ['paladin'],
          exhaust: true,
          effects: [{ type: 'invulnerable_turn' }],
        },
        {
          id: 'holy_strike',
          name: '神圣打击',
          type: 'attack',
          cost: 2,
          rarity: 'uncommon',
          description: '造成 12 点伤害，恢复 4 点生命',
          tags: [],
          exclusiveTo: ['paladin'],
          effects: [
            { type: 'damage', value: 12 },
            { type: 'heal', value: 4 },
          ],
        },
      ],

      // 萨满专属
      shaman: [
        {
          id: 'totemic_call',
          name: '图腾召唤',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '随机召唤一个图腾效果',
          tags: ['totem'],
          exclusiveTo: ['shaman'],
          effects: [{ type: 'random_totem' }],
        },
        {
          id: 'elemental_mastery',
          name: '元素掌控',
          type: 'power',
          cost: 2,
          rarity: 'rare',
          description: '元素法术伤害+50%',
          tags: ['totem'],
          exclusiveTo: ['shaman'],
          effects: [{ type: 'power', power: 'elemental_mastery', value: 0.5 }],
        },
        {
          id: 'earth_shock',
          name: '地震术',
          type: 'attack',
          cost: 1,
          rarity: 'basic',
          description: '造成 6 点伤害，施加 1 层虚弱',
          tags: ['totem'],
          exclusiveTo: ['shaman'],
          effects: [
            { type: 'damage', value: 6 },
            { type: 'status', status: 'weak', value: 1 },
          ],
        },
      ],

      // 战斗法师专属
      battlemage: [
        {
          id: 'flame_blade',
          name: '火焰之刃',
          type: 'attack',
          cost: 2,
          rarity: 'uncommon',
          description: '造成 10 点伤害，施加 3 层灼烧',
          tags: [],
          exclusiveTo: ['battlemage'],
          effects: [
            { type: 'damage', value: 10 },
            { type: 'status', status: 'burn', value: 3 },
          ],
        },
        {
          id: 'arcane_armor',
          name: '奥术护甲',
          type: 'skill',
          cost: 1,
          rarity: 'uncommon',
          description: '获得 8 点格挡，下次攻击伤害+4',
          tags: [],
          exclusiveTo: ['battlemage'],
          effects: [
            { type: 'block', value: 8 },
            { type: 'buff_next_attack', value: 4 },
          ],
        },
        {
          id: 'fire_punch',
          name: '火焰拳',
          type: 'attack',
          cost: 1,
          rarity: 'basic',
          description: '造成 8 点伤害，施加 1 层灼烧',
          tags: [],
          exclusiveTo: ['battlemage'],
          effects: [
            { type: 'damage', value: 8 },
            { type: 'status', status: 'burn', value: 1 },
          ],
        },
        {
          id: 'mage_armor',
          name: '法师护甲',
          type: 'skill',
          cost: 1,
          rarity: 'basic',
          description: '获得 6 点格挡',
          tags: [],
          exclusiveTo: ['battlemage'],
          effects: [{ type: 'block', value: 6 }],
        },
      ],
    },

    // --------------------------------------------------------
    // 特殊卡牌（生成的临时卡）
    // --------------------------------------------------------
    generated: [
      {
        id: 'shiv',
        name: '切割',
        type: 'attack',
        cost: 0,
        rarity: 'basic',
        description: '造成 4 点伤害',
        tags: ['blade'],
        exhaust: true,
        effects: [{ type: 'damage', value: 4 }],
      },
    ],
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
};

// 导出
window.CardDatabase = CardDatabase;
