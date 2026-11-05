// Vídeo oficial da decoração de Natal 2026 · Tamara Chagas Advocacia (brutos de 04/11/2026, árvore + fachada)
// v2 (05/11, retorno da Talyta): sem efeitos sonoros (só a música, subindo e descendo), abertura num take longo e
// suave do Papai Noel, fachada inteira (vídeo 4045d273, ampliado pra 1080p), árvore sempre em quadro fechado (sem os
// cantos da sala) e fusões suaves de 8 quadros entre os planos, no lugar dos cortes com borrão.
// Títulos elegantes (serifa itálica fina) nos momentos de fala; o som da fala segue por baixo das imagens.
// Curadoria: cada fala começa e termina em silêncio medido (pausas.py, 20 ms) e foi conferida com o whisper medium.
// Fontes em public/: brutos 4K convertidos pra 3414x1920; fachada-inteira.mp4 em 1920x1080.
// Dois formatos: vertical 1080x1920 (composição Natal) e horizontal 1920x1080 (NatalHorizontal).
// Fusão: o plano entra 8 quadros antes do corte (from - 8, durationInFrames + 8, trimBefore - 8 x velocidade).
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: SERIFA } = loadFont("italic", { weights: ["300", "400"], subsets: ["latin", "latin-ext"] });
const { fontFamily: SANS } = loadInter("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = 1680; // 56 s
const CHAMPANHE = "#E6D3B8";
const W = 3414; // largura dos brutos em 1920 de altura
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const SUAVE = Easing.bezier(0.42, 0, 0.58, 1);
const Horizontal = React.createContext(false);

/* ---------- um plano ----------
   cx/cxs = centro do recorte vertical (segue o rosto, scripts/rosto.py) e direção do avanço na horizontal
   fecha = [vertical, horizontal] zoom extra pra mostrar só a árvore (sem parede, janela, teto, tomada, capacho)
   fx = centro do zoom na horizontal (quando difere de cx) · funde = entra por fusão de 8 quadros
   caber = fonte 1920x1080 (fachada inteira): na vertical entra inteira sobre o próprio vídeo desfocado */
type PlanoProps = { src: string; trimBefore: number; dur: number; cx: number; cxs?: [number, number][]; rate?: number; z0?: number; z1?: number;
  funde?: boolean; escuro?: number; fecha?: [number, number]; fx?: number; caber?: boolean };
const Plano: React.FC<PlanoProps> = ({ src, trimBefore, dur, cx, cxs, rate = 1, z0 = 1.0, z1 = 1.05, funde = false, escuro = 0, fecha, fx, caber = false }) => {
  const f = useCurrentFrame();
  const h = React.useContext(Horizontal);
  const c = cxs ? interpolate(f, cxs.map((k) => k[0]), cxs.map((k) => k[1]), { ...cl, easing: SUAVE }) : cx;
  const op = funde ? interpolate(f, [0, 8], [0, 1], { ...cl, easing: SUAVE }) : 1;
  const z = interpolate(f, [0, dur], [z0, z1], cl) * (fecha ? (h ? fecha[1] : fecha[0]) : 1);
  const filtro = `brightness(${1 - escuro})`; // a cor cinematográfica já vem nas fontes (scripts/cor.py)
  const video = (w: number, hh: number) => <Video src={staticFile(src)} trimBefore={trimBefore} playbackRate={rate} muted style={{ width: w, height: hh }} />;
  let corpo: React.ReactNode;
  if (h) {
    corpo = <AbsoluteFill style={{ scale: z, transformOrigin: `${(fx ?? c) * 100}% 42%` }}>{video(1920, 1080)}</AbsoluteFill>;
  } else if (caber) {
    corpo = (
      <>
        <AbsoluteFill style={{ scale: 1.15, filter: "blur(40px) brightness(.45)" }}>
          <div style={{ position: "absolute", top: 0, left: -1166, width: 3414, height: 1920 }}>{video(3414, 1920)}</div>
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", scale: z }}>
          <div style={{ width: 1080, height: 608, boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}>{video(1080, 608)}</div>
        </AbsoluteFill>
      </>
    );
  } else {
    const left = Math.min(0, Math.max(1080 - W, 540 - c * W));
    corpo = (
      <AbsoluteFill style={{ scale: z, transformOrigin: `${((c * W + left) / 1080) * 100}% 45%` }}>
        <div style={{ position: "absolute", top: 0, left, width: W, height: 1920 }}>{video(W, 1920)}</div>
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill style={{ overflow: "hidden", opacity: op, filter: filtro }}>{corpo}</AbsoluteFill>;
};

/* ---------- títulos elegantes (serifa itálica fina, como na referência do tour) ---------- */
const Rotulo: React.FC<{ texto: string; dur: number }> = ({ texto, dur }) => {
  const h = React.useContext(Horizontal);
  const ALT = h ? 1080 : 1920, topo = h ? 840 : 1290, tam = h ? 66 : 88;
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 18], [0, 1], { ...cl, easing: EXPO });
  const s = interpolate(f, [dur - 14, dur], [1, 0], { ...cl, easing: SUAVE });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ opacity: Math.min(e, s) * 0.9, background: `linear-gradient(180deg, rgba(8,6,6,0) ${((topo - (h ? 180 : 260)) / ALT) * 100}%, rgba(8,6,6,.55) ${((topo + 40) / ALT) * 100}%, rgba(8,6,6,0) ${((topo + (h ? 240 : 360)) / ALT) * 100}%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: topo, textAlign: "center", fontFamily: SERIFA, fontStyle: "italic", fontWeight: 400,
        fontSize: tam, letterSpacing: "0.01em", color: "rgba(255,255,255,.96)", textShadow: "0 2px 18px rgba(0,0,0,.75), 0 0 2px rgba(0,0,0,.6)",
        opacity: Math.min(e, s), filter: `blur(${(1 - e) * 8}px)`, translate: `0px ${(1 - e) * 16}px` }}>
        {texto}
      </div>
    </AbsoluteFill>
  );
};

const Abertura: React.FC = () => {
  const f = useCurrentFrame();
  const h = React.useContext(Horizontal);
  const a = interpolate(f, [20, 55], [0, 1], { ...cl, easing: EXPO });
  const b = interpolate(f, [35, 75], [0, 1], { ...cl, easing: EXPO });
  const s = interpolate(f, [150, 180], [1, 0], { ...cl, easing: SUAVE });
  return (
    <AbsoluteFill style={{ opacity: s }}>
      <div style={{ position: "absolute", top: h ? 760 : 1250, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontSize: 22, letterSpacing: "0.42em", color: CHAMPANHE, opacity: a, textShadow: "0 1px 10px rgba(0,0,0,.8)" }}>TAMARA CHAGAS ADVOCACIA</div>
        <div style={{ marginTop: 16, fontFamily: SERIFA, fontStyle: "italic", fontWeight: 300, fontSize: h ? 96 : 112, color: "#fff", opacity: b,
          filter: `blur(${(1 - b) * 10}px)`, textShadow: "0 2px 30px rgba(0,0,0,.8)" }}>o Natal chegou</div>
      </div>
    </AbsoluteFill>
  );
};

const Final: React.FC = () => {
  const f = useCurrentFrame();
  const h = React.useContext(Horizontal);
  const a = interpolate(f, [10, 45], [0, 1], { ...cl, easing: EXPO });
  const b = interpolate(f, [30, 65], [0, 1], { ...cl, easing: EXPO });
  const fimPreto = interpolate(f, [97, 112], [0, 1], cl);
  return (
    <AbsoluteFill style={{ background: `rgba(10,8,8,${0.25 + 0.25 * a})`, justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", translate: `0px ${(1 - a) * 20}px` }}>
        <div style={{ fontFamily: SERIFA, fontStyle: "italic", fontWeight: 300, fontSize: h ? 120 : 140, color: "#fff", opacity: a, filter: `blur(${(1 - a) * 10}px)`, textShadow: "0 2px 30px rgba(0,0,0,.7)" }}>Feliz Natal</div>
        <div style={{ width: 90 * b, height: 1, background: CHAMPANHE, margin: "24px auto 20px" }} />
        <div style={{ fontFamily: SANS, fontSize: 22, letterSpacing: "0.42em", color: CHAMPANHE, opacity: b }}>TAMARA CHAGAS ADVOCACIA · 2026</div>
      </div>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: fimPreto }} />
    </AbsoluteFill>
  );
};

const Vinheta: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.36) 100%)" }} />
);

/* ---------- música: cheia na abertura e na montagem, baixa nas falas, crescendo no fechamento ---------- */
const MUSICA_PONTOS: [number, number][] = [
  [0, 0.0], [15, 0.9], [226, 0.9], [246, 0.13],
  [878, 0.13], [903, 0.95], [1073, 0.95], [1089, 0.15],
  [1380, 0.15], [1460, 0.22], [1556, 0.22], [1574, 0.9], [1680, 0.9],
];
const volMusica = (f: number) => interpolate(f, MUSICA_PONTOS.map((p) => p[0]), MUSICA_PONTOS.map((p) => p[1]), cl);
const fala = (f: number, dur: number) => interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], cl);

export const Natal: React.FC<{ horizontal?: boolean }> = ({ horizontal = false }) => {
  return (
    <Horizontal.Provider value={horizontal}>
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        {/* ======================= IMAGEM ======================= */}
        {/* A · abertura: um take só, longo e suave, do plano aberto da fachada até o Papai Noel (IMG_7295 0,3 a 8,3 s) */}
        <Sequence name="A fachada até o Papai Noel" from={0} durationInFrames={240}>
          <Plano src="g-IMG_7295.mp4" trimBefore={9} dur={240} cx={0.61} z0={1.0} z1={1.06} />
        </Sequence>
        {/* B · Tamara: "E finalmente a saga da decoração... do Natal de 2026 foi concluída" */}
        <Sequence name="B1 Tamara abre" from={232} durationInFrames={104}>
          <Plano src="g-IMG_1282.mp4" trimBefore={13} dur={104} cx={0.84} cxs={[[0, 0.842], [23, 0.81], [38, 0.76], [53, 0.73], [68, 0.712], [83, 0.68], [104, 0.648]]} z0={1.0} z1={1.03} funde />
        </Sequence>
        <Sequence name="B2 espiral subindo (fala segue)" from={328} durationInFrames={86}>
          <Plano src="lento-B2.mp4" trimBefore={0} dur={86} cx={0.58} fx={0.62} fecha={[1.12, 1.5]} z0={1.0} z1={1.05} funde />
        </Sequence>
        <Sequence name="B3 Tamara: foi concluída" from={406} durationInFrames={49}>
          <Plano src="g-IMG_1282.mp4" trimBefore={187} dur={49} cx={0.58} z0={1.03} z1={1.06} funde />
        </Sequence>
        {/* C · Ronaldo: "A decoração está em tons de maçã. O veludo foi a peça principal pra essa montagem." */}
        <Sequence name="C1 Ronaldo: tons" from={455} durationInFrames={78}>
          <Plano src="g-IMG_1284.mp4" trimBefore={5} dur={78} cx={0.41} z0={1.0} z1={1.03} />
        </Sequence>
        <Sequence name="C2 veludo descendo (fala segue)" from={525} durationInFrames={116}>
          <Plano src="lento-C2.mp4" trimBefore={0} dur={116} cx={0.5} fx={0.5} fecha={[1.12, 1.5]} z0={1.0} z1={1.05} funde />
        </Sequence>
        <Sequence name="C3 Ronaldo: montagem" from={633} durationInFrames={56}>
          <Plano src="g-IMG_1284.mp4" trimBefore={183} dur={56} cx={0.383} z0={1.03} z1={1.05} funde />
        </Sequence>
        {/* D · "Criamos o maxi laço, que também é tendência do momento." (sobre o laço, clareado: está contraluz) */}
        <Sequence name="D maxi laço" from={681} durationInFrames={128}>
          <Plano src="lento-D.mp4" trimBefore={0} dur={128} cx={0.56} fx={0.56} fecha={[1.05, 1.3]} z0={1.0} z1={1.05} escuro={-0.4} funde />
        </Sequence>
        {/* E · "Uma árvore de 5 metros." (a subida para antes do teto) */}
        <Sequence name="E1 Ronaldo: 5 metros" from={801} durationInFrames={35}>
          <Plano src="g-IMG_1285.mp4" trimBefore={101} dur={35} cx={0.298} z0={1.02} z1={1.04} funde />
        </Sequence>
        <Sequence name="E2 subida pela árvore" from={828} durationInFrames={71}>
          <Plano src="g-IMG_7302.mp4" trimBefore={176} dur={71} cx={0.44} fx={0.42} rate={1.5} fecha={[1.12, 1.5]} z0={1.0} z1={1.05} funde />
        </Sequence>
        {/* F · montagem com a música cheia: 4 planos longos com fusão */}
        <Sequence name="F1 veludo enrolado" from={891} durationInFrames={57}>
          <Plano src="g-IMG_7304.mp4" trimBefore={652} dur={57} cx={0.47} fx={0.56} fecha={[1.12, 1.45]} z0={1.0} z1={1.06} funde />
        </Sequence>
        <Sequence name="F2 bolas e espiral" from={940} durationInFrames={67}>
          <Plano src="g-IMG_7303.mp4" trimBefore={120} dur={67} cx={0.56} fx={0.6} fecha={[1.12, 1.45]} z0={1.0} z1={1.06} funde />
        </Sequence>
        <Sequence name="F3 bolas maxi" from={999} durationInFrames={50}>
          <Plano src="g-IMG_7304.mp4" trimBefore={724} dur={50} cx={0.5} fx={0.62} fecha={[1.1, 1.35]} z0={1.0} z1={1.05} funde />
        </Sequence>
        <Sequence name="F4 Papai Noel" from={1041} durationInFrames={44}>
          <Plano src="g-IMG_7295.mp4" trimBefore={322} dur={44} cx={0.6} z0={1.0} z1={1.04} funde />
        </Sequence>
        {/* G · "Mas foram 3 dias de trabalho para produzir tanto a árvore quanto a fachada, que vocês vão ver também." */}
        <Sequence name="G1 Ronaldo: 3 dias" from={1077} durationInFrames={80}>
          <Plano src="g-IMG_1285.mp4" trimBefore={655} dur={80} cx={0.377} cxs={[[0, 0.377], [38, 0.372], [58, 0.358], [80, 0.334]]} z0={1.0} z1={1.03} funde />
        </Sequence>
        <Sequence name="G2 lateral da fachada (fala segue)" from={1149} durationInFrames={104}>
          <Plano src="lento-G2.mp4" trimBefore={0} dur={104} cx={0.5} z0={1.0} z1={1.04} caber funde />
        </Sequence>
        {/* H · Tamara fecha: "E toda essa decoração foi pensada com muito carinho... a magia do Natal." */}
        <Sequence name="H1 Tamara: carinho" from={1245} durationInFrames={134}>
          <Plano src="g-IMG_1288.mp4" trimBefore={171} dur={134} cx={0.635} cxs={[[0, 0.655], [38, 0.638], [83, 0.633], [113, 0.613], [134, 0.62]]} z0={1.0} z1={1.04} funde />
        </Sequence>
        <Sequence name="H2 árvore em câmera lenta (fala segue)" from={1371} durationInFrames={116}>
          <Plano src="lento-H2.mp4" trimBefore={0} dur={116} cx={0.44} fx={0.38} fecha={[1.12, 1.5]} z0={1.0} z1={1.06} funde />
        </Sequence>
        <Sequence name="H3 Tamara: magia do Natal" from={1479} durationInFrames={89}>
          <Plano src="g-IMG_1288.mp4" trimBefore={405} dur={89} cx={0.603} z0={1.04} z1={1.07} funde />
        </Sequence>
        {/* I · final: a fachada inteira se revelando, em câmera lenta */}
        <Sequence name="I fachada inteira" from={1560} durationInFrames={120}>
          <Plano src="lento-I.mp4" trimBefore={0} dur={120} cx={0.5} z0={1.0} z1={1.05} caber funde />
        </Sequence>

        <Vinheta />

        {/* ======================= TÍTULOS ======================= */}
        <Sequence name="T abertura" from={0} durationInFrames={190}><Abertura /></Sequence>
        <Sequence name="T a saga foi concluída" from={414} durationInFrames={41}><Rotulo texto="a saga foi concluída" dur={41} /></Sequence>
        <Sequence name="T veludo" from={545} durationInFrames={92}><Rotulo texto="veludo" dur={92} /></Sequence>
        <Sequence name="T maxi laço" from={701} durationInFrames={96}><Rotulo texto="o maxi laço" dur={96} /></Sequence>
        <Sequence name="T 5 metros" from={841} durationInFrames={56}><Rotulo texto="5 metros" dur={56} /></Sequence>
        <Sequence name="T 3 dias" from={1093} durationInFrames={62}><Rotulo texto="3 dias de trabalho" dur={62} /></Sequence>
        <Sequence name="T árvore e fachada" from={1169} durationInFrames={80}><Rotulo texto="árvore e fachada" dur={80} /></Sequence>
        <Sequence name="T magia do Natal" from={1499} durationInFrames={66}><Rotulo texto="a magia do Natal" dur={66} /></Sequence>
        <Sequence name="T final" from={1568} durationInFrames={112}><Final /></Sequence>

        {/* ======================= SOM (só música e falas, sem efeitos) ======================= */}
        <Audio src={staticFile("musica.mp3")} volume={(f) => volMusica(f)} />
        <Sequence name="fala Tamara abertura" from={240} durationInFrames={215}><Audio src={staticFile("voz-1282.wav")} trimBefore={21} volume={(f) => fala(f, 215)} /></Sequence>
        <Sequence name="fala Ronaldo tons e veludo" from={455} durationInFrames={234}><Audio src={staticFile("voz-1284.wav")} trimBefore={5} volume={(f) => fala(f, 234)} /></Sequence>
        <Sequence name="fala Ronaldo maxi laço" from={689} durationInFrames={111}><Audio src={staticFile("voz-1284.wav")} trimBefore={274} volume={(f) => fala(f, 111)} /></Sequence>
        <Sequence name="fala Ronaldo 5 metros" from={809} durationInFrames={62}><Audio src={staticFile("voz-1285.wav")} trimBefore={109} volume={(f) => fala(f, 62)} /></Sequence>
        <Sequence name="fala Ronaldo 3 dias" from={1085} durationInFrames={166}><Audio src={staticFile("voz-1285.wav")} trimBefore={663} volume={(f) => fala(f, 166)} /></Sequence>
        <Sequence name="fala Tamara fecha" from={1253} durationInFrames={315}><Audio src={staticFile("voz-1288.wav")} trimBefore={179} volume={(f) => fala(f, 315)} /></Sequence>
      </AbsoluteFill>
    </Horizontal.Provider>
  );
};
