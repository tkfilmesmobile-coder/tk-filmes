// Tamara Chagas · 25 de novembro, Dia Internacional pela Eliminação da Violência contra a Mulher (gravação da equipe, 24/11/2026).
// v2 (ajustes da Talyta): abertura com impacto sonoro forte; os 3 rostos agredidos no mesmo enquadramento; aviso menor;
// cor mais viva nas falas; abertura nova (IMG_2171); curadoria pela ÚLTIMA tentativa com a frase inteira, cortes justos;
// imagens das agredidas como camada durante as falas; legenda em no máximo 2 linhas, menor; "Por uma vida sem violência"
// uma vez só, com as seis na tela falando juntas.
import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "400", "500", "600", "700"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Bloco = [number, string]; // início (s, relativo ao corte), texto com <b>
type Camada = [string, number, number, number]; // vídeo da agredida (câmera lenta), entra em (s), dura (s), trecho do vídeo (s)
type Seg = { src: string; dur: number; leg: Bloco[]; camadas?: Camada[] };

const FALAS: Seg[] = [
  { src: "f01", dur: 3.79, leg: [[0.0, "É quando o <b>ciúme</b> deixa de ser cuidado e se torna <b>controle.</b>"]], camadas: [["m_b_lento", 1.2, 2.0, 0.5]] },
  { src: "f02", dur: 4.62, leg: [[0.1, "É quando controlam suas <b>roupas</b>, seu <b>dinheiro</b> e suas <b>escolhas.</b>"]], camadas: [["m_c_lento", 1.6, 2.2, 0.5]] },
  { src: "f03", dur: 3.61, leg: [[0.06, "É quando você precisa medir suas <b>palavras</b> por <b>medo</b> de uma reação de alguém."]], camadas: [["m_a_lento", 1.1, 2.1, 0.5]] },
  { src: "f04", dur: 3.4, leg: [[0.0, "É quando você deixa de ser <b>quem é</b> para evitar uma discussão."]], camadas: [["m_b_lento", 1.0, 1.9, 5.0]] },
  { src: "f05", dur: 8.91, leg: [[0.0, "Nenhuma mulher deveria chamar de <b>amor</b> aquilo que lhe causa <b>medo.</b>"], [3.49, "Nenhuma mulher deveria viver em uma relação por não ter condições de <b>sair dela.</b>"]], camadas: [["m_c_lento", 1.0, 2.0, 5.0], ["m_a_lento", 5.2, 2.2, 4.5]] },
  { src: "f06", dur: 3.88, leg: [[0.03, "Você tem direito à <b>proteção</b>, <b>liberdade</b> e a um <b>recomeço.</b>"]] },
  { src: "f07", dur: 7.98, leg: [[0.0, "Hoje, como mulheres e profissionais,"], [2.9, "reafirmamos o nosso <b>compromisso</b> em combate à violência contra a mulher."]] },
];
const ABERTURA = 3.65; // 1ª fala (IMG_2171) por cima dos machucados
const CORO = 3.25;     // as seis juntas (public/c/coro.mp4): frase de 0,35 a 1,95 s, depois olhando pra câmera
const FINAL = 6.0;
const VOZ = 2.2; // falas gravadas baixas: sobe ~7 dB
const tFalas = FALAS.reduce((a, s) => a + s.dur, 0);
export const DURACAO = fr(ABERTURA + tFalas + CORO + FINAL);

