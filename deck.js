/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 卡组界面 - 支持编辑模式和仓库管理
 * ============================================================ */

/**
 * 卡组界面模块
 */
const DeckUI = {
  currentFilter: 'all',
  currentView: 'deck', // 'deck' | 'warehouse' - 当前视图
  isEditMode: false, // 是否处于编辑模式
  selectedCards: new Set(), // 选中的卡牌ID集合

  /**
   * 初始化卡组界面
   */
  init() {
    this.bindEvents();
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 关闭卡组模态框按钮
    const closeDeckBtn = document.getElementById('btn-close-deck');
    if (closeDeckBtn) {
      closeDeckBtn.addEventListener('click', () => {
        this.hideModal();
      });
    }

    // 点击遮罩关闭
    if (DOM.elements.modalDeck) {
      DOM.elements.modalDeck.addEventListener('click', e => {
        if (e.target === DOM.elements.modalDeck) {
          this.hideModal();
        }
      });
    }

    // ESC键关闭
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && DOM.elements.modalDeck?.classList.contains('active')) {
        this.hideModal();
      }
    });
  },

  /**
   * 显示卡组模态框
   */
  showModal() {
    if (DOM.elements.modalDeck) {
      DOM.elements.modalDeck.classList.add('active');
      this.currentView = 'deck';
      this.isEditMode = false;
      this.selectedCards.clear();
      this.render();
    }
  },

  /**
   * 隐藏卡组模态框
   */
  hideModal() {
    if (DOM.elements.modalDeck) {
      DOM.elements.modalDeck.classList.remove('active');
      this.isEditMode = false;
      this.selectedCards.clear();
    }
  },

  /**
   * 切换编辑模式
   */
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this.selectedCards.clear();
    this.render();

    if (this.isEditMode) {
      showToast('编辑模式已开启，点击卡牌可选中');
    } else {
      showToast('编辑模式已关闭');
    }
  },

  /**
   * 切换视图（出战卡组/仓库）
   * @param {string} view - 视图类型 'deck' | 'warehouse'
   */
  switchView(view) {
    this.currentView = view;
    this.currentFilter = 'all';
    this.selectedCards.clear();
    this.render();
  },

  /**
   * 设置过滤器
   * @param {string} filter - 过滤类型
   */
  setFilter(filter) {
    this.currentFilter = filter;
    this.render();
  },

  /**
   * 获取当前显示的卡牌列表
   * @returns {Array} - 卡牌数组
   */
  getCurrentCards() {
    if (this.currentView === 'warehouse') {
      // 从仓库获取卡牌
      return this.getWarehouseCards();
    } else {
      // 获取出战卡组
      return this.getDeckCards();
    }
  },

  /**
   * 获取出战卡组卡牌
   * @returns {Array<Card>} - 卡牌数组
   */
  getDeckCards() {
    // 优先使用BattleState.deck，否则从GameVariables.battle.cards生成
    if (BattleState.deck.length > 0) {
      return BattleState.deck;
    }
    // 从GameVariables生成卡组
    if (GameVariables.battle.cards && GameVariables.battle.cards.length > 0) {
      return CardSystem.createDeckFromData(GameVariables.battle.cards);
    }
    // 生成默认卡组
    return CardSystem.generateInitialDeck(GameState.character);
  },

  /**
   * 获取仓库卡牌
   * @returns {Array<Card>} - 卡牌数组
   */
  getWarehouseCards() {
    const warehouseData = GameVariables.battle.warehouse || [];
    return CardSystem.createDeckFromData(warehouseData);
  },

  /**
   * 渲染卡组界面
   */
  render() {
    const container = DOM.elements.modalDeckCards;
    if (!container) return;

    // 获取当前显示的卡牌
    let cards = this.getCurrentCards();

    // 应用过滤
    if (this.currentFilter !== 'all') {
      cards = cards.filter(card => card.type === this.currentFilter);
    }

    // 按类型和费用排序
    cards = this.sortCards(cards);

    // 渲染完整UI（包含标签栏、工具栏和卡牌区域）
    const parentContainer = container.parentElement;
    if (parentContainer) {
      // 检查是否需要重新构建UI结构
      if (!parentContainer.querySelector('.deck-view-tabs')) {
        this.buildUIStructure(parentContainer);
      }
      // 更新标签状态
      this.updateTabsState();
      // 更新工具栏
      this.updateToolbar();
    }

    // 渲染卡牌
    this.renderCards(container, cards);

    // 更新统计信息
    this.updateStats(cards);
  },

  /**
   * 构建UI结构
   * @param {HTMLElement} parentContainer - 父容器
   */
  buildUIStructure(parentContainer) {
    // 在卡牌容器前插入视图标签和工具栏
    const headerHtml = `
      <div class="deck-view-tabs">
        <button class="deck-view-tab active" data-view="deck">
          <span class="tab-icon">⚔️</span>
          <span class="tab-label">出战卡组</span>
          <span class="tab-count" id="deck-count">0</span>
        </button>
        <button class="deck-view-tab" data-view="warehouse">
          <span class="tab-icon">📦</span>
          <span class="tab-label">卡牌仓库</span>
          <span class="tab-count" id="warehouse-count">0</span>
        </button>
      </div>
      <div class="deck-toolbar">
        <div class="deck-filter-tabs" id="deck-filter-tabs">
          <button class="deck-tab active" data-filter="all">全部</button>
          <button class="deck-tab" data-filter="attack">攻击</button>
          <button class="deck-tab" data-filter="skill">技能</button>
          <button class="deck-tab" data-filter="power">能力</button>
        </div>
        <div class="deck-actions">
          <button class="btn btn-secondary btn-small deck-edit-btn" id="btn-deck-edit">
            <span class="edit-icon">✏️</span>
            <span class="edit-label">编辑</span>
          </button>
        </div>
      </div>
      <div class="deck-edit-toolbar" id="deck-edit-toolbar" style="display: none;">
        <span class="selected-count">已选择: <strong id="selected-card-count">0</strong> 张</span>
        <div class="edit-actions">
          <button class="btn btn-primary btn-small" id="btn-move-cards" disabled>
            <span id="move-btn-text">移至仓库</span>
          </button>
          <button class="btn btn-secondary btn-small" id="btn-cancel-edit">取消</button>
        </div>
      </div>
    `;

    // 找到卡牌容器并在其前面插入
    const cardsContainer = parentContainer.querySelector('#modal-deck-cards');
    if (cardsContainer) {
      cardsContainer.insertAdjacentHTML('beforebegin', headerHtml);

      // 绑定视图切换事件
      parentContainer.querySelectorAll('.deck-view-tab').forEach(tab => {
        tab.addEventListener('click', e => {
          const view = e.currentTarget.dataset.view;
          this.switchView(view);
        });
      });

      // 绑定过滤器事件
      parentContainer.querySelectorAll('.deck-tab').forEach(tab => {
        tab.addEventListener('click', e => {
          this.setFilter(e.currentTarget.dataset.filter);
        });
      });

      // 绑定编辑按钮事件
      const editBtn = parentContainer.querySelector('#btn-deck-edit');
      if (editBtn) {
        editBtn.addEventListener('click', () => this.toggleEditMode());
      }

      // 绑定移动按钮事件
      const moveBtn = parentContainer.querySelector('#btn-move-cards');
      if (moveBtn) {
        moveBtn.addEventListener('click', () => this.moveSelectedCards());
      }

      // 绑定取消按钮事件
      const cancelBtn = parentContainer.querySelector('#btn-cancel-edit');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.toggleEditMode());
      }
    }
  },

  /**
   * 更新标签状态
   */
  updateTabsState() {
    // 更新视图标签
    document.querySelectorAll('.deck-view-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === this.currentView);
    });

    // 更新过滤标签
    document.querySelectorAll('.deck-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.filter === this.currentFilter);
    });

    // 更新数量显示
    const deckCount = document.getElementById('deck-count');
    const warehouseCount = document.getElementById('warehouse-count');
    if (deckCount) {
      deckCount.textContent = this.getDeckCards().length;
    }
    if (warehouseCount) {
      warehouseCount.textContent = this.getWarehouseCards().length;
    }
  },

  /**
   * 更新工具栏状态
   */
  updateToolbar() {
    const editToolbar = document.getElementById('deck-edit-toolbar');
    const editBtn = document.getElementById('btn-deck-edit');
    const moveBtn = document.getElementById('btn-move-cards');
    const moveBtnText = document.getElementById('move-btn-text');
    const selectedCountEl = document.getElementById('selected-card-count');

    if (editToolbar) {
      editToolbar.style.display = this.isEditMode ? 'flex' : 'none';
    }

    if (editBtn) {
      editBtn.classList.toggle('active', this.isEditMode);
      editBtn.querySelector('.edit-label').textContent = this.isEditMode ? '完成' : '编辑';
    }

    if (selectedCountEl) {
      selectedCountEl.textContent = this.selectedCards.size;
    }

    if (moveBtn) {
      moveBtn.disabled = this.selectedCards.size === 0;
    }

    if (moveBtnText) {
      moveBtnText.textContent = this.currentView === 'deck' ? '移至仓库' : '加入卡组';
    }
  },

  /**
   * 渲染卡牌列表
   * @param {HTMLElement} container - 容器元素
   * @param {Array} cards - 卡牌数组
   */
  renderCards(container, cards) {
    if (cards.length === 0) {
      const emptyMessage = this.currentView === 'deck' ? '出战卡组为空，请从仓库添加卡牌' : '仓库为空';
      container.innerHTML = `<p class="deck-empty-message">${emptyMessage}</p>`;
      return;
    }

    container.innerHTML = cards.map((card, index) => this.renderCardMini(card, index)).join('');

    // 绑定卡牌事件
    container.querySelectorAll('.deck-card-mini').forEach(cardEl => {
      const cardId = cardEl.dataset.id;

      if (this.isEditMode) {
        // 编辑模式：点击选中/取消选中
        cardEl.addEventListener('click', () => {
          this.toggleCardSelection(cardId, cardEl);
        });
      } else {
        // 普通模式：点击显示详情
        cardEl.addEventListener('click', () => {
          this.showCardDetail(cardId, cards);
        });
      }
    });
  },

  /**
   * 渲染迷你卡牌
   * @param {Card} card - 卡牌对象
   * @param {number} index - 索引
   * @returns {string} - HTML字符串
   */
  renderCardMini(card, index) {
    const typeClass = card.type || '';
    const isSelected = this.selectedCards.has(card.id);
    const editClass = this.isEditMode ? 'editable' : '';
    const selectedClass = isSelected ? 'selected' : '';

    return `
      <div class="deck-card-mini ${typeClass} ${editClass} ${selectedClass}"
           data-index="${index}"
           data-id="${card.id}">
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        ${this.isEditMode ? '<div class="card-select-indicator"></div>' : ''}
      </div>
    `;
  },

  /**
   * 切换卡牌选中状态
   * @param {string} cardId - 卡牌ID
   * @param {HTMLElement} cardEl - 卡牌元素
   */
  toggleCardSelection(cardId, cardEl) {
    if (this.selectedCards.has(cardId)) {
      this.selectedCards.delete(cardId);
      cardEl.classList.remove('selected');
    } else {
      this.selectedCards.add(cardId);
      cardEl.classList.add('selected');
    }
    this.updateToolbar();
  },

  /**
   * 移动选中的卡牌
   */
  moveSelectedCards() {
    if (this.selectedCards.size === 0) return;

    const sourceCards = this.getCurrentCards();
    const selectedCardIds = Array.from(this.selectedCards);

    if (this.currentView === 'deck') {
      // 从出战卡组移至仓库
      this.moveCardsToWarehouse(sourceCards, selectedCardIds);
    } else {
      // 从仓库移至出战卡组
      this.moveCardsToDeck(sourceCards, selectedCardIds);
    }

    // 清空选择并刷新
    this.selectedCards.clear();
    this.render();
  },

  /**
   * 将卡牌从出战卡组移至仓库
   * @param {Array} deckCards - 出战卡组卡牌
   * @param {Array} cardIds - 要移动的卡牌ID列表
   */
  moveCardsToWarehouse(deckCards, cardIds) {
    const movedCards = [];
    const remainingCards = [];

    deckCards.forEach(card => {
      if (cardIds.includes(card.id)) {
        movedCards.push(card.toSaveData ? card.toSaveData() : card);
      } else {
        remainingCards.push(card);
      }
    });

    // 更新出战卡组
    BattleState.deck = remainingCards;

    // 同步到GameVariables.battle.cards
    GameVariables.battle.cards = remainingCards.map(c => (c.toSaveData ? c.toSaveData() : c));

    // 添加到仓库
    if (!GameVariables.battle.warehouse) {
      GameVariables.battle.warehouse = [];
    }
    GameVariables.battle.warehouse.push(...movedCards);

    // 触发MVU变更事件
    VariableChangeEmitter.emit('/battle/cards', GameVariables.battle.cards, null);
    VariableChangeEmitter.emit('/battle/warehouse', GameVariables.battle.warehouse, null);

    showToast(`已将 ${movedCards.length} 张卡牌移至仓库`);
    console.log('卡牌已移至仓库:', movedCards);
  },

  /**
   * 将卡牌从仓库移至出战卡组
   * @param {Array} warehouseCards - 仓库卡牌
   * @param {Array} cardIds - 要移动的卡牌ID列表
   */
  moveCardsToDeck(warehouseCards, cardIds) {
    const movedCards = [];
    const remainingWarehouse = [];

    // 分离要移动的卡牌和保留的卡牌
    const warehouseData = GameVariables.battle.warehouse || [];
    warehouseData.forEach((cardData, index) => {
      const card = warehouseCards[index];
      if (card && cardIds.includes(card.id)) {
        movedCards.push(cardData);
      } else {
        remainingWarehouse.push(cardData);
      }
    });

    // 更新仓库
    GameVariables.battle.warehouse = remainingWarehouse;

    // 添加到出战卡组
    const newCards = CardSystem.createDeckFromData(movedCards);
    BattleState.deck.push(...newCards);

    // 同步到GameVariables.battle.cards
    if (!GameVariables.battle.cards) {
      GameVariables.battle.cards = [];
    }
    GameVariables.battle.cards.push(...movedCards);

    // 触发MVU变更事件
    VariableChangeEmitter.emit('/battle/cards', GameVariables.battle.cards, null);
    VariableChangeEmitter.emit('/battle/warehouse', GameVariables.battle.warehouse, null);

    showToast(`已将 ${movedCards.length} 张卡牌加入出战卡组`);
    console.log('卡牌已加入卡组:', movedCards);
  },

  /**
   * 排序卡牌
   * @param {Array} cards - 卡牌数组
   * @returns {Array} - 排序后的卡牌数组
   */
  sortCards(cards) {
    return [...cards].sort((a, b) => {
      // 先按类型排序
      const typeOrder = { attack: 0, skill: 1, power: 2, status: 3, curse: 4 };
      const typeA = typeOrder[a.type] || 5;
      const typeB = typeOrder[b.type] || 5;
      if (typeA !== typeB) return typeA - typeB;

      // 再按费用排序
      if (a.cost !== b.cost) return a.cost - b.cost;

      // 最后按名称排序
      return a.name.localeCompare(b.name);
    });
  },

  /**
   * 更新统计信息
   * @param {Array} cards - 卡牌数组
   */
  updateStats(cards) {
    // 统计各类型卡牌数量
    const stats = {
      total: cards.length,
      attack: cards.filter(c => c.type === 'attack').length,
      skill: cards.filter(c => c.type === 'skill').length,
      power: cards.filter(c => c.type === 'power').length,
    };

    // 更新过滤标签的数量显示
    const filterTabs = document.querySelectorAll('.deck-tab');
    filterTabs.forEach(tab => {
      const filter = tab.dataset.filter;
      const count = filter === 'all' ? stats.total : stats[filter] || 0;
      // 可以在标签上显示数量
      // tab.textContent = `${tab.textContent.split('(')[0]}(${count})`;
    });

    console.log('卡组统计:', stats);
  },

  /**
   * 显示卡牌详情
   * @param {string} cardId - 卡牌ID
   * @param {Array} cards - 卡牌数组
   */
  showCardDetail(cardId, cards) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    // 判断当前卡牌所在位置
    const isInDeck = this.currentView === 'deck';
    const actionButton = isInDeck
      ? `<button class="btn btn-warning btn-small" onclick="DeckUI.quickMoveToWarehouse('${cardId}')">移至仓库</button>`
      : `<button class="btn btn-primary btn-small" onclick="DeckUI.quickMoveToDeck('${cardId}')">加入卡组</button>`;

    // 创建详情弹窗
    const detailHtml = `
      <div class="card-detail-overlay" id="card-detail-overlay">
        <div class="card-detail glass-panel">
          <div class="game-card ${card.type}" style="width:180px;height:250px;margin:0 auto 20px;">
            <div class="card-cost">${card.cost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.getTypeLabel ? card.getTypeLabel() : card.type}</div>
            <div class="card-desc">${card.description}</div>
          </div>
          <div class="card-detail-info">
            <p><strong>稀有度:</strong> ${this.getRarityLabel(card.rarity)}</p>
            ${card.exhaust ? '<p><strong>消耗:</strong> 使用后移除</p>' : ''}
            ${card.ethereal ? '<p><strong>虚无:</strong> 回合结束时消耗</p>' : ''}
            ${card.innate ? '<p><strong>固有:</strong> 战斗开始时在手牌中</p>' : ''}
          </div>
          <div class="card-detail-actions">
            ${actionButton}
            <button class="btn btn-secondary btn-small" onclick="DeckUI.hideCardDetail()">关闭</button>
          </div>
        </div>
      </div>
    `;

    // 添加到DOM
    const existingOverlay = document.getElementById('card-detail-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    document.body.insertAdjacentHTML('beforeend', detailHtml);

    // 点击遮罩关闭
    const overlay = document.getElementById('card-detail-overlay');
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        this.hideCardDetail();
      }
    });
  },

  /**
   * 隐藏卡牌详情
   */
  hideCardDetail() {
    const overlay = document.getElementById('card-detail-overlay');
    if (overlay) {
      overlay.remove();
    }
  },

  /**
   * 快速将单张卡牌移至仓库
   * @param {string} cardId - 卡牌ID
   */
  quickMoveToWarehouse(cardId) {
    const deckCards = this.getDeckCards();
    this.moveCardsToWarehouse(deckCards, [cardId]);
    this.hideCardDetail();
    this.render();
  },

  /**
   * 快速将单张卡牌加入卡组
   * @param {string} cardId - 卡牌ID
   */
  quickMoveToDeck(cardId) {
    const warehouseCards = this.getWarehouseCards();
    this.moveCardsToDeck(warehouseCards, [cardId]);
    this.hideCardDetail();
    this.render();
  },

  /**
   * 获取稀有度标签
   * @param {string} rarity - 稀有度
   * @returns {string} - 中文标签
   */
  getRarityLabel(rarity) {
    const labels = {
      basic: '基础',
      common: '普通',
      uncommon: '罕见',
      rare: '稀有',
    };
    return labels[rarity] || '未知';
  },

  /**
   * 获取卡组概览HTML
   * @returns {string} - HTML字符串
   */
  getOverviewHTML() {
    const deck = this.getDeckCards();
    const warehouse = this.getWarehouseCards();

    return `
      <div class="deck-overview glass-panel">
        <div class="deck-header">
          <h3 class="deck-title">我的卡组</h3>
          <span class="deck-count">${deck.length}</span>
        </div>
        <div class="deck-cards">
          ${deck
            .slice(0, 6)
            .map((card, i) => this.renderCardMiniSimple(card, i))
            .join('')}
          ${deck.length > 6 ? '<div class="deck-card-mini more">+' + (deck.length - 6) + '</div>' : ''}
        </div>
        ${warehouse.length > 0 ? `<div class="warehouse-hint">仓库中还有 ${warehouse.length} 张卡牌</div>` : ''}
      </div>
    `;
  },

  /**
   * 渲染简单版迷你卡牌（用于概览）
   * @param {Card} card - 卡牌对象
   * @param {number} index - 索引
   * @returns {string} - HTML字符串
   */
  renderCardMiniSimple(card, index) {
    const typeClass = card.type || '';
    return `
      <div class="deck-card-mini ${typeClass}" data-index="${index}" data-id="${card.id}">
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
      </div>
    `;
  },
};

