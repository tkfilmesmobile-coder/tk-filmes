// SFX da vertente de humor, sintetizados aqui (sem download e sem direito autoral de terceiros).
// uso: node scripts/gerar-sons-humor.mjs -> public/sfx/*.wav
import fs from "fs";

const SR = 48000;
let semente = 7;
const ruido = () => { semente = (semente * 16807) % 2147483647; return (semente / 2147483647) * 2 - 1; };
function gravar(nome, a, alvo = 0.85) {
  const pico = a.reduce((m, v) => Math.max(m, Math.abs(v)), 1e-9), n = a.length, buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, (a[i] / pico) * alvo)) * 32767), 44 + i * 2);
  fs.mkdirSync("public/sfx", { recursive: true }); fs.writeFileSync(`public/sfx/${nome}.wav`, buf); console.log(nome, (n / SR).toFixed(2), "s");
}
const passaBaixa = (a, fc) => { const k = 1 - Math.exp((-2 * Math.PI * fc) / SR); let y = 0; return a.map((x) => (y += k * (x - y))); };
const arr = (d) => new Float32Array(Math.round(SR * d));

// BOOM: explosão grave com cauda longa (ruptura grande)
{ const a = arr(1.8); const r = passaBaixa(Array.from(a, (_, i) => ruido()), 320);
  for (let i = 0; i < a.length; i++) { const t = i / SR, f = 38 + 70 * Math.exp(-t / 0.08);
    a[i] = 1.2 * Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.35) + 1.6 * r[i] * Math.exp(-t / 0.5) * Math.min(1, t / 0.004); }
  gravar("boom", a, 0.95); }

// IMPACT: pancada seca de punchline
{ const a = arr(0.5); const r = passaBaixa(Array.from(a, () => ruido()), 2500);
  for (let i = 0; i < a.length; i++) { const t = i / SR, f = 55 + 120 * Math.exp(-t / 0.02);
    a[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.12) + 0.5 * r[i] * Math.exp(-t / 0.015); }
  gravar("impact", a, 0.9); }

// POP: estalo curto (entrada de texto ou figurinha)
{ const a = arr(0.12);
  for (let i = 0; i < a.length; i++) { const t = i / SR, f = 900 - 5200 * t; a[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.025); }
  gravar("pop", a, 0.6); }

// WHOOSH: ar rápido (entrada de insert)
{ const a = arr(0.45); let y = 0;
  for (let i = 0; i < a.length; i++) { const p = i / a.length, fc = 400 + 5000 * Math.sin(Math.PI * p), k = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    y += k * (ruido() - y); a[i] = y * Math.sin(Math.PI * p) ** 2; }
  gravar("whoosh", a, 0.6); }

// GLITCH: estalos digitais + bip quebrado (tela de erro)
{ const a = arr(0.6);
  for (let i = 0; i < a.length; i++) { const t = i / SR, bloco = Math.floor(t * 40) % 3;
    a[i] = bloco === 0 ? Math.sign(Math.sin(2 * Math.PI * 1400 * t)) * 0.5 : bloco === 1 ? ruido() * 0.7 : Math.sin(2 * Math.PI * 300 * t) * 0.5; }
  gravar("glitch", a, 0.55); }

// SCRATCH: "arranhão de disco" (parada brusca)
{ const a = arr(0.4); let y = 0;
  for (let i = 0; i < a.length; i++) { const p = i / a.length, fc = 3000 * (1 - p) + 300, k = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    y += k * (ruido() - y); a[i] = y * Math.sin(Math.PI * 9 * p) * (1 - p); }
  gravar("scratch", a, 0.6); }

// TV ERROR: tom de barras de cor (1 kHz) com zumbido
{ const a = arr(1.0);
  for (let i = 0; i < a.length; i++) { const t = i / SR; a[i] = 0.6 * Math.sin(2 * Math.PI * 1000 * t) + 0.08 * ruido(); }
  gravar("tv-erro", a, 0.4); }

// DRAMA: acorde de cordas sintético, crescente (momento "épico")
{ const a = arr(3.2), notas = [110, 164.8, 220, 261.6, 329.6];
  for (let i = 0; i < a.length; i++) { const t = i / SR, env = Math.min(1, t / 1.2) * Math.min(1, (3.2 - t) / 0.4);
    let s = 0; for (const f of notas) for (const d of [-0.6, 0, 0.6]) s += Math.sin(2 * Math.PI * (f + d) * t + Math.sin(2 * Math.PI * 5 * t) * 0.3);
    a[i] = s * env; }
  gravar("drama", a, 0.7); }

