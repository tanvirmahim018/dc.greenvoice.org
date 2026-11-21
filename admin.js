/* Green Voice – Admin Panel (loaded only when someone opens the gear icon or #admin) */
(function () {
  'use strict';
  const G = window.GV;
  if (!G || window.GVAdmin) return;
  const esc = G.esc, toB = G.toB;
  const $ = (s, r) => (r || document).querySelector(s);

  /* ------------------------------------------------------------------ */
  /*  Constants                                                          */
  /* ------------------------------------------------------------------ */
  const SKEY = 'gv_session';
  const IMG = /img|photo|logo/i;
  const LONG = new Set(['body', 'intro', 'sub', 'ops1', 'ops2', 'text']);
  const LBL = {
    email: 'ইমেইল', phone: 'ফোন', address: 'ঠিকানা', facebook: 'ফেসবুক লিংক', apply: 'আবেদনের লিংক', logo: 'লোগো',
    badge: 'ব্যাজ (ওপরের ছোট লেখা)', line1: 'শিরোনাম – লাইন ১', hl: 'শিরোনাম – হাইলাইট (সবুজ অংশ)', line2: 'শিরোনাম – লাইন ২', sub: 'উপশিরোনাম',
    cta1: 'প্রথম বাটনের লেখা', cta2: 'দ্বিতীয় বাটনের লেখা', chipA: 'ভাসমান কার্ড – ছোট লেখা', chipB: 'ভাসমান কার্ড – বড় লেখা', chipC: 'ভাসমান ট্যাগ',
    img: 'ছবি', tag: 'ট্যাগ', title: 'শিরোনাম', meta: 'বিবরণ / স্থান', date: 'তারিখ (লেখা)', iso: 'কাউন্টডাউনের তারিখ ও সময়', label: 'বাটনের লেখা', url: 'লিংক',
    introTag: 'ট্যাগ', intro: 'পরিচিতি', introImg: 'ছবি', opsTag: 'কার্যক্রম – ট্যাগ', ops1h: 'প্রথম কার্যক্রম – শিরোনাম', ops1: 'প্রথম কার্যক্রম – বিবরণ',
    ops2h: 'দ্বিতীয় কার্যক্রম – শিরোনাম', ops2: 'দ্বিতীয় কার্যক্রম – বিবরণ', goalsTag: 'লক্ষ্য – ট্যাগ', goals: 'লক্ষ্যসমূহ',
    n: 'সংখ্যা', name: 'নাম', role: 'পদবি', text: 'লেখা', eyebrow: 'ছোট ট্যাগ (শিরোনামের ওপরে)', body: 'লেখা (নতুন লাইনে নতুন অনুচ্ছেদ)', btnLabel: 'বাটনের লেখা',
    btnUrl: 'বাটনের লিংক', side: 'ছবি কোন পাশে', caption: 'ছবির নিচের লেখা', items: 'আইটেম', site: 'সাধারণ তথ্য', hero: 'হিরো', ticker: 'টিকার', event: 'ইভেন্ট',
    notices: 'নোটিশ', about: 'পরিচিতি', activities: 'কার্যক্রম', steps: 'ধাপ', stats: 'পরিসংখ্যান', committee: 'কমিটি',
  };
  const TPL = {
    notices: { tag: '', title: '', date: '', label: 'PDF ↓', url: '#' }, activities: { title: '', img: '' },
    committee: { name: '', role: '', img: '' }, stats: { n: '', label: '' },
  };
  const ITPL = { cards: { img: '', title: '', text: '', url: '' }, gallery: { img: '', caption: '' } };
  const SEC_TYPES = {
    text: { icon: '📝', name: 'লেখা', desc: 'শিরোনাম, অনুচ্ছেদ ও ঐচ্ছিক বাটন',
      make: () => ({ eyebrow: '', title: 'নতুন সেকশন', body: 'এখানে আপনার লেখা লিখুন।', btnLabel: '', btnUrl: '' }) },
    imgtext: { icon: '🖼️', name: 'ছবি + লেখা', desc: 'একপাশে ছবি, অন্যপাশে লেখা',
      make: () => ({ eyebrow: '', title: 'শিরোনাম', body: 'এখানে বিবরণ লিখুন।', img: '', side: 'left', btnLabel: '', btnUrl: '' }) },
    cards: { icon: '🗂️', name: 'কার্ড গ্রিড', desc: 'ছবি-শিরোনাম-লেখাসহ একাধিক কার্ড',
      make: () => ({ eyebrow: '', title: 'কার্ড সেকশন', items: [{ img: '', title: 'কার্ড ১', text: 'সংক্ষিপ্ত বিবরণ', url: '' }, { img: '', title: 'কার্ড ২', text: 'সংক্ষিপ্ত বিবরণ', url: '' }] }) },
    gallery: { icon: '📷', name: 'ছবির গ্যালারি', desc: 'অনেকগুলো ছবি পাশাপাশি',
      make: () => ({ eyebrow: 'গ্যালারি', title: 'আমাদের মুহূর্ত', items: [{ img: '', caption: '' }] }) },
    cta: { icon: '📣', name: 'ব্যানার (আহ্বান)', desc: 'বড় আহ্বান ও বাটন',
      make: () => ({ title: 'আমাদের সাথে যুক্ত হোন', body: 'আজই আবেদন করুন।', btnLabel: 'যোগ দিন', btnUrl: '#' }) },
    video: { icon: '🎬', name: 'ভিডিও', desc: 'ইউটিউব ভিডিও এম্বেড',
      make: () => ({ eyebrow: '', title: 'ভিডিও', url: '', body: '' }) },
  };
  const BUILT_NAMES = { home: 'হিরো ও টিকার', notice: 'নোটিশ বোর্ড (ইভেন্ট ও নোটিশ)', about: 'আমাদের সম্পর্কে', activities: 'কার্যক্রম', join: 'যুক্ত হোন ও পরিসংখ্যান', committee: 'কমিটি' };
  const EDIT_MAP = { home: 'hero', notice: 'event', about: 'about', activities: 'activities', join: 'steps', committee: 'committee' };
  const TITLES = {
    site: ['সাধারণ তথ্য', 'ইমেইল, ফোন, ঠিকানা, লিংক ও লোগো'], hero: ['হিরো (প্রথম স্ক্রিন)', 'ওয়েবসাইটের একদম ওপরের বড় অংশ'], ticker: ['টিকার', 'সবুজ স্ক্রলিং বারের লেখাগুলো'],
    event: ['ইভেন্ট', 'নোটিশ বোর্ডের বড় ইভেন্ট কার্ড ও কাউন্টডাউন'], notices: ['নোটিশ', 'নোটিশ বোর্ডের তালিকা'], about: ['পরিচিতি', 'আমাদের সম্পর্কে অংশ'],
    activities: ['কার্যক্রম', 'কার্যক্রমের ছবিসহ কার্ড'], steps: ['যুক্ত হওয়ার ধাপ', '“সহজ ধাপে যুক্ত হোন” অংশ'], stats: ['পরিসংখ্যান', 'সংখ্যাগুলো (যেমন ৩০০+ সদস্য)'], committee: ['কমিটি', 'আহ্বায়ক কমিটির সদস্য'],
  };
  const CONTENT = Object.keys(TITLES);
  const NAV = [
    ['dash', '🏠', 'ড্যাশবোর্ড'], ['sections', '🧩', 'সেকশন ও লেআউট'], ['menu', '☰', 'মেনু'], ['#', 'ওয়েবসাইটের কনটেন্ট'],
    ...CONTENT.map((k) => [k, '✏️', TITLES[k][0]]),
    ['#', 'ব্যবস্থাপনা'], ['users', '🔑', 'ব্যবহারকারী ও অনুমোদন', 'owner'], ['history', '🕘', 'ব্যাকআপ'], ['account', '👤', 'আমার অ্যাকাউন্ট'],
  ];
  const ERR = {
    wrong_password: 'ইউজারনেম বা পাসওয়ার্ড ভুল', pending: 'আপনার অ্যাকাউন্ট এখনো অনুমোদন পায়নি। অ্যাডমিন অনুমোদন দিলে লগইন করতে পারবেন।',
    blocked: 'এই অ্যাকাউন্টটি বন্ধ করা আছে। অ্যাডমিনের সাথে যোগাযোগ করুন।', ADMIN_PASSWORD_not_set: 'সার্ভারে ADMIN_PASSWORD সেট করা নেই (Vercel → Environment Variables)',
    storage_error: 'স্টোরেজ কাজ করছে না — Vercel-এ Blob স্টোর কানেক্ট করে রিডিপ্লয় করুন', bad_username: 'ইউজারনেম ৩–২৪ অক্ষরের হতে হবে (ইংরেজি ছোট হাতের অক্ষর, সংখ্যা, _ বা .)',
    username_taken: 'এই ইউজারনেম নেওয়া আছে, অন্য একটি দিন', bad_password: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে', bad_name: 'আপনার নাম লিখুন',
    too_many_requests: 'এখন নতুন আবেদন নেওয়া যাচ্ছে না, পরে চেষ্টা করুন', network: 'ইন্টারনেট সংযোগ বা সার্ভারে সমস্যা', too_large: 'কনটেন্ট অনেক বড় — কিছু ছবি কমান',
    owner_password_in_vercel: 'অ্যাডমিনের পাসওয়ার্ড Vercel-এর ADMIN_PASSWORD থেকে বদলাতে হয়', unauthorized: 'সেশন শেষ হয়েছে, আবার লগইন করুন',
  };
  const em = (r) => ERR[r.d && r.d.error] || (r.status === 404 ? 'সার্ভার ফাংশন পাওয়া যায়নি — api ফোল্ডারটি ডিপ্লয় হয়েছে কিনা দেখুন' : 'কিছু একটা সমস্যা হয়েছে');

  /* ------------------------------------------------------------------ */
  /*  State + helpers                                                    */
  /* ------------------------------------------------------------------ */
  const S = { tk: '', me: null, view: 'dash', sel: null, type: '', users: null, usersErr: false, dirty: false, need: false, busy: false, hist: null, poll: 0, authTab: 'login', lastPending: 0 };
  let root, barEl, mainEl;

  const loadSession = () => {
    try {
      const j = JSON.parse(sessionStorage.getItem(SKEY) || 'null');
      if (j && j.tk && j.me && j.me.exp > Date.now()) { S.tk = j.tk; S.me = j.me; return true; }
    } catch (e) { /* ignore */ }
    return false;
  };
  const saveSession = () => { try { S.tk ? sessionStorage.setItem(SKEY, JSON.stringify({ tk: S.tk, me: S.me })) : sessionStorage.removeItem(SKEY); } catch (e) { /* ignore */ } };
  const isOwner = () => S.me && S.me.role === 'owner';

  async function api(url, body) {
    const h = { 'Content-Type': 'application/json' };
    if (S.tk) h.Authorization = 'Bearer ' + S.tk;
    let r, d = {};
    try {
      r = await fetch(url, { method: body ? 'POST' : 'GET', headers: h, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
      d = await r.json().catch(() => ({}));
    } catch (e) { return { ok: false, status: 0, d: { error: 'network' } }; }
    if (r.status === 401 && d.error === 'unauthorized' && S.tk) expire();
    return { ok: r.ok, status: r.status, d };
  }

  function say(msg, kind) {
    let t = $('#gva-toast');
    if (!t) { t = document.createElement('div'); t.id = 'gva-toast'; document.body.append(t); }
    t.className = 'gva-toast ' + (kind || '');
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._t); t._t = setTimeout(() => { t.style.display = 'none'; }, 4200);
  }
  const rel = (iso) => {
    const t = new Date(iso).getTime(); if (!t) return '—';
    const m = Math.floor((Date.now() - t) / 6e4);
    if (m < 1) return 'এইমাত্র'; if (m < 60) return toB(m) + ' মিনিট আগে';
    if (m < 1440) return toB(Math.floor(m / 60)) + ' ঘণ্টা আগে'; if (m < 43200) return toB(Math.floor(m / 1440)) + ' দিন আগে';
    return new Date(t).toLocaleDateString('bn-BD');
  };
  const when = (iso) => { try { return new Date(iso).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return iso; } };
  const secOf = (id) => G.D.sections.find((s) => s.id === id);
  const secName = (id) => BUILT_NAMES[id] || (secOf(id) && (secOf(id).title || secOf(id).eyebrow)) || 'নামহীন সেকশন';
  const mark = () => { S.dirty = true; S.need = true; updTop(); };
  const sm = (txt, fn, cls) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'gva-sm ' + (cls || ''); b.textContent = txt; b.onclick = fn; return b; };
  const redraw = () => { const y = mainEl.scrollTop; drawView(); mainEl.scrollTop = y; };

  /* ------------------------------------------------------------------ */
  /*  Styles                                                             */
  /* ------------------------------------------------------------------ */
  const CSS = `
#gva{position:fixed;inset:0;z-index:100;background:#05100a;color:#F7F9F5;display:flex;flex-direction:column;font-size:15px;line-height:1.5}
#gva *{box-sizing:border-box}#gva button,#gva input,#gva select,#gva textarea{font-family:inherit;font-size:inherit}
.gva-top{display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.35);flex-wrap:wrap}
.gva-brand{font-weight:700;font-size:17px;white-space:nowrap}.gva-brand small{color:#b6f04e;font-weight:600;margin-left:6px}.gva-grow{flex:1}
.gva-pill{padding:5px 12px;border-radius:999px;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,.25);white-space:nowrap}.gva-pill.ok{color:#b6f04e;border-color:rgba(120,200,0,.45)}.gva-pill.warn{color:#ffd37a;border-color:rgba(255,200,80,.6);background:rgba(255,180,0,.1)}
.gva-btn{border:0;border-radius:999px;padding:9px 20px;font-weight:700;cursor:pointer;background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.3)}.gva-btn.lime{background:#78C800;color:#07170d;border-color:#78C800;box-shadow:0 6px 20px rgba(120,200,0,.35)}.gva-btn:disabled{opacity:.55;cursor:wait}
.gva-ic{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;position:relative;font-size:16px;padding:0}
.gva-badge{position:absolute;top:-5px;right:-5px;min-width:20px;height:20px;border-radius:10px;background:#ff5b4d;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 5px}
.gva-body{flex:1;min-height:0;display:grid;grid-template-columns:236px 1fr}
.gva-side{border-right:1px solid rgba(255,255,255,.12);padding:14px 10px;overflow:auto;display:flex;flex-direction:column;gap:2px}
.gva-sb-h{font-size:12px;color:#8fb487;letter-spacing:.06em;margin:14px 10px 4px;font-weight:700}
.gva-nb{display:flex;align-items:center;gap:10px;text-align:left;background:0;border:0;color:#d5e4cf;padding:9px 12px;border-radius:12px;cursor:pointer;white-space:nowrap}.gva-nb:hover{background:rgba(255,255,255,.08)}.gva-nb.on{background:#78C800;color:#07170d;font-weight:700}
.gva-main{overflow:auto;padding:26px clamp(16px,3vw,40px) 80px}.gva-wrap{max-width:980px;margin:0 auto}
.gva-h{font-size:26px;font-weight:700;margin:0 0 4px}.gva-sub{color:#b8cdb2;margin:0 0 20px}
.gva-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin:18px 0 26px}
.gva-card{background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.18);border-radius:20px;padding:16px 18px;text-align:left;color:#fff;cursor:pointer}
.gva-card small{display:block;color:#b8cdb2;font-size:13px}.gva-card b{display:block;font-size:26px;margin-top:2px;font-weight:700}.gva-card em{font-style:normal;font-size:12px;color:#8fb487}.gva-card.warn{border-color:rgba(255,200,80,.7);background:rgba(255,180,0,.12)}.gva-card.warn b{color:#ffd37a}
.gva-box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);border-radius:20px;padding:18px 20px;margin:0 0 18px}.gva-box h3{margin:0 0 10px;font-size:18px}
.gva-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.gva-in,.gva-f input:not([type=file]):not([type=checkbox]),.gva-f textarea,.gva-f select{width:100%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.25);border-radius:10px;color:#fff;padding:9px 12px}.gva-f textarea{min-height:90px}.gva-f select option{color:#000}
.gva-f{display:block;margin:10px 0}.gva-f>span{display:block;font-size:13px;color:#b8cdb2;margin-bottom:3px}.gva-f input[type=file]{color:#b8cdb2;font-size:13px}
.gva-th{width:76px;height:76px;border-radius:12px;object-fit:cover;display:block;margin-bottom:6px;border:1px solid rgba(255,255,255,.25)}
.gva-form fieldset{min-width:0;border:1px solid rgba(255,255,255,.2);border-radius:16px;margin:12px 0;padding:6px 14px 12px}.gva-form legend{color:#b6f04e;font-size:13px;padding:0 6px}
.gva-sm{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:999px;padding:5px 13px;margin:4px 6px 4px 0;cursor:pointer;font-size:13px}.gva-sm:hover{background:rgba(255,255,255,.2)}.gva-sm.danger{border-color:rgba(255,110,100,.6);color:#ff9a90}.gva-sm.lime2{background:rgba(120,200,0,.2);border-color:rgba(120,200,0,.55);color:#c8f77a}.gva-sm.ok{background:#78C800;color:#07170d;border-color:#78C800;font-weight:700}
.gva-ctl{display:flex;flex-wrap:wrap;margin-top:2px}
.gva-list{display:flex;flex-direction:column;gap:10px;margin-bottom:22px}
.gva-li{display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:10px 14px}.gva-li.off{opacity:.55}
.gva-li-t b{display:block}.gva-li-t small{color:#8fb487}.gva-li-c{display:flex;align-items:center;flex-wrap:wrap;gap:2px}
.gva-sw{width:46px;height:26px;border-radius:13px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);position:relative;cursor:pointer;margin-right:8px;padding:0}.gva-sw::after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}.gva-sw.on{background:#78C800;border-color:#78C800}.gva-sw.on::after{transform:translateX(20px);background:#07170d}
.gva-types{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:8px 0 14px}.gva-type{text-align:left;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.2);border-radius:14px;color:#fff;padding:12px 14px;cursor:pointer}.gva-type:hover{border-color:#78C800;background:rgba(120,200,0,.12)}.gva-type small{display:block;color:#b8cdb2;margin-top:2px}
.gva-chk{display:flex;gap:8px;align-items:center;margin:8px 0;color:#d5e4cf}
.gva-auth{margin:auto;width:min(440px,calc(100% - 24px));padding:26px 24px}.gva-tabs{display:grid;grid-template-columns:1fr 1fr;background:rgba(255,255,255,.08);border-radius:999px;padding:4px;margin:14px 0 8px}.gva-tabs button{border:0;background:0;color:#fff;padding:9px;border-radius:999px;cursor:pointer;font-weight:700}.gva-tabs .on{background:#78C800;color:#07170d}
.gva-msg{margin-top:12px;padding:10px 14px;border-radius:12px;font-size:14px;display:none}.gva-msg.err{display:block;background:rgba(255,91,77,.15);border:1px solid rgba(255,91,77,.5);color:#ffb3ab}.gva-msg.ok{display:block;background:rgba(120,200,0,.15);border:1px solid rgba(120,200,0,.5);color:#c8f77a}
.gva-hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}
.gva-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:130;background:#12301b;border:1px solid rgba(120,200,0,.6);color:#fff;padding:11px 22px;border-radius:999px;max-width:92vw;display:none;box-shadow:0 10px 30px rgba(0,0,0,.5)}.gva-toast.err{border-color:#ff5b4d;background:#3a1612}
#gva-bar{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:110;display:none;gap:10px;padding:10px 14px;border-radius:999px;background:rgba(5,16,9,.92);border:1px solid rgba(120,200,0,.5);box-shadow:0 10px 30px rgba(0,0,0,.5)}
.gva-user{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:space-between}.gva-user small{color:#8fb487}
.gva-tag{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid rgba(255,255,255,.3);margin-left:6px}.gva-tag.p{color:#ffd37a;border-color:rgba(255,200,80,.6)}.gva-tag.a{color:#b6f04e;border-color:rgba(120,200,0,.55)}.gva-tag.b{color:#ff9a90;border-color:rgba(255,110,100,.55)}
.gva-empty{color:#8fb487;padding:8px 2px}
@media(max-width:860px){.gva-body{grid-template-columns:1fr;grid-template-rows:auto 1fr}.gva-side{flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid rgba(255,255,255,.12);padding:8px}.gva-sb-h{display:none}.gva-top{padding:8px 12px}.gva-brand small{display:none}}
`;

  /* ------------------------------------------------------------------ */
  /*  Open / close                                                       */
  /* ------------------------------------------------------------------ */
  function mount() {
    if (root) return;
    const st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
    root = document.createElement('div'); root.id = 'gva'; root.style.display = 'none'; document.body.append(root);
    barEl = document.createElement('div'); barEl.id = 'gva-bar';
    barEl.innerHTML = '<button class="gva-btn" id="gva-back">← এডিটরে ফিরুন</button><button class="gva-btn lime" id="gva-pub2">প্রকাশ করুন</button>';
    document.body.append(barEl);
    $('#gva-back').onclick = () => setPreview(false);
    $('#gva-pub2').onclick = publish;
    root.addEventListener('click', onClick);
    window.addEventListener('beforeunload', (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });
  }

  function open() {
    mount();
    root.style.display = 'flex'; barEl.style.display = 'none'; document.body.style.overflow = 'hidden';
    if (S.tk && S.me && S.me.exp > Date.now()) showApp(); else showAuth();
  }
  function hide() {
    if (S.need) { G.render(1); S.need = false; }
    root.style.display = 'none'; barEl.style.display = 'none'; document.body.style.overflow = ''; stopPoll();
    if (S.dirty) say('অপ্রকাশিত পরিবর্তন আছে — প্যানেল আবার খুলে “প্রকাশ করুন” চাপুন');
  }
  function setPreview(on) {
    if (on) { if (S.need) { G.render(1); S.need = false; } root.style.display = 'none'; barEl.style.display = 'flex'; document.body.style.overflow = ''; }
    else { root.style.display = 'flex'; barEl.style.display = 'none'; document.body.style.overflow = 'hidden'; }
  }
  function expire() {
    S.tk = ''; S.me = null; saveSession(); stopPoll();
    if (root && root.style.display !== 'none') showAuth('সেশন শেষ হয়েছে, আবার লগইন করুন', 'err');
  }
  function logout() {
    if (S.dirty && !confirm('অপ্রকাশিত পরিবর্তন আছে। লগআউট করলে প্যানেল বন্ধ হবে, তবে পরিবর্তনগুলো এই পেজে থাকবে যতক্ষণ রিফ্রেশ না করেন। চালিয়ে যাবেন?')) return;
    S.tk = ''; S.me = null; S.users = null; saveSession(); stopPoll(); hide();
  }

  /* ------------------------------------------------------------------ */
  /*  Auth screen: Login | Create account                                */
  /* ------------------------------------------------------------------ */
  function showAuth(msg, kind) {
    stopPoll();
    const lg = S.authTab === 'login';
    root.innerHTML = `
<div style="display:flex;justify-content:flex-end;padding:14px 18px"><button class="gva-ic" data-act="close" aria-label="Close">✕</button></div>
<div class="gva-box gva-auth">
  <div class="gva-brand" style="font-size:22px">গ্রীন ভয়েস <small>অ্যাডমিন</small></div>
  <div class="gva-tabs"><button class="${lg ? 'on' : ''}" data-act="tab" data-t="login">লগইন</button><button class="${lg ? '' : 'on'}" data-act="tab" data-t="register">অ্যাকাউন্ট তৈরি করুন</button></div>
  ${lg ? `<form id="gva-f-login" autocomplete="on">
      <label class="gva-f"><span>ইউজারনেম</span><input name="username" autocomplete="username" autocapitalize="off" required></label>
      <label class="gva-f"><span>পাসওয়ার্ড</span><input name="password" type="password" autocomplete="current-password" required></label>
      <button class="gva-btn lime" style="width:100%;margin-top:6px">লগইন</button></form>
      <p style="color:#8fb487;font-size:13px;margin:14px 0 0">নতুন সদস্য? “অ্যাকাউন্ট তৈরি করুন” ট্যাবে আবেদন করুন। অ্যাডমিন অনুমোদন দিলে লগইন করতে পারবেন।</p>`
      : `<form id="gva-f-reg" autocomplete="off">
      <label class="gva-f"><span>আপনার নাম</span><input name="name" maxlength="40" required></label>
      <label class="gva-f"><span>ইউজারনেম (ইংরেজি ছোট হাতের অক্ষর, সংখ্যা, _ বা .)</span><input name="username" autocapitalize="off" pattern="[A-Za-z0-9_.]{3,24}" minlength="3" maxlength="24" required></label>
      <label class="gva-f"><span>পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)</span><input name="password" type="password" minlength="8" maxlength="64" autocomplete="new-password" required></label>
      <label class="gva-f"><span>পাসওয়ার্ড আবার লিখুন</span><input name="again" type="password" minlength="8" maxlength="64" autocomplete="new-password" required></label>
      <input class="gva-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="gva-btn lime" style="width:100%;margin-top:6px">আবেদন জমা দিন</button></form>`}
  <div class="gva-msg ${msg ? (kind || 'err') : ''}" id="gva-msg">${esc(msg || '')}</div>
</div>`;
    const f = $(lg ? '#gva-f-login' : '#gva-f-reg');
    f.onsubmit = (e) => { e.preventDefault(); lg ? doLogin(f) : doRegister(f); };
    const first = f.querySelector('input'); if (first) first.focus();
  }
  const amsg = (t, k) => { const m = $('#gva-msg'); if (m) { m.className = 'gva-msg ' + (k || 'err'); m.textContent = t; } };

  async function doLogin(f) {
    const b = f.querySelector('button'); b.disabled = true; amsg('অপেক্ষা করুন…', 'ok');
    const r = await api('/api/auth', { action: 'login', username: f.username.value, password: f.password.value });
    b.disabled = false;
    if (!r.ok) { amsg(em(r)); return; }
    S.tk = r.d.token; S.me = { username: r.d.username, role: r.d.role, name: r.d.name, exp: Date.now() + 8 * 3600e3 - 6e4 };
    saveSession(); showApp();
  }
  async function doRegister(f) {
    if (f.password.value !== f.again.value) { amsg('দুটি পাসওয়ার্ড মেলেনি'); return; }
    const b = f.querySelector('button'); b.disabled = true; amsg('অপেক্ষা করুন…', 'ok');
    const r = await api('/api/auth', { action: 'register', name: f.name.value, username: f.username.value, password: f.password.value, website: f.website.value });
    b.disabled = false;
    if (!r.ok) { amsg(em(r)); return; }
    S.authTab = 'login'; showAuth('আবেদন জমা হয়েছে ✓ অ্যাডমিন অনুমোদন দিলে এই ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।', 'ok');
  }

  /* ------------------------------------------------------------------ */
  /*  App shell                                                          */
  /* ------------------------------------------------------------------ */
  function showApp() {
    S.authTab = 'login';
    root.innerHTML = `
<header class="gva-top">
  <div class="gva-brand">গ্রীন ভয়েস <small>অ্যাডমিন</small></div><div class="gva-grow"></div>
  <span class="gva-pill ok" id="gva-st"></span>
  <button class="gva-ic" id="gva-bell" data-act="bell" title="অনুমোদনের নোটিফিকেশন" style="display:none">🔔<span class="gva-badge" id="gva-bn" style="display:none"></span></button>
  <button class="gva-btn" data-act="preview">👁 প্রিভিউ</button>
  <button class="gva-btn lime" id="gva-pub" data-act="publish">প্রকাশ করুন</button>
  <button class="gva-ic" data-act="close" title="বন্ধ করুন" aria-label="Close">✕</button>
</header>
<div class="gva-body"><nav class="gva-side" id="gva-nav"></nav><main class="gva-main" id="gva-main"></main></div>`;
    mainEl = $('#gva-main');
    drawNav(); drawView(); updTop();
    if (isOwner()) { refreshUsers().then(() => { updTop(); if (S.view === 'dash' || S.view === 'users') drawView(); if (S.pending) say('🔔 ' + toB(S.pending) + 'টি অ্যাকাউন্ট অনুমোদনের অপেক্ষায় আছে'); }); startPoll(); }
  }
  function drawNav() {
    const nav = $('#gva-nav');
    nav.innerHTML = NAV.filter((n) => !n[3] || (n[3] === 'owner' && isOwner())).map((n) => n[0] === '#'
      ? `<div class="gva-sb-h">${esc(n[1])}</div>`
      : `<button class="gva-nb ${S.view === n[0] || (n[0] === 'sections' && S.view === 'sec') ? 'on' : ''}" data-act="go" data-v="${n[0]}"><span>${n[1]}</span>${esc(n[2])}${n[0] === 'users' && S.pending ? ` <span class="gva-tag p">${toB(S.pending)}</span>` : ''}</button>`).join('');
  }
  function updTop() {
    const st = $('#gva-st'); if (!st) return;
    st.className = 'gva-pill ' + (S.dirty ? 'warn' : 'ok'); st.textContent = S.dirty ? '● অপ্রকাশিত পরিবর্তন আছে' : '✓ সব প্রকাশিত';
    const bell = $('#gva-bell'), bn = $('#gva-bn');
    bell.style.display = isOwner() ? '' : 'none';
    bn.style.display = S.pending ? 'flex' : 'none'; bn.textContent = toB(S.pending);
    const p = $('#gva-pub'); if (p && !S.busy) p.textContent = 'প্রকাশ করুন';
    drawNav();
  }
  function go(v) { S.view = v; S.sel = null; drawNav(); drawView(); mainEl.scrollTop = 0; }

  function drawView() {
    const v = S.view;
    mainEl.innerHTML = '<div class="gva-wrap" id="gva-w"></div>';
    const w = $('#gva-w');
    if (v === 'dash') viewDash(w);
    else if (v === 'sections') viewSections(w);
    else if (v === 'sec') viewSec(w);
    else if (v === 'menu') viewMenu(w);
    else if (v === 'users') viewUsers(w);
    else if (v === 'history') viewHistory(w);
    else if (v === 'account') viewAccount(w);
    else if (CONTENT.includes(v)) viewContent(w, v);
  }

  /* ------------------------------------------------------------------ */
  /*  Dashboard                                                          */
  /* ------------------------------------------------------------------ */
  function pendingList() {
    const list = (S.users || []).filter((u) => u.status === 'pending');
    if (!list.length) return '<div class="gva-empty">এই মুহূর্তে কোনো আবেদন অপেক্ষায় নেই।</div>';
    return `<div class="gva-list">${list.map((u) => `<div class="gva-li"><div class="gva-li-t"><b>${esc(u.name)}</b><small>@${esc(u.username)} · ${esc(rel(u.createdAt))}</small></div>
      <div class="gva-li-c"><button class="gva-sm ok" data-act="u" data-do="approve" data-u="${esc(u.username)}">✓ অনুমোদন</button><button class="gva-sm danger" data-act="u" data-do="block" data-u="${esc(u.username)}">✕ বাতিল</button></div></div>`).join('')}</div>`;
  }
  function viewDash(w) {
    const D = G.D, meta = D._meta || {}, vis = D.layout.filter((x) => x.show !== false).length;
    const approved = (S.users || []).filter((u) => u.status === 'approved').length;
    const cards = [];
    if (isOwner()) {
      cards.push(['⏳ অনুমোদনের অপেক্ষায়', toB(S.pending), S.pending ? 'ক্লিক করে দেখুন' : 'কোনো আবেদন নেই', 'users', S.pending ? 'warn' : '']);
      cards.push(['✅ অনুমোদিত সদস্য', toB(approved), 'এডিটর অ্যাকাউন্ট', 'users', '']);
    }
    cards.push(['🧩 চালু সেকশন', toB(vis) + '/' + toB(D.layout.length), 'লেআউট দেখুন', 'sections', '']);
    cards.push(['📌 নোটিশ', toB(D.notices.length), 'এডিট করুন', 'notices', '']);
    cards.push(['🌱 কার্যক্রম', toB(D.activities.length), 'এডিট করুন', 'activities', '']);
    cards.push(['👥 কমিটি সদস্য', toB(D.committee.length), 'এডিট করুন', 'committee', '']);
    cards.push(['🚀 সর্বশেষ প্রকাশ', meta.publishedAt ? rel(meta.publishedAt) : 'এখনো নয়', meta.by ? '@' + meta.by + '-এর দ্বারা' : 'প্রথম প্রকাশ বাকি', 'history', '']);
    cards.push(['✏️ অপ্রকাশিত পরিবর্তন', S.dirty ? 'আছে' : 'নেই', S.dirty ? 'প্রকাশ করুন' : 'সব ঠিক আছে', 'dash', S.dirty ? 'warn' : '']);
    w.innerHTML = `
<h2 class="gva-h">স্বাগতম, ${esc(S.me.name)} 👋</h2>
<p class="gva-sub">${isOwner() ? 'আপনি মূল অ্যাডমিন — সদস্য অনুমোদন, কনটেন্ট ও সেকশন সবকিছু নিয়ন্ত্রণ করতে পারবেন।' : 'আপনি এডিটর — ওয়েবসাইটের কনটেন্ট বদলে প্রকাশ করতে পারবেন।'}</p>
<div class="gva-grid">${cards.map((c) => `<button class="gva-card ${c[4]}" data-act="go" data-v="${c[3]}"><small>${c[0]}</small><b>${esc(c[1])}</b><em>${esc(c[2])}</em></button>`).join('')}</div>
<div class="gva-box"><h3>দ্রুত কাজ</h3><div class="gva-row">
  <button class="gva-btn lime" data-act="go" data-v="sections">+ নতুন সেকশন যোগ করুন</button>
  <button class="gva-btn" data-act="go" data-v="hero">হিরো এডিট</button>
  <button class="gva-btn" data-act="go" data-v="notices">নোটিশ যোগ করুন</button>
  <button class="gva-btn" data-act="preview">👁 সাইট প্রিভিউ</button>
  ${S.dirty ? '<button class="gva-btn" data-act="discard">↺ পরিবর্তন বাতিল</button>' : ''}</div></div>
${isOwner() ? `<div class="gva-box"><h3>🔔 অনুমোদনের অনুরোধ ${S.pending ? `<span class="gva-tag p">${toB(S.pending)}</span>` : ''}</h3>${S.usersErr ? '<div class="gva-empty">ব্যবহারকারীর তালিকা লোড করা যায়নি — Vercel-এ Blob স্টোর সংযুক্ত আছে কিনা দেখুন।</div>' : pendingList()}</div>` : ''}
<div class="gva-box"><h3>কীভাবে কাজ করবেন</h3><div style="color:#d5e4cf">১) বাম পাশের মেনু থেকে অংশ বেছে লেখা/ছবি বদলান। ২) “সেকশন ও লেআউট” থেকে নতুন সেকশন যোগ করুন বা ক্রম বদলান। ৩) ওপরের “প্রিভিউ” দিয়ে দেখে নিন। ৪) “প্রকাশ করুন” চাপলে সবার জন্য ওয়েবসাইট বদলে যাবে।</div></div>`;
  }

  /* ------------------------------------------------------------------ */
  /*  Generic form builder (used for every content block)                */
  /* ------------------------------------------------------------------ */
  function shrink(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = rej;
      fr.onload = () => {
        const i = new Image();
        i.onerror = rej;
        i.onload = () => {
          const png = file.type === 'image/png', max = png ? 700 : 900, k = Math.min(1, max / Math.max(i.width, i.height));
          const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(i.width * k)); c.height = Math.max(1, Math.round(i.height * k));
          c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
          res(png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.8));
        };
        i.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  function field(o, k, arr) {
    const v = o[k], w = document.createElement(arr ? 'div' : 'label');
    w.className = 'gva-f';
    w.innerHTML = '<span>' + esc(arr ? '#' + toB(+k + 1) : (LBL[k] || k)) + '</span>';
    if (IMG.test(k)) {
      const im = document.createElement('img'), f = document.createElement('input');
      im.className = 'gva-th'; im.alt = ''; if (v) im.src = v; else im.style.display = 'none';
      f.type = 'file'; f.accept = 'image/*';
      f.onchange = async () => {
        if (!f.files[0]) return;
        try { o[k] = await shrink(f.files[0]); im.src = o[k]; im.style.display = ''; mark(); } catch (e) { say('ছবিটি পড়া যায়নি', 'err'); }
      };
      w.append(im, f);
    } else if (k === 'side') {
      const s = document.createElement('select');
      s.innerHTML = '<option value="left">বাম পাশে</option><option value="right">ডান পাশে</option>';
      s.value = v === 'right' ? 'right' : 'left'; s.onchange = () => { o[k] = s.value; mark(); }; w.append(s);
    } else if (k === 'iso') {
      const i = document.createElement('input'); i.type = 'datetime-local'; i.value = v || '';
      i.oninput = () => { o[k] = i.value; mark(); }; w.append(i);
    } else {
      const ta = LONG.has(k) || String(v).length > 70, i = document.createElement(ta ? 'textarea' : 'input');
      i.value = v; i.oninput = () => { o[k] = i.value; mark(); }; w.append(i);
    }
    if (arr) w.append(ctl(o, +k));
    return w;
  }
  function mv(a, i, d) { const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; mark(); redraw(); }
  function ctl(a, i) {
    const d = document.createElement('div'); d.className = 'gva-ctl';
    d.append(sm('↑', () => mv(a, i, -1)), sm('↓', () => mv(a, i, 1)), sm('✕ মুছুন', () => { a.splice(i, 1); mark(); redraw(); }, 'danger'));
    return d;
  }
  function addBtn(arr, key) {
    return sm('+ নতুন যোগ করুন', () => {
      const t = key === 'items' ? ITPL[S.type] : TPL[key];
      let n;
      if (t) {
        n = Object.assign({}, t);
        if (key !== 'items' && arr[0] && typeof arr[0] === 'object') for (const q in t) if (IMG.test(q) && arr[0][q]) n[q] = arr[0][q];
      } else if (!arr.length || typeof arr[0] === 'string') n = '';
      else { n = {}; for (const q in arr[0]) n[q] = IMG.test(q) ? arr[0][q] : ''; }
      arr.push(n); mark(); redraw();
    }, 'lime2');
  }
  function build(o, box, skip) {
    const arr = Array.isArray(o);
    Object.keys(o).forEach((k) => {
      if (!arr && skip && skip.includes(k)) return;
      const v = o[k];
      if (typeof v === 'string') { box.append(field(o, k, arr)); return; }
      if (v && typeof v === 'object') {
        const fs = document.createElement('fieldset'), lg = document.createElement('legend');
        lg.textContent = arr ? '#' + toB(+k + 1) : (LBL[k] || k); fs.append(lg);
        build(v, fs);
        if (Array.isArray(v)) fs.append(addBtn(v, k));
        if (arr) fs.append(ctl(o, +k));
        box.append(fs);
      }
    });
  }

  function viewContent(w, key) {
    S.type = '';
    w.innerHTML = `<h2 class="gva-h">${esc(TITLES[key][0])}</h2><p class="gva-sub">${esc(TITLES[key][1])}</p><div class="gva-box gva-form" id="gva-form"></div>`;
    const box = $('#gva-form'), data = G.D[key];
    build(data, box);
    if (Array.isArray(data)) box.append(addBtn(data, key));
  }

  /* ------------------------------------------------------------------ */
  /*  Sections & layout                                                  */
  /* ------------------------------------------------------------------ */
  function viewSections(w) {
    const D = G.D;
    w.innerHTML = `<h2 class="gva-h">সেকশন ও লেআউট</h2><p class="gva-sub">সেকশনগুলোর ক্রম বদলান, লুকান, এডিট করুন বা নতুন সেকশন যোগ করুন। ওপরের সেকশন ওয়েবসাইটের ওপরে দেখাবে।</p>
