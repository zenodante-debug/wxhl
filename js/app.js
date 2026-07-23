/* ============================================================
   无限回廊 (Infinite Corridor) — Application Engine v3.0
   ============================================================ */

// ============ Utility Helpers ============
const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

function getNested(obj, path, def) {
  if (!obj || !path) return def;
  const keys = path.split('.');
  let cur = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return def;
    cur = cur[k];
  }
  return cur !== undefined ? cur : def;
}

function setNested(obj, path, val) {
  const keys = path.split('.');
  const last = keys.pop();
  let cur = obj;
  for (const k of keys) {
    if (!(k in cur) || typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[last] = val;
}

function unsetNested(obj, path) {
  const keys = path.split('.');
  const last = keys.pop();
  let cur = obj;
  for (const k of keys) {
    if (!(k in cur)) return;
    cur = cur[k];
  }
  delete cur[last];
}

function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ============ Toast Notification System ============
const Toast = {
  container: null,
  init() {
    this.container = $('#toast-container');
  },
  show(msg, type = 'info', duration = 3500) {
    if (!this.container) this.init();
    const icons = {
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b8b5c" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4753b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b2e2e" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4a35a" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-msg">${msg}</span>
      <button class="toast-close">&times;</button>
    `;
    el.querySelector('.toast-close').addEventListener('click', () => this.dismiss(el));
    this.container.appendChild(el);
    setTimeout(() => this.dismiss(el), duration);
  },
  dismiss(el) {
    if (el.classList.contains('removing')) return;
    el.classList.add('removing');
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
  }
};

// ============ Modal System ============
const Modal = {
  root: null,
  init() { this.root = $('#modal-root'); },
  open({ title, content, footer, onClose }) {
    if (!this.root) this.init();
    this.close(true);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="modal-close" aria-label="关闭">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">${content}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    `;

    const close = (instant) => {
      if (instant) { overlay.remove(); return; }
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 200);
      if (onClose) onClose();
    };

    modal.querySelector('.modal-close').addEventListener('click', () => close());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });

    overlay.appendChild(modal);
    this.root.appendChild(overlay);
    return { close, modal };
  },
  close(instant) {
    if (!this.root) this.init();
    const overlay = this.root.querySelector('.modal-overlay');
    if (!overlay) return;
    if (instant) { overlay.remove(); return; }
    overlay.classList.add('closing');
    setTimeout(() => overlay.remove(), 200);
  }
};

// ============ Ember Particle Background ============
function initEmbers() {
  const canvas = $('#starfield-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const COUNT = 100;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.0 + 0.4,
        speedY: -(Math.random() * 0.3 + 0.1),
        speedX: (Math.random() - 0.5) * 0.3,
        wobbleAmp: Math.random() * 0.5 + 0.2,
        wobbleSpeed: Math.random() * 0.02 + 0.005,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() < 0.7 ? 'ember' : 'gold',
        life: Math.random(),
        fadeRate: Math.random() * 0.003 + 0.001
      });
    }
  }
  createParticles();
  window.addEventListener('resize', createParticles);

  let frame = 0;
  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep warm vignette
    const grad = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.7, 0, canvas.width * 0.5, canvas.height * 0.7, canvas.height * 0.9);
    grad.addColorStop(0, 'rgba(30, 15, 8, 0.1)');
    grad.addColorStop(0.5, 'rgba(8, 7, 6, 0.3)');
    grad.addColorStop(1, 'rgba(8, 7, 6, 0.65)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(frame * p.wobbleSpeed) * p.wobbleAmp * 0.1;
      p.life -= p.fadeRate;

      // Reset particle when it fades out or goes off screen
      if (p.life <= 0 || p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
        p.x = Math.random() * canvas.width;
        p.y = canvas.height + Math.random() * 30;
        p.life = 1;
      }

      const alpha = p.opacity * Math.max(0, p.life);
      if (alpha <= 0.02) return;

      // Core glow
      ctx.beginPath();
      if (p.hue === 'ember') {
        ctx.fillStyle = `rgba(212, 117, 59, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(196, 163, 90, ${alpha})`;
      }
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow halo
      ctx.beginPath();
      if (p.hue === 'ember') {
        ctx.fillStyle = `rgba(200, 80, 30, ${alpha * 0.2})`;
      } else {
        ctx.fillStyle = `rgba(180, 140, 70, ${alpha * 0.2})`;
      }
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();
}

// ============ Game Data Store ============
const GameData = {
  stat_data: {
    '当前世界': '现实',
    '当前时间': {
      '现实日期': '2025年5月10日',
      '现实时间': '凌晨00:00',
      '副本日期': '不在副本中',
      '客观时间': '不在副本中',
      '地点': '回廊广场 · 一阶区',
      '阶段进度': '0%'
    },
    '契约者': {
      '头部': {
        '姓名': '未命名契约者',
        '等级': 3,
        'EXP_当前': 35,
        'EXP_升级所需': 150,
        '阶位': '一阶',
        '军衔': '上士',
        'RP_当前': 12,
        'RP_下一级': 15,
        'CR': 4.2,
        '回廊态度': '关注',
        '属性软上限': 25,
        '天赋': {
          '名称': '钢铁意志',
          '品质': '蓝色',
          '属性加成': '体力 +3',
          '效果': { '坚韧': '受到致命伤害时，有15%概率保留1点HP', '意志': '精神控制类效果抵抗+25%' }
        },
        '称号': { '名称': '初探深渊者', '效果': { '威压': '对一阶以下生物造成5%额外伤害' } }
      },
      '属性': {
        '基础': { 'STR': 8, 'AGI': 6, 'CON': 12, 'PER': 9 },
        '自定义加成': { 'STR': 0, 'AGI': 0, 'CON': 0, 'PER': 0 },
        '加成': { 'STR': 3, 'AGI': 0, 'CON': 6, 'PER': 0 },
        '实际': { 'STR': 11, 'AGI': 6, 'CON': 18, 'PER': 9 },
        '未分配属性点': 2
      },
      '衍生属性': {
        'HP_最大': 270, 'HP_当前': 218,
        'MP_最大': 90, 'MP_当前': 90,
        '耐力_最大': 180, '耐力_当前': 155,
        '防御': 12, '闪避值': 11, '移动距离': 6,
        '负重_上限': 55, '负重_当前': 18,
        'HP额外加成': 0, 'MP额外加成': 0,
        '防御额外加成': 0, '闪避额外加成': 0
      },
      '状态': {
        '生命状态': '受伤',
        '特殊状态': {
          '疲惫': '连续作战8小时，全属性判定-1（持续至下次休息）'
        }
      },
      '经济': { 'UP': 245 },
      '赛季信息': { '当前赛季': 21, '当前副本周期': 3 },
      '资格分': 45,
      '排行榜': { '当前排名': '未上榜', '排行榜被动': '无' },
      '职业': {
        '名称': '前线突击兵',
        '稀有度': '绿色',
        '转职阶段': '一转',
        '职业等级': 5,
        'PEXP_当前': 120,
        'PEXP_升级所需': 300,
        '主属性加成': { '属性': 'STR', '值': 3 },
        '副属性加成': { '属性': 'CON', '值': 3 },
        '职业特性': {
          '冲锋突击': { '效果': '每移动3m，伤害+2%' },
          '战场适应': { '效果': '受到范围伤害时自动进行一次CON判定，成功则减半' }
        },
        '职业技能': {
          '破甲突刺': {
            '名称': '破甲突刺', '分类': '银色技能', '类型': '物理',
            '阶位': '一阶', '等级': 3, '关联属性': 'STR',
            '行动类型': '攻击', '消耗': 'MP 15', '冷却': '2回合',
            '射程': '近战', '目标': '单体',
            '效果': { '伤害': '2d8 + STR + 职业等级×2', '破甲': '无视目标50%装备防御' }
          },
          '战术翻滚': {
            '名称': '战术翻滚', '分类': '普通技能', '类型': '身法',
            '阶位': '一阶', '等级': 2, '关联属性': 'AGI',
            '行动类型': '闪避', '消耗': '耐力 10', '冷却': '3回合',
            '射程': '自身', '目标': '自身',
            '效果': { '闪避提升': '本回合闪避+15', '位移': '向任意方向移动2m' }
          }
        },
        '传承技能': {
          '血战意志': { '等级': 1, '效果': 'HP低于30%时，伤害提升20%' }
        },
        '转职树': {
          '名称': '前线突击兵', '状态': '当前',
          '分支': {
            '重装先锋': {
              '状态': '未解锁',
              '分支': {
                '铁壁守护者': { '状态': '未选择', '分支': {} },
                '破阵重甲兵': { '状态': '未选择', '分支': {} }
              }
            },
            '轻装斥候': {
              '状态': '未解锁',
              '分支': {
                '暗影猎手': { '状态': '未选择', '分支': {} },
                '疾风游侠': { '状态': '未选择', '分支': {} }
              }
            }
          }
        }
      },
      '通用技能': {
        '急救包扎': {
          '名称': '急救包扎', '分类': '普通技能', '类型': '治疗',
          '阶位': '一阶', '等级': 2, '关联属性': 'PER',
          '行动类型': '治疗', '消耗': 'MP 10', '冷却': '5回合',
          '效果': { '恢复': '回复 2d6+PER 点HP，解除流血状态' }
        },
        '侦查之眼': {
          '名称': '侦查之眼', '分类': '高级技能', '类型': '感知',
          '阶位': '一阶', '等级': 1, '关联属性': 'PER',
          '行动类型': '侦查', '消耗': 'MP 5', '冷却': '无',
          '效果': { '探测': '感知周围30m范围内的隐藏目标', '判定': 'PER判定+3' }
        }
      },
      '装备': {
        '头部': { '名称': '战术头盔 MK-II', '类型': '头部防具', '品质': '蓝色', '阶位': '一阶', '强化等级': 2, '主属性': 'CON', '主属性加成': 2, '副属性': '无', '副属性加成': 0, '装备防御': 4, '装备闪避': 1, '负重': 3, '效果': '头部受到伤害-15%', '描述': '标准前线部队制式装备，提供可靠防护' },
        '躯干': { '名称': '突击兵战术背心', '类型': '躯干防具', '品质': '绿色', '阶位': '一阶', '强化等级': 3, '主属性': 'CON', '主属性加成': 1, '副属性': 'STR', '副属性加成': 1, '装备防御': 8, '装备闪避': 0, '负重': 8, '效果': '物理伤害减免5%', '描述': '' },
        '腿部': { '名称': '无', '类型': '无', '品质': '无', '阶位': '无', '强化等级': 0, '伤害骰': '无', '倍率': 0, '主属性': '无', '主属性加成': 0, '副属性': '无', '副属性加成': 0, '装备防御': 0, '装备闪避': 0, '负重': 0, '效果': '无', '描述': '无' },
        '手部': { '名称': '无', '类型': '无', '品质': '无', '阶位': '无', '强化等级': 0, '伤害骰': '无', '倍率': 0, '主属性': '无', '主属性加成': 0, '副属性': '无', '副属性加成': 0, '装备防御': 0, '装备闪避': 0, '负重': 0, '效果': '无', '描述': '无' },
        '脚部': { '名称': '突击靴', '类型': '脚部防具', '品质': '蓝色', '阶位': '一阶', '强化等级': 1, '主属性': 'AGI', '主属性加成': 0, '副属性': '无', '副属性加成': 0, '装备防御': 2, '装备闪避': 4, '负重': 2, '效果': '移动距离+1m', '描述': '轻量化设计，兼顾防护与机动力' },
        '主手': { '名称': '先锋突袭步枪', '类型': '突击步枪', '品质': '蓝色', '阶位': '一阶', '强化等级': 3, '伤害骰': '2d10', '倍率': 1, '主属性': 'STR', '主属性加成': 0, '副属性': '无', '副属性加成': 0, '装备防御': 0, '装备闪避': 0, '负重': 5, '效果': '暴击伤害+20%', '描述': '可靠的前线火力支援武器' },
        '副手': { '名称': '无', '类型': '无', '品质': '无', '阶位': '无', '强化等级': 0, '伤害骰': '无', '倍率': 0, '主属性': '无', '主属性加成': 0, '副属性': '无', '副属性加成': 0, '装备防御': 0, '装备闪避': 0, '负重': 0, '效果': '无', '描述': '无' },
        '饰品1': { '名称': '契约者铭牌', '类型': '饰品', '品质': '绿色', '阶位': '一阶', '强化等级': 0, '主属性': 'PER', '主属性加成': 0, '副属性': '无', '副属性加成': 0, '装备防御': 0, '装备闪避': 0, '负重': 0, '效果': '回廊声望+5%', '描述': '证明你作为契约者身份的信物' },
        '饰品2': { '名称': '无', '类型': '无', '品质': '无', '阶位': '无', '强化等级': 0, '伤害骰': '无', '倍率': 0, '主属性': '无', '主属性加成': 0, '副属性': '无', '副属性加成': 0, '装备防御': 0, '装备闪避': 0, '负重': 0, '效果': '无', '描述': '无' }
      },
      '背包': {
        '医疗包 (标准)': { '数量': 3, '品质': '白色', '类型': '消耗品', '效果': '使用后回复30HP', '描述': '基础战场医疗补给' },
        '肾上腺素注射器': { '数量': 1, '品质': '绿色', '类型': '消耗品', '效果': '使用后3回合内AGI+5，之后陷入疲惫', '描述': '紧急情况下的强化药剂' },
        '破片手雷': { '数量': 2, '品质': '白色', '类型': '投掷武器', '伤害骰': '4d6', '效果': '对3m半径内所有目标造成伤害', '描述': '标准军用破片手雷' },
        '猎人瞄准镜': { '数量': 1, '品质': '蓝色', '类型': '武器配件', '主属性': 'PER', '主属性加成': 2, '效果': '远程武器命中+10%', '描述': '可装配于主手武器，提升远程精度' }
      },
      '副本经历': {
        '新手试炼·废墟都市': { '评价等级': 'B', '简要说明': '首次进入回廊副本，在废墟中生存3天并击杀变异生物首领' },
        '血色黎明·古堡突围': { '评价等级': 'A', '简要说明': '与3名其他契约者合作，从吸血鬼古堡中突围，获得稀有血族遗物' }
      },
      '人际关系': {
        '「零」- 神秘少女': { '好感度': 45, '关系': '在第一个副本中偶遇的神秘NPC，身份不明，但多次在关键时刻提供帮助' },
        '王猛 - 重甲战士': { '好感度': 30, '关系': '同期契约者，性格直爽，曾在古堡副本中并肩作战' }
      },
      '小队': {
        '名称': '暂未命名小队',
        '成员': {}
      },
      '当前副本元数据': {
        '副本名称': '不在副本中',
        '副本来源': '---',
        '副本类型': '---',
        '基准等级': 1,
        '时间限制': '---'
      },
      '固有角色': {},
      '其他契约者名单': {},
      '当前副本任务': {
        '主线任务': {},
        '支线任务': {},
        '隐藏任务': {},
        '世界事件': {},
        '副本成就': {}
      },
      '当前敌人': {}
    }
  }
};

