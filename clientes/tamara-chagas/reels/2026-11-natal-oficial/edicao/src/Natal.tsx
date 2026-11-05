// Vídeo oficial da decoração de Natal 2026 · Tamara Chagas Advocacia (brutos de 04/11/2026, árvore + fachada)
// Estilo pedido pela Talyta: alto padrão, fluido, sem headline de impacto; títulos elegantes (serifa itálica fina)
// nos momentos de fala; fala misturada com imagens (o som da fala segue por baixo das imagens); nas partes só de
// imagem, a música sobe e os cortes caem nos ataques dela, com efeitos sonoros. Referências: tour de imóvel (títulos
// mínimos em itálico) e Fotober (cortes no ritmo, borrão de movimento, cor cinematográfica).
// Curadoria: cada fala começa e termina em silêncio medido (pausas.py, 20 ms) e foi conferida com o whisper medium.
// Fontes em public/ convertidas pra 3414x1920 (4K deitado); o recorte vertical segue quem fala (cx = centro, 0 a 1).
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: SERIFA } = loadFont("italic", { weights: ["300", "400"], subsets: ["latin", "latin-ext"] });
const { fontFamily: SANS } = loadInter("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = 1710; // 57 s
const CHAMPANHE = "#E6D3B8";
const W = 3414; // largura da fonte em 1920 de altura
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const SUAVE = Easing.bezier(0.42, 0, 0.58, 1);

/* ---------- um plano: recorte vertical de uma fonte deitada, com avanço suave da câmera ---------- */
// cxs = pontos [quadro do plano, centro] medidos com scripts/rosto.py (o recorte segue o rosto de quem fala)
type PlanoProps = { src: string; trimBefore: number; dur: number; cx: number; cxs?: [number, number][]; rate?: number; z0?: number; z1?: number; entrada?: "corte" | "chicote" | "suave"; escuro?: number };
const Plano: React.FC<PlanoProps> = ({ src, trimBefore, dur, cx, cxs, rate = 1, z0 = 1.0, z1 = 1.05, entrada = "corte", escuro = 0 }) => {
  const f = useCurrentFrame();
  const c = cxs ? interpolate(f, cxs.map((k) => k[0]), cxs.map((k) => k[1]), { ...cl, easing: SUAVE }) : cx;
  const left = Math.min(0, Math.max(1080 - W, 540 - c * W));
  const ch = entrada === "chicote" ? interpolate(f, [0, 6], [1, 0], { ...cl, easing: EXPO }) : 0;
  const su = entrada === "suave" ? interpolate(f, [0, 8], [1, 0], { ...cl, easing: SUAVE }) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          scale: interpolate(f, [0, dur], [z0, z1], cl) + ch * 0.06,
          translate: `0px ${ch * 140}px`,
          filter: `blur(${ch * 16 + su * 6}px) contrast(1.06) saturate(1.06) brightness(${1.02 - escuro})`,
          opacity: 1 - su * 0.6,
        }}
      >
        <div style={{ position: "absolute", top: 0, left, width: W, height: 1920 }}>
          <Video src={staticFile(src)} trimBefore={trimBefore} playbackRate={rate} muted style={{ width: W, height: 1920 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- títulos elegantes (serifa itálica fina, como na referência do tour) ---------- */
const Rotulo: React.FC<{ texto: string; dur: number; topo?: number; tam?: number }> = ({ texto, dur, topo = 1290, tam = 88 }) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 18], [0, 1], { ...cl, easing: EXPO });
  const s = interpolate(f, [dur - 14, dur], [1, 0], { ...cl, easing: SUAVE });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* faixa escura suave atrás do título (legível em camisa clara e nas luzes da fachada) */}
      <AbsoluteFill style={{ opacity: Math.min(e, s) * 0.9, background: `linear-gradient(180deg, rgba(8,6,6,0) ${((topo - 260) / 1920) * 100}%, rgba(8,6,6,.55) ${((topo + 50) / 1920) * 100}%, rgba(8,6,6,0) ${((topo + 360) / 1920) * 100}%)` }} />
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
  const a = interpolate(f, [12, 40], [0, 1], { ...cl, easing: EXPO });
  const b = interpolate(f, [24, 56], [0, 1], { ...cl, easing: EXPO });
  const s = interpolate(f, [100, 122], [1, 0], { ...cl, easing: SUAVE });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: s }}>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontSize: 22, letterSpacing: "0.42em", color: CHAMPANHE, opacity: a }}>TAMARA CHAGAS ADVOCACIA</div>
        <div style={{ marginTop: 18, fontFamily: SERIFA, fontStyle: "italic", fontWeight: 300, fontSize: 112, color: "#fff", opacity: b,
          filter: `blur(${(1 - b) * 10}px)`, textShadow: "0 2px 30px rgba(0,0,0,.6)" }}>o Natal chegou</div>
      </div>
    </AbsoluteFill>
  );
};

