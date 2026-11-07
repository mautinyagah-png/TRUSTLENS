/* =========================================================
   TRUSTLENS — Settings  (v1.0.2 — simplified)
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
  { key: 'overview',   label: 'Overview' },
  { key: 'analyzer',   label: 'Scam Analyzer' },
  { key: 'inspector',  label: 'Link Inspector' },
  { key: 'reputation', label: 'Reputation Check' },
  { key: 'journal',    label: 'Security Journal' },
  { key: 'library',    label: 'Threat Library' },
  { key: 'reports',    label: 'Reports & Analytics' }
];

export function renderSettings(root) {
  const settings = Storage.getSettings();
  const profile  = Storage.getProfile();
  const theme    = Storage.getTheme();

  root.innerHTML = `
    <div class="stack">

      <section class="panel">
        <div class="panel__head">
          <div><h2 class="panel__title">Appearance</h2>
            <p class="panel__desc">Choose how TRUSTLENS looks. Your preference is saved.</p></div>
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
          <div><h2 class="panel__title">Profile</h2>
            <p class="panel__desc">A display name for this browser only.</p></div>
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
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <div><h2 class="panel__title">Preferences</h2>
            <p class="panel__desc">Control the landing page and deletion safety.</p></div>
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
            <p class="switch-row__desc">Ask for confirmation before removing records.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="confirmDelete" ${settings.confirmDelete ? 'checked' : ''} />
            <span class="switch__track"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-row__text">
            <p class="switch-row__title">Analysis notifications</p>
            <p class="switch-row__desc">Notify me when an analysis completes.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="notifyAnalysis" ${settings.notifyAnalysis ? 'checked' : ''} />
            <span class="switch__track"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-row__text">
            <p class="switch-row__title">Save notifications</p>
            <p class="switch-row__desc">Notify me when an investigation is saved.</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="notifySave" ${settings.notifySave ? 'checked' : ''} />
            <span class="switch__track"></span>
          </label>
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <div><h2 class="panel__title">Your data</h2>
            <p class="panel__desc">Keep a backup of your investigations or move them to another device.</p></div>
        </div>

        <div class="row row--wrap" style="gap:10px">
          <button class="btn btn--outline" type="button" id="exportAll">${icon('download', 15)} Export backup</button>
          <button class="btn btn--outline" type="button" id="importBtn">${icon('upload', 15)} Import backup</button>
          <input type="file" id="importFile" accept="application/json,.json" hidden />
        </div>

        <hr class="divider" style="margin:22px 0" />

        <p class="small subtle" style="margin-bottom:12px">
          Removing your data is permanent. Export a backup first if you want to keep anything.
        </p>
        <button class="btn btn--danger" type="button" id="clearAll">${icon('trash', 15)} Clear all data</button>
      </section>

    </div>`;

  const themeGrid = $('#themeGrid', root);
  if (themeGrid) {
    themeGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-theme]');
      if (!btn) return;
      const value = btn.dataset.theme;
      Storage.setTheme(value);
      themeGrid.querySelectorAll('.theme-card').forEach((b) =>
        b.classList.toggle('is-active', b.dataset.theme === value));
      toast('Theme set to ' + value + '.', 'success');
    });
  }

  const nameInput = $('#profileName', root);
  const initialsInput = $('#profileInitials', root);
  const preview = $('#avatarPreview', root);

  const refreshPreview = () => {
    if (!preview || !nameInput || !initialsInput) return;
    const i = initialsInput.value.trim() || initialsFromName(nameInput.value);
    preview.textContent = i.slice(0, 3).toUpperCase();
  };
  if (nameInput) nameInput.addEventListener('input', refreshPreview);
  if (initialsInput) initialsInput.addEventListener('input', refreshPreview);

  const saveBtn = $('#saveProfile', root);
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = (nameInput.value || '').trim() || 'Guest Analyst';
      const initials = ((initialsInput.value || '').trim() || initialsFromName(name)).toUpperCase().slice(0, 3);
      Storage.saveProfile({ name, initials });
      toast('Profile saved.', 'success');
      renderSettings(root);
    });
  }

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

  const exportBtn = $('#exportAll', root);
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      downloadFile('trustlens-backup-' + Date.now() + '.json', JSON.stringify(Storage.exportAll(), null, 2));
      Storage.addNotification('Backup exported.', 'success');
      toast('Backup exported.', 'success');
    });
  }

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
        Storage.addNotification('Backup imported — ' + result.added + ' record(s).', 'success');
        toast('Imported ' + result.added + ' record(s).', 'success');
        renderSettings(root);
      };
      reader.onerror = () => toast('Could not read that file.', 'error');
      reader.readAsText(file);
      fileInput.value = '';
    });
  }

  const clearBtn = $('#clearAll', root);
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const doClear = () => {
        Storage.clearAll();
        toast('All data cleared.', 'success');
        location.hash = '#/overview';
        setTimeout(() => location.reload(), 300);
      };
      if (Storage.getSettings().confirmDelete) {
        confirmDialog({
          title: 'Clear all data?',
          message: 'Every investigation and note stored in this browser will be permanently deleted. Export a backup first if you want to keep anything.',
          confirmLabel: 'Delete everything',
          onConfirm: doClear
        });
      } else {
        doClear();
      }
    });
  }
}
