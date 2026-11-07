/* =========================================================
   TRUSTLENS — Reputation database  (v1.1)
   Curated offline knowledge base + host matching helpers.
   This module contacts NO network services.
   ========================================================= */

export const LEGIT_BRANDS = [

  /* ═══════════════ AI TRAINING / EXPERT NETWORKS ═══════════════ */
  {
    id: 'handshake-ai',
    name: 'Handshake AI',
    aliases: ['handshake', 'handshake ai', 'joinhandshake', 'join handshake', 'handshake ai jobs'],
    domains: ['joinhandshake.com', 'handshake.com'],
    category: 'AI training / expert network — part of Handshake',
    notes: [
      'Real company: Handshake was founded in 2014. Handshake AI launched in 2025 and works with frontier AI labs on model evaluation and training.',
      'Official domain is joinhandshake.com. Contributor applications go through the official site only.',
      'Handshake AI does not recruit through WhatsApp or Telegram, and never charges a fee to join.',
      'Some contractors have publicly reported payment disputes (Business Insider, 2026). Keep records of completed work and read the payment terms before starting.',
      'Look-alike domains such as handshake-ai.it.com are not affiliated. Always type joinhandshake.com yourself.'
    ]
  },
  {
    id: 'mercor',
    name: 'Mercor',
    aliases: ['mercor'],
    domains: ['mercor.com'],
    category: 'AI training / expert network',
    notes: [
      'Official domain: mercor.com. AI interview then paid expert tasks.',
      'A 2026 data breach and contractor disputes have been reported. Review the terms and never reuse passwords.'
    ]
  },
  {
    id: 'turing',
    name: 'Turing',
    aliases: ['turing', 'turing jobs'],
    domains: ['turing.com'],
    category: 'AI training / developer network',
    notes: [
      'Official domain: turing.com. Developer and AI-trainer roles.',
      'Large pay gaps between regions have been documented. Confirm the rate in writing before starting.'
    ]
  },
  {
    id: 'outlier',
    name: 'Outlier AI',
    aliases: ['outlier', 'outlier ai', 'outlier.ai'],
    domains: ['outlier.ai'],
    category: 'AI training — operated by Scale AI',
    notes: [
      'Official domain: outlier.ai. Operated by Scale AI.',
      'Pay varies widely by project and region. A 2025–26 wage settlement was reported.'
    ]
  },
  {
    id: 'scale-ai',
    name: 'Scale AI',
    aliases: ['scale ai', 'scale.ai', 'scale'],
    domains: ['scale.com'],
    category: 'AI data platform',
    notes: [
      'Official domain: scale.com. Enterprise data labelling and model evaluation.',
      'Public contributor work is usually routed through Outlier (outlier.ai).'
    ]
  },
  {
    id: 'dataannotation',
    name: 'DataAnnotation.tech',
    aliases: ['dataannotation', 'data annotation', 'dataannotation.tech', 'data annotation tech'],
    domains: ['dataannotation.tech'],
    category: 'AI training platform',
    notes: [
      'Official domain: dataannotation.tech. Paid RLHF and annotation tasks.',
      'Available in a limited set of countries only.',
      'Sudden account bans with balances withheld have been reported. Cash out regularly.'
    ]
  },
  {
    id: 'surge-ai',
    name: 'Surge AI',
    aliases: ['surge ai', 'surgeai', 'surge'],
    domains: ['surgehq.ai'],
    category: 'AI training / data labelling',
    notes: [
      'Official domain: surgehq.ai.',
      'Public annotator work is often routed through DataAnnotation.tech.'
    ]
  },
  {
    id: 'micro1',
    name: 'micro1',
    aliases: ['micro1', 'micro 1'],
    domains: ['micro1.ai'],
    category: 'AI training / expert network',
    notes: ['Official domain: micro1.ai. AI interviewer plus expert task work.']
  },
  {
    id: 'mindrift',
    name: 'Mindrift',
    aliases: ['mindrift'],
    domains: ['mindrift.ai'],
    category: 'AI training platform',
    notes: ['Official domain: mindrift.ai. Freelance AI tutor projects.']
  },
  {
    id: 'alignerr',
    name: 'Alignerr',
    aliases: ['alignerr'],
    domains: ['alignerr.com'],
    category: 'AI training platform',
    notes: ['Official domain: alignerr.com. Subject-expert AI training tasks.']
  },
  {
    id: 'invisible',
    name: 'Invisible Technologies',
    aliases: ['invisible technologies', 'invisible.co'],
    domains: ['invisible.co'],
    category: 'AI training / operations',
    notes: ['Official domain: invisible.co. Enterprise AI training and operations work.']
  },
  {
    id: 'telus-digital',
    name: 'TELUS Digital AI',
    aliases: ['telus digital', 'telus international', 'telus ai'],
    domains: ['telusdigital.com', 'telusinternational.com'],
    category: 'AI training / data services',
    notes: ['Official domains: telusdigital.com and telusinternational.com. Rater and annotator roles.']
  },
  {
    id: 'afterquery',
    name: 'AfterQuery',
    aliases: ['afterquery', 'after query'],
    domains: ['afterquery.com'],
    category: 'AI training / expert network',
    notes: ['Official domain: afterquery.com. Expert data and evaluation work.']
  },
  {
    id: 'babel-audio',
    name: 'Babel Audio',
    aliases: ['babel audio', 'babel.audio'],
    domains: ['babel.audio'],
    category: 'AI training / audio data',
    notes: ['Official domain: babel.audio. Voice and audio data collection projects.']
  },
  {
    id: 'remotasks',
    name: 'Remotasks',
    aliases: ['remotasks', 'remote tasks'],
    domains: ['remotasks.com'],
    category: 'AI training / microtasks',
    notes: ['Official domain: remotasks.com. Microtask platform associated with Scale AI.']
  },
  {
    id: 'appen',
    name: 'Appen',
    aliases: ['appen', 'crowdgen'],
    domains: ['appen.com', 'crowdgen.com'],
    category: 'AI training / data annotation',
    notes: ['Official domains: appen.com and crowdgen.com. Long-running crowdsourcing company.']
  },
  {
    id: 'oneforma',
    name: 'OneForma',
    aliases: ['oneforma', 'one forma'],
    domains: ['oneforma.com'],
    category: 'AI training / data annotation',
    notes: ['Official domain: oneforma.com. Part of Centific.']
  },
  {
    id: 'xai',
    name: 'xAI',
    aliases: ['xai', 'x.ai', 'grok tutors'],
    domains: ['x.ai'],
    category: 'AI lab — direct tutor hiring',
    notes: ['Official domain: x.ai. Hires AI tutors directly for some roles.']
  },
  {
    id: 'welocalize',
    name: 'Welocalize / Welo Data',
    aliases: ['welocalize', 'welo data'],
    domains: ['welocalize.com', 'welodata.com'],
    category: 'AI training / localisation data',
    notes: ['Official domains: welocalize.com and welodata.com.']
  },
  {
    id: 'imerit',
    name: 'iMerit',
    aliases: ['imerit'],
    domains: ['imerit.net'],
    category: 'AI training / data annotation',
    notes: ['Official domain: imerit.net. Enterprise annotation work.']
  },
  {
    id: 'toloka',
    name: 'Toloka',
    aliases: ['toloka'],
    domains: ['toloka.ai', 'toloka.com'],
    category: 'AI training / crowdsourcing',
    notes: ['Official domains: toloka.ai and toloka.com.']
  },
  {
    id: 'clickworker',
    name: 'Clickworker',
    aliases: ['clickworker', 'click worker'],
    domains: ['clickworker.com'],
    category: 'Microtask platform',
    notes: ['Official domain: clickworker.com. General microtasks, not AI-specific.']
  },
  {
    id: 'prolific',
    name: 'Prolific',
    aliases: ['prolific', 'prolific academic'],
    domains: ['prolific.com'],
    category: 'Research participation platform',
    notes: ['Official domain: prolific.com. Paid academic studies, not AI training per se.']
  },
  {
    id: 'usertesting',
    name: 'UserTesting',
    aliases: ['usertesting', 'user testing'],
    domains: ['usertesting.com'],
    category: 'Usability testing platform',
    notes: ['Official domain: usertesting.com. Paid website and app testing.']
  },
  {
    id: 'testbirds',
    name: 'Testbirds',
    aliases: ['testbirds'],
    domains: ['testbirds.com'],
    category: 'Crowdtesting platform',
    notes: ['Official domain: testbirds.com.']
  },

  /* ═══════════════ FOOD & DELIVERY ═══════════════ */
  {
    id: 'ubereats',
    name: 'Uber Eats',
    aliases: ['uber eats', 'ubereats', 'uber-eats'],
    domains: ['ubereats.com', 'uber.com'],
    category: 'Food delivery',
    notes: [
      'Official domains: ubereats.com and uber.com.',
      'Uber Eats never asks you to pay to start delivering. Driver signup is at uber.com/drive.',
      'Support is reached through the official app only.'
    ]
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    aliases: ['doordash', 'door dash'],
    domains: ['doordash.com'],
    category: 'Food delivery',
    notes: ['Official domain: doordash.com. No fee is required to join as a driver.']
  },
  {
    id: 'grubhub',
    name: 'Grubhub',
    aliases: ['grubhub', 'grub hub'],
    domains: ['grubhub.com'],
    category: 'Food delivery',
    notes: ['Official domain: grubhub.com.']
  },
  {
    id: 'deliveroo',
    name: 'Deliveroo',
    aliases: ['deliveroo'],
    domains: ['deliveroo.com', 'deliveroo.co.uk'],
    category: 'Food delivery',
    notes: ['Official domains: deliveroo.com and deliveroo.co.uk.']
  },

  /* ═══════════════ SHOPPING & RETAIL ═══════════════ */
  {
    id: 'amazon',
    name: 'Amazon',
    aliases: ['amazon'],
    domains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.ca', 'amazon.in'],
    category: 'E-commerce',
    notes: [
      'Official domains include amazon.com, amazon.co.uk and regional variants.',
      'Amazon never calls to ask for remote access to your device, and never asks for your password by phone or SMS.',
      'Amazon hiring happens at amazon.jobs — there is never a fee to apply.'
    ]
  },
  {
    id: 'ebay',
    name: 'eBay',
    aliases: ['ebay'],
    domains: ['ebay.com', 'ebay.co.uk', 'ebay.de'],
    category: 'E-commerce',
    notes: ['Official domains: ebay.com and regional variants.']
  },
  {
    id: 'walmart',
    name: 'Walmart',
    aliases: ['walmart'],
    domains: ['walmart.com'],
    category: 'Retail',
    notes: ['Official domain: walmart.com.']
  },
  {
    id: 'target',
    name: 'Target',
    aliases: ['target store', 'target.com'],
    domains: ['target.com'],
    category: 'Retail',
    notes: ['Official domain: target.com.']
  },
  {
    id: 'etsy',
    name: 'Etsy',
    aliases: ['etsy'],
    domains: ['etsy.com'],
    category: 'Marketplace',
    notes: ['Official domain: etsy.com. Keep payments inside Etsy — never wire money to a seller directly.']
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    aliases: ['aliexpress', 'ali express'],
    domains: ['aliexpress.com'],
    category: 'E-commerce',
    notes: ['Official domain: aliexpress.com.']
  },

  /* ═══════════════ PAYMENTS & BANKING ═══════════════ */
  {
    id: 'paypal',
    name: 'PayPal',
    aliases: ['paypal', 'pay pal'],
    domains: ['paypal.com'],
    category: 'Payments',
    notes: [
      'Official domain: paypal.com.',
      'PayPal never asks for your password or a one-time code in an email or message.',
      'Always type paypal.com yourself — never follow account links from messages.'
    ]
  },
  {
    id: 'venmo',
    name: 'Venmo',
    aliases: ['venmo'],
    domains: ['venmo.com'],
    category: 'Payments',
    notes: ['Official domain: venmo.com.']
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    aliases: ['cash app', 'cashapp'],
    domains: ['cash.app'],
    category: 'Payments',
    notes: ['Official domain: cash.app. Cash App support will never ask you to send money to "unlock" an account.']
  },
  {
    id: 'wise',
    name: 'Wise',
    aliases: ['wise', 'transferwise'],
    domains: ['wise.com', 'transferwise.com'],
    category: 'Money transfer',
    notes: ['Official domains: wise.com and transferwise.com.']
  },
  {
    id: 'revolut',
    name: 'Revolut',
    aliases: ['revolut'],
    domains: ['revolut.com'],
    category: 'Banking',
    notes: ['Official domain: revolut.com.']
  },
  {
    id: 'chase',
    name: 'Chase Bank',
    aliases: ['chase bank', 'chase.com'],
    domains: ['chase.com'],
    category: 'Banking',
    notes: ['Official domain: chase.com. Chase never asks for your one-time code or password by message.']
  },
  {
    id: 'bankofamerica',
    name: 'Bank of America',
    aliases: ['bank of america', 'bankofamerica', 'bofa'],
    domains: ['bankofamerica.com'],
    category: 'Banking',
    notes: ['Official domain: bankofamerica.com.']
  },
  {
    id: 'barclays',
    name: 'Barclays',
    aliases: ['barclays'],
    domains: ['barclays.co.uk', 'barclays.com'],
    category: 'Banking',
    notes: ['Official domains: barclays.co.uk and barclays.com.']
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    aliases: ['coinbase'],
    domains: ['coinbase.com'],
    category: 'Crypto exchange',
    notes: [
      'Official domain: coinbase.com.',
      'Coinbase never asks you to send crypto to a "support wallet", and never asks for your seed phrase.'
    ]
  },
  {
    id: 'binance',
    name: 'Binance',
    aliases: ['binance'],
    domains: ['binance.com'],
    category: 'Crypto exchange',
    notes: ['Official domain: binance.com. Never send crypto to "verify" an account.']
  },
  {
    id: 'kraken',
    name: 'Kraken',
    aliases: ['kraken'],
    domains: ['kraken.com'],
    category: 'Crypto exchange',
    notes: ['Official domain: kraken.com.']
  },

  /* ═══════════════ TECHNOLOGY & PLATFORMS ═══════════════ */
  {
    id: 'apple',
    name: 'Apple',
    aliases: ['apple', 'apple id', 'apple support', 'icloud'],
    domains: ['apple.com', 'icloud.com'],
    category: 'Technology',
    notes: [
      'Official domains: apple.com and icloud.com.',
      'Apple never calls you about a "virus" on your device and never asks for your Apple ID password over the phone.'
    ]
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    aliases: ['microsoft', 'windows', 'outlook', 'office 365', 'office365'],
    domains: ['microsoft.com', 'outlook.com', 'office.com', 'live.com'],
    category: 'Technology',
    notes: [
      'Official domains include microsoft.com, outlook.com and office.com.',
      'Microsoft never calls about a "virus" — those calls are always scams.',
      'Microsoft never asks for remote access unless you requested support yourself.'
    ]
  },
  {
    id: 'google',
    name: 'Google',
    aliases: ['google', 'gmail', 'google account'],
    domains: ['google.com', 'gmail.com'],
    category: 'Technology',
    notes: [
      'Official domains: google.com and gmail.com.',
      'Google never asks for your password by email. Account recovery happens only at accounts.google.com.'
    ]
  },
  {
    id: 'netflix',
    name: 'Netflix',
    aliases: ['netflix'],
    domains: ['netflix.com'],
    category: 'Streaming',
    notes: ['Official domain: netflix.com. Netflix never asks for card details by SMS or email.']
  },
  {
    id: 'spotify',
    name: 'Spotify',
    aliases: ['spotify'],
    domains: ['spotify.com'],
    category: 'Streaming',
    notes: ['Official domain: spotify.com.']
  },
  {
    id: 'steam',
    name: 'Steam',
    aliases: ['steam', 'steam games'],
    domains: ['steampowered.com', 'steamcommunity.com'],
    category: 'Gaming',
    notes: ['Official domains: steampowered.com and steamcommunity.com. Steam staff never ask for your password or items.']
  },
  {
    id: 'discord',
    name: 'Discord',
    aliases: ['discord'],
    domains: ['discord.com', 'discord.gg'],
    category: 'Messaging',
    notes: ['Official domains: discord.com and discord.gg. Discord staff will never DM you about your account.']
  },

  /* ═══════════════ SOCIAL & MESSAGING ═══════════════ */
  {
    id: 'facebook',
    name: 'Facebook / Meta',
    aliases: ['facebook', 'meta'],
    domains: ['facebook.com', 'fb.com'],
    category: 'Social media',
    notes: ['Official domains: facebook.com and fb.com. Meta never asks for your password via message.']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    aliases: ['instagram', 'insta'],
    domains: ['instagram.com'],
    category: 'Social media',
    notes: ['Official domain: instagram.com. Instagram will never DM you asking for your password.']
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    aliases: ['whatsapp', 'whats app'],
    domains: ['whatsapp.com', 'wa.me'],
    category: 'Messaging',
    notes: [
      'Official domains: whatsapp.com and wa.me.',
      'WhatsApp never asks you to forward a verification code to anyone. A code sent to your phone is for YOU only.'
    ]
  },
  {
    id: 'telegram',
    name: 'Telegram',
    aliases: ['telegram'],
    domains: ['telegram.org', 't.me'],
    category: 'Messaging',
    notes: ['Official domains: telegram.org and t.me. Telegram itself does not offer investments or jobs.']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    aliases: ['linkedin'],
    domains: ['linkedin.com'],
    category: 'Professional network',
    notes: [
      'Official domain: linkedin.com.',
      'Fake recruiters are common — verify the company domain in the recruiter email.'
    ]
  },

  /* ═══════════════ JOB BOARDS & FREELANCE ═══════════════ */
  {
    id: 'indeed',
    name: 'Indeed',
    aliases: ['indeed'],
    domains: ['indeed.com'],
    category: 'Job board',
    notes: ['Official domain: indeed.com. Indeed never charges a fee to apply to a job.']
  },
  {
    id: 'upwork',
    name: 'Upwork',
    aliases: ['upwork'],
    domains: ['upwork.com'],
    category: 'Freelance platform',
    notes: ['Official domain: upwork.com. Keep payments inside Upwork — never wire money to a client directly.']
  },
  {
    id: 'fiverr',
    name: 'Fiverr',
    aliases: ['fiverr'],
    domains: ['fiverr.com'],
    category: 'Freelance platform',
    notes: ['Official domain: fiverr.com.']
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    aliases: ['glassdoor'],
    domains: ['glassdoor.com'],
    category: 'Job review site',
    notes: ['Official domain: glassdoor.com. Useful for checking employer reviews.']
  },

  /* ═══════════════ SHIPPING ═══════════════ */
  {
    id: 'dhl',
    name: 'DHL',
    aliases: ['dhl'],
    domains: ['dhl.com'],
    category: 'Shipping',
    notes: ['Official domain: dhl.com. DHL never asks for card details via an SMS link.']
  },
  {
    id: 'fedex',
    name: 'FedEx',
    aliases: ['fedex', 'fed ex'],
    domains: ['fedex.com'],
    category: 'Shipping',
    notes: ['Official domain: fedex.com. FedEx never charges a delivery fee by SMS link.']
  },
  {
    id: 'ups',
    name: 'UPS',
    aliases: ['ups'],
    domains: ['ups.com'],
    category: 'Shipping',
    notes: ['Official domain: ups.com. UPS never asks for payment via a text link.']
  },
  {
    id: 'usps',
    name: 'USPS',
    aliases: ['usps', 'us postal service'],
    domains: ['usps.com'],
    category: 'Shipping',
    notes: ['Official domain: usps.com. USPS will never text you a link to pay a "redelivery fee".']
  },
  {
    id: 'royalmail',
    name: 'Royal Mail',
    aliases: ['royal mail', 'royalmail'],
    domains: ['royalmail.com'],
    category: 'Shipping',
    notes: ['Official domain: royalmail.com. Royal Mail never asks for a redelivery fee by SMS link.']
  }
];