// 添加卡牌详情和编辑模式样式
const deckStyles = document.createElement('style');
deckStyles.textContent = `
  .card-detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.2s ease;
  }

  .card-detail {
    padding: 30px;
    max-width: 300px;
    text-align: center;
  }

  .card-detail-info {
    margin-bottom: 20px;
    text-align: left;
    font-size: 0.9rem;
  }

  .card-detail-info p {
    margin: 5px 0;
  }

  .card-detail-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  /* 视图切换标签 */
  .deck-view-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }

  .deck-view-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(255, 250, 240, 0.1);
    border: 1px solid rgba(201, 162, 39, 0.3);
    border-radius: var(--border-radius-md, 8px);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--ink-secondary, #666);
  }

  .deck-view-tab:hover {
    background: rgba(201, 162, 39, 0.15);
    border-color: rgba(201, 162, 39, 0.5);
  }

  .deck-view-tab.active {
    background: rgba(201, 162, 39, 0.2);
    border-color: var(--gold-accent, #c9a227);
    color: var(--ink-primary, #333);
  }

  .deck-view-tab .tab-icon {
    font-size: 1.2rem;
  }

  .deck-view-tab .tab-label {
    font-weight: 500;
  }

  .deck-view-tab .tab-count {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.85rem;
  }

  /* 工具栏 */
  .deck-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .deck-filter-tabs {
    display: flex;
    gap: 5px;
  }

  .deck-actions {
    display: flex;
    gap: 10px;
  }

  .deck-edit-btn {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .deck-edit-btn.active {
    background: var(--gold-accent, #c9a227);
    color: white;
  }

  /* 编辑工具栏 */
  .deck-edit-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background: rgba(201, 162, 39, 0.1);
    border-radius: var(--border-radius-sm, 6px);
    margin-bottom: 15px;
  }

  .selected-count {
    font-size: 0.9rem;
    color: var(--ink-secondary, #666);
  }

  .selected-count strong {
    color: var(--gold-accent, #c9a227);
  }

  .edit-actions {
    display: flex;
    gap: 10px;
  }

  /* 编辑模式下的卡牌样式 */
  .deck-card-mini.editable {
    cursor: pointer;
    position: relative;
  }

  .deck-card-mini.editable:hover {
    border-color: var(--gold-accent, #c9a227);
    box-shadow: 0 0 10px rgba(201, 162, 39, 0.3);
  }

  .deck-card-mini.selected {
    border-color: var(--gold-accent, #c9a227);
    box-shadow: 0 0 15px rgba(201, 162, 39, 0.5);
    transform: translateY(-5px);
  }

  .card-select-indicator {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(201, 162, 39, 0.5);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    transition: all 0.2s ease;
  }

  .deck-card-mini.selected .card-select-indicator {
    background: var(--gold-accent, #c9a227);
    border-color: var(--gold-accent, #c9a227);
  }

  .deck-card-mini.selected .card-select-indicator::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
  }

  /* 空状态消息 */
  .deck-empty-message {
    text-align: center;
    color: var(--ink-muted, #999);
    padding: 40px 20px;
    font-style: italic;
  }

  /* 仓库提示 */
  .warehouse-hint {
    margin-top: 10px;
    font-size: 0.8rem;
    color: var(--ink-muted, #999);
    text-align: center;
  }

  /* 警告按钮样式 */
  .btn-warning {
    background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
    color: white;
    border: none;
  }

  .btn-warning:hover {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  }
`;
document.head.appendChild(deckStyles);

// 导出
window.DeckUI = DeckUI;
