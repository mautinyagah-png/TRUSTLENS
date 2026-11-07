/* =========================================================
   TRUSTLENS — Reputation database (curated, offline)
   This is a static, hand-curated list. TRUSTLENS does NOT
   contact any external verification service at runtime.
   ========================================================= */

export const LEGIT_BRANDS = [
  /* ── Food & delivery ─────────────────────────────── */
  { id: 'ubereats', name: 'Uber Eats', aliases: ['uber eats','ubereats','uber-eats'],
    domains: ['ubereats.com','uber.com'], category: 'Food delivery',
    notes: ['Official driver signup is at uber.com/drive',
            'Uber Eats never asks you to pay to start delivering',
            'Support is reached through the official app only'] },
  { id: 'doordash', name: 'DoorDash', aliases: ['doordash','door dash'],
    domains: ['doordash.com'], category: 'Food delivery',
    notes: ['Official site: doordash.com','No fee is ever required to join as a driver'] },
  { id: 'grubhub', name: 'Grubhub', aliases: ['grubhub','grub hub'],
    domains: ['grubhub.com'], category: 'Food delivery',
    notes: ['Official site: grubhub.com'] },

  /* ── Shopping ────────────────────────────────────── */
  { id: 'amazon', name: 'Amazon', aliases: ['amazon'],
    domains: ['amazon.com','amazon.co.uk','amazon.de','amazon.ca','amazon.in'],
    category: 'E-commerce',
    notes: ['Amazon never calls to ask for remote access to your device',
            'Amazon never asks for your password by phone or SMS'] },
  { id: 'ebay', name: 'eBay', aliases: ['ebay'],
    domains: ['ebay.com','ebay.co.uk','ebay.de'], category: 'E-commerce',
    notes: ['Official site: ebay.com'] },
  { id: 'walmart', name: 'Walmart', aliases: ['walmart'],
    domains: ['walmart.com'], category: 'Retail',
    notes: ['Official site: walmart.com'] },
  { id: 'target', name: 'Target', aliases: ['target store'],
    domains: ['target.com'], category: 'Retail',
    notes: ['Official site: target.com'] },

  /* ── Payments & finance ──────────────────────────── */
  { id: 'paypal', name: 'PayPal', aliases: ['paypal','pay pal'],
    domains: ['paypal.com'], category: 'Payments',
    notes: ['PayPal never asks for your password or OTP in an email',
            'Always type paypal.com yourself — never follow account links in messages'] },
  { id: 'venmo', name: 'Venmo', aliases: ['venmo'],
    domains: ['venmo.com'], category: 'Payments',
    notes: ['Official site: venmo.com'] },
  { id: 'chase', name: 'Chase Bank', aliases: ['chase','chase bank'],
    domains: ['chase.com'], category: 'Banking',
    notes: ['Chase never asks for your OTP or password',
            'Enter Chase through chase.com — not via links in messages'] },
  { id: 'bankofamerica', name: 'Bank of America', aliases: ['bank of america','bankofamerica','bofa'],
    domains: ['bankofamerica.com'], category: 'Banking',
    notes: ['Official site: bankofamerica.com'] },
  { id: 'coinbase', name: 'Coinbase', aliases: ['coinbase'],
    domains: ['coinbase.com'], category: 'Crypto exchange',
    notes: ['Coinbase never asks you to send crypto to a "support wallet"',
            'Never share your seed phrase with anyone'] },
  { id: 'binance', name: 'Binance', aliases: ['binance'],
    domains: ['binance.com'], category: 'Crypto exchange',
    notes: ['Official site: binance.com','Never send crypto to "verify" an account'] },

  /* ── Tech & platforms ────────────────────────────── */
  { id: 'apple', name: 'Apple', aliases: ['apple','apple id','apple support','icloud'],
    domains: ['apple.com','icloud.com'], category: 'Technology',
    notes: ['Apple never calls you about a "virus" on your device',
            'Apple never asks for your Apple ID password over the phone'] },
  { id: 'microsoft', name: 'Microsoft', aliases: ['microsoft','windows','outlook','office 365','office365'],
    domains: ['microsoft.com','outlook.com','office.com','live.com'], category: 'Technology',
    notes: ['Microsoft never calls about a "virus" — those calls are always scams',
            'Microsoft never asks for remote access unless you requested support yourself'] },
  { id: 'google', name: 'Google', aliases: ['google','gmail','google account'],
    domains: ['google.com','gmail.com'], category: 'Technology',
    notes: ['Google never asks for your password by email',
            'Google account recovery happens only at accounts.google.com'] },
  { id: 'netflix', name: 'Netflix', aliases: ['netflix'],
    domains: ['netflix.com'], category: 'Streaming',
    notes: ['Netflix never asks for card details by SMS or email',
            'Manage your account only at netflix.com'] },
  { id: 'spotify', name: 'Spotify', aliases: ['spotify'],
    domains: ['spotify.com'], category: 'Streaming',
    notes: ['Official site: spotify.com'] },

  /* ── Social ──────────────────────────────────────── */
  { id: 'facebook', name: 'Facebook', aliases: ['facebook','meta'],
    domains: ['facebook.com','fb.com'], category: 'Social media',
    notes: ['Meta never asks for your password via message',
            'Meta security alerts are visible inside the app only'] },
  { id: 'instagram', name: 'Instagram', aliases: ['instagram','insta','ig'],
    domains: ['instagram.com'], category: 'Social media',
    notes: ['Instagram will never DM you asking for your password'] },
  { id: 'whatsapp', name: 'WhatsApp', aliases: ['whatsapp','whats app'],
    domains: ['whatsapp.com','wa.me'], category: 'Messaging',
    notes: ['WhatsApp never asks you to forward a code to "verify" your account',
            'A code sent to your phone is for YOU — never share it'] },
  { id: 'telegram', name: 'Telegram', aliases: ['telegram'],
    domains: ['telegram.org','t.me'], category: 'Messaging',
    notes: ['Telegram itself does not offer investment opportunities or jobs'] },
  { id: 'discord', name: 'Discord', aliases: ['discord'],
    domains: ['discord.com','discord.gg'], category: 'Messaging',
    notes: ['Discord staff will never DM you about your account'] },
  { id: 'linkedin', name: 'LinkedIn', aliases: ['linkedin'],
    domains: ['linkedin.com'], category: 'Professional network',
    notes: ['LinkedIn job offers may be fake — always verify the recruiter domain',
            'Legitimate recruiters use company email, not personal Gmail'] },

  /* ── Employment ──────────────────────────────────── */
  { id: 'handshake', name: 'Handshake', aliases: ['handshake','joinhandshake','join handshake'],
    domains: ['joinhandshake.com','handshake.com'], category: 'Career platform (students)',
    notes: ['Official site: joinhandshake.com',
            'Handshake connects university students with real employers',
            'Handshake does NOT contact users via WhatsApp or Telegram',
            '⚠ "Handshake AI" job offers circulating on messaging apps are an impersonation scam',
            'Handshake never asks for payment to start work'] },
  { id: 'indeed', name: 'Indeed', aliases: ['indeed'],
    domains: ['indeed.com'], category: 'Job board',
    notes: ['Official site: indeed.com',
            'Indeed never asks for a fee to apply to jobs'] },
  { id: 'upwork', name: 'Upwork', aliases: ['upwork'],
    domains: ['upwork.com'], category: 'Freelance platform',
    notes: ['Upwork payments go through the platform — never wire money to a client directly'] },
  { id: 'fiverr', name: 'Fiverr', aliases: ['fiverr'],
    domains: ['fiverr.com'], category: 'Freelance platform',
    notes: ['Official site: fiverr.com'] },

  /* ── Shipping ────────────────────────────────────── */
  { id: 'dhl', name: 'DHL', aliases: ['dhl'],
    domains: ['dhl.com'], category: 'Shipping',
    notes: ['DHL never asks for card details via SMS',
            'Track shipments only at dhl.com'] },
  { id: 'fedex', name: 'FedEx', aliases: ['fedex','fed ex'],
    domains: ['fedex.com'], category: 'Shipping',
    notes: ['FedEx never charges a delivery fee by SMS link'] },
  { id: 'ups', name: 'UPS', aliases: ['ups'],
    domains: ['ups.com'], category: 'Shipping',
    notes: ['UPS never asks for payment via a text link'] },
  { id: 'usps', name: 'USPS', aliases: ['usps','us postal'],
    domains: ['usps.com'], category: 'Shipping',
    notes: ['USPS will never text you a link to pay a "redelivery fee"'] }
];

