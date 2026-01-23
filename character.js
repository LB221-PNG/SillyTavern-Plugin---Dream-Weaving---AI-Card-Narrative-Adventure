/* ============================================================
 * 克劳德 - AI卡牌叙事冒险
 * 角色创建界面
 * ============================================================ */

/**
 * 角色创建界面模块
 */
const CharacterUI = {
  /**
   * 初始化角色创建界面
   */
  init() {
    this.bindEvents();
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 角色创建表单
    const characterForm = document.getElementById('character-form');
    if (characterForm) {
      characterForm.addEventListener('submit', e => {
        e.preventDefault();
        this.submitCharacter();
      });
    }

    // 返回按钮
    const backBtn = document.getElementById('btn-back-home');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        navigateTo('home');
      });
    }

    // 实时预览角色信息
    this.bindPreviewEvents();
  },

  /**
   * 绑定预览事件
   */
  bindPreviewEvents() {
    const fields = ['char-name', 'char-gender', 'char-age', 'char-race', 'char-class'];

    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener(
          'input',
          debounce(() => {
            this.updatePreview();
          }, 300),
        );
      }
    });
  },

  /**
   * 更新预览（可选功能）
   */
  updatePreview() {
    // 可以在这里添加角色预览功能
  },

  /**
   * 提交角色信息
   */
  submitCharacter() {
    // 收集表单数据
    const name = DOM.elements.charName?.value?.trim();
    const gender = DOM.elements.charGender?.value;
    const age = parseInt(DOM.elements.charAge?.value, 10) || 24;
    const race = DOM.elements.charRace?.value;
    const charClass = DOM.elements.charClass?.value?.trim();
    const appearance = DOM.elements.charAppearance?.value?.trim();
    const background = DOM.elements.charBackground?.value?.trim();

    // 验证必填字段
    if (!name) {
      showToast('请输入角色姓名');
      DOM.elements.charName?.focus();
      return;
    }

    // 更新游戏状态
    GameState.character.name = name;
    GameState.character.gender = gender || 'female';
    GameState.character.age = age;
    GameState.character.race = race || 'human';
    GameState.character.class = charClass || '冒险者';
    GameState.character.appearance = appearance || '';
    GameState.character.background = background || '';

    // 根据职业调整初始属性
    this.applyClassBonuses(charClass);

    // 跳转到世界创建页面
    navigateTo('world');
  },

  /**
   * 根据职业应用加成
   * @param {string} charClass - 职业名称
   */
  applyClassBonuses(charClass) {
    if (!charClass) return;

    const classLower = charClass.toLowerCase();

    // 战士类：更多生命值
    if (
      classLower.includes('剑') ||
      classLower.includes('战') ||
      classLower.includes('士') ||
      classLower.includes('骑')
    ) {
      GameState.character.maxHp = 100;
      GameState.character.hp = 100;
    }
    // 法师类：较少生命值但有其他优势
    else if (
      classLower.includes('法') ||
      classLower.includes('魔') ||
      classLower.includes('术') ||
      classLower.includes('巫')
    ) {
      GameState.character.maxHp = 70;
      GameState.character.hp = 70;
    }
    // 游侠/盗贼类：中等生命值
    else if (
      classLower.includes('游') ||
      classLower.includes('盗') ||
      classLower.includes('刺') ||
      classLower.includes('侠')
    ) {
      GameState.character.maxHp = 80;
      GameState.character.hp = 80;
    }
    // 默认
    else {
      GameState.character.maxHp = 80;
      GameState.character.hp = 80;
    }
  },

  /**
   * 重置表单
   */
  resetForm() {
    if (DOM.elements.charName) DOM.elements.charName.value = '';
    if (DOM.elements.charGender) DOM.elements.charGender.value = 'female';
    if (DOM.elements.charAge) DOM.elements.charAge.value = '24';
    if (DOM.elements.charRace) DOM.elements.charRace.value = 'human';
    if (DOM.elements.charClass) DOM.elements.charClass.value = '';
    if (DOM.elements.charAppearance) DOM.elements.charAppearance.value = '';
    if (DOM.elements.charBackground) DOM.elements.charBackground.value = '';
  },

  /**
   * 填充表单（用于编辑现有角色）
   */
  fillForm() {
    const char = GameState.character;
    if (DOM.elements.charName) DOM.elements.charName.value = char.name || '';
    if (DOM.elements.charGender) DOM.elements.charGender.value = char.gender || 'female';
    if (DOM.elements.charAge) DOM.elements.charAge.value = char.age || 24;
    if (DOM.elements.charRace) DOM.elements.charRace.value = char.race || 'human';
    if (DOM.elements.charClass) DOM.elements.charClass.value = char.class || '';
    if (DOM.elements.charAppearance) DOM.elements.charAppearance.value = char.appearance || '';
    if (DOM.elements.charBackground) DOM.elements.charBackground.value = char.background || '';
  },

  /**
   * 随机生成角色
   */
  randomizeCharacter() {
    const names = ['艾莉丝', '雷恩', '露娜', '凯尔', '薇拉', '亚瑟', '塞琳娜', '达蒙'];
    const classes = ['流浪剑士', '元素法师', '神秘游侠', '圣殿骑士', '暗影刺客', '自然德鲁伊'];
    const backgrounds = [
      '曾是一名王国的骑士，因为一场阴谋而被放逐',
      '在神秘的森林中长大，与自然有着深厚的联系',
      '来自一个古老的法师家族，背负着家族的使命',
      '曾是街头的孤儿，凭借机智和敏捷在乱世中生存',
      '是一名失忆者，醒来时发现自己身处异世界',
    ];

    if (DOM.elements.charName) {
      DOM.elements.charName.value = names[Math.floor(Math.random() * names.length)];
    }
    if (DOM.elements.charGender) {
      DOM.elements.charGender.value = Math.random() > 0.5 ? 'female' : 'male';
    }
    if (DOM.elements.charAge) {
      DOM.elements.charAge.value = 18 + Math.floor(Math.random() * 30);
    }
    if (DOM.elements.charRace) {
      const races = ['human', 'elf', 'dwarf', 'halfling', 'orc'];
      DOM.elements.charRace.value = races[Math.floor(Math.random() * races.length)];
    }
    if (DOM.elements.charClass) {
      DOM.elements.charClass.value = classes[Math.floor(Math.random() * classes.length)];
    }
    if (DOM.elements.charBackground) {
      DOM.elements.charBackground.value = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    }

    showToast('角色已随机生成');
  },
};

// 导出
window.CharacterUI = CharacterUI;