// DING: sininho de "resposta certa" (fechamento com a informação)
{ const a = arr(1.2);
  for (let i = 0; i < a.length; i++) { const t = i / SR; a[i] = (Math.sin(2 * Math.PI * 1318 * t) + 0.5 * Math.sin(2 * Math.PI * 2636 * t)) * Math.exp(-t / 0.35); }
  gravar("ding", a, 0.5); }

// ===== kit da abertura cinética (08/10): um som pra cada tipo de animação =====
// TICK: toque seco e leve (palavra fina entrando)
{ const a = arr(0.09); for (let i = 0; i < a.length; i++) { const t = i / SR; a[i] = (Math.sin(2 * Math.PI * 2400 * t) * 0.6 + ruido() * 0.4) * Math.exp(-t / 0.012); } gravar("tick", a, 0.45); }
// SWISH: ar curto e agudo (texto deslizando)
{ const a = arr(0.28); let y = 0; for (let i = 0; i < a.length; i++) { const p = i / a.length, fc = 1500 + 6000 * p, k = 1 - Math.exp((-2 * Math.PI * fc) / SR); y += k * (ruido() - y); a[i] = y * Math.sin(Math.PI * p) ** 1.5; } gravar("swish", a, 0.5); }
// THUMP grave e THUMP médio (palavra pesada batendo)
for (const [nome, f0] of [["thump", 60], ["thump2", 85]]) { const a = arr(0.35); const r = passaBaixa(Array.from(a, () => ruido()), 1200);
  for (let i = 0; i < a.length; i++) { const t = i / SR; a[i] = Math.sin(2 * Math.PI * (f0 + 90 * Math.exp(-t / 0.015)) * t) * Math.exp(-t / 0.09) + 0.35 * r[i] * Math.exp(-t / 0.01); } gravar(nome, a, 0.85); }
// SHIMMER: brilho cintilante (palavra com glow)
{ const a = arr(1.1), fs = [2093, 2637, 3136, 3951, 4186]; for (let i = 0; i < a.length; i++) { const t = i / SR; let v = 0;
  fs.forEach((f, k) => { const t0 = k * 0.05; if (t > t0) v += Math.sin(2 * Math.PI * f * (t - t0)) * Math.exp(-(t - t0) / 0.35); }); a[i] = v * (1 + 0.3 * Math.sin(2 * Math.PI * 9 * t)); } gravar("shimmer", a, 0.4); }
// RISER: subida curta (antes de revelação)
{ const a = arr(0.6); let y = 0; for (let i = 0; i < a.length; i++) { const p = i / a.length, fc = 300 + 5000 * p * p, k = 1 - Math.exp((-2 * Math.PI * fc) / SR); y += k * (ruido() - y);
  a[i] = (y * 0.7 + 0.3 * Math.sin(2 * Math.PI * (200 + 900 * p * p) * i / SR)) * p * p; } gravar("riser", a, 0.55); }
// WHIP: chicote (troca de cena com desfoque) — varredura forte e rápida
{ const a = arr(0.32); let y = 0; for (let i = 0; i < a.length; i++) { const p = i / a.length, fc = 8000 * Math.exp(-p * 3) + 400, k = 1 - Math.exp((-2 * Math.PI * fc) / SR); y += k * (ruido() - y); a[i] = y * Math.exp(-p * 2.5) * Math.min(1, p * 30); } gravar("whip", a, 0.7); }
// CLICK: estalo macio (pílula/etiqueta encaixando)
{ const a = arr(0.07); for (let i = 0; i < a.length; i++) { const t = i / SR; a[i] = Math.sin(2 * Math.PI * (1200 - 6000 * t) * t) * Math.exp(-t / 0.01); } gravar("click", a, 0.5); }
// CARD: papel deslizando e assentando (cada card)
{ const a = arr(0.18); let y = 0; for (let i = 0; i < a.length; i++) { const t = i / SR, p = i / a.length, k = 1 - Math.exp((-2 * Math.PI * 3500) / SR); y += k * (ruido() - y); a[i] = y * Math.sin(Math.PI * Math.min(1, p * 1.6)) * 0.7 + (t > 0.13 ? Math.sin(2 * Math.PI * 180 * (t - 0.13)) * Math.exp(-(t - 0.13) / 0.02) : 0); } gravar("card", a, 0.5); }
