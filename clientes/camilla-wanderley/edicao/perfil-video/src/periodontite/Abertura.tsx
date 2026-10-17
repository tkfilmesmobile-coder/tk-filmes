import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "./tempos";

// Abertura: a própria filmagem com zoom de ênfase. A imagem cresce a partir do topo e desce um pouco,
// levando o rosto pra baixo da headline sem sair do quadro (o vão que abre no alto fica sob o véu blush).
// Antes da headline sair, volta ao quadro normal pra emendar no enquadramento da doutora.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);

export const AberturaVideo: React.FC = () => {
  const s = useCurrentFrame() / useVideoConfig().fps;
  const k = interpolate(s, [T.zoomDe, T.zoomAte, T.saiDe, T.saiAte], [0, 1, 1, 0], { ...clamp, easing: SUAVE });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        name="Vídeo original (abertura)"
        src={staticFile("midia/periodontite.mp4")}
        muted
        style={{ width: 1080, height: 1920, transformOrigin: "540px 0px", scale: 1 + 0.14 * k, translate: `0px ${T.descida * k}px` }}
      />
    </AbsoluteFill>
  );
};
