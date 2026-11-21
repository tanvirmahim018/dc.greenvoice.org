import { OWNER, safeEq, makeToken, readToken, hashPw, checkPw, loadUsers, saveUsers, pause } from './_lib.js';

const UNAME = /^[a-z0-9_.]{3,24}$/;
const bad = (res, code, error) => res.status(code).json({ error });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return bad(res, 405, 'method_not_allowed');
  const b = req.body || {};
  const action = b.action;

  // ---------------- LOGIN ----------------
  if (action === 'login') {
    const username = String(b.username || '').trim().toLowerCase();
    const password = String(b.password || '');
    const real = process.env.ADMIN_PASSWORD;
    if (!real) return bad(res, 500, 'ADMIN_PASSWORD_not_set');

    // Owner (main admin): username from ADMIN_USERNAME (default "admin") + ADMIN_PASSWORD
    if (username === OWNER()) {
      if (safeEq(password, real)) return res.status(200).json({ token: makeToken(OWNER(), 'owner', 'Admin'), role: 'owner', name: 'Admin', username: OWNER() });
      await pause(1000);
      return bad(res, 401, 'wrong_password');
    }

    let users;
    try { users = await loadUsers(); } catch (e) { return bad(res, 500, 'storage_error'); }
    const u = users[username];
    if (!u || !checkPw(password, u.hash)) { await pause(1000); return bad(res, 401, 'wrong_password'); }
    if (u.status === 'pending') return bad(res, 403, 'pending');
    if (u.status !== 'approved') return bad(res, 403, 'blocked');
    return res.status(200).json({ token: makeToken(u.username, 'editor', u.name), role: 'editor', name: u.name, username: u.username });
  }

  // ---------------- REGISTER ----------------
  if (action === 'register') {
    if (b.website) return res.status(200).json({ ok: true }); // honeypot: bots fill hidden fields
    const username = String(b.username || '').trim().toLowerCase();
    const name = String(b.name || '').trim().slice(0, 40);
    const password = String(b.password || '');
    if (!UNAME.test(username)) return bad(res, 400, 'bad_username');
    if (username === OWNER() || username === 'admin' || username === 'owner') return bad(res, 400, 'username_taken');
    if (password.length < 8 || password.length > 64) return bad(res, 400, 'bad_password');
    if (!name) return bad(res, 400, 'bad_name');

    let users;
    try { users = await loadUsers(); } catch (e) { return bad(res, 500, 'storage_error'); }
    if (users[username]) return bad(res, 409, 'username_taken');
    const all = Object.values(users);
    if (all.length >= 200 || all.filter((x) => x.status === 'pending').length >= 50) return bad(res, 429, 'too_many_requests');

    users[username] = { username, name, hash: hashPw(password), status: 'pending', createdAt: new Date().toISOString() };
    try { await saveUsers(users); } catch (e) { return bad(res, 500, 'storage_error'); }
    return res.status(200).json({ ok: true, status: 'pending' });
  }

  // ---------------- WHO AM I (also re-checks approval) ----------------
  if (action === 'me') {
    const t = readToken(req);
    if (!t) return bad(res, 401, 'unauthorized');
    if (t.r === 'editor') {
      try {
        const u = (await loadUsers())[t.u];
        if (!u || u.status !== 'approved') return bad(res, 401, 'unauthorized');
      } catch (e) { return bad(res, 500, 'storage_error'); }
    }
    return res.status(200).json({ username: t.u, role: t.r, name: t.n });
  }

  // ---------------- CHANGE OWN PASSWORD (editors) ----------------
  if (action === 'password') {
    const t = readToken(req);
    if (!t) return bad(res, 401, 'unauthorized');
    if (t.r === 'owner') return bad(res, 400, 'owner_password_in_vercel');
    const next = String(b.next || '');
    if (next.length < 8 || next.length > 64) return bad(res, 400, 'bad_password');
    try {
      const users = await loadUsers();
      const u = users[t.u];
      if (!u || u.status !== 'approved') return bad(res, 401, 'unauthorized');
      if (!checkPw(String(b.current || ''), u.hash)) { await pause(800); return bad(res, 403, 'wrong_password'); }
      u.hash = hashPw(next);
      await saveUsers(users);
    } catch (e) { return bad(res, 500, 'storage_error'); }
    return res.status(200).json({ ok: true });
  }

  return bad(res, 400, 'unknown_action');
}
