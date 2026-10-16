// Returns public metadata for one YouTube video id (title, channel, duration, avatar, embeddable).
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

async function getText(url: string, ms = 7000): Promise<string | null> {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'ar,en;q=0.8', 'Cookie': 'CONSENT=YES+1; SOCS=CAI' },
      signal: AbortSignal.timeout(ms),
    });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return json({ ok: false, error: 'bad_id' }, 400);

  const watch = `https://www.youtube.com/watch?v=${id}`;
  const o = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`, {
    headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(7000),
  }).catch(() => null);

  if (!o) return json({ ok: false, error: 'network' }, 502);
  if (o.status === 401 || o.status === 403) return json({ ok: false, error: 'not_embeddable' });
  if (!o.ok) return json({ ok: false, error: 'not_found' });
  const meta = await o.json();

  const [page, chan] = await Promise.all([
    getText(watch),
    meta.author_url ? getText(meta.author_url) : Promise.resolve(null),
  ]);

  let duration: number | null = null;
  const m = page?.match(/"lengthSeconds":"(\d+)"/);
  if (m) duration = parseInt(m[1], 10);
  const isLive = !!page && /"isLiveContent":true/.test(page) && /"isLive":true/.test(page);

  let avatar: string | null = null;
  const a = chan?.match(/<meta property="og:image" content="([^"]+)"/);
  if (a) avatar = a[1].replace(/&amp;/g, '&');

  return json({
    ok: true,
    id,
    title: meta.title ?? '',
    channel: meta.author_name ?? '',
    channel_url: meta.author_url ?? '',
    channel_avatar: avatar,
    duration_seconds: duration,
    is_live: isLive,
  });
});
