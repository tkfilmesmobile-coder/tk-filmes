// Vlog de Natal · EP. 03 · "o Papai Noel chegou" (Tamara Chagas Advocacia) · bruto de 29/10/2026
// Bruto: v0708 (Tamara com o Papai Noel: só a última tentativa da abertura) e v0707 (7 min: veludo, painel,
// Papai Noel inflável, árvore). Mesmo molde do EP. 02: EDL com cortes secos nos silêncios + vinheta + capítulos +
// destaques + trilha própria baixa + SFX graves. Curadoria (regra de 27/10): fora as tentativas da abertura, a
// conversa solta do começo, o "aí você tá sangrando" e a frase cortada "é o que pega do...".
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

/* ---------- EDL: [arquivo, entrada (s), saída (s), volume, zoom, velocidade] ---------- */
type Corte = { src: string; a: number; b: number; vol?: number; zoom?: number; rate?: number; tag?: string };
const EDL: Corte[] = [
  { src: "v0708", a: 20.1, b: 25.9, zoom: 1.08, tag: "gancho" },              // "Estão preparados para a parte 3 da saga da decoração daqui do escritório?"
  { src: "v0707", a: 118.0, b: 122.4, vol: 0, tag: "vinheta" },               // veludo aberto (vinheta por cima)
  { src: "v0707", a: 22.8, b: 40.45, tag: "veludo" },                         // "...um laço que não deu certo." + a espuma da árvore
  { src: "v0707", a: 49.45, b: 54.92 },                                       // "Vou me aproveitar dessa espuma... levar para a costureira, viu?"
  { src: "v0707", a: 60.0, b: 64.3, tag: "painel" },                          // "Olha assim, o painel chegou. / Chegou? Meu Deus."
  { src: "v0707", a: 74.6, b: 78.3 },                                         // "A gente bota os dois. Tem que deixar iluminado, né?"
  { src: "v0707", a: 81.8, b: 90.2 },                                         // "Eu queria na minha casa... precisa de cartão. / Cartão com limites..."
  { src: "v0707", a: 138.85, b: 143.45 },                                     // "Segunda-feira a gente entrega tudo. Vamos ficar tranquilo, que a segunda nós resolvimos."
  { src: "v0707", a: 147.2, b: 148.6 },                                       // "Segunda, meu povo!"
  { src: "v0707", a: 150.25, b: 154.75, tag: "papai" },                       // "Ó, tem um pisca-pisca... Eita! Olha aqui."
  { src: "v0707", a: 190.2, b: 194.9 },                                       // "Ah, o chip. E ela acende, né? Acende. Ele fica, ele enche."
  { src: "v0707", a: 196.6, b: 197.95 },                                      // "Vamos encher esse moço."
  { src: "v0707", a: 201.3, b: 205.2 },                                       // "Esse é o que vai ficar sentado. / Não, esse não fica sentado, não."
  { src: "v0707", a: 240.0, b: 296.0, vol: 0, rate: 4, tag: "enchendo" },     // Papai Noel enchendo, 4x, só com a trilha
  { src: "v0707", a: 313.2, b: 315.1, tag: "altura" },                        // "É um e oitenta."
  { src: "v0707", a: 321.5, b: 330.15 },                                      // "A gente vai ter que pensar onde colocar esse... Para abraçar."
  { src: "v0707", a: 340.9, b: 359.35, tag: "arvore" },                       // a árvore da mesa no tom do vinho e laços no tom do veludo
  { src: "v0707", a: 428.45, b: 435.3, tag: "prazo" },                        // "Então é isso. Segunda-feira tem que estar tudo pronto..."
];
const DUR = EDL.map((c) => Math.round((fr(c.b) - fr(c.a)) / (c.rate ?? 1)));
const INI = DUR.map((_, i) => DUR.slice(0, i).reduce((s, d) => s + d, 0));
const FIM_CARD = fr(3.2);
const TOTAL = INI[INI.length - 1] + DUR[DUR.length - 1];
export const DURACAO = TOTAL + FIM_CARD;
const idx = (tag: string) => EDL.findIndex((c) => c.tag === tag);
const ini = (tag: string) => INI[idx(tag)];
const dur = (tag: string) => DUR[idx(tag)];

const Clipe: React.FC<{ c: Corte }> = ({ c }) => {
  const f = useCurrentFrame();
  const z = c.zoom ? interpolate(f, [0, 8], [1, c.zoom], { ...cl, easing: EXPO }) : 1;
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 32%" }}>
      <OffthreadVideo src={staticFile(`${c.src}.mp4`)} trimBefore={fr(c.a)} trimAfter={fr(c.b)} volume={c.vol ?? 1} playbackRate={c.rate ?? 1} />
    </AbsoluteFill>
  );
};

