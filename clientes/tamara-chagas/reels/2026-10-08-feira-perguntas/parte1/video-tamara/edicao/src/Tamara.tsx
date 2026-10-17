// Quadro da feira · Parte 1 · vídeo da Dra. Tamara respondendo a ligação da Rita (edição da Talyta em public/tamara.mp4)
// Camadas: câmera (zoom in/out nas ênfases) · chamada com a foto da Rita presa ao celular (some quando o celular sai)
// · headlines · selo INSS · cards de benefícios · cards de provas. Estética do escritório.
import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";
import rastreio from "../public/rastreio.json";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = Math.round(51.11 * FPS);
const OFF = "#ECEBE9", GRAFITE = "#141414", TAUPE = "#8C7B6B", CHAMPANHE = "#E6D3B8";
const fr = (s: number) => Math.round(s * FPS);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE = Easing.bezier(0.42, 0, 0.58, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- rastreio do rosto (âncora do celular) ---------- */
type P = { f: number; x: number; y: number; w: number };
const porQuadro: (P | undefined)[] = [];
for (const p of rastreio as P[]) porQuadro[p.f] = p;
function suave(f: number, k: "x" | "y" | "w", raio = 5) {
  let s = 0, peso = 0;
  for (let d = -raio; d <= raio; d++) {
    const p = porQuadro[f + d]; if (!p) continue;
    const w = 0.5 + 0.5 * Math.cos((Math.PI * d) / (raio + 1)); s += p[k] * w; peso += w;
  }
  return peso ? s / peso : k === "w" ? 0.3 : 0.45;
}

/* ---------- câmera: zoom in nas ênfases, zoom out pra respirar ---------- */
// [início, fim, escala, origem y] — a escala sobe com easing e volta no fim
const ZOOMS: [number, number, number, number][] = [
  [10.4, 12.0, 1.14, 0.30],   // "a resposta é NÃO"
  [17.1, 20.9, 1.08, 0.32],   // "a contribuição dele é a atividade..."
  [21.7, 23.4, 1.16, 0.30],   // "essa sim é a VERDADEIRA contribuição"
  [27.8, 29.6, 1.12, 0.30],   // "economia FAMILIAR"
  [41.3, 43.0, 1.1, 0.30],    // "procure um profissional"
  [48.3, 51.1, 1.12, 0.30],   // "...desse tipo de aposentadoria"
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

/* ---------- chamada com a Rita (some quando o celular sai de quadro, ~0,95 s) ---------- */
const Chamada: React.FC = () => {
  const f = useCurrentFrame();
  const fx = suave(f, "x"), fy = suave(f, "y"), fw = suave(f, "w");
  // celular na orelha direita da tela: âncora na borda do rosto; cartão acima dele, sobre o fundo
  const px = (fx + fw * 0.55) * 1080, py = (fy - fw * 0.15) * 1920;
  const e = spring({ frame: f, fps: FPS, config: { damping: 13, mass: 0.5 } });
  const sai = interpolate(f, [24, 34], [1, 0], { ...cl, easing: EASE }); // celular desce em ~0,9–1,1 s
  const seg = 160 + Math.floor(f / FPS); // continua a ligação do vídeo da Rita (terminou em ~02:33)
  const tempo = `${String(Math.floor(seg / 60)).padStart(2, "0")}:${String(seg % 60).padStart(2, "0")}`;
  const anel = (f % 40) / 40;
  const x = Math.min(Math.max(px - 140, 60), 1080 - 330);
  return (
    <div style={{ position: "absolute", left: x, top: py - 470, width: 300, fontFamily, opacity: Math.min(1, e * 1.4) * sai,
      transform: `translateY(${(1 - sai) * 30}px) scale(${(0.7 + 0.3 * e) * 1.18})`, transformOrigin: "center bottom" }}>
      <div style={{ padding: "10px 10px 6px", filter: "drop-shadow(0 4px 14px rgba(0,0,0,.55))" }}>
        <div style={{ position: "relative", width: 112, height: 112, margin: "0 auto" }}>
          {[0, 0.5].map((d) => { const k = (anel + d) % 1;
            return <div key={d} style={{ position: "absolute", inset: -k * 26, borderRadius: "50%", border: `3px solid ${CHAMPANHE}`, opacity: (1 - k) * 0.9 }} />; })}
          <Img src={staticFile("rita.jpg")} style={{ width: 112, height: 112, borderRadius: "50%", objectFit: "cover", border: "4px solid #fff" }} />
        </div>
        <div style={{ marginTop: 14, textAlign: "center", fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>Rita</div>
        <div style={{ marginTop: 2, textAlign: "center", fontSize: 16, letterSpacing: "0.2em", fontWeight: 700, color: CHAMPANHE, textShadow: "0 2px 8px rgba(0,0,0,.7)" }}>FINANCEIRO</div>
        <div style={{ marginTop: 2, textAlign: "center", fontSize: 16, letterSpacing: "0.2em", fontWeight: 600, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,.7)" }}>EM CHAMADA · {tempo}</div>
        <div style={{ marginTop: 12, height: 30, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          {Array.from({ length: 13 }).map((_, i) => {
            const silaba = 0.35 + 0.65 * Math.abs(Math.sin(f * 0.21) * Math.sin(f * 0.07 + 1.3));
            const h = 5 + silaba * (8 + 22 * Math.abs(Math.sin(f * 0.9 + i * 1.7) * Math.cos(f * 0.37 + i * 0.6)));
            return <div key={i} style={{ width: 5, height: h, borderRadius: 3, background: "#fff", opacity: 0.95, boxShadow: "0 0 8px rgba(0,0,0,.35)" }} />;
          })}
        </div>
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

export const Tamara: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={camera(f)}><OffthreadVideo src={staticFile("tamara.mp4")} /></AbsoluteFill>
      {Q(0, 1.25, <Chamada />)}
      {Q(5.7, 9.85, <Headline fino="precisa contribuir" forte="MÊS A MÊS?" dur={4.15} />)}
      {Q(10.4, 12.0, <Headline fino="a resposta é" forte="NÃO." dur={1.6} />)}
      {Q(14.8, 20.9, <SeloINSS dur={6.1} />)}
      {Q(17.1, 23.4, <Headline fino="a contribuição dele é" forte="O TRABALHO NA ROÇA." dur={6.3} />)}
      {Q(25.0, 29.6, <Headline kicker="ATENÇÃO" fino="tem que ser em regime de" forte="ECONOMIA FAMILIAR." dur={4.6} />)}
      {Q(29.6, 33.8, <Cards titulo="BENEFÍCIOS DO TRABALHADOR RURAL" dur={4.2} itens={[["👵", "Aposentadoria rural"], ["🩺", "Auxílio-doença"], ["🤱", "Salário-maternidade"], ["🕊️", "Pensão por morte"]]} />)}
      {Q(37.0, 41.3, <Cards titulo="EXEMPLOS DE PROVAS" dur={4.3} itens={[["🧾", "Nota de venda da produção"], ["📒", "Bloco do produtor rural"], ["📄", "Contrato de parceria"], ["🏡", "Documento da terra"]]} />)}
      {Q(41.3, 45.6, <Headline kicker="CADA CASO É ÚNICO" fino="procure um" forte="PROFISSIONAL." dur={4.3} />)}
      {/* sons: um pra cada tipo de animação */}
      {S(0, "chamada-desliga", 0.0)}
      {S(0.95, "chamada-desliga", 0.2)}
      {S(5.55, "whoosh-grave", 0.55)}{S(5.95, "thump2", 0.65)}
      {S(10.35, "whoosh-grave-impacto", 0.75)}
      {S(14.8, "pop", 0.4)}
      {S(17.0, "whoosh-grave", 0.55)}{S(17.4, "thump", 0.7)}
      {S(21.7, "riser", 0.25)}{S(22.4, "shimmer", 0.3)}
      {S(24.9, "whoosh-grave", 0.6)}{S(25.3, "thump2", 0.65)}
      {S(29.3, "whoosh-grave-cards", 0.65)}
      {[0, 1, 2, 3].map((i) => <React.Fragment key={`b${i}`}>{S(29.75 + i * 0.13, `card-${i + 1}`, 0.5)}</React.Fragment>)}
      {S(36.7, "whoosh-grave-cards", 0.65)}
      {[0, 1, 2, 3].map((i) => <React.Fragment key={`p${i}`}>{S(37.15 + i * 0.13, `card-${i + 2}`, 0.5)}</React.Fragment>)}
      {S(41.2, "whoosh-grave", 0.55)}{S(41.6, "thump", 0.7)}
    </AbsoluteFill>
  );
};
