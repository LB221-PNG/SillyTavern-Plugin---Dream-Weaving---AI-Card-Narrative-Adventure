/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 工具函数（接口）
 * ============================================================ */

/**
 * DOM 元素缓存 - 避免重复查询
 */
const DOM = {
  pages: {},
  elements: {},
  cached: false,
};

/**
 * 缓存DOM元素
 */
function cacheDOM() {
  if (DOM.cached) return;

  // 缓存页面
  DOM.pages = {
    home: document.getElementById('page-home'),
    character: document.getElementById('page-character'),
    world: document.getElementById('page-world'),
    game: document.getElementById('page-game'),
    settings: document.getElementById('page-settings'),
    variables: document.getElementById('page-variables'),
  };

  // 缓存常用元素
  DOM.elements = {
    // 角色表单
    charName: document.getElementById('char-name'),
    charGender: document.getElementById('char-gender'),
    charAge: document.getElementById('char-age'),
    charRace: document.getElementById('char-race'),
    charClass: document.getElementById('char-class'),
    charAppearance: document.getElementById('char-appearance'),
    charBackground: document.getElementById('char-background'),

    // 世界设定
    worldPrompt: document.getElementById('world-prompt'),
    worldPreview: document.getElementById('world-preview'),
    worldBookImport: document.getElementById('world-book-import'),

    // 游戏界面
    narrativeContent: document.getElementById('narrative-content'),
    narrativeInput: document.getElementById('message-input'),
    gameCharName: document.getElementById('game-char-name'),
    gameCharClass: document.getElementById('game-char-class'),
    hpDisplay: document.getElementById('hp-display'),
    hpBar: document.getElementById('hp-bar'),
    statGold: document.getElementById('stat-gold'),
    statFloor: document.getElementById('stat-floor'),

    // 战斗界面
    battlePanel: document.getElementById('battle-panel'),
    narrativePanel: document.getElementById('narrative-panel'),
    turnNumber: document.getElementById('turn-number'),
    enemyName: document.getElementById('enemy-name'),
    enemyLevel: document.getElementById('enemy-level'),
    enemyHpDisplay: document.getElementById('enemy-hp-display'),
    enemyHpBar: document.getElementById('enemy-hp-bar'),
    intentValue: document.getElementById('intent-value'),
    battleHp: document.getElementById('battle-hp'),
    battleBlock: document.getElementById('battle-block'),
    energyCurrent: document.getElementById('energy-current'),
    energyMax: document.getElementById('energy-max'),
    handCards: document.getElementById('hand-cards'),
    drawPileCount: document.getElementById('draw-pile-count'),
    discardPileCount: document.getElementById('discard-pile-count'),
    combatLog: document.getElementById('combat-log'),

    // 设置
    apiEndpoint: document.getElementById('api-endpoint'),
    apiKey: document.getElementById('api-key'),
    modelName: document.getElementById('model-name'),
    temperature: document.getElementById('temperature'),
    tempValue: document.getElementById('temp-value'),
    maxTokens: document.getElementById('max-tokens'),
    tokenValue: document.getElementById('token-value'),
    apiStatus: document.getElementById('api-status'),
    apiStatusText: document.getElementById('api-status-text'),

    // 模态框
    modalDeck: document.getElementById('modal-deck'),
    modalDeckCards: document.getElementById('modal-deck-cards'),

    // Toast
    toast: document.getElementById('toast'),
  };

  DOM.cached = true;
}

/**
 * 显示Toast通知
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长（毫秒）
 */
function showToast(message, duration = 3000) {
  const toast = DOM.elements.toast;
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/**
 * 页面导航
 * @param {string} pageName - 目标页面名称
 */
function navigateTo(pageName) {
  GameState.previousPage = GameState.currentPage;
  GameState.currentPage = pageName;

  // 移除所有页面的active类
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(page => {
    page.classList.remove('active');
  });

  // 尝试从缓存获取目标页面，如果不存在则直接查询DOM
  let targetPage = DOM.pages[pageName];
  if (!targetPage) {
    targetPage = document.getElementById(`page-${pageName}`);
    // 更新缓存
    if (targetPage) {
      DOM.pages[pageName] = targetPage;
    }
  }

  if (targetPage) {
    targetPage.classList.add('active');
    console.log(`导航到页面: ${pageName}`);
  } else {
    console.error(`页面未找到: page-${pageName}`);
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} - 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} - 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 洗牌算法（Fisher-Yates）
 * @param {Array} array - 要洗牌的数组
 * @returns {Array} - 洗牌后的新数组
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 生成唯一ID
 * @returns {string} - 唯一ID字符串
 */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取种族标签
 * @param {string} race - 种族代码
 * @returns {string} - 种族中文名称
 */
function getRaceLabel(race) {
  const labels = {
    human: '人类',
    elf: '精灵',
    dwarf: '矮人',
    halfling: '半身人',
    orc: '兽人',
    other: '其他',
  };
  return labels[race] || '人类';
}

/**
 * 安全的JSON解析
 * @param {string} str - JSON字符串
 * @param {*} defaultValue - 解析失败时的默认值
 * @returns {*} - 解析结果或默认值
 */
function safeJSONParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('JSON解析失败:', e);
    return defaultValue;
  }
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} - 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 各 API 格式的官方默认端点
 */
