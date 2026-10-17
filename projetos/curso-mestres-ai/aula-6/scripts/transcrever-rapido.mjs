// Transcrição rápida pra decupagem: tempo por frase (sem DTW palavra a palavra) e todos os núcleos.
// Uso: node scripts/transcrever-rapido.mjs <entrada.wav> <saida.json>
// Pra legenda palavra a palavra do trecho escolhido, usar o transcrever.mjs.
import path from "path";
import fs from "fs";
import os from "os";
import { transcribe } from "@remotion/install-whisper-cpp";

const entrada = path.resolve(process.argv[2]);
const saida = path.resolve(process.argv[3]);
const to = process.env.WHISPER_DIR ?? path.join(process.cwd(), "whisper.cpp");

const out = await transcribe({
  model: process.env.WHISPER_MODEL ?? "small",
  whisperPath: to,
  whisperCppVersion: "1.5.5",
  inputPath: entrada,
  tokenLevelTimestamps: false,
  language: "pt",
  additionalArgs: ["-t", String(Math.max(4, os.cpus().length)), "-bs", "1", "-bo", "1"],
});

const frases = out.transcription.map((t) => ({
  de: t.offsets.from / 1000,
  ate: t.offsets.to / 1000,
  texto: t.text.trim(),
}));
fs.writeFileSync(saida, JSON.stringify(frases, null, 2));
console.log(`${frases.length} frases -> ${saida}`);
