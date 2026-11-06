/* =========================================================
   TRUSTLENS — Application shell, router, dashboard, help
   ========================================================= */

import {
  $, $$, icon, escapeHtml, hydrateIcons, initialsFromName, riskBand, timeAgo,
  formatDate, navigate, debounce, RISK_COLORS, donutSVG, truncate, downloadFile, toast
} from './utils.js';
import * as Storage from './storage.js';
import { initNotifications, refreshNotifications } from './notifications.js';
import { renderAnalyzer } from './analyzer.js';
import { renderLinkInspector } from './link-inspector.js';
import { renderJournal, openRecord } from './journal.js';
import { renderThreatLibrary, openThreat, LIBRARY } from './threat-library.js';
import { renderReports } from './reports.js';
import { renderSettings } from './settings.js';

/* =========================================================
   Theme
   ========================================================= */

const media = window.matchMedia('(prefers-color-scheme: light)');

function resolveTheme(pref) {
  if (pref === 'system') return media.matches ? 'light' : 'dark';
  return pref === 'light' ? 'light' : 'dark';
}

function applyTheme(pref) {
  document.documentElement.setAttribute('data-theme', resolveTheme(pref));
  const btn = $('#themeIcon');
  if (btn) btn.innerHTML = icon(resolveTheme(pref) === 'dark' ? 'sun' : 'moon', 19);
}

media.addEventListener('change', () => {
  if (Storage.getTheme() === 'system') applyTheme('system');
});

/* =========================================================
   Dashboard tips
   ========================================================= */

const TIPS = [
  'Urgency is a tool. If a message pressures you to act within minutes, it is usually trying to stop you from checking.',
  'No legitimate organisation will ever ask for your password or a one-time verification code.',
  'Gift cards, crypto transfers and wire transfers are favourites of fraudsters because they cannot be reversed.',
  'Read the domain immediately before the final dot. “paypal.com.secure-login.xyz” belongs to secure-login.xyz, not PayPal.',
  'A small first payout is often bait. Scam platforms pay a little early to earn your trust before asking for a deposit.',
  'Verify job offers using a company website you type yourself — never a link supplied in the message.',
  'If an investment return is guaranteed, it is not an investment.',
  'Legitimate employers never ask candidates to pay registration, training or equipment fees.',
  'Two-factor authentication blocks most account-takeover attempts — enable it wherever it is offered.',
  'Back up your important data. Ransomware and account loss are far less painful when a backup exists.',
  'Screenshots of withdrawals and profits are trivially faked. They are not evidence of anything.',
  'If a stranger asks you to keep a conversation secret, that secrecy is protecting them, not you.'
];

let tipTimer = null;

function startTips(root) {
  const textEl = $('#tipText', root);
  const dotsEl = $('#tipDots', root);
  if (!textEl || !dotsEl) return () => {};

  let index = 0;
  dotsEl.innerHTML = TIPS.map((_, i) =>
    `<button class="tip-dot ${i === 0 ? 'is-active' : ''}" type="button" data-tip="${i}"
      aria-label="Show tip ${i + 1}"></button>`).join('');

  const renderTip = () => {
    textEl.textContent = TIPS[index];
    dotsEl.querySelectorAll('.tip-dot').forEach((d, i) => d.classList.toggle('is-active', i === index));
  };

  dotsEl.addEventListener('click', (e) => {
    const dot = e.target.closest('[data-tip]');
    if (!dot) return;
    index = Number(dot.dataset.tip);
    renderTip();
  });

  renderTip();
  tipTimer = setInterval(() => {
    index = (index + 1) % TIPS.length;
    renderTip();
  }, 8000);

  return () => { if (tipTimer) clearInterval(tipTimer); };
}

/* =========================================================
   Overview dashboard
   ========================================================= */

