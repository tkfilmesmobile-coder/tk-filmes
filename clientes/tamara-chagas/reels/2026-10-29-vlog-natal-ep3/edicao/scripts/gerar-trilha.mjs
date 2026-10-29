// Trilha própria (sem direito autoral de terceiros): groove de feira, tipo forró-pop, 112 BPM, em Dó.
// zabumba (grave) + triângulo (agudo) + baixo + "sanfona" (acorde de serra com tremolo) + chocalho.
// uso: node scripts/gerar-trilha.mjs [segundos] -> public/sfx/trilha-feira.wav  e  public/sfx/abertura-hit.wav
import fs from "fs";
const SR = 44100, BPM = 112, BEAT = 60 / BPM, DUR = Number(process.argv[2] || 80);
let s = 3; const rnd = () => { s = (s * 16807) % 2147483647; return (s / 2147483647) * 2 - 1; };
function wav(nome, L, R, alvo = 0.8) {
  let pico = 1e-9; for (let i = 0; i < L.length; i++) pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
  const n = L.length, b = Buffer.alloc(44 + n * 4);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 4, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] / pico * alvo)) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] / pico * alvo)) * 32767), 46 + i * 4); }
  fs.mkdirSync("public/sfx", { recursive: true }); fs.writeFileSync(`public/sfx/${nome}.wav`, b); console.log(nome, (n / SR).toFixed(1), "s");
}
const N = Math.round(DUR * SR), L = new Float32Array(N), R = new Float32Array(N);
const add = (t0, fn, d, pan = 0, g = 1) => { const a = Math.round(t0 * SR), m = Math.round(d * SR);
  for (let i = 0; i < m && a + i < N; i++) { const v = fn(i / SR) * g; L[a + i] += v * (1 - pan) ; R[a + i] += v * (1 + pan); } };
const nota = (n) => 261.63 * Math.pow(2, n / 12);
// progressão C - F - G - C (2 compassos cada acorde? 1 compasso = 4 tempos)
const acordes = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], baixos = [-24, -19, -17, -24];
const compassos = Math.ceil(DUR / (4 * BEAT));
for (let c = 0; c < compassos; c++) {
  const t0 = c * 4 * BEAT, ac = acordes[c % 4], bx = baixos[c % 4];
  // zabumba: tum no 1, tum-tum no 3 e "e" do 4 (padrão baião)
  for (const [b, g] of [[0, 1], [1.5, 0.6], [2, 0.8], [3.5, 0.55]])
    add(t0 + b * BEAT, (t) => Math.sin(2 * Math.PI * (55 + 50 * Math.exp(-t / 0.03)) * t) * Math.exp(-t / 0.16), 0.4, 0, 0.9 * g);
  // triângulo: colcheias, aberto/fechado
  for (let k = 0; k < 8; k++) { const aberto = k % 2 === 1;
    add(t0 + k * BEAT / 2, (t) => (Math.sin(2 * Math.PI * 4200 * t) + 0.6 * Math.sin(2 * Math.PI * 6100 * t)) * Math.exp(-t / (aberto ? 0.18 : 0.04)), 0.3, 0.5, 0.16); }
  // chocalho: semicolcheias de ruído filtrado
  for (let k = 0; k < 16; k++) add(t0 + k * BEAT / 4, (t) => rnd() * Math.exp(-t / 0.02), 0.06, -0.4, k % 4 === 0 ? 0.1 : 0.05);
  // baixo: tônica no 1 e quinta no 3
  for (const [b, iv] of [[0, 0], [2, 7], [3.5, 0]])
    add(t0 + b * BEAT, (t) => { const f = nota(bx + iv); return (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) * Math.min(1, t / 0.01) * Math.exp(-t / 0.35); }, 0.6, 0, 0.5);
  // sanfona: acorde em contratempo (no "e" de cada tempo), serra suave com tremolo
  for (let k = 0; k < 4; k++)
    add(t0 + (k + 0.5) * BEAT, (t) => { let v = 0; for (const n of ac) { const f = nota(n); v += ((t * f) % 1) * 2 - 1 + 0.5 * Math.sin(2 * Math.PI * f * 1.003 * t); }
      return v * (1 + 0.25 * Math.sin(2 * Math.PI * 6 * t)) * Math.min(1, t / 0.015) * Math.exp(-t / 0.22); }, 0.35, 0.2, 0.09);
}
// fade in/out
for (let i = 0; i < N; i++) { const t = i / SR, g = Math.min(1, t / 0.3, (DUR - t) / 1.5); L[i] *= g; R[i] *= g; }
wav("trilha-feira", L, R, 0.75);

// abertura-hit: impacto + whoosh + acorde de sanfona aberto (1,6 s)
{ const n = Math.round(1.6 * SR), A = new Float32Array(n), B = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR;
    let v = Math.sin(2 * Math.PI * (45 + 80 * Math.exp(-t / 0.05)) * t) * Math.exp(-t / 0.3) * 1.2;
    for (const k of [0, 4, 7, 12]) { const f = nota(k); v += 0.18 * (((t * f) % 1) * 2 - 1) * Math.exp(-t / 0.9) * Math.min(1, t / 0.02); }
    v += rnd() * 0.25 * Math.exp(-t / 0.08);
    A[i] = v; B[i] = v; }
  wav("abertura-hit", A, B, 0.85); }
