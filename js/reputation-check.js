/* =========================================================
   TRUSTLENS — Reputation Check  (v1.1)
   Combines: local URL heuristics + curated brand database
             + LIVE RDAP domain-age lookup (CORS, no key)
   ========================================================= */

import {
  $, escapeHtml, icon, toast, formatDate, riskBand, clamp
} from './utils.js';
import * as Storage from './storage.js';
import { inspectUrl } from './link-inspector.js';
import {
  lookupBrand, checkHostAgainstBrands, isUrlLike
} from './reputation-data.js';

/* ═══════════════════════════════════════════════════════════
   RDAP domain-age lookup
   Primary : api.domainee.dev  (CORS enabled, no key, 500/day)
   Fallback: rdap.org          (CORS-friendly RDAP proxy)
   Only the domain name is sent. Results cached in memory.
   ═══════════════════════════════════════════════════════════ */

const ageCache = new Map();

function withTimeout(ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(timer) };
}

export async function fetchDomainAge(domain) {
  const key = String(domain || '').toLowerCase().replace(/^www\./, '').trim();
  if (!key) return { ok: false };
  if (ageCache.has(key)) return ageCache.get(key);

  /* Primary */
  const t1 = withTimeout(9000);
  try {
    const res = await fetch(
      'https://api.domainee.dev/v1/tools/domain-age-checker?domain=' + encodeURIComponent(key),
      { signal: t1.signal, headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const j = await res.json();
      if (j && j.ok && j.data && j.data.created) {
        const days = Number(j.data.ageDays) || 0;
        const out = {
          ok: true,
          source: 'domainee.dev',
          created: j.data.created,
          updated: j.data.updated || null,
          expires: j.data.expires || null,
          ageDays: days,
          ageYears: Number(j.data.ageYears) || +(days / 365.25).toFixed(1)
        };
        ageCache.set(key, out);
        return out;
      }
    }
  } catch (e) { /* fall through */ }
  finally { t1.done(); }

  /* Fallback */
  const t2 = withTimeout(9000);
  try {
    const res = await fetch(
      'https://rdap.org/domain/' + encodeURIComponent(key),
      { signal: t2.signal, headers: { Accept: 'application/rdap+json' } }
    );
    if (res.ok) {
      const j = await res.json();
      const events = Array.isArray(j.events) ? j.events : [];
      const reg = events.find((e) => e.eventAction === 'registration');
      const exp = events.find((e) => e.eventAction === 'expiration');
      const upd = events.find((e) => e.eventAction === 'last changed');
      if (reg && reg.eventDate) {
        const days = Math.max(0, Math.floor((Date.now() - new Date(reg.eventDate).getTime()) / 86400000));
        const out = {
          ok: true,
          source: 'rdap.org',
          created: reg.eventDate,
          updated: upd ? upd.eventDate : null,
          expires: exp ? exp.eventDate : null,
          ageDays: days,
          ageYears: +(days / 365.25).toFixed(1)
        };
        ageCache.set(key, out);
        return out;
      }
    }
  } catch (e) { /* ignore */ }
  finally { t2.done(); }

  const miss = { ok: false };
  ageCache.set(key, miss);
  return miss;
}

/* ═══════════════════════════════════════════════════════════
   Domain age → risk contribution
   ═══════════════════════════════════════════════════════════ */

function ageAssessment(age) {
  if (!age || !age.ok) {
    return { points: 0, finding: null, label: 'Unavailable', tone: 'neutral' };
  }
  const d = age.ageDays;
  if (d < 30) {
    return {
      points: 24,
      tone: 'critical',
      label: 'Very new (under 30 days)',
      finding: {
        label: 'Domain registered very recently',
        severity: 'high',
        score: 24,
        description: 'This domain was created ' + d + ' day(s) ago. Brand-new domains are heavily used for short-lived scam pages because they are cheap and disposable.',
        precaution: 'Be extremely cautious. Legitimate businesses rarely operate from a domain less than a month old.'
      }
    };
  }
  if (d < 90) {
    return {
      points: 15,
      tone: 'high',
      label: 'New (under 3 months)',
      finding: {
        label: 'Recently registered domain',
        severity: 'medium',
        score: 15,
        description: 'This domain is ' + d + ' days old. Many scam sites are registered only weeks before use.',
        precaution: 'Look for independent evidence that the business exists beyond this website.'
      }
    };
  }
  if (d < 365) {
    return {
      points: 7,
      tone: 'moderate',
      label: 'Under one year old',
      finding: {
        label: 'Domain is less than a year old',
        severity: 'medium',
        score: 7,
        description: 'The domain was registered ' + d + ' days ago. That is not automatically suspicious, but it is not an established presence either.',
        precaution: 'Cross-check the company on an independent review site before paying.'
      }
    };
  }
  if (d < 365 * 5) {
    return { points: 0, tone: 'low', label: 'Established (1–5 years)', finding: null };
  }
  return { points: 0, tone: 'low', label: 'Long-established (5+ years)', finding: null };
}

/* ═══════════════════════════════════════════════════════════
   Small render helpers
   ═══════════════════════════════════════════════════════════ */

function ringHtml(score, tone) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return '<svg class="score-ring" viewBox="0 0 128 128" role="img" aria-label="Risk score ' + score + ' out of 100">'
    + '<circle class="score-ring__track" cx="64" cy="64" r="' + r + '" />'
    + '<circle class="score-ring__value score-ring__value--' + tone + '" cx="64" cy="64" r="' + r + '"'
    + ' stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + c.toFixed(1) + '"'
    + ' data-target="' + offset.toFixed(1) + '" />'
    + '</svg>';
}