function renderOverview(root) {
  const history = Storage.getHistory();
  const saved = history.filter((r) => r.saved);

  const totalChecks = history.length;
  const highRisk = history.filter((r) => r.score >= 50).length;
  const savedCount = saved.length;
  const linksInspected = history.filter((r) => r.type === 'link').length;

  const recent = [...saved]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const dist = [
    { key: 'low', label: 'Low', value: history.filter((r) => r.score < 25).length, color: RISK_COLORS.low },
    { key: 'moderate', label: 'Moderate', value: history.filter((r) => r.score >= 25 && r.score < 50).length, color: RISK_COLORS.moderate },
    { key: 'high', label: 'High', value: history.filter((r) => r.score >= 50 && r.score < 75).length, color: RISK_COLORS.high },
    { key: 'critical', label: 'Critical', value: history.filter((r) => r.score >= 75).length, color: RISK_COLORS.critical }
  ];
  const totalDist = dist.reduce((s, d) => s + d.value, 0);

  root.innerHTML = `
    <div class="stack">

      <section class="hero">
        <svg class="hero__art" viewBox="0 0 240 240" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="heroShield" x1="40" y1="20" x2="200" y2="220" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FB923C" stop-opacity="0.92"/>
              <stop offset="1" stop-color="#EA580C" stop-opacity="0.28"/>
            </linearGradient>
          </defs>
          <circle cx="120" cy="120" r="86" stroke="rgba(249,115,22,.28)" stroke-width="1" stroke-dasharray="4 8"/>
          <circle cx="120" cy="120" r="64" stroke="rgba(249,115,22,.4)" stroke-width="1"/>
          <path d="M120 40 L182 66 V122 C182 164 154 190 120 204 C86 190 58 164 58 122 V66 Z"
                fill="url(#heroShield)" opacity="0.22" stroke="#FDBA74" stroke-width="2"/>
          <path d="M120 74 L164 92 V124 C164 152 145 170 120 180 C95 170 76 152 76 124 V92 Z"
                fill="none" stroke="#FDBA74" stroke-width="1.6" opacity="0.7"/>
          <circle cx="120" cy="124" r="26" stroke="#FDBA74" stroke-width="2"/>
          <circle cx="120" cy="124" r="11" fill="#FB923C"/>
        </svg>
        <div class="hero__inner">
          <span class="hero__eyebrow">${icon('shield-check', 13)} Personal scam awareness</span>
          <h2 class="hero__title">Your digital safety <span>starts here.</span></h2>
          <p class="hero__desc">Analyze suspicious messages, inspect questionable links and stay informed about digital threats.</p>
          <div class="hero__actions">
            <button class="btn btn--primary" type="button" data-go="analyzer">${icon('scan', 16)} Analyze a Message</button>
            <button class="btn btn--outline" type="button" data-go="inspector">${icon('link', 16)} Inspect a Link</button>
          </div>
        </div>
      </section>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card__top">
            <span class="stat-card__icon">${icon('activity', 19)}</span>
          </div>
          <p class="stat-card__value">${totalChecks}</p>
          <p class="stat-card__label">Total Checks</p>
        </div>
        <div class="stat-card">
          <div class="stat-card__top">
            <span class="stat-card__icon stat-card__icon--danger">${icon('alert-triangle', 19)}</span>
          </div>
          <p class="stat-card__value">${highRisk}</p>
          <p class="stat-card__label">High-Risk Findings</p>
        </div>
        <div class="stat-card">
          <div class="stat-card__top">
            <span class="stat-card__icon stat-card__icon--success">${icon('book', 19)}</span>
          </div>
          <p class="stat-card__value">${savedCount}</p>
          <p class="stat-card__label">Saved Investigations</p>
        </div>
        <div class="stat-card">
          <div class="stat-card__top">
            <span class="stat-card__icon stat-card__icon--warning">${icon('link', 19)}</span>
          </div>
          <p class="stat-card__value">${linksInspected}</p>
          <p class="stat-card__label">Links Inspected</p>
        </div>
      </div>

      <section>
        <h2 class="section-title" style="margin-bottom:12px">Quick actions</h2>
        <div class="qa-grid">
          <button class="qa-card" type="button" data-go="analyzer">
            <span class="qa-card__icon">${icon('scan', 20)}</span>
            <span class="qa-card__title">Analyze Message</span>
            <span class="qa-card__desc">Check a job offer, investment pitch or payment request for warning signs.</span>
            <span class="qa-card__arrow">Open analyzer ${icon('arrow-right', 14)}</span>
          </button>
          <button class="qa-card" type="button" data-go="inspector">
            <span class="qa-card__icon">${icon('link', 20)}</span>
            <span class="qa-card__title">Inspect Link</span>
            <span class="qa-card__desc">Examine a URL for deceptive structure, encoding and domain tricks.</span>
            <span class="qa-card__arrow">Open inspector ${icon('arrow-right', 14)}</span>
          </button>
          <button class="qa-card" type="button" data-go="journal">
            <span class="qa-card__icon">${icon('book', 20)}</span>
            <span class="qa-card__title">Security Journal</span>
            <span class="qa-card__desc">Review, annotate and manage every investigation you have saved.</span>
            <span class="qa-card__arrow">Open journal ${icon('arrow-right', 14)}</span>
          </button>
          <button class="qa-card" type="button" data-go="library">
            <span class="qa-card__icon">${icon('shield-check', 20)}</span>
            <span class="qa-card__title">Threat Library</span>
            <span class="qa-card__desc">Learn how the most common fraud patterns actually work.</span>
            <span class="qa-card__arrow">Browse library ${icon('arrow-right', 14)}</span>
          </button>
        </div>
      </section>

      <div class="chart-grid">
        <section class="panel">
          <div class="panel__head">
            <div>
              <h3 class="panel__title">Recent activity</h3>
              <p class="panel__desc">Your latest saved investigations.</p>
            </div>
            <button class="btn btn--ghost btn--sm" type="button" data-go="journal">View all</button>
          </div>
          ${recent.length === 0
            ? `<div class="empty">
                 <div class="empty__icon">${icon('book', 26)}</div>
                 <p class="empty__title">No investigations yet</p>
                 <p class="empty__desc">Run an analysis and save it to see it listed here.</p>
                 <button class="btn btn--primary btn--sm" type="button" data-go="analyzer">${icon('scan', 15)} Analyze a message</button>
               </div>`
            : `<div class="activity-list">
                 ${recent.map((r) => `
                   <div class="activity-item">
                     <div class="activity-item__icon">${icon(r.type === 'link' ? 'link' : 'message', 17)}</div>
                     <div class="activity-item__main">
                       <p class="activity-item__title">${escapeHtml(r.title)}</p>
                       <p class="activity-item__meta">
                         <span>${r.type === 'link' ? 'Link inspection' : 'Message analysis'}</span>
                         <span>·</span>
                         <span>${escapeHtml(timeAgo(r.createdAt))}</span>
                       </p>
                     </div>
                     <div class="activity-item__right">
                       <span class="chip chip--${r.riskKey}">${escapeHtml(r.riskLabel)}</span>
                       <span class="activity-item__score">${r.score}</span>
                     </div>
                   </div>`).join('')}
               </div>`}
        </section>

        <section class="panel">
          <div class="panel__head">
            <div>
              <h3 class="panel__title">Threat distribution</h3>
              <p class="panel__desc">All recorded checks by risk level.</p>
            </div>
          </div>
          ${totalDist === 0
            ? `<div class="empty" style="padding:34px 12px">
                 <div class="empty__icon">${icon('chart', 24)}</div>
                 <p class="empty__title">No data yet</p>
                 <p class="empty__desc">Charts appear once you run an analysis or inspection.</p>
               </div>`
            : `<div class="dist-grid">
                 ${donutSVG(dist, { size: 172, thickness: 20 })}
                 <div class="legend">
                   ${dist.map((d) => `<div class="legend__item">
                     <span class="legend__dot" style="background:${d.color}"></span>
                     <span class="legend__label">${d.label} risk</span>
                     <span class="legend__value">${d.value}</span>
                   </div>`).join('')}
                 </div>
               </div>`}
        </section>
      </div>

      <section class="tip-banner">
        <div class="tip-banner__icon">${icon('sparkles', 20)}</div>
        <div class="tip-banner__body">
          <p class="tip-banner__label">Security awareness tip</p>
          <p class="tip-banner__text" id="tipText"></p>
        </div>
        <div class="tip-banner__nav" id="tipDots"></div>
      </section>

    </div>`;

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-go]');
    if (btn) navigate(btn.dataset.go);
  });

  const stopTips = startTips(root);
  return stopTips;
}

