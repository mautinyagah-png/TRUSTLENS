/* =========================================================
   TRUSTLENS — Link Inspector (local URL pattern analysis)
   ========================================================= */

import {
  $, escapeHtml, icon, riskBand, clamp, toast, copyText, formatDate, truncate
} from './utils.js';
import * as Storage from './storage.js';

const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly',
  'cutt.ly', 'rebrand.ly', 'shorturl.at', 'tiny.cc', 'rb.gy', 'shorte.st', 'adf.ly'];

const HIGH_RISK_TLDS = ['tk', 'ml', 'ga', 'cf', 'gq'];
const ABUSED_TLDS = ['zip', 'mov', 'top', 'click', 'loan', 'work', 'cam', 'rest', 'buzz', 'country', 'stream'];

const BRANDS = ['paypal', 'apple', 'amazon', 'microsoft', 'google', 'facebook', 'instagram',
  'whatsapp', 'netflix', 'binance', 'coinbase', 'outlook', 'icloud', 'office365', 'dhl', 'fedex'];

const OFFICIAL = {
  paypal: 'paypal.com', apple: 'apple.com', amazon: 'amazon.com', microsoft: 'microsoft.com',
  google: 'google.com', facebook: 'facebook.com', instagram: 'instagram.com',
  whatsapp: 'whatsapp.com', netflix: 'netflix.com', binance: 'binance.com',
  coinbase: 'coinbase.com', outlook: 'outlook.com', icloud: 'icloud.com',
  office365: 'office.com', dhl: 'dhl.com', fedex: 'fedex.com'
};

const SENSITIVE_WORDS = /\b(login|signin|sign-in|verify|verification|secure|update|account|billing|payment|wallet|confirm|unlock|recovery)\b/i;

function hostLabels(host) {
  return host.split('.').filter(Boolean);
}

function isIpHost(host) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  if (host.startsWith('[') && host.endsWith(']')) return true;
  if (/^\d+$/.test(host)) return true;
  return false;
}

