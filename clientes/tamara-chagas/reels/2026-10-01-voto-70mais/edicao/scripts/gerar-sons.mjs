// Sintetiza a trilha e os 5 efeitos da edição (sem download, sem direito autoral de terceiros).
// Uso: node scripts/gerar-sons.mjs  ->  public/sfx/*.wav e public/sfx/trilha.wav
import fs from "fs";

const SR = 48000;
let semente = 11;
const ruido = () => { semente = (semente * 16807) % 2147483647; return (semente / 2147483647) * 2 - 1; };

function gravar(nome, a, alvo = 0.8) {
  const pico = a.reduce((m, v) => Math.max(m, Math.abs(v)), 1e-9);
  const n = a.length, buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, (a[i] / pico) * alvo)) * 32767), 44 + i * 2);
  fs.mkdirSync("public/sfx", { recursive: true });
  fs.writeFileSync(`public/sfx/${nome}.wav`, buf);
  console.log(nome, (n / SR).toFixed(2), "s");
}

// passa-baixa de 1 polo (suaviza)
const passaBaixa = (a, fc) => { const k = 1 - Math.exp((-2 * Math.PI * fc) / SR); let y = 0; return a.map((x) => (y += k * (x - y))); };
// passa-banda com frequência variável (biquad RBJ)
function bandaVariavel(n, fcDe, fcAte, q, env) {
  const out = new Float32Array(n); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n, fc = fcDe * Math.pow(fcAte / fcDe, p), w = (2 * Math.PI * fc) / SR, al = Math.sin(w) / (2 * q), a0 = 1 + al;
    const x = ruido(), y = (al * x - al * x2 + 2 * Math.cos(w) * y1 - (1 - al) * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y; out[i] = y * env(i / SR);
  }
  return out;
}

// soft hit: corpo grave curto + estalo de ruído abafado
{ const d = 0.32, n = Math.round(SR * d), a = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR, f = 70 + 60 * Math.exp(-t / 0.03); a[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.09); }
  const r = passaBaixa(Array.from({ length: n }, (_, i) => ruido() * Math.exp(-(i / SR) / 0.02)), 1800);
  for (let i = 0; i < n; i++) a[i] += 0.35 * r[i];
  gravar("soft-hit", a, 0.7); }

// air whoosh: ar filtrado que sobe e desce
{ const d = 0.45, n = Math.round(SR * d);
  gravar("air-whoosh", bandaVariavel(n, 500, 3200, 0.8, (t) => Math.sin(Math.PI * Math.min(1, t / d)) ** 2), 0.6); }

// low impact: grave profundo com cauda
{ const d = 0.9, n = Math.round(SR * d), a = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR, f = 42 + 40 * Math.exp(-t / 0.06); a[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.28) + 0.25 * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-t / 0.1); }
  gravar("low-impact", a, 0.75); }

// tonal tick: nota curta e limpa
{ const d = 0.35, n = Math.round(SR * d), a = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR, e = Math.min(1, t / 0.003) * Math.exp(-t / 0.08); a[i] = e * (Math.sin(2 * Math.PI * 1318.5 * t) + 0.3 * Math.sin(2 * Math.PI * 2637 * t)); }
  gravar("tonal-tick", a, 0.55); }

// confirmation tick: dois toques metálicos (parcial inarmônico)
{ const d = 0.5, n = Math.round(SR * d), a = new Float32Array(n);
  for (const [ini, f] of [[0, 1568], [0.07, 2093]]) for (let i = 0; i < n; i++) {
    const t = i / SR - ini; if (t < 0) continue; const e = Math.min(1, t / 0.002) * Math.exp(-t / 0.11);
    a[i] += e * (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) + 0.15 * Math.sin(2 * Math.PI * f * 5.4 * t)); }
  gravar("confirm-tick", a, 0.55); }

// trilha: eletrônica minimalista, 100 BPM, sem vocal (pad + bumbo suave + chimbal + pluck discreto)
{ const bpm = 100, beat = 60 / bpm, d = 26, n = Math.round(SR * d), a = new Float32Array(n);
  const nota = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const acordes = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 67]]; // Am7 Fmaj7 C G
  const compasso = beat * 4;
  for (let i = 0; i < n; i++) {
    const t = i / SR, ac = acordes[Math.floor(t / (compasso * 2)) % 4], tc = t % (compasso * 2);
    const envPad = Math.min(1, tc / 0.8) * Math.min(1, (compasso * 2 - tc) / 0.6);
    let pad = 0; for (const m of ac) { const f = nota(m); pad += Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 1.003 * t); }
    a[i] += 0.05 * pad * envPad;
    const tb = t % beat, nb = Math.floor(t / beat);
    if (nb % 2 === 0) { const f = 50 + 70 * Math.exp(-tb / 0.02); a[i] += 0.5 * Math.sin(2 * Math.PI * f * tb) * Math.exp(-tb / 0.12); }
    const th = (t + beat / 2) % beat; a[i] += 0.04 * ruido() * Math.exp(-th / 0.012);
    const t8 = t % (beat / 2), n8 = Math.floor(t / (beat / 2)), m8 = ac[[0, 2, 1, 3][n8 % 4]] + 12;
    a[i] += 0.07 * Math.sin(2 * Math.PI * nota(m8) * t8) * Math.exp(-t8 / 0.09);
  }
  const s = passaBaixa(Array.from(a), 5000);
  for (let i = 0; i < n; i++) { const t = i / SR; s[i] *= Math.min(1, t / 1.2) * Math.min(1, (d - t) / 1.8); }
  gravar("trilha", s, 0.7); }
