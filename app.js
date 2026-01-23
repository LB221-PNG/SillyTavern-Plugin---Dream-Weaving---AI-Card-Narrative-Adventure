/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 应用入口
 * ============================================================ */

/**
 * 应用主模块
 */
const App = {
version: '0.2.2',

  /**
   * 初始化应用
   */
  init() {
    console.log(`🎮 克劳德 - AI卡牌叙事冒险 v${this.version}`);
    console.log('正在初始化...');

    // 缓存DOM元素
    cacheDOM();

    // 加载设置
    SaveSystem.loadSettings();

    // 初始化各模块
    this.initModules();

    // 绑定全局事件
    this.bindGlobalEvents();

    // 性能优化：使用 requestIdleCallback 进行非关键初始化
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // 预热卡牌系统
        CardSystem.generateInitialDeck(GameState.character);
        console.log('✅ 卡牌系统预热完成');
      });
    }

    console.log('✅ 初始化完成');
  },

  /**
   * 初始化各模块
   */
  initModules() {
    // 初始化UI模块
    if (typeof HomeUI !== 'undefined') {
      HomeUI.init();
      console.log('  - 开始界面 ✓');
    }

    if (typeof CharacterUI !== 'undefined') {
      CharacterUI.init();
      console.log('  - 角色创建界面 ✓');
    }

    if (typeof WorldUI !== 'undefined') {
      WorldUI.init();
      console.log('  - 世界创建界面 ✓');
    }

    if (typeof GameUI !== 'undefined') {
      GameUI.init();
      console.log('  - 主界面 ✓');
    }

    if (typeof DeckUI !== 'undefined') {
      DeckUI.init();
      console.log('  - 卡组界面 ✓');
    }

    if (typeof SettingsUI !== 'undefined') {
      SettingsUI.init();
      console.log('  - 设置界面 ✓');
    }

    if (typeof VariablesUI !== 'undefined') {
      VariablesUI.init();
      console.log('  - 变量设置界面 ✓');
    }

    // 初始化系统模块
    if (typeof BattleSystem !== 'undefined') {
      BattleSystem.bindEvents();
      console.log('  - 战斗系统 ✓');
    }

    if (typeof NarrativeSystem !== 'undefined') {
      NarrativeSystem.bindEvents();
      console.log('  - 叙事系统 ✓');
    }
  },

  /**
   * 绑定全局事件
   */
  bindGlobalEvents() {
    // 页面可见性变化时自动保存
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && GameState.world.isLoaded) {
        SaveSystem.save();
      }
    });

    // 窗口关闭前保存
    window.addEventListener('beforeunload', e => {
      if (GameState.world.isLoaded) {
        SaveSystem.save();
      }
    });

    // 全局键盘快捷键
    document.addEventListener('keydown', e => {
      // Ctrl+S 保存
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (GameState.world.isLoaded) {
          SaveSystem.save();
        }
      }

      // Escape 关闭模态框
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // 处理网络状态变化
    window.addEventListener('online', () => {
      showToast('网络已连接');
    });

    window.addEventListener('offline', () => {
      showToast('网络已断开，部分功能可能不可用');
    });
  },

  /**
   * 关闭所有模态框
   */
  closeAllModals() {
    // 关闭卡组模态框
    if (DOM.elements.modalDeck?.classList.contains('active')) {
      DeckUI.hideModal();
    }

    // 关闭卡牌详情
    const cardDetail = document.getElementById('card-detail-overlay');
    if (cardDetail) {
      cardDetail.remove();
    }
  },

  /**
   * 显示加载画面
   */
  showLoadingScreen() {
    const loadingHtml = `
            <div id="loading-screen" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 50%, #0d0705 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <h1 style="
                    font-family: 'Cinzel', serif;
                    font-size: 3rem;
                    color: #c9a227;
                    margin-bottom: 2rem;
                ">梦境编织者</h1>
                <div class="loading-spinner"></div>
                <p style="
                    color: #f4e4bc;
                    margin-top: 1.5rem;
                    opacity: 0.7;
                ">正在加载...</p>
            </div>
        `;
    document.body.insertAdjacentHTML('afterbegin', loadingHtml);
  },

  /**
   * 隐藏加载画面
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.5s ease';
      setTimeout(() => loadingScreen.remove(), 500);
    }
  },

  /**
   * 检查浏览器兼容性
   * @returns {boolean} - 是否兼容
   */
  checkCompatibility() {
    const requirements = [
      typeof localStorage !== 'undefined',
      typeof fetch !== 'undefined',
      typeof Promise !== 'undefined',
      'classList' in document.documentElement,
    ];

    return requirements.every(r => r);
  },

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
            ">
                <h1>浏览器不兼容</h1>
                <p>请使用现代浏览器访问本游戏</p>
                <p>推荐使用 Chrome、Firefox、Safari 或 Edge 的最新版本</p>
            </div>
        `;
  },

  /**
   * 获取调试信息
   * @returns {Object} - 调试信息
   */
  getDebugInfo() {
    return {
      version: this.version,
      gameState: GameState,
      battleState: BattleState,
      hasSave: SaveSystem.hasSave(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      localStorage: {
        available: typeof localStorage !== 'undefined',
        used: this.getLocalStorageSize(),
      },
    };
  },

  /**
   * 获取 localStorage 使用大小
   * @returns {string} - 大小字符串
   */
  getLocalStorageSize() {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length * 2; // UTF-16
      }
    }
    return `${(total / 1024).toFixed(2)} KB`;
  },

  /**
   * 重置游戏
   */
  resetGame() {
    if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
      localStorage.removeItem('dreamweaver_save');
      localStorage.removeItem('dreamweaver_settings');
      location.reload();
    }
  },
};

// DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (App.checkCompatibility()) {
      App.init();
    } else {
      App.showIncompatibleMessage();
    }
  });
} else if (App.checkCompatibility()) {
  App.init();
} else {
  App.showIncompatibleMessage();
}

// 导出
window.App = App;
