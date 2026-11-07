/* =========================================================
   TRUSTLENS — Reputation Check page
   Handles brand names AND URLs in a single input.
   ========================================================= */

import {
  $, escapeHtml, icon, toast, formatDate, timeAgo, riskBand
} from './utils.js';
import * as Storage from './storage.js';
import {
  LEGIT_BRANDS, SCAM_PATTERNS, isUrlLike, lookupBrand, checkHostAgainstBrands
} from './reputation-data.js';

let lastRecordId = null;

/* -------- Rendering helpers -------- */

function verdictHeader(kind) {
  const map = {
    legit:      { icon: 'check-circle',    tone: 'success', eyebrow: 'KNOWN LEGITIMATE BRAND', title: 'This brand is recognised' },
    scam:       { icon: 'alert-octagon',   tone: 'danger',  eyebrow: 'KNOWN SCAM PATTERN',      title: 'This matches a known scam' },
    impersonation: { icon: 'alert-triangle', tone: 'danger', eyebrow: 'POSSIBLE IMPERSONATION', title: 'This looks like brand impersonation' },
    unknown:    { icon: 'help',            tone: 'warning', eyebrow: 'NOT IN OUR DATABASE',     title: 'Unknown — verify independently' }
  };
  const v = map[kind] || map.unknown;
  const bg = kind === 'legit' ? 'var(--success-soft)'
    : kind === 'unknown' ? 'var(--warning-soft)'
    : 'var(--danger-soft)';
  const fg = kind === 'legit' ? 'var(--success)'
    : kind === 'unknown' ? 'var(--warning)'
    : 'var(--danger)';
  return `<div class="row" style="gap:16px;align-items:flex-start">
    <div style="width:56px;height:56px;border-radius:16px;display:grid;place-items:center;background:${bg};color:${fg};flex:none">
      ${icon(v.icon, 26)}
    </div>
    <div style="min-width:0">
      <p class="tiny strong" style="letter-spacing:.12em;color:${fg};margin-bottom:4px">${v.eyebrow}</p>
      <h2 style="font-size:21px;font-weight:800;letter-spacing:-.01em;line-height:1.2">${escapeHtml(v.title)}</h2>
    </div>
  </div>`;
}

function legitCard(brand) {
  return `<section class="panel">
    ${verdictHeader('legit')}
    <hr class="divider" style="margin:22px 0" />
    <div class="row row--between row--wrap" style="margin-bottom:14px">
      <div>
        <h3 style="font-size:17px;font-weight:700">${escapeHtml(brand.name)}</h3>
        <p class="small subtle" style="margin-top:2px">${escapeHtml(brand.category)}</p>
      </div>
      <span class="chip chip--low">${icon('check', 12)} Legitimate</span>
    </div>

    <div class="detail-section">
      <h4>Official domains</h4>
      <ul class="detail-list">
        ${brand.domains.map((d) => `<li><code style="background:var(--surface-inset);padding:2px 8px;border-radius:6px;font-size:12px">${escapeHtml(d)}</code></li>`).join('')}
      </ul>
    </div>

    <div class="detail-section">
      <h4>Important safety notes</h4>
      <ul class="detail-list">
        ${brand.notes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}
      </ul>
    </div>

    <div class="info-box" style="margin-top:18px">
      <span class="info-box__icon">${icon('info', 18)}</span>
      <span>Being in our legitimate list means this is a real, well-known company. It does <strong>not</strong> mean every message claiming to be from them is genuine — scammers frequently impersonate real brands.</span>
    </div>
  </section>`;
}