/* =========================================================
   Help & About
   ========================================================= */

function renderHelp(root) {
  root.innerHTML = `
    <div class="stack">

      <section class="panel">
        <div class="row row--top row--wrap" style="gap:20px">
          <img src="assets/logo/mark.svg" alt="TRUSTLENS logo" width="64" height="64"
               style="filter:drop-shadow(0 10px 20px rgba(249,115,22,.35))" />
          <div class="grow">
            <h2 class="panel__title" style="font-size:20px">TRUSTLENS</h2>
            <p class="muted" style="font-size:13.5px;margin-top:6px;max-width:70ch;line-height:1.7">
              A personal digital security and scam-awareness platform. TRUSTLENS examines suspicious
              messages and links against a library of known fraud patterns so you can see the risk
              before you trust. Everything runs locally in your browser.
            </p>
            <div class="row row--wrap" style="margin-top:14px;gap:8px">
              <span class="chip chip--accent">Version 1.0.0</span>
              <span class="chip chip--neutral">No backend</span>
              <span class="chip chip--neutral">LocalStorage only</span>
              <span class="chip chip--neutral">No tracking</span>
            </div>
          </div>
        </div>
      </section>

      <details class="help-section" open>
        <summary>What TRUSTLENS does</summary>
        <div class="help-section__body">
          <p>TRUSTLENS gives you a structured second opinion before you act on a suspicious message or link. It has three core jobs:</p>
          <ul>
            <li><strong>Scam Analyzer</strong> — reads pasted text and scores it against 14 weighted scam indicators.</li>
            <li><strong>Link Inspector</strong> — analyses the structure of a URL for deception patterns.</li>
            <li><strong>Security Journal</strong> — stores the investigations you choose to save, with your own notes.</li>
          </ul>
          <p>It also includes an educational Threat Library and a Reports dashboard built entirely from your stored records.</p>
        </div>
      </details>

      <details class="help-section">
        <summary>How to use the Scam Analyzer</summary>
        <div class="help-section__body">
          <p>Paste the full message — including any greeting, links and contact details — into the textarea, then select <strong>Analyze Message</strong>. The rule engine checks for indicators such as guaranteed income, upfront payment requests, urgency, OTP requests and off-platform pressure.</p>
          <p>Each detected indicator shows its severity, score contribution, an explanation and a recommended precaution. You can then copy the results or save the investigation to your journal.</p>
          <p>If no indicators are found, the message is <em>not</em> proven safe — it simply contains none of the patterns TRUSTLENS knows about.</p>
        </div>
      </details>

      <details class="help-section">
        <summary>How to use the Link Inspector</summary>
        <div class="help-section__body">
          <p>Enter a URL and select <strong>Inspect Link</strong>. TRUSTLENS parses the address with the browser's URL parser and looks for structural warnings: plain HTTP, raw IP addresses, deep subdomain chains, punycode, embedded credentials, URL shorteners, high-abuse domain suffixes, brand impersonation and unusual encoding.</p>
          <p><strong>TRUSTLENS never opens the link.</strong> It does not contact Google Safe Browsing, VirusTotal, DNS reputation services, SSL validators or malware databases. A clean result means only that the address structure looked unremarkable.</p>
        </div>
      </details>

      <details class="help-section">
        <summary>How risk scores work</summary>
        <div class="help-section__body">
          <p>Every detected indicator carries a weight. The weights are summed, a small bonus is added when several different categories appear together, and the total is capped at 100.</p>
          <ul>
            <li><strong>0 – 24</strong> · Low risk</li>
            <li><strong>25 – 49</strong> · Moderate risk</li>
            <li><strong>50 – 74</strong> · High risk</li>
            <li><strong>75 – 100</strong> · Critical risk</li>
          </ul>
          <p>A single ordinary keyword will not push a message into a high band — context and multiple indicators are required.</p>
        </div>
      </details>

      <details class="help-section">
        <summary>How investigations are saved</summary>
        <div class="help-section__body">
          <p>Every analysis is recorded locally so the dashboard statistics stay accurate. Only records you explicitly save appear in the Security Journal. You can add personal notes, edit them, delete individual records or clear everything from Settings.</p>
        </div>
      </details>

      <details class="help-section">
        <summary>Exporting and importing backups</summary>
        <div class="help-section__body">
          <p>Settings → <strong>Export all data</strong> downloads a JSON backup containing your settings, profile, investigation history and notifications. <strong>Import backup</strong> merges a previous backup without overwriting any existing records — duplicates are skipped.</p>
          <p>The Security Journal also has its own export for saved investigations only, and Reports can export an analytics snapshot.</p>
        </div>
      </details>

      <details class="help-section">
        <summary>Privacy</summary>
        <div class="help-section__body">
          <p>TRUSTLENS has no backend, no analytics and no third-party tracking. Nothing you type is transmitted anywhere. All data is written to this browser's LocalStorage on this device.</p>
          <p>Because of that, records are not synchronised between devices and disappear if you clear browser data or use private browsing. Export a backup if the records matter to you.</p>
        </div>
      </details>

      <details class="help-section">
        <summary>Limitations and disclaimer</summary>
        <div class="help-section__body">
          <p>TRUSTLENS is a pattern-matching awareness tool, not a security product or a verification service. It cannot confirm that a person, company, website or opportunity is fraudulent, and it cannot confirm that they are legitimate either.</p>
          <p>Scores reflect only the rules built into this version. A low score is not a guarantee of safety. Always verify through independent, official channels before sending money or personal information.</p>
        </div>
      </details>

      <div class="disclaimer">
        <span class="disclaimer__icon">${icon('alert-triangle', 18)}</span>
        <span>TRUSTLENS identifies potential warning signs using predefined detection rules. It does not independently verify whether a person, company or opportunity is fraudulent.</span>
      </div>
    </div>`;
}

