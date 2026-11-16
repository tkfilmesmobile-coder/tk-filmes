// Peças do estilo novo de edição da TK (perfil de 2026-11-16, tk-filmes/videos/perfil-de-edicao.md):
// cartão de capítulo digitado, insert de b-roll (tela cheia ou em faixa) e a planta desenhada (raízes).
import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
const serif = loadSerif("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
const mont = loadMont("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;

const OFF = "#FAF6F3", MARROM = "#5A3A2E", CARAMELO = "#CD9365", CREME = "#FBF4EC";

// ── Cartão de capítulo: fundo off-white sobe rápido, rótulo pequeno em caramelo e uma FRASE DE IMPACTO grande,
//    digitada rápido em Instrument Serif marrom, com a palavra-chave em caramelo ([[assim]] no texto). Filete caramelo
//    crescendo embaixo. Sai subindo. (O whoosh e a batida vêm da trilha.)
export type FigCapitulo = { tipo: "capitulo"; from: number; durationInFrames: number; texto: string; rotulo?: string; tamanho?: number };
export const Capitulo: React.FC<{ f: FigCapitulo }> = ({ f }) => {
  const frame = useCurrentFrame();
  const D = f.durationInFrames;
  const entra = interpolate(frame, [0, 6], [1, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const sai = interpolate(frame, [D - 6, D], [0, -1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  // pedaços: texto normal e destaque ([[...]])
  const partes = f.texto.split(/(\[\[[^\]]+\]\])/).filter(Boolean).map((p) => (p.startsWith("[[") ? { t: p.slice(2, -2), d: true } : { t: p, d: false }));
  const total = partes.reduce((n, p) => n + p.t.length, 0);
  const passo = Math.min(1.2, (D * 0.35) / Math.max(1, total)); // a digitação termina com 35% do cartão
  const fimDig = 4 + total * passo;
  let resta = Math.floor(interpolate(frame, [4, fimDig], [0, total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const fio = interpolate(frame, [fimDig - 4, fimDig + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const cursor = frame < fimDig + 6 && Math.floor(frame / 3) % 2 === 0;
  // a palavra em destaque "acende" quando termina de ser digitada
  const brilho = interpolate(frame, [fimDig, fimDig + 8], [1.0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: OFF, transform: `translateY(${(entra + sai) * 1920}px)`, alignItems: "center", justifyContent: "center" }}>
      {f.rotulo ? <div style={{ fontFamily: mont, fontWeight: 700, fontSize: 26, letterSpacing: "0.32em", color: CARAMELO, textTransform: "uppercase", marginBottom: 40 }}>{f.rotulo}</div> : null}
      <div style={{ fontFamily: serif, fontSize: f.tamanho ?? 168, lineHeight: 0.98, letterSpacing: "-0.01em", color: MARROM, textAlign: "center", width: 860, transform: `scale(${brilho})` }}>
        {partes.map((p, k) => {
          const vis = p.t.slice(0, Math.max(0, resta)); resta -= p.t.length;
          return <span key={k} style={{ color: p.d ? CARAMELO : MARROM }}>{vis}</span>;
        })}
        <span style={{ opacity: cursor ? 1 : 0, color: CARAMELO }}>|</span>
      </div>
      <div style={{ width: 160 * fio, height: 3, background: CARAMELO, marginTop: 48, borderRadius: 2 }} />
      {Array.from({ length: total }).map((_, i) => (i % 3 === 0 ? (
        <Sequence key={i} from={4 + Math.round(i * passo)} durationInFrames={6}><Audio src={staticFile("sfx/tique.wav")} volume={0.1} /></Sequence>
      ) : null))}
    </AbsoluteFill>
  );
};

// ── Insert de b-roll por cima da fala (a voz continua): "cheio" cobre a tela; "faixa" é o plano 16:9 no meio,
//    com fundo off-white em volta (o plano horizontal da referência).
export type Insert = { from: number; durationInFrames: number; src: string; trimBefore?: number; modo?: "cheio" | "faixa"; filtro?: string };
export const InsertNaTela: React.FC<{ i: Insert }> = ({ i }) => {
  const frame = useCurrentFrame();
  // corte seco: só um respiro de 2 frames na escala, pra não "pular"
  const s = interpolate(frame, [0, 3], [1.04, 1], { extrapolateRight: "clamp" });
  const v = <Video src={staticFile(i.src)} trimBefore={i.trimBefore ?? 0} muted objectFit="cover" style={{ width: "100%", height: "100%", filter: i.filtro }} />;
  if (i.modo === "faixa")
    return (
      <AbsoluteFill style={{ background: OFF, alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 1080, height: 608, overflow: "hidden", transform: `scale(${s})` }}>{v}</div>
      </AbsoluteFill>
    );
  return <AbsoluteFill style={{ transform: `scale(${s})` }}>{v}</AbsoluteFill>;
};

// ── Planta desenhada na faixa de baixo (y 1060–1500): semente, caule e folhas crescendo; depois as raízes debaixo
//    da terra, cada uma com o nome do que está sendo construído, entrando na palavra dita.
//    fases (frames relativos à figura): folhas (caule + folhas), parada (o caule para e a terra "respira"),
//    raizes (as raízes crescem). palavras: rótulos das raízes, cada um no frame em que é dito.
export type FigPlanta = { tipo: "planta"; from: number; durationInFrames: number; folhas: number; parada?: number; raizes?: number; palavras?: { texto: string; fala: number }[] };
const SOLO = 1250, CX = 540;
const RAIZES = [
  { d: `M${CX} ${SOLO} C ${CX - 20} ${SOLO + 40}, 470 ${SOLO + 50}, 430 ${SOLO + 78}`, x: 430, y: SOLO + 78, lado: "esq" },
  { d: `M${CX} ${SOLO} C ${CX + 20} ${SOLO + 40}, 610 ${SOLO + 50}, 650 ${SOLO + 78}`, x: 650, y: SOLO + 78, lado: "dir" },
  { d: `M${CX} ${SOLO} C ${CX - 6} ${SOLO + 110}, 480 ${SOLO + 150}, 430 ${SOLO + 182}`, x: 430, y: SOLO + 182, lado: "esq" },
  { d: `M${CX} ${SOLO} C ${CX + 6} ${SOLO + 110}, 600 ${SOLO + 150}, 650 ${SOLO + 182}`, x: 650, y: SOLO + 182, lado: "dir" },
];
export const Planta: React.FC<{ f: FigPlanta }> = ({ f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const D = f.durationInFrames;
  const painel = interpolate(frame, [0, 8, D - 8, D], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // semente aparece, caule cresce até a fala das folhas e um pouco depois; na "parada" ele quase não cresce mais
  const caule = interpolate(frame, [4, f.folhas + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const folha = spring({ frame: frame - f.folhas, fps, config: { damping: 12, stiffness: 140 } });
  const parada = f.parada !== undefined ? interpolate(frame, [f.parada, f.parada + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const altura = 130 + 14 * parada; // na parada, quase nada muda em cima
  const topoCaule = SOLO - altura * caule;
  // a terra "respira" na parada (algo acontecendo embaixo)
  const respira = f.parada !== undefined && (f.raizes === undefined || frame < f.raizes) ? parada * (0.5 + 0.5 * Math.sin((frame - (f.parada ?? 0)) / 6)) : 0;
  const rotulos = f.palavras ?? [];
  const progRaiz = (k: number) => {
    const inicio = rotulos[k] ? rotulos[k].fala - 8 : (f.raizes ?? 1e9) + k * 6;
    return interpolate(frame, [inicio, inicio + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  };
  const algumaRaiz = f.raizes !== undefined || rotulos.length > 0;
  return (
    <AbsoluteFill style={{ opacity: painel, pointerEvents: "none" }}>
      {/* só a planta, com uma sombra preta leve atrás (pedido da Talyta, 16/11): sem faixa escura nem terra pintada */}
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 3px 10px rgba(0,0,0,.55)) drop-shadow(0 0 22px rgba(0,0,0,.35))" }}>
        {/* linha da terra, curta e fina; "respira" na fase parada */}
        <line x1="300" y1={SOLO} x2="780" y2={SOLO} stroke={CREME} strokeWidth="3" strokeLinecap="round" opacity={0.75 + 0.25 * respira} />
        {/* semente */}
        <ellipse cx={CX} cy={SOLO + 10} rx="16" ry="11" fill={CARAMELO} opacity={interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" })} />
        {/* raízes */}
        {algumaRaiz ? RAIZES.map((r, k) => {
          const p = progRaiz(k);
          return <g key={k}>{rotulos[k] ? <circle cx={r.x} cy={r.y} r={7 * p} fill={CARAMELO} /> : null}<path d={r.d} fill="none" stroke={CREME} strokeWidth={6 - k * 0.6} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} opacity={0.95} /></g>;
        }) : null}
        {/* caule */}
        <line x1={CX} y1={SOLO} x2={CX} y2={topoCaule} stroke="#9DBF7A" strokeWidth="9" strokeLinecap="round" />
        {/* folhas */}
        <g transform={`translate(${CX} ${topoCaule + 18}) scale(${folha})`}>
          <path d="M0 0 C -30 -40, -90 -40, -110 -6 C -80 10, -30 12, 0 0 Z" fill="#9DBF7A" />
          <path d="M0 0 C 30 -46, 96 -48, 118 -12 C 86 8, 32 12, 0 0 Z" fill="#B7D493" />
        </g>
      </svg>
      {/* rótulos das raízes */}
      {rotulos.map((r, k) => {
        const q = RAIZES[k]; if (!q) return null;
        const e = spring({ frame: frame - r.fala, fps, config: { damping: 14, stiffness: 160 } });
        return (
          <div key={k} style={{ position: "absolute", top: q.y - 17, ...(q.lado === "esq" ? { right: 1080 - q.x + 16, textAlign: "right" } : { left: q.x + 16, textAlign: "left" }),
            opacity: e, transform: `translateX(${(1 - e) * (q.lado === "esq" ? 14 : -14)}px)`, whiteSpace: "nowrap",
            fontFamily: mont, fontWeight: 700, fontSize: 25, lineHeight: "34px", letterSpacing: "0.06em", textTransform: "uppercase", color: CREME, textShadow: "0 2px 10px rgba(0,0,0,.75), 0 0 3px rgba(0,0,0,.6)" }}>
            {r.texto}
          </div>
        );
      })}
      {rotulos.map((r, k) => (
        <Sequence key={`s${k}`} from={r.fala} durationInFrames={14}><Audio src={staticFile("sfx/positivo.wav")} volume={0.25} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
