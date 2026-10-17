// Separa o bruto em takes pela energia do áudio e transcreve cada take com o Whisper local.
// Saída: scripts/<nome>-takes.json ([{id, inicio, fim, texto}]) e a lista no terminal.
// Uso: node scripts/takes.mjs public/midia/<nome>-16k.wav [limiarDb=-40] [gapMax=1.3]
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from "@remotion/install-whisper-cpp";

const [, , wavArq, limArg = "-40", gapArg = "1.3"] = process.argv;
const lim = +limArg, gapMax = +gapArg;
const nome = path.basename(wavArq).replace(/-16k\.wav$/, "");
const WHISPER = process.env.WHISPER_DIR ?? "C:/Users/tamar/TK FILMES/projetos/curso-mestres-ai/remotion/whisper.cpp";
const cache = "scripts/cache"; fs.mkdirSync(cache, { recursive: true });

// energia por janela de 50 ms
const buf = fs.readFileSync(wavArq);
let off = 12; while (buf.toString("ascii", off, off + 4) !== "data") off += 8 + buf.readUInt32LE(off + 4);
const d = off + 8, sr = 16000, n = (buf.length - d) / 2, w = sr * 0.05;
const segs = []; let cur = null;
for (let i = 0; i + w < n; i += w) {
  let s = 0; for (let k = 0; k < w; k++) { const v = buf.readInt16LE(d + (i + k) * 2) / 32768; s += v * v; }
  const db = 10 * Math.log10(s / w + 1e-12), t = i / sr;
  if (db > lim) { if (cur && t - cur.b <= 0.25) cur.b = t + 0.05; else { if (cur) segs.push(cur); cur = { a: t, b: t + 0.05 }; } }
}
if (cur) segs.push(cur);
// agrupa em takes
const takes = [];
for (const s of segs.filter((s) => s.b - s.a >= 0.15)) {
  const u = takes[takes.length - 1];
  if (u && s.a - u.fim <= gapMax) u.fim = s.b; else takes.push({ inicio: s.a, fim: s.b });
}
await installWhisperCpp({ to: WHISPER, version: "1.5.5" });
await downloadWhisperModel({ model: "medium", folder: WHISPER });
const ff = (args) => execFileSync("npx", ["remotion", "ffmpeg", "-y", "-v", "error", ...args], { shell: true, stdio: "inherit" });
const saida = [];
for (const [i, t] of takes.entries()) {
  const id = `T${String(i + 1).padStart(2, "0")}`;
  const a = Math.max(0, t.inicio - 0.15), b = t.fim + 0.25;
  const clip = path.resolve(cache, `${nome}-${id}.wav`);
  ff(["-i", `"${path.resolve(wavArq)}"`, "-ss", a.toFixed(2), "-to", b.toFixed(2), "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", `"${clip}"`]);
  const out = await transcribe({ model: "medium", whisperPath: WHISPER, whisperCppVersion: "1.5.5", inputPath: clip, tokenLevelTimestamps: false, language: "pt" });
  const texto = toCaptions({ whisperCppOutput: out }).captions.map((c) => c.text).join("").replace(/\s+/g, " ").trim();
  saida.push({ id, inicio: +a.toFixed(2), fim: +b.toFixed(2), texto });
  console.log(`${id}  ${a.toFixed(2)}-${b.toFixed(2)}  (${(b - a).toFixed(1)}s)  ${texto}`);
}
fs.writeFileSync(`scripts/${nome}-takes.json`, JSON.stringify(saida, null, 2));
