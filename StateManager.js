/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * StateManager - 统一状态管理器
 * 替代多个全局状态对象，提供响应式状态管理
 * ============================================================ */

/**
 * 状态管理器类
 * 提供集中式状态管理，支持订阅和路径访问
 */
class StateManager {
  constructor() {
    /**
     * 内部状态存储
     * @private
     */
    this._state = this._getInitialState();

    /**
     * 状态订阅者
     * @type {Map<string, Set<Function>>}
     * @private
     */
    this._subscribers = new Map();

    /**
     * 状态变更历史（用于撤销/调试）
     * @private
     */
    this._history = [];
    this._historyMaxLength = 50;

    /**
     * 是否记录历史
     * @private
     */
    this._recordHistory = false;

    /**
     * 批量更新标志
     * @private
     */
    this._batchUpdating = false;
    this._batchChanges = [];
  }

  /**
   * 获取初始状态结构
   * @private
   * @returns {Object}
   */
  _getInitialState() {
    return {
      // 应用状态
      app: {
        currentPage: 'home',
        previousPage: 'home',
        isLoading: false,
        isInitialized: false,
version: '0.2.2',
      },

      // 角色状态
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

      // 世界状态
      world: {
        prompt: '',
        entries: [],
        isLoaded: false,
      },

      // 战斗状态
      battle: {
        isActive: false,
        turn: 1,
        energy: 3,
        maxEnergy: 3,
        block: 0,
        playerHp: 80,
        playerMaxHp: 80,
        enemy: null,
        deck: [],
        hand: [],
        drawPile: [],
        discardPile: [],
        exhaustPile: [],
        selectedCard: null,
        combatLog: [],
      },

      // 游戏变量（MVU系统）
      variables: {
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
        battle: {
          core: {
            hp: 100,
            max_hp: 100,
            card_removal_count: 0,
          },
          cards: [],
          artifacts: [],
          items: [],
          statuses: [],
          level: 1,
          exp: 0,
          enemy: null,
          player_abilities: [],
          player_status_effects: [],
        },
        factions: {
          player_alignment: '绝对中立',
          relations: [],
        },
        npcs: {},
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
      },

      // 设置
      settings: {
        useTavernApi: false,
        apiEndpoint: '',
        apiKey: '',
        modelName: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2048,
      },

      // 总结功能
      summaries: {
        big: [],
        small: [],
        config: {
          autoGenerate: true,
          maxSmallSummaries: 10,
          mergeThreshold: 10,
          enableManual: true,
        },
      },

      // MVU提示词配置
      prompts: {
        systemRole: '你是一个奇幻冒险叙事AI，负责为玩家创造沉浸式的文字冒险体验。',
        narrativeRules: `# 叙事规则
1. 以第二人称（你）的视角进行叙述
2. 保持叙事简洁生动，每次响应控制在100-300字
3. 偶尔暗示可能存在的危险或机遇
4. 根据玩家的行动做出合理的世界反馈
5. 保持世界观的一致性和连贯性
6. 适当描述环境、氛围和NPC的反应`,
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
        updateRules: `# 变量更新规则
1. 必须严格遵循 JSON Patch (RFC 6902) 标准
2. 仅支持 replace（替换已有路径的值）、add（向对象或数组插入新项）、remove 操作
3. 不要更新以 _ 开头的只读字段
4. 在回复末尾输出更新分析和实际更新命令`,
        battleTrigger: '如果需要开始战斗，在末尾添加<BATTLE_START>标签，并在UpdateVariable中设置敌人信息。',
        outputStructure: `# 输出格式要求
每次响应必须遵循以下结构：
<Story>
剧情内容
</Story>`,
      },
    };
  }

  // ============================================================
  // 状态访问
  // ============================================================

  /**
   * 获取状态值（支持路径访问）
   * @param {string} path - 状态路径，如 'character.name' 或 'battle.enemy.hp'
   * @param {*} defaultValue - 默认值
   * @returns {*}
   */
  get(path, defaultValue = undefined) {
    if (!path) {
      return this._state;
    }

    const keys = path.split('.');
    let current = this._state;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      current = current[key];
    }

