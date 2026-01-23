/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * Component - UI组件基类
 * 所有UI组件的基础类，提供统一的生命周期和渲染机制
 * ============================================================ */

/**
 * 组件配置类型
 * @typedef {Object} ComponentOptions
 * @property {string|Element} container - 容器选择器或元素
 * @property {string|Function} template - HTML模板字符串或模板函数
 * @property {Object} state - 初始状态
 * @property {Object} props - 组件属性（外部传入，不可修改）
 * @property {Object} events - 事件绑定配置
 */

/**
 * 组件基类
 */
class Component {
  /**
   * @param {ComponentOptions} options - 组件配置
   */
  constructor(options = {}) {
    /**
     * 组件唯一ID
     * @type {string}
     */
    this.id = options.id || `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    /**
     * 容器元素
     * @type {Element|null}
     */
    this.container = null;
    if (options.container) {
      this.container =
        typeof options.container === 'string' ? document.querySelector(options.container) : options.container;
    }

    /**
     * 模板
     * @type {string|Function}
     */
    this.template = options.template || '';

    /**
     * 组件状态（可变）
     * @type {Object}
     */
    this.state = { ...options.state };

    /**
     * 组件属性（不可变）
     * @type {Object}
     */
    this.props = Object.freeze({ ...options.props });

    /**
     * 子组件列表
     * @type {Component[]}
     */
    this.children = [];

    /**
     * 父组件引用
     * @type {Component|null}
     */
    this.parent = null;

    /**
     * 事件监听器列表（用于清理）
     * @type {Array<{element: Element, event: string, handler: Function}>}
     * @private
     */
    this._eventListeners = [];

    /**
     * 状态订阅列表（用于清理）
     * @type {Function[]}
     * @private
     */
    this._stateSubscriptions = [];

    /**
     * 是否已挂载
     * @type {boolean}
     */
    this.mounted = false;

    /**
     * 是否已销毁
     * @type {boolean}
     */
    this.destroyed = false;

    /**
     * 事件配置
     * @private
     */
    this._eventsConfig = options.events || {};

    /**
     * 根元素引用（渲染后的组件根元素）
     * @type {Element|null}
     */
    this.el = null;
  }

  // ============================================================
  // 生命周期方法（可被子类覆盖）
  // ============================================================

  /**
   * 组件创建后调用（在 render 之前）
   */
  created() {
    // 子类可覆盖
  }

  /**
   * 组件挂载后调用（render 之后）
   */
  mounted_hook() {
    // 子类可覆盖
  }

  /**
   * 组件更新前调用
   * @param {Object} prevState - 更新前的状态
   */
  beforeUpdate(prevState) {
    // 子类可覆盖
  }

  /**
   * 组件更新后调用
   */
  updated() {
    // 子类可覆盖
  }

  /**
   * 组件销毁前调用
   */
  beforeDestroy() {
    // 子类可覆盖
  }

  /**
   * 组件销毁后调用
   */
  destroyed_hook() {
    // 子类可覆盖
  }

  // ============================================================
  // 渲染系统
  // ============================================================

  /**
   * 挂载组件
   * @param {string|Element} container - 容器选择器或元素
   * @returns {Component} - 支持链式调用
   */
  mount(container) {
    if (this.mounted) {
      console.warn(`[Component] 组件 ${this.id} 已经挂载`);
      return this;
    }

    if (container) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
    }

    if (!this.container) {
      console.error(`[Component] 无法找到容器元素`);
      return this;
    }

    // 生命周期: created
    this.created();

    // 渲染
    this.render();

    // 绑定事件
    this.bindEvents();

    // 标记为已挂载
    this.mounted = true;

    // 生命周期: mounted
    this.mounted_hook();

    return this;
  }

  /**
   * 渲染组件
   * @returns {Component}
   */
  async render() {
    if (!this.container) return this;

    const html = await this.getHTML();

    // 保存当前焦点
    const focusedId = document.activeElement?.id;

    // 更新DOM
    this.container.innerHTML = html;

    // 获取根元素引用
    this.el = this.container.firstElementChild;

    // 恢复焦点
    if (focusedId) {
      const focusedElement = document.getElementById(focusedId);
      if (focusedElement) {
        focusedElement.focus();
      }
    }

    // 渲染子组件
    for (const child of this.children) {
      if (child.container) {
        child.render();
      }
    }

    return this;
  }

  /**
   * 获取渲染后的HTML字符串
   * @returns {Promise<string>|string}
   */
  async getHTML() {
    let html = '';

    if (typeof this.template === 'function') {
      html = this.template(this.state, this.props);
    } else if (typeof this.template === 'string') {
      if (this.template.endsWith('.html')) {
        // 加载外部模板文件
        html = await this.loadTemplate(this.template);
      } else {
        html = this.template;
      }
    }

    // 插值处理
    return this.interpolate(html);
  }

  /**
   * 加载外部模板文件
   * @param {string} path - 模板路径
   * @returns {Promise<string>}
   */
  async loadTemplate(path) {
    try {
      // 尝试直接加载
      let response = await fetch(path);
      
      // 如果失败且路径包含目录，尝试只加载文件名（适应扁平化结构）
      if (!response.ok && path.includes('/')) {
        const fileName = path.split('/').pop();
        const retryResponse = await fetch(fileName);
        if (retryResponse.ok) {
          response = retryResponse;
        }
      }

      if (!response.ok) {
        throw new Error(`模板加载失败: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`[Component] 模板加载失败:`, error);
      return '';
    }
  }

  /**
   * 模板插值处理
   * @param {string} template - 模板字符串
   * @returns {string}
   */
  interpolate(template) {
    const data = { ...this.state, ...this.props };

    // 支持 {{variable}} 和 {{nested.variable}} 语法
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this._getNestedValue(data, path);
      if (value === undefined || value === null) {
        return '';
      }
      // HTML转义
      return this._escapeHtml(String(value));
    });
  }

  /**
   * 获取嵌套属性值
   * @private
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current !== null && current !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * HTML转义
   * @private
   */
  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ============================================================
  // 状态管理
  // ============================================================

  /**
   * 设置状态（触发重新渲染）
   * @param {Object|Function} newState - 新状态或更新函数
   * @returns {Component}
   */
  setState(newState) {
    if (this.destroyed) return this;

    const prevState = { ...this.state };

    // 支持函数式更新
    if (typeof newState === 'function') {
      newState = newState(prevState);
    }

    // 合并状态
    this.state = { ...this.state, ...newState };

    // 检查是否有变化
    if (JSON.stringify(prevState) === JSON.stringify(this.state)) {
      return this;
    }

    // 生命周期: beforeUpdate
    this.beforeUpdate(prevState);

    // 重新渲染
    this.render().then(() => {
      // 重新绑定事件
      this.bindEvents();

      // 生命周期: updated
      this.updated();
    });

    return this;
  }

  /**
   * 获取状态值
   * @param {string} key - 状态键
   * @param {*} defaultValue - 默认值
   * @returns {*}
   */
  getState(key, defaultValue = undefined) {
    if (!key) return this.state;
    return this._getNestedValue(this.state, key) ?? defaultValue;
  }

  /**
   * 订阅全局状态变化
   * @param {string} path - 状态路径
   * @param {Function} callback - 回调函数
   * @returns {Component}
   */
  watchState(path, callback) {
    if (typeof stateManager !== 'undefined') {
      const unsubscribe = stateManager.subscribe(path, (newValue, oldValue, changedPath) => {
        callback.call(this, newValue, oldValue, changedPath);
      });
      this._stateSubscriptions.push(unsubscribe);
    }
    return this;
  }

  // ============================================================
  // 事件系统
  // ============================================================

  /**
   * 绑定事件
   */
  bindEvents() {
    // 清除旧的事件监听器
    this.unbindEvents();

    // 从配置绑定事件
    for (const [selector, events] of Object.entries(this._eventsConfig)) {
      for (const [eventType, handler] of Object.entries(events)) {
        this.bindEvent(selector, eventType, handler);
      }
    }

    // 调用子类的事件绑定方法
    this.bindCustomEvents();
  }

  /**
   * 子类自定义事件绑定（子类可覆盖）
   */
  bindCustomEvents() {
    // 子类可覆盖
  }

  /**
   * 绑定单个事件
   * @param {string|Element} target - 选择器或元素
   * @param {string} event - 事件类型
   * @param {Function|string} handler - 事件处理器或方法名
   * @returns {Function} - 取消绑定函数
   */
  bindEvent(target, event, handler) {
    let element;

    if (typeof target === 'string') {
      // 如果是选择器，在组件容器内查找
      element = this.container?.querySelector(target);
    } else {
      element = target;
    }

    if (!element) return () => {};

    // 如果handler是字符串，从组件方法中查找
    const actualHandler = typeof handler === 'string' ? this[handler]?.bind(this) : handler.bind(this);

    if (!actualHandler) {
      console.warn(`[Component] 找不到事件处理器: ${handler}`);
      return () => {};
    }

    element.addEventListener(event, actualHandler);
    this._eventListeners.push({ element, event, handler: actualHandler });

    return () => {
      element.removeEventListener(event, actualHandler);
    };
  }

  /**
   * 事件委托
   * @param {string} selector - 子元素选择器
   * @param {string} event - 事件类型
   * @param {Function} handler - 事件处理器
   * @returns {Function} - 取消绑定函数
   */
  delegate(selector, event, handler) {
    if (!this.container) return () => {};

    const delegateHandler = e => {
      const target = e.target.closest(selector);
      if (target && this.container.contains(target)) {
        handler.call(this, e, target);
      }
    };

    this.container.addEventListener(event, delegateHandler);
    this._eventListeners.push({ element: this.container, event, handler: delegateHandler });

    return () => {
      this.container.removeEventListener(event, delegateHandler);
    };
  }

  /**
   * 解绑所有事件
   */
  unbindEvents() {
    this._eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this._eventListeners = [];
  }

  /**
   * 触发自定义事件
   * @param {string} eventName - 事件名称
   * @param {*} data - 事件数据
   */
  emit(eventName, data) {
    // 发送到 EventBus
    if (typeof eventBus !== 'undefined') {
      eventBus.emit(`component:${this.id}:${eventName}`, data);
      eventBus.emit(`component:${eventName}`, { componentId: this.id, data });
    }

    // 触发 DOM 自定义事件
    if (this.el) {
      const event = new CustomEvent(eventName, {
        detail: data,
        bubbles: true,
        cancelable: true,
      });
      this.el.dispatchEvent(event);
    }
  }

  /**
   * 监听组件事件
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理器
   * @returns {Function} - 取消监听函数
   */
  on(eventName, handler) {
    if (typeof eventBus !== 'undefined') {
      return eventBus.on(`component:${this.id}:${eventName}`, handler);
    }
    return () => {};
  }

  // ============================================================
  // 子组件管理
  // ============================================================

  /**
   * 添加子组件
   * @param {Component} child - 子组件
   * @param {string|Element} container - 子组件容器
   * @returns {Component}
   */
  addChild(child, container) {
    child.parent = this;
    this.children.push(child);

    if (container) {
      const containerEl = typeof container === 'string' ? this.container?.querySelector(container) : container;
      if (containerEl) {
        child.mount(containerEl);
      }
    }

    return this;
  }

  /**
   * 移除子组件
   * @param {Component} child - 子组件
   * @returns {Component}
   */
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.destroy();
      child.parent = null;
    }
    return this;
  }

  /**
   * 获取子组件
   * @param {string} id - 组件ID
   * @returns {Component|null}
   */
  getChild(id) {
    return this.children.find(child => child.id === id) || null;
  }

  /**
   * 移除所有子组件
   */
  removeAllChildren() {
    this.children.forEach(child => {
      child.destroy();
      child.parent = null;
    });
    this.children = [];
  }

  // ============================================================
  // DOM操作便捷方法
  // ============================================================

  /**
   * 在组件容器内查询元素
   * @param {string} selector - CSS选择器
   * @returns {Element|null}
   */
  $(selector) {
    return this.container?.querySelector(selector) || null;
  }

  /**
   * 在组件容器内查询所有元素
   * @param {string} selector - CSS选择器
   * @returns {NodeList}
   */
  $$(selector) {
    return this.container?.querySelectorAll(selector) || [];
  }

  /**
   * 显示组件
   */
  show() {
    if (this.container) {
      this.container.style.display = '';
      this.container.classList.remove('hidden');
    }
  }

  /**
   * 隐藏组件
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.container.classList.add('hidden');
    }
  }

  /**
   * 切换显示状态
   * @returns {boolean} - 切换后的显示状态
   */
  toggle() {
    if (this.container) {
      const isHidden = this.container.classList.contains('hidden') || this.container.style.display === 'none';
      if (isHidden) {
        this.show();
        return true;
      } else {
        this.hide();
        return false;
      }
    }
    return false;
  }

  // ============================================================
  // 销毁
  // ============================================================

  /**
   * 销毁组件
   */
  destroy() {
    if (this.destroyed) return;

    // 生命周期: beforeDestroy
    this.beforeDestroy();

    // 销毁所有子组件
    this.removeAllChildren();

    // 解绑事件
    this.unbindEvents();

    // 取消状态订阅
    this._stateSubscriptions.forEach(unsubscribe => unsubscribe());
    this._stateSubscriptions = [];

    // 清空容器
    if (this.container) {
      this.container.innerHTML = '';
    }

    // 标记为已销毁
    this.destroyed = true;
    this.mounted = false;

    // 生命周期: destroyed
    this.destroyed_hook();
  }

  // ============================================================
  // 工具方法
  // ============================================================

  /**
   * 延迟执行
   * @param {number} ms - 延迟毫秒数
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 下一帧执行
   * @param {Function} callback - 回调函数
   */
  nextFrame(callback) {
    requestAnimationFrame(() => {
      requestAnimationFrame(callback.bind(this));
    });
  }
}

