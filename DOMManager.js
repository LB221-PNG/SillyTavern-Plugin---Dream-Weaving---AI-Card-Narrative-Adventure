/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * DOMManager - DOM管理器
 * 统一的DOM元素管理和操作
 * ============================================================ */

/**
 * DOM管理器类
 * 提供DOM元素缓存、查询、事件绑定等功能
 */
class DOMManager {
  constructor() {
    /**
     * 元素缓存
     * @type {Map<string, Element>}
     * @private
     */
    this._cache = new Map();

    /**
     * 事件监听器注册表
     * @type {Map<string, Array<{element: Element, event: string, handler: Function}>>}
     * @private
     */
    this._listeners = new Map();

    /**
     * 是否已初始化
     * @private
     */
    this._initialized = false;

    /**
     * 容器引用
     * @type {Element}
     */
    this.appRoot = null;
    this.modalsRoot = null;
    this.toastRoot = null;
  }

  /**
   * 初始化DOM管理器
   */
  init() {
    if (this._initialized) return;

    // 获取根容器
    this.appRoot = document.getElementById('app') || document.body;
    this.modalsRoot = document.getElementById('modals') || this._createContainer('modals');
    this.toastRoot = document.getElementById('toast-container') || this._createContainer('toast-container');

    // 缓存常用元素
    this._cacheCommonElements();

    this._initialized = true;
    console.log('[DOMManager] 初始化完成');
  }

