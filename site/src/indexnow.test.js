import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { HOST, KEY, KEY_LOCATION, buildPayload, urlsFromSitemap } from '../scripts/indexnow.mjs';

test('the served key file contains exactly the key the script submits', () => {
  const path = new URL(`../public/${KEY}.txt`, import.meta.url);
  assert.ok(existsSync(path), 'public/<key>.txt must exist or IndexNow rejects the submission');
  assert.equal(readFileSync(path, 'utf8').trim(), KEY);
  assert.equal(KEY_LOCATION, `https://${HOST}/${KEY}.txt`);
});

test('buildPayload dedupes and drops URLs on other hosts', () => {
  const payload = buildPayload([
    'https://dougrosenberg.com/',
    'https://dougrosenberg.com/',
    'https://dougrosenbergdev.com/',
  ]);
  assert.deepEqual(payload.urlList, ['https://dougrosenberg.com/']);
  assert.equal(payload.host, HOST);
  assert.equal(payload.key, KEY);
});

test('buildPayload throws when nothing is on the host', () => {
  assert.throws(() => buildPayload(['https://example.com/']), /No URLs/);
});

test('urlsFromSitemap reads <loc> entries', () => {
  const xml = '<urlset><url><loc>https://dougrosenberg.com/</loc></url></urlset>';
  assert.deepEqual(urlsFromSitemap(xml), ['https://dougrosenberg.com/']);
});
