import { requireOwner, loadUsers, saveUsers, hashPw } from './_lib.js';

const clean = (u) => ({ username: u.username, name: u.name, status: u.status, createdAt: u.createdAt, approvedAt: u.approvedAt || null });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireOwner(req, res)) return;

  let users;
  try { users = await loadUsers(); } catch (e) { return res.status(500).json({ error: 'storage_error' }); }

  if (req.method === 'GET') {
    const list = Object.values(users).map(clean).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return res.status(200).json({ users: list, pending: list.filter((u) => u.status === 'pending').length });
  }

  if (req.method === 'POST') {
    const { action, username } = req.body || {};
    const u = users[String(username || '').toLowerCase()];
    if (!u) return res.status(404).json({ error: 'not_found' });

    if (action === 'approve') { u.status = 'approved'; u.approvedAt = new Date().toISOString(); }
    else if (action === 'block') { u.status = 'blocked'; }
    else if (action === 'delete') { delete users[u.username]; }
    else if (action === 'resetpw') {
      const pw = String((req.body || {}).password || '');
      if (pw.length < 8 || pw.length > 64) return res.status(400).json({ error: 'bad_password' });
      u.hash = hashPw(pw);
    } else return res.status(400).json({ error: 'unknown_action' });

    try { await saveUsers(users); } catch (e) { return res.status(500).json({ error: 'storage_error' }); }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}
