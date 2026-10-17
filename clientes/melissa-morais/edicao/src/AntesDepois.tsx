import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { z } from "zod";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/Montserrat";
import rosto from "./rosto.json";

export const FPS = 30;

// Cenas, em quadros (30 fps)
const T_INTRO = 78; // 2,6 s: um compasso da trilha
const T_PAR = 126; // 4,2 s cada par
const T_VIDEO = 228; // 7,6 s
const T_FIM = 96; // 3,2 s
export const DURACAO = T_INTRO + T_PAR * 2 + T_VIDEO + T_FIM;

export const schema = z.object({ identificacao: z.string() });
type Props = z.infer<typeof schema>;

const serif = loadSerif("normal").fontFamily;
loadSerif("italic");
const sans = loadSans("normal", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily;

const W = 1080;
const H = 1920;
const GAP = 4; // fio preto entre antes e depois
const METADE = (H - GAP) / 2; // 958
const OLHOS_Y = 430; // altura dos olhos dentro de cada metade
const DIST_OLHOS = 318; // distância entre os olhos, em px

const suave = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sombra = "0 2px 36px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)";

const Texto: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: sans,
      fontWeight: 600,
      fontSize: 22,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.92)",
      ...style,
    }}
  >
    {children}
  </div>
);

// Única camada de texto sobre as imagens: a headline, em serifa com uma palavra em itálico.
const Headline: React.FC<{
  antes: string;
  destaque: string;
  depois?: string;
  frame: number;
  de: number;
  tamanho?: number;
  top: number;
}> = ({ antes, destaque, depois = "", frame, de, tamanho = 108, top }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      width: W,
      top,
      textAlign: "center",
      fontFamily: serif,
      fontSize: tamanho,
      lineHeight: 1.02,
      letterSpacing: "-0.02em",
      color: "#fff",
      textShadow: sombra,
      opacity: interpolate(frame, [de, de + 18], [0, 1], clamp),
      translate: `0px ${interpolate(frame, [de, de + 18], [26, 0], { ...clamp, easing: suave })}px`,
    }}
  >
    {antes}
    <span style={{ fontStyle: "italic" }}>{destaque}</span>
    {depois}
  </div>
);

// Efeitos sonoros (sintetizados; graves, nada agudo)
const Sfx: React.FC<{ nome: string; em: number; volume?: number }> = ({ nome, em, volume = 0.8 }) => (
  <Sequence from={em} layout="none">
    <Audio src={staticFile(`audio/sfx/${nome}.wav`)} volume={volume} />
  </Sequence>
);

// Mira: quatro cantos, sem texto. Segue o rosto.
const Mira: React.FC<{ x: number; y: number; w: number; h: number; progresso: number }> = ({
  x,
  y,
  w,
  h,
  progresso,
}) => {
  const L = 34;
  const c = "rgba(255,255,255,0.95)";
  const canto = (pos: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    width: L,
    height: L,
    ...pos,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        opacity: progresso,
        scale: String(interpolate(progresso, [0, 1], [1.2, 1])),
        filter: "drop-shadow(0 0 6px rgba(0,0,0,0.35))",
      }}
    >
      <div style={canto({ left: 0, top: 0, borderLeft: `2.5px solid ${c}`, borderTop: `2.5px solid ${c}` })} />
      <div style={canto({ right: 0, top: 0, borderRight: `2.5px solid ${c}`, borderTop: `2.5px solid ${c}` })} />
      <div style={canto({ left: 0, bottom: 0, borderLeft: `2.5px solid ${c}`, borderBottom: `2.5px solid ${c}` })} />
      <div style={canto({ right: 0, bottom: 0, borderRight: `2.5px solid ${c}`, borderBottom: `2.5px solid ${c}` })} />
    </div>
  );
};

// Foto posicionada pelos olhos: mesma altura e mesma distância entre os olhos nas duas metades.
type Foto = { src: string; w: number; h: number; olhoX: number; olhoY: number; dist: number };

