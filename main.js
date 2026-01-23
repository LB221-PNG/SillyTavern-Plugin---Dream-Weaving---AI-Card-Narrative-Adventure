/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * main.js - 新的应用入口
 * 整合所有核心模块，提供统一的初始化流程
 * ============================================================ */

/**
 * 应用主类
 * 负责初始化和协调所有模块
 */
class Application {
  constructor() {
this.version = '0.2.2';
    this.name = '克劳德 - AI卡牌叙事冒险';
    this.initialized = false;
    this.debug = false;
  }

  /**
   * 初始化应用
   * @param {Object} options - 初始化选项
   * @returns {Promise<void>}
   */
  async init(options = {}) {
    if (this.initialized) {
      console.warn('[App] 应用已初始化');
      return;
    }

    console.log(`🎮 ${this.name} v${this.version}`);
    console.log('正在初始化...');

    const startTime = performance.now();

    try {
      // 发送初始化开始事件
      if (typeof eventBus !== 'undefined') {
        eventBus.emit(AppEvents.INIT_START, { version: this.version });
      }

      // 1. 初始化核心模块
      await this._initCoreModules();

      // 2. 初始化兼容层
      this._initCompatibilityLayer();

      // 3. 初始化路由
      this._initRouter();

      // 4. 初始化UI模块
      this._initUIModules();

      // 5. 初始化系统模块
      this._initSystemModules();

      // 6. 加载设置
      this._loadSettings();

      // 7. 绑定全局事件
      this._bindGlobalEvents();

      // 8. 性能优化初始化
      this._initPerformanceOptimizations();

      this.initialized = true;

      const endTime = performance.now();
      console.log(`✅ 初始化完成 (${(endTime - startTime).toFixed(2)}ms)`);

      // 发送初始化完成事件
      if (typeof eventBus !== 'undefined') {
        eventBus.emit(AppEvents.INIT_COMPLETE, {
          version: this.version,
          duration: endTime - startTime,
        });
      }
    } catch (error) {
      console.error('❌ 初始化失败:', error);

      if (typeof eventBus !== 'undefined') {
        eventBus.emit(AppEvents.ERROR, { type: 'init', error });
      }

      throw error;
    }
  }

  /**
   * 初始化核心模块
   * @private
   */
  async _initCoreModules() {
    // 初始化DOM管理器
    if (typeof domManager !== 'undefined') {
      domManager.init();
      console.log('  - DOM管理器 ✓');
    }

    // 初始化兼容层（保持与旧代码的兼容）
    if (typeof DOMCompat !== 'undefined') {
      DOMCompat.init();
    }

    // 兼容：调用旧版 cacheDOM
    if (typeof cacheDOM === 'function') {
      cacheDOM();
      console.log('  - DOM缓存（兼容模式） ✓');
    }

    // 初始化变量事件适配器
    if (typeof VariableEventAdapter !== 'undefined') {
      VariableEventAdapter.init();
      console.log('  - 变量事件适配器 ✓');
    }

    // 初始化状态同步适配器
    if (typeof StateSyncAdapter !== 'undefined') {
      StateSyncAdapter.init();
      console.log('  - 状态同步适配器 ✓');
    }
  }

  /**
   * 初始化兼容层
   * @private
   */
  _initCompatibilityLayer() {
    // 确保旧版全局对象存在
    if (typeof window.GameState === 'undefined') {
      console.warn('[App] GameState 未定义，使用 StateManager');
    }

    if (typeof window.BattleState === 'undefined') {
      console.warn('[App] BattleState 未定义，使用 StateManager');
    }

    if (typeof window.GameVariables === 'undefined') {
      console.warn('[App] GameVariables 未定义，使用 StateManager');
    }

    // 从 StateManager 同步初始状态到旧版对象
    if (typeof StateSyncAdapter !== 'undefined') {
      StateSyncAdapter.exportToLegacy();
    }
  }

  /**
   * 初始化路由
   * @private
   */
  _initRouter() {
    if (typeof router !== 'undefined' && typeof initDefaultRoutes === 'function') {
      initDefaultRoutes();
      console.log('  - 路由系统 ✓');
    }
  }

