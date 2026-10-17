// Gera os efeitos sonoros da edição, sintetizados aqui (sem download e sem serviço pago).
// Uso: node scripts/gerar-sfx.mjs  ->  public/sfx/*.wav  (48 kHz, mono, 16 bits)
// impacto: batida grave pra headline · subida: ar que cresce até a batida · sopro: entrada de elemento
// estouro: "pop" de card · brilho: cintilar de destaque · toque: clique curto de interface
import fs from "fs";

const SR = 48000;

// Ruído com semente fixa: o som sai igual em toda geração.
const criaRuido = (semente) => () => {
  semente = (semente * 16807) % 2147483647;
  return (semente / 2147483647) * 2 - 1;
};

// Passa-banda biquad (RBJ) com frequência variável por amostra.
const passaBanda = (n, fonte, fc, q) => {
  const saida = new Float32Array(n);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const w = (2 * Math.PI * fc(i / SR)) / SR;
    const alpha = Math.sin(w) / (2 * q);
    const x = fonte();
    const y = (alpha * x - alpha * x2 + 2 * Math.cos(w) * y1 - (1 - alpha) * y2) / (1 + alpha);
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    saida[i] = y;
  }
  return saida;
};

const grava = (nome, amostras, pico = 0.85) => {
  const n = amostras.length;
  const max = amostras.reduce((m, v) => Math.max(m, Math.abs(v)), 1e-9);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, (amostras[i] / max) * pico)) * 32767), 44 + i * 2);
  }
  fs.mkdirSync("public/sfx", { recursive: true });
  fs.writeFileSync(`public/sfx/${nome}.wav`, buf);
  console.log(`public/sfx/${nome}.wav`, (n / SR).toFixed(2), "s");
};

// impacto: grave que desce de 120 Hz pra 46 Hz, com um estalo de ataque e um corpo curto de ruído
{
  const n = Math.round(SR * 0.6);
  const a = new Float32Array(n);
  const corpo = passaBanda(n, criaRuido(11), () => 180, 0.7);
  const ruido = criaRuido(3);
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 46 + 74 * Math.exp(-t / 0.045);
    fase += (2 * Math.PI * f) / SR;
    const grave = Math.tanh(1.6 * Math.sin(fase)) * Math.exp(-t / 0.16);
    const estalo = ruido() * Math.exp(-t / 0.004) * 0.5;
    a[i] = grave + estalo + corpo[i] * Math.exp(-t / 0.05) * 0.8;
  }
  grava("impacto", a);
}

// subida: ruído filtrado que sobe de 300 Hz a 6 kHz e cresce, cortando seco no fim
{
  const n = Math.round(SR * 0.42);
  const dur = n / SR;
  const r = passaBanda(n, criaRuido(7), (t) => 300 * Math.pow(20, t / dur), 1.4);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const fim = Math.min(1, (dur - t) / 0.012);
    a[i] = r[i] * Math.pow(t / dur, 2.2) * fim;
  }
  grava("subida", a, 0.7);
}

// sopro: passagem de ar curta (sobe e desce), pra entrada e saída de elemento
{
  const n = Math.round(SR * 0.38);
  const dur = n / SR;
  const r = passaBanda(n, criaRuido(5), (t) => 500 + 3200 * Math.sin((Math.PI * t) / dur), 0.9);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    a[i] = r[i] * Math.sin((Math.PI * i) / n) ** 2;
  }
  grava("sopro", a, 0.7);
}

// estouro: "pop" arredondado, seno que sobe rápido e some
{
  const n = Math.round(SR * 0.09);
  const a = new Float32Array(n);
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    fase += (2 * Math.PI * (520 + 900 * Math.min(1, t / 0.03))) / SR;
    a[i] = Math.sin(fase) * Math.min(1, t / 0.002) * Math.exp(-t / 0.022);
  }
  grava("estouro", a, 0.8);
}

// brilho: quatro notas agudas em cascata, com decaimento longo
{
  const n = Math.round(SR * 0.8);
  const a = new Float32Array(n);
  [2093, 2637, 3136, 4186].forEach((f, k) => {
    const ini = k * 0.035;
    for (let i = 0; i < n; i++) {
      const t = i / SR - ini;
      if (t < 0) continue;
      a[i] += Math.sin(2 * Math.PI * f * t) * Math.min(1, t / 0.003) * Math.exp(-t / 0.2) * (1 - k * 0.15);
    }
  });
  grava("brilho", a, 0.6);
}

// toque: clique curto e seco de interface
{
  const n = Math.round(SR * 0.04);
  const r = passaBanda(n, criaRuido(9), () => 3200, 2);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    a[i] = r[i] * Math.exp(-(i / SR) / 0.006);
  }
  grava("toque", a, 0.8);
}