// ============ Core Engine ============
function getData(path, def) {
  return getNested(GameData.stat_data, path, def);
}

function setData(path, val) {
  setNested(GameData.stat_data, path, val);
}

// ============ Auto Level & Derived Stats ============
function recalcStats(basePath) {
  const entity = getNested(GameData.stat_data, basePath);
  if (!entity) return false;

  const rankStr = getNested(entity, '头部.阶位', '一阶');
  let maxLv = 20, softCap = 25;
  if (rankStr === '二阶') { maxLv = 40; softCap = 40; }
  else if (rankStr === '三阶') { maxLv = 60; softCap = 55; }
  else if (rankStr === '四阶') { maxLv = 80; softCap = 70; }
  else if (rankStr === '五阶') { maxLv = 100; softCap = 9999; }
  else if (rankStr === '超脱者' || rankStr === '五阶之上') { maxLv = 9999; softCap = 9999; }

  setNested(entity, '头部.属性软上限', softCap);

  let exp = Number(getNested(entity, '头部.EXP_当前', 0)) || 0;
  let reqExp = Number(getNested(entity, '头部.EXP_升级所需', 50)) || 50;
  let level = Number(getNested(entity, '头部.等级', 1)) || 1;
  let freePoints = Number(getNested(entity, '属性.未分配属性点', 0)) || 0;
  let changed = false;

  while (exp >= reqExp && reqExp > 0 && level < maxLv) {
    exp -= reqExp; level += 1; reqExp = 50 * level; freePoints += 1; changed = true;
  }
  if (level >= maxLv && exp > 0) { exp = 0; changed = true; }

  if (changed) {
    setNested(entity, '头部.EXP_当前', exp);
    setNested(entity, '头部.EXP_升级所需', reqExp);
    setNested(entity, '头部.等级', level);
    setNested(entity, '属性.未分配属性点', freePoints);
  }

  // Military rank (contractor only)
  if (basePath === '契约者') {
    let rp = Number(getNested(entity, '头部.RP_当前', 0)) || 0;
    let army = '列兵', nextRp = 5;
    if (rp >= 350) { army = '元帅'; nextRp = 9999; }
    else if (rp >= 200) { army = '中将'; nextRp = 350; }
    else if (rp >= 120) { army = '准将'; nextRp = 200; }
    else if (rp >= 70) { army = '上校'; nextRp = 120; }
    else if (rp >= 35) { army = '少校'; nextRp = 70; }
    else if (rp >= 15) { army = '少尉'; nextRp = 35; }
    else if (rp >= 5) { army = '上士'; nextRp = 15; }
    setNested(entity, '头部.军衔', army);
    setNested(entity, '头部.RP_下一级', nextRp);

    let cr = Number(getNested(entity, '头部.CR', 3.0)) || 3.0;
    let att = '观察';
    if (cr >= 10) att = '炼狱';
    else if (cr >= 9) att = '期待';
    else if (cr >= 7) att = '重视';
    else if (cr >= 5) att = '关注';
    else if (cr >= 3) att = '观察';
    else att = '漠视';
    setNested(entity, '头部.回廊态度', att);
  }

  // Equipment bonus
  let eqBonus = { STR: 0, AGI: 0, CON: 0, PER: 0 }, eqDef = 0, eqDodge = 0, eqWeight = 0;
  const slots = ['头部', '躯干', '腿部', '手部', '脚部', '主手', '副手', '饰品1', '饰品2'];
  slots.forEach(slot => {
    let eq = getNested(entity, '装备.' + slot, {});
    let mAttr = getNested(eq, '主属性', ''), mVal = Number(getNested(eq, '主属性加成', 0)) || 0;
    let sAttr = getNested(eq, '副属性', ''), sVal = Number(getNested(eq, '副属性加成', 0)) || 0;
    let eqEnchant = Number(getNested(eq, '强化等级', 0)) || 0;

    if (eqBonus[mAttr] !== undefined) eqBonus[mAttr] += mVal;
    if (eqBonus[sAttr] !== undefined) eqBonus[sAttr] += sVal;
    if (slot !== '主手' && slot !== '副手' && slot !== '饰品1' && slot !== '饰品2') eqDef += eqEnchant;
    eqDef += Number(getNested(eq, '装备防御', 0)) || 0;
    eqDodge += Number(getNested(eq, '装备闪避', 0)) || 0;
    eqWeight += Number(getNested(eq, '负重', 0)) || 0;
  });

  // Job bonus
  const jobMAttr = getNested(entity, '职业.主属性加成.属性', '');
  const jobMVal = Number(getNested(entity, '职业.主属性加成.值', 0)) || 0;
  const jobSAttr = getNested(entity, '职业.副属性加成.属性', '');
  const jobSVal = Number(getNested(entity, '职业.副属性加成.值', 0)) || 0;
  let jobBonus = { STR: 0, AGI: 0, CON: 0, PER: 0 };
  if (jobBonus[jobMAttr] !== undefined) jobBonus[jobMAttr] += jobMVal;
  if (jobBonus[jobSAttr] !== undefined) jobBonus[jobSAttr] += jobSVal;

  // Talent bonus (simple parse)
  const tBonusStr = String(getNested(entity, '头部.天赋.属性加成', ''));
  let tbVal = { STR: 0, AGI: 0, CON: 0, PER: 0 };
  const mAll = tBonusStr.match(/全属性\s*[+加]?\s*(\d+)/);
  if (mAll) { const v = parseInt(mAll[1]) || 0; tbVal.STR += v; tbVal.AGI += v; tbVal.CON += v; tbVal.PER += v; }
  const mStr = tBonusStr.match(/(?:力量|STR)\s*[+加]?\s*(\d+)/i); if (mStr) tbVal.STR += parseInt(mStr[1]) || 0;
  const mAgi = tBonusStr.match(/(?:敏捷|AGI)\s*[+加]?\s*(\d+)/i); if (mAgi) tbVal.AGI += parseInt(mAgi[1]) || 0;
  const mCon = tBonusStr.match(/(?:体力|CON)\s*[+加]?\s*(\d+)/i); if (mCon) tbVal.CON += parseInt(mCon[1]) || 0;
  const mPer = tBonusStr.match(/(?:感知|PER)\s*[+加]?\s*(\d+)/i); if (mPer) tbVal.PER += parseInt(mPer[1]) || 0;

  // Calculate actual stats
  ['STR', 'AGI', 'CON', 'PER'].forEach(attr => {
    let base = Number(getNested(entity, '属性.基础.' + attr, 5)) || 5;
    if (base > softCap) { base = softCap; setNested(entity, '属性.基础.' + attr, base); }
    const customBonus = Number(getNested(entity, '属性.自定义加成.' + attr, 0)) || 0;
    const finalBonus = eqBonus[attr] + jobBonus[attr] + tbVal[attr] + customBonus;
    setNested(entity, '属性.加成.' + attr, finalBonus);
    setNested(entity, '属性.实际.' + attr, base + finalBonus);
  });

  const aCon = Number(getNested(entity, '属性.实际.CON', 5)) || 5;
  const aPer = Number(getNested(entity, '属性.实际.PER', 5)) || 5;
  const aAgi = Number(getNested(entity, '属性.实际.AGI', 5)) || 5;
  const aStr = Number(getNested(entity, '属性.实际.STR', 5)) || 5;

  const hpMax = aCon * 15 + (Number(getNested(entity, '衍生属性.HP额外加成', 0)) || 0);
  const mpMax = aPer * 10 + (Number(getNested(entity, '衍生属性.MP额外加成', 0)) || 0);
  const spMax = aCon * 10;
  setNested(entity, '衍生属性.HP_最大', hpMax);
  setNested(entity, '衍生属性.MP_最大', mpMax);
  setNested(entity, '衍生属性.耐力_最大', spMax);

  const def = Math.round(aCon * 0.5) + (Number(getNested(entity, '衍生属性.防御额外加成', 0)) || 0) + eqDef;
  const dodge = 10 + (aAgi - 5) + (Number(getNested(entity, '衍生属性.闪避额外加成', 0)) || 0) + eqDodge;
  const move = 5 + (aAgi - 5);
  const maxLoad = aStr * 5;
  setNested(entity, '衍生属性.防御', def);
  setNested(entity, '衍生属性.闪避值', dodge);
  setNested(entity, '衍生属性.移动距离', move);
  setNested(entity, '衍生属性.负重_上限', maxLoad);
  setNested(entity, '衍生属性.负重_当前', eqWeight);

  // Clamp current HP/MP/SP
  let hpc = Number(getNested(entity, '衍生属性.HP_当前', 0)) || 0;
  let mpc = Number(getNested(entity, '衍生属性.MP_当前', 0)) || 0;
  let spc = Number(getNested(entity, '衍生属性.耐力_当前', 0)) || 0;
  if (hpc > hpMax) setNested(entity, '衍生属性.HP_当前', hpMax);
  if (mpc > mpMax) setNested(entity, '衍生属性.MP_当前', mpMax);
  if (spc > spMax) setNested(entity, '衍生属性.耐力_当前', spMax);

  // Life state
  const finalHpc = Number(getNested(entity, '衍生属性.HP_当前', 0)) || 0;
  const ratio = finalHpc / Math.max(hpMax, 1);
  let lifeState = '健康';
  if (finalHpc <= 0) lifeState = '濒死';
  else if (ratio <= 0.3) lifeState = '重伤';
  else if (ratio <= 0.7) lifeState = '受伤';
  setNested(entity, '状态.生命状态', lifeState);

  return changed;
}