/* =========================================================
   Routing
   ========================================================= */

const ROUTES = {
  overview: { title: 'Overview', eyebrow: 'Workspace', render: renderOverview },
  analyzer: { title: 'Scam Analyzer', eyebrow: 'Detection', render: renderAnalyzer },
  inspector: { title: 'Link Inspector', eyebrow: 'Detection', render: renderLinkInspector },
  journal: { title: 'Security Journal', eyebrow: 'Records', render: renderJournal },
  library: { title: 'Threat Library', eyebrow: 'Learn', render: renderThreatLibrary },
  reports: { title: 'Reports & Analytics', eyebrow: 'Insights', render: renderReports },
  settings: { title: 'Settings', eyebrow: 'Support', render: renderSettings },
  help: { title: 'Help & About', eyebrow: 'Support', render: renderHelp }
};

let currentCleanup = null;

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
  return { name: parts[0] || '', params: parts.slice(1) };
}

function renderRoute(name, params) {
  const key = ROUTES[name] ? name : 'overview';
  const route = ROUTES[key];
  const viewRoot = $('#view-root');

  if (typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch { /* noop */ }
    currentCleanup = null;
  }

  $('#pageTitle').textContent = route.title;
  $('#pageEyebrow').textContent = route.eyebrow;
  document.title = `${route.title} · TRUSTLENS`;

  $$('#sidebarNav .nav-item').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.route === key);
  });

  viewRoot.innerHTML = '';
  const cleanup = route.render(viewRoot, params);
  currentCleanup = typeof cleanup === 'function' ? cleanup : null;

  viewRoot.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'auto' });

  document.body.classList.remove('nav-open');
  updateScrim();
  updateStorageMeter();
}

