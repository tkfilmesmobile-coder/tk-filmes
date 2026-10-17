// Acha os cortes (troca de plano) de um vídeo: reduz cada quadro pra 32x18 (BMP), compara com o anterior.
// Uso: node scripts/cortes.mjs public/midia/<video>.mp4 <fps> -> imprime os frames dos cortes
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
const [src, fpsArg] = process.argv.slice(2);
const fps = Number(fpsArg ?? 24);
const ff = "node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe";
const dir = path.resolve("scripts/cache/cortes"); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
execFileSync(ff, ["-v", "error", "-y", "-i", src, "-vf", "scale=32:18", "-c:v", "rawvideo", "-pix_fmt", "rgb24", "-f", "image2", path.join(dir, "%05d.raw")]);
const arqs = fs.readdirSync(dir).sort();
const pix = (a) => fs.readFileSync(path.join(dir, a));
let prev = pix(arqs[0]); const diffs = [];
for (let f = 1; f < arqs.length; f++) {
  const cur = pix(arqs[f]); let s = 0; const n = Math.min(cur.length, prev.length);
  for (let i = 0; i < n; i++) s += Math.abs(cur[i] - prev[i]);
  diffs.push(s / n); prev = cur;
}
const cortes = [];
diffs.forEach((d, i) => { if (d > 14 && (!cortes.length || i + 1 - cortes[cortes.length - 1].frame > 6)) cortes.push({ frame: i + 1, t: +((i + 1) / fps).toFixed(2), d: +d.toFixed(1) }); });
console.log(`${arqs.length} quadros; ${cortes.length} cortes`);
console.log(cortes.map((c) => `${c.frame} (${c.t}s, dif ${c.d})`).join("\n"));
console.log("maiores difs:", diffs.map((d, i) => [d, i + 1]).sort((a, b) => b[0] - a[0]).slice(0, 12).map(([d, f]) => `${f}:${d.toFixed(1)}`).join(" "));
fs.rmSync(dir, { recursive: true, force: true });
