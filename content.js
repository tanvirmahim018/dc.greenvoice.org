import { put, head } from '@vercel/blob';
import { authed } from './_auth.js';

const PATH = 'content.json';
const REQUIRED = ['site', 'hero', 'ticker', 'event', 'notices', 'about', 'activities', 'steps', 'stats', 'committee'];

export default async function handler(req, res) {
  // ---- Public: read the saved content ----
  if (req.method === 'GET') {
    try {
      const meta = await head(PATH);
      const r = await fetch(meta.url + '?v=' + new Date(meta.uploadedAt).getTime());
      if (!r.ok) throw new Error('fetch_failed');
      const data = await r.json();
      // Short CDN cache so edits show up within ~15 seconds without hitting storage on every visit.
      res.setHeader('Cache-Control', 'public, s-maxage=15');
      return res.status(200).json(data);
    } catch (e) {
      // Nothing saved yet (or storage not connected): the page falls back to its built-in content.
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).json({ error: 'no_saved_content' });
    }
  }

  // ---- Admin only: save new content ----
  if (req.method === 'POST') {
    if (!authed(req)) return res.status(401).json({ error: 'unauthorized' });

    const body = req.body;
    if (!body || typeof body !== 'object' || REQUIRED.some((k) => !(k in body))) {
      return res.status(400).json({ error: 'bad_content' });
    }
    const json = JSON.stringify(body);
    if (json.length > 3_500_000) return res.status(413).json({ error: 'too_large' });

    try {
      await put(PATH, json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'storage_error', detail: String(e && e.message || e) });
    }
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}
