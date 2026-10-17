// Quadro da feira · Parte 1 · vídeo da Dra. Tamara respondendo a ligação da Rita (edição da Talyta em public/tamara.mp4)
// Camadas: câmera (zoom in/out nas ênfases) · chamada com a foto da Rita presa ao celular (some quando o celular sai)
// · headlines · selo INSS · cards de benefícios · cards de provas. Estética do escritório.
import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";
import cameraH from "../public/camera3.json";
import angulo from "../public/angulo.json";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = Math.round(42.24 * FPS);
const OFF = "#ECEBE9", GRAFITE = "#141414", TAUPE = "#8C7B6B", CHAMPANHE = "#E6D3B8";
const fr = (s: number) => Math.round(s * FPS);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE = Easing.bezier(0.42, 0, 0.58, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- câmera: zoom in nas ênfases, zoom out pra respirar ---------- */
// [início, fim, escala, origem y] — a escala sobe com easing e volta no fim
const ZOOMS: [number, number, number, number][] = [
  [10.9, 13.3, 1.12, 0.32],   // "você não pode ser demitido sem justa causa"
  [21.5, 24.1, 1.12, 0.32],   // "a empresa pode fazer a demissão sem justa causa"
  [27.6, 30.0, 1.1, 0.32],    // "o segurado está apto a retornar"
  [38.0, 42.24, 1.12, 0.32],  // "o seu patrão não pode te demitir enquanto você permanecer doente"
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

/* ---------- comentário (estilo "responder comentário" do Instagram) · ilustrativo ---------- */
const Comentario: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f, fps: FPS, config: { damping: 12, mass: 0.6 } });
  const sai = interpolate(f, [fr(dur) - 8, fr(dur)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1040, fontFamily, opacity: Math.min(1, e * 1.3) * sai,
      transform: `translateY(${(1 - e) * 60 + (1 - sai) * 20}px) scale(${0.9 + 0.1 * e}) rotate(${(1 - e) * -3}deg)`, transformOrigin: "center top" }}>
      <div style={{ background: "#fff", borderRadius: 30, padding: "26px 30px 24px", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: "#737373", marginBottom: 16 }}>Responder ao comentário de maria_da.silva87</div>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 74px", width: 74, height: 74, borderRadius: "50%", background: "linear-gradient(135deg,#c9a98a,#8C7B6B)", color: "#fff", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>M</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#111" }}>maria_da.silva87 <span style={{ fontWeight: 400, color: "#8e8e8e", marginLeft: 8 }}>2 h</span></div>
            <div style={{ marginTop: 6, fontSize: 34, lineHeight: 1.3, color: "#111", fontWeight: 400 }}>to afastada pelo inss faz 3 mes por causa da coluna e minha patroa ja disse q qnd eu volta vai me manda embora 😢 ela pode fazer isso??</div>
            <div style={{ marginTop: 12, fontSize: 22, fontWeight: 600, color: "#8e8e8e" }}>Responder &nbsp;·&nbsp; 18 curtidas</div>
          </div>
          <div style={{ fontSize: 30, color: "#8e8e8e", marginTop: 6 }}>♡</div>
        </div>
      </div>
    </div>
  );
};

/* comentário: fixo na frente da Tamara até a porta preta (4,9 s); dali em diante fica preso no espaço
   (homografia da câmera relativa ao quadro 147), ela passa na frente e ele fica pra trás com a sala */
const PORTA = 147;
const NoAmbiente: React.FC<{ children: React.ReactNode; ini: number }> = ({ children, ini }) => {
  const f = useCurrentFrame() + fr(ini); // quadro absoluto do vídeo
  const H = f >= PORTA ? (cameraH as Record<string, number[][]>)[String(Math.min(f, 200))] : null;
  const ang = f >= PORTA ? (angulo as Record<string, number>)[String(Math.min(f, 200))] : 0;
  // trilha da porta (2D) + giro 3D no ângulo da parede da entrada, pivô no centro do card, no vão da entrada
  const m = H ? `matrix(${H[0][0]},0,0,${H[1][1]},${H[0][2]},${H[1][2]}) translate(540px,1220px) perspective(1300px) rotateY(${ang}deg) translate(-540px,-1220px)` : "none";
  const atravessa = interpolate(f, [PORTA - 2, PORTA + 6, PORTA + 18], [1, 0.6, 0.9], { ...cl, easing: EASE });
  const some = interpolate(f, [PORTA + 26, PORTA + 46], [1, 0], { ...cl, easing: EASE }) * atravessa;
  const nevoa = interpolate(f, [PORTA - 2, PORTA + 6, PORTA + 18, PORTA + 26, PORTA + 46], [0, 3, 0.6, 0.6, 10], cl);
  return <AbsoluteFill style={{ transform: m, transformOrigin: "0 0", opacity: some, filter: `blur(${nevoa}px)` }}>{children}</AbsoluteFill>;
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

export const Afastado: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={camera(f)}><OffthreadVideo src={staticFile("video.mp4")} /></AbsoluteFill>
      <Sequence from={fr(0.15)} durationInFrames={PORTA + 47 - fr(0.15)}><NoAmbiente ini={0.15}><Comentario dur={9} /></NoAmbiente></Sequence>
      {/* a Tamara (recortada) passa na frente do comentário */}
      {/* até a porta preta o comentário está na frente; aí ela passa por ele (recorte entra suave) */}
      {f >= PORTA && f < PORTA + 47 && <Img src={staticFile(`fg2/${String(f).padStart(4, "0")}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />}
      {Q(6.6, 13.3, <Headline kicker="ACIDENTE DE TRABALHO" fino="estabilidade de" forte="12 MESES." dur={6.7} />)}
      {Q(18.8, 24.1, <Headline kicker="ATENÇÃO" fino="teve alta e não foi acidente?" forte="PODE DEMITIR." dur={5.3} />)}
      {Q(25.3, 28.6, <SeloINSS dur={3.3} />)}
      {Q(25.3, 30.0, <Headline kicker="MAS ATENÇÃO" fino="alta do INSS nem sempre é" forte="ESTAR APTO." dur={4.7} />)}
      {Q(32.3, 37.7, <Cards titulo="NESSA SITUAÇÃO" dur={5.4} itens={[["⚖️", "Pedir na Justiça"], ["🩺", "Continuar o benefício"], ["📋", "Laudos atualizados"], ["🛡️", "Sem demissão enquanto doente"]]} />)}
      {Q(37.8, 42.24, <Headline kicker="AFASTADO POR DOENÇA" fino="enquanto estiver doente," forte="NÃO PODE DEMITIR." dur={4.44} />)}
      {/* sons fortes (regra de 14/10) */}
      {S(6.35, "whoosh-grave", 0.6)}{S(6.8, "thump2", 0.7)}
      {S(10.75, "whoosh-grave-impacto", 0.7)}
      {S(18.55, "whoosh-grave", 0.6)}{S(19.0, "thump", 0.7)}
      {S(21.4, "whoosh-grave-impacto", 0.7)}
      {S(25.05, "whoosh-grave", 0.6)}{S(25.4, "pop", 0.45)}{S(25.5, "thump2", 0.65)}
      {S(32.0, "whoosh-grave-cards", 0.7)}
      {[0, 1, 2, 3].map((i) => <React.Fragment key={`c${i}`}>{S(32.45 + i * 0.13, `card-${i + 1}`, 0.5)}</React.Fragment>)}
      {S(37.55, "whoosh-grave-impacto", 0.75)}{S(38.0, "thump", 0.7)}
    </AbsoluteFill>
  );
};
