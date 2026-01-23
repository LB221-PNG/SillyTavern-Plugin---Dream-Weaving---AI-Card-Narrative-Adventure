/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 设置界面
 * ============================================================ */

/**
 * 设置界面模块
 */
const SettingsUI = {
  // 折叠状态
  aiSettingsCollapsed: true,

  // 折叠状态
  collapsedSections: {
    ai: true,
    ui: true,
    worldbook: true,
    variables: true,
    save: true,
    summary: true,
  },

  /**
   * 初始化设置界面
   */
  init() {
    this.bindEvents();
    this.loadSettings();
    this.initAllCollapsible();
    this.initDropdowns();
    this.initTavernApiToggle();
    this.initThemeSettings();
    this.initApiProfileTabs();
    this.initMapApiToggle();
    this.initApiImportExport();
    this.updateWorldbookSummary();
    this.updateApiConfigStatus();
    this.updateSaveStatus();
  },

  /**
   * 初始化所有折叠功能
   */
  initAllCollapsible() {
    // AI设置折叠
    this.initCollapsibleSection('ai-settings-header', 'ai-settings-content', 'ai');
    // 界面设置折叠
    this.initCollapsibleSection('ui-settings-header', 'ui-settings-content', 'ui');
    // 世界书设置折叠
    this.initCollapsibleSection('worldbook-settings-header', 'worldbook-settings-content', 'worldbook');
    // 变量系统折叠
    this.initCollapsibleSection('variables-settings-header', 'variables-settings-content', 'variables');
    // 存档管理折叠
    this.initCollapsibleSection('save-settings-header', 'save-settings-content', 'save');
    // 总结功能折叠
    this.initCollapsibleSection('summary-settings-header', 'summary-settings-content', 'summary');
  },

  /**
   * 初始化单个折叠区域
   * @param {string} headerId - 头部元素ID
   * @param {string} contentId - 内容元素ID
   * @param {string} sectionKey - 区域键名
   */
  initCollapsibleSection(headerId, contentId, sectionKey) {
    const header = document.getElementById(headerId);
    const content = document.getElementById(contentId);

    if (header && content) {
      // 设置默认折叠状态
      if (this.collapsedSections[sectionKey]) {
        content.classList.add('collapsed');
        header.classList.remove('expanded');
      } else {
        content.classList.remove('collapsed');
        header.classList.add('expanded');
      }

      header.addEventListener('click', () => {
        this.toggleSection(headerId, contentId, sectionKey);
      });
    }
  },

  /**
   * 切换折叠状态
   * @param {string} headerId - 头部元素ID
   * @param {string} contentId - 内容元素ID
   * @param {string} sectionKey - 区域键名
   */
  toggleSection(headerId, contentId, sectionKey) {
    const header = document.getElementById(headerId);
    const content = document.getElementById(contentId);

    if (!header || !content) return;

    this.collapsedSections[sectionKey] = !this.collapsedSections[sectionKey];

    if (this.collapsedSections[sectionKey]) {
      content.classList.add('collapsed');
      header.classList.remove('expanded');
    } else {
      content.classList.remove('collapsed');
      header.classList.add('expanded');
    }
  },

  /**
   * 初始化下拉菜单
   */
  initDropdowns() {
    // 端点下拉菜单
    this.setupDropdown('btn-endpoint-dropdown', 'endpoint-dropdown', 'api-endpoint');

    // 模型下拉菜单
    this.setupDropdown('btn-model-dropdown', 'model-dropdown', 'model-name');

    // 点击外部关闭下拉菜单
    document.addEventListener('click', e => {
      if (!e.target.closest('.input-with-dropdown')) {
        this.closeAllDropdowns();
      }
    });
  },

  /**
   * 初始化主题设置
   */
  initThemeSettings() {
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        this.applyTheme(theme);
      });
    });
  },

  /**
   * 应用主题
   * @param {string} theme - 主题名称 ('default', 'dark', 'light')
   */
  applyTheme(theme) {
    // 设置 HTML 属性
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    // 更新按钮状态
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      if (option.dataset.theme === theme) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });

    // 更新状态文本
    const statusEl = document.getElementById('ui-theme-status');
    if (statusEl) {
      const names = {
        'default': '羊皮纸',
        'dark': '暗黑',
        'light': '明亮'
      };
      statusEl.textContent = names[theme] || '未知';
    }

    // 更新 GameState
    if (!GameState.settings) GameState.settings = {};
    GameState.settings.theme = theme;

    // 保存主题设置到存储（静默保存，不显示提示）
    if (typeof SaveSystem !== 'undefined' && SaveSystem.saveSettings) {
      SaveSystem.saveSettings(true);
    }
  },

  /**
   * 初始化酒馆API切换功能
   */
  initTavernApiToggle() {
    const checkbox = document.getElementById('use-tavern-api');
    const tavernModelInfo = document.getElementById('tavern-model-info');
    const customApiConfig = document.getElementById('custom-api-config');
    const refreshBtn = document.getElementById('btn-refresh-tavern-model');

    if (checkbox) {
      // 加载初始状态
      checkbox.checked = GameState.settings.useTavernApi || false;
      this.updateApiConfigVisibility(checkbox.checked);

      // 如果启用了酒馆API，自动获取模型信息
      if (checkbox.checked) {
        this.fetchTavernModelInfo();
      }

      // 绑定切换事件
      checkbox.addEventListener('change', e => {
        const useTavern = e.target.checked;
        GameState.settings.useTavernApi = useTavern;
        this.updateApiConfigVisibility(useTavern);

        if (useTavern) {
          this.fetchTavernModelInfo();
        }

        this.updateApiConfigStatus();
      });
    }

    // 刷新酒馆模型按钮
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.fetchTavernModelInfo();
      });
    }
  },

  /**
   * 更新API配置区域可见性
   * @param {boolean} useTavernApi - 是否使用酒馆API
   */
  updateApiConfigVisibility(useTavernApi) {
    const tavernModelInfo = document.getElementById('tavern-model-info');
    const customApiConfig = document.getElementById('custom-api-config');

    if (tavernModelInfo) {
      tavernModelInfo.style.display = useTavernApi ? 'block' : 'none';
    }

    if (customApiConfig) {
      customApiConfig.style.display = useTavernApi ? 'none' : 'block';
    }
  },

  /**
   * 获取酒馆当前模型信息
   */
  async fetchTavernModelInfo() {
    const modelNameEl = document.getElementById('tavern-model-name');
    if (!modelNameEl) return;

    modelNameEl.textContent = '获取中...';

    try {
      // 检查是否在酒馆环境中
      if (typeof SillyTavern !== 'undefined' && SillyTavern.getChatCompletionModel) {
        // 使用酒馆提供的API获取当前模型
        const modelName = SillyTavern.getChatCompletionModel();
        modelNameEl.textContent = modelName || '未配置';
        showToast('已获取酒馆模型信息');
      } else if (typeof getPreset === 'function') {
        // 使用TavernHelper的getPreset函数获取预设信息
        try {
          const preset = getPreset('in_use');
          if (preset && preset.settings) {
            // 尝试从预设中获取模型相关信息
            modelNameEl.textContent = '使用当前预设';
            showToast('已检测到酒馆预设');
          } else {
            modelNameEl.textContent = '酒馆预设';
          }
        } catch (e) {
          modelNameEl.textContent = '酒馆API';
        }
      } else {
        modelNameEl.textContent = '未检测到酒馆环境';
        showToast('未检测到酒馆环境，请在酒馆中运行');
      }
    } catch (error) {
      console.error('获取酒馆模型信息失败:', error);
      modelNameEl.textContent = '获取失败';
      showToast('获取酒馆模型信息失败');
    }
  },

  /**
   * 检查是否在酒馆环境中运行
   * @returns {boolean}
   */
  isInTavernEnvironment() {
    return typeof SillyTavern !== 'undefined' || typeof generate === 'function';
  },

  /**
   * 设置下拉菜单
   * @param {string} triggerId - 触发按钮ID
   * @param {string} menuId - 菜单ID
   * @param {string} inputId - 输入框ID
   */
  setupDropdown(triggerId, menuId, inputId) {
    const trigger = document.getElementById(triggerId);
    const menu = document.getElementById(menuId);
    const input = document.getElementById(inputId);

    if (!trigger || !menu || !input) return;

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      this.closeAllDropdowns();
      menu.classList.toggle('active');
    });

    // 菜单项点击 - 使用事件委托
    menu.addEventListener('click', e => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;

      // 检查是否是获取模型按钮
      if (item.dataset.action === 'fetch') {
        e.stopPropagation();
        this.fetchModelList();
        return;
      }

      const value = item.dataset.value;
      if (value !== undefined) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      menu.classList.remove('active');
    });
  },

  /**
   * 获取可用模型列表
   */
  async fetchModelList() {
    const apiEndpoint = document.getElementById('api-endpoint');
    const apiKey = document.getElementById('api-key');
    const modelLoading = document.getElementById('model-loading');
    const modelListContainer = document.getElementById('model-list-container');

    const endpoint = apiEndpoint && apiEndpoint.value && apiEndpoint.value.trim();
    const key = apiKey && apiKey.value && apiKey.value.trim();

    if (!endpoint || !key) {
      showToast('请先填写API端点和密钥');
      return;
    }

    // 构建models端点URL
    let modelsUrl = endpoint;
    if (endpoint.includes('/chat/completions')) {
      modelsUrl = endpoint.replace('/chat/completions', '/models');
    } else if (endpoint.includes('/messages')) {
      // Anthropic API没有models端点，使用预设列表
      this.showAnthropicModels();
      return;
    } else if (!endpoint.includes('/models')) {
      modelsUrl = endpoint.replace(/\/+$/, '') + '/models';
    }

    // 显示加载状态
    if (modelLoading) modelLoading.style.display = 'block';
    if (modelListContainer) modelListContainer.innerHTML = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // 使用 callLLMApi 的辅助逻辑来处理请求，或者直接使用 fetch 但增加错误处理
      // 这里我们直接使用 fetch，因为这是一个特殊的 GET 请求，不是标准的 chat completion
      const response = await fetch(modelsUrl, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + key,
          // 添加 Anthropic 版本头，如果是 Anthropic API
          ...(modelsUrl.includes('anthropic.com') ? { 'anthropic-version': '2023-06-01' } : {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();
      let models = [];

      // 处理不同API的响应格式
      if (data.data && Array.isArray(data.data)) {
        // OpenAI格式
        models = data.data.map(m => ({
          id: m.id,
          name: m.id,
        }));
      } else if (Array.isArray(data.models)) {
        // 某些第三方格式
        models = data.models.map(m => ({
          id: typeof m === 'string' ? m : m.id || m.name,
          name: typeof m === 'string' ? m : m.name || m.id,
        }));
      } else if (Array.isArray(data)) {
        models = data.map(m => ({
          id: typeof m === 'string' ? m : m.id || m.name,
          name: typeof m === 'string' ? m : m.name || m.id,
        }));
      }

      // 过滤和排序模型
      models = models
        .filter(
          m =>
            m.id &&
            !m.id.includes('embedding') &&
            !m.id.includes('whisper') &&
            !m.id.includes('tts') &&
            !m.id.includes('dall-e'),
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      this.renderModelList(models);
      showToast('获取到 ' + models.length + ' 个可用模型');
    } catch (error) {
      console.error('获取模型列表失败:', error);
      if (modelListContainer) {
        modelListContainer.innerHTML = '<div class="dropdown-error">获取失败: ' + error.message + '</div>';
      }
      showToast('获取模型列表失败');
    } finally {
      if (modelLoading) modelLoading.style.display = 'none';
    }
  },

  /**
   * 渲染模型列表
   * @param {Array} models - 模型数组
   */
  renderModelList(models) {
    const container = document.getElementById('model-list-container');
    if (!container) return;

    if (models.length === 0) {
      container.innerHTML = '<div class="dropdown-empty">未找到可用模型</div>';
      return;
    }

    // 分类模型
    const gptModels = models.filter(m => m.id.includes('gpt'));
    const claudeModels = models.filter(m => m.id.includes('claude'));
    const otherModels = models.filter(m => !m.id.includes('gpt') && !m.id.includes('claude'));

    let html = '';

    if (gptModels.length > 0) {
      html += '<div class="dropdown-header">GPT 模型</div>';
      gptModels.forEach(m => {
        html += '<div class="dropdown-item" data-value="' + m.id + '">' + m.name + '</div>';
      });
    }

    if (claudeModels.length > 0) {
      html += '<div class="dropdown-header">Claude 模型</div>';
      claudeModels.forEach(m => {
        html += '<div class="dropdown-item" data-value="' + m.id + '">' + m.name + '</div>';
      });
    }

    if (otherModels.length > 0) {
      html += '<div class="dropdown-header">其他模型</div>';
      otherModels.forEach(m => {
        html += '<div class="dropdown-item" data-value="' + m.id + '">' + m.name + '</div>';
      });
    }

    container.innerHTML = html;
  },

  /**
   * 显示Anthropic预设模型列表
   */
  showAnthropicModels() {
    const container = document.getElementById('model-list-container');
    if (!container) return;

    const models = [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
    ];

    let html = '<div class="dropdown-header">Claude 模型 (预设)</div>';
    models.forEach(m => {
      html += '<div class="dropdown-item" data-value="' + m.id + '">' + m.name + '</div>';
    });

    container.innerHTML = html;
    showToast('Anthropic API 使用预设模型列表');
  },

  /**
   * 关闭所有下拉菜单
   */
  closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('active');
    });
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 返回按钮
    const backBtn = document.getElementById('btn-back-from-settings');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.safeNavigateBack();
      });
    }

    // AI 设置保存按钮
    const saveAiBtn = document.getElementById('btn-save-ai-settings');
    if (saveAiBtn) {
      saveAiBtn.addEventListener('click', () => {
        this.saveAiSettings();
      });
    }

    // 测试API按钮
    const testApiBtn = document.getElementById('btn-test-api');
    if (testApiBtn) {
      testApiBtn.addEventListener('click', () => {
        this.testApiConnection();
      });
    }

    // 重置API设置按钮
    const resetApiBtn = document.getElementById('btn-reset-api');
    if (resetApiBtn) {
      resetApiBtn.addEventListener('click', () => {
        this.resetApiSettings();
      });
    }

    // 密钥显示/隐藏切换
    const toggleKeyBtn = document.getElementById('btn-toggle-key');
    if (toggleKeyBtn) {
      toggleKeyBtn.addEventListener('click', () => {
        this.toggleApiKeyVisibility();
      });
    }

    // API格式选择 - 自动保存并切换参数面板
    const apiFormat = document.getElementById('api-format');
    if (apiFormat) {
      apiFormat.addEventListener('change', () => {
        this.autoSaveApiSettings();
        this.updateEndpointPlaceholder();
        this.updateApiFormatParams();
      });
      // 初始化时更新占位符和参数面板
      this.updateEndpointPlaceholder();
      this.updateApiFormatParams();
    }

    // OpenAI 特有参数 - 文本输入框自动保存
    const topPOpenai = document.getElementById('top-p-openai');
    if (topPOpenai) {
      topPOpenai.addEventListener('change', () => {
        this.autoSaveApiSettings();
      });
    }

    const frequencyPenalty = document.getElementById('frequency-penalty');
    if (frequencyPenalty) {
      frequencyPenalty.addEventListener('change', () => {
        this.autoSaveApiSettings();
      });
    }

    const presencePenalty = document.getElementById('presence-penalty');
    if (presencePenalty) {
      presencePenalty.addEventListener('change', () => {
        this.autoSaveApiSettings();
      });
    }

    // Gemini 特有参数的滑块事件
    const topP = document.getElementById('top-p');
    const topPValue = document.getElementById('top-p-value');
    if (topP && topPValue) {
      topP.addEventListener('input', e => {
        topPValue.textContent = e.target.value;
      });
      topP.addEventListener('change', () => {
        this.autoSaveApiSettings();
      });
    }

    const topK = document.getElementById('top-k');
    const topKValue = document.getElementById('top-k-value');
    if (topK && topKValue) {
      topK.addEventListener('input', e => {
        topKValue.textContent = e.target.value;
      });
      topK.addEventListener('change', () => {
        this.autoSaveApiSettings();
      });
    }

    // Anthropic 温度滑块
    const temperatureAnthropic = document.getElementById('temperature-anthropic');
    const tempValueAnthropic = document.getElementById('temp-value-anthropic');
    if (temperatureAnthropic && tempValueAnthropic) {
      temperatureAnthropic.addEventListener('input', e => {
        tempValueAnthropic.textContent = e.target.value;
      });
      temperatureAnthropic.addEventListener('change', () => {
        this.autoSaveApiSettings();
      });
    }

    // Gemini 温度滑块
    const temperatureGemini = document.getElementById('temperature-gemini');
    const tempValueGemini = document.getElementById('temp-value-gemini');
    if (temperatureGemini && tempValueGemini) {
      temperatureGemini.addEventListener('input', e => {
        tempValueGemini.textContent = e.target.value;
      });
      temperatureGemini.addEventListener('change', () => {
        this.autoSaveApiSettings();
      });
    }

    // API端点输入框（不再自动保存，需要点击保存按钮）
    const apiEndpoint = document.getElementById('api-endpoint');

    // API密钥输入框（不再自动保存，需要点击保存按钮）
    const apiKey = document.getElementById('api-key');

    // 模型名称输入框（不再自动保存，需要点击保存按钮）
    const modelName = document.getElementById('model-name');

    // OpenAI 温度文字框自动保存
    const temperature = document.getElementById('temperature');
    if (temperature) {
      temperature.addEventListener('change', () => {
        this.autoSaveApiSettings();
      });
    }

    const maxTokens = document.getElementById('max-tokens');
    const tokenValue = document.getElementById('token-value');
    if (maxTokens && tokenValue) {
      maxTokens.addEventListener('input', e => {
        tokenValue.textContent = e.target.value;
      });
      // 滑块也自动保存
      maxTokens.addEventListener('change', () => {
        this.autoSaveApiSettings();
      });
    }

    // 导出存档按钮
    const exportBtn = document.getElementById('btn-export-save');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.safeExportSave();
      });
    }

    // 导入存档输入
    const importInput = document.getElementById('import-save-input');
    if (importInput) {
      importInput.addEventListener('change', async e => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          await this.safeImportSave(file);
          e.target.value = '';
        }
      });
    }

    // 打开变量设置按钮
    const openVariablesBtn = document.getElementById('btn-open-variables');
    if (openVariablesBtn) {
      openVariablesBtn.addEventListener('click', () => {
        navigateTo('variables');
        if (typeof VariablesUI !== 'undefined') {
          VariablesUI.switchTab('status');
        }
      });
    }

    // 世界书管理按钮
    const importWorldbookBtn = document.getElementById('btn-import-worldbook-settings');
    if (importWorldbookBtn) {
      importWorldbookBtn.addEventListener('click', () => {
        const input = document.getElementById('worldbook-import-settings');
        if (input) input.click();
      });
    }

    const worldbookInput = document.getElementById('worldbook-import-settings');
    if (worldbookInput) {
      worldbookInput.addEventListener('change', e => {
        this.handleWorldbookImport(e);
      });
    }

    const manageWorldbookBtn = document.getElementById('btn-manage-worldbook');
    if (manageWorldbookBtn) {
      manageWorldbookBtn.addEventListener('click', () => {
        navigateTo('variables');
        if (typeof VariablesUI !== 'undefined') {
          VariablesUI.switchTab('worldbook');
        }
      });
    }

    const clearWorldbookBtn = document.getElementById('btn-clear-worldbook-settings');
    if (clearWorldbookBtn) {
      clearWorldbookBtn.addEventListener('click', () => {
        this.clearWorldbook();
      });
    }

    // 存档管理按钮
    const saveNowBtn = document.getElementById('btn-save-now');
    if (saveNowBtn) {
      saveNowBtn.addEventListener('click', () => {
        this.saveNow();
      });
    }

    const deleteSaveBtn = document.getElementById('btn-delete-save');
    if (deleteSaveBtn) {
      deleteSaveBtn.addEventListener('click', () => {
        this.deleteSave();
      });
    }

    // 新建存档按钮（设置页面）
    const createArchiveBtn = document.getElementById('btn-create-archive-settings');
    if (createArchiveBtn) {
      createArchiveBtn.addEventListener('click', () => {
        this.showNewArchiveInput();
      });
    }

    // 确认新建存档
    const confirmNewArchiveBtn = document.getElementById('btn-settings-confirm-new-archive');
    const newArchiveInput = document.getElementById('settings-new-archive-input');
    if (confirmNewArchiveBtn && newArchiveInput) {
      confirmNewArchiveBtn.addEventListener('click', () => {
        const name = newArchiveInput.value.trim();
        if (name) {
          if (SaveSystem.createNewArchive(name)) {
            this.hideNewArchiveInput();
            this.renderSettingsArchiveList();
            this.updateSaveStatus();
          }
        } else {
          showToast('请输入存档名称');
        }
      });

      newArchiveInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          confirmNewArchiveBtn.click();
        } else if (e.key === 'Escape') {
          this.hideNewArchiveInput();
        }
      });
    }

    // 取消新建存档
    const cancelNewArchiveBtn = document.getElementById('btn-settings-cancel-new-archive');
    if (cancelNewArchiveBtn) {
      cancelNewArchiveBtn.addEventListener('click', () => {
        this.hideNewArchiveInput();
      });
    }

    // 快速保存按钮
    const quickSaveBtn = document.getElementById('btn-quick-save');
    if (quickSaveBtn) {
      quickSaveBtn.addEventListener('click', () => {
        this.quickSave();
      });
    }
  },

  /**
   * 安全返回导航
   * 设置页面的返回逻辑：如果游戏已开始返回游戏页面，否则返回主页
   */
  safeNavigateBack() {
    try {
      // 确定返回目标：如果游戏世界已加载，返回游戏页面；否则返回主页
      let targetPage = 'home';

      if (GameState.world && GameState.world.isLoaded) {
        targetPage = 'game';
      }

      // 验证目标页面是否存在
      const pageElement = document.getElementById('page-' + targetPage);
      if (pageElement) {
        navigateTo(targetPage);
      } else {
        navigateTo('home');
      }
    } catch (error) {
      console.error('导航失败:', error);
      navigateTo('home');
    }
  },

  /**
   * 安全导出存档
   */
  safeExportSave() {
    try {
      if (typeof SaveSystem !== 'undefined' && SaveSystem.exportSave) {
        SaveSystem.exportSave();
      } else {
        showToast('存档系统未初始化');
      }
    } catch (error) {
      console.error('导出存档失败:', error);
      showToast('导出存档失败');
    }
  },

  /**
   * 安全导入存档
   * @param {File} file - 存档文件
   */
  async safeImportSave(file) {
    try {
      if (typeof SaveSystem !== 'undefined' && SaveSystem.importSave) {
        const success = await SaveSystem.importSave(file);
        if (success) {
          this.loadSettings();
        }
      } else {
        showToast('存档系统未初始化');
      }
    } catch (error) {
      console.error('导入存档失败:', error);
      showToast('导入存档失败');
    }
  },

  /**
   * 切换API密钥可见性
   */
  toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('api-key');
    const eyeIcon = document.querySelector('#btn-toggle-key .icon-eye');
    const eyeOffIcon = document.querySelector('#btn-toggle-key .icon-eye-off');

    if (!apiKeyInput) return;

    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      if (eyeIcon) eyeIcon.style.display = 'none';
      if (eyeOffIcon) eyeOffIcon.style.display = 'block';
    } else {
      apiKeyInput.type = 'password';
      if (eyeIcon) eyeIcon.style.display = 'block';
      if (eyeOffIcon) eyeOffIcon.style.display = 'none';
    }
  },

  /**
   * 加载设置到UI
   */
  loadSettings() {
    try {
      // 先从存储加载
      if (typeof SaveSystem !== 'undefined') {
        SaveSystem.loadSettings();
      }

      // 加载酒馆API设置
      const useTavernApi = document.getElementById('use-tavern-api');
      if (useTavernApi) {
        useTavernApi.checked = GameState.settings.useTavernApi || false;
        this.updateApiConfigVisibility(useTavernApi.checked);
        if (useTavernApi.checked) {
          this.fetchTavernModelInfo();
        }
      }

      // 加载主题设置
      const theme = (GameState.settings && GameState.settings.theme) || 'default';
      this.applyTheme(theme);

      // 安全获取元素并更新
      const apiEndpoint = document.getElementById('api-endpoint');
      const apiKey = document.getElementById('api-key');
      const modelName = document.getElementById('model-name');
      const temperature = document.getElementById('temperature');
      const tempValue = document.getElementById('temp-value');
      const maxTokens = document.getElementById('max-tokens');
      const tokenValue = document.getElementById('token-value');

      if (apiEndpoint) {
        apiEndpoint.value = (GameState.settings && GameState.settings.apiEndpoint) || '';
      }
      if (apiKey) {
        apiKey.value = (GameState.settings && GameState.settings.apiKey) || '';
      }
      if (modelName) {
        modelName.value = (GameState.settings && GameState.settings.modelName) || 'gpt-4';
      }
      if (temperature) {
        const tempVal =
          GameState.settings && GameState.settings.temperature !== undefined ? GameState.settings.temperature : 0.7;
        temperature.value = tempVal;
      }
      if (tempValue) {
        const tempVal =
          GameState.settings && GameState.settings.temperature !== undefined ? GameState.settings.temperature : 0.7;
        tempValue.textContent = tempVal;
      }
      if (maxTokens) {
        const tokenVal =
          GameState.settings && GameState.settings.maxTokens !== undefined ? GameState.settings.maxTokens : 2048;
        maxTokens.value = tokenVal;
      }
      if (tokenValue) {
        const tokenVal =
          GameState.settings && GameState.settings.maxTokens !== undefined ? GameState.settings.maxTokens : 2048;
        tokenValue.textContent = tokenVal;
      }

      // 加载 API 格式设置
      const apiFormatEl = document.getElementById('api-format');
      if (apiFormatEl) {
        apiFormatEl.value = (GameState.settings && GameState.settings.apiFormat) || 'openai';
        this.updateEndpointPlaceholder();
        this.updateApiFormatParams();
      }

      // 加载各格式特有参数
      // Anthropic 温度
      const temperatureAnthropic = document.getElementById('temperature-anthropic');
      const tempValueAnthropic = document.getElementById('temp-value-anthropic');
      if (temperatureAnthropic) {
        const tempVal = GameState.settings && GameState.settings.temperatureAnthropic !== undefined 
          ? GameState.settings.temperatureAnthropic 
          : 1.0;
        temperatureAnthropic.value = tempVal;
        if (tempValueAnthropic) tempValueAnthropic.textContent = tempVal;
      }

      // Gemini 温度
      const temperatureGemini = document.getElementById('temperature-gemini');
      const tempValueGemini = document.getElementById('temp-value-gemini');
      if (temperatureGemini) {
        const tempVal = GameState.settings && GameState.settings.temperatureGemini !== undefined 
          ? GameState.settings.temperatureGemini 
          : 1.0;
        temperatureGemini.value = tempVal;
        if (tempValueGemini) tempValueGemini.textContent = tempVal;
      }

      // Gemini Top P
      const topP = document.getElementById('top-p');
      const topPValue = document.getElementById('top-p-value');
      if (topP) {
        const val = GameState.settings && GameState.settings.topP !== undefined 
          ? GameState.settings.topP 
          : 0.95;
        topP.value = val;
        if (topPValue) topPValue.textContent = val;
      }

      // Gemini Top K
      const topK = document.getElementById('top-k');
      const topKValue = document.getElementById('top-k-value');
      if (topK) {
        const val = GameState.settings && GameState.settings.topK !== undefined 
          ? GameState.settings.topK 
          : 40;
        topK.value = val;
        if (topKValue) topKValue.textContent = val;
      }


      // OpenAI Top P（文字框）
      const topPOpenai = document.getElementById('top-p-openai');
      if (topPOpenai) {
        const val = GameState.settings && GameState.settings.topPOpenai !== undefined 
          ? GameState.settings.topPOpenai 
          : 1.0;
        topPOpenai.value = val;
      }

      // Frequency Penalty（文字框）
      const frequencyPenalty = document.getElementById('frequency-penalty');
      if (frequencyPenalty) {
        const val = GameState.settings && GameState.settings.frequencyPenalty !== undefined 
          ? GameState.settings.frequencyPenalty 
          : 0.0;
        frequencyPenalty.value = val;
      }

      // Presence Penalty（文字框）
      const presencePenalty = document.getElementById('presence-penalty');
      if (presencePenalty) {
        const val = GameState.settings && GameState.settings.presencePenalty !== undefined 
          ? GameState.settings.presencePenalty 
          : 0.0;
        presencePenalty.value = val;
      }

      // 更新状态显示
      this.updateApiConfigStatus();
      this.updateWorldbookSummary();
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  },

  /**
   * 更新API配置状态显示
   */
  updateApiConfigStatus() {
    const statusEl = document.getElementById('ai-config-status');
    if (!statusEl) return;

    const useTavernApi = GameState.settings && GameState.settings.useTavernApi;
    const hasEndpoint = GameState.settings && GameState.settings.apiEndpoint && GameState.settings.apiEndpoint.trim();
    const hasKey = GameState.settings && GameState.settings.apiKey && GameState.settings.apiKey.trim();

    if (useTavernApi) {
      statusEl.textContent = '使用酒馆API';
      statusEl.classList.add('configured');
      statusEl.classList.remove('not-configured');
    } else if (hasEndpoint && hasKey) {
      statusEl.textContent = '已配置';
      statusEl.classList.add('configured');
      statusEl.classList.remove('not-configured');
    } else {
      statusEl.textContent = '未配置';
      statusEl.classList.remove('configured');
      statusEl.classList.add('not-configured');
    }
  },

  /**
   * 更新世界书摘要显示
   */
  updateWorldbookSummary() {
    const countEl = document.getElementById('worldbook-count');
    if (countEl) {
      const count = (GameState.world && GameState.world.entries && GameState.world.entries.length) || 0;
      countEl.textContent = count;
    }
  },

  /**
   * 自动保存API设置（静默保存，不显示提示）
   */
  autoSaveApiSettings() {
    try {
      // 安全收集设置
      const apiEndpoint = document.getElementById('api-endpoint');
      const apiKey = document.getElementById('api-key');
      const modelName = document.getElementById('model-name');
      const temperature = document.getElementById('temperature');
      const maxTokens = document.getElementById('max-tokens');
      const useTavernApi = document.getElementById('use-tavern-api');
      const apiFormat = document.getElementById('api-format');

      // 各格式特有参数
      const temperatureAnthropic = document.getElementById('temperature-anthropic');
      const temperatureGemini = document.getElementById('temperature-gemini');
      const topP = document.getElementById('top-p');
      const topK = document.getElementById('top-k');
      
      // OpenAI 特有参数
      const topPOpenai = document.getElementById('top-p-openai');
      const frequencyPenalty = document.getElementById('frequency-penalty');
      const presencePenalty = document.getElementById('presence-penalty');

      // 更新 GameState.settings
      GameState.settings.useTavernApi = useTavernApi ? useTavernApi.checked : false;
      GameState.settings.apiEndpoint = (apiEndpoint && apiEndpoint.value && apiEndpoint.value.trim()) || '';
      GameState.settings.apiKey = (apiKey && apiKey.value && apiKey.value.trim()) || '';
      GameState.settings.modelName = (modelName && modelName.value && modelName.value.trim()) || 'gpt-4';
      GameState.settings.temperature = parseFloat(temperature && temperature.value) || 0.7;
      GameState.settings.maxTokens = parseInt(maxTokens && maxTokens.value, 10) || 2048;
      GameState.settings.apiFormat = (apiFormat && apiFormat.value) || 'openai';

      // 保存各格式特有参数
      GameState.settings.temperatureAnthropic = parseFloat(temperatureAnthropic && temperatureAnthropic.value) || 1.0;
      GameState.settings.temperatureGemini = parseFloat(temperatureGemini && temperatureGemini.value) || 1.0;
      GameState.settings.topP = parseFloat(topP && topP.value) || 0.95;
      GameState.settings.topK = parseInt(topK && topK.value, 10) || 40;
      
      // 保存 OpenAI 特有参数
      GameState.settings.topPOpenai = parseFloat(topPOpenai && topPOpenai.value) || 1.0;
      GameState.settings.frequencyPenalty = parseFloat(frequencyPenalty && frequencyPenalty.value) || 0.0;
      GameState.settings.presencePenalty = parseFloat(presencePenalty && presencePenalty.value) || 0.0;

      // 验证设置值范围
      GameState.settings.temperature = Math.max(0, Math.min(2, GameState.settings.temperature));
      GameState.settings.temperatureAnthropic = Math.max(0, Math.min(1, GameState.settings.temperatureAnthropic));
      GameState.settings.temperatureGemini = Math.max(0, Math.min(2, GameState.settings.temperatureGemini));
      GameState.settings.topP = Math.max(0, Math.min(1, GameState.settings.topP));
      GameState.settings.topK = Math.max(1, Math.min(100, GameState.settings.topK));
      GameState.settings.maxTokens = Math.max(256, Math.min(128000, GameState.settings.maxTokens));
      
      // 验证 OpenAI 特有参数范围
      GameState.settings.topPOpenai = Math.max(0, Math.min(1, GameState.settings.topPOpenai));
      GameState.settings.frequencyPenalty = Math.max(-2, Math.min(2, GameState.settings.frequencyPenalty));
      GameState.settings.presencePenalty = Math.max(-2, Math.min(2, GameState.settings.presencePenalty));

      // 静默保存到存储
      if (typeof SaveSystem !== 'undefined') {
        SaveSystem.saveSettings(true); // true = 静默保存
      }

      // 更新状态显示
      this.updateApiConfigStatus();

      // 调试日志
      console.log('[API设置自动保存] 当前配置:', {
        apiEndpoint: GameState.settings.apiEndpoint,
        apiKey: GameState.settings.apiKey ? '***已设置***' : '未设置',
        modelName: GameState.settings.modelName,
        apiFormat: GameState.settings.apiFormat,
        temperature: GameState.settings.temperature,
        temperatureAnthropic: GameState.settings.temperatureAnthropic,
        temperatureGemini: GameState.settings.temperatureGemini,
        topP: GameState.settings.topP,
        topK: GameState.settings.topK,
        maxTokens: GameState.settings.maxTokens,
      });
    } catch (error) {
      console.error('自动保存设置失败:', error);
    }
  },

  /**
   * 保存 AI 设置（带提示）
   */
  saveAiSettings() {
    try {
      // 调用自动保存逻辑
      this.autoSaveApiSettings();
      
      // 显示保存成功提示
      showToast('🤖 AI 设置已保存');
      
      // 调试日志
      console.log('[AI设置已保存] 当前配置:', {
        apiEndpoint: GameState.settings.apiEndpoint,
        apiKey: GameState.settings.apiKey ? '***已设置***' : '未设置',
        modelName: GameState.settings.modelName,
        apiFormat: GameState.settings.apiFormat,
        temperature: GameState.settings.temperature,
        maxTokens: GameState.settings.maxTokens,
      });
    } catch (error) {
      console.error('保存AI设置失败:', error);
      showToast('保存AI设置失败');
    }
  },

  /**
   * 保存设置（兼容旧版调用）
   */
  saveSettings() {
    this.saveAiSettings();
  },

  /**
   * 测试API连接
   */
  async testApiConnection() {
    const useTavernApi = document.getElementById('use-tavern-api');
    const isUsingTavern = useTavernApi ? useTavernApi.checked : false;

    // 显示状态
    const apiStatus = document.getElementById('api-status');
    const apiStatusText = document.getElementById('api-status-text');

    if (apiStatus) {
      apiStatus.style.display = 'flex';
    }
    if (apiStatusText) {
      apiStatusText.textContent = '测试中...';
    }

    // 如果使用酒馆API，测试逻辑不同
    if (isUsingTavern) {
      try {
        if (typeof SillyTavern !== 'undefined' || typeof generate === 'function') {
          this.updateApiStatus(true, '酒馆环境已就绪');
          showToast('酒馆环境连接正常');
        } else {
          this.updateApiStatus(false, '未检测到酒馆环境');
          showToast('请在酒馆（SillyTavern）中运行此应用');
        }
        return;
      } catch (error) {
        this.updateApiStatus(false, '测试失败: ' + error.message);
        return;
      }
    }

    const apiEndpoint = document.getElementById('api-endpoint');
    const apiKey = document.getElementById('api-key');
    const modelName = document.getElementById('model-name');

    const endpoint = apiEndpoint && apiEndpoint.value && apiEndpoint.value.trim();
    const key = apiKey && apiKey.value && apiKey.value.trim();
    const model = (modelName && modelName.value && modelName.value.trim()) || 'gpt-4';

    if (!endpoint || !key) {
      showToast('请填写API端点和密钥');
      if (apiStatus) apiStatus.style.display = 'none';
      return;
    }

    try {
      // 设置超时
      const controller = new AbortController();
      const timeoutId = setTimeout(function () {
        controller.abort();
      }, 30000);

      // 获取当前选择的 API 格式
      const apiFormatEl = document.getElementById('api-format');
      const apiFormat = (apiFormatEl && apiFormatEl.value) || 'openai';

      // 使用通用的 callLLMApi 函数
      const response = await callLLMApi({
        endpoint: endpoint,
        apiKey: key,
        model: model,
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5,
        signal: controller.signal,
        apiFormat: apiFormat,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.updateApiStatus(true, '连接成功');
        showToast('API连接成功');
      } else {
        let errorMsg = 'HTTP ' + response.status;
        try {
          const errorData = await response.json();
          errorMsg = (errorData.error && errorData.error.message) || errorMsg;
        } catch (e) {
          // 忽略JSON解析错误
        }
        this.updateApiStatus(false, '连接失败: ' + errorMsg);
        showToast('API连接失败');
      }
    } catch (error) {
      let errorMsg = error.message;
      if (error.name === 'AbortError') {
        errorMsg = '连接超时';
      }
      this.updateApiStatus(false, '连接失败: ' + errorMsg);
      showToast('API连接失败');
    }
  },

  /**
   * 更新API状态显示
   * @param {boolean} success - 是否成功
   * @param {string} message - 状态消息
   */
  updateApiStatus(success, message) {
    const apiStatus = document.getElementById('api-status');
    const apiStatusText = document.getElementById('api-status-text');

    if (apiStatus) {
      apiStatus.style.display = 'flex';
      const dot = apiStatus.querySelector('.status-dot');
      if (dot) {
        if (success) {
          dot.classList.remove('error');
          dot.classList.add('success');
        } else {
          dot.classList.add('error');
          dot.classList.remove('success');
        }
      }
    }
    if (apiStatusText) {
      apiStatusText.textContent = message;
    }
  },

  /**
   * 重置API设置为默认值
   */
  resetApiSettings() {
    if (!confirm('确定要重置API设置吗？')) {
      return;
    }

    GameState.settings.apiEndpoint = '';
    GameState.settings.apiKey = '';
    GameState.settings.modelName = 'gpt-4';
    GameState.settings.temperature = 0.7;
    GameState.settings.maxTokens = 2048;

    this.loadSettings();

    // 隐藏状态
    const apiStatus = document.getElementById('api-status');
    if (apiStatus) {
      apiStatus.style.display = 'none';
    }

    showToast('API设置已重置');
  },

  /**
   * 处理世界书导入
   * @param {Event} event - 文件输入事件
   */
  async handleWorldbookImport(event) {
    const file = event.target && event.target.files && event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // 处理不同格式的世界书
      let entries = [];
      if (Array.isArray(data)) {
        entries = data;
      } else if (data.entries && Array.isArray(data.entries)) {
        entries = data.entries;
      } else if (typeof data === 'object') {
        // 尝试将对象转换为条目数组
        entries = Object.entries(data).map(function (pair) {
          const key = pair[0];
          const value = pair[1];
          const result = { key: key };
          if (typeof value === 'object') {
            Object.assign(result, value);
          } else {
            result.content = String(value);
          }
          return result;
        });
      }

      // 验证条目格式
      entries = entries.filter(function (entry) {
        return entry && (entry.content || entry.name || entry.key);
      });

      if (entries.length === 0) {
        showToast('未找到有效的世界书条目');
        return;
      }

      GameState.world.entries = entries;
      GameState.world.isLoaded = true;

      showToast('成功导入 ' + entries.length + ' 条世界书条目');
      this.updateWorldbookSummary();
    } catch (error) {
      showToast('导入失败：文件格式不正确');
      console.error('世界书导入错误:', error);
    }

    event.target.value = '';
  },

  /**
   * 清除世界书
   */
  clearWorldbook() {
    if (!confirm('确定要清除已加载的世界书吗？')) {
      return;
    }

    GameState.world.entries = [];
    GameState.world.isLoaded = false;
    this.updateWorldbookSummary();
    showToast('世界书已清除');
  },

  /**
   * 获取常用API端点列表
   * @returns {Array} - 端点列表
   */
  getCommonEndpoints() {
    return [
      { name: 'OpenAI', url: 'https://api.openai.com/v1/chat/completions' },
      { name: 'Claude (Anthropic)', url: 'https://api.anthropic.com/v1/messages' },
      { name: '本地 Ollama', url: 'http://localhost:11434/v1/chat/completions' },
      { name: '本地 LM Studio', url: 'http://localhost:1234/v1/chat/completions' },
    ];
  },

  /**
   * 获取常用模型列表
   * @returns {Array} - 模型列表
   */
  getCommonModels() {
    return [
      { name: 'GPT-4', value: 'gpt-4' },
      { name: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
      { name: 'GPT-4o', value: 'gpt-4o' },
      { name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
      { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
      { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
      { name: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
      { name: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
      { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
    ];
  },

  /**
   * 显示高级设置
   */
  showAdvancedSettings() {
    // 可以扩展为显示更多高级设置
    console.log('高级设置');
  },

  /**
   * 更新存档状态显示
   */
  updateSaveStatus() {
    const statusEl = document.getElementById('save-status');
    const currentArchiveNameEl = document.getElementById('current-archive-name');

    if (!statusEl) return;

    try {
      const archives = SaveSystem.getAllArchives();
      const archiveCount = Object.keys(archives).length;
      const currentArchive = SaveSystem.getCurrentArchiveName();

      if (archiveCount > 0) {
        statusEl.textContent = `${archiveCount} 个存档`;
        statusEl.classList.add('configured');
        statusEl.classList.remove('not-configured');
      } else {
        statusEl.textContent = '无存档';
        statusEl.classList.remove('configured');
        statusEl.classList.add('not-configured');
      }

      // 更新当前存档名称显示
      if (currentArchiveNameEl) {
        if (currentArchive) {
          currentArchiveNameEl.textContent = currentArchive;
          currentArchiveNameEl.classList.add('has-archive');
        } else {
          currentArchiveNameEl.textContent = '未选择';
          currentArchiveNameEl.classList.remove('has-archive');
        }
      }

      // 渲染存档列表
      this.renderSettingsArchiveList();
    } catch (error) {
      console.error('更新存档状态失败:', error);
      statusEl.textContent = '无存档';
    }

    // 更新世界书状态
    this.updateWorldbookStatus();
  },

  /**
   * 渲染设置页面的存档列表
   */
  renderSettingsArchiveList() {
    const container = document.getElementById('settings-archive-list');
    if (!container) return;

    const archives = SaveSystem.getAllArchives();
    const archiveNames = Object.keys(archives);
    const currentArchive = SaveSystem.getCurrentArchiveName();

    if (archiveNames.length === 0) {
      container.innerHTML = `
        <div class="empty-archive-hint" style="padding: 20px; text-align: center;">
          <p style="color: var(--ink-muted); font-style: italic;">暂无存档，点击"新建存档"创建</p>
        </div>
      `;
      return;
    }

    // 按更新时间排序
    archiveNames.sort((a, b) => {
      const timeA = archives[a].updatedAt || archives[a].createdAt || 0;
      const timeB = archives[b].updatedAt || archives[b].createdAt || 0;
      return timeB - timeA;
    });

    container.innerHTML = archiveNames
      .map(name => {
        const archive = archives[name];
        const info = SaveSystem._extractArchiveInfo(archive, name);
        const date = new Date(info.timestamp);
        const dateStr = date.toLocaleString('zh-CN', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const isCurrent = name === currentArchive;

        return `
        <div class="settings-archive-item ${isCurrent ? 'current' : ''}" data-archive-name="${this._escapeHtml(name)}">
          <div class="settings-archive-radio">
            <input type="radio" name="settings-archive-select" value="${this._escapeHtml(name)}" ${isCurrent ? 'checked' : ''} id="archive-radio-${this._escapeHtml(name)}">
          </div>
          <div class="settings-archive-info">
            <div class="settings-archive-name">
              ${this._escapeHtml(name)}
              ${isCurrent ? '<span class="current-badge">当前</span>' : ''}
            </div>
            <div class="settings-archive-details">
              <span class="archive-char">${this._escapeHtml(info.characterName)}</span>
              <span class="archive-floor">第${info.floor}层</span>
              <span class="archive-hp">❤️ ${info.hp}/${info.maxHp}</span>
              <span class="archive-time">${dateStr}</span>
            </div>
          </div>
          <div class="settings-archive-actions">
            <button class="btn btn-ghost btn-small settings-archive-delete-btn" title="删除此存档" data-name="${this._escapeHtml(name)}">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              删除
            </button>
          </div>
        </div>
      `;
      })
      .join('');

    // 绑定事件
    container.querySelectorAll('.settings-archive-item').forEach(item => {
      const archiveName = item.dataset.archiveName;
      const radio = item.querySelector('input[type="radio"]');
      const deleteBtn = item.querySelector('.settings-archive-delete-btn');

      // 点击整行选择
      item.addEventListener('click', e => {
        if (!e.target.closest('.settings-archive-delete-btn')) {
          this.selectArchive(archiveName);
        }
      });

      // 单选按钮变化
      if (radio) {
        radio.addEventListener('change', () => {
          if (radio.checked) {
            this.selectArchive(archiveName);
          }
        });
      }

      // 删除按钮
      if (deleteBtn) {
        deleteBtn.addEventListener('click', e => {
          e.stopPropagation();
          this.confirmDeleteArchive(archiveName);
        });
      }
    });
  },

  /**
   * 选择存档
   * @param {string} archiveName - 存档名称
   */
  selectArchive(archiveName) {
    SaveSystem.setCurrentArchive(archiveName);
    this.renderSettingsArchiveList();

    // 更新当前存档名称显示
    const currentArchiveNameEl = document.getElementById('current-archive-name');
    if (currentArchiveNameEl) {
      currentArchiveNameEl.textContent = archiveName;
      currentArchiveNameEl.classList.add('has-archive');
    }

    showToast(`已选择存档 "${archiveName}"`);
  },

  /**
   * 确认删除存档（设置页面）
   * @param {string} archiveName - 存档名称
   */
  confirmDeleteArchive(archiveName) {
    // 使用开始页面的删除确认模态框
    if (typeof HomeUI !== 'undefined' && HomeUI.showDeleteConfirmModal) {
      HomeUI._pendingDeleteArchive = archiveName;
      HomeUI._deleteCallback = () => {
        this.renderSettingsArchiveList();
        this.updateSaveStatus();
      };
      HomeUI.showDeleteConfirmModal(archiveName);
    } else if (confirm(`确定要删除存档 "${archiveName}" 吗？此操作不可撤销！`)) {
      // 降级为confirm对话框
      if (SaveSystem.deleteSave(archiveName)) {
        this.renderSettingsArchiveList();
        this.updateSaveStatus();
      }
    }
  },

  /**
   * 显示新建存档输入框
   */
  showNewArchiveInput() {
    const inputGroup = document.getElementById('settings-new-archive-group');
    const input = document.getElementById('settings-new-archive-input');
    if (inputGroup) {
      inputGroup.style.display = 'flex';
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  },

  /**
   * 隐藏新建存档输入框
   */
  hideNewArchiveInput() {
    const inputGroup = document.getElementById('settings-new-archive-group');
    if (inputGroup) {
      inputGroup.style.display = 'none';
    }
  },

  /**
   * HTML转义
   * @param {string} str - 原始字符串
   * @returns {string} - 转义后的字符串
   */
  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 更新端点输入框的占位符提示
   * 根据选择的 API 格式显示对应的官方端点
   */
  updateEndpointPlaceholder() {
    const apiFormat = document.getElementById('api-format');
    const apiEndpoint = document.getElementById('api-endpoint');
    
    if (!apiEndpoint) return;
    
    const format = apiFormat ? apiFormat.value : 'openai';
    
    // 各格式的官方端点提示
    const placeholders = {
      openai: '留空使用官方: api.openai.com/v1/chat/completions',
      anthropic: '留空使用官方: api.anthropic.com/v1/messages',
      gemini: '留空使用官方: generativelanguage.googleapis.com',
      deepseek: '留空使用官方: api.deepseek.com/v1/chat/completions',
    };
    
    apiEndpoint.placeholder = placeholders[format] || placeholders.openai;
  },

  /**
   * 根据 API 格式切换参数面板显示
   */
  updateApiFormatParams() {
    const apiFormat = document.getElementById('api-format');
    const format = apiFormat ? apiFormat.value : 'openai';

    // 隐藏所有参数面板
    const paramsOpenai = document.getElementById('params-openai');
    const paramsAnthropic = document.getElementById('params-anthropic');
    const paramsGemini = document.getElementById('params-gemini');

    if (paramsOpenai) paramsOpenai.style.display = 'none';
    if (paramsAnthropic) paramsAnthropic.style.display = 'none';
    if (paramsGemini) paramsGemini.style.display = 'none';

    // 根据格式显示对应的参数面板
    switch (format) {
      case 'openai':
      case 'deepseek':
        if (paramsOpenai) paramsOpenai.style.display = 'block';
        break;
      case 'anthropic':
        if (paramsAnthropic) paramsAnthropic.style.display = 'block';
        break;
      case 'gemini':
        if (paramsGemini) paramsGemini.style.display = 'block';
        break;
      default:
        if (paramsOpenai) paramsOpenai.style.display = 'block';
    }
  },

  /**
   * 更新世界书状态显示
   */
  updateWorldbookStatus() {
    const statusEl = document.getElementById('worldbook-status');
    if (!statusEl) return;

    const count = (GameState.world && GameState.world.entries && GameState.world.entries.length) || 0;
    statusEl.textContent = count + ' 条目';

    if (count > 0) {
      statusEl.classList.add('configured');
      statusEl.classList.remove('not-configured');
    } else {
      statusEl.classList.remove('configured');
      statusEl.classList.add('not-configured');
    }
  },

  /**
   * 立即保存游戏
   */
  saveNow() {
    try {
      if (typeof SaveSystem !== 'undefined' && SaveSystem.save) {
        const success = SaveSystem.save();
        if (success) {
          this.updateSaveStatus();
        }
      } else {
        showToast('存档系统未初始化');
      }
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败');
    }
  },

  /**
   * 快速保存游戏（设置页面底部按钮）
   */
  quickSave() {
    try {
      if (typeof SaveSystem !== 'undefined' && SaveSystem.save) {
        const success = SaveSystem.save();
        if (success) {
          showToast('💾 游戏已保存');
          this.updateSaveStatus();
        }
      } else {
        showToast('存档系统未初始化');
      }
    } catch (error) {
      console.error('快速保存失败:', error);
      showToast('保存失败');
    }
  },

  /**
   * 删除存档
   */
  deleteSave() {
    if (!confirm('确定要删除存档吗？此操作不可恢复！')) {
      return;
    }

    try {
      if (typeof SaveSystem !== 'undefined' && SaveSystem.deleteSave) {
        SaveSystem.deleteSave();
        this.updateSaveStatus();
      } else {
        showToast('存档系统未初始化');
      }
    } catch (error) {
      console.error('删除存档失败:', error);
      showToast('删除失败');
    }
  },

  // ============================================================
  // API管理中心功能
  // ============================================================

  /**
   * 初始化API配置标签页
   */
  initApiProfileTabs() {
    const tabs = document.querySelectorAll('.api-profile-tab');
    const panels = document.querySelectorAll('.api-profile-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const profile = tab.dataset.profile;
        
        // 更新标签页状态
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 更新面板显示
        panels.forEach(panel => {
          if (panel.id === `api-profile-${profile}`) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  },

  /**
   * 初始化地图API复用开关
   */
  initMapApiToggle() {
    const checkbox = document.getElementById('map-use-main-api');
    const simpleConfig = document.getElementById('map-api-simple-config');
    const fullConfig = document.getElementById('map-api-full-config');
    const toggleMapKeyBtn = document.getElementById('btn-toggle-map-key');

    if (checkbox) {
      // 加载初始状态
      const mapProfile = GameState.settings.apiProfiles && GameState.settings.apiProfiles.map;
      checkbox.checked = mapProfile ? mapProfile.useMainApi !== false : true;
      this.updateMapApiConfigVisibility(checkbox.checked);

      // 绑定切换事件
      checkbox.addEventListener('change', e => {
        const useMainApi = e.target.checked;
        this.updateMapApiConfigVisibility(useMainApi);
        
        // 更新状态
        if (GameState.settings.apiProfiles && GameState.settings.apiProfiles.map) {
          GameState.settings.apiProfiles.map.useMainApi = useMainApi;
        }
      });
    }

    // 地图API密钥显示/隐藏
    if (toggleMapKeyBtn) {
      toggleMapKeyBtn.addEventListener('click', () => {
        this.toggleMapApiKeyVisibility();
      });
    }

    // 地图API Token滑块事件
    const mapMaxTokensSimple = document.getElementById('map-max-tokens-simple');
    const mapTokenValueSimple = document.getElementById('map-token-value-simple');
    if (mapMaxTokensSimple && mapTokenValueSimple) {
      mapMaxTokensSimple.addEventListener('input', e => {
        mapTokenValueSimple.textContent = e.target.value;
      });
    }

    const mapMaxTokens = document.getElementById('map-max-tokens');
    const mapTokenValue = document.getElementById('map-token-value');
    if (mapMaxTokens && mapTokenValue) {
      mapMaxTokens.addEventListener('input', e => {
        mapTokenValue.textContent = e.target.value;
      });
    }

    // 加载地图API设置
    this.loadMapApiSettings();
  },

  /**
   * 更新地图API配置区域可见性
   * @param {boolean} useMainApi - 是否复用主API
   */
  updateMapApiConfigVisibility(useMainApi) {
    const simpleConfig = document.getElementById('map-api-simple-config');
    const fullConfig = document.getElementById('map-api-full-config');

    if (simpleConfig) {
      simpleConfig.style.display = useMainApi ? 'block' : 'none';
    }
    if (fullConfig) {
      fullConfig.style.display = useMainApi ? 'none' : 'block';
    }
  },

  /**
   * 切换地图API密钥可见性
   */
  toggleMapApiKeyVisibility() {
    const apiKeyInput = document.getElementById('map-api-key');
    if (!apiKeyInput) return;

    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
    } else {
      apiKeyInput.type = 'password';
    }
  },

  /**
   * 加载地图API设置到UI
   */
  loadMapApiSettings() {
    const mapProfile = GameState.settings.apiProfiles && GameState.settings.apiProfiles.map;
    if (!mapProfile) return;

    // 复用主API开关
    const useMainApiCheckbox = document.getElementById('map-use-main-api');
    if (useMainApiCheckbox) {
      useMainApiCheckbox.checked = mapProfile.useMainApi !== false;
      this.updateMapApiConfigVisibility(useMainApiCheckbox.checked);
    }

    // 简化配置的Token
    const mapMaxTokensSimple = document.getElementById('map-max-tokens-simple');
    const mapTokenValueSimple = document.getElementById('map-token-value-simple');
    if (mapMaxTokensSimple) {
      mapMaxTokensSimple.value = mapProfile.maxTokens || 2000;
      if (mapTokenValueSimple) mapTokenValueSimple.textContent = mapProfile.maxTokens || 2000;
    }

    // 完整配置
    const mapApiFormat = document.getElementById('map-api-format');
    const mapApiEndpoint = document.getElementById('map-api-endpoint');
    const mapApiKey = document.getElementById('map-api-key');
    const mapModelName = document.getElementById('map-model-name');
    const mapMaxTokens = document.getElementById('map-max-tokens');
    const mapTokenValue = document.getElementById('map-token-value');
    const mapTemperature = document.getElementById('map-temperature');
    const mapTopP = document.getElementById('map-top-p');

    if (mapApiFormat) mapApiFormat.value = mapProfile.apiFormat || 'openai';
    if (mapApiEndpoint) mapApiEndpoint.value = mapProfile.apiEndpoint || '';
    if (mapApiKey) mapApiKey.value = mapProfile.apiKey || '';
    if (mapModelName) mapModelName.value = mapProfile.modelName || 'gpt-4';
    if (mapMaxTokens) {
      mapMaxTokens.value = mapProfile.maxTokens || 2000;
      if (mapTokenValue) mapTokenValue.textContent = mapProfile.maxTokens || 2000;
    }
    if (mapTemperature) mapTemperature.value = mapProfile.temperature || 0.7;
    if (mapTopP) mapTopP.value = mapProfile.topP || 1.0;
  },

  /**
   * 保存地图API设置
   */
  saveMapApiSettings() {
    // 确保apiProfiles存在
    if (!GameState.settings.apiProfiles) {
      GameState.settings.apiProfiles = {};
    }
    if (!GameState.settings.apiProfiles.map) {
      GameState.settings.apiProfiles.map = {
        name: '地图API',
        enabled: true,
        useMainApi: true
      };
    }

    const mapProfile = GameState.settings.apiProfiles.map;
    const useMainApiCheckbox = document.getElementById('map-use-main-api');
    
    mapProfile.useMainApi = useMainApiCheckbox ? useMainApiCheckbox.checked : true;

    if (mapProfile.useMainApi) {
      // 复用主API时只保存maxTokens
      const mapMaxTokensSimple = document.getElementById('map-max-tokens-simple');
      mapProfile.maxTokens = parseInt(mapMaxTokensSimple && mapMaxTokensSimple.value, 10) || 2000;
    } else {
      // 独立配置时保存所有参数
      const mapApiFormat = document.getElementById('map-api-format');
      const mapApiEndpoint = document.getElementById('map-api-endpoint');
      const mapApiKey = document.getElementById('map-api-key');
      const mapModelName = document.getElementById('map-model-name');
      const mapMaxTokens = document.getElementById('map-max-tokens');
      const mapTemperature = document.getElementById('map-temperature');
      const mapTopP = document.getElementById('map-top-p');

      mapProfile.apiFormat = (mapApiFormat && mapApiFormat.value) || 'openai';
      mapProfile.apiEndpoint = (mapApiEndpoint && mapApiEndpoint.value && mapApiEndpoint.value.trim()) || '';
      mapProfile.apiKey = (mapApiKey && mapApiKey.value && mapApiKey.value.trim()) || '';
      mapProfile.modelName = (mapModelName && mapModelName.value && mapModelName.value.trim()) || 'gpt-4';
      mapProfile.maxTokens = parseInt(mapMaxTokens && mapMaxTokens.value, 10) || 2000;
      mapProfile.temperature = parseFloat(mapTemperature && mapTemperature.value) || 0.7;
      mapProfile.topP = parseFloat(mapTopP && mapTopP.value) || 1.0;
    }

    console.log('[地图API设置已保存]', mapProfile);
  },

  /**
   * 初始化API配置导入/导出功能
   */
  initApiImportExport() {
    const exportBtn = document.getElementById('btn-export-api-config');
    const importBtn = document.getElementById('btn-import-api-config');
    const importInput = document.getElementById('api-config-import-input');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportApiConfig();
      });
    }

    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => {
        importInput.click();
      });

      importInput.addEventListener('change', async e => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          await this.importApiConfig(file);
          e.target.value = '';
        }
      });
    }
  },

  /**
   * 导出API配置
   */
  exportApiConfig() {
    try {
      // 收集当前配置
      const config = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        useTavernApi: GameState.settings.useTavernApi || false,
        apiProfiles: GameState.settings.apiProfiles || {},
        // 兼容旧版配置
        legacy: {
          apiFormat: GameState.settings.apiFormat,
          apiEndpoint: GameState.settings.apiEndpoint,
          modelName: GameState.settings.modelName,
          temperature: GameState.settings.temperature,
          maxTokens: GameState.settings.maxTokens,
          topP: GameState.settings.topP,
          frequencyPenalty: GameState.settings.frequencyPenalty,
          presencePenalty: GameState.settings.presencePenalty
        }
      };

      // 移除敏感信息（API密钥）的选项
      const includeKeys = confirm('是否包含API密钥？\n\n点击"确定"包含密钥（不建议分享给他人）\n点击"取消"不包含密钥（更安全）');
      
      if (!includeKeys) {
        // 移除密钥
        if (config.apiProfiles.main) {
          config.apiProfiles.main.apiKey = '';
        }
        if (config.apiProfiles.map) {
          config.apiProfiles.map.apiKey = '';
        }
        config.legacy.apiKey = '';
      } else {
        config.legacy.apiKey = GameState.settings.apiKey;
      }

      // 创建下载
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-config-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('📤 API配置已导出');
    } catch (error) {
      console.error('导出API配置失败:', error);
      showToast('导出失败');
    }
  },

  /**
   * 导入API配置
   * @param {File} file - 配置文件
   */
  async importApiConfig(file) {
    try {
      const text = await file.text();
      const config = JSON.parse(text);

      // 验证配置格式
      if (!config.version && !config.apiProfiles && !config.legacy) {
        showToast('无效的配置文件格式');
        return;
      }

      // 导入apiProfiles
      if (config.apiProfiles) {
        GameState.settings.apiProfiles = config.apiProfiles;
      }

      // 导入旧版配置
      if (config.legacy) {
        if (config.legacy.apiFormat) GameState.settings.apiFormat = config.legacy.apiFormat;
        if (config.legacy.apiEndpoint) GameState.settings.apiEndpoint = config.legacy.apiEndpoint;
        if (config.legacy.apiKey) GameState.settings.apiKey = config.legacy.apiKey;
        if (config.legacy.modelName) GameState.settings.modelName = config.legacy.modelName;
        if (config.legacy.temperature !== undefined) GameState.settings.temperature = config.legacy.temperature;
        if (config.legacy.maxTokens !== undefined) GameState.settings.maxTokens = config.legacy.maxTokens;
        if (config.legacy.topP !== undefined) GameState.settings.topP = config.legacy.topP;
        if (config.legacy.frequencyPenalty !== undefined) GameState.settings.frequencyPenalty = config.legacy.frequencyPenalty;
        if (config.legacy.presencePenalty !== undefined) GameState.settings.presencePenalty = config.legacy.presencePenalty;
      }

      // 导入酒馆API设置
      if (config.useTavernApi !== undefined) {
        GameState.settings.useTavernApi = config.useTavernApi;
      }

      // 重新加载UI
      this.loadSettings();
      this.loadMapApiSettings();

      // 保存到存储
      if (typeof SaveSystem !== 'undefined') {
        SaveSystem.saveSettings(true);
      }

      showToast('📥 API配置已导入');
    } catch (error) {
      console.error('导入API配置失败:', error);
      showToast('导入失败：文件格式不正确');
    }
  },

  /**
   * 重写保存AI设置方法，包含地图API
   */
  saveAllApiSettings() {
    // 保存主API设置
    this.autoSaveApiSettings();
    
    // 保存地图API设置
    this.saveMapApiSettings();
    
    // 同步到apiProfiles.main
    if (!GameState.settings.apiProfiles) {
      GameState.settings.apiProfiles = {};
    }
    if (!GameState.settings.apiProfiles.main) {
      GameState.settings.apiProfiles.main = { name: '主API（叙事/对话）', enabled: true };
    }
    
    const mainProfile = GameState.settings.apiProfiles.main;
    mainProfile.apiFormat = GameState.settings.apiFormat;
    mainProfile.apiEndpoint = GameState.settings.apiEndpoint;
    mainProfile.apiKey = GameState.settings.apiKey;
    mainProfile.modelName = GameState.settings.modelName;
    mainProfile.maxTokens = GameState.settings.maxTokens;
    mainProfile.temperature = GameState.settings.temperature;
    mainProfile.topP = GameState.settings.topPOpenai || 1.0;
    mainProfile.frequencyPenalty = GameState.settings.frequencyPenalty;
    mainProfile.presencePenalty = GameState.settings.presencePenalty;

    // 保存到存储
    if (typeof SaveSystem !== 'undefined') {
      SaveSystem.saveSettings(false);
    }

    showToast('🔌 API设置已保存');
  },
};

// 导出
window.SettingsUI = SettingsUI;
