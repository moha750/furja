// Lists a YouTube channel's long-form videos (Videos tab), page by page.
// GET ?q=<channel url | @handle | UC id | any video url>  -> first page + channel info
// GET ?cursor=<token>                                     -> next page
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const CTX = { client: { clientName: 'WEB', clientVersion: '2.20250101.00.00', hl: 'en', gl: 'US' } };
const VIDEOS_TAB = 'EgZ2aWRlb3PyBgQKAjoA';

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

async function yti(path: string, body: Record<string, unknown>) {
  let last = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(`https://www.youtube.com/youtubei/v1/${path}?prettyPrint=false`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': UA, 'X-Youtube-Client-Name': '1', 'X-Youtube-Client-Version': CTX.client.clientVersion, 'Origin': 'https://www.youtube.com' },
      body: JSON.stringify({ context: CTX, ...body }),
      signal: AbortSignal.timeout(12000),
    });
    if (r.ok) return r.json();
    last = 'yt_' + r.status;
    await new Promise((res) => setTimeout(res, 600 * (attempt + 1)));
  }
  throw new Error(last);
}

const txt = (o: any): string => o?.simpleText ?? (o?.runs ? o.runs.map((x: any) => x.text).join('') : '') ?? '';
const DUR = /^\d+(:\d+){1,2}$/;
const AGO = /(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i;
function toSec(s: string): number | null {
  if (!s || !DUR.test(s.trim())) return null;
  return s.trim().split(':').reduce((a, x) => a * 60 + parseInt(x, 10), 0);
}
function agoToIso(s: string): string | null {
  const m = AGO.exec(s || '');
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const unit: Record<string, number> = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2592000, year: 31536000 };
  return new Date(Date.now() - n * unit[m[2].toLowerCase()] * 1000).toISOString();
}
function strings(node: any, out: string[] = [], depth = 0): string[] {
  if (!node || depth > 14) return out;
  if (typeof node === 'string') { if (node.length < 60) out.push(node.trim()); return out; }
  if (typeof node !== 'object') return out;
  if (Array.isArray(node)) { for (const x of node) strings(x, out, depth + 1); return out; }
  for (const k in node) {
    if (k === 'rendererContext' || k === 'menuButton' || k === 'loggingDirectives') continue;
    strings(node[k], out, depth + 1);
  }
  return out;
}
const LIVE = /^(LIVE|Upcoming|UPCOMING|Premiere|PREMIERE|Members only)$/;

function collect(node: any, out: { videos: any[]; token: string | null }) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const x of node) collect(x, out); return; }
  if (node.videoRenderer?.videoId) {
    const v = node.videoRenderer;
    const s = strings(v);
    if (s.some((x) => LIVE.test(x)) || v.upcomingEventData) return;
    out.videos.push({ id: v.videoId, title: txt(v.title), duration: toSec(txt(v.lengthText) || s.find((x) => DUR.test(x)) || ''), published_at: agoToIso(txt(v.publishedTimeText)) });
    return;
  }
  if (node.lockupViewModel?.contentId && node.lockupViewModel.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
    const l = node.lockupViewModel;
    const title = l.metadata?.lockupMetadataViewModel?.title?.content || '';
    const s = strings(l.contentImage).concat(strings(l.metadata?.lockupMetadataViewModel?.metadata));
    if (s.some((x) => LIVE.test(x))) return;
    out.videos.push({
      id: l.contentId, title,
      duration: toSec(s.find((x) => DUR.test(x)) || ''),
      published_at: agoToIso(s.find((x) => AGO.test(x)) || ''),
    });
    return;
  }
  if (node.continuationCommand?.token && !out.token) out.token = node.continuationCommand.token;
  for (const k in node) collect(node[k], out);
}

async function resolveChannel(q: string): Promise<string | null> {
  q = q.trim();
  const uc = /(UC[A-Za-z0-9_-]{22})/.exec(q);
  if (uc) return uc[1];
  const vid = /(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/.exec(q);
  let url = q;
  if (vid) {
    const o = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + vid[1])}`, { headers: { 'User-Agent': UA } });
    if (!o.ok) return null;
    url = (await o.json()).author_url;
  } else if (/^@\S+$/.test(q)) {
    url = 'https://www.youtube.com/' + q;
  } else if (!/^https?:\/\//.test(q)) {
    url = 'https://' + q.replace(/^\/+/, '');
  }
  url = url.replace('://m.youtube.com', '://www.youtube.com').replace('://youtube.com', '://www.youtube.com');
  const r = await yti('navigation/resolve_url', { url });
  return r?.endpoint?.browseEndpoint?.browseId || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const sp = new URL(req.url).searchParams;
  try {
    const cursor = sp.get('cursor');
    if (cursor) {
      if (cursor.length > 10000) return json({ ok: false, error: 'bad_cursor' }, 400);
      const r = await yti('browse', { continuation: cursor });
      const out = { videos: [] as any[], token: null as string | null };
      collect(r.onResponseReceivedActions || r, out);
      return json({ ok: true, videos: out.videos, next: out.token });
    }
    const q = (sp.get('q') || '').slice(0, 300);
    if (!q) return json({ ok: false, error: 'bad_input' }, 400);
    const id = await resolveChannel(q);
    if (!id || !id.startsWith('UC')) return json({ ok: false, error: 'channel_not_found' });
    const r = await yti('browse', { browseId: id, params: VIDEOS_TAB });
    const md = r.metadata?.channelMetadataRenderer || {};
    const thumbs = md.avatar?.thumbnails || [];
    const tabs = r.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const sel = tabs.find((t: any) => t.tabRenderer?.selected)?.tabRenderer;
    const out = { videos: [] as any[], token: null as string | null };
    collect(sel?.content || [], out);
    return json({
      ok: true,
      channel: { id, title: md.title || '', url: md.vanityChannelUrl || `https://www.youtube.com/channel/${id}`, avatar: thumbs.length ? thumbs[thumbs.length - 1].url : null },
      videos: out.videos,
      next: out.token,
    });
  } catch (e) {
    return json({ ok: false, error: 'network', detail: String(e).slice(0, 200) }, 502);
  }
});