function animateRing(host) {
  const circle = host.querySelector('.score-ring__value');
  if (!circle) return;
  const target = circle.getAttribute('data-target');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    circle.style.strokeDashoffset = target;
  }));
}

function verdictHead(kind, title, subtitle) {
  const map = {
    legit:   { iconName: 'check-circle',  fg: 'var(--success)', bg: 'var(--success-soft)', eyebrow: 'RECOGNISED LEGITIMATE BRAND' },
    caution: { iconName: 'alert-triangle', fg: 'var(--warning)', bg: 'var(--warning-soft)', eyebrow: 'PROCEED WITH CAUTION' },
    danger:  { iconName: 'alert-octagon',  fg: 'var(--danger)',  bg: 'var(--danger-soft)',  eyebrow: 'HIGH RISK — LIKELY SCAM' },
    unknown: { iconName: 'help',           fg: 'var(--warning)', bg: 'var(--warning-soft)', eyebrow: 'NOT IN OUR DATABASE' }
  };
  const v = map[kind] || map.unknown;
  return '<div class="row" style="gap:16px;align-items:flex-start">'
    + '<div style="width:56px;height:56px;border-radius:16px;display:grid;place-items:center;'
    + 'background:' + v.bg + ';color:' + v.fg + ';flex:none">' + icon(v.iconName, 26) + '</div>'
    + '<div style="min-width:0">'
    + '<p class="tiny strong" style="letter-spacing:.12em;color:' + v.fg + ';margin-bottom:4px">' + v.eyebrow + '</p>'
    + '<h2 style="font-size:21px;font-weight:800;letter-spacing:-.01em;line-height:1.25">' + escapeHtml(title) + '</h2>'
    + (subtitle ? '<p class="small subtle" style="margin-top:4px">' + escapeHtml(subtitle) + '</p>' : '')
    + '</div></div>';
}

