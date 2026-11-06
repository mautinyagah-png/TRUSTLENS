/* =========================================================
   TRUSTLENS — Centralised LocalStorage layer
   ========================================================= */

import { uid, riskBand } from './utils.js';

export const KEYS = {
  settings: 'tl_settings',
  profile: 'tl_profile',
  history: 'tl_history',
  notifications: 'tl_notifications',
  theme: 'tl_theme',
  library: 'tl_library'
};

const MAX_CHECKS = 150;
const MAX_NOTIFICATIONS = 40;

const DEFAULT_SETTINGS = {
  defaultView: 'overview',
  confirmDelete: true,
  notifyAnalysis: true,
  notifySave: true,
  notifyStorage: true
};

const DEFAULT_PROFILE = { name: 'Guest Analyst', initials: '' };

const clone = (v) => JSON.parse(JSON.stringify(v));

function emit(name, detail) {
  try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch { /* noop */ }
}

export function isAvailable() {
  try {
    const k = '__tl_probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function readJSON(key, fallback) {
  if (!isAvailable()) return clone(fallback);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return clone(fallback);
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? clone(fallback) : parsed;
  } catch (err) {
    console.warn(`TRUSTLENS: could not read "${key}"`, err);
    return clone(fallback);
  }
}

function writeJSON(key, value) {
  if (!isAvailable()) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`TRUSTLENS: could not write "${key}"`, err);
    if (getSettings().notifyStorage) {
      addNotification('Browser storage is full. Export a backup and remove old records.', 'warning');
    }
    return false;
  }
}

/* ---------------- THEME (stored as a raw string) ---------------- */

export function getTheme() {
  try {
    const v = localStorage.getItem(KEYS.theme);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch { return 'system'; }
}

export function setTheme(theme) {
  try { localStorage.setItem(KEYS.theme, theme); } catch { /* noop */ }
  emit('tl:theme-changed', theme);
}

/* ---------------- SETTINGS ---------------- */

export function getSettings() {
  const stored = readJSON(KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...(typeof stored === 'object' && stored ? stored : {}) };
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  writeJSON(KEYS.settings, next);
  emit('tl:settings-changed', next);
  return next;
}

/* ---------------- PROFILE ---------------- */

export function getProfile() {
  const stored = readJSON(KEYS.profile, {});
  return { ...DEFAULT_PROFILE, ...(typeof stored === 'object' && stored ? stored : {}) };
}

export function saveProfile(patch) {
  const next = { ...getProfile(), ...patch };
  writeJSON(KEYS.profile, next);
  emit('tl:profile-changed', next);
  return next;
}

/* ---------------- HISTORY ---------------- */

function sanitizeRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const score = Number(raw.score);
  if (!Number.isFinite(score)) return null;
  if (raw.type !== 'message' && raw.type !== 'link') return null;
  const band = riskBand(score);
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : uid('inv'),
    type: raw.type,
    title: String(raw.title || 'Untitled investigation').slice(0, 140),
    input: String(raw.input || '').slice(0, 8000),
    score: Math.max(0, Math.min(100, Math.round(score))),
    riskKey: band.key,
    riskLabel: band.label,
    findings: Array.isArray(raw.findings) ? raw.findings.slice(0, 40) : [],
    recommendations: Array.isArray(raw.recommendations) ? raw.recommendations.slice(0, 20) : [],
    notes: String(raw.notes || '').slice(0, 4000),
    saved: Boolean(raw.saved),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString()
  };
}

export function getHistory() {
  const stored = readJSON(KEYS.history, []);
  if (!Array.isArray(stored)) return [];
  return stored.map(sanitizeRecord).filter(Boolean);
}

export function getSaved() {
  return getHistory().filter((r) => r.saved);
}

function prune(list) {
  if (list.length <= MAX_CHECKS) return list;
  const sorted = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  while (sorted.length > MAX_CHECKS) {
    const idx = sorted.findIndex((r) => !r.saved);
    sorted.splice(idx === -1 ? 0 : idx, 1);
  }
  return sorted;
}

function persistHistory(list, eventName = 'tl:history-changed') {
  writeJSON(KEYS.history, list);
  emit(eventName, list.length);
}

