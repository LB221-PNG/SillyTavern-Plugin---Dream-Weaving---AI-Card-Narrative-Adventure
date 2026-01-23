/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 总结功能模块
 * ============================================================ */

/**
 * 默认总结提示词
 */
const DEFAULT_SUMMARY_PROMPTS = {
  small: `请根据当前剧情内容生成一条简洁的小总结，要求：
1. 概括本段剧情的核心事件
2. 记录重要的角色互动和关系变化
3. 标注任何关键道具、地点或线索
4. 控制在100字以内`,
  big: `请根据多条小总结内容，生成一份完整的阶段性大总结，要求：
1. 梳理整体剧情脉络和发展方向
2. 总结角色成长和关系变化
3. 归纳重要的世界观信息和设定
4. 标注未解决的悬念和伏笔
5. 控制在500字以内`,
};

/**
 * 总结功能模块
 */
const SummaryUI = {
  // 当前编辑的总结索引
  currentEditIndex: -1,
  // 当前编辑的总结类型
  currentEditType: 'big',

  /**
   * 初始化总结功能
   */
  init() {
    this.bindEvents();
    this.loadSummaryConfig();
    this.updateSummaryStatus();
    console.log('总结功能初始化完成');
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 查看大总结按钮
    const viewBigSummariesBtn = document.getElementById('btn-view-big-summaries');
    if (viewBigSummariesBtn) {
      viewBigSummariesBtn.addEventListener('click', () => {
        this.openBigSummaryViewer();
      });
    }

    // 查看小总结按钮
    const viewSmallSummariesBtn = document.getElementById('btn-view-small-summaries');
    if (viewSmallSummariesBtn) {
      viewSmallSummariesBtn.addEventListener('click', () => {
        this.openSmallSummaryViewer();
      });
    }

    // 编辑总结提示词按钮
    const editPromptsBtn = document.getElementById('btn-edit-summary-prompts');
    if (editPromptsBtn) {
      editPromptsBtn.addEventListener('click', () => {
        this.openSummaryPromptsEditor();
      });
    }

    const exportSummariesBtn = document.getElementById('btn-export-summaries');
    if (exportSummariesBtn) {
      exportSummariesBtn.addEventListener('click', () => {
        this.exportSummaries();
      });
    }

    const clearSummariesBtn = document.getElementById('btn-clear-summaries');
    if (clearSummariesBtn) {
      clearSummariesBtn.addEventListener('click', () => {
        this.clearSummaries();
      });
    }

    // 总结配置变更事件
    const autoGenToggle = document.getElementById('summary-auto-gen-toggle');
    if (autoGenToggle) {
      autoGenToggle.addEventListener('change', () => {
        this.saveSummaryConfig();
      });
    }

    const maxSmallInput = document.getElementById('summary-max-small');
    if (maxSmallInput) {
      maxSmallInput.addEventListener('change', () => {
        this.saveSummaryConfig();
      });
    }

    const mergeThresholdInput = document.getElementById('summary-merge-threshold');
    if (mergeThresholdInput) {
      mergeThresholdInput.addEventListener('change', () => {
        this.saveSummaryConfig();
      });
    }

    // 模态框事件
    this.bindModalEvents();
  },

  /**
   * 绑定模态框事件
   */
  bindModalEvents() {
    // 大总结查看器关闭按钮
    const bigSummaryOverlay = document.getElementById('big-summary-overlay');
    if (bigSummaryOverlay) {
      const closeBtn = bigSummaryOverlay.querySelector('.modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          bigSummaryOverlay.classList.remove('visible');
        });
      }
      bigSummaryOverlay.addEventListener('click', e => {
        if (e.target === bigSummaryOverlay) {
          bigSummaryOverlay.classList.remove('visible');
        }
      });
    }

    // 小总结查看器关闭按钮
    const smallSummaryOverlay = document.getElementById('small-summary-overlay');
    if (smallSummaryOverlay) {
      const closeBtn = smallSummaryOverlay.querySelector('.modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          smallSummaryOverlay.classList.remove('visible');
        });
      }
      smallSummaryOverlay.addEventListener('click', e => {
        if (e.target === smallSummaryOverlay) {
          smallSummaryOverlay.classList.remove('visible');
        }
      });
    }

    // 总结编辑器关闭和保存按钮
    const summaryEditorOverlay = document.getElementById('summary-editor-overlay');
    if (summaryEditorOverlay) {
      const closeBtn = summaryEditorOverlay.querySelector('.modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          summaryEditorOverlay.classList.remove('visible');
        });
      }
      summaryEditorOverlay.addEventListener('click', e => {
        if (e.target === summaryEditorOverlay) {
          summaryEditorOverlay.classList.remove('visible');
        }
      });
    }

    const saveSummaryEditorBtn = document.getElementById('save-summary-editor-btn');
    if (saveSummaryEditorBtn) {
      saveSummaryEditorBtn.addEventListener('click', () => {
        this.saveSummaryEditor();
      });
    }

    // 总结提示词编辑器
    const summaryPromptsOverlay = document.getElementById('summary-prompts-overlay');
    if (summaryPromptsOverlay) {
      const closeBtn = summaryPromptsOverlay.querySelector('.modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          summaryPromptsOverlay.classList.remove('visible');
        });
      }
      summaryPromptsOverlay.addEventListener('click', e => {
        if (e.target === summaryPromptsOverlay) {
          summaryPromptsOverlay.classList.remove('visible');
        }
      });

      // 提示词Tab切换
      const tabs = summaryPromptsOverlay.querySelectorAll('.prompt-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetTab = tab.dataset.tab;
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          summaryPromptsOverlay.querySelectorAll('.prompt-content').forEach(content => {
            content.classList.remove('active');
          });
          document.getElementById(targetTab + '-content')?.classList.add('active');
        });
      });
    }

    // 保存提示词按钮
    const savePromptsBtn = document.getElementById('save-summary-prompts-btn');
    if (savePromptsBtn) {
      savePromptsBtn.addEventListener('click', () => {
        this.saveSummaryPrompts();
      });
    }

    // 恢复默认提示词按钮
    const resetPromptsBtn = document.getElementById('reset-summary-prompts-btn');
    if (resetPromptsBtn) {
      resetPromptsBtn.addEventListener('click', () => {
        this.resetSummaryPrompts();
      });
    }
  },

  /**
   * 打开大总结查看器
   */
  openBigSummaryViewer() {
    const overlay = document.getElementById('big-summary-overlay');
    const listView = document.getElementById('big-summary-list-view');
    const detailView = document.getElementById('big-summary-detail-view');

    if (!overlay || !listView) return;

    // 加载大总结列表
    this.loadBigSummaryList();

    // 显示模态框
    overlay.classList.add('visible');
    listView.classList.remove('hidden');
    if (detailView) {
      detailView.classList.add('hidden');
    }
  },

  /**
   * 打开小总结查看器
   */
  openSmallSummaryViewer() {
    const overlay = document.getElementById('small-summary-overlay');
    const listView = document.getElementById('small-summary-list-view');
    const detailView = document.getElementById('small-summary-detail-view');

    if (!overlay || !listView) return;

    // 加载小总结列表
    this.loadSmallSummaryList();

    // 显示模态框
    overlay.classList.add('visible');
    listView.classList.remove('hidden');
    if (detailView) {
      detailView.classList.add('hidden');
    }
  },

  /**
   * 加载大总结列表
   */
  loadBigSummaryList() {
    const listView = document.getElementById('big-summary-list-view');
    if (!listView) return;

    // 确保总结数据存在
    if (!GameState.summaries) {
      GameState.summaries = [];
    }

    const summaries = GameState.summaries || [];
    let html = '';

    if (summaries.length > 0) {
      html += '<div class="summary-logs-container">';

      summaries.forEach((summary, index) => {
        const timestamp = new Date(summary.timestamp).toLocaleString('zh-CN');
        const isImportant = summary.important || summary.context?.important;
        html += `
          <div class="summary-list-item" data-type="big" data-index="${index}">
            <div class="summary-header">
              <span>大总结 #${index + 1}${isImportant ? '<span class="summary-important-badge">⭐ 重要</span>' : ''}</span>
              <span class="summary-time">${timestamp}</span>
            </div>
            <div class="summary-previews">
              ${this.escapeHtml(summary.content.substring(0, 150))}${summary.content.length > 150 ? '...' : ''}
            </div>
            <div class="item-actions">
              <button class="btn-icon view-summary-btn" data-type="big" data-index="${index}" title="查看详情">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="btn-icon edit-summary-btn" data-type="big" data-index="${index}" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
      });

      html += '</div>';
    } else {
      html = `
        <div class="empty-summaries">
          <div class="empty-icon">📖</div>
          <p>暂无大总结记录</p>
          <p class="hint">当小总结积累到一定数量后会自动合并为大总结</p>
        </div>
      `;
    }

    listView.innerHTML = html;
    this.bindSummaryListEvents(listView, 'big');
  },

  /**
   * 加载小总结列表
   */
  loadSmallSummaryList() {
    const listView = document.getElementById('small-summary-list-view');
    if (!listView) return;

    // 确保总结数据存在
    if (!GameState.smallSummaries) {
      GameState.smallSummaries = [];
    }

    const smallSummaries = GameState.smallSummaries || [];
    let html = '';

    if (smallSummaries.length > 0) {
      html += '<div class="summary-logs-container">';

      smallSummaries.forEach((summary, index) => {
        const timestamp = new Date(summary.timestamp).toLocaleString('zh-CN');
        const isImportant = summary.important || summary.context?.important;
        html += `
          <div class="summary-list-item" data-type="small" data-index="${index}">
            <div class="summary-header">
              <span>小总结 #${index + 1}${isImportant ? '<span class="summary-important-badge">⭐ 重要</span>' : ''}</span>
              <span class="summary-time">${timestamp}</span>
            </div>
            <div class="summary-previews">
              ${this.escapeHtml(summary.content.substring(0, 100))}${summary.content.length > 100 ? '...' : ''}
            </div>
            <div class="item-actions">
              <button class="btn-icon view-summary-btn" data-type="small" data-index="${index}" title="查看详情">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="btn-icon edit-summary-btn" data-type="small" data-index="${index}" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
      });

      html += '</div>';
    } else {
      html = `
        <div class="empty-summaries">
          <div class="empty-icon">📝</div>
          <p>暂无小总结记录</p>
          <p class="hint">剧情发展过程中会自动生成小总结</p>
        </div>
      `;
    }

    listView.innerHTML = html;
    this.bindSummaryListEvents(listView, 'small');
  },

  /**
   * 绑定总结列表事件
   */
  bindSummaryListEvents(listView, type) {
    listView.querySelectorAll('.view-summary-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.viewSummaryDetail(type, index);
      });
    });

    listView.querySelectorAll('.edit-summary-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.editSummary(type, index);
      });
    });

    // 点击整个列表项也可以查看详情
    listView.querySelectorAll('.summary-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.viewSummaryDetail(type, index);
      });
    });
  },

  /**
   * 查看总结详情
   * @param {string} type - 总结类型 ('big' 或 'small')
   * @param {number} index - 总结索引
   */
  viewSummaryDetail(type, index) {
    const overlayId = type === 'big' ? 'big-summary-overlay' : 'small-summary-overlay';
    const listViewId = type === 'big' ? 'big-summary-list-view' : 'small-summary-list-view';
    const detailViewId = type === 'big' ? 'big-summary-detail-view' : 'small-summary-detail-view';

    const listView = document.getElementById(listViewId);
    const detailView = document.getElementById(detailViewId);

    if (!listView || !detailView) return;

    let summary;
    if (type === 'big') {
      summary = GameState.summaries?.[index];
    } else {
      summary = GameState.smallSummaries?.[index];
    }

    if (!summary) return;

    const timestamp = new Date(summary.timestamp).toLocaleString('zh-CN');
    const typeLabel = type === 'big' ? '大总结' : '小总结';
    const isImportant = summary.important || summary.context?.important;

    const html = `
      <div class="summary-detail-view">
        <div class="summary-header">
          <h4>${typeLabel} #${index + 1}${isImportant ? '<span class="summary-important-badge">⭐ 重要</span>' : ''}</h4>
          <div class="summary-time">${timestamp}</div>
        </div>
        <div id="summary-detail-content" class="log-entry summary">
          ${this.formatSummaryContent(summary.content)}
        </div>
        <div class="summary-detail-actions">
          <button id="back-to-summary-list" class="btn btn-secondary">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            返回列表
          </button>
          <button id="edit-this-summary" class="btn btn-secondary" data-type="${type}" data-index="${index}">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            编辑此总结
          </button>
        </div>
      </div>
    `;

    detailView.innerHTML = html;
    listView.classList.add('hidden');
    detailView.classList.remove('hidden');

    // 绑定返回按钮事件
    const backBtn = detailView.querySelector('#back-to-summary-list');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        detailView.classList.add('hidden');
        listView.classList.remove('hidden');
      });
    }

    // 绑定编辑按钮事件
    const editBtn = detailView.querySelector('#edit-this-summary');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.editSummary(type, index);
      });
    }
  },

  /**
   * 编辑总结
   * @param {string} type - 总结类型
   * @param {number} index - 总结索引
   */
  editSummary(type, index) {
    let summary;
    if (type === 'big') {
      summary = GameState.summaries?.[index];
    } else {
      summary = GameState.smallSummaries?.[index];
    }

    if (!summary) return;

    this.openSummaryEditor(summary.content, type, index);
  },

  /**
   * 打开总结编辑器
   * @param {string} content - 总结内容
   * @param {string} type - 总结类型
   * @param {number} index - 总结索引
   */
  openSummaryEditor(content = '', type = 'big', index = -1) {
    const overlay = document.getElementById('summary-editor-overlay');
    const textarea = document.getElementById('summary-editor-textarea');
    const title = document.getElementById('summary-editor-title');

    if (!overlay || !textarea) return;

    const typeLabel = type === 'big' ? '大总结' : '小总结';
    title.textContent = index >= 0 ? `编辑${typeLabel} #${index + 1}` : '创建新总结';
    textarea.value = content;

    // 存储编辑信息
    textarea.dataset.editType = type;
    textarea.dataset.editIndex = index;
    this.currentEditIndex = index;
    this.currentEditType = type;

    overlay.classList.add('visible');
    textarea.focus();
  },

  /**
   * 保存总结编辑器
   */
  saveSummaryEditor() {
    const textarea = document.getElementById('summary-editor-textarea');
    if (!textarea) return;

    const content = textarea.value.trim();
    const type = textarea.dataset.editType || 'big';
    const index = parseInt(textarea.dataset.editIndex);

    if (!content) {
      showToast('总结内容不能为空');
      return;
    }

    // 确保数组存在
    if (!GameState.summaries) {
      GameState.summaries = [];
    }
    if (!GameState.smallSummaries) {
      GameState.smallSummaries = [];
    }

    if (type === 'big') {
      if (index >= 0 && GameState.summaries[index]) {
        // 更新现有总结
        GameState.summaries[index] = {
          ...GameState.summaries[index],
          content: content,
          timestamp: new Date().toISOString(),
          edited: true,
        };
      }
    } else if (index >= 0 && GameState.smallSummaries[index]) {
      // 更新现有总结
      GameState.smallSummaries[index] = {
        ...GameState.smallSummaries[index],
        content: content,
        timestamp: new Date().toISOString(),
        edited: true,
      };
    }

    // 保存游戏状态
    if (typeof SaveSystem !== 'undefined' && SaveSystem.save) {
      SaveSystem.save();
    }

    // 关闭编辑器
    document.getElementById('summary-editor-overlay').classList.remove('visible');

    // 刷新对应的总结列表
    if (type === 'big') {
      if (document.getElementById('big-summary-overlay').classList.contains('visible')) {
        this.loadBigSummaryList();
        const detailView = document.getElementById('big-summary-detail-view');
        const listView = document.getElementById('big-summary-list-view');
        if (detailView && listView) {
          detailView.classList.add('hidden');
          listView.classList.remove('hidden');
        }
      }
    } else if (document.getElementById('small-summary-overlay').classList.contains('visible')) {
      this.loadSmallSummaryList();
      const detailView = document.getElementById('small-summary-detail-view');
      const listView = document.getElementById('small-summary-list-view');
      if (detailView && listView) {
        detailView.classList.add('hidden');
        listView.classList.remove('hidden');
      }
    }

    // 更新状态显示
    this.updateSummaryStatus();

    showToast('总结已更新');
  },

  /**
   * 打开总结提示词编辑器
   */
  openSummaryPromptsEditor() {
    const overlay = document.getElementById('summary-prompts-overlay');
    if (!overlay) return;

    // 加载当前提示词
    const prompts = this.getSummaryPrompts();

    const smallPromptTextarea = document.getElementById('small-summary-prompt');
    const bigPromptTextarea = document.getElementById('big-summary-prompt');

    if (smallPromptTextarea) {
      smallPromptTextarea.value = prompts.small;
    }
    if (bigPromptTextarea) {
      bigPromptTextarea.value = prompts.big;
    }

    // 重置Tab状态
    const tabs = overlay.querySelectorAll('.prompt-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tabs[0]?.classList.add('active');

    overlay.querySelectorAll('.prompt-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById('small-prompt-content')?.classList.add('active');

    overlay.classList.add('visible');
  },

  /**
   * 保存总结提示词
   */
  saveSummaryPrompts() {
    const smallPrompt = document.getElementById('small-summary-prompt')?.value?.trim() || '';
    const bigPrompt = document.getElementById('big-summary-prompt')?.value?.trim() || '';

    if (!GameState.summaryConfig) {
      GameState.summaryConfig = this.getSummaryConfig();
    }

    GameState.summaryConfig.prompts = {
      small: smallPrompt || DEFAULT_SUMMARY_PROMPTS.small,
      big: bigPrompt || DEFAULT_SUMMARY_PROMPTS.big,
    };

    // 保存状态
    if (typeof SaveSystem !== 'undefined' && SaveSystem.save) {
      SaveSystem.save();
    }

    // 关闭编辑器
    document.getElementById('summary-prompts-overlay').classList.remove('visible');

    showToast('总结提示词已保存');
  },

  /**
   * 重置总结提示词为默认值
   */
  resetSummaryPrompts() {
    if (!confirm('确定要恢复默认提示词吗？当前的自定义提示词将被覆盖。')) {
      return;
    }

    const smallPromptTextarea = document.getElementById('small-summary-prompt');
    const bigPromptTextarea = document.getElementById('big-summary-prompt');

    if (smallPromptTextarea) {
      smallPromptTextarea.value = DEFAULT_SUMMARY_PROMPTS.small;
    }
    if (bigPromptTextarea) {
      bigPromptTextarea.value = DEFAULT_SUMMARY_PROMPTS.big;
    }

    showToast('已恢复默认提示词');
  },

  /**
   * 获取总结提示词
   */
  getSummaryPrompts() {
    const config = GameState.summaryConfig || {};
    return {
      small: config.prompts?.small || DEFAULT_SUMMARY_PROMPTS.small,
      big: config.prompts?.big || DEFAULT_SUMMARY_PROMPTS.big,
    };
  },

  /**
   * 添加小总结
   * @param {string} content - 总结内容
   * @param {Object} context - 上下文信息
   * @returns {Object} - 小总结对象
   */
  addSmallSummary(content, context = {}) {
    // 确保数组存在
    if (!GameState.smallSummaries) {
      GameState.smallSummaries = [];
    }

    const smallSummary = {
      content: content,
      timestamp: new Date().toISOString(),
      context: context,
      type: 'small',
      important: context.important || false,
    };

    GameState.smallSummaries.push(smallSummary);

    // 获取配置
    const config = this.getSummaryConfig();

    // 如果小总结超过阈值，合并成大总结
    if (GameState.smallSummaries.length >= config.mergeThreshold) {
      this.createBigSummaryFromSmallSummaries();
    }

    // 保存状态
    if (typeof SaveSystem !== 'undefined' && SaveSystem.save) {
      SaveSystem.save();
    }

    return smallSummary;
  },

  /**
   * 从小总结创建大总结
   */
  createBigSummaryFromSmallSummaries() {
    if (!GameState.smallSummaries || GameState.smallSummaries.length === 0) return;

    let bigSummaryContent = '## 阶段性总结\n\n';

    GameState.smallSummaries.forEach((summary, index) => {
      bigSummaryContent += `${index + 1}. ${summary.content}\n`;

      if (summary.important || (summary.context && summary.context.important)) {
        bigSummaryContent += '   *（重要事件）*\n';
      }
    });

    bigSummaryContent += `\n总结时间: ${new Date().toLocaleString('zh-CN')}`;

    // 确保大总结数组存在
    if (!GameState.summaries) {
      GameState.summaries = [];
    }

    // 添加到总结列表
    GameState.summaries.push({
      content: bigSummaryContent,
      timestamp: new Date().toISOString(),
      type: 'big',
      source: 'auto-merge',
      mergedCount: GameState.smallSummaries.length,
    });

    // 清空小总结
    GameState.smallSummaries = [];

    // 保存状态
    if (typeof SaveSystem !== 'undefined' && SaveSystem.save) {
      SaveSystem.save();
    }
    // 显示通知
    showToast('已自动生成阶段性大总结');

    // 更新状态显示
    this.updateSummaryStatus();
  },

  /**
   * 格式化总结内容为HTML
   * @param {string} content - 原始内容
   * @returns {string} - HTML格式内容
   */
  formatSummaryContent(content) {
    if (!content) return '';

    // 转义HTML
    content = this.escapeHtml(content);

    // 将Markdown风格的标题转换为HTML
    content = content.replace(/^## (.*$)/gm, '<h4>$1</h4>');
    content = content.replace(/^### (.*$)/gm, '<h5>$1</h5>');

    // 处理粗体
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 处理斜体
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 处理列表
    content = content.replace(/^\* (.*$)/gm, '<li>$1</li>');
    content = content.replace(/^- (.*$)/gm, '<li>$1</li>');
    content = content.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

    // 处理换行
    content = content.replace(/\n/g, '<br>');

    // 包裹列表项
    content = content.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    // 清理连续的ul标签
    content = content.replace(/<\/ul><br><ul>/g, '');

    return content;
  },

  /**
   * 导出总结
   */
  exportSummaries() {
    const summaries = GameState.summaries || [];
    const smallSummaries = GameState.smallSummaries || [];

    if (summaries.length === 0 && smallSummaries.length === 0) {
      showToast('没有可导出的总结');
      return;
    }

    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      summaries: summaries,
      smallSummaries: smallSummaries,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summaries_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('总结已导出');
  },

  /**
   * 清空总结
   */
  clearSummaries() {
    if (!confirm('确定要清空所有总结吗？此操作不可恢复！')) {
      return;
    }

    GameState.summaries = [];
    GameState.smallSummaries = [];

    // 保存状态
    if (typeof SaveSystem !== 'undefined' && SaveSystem.save) {
      SaveSystem.save();
    }

    // 更新状态显示
    this.updateSummaryStatus();

    // 如果总结查看器打开，刷新列表
    if (document.getElementById('big-summary-overlay')?.classList.contains('visible')) {
      this.loadBigSummaryList();
    }
    if (document.getElementById('small-summary-overlay')?.classList.contains('visible')) {
      this.loadSmallSummaryList();
    }

    showToast('所有总结已清空');
  },

  /**
   * 获取总结配置
   * @returns {Object} - 配置对象
   */
  getSummaryConfig() {
    return (
      GameState.summaryConfig || {
        autoGenerate: true,
        maxSmallSummaries: 10,
        mergeThreshold: 10,
        prompts: DEFAULT_SUMMARY_PROMPTS,
      }
    );
  },

  /**
   * 加载总结配置到UI
   */
  loadSummaryConfig() {
    const config = this.getSummaryConfig();

    const autoGenToggle = document.getElementById('summary-auto-gen-toggle');
    if (autoGenToggle) {
      autoGenToggle.checked = config.autoGenerate;
    }

    const maxSmallInput = document.getElementById('summary-max-small');
    if (maxSmallInput) {
      maxSmallInput.value = config.maxSmallSummaries;
    }

    const mergeThresholdInput = document.getElementById('summary-merge-threshold');
    if (mergeThresholdInput) {
      mergeThresholdInput.value = config.mergeThreshold;
    }
  },

  /**
   * 保存总结配置
   */
  saveSummaryConfig() {
    const currentConfig = this.getSummaryConfig();
    const config = {
      autoGenerate: document.getElementById('summary-auto-gen-toggle')?.checked ?? true,
      maxSmallSummaries: parseInt(document.getElementById('summary-max-small')?.value) || 10,
      mergeThreshold: parseInt(document.getElementById('summary-merge-threshold')?.value) || 10,
      prompts: currentConfig.prompts || DEFAULT_SUMMARY_PROMPTS,
    };

    GameState.summaryConfig = config;

    // 保存状态
    if (typeof SaveSystem !== 'undefined' && SaveSystem.save) {
      SaveSystem.save();
    }

    showToast('总结配置已保存');
  },

  /**
   * 更新总结状态显示
   */
  updateSummaryStatus() {
    const summaries = GameState.summaries || [];
    const smallSummaries = GameState.smallSummaries || [];
    const totalCount = summaries.length + smallSummaries.length;

    // 更新设置页面的状态显示
    const statusEl = document.getElementById('summary-status');
    if (statusEl) {
      statusEl.textContent = `${totalCount} 条记录`;
      if (totalCount > 0) {
        statusEl.classList.add('configured');
        statusEl.classList.remove('not-configured');
      } else {
        statusEl.classList.remove('configured');
        statusEl.classList.add('not-configured');
      }
    }

    // 更新统计数字
    const bigCountEl = document.getElementById('big-summary-count');
    if (bigCountEl) {
      bigCountEl.textContent = summaries.length;
    }

    const smallCountEl = document.getElementById('small-summary-count');
    if (smallCountEl) {
      smallCountEl.textContent = smallSummaries.length;
    }
  },

  /**
   * 转义HTML字符
   * @param {string} text - 原始文本
   * @returns {string} - 转义后的文本
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
};

// 导出
window.SummaryUI = SummaryUI;

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
  // 延迟初始化，确保其他模块已加载
  setTimeout(() => {
    SummaryUI.init();
  }, 100);
});
