// Dra. Tamara · "Carta negada no INSS: quando judicializar" (pros colegas advogados; bruto já cortado pela Talyta, 15/10/2026)
// Camadas: câmera (zoom nas ênfases) · headlines · cards · selo INSS. Estética do escritório.
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = Math.round(64.78 * FPS);
const OFF = "#ECEBE9", GRAFITE = "#141414", TAUPE = "#8C7B6B", CHAMPANHE = "#E6D3B8";
const fr = (s: number) => Math.round(s * FPS);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE = Easing.bezier(0.42, 0, 0.58, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- câmera: zoom in nas ênfases, zoom out pra respirar ---------- */
// [início, fim, escala, origem y] — a escala sobe com easing e volta no fim
const ZOOMS: [number, number, number, number][] = [
  [8.5, 11.9, 1.1, 0.28],    // "qual foi o motivo que gerou o indeferimento"
  [24.1, 25.9, 1.12, 0.28],  // "não pode ir pra Justiça"
  [49.7, 53.9, 1.1, 0.28],   // "tem respaldo pra judicializar"
  [58.2, 61.0, 1.12, 0.28],  // "não necessariamente"
];
function camera(f: number) {
  for (const [a, b, s, oy] of ZOOMS) {
    const fa = fr(a), fb = fr(b);
    if (f >= fa && f < fb) {
      const k = Math.min(interpolate(f, [fa, fa + 6], [0, 1], { ...cl, easing: EXPO }), interpolate(f, [fb - 8, fb], [1, 0], { ...cl, easing: EASE }));
      return { transform: `scale(${1 + (s - 1) * k})`, transformOrigin: `50% ${oy * 100}%` };
    }
  }
  return { transform: "scale(1)", transformOrigin: "50% 30%" };
}

/* ---------- headline (igual à do vídeo da Rita) ---------- */
const Headline: React.FC<{ kicker?: string; fino: string; forte: string; dur: number }> = ({ kicker = "TRABALHADOR RURAL", fino, forte, dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 12], [0, 1], { ...cl, easing: EXPO });
  const b = spring({ frame: f - 6, fps: FPS, config: { damping: 12, mass: 0.6 } });
  const fio = interpolate(f, [4, 22], [0, 1], { ...cl, easing: EXPO });
  const sai = interpolate(f, [fr(dur) - 8, fr(dur)], [1, 0], cl);
  const tam = Math.min(132, Math.floor(1700 / Math.max(6, forte.length)));
  return (
    <AbsoluteFill style={{ fontFamily, opacity: sai }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(20,20,20,0) 52%,rgba(20,20,20,.72) 80%)", opacity: a }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1310 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 70 * fio, height: 3, background: CHAMPANHE }} />
          <div style={{ fontSize: 22, letterSpacing: "0.3em", fontWeight: 700, color: CHAMPANHE, opacity: fio }}>{kicker}</div>
        </div>
        <div style={{ marginTop: 14, fontSize: 80, lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 200, fontStyle: "italic", color: "#fff", opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>{fino}</div>
        <div style={{ fontSize: tam, lineHeight: 0.95, letterSpacing: "-0.055em", fontWeight: 900, fontStyle: "italic", color: CHAMPANHE, transform: `translateX(${(1 - b) * -80}px) scale(${0.85 + 0.15 * b})`, transformOrigin: "left center", opacity: Math.min(1, b * 1.3), textShadow: "0 0 24px rgba(230,211,184,.45)" }}>{forte}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- selo INSS (tipográfico, sem a logomarca oficial) ---------- */
const SeloINSS: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f, fps: FPS, config: { damping: 11, mass: 0.5 } });
  const sai = interpolate(f, [fr(dur) - 8, fr(dur)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", right: 60, top: 220, fontFamily, opacity: Math.min(1, e * 1.3) * sai, transform: `scale(${e}) rotate(${(1 - e) * 8}deg)`, transformOrigin: "right top" }}>
      <div style={{ background: OFF, borderRadius: 26, padding: "18px 26px", boxShadow: "0 18px 40px rgba(0,0,0,.3)", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: GRAFITE, color: "#fff", fontSize: 30, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>§</div>
        <div>
          <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-0.03em", color: GRAFITE, lineHeight: 1 }}>INSS</div>
          <div style={{ fontSize: 15, letterSpacing: "0.12em", fontWeight: 600, color: TAUPE, marginTop: 4 }}>SEGURO SOCIAL</div>
        </div>
      </div>
    </div>
  );
};

/* ---------- fileira de cards (benefícios / provas) ---------- */
const Cards: React.FC<{ titulo: string; itens: [string, string][]; dur: number }> = ({ titulo, itens, dur }) => {
  const f = useCurrentFrame();
  const sai = interpolate(f, [fr(dur) - 8, fr(dur)], [1, 0], cl);
  const t = interpolate(f, [0, 10], [0, 1], { ...cl, easing: EXPO });
  return (
    <AbsoluteFill style={{ fontFamily, opacity: sai }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(20,20,20,0) 50%,rgba(20,20,20,.7) 78%)", opacity: t }} />
      <div style={{ position: "absolute", left: 70, top: 1250, fontSize: 22, letterSpacing: "0.3em", fontWeight: 700, color: CHAMPANHE, opacity: t }}>{titulo}</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1300, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {itens.map(([ic, txt], i) => {
          const sp = spring({ frame: f - 4 - i * 4, fps: FPS, config: { damping: 12, mass: 0.5 } });
          return (
            <div key={i} style={{ background: i % 3 === 0 ? GRAFITE : OFF, color: i % 3 === 0 ? "#fff" : GRAFITE, borderRadius: 22, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16,
              boxShadow: "0 16px 36px rgba(0,0,0,.3)", transform: `translateY(${(1 - sp) * 120}px) rotate(${(1 - sp) * 5}deg)`, opacity: Math.min(1, sp * 1.5) }}>
              <span style={{ fontSize: 44 }}>{ic}</span>
              <span style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{txt}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const S = (t: number, nome: string, v: number) => <Sequence from={fr(t)}><Audio src={staticFile(`sfx/${nome}.wav`)} volume={v} /></Sequence>;
const Q = (t0: number, t1: number, el: React.ReactNode) => <Sequence from={fr(t0)} durationInFrames={fr(t1 - t0)}>{el}</Sequence>;

export const Negado: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={camera(f)}><OffthreadVideo src={staticFile("video.mp4")} /></AbsoluteFill>
      {Q(0.1, 4.0, <Headline kicker="PARA ADVOGADOS" fino="chegou com a" forte="CARTA NEGADA?" dur={3.9} />)}
      {Q(6.8, 11.95, <Headline kicker="PRIMEIRO PASSO" fino="analise o" forte="MOTIVO DA NEGATIVA." dur={5.15} />)}
      {Q(19.3, 25.9, <Headline kicker="FALHA DO CLIENTE?" fino="esse processo" forte="NÃO VAI PRA JUSTIÇA." dur={6.6} />)}
      {Q(26.3, 30.9, <Headline kicker="ESFERA ADMINISTRATIVA" fino="faça um" forte="NOVO PEDIDO." dur={4.6} />)}
      {Q(31.3, 37.7, <Headline kicker="MAS ATENÇÃO" fino="foi negado" forte="POR ERRO DO INSS?" dur={6.4} />)}
      {Q(34.2, 37.7, <SeloINSS dur={3.5} />)}
      {Q(37.8, 48.5, <Cards titulo="QUANDO O INSS ERROU" dur={10.7} itens={[["📎", "Documentos completos"], ["🩺", "Perícia com os laudos"], ["🧾", "Incapacidade comprovada"], ["❌", "E mesmo assim negou"]]} />)}
      {Q(48.6, 54.6, <Headline kicker="AÍ SIM" fino="tem respaldo pra" forte="JUDICIALIZAR." dur={6.0} />)}
      {Q(54.7, 64.78, <Headline kicker="ATENÇÃO" fino="carta negada, sozinha," forte="NÃO É MUNIÇÃO." dur={10.08} />)}
      {/* sons fortes (regra de 14/10) */}
      {S(0.0, "whoosh-grave-impacto", 0.6)}{S(0.3, "thump2", 0.65)}
      {S(6.55, "whoosh-grave", 0.6)}{S(7.0, "thump", 0.7)}
      {S(19.05, "whoosh-grave", 0.6)}{S(19.5, "thump2", 0.7)}
      {S(23.95, "whoosh-grave-impacto", 0.7)}
      {S(26.05, "whoosh-grave", 0.6)}{S(26.5, "thump", 0.65)}
      {S(31.05, "whoosh-grave", 0.6)}{S(31.5, "thump2", 0.7)}
      {S(34.1, "pop", 0.45)}
      {S(37.5, "whoosh-grave-cards", 0.7)}
      {[0, 1, 2, 3].map((i) => <React.Fragment key={`c${i}`}>{S(37.95 + i * 0.13, `card-${i + 1}`, 0.5)}</React.Fragment>)}
      {S(48.35, "whoosh-grave-impacto", 0.7)}{S(48.8, "thump", 0.7)}
      {S(54.45, "whoosh-grave", 0.6)}{S(54.9, "thump2", 0.7)}
      {S(58.1, "whoosh-grave-impacto", 0.75)}
    </AbsoluteFill>
  );
};
