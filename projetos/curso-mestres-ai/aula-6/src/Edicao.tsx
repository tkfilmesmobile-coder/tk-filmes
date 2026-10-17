import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { Legendas } from "./Legendas";

// Tudo o que é tempo vem de public/edicao.json, gerado por scripts/montar-edicao.mjs
// a partir da fala transcrita: tomadas, enquadramento, trilha do rosto e inserções ancoradas em palavras.
type PontoRosto = { f: number; x: number; y: number; w: number };
type Clipe = {
  id: string;
  trimBefore: number;
  from: number;
  durationInFrames: number;
  enquadramento: { escala: number; tx: number; ty: number };
  rosto: PontoRosto[];
};
type Insercao = {
  arquivo: string;
  ancora: string;
  clipe: string;
  lado: "esquerda" | "direita";
  from: number;
  durationInFrames: number;
};
export type EdicaoProps = {
  clipes: Clipe[];
  insercoes: Insercao[];
};

export const calcularEdicao: CalculateMetadataFunction<EdicaoProps> = async () => {
  const resposta = await fetch(staticFile("edicao.json"));
  const dados = await resposta.json();
  return {
    durationInFrames: dados.durationInFrames,
    fps: dados.fps,
    props: { clipes: dados.clipes, insercoes: dados.insercoes },
  };
};

const FONTE = staticFile("midia/IMG_0397.mp4");
const TAMANHO = 300;

// Gravação original; só o zoom mínimo para o rosto ficar no centro.
const Tomada: React.FC<{ clipe: Clipe }> = ({ clipe }) => {
  const { escala, tx, ty } = clipe.enquadramento;

  return (
    <AbsoluteFill>
      <Video
        name={`Tomada · ${clipe.id}`}
        src={FONTE}
        trimBefore={clipe.trimBefore}
        objectFit="cover"
        style={{ width: "100%", height: "100%", scale: escala, translate: `${tx}px ${ty}px` }}
      />
    </AbsoluteFill>
  );
};

// Posição do rosto no frame atual, interpolada entre as medições.
const rostoNoFrame = (rosto: PontoRosto[], f: number) => {
  const fs = rosto.map((p) => p.f);
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  return {
    x: interpolate(f, fs, rosto.map((p) => p.x), opts),
    y: interpolate(f, fs, rosto.map((p) => p.y), opts),
    w: interpolate(f, fs, rosto.map((p) => p.w), opts),
  };
};

// Inserção ao lado da cabeça, acompanhando o rosto; brilho e vidro desfocado em volta; som na entrada.
const Imagem: React.FC<{ insercao: Insercao; rosto: PontoRosto[] }> = ({
  insercao,
  rosto,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(
    frame,
    [0, 10, durationInFrames - 7, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  const r = rostoNoFrame(rosto, insercao.from + frame);
  const distancia = r.w / 2 + 50 + TAMANHO / 2;
  const cx = Math.min(
    1080 - TAMANHO / 2 - 40,
    Math.max(TAMANHO / 2 + 40, insercao.lado === "esquerda" ? r.x - distancia : r.x + distancia),
  );
  const cy = Math.max(TAMANHO / 2 + 110, r.y - 30);
  const halo = TAMANHO * 1.45;

  return (
    <AbsoluteFill>
      <Audio src={staticFile("sfx/entrada.wav")} volume={0.35} />
      <div
        style={{
          position: "absolute",
          left: cx - halo / 2,
          top: cy - halo / 2,
          width: halo,
          height: halo,
          opacity: t,
          scale: 0.9 + t * 0.1,
        }}
      >
        {/* Brilho quente em volta */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,246,228,0.55) 0%, rgba(255,246,228,0.2) 42%, rgba(255,246,228,0) 68%)",
          }}
        />
        {/* Vidro desfocado atrás da imagem, com borda esfumada */}
        <div
          style={{
            position: "absolute",
            inset: halo * 0.14,
            borderRadius: "50%",
            backdropFilter: "blur(14px)",
            backgroundColor: "rgba(255,255,255,0.1)",
            maskImage: "radial-gradient(circle, black 52%, transparent 71%)",
          }}
        />
        <Img
          name={`Inserção · ${insercao.ancora}`}
          src={staticFile(insercao.arquivo)}
          style={{
            position: "absolute",
            left: (halo - TAMANHO) / 2,
            top: (halo - TAMANHO) / 2,
            width: TAMANHO,
            height: TAMANHO,
            objectFit: "contain",
            filter: `blur(${(1 - t) * 10}px) drop-shadow(0 0 16px rgba(255,255,255,0.5)) drop-shadow(0 10px 18px rgba(0,0,0,0.28))`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Edicao: React.FC<EdicaoProps> = ({ clipes, insercoes }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {clipes.map((c) => (
        <Sequence key={c.id} name={c.id} from={c.from} durationInFrames={c.durationInFrames}>
          <Tomada clipe={c} />
        </Sequence>
      ))}
      {insercoes.map((i) => (
        <Sequence
          key={`${i.arquivo}-${i.from}`}
          name={`Inserção · ${i.ancora}`}
          from={i.from}
          durationInFrames={i.durationInFrames}
        >
          <Imagem insercao={i} rosto={clipes.find((c) => c.id === i.clipe)?.rosto ?? []} />
        </Sequence>
      ))}
      <Legendas arquivo="legendas/edicao.json" />
    </AbsoluteFill>
  );
};
