// Transcreve um WAV 16 kHz com Whisper.cpp local (português) e grava no formato Caption.
// Uso: node scripts/transcrever.mjs <entrada.wav> <saida.json>
// WHISPER_DIR aponta pra uma instalação já existente do whisper.cpp (evita baixar o modelo de novo).
import path from "path";
import fs from "fs";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const entrada = path.resolve(process.argv[2]);
const saida = path.resolve(process.argv[3]);
const to = process.env.WHISPER_DIR ?? path.join(process.cwd(), "whisper.cpp");
const version = "1.5.5";
const model = "medium";

await installWhisperCpp({ to, version });
await downloadWhisperModel({ model, folder: to });

const whisperCppOutput = await transcribe({
  model,
  whisperPath: to,
  whisperCppVersion: version,
  inputPath: entrada,
  tokenLevelTimestamps: true,
  language: "pt",
});

const { captions } = toCaptions({ whisperCppOutput });
fs.writeFileSync(saida, JSON.stringify(captions, null, 2));
console.log(`${captions.length} palavras -> ${saida}`);