function scamCard(scam) {
  return `<section class="panel">
    ${verdictHeader('scam')}
    <hr class="divider" style="margin:22px 0" />
    <h3 style="font-size:17px;font-weight:700;margin-bottom:4px">${escapeHtml(scam.name)}</h3>
    <p class="small subtle" style="margin-bottom:16px">${escapeHtml(scam.category)}</p>

    <div class="detail-section">
      <h4>What this is</h4>
      <p class="muted" style="font-size:13.5px;line-height:1.7">${escapeHtml(scam.summary)}</p>
    </div>

    <div class="detail-section">
      <h4>Critical warning</h4>
      <div class="scenario-box" style="border-left-color:var(--danger)">${escapeHtml(scam.warning)}</div>
    </div>

    <div class="detail-section">
      <h4>Red flags to check</h4>
      <ul class="detail-list">
        ${scam.redFlags.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
      </ul>
    </div>

    <div class="disclaimer" style="margin-top:18px">
      <span class="disclaimer__icon">${icon('alert-octagon', 18)}</span>
      <span>Do not send money, personal information or account credentials to anyone associated with this pattern. If you have already paid, contact your bank immediately.</span>
    </div>
  </section>`;
}

function impersonationCard(result, url) {
  return `<section class="panel">
    ${verdictHeader('impersonation')}
    <hr class="divider" style="margin:22px 0" />

    <div class="detail-section">
      <h4>Why this is suspicious</h4>
      <p class="muted" style="font-size:13.5px;line-height:1.7">
        The address <code style="background:var(--surface-inset);padding:2px 8px;border-radius:6px">${escapeHtml(url)}</code>
        contains the name <strong>${escapeHtml(result.data.name)}</strong>, but the real domain is
        <strong>${escapeHtml(result.officialDomain)}</strong>. This is a classic impersonation pattern.
      </p>
    </div>

    <div class="detail-section">
      <h4>What the real brand is</h4>
      <p class="muted" style="font-size:13.5px;line-height:1.7">${escapeHtml(result.data.name)} — ${escapeHtml(result.data.category)}</p>
      <ul class="detail-list" style="margin-top:8px">
        <li>Official domain: <strong>${escapeHtml(result.officialDomain)}</strong></li>
        ${result.data.notes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}
      </ul>
    </div>

    <div class="disclaimer" style="margin-top:18px">
      <span class="disclaimer__icon">${icon('alert-octagon', 18)}</span>
      <span>Do not enter any information on the page behind this link. Navigate to ${escapeHtml(result.officialDomain)} directly if you need to reach the real ${escapeHtml(result.data.name)}.</span>
    </div>
  </section>`;
}

function legitDomainCard(brand, url) {
  return `<section class="panel">
    ${verdictHeader('legit')}
    <hr class="divider" style="margin:22px 0" />
    <div class="row row--between row--wrap" style="margin-bottom:14px">
      <div>
        <h3 style="font-size:17px;font-weight:700">${escapeHtml(brand.name)}</h3>
        <p class="small subtle" style="margin-top:2px">${escapeHtml(url)} is an official domain</p>
      </div>
      <span class="chip chip--low">${icon('check', 12)} Official domain</span>
    </div>
    <div class="detail-section">
      <h4>Safety notes</h4>
      <ul class="detail-list">${brand.notes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>
    </div>
    <div class="info-box" style="margin-top:18px">
      <span class="info-box__icon">${icon('info', 18)}</span>
      <span>The domain matches our records for ${escapeHtml(brand.name)}, but this only confirms the <strong>address</strong> — not the content of the page. Always check what a page asks you to do.</span>
    </div>
  </section>`;
}

function unknownCard(query) {
  return `<section class="panel">
    ${verdictHeader('unknown')}
    <hr class="divider" style="margin:22px 0" />
    <p class="muted" style="font-size:13.5px;line-height:1.7">
      "<strong>${escapeHtml(query)}</strong>" is not in our curated database of known brands or scam patterns.
      This does not mean it is safe or dangerous — it simply means we have no information about it yet.
    </p>
    <div class="detail-section" style="margin-top:20px">
      <h4>What to do next</h4>
      <ul class="detail-list">
        <li>Search the company name plus the word "scam" or "reviews" in a search engine.</li>
        <li>Check if the company has an official website with a real address and contact details.</li>
        <li>Look for the company on a financial or trade regulator's public register if relevant.</li>
        <li>Paste the full message into the <strong>Scam Analyzer</strong> for a pattern check.</li>
        <li>If they sent a link, paste the URL into the <strong>Link Inspector</strong> for structural analysis.</li>
      </ul>
    </div>
    <div class="info-box" style="margin-top:18px">
      <span class="info-box__icon">${icon('info', 18)}</span>
      <span>Unknown companies are not automatically scams — but you should always verify them independently before sending money, personal data or credentials.</span>
    </div>
  </section>`;
}

