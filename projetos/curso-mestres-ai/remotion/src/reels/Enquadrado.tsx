import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

type Ponto = [number, number, number]; // [tempo no original (s), centro x, centro y]

const centroEm = (pontos: Ponto[], t: number): [number, number] => {
  if (t <= pontos[0][0]) return [pontos[0][1], pontos[0][2]];
  for (let i = 1; i < pontos.length; i++) {
    const [t1, x1, y1] = pontos[i];
    if (t <= t1) {
      const [t0, x0, y0] = pontos[i - 1];
      // entre trechos distantes, segura o último ponto em vez de deslizar
      if (t1 - t0 > 0.5) return [x0, y0];
      const k = (t - t0) / (t1 - t0);
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
    }
  }
  const u = pontos[pontos.length - 1];
  return [u[1], u[2]];
};

// Tracking: amplia um pouco (zoom) e move o quadro pra manter o rosto no centro.
// `inicioOrigem`: em que segundo do original este trecho começa.
export const Enquadrado: React.FC<{
  inicioOrigem: number;
  zoom: number;
  pontos: Ponto[];
  children: React.ReactNode;
}> = ({ inicioOrigem, zoom, pontos, children }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const [cx, cy] = centroEm(pontos, inicioOrigem + frame / fps);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${(0.5 - cx) * width * zoom}px, ${(0.5 - cy) * height * zoom}px) scale(${zoom})`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