    return current !== undefined ? current : defaultValue;
  }

  /**
   * 设置状态值
   * @param {string} path - 状态路径
   * @param {*} value - 新值
   * @param {Object} options - 选项
   * @param {boolean} options.silent - 是否静默更新（不触发订阅者）
   */
  set(path, value, options = {}) {
    const keys = path.split('.');
    const lastKey = keys.pop();

    let current = this._state;
    for (const key of keys) {
      if (current[key] === undefined) {
        current[key] = {};
      }
      current = current[key];
    }

    const oldValue = current[lastKey];

    // 如果值没有变化，不触发更新
    if (this._isEqual(oldValue, value)) {
      return;
    }

    // 记录历史
    if (this._recordHistory) {
      this._addHistory(path, oldValue, value);
    }

    // 更新值
    current[lastKey] = value;

    // 触发通知
    if (!options.silent) {
      if (this._batchUpdating) {
        this._batchChanges.push({ path, newValue: value, oldValue });
      } else {
        this._notify(path, value, oldValue);
      }
    }
  }

  /**
   * 批量设置状态值
   * @param {Object} updates - 键值对 { path: value }
   */
  setMultiple(updates) {
    this._batchUpdating = true;
    this._batchChanges = [];

    try {
      for (const [path, value] of Object.entries(updates)) {
        this.set(path, value);
      }
    } finally {
      this._batchUpdating = false;

      // 批量通知
      if (this._batchChanges.length > 0) {
        this._notifyBatch(this._batchChanges);
      }
      this._batchChanges = [];
    }
  }

  /**
   * 更新状态（合并更新）
   * @param {string} path - 状态路径
   * @param {Object} updates - 要合并的更新
   */
  update(path, updates) {
    const current = this.get(path);
    if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
      this.set(path, { ...current, ...updates });
    } else {
      this.set(path, updates);
    }
  }

  /**
   * 删除状态路径
   * @param {string} path - 状态路径
   */
  delete(path) {
    const keys = path.split('.');
    const lastKey = keys.pop();

    let current = this._state;
    for (const key of keys) {
      if (current[key] === undefined) {
        return;
      }
      current = current[key];
    }

    if (Object.prototype.hasOwnProperty.call(current, lastKey)) {
      const oldValue = current[lastKey];
      delete current[lastKey];
      this._notify(path, undefined, oldValue);
    }
  }

  // ============================================================
  // 订阅系统
  // ============================================================

  /**
   * 订阅状态变更
   * @param {string} path - 状态路径，支持通配符 '*'
   * @param {Function} callback - 回调函数 (newValue, oldValue, path) => void
   * @returns {Function} - 取消订阅函数
   */
  subscribe(path, callback) {
    if (typeof callback !== 'function') {
      console.error('StateManager.subscribe: callback必须是函数');
      return () => {};
    }

    if (!this._subscribers.has(path)) {
      this._subscribers.set(path, new Set());
    }

    this._subscribers.get(path).add(callback);

    // 返回取消订阅函数
    return () => {
      const subs = this._subscribers.get(path);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this._subscribers.delete(path);
        }
      }
    };
  }

  /**
   * 通知订阅者
   * @private
   */
  _notify(path, newValue, oldValue) {
    // 通知精确匹配的订阅者
    const exactSubs = this._subscribers.get(path);
    if (exactSubs) {
      exactSubs.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error(`StateManager: 订阅回调执行失败 (${path}):`, error);
        }
      });
    }

    // 通知父路径的订阅者
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      const wildcardPath = parentPath + '.*';

      const wildcardSubs = this._subscribers.get(wildcardPath);
      if (wildcardSubs) {
        wildcardSubs.forEach(callback => {
          try {
            callback(newValue, oldValue, path);
          } catch (error) {
            console.error(`StateManager: 订阅回调执行失败 (${wildcardPath}):`, error);
          }
        });
      }
    }

    // 通知全局订阅者
    const globalSubs = this._subscribers.get('*');
    if (globalSubs) {
      globalSubs.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error('StateManager: 全局订阅回调执行失败:', error);
        }
      });
    }

    // 发送事件到 EventBus
    if (typeof eventBus !== 'undefined') {
      eventBus.emit(StateEvents.CHANGE, { path, newValue, oldValue });
    }
  }

  /**
   * 批量通知订阅者
   * @private
   */
  _notifyBatch(changes) {
    // 对每个变更单独通知
    changes.forEach(({ path, newValue, oldValue }) => {
      this._notify(path, newValue, oldValue);
    });

    // 发送批量变更事件
    if (typeof eventBus !== 'undefined') {
      eventBus.emit(StateEvents.BATCH_CHANGE, changes);
    }
  }

  // ============================================================
  // 状态快照和重置
  // ============================================================

  /**
   * 获取当前状态快照
   * @param {string} path - 可选，指定路径
   * @returns {Object}
   */
  snapshot(path = null) {
    const state = path ? this.get(path) : this._state;
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * 从快照恢复状态
   * @param {Object} snapshot - 状态快照
   * @param {string} path - 可选，恢复到指定路径
   */
  restore(snapshot, path = null) {
    if (path) {
      this.set(path, JSON.parse(JSON.stringify(snapshot)));
    } else {
      this._state = JSON.parse(JSON.stringify(snapshot));
      this._notify('*', this._state, null);
    }
  }

  /**
   * 重置指定路径的状态
   * @param {string} path - 状态路径，如 'battle', 'character'
   */
  reset(path) {
    const initialState = this._getInitialState();
    const keys = path.split('.');

    let initial = initialState;
    for (const key of keys) {
      if (initial[key] === undefined) {
        console.warn(`StateManager.reset: 无法找到初始状态路径 ${path}`);
        return;
      }
      initial = initial[key];
    }

    this.set(path, JSON.parse(JSON.stringify(initial)));
  }

  /**
   * 重置所有状态
   */
  resetAll() {
    this._state = this._getInitialState();
    this._notify('*', this._state, null);
  }

  // ============================================================
  // 历史记录（调试用）
  // ============================================================

  /**
   * 启用/禁用历史记录
   */
  enableHistory(enabled = true) {
    this._recordHistory = enabled;
  }

  /**
   * 添加历史记录
   * @private
   */
  _addHistory(path, oldValue, newValue) {
    this._history.push({
      timestamp: Date.now(),
      path,
      oldValue: JSON.parse(JSON.stringify(oldValue ?? null)),
      newValue: JSON.parse(JSON.stringify(newValue ?? null)),
    });

    if (this._history.length > this._historyMaxLength) {
      this._history.shift();
    }
  }

  /**
   * 获取历史记录
   */
  getHistory() {
    return [...this._history];
  }

  /**
   * 清空历史记录
   */
  clearHistory() {
    this._history = [];
  }

  // ============================================================
  // 辅助方法
  // ============================================================

  /**
   * 比较两个值是否相等
   * @private
   */
  _isEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return false;
    if (typeof a !== 'object') return false;

    // 简单的对象/数组比较
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }

  /**
   * 获取调试信息
   */
  getDebugInfo() {
    return {
      subscriberCount: this._subscribers.size,
      historyCount: this._history.length,
      paths: Array.from(this._subscribers.keys()),
    };
  }
}

