/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * Router - 页面路由管理器
 * 管理页面导航和生命周期
 * ============================================================ */

/**
 * 页面配置类型
 * @typedef {Object} PageConfig
 * @property {string} name - 页面名称
 * @property {string} elementId - 页面DOM元素ID
 * @property {Function} [onEnter] - 进入页面时的回调
 * @property {Function} [onLeave] - 离开页面时的回调
 * @property {Function} [onInit] - 页面初始化回调（仅首次进入时调用）
 * @property {boolean} [requiresAuth] - 是否需要验证（如API配置）
 * @property {boolean} [requiresGame] - 是否需要游戏已开始
 * @property {Object} [meta] - 页面元数据
 */

/**
 * 路由器类
 */
class Router {
  constructor() {
    /**
     * 已注册的页面
     * @type {Map<string, PageConfig>}
     * @private
     */
    this._pages = new Map();

    /**
     * 当前页面名称
     * @type {string}
     * @private
     */
    this._currentPage = null;

    /**
     * 上一个页面名称
     * @type {string}
     * @private
     */
    this._previousPage = null;

    /**
     * 导航历史
     * @type {Array<{page: string, params: Object, timestamp: number}>}
     * @private
     */
    this._history = [];

    /**
     * 历史最大长度
     * @private
     */
    this._historyMaxLength = 50;

    /**
     * 已初始化的页面
     * @type {Set<string>}
     * @private
     */
    this._initializedPages = new Set();

    /**
     * 路由守卫
     * @type {Array<Function>}
     * @private
     */
    this._guards = [];

    /**
     * 全局导航钩子
     * @private
     */
    this._beforeEachHooks = [];
    this._afterEachHooks = [];

    /**
     * 是否正在导航
     * @private
     */
    this._isNavigating = false;

    /**
     * 待处理的导航
     * @private
     */
    this._pendingNavigation = null;
  }

  // ============================================================
  // 页面注册
  // ============================================================

  /**
   * 注册页面
   * @param {string} name - 页面名称
   * @param {PageConfig} config - 页面配置
   * @returns {Router} - 支持链式调用
   */
  register(name, config) {
    if (!name || typeof name !== 'string') {
      console.error('[Router] 页面名称无效');
      return this;
    }

    const pageConfig = {
      name,
      elementId: config.elementId || `page-${name}`,
      onEnter: config.onEnter || null,
      onLeave: config.onLeave || null,
      onInit: config.onInit || null,
      requiresAuth: config.requiresAuth || false,
      requiresGame: config.requiresGame || false,
      meta: config.meta || {},
    };

    this._pages.set(name, pageConfig);
    return this;
  }

  /**
   * 批量注册页面
   * @param {Object<string, PageConfig>} pages - 页面配置对象
   * @returns {Router}
   */
  registerAll(pages) {
    for (const [name, config] of Object.entries(pages)) {
      this.register(name, config);
    }
    return this;
  }

  /**
   * 取消注册页面
   * @param {string} name - 页面名称
   */
  unregister(name) {
    this._pages.delete(name);
    this._initializedPages.delete(name);
  }

  // ============================================================
  // 导航
  // ============================================================

