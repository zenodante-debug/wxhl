/* ============================================================
   无限回廊 v6.0 — 里世界长廊引擎
   ============================================================ */

const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

function getNested(obj, path, def) {
  const keys = path.split('.'); let cur = obj;
  for (const k of keys) { if (cur == null || typeof cur !== 'object') return def; cur = cur[k]; }
  return cur !== undefined ? cur : def;
}

// ============ Ember BG ============
function initEmbers() {
  const c = $('#ember-bg');
  const ctx = c.getContext('2d');
  const P = [];
  function R() { c.width = innerWidth; c.height = innerHeight; }
  R(); window.addEventListener('resize', R);
  for (let i = 0; i < 50; i++) P.push({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 1.2 + 0.2, vy: -(Math.random() * 0.15 + 0.04), vx: (Math.random() - 0.5) * 0.1, o: Math.random() * 0.35 + 0.08, life: Math.random() });
  let f = 0;
  (function A() { f++; ctx.clearRect(0, 0, c.width, c.height);
    P.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin(f * 0.008 + p.life) * 0.2; p.life -= 0.001; if (p.life <= 0 || p.y < -20) { p.y = c.height + 20; p.x = Math.random() * c.width; p.life = 1; }
      const a = p.o * Math.max(0, p.life); if (a < 0.01) return;
      ctx.beginPath(); ctx.fillStyle = `rgba(180,80,30,${a})`; ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.fillStyle = `rgba(200,100,40,${a * 0.15})`; ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2); ctx.fill(); });
    requestAnimationFrame(A); })();
}

// ============ Game Data ============
const G = { stat_data: {
  '当前世界': '现实', '当前时间': { '现实日期': '2025年5月10日', '现实时间': '凌晨00:00', '副本日期': '不在副本中', '地点': '回廊广场 · 一阶区' },
  '契约者': {
    '头部': { '姓名': '未命名', '等级': 3, 'EXP_当前': 35, 'EXP_升级所需': 150, '阶位': '一阶', '军衔': '上士', 'RP_当前': 12, 'RP_下一级': 15, 'CR': 4.2, '回廊态度': '关注', '属性软上限': 25, '天赋': { '名称': '钢铁意志', '品质': '蓝', '属性加成': 'CON +3', '效果': { '坚韧': '受致命伤15%概率保留1HP' } }, '称号': { '名称': '初探深渊者', '效果': { '威压': '对一阶以下生物+5%伤害' } } },
    '属性': { '基础': { 'STR': 8, 'AGI': 6, 'CON': 12, 'PER': 9 }, '加成': { 'STR': 3, 'AGI': 0, 'CON': 6, 'PER': 0 }, '实际': { 'STR': 11, 'AGI': 6, 'CON': 18, 'PER': 9 }, '未分配属性点': 2 },
    '衍生属性': { 'HP_最大': 270, 'HP_当前': 218, 'MP_最大': 90, 'MP_当前': 90, '耐力_最大': 180, '耐力_当前': 155, '防御': 12, '闪避值': 11, '移动距离': 6, '负重_上限': 55, '负重_当前': 18 },
    '状态': { '生命状态': '受伤', '特殊状态': { '疲惫': '连续作战8h，全属性判定-1' } },
    '经济': { 'UP': 245 }, '赛季信息': { '当前赛季': 21, '当前副本周期': 3 }, '资格分': 45, '排行榜': { '当前排名': '未上榜', '排行榜被动': '无' },
    '装备': { '头部': { '名称': '战术头盔 MK-II', '品质': '蓝', '强化等级': 2, '主属性': 'CON', '主属性加成': 2, '装备防御': 4 }, '躯干': { '名称': '突击兵战术背心', '品质': '绿', '强化等级': 3, '主属性': 'CON', '主属性加成': 1, '装备防御': 8 }, '主手': { '名称': '先锋突袭步枪', '品质': '蓝', '强化等级': 3, '伤害骰': '2d10' }, '饰品1': { '名称': '契约者铭牌', '品质': '绿', '主属性': 'PER' } },
    '背包': { '医疗包 (标准)': { '数量': 3, '品质': '白' }, '肾上腺素注射器': { '数量': 1, '品质': '绿' }, '破片手雷': { '数量': 2, '品质': '白', '伤害骰': '4d6' }, '猎人瞄准镜': { '数量': 1, '品质': '蓝', '主属性': 'PER', '主属性加成': 2 } },
    '小队': { '名称': '无', '成员': {} },
    '当前副本元数据': { '副本名称': '不在副本中', '副本来源': '---', '副本类型': '---', '基准等级': 1, '时间限制': '---' },
    '固有角色': {}, '其他契约者名单': {},
    '当前副本任务': { '主线任务': {}, '支线任务': {}, '隐藏任务': {}, '世界事件': {}, '副本成就': {} },
    '当前敌人': {},
    '职业': { '名称': '前线突击兵', '稀有度': '绿', '转职阶段': '一转', '职业等级': 5, '主属性加成': { '属性': 'STR', '值': 3 }, '副属性加成': { '属性': 'CON', '值': 3 },
      '职业技能': { '破甲突刺': { '名称': '破甲突刺', '分类': '银色', '类型': '物理', '等级': 3, '效果': { '伤害': '2d8+STR+2', '破甲': '无视50%防御' } }, '战术翻滚': { '名称': '战术翻滚', '分类': '普通', '类型': '身法', '等级': 2, '效果': { '闪避': '+15', '位移': '2m' } } },
      '职业特性': { '冲锋突击': { '效果': '每移动3m伤害+2%' } },
      '传承技能': { '血战意志': { '等级': 1, '效果': 'HP<30%伤害+20%' } },
      '转职树': { '名称': '前线突击兵', '状态': '当前', '分支': { '重装先锋': { '状态': '未解锁', '分支': { '铁壁守护者': {}, '破阵重甲兵': {} } }, '轻装斥候': { '状态': '未解锁', '分支': { '暗影猎手': {}, '疾风游侠': {} } } } }
    },
    '通用技能': { '急救包扎': { '名称': '急救包扎', '类型': '治疗', '等级': 2 }, '侦查之眼': { '名称': '侦查之眼', '类型': '感知', '等级': 1 } },
    '副本经历': { '新手试炼·废墟都市': { '评价等级': 'B', '简要说明': '首次副本' }, '血色黎明·古堡突围': { '评价等级': 'A', '简要说明': '获得稀有血族遗物' } },
    '人际关系': { '「零」- 神秘少女': { '好感度': 45, '关系': '多次关键帮助' }, '王猛 - 重甲战士': { '好感度': 30, '关系': '古堡并肩作战' } }
  }
}};
function D(p, def) { return getNested(G.stat_data, p, def); }

