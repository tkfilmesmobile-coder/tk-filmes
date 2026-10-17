// Lista os trechos com fala (energia > limiar) num WAV 16 kHz mono.
// Uso: node scripts/segmentos.mjs <wav> [inicio] [fim] [limiarDb]
import fs from "fs";
const [, , arq, a = "0", b = "9999", lim = "-38"] = process.argv;
const buf = fs.readFileSync(arq);
let off = 12;
while (buf.toString("ascii", off, off + 4) !== "data") off += 8 + buf.readUInt32LE(off + 4);
const d = off + 8, sr = 16000, n = (buf.length - d) / 2, w = sr * 0.05;
const segs = [];
let cur = null;
for (let i = 0; i + w < n; i += w) {
  let s = 0;
  for (let k = 0; k < w; k++) { const v = buf.readInt16LE(d + (i + k) * 2) / 32768; s += v * v; }
  const db = 10 * Math.log10(s / w + 1e-12), t = i / sr;
  if (t < +a || t > +b) continue;
  if (db > +lim) {
    if (cur && t - cur.b <= 0.25) cur.b = t + 0.05;
    else { if (cur) segs.push(cur); cur = { a: t, b: t + 0.05 }; }
  }
}
if (cur) segs.push(cur);
for (const s of segs.filter((s) => s.b - s.a >= 0.15)) console.log(s.a.toFixed(2), "-", s.b.toFixed(2));