// ============================================================
// 创建全局状态管理器实例
// ============================================================

const stateManager = new StateManager();

// ============================================================
// 兼容层 - 同步旧版全局对象
// ============================================================

/**
 * 创建代理对象，同步旧版全局状态
 * 这是一个过渡方案，最终目标是完全迁移到 StateManager
 */
const StateSyncAdapter = {
  /**
   * 初始化同步适配器
   */
  init() {
    // 同步 GameState
    if (typeof window.GameState !== 'undefined') {
      this._syncGameState();
    }

    // 同步 BattleState
    if (typeof window.BattleState !== 'undefined') {
      this._syncBattleState();
    }

    // 同步 GameVariables
    if (typeof window.GameVariables !== 'undefined') {
      this._syncGameVariables();
    }
  },

  /**
   * 从旧版状态加载到 StateManager
   */
  loadFromLegacy() {
    if (typeof window.GameState !== 'undefined') {
      stateManager.set('character', { ...window.GameState.character });
      stateManager.set('world', { ...window.GameState.world });
      stateManager.set('settings', { ...window.GameState.settings });
    }

    if (typeof window.BattleState !== 'undefined') {
      stateManager.set('battle', { ...window.BattleState });
    }

    if (typeof window.GameVariables !== 'undefined') {
      stateManager.set('variables', JSON.parse(JSON.stringify(window.GameVariables)));
    }
  },

  /**
   * 将 StateManager 状态导出到旧版全局对象
   */
  exportToLegacy() {
    if (typeof window.GameState !== 'undefined') {
      Object.assign(window.GameState.character, stateManager.get('character'));
      Object.assign(window.GameState.world, stateManager.get('world'));
      Object.assign(window.GameState.settings, stateManager.get('settings'));
    }

    if (typeof window.BattleState !== 'undefined') {
      Object.assign(window.BattleState, stateManager.get('battle'));
    }

    if (typeof window.GameVariables !== 'undefined') {
      const variables = stateManager.get('variables');
      Object.assign(window.GameVariables.status, variables.status);
      Object.assign(window.GameVariables.battle, variables.battle);
      Object.assign(window.GameVariables.factions, variables.factions);
      window.GameVariables.npcs = variables.npcs;
      Object.assign(window.GameVariables.reward, variables.reward);
    }
  },

  /**
   * 同步 GameState
   * @private
   */
  _syncGameState() {
    // 订阅 StateManager 变更，同步到 GameState
    stateManager.subscribe('character.*', (newValue, oldValue, path) => {
      const key = path.replace('character.', '');
      window.GameState.character[key] = newValue;
    });

    stateManager.subscribe('world.*', (newValue, oldValue, path) => {
      const key = path.replace('world.', '');
      window.GameState.world[key] = newValue;
    });

    stateManager.subscribe('settings.*', (newValue, oldValue, path) => {
      const key = path.replace('settings.', '');
      window.GameState.settings[key] = newValue;
    });

    stateManager.subscribe('app.currentPage', newValue => {
      window.GameState.currentPage = newValue;
    });

    stateManager.subscribe('app.previousPage', newValue => {
      window.GameState.previousPage = newValue;
    });
  },

  /**
   * 同步 BattleState
   * @private
   */
  _syncBattleState() {
    stateManager.subscribe('battle.*', (newValue, oldValue, path) => {
      const key = path.replace('battle.', '');
      if (!key.includes('.')) {
        window.BattleState[key] = newValue;
      }
    });
  },

  /**
   * 同步 GameVariables
   * @private
   */
  _syncGameVariables() {
    stateManager.subscribe('variables.*', (newValue, oldValue, path) => {
      const relativePath = path.replace('variables.', '');
      const keys = relativePath.split('.');

      let target = window.GameVariables;
      for (let i = 0; i < keys.length - 1; i++) {
        if (target[keys[i]] === undefined) {
          target[keys[i]] = {};
        }
        target = target[keys[i]];
      }
      target[keys[keys.length - 1]] = newValue;
    });
  },
};

