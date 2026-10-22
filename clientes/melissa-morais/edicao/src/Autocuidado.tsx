import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

// 2ª edição do pacote da Dra. Melissa (2026-10-21): reel "autocuidado" no estilo da referência da
// @drajullinelacet: cenas do atendimento com fusão suave, frase em serifa branca surgindo palavra por
// palavra e fecho com a logo. Takes de 11/09 cortados por scripts/preparar-takes.py.
export const FPS = 30;
const FUSAO = 8; // quadros de fusão entre as cenas

type Cena = { src: string; dur: number; frase?: string };
const CENAS: Cena[] = [
  // abertura: IMG_4072 mais perto, como a cliente pediu (2026-10-22); o close dos lábios entra no segundo 4
  { src: "takes/c0-abertura.mp4", dur: 120, frase: "cuidar da sua beleza" },
  { src: "takes/c1-labios.mp4", dur: 90, frase: "é também cuidar de você" },
  { src: "takes/c2-doutora.mp4", dur: 90, frase: "autocuidado é pausa," },
  { src: "takes/c3-maos.mp4", dur: 78, frase: "é escuta, é acolhimento" },
  { src: "takes/c5-perfil.mp4", dur: 99, frase: "é tempo pra você" },
  { src: "takes/c6-espelho.mp4", dur: 102, frase: "e se reconhecer no espelho" },
  { src: "takes/c7-sorriso.mp4", dur: 99 },
  { src: "takes/c8-final.mp4", dur: 99, frase: "reserve um momento só seu" },
];
const T_FIM = 81;
const INICIOS = CENAS.reduce<number[]>((acc, c, i) => [...acc, i === 0 ? 0 : acc[i - 1] + CENAS[i - 1].dur], []);
const T_CENAS = INICIOS[INICIOS.length - 1] + CENAS[CENAS.length - 1].dur;
export const DURACAO_AUTOCUIDADO = T_CENAS + T_FIM;

const serif = loadSerif("normal").fontFamily;
const suave = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// frase palavra por palavra, como na referência
const Frase: React.FC<{ texto: string; dur: number }> = ({ texto, dur }) => {
  const frame = useCurrentFrame();
  const palavras = texto.split(" ");
  const sai = interpolate(frame, [dur - 10, dur - 2], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top: 1150,
        textAlign: "center",
        fontFamily: serif,
        fontSize: 78,
        lineHeight: 1.08,
        color: "#fff",
        // sombra leve pra destacar, mesmo tamanho (pedido da Talyta, 2026-10-21)
        textShadow: "0 2px 6px rgba(0,0,0,0.55), 0 4px 28px rgba(0,0,0,0.5)",
        opacity: sai,
      }}
    >
      {palavras.map((p, i) => {
        const de = 10 + i * 6;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.24em",
              opacity: interpolate(frame, [de, de + 9], [0, 1], clamp),
              translate: `0px ${interpolate(frame, [de, de + 9], [10, 0], { ...clamp, easing: suave })}px`,
              filter: `blur(${interpolate(frame, [de, de + 9], [4, 0], clamp)}px)`,
            }}
          >
            {p}
          </span>
        );
      })}
    </div>
  );
};

const UmaCena: React.FC<{ c: Cena; primeira: boolean }> = ({ c, primeira }) => {
  const frame = useCurrentFrame();
  const total = c.dur + FUSAO;
  return (
    <AbsoluteFill
      style={{
        opacity: primeira ? 1 : interpolate(frame, [0, FUSAO], [0, 1], clamp),
        scale: String(interpolate(frame, [0, total], [1, 1.06], clamp)),
      }}
    >
      {/* cada trecho tem 0,3 s de folga antes; a fusão começa FUSAO quadros antes da cena */}
      <Video
        src={staticFile(c.src)}
        muted
        trimBefore={primeira ? 9 : 9 - FUSAO}
        style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover" }}
      />
      {c.frase ? (
        <Sequence from={primeira ? 0 : FUSAO} layout="none">
          <Frase texto={c.frase} dur={c.dur} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

// fecho só com a logo, sem o CRO (pedido da Talyta, 2026-10-21)
const Fecho: React.FC = () => {
  const frame = useCurrentFrame();
  const entra = interpolate(frame, [4, 26], [0, 1], { ...clamp, easing: suave });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(frame, [0, FUSAO], [0, 1], clamp) }}>
      <Img
        src={staticFile("marca/logo-branca.png")}
        style={{
          position: "absolute",
          width: 640,
          height: (640 * 697) / 1600,
          left: 220,
          top: 760,
          opacity: entra,
          scale: String(interpolate(entra, [0, 1], [1.06, 1])),
        }}
      />
    </AbsoluteFill>
  );
};

export const Autocuidado: React.FC<{ identificacao: string }> = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Audio src={staticFile("audio/musica-autocuidado.wav")} volume={0.6} />
    {CENAS.map((c, i) => (
      <Sequence
        key={c.src}
        name={c.src}
        from={i === 0 ? 0 : INICIOS[i] - FUSAO}
        durationInFrames={c.dur + (i === 0 ? 0 : FUSAO)}
        layout="none"
      >
        <UmaCena c={c} primeira={i === 0} />
      </Sequence>
    ))}
    <Sequence name="Fecho" from={T_CENAS - FUSAO} durationInFrames={T_FIM + FUSAO} layout="none">
      <Fecho />
    </Sequence>
  </AbsoluteFill>
);