// ============ Populate HUD & Walls ============
function populate() {
  const d = D;
  // HUD
  const hpm = d('契约者.衍生属性.HP_最大', 0), hpc = d('契约者.衍生属性.HP_当前', 0);
  const mpm = d('契约者.衍生属性.MP_最大', 0), mpc = d('契约者.衍生属性.MP_当前', 0);
  const spm = d('契约者.衍生属性.耐力_最大', 0), spc = d('契约者.衍生属性.耐力_当前', 0);
  setText('hud-hp-num', hpc + '/' + hpm); setStyle('hud-hp-fill', 'width', Math.min(hpc / Math.max(hpm, 1) * 100, 100) + '%');
  setText('hud-mp-num', mpc + '/' + mpm); setStyle('hud-mp-fill', 'width', Math.min(mpc / Math.max(mpm, 1) * 100, 100) + '%');
  setText('hud-sp-num', spc + '/' + spm); setStyle('hud-sp-fill', 'width', Math.min(spc / Math.max(spm, 1) * 100, 100) + '%');
  setText('hud-name', d('契约者.头部.姓名', '---'));
  setText('hud-life-state', d('契约者.状态.生命状态', '健康'));

  // Door statuses
  const metaName = d('契约者.当前副本元数据.副本名称', '---');
  const dungeonActive = metaName !== '不在副本中' && metaName !== '---';
  setText('door-status-dungeon', dungeonActive ? metaName : '无活跃副本');
  $('#door-status-dungeon').className = 'door-status' + (dungeonActive ? '' : ' dim');

  const enemies = d('契约者.当前敌人', {});
  const enKeys = Object.keys(enemies);
  setText('door-status-enemies', enKeys.length > 0 ? '交战中: ' + enKeys.length : '安全');
  $('#door-status-enemies').className = 'door-status' + (enKeys.length > 0 ? ' danger' : ' dim');

  setText('door-status-identity', d('契约者.头部.姓名', '---'));
  setText('door-status-squad', d('契约者.小队.名称', '无队员'));
  setText('door-status-job', d('契约者.职业.名称', '无'));

  // Portal
  setText('portal-name', dungeonActive ? metaName : '当前无活跃副本');
  const pl = $('#portal-label');
  if (pl) pl.textContent = dungeonActive ? '◆ ENTER ◆' : '◆ 待命 ◆';

  // Bag count
  const bag = d('契约者.背包', {});
  setText('bag-count', Object.keys(bag).length + '件');
}
function setText(id, t) { const el = $('#' + id); if (el) el.textContent = t; }
function setHtml(id, h) { const el = $('#' + id); if (el) el.innerHTML = h; }
function setStyle(id, p, v) { const el = $('#' + id); if (el) el.style[p] = v; }

