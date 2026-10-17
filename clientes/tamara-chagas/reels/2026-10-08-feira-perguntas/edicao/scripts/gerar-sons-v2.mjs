// Kit v2 (08/10): whooshes robustos em estéreo + sons dos cards. Sintetizados aqui, sem direito de terceiros.
// uso: node scripts/gerar-sons-v2.mjs -> public/sfx/{whoosh-forte,whoosh-impacto,whoosh-cards,card-1..5}.wav
import fs from "fs";
const SR = 48000;
let s = 21; const rnd = () => { s = (s * 16807) % 2147483647; return (s / 2147483647) * 2 - 1; };
function wav(nome, L, R, alvo = 0.9) {
  let pico = 1e-9; for (let i = 0; i < L.length; i++) pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
  const n = L.length, b = Buffer.alloc(44 + n * 4);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 4, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] / pico * alvo)) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] / pico * alvo)) * 32767), 46 + i * 4); }
  fs.writeFileSync(`public/sfx/${nome}.wav`, b); console.log(nome, (n / SR).toFixed(2), "s");
}
// filtro passa-banda (biquad) com frequência variável
function banda(n, fcAt, q) {
  const out = new Float32Array(n); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) { const fc = fcAt(i / n), w = 2 * Math.PI * fc / SR, al = Math.sin(w) / (2 * q), a0 = 1 + al;
    const x = rnd(), y = (al * x - al * x2 + 2 * Math.cos(w) * y1 - (1 - al) * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; out[i] = y; }
  return out;
}
// WHOOSH robusto: corpo grave em glissando + ar em banda que sobe e desce + cauda; envelope cresce até o pico (~70%) e cai rápido
function whoosh(d, { pico = 0.68, graveDe = 55, graveAte = 170, arDe = 250, arPico = 5200, arFim = 900, pan = true, impacto = 0 } = {}) {
  const n = Math.round(d * SR), L = new Float32Array(n), R = new Float32Array(n);
  const ar = banda(n, (p) => p < pico ? arDe + (arPico - arDe) * (p / pico) ** 1.6 : arPico + (arFim - arPico) * ((p - pico) / (1 - pico)), 0.9);
  const ar2 = banda(n, (p) => 1.8 * (p < pico ? arDe + (arPico - arDe) * (p / pico) ** 1.6 : arPico + (arFim - arPico) * ((p - pico) / (1 - pico))), 1.4);
  let fase = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n, t = i / SR;
    const env = p < pico ? (p / pico) ** 2.2 : Math.exp(-((p - pico) / (1 - pico)) * 4.5);
    const fg = graveDe + (graveAte - graveDe) * Math.min(1, p / pico); fase += 2 * Math.PI * fg / SR;
    const grave = (Math.sin(fase) + 0.4 * Math.sin(2 * fase)) * env * 0.9;
    let v = (ar[i] * 2.4 + ar2[i] * 1.2) * env + grave;
    if (impacto && t > d * pico) { const ti = t - d * pico; v += impacto * (Math.sin(2 * Math.PI * (48 + 110 * Math.exp(-ti / 0.03)) * ti) * Math.exp(-ti / 0.16) + 0.4 * rnd() * Math.exp(-ti / 0.02)); }
    const pp = pan ? -0.8 + 1.6 * p : 0; L[i] = v * (1 - pp) * 0.7; R[i] = v * (1 + pp) * 0.7;
  }
  return [L, R];
}
fs.mkdirSync("public/sfx", { recursive: true });
wav("whoosh-forte", ...whoosh(0.62));                                   // texto/elemento passando com força
wav("whoosh-impacto", ...whoosh(0.9, { pico: 0.45, impacto: 1.4 }), 0.95); // troca de cena: whoosh que termina em pancada
wav("whoosh-cards", ...whoosh(0.75, { pico: 0.55, arPico: 3800, graveDe: 70, graveAte: 140 }));  // a fileira de cards chegando

// CARD n: estalo de papel + nota de marimba (Dó, Mi, Sol, Dó, Mi) subindo a cada card
const notas = [523.25, 659.25, 783.99, 1046.5, 1318.5];
notas.forEach((f, k) => {
  const d = 0.55, n = Math.round(d * SR), L = new Float32Array(n), R = new Float32Array(n);
  const papel = banda(n, (p) => 2500 + 3000 * p, 0.8);
  for (let i = 0; i < n; i++) { const t = i / SR;
    const mar = (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t / 0.03)) * Math.exp(-t / 0.22) * Math.min(1, t / 0.002);
    const est = papel[i] * Math.exp(-t / 0.025) * 1.6;
    const baque = Math.sin(2 * Math.PI * (120 + 80 * Math.exp(-t / 0.01)) * t) * Math.exp(-t / 0.05) * 0.5;
    const v = mar * 0.9 + est + baque, pp = -0.6 + 0.3 * k; L[i] = v * (1 - pp); R[i] = v * (1 + pp); }
  wav(`card-${k + 1}`, L, R, 0.75);
});
