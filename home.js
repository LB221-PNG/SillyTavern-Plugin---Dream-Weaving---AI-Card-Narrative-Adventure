/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 开始界面
 * ============================================================ */

/**
 * 开始界面模块
 */
const HomeUI = {
  /**
   * 初始化开始界面
   */
  init() {
    this.bindEvents();
    this.checkSaveGame();
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 新游戏按钮
    const newGameBtn = document.getElementById('btn-new-game');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        this.startNewGame();
      });
    }

    // 加载存档按钮
    const loadGameBtn = document.getElementById('btn-load-game');
    if (loadGameBtn) {
      loadGameBtn.addEventListener('click', () => {
        this.showLoadArchiveModal();
      });
    }

    // 设置按钮
    const settingsBtn = document.getElementById('btn-settings-home');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        navigateTo('settings');
      });
    }

    // 绑定存档选择模态框事件
    this.bindArchiveModalEvents();
  },

  // 当前待删除的存档名称
  _pendingDeleteArchive: null,

  /**
   * 绑定存档选择模态框事件
   */
  bindArchiveModalEvents() {
    const overlay = document.getElementById('load-archive-overlay');
    const closeBtn = document.getElementById('btn-close-load-archive');
    const importBtn = document.getElementById('btn-import-archive');
    const importInput = document.getElementById('import-archive-input');
    const newArchiveBtn = document.getElementById('btn-create-new-archive');
    const newArchiveInput = document.getElementById('new-archive-name-input');
    const confirmNewBtn = document.getElementById('btn-confirm-new-archive');
    const cancelNewBtn = document.getElementById('btn-cancel-new-archive');

    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) {
          this.hideLoadArchiveModal();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideLoadArchiveModal();
      });
    }

    // 导入存档按钮
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => {
        importInput.click();
      });

      importInput.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (file) {
          const success = await SaveSystem.importSave(file);
          if (success) {
            this.renderArchiveList();
            this.checkSaveGame();
          }
          importInput.value = '';
        }
      });
    }

    // 新建存档按钮
    if (newArchiveBtn) {
      newArchiveBtn.addEventListener('click', () => {
        this.showNewArchiveInput();
      });
    }

    // 确认新建存档
    if (confirmNewBtn && newArchiveInput) {
      confirmNewBtn.addEventListener('click', () => {
        const name = newArchiveInput.value.trim();
        if (name) {
          if (SaveSystem.createNewArchive(name)) {
            this.hideNewArchiveInput();
            this.renderArchiveList();
            this.checkSaveGame();
            // 直接进入新游戏流程
            this.startNewGame();
            this.hideLoadArchiveModal();
          }
        } else {
          showToast('请输入存档名称');
        }
      });

      // 回车确认
      newArchiveInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          confirmNewBtn.click();
        } else if (e.key === 'Escape') {
          this.hideNewArchiveInput();
        }
      });
    }

    // 取消新建存档
    if (cancelNewBtn) {
      cancelNewBtn.addEventListener('click', () => {
        this.hideNewArchiveInput();
      });
    }

    // 模态框关闭按钮
    const modalCloseBtn = document.querySelector('#load-archive-modal .modal-close-btn');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        this.hideLoadArchiveModal();
      });
    }

    // 绑定删除确认模态框事件
    this.bindDeleteConfirmEvents();
  },

  // 删除回调
  _deleteCallback: null,

  /**
   * 绑定删除确认模态框事件
   */
  bindDeleteConfirmEvents() {
    const overlay = document.getElementById('delete-confirm-overlay');
    const confirmBtn = document.getElementById('btn-confirm-delete');
    const cancelBtn = document.getElementById('btn-cancel-delete');
    const closeBtn = document.querySelector('#delete-confirm-modal .modal-close-btn');

    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) {
          this.hideDeleteConfirmModal();
        }
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (this._pendingDeleteArchive) {
          // 添加删除动画
          const item = document.querySelector(
            `.archive-item[data-archive-name="${this._escapeHtml(this._pendingDeleteArchive)}"]`,
          );
          const settingsItem = document.querySelector(
            `.settings-archive-item[data-archive-name="${this._escapeHtml(this._pendingDeleteArchive)}"]`,
          );
          if (item) {
            item.classList.add('deleting');
          }
          if (settingsItem) {
            settingsItem.classList.add('deleting');
          }

          setTimeout(() => {
            if (SaveSystem.deleteSave(this._pendingDeleteArchive)) {
              this.renderArchiveList();
              this.checkSaveGame();
              // 执行回调
              if (this._deleteCallback && typeof this._deleteCallback === 'function') {
                this._deleteCallback();
                this._deleteCallback = null;
              }
            }
            this._pendingDeleteArchive = null;
            this.hideDeleteConfirmModal();
          }, 300);
        }
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hideDeleteConfirmModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideDeleteConfirmModal();
      });
    }
  },

  /**
   * 显示新建存档输入框
   */
  showNewArchiveInput() {
    const inputGroup = document.getElementById('new-archive-input-group');
    const input = document.getElementById('new-archive-name-input');
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
    const inputGroup = document.getElementById('new-archive-input-group');
    if (inputGroup) {
      inputGroup.style.display = 'none';
    }
  },

  /**
   * 检查是否有存档
   */
  checkSaveGame() {
    const loadGameBtn = document.getElementById('btn-load-game');
    if (loadGameBtn) {
      if (SaveSystem.hasSave()) {
        loadGameBtn.disabled = false;
        loadGameBtn.title = '点击查看所有存档';

        // 显示存档数量
        const archives = SaveSystem.getAllArchives();
        const count = Object.keys(archives).length;
        loadGameBtn.title = `${count} 个可用存档`;
      } else {
        loadGameBtn.disabled = false; // 允许点击以创建新存档或导入
        loadGameBtn.title = '加载存档或导入存档文件';
      }
    }
  },

  /**
   * 开始新游戏
   */
  startNewGame() {
    // 重置状态
    resetCharacterState();
    resetWorldState();
    resetBattleState();

    // 清空叙事
    if (typeof NarrativeSystem !== 'undefined') {
      NarrativeSystem.clear();
    }

    // 跳转到角色创建页面
    navigateTo('character');
  },

  /**
   * 显示加载存档模态框
   */
  showLoadArchiveModal() {
    const overlay = document.getElementById('load-archive-overlay');
    if (overlay) {
      this.renderArchiveList();
      overlay.classList.add('active');
    }
  },

  /**
   * 隐藏加载存档模态框
   */
  hideLoadArchiveModal() {
    const overlay = document.getElementById('load-archive-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    this.hideNewArchiveInput();
  },

  /**
   * 渲染存档列表
   */
  renderArchiveList() {
    const container = document.getElementById('archive-list-container');
    if (!container) return;

    const archives = SaveSystem.getAllArchives();
    const archiveNames = Object.keys(archives);

    if (archiveNames.length === 0) {
      container.innerHTML = `
        <div class="empty-archive-hint">
          <p>暂无存档</p>
          <p class="hint-sub">点击"新建存档"开始新冒险，或"导入存档"加载现有存档</p>
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

        return `
        <div class="archive-item" data-archive-name="${this._escapeHtml(name)}">
          <div class="archive-info">
            <div class="archive-name">${this._escapeHtml(name)}</div>
            <div class="archive-details">
              <span class="archive-char">${this._escapeHtml(info.characterName)}</span>
              <span class="archive-floor">第${info.floor}层</span>
              <span class="archive-hp">❤️ ${info.hp}/${info.maxHp}</span>
              <span class="archive-time">${dateStr}</span>
            </div>
          </div>
          <div class="archive-actions">
            <button class="btn btn-primary btn-small archive-load-btn" title="加载存档">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              加载
            </button>
            <button class="btn btn-secondary btn-small archive-export-btn" title="导出存档">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              导出
            </button>
            <button class="btn btn-small archive-delete-btn" title="删除存档">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px">
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

    // 绑定加载、导出和删除事件
    container.querySelectorAll('.archive-item').forEach(item => {
      const archiveName = item.dataset.archiveName;

      // 加载按钮
      item.querySelector('.archive-load-btn').addEventListener('click', e => {
        e.stopPropagation();
        this.loadArchive(archiveName);
      });

      // 导出按钮
      const exportBtn = item.querySelector('.archive-export-btn');
      if (exportBtn) {
        exportBtn.addEventListener('click', e => {
          e.stopPropagation();
          this.exportSingleArchive(archiveName);
        });
      }

      // 删除按钮
      item.querySelector('.archive-delete-btn').addEventListener('click', e => {
        e.stopPropagation();
        this.confirmDeleteArchive(archiveName);
      });

      // 点击整行加载（但排除操作按钮区域）
      item.querySelector('.archive-info').addEventListener('click', () => {
        this.loadArchive(archiveName);
      });
    });
  },

  /**
   * 加载指定存档
   */
  loadArchive(archiveName) {
    if (SaveSystem.load(archiveName)) {
      this.hideLoadArchiveModal();

      // 根据存档状态决定跳转页面
      if (GameState.currentPage === 'game' || GameState.world.isLoaded) {
        navigateTo('game');

        // 更新UI
        if (typeof GameUI !== 'undefined') {
          GameUI.updateCharacterPanel();
        }
        if (typeof NarrativeSystem !== 'undefined') {
          NarrativeSystem.render();
        }
      } else {
        navigateTo('character');
      }
    }
  },

  /**
   * 显示删除确认模态框
   */
  showDeleteConfirmModal(archiveName) {
    this._pendingDeleteArchive = archiveName;
    const overlay = document.getElementById('delete-confirm-overlay');
    const nameEl = document.getElementById('delete-archive-name');

    if (nameEl) {
      nameEl.textContent = archiveName;
    }

    if (overlay) {
      overlay.classList.add('active');
    }
  },

  /**
   * 隐藏删除确认模态框
   */
  hideDeleteConfirmModal() {
    const overlay = document.getElementById('delete-confirm-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    this._pendingDeleteArchive = null;
  },

  /**
   * 确认删除存档（使用自定义模态框）
   */
  confirmDeleteArchive(archiveName) {
    this.showDeleteConfirmModal(archiveName);
  },

  /**
   * 导出单个存档
   */
  exportSingleArchive(archiveName) {
    SaveSystem.exportSave(archiveName);
  },

  /**
   * HTML转义
   */
  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 显示版本信息
   */
  showVersionInfo() {
    const versionEl = document.querySelector('.version-info');
    if (versionEl) {
      versionEl.textContent = `版本 ${SaveSystem.VERSION} Alpha`;
    }
  },
};

// 导出
window.HomeUI = HomeUI;
