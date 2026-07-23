/* ============================================================
   无限回廊 v6.0 — 酒馆助手 · 锈蚀终端
   里世界手机界面：符文触发按钮 → 铁锈框架 → 8 功能入口
   ============================================================ */

(function () {
  'use strict';

  // ============ 内部 DOM 引用 ============
  let triggerBtn = null;
  let phoneOverlay = null;
  let phoneFrame = null;

  // ============ 拖动状态 ============
  let isDraggingBtn = false;
  let dragStartX = 0, dragStartY = 0, btnStartX = 0, btnStartY = 0;
  let hasMovedBtn = false;
  let isDraggingPhone = false;
  let phoneDragStartX = 0, phoneDragStartY = 0, phoneStartX = 0, phoneStartY = 0;
  let isPinned = false;

  // ============ 聊天历史 ============
  let chatHistory = [];

  // ============ 应用定义 ============
  const APPS = [
    { id: 'identity', label: '契约者', icon: 'identity' },
    { id: 'dungeon',  label: '副本',   icon: 'dungeon' },
    { id: 'bag',      label: '背包',   icon: 'bag' },
    { id: 'map',      label: '地图',   icon: 'map' },
    { id: 'enemies',  label: '敌情',   icon: 'enemies' },
    { id: 'squad',    label: '小队',   icon: 'squad' },
    { id: 'jobtree',  label: '职业',   icon: 'jobtree' },
    { id: 'radio',    label: '通讯',   icon: 'radio' }
  ];

  // ============ SVG 应用图标 ============
  const APP_ICONS = {
    identity: `<svg class="app-svg" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>`,
    dungeon:  `<svg class="app-svg" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="9"/><line x1="15" y1="9" x2="15" y2="21"/></svg>`,
    bag:      `<svg class="app-svg" viewBox="0 0 24 24"><path d="M4 7h16l-1.5 13h-13L4 7z"/><path d="M8 7V5a4 4 0 018 0v2"/></svg>`,
    map:      `<svg class="app-svg" viewBox="0 0 24 24"><path d="M3 6l6-2 6 3 6-2v14l-6 2-6-3-6 2V6z"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="7" x2="15" y2="19"/></svg>`,
    enemies:  `<svg class="app-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/><line x1="7" y1="7" x2="9" y2="9"/><line x1="15" y1="15" x2="17" y2="17"/><line x1="15" y1="9" x2="17" y2="7"/><line x1="7" y1="17" x2="9" y2="15"/></svg>`,
    squad:    `<svg class="app-svg" viewBox="0 0 24 24"><circle cx="9" cy="6" r="3"/><circle cx="15" cy="6" r="3"/><path d="M3 22c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M9 22c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>`,
    jobtree:  `<svg class="app-svg" viewBox="0 0 24 24"><rect x="10" y="3" width="4" height="6"/><rect x="3" y="12" width="5" height="4"/><rect x="16" y="12" width="5" height="4"/><line x1="12" y1="9" x2="5.5" y2="12"/><line x1="12" y1="9" x2="18.5" y2="12"/><line x1="5.5" y1="16" x2="4" y2="20"/><line x1="18.5" y1="16" x2="20" y2="20"/><line x1="10" y1="22" x2="14" y2="18"/></svg>`,
    radio:    `<svg class="app-svg" viewBox="0 0 24 24"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/><circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/><circle cx="12" cy="12" r="3"/></svg>`
  };

  // ============ 符文触发按钮 SVG ============
  function makeRuneSvg() {
    return `<svg class="rune-svg" viewBox="0 0 32 32">
      <polygon class="rune-outer" points="16,1 22,7 31,7 31,16 22,25 16,31 10,25 1,25 1,7 10,7"/>
      <polygon class="rune-inner" points="16,6 20,10 26,10 26,16 20,22 16,26 12,22 6,22 6,10 12,10"/>
      <circle class="rune-dot" cx="16" cy="16" r="3"/>
    </svg>`;
  }

  // ============ 获取游戏数据 ============
  function getGameData(path, def) {
    if (typeof D === 'function') return D(path, def);
    if (typeof G !== 'undefined' && G.stat_data && typeof getNested === 'function') {
      return getNested(G.stat_data, path, def);
    }
    return def;
  }

  // ============ 更新快捷状态 ============
  function updateQuickStats() {
    const hp = document.getElementById('qs-hp');
    const mp = document.getElementById('qs-mp');
    const sp = document.getElementById('qs-sp');
    if (!hp || !mp || !sp) return;
    hp.textContent = getGameData('契约者.衍生属性.HP_当前', '?');
    mp.textContent = getGameData('契约者.衍生属性.MP_当前', '?');
    sp.textContent = getGameData('契约者.衍生属性.耐力_当前', '?');
  }

  // ============ 更新时间 ============
  function updatePhoneTime() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                    now.getMinutes().toString().padStart(2, '0');
    const dateStr = (now.getMonth() + 1) + '/' + now.getDate();
    const weekDays = ['日','一','二','三','四','五','六'];
    const weekStr = '周' + weekDays[now.getDay()];

    const elTime = document.getElementById('ps-time');
    const elBigTime = document.getElementById('ph-time');
    const elDate = document.getElementById('ph-date');
    const elWorld = document.getElementById('ph-world');

    if (elTime) elTime.textContent = timeStr;
    if (elBigTime) elBigTime.textContent = timeStr;
    if (elDate) elDate.textContent = dateStr + ' ' + weekStr;

    const world = getGameData('当前世界', '');
    const gameDate = getGameData('当前时间.现实日期', '');
    if (elWorld) {
      const parts = [world, gameDate].filter(Boolean);
      elWorld.textContent = parts.length > 0 ? parts.join(' · ') : '里世界时间流';
    }
  }

  // ============ 建造手机 DOM ============
  function buildPhoneDOM() {
    const appsHTML = APPS.map(a =>
      `<div class="phone-app-item" data-app="${a.id}">
        <div class="phone-app-icon">${APP_ICONS[a.icon] || ''}</div>
        <span class="phone-app-label">${a.label}</span>
      </div>`
    ).join('');

    const html = `
      <div id="phone-overlay">
        <div id="phone-frame">
          <div id="phone-screen">
            <!-- 状态栏 -->
            <div class="phone-status-bar">
              <span class="ps-time" id="ps-time">00:00</span>
              <span class="ps-center">
                <span class="ps-indicator"></span>
                <span class="ps-label">无限回廊</span>
              </span>
              <span class="phone-status-actions">
                <button class="phone-pin-btn" id="phone-pin-btn" title="置顶">置顶</button>
              </span>
            </div>
            <!-- 主屏 -->
            <div class="phone-content" id="phone-home">
              <div class="phone-header-card">
                <div class="ph-time" id="ph-time">00:00</div>
                <div class="ph-date" id="ph-date">---</div>
                <div class="ph-world" id="ph-world">里世界时间流</div>
              </div>
              <div class="phone-quick-stats" id="phone-quick-stats">
                <div class="qs-item"><span class="qs-val hp" id="qs-hp">?</span><span class="qs-lbl">生 命</span></div>
                <div class="qs-item"><span class="qs-val mp" id="qs-mp">?</span><span class="qs-lbl">精 神</span></div>
                <div class="qs-item"><span class="qs-val sp" id="qs-sp">?</span><span class="qs-lbl">耐 力</span></div>
              </div>
              <div class="phone-divider"></div>
              <div class="phone-app-grid" id="phone-app-grid">${appsHTML}</div>
              <div class="phone-divider"></div>
              <div class="phone-footer">酒 馆 助 手 终 端</div>
            </div>
            <!-- 详情面板 -->
            <div id="phone-detail-panel">
              <div class="phone-detail-header">
                <button class="phone-back-btn" id="phone-detail-back">←</button>
                <span class="phone-detail-title" id="phone-detail-title">详情</span>
              </div>
              <div class="phone-detail-body" id="phone-detail-body"></div>
            </div>
            <!-- 聊天面板 -->
            <div id="phone-chat-panel">
              <div class="phone-detail-header">
                <button class="phone-back-btn" id="phone-chat-back">←</button>
                <span class="phone-detail-title">通讯器</span>
              </div>
              <div class="phone-chat-msgs" id="phone-chat-msgs">
                <div style="text-align:center;color:var(--chalk-dim);font-size:0.6rem;padding:20px 0;letter-spacing:2px;">沙沙……回廊通讯已连接……</div>
              </div>
              <div class="phone-chat-input-row">
                <input type="text" id="phone-chat-input" placeholder="输入讯息…" maxlength="200">
                <button class="phone-chat-send" id="phone-chat-send">发送</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container.firstElementChild); // phone overlay

    // 触发按钮
    const btn = document.createElement('button');
    btn.id = 'phone-trigger';
    btn.title = '酒馆助手终端';
    btn.innerHTML = makeRuneSvg();
    document.body.appendChild(btn);

    // 缓存引用
    triggerBtn = btn;
    phoneOverlay = document.getElementById('phone-overlay');
    phoneFrame = document.getElementById('phone-frame');
  }

  // ============ 打开/关闭手机 ============ */
  function openPhone() {
    if (!phoneOverlay) return;
    updatePhoneTime();
    updateQuickStats();
    phoneOverlay.classList.add('open');
    // 回到主屏
    closeAllPanels();
  }

  function closePhone() {
    if (!phoneOverlay) return;
    phoneOverlay.classList.remove('open');
    closeAllPanels();
  }

  function closeAllPanels() {
    const detail = document.getElementById('phone-detail-panel');
    const chat = document.getElementById('phone-chat-panel');
    const home = document.getElementById('phone-home');
    if (detail) detail.classList.remove('open');
    if (chat) chat.classList.remove('open');
    if (home) home.style.display = '';
  }

  // ============ 触发按钮拖动 ============
  function onTriggerDown(e) {
    if (e.button !== undefined && e.button !== 0) return; // 只响应左键
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    isDraggingBtn = false;
    hasMovedBtn = false;
    dragStartX = clientX;
    dragStartY = clientY;
    const rect = triggerBtn.getBoundingClientRect();
    btnStartX = rect.left;
    btnStartY = rect.top;
    triggerBtn.classList.add('dragging');
    e.preventDefault();
  }

  function onTriggerMove(e) {
    if (!triggerBtn || triggerBtn.classList.contains('dragging') === false) return;
    // 如果还没开始拖且没移动，在 down 状态就是 dragging
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMovedBtn = true;
    if (!hasMovedBtn) return;
    isDraggingBtn = true;
    let nx = btnStartX + dx;
    let ny = btnStartY + dy;
    // 边界限制
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const bw = triggerBtn.offsetWidth;
    const bh = triggerBtn.offsetHeight;
    nx = Math.max(0, Math.min(nx, vw - bw));
    ny = Math.max(0, Math.min(ny, vh - bh));
    triggerBtn.style.left = nx + 'px';
    triggerBtn.style.top = ny + 'px';
    triggerBtn.style.right = 'auto';
    triggerBtn.style.bottom = 'auto';
    e.preventDefault();
  }

  function onTriggerUp(e) {
    triggerBtn.classList.remove('dragging');
    if (!isDraggingBtn && !hasMovedBtn) {
      // 点击 → 切换手机
      if (phoneOverlay && phoneOverlay.classList.contains('open')) {
        closePhone();
      } else {
        openPhone();
      }
    }
    // 保存位置
    if (isDraggingBtn && triggerBtn) {
      const left = parseFloat(triggerBtn.style.left);
      const top = parseFloat(triggerBtn.style.top);
      if (!isNaN(left) && !isNaN(top)) {
        try { localStorage.setItem('phone-trigger-pos', JSON.stringify({ left, top })); } catch (_) {}
      }
    }
    isDraggingBtn = false;
    hasMovedBtn = false;
  }

  // ============ 手机框架拖动（通过状态栏） ============
  function onPhoneDragStart(e) {
    if (e.target.closest('.phone-pin-btn') || e.target.closest('button')) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    isDraggingPhone = true;
    phoneDragStartX = clientX;
    phoneDragStartY = clientY;
    const rect = phoneFrame.getBoundingClientRect();
    phoneStartX = rect.left;
    phoneStartY = rect.top;
    phoneFrame.style.transition = 'none';
    phoneFrame.style.margin = '0';
    phoneFrame.style.position = 'fixed';
    e.preventDefault();
  }

  function onPhoneDragMove(e) {
    if (!isDraggingPhone) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - phoneDragStartX;
    const dy = clientY - phoneDragStartY;
    phoneFrame.style.left = (phoneStartX + dx) + 'px';
    phoneFrame.style.top = (phoneStartY + dy) + 'px';
    phoneFrame.style.right = 'auto';
    phoneFrame.style.bottom = 'auto';
    e.preventDefault();
  }

  function onPhoneDragEnd() {
    if (!isDraggingPhone) return;
    isDraggingPhone = false;
    phoneFrame.style.transition = '';
  }

  // ============ 置顶切换 ============
  function togglePin() {
    isPinned = !isPinned;
    const btn = document.getElementById('phone-pin-btn');
    if (!phoneOverlay) return;
    if (isPinned) {
      phoneOverlay.classList.add('pinned');
      if (btn) { btn.textContent = '取消'; btn.classList.add('pinned'); }
    } else {
      phoneOverlay.classList.remove('pinned');
      if (btn) { btn.textContent = '置顶'; btn.classList.remove('pinned'); }
    }
  }

  // ============ 应用点击处理 ============
  const externalViews = {
    identity: null, dungeon: null, bag: null, mapFn: null,
    enemies: null, squad: null, jobtree: null
  };

  function handleAppClick(appId) {
    if (appId === 'radio') {
      openChatPanel();
      return;
    }
    // 游戏数据类应用 → 关闭手机，打开回廊覆盖层
    const fn = appId === 'map' ? externalViews.mapFn : externalViews[appId];
    if (typeof fn === 'function') {
      closePhone();
      setTimeout(() => fn(), 350);
    } else {
      // 降级：手机内显示简单详情
      showInlineDetail(appId);
    }
  }

  function showInlineDetail(appId) {
    const detail = document.getElementById('phone-detail-panel');
    const home = document.getElementById('phone-home');
    const title = document.getElementById('phone-detail-title');
    const body = document.getElementById('phone-detail-body');
    if (!detail || !home || !title || !body) return;

    const g = (p, d) => getGameData(p, d);
    let html = '<div style="text-align:center;padding:24px;color:var(--chalk-dim);">数据同步中……</div>';

    if (appId === 'identity') {
      html = quickSection('契约者档案',
        quickRow('姓名', g('契约者.头部.姓名','---')) +
        quickRow('等级', 'Lv.' + g('契约者.头部.等级','?')) +
        quickRow('阶位', g('契约者.头部.阶位','?')) +
        quickRow('HP', g('契约者.衍生属性.HP_当前','?')+'/'+g('契约者.衍生属性.HP_最大','?')) +
        quickRow('MP', g('契约者.衍生属性.MP_当前','?')+'/'+g('契约者.衍生属性.MP_最大','?')) +
        quickRow('职业', g('契约者.职业.名称','---'))
      );
    } else if (appId === 'dungeon') {
      html = quickSection('副本情报',
        quickRow('名称', g('契约者.当前副本元数据.副本名称','---')) +
        quickRow('类型', g('契约者.当前副本元数据.副本类型','---')) +
        quickRow('等级', 'Lv.' + g('契约者.当前副本元数据.基准等级','?'))
      );
    } else if (appId === 'bag') {
      const bag = g('契约者.背包', {});
      const keys = Object.keys(bag);
      html = quickSection('背包 (' + keys.length + '件)',
        keys.length === 0 ? '<div style="color:var(--chalk-dim);font-size:0.7rem;">空空如也</div>' :
        keys.map(k => quickRow(k, '×' + getGameData('契约者.背包.' + k + '.数量', 1))).join('')
      );
    } else if (appId === 'map') {
      html = quickSection('回廊地图', '<div style="color:var(--chalk-dim);font-size:0.7rem;">15 处设施已标注<br>当前区域：一阶区</div>');
    } else if (appId === 'enemies') {
      html = quickSection('敌情警戒', '<div style="color:var(--chalk-dim);font-size:0.7rem;">当前无交战中敌人</div>');
    } else if (appId === 'squad') {
      html = quickSection('小队名册', '<div style="color:var(--chalk-dim);font-size:0.7rem;">暂无队员</div>');
    } else if (appId === 'jobtree') {
      html = quickSection('职业路线',
        quickRow('当前', g('契约者.职业.名称','---')) +
        quickRow('稀有度', g('契约者.职业.稀有度','?')) +
        quickRow('等级', 'Lv.' + g('契约者.职业.职业等级','?'))
      );
    }

    title.textContent = (APPS.find(a => a.id === appId) || {}).label || '详情';
    body.innerHTML = html;
    home.style.display = 'none';
    detail.classList.add('open');
  }

  function quickSection(title, body) {
    return `<div style="margin-bottom:12px;border:1px solid rgba(100,50,20,0.15);background:rgba(10,7,5,0.5);">
      <div style="padding:8px 12px;font-family:var(--font-display);font-size:0.75rem;letter-spacing:2px;color:var(--amber);border-bottom:1px solid rgba(100,50,20,0.15);">${title}</div>
      <div style="padding:8px 12px;">${body}</div>
    </div>`;
  }

  function quickRow(label, value) {
    return `<div class="phone-row"><span class="pr-l">${label}</span><span class="pr-v">${value}</span></div>`;
  }

  // ============ 聊天面板 ============
  function openChatPanel() {
    const chat = document.getElementById('phone-chat-panel');
    const home = document.getElementById('phone-home');
    const detail = document.getElementById('phone-detail-panel');
    const input = document.getElementById('phone-chat-input');
    if (!chat) return;
    if (detail) detail.classList.remove('open');
    if (home) home.style.display = 'none';
    chat.classList.add('open');
    scrollChatToBottom();
    setTimeout(() => { if (input) input.focus(); }, 200);
  }

  function sendChatMessage() {
    const input = document.getElementById('phone-chat-input');
    const msgs = document.getElementById('phone-chat-msgs');
    if (!input || !msgs) return;
    const text = input.value.trim();
    if (!text) return;

    // 用户消息
    appendChatMsg(text, 'user');
    input.value = '';

    // 模拟回廊回复
    setTimeout(() => {
      const replies = [
        '收到。信号传达中……',
        '回廊深处传来低语。',
        '契约者，保持通讯畅通。',
        '通讯日志已记录。',
        '……这是来自深渊的回音。',
        '信号受扰，内容不详。',
        '你的呼叫已被回廊登记。'
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      appendChatMsg(reply, 'other');
    }, 400 + Math.random() * 800);
  }

  function appendChatMsg(text, role) {
    const msgs = document.getElementById('phone-chat-msgs');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'phone-chat-msg ' + (role === 'user' ? 'user' : 'other');
    div.textContent = text;
    msgs.appendChild(div);
    scrollChatToBottom();
  }

  function scrollChatToBottom() {
    const msgs = document.getElementById('phone-chat-msgs');
    if (msgs) setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
  }

  // ============ 恢复触发按钮位置 ============
  function restoreTriggerPosition() {
    if (!triggerBtn) return;
    try {
      const saved = localStorage.getItem('phone-trigger-pos');
      if (saved) {
        const { left, top } = JSON.parse(saved);
        const vw = window.innerWidth || document.documentElement.clientWidth;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const bw = triggerBtn.offsetWidth || 52;
        const bh = triggerBtn.offsetHeight || 52;
        const nx = Math.max(0, Math.min(left, vw - bw));
        const ny = Math.max(0, Math.min(top, vh - bh));
        triggerBtn.style.left = nx + 'px';
        triggerBtn.style.top = ny + 'px';
        triggerBtn.style.right = 'auto';
        triggerBtn.style.bottom = 'auto';
      }
    } catch (_) { /* 忽略 */ }
  }

  // ============ 事件绑定 ============
  function bindEvents() {
    // 触发按钮
    triggerBtn.addEventListener('mousedown', onTriggerDown);
    triggerBtn.addEventListener('touchstart', onTriggerDown, { passive: false });
    document.addEventListener('mousemove', onTriggerMove);
    document.addEventListener('touchmove', onTriggerMove, { passive: false });
    document.addEventListener('mouseup', onTriggerUp);
    document.addEventListener('touchend', onTriggerUp);

    // 关闭手机（点击背景）
    phoneOverlay.addEventListener('click', function (e) {
      if (e.target === phoneOverlay) {
        if (!isPinned) closePhone();
      }
    });

    // 置顶按钮
    const pinBtn = document.getElementById('phone-pin-btn');
    if (pinBtn) pinBtn.addEventListener('click', togglePin);

    // 手机拖动（状态栏）
    const statusBar = phoneOverlay.querySelector('.phone-status-bar');
    if (statusBar) {
      statusBar.style.cursor = 'move';
      statusBar.addEventListener('mousedown', onPhoneDragStart);
      statusBar.addEventListener('touchstart', onPhoneDragStart, { passive: false });
    }
    document.addEventListener('mousemove', onPhoneDragMove);
    document.addEventListener('touchmove', onPhoneDragMove, { passive: false });
    document.addEventListener('mouseup', onPhoneDragEnd);
    document.addEventListener('touchend', onPhoneDragEnd);

    // 应用点击
    phoneOverlay.addEventListener('click', function (e) {
      const appItem = e.target.closest('.phone-app-item');
      if (!appItem) return;
      const appId = appItem.dataset.app;
      if (appId) handleAppClick(appId);
    });

    // 详情返回
    const detailBack = document.getElementById('phone-detail-back');
    if (detailBack) {
      detailBack.addEventListener('click', function () {
        const detail = document.getElementById('phone-detail-panel');
        const home = document.getElementById('phone-home');
        if (detail) detail.classList.remove('open');
        if (home) home.style.display = '';
      });
    }

    // 聊天返回
    const chatBack = document.getElementById('phone-chat-back');
    if (chatBack) {
      chatBack.addEventListener('click', function () {
        const chat = document.getElementById('phone-chat-panel');
        const home = document.getElementById('phone-home');
        if (chat) chat.classList.remove('open');
        if (home) home.style.display = '';
      });
    }

    // 聊天发送
    const sendBtn = document.getElementById('phone-chat-send');
    const chatInput = document.getElementById('phone-chat-input');
    if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);
    if (chatInput) {
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); sendChatMessage(); }
      });
    }
  }

  // ============ 键盘快捷键 ============
  function bindKeyboard() {
    document.addEventListener('keydown', function (e) {
      // Ctrl+M → 打开/关闭手机
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        if (phoneOverlay && phoneOverlay.classList.contains('open')) {
          closePhone();
        } else {
          openPhone();
        }
      }
      // Escape → 关闭手机（如果打开且未置顶）
      if (e.key === 'Escape' && phoneOverlay && phoneOverlay.classList.contains('open') && !isPinned) {
        // 先检查是否已有其他 overlay 打开（回廊覆盖层优先）
        const corridorOverlay = document.getElementById('overlay');
        if (corridorOverlay && corridorOverlay.classList.contains('open')) return;
        closePhone();
      }
    });
  }

  // ============ 连接外部视图函数 ============
  function linkExternalViews() {
    // 直接访问全局函数（app.js 中定义的顶层函数）
    var g = (typeof window !== 'undefined') ? window : globalThis;
    if (typeof g.viewIdentity === 'function') externalViews.identity = g.viewIdentity;
    if (typeof g.viewDungeon === 'function') externalViews.dungeon = g.viewDungeon;
    if (typeof g.viewBag === 'function') externalViews.bag = g.viewBag;
    if (typeof g.viewMap === 'function') externalViews.mapFn = g.viewMap;
    if (typeof g.viewEnemies === 'function') externalViews.enemies = g.viewEnemies;
    if (typeof g.viewSquad === 'function') externalViews.squad = g.viewSquad;
    if (typeof g.viewJobTree === 'function') externalViews.jobtree = g.viewJobTree;
  }

  // ============ 初始化 ============
  function init() {
    if (document.getElementById('phone-trigger')) return; // 已初始化
    buildPhoneDOM();
    // 重新获取引用
    triggerBtn = document.getElementById('phone-trigger');
    phoneOverlay = document.getElementById('phone-overlay');
    phoneFrame = document.getElementById('phone-frame');
    restoreTriggerPosition();
    bindEvents();
    bindKeyboard();
    updatePhoneTime();
    updateQuickStats();
    setInterval(updatePhoneTime, 60000);
    setInterval(updateQuickStats, 30000);
    // 延迟连接外部视图（等待 app.js 加载）
    setTimeout(linkExternalViews, 500);
    console.log('%c◆ 酒馆助手终端%c — 锈蚀符文已激活，Ctrl+M 呼出',
      'color:#b8a070;', 'color:#706050;');
  }

  // ============ 启动 ============
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM 已就绪，延迟确保 app.js 先加载
    setTimeout(init, 100);
  }

})();
