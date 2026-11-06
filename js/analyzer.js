/* =========================================================
   TRUSTLENS — Scam Analyzer (weighted rule engine)
   ========================================================= */

import {
  $, escapeHtml, icon, riskBand, clamp, uid, toast, copyText, navigate, truncate, formatDate
} from './utils.js';
import * as Storage from './storage.js';

/* ------------------------- Rule engine ------------------------- */

const RULES = [
  {
    id: 'guaranteed-income',
    category: 'Unrealistic promises',
    label: 'Guaranteed income promise',
    severity: 'high',
    weight: 18,
    description: 'The message promises guaranteed, assured or "100% risk-free" income. No legitimate job or investment can guarantee earnings.',
    precaution: 'Treat any guaranteed income claim as a red flag and walk away from anything requiring money first.',
    test: (t) => /\b(guarantee[ds]?|assured|100\s?%|risk[-\s]?free|no[-\s]?risk)\b/i.test(t)
      && /\b(income|profit|returns?|salary|earnings?|money|payment|payout|roi)\b/i.test(t)
  },
  {
    id: 'upfront-payment',
    category: 'Advance-fee',
    label: 'Upfront payment requested',
    severity: 'high',
    weight: 20,
    description: 'You are asked to pay a fee, deposit or transfer before receiving something. Legitimate employers never charge candidates, and real investments are not unlocked by paying a fee.',
    precaution: 'Never pay to receive a job, a prize, a loan or an investment return.',
    test: (t) => /\b(registration|activation|processing|training|membership|security|verification|clearance|delivery|courier)\s+fee\b/i.test(t)
      || /\b(pay|payment|deposit|transfer|send)\b[^.!?]{0,60}\b(before|first|upfront|up front|in advance|to (start|begin|activate|unlock|receive|claim|release))\b/i.test(t)
      || /\b(upfront|up front)\s+(payment|fee|deposit|money|cost)\b/i.test(t)
  },
  {
    id: 'urgency',
    category: 'Pressure tactics',
    label: 'Artificial urgency',
    severity: 'medium',
    weight: 9,
    description: 'The message pushes you to act immediately or within a very short window. Urgency is used to stop you from verifying claims.',
    precaution: 'Slow down. Genuine opportunities survive a day of careful checking.',
    test: (t) => /\b(urgent(ly)?|immediately|right now|act now|hurry|last chance|final notice|limited (time|slots?|spots?)|only \d+ (spots?|slots?|places?) left|expires? (today|soon|in \d+)|within \d+\s?(minutes?|hours?)|deadline)\b/i.test(t)
  },
  {
    id: 'unrealistic-returns',
    category: 'Unrealistic promises',
    label: 'Unrealistic investment returns',
    severity: 'high',
    weight: 19,
    description: 'The message advertises percentage returns far above any realistic market rate, or promises to multiply your money in a short period.',
    precaution: 'Compare any promised return with regulated savings rates — anything dramatically higher carries extreme risk.',
    test: (t) => /\b\d{2,}\s?%\s*(daily|weekly|monthly|profit|return|returns|interest|roi|gain|per (day|week|month))/i.test(t)
      || /\bdouble (your )?(money|investment|capital|deposit)\b/i.test(t)
      || /\bturn\s+\$?\d[\d,.]*\s*(into|to)\s+\$?\d[\d,.]*/i.test(t)
      || /\b(passive income|huge returns?|guaranteed returns?|high[-\s]?yield investment)\b/i.test(t)
  },
  {
    id: 'password-request',
    category: 'Credential theft',
    label: 'Password or login details requested',
    severity: 'critical',
    weight: 24,
    description: 'The message asks you to send, confirm or enter your password or login credentials. No legitimate organisation asks for this.',
    precaution: 'Never share a password with anyone. Change it immediately if you already have.',
    test: (t) => {
      const asks = /\b(password|passcode|login details|login credentials|account credentials)\b/i.test(t);
      const verb = /\b(send|share|provide|enter|confirm|verify|give|tell|type|input|update)\b/i.test(t);
      const negated = /\b(never|don'?t|do not|avoid)\s+(share|give|send|provide|disclose)\b[^.!?]{0,40}\bpassword/i.test(t);
      return asks && verb && !negated;
    }
  },
  {
    id: 'otp-request',
    category: 'Credential theft',
    label: 'One-time code (OTP) requested',
    severity: 'critical',
    weight: 26,
    description: 'The message asks for a verification code, OTP or 2FA code. These codes exist to protect you and must never be shared.',
    precaution: 'Never read out or forward a one-time code. Anyone who asks for it is attempting account takeover.',
    test: (t) => /\b(otp|one[-\s]?time (password|code|pin)|verification code|security code|2fa code|authentication code|login code|sms code)\b/i.test(t)
      && /\b(send|share|provide|forward|tell|give|enter|confirm|read out)\b/i.test(t)
  },
  {
    id: 'referral-scheme',
    category: 'Recruitment scheme',
    label: 'Referral / downline earning scheme',
    severity: 'medium',
    weight: 12,
    description: 'Earnings appear to depend on recruiting other people rather than on a real product or service — a classic pyramid structure.',
    precaution: 'Ask what you are actually selling. If the answer is "recruiting others", decline.',
    test: (t) => (/\b(referral|refer|downline|upline|recruit(ing|ment)?|invite)\b/i.test(t)
        && /\b(earn|commission|bonus|reward|income|percent|%|profit)\b/i.test(t))
      || /\b(invite|bring|refer)\s+\d+\s+(people|friends|members|persons)\b/i.test(t)
  },
  {
    id: 'impersonation',
    category: 'Impersonation',
    label: 'Impersonation indicators',
    severity: 'high',
    weight: 16,
    description: 'The message claims to come from a bank, a major company, an official agent or a support team, and references account problems. Impersonation is extremely common.',
    precaution: 'Contact the organisation using a number or website you look up yourself — never one supplied in the message.',
    test: (t) => /\b(official (agent|representative|staff|partner|officer)|support team|security team|customer care team|account (has been|was|will be) (suspended|locked|closed|compromised|restricted|deactivated)|we (noticed|detected) (suspicious|unusual)|from (your )?(bank|paypal|amazon|microsoft|apple|google|meta|netflix|whatsapp)|government (agency|official))\b/i.test(t)
  },
  {
    id: 'off-platform',
    category: 'Pressure tactics',
    label: 'Push to an unofficial channel',
    severity: 'medium',
    weight: 13,
    description: 'You are told to continue the conversation on WhatsApp, Telegram or another private channel. Scammers move off monitored platforms to avoid detection.',
    precaution: 'Keep conversations on official platforms and be extra cautious with anyone rushing you to a private chat.',
    test: (t) => /\b(move|continue|take|switch|carry)\s+(this|the|our)\s+(conversation|chat|discussion|talk)\s+(to|on|over to)\s+(whatsapp|telegram|signal|wechat)\b/i.test(t)
      || /\b(contact|message|reach|dm|text|chat)\s+(me|us)\s+(on|via|at)\s+(whatsapp|telegram|signal)\b/i.test(t)
  },
  {
    id: 'sensitive-data',
    category: 'Data harvesting',
    label: 'Sensitive personal information requested',
    severity: 'high',
    weight: 20,
    description: 'The message asks for identity numbers, card details, banking information or other highly sensitive data.',
    precaution: 'Only provide identity or banking details through a verified, official channel you initiated.',
    test: (t) => /\b(bvn|nin|ssn|social security number|national id|id number|passport (number|details)|date of birth|mother'?s maiden name|card number|cvv|atm pin|account number|bank details|routing number|sort code)\b/i.test(t)
  },
  {
    id: 'crypto-promise',
    category: 'Investment fraud',
    label: 'Cryptocurrency profit promise',
    severity: 'high',
    weight: 17,
    description: 'The message combines cryptocurrency with promises of profit, doubling or guaranteed returns — a very common investment fraud pattern.',
    precaution: 'Only use regulated exchanges you research independently. Never send crypto to a wallet address from a message.',
    test: (t) => /\b(bitcoin|btc|ethereum|eth|usdt|crypto(currency)?|binance|trust ?wallet|metamask|airdrop|mining)\b/i.test(t)
      && /\b(invest|profit|earn|double|guarantee[ds]?|returns?|wallet address|send|deposit)\b/i.test(t)
  },
  {
    id: 'easy-money',
    category: 'Unrealistic promises',
    label: 'Unusually generous reward for simple tasks',
    severity: 'medium',
    weight: 15,
    description: 'The message offers significant pay for trivial actions such as liking, subscribing, clicking or reviewing — a common setup for advance-fee fraud.',
    precaution: 'Be suspicious of high pay for almost no work. Real employers pay realistic rates for real skills.',
    test: (t) => /\b(like|subscribe|follow|share|click|review|watch)\b[^.!?]{0,60}\b(earn|paid|payment|money|reward|commission)\b/i.test(t)
      || /\b(earn|make)\s+\$?\d[\d,.]*[^.!?]{0,30}\b(per|a|each)\s+(task|click|like|video|day|hour)\b/i.test(t)
      || /\b(simple tasks?|easy money|no experience (needed|required)|work from home|part[-\s]?time online)\b/i.test(t)
  },
  {
    id: 'payment-method',
    category: 'Payment fraud',
    label: 'Untraceable payment method requested',
    severity: 'high',
    weight: 18,
    description: 'The message requests payment by gift card, wire transfer, money transfer service or crypto wallet — methods that cannot be reversed or traced.',
    precaution: 'Never pay with gift cards, crypto or wire transfers to people you have not verified independently.',
    test: (t) => /\b(gift cards?|itunes card|google play card|steam card|amazon card|western union|moneygram|wire transfer|crypto transfer|usdt|wallet address)\b/i.test(t)
      || /\b(pay|send|transfer)\b[^.!?]{0,50}\b(to (this|the following) (account|wallet)|wallet address)\b/i.test(t)
  },
  {
    id: 'instant-hiring',
    category: 'Impersonation',
    label: 'Instant hiring without a real process',
    severity: 'medium',
    weight: 12,
    description: 'You are "selected", "approved" or hired without a genuine interview or verification process.',
    precaution: 'Real employers interview candidates and never hire purely through messaging apps.',
    test: (t) => /\b(no interview|direct joining|instant (approval|hiring)|immediate (approval|joining)|you (have been|are) (selected|chosen)|congratulations[^.!?]{0,50}(selected|chosen|shortlisted))\b/i.test(t)
  }
];

const GENERIC_ADVICE = [
  'Verify the sender using an official phone number or website you look up yourself.',
  'Never send money, gift cards or cryptocurrency to someone you have not verified.',
  'Take your time — urgency is a tool used to stop you from checking.'
];

const SEVERITY_ICON = {
  low: 'info',
  medium: 'alert-triangle',
  high: 'alert-triangle',
  critical: 'alert-octagon'
};

function normalize(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function extractEvidence(text, rule) {
  const source = String(text || '');
  const words = rule.label.split(' ')[0];
  const idx = source.toLowerCase().indexOf(words.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - 40);
  return truncate(source.slice(start, Math.min(source.length, idx + 90)).trim(), 130);
}

export function analyzeMessage(rawText) {
  const text = normalize(rawText);
  const findings = [];

  RULES.forEach((rule) => {
    let matched = false;
    try { matched = Boolean(rule.test(text)); } catch { matched = false; }
    if (!matched) return;
    findings.push({
      id: rule.id,
      category: rule.category,
      label: rule.label,
      severity: rule.severity,
      score: rule.weight,
      description: rule.description,
      precaution: rule.precaution,
      evidence: extractEvidence(text, rule)
    });
  });

  findings.sort((a, b) => b.score - a.score);

  let score = findings.reduce((sum, f) => sum + f.score, 0);
  const categories = new Set(findings.map((f) => f.category));
  if (categories.size >= 3) score += 8;
  if (categories.size >= 5) score += 7;
  score = clamp(Math.round(score), 0, 100);

  const band = riskBand(score);
  const recommendations = [];
  findings.forEach((f) => {
    if (!recommendations.includes(f.precaution)) recommendations.push(f.precaution);
  });
  GENERIC_ADVICE.forEach((advice) => {
    if (recommendations.length < 6 && !recommendations.includes(advice)) recommendations.push(advice);
  });
  if (!findings.length) {
    recommendations.push('No warning patterns were detected, but this is not a guarantee. Always verify independently before sharing money or personal data.');
  }

  return {
    type: 'message',
    title: truncate(text.split('\n')[0] || 'Message analysis', 80),
    input: String(rawText || '').trim(),
    score,
    riskKey: band.key,
    riskLabel: band.label,
    findings,
    recommendations,
    createdAt: new Date().toISOString()
  };
}

/* ------------------------- Rendering ------------------------- */

const SAMPLES = {
  job: 'Congratulations! You have been selected for a remote Data Entry position with GlobalHire Ltd. Salary: $4,500 per month, guaranteed income with no experience needed. To activate your account you must pay a registration fee of $75 via gift card. Contact our HR manager on WhatsApp immediately — only 3 slots left!',
  phishing: 'URGENT: Your bank account has been suspended. We noticed unusual activity. Verify your identity within 24 hours by confirming your card number, CVV and the OTP sent to your phone. Click here: http://secure-bank-verify.top/login',
  investment: 'Join our private crypto investment group. Guaranteed 45% profit weekly on Bitcoin and USDT. Minimum deposit $200. Send funds to our wallet address and double your investment in 7 days. Referral bonus: invite 3 friends and earn 10% commission. Message me on Telegram to start.'
};

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

function findingHtml(f, index) {
  return `<li class="finding finding--${f.severity}" style="animation-delay:${index * 40}ms">
    <div class="finding__icon">${icon(SEVERITY_ICON[f.severity] || 'info', 18)}</div>
    <div class="finding__body">
      <div class="finding__head">
        <h4 class="finding__title">${escapeHtml(f.label)}</h4>
        <span class="chip chip--${f.severity === 'critical' ? 'critical' : f.severity === 'high' ? 'high' : f.severity === 'medium' ? 'moderate' : 'low'}">${escapeHtml(f.severity)}</span>
        <span class="finding__score">+${f.score}</span>
      </div>
      <p class="finding__desc">${escapeHtml(f.description)}</p>
      ${f.evidence ? `<p class="finding__evidence">Detected text: “${escapeHtml(f.evidence)}”</p>` : ''}
      <p class="finding__precaution"><strong>Precaution:</strong> ${escapeHtml(f.precaution)}</p>
    </div>
  </li>`;
}

function resultHtml(result) {
  const tone = result.riskKey;
  return `
    <section class="panel">
      <div class="panel__head">
        <div>
          <h2 class="panel__title">Analysis result</h2>
          <p class="panel__desc">Analysed ${escapeHtml(formatDate(result.createdAt))} · rule-based local inspection</p>
        </div>
        <span class="chip chip--${tone}">${escapeHtml(result.riskLabel)}</span>
      </div>

      <div class="score-wrap">
        ${scoreRing(result.score, tone)}
        <div class="score-meta">
          <div><span class="score-meta__value">${result.score}</span><span class="score-meta__max"> / 100</span></div>
          <p class="score-meta__label">${result.findings.length} warning indicator${result.findings.length === 1 ? '' : 's'} detected</p>
          <div class="score-legend">
            <span class="score-legend__item"><span class="score-legend__dot" style="background:#16A34A"></span>Low 0–24</span>
            <span class="score-legend__item"><span class="score-legend__dot" style="background:#F59E0B"></span>Moderate 25–49</span>
            <span class="score-legend__item"><span class="score-legend__dot" style="background:#EA580C"></span>High 50–74</span>
            <span class="score-legend__item"><span class="score-legend__dot" style="background:#DC2626"></span>Critical 75–100</span>
          </div>
        </div>
      </div>

      <hr class="divider" style="margin:24px 0" />

      <h3 class="section-title" style="margin-bottom:12px">Detected warning signs</h3>
      ${result.findings.length
        ? `<ul class="finding-list">${result.findings.map(findingHtml).join('')}</ul>`
        : `<div class="empty" style="padding:30px 16px">
             <div class="empty__icon">${icon('shield-check', 26)}</div>
             <p class="empty__title">No warning indicators detected</p>
             <p class="empty__desc">None of the ${RULES.length} known scam patterns were found. This is not a guarantee of safety — always verify independently.</p>
           </div>`}

      <h3 class="section-title" style="margin:24px 0 12px">Recommended safety actions</h3>
      <ul class="rec-list">
        ${result.recommendations.map((r) => `<li class="rec-item">
          <span class="rec-item__mark">${icon('check', 12)}</span>
          <span>${escapeHtml(r)}</span>
        </li>`).join('')}
      </ul>

      <div class="row row--wrap" style="margin-top:24px;gap:10px">
        <button class="btn btn--primary" type="button" id="saveBtn">${icon('save', 16)} Save Investigation</button>
        <button class="btn btn--outline" type="button" id="copyBtn">${icon('copy', 16)} Copy Results</button>
        <button class="btn btn--outline" type="button" id="againBtn">${icon('refresh', 16)} Analyze Another</button>
        <button class="btn btn--ghost" type="button" id="journalBtn">${icon('book', 16)} Open in Security Journal</button>
      </div>

      <div class="disclaimer" style="margin-top:22px">
        <span class="disclaimer__icon">${icon('alert-triangle', 18)}</span>
        <span>TRUSTLENS identifies potential warning signs using predefined detection rules. It does not independently verify whether a person, company or opportunity is fraudulent.</span>
      </div>
    </section>`;
}

function animateRing(container) {
  const circle = container.querySelector('.score-ring__value');
  if (!circle) return;
  const target = circle.getAttribute('data-target');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { circle.style.strokeDashoffset = target; });
  });
}