// ============ Editable Field Helpers ============
function editSpan(val, path) {
  return `<span class="editable-num" data-path="${path}" data-val="${val}" title="点击修改数值">${val}</span>`;
}

function editText(val, path) {
  const escaped = String(val).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<span class="editable-text" contenteditable="true" spellcheck="false" data-path="${path}" data-val="${escaped}" title="点击编辑文本">${escaped}</span>`;
}

function formatAttrDetail(base, bonus, customBonus, basePath, customPath) {
  return `基础 ${editSpan(base, basePath)} | 手动 ${editSpan(customBonus, customPath)} | 总加成 ${bonus >= 0 ? '+' : ''}${bonus}`;
}

// ============ Skill Renderer ============
function renderSkillsHtml(skills, pathPrefix) {
  const keys = Object.keys(skills || {});
  if (keys.length === 0) return '<div class="empty-state">无或未知</div>';

  let h = '';
  keys.forEach(k => {
    const s = skills[k] || {};
    const baseP = pathPrefix ? `${pathPrefix}.${k}` : '';
    const name = getNested(s, '名称', '') || k;
    const cat = getNested(s, '分类', '');
    const type = getNested(s, '类型', '');
    const rank = getNested(s, '阶位', '');
    const lv = getNested(s, '等级', '');

    let catClass = 'tag-gray';
    if (cat.includes('银色')) catClass = 'tag-purple';
    else if (cat.includes('高级')) catClass = 'tag-orange';
    else if (cat.includes('传承')) catClass = 'tag-gold';

    h += `<div class="skill-row">`;
    h += `<span class="skill-name">${editText(name, baseP + '.名称')}</span>`;
    h += `<div class="skill-meta">`;
    if (lv !== '' && lv !== '无' && lv !== undefined) h += `<span style="color:var(--text-secondary);font-size:0.75rem;">Lv.${editSpan(lv, baseP + '.等级')}</span>`;
    if (cat && cat !== '无') h += `<span class="tag ${catClass}">${editText(cat, baseP + '.分类')}</span>`;
    if (type && type !== '无') h += `<span class="tag tag-blue">${editText(type, baseP + '.类型')}</span>`;
    if (rank && rank !== '无') h += `<span class="tag tag-green">${editText(rank, baseP + '.阶位')}</span>`;
    h += `</div>`;

    const details = [];
    const aAttr = getNested(s, '关联属性', ''); if (aAttr && aAttr !== '无') details.push(`判定: ${editText(aAttr, baseP + '.关联属性')}`);
    const aAct = getNested(s, '行动类型', ''); if (aAct && aAct !== '无') details.push(`行动: ${editText(aAct, baseP + '.行动类型')}`);
    const aCost = getNested(s, '消耗', ''); if (aCost && aCost !== '无') details.push(`消耗: ${editText(aCost, baseP + '.消耗')}`);
    const aCd = getNested(s, '冷却', ''); if (aCd && aCd !== '无') details.push(`冷却: ${editText(aCd, baseP + '.冷却')}`);
    const aRng = getNested(s, '射程', ''); if (aRng && aRng !== '无' && aRng !== '自身') details.push(`射程: ${editText(aRng, baseP + '.射程')}`);
    if (details.length > 0) h += `<div class="skill-detail">${details.join(' | ')}</div>`;

    const eff = getNested(s, '效果', {});
    if (typeof eff === 'string') {
      if (eff && eff !== '无') h += `<div class="skill-detail">${editText(eff, baseP + '.效果')}</div>`;
    } else {
      const effKeys = Object.keys(eff || {});
      if (effKeys.length > 0) {
        h += `<div class="skill-detail">`;
        effKeys.forEach(ek => {
          h += `<div><span style="color:var(--soul);font-weight:600;">${ek}</span>: ${editText(eff[ek], baseP + '.效果.' + ek)}</div>`;
        });
        h += `</div>`;
      }
    }
    h += `</div>`;
  });
  return h;
}

// ============ Equipment Renderer ============
function renderEquipHtml(equipData, pathPrefix, targetPath) {
  const slots = ['头部', '躯干', '腿部', '手部', '脚部', '主手', '副手', '饰品1', '饰品2'];
  let h = '';
  slots.forEach(slot => {
    const eq = getNested(equipData, slot, {}) || {};
    const bp = pathPrefix ? `${pathPrefix}.${slot}` : '';
    const name = getNested(eq, '名称', '无');
    const quality = getNested(eq, '品质', '');
    const rank = getNested(eq, '阶位', '');
    const enhance = getNested(eq, '强化等级', 0);
    const eff = getNested(eq, '效果', '');
    const desc = getNested(eq, '描述', '');
    const type = getNested(eq, '类型', '');
    const dice = getNested(eq, '伤害骰', '无');
    const mult = getNested(eq, '倍率', 0);
    const mainAttr = getNested(eq, '主属性', '无');
    const mainBonus = getNested(eq, '主属性加成', 0);
    const subAttr = getNested(eq, '副属性', '无');
    const subBonus = getNested(eq, '副属性加成', 0);
    const def = getNested(eq, '装备防御', 0);
    const dodge = getNested(eq, '装备闪避', 0);
    const weight = getNested(eq, '负重', 0);

    let tagClass = 'tag-gray';
    if (quality === '金色') tagClass = 'tag-gold';
    else if (quality === '蓝色') tagClass = 'tag-blue';
    else if (quality === '绿色') tagClass = 'tag-green';
    else if (quality === '银色' || quality === '紫色') tagClass = 'tag-purple';

    h += `<div class="equip-slot">`;
    h += `<div class="equip-slot-header">`;
    h += `<span class="equip-slot-label">${slot}</span>`;

    if (name === '无' || name === '') {
      h += `<span class="equip-slot-name equip-slot-empty">---</span></div>`;
    } else {
      h += `<span class="equip-slot-name">${editText(name, bp + '.名称')}</span>`;
      h += `<button class="btn-unequip" data-slot="${slot}" data-targetpath="${targetPath}">脱下</button></div>`;

      const stats = [];
      if (type !== '无' && type !== '') stats.push(editText(type, bp + '.类型'));
      if (dice !== '无' && dice !== '') stats.push(`伤害: ${editText(dice, bp + '.伤害骰')}${mult ? '(×' + editSpan(mult, bp + '.倍率') + ')' : ''}`);
      if (def !== 0 || dodge !== 0) stats.push(`防: ${editSpan(def, bp + '.装备防御')} 闪: ${editSpan(dodge, bp + '.装备闪避')}`);
      const attrArr = [];
      if (mainAttr !== '无' && mainAttr !== '') attrArr.push(`${editText(mainAttr, bp + '.主属性')}+${editSpan(mainBonus, bp + '.主属性加成')}`);
      if (subAttr !== '无' && subAttr !== '') attrArr.push(`${editText(subAttr, bp + '.副属性')}+${editSpan(subBonus, bp + '.副属性加成')}`);
      if (attrArr.length > 0) stats.push(attrArr.join(' '));
      if (weight > 0) stats.push(`${editSpan(weight, bp + '.负重')}kg`);

      h += `<div class="equip-slot-stats">`;
      if (quality !== '无' && quality !== '') h += `<span class="tag ${tagClass}">${editText(quality, bp + '.品质')} ${rank ? editText(rank, bp + '.阶位') : ''}${enhance ? ' +' + editSpan(enhance, bp + '.强化等级') : ''}</span>`;
      if (stats.length > 0) h += `<span>${stats.join(' | ')}</span>`;
      h += `</div>`;

      if (eff !== '无' && eff !== '') h += `<div style="padding-left:44px;font-size:0.82rem;color:var(--text-body);margin-top:2px;">${editText(eff, bp + '.效果')}</div>`;
      if (desc !== '无' && desc !== '') h += `<div style="padding-left:44px;font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">${editText(desc, bp + '.描述')}</div>`;
    }
    h += `</div>`;
  });
  return h;
}

// ============ Entity Card Renderer ============
function renderEntityCard(name, m, mode) {
  const targetPath = (mode === 'enemy') ? `契约者.当前敌人.${name}` : `契约者.小队.成员.${name}`;
  const head = getNested(m, '头部', {});
  const lv = getNested(head, '等级', 1);
  const rank = getNested(head, '阶位', '');
  const army = getNested(head, '军衔', '');
  const cr = getNested(head, 'CR', 3.0);
  const expCur = getNested(head, 'EXP_当前', 0);
  const expMax = getNested(head, 'EXP_升级所需', 50);
  const talent = getNested(head, '天赋', {});
  const title = getNested(head, '称号', {});

  const strActual = getNested(m, '属性.实际.STR', 5), strBase = getNested(m, '属性.基础.STR', 5), strBonus = getNested(m, '属性.加成.STR', 0), strCustom = getNested(m, '属性.自定义加成.STR', 0);
  const agiActual = getNested(m, '属性.实际.AGI', 5), agiBase = getNested(m, '属性.基础.AGI', 5), agiBonus = getNested(m, '属性.加成.AGI', 0), agiCustom = getNested(m, '属性.自定义加成.AGI', 0);
  const conActual = getNested(m, '属性.实际.CON', 5), conBase = getNested(m, '属性.基础.CON', 5), conBonus = getNested(m, '属性.加成.CON', 0), conCustom = getNested(m, '属性.自定义加成.CON', 0);
  const perActual = getNested(m, '属性.实际.PER', 5), perBase = getNested(m, '属性.基础.PER', 5), perBonus = getNested(m, '属性.加成.PER', 0), perCustom = getNested(m, '属性.自定义加成.PER', 0);
  const freePts = getNested(m, '属性.未分配属性点', 0);

  const der = getNested(m, '衍生属性', {});
  const hpMax = getNested(der, 'HP_最大', 0), mpMax = getNested(der, 'MP_最大', 0), spMax = getNested(der, '耐力_最大', 0);
  const hpCur = getNested(der, 'HP_当前', 0), mpCur = getNested(der, 'MP_当前', 0), spCur = getNested(der, '耐力_当前', 0);
  const defVal = getNested(der, '防御', 0), dodgeVal = getNested(der, '闪避值', 0), moveVal = getNested(der, '移动距离', 0), loadCur = getNested(der, '负重_当前', 0), loadMax = getNested(der, '负重_上限', 0);

  const job = getNested(m, '职业', {});
  const jobName = getNested(job, '名称', '');
  const state = getNested(m, '状态', {});
  const lifeState = getNested(state, '生命状态', '健康');
  const stateColors = { '健康': 'tag-green', '受伤': 'tag-orange', '重伤': 'tag-red', '濒死': 'tag-red' };

  const hpPct = Math.min(hpCur / Math.max(hpMax, 1) * 100, 100);
  const mpPct = Math.min(mpCur / Math.max(mpMax, 1) * 100, 100);
  const spPct = Math.min(spCur / Math.max(spMax, 1) * 100, 100);
  const expPct = Math.min(expCur / Math.max(expMax, 1) * 100, 100);
  const isEnemy = (mode === 'enemy');
  const cardClass = isEnemy ? 'enemy' : 'mate';

  let h = `<div class="entity-card ${cardClass}" data-path="${targetPath}">`;
  h += `<div class="entity-header">`;
  h += `<div class="entity-summary">`;
  h += `<span class="entity-name">${name}</span>`;
  h += `<span class="entity-level">Lv.${lv}</span>`;
  if (jobName && jobName !== '无') h += `<span class="tag tag-purple">${jobName}</span>`;
  h += `<span class="tag ${stateColors[lifeState] || 'tag-gray'}">${lifeState}</span>`;
  h += `</div>`;
  h += `<svg class="panel-chevron collapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;
  h += `</div>`;
  h += `<div class="entity-body collapsed">`;

  // Basic info
  h += `<div class="stat-row"><span class="stat-label">等级</span><span class="stat-value">Lv.${editSpan(lv, targetPath + '.头部.等级')}</span></div>`;
  if (!isEnemy) {
    h += `<div class="stat-row"><span class="stat-label">EXP</span><span class="stat-value dim">${editSpan(expCur, targetPath + '.头部.EXP_当前')} / ${editSpan(expMax, targetPath + '.头部.EXP_升级所需')}</span></div>`;
    h += `<div class="progress-bar"><div class="progress-fill progress-exp" style="width:${expPct}%"></div></div>`;
  }
  if (rank) h += `<div class="stat-row"><span class="stat-label">阶位</span><span class="stat-value accent">${editText(rank, targetPath + '.头部.阶位')}</span></div>`;
  if (army && !isEnemy) h += `<div class="stat-row"><span class="stat-label">军衔</span><span class="stat-value dim">${editText(army, targetPath + '.头部.军衔')}</span></div>`;
  if (cr) h += `<div class="stat-row"><span class="stat-label">CR</span><span class="stat-value">${editSpan(cr, targetPath + '.头部.CR')}</span></div>`;

  // Talent
  const tName = getNested(talent, '名称', '');
  if (tName && tName !== '无') {
    h += `<div class="sub-section"><div class="sub-title">天赋</div>`;
    h += `<div class="stat-row"><span class="stat-label">名称</span><span class="stat-value accent">${editText(tName, targetPath + '.头部.天赋.名称')}</span></div>`;
    const tQual = getNested(talent, '品质', '');
    if (tQual) h += `<div class="stat-row"><span class="stat-label">品质</span><span class="stat-value dim">${editText(tQual, targetPath + '.头部.天赋.品质')}</span></div>`;
    h += `</div>`;
  }

  // Attributes (collapsible)
  h += `<div class="sub-section" style="margin-top:8px;"><div class="sub-title" style="cursor:pointer;" data-toggle="attr-${name}">属性 ▼</div>`;
  h += `<div id="attr-${name}" style="display:none;">`;
  h += `<div class="stat-row"><span class="stat-label">STR 力量</span><span class="stat-value">${strActual}</span></div><div style="font-size:0.7rem;color:var(--text-dim);text-align:right;">${formatAttrDetail(strBase, strBonus, strCustom, targetPath + '.属性.基础.STR', targetPath + '.属性.自定义加成.STR')}</div>`;
  h += `<div class="stat-row"><span class="stat-label">AGI 敏捷</span><span class="stat-value">${agiActual}</span></div><div style="font-size:0.7rem;color:var(--text-dim);text-align:right;">${formatAttrDetail(agiBase, agiBonus, agiCustom, targetPath + '.属性.基础.AGI', targetPath + '.属性.自定义加成.AGI')}</div>`;
  h += `<div class="stat-row"><span class="stat-label">CON 体力</span><span class="stat-value">${conActual}</span></div><div style="font-size:0.7rem;color:var(--text-dim);text-align:right;">${formatAttrDetail(conBase, conBonus, conCustom, targetPath + '.属性.基础.CON', targetPath + '.属性.自定义加成.CON')}</div>`;
  h += `<div class="stat-row"><span class="stat-label">PER 感知</span><span class="stat-value">${perActual}</span></div><div style="font-size:0.7rem;color:var(--text-dim);text-align:right;">${formatAttrDetail(perBase, perBonus, perCustom, targetPath + '.属性.基础.PER', targetPath + '.属性.自定义加成.PER')}</div>`;
  if (!isEnemy) h += `<div class="stat-row"><span class="stat-label">未分配点数</span><span class="stat-value warn">${editSpan(freePts, targetPath + '.属性.未分配属性点')}</span></div>`;
  h += `</div></div>`;

  // Derived stats
  h += `<div class="sub-section"><div class="sub-title">衍生属性</div>`;
  h += `<div class="stat-row"><span class="stat-label">HP</span><span class="stat-value">${editSpan(hpCur, targetPath + '.衍生属性.HP_当前')} / ${hpMax}</span></div><div class="progress-bar"><div class="progress-fill progress-hp" style="width:${hpPct}%"></div></div>`;
  h += `<div class="stat-row"><span class="stat-label">MP</span><span class="stat-value accent">${editSpan(mpCur, targetPath + '.衍生属性.MP_当前')} / ${mpMax}</span></div><div class="progress-bar"><div class="progress-fill progress-mp" style="width:${mpPct}%"></div></div>`;
  h += `<div class="stat-row"><span class="stat-label">耐力</span><span class="stat-value warn">${editSpan(spCur, targetPath + '.衍生属性.耐力_当前')} / ${spMax}</span></div><div class="progress-bar"><div class="progress-fill progress-sp" style="width:${spPct}%"></div></div>`;
  h += `<div class="stat-grid-2"><div class="stat-row"><span class="stat-label">防御</span><span class="stat-value dim">${defVal}</span></div><div class="stat-row"><span class="stat-label">闪避</span><span class="stat-value dim">${dodgeVal}</span></div>`;
  h += `<div class="stat-row"><span class="stat-label">移距</span><span class="stat-value dim">${moveVal}m</span></div>`;
  if (!isEnemy) h += `<div class="stat-row"><span class="stat-label">负重</span><span class="stat-value dim">${loadCur} / ${loadMax}kg</span></div>`;
  h += `</div></div>`;

  // Job skills
  if (jobName && jobName !== '无') {
    h += `<div class="sub-section"><div class="sub-title">职业技能</div>`;
    h += renderSkillsHtml(getNested(job, '职业技能', {}), targetPath + '.职业.职业技能');
    h += `</div>`;
  }

  h += `</div></div>`;
  return h;
}