export function inspectUrl(raw) {
  const submitted = String(raw || '').trim();
  const findings = [];

  if (!submitted) return { error: 'Please enter a URL to inspect.' };

  const hadScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(submitted);
  const candidate = hadScheme ? submitted : `https://${submitted}`;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    return { error: 'That does not look like a valid URL. Try something like example.com/page.' };
  }

  if (!/^https?:$/.test(url.protocol)) {
    return { error: 'Only http and https links can be inspected.' };
  }

  const host = url.hostname.toLowerCase();
  const labels = hostLabels(host);
  const tld = labels.length > 1 ? labels[labels.length - 1] : '';
  const pathAndQuery = `${url.pathname}${url.search}`;

  const add = (id, label, severity, score, description, precaution) => {
    findings.push({ id, label, severity, score, description, precaution, category: 'URL pattern' });
  };

  /* 1. Protocol */
  if (url.protocol === 'http:') {
    add('http', 'Connection is not encrypted (HTTP)', 'medium', 12,
      'The link uses plain HTTP, so data sent to the page could be intercepted. Modern legitimate sites use HTTPS.',
      'Avoid entering personal details or passwords on an HTTP page.');
  }

  if (!hadScheme) {
    add('no-scheme', 'No protocol specified', 'low', 4,
      'The link was entered without http:// or https://. TRUSTLENS assumed HTTPS for structural analysis only.',
      'Check the address bar to see which protocol the site actually uses.');
  }

  /* 2. IP address host */
  if (isIpHost(host)) {
    add('ip-host', 'IP address used instead of a domain name', 'high', 24,
      'Legitimate services publish a domain name. Links pointing directly at raw IP addresses are often used to hide ownership.',
      'Do not enter credentials on a page reached through a raw IP address.');
  }

  /* 3. Excessive subdomains */
  if (labels.length >= 5) {
    add('subdomains', 'Unusually deep subdomain chain', 'medium', 12,
      `This address has ${labels.length} levels. Attackers stack subdomains to make a fake link look like part of a real brand.`,
      'Read the domain immediately before the final suffix — that is the real owner.');
  } else if (labels.length === 4) {
    add('subdomains', 'Multiple subdomains', 'low', 6,
      'The address has several subdomain levels, which is sometimes used to disguise the true domain.',
      'Check the registrable domain carefully.');
  }

  /* 4. Embedded credentials */
  if (url.username || url.password) {
    add('credentials', 'Credentials embedded in the link', 'high', 20,
      'The link contains a username or password before the @ symbol. This is a classic trick to make a malicious host look like a trusted one.',
      'Never trust a link containing an @ before the domain.');
  }

  /* 5. Punycode */
  if (host.startsWith('xn--') || host.includes('.xn--')) {
    add('punycode', 'Punycode / internationalised domain', 'high', 18,
      'The domain uses punycode encoding, which can display look-alike characters that mimic a well-known brand.',
      'Verify the domain from a trusted source before interacting with it.');
  }

  /* 6. Shorteners */
  if (SHORTENERS.includes(host)) {
    add('shortener', 'URL shortener hides the real destination', 'medium', 10,
      'The link is shortened, so you cannot see where it actually leads. Shorteners are widely used in legitimate marketing as well as scams.',
      'Expand the link with a tool you trust before opening it.');
  }

  /* 7. Long URL */
  if (url.href.length > 150) {
    add('length', 'Extremely long URL', 'medium', 12,
      'Very long links often hide the real destination deep in the address or pad it with misleading keywords.',
      'Hover or long-press the link to preview the full address.');
  } else if (url.href.length > 90) {
    add('length', 'Long URL', 'low', 6,
      'The link is longer than typical. Lengthy addresses are sometimes used to obscure the destination.',
      'Inspect the full address before opening.');
  }

  /* 8. Suspicious TLD */
  if (HIGH_RISK_TLDS.includes(tld)) {
    add('tld-high', `High-abuse domain suffix (.${tld})`, 'high', 15,
      `The .${tld} suffix is offered free of charge and is heavily abused for short-lived scam pages.`,
      'Treat free-suffix domains with extra caution, especially when they ask for money or data.');
  } else if (ABUSED_TLDS.includes(tld)) {
    add('tld-abused', `Commonly abused domain suffix (.${tld})`, 'medium', 8,
      `The .${tld} suffix appears frequently in bulk-registered scam domains, though many legitimate sites use it too.`,
      'Judge the site by its content and ownership, not the suffix alone.');
  }

  /* 9. Brand impersonation */
  const registrable = labels.slice(-2).join('.');
  BRANDS.forEach((brand) => {
    if (host.includes(brand) && registrable !== OFFICIAL[brand]) {
      add('brand', `Possible impersonation of "${brand}"`, 'high', 18,
        `The address contains the brand name "${brand}" but the real domain is "${registrable}", not ${OFFICIAL[brand]}.`,
        'Navigate to the official site directly instead of using this link.');
    }
  });

  /* 10. Hyphen abuse */
  const hyphenCount = (host.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    add('hyphens', 'Excessive hyphens in the domain', 'medium', 10,
      'Multiple hyphens are used to build convincing-looking fake domains such as "secure-login-account".',
      'Be sceptical of domains built from security keywords.');
  } else if (hyphenCount === 2) {
    add('hyphens', 'Multiple hyphens in the domain', 'low', 5,
      'Two hyphens can indicate a constructed look-alike domain.',
      'Read the domain carefully to confirm you are on the real site.');
  }

  /* 11. Unusual characters */
  if (/%[0-9a-f]{2}/i.test(pathAndQuery) && (pathAndQuery.match(/%[0-9a-f]{2}/gi) || []).length > 4) {
    add('encoding', 'Heavy percent-encoding in the path', 'medium', 10,
      'The path contains many encoded characters, which can be used to conceal the real destination or payload.',
      'Do not open links that appear deliberately obfuscated.');
  }
  if (/[^\x20-\x7E]/.test(submitted)) {
    add('unicode', 'Non-ASCII characters in the link', 'medium', 10,
      'The link contains characters outside the standard ASCII set, which may be used to create look-alike addresses.',
      'Type the address manually if you are unsure.');
  }
  if (/\/\/.+\/\//.test(pathAndQuery)) {
    add('double-slash', 'Repeated slashes inside the path', 'low', 5,
      'Unexpected double slashes inside the path are sometimes used to obscure the real destination.',
      'Preview the full link before opening it.');
  }

  /* 12. Sensitive keywords + suspicious structure */
  if (SENSITIVE_WORDS.test(pathAndQuery) || SENSITIVE_WORDS.test(host)) {
    const credentialTrap = /(login|verify|secure|account|confirm|unlock)/i.test(pathAndQuery);
    if (credentialTrap) {
      add('sensitive-words', 'Security-themed keywords in the address', 'medium', 9,
        'The link contains words such as "login", "verify" or "secure". These are used to make fake pages feel legitimate.',
        'Always reach account pages by typing the official address yourself.');
    }
  }

  /* 13. Digits-heavy host */
  if (/\d{3,}/.test(host.replace(/\./g, ''))) {
    add('digits', 'Unusual numeric sequence in the domain', 'low', 5,
      'Long numeric sequences in a domain are common in automatically generated scam pages.',
      'Prefer domains you can recognise and spell.');
  }

  let score = findings.reduce((sum, f) => sum + f.score, 0);
  score = clamp(Math.round(score), 0, 100);
  const band = riskBand(score);

  const recommendations = [];
  findings.forEach((f) => { if (!recommendations.includes(f.precaution)) recommendations.push(f.precaution); });
  if (!recommendations.length) {
    recommendations.push('No structural warning patterns were found, but this does not confirm the site is safe.');
  }
  if (recommendations.length < 4) {
    recommendations.push('Type the official address yourself instead of following links from messages.');
    recommendations.push('Never enter passwords, card numbers or one-time codes on a page you reached from an unsolicited link.');
  }

  return {
    type: 'link',
    title: truncate(host, 70),
    input: submitted,
    domain: registrable || host,
    host,
    protocol: url.protocol.replace(':', '').toUpperCase(),
    href: url.href,
    score,
    riskKey: band.key,
    riskLabel: band.label,
    findings,
    recommendations: recommendations.slice(0, 6),
    createdAt: new Date().toISOString()
  };
}