<div class="gva-list">${D.layout.map((x, i) => {
      const s = secOf(x.id);
      return `<div class="gva-li ${x.show === false ? 'off' : ''}"><div class="gva-li-t"><b>${esc(secName(x.id))}</b><small>${s ? esc(SEC_TYPES[s.type] ? SEC_TYPES[s.type].icon + ' ' + SEC_TYPES[s.type].name : s.type) + ' · কাস্টম সেকশন' : 'মূল সেকশন'}</small></div>
<div class="gva-li-c"><button class="gva-sw ${x.show === false ? '' : 'on'}" data-act="tog" data-i="${i}" title="ওয়েবসাইটে দেখান / লুকান"></button>
<button class="gva-sm" data-act="up" data-i="${i}">↑</button><button class="gva-sm" data-act="dn" data-i="${i}">↓</button>
<button class="gva-sm lime2" data-act="edit" data-i="${i}">✎ এডিট</button>
${s ? `<button class="gva-sm" data-act="dup" data-i="${i}" title="কপি করুন">⧉</button><button class="gva-sm danger" data-act="del" data-i="${i}">✕</button>` : ''}</div></div>`;
    }).join('')}</div>
<div class="gva-box"><h3>+ নতুন সেকশন যোগ করুন</h3><div class="gva-types">${Object.keys(SEC_TYPES).map((k) => `<button class="gva-type" data-act="add" data-t="${k}"><b>${SEC_TYPES[k].icon} ${SEC_TYPES[k].name}</b><small>${SEC_TYPES[k].desc}</small></button>`).join('')}</div>
<label class="gva-f"><span>কোথায় বসবে</span><select id="gva-pos"><option value="-1">একদম ওপরে</option>${D.layout.map((x, i) => `<option value="${i}" ${i === D.layout.length - 1 ? 'selected' : ''}>“${esc(secName(x.id))}”-এর পরে</option>`).join('')}</select></label>
<label class="gva-chk"><input type="checkbox" id="gva-addnav"> ওপরের মেনুতে লিংক যোগ করুন</label></div>`;
  }

  function viewSec(w) {
    const D = G.D, s = secOf(S.sel);
    if (!s) { S.view = 'sections'; viewSections(w); return; }
    S.type = s.type;
    const lay = D.layout.find((x) => x.id === s.id), ni = D.nav.find((n) => n.to === s.id);
    w.innerHTML = `<button class="gva-sm" data-act="go" data-v="sections">← সব সেকশন</button>
