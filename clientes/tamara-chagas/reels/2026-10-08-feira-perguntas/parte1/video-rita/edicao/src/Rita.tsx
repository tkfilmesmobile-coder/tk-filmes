// Quadro da feira · Parte 1 · vídeo da Rita no escritório (edição da Talyta já cortada em public/rita.mp4)
// Camadas: (1) miniatura do Reels da feira quando ela cita o vídeo · (2) headline nos "benefícios"
// (3) cartão de chamada com a foto da Tamara rastreando o celular durante a ligação.
// Estética do escritório: off-white #ECEBE9, grafite #141414, taupe #8C7B6B, champanhe #E6D3B8, Inter fino + negrito.
import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";
import rastreio from "../public/rastreio.json";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = Math.round(65.27 * FPS);
const OFF = "#ECEBE9", GRAFITE = "#141414", TAUPE = "#8C7B6B", CHAMPANHE = "#E6D3B8";
const fr = (s: number) => Math.round(s * FPS);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---- tempos (s), da transcrição palavra a palavra ----
export const T = {
  feira: [0.15, 5.4] as const,            // "vídeo da feira deu o que falar..."
  benef1: [9.35, 13.2] as const,          // "...conseguir qualquer tipo de benefício quem é trabalhador rural"
  chamada: [19.85, 39.25] as const,       // celular no ouvido
  benef2: [37.15, 40.4] as const,         // "...com as provas que ele tem já concede um benefício"
};

/* -------- rastreio suavizado (janela de Hann) -------- */
type P = { f: number; x: number; y: number; w: number };
const pts = rastreio as P[];
const porQuadro: (P | undefined)[] = [];
for (const p of pts) porQuadro[p.f] = p;
function suave(f: number, k: "x" | "y" | "w", raio = 7) {
  let s = 0, peso = 0;
  for (let d = -raio; d <= raio; d++) {
    const p = porQuadro[f + d];
    if (!p) continue;
    const w = 0.5 + 0.5 * Math.cos((Math.PI * d) / (raio + 1));
    s += p[k] * w; peso += w;
  }
  return peso ? s / peso : k === "w" ? 0.24 : 0.45;
}

