/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 叙事系统
 * ============================================================ */

/**
 * 叙事系统 - 完全独立于战斗系统
 */
const NarrativeSystem = {
  entries: [],
  isProcessing: false,

  /**
   * 添加叙事条目
   * @param {string} content - 内容
   * @param {string} type - 类型（normal/system/player/combat-result）
   */
  addEntry(content, type = 'normal') {
    const entry = {
      id: Date.now(),
      content: content,
      type: type,
      timestamp: new Date().toLocaleTimeString(),
    };

    this.entries.push(entry);
    this.render();
  },

  /**
   * 清空叙事
   */
  clear() {
    this.entries = [];
    this.render();
  },

  /**
   * 渲染叙事内容
   */
  render() {
    const container = DOM.elements.narrativeContent;
    if (!container) return;

    container.innerHTML = this.entries
      .map(entry => {
        let className = 'narrative-entry';
        if (entry.type === 'system') className += ' system';
        if (entry.type === 'combat-result') className += ' combat-result';
        if (entry.type === 'player') className += ' player';

        return `<div class="${className}">${entry.content}</div>`;
      })
      .join('');

    container.scrollTop = container.scrollHeight;
  },

  /**
   * 处理玩家输入
   * @param {string} input - 玩家输入
   */
  async processInput(input) {
    if (this.isProcessing || !input.trim()) return;

    this.isProcessing = true;

    // 添加玩家输入
    this.addEntry(`> ${input}`, 'player');

    // 检查是否触发战斗
    if (this.checkCombatTrigger(input)) {
      this.addEntry('一个敌人出现了！战斗即将开始...', 'system');
      setTimeout(() => {
        BattleSystem.startRandom();
      }, 1000);
      this.isProcessing = false;
      return;
    }

    // 检查是否是探索命令
    if (this.checkExplorationCommand(input)) {
      this.handleExploration(input);
      this.isProcessing = false;
      return;
    }

    // 调用AI生成叙事
    if (GameState.settings.useTavernApi && this.isTavernAvailable()) {
      // 使用酒馆默认API
      await this.callTavernAIWithRetry(input);
    } else if (GameState.settings.apiKey && GameState.settings.apiEndpoint) {
      // 使用自定义API
      await this.callAIWithRetry(input);
    } else {
      // 模拟响应
      this.addEntry(this.generateSimpleResponse(input));

      // 随机触发事件
      this.checkRandomEvents();
    }

    this.isProcessing = false;
  },

  /**
   * 检查是否触发战斗
   * @param {string} input - 输入文本
   * @returns {boolean} - 是否触发战斗
   */
  checkCombatTrigger(input) {
    const combatKeywords = ['战斗', '攻击', '挑战', '敌人', '怪物', '战', '打', '杀'];
    const hasCombatKeyword = combatKeywords.some(keyword => input.includes(keyword));

    // 有战斗关键词时50%概率触发，否则5%概率随机触发
    if (hasCombatKeyword) {
      return Math.random() > 0.5;
    }
    return Math.random() < 0.05;
  },

  /**
   * 检查是否是探索命令
   * @param {string} input - 输入文本
   * @returns {boolean}
   */
  checkExplorationCommand(input) {
    const explorationKeywords = ['探索', '前进', '继续', '走', '移动', '寻找', '搜索'];
    return explorationKeywords.some(keyword => input.includes(keyword));
  },

  /**
   * 处理探索
   * @param {string} input - 输入文本
   */
  handleExploration(input) {
    const explorationResults = [
      {
        text: '你小心翼翼地探索着前方，发现了一个隐藏的宝箱！',
        reward: { type: 'gold', value: 15 + Math.floor(Math.random() * 20) },
      },
      {
        text: '你在角落发现了一些闪闪发光的金币。',
        reward: { type: 'gold', value: 5 + Math.floor(Math.random() * 10) },
      },
      {
        text: '一条隐秘的小路出现在你面前，你沿着它深入前行...',
        reward: { type: 'floor', value: 1 },
      },
      {
        text: '你发现了一处宁静的休息点，恢复了一些生命值。',
        reward: { type: 'heal', value: 10 + Math.floor(Math.random() * 15) },
      },
      {
        text: '前方似乎没有什么特别的发现，但你感觉到空气中弥漫着不祥的气息...',
        reward: null,
      },
      {
        text: '你触发了一个隐藏的陷阱！受到了一些伤害。',
        reward: { type: 'damage', value: 5 + Math.floor(Math.random() * 10) },
      },
    ];

    const result = explorationResults[Math.floor(Math.random() * explorationResults.length)];
    this.addEntry(result.text);

    // 处理奖励
    if (result.reward) {
      switch (result.reward.type) {
        case 'gold':
          GameState.character.gold += result.reward.value;
          this.addEntry(`获得了 ${result.reward.value} 金币！`, 'system');
          break;
        case 'floor':
          GameState.character.floor += result.reward.value;
          this.addEntry(`进入了第 ${GameState.character.floor} 层！`, 'system');
          break;
        case 'heal': {
          const healAmount = Math.min(result.reward.value, GameState.character.maxHp - GameState.character.hp);
          GameState.character.hp += healAmount;
          this.addEntry(`恢复了 ${healAmount} 点生命值！`, 'system');
          break;
        }
        case 'damage':
          GameState.character.hp = Math.max(1, GameState.character.hp - result.reward.value);
          this.addEntry(`受到了 ${result.reward.value} 点伤害！`, 'system');
          break;
      }

      // 更新UI
      if (typeof GameUI !== 'undefined') {
        GameUI.updateCharacterPanel();
      }
    }
  },

  /**
   * 检查随机事件
   */
  checkRandomEvents() {
    // 10%概率触发随机事件
    if (Math.random() < 0.1) {
      const events = [
        '你隐约听到了远处传来的脚步声...',
        '一阵奇异的风吹过，带来了神秘的低语...',
        '你注意到墙上有一些古老的符文在微微发光...',
        '空气中飘来一股淡淡的花香，让你感到一丝宁静...',
        '你感觉有什么东西在暗处观察着你...',
      ];
      const event = events[Math.floor(Math.random() * events.length)];

      setTimeout(() => {
        this.addEntry(event, 'system');
      }, 2000);
    }
  },

  /**
   * 生成简单响应（无AI时使用）
   * @param {string} input - 输入文本
   * @returns {string} - 响应文本
   */
  generateSimpleResponse(input) {
    const responses = [
      '你继续前行，周围的环境逐渐变得陌生...',
      '远处传来若有若无的声响，似乎有什么东西在注视着你...',
      '你仔细观察着四周，发现了一些有趣的痕迹...',
      '空气中弥漫着奇异的气息，你的直觉告诉你这里并不安全...',
      '你的决定改变了某些事物的走向...',
      '周围一片寂静，只有你自己的脚步声回荡在空旷的空间中...',
      '你感受到了一股神秘的力量在暗中涌动...',
      '前方的道路变得更加曲折，但你决心继续前进...',
      '一丝微弱的光芒从远处透来，似乎在指引着什么...',
      '你停下脚步，思考着接下来的行动...',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },

  /**
   * 带重试机制的AI调用
   * @param {string} input - 玩家输入
   * @param {number} maxRetries - 最大重试次数
   */
  async callAIWithRetry(input, maxRetries = 3) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const rawResponse = await this.callAI(input);

        // 验证响应格式
        const validationResult = this.validateAIResponse(rawResponse);

        if (!validationResult.isValid) {
          console.warn(`AI响应格式验证失败 (尝试 ${attempt}/${maxRetries}):`, validationResult.errors);

          if (attempt === maxRetries) {
            const fallbackContent = this.handleInvalidResponse(rawResponse, validationResult.errors);
            this.addEntry(fallbackContent);
            return;
          }
          continue;
        }

        // 解析并应用变量更新
        const { storyContent, variableUpdated } = this.processAiResponse(rawResponse);

        this.addEntry(storyContent);

        if (variableUpdated) {
          console.log('变量已更新');
        }

        // 自动总结功能：检查是否需要生成小总结
        this.checkAutoSummary(input, storyContent);

        this.checkRandomEvents();
        return;
      } catch (error) {
        lastError = error;
        console.error(`AI调用失败 (尝试 ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          this.addEntry(`（正在重新连接... 第${attempt}次）`, 'system');
        }
      }
    }

    console.error('AI调用最终失败:', lastError);
    this.addEntry('（AI暂时无法响应，请检查API配置或稍后重试）', 'system');
    const fallbackResponse = this.generateSimpleResponse(input);
    this.addEntry(fallbackResponse);
  },

  /**
   * 检查酒馆环境是否可用
   * @returns {boolean}
   */
  isTavernAvailable() {
    return typeof generate === 'function' || (typeof window !== 'undefined' && typeof window.generate === 'function');
  },

  /**
   * 使用酒馆API生成（带重试）
   * @param {string} input - 玩家输入
   * @param {number} maxRetries - 最大重试次数
   */
  async callTavernAIWithRetry(input, maxRetries = 3) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const rawResponse = await this.callTavernAI(input);

        // 验证响应格式
        const validationResult = this.validateAIResponse(rawResponse);

        if (!validationResult.isValid) {
          console.warn(`酒馆AI响应格式验证失败 (尝试 ${attempt}/${maxRetries}):`, validationResult.errors);

          if (attempt === maxRetries) {
            const fallbackContent = this.handleInvalidResponse(rawResponse, validationResult.errors);
            this.addEntry(fallbackContent);
            return;
          }
          continue;
        }

        // 解析并应用变量更新
        const { storyContent, variableUpdated } = this.processAiResponse(rawResponse);

        this.addEntry(storyContent);

        if (variableUpdated) {
          console.log('变量已更新');
        }

        // 自动总结功能
        this.checkAutoSummary(input, storyContent);

        this.checkRandomEvents();
        return;
      } catch (error) {
        lastError = error;
        console.error(`酒馆AI调用失败 (尝试 ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          this.addEntry(`（正在重新连接... 第${attempt}次）`, 'system');
        }
      }
    }

    console.error('酒馆AI调用最终失败:', lastError);
    this.addEntry('（酒馆AI暂时无法响应，请检查酒馆API配置或稍后重试）', 'system');
    const fallbackResponse = this.generateSimpleResponse(input);
    this.addEntry(fallbackResponse);
  },

  /**
   * 使用酒馆API生成叙事
   * @param {string} input - 玩家输入
   * @returns {Promise<string>} - AI响应
   */
  async callTavernAI(input) {
    const systemPrompt = this.buildSystemPrompt();

    // 构建上下文消息
    const contextMessages = this.getRecentContext();

    try {
      // 使用酒馆的generate函数
      const generateFn = typeof generate === 'function' ? generate : window.generate;

      if (!generateFn) {
        throw new Error('酒馆generate函数不可用');
      }

      // 构建注入提示词
      const injects = [
        {
          role: 'system',
          content: systemPrompt,
          position: 'in_chat',
          depth: 0,
          should_scan: false,
        },
      ];

      // 添加上下文作为注入
      contextMessages.forEach((msg, index) => {
        injects.push({
          role: msg.role,
          content: msg.content,
          position: 'in_chat',
          depth: contextMessages.length - index,
          should_scan: false,
        });
      });

      // 调用酒馆generate函数
      const response = await generateFn({
        user_input: input,
        injects: injects,
        should_stream: false,
      });

      if (!response || typeof response !== 'string') {
        throw new Error('酒馆API响应格式不正确');
      }

      return response;
    } catch (error) {
      console.error('酒馆API调用错误:', error);
      throw error;
    }
  },

  /**
   * 根据 API 格式获取正确的温度参数
   * @returns {number} - 温度值
   */
  getTemperatureForFormat() {
    const format = GameState.settings.apiFormat || 'openai';
    switch (format) {
      case 'anthropic':
        return GameState.settings.temperatureAnthropic !== undefined 
          ? GameState.settings.temperatureAnthropic 
          : 1.0;
      case 'gemini':
        return GameState.settings.temperatureGemini !== undefined 
          ? GameState.settings.temperatureGemini 
          : 1.0;
      default:
        return GameState.settings.temperature !== undefined 
          ? GameState.settings.temperature 
          : 0.7;
    }
  },

  /**
   * 调用AI生成叙事
   * @param {string} input - 玩家输入
   * @returns {Promise<string>} - AI响应
   */
  async callAI(input) {
    const systemPrompt = this.buildSystemPrompt();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // 根据 API 格式获取正确的温度
    const temperature = this.getTemperatureForFormat();
    const apiFormat = GameState.settings.apiFormat || 'openai';

    // 构建请求参数
    const requestParams = {
      endpoint: GameState.settings.apiEndpoint,
      apiKey: GameState.settings.apiKey,
      model: GameState.settings.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...this.getRecentContext(),
        { role: 'user', content: input },
      ],
      temperature: temperature,
      maxTokens: GameState.settings.maxTokens,
      signal: controller.signal,
      apiFormat: apiFormat,
    };

    // Gemini 格式添加特有参数
    if (apiFormat === 'gemini') {
      if (GameState.settings.topP !== undefined) {
        requestParams.topP = GameState.settings.topP;
      }
      if (GameState.settings.topK !== undefined) {
        requestParams.topK = GameState.settings.topK;
      }
    }
    
    // OpenAI/DeepSeek 格式添加特有参数
    if (apiFormat === 'openai' || apiFormat === 'deepseek') {
      if (GameState.settings.topPOpenai !== undefined) {
        requestParams.topPOpenai = GameState.settings.topPOpenai;
      }
      if (GameState.settings.frequencyPenalty !== undefined) {
        requestParams.frequencyPenalty = GameState.settings.frequencyPenalty;
      }
      if (GameState.settings.presencePenalty !== undefined) {
        requestParams.presencePenalty = GameState.settings.presencePenalty;
      }
    }

    try {
      const response = await callLLMApi(requestParams);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`API请求失败: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      // 兼容 Gemini、Anthropic 和 OpenAI 响应格式
      let content = '';
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        // Gemini format: candidates[0].content.parts[0].text
        content = data.candidates[0].content.parts.map(p => p.text).join('');
      } else if (data.content && Array.isArray(data.content)) {
        // Anthropic format: content[0].text
        content = data.content.map(c => c.text).join('');
      } else if (data.choices && data.choices[0] && data.choices[0].message) {
        // OpenAI format: choices[0].message.content
        content = data.choices[0].message.content;
      } else {
        throw new Error('API响应格式不正确');
      }

      return content;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('API请求超时');
      }
      throw error;
    }
  },

  /**
   * 验证AI响应格式
   * @param {string} response - AI响应文本
   * @returns {Object} - { isValid, errors, warnings }
   */
  validateAIResponse(response) {
    const errors = [];
    const warnings = [];

    if (!response || typeof response !== 'string' || response.trim().length === 0) {
      errors.push('响应为空');
      return { isValid: false, errors, warnings };
    }

    const hasStoryTag = /<Story>[\s\S]*?<\/Story>/.test(response);
    if (!hasStoryTag) {
      warnings.push('响应中没有<Story>标签，将使用整个响应作为故事内容');
    }

    const updateMatch = response.match(/<UpdateVariable>([\s\S]*?)<\/UpdateVariable>/);
    if (updateMatch) {
      const patchMatch = updateMatch[1].match(/<JSONPatch>([\s\S]*?)<\/JSONPatch>/);
      if (patchMatch) {
        try {
          const patches = JSON.parse(patchMatch[1]);
          if (!Array.isArray(patches)) {
            errors.push('JSONPatch应该是一个数组');
          } else {
            patches.forEach((patch, index) => {
              if (!patch.op) {
                errors.push(`Patch ${index}: 缺少op字段`);
              } else if (!['add', 'remove', 'replace'].includes(patch.op)) {
                errors.push(`Patch ${index}: 不支持的操作${patch.op}`);
              }
              if (!patch.path) {
                errors.push(`Patch ${index}: 缺少path字段`);
              }
            });
          }
        } catch (e) {
          errors.push(`JSONPatch解析失败: ${e.message}`);
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  },

  /**
   * 处理无效的AI响应
   * @param {string} response - 原始响应
   * @param {Array} errors - 错误列表
   * @returns {string} - 处理后的内容
   */
  handleInvalidResponse(response, errors) {
    console.warn('处理无效的AI响应:', errors);
    let content = response;
    content = content
      .replace(/<Story>/g, '')
      .replace(/<\/Story>/g, '')
      .replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '')
      .replace(/<BATTLE_START>/g, '')
      .trim();

    if (!content) {
      content = this.generateSimpleResponse('');
    }

    return content;
  },

  /**
   * 处理AI响应，解析变量更新
   * @param {string} response - AI原始响应
   * @param {string} userInput - 用户输入（用于地图更新）
   * @returns {Object} - { storyContent, variableUpdated }
   */
  processAiResponse(response, userInput = '') {
    let storyContent = response;
    let variableUpdated = false;

    // 提取<Story>标签中的内容
    const storyMatch = response.match(/<Story>([\s\S]*?)<\/Story>/);
    if (storyMatch) {
      storyContent = storyMatch[1].trim();
    }

    // 使用VariablesUI解析并应用变量更新
    if (typeof VariablesUI !== 'undefined') {
      const patches = VariablesUI.parseVariableUpdate(response);
      if (patches) {
        variableUpdated = VariablesUI.applyJsonPatch(patches);

        // 变量更新后刷新UI
        if (variableUpdated && typeof GameUI !== 'undefined') {
          GameUI.updateCharacterPanel();
          console.log('变量更新后已刷新UI');
        }

        // 检查是否有卡牌奖励，自动添加到仓库
        if (
          typeof CardSystem !== 'undefined' &&
          GameVariables.reward &&
          GameVariables.reward.card &&
          GameVariables.reward.card.length > 0
        ) {
          const addedCards = CardSystem.processCardRewards();
          if (addedCards.length > 0) {
            this.addEntry(`获得了 ${addedCards.length} 张新卡牌！已添加到卡牌仓库。`, 'system');
          }
        }
      }
    }

    // 检查是否有<BATTLE_START>标签
    if (response.includes('<BATTLE_START>')) {
      // 如果有敌人数据，使用敌人系统创建敌人
      const enemy = GameVariables.battle.enemy;
      if (enemy) {
        setTimeout(() => {
          BattleSystem.startWithEnemy(enemy);
        }, 1500);
        this.addEntry('一场战斗即将开始...', 'system');
      }
    }

    // 移除变量更新标签，只保留故事内容
    storyContent = storyContent
      .replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '')
      .replace(/<BATTLE_START>/g, '')
      .trim();

    // 更新动态地图（异步执行，不阻塞主流程）
    this.updateMapAsync(userInput, storyContent);

    return { storyContent, variableUpdated };
  },

  /**
   * 异步更新地图
   * @param {string} userInput - 用户输入
   * @param {string} storyContent - 故事内容
   */
  async updateMapAsync(userInput, storyContent) {
    if (typeof MapAPI === 'undefined') return;
    
    try {
      // 如果地图未初始化，跳过更新
      if (!GameVariables.map || !GameVariables.map.initialized) {
        return;
      }
      
      await MapAPI.updateMap(userInput, storyContent);
    } catch (error) {
      console.warn('地图更新失败:', error);
    }
  },

  /**
   * 获取最近的对话上下文
   * @returns {Array} - 上下文消息数组
   */
  getRecentContext() {
    const recentEntries = this.entries.slice(-10);
    return recentEntries.map(entry => ({
      role: entry.type === 'player' ? 'user' : 'assistant',
      content: entry.content.replace(/^> /, ''),
    }));
  },

  /**
   * 构建系统提示词
   * @returns {string} - 系统提示词
   */
  buildSystemPrompt() {
    const vars = GameVariables;
    const char = GameState.character;

    // 使用用户可配置的系统角色提示词
    let prompt = MVU_PROMPTS.systemRole + '\n\n';

    // 当前角色信息
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

    // 添加服装信息
    prompt += `\n# 当前穿着\n`;
    const clothing = vars.status.clothing;
    prompt += `上身：${clothing.upper_body}，下身：${clothing.lower_body}，脚部：${clothing.feet}\n`;

    // 添加状态信息
    if (vars.status.permanent_status.length > 0) {
      prompt += `\n# 永久状态\n`;
      vars.status.permanent_status.forEach(s => {
        prompt += `- ${s.name}：${s.description}\n`;
      });
    }

    if (vars.status.temporary_status.length > 0) {
      prompt += `\n# 临时状态\n`;
      prompt += vars.status.temporary_status.join('、') + '\n';
    }

    if (vars.status.inventory.length > 0) {
      prompt += `\n# 物品栏\n`;
      prompt += vars.status.inventory.join('、') + '\n';
    }

    prompt += '\n';

    if (GameState.world.prompt) {
      prompt += `# 世界设定\n${GameState.world.prompt}\n\n`;
    }

    // 添加世界书条目
    if (GameState.world.entries.length > 0) {
      prompt += `# 世界书条目\n`;
      GameState.world.entries.slice(0, 10).forEach(entry => {
        prompt += `- ${entry.name || entry.key}: ${entry.content?.substring(0, 100) || ''}\n`;
      });
      prompt += '\n';
    }

    // 使用用户可配置的叙事规则
    prompt += MVU_PROMPTS.narrativeRules + '\n\n';

    // 使用用户可配置的输出结构
    prompt += MVU_PROMPTS.outputStructure + '\n';

    // 使用用户可配置的变量更新格式
    prompt += MVU_PROMPTS.outputFormat + '\n\n';

    // 使用用户可配置的变量更新规则
    prompt += MVU_PROMPTS.updateRules + '\n\n';

    // 使用用户可配置的战斗触发提示
    prompt += MVU_PROMPTS.battleTrigger;

    return prompt;
  },

  /**
   * 检查并触发自动总结
   * @param {string} playerInput - 玩家输入
   * @param {string} aiResponse - AI响应内容
   */
  checkAutoSummary(playerInput, aiResponse) {
    // 检查是否启用自动总结
    const config = GameState.summaryConfig || {};
    if (!config.autoGenerate) return;

    // 每10条对话自动生成一个小总结
    const entryCount = this.entries.filter(e => e.type !== 'system').length;
    if (entryCount > 0 && entryCount % 10 === 0) {
      this.generateAutoSummary();
    }
  },

  /**
   * 生成自动小总结
   */
  async generateAutoSummary() {
    // 如果没有API配置，跳过
    if (!GameState.settings.apiKey || !GameState.settings.apiEndpoint) {
      return;
    }

    try {
      // 获取最近的对话内容
      const recentEntries = this.entries.slice(-10);
      const dialogContent = recentEntries
        .map(e => {
          const prefix = e.type === 'player' ? '玩家: ' : 'AI: ';
          return prefix + e.content;
        })
        .join('\n');

      // 获取总结提示词
      const prompts = typeof SummaryUI !== 'undefined' ? SummaryUI.getSummaryPrompts() : {};
      const summaryPrompt = prompts.small || '请简洁总结以下剧情的关键事件，控制在100字以内。';

      const response = await callLLMApi({
        endpoint: GameState.settings.apiEndpoint,
        apiKey: GameState.settings.apiKey,
        model: GameState.settings.modelName,
        messages: [
          { role: 'system', content: summaryPrompt },
          { role: 'user', content: dialogContent },
        ],
        temperature: 0.3,
        maxTokens: 200,
        apiFormat: GameState.settings.apiFormat,
      });

      if (!response.ok) {
        console.warn('自动总结生成失败');
        return;
      }

      const data = await response.json();
      
      // 兼容 Anthropic 和 OpenAI 格式
      let summaryContent = '';
      if (data.content && Array.isArray(data.content)) {
        summaryContent = data.content.map(c => c.text).join('');
      } else if (data.choices && data.choices[0] && data.choices[0].message) {
        summaryContent = data.choices[0].message.content;
      }
      
      summaryContent = summaryContent?.trim();

      if (summaryContent && typeof SummaryUI !== 'undefined') {
        SummaryUI.addSmallSummary(summaryContent, {
          timestamp: new Date().toISOString(),
          entryCount: recentEntries.length,
          autoGenerated: true,
        });
        console.log('自动小总结已生成');
      }
    } catch (error) {
      console.warn('自动总结生成错误:', error);
    }
  },

  /**
   * 调用AI生成叙事（支持流式响应）
   * @param {string} input - 玩家输入
   * @param {boolean} useStreaming - 是否使用流式响应
   * @returns {Promise<string>} - AI响应
   */
  async callAIStreaming(input, useStreaming = true) {
    const systemPrompt = this.buildSystemPrompt();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 流式响应需要更长超时

    try {
      const response = await callLLMApi({
        endpoint: GameState.settings.apiEndpoint,
        apiKey: GameState.settings.apiKey,
        model: GameState.settings.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          ...this.getRecentContext(),
          { role: 'user', content: input },
        ],
        temperature: GameState.settings.temperature,
        maxTokens: GameState.settings.maxTokens,
        stream: useStreaming,
        signal: controller.signal,
        apiFormat: GameState.settings.apiFormat,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // 如果不支持流式或服务器未返回流式响应，回退到普通模式
      if (!useStreaming || !response.body) {
        const data = await response.json();
        // 兼容 Anthropic 和 OpenAI 格式
        if (data.content && Array.isArray(data.content)) {
          return data.content.map(c => c.text).join('');
        } else if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
        return '';
      }

      // 处理流式响应
      return await this.processStreamResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('API请求超时');
      }
      throw error;
    }
  },

  /**
   * 处理流式响应
   * @param {Response} response - fetch响应对象
   * @returns {Promise<string>} - 完整的响应文本
   */
  async processStreamResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let streamingEntryId = null;

    // 创建一个流式消息条目
    streamingEntryId = this.addStreamingEntry();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullContent += delta;
                // 实时更新流式消息
                this.updateStreamingEntry(streamingEntryId, fullContent);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      // 完成流式传输，移除流式状态
      this.finalizeStreamingEntry(streamingEntryId, fullContent);
    }

    return fullContent;
  },

  /**
   * 添加流式消息条目
   * @returns {number} - 条目ID
   */
  addStreamingEntry() {
    const entry = {
      id: Date.now(),
      content: '',
      type: 'streaming',
      timestamp: new Date().toLocaleTimeString(),
    };

    this.entries.push(entry);
    this.renderStreamingEntry(entry);
    return entry.id;
  },

  /**
   * 更新流式消息条目
   * @param {number} entryId - 条目ID
   * @param {string} content - 当前内容
   */
  updateStreamingEntry(entryId, content) {
    const entry = this.entries.find(e => e.id === entryId);
    if (entry) {
      entry.content = content;
      this.renderStreamingEntry(entry);
    }
  },

  /**
   * 完成流式消息
   * @param {number} entryId - 条目ID
   * @param {string} finalContent - 最终内容
   */
  finalizeStreamingEntry(entryId, finalContent) {
    const entry = this.entries.find(e => e.id === entryId);
    if (entry) {
      entry.content = finalContent;
      entry.type = 'normal'; // 转换为普通条目
      this.render(); // 重新渲染
    }
  },

  /**
   * 渲染流式消息条目
   * @param {Object} entry - 条目对象
   */
  renderStreamingEntry(entry) {
    const container = DOM.elements.narrativeContent;
    if (!container) return;

    let streamingEl = container.querySelector(`[data-entry-id="${entry.id}"]`);

    if (!streamingEl) {
      streamingEl = document.createElement('div');
      streamingEl.className = 'narrative-entry streaming';
      streamingEl.dataset.entryId = entry.id;
      container.appendChild(streamingEl);
    }

    // 显示内容，添加打字光标效果
    streamingEl.innerHTML = entry.content + '<span class="typing-cursor">▌</span>';
    container.scrollTop = container.scrollHeight;
  },

  /**
   * 生成开场叙事
   * @returns {string} - 开场叙事文本
   */
  generateOpeningNarrative() {
    const char = GameState.character;
    let narrative = `${char.name || '冒险者'}，`;

    if (GameState.world.prompt) {
      narrative += `你睁开眼睛，发现自己身处一个陌生的世界——${GameState.world.prompt.substring(0, 100)}...\n\n`;
    } else {
      narrative += '你从沉睡中醒来，周围弥漫着淡淡的雾气...\n\n';
    }

    narrative += '你的冒险，从这里开始。输入你想要做的事情，世界将会响应你的行动。';

    return narrative;
  },

  /**
   * 绑定叙事相关事件
   */
  bindEvents() {
    // 发送按钮 - 使用正确的ID: send-message-button
    const sendBtn = document.getElementById('send-message-button');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const input = DOM.elements.narrativeInput.value.trim();
        if (input) {
          this.processInput(input);
          DOM.elements.narrativeInput.value = '';
        }
      });
    }

    // 回车发送
    if (DOM.elements.narrativeInput) {
      DOM.elements.narrativeInput.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const input = DOM.elements.narrativeInput.value.trim();
          if (input) {
            this.processInput(input);
            DOM.elements.narrativeInput.value = '';
          }
        }
      });
    }
  },
};

// 导出
window.NarrativeSystem = NarrativeSystem;
