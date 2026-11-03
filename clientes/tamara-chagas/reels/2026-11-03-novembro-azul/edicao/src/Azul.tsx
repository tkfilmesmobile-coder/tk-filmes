// Dra. Tamara · Novembro Azul (bruto IMG_6687, gravado em 23/10/2026; editado em 03/11/2026 no PC kumyt)
// Tomada única, sem corte no meio (curadoria: começa no silêncio antes de "Estamos", termina depois de "amor próprio").
// Camadas: câmera (zoom nas ênfases) · legenda palavra a palavra · headlines nas frases-chave. Estética do escritório.
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = Math.round(84.5 * FPS);
const T0 = 0.4; // o vídeo começa em 0,4 s do bruto
const CHAMPANHE = "#E6D3B8", AZUL = "#8FB8E8";
const fr = (bruto: number) => Math.round((bruto - T0) * FPS);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE = Easing.bezier(0.42, 0, 0.58, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- fala: palavra exata + início no bruto (whisper medium na gravação inteira, conferido) ---------- */
const P: [string, number][] = [
  ["Estamos", 0.55], ["chegando", 0.96], ["ao", 1.46], ["Novembro", 1.6], ["Azul,", 2.16], ["mês", 2.7], ["de", 3.0], ["conscientização", 3.38], ["sobre", 4.36], ["a", 4.66], ["saúde", 4.84], ["masculina", 5.04],
  ["e", 6.18], ["a", 6.4], ["prevenção", 6.58], ["de", 6.96], ["doenças,", 7.16], ["em", 7.72], ["especial,", 7.94], ["câncer", 8.9], ["de", 9.24], ["próstata.", 9.48],
  ["Eu,", 10.56], ["como", 10.72], ["advogada", 10.84], ["previdenciarista,", 11.26], ["quero", 12.08], ["fazer", 12.28], ["uma", 12.7], ["reflexão", 12.98], ["importante.", 13.4],
  ["No", 14.5], ["nosso", 14.72], ["escritório,", 14.92], ["atendemos", 15.88], ["diariamente", 16.16], ["homens", 17.08], ["que", 17.96], ["muitas", 18.28], ["vezes", 18.74], ["passaram", 19.2], ["a", 19.72], ["vida", 19.84], ["inteira", 20.06], ["trabalhando,", 20.36],
  ["cuidando", 21.66], ["da", 22.12], ["família", 22.36], ["e", 22.84], ["deixando", 23.24], ["a", 23.6], ["própria", 23.82], ["saúde", 24.18], ["para", 24.6], ["depois.", 24.9],
  ["Sabe", 25.92], ["o", 26.14], ["que", 26.2], ["acontece?", 26.26], ["Muitos", 27.44], ["só", 27.98], ["procuram", 28.28], ["ajuda", 28.7], ["quando", 29.16], ["a", 29.42], ["doença", 29.58], ["já", 30.0], ["está", 30.3], ["comprometendo", 30.68], ["a", 31.5], ["sua", 31.62], ["capacidade", 31.8], ["de", 32.44], ["trabalhar.", 32.48],
  ["Mas", 33.98], ["atenção,", 34.14], ["não", 34.84], ["espere", 35.1], ["adoecer", 35.44], ["para", 36.02], ["começar", 36.26], ["a", 36.64], ["se", 36.74], ["cuidar.", 36.88],
  ["A", 37.7], ["partir", 37.84], ["dos", 38.04], ["50", 38.18], ["anos,", 38.54], ["é", 39.04], ["importante", 39.14], ["conversar", 39.52], ["com", 40.42], ["um", 40.6], ["médico", 40.76], ["sobre", 40.94], ["exames", 41.56], ["de", 42.06], ["próstata.", 42.4],
  ["Para", 43.58], ["homens", 43.82], ["com", 44.12], ["fatores", 44.32], ["de", 44.64], ["risco,", 44.88], ["essa", 45.7], ["conversa", 46.04], ["deve", 46.62], ["começar", 47.0], ["antes.", 47.64],
  ["A", 48.98], ["realização", 49.2], ["dos", 49.66], ["exames", 49.98], ["deve", 50.32], ["ser", 50.52], ["uma", 50.76], ["decisão", 51.04], ["individualizada.", 51.88],
  ["E", 53.42], ["lembre-se,", 53.62], ["previdência", 54.4], ["social,", 54.72], ["ela", 55.36], ["existe", 55.84], ["para", 56.04], ["proteger", 56.36], ["o", 56.86], ["trabalhador", 57.08], ["quando", 57.46], ["ele", 57.62], ["precisa,", 57.86],
  ["mas", 59.02], ["nenhum", 59.16], ["benefício", 59.48], ["ele", 60.14], ["vai", 60.36], ["substituir", 60.7], ["a", 61.68], ["sua", 61.86], ["saúde.", 62.1],
  ["Cuidar", 63.3], ["da", 63.78], ["saúde", 64.04], ["também", 64.38], ["é", 64.72], ["um", 64.84], ["cuidado", 65.04], ["com", 65.42], ["a", 65.7], ["sua", 65.82], ["família,", 66.02], ["com", 67.16], ["seu", 67.38], ["futuro", 67.62], ["e", 68.16], ["com", 68.42], ["a", 68.74], ["sua", 68.82], ["qualidade", 69.2], ["de", 69.86], ["vida.", 70.24],
  ["Nesse", 71.12], ["Novembro", 71.66], ["Azul,", 72.14], ["fica", 72.66], ["o", 72.74], ["meu", 72.94], ["recado.", 73.16],
  ["Homem,", 74.26], ["deixe", 75.18], ["de", 75.46], ["preconceito,", 75.7], ["coloque", 77.1], ["ele", 77.62], ["de", 77.8], ["lado.", 78.08],
  ["Se", 79.1], ["cuidar", 79.3], ["não", 79.84], ["é", 80.08], ["sinal", 80.26], ["de", 80.46], ["fraqueza,", 80.72], ["é", 81.5], ["sinal", 81.6], ["de", 82.08], ["responsabilidade", 82.62], ["e", 83.76], ["amor", 84.14], ["próprio.", 84.46],
];

// linhas curtas: quebra na pontuação ou quando passa de ~22 letras
const LINHAS: { ini: number; pal: [string, number][] }[] = [];
{
  let cur: [string, number][] = [], n = 0;
  for (const p of P) {
    if (cur.length && n + p[0].length > 22) { LINHAS.push({ ini: cur[0][1], pal: cur }); cur = []; n = 0; }
    cur.push(p); n += p[0].length + 1;
    if (/[,.?!]$/.test(p[0])) { LINHAS.push({ ini: cur[0][1], pal: cur }); cur = []; n = 0; }
  }
  if (cur.length) LINHAS.push({ ini: cur[0][1], pal: cur });
}

/* ---------- headlines nas frases-chave (a legenda some enquanto elas aparecem) ---------- */
type H = { a: number; b: number; kicker: string; fino: string; forte: string };
const HEADS: H[] = [
  { a: 0.55, b: 5.72, kicker: "NOVEMBRO AZUL", fino: "o mês da", forte: "SAÚDE DO HOMEM." },
  { a: 27.44, b: 32.94, kicker: "SABE O QUE ACONTECE?", fino: "a ajuda só chega quando a doença", forte: "JÁ AFETA O TRABALHO." },
  { a: 33.98, b: 37.22, kicker: "MAS ATENÇÃO", fino: "não espere", forte: "ADOECER." },
  { a: 37.7, b: 43.0, kicker: "A PARTIR DOS 50 ANOS", fino: "converse com o médico sobre", forte: "EXAMES DE PRÓSTATA." },
  { a: 43.58, b: 48.16, kicker: "FATORES DE RISCO?", fino: "essa conversa", forte: "COMEÇA ANTES." },
  { a: 59.02, b: 62.6, kicker: "PREVIDÊNCIA SOCIAL", fino: "nenhum benefício", forte: "SUBSTITUI A SAÚDE." },
  { a: 79.1, b: 84.95, kicker: "NOVEMBRO AZUL", fino: "se cuidar é", forte: "AMOR PRÓPRIO." },
];
const emHead = (bruto: number) => HEADS.some((h) => bruto >= h.a - 0.05 && bruto < h.b);

/* ---------- câmera: zoom in nas ênfases, zoom out pra respirar ---------- */
const ZOOMS: [number, number, number][] = [
  [10.5, 13.8, 1.06],   // "como advogada previdenciarista"
  [33.98, 37.22, 1.1],  // "não espere adoecer"
  [59.02, 62.6, 1.1],   // "nenhum benefício vai substituir a sua saúde"
  [71.1, 73.7, 1.08],   // "fica o meu recado"
  [79.1, 84.5, 1.08],   // "amor próprio"
];
function camera(f: number) {
  for (const [a, b, s] of ZOOMS) {
    const fa = fr(a), fb = fr(b);
    if (f >= fa && f < fb) {
      const k = Math.min(interpolate(f, [fa, fa + 6], [0, 1], { ...cl, easing: EXPO }), interpolate(f, [fb - 8, fb], [1, 0], { ...cl, easing: EASE }));
      return { transform: `scale(${1 + (s - 1) * k})`, transformOrigin: "50% 28%" };
    }
  }
  return { transform: "scale(1)", transformOrigin: "50% 28%" };
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
          <div style={{ width: 70 * fio, height: 3, background: AZUL }} />
          <div style={{ fontSize: 22, letterSpacing: "0.3em", fontWeight: 700, color: AZUL, opacity: fio }}>{kicker}</div>
        </div>
        <div style={{ marginTop: 14, fontSize: fino.length > 24 ? 60 : 80, lineHeight: 1.02, letterSpacing: "-0.04em", fontWeight: 200, fontStyle: "italic", color: "#fff", opacity: e, transform: `translateY(${(1 - e) * 30}px)` }}>{fino}</div>
        <div style={{ fontSize: tam, lineHeight: 0.95, letterSpacing: "-0.055em", fontWeight: 900, fontStyle: "italic", color: CHAMPANHE, transform: `translateX(${(1 - s) * -80}px) scale(${0.85 + 0.15 * s})`, transformOrigin: "left center", opacity: Math.min(1, s * 1.3), textShadow: "0 0 24px rgba(230,211,184,.45)" }}>{forte}</div>
      </div>
    </AbsoluteFill>
  );
};