function externalLinks(name, domain) {
  const label = name || domain || '';
  const links = [
    { text: 'Google reviews', ic: 'search', url: 'https://www.google.com/search?q=' + encodeURIComponent(label + ' reviews') },
    { text: 'Trustpilot', ic: 'users', url: 'https://www.trustpilot.com/search?query=' + encodeURIComponent(label) },
    { text: 'Reddit opinions', ic: 'message', url: 'https://www.reddit.com/search/?q=' + encodeURIComponent(label + ' scam OR legit') },
    { text: 'Scamadviser', ic: 'shield-check', url: 'https://www.scamadviser.com/check-website/' + encodeURIComponent(domain || label) },
    { text: 'WHOIS / ICANN', ic: 'globe', url: 'https://lookup.icann.org/en/lookup?q=' + encodeURIComponent(domain || label) }
  ];
  return '<div class="detail-section">'
    + '<h4>Check independent sources</h4>'
    + '<p class="small subtle" style="margin-bottom:10px">Opens in a new tab. These are third-party sites — TRUSTLENS does not read or score their content automatically.</p>'
    + '<div class="row row--wrap" style="gap:8px">'
    + links.map((l) => '<a class="btn btn--outline btn--sm" href="' + l.url + '" target="_blank" rel="noopener noreferrer">'
        + icon(l.ic, 14) + ' ' + escapeHtml(l.text) + '</a>').join('')
    + '</div></div>';
}

function ageSlotHtml() {
  return '<div id="ageSlot" class="kpi"><p class="kpi__label">Domain age</p>'
    + '<p class="kpi__value" style="font-size:20px;opacity:.55">Checking…</p>'
    + '<p class="kpi__hint">Live RDAP lookup</p></div>';
}

function paintAgeSlot(age) {
  const slot = document.getElementById('ageSlot');
  if (!slot) return;
  if (!age || !age.ok) {
    slot.innerHTML = '<p class="kpi__label">Domain age</p>'
      + '<p class="kpi__value" style="font-size:20px">—</p>'
      + '<p class="kpi__hint">RDAP lookup unavailable</p>';
    return;
  }
  const a = ageAssessment(age);
  slot.innerHTML = '<p class="kpi__label">Domain age</p>'
    + '<p class="kpi__value" style="font-size:20px">' + escapeHtml(a.label) + '</p>'
    + '<p class="kpi__hint">Created ' + escapeHtml(formatDate(age.created, false)) + '</p>';
}

function findingsList(list) {
  if (!list.length) {
    return '<div class="empty" style="padding:28px 16px">'
      + '<div class="empty__icon">' + icon('check-circle', 24) + '</div>'
      + '<p class="empty__title">No warning patterns found</p>'
      + '<p class="empty__desc">Nothing in our checks triggered. This is not a guarantee that the site or company is safe.</p>'
      + '</div>';
  }
  return '<ul class="finding-list">' + list.map((f, i) => {
    const sev = f.severity === 'critical' ? 'critical'
      : f.severity === 'high' ? 'high'
      : f.severity === 'medium' ? 'medium' : 'low';
    const chip = sev === 'critical' ? 'critical' : sev === 'high' ? 'high' : sev === 'medium' ? 'moderate' : 'low';
    return '<li class="finding finding--' + sev + '" style="animation-delay:' + (i * 40) + 'ms">'
      + '<div class="finding__icon">' + icon(sev === 'low' ? 'info' : 'alert-triangle', 18) + '</div>'
      + '<div class="finding__body">'
      + '<div class="finding__head">'
      + '<h4 class="finding__title">' + escapeHtml(f.label) + '</h4>'
      + '<span class="chip chip--' + chip + '">' + escapeHtml(sev) + '</span>'
      + (f.score ? '<span class="finding__score">+' + f.score + '</span>' : '')
      + '</div>'
      + '<p class="finding__desc">' + escapeHtml(f.description || '') + '</p>'
      + (f.precaution ? '<p class="finding__precaution"><strong>Precaution:</strong> ' + escapeHtml(f.precaution) + '</p>' : '')
      + '</div></li>';
  }).join('') + '</ul>';
}

/* ═══════════════════════════════════════════════════════════
   Card builders
   ═══════════════════════════════════════════════════════════ */