  /**
   * 导航到指定页面
   * @param {string} pageName - 目标页面名称
   * @param {Object} params - 导航参数
   * @param {Object} options - 导航选项
   * @param {boolean} options.replace - 是否替换当前历史记录
   * @param {boolean} options.silent - 是否静默导航（不触发钩子）
   * @returns {Promise<boolean>} - 导航是否成功
   */
  async navigate(pageName, params = {}, options = {}) {
    // 如果正在导航，排队
    if (this._isNavigating) {
      this._pendingNavigation = { pageName, params, options };
      return false;
    }

    const page = this._pages.get(pageName);
    if (!page) {
      console.error(`[Router] 页面未注册: ${pageName}`);
      return false;
    }

    // 如果已经在当前页面，不重复导航
    if (this._currentPage === pageName && !options.force) {
      return true;
    }

    this._isNavigating = true;

    try {
      // 执行导航守卫
      if (!options.silent) {
        const canProceed = await this._runGuards(pageName, params);
        if (!canProceed) {
          return false;
        }
      }

      // 执行 beforeEach 钩子
      if (!options.silent) {
        for (const hook of this._beforeEachHooks) {
          const result = await Promise.resolve(hook(pageName, this._currentPage, params));
          if (result === false) {
            return false;
          }
        }
      }

      // 离开当前页面
      if (this._currentPage) {
        await this._leavePage(this._currentPage);
      }

      // 更新状态
      this._previousPage = this._currentPage;
      this._currentPage = pageName;

      // 记录历史
      if (!options.replace && this._previousPage) {
        this._addHistory(this._previousPage, {});
      }

      // 进入新页面
      await this._enterPage(pageName, params);

      // 更新 DOM
      this._updateDOM(pageName);

      // 更新状态管理器
      this._syncState(pageName);

      // 执行 afterEach 钩子
      if (!options.silent) {
        for (const hook of this._afterEachHooks) {
          await Promise.resolve(hook(pageName, this._previousPage, params));
        }
      }

      // 发送事件
      if (typeof eventBus !== 'undefined') {
        eventBus.emit(AppEvents.PAGE_CHANGE, {
          current: pageName,
          previous: this._previousPage,
          params,
        });
      }

      return true;
    } catch (error) {
      console.error(`[Router] 导航失败:`, error);
      return false;
    } finally {
      this._isNavigating = false;

      // 处理待处理的导航
      if (this._pendingNavigation) {
        const pending = this._pendingNavigation;
        this._pendingNavigation = null;
        await this.navigate(pending.pageName, pending.params, pending.options);
      }
    }
  }

  /**
   * 返回上一页
   * @returns {Promise<boolean>}
   */
  async back() {
    const lastHistory = this._history.pop();
    if (lastHistory) {
      return this.navigate(lastHistory.page, lastHistory.params, { replace: true });
    }

    // 如果没有历史，尝试返回previousPage
    if (this._previousPage) {
      return this.navigate(this._previousPage, {}, { replace: true });
    }

    // 默认返回首页
    return this.navigate('home', {}, { replace: true });
  }

  /**
   * 替换当前页面
   * @param {string} pageName - 目标页面名称
   * @param {Object} params - 导航参数
   * @returns {Promise<boolean>}
   */
  async replace(pageName, params = {}) {
    return this.navigate(pageName, params, { replace: true });
  }

  /**
   * 刷新当前页面
   * @returns {Promise<boolean>}
   */
  async refresh() {
    if (this._currentPage) {
      return this.navigate(this._currentPage, {}, { force: true, replace: true });
    }
    return false;
  }

  // ============================================================
  // 页面生命周期
  // ============================================================

  /**
   * 进入页面
   * @private
   */
  async _enterPage(pageName, params) {
    const page = this._pages.get(pageName);
    if (!page) return;

    // 发送进入前事件
    if (typeof eventBus !== 'undefined') {
      eventBus.emit(AppEvents.PAGE_BEFORE_ENTER, { page: pageName, params });
    }

    // 首次进入时初始化
    if (!this._initializedPages.has(pageName) && page.onInit) {
      await Promise.resolve(page.onInit(params));
      this._initializedPages.add(pageName);
    }

    // 执行进入回调
    if (page.onEnter) {
      await Promise.resolve(page.onEnter(params));
    }

    // 发送进入事件
    if (typeof eventBus !== 'undefined') {
      eventBus.emit(AppEvents.PAGE_ENTER, { page: pageName, params });
    }
  }

  /**
   * 离开页面
   * @private
   */
  async _leavePage(pageName) {
    const page = this._pages.get(pageName);
    if (!page) return;

    // 发送离开前事件
    if (typeof eventBus !== 'undefined') {
      eventBus.emit(AppEvents.PAGE_BEFORE_LEAVE, { page: pageName });
    }

    // 执行离开回调
    if (page.onLeave) {
      await Promise.resolve(page.onLeave());
    }

    // 发送离开事件
    if (typeof eventBus !== 'undefined') {
      eventBus.emit(AppEvents.PAGE_LEAVE, { page: pageName });
    }
  }