/* ═══════════════════════════════════════════════════════════
   Known scam patterns
   ═══════════════════════════════════════════════════════════ */
export const SCAM_PATTERNS = [
  {
    id: 'ai-training-impersonation',
    name: 'Fake "AI training" job (brand impersonation)',
    aliases: ['ai training scam', 'fake ai training job', 'data annotation scam', 'ai job scam',
              'ai trainer scam', 'pay for ai training job', 'ai task job scam'],
    category: 'Job scam / brand impersonation',
    summary: 'Scammers impersonate real AI-training companies with fake "AI evaluation", "data annotation" or "AI tutor" jobs.',
    warning: 'Real AI-training platforms (Handshake AI, Outlier, DataAnnotation, Mercor, Surge) never charge a fee to join and never recruit through WhatsApp or Telegram. Verify the domain against the official company site.',
    redFlags: [
      'Contacted via WhatsApp or Telegram by a "recruiter"',
      'Asked to pay a registration, training or equipment fee',
      'Asked to install remote-access software before any work',
      'Promises of high pay for trivial repeated tasks',
      'A domain that contains the brand name but is not the official site'
    ]
  },
  {
    id: 'crypto-doubling',
    name: 'Crypto doubling / giveaway',
    aliases: ['double your bitcoin', 'bitcoin giveaway', 'free bitcoin', 'crypto giveaway',
              'double crypto', 'send bitcoin get back', 'crypto doubling'],
    category: 'Investment fraud',
    summary: 'You are told to send crypto to a wallet and "receive double back". This is always a theft attempt.',
    warning: 'No one doubles crypto for free. Every "send to receive more" offer is a scam.',
    redFlags: [
      'A wallet address in the message',
      'Urgency: "only the first 100 people"',
      'Screenshots of "successful" payouts',
      'Impersonation of Elon Musk, Tesla, Apple or a similar figure'
    ]
  },
  {
    id: 'pig-butchering',
    name: 'Pig butchering / romance investment',
    aliases: ['pig butchering', 'romance investment', 'online boyfriend investment',
              'whatsapp investment friend', 'telegram investment friend'],
    category: 'Investment fraud',
    summary: 'A stranger builds a relationship for weeks, then introduces a "private" investment platform that is fake.',
    warning: 'Any investment suggested by an online romantic contact is a scam. Withdrawals will be blocked with "tax" or "verification" fees.',
    redFlags: [
      'Relationship builds for weeks before investment is mentioned',
      'You are told to install a "special" wallet or app',
      'Withdrawals require additional deposits',
      'Profits shown in screenshots but never a live withdrawal'
    ]
  },
  {
    id: 'amazon-work-scam',
    name: 'Fake Amazon work-from-home job',
    aliases: ['amazon work from home', 'amazon job offer', 'amazon part time job',
              'amazon product review job'],
    category: 'Job scam / brand impersonation',
    summary: 'Messages offering "Amazon" work-from-home jobs that require an upfront fee or deposit.',
    warning: 'Amazon hiring happens only at amazon.jobs. There is never a fee to apply.',
    redFlags: [
      'Fee to "activate your seller account"',
      'Task-based "review products" jobs',
      'Contact via Telegram or WhatsApp only'
    ]
  },
  {
    id: 'package-fee-scam',
    name: 'Package / delivery fee scam',
    aliases: ['package delivery fee', 'dhl fee sms', 'usps redelivery', 'fedex delivery fee',
              'ups parcel fee', 'royal mail fee'],
    category: 'Phishing / payment fraud',
    summary: 'A text message claims a package is held and asks for a small "redelivery fee" via a link.',
    warning: 'Courier companies never charge redelivery by SMS link. Real tracking happens at the official site.',
    redFlags: [
      'A link to a domain that is not the official courier site',
      'A small fee ($1–$5) to appear harmless',
      'Full card details requested on the next page'
    ]
  },
  {
    id: 'tax-refund',
    name: 'Tax refund / tax authority scam',
    aliases: ['tax refund sms', 'irs refund', 'hmrc tax refund', 'tax rebate text',
              'irs payment demand'],
    category: 'Phishing / impersonation',
    summary: 'Messages claiming you are owed a tax refund, or that you owe tax and must pay immediately.',
    warning: 'Tax authorities never demand payment by gift card, wire or crypto, and never request bank details by SMS.',
    redFlags: [
      'Threat of arrest or legal action',
      'Payment demanded by gift card or crypto',
      'A link to "claim your refund"',
      'Urgency with a short deadline'
    ]
  },
  {
    id: 'bank-verification',
    name: 'Bank verification / OTP scam',
    aliases: ['bank otp scam', 'verify your bank account', 'account suspended verify',
              'bank fraud alert sms', 'verify card cvv'],
    category: 'Phishing / credential theft',
    summary: 'A message claims your bank account is suspended and asks you to "verify" by entering card details or a one-time code.',
    warning: 'Banks never ask for your one-time code or full card details by message. Call the number on the back of your card.',
    redFlags: [
      'Urgency about account suspension',
      'A link to a domain that is not your bank',
      'Asks for card CVV, PIN or one-time code',
      'Sender email or number does not match your bank'
    ]
  },
  {
    id: 'tech-support',
    name: 'Fake tech support / "virus" call',
    aliases: ['microsoft support scam', 'apple support scam', 'windows virus call',
              'tech support popup', 'virus detected call'],
    category: 'Social engineering',
    summary: 'A popup or phone call claims your device has a virus and asks you to install remote-access software.',
    warning: 'Microsoft, Apple and Google will never call you about a virus. No legitimate company needs remote access to your device.',
    redFlags: [
      'Pop-up with a phone number and a beeping alarm',
      'You are told to install TeamViewer or AnyDesk',
      'Payment demanded by gift card',
      'Caller knows a little real information about you'
    ]
  },
  {
    id: 'lottery-prize',
    name: 'Lottery / prize win scam',
    aliases: ['you have won', 'lottery win', 'prize claim', 'claim your prize',
              'you are a winner'],
    category: 'Advance-fee fraud',
    summary: 'You are told you won a lottery or prize you never entered, and must pay a "release fee".',
    warning: 'You cannot win a lottery you did not enter. Any prize requiring a payment is a scam.',
    redFlags: [
      'A "release fee" or "tax" to claim the prize',
      'You do not remember entering',
      'Contact only via WhatsApp or a personal email'
    ]
  },
  {
    id: 'overpayment-refund',
    name: 'Overpayment / refund scam',
    aliases: ['accidental overpayment', 'refund the difference', 'sent too much money',
              'overpayment refund'],
    category: 'Payment fraud',
    summary: 'A "buyer" sends more than agreed, then asks you to refund the difference — the original payment later bounces.',
    warning: 'Never refund an overpayment until the original payment has fully cleared in your account.',
    redFlags: [
      'Payment made by cheque or an unusual method',
      'Urgency to refund immediately',
      'Buyer refuses a normal return of funds'
    ]
  },
  {
    id: 'rental-scam',
    name: 'Fake rental listing',
    aliases: ['fake rental', 'rent deposit scam', 'airbnb deposit scam',
              'apartment deposit overseas'],
    category: 'Payment fraud',
    summary: 'A rental listing asks for a deposit before you have viewed the property, often because the "owner is abroad".',
    warning: 'Never pay a rental deposit before viewing the property or verifying ownership independently.',
    redFlags: [
      '"Owner is overseas and cannot show the property"',
      'Payment requested by wire transfer or crypto',
      'Price significantly below market rate',
      'Pressure to decide "before someone else takes it"'
    ]
  },
  {
    id: 'guaranteed-investment',
    name: 'Guaranteed-return investment',
    aliases: ['guaranteed returns', 'guaranteed profit', '100% profit', 'risk free investment',
              'guaranteed roi', 'guaranteed income'],
    category: 'Investment fraud',
    summary: 'An "investment" promises guaranteed returns. No legitimate investment can guarantee a return.',
    warning: 'If returns are guaranteed, it is not an investment. Regulated products always warn that capital is at risk.',
    redFlags: [
      'Fixed % return per day, week or month',
      'An "account manager" pushes you to deposit more',
      'Withdrawals require a "tax" or "release fee"',
      'The platform is not on any financial regulator register'
    ]
  },
  {
    id: 'task-scam',
    name: 'Like / review / click-to-earn task scam',
    aliases: ['like and earn', 'review and earn', 'task scam', 'click to earn',
              'video like job', 'telegram task job'],
    category: 'Online earning scam',
    summary: 'You are paid a small amount for liking or reviewing, then asked to deposit money to unlock "VIP" tasks.',
    warning: 'A small first payout is bait. Any task platform that requires your own deposit is a scam.',
    redFlags: [
      'A Telegram or WhatsApp group full of payout screenshots',
      'A small first payout that actually arrives',
      '"VIP task" requiring a deposit',
      'A "fee" to release your balance'
    ]
  },
  {
    id: 'fake-recruiter',
    name: 'Fake recruiter on WhatsApp / Telegram',
    aliases: ['hr manager on whatsapp', 'recruiter on telegram', 'interview on whatsapp',
              'hr on telegram'],
    category: 'Job scam',
    summary: 'A "recruiter" conducts the entire hiring process on WhatsApp or Telegram and asks for documents or fees.',
    warning: 'Legitimate employers use company email and video interviews. A chat-only hiring process is a red flag.',
    redFlags: [
      'Entire process on WhatsApp or Telegram',
      'Job offer without a real interview',
      'Documents or fees requested before a contract',
      'Email address is a free provider, not the company domain'
    ]
  },
  {
    id: 'gift-card-demand',
    name: 'Gift card payment demand',
    aliases: ['pay with gift card', 'itunes card payment', 'google play card payment',
              'steam card payment', 'amazon card payment'],
    category: 'Payment fraud',
    summary: 'You are asked to pay a bill, fine or fee using gift cards. Gift cards are untraceable and irreversible.',
    warning: 'No government agency, utility, employer or tech-support desk accepts gift cards. This is always a scam.',
    redFlags: [
      'Asked to buy cards and read out the codes',
      'Told to stay on the phone while buying them',
      'Urgency or threat of arrest',
      'The "agent" refuses any other payment method'
    ]
  }
];

