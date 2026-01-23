/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 变量设置界面
 * 基于MVU变量更新系统
 * ============================================================ */

/**
 * 变量设置界面模块
 */
const VariablesUI = {
  currentTab: 'status',

  /**
   * 初始化变量界面
   */
  init() {
    this.bindEvents();
    // 从存储加载自定义提示词
    this.loadPromptsFromStorage();
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 返回按钮
    const backBtn = document.getElementById('btn-back-from-variables');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // 变量设置页面始终返回设置页面
        navigateTo('settings');
      });
    }

    // 标签切换
    const tabs = document.querySelectorAll('.variables-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // 导入世界书按钮
    const importWorldbookBtn = document.getElementById('btn-import-worldbook-variables');
    if (importWorldbookBtn) {
      importWorldbookBtn.addEventListener('click', () => {
        document.getElementById('worldbook-import-input')?.click();
      });
    }

    // 世界书文件导入
    const worldbookInput = document.getElementById('worldbook-import-input');
    if (worldbookInput) {
      worldbookInput.addEventListener('change', e => {
        this.handleWorldbookImport(e);
      });
    }

    // 保存MVU提示词按钮
    const saveMvuBtn = document.getElementById('btn-save-mvu-prompts');
    if (saveMvuBtn) {
      saveMvuBtn.addEventListener('click', () => {
        this.saveMvuPrompts();
      });
    }

    // 重置MVU提示词按钮
    const resetMvuBtn = document.getElementById('btn-reset-mvu-prompts');
    if (resetMvuBtn) {
      resetMvuBtn.addEventListener('click', () => {
        this.resetMvuPrompts();
      });
    }

    // 导出变量按钮
    const exportBtn = document.getElementById('btn-export-variables');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportVariables();
      });
    }

    // 导入变量按钮
    const importBtn = document.getElementById('btn-import-variables');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        document.getElementById('variables-import-input')?.click();
      });
    }

    // 变量文件导入
    const variablesInput = document.getElementById('variables-import-input');
    if (variablesInput) {
      variablesInput.addEventListener('change', e => {
        this.handleVariablesImport(e);
      });
    }
  },

  /**
   * 切换标签页
   * @param {string} tabName - 标签名称
   */
  switchTab(tabName) {
    this.currentTab = tabName;

    // 更新标签样式
    document.querySelectorAll('.variables-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // 更新内容区域
    document.querySelectorAll('.variables-content').forEach(content => {
      content.classList.toggle('active', content.id === `variables-${tabName}`);
    });

    // 刷新对应内容
    this.refreshContent(tabName);
  },

  /**
   * 刷新内容
   * @param {string} tabName - 标签名称
   */
  refreshContent(tabName) {
    switch (tabName) {
      case 'status':
        this.renderStatusPreview();
        break;
      case 'clothing':
        this.renderClothingPreview();
        break;
      case 'enemy':
        this.renderEnemyPreview();
        break;
      case 'battle':
        this.renderBattlePreview();
        break;
      case 'worldbook':
        this.renderWorldbookSection();
        break;
      case 'prompts':
        this.renderPromptsSection();
        break;
    }
  },

  /**
   * 渲染角色状态预览
   */
  renderStatusPreview() {
    const container = document.getElementById('status-preview');
    if (!container) return;

    const status = GameVariables.status;
    const battle = GameVariables.battle;

    container.innerHTML = `
      <div class="preview-section">
        <h4 class="preview-title">📍 时间与位置</h4>
        <div class="preview-grid">
          <div class="preview-item">
            <span class="preview-label">时间</span>
            <span class="preview-value">${status.time}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">位置与天气</span>
            <span class="preview-value">${status.location_weather}</span>
          </div>
        </div>
      </div>

      <div class="preview-section">
        <h4 class="preview-title">⚔️ 职业与能力</h4>
        <div class="preview-item full-width">
          <span class="preview-value">${status.profession}</span>
        </div>
      </div>

      <div class="preview-section">
        <h4 class="preview-title">📊 战斗数值</h4>
        <div class="preview-grid stats-grid">
          <div class="stat-preview">
            <div class="stat-icon">❤️</div>
            <div class="stat-info">
              <span class="stat-name">生命值</span>
              <span class="stat-value">${battle.core.hp} / ${battle.core.max_hp}</span>
            </div>
          </div>
          <div class="stat-preview">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <span class="stat-name">等级</span>
              <span class="stat-value">Lv.${battle.level}</span>
            </div>
          </div>
          <div class="stat-preview">
            <div class="stat-icon">✨</div>
            <div class="stat-info">
              <span class="stat-name">经验值</span>
              <span class="stat-value">${battle.exp}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="preview-section">
        <h4 class="preview-title">🔮 永久状态</h4>
        <div class="status-list">
          ${
            status.permanent_status.length > 0
              ? status.permanent_status
                  .map(
                    s => `
                <div class="status-tag permanent">
                  <strong>${s.name}</strong>
                  <span>${s.description}</span>
                </div>
              `,
                  )
                  .join('')
              : '<div class="empty-status">暂无永久状态</div>'
          }
        </div>
      </div>

      <div class="preview-section">
        <h4 class="preview-title">⚡ 临时状态</h4>
        <div class="status-list horizontal">
          ${
            status.temporary_status.length > 0
              ? status.temporary_status.map(s => `<span class="status-tag temporary">${s}</span>`).join('')
              : '<div class="empty-status">暂无临时状态</div>'
          }
        </div>
      </div>

      <div class="preview-section">
        <h4 class="preview-title">🎒 物品栏</h4>
        <div class="inventory-list">
          ${
            status.inventory.length > 0
              ? status.inventory.map(item => `<span class="inventory-item">${item}</span>`).join('')
              : '<div class="empty-status">物品栏为空</div>'
          }
        </div>
      </div>
    `;
  },

  /**
   * 渲染服装预览
   */
  renderClothingPreview() {
    const container = document.getElementById('clothing-preview');
    if (!container) return;

    const clothing = GameVariables.status.clothing;

    const clothingSlots = [
      { key: 'head', icon: '👒', label: '头部' },
      { key: 'neck', icon: '📿', label: '颈部' },
      { key: 'hands', icon: '🧤', label: '手部' },
      { key: 'upper_body', icon: '👕', label: '上身' },
      { key: 'lower_body', icon: '👖', label: '下身' },
      { key: 'underwear', icon: '🩲', label: '内衣' },
      { key: 'legs', icon: '🧦', label: '腿部' },
      { key: 'feet', icon: '👟', label: '脚部' },
    ];

    container.innerHTML = `
      <div class="clothing-grid">
        ${clothingSlots
          .map(
            slot => `
          <div class="clothing-slot ${clothing[slot.key] === '无' ? 'empty' : ''}">
            <div class="clothing-icon">${slot.icon}</div>
            <div class="clothing-info">
              <span class="clothing-label">${slot.label}</span>
              <span class="clothing-value">${clothing[slot.key]}</span>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>

      <div class="clothing-actions">
        <button class="btn btn-secondary btn-small" onclick="VariablesUI.editClothing()">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          编辑服装
        </button>
      </div>
    `;
  },

  /**
   * 渲染敌人信息预览
   */
  renderEnemyPreview() {
    const container = document.getElementById('enemy-preview');
    if (!container) return;

    const enemy = GameVariables.battle.enemy;

    if (!enemy) {
      container.innerHTML = `
        <div class="empty-enemy">
          <div class="empty-icon">⚔️</div>
          <p>当前没有敌人信息</p>
          <p class="hint">敌人信息将在战斗开始时由AI动态生成</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="enemy-card-preview">
        <div class="enemy-header">
          <span class="enemy-emoji">${enemy.emoji || '👹'}</span>
          <h3 class="enemy-name">${enemy.name}</h3>
        </div>

        <div class="enemy-stats">
          <div class="enemy-stat">
            <span class="stat-label">生命值</span>
            <div class="stat-bar-track">
              <div class="stat-bar-fill health" style="width: ${(enemy.hp / enemy.max_hp) * 100}%"></div>
            </div>
            <span class="stat-value">${enemy.hp} / ${enemy.max_hp}</span>
          </div>
        </div>

        <div class="enemy-description">
          <p>${enemy.description || '暂无描述'}</p>
        </div>

        <div class="enemy-actions-list">
          <h4>技能列表</h4>
          ${
            enemy.actions && enemy.actions.length > 0
              ? enemy.actions
                  .map(
                    action => `
              <div class="action-item">
                <strong>${action.name}</strong>
                <span>${action.description}</span>
                <code>${action.effect}</code>
              </div>
            `,
                  )
                  .join('')
              : '<p class="empty-status">暂无技能</p>'
          }
        </div>

        <div class="enemy-mode">
          <span class="mode-label">行动模式:</span>
          <span class="mode-value">${this.getActionModeName(enemy.action_mode)}</span>
        </div>
      </div>
    `;
  },

  /**
   * 获取行动模式名称
   */
  getActionModeName(mode) {
    const modes = {
      random: '随机',
      probability: '概率',
      sequence: '顺序',
      sequence_then_probability: '顺序+概率',
    };
    return modes[mode] || mode || '未设置';
  },

  /**
   * 渲染战斗信息预览
   */
  renderBattlePreview() {
    const container = document.getElementById('battle-preview');
    if (!container) return;

    const battle = GameVariables.battle;

    container.innerHTML = `
      <div class="battle-info-grid">
        <div class="battle-section">
          <h4>📜 卡牌 (${battle.cards.length})</h4>
          <div class="cards-mini-list">
            ${
              battle.cards.length > 0
                ? battle.cards
                    .slice(0, 10)
                    .map(
                      card => `
                <div class="card-mini ${card.type.toLowerCase()}">
                  <span class="card-cost">${card.cost}</span>
                  <span class="card-name">${card.name}</span>
                </div>
              `,
                    )
                    .join('')
                : '<p class="empty-status">暂无卡牌</p>'
            }
            ${battle.cards.length > 10 ? `<p class="more-hint">...还有 ${battle.cards.length - 10} 张卡牌</p>` : ''}
          </div>
        </div>

        <div class="battle-section">
          <h4>🏺 遗物 (${battle.artifacts.length})</h4>
          <div class="artifacts-list">
            ${
              battle.artifacts.length > 0
                ? battle.artifacts
                    .map(
                      artifact => `
                <div class="artifact-item">
                  <span class="artifact-emoji">${artifact.emoji}</span>
                  <span class="artifact-name">${artifact.name}</span>
                </div>
              `,
                    )
                    .join('')
                : '<p class="empty-status">暂无遗物</p>'
            }
          </div>
        </div>

        <div class="battle-section">
          <h4>🧪 道具 (${battle.items.length})</h4>
          <div class="items-list">
            ${
              battle.items.length > 0
                ? battle.items
                    .map(
                      item => `
                <div class="item-entry">
                  <span class="item-emoji">${item.emoji}</span>
                  <span class="item-name">${item.name}</span>
                  <span class="item-count">x${item.count}</span>
                </div>
              `,
                    )
                    .join('')
                : '<p class="empty-status">暂无道具</p>'
            }
          </div>
        </div>

        <div class="battle-section">
          <h4>✨ 状态定义 (${battle.statuses.length})</h4>
          <div class="statuses-list">
            ${
              battle.statuses.length > 0
                ? battle.statuses
                    .map(
                      status => `
                <div class="status-def ${status.type}">
                  <span class="status-emoji">${status.emoji}</span>
                  <span class="status-name">${status.name}</span>
                  <span class="status-type-badge">${status.type}</span>
                </div>
              `,
                    )
                    .join('')
                : '<p class="empty-status">暂无状态定义</p>'
            }
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 渲染世界书管理区域
   */
  renderWorldbookSection() {
    const container = document.getElementById('worldbook-section');
    if (!container) return;

    const entries = GameState.world && GameState.world.entries ? GameState.world.entries : [];

    // 分离用户世界信息和其他条目
    const userWorldEntry = entries.find(entry => entry.isUserWorldInfo || entry.key === '__user_world_info__');
    const otherEntries = entries.filter(entry => !entry.isUserWorldInfo && entry.key !== '__user_world_info__');

    container.innerHTML = `
      <div class="worldbook-header">
        <h4>📚 已加载的世界书条目 (${entries.length})</h4>
        <div class="worldbook-actions">
          <button class="btn btn-primary btn-small" id="btn-add-worldbook-entry" title="添加新的世界书条目">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            添加条目
          </button>
          <button class="btn btn-secondary btn-small" id="btn-import-worldbook-variables">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            导入世界书
          </button>
          <input type="file" id="worldbook-import-input" accept=".json" style="display: none;" />
          <button class="btn btn-secondary btn-small" id="btn-export-worldbook-variables">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            导出世界书
          </button>
          <button class="btn btn-danger btn-small" id="btn-delete-worldbook" title="删除整个世界书及所有条目">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            删除世界书
          </button>
        </div>
      </div>

      <!-- 用户世界信息编辑器（固定在第一位） -->
      <div class="user-world-editor-section">
        <div class="user-world-editor-header">
          <span class="user-world-badge">🌍 我的世界设定</span>
          <span class="user-world-hint">（固定在第一位，始终生效）</span>
        </div>
        <div class="user-world-editor-content">
          <textarea
            id="user-world-info-textarea"
            class="input-field user-world-textarea"
            rows="6"
            placeholder="在这里描述你的世界设定...这将作为AI理解世界的基础背景。"
          >${userWorldEntry ? this.escapeHtml(userWorldEntry.content || '') : ''}</textarea>
          <div class="user-world-editor-actions">
            <button class="btn btn-primary btn-small" id="btn-save-user-world-info">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              保存世界设定
            </button>
            ${
              userWorldEntry
                ? `
              <span class="user-world-status">
                上次更新: ${new Date(userWorldEntry.updatedAt || userWorldEntry.createdAt).toLocaleString('zh-CN')}
              </span>
            `
                : ''
            }
          </div>
        </div>
      </div>

      <div class="worldbook-divider">
        <span>其他世界书条目 (${otherEntries.length})</span>
      </div>

      <div class="worldbook-search">
        <input type="text" class="input-field" id="worldbook-search-input" placeholder="搜索条目..." />
      </div>

      <div class="worldbook-entries" id="worldbook-entries-list">
        ${this.renderWorldbookEntries(otherEntries)}
      </div>
    `;

    // 绑定事件
    this.bindWorldbookEvents();
  },

  /**
   * 渲染世界书条目列表
   * @param {Array} entries - 条目数组
   * @param {string} filter - 过滤关键词
   * @returns {string} HTML字符串
   */
  renderWorldbookEntries(entries, filter = '') {
    if (!entries || entries.length === 0) {
      return `
        <div class="empty-worldbook">
          <div class="empty-icon">📖</div>
          <p>暂无加载的世界书</p>
          <p class="hint">点击"创建条目"添加新的世界设定</p>
          <p class="hint">或导入世界书JSON文件</p>
        </div>
      `;
    }

    // 过滤条目
    let filteredEntries = entries;
    if (filter && filter.trim()) {
      const keyword = filter.toLowerCase().trim();
      filteredEntries = entries.filter(function (entry, index) {
        const name = (entry.name || entry.key || '条目 ' + (index + 1)).toLowerCase();
        const keys = Array.isArray(entry.keys) ? entry.keys.join(' ').toLowerCase() : (entry.keys || '').toLowerCase();
        const content = (entry.content || '').toLowerCase();
        return name.indexOf(keyword) !== -1 || keys.indexOf(keyword) !== -1 || content.indexOf(keyword) !== -1;
      });
    }

    if (filteredEntries.length === 0) {
      return `
        <div class="empty-worldbook">
          <div class="empty-icon">🔍</div>
          <p>未找到匹配的条目</p>
        </div>
      `;
    }

    // 计算真实索引（在完整entries数组中的位置）
    const allEntries = GameState.world && GameState.world.entries ? GameState.world.entries : [];

    return filteredEntries
      .map(function (entry, displayIndex) {
        const entryName = entry.name || entry.key || '条目 ' + (displayIndex + 1);
        const entryKeys = Array.isArray(entry.keys) ? entry.keys.join(', ') : entry.keys || '';
        const entryContent = entry.content || '';
        const truncatedContent = entryContent.length > 150 ? entryContent.substring(0, 150) + '...' : entryContent;

        // 找到在原始数组中的真实索引
        const realIndex = allEntries.findIndex(e => e === entry);

        return `
        <div class="worldbook-entry collapsible-entry collapsed" data-index="${realIndex}">
          <div class="entry-header clickable" onclick="VariablesUI.toggleWorldbookEntry(this)">
            <div class="entry-header-left">
              <svg class="entry-collapse-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <span class="entry-name">${VariablesUI.escapeHtml(entryName)}</span>
              ${entryKeys ? '<span class="entry-keywords-badge">' + VariablesUI.escapeHtml(entryKeys.substring(0, 30)) + (entryKeys.length > 30 ? '...' : '') + '</span>' : ''}
            </div>
            <div class="entry-actions" onclick="event.stopPropagation()">
              <button class="btn-icon" onclick="VariablesUI.editWorldbookEntry(${realIndex})" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon btn-icon-danger" onclick="VariablesUI.deleteWorldbookEntry(${realIndex})" title="删除">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="entry-body">
            ${entryKeys ? '<div class="entry-keywords-full"><strong>关键词:</strong> ' + VariablesUI.escapeHtml(entryKeys) + '</div>' : ''}
            <div class="entry-content">${VariablesUI.escapeHtml(entryContent)}</div>
          </div>
        </div>
      `;
      })
      .join('');
  },

  /**
   * 切换世界书条目展开/折叠状态
   * @param {HTMLElement} headerElement - 点击的头部元素
   */
  toggleWorldbookEntry(headerElement) {
    const entryElement = headerElement.closest('.worldbook-entry');
    if (entryElement) {
      entryElement.classList.toggle('collapsed');
    }
  },

  /**
   * 创建新的世界书条目
   */
  createWorldbookEntry() {
    // 创建编辑模态框
    const modalHtml = `
      <div class="modal-overlay active" id="worldbook-create-modal">
        <div class="glass-panel modal worldbook-edit-modal">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn" onclick="VariablesUI.closeWorldbookCreateModal()">&times;</button>
          <h2 class="page-title">创建世界书条目</h2>
          <form id="worldbook-create-form">
            <div class="input-group">
              <label for="create-entry-name">条目名称 <span class="required">*</span></label>
              <input type="text" id="create-entry-name" class="input-field" placeholder="例如：魔法系统、王国历史..." required />
            </div>
            <div class="input-group">
              <label for="create-entry-keys">关键词（逗号分隔）</label>
              <input type="text" id="create-entry-keys" class="input-field" placeholder="例如：魔法, 法术, 咒语..." />
            </div>
            <div class="input-group">
              <label for="create-entry-content">内容 <span class="required">*</span></label>
              <textarea id="create-entry-content" class="input-field" rows="8" placeholder="描述这个世界设定的详细内容..." required></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="VariablesUI.closeWorldbookCreateModal()">取消</button>
              <button type="submit" class="btn btn-primary">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                创建条目
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 聚焦到名称输入框
    const nameInput = document.getElementById('create-entry-name');
    if (nameInput) {
      nameInput.focus();
    }

    // 绑定表单提交
    const form = document.getElementById('worldbook-create-form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nameInput = document.getElementById('create-entry-name');
      const keysInput = document.getElementById('create-entry-keys');
      const contentInput = document.getElementById('create-entry-content');

      const newEntry = {
        key: nameInput.value.trim(),
        name: nameInput.value.trim(),
        keys: keysInput.value
          .split(',')
          .map(k => k.trim())
          .filter(k => k),
        content: contentInput.value,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // 确保entries数组存在
      if (!GameState.world.entries) {
        GameState.world.entries = [];
      }

      // 添加到数组（在用户世界信息之后）
      const userWorldIndex = GameState.world.entries.findIndex(
        entry => entry.isUserWorldInfo || entry.key === '__user_world_info__',
      );

      if (userWorldIndex !== -1) {
        // 插入到用户世界信息之后
        GameState.world.entries.splice(userWorldIndex + 1, 0, newEntry);
      } else {
        // 添加到开头
        GameState.world.entries.unshift(newEntry);
      }

      this.closeWorldbookCreateModal();
      this.renderWorldbookSection();
      showToast('世界书条目已创建');
    });
  },

  /**
   * 关闭创建世界书条目模态框
   */
  closeWorldbookCreateModal() {
    const modal = document.getElementById('worldbook-create-modal');
    if (modal) {
      modal.remove();
    }
  },

  /**
   * 绑定世界书相关事件
   */
  bindWorldbookEvents() {
    // 导入按钮
    const importBtn = document.getElementById('btn-import-worldbook-variables');
    if (importBtn) {
      importBtn.addEventListener('click', function () {
        const input = document.getElementById('worldbook-import-input');
        if (input) input.click();
      });
    }

    // 文件输入
    const worldbookInput = document.getElementById('worldbook-import-input');
    if (worldbookInput) {
      worldbookInput.addEventListener('change', function (e) {
        VariablesUI.handleWorldbookImport(e);
      });
    }

    // 导出按钮
    const exportBtn = document.getElementById('btn-export-worldbook-variables');
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        VariablesUI.exportWorldbook();
      });
    }

    // 清除按钮（只清除非用户世界信息的条目）
    const clearBtn = document.getElementById('btn-clear-worldbook-variables');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        VariablesUI.clearWorldbook();
      });
    }

    // 搜索输入
    const searchInput = document.getElementById('worldbook-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        VariablesUI.filterWorldbookEntries(e.target.value);
      });
    }

    // 保存用户世界信息按钮
    const saveUserWorldBtn = document.getElementById('btn-save-user-world-info');
    if (saveUserWorldBtn) {
      saveUserWorldBtn.addEventListener('click', function () {
        VariablesUI.saveUserWorldInfo();
      });
    }

    // 创建世界书按钮
    const createWorldbookBtn = document.getElementById('btn-create-worldbook');
    if (createWorldbookBtn) {
      createWorldbookBtn.addEventListener('click', function () {
        VariablesUI.createNewWorldbook();
      });
    }

    // 添加条目按钮
    const addEntryBtn = document.getElementById('btn-add-worldbook-entry');
    if (addEntryBtn) {
      addEntryBtn.addEventListener('click', function () {
        VariablesUI.createWorldbookEntry();
      });
    }

    // 删除世界书按钮
    const deleteWorldbookBtn = document.getElementById('btn-delete-worldbook');
    if (deleteWorldbookBtn) {
      deleteWorldbookBtn.addEventListener('click', function () {
        VariablesUI.confirmDeleteWorldbook();
      });
    }
  },

  /**
   * 创建新世界书
   */
  createNewWorldbook() {
    const existingEntries = GameState.world && GameState.world.entries ? GameState.world.entries : [];
    const hasExistingEntries = existingEntries.length > 0;

    // 创建模态框 - 使用更明显的警告样式来区别于"添加条目"
    const modalHtml = `
      <div class="modal-overlay active" id="worldbook-new-modal">
        <div class="glass-panel modal worldbook-new-modal">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn" onclick="VariablesUI.closeNewWorldbookModal()">&times;</button>

          <div class="worldbook-new-header">
            <div class="new-worldbook-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 class="page-title">📚 创建新世界书</h2>
            <p class="new-worldbook-subtitle">创建一个全新的世界书，用于组织你的世界设定</p>
          </div>

          ${
            hasExistingEntries
              ? `
          <div class="worldbook-warning-box">
            <div class="warning-icon">⚠️</div>
            <div class="warning-content">
              <strong>注意：当前已有 ${existingEntries.length} 条世界书条目</strong>
              <p>创建新世界书将会<span class="text-danger">清空所有现有条目</span>！如果只想添加新内容，请使用"添加条目"功能。</p>
            </div>
          </div>
          `
              : ''
          }

          <form id="worldbook-new-form">
            <div class="input-group">
              <label for="new-worldbook-name">
                <span class="label-icon">📖</span>
                世界书名称 <span class="required">*</span>
              </label>
              <input type="text" id="new-worldbook-name" class="input-field" placeholder="例如：魔法大陆、星际联盟、末日废土..." required />
              <p class="input-hint">给你的世界书起一个独特的名字</p>
            </div>
            <div class="input-group">
              <label for="new-worldbook-desc">
                <span class="label-icon">📝</span>
                世界书描述
              </label>
              <textarea id="new-worldbook-desc" class="input-field" rows="4" placeholder="描述这个世界的核心设定、主题风格、主要特色..."></textarea>
              <p class="input-hint">简要描述这个世界书的主题和内容</p>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="VariablesUI.closeNewWorldbookModal()">取消</button>
              <button type="submit" class="btn btn-primary btn-create-worldbook">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                ${hasExistingEntries ? '确认创建（清空现有）' : '创建世界书'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 聚焦到名称输入框
    const nameInput = document.getElementById('new-worldbook-name');
    if (nameInput) {
      nameInput.focus();
    }

    // 绑定表单提交
    const form = document.getElementById('worldbook-new-form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nameInput = document.getElementById('new-worldbook-name');
      const descInput = document.getElementById('new-worldbook-desc');

      // 清空现有世界书，创建新的
      GameState.world.entries = [];

      // 添加世界书信息条目
      const worldbookInfoEntry = {
        key: '__worldbook_info__',
        name: nameInput.value.trim(),
        keys: ['世界书信息'],
        content: descInput.value.trim() || '这是一个新创建的世界书。',
        isWorldbookInfo: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      GameState.world.entries.push(worldbookInfoEntry);

      this.closeNewWorldbookModal();
      this.renderWorldbookSection();
      showToast('新世界书已创建：' + nameInput.value.trim());
    });
  },

  /**
   * 关闭创建世界书模态框
   */
  closeNewWorldbookModal() {
    const modal = document.getElementById('worldbook-new-modal');
    if (modal) {
      modal.remove();
    }
  },

  /**
   * 确认删除世界书 - 显示选择删除对话框
   */
  confirmDeleteWorldbook() {
    const entries = GameState.world && GameState.world.entries ? GameState.world.entries : [];
    if (entries.length === 0) {
      showToast('当前没有世界书可删除');
      return;
    }

    // 分离用户世界信息和其他条目
    const userWorldEntry = entries.find(entry => entry.isUserWorldInfo || entry.key === '__user_world_info__');
    const otherEntries = entries.filter(entry => !entry.isUserWorldInfo && entry.key !== '__user_world_info__');

    // 创建删除选择模态框
    const modalHtml = `
      <div class="modal-overlay active" id="worldbook-delete-modal">
        <div class="glass-panel modal worldbook-delete-select-modal">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn" onclick="VariablesUI.closeDeleteWorldbookModal()">&times;</button>

          <div class="delete-modal-header">
            <div class="delete-icon" style="color: var(--accent-danger, #dc3545);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 40px; height: 40px;">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </div>
            <h2 class="page-title">🗑️ 删除世界书条目</h2>
            <p class="delete-modal-subtitle">选择要删除的条目，或删除全部</p>
          </div>

          <div class="delete-options-section">
            <div class="delete-option-buttons">
              <button class="btn btn-ghost btn-small" onclick="VariablesUI.selectAllForDelete()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                全选
              </button>
              <button class="btn btn-ghost btn-small" onclick="VariablesUI.deselectAllForDelete()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                取消全选
              </button>
              <span class="selected-count-badge" id="delete-selected-count">已选择 0 条</span>
            </div>
          </div>

          <div class="delete-entries-list" id="delete-entries-list">
            ${
              userWorldEntry
                ? `
              <div class="delete-entry-item user-world-entry" data-index="-1">
                <label class="delete-entry-checkbox">
                  <input type="checkbox" disabled />
                  <span class="checkbox-custom disabled"></span>
                </label>
                <div class="delete-entry-info">
                  <span class="delete-entry-name">🌍 我的世界设定</span>
                  <span class="delete-entry-badge locked">固定条目</span>
                </div>
                <span class="delete-entry-hint">（此条目不可删除）</span>
              </div>
            `
                : ''
            }
            ${otherEntries
              .map((entry, displayIndex) => {
                const realIndex = entries.findIndex(e => e === entry);
                const entryName = entry.name || entry.key || '条目 ' + (displayIndex + 1);
                const entryKeys = Array.isArray(entry.keys) ? entry.keys.slice(0, 3).join(', ') : '';
                return `
                <div class="delete-entry-item" data-index="${realIndex}">
                  <label class="delete-entry-checkbox">
                    <input type="checkbox" value="${realIndex}" onchange="VariablesUI.updateDeleteSelectedCount()" />
                    <span class="checkbox-custom"></span>
                  </label>
                  <div class="delete-entry-info">
                    <span class="delete-entry-name">${this.escapeHtml(entryName)}</span>
                    ${entryKeys ? `<span class="delete-entry-keys">${this.escapeHtml(entryKeys)}</span>` : ''}
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>

          ${
            otherEntries.length === 0
              ? `
            <div class="delete-no-entries">
              <p>没有可删除的条目</p>
              <p class="hint">用户世界设定是固定条目，不可删除</p>
            </div>
          `
              : ''
          }

          <div class="delete-modal-footer">
            <div class="delete-warning-text">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              删除后不可恢复，请谨慎操作
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" onclick="VariablesUI.closeDeleteWorldbookModal()">
                取消
              </button>
              <button class="btn btn-danger" id="btn-confirm-delete-selected" onclick="VariablesUI.executeDeleteSelectedEntries()" ${otherEntries.length === 0 ? 'disabled' : ''}>
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                删除选中项
              </button>
              <button class="btn btn-danger" onclick="VariablesUI.confirmDeleteAllWorldbook()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                删除全部
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  /**
   * 全选要删除的条目
   */
  selectAllForDelete() {
    const checkboxes = document.querySelectorAll('#delete-entries-list input[type="checkbox"]:not(:disabled)');
    checkboxes.forEach(cb => {
      cb.checked = true;
    });
    this.updateDeleteSelectedCount();
  },

  /**
   * 取消全选
   */
  deselectAllForDelete() {
    const checkboxes = document.querySelectorAll('#delete-entries-list input[type="checkbox"]:not(:disabled)');
    checkboxes.forEach(cb => {
      cb.checked = false;
    });
    this.updateDeleteSelectedCount();
  },

  /**
   * 更新已选择数量显示
   */
  updateDeleteSelectedCount() {
    const checkboxes = document.querySelectorAll('#delete-entries-list input[type="checkbox"]:checked');
    const countBadge = document.getElementById('delete-selected-count');
    const deleteBtn = document.getElementById('btn-confirm-delete-selected');

    if (countBadge) {
      countBadge.textContent = `已选择 ${checkboxes.length} 条`;
      countBadge.classList.toggle('has-selection', checkboxes.length > 0);
    }

    if (deleteBtn) {
      deleteBtn.disabled = checkboxes.length === 0;
    }
  },

  /**
   * 删除选中的条目
   */
  executeDeleteSelectedEntries() {
    const checkboxes = document.querySelectorAll('#delete-entries-list input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
      showToast('请先选择要删除的条目');
      return;
    }

    // 获取要删除的索引（从大到小排序，避免删除时索引错位）
    const indicesToDelete = Array.from(checkboxes)
      .map(cb => parseInt(cb.value))
      .sort((a, b) => b - a);

    // 执行删除
    const entries = GameState.world.entries;
    indicesToDelete.forEach(index => {
      if (index >= 0 && index < entries.length) {
        entries.splice(index, 1);
      }
    });

    // 关闭模态框并刷新
    this.closeDeleteWorldbookModal();
    this.renderWorldbookSection();

    // 同步更新设置页面的世界书计数
    if (typeof SettingsUI !== 'undefined' && SettingsUI.updateWorldbookSummary) {
      SettingsUI.updateWorldbookSummary();
    }

    showToast(`已删除 ${indicesToDelete.length} 条世界书条目`);
  },

  /**
   * 确认删除全部世界书（二次确认）
   */
  confirmDeleteAllWorldbook() {
    const entries = GameState.world && GameState.world.entries ? GameState.world.entries : [];

    // 创建二次确认对话框
    const confirmHtml = `
      <div class="modal-overlay active" id="worldbook-delete-confirm-modal" style="z-index: 10001;">
        <div class="glass-panel modal worldbook-delete-confirm">
          <div class="delete-confirm-content">
            <div class="delete-icon" style="color: var(--accent-danger, #dc3545);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h4 style="color: var(--accent-danger, #dc3545);">⚠️ 最终确认</h4>
            <p class="delete-warning">您确定要删除<strong>全部 ${entries.length} 条</strong>世界书条目吗？</p>
            <p class="delete-hint" style="color: var(--accent-danger, #dc3545);">此操作不可撤销！</p>
          </div>
          <div class="modal-actions" style="justify-content: center; gap: 16px;">
            <button class="btn btn-secondary" onclick="document.getElementById('worldbook-delete-confirm-modal').remove()">
              取消
            </button>
            <button class="btn btn-danger" onclick="VariablesUI.executeDeleteAllWorldbook()">
              确认删除全部
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', confirmHtml);
  },

  /**
   * 执行删除全部世界书
   */
  executeDeleteAllWorldbook() {
    // 关闭二次确认模态框
    const confirmModal = document.getElementById('worldbook-delete-confirm-modal');
    if (confirmModal) {
      confirmModal.remove();
    }

    // 关闭选择模态框
    this.closeDeleteWorldbookModal();

    // 执行删除
    GameState.world.entries = [];
    GameState.world.prompt = '';
    GameState.world.isLoaded = false;

    // 刷新界面
    this.renderWorldbookSection();

    // 同步更新设置页面的世界书计数
    if (typeof SettingsUI !== 'undefined' && SettingsUI.updateWorldbookSummary) {
      SettingsUI.updateWorldbookSummary();
    }

    showToast('世界书已全部删除');
  },

  /**
   * 关闭删除世界书确认模态框
   */
  closeDeleteWorldbookModal() {
    const modal = document.getElementById('worldbook-delete-modal');
    if (modal) {
      modal.remove();
    }
  },

  /**
   * 保存用户世界信息
   */
  saveUserWorldInfo() {
    const textarea = document.getElementById('user-world-info-textarea');
    if (!textarea) return;

    const content = textarea.value.trim();

    // 确保entries数组存在
    if (!GameState.world.entries) {
      GameState.world.entries = [];
    }

    // 查找现有的用户世界信息条目
    const existingIndex = GameState.world.entries.findIndex(
      entry => entry.isUserWorldInfo || entry.key === '__user_world_info__',
    );

    const userWorldEntry = {
      key: '__user_world_info__',
      name: '🌍 我的世界设定',
      keys: ['世界设定', '世界观', '背景'],
      content: content,
      isUserWorldInfo: true,
      isLocked: true,
      createdAt: existingIndex !== -1 ? GameState.world.entries[existingIndex].createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (existingIndex !== -1) {
      // 更新现有条目
      GameState.world.entries[existingIndex] = userWorldEntry;
      // 确保它在第一位
      if (existingIndex !== 0) {
        GameState.world.entries.splice(existingIndex, 1);
        GameState.world.entries.unshift(userWorldEntry);
      }
    } else if (content) {
      // 如果有内容才添加新条目
      GameState.world.entries.unshift(userWorldEntry);
    }

    // 同步更新 GameState.world.prompt
    GameState.world.prompt = content;

    // 刷新显示
    this.renderWorldbookSection();
    showToast('世界设定已保存');
  },

  /**
   * 过滤世界书条目
   * @param {string} keyword - 搜索关键词
   */
  filterWorldbookEntries(keyword) {
    const container = document.getElementById('worldbook-entries-list');
    if (!container) return;

    const entries = GameState.world && GameState.world.entries ? GameState.world.entries : [];
    // 过滤掉用户世界信息条目，因为它单独显示
    const otherEntries = entries.filter(entry => !entry.isUserWorldInfo && entry.key !== '__user_world_info__');
    container.innerHTML = this.renderWorldbookEntries(otherEntries, keyword);
  },

  /**
   * 导出世界书
   */
  exportWorldbook() {
    try {
      const entries = GameState.world && GameState.world.entries ? GameState.world.entries : [];
      if (entries.length === 0) {
        showToast('没有可导出的世界书条目');
        return;
      }

      const dataStr = JSON.stringify({ entries: entries }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'worldbook_' + Date.now() + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('世界书已导出');
    } catch (error) {
      console.error('导出世界书失败:', error);
      showToast('导出失败');
    }
  },

  /**
   * 编辑世界书条目
   * @param {number} index - 条目索引
   */
  editWorldbookEntry(index) {
    const entries = GameState.world && GameState.world.entries ? GameState.world.entries : [];
    if (index < 0 || index >= entries.length) {
      showToast('条目不存在');
      return;
    }

    const entry = entries[index];
    const entryName = entry.name || entry.key || '';
    const entryKeys = Array.isArray(entry.keys) ? entry.keys.join(', ') : entry.keys || '';
    const entryContent = entry.content || '';

    // 创建编辑模态框
    const modalHtml = `
      <div class="modal-overlay active" id="worldbook-edit-modal">
        <div class="glass-panel modal worldbook-edit-modal">
          <h2 class="page-title">编辑世界书条目</h2>
          <form id="worldbook-edit-form">
            <div class="input-group">
              <label for="edit-entry-name">条目名称</label>
              <input type="text" id="edit-entry-name" class="input-field" value="${this.escapeHtml(entryName)}" />
            </div>
            <div class="input-group">
              <label for="edit-entry-keys">关键词（逗号分隔）</label>
              <input type="text" id="edit-entry-keys" class="input-field" value="${this.escapeHtml(entryKeys)}" />
            </div>
            <div class="input-group">
              <label for="edit-entry-content">内容</label>
              <textarea id="edit-entry-content" class="input-field" rows="8">${this.escapeHtml(entryContent)}</textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="VariablesUI.closeWorldbookEditModal()">取消</button>
              <button type="submit" class="btn btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 绑定表单提交
    const form = document.getElementById('worldbook-edit-form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nameInput = document.getElementById('edit-entry-name');
      const keysInput = document.getElementById('edit-entry-keys');
      const contentInput = document.getElementById('edit-entry-content');

      entries[index].name = nameInput.value.trim();
      entries[index].key = nameInput.value.trim();
      entries[index].keys = keysInput.value
        .split(',')
        .map(k => k.trim())
        .filter(k => k);
      entries[index].content = contentInput.value;

      this.closeWorldbookEditModal();
      this.renderWorldbookSection();
      showToast('条目已更新');
    });
  },

  /**
   * 关闭世界书编辑模态框
   */
  closeWorldbookEditModal() {
    const modal = document.getElementById('worldbook-edit-modal');
    if (modal) {
      modal.remove();
    }
  },

  /**
   * 删除世界书条目
   * @param {number} index - 条目索引
   */
  deleteWorldbookEntry(index) {
    if (!confirm('确定要删除这个条目吗？')) {
      return;
    }

    const entries = GameState.world && GameState.world.entries ? GameState.world.entries : [];
    if (index >= 0 && index < entries.length) {
      entries.splice(index, 1);
      this.renderWorldbookSection();

      // 同步更新设置页面的世界书计数
      if (typeof SettingsUI !== 'undefined' && SettingsUI.updateWorldbookSummary) {
        SettingsUI.updateWorldbookSummary();
      }

      showToast('条目已删除');
    }
  },

  /**
   * HTML转义
   * @param {string} str - 原始字符串
   * @returns {string} 转义后的字符串
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 渲染提示词设置区域
   */
  renderPromptsSection() {
    const container = document.getElementById('prompts-section');
    if (!container) return;

    container.innerHTML = `
      <div class="prompts-info">
        <h4>📝 AI提示词配置</h4>
        <p>配置发送给AI的系统提示词和变量更新格式。这些提示词决定了AI如何理解和响应游戏内容。</p>
      </div>

      <div class="prompts-section">
        <div class="prompt-group collapsible-prompt collapsed" data-prompt-id="system-role">
          <div class="prompt-header" data-target="prompt-system-role">
            <h4>🎭 系统角色</h4>
            <div class="prompt-header-actions">
              <button class="btn-icon prompt-edit-btn" data-prompt="systemRole" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <svg class="collapse-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <div class="prompt-content" id="prompt-system-role">
            <p class="prompt-desc">定义AI的基本角色和身份</p>
            <div class="prompt-preview" id="prompt-system-role-preview">${this.escapeHtml(MVU_PROMPTS.systemRole)}</div>
          </div>
        </div>

        <div class="prompt-group collapsible-prompt collapsed" data-prompt-id="narrative-rules">
          <div class="prompt-header" data-target="prompt-narrative-rules">
            <h4>📖 叙事规则</h4>
            <div class="prompt-header-actions">
              <button class="btn-icon prompt-edit-btn" data-prompt="narrativeRules" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <svg class="collapse-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <div class="prompt-content" id="prompt-narrative-rules">
            <p class="prompt-desc">定义AI如何进行叙事和讲故事</p>
            <div class="prompt-preview" id="prompt-narrative-rules-preview">${this.escapeHtml(MVU_PROMPTS.narrativeRules)}</div>
          </div>
        </div>

        <div class="prompt-group collapsible-prompt collapsed" data-prompt-id="output-structure">
          <div class="prompt-header" data-target="prompt-output-structure">
            <h4>📋 输出结构</h4>
            <div class="prompt-header-actions">
              <button class="btn-icon prompt-edit-btn" data-prompt="outputStructure" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <svg class="collapse-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <div class="prompt-content" id="prompt-output-structure">
            <p class="prompt-desc">定义AI响应的基本结构</p>
            <div class="prompt-preview" id="prompt-output-structure-preview">${this.escapeHtml(MVU_PROMPTS.outputStructure)}</div>
          </div>
        </div>

        <div class="prompt-group collapsible-prompt collapsed" data-prompt-id="output-format">
          <div class="prompt-header" data-target="prompt-output-format">
            <h4>🔄 变量更新格式 (MVU)</h4>
            <div class="prompt-header-actions">
              <button class="btn-icon prompt-edit-btn" data-prompt="outputFormat" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <svg class="collapse-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <div class="prompt-content" id="prompt-output-format">
            <p class="prompt-desc">定义AI如何输出变量更新指令（JSON Patch格式）</p>
            <div class="prompt-preview code-preview" id="prompt-output-format-preview">${this.escapeHtml(MVU_PROMPTS.outputFormat)}</div>
          </div>
        </div>

        <div class="prompt-group collapsible-prompt collapsed" data-prompt-id="update-rules">
          <div class="prompt-header" data-target="prompt-update-rules">
            <h4>📏 变量更新规则</h4>
            <div class="prompt-header-actions">
              <button class="btn-icon prompt-edit-btn" data-prompt="updateRules" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <svg class="collapse-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <div class="prompt-content" id="prompt-update-rules">
            <p class="prompt-desc">定义变量更新的规则和约束</p>
            <div class="prompt-preview" id="prompt-update-rules-preview">${this.escapeHtml(MVU_PROMPTS.updateRules)}</div>
          </div>
        </div>

        <div class="prompt-group collapsible-prompt collapsed" data-prompt-id="battle-trigger">
          <div class="prompt-header" data-target="prompt-battle-trigger">
            <h4>⚔️ 战斗触发</h4>
            <div class="prompt-header-actions">
              <button class="btn-icon prompt-edit-btn" data-prompt="battleTrigger" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <svg class="collapse-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <div class="prompt-content" id="prompt-battle-trigger">
            <p class="prompt-desc">定义AI如何触发战斗</p>
            <div class="prompt-preview" id="prompt-battle-trigger-preview">${this.escapeHtml(MVU_PROMPTS.battleTrigger)}</div>
          </div>
        </div>
      </div>

      <div class="prompts-actions">
        <button class="btn btn-primary" id="btn-save-all-prompts">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          保存所有提示词
        </button>
        <button class="btn btn-secondary" id="btn-reset-all-prompts">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          重置为默认
        </button>
        <button class="btn btn-ghost" id="btn-preview-prompt">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          预览完整提示词
        </button>
      </div>

      <div class="prompts-preview-section" id="prompt-preview-section" style="display: none;">
        <h4>📄 完整提示词预览</h4>
        <div class="prompt-preview-container">
          <pre id="full-prompt-preview"></pre>
        </div>
        <button class="btn btn-secondary btn-small" id="btn-copy-prompt">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          复制提示词
        </button>
      </div>

      <div class="variables-preview-section">
        <h4>📊 当前变量JSON预览</h4>
        <div class="json-preview">
          <pre id="variables-json-preview">${JSON.stringify(GameVariables, null, 2)}</pre>
        </div>
        <div class="variable-actions">
          <button class="btn btn-secondary btn-small" id="btn-export-variables">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            导出变量
          </button>
          <button class="btn btn-secondary btn-small" id="btn-import-variables">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            导入变量
          </button>
          <input type="file" id="variables-import-input" accept=".json" style="display: none;" />
        </div>
      </div>
    `;

    // 绑定提示词区域事件
    this.bindPromptsEvents();
  },

  /**
   * 绑定提示词区域事件
   */
  bindPromptsEvents() {
    // 折叠/展开提示词区块
    const promptGroups = document.querySelectorAll('.prompt-group.collapsible-prompt');
    promptGroups.forEach(group => {
      const header = group.querySelector('.prompt-header');
      if (header) {
        header.addEventListener('click', e => {
          // 如果点击的是编辑按钮，不触发折叠
          if (e.target.closest('.prompt-edit-btn')) {
            return;
          }
          // 切换折叠状态 - 在 prompt-group 元素上切换 collapsed 类
          group.classList.toggle('collapsed');
        });
      }
    });

    // 编辑提示词按钮
    const editBtns = document.querySelectorAll('.prompt-edit-btn');
    editBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const promptKey = btn.getAttribute('data-prompt');
        this.openPromptEditModal(promptKey);
      });
    });

    // 保存所有提示词
    const saveBtn = document.getElementById('btn-save-all-prompts');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveAllPrompts();
      });
    }

    // 重置所有提示词
    const resetBtn = document.getElementById('btn-reset-all-prompts');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetAllPrompts();
      });
    }

    // 预览提示词
    const previewBtn = document.getElementById('btn-preview-prompt');
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        this.togglePromptPreview();
      });
    }

    // 复制提示词
    const copyBtn = document.getElementById('btn-copy-prompt');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.copyFullPrompt();
      });
    }

    // 导出变量
    const exportBtn = document.getElementById('btn-export-variables');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportVariables();
      });
    }

    // 导入变量
    const importBtn = document.getElementById('btn-import-variables');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        document.getElementById('variables-import-input')?.click();
      });
    }

    const variablesInput = document.getElementById('variables-import-input');
    if (variablesInput) {
      variablesInput.addEventListener('change', e => {
        this.handleVariablesImport(e);
      });
    }
  },

  /**
   * 获取提示词标题
   * @param {string} key - 提示词键名
   * @returns {string} 标题
   */
  getPromptTitle(key) {
    const titles = {
      systemRole: '🎭 系统角色',
      narrativeRules: '📖 叙事规则',
      outputStructure: '📋 输出结构',
      outputFormat: '🔄 变量更新格式 (MVU)',
      updateRules: '📏 变量更新规则',
      battleTrigger: '⚔️ 战斗触发',
    };
    return titles[key] || key;
  },

  /**
   * 打开提示词编辑模态框
   * @param {string} promptKey - 提示词键名
   */
  openPromptEditModal(promptKey) {
    const promptValue = MVU_PROMPTS[promptKey] || '';
    const title = this.getPromptTitle(promptKey);

    // 创建编辑模态框
    const modalHtml = `
      <div class="modal-overlay active" id="prompt-edit-modal">
        <div class="glass-panel modal prompt-edit-modal">
          <div class="decorative-border top-left"></div>
          <div class="decorative-border top-right"></div>
          <div class="decorative-border bottom-left"></div>
          <div class="decorative-border bottom-right"></div>
          <button class="modal-close-btn" onclick="VariablesUI.closePromptEditModal()">&times;</button>
          <h4>编辑 ${title}</h4>
          <div class="prompt-edit-content">
            <textarea id="prompt-edit-textarea" class="input-field prompt-textarea ${promptKey === 'outputFormat' ? 'code-textarea' : ''}" rows="15"></textarea>
          </div>
          <div class="prompt-edit-actions">
            <button class="btn btn-ghost" onclick="VariablesUI.resetSinglePrompt('${promptKey}')">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              恢复默认
            </button>
            <button class="btn btn-secondary" onclick="VariablesUI.closePromptEditModal()">取消</button>
            <button class="btn btn-primary" onclick="VariablesUI.savePromptFromModal('${promptKey}')">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              保存
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 设置textarea的值（不使用HTML模板插值，避免转义问题）
    const textarea = document.getElementById('prompt-edit-textarea');
    if (textarea) {
      textarea.value = promptValue;
      textarea.focus();
      // 将光标移到末尾
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  },

  /**
   * 关闭提示词编辑模态框
   */
  closePromptEditModal() {
    const modal = document.getElementById('prompt-edit-modal');
    if (modal) {
      modal.remove();
    }
  },

  /**
   * 从模态框保存提示词
   * @param {string} promptKey - 提示词键名
   */
  savePromptFromModal(promptKey) {
    const textarea = document.getElementById('prompt-edit-textarea');
    if (!textarea) return;

    const newValue = textarea.value;
    MVU_PROMPTS[promptKey] = newValue;

    // 保存到本地存储
    this.savePromptsToStorage();

    // 更新预览区域
    this.updatePromptPreview(promptKey);

    // 关闭模态框
    this.closePromptEditModal();

    showToast('提示词已保存');
  },

  /**
   * 重置单个提示词为默认值
   * @param {string} promptKey - 提示词键名
   */
  resetSinglePrompt(promptKey) {
    if (!confirm('确定要将此提示词重置为默认值吗？')) {
      return;
    }

    const defaultValue = DEFAULT_MVU_PROMPTS[promptKey];
    if (defaultValue !== undefined) {
      // 更新 textarea
      const textarea = document.getElementById('prompt-edit-textarea');
      if (textarea) {
        textarea.value = defaultValue;
      }
      showToast('已恢复默认值，请点击保存确认');
    }
  },

  /**
   * 更新提示词预览区域
   * @param {string} promptKey - 提示词键名
   */
  updatePromptPreview(promptKey) {
    const previewId = this.getPromptPreviewId(promptKey);
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.textContent = MVU_PROMPTS[promptKey] || '';
    }
  },

  /**
   * 获取提示词预览元素ID
   * @param {string} promptKey - 提示词键名
   * @returns {string} 预览元素ID
   */
  getPromptPreviewId(promptKey) {
    const ids = {
      systemRole: 'prompt-system-role-preview',
      narrativeRules: 'prompt-narrative-rules-preview',
      outputStructure: 'prompt-output-structure-preview',
      outputFormat: 'prompt-output-format-preview',
      updateRules: 'prompt-update-rules-preview',
      battleTrigger: 'prompt-battle-trigger-preview',
    };
    return ids[promptKey] || '';
  },

  /**
   * 保存所有提示词
   */
  saveAllPrompts() {
    try {
      // 保存到本地存储
      this.savePromptsToStorage();

      showToast('所有提示词已保存');
    } catch (error) {
      console.error('保存提示词失败:', error);
      showToast('保存提示词失败');
    }
  },

  /**
   * 重置所有提示词为默认值
   */
  resetAllPrompts() {
    if (!confirm('确定要重置所有提示词为默认值吗？')) {
      return;
    }

    try {
      // 从默认模板恢复
      MVU_PROMPTS.systemRole = DEFAULT_MVU_PROMPTS.systemRole;
      MVU_PROMPTS.narrativeRules = DEFAULT_MVU_PROMPTS.narrativeRules;
      MVU_PROMPTS.outputStructure = DEFAULT_MVU_PROMPTS.outputStructure;
      MVU_PROMPTS.outputFormat = DEFAULT_MVU_PROMPTS.outputFormat;
      MVU_PROMPTS.updateRules = DEFAULT_MVU_PROMPTS.updateRules;
      MVU_PROMPTS.battleTrigger = DEFAULT_MVU_PROMPTS.battleTrigger;

      // 保存并刷新界面
      this.savePromptsToStorage();
      this.renderPromptsSection();

      showToast('提示词已重置为默认值');
    } catch (error) {
      console.error('重置提示词失败:', error);
      showToast('重置提示词失败');
    }
  },

  /**
   * 切换提示词预览
   */
  togglePromptPreview() {
    const previewSection = document.getElementById('prompt-preview-section');
    const previewContent = document.getElementById('full-prompt-preview');

    if (!previewSection || !previewContent) return;

    if (previewSection.style.display === 'none') {
      // 生成完整提示词预览
      const fullPrompt = this.generateFullPromptPreview();
      previewContent.textContent = fullPrompt;
      previewSection.style.display = 'block';
    } else {
      previewSection.style.display = 'none';
    }
  },

  /**
   * 生成完整提示词预览
   * @returns {string} 完整提示词文本
   */
  generateFullPromptPreview() {
    const vars = GameVariables;
    const char = GameState.character;

    let prompt = MVU_PROMPTS.systemRole + '\n\n';

    prompt += `# 当前角色信息
姓名：${char.name || '冒险者'}
职业：${vars.status.profession}
种族：${typeof getRaceLabel === 'function' ? getRaceLabel(char.race) : char.race || '人类'}
等级：Lv.${vars.battle.level}
生命值：${vars.battle.core.hp}/${vars.battle.core.max_hp}
金币：${char.gold || 0}
当前时间：${vars.status.time}
当前位置：${vars.status.location_weather}
`;

    if (char.appearance) {
      prompt += `外貌：${char.appearance}\n`;
    }
    if (char.background) {
      prompt += `背景故事：${char.background}\n`;
    }

    prompt += `\n# 当前穿着
上身：${vars.status.clothing.upper_body}
下身：${vars.status.clothing.lower_body}
脚部：${vars.status.clothing.feet}
`;

    if (GameState.world.prompt) {
      prompt += `\n# 世界设定\n${GameState.world.prompt}\n`;
    }

    prompt += '\n' + MVU_PROMPTS.narrativeRules + '\n';
    prompt += '\n' + MVU_PROMPTS.outputStructure + '\n';
    prompt += '\n' + MVU_PROMPTS.outputFormat + '\n';
    prompt += '\n' + MVU_PROMPTS.updateRules + '\n';
    prompt += '\n' + MVU_PROMPTS.battleTrigger;

    return prompt;
  },

  /**
   * 复制完整提示词
   */
  copyFullPrompt() {
    const fullPrompt = this.generateFullPromptPreview();
    navigator.clipboard
      .writeText(fullPrompt)
      .then(() => showToast('提示词已复制到剪贴板'))
      .catch(() => showToast('复制失败'));
  },

  /**
   * 保存提示词到本地存储
   */
  savePromptsToStorage() {
    try {
      const promptsData = {
        systemRole: MVU_PROMPTS.systemRole,
        narrativeRules: MVU_PROMPTS.narrativeRules,
        outputStructure: MVU_PROMPTS.outputStructure,
        outputFormat: MVU_PROMPTS.outputFormat,
        updateRules: MVU_PROMPTS.updateRules,
        battleTrigger: MVU_PROMPTS.battleTrigger,
      };
      localStorage.setItem('dreamweaver_prompts', JSON.stringify(promptsData));
    } catch (error) {
      console.error('保存提示词到存储失败:', error);
    }
  },

  /**
   * 从本地存储加载提示词
   */
  loadPromptsFromStorage() {
    try {
      const saved = localStorage.getItem('dreamweaver_prompts');
      if (saved) {
        const promptsData = JSON.parse(saved);
        if (promptsData.systemRole) MVU_PROMPTS.systemRole = promptsData.systemRole;
        if (promptsData.narrativeRules) MVU_PROMPTS.narrativeRules = promptsData.narrativeRules;
        if (promptsData.outputStructure) MVU_PROMPTS.outputStructure = promptsData.outputStructure;
        if (promptsData.outputFormat) MVU_PROMPTS.outputFormat = promptsData.outputFormat;
        if (promptsData.updateRules) MVU_PROMPTS.updateRules = promptsData.updateRules;
        if (promptsData.battleTrigger) MVU_PROMPTS.battleTrigger = promptsData.battleTrigger;
        console.log('已从存储加载自定义提示词');
      }
    } catch (error) {
      console.error('加载提示词失败:', error);
    }
  },

  /**
   * 处理世界书导入
   */
  async handleWorldbookImport(event) {
    const file = event.target.files[0];
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
        entries = Object.entries(data).map(([key, value]) => ({
          key,
          ...value,
        }));
      }

      GameState.world.entries = entries;
      GameState.world.isLoaded = true;

      showToast(`成功导入 ${entries.length} 条世界书条目`);
      this.renderWorldbookSection();
    } catch (error) {
      showToast('导入失败：文件格式不正确');
      console.error('世界书导入错误:', error);
    }

    event.target.value = '';
  },

  /**
   * 清除世界书（保留用户世界信息）
   */
  clearWorldbook() {
    if (confirm('确定要清除其他世界书条目吗？（用户世界设定将保留）')) {
      // 保留用户世界信息条目
      const userWorldEntry = GameState.world.entries.find(
        entry => entry.isUserWorldInfo || entry.key === '__user_world_info__',
      );

      GameState.world.entries = userWorldEntry ? [userWorldEntry] : [];
      this.renderWorldbookSection();
      showToast('其他世界书条目已清除');
    }
  },

  /**
   * 保存MVU提示词
   */
  saveMvuPrompts() {
    const formatTextarea = document.getElementById('mvu-output-format');
    if (formatTextarea) {
      MVU_PROMPTS.outputFormat = formatTextarea.value;
      SaveSystem.saveSettings();
      showToast('MVU提示词已保存');
    }
  },

  /**
   * 重置MVU提示词
   */
  resetMvuPrompts() {
    if (confirm('确定要重置MVU提示词为默认值吗？')) {
      MVU_PROMPTS.outputFormat = `<UpdateVariable>
<Analysis>$(IN ENGLISH, no more than 80 words)
- \${calculate time passed: ...}
- \${decide whether dramatic updates are allowed as it's in a special case or the time passed is more than usual: yes/no}
- \${analyze every variable based on its corresponding check, according only to current reply instead of previous plots: ...}
</Analysis>
<JSONPatch>
[
  { "op": "replace", "path": "\${/path/to/variable}", "value": "\${new_value}" },
  { "op": "add", "path": "\${/path/to/object/new_key}", "value": "\${new_value}" }
  { "op": "remove", "path": "\${/path/to/array/0}" },
  ...
]
</JSONPatch>
</UpdateVariable>`;

      const formatTextarea = document.getElementById('mvu-output-format');
      if (formatTextarea) {
        formatTextarea.value = MVU_PROMPTS.outputFormat;
      }

      SaveSystem.saveSettings();
      showToast('MVU提示词已重置');
    }
  },

  /**
   * 导出变量
   */
  exportVariables() {
    const dataStr = JSON.stringify(GameVariables, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game_variables_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('变量已导出');
  },

  /**
   * 处理变量导入
   */
  async handleVariablesImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // 合并导入的变量
      if (data.status) Object.assign(GameVariables.status, data.status);
      if (data.battle) Object.assign(GameVariables.battle, data.battle);
      if (data.factions) Object.assign(GameVariables.factions, data.factions);
      if (data.npcs) Object.assign(GameVariables.npcs, data.npcs);
      if (data.reward) Object.assign(GameVariables.reward, data.reward);

      showToast('变量导入成功');
      this.refreshContent(this.currentTab);

      // 更新JSON预览
      const jsonPreview = document.getElementById('variables-json-preview');
      if (jsonPreview) {
        jsonPreview.textContent = JSON.stringify(GameVariables, null, 2);
      }
    } catch (error) {
      showToast('导入失败：文件格式不正确');
      console.error('变量导入错误:', error);
    }

    event.target.value = '';
  },

  /**
   * 编辑服装（打开编辑对话框）
   */
  editClothing() {
    const clothing = GameVariables.status.clothing;
    const slots = [
      { key: 'head', label: '头部' },
      { key: 'neck', label: '颈部' },
      { key: 'hands', label: '手部' },
      { key: 'upper_body', label: '上身' },
      { key: 'lower_body', label: '下身' },
      { key: 'underwear', label: '内衣' },
      { key: 'legs', label: '腿部' },
      { key: 'feet', label: '脚部' },
    ];

    // 创建模态框
    const modalHtml = `
      <div class="modal-overlay active" id="clothing-edit-modal">
        <div class="glass-panel modal clothing-modal">
          <h2 class="page-title">编辑服装</h2>
          <form id="clothing-edit-form">
            ${slots
              .map(
                slot => `
              <div class="input-group">
                <label for="clothing-${slot.key}">${slot.label}</label>
                <input type="text" id="clothing-${slot.key}" class="input-field" value="${clothing[slot.key]}" />
              </div>
            `,
              )
              .join('')}
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="VariablesUI.closeClothingModal()">取消</button>
              <button type="submit" class="btn btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 绑定表单提交
    const form = document.getElementById('clothing-edit-form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      slots.forEach(slot => {
        const input = document.getElementById(`clothing-${slot.key}`);
        if (input) {
          GameVariables.status.clothing[slot.key] = input.value;
        }
      });
      this.closeClothingModal();
      this.renderClothingPreview();
      showToast('服装已更新');
    });
  },

  /**
   * 关闭服装编辑模态框
   */
  closeClothingModal() {
    const modal = document.getElementById('clothing-edit-modal');
    if (modal) {
      modal.remove();
    }
  },

  /**
   * 应用JSON Patch更新（带事务回滚机制）
   * @param {Array} patches - JSON Patch操作数组
   * @returns {boolean} - 是否成功应用所有patches
   */
  applyJsonPatch(patches) {
    if (!Array.isArray(patches)) {
      console.error('Invalid patches format');
      return false;
    }

    // 创建回滚快照（深拷贝当前状态）
    const snapshot = JSON.parse(JSON.stringify(GameVariables));
    const appliedChanges = []; // 记录成功应用的变更
    const success = true;

    try {
      for (let i = 0; i < patches.length; i++) {
        const patch = patches[i];
        const { op, path, value } = patch;
        const pathParts = path.split('/').filter(p => p);

        // 跳过只读字段
        if (pathParts[0] === '_' || pathParts[0].startsWith('_')) {
          console.warn('Skipping readonly field:', path);
          continue;
        }

        // 获取旧值用于事件派发
        let oldValue;
        try {
          oldValue = this.getValueByPath(GameVariables, pathParts);
        } catch (e) {
          oldValue = undefined;
        }

        let target = GameVariables;
        const lastKey = pathParts.pop();

        // 导航到目标路径
        for (const key of pathParts) {
          if (target[key] === undefined) {
            if (op === 'add') {
              target[key] = {};
            } else {
              console.warn('Path not found:', path);
              throw new Error(`Path not found: ${path}`);
            }
          }
          target = target[key];
        }

        // 执行操作
        let newValue;
        switch (op) {
          case 'replace':
          case 'add':
            if (Array.isArray(target) && lastKey === '-') {
              target.push(value);
              newValue = value;
            } else {
              target[lastKey] = value;
              newValue = value;
            }
            break;
          case 'remove':
            if (Array.isArray(target)) {
              newValue = undefined;
              target.splice(parseInt(lastKey), 1);
            } else {
              newValue = undefined;
              delete target[lastKey];
            }
            break;
          default:
            console.warn('Unknown operation:', op);
            continue;
        }

        // 记录变更用于事件派发
        appliedChanges.push({
          path: path,
          op: op,
          oldValue: oldValue,
          newValue: newValue,
        });
      }

      // 所有patches成功应用，触发变更事件
      if (typeof VariableChangeEmitter !== 'undefined' && appliedChanges.length > 0) {
        VariableChangeEmitter.emitBatch(appliedChanges);
      }

      return true;
    } catch (error) {
      console.error('Error applying patches, rolling back:', error);

      // 回滚到快照状态
      this.restoreFromSnapshot(snapshot);

      // 记录回滚
      console.warn(`Transaction rolled back. ${appliedChanges.length} changes reverted.`);

      return false;
    }
  },

  /**
   * 根据路径获取值
   * @param {Object} obj - 目标对象
   * @param {Array} pathParts - 路径部分数组
   * @returns {*} - 获取到的值
   */
  getValueByPath(obj, pathParts) {
    let current = obj;
    for (const part of pathParts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }
    return current;
  },

  /**
   * 从快照恢复状态
   * @param {Object} snapshot - 状态快照
   */
  restoreFromSnapshot(snapshot) {
    // 恢复status
    if (snapshot.status) {
      Object.keys(snapshot.status).forEach(key => {
        GameVariables.status[key] = snapshot.status[key];
      });
    }

    // 恢复battle
    if (snapshot.battle) {
      Object.keys(snapshot.battle).forEach(key => {
        GameVariables.battle[key] = snapshot.battle[key];
      });
    }

    // 恢复factions
    if (snapshot.factions) {
      Object.keys(snapshot.factions).forEach(key => {
        GameVariables.factions[key] = snapshot.factions[key];
      });
    }

    // 恢复npcs
    if (snapshot.npcs) {
      GameVariables.npcs = snapshot.npcs;
    }

    // 恢复reward
    if (snapshot.reward) {
      Object.keys(snapshot.reward).forEach(key => {
        GameVariables.reward[key] = snapshot.reward[key];
      });
    }
  },

  /**
   * 解析AI响应中的变量更新
   * @param {string} response - AI响应文本
   */
  parseVariableUpdate(response) {
    const updateMatch = response.match(/<UpdateVariable>([\s\S]*?)<\/UpdateVariable>/);
    if (!updateMatch) return null;

    const updateContent = updateMatch[1];
    const patchMatch = updateContent.match(/<JSONPatch>([\s\S]*?)<\/JSONPatch>/);
    if (!patchMatch) return null;

    try {
      const patches = JSON.parse(patchMatch[1]);
      return patches;
    } catch (error) {
      console.error('Error parsing JSON Patch:', error);
      return null;
    }
  },

  /**
   * 处理AI响应并更新变量
   * @param {string} response - AI响应文本
   */
  handleAiResponse(response) {
    const patches = this.parseVariableUpdate(response);
    if (patches) {
      const success = this.applyJsonPatch(patches);
      if (success) {
        console.log('Variables updated successfully');
        this.refreshContent(this.currentTab);
      }
    }
    return response;
  },

  /**
   * 显示变量界面
   */
  show() {
    navigateTo('variables');
    this.switchTab('status');
  },
};

// 导出
window.VariablesUI = VariablesUI;
