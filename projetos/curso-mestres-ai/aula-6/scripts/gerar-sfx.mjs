// Gera o efeito sonoro de entrada das inserções, sintetizado aqui (sem download, sem serviço pago):
// um whoosh curto (ruído filtrado que sobe e desce) + um "pling" suave no fim.
// Uso: node scripts/gerar-sfx.mjs  ->  public/sfx/entrada.wav
import fs from "fs";

const sr = 48000;
const dur = 0.55;
const n = Math.round(sr * dur);
const amostras = new Float32Array(n);

// Ruído com semente fixa: o som sai igual em toda geração.
let semente = 7;
const ruido = () => {
  semente = (semente * 16807) % 2147483647;
  return (semente / 2147483647) * 2 - 1;
};

// Whoosh: ruído passado por um passa-banda cuja frequência sobe, com envelope em sino.
// Passa-banda biquad (RBJ), com coeficientes recalculados a cada amostra.
let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
for (let i = 0; i < n; i++) {
  const t = i / sr;
  const prog = Math.min(1, t / 0.32);
  const fc = 400 + 2600 * prog; // varredura do filtro
  const q = 0.9;
  const w = (2 * Math.PI * fc) / sr;
  const alpha = Math.sin(w) / (2 * q);
  const a0 = 1 + alpha;
  const x = ruido();
  const y = (alpha * x - alpha * x2 + 2 * Math.cos(w) * y1 - (1 - alpha) * y2) / a0;
  x2 = x1;
  x1 = x;
  y2 = y1;
  y1 = y;
  const env = t < 0.32 ? Math.sin((Math.PI * t) / 0.32) ** 2 : 0;
  amostras[i] += y * env * 0.55;
}

// Pling: seno com um harmônico, ataque rápido e decaimento curto, entrando no pico do whoosh.
const inicio = 0.2;
for (let i = 0; i < n; i++) {
  const t = i / sr - inicio;
  if (t < 0) continue;
  const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.09);
  amostras[i] +=
    env * (0.32 * Math.sin(2 * Math.PI * 1320 * t) + 0.12 * Math.sin(2 * Math.PI * 2640 * t));
}

// Normaliza com folga e grava WAV PCM 16-bit mono.
const pico = amostras.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
const buf = Buffer.alloc(44 + n * 2);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + n * 2, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(sr, 24);
buf.writeUInt32LE(sr * 2, 28);
buf.writeUInt16LE(2, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) {
  const v = Math.max(-1, Math.min(1, (amostras[i] / pico) * 0.8));
  buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
}
fs.mkdirSync("public/sfx", { recursive: true });
fs.writeFileSync("public/sfx/entrada.wav", buf);
console.log("public/sfx/entrada.wav", dur, "s");