function handleRoute() {
  const { name, params } = parseHash();
  if (!name) {
    const fallback = Storage.getSettings().defaultView || 'overview';
    location.replace(`#/${ROUTES[fallback] ? fallback : 'overview'}`);
    return;
  }
  renderRoute(name, params);
}

/* =========================================================
   Shell wiring
   ========================================================= */

function updateScrim() {
  const scrim = $('#scrim');
  if (!scrim) return;
  const open = document.body.classList.contains('nav-open');
  scrim.hidden = !open;
}

function updateStorageMeter() {
  const summary = Storage.storageSummary();
  const value = $('#storageValue');
  const bar = $('#storageBar');
  if (value) value.textContent = summary.label;
  if (bar) bar.style.width = `${Math.max(1, summary.percent).toFixed(1)}%`;
}

function updateAvatar() {
  const profile = Storage.getProfile();
  const initials = (profile.initials || initialsFromName(profile.name)).slice(0, 3).toUpperCase();
  const el = $('#avatarInitials');
  if (el) el.textContent = initials;
}

function initSidebar() {
  const toggle = $('#sidebarToggle');
  const savedCollapsed = localStorage.getItem('tl_sidebar_collapsed') === '1';
  if (savedCollapsed) document.body.classList.add('sidebar-collapsed');

  toggle?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('tl_sidebar_collapsed', document.body.classList.contains('sidebar-collapsed') ? '1' : '0');
    toggle.setAttribute('aria-expanded', String(!document.body.classList.contains('sidebar-collapsed')));
  });

  $('#menuBtn')?.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
    updateScrim();
  });

  $('#scrim')?.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    updateScrim();
  });

  $('#sidebarNav')?.addEventListener('click', (e) => {
    const item = e.target.closest('.nav-item');
    if (!item) return;
    document.body.classList.remove('nav-open');
    updateScrim();
  });
}

function initTheme() {
  applyTheme(Storage.getTheme());
  $('#themeBtn')?.addEventListener('click', () => {
    const resolved = document.documentElement.getAttribute('data-theme');
    const next = resolved === 'dark' ? 'light' : 'dark';
    Storage.setTheme(next);
    applyTheme(next);
    toast(`Switched to ${next} theme.`, 'success', 2000);
  });
  window.addEventListener('tl:theme-changed', (e) => applyTheme(e.detail || Storage.getTheme()));
}

