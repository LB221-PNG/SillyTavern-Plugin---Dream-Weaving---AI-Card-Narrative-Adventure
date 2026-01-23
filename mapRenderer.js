/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 地图SVG渲染器
 * 负责地图的可视化渲染和交互
 * ============================================================ */

/**
 * 地图渲染器 - 使用SVG进行地图可视化
 */
const MapRenderer = {
  svg: null,
  container: null,
  isInitialized: false,
  
  // 视口配置
  viewBox: {
    x: -150,
    y: -150,
    width: 300,
    height: 300
  },
  
  // 拖拽状态
  drag: {
    active: false,
    startX: 0,
    startY: 0,
    viewBoxStartX: 0,
    viewBoxStartY: 0
  },

  /**
   * 初始化渲染器
   * @param {string} containerId - 容器元素ID
   */
  init(containerId = 'map-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('MapRenderer: 容器不存在', containerId);
      return;
    }

    // 创建SVG元素
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'dynamic-map-svg');
    this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    
    // 添加定义（渐变、滤镜等）
    this.addDefs();
    
    this.container.appendChild(this.svg);
    this.bindEvents();
    this.isInitialized = true;
    
    console.log('MapRenderer: 初始化完成');
  },

  /**
   * 添加SVG定义（渐变、滤镜等）
   */
  addDefs() {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // 发光滤镜
    defs.innerHTML = `
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
      
      <!-- 玩家标记动画 -->
      <radialGradient id="playerGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#4fc3f7;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0288d1;stop-opacity:1" />
      </radialGradient>
      
      <!-- 安全区域渐变 -->
      <radialGradient id="safeGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#81c784;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#4caf50;stop-opacity:1" />
      </radialGradient>
      
      <!-- 危险区域渐变 -->
      <radialGradient id="dangerGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#e57373;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#d32f2f;stop-opacity:1" />
      </radialGradient>
      
      <!-- 商店渐变 -->
      <radialGradient id="shopGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#ffb74d;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ff9800;stop-opacity:1" />
      </radialGradient>
      
      <!-- 未知区域渐变 -->
      <radialGradient id="unknownGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#9e9e9e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#616161;stop-opacity:1" />
      </radialGradient>
    `;
    
    this.svg.appendChild(defs);
  },

  /**
   * 渲染地图
   */
  render() {
    if (!this.isInitialized) {
      this.init();
    }
    
    if (!this.svg) return;
    
    const map = GameVariables.map;
    
    // 清除现有内容（保留defs）
    const defs = this.svg.querySelector('defs');
    this.svg.innerHTML = '';
    if (defs) this.svg.appendChild(defs);
    
    // 如果地图未初始化，显示提示
    if (!map.initialized || map.locations.length === 0) {
      this.renderEmptyState();
      return;
    }
    
    // 创建图层组
    const pathsLayer = this.createSVGElement('g', { class: 'map-layer-paths' });
    const locationsLayer = this.createSVGElement('g', { class: 'map-layer-locations' });
    const npcsLayer = this.createSVGElement('g', { class: 'map-layer-npcs' });
    const playerLayer = this.createSVGElement('g', { class: 'map-layer-player' });
    
    // 1. 渲染路径（底层）
    map.paths?.forEach(path => {
      const pathEl = this.renderPath(path);
      if (pathEl) pathsLayer.appendChild(pathEl);
    });
    
    // 2. 渲染地点
    map.locations?.forEach(loc => {
      const locEl = this.renderLocation(loc);
      if (locEl) locationsLayer.appendChild(locEl);
    });
    
    // 3. 渲染NPC
    map.npcs?.forEach(npc => {
      const npcEl = this.renderNPC(npc);
      if (npcEl) npcsLayer.appendChild(npcEl);
    });
    
    // 4. 渲染玩家
    if (map.player) {
      const playerEl = this.renderPlayer(map.player);
      if (playerEl) playerLayer.appendChild(playerEl);
    }
    
    // 按顺序添加图层
    this.svg.appendChild(pathsLayer);
    this.svg.appendChild(locationsLayer);
    this.svg.appendChild(npcsLayer);
    this.svg.appendChild(playerLayer);
    
    // 调整视口以适应内容
    this.fitViewBox();
  },

  /**
   * 渲染空状态
   */
  renderEmptyState() {
    const text = this.createSVGElement('text', {
      x: 0,
      y: 0,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      class: 'map-empty-text'
    });
    text.textContent = '地图加载中...';
    this.svg.appendChild(text);
  },

  /**
   * 渲染地点
   * @param {Object} loc - 地点数据
   * @returns {SVGElement}
   */
  renderLocation(loc) {
    const g = this.createSVGElement('g', {
      class: `map-location ${loc.type || 'default'} ${loc.visited ? 'visited' : ''} ${loc.discovered ? 'discovered' : 'hidden'}`,
      'data-type': 'location',
      'data-id': loc.id,
      transform: `translate(${loc.x}, ${loc.y})`
    });
    
    // 根据类型选择渐变
    const gradientMap = {
      safe: 'url(#safeGradient)',
      danger: 'url(#dangerGradient)',
      shop: 'url(#shopGradient)',
      unknown: 'url(#unknownGradient)',
      event: 'url(#safeGradient)'
    };
    
    // 地点图标（圆形）
    const circle = this.createSVGElement('circle', {
      r: loc.visited ? 14 : 12,
      fill: gradientMap[loc.type] || gradientMap.unknown,
      stroke: loc.visited ? '#fff' : 'rgba(255,255,255,0.5)',
      'stroke-width': loc.visited ? 2 : 1,
      filter: 'url(#shadow)',
      class: 'location-icon'
    });
    g.appendChild(circle);
    
    // 类型图标
    const iconText = this.createSVGElement('text', {
      y: 1,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': '12',
      fill: '#fff',
      class: 'location-type-icon'
    });
    iconText.textContent = this.getLocationIcon(loc.type);
    g.appendChild(iconText);
    
    // 地点名称
    const nameText = this.createSVGElement('text', {
      y: 24,
      'text-anchor': 'middle',
      class: 'location-name'
    });
    nameText.textContent = loc.name;
    g.appendChild(nameText);
    
    return g;
  },

  /**
   * 获取地点类型图标
   * @param {string} type - 地点类型
   * @returns {string}
   */
  getLocationIcon(type) {
    const icons = {
      safe: '🏠',
      danger: '⚔️',
      shop: '🛒',
      event: '❓',
      unknown: '?',
      boss: '💀'
    };
    return icons[type] || '📍';
  },

  /**
   * 渲染NPC
   * @param {Object} npc - NPC数据
   * @returns {SVGElement}
   */
  renderNPC(npc) {
    const g = this.createSVGElement('g', {
      class: 'map-npc',
      'data-type': 'npc',
      'data-id': npc.id,
      transform: `translate(${npc.x}, ${npc.y})`
    });
    
    // NPC图标（小圆形）
    const circle = this.createSVGElement('circle', {
      r: 6,
      fill: '#9c27b0',
      stroke: '#fff',
      'stroke-width': 1.5,
      class: 'npc-icon'
    });
    g.appendChild(circle);
    
    // NPC名称
    const nameText = this.createSVGElement('text', {
      y: 16,
      'text-anchor': 'middle',
      class: 'npc-name'
    });
    nameText.textContent = npc.name;
    g.appendChild(nameText);
    
    return g;
  },

  /**
   * 渲染玩家
   * @param {Object} player - 玩家数据
   * @returns {SVGElement}
   */
  renderPlayer(player) {
    const g = this.createSVGElement('g', {
      class: 'map-player',
      transform: `translate(${player.x}, ${player.y})`
    });
    
    // 外圈动画
    const outerCircle = this.createSVGElement('circle', {
      r: 12,
      fill: 'none',
      stroke: '#4fc3f7',
      'stroke-width': 2,
      opacity: 0.5,
      class: 'player-pulse'
    });
    g.appendChild(outerCircle);
    
    // 玩家标记
    const marker = this.createSVGElement('circle', {
      r: 8,
      fill: 'url(#playerGradient)',
      stroke: '#fff',
      'stroke-width': 2,
      filter: 'url(#glow)',
      class: 'player-marker'
    });
    g.appendChild(marker);
    
    // 玩家图标
    const icon = this.createSVGElement('text', {
      y: 1,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': '10',
      fill: '#fff'
    });
    icon.textContent = '👤';
    g.appendChild(icon);
    
    return g;
  },

  /**
   * 渲染路径
   * @param {Object} path - 路径数据
   * @returns {SVGElement|null}
   */
  renderPath(path) {
    const map = GameVariables.map;
    const fromLoc = map.locations?.find(l => l.id === path.from);
    const toLoc = map.locations?.find(l => l.id === path.to);
    
    if (!fromLoc || !toLoc) return null;
    
    const line = this.createSVGElement('line', {
      x1: fromLoc.x,
      y1: fromLoc.y,
      x2: toLoc.x,
      y2: toLoc.y,
      class: `map-path ${path.type || 'road'} ${path.passable === false ? 'blocked' : ''}`,
      'stroke-dasharray': path.type === 'path' ? '5,5' : 'none'
    });
    
    return line;
  },

  /**
   * 调整视口以适应内容
   */
  fitViewBox() {
    const map = GameVariables.map;
    if (!map.locations || map.locations.length === 0) return;
    
    // 计算边界
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    map.locations.forEach(loc => {
      minX = Math.min(minX, loc.x);
      maxX = Math.max(maxX, loc.x);
      minY = Math.min(minY, loc.y);
      maxY = Math.max(maxY, loc.y);
    });
    
    // 添加边距
    const padding = 50;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;
    
    // 更新视口
    const width = Math.max(maxX - minX, 200);
    const height = Math.max(maxY - minY, 200);
    
    this.viewBox = {
      x: minX,
      y: minY,
      width: width,
      height: height
    };
    
    this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
  },

  /**
   * 绑定交互事件
   */
  bindEvents() {
    if (!this.svg) return;
    
    // 点击事件
    this.svg.addEventListener('click', (e) => {
      const target = e.target.closest('[data-id]');
      if (target) {
        const type = target.dataset.type;
        const id = target.dataset.id;
        
        if (typeof MapAPI !== 'undefined') {
          MapAPI.handleInteraction(type, id);
        }
      }
    });
    
    // 悬停效果
    this.svg.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-id]');
      if (target) {
        target.classList.add('hover');
        this.showTooltip(target);
      }
    });
    
    this.svg.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-id]');
      if (target) {
        target.classList.remove('hover');
        this.hideTooltip();
      }
    });
    
    // 拖拽平移
    this.svg.addEventListener('mousedown', (e) => {
      if (e.target === this.svg || e.target.closest('.map-layer-paths')) {
        this.drag.active = true;
        this.drag.startX = e.clientX;
        this.drag.startY = e.clientY;
        this.drag.viewBoxStartX = this.viewBox.x;
        this.drag.viewBoxStartY = this.viewBox.y;
        this.svg.style.cursor = 'grabbing';
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (this.drag.active) {
        const dx = (e.clientX - this.drag.startX) * (this.viewBox.width / this.svg.clientWidth);
        const dy = (e.clientY - this.drag.startY) * (this.viewBox.height / this.svg.clientHeight);
        
        this.viewBox.x = this.drag.viewBoxStartX - dx;
        this.viewBox.y = this.drag.viewBoxStartY - dy;
        
        this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
      }
    });
    
    document.addEventListener('mouseup', () => {
      this.drag.active = false;
      if (this.svg) {
        this.svg.style.cursor = 'grab';
      }
    });
    
    // 滚轮缩放
    this.svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
      const newWidth = this.viewBox.width * scaleFactor;
      const newHeight = this.viewBox.height * scaleFactor;
      
      // 限制缩放范围
      if (newWidth < 100 || newWidth > 1000) return;
      
      // 以鼠标位置为中心缩放
      const rect = this.svg.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width;
      const mouseY = (e.clientY - rect.top) / rect.height;
      
      this.viewBox.x += (this.viewBox.width - newWidth) * mouseX;
      this.viewBox.y += (this.viewBox.height - newHeight) * mouseY;
      this.viewBox.width = newWidth;
      this.viewBox.height = newHeight;
      
      this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
    });
  },

  /**
   * 显示工具提示
   * @param {Element} target - 目标元素
   */
  showTooltip(target) {
    const type = target.dataset.type;
    const id = target.dataset.id;
    const map = GameVariables.map;
    
    let data = null;
    if (type === 'location') {
      data = map.locations?.find(l => l.id === id);
    } else if (type === 'npc') {
      data = map.npcs?.find(n => n.id === id);
    }
    
    if (!data) return;
    
    // 创建或更新工具提示
    let tooltip = document.getElementById('map-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'map-tooltip';
      tooltip.className = 'map-tooltip';
      document.body.appendChild(tooltip);
    }
    
    tooltip.innerHTML = `
      <div class="tooltip-title">${data.name}</div>
      ${data.description ? `<div class="tooltip-desc">${data.description}</div>` : ''}
      ${type === 'location' ? `<div class="tooltip-type">${this.getLocationTypeName(data.type)}</div>` : ''}
    `;
    
    tooltip.style.display = 'block';
    
    // 定位工具提示
    const rect = target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 10}px`;
  },

  /**
   * 隐藏工具提示
   */
  hideTooltip() {
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  },

  /**
   * 获取地点类型名称
   * @param {string} type - 类型
   * @returns {string}
   */
  getLocationTypeName(type) {
    const names = {
      safe: '安全区域',
      danger: '危险区域',
      shop: '商店',
      event: '事件点',
      unknown: '未知区域',
      boss: 'Boss区域'
    };
    return names[type] || '未知';
  },

  /**
   * 创建SVG元素
   * @param {string} tag - 标签名
   * @param {Object} attrs - 属性
   * @returns {SVGElement}
   */
  createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    return el;
  },

  /**
   * 聚焦到玩家位置
   */
  focusOnPlayer() {
    const player = GameVariables.map.player;
    if (!player) return;
    
    this.viewBox.x = player.x - this.viewBox.width / 2;
    this.viewBox.y = player.y - this.viewBox.height / 2;
    
    this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
  },

  /**
   * 重置视口
   */
  resetViewport() {
    this.viewBox = {
      x: -150,
      y: -150,
      width: 300,
      height: 300
    };
    this.fitViewBox();
  }
};

// 导出
window.MapRenderer = MapRenderer;