const Final: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [6, 40], [0, 1], { ...cl, easing: EXPO });
  const b = interpolate(f, [26, 60], [0, 1], { ...cl, easing: EXPO });
  return (
    <AbsoluteFill style={{ background: `rgba(10,8,8,${0.35 + 0.25 * a})`, justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", translate: `0px ${(1 - a) * 20}px` }}>
        <div style={{ fontFamily: SERIFA, fontStyle: "italic", fontWeight: 300, fontSize: 150, color: "#fff", opacity: a, filter: `blur(${(1 - a) * 10}px)` }}>Feliz Natal</div>
        <div style={{ width: 90 * b, height: 1, background: CHAMPANHE, margin: "26px auto 22px" }} />
        <div style={{ fontFamily: SANS, fontSize: 22, letterSpacing: "0.42em", color: CHAMPANHE, opacity: b }}>TAMARA CHAGAS ADVOCACIA · 2026</div>
      </div>
    </AbsoluteFill>
  );
};

const Vinheta: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.38) 100%)" }} />
);

/* ---------- música: baixa nas falas, cheia nas montagens (com respiros antes dos cortes fortes) ---------- */
const MUSICA_PONTOS: [number, number][] = [
  [0, 0.0], [12, 0.9], [168, 0.9], [180, 0.13], // abertura cheia, entra a fala da Tamara
  [384, 0.13], [398, 0.95], [478, 0.95], [490, 0.13], // montagem 1
  [905, 0.13], [928, 0.95], [1104, 0.95], [1116, 0.15], // montagem 2
  [1430, 0.15], [1500, 0.22], [1590, 0.22], [1604, 0.9], // fechamento: cresce de leve com o clímax; volta cheia no final
  [1710, 0.9],
];
const volMusica = (f: number) => interpolate(f, MUSICA_PONTOS.map((p) => p[0]), MUSICA_PONTOS.map((p) => p[1]), cl);
const fala = (f: number, dur: number) => interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], cl);