export const SCAM_PATTERNS = [
  { id: 'handshake-ai', name: 'Handshake AI (impersonation)',
    aliases: ['handshake ai','handshakeai','ai handshake','handshake data entry','handshake ai jobs','handshake ai training'],
    category: 'Job scam / brand impersonation',
    summary: 'Scammers impersonate Handshake, a legitimate career platform, with fake "AI training", "data annotation" or "AI evaluation" jobs.',
    warning: 'Handshake (joinhandshake.com) is real, but it does NOT hire for AI training work, does NOT contact users on WhatsApp or Telegram, and NEVER asks for payment to start.',
    redFlags: [
      'Contacted via WhatsApp or Telegram',
      'Told to pay a registration, training or equipment fee',
      'Promises of high pay for simple repeated tasks',
      'Asks for personal documents before any interview',
      'Told to install remote-access software'
    ] },

  { id: 'ai-training-scam', name: 'Fake "AI training" job scam',
    aliases: ['ai training job','ai training work','ai evaluation job','data annotation job','ai data labeling','ai task job'],
    category: 'Job scam',
    summary: 'Scammers advertise "AI training" work that pays a per-task rate, then demand a deposit to unlock tasks.',
    warning: 'Legitimate AI training companies (Scale AI, Surge, Outlier) never ask you to pay to start work.',
    redFlags: [
      'Upfront fee for "task access" or "equipment"',
      'Contact only via WhatsApp or Telegram',
      'Payment requested before any task is assigned',
      '"VIP" tasks that need a deposit'
    ] },

  { id: 'crypto-doubling', name: 'Crypto doubling / giveaways',
    aliases: ['double your bitcoin','bitcoin giveaway','free bitcoin','crypto giveaway','double crypto','send bitcoin get back'],
    category: 'Investment fraud',
    summary: 'You are told to send crypto to a wallet and "receive double back". This is always a scam.',
    warning: 'No one doubles crypto for free. All "send to receive more" offers are theft.',
    redFlags: [
      'A wallet address in the message',
      'Urgency: "only the first 100 people"',
      'Screenshots of "successful" payouts',
      'Impersonation of Elon Musk, Tesla, Apple or similar'
    ] },

  { id: 'pig-butchering', name: 'Pig butchering / romance investment',
    aliases: ['pig butchering','romance investment','online boyfriend investment','whatsapp investment friend','telegram investment friend'],
    category: 'Investment fraud',
    summary: 'A stranger builds a relationship for weeks, then introduces a "private" investment platform that turns out to be fake.',
    warning: 'Any investment suggested by an online romantic contact is a scam. Withdrawals will be blocked with "tax" or "verification" fees.',
    redFlags: [
      'Relationship builds for weeks before investment is mentioned',
      'You are told to install a "special" wallet or app',
      'Withdrawals require additional deposits',
      'Screenshots of profits shown but never a live video withdrawal'
    ] },

  { id: 'amazon-work-scam', name: 'Fake Amazon work-from-home',
    aliases: ['amazon work from home','amazon job offer','amazon part time job','amazon product review job'],
    category: 'Job scam / brand impersonation',
    summary: 'Messages offering "Amazon" work-from-home jobs that require an upfront fee or deposit.',
    warning: 'Amazon hiring happens only at amazon.jobs. There is never a fee to apply.',
    redFlags: [
      'Fee to "activate your seller account"',
      'Task-based "review products" jobs',
      'Contact via Telegram or WhatsApp only'
    ] },

  { id: 'package-fee-scam', name: 'Package / delivery fee scam',
    aliases: ['package delivery fee','dhl fee sms','usps redelivery','fedex delivery fee','ups parcel fee'],
    category: 'Phishing / payment fraud',
    summary: 'A text message claims a package is held and asks for a small "redelivery fee" via a link.',
    warning: 'Courier companies never charge redelivery by SMS link. Real tracking happens at the official site.',
    redFlags: [
      'A link to a domain that is not the official courier site',
      'Small fee ($1–$5) to appear harmless',
      'Asks for full card details on the next page'
    ] },

  { id: 'tax-refund', name: 'Tax refund / IRS scam',
    aliases: ['tax refund sms','irs refund','hmrc tax refund','tax rebate text','irs payment demand'],
    category: 'Phishing / impersonation',
    summary: 'Messages claiming you are owed a tax refund, or that you owe tax and must pay immediately.',
    warning: 'Tax authorities never demand payment by gift card, wire or crypto, and never request bank details by SMS.',
    redFlags: [
      'Threat of arrest or legal action',
      'Payment demanded by gift card or crypto',
      'A link to "claim your refund"',
      'Urgency with a short deadline'
    ] },

  { id: 'bank-verification', name: 'Bank verification / OTP scam',
    aliases: ['bank otp scam','verify your bank account','account suspended verify','bank fraud alert sms','verify card cvv'],
    category: 'Phishing / credential theft',
    summary: 'A message claims your bank account is suspended or at risk and asks you to "verify" by entering card details or an OTP.',
    warning: 'Banks never ask for your OTP or full card details by message. Call the number on the back of your card.',
    redFlags: [
      'Urgency about account suspension',
      'A link to a domain that is not your bank',
      'Asks for card CVV, PIN or OTP',
      'Sender email or number does not match your bank'
    ] },

  { id: 'microsoft-support', name: 'Fake tech support / "virus" call',
    aliases: ['microsoft support scam','apple support scam','windows virus call','tech support popup','virus detected call'],
    category: 'Social engineering',
    summary: 'A popup or phone call claims your device has a virus and asks you to install remote-access software.',
    warning: 'Microsoft, Apple and Google will never call you about a virus. No legitimate company needs remote access to your device.',
    redFlags: [
      'Pop-up with a phone number and beeping alarm',
      'You are told to install TeamViewer or AnyDesk',
      'Payment demanded by gift card',
      'Caller knows a little real information about you'
    ] },

  { id: 'lottery-prize', name: 'Lottery / prize win scam',
    aliases: ['you have won','lottery win','prize claim','claim your prize','you are a winner'],
    category: 'Advance-fee fraud',
    summary: 'You are told you won a lottery or prize you never entered, and must pay a "release fee" to receive it.',
    warning: 'You cannot win a lottery you did not enter. Any prize requiring a payment is a scam.',
    redFlags: [
      'A "release fee" or "tax" to claim the prize',
      'You do not remember entering',
      'Contact only via WhatsApp or a personal email'
    ] },

  { id: 'refund-overpayment', name: 'Overpayment / refund scam',
    aliases: ['accidental overpayment','refund the difference','sent too much money','overpayment refund'],
    category: 'Payment fraud',
    summary: 'A "buyer" sends more money than agreed, then asks you to refund the difference — the original payment later bounces.',
    warning: 'Never refund an overpayment until the original payment has fully cleared in your account.',
    redFlags: [
      'Payment made by cheque or an unusual method',
      'Urgency to refund immediately',
      'Buyer will not accept a normal return of funds'
    ] },

  { id: 'rental-scam', name: 'Fake rental listing',
    aliases: ['fake rental','rent deposit scam','airbnb deposit scam','apartment deposit overseas'],
    category: 'Payment fraud',
    summary: 'A rental listing asks for a deposit before you have viewed the property, often because the "owner is abroad".',
    warning: 'Never pay a rental deposit before viewing the property in person or verifying ownership independently.',
    redFlags: [
      '"Owner is overseas and cannot show the property"',
      'Payment requested by wire transfer or crypto',
      'Price significantly below market rate',
      'Pressure to decide "before someone else takes it"'
    ] },

  { id: 'investment-guaranteed', name: 'Guaranteed-return investment',
    aliases: ['guaranteed returns','guaranteed profit','100% profit','risk free investment','guaranteed roi'],
    category: 'Investment fraud',
    summary: 'An "investment" promises guaranteed returns. No legitimate investment can guarantee a return.',
    warning: 'If returns are guaranteed, it is not an investment. Regulated products always warn that capital is at risk.',
    redFlags: [
      'Fixed % return per day/week/month',
      '"Account manager" pushes you to deposit more',
      'Withdrawals require a "tax" or "release fee"',
      'The platform is not on any financial regulator register'
    ] }
];

