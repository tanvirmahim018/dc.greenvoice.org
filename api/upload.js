import crypto from 'node:crypto';
import { put } from '@vercel/blob';
import { readToken } from './_lib.js';

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!readToken(req)) return res.status(401).json({ error: 'unauthorized' });

  const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec((req.body && req.body.dataUrl) || '');
  if (!m) return res.status(400).json({ error: 'bad_image' });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 3_000_000) return res.status(413).json({ error: 'image_too_large' });

  const name = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 20);
  try {
    const blob = await put(`img/${name}.${EXT[m[1]]}`, buf, {
      access: 'public', contentType: m[1], addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 31536000,
    });
    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: 'storage_error', detail: String((e && e.message) || e) });
  }
}
