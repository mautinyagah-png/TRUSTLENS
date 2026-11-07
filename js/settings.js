/* =========================================================
   TRUSTLENS — Settings  (v1.0.1)
   Verified: exports renderSettings
   ========================================================= */

import {
  $, escapeHtml, icon, toast, downloadFile, initialsFromName, confirmDialog
} from './utils.js';
import * as Storage from './storage.js';

const THEMES = [
  { key: 'dark',   label: 'Dark',   icon: 'moon' },
  { key: 'light',  label: 'Light',  icon: 'sun' },
  { key: 'system', label: 'System', icon: 'globe' }
];

const VIEWS = [
  { key: 'overview',  label: 'Overview' },
  { key: 'analyzer',  label: 'Scam Analyzer' },
  { key: 'inspector', label: 'Link Inspector' },
  { key: 'journal',   label: 'Security Journal' },
  { key: 'library',   label: 'Threat Library' },
  { key: 'reports',   label: 'Reports & Analytics' }
];

export function renderSettings(root) {
  const settings = Storage.getSettings();
  const profile  = Storage.getProfile();
  const theme    = Storage.getTheme();
  const summary  = Storage.storageSummary();

  root.innerHTML = `
    <div class="stack">

      <section class="panel">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">Appearance</h2>
            <p class="panel__desc">Choose how TRUSTLENS looks. Your preference is stored in this browser.</p>
          </div>
        </div>
        <div class="theme-grid" id="themeGrid">
          ${THEMES.map((t) => `
            <button class="theme-card ${theme === t.key ? 'is-active' : ''}" type="button" data-theme="${t.key}">
              ${icon(t.icon, 22)}
              <span>${t.label}</span>
            </button>`).join('')}
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">Profile</h2>
            <p class="panel__desc">A local display name for this browser only. TRUSTLENS has no accounts.</p>
          </div>
        </div>
        <div class="row row--wrap" style="gap:20px;align-items:flex-start">
          <div class="avatar-btn" style="width:64px;height:64px;font-size:20px" id="avatarPreview">
            ${escapeHtml(profile.initials || initialsFromName(profile.name))}
          </div>
          <div class="grow" style="min-width:240px">
            <label class="field">
              <span class="field__label">Display name</span>
              <input class="input" id="profileName" type="text" maxlength="40"
                     value="${escapeHtml(profile.name)}" placeholder="Your name" />
            </label>
            <label class="field" style="margin-top:12px">
              <span class="field__label">Initials (optional)</span>
              <input class="input" id="profileInitials" type="text" maxlength="3"
                     value="${escapeHtml(profile.initials)}" placeholder="Auto-generated if empty" />
            </label>
            <div class="row" style="margin-top:14px">
              <button class="btn btn--primary btn--sm" type="button" id="saveProfile">
                ${icon('save', 15)} Save profile
              </button>
              <span class="tiny subtle">Local only — not a verified account.</span>
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">Preferences</h2>
            <p class="panel__desc">Control notifications, the landing page and destructive actions.</p>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom:6px">
          <label class="field">
            <span class="field__label">Default landing page</span>
            <select class="select" id="defaultView">
              ${VIEWS.map((v) => `<option value="${v.key}" ${settings.defaultView === v.key ? 'selected' : ''}>${v.label}</option>`).join('')}
            </select>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-row__text">
            <p class="switch-row__title">Confirm before deleting</p>
            <p class="switch-row__desc">Ask for confirmation before removing records or clearing data.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="confirmDelete" ${settings.confirmDelete ? 'checked' : ''} />
            <span class="switch__track"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-row__text">
            <p class="switch-row__title">Analysis notifications</p>
            <p class="switch-row__desc">Notify me when an analysis or inspection completes.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="notifyAnalysis" ${settings.notifyAnalysis ? 'checked' : ''} />
            <span class="switch__track"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-row__text">
            <p class="switch-row__title">Save notifications</p>
            <p class="switch-row__desc">Notify me when an investigation is saved to the journal.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="notifySave" ${settings.notifySave ? 'checked' : ''} />
            <span class="switch__track"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-row__text">
            <p class="switch-row__title">Storage warnings</p>
            <p class="switch-row__desc">Warn me when browser storage is running low.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="notifyStorage" ${settings.notifyStorage ? 'checked' : ''} />
            <span class="switch__track"></span>
          </label>
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">Privacy &amp; storage</h2>
            <p class="panel__desc">Everything TRUSTLENS knows lives in this browser's LocalStorage. Nothing is uploaded.</p>
          </div>
        </div>

        <div class="kpi-grid" style="margin-bottom:18px">
          <div class="kpi"><p class="kpi__label">Stored data</p><p class="kpi__value" style="font-size:22px">${escapeHtml(summary.label)}</p><p class="kpi__hint">of ~5 MB available</p></div>
          <div class="kpi"><p class="kpi__label">Records</p><p class="kpi__value" style="font-size:22px">${summary.records}</p><p class="kpi__hint">${summary.saved} saved to journal</p></div>
          <div class="kpi"><p class="kpi__label">Notifications</p><p class="kpi__value" style="font-size:22px">${summary.notifications}</p><p class="kpi__hint">In-app only</p></div>
        </div>

        <div class="bar-row" style="margin-bottom:20px">
          <div class="bar-row__top">
            <span class="bar-row__label">Browser storage used</span>
            <span class="bar-row__value">${summary.percent.toFixed(1)}%</span>
          </div>
          <div class="bar-row__track">
            <div class="bar-row__fill" data-width="${Math.max(1.5, summary.percent).toFixed(1)}"></div>
          </div>
        </div>

        <div class="row row--wrap" style="gap:10px">
          <button class="btn btn--outline" type="button" id="exportAll">${icon('download', 15)} Export all data</button>
          <button class="btn btn--outline" type="button" id="importBtn">${icon('upload', 15)} Import backup</button>
          <input type="file" id="importFile" accept="application/json,.json" hidden />
          <button class="btn btn--danger" type="button" id="clearAll">${icon('trash', 15)} Clear application data</button>
        </div>

        <div class="disclaimer" style="margin-top:18px">
          <span class="disclaimer__icon">${icon('alert-triangle', 18)}</span>
          <span>LocalStorage is specific to this browser on this device. It is not cloud synchronisation. Export a backup regularly.</span>
        </div>
      </section>

      <div class="info-box">
        <span class="info-box__icon">${icon('info', 18)}</span>
        <span>TRUSTLENS v1.0.1 · A local, rule-based scam-awareness tool. It does not contact any external verification service.</span>
      </div>
    </div>`;

  /* ----- Theme ----- */
  const themeGrid = $('#themeGrid', root);
  if (themeGrid) {
    themeGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-theme]');
      if (!btn) return;
      const value = btn.dataset.theme;
      Storage.setTheme(value);
      themeGrid.querySelectorAll('.theme-card').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.theme === value);
      });
      toast('Theme set to ' + value + '.', 'success');
    });
  }

  /* ----- Profile ----- */
  const nameInput = $('#profileName', root);
  const initialsInput = $('#profileInitials', root);
  const preview = $('#avatarPreview', root);

  const refreshPreview = () => {
    if (!preview || !nameInput || !initialsInput) return;
    const initials = initialsInput.value.trim() || initialsFromName(nameInput.value);
    preview.textContent = initials.slice(0, 3).toUpperCase();
  };

  if (nameInput) nameInput.addEventListener('input', refreshPreview);
  if (initialsInput) initialsInput.addEventListener('input', refreshPreview);

  const saveProfileBtn = $('#saveProfile', root);
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const name = (nameInput.value || '').trim() || 'Guest Analyst';
      const initials = ((initialsInput.value || '').trim() || initialsFromName(name)).toUpperCase().slice(0, 3);
      Storage.saveProfile({ name, initials });
      toast('Profile saved.', 'success');
      renderSettings(root);
    });
  }

  /* ----- Preferences ----- */
  const dv = $('#defaultView', root);
  if (dv) {
    dv.addEventListener('change', (e) => {
      Storage.saveSettings({ defaultView: e.target.value });
      toast('Default landing page updated.', 'success');
    });
  }

  const bindSwitch = (id, key, message) => {
    const el = $('#' + id, root);
    if (!el) return;
    el.addEventListener('change', (e) => {
      Storage.saveSettings({ [key]: e.target.checked });
      toast(message, 'success');
    });
  };
  bindSwitch('confirmDelete', 'confirmDelete', 'Deletion confirmation updated.');
  bindSwitch('notifyAnalysis', 'notifyAnalysis', 'Analysis notifications updated.');
  bindSwitch('notifySave', 'notifySave', 'Save notifications updated.');
  bindSwitch('notifyStorage', 'notifyStorage', 'Storage warnings updated.');

  /* ----- Storage bar animation ----- */
  const bar = root.querySelector('.bar-row__fill');
  if (bar && bar.dataset.width) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bar.style.width = bar.dataset.width + '%';
    }));
  }

  /* ----- Export all ----- */
  const exportBtn = $('#exportAll', root);
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      downloadFile('trustlens-backup-' + Date.now() + '.json', JSON.stringify(Storage.exportAll(), null, 2));
      Storage.addNotification('Full application backup exported.', 'success');
      toast('Backup exported.', 'success');
    });
  }

  /* ----- Import ----- */
  const fileInput = $('#importFile', root);
  const importBtn = $('#importBtn', root);
  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        let payload;
        try { payload = JSON.parse(String(reader.result)); }
        catch { toast('That file is not valid JSON.', 'error'); return; }
        const result = Storage.importAll(payload);
        if (!result.ok) { toast(result.error || 'Import failed.', 'error'); return; }
        Storage.addNotification('Backup imported — ' + result.added + ' new record(s) added.', 'success');
        toast('Import complete: ' + result.added + ' added, ' + result.skipped + ' skipped.', 'success');
        renderSettings(root);
      };
      reader.onerror = () => toast('Could not read that file.', 'error');
      reader.readAsText(file);
      fileInput.value = '';
    });
  }

  /* ----- Clear all ----- */
  const clearBtn = $('#clearAll', root);
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const doClear = () => {
        Storage.clearAll();
        toast('All application data cleared.', 'success');
        location.hash = '#/overview';
        setTimeout(() => location.reload(), 300);
      };
      if (Storage.getSettings().confirmDelete) {
        confirmDialog({
          title: 'Clear all application data?',
          message: 'Every investigation, note, notification and preference stored in this browser will be permanently deleted. Export a backup first if you want to keep anything.',
          confirmLabel: 'Delete everything',
          onConfirm: doClear
        });
      } else {
        doClear();
      }
    });
  }
}
