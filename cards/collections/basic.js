/* ============================================================
 * 基础卡牌
 * 所有职业的初始卡牌
 * ============================================================ */

export const basicCards = [
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