const API_DEFAULT_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
};

/**
 * 获取 API 格式的默认端点
 * @param {string} format - API 格式 (openai, anthropic, gemini, deepseek)
 * @param {string} model - 模型名称（用于 Gemini）
 * @returns {string} - 默认端点 URL
 */
function getDefaultEndpoint(format, model) {
  const endpoint = API_DEFAULT_ENDPOINTS[format] || API_DEFAULT_ENDPOINTS.openai;
  // Gemini 需要替换模型名称
  if (format === 'gemini' && model) {
    return endpoint.replace('{model}', model);
  }
  return endpoint;
}

/**
 * 通用 LLM API 调用函数
 * 支持 OpenAI、Anthropic (Claude)、Gemini 和 DeepSeek 格式
 * @param {Object} params - 请求参数
 * @param {string} params.endpoint - API 端点（为空时使用官方默认端点）
 * @param {string} params.apiKey - API 密钥
 * @param {string} params.model - 模型名称
 * @param {Array} params.messages - 消息数组
 * @param {number} params.temperature - 温度
 * @param {number} params.maxTokens - 最大 token 数
 * @param {boolean} params.stream - 是否流式
 * @param {AbortSignal} params.signal - 中断信号
 * @param {string} params.apiFormat - API 格式 (openai, anthropic, gemini, deepseek)，默认 openai
 * @param {number} params.topP - Top P 参数（Gemini 专用）
 * @param {number} params.topK - Top K 参数（Gemini 专用）
 * @returns {Promise<Response>} - fetch 响应
 */