<h2 class="gva-h" style="margin-top:8px">${SEC_TYPES[s.type] ? SEC_TYPES[s.type].icon + ' ' + SEC_TYPES[s.type].name : ''} সেকশন এডিট</h2><p class="gva-sub">পরিবর্তনের পর ওপরের “প্রকাশ করুন” চাপুন।</p>
<div class="gva-box"><div class="gva-row"><button class="gva-sw ${lay && lay.show === false ? '' : 'on'}" id="gva-sh"></button><span>ওয়েবসাইটে দেখান</span></div>
<label class="gva-chk"><input type="checkbox" id="gva-nv" ${ni ? 'checked' : ''}> ওপরের মেনুতে লিংক রাখুন</label>
<label class="gva-f" id="gva-nl" style="${ni ? '' : 'display:none'}"><span>মেনুতে যে নামে দেখাবে</span><input id="gva-nli" value="${esc(ni ? ni.label : '')}"></label></div>
<div class="gva-box gva-form" id="gva-form"></div>`;
    $('#gva-sh').onclick = (e) => { lay.show = lay.show === false; e.currentTarget.classList.toggle('on', lay.show !== false); mark(); };
    $('#gva-nv').onchange = (e) => {
      if (e.target.checked) { if (!D.nav.some((n) => n.to === s.id)) D.nav.push({ label: s.title || s.eyebrow || 'নতুন', to: s.id }); }
      else D.nav = D.nav.filter((n) => n.to !== s.id);
      const cur = D.nav.find((n) => n.to === s.id); $('#gva-nl').style.display = cur ? '' : 'none'; $('#gva-nli').value = cur ? cur.label : ''; mark();
    };
    $('#gva-nli').oninput = (e) => { const cur = D.nav.find((n) => n.to === s.id); if (cur) { cur.label = e.target.value; mark(); } };
    build(s, $('#gva-form'), ['id', 'type']);
  }

  function addSection(type) {
    const D = G.D, id = 'sec-' + Math.random().toString(36).slice(2, 8);
    const pos = parseInt($('#gva-pos').value, 10), sec = Object.assign({ id, type }, SEC_TYPES[type].make());
    D.sections.push(sec); D.layout.splice(pos + 1, 0, { id, show: true });
    if ($('#gva-addnav').checked) D.nav.push({ label: sec.title || SEC_TYPES[type].name, to: id });
    mark(); S.view = 'sec'; S.sel = id; drawNav(); drawView(); mainEl.scrollTop = 0; say('সেকশন যোগ হয়েছে — এবার লেখা ও ছবি বদলান');
  }
  function dupSection(i) {
    const D = G.D, x = D.layout[i], s = secOf(x.id); if (!s) return;
    const c = JSON.parse(JSON.stringify(s)); c.id = 'sec-' + Math.random().toString(36).slice(2, 8); if (c.title) c.title += ' (কপি)';
    D.sections.push(c); D.layout.splice(i + 1, 0, { id: c.id, show: true }); mark(); redraw();
  }
  function delSection(i) {
    const D = G.D, x = D.layout[i];
    if (!confirm('“' + secName(x.id) + '” সেকশনটি মুছে ফেলবেন? (প্রকাশ না করা পর্যন্ত ওয়েবসাইটে বদলাবে না)')) return;
    D.sections = D.sections.filter((s) => s.id !== x.id); D.layout.splice(i, 1); D.nav = D.nav.filter((n) => n.to !== x.id); mark(); redraw();
  }

  /* ------------------------------------------------------------------ */
  /*  Menu                                                               */
  /* ------------------------------------------------------------------ */
  function viewMenu(w) {
    const D = G.D;
    w.innerHTML = '<h2 class="gva-h">মেনু</h2><p class="gva-sub">ওয়েবসাইটের ওপরের নেভিগেশন মেনু। প্রতিটি আইটেম একটি সেকশনে নিয়ে যায়।</p><div class="gva-box gva-form" id="gva-form"></div>';
    const box = $('#gva-form');
    D.nav.forEach((n, i) => {
      const fs = document.createElement('fieldset'), lg = document.createElement('legend'); lg.textContent = '#' + toB(i + 1); fs.append(lg);
      const l = document.createElement('label'); l.className = 'gva-f'; l.innerHTML = '<span>মেনুর নাম</span>';
      const inp = document.createElement('input'); inp.value = n.label; inp.oninput = () => { n.label = inp.value; mark(); }; l.append(inp);
      const l2 = document.createElement('label'); l2.className = 'gva-f'; l2.innerHTML = '<span>কোন সেকশনে যাবে</span>';
      const sel = document.createElement('select');
      sel.innerHTML = D.layout.map((x) => `<option value="${esc(x.id)}">${esc(secName(x.id))}</option>`).join('');
      sel.value = n.to; sel.onchange = () => { n.to = sel.value; mark(); }; l2.append(sel);
      fs.append(l, l2, ctl(D.nav, i)); box.append(fs);
    });
    box.append(sm('+ মেনু আইটেম যোগ করুন', () => { D.nav.push({ label: 'নতুন', to: D.layout[0] ? D.layout[0].id : 'home' }); mark(); redraw(); }, 'lime2'));
  }

  /* ------------------------------------------------------------------ */
  /*  Users (owner)                                                      */
  /* ------------------------------------------------------------------ */
  async function refreshUsers() {
    const r = await api('/api/users');
    if (r.ok) { S.users = r.d.users; S.pending = r.d.pending; S.usersErr = false; } else S.usersErr = true;
    return r.ok;
  }
  function userRow(u) {
    const tag = u.status === 'pending' ? '<span class="gva-tag p">অপেক্ষায়</span>' : u.status === 'approved' ? '<span class="gva-tag a">অনুমোদিত</span>' : '<span class="gva-tag b">বন্ধ</span>';
    const e = esc(u.username);
    return `<div class="gva-li"><div class="gva-li-t"><b>${esc(u.name)} ${tag}</b><small>@${e} · আবেদন: ${esc(when(u.createdAt))}</small></div><div class="gva-li-c">