  /**
   * 创建容器元素
   * @private
   */
  _createContainer(id) {
    const container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);
    return container;
  }

  /**
   * 缓存常用DOM元素
   * @private
   */
  _cacheCommonElements() {
    // 页面容器
    const pageIds = ['page-home', 'page-character', 'page-world', 'page-game', 'page-settings', 'page-variables'];
    pageIds.forEach(id => this.cache(id));

    // 表单元素
    const formIds = [
      'char-name',
      'char-gender',
      'char-age',
      'char-race',
      'char-class',
      'char-appearance',
      'char-background',
      'world-prompt',
      'world-preview',
      'api-endpoint',
      'api-key',
      'model-name',
      'temperature',
      'max-tokens',
    ];
    formIds.forEach(id => this.cache(id));

    // 游戏界面元素
    const gameIds = [
      'narrative-content',
      'message-input',
      'game-char-name',
      'game-char-class',
      'hp-display',
      'hp-bar',
      'stat-gold',
      'game-location',
      'game-weather',
      'game-time',
      'status-sidebar',
      'sidebar-toggle-btn',
      'sidebar-overlay',
    ];
    gameIds.forEach(id => this.cache(id));

    // 战斗界面元素
    const battleIds = [
      'battle-panel',
      'narrative-panel',
      'turn-number',
      'enemy-name',
      'enemy-level',
      'enemy-hp-display',
      'enemy-hp-bar',
      'intent-value',
      'battle-hp',
      'battle-block',
      'energy-current',
      'energy-max',
      'hand-cards',
      'draw-pile-count',
      'discard-pile-count',
      'combat-log',
    ];
    battleIds.forEach(id => this.cache(id));

    // 模态框
    const modalIds = [
      'modal-deck',
      'load-archive-overlay',
      'delete-confirm-overlay',
      'save-slots-overlay',
      'message-editor-overlay',
      'branching-options-overlay',
      'big-summary-overlay',
      'small-summary-overlay',
      'summary-editor-overlay',
    ];
    modalIds.forEach(id => this.cache(id));
  }

  // ============================================================
  // 元素查询和缓存
  // ============================================================

  /**
   * 缓存元素
   * @param {string} id - 元素ID
   * @returns {Element|null}
   */
  cache(id) {
    if (this._cache.has(id)) {
      return this._cache.get(id);
    }

    const element = document.getElementById(id);
    if (element) {
      this._cache.set(id, element);
    }
    return element;
  }

  /**
   * 获取缓存的元素
   * @param {string} id - 元素ID
   * @returns {Element|null}
   */
  get(id) {
    if (this._cache.has(id)) {
      return this._cache.get(id);
    }
    return this.cache(id);
  }

  /**
   * 通过选择器查询元素
   * @param {string} selector - CSS选择器
   * @param {Element} context - 查询上下文
   * @returns {Element|null}
   */
  query(selector, context = document) {
    return context.querySelector(selector);
  }

  /**
   * 通过选择器查询所有元素
   * @param {string} selector - CSS选择器
   * @param {Element} context - 查询上下文
   * @returns {NodeList}
   */
  queryAll(selector, context = document) {
    return context.querySelectorAll(selector);
  }

  /**
   * 清除指定元素的缓存
   * @param {string} id - 元素ID
   */
  uncache(id) {
    this._cache.delete(id);
  }

  /**
   * 清除所有缓存
   */
  clearCache() {
    this._cache.clear();
  }

  /**
   * 刷新缓存（重新查询所有缓存的元素）
   */
  refreshCache() {
    const ids = Array.from(this._cache.keys());
    this._cache.clear();
    ids.forEach(id => this.cache(id));
  }

  // ============================================================
  // 元素操作
  // ============================================================

  /**
   * 创建元素
   * @param {string} tag - 标签名
   * @param {Object} options - 选项
   * @param {string} options.id - 元素ID
   * @param {string|string[]} options.className - 类名
   * @param {Object} options.attrs - 属性
   * @param {string} options.html - innerHTML
   * @param {string} options.text - textContent
   * @param {Element[]} options.children - 子元素
   * @returns {Element}
   */
  create(tag, options = {}) {
    const element = document.createElement(tag);

    if (options.id) {
      element.id = options.id;
    }

    if (options.className) {
      if (Array.isArray(options.className)) {
        element.classList.add(...options.className);
      } else {
        element.className = options.className;
      }
    }

    if (options.attrs) {
      for (const [key, value] of Object.entries(options.attrs)) {
        element.setAttribute(key, value);
      }
    }

    if (options.html) {
      element.innerHTML = options.html;
    } else if (options.text) {
      element.textContent = options.text;
    }

    if (options.children) {
      options.children.forEach(child => {
        if (child) element.appendChild(child);
      });
    }

    return element;
  }

  /**
   * 设置元素HTML内容
   * @param {string|Element} target - 元素ID或元素
   * @param {string} html - HTML内容
   */
  setHTML(target, html) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.innerHTML = html;
    }
  }

  /**
   * 设置元素文本内容
   * @param {string|Element} target - 元素ID或元素
   * @param {string} text - 文本内容
   */
  setText(target, text) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.textContent = text;
    }
  }

  /**
   * 显示元素
   * @param {string|Element} target - 元素ID或元素
   * @param {string} display - display值，默认为空（恢复默认）
   */
  show(target, display = '') {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.style.display = display;
      element.classList.remove('hidden');
    }
  }

  /**
   * 隐藏元素
   * @param {string|Element} target - 元素ID或元素
   */
  hide(target) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.style.display = 'none';
      element.classList.add('hidden');
    }
  }

  /**
   * 切换元素可见性
   * @param {string|Element} target - 元素ID或元素
   * @returns {boolean} - 切换后的可见状态
   */
  toggle(target) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      const isHidden = element.classList.contains('hidden') || element.style.display === 'none';
      if (isHidden) {
        this.show(target);
        return true;
      } else {
        this.hide(target);
        return false;
      }
    }
    return false;
  }

  /**
   * 添加CSS类
   * @param {string|Element} target - 元素ID或元素
   * @param {...string} classNames - 类名
   */
  addClass(target, ...classNames) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.classList.add(...classNames);
    }
  }

  /**
   * 移除CSS类
   * @param {string|Element} target - 元素ID或元素
   * @param {...string} classNames - 类名
   */
  removeClass(target, ...classNames) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.classList.remove(...classNames);
    }
  }

  /**
   * 切换CSS类
   * @param {string|Element} target - 元素ID或元素
   * @param {string} className - 类名
   * @param {boolean} force - 强制添加或移除
   * @returns {boolean}
   */
  toggleClass(target, className, force) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      return element.classList.toggle(className, force);
    }
    return false;
  }

  /**
   * 检查是否有CSS类
   * @param {string|Element} target - 元素ID或元素
   * @param {string} className - 类名
   * @returns {boolean}
   */
  hasClass(target, className) {
    const element = typeof target === 'string' ? this.get(target) : target;
    return element ? element.classList.contains(className) : false;
  }

  /**
   * 设置元素属性
   * @param {string|Element} target - 元素ID或元素
   * @param {string|Object} attr - 属性名或属性对象
   * @param {string} value - 属性值
   */
  setAttr(target, attr, value) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (!element) return;

    if (typeof attr === 'object') {
      for (const [key, val] of Object.entries(attr)) {
        element.setAttribute(key, val);
      }
    } else {
      element.setAttribute(attr, value);
    }
  }

  /**
   * 获取元素属性
   * @param {string|Element} target - 元素ID或元素
   * @param {string} attr - 属性名
   * @returns {string|null}
   */
  getAttr(target, attr) {
    const element = typeof target === 'string' ? this.get(target) : target;
    return element ? element.getAttribute(attr) : null;
  }

  /**
   * 设置元素样式
   * @param {string|Element} target - 元素ID或元素
   * @param {string|Object} style - 样式属性名或样式对象
   * @param {string} value - 样式值
   */
  setStyle(target, style, value) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (!element) return;

    if (typeof style === 'object') {
      for (const [key, val] of Object.entries(style)) {
        element.style[key] = val;
      }
    } else {
      element.style[style] = value;
    }
  }

  /**
   * 获取表单元素值
   * @param {string|Element} target - 元素ID或元素
   * @returns {*}
   */
  getValue(target) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (!element) return null;

    if (element.type === 'checkbox') {
      return element.checked;
    } else if (element.type === 'radio') {
      const name = element.name;
      const checked = document.querySelector(`input[name="${name}"]:checked`);
      return checked ? checked.value : null;
    } else if (element.tagName === 'SELECT' && element.multiple) {
      return Array.from(element.selectedOptions).map(opt => opt.value);
    } else {
      return element.value;
    }
  }

  /**
   * 设置表单元素值
   * @param {string|Element} target - 元素ID或元素
   * @param {*} value - 值
   */
  setValue(target, value) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (!element) return;

    if (element.type === 'checkbox') {
      element.checked = Boolean(value);
    } else {
      element.value = value;
    }
  }

  // ============================================================
  // 事件管理
  // ============================================================

  /**
   * 添加事件监听器
   * @param {string|Element} target - 元素ID或元素
   * @param {string} event - 事件类型
   * @param {Function} handler - 事件处理器
   * @param {Object} options - addEventListener选项
   * @returns {Function} - 取消监听的函数
   */
  on(target, event, handler, options = {}) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (!element) {
      console.warn(`[DOMManager] 无法找到元素: ${target}`);
      return () => {};
    }

    element.addEventListener(event, handler, options);

    // 注册到监听器列表
    const key = typeof target === 'string' ? target : target.id || 'anonymous';
    if (!this._listeners.has(key)) {
      this._listeners.set(key, []);
    }
    this._listeners.get(key).push({ element, event, handler, options });

    // 返回取消监听函数
    return () => this.off(element, event, handler, options);
  }

  /**
   * 移除事件监听器
   * @param {string|Element} target - 元素ID或元素
   * @param {string} event - 事件类型
   * @param {Function} handler - 事件处理器
   * @param {Object} options - removeEventListener选项
   */
  off(target, event, handler, options = {}) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.removeEventListener(event, handler, options);
    }

    // 从监听器列表移除
    const key = typeof target === 'string' ? target : target.id || 'anonymous';
    const listeners = this._listeners.get(key);
    if (listeners) {
      const index = listeners.findIndex(l => l.element === element && l.event === event && l.handler === handler);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 添加一次性事件监听器
   * @param {string|Element} target - 元素ID或元素
   * @param {string} event - 事件类型
   * @param {Function} handler - 事件处理器
   * @returns {Function} - 取消监听的函数
   */
  once(target, event, handler) {
    return this.on(target, event, handler, { once: true });
  }

  /**
   * 事件委托
   * @param {string|Element} parent - 父元素ID或元素
   * @param {string} event - 事件类型
   * @param {string} selector - 子元素选择器
   * @param {Function} handler - 事件处理器
   * @returns {Function} - 取消监听的函数
   */
  delegate(parent, event, selector, handler) {
    const parentElement = typeof parent === 'string' ? this.get(parent) : parent;
    if (!parentElement) {
      console.warn(`[DOMManager] 无法找到父元素: ${parent}`);
      return () => {};
    }

    const delegateHandler = e => {
      const target = e.target.closest(selector);
      if (target && parentElement.contains(target)) {
        handler.call(target, e, target);
      }
    };

    return this.on(parentElement, event, delegateHandler);
  }

  /**
   * 移除元素的所有事件监听器
   * @param {string|Element} target - 元素ID或元素
   */
  offAll(target) {
    const key = typeof target === 'string' ? target : target.id || 'anonymous';
    const listeners = this._listeners.get(key);

    if (listeners) {
      listeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this._listeners.delete(key);
    }
  }

  /**
   * 触发事件
   * @param {string|Element} target - 元素ID或元素
   * @param {string} event - 事件类型
   * @param {Object} detail - 事件详情（用于CustomEvent）
   */
  trigger(target, event, detail = null) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (!element) return;

    let evt;
    if (detail !== null) {
      evt = new CustomEvent(event, { detail, bubbles: true, cancelable: true });
    } else {
      evt = new Event(event, { bubbles: true, cancelable: true });
    }
    element.dispatchEvent(evt);
  }

  // ============================================================
  // 页面相关
  // ============================================================

  /**
   * 获取所有页面元素
   * @returns {Object<string, Element>}
   */
  getPages() {
    return {
      home: this.get('page-home'),
      character: this.get('page-character'),
      world: this.get('page-world'),
      game: this.get('page-game'),
      settings: this.get('page-settings'),
      variables: this.get('page-variables'),
    };
  }

  /**
   * 显示指定页面
   * @param {string} pageName - 页面名称
   */
  showPage(pageName) {
    const pages = this.getPages();

    // 隐藏所有页面
    Object.values(pages).forEach(page => {
      if (page) {
        page.classList.remove('active');
      }
    });

    // 显示目标页面
    const targetPage = pages[pageName];
    if (targetPage) {
      targetPage.classList.add('active');
    }
  }

  // ============================================================
  // 模态框管理
  // ============================================================

  /**
   * 显示模态框
   * @param {string} modalId - 模态框ID
   */
  showModal(modalId) {
    const modal = this.get(modalId);
    if (modal) {
      modal.classList.add('active');

      // 发送事件
      if (typeof eventBus !== 'undefined') {
        eventBus.emit(AppEvents.MODAL_OPEN, { modalId });
      }
    }
  }

  /**
   * 隐藏模态框
   * @param {string} modalId - 模态框ID
   */
  hideModal(modalId) {
    const modal = this.get(modalId);
    if (modal) {
      modal.classList.remove('active');

      // 发送事件
      if (typeof eventBus !== 'undefined') {
        eventBus.emit(AppEvents.MODAL_CLOSE, { modalId });
      }
    }
  }

  /**
   * 切换模态框
   * @param {string} modalId - 模态框ID
   * @returns {boolean} - 切换后的显示状态
   */
  toggleModal(modalId) {
    const modal = this.get(modalId);
    if (modal) {
      const isActive = modal.classList.contains('active');
      if (isActive) {
        this.hideModal(modalId);
        return false;
      } else {
        this.showModal(modalId);
        return true;
      }
    }
    return false;
  }

  /**
   * 关闭所有模态框
   */
  closeAllModals() {
    const overlays = this.queryAll('.overlay.active');
    overlays.forEach(overlay => {
      overlay.classList.remove('active');
    });

    const modals = this.queryAll('.modal-overlay.active');
    modals.forEach(modal => {
      modal.classList.remove('active');
    });
  }

  // ============================================================
  // Toast通知
  // ============================================================

  /**
   * 显示Toast通知
   * @param {string} message - 消息内容
   * @param {Object} options - 选项
   * @param {number} options.duration - 显示时长（毫秒）
   * @param {string} options.type - 类型（info/success/warning/error）
   */
  showToast(message, options = {}) {
    const { duration = 3000, type = 'info' } = options;

    // 使用现有的toast元素或创建新的
    let toast = this.get('toast');
    if (!toast) {
      toast = this.create('div', { id: 'toast', className: 'toast' });
      document.body.appendChild(toast);
      this.cache('toast');
    }

    // 设置内容和类型
    toast.textContent = message;
    toast.className = `toast ${type}`;

    // 显示
    toast.classList.add('show');

    // 自动隐藏
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);

    // 发送事件
    if (typeof eventBus !== 'undefined') {
      eventBus.emit(AppEvents.TOAST_SHOW, { message, type, duration });
    }
  }

  // ============================================================
  // 滚动
  // ============================================================

  /**
   * 滚动到元素
   * @param {string|Element} target - 元素ID或元素
   * @param {Object} options - scrollIntoView选项
   */
  scrollTo(target, options = { behavior: 'smooth', block: 'start' }) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.scrollIntoView(options);
    }
  }

  /**
   * 滚动到底部
   * @param {string|Element} target - 容器元素ID或元素
   */
  scrollToBottom(target) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  /**
   * 滚动到顶部
   * @param {string|Element} target - 容器元素ID或元素
   */
  scrollToTop(target) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.scrollTop = 0;
    }
  }

  // ============================================================
  // 清理
  // ============================================================

  /**
   * 移除元素
   * @param {string|Element} target - 元素ID或元素
   */
  remove(target) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element && element.parentNode) {
      this.offAll(target);
      element.parentNode.removeChild(element);

      if (typeof target === 'string') {
        this.uncache(target);
      }
    }
  }

  /**
   * 清空元素内容
   * @param {string|Element} target - 元素ID或元素
   */
  empty(target) {
    const element = typeof target === 'string' ? this.get(target) : target;
    if (element) {
      element.innerHTML = '';
    }
  }

  /**
   * 销毁DOM管理器（清理所有监听器和缓存）
   */
  destroy() {
    // 移除所有事件监听器
    this._listeners.forEach((listeners, key) => {
      listeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
    });
    this._listeners.clear();

    // 清除缓存
    this._cache.clear();

    this._initialized = false;
  }
}