  /**
   * 初始化UI模块
   * @private
   */
  _initUIModules() {
    // 开始界面
    if (typeof HomeUI !== 'undefined') {
      HomeUI.init();
      console.log('  - 开始界面 ✓');
    }

    // 角色创建界面
    if (typeof CharacterUI !== 'undefined') {
      CharacterUI.init();
      console.log('  - 角色创建界面 ✓');
    }

    // 世界创建界面
    if (typeof WorldUI !== 'undefined') {
      WorldUI.init();
      console.log('  - 世界创建界面 ✓');
    }

    // 游戏主界面
    if (typeof GameUI !== 'undefined') {
      GameUI.init();
      console.log('  - 游戏主界面 ✓');
    }

    // 卡组界面
    if (typeof DeckUI !== 'undefined') {
      DeckUI.init();
      console.log('  - 卡组界面 ✓');
    }

    // 设置界面
    if (typeof SettingsUI !== 'undefined') {
      SettingsUI.init();
      console.log('  - 设置界面 ✓');
    }

    // 变量设置界面
    if (typeof VariablesUI !== 'undefined') {
      VariablesUI.init();
      console.log('  - 变量设置界面 ✓');
    }

    // 总结功能界面
    if (typeof SummaryUI !== 'undefined') {
      SummaryUI.init();
      console.log('  - 总结界面 ✓');
    }
  }

  /**
   * 初始化系统模块
   * @private
   */
  _initSystemModules() {
    // 战斗系统
    if (typeof BattleSystem !== 'undefined' && BattleSystem.bindEvents) {
      BattleSystem.bindEvents();
      console.log('  - 战斗系统 ✓');
    }

    // 叙事系统
    if (typeof NarrativeSystem !== 'undefined' && NarrativeSystem.bindEvents) {
      NarrativeSystem.bindEvents();
      console.log('  - 叙事系统 ✓');
    }
  }

  /**
   * 加载设置
   * @private
   */
  _loadSettings() {
    if (typeof SaveSystem !== 'undefined') {
      SaveSystem.loadSettings();
      console.log('  - 设置已加载 ✓');
      
      // 立即应用主题设置，确保页面加载时主题生效
      if (typeof GameState !== 'undefined' && GameState.settings?.theme) {
        const theme = GameState.settings.theme;
        document.documentElement.setAttribute('data-theme', theme);
        console.log(`  - 主题已应用: ${theme} ✓`);
      }
    }
  }