function brandLegitCard(brand) {
  const primary = brand.domains[0];
  return '<section class="panel">'
    + verdictHead('legit', brand.name, brand.category)
    + '<hr class="divider" style="margin:22px 0" />'
    + '<div class="kpi-grid" style="margin-bottom:20px">'
    + ageSlotHtml()
    + '<div class="kpi"><p class="kpi__label">Category</p><p class="kpi__value" style="font-size:16px;line-height:1.4">' + escapeHtml(brand.category) + '</p><p class="kpi__hint">Curated database</p></div>'
    + '<div class="kpi"><p class="kpi__label">Official domains</p><p class="kpi__value" style="font-size:20px">' + brand.domains.length + '</p><p class="kpi__hint">' + escapeHtml(primary) + '</p></div>'
    + '</div>'
    + '<div class="detail-section"><h4>Official domains</h4><ul class="detail-list">'
    + brand.domains.map((d) => '<li><code style="background:var(--surface-inset);padding:2px 8px;border-radius:6px;font-size:12px">' + escapeHtml(d) + '</code></li>').join('')
    + '</ul></div>'
    + '<div class="detail-section"><h4>Important notes</h4><ul class="detail-list">'
    + brand.notes.map((n) => '<li>' + escapeHtml(n) + '</li>').join('')
    + '</ul></div>'
    + externalLinks(brand.name, primary)
    + '<div class="info-box" style="margin-top:6px"><span class="info-box__icon">' + icon('info', 18) + '</span>'
    + '<span>Being in our legitimate list means this is a real, well-known company. It does <strong>not</strong> mean every message claiming to be from them is genuine — scammers impersonate real brands constantly.</span></div>'
    + '</section>';
}

function brandScamCard(scam) {
  return '<section class="panel">'
    + verdictHead('danger', scam.name, scam.category)
    + '<hr class="divider" style="margin:22px 0" />'
    + '<div class="detail-section"><h4>What this is</h4>'
    + '<p class="muted" style="font-size:13.5px;line-height:1.7">' + escapeHtml(scam.summary) + '</p></div>'
    + '<div class="detail-section"><h4>Critical warning</h4>'
    + '<div class="scenario-box" style="border-left-color:var(--danger)">' + escapeHtml(scam.warning) + '</div></div>'
    + '<div class="detail-section"><h4>Red flags to check</h4><ul class="detail-list">'
    + scam.redFlags.map((f) => '<li>' + escapeHtml(f) + '</li>').join('')
    + '</ul></div>'
    + externalLinks(scam.name, '')
    + '<div class="disclaimer" style="margin-top:18px"><span class="disclaimer__icon">' + icon('alert-octagon', 18) + '</span>'
    + '<span>Do not send money, personal information or account credentials to anyone matching this pattern. If you have already paid, contact your bank immediately.</span></div>'
    + '</section>';
}

