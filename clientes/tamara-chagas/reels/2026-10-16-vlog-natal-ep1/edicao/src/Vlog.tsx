// Vlog de Natal · EP. 01 · "A saga da decoração 2026" (Tamara Chagas Advocacia)
// Bruto: v6083 (Tamara no carro) e v6084 (loja de decoração com o Ronaldo). Estética do escritório.
// Montagem por EDL (cortes secos com respiro) + vinheta + capítulos + trilha própria baixa + SFX graves.
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
const OFF = "#ECEBE9", GRAFITE = "#141414", TAUPE = "#8C7B6B", CHAMPANHE = "#E6D3B8";
const fr = (s: number) => Math.round(s * FPS);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- EDL: [arquivo, entrada (s), saída (s), volume, zoom] ---------- */
type Corte = { src: string; a: number; b: number; vol?: number; zoom?: number; tag?: string };
const EDL: Corte[] = [
  { src: "v6084", a: 441.2, b: 446.7, zoom: 1.12, tag: "gancho" },             // "Meu Deus, Ronaldo, que complicação."
  { src: "v6084", a: 2.0, b: 4.4, vol: 0.25, tag: "vinheta" },                 // entrada da loja (vinheta por cima)
  { src: "v6083", a: 9.85, b: 54.3, tag: "carro" },                            // um corte só: "Final de ano chegando, isso quer dizer o quê?..." até "...Natal de 2026"
  { src: "v6084", a: 6.75, b: 13.0, tag: "loja" },                             // "Ronaldo! ... Finalmente encontrei você."
  { src: "v6084", a: 28.55, b: 34.1, tag: "veludo" },                          // "comprei um rolo de tecido de veludo... com tom vinho"
  { src: "v6084", a: 37.4, b: 45.7 },                                          // "e comprei umas bolas... transparente, bem rígida"
  { src: "v6084", a: 52.1, b: 58.0 },                                          // "recortar e cobrir essas bolas... bolas de Natal"
  { src: "v6084", a: 160.45, b: 168.6, tag: "arco" },                          // "Aí que eu pensei naquele arco... será que dava certo?"
  { src: "v6084", a: 243.45, b: 245.65 },                                      // "porque o menino mexe, vão querer tirar foto"
  { src: "v6084", a: 255.5, b: 257.25 },                                       // "porque também o povo pode passar e levar"
  { src: "v6084", a: 496.8, b: 505.15, tag: "inflavel" },                       // Papai Noel inflável
];
const DUR = EDL.map((c) => fr(c.b) - fr(c.a));
const INI = DUR.map((_, i) => DUR.slice(0, i).reduce((s, d) => s + d, 0));
const FIM_CARD = fr(3.2);
export const DURACAO = INI[INI.length - 1] + DUR[DUR.length - 1] + FIM_CARD;
const ini = (tag: string) => INI[EDL.findIndex((c) => c.tag === tag)];

const Clipe: React.FC<{ c: Corte }> = ({ c }) => {
  const f = useCurrentFrame();
  const z = c.zoom ? interpolate(f, [0, 8], [1, c.zoom], { ...cl, easing: EXPO }) : 1;
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 32%" }}>
      <OffthreadVideo src={staticFile(`${c.src}.mp4`)} trimBefore={fr(c.a)} trimAfter={fr(c.b)} volume={c.vol ?? 1} />
    </AbsoluteFill>
  );
};

