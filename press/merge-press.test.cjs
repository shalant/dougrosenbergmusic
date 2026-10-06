'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeUrl, mergeFiles } = require('./merge-press.cjs');

test('normalizeUrl ignores scheme, www, trailing slash, hash and tracking params', () => {
  const a = normalizeUrl('http://www.AllAboutJazz.com/x-review/?utm_source=a#top');
  const b = normalizeUrl('https://allaboutjazz.com/x-review');
  assert.equal(a, b);
});

test('normalizeUrl keeps meaningful query params and returns null for junk', () => {
  assert.notEqual(normalizeUrl('https://x.com/c?oid=1'), normalizeUrl('https://x.com/c?oid=2'));
  assert.equal(normalizeUrl(null), null);
  assert.equal(normalizeUrl('not a url'), null);
});

test('maps the older field names (type/publication/quote) onto the shared schema', () => {
  const merged = mergeFiles([
    { name: 'a.json', data: { items: [{ id: 'x', type: 'album-review', publication: 'AAJ', url: 'https://a.com/x', pullQuotes: ['q1'] }] } },
    { name: 'b.json', data: { entries: [{ id: 'y', kind: 'review', outlet: 'DB', quote: 'q2', url: 'https://b.com/y' }] } },
  ]);
  const x = merged.entries.find((e) => e.id === 'x');
  const y = merged.entries.find((e) => e.id === 'y');
  assert.equal(x.kind, 'review');
  assert.equal(x.outlet, 'AAJ');
  assert.deepEqual(y.pullQuotes, ['q2']);
  assert.equal('quote' in y, false);
});

test('de-duplicates by URL, prefers the verified entry, unions quotes and sources', () => {
  const merged = mergeFiles([
    { name: 'a.json', data: { entries: [{ id: 'aaj-a', kind: 'review', url: 'https://www.aaj.com/r/', author: null, pullQuotes: ['one'], verified: false }] } },
    { name: 'b.json', data: { items: [{ id: 'aaj-b', type: 'review', url: 'https://aaj.com/r', author: 'Kopman', pullQuotes: ['two'], verified: true, accessed: '2026-10-04' }] } },
  ]);
  assert.equal(merged.entries.length, 1);
  const e = merged.entries[0];
  assert.equal(e.id, 'aaj-b');
  assert.deepEqual(e.aliases, ['aaj-a']);
  assert.equal(e.author, 'Kopman');
  assert.equal(e.verified, true);
  assert.deepEqual(e.pullQuotes.sort(), ['one', 'two']);
  assert.deepEqual(e.sources.sort(), ['a.json', 'b.json']);
});

test('fills a null field on the winner from the loser', () => {
  const merged = mergeFiles([
    { name: 'a.json', data: { entries: [{ id: 'a', url: 'https://a.com/p', verified: true, author: null, about: 'person' }] } },
    { name: 'b.json', data: { entries: [{ id: 'b', url: 'https://a.com/p', verified: false, author: 'Reich', about: null }] } },
  ]);
  const e = merged.entries[0];
  assert.equal(e.id, 'a');
  assert.equal(e.author, 'Reich');
  assert.equal(e.about, 'person');
});

test('entries with no URL stay separate unless their ids match', () => {
  const merged = mergeFiles([
    { name: 'a.json', data: { entries: [{ id: 'one' }, { id: 'two' }] } },
    { name: 'b.json', data: { entries: [{ id: 'two', notes: 'later' }] } },
  ]);
  assert.equal(merged.entries.length, 2);
});

test('same id with different URLs merges but raises a warning', () => {
  const merged = mergeFiles([
    { name: 'a.json', data: { entries: [{ id: 'same', url: 'https://a.com/1' }] } },
    { name: 'b.json', data: { entries: [{ id: 'same', url: 'https://a.com/2' }] } },
  ]);
  assert.equal(merged.entries.length, 1);
  assert.equal(merged.warnings.length, 1);
});

test('rejected leads are unioned; leads that became entries or were rejected are dropped', () => {
  const merged = mergeFiles([
    { name: 'a.json', data: { entries: [{ id: 'e', url: 'https://a.com/e' }], rejected: [{ url: 'https://r.com/1', reason: 'collision' }], unfetchedLeads: [{ url: 'https://a.com/e' }, { url: 'https://r.com/1' }, { url: 'https://open.com/' }] } },
    { name: 'b.json', data: { rejected: [{ url: 'http://www.r.com/1/', reason: 'dup' }, { url: 'https://r.com/2', reason: 'other' }] } },
  ]);
  assert.equal(merged.rejected.length, 2);
  assert.deepEqual(merged.unfetchedLeads.map((l) => l.url), ['https://open.com/']);
});

test('an entry without an id is an error', () => {
  assert.throws(() => mergeFiles([{ name: 'a.json', data: { entries: [{ url: 'https://a.com' }] } }]), /without an id/);
});

test('verified and approved are OR-ed, and the later accessed date is kept', () => {
  const merged = mergeFiles([
    { name: 'a.json', data: { entries: [{ id: 'a', url: 'https://a.com/p', approved: true, accessed: '2026-10-04' }] } },
    { name: 'b.json', data: { entries: [{ id: 'b', url: 'https://a.com/p', verified: true, accessed: '2026-10-05' }] } },
  ]);
  const e = merged.entries[0];
  assert.equal(e.approved, true);
  assert.equal(e.verified, true);
  assert.equal(e.accessed, '2026-10-05');
});

test('entries sort by date, with undated last', () => {
  const merged = mergeFiles([
    { name: 'a.json', data: { entries: [{ id: 'late', date: '2015-09-16' }, { id: 'none' }, { id: 'early', date: '2004-04-02' }] } },
  ]);
  assert.deepEqual(merged.entries.map((e) => e.id), ['early', 'late', 'none']);
});