function urlResultCard(base, hostCheck, age) {
  const a = ageAssessment(age);

  let score = base.score || 0;
  const extra = [];
  const recommendations = (base.recommendations || []).slice();

  if (hostCheck.type === 'impersonation') {
    score += 35;
    extra.push({
      label: 'Possible impersonation of ' + hostCheck.data.name,
      severity: 'high',
      score: 35,
      description: 'The address "' + base.host + '" contains the brand name "' + hostCheck.data.name
        + '", but the real domain is ' + hostCheck.officialDomain + '. This is a classic impersonation pattern.',
      precaution: 'Do not enter any information on this page. Go to ' + hostCheck.officialDomain + ' directly.'
    });
    recommendations.push('Navigate to ' + hostCheck.officialDomain + ' directly if you need the real ' + hostCheck.data.name + '.');
  } else if (hostCheck.type === 'scam-domain') {
    score += 45;
    extra.push({
      label: 'Known scam phrase in the domain',
      severity: 'critical',
      score: 45,
      description: hostCheck.data.summary,
      precaution: hostCheck.data.warning
    });
    hostCheck.data.redFlags.slice(0, 3).forEach((r) => recommendations.push(r));
  } else if (hostCheck.type === 'legit-domain') {
    score = Math.max(0, score - 15);
    extra.push({
      label: 'Official domain of ' + hostCheck.data.name,
      severity: 'low',
      score: 0,
      description: base.host + ' is a confirmed official domain of ' + hostCheck.data.name + '. This is a positive signal.',
      precaution: 'Still check what the page asks you to do — a legitimate domain can host a compromised page.'
    });
  }

  if (a.finding) {
    score += a.points;
    extra.push(a.finding);
  }

  score = clamp(Math.round(score), 0, 100);
  const band = riskBand(score);
  const kind = score >= 50 ? 'danger' : score >= 25 ? 'caution' : 'legit';

  const merged = [...(base.findings || []), ...extra];
  const title = hostCheck.type === 'legit-domain'
    ? base.host + ' — official domain of ' + hostCheck.data.name
    : base.host + ' — reputation check';

  const html = '<section class="panel">'
    + verdictHead(kind, title, base.protocol + '://' + base.host)
    + '<hr class="divider" style="margin:22px 0" />'

    + '<div class="score-wrap">'
    + ringHtml(score, band.key)
    + '<div class="score-meta">'
    + '<div><span class="score-meta__value">' + score + '</span><span class="score-meta__max"> / 100</span></div>'
    + '<p class="score-meta__label">' + merged.length + ' indicator' + (merged.length === 1 ? '' : 's') + ' · ' + escapeHtml(band.label) + '</p>'
    + '<div class="score-legend">'
    + '<span class="score-legend__item"><span class="score-legend__dot" style="background:#16A34A"></span>Low 0–24</span>'
    + '<span class="score-legend__item"><span class="score-legend__dot" style="background:#F59E0B"></span>Moderate 25–49</span>'
    + '<span class="score-legend__item"><span class="score-legend__dot" style="background:#EA580C"></span>High 50–74</span>'
    + '<span class="score-legend__item"><span class="score-legend__dot" style="background:#DC2626"></span>Critical 75–100</span>'
    + '</div></div></div>'

    + '<hr class="divider" style="margin:22px 0" />'

    + '<div class="kpi-grid" style="margin-bottom:20px">'
    + '<div class="kpi"><p class="kpi__label">Domain</p><p class="kpi__value" style="font-size:16px;line-height:1.4;word-break:break-all">' + escapeHtml(base.domain) + '</p><p class="kpi__hint">' + escapeHtml(base.protocol) + '</p></div>'
    + ageSlotHtml()
    + '<div class="kpi"><p class="kpi__label">Brand match</p><p class="kpi__value" style="font-size:16px;line-height:1.4">'
    + (hostCheck.type === 'legit-domain' ? 'Official'
      : hostCheck.type === 'impersonation' ? 'Impersonation'
      : hostCheck.type === 'scam-domain' ? 'Scam phrase'
      : 'None found')
    + '</p><p class="kpi__hint">Curated database</p></div>'
    + '</div>'

    + '<h3 class="section-title" style="margin-bottom:12px">Detected indicators</h3>'
    + findingsList(merged)

    + '<h3 class="section-title" style="margin:24px 0 12px">Recommended actions</h3>'
    + '<ul class="rec-list">'
    + Array.from(new Set(recommendations)).slice(0, 7).map((r) =>
        '<li class="rec-item"><span class="rec-item__mark">' + icon('check', 12) + '</span><span>' + escapeHtml(r) + '</span></li>').join('')
    + '</ul>'

    + externalLinks(base.host, base.domain)

    + '<div class="disclaimer" style="margin-top:22px"><span class="disclaimer__icon">' + icon('alert-triangle', 18) + '</span>'
    + '<span>This check combines local URL structure analysis, a curated brand database and public RDAP registration data. TRUSTLENS does not query Google Safe Browsing, VirusTotal, URLhaus or any malware feed, and does not open the link.</span></div>'
    + '</section>';

  return { html, score, band, title, merged, recommendations };
}

function unknownCard(query) {
  return '<section class="panel">'
    + verdictHead('unknown', 'No record for "' + query + '"', 'Not in our curated database')
    + '<hr class="divider" style="margin:22px 0" />'
    + '<p class="muted" style="font-size:13.5px;line-height:1.7">'
    + 'This name is not in our database of known brands or known scam patterns. That does not mean it is safe or dangerous — it means we have no information about it.'
    + '</p>'
    + '<div class="detail-section" style="margin-top:20px"><h4>What to do next</h4><ul class="detail-list">'
    + '<li>Search the name plus "scam", "reviews" or "complaints" and read results from more than one site.</li>'
    + '<li>Check whether the company has a real address and a contact page on its own domain.</li>'
    + '<li>If it claims to be a financial service, check your country\'s regulator register.</li>'
    + '<li>Paste the full message into the <strong>Scam Analyzer</strong> for a pattern check.</li>'
    + '<li>If they sent a link, paste the URL into the <strong>Link Inspector</strong> for structural analysis.</li>'
    + '</ul></div>'
    + externalLinks(query, '')
    + '<div class="info-box" style="margin-top:6px"><span class="info-box__icon">' + icon('info', 18) + '</span>'
    + '<span>Unknown companies are not automatically scams — but verify them independently before sending money, personal data or credentials.</span></div>'
    + '</section>';
}

