// "Um dia na TK" (2026-10-29): montagem só de b-roll no estilo de diário de estúdio.
// Referência: reels de home studio (Daniel Kelaart, via Cosmos): luz quente e baixa, cortes de ~1 s,
// closes de mão/teclado/tela, câmera lenta leve, um horário pequeno na tela e um plano aberto longo no fim.
// Os trechos já recortados e enquadrados estão em public/dia/ (scripts/cortar-dia.ps1).
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", { weights: ["500", "600"], subsets: ["latin"] });

type Plano = { arq: string; dur: number; vel: number; zoom?: [number, number]; origem?: string };
// vel: 0.8 nos clipes de 30 fps, 0.5 nos de 60 fps (câmera lenta sem quadro repetido)
export const PLANOS: Plano[] = [
  { arq: "s01-touchpad", dur: 38, vel: 0.8, zoom: [1.06, 1.0] },
  { arq: "s02-mesa", dur: 26, vel: 0.8, zoom: [1.0, 1.04] },
  { arq: "s03-teclado", dur: 22, vel: 0.8, zoom: [1.04, 1.0] },
  { arq: "s04-monitor", dur: 24, vel: 0.8, zoom: [1.0, 1.05], origem: "40% 45%" },
  { arq: "s05-celular", dur: 24, vel: 0.8, zoom: [1.05, 1.0] },
  { arq: "s06-mouse", dur: 19, vel: 0.8, zoom: [1.0, 1.04] },
  { arq: "s07-pensando", dur: 34, vel: 0.8, zoom: [1.0, 1.05], origem: "30% 40%" },
  { arq: "s08-gravando", dur: 22, vel: 0.5, zoom: [1.04, 1.0] },
  { arq: "s09-camera", dur: 22, vel: 0.5, zoom: [1.0, 1.04] },
  { arq: "s10-ceu", dur: 24, vel: 0.5, zoom: [1.04, 1.0] },
  { arq: "s11-digitando", dur: 24, vel: 0.8, zoom: [1.0, 1.04] },
  { arq: "s13-final", dur: 110, vel: 0.8, zoom: [1.0, 1.03] },
];
// horário pequeno na tela, como no diário da referência (em frames do vídeo)
const HORAS: { de: number; ate: number; texto: string }[] = [];
const inicio = (i: number) => PLANOS.slice(0, i).reduce((s, p) => s + p.dur, 0);
HORAS.push({ de: 6, ate: 38, texto: "07:40" });
HORAS.push({ de: inicio(7) + 2, ate: inicio(8) + 22, texto: "14:00" });
HORAS.push({ de: inicio(10) + 2, ate: inicio(11) + 30, texto: "21:10" });
export const DURACAO_DIA = inicio(PLANOS.length);

// cor: puxa o roxo da luz RGB e o dia nublado pro mesmo marrom quente da marca, com contraste baixo e preto lavado
const GRADE = "sepia(0.34) saturate(0.8) contrast(1.12) brightness(0.8)";

const PlanoVideo: React.FC<{ p: Plano }> = ({ p }) => {
  const f = useCurrentFrame();
  const [z0, z1] = p.zoom ?? [1, 1];
  const z = interpolate(f, [0, p.dur], [z0, z1]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo src={staticFile(`dia/${p.arq}.mp4`)} muted playbackRate={p.vel}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: GRADE, transform: `scale(${z})`, transformOrigin: p.origem ?? "50% 50%" }} />
    </AbsoluteFill>
  );
};

const Hora: React.FC<{ texto: string; dur: number }> = ({ texto, dur }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6, dur - 6, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily, fontWeight: 500, fontSize: 40, letterSpacing: "0.06em", color: "#F6EDE4", opacity: o * 0.92,
        textShadow: "0 2px 18px rgba(20,10,6,.55)", transform: "translateY(120px)" }}>{texto}</div>
    </AbsoluteFill>
  );
};

// grão de filme: ruído que muda a cada quadro
const Grao: React.FC = () => {
  const f = useCurrentFrame();
  const seed = (f * 37) % 97;
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.22, pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const UmDia: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fim = durationInFrames;
  const logo = interpolate(f, [fim - 52, fim - 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const apaga = interpolate(f, [fim - 14, fim], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const acende = interpolate(f, [0, 10], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#1E130E" }}>
      {PLANOS.map((p, i) => (
        <Sequence key={p.arq} from={inicio(i)} durationInFrames={p.dur}><PlanoVideo p={p} /></Sequence>
      ))}
      {/* luz de janela quente vindo do alto, como no fim de tarde */}
      <AbsoluteFill style={{ mixBlendMode: "soft-light", background: "radial-gradient(120% 70% at 18% 8%, rgba(255,186,120,.55) 0%, rgba(255,186,120,0) 60%)" }} />
      <AbsoluteFill style={{ mixBlendMode: "multiply", background: "linear-gradient(180deg, rgba(120,70,40,.10), rgba(60,32,20,.22))" }} />
      {/* vinheta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(18,10,6,.55) 100%)" }} />
      <Grao />
      {HORAS.map((h) => (
        <Sequence key={h.texto} from={h.de} durationInFrames={h.ate - h.de}><Hora texto={h.texto} dur={h.ate - h.de} /></Sequence>
      ))}
      {/* assinatura no plano final */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 330 }}>
        <Img src={staticFile("marca/logo-creme.svg")} style={{ height: 70, opacity: logo * 0.95, filter: "drop-shadow(0 2px 16px rgba(20,10,6,.6))" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#1E130E", opacity: Math.max(acende, apaga) }} />
    </AbsoluteFill>
  );
};