${u.status !== 'approved' ? `<button class="gva-sm ok" data-act="u" data-do="approve" data-u="${e}">✓ অনুমোদন</button>` : ''}
${u.status === 'approved' ? `<button class="gva-sm" data-act="u" data-do="block" data-u="${e}">বন্ধ করুন</button>` : ''}
<button class="gva-sm" data-act="u" data-do="resetpw" data-u="${e}">🔑 পাসওয়ার্ড রিসেট</button><button class="gva-sm danger" data-act="u" data-do="delete" data-u="${e}">মুছুন</button></div></div>`;
  }
  async function viewUsers(w) {
    w.innerHTML = '<h2 class="gva-h">ব্যবহারকারী ও অনুমোদন</h2><p class="gva-sub">নতুন অ্যাকাউন্টের আবেদন অনুমোদন করলেই তারা লগইন করে ওয়েবসাইট এডিট ও প্রকাশ করতে পারবে।</p><div class="gva-empty">লোড হচ্ছে…</div>';
    await refreshUsers(); updTop();
    if (S.view !== 'users') return;
    if (S.usersErr) { w.querySelector('.gva-empty').textContent = 'তালিকা লোড করা যায়নি — Vercel-এ Blob স্টোর কানেক্ট আছে কিনা দেখুন।'; return; }
    const g = (st) => S.users.filter((u) => u.status === st);
    const sec = (t, list, none) => `<div class="gva-box"><h3>${t} (${toB(list.length)})</h3>${list.length ? `<div class="gva-list" style="margin:0">${list.map(userRow).join('')}</div>` : `<div class="gva-empty">${none}</div>`}</div>`;
    w.innerHTML = `<h2 class="gva-h">ব্যবহারকারী ও অনুমোদন</h2><p class="gva-sub">নতুন অ্যাকাউন্টের আবেদন অনুমোদন করলেই তারা লগইন করে ওয়েবসাইট এডিট ও প্রকাশ করতে পারবে।</p>
