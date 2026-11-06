/* =========================================================
   TRUSTLENS — Security Journal (CRUD)
   ========================================================= */

import {
  $, $$, escapeHtml, icon, toast, formatDate, timeAgo, copyText, downloadFile,
  openModal, confirmDialog, navigate, truncate
} from './utils.js';
import * as Storage from './storage.js';

const state = { q: '', type: 'all', risk: 'all', sort: 'newest' };

function applyFilters(records) {
  let list = [...records];
  if (state.q.trim()) {
    const q = state.q.trim().toLowerCase();
    list = list.filter((r) => r.title.toLowerCase().includes(q)
      || r.input.toLowerCase().includes(q)
      || r.notes.toLowerCase().includes(q));
  }
  if (state.type !== 'all') list = list.filter((r) => r.type === state.type);
  if (state.risk !== 'all') list = list.filter((r) => r.riskKey === state.risk);
  list.sort((a, b) => {
    const diff = new Date(b.createdAt) - new Date(a.createdAt);
    return state.sort === 'newest' ? diff : -diff;
  });
  return list;
}

function recordCard(r) {
  const typeIcon = r.type === 'link' ? 'link' : 'message';
  const typeLabel = r.type === 'link' ? 'Link inspection' : 'Message analysis';
  return `<article class="record" data-id="${escapeHtml(r.id)}">
    <div class="record__top">
      <span class="record__type">${icon(typeIcon, 14)} ${typeLabel}</span>
      <span class="chip chip--${r.riskKey}">${escapeHtml(r.riskLabel)}</span>
    </div>
    <h3 class="record__title">${escapeHtml(r.title)}</h3>
    <p class="record__preview">${escapeHtml(truncate(r.input, 160))}</p>
    <div class="record__meta">
      <span>${escapeHtml(timeAgo(r.createdAt))}</span>
      <span class="record__score">${r.score}/100</span>
    </div>
    <div class="record__actions">
      <button class="btn btn--outline btn--sm" type="button" data-action="open">View details</button>
      <button class="btn btn--ghost btn--sm" type="button" data-action="delete" aria-label="Delete record">${icon('trash', 15)}</button>
    </div>
  </article>`;
}

function emptyState() {
  return `<div class="empty">
    <div class="empty__icon">${icon('book', 28)}</div>
    <p class="empty__title">No saved investigations yet</p>
    <p class="empty__desc">Analyse a suspicious message or inspect a link, then choose “Save Investigation” to keep the result here.</p>
    <div class="row" style="margin-top:6px">
      <button class="btn btn--primary btn--sm" type="button" data-go="analyzer">${icon('scan', 15)} Open Scam Analyzer</button>
      <button class="btn btn--outline btn--sm" type="button" data-go="inspector">${icon('link', 15)} Open Link Inspector</button>
    </div>
  </div>`;
}

function detailBody(r) {
  return `
    <div class="row row--between row--wrap" style="margin-bottom:16px">
      <span class="chip chip--${r.riskKey}">${escapeHtml(r.riskLabel)}</span>
      <span class="small subtle">${r.score}/100 · ${escapeHtml(formatDate(r.createdAt))}</span>
    </div>

    <div class="detail-section">
      <h4>Original input</h4>
      <div class="scenario-box" style="white-space:pre-wrap;word-break:break-word;max-height:220px;overflow:auto">${escapeHtml(r.input)}</div>
    </div>

    <div class="detail-section">
      <h4>Detected findings (${r.findings.length})</h4>
      ${r.findings.length ? `<ul class="finding-list">${r.findings.map((f) => `
        <li class="finding finding--${f.severity || 'medium'}">
          <div class="finding__body">
            <div class="finding__head">
              <h4 class="finding__title">${escapeHtml(f.label)}</h4>
              <span class="finding__score">+${f.score || 0}</span>
            </div>
            <p class="finding__desc">${escapeHtml(f.description || '')}</p>
          </div>
        </li>`).join('')}</ul>` : '<p class="small subtle">No indicators were recorded for this investigation.</p>'}
    </div>

    <div class="detail-section">
      <h4>Recommendations</h4>
      <ul class="rec-list">
        ${r.recommendations.map((x) => `<li class="rec-item">
          <span class="rec-item__mark">${icon('check', 12)}</span><span>${escapeHtml(x)}</span>
        </li>`).join('') || '<li class="small subtle">None recorded.</li>'}
      </ul>
    </div>

    <div class="detail-section">
      <h4>Personal notes</h4>
      <textarea class="textarea" id="notesInput" maxlength="2000" placeholder="Add your own notes about this investigation…">${escapeHtml(r.notes)}</textarea>
      <div class="row row--between" style="margin-top:10px">
        <span class="tiny subtle">Last updated ${escapeHtml(timeAgo(r.updatedAt))}</span>
        <button class="btn btn--primary btn--sm" type="button" id="saveNotesBtn">${icon('save', 15)} Save notes</button>
      </div>
    </div>`;
}