// ============ Job Tree Renderer ============
function renderTreeNode(nodeData, nodeName) {
  const status = getNested(nodeData, '状态', '未选择');
  let statusClass = 'node-locked';
  if (status === '已完成') statusClass = 'node-completed';
  else if (status === '当前') statusClass = 'node-current';
  else if (status === '已放弃' || status === '跳过') statusClass = 'node-skipped';

  let html = `<li>`;
  html += `<div class="tree-node ${statusClass}"><span class="node-name">${nodeName}</span><span class="node-status">${status}</span></div>`;

  const children = getNested(nodeData, '分支', {});
  const childKeys = Object.keys(children);
  if (childKeys.length > 0) {
    html += `<ul>`;
    childKeys.forEach(k => { html += renderTreeNode(children[k], k); });
    html += `</ul>`;
  }
  html += `</li>`;
  return html;
}

// ============ Main Populate Function ============
function populateAll() {
  recalcStats('契约者');
  const squad = getData('契约者.小队.成员', {});
  Object.keys(squad).forEach(k => recalcStats(`契约者.小队.成员.${k}`));
  const enemies = getData('契约者.当前敌人', {});
  Object.keys(enemies).forEach(k => recalcStats(`契约者.当前敌人.${k}`));

  const d = (path, def) => getData(path, def);

  // === Environment ===
  setText('env-world', d('当前世界', '现实'));
  setText('env-real-date', d('当前时间.现实日期', '---'));
  setText('env-real-time', d('当前时间.现实时间', '---'));
  setText('env-dungeon-date', d('当前时间.副本日期', '不在副本中'));
  setText('env-obj-time', d('当前时间.客观时间', '不在副本中'));
  setText('env-loc', d('当前时间.地点', '未知'));
  setText('env-prog', d('当前时间.阶段进度', '0%'));

  // === Character Basic ===
  setHtml('h-name', editText(d('契约者.头部.姓名', '---'), '契约者.头部.姓名'));
  setHtml('h-lv', `Lv.${editSpan(d('契约者.头部.等级', 1), '契约者.头部.等级')}`);
  setHtml('h-exp', `${editSpan(d('契约者.头部.EXP_当前', 0), '契约者.头部.EXP_当前')} / ${editSpan(d('契约者.头部.EXP_升级所需', 50), '契约者.头部.EXP_升级所需')}`);
  setHtml('h-rank', editText(d('契约者.头部.阶位', '一阶'), '契约者.头部.阶位'));
  setText('h-army', d('契约者.头部.军衔', '列兵'));
  setHtml('h-rp', `${editSpan(d('契约者.头部.RP_当前', 0), '契约者.头部.RP_当前')} / ${d('契约者.头部.RP_下一级', 5)}`);
  setHtml('h-cr', editSpan(d('契约者.头部.CR', 3.0), '契约者.头部.CR'));
  setText('h-att', d('契约者.头部.回廊态度', '观察'));

  const barExp = Math.min(d('契约者.头部.EXP_当前', 0) / Math.max(d('契约者.头部.EXP_升级所需', 50), 1) * 100, 100);
  setStyle('bar-exp', 'width', barExp + '%');

  // Talent
  const talent = d('契约者.头部.天赋', {});
  const tName = getNested(talent, '名称', '');
  if (tName && tName !== '无' && tName !== '') {
    setHtml('h-talent-name', editText(tName, '契约者.头部.天赋.名称'));
    $('#h-talent-name').classList.remove('none');
    setHtml('h-talent-quality', editText(getNested(talent, '品质', ''), '契约者.头部.天赋.品质'));
    setHtml('h-talent-bonus', editText(getNested(talent, '属性加成', ''), '契约者.头部.天赋.属性加成'));
    const tEffs = getNested(talent, '效果', {});
    let teHtml = '';
    if (typeof tEffs === 'string' && tEffs && tEffs !== '无') {
      teHtml = `<div style="font-size:0.82rem;color:var(--text-body);line-height:1.5;">${editText(tEffs, '契约者.头部.天赋.效果')}</div>`;
    } else {
      Object.keys(tEffs || {}).forEach(k => {
        teHtml += `<div style="font-size:0.82rem;padding:2px 0;"><span style="color:var(--soul);font-weight:600;">${k}</span>: ${editText(tEffs[k], '契约者.头部.天赋.效果.' + k)}</div>`;
      });
    }
    setHtml('h-talent-effects', teHtml);
  } else {
    setHtml('h-talent-name', '无');
    $('#h-talent-name').classList.add('none');
  }

  // Title
  const title = d('契约者.头部.称号', {});
  const tiName = getNested(title, '名称', '');
  if (tiName && tiName !== '无' && tiName !== '') {
    setHtml('h-title-name', editText(tiName, '契约者.头部.称号.名称'));
    $('#h-title-name').classList.remove('none');
    const tiEffs = getNested(title, '效果', {});
    let tiHtml = '';
    if (typeof tiEffs === 'string' && tiEffs && tiEffs !== '无') {
      tiHtml = `<div style="font-size:0.82rem;color:var(--text-body);line-height:1.5;">${editText(tiEffs, '契约者.头部.称号.效果')}</div>`;
    } else {
      Object.keys(tiEffs || {}).forEach(k => {
        tiHtml += `<div style="font-size:0.82rem;padding:2px 0;"><span style="color:var(--soul);font-weight:600;">${k}</span>: ${editText(tiEffs[k], '契约者.头部.称号.效果.' + k)}</div>`;
      });
    }
    setHtml('h-title-effects', tiHtml);
  } else {
    setHtml('h-title-name', '无');
    $('#h-title-name').classList.add('none');
  }

  // === Attributes ===
  const softCap = d('契约者.头部.属性软上限', 25);
  ['STR', 'AGI', 'CON', 'PER'].forEach((attr, i) => {
    const names = ['str', 'agi', 'con', 'per'];
    const actual = d(`契约者.属性.实际.${attr}`, 5);
    const base = d(`契约者.属性.基础.${attr}`, 5);
    const bonus = d(`契约者.属性.加成.${attr}`, 0);
    const custom = d(`契约者.属性.自定义加成.${attr}`, 0);
    const name = names[i];
    setHtml(`attr-${name}`, `${actual} <span style="font-size:0.73rem;color:var(--text-dim);">/ 软上限${softCap}</span>`);
    setHtml(`attr-${name}-detail`, formatAttrDetail(base, bonus, custom, `契约者.属性.基础.${attr}`, `契约者.属性.自定义加成.${attr}`));
  });
  const free = d('契约者.属性.未分配属性点', 0);
  setHtml('attr-free', editSpan(free, '契约者.属性.未分配属性点'));

  // Derived
  const hpMax = d('契约者.衍生属性.HP_最大', 0), hpCur = d('契约者.衍生属性.HP_当前', 0);
  const mpMax = d('契约者.衍生属性.MP_最大', 0), mpCur = d('契约者.衍生属性.MP_当前', 0);
  const spMax = d('契约者.衍生属性.耐力_最大', 0), spCur = d('契约者.衍生属性.耐力_当前', 0);
  const defVal = d('契约者.衍生属性.防御', 0), dodgeVal = d('契约者.衍生属性.闪避值', 0);
  const moveVal = d('契约者.衍生属性.移动距离', 0), loadCur = d('契约者.衍生属性.负重_当前', 0), loadMax = d('契约者.衍生属性.负重_上限', 0);

  setHtml('der-hp', `${editSpan(hpCur, '契约者.衍生属性.HP_当前')} / ${hpMax}`);
  setHtml('der-mp', `${editSpan(mpCur, '契约者.衍生属性.MP_当前')} / ${mpMax}`);
  setHtml('der-sp', `${editSpan(spCur, '契约者.衍生属性.耐力_当前')} / ${spMax}`);
  setText('der-def', defVal);
  setText('der-dodge', dodgeVal);
  setText('der-move', moveVal + 'm');
  setText('der-load', loadCur + ' / ' + loadMax + 'kg');

  const hpPct = Math.min(hpCur / Math.max(hpMax, 1) * 100, 100);
  const mpPct = Math.min(mpCur / Math.max(mpMax, 1) * 100, 100);
  const spPct = Math.min(spCur / Math.max(spMax, 1) * 100, 100);
  setStyle('bar-hp', 'width', hpPct + '%');
  setStyle('bar-mp', 'width', mpPct + '%');
  setStyle('bar-sp', 'width', spPct + '%');

  // Life state
  const lifeState = d('契约者.状态.生命状态', '健康');
  const stateColors = { '健康': 'tag-green', '受伤': 'tag-orange', '重伤': 'tag-red', '濒死': 'tag-red tag-pulse' };
  const stateEl = $('#state-life');
  if (stateEl) { stateEl.textContent = lifeState; stateEl.className = 'tag ' + (stateColors[lifeState] || 'tag-gray'); }
  setHtml('eco-up', editSpan(d('契约者.经济.UP', 0), '契约者.经济.UP'));

  // Season
  setText('season-num', d('契约者.赛季信息.当前赛季', 21));
  setText('season-cycle', d('契约者.赛季信息.当前副本周期', 0) + ' / 10');
  const cyclePct = d('契约者.赛季信息.当前副本周期', 0) / 10 * 100;
  setStyle('bar-cycle', 'width', Math.min(cyclePct, 100) + '%');
  setHtml('qual-points', editSpan(d('契约者.资格分', 0), '契约者.资格分'));

  // Rank
  const rankVal = d('契约者.排行榜.当前排名', '未上榜');
  const rankEl = $('#rank-pos');
  if (rankVal === '未上榜') { rankEl.textContent = '未上榜'; rankEl.className = 'stat-value none'; }
  else { rankEl.textContent = '第' + rankVal + '名'; rankEl.className = 'stat-value accent'; }

  // Special states
  const specStates = d('契约者.状态.特殊状态', {});
  const ssKeys = Object.keys(specStates);
  let ssHtml = '';
  if (ssKeys.length === 0) ssHtml = '<span class="empty-state">无异常状态</span>';
  else ssKeys.forEach(k => { ssHtml += `<div style="padding:4px 0;"><span class="tag tag-red">${k}</span> <span style="font-size:0.82rem;color:var(--text-body);">${editText(specStates[k] || '', '契约者.状态.特殊状态.' + k)}</span></div>`; });
  setHtml('state-special', ssHtml);

  // === Job ===
  const job = d('契约者.职业', {});
  const jobName = getNested(job, '名称', '');
  if (jobName && jobName !== '无') {
    setHtml('job-name', editText(jobName, '契约者.职业.名称'));
    $('#job-name').classList.remove('none');
    setHtml('job-quality', editText(getNested(job, '稀有度', ''), '契约者.职业.稀有度'));
    setHtml('job-stage', editText(getNested(job, '转职阶段', ''), '契约者.职业.转职阶段'));
    setHtml('job-lv', 'Lv.' + editSpan(getNested(job, '职业等级', 0), '契约者.职业.职业等级'));
    setHtml('job-pexp', `${editSpan(getNested(job, 'PEXP_当前', 0), '契约者.职业.PEXP_当前')} / ${editSpan(getNested(job, 'PEXP_升级所需', 0), '契约者.职业.PEXP_升级所需')}`);
    const mainB = getNested(job, '主属性加成', {});
    setHtml('job-main-bonus', `${editText(getNested(mainB, '属性', '无'), '契约者.职业.主属性加成.属性')} +${editSpan(getNested(mainB, '值', 0), '契约者.职业.主属性加成.值')}`);
    const subB = getNested(job, '副属性加成', {});
    setHtml('job-sub-bonus', `${editText(getNested(subB, '属性', '无'), '契约者.职业.副属性加成.属性')} +${editSpan(getNested(subB, '值', 0), '契约者.职业.副属性加成.值')}`);

    setHtml('job-skills', renderSkillsHtml(getNested(job, '职业技能', {}), '契约者.职业.职业技能'));

    const jobTraits = getNested(job, '职业特性', {});
    let jtHtml = '';
    const jtKeys = Object.keys(jobTraits);
    if (jtKeys.length === 0) jtHtml = '<div class="empty-state">暂无职业特性</div>';
    else jtKeys.forEach(k => {
      jtHtml += `<div class="skill-row"><span style="color:var(--soul);font-weight:700;">${k}</span><br><span style="font-size:0.82rem;color:var(--text-body);">${editText(getNested(jobTraits[k], '效果', ''), '契约者.职业.职业特性.' + k + '.效果')}</span></div>`;
    });
    setHtml('job-traits', jtHtml);

    const legacySkills = getNested(job, '传承技能', {});
    let lsHtml = '';
    const lsKeys = Object.keys(legacySkills);
    if (lsKeys.length === 0) lsHtml = '<div class="empty-state">暂无传承技能</div>';
    else lsKeys.forEach(k => {
      lsHtml += `<div class="skill-row"><span style="color:var(--ember-bright);font-weight:700;">${k}</span> <span style="color:var(--text-secondary);font-size:0.75rem;">Lv.${editSpan(getNested(legacySkills[k], '等级', '-'), '契约者.职业.传承技能.' + k + '.等级')}</span><br><span style="font-size:0.82rem;color:var(--text-body);">${editText(getNested(legacySkills[k], '效果', ''), '契约者.职业.传承技能.' + k + '.效果')}</span></div>`;
    });
    setHtml('job-legacy', lsHtml);
  } else {
    setHtml('job-name', '无');
    $('#job-name').classList.add('none');
  }

  // === General Skills ===
  const genSkills = d('契约者.通用技能', {});
  const gsKeys = Object.keys(genSkills);
  let gsHtml = '';
  if (gsKeys.length === 0) gsHtml = '<div class="empty-state">暂无通用技能</div>';
  else gsHtml = `<div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:6px;">(${gsKeys.length}/12)</div>` + renderSkillsHtml(genSkills, '契约者.通用技能');
  setHtml('gen-skills', gsHtml);

  // === Equipment ===
  setHtml('equip-list', renderEquipHtml(d('契约者.装备', {}), '契约者.装备', '契约者'));

  // === Backpack ===
  const bag = d('契约者.背包', {});
  const bagKeys = Object.keys(bag);
  let bagHtml = '';
  if (bagKeys.length === 0) {
    bagHtml = '<div class="empty-state">背包为空</div>';
  } else {
    const targetOptionsHtml = '<option value="契约者">自己</option>';
    bagKeys.forEach(k => {
      const item = bag[k] || {};
      const count = getNested(item, '数量', 1);
      const desc = getNested(item, '描述', '');
      const quality = getNested(item, '品质', '');
      const type = getNested(item, '类型', '');
      const enhance = getNested(item, '强化等级', 0);
      const dice = getNested(item, '伤害骰', '');
      const mult = getNested(item, '倍率', 0);
      const def = getNested(item, '装备防御', 0);
      const dodge = getNested(item, '装备闪避', 0);
      const mainAttr = getNested(item, '主属性', '');
      const mainBonus = getNested(item, '主属性加成', 0);
      const subAttr = getNested(item, '副属性', '');
      const subBonus = getNested(item, '副属性加成', 0);
      const weight = getNested(item, '负重', 0);
      const eff = getNested(item, '效果', '');
      const bp = '契约者.背包.' + k;

      let isEquip = false;
      if (quality && quality !== '无' && quality !== '白色') {
        if (type && (type.includes('武器') || type.includes('甲') || type.includes('防具') || type.includes('饰品') || type.includes('配件') || type.includes('剑') || type.includes('枪'))) {
          isEquip = true;
        }
      }

      bagHtml += `<div class="skill-row">`;
      bagHtml += `<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px;">`;
      bagHtml += `<span style="color:var(--text-primary);font-size:0.88rem;font-weight:700;">${k}</span>`;
      bagHtml += `<div style="display:flex;gap:6px;align-items:center;">`;
      bagHtml += `<span style="color:var(--sage);">×${editSpan(count, bp + '.数量')}</span>`;
      if (isEquip) {
        bagHtml += `<select class="select-field equip-target-select" style="width:auto;padding:3px 24px 3px 6px;font-size:0.72rem;">${targetOptionsHtml}</select>`;
        bagHtml += `<select class="select-field equip-slot-select" style="width:auto;padding:3px 24px 3px 6px;font-size:0.72rem;">`;
        ['头部','躯干','腿部','手部','脚部','主手','副手','饰品1','饰品2'].forEach(s => { bagHtml += `<option value="${s}" ${s === '主手' ? 'selected' : ''}>${s}</option>`; });
        bagHtml += `</select>`;
        bagHtml += `<button class="btn btn-fire btn-sm btn-equip" data-itemname="${k}">装备</button>`;
      }
      bagHtml += `<button class="btn btn-ghost btn-sm btn-delete-bag" data-itemname="${k}" style="color:var(--blood);border-color:var(--blood);">删除</button>`;
      bagHtml += `</div></div>`;

      if (quality && quality !== '无') {
        let tagClass = 'tag-gray';
        if (quality === '金色') tagClass = 'tag-gold';
        else if (quality === '蓝色') tagClass = 'tag-blue';
        else if (quality === '绿色') tagClass = 'tag-green';
        else if (quality === '紫色' || quality === '银色') tagClass = 'tag-purple';

        bagHtml += `<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;align-items:center;">`;
        bagHtml += `<span class="tag ${tagClass}">${editText(quality, bp + '.品质')}${enhance ? ' +' + editSpan(enhance, bp + '.强化等级') : ''}</span>`;
        if (type && type !== '无') bagHtml += `<span style="color:var(--gold-bright);font-size:0.75rem;">${editText(type, bp + '.类型')}</span>`;
        if (dice && dice !== '无' && dice !== '') bagHtml += `<span style="color:var(--text-body);font-size:0.75rem;">${editText(dice, bp + '.伤害骰')}${mult ? '(×' + mult + ')' : ''}</span>`;
        bagHtml += `</div>`;
      }
      if (eff && eff !== '无') bagHtml += `<div style="margin-top:4px;font-size:0.8rem;color:var(--text-body);">${editText(eff, bp + '.效果')}</div>`;
      if (desc && desc !== '无') bagHtml += `<div style="margin-top:2px;font-size:0.78rem;color:var(--text-secondary);">${editText(desc, bp + '.描述')}</div>`;
      bagHtml += `</div>`;
    });
  }
  setHtml('bag-list', bagHtml);

  // === Dungeon Log ===
  const dungeons = d('契约者.副本经历', {});
  const dgKeys = Object.keys(dungeons);
  let dgHtml = '';
  if (dgKeys.length === 0) dgHtml = '<div class="empty-state">暂无副本记录</div>';
  else dgKeys.forEach(k => {
    const dg = dungeons[k] || {};
    const grade = getNested(dg, '评价等级', '');
    let gradeClass = 'tag-green';
    if (grade === 'S') gradeClass = 'tag-gold';
    else if (grade === 'A') gradeClass = 'tag-purple';
    else if (grade === 'B') gradeClass = 'tag-blue';
    else if (grade === 'C') gradeClass = 'tag-gray';
    else if (grade === 'D') gradeClass = 'tag-red';
    dgHtml += `<div class="skill-row"><span class="tag ${gradeClass}">${grade}</span> <span style="color:var(--text-primary);font-size:0.88rem;">${k}</span><br><span style="font-size:0.82rem;color:var(--text-secondary);">${editText(getNested(dg, '简要说明', ''), '契约者.副本经历.' + k + '.简要说明')}</span></div>`;
  });
  setHtml('dungeon-list', dgHtml);

  // === Relations ===
  const relations = d('契约者.人际关系', {});
  const relKeys = Object.keys(relations);
  let relHtml = '';
  if (relKeys.length === 0) relHtml = '<div class="empty-state">暂无关系记录</div>';
  else relKeys.forEach(k => {
    const rel = relations[k] || {};
    const fav = getNested(rel, '好感度', 0);
    let favColor = 'var(--sage)';
    if (fav < -30) favColor = 'var(--blood)';
    else if (fav < 0) favColor = 'var(--ember)';
    else if (fav < 30) favColor = 'var(--text-secondary)';
    else if (fav < 60) favColor = 'var(--gold-bright)';
    relHtml += `<div class="skill-row"><span style="color:var(--text-primary);font-size:0.88rem;">${k}</span> <span style="color:${favColor};">◆ ${editSpan(fav, '契约者.人际关系.' + k + '.好感度')}</span>`;
    if (getNested(rel, '关系', '')) relHtml += `<br><span style="font-size:0.8rem;color:var(--text-dim);">${editText(getNested(rel, '关系', ''), '契约者.人际关系.' + k + '.关系')}</span>`;
    relHtml += `</div>`;
  });
  setHtml('rel-list', relHtml);

  // === Squad ===
  const squadName = d('契约者.小队.名称', '无');
  const squadNameEl = $('#squad-name');
  if (squadNameEl) {
    squadNameEl.textContent = squadName;
    squadNameEl.className = (squadName === '无' || squadName === '') ? 'stat-value none' : 'stat-value accent';
  }
  const sqKeys = Object.keys(squad);
  let sqHtml = '';
  if (sqKeys.length === 0) sqHtml = '<div class="empty-state">暂无小队成员</div>';
  else sqKeys.forEach(k => { sqHtml += renderEntityCard(k, squad[k] || {}, 'mate'); });
  setHtml('squad-list', sqHtml);

  // === Dungeon Meta ===
  const meta = d('契约者.当前副本元数据', {});
  setHtml('meta-name', editText(getNested(meta, '副本名称', '---'), '契约者.当前副本元数据.副本名称'));
  setHtml('meta-src', editText(getNested(meta, '副本来源', '---'), '契约者.当前副本元数据.副本来源'));
  const dType = getNested(meta, '副本类型', '---');
  let dtClass = dType === '和平' ? 'tag-green' : (dType === '阵营' ? 'tag-blue' : (dType === '血腥' ? 'tag-red' : 'tag-gray'));
  const metaTypeEl = $('#meta-type');
  if (metaTypeEl) { metaTypeEl.textContent = editText(dType, '契约者.当前副本元数据.副本类型'); metaTypeEl.className = 'tag ' + dtClass; }
  setHtml('meta-baselv', 'Lv.' + editSpan(getNested(meta, '基准等级', 1), '契约者.当前副本元数据.基准等级'));
  setHtml('meta-time', editText(getNested(meta, '时间限制', '---'), '契约者.当前副本元数据.时间限制'));

  // === Inherent Characters ===
  const inherentChars = d('契约者.固有角色', {});
  const ihKeys = Object.keys(inherentChars);
  let ihHtml = '';
  if (ihKeys.length === 0) ihHtml = '<div class="empty-state">暂无已知固有角色</div>';
  else ihKeys.forEach(k => {
    const c = inherentChars[k] || {};
    const st = getNested(c, '状态', '存活');
    ihHtml += `<div class="skill-row"><span class="tag ${st === '死亡' ? 'tag-red' : 'tag-green'}">${st}</span> <span style="color:var(--ember-bright);font-size:0.8rem;">${getNested(c, '阶位', '')}</span> <span style="color:var(--text-primary);font-size:0.88rem;font-weight:700;">${k}</span><br><span style="color:var(--text-secondary);font-size:0.8rem;">Lv.${getNested(c, '等级', 1)} | ${getNested(c, '类型', '')}</span></div>`;
  });
  setHtml('inherent-chars-list', ihHtml);

  // === Other Contractors ===
  const otherConts = d('契约者.其他契约者名单', {});
  const ocKeys = Object.keys(otherConts);
  let ocHtml = '';
  if (ocKeys.length === 0) ocHtml = '<div class="empty-state">暂无已知其他契约者</div>';
  else ocKeys.forEach(k => {
    const c = otherConts[k] || {};
    const st = getNested(c, '状态', '存活');
    const fac = getNested(c, '阵营', '');
    ocHtml += `<div class="skill-row"><span class="tag ${st === '死亡' ? 'tag-red' : 'tag-green'}">${st}</span> `;
    if (fac) ocHtml += `<span class="tag tag-blue">${fac}</span> `;
    ocHtml += `<span style="color:var(--text-primary);font-size:0.88rem;font-weight:700;">${k}</span><br><span style="color:var(--text-secondary);font-size:0.8rem;">Lv.${getNested(c, '等级', 1)}</span></div>`;
  });
  setHtml('other-conts-list', ocHtml);

  // === Quests ===
  function renderQuestSection(data, path, defaultEmpty) {
    const keys = Object.keys(data || {});
    if (keys.length === 0) return `<div class="empty-state">${defaultEmpty}</div>`;
    let html = '';
    keys.forEach(k => {
      const q = data[k] || {};
      const st = getNested(q, '状态', '进行中');
      let stClass = 'tag-orange';
      if (st === '已完成' || st === '已达成') stClass = 'tag-green';
      else if (st === '失败') stClass = 'tag-red';
      else if (st === '未触发') stClass = 'tag-purple';
      else if (st === '已结束') stClass = 'tag-gray';
      html += `<div class="quest-item"><span class="tag ${stClass}">${st}</span> <span class="quest-name">${k}</span>`;
      const desc = getNested(q, '说明', '');
      if (desc) html += `<div class="quest-desc">${editText(desc, path + '.' + k + '.说明')}</div>`;
      const reward = getNested(q, '奖励', '');
      if (reward) html += `<div class="quest-reward">奖励: ${editText(reward, path + '.' + k + '.奖励')}</div>`;
      html += `</div>`;
    });
    return html;
  }

  setHtml('quest-main', renderQuestSection(d('契约者.当前副本任务.主线任务', {}), '契约者.当前副本任务.主线任务', '暂无主线任务'));
  setHtml('quest-side', renderQuestSection(d('契约者.当前副本任务.支线任务', {}), '契约者.当前副本任务.支线任务', '暂无支线任务'));
  setHtml('quest-hidden', renderQuestSection(d('契约者.当前副本任务.隐藏任务', {}), '契约者.当前副本任务.隐藏任务', '未触发'));
  setHtml('quest-world-events', renderQuestSection(d('契约者.当前副本任务.世界事件', {}), '契约者.当前副本任务.世界事件', '暂无世界事件'));
  setHtml('quest-achievements', renderQuestSection(d('契约者.当前副本任务.副本成就', {}), '契约者.当前副本任务.副本成就', '暂无成就'));

  // === Enemies ===
  const enKeys = Object.keys(enemies);
  let enHtml = '';
  const enemyCountEl = $('#enemy-count');
  const enemyNavBadge = $('#enemy-nav-badge');
  if (enKeys.length === 0) {
    enHtml = '<div class="empty-state">战场目前风平浪静，无交战目标</div>';
    if (enemyCountEl) { enemyCountEl.textContent = '0'; enemyCountEl.className = 'stat-value none'; }
    if (enemyNavBadge) enemyNavBadge.textContent = '0';
  } else {
    if (enemyCountEl) { enemyCountEl.textContent = enKeys.length; enemyCountEl.className = 'stat-value danger'; }
    if (enemyNavBadge) enemyNavBadge.textContent = enKeys.length;
    enKeys.forEach(k => { enHtml += renderEntityCard(k, enemies[k] || {}, 'enemy'); });
  }
  setHtml('enemy-list', enHtml);

  // === Job Tree ===
  const jobTree = d('契约者.职业.转职树', null);
  let jtHtml = '';
  if (!jobTree || Object.keys(jobTree).length === 0) {
    jtHtml = '<div class="empty-state" style="padding:32px;"><div style="font-size:0.95rem;margin-bottom:8px;">目前尚未加载职业转职树数据</div><div style="font-size:0.78rem;">当获得职业时，系统将自动生成成长路线</div></div>';
  } else {
    const rootName = getNested(jobTree, '名称', '基础职业');
    jtHtml = `<div class="tree-container"><div class="tree-wrapper"><div class="tree"><ul>${renderTreeNode(jobTree, rootName)}</ul></div></div></div>`;
  }
  setHtml('job-tree-content', jtHtml);

  // Bind editable events
  bindEditable();
}