<div style="margin-bottom:14px"><button class="gva-sm" data-act="go" data-v="users">↻ রিফ্রেশ</button></div>
${sec('🔔 অনুমোদনের অপেক্ষায়', g('pending'), 'কোনো নতুন আবেদন নেই।')}${sec('✅ অনুমোদিত সদস্য', g('approved'), 'এখনো কেউ নেই।')}${sec('🚫 বন্ধ করা অ্যাকাউন্ট', g('blocked'), 'কোনো বন্ধ অ্যাকাউন্ট নেই।')}`;
  }
  async function userAct(d) {
    const u = d.u;
    if (d.do === 'delete' && !confirm('@' + u + ' অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলবেন?')) return;
    if (d.do === 'block' && !confirm('@' + u + '-কে বন্ধ করলে সে আর লগইন করতে পারবে না। নিশ্চিত?')) return;
    const body = { action: d.do, username: u };
    if (d.do === 'resetpw') { const p = prompt('@' + u + '-এর জন্য নতুন পাসওয়ার্ড দিন (কমপক্ষে ৮ অক্ষর):'); if (!p) return; body.password = p; }
    const r = await api('/api/users', body);
    if (!r.ok) { say(em(r), 'err'); return; }
    say({ approve: '✓ অনুমোদন দেওয়া হয়েছে', block: 'অ্যাকাউন্ট বন্ধ করা হয়েছে', delete: 'অ্যাকাউন্ট মুছে ফেলা হয়েছে', resetpw: 'পাসওয়ার্ড বদলানো হয়েছে' }[d.do]);
    await refreshUsers(); updTop(); drawView();
  }
  function startPoll() {
    stopPoll();
    S.lastPending = S.pending;
    S.poll = setInterval(async () => {
      if (!isOwner() || root.style.display === 'none') return;
      const was = S.pending; await refreshUsers();
      if (S.pending > was) say('🔔 নতুন অ্যাকাউন্টের আবেদন এসেছে (' + toB(S.pending) + 'টি অপেক্ষায়)');
      updTop(); if (S.view === 'dash') redraw();
    }, 30000);
  }
  function stopPoll() { clearInterval(S.poll); S.poll = 0; }

  /* ------------------------------------------------------------------ */
  /*  Backups                                                            */
  /* ------------------------------------------------------------------ */
  async function viewHistory(w) {
    w.innerHTML = '<h2 class="gva-h">ব্যাকআপ</h2><p class="gva-sub">প্রতিবার প্রকাশ করলে একটি ব্যাকআপ রাখা হয় (সর্বশেষ ১৫টি)। ভুল হলে আগের ভার্সনে ফিরে যেতে পারবেন — ফিরলে সাইটে সাথে সাথে কার্যকর হয়।</p><div class="gva-empty">লোড হচ্ছে…</div>';
    const r = await api('/api/content', { action: 'history' });
    if (S.view !== 'history') return;
    if (!r.ok) { w.querySelector('.gva-empty').textContent = em(r); return; }
    const items = r.d.items || [];
    w.innerHTML = `<h2 class="gva-h">ব্যাকআপ</h2><p class="gva-sub">প্রতিবার প্রকাশ করলে একটি ব্যাকআপ রাখা হয় (সর্বশেষ ১৫টি)। ভুল হলে আগের ভার্সনে ফিরে যেতে পারবেন — ফিরলে সাইটে সাথে সাথে কার্যকর হয়।</p>
