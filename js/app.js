/* ============================================================
   无限回廊 v5.0 — 回廊引擎
   ============================================================ */

// ============ Helpers ============
const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

function getNested(obj, path, def) {
  const keys = path.split('.'); let cur = obj;
  for (const k of keys) { if (cur == null || typeof cur !== 'object') return def; cur = cur[k]; }
  return cur !== undefined ? cur : def;
}

function setNested(obj, path, val) {
  const keys = path.split('.'); const last = keys.pop();
  let cur = obj;
  for (const k of keys) { if (!(k in cur) || typeof cur[k] !== 'object') cur[k] = {}; cur = cur[k]; }
  cur[last] = val;
}

function cloneDeep(obj) { return JSON.parse(JSON.stringify(obj)); }

// ============ Ember Background ============
function initEmbers() {
  const canvas = document.createElement('canvas');
  canvas.id = 'ember-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3, speedY: -(Math.random() * 0.2 + 0.05),
      speedX: (Math.random() - 0.5) * 0.15, wobble: Math.random() * 0.3,
      wobbleS: Math.random() * 0.01 + 0.003,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() < 0.7 ? 'ember' : 'gold',
      life: Math.random()
    });
  }
  let frame = 0;
  function animate() {
    frame++; ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.speedY; p.x += p.speedX + Math.sin(frame * p.wobbleS) * p.wobble;
      p.life -= 0.001;
      if (p.life <= 0 || p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; p.life = 1; }
      const a = p.opacity * Math.max(0, p.life);
      if (a < 0.01) return;
      ctx.beginPath();
      ctx.fillStyle = p.hue === 'ember' ? `rgba(180,80,30,${a})` : `rgba(180,140,70,${a * 0.7})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = p.hue === 'ember' ? `rgba(200,80,30,${a * 0.2})` : `rgba(180,140,70,${a * 0.15})`;
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ============ Toast ============
const Toast = {
  container: null,
  init() { this.container = $('#toast-container'); if (!this.container) { const el = document.createElement('div'); el.id = 'toast-container'; document.body.appendChild(el); this.container = el; } },
  show(msg, duration = 3000) {
    if (!this.container) this.init();
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
    this.container.appendChild(el);
    setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, duration);
  }
};

// ============ Game Data ============
const GameData = {
  stat_data: {
    '当前世界': '现实', '当前时间': { '现实日期': '2025年5月10日', '现实时间': '凌晨00:00', '副本日期': '不在副本中', '客观时间': '不在副本中', '地点': '回廊广场 · 一阶区', '阶段进度': '0%' },
    '契约者': {
      '头部': { '姓名': '未命名', '等级': 3, 'EXP_当前': 35, 'EXP_升级所需': 150, '阶位': '一阶', '军衔': '上士', 'RP_当前': 12, 'RP_下一级': 15, 'CR': 4.2, '回廊态度': '关注', '属性软上限': 25, '天赋': { '名称': '钢铁意志', '品质': '蓝', '属性加成': 'CON +3', '效果': { '坚韧': '受到致命伤害时15%概率保留1HP' } }, '称号': { '名称': '初探深渊者', '效果': { '威压': '对一阶以下生物+5%伤害' } } },
      '属性': { '基础': { 'STR': 8, 'AGI': 6, 'CON': 12, 'PER': 9 }, '自定义加成': { 'STR': 0, 'AGI': 0, 'CON': 0, 'PER': 0 }, '加成': { 'STR': 3, 'AGI': 0, 'CON': 6, 'PER': 0 }, '实际': { 'STR': 11, 'AGI': 6, 'CON': 18, 'PER': 9 }, '未分配属性点': 2 },
      '衍生属性': { 'HP_最大': 270, 'HP_当前': 218, 'MP_最大': 90, 'MP_当前': 90, '耐力_最大': 180, '耐力_当前': 155, '防御': 12, '闪避值': 11, '移动距离': 6, '负重_上限': 55, '负重_当前': 18 },
      '状态': { '生命状态': '受伤', '特殊状态': { '疲惫': '连续作战8h，全属性判定-1' } },
      '经济': { 'UP': 245 },
      '赛季信息': { '当前赛季': 21, '当前副本周期': 3 }, '资格分': 45, '排行榜': { '当前排名': '未上榜', '排行榜被动': '无' },
      '职业': { '名称': '前线突击兵', '稀有度': '绿', '转职阶段': '一转', '职业等级': 5, '主属性加成': { '属性': 'STR', '值': 3 }, '副属性加成': { '属性': 'CON', '值': 3 } },
      '装备': {
        '头部': { '名称': '战术头盔 MK-II', '类型': '头部防具', '品质': '蓝色', '强化等级': 2, '主属性': 'CON', '主属性加成': 2, '装备防御': 4, '装备闪避': 1, '负重': 3, '效果': '头部伤害-15%' },
        '躯干': { '名称': '突击兵战术背心', '类型': '躯干防具', '品质': '绿色', '强化等级': 3, '主属性': 'CON', '主属性加成': 1, '装备防御': 8, '负重': 8, '效果': '物理伤害减免5%' },
        '主手': { '名称': '先锋突袭步枪', '类型': '突击步枪', '品质': '蓝色', '强化等级': 3, '伤害骰': '2d10', '倍率': 1, '主属性': 'STR', '主属性加成': 0, '负重': 5, '效果': '暴击伤害+20%' },
        '饰品1': { '名称': '契约者铭牌', '类型': '饰品', '品质': '绿色', '主属性': 'PER', '主属性加成': 0, '效果': '回廊声望+5%' }
      },
      '背包': { '医疗包 (标准)': { '数量': 3, '品质': '白', '类型': '消耗品', '效果': '回复30HP' }, '破片手雷': { '数量': 2, '品质': '白', '类型': '投掷武器', '伤害骰': '4d6' } },
      '小队': { '名称': '无', '成员': {} },
      '当前副本元数据': { '副本名称': '不在副本中', '副本来源': '---', '副本类型': '---', '基准等级': 1, '时间限制': '---' },
      '固有角色': {}, '其他契约者名单': {},
      '当前副本任务': { '主线任务': {}, '支线任务': {}, '隐藏任务': {}, '世界事件': {}, '副本成就': {} },
      '当前敌人': {},
      '职业': {
        '名称': '前线突击兵', '稀有度': '绿', '转职阶段': '一转', '职业等级': 5, '主属性加成': { '属性': 'STR', '值': 3 }, '副属性加成': { '属性': 'CON', '值': 3 },
        '职业技能': {
          '破甲突刺': { '名称': '破甲突刺', '分类': '银色', '类型': '物理', '阶位': '一阶', '等级': 3, '关联属性': 'STR', '行动类型': '攻击', '消耗': 'MP 15', '冷却': '2回合', '效果': { '伤害': '2d8+STR+职业等级×2', '破甲': '无视50%装备防御' } },
          '战术翻滚': { '名称': '战术翻滚', '分类': '普通', '类型': '身法', '阶位': '一阶', '等级': 2, '关联属性': 'AGI', '行动类型': '闪避', '消耗': '耐力 10', '冷却': '3回合', '效果': { '闪避提升': '本回合闪避+15', '位移': '2m' } }
        },
        '职业特性': { '冲锋突击': { '效果': '每移动3m伤害+2%' }, '战场适应': { '效果': '范围伤害CON判定减半' } },
        '传承技能': { '血战意志': { '等级': 1, '效果': 'HP<30%时伤害+20%' } },
        '转职树': { '名称': '前线突击兵', '状态': '当前', '分支': { '重装先锋': { '状态': '未解锁', '分支': { '铁壁守护者': { '状态': '未选择' }, '破阵重甲兵': { '状态': '未选择' } } }, '轻装斥候': { '状态': '未解锁', '分支': { '暗影猎手': { '状态': '未选择' }, '疾风游侠': { '状态': '未选择' } } } } }
      },
      '通用技能': { '急救包扎': { '名称': '急救包扎', '分类': '普通', '类型': '治疗', '等级': 2, '效果': { '恢复': '2d6+PER HP' } }, '侦查之眼': { '名称': '侦查之眼', '分类': '高级', '类型': '感知', '等级': 1, '效果': { '探测': '感知30m隐藏目标' } } },
      '副本经历': { '新手试炼·废墟都市': { '评价等级': 'B', '简要说明': '首次进入回廊副本' }, '血色黎明·古堡突围': { '评价等级': 'A', '简要说明': '获得稀有血族遗物' } },
      '人际关系': { '「零」- 神秘少女': { '好感度': 45, '关系': '多次在关键时刻提供帮助' }, '王猛 - 重甲战士': { '好感度': 30, '关系': '古堡副本并肩作战' } }
    }
  }
};

function d(path, def) { return getNested(GameData.stat_data, path, def); }

// ============ Populate Walls ============
function populateWalls() {
  // Identity poster
  setText('h-name', d('契约者.头部.姓名', '---'));
  setText('h-rank', d('契约者.头部.阶位', '一阶'));
  setHtml('h-lv', '<span class="chalk-num" data-path="契约者.头部.等级">' + d('契约者.头部.等级', 1) + '</span>');
  setText('h-army', d('契约者.头部.军衔', '列兵'));
  setText('h-cr', d('契约者.头部.CR', 3.0));
  setText('h-att', d('契约者.头部.回廊态度', '观察'));

  // Stat markings
  const softCap = d('契约者.头部.属性软上限', 25);
  ['STR', 'AGI', 'CON', 'PER'].forEach((attr, i) => {
    const names = ['str', 'agi', 'con', 'per'];
    const val = d(`契约者.属性.实际.${attr}`, 5);
    setText(`attr-${names[i]}`, val);
    setStyle(`fill-${names[i]}`, 'width', Math.min(val / softCap * 100, 100) + '%');
  });

  // HP/MP/SP gauges
  const hpMax = d('契约者.衍生属性.HP_最大', 0), hpCur = d('契约者.衍生属性.HP_当前', 0);
  const mpMax = d('契约者.衍生属性.MP_最大', 0), mpCur = d('契约者.衍生属性.MP_当前', 0);
  const spMax = d('契约者.衍生属性.耐力_最大', 0), spCur = d('契约者.衍生属性.耐力_当前', 0);
  setText('gauge-hp-num', hpCur + '/' + hpMax);
  setText('gauge-mp-num', mpCur + '/' + mpMax);
  setText('gauge-sp-num', spCur + '/' + spMax);
  setStyle('gauge-hp-fill', 'width', Math.min(hpCur / Math.max(hpMax, 1) * 100, 100) + '%');
  setStyle('gauge-mp-fill', 'width', Math.min(mpCur / Math.max(mpMax, 1) * 100, 100) + '%');
  setStyle('gauge-sp-fill', 'width', Math.min(spCur / Math.max(spMax, 1) * 100, 100) + '%');

  // Warnings
  const lifeState = d('契约者.状态.生命状态', '健康');
  setText('state-life', lifeState);
  const specStates = d('契约者.状态.特殊状态', {});
  const ssKeys = Object.keys(specStates);
  setText('state-special-text', ssKeys.length > 0 ? ssKeys[0] : '无异常');

  // Enemies
  const enemies = d('契约者.当前敌人', {});
  const enKeys = Object.keys(enemies);
  setText('enemy-count-wall', enKeys.length);

  // Door
  const meta = d('契约者.当前副本元数据', {});
  const dungeonName = getNested(meta, '副本名称', '---');
  setText('door-dungeon-name', dungeonName);
  setText('door-number', dungeonName === '不在副本中' || dungeonName === '---' ? '---' : '001');
  const doorLight = $('#door-light');
  if (doorLight) { if (dungeonName !== '不在副本中' && dungeonName !== '---') doorLight.classList.add('active'); else doorLight.classList.remove('active'); }

  // Squad polaroids
  const squad = d('契约者.小队.成员', {});
  const sqKeys = Object.keys(squad);
  let ph = '';
  if (sqKeys.length === 0) ph = '<div class="polaroid"><div class="polaroid-name">暂无队员</div></div>';
  else sqKeys.forEach(k => {
    const m = squad[k] || {};
    ph += `<div class="polaroid"><div class="polaroid-name">${k}</div><div class="polaroid-info">Lv.${getNested(m, '头部.等级', 1)} · ${getNested(m, '职业.名称', '无')}</div></div>`;
  });
  setHtml('squad-polaroids', ph);

  // Floor items (bag preview)
  const bag = d('契约者.背包', {});
  const bagKeys = Object.keys(bag);
  let fh = '';
  const show = bagKeys.slice(0, 4);
  show.forEach(k => { fh += `<div class="floor-item">${k}×${bag[k].数量 || 1}</div>`; });
  if (bagKeys.length > 4) fh += `<div class="floor-item">+${bagKeys.length - 4} 件…</div>`;
  setHtml('floor-items', fh);

  bindChalkNumbers();
}

function setText(id, t) { const el = $('#' + id); if (el) el.textContent = t; }
function setHtml(id, h) { const el = $('#' + id); if (el) el.innerHTML = h; }
function setStyle(id, p, v) { const el = $('#' + id); if (el) el.style[p] = v; }

// ============ Chalk Numbers (inline editing) ============
function bindChalkNumbers() {
  $$('.chalk-num').forEach(el => {
    el.removeEventListener('click', chalkClick);
    el.addEventListener('click', chalkClick);
  });
}
function chalkClick(e) {
  e.stopPropagation();
  const el = e.target;
  if (el.querySelector('input')) return;
  const path = el.dataset.path;
  const cur = parseFloat(el.textContent);
  const input = document.createElement('input');
  input.type = 'number'; input.step = 'any'; input.value = cur;
  input.style.cssText = 'width:' + (Math.max(el.offsetWidth, 24) + 10) + 'px;background:rgba(10,8,6,0.9);color:var(--amber-light);border:1px solid var(--rust);font-family:var(--font-mono);font-size:inherit;text-align:center;outline:none;';
  el.textContent = ''; el.appendChild(input);
  input.focus(); input.select();
  const commit = () => {
    const nv = parseFloat(input.value);
    if (!isNaN(nv) && nv !== cur) {
      setNested(GameData.stat_data, path, nv);
      populateWalls();
      Toast.show('已记录: ' + path.split('.').pop() + ' → ' + nv);
    } else populateWalls();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', ev => { if (ev.key === 'Enter') commit(); });
}

// ============ Detail Overlay ============
const Detail = {
  overlay: null, panel: null, backdrop: null, content: null,
  init() {
    this.overlay = $('#detail-overlay');
    this.panel = $('#detail-panel');
    this.backdrop = $('#detail-backdrop');
    this.content = $('#detail-content');
    $('#detail-close').addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
  },
  open(html) { if (!this.overlay) this.init(); this.content.innerHTML = html; this.overlay.classList.add('open'); },
  close() { if (this.overlay) this.overlay.classList.remove('open'); }
};

// ============ Detail Content Generators ============
function detailIdentity() {
  const d2 = (p, def) => d(p, def);
  const talent = d2('契约者.头部.天赋', {});
  const title = d2('契约者.头部.称号', {});
  let h = '<div class="detail-section"><div class="detail-section-header">契约者档案 <span>▼</span></div><div class="detail-section-body">';
  h += '<div class="detail-row"><span class="dl">姓名</span><span class="dv">' + d2('契约者.头部.姓名') + '</span></div>';
  h += '<div class="detail-row"><span class="dl">等级</span><span class="dv">Lv.' + d2('契约者.头部.等级') + '</span></div>';
  h += '<div class="detail-row"><span class="dl">EXP</span><span class="dv">' + d2('契约者.头部.EXP_当前') + ' / ' + d2('契约者.头部.EXP_升级所需') + '</span></div>';
  h += '<div class="detail-row"><span class="dl">阶位</span><span class="dv">' + d2('契约者.头部.阶位') + '</span></div>';
  h += '<div class="detail-row"><span class="dl">军衔</span><span class="dv">' + d2('契约者.头部.军衔') + '</span></div>';
  h += '<div class="detail-row"><span class="dl">RP</span><span class="dv">' + d2('契约者.头部.RP_当前') + ' / ' + d2('契约者.头部.RP_下一级') + '</span></div>';
  h += '<div class="detail-row"><span class="dl">CR</span><span class="dv">' + d2('契约者.头部.CR') + '</span></div>';
  h += '</div></div>';

  // Attributes
  h += '<div class="detail-section"><div class="detail-section-header">属性 <span>▼</span></div><div class="detail-section-body">';
  ['STR','AGI','CON','PER'].forEach(a => {
    h += '<div class="detail-row"><span class="dl">' + a + '</span><span class="dv">基础 ' + d2('契约者.属性.基础.' + a) + ' + 加成 ' + d2('契约者.属性.加成.' + a) + ' = <b>' + d2('契约者.属性.实际.' + a) + '</b></span></div>';
  });
  const free = d2('契约者.属性.未分配属性点', 0);
  h += '<div class="detail-row"><span class="dl">未分配</span><span class="dv" style="color:var(--rust-light);">' + free + '</span></div>';
  h += '</div></div>';

  // Talent & Title
  const tName = getNested(talent, '名称', '');
  if (tName && tName !== '无') {
    h += '<div class="detail-section"><div class="detail-section-header">天赋 <span>▼</span></div><div class="detail-section-body">';
    h += '<div class="detail-row"><span class="dl">名称</span><span class="dv">' + tName + '</span></div>';
    h += '<div class="detail-row"><span class="dl">品质</span><span class="dv">' + getNested(talent, '品质', '') + '</span></div>';
    h += '<div class="detail-row"><span class="dl">加成</span><span class="dv">' + getNested(talent, '属性加成', '') + '</span></div>';
    h += '</div></div>';
  }
  return h;
}

function detailDungeon() {
  const meta = d('契约者.当前副本元数据', {});
  let h = '<div class="detail-section"><div class="detail-section-header">副本元数据 <span>▼</span></div><div class="detail-section-body">';
  h += '<div class="detail-row"><span class="dl">副本名称</span><span class="dv">' + getNested(meta, '副本名称', '---') + '</span></div>';
  h += '<div class="detail-row"><span class="dl">副本来源</span><span class="dv">' + getNested(meta, '副本来源', '---') + '</span></div>';
  h += '<div class="detail-row"><span class="dl">副本类型</span><span class="dv">' + getNested(meta, '副本类型', '---') + '</span></div>';
  h += '<div class="detail-row"><span class="dl">基准等级</span><span class="dv">Lv.' + getNested(meta, '基准等级', 1) + '</span></div>';
  h += '</div></div>';

  // Quests
  const sections = [
    ['主线任务', '契约者.当前副本任务.主线任务'],
    ['支线任务', '契约者.当前副本任务.支线任务'],
    ['隐藏任务', '契约者.当前副本任务.隐藏任务'],
    ['世界事件', '契约者.当前副本任务.世界事件'],
    ['副本成就', '契约者.当前副本任务.副本成就']
  ];
  sections.forEach(([title, path]) => {
    const data = d(path, {});
    const keys = Object.keys(data);
    h += '<div class="detail-section"><div class="detail-section-header">' + title + ' (' + keys.length + ') <span>▼</span></div><div class="detail-section-body">';
    if (keys.length === 0) h += '<div style="color:var(--chalk-dim);font-style:italic;">暂无</div>';
    else keys.forEach(k => {
      const q = data[k] || {};
      h += '<div class="detail-row"><span class="dl">' + k + '</span><span class="dv">' + getNested(q, '状态', '进行中') + '</span></div>';
    });
    h += '</div></div>';
  });
  return h;
}

function detailEnemies() {
  const enemies = d('契约者.当前敌人', {});
  const keys = Object.keys(enemies);
  if (keys.length === 0) return '<div style="text-align:center;padding:40px;color:var(--chalk-dim);font-family:var(--font-display);letter-spacing:1px;">战场风平浪静</div>';
  let h = '';
  keys.forEach(k => {
    const en = enemies[k] || {};
    h += '<div class="detail-section"><div class="detail-section-header">' + k + ' <span>▼</span></div><div class="detail-section-body">';
    h += '<div class="detail-row"><span class="dl">等级</span><span class="dv">Lv.' + getNested(en, '头部.等级', 1) + '</span></div>';
    h += '<div class="detail-row"><span class="dl">阶位</span><span class="dv">' + getNested(en, '头部.阶位', '?') + '</span></div>';
    h += '<div class="detail-row"><span class="dl">CR</span><span class="dv">' + getNested(en, '头部.CR', '?') + '</span></div>';
    h += '<div class="detail-row"><span class="dl">HP</span><span class="dv">' + getNested(en, '衍生属性.HP_当前', '?') + ' / ' + getNested(en, '衍生属性.HP_最大', '?') + '</span></div>';
    h += '</div></div>';
  });
  return h;
}

function detailMap() {
  const facilities = [
    ['回廊广场', '按阶位划分的安全区。绝对禁止武力冲突。', 'unlocked'],
    ['排行榜石碑', '展示人黄玄地天五榜。', 'unlocked'],
    ['回廊悬赏板', '接取回廊发布的定向悬赏任务。', 'locked'],
    ['基础商店', '出售一阶白/蓝装备和基础消耗品。', 'unlocked'],
    ['高级市场', '出售蓝/绿/金装备及技能卷轴。', 'locked'],
    ['军衔商店', '根据军衔开放对应货架。', 'unlocked'],
    ['回廊密库', '出售紫传职业书与天赋试炼券。', 'locked'],
    ['医疗中心', '全HP治愈/解除负面/断肢修复。', 'unlocked'],
    ['强化室', '装备强化与技能升级。', 'unlocked'],
    ['职业馆', '出售基础与一转职业书。', 'unlocked'],
    ['回廊铸造室', '蓝色以上装备词条重铸。', 'locked'],
    ['个人储藏室', '存放不携带入本的装备物资。', 'unlocked'],
    ['世界调度室', '花费UP选择或回归副本。', 'locked']
  ];
  let h = '<div class="detail-section"><div class="detail-section-header">全区地图 <span>▼</span></div><div class="detail-section-body">';
  facilities.forEach(([name, desc, status]) => {
    const cls = status === 'unlocked' ? 'tag-copper' : 'tag-blood';
    const label = status === 'unlocked' ? '已解锁' : '权限不足';
    h += '<div class="detail-row" style="flex-direction:column;align-items:flex-start;padding:6px 0;"><div style="display:flex;justify-content:space-between;width:100%;"><span class="dl">' + name + '</span><span class="detail-tag ' + cls + '">' + label + '</span></div><div style="font-size:0.7rem;color:var(--chalk-dim);margin-top:2px;">' + desc + '</div></div>';
  });
  h += '</div></div>';
  return h;
}

function detailJobTree() {
  const tree = d('契约者.职业.转职树', null);
  if (!tree) return '<div style="text-align:center;padding:40px;color:var(--chalk-dim);">尚未加载职业树</div>';
  function renderNode(data, name) {
    const status = getNested(data, '状态', '未选择');
    let cls = 'detail-tag tag-iron';
    if (status === '当前') cls = 'detail-tag tag-rust';
    else if (status === '已完成') cls = 'detail-tag tag-copper';
    let h = '<div style="margin:4px 0;padding-left:16px;border-left:1px solid var(--iron-dark);"><span style="font-weight:700;">' + name + '</span> <span class="' + cls + '">' + status + '</span>';
    const children = getNested(data, '分支', {});
    Object.keys(children).forEach(k => { h += renderNode(children[k], k); });
    h += '</div>';
    return h;
  }
  return '<div class="detail-section"><div class="detail-section-header">转职路线 <span>▼</span></div><div class="detail-section-body">' + renderNode(tree, getNested(tree, '名称', '根')) + '</div></div>';
}

function detailEquipment() {
  const eq = d('契约者.装备', {});
  const slots = ['头部','躯干','腿部','手部','脚部','主手','副手','饰品1','饰品2'];
  let h = '<div class="detail-section"><div class="detail-section-header">装备 <span>▼</span></div><div class="detail-section-body">';
  slots.forEach(s => {
    const e = getNested(eq, s, {});
    const name = getNested(e, '名称', '无');
    h += '<div class="detail-row"><span class="dl">' + s + '</span><span class="dv" style="color:' + (name === '无' ? 'var(--chalk-dim)' : 'var(--amber-light)') + '">' + name + '</span></div>';
  });
  h += '</div></div>';

  const bag = d('契约者.背包', {});
  const bk = Object.keys(bag);
  h += '<div class="detail-section"><div class="detail-section-header">背包 (' + bk.length + ') <span>▼</span></div><div class="detail-section-body">';
  if (bk.length === 0) h += '<div style="color:var(--chalk-dim);">空空如也</div>';
  else bk.forEach(k => { h += '<div class="detail-row"><span class="dl">' + k + '</span><span class="dv">×' + getNested(bag[k], '数量', 1) + '</span></div>'; });
  h += '</div></div>';
  return h;
}

// ============ Radio (Chat) System ============
const Radio = {
  overlay: null, messages: null, input: null,
  init() {
    this.overlay = $('#radio-overlay');
    this.messages = $('#radio-messages');
    this.input = $('#radio-input');
    $('#radio-close').addEventListener('click', () => this.close());
    $('#radio-backdrop').addEventListener('click', () => this.close());
    $('#radio-send').addEventListener('click', () => this.send());
    this.input.addEventListener('keydown', e => { if (e.key === 'Enter') this.send(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.overlay.classList.contains('open')) this.close(); });
  },
  open() { if (!this.overlay) this.init(); this.overlay.classList.add('open'); setTimeout(() => this.input.focus(), 400); },
  close() { if (this.overlay) this.overlay.classList.remove('open'); },
  send() {
    const text = this.input.value.trim();
    if (!text) return;
    this.addMsg(text, 'user');
    this.input.value = '';
    setTimeout(() => {
      const replies = ['收到。信号已传达到回廊深处。', '……正在处理你的请求。', '契约者，你的声音我听到了。', '通讯已记录。请保持警惕。', '回廊的回应正在穿越层层走廊。耐心等待。'];
      this.addMsg(replies[Math.floor(Math.random() * replies.length)], 'ai');
    }, 700 + Math.random() * 800);
  },
  addMsg(text, role) {
    const el = document.createElement('div');
    el.className = 'radio-msg ' + role;
    el.textContent = text;
    this.messages.appendChild(el);
    this.messages.scrollTop = this.messages.scrollHeight;
  }
};

// ============ Event Bindings ============
function bindEvents() {
  // Wall poster click → detail overlay
  $('#poster-identity').addEventListener('click', () => Detail.open(detailIdentity()));

  // Emergency light click → toggle detail
  $('#emergency-light').addEventListener('click', () => Detail.open(detailIdentity()));

  // Far door click → dungeon detail
  $('#far-door').addEventListener('click', () => Detail.open(detailDungeon()));

  // Warning click → detail
  $('#warning-life').addEventListener('click', () => Detail.open(detailIdentity()));

  // Alert click → enemy detail
  $('#alert-enemies').addEventListener('click', () => Detail.open(detailEnemies()));

  // Gauge clicks
  $('#gauge-hp').addEventListener('click', () => Detail.open(detailIdentity()));
  $('#gauge-mp').addEventListener('click', () => Detail.open(detailIdentity()));
  $('#gauge-sp').addEventListener('click', () => Detail.open(detailIdentity()));

  // Radio click
  $('#radio').addEventListener('click', () => Radio.open());

  // Floor items click → equipment/bag detail
  $('#floor-items').addEventListener('click', () => Detail.open(detailEquipment()));

  // Wall panel buttons
  const views = {
    identity: () => Detail.open(detailIdentity()),
    dungeon: () => Detail.open(detailDungeon()),
    enemies: () => Detail.open(detailEnemies()),
    map: () => Detail.open(detailMap()),
    jobtree: () => Detail.open(detailJobTree())
  };
  $$('.panel-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', function() {
      $$('.panel-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const view = this.dataset.view;
      if (views[view]) views[view]();
    });
  });

  // Detail section collapse
  $('#detail-content').addEventListener('click', function(e) {
    const header = e.target.closest('.detail-section-header');
    if (!header) return;
    const body = header.nextElementSibling;
    const arrow = header.querySelector('span');
    if (body) { body.classList.toggle('hidden'); if (arrow) arrow.textContent = body.classList.contains('hidden') ? '▶' : '▼'; }
  });

  // Poster marks click
  $('#markings-stats').addEventListener('click', () => Detail.open(detailIdentity()));
  $('#squad-polaroids').addEventListener('click', () => Detail.open(detailIdentity()));

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
      const map = { '1': detailIdentity, '2': detailDungeon, '3': detailEnemies, '4': detailMap, '5': detailJobTree };
      const fn = map[e.key];
      if (fn) { e.preventDefault(); Detail.open(fn()); }
    }
    // 'R' for radio
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey && document.activeElement === document.body) {
      Radio.open();
    }
  });
}

// ============ Init ============
function init() {
  initEmbers();
  Toast.init();
  Detail.init();
  Radio.init();
  populateWalls();
  bindEvents();

  setTimeout(() => Toast.show('你站在回廊中。前面的路通向未知。', 5000), 1500);

  console.log('%c◆ 无限回廊 · Infinite Corridor %cv5.0',
    'color:#c4a35a;font-size:1.2em;',
    'color:#b5ac9a;');
  console.log('%c你正站在回廊之中。', 'color:#7a7162;font-style:italic;');
}

document.addEventListener('DOMContentLoaded', init);