export function openRecord(id) {
  const record = Storage.getInvestigation(id);
  if (!record || !record.saved) { toast('Record not found.', 'error'); return; }

  openModal({
    title: record.title,
    subtitle: record.type === 'link' ? 'Link inspection' : 'Message analysis',
    size: 'lg',
    body: detailBody(record),
    footer: `
      <button class="btn btn--ghost" type="button" data-close>Close</button>
      <button class="btn btn--outline" type="button" data-copy>${icon('copy', 15)} Copy</button>
      <button class="btn btn--danger" type="button" data-delete>${icon('trash', 15)} Delete</button>`,
    onMount(el, close) {
      el.querySelector('[data-close]').addEventListener('click', close);

      el.querySelector('#saveNotesBtn').addEventListener('click', () => {
        const notes = el.querySelector('#notesInput').value;
        Storage.updateInvestigation(record.id, { notes });
        toast('Notes saved.', 'success');
        renderJournal(document.getElementById('view-root'), []);
      });

      el.querySelector('[data-copy]').addEventListener('click', async () => {
        const text = [
          record.title,
          `Risk: ${record.riskLabel} (${record.score}/100)`,
          `Created: ${formatDate(record.createdAt)}`,
          '',
          record.input,
          '',
          'Findings:',
          ...record.findings.map((f) => `- ${f.label} (+${f.score})`),
          '',
          'Recommendations:',
          ...record.recommendations.map((x) => `- ${x}`),
          record.notes ? `\nNotes:\n${record.notes}` : ''
        ].join('\n');
        const ok = await copyText(text);
        toast(ok ? 'Investigation copied.' : 'Copy failed.', ok ? 'success' : 'error');
      });

      el.querySelector('[data-delete]').addEventListener('click', () => {
        const doDelete = () => {
          Storage.deleteInvestigation(record.id);
          Storage.addNotification('Investigation deleted from the Security Journal.', 'info');
          toast('Investigation deleted.', 'success');
          close();
          renderJournal(document.getElementById('view-root'), []);
        };
        if (Storage.getSettings().confirmDelete) {
          confirmDialog({
            title: 'Delete this investigation?',
            message: 'This permanently removes the record and its notes from this browser. This cannot be undone.',
            confirmLabel: 'Delete record',
            onConfirm: doDelete
          });
        } else {
          doDelete();
        }
      });
    }
  });
}