/** Logs every analysis so dashboard statistics stay honest. */
export function addCheck(record) {
  const list = getHistory();
  const entry = sanitizeRecord({
    ...record,
    id: record.id || uid('inv'),
    saved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  if (!entry) return null;
  list.push(entry);
  persistHistory(prune(list));
  return entry;
}

export function saveInvestigation(id) {
  const list = getHistory();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  list[idx].saved = true;
  list[idx].updatedAt = new Date().toISOString();
  persistHistory(list);
  return list[idx];
}

export function updateInvestigation(id, patch) {
  const list = getHistory();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  list[idx] = sanitizeRecord({
    ...list[idx],
    ...patch,
    id: list[idx].id,
    updatedAt: new Date().toISOString()
  });
  persistHistory(list);
  return list[idx];
}

export function getInvestigation(id) {
  return getHistory().find((r) => r.id === id) || null;
}

export function deleteInvestigation(id) {
  const list = getHistory();
  const next = list.filter((r) => r.id !== id);
  if (next.length === list.length) return false;
  persistHistory(next);
  return true;
}

export function clearHistory() {
  persistHistory([]);
  return true;
}

/* ---------------- NOTIFICATIONS ---------------- */

export function getNotifications() {
  const list = readJSON(KEYS.notifications, []);
  return Array.isArray(list) ? list.filter((n) => n && typeof n.message === 'string') : [];
}

export function addNotification(message, type = 'info') {
  const list = getNotifications();
  list.unshift({
    id: uid('ntf'),
    message: String(message).slice(0, 300),
    type,
    read: false,
    createdAt: new Date().toISOString()
  });
  writeJSON(KEYS.notifications, list.slice(0, MAX_NOTIFICATIONS));
  emit('tl:notifications-changed');
}

export function markNotificationRead(id) {
  const list = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  writeJSON(KEYS.notifications, list);
  emit('tl:notifications-changed');
}

export function markAllNotificationsRead() {
  const list = getNotifications().map((n) => ({ ...n, read: true }));
  writeJSON(KEYS.notifications, list);
  emit('tl:notifications-changed');
}

export function clearNotifications() {
  writeJSON(KEYS.notifications, []);
  emit('tl:notifications-changed');
}

export function unreadCount() {
  return getNotifications().filter((n) => !n.read).length;
}

/* ---------------- BACKUP / RESTORE ---------------- */

export function exportAll() {
  return {
    app: 'TRUSTLENS',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      settings: getSettings(),
      profile: getProfile(),
      history: getHistory(),
      notifications: getNotifications(),
      theme: getTheme()
    }
  };
}

/**
 * Merges a backup into current storage.
 * Existing records are NEVER overwritten — only new IDs are appended.
 */
export function importAll(payload) {
  const result = { ok: false, added: 0, skipped: 0, error: '' };

  if (!payload || typeof payload !== 'object') {
    result.error = 'The file is not a valid TRUSTLENS backup.';
    return result;
  }
  if (payload.app !== 'TRUSTLENS' || typeof payload.data !== 'object' || payload.data === null) {
    result.error = 'The file is not a valid TRUSTLENS backup.';
    return result;
  }

  const incoming = Array.isArray(payload.data.history) ? payload.data.history : [];
  const current = getHistory();
  const existingIds = new Set(current.map((r) => r.id));
  const fingerprint = new Set(current.map((r) => `${r.type}|${r.createdAt}|${r.score}`));

  const merged = [...current];
  incoming.forEach((raw) => {
    const record = sanitizeRecord(raw);
    if (!record) { result.skipped += 1; return; }
    const fp = `${record.type}|${record.createdAt}|${record.score}`;
    if (existingIds.has(record.id) || fingerprint.has(fp)) { result.skipped += 1; return; }
    merged.push(record);
    existingIds.add(record.id);
    fingerprint.add(fp);
    result.added += 1;
  });

  persistHistory(merged, 'tl:history-changed');

  if (payload.data.settings && typeof payload.data.settings === 'object') {
    saveSettings({ ...DEFAULT_SETTINGS, ...payload.data.settings });
  }
  if (payload.data.profile && typeof payload.data.profile === 'object') {
    saveProfile({ ...DEFAULT_PROFILE, ...payload.data.profile });
  }
  if (payload.data.theme) setTheme(payload.data.theme);

  result.ok = true;
  return result;
}

export function clearAll() {
  Object.values(KEYS).forEach((key) => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  });
  emit('tl:history-changed', 0);
  emit('tl:notifications-changed');
  emit('tl:settings-changed', getSettings());
  emit('tl:profile-changed', getProfile());
}

/* ---------------- STORAGE METRICS ---------------- */

export function storageBytes() {
  if (!isAvailable()) return 0;
  let total = 0;
  Object.values(KEYS).forEach((key) => {
    try {
      const v = localStorage.getItem(key);
      if (v) total += v.length + key.length;
    } catch { /* noop */ }
  });
  return total;
}

export function storageSummary() {
  const bytes = storageBytes();
  const kb = bytes / 1024;
  return {
    bytes,
    label: kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`,
    percent: Math.min(100, (bytes / (5 * 1024 * 1024)) * 100),
    records: getHistory().length,
    saved: getSaved().length,
    notifications: getNotifications().length
  };
}