/* ---------- legenda: frase inteira em até 2 linhas ---------- */
const Legenda: React.FC<{ blocos: Bloco[]; dur: number; topo?: number }> = ({ blocos, dur, topo = 1470 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {blocos.map(([t, txt], i) => {
        const a = fr(t), b = i + 1 < blocos.length ? fr(blocos[i + 1][0]) : fr(dur);
        if (f < a - 1 || f >= b) return null;
        const o = interpolate(f, [a - 1, a + 3], [0, 1], cl);
        return (
          <div key={i} style={{ position: "absolute", left: 90, right: 90, top: topo, fontFamily, textAlign: "center", color: "#fff", fontSize: 44, lineHeight: 1.28,
            fontWeight: 400, letterSpacing: "-0.01em", textShadow: "0 2px 18px rgba(0,0,0,.75), 0 0 2px rgba(0,0,0,.5)", opacity: o, transform: `translateY(${(1 - o) * 8}px)` }}
            dangerouslySetInnerHTML={{ __html: txt.replace(/<b>/g, '<b style="font-weight:700">') }} />
        );
      })}
    </>
  );
};

const Aviso: React.FC = () => (
  <div style={{ position: "absolute", top: 210, left: 0, right: 0, textAlign: "center", fontFamily, fontSize: 17, letterSpacing: "0.2em", fontWeight: 500, color: "rgba(255,255,255,.82)", textShadow: "0 1px 8px rgba(0,0,0,.6)" }}>
    IMAGENS MERAMENTE ILUSTRATIVAS · MAQUIAGEM E EFEITOS
  </div>
);

