/* ============================================================
 * 卡牌元数据定义
 * 包含稀有度、类型等基础配置
 * ============================================================ */

export const CardMeta = {
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
};