/* ═══════════════════════════════════════════════════════════
   Normalisation + lookup
   ═══════════════════════════════════════════════════════════ */

function normalise(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(str) {
  return normalise(str).replace(/[\s.]/g, '');
}

export function isUrlLike(value) {
  const s = String(value || '').trim();
  if (!s) return false;
  if (/^https?:\/\//i.test(s)) return true;
  if (/\s/.test(s)) return false;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i.test(s)) return true;
  return false;
}

/**
 * Resolve a free-text query to a brand, a scam pattern, or unknown.
 * Exact matches win. Otherwise the longest matching alias wins,
 * with scam patterns preferred on a tie (safety first).
 */
export function lookupBrand(query) {
  const n = normalise(query);
  const c = compact(query);
  if (!n) return { type: 'empty' };

  /* 1. Exact matches — scams first, then brands. */
  for (const scam of SCAM_PATTERNS) {
    if (scam.aliases.some((a) => normalise(a) === n)) {
      return { type: 'scam', data: scam, match: 'exact' };
    }
  }
  for (const brand of LEGIT_BRANDS) {
    if (brand.aliases.some((a) => normalise(a) === n)) {
      return { type: 'legit', data: brand, match: 'exact' };
    }
  }

  /* 2. Longest substring match. */
  let best = null;
  const consider = (kind, item, alias) => {
    const an = normalise(alias);
    const ac = compact(alias);
    const hit = (an.length >= 4 && n.includes(an)) || (ac.length >= 5 && c.includes(ac));
    if (!hit) return;
    const weight = an.length + (kind === 'scam' ? 0.5 : 0);
    if (!best || weight > best.weight) best = { kind, item, weight, alias };
  };

  SCAM_PATTERNS.forEach((s) => s.aliases.forEach((a) => consider('scam', s, a)));
  LEGIT_BRANDS.forEach((b) => b.aliases.forEach((a) => consider('legit', b, a)));

  if (best) return { type: best.kind, data: best.item, match: 'partial', alias: best.alias };
  return { type: 'unknown', query: String(query).trim() };
}

/**
 * Inspect a hostname against the brand list.
 * Returns one of: legit-domain | impersonation | scam-domain | unknown
 */
export function checkHostAgainstBrands(host) {
  const h = String(host || '').toLowerCase().replace(/^www\./, '');
  const labels = h.split('.').filter(Boolean);
  if (labels.length < 2) return { type: 'unknown' };
  const registrable = labels.slice(-2).join('.');

  /* Exact official domain */
  for (const brand of LEGIT_BRANDS) {
    if (brand.domains.includes(h) || brand.domains.includes(registrable)) {
      return { type: 'legit-domain', data: brand, matchedDomain: registrable };
    }
  }

  /* Brand name present but registrable domain is not official */
  for (const brand of LEGIT_BRANDS) {
    for (const domain of brand.domains) {
      const stem = domain.split('.')[0];
      const candidates = new Set([stem, ...brand.aliases.map(compact)]);
      for (const cand of candidates) {
        if (cand.length >= 5 && compact(h).includes(cand) && registrable !== domain) {
          return { type: 'impersonation', data: brand, officialDomain: domain, trigger: cand };
        }
      }
    }
  }

  /* Scam phrase embedded in the host */
  const hostCompact = compact(h);
  for (const scam of SCAM_PATTERNS) {
    for (const alias of scam.aliases) {
      const ac = compact(alias);
      if (ac.length >= 7 && hostCompact.includes(ac)) {
        return { type: 'scam-domain', data: scam };
      }
    }
  }

  return { type: 'unknown' };
}
