/* =========================================================
   TRUSTLENS — Threat Library
   ========================================================= */

import { $, escapeHtml, icon, openModal, toast } from './utils.js';

export const LIBRARY = [
  {
    id: 'fake-jobs',
    icon: 'briefcase',
    title: 'Fake Job Opportunities',
    summary: 'Fraudulent employers advertise attractive remote roles to collect fees, identity documents or free labour.',
    signs: [
      'You are hired without a real interview or verification call.',
      'A "registration", "training" or "equipment" fee is requested before you start.',
      'Salary is far above market rate for simple or unspecified work.',
      'The recruiter only communicates through WhatsApp, Telegram or a personal email address.',
      'The company has no verifiable website, address or professional profile.'
    ],
    scenario: 'A message arrives offering a $4,500 monthly remote data-entry role. You are told you were "selected" without an interview. To activate your account, you must pay a $75 registration fee by gift card. Once paid, the recruiter disappears — and your card details may also be reused.',
    prevention: [
      'Never pay a fee to obtain a job — legitimate employers pay you, not the reverse.',
      'Verify the company domain and check whether the recruiter email matches it.',
      'Search the exact job description to see whether it appears across many fake listings.',
      'Ask for a video interview and a written offer on company letterhead.',
      'Never send identity documents before a verified contract exists.'
    ],
    tips: [
      'A real hiring process involves conversation, not instant approval.',
      'If the "company" only exists inside a chat app, it probably does not exist at all.'
    ]
  },
  {
    id: 'phishing',
    icon: 'mail',
    title: 'Phishing Attacks',
    summary: 'Messages that imitate a trusted brand to trick you into revealing passwords, codes or card details.',
    signs: [
      'The message creates panic about a suspended, locked or compromised account.',
      'You are asked to "verify" by entering a password, card number or one-time code.',
      'The link domain is subtly different from the real one (extra word, hyphen or unusual suffix).',
      'Greeting is generic ("Dear customer") rather than using your actual name.',
      'The sender address does not match the organisation it claims to be.'
    ],
    scenario: 'An SMS claims your bank account is suspended and urges you to verify within 24 hours. The link leads to a page that looks identical to your bank and asks for your card number, CVV and the OTP sent to your phone. The attacker uses those details to empty the account.',
    prevention: [
      'Never open account links from messages — type the official address yourself.',
      'No legitimate organisation will ever ask for your password or OTP.',
      'Check the sender address character by character.',
      'Enable two-factor authentication wherever it is offered.',
      'Report and delete the message once you have verified it is fake.'
    ],
    tips: [
      'Phishing relies on urgency. Slowing down defeats most attempts.',
      'A padlock icon means the connection is encrypted — not that the site is honest.'
    ]
  },
  {
    id: 'fake-investments',
    icon: 'trending-up',
    title: 'Fake Investment Platforms',
    summary: 'Websites and apps that show fake growth while quietly collecting deposits that can never be withdrawn.',
    signs: [
      'Promised returns are far above anything a regulated market offers.',
      'A personal "account manager" pushes you to deposit more.',
      'Withdrawals are blocked until you pay a "tax" or "release fee".',
      'The platform is not listed on any financial regulator register.',
      'Testimonials and screenshots appear across many unrelated websites.'
    ],
    scenario: 'A dashboard shows your $500 deposit growing to $4,200 in three weeks. When you try to withdraw, support explains that a 15% "withholding tax" must be paid first. After paying, the account is frozen and the website disappears.',
    prevention: [
      'Check the platform against your country\'s financial regulator register.',
      'Treat any guaranteed return as evidence of fraud.',
      'Withdraw a small amount early — legitimate platforms allow it.',
      'Never let a "manager" guide you through deposits on a shared screen.',
      'Be wary of platforms promoted only through social media ads.'
    ],
    tips: [
      'If returns were truly guaranteed, the seller would not need your money.',
      'Fake dashboards are just numbers on a screen — they are not assets.'
    ]
  },
  {
    id: 'crypto-scams',
    icon: 'coins',
    title: 'Cryptocurrency Scams',
    summary: 'Wallet-draining schemes, fake airdrops and romance-driven "investment" fraud targeting crypto holders.',
    signs: [
      'You are asked to send crypto to a wallet address from a message.',
      'A "giveaway" promises to double anything you send.',
      'A new contact builds a relationship before introducing an investment.',
      'The platform requires you to install a "special" wallet or remote-access app.',
      'Withdrawals require an additional deposit.'
    ],
    scenario: 'An online contact spends weeks building trust, then shares a "private" trading platform with remarkable screenshots. You deposit USDT. When you try to withdraw, you are told the account needs a 20% "verification deposit". Every further payment unlocks nothing.',
    prevention: [
      'Never send crypto to an address you received in a message.',
      'Use only well-known exchanges you reach by typing the address yourself.',
      'Be extremely cautious with investment advice from online romantic contacts.',
      'Never install remote-control software for a "support agent".',
      'Remember that crypto transfers are irreversible.'
    ],
    tips: [
      '"Pig butchering" scams build trust over weeks before asking for money.',
      'Free crypto giveaways that require a deposit are always scams.'
    ]
  },
  {
    id: 'identity-theft',
    icon: 'fingerprint',
    title: 'Identity Theft',
    summary: 'Personal data collected through fake forms, quizzes and documents is used to impersonate you.',
    signs: [
      'Requests for ID numbers, passport scans or selfies with your ID.',
      'Unverified forms asking for your full address and date of birth.',
      'Unexpected messages about a "data breach" requiring you to re-confirm details.',
      'Social media quizzes asking for your first pet, school or mother\'s maiden name.',
      'Job offers requesting documents before any contract is signed.'
    ],
    scenario: 'A fake recruitment page collects your full name, date of birth, national ID number and a selfie holding your ID card. Weeks later, an account is opened in your name and a loan is taken out using your details.',
    prevention: [
      'Share identity documents only through verified, official channels.',
      'Ask why a document is needed and how it will be stored.',
      'Use a password manager rather than security questions based on personal facts.',
      'Freeze your credit file if you suspect your identity has been used.',
      'Never post photos of ID documents or boarding passes online.'
    ],
    tips: [
      'Personal facts are permanent — they cannot be changed like a password.',
      'A "verification" request is not automatically a legitimate one.'
    ]
  },
  {
    id: 'earning-scams',
    icon: 'smartphone',
    title: 'Online Earning Scams',
    summary: 'Task-based "earn money online" schemes that pay once, then demand deposits to unlock larger payouts.',
    signs: [
      'Payment for trivial tasks such as liking videos or clicking links.',
      'A small first payout designed to build trust.',
      'Larger "VIP" tasks that require you to deposit your own money.',
      'A group chat full of screenshots of withdrawals.',
      'Support asks for a fee to release your balance.'
    ],
    scenario: 'You are added to a Telegram group where members earn money liking videos. Your first $8 payout arrives instantly. To earn more, you must complete a "VIP task" by depositing $100. After depositing, you are told you must deposit $300 more to correct an "error".',
    prevention: [
      'Treat any "pay to earn" model as a red flag.',
      'Small early payouts are bait, not proof of legitimacy.',
      'Never deposit money to complete a task.',
      'Leave group chats that promote guaranteed daily earnings.',
      'Report the account to the platform you were contacted on.'
    ],
    tips: [
      'If a scheme needed your deposit, it is an investment — and an unregulated one.',
      'Screenshots of payouts are trivially faked.'
    ]
  },
  {
    id: 'social-engineering',
    icon: 'users',
    title: 'Social Engineering',
    summary: 'Manipulation that exploits trust, authority or helpfulness instead of technical weaknesses.',
    signs: [
      'A stranger claims authority ("I\'m from IT support").',
      'The request is urgent and secret ("don\'t tell anyone").',
      'You are asked to bypass a normal process "just this once".',
      'The person knows a few real details about you and uses them for credibility.',
      'You feel pressured, flattered or rushed into acting.'
    ],
    scenario: 'Someone calls claiming to be from your company\'s IT desk and asks you to read out the code from an authentication prompt so they can "fix a server issue". The code actually authorises a password reset on your account.',
    prevention: [
      'Verify identity through a channel you initiate, not one they provide.',
      'Never share authentication codes, even with "colleagues".',
      'Be suspicious of secrecy and urgency combined.',
      'Follow official processes even when pressured to skip them.',
      'Trust your discomfort — pause and ask someone else.'
    ],
    tips: [
      'Social engineering targets people, not software.',
      'Calling back on a publicly listed number defeats most impersonation.'
    ]
  },
  {
    id: 'payment-fraud',
    icon: 'credit-card',
    title: 'Payment Fraud',
    summary: 'Requests to pay through irreversible channels, or invoices changed at the last moment.',
    signs: [
      'Payment requested by gift card, crypto or wire transfer.',
      'Bank details "changed" just before a known payment is due.',
      'Pressure to pay before goods or services are delivered.',
      'Overpayment offers where you must refund the difference.',
      'Payment links sent from a different domain than the seller.'
    ],
    scenario: 'An email that appears to be from a regular supplier explains that their bank details have changed. The new account is controlled by an attacker. The invoice looks correct, but the money is gone the moment it is sent.',
    prevention: [
      'Confirm bank detail changes by phone using a known number.',
      'Never pay for goods with gift cards.',
      'Use reversible payment methods where possible.',
      'Check the sender domain of every payment instruction.',
      'Refuse overpayment refunds — this is a classic fraud pattern.'
    ],
    tips: [
      'Irreversible payments are the fraudster\'s favourite tool.',
      'A verbal confirmation call is the cheapest insurance you can buy.'
    ]
  }
];