const posicao = (f: Foto) => {
  const s = Math.max(DIST_OLHOS / f.dist, W / f.w, METADE / f.h);
  const left = Math.min(0, Math.max(W - f.w * s, W / 2 - f.olhoX * s));
  const top = Math.min(0, Math.max(METADE - f.h * s, OLHOS_Y - f.olhoY * s));
  return { s, left, top, xo: left + f.olhoX * s, yo: top + f.olhoY * s, d: f.dist * s };
};

const Metade: React.FC<{
  foto: Foto;
  deriva: number;
  mira: { alturaEmOlhos: number; larg: number; alt: number };
  miraProgresso: number;
}> = ({ foto, deriva, mira, miraProgresso }) => {
  const p = posicao(foto);
  return (
    <div style={{ position: "relative", width: W, height: METADE, overflow: "hidden" }}>
      {/* aproximação lenta ao longo da cena; a mira vai junto, presa ao rosto */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${p.xo}px ${p.yo}px`,
          scale: String(deriva),
        }}
      >
        <Img
          src={staticFile(foto.src)}
          style={{ position: "absolute", width: foto.w * p.s, height: foto.h * p.s, left: p.left, top: p.top }}
        />
        <Mira
          x={p.xo}
          y={p.yo - mira.alturaEmOlhos * p.d}
          w={mira.larg * p.d}
          h={mira.alt * p.d}
          progresso={miraProgresso}
        />
      </div>
    </div>
  );
};

// Palavra solta em serifa itálica, no canto (parede ou cabelo), nunca sobre o rosto
const Marca: React.FC<{ texto: string; top: number; progresso: number }> = ({ texto, top, progresso }) => (
  <div
    style={{
      position: "absolute",
      left: 56,
      top,
      fontFamily: serif,
      fontStyle: "italic",
      fontSize: 64,
      color: "#fff",
      textShadow: sombra,
      opacity: progresso,
    }}
  >
    {texto}
  </div>
);

// Cena com o par antes/depois empilhado, de tela cheia
const Par: React.FC<{
  antes: Foto;
  depois: Foto;
  mira: { alturaEmOlhos: number; larg: number; alt: number };
  titulo: { antes: string; destaque: string; depois?: string };
}> = ({ antes, depois, mira, titulo }) => {
  const frame = useCurrentFrame();
  const entra = interpolate(frame, [0, 14], [0, 1], clamp);
  const sai = interpolate(frame, [T_PAR - 8, T_PAR], [1, 0], clamp);
  // o "depois" é revelado de cima pra baixo
  const revela = interpolate(frame, [26, 52], [100, 0], { ...clamp, easing: suave });
  const miraIn = interpolate(frame, [18, 34], [0, 1], { ...clamp, easing: suave });
  const miraIn2 = interpolate(frame, [46, 62], [0, 1], { ...clamp, easing: suave });
  const deriva = interpolate(frame, [0, T_PAR], [1, 1.05], { ...clamp, easing: Easing.linear });

  return (
    <AbsoluteFill style={{ opacity: sai }}>
      <div style={{ position: "absolute", left: 0, top: 0, opacity: entra, scale: String(interpolate(entra, [0, 1], [1.03, 1])) }}>
        <Metade foto={antes} deriva={deriva} mira={mira} miraProgresso={miraIn} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: METADE + GAP,
          clipPath: `inset(0 0 ${revela}% 0)`,
        }}
      >
        <Metade foto={depois} deriva={deriva} mira={mira} miraProgresso={miraIn2} />
      </div>
      {/* véu leve no meio, só pra headline respirar (queixo da parte de cima e cabelo da de baixo) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: 800,
          height: 330,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.34) 45%, rgba(0,0,0,0.34) 55%, rgba(0,0,0,0) 100%)",
          opacity: interpolate(frame, [50, 70], [0, 1], clamp),
        }}
      />
      <Marca texto="antes" top={64} progresso={interpolate(frame, [20, 36], [0, 1], clamp)} />
      <Marca texto="depois" top={METADE + GAP + 64} progresso={interpolate(frame, [48, 64], [0, 1], clamp)} />
      <Headline {...titulo} frame={frame} de={60} top={858} />
      <Sfx nome="toque" em={0} volume={0.6} />
      <Sfx nome="subida" em={8} volume={0.6} />
      <Sfx nome="impacto" em={26} volume={0.8} />
      <Sfx nome="toque" em={18} volume={0.5} />
      <Sfx nome="toque" em={46} volume={0.5} />
      <Sfx nome="brilho" em={62} volume={0.45} />
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const sai = interpolate(frame, [T_INTRO - 10, T_INTRO], [1, 0], clamp);
  const aparece = (de: number) => ({
    opacity: interpolate(frame, [de, de + 18], [0, 1], clamp),
    translate: `0px ${interpolate(frame, [de, de + 18], [30, 0], { ...clamp, easing: suave })}px`,
  });
  return (
    <AbsoluteFill style={{ opacity: sai }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: 700,
          textAlign: "center",
          fontFamily: serif,
          fontSize: 196,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          color: "#fff",
          ...aparece(4),
        }}
      >
        Dra. Melissa
        <br />
        <span style={{ fontStyle: "italic" }}>Morais</span>
      </div>
      <div style={{ position: "absolute", left: 0, width: W, top: 1130, textAlign: "center", ...aparece(24) }}>
        <Texto style={{ fontSize: 28, letterSpacing: "0.3em" }}>Harmonização facial</Texto>
      </div>
      <Sfx nome="impacto" em={4} volume={0.8} />
      <Sfx nome="brilho" em={26} volume={0.5} />
    </AbsoluteFill>
  );
};

// Posição do rosto no quadro de origem do clipe (rosto.json, scripts/rosto.py)
const pontoDoRosto = (frameDaCena: number) => {
  const origem = Math.round(1 * FPS + frameDaCena * 1.5); // trimBefore 1 s, 1,5x
  const i = Math.max(0, Math.min(rosto.pontos.length - 1, origem));
  return rosto.pontos[i];
};

const Giro: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = interpolate(frame, [0, 14], [0, 1], clamp);
  const sai = interpolate(frame, [T_VIDEO - 8, T_VIDEO], [1, 0], clamp);
  const miraIn = interpolate(frame, [38, 56], [0, 1], { ...clamp, easing: suave });
  const p = pontoDoRosto(frame);
  // a mira acompanha a testa: o topo da caixa do rosto fica na linha do cabelo, então desce um pouco
  const mx = p.x * W;
  const my = (p.y - p.h * 0.5 + p.h * 0.21) * H;
  return (
    <AbsoluteFill style={{ opacity: sai }}>
      <div style={{ position: "absolute", inset: 0, opacity: entra }}>
        <Video
          src={staticFile("video/depois-giro.mp4")}
          muted
          trimBefore={1 * FPS}
          playbackRate={1.5}
          style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover" }}
        />
        <Mira x={mx} y={my} w={p.w * W * 0.62} h={p.h * H * 0.3} progresso={miraIn} />
      </div>
      {/* véu embaixo, sobre a roupa, pra o nome ler bem */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: 1260,
          height: 660,
          background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)",
          opacity: interpolate(frame, [16, 40], [0, 1], clamp),
        }}
      />
      <Headline antes="Dra. Melissa " destaque="Morais" frame={frame} de={22} top={1530} tamanho={132} />
      <Sfx nome="impacto" em={2} volume={0.8} />
      <Sfx nome="subida" em={0} volume={0.5} />
      <Sfx nome="toque" em={38} volume={0.55} />
      <Sfx nome="brilho" em={24} volume={0.5} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<{ identificacao: string }> = ({ identificacao }) => {
  const frame = useCurrentFrame();
  const sai = interpolate(frame, [T_FIM - 10, T_FIM], [1, 0], clamp);
  const aparece = (de: number) => ({
    opacity: interpolate(frame, [de, de + 18], [0, 1], clamp),
    translate: `0px ${interpolate(frame, [de, de + 18], [30, 0], { ...clamp, easing: suave })}px`,
  });
  return (
    <AbsoluteFill style={{ opacity: sai }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: 690,
          textAlign: "center",
          fontFamily: serif,
          fontSize: 196,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          color: "#fff",
          ...aparece(4),
        }}
      >
        Dra. Melissa
        <br />
        <span style={{ fontStyle: "italic" }}>Morais</span>
      </div>
      <div style={{ position: "absolute", left: 0, width: W, top: 1120, textAlign: "center", ...aparece(22) }}>
        <Texto style={{ fontSize: 28, letterSpacing: "0.3em" }}>Harmonização facial</Texto>
        <Texto style={{ fontWeight: 400, fontSize: 21, marginTop: 14, color: "rgba(255,255,255,0.66)" }}>
          {identificacao}
        </Texto>
      </div>
      {/* avisos obrigatórios ficam aqui, no fundo preto, e não em cima das imagens */}
      <div
        style={{
          position: "absolute",
          left: 60,
          width: W - 120,
          top: 1470,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 19,
          lineHeight: 1.6,
          letterSpacing: "0.04em",
          color: "rgba(255,255,255,0.5)",
          ...aparece(34),
        }}
      >
        Imagens com autorização da paciente.
        <br />
        Conteúdo informativo. Na dúvida, consulte o seu conselho.
      </div>
      <Sfx nome="impacto" em={4} volume={0.8} />
      <Sfx nome="brilho" em={24} volume={0.5} />
    </AbsoluteFill>
  );
};

// Medidas tiradas das fotos originais (olho médio e distância entre os olhos, em px)
const FOTOS = {
  antesSobr: { src: "fotos/antes-sobrancelha-levantada.jpg", w: 1200, h: 1600, olhoX: 557, olhoY: 733, dist: 274 },
  depoisSobr: { src: "fotos/depois-sobrancelha-levantada.jpg", w: 736, h: 1600, olhoX: 360, olhoY: 672, dist: 217 },
  antesFranzir: { src: "fotos/antes-franzir.jpg", w: 1200, h: 1600, olhoX: 587, olhoY: 703, dist: 266 },
  depoisFranzir: { src: "fotos/depois-franzir.jpg", w: 736, h: 1600, olhoX: 362, olhoY: 711, dist: 208 },
} satisfies Record<string, Foto>;

export const AntesDepois: React.FC<Props> = ({ identificacao }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("audio/musica.wav")} volume={0.55} />
      <Sequence name="Abertura" from={0} durationInFrames={T_INTRO} layout="none">
        <Intro />
      </Sequence>
      <Sequence name="Par 1 · sobrancelhas" from={T_INTRO} durationInFrames={T_PAR} layout="none">
        <Par
          antes={FOTOS.antesSobr}
          depois={FOTOS.depoisSobr}
          mira={{ alturaEmOlhos: 0.9, larg: 1.2, alt: 0.8 }}
          titulo={{ antes: "Ao ", destaque: "elevar", depois: " as sobrancelhas" }}
        />
      </Sequence>
      <Sequence name="Par 2 · franzir" from={T_INTRO + T_PAR} durationInFrames={T_PAR} layout="none">
        <Par
          antes={FOTOS.antesFranzir}
          depois={FOTOS.depoisFranzir}
          mira={{ alturaEmOlhos: 0.53, larg: 0.9, alt: 0.62 }}
          titulo={{ antes: "Ao ", destaque: "franzir", depois: " a testa" }}
        />
      </Sequence>
      <Sequence name="Depois em movimento" from={T_INTRO + T_PAR * 2} durationInFrames={T_VIDEO} layout="none">
        <Giro />
      </Sequence>
      <Sequence name="Fecho" from={T_INTRO + T_PAR * 2 + T_VIDEO} durationInFrames={T_FIM} layout="none">
        <Fim identificacao={identificacao} />
      </Sequence>
    </AbsoluteFill>
  );
};
