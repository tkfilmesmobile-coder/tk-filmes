// Transcreve um áudio WAV 16 kHz com Whisper (português) e grava as legendas no formato Caption.
// Uso: node scripts/transcrever.mjs <entrada.wav> <saida.json>
import path from "path";
import fs from "fs";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const [, , entrada, saida] = process.argv;
const to = path.join(process.cwd(), "whisper.cpp");
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