/* ------------------------- View ------------------------- */

let currentResult = null;
let currentRecordId = null;

function scoreRing(score, tone) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return `<svg class="score-ring" viewBox="0 0 128 128" role="img" aria-label="Risk score ${score} out of 100">
    <circle class="score-ring__track" cx="64" cy="64" r="${r}" />
    <circle class="score-ring__value score-ring__value--${tone}" cx="64" cy="64" r="${r}"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${c.toFixed(1)}" data-target="${offset.toFixed(1)}" />
  </svg>`;
}

function resultHtml(result) {
  return `
    <section class="panel">
      <div class="panel__head">
        <div>
          <h2 class="panel__title">Inspection result</h2>
          <p class="panel__desc">Analysed ${escapeHtml(formatDate(result.createdAt))} · local URL pattern inspection</p>
        </div>
        <span class="chip chip--${result.riskKey}">${escapeHtml(result.riskLabel)}</span>
      </div>

      <div class="score-wrap">
        ${scoreRing(result.score, result.riskKey)}
        <div class="score-meta">
          <div><span class="score-meta__value">${result.score}</span><span class="score-meta__max"> / 100</span></div>
          <p class="score-meta__label">${result.findings.length} structural indicator${result.findings.length === 1 ? '' : 's'} detected</p>
        </div>
      </div>

      <hr class="divider" style="margin:22px 0" />

      <div class="form-grid" style="margin-bottom:8px">
        <div>
          <p class="tiny subtle strong" style="text-transform:uppercase;letter-spacing:.08em">Submitted URL</p>
          <p class="small" style="word-break:break-all;margin-top:4px">${escapeHtml(result.input)}</p>
        </div>
        <div>
          <p class="tiny subtle strong" style="text-transform:uppercase;letter-spacing:.08em">Extracted domain</p>
          <p class="small strong" style="word-break:break-all;margin-top:4px">${escapeHtml(result.domain)}</p>
        </div>
        <div>
          <p class="tiny subtle strong" style="text-transform:uppercase;letter-spacing:.08em">Protocol</p>
          <p class="small" style="margin-top:4px">${escapeHtml(result.protocol)}</p>
        </div>
        <div>
          <p class="tiny subtle strong" style="text-transform:uppercase;letter-spacing:.08em">Host</p>
          <p class="small" style="word-break:break-all;margin-top:4px">${escapeHtml(result.host)}</p>
        </div>
      </div>

      <h3 class="section-title" style="margin:22px 0 12px">Detected indicators</h3>
      ${result.findings.length
        ? `<ul class="finding-list">${result.findings.map((f, i) => `
            <li class="finding finding--${f.severity}" style="animation-delay:${i * 40}ms">
              <div class="finding__icon">${icon('alert-triangle', 18)}</div>
              <div class="finding__body">
                <div class="finding__head">
                  <h4 class="finding__title">${escapeHtml(f.label)}</h4>
                  <span class="chip chip--${f.severity === 'high' ? 'high' : f.severity === 'medium' ? 'moderate' : 'low'}">${escapeHtml(f.severity)}</span>
                  <span class="finding__score">+${f.score}</span>
                </div>
                <p class="finding__desc">${escapeHtml(f.description)}</p>
                <p class="finding__precaution"><strong>Precaution:</strong> ${escapeHtml(f.precaution)}</p>
              </div>
            </li>`).join('')}</ul>`
        : `<div class="empty" style="padding:30px 16px">
             <div class="empty__icon">${icon('check-circle', 26)}</div>
             <p class="empty__title">No structural warning patterns found</p>
             <p class="empty__desc">This does not prove the site is safe — TRUSTLENS cannot verify the destination, its owner or its content.</p>
           </div>`}

      <h3 class="section-title" style="margin:24px 0 12px">Recommended precautions</h3>
      <ul class="rec-list">
        ${result.recommendations.map((r) => `<li class="rec-item">
          <span class="rec-item__mark">${icon('check', 12)}</span><span>${escapeHtml(r)}</span>
        </li>`).join('')}
      </ul>

      <div class="row row--wrap" style="margin-top:24px;gap:10px">
        <button class="btn btn--primary" type="button" id="saveLinkBtn">${icon('save', 16)} Save Investigation</button>
        <button class="btn btn--outline" type="button" id="copyLinkBtn">${icon('copy', 16)} Copy Results</button>
        <button class="btn btn--outline" type="button" id="againLinkBtn">${icon('refresh', 16)} Inspect Another Link</button>
      </div>

      <div class="disclaimer" style="margin-top:22px">
        <span class="disclaimer__icon">${icon('alert-triangle', 18)}</span>
        <span>This inspection only analyses the structure of the URL using local rules. TRUSTLENS does not check Google Safe Browsing, VirusTotal, DNS reputation, SSL certificate validity or any malware database.</span>
      </div>
    </section>`;
}