  /**
   * 更新DOM显示
   * @private
   */
  _updateDOM(pageName) {
    // 使用 DOMManager 如果可用
    if (typeof domManager !== 'undefined') {
      domManager.showPage(pageName);
      return;
    }

    // 回退到直接操作
    this._pages.forEach((config, name) => {
      const element = document.getElementById(config.elementId);
      if (element) {
        if (name === pageName) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
      }
    });
  }

  /**
   * 同步状态
   * @private
   */
  _syncState(pageName) {
    // 更新 StateManager
    if (typeof stateManager !== 'undefined') {
      stateManager.set('app.previousPage', this._previousPage);
      stateManager.set('app.currentPage', pageName);
    }

    // 兼容旧版 GameState
    if (typeof GameState !== 'undefined') {
      GameState.previousPage = this._previousPage;
      GameState.currentPage = pageName;
    }
  }

  // ============================================================
  // 导航守卫
  // ============================================================

  /**
   * 添加导航守卫
   * @param {Function} guard - 守卫函数 (to, from, params) => boolean|Promise<boolean>
   * @returns {Function} - 移除守卫的函数
   */
  addGuard(guard) {
    if (typeof guard !== 'function') {
      console.error('[Router] 守卫必须是函数');
      return () => {};
    }

    this._guards.push(guard);
    return () => {
      const index = this._guards.indexOf(guard);
      if (index > -1) {
        this._guards.splice(index, 1);
      }
    };
  }