export function renderJournal(root, params = []) {
  const all = Storage.getSaved();
  const filtered = applyFilters(all);

  root.innerHTML = `
    <div class="stack">
      <div class="row row--between row--wrap">
        <div>
          <h2 class="panel__title" style="font-size:17px">Saved investigations</h2>
          <p class="small subtle" style="margin-top:3px">${all.length} record${all.length === 1 ? '' : 's'} stored in this browser</p>
        </div>
        <div class="row">
          <button class="btn btn--outline btn--sm" type="button" id="exportBtn">${icon('download', 15)} Export</button>
          <button class="btn btn--danger btn--sm" type="button" id="deleteAllBtn">${icon('trash', 15)} Delete all</button>
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar__search">
          ${icon('search', 16)}
          <input class="input" type="search" id="journalSearch" placeholder="Search title, content or notes…"
            value="${escapeHtml(state.q)}" aria-label="Search investigations" />
        </div>
        <select class="select" id="typeFilter" aria-label="Filter by type">
          <option value="all">All types</option>
          <option value="message">Message analyses</option>
          <option value="link">Link inspections</option>
        </select>
        <select class="select" id="riskFilter" aria-label="Filter by risk">
          <option value="all">All risk levels</option>
          <option value="low">Low risk</option>
          <option value="moderate">Moderate risk</option>
          <option value="high">High risk</option>
          <option value="critical">Critical risk</option>
        </select>
        <select class="select" id="sortFilter" aria-label="Sort records">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div id="journalList">
        ${all.length === 0 ? emptyState() : filtered.length === 0
          ? `<div class="empty">
               <div class="empty__icon">${icon('search', 26)}</div>
               <p class="empty__title">No matching investigations</p>
               <p class="empty__desc">Try a different search term or clear your filters.</p>
             </div>`
          : `<div class="record-grid">${filtered.map(recordCard).join('')}</div>`}
      </div>
    </div>`;

  const searchInput = $('#journalSearch', root);
  $('#typeFilter', root).value = state.type;
  $('#riskFilter', root).value = state.risk;
  $('#sortFilter', root).value = state.sort;

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.q = searchInput.value;
      const focusPos = searchInput.selectionStart;
      renderJournal(root, []);
      const next = $('#journalSearch', root);
      next.focus();
      next.setSelectionRange(focusPos, focusPos);
    }, 220);
  });

  $('#typeFilter', root).addEventListener('change', (e) => { state.type = e.target.value; renderJournal(root, []); });
  $('#riskFilter', root).addEventListener('change', (e) => { state.risk = e.target.value; renderJournal(root, []); });
  $('#sortFilter', root).addEventListener('change', (e) => { state.sort = e.target.value; renderJournal(root, []); });

  $('#exportBtn', root).addEventListener('click', () => {
    const payload = {
      app: 'TRUSTLENS',
      type: 'journal-export',
      exportedAt: new Date().toISOString(),
      records: filtered
    };
    downloadFile(`trustlens-journal-${Date.now()}.json`, JSON.stringify(payload, null, 2));
    Storage.addNotification('Security Journal exported as JSON.', 'success');
    toast('Journal exported.', 'success');
  });

  $('#deleteAllBtn', root).addEventListener('click', () => {
    if (!all.length) { toast('There are no saved investigations to delete.', 'warning'); return; }
    const doDelete = () => {
      Storage.clearHistory();
      Storage.addNotification('All investigations were deleted.', 'warning');
      toast('All investigations deleted.', 'success');
      renderJournal(root, []);
    };
    if (Storage.getSettings().confirmDelete) {
      confirmDialog({
        title: 'Delete all investigations?',
        message: 'Every saved investigation, note and analysis record stored in this browser will be permanently removed. Export a backup first if you want to keep them.',
        confirmLabel: 'Delete everything',
        onConfirm: doDelete
      });
    } else {
      doDelete();
    }
  });

  const list = $('#journalList', root);
  list.addEventListener('click', (e) => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) { navigate(goBtn.dataset.go); return; }

    const card = e.target.closest('.record');
    if (!card) return;
    const id = card.dataset.id;
    const action = e.target.closest('[data-action]')?.dataset.action;

    if (action === 'delete') {
      const doDelete = () => {
        Storage.deleteInvestigation(id);
        Storage.addNotification('Investigation deleted from the Security Journal.', 'info');
        toast('Investigation deleted.', 'success');
        renderJournal(root, []);
      };
      if (Storage.getSettings().confirmDelete) {
        confirmDialog({
          title: 'Delete this investigation?',
          message: 'This permanently removes the record from this browser.',
          confirmLabel: 'Delete record',
          onConfirm: doDelete
        });
      } else {
        doDelete();
      }
      return;
    }

    openRecord(id);
  });

  if (params[0]) {
    openRecord(params[0]);
  }
}