  /**
   * 绑定全局事件
   * @private
   */
  _bindGlobalEvents() {
    // 页面可见性变化时自动保存
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this._autoSave();
      }
    });

    // 窗口关闭前保存
    window.addEventListener('beforeunload', () => {
      this._autoSave();
    });

    // 全局键盘快捷键
    document.addEventListener('keydown', e => {
      // Ctrl+S 保存
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this._manualSave();
      }

      // Escape 关闭模态框
      if (e.key === 'Escape') {
        this._closeAllModals();
      }
    });

    // 网络状态变化
    window.addEventListener('online', () => {
      this._showToast('网络已连接');
    });

    window.addEventListener('offline', () => {
      this._showToast('网络已断开，部分功能可能不可用');
    });

    console.log('  - 全局事件 ✓');
  }

  /**
   * 性能优化初始化
   * @private
   */
  _initPerformanceOptimizations() {
    // 使用 requestIdleCallback 进行非关键初始化
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // 预热卡牌系统
        if (typeof CardSystem !== 'undefined' && typeof GameState !== 'undefined') {
          CardSystem.generateInitialDeck(GameState.character);
          console.log('  - 卡牌系统预热 ✓');
        }
      });
    }
  }

  /**
   * 自动保存
   * @private
   */
  _autoSave() {
    const gameLoaded = typeof GameState !== 'undefined' && GameState.world?.isLoaded;
    if (gameLoaded && typeof SaveSystem !== 'undefined') {
      SaveSystem.save();
    }
  }

  /**
   * 手动保存
   * @private
   */
  _manualSave() {
    const gameLoaded = typeof GameState !== 'undefined' && GameState.world?.isLoaded;
    if (gameLoaded && typeof SaveSystem !== 'undefined') {
      SaveSystem.save();
    }
  }

  /**
   * 关闭所有模态框
   * @private
   */
  _closeAllModals() {
    // 使用 DOMManager
    if (typeof domManager !== 'undefined') {
      domManager.closeAllModals();
      return;
    }

    // 使用旧版方法
    if (typeof DeckUI !== 'undefined' && DOM?.elements?.modalDeck?.classList.contains('active')) {
      DeckUI.hideModal();
    }

    // 移除卡牌详情
    const cardDetail = document.getElementById('card-detail-overlay');
    if (cardDetail) {
      cardDetail.remove();
    }
  }

  /**
   * 显示 Toast 通知
   * @private
   */
  _showToast(message, type = 'info') {
    if (typeof domManager !== 'undefined') {
      domManager.showToast(message, { type });
    } else if (typeof showToast === 'function') {
      showToast(message);
    }
  }

  // ============================================================
  // 公共API
  // ============================================================

  /**
   * 检查浏览器兼容性
   * @returns {boolean}
   */
  checkCompatibility() {
    const requirements = [
      typeof localStorage !== 'undefined',
      typeof fetch !== 'undefined',
      typeof Promise !== 'undefined',
      'classList' in document.documentElement,
      typeof Map !== 'undefined',
      typeof Set !== 'undefined',
    ];

    return requirements.every(r => r);
  }

  /**
   * 显示不兼容提示
   */
  showIncompatibleMessage() {
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #2c1810;
        color: #f4e4bc;
        text-align: center;
        padding: 20px;
        font-family: sans-serif;
      ">
        <h1 style="color: #c9a227; margin-bottom: 1rem;">浏览器不兼容</h1>
        <p>请使用现代浏览器访问本游戏</p>
        <p style="opacity: 0.7; margin-top: 0.5rem;">推荐使用 Chrome、Firefox、Safari 或 Edge 的最新版本</p>
      </div>
    `;
  }

  /**
   * 获取调试信息
   * @returns {Object}
   */
  getDebugInfo() {
    const info = {
      version: this.version,
      initialized: this.initialized,
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      localStorage: {
        available: typeof localStorage !== 'undefined',
        used: this._getLocalStorageSize(),
      },
    };

    // 添加状态信息
    if (typeof GameState !== 'undefined') {
      info.gameState = {
        currentPage: GameState.currentPage,
        worldLoaded: GameState.world?.isLoaded || false,
        characterName: GameState.character?.name || '',
      };
    }

    if (typeof BattleState !== 'undefined') {
      info.battleState = {
        isActive: BattleState.isActive,
        turn: BattleState.turn,
      };
    }

    // 添加模块信息
    if (typeof stateManager !== 'undefined') {
      info.stateManager = stateManager.getDebugInfo();
    }

    if (typeof router !== 'undefined') {
      info.router = router.getDebugInfo();
    }

    return info;
  }

  /**
   * 获取 localStorage 使用大小
   * @private
   */
  _getLocalStorageSize() {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length * 2; // UTF-16
      }
    }
    return `${(total / 1024).toFixed(2)} KB`;
  }

  /**
   * 重置游戏
   */
  resetGame() {
    if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
      localStorage.removeItem('dreamweaver_save');
      localStorage.removeItem('dreamweaver_settings');
      localStorage.removeItem('DREAMWEAVER_ARCHIVES_V2');
      localStorage.removeItem('dreamweaver_current_archive');
      location.reload();
    }
  }

  /**
   * 启用调试模式
   */
  enableDebug() {
    this.debug = true;

    if (typeof eventBus !== 'undefined') {
      eventBus.setDebug(true);
    }

    if (typeof stateManager !== 'undefined') {
      stateManager.enableHistory(true);
    }

    console.log('[App] 调试模式已启用');
  }

  /**
   * 禁用调试模式
   */
  disableDebug() {
    this.debug = false;

    if (typeof eventBus !== 'undefined') {
      eventBus.setDebug(false);
    }

    if (typeof stateManager !== 'undefined') {
      stateManager.enableHistory(false);
    }

    console.log('[App] 调试模式已禁用');
  }
}

// ============================================================
// 创建全局应用实例
// ============================================================

const app = new Application();

// ============================================================
// 自动初始化
// ============================================================

/**
 * 初始化入口函数
 */
function initApp() {
  if (app.checkCompatibility()) {
    app.init().catch(error => {
      console.error('应用初始化失败:', error);
    });
  } else {
    app.showIncompatibleMessage();
  }
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ============================================================
// 导出
// ============================================================

// ES Module 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Application,
    app,
  };
}

// 全局导出
window.Application = Application;
window.app = app;

// 兼容旧版 App 对象
window.App = {
  version: app.version,
  init: () => app.init(),
  checkCompatibility: () => app.checkCompatibility(),
  showIncompatibleMessage: () => app.showIncompatibleMessage(),
  getDebugInfo: () => app.getDebugInfo(),
  resetGame: () => app.resetGame(),
  closeAllModals: () => app._closeAllModals(),
};
