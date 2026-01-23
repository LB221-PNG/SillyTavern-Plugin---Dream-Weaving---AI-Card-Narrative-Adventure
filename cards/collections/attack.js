/* ============================================================
 * 攻击卡牌集合
 * 包含所有攻击类型的卡牌
 * ============================================================ */

export const attackCards = {
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