/* ═══════════════════════════════════════════════════════════
   Main handler
   ═══════════════════════════════════════════════════════════ */

let lastRecordId = null;

async function handleLookup(rawValue, resultHost) {
  const value = String(rawValue || '').trim();
  if (!value) {
    toast('Please enter a brand name or URL.', 'warning');
    return;
  }

  lastRecordId = null;
  resultHost.innerHTML = '<section class="panel"><div class="empty" style="padding:34px 16px">'
    + '<div class="empty__icon">' + icon('refresh', 24) + '</div>'
    + '<p class="empty__title">Checking…</p>'
    + '<p class="empty__desc">Looking up the curated database and public domain registration records.</p>'
    + '</div></section>';

  /* ---------- URL branch ---------- */
  if (isUrlLike(value)) {
    const base = inspectUrl(value);
    if (base.error) {
      resultHost.innerHTML = '';
      toast(base.error, 'error');
      return;
    }

    const hostCheck = checkHostAgainstBrands(base.host);
    const age = await fetchDomainAge(base.domain);
    const built = urlResultCard(base, hostCheck, age);

    resultHost.innerHTML = built.html;
    animateRing(resultHost);
    paintAgeSlot(age);

    const record = {
      type: 'link',
      title: built.title,
      input: value,
      score: built.score,
      riskKey: built.band.key,
      riskLabel: built.band.label,
      findings: built.merged.map((f) => ({
        label: f.label,
        severity: f.severity || 'medium',
        score: f.score || 0,
        description: f.description || '',
        precaution: f.precaution || ''
      })),
      recommendations: built.recommendations.slice(0, 8)
    };
    const stored = Storage.addCheck(record);
    lastRecordId = stored ? stored.id : null;

    if (Storage.getSettings().notifyAnalysis) {
      Storage.addNotification('Reputation check: ' + built.title + ' (' + built.score + '/100).',
        built.score >= 50 ? 'warning' : 'info');
    }

    attachResultActions(resultHost);
    return;
  }

  /* ---------- Brand branch ---------- */
  const result = lookupBrand(value);

  if (result.type === 'legit') {
    resultHost.innerHTML = brandLegitCard(result.data);
    const age = await fetchDomainAge(result.data.domains[0]);
    paintAgeSlot(age);

    const score = 5;
    const band = riskBand(score);
    const stored = Storage.addCheck({
      type: 'link',
      title: result.data.name + ' — legitimate brand',
      input: value,
      score,
      riskKey: band.key,
      riskLabel: band.label,
      findings: [{
        label: result.data.name + ' is a recognised legitimate brand',
        severity: 'low',
        score: 0,
        description: 'Official domains: ' + result.data.domains.join(', ') + '. Category: ' + result.data.category + '.',
        precaution: 'A recognised brand can still be impersonated — verify the sender and the domain.'
      }],
      recommendations: result.data.notes.slice(0, 6)
    });
    lastRecordId = stored ? stored.id : null;
    if (Storage.getSettings().notifyAnalysis) {
      Storage.addNotification('Reputation check: ' + result.data.name + ' is a recognised legitimate brand.', 'info');
    }
    attachResultActions(resultHost);
    return;
  }

  if (result.type === 'scam') {
    resultHost.innerHTML = brandScamCard(result.data);
    const band = riskBand(90);
    const stored = Storage.addCheck({
      type: 'link',
      title: result.data.name + ' — known scam pattern',
      input: value,
      score: 90,
      riskKey: band.key,
      riskLabel: band.label,
      findings: [{
        label: 'Matches a known scam pattern: ' + result.data.name,
        severity: 'critical',
        score: 30,
        description: result.data.summary,
        precaution: result.data.warning
      }],
      recommendations: result.data.redFlags.slice(0, 6)
    });
    lastRecordId = stored ? stored.id : null;
    if (Storage.getSettings().notifyAnalysis) {
      Storage.addNotification('Reputation check: "' + value + '" matches a known scam pattern.', 'warning');
    }
    attachResultActions(resultHost);
    return;
  }

  resultHost.innerHTML = unknownCard(value);
  attachResultActions(resultHost, { allowSave: false });
}