// ============ Helper Setters ============
function setText(id, text) { const el = $('#' + id); if (el) el.textContent = text; }
function setHtml(id, html) { const el = $('#' + id); if (el) el.innerHTML = html; }
function setStyle(id, prop, val) { const el = $('#' + id); if (el) el.style[prop] = val; }

// ============ Editable Fields Binding ============
function bindEditable() {
  $$('.editable-num').forEach(el => {
    el.removeEventListener('click', numClickHandler);
    el.addEventListener('click', numClickHandler);
  });
  $$('.editable-text').forEach(el => {
    el.removeEventListener('blur', textBlurHandler);
    el.addEventListener('blur', textBlurHandler);
  });
}

function numClickHandler(e) {
  if (this.querySelector('input')) return;
  e.stopPropagation();
  const path = this.dataset.path;
  const currentVal = parseFloat(this.dataset.val);
  const input = document.createElement('input');
  input.type = 'number';
  input.step = 'any';
  input.className = 'inline-input';
  input.style.width = Math.max(this.offsetWidth, 30) + 15 + 'px';
  input.value = currentVal;
  this.innerHTML = '';
  this.appendChild(input);
  input.focus();
  input.select();

  const commit = () => {
    let newVal = parseFloat(input.value);
    if (isNaN(newVal)) newVal = currentVal;
    if (newVal !== currentVal) saveNumeric(path, currentVal, newVal);
    else populateAll();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') commit(); });
}

async function textBlurHandler() {
  const path = this.dataset.path;
  const currentVal = this.dataset.val;
  const newVal = this.textContent;
  if (newVal !== currentVal) {
    this.dataset.val = newVal;
    await saveText(path, currentVal, newVal);
  }
}

async function saveNumeric(path, currentVal, newVal) {
  let basePath = '契约者';
  const match = path.match(/^(契约者\.小队\.成员\.[^.]+|契约者\.当前敌人\.[^.]+)/);
  if (match) basePath = match[1];

  if (path.includes('属性.基础')) {
    const delta = newVal - currentVal;
    const free = Number(getData(basePath + '.属性.未分配属性点', 0)) || 0;
    setData(basePath + '.属性.未分配属性点', free - delta);
  }
  if (path.endsWith('.头部.等级')) {
    const delta = newVal - currentVal;
    if (delta > 0) {
      const free = Number(getData(basePath + '.属性.未分配属性点', 0)) || 0;
      setData(basePath + '.属性.未分配属性点', free + delta);
    }
  }
  setData(path, newVal);
  recalcStats(basePath);
  populateAll();
  Toast.show(`数值已更新: ${currentVal} → ${newVal}`, 'success');
}

async function saveText(path, currentVal, newVal) {
  let basePath = '契约者';
  const match = path.match(/^(契约者\.小队\.成员\.[^.]+|契约者\.当前敌人\.[^.]+)/);
  if (match) basePath = match[1];

  if (path.endsWith('.头部.阶位')) {
    const free = Number(getData(basePath + '.属性.未分配属性点', 0)) || 0;
    if (currentVal === '一阶' && newVal === '二阶') setData(basePath + '.属性.未分配属性点', free + 3);
    else if (currentVal === '二阶' && newVal === '三阶') setData(basePath + '.属性.未分配属性点', free + 5);
    else if (currentVal === '三阶' && newVal === '四阶') setData(basePath + '.属性.未分配属性点', free + 5);
    else if (currentVal === '四阶' && newVal === '五阶') setData(basePath + '.属性.未分配属性点', free + 8);
  }
  setData(path, newVal);
  recalcStats(basePath);
  populateAll();
  Toast.show(`文本已更新`, 'success');
}

// ============ Event Handlers ============
function initEvents() {
  // Tab navigation
  $$('.nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', function() {
      $$('.nav-item').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      $$('.tab-panel').forEach(p => p.classList.remove('active'));
      const target = $('#' + this.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Group header toggle
  $$('.group-header').forEach(header => {
    header.addEventListener('click', function() {
      const chevron = this.querySelector('.panel-chevron');
      const body = this.nextElementSibling;
      if (chevron) chevron.classList.toggle('collapsed');
      if (body) body.classList.toggle('collapsed');
    });
  });

  // Panel header toggle
  $$('.panel-header').forEach(header => {
    header.addEventListener('click', function(e) {
      const chevron = this.querySelector('.panel-chevron');
      const body = this.nextElementSibling;
      if (chevron) chevron.classList.toggle('collapsed');
      if (body) body.classList.toggle('collapsed');
    });
  });

  // Entity card toggle
  $('#main-area').addEventListener('click', function(e) {
    const header = e.target.closest('.entity-header');
    if (!header) return;
    const chevron = header.querySelector('.panel-chevron');
    const body = header.nextElementSibling;
    if (chevron) chevron.classList.toggle('collapsed');
    if (body) body.classList.toggle('collapsed');
  });

  // Sub-section attribute toggle
  $('#main-area').addEventListener('click', function(e) {
    const toggle = e.target.closest('[data-toggle]');
    if (!toggle) return;
    const targetId = toggle.dataset.toggle;
    const target = $('#' + targetId);
    if (target) target.style.display = target.style.display === 'none' ? 'block' : 'none';
  });

  // Collapse all
  let allCollapsed = false;
  function toggleAll() {
    allCollapsed = !allCollapsed;
    const chevrons = $$('.panel-chevron');
    const bodies = $$('.panel-body, .group-body, .entity-body');
    if (allCollapsed) {
      chevrons.forEach(c => c.classList.add('collapsed'));
      bodies.forEach(b => b.classList.add('collapsed'));
    } else {
      chevrons.forEach(c => c.classList.remove('collapsed'));
      bodies.forEach(b => b.classList.remove('collapsed'));
    }
    const btn = $('#btn-collapse-all');
    if (btn) btn.querySelector('.nav-label').textContent = allCollapsed ? '展开全部' : '折叠全部';
    Toast.show(allCollapsed ? '全部面板已折叠' : '全部面板已展开', 'info');
  }
  $('#btn-collapse-all').addEventListener('click', toggleAll);

  // Unequip
  $('#main-area').addEventListener('click', async function(e) {
    const btn = e.target.closest('.btn-unequip');
    if (!btn) return;
    const slot = btn.dataset.slot;
    const targetPath = btn.dataset.targetpath;
    const displayName = targetPath === '契约者' ? '你' : targetPath.split('.').pop();

    if (!confirm(`确认脱下 ${displayName} [${slot}] 的装备吗？`)) return;

    const eq = cloneDeep(getData(targetPath + '.装备.' + slot) || {});
    const eqName = getNested(eq, '名称', '');
    if (eqName && eqName !== '无') {
      const bagPath = '契约者.背包.' + eqName;
      const exist = getData(bagPath);
      if (exist) { eq['数量'] = (exist['数量'] || 0) + 1; }
      else { eq['数量'] = 1; }
      setData(bagPath, eq);

      const emptyEquip = { '名称': '无', '类型': '无', '品质': '无', '阶位': '无', '强化等级': 0, '伤害骰': '无', '倍率': 0, '主属性': '无', '副属性': '无', '主属性加成': 0, '副属性加成': 0, '装备防御': 0, '装备闪避': 0, '负重': 0, '效果': '无', '描述': '无' };
      setData(targetPath + '.装备.' + slot, emptyEquip);
      recalcStats(targetPath);
      populateAll();
      Toast.show(`${displayName} 脱下了 [${slot}] 的装备: ${eqName}`, 'info');
    }
  });

  // Equip from bag
  $('#main-area').addEventListener('click', async function(e) {
    const btn = e.target.closest('.btn-equip');
    if (!btn) return;
    const itemName = btn.dataset.itemname;
    const slotSelect = btn.parentElement.querySelector('.equip-slot-select');
    const targetSelect = btn.parentElement.querySelector('.equip-target-select');
    const slot = slotSelect ? slotSelect.value : '主手';
    const targetPath = targetSelect ? targetSelect.value : '契约者';

    const bagItem = cloneDeep(getData('契约者.背包.' + itemName));
    if (!bagItem) return;

    const oldEq = cloneDeep(getData(targetPath + '.装备.' + slot) || {});

    const count = bagItem['数量'] || 1;
    if (count > 1) {
      setData('契约者.背包.' + itemName + '.数量', count - 1);
      delete bagItem['数量'];
    } else {
      unsetNested(GameData.stat_data, '契约者.背包.' + itemName);
      delete bagItem['数量'];
    }

    const emptyEquip = { '名称': '无', '类型': '无', '品质': '无', '阶位': '无', '强化等级': 0, '伤害骰': '无', '倍率': 0, '主属性': '无', '副属性': '无', '主属性加成': 0, '副属性加成': 0, '装备防御': 0, '装备闪避': 0, '负重': 0, '效果': '无', '描述': '无' };
    const newEq = Object.assign({}, emptyEquip, bagItem);
    if (!newEq['名称'] || newEq['名称'] === '无') newEq['名称'] = itemName;
    setData(targetPath + '.装备.' + slot, newEq);

    if (oldEq && oldEq['名称'] && oldEq['名称'] !== '无') {
      const oldBagPath = '契约者.背包.' + oldEq['名称'];
      const exist = getData(oldBagPath);
      if (exist) { oldEq['数量'] = (exist['数量'] || 0) + 1; }
      else { oldEq['数量'] = 1; }
      setData(oldBagPath, oldEq);
    }

    recalcStats(targetPath);
    populateAll();
    const displayName = targetPath === '契约者' ? '你' : targetPath.split('.').pop();
    Toast.show(`${displayName} 在 [${slot}] 装备了: ${itemName}`, 'success');
  });

  // Delete bag item
  $('#main-area').addEventListener('click', async function(e) {
    const btn = e.target.closest('.btn-delete-bag');
    if (!btn) return;
    const itemName = btn.dataset.itemname;
    if (!confirm(`确认永久删除背包中的 [${itemName}] 吗？此操作不可逆！`)) return;
    unsetNested(GameData.stat_data, '契约者.背包.' + itemName);
    populateAll();
    Toast.show(`已销毁: ${itemName}`, 'warning');
  });

  // Chat
  const chatInput = $('#chat-input');
  const chatSendBtn = $('#chat-send-btn');
  const chatMessages = $('#chat-messages');

  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user';
    userMsg.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div><div class="chat-avatar">契</div>`;
    chatMessages.appendChild(userMsg);

    // Simulate assistant response
    setTimeout(() => {
      const responses = [
        '收到，契约者。正在处理你的请求…',
        '理解。回廊已记录你的指令。',
        '这条信息已送达回廊意志。请耐心等待回应。',
        '指令确认。你是否需要进一步协助？',
        '契约者，你的话语已被倾听。回廊的回应将很快到来。'
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-msg assistant';
      aiMsg.innerHTML = `<div class="chat-avatar" style="background:var(--ember);color:#fff;">廊</div><div class="chat-bubble">${reply}</div>`;
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600 + Math.random() * 800);

    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  chatSendBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      const tabs = $$('.nav-item[data-tab]');
      const idx = parseInt(e.key) - 1;
      if (tabs[idx]) tabs[idx].click();
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============ Init ============
function init() {
  initEmbers();
  Toast.init();
  Modal.init();
  recalcStats('契约者');
  populateAll();
  initEvents();

  // Show welcome toast
  setTimeout(() => {
    Toast.show('欢迎回到无限回廊，契约者。', 'info', 4000);
  }, 500);

  console.log('%c◆ 无限回廊 · Infinite Corridor %cv4.0',
    'color:#c4a35a;font-size:1.2em;font-weight:bold;',
    'color:#7a7162;');
  console.log('%c余烬未熄，契约永存。愿你在无尽的轮回中找到属于自己的道路。',
    'color:#b5ac9a;font-style:italic;');
}

document.addEventListener('DOMContentLoaded', init);