// ============ Overlay ============
const Overlay = {
  init() {
    this.ov = $('#overlay'); this.content = $('#overlay-content');
    $('#overlay-close').addEventListener('click', () => this.close());
    $('#overlay-bg').addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
  },
  open(html) { if (!this.ov) this.init(); this.content.innerHTML = html; this.ov.classList.add('open'); },
  close() { if (this.ov) this.ov.classList.remove('open'); }
};

// ============ Detail Views ============
function sec(title, body) {
  return `<div class="ov-section"><div class="ov-section-header">${title} <span>▼</span></div><div class="ov-section-body">${body}</div></div>`;
}
function row(l, v, cls) { return `<div class="ov-row"><span class="ol">${l}</span><span class="ov${cls ? ' ' + cls : ''}">${v}</span></div>`; }
function tag(t, c) { return `<span class="ov-tag ${c}">${t}</span>`; }

function viewIdentity() {
  const d = (p, def) => D(p, def);
  let h = sec('契约者档案',
    row('姓名', d('契约者.头部.姓名')) +
    row('等级', 'Lv.' + d('契约者.头部.等级')) +
    row('EXP', d('契约者.头部.EXP_当前') + ' / ' + d('契约者.头部.EXP_升级所需')) +
    row('阶位', d('契约者.头部.阶位')) +
    row('军衔', d('契约者.头部.军衔')) +
    row('RP', d('契约者.头部.RP_当前') + ' / ' + d('契约者.头部.RP_下一级')) +
    row('CR', d('契约者.头部.CR')) +
    row('回廊态度', d('契约者.头部.回廊态度'))
  );

  h += sec('属性',
    ['STR','AGI','CON','PER'].map(a => row(a, `基础${d('契约者.属性.基础.'+a)} + 加成${d('契约者.属性.加成.'+a)} = <b>${d('契约者.属性.实际.'+a)}</b>`)).join('') +
    row('未分配', d('契约者.属性.未分配属性点'), 'rust')
  );

  h += sec('衍生属性',
    row('HP', d('契约者.衍生属性.HP_当前') + ' / ' + d('契约者.衍生属性.HP_最大')) +
    row('MP', d('契约者.衍生属性.MP_当前') + ' / ' + d('契约者.衍生属性.MP_最大')) +
    row('耐力', d('契约者.衍生属性.耐力_当前') + ' / ' + d('契约者.衍生属性.耐力_最大')) +
    row('防御', d('契约者.衍生属性.防御')) +
    row('闪避', d('契约者.衍生属性.闪避值')) +
    row('负重', d('契约者.衍生属性.负重_当前') + ' / ' + d('契约者.衍生属性.负重_上限') + 'kg')
  );

  const talent = d('契约者.头部.天赋', {});
  const tName = getNested(talent, '名称', '');
  if (tName && tName !== '无') h += sec('天赋', row('名称', tName) + row('品质', getNested(talent, '品质', '')) + row('加成', getNested(talent, '属性加成', '')));

  const specStates = d('契约者.状态.特殊状态', {});
  Object.keys(specStates).forEach(k => { h += sec('状态: ' + k, '<div style="font-size:0.78rem;color:var(--chalk-dim);">' + specStates[k] + '</div>'); });

  return h;
}

function viewDungeon() {
  const d = (p, def) => D(p, def);
  const meta = d('契约者.当前副本元数据', {});
  let h = sec('副本元数据',
    row('名称', getNested(meta, '副本名称', '---')) +
    row('来源', getNested(meta, '副本来源', '---')) +
    row('类型', getNested(meta, '副本类型', '---')) +
    row('基准等级', 'Lv.' + getNested(meta, '基准等级', 1)) +
    row('时间限制', getNested(meta, '时间限制', '---'))
  );
  const sections = [['主线任务', '契约者.当前副本任务.主线任务'], ['支线任务', '契约者.当前副本任务.支线任务'], ['隐藏任务', '契约者.当前副本任务.隐藏任务'], ['世界事件', '契约者.当前副本任务.世界事件'], ['副本成就', '契约者.当前副本任务.副本成就']];
  sections.forEach(([t, p]) => {
    const data = d(p, {}); const keys = Object.keys(data);
    let body = keys.length === 0 ? '<div style="color:var(--chalk-dim);font-style:italic;">暂无</div>' : keys.map(k => row(k, getNested(data[k], '状态', '进行中'))).join('');
    h += sec(t + ' (' + keys.length + ')', body);
  });
  return h;
}