function resultToText(result) {
  const lines = [
    'TRUSTLENS — Message Analysis',
    '================================',
    `Risk score: ${result.score}/100 (${result.riskLabel})`,
    `Analysed: ${formatDate(result.createdAt)}`,
    '',
    `Warning indicators (${result.findings.length}):`
  ];
  result.findings.forEach((f) => {
    lines.push(`- [${f.severity.toUpperCase()}] ${f.label} (+${f.score})`);
    lines.push(`  ${f.description}`);
  });
  lines.push('', 'Recommended actions:');
  result.recommendations.forEach((r) => lines.push(`- ${r}`));
  lines.push('', 'TRUSTLENS detects patterns locally. It does not verify people, companies or opportunities.');
  return lines.join('\n');
}

/* ------------------------- View ------------------------- */

export function renderAnalyzer(root) {
  currentResult = null;
  currentRecordId = null;

  root.innerHTML = `
    <div class="stack">
      <section class="panel">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">Analyze a suspicious message</h2>
            <p class="panel__desc">Paste a job offer, investment pitch, payment request, email, SMS or chat message. TRUSTLENS checks it against ${RULES.length} weighted scam indicators using local rules only.</p>
          </div>
        </div>

        <label class="field">
          <span class="field__label">Message text</span>
          <textarea id="analyzerInput" class="textarea textarea--lg" maxlength="6000"
            placeholder="Paste the full message here…"></textarea>
        </label>

        <div class="row row--between row--wrap" style="margin-top:12px">
          <div class="hint small subtle"><span id="charCount">0</span> / 6000 characters</div>
          <div class="row">
            <button class="btn btn--ghost" type="button" id="clearBtn">Clear</button>
            <button class="btn btn--primary" type="button" id="analyzeBtn">${icon('scan', 16)} Analyze Message</button>
          </div>
        </div>

        <div class="row row--wrap" style="margin-top:16px;gap:8px">
          <span class="tiny subtle strong">Try an example:</span>
          <button class="chip-btn" type="button" data-sample="job">Fake job offer</button>
          <button class="chip-btn" type="button" data-sample="phishing">Phishing SMS</button>
          <button class="chip-btn" type="button" data-sample="investment">Crypto investment</button>
        </div>
      </section>

      <div id="analyzerResult"></div>
    </div>`;

  const input = $('#analyzerInput', root);
  const charCount = $('#charCount', root);
  const analyzeBtn = $('#analyzeBtn', root);
  const resultHost = $('#analyzerResult', root);

  input.addEventListener('input', () => { charCount.textContent = String(input.value.length); });

  $('#clearBtn', root).addEventListener('click', () => {
    input.value = '';
    charCount.textContent = '0';
    resultHost.innerHTML = '';
    currentResult = null;
    currentRecordId = null;
    input.focus();
  });

  root.querySelectorAll('[data-sample]').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = SAMPLES[btn.dataset.sample] || '';
      charCount.textContent = String(input.value.length);
      input.focus();
    });
  });

  analyzeBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (text.length < 20) {
      toast('Please paste at least 20 characters of message text.', 'warning');
      input.focus();
      return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = `${icon('refresh', 16)} Analyzing…`;

    setTimeout(() => {
      const result = analyzeMessage(text);
      currentResult = result;
      const stored = Storage.addCheck(result);
      currentRecordId = stored ? stored.id : null;

      resultHost.innerHTML = resultHtml(result);
      animateRing(resultHost);

      if (Storage.getSettings().notifyAnalysis) {
        Storage.addNotification(`Message analysed — ${result.riskLabel} (${result.score}/100).`, result.score >= 50 ? 'warning' : 'info');
      }

      const saveBtn = $('#saveBtn', resultHost);
      saveBtn.addEventListener('click', () => {
        if (!currentRecordId) return;
        const saved = Storage.saveInvestigation(currentRecordId);
        if (saved) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = `${icon('check', 16)} Saved`;
          toast('Investigation saved to your Security Journal.', 'success');
          if (Storage.getSettings().notifySave) {
            Storage.addNotification('Investigation saved to the Security Journal.', 'success');
          }
        }
      });

      $('#copyBtn', resultHost).addEventListener('click', async () => {
        const ok = await copyText(resultToText(result));
        toast(ok ? 'Results copied to clipboard.' : 'Copy failed — select the text manually.', ok ? 'success' : 'error');
      });

      $('#againBtn', resultHost).addEventListener('click', () => {
        input.value = '';
        charCount.textContent = '0';
        resultHost.innerHTML = '';
        currentResult = null;
        currentRecordId = null;
        input.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      $('#journalBtn', resultHost).addEventListener('click', () => navigate('journal'));

      resultHost.scrollIntoView({ behavior: 'smooth', block: 'start' });

      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = `${icon('scan', 16)} Analyze Message`;
    }, 420);
  });
}