${items.length ? `<div class="gva-list">${items.map((x, i) => `<div class="gva-li"><div class="gva-li-t"><b>${esc(when(x.at))} ${i === 0 ? '<span class="gva-tag a">বর্তমান</span>' : ''}</b><small>@${esc(x.by)} · ${esc(rel(x.at))}</small></div><div class="gva-li-c">${i === 0 ? '' : `<button class="gva-sm lime2" data-act="restore" data-id="${esc(x.id)}">এই ভার্সনে ফিরুন</button>`}</div></div>`).join('')}</div>` : '<div class="gva-empty">এখনো কোনো ব্যাকআপ নেই — প্রথমবার প্রকাশ করলে তৈরি হবে।</div>'}`;
  }
  async function restore(id) {
    if (!confirm('এই ভার্সনে ফিরলে বর্তমান ওয়েবসাইট সাথে সাথে বদলে যাবে। নিশ্চিত?')) return;
    const r = await api('/api/content', { action: 'restore', id });
    if (!r.ok) { say(em(r), 'err'); return; }
    G.D = r.d.content; G.saved = JSON.stringify(G.D); S.dirty = false; S.need = true; updTop(); say('✓ আগের ভার্সনে ফেরা হয়েছে'); drawView();
  }

  /* ------------------------------------------------------------------ */
  /*  Account                                                            */
  /* ------------------------------------------------------------------ */
  function viewAccount(w) {
    w.innerHTML = `<h2 class="gva-h">আমার অ্যাকাউন্ট</h2><p class="gva-sub">${esc(S.me.name)} · @${esc(S.me.username)} · ${isOwner() ? 'মূল অ্যাডমিন' : 'এডিটর'}</p>