export const Natal: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ======================= IMAGEM ======================= */}
      {/* 1 · abertura: fachada à noite (plano aberto) */}
      <Sequence name="01 fachada aberta" from={0} durationInFrames={124}>
        <Plano src="IMG_7295.mp4" trimBefore={9} dur={124} cx={0.62} z0={1.0} z1={1.08} />
      </Sequence>
      {/* 2 · aproximação no Papai Noel, no 1º ataque forte da música */}
      <Sequence name="02 Papai Noel" from={124} durationInFrames={50}>
        <Plano src="IMG_7295.mp4" trimBefore={153} dur={50} cx={0.6} z0={1.0} z1={1.04} entrada="chicote" />
      </Sequence>
      {/* 3 · Tamara: "E finalmente a saga da decoração... do Natal de 2026 foi concluída" */}
      <Sequence name="03 Tamara abre" from={174} durationInFrames={96}>
        <Plano src="IMG_1282.mp4" trimBefore={21} dur={96} cx={0.84} cxs={[[0, 0.842], [15, 0.81], [30, 0.76], [45, 0.73], [60, 0.712], [75, 0.68], [96, 0.648]]} z0={1.0} z1={1.03} entrada="suave" />
      </Sequence>
      <Sequence name="04 árvore subindo (fala segue)" from={270} durationInFrames={78}>
        <Plano src="IMG_7303.mp4" trimBefore={248} dur={78} cx={0.56} z0={1.0} z1={1.05} entrada="suave" />
      </Sequence>
      <Sequence name="05 Tamara: foi concluída" from={348} durationInFrames={41}>
        <Plano src="IMG_1282.mp4" trimBefore={195} dur={41} cx={0.58} z0={1.03} z1={1.06} />
      </Sequence>
      {/* 6-8 · montagem 1 (cortes nos ataques 13,05 · 14,05 · 15,12 s) */}
      <Sequence name="06 bolas com luzes" from={389} durationInFrames={33}>
        <Plano src="IMG_7304.mp4" trimBefore={570} dur={33} cx={0.5} rate={1.3} z0={1.04} z1={1.1} entrada="chicote" />
      </Sequence>
      <Sequence name="07 espiral no alto" from={422} durationInFrames={32}>
        <Plano src="IMG_7303.mp4" trimBefore={308} dur={32} cx={0.58} rate={1.4} z0={1.0} z1={1.06} entrada="chicote" />
      </Sequence>
      <Sequence name="08 espiral de veludo" from={454} durationInFrames={32}>
        <Plano src="IMG_7302.mp4" trimBefore={188} dur={32} cx={0.44} rate={1.6} z0={1.0} z1={1.06} entrada="chicote" />
      </Sequence>
      {/* 9-11 · Ronaldo: "A decoração está em tons de maçã. O veludo foi a peça principal pra essa montagem." */}
      <Sequence name="09 Ronaldo: tons" from={486} durationInFrames={78}>
        <Plano src="IMG_1284.mp4" trimBefore={5} dur={78} cx={0.41} z0={1.0} z1={1.03} entrada="suave" />
      </Sequence>
      <Sequence name="10 veludo descendo (fala segue)" from={564} durationInFrames={108}>
        <Plano src="IMG_7304.mp4" trimBefore={405} dur={108} cx={0.5} z0={1.02} z1={1.08} entrada="suave" />
      </Sequence>
      <Sequence name="11 Ronaldo: montagem" from={672} durationInFrames={48}>
        <Plano src="IMG_1284.mp4" trimBefore={191} dur={48} cx={0.383} z0={1.03} z1={1.05} />
      </Sequence>
      {/* 12 · "Criamos o maxi laço, que também é tendência do momento." (sobre o laço) */}
      <Sequence name="12 maxi laço" from={720} durationInFrames={120}>
        <Plano src="IMG_7304.mp4" trimBefore={234} dur={120} cx={0.56} z0={1.0} z1={1.06} entrada="suave" escuro={-0.5} />
      </Sequence>
      {/* 13-14 · "Uma árvore de 5 metros." */}
      <Sequence name="13 Ronaldo: 5 metros" from={840} durationInFrames={27}>
        <Plano src="IMG_1285.mp4" trimBefore={109} dur={27} cx={0.298} z0={1.02} z1={1.04} entrada="suave" />
      </Sequence>
      <Sequence name="14 subida até o topo" from={867} durationInFrames={63}>
        <Plano src="IMG_7302.mp4" trimBefore={248} dur={63} cx={0.44} rate={2} z0={1.0} z1={1.06} entrada="chicote" />
      </Sequence>
      {/* 15-19 · montagem 2 (cortes nos ataques 31,0 · 32,23 · 33,62 · 34,97 · 36,04 s) */}
      <Sequence name="15 veludo enrolado" from={930} durationInFrames={37}>
        <Plano src="IMG_7304.mp4" trimBefore={660} dur={37} cx={0.45} rate={1.3} z0={1.04} z1={1.1} entrada="chicote" />
      </Sequence>
      <Sequence name="16 bolas e laço lateral" from={967} durationInFrames={42}>
        <Plano src="IMG_7303.mp4" trimBefore={128} dur={42} cx={0.55} rate={1.2} z0={1.0} z1={1.06} entrada="chicote" />
      </Sequence>
      <Sequence name="17 base da árvore" from={1009} durationInFrames={40}>
        <Plano src="IMG_7302.mp4" trimBefore={68} dur={40} cx={0.42} rate={1.2} z0={1.06} z1={1.0} entrada="chicote" />
      </Sequence>
      <Sequence name="18 bolas maxi" from={1049} durationInFrames={32}>
        <Plano src="IMG_7304.mp4" trimBefore={732} dur={32} cx={0.48} z0={1.0} z1={1.05} entrada="chicote" />
      </Sequence>
      <Sequence name="19 fachada: Papai Noel" from={1081} durationInFrames={35}>
        <Plano src="IMG_7295.mp4" trimBefore={330} dur={35} cx={0.62} z0={1.0} z1={1.04} entrada="chicote" />
      </Sequence>
      {/* 20-21 · "Mas foram 3 dias de trabalho para produzir tanto a árvore quanto a fachada, que vocês vão ver também." */}
      <Sequence name="20 Ronaldo: 3 dias" from={1116} durationInFrames={72}>
        <Plano src="IMG_1285.mp4" trimBefore={663} dur={72} cx={0.377} cxs={[[0, 0.377], [30, 0.372], [50, 0.358], [72, 0.334]]} z0={1.0} z1={1.03} entrada="suave" />
      </Sequence>
      <Sequence name="21 fachada (fala segue)" from={1188} durationInFrames={96}>
        <Plano src="IMG_7295.mp4" trimBefore={222} dur={96} cx={0.6} z0={1.0} z1={1.06} entrada="suave" />
      </Sequence>
      {/* 22-24 · Tamara fecha: "E toda essa decoração foi pensada com muito carinho... a magia do Natal." */}
      <Sequence name="22 Tamara: carinho" from={1284} durationInFrames={126}>
        <Plano src="IMG_1288.mp4" trimBefore={179} dur={126} cx={0.635} cxs={[[0, 0.655], [30, 0.638], [75, 0.633], [105, 0.613], [126, 0.62]]} z0={1.0} z1={1.04} entrada="suave" />
      </Sequence>
      <Sequence name="23 árvore em câmera lenta (fala segue)" from={1410} durationInFrames={108}>
        <Plano src="IMG_7302.mp4" trimBefore={120} dur={108} cx={0.44} rate={0.6} z0={1.02} z1={1.08} entrada="suave" />
      </Sequence>
      <Sequence name="24 Tamara: magia do Natal" from={1518} durationInFrames={81}>
        <Plano src="IMG_1288.mp4" trimBefore={413} dur={81} cx={0.603} z0={1.04} z1={1.07} />
      </Sequence>
      {/* 25 · final: Papai Noel da fachada em câmera lenta */}
      <Sequence name="25 final" from={1599} durationInFrames={111}>
        <Plano src="IMG_7295.mp4" trimBefore={465} dur={111} cx={0.6} rate={0.6} z0={1.04} z1={1.0} entrada="suave" escuro={0.08} />
      </Sequence>

      <Vinheta />

      {/* ======================= TÍTULOS ======================= */}
      <Sequence name="T abertura" from={0} durationInFrames={124}><Abertura /></Sequence>
      <Sequence name="T a saga foi concluída" from={348} durationInFrames={41}><Rotulo texto="a saga foi concluída" dur={41} /></Sequence>
      <Sequence name="T veludo" from={576} durationInFrames={92}><Rotulo texto="veludo" dur={92} /></Sequence>
      <Sequence name="T maxi laço" from={732} durationInFrames={96}><Rotulo texto="o maxi laço" dur={96} /></Sequence>
      <Sequence name="T 5 metros" from={872} durationInFrames={56}><Rotulo texto="5 metros" dur={56} /></Sequence>
      <Sequence name="T 3 dias" from={1124} durationInFrames={62}><Rotulo texto="3 dias de trabalho" dur={62} /></Sequence>
      <Sequence name="T árvore e fachada" from={1200} durationInFrames={80}><Rotulo texto="árvore e fachada" dur={80} /></Sequence>
      <Sequence name="T magia do Natal" from={1530} durationInFrames={66}><Rotulo texto="a magia do Natal" dur={66} /></Sequence>
      <Sequence name="T final" from={1599} durationInFrames={111}><Final /></Sequence>

      {/* ======================= SOM ======================= */}
      <Audio src={staticFile("musica.mp3")} volume={(f) => volMusica(f)} />
      {/* falas (som contínuo por baixo das imagens; entrada e saída de 3 quadros pra não estalar no corte) */}
      <Sequence name="fala Tamara abertura" from={174} durationInFrames={215}><Audio src={staticFile("voz-1282.wav")} trimBefore={21} volume={(f) => fala(f, 215)} /></Sequence>
      <Sequence name="fala Ronaldo tons e veludo" from={486} durationInFrames={234}><Audio src={staticFile("voz-1284.wav")} trimBefore={5} volume={(f) => fala(f, 234)} /></Sequence>
      <Sequence name="fala Ronaldo maxi laço" from={720} durationInFrames={111}><Audio src={staticFile("voz-1284.wav")} trimBefore={274} volume={(f) => fala(f, 111)} /></Sequence>
      <Sequence name="fala Ronaldo 5 metros" from={840} durationInFrames={62}><Audio src={staticFile("voz-1285.wav")} trimBefore={109} volume={(f) => fala(f, 62)} /></Sequence>
      <Sequence name="fala Ronaldo 3 dias" from={1116} durationInFrames={166}><Audio src={staticFile("voz-1285.wav")} trimBefore={663} volume={(f) => fala(f, 166)} /></Sequence>
      <Sequence name="fala Tamara fecha" from={1284} durationInFrames={315}><Audio src={staticFile("voz-1288.wav")} trimBefore={179} volume={(f) => fala(f, 315)} /></Sequence>
      {/* efeitos: brilho nos títulos, sopro nas transições, grave só nos pontos fortes */}
      <Sequence from={4} durationInFrames={80}><Audio src={staticFile("sfx/brilho.wav")} volume={0.32} /></Sequence>
      <Sequence from={117} durationInFrames={27}><Audio src={staticFile("sfx/sopro.wav")} volume={0.5} /></Sequence>
      <Sequence from={124} durationInFrames={60}><Audio src={staticFile("sfx/whoosh-grave-impacto.wav")} volume={0.3} /></Sequence>
      <Sequence from={265} durationInFrames={27}><Audio src={staticFile("sfx/sopro.wav")} volume={0.16} /></Sequence>
      <Sequence from={383} durationInFrames={27}><Audio src={staticFile("sfx/sopro.wav")} volume={0.45} /></Sequence>
      <Sequence from={416} durationInFrames={27}><Audio src={staticFile("sfx/sopro.wav")} volume={0.4} /></Sequence>
      <Sequence from={448} durationInFrames={27}><Audio src={staticFile("sfx/sopro.wav")} volume={0.4} /></Sequence>
      <Sequence from={348} durationInFrames={70}><Audio src={staticFile("sfx/brilho.wav")} volume={0.12} /></Sequence>
      <Sequence from={862} durationInFrames={40}><Audio src={staticFile("sfx/whoosh-grave.wav")} volume={0.22} /></Sequence>
      <Sequence from={924} durationInFrames={27}><Audio src={staticFile("sfx/sopro.wav")} volume={0.45} /></Sequence>
      <Sequence from={961} durationInFrames={27}><Audio src={staticFile("sfx/sopro.wav")} volume={0.4} /></Sequence>
      <Sequence from={1003} durationInFrames={27}><Audio src={staticFile("sfx/sopro.wav")} volume={0.4} /></Sequence>
      <Sequence from={1043} durationInFrames={27}><Audio src={staticFile("sfx/sopro.wav")} volume={0.4} /></Sequence>
      <Sequence from={1075} durationInFrames={40}><Audio src={staticFile("sfx/whoosh-grave.wav")} volume={0.26} /></Sequence>
      <Sequence from={1530} durationInFrames={70}><Audio src={staticFile("sfx/brilho.wav")} volume={0.14} /></Sequence>
      <Sequence from={1599} durationInFrames={80}><Audio src={staticFile("sfx/brilho.wav")} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
