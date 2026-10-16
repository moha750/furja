/* لوحة تحكم فُرجة */
(() => {
  'use strict';
  const CFG = window.FURJA;
  const $ = (s, r = document) => r.querySelector(s);
  const root = $('#root');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtTime = (s) => { s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
  const ERR = {
    bad: 'كلمة المرور غير صحيحة',
    locked: 'محاولات خاطئة كثيرة — انتظر ربع ساعة ثم حاول',
    duplicate: 'هذا الفيديو موجود مسبقًا',
    short: 'كلمة المرور الجديدة قصيرة (8 أحرف على الأقل)',
    not_embeddable: 'صاحب القناة منع تشغيله خارج يوتيوب — لن يعمل في التطبيق',
    not_found: 'الفيديو غير موجود أو خاص',
    network: 'تعذّر الاتصال، حاول مرة أخرى',
  };

  /* ---------- password storage ---------- */
  const PK = 'furja:admin-pass';
  const getPass = () => { try { return sessionStorage.getItem(PK) || localStorage.getItem(PK) || ''; } catch { return ''; } };
  const setPass = (p, remember) => {
    try {
      sessionStorage.setItem(PK, p);
      if (remember) localStorage.setItem(PK, p); else localStorage.removeItem(PK);
    } catch { /* ignore */ }
  };
  const clearPass = () => { try { sessionStorage.removeItem(PK); localStorage.removeItem(PK); } catch { /* ignore */ } };

  /* ---------- api ---------- */
  async function rpc(fn, args) {
    const r = await fetch(`${CFG.url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: CFG.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    if (!r.ok) throw new Error('network');
    return r.json();
  }
  async function listVideos() {
    const r = await fetch(`${CFG.url}/rest/v1/videos?select=*&order=created_at.desc`, { headers: { apikey: CFG.key }, cache: 'no-store' });
    if (!r.ok) throw new Error('network');
    return r.json();
  }
  async function videoInfo(id) {
    try {
      const r = await fetch(`${CFG.url}/functions/v1/video-info?id=${id}`, { headers: { apikey: CFG.key } });
      return await r.json();
    } catch { return { ok: false, error: 'network' }; }
  }

  /* ---------- link parsing ---------- */
  function parseIds(text) {
    const ids = [];
    const re = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^\s#]*?&)?v=|shorts\/|embed\/|live\/|v\/))([A-Za-z0-9_-]{11})/g;
    let m;
    while ((m = re.exec(text))) ids.push(m[1]);
    for (const line of text.split(/\s+/)) if (/^[A-Za-z0-9_-]{11}$/.test(line)) ids.push(line);
    return [...new Set(ids)];
  }

  /* ---------- duration probe (hidden muted player) ---------- */
  let ytApi;
  function loadYT() {
    if (ytApi) return ytApi;
    ytApi = new Promise((res) => {
      if (window.YT && window.YT.Player) return res(window.YT);
      window.onYouTubeIframeAPIReady = () => res(window.YT);
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
    return ytApi;
  }
  let probeQ = Promise.resolve();
  function probeDuration(id) {
    const job = probeQ.then(async () => {
      const YT = await Promise.race([loadYT(), new Promise((r) => setTimeout(() => r(null), 8000))]);
      if (!YT) return null;
      return new Promise((res) => {
        const host = document.createElement('div');
        host.style.cssText = 'position:fixed;left:-10000px;top:0;width:320px;height:180px;';
        const inner = document.createElement('div');
        host.appendChild(inner); document.body.appendChild(host);
        let done = false, iv = 0, p = null;
        const finish = (d) => {
          if (done) return; done = true; clearInterval(iv);
          try { p && p.destroy(); } catch { /* ignore */ }
          host.remove(); res(d);
        };
        setTimeout(() => finish(null), 12000);
        p = new YT.Player(inner, {
          host: 'https://www.youtube-nocookie.com', videoId: id, width: 320, height: 180,
          playerVars: { autoplay: 1, mute: 1, controls: 0, playsinline: 1 },
          events: {
            onReady: (e) => {
              e.target.mute(); e.target.playVideo();
              iv = setInterval(() => { const d = e.target.getDuration(); if (d > 0) finish(Math.round(d)); }, 300);
            },
            onError: () => finish(null),
          },
        });
      });
    });
    probeQ = job.catch(() => null);
    return job;
  }

  /* ---------- state ---------- */
  const S = { videos: [], pending: [], filter: '' };
  const cats = () => [...new Set(S.videos.map((v) => v.category).filter(Boolean))].sort();

  /* ---------- views ---------- */
  function loginView(msg = '') {
    root.innerHTML = `<div class="wrap"><div class="login">
      <img src="../icons/logo.svg" alt="">
      <h1>لوحة تحكم ${esc(CFG.name)}</h1>
      <p class="hint">أدخل كلمة المرور لإدارة الفيديوهات</p>
      <form id="lf">
        <input type="password" id="pw" placeholder="كلمة المرور" autocomplete="current-password" dir="ltr" style="text-align:center">
        <label class="chk"><input type="checkbox" id="rem" checked> تذكّرني على هذا الجهاز</label>
        <button class="btn acc" style="width:100%">دخول</button>
        <div class="msg bad" id="lm">${esc(msg)}</div>
      </form></div></div>`;
    $('#lf').addEventListener('submit', async (e) => {
      e.preventDefault();
      const p = $('#pw').value.trim();
      if (!p) return;
      $('#lm').textContent = '…';
      try {
        const r = await rpc('admin_verify', { p_pass: p });
        if (r.ok) { setPass(p, $('#rem').checked); start(); }
        else $('#lm').textContent = ERR[r.error] || 'خطأ';
      } catch { $('#lm').textContent = ERR.network; }
    });
    setTimeout(() => $('#pw')?.focus(), 50);
  }

  function shell() {
    root.innerHTML = `
      <div class="bar"><div class="wrap row" style="width:100%">
        <div class="t"><img src="../icons/logo.svg" alt="">لوحة التحكم</div>
        <a class="btn soft sm" href="../" target="_blank" rel="noopener">فتح التطبيق</a>
        <button class="btn soft sm" id="out">خروج</button>
      </div></div>
      <div class="wrap">
        <section class="box">
          <h2>إضافة فيديوهات</h2>
          <p class="hint">الصق رابط فيديو يوتيوب أو أكثر (كل رابط في سطر). يمكنك أيضًا مشاركة الفيديو من تطبيق يوتيوب مباشرة إلى «تحكم فُرجة» بعد تثبيت هذه الصفحة كتطبيق.</p>
          <textarea id="links" placeholder="https://youtu.be/..."></textarea>
          <label for="cat">التصنيف (اختياري)</label>
          <input type="text" id="cat" list="catlist" placeholder="مثال: علوم، قصص، رسوم">
          <datalist id="catlist"></datalist>
          <div class="row end" style="margin-top:12px"><button class="btn acc" id="fetchBtn">جلب البيانات</button></div>
          <div class="msg" id="am"></div>
          <div id="pending"></div>
        </section>
        <section class="box">
          <div class="row" style="justify-content:space-between;margin-bottom:12px">
            <h2 style="margin:0">الفيديوهات المعروضة <span class="count" id="cnt"></span></h2>
          </div>
          <input type="search" id="flt" placeholder="ابحث في القائمة">
          <div id="list" style="margin-top:8px"></div>
        </section>
        <section class="box">
          <h2>تغيير كلمة المرور</h2>
          <form id="pf">
            <input type="password" id="np" placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)" autocomplete="new-password" dir="ltr">
            <div class="row end" style="margin-top:12px"><button class="btn soft">حفظ</button></div>
            <div class="msg" id="pm"></div>
          </form>
        </section>
      </div>`;
    $('#out').onclick = () => { clearPass(); loginView(); };
    $('#fetchBtn').onclick = onFetch;
    $('#flt').oninput = (e) => { S.filter = e.target.value.trim(); drawList(); };
    $('#pf').addEventListener('submit', async (e) => {
      e.preventDefault();
      const n = $('#np').value.trim(), m = $('#pm');
      try {
        const r = await rpc('admin_change_pass', { p_pass: getPass(), p_new: n });
        if (r.ok) { setPass(n, !!localStorage.getItem(PK)); m.className = 'msg ok'; m.textContent = 'تم تغيير كلمة المرور'; $('#np').value = ''; }
        else { m.className = 'msg bad'; m.textContent = ERR[r.error] || 'خطأ'; if (r.error === 'bad') { clearPass(); loginView(ERR.bad); } }
      } catch { m.className = 'msg bad'; m.textContent = ERR.network; }
    });
  }

  function drawCats() { $('#catlist').innerHTML = cats().map((c) => `<option value="${esc(c)}">`).join(''); }

  function drawList() {
    const f = S.filter.toLowerCase();
    const vids = S.videos.filter((v) => !f || (v.title + ' ' + (v.channel || '') + ' ' + (v.category || '')).toLowerCase().includes(f));
    $('#cnt').textContent = `(${S.videos.length})`;
    $('#list').innerHTML = vids.length ? vids.map((v) => `
      <div class="item" data-vid="${v.id}">
        <div class="th"><img src="https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg" alt="" loading="lazy">${v.duration_seconds ? `<span class="dur">${fmtTime(v.duration_seconds)}</span>` : ''}</div>
        <div class="body">
          <div class="ttl">${esc(v.title)}</div>
          <div class="sub">${esc(v.channel || '')}${v.category ? `<span class="tag">${esc(v.category)}</span>` : ''}</div>
          <div class="edit" hidden>
            <input type="text" class="e-title" value="${esc(v.title)}">
            <input type="text" class="e-cat" value="${esc(v.category || '')}" list="catlist" placeholder="التصنيف">
          </div>
          <div class="row">
            <button class="btn soft sm" data-act="preview" data-yid="${v.youtube_id}">معاينة</button>
            <button class="btn soft sm" data-act="edit">تعديل</button>
            <button class="btn soft sm" data-act="save" hidden>حفظ</button>
            <button class="btn soft sm" data-act="remove">إزالة</button>
          </div>
        </div>
      </div>`).join('') : `<p class="hint" style="margin:12px 0 0">${S.videos.length ? 'لا نتائج' : 'لم تُضف أي فيديوهات بعد'}</p>`;
  }

  function drawPending() {
    const box = $('#pending');
    if (!S.pending.length) { box.innerHTML = ''; return; }
    const addable = S.pending.filter((p) => p.state === 'ready').length;
    box.innerHTML = `<div style="margin-top:12px">${S.pending.map((p, i) => {
      const info = p.info || {};
      let warn = '';
      if (p.state === 'loading') warn = '<div class="sub">جارٍ الجلب…</div>';
      if (p.error) warn = `<div class="warn">${esc(ERR[p.error] || p.error)}</div>`;
      const exists = S.videos.some((v) => v.youtube_id === p.id);
      if (exists && p.state !== 'added') warn = `<div class="warn">${ERR.duplicate}</div>`;
      return `<div class="item" data-pi="${i}">
        <div class="th"><img src="https://i.ytimg.com/vi/${p.id}/mqdefault.jpg" alt="">${p.duration ? `<span class="dur">${fmtTime(p.duration)}</span>` : ''}</div>
        <div class="body">
          ${warn}
          ${p.state === 'added' ? `<div class="ttl">${esc(p.title)}</div><div class="msg ok" style="margin:0">✓ أُضيف</div>` : p.info ? `
            <input type="text" class="p-title" value="${esc(p.title)}">
            <div class="sub">${esc(info.channel || '')}${p.duration == null && p.state === 'ready' ? ' • جارٍ حساب المدة…' : ''}</div>
            <input type="text" class="p-cat" value="${esc(p.category)}" list="catlist" placeholder="التصنيف">
            <div class="row">
              <button class="btn soft sm" data-act="preview" data-yid="${p.id}">معاينة</button>
              ${p.state === 'ready' && !exists ? '<button class="btn acc sm" data-act="add">إضافة</button>' : ''}
              <button class="btn soft sm" data-act="drop">تجاهل</button>
            </div>` : `<div class="row"><button class="btn soft sm" data-act="drop">تجاهل</button></div>`}
        </div></div>`;
    }).join('')}</div>
    ${addable > 1 ? `<div class="row end" style="margin-top:12px"><button class="btn acc" data-act="addall">إضافة الكل (${addable})</button></div>` : ''}`;
  }

  async function onFetch() {
    const text = $('#links').value;
    const ids = parseIds(text);
    const am = $('#am');
    if (!ids.length) {
      am.className = 'msg bad';
      am.textContent = /list=/.test(text) ? 'هذا رابط قائمة تشغيل — الصق روابط الفيديوهات نفسها' : 'لم أجد رابط يوتيوب صالحًا';
      return;
    }
    am.textContent = '';
    const cat = $('#cat').value.trim();
    const fresh = ids.filter((id) => !S.pending.some((p) => p.id === id));
    fresh.forEach((id) => S.pending.push({ id, state: 'loading', category: cat, title: '', duration: undefined }));
    $('#links').value = '';
    drawPending();
    await Promise.all(fresh.map(async (id) => {
      const info = await videoInfo(id);
      const p = S.pending.find((x) => x.id === id);
      if (!p) return;
      if (!info.ok) { p.state = 'error'; p.error = info.error; drawPending(); return; }
      p.info = info; p.title = info.title; p.state = 'ready';
      p.duration = info.duration_seconds ?? null;
      drawPending();
      if (p.duration == null) {
        const d = await probeDuration(id);
        p.duration = d || 0;
        drawPending();
      }
    }));
  }

  function syncPendingInputs() {
    document.querySelectorAll('[data-pi]').forEach((row) => {
      const p = S.pending[+row.dataset.pi];
      if (!p) return;
      const t = $('.p-title', row), c = $('.p-cat', row);
      if (t) p.title = t.value.trim() || p.title;
      if (c) p.category = c.value.trim();
    });
  }

  async function addPending(p) {
    const info = p.info;
    const r = await rpc('admin_add_video', {
      p_pass: getPass(), p_youtube_id: p.id, p_title: p.title || info.title,
      p_channel: info.channel || null, p_channel_url: info.channel_url || null, p_channel_avatar: info.channel_avatar || null,
      p_duration_seconds: p.duration || null, p_category: p.category || null,
    });
    if (r.ok) { p.state = 'added'; p.error = null; }
    else { p.error = r.error; if (r.error === 'bad') { clearPass(); loginView(ERR.bad); throw new Error('auth'); } }
  }

  function openPreview(yid) {
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `<div class="in"><iframe src="https://www.youtube-nocookie.com/embed/${yid}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>
      <div class="row"><button class="btn soft">إغلاق</button></div></div>`;
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('button')) m.remove(); });
    document.body.appendChild(m);
  }

  async function onClick(e) {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'preview') return openPreview(b.dataset.yid);

    const pi = b.closest('[data-pi]');
    if (pi) {
      syncPendingInputs();
      const p = S.pending[+pi.dataset.pi];
      if (act === 'drop') { S.pending.splice(+pi.dataset.pi, 1); drawPending(); return; }
      if (act === 'add') {
        b.disabled = true;
        try { await addPending(p); } catch (err) { if (err.message === 'auth') return; p.error = 'network'; }
        await reload(); drawPending();
      }
      return;
    }
    if (act === 'addall') {
      syncPendingInputs();
      b.disabled = true;
      for (const p of S.pending.filter((x) => x.state === 'ready')) {
        try { await addPending(p); } catch (err) { if (err.message === 'auth') return; p.error = 'network'; }
      }
      await reload(); drawPending();
      return;
    }

    const row = b.closest('[data-vid]');
    if (!row) return;
    const id = row.dataset.vid;
    if (act === 'edit') {
      $('.edit', row).hidden = false; b.hidden = true; $('[data-act="save"]', row).hidden = false;
      $('.e-title', row).focus();
    } else if (act === 'save') {
      b.disabled = true;
      try {
        const r = await rpc('admin_update_video', { p_pass: getPass(), p_id: id, p_title: $('.e-title', row).value, p_category: $('.e-cat', row).value });
        if (!r.ok && r.error === 'bad') { clearPass(); return loginView(ERR.bad); }
      } catch { /* ignore */ }
      await reload();
    } else if (act === 'remove') {
      if (b.dataset.confirm !== '1') {
        b.dataset.confirm = '1'; b.textContent = 'تأكيد الإزالة؟'; b.className = 'btn danger sm';
        setTimeout(() => { if (b.isConnected) { b.dataset.confirm = ''; b.textContent = 'إزالة'; b.className = 'btn soft sm'; } }, 4000);
        return;
      }
      b.disabled = true;
      try {
        const r = await rpc('admin_remove_video', { p_pass: getPass(), p_id: id });
        if (!r.ok && r.error === 'bad') { clearPass(); return loginView(ERR.bad); }
      } catch { /* ignore */ }
      await reload();
    }
  }

  async function reload() {
    try { S.videos = await listVideos(); } catch { /* keep old */ }
    drawCats(); drawList();
  }

  async function start() {
    shell();
    await reload();
    // Share target / deep link: ?url=...&text=...&title=...
    const q = new URLSearchParams(location.search);
    const shared = [q.get('url'), q.get('text'), q.get('title')].filter(Boolean).join(' ');
    if (shared) {
      history.replaceState(null, '', location.pathname);
      $('#links').value = shared;
      onFetch();
    }
  }

  async function boot() {
    const p = getPass();
    if (!p) return loginView();
    try {
      const r = await rpc('admin_verify', { p_pass: p });
      if (r.ok) return start();
      clearPass();
      loginView(ERR[r.error] || '');
    } catch {
      start(); // offline: show what we can
    }
  }

  root.addEventListener('click', onClick);
  boot();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js', { scope: '../' }).catch(() => {});
})();
