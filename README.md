
markdown
<div align="center">

<img src="assets/logo/mark.svg" alt="TRUSTLENS logo" width="96" height="96" />

# TRUSTLENS

**See the Risk. Know Before You Trust.**

A personal digital-security and scam-awareness web application that helps you spot
warning signs in suspicious messages, job offers, investment pitches, links and online
activities — entirely inside your browser.

[![Version](https://img.shields.io/badge/version-1.0.0-F97316?style=flat-square)](https://github.com/)
[![License](https://img.shields.io/badge/license-MIT-171717?style=flat-square)](LICENSE)
[![No Backend](https://img.shields.io/badge/backend-none-16A34A?style=flat-square)](#technology-stack)
[![Vanilla JS](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-EA580C?style=flat-square)](#technology-stack)
[![GitHub Pages Ready](https://img.shields.io/badge/deploy-GitHub%20Pages-FB923C?style=flat-square)](#deploying-to-github-pages)

</div>

---

> **⚠️ Disclaimer**
> TRUSTLENS identifies potential warning signs using predefined detection rules.
> It does **not** independently verify whether a person, company or opportunity is fraudulent.
> A low score is not a guarantee of safety, and a high score is not proof of fraud.

---

## 📑 Table of Contents

- [What is TRUSTLENS?](#what-is-trustlens)
- [Features](#features)
- [Screenshots](#screenshots)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)
- [How LocalStorage Works](#how-localstorage-works)
- [Risk Scoring Model](#risk-scoring-model)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Application Limitations](#application-limitations)
- [Privacy](#privacy)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)
- [Version History](#version-history)

---

## What is TRUSTLENS?

TRUSTLENS is a **fully client-side** security-awareness tool. It analyzes pasted text and
URLs against a library of known scam patterns and returns a weighted risk score, a list
of detected indicators with explanations, and a set of recommended precautions.

Everything runs in the browser:

- **No backend**, no database, no API keys
- **No frameworks** — pure HTML, CSS and vanilla JavaScript (ES modules)
- **No tracking**, no analytics, no third-party requests
- **Data never leaves your device** — everything is stored in your browser's LocalStorage

It is designed for anyone who receives suspicious messages, job offers or links and
wants a structured second opinion before acting.

---

## Features

### 📊 Overview Dashboard
- Animated welcome hero with quick entry points to the two analyzers
- **Four live statistics** calculated from real stored records:
  - Total Checks
  - High-Risk Findings
  - Saved Investigations
  - Links Inspected
- Four quick-action cards
- Recent activity list with risk chip and score
- Rotating security awareness tips (12 tips, no API)
- Threat distribution donut chart built from your own data

### 🔍 Scam Analyzer
A **14-rule weighted detection engine** covering:

| # | Category | Detects |
|---|---|---|
| 1 | Unrealistic promises | Guaranteed income claims |
| 2 | Advance-fee | Upfront payment requests |
| 3 | Pressure tactics | Artificial urgency |
| 4 | Unrealistic promises | Returns far above market rate |
| 5 | Credential theft | Password requests |
| 6 | Credential theft | OTP / verification-code requests |
| 7 | Recruitment scheme | Referral / downline structures |
| 8 | Impersonation | Bank, brand or authority impersonation |
| 9 | Pressure tactics | Push to WhatsApp / Telegram |
| 10 | Data harvesting | ID, card or banking details |
| 11 | Investment fraud | Crypto profit promises |
| 12 | Unrealistic promises | High pay for trivial tasks |
| 13 | Payment fraud | Gift card, wire, crypto demands |
| 14 | Impersonation | Instant hiring without a process |

Additional behaviour:
- **Contextual matching** — a single keyword will not trigger a high score
- **Synergy bonus** when several distinct categories appear together
- **Animated score ring** with severity-coloured arc
- **Evidence excerpts** shown per finding
- **Per-finding precautions** plus a general action list
- Save / Copy / Analyze another / Open journal actions
- Three built-in sample messages to try

### 🔗 Link Inspector
- 13 structural checks performed **without ever opening the link**
- Extracts domain, protocol and host
- Detects:
  - Plain HTTP
  - Raw IP-address hosts
  - Excessive subdomain chains
  - Embedded credentials (`user@host`)
  - Punycode / internationalised domains
  - URL shorteners
  - Suspiciously long URLs
  - High-abuse TLDs (`.tk`, `.ml`, `.ga`, `.cf`, `.gq`, `.top`, `.zip`, `.mov` …)
  - Brand impersonation (`paypal`, `apple`, `amazon`, `binance` …)
  - Hyphen abuse
  - Heavy percent-encoding
  - Non-ASCII characters
  - Security-keyword traps (`login`, `verify`, `secure` …)

### 📓 Security Journal
- Full CRUD over saved investigations
- Search across title, original content and notes
- Filter by investigation type (message / link)
- Filter by risk classification (low / moderate / high / critical)
- Sort newest first or oldest first
- Detail modal with:
  - Original input (scrollable)
  - All findings with scores
  - Recommendations
  - Editable personal notes
- Delete a single record with confirmation
- Delete all records with confirmation
- Export saved investigations as JSON

### 📚 Threat Library
Eight original educational topics, each with a professional icon, warning signs,
an example scenario, prevention advice and related safety tips:

1. **Fake Job Opportunities**
2. **Phishing Attacks**
3. **Fake Investment Platforms**
4. **Cryptocurrency Scams**
5. **Identity Theft**
6. **Online Earning Scams**
7. **Social Engineering**
8. **Payment Fraud**

Live search and category chip filters included.

### 📈 Reports & Analytics
- Six KPI cards
- Date-range filter (All time / 7 / 30 / 90 days)
- **Risk distribution** donut chart
- **Investigation types** bar chart
- **Daily trend** line chart with area fill
- Copy summary to clipboard
- Export analytics snapshot as JSON
- Print-friendly layout (CSS print styles included)
- Charts update instantly as records change

### ⚙️ Settings
- **Appearance** — Dark / Light / System theme (persisted, respects OS preference)
- **Profile** — display name + initials (local only, not an account)
- **Preferences** — default landing page, deletion confirmation, four notification toggles
- **Privacy & Storage** — live storage usage meter, full export, validated import, clear-all
- All preferences persisted in LocalStorage

### 🔔 Notifications
- Bell with unread counter
- Popover panel
- Mark as read / mark all as read / clear
- Notifications for: analysis complete, investigation saved, record deleted, backup exported, backup imported, storage warnings
- Persisted in LocalStorage

### 🔎 Global Search
- Topbar search across saved investigations and threat library topics
- Live results with debounce
- Click a result to jump straight to that record or topic
- `Enter` opens the first result, `Escape` closes the panel

---

## Technology Stack

| Layer | Choice |
|---|---|
| Markup | HTML5 (semantic, accessible) |
| Styling | CSS3 — custom properties, grid, flexbox, animations |
| Logic | Vanilla JavaScript (ES modules) |
| Storage | Browser LocalStorage |
| Icons | Inline SVG (no icon fonts, no CDN dependency) |
| Charts | Hand-rolled SVG (no chart library) |
| Fonts | Inter (Google Fonts) |

**Zero frameworks. Zero build step. Zero backend.**

Specifically **not** used:
- ❌ React, Vue, Angular, Svelte
- ❌ jQuery, Lodash, Alpine
- ❌ Chart.js, D3, ECharts
- ❌ Any paid API or external service
- ❌ Any tracking or analytics

---

## Project Structure
TRUSTLENS/
│
├── index.html # Application shell
│
├── css/
│ ├── style.css # Tokens, reset, sidebar, topbar
│ ├── components.css # Panels, chips, forms, modals, toasts
│ ├── dashboard.css # Hero, stat cards, quick actions, tips
│ └── responsive.css # Breakpoints + print styles
│
├── js/
│ ├── app.js # Shell, router, overview, help, bootstrap
│ ├── storage.js # Centralised LocalStorage layer
│ ├── analyzer.js # Weighted scam rule engine
│ ├── link-inspector.js # Local URL analysis
│ ├── journal.js # Investigation CRUD
│ ├── threat-library.js # Educational content
│ ├── reports.js # Analytics + SVG charts
│ ├── notifications.js # In-app notifications
│ ├── settings.js # Preferences, backup, restore
│ └── utils.js # Helpers, icons, toast, modal, charts
│
├── assets/
│ ├── images/ # (reserved)
│ ├── icons/ # (reserved — icons are inline SVG)
│ └── logo/
│ ├── mark.svg # Square logo mark
│ ├── favicon.svg # Browser favicon
│ └── logo.svg # Full wordmark
│
└── README.md

text

---

## Running Locally

Because TRUSTLENS uses **ES modules**, the `file://` protocol is blocked by browsers.
You must serve the folder over HTTP.

### Option A — Python (recommended)

```bash
cd TRUSTLENS
python3 -m http.server 8080
Then open http://localhost:8080.

Option B — Node.js
bash
cd TRUSTLENS
npx serve .
Option C — VS Code Live Server
Install the Live Server extension

Right-click index.html → Open with Live Server

Option D — PHP
bash
cd TRUSTLENS
php -S localhost:8080
How LocalStorage Works
TRUSTLENS uses six namespaced LocalStorage keys:

Key	Type	Contents
tl_settings	Object	Preferences: landing page, confirmations, notification toggles
tl_profile	Object	Display name and initials
tl_history	Array	All recorded investigations (saved and unsaved)
tl_notifications	Array	In-app notification entries
tl_theme	String	dark | light | system
tl_library	Object	Reserved for user library extensions
Behaviour
Every analysis is logged so dashboard statistics are genuine. Only records you
explicitly Save appear in the Security Journal.

History is capped at 150 records. When full, the oldest unsaved entries are
pruned first; saved records are never automatically deleted.

Notifications are capped at 40 entries.

Import merges records and never overwrites existing ones — duplicates are skipped
using both ID and a fingerprint (type + createdAt + score).

Export produces a complete JSON snapshot you can restore on another browser.

⚠️ Important
LocalStorage is per-browser and per-device. It is not cloud synchronisation.
Clearing browser data, using private/incognito mode, or switching devices will make
your records unavailable.

Export a backup regularly via Settings → Export all data if the records matter to you.

Storage limits
Browsers typically cap LocalStorage at ~5 MB per origin. The Settings screen shows
a live usage meter so you always know how much space is left.

Risk Scoring Model
Every indicator in the Scam Analyzer carries a weight. Weights are summed, a small
synergy bonus is added when several distinct categories appear together, and the
result is capped at 100.

Score bands
Range	Classification	Colour
0 – 24	🟢 Low Risk	#16A34A
25 – 49	🟡 Moderate Risk	#F59E0B
50 – 74	🟠 High Risk	#EA580C
75 – 100	🔴 Critical Risk	#DC2626
Synergy bonus
3+ distinct categories detected → +8

5+ distinct categories detected → +7 (cumulative)

This makes messages that combine several different deception tactics score higher
than a message that repeats a single tactic.

Design principles
A single ordinary keyword will not push a message into a high band

Contextual tests (e.g. "a password" must be paired with a requesting verb, and not
negated by "never share your password")

Evidence is extracted from the source text and shown to the user

Keyboard Shortcuts
Key	Action
Tab	Move focus forward
Shift + Tab	Move focus backward
Escape	Close modal, popover, search panel
Enter (in search)	Open the first search result
Enter (in link input)	Run the inspection
All focusable elements have visible focus rings for accessibility.

Application Limitations
TRUSTLENS is an awareness tool, not a security product or a verification service.

What TRUSTLENS does not do
❌ Query Google Safe Browsing

❌ Query VirusTotal

❌ Query DNS reputation services

❌ Validate SSL certificates

❌ Check WHOIS records

❌ Consult any malware database

❌ Open, fetch or preview any submitted URL

What a result means
Low score — none of the known patterns were detected. This is not a guarantee of safety.

High score — many known warning patterns were detected. This is a strong signal but
not a legal or definitive proof of fraud.

No findings — the message contained none of the 14 rule patterns TRUSTLENS knows
about. It may still be a scam in a style TRUSTLENS has not yet learned to recognise.

Always verify independently
Before sending money, personal data or credentials to anyone, verify their identity
through a channel you initiate yourself — an official website you typed, or a phone
number you looked up independently.

Privacy
TRUSTLENS is built with privacy as a first principle:

✅ No backend — there is no server to send data to

✅ No analytics — no Google Analytics, no Plausible, no tracking

✅ No cookies — only LocalStorage, which you can clear at any time

✅ No telemetry — nothing is logged anywhere except your own browser

✅ No third-party requests — apart from the Inter font loaded from Google Fonts
(you can self-host the font to eliminate this if preferred)

If you want zero external requests, replace the Google Fonts <link> in
index.html with a locally hosted Inter .woff2 file.

Deploying to GitHub Pages
Step 1 — Push the project
bash
git init
git add .
git commit -m "TRUSTLENS v1.0.0"
git branch -M main
git remote add origin https://github.com/<your-user>/trustlens.git
git push -u origin main
Step 2 — Enable Pages
Open the repository on GitHub

Go to Settings → Pages

Under Source, choose Deploy from a branch

Branch: main · Folder: / (root)

Click Save

Step 3 — Visit your site
After ~1 minute, the site is live at:

text
https://<your-user>.github.io/trustlens/
Why it works out of the box
All paths are relative (css/style.css, js/app.js, etc.)

ES modules load correctly over HTTPS

Hash-based routing (#/analyzer) needs no server config

No environment variables, no secrets, no build step

Browser Support
Browser	Version	Status
Chrome / Edge	90+	✅ Fully supported
Firefox	88+	✅ Fully supported
Safari	14+	✅ Fully supported
Opera	76+	✅ Fully supported
iOS Safari	14+	✅ Fully supported
Android Chrome	90+	✅ Fully supported
Requirements: ES modules, URL API, Intl date formatting, CSS custom properties.

Internet Explorer is not supported.

Contributing
Contributions are welcome. To get started:

Fork the repository

Create a feature branch: git checkout -b feature/my-improvement

Make your changes — keep the existing file structure

Test in at least two browsers

Commit: git commit -m "Add: clear description"

Push: git push origin feature/my-improvement

Open a Pull Request

Code style
No frameworks — stick to vanilla HTML, CSS and JS

No build step — files must run directly

ES modules for all JS files

Semantic HTML and accessible labels

escapeHtml() for any user text rendered into the DOM

Never use eval() or innerHTML with untrusted content

License
MIT License © 2025 TRUSTLENS contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

Version History
v1.0.0 — Initial release
✅ Overview dashboard with live stats

✅ Scam Analyzer — 14 weighted rules

✅ Link Inspector — 13 structural checks

✅ Security Journal — full CRUD with notes and search

✅ Threat Library — 8 educational topics

✅ Reports & Analytics — 3 SVG charts, date filters, export

✅ Settings — theme, profile, preferences, backup, restore, clear

✅ Notifications — bell, panel, mark read

✅ Global search across investigations and library

✅ Dark + light themes with System mode

✅ Full responsive layout (mobile, tablet, desktop)

✅ Accessible — semantic HTML, keyboard nav, visible focus rings

✅ Zero backend, zero dependencies, GitHub Pages ready

<div align="center">
TRUSTLENS · See the Risk. Know Before You Trust.

Built with plain HTML, CSS and JavaScript. No frameworks. No backend. No tracking.

⬆ Back to top

</div> ```