function attachResultActions(resultHost, opts) {
  const allowSave = !opts || opts.allowSave !== false;

  const bar = document.createElement('div');
  bar.className = 'row row--wrap';
  bar.style.gap = '10px';
  bar.innerHTML = (allowSave
      ? '<button class="btn btn--primary" type="button" id="repSaveBtn">' + icon('save', 16) + ' Save to Journal</button>'
      : '')
    + '<button class="btn btn--outline" type="button" id="repAgainBtn">' + icon('refresh', 16) + ' Check Another</button>'
    + '<a class="btn btn--ghost" href="#/inspector">' + icon('link', 16) + ' Open Link Inspector</a>';

  resultHost.appendChild(bar);

  const saveBtn = bar.querySelector('#repSaveBtn');
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

  bar.querySelector('#repAgainBtn').addEventListener('click', () => {
    const input = document.getElementById('repInput');
    if (input) {
      input.value = '';
      input.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   Page render
   ═══════════════════════════════════════════════════════════ */

export function renderReputationCheck(root) {
  lastRecordId = null;

  root.innerHTML = '<div class="stack">'
    + '<section class="panel">'
    + '<div class="panel__head"><div>'
    + '<h2 class="panel__title">Reputation Check</h2>'
    + '<p class="panel__desc">Look up a company, brand or website. TRUSTLENS combines a curated database of legitimate brands and known scam patterns with <strong>live public domain-registration data</strong> (RDAP) to show how old the domain really is.</p>'
    + '</div></div>'

    + '<label class="field"><span class="field__label">Brand name, company or URL</span>'
    + '<input id="repInput" class="input" type="text" autocomplete="off" spellcheck="false"'
    + ' placeholder="e.g. handshake ai, uber eats, ubereats.com, paypal-login.top" /></label>'

    + '<div class="row row--between row--wrap" style="margin-top:14px">'
    + '<p class="tiny subtle" style="max-width:60ch">Domain age is fetched from public RDAP records (api.domainee.dev, falling back to rdap.org) when you check a URL. Only the domain name is sent.</p>'
    + '<div class="row">'
    + '<button class="btn btn--ghost" type="button" id="repClearBtn">Clear</button>'
    + '<button class="btn btn--primary" type="button" id="repCheckBtn">' + icon('search', 16) + ' Check</button>'
    + '</div></div>'

    + '<div class="row row--wrap" style="margin-top:16px;gap:8px">'
    + '<span class="tiny subtle strong">Try an example:</span>'
    + '<button class="chip-btn" type="button" data-example="handshake ai">handshake ai</button>'
    + '<button class="chip-btn" type="button" data-example="uber eats">uber eats</button>'
    + '<button class="chip-btn" type="button" data-example="ubereats.com">ubereats.com</button>'
    + '<button class="chip-btn" type="button" data-example="paypal-login.top">paypal-login.top</button>'
    + '<button class="chip-btn" type="button" data-example="mercor">mercor</button>'
    + '</div>'

    + '<div class="info-box" style="margin-top:18px"><span class="info-box__icon">' + icon('info', 18) + '</span>'
    + '<span><strong>What this can and cannot do.</strong> It can: match known brands and scam phrases, detect brand impersonation in a URL, and read real domain registration dates. It cannot: query Google Safe Browsing, VirusTotal or malware feeds, or embed live Google star ratings — those services block direct browser calls. Use the "Check independent sources" buttons for reviews.</span></div>'
    + '</section>'

    + '<div id="repResult"></div>'
    + '</div>';

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
