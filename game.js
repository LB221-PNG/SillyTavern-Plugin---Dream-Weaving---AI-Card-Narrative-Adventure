/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 主界面 - 增强版消息交互
 * ============================================================ */

/**
 * 主游戏界面模块
 */
const GameUI = {
  // 消息历史记录
  messageHistory: [],
  historyIndex: -1,
  isInputExpanded: false,

  /**
   * 初始化主界面
   */
  init() {
    this.bindEvents();
    this.initMessageInput();
    this.initCollapsibleSections();
    this.initContextMenu();
    this.initSidebar();
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 查看卡组按钮
    const viewDeckBtn = document.getElementById('btn-view-deck');
    if (viewDeckBtn) {
      viewDeckBtn.addEventListener('click', () => {
        if (typeof DeckUI !== 'undefined') {
          DeckUI.showModal();
        }
      });
    }

    // 游戏内设置按钮
    const gameSettingsBtn = document.getElementById('btn-game-settings');
    if (gameSettingsBtn) {
      gameSettingsBtn.addEventListener('click', () => {
        navigateTo('settings');
      });
    }

    // 返回主菜单按钮
    const returnHomeBtn = document.getElementById('btn-return-home');
    if (returnHomeBtn) {
      returnHomeBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        console.log('返回主菜单按钮被点击');
        this.returnToMainMenu();
      });
    }

    // 注意：Ctrl+S快捷键已在app.js中全局绑定，此处不再重复

    // 分支选择按钮
    const branchToggleBtn = document.getElementById('branch-toggle-btn');
    if (branchToggleBtn) {
      branchToggleBtn.addEventListener('click', () => {
        this.toggleBranchingOptions();
      });
    }

    // 侧边栏切换按钮
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggleBtn) {
      sidebarToggleBtn.addEventListener('click', () => {
        this.openSidebar();
      });
    }

    // 侧边栏关闭按钮
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', () => {
        this.closeSidebar();
      });
    }

    // 侧边栏遮罩点击关闭
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        this.closeSidebar();
      });
    }
  },

  /**
   * 初始化消息输入框
   */
  initMessageInput() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message-button');
    const expandBtn = document.getElementById('expand-input-btn');

    if (messageInput) {
      // 自动调整高度
      messageInput.addEventListener('input', () => {
        this.autoResizeInput(messageInput);
      });

      // 键盘事件
      messageInput.addEventListener('keydown', e => {
        // Enter发送，Shift+Enter换行
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }

        // Ctrl+Enter换行
        if (e.key === 'Enter' && e.ctrlKey) {
          const start = messageInput.selectionStart;
          const end = messageInput.selectionEnd;
          messageInput.value = messageInput.value.substring(0, start) + '\n' + messageInput.value.substring(end);
          messageInput.selectionStart = messageInput.selectionEnd = start + 1;
          this.autoResizeInput(messageInput);
          e.preventDefault();
        }

        // 上下箭头浏览历史
        if (e.key === 'ArrowUp' && messageInput.selectionStart === 0 && !e.shiftKey) {
          e.preventDefault();
          this.navigateMessageHistory('up');
        }

        if (e.key === 'ArrowDown' && messageInput.selectionStart === messageInput.value.length && !e.shiftKey) {
          e.preventDefault();
          this.navigateMessageHistory('down');
        }
      });
    }

    // 发送按钮
    if (sendButton) {
      sendButton.addEventListener('click', () => {
        this.sendMessage();
      });
    }

    // 展开/收起按钮
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        this.toggleInputExpansion();
      });
    }
  },

  /**
   * 自动调整输入框高度
   */
  autoResizeInput(textarea) {
    textarea.style.height = 'auto';
    const maxHeight = this.isInputExpanded ? 200 : 50;
    if (textarea.scrollHeight > maxHeight) {
      textarea.style.height = maxHeight + 'px';
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.height = textarea.scrollHeight + 'px';
      textarea.style.overflowY = 'hidden';
    }
  },

  /**
   * 切换输入框展开状态
   */
  toggleInputExpansion() {
    const messageInput = document.getElementById('message-input');
    const expandBtn = document.getElementById('expand-input-btn');

    this.isInputExpanded = !this.isInputExpanded;

    if (messageInput) {
      if (this.isInputExpanded) {
        messageInput.style.maxHeight = '200px';
        messageInput.style.height = '150px';
      } else {
        messageInput.style.maxHeight = '50px';
        messageInput.style.height = 'auto';
      }
    }

    if (expandBtn) {
      expandBtn.innerHTML = this.isInputExpanded
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
    }
  },

  /**
   * 发送消息
   */
  sendMessage() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message-button');

    if (!messageInput) return;

    const message = messageInput.value.trim();
    if (!message) return;

    // 禁用发送按钮
    if (sendButton) {
      sendButton.disabled = true;
    }

    // 添加到历史记录
    this.addToMessageHistory(message);

    // 清空输入框
    messageInput.value = '';
    this.autoResizeInput(messageInput);

    // 通过叙事系统处理
    if (typeof NarrativeSystem !== 'undefined') {
      NarrativeSystem.processInput(message).finally(() => {
        if (sendButton) {
          sendButton.disabled = false;
        }
      });
    } else if (sendButton) {
      sendButton.disabled = false;
    }
  },

  /**
   * 添加到消息历史
   */
  addToMessageHistory(message) {
    if (!message || this.messageHistory[0] === message) return;

    this.messageHistory.unshift(message);

    if (this.messageHistory.length > 50) {
      this.messageHistory.pop();
    }

    this.historyIndex = -1;
  },

  /**
   * 浏览消息历史
   */
  navigateMessageHistory(direction) {
    const messageInput = document.getElementById('message-input');
    if (!messageInput) return;

    if (direction === 'up') {
      if (this.historyIndex < this.messageHistory.length - 1) {
        this.historyIndex++;
        messageInput.value = this.messageHistory[this.historyIndex];
      }
    } else if (direction === 'down') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        messageInput.value = this.messageHistory[this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        messageInput.value = '';
      }
    }
  },

  /**
   * 初始化可折叠区块
   */
  initCollapsibleSections() {
    const clickableHeaders = document.querySelectorAll('.section-header-mini.clickable');

    clickableHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const targetId = header.getAttribute('data-target');
        const content = document.getElementById(targetId);

        if (content) {
          content.classList.toggle('collapsed');
          header.classList.toggle('expanded');
        }
      });
    });
  },

  /**
   * 初始化侧边栏
   */
  initSidebar() {
    // ESC键关闭侧边栏
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeSidebar();
      }
    });
  },

  /**
   * 打开侧边栏
   */
  openSidebar() {
    const sidebar = document.getElementById('status-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');

    if (sidebar) {
      sidebar.classList.add('open');
      sidebar.classList.remove('collapsed');
    }
    if (overlay) {
      overlay.classList.add('visible');
    }
    if (toggleBtn) {
      toggleBtn.style.opacity = '0';
      toggleBtn.style.pointerEvents = 'none';
    }
  },

  /**
   * 关闭侧边栏
   */
  closeSidebar() {
    const sidebar = document.getElementById('status-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');

    if (sidebar) {
      sidebar.classList.remove('open');
      sidebar.classList.add('collapsed');
    }
    if (overlay) {
      overlay.classList.remove('visible');
    }
    if (toggleBtn) {
      toggleBtn.style.opacity = '1';
      toggleBtn.style.pointerEvents = 'auto';
    }
  },

  /**
   * 切换侧边栏
   */
  toggleSidebar() {
    const sidebar = document.getElementById('status-sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  },

  /**
   * 初始化上下文菜单
   */
  initContextMenu() {
    const contextMenu = document.getElementById('message-context-menu');
    if (!contextMenu) return;

    // 绑定消息右键事件
    document.addEventListener('contextmenu', e => {
      const logEntry = e.target.closest('.log-entry');
      if (logEntry && !logEntry.classList.contains('system')) {
        e.preventDefault();
        this.showContextMenu(e, logEntry);
      }
    });

    // 点击其他地方关闭
    document.addEventListener('click', () => {
      contextMenu.style.display = 'none';
    });

    // 绑定菜单项事件
    const copyBtn = document.getElementById('ctx-copy-btn');
    const editBtn = document.getElementById('ctx-edit-btn');
    const regenerateBtn = document.getElementById('ctx-regenerate-btn');
    const deleteBtn = document.getElementById('ctx-delete-btn');
    const summarizeBtn = document.getElementById('ctx-summarize-btn');
    const reapplyBtn = document.getElementById('ctx-reapply-btn');

    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyCurrentMessage());
    }
    if (editBtn) {
      editBtn.addEventListener('click', () => this.editCurrentMessage());
    }
    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => this.regenerateCurrentMessage());
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteCurrentMessage());
    }
    if (summarizeBtn) {
      summarizeBtn.addEventListener('click', () => this.summarizeCurrentMessage());
    }
    if (reapplyBtn) {
      reapplyBtn.addEventListener('click', () => this.reapplyProcessing());
    }
  },

  /**
   * 显示上下文菜单
   */
  showContextMenu(event, messageElement) {
    const contextMenu = document.getElementById('message-context-menu');
    if (!contextMenu) return;

    this.currentMessageElement = messageElement;

    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.display = 'flex';

    // 根据消息类型调整菜单项
    const editBtn = document.getElementById('ctx-edit-btn');
    const regenerateBtn = document.getElementById('ctx-regenerate-btn');

    if (messageElement.classList.contains('user')) {
      if (editBtn) editBtn.style.display = 'block';
      if (regenerateBtn) regenerateBtn.style.display = 'none';
    } else {
      if (editBtn) editBtn.style.display = 'none';
      if (regenerateBtn) regenerateBtn.style.display = 'block';
    }
  },

  /**
   * 复制当前消息
   */
  copyCurrentMessage() {
    if (!this.currentMessageElement) return;

    const content = this.currentMessageElement.textContent;
    navigator.clipboard
      .writeText(content)
      .then(() => showToast('消息已复制到剪贴板'))
      .catch(() => showToast('复制失败'));
  },

  /**
   * 编辑当前消息
   */
  editCurrentMessage() {
    if (!this.currentMessageElement) return;

    const overlay = document.getElementById('message-editor-overlay');
    const textarea = document.getElementById('message-editor-textarea');
    const saveBtn = document.getElementById('save-message-edit-btn');

    if (overlay && textarea) {
      textarea.value = this.currentMessageElement.textContent;
      overlay.classList.add('visible');
      textarea.focus();

      if (saveBtn) {
        saveBtn.onclick = () => {
          this.currentMessageElement.textContent = textarea.value;
          overlay.classList.remove('visible');
          showToast('消息已修改');
        };
      }
    }
  },

  /**
   * 重新生成当前消息
   */
  regenerateCurrentMessage() {
    showToast('正在重新生成...');
    // TODO: 实现重新生成逻辑
  },

  /**
   * 删除当前消息
   */
  deleteCurrentMessage() {
    if (!this.currentMessageElement) return;

    if (confirm('确定要删除这条消息吗？')) {
      this.currentMessageElement.remove();
      showToast('消息已删除');
    }
  },

  /**
   * 总结当前消息
   */
  summarizeCurrentMessage() {
    showToast('正在总结...');
    // TODO: 实现总结逻辑
  },

  /**
   * 重新应用处理
   */
  reapplyProcessing() {
    showToast('正在重新处理...');
    // TODO: 实现重新处理逻辑
  },

  /**
   * 显示分支选项
   */
  toggleBranchingOptions() {
    const overlay = document.getElementById('branching-options-overlay');
    if (overlay) {
      overlay.classList.toggle('visible');
    }
  },

  /**
   * 更新角色面板（兼容新旧版本）
   * 支持新的状态侧边栏布局
   */
  updateCharacterPanel() {
    const char = GameState.character || {};
    const vars = GameVariables || {};
    const status = vars.status || {};
    const battle = vars.battle || {};
    const core = battle.core || {};

    // 更新名称
    const nameEl = document.getElementById('game-char-name');
    if (nameEl) {
      nameEl.textContent = char.name || '未命名';
    }

    // 更新职业和种族
    const classEl = document.getElementById('game-char-class');
    if (classEl) {
      const profession = status.profession || char.class || '冒险者';
      const professionDisplay = profession.split('，')[0].split(',')[0];
      const raceLabel = typeof getRaceLabel === 'function' ? getRaceLabel(char.race) : char.race || '人类';
      classEl.textContent = `${professionDisplay} / ${raceLabel}`;
    }

    // 更新生命值
    const hpDisplay = document.getElementById('hp-display');
    const hpBar = document.getElementById('hp-bar');
    const hp = core.hp ?? char.hp ?? 80;
    const maxHp = core.max_hp ?? char.maxHp ?? 80;

    if (hpDisplay) {
      hpDisplay.textContent = `${hp} / ${maxHp}`;
    }
    if (hpBar) {
      const hpPercent = maxHp > 0 ? (hp / maxHp) * 100 : 100;
      hpBar.style.width = `${Math.min(100, Math.max(0, hpPercent))}%`;

      // 根据生命值百分比设置颜色
      if (hpPercent <= 25) {
        hpBar.style.background = 'linear-gradient(90deg, #8b1e1e 0%, #c44536 100%)';
        hpBar.classList.add('critical');
        hpBar.classList.remove('low');
      } else if (hpPercent <= 50) {
        hpBar.style.background = 'linear-gradient(90deg, #c44536 0%, #d64545 100%)';
        hpBar.classList.add('low');
        hpBar.classList.remove('critical');
      } else {
        hpBar.style.background = 'linear-gradient(90deg, var(--blood-red) 0%, #d64545 100%)';
        hpBar.classList.remove('low', 'critical');
      }
    }

    // 更新金币
    const goldEl = document.getElementById('stat-gold');
    if (goldEl) {
      const gold = char.gold ?? 0;
      goldEl.textContent = gold;
      // 添加金币变化动画类
      if (goldEl.dataset.lastValue && parseInt(goldEl.dataset.lastValue) !== gold) {
        goldEl.classList.add('value-changed');
        setTimeout(() => goldEl.classList.remove('value-changed'), 500);
      }
      goldEl.dataset.lastValue = gold;
    }

    // 更新层数
    const floorEl = document.getElementById('stat-floor');
    if (floorEl) {
      floorEl.textContent = char.floor ?? 1;
    }

    // 更新等级
    const levelEl = document.getElementById('stat-level');
    if (levelEl) {
      levelEl.textContent = battle.level ?? 1;
    }

    // 更新状态侧边栏（新版）
    this.updateStatusSidebar();
  },

  /**
   * 更新状态侧边栏（新版）
   * 处理时间、位置、天气、服装、状态标签、势力和敌人信息
   */
  updateStatusSidebar() {
    const vars = GameVariables || {};
    const status = vars.status || {};

    // 更新时间
    const timeEl = document.getElementById('game-time');
    if (timeEl) {
      if (status.time) {
        // 解析时间格式，例如："1月1日，清晨，晴朗"
        const timeParts = status.time.split('，');
        // 只显示日期和时间段
        const displayTime = timeParts.slice(0, 2).join(' ').trim();
        timeEl.textContent = displayTime || status.time;
      } else {
        timeEl.textContent = '时间未知';
      }
    }

    // 更新位置和天气
    const locationEl = document.getElementById('game-location');
    const weatherEl = document.getElementById('game-weather');

    if (status.location_weather) {
      // 解析位置和天气格式，例如："神秘森林（危险区域）晴朗"
      const locationWeather = status.location_weather;
      // 尝试匹配：位置名（可选括号内容）天气
      const match = locationWeather.match(/^([^（(]+)(?:\s*[（(]([^）)]+)[）)])?(?:\s*(.+))?$/);

      if (match) {
        if (locationEl) {
          const location = match[1]?.trim() || '未知之地';
          const subLocation = match[2]?.trim();
          locationEl.textContent = subLocation ? `${location} (${subLocation})` : location;
          locationEl.title = locationWeather; // 完整信息作为提示
        }
        if (weatherEl) {
          const weather = match[3]?.trim();
          if (weather) {
            // 添加天气图标
            const weatherIcons = {
              晴: '☀️',
              多云: '⛅',
              阴: '☁️',
              雨: '🌧️',
              雪: '❄️',
              雾: '🌫️',
              风: '💨',
              雷: '⚡',
            };
            let icon = '';
            for (const [key, emoji] of Object.entries(weatherIcons)) {
              if (weather.includes(key)) {
                icon = emoji + ' ';
                break;
              }
            }
            weatherEl.textContent = icon + weather;
          } else {
            weatherEl.textContent = '';
          }
        }
      } else {
        // 无法解析，直接显示
        if (locationEl) locationEl.textContent = locationWeather;
        if (weatherEl) weatherEl.textContent = '';
      }
    } else {
      if (locationEl) locationEl.textContent = '未知之地';
      if (weatherEl) weatherEl.textContent = '';
    }

    // 更新服装
    this.updateClothingDisplay();

    // 更新状态标签
    this.updateStatusTags();

    // 更新势力信息
    this.updateFactionDisplay();

    // 更新敌人信息
    this.updateEnemyDisplay();
  },

  /**
   * 更新服装显示
   */
  updateClothingDisplay() {
    const clothing = GameVariables.status.clothing;

    const upperEl = document.getElementById('clothing-upper');
    const lowerEl = document.getElementById('clothing-lower');
    const feetEl = document.getElementById('clothing-feet');

    if (upperEl) upperEl.textContent = clothing.upper_body || '无';
    if (lowerEl) lowerEl.textContent = clothing.lower_body || '无';
    if (feetEl) feetEl.textContent = clothing.feet || '无';
  },

  /**
   * 更新状态标签
   */
  updateStatusTags() {
    const tagsContainer = document.getElementById('status-tags');
    if (!tagsContainer) return;

    const permanent = GameVariables.status.permanent_status || [];
    const temporary = GameVariables.status.temporary_status || [];

    tagsContainer.innerHTML = '';

    if (permanent.length === 0 && temporary.length === 0) {
      tagsContainer.innerHTML = '<span class="status-tag-mini empty">无特殊状态</span>';
      return;
    }

    // 添加永久状态
    permanent.forEach(status => {
      const tag = document.createElement('span');
      tag.className = 'status-tag-mini';
      tag.textContent = typeof status === 'string' ? status : status.name || status;
      if (status.description) tag.title = status.description;
      tagsContainer.appendChild(tag);
    });

    // 添加临时状态
    temporary.forEach(status => {
      const tag = document.createElement('span');
      tag.className = 'status-tag-mini temporary';
      tag.textContent = typeof status === 'string' ? status : status.name || status;
      tagsContainer.appendChild(tag);
    });
  },

  /**
   * 更新势力显示
   */
  updateFactionDisplay() {
    const alignmentEl = document.getElementById('faction-alignment');
    const relationsEl = document.getElementById('faction-relations');

    const factions = GameVariables.factions;

    if (alignmentEl) {
      const alignmentIcons = {
        绝对中立: '⚖️',
        守序善良: '☀️',
        混沌善良: '🌟',
        守序中立: '⚙️',
        混沌中立: '🌀',
        守序邪恶: '⛓️',
        中立邪恶: '🌑',
        混沌邪恶: '💀',
      };
      const alignment = factions.player_alignment || '绝对中立';
      const icon = alignmentIcons[alignment] || '⚖️';
      alignmentEl.textContent = `${icon} ${alignment}`;
    }

    if (relationsEl) {
      const relations = factions.relations || [];

      if (relations.length === 0) {
        relationsEl.innerHTML = '<span class="empty-faction">暂无势力关系</span>';
      } else {
        relationsEl.innerHTML = relations
          .map(rel => {
            const value = rel.value || 0;
            const valueClass = value > 0 ? 'friendly' : value < 0 ? 'hostile' : 'neutral';
            return `<div class="faction-relation">
            <span class="faction-name">${rel.name}</span>
            <span class="faction-value ${valueClass}">${value > 0 ? '+' : ''}${value}</span>
          </div>`;
          })
          .join('');
      }
    }
  },

  /**
   * 更新敌人显示
   */
  updateEnemyDisplay() {
    const enemySection = document.getElementById('sidebar-enemy-section');
    const enemy = GameVariables.battle.enemy;

    if (!enemySection) return;

    if (enemy && BattleState && BattleState.isActive) {
      enemySection.style.display = 'block';

      const nameEl = document.getElementById('sidebar-enemy-name');
      const hpBar = document.getElementById('sidebar-enemy-hp');
      const hpText = document.getElementById('sidebar-enemy-hp-text');

      if (nameEl) nameEl.textContent = enemy.name || '未知敌人';

      if (hpBar && enemy.hp !== undefined && enemy.max_hp) {
        const percent = (enemy.hp / enemy.max_hp) * 100;
        hpBar.style.width = `${percent}%`;
      }

      if (hpText) {
        hpText.textContent = `${enemy.hp || '?'} / ${enemy.max_hp || '?'}`;
      }
    } else {
      enemySection.style.display = 'none';
    }
  },

  /**
   * 显示处理指示器
   */
  showProcessingIndicator(message = '处理变量中...') {
    const indicator = document.getElementById('logic-processing-indicator');
    if (indicator) {
      const textEl = indicator.querySelector('.indicator-text');
      if (textEl) textEl.textContent = message;
      indicator.classList.remove('hidden');
    }
  },

  /**
   * 隐藏处理指示器
   */
  hideProcessingIndicator() {
    const indicator = document.getElementById('logic-processing-indicator');
    if (indicator) {
      indicator.classList.add('hidden');
    }
  },

  /**
   * 更新角色头像
   * @param {string} portraitUrl - 头像URL（可选）
   */
  updatePortrait(portraitUrl) {
    const portrait = document.getElementById('game-portrait');
    if (portrait) {
      if (portraitUrl) {
        portrait.innerHTML = `<img src="${portraitUrl}" alt="角色头像" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
      } else {
        // 使用默认头像图标
        portrait.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:60%;height:60%;opacity:0.6;">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                `;
      }
    }
  },

  /**
   * 显示游戏菜单
   */
  showGameMenu() {
    // 可以扩展为显示暂停菜单
    const menuItems = [
      { label: '保存游戏', action: () => SaveSystem.save() },
      { label: '查看卡组', action: () => DeckUI.showModal() },
      { label: '设置', action: () => navigateTo('settings') },
      { label: '返回主菜单', action: () => this.returnToMainMenu() },
    ];

    // 这里可以实现一个菜单弹窗
    console.log('游戏菜单', menuItems);
  },

  /**
   * 返回主菜单
   */
  returnToMainMenu() {
    console.log('returnToMainMenu 被调用');
    const confirmed = confirm('确定要返回主菜单吗？未保存的进度将丢失。');
    console.log('确认结果:', confirmed);
    if (confirmed) {
      console.log('正在导航到home页面...');
      // 关闭侧边栏
      this.closeSidebar();
      // 导航到主页
      navigateTo('home');
      console.log('navigateTo 调用完成');
    }
  },

  /**
   * 显示游戏结束画面
   * @param {boolean} victory - 是否胜利
   */
  showGameOver(victory) {
    const char = GameState.character;

    if (victory) {
      showToast('恭喜你完成了冒险！');
      if (typeof NarrativeSystem !== 'undefined') {
        NarrativeSystem.addEntry(
          `${char.name}的冒险画上了圆满的句号。在经历了无数挑战后，你终于达成了目标。你的传说将在这片土地上流传...`,
          'system',
        );
      }
    } else {
      showToast('冒险结束...');
      if (typeof NarrativeSystem !== 'undefined') {
        NarrativeSystem.addEntry(
          `${char.name}的冒险在此终结。黑暗吞噬了你的意识，但也许在另一个时空，你的故事会有不同的结局...`,
          'system',
        );
      }
    }
  },

  /**
   * 添加状态效果显示
   * @param {string} effectName - 效果名称
   * @param {number} value - 效果值
   */
  addStatusEffect(effectName, value) {
    // 可以在角色面板添加状态效果图标
    console.log(`添加状态效果: ${effectName} x${value}`);
  },

  /**
   * 播放动画效果
   * @param {string} type - 动画类型
   * @param {HTMLElement} target - 目标元素
   */
  playAnimation(type, target) {
    if (!target) return;

    switch (type) {
      case 'damage':
        target.classList.add('shake');
        setTimeout(() => target.classList.remove('shake'), 300);
        break;
      case 'heal':
        target.classList.add('pulse-green');
        setTimeout(() => target.classList.remove('pulse-green'), 500);
        break;
      case 'gold':
        target.classList.add('pulse-gold');
        setTimeout(() => target.classList.remove('pulse-gold'), 500);
        break;
    }
  },

  /**
   * 显示浮动文字
   * @param {string} text - 文字内容
   * @param {HTMLElement} target - 目标元素
   * @param {string} color - 颜色
   */
  showFloatingText(text, target, color = '#fff') {
    if (!target) return;

    const floatText = document.createElement('div');
    floatText.className = 'floating-text';
    floatText.textContent = text;
    floatText.style.cssText = `
            position: absolute;
            color: ${color};
            font-weight: bold;
            font-size: 1.2rem;
            pointer-events: none;
            animation: floatUp 1s ease-out forwards;
            z-index: 100;
        `;

    const rect = target.getBoundingClientRect();
    floatText.style.left = `${rect.left + rect.width / 2}px`;
    floatText.style.top = `${rect.top}px`;

    document.body.appendChild(floatText);

    setTimeout(() => {
      floatText.remove();
    }, 1000);
  },
};

// 导出
window.GameUI = GameUI;
