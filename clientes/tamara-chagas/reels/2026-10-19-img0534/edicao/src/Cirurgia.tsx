// Dra. Tamara · "Cirurgia estética dá direito a benefício do INSS?" (IMG_0534, 19/10/2026)
// Corte: 0–60,05 s e 75,45–119,35 s do bruto (corte logo depois da última fala) (sai o trecho fora da gravação, "deixa eu botar... depois eu corto").
// Camadas: câmera (zoom nas ênfases) · headlines · cards · selo INSS. Estética do escritório.
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";
import { Enfermeira } from "./Enfermeira";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = Math.round((60.05 + 119.35 - 75.45) * FPS);
const OFF = "#ECEBE9", GRAFITE = "#141414", TAUPE = "#8C7B6B", CHAMPANHE = "#E6D3B8";
const fr = (s: number) => Math.round(s * FPS);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE = Easing.bezier(0.42, 0, 0.58, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- câmera: zoom in nas ênfases, zoom out pra respirar ---------- */
// [início, fim, escala, origem y] — a escala sobe com easing e volta no fim
const ZOOMS: [number, number, number, number][] = [
  [37.6, 41.8, 1.1, 0.28],   // "impossibilita o segurado de exercer a sua atividade"
  [76.4, 81.8, 1.12, 0.28],  // "e sim, tem direito ao benefício por incapacidade"
  [99.0, 105.2, 1.08, 0.28], // carência mínima... "em decorrência dessa cirurgia"
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

/* ---------- áudio que chegou (bolha de áudio + transcrição) · ilustrativo, sem identificar quem mandou ---------- */
const CEL = { x: 350, y: 1160 }; // onde está o celular na mão dela (quadro 1080x1920)
const AudioCard: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const entra = spring({ frame: f, fps: FPS, config: { damping: 14, mass: 0.7 } });
  const sai = spring({ frame: f - (fr(dur) - 12), fps: FPS, config: { damping: 16, mass: 0.6 } });
  const k = Math.max(0, entra - sai); // 0 = dentro do celular · 1 = no lugar
  const prog = interpolate(f, [0, fr(dur) - 10], [0, 1], cl);
  const barras = Array.from({ length: 34 }, (_, i) => 10 + Math.abs(Math.sin(i * 1.7) * 30) + (i % 5) * 4);
  // o cartão nasce no celular (pequeno) e vai pro lugar dele, abaixo do celular e longe do rosto
  const CX = 540, CY = 1460;
  const dx = (CEL.x - CX) * (1 - k), dy = (CEL.y - CY) * (1 - k);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1300, fontFamily, opacity: Math.min(1, k * 2.5),
      transform: `translate(${dx}px, ${dy}px) scale(${0.08 + 0.92 * k})`, transformOrigin: "50% 50%", filter: `blur(${(1 - k) * 6}px)` }}>
      <div style={{ fontSize: 22, letterSpacing: "0.3em", fontWeight: 700, color: CHAMPANHE, marginBottom: 14, textShadow: "0 2px 10px rgba(0,0,0,.5)" }}>DÚVIDA QUE CHEGOU NO ESCRITÓRIO</div>
      <div style={{ background: "#fff", borderRadius: 30, padding: "24px 28px", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: GRAFITE, color: "#fff", fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>▶</div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5, height: 60 }}>
            {barras.map((h, i) => <div key={i} style={{ width: 7, height: h, borderRadius: 4, background: i / barras.length < prog ? TAUPE : "#d9d4cf" }} />)}
          </div>
          <div style={{ fontSize: 24, color: "#8e8e8e", fontWeight: 600 }}>🎤 0:13</div>
        </div>
        <div style={{ marginTop: 18, fontSize: 32, lineHeight: 1.3, color: "#222", fontStyle: "italic" }}>“Acabei de fazer uma cirurgia estética… tenho direito a dar entrada no benefício do INSS? É verdade?”</div>
      </div>
    </div>
  );
};

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

const P1 = 60.05, A2 = 75.45, FIM = 119.35;
const o = (src: number) => (src < P1 ? src : P1 + (src - A2)); // tempo do bruto -> tempo do vídeo editado

export const Cirurgia: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={camera(f)}>
        <Sequence durationInFrames={fr(P1)}><OffthreadVideo src={staticFile("video.mp4")} trimAfter={fr(P1)} /></Sequence>
        <Sequence from={fr(P1)}><OffthreadVideo src={staticFile("video.mp4")} trimBefore={fr(A2)} trimAfter={fr(FIM)} /></Sequence>
      </AbsoluteFill>
      {Q(5.8, 18.6, <AudioCard dur={12.8} />)}
      {Q(20.3, 30.4, <Headline kicker="CIRURGIA ESTÉTICA" fino="dá direito a" forte="BENEFÍCIO DO INSS?" dur={10.1} />)}
      {Q(31.4, 41.9, <Headline kicker="O QUE IMPORTA" fino="se a cirurgia impede de" forte="TRABALHAR." dur={10.5} />)}
      {Q(42.5, 60.0, <Enfermeira dur={17.5} />)}
      {Q(o(86.6), o(91.3), <Headline kicker="ATENÇÃO" fino="muita gente acha que" forte="NÃO TEM DIREITO." dur={91.3 - 86.6} />)}
      {Q(o(91.9), o(97.4), <Headline kicker="A RESPOSTA" fino="benefício por incapacidade:" forte="TEM DIREITO, SIM." dur={97.4 - 91.9} />)}
      {Q(o(98.0), o(119.2), <Cards titulo="2 REQUISITOS NO INSS" dur={119.2 - 98.0} itens={[["🪪", "1 · Qualidade de segurado"], ["📅", "2 · Carência: 12 contribuições"]]} />)}
      {Q(o(101.4), o(105.5), <SeloINSS dur={4.1} />)}
      {/* sons fortes (regra de 14/10) */}
      {S(1.2, "notificacao", 0.65)}{S(5.6, "whoosh-grave", 0.6)}{S(18.1, "whoosh-grave", 0.6)} {/* whoosh grave na entrada e na saída do áudio */} {/* toque de notificação enviado pela Talyta (Download (8).mp4, 1,80–3,55 s); toca antes de ela olhar pro celular */}
      {S(20.05, "whoosh-grave", 0.6)}{S(20.5, "thump2", 0.7)}
      {S(31.15, "whoosh-grave", 0.6)}{S(31.6, "thump", 0.7)}
      {S(37.5, "whoosh-grave-impacto", 0.7)}
      {S(42.2, "whoosh-grave", 0.65)}{S(42.6, "pop", 0.4)}
      {S(44.5, "shimmer", 0.35)}                                 {/* emagrece */}
      {S(51.35, "whoosh-grave", 0.5)}                            {/* hospital */}
      {S(57.2, "whoosh-grave", 0.55)}                            {/* ergue os braços */}
      {S(58.3, "whoosh-grave-impacto", 0.75)}{S(58.55, "thump2", 0.7)} {/* X */}
      {S(o(86.35), "whoosh-grave", 0.6)}{S(o(86.8), "thump2", 0.7)}
      {S(o(91.65), "whoosh-grave-impacto", 0.75)}{S(o(92.1), "thump", 0.7)}
      {S(o(97.7), "whoosh-grave-cards", 0.7)}
      {[0, 1].map((i) => <React.Fragment key={`b${i}`}>{S(o(98.15) + i * 0.13, `card-${i + 1}`, 0.5)}</React.Fragment>)}
      {S(o(101.3), "pop", 0.45)}
    </AbsoluteFill>
  );
};