// ============================================================
// 创建全局DOM管理器实例
// ============================================================

const domManager = new DOMManager();

// ============================================================
// 兼容层 - 替代现有的DOM对象
// ============================================================

/**
 * DOM兼容层
 * 保持与现有 DOM.elements 的兼容性
 */
const DOMCompat = {
  /**
   * 初始化兼容层
   */
  init() {
    // 如果已存在旧版DOM对象，增强它
    if (typeof window.DOM !== 'undefined') {
      // 代理 elements 访问
      const originalElements = window.DOM.elements || {};

      window.DOM.elements = new Proxy(originalElements, {
        get(target, prop) {
          // 先检查原始对象
          if (target[prop]) {
            return target[prop];
          }
          // 否则从 domManager 获取
          return domManager.get(prop);
        },
      });

      // 替换 cacheDOM 函数
      window.cacheDOM = function () {
        domManager.init();
        window.DOM.cached = true;
      };
    }
  },
};

// ============================================================
// 便捷函数
// ============================================================

/**
 * 查询单个元素
 * @param {string} selector - CSS选择器
 * @returns {Element|null}
 */
function $(selector) {
  if (selector.startsWith('#')) {
    return domManager.get(selector.slice(1));
  }
  return domManager.query(selector);
}

/**
 * 查询所有元素
 * @param {string} selector - CSS选择器
 * @returns {NodeList}
 */
function $$(selector) {
  return domManager.queryAll(selector);
}

// ============================================================
// 导出
// ============================================================

// ES Module 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOMManager,
    domManager,
    DOMCompat,
    $,
    $$,
  };
}

// 全局导出
window.DOMManager = DOMManager;
window.domManager = domManager;
window.DOMCompat = DOMCompat;
// 避免覆盖jQuery等库
if (typeof window.$ === 'undefined') {
  window.$ = $;
}
if (typeof window.$$ === 'undefined') {
  window.$$ = $$;
}