// ============================================================
// 扩展：Modal 模态框基类
// ============================================================

/**
 * 模态框组件基类
 */
class Modal extends Component {
  constructor(options = {}) {
    super(options);

    /**
     * 是否显示
     * @type {boolean}
     */
    this.visible = false;

    /**
     * 点击遮罩是否关闭
     * @type {boolean}
     */
    this.closeOnOverlay = options.closeOnOverlay !== false;

    /**
     * 按ESC是否关闭
     * @type {boolean}
     */
    this.closeOnEsc = options.closeOnEsc !== false;
  }

  /**
   * 打开模态框
   * @param {Object} params - 打开参数
   */
  open(params = {}) {
    this.visible = true;

    if (this.container) {
      this.container.classList.add('active');
    }

    // 绑定ESC关闭
    if (this.closeOnEsc) {
      this._escHandler = e => {
        if (e.key === 'Escape') {
          this.close();
        }
      };
      document.addEventListener('keydown', this._escHandler);
    }

    // 触发事件
    this.emit('open', params);

    if (typeof eventBus !== 'undefined') {
      eventBus.emit(AppEvents.MODAL_OPEN, { modalId: this.id, params });
    }
  }

  /**
   * 关闭模态框
   */
  close() {
    this.visible = false;

    if (this.container) {
      this.container.classList.remove('active');
    }

    // 移除ESC监听
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }

