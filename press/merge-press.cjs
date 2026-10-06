'use strict';
// Merges the press/review JSON files kept by separate sessions into one file.
// Usage: node press/merge-press.cjs --out press/press.json <a.json> <b.json> ...
// Inputs may use `entries` or `items` for the list, and may carry `albums`,
// `rejected` and `unfetchedLeads`. See SCHEMA.md for the shared fields.

const fs = require('fs');
const path = require('path');

const FIELD_ORDER = [
  'id', 'kind', 'about', 'band', 'album', 'title', 'outlet', 'author', 'date',
  'url', 'archiveUrl', 'archive', 'namesDoug', 'rating', 'pullQuotes',
  'verified', 'accessed', 'approved', 'notes', 'provenance', 'aliases', 'sources',
];

// Older field values that map onto the shared `kind` vocabulary.
const TYPE_TO_KIND = { 'album-review': 'review' };

function normalizeUrl(raw) {
  if (!raw) return null;
  let u;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = u.pathname.replace(/\/+$/, '');
  const params = [...u.searchParams.entries()]
    .filter(([k]) => !/^(utm_|fbclid$|gclid$)/i.test(k))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return host + pathname + (params ? `?${params}` : '');
}

function unique(list) {
  return [...new Set(list.filter((x) => x !== null && x !== undefined && x !== ''))];
}

function normalize(raw, source) {
  const e = { ...raw };
  if (e.type !== undefined) {
    if (e.kind === undefined) e.kind = TYPE_TO_KIND[e.type] || e.type;
    delete e.type;
  }
  if (e.publication !== undefined) {
    if (e.outlet === undefined) e.outlet = e.publication;
    delete e.publication;
  }
  const quotes = [];
  if (Array.isArray(e.pullQuotes)) quotes.push(...e.pullQuotes);
  if (typeof e.quote === 'string') quotes.push(e.quote);
  delete e.quote;
  e.pullQuotes = unique(quotes);
  if (!e.id) throw new Error(`Entry without an id in ${source}: ${JSON.stringify(raw).slice(0, 120)}`);
  e.verified = e.verified === true;
  e.approved = e.approved === true;
  e.sources = unique([...(e.sources || []), source]);
  return e;
}

function filled(e) {
  return Object.values(e).filter((v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)).length;
}

// The entry whose text was actually read wins; then the one with more fields; then the earlier input.
function pickWinner(a, b) {
  if (a.verified !== b.verified) return a.verified ? [a, b] : [b, a];
  if (filled(b) > filled(a)) return [b, a];
  return [a, b];
}

function mergeEntries(a, b) {
  const [win, lose] = pickWinner(a, b);
  const out = { ...lose };
  for (const [k, v] of Object.entries(win)) {
    if (v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)) out[k] = v;
  }
  out.pullQuotes = unique([...win.pullQuotes, ...lose.pullQuotes]);
  out.sources = unique([...win.sources, ...lose.sources]);
  out.aliases = unique([...(win.aliases || []), ...(lose.aliases || []), ...(lose.id !== win.id ? [lose.id] : [])]);
  if (out.aliases.length === 0) delete out.aliases;
  out.verified = a.verified || b.verified;
  out.approved = a.approved || b.approved;
  if (win.notes && lose.notes && win.notes !== lose.notes) out.notes = `${win.notes} | ${lose.notes}`;
  const accessed = [a.accessed, b.accessed].filter(Boolean).sort();
  if (accessed.length) out.accessed = accessed[accessed.length - 1];
  return out;
}

function ordered(e) {
  const out = {};
  for (const k of FIELD_ORDER) if (k in e) out[k] = e[k];
  for (const k of Object.keys(e).sort()) if (!(k in out)) out[k] = e[k];
  return out;
}

function mergeFiles(inputs) {
  // inputs: [{ name, data }]
  const entries = [];
  const warnings = [];
  const albums = new Map();
  const rejected = new Map();
  const leads = new Map();

  for (const { name, data } of inputs) {
    const list = [...(data.entries || []), ...(data.items || [])];
    for (const raw of list) {
      const e = normalize(raw, name);
      const key = normalizeUrl(e.url);
      const hit = entries.findIndex((x) => {
        const xk = normalizeUrl(x.url);
        return (key && xk && key === xk) || x.id === e.id || (x.aliases || []).includes(e.id);
      });
      if (hit === -1) {
        entries.push(e);
        continue;
      }
      const existing = entries[hit];
      const ek = normalizeUrl(existing.url);
      if (existing.id === e.id && key && ek && key !== ek) {
        warnings.push(`Same id "${e.id}" but different URLs: ${existing.url} vs ${e.url}`);
      }
      entries[hit] = mergeEntries(existing, e);
    }
    for (const a of data.albums || []) {
      albums.set(a.id, { ...(albums.get(a.id) || {}), ...a });
    }
    for (const r of data.rejected || []) {
      const k = normalizeUrl(r.url) || r.url;
      if (!rejected.has(k)) rejected.set(k, r);
    }
    for (const l of data.unfetchedLeads || []) {
      const k = normalizeUrl(l.url) || l.url;
      if (!leads.has(k)) leads.set(k, l);
    }
  }

  // A lead that has since become an entry or been rejected is resolved.
  const resolved = new Set([...entries.map((e) => normalizeUrl(e.url)), ...rejected.keys()].filter(Boolean));
  const openLeads = [...leads.entries()].filter(([k]) => !resolved.has(k)).map(([, l]) => l);

  entries.sort((a, b) => {
    const ad = a.date || '￿';
    const bd = b.date || '￿';
    return ad === bd ? a.id.localeCompare(b.id) : ad.localeCompare(bd);
  });

  return {
    _about: 'Merged press/review index. Generated by press/merge-press.cjs; edit the source files, not this one.',
    sources: inputs.map((i) => i.name),
    albums: [...albums.values()],
    entries: entries.map(ordered),
    rejected: [...rejected.values()],
    unfetchedLeads: openLeads,
    warnings,
  };
}

function main(argv) {
  const files = [];
  let out = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') out = argv[++i];
    else files.push(argv[i]);
  }
  if (files.length === 0) {
    console.error('Usage: node press/merge-press.cjs [--out merged.json] <a.json> <b.json> ...');
    process.exit(2);
  }
  const inputs = files.map((f) => ({ name: path.basename(f), data: JSON.parse(fs.readFileSync(f, 'utf8')) }));
  const merged = mergeFiles(inputs);
  const text = JSON.stringify(merged, null, 2) + '\n';
  if (out) fs.writeFileSync(out, text);
  else process.stdout.write(text);
  console.error(`${merged.entries.length} entries, ${merged.rejected.length} rejected, ${merged.unfetchedLeads.length} open leads, ${merged.warnings.length} warnings`);
  for (const w of merged.warnings) console.error(`WARNING: ${w}`);
}

module.exports = { normalizeUrl, normalize, mergeEntries, mergeFiles };

if (require.main === module) main(process.argv.slice(2));