  /**
   * 运行所有守卫
   * @private
   */
  async _runGuards(to, params) {
    const from = this._currentPage;
    const toPage = this._pages.get(to);

    // 检查页面级别的条件
    if (toPage) {
      // 检查是否需要游戏已开始
      if (toPage.requiresGame) {
        const gameStarted = this._checkGameStarted();
        if (!gameStarted) {
          console.warn(`[Router] 页面 ${to} 需要游戏已开始`);
          return false;
        }
      }

      // 检查是否需要API配置
      if (toPage.requiresAuth) {
        const hasAuth = this._checkAuth();
        if (!hasAuth) {
          console.warn(`[Router] 页面 ${to} 需要API配置`);
          // 可以跳转到设置页面
          // await this.navigate('settings');
          return false;
        }
      }
    }

    // 运行自定义守卫
    for (const guard of this._guards) {
      try {
        const result = await Promise.resolve(guard(to, from, params));
        if (result === false) {
          return false;
        }
      } catch (error) {
        console.error('[Router] 守卫执行失败:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * 检查游戏是否已开始
   * @private
   */
  _checkGameStarted() {
    if (typeof stateManager !== 'undefined') {
      return stateManager.get('world.isLoaded', false);
    }
    if (typeof GameState !== 'undefined') {
      return GameState.world?.isLoaded || false;
    }
    return false;
  }

  /**
   * 检查是否有API配置
   * @private
   */
  _checkAuth() {
    if (typeof stateManager !== 'undefined') {
      const useTavern = stateManager.get('settings.useTavernApi', false);
      if (useTavern) return true;
      const apiKey = stateManager.get('settings.apiKey', '');
      return apiKey.length > 0;
    }
    if (typeof GameState !== 'undefined') {
      if (GameState.settings?.useTavernApi) return true;
      return GameState.settings?.apiKey?.length > 0;
    }
    return false;
  }

  // ============================================================
  // 全局钩子
  // ============================================================

  /**
   * 添加全局 beforeEach 钩子
   * @param {Function} hook - 钩子函数 (to, from, params) => boolean|Promise<boolean>
   * @returns {Function} - 移除钩子的函数
   */
  beforeEach(hook) {
    this._beforeEachHooks.push(hook);
    return () => {
      const index = this._beforeEachHooks.indexOf(hook);
      if (index > -1) {
        this._beforeEachHooks.splice(index, 1);
      }
    };
  }

  /**
   * 添加全局 afterEach 钩子
   * @param {Function} hook - 钩子函数 (to, from, params) => void
   * @returns {Function} - 移除钩子的函数
   */
  afterEach(hook) {
    this._afterEachHooks.push(hook);
    return () => {
      const index = this._afterEachHooks.indexOf(hook);
      if (index > -1) {
        this._afterEachHooks.splice(index, 1);
      }
    };
  }

  // ============================================================
  // 历史管理
  // ============================================================

  /**
   * 添加历史记录
   * @private
   */
  _addHistory(page, params) {
    this._history.push({
      page,
      params: { ...params },
      timestamp: Date.now(),
    });

    // 限制历史长度
    if (this._history.length > this._historyMaxLength) {
      this._history.shift();
    }
  }

  /**
   * 获取导航历史
   * @returns {Array}
   */
  getHistory() {
    return [...this._history];
  }

  /**
   * 清空历史
   */
  clearHistory() {
    this._history = [];
  }

  /**
   * 检查是否可以返回
   * @returns {boolean}
   */
  canGoBack() {
    return this._history.length > 0 || this._previousPage !== null;
  }

  // ============================================================
  // 状态查询
  // ============================================================

  /**
   * 获取当前页面名称
   * @returns {string|null}
   */
  getCurrentPage() {
    return this._currentPage;
  }

  /**
   * 获取上一个页面名称
   * @returns {string|null}
   */
  getPreviousPage() {
    return this._previousPage;
  }

  /**
   * 获取页面配置
   * @param {string} name - 页面名称
   * @returns {PageConfig|null}
   */
  getPageConfig(name) {
    return this._pages.get(name) || null;
  }

  /**
   * 获取所有已注册的页面名称
   * @returns {string[]}
   */
  getPageNames() {
    return Array.from(this._pages.keys());
  }

  /**
   * 检查页面是否已注册
   * @param {string} name - 页面名称
   * @returns {boolean}
   */
  hasPage(name) {
    return this._pages.has(name);
  }

  /**
   * 检查当前是否在指定页面
   * @param {string} name - 页面名称
   * @returns {boolean}
   */
  isCurrentPage(name) {
    return this._currentPage === name;
  }

  // ============================================================
  // 调试
  // ============================================================

  /**
   * 获取调试信息
   * @returns {Object}
   */
  getDebugInfo() {
    return {
      currentPage: this._currentPage,
      previousPage: this._previousPage,
      registeredPages: this.getPageNames(),
      initializedPages: Array.from(this._initializedPages),
      historyLength: this._history.length,
      guardsCount: this._guards.length,
      isNavigating: this._isNavigating,
    };
  }
}

// ============================================================
// 创建全局路由器实例
// ============================================================

const router = new Router();

// ============================================================
// 默认页面注册
// ============================================================

/**
 * 初始化默认路由配置
 */
function initDefaultRoutes() {
  router.registerAll({
    home: {
      elementId: 'page-home',
      meta: { title: '首页' },
    },
    character: {
      elementId: 'page-character',
      meta: { title: '创建角色' },
    },
    world: {
      elementId: 'page-world',
      meta: { title: '构筑世界' },
    },
    game: {
      elementId: 'page-game',
      requiresGame: true,
      meta: { title: '游戏' },
      onEnter: () => {
        // 更新游戏界面
        if (typeof GameUI !== 'undefined' && GameUI.updateCharacterPanel) {
          GameUI.updateCharacterPanel();
        }
      },
    },
    settings: {
      elementId: 'page-settings',
      meta: { title: '设置' },
    },
    variables: {
      elementId: 'page-variables',
      meta: { title: '变量设置' },
    },
  });
}

// ============================================================
// 兼容层 - 与旧版 navigateTo 函数协作
// ============================================================

/**
 * 兼容旧版 navigateTo 函数
 * 注意：如果旧版 navigateTo 已存在（来自 utils.js），则不覆盖
 * 新架构的 router.navigate 可以单独使用，但不会强制替换旧版函数
 * @param {string} pageName - 页面名称
 * @returns {Promise<boolean>}
 */
async function navigateToCompat(pageName) {
  return router.navigate(pageName);
}

// 只有当旧版 navigateTo 不存在时才设置
// 如果旧版已存在（来自 utils.js），保持其功能不变
// 这样可以确保现有代码继续正常工作
if (typeof window.navigateTo === 'undefined') {
  window.navigateTo = navigateToCompat;
}
// 注意：不再包装旧版函数，避免双重执行导致的问题

// ============================================================
// 导出
// ============================================================

// ES Module 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Router,
    router,
    initDefaultRoutes,
  };
}

// 全局导出
window.Router = Router;
window.router = router;
window.initDefaultRoutes = initDefaultRoutes;
