import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

// Teste do pipeline Veo → recorte → WebM com alfa → sobre o vídeo da Dra. (2026-09-30)
export const TesteAlfa: React.FC = () => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile("midia/sensibilidade-x-canal.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <OffthreadVideo
      src={staticFile("motion/teste_alfa.webm")}
      transparent
      muted
      style={{ position: "absolute", left: 470, top: 120, width: 640, height: 1138 }}
    />
  </AbsoluteFill>
);
