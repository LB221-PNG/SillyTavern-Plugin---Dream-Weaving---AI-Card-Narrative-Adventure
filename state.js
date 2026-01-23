/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 核心状态管理（接口）
 * 基于MVU变量更新系统
 * ============================================================ */

/**
 * 变量变更事件系统 - 观察者模式
 * 用于监听GameVariables的变更并通知订阅者
 */
const VariableChangeEmitter = {
  // 事件监听器存储
  listeners: {},

  /**
   * 订阅变量变更事件
   * @param {string} event - 事件名称（如 'status.hp', 'battle.enemy', '*' 表示所有变更）
   * @param {Function} callback - 回调函数 (newValue, oldValue, path) => void
   * @returns {Function} - 取消订阅的函数
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // 返回取消订阅函数
    return () => {
      this.off(event, callback);
    };
  },

  /**
   * 取消订阅
   * @param {string} event - 事件名称
   * @param {Function} callback - 要移除的回调函数
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  },

  /**
   * 触发事件
   * @param {string} path - 变更路径（如 '/status/hp'）
   * @param {*} newValue - 新值
   * @param {*} oldValue - 旧值
   */
  emit(path, newValue, oldValue) {
    // 转换路径格式 /status/hp -> status.hp
    const eventName = path.replace(/^\//, '').replace(/\//g, '.');

    // 触发具体路径的监听器
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (e) {
          console.error(`变量变更回调执行失败 (${eventName}):`, e);
        }
      });
    }

    // 触发父路径的监听器（如 status.* 监听所有status下的变更）
    const parts = eventName.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.') + '.*';
      if (this.listeners[parentPath]) {
        this.listeners[parentPath].forEach(callback => {
          try {
            callback(newValue, oldValue, path);
          } catch (e) {
            console.error(`变量变更回调执行失败 (${parentPath}):`, e);
          }
        });
      }
    }

    // 触发全局监听器
    if (this.listeners['*']) {
      this.listeners['*'].forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (e) {
          console.error('变量变更回调执行失败 (*):');
        }
      });
    }
  },

  /**
   * 清除所有监听器
   */
  clear() {
    this.listeners = {};
  },

  /**
   * 批量触发变更事件
   * @param {Array} changes - 变更数组 [{path, newValue, oldValue}]
   */
  emitBatch(changes) {
    changes.forEach(change => {
      this.emit(change.path, change.newValue, change.oldValue);
    });

    // 触发批量变更完成事件
    if (this.listeners['batch-complete']) {
      this.listeners['batch-complete'].forEach(callback => {
        try {
          callback(changes);
        } catch (e) {
          console.error('批量变更回调执行失败:', e);
        }
      });
    }
  },
};

/**
 * 游戏变量状态 - 基于MVU系统的完整变量结构
 * 参考：卡牌AI叙事提示词资料.txt 中的变量说明
 */
const GameVariables = {
  // 角色状态
  status: {
    time: '1月1日，周一，清晨，08:00',
    location_weather: '未知之地（起点） ☁阴天',
    profession: '流浪者，尚未觉醒特殊能力',
    permanent_status: [],
    temporary_status: [],
    clothing: {
      head: '无',
      neck: '无',
      hands: '无',
      upper_body: '简陋的麻布衣',
      lower_body: '破旧的布裤',
      underwear: '普通内衣',
      legs: '无',
      feet: '草鞋',
    },
    inventory: [],
  },

  // 战斗相关变量
  battle: {
    core: {
      hp: 100,
      max_hp: 100,
      card_removal_count: 0,
    },
    cards: [], // 出战卡组（模板数据）
    warehouse: [], // 卡牌仓库（存放未出战的卡牌）
    artifacts: [],
    items: [],
    statuses: [],
    level: 1,
    exp: 0,
    // 敌人信息（战斗时动态生成）
    enemy: null,
    // 玩家战斗能力（可选）
    player_abilities: [],
    // 玩家战斗状态效果（可选）
    player_status_effects: [],
  },

  // 势力与关系
  factions: {
    player_alignment: '绝对中立',
    relations: [],
  },

  // NPC管理
  npcs: {},

  // 奖励临时变量
  reward: {
    card: [],
    artifact: [],
    item: [],
    limits: {
      cards: 1,
      artifacts: 1,
      items: 1,
    },
  },

  // 动态地图系统（完全由AI生成）
  map: {
    // 玩家位置（由地图API设置）
    player: null,
    
    // 地点列表（完全由API生成）
    locations: [],
    
    // NPC列表（完全由API生成）
    npcs: [],
    
    // 路径连接（完全由API生成）
    paths: [],
    
    // 渲染配置
    viewport: {
      centerX: 0,
      centerY: 0,
      scale: 1
    },
    
    // 地图是否已初始化
    initialized: false,
    
    // 最后更新时间
    lastUpdated: null
  },
};