function viewEnemies() {
  const enemies = D('契约者.当前敌人', {});
  const keys = Object.keys(enemies);
  if (keys.length === 0) return '<div style="text-align:center;padding:48px;color:var(--chalk-dim);font-family:var(--font-display);letter-spacing:2px;">战场风平浪静</div>';
  let h = '';
  keys.forEach(k => {
    const en = enemies[k] || {};
    h += sec(k,
      row('等级', 'Lv.' + getNested(en, '头部.等级', '?')) +
      row('阶位', getNested(en, '头部.阶位', '?')) +
      row('CR', getNested(en, '头部.CR', '?')) +
      row('HP', getNested(en, '衍生属性.HP_当前', '?') + ' / ' + getNested(en, '衍生属性.HP_最大', '?'))
    );
  });
  return h;
}

function viewMap() {
  const facilities = [
    ['回廊广场', '按阶位划分的绝对安全区', true],
    ['排行榜石碑', '展示人黄玄地天五榜', true],
    ['回廊悬赏板', '接取定向悬赏任务', false],
    ['基础商店', '一阶白/蓝装备与基础消耗品', true],
    ['高级市场', '蓝/绿/金装备与技能卷轴', false],
    ['军衔商店', '根据军衔开放对应货架', true],
    ['回廊密库', '紫传职业书与天赋试炼券', false],
    ['医疗中心', '全HP治愈(30UP)', true],
    ['强化室', '装备强化与技能升级', true],
    ['职业馆', '基础与一转职业书', true],
    ['回廊铸造室', '蓝以上装备词条重铸', false],
    ['个人储藏室', '独立安全储物空间', true],
    ['世界调度室', '花费UP选择或回归副本', false]
  ];
  return sec('全区地图 (' + facilities.length + '处)',
    facilities.map(([n, d, u]) =>
      `<div class="ov-row" style="flex-direction:column;align-items:flex-start;padding:5px 0;"><div style="display:flex;justify-content:space-between;width:100%;"><span class="ol">${n}</span>${tag(u ? '已解锁' : '权限不足', u ? 'copper' : 'blood')}</div><div style="font-size:0.7rem;color:var(--chalk-dim);margin-top:2px;">${d}</div></div>`
    ).join('')
  );
}

function viewJobTree() {
  const tree = D('契约者.职业.转职树', null);
  if (!tree) return '<div style="text-align:center;padding:48px;color:var(--chalk-dim);">尚未加载职业树</div>';
  function render(d, name) {
    const s = getNested(d, '状态', '?');
    let c = 'iron'; if (s === '当前') c = 'rust'; else if (s === '已完成') c = 'copper';
    let h = `<div style="margin:4px 0;padding-left:16px;border-left:1px solid rgba(60,30,20,0.2);"><span style="font-weight:700;">${name}</span> ${tag(s, c)}`;
    const ch = getNested(d, '分支', {});
    Object.keys(ch).forEach(k => { h += render(ch[k], k); });
    h += '</div>'; return h;
  }
  return sec('转职路线', render(tree, getNested(tree, '名称', '根')));
}

function viewSquad() {
  const squad = D('契约者.小队.成员', {});
  const keys = Object.keys(squad);
  if (keys.length === 0) return '<div style="text-align:center;padding:48px;color:var(--chalk-dim);font-family:var(--font-display);">暂无队员</div>';
  let h = '';
  keys.forEach(k => {
    const m = squad[k] || {};
    h += sec(k,
      row('等级', 'Lv.' + getNested(m, '头部.等级', 1)) +
      row('阶位', getNested(m, '头部.阶位', '?')) +
      row('HP', getNested(m, '衍生属性.HP_当前', '?') + ' / ' + getNested(m, '衍生属性.HP_最大', '?')) +
      row('职业', getNested(m, '职业.名称', '无'))
    );
  });
  return h;
}

