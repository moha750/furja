/* فُرجة — تطبيق مشاهدة بمحتوى مختار */
(() => {
  'use strict';
  const CFG = window.FURJA;
  const $ = (s, r = document) => r.querySelector(s);
  const view = $('#view');
  const topbar = $('#topbar');
  const bottomnav = $('#bottomnav');

  /* ---------------- icons ---------------- */
  const P = {
    home: 'M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z',
    homeO: 'M12 4.33l7 6.12V20h-4v-6H9v6H5v-9.55l7-6.12M12 3l-8 7v11h6v-6h4v6h6V10l-8-7z',
    subs: 'M10 18v-6l5 3-5 3zm7-15H7v1h10V3zm3 3H4v1h16V6zm2 3H2v12h20V9zM3 10h18v10H3V10z',
    subsF: 'M20 7H4V6h16v1zm2 2v12H2V9h20zm-7 6-5-3v6l5-3zm2-12H7v1h10V3z',
    you: 'M4 20h14v1H3V6h1v14zM21 3v15H6V3h15zm-1 1H7v13h13V4zm-9 3.5v6l5-3-5-3z',
    youF: 'M4 20h14v1H3V6h1v14zM6 3v15h15V3H6zm2.02 0h.01-.01zM11 13.5v-6l5 3-5 3z',
    search: 'M20.87 20.17l-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z',
    back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    play: 'M8 5v14l11-7z',
    pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
    replay: 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
    fwd: 'M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z',
    fs: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
    fsx: 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z',
    down: 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
    like: 'M18.77 11h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7 11H3v10h4h1h9.43c1.06 0 1.98-.67 2.19-1.61l1.34-6c.27-1.24-.78-2.39-2.19-2.39zM7 20H4v-8h3v8zm12.98-6.83-1.34 6c-.1.47-.61.83-1.21.83H8v-8.61l5.6-6.06c.19-.21.48-.33.78-.33.26 0 .5.11.63.3.07.1.15.26.09.47l-1.52 4.94-.4 1.29h5.58c.41 0 .8.17 1.03.46.13.15.26.39.19.71z',
    likeF: 'M3 11h3v10H3V11zm15.77 0h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7 11v10h10.43c1.06 0 1.98-.67 2.19-1.61l1.34-6c.27-1.24-.78-2.39-2.19-2.39z',
    save: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z',
    saveF: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z',
    history: 'M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM22 12c0 5.51-4.49 10-10 10S2 17.51 2 12h1c0 4.96 4.04 9 9 9s9-4.04 9-9-4.04-9-9-9C8.81 3 5.92 4.64 4.28 7.38c-.11.18-.22.37-.31.56L3.94 8H8v1H1.96V3h1v4.74c.04-.09.07-.17.11-.25.11-.22.23-.42.35-.63C5.22 3.86 8.51 2 12 2c5.51 0 10 4.49 10 10z',
    skip: 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z',
    close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    tv: 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zm-5-6-7 4V7z',
    off: 'M24 8.98C20.93 5.9 16.69 4 12 4S3.07 5.9 0 8.98L12 21 24 8.98zM2.92 9.07C5.51 7.08 8.67 6 12 6s6.49 1.08 9.08 3.07L12 18.17l-9.08-9.1z',
  };
  const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n]}"/></svg>`;

  /* ---------------- helpers ---------------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('furja:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('furja:' + k, JSON.stringify(v)); } catch { /* ignore */ } },
  };
  const fmtTime = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0');
  };
  function arCount(n, one, two, few, many) {
    if (n === 1) return one;
    if (n === 2) return two;
    if (n >= 3 && n <= 10) return `${n} ${few}`;
    return `${n} ${many}`;
  }
  function ago(iso) {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    const m = s / 60, h = m / 60, d = h / 24, w = d / 7, mo = d / 30, y = d / 365;
    if (m < 1) return 'الآن';
    if (h < 1) return 'منذ ' + arCount(Math.floor(m), 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة');
    if (d < 1) return 'منذ ' + arCount(Math.floor(h), 'ساعة', 'ساعتين', 'ساعات', 'ساعة');
    if (w < 1) return 'منذ ' + arCount(Math.floor(d), 'يوم', 'يومين', 'أيام', 'يومًا');
    if (mo < 1) return 'منذ ' + arCount(Math.floor(w), 'أسبوع', 'أسبوعين', 'أسابيع', 'أسبوعًا');
    if (y < 1) return 'منذ ' + arCount(Math.floor(mo), 'شهر', 'شهرين', 'أشهر', 'شهرًا');
    return 'منذ ' + arCount(Math.floor(y), 'سنة', 'سنتين', 'سنوات', 'سنة');
  }
  const countVideos = (n) => (n === 1 ? 'فيديو واحد' : n === 2 ? 'فيديوهان' : n <= 10 ? `${n} فيديوهات` : `${n} فيديو`);
  const normalize = (s) => String(s || '').toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
  const COLORS = ['#e8590c', '#1971c2', '#2f9e44', '#9c36b5', '#c2255c', '#0c8599', '#f08c00', '#5f3dc4'];
  const colorFor = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COLORS[h % COLORS.length]; };
  const thumb = (id, q = 'hqdefault') => `https://i.ytimg.com/vi/${id}/${q}.jpg`;

  function avatar(v, cls = '') {
    const name = v.channel || 'ف';
    if (v.channel_avatar) return `<div class="av ${cls}"><img src="${esc(v.channel_avatar)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"></div>`;
    return `<div class="av ${cls}" style="background:${colorFor(name)}">${esc([...name.trim()][0] || 'ف')}</div>`;
  }

  /* ---------------- data ---------------- */
  const S = {
    videos: store.get('cache', []),
    loaded: false,
    error: false,
    lastFetch: 0,
    chip: 'all',
    hist: store.get('hist', []), // [{id, t, d, at}]
    liked: store.get('liked', []),
    later: store.get('later', []),
    searches: store.get('searches', []),
  };
  const byYid = (id) => S.videos.find((v) => v.youtube_id === id);
  const histOf = (id) => S.hist.find((h) => h.id === id);

  async function fetchVideos() {
    try {
      const r = await fetch(`${CFG.url}/rest/v1/videos?select=id,youtube_id,title,channel,channel_avatar,duration_seconds,category,created_at&order=created_at.desc`, {
        headers: { apikey: CFG.key },
        cache: 'no-store',
      });
      if (!r.ok) throw new Error(r.status);
      S.videos = await r.json();
      S.error = false;
      store.set('cache', S.videos);
    } catch {
      S.error = true;
    }
    S.loaded = true;
    S.lastFetch = Date.now();
  }

  function saveProgress(id, t, d) {
    if (!id || !d) return;
    S.hist = S.hist.filter((h) => h.id !== id);
    S.hist.unshift({ id, t: Math.floor(t), d: Math.floor(d), at: Date.now() });
    S.hist = S.hist.slice(0, 300);
    store.set('hist', S.hist);
  }
  function toggleList(key, id) {
    const arr = S[key];
    const i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1); else arr.unshift(id);
    store.set(key, arr);
    return i < 0;
  }

  /* ---------------- shared UI ---------------- */
  function card(v) {
    const h = histOf(v.youtube_id);
    const pct = h && h.d ? Math.min(100, (h.t / h.d) * 100) : 0;
    const d = v.duration_seconds || (h && h.d);
    return `<a class="card" href="#/watch/${v.youtube_id}">
      <div class="thumb">
        <img src="${thumb(v.youtube_id)}" alt="" loading="lazy" draggable="false">
        ${d ? `<span class="dur">${fmtTime(d)}</span>` : ''}
        ${pct > 2 ? `<div class="wbar"><i style="width:${pct}%"></i></div>` : ''}
      </div>
      <div class="meta">
        ${avatar(v)}
        <div class="txt"><h3>${esc(v.title)}</h3><p>${esc(v.channel || '')}${v.channel ? ' • ' : ''}${ago(v.created_at)}</p></div>
      </div>
    </a>`;
  }
  function mini(v) {
    const h = histOf(v.youtube_id);
    const pct = h && h.d ? Math.min(100, (h.t / h.d) * 100) : 0;
    const d = v.duration_seconds || (h && h.d);
    return `<a class="mini" href="#/watch/${v.youtube_id}">
      <div class="thumb"><img src="${thumb(v.youtube_id, 'mqdefault')}" alt="" loading="lazy" draggable="false">
        ${d ? `<span class="dur">${fmtTime(d)}</span>` : ''}
        ${pct > 2 ? `<div class="wbar"><i style="width:${pct}%"></i></div>` : ''}</div>
      <h3>${esc(v.title)}</h3><p>${esc(v.channel || '')}</p></a>`;
  }
  const skeleton = (n = 4) => `<div class="feed">${Array.from({ length: n }, () => `<div class="card sk"><div class="thumb"></div><div class="meta"><div class="av" style="background:var(--skeleton)"></div><div class="txt"><div class="sk-line" style="width:90%"></div><div class="sk-line" style="width:55%"></div></div></div></div>`).join('')}</div>`;
  const empty = (title, sub, icon = 'tv', retry = false) =>
    `<div class="empty">${ic(icon)}<b>${esc(title)}</b>${esc(sub || '')}${retry ? '<br><button class="retry" data-retry>إعادة المحاولة</button>' : ''}</div>`;

  function renderTopbar(mode) {
    if (mode === 'search') return; // search view owns the bar
    topbar.innerHTML = `
      <a class="logo" href="#/"><img src="icons/logo.svg" alt=""><span>${esc(CFG.name)}</span></a>
      <div class="spacer"></div>
      <a class="icon-btn" href="#/search" aria-label="بحث">${ic('search')}</a>`;
  }
  function renderNav(active) {
    const item = (href, key, on, off, label) =>
      `<a href="${href}" class="${active === key ? 'on' : ''}">${ic(active === key ? on : off)}<span>${label}</span></a>`;
    bottomnav.innerHTML =
      item('#/', 'home', 'home', 'homeO', 'الرئيسية') +
      item('#/subs', 'subs', 'subsF', 'subs', 'القنوات') +
      item('#/you', 'you', 'youF', 'you', 'أنت');
  }

  function channels() {
    const map = new Map();
    for (const v of S.videos) {
      if (!v.channel) continue;
      const c = map.get(v.channel) || { name: v.channel, avatar: v.channel_avatar, count: 0, latest: v.created_at };
      c.count++;
      if (!c.avatar && v.channel_avatar) c.avatar = v.channel_avatar;
      map.set(v.channel, c);
    }
    return [...map.values()].sort((a, b) => (a.latest < b.latest ? 1 : -1));
  }

  /* ---------------- views ---------------- */
  function viewHome() {
    renderTopbar(); renderNav('home');
    if (!S.loaded && !S.videos.length) { view.innerHTML = skeleton(); return; }
    if (!S.videos.length) {
      view.innerHTML = S.error ? empty('لا يوجد اتصال', 'تأكد من الإنترنت ثم أعد المحاولة', 'off', true) : empty('لا توجد فيديوهات بعد', 'ستظهر هنا الفيديوهات حين تُضاف');
      return;
    }
    const cats = [];
    const counts = {};
    for (const v of S.videos) if (v.category) counts[v.category] = (counts[v.category] || 0) + 1;
    Object.keys(counts).sort((a, b) => counts[b] - counts[a]).forEach((c) => cats.push(c));
    const watched = new Set(S.hist.map((h) => h.id));
    const hasNew = S.videos.some((v) => !watched.has(v.youtube_id));
    const chips = [['all', 'الكل'], ...cats.map((c) => [c, c])];
    if (hasNew && watched.size) chips.push(['new', 'جديد بالنسبة إليك']);
    if (watched.size) chips.push(['watched', 'شوهد']);
    if (!chips.some(([k]) => k === S.chip)) S.chip = 'all';

    let list = S.videos;
    if (S.chip === 'new') list = list.filter((v) => !watched.has(v.youtube_id));
    else if (S.chip === 'watched') list = list.filter((v) => watched.has(v.youtube_id));
    else if (S.chip !== 'all') list = list.filter((v) => v.category === S.chip);

    view.innerHTML = `<div class="chips">${chips.map(([k, l]) => `<button class="chip ${S.chip === k ? 'on' : ''}" data-chip="${esc(k)}">${esc(l)}</button>`).join('')}</div>
      <div class="feed">${list.map(card).join('')}</div>`;
  }

  function viewSubs() {
    renderTopbar(); renderNav('subs');
    if (!S.videos.length) { view.innerHTML = S.loaded ? empty('لا توجد قنوات بعد', '') : skeleton(); return; }
    const ch = channels();
    view.innerHTML = `<div class="subs-row">${ch.map((c) => `<a href="#/channel/${encodeURIComponent(c.name)}">${avatar({ channel: c.name, channel_avatar: c.avatar })}<span>${esc(c.name)}</span></a>`).join('')}</div>
      <div class="feed">${S.videos.map(card).join('')}</div>`;
  }

  function viewChannel(name) {
    renderTopbar(); renderNav('subs');
    const list = S.videos.filter((v) => v.channel === name);
    const av = list.find((v) => v.channel_avatar)?.channel_avatar;
    view.innerHTML = `<div class="chan-head">${avatar({ channel: name, channel_avatar: av })}<h2>${esc(name)}</h2><p>${countVideos(list.length)}</p></div>
      <div class="feed">${list.map(card).join('')}</div>`;
  }

  function viewYou() {
    renderTopbar(); renderNav('you');
    const sec = (title, key, ids) => {
      const vids = ids.map(byYid).filter(Boolean);
      if (!vids.length) return '';
      return `<section class="sec"><div class="sec-h"><h2>${title}</h2><a href="#/list/${key}">عرض الكل</a></div>
        <div class="hscroll">${vids.slice(0, 12).map(mini).join('')}</div></section>`;
    };
    const html = sec('السجل', 'hist', S.hist.map((h) => h.id)) + sec('مشاهدة لاحقًا', 'later', S.later) + sec('الفيديوهات التي أعجبتني', 'liked', S.liked);
    view.innerHTML = html || empty('لا شيء هنا بعد', 'الفيديوهات التي تشاهدها أو تحفظها أو تعجبك ستظهر هنا', 'history');
  }

  function viewList(key) {
    renderTopbar(); renderNav('you');
    const titles = { hist: 'السجل', later: 'مشاهدة لاحقًا', liked: 'الفيديوهات التي أعجبتني' };
    const ids = key === 'hist' ? S.hist.map((h) => h.id) : S[key] || [];
    const vids = ids.map(byYid).filter(Boolean);
    view.innerHTML = `<h1 class="page-title">${titles[key] || ''}</h1>` + (vids.length ? `<div class="feed">${vids.map(card).join('')}</div>` : empty('القائمة فارغة', ''));
  }

  function viewSearch(q) {
    renderNav('home');
    topbar.innerHTML = `<a class="icon-btn" href="#/" aria-label="رجوع">${ic('back', 'flip-rtl')}</a>
      <form class="searchbar" id="sform"><input id="sq" type="search" enterkeyhint="search" placeholder="ابحث في ${esc(CFG.name)}" value="${esc(q)}" autocomplete="off"></form>`;
    const input = $('#sq');
    const draw = () => {
      const term = normalize(input.value.trim());
      if (!term) {
        view.innerHTML = S.searches.map((s) => `<a class="recent" href="#/search/${encodeURIComponent(s)}">${ic('history')}<span>${esc(s)}</span></a>`).join('');
        return;
      }
      const words = term.split(/\s+/);
      const res = S.videos.filter((v) => { const hay = normalize(v.title + ' ' + (v.channel || '') + ' ' + (v.category || '')); return words.every((w) => hay.includes(w)); });
      view.innerHTML = res.length ? `<div class="feed" style="padding-top:8px">${res.map(card).join('')}</div>` : empty('لا توجد نتائج', 'جرّب كلمة أخرى', 'search');
    };
    input.addEventListener('input', draw);
    $('#sform').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (v) { S.searches = [v, ...S.searches.filter((s) => s !== v)].slice(0, 12); store.set('searches', S.searches); }
      input.blur();
    });
    draw();
    if (!q) setTimeout(() => input.focus(), 50);
  }

  function upNext(v) {
    const rest = S.videos.filter((x) => x.youtube_id !== v.youtube_id);
    const same = rest.filter((x) => v.category && x.category === v.category);
    const sameCh = rest.filter((x) => !same.includes(x) && v.channel && x.channel === v.channel);
    const others = rest.filter((x) => !same.includes(x) && !sameCh.includes(x));
    const watched = new Set(S.hist.map((h) => h.id));
    const unseenFirst = (arr) => [...arr.filter((x) => !watched.has(x.youtube_id)), ...arr.filter((x) => watched.has(x.youtube_id))];
    return [...unseenFirst(same), ...unseenFirst(sameCh), ...unseenFirst(others)];
  }

  function viewWatch(id) {
    let v = byYid(id);
    if (!v) {
      if (!S.loaded) { view.innerHTML = skeleton(1); return; }
      Player.destroy();
      document.body.classList.remove('watching');
      renderTopbar(); renderNav('home');
      view.innerHTML = empty('هذا الفيديو غير متاح', 'ربما حُذف من القائمة');
      return;
    }
    document.body.classList.add('watching');
    renderTopbar();
    let layout = $('.watch-layout', view);
    if (!layout) {
      view.innerHTML = `<div class="watch-layout"><div class="watch-main"><div class="watch-player" id="pslot"></div><div id="winfo"></div></div><div class="watch-side" id="wside"></div></div>`;
      layout = $('.watch-layout', view);
    }
    const next = upNext(v);
    const liked = S.liked.includes(id), later = S.later.includes(id);
    const chCount = S.videos.filter((x) => x.channel && x.channel === v.channel).length;
    $('#winfo').innerHTML = `<div class="winfo">
        <h1 class="wtitle">${esc(v.title)}</h1>
        <div class="wsub">${ago(v.created_at)}${v.category ? ' • ' + esc(v.category) : ''}</div>
        ${v.channel ? `<a class="chan-row" href="#/channel/${encodeURIComponent(v.channel)}">${avatar(v)}<div><div class="name">${esc(v.channel)}</div><div class="count">${countVideos(chCount)}</div></div></a>` : '<div style="height:12px"></div>'}
        <div class="actions">
          <button class="pill ${liked ? 'on' : ''}" data-like="${id}">${ic(liked ? 'likeF' : 'like')}<span>${liked ? 'أعجبني' : 'إعجاب'}</span></button>
          <button class="pill ${later ? 'on' : ''}" data-later="${id}">${ic(later ? 'saveF' : 'save')}<span>${later ? 'محفوظ' : 'حفظ'}</span></button>
        </div>
      </div>`;
    $('#wside').innerHTML = next.length ? `<div class="upnext-title">التالي</div>${next.map(card).join('')}` : '';
    const changed = !Player.v || Player.v.youtube_id !== id;
    Player.open($('#pslot'), v, next[0]);
    if (changed) window.scrollTo(0, 0);
  }

  /* ---------------- player ---------------- */
  let ytApi;
  function loadYT() {
    if (ytApi) return ytApi;
    ytApi = new Promise((res, rej) => {
      if (window.YT && window.YT.Player) return res(window.YT);
      window.onYouTubeIframeAPIReady = () => res(window.YT);
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = () => { ytApi = null; rej(new Error('yt')); };
      document.head.appendChild(s);
    });
    return ytApi;
  }

  const Player = {
    yt: null, el: null, v: null, next: null, state: -1, started: false, hideT: 0, tick: 0, saveT: 0,
    dragging: false, endT: 0, lastTap: { t: 0, side: '' }, readyP: null,

    build() {
      const el = document.createElement('div');
      el.className = 'player loading';
      el.dir = 'ltr';
      el.innerHTML = `
        <div class="yt"><div id="ytf"></div></div>
        <div class="poster"></div>
        <div class="shield"></div>
        <div class="spin"></div>
        <div class="ripple l"></div><div class="ripple r"></div>
        <div class="ctrls">
          <div class="ctrl-top"><button class="cbtn" data-a="min" aria-label="تصغير">${ic('down')}</button></div>
          <div class="ctrl-mid">
            <button class="cbtn seek" data-a="back" aria-label="رجوع 10 ثوانٍ">${ic('replay')}<span>10</span></button>
            <button class="cbtn big" data-a="toggle" aria-label="تشغيل">${ic('play')}</button>
            <button class="cbtn seek" data-a="fwd" aria-label="تقديم 10 ثوانٍ">${ic('fwd')}<span>10</span></button>
          </div>
          <div class="ctrl-bot"><div class="time"><b class="cur">0:00</b> <i>/ <span class="tot">0:00</span></i></div>
            <button class="cbtn" data-a="fs" aria-label="ملء الشاشة">${ic('fs')}</button></div>
        </div>
        <div class="prog"><div class="rail"></div><div class="buf"></div><div class="fill"></div><div class="knob"></div></div>
        <div class="endscreen"></div>
        <div class="err"><div>تعذّر تشغيل هذا الفيديو</div><button class="eb ghost" data-a="skip" style="height:36px;padding:0 16px;border-radius:18px;background:rgba(255,255,255,.2);font-weight:600">تخطَّ إلى التالي</button></div>`;
      this.el = el;
      this.bind();
      return el;
    },

    async open(slot, v, next) {
      this.next = next || null;
      const resume = histOf(v.youtube_id);
      const start = resume && resume.d && resume.t > 15 && resume.t < resume.d - 15 ? resume.t : 0;
      if (this.v && this.v.youtube_id === v.youtube_id && this.el && slot.contains(this.el)) return;
      this.persist();
      this.v = v;
      if (!this.el) this.build();
      if (!slot.contains(this.el)) slot.appendChild(this.el);
      const el = this.el;
      el.classList.remove('ended', 'error', 'playing', 'show');
      el.classList.add('loading');
      clearInterval(this.endT);
      $('.poster', el).style.backgroundImage = `url(${thumb(v.youtube_id, 'hqdefault')})`;
      this.started = false;
      this.setIcon();
      this.updateBar(0, v.duration_seconds || 0, 0);

      let YT;
      try { YT = await loadYT(); } catch { this.fail(); return; }
      if (this.v !== v) return;
      if (this.yt) {
        await this.readyP;
        if (this.v !== v) return;
        this.yt.loadVideoById({ videoId: v.youtube_id, startSeconds: start });
      } else {
        this.readyP = new Promise((res) => {
          this.yt = new YT.Player('ytf', {
            host: 'https://www.youtube-nocookie.com',
            videoId: v.youtube_id,
            width: '100%', height: '100%',
            playerVars: {
              autoplay: 1, controls: 0, rel: 0, playsinline: 1, iv_load_policy: 3, modestbranding: 1,
              disablekb: 1, fs: 0, cc_load_policy: 0, start: Math.floor(start), origin: location.origin,
            },
            events: {
              onReady: (e) => { e.target.playVideo(); res(); },
              onStateChange: (e) => this.onState(e.data),
              onError: (e) => { console.warn('yt-error', e.data); this.fail(); },
            },
          });
        });
      }
      clearTimeout(this.autoT);
      this.autoT = setTimeout(() => { if (!this.started && this.v === v) { this.el.classList.remove('loading'); this.showCtrls(true); } }, 2500);
      clearInterval(this.tick);
      this.tick = setInterval(() => this.poll(), 250);
    },

    onState(s) {
      const el = this.el; if (!el) return;
      this.state = s;
      if (s === 1) { // playing
        this.started = true;
        el.classList.add('playing'); el.classList.remove('loading', 'ended', 'error');
        this.scheduleHide();
      } else if (s === 3) { // buffering
        if (this.started) el.classList.add('loading');
      } else if (s === 2) { // paused
        el.classList.remove('playing', 'loading');
        this.showCtrls(true);
        this.persist();
      } else if (s === 0) { // ended
        el.classList.remove('playing', 'loading');
        const d = this.yt.getDuration();
        if (this.v) saveProgress(this.v.youtube_id, d, d); // watched fully → full bar, restarts from 0
        this.showEnd();
      } else if (s === 5 || s === -1) {
        if (!this.started) { /* waiting for autoplay */ }
      }
      this.setIcon();
    },

    poll() {
      if (!this.yt || !this.yt.getCurrentTime || this.dragging) return;
      const t = this.yt.getCurrentTime() || 0, d = this.yt.getDuration() || 0;
      const b = this.yt.getVideoLoadedFraction ? this.yt.getVideoLoadedFraction() : 0;
      this.updateBar(t, d, b);
      if (this.state === 1 && Date.now() - this.saveT > 5000) { this.saveT = Date.now(); this.persist(); }
    },

    updateBar(t, d, b) {
      const el = this.el; if (!el) return;
      const p = d ? Math.min(1, t / d) : 0;
      $('.fill', el).style.width = p * 100 + '%';
      $('.knob', el).style.left = p * 100 + '%';
      $('.buf', el).style.width = (b || 0) * 100 + '%';
      $('.cur', el).textContent = fmtTime(t);
      $('.tot', el).textContent = fmtTime(d);
    },

    persist() {
      if (!this.yt || !this.v || !this.yt.getCurrentTime || !this.started) return;
      const t = this.yt.getCurrentTime(), d = this.yt.getDuration();
      if (d && this.state !== 0) saveProgress(this.v.youtube_id, t, d);
    },

    setIcon() {
      if (!this.el) return;
      const playing = this.state === 1 || this.state === 3;
      const b = $('[data-a="toggle"]', this.el);
      b.innerHTML = ic(playing ? 'pause' : 'play');
      b.setAttribute('aria-label', playing ? 'إيقاف مؤقت' : 'تشغيل');
      const fs = $('[data-a="fs"]', this.el);
      if (fs) fs.innerHTML = ic(document.fullscreenElement ? 'fsx' : 'fs');
    },

    showCtrls(stay) {
      this.el.classList.add('show');
      if (!stay) this.scheduleHide(); else clearTimeout(this.hideT);
    },
    scheduleHide() {
      clearTimeout(this.hideT);
      this.hideT = setTimeout(() => { if (this.state === 1 && !this.dragging) this.el.classList.remove('show'); }, 3000);
    },

    toggle() {
      if (!this.yt || !this.yt.getPlayerState) return;
      if (this.el.classList.contains('ended')) return this.replay();
      const s = this.yt.getPlayerState();
      if (s === 1 || s === 3) this.yt.pauseVideo(); else { this.yt.playVideo(); this.el.classList.add('loading'); }
    },
    seekBy(dx) {
      if (!this.yt || !this.yt.getCurrentTime) return;
      const t = Math.max(0, Math.min(this.yt.getDuration() - 0.5, this.yt.getCurrentTime() + dx));
      this.yt.seekTo(t, true);
      this.updateBar(t, this.yt.getDuration(), this.yt.getVideoLoadedFraction());
    },
    replay() {
      clearInterval(this.endT);
      this.el.classList.remove('ended');
      this.yt.seekTo(0, true); this.yt.playVideo();
    },
    async fullscreen() {
      const el = this.el;
      try {
        if (document.fullscreenElement) { await document.exitFullscreen(); }
        else {
          await el.requestFullscreen({ navigationUI: 'hide' });
          try { await screen.orientation.lock('landscape'); } catch { /* not supported */ }
        }
      } catch { /* ignore */ }
    },
    fail() {
      if (!this.el) return;
      this.el.classList.remove('loading', 'playing');
      this.el.classList.add('error');
    },
    goNext() {
      clearInterval(this.endT);
      if (this.next) location.hash = '#/watch/' + this.next.youtube_id;
    },
    showEnd() {
      const el = this.el, n = this.next;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      const box = $('.endscreen', el);
      if (!n) {
        box.innerHTML = `<div><div class="row"><button class="eb primary" data-a="replay">إعادة المشاهدة</button></div></div>`;
        el.classList.add('ended');
        return;
      }
      let left = 8;
      const C = 163.4;
      box.innerHTML = `<div>
        <div class="up">التالي خلال <b class="cd">${left}</b></div>
        <div class="ring"><svg viewBox="0 0 56 56"><circle class="bg" cx="28" cy="28" r="26"/><circle class="fg" cx="28" cy="28" r="26" style="stroke-dashoffset:${C}"/></svg>
          <button data-a="next" aria-label="تشغيل التالي">${ic('skip')}</button></div>
        <div class="nt">${esc(n.title)}</div>
        <div class="row"><button class="eb ghost" data-a="cancel">إلغاء</button><button class="eb primary" data-a="next">تشغيل الآن</button></div></div>`;
      el.classList.add('ended');
      const fg = $('.fg', box), cd = $('.cd', box);
      requestAnimationFrame(() => { fg.style.strokeDashoffset = C * (left - 1) / 8; });
      this.endT = setInterval(() => {
        left--;
        if (cd) cd.textContent = left;
        fg.style.strokeDashoffset = C * Math.max(0, left - 1) / 8;
        if (left <= 0) this.goNext();
      }, 1000);
    },

    bind() {
      const el = this.el;
      const shield = $('.shield', el);
      shield.addEventListener('click', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const side = x < 0.35 ? 'l' : x > 0.65 ? 'r' : 'c';
        const now = Date.now();
        if (side !== 'c' && this.started && now - this.lastTap.t < 320 && this.lastTap.side === side) {
          this.seekBy(side === 'r' ? 10 : -10);
          const rp = $('.ripple.' + side, el);
          rp.innerHTML = `${ic(side === 'r' ? 'fwd' : 'replay')}<span>${side === 'r' ? '+' : '-'}10 ثوانٍ</span>`;
          rp.classList.add('on'); clearTimeout(rp._t); rp._t = setTimeout(() => rp.classList.remove('on'), 500);
          el.classList.toggle('show', this.lastTap.wasShown);
          this.lastTap = { t: 0, side: '' };
          return;
        }
        const wasShown = el.classList.contains('show');
        this.lastTap = { t: now, side, wasShown };
        if (!this.started) { this.toggle(); return; }
        if (wasShown && this.state === 1) el.classList.remove('show'); else this.showCtrls(this.state !== 1);
      });
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        e.stopPropagation();
        const a = b.dataset.a;
        if (a === 'toggle') this.toggle();
        else if (a === 'back') this.seekBy(-10);
        else if (a === 'fwd') this.seekBy(10);
        else if (a === 'fs') this.fullscreen();
        else if (a === 'min') { if (document.fullscreenElement) document.exitFullscreen(); else if (history.length > 1) history.back(); else location.hash = '#/'; }
        else if (a === 'next' || a === 'skip') this.goNext();
        else if (a === 'cancel') { clearInterval(this.endT); $('.endscreen', el).innerHTML = `<div class="row"><button class="eb primary" data-a="replay">${ic('replay')}</button></div>`; }
        else if (a === 'replay') this.replay();
        if (this.state === 1) this.scheduleHide();
      });
      // progress scrubbing
      const prog = $('.prog', el);
      const fracAt = (cx) => { const r = prog.getBoundingClientRect(); return Math.max(0, Math.min(1, (cx - r.left) / r.width)); };
      prog.addEventListener('pointerdown', (e) => {
        if (!el.classList.contains('show') || !this.yt || !this.yt.getDuration) { this.showCtrls(); return; }
        this.dragging = true; el.classList.add('dragging');
        prog.setPointerCapture(e.pointerId);
        const d = this.yt.getDuration();
        this.updateBar(fracAt(e.clientX) * d, d, this.yt.getVideoLoadedFraction());
      });
      prog.addEventListener('pointermove', (e) => {
        if (!this.dragging) return;
        const d = this.yt.getDuration();
        this.updateBar(fracAt(e.clientX) * d, d, this.yt.getVideoLoadedFraction());
      });
      const end = (e) => {
        if (!this.dragging) return;
        this.dragging = false; el.classList.remove('dragging');
        const d = this.yt.getDuration();
        this.yt.seekTo(fracAt(e.clientX) * d, true);
        this.scheduleHide();
      };
      prog.addEventListener('pointerup', end);
      prog.addEventListener('pointercancel', end);
      document.addEventListener('fullscreenchange', () => {
        this.setIcon();
        if (!document.fullscreenElement) { try { screen.orientation.unlock(); } catch { /* ignore */ } }
      });
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    },

    destroy() {
      this.persist();
      clearInterval(this.tick); clearInterval(this.endT); clearTimeout(this.hideT); clearTimeout(this.autoT);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (this.yt && this.yt.destroy) { try { this.yt.destroy(); } catch { /* ignore */ } }
      this.yt = null; this.v = null; this.state = -1; this.started = false;
      if (this.el) this.el.remove();
      this.el = null;
    },
  };

  /* ---------------- router ---------------- */
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const [name, ...rest] = h.split('/');
    const arg = rest.join('/');
    if (name !== 'watch') {
      Player.destroy();
      document.body.classList.remove('watching');
    }
    if (name === 'watch') return viewWatch(arg);
    window.scrollTo(0, 0);
    if (name === 'search') return viewSearch(arg);
    if (name === 'subs') return viewSubs();
    if (name === 'channel') return viewChannel(arg);
    if (name === 'you') return viewYou();
    if (name === 'list') return viewList(arg);
    return viewHome();
  }

  view.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-chip]');
    if (chip) { S.chip = chip.dataset.chip; const y = window.scrollY; viewHome(); window.scrollTo(0, Math.min(y, 0)); return; }
    const like = e.target.closest('[data-like]');
    if (like) { toggleList('liked', like.dataset.like); refreshWatchInfo(); return; }
    const later = e.target.closest('[data-later]');
    if (later) { toggleList('later', later.dataset.later); refreshWatchInfo(); return; }
    if (e.target.closest('[data-retry]')) { refresh(true); }
  });
  function refreshWatchInfo() {
    const id = location.hash.split('/')[2];
    if (id) viewWatch(id);
  }
  document.addEventListener('contextmenu', (e) => { if (e.target.closest('a, img')) e.preventDefault(); });

  async function refresh(force) {
    if (!force && Date.now() - S.lastFetch < 60000) return;
    const before = JSON.stringify(S.videos.map((v) => v.id + v.title + v.category));
    await fetchVideos();
    const after = JSON.stringify(S.videos.map((v) => v.id + v.title + v.category));
    const onWatch = location.hash.startsWith('#/watch/');
    if (before !== after || force || !onWatch) {
      if (onWatch) refreshWatchInfo(); else route();
    }
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('pagehide', () => Player.persist());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) Player.persist(); else refresh(false);
  });

  route();
  refresh(true);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
