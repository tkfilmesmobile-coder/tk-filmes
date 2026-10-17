// Dra. Tamara · "Pensão por morte pro filho maior de idade com autismo" (bruto já cortado pela Talyta, 15/10/2026)
// Camadas: câmera (zoom nas ênfases) · headlines · cards · selo INSS. Estética do escritório.
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = Math.round(63.88 * FPS);
const OFF = "#ECEBE9", GRAFITE = "#141414", TAUPE = "#8C7B6B", CHAMPANHE = "#E6D3B8";
const fr = (s: number) => Math.round(s * FPS);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE = Easing.bezier(0.42, 0, 0.58, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- câmera: zoom in nas ênfases, zoom out pra respirar ---------- */
// [início, fim, escala, origem y] — a escala sobe com easing e volta no fim
const ZOOMS: [number, number, number, number][] = [
  [14.0, 16.0, 1.12, 0.3],   // "mas ele é autista"
  [27.4, 30.9, 1.1, 0.3],    // "é devida, inclusive de forma vitalícia"
  [47.6, 49.8, 1.12, 0.3],   // "após os 21 anos de idade"
  [61.1, 63.88, 1.1, 0.3],   // "as pessoas acham que não têm direito"
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

export const Pensao: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={camera(f)}><OffthreadVideo src={staticFile("video.mp4")} /></AbsoluteFill>
      {Q(0.1, 2.45, <Headline kicker="PENSÃO POR MORTE" fino="olha que caso" forte="INTERESSANTE." dur={2.35} />)}
      {Q(9.7, 15.95, <Headline kicker="PENSÃO POR MORTE" fino="filho maior de idade," forte="COM AUTISMO." dur={6.25} />)}
      {Q(18.8, 25.6, <Cards titulo="PRA TER DIREITO" dur={6.8} itens={[["🧾", "Qualidade de dependente"], ["🪪", "Pai segurado na data do óbito"], ["🩺", "Laudo da deficiência"], ["📄", "Certidão de óbito"]]} />)}
      {Q(25.75, 31.1, <Headline kicker="NESSE CASO" fino="a pensão é devida" forte="E PODE SER VITALÍCIA." dur={5.35} />)}
      {Q(33.45, 41.2, <Headline kicker="ATENÇÃO" fino="muita gente acha que" forte="NÃO TEM DIREITO." dur={7.75} />)}
      {Q(38.9, 41.2, <SeloINSS dur={2.3} />)}
      {Q(43.7, 49.8, <Headline kicker="CASO ATÍPICO" fino="paternidade descoberta" forte="DEPOIS DOS 21." dur={6.1} />)}
      {Q(50.1, 56.0, <Headline kicker="CASO ATÍPICO" fino="exame de DNA depois que" forte="O PAI FALECEU." dur={5.9} />)}
      {Q(61.1, 63.88, <Headline kicker="PENSÃO POR MORTE" fino="na dúvida," forte="PROCURE ORIENTAÇÃO." dur={2.78} />)}
      {/* sons fortes (regra de 14/10) */}
      {S(0.0, "whoosh-grave-impacto", 0.6)}{S(0.3, "thump2", 0.65)}
      {S(9.45, "whoosh-grave", 0.6)}{S(9.9, "thump2", 0.7)}
      {S(13.9, "whoosh-grave-impacto", 0.7)}
      {S(18.5, "whoosh-grave-cards", 0.7)}
      {[0, 1, 2, 3].map((i) => <React.Fragment key={`c${i}`}>{S(18.95 + i * 0.13, `card-${i + 1}`, 0.5)}</React.Fragment>)}
      {S(25.5, "whoosh-grave", 0.6)}{S(25.95, "thump", 0.7)}
      {S(33.2, "whoosh-grave", 0.6)}{S(33.65, "thump2", 0.7)}
      {S(38.7, "pop", 0.45)}
      {S(43.45, "whoosh-grave", 0.6)}{S(43.9, "thump", 0.7)}
      {S(47.5, "whoosh-grave-impacto", 0.7)}
      {S(49.85, "whoosh-grave", 0.6)}{S(50.3, "thump2", 0.7)}
      {S(60.85, "whoosh-grave-impacto", 0.75)}{S(61.3, "thump", 0.7)}
    </AbsoluteFill>
  );
};
