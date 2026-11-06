/* =========================================================
   TRUSTLENS — Reports & Analytics
   ========================================================= */

import {
  $, escapeHtml, icon, riskBand, donutSVG, RISK_COLORS, formatDate, dayKey,
  copyText, downloadFile, toast
} from './utils.js';
import * as Storage from './storage.js';

const RANGES = {
  all: { label: 'All time', days: null },
  '7': { label: 'Last 7 days', days: 7 },
  '30': { label: 'Last 30 days', days: 30 },
  '90': { label: 'Last 90 days', days: 90 }
};

function filterByRange(records, range) {
  const conf = RANGES[range];
  if (!conf || conf.days === null) return records;
  const cutoff = Date.now() - conf.days * 86400000;
  return records.filter((r) => new Date(r.createdAt).getTime() >= cutoff);
}

function trendSeries(records, days) {
  const map = new Map();
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    map.set(dayKey(d), { label: d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }), count: 0 });
  }
  records.forEach((r) => {
    const key = dayKey(r.createdAt);
    if (map.has(key)) map.get(key).count += 1;
  });
  return Array.from(map.values());
}

function lineChart(series) {
  const width = 640;
  const height = 200;
  const padX = 8;
  const padY = 18;
  const max = Math.max(1, ...series.map((s) => s.count));
  const stepX = series.length > 1 ? (width - padX * 2) / (series.length - 1) : 0;

  const points = series.map((s, i) => {
    const x = padX + i * stepX;
    const y = height - padY - (s.count / max) * (height - padY * 2);
    return { x, y, ...s };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L${(padX + (series.length - 1) * stepX).toFixed(1)},${height - padY} L${padX},${height - padY} Z`;

  const dots = points.map((p) => `
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.2" fill="var(--accent)" />
    <title>${escapeHtml(p.label)}: ${p.count}</title>`).join('');

  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = height - padY - f * (height - padY * 2);
    return `<line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}"
      stroke="var(--border)" stroke-width="1" stroke-dasharray="3 5" />`;
  }).join('');

  const labels = points.filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1)
    .map((p) => `<text x="${p.x}" y="${height - 2}" text-anchor="middle" font-size="9.5"
      fill="var(--text-subtle)" font-family="inherit">${escapeHtml(p.label)}</text>`).join('');

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="200" preserveAspectRatio="none"
      role="img" aria-label="Investigation trend chart">
    <defs>
      <linearGradient id="tlArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F97316" stop-opacity="0.32" />
        <stop offset="100%" stop-color="#F97316" stop-opacity="0" />
      </linearGradient>
    </defs>
    ${gridLines}
    <path d="${area}" fill="url(#tlArea)" />
    <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.2"
      stroke-linejoin="round" stroke-linecap="round" />
    ${dots}
    ${labels}
  </svg>`;
}

export function renderReports(root) {
  let range = 'all';

  function draw() {
    const all = Storage.getHistory();
    const records = filterByRange(all, range);

    const total = records.length;
    const high = records.filter((r) => r.score >= 50).length;
    const moderate = records.filter((r) => r.score >= 25 && r.score < 50).length;
    const low = records.filter((r) => r.score < 25).length;
    const messages = records.filter((r) => r.type === 'message').length;
    const links = records.filter((r) => r.type === 'link').length;

    const dist = [
      { key: 'low', label: 'Low risk', value: low, color: RISK_COLORS.low },
      { key: 'moderate', label: 'Moderate risk', value: moderate, color: RISK_COLORS.moderate },
      { key: 'high', label: 'High risk', value: high, color: RISK_COLORS.high }
    ];

    const typeDist = [
      { label: 'Message analyses', value: messages },
      { label: 'Link inspections', value: links }
    ];
    const typeMax = Math.max(1, ...typeDist.map((t) => t.value));

    const days = RANGES[range].days || 14;
    const series = trendSeries(records, Math.min(days, 30));
    const hasTrend = series.some((s) => s.count > 0);

    root.innerHTML = `
      <div class="stack">
        <div class="row row--between row--wrap">
          <div>
            <h2 class="panel__title" style="font-size:17px">Reports &amp; Analytics</h2>
            <p class="small subtle" style="margin-top:3px">Every figure below is calculated from records stored in this browser.</p>
          </div>
          <div class="row row--wrap">
            <select class="select" id="rangeSelect" style="min-width:150px" aria-label="Date range">
              ${Object.entries(RANGES).map(([key, conf]) =>
                `<option value="${key}" ${key === range ? 'selected' : ''}>${conf.label}</option>`).join('')}
            </select>
            <button class="btn btn--outline btn--sm" type="button" id="copySummary">${icon('copy', 15)} Copy summary</button>
            <button class="btn btn--outline btn--sm" type="button" id="exportReport">${icon('download', 15)} JSON</button>
            <button class="btn btn--outline btn--sm" type="button" id="printReport">${icon('printer', 15)} Print</button>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi"><p class="kpi__label">Total investigations</p><p class="kpi__value">${total}</p><p class="kpi__hint">All recorded checks</p></div>
          <div class="kpi"><p class="kpi__label">High-risk findings</p><p class="kpi__value" style="color:var(--danger)">${high}</p><p class="kpi__hint">Score 50 and above</p></div>
          <div class="kpi"><p class="kpi__label">Moderate risk</p><p class="kpi__value" style="color:var(--warning)">${moderate}</p><p class="kpi__hint">Score 25 – 49</p></div>
          <div class="kpi"><p class="kpi__label">Low risk</p><p class="kpi__value" style="color:var(--success)">${low}</p><p class="kpi__hint">Score 0 – 24</p></div>
          <div class="kpi"><p class="kpi__label">Message analyses</p><p class="kpi__value">${messages}</p><p class="kpi__hint">Scam Analyzer runs</p></div>
          <div class="kpi"><p class="kpi__label">URL inspections</p><p class="kpi__value">${links}</p><p class="kpi__hint">Link Inspector runs</p></div>
        </div>

        <div class="chart-grid">
          <section class="panel">
            <div class="panel__head"><div><h3 class="panel__title">Risk distribution</h3>
              <p class="panel__desc">Saved and recorded checks by classification.</p></div></div>
            ${total === 0
              ? `<div class="empty" style="padding:34px 12px">
                   <div class="empty__icon">${icon('chart', 24)}</div>
                   <p class="empty__title">No data in this range</p>
                   <p class="empty__desc">Run an analysis to populate the charts.</p>
                 </div>`
              : `<div class="donut-wrap">
                   ${donutSVG(dist, { size: 176, thickness: 20 })}
                   <div class="legend">
                     ${dist.map((d) => `<div class="legend__item">
                       <span class="legend__dot" style="background:${d.color}"></span>
                       <span class="legend__label">${d.label}</span>
                       <span class="legend__value">${d.value}</span>
                     </div>`).join('')}
                   </div>
                 </div>`}
          </section>

          <section class="panel">
            <div class="panel__head"><div><h3 class="panel__title">Investigation types</h3>
              <p class="panel__desc">Where your checks came from.</p></div></div>
            <div class="bar-chart">
              ${typeDist.map((t) => `
                <div class="bar-row">
                  <div class="bar-row__top">
                    <span class="bar-row__label">${t.label}</span>
                    <span class="bar-row__value">${t.value}</span>
                  </div>
                  <div class="bar-row__track">
                    <div class="bar-row__fill" data-width="${((t.value / typeMax) * 100).toFixed(1)}"></div>
                  </div>
                </div>`).join('')}
            </div>
            ${total === 0 ? '<p class="small subtle" style="margin-top:16px">No investigations yet.</p>' : ''}
          </section>
        </div>

        <section class="panel">
          <div class="panel__head"><div><h3 class="panel__title">Investigation trend</h3>
            <p class="panel__desc">Checks per day over the selected period.</p></div></div>
          ${hasTrend
            ? lineChart(series)
            : `<div class="empty" style="padding:34px 12px">
                 <div class="empty__icon">${icon('activity', 24)}</div>
                 <p class="empty__title">Nothing recorded in this period</p>
                 <p class="empty__desc">Trends appear once investigations exist within the selected range.</p>
               </div>`}
        </section>

        <div class="info-box">
          <span class="info-box__icon">${icon('info', 18)}</span>
          <span>Reports read directly from LocalStorage in this browser. They are not uploaded anywhere and are not shared between devices. Chart data changes as soon as records are added or deleted.</span>
        </div>
      </div>`;

    // animate bars
    root.querySelectorAll('.bar-row__fill').forEach((el) => {
      const w = el.dataset.width;
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.width = `${w}%`; }));
    });

    $('#rangeSelect', root).addEventListener('change', (e) => { range = e.target.value; draw(); });

    $('#copySummary', root).addEventListener('click', async () => {
      const summary = [
        'TRUSTLENS — Report summary',
        `Range: ${RANGES[range].label}`,
        `Generated: ${formatDate(new Date().toISOString())}`,
        '',
        `Total investigations: ${total}`,
        `High-risk findings: ${high}`,
        `Moderate risk: ${moderate}`,
        `Low risk: ${low}`,
        `Message analyses: ${messages}`,
        `URL inspections: ${links}`,
        '',
        'Calculated locally from browser storage.'
      ].join('\n');
      const ok = await copyText(summary);
      toast(ok ? 'Summary copied to clipboard.' : 'Copy failed.', ok ? 'success' : 'error');
    });

    $('#exportReport', root).addEventListener('click', () => {
      const payload = {
        app: 'TRUSTLENS',
        type: 'report',
        generatedAt: new Date().toISOString(),
        range: RANGES[range].label,
        totals: { total, high, moderate, low, messages, links },
        distribution: dist,
        records
      };
      downloadFile(`trustlens-report-${Date.now()}.json`, JSON.stringify(payload, null, 2));
      Storage.addNotification('Analytics report exported as JSON.', 'success');
      toast('Report exported.', 'success');
    });

    $('#printReport', root).addEventListener('click', () => {
      window.print();
    });
  }

  draw();
}
