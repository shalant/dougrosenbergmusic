// Length of an .m4a (MP4 audio) file in seconds, read from its own header, so a
// track's duration never has to be typed into tracks.js and cannot drift from the
// file. Reads the movie header ("mvhd") inside "moov". Returns null if the file is
// not a readable MP4 (a missing or damaged file just shows no length).
function boxes(buf, start, end) {
  const out = [];
  let p = start;
  while (p + 8 <= end) {
    let size = buf.readUInt32BE(p);
    const type = buf.toString('latin1', p + 4, p + 8);
    let header = 8;
    if (size === 1 && p + 16 <= end) {
      size = Number(buf.readBigUInt64BE(p + 8));
      header = 16;
    } else if (size === 0) {
      size = end - p;
    }
    if (size < header || p + size > end) break;
    out.push({ type, body: p + header, end: p + size });
    p += size;
  }
  return out;
}

export function m4aDurationSeconds(buf) {
  try {
    const moov = boxes(buf, 0, buf.length).find((b) => b.type === 'moov');
    if (!moov) return null;
    const mvhd = boxes(buf, moov.body, moov.end).find((b) => b.type === 'mvhd');
    if (!mvhd) return null;
    const v = buf.readUInt8(mvhd.body);
    const timescale = v === 1 ? buf.readUInt32BE(mvhd.body + 20) : buf.readUInt32BE(mvhd.body + 12);
    const duration = v === 1 ? Number(buf.readBigUInt64BE(mvhd.body + 24)) : buf.readUInt32BE(mvhd.body + 16);
    return timescale > 0 ? duration / timescale : null;
  } catch {
    return null;
  }
}

export const formatDuration = (s) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '');