// ============================================================
// 便捷函数
// ============================================================

/**
 * 获取角色状态
 * @returns {Object}
 */
function getCharacter() {
  return stateManager.get('character');
}

/**
 * 更新角色状态
 * @param {Object} updates
 */
function updateCharacter(updates) {
  stateManager.update('character', updates);
}

/**
 * 获取战斗状态
 * @returns {Object}
 */
function getBattle() {
  return stateManager.get('battle');
}

/**
 * 更新战斗状态
 * @param {Object} updates
 */
function updateBattle(updates) {
  stateManager.update('battle', updates);
}

/**
 * 获取游戏变量
 * @param {string} path - 可选，相对路径
 * @returns {*}
 */
function getVariable(path = null) {
  return path ? stateManager.get(`variables.${path}`) : stateManager.get('variables');
}

/**
 * 设置游戏变量
 * @param {string} path - 相对路径
 * @param {*} value
 */
function setVariable(path, value) {
  stateManager.set(`variables.${path}`, value);
}

// ============================================================
// 导出
// ============================================================

// ES Module 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StateManager,
    stateManager,
    StateSyncAdapter,
    getCharacter,
    updateCharacter,
    getBattle,
    updateBattle,
    getVariable,
    setVariable,
  };
}

// 全局导出
window.StateManager = StateManager;
window.stateManager = stateManager;
window.StateSyncAdapter = StateSyncAdapter;
window.getCharacter = getCharacter;
window.updateCharacter = updateCharacter;
window.getBattle = getBattle;
window.updateBattle = updateBattle;
window.getVariable = getVariable;
window.setVariable = setVariable;
