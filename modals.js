/**
 * modals.js - 模态框动态创建模块
 * 将所有模态框的 HTML 从 index.html 移到此处，按需动态创建
 */

const ModalsManager = {
  initialized: false,
  
  /**
   * 初始化所有模态框
   */
  init() {
    if (this.initialized) return;
    
    // 创建模态框容器
    const container = document.createElement('div');
    container.id = 'modals-container';
    document.body.appendChild(container);
    
    // 创建所有模态框
    this.createBranchingOptionsModal(container);
    this.createMessageEditorModal(container);
    this.createMessageContextMenu(container);
    this.createSaveSlotsModal(container);
    this.createLoadArchiveModal(container);
    this.createDeleteConfirmModal(container);
    this.createDeckModal(container);
    this.createBigSummaryModal(container);
    this.createSmallSummaryModal(container);
    this.createSummaryEditorModal(container);
    this.createSummaryPromptsModal(container);
    this.createToast(container);
    
    this.initialized = true;
    console.log('[ModalsManager] 所有模态框已初始化');
  },
  
  /**
   * 分支选择模态框
   */
  createBranchingOptionsModal(container) {
    const html = `
      <div id="branching-options-overlay" class="overlay">
        <div class="branching-options-modal modal">
          <h4>请选择你的行动</h4>
          <div class="modal-content"></div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * 消息编辑模态框
   */
  createMessageEditorModal(container) {
    const html = `
      <div id="message-editor-overlay" class="overlay">
        <div id="message-editor-modal" class="modal glass-panel">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn">&times;</button>
          <h4>修改消息</h4>
          <textarea id="message-editor-textarea" class="input-field" style="min-height: 200px"></textarea>
          <button id="save-message-edit-btn" class="btn btn-primary">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            保存修改
          </button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * 消息上下文菜单
   */
  createMessageContextMenu(container) {
    const html = `
      <div id="message-context-menu" style="display: none">
        <button id="ctx-copy-btn">📋 复制消息</button>
        <button id="ctx-edit-btn">✏️ 编辑消息</button>
        <button id="ctx-regenerate-btn">🔄 重新生成</button>
        <button id="ctx-delete-btn">🗑️ 删除消息</button>
        <button id="ctx-summarize-btn">📝 总结此段</button>
        <button id="ctx-reapply-btn">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 6px">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          重新应用处理
        </button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * 存档槽位选择模态框（旧版兼容）
   */
  createSaveSlotsModal(container) {
    const html = `
      <div id="save-slots-overlay" class="overlay">
        <div id="save-slots-modal" class="modal glass-panel">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn">&times;</button>
          <h4>📁 选择存档槽位</h4>
          <p class="modal-hint" id="save-slots-hint">选择一个槽位来加载或保存游戏</p>
          <div class="save-slots-grid" id="save-slots-grid">
            <!-- 槽位由JS动态生成 -->
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="btn-close-slots">关闭</button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * 加载存档模态框（V2版本 - 命名存档系统）
   */
  createLoadArchiveModal(container) {
    const html = `
      <div id="load-archive-overlay" class="overlay">
        <div id="load-archive-modal" class="modal glass-panel archive-modal">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn">&times;</button>
          <h4>📁 存档管理</h4>
          <p class="modal-hint">选择存档加载，或创建新存档开始冒险</p>

          <!-- 存档列表 -->
          <div class="archive-list-container" id="archive-list-container">
            <!-- 存档列表由JS动态生成 -->
          </div>

          <!-- 新建存档输入 -->
          <div class="new-archive-input-group" id="new-archive-input-group" style="display: none">
            <input type="text" id="new-archive-name-input" class="input-field" placeholder="输入新存档名称..." maxlength="30" />
            <button class="btn btn-primary btn-small" id="btn-confirm-new-archive">确认</button>
            <button class="btn btn-ghost btn-small" id="btn-cancel-new-archive">取消</button>
          </div>

          <!-- 操作按钮 -->
          <div class="archive-modal-actions">
            <button class="btn btn-primary btn-small" id="btn-create-new-archive">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              新建存档
            </button>
            <button class="btn btn-secondary btn-small" id="btn-import-archive">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              导入存档
            </button>
            <input type="file" id="import-archive-input" accept=".json" style="display: none" />
            <button class="btn btn-secondary btn-small" id="btn-close-load-archive">关闭</button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * 删除确认模态框
   */
  createDeleteConfirmModal(container) {
    const html = `
      <div id="delete-confirm-overlay" class="overlay">
        <div id="delete-confirm-modal" class="modal glass-panel delete-confirm-modal">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn">&times;</button>

          <div class="delete-confirm-content">
            <div class="delete-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <h4>确认删除存档</h4>
            <p class="delete-warning">您确定要删除存档 "<span id="delete-archive-name"></span>" 吗？</p>
            <p class="delete-hint">⚠️ 此操作不可撤销，存档数据将永久丢失</p>
          </div>

          <div class="delete-confirm-actions">
            <button class="btn btn-secondary" id="btn-cancel-delete">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              取消
            </button>
            <button class="btn btn-danger" id="btn-confirm-delete">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              确认删除
            </button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * 卡组模态框
   */
  createDeckModal(container) {
    const html = `
      <div class="modal-overlay" id="modal-deck">
        <div class="glass-panel modal">
          <h2 class="page-title">卡组一览</h2>
          <div class="deck-tabs" id="deck-tabs">
            <button class="deck-tab active" data-filter="all">全部</button>
            <button class="deck-tab" data-filter="attack">攻击</button>
            <button class="deck-tab" data-filter="skill">技能</button>
            <button class="deck-tab" data-filter="power">能力</button>
          </div>
          <div class="deck-cards" id="modal-deck-cards"></div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="btn-close-deck">关闭</button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * 大总结查看器
   */
  createBigSummaryModal(container) {
    const html = `
      <div id="big-summary-overlay" class="overlay">
        <div id="big-summary-modal" class="modal glass-panel summary-modal">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn">&times;</button>
          <h4>📖 剧情大总结</h4>
          <div class="modal-content">
            <div id="big-summary-list-view"></div>
            <div id="big-summary-detail-view" class="hidden"></div>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * 小总结查看器
   */
  createSmallSummaryModal(container) {
    const html = `
      <div id="small-summary-overlay" class="overlay">
        <div id="small-summary-modal" class="modal glass-panel summary-modal">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn">&times;</button>
          <h4>📝 剧情小总结</h4>
          <div class="modal-content">
            <div id="small-summary-list-view"></div>
            <div id="small-summary-detail-view" class="hidden"></div>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * 总结编辑器
   */
  createSummaryEditorModal(container) {
    const html = `
      <div id="summary-editor-overlay" class="overlay">
        <div id="summary-editor-modal" class="modal glass-panel summary-modal">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn">&times;</button>
          <h4 id="summary-editor-title">编辑总结</h4>
          <textarea id="summary-editor-textarea" class="input-field summary-textarea" placeholder="输入总结内容..."></textarea>
          <button id="save-summary-editor-btn" class="btn btn-primary summary-save-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            保存修改
          </button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * 总结提示词编辑器
   */
  createSummaryPromptsModal(container) {
    const html = `
      <div id="summary-prompts-overlay" class="overlay">
        <div id="summary-prompts-modal" class="modal glass-panel summary-modal">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn">&times;</button>
          <h4>📝 总结提示词编辑</h4>
          <p class="summary-hint">自定义AI生成总结时使用的提示词，帮助AI更好地总结剧情</p>

          <div class="summary-prompts-tabs">
            <button class="prompt-tab active" data-tab="small-prompt">小总结提示词</button>
            <button class="prompt-tab" data-tab="big-prompt">大总结提示词</button>
          </div>

          <div class="prompt-content active" id="small-prompt-content">
            <div class="input-group">
              <label for="small-summary-prompt">小总结生成提示词</label>
              <textarea id="small-summary-prompt" class="input-field summary-textarea" rows="8" placeholder="输入生成小总结时使用的提示词..."></textarea>
            </div>
            <p class="prompt-hint">小总结用于记录每一段剧情的关键信息，会自动合并为大总结</p>
          </div>

          <div class="prompt-content" id="big-prompt-content">
            <div class="input-group">
              <label for="big-summary-prompt">大总结生成提示词</label>
              <textarea id="big-summary-prompt" class="input-field summary-textarea" rows="8" placeholder="输入生成大总结时使用的提示词..."></textarea>
            </div>
            <p class="prompt-hint">大总结用于记录重要的剧情节点和阶段性总结</p>
          </div>

          <div class="summary-prompts-actions">
            <button id="reset-summary-prompts-btn" class="btn btn-secondary">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              恢复默认
            </button>
            <button id="save-summary-prompts-btn" class="btn btn-primary">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              保存提示词
            </button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  },
  
  /**
   * Toast 通知
   */
  createToast(container) {
    const html = `<div class="toast" id="toast"></div>`;
    container.insertAdjacentHTML('beforeend', html);
  }
};

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', () => {
  ModalsManager.init();
});