async function callLLMApi(params) {
  let { endpoint, apiKey, model, messages, temperature, maxTokens, stream, signal, apiFormat, topP, topK, topPOpenai, frequencyPenalty, presencePenalty } = params;

  // 默认使用 OpenAI 格式
  apiFormat = apiFormat || 'openai';

  // 调试日志：原始参数
  console.log('[callLLMApi] 原始参数:', {
    endpoint: endpoint,
    apiKey: apiKey ? '***已设置(' + apiKey.length + '字符)***' : '未设置',
    model: model,
    messagesCount: messages ? messages.length : 0,
    temperature: temperature,
    maxTokens: maxTokens,
    stream: stream,
    apiFormat: apiFormat,
  });

  // 如果 endpoint 为空，使用官方默认端点
  if (!endpoint || !endpoint.trim()) {
    endpoint = getDefaultEndpoint(apiFormat, model);
    console.log('[callLLMApi] 使用官方默认端点:', endpoint);
  } else {
    // 规范化 endpoint
    endpoint = endpoint.trim();
    if (endpoint.endsWith('/')) {
      endpoint = endpoint.slice(0, -1);
    }
  }

  let headers = {
    'Content-Type': 'application/json',
  };

  let body;

  // 根据用户选择的 API 格式处理请求
  if (apiFormat === 'gemini') {
    // Gemini 格式
    // 确保端点包含正确的路径
    if (!endpoint.includes(':generateContent') && !endpoint.includes(':streamGenerateContent')) {
      const streamSuffix = stream ? ':streamGenerateContent' : ':generateContent';
      if (!endpoint.includes('/models/')) {
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}${streamSuffix}`;
      } else {
        endpoint += streamSuffix;
      }
    }
    // 添加 API Key 作为查询参数
    if (!endpoint.includes('key=')) {
      endpoint += (endpoint.includes('?') ? '&' : '?') + `key=${apiKey}`;
    }
    
    // 转换消息格式：OpenAI messages -> Gemini contents
    const contents = convertMessagesToGeminiFormat(messages);
    
    body = {
      contents: contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    };
    
    if (temperature !== undefined) {
      body.generationConfig.temperature = temperature;
    }
    
    // Gemini 特有参数
    if (topP !== undefined) {
      body.generationConfig.topP = topP;
    }
    if (topK !== undefined) {
      body.generationConfig.topK = topK;
    }
    
    console.log('[callLLMApi] 使用 Gemini 格式, topP:', topP, ', topK:', topK);
    
  } else if (apiFormat === 'anthropic') {
    // Anthropic (Claude) 格式
    // 确保端点包含 /messages 路径
    if (!endpoint.includes('/messages')) {
      endpoint += '/messages';
    }
    
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    
    // 分离 system 消息
    const systemMessages = messages.filter(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');
    
    body = {
      model: model,
      messages: nonSystemMessages,
      max_tokens: maxTokens,
      stream: stream || false,
    };
    
    // Anthropic 的 system 消息需要单独传递
    if (systemMessages.length > 0) {
      body.system = systemMessages.map(m => m.content).join('\n\n');
    }
    
    if (temperature !== undefined) {
      body.temperature = temperature;
    }
    
    console.log('[callLLMApi] 使用 Anthropic (Claude) 格式');
    
  } else {
    // OpenAI 兼容格式（包括 openai 和 deepseek）
    // 确保端点包含 /chat/completions 路径
    if (!endpoint.includes('/chat/completions')) {
      endpoint += '/chat/completions';
    }
    
    headers['Authorization'] = 'Bearer ' + apiKey;
    
    body = {
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      stream: stream || false,
    };
    
    if (temperature !== undefined) {
      body.temperature = temperature;
    }
    
    // OpenAI 特有参数
    if (topPOpenai !== undefined) {
      body.top_p = topPOpenai;
    }
    if (frequencyPenalty !== undefined) {
      body.frequency_penalty = frequencyPenalty;
    }
    if (presencePenalty !== undefined) {
      body.presence_penalty = presencePenalty;
    }
    
    console.log('[callLLMApi] 使用 OpenAI 兼容格式 (' + apiFormat + ')');
  }

  // 调试日志：最终请求信息
  console.log('[callLLMApi] 发送请求:', {
    finalEndpoint: endpoint.replace(/key=[^&]+/, 'key=***'),
    apiFormat: apiFormat,
    model: model,
    maxTokens: maxTokens,
    temperature: temperature,
    messagesPreview: messages && messages.length > 0 ? messages[0].role + ': ' + (messages[0].content || '').substring(0, 50) + '...' : '无消息',
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      signal: signal,
    });

    // 调试日志：响应状态
    console.log('[callLLMApi] 响应状态:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    return response;
  } catch (error) {
    // 调试日志：请求错误
    console.error('[callLLMApi] 请求失败:', {
      error: error.message,
      name: error.name,
      endpoint: endpoint.replace(/key=[^&]+/, 'key=***'),
    });
    throw error;
  }
}

/**
 * 将 OpenAI 格式的消息转换为 Gemini 格式
 * @param {Array} messages - OpenAI 格式的消息数组
 * @returns {Array} - Gemini 格式的 contents 数组
 */
function convertMessagesToGeminiFormat(messages) {
  const contents = [];
  let systemPrompt = '';
  
  for (const msg of messages) {
    if (msg.role === 'system') {
      // Gemini 没有 system role，将其合并到第一个 user 消息
      systemPrompt += (systemPrompt ? '\n\n' : '') + msg.content;
    } else {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      let content = msg.content;
      
      // 如果是第一个 user 消息且有 system prompt，合并它们
      if (role === 'user' && systemPrompt && contents.length === 0) {
        content = systemPrompt + '\n\n' + content;
        systemPrompt = '';
      }
      
      contents.push({
        role: role,
        parts: [{ text: content }],
      });
    }
  }
  
  // 如果只有 system 消息，创建一个包含它的 user 消息
  if (contents.length === 0 && systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }],
    });
  }
  
  return contents;
}

// 导出工具函数
window.DOM = DOM;
window.cacheDOM = cacheDOM;
window.showToast = showToast;
window.navigateTo = navigateTo;
window.debounce = debounce;
window.throttle = throttle;
window.shuffleArray = shuffleArray;
window.generateId = generateId;
window.getRaceLabel = getRaceLabel;
window.safeJSONParse = safeJSONParse;
window.deepClone = deepClone;
window.callLLMApi = callLLMApi;
