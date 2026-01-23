/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * EventBus - 事件总线
 * 统一的事件通信机制，解耦模块间依赖
 * ============================================================ */

/**
 * 事件总线类
 * 提供发布/订阅模式的事件通信
 */
class EventBus {
  constructor() {
    /** @type {Map<string, Array<{callback: Function, context: any, once: boolean}>>} */
    this.events = new Map();
    /** @type {boolean} 是否启用调试模式 */
    this.debug = false;
  }

  /**
   * 订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数 (data) => void
   * @param {Object} context - 回调函数执行上下文
   * @returns {Function} - 取消订阅的函数
   */
  on(event, callback, context = null) {
    if (typeof callback !== 'function') {
      console.error(`EventBus.on: callback必须是函数，收到 ${typeof callback}`);
      return () => {};
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const handler = { callback, context, once: false };
    this.events.get(event).push(handler);

    if (this.debug) {
      console.log(`[EventBus] 订阅事件: ${event}, 当前监听器数: ${this.events.get(event).length}`);
    }

    // 返回取消订阅函数
    return () => this.off(event, callback);
  }

  /**
   * 订阅一次性事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} context - 回调函数执行上下文
   * @returns {Function} - 取消订阅的函数
   */
  once(event, callback, context = null) {
    if (typeof callback !== 'function') {
      console.error(`EventBus.once: callback必须是函数`);
      return () => {};
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const handler = { callback, context, once: true };
    this.events.get(event).push(handler);

    return () => this.off(event, callback);
  }

  /**
   * 取消订阅
   * @param {string} event - 事件名称
   * @param {Function} callback - 要移除的回调函数
   */
  off(event, callback) {
    const handlers = this.events.get(event);
    if (!handlers) return;

    const index = handlers.findIndex(h => h.callback === callback);
    if (index > -1) {
      handlers.splice(index, 1);
      if (this.debug) {
        console.log(`[EventBus] 取消订阅: ${event}, 剩余监听器数: ${handlers.length}`);
      }
    }

    // 如果没有监听器了，删除该事件
    if (handlers.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * 取消订阅某事件的所有监听器
   * @param {string} event - 事件名称
   */
  offAll(event) {
    if (this.events.has(event)) {
      this.events.delete(event);
      if (this.debug) {
        console.log(`[EventBus] 清除所有监听器: ${event}`);
      }
    }
  }

  /**
   * 发布事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    const handlers = this.events.get(event);

    if (this.debug) {
      console.log(`[EventBus] 发布事件: ${event}`, data);
    }

    if (!handlers || handlers.length === 0) {
      return;
    }

    // 复制数组避免在遍历时修改
    const handlersToCall = [...handlers];
    const handlersToRemove = [];

    handlersToCall.forEach(handler => {
      try {
        handler.callback.call(handler.context, data);

        // 标记一次性监听器待移除
        if (handler.once) {
          handlersToRemove.push(handler);
        }
      } catch (error) {
        console.error(`[EventBus] 事件处理器执行失败 (${event}):`, error);
      }
    });

    // 移除一次性监听器
    handlersToRemove.forEach(handler => {
      this.off(event, handler.callback);
    });
  }

  /**
   * 发布事件（异步，等待所有处理器完成）
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @returns {Promise<void>}
   */
  async emitAsync(event, data) {
    const handlers = this.events.get(event);

    if (!handlers || handlers.length === 0) {
      return;
    }

    const handlersToCall = [...handlers];
    const handlersToRemove = [];

    for (const handler of handlersToCall) {
      try {
        await Promise.resolve(handler.callback.call(handler.context, data));

        if (handler.once) {
          handlersToRemove.push(handler);
        }
      } catch (error) {
        console.error(`[EventBus] 异步事件处理器执行失败 (${event}):`, error);
      }
    }

    handlersToRemove.forEach(handler => {
      this.off(event, handler.callback);
    });
  }

  /**
   * 检查是否有某事件的监听器
   * @param {string} event - 事件名称
   * @returns {boolean}
   */
  has(event) {
    const handlers = this.events.get(event);
    return handlers && handlers.length > 0;
  }

  /**
   * 获取某事件的监听器数量
   * @param {string} event - 事件名称
   * @returns {number}
   */
  listenerCount(event) {
    const handlers = this.events.get(event);
    return handlers ? handlers.length : 0;
  }

  /**
   * 获取所有已注册的事件名称
   * @returns {string[]}
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * 清除所有事件监听器
   */
  clear() {
    this.events.clear();
    if (this.debug) {
      console.log('[EventBus] 已清除所有事件监听器');
    }
  }

  /**
   * 启用/禁用调试模式
   * @param {boolean} enabled
   */
  setDebug(enabled) {
    this.debug = enabled;
  }
}

// ============================================================
// 预定义事件常量
// ============================================================

/**
 * 应用级事件
 */
const AppEvents = {
  // 初始化事件
  INIT_START: 'app:init:start',
  INIT_COMPLETE: 'app:init:complete',

  // 页面导航事件
  PAGE_BEFORE_LEAVE: 'page:before:leave',
  PAGE_LEAVE: 'page:leave',
  PAGE_BEFORE_ENTER: 'page:before:enter',
  PAGE_ENTER: 'page:enter',
  PAGE_CHANGE: 'page:change',

  // 模态框事件
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',

  // 加载状态
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end',

  // 通知事件
  TOAST_SHOW: 'toast:show',

  // 错误事件
  ERROR: 'app:error',
};

/**
 * 状态变更事件
 */
const StateEvents = {
  // 状态变更
  CHANGE: 'state:change',
  BATCH_CHANGE: 'state:batch:change',

  // 角色相关
  CHARACTER_UPDATE: 'character:update',
  CHARACTER_HP_CHANGE: 'character:hp:change',
  CHARACTER_GOLD_CHANGE: 'character:gold:change',

  // 世界相关
  WORLD_LOAD: 'world:load',
  WORLD_UPDATE: 'world:update',

  // 变量相关
  VARIABLES_UPDATE: 'variables:update',
};

/**
 * 战斗事件
 */
const BattleEvents = {
  // 战斗流程
  START: 'battle:start',
  END: 'battle:end',
  VICTORY: 'battle:victory',
  DEFEAT: 'battle:defeat',
  FLEE: 'battle:flee',

  // 回合事件
  TURN_START: 'battle:turn:start',
  TURN_END: 'battle:turn:end',
  PLAYER_TURN: 'battle:player:turn',
  ENEMY_TURN: 'battle:enemy:turn',

  // 卡牌事件
  CARD_DRAW: 'battle:card:draw',
  CARD_PLAY: 'battle:card:play',
  CARD_DISCARD: 'battle:card:discard',
  CARD_EXHAUST: 'battle:card:exhaust',

  // 能量事件
  ENERGY_CHANGE: 'battle:energy:change',

  // 伤害/格挡事件
  DAMAGE_DEALT: 'battle:damage:dealt',
  DAMAGE_TAKEN: 'battle:damage:taken',
  BLOCK_GAIN: 'battle:block:gain',

  // 敌人事件
  ENEMY_ACTION: 'battle:enemy:action',
  ENEMY_INTENT: 'battle:enemy:intent',
  ENEMY_DEATH: 'battle:enemy:death',

  // 状态效果
  STATUS_APPLY: 'battle:status:apply',
  STATUS_REMOVE: 'battle:status:remove',
};

/**
 * 叙事事件
 */
const NarrativeEvents = {
  // 叙事内容
  ENTRY_ADD: 'narrative:entry:add',
  ENTRY_CLEAR: 'narrative:entry:clear',

  // 玩家输入
  INPUT_SUBMIT: 'narrative:input:submit',

  // AI响应
  AI_REQUEST_START: 'narrative:ai:start',
  AI_REQUEST_SUCCESS: 'narrative:ai:success',
  AI_REQUEST_ERROR: 'narrative:ai:error',
  AI_STREAMING: 'narrative:ai:streaming',

  // 战斗触发
  BATTLE_TRIGGER: 'narrative:battle:trigger',

  // 总结
  SUMMARY_GENERATE: 'narrative:summary:generate',
};

/**
 * 存档事件
 */
const SaveEvents = {
  SAVE_START: 'save:start',
  SAVE_SUCCESS: 'save:success',
  SAVE_ERROR: 'save:error',

  LOAD_START: 'load:start',
  LOAD_SUCCESS: 'load:success',
  LOAD_ERROR: 'load:error',

  ARCHIVE_CREATE: 'archive:create',
  ARCHIVE_DELETE: 'archive:delete',
  ARCHIVE_RENAME: 'archive:rename',

  EXPORT: 'save:export',
  IMPORT: 'save:import',
};

/**
 * UI事件
 */
const UIEvents = {
  // 侧边栏
  SIDEBAR_TOGGLE: 'ui:sidebar:toggle',
  SIDEBAR_OPEN: 'ui:sidebar:open',
  SIDEBAR_CLOSE: 'ui:sidebar:close',

  // 面板
  PANEL_UPDATE: 'ui:panel:update',

  // 按钮
  BUTTON_CLICK: 'ui:button:click',

  // 输入
  INPUT_CHANGE: 'ui:input:change',

  // 可折叠区域
  COLLAPSE_TOGGLE: 'ui:collapse:toggle',
};

// ============================================================
// 创建全局事件总线实例
// ============================================================

const eventBus = new EventBus();

// ============================================================
// 兼容层 - 整合现有的 VariableChangeEmitter
// ============================================================

/**
 * 变量变更事件适配器
 * 将现有的 VariableChangeEmitter 事件转发到 EventBus
 */
const VariableEventAdapter = {
  /**
   * 初始化适配器
   */
  init() {
    // 如果已存在 VariableChangeEmitter，监听其事件并转发
    if (typeof window.VariableChangeEmitter !== 'undefined') {
      const originalEmit = window.VariableChangeEmitter.emit.bind(window.VariableChangeEmitter);

      // 包装 emit 方法
      window.VariableChangeEmitter.emit = function (path, newValue, oldValue) {
        // 调用原始方法
        originalEmit(path, newValue, oldValue);

        // 同时发送到 EventBus
        eventBus.emit(StateEvents.VARIABLES_UPDATE, { path, newValue, oldValue });

        // 针对特定路径发送专门事件
        const eventName = `variables.${path.replace(/^\//, '').replace(/\//g, '.')}`;
        eventBus.emit(eventName, { newValue, oldValue, path });
      };
    }
  },

  /**
   * 订阅变量变更
   * @param {string} path - 变量路径 (如 'status.hp', 'battle.enemy.hp')
   * @param {Function} callback - 回调函数
   * @returns {Function} - 取消订阅函数
   */
  onVariableChange(path, callback) {
    const eventName = `variables.${path}`;
    return eventBus.on(eventName, callback);
  },
};

// ============================================================
// 导出
// ============================================================

// ES Module 导出（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EventBus,
    eventBus,
    AppEvents,
    StateEvents,
    BattleEvents,
    NarrativeEvents,
    SaveEvents,
    UIEvents,
    VariableEventAdapter,
  };
}

// 全局导出（兼容现有代码）
window.EventBus = EventBus;
window.eventBus = eventBus;
window.AppEvents = AppEvents;
window.StateEvents = StateEvents;
window.BattleEvents = BattleEvents;
window.NarrativeEvents = NarrativeEvents;
window.SaveEvents = SaveEvents;
window.UIEvents = UIEvents;
window.VariableEventAdapter = VariableEventAdapter;