/* ---------- abertura: os três rostos piscando, pretos no meio, um golpe forte a cada rosto ---------- */
// [vídeo, início no vídeo (s), quadro inicial, duração (quadros), som]
const FLASH: [string, number, number, number, string][] = [
  ["m_a", 0.4, 0, 14, "golpe"], ["m_b", 0.6, 18, 14, "golpe"], ["m_c", 0.6, 36, 14, "golpe"],
  ["m_a", 1.4, 53, 7, "golpe-curto"], ["m_b", 1.6, 62, 7, "golpe-curto"], ["m_c", 1.8, 71, 7, "golpe-curto"], ["m_a", 2.2, 81, 29, "golpe-final"],
];
const Abertura: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {FLASH.map(([src, ini, t0, d], i) => (
        <Sequence key={i} from={t0} durationInFrames={d}>
          <AbsoluteFill style={{ transform: `scale(${1.0 + (i === FLASH.length - 1 ? 0.06 : 0.03) * interpolate(f - t0, [0, d], [0, 1], cl)})` }}>
            <OffthreadVideo src={staticFile(`c/${src}.mp4`)} startFrom={fr(ini)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Aviso />
      <Legenda blocos={[[0.0, "Violência não é só quando deixam <b>marcas no corpo.</b>"]]} dur={ABERTURA} />
    </AbsoluteFill>
  );
};

/* ---------- fala, com as imagens das agredidas entrando como camada ---------- */
const CamadaAgredida: React.FC<{ src: string; d: number; ini: number }> = ({ src, d, ini }) => {
  const f = useCurrentFrame(), n = fr(d);
  const suave = Easing.bezier(0.42, 0, 0.58, 1);
  const o = Math.min(interpolate(f, [0, 12], [0, 1], { ...cl, easing: suave }), interpolate(f, [n - 12, n], [1, 0], { ...cl, easing: suave }));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${1.02 + 0.03 * interpolate(f, [0, n], [0, 1], cl)})` }}>
        <OffthreadVideo src={staticFile(`c/${src}.mp4`)} startFrom={fr(ini)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <Aviso />
    </AbsoluteFill>
  );
};
const Fala: React.FC<{ s: Seg }> = ({ s }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <OffthreadVideo src={staticFile(`c/${s.src}.mp4`)} volume={VOZ} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    {(s.camadas ?? []).map(([src, t, d, ini], i) => (
      <Sequence key={i} from={fr(t)} durationInFrames={fr(d)}><CamadaAgredida src={src} d={d} ini={ini} /></Sequence>
    ))}
    <Legenda blocos={s.leg} dur={s.dur} />
  </AbsoluteFill>
);

/* ---------- tela final ---------- */
const Final: React.FC = () => {
  const f = useCurrentFrame();
  const a = (d: number) => interpolate(f, [d, d + 18], [0, 1], cl);
  const up = (d: number) => `translateY(${(1 - a(d)) * 16}px)`;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0d0d", fontFamily, color: "#fff", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 96px" }}>
      <div style={{ fontSize: 26, letterSpacing: "0.42em", fontWeight: 600, color: "#E6D3B8", opacity: a(4), transform: up(4) }}>25 DE NOVEMBRO</div>
      <div style={{ width: 70, height: 2, background: "#E6D3B8", margin: "34px 0", opacity: a(8) }} />
      <div style={{ fontSize: 76, lineHeight: 1.12, letterSpacing: "-0.035em", fontWeight: 200, opacity: a(12), transform: up(12) }}>
        Ser mulher não deveria significar <b style={{ fontWeight: 700 }}>viver com medo.</b>
      </div>
      <div style={{ marginTop: 44, fontSize: 30, lineHeight: 1.4, fontWeight: 300, color: "rgba(255,255,255,.82)", opacity: a(26), transform: up(26) }}>
        Dia Internacional pela Eliminação<br />da Violência contra a Mulher
      </div>
      <div style={{ marginTop: 56, fontSize: 40, fontWeight: 600, letterSpacing: "0.02em", opacity: a(38), transform: up(38) }}>
        Ligue <span style={{ color: "#E6D3B8" }}>180</span> · Emergências <span style={{ color: "#E6D3B8" }}>190</span>
      </div>
      <Img src={staticFile("logo.png")} style={{ position: "absolute", bottom: 230, width: 230, opacity: a(50) * 0.95 }} />
    </AbsoluteFill>
  );
};

const S = (t: number, nome: string, v: number) => <Sequence from={t}><Audio src={staticFile(`sfx/${nome}.wav`)} volume={v} /></Sequence>;

export const Violencia: React.FC = () => {
  let t = fr(ABERTURA);
  const falas = FALAS.map((s, i) => { const el = <Sequence key={`f${i}`} from={t} durationInFrames={fr(s.dur)}><Fala s={s} /></Sequence>; t += fr(s.dur); return el; });
  const tCoro = t;
  const tFinal = tCoro + fr(CORO);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={fr(ABERTURA)}><Abertura /></Sequence>
      {/* 1ª fala (só o som) por baixo dos machucados */}
      <Sequence durationInFrames={fr(ABERTURA)}><OffthreadVideo src={staticFile("c/f00.mp4")} volume={VOZ} style={{ opacity: 0 }} /></Sequence>
      {falas}
      <Sequence from={tCoro} durationInFrames={fr(CORO)}>
        <AbsoluteFill><OffthreadVideo src={staticFile("c/coro.mp4")} volume={VOZ} style={{ width: "100%", height: "100%" }} />
          <Legenda blocos={[[0.3, "Por uma vida sem violência."]]} dur={CORO} topo={1232} /></AbsoluteFill>
      </Sequence>
      <Sequence from={tFinal}><Final /></Sequence>
      {FLASH.map(([, , t0, , som], i) => <React.Fragment key={`h${i}`}>{S(t0, som, som === "golpe-final" ? 0.6 : 0.5)}</React.Fragment>)}
      {/* música (Maria da Penha): bem baixa sob as falas; na tela final sobe no "Cadê meu celular? Eu vou ligar pro 180" */}
      <Sequence durationInFrames={tFinal + fr(0.4)}><Audio src={staticFile("musica-fundo.wav")} volume={(x) => interpolate(x, [0, fr(1), tFinal - fr(0.3), tFinal + fr(0.4)], [0, 0.085, 0.085, 0], cl)} /></Sequence>
      <Sequence from={tFinal}><Audio src={staticFile("musica-final.wav")} volume={(x) => interpolate(x, [0, fr(0.25), fr(FINAL) - fr(0.6), fr(FINAL)], [0.5, 0.95, 0.95, 0], cl)} /></Sequence>
    </AbsoluteFill>
  );
};