/* -------- Handler -------- */

function handleLookup(rawValue, resultHost) {
  const value = String(rawValue || '').trim();
  if (!value) {
    toast('Please enter a brand name or URL.', 'warning');
    return;
  }

  let html = '';
  let record = null;

  if (isUrlLike(value)) {
    const candidate = /^https?:\/\//i.test(value) ? value : 'https://' + value;
    let url;
    try { url = new URL(candidate); }
    catch { toast('That does not look like a valid URL.', 'error'); return; }

    const host = url.hostname.toLowerCase();
    const brandResult = checkHostAgainstBrands(host);

    if (brandResult.type === 'legit-domain') {
      html = legitDomainCard(brandResult.data, value);
      record = {
        type: 'link',
        title: brandResult.data.name + ' — Official domain confirmed',
        input: value,
        score: 2,
        findings: [{
          label: 'Official domain',
          severity: 'low',
          score: 0,
          description: host + ' is a confirmed official domain of ' + brandResult.data.name + '.'
        }],
        recommendations: brandResult.data.notes
      };
    } else if (brandResult.type === 'impersonation') {
      html = impersonationCard(brandResult, value);
      record = {
        type: 'link',
        title: 'Impersonation: ' + host + ' mimics ' + brandResult.data.name,
        input: value,
        score: 82,
        findings: [{
          label: 'Possible brand impersonation of ' + brandResult.data.name,
          severity: 'high',
          score: 20,
          description: 'The domain ' + host + ' contains the name "' + brandResult.data.name + '" but the real domain is ' + brandResult.officialDomain + '.'
        }],
        recommendations: ['Do not enter information on this page.', 'Navigate to ' + brandResult.officialDomain + ' directly.']
      };
    } else if (brandResult.type === 'scam-domain') {
      html = scamCard(brandResult.data);
      record = {
        type: 'link',
        title: brandResult.data.name + ' — scam domain detected',
        input: value,
        score: 92,
        findings: [{
          label: 'Known scam pattern in domain',
          severity: 'critical',
          score: 30,
          description: brandResult.data.summary
        }],
        recommendations: brandResult.data.redFlags
      };
    } else {
      html = unknownCard(value) +
        '<div class="info-box" style="margin-top:16px"><span class="info-box__icon">' + icon('link', 18) +
        '</span><span>For a detailed URL structure analysis, use the <a href="#/inspector" style="color:var(--accent);font-weight:600">Link Inspector</a>.</span></div>';
      record = null;
    }
  } else {
    const result = lookupBrand(value);

    if (result.type === 'legit') {
      html = legitCard(result.data);
      record = {
        type: 'link',
        title: result.data.name + ' — Legitimate brand',
        input: value,
        score: 5,
        findings: [{
          label: result.data.name + ' is a known legitimate brand',
          severity: 'low',
          score: 0,
          description: 'Official domains: ' + result.data.domains.join(', ') + '. Category: ' + result.data.category + '.'
        }],
        recommendations: result.data.notes
      };
    } else if (result.type === 'scam') {
      html = scamCard(result.data);
      record = {
        type: 'link',
        title: result.data.name + ' — Scam pattern warning',
        input: value,
        score: 90,
        findings: [{
          label: 'Known scam pattern: ' + result.data.name,
          severity: 'critical',
          score: 30,
          description: result.data.summary
        }],
        recommendations: result.data.redFlags
      };
    } else {
      html = unknownCard(value);
      record = null;
    }
  }

  resultHost.innerHTML = html;

  if (record) {
    const band = riskBand(record.score);
    record.riskKey = band.key;
    record.riskLabel = band.label;
    record.findings = record.findings.map((f) => ({ ...f, category: 'Reputation check', precaution: '' }));
    const stored = Storage.addCheck(record);
    lastRecordId = stored ? stored.id : null;

    if (Storage.getSettings().notifyAnalysis) {
      Storage.addNotification(
        'Reputation check: ' + record.title + ' (' + record.score + '/100).',
        record.score >= 50 ? 'warning' : 'info'
      );
    }

    resultHost.insertAdjacentHTML('beforeend', `
      <div class="row row--wrap" style="gap:10px">
        <button class="btn btn--primary" type="button" id="repSaveBtn">
          ${icon('save', 16)} Save to Journal
        </button>
        <button class="btn btn--outline" type="button" id="repAgainBtn">
          ${icon('refresh', 16)} Check Another
        </button>
      </div>`);

    const saveBtn = $('#repSaveBtn', resultHost);
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (!lastRecordId) return;
        if (Storage.saveInvestigation(lastRecordId)) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = icon('check', 16) + ' Saved';
          toast('Saved to your Security Journal.', 'success');
          if (Storage.getSettings().notifySave) {
            Storage.addNotification('Reputation check saved to the Security Journal.', 'success');
          }
        }
      });
    }

    const againBtn = $('#repAgainBtn', resultHost);
    if (againBtn) {
      againBtn.addEventListener('click', () => {
        const input = $('#repInput');
        if (input) {
          input.value = '';
          input.focus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  resultHost.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* -------- Page render -------- */

export function renderReputationCheck(root) {
  lastRecordId = null;

  root.innerHTML = `
    <div class="stack">
      <section class="panel">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">Reputation Check</h2>
            <p class="panel__desc">
              Look up a company, brand, or website URL against our curated database of
              known legitimate brands and known scam patterns. Type a name like
              "<strong>handshake ai</strong>" or "<strong>uber eats</strong>", or paste a URL.
            </p>
          </div>
        </div>

        <label class="field">
          <span class="field__label">Brand name, company, or URL</span>
          <input id="repInput" class="input" type="text" autocomplete="off" spellcheck="false"
                 placeholder="e.g. handshake ai, uber eats, ubereats.com, paypal-login.top" />
        </label>

        <div class="row row--between row--wrap" style="margin-top:14px">
          <p class="tiny subtle">Curated offline database. Not a live verification service.</p>
          <div class="row">
            <button class="btn btn--ghost" type="button" id="repClearBtn">Clear</button>
            <button class="btn btn--primary" type="button" id="repCheckBtn">
              ${icon('search', 16)} Check
            </button>
          </div>
        </div>

        <div class="row row--wrap" style="margin-top:16px;gap:8px">
          <span class="tiny subtle strong">Try an example:</span>
          <button class="chip-btn" type="button" data-example="handshake ai">handshake ai</button>
          <button class="chip-btn" type="button" data-example="uber eats">uber eats</button>
          <button class="chip-btn" type="button" data-example="ubereats.com">ubereats.com</button>
          <button class="chip-btn" type="button" data-example="paypal-login.top">paypal-login.top</button>
        </div>
      </section>

      <div id="repResult"></div>
    </div>`;

  const input = $('#repInput', root);
  const resultHost = $('#repResult', root);
  const checkBtn = $('#repCheckBtn', root);

  checkBtn.addEventListener('click', () => handleLookup(input.value, resultHost));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkBtn.click(); });

  $('#repClearBtn', root).addEventListener('click', () => {
    input.value = '';
    resultHost.innerHTML = '';
    lastRecordId = null;
    input.focus();
  });

  root.querySelectorAll('[data-example]').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.example;
      handleLookup(btn.dataset.example, resultHost);
    });
  });
}