const Legenda: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS + T0;
  if (emHead(t)) return null;
  let li = -1;
  for (let i = 0; i < LINHAS.length; i++) if (LINHAS[i].ini <= t) li = i;
  if (li < 0) return null;
  const L = LINHAS[li];
  const fimFala = L.pal[L.pal.length - 1][1] + 1.2;
  const prox = li + 1 < LINHAS.length ? LINHAS[li + 1].ini : 99;
  if (t > Math.min(prox, fimFala + 0.6)) return null;
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

export const Azul: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={camera(f)}><OffthreadVideo src={staticFile("video.mp4")} /></AbsoluteFill>
      <Legenda />
      {HEADS.map((h, i) => <Sequence key={i} from={fr(h.a)} durationInFrames={fr(h.b) - fr(h.a)}><Headline {...h} /></Sequence>)}
      {/* sons nas entradas das headlines (baixos, pra não brigar com a voz) */}
      {S(0.45, "whoosh-grave-impacto", 0.5)}{S(0.75, "thump2", 0.5)}
      {S(27.3, "whoosh-grave", 0.45)}{S(27.7, "thump", 0.5)}
      {S(33.9, "whoosh-grave-impacto", 0.55)}
      {S(37.6, "whoosh-grave", 0.45)}{S(38.0, "thump2", 0.5)}
      {S(43.5, "whoosh-grave", 0.45)}{S(43.9, "thump", 0.5)}
      {S(58.9, "whoosh-grave-impacto", 0.55)}
      {S(79.0, "whoosh-grave", 0.45)}{S(79.4, "thump2", 0.55)}
    </AbsoluteFill>
  );
};