/* -------- (1) miniatura do vídeo da feira -------- */
const Miniatura: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 10], [0, 1], { ...cl, easing: EXPO });
  const s = interpolate(f, [fr(dur) - 12, fr(dur)], [1, 0], cl);
  const o = Math.min(e, s);
  return (
    <div style={{ position: "absolute", right: 56, top: 900, width: 380, fontFamily, opacity: o, transform: `translateY(${(1 - e) * 40}px) scale(${0.94 + 0.06 * e}) rotate(${-2 + 2 * e}deg)`, transformOrigin: "right bottom" }}>
      <div style={{ display: "inline-flex", borderRadius: 999, overflow: "hidden", fontSize: 17, letterSpacing: "0.2em", fontWeight: 700, marginBottom: 12, boxShadow: "0 8px 20px rgba(0,0,0,.25)" }}>
        <span style={{ background: GRAFITE, color: "#fff", padding: "8px 14px" }}>PARTE 1</span>
        <span style={{ background: OFF, color: GRAFITE, padding: "8px 16px" }}>VÍDEO DA FEIRA</span>
      </div>
      <div style={{ width: 380, height: 676, borderRadius: 28, overflow: "hidden", border: `6px solid ${OFF}`, boxShadow: "0 30px 60px rgba(0,0,0,.45)", background: "#000" }}>
        <OffthreadVideo src={staticFile("feira.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
};

/* -------- (2) headline -------- */
const Headline: React.FC<{ fino: string; forte: string; dur: number }> = ({ fino, forte, dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 12], [0, 1], { ...cl, easing: EXPO });
  const b = spring({ frame: f - 6, fps: FPS, config: { damping: 12, mass: 0.6 } });
  const fio = interpolate(f, [4, 22], [0, 1], { ...cl, easing: EXPO });
  const sai = interpolate(f, [fr(dur) - 8, fr(dur)], [1, 0], cl);
  return (
    <AbsoluteFill style={{ fontFamily, opacity: sai }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(20,20,20,0) 52%,rgba(20,20,20,.72) 80%)", opacity: a }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1310 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 70 * fio, height: 3, background: CHAMPANHE }} />
          <div style={{ fontSize: 22, letterSpacing: "0.3em", fontWeight: 700, color: CHAMPANHE, opacity: fio }}>TRABALHADOR RURAL</div>
        </div>
        <div style={{ marginTop: 14, fontSize: 84, lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 200, fontStyle: "italic", color: "#fff", opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>{fino}</div>
        <div style={{ fontSize: 132, lineHeight: 0.95, letterSpacing: "-0.055em", fontWeight: 900, fontStyle: "italic", color: CHAMPANHE, transform: `translateX(${(1 - b) * -80}px) scale(${0.85 + 0.15 * b})`, transformOrigin: "left center", opacity: Math.min(1, b * 1.3), textShadow: "0 0 24px rgba(230,211,184,.45)" }}>{forte}</div>
      </div>
    </AbsoluteFill>
  );
};

/* -------- (3) cartão de chamada preso ao celular -------- */
const Chamada: React.FC<{ ini: number; dur: number }> = ({ ini, dur }) => {
  const f = useCurrentFrame(), abs = fr(ini) + f;
  const fx = suave(abs, "x"), fy = suave(abs, "y"), fw = suave(abs, "w");
  // celular fica à direita do rosto (na tela): âncora no lado do rosto, cartão logo depois dele
  const px = (fx + fw * 0.62) * 1080, py = (fy + 0.02) * 1920;
  const e = spring({ frame: f, fps: FPS, config: { damping: 13, mass: 0.6 } });
  const sai = interpolate(f, [fr(dur) - 10, fr(dur)], [1, 0], cl);
  const seg = 134 + Math.floor(f / FPS); // chamada já em andamento: começa em 02:14
  const tempo = `${String(Math.floor(seg / 60)).padStart(2, "0")}:${String(seg % 60).padStart(2, "0")}`;
  const falaT = true; // barrinhas sempre em movimento, como voz saindo do telefone
  const anel = (f % 40) / 40;
  const x = Math.min(px + 24, 1080 - 330);
  return (
    <div style={{ position: "absolute", left: x, top: py - 120, width: 300, fontFamily, opacity: Math.min(1, e * 1.4) * sai, transform: `scale(${(0.7 + 0.3 * e) * 1.18})`, transformOrigin: "left center" }}>
      {/* fio ligando o cartão ao celular */}
      <div style={{ position: "absolute", left: -24, top: 116, width: 24, height: 2, background: CHAMPANHE }} />
      <div style={{ padding: "10px 10px 6px", filter: "drop-shadow(0 4px 14px rgba(0,0,0,.55))" }}>
        <div style={{ position: "relative", width: 112, height: 112, margin: "0 auto" }}>
          {[0, 0.5].map((d) => {
            const k = (anel + d) % 1;
            return <div key={d} style={{ position: "absolute", inset: -k * 26, borderRadius: "50%", border: `3px solid ${CHAMPANHE}`, opacity: falaT ? (1 - k) * 0.9 : 0.15 }} />;
          })}
          <Img src={staticFile("tamara.jpg")} style={{ width: 112, height: 112, borderRadius: "50%", objectFit: "cover", objectPosition: "50% 18%", border: `4px solid #fff` }} />
        </div>
        <div style={{ marginTop: 14, textAlign: "center", fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>Dra. Tamara</div>
        <div style={{ marginTop: 2, textAlign: "center", fontSize: 18, letterSpacing: "0.2em", fontWeight: 700, color: CHAMPANHE, textShadow: "0 2px 8px rgba(0,0,0,.7)" }}>EM CHAMADA · {tempo}</div>
        <div style={{ marginTop: 14, height: 30, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          {Array.from({ length: 13 }).map((_, i) => {
            const silaba = 0.35 + 0.65 * Math.abs(Math.sin(f * 0.21) * Math.sin(f * 0.07 + 1.3)); // envelope de fala: sobe e desce como frase
            const h = 5 + silaba * (8 + 22 * Math.abs(Math.sin(f * 0.9 + i * 1.7) * Math.cos(f * 0.37 + i * 0.6)));
            return <div key={i} style={{ width: 5, height: h, borderRadius: 3, background: "#fff", opacity: 0.95, boxShadow: "0 0 8px rgba(0,0,0,.35)" }} />;
          })}
        </div>
      </div>
    </div>
  );
};

// trechos em que a voz da Tamara aparece no telefone (s, tempo do vídeo final); vem de public/fala-tamara.json
import dados_fala_json from "../public/fala-tamara.json";
const dados_fala = dados_fala_json as number[][];

export const Rita: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <OffthreadVideo src={staticFile("rita.mp4")} />
    <Sequence from={fr(T.feira[0])} durationInFrames={fr(T.feira[1] - T.feira[0])}><Miniatura dur={T.feira[1] - T.feira[0]} /></Sequence>
    <Sequence from={fr(T.benef1[0])} durationInFrames={fr(T.benef1[1] - T.benef1[0])}><Headline fino="precisa contribuir pra ter" forte="BENEFÍCIO?" dur={T.benef1[1] - T.benef1[0]} /></Sequence>
    <Sequence from={fr(T.chamada[0])} durationInFrames={fr(T.chamada[1] - T.chamada[0])}><Chamada ini={T.chamada[0]} dur={T.chamada[1] - T.chamada[0]} /></Sequence>
    <Sequence from={fr(T.benef2[0])} durationInFrames={fr(T.benef2[1] - T.benef2[0])}><Headline fino="com as provas, sai o" forte="BENEFÍCIO." dur={T.benef2[1] - T.benef2[0]} /></Sequence>
    {/* sons */}
    <Sequence from={fr(T.feira[0])}><Audio src={staticFile("sfx/whoosh-forte.wav")} volume={0.4} /></Sequence>
    <Sequence from={fr(T.feira[1]) - 12}><Audio src={staticFile("sfx/swish.wav")} volume={0.3} /></Sequence>
    <Sequence from={fr(T.benef1[0])}><Audio src={staticFile("sfx/riser.wav")} volume={0.25} /></Sequence>
    <Sequence from={fr(T.benef1[0]) + 8}><Audio src={staticFile("sfx/thump.wav")} volume={0.5} /></Sequence>
    <Sequence from={fr(T.chamada[0]) - 6}><Audio src={staticFile("sfx/chamada-conecta.wav")} volume={0.22} /></Sequence>
    <Sequence from={fr(T.chamada[1]) - 6}><Audio src={staticFile("sfx/chamada-desliga.wav")} volume={0.22} /></Sequence>
    <Sequence from={fr(T.benef2[0])}><Audio src={staticFile("sfx/shimmer.wav")} volume={0.35} /></Sequence>
    <Sequence from={fr(T.benef2[0]) + 6}><Audio src={staticFile("sfx/thump2.wav")} volume={0.5} /></Sequence>
  </AbsoluteFill>
);