${isOwner() ? '<div class="gva-box"><h3>পাসওয়ার্ড</h3><div style="color:#d5e4cf">মূল অ্যাডমিনের পাসওয়ার্ড Vercel-এ <b>ADMIN_PASSWORD</b> নামের Environment Variable-এ আছে। বদলাতে Vercel → Settings → Environment Variables-এ এডিট করে রিডিপ্লয় করুন।</div></div>'
        : `<div class="gva-box"><h3>পাসওয়ার্ড বদলান</h3><form id="gva-pw"><label class="gva-f"><span>বর্তমান পাসওয়ার্ড</span><input name="cur" type="password" autocomplete="current-password" required></label>
<label class="gva-f"><span>নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)</span><input name="nw" type="password" minlength="8" autocomplete="new-password" required></label><button class="gva-btn lime">পাসওয়ার্ড বদলান</button><div class="gva-msg" id="gva-pwm"></div></form></div>`}
<div class="gva-box"><button class="gva-btn" data-act="logout">লগআউট</button></div>`;
    const f = $('#gva-pw');
    if (f) f.onsubmit = async (e) => {
      e.preventDefault(); const m = $('#gva-pwm');
      const r = await api('/api/auth', { action: 'password', current: f.cur.value, next: f.nw.value });
      m.className = 'gva-msg ' + (r.ok ? 'ok' : 'err'); m.textContent = r.ok ? 'পাসওয়ার্ড বদলানো হয়েছে ✓' : em(r); if (r.ok) f.reset();
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Publish                                                            */
  /* ------------------------------------------------------------------ */
  const walk = (o, fn) => { for (const k in o) { const v = o[k]; if (typeof v === 'string') fn(o, k, v); else if (v && typeof v === 'object') walk(v, fn); } };
  function pubBtns(txt, dis) { ['#gva-pub', '#gva-pub2'].forEach((s) => { const b = $(s); if (b) { b.textContent = txt; b.disabled = !!dis; } }); }
  async function publish() {
    if (S.busy) return;
    if (!S.tk) { showAuth('আগে লগইন করুন', 'err'); setPreview(false); return; }
    S.busy = true; pubBtns('প্রকাশ হচ্ছে…', true);
    try {
      const D = G.D, up = {}, jobs = [];
      walk(D, (o, k, v) => { if (v.startsWith('data:image/')) jobs.push([o, k, v]); });
      const total = new Set(jobs.map((j) => j[2])).size; let n = 0;
      for (const [o, k, v] of jobs) {
        if (!up[v]) {
          pubBtns('ছবি আপলোড ' + toB(++n) + '/' + toB(total), true);
          const r = await api('/api/upload', { dataUrl: v });
          if (!r.ok) throw { r, img: true };
          up[v] = r.d.url;
        }
        o[k] = up[v];
      }
      pubBtns('সেভ হচ্ছে…', true);
      const r = await api('/api/content', { action: 'publish', content: D });
      if (!r.ok) throw { r };
      D._meta = r.d.meta; G.saved = JSON.stringify(D); S.dirty = false; S.need = true;
      say('✓ ওয়েবসাইটে পরিবর্তন প্রকাশ হয়েছে');
    } catch (e) {
      if (e && e.r) say((e.img ? 'ছবি আপলোড হয়নি: ' : 'প্রকাশ করা যায়নি: ') + em(e.r), 'err'); else say('প্রকাশ করা যায়নি', 'err');
    }
    S.busy = false; pubBtns('প্রকাশ করুন', false);
    if (S.tk) { updTop(); if (S.view === 'dash' || S.view === 'sec' || CONTENT.includes(S.view)) redraw(); }
  }
  function discard() {
    if (!confirm('সব অপ্রকাশিত পরিবর্তন বাতিল করে সর্বশেষ প্রকাশিত অবস্থায় ফিরবেন?')) return;
    G.D = JSON.parse(G.saved); S.dirty = false; S.need = true; updTop(); redraw(); say('পরিবর্তন বাতিল করা হয়েছে');
  }

  /* ------------------------------------------------------------------ */
  /*  Click delegation                                                   */
  /* ------------------------------------------------------------------ */
  function onClick(e) {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const d = b.dataset, D = G.D, i = +d.i;
    switch (d.act) {
      case 'close': hide(); break;
      case 'tab': S.authTab = d.t; showAuth(); break;
      case 'go': go(d.v); break;
      case 'bell': go('users'); break;
      case 'preview': setPreview(true); break;
      case 'publish': publish(); break;
      case 'discard': discard(); break;
      case 'logout': logout(); break;
      case 'u': userAct(d); break;
      case 'restore': restore(d.id); break;
      case 'tog': D.layout[i].show = D.layout[i].show === false; mark(); redraw(); break;
      case 'up': if (i > 0) { [D.layout[i - 1], D.layout[i]] = [D.layout[i], D.layout[i - 1]]; mark(); redraw(); } break;
      case 'dn': if (i < D.layout.length - 1) { [D.layout[i + 1], D.layout[i]] = [D.layout[i], D.layout[i + 1]]; mark(); redraw(); } break;
      case 'edit': { const id = D.layout[i].id; if (secOf(id)) { S.view = 'sec'; S.sel = id; drawNav(); drawView(); mainEl.scrollTop = 0; } else go(EDIT_MAP[id] || 'dash'); break; }
      case 'dup': dupSection(i); break;
      case 'del': delSection(i); break;
      case 'add': addSection(d.t); break;
    }
  }

  window.GVAdmin = { open: () => { loadSession(); open(); } };
})();
