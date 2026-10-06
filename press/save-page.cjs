'use strict';
// Saves a full copy of each entry's page into the shared archive folder
// (outside the repo; see press-archive/README.md) and sets the entry's
// `archive` field. Tries the live URL first, then the Wayback Machine.
// Usage: node press/save-page.cjs <archive-root> <index.json> [--skip id,id] [--only id,id]
// It saves page.html, text.txt, images.txt (image URLs only, not downloaded) and source.txt.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) press-archive';

function curl(url, timeout) {
  const tmp = path.join(require('os').tmpdir(), `press-${process.pid}-${Date.now()}.bin`);
  try {
    const code = execFileSync('curl', ['-s', '-L', '-m', String(timeout), '-A', UA, '-w', '%{http_code}', '-o', tmp, url], { encoding: 'utf8' }).trim();
    const body = fs.existsSync(tmp) ? fs.readFileSync(tmp) : Buffer.alloc(0);
    return { code: Number(code), body };
  } catch {
    return { code: 0, body: Buffer.alloc(0) };
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

const usable = (r) => r.code === 200 && r.body.length > 3000;

function waybackRaw(url) {
  // https://web.archive.org/web/<ts>/<orig> -> .../web/<ts>id_/<orig> (unmodified page); otherwise newest capture.
  const m = /^https?:\/\/web\.archive\.org\/web\/(\d{14})\/(.+)$/.exec(url);
  return m ? `https://web.archive.org/web/${m[1]}id_/${m[2]}` : `https://web.archive.org/web/2id_/${url}`;
}

function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, "'").replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8211;|&ndash;/g, '-').replace(/&#8212;|&mdash;/g, '--')
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim() + '\n';
}

function imageUrls(html, base) {
  const out = new Set();
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    try { out.add(new URL(m[1], base).href.replace(/^https?:\/\/web\.archive\.org\/web\/\d+(?:im_|id_)?\//, '')); } catch { /* skip */ }
  }
  return [...out];
}

function main(argv) {
  const [root, indexFile, ...rest] = argv;
  if (!root || !indexFile) {
    console.error('Usage: node press/save-page.cjs <archive-root> <index.json> [--skip ids] [--only ids]');
    process.exit(2);
  }
  const opt = (name) => { const i = rest.indexOf(name); return i === -1 ? null : rest[i + 1].split(','); };
  const skip = new Set(opt('--skip') || []);
  const only = opt('--only');
  const data = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  const list = data.entries || data.items;
  const results = [];

  for (const e of list) {
    if (skip.has(e.id) || (only && !only.includes(e.id))) continue;
    const target = e.url || e.archiveUrl;
    if (!target) { results.push([e.id, 'skipped: no url']); continue; }
    const dir = path.join(root, e.id);
    if (fs.existsSync(path.join(dir, 'page.html'))) { results.push([e.id, 'skipped: already saved']); continue; }

    let how = null;
    let r = { code: 0, body: Buffer.alloc(0) };
    let fetched = target;
    if (e.url) {
      r = curl(e.url, 40);
      if (usable(r)) how = 'live';
    }
    if (!how) {
      fetched = waybackRaw(e.archiveUrl || e.url);
      r = curl(fetched, 70);
      if (usable(r)) how = 'wayback';
    }
    if (!how) { results.push([e.id, `FAILED (last status ${r.code})`]); continue; }

    fs.mkdirSync(dir, { recursive: true });
    const html = r.body.toString('utf8');
    fs.writeFileSync(path.join(dir, 'page.html'), r.body);
    fs.writeFileSync(path.join(dir, 'text.txt'), toText(html));
    fs.writeFileSync(path.join(dir, 'images.txt'), imageUrls(html, e.url || e.archiveUrl).join('\n') + '\n');
    fs.writeFileSync(path.join(dir, 'source.txt'), [
      `entry: ${e.id}`,
      `original url: ${e.url || '(unknown; reproduced on the page below)'}`,
      `fetched from: ${fetched} (${how})`,
      `accessed: ${new Date().toISOString().slice(0, 10)}`,
      'images.txt lists image URLs only; none were downloaded.',
    ].join('\n') + '\n');
    e.archive = e.id;
    results.push([e.id, `saved via ${how} (${r.body.length} bytes)`]);
  }

  fs.writeFileSync(indexFile, JSON.stringify(data, null, 2) + '\n');
  for (const [id, msg] of results) console.log(`${id}: ${msg}`);
}

main(process.argv.slice(2));
