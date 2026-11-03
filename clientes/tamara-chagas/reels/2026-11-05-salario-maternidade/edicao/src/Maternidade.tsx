// Dra. Tamara · Salário-maternidade: "toda grávida recebe mais de 6 mil?" (bruto IMG_7231, gravado em 03/11/2026)
// Curadoria: 2 trechos. Sai só o "Bem," solto e a pausa de 1 s depois dele (6,72 a 8,80 s do bruto), entre duas frases,
// no silêncio; o corte é escondido com mudança de zoom. Nenhuma emenda dentro de frase.
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
const CHAMPANHE = "#E6D3B8", ROSE = "#E8B4B0";
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE = Easing.bezier(0.42, 0, 0.58, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// trechos do bruto [início, fim] e o zoom de cada um (a troca de zoom esconde o corte)
const EDL: [number, number, number][] = [[0.7, 6.72, 1.0], [8.8, 43.9, 1.07]];
const INI: number[] = []; { let acc = 0; for (const [a, b] of EDL) { INI.push(acc); acc += b - a; } }
export const DURACAO = Math.round(EDL.reduce((s, [a, b]) => s + b - a, 0) * FPS);
const tl = (bruto: number) => { for (let i = EDL.length - 1; i >= 0; i--) if (bruto >= EDL[i][0] - 0.3) return INI[i] + bruto - EDL[i][0]; return 0; };
const fr = (bruto: number) => Math.round(tl(bruto) * FPS);

/* ---------- fala: palavra exata + início no bruto (whisper medium, gravação inteira e trechos, conferido) ---------- */
const P: [string, number][] = [
  ["Quem", 0.82], ["está", 1.02], ["grávida", 1.32], ["pode", 1.8], ["garantir", 2.14], ["o", 2.6], ["salário-maternidade", 2.7], ["e", 3.74], ["vai", 4.12], ["recebendo", 4.42], ["um", 4.8], ["total", 4.94], ["em", 5.2], ["torno", 5.38], ["de", 5.6], ["mais", 5.74], ["de", 5.9], ["6", 6.16], ["mil", 6.34], ["reais.", 6.48],
  ["A", 9.0], ["fala", 9.34], ["que", 9.56], ["é", 9.76], ["dita", 9.86], ["aqui", 10.0], ["na", 10.14], ["rede", 10.2], ["social", 10.38], ["é", 10.88], ["dessa", 11.18], ["forma,", 11.64], ["mas", 12.22], ["não", 12.56], ["é", 12.9], ["bem", 13.1], ["assim", 13.32], ["que", 13.68], ["as", 13.82], ["coisas", 13.96], ["acontecem.", 14.22],
  ["Nem", 15.4], ["toda", 15.84], ["gestante", 16.16], ["tem", 16.82], ["direito", 17.06], ["ao", 17.44], ["salário-maternidade,", 17.62], ["porque", 18.64], ["isso", 19.04], ["tem", 19.36], ["que", 19.52], ["verificar", 19.72], ["o", 20.18], ["enquadramento", 20.72], ["dela", 21.38], ["junto", 21.78], ["com", 22.04], ["o", 22.26], ["INSS", 22.4], ["para", 22.7], ["a", 23.5], ["concessão", 23.92], ["desse", 24.56], ["benefício.", 24.82],
  ["Uma", 26.02], ["gestante", 26.34], ["que", 26.78], ["ela", 26.98], ["já", 27.12], ["recebe", 27.32], ["o", 27.58], ["benefício", 27.76], ["assistencial,", 28.06], ["por", 28.74], ["exemplo,", 28.92], ["que", 29.42], ["já", 29.52], ["é", 29.7], ["aposentada", 29.92],
  ["ou", 31.38], ["até", 31.66], ["mesmo", 31.92], ["já", 32.6], ["está", 33.04], ["em", 33.26], ["gozo", 33.46], ["do", 33.62], ["benefício", 33.8], ["de", 34.26], ["incapacidade", 34.44], ["temporária,", 35.14], ["que", 35.74], ["é", 35.78], ["o", 35.86], ["auxílio-doença,", 35.94],
  ["ela", 37.24], ["não", 37.28], ["vai", 37.54], ["conseguir", 37.8], ["receber", 38.34], ["em", 38.86], ["paralelo", 39.34], ["ao", 39.66], ["salário-maternidade.", 39.8],
  ["Então,", 40.92], ["a", 41.44], ["resposta", 41.76], ["é:", 42.28], ["depende.", 42.98],
];
const LINHAS: { ini: number; pal: [string, number][] }[] = [];
{
  let cur: [string, number][] = [], n = 0;
  for (const p of P) {
    if (cur.length && n + p[0].length > 22) { LINHAS.push({ ini: cur[0][1], pal: cur }); cur = []; n = 0; }
    cur.push(p); n += p[0].length + 1;
    if (/[,.?!:]$/.test(p[0])) { LINHAS.push({ ini: cur[0][1], pal: cur }); cur = []; n = 0; }
  }
  if (cur.length) LINHAS.push({ ini: cur[0][1], pal: cur });
}

type H = { a: number; b: number; kicker: string; fino: string; forte: string };
const HEADS: H[] = [
  { a: 0.82, b: 6.72, kicker: "SALÁRIO-MATERNIDADE", fino: "toda grávida recebe", forte: "MAIS DE R$ 6 MIL?" },
  { a: 15.4, b: 18.6, kicker: "NÃO É BEM ASSIM", fino: "nem toda gestante", forte: "TEM DIREITO." },
  { a: 37.24, b: 40.44, kicker: "EM PARALELO", fino: "não dá pra receber", forte: "OS DOIS JUNTOS." },
  { a: 40.92, b: 43.9, kicker: "A RESPOSTA", fino: "então, a resposta é:", forte: "DEPENDE." },
];
const emHead = (bruto: number) => HEADS.some((h) => bruto >= h.a - 0.05 && bruto < h.b);
const ZOOMS: [number, number, number][] = [[12.2, 14.82, 1.06], [40.92, 43.9, 1.08]];

function brutoDe(f: number) { const t = f / FPS; for (let i = EDL.length - 1; i >= 0; i--) if (t >= INI[i]) return EDL[i][0] + t - INI[i]; return EDL[0][0]; }
function camera(f: number) {
  const b = brutoDe(f);
  const seg = EDL.find(([a, z]) => b >= a && b <= z) ?? EDL[0];
  let s = seg[2];
  for (const [a, z, zs] of ZOOMS) {
    const fa = fr(a), fb = fr(z);
    if (f >= fa && f < fb) {
      const k = Math.min(interpolate(f, [fa, fa + 6], [0, 1], { ...cl, easing: EXPO }), interpolate(f, [fb - 8, fb], [1, 0], { ...cl, easing: EASE }));
      s = s * (1 + (zs - 1) * k);
    }
  }
  return { transform: `scale(${s})`, transformOrigin: "50% 30%" };
}

const Headline: React.FC<H> = ({ a, b, kicker, fino, forte }) => {
  const f = useCurrentFrame();
  const dur = fr(b) - fr(a);
  const e = interpolate(f, [0, 12], [0, 1], { ...cl, easing: EXPO });
  const s = spring({ frame: f - 6, fps: FPS, config: { damping: 12, mass: 0.6 } });
  const fio = interpolate(f, [4, 22], [0, 1], { ...cl, easing: EXPO });
  const sai = interpolate(f, [dur - 8, dur], [1, 0], cl);
  const tam = Math.min(132, Math.floor(1700 / Math.max(6, forte.length)));
  return (
    <AbsoluteFill style={{ fontFamily, opacity: sai }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(20,20,20,0) 52%,rgba(20,20,20,.72) 80%)", opacity: e }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1310 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 70 * fio, height: 3, background: ROSE }} />
          <div style={{ fontSize: 22, letterSpacing: "0.3em", fontWeight: 700, color: ROSE, opacity: fio }}>{kicker}</div>
        </div>
        <div style={{ marginTop: 14, fontSize: fino.length > 24 ? 60 : 80, lineHeight: 1.02, letterSpacing: "-0.04em", fontWeight: 200, fontStyle: "italic", color: "#fff", opacity: e, transform: `translateY(${(1 - e) * 30}px)` }}>{fino}</div>
        <div style={{ fontSize: tam, lineHeight: 0.95, letterSpacing: "-0.055em", fontWeight: 900, fontStyle: "italic", color: CHAMPANHE, transform: `translateX(${(1 - s) * -80}px) scale(${0.85 + 0.15 * s})`, transformOrigin: "left center", opacity: Math.min(1, s * 1.3), textShadow: "0 0 24px rgba(230,211,184,.45)" }}>{forte}</div>
      </div>
    </AbsoluteFill>
  );
};

const Legenda: React.FC = () => {
  const f = useCurrentFrame();
  const t = brutoDe(f);
  if (emHead(t)) return null;
  let li = -1;
  for (let i = 0; i < LINHAS.length; i++) if (LINHAS[i].ini <= t) li = i;
  if (li < 0) return null;
  const L = LINHAS[li];
  const prox = li + 1 < LINHAS.length ? LINHAS[li + 1].ini : 99;
  if (t > Math.min(prox, L.pal[L.pal.length - 1][1] + 1.8)) return null;
  const ditas = L.pal.filter((p) => p[1] <= t);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(20,20,20,0) 62%,rgba(20,20,20,.45) 80%,rgba(20,20,20,.25) 94%,rgba(20,20,20,0) 100%)" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1400, fontSize: 60, lineHeight: 1.2, fontWeight: 300, color: "rgba(255,255,255,.92)", textShadow: "0 2px 16px rgba(0,0,0,.7),0 0 2px rgba(0,0,0,.8)" }}>
        {L.pal.map(([w, ti], i) => (
          <span key={i} style={{ display: "inline-block", marginRight: "0.26em", visibility: ti <= t ? "visible" : "hidden", fontWeight: i === ditas.length - 1 ? 700 : 300, color: i === ditas.length - 1 ? "#fff" : undefined }}>{w}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const S = (bruto: number, nome: string, v: number) => <Sequence from={Math.max(0, fr(bruto))}><Audio src={staticFile(`sfx/${nome}.wav`)} volume={v} /></Sequence>;

export const Maternidade: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={camera(f)}>
        {EDL.map(([a, b], i) => (
          <Sequence key={i} from={Math.round(INI[i] * FPS)} durationInFrames={Math.round((b - a) * FPS)}>
            <OffthreadVideo src={staticFile("video.mp4")} trimBefore={Math.round(a * FPS)} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Legenda />
      {HEADS.map((h, i) => <Sequence key={i} from={fr(h.a)} durationInFrames={fr(h.b) - fr(h.a)}><Headline {...h} /></Sequence>)}
      {S(0.75, "whoosh-grave-impacto", 0.5)}{S(1.05, "thump2", 0.5)}
      {S(15.3, "whoosh-grave", 0.45)}{S(15.7, "thump", 0.5)}
      {S(37.15, "whoosh-grave", 0.45)}{S(37.55, "thump2", 0.5)}
      {S(42.9, "whoosh-grave-impacto", 0.6)}
    </AbsoluteFill>
  );
};