let query = '';
let activeCategory = 'all';

function cardHtml(item, index) {
  return `<button class="library-card" type="button" data-id="${escapeHtml(item.id)}"
    style="animation:viewIn .3s var(--ease) ${index * 35}ms backwards">
    <span class="library-card__icon">${icon(item.icon, 22)}</span>
    <span class="library-card__title">${escapeHtml(item.title)}</span>
    <span class="library-card__desc">${escapeHtml(item.summary)}</span>
    <span class="library-card__foot">
      <span>${item.signs.length} warning signs</span>
      <span>${icon('arrow-right', 15)}</span>
    </span>
  </button>`;
}

export function openThreat(id) {
  const item = LIBRARY.find((x) => x.id === id);
  if (!item) return;

  openModal({
    title: item.title,
    subtitle: 'Threat Library',
    size: 'lg',
    body: `
      <p class="muted" style="font-size:13.5px;line-height:1.7;margin-bottom:22px">${escapeHtml(item.summary)}</p>

      <div class="detail-section">
        <h4>Common warning signs</h4>
        <ul class="detail-list">${item.signs.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
      </div>

      <div class="detail-section">
        <h4>Example scenario</h4>
        <div class="scenario-box">${escapeHtml(item.scenario)}</div>
      </div>

      <div class="detail-section">
        <h4>Prevention advice</h4>
        <ul class="detail-list">${item.prevention.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
      </div>

      <div class="detail-section">
        <h4>Related safety tips</h4>
        <ul class="detail-list">${item.tips.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
      </div>`,
    footer: `<button class="btn btn--primary" type="button" data-close>Close</button>`,
    onMount(el, close) {
      el.querySelector('[data-close]').addEventListener('click', close);
    }
  });
}

