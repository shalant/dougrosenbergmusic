// Quotes shown in the home page's Press timeline (PressTimeline.astro) and on
// the /press and /easternblok pages. Every entry must be approved in
// press/press.json, and `text` must be an exact excerpt of one of that entry's
// pullQuotes (a leading or trailing "…" marks a cut). press-timeline.test.js
// enforces both, so a quote can't be reworded or shown before Doug approves it.
//
// `highlight` is the part of the quote that names Doug; it renders in brass.
// `url: null` means the review has no live page (DownBeat is print only;
// jazzreview.com is gone and no Wayback copy has been found yet).

/** @typedef {{ id: string, year: number, text: string, highlight?: string, outlet: string, author?: string, url: string | null, detail?: string }} PressQuote */

/** @type {PressQuote[]} */
export const easternBlokQuotes = [
  {
    id: 'aaj-goran-ivanovic-group-2006',
    year: 2006,
    text: 'The energy that pours out of the speakers will literally bowl you over before you know what happened.',
    outlet: 'All About Jazz',
    author: 'Budd Kopman',
    url: 'https://www.allaboutjazz.com/goran-ivanovic-group-goran-ivanovic-balkan-song-records-review-by-budd-kopman',
    detail: 'Goran Ivanovic Group',
  },
  {
    id: 'downbeat-goran-ivanovic-2006-06',
    year: 2006,
    text: '…saxophonist Doug Rosenberg serves well as his instrumental foil.',
    highlight: 'Doug Rosenberg',
    outlet: 'DownBeat',
    author: 'Mitch Myers',
    url: null,
    detail: 'print, June 2006',
  },
  {
    id: 'chireader-world-music-fest-2007-09',
    year: 2007,
    text: '…an impressive mastery of the disparate genres that inform Ivanovic’s tunes',
    outlet: 'Chicago Reader',
    url: 'https://chicagoreader.com/arts-culture/the-readers-guide-to-the-world-music-festival/',
  },
  {
    id: 'minor7th-folk-tales-2007-10',
    year: 2007,
    text: 'The band sounds spontaneous and live on this well-balanced recording.',
    outlet: 'Minor 7th',
    url: 'https://www.minor7th.com/m7_10_07.html',
    detail: 'Folk Tales',
  },
  {
    id: 'aaj-folk-tales-2008',
    year: 2008,
    text: 'Rosenberg plays either unison with Ivanovic or flies over it all, seemingly free yet always in touch.',
    highlight: 'Rosenberg',
    outlet: 'All About Jazz',
    author: 'Budd Kopman',
    url: 'https://www.allaboutjazz.com/folk-tales-eastern-blok-self-produced-review-by-budd-kopman',
    detail: 'Folk Tales',
  },
];

/** @type {PressQuote[]} */
export const leaderQuotes = [
  {
    id: 'jazzreview-moses-velvet-lounge-2004-04',
    year: 2004,
    text: '…refreshing directness and humble confidence',
    outlet: 'jazzreview.com',
    author: 'Mark Keresman',
    url: null,
    detail: 'Bob Moses & Doug Rosenberg, Velvet Lounge',
  },
];

/** Splits a quote into plain and highlighted parts for rendering. */
export function quoteParts(quote) {
  if (!quote.highlight) return [{ text: quote.text, highlight: false }];
  const at = quote.text.indexOf(quote.highlight);
  if (at === -1) return [{ text: quote.text, highlight: false }];
  return [
    { text: quote.text.slice(0, at), highlight: false },
    { text: quote.highlight, highlight: true },
    { text: quote.text.slice(at + quote.highlight.length), highlight: false },
  ].filter((part) => part.text);
}
