import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import doutora from "./doutora.json";
import { T } from "./tempos";

// Captação orgânica: plano aberto da consulta (paciente à esquerda, doutora à direita).
// O vertical 1080×1920 é reenquadrado na doutora pelo rastreio do rosto (doutora.json, suavizado),
// com o rosto no terço superior e o máximo de centralização que o quadro permite sem mostrar borda.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
const ROSTO_Y = 760; // altura do rosto na tela (acima da legenda, longe do topo)
const FPS = 30;
const BLOCOS: [number, number][] = [
  [T.triDe, T.triAte],
  [T.antesDe, T.antesAte],
  [T.limpezaDe, T.limpezaAte],
];

// câmera virtual num quadro absoluto da composição
export const camera = (frame: number) => {
  const s = frame / FPS;
  const [fx, fy, fw] = doutora[Math.max(0, Math.min(doutora.length - 1, frame))];
  const escala =
    interpolate(s, [T.pushDe, T.pushAte], [1, 2.15], { ...clamp, easing: SUAVE }) *
    interpolate(s, T.enfases.map((e) => e[0]), T.enfases.map((e) => e[1]), { ...clamp, easing: SUAVE });
  // nos blocos gráficos o rosto desce pra baixo da headline (como na abertura)
  const bloco = BLOCOS.find(([a, b]) => s > a - 0.2 && s < b + 0.2);
  const rostoY = bloco
    ? interpolate(s, [bloco[0] - 0.1, bloco[0] + 0.35, bloco[1] - 0.35, bloco[1] + 0.1], [ROSTO_Y, 1110, 1110, ROSTO_Y], { ...clamp, easing: SUAVE })
    : ROSTO_Y;
  const cx = Math.min(1080 - 540 / escala, Math.max(540 / escala, fx));
  const cy = Math.min(1920 - 960 / escala, Math.max(960 / escala, fy + (960 - rostoY) / escala));
  return { escala, cx, cy, rosto: { x: 540 + (fx - cx) * escala, y: 960 + (fy - cy) * escala, w: fw * escala } };
};

// de: quadro (da composição) em que esta camada começa; o vídeo é cortado pra continuar no mesmo ponto
export const Enquadramento: React.FC<{ de: number }> = ({ de }) => {
  const { escala, cx, cy } = camera(useCurrentFrame() + de);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#F3E6E2" }}>
      <Video
        name="Vídeo original (reenquadrado)"
        src={staticFile("midia/periodontite.mp4")}
        muted
        trimBefore={de}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transformOrigin: "0px 0px",
          translate: `${540 - cx * escala}px ${960 - cy * escala}px`,
          scale: escala,
        }}
      />
    </AbsoluteFill>
  );
};