function paintGrid(root) {
  const grid = $('#libraryGrid', root);
  const counter = $('#libraryCount', root);

  const q = query.trim().toLowerCase();
  const filtered = LIBRARY.filter((item) => {
    const matchesQuery = !q
      || item.title.toLowerCase().includes(q)
      || item.summary.toLowerCase().includes(q)
      || item.signs.join(' ').toLowerCase().includes(q)
      || item.prevention.join(' ').toLowerCase().includes(q);
    const matchesCategory = activeCategory === 'all' || item.id === activeCategory;
    return matchesQuery && matchesCategory;
  });

  counter.textContent = `${filtered.length} of ${LIBRARY.length} topics`;

  grid.innerHTML = filtered.length
    ? filtered.map(cardHtml).join('')
    : `<div class="empty" style="grid-column:1/-1">
         <div class="empty__icon">${icon('search', 26)}</div>
         <p class="empty__title">No topics match your search</p>
         <p class="empty__desc">Try another keyword, or clear the category filter.</p>
       </div>`;
}

export function renderThreatLibrary(root, params = []) {
  root.innerHTML = `
    <div class="stack">
      <div class="row row--between row--wrap">
        <div>
          <h2 class="panel__title" style="font-size:17px">Understand the threats</h2>
          <p class="small subtle" style="margin-top:3px">Original educational content on the most common digital fraud patterns.</p>
        </div>
        <span class="chip chip--neutral" id="libraryCount">${LIBRARY.length} topics</span>
      </div>

      <div class="toolbar">
        <div class="toolbar__search">
          ${icon('search', 16)}
          <input class="input" type="search" id="librarySearch" placeholder="Search threats, signs and advice…"
            value="${escapeHtml(query)}" aria-label="Search threat library" />
        </div>
        <div class="row row--wrap" id="categoryChips" style="gap:6px"></div>
      </div>

      <div class="library-grid" id="libraryGrid"></div>
    </div>`;

  const chips = $('#categoryChips', root);
  chips.innerHTML = [{ id: 'all', title: 'All topics' }, ...LIBRARY]
    .map((c) => `<button class="chip-btn ${activeCategory === c.id ? 'is-active' : ''}"
      type="button" data-cat="${escapeHtml(c.id)}">${escapeHtml(c.title)}</button>`).join('');

  chips.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    chips.querySelectorAll('.chip-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.cat === activeCategory));
    paintGrid(root);
  });

  const search = $('#librarySearch', root);
  let timer;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { query = search.value; paintGrid(root); }, 180);
  });

  $('#libraryGrid', root).addEventListener('click', (e) => {
    const card = e.target.closest('[data-id]');
    if (card) openThreat(card.dataset.id);
  });

  paintGrid(root);

  if (params[0]) openThreat(params[0]);
}