/* -------- Normalisation + lookup -------- */

function normalise(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(str) {
  return normalise(str).replace(/\s+/g, '');
}

export function isUrlLike(value) {
  const s = String(value || '').trim();
  if (!s) return false;
  if (/^https?:\/\//i.test(s)) return true;
  if (/\s/.test(s)) return false;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i.test(s)) return true;
  return false;
}

/** Look up a free-text query (brand name or phrase). */
export function lookupBrand(query) {
  const n = normalise(query);
  const c = compact(query);
  if (!n) return { type: 'empty' };

  /* Check scam patterns first — safety over convenience. */
  for (const scam of SCAM_PATTERNS) {
    if (scam.aliases.some((a) => {
      const an = normalise(a);
      const ac = compact(a);
      return an === n || n.includes(an) || c.includes(ac);
    })) {
      return { type: 'scam', data: scam };
    }
  }

  for (const brand of LEGIT_BRANDS) {
    if (brand.aliases.some((a) => {
      const an = normalise(a);
      return an === n || n.includes(an);
    })) {
      return { type: 'legit', data: brand };
    }
  }

  return { type: 'unknown', query: String(query).trim() };
}

/** Given a hostname from a URL, decide if it matches or impersonates a known brand. */
export function checkHostAgainstBrands(host) {
  const h = String(host || '').toLowerCase();
  const labels = h.split('.').filter(Boolean);
  if (labels.length < 2) return { type: 'unknown' };
  const registrable = labels.slice(-2).join('.');

  /* Exact official domain */
  for (const brand of LEGIT_BRANDS) {
    if (brand.domains.includes(h) || brand.domains.includes(registrable)) {
      return { type: 'legit-domain', data: brand, matchedDomain: registrable };
    }
  }

  /* Impersonation: brand name appears in host but registrable domain isn't official */
  for (const brand of LEGIT_BRANDS) {
    for (const domain of brand.domains) {
      const stem = domain.split('.')[0];
      if (stem.length >= 4 && h.includes(stem) && registrable !== domain) {
        return { type: 'impersonation', data: brand, officialDomain: domain };
      }
    }
  }

  /* Scam pattern in the host itself */
  const hostNoDots = h.replace(/\./g, '');
  for (const scam of SCAM_PATTERNS) {
    if (scam.aliases.some((a) => {
      const ac = compact(a);
      return ac.length >= 6 && hostNoDots.includes(ac);
    })) {
      return { type: 'scam-domain', data: scam };
    }
  }

  return { type: 'unknown' };
}