function viewBag() {
  const bag = D('契约者.背包', {});
  const keys = Object.keys(bag);
  if (keys.length === 0) return '<div style="text-align:center;padding:48px;color:var(--chalk-dim);">空空如也</div>';
  let h = sec('背包 (' + keys.length + '件)',
    keys.map(k => {
      const it = bag[k] || {};
      return `<div class="ov-row"><span class="ol">${k}</span><span class="ov">×${getNested(it, '数量', 1)} ${getNested(it, '品质', '') ? tag(getNested(it, '品质', ''), 'rust') : ''}</span></div>`;
    }).join('')
  );
  // Equipment
  const eq = D('契约者.装备', {});
  const slots = ['头部','躯干','腿部','手部','脚部','主手','副手','饰品1','饰品2'];
  h += sec('装备',
    slots.map(s => {
      const e = getNested(eq, s, {});
      const name = getNested(e, '名称', '无');
      return row(s, name === '无' ? '<span style="color:var(--chalk-dim)">---</span>' : name);
    }).join('')
  );
  return h;
}

// ============ Bindings ============
function bind() {
  // Doorway clicks
  const doorViews = {
    identity: viewIdentity, squad: viewSquad, jobtree: viewJobTree,
    dungeon: viewDungeon, enemies: viewEnemies, map: viewMap
  };
  $$('.doorway[data-view]').forEach(door => {
    door.addEventListener('click', function() {
      const v = this.dataset.view;
      if (doorViews[v]) Overlay.open(doorViews[v]());
    });
  });
  // Portal door → dungeon detail
  $('#portal-door').addEventListener('click', () => Overlay.open(viewDungeon()));
  // Floor items
  $('#bag-teaser').addEventListener('click', () => Overlay.open(viewBag()));
  // Radio teaser → radio mode
  $('#radio-teaser').addEventListener('click', () => {
    Overlay.open('<div style="text-align:center;padding:48px;"><div style="font-family:var(--font-display);font-size:1rem;letter-spacing:2px;color:var(--amber);margin-bottom:16px;">回廊通讯器</div><div style="color:var(--chalk-dim);font-style:italic;">沙沙……信号微弱……</div><div style="margin-top:16px;"><input id="radio-msg-input" placeholder="输入讯息…" style="width:80%;padding:10px;background:rgba(10,6,4,0.8);border:1px solid var(--iron-dark);color:var(--amber);font-family:var(--font-body);outline:none;"><button id="radio-msg-send" style="margin-left:8px;padding:10px 16px;background:var(--iron-dark);border:1px solid var(--iron);color:var(--amber);cursor:pointer;font-family:var(--font-display);letter-spacing:1px;">发送</button></div><div id="radio-msg-log" style="margin-top:16px;text-align:left;"></div></div>');
    setTimeout(() => {
      const input = $('#radio-msg-input');
      const log = $('#radio-msg-log');
      const send = $('#radio-msg-send');
      function doSend() {
        const txt = input.value.trim(); if (!txt) return;
        const u = document.createElement('div'); u.style.cssText = 'padding:6px 0;color:var(--chalk);text-align:right;'; u.textContent = '> ' + txt; log.appendChild(u);
        input.value = '';
        setTimeout(() => {
          const replies = ['收到。信号传达中……', '……回廊深处有回应。', '契约者，保持警惕。', '通讯日志已记录。'];
          const r = document.createElement('div'); r.style.cssText = 'padding:6px 0;color:var(--amber);'; r.textContent = replies[Math.floor(Math.random() * replies.length)]; log.appendChild(r);
        }, 600 + Math.random() * 700);
      }
      send.addEventListener('click', doSend);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
      input.focus();
    }, 100);
  });

  // Overlay collapse
  $('#overlay-content').addEventListener('click', function(e) {
    const hdr = e.target.closest('.ov-section-header');
    if (!hdr) return;
    const body = hdr.nextElementSibling;
    const arrow = hdr.querySelector('span');
    if (body) { body.classList.toggle('hidden'); if (arrow) arrow.textContent = body.classList.contains('hidden') ? '▶' : '▼'; }
  });

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
      const map = { '1': viewIdentity, '2': viewDungeon, '3': viewEnemies, '4': viewMap, '5': viewJobTree };
      if (map[e.key]) { e.preventDefault(); Overlay.open(map[e.key]()); }
    }
  });
}

// ============ Init ============
function init() {
  initEmbers();
  Overlay.init();
  populate();
  bind();
  console.log('%c◆ 无限回廊 v6.0%c — 你正站在长廊之中',
    'color:#c8a060;font-size:1.1em;', 'color:#706050;');
}

document.addEventListener('DOMContentLoaded', init);
