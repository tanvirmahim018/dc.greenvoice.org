import { safeEq, makeToken } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const real = process.env.ADMIN_PASSWORD;
  if (!real) return res.status(500).json({ error: 'ADMIN_PASSWORD_not_set' });

  const given = (req.body && req.body.password) || '';
  if (!safeEq(given, real)) {
    await new Promise((r) => setTimeout(r, 1000)); // slow down guessing
    return res.status(401).json({ error: 'wrong_password' });
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ token: makeToken() });
}