function initProfileMenu() {
  const btn = $('#profileBtn');
  const menu = $('#profileMenu');
  if (!btn || !menu) return;

  const render = () => {
    const profile = Storage.getProfile();
    menu.innerHTML = `
      <div class="profile-menu__head">
        <p class="profile-menu__name">${escapeHtml(profile.name)}</p>
        <p class="profile-menu__sub">Local profile · not verified</p>
      </div>
      <button class="menu-item" type="button" data-act="settings">${icon('settings', 16)} Settings</button>
      <button class="menu-item" type="button" data-act="export">${icon('download', 16)} Export all data</button>
      <button class="menu-item" type="button" data-act="library">${icon('shield-check', 16)} Threat Library</button>
      <button class="menu-item" type="button" data-act="help">${icon('help', 16)} Help &amp; About</button>`;
  };

  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = menu.hidden;
    if (willOpen) render();
    menu.hidden = !willOpen;
    btn.setAttribute('aria-expanded', String(willOpen));
  });

  menu.addEventListener('click', (e) => {
    const item = e.target.closest('[data-act]');
    if (!item) return;
    close();
    const act = item.dataset.act;
    if (act === 'settings') navigate('settings');
    else if (act === 'library') navigate('library');
    else if (act === 'help') navigate('help');
    else if (act === 'export') {
      downloadFile(`trustlens-backup-${Date.now()}.json`, JSON.stringify(Storage.exportAll(), null, 2));
      Storage.addNotification('Full application backup exported.', 'success');
      toast('Backup exported.', 'success');
    }
  });

  document.addEventListener('click', (e) => {
    if (menu.hidden) return;
    if (menu.contains(e.target) || btn.contains(e.target)) return;
    close();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  window.addEventListener('tl:profile-changed', () => { updateAvatar(); render(); });
}

function initSearch() {
  const input = $('#globalSearch');
  const panel = $('#searchResults');
  if (!input || !panel) return;

  const close = () => { panel.hidden = true; panel.innerHTML = ''; };

  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { close(); return; }

    const records = Storage.getSaved().filter((r) =>
      r.title.toLowerCase().includes(q) || r.input.toLowerCase().includes(q)).slice(0, 5);

    const threats = LIBRARY.filter((t) =>
      t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)).slice(0, 4);

    if (!records.length && !threats.length) {
      panel.innerHTML = `<p class="search-empty">No results for “${escapeHtml(input.value)}”</p>`;
      panel.hidden = false;
      return;
    }

    panel.innerHTML = `
      ${records.length ? `<p class="search-group__label">Investigations</p>
        ${records.map((r) => `<button class="search-result" type="button" data-type="record" data-id="${escapeHtml(r.id)}">
          ${icon(r.type === 'link' ? 'link' : 'message', 15)}
          <span class="search-result__title">${escapeHtml(r.title)}</span>
          <span class="search-result__meta">${r.score}</span>
        </button>`).join('')}` : ''}
      ${threats.length ? `<p class="search-group__label">Threat library</p>
        ${threats.map((t) => `<button class="search-result" type="button" data-type="threat" data-id="${escapeHtml(t.id)}">
          ${icon(t.icon, 15)}
          <span class="search-result__title">${escapeHtml(t.title)}</span>
          <span class="search-result__meta">${icon('arrow-right', 13)}</span>
        </button>`).join('')}` : ''}`;
    panel.hidden = false;
  };

  input.addEventListener('input', debounce(run, 180));
  input.addEventListener('focus', () => { if (input.value.trim()) run(); });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { input.value = ''; close(); input.blur(); }
    if (e.key === 'Enter') {
      const first = panel.querySelector('.search-result');
      if (first) first.click();
    }
  });

  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('.search-result');
    if (!btn) return;
    const { type, id } = btn.dataset;
    close();
    input.value = '';
    if (type === 'record') navigate('journal', [id]);
    else navigate('library', [id]);
  });

  document.addEventListener('click', (e) => {
    if (panel.hidden) return;
    if (panel.contains(e.target) || input.contains(e.target)) return;
    close();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* =========================================================
   Bootstrap
   ========================================================= */

function boot() {
  hydrateIcons();
  initTheme();
  initSidebar();
  initProfileMenu();
  initSearch();
  initNotifications();
  updateAvatar();
  updateStorageMeter();

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('tl:history-changed', () => {
    updateStorageMeter();
    refreshNotifications();
  });
  window.addEventListener('tl:profile-changed', updateAvatar);

  handleRoute();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