/**
 * 游戏主状态
 */
const GameState = {
  currentPage: 'home',
  previousPage: 'home',
  character: {
    name: '',
    gender: 'female',
    age: 24,
    race: 'human',
    class: '',
    appearance: '',
    background: '',
    hp: 80,
    maxHp: 80,
    gold: 0,
    floor: 1,
  },
  world: {
    prompt: '',
    openingPrompt: '', // 期望开场白提示词
    entries: [],
    isLoaded: false,
  },
  settings: {
    useTavernApi: false, // 是否使用酒馆默认API（全局开关）
    // API配置集合
    apiProfiles: {
      // 主API（叙事/对话）
      main: {
        name: '主API（叙事/对话）',
        enabled: true,
        apiFormat: 'openai',
        apiEndpoint: '',
        apiKey: '',
        modelName: 'gpt-4',
        maxTokens: 4096,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
      },
      // 地图API
      map: {
        name: '地图API',
        enabled: true,
        useMainApi: true, // 是否复用主API配置
        apiFormat: 'openai',
        apiEndpoint: '',
        apiKey: '',
        modelName: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
      }
    },
    // 兼容旧版配置（将被apiProfiles.main替代，保留用于迁移）
    apiEndpoint: '',
    apiKey: '',
    modelName: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    apiFormat: 'openai',
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  },
  // 引用游戏变量
  variables: GameVariables,
  // 总结功能相关状态
  summaries: [], // 大总结列表
  smallSummaries: [], // 小总结列表
  summaryConfig: {
    // 总结配置
    autoGenerate: true,
    maxSmallSummaries: 10,
    mergeThreshold: 10,
    enableManual: true,
  },
};

/**
 * 战斗系统状态 - 完全独立于游戏主状态
 */
const BattleState = {
  isActive: false,
  turn: 1,
  energy: 3,
  maxEnergy: 3,
  block: 0,
  playerHp: 80,
  playerMaxHp: 80,
  enemy: null,
  deck: [],
  drawPile: [],
  hand: [],
  discardPile: [],
  exhaustPile: [],
  selectedCard: null,
  combatLog: [],
};

/**
 * 重置战斗状态
 */
function resetBattleState() {
  BattleState.isActive = false;
  BattleState.turn = 1;
  BattleState.energy = 3;
  BattleState.block = 0;
  BattleState.playerHp = GameVariables.battle.core.hp;
  BattleState.playerMaxHp = GameVariables.battle.core.max_hp;
  BattleState.enemy = null;
  BattleState.deck = [];
  BattleState.drawPile = [];
  BattleState.hand = [];
  BattleState.discardPile = [];
  BattleState.exhaustPile = [];
  BattleState.selectedCard = null;
  BattleState.combatLog = [];

  // 清除战斗临时敌人数据
  GameVariables.battle.enemy = null;
  GameVariables.battle.player_abilities = [];
  GameVariables.battle.player_status_effects = [];
}

/**
 * 重置角色状态
 */
function resetCharacterState() {
  GameState.character = {
    name: '',
    gender: 'female',
    age: 24,
    race: 'human',
    class: '',
    appearance: '',
    background: '',
    hp: 80,
    maxHp: 80,
    gold: 0,
    floor: 1,
  };
}

/**
 * 重置世界状态
 */
function resetWorldState() {
  GameState.world = {
    prompt: '',
    openingPrompt: '', // 期望开场白提示词
    entries: [],
    isLoaded: false,
  };
}

