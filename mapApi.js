/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 动态地图API模块
 * 负责地图的AI生成和更新
 * ============================================================ */

/**
 * 地图API - 负责与AI交互生成和更新地图
 */
const MapAPI = {
  // 是否正在处理
  isProcessing: false,

  /**
   * 初始化地图（开场白生成后调用）
   * 完全由AI生成初始地图内容
   * @param {Object} context - 上下文信息
   */
  async initializeMap(context) {
    if (this.isProcessing) {
      console.warn('MapAPI: 正在处理中，跳过初始化');
      return;
    }

    this.isProcessing = true;
    console.log('MapAPI: 开始初始化地图...');

    try {
      const prompt = this.buildInitialMapPrompt(context);
      const response = await this.callAI(prompt);
      
      if (response) {
        const mapData = this.parseMapResponse(response);
        if (mapData) {
          this.applyMapData(mapData);
          console.log('MapAPI: 地图初始化成功', mapData);
        }
      }
    } catch (error) {
      console.error('MapAPI: 初始化地图失败', error);
      // 生成一个最小的默认地图
      this.createFallbackMap(context);
    } finally {
      this.isProcessing = false;
    }
  },

  /**
   * 更新地图（每次叙事交互后调用）
   * @param {string} userInput - 用户输入
   * @param {string} aiNarrative - AI叙事输出
   */
  async updateMap(userInput, aiNarrative) {
    if (this.isProcessing) {
      console.warn('MapAPI: 正在处理中，跳过更新');
      return;
    }

    // 如果地图未初始化，跳过更新
    if (!GameVariables.map.initialized) {
      console.warn('MapAPI: 地图未初始化，跳过更新');
      return;
    }

    this.isProcessing = true;

    try {
      const prompt = this.buildUpdatePrompt(userInput, aiNarrative);
      const response = await this.callAI(prompt);
      
      if (response) {
        const patches = this.parseUpdateResponse(response);
        if (patches && patches.length > 0) {
          this.applyPatches(patches);
          console.log('MapAPI: 地图更新成功，应用了', patches.length, '个补丁');
        }
      }
    } catch (error) {
      console.error('MapAPI: 更新地图失败', error);
    } finally {
      this.isProcessing = false;
    }
  },

  /**
   * 处理地图交互（用户点击地图元素）
   * @param {string} type - 交互类型 (location/npc)
   * @param {string} targetId - 目标ID
   */
  async handleInteraction(type, targetId) {
    let narrativePrompt = '';
    
    if (type === 'location') {
      const loc = GameVariables.map.locations.find(l => l.id === targetId);
      if (loc) {
        // 检查是否可达
        const currentLocId = GameVariables.map.player?.locationId;
        const isAccessible = this.isLocationAccessible(currentLocId, targetId);
        
        if (isAccessible) {
          narrativePrompt = `前往${loc.name}`;
        } else {
          if (typeof showToast === 'function') {
            showToast(`无法直接到达${loc.name}`);
          }
          return;
        }
      }
    } else if (type === 'npc') {
      const npc = GameVariables.map.npcs.find(n => n.id === targetId);
      if (npc) {
        narrativePrompt = `与${npc.name}交谈`;
      }
    }
    
    // 触发叙事系统处理
    if (narrativePrompt && typeof NarrativeSystem !== 'undefined') {
      await NarrativeSystem.processInput(narrativePrompt);
    }
  },

  /**
   * 检查地点是否可达
   * @param {string} fromId - 起始地点ID
   * @param {string} toId - 目标地点ID
   * @returns {boolean}
   */
  isLocationAccessible(fromId, toId) {
    if (!fromId || !toId) return true; // 如果没有当前位置，允许移动
    if (fromId === toId) return false; // 不能移动到当前位置
    
    // 检查是否有连接路径
    const path = GameVariables.map.paths.find(
      p => (p.from === fromId && p.to === toId) ||
           (p.to === fromId && p.from === toId)
    );
    
    return path ? path.passable !== false : false;
  },

  /**
   * 构建初始地图提示词
   * @param {Object} context - 上下文
   * @returns {string}
   */
  buildInitialMapPrompt(context) {
    return `你是地图生成AI。根据以下开场白内容，生成一个初始地图。

# 开场白/叙事内容
${context.narrative || '冒险开始了...'}

# 当前位置描述
${context.location || '未知之地'}

# 世界设定
${context.worldPrompt || '奇幻冒险世界'}

# 角色信息
${context.characterName ? `名称: ${context.characterName}` : ''}
${context.profession ? `职业: ${context.profession}` : ''}

请生成JSON格式的地图数据，包含：

1. **player**: 玩家初始位置
   - x, y: 坐标（使用-100到100的范围）
   - locationId: 当前所在地点的ID

2. **locations**: 地点数组（3-5个）
   每个地点包含：
   - id: 唯一标识符（英文，如 "village_square"）
   - name: 地点名称（中文）
   - type: 类型（safe/danger/shop/event/unknown）
   - x, y: 坐标
   - description: 简短描述
   - discovered: 是否已发现（boolean）
   - visited: 是否已访问（boolean）

3. **npcs**: NPC数组（0-3个，根据场景）
   每个NPC包含：
   - id: 唯一标识符
   - name: 名称
   - x, y: 坐标
   - locationId: 所在地点ID
   - description: 简短描述

4. **paths**: 路径数组
   每条路径包含：
   - from: 起点地点ID
   - to: 终点地点ID
   - type: 类型（road/path/bridge等）
   - passable: 是否可通行（boolean）

注意：
- 只生成开场白中明确提到或合理暗示的内容
- 坐标使用相对值，玩家初始位置建议在(0,0)附近
- 地点之间要有合理的空间分布

请只输出纯JSON，不要有其他文字或markdown标记。`;
  },

  /**
   * 构建地图更新提示词
   * @param {string} userInput - 用户输入
   * @param {string} aiNarrative - AI叙事
   * @returns {string}
   */
  buildUpdatePrompt(userInput, aiNarrative) {
    const currentMap = {
      player: GameVariables.map.player,
      locations: GameVariables.map.locations,
      npcs: GameVariables.map.npcs,
      paths: GameVariables.map.paths
    };

    return `根据最新叙事内容更新地图。

# 当前地图状态
${JSON.stringify(currentMap, null, 2)}

# 用户输入
${userInput}

# AI叙事内容
${aiNarrative}

分析叙事内容，判断是否需要更新地图：

1. 如果玩家移动了 → 更新player的位置和locationId
2. 如果发现/提到新地点 → 添加到locations
3. 如果出现新NPC → 添加到npcs
4. 如果NPC移动或离开 → 更新或移除对应NPC
5. 如果发现新路径 → 添加到paths
6. 如果地点状态改变 → 更新对应location

输出JSON Patch数组格式：
[
  { "op": "replace", "path": "/player/locationId", "value": "new_location_id" },
  { "op": "replace", "path": "/player/x", "value": 50 },
  { "op": "add", "path": "/locations/-", "value": { "id": "...", "name": "...", ... } },
  { "op": "add", "path": "/npcs/-", "value": { "id": "...", "name": "...", ... } }
]

如果无需更新，输出空数组: []

请只输出纯JSON数组，不要有其他文字或markdown标记。`;
  },

  /**
   * 获取地图API配置
   * 支持复用主API或使用独立配置
   * @returns {Object|null} API配置对象
   */
  getApiConfig() {
    const settings = GameState.settings;
    
    // 如果使用酒馆API
    if (settings.useTavernApi) {
      return { useTavernApi: true };
    }
    
    // 检查是否有apiProfiles配置
    if (settings.apiProfiles && settings.apiProfiles.map) {
      const mapProfile = settings.apiProfiles.map;
      
      // 如果地图API未启用
      if (!mapProfile.enabled) {
        console.warn('MapAPI: 地图API已禁用');
        return null;
      }
      
      // 如果复用主API
      if (mapProfile.useMainApi) {
        const mainProfile = settings.apiProfiles.main;
        if (!mainProfile || !mainProfile.apiKey || !mainProfile.apiEndpoint) {
          console.warn('MapAPI: 主API未配置');
          return null;
        }
        return {
          apiFormat: mainProfile.apiFormat || 'openai',
          apiEndpoint: mainProfile.apiEndpoint,
          apiKey: mainProfile.apiKey,
          modelName: mainProfile.modelName || 'gpt-4',
          maxTokens: mapProfile.maxTokens || 2000, // 地图API可以有自己的maxTokens
          temperature: mapProfile.temperature || 0.7,
          topP: mapProfile.topP || 1.0,
          frequencyPenalty: mapProfile.frequencyPenalty || 0.0,
          presencePenalty: mapProfile.presencePenalty || 0.0
        };
      }
      
      // 使用独立配置
      if (!mapProfile.apiKey || !mapProfile.apiEndpoint) {
        console.warn('MapAPI: 地图API独立配置未完成');
        return null;
      }
      return {
        apiFormat: mapProfile.apiFormat || 'openai',
        apiEndpoint: mapProfile.apiEndpoint,
        apiKey: mapProfile.apiKey,
        modelName: mapProfile.modelName || 'gpt-4',
        maxTokens: mapProfile.maxTokens || 2000,
        temperature: mapProfile.temperature || 0.7,
        topP: mapProfile.topP || 1.0,
        frequencyPenalty: mapProfile.frequencyPenalty || 0.0,
        presencePenalty: mapProfile.presencePenalty || 0.0
      };
    }
    
    // 兼容旧版配置
    if (!settings.apiKey || !settings.apiEndpoint) {
      console.warn('MapAPI: API未配置');
      return null;
    }
    return {
      apiFormat: settings.apiFormat || 'openai',
      apiEndpoint: settings.apiEndpoint,
      apiKey: settings.apiKey,
      modelName: settings.modelName || 'gpt-4',
      maxTokens: 2000,
      temperature: settings.temperature || 0.7,
      topP: settings.topP || 1.0,
      frequencyPenalty: settings.frequencyPenalty || 0.0,
      presencePenalty: settings.presencePenalty || 0.0
    };
  },

  /**
   * 调用AI生成地图
   * @param {string} prompt - 提示词
   * @returns {Promise<string>}
   */
  async callAI(prompt) {
    // 获取API配置
    const config = this.getApiConfig();
    
    if (!config) {
      console.warn('MapAPI: API未配置，使用回退地图');
      return null;
    }
    
    // 如果使用酒馆API
    if (config.useTavernApi) {
      // 酒馆API的处理逻辑（如果有）
      console.warn('MapAPI: 酒馆API暂不支持地图生成');
      return null;
    }

    try {
      const response = await callLLMApi({
        endpoint: config.apiEndpoint,
        apiKey: config.apiKey,
        model: config.modelName,
        messages: [
          { role: 'system', content: '你是一个地图生成AI，只输出JSON格式的数据，不要有任何其他文字。' },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        apiFormat: config.apiFormat,
        topP: config.topP,
        frequencyPenalty: config.frequencyPenalty,
        presencePenalty: config.presencePenalty
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      // 兼容不同API格式
      let content = '';
      if (data.candidates && data.candidates[0]?.content) {
        content = data.candidates[0].content.parts.map(p => p.text).join('');
      } else if (data.content && Array.isArray(data.content)) {
        content = data.content.map(c => c.text).join('');
      } else if (data.choices && data.choices[0]?.message) {
        content = data.choices[0].message.content;
      }

      return content.trim();
    } catch (error) {
      console.error('MapAPI: AI调用失败', error);
      throw error;
    }
  },

  /**
   * 解析地图初始化响应
   * @param {string} response - AI响应
   * @returns {Object|null}
   */
  parseMapResponse(response) {
    try {
      // 尝试提取JSON（处理可能的markdown包裹）
      let jsonStr = response;
      
      // 移除markdown代码块标记
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const data = JSON.parse(jsonStr.trim());
      
      // 验证必要字段
      if (!data.player || !data.locations) {
        console.warn('MapAPI: 响应缺少必要字段');
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('MapAPI: 解析地图响应失败', error);
      return null;
    }
  },

  /**
   * 解析地图更新响应
   * @param {string} response - AI响应
   * @returns {Array|null}
   */
  parseUpdateResponse(response) {
    try {
      let jsonStr = response;
      
      // 移除markdown代码块标记
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const patches = JSON.parse(jsonStr.trim());
      
      if (!Array.isArray(patches)) {
        console.warn('MapAPI: 更新响应不是数组');
        return null;
      }
      
      return patches;
    } catch (error) {
      console.error('MapAPI: 解析更新响应失败', error);
      return null;
    }
  },

  /**
   * 应用地图数据
   * @param {Object} mapData - 地图数据
   */
  applyMapData(mapData) {
    GameVariables.map.player = mapData.player || null;
    GameVariables.map.locations = mapData.locations || [];
    GameVariables.map.npcs = mapData.npcs || [];
    GameVariables.map.paths = mapData.paths || [];
    GameVariables.map.initialized = true;
    GameVariables.map.lastUpdated = Date.now();
    
    // 触发地图渲染
    if (typeof MapRenderer !== 'undefined') {
      MapRenderer.render();
    }
    
    // 触发变更事件
    if (typeof VariableChangeEmitter !== 'undefined') {
      VariableChangeEmitter.emit('/map', GameVariables.map, null);
    }
  },

  /**
   * 应用JSON Patch更新
   * @param {Array} patches - 补丁数组
   */
  applyPatches(patches) {
    patches.forEach(patch => {
      try {
        // 解析路径（移除开头的/map，因为我们直接操作map对象）
        let path = patch.path;
        if (path.startsWith('/map/')) {
          path = path.substring(4);
        }
        if (path.startsWith('/')) {
          path = path.substring(1);
        }
        
        const pathParts = path.split('/');
        let target = GameVariables.map;
        
        // 导航到目标位置的父级
        for (let i = 0; i < pathParts.length - 1; i++) {
          const key = pathParts[i];
          if (target[key] === undefined) {
            if (patch.op === 'add') {
              target[key] = {};
            } else {
              console.warn('MapAPI: 路径不存在', patch.path);
              return;
            }
          }
          target = target[key];
        }
        
        const lastKey = pathParts[pathParts.length - 1];
        
        switch (patch.op) {
          case 'add':
            if (lastKey === '-' && Array.isArray(target)) {
              // 数组追加
              target.push(patch.value);
            } else if (Array.isArray(target) && !isNaN(parseInt(lastKey))) {
              // 数组插入
              target.splice(parseInt(lastKey), 0, patch.value);
            } else {
              target[lastKey] = patch.value;
            }
            break;
            
          case 'replace':
            target[lastKey] = patch.value;
            break;
            
          case 'remove':
            if (Array.isArray(target) && !isNaN(parseInt(lastKey))) {
              target.splice(parseInt(lastKey), 1);
            } else {
              delete target[lastKey];
            }
            break;
            
          default:
            console.warn('MapAPI: 不支持的操作', patch.op);
        }
      } catch (error) {
        console.error('MapAPI: 应用补丁失败', patch, error);
      }
    });
    
    GameVariables.map.lastUpdated = Date.now();
    
    // 触发地图渲染
    if (typeof MapRenderer !== 'undefined') {
      MapRenderer.render();
    }
    
    // 触发变更事件
    if (typeof VariableChangeEmitter !== 'undefined') {
      VariableChangeEmitter.emit('/map', GameVariables.map, null);
    }
  },

  /**
   * 创建回退地图（当AI生成失败时）
   * @param {Object} context - 上下文
   */
  createFallbackMap(context) {
    const locationName = context.location?.split('（')[0]?.split(' ')[0] || '起始之地';
    
    const fallbackMap = {
      player: {
        x: 0,
        y: 0,
        locationId: 'start'
      },
      locations: [
        {
          id: 'start',
          name: locationName,
          type: 'safe',
          x: 0,
          y: 0,
          description: '你当前所在的位置',
          discovered: true,
          visited: true
        },
        {
          id: 'unknown_north',
          name: '未知区域',
          type: 'unknown',
          x: 0,
          y: -60,
          description: '北方的未知区域',
          discovered: true,
          visited: false
        },
        {
          id: 'unknown_east',
          name: '未知区域',
          type: 'unknown',
          x: 60,
          y: 0,
          description: '东方的未知区域',
          discovered: true,
          visited: false
        }
      ],
      npcs: [],
      paths: [
        { from: 'start', to: 'unknown_north', type: 'path', passable: true },
        { from: 'start', to: 'unknown_east', type: 'path', passable: true }
      ]
    };
    
    this.applyMapData(fallbackMap);
    console.log('MapAPI: 使用回退地图');
  },

  /**
   * 重置地图
   */
  reset() {
    GameVariables.map = {
      player: null,
      locations: [],
      npcs: [],
      paths: [],
      viewport: {
        centerX: 0,
        centerY: 0,
        scale: 1
      },
      initialized: false,
      lastUpdated: null
    };
    
    if (typeof MapRenderer !== 'undefined') {
      MapRenderer.render();
    }
  }
};

// 导出
window.MapAPI = MapAPI;
