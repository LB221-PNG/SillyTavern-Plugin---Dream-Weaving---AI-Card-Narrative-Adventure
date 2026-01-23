/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 存档系统（接口）- V2版本
 * 使用单个localStorage键管理多个游戏存档
 * ============================================================ */

/**
 * 存档系统 V2
 * 使用单个顶层键DREAMWEAVER_ARCHIVES_V2管理所有存档
 * 每个存档以名称为键，支持自定义命名
 */
const SaveSystem = {
  // V2版本使用单个键管理所有存档
  ARCHIVES_KEY: 'DREAMWEAVER_ARCHIVES_V2',
  // V1版本的旧键（用于迁移）
  LEGACY_SAVE_KEY_PREFIX: 'dreamweaver_save_',
  LEGACY_SAVE_KEY: 'dreamweaver_save',
  LEGACY_CURRENT_SLOT_KEY: 'dreamweaver_current_slot',
  // 设置键
  SETTINGS_KEY: 'dreamweaver_settings',
  // 版本号
  VERSION: '0.3.0',
  // 最大存档数量
  MAX_ARCHIVES: 10,
  // 当前存档名称
  currentArchiveName: null,

  /**
   * 初始化存档系统
   * 检查并执行数据迁移
   */
  init() {
    this.migrateFromV1();
    // 恢复当前存档名称
    const archives = this.getAllArchives();
    const savedCurrentName = localStorage.getItem('dreamweaver_current_archive');
    if (savedCurrentName && archives[savedCurrentName]) {
      this.currentArchiveName = savedCurrentName;
    }
    console.log('SaveSystem V2 已初始化');
  },

  /**
   * 从V1版本迁移数据到V2
   * V1使用多个键（dreamweaver_save_0, dreamweaver_save_1等）
   * V2使用单个键管理所有存档
   */
  migrateFromV1() {
    // 检查是否已经有V2存档
    const existingV2 = localStorage.getItem(this.ARCHIVES_KEY);
    if (existingV2) {
      console.log('V2存档已存在，跳过迁移');
      return;
    }

    const migratedArchives = {};
    let hasMigrated = false;

    // 迁移旧版单键存档
    const legacySave = localStorage.getItem(this.LEGACY_SAVE_KEY);
    if (legacySave) {
      try {
        const parsed = JSON.parse(legacySave);
        const archiveName = this._generateArchiveName(parsed, '存档');
        migratedArchives[archiveName] = this._convertLegacySaveData(parsed);
        hasMigrated = true;
        console.log(`迁移旧版存档: ${archiveName}`);
      } catch (e) {
        console.error('迁移旧版存档失败:', e);
      }
    }

    // 迁移多槽位存档
    for (let i = 0; i < 5; i++) {
      const slotKey = `${this.LEGACY_SAVE_KEY_PREFIX}${i}`;
      const slotSave = localStorage.getItem(slotKey);
      if (slotSave) {
        try {
          const parsed = JSON.parse(slotSave);
          const archiveName = this._generateArchiveName(parsed, `槽位${i + 1}`);
          // 避免重复名称
          let finalName = archiveName;
          let counter = 1;
          while (migratedArchives[finalName]) {
            finalName = `${archiveName}_${counter}`;
            counter++;
          }
          migratedArchives[finalName] = this._convertLegacySaveData(parsed);
          hasMigrated = true;
          console.log(`迁移槽位${i}存档: ${finalName}`);
        } catch (e) {
          console.error(`迁移槽位${i}存档失败:`, e);
        }
      }
    }

    if (hasMigrated) {
      // 保存迁移后的数据
      localStorage.setItem(this.ARCHIVES_KEY, JSON.stringify(migratedArchives));

      // 清理旧版数据
      localStorage.removeItem(this.LEGACY_SAVE_KEY);
      for (let i = 0; i < 5; i++) {
        localStorage.removeItem(`${this.LEGACY_SAVE_KEY_PREFIX}${i}`);
      }
      localStorage.removeItem(this.LEGACY_CURRENT_SLOT_KEY);

      console.log('V1到V2数据迁移完成，已清理旧版数据');
      if (typeof showToast === 'function') {
        showToast('存档已自动升级到新版本');
      }
    }
  },

  /**
   * 生成存档名称
   * @param {Object} saveData - 存档数据
   * @param {string} fallback - 默认名称
   * @returns {string} - 存档名称
   */
  _generateArchiveName(saveData, fallback) {
    const characterName = saveData.gameState?.character?.name;
    if (characterName && characterName !== '未命名') {
      const timestamp = saveData.timestamp ? new Date(saveData.timestamp).toLocaleDateString('zh-CN') : '';
      return timestamp ? `${characterName}_${timestamp}` : characterName;
    }
    return fallback;
  },

  /**
   * 转换旧版存档数据格式
   * @param {Object} legacyData - 旧版存档数据
   * @returns {Object} - 新版存档数据
   */
  _convertLegacySaveData(legacyData) {
    return {
      version: this.VERSION,
      createdAt: legacyData.timestamp || Date.now(),
      updatedAt: Date.now(),
      gameState: legacyData.gameState || {},
      battleState: legacyData.battleState || {},
      gameVariables: legacyData.gameVariables || {},
      summaries: legacyData.summaries || [],
      smallSummaries: legacyData.smallSummaries || [],
      summaryConfig: legacyData.summaryConfig || {},
    };
  },

  /**
   * 获取所有存档
   * @returns {Object} - 存档对象，键为存档名称
   */
  getAllArchives() {
    try {
      const data = localStorage.getItem(this.ARCHIVES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('读取存档失败:', e);
      return {};
    }
  },

  /**
   * 保存所有存档
   * @param {Object} archives - 存档对象
   */
  _saveAllArchives(archives) {
    try {
      localStorage.setItem(this.ARCHIVES_KEY, JSON.stringify(archives));
    } catch (e) {
      console.error('保存存档失败:', e);
      throw e;
    }
  },

  /**
   * 创建新存档
   * @param {string} archiveName - 存档名称
   * @returns {boolean} - 是否创建成功
   */
  createNewArchive(archiveName) {
    if (!archiveName || archiveName.trim() === '') {
      showToast('存档名称不能为空');
      return false;
    }

    const archives = this.getAllArchives();

    if (archives[archiveName]) {
      showToast('存档已存在！');
      return false;
    }

    if (Object.keys(archives).length >= this.MAX_ARCHIVES) {
      showToast(`最多只能创建 ${this.MAX_ARCHIVES} 个存档`);
      return false;
    }

    archives[archiveName] = {
      version: this.VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gameState: this._getInitialGameState(),
      battleState: this._getInitialBattleState(),
      gameVariables: this._getInitialGameVariables(),
      summaries: [],
      smallSummaries: [],
      summaryConfig: {},
    };

    this._saveAllArchives(archives);
    this.currentArchiveName = archiveName;
    localStorage.setItem('dreamweaver_current_archive', archiveName);
    showToast(`存档 "${archiveName}" 已创建`);
    return true;
  },

  /**
   * 获取初始游戏状态
   */
  _getInitialGameState() {
    return {
      currentPage: 'home',
      previousPage: 'home',
      character: typeof GameState !== 'undefined' ? { ...GameState.character } : {},
      world: typeof GameState !== 'undefined' ? { ...GameState.world } : {},
    };
  },

  /**
   * 获取初始战斗状态
   */
  _getInitialBattleState() {
    return {
      isActive: false,
      turn: 1,
      energy: 3,
      maxEnergy: 3,
      block: 0,
      playerHp: 80,
      playerMaxHp: 80,
      enemy: null,
      deck: [],
      combatLog: [],
    };
  },

  /**
   * 获取初始游戏变量
   */
  _getInitialGameVariables() {
    if (typeof GameVariables !== 'undefined') {
      return {
        status: JSON.parse(JSON.stringify(GameVariables.status)),
        battle: JSON.parse(JSON.stringify(GameVariables.battle)),
        factions: JSON.parse(JSON.stringify(GameVariables.factions)),
        npcs: JSON.parse(JSON.stringify(GameVariables.npcs)),
        reward: JSON.parse(JSON.stringify(GameVariables.reward)),
      };
    }
    return {};
  },

  /**
   * 保存游戏到指定存档
   * @param {string} archiveName - 存档名称（可选，默认当前存档）
   * @returns {boolean} - 是否保存成功
   */
  save(archiveName = null) {
    const targetName = archiveName || this.currentArchiveName;
    if (!targetName) {
      showToast('请先选择或创建存档');
      return false;
    }

    try {
      const archives = this.getAllArchives();

      const saveData = {
        version: this.VERSION,
        createdAt: archives[targetName]?.createdAt || Date.now(),
        updatedAt: Date.now(),
        gameState: {
          currentPage: GameState.currentPage,
          previousPage: GameState.previousPage,
          character: { ...GameState.character },
          world: { ...GameState.world },
        },
        battleState: {
          isActive: BattleState.isActive,
          turn: BattleState.turn,
          energy: BattleState.energy,
          maxEnergy: BattleState.maxEnergy,
          block: BattleState.block,
          playerHp: BattleState.playerHp,
          playerMaxHp: BattleState.playerMaxHp,
          enemy: BattleState.enemy ? { ...BattleState.enemy } : null,
          deck: BattleState.deck.map(card => (card.toSaveData ? card.toSaveData() : card)),
          combatLog: [...BattleState.combatLog],
        },
        gameVariables: {
          status: JSON.parse(JSON.stringify(GameVariables.status)),
          battle: {
            ...JSON.parse(JSON.stringify(GameVariables.battle)),
            // 确保仓库数据被正确保存
            warehouse: JSON.parse(JSON.stringify(GameVariables.battle.warehouse || [])),
          },
          factions: JSON.parse(JSON.stringify(GameVariables.factions)),
          npcs: JSON.parse(JSON.stringify(GameVariables.npcs)),
          reward: JSON.parse(JSON.stringify(GameVariables.reward)),
        },
        summaries: JSON.parse(JSON.stringify(GameState.summaries || [])),
        smallSummaries: JSON.parse(JSON.stringify(GameState.smallSummaries || [])),
        summaryConfig: JSON.parse(JSON.stringify(GameState.summaryConfig || {})),
      };

      archives[targetName] = saveData;
      this._saveAllArchives(archives);

      showToast(`游戏已保存到 "${targetName}"`);
      return true;
    } catch (e) {
      console.error('保存失败:', e);
      showToast('保存失败');
      return false;
    }
  },

  /**
   * 加载游戏
   * @param {string} archiveName - 存档名称
   * @returns {boolean} - 是否加载成功
   */
  load(archiveName) {
    if (!archiveName) {
      showToast('请选择要加载的存档');
      return false;
    }

    try {
      const archives = this.getAllArchives();
      const archiveData = archives[archiveName];

      if (!archiveData) {
        showToast(`存档 "${archiveName}" 不存在`);
        return false;
      }

      // 更新当前存档名称
      this.currentArchiveName = archiveName;
      localStorage.setItem('dreamweaver_current_archive', archiveName);

      // 恢复游戏状态
      if (archiveData.gameState) {
        GameState.currentPage = archiveData.gameState.currentPage || 'home';
        GameState.previousPage = archiveData.gameState.previousPage || 'home';
        Object.assign(GameState.character, archiveData.gameState.character);
        Object.assign(GameState.world, archiveData.gameState.world);
      }

      // 恢复战斗状态
      if (archiveData.battleState) {
        BattleState.isActive = archiveData.battleState.isActive || false;
        BattleState.turn = archiveData.battleState.turn || 1;
        BattleState.energy = archiveData.battleState.energy || 3;
        BattleState.maxEnergy = archiveData.battleState.maxEnergy || 3;
        BattleState.block = archiveData.battleState.block || 0;
        BattleState.playerHp = archiveData.battleState.playerHp || 80;
        BattleState.playerMaxHp = archiveData.battleState.playerMaxHp || 80;
        BattleState.enemy = archiveData.battleState.enemy;
        BattleState.combatLog = archiveData.battleState.combatLog || [];

        // 恢复卡组
        if (archiveData.battleState.deck && typeof CardSystem !== 'undefined' && CardSystem.createDeckFromData) {
          BattleState.deck = CardSystem.createDeckFromData(archiveData.battleState.deck);
        }
      }

      // 恢复GameVariables
      if (archiveData.gameVariables) {
        if (archiveData.gameVariables.status) {
          Object.assign(GameVariables.status, archiveData.gameVariables.status);
          if (archiveData.gameVariables.status.clothing) {
            Object.assign(GameVariables.status.clothing, archiveData.gameVariables.status.clothing);
          }
        }

        if (archiveData.gameVariables.battle) {
          Object.assign(GameVariables.battle, archiveData.gameVariables.battle);
          if (archiveData.gameVariables.battle.core) {
            Object.assign(GameVariables.battle.core, archiveData.gameVariables.battle.core);
          }
          // 恢复仓库数据
          if (archiveData.gameVariables.battle.warehouse) {
            GameVariables.battle.warehouse = archiveData.gameVariables.battle.warehouse;
          } else {
            GameVariables.battle.warehouse = [];
          }
        }

        if (archiveData.gameVariables.factions) {
          Object.assign(GameVariables.factions, archiveData.gameVariables.factions);
        }

        if (archiveData.gameVariables.npcs) {
          GameVariables.npcs = archiveData.gameVariables.npcs;
        }

        if (archiveData.gameVariables.reward) {
          Object.assign(GameVariables.reward, archiveData.gameVariables.reward);
        }

        console.log('GameVariables已从存档恢复');
      }

      // 恢复总结数据
      if (archiveData.summaries) {
        GameState.summaries = archiveData.summaries;
      }
      if (archiveData.smallSummaries) {
        GameState.smallSummaries = archiveData.smallSummaries;
      }
      if (archiveData.summaryConfig) {
        Object.assign(GameState.summaryConfig, archiveData.summaryConfig);
      }
      console.log('总结数据已从存档恢复');

      showToast(`存档 "${archiveName}" 已加载`);
      return true;
    } catch (e) {
      console.error('加载失败:', e);
      showToast('加载失败');
      return false;
    }
  },

  /**
   * 检查是否有存档
   * @param {string} archiveName - 存档名称（可选）
   * @returns {boolean} - 是否存在存档
   */
  hasSave(archiveName = null) {
    const archives = this.getAllArchives();
    if (archiveName) {
      return archives[archiveName] !== undefined;
    }
    return Object.keys(archives).length > 0;
  },

  /**
   * 获取所有存档列表信息
   * @returns {Array} - 存档信息数组
   */
  getAllSlots() {
    const archives = this.getAllArchives();
    const slots = [];

    Object.keys(archives).forEach((name, index) => {
      const archive = archives[name];
      slots.push({
        slot: index,
        name: name,
        isEmpty: false,
        info: this._extractArchiveInfo(archive, name),
      });
    });

    return slots;
  },

  /**
   * 提取存档信息用于显示
   * @param {Object} archive - 存档数据
   * @param {string} name - 存档名称
   * @returns {Object} - 存档信息
   */
  _extractArchiveInfo(archive, name) {
    return {
      name: name,
      version: archive.version,
      timestamp: archive.updatedAt || archive.createdAt,
      characterName: archive.gameState?.character?.name || '未命名',
      floor: archive.gameState?.character?.floor || 1,
      gold: archive.gameState?.character?.gold || 0,
      hp: archive.gameVariables?.battle?.core?.hp || archive.gameState?.character?.hp || 80,
      maxHp: archive.gameVariables?.battle?.core?.max_hp || archive.gameState?.character?.maxHp || 80,
    };
  },

  /**
   * 获取指定存档的信息
   * @param {string|number} archiveNameOrSlot - 存档名称或槽位索引
   * @returns {Object|null} - 存档信息或null
   */
  getSlotInfo(archiveNameOrSlot) {
    try {
      const archives = this.getAllArchives();

      // 如果是数字，按槽位索引获取
      if (typeof archiveNameOrSlot === 'number') {
        const names = Object.keys(archives);
        if (archiveNameOrSlot < 0 || archiveNameOrSlot >= names.length) {
          return null;
        }
        const name = names[archiveNameOrSlot];
        return this._extractArchiveInfo(archives[name], name);
      }

      // 如果是字符串，按名称获取
      const archive = archives[archiveNameOrSlot];
      if (!archive) return null;
      return this._extractArchiveInfo(archive, archiveNameOrSlot);
    } catch (e) {
      return null;
    }
  },

  /**
   * 删除存档
   * @param {string} archiveName - 存档名称
   * @returns {boolean} - 是否删除成功
   */
  deleteSave(archiveName) {
    if (!archiveName) {
      showToast('请指定要删除的存档');
      return false;
    }

    try {
      const archives = this.getAllArchives();

      if (!archives[archiveName]) {
        showToast(`存档 "${archiveName}" 不存在`);
        return false;
      }

      delete archives[archiveName];
      this._saveAllArchives(archives);

      // 如果删除的是当前存档，清空当前存档名称
      if (this.currentArchiveName === archiveName) {
        this.currentArchiveName = null;
        localStorage.removeItem('dreamweaver_current_archive');
      }

      showToast(`存档 "${archiveName}" 已删除`);
      return true;
    } catch (e) {
      console.error('删除存档失败:', e);
      return false;
    }
  },

  /**
   * 复制存档
   * @param {string} fromName - 源存档名称
   * @param {string} toName - 目标存档名称
   * @returns {boolean} - 是否复制成功
   */
  copySave(fromName, toName) {
    if (!fromName || !toName) {
      showToast('请指定源存档和目标存档名称');
      return false;
    }

    try {
      const archives = this.getAllArchives();

      if (!archives[fromName]) {
        showToast(`源存档 "${fromName}" 不存在`);
        return false;
      }

      if (archives[toName]) {
        showToast(`目标存档 "${toName}" 已存在`);
        return false;
      }

      if (Object.keys(archives).length >= this.MAX_ARCHIVES) {
        showToast(`最多只能创建 ${this.MAX_ARCHIVES} 个存档`);
        return false;
      }

      // 深拷贝存档数据
      const copiedData = JSON.parse(JSON.stringify(archives[fromName]));
      copiedData.createdAt = Date.now();
      copiedData.updatedAt = Date.now();

      archives[toName] = copiedData;
      this._saveAllArchives(archives);

      showToast(`存档已复制到 "${toName}"`);
      return true;
    } catch (e) {
      console.error('复制存档失败:', e);
      showToast('复制失败');
      return false;
    }
  },

  /**
   * 重命名存档
   * @param {string} oldName - 旧名称
   * @param {string} newName - 新名称
   * @returns {boolean} - 是否重命名成功
   */
  renameArchive(oldName, newName) {
    if (!oldName || !newName) {
      showToast('请指定存档名称');
      return false;
    }

    if (oldName === newName) {
      return true;
    }

    try {
      const archives = this.getAllArchives();

      if (!archives[oldName]) {
        showToast(`存档 "${oldName}" 不存在`);
        return false;
      }

      if (archives[newName]) {
        showToast(`存档 "${newName}" 已存在`);
        return false;
      }

      // 移动数据到新键
      archives[newName] = archives[oldName];
      archives[newName].updatedAt = Date.now();
      delete archives[oldName];

      this._saveAllArchives(archives);

      // 如果重命名的是当前存档，更新引用
      if (this.currentArchiveName === oldName) {
        this.currentArchiveName = newName;
        localStorage.setItem('dreamweaver_current_archive', newName);
      }

      showToast(`存档已重命名为 "${newName}"`);
      return true;
    } catch (e) {
      console.error('重命名存档失败:', e);
      showToast('重命名失败');
      return false;
    }
  },

  /**
   * 保存设置
   * @param {boolean} silent - 是否静默保存（不显示提示）
   */
  saveSettings(silent = false) {
    try {
      const settings = {
        apiEndpoint: GameState.settings.apiEndpoint,
        apiKey: GameState.settings.apiKey,
        modelName: GameState.settings.modelName,
        temperature: GameState.settings.temperature,
        maxTokens: GameState.settings.maxTokens,
        useTavernApi: GameState.settings.useTavernApi,
        theme: GameState.settings.theme,
      };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      if (!silent) {
        showToast('设置已保存');
      }
    } catch (e) {
      console.error('保存设置失败:', e);
      if (!silent) {
        showToast('保存设置失败');
      }
    }
  },

  /**
   * 加载设置
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        Object.assign(GameState.settings, settings);

        // 更新UI元素（如果已缓存）
        if (DOM.cached && DOM.elements.apiEndpoint) {
          DOM.elements.apiEndpoint.value = settings.apiEndpoint || '';
          DOM.elements.apiKey.value = settings.apiKey || '';
          DOM.elements.modelName.value = settings.modelName || 'gpt-4';
          DOM.elements.temperature.value = settings.temperature || 0.7;
          DOM.elements.tempValue.textContent = settings.temperature || 0.7;
          DOM.elements.maxTokens.value = settings.maxTokens || 2048;
          DOM.elements.tokenValue.textContent = settings.maxTokens || 2048;
        }
      }
    } catch (e) {
      console.error('加载设置失败:', e);
    }
  },

  /**
   * 获取存档信息（兼容旧版API）
   * @returns {Object|null} - 存档信息或null
   */
  getSaveInfo() {
    if (this.currentArchiveName) {
      return this.getSlotInfo(this.currentArchiveName);
    }
    return null;
  },

  /**
   * 获取当前存档名称
   * @returns {string|null} - 当前存档名称
   */
  getCurrentArchiveName() {
    return this.currentArchiveName;
  },

  /**
   * 设置当前存档
   * @param {string} archiveName - 存档名称
   */
  setCurrentArchive(archiveName) {
    const archives = this.getAllArchives();
    if (archives[archiveName]) {
      this.currentArchiveName = archiveName;
      localStorage.setItem('dreamweaver_current_archive', archiveName);
    }
  },

  /**
   * 导出所有存档为JSON文件
   * @param {string} archiveName - 可选，指定导出单个存档
   */
  exportSave(archiveName = null) {
    try {
      const archives = this.getAllArchives();

      if (Object.keys(archives).length === 0) {
        showToast('没有可导出的存档');
        return;
      }

      let exportData;
      let fileName;

      if (archiveName && archives[archiveName]) {
        // 导出单个存档
        exportData = {
          type: 'single',
          name: archiveName,
          data: archives[archiveName],
        };
        fileName = `dreamweaver_${archiveName}_${Date.now()}.json`;
      } else {
        // 导出所有存档
        exportData = {
          type: 'all',
          data: archives,
        };
        fileName = `dreamweaver_all_saves_${Date.now()}.json`;
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('存档已导出');
    } catch (e) {
      console.error('导出存档失败:', e);
      showToast('导出失败');
    }
  },

  /**
   * 从JSON文件导入存档
   * @param {File} file - JSON文件
   * @returns {Promise<boolean>} - 是否导入成功
   */
  async importSave(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const importData = JSON.parse(event.target.result);

          // 检查是否是新版格式
          if (importData.type === 'single' && importData.name && importData.data) {
            // 导入单个存档
            const archives = this.getAllArchives();
            let name = importData.name;
            let counter = 1;
            while (archives[name]) {
              name = `${importData.name}_${counter}`;
              counter++;
            }
            archives[name] = importData.data;
            this._saveAllArchives(archives);
            showToast(`存档 "${name}" 已导入`);
            resolve(true);
          } else if (importData.type === 'all' && importData.data) {
            // 导入所有存档
            const archives = this.getAllArchives();
            let importCount = 0;
            for (const [name, data] of Object.entries(importData.data)) {
              let finalName = name;
              let counter = 1;
              while (archives[finalName]) {
                finalName = `${name}_${counter}`;
                counter++;
              }
              archives[finalName] = data;
              importCount++;
            }
            this._saveAllArchives(archives);
            showToast(`已导入 ${importCount} 个存档`);
            resolve(true);
          } else if (importData.version && importData.gameState) {
            // 兼容旧版单存档格式
            const archives = this.getAllArchives();
            const name = this._generateArchiveName(importData, '导入存档');
            let finalName = name;
            let counter = 1;
            while (archives[finalName]) {
              finalName = `${name}_${counter}`;
              counter++;
            }
            archives[finalName] = this._convertLegacySaveData(importData);
            this._saveAllArchives(archives);
            showToast(`存档 "${finalName}" 已导入`);
            resolve(true);
          } else {
            showToast('无效的存档文件');
            resolve(false);
          }
        } catch (e) {
          console.error('导入存档失败:', e);
          showToast('导入失败：文件格式错误');
          resolve(false);
        }
      };
      reader.onerror = () => {
        showToast('读取文件失败');
        resolve(false);
      };
      reader.readAsText(file);
    });
  },

  // ============================================================
  // 兼容旧版API（向后兼容）
  // ============================================================

  /**
   * 兼容旧版：设置当前槽位
   * @deprecated 请使用 setCurrentArchive
   */
  setCurrentSlot(slot) {
    const slots = this.getAllSlots();
    if (slot >= 0 && slot < slots.length) {
      this.setCurrentArchive(slots[slot].name);
    }
  },

  /**
   * 兼容旧版：获取当前槽位
   * @deprecated 请使用 getCurrentArchiveName
   */
  getCurrentSlot() {
    const archives = this.getAllArchives();
    const names = Object.keys(archives);
    return names.indexOf(this.currentArchiveName);
  },

  /**
   * 兼容旧版：获取槽位key
   * @deprecated V2不再使用多个key
   */
  getSlotKey(slot) {
    console.warn('getSlotKey已弃用，V2使用单个ARCHIVES_KEY');
    return `${this.LEGACY_SAVE_KEY_PREFIX}${slot}`;
  },
};

// 导出存档系统
window.SaveSystem = SaveSystem;

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SaveSystem.init());
} else {
  SaveSystem.init();
}