/* ---------- vinheta: VLOG DE NATAL · EP. 01 ---------- */
const Vinheta: React.FC = () => {
  const f = useCurrentFrame();
  const a = spring({ frame: f, fps: FPS, config: { damping: 13, mass: 0.6 } });
  const b = spring({ frame: f - 6, fps: FPS, config: { damping: 12, mass: 0.6 } });
  const fio = interpolate(f, [2, 20], [0, 1], { ...cl, easing: EXPO });
  const sai = interpolate(f, [fr(2.4) - 8, fr(2.4)], [1, 0], cl);
  return (
    <AbsoluteFill style={{ fontFamily, opacity: sai }}>
      <AbsoluteFill style={{ background: "rgba(20,20,20,.55)", opacity: a }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 26, letterSpacing: "0.45em", fontWeight: 700, color: CHAMPANHE, opacity: a }}>VLOG DE NATAL</div>
        <div style={{ width: 300 * fio, height: 2, background: CHAMPANHE, margin: "26px 0" }} />
        <div style={{ fontSize: 210, lineHeight: 0.9, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.06em", color: OFF, transform: `scale(${0.8 + 0.2 * b})`, opacity: Math.min(1, b * 1.3) }}>EP. 01</div>
        <div style={{ marginTop: 26, fontSize: 52, fontWeight: 200, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", opacity: b }}>a saga da decoração 2026</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- capítulo (pílula no alto, longe do rosto) ---------- */
const Capitulo: React.FC<{ n: string; txt: string; dur: number }> = ({ n, txt, dur }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f, fps: FPS, config: { damping: 12, mass: 0.5 } });
  const sai = interpolate(f, [fr(dur) - 8, fr(dur)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: 60, top: 200, fontFamily, opacity: Math.min(1, e * 1.3) * sai, transform: `translateX(${(1 - e) * -60}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: OFF, borderRadius: 999, padding: "14px 28px 14px 14px", boxShadow: "0 16px 36px rgba(0,0,0,.28)" }}>
        <div style={{ background: GRAFITE, color: CHAMPANHE, borderRadius: 999, padding: "8px 18px", fontSize: 24, fontWeight: 800, letterSpacing: "0.1em" }}>{n}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: GRAFITE, letterSpacing: "-0.02em" }}>{txt}</div>
      </div>
    </div>
  );
};

/* ---------- texto de destaque (embaixo, fora do rosto) ---------- */
const Destaque: React.FC<{ kicker: string; fino: string; forte: string; dur: number }> = ({ kicker, fino, forte, dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 12], [0, 1], { ...cl, easing: EXPO });
  const b = spring({ frame: f - 6, fps: FPS, config: { damping: 12, mass: 0.6 } });
  const sai = interpolate(f, [fr(dur) - 8, fr(dur)], [1, 0], cl);
  const tam = Math.min(124, Math.floor(1700 / Math.max(6, forte.length)));
  return (
    <AbsoluteFill style={{ fontFamily, opacity: sai }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(20,20,20,0) 55%,rgba(20,20,20,.7) 82%)", opacity: a }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1380 }}>
        <div style={{ fontSize: 22, letterSpacing: "0.3em", fontWeight: 700, color: CHAMPANHE, opacity: a }}>{kicker}</div>
        <div style={{ marginTop: 12, fontSize: 70, lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 200, fontStyle: "italic", color: "#fff", opacity: a }}>{fino}</div>
        <div style={{ fontSize: tam, lineHeight: 0.95, letterSpacing: "-0.055em", fontWeight: 900, fontStyle: "italic", color: CHAMPANHE, transform: `translateX(${(1 - b) * -80}px)`, opacity: Math.min(1, b * 1.3) }}>{forte}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- cartão final ---------- */
const Fim: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 14], [0, 1], { ...cl, easing: EXPO });
  const b = spring({ frame: f - 8, fps: FPS, config: { damping: 12, mass: 0.6 } });
  return (
    <AbsoluteFill style={{ background: OFF, fontFamily, alignItems: "center", justifyContent: "center", textAlign: "center", opacity: a }}>
      <div style={{ fontSize: 26, letterSpacing: "0.45em", fontWeight: 700, color: TAUPE }}>VLOG DE NATAL</div>
      <div style={{ marginTop: 30, fontSize: 70, fontWeight: 200, fontStyle: "italic", color: GRAFITE, letterSpacing: "-0.03em" }}>continua no</div>
      <div style={{ fontSize: 200, lineHeight: 0.9, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.06em", color: GRAFITE, transform: `scale(${0.85 + 0.15 * b})` }}>EP. 02</div>
      <div style={{ marginTop: 40, fontSize: 28, fontWeight: 600, color: TAUPE, letterSpacing: "0.12em" }}>TAMARA CHAGAS ADVOCACIA</div>
    </AbsoluteFill>
  );
};

const S = (t: number, nome: string, v: number) => <Sequence from={t}><Audio src={staticFile(`sfx/${nome}.wav`)} volume={v} /></Sequence>;
const Q = (t0: number, d: number, el: React.ReactNode) => <Sequence from={t0} durationInFrames={d}>{el}</Sequence>;

export const Vlog: React.FC = () => {
  const total = INI[INI.length - 1] + DUR[DUR.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {EDL.map((c, i) => <Sequence key={i} from={INI[i]} durationInFrames={DUR[i]}><Clipe c={c} /></Sequence>)}
      {Q(total, FIM_CARD, <Fim />)}
      {Q(ini("vinheta"), fr(2.4), <Vinheta />)}
      {Q(ini("carro") + 6, fr(3.2), <Capitulo n="01" txt="partiu decoração 🚗" dur={3.2} />)}
      {Q(ini("carro") + fr(20.0), fr(5.5), <Destaque kicker="A ÁRVORE DA RECEPÇÃO" fino="quase" forte="5 METROS." dur={5.5} />)}
      {Q(ini("loja") + 4, fr(3.2), <Capitulo n="02" txt="na loja com o Ronaldo" dur={3.2} />)}
      {Q(ini("veludo") + 6, fr(4.5), <Capitulo n="03" txt="a ideia: veludo vinho" dur={4.5} />)}
      {Q(ini("arco") + 6, fr(4.5), <Capitulo n="04" txt="o arco da fachada" dur={4.5} />)}
      {Q(ini("inflavel") + 6, fr(4.5), <Capitulo n="05" txt="e o Papai Noel? 🎅" dur={4.5} />)}
      {/* trilha própria, baixa por baixo das falas; sobe na vinheta e no fim */}
      <Audio src={staticFile("sfx/trilha-feira.wav")} loop volume={(f) => (f < ini("vinheta") + fr(2.4) && f >= ini("vinheta") ? 0.32 : f >= total ? 0.35 : 0.07)} />
      {/* SFX graves (regra de 14/10) */}
      {S(ini("vinheta") - 4, "whoosh-grave-impacto", 0.75)}{S(ini("vinheta") + 4, "thump2", 0.7)}
      {S(ini("carro") + 4, "whoosh-grave", 0.55)}
      {S(ini("carro") + fr(20.0) - 6, "whoosh-grave", 0.6)}{S(ini("carro") + fr(20.0) + 6, "thump", 0.65)}
      {S(ini("loja"), "whoosh-grave-impacto", 0.65)}
      {S(ini("veludo") + 4, "whoosh-grave", 0.55)}
      {S(ini("arco") + 4, "whoosh-grave", 0.55)}
      {S(ini("inflavel") + 4, "whoosh-grave", 0.55)}
      {S(total - 6, "whoosh-grave-impacto", 0.75)}{S(total + 6, "thump2", 0.7)}
    </AbsoluteFill>
  );
};
