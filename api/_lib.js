// Shared helpers: tokens, password hashing, and the (private) user store.
import crypto from 'node:crypto';
import { put, list, del } from '@vercel/blob';

// ---------- owner ----------
export const OWNER = () => (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const secret = () => process.env.ADMIN_PASSWORD || '';

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
export const safeEq = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

// ---------- tokens (signed, 8 hours) ----------
const sign = (p) => crypto.createHmac('sha256', 'gv2:' + secret()).update(p).digest('base64url');

export function makeToken(u, r, name) {
  const p = Buffer.from(JSON.stringify({ u, r, n: name || u, exp: Date.now() + 8 * 3600 * 1000 })).toString('base64url');
  return p + '.' + sign(p);
}

// Returns { u, r, n } or null
export function readToken(req) {
  if (!secret()) return null;
  const t = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const [p, s] = t.split('.');
  if (!p || !s || !safeEq(s, sign(p))) return null;
  try {
    const d = JSON.parse(Buffer.from(p, 'base64url').toString());
    return d && d.exp > Date.now() && (d.r === 'owner' || d.r === 'editor') ? d : null;
  } catch { return null; }
}

// ---------- passwords ----------
export function hashPw(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(pw, salt, 32).toString('hex');
}
export function checkPw(pw, stored) {
  try {
    const [salt, h] = String(stored).split(':');
    const a = crypto.scryptSync(pw, salt, 32), b = Buffer.from(h, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
}

// ---------- user store ----------
// Stored as an unguessable file name, so the password hashes are never at a public, predictable URL.
const UP = 'private/users-';

export async function loadUsers() {
  const { blobs } = await list({ prefix: UP });
  if (!blobs.length) return {};
  blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  const r = await fetch(blobs[0].url, { cache: 'no-store' });
  if (!r.ok) throw new Error('users_fetch_failed');
  const j = await r.json();
  return (j && j.users) || {};
}

export async function saveUsers(users) {
  const old = (await list({ prefix: UP })).blobs;
  await put(UP + crypto.randomBytes(24).toString('hex') + '.json', JSON.stringify({ users }), {
    access: 'public', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60,
  });
  if (old.length) await del(old.map((b) => b.url));
}

// Owner passes without touching storage. Editors must still be "approved" in the store.
export async function requireEditor(req, res) {
  const t = readToken(req);
  if (!t) { res.status(401).json({ error: 'unauthorized' }); return null; }
  if (t.r === 'owner') return t;
  try {
    const u = (await loadUsers())[t.u];
    if (u && u.status === 'approved') return t;
  } catch (e) { res.status(500).json({ error: 'storage_error' }); return null; }
  res.status(401).json({ error: 'unauthorized' });
  return null;
}

export function requireOwner(req, res) {
  const t = readToken(req);
  if (!t || t.r !== 'owner') { res.status(401).json({ error: 'unauthorized' }); return null; }
  return t;
}

export const pause = (ms) => new Promise((r) => setTimeout(r, ms));
