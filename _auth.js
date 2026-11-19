import crypto from 'node:crypto';

const secret = () => process.env.ADMIN_PASSWORD || '';
const sign = (payload) =>
  crypto.createHmac('sha256', 'gv:' + secret()).update(payload).digest('base64url');

const hash = (s) => crypto.createHash('sha256').update(String(s)).digest();

export function safeEq(a, b) {
  return crypto.timingSafeEqual(hash(a), hash(b));
}

// Token = "<expiry-ms>.<hmac>", valid for 12 hours.
// It is signed with the admin password, so changing the password logs everyone out.
export function makeToken() {
  const exp = String(Date.now() + 12 * 3600 * 1000);
  return exp + '.' + sign(exp);
}

export function authed(req) {
  if (!secret()) return false;
  const h = req.headers.authorization || '';
  const t = h.replace(/^Bearer\s+/i, '');
  const [exp, sig] = t.split('.');
  if (!exp || !sig) return false;
  if (!safeEq(sig, sign(exp))) return false;
  return Number(exp) > Date.now();
}
