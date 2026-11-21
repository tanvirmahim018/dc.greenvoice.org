import { put, head, list, del } from '@vercel/blob';
import { requireEditor } from './_lib.js';

const PATH = 'content.json';
const HIST = 'history/';
const KEEP = 15;
const REQUIRED = ['site', 'hero', 'ticker', 'event', 'notices', 'about', 'activities', 'steps', 'stats', 'committee'];

async function writeContent(content, by) {
  content._meta = { publishedAt: new Date().toISOString(), by };
  const json = JSON.stringify(content);
  if (json.length > 3_500_000) { const e = new Error('too_large'); e.code = 413; throw e; }
  await put(PATH, json, { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
  // keep a backup of every publish, newest KEEP only
  await put(`${HIST}${Date.now()}_${by}.json`, json, { access: 'public', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60 });
  const old = (await list({ prefix: HIST })).blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(KEEP);
  if (old.length) await del(old.map((b) => b.url));
}

const valid = (c) => c && typeof c === 'object' && !Array.isArray(c) && REQUIRED.every((k) => k in c);

export default async function handler(req, res) {
  // ---- Public read ----
  if (req.method === 'GET') {
    try {
      const meta = await head(PATH);
      const r = await fetch(meta.url + '?v=' + new Date(meta.uploadedAt).getTime());
      if (!r.ok) throw new Error('fetch_failed');
      res.setHeader('Cache-Control', 'public, s-maxage=15');
      return res.status(200).json(await r.json());
    } catch (e) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).json({ error: 'no_saved_content' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  res.setHeader('Cache-Control', 'no-store');
  const who = await requireEditor(req, res);
  if (!who) return;
  const b = req.body || {};

  try {
    // ---- Publish ----
    if (b.action === 'publish') {
      if (!valid(b.content)) return res.status(400).json({ error: 'bad_content' });
      await writeContent(b.content, who.u);
      return res.status(200).json({ ok: true, meta: b.content._meta });
    }

    // ---- List backups ----
    if (b.action === 'history') {
      const items = (await list({ prefix: HIST })).blobs
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .map((x) => ({ id: x.pathname, at: x.uploadedAt, by: ((/^history\/\d+_(.+)\.json$/.exec(x.pathname) || [])[1] || ''), size: x.size }));
      return res.status(200).json({ items });
    }

    // ---- Restore a backup (goes live immediately) ----
    if (b.action === 'restore') {
      const id = String(b.id || '');
      if (!id.startsWith(HIST)) return res.status(400).json({ error: 'bad_id' });
      const blob = (await list({ prefix: id })).blobs.find((x) => x.pathname === id);
      if (!blob) return res.status(404).json({ error: 'not_found' });
      const content = await (await fetch(blob.url, { cache: 'no-store' })).json();
      if (!valid(content)) return res.status(400).json({ error: 'bad_content' });
      await writeContent(content, who.u);
      return res.status(200).json({ ok: true, content });
    }
  } catch (e) {
    if (e && e.code === 413) return res.status(413).json({ error: 'too_large' });
    return res.status(500).json({ error: 'storage_error', detail: String((e && e.message) || e) });
  }
  return res.status(400).json({ error: 'unknown_action' });
}
