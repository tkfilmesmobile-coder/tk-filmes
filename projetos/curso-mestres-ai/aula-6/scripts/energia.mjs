// Imprime a energia (dBFS) do WAV 16 kHz mono em janelas de 50 ms, num intervalo em segundos.
// Uso: node scripts/energia.mjs <wav> <inicio> <fim>
import fs from "fs";
const [, , arq, a, b] = process.argv;
const buf = fs.readFileSync(arq);
let off = 12;
while (buf.toString("ascii", off, off + 4) !== "data") off += 8 + buf.readUInt32LE(off + 4);
const dados = off + 8, sr = 16000, win = sr * 0.05;
for (let t = +a; t < +b; t += 0.05) {
  let s = 0;
  const i0 = dados + Math.floor(t * sr) * 2;
  for (let k = 0; k < win; k++) { const v = buf.readInt16LE(i0 + k * 2) / 32768; s += v * v; }
  const db = 10 * Math.log10(s / win + 1e-12);
  console.log(t.toFixed(2), db.toFixed(0).padStart(4), "#".repeat(Math.max(0, Math.round((db + 60) / 2))));
}
