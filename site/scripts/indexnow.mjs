// Tells IndexNow-participating search engines (Bing, Yandex, Seznam, Naver)
// that dougrosenberg.com's URLs changed, so they recrawl without waiting.
// Google does not use IndexNow; it relies on the sitemap and Search Console.
//
// Run by hand AFTER a deploy is live (the key file must already be served):
//   npm run build && npm run indexnow            # submit
//   npm run indexnow -- --dry-run                # print the payload only
//
// The key is not a secret: IndexNow requires it to be publicly served at
// KEY_LOCATION so the engine can confirm the submitter controls the host.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const HOST = 'dougrosenberg.com';
export const KEY = 'd9dfce984872d86601855f63a4980a65';
export const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
// Bing's own endpoint, not api.indexnow.org: from Doug's machine api.indexnow.org
// resets the TLS connection (ECONNRESET) for Node's fetch, and for curl on 2026-10-16.
// IndexNow engines share submissions, so this reaches the same participants.
export const ENDPOINT = 'https://www.bing.com/indexnow';

// Only URLs on HOST are accepted by IndexNow; anything else is dropped here
// rather than letting the whole submission 422.
export function buildPayload(urls) {
  const urlList = [...new Set(urls)].filter((u) => new URL(u).hostname === HOST);
  if (urlList.length === 0) throw new Error(`No URLs on ${HOST} to submit.`);
  return { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };
}

export function urlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const xml = readFileSync(new URL('../dist/sitemap-0.xml', import.meta.url), 'utf8');
  const payload = buildPayload(urlsFromSitemap(xml));
  console.log(JSON.stringify(payload, null, 2));
  if (dryRun) return;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  // 200 = accepted, 202 = accepted and key validation pending. Anything else
  // (403 key mismatch, 422 bad URLs, 429 too many) is a real failure.
  console.log(`IndexNow responded ${res.status} ${res.statusText}`);
  if (res.status !== 200 && res.status !== 202) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