    // 触发事件
    this.emit('close');

    if (typeof eventBus !== 'undefined') {
      eventBus.emit(AppEvents.MODAL_CLOSE, { modalId: this.id });
    }
  }

  /**
   * 切换显示状态
   */
  toggle() {
    if (this.visible) {
      this.close();
    } else {
      this.open();
    }
  }

  bindCustomEvents() {
    // 点击遮罩关闭
    if (this.closeOnOverlay && this.container) {
      this.bindEvent(this.container, 'click', e => {
        if (e.target === this.container) {
          this.close();
        }
      });
    }

    // 关闭按钮
    const closeBtn = this.$('.modal-close-btn');
    if (closeBtn) {
      this.bindEvent(closeBtn, 'click', () => this.close());
    }
  }
}

// ============================================================
// 扩展：Panel 面板基类
// ============================================================

/**
 * 面板组件基类
 */
class Panel extends Component {
  constructor(options = {}) {
    super(options);

    /**
     * 是否可折叠
     * @type {boolean}
     */
    this.collapsible = options.collapsible || false;

    /**
     * 是否折叠状态
     * @type {boolean}
     */
    this.collapsed = options.collapsed || false;
  }

  /**
   * 展开面板
   */
  expand() {
    this.collapsed = false;
    if (this.container) {
      this.container.classList.remove('collapsed');
    }
    this.emit('expand');
  }

  /**
   * 折叠面板
   */
  collapse() {
    this.collapsed = true;
    if (this.container) {
      this.container.classList.add('collapsed');
    }
    this.emit('collapse');
  }

  /**
   * 切换折叠状态
   */
  toggleCollapse() {
    if (this.collapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  bindCustomEvents() {
    if (this.collapsible) {
      const header = this.$('.panel-header, .section-header-mini');
      if (header) {
        this.bindEvent(header, 'click', () => this.toggleCollapse());
      }
    }
  }
}

// ============================================================
// 导出
// ============================================================

// ES Module 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Component,
    Modal,
    Panel,
  };
}

// 全局导出
window.Component = Component;
window.Modal = Modal;
window.Panel = Panel;