/**
 * 重置游戏变量
 */
function resetGameVariables() {
  GameVariables.status = {
    time: '1月1日，周一，清晨，08:00',
    location_weather: '未知之地（起点） ☁阴天',
    profession: '流浪者，尚未觉醒特殊能力',
    permanent_status: [],
    temporary_status: [],
    clothing: {
      head: '无',
      neck: '无',
      hands: '无',
      upper_body: '简陋的麻布衣',
      lower_body: '破旧的布裤',
      underwear: '普通内衣',
      legs: '无',
      feet: '草鞋',
    },
    inventory: [],
  };

  GameVariables.battle = {
    core: {
      hp: 100,
      max_hp: 100,
      card_removal_count: 0,
    },
    cards: [],
    warehouse: [], // 卡牌仓库重置
    artifacts: [],
    items: [],
    statuses: [],
    level: 1,
    exp: 0,
    enemy: null,
    player_abilities: [],
    player_status_effects: [],
  };

  GameVariables.factions = {
    player_alignment: '绝对中立',
    relations: [],
  };

  GameVariables.npcs = {};

  GameVariables.reward = {
    card: [],
    artifact: [],
    item: [],
    limits: {
      cards: 1,
      artifacts: 1,
      items: 1,
    },
  };
}

/**
 * MVU变量操作提示词模板
 * 用户可自定义的提示词配置
 */
const MVU_PROMPTS = {
  // 系统角色提示词
  systemRole: `你是一个奇幻冒险叙事AI，负责为玩家创造沉浸式的文字冒险体验。`,

  // 叙事规则提示词
  narrativeRules: `# 叙事规则
1. 以第二人称（你）的视角进行叙述
2. 保持叙事简洁生动，每次响应控制在100-300字
3. 偶尔暗示可能存在的危险或机遇
4. 根据玩家的行动做出合理的世界反馈
5. 保持世界观的一致性和连贯性
6. 适当描述环境、氛围和NPC的反应`,

  // 变量输出格式
  outputFormat: `<UpdateVariable>
<Analysis>$(IN ENGLISH, no more than 80 words)
- \${calculate time passed: ...}
- \${decide whether dramatic updates are allowed as it's in a special case or the time passed is more than usual: yes/no}
- \${analyze every variable based on its corresponding check, according only to current reply instead of previous plots: ...}
</Analysis>
<JSONPatch>
[
  { "op": "replace", "path": "\${/path/to/variable}", "value": "\${new_value}" },
  { "op": "add", "path": "\${/path/to/object/new_key}", "value": "\${new_value}" },
  { "op": "remove", "path": "\${/path/to/array/0}" }
]
</JSONPatch>
</UpdateVariable>`,

  // 变量更新规则
  updateRules: `# 变量更新规则
1. 必须严格遵循 JSON Patch (RFC 6902) 标准
2. 仅支持 replace（替换已有路径的值）、add（向对象或数组插入新项）、remove 操作
3. 不要更新以 _ 开头的只读字段
4. 在回复末尾输出更新分析和实际更新命令`,

  // 战斗触发提示词
  battleTrigger: `如果需要开始战斗，在末尾添加<BATTLE_START>标签，并在UpdateVariable中设置敌人信息。`,

  // 输出格式说明
  outputStructure: `# 输出格式要求
每次响应必须遵循以下结构：
<Story>
剧情内容
</Story>`,
};

/**
 * 默认提示词模板（用于重置）
 */
const DEFAULT_MVU_PROMPTS = JSON.parse(JSON.stringify(MVU_PROMPTS));

// 导出状态对象
window.GameState = GameState;
window.GameVariables = GameVariables;
window.BattleState = BattleState;
window.VariableChangeEmitter = VariableChangeEmitter;
window.resetBattleState = resetBattleState;
window.resetCharacterState = resetCharacterState;
window.resetWorldState = resetWorldState;
window.resetGameVariables = resetGameVariables;
window.MVU_PROMPTS = MVU_PROMPTS;
window.DEFAULT_MVU_PROMPTS = DEFAULT_MVU_PROMPTS;
