/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 世界创建界面
 * ============================================================ */

/**
 * 世界创建界面模块
 */
const WorldUI = {
  /**
   * 初始化世界创建界面
   */
  init() {
    this.bindEvents();
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 世界创建表单
    const worldForm = document.getElementById('world-form');
    if (worldForm) {
      worldForm.addEventListener('submit', e => {
        e.preventDefault();
        this.submitWorld();
      });
    }

    // 返回按钮
    const backBtn = document.getElementById('btn-back-character');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        navigateTo('character');
      });
    }

    // AI扩写按钮
    const aiExpandBtn = document.getElementById('btn-ai-expand');
    if (aiExpandBtn) {
      aiExpandBtn.addEventListener('click', () => {
        this.aiExpandWorld();
      });
    }

    // 世界书导入
    if (DOM.elements.worldBookImport) {
      DOM.elements.worldBookImport.addEventListener('change', e => {
        this.importWorldBook(e);
      });
    }

    // 实时更新预览
    if (DOM.elements.worldPrompt) {
      DOM.elements.worldPrompt.addEventListener(
        'input',
        debounce(() => {
          this.updatePreview();
        }, 500),
      );
    }
  },

  /**
   * 更新世界预览
   */
  updatePreview() {
    const preview = DOM.elements.worldPreview;
    if (!preview) return;

    let previewText = '';

    if (DOM.elements.worldPrompt?.value) {
      previewText += DOM.elements.worldPrompt.value + '\n\n';
    }

    if (GameState.world.entries.length > 0) {
      previewText += `已导入 ${GameState.world.entries.length} 条世界书条目。`;
    }

    preview.textContent = previewText || '世界尚未坍缩成型，请输入世界基调或导入世界书...';
  },

  /**
   * 提交世界设定
   */
  submitWorld() {
    const worldPrompt = DOM.elements.worldPrompt?.value?.trim();
    const openingPrompt = document.getElementById('opening-prompt')?.value?.trim();

    // 更新游戏状态
    GameState.world.prompt = worldPrompt || '';
    GameState.world.openingPrompt = openingPrompt || ''; // 保存期望开场白
    GameState.world.isLoaded = true;

    // 将用户填写的世界信息作为特殊世界书条目添加到第一位
    this.createUserWorldEntry(worldPrompt);

    // 开始游戏
    this.startGame();
  },

  /**
   * 创建用户世界信息条目
   * 该条目固定在世界书第一位，用于存储用户在游戏开始时填写的世界设定
   * @param {string} worldPrompt - 用户填写的世界基调
   */
  createUserWorldEntry(worldPrompt) {
    if (!worldPrompt) return;

    // 创建用户世界信息条目，使用特殊标记
    const userWorldEntry = {
      key: '__user_world_info__', // 特殊标识符
      name: '🌍 我的世界设定',
      keys: ['世界设定', '世界观', '背景'],
      content: worldPrompt,
      isUserWorldInfo: true, // 特殊标记，表示这是用户的世界信息
      isLocked: true, // 锁定，表示固定在第一位
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 确保entries数组存在
    if (!GameState.world.entries) {
      GameState.world.entries = [];
    }

    // 检查是否已经存在用户世界信息条目
    const existingIndex = GameState.world.entries.findIndex(
      entry => entry.key === '__user_world_info__' || entry.isUserWorldInfo,
    );

    if (existingIndex !== -1) {
      // 更新现有条目
      GameState.world.entries[existingIndex] = userWorldEntry;
      // 确保它在第一位
      if (existingIndex !== 0) {
        GameState.world.entries.splice(existingIndex, 1);
        GameState.world.entries.unshift(userWorldEntry);
      }
    } else {
      // 添加到第一位
      GameState.world.entries.unshift(userWorldEntry);
    }

    console.log('用户世界信息已添加到世界书', userWorldEntry);
  },

  /**
   * 开始游戏 - 使用AI生成开场剧情
   */
  async startGame() {
    // 导航到游戏页面
    navigateTo('game');

    // 显示加载状态
    if (typeof NarrativeSystem !== 'undefined') {
      NarrativeSystem.clear();
      NarrativeSystem.addEntry('正在编织命运的丝线，请稍候...', 'system');
    }

    // 检查API配置
    const hasAPI = GameState.settings.apiKey && GameState.settings.apiEndpoint;
    const useTavernAPI = GameState.settings.useTavernApi && typeof window.generate === 'function';

    if (hasAPI || useTavernAPI) {
      try {
        // 使用开场白提示词生成第一条消息
        const openingStory = await this.generateOpeningWithPrompt();

        // 清空加载消息
        if (typeof NarrativeSystem !== 'undefined') {
          NarrativeSystem.clear();
        }

        if (openingStory) {
          // 显示AI生成的开场剧情
          if (typeof NarrativeSystem !== 'undefined') {
            NarrativeSystem.addEntry(openingStory, 'normal');
          }
        } else {
          // 显示默认开场
          if (typeof NarrativeSystem !== 'undefined') {
            const openingNarrative = NarrativeSystem.generateOpeningNarrative();
            NarrativeSystem.addEntry(openingNarrative, 'system');
          }
        }

        // 更新角色面板
        if (typeof GameUI !== 'undefined') {
          GameUI.updateCharacterPanel();
        }

        showToast('冒险开始！');
      } catch (error) {
        console.error('生成开场失败:', error);

        // 使用默认开场
        if (typeof NarrativeSystem !== 'undefined') {
          NarrativeSystem.clear();
          const openingNarrative = NarrativeSystem.generateOpeningNarrative();
          NarrativeSystem.addEntry(openingNarrative, 'system');
        }

        // 更新角色面板
        if (typeof GameUI !== 'undefined') {
          GameUI.updateCharacterPanel();
        }

        showToast('冒险开始！');
      }
    } else {
      // 没有配置API，使用默认方式
      if (typeof NarrativeSystem !== 'undefined') {
        NarrativeSystem.clear();
        const openingNarrative = NarrativeSystem.generateOpeningNarrative();
        NarrativeSystem.addEntry(openingNarrative, 'system');
      }

      // 更新角色面板
      if (typeof GameUI !== 'undefined') {
        GameUI.updateCharacterPanel();
      }

      showToast('冒险开始！');
    }
  },

  /**
   * 根据开场白提示词生成开场剧情
   * @returns {Promise<string|null>} - 生成的开场剧情
   */
  async generateOpeningWithPrompt() {
    const openingPrompt = GameState.world.openingPrompt;
    const char = GameState.character;
    const world = GameState.world;

    // 构建开场生成的系统提示词
    const systemPrompt = this.buildOpeningSystemPrompt();

    // 构建用户消息
    let userMessage = '';
    if (openingPrompt) {
      userMessage = `请根据以下期望开场场景生成第一条剧情回复：\n\n${openingPrompt}`;
    } else {
      userMessage = `请为角色"${char.name || '冒险者'}"在这个世界中生成一个合适的开场剧情。`;
    }

    try {
      // 使用酒馆API或自定义API
      if (GameState.settings.useTavernApi && typeof window.generate === 'function') {
        return await this.callTavernForOpening(systemPrompt, userMessage);
      } else {
        return await this.callAPIForOpening(systemPrompt, userMessage);
      }
    } catch (error) {
      console.error('生成开场剧情失败:', error);
      return null;
    }
  },

  /**
   * 构建开场生成的系统提示词
   * @returns {string} - 系统提示词
   */
  buildOpeningSystemPrompt() {
    const char = GameState.character;
    const world = GameState.world;

    let prompt = `你是一个奇幻叙事冒险游戏的开场剧情生成器。你需要根据角色设定和世界设定，生成一段引人入胜的开场剧情。

# 角色信息
- 姓名: ${char.name || '未命名'}
- 性别: ${char.gender === 'male' ? '男' : char.gender === 'female' ? '女' : '其他'}
- 年龄: ${char.age || 24}
- 种族: ${typeof getRaceLabel === 'function' ? getRaceLabel(char.race) : char.race || '人类'}
- 职业: ${char.class || '冒险者'}
`;

    if (char.appearance) {
      prompt += `- 外貌: ${char.appearance}\n`;
    }
    if (char.background) {
      prompt += `- 背景故事: ${char.background}\n`;
    }

    prompt += `\n# 世界设定\n`;
    if (world.prompt) {
      prompt += world.prompt + '\n';
    } else {
      prompt += '一个充满魔法与冒险的奇幻世界。\n';
    }

    // 添加世界书条目
    if (world.entries && world.entries.length > 0) {
      prompt += '\n## 世界书条目\n';
      world.entries.slice(0, 10).forEach(entry => {
        prompt += `- ${entry.name || entry.key}: ${entry.content?.substring(0, 150) || ''}\n`;
      });
    }

    prompt += `
# 开场剧情生成规则
1. 生成的开场剧情应该自然引入角色到这个世界中
2. 符合世界设定和角色背景
3. 使用第二人称视角（"你"）来描写
4. 包含丰富的环境描写和氛围渲染
5. 控制在200-400字之间
6. 为接下来的冒险做铺垫，留下悬念或可探索的方向
7. 不要在开场中直接触发战斗，而是营造探索的氛围

请直接输出开场剧情内容，不需要任何标签或格式包装。`;

    return prompt;
  },

  /**
   * 调用酒馆API生成开场
   * @param {string} systemPrompt - 系统提示词
   * @param {string} userMessage - 用户消息
   * @returns {Promise<string>} - 生成的内容
   */
  async callTavernForOpening(systemPrompt, userMessage) {
    const generateFn = typeof generate === 'function' ? generate : window.generate;

    if (!generateFn) {
      throw new Error('酒馆generate函数不可用');
    }

    const injects = [
      {
        role: 'system',
        content: systemPrompt,
        position: 'in_chat',
        depth: 0,
        should_scan: false,
      },
    ];

    const response = await generateFn({
      user_input: userMessage,
      injects: injects,
      should_stream: false,
    });

    if (!response || typeof response !== 'string') {
      throw new Error('酒馆API响应格式不正确');
    }

    return response.trim();
  },

  /**
   * 调用自定义API生成开场
   * @param {string} systemPrompt - 系统提示词
   * @param {string} userMessage - 用户消息
   * @returns {Promise<string>} - 生成的内容
   */
  async callAPIForOpening(systemPrompt, userMessage) {
    const response = await callLLMApi({
      endpoint: GameState.settings.apiEndpoint,
      apiKey: GameState.settings.apiKey,
      model: GameState.settings.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: GameState.settings.temperature || 0.8,
      maxTokens: GameState.settings.maxTokens || 2048,
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 兼容 Anthropic 和 OpenAI 格式
    let content = '';
    if (data.content && Array.isArray(data.content)) {
      content = data.content.map(c => c.text).join('');
    } else if (data.choices && data.choices[0] && data.choices[0].message) {
      content = data.choices[0].message.content;
    }

    if (!content) {
      throw new Error('API响应内容为空');
    }

    return content.trim();
  },

  /**
   * AI扩写世界设定
   */
  async aiExpandWorld() {
    const prompt = DOM.elements.worldPrompt?.value?.trim();

    if (!prompt) {
      showToast('请先输入世界基调');
      return;
    }

    if (!GameState.settings.apiKey || !GameState.settings.apiEndpoint) {
      showToast('请先在设置中配置API');
      return;
    }

    showToast('AI正在扩写设定...');

    try {
      const systemPrompt = `你是一个奇幻世界设定专家。请根据用户提供的简短世界基调，扩写出更详细的世界设定。
包括但不限于：
1. 世界的基本规则（魔法系统、科技水平等）
2. 主要势力或国家
3. 当前世界的状况
4. 可能遇到的危险和机遇

请保持设定的一致性和趣味性，控制在300字以内。`;

      const response = await callLLMApi({
        endpoint: GameState.settings.apiEndpoint,
        apiKey: GameState.settings.apiKey,
        model: GameState.settings.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请扩写这个世界设定：${prompt}` },
        ],
        temperature: 0.8,
        maxTokens: 500,
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      // 兼容 Anthropic 和 OpenAI 格式
      let expandedWorld = '';
      if (data.content && Array.isArray(data.content)) {
        expandedWorld = data.content.map(c => c.text).join('');
      } else if (data.choices && data.choices[0] && data.choices[0].message) {
        expandedWorld = data.choices[0].message.content;
      }

      // 更新文本框
      if (DOM.elements.worldPrompt) {
        DOM.elements.worldPrompt.value = expandedWorld;
      }

      // 更新预览
      this.updatePreview();

      showToast('世界设定扩写完成');
    } catch (error) {
      console.error('AI扩写失败:', error);
      showToast('AI扩写失败，请检查API配置');
    }
  },

  /**
   * 导入世界书
   * @param {Event} e - 文件选择事件
   */
  importWorldBook(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const worldBook = JSON.parse(event.target.result);

        // 验证世界书格式
        if (!worldBook.entries && !Array.isArray(worldBook)) {
          throw new Error('无效的世界书格式');
        }

        // 处理不同格式的世界书
        if (Array.isArray(worldBook)) {
          GameState.world.entries = worldBook;
        } else {
          GameState.world.entries = worldBook.entries || [];

          // 如果世界书包含描述，添加到世界设定
          if (worldBook.description && DOM.elements.worldPrompt) {
            const currentPrompt = DOM.elements.worldPrompt.value;
            DOM.elements.worldPrompt.value = currentPrompt
              ? `${currentPrompt}\n\n${worldBook.description}`
              : worldBook.description;
          }
        }

        this.updatePreview();
        showToast(`成功导入 ${GameState.world.entries.length} 条世界书条目`);
      } catch (error) {
        console.error('导入世界书失败:', error);
        showToast('世界书格式错误');
      }
    };
    reader.onerror = () => {
      showToast('读取文件失败');
    };
    reader.readAsText(file);

    // 重置文件输入
    e.target.value = '';
  },

  /**
   * 获取预设世界模板
   * @returns {Array} - 预设世界模板列表
   */
  getWorldTemplates() {
    return [
      {
        name: '蒸汽朋克奇幻',
        prompt:
          '一个魔法与蒸汽科技并存的时代，古老的神祇已经沉睡，而新的机械神明正在崛起。空中飘浮着巨大的齿轮城市，地面上是被遗忘的魔法遗迹。',
      },
      {
        name: '黑暗中世纪',
        prompt:
          '一个被永恒黑夜笼罩的世界，太阳已经消失了一千年。人类躲在被魔法保护的城市中，城外是无尽的黑暗和潜伏其中的恐怖生物。',
      },
      {
        name: '东方仙侠',
        prompt:
          '灵气复苏的末法时代，修仙者在人间行走。宗门林立，妖兽横行，凡人与修士共存。你踏上了追寻仙道的漫漫长路。',
      },
      {
        name: '末日废土',
        prompt:
          '核战争后的荒芜世界，文明的废墟中散落着变异生物和幸存者。资源稀缺，秩序崩塌，只有强者才能在这片废土上生存。',
      },
      {
        name: '梦境迷宫',
        prompt:
          '你被困在了无尽的梦境之中，每一个房间都是一个人的梦境碎片。你必须找到出口，但梦境中的危险比现实更加致命。',
      },
    ];
  },

  /**
   * 应用世界模板
   * @param {number} index - 模板索引
   */
  applyTemplate(index) {
    const templates = this.getWorldTemplates();
    if (index >= 0 && index < templates.length) {
      const template = templates[index];
      if (DOM.elements.worldPrompt) {
        DOM.elements.worldPrompt.value = template.prompt;
      }
      this.updatePreview();
      showToast(`已应用模板：${template.name}`);
    }
  },
};

// 导出
window.WorldUI = WorldUI;