/* ---------- vinheta: VLOG DE NATAL · EP. 03 ---------- */
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
        <div style={{ fontSize: 210, lineHeight: 0.9, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.06em", color: OFF, transform: `scale(${0.8 + 0.2 * b})`, opacity: Math.min(1, b * 1.3) }}>EP. 03</div>
        <div style={{ marginTop: 26, fontSize: 52, fontWeight: 200, fontStyle: "italic", color: "#fff", letterSpacing: "-0.03em", opacity: b }}>o Papai Noel chegou</div>
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
    <div style={{ position: "absolute", left: 60, top: 260, fontFamily, opacity: Math.min(1, e * 1.3) * sai, transform: `translateX(${(1 - e) * -60}px)` }}>
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

/* ---------- selo do acelerado ---------- */
const Acelerado: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 10, fr(dur) - 10, fr(dur)], [0, 1, 1, 0], cl);
  return (
    <div style={{ position: "absolute", right: 60, top: 270, fontFamily, opacity: a, background: "rgba(20,20,20,.55)", color: OFF, borderRadius: 999, padding: "10px 22px", fontSize: 26, fontWeight: 700, letterSpacing: "0.12em" }}>
      4x ▸▸
    </div>
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
      <div style={{ fontSize: 200, lineHeight: 0.9, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.06em", color: GRAFITE, transform: `scale(${0.85 + 0.15 * b})` }}>EP. 04</div>
      <div style={{ marginTop: 40, fontSize: 28, fontWeight: 600, color: TAUPE, letterSpacing: "0.12em" }}>TAMARA CHAGAS ADVOCACIA</div>
    </AbsoluteFill>
  );
};

const S = (t: number, nome: string, v: number) => <Sequence from={t}><Audio src={staticFile(`sfx/${nome}.wav`)} volume={v} /></Sequence>;
const Q = (t0: number, d: number, el: React.ReactNode) => <Sequence from={t0} durationInFrames={d}>{el}</Sequence>;

export const Vlog: React.FC = () => {
  const vin = [ini("vinheta"), ini("vinheta") + dur("vinheta")];
  const enc = [ini("enchendo"), ini("enchendo") + dur("enchendo")];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {EDL.map((c, i) => <Sequence key={i} from={INI[i]} durationInFrames={DUR[i]}><Clipe c={c} /></Sequence>)}
      {/* na fala da árvore, a câmera passa pela mesa de reunião com papel e telas ligadas (regra de 29/10: documento
          e tela não aparecem): o áudio continua e a imagem vira a Tamara arrumando o Papai Noel (v0708, sem som) */}
      {Q(ini("arvore") + fr(3.2), fr(4.4), <Clipe c={{ src: "v0708", a: 3.0, b: 7.4, vol: 0, zoom: 1.04 }} />)}
      {Q(TOTAL, FIM_CARD, <Fim />)}
      {Q(ini("vinheta"), fr(2.4), <Vinheta />)}
      {Q(ini("veludo") + 6, fr(3.2), <Capitulo n="01" txt="veludo e laços" dur={3.2} />)}
      {Q(ini("painel") + 6, fr(3.2), <Capitulo n="02" txt="o painel chegou" dur={3.2} />)}
      {Q(ini("papai") + 6, fr(3.5), <Capitulo n="03" txt="o Papai Noel inflável" dur={3.5} />)}
      {Q(ini("enchendo"), dur("enchendo"), <Acelerado dur={dur("enchendo") / FPS} />)}
      {Q(ini("altura"), dur("altura") + fr(1.2), <Destaque kicker="O PAPAI NOEL TEM" fino="nada menos que" forte="1,80 M." dur={dur("altura") / FPS + 1.2} />)}
      {Q(ini("arvore") + 6, fr(3.5), <Capitulo n="04" txt="a árvore no tom do vinho" dur={3.5} />)}
      {Q(ini("prazo") + fr(1.6), dur("prazo") - fr(1.6), <Destaque kicker="O PRAZO" fino="segunda-feira," forte="TUDO PRONTO." dur={dur("prazo") / FPS - 1.6} />)}
      {/* trilha própria, baixa por baixo das falas; sobe na vinheta, no acelerado e no fim */}
      <Audio src={staticFile("sfx/trilha-feira.wav")} loop volume={(f) => ((f >= vin[0] && f < vin[1]) || (f >= enc[0] && f < enc[1]) ? 0.32 : f >= TOTAL ? 0.35 : 0.07)} />
      {/* SFX graves (regra de 14/10) */}
      {S(ini("vinheta") - 4, "whoosh-grave-impacto", 0.75)}{S(ini("vinheta") + 4, "thump2", 0.7)}
      {S(ini("veludo") + 4, "whoosh-grave", 0.55)}
      {S(ini("painel") + 4, "whoosh-grave", 0.55)}
      {S(ini("papai"), "whoosh-grave-impacto", 0.65)}
      {S(ini("enchendo"), "whoosh-grave", 0.5)}
      {S(ini("altura") + 4, "thump2", 0.6)}
      {S(ini("arvore") + 4, "whoosh-grave", 0.55)}
      {S(TOTAL - 6, "whoosh-grave-impacto", 0.75)}{S(TOTAL + 6, "thump2", 0.7)}
    </AbsoluteFill>
  );
};
