/* =========================================================
   TRUSTLENS — In-app notifications
   ========================================================= */

import { $, escapeHtml, icon, timeAgo, navigate } from './utils.js';
import * as Storage from './storage.js';

let panelEl = null;
let bellEl = null;
let countEl = null;

function paintPanel() {
  const list = Storage.getNotifications();
  const unread = list.filter((n) => !n.read).length;

  if (countEl) {
    countEl.hidden = unread === 0;
    countEl.textContent = unread > 9 ? '9+' : String(unread);
  }

  if (!panelEl) return;

  panelEl.innerHTML = `
    <div class="pop-head">
      <span class="pop-head__title">Notifications</span>
      <span class="pop-head__actions">
        <button class="pop-link" type="button" data-mark-all>Mark all read</button>
        <button class="pop-link" type="button" data-clear>Clear</button>
      </span>
    </div>
    <div class="notif-list">
      ${list.length === 0
        ? `<div class="empty" style="padding:34px 16px">
             <div class="empty__icon">${icon('bell', 22)}</div>
             <p class="empty__title">You're all caught up</p>
             <p class="empty__desc">Notifications about analyses, saves and backups appear here.</p>
           </div>`
        : list.map((n) => `
            <button class="notif ${n.read ? '' : 'is-unread'}" type="button" data-id="${escapeHtml(n.id)}">
              <span class="notif__dot"></span>
              <span class="grow">
                <span class="notif__msg">${escapeHtml(n.message)}</span>
                <span class="notif__time">${escapeHtml(timeAgo(n.createdAt))}</span>
              </span>
            </button>`).join('')}
    </div>`;

  panelEl.querySelector('[data-mark-all]')?.addEventListener('click', () => {
    Storage.markAllNotificationsRead();
    paintPanel();
  });

  panelEl.querySelector('[data-clear]')?.addEventListener('click', () => {
    Storage.clearNotifications();
    paintPanel();
  });

  panelEl.querySelectorAll('.notif').forEach((btn) => {
    btn.addEventListener('click', () => {
      Storage.markNotificationRead(btn.dataset.id);
      paintPanel();
    });
  });
}

function closePanel() {
  if (!panelEl) return;
  panelEl.hidden = true;
  if (bellEl) bellEl.setAttribute('aria-expanded', 'false');
}

function togglePanel() {
  if (!panelEl) return;
  const willOpen = panelEl.hidden;
  panelEl.hidden = !willOpen;
  if (bellEl) bellEl.setAttribute('aria-expanded', String(willOpen));
  if (willOpen) paintPanel();
}

export function initNotifications() {
  panelEl = $('#notificationPanel');
  bellEl = $('#bellBtn');
  countEl = $('#bellCount');

  if (bellEl) bellEl.addEventListener('click', (e) => { e.stopPropagation(); togglePanel(); });

  document.addEventListener('click', (e) => {
    if (!panelEl || panelEl.hidden) return;
    if (panelEl.contains(e.target) || (bellEl && bellEl.contains(e.target))) return;
    closePanel();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  window.addEventListener('tl:notifications-changed', () => paintPanel());

  paintPanel();
}

export function refreshNotifications() { paintPanel(); }
