/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 战斗系统（战斗界面）
 * ============================================================ */

/**
 * 战斗系统
 */
const BattleSystem = {
  /**
   * 开始战斗
   * @param {string} enemyType - 敌人类型
   * @param {number} level - 敌人等级
   */
  start(enemyType, level) {
    BattleState.isActive = true;
    BattleState.turn = 1;
    BattleState.energy = BattleState.maxEnergy;
    BattleState.block = 0;

    // 使用HP同步函数初始化玩家HP
    this.syncHpFromMVU();

    BattleState.enemy = EnemySystem.create(enemyType, level);
    this.rollUnifiedIntent(BattleState.enemy);

    BattleState.deck = [...CardSystem.generateInitialDeck(GameState.character)];
    BattleState.drawPile = shuffleArray([...BattleState.deck]);
    BattleState.hand = [];
    BattleState.discardPile = [];
    BattleState.exhaustPile = [];
    BattleState.combatLog = [];

    CardSystem.drawCards(BattleState, 5);

    this.logCombat(`战斗开始！${BattleState.enemy.name} Lv.${BattleState.enemy.level} 出现了！`);

    this.showBattleUI();
    this.updateBattleUI();
  },

  /**
   * 开始随机战斗
   */
  startRandom() {
    const floor = GameState.character.floor || 1;
    const enemy = EnemySystem.createRandom(floor);

    BattleState.isActive = true;
    BattleState.turn = 1;
    BattleState.energy = BattleState.maxEnergy;
    BattleState.block = 0;

    // 使用HP同步函数初始化玩家HP
    this.syncHpFromMVU();

    BattleState.enemy = enemy;

    this.rollUnifiedIntent(BattleState.enemy);

    BattleState.deck = [...CardSystem.generateInitialDeck(GameState.character)];
    BattleState.drawPile = shuffleArray([...BattleState.deck]);
    BattleState.hand = [];
    BattleState.discardPile = [];
    BattleState.exhaustPile = [];
    BattleState.combatLog = [];

    CardSystem.drawCards(BattleState, 5);

    this.logCombat(`战斗开始！${BattleState.enemy.name} Lv.${BattleState.enemy.level} 出现了！`);

    this.showBattleUI();
    this.updateBattleUI();
  },

  /**
   * 使用指定敌人开始战斗（用于AI生成的敌人）
   * @param {Object} enemyData - 敌人数据对象
   */
  startWithEnemy(enemyData) {
    BattleState.isActive = true;
    BattleState.turn = 1;
    BattleState.energy = BattleState.maxEnergy;
    BattleState.block = 0;
    BattleState.playerHp = GameVariables.battle.core.hp;
    BattleState.playerMaxHp = GameVariables.battle.core.max_hp;

    // 从变量系统的敌人数据创建敌人对象
    BattleState.enemy = {
      name: enemyData.name || '未知敌人',
      emoji: enemyData.emoji || '👹',
      level: GameVariables.battle.level || 1,
      hp: enemyData.hp || 50,
      maxHp: enemyData.max_hp || 50,
      description: enemyData.description || '',
      actions: enemyData.actions || [],
      abilities: enemyData.abilities || [],
      statusEffects: enemyData.status_effects || [],
      actionMode: enemyData.action_mode || 'random',
      actionConfig: enemyData.action_config || {},
      block: 0,
      currentIntent: null,
      actionIndex: 0,
    };

    // 设置初始意图 - 使用统一的意图系统
    this.rollUnifiedIntent(BattleState.enemy);

    // 使用游戏变量中的卡牌，如果没有则生成默认卡组
    if (GameVariables.battle.cards.length > 0) {
      BattleState.deck = GameVariables.battle.cards.map(cardData => CardSystem.createFromData(cardData));
    } else {
      BattleState.deck = [...CardSystem.generateInitialDeck(GameState.character)];
    }

    BattleState.drawPile = shuffleArray([...BattleState.deck]);
    BattleState.hand = [];
    BattleState.discardPile = [];
    BattleState.exhaustPile = [];
    BattleState.combatLog = [];

    // 应用玩家初始状态效果
    if (GameVariables.battle.player_status_effects && GameVariables.battle.player_status_effects.length > 0) {
      // 记录玩家状态效果
      GameVariables.battle.player_status_effects.forEach(effect => {
        this.logCombat(`你获得了 ${effect.name} (${effect.stacks}层)`);
      });
    }

    CardSystem.drawCards(BattleState, 5);

    this.logCombat(`战斗开始！${BattleState.enemy.emoji} ${BattleState.enemy.name} 出现了！`);
    if (BattleState.enemy.description) {
      this.logCombat(BattleState.enemy.description);
    }

    this.showBattleUI();
    this.updateBattleUI();
  },

  /**
   * 统一的意图滚动系统
   * 兼容EnemySystem的intents格式和AI生成的actions格式
   * @param {Object} enemy - 敌人实例
   */
  rollUnifiedIntent(enemy) {
    if (!enemy) return;

    // 如果敌人有actions数组（AI生成的格式），使用高级行动模式
    if (enemy.actions && enemy.actions.length > 0) {
      this.rollActionBasedIntent(enemy);
      return;
    }

    // 如果敌人有intents数组（EnemySystem模板格式），使用EnemySystem
    if (enemy.intents && enemy.intents.length > 0) {
      EnemySystem.rollIntent(enemy);
      return;
    }

    // 默认意图
    enemy.currentIntent = { type: 'unknown', value: '?' };
  },

  /**
   * 基于actions数组滚动意图（AI生成的敌人）
   * @param {Object} enemy - 敌人实例
   */
  rollActionBasedIntent(enemy) {
    if (!enemy.actions || enemy.actions.length === 0) {
      enemy.currentIntent = { type: 'unknown', value: '?' };
      return;
    }

    let selectedAction = null;

    switch (enemy.actionMode) {
      case 'random':
        selectedAction = enemy.actions[Math.floor(Math.random() * enemy.actions.length)];
        break;

      case 'probability':
        if (enemy.actionConfig && enemy.actionConfig.probability) {
          const weights = enemy.actionConfig.probability;
          const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
          let random = Math.random() * totalWeight;

          for (const action of enemy.actions) {
            const weight = weights[action.name] || 0;
            random -= weight;
            if (random <= 0) {
              selectedAction = action;
              break;
            }
          }
        }
        if (!selectedAction) {
          selectedAction = enemy.actions[0];
        }
        break;

      case 'sequence':
        if (enemy.actionConfig && enemy.actionConfig.sequence) {
          const seq = enemy.actionConfig.sequence;
          const actionName = seq[enemy.actionIndex % seq.length];
          selectedAction = enemy.actions.find(a => a.name === actionName) || enemy.actions[0];
          enemy.actionIndex++;
        } else {
          selectedAction = enemy.actions[enemy.actionIndex % enemy.actions.length];
          enemy.actionIndex++;
        }
        break;

      case 'sequence_then_probability':
        if (enemy.actionConfig && enemy.actionConfig.sequence_then_probability) {
          const config = enemy.actionConfig.sequence_then_probability;
          if (enemy.actionIndex < config.sequence.length) {
            const actionName = config.sequence[enemy.actionIndex];
            selectedAction = enemy.actions.find(a => a.name === actionName) || enemy.actions[0];
            enemy.actionIndex++;
          } else {
            const weights = config.probability;
            const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
            let random = Math.random() * totalWeight;

            for (const action of enemy.actions) {
              const weight = weights[action.name] || 0;
              random -= weight;
              if (random <= 0) {
                selectedAction = action;
                break;
              }
            }
          }
        }
        if (!selectedAction) {
          selectedAction = enemy.actions[0];
        }
        break;

      default:
        selectedAction = enemy.actions[Math.floor(Math.random() * enemy.actions.length)];
    }

    // 将action转换为统一的intent格式
    if (selectedAction) {
      enemy.currentIntent = this.convertActionToIntent(selectedAction);
    } else {
      enemy.currentIntent = { type: 'unknown', value: '?' };
    }
  },

  /**
   * 将action格式转换为统一的intent格式
   * @param {Object} action - action对象
   * @returns {Object} - 统一的intent对象
   */
  convertActionToIntent(action) {
    // 解析action的效果来确定类型
    const intent = {
      type: 'unknown',
      value: 0,
      action: action,
      description: action.description || action.name,
    };

    // 根据action名称或效果推断类型
    const effects = action.effects || [];
    for (const effect of effects) {
      if (effect.type === 'damage' || effect.target === 'player') {
        intent.type = 'attack';
        intent.value = effect.value || 0;
        break;
      } else if (effect.type === 'block' || effect.type === 'defend') {
        intent.type = 'defend';
        intent.value = effect.value || 0;
        break;
      } else if (effect.type === 'buff') {
        intent.type = 'buff';
        intent.value = effect.value || 0;
        break;
      } else if (effect.type === 'debuff') {
        intent.type = 'debuff';
        intent.value = effect.value || 0;
        break;
      }
    }

    // 如果没有effects，根据action名称推断
    if (intent.type === 'unknown' && action.name) {
      const name = action.name.toLowerCase();
      if (name.includes('攻击') || name.includes('attack') || name.includes('打')) {
        intent.type = 'attack';
        intent.value = action.damage || action.value || 10;
      } else if (name.includes('防御') || name.includes('defend') || name.includes('格挡')) {
        intent.type = 'defend';
        intent.value = action.block || action.value || 5;
      } else if (name.includes('强化') || name.includes('buff')) {
        intent.type = 'buff';
        intent.value = action.value || 2;
      }
    }

    return intent;
  },

  /**
   * 显示战斗UI
   */
  showBattleUI() {
    if (DOM.elements.battlePanel) {
      DOM.elements.battlePanel.classList.add('active');
    }
  },

  /**
   * 隐藏战斗UI
   */
  hideBattleUI() {
    if (DOM.elements.battlePanel) {
      DOM.elements.battlePanel.classList.remove('active');
    }
  },

  /**
   * 更新战斗UI
   */
  updateBattleUI() {
    if (!BattleState.isActive) return;

    // 更新回合数
    if (DOM.elements.turnNumber) {
      DOM.elements.turnNumber.textContent = BattleState.turn;
    }

    // 更新敌人信息
    const enemy = BattleState.enemy;
    if (enemy) {
      if (DOM.elements.enemyName) {
        DOM.elements.enemyName.textContent = enemy.name;
      }
      if (DOM.elements.enemyLevel) {
        DOM.elements.enemyLevel.textContent = `Lv.${enemy.level}`;
      }
      if (DOM.elements.enemyHpDisplay) {
        DOM.elements.enemyHpDisplay.textContent = `${enemy.hp} / ${enemy.maxHp}`;
      }
      if (DOM.elements.enemyHpBar) {
        DOM.elements.enemyHpBar.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
      }

      // 更新敌人意图
      if (DOM.elements.intentValue && enemy.currentIntent) {
        DOM.elements.intentValue.textContent = EnemySystem.getIntentDescription(enemy.currentIntent);
      }
    }

    // 更新玩家状态
    if (DOM.elements.battleHp) {
      DOM.elements.battleHp.textContent = BattleState.playerHp;
    }
    if (DOM.elements.battleBlock) {
      DOM.elements.battleBlock.textContent = BattleState.block;
    }
    if (DOM.elements.energyCurrent) {
      DOM.elements.energyCurrent.textContent = BattleState.energy;
    }
    if (DOM.elements.energyMax) {
      DOM.elements.energyMax.textContent = BattleState.maxEnergy;
    }

    // 更新牌堆数量
    if (DOM.elements.drawPileCount) {
      DOM.elements.drawPileCount.textContent = BattleState.drawPile.length;
    }
    if (DOM.elements.discardPileCount) {
      DOM.elements.discardPileCount.textContent = BattleState.discardPile.length;
    }

    // 更新手牌
    this.renderHand();

    // 更新战斗日志
    this.renderCombatLog();
  },

  /**
   * 渲染手牌
   */
  renderHand() {
    const handContainer = DOM.elements.handCards;
    if (!handContainer) return;

    handContainer.innerHTML = BattleState.hand.map((card, index) => card.toHTML(index)).join('');

    // 绑定卡牌点击事件
    handContainer.querySelectorAll('.game-card').forEach(cardEl => {
      cardEl.addEventListener('click', () => {
        const index = parseInt(cardEl.dataset.index, 10);
        this.handleCardClick(index);
      });
    });
  },

  /**
   * 处理卡牌点击
   * @param {number} index - 卡牌索引
   */
  handleCardClick(index) {
    const card = BattleState.hand[index];
    if (!card) return;

    if (BattleState.energy < card.cost) {
      showToast('能量不足');
      return;
    }

    // 播放卡牌
    const result = card.play(BattleState, BattleState.enemy);

    if (result.success) {
      // 记录战斗日志
      this.logCombat(`使用了 ${card.name}`);

      // 从手牌移除
      BattleState.hand.splice(index, 1);

      // 放入弃牌堆或消耗
      if (card.exhaust) {
        BattleState.exhaustPile.push(card);
      } else {
        BattleState.discardPile.push(card);
      }

      // 检查敌人是否死亡
      if (BattleState.enemy.hp <= 0) {
        this.victory();
        return;
      }

      this.updateBattleUI();
    }
  },

  /**
   * 结束回合
   */
  endTurn() {
    // 敌人行动
    const result = EnemySystem.executeIntent(BattleState.enemy, BattleState);

    if (result.type === 'attack') {
      this.logCombat(`${BattleState.enemy.name} 发动攻击，造成 ${result.actualDamage} 点伤害`);

      // 同步玩家HP到GameVariables（MVU系统）
      this.syncPlayerHpToMVU();
    } else if (result.type === 'defend') {
      this.logCombat(`${BattleState.enemy.name} 获得 ${result.block} 点格挡`);
    } else if (result.type === 'buff') {
      this.logCombat(`${BattleState.enemy.name} 强化了自己`);
    }

    // 检查玩家是否死亡
    if (BattleState.playerHp <= 0) {
      this.defeat();
      return;
    }

    // 弃掉手牌
    CardSystem.discardHand(BattleState);

    // 处理敌人回合开始效果
    EnemySystem.onTurnStart(BattleState.enemy);

    // 新回合
    BattleState.turn++;
    BattleState.energy = BattleState.maxEnergy;
    BattleState.block = 0;

    // 敌人准备下一个意图 - 使用统一的意图系统
    this.rollUnifiedIntent(BattleState.enemy);

    // 抽牌
    CardSystem.drawCards(BattleState, 5);

    this.logCombat(`--- 第 ${BattleState.turn} 回合 ---`);
    this.updateBattleUI();
  },

  /**
   * 从MVU系统同步HP到战斗状态
   * 解决HP双系统冲突问题
   */
  syncHpFromMVU() {
    // 优先使用GameVariables的HP（MVU系统）
    if (typeof GameVariables !== 'undefined' && GameVariables.battle && GameVariables.battle.core) {
      BattleState.playerHp = GameVariables.battle.core.hp;
      BattleState.playerMaxHp = GameVariables.battle.core.max_hp;
    } else {
      // 回退到GameState.character
      BattleState.playerHp = GameState.character.hp;
      BattleState.playerMaxHp = GameState.character.maxHp;
    }

    // 同步GameState.character以保持一致性
    GameState.character.hp = BattleState.playerHp;
    GameState.character.maxHp = BattleState.playerMaxHp;
  },

  /**
   * 同步玩家HP到MVU系统和GameState
   * 确保所有HP系统保持一致
   */
  syncPlayerHpToMVU() {
    // 同步到GameVariables（MVU系统）
    if (typeof GameVariables !== 'undefined' && GameVariables.battle && GameVariables.battle.core) {
      const oldHp = GameVariables.battle.core.hp;
      GameVariables.battle.core.hp = BattleState.playerHp;
      GameVariables.battle.core.max_hp = BattleState.playerMaxHp;

      // 触发变更事件
      if (typeof VariableChangeEmitter !== 'undefined' && oldHp !== BattleState.playerHp) {
        VariableChangeEmitter.emit('/battle/core/hp', BattleState.playerHp, oldHp);
      }
    }

    // 同步到GameState.character
    GameState.character.hp = BattleState.playerHp;
    GameState.character.maxHp = BattleState.playerMaxHp;
  },

  /**
   * 同步所有HP系统
   * 可在任意时刻调用以确保HP一致性
   * @param {number} hp - 新的HP值
   * @param {number} maxHp - 新的最大HP值（可选）
   */
  syncAllHpSystems(hp, maxHp = null) {
    // 更新BattleState
    BattleState.playerHp = hp;
    if (maxHp !== null) {
      BattleState.playerMaxHp = maxHp;
    }

    // 同步到其他系统
    this.syncPlayerHpToMVU();

    // 更新UI
    if (typeof GameUI !== 'undefined') {
      GameUI.updateCharacterPanel();
    }
  },

  /**
   * 同步敌人状态到MVU系统
   */
  syncEnemyToMVU() {
    if (typeof GameVariables !== 'undefined' && BattleState.enemy) {
      GameVariables.battle.enemy = {
        name: BattleState.enemy.name,
        emoji: BattleState.enemy.emoji || '👹',
        hp: BattleState.enemy.hp,
        max_hp: BattleState.enemy.maxHp,
        description: BattleState.enemy.description,
        actions: BattleState.enemy.actions || [],
        abilities: BattleState.enemy.abilities || [],
        status_effects: BattleState.enemy.statusEffects || [],
        action_mode: BattleState.enemy.actionMode || 'random',
        action_config: BattleState.enemy.actionConfig || {},
        block: BattleState.enemy.block || 0,
      };
    }
  },

  /**
   * 战斗胜利
   */
  victory() {
    BattleState.isActive = false;
    this.logCombat(`战斗胜利！击败了 ${BattleState.enemy.name}！`);

    // 奖励
    const goldReward = 10 + Math.floor(Math.random() * 20) + BattleState.enemy.level * 5;
    GameState.character.gold += goldReward;
    GameState.character.hp = BattleState.playerHp;

    // 同步战斗结果到MVU系统
    this.syncPlayerHpToMVU();

    // 清除敌人信息
    if (typeof GameVariables !== 'undefined') {
      GameVariables.battle.enemy = null;
    }

    showToast(`战斗胜利！获得 ${goldReward} 金币`);

    setTimeout(() => {
      this.hideBattleUI();
      if (typeof NarrativeSystem !== 'undefined') {
        NarrativeSystem.addEntry(
          `你击败了${BattleState.enemy.name}，获得了 ${goldReward} 金币作为战利品。`,
          'combat-result',
        );
      }
      if (typeof GameUI !== 'undefined') {
        GameUI.updateCharacterPanel();
      }
    }, 1500);
  },

  /**
   * 战斗失败
   */
  defeat() {
    BattleState.isActive = false;
    this.logCombat('战斗失败...');

    // 同步战斗结果到MVU系统
    this.syncPlayerHpToMVU();

    showToast('你被击败了...');

    setTimeout(() => {
      this.hideBattleUI();
      if (typeof NarrativeSystem !== 'undefined') {
        NarrativeSystem.addEntry('你在战斗中倒下了...世界逐渐陷入黑暗...', 'system');
      }
    }, 1500);
  },

  /**
   * 尝试撤退
   * @returns {boolean} - 是否成功撤退
   */
  tryFlee() {
    const fleeChance = 0.5 - BattleState.enemy.level * 0.05;
    const success = Math.random() < fleeChance;

    if (success) {
      BattleState.isActive = false;
      this.hideBattleUI();
      if (typeof NarrativeSystem !== 'undefined') {
        NarrativeSystem.addEntry('你成功逃离了战斗！', 'system');
      }
      showToast('成功撤退');
      return true;
    } else {
      showToast('撤退失败！');
      this.logCombat('撤退失败！敌人趁机发动攻击！');
      // 撤退失败，敌人立即行动
      this.endTurn();
      return false;
    }
  },

  /**
   * 记录战斗日志
   * @param {string} message - 日志消息
   */
  logCombat(message) {
    BattleState.combatLog.push({
      time: Date.now(),
      message: message,
    });

    // 限制日志长度
    if (BattleState.combatLog.length > 50) {
      BattleState.combatLog.shift();
    }
  },

  /**
   * 渲染战斗日志
   */
  renderCombatLog() {
    const logContainer = DOM.elements.combatLog;
    if (!logContainer) return;

    logContainer.innerHTML = BattleState.combatLog
      .slice(-10)
      .map(entry => `<div class="combat-log-entry">${entry.message}</div>`)
      .join('');
    logContainer.scrollTop = logContainer.scrollHeight;
  },

  /**
   * 绑定战斗相关事件
   */
  bindEvents() {
    // 结束回合按钮
    const endTurnBtn = document.getElementById('btn-end-turn');
    if (endTurnBtn) {
      endTurnBtn.addEventListener('click', () => {
        if (BattleState.isActive) {
          this.endTurn();
        }
      });
    }

    // 撤退按钮
    const fleeBtn = document.getElementById('btn-flee');
    if (fleeBtn) {
      fleeBtn.addEventListener('click', () => {
        if (BattleState.isActive) {
          this.tryFlee();
        }
      });
    }
  },
};

// 导出
window.BattleSystem = BattleSystem;