function resultToText(r) {
  const lines = [
    'TRUSTLENS — Link Inspection',
    '================================',
    `URL: ${r.input}`,
    `Domain: ${r.domain}`,
    `Risk score: ${r.score}/100 (${r.riskLabel})`,
    `Inspected: ${formatDate(r.createdAt)}`,
    '',
    `Indicators (${r.findings.length}):`
  ];
  r.findings.forEach((f) => lines.push(`- [${f.severity.toUpperCase()}] ${f.label} (+${f.score})`));
  lines.push('', 'Precautions:');
  r.recommendations.forEach((x) => lines.push(`- ${x}`));
  lines.push('', 'Local URL pattern inspection only. No external verification was performed.');
  return lines.join('\n');
}

export function renderLinkInspector(root) {
  currentResult = null;
  currentRecordId = null;

  root.innerHTML = `
    <div class="stack">
      <section class="panel">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">Inspect a suspicious link</h2>
            <p class="panel__desc">TRUSTLENS analyses the structure of a URL — protocol, domain shape, encoding and known deception patterns. It never opens the link.</p>
          </div>
        </div>

        <label class="field">
          <span class="field__label">URL</span>
          <input id="urlInput" class="input" type="text" autocomplete="off" spellcheck="false"
            placeholder="e.g. secure-login-verify.example.top/account" />
        </label>

        <div class="row row--between row--wrap" style="margin-top:14px">
          <p class="tiny subtle">Local pattern inspection only — no external service is contacted.</p>
          <div class="row">
            <button class="btn btn--ghost" type="button" id="clearUrlBtn">Clear</button>
            <button class="btn btn--primary" type="button" id="inspectBtn">${icon('link', 16)} Inspect Link</button>
          </div>
        </div>
      </section>

      <div id="linkResult"></div>
    </div>`;

  const input = $('#urlInput', root);
  const host = $('#linkResult', root);
  const inspectBtn = $('#inspectBtn', root);

  $('#clearUrlBtn', root).addEventListener('click', () => {
    input.value = '';
    host.innerHTML = '';
    currentResult = null;
    currentRecordId = null;
    input.focus();
  });

  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') inspectBtn.click(); });

  inspectBtn.addEventListener('click', () => {
    const result = inspectUrl(input.value);
    if (result.error) {
      toast(result.error, 'warning');
      host.innerHTML = '';
      input.focus();
      return;
    }

    currentResult = result;
    const stored = Storage.addCheck(result);
    currentRecordId = stored ? stored.id : null;

    host.innerHTML = resultHtml(result);
    const circle = host.querySelector('.score-ring__value');
    if (circle) {
      const target = circle.getAttribute('data-target');
      requestAnimationFrame(() => requestAnimationFrame(() => { circle.style.strokeDashoffset = target; }));
    }

    if (Storage.getSettings().notifyAnalysis) {
      Storage.addNotification(`Link inspected — ${result.riskLabel} (${result.score}/100).`, result.score >= 50 ? 'warning' : 'info');
    }

    const saveBtn = $('#saveLinkBtn', host);
    saveBtn.addEventListener('click', () => {
      if (!currentRecordId) return;
      if (Storage.saveInvestigation(currentRecordId)) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `${icon('check', 16)} Saved`;
        toast('Link investigation saved to your Security Journal.', 'success');
        if (Storage.getSettings().notifySave) {
          Storage.addNotification('Link investigation saved to the Security Journal.', 'success');
        }
      }
    });

    $('#copyLinkBtn', host).addEventListener('click', async () => {
      const ok = await copyText(resultToText(result));
      toast(ok ? 'Results copied to clipboard.' : 'Copy failed — select the text manually.', ok ? 'success' : 'error');
    });

    $('#againLinkBtn', host).addEventListener('click', () => {
      input.value = '';
      host.innerHTML = '';
      currentResult = null;
      currentRecordId = null;
      input.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
