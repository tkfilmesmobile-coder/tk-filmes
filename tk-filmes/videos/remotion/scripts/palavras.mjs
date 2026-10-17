// Tempo de cada palavra falada, preciso: corta o áudio por trecho de fala (energia) e transcreve cada trecho
// com o Whisper local com timestamps por token; o tempo absoluto = início do trecho + tempo no trecho.
// Uso: node scripts/palavras.mjs public/midia/<nome>-16k.wav  -> scripts/<nome>-palavras.json
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from "@remotion/install-whisper-cpp";

const wavArq = path.resolve(process.argv[2]);
const nome = path.basename(wavArq).replace(/-16k\.wav$/, "");
const WHISPER = process.env.WHISPER_DIR ?? "C:/Users/tamar/TK FILMES/projetos/curso-mestres-ai/remotion/whisper.cpp";
const cache = path.resolve("scripts/cache"); fs.mkdirSync(cache, { recursive: true });

const buf = fs.readFileSync(wavArq);
let off = 12; while (buf.toString("ascii", off, off + 4) !== "data") off += 8 + buf.readUInt32LE(off + 4);
const d = off + 8, sr = 16000, n = (buf.length - d) / 2, w = sr * 0.05;
const segs = []; let cur = null;
for (let i = 0; i + w < n; i += w) {
  let s = 0; for (let k = 0; k < w; k++) { const v = buf.readInt16LE(d + (i + k) * 2) / 32768; s += v * v; }
  const db = 10 * Math.log10(s / w + 1e-12), t = i / sr;
  if (db > -40) { if (cur && t - cur.b <= 0.6) cur.b = t + 0.05; else { if (cur) segs.push(cur); cur = { a: t, b: t + 0.05 }; } }
}
if (cur) segs.push(cur);
const trechos = segs.filter((s) => s.b - s.a >= 0.2).map((s) => ({ a: Math.max(0, s.a - 0.12), b: s.b + 0.2 }));

await installWhisperCpp({ to: WHISPER, version: "1.5.5" });
await downloadWhisperModel({ model: "medium", folder: WHISPER });
const ff = (args) => execFileSync("npx", ["remotion", "ffmpeg", "-y", "-v", "error", ...args], { shell: true, stdio: "inherit" });

const palavras = [];
for (const [i, t] of trechos.entries()) {
  const clip = path.join(cache, `${nome}-p${String(i).padStart(2, "0")}.wav`);
  ff(["-i", `"${wavArq}"`, "-ss", t.a.toFixed(2), "-to", t.b.toFixed(2), "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", `"${clip}"`]);
  const out = await transcribe({ model: "medium", whisperPath: WHISPER, whisperCppVersion: "1.5.5", inputPath: clip, tokenLevelTimestamps: true, language: "pt" });
  const { captions } = toCaptions({ whisperCppOutput: out });
  // junta tokens em palavras
  const ws = [];
  for (const c of captions) {
    if (!c.text.startsWith(" ") && ws.length) { ws[ws.length - 1].text += c.text; ws[ws.length - 1].fim = c.endMs / 1000; }
    else ws.push({ text: c.text.trim(), ini: c.startMs / 1000, fim: c.endMs / 1000 });
  }
  for (const p of ws) if (p.text) palavras.push({ texto: p.text, ini: +(t.a + p.ini).toFixed(2), fim: +(t.a + p.fim).toFixed(2) });
  console.log(`trecho ${i} ${t.a.toFixed(2)}-${t.b.toFixed(2)}: ${ws.map((p) => p.text).join(" ")}`);
}
fs.writeFileSync(`scripts/${nome}-palavras.json`, JSON.stringify(palavras, null, 1));
console.log(palavras.map((p) => `${p.ini}:${p.texto}`).join(" "));
