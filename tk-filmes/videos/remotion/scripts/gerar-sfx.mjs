// Efeitos sonoros da TK, sintetizados aqui (sem download, sem banco pago), todos curtos e discretos:
//   vidro.wav  · entrada de cartão: sopro curto + toque surdo de vidro
//   tique.wav  · entrada de linha de texto: clique macio
//   check.wav  · chip com check: tique + duas notas subindo, bem curtas
//   sopro.wav  · aproximação de câmera: sopro grave descendo
//   sino.wav   · fechamento: sino quente, decaimento longo
// Uso: node scripts/gerar-sfx.mjs  -> public/sfx/*.wav
import fs from "fs";

const sr = 48000;
let semente = 11;
const ruido = () => ((semente = (semente * 16807) % 2147483647) / 2147483647) * 2 - 1;

// passa-banda RBJ com frequência variável
const bandpass = (fcDe, q) => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, fc) => {
    const w = (2 * Math.PI * fc) / sr, alpha = Math.sin(w) / (2 * q), a0 = 1 + alpha;
    const y = (alpha * x - alpha * x2 + 2 * Math.cos(w) * y1 - (1 - alpha) * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};
const seno = (f, t) => Math.sin(2 * Math.PI * f * t);
const grava = (nome, a) => {
  const pico = a.reduce((m, v) => Math.max(m, Math.abs(v)), 1e-6);
  const n = a.length, buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, (a[i] / pico) * 0.8)) * 32767), 44 + i * 2);
  fs.mkdirSync("public/sfx", { recursive: true });
  fs.writeFileSync(`public/sfx/${nome}.wav`, buf);
  console.log(`public/sfx/${nome}.wav  ${(n / sr).toFixed(2)}s`);
};
const novo = (dur) => new Float32Array(Math.round(sr * dur));

// vidro: sopro 0-0.22s (filtro subindo) + toque surdo (seno 190 Hz com decaimento) + tique de vidro (2.4 kHz, bem curto)
{
  const a = novo(0.5), bp = bandpass(300, 1.1);
  for (let i = 0; i < a.length; i++) {
    const t = i / sr;
    const env = t < 0.22 ? Math.sin((Math.PI * t) / 0.22) ** 2 : 0;
    a[i] += bp(ruido(), 300 + 2200 * Math.min(1, t / 0.22)) * env * 0.5;
    const tt = t - 0.16;
    if (tt >= 0) {
      a[i] += Math.exp(-tt / 0.12) * 0.55 * seno(190, tt);
      a[i] += Math.exp(-tt / 0.03) * 0.18 * seno(2400, tt);
    }
  }
  grava("vidro", a);
}
// tique: clique macio (ruído 6 ms filtrado) + seno 1.6 kHz 25 ms
{
  const a = novo(0.12), bp = bandpass(1500, 2);
  for (let i = 0; i < a.length; i++) {
    const t = i / sr;
    a[i] += bp(ruido(), 1800) * (t < 0.006 ? 1 : Math.exp(-(t - 0.006) / 0.01)) * 0.5;
    a[i] += Math.exp(-t / 0.025) * 0.35 * seno(1600, t);
  }
  grava("tique", a);
}
// check: tique + duas notas curtas subindo (1046 → 1568 Hz)
{
  const a = novo(0.3);
  for (let i = 0; i < a.length; i++) {
    const t = i / sr;
    a[i] += Math.exp(-t / 0.02) * 0.3 * seno(1700, t);
    if (t >= 0.03) a[i] += Math.exp(-(t - 0.03) / 0.07) * 0.3 * seno(1046, t - 0.03);
    if (t >= 0.1) a[i] += Math.exp(-(t - 0.1) / 0.11) * 0.3 * (seno(1568, t - 0.1) + 0.3 * seno(3136, t - 0.1));
  }
  grava("check", a);
}
// negativo: duas notas descendo (880 → 587 Hz), timbre surdo, decaimento curto: "caiu"
{
  const a = novo(0.36);
  for (let i = 0; i < a.length; i++) {
    const t = i / sr;
    if (t < 0.16) a[i] += Math.exp(-t / 0.08) * 0.5 * (seno(880, t) + 0.25 * seno(440, t));
    if (t >= 0.11) a[i] += Math.exp(-(t - 0.11) / 0.14) * 0.5 * (seno(587, t - 0.11) + 0.3 * seno(293, t - 0.11));
  }
  grava("negativo", a);
}
// positivo: duas notas subindo (784 → 1175 Hz), claro, com brilho: "subiu"
{
  const a = novo(0.34);
  for (let i = 0; i < a.length; i++) {
    const t = i / sr;
    if (t < 0.14) a[i] += Math.exp(-t / 0.07) * 0.45 * (seno(784, t) + 0.2 * seno(1568, t));
    if (t >= 0.09) a[i] += Math.exp(-(t - 0.09) / 0.13) * 0.5 * (seno(1175, t - 0.09) + 0.3 * seno(2350, t - 0.09));
  }
  grava("positivo", a);
}
// impacto: sopro curto subindo + batida grave (60 Hz) com decaimento: "oxe!"
{
  const a = novo(0.6), bp = bandpass(400, 0.9);
  for (let i = 0; i < a.length; i++) {
    const t = i / sr;
    const env = t < 0.12 ? Math.sin((Math.PI * t) / 0.12) ** 2 : 0;
    a[i] += bp(ruido(), 300 + 3000 * Math.min(1, t / 0.12)) * env * 0.35;
    const tt = t - 0.1;
    if (tt >= 0) a[i] += Math.exp(-tt / 0.22) * 0.9 * seno(62 + 40 * Math.exp(-tt / 0.05), tt) + Math.exp(-tt / 0.04) * 0.25 * seno(900, tt);
  }
  grava("impacto", a);
}
// sopro: ruído grave com filtro descendo (900 → 120 Hz), 0.3 s
{
  const a = novo(0.32), bp = bandpass(900, 0.8);
  for (let i = 0; i < a.length; i++) {
    const t = i / sr, p = t / 0.32;
    a[i] += bp(ruido(), 900 - 780 * p) * Math.sin(Math.PI * p) ** 1.5 * 0.6;
  }
  grava("sopro", a);
}
// sino: duas parciais quentes (660 + 990 Hz) com decaimento longo e um leve tremolo
{
  const a = novo(1.4);
  for (let i = 0; i < a.length; i++) {
    const t = i / sr;
    const env = Math.min(1, t / 0.006) * Math.exp(-t / 0.45) * (1 + 0.08 * Math.sin(2 * Math.PI * 5 * t));
    a[i] += env * (0.5 * seno(660, t) + 0.3 * seno(990, t) + 0.1 * seno(1980, t));
  }
  grava("sino", a);
}
// brilho: arpejo rápido subindo (4 notas, 1,3 → 3,1 kHz) com harmônicos: "✨" do título
{
  const a = novo(0.7);
  const notas = [1318, 1760, 2349, 3136];
  for (let i = 0; i < a.length; i++) {
    const t = i / sr;
    notas.forEach((f, k) => { const tt = t - k * 0.055; if (tt >= 0) a[i] += Math.exp(-tt / 0.18) * 0.28 * (seno(f, tt) + 0.35 * seno(f * 2, tt)); });
  }
  grava("brilho", a);
}
