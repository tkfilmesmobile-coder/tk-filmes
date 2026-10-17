import { AbsoluteFill, useCurrentFrame } from "remotion";

// Color grade do Galeguinho pra vídeo: o mesmo clima dos posts (quente, contrastado, com grão),
// em dose de vídeo. O filtro vai no <Video>; aqui ficam as camadas por cima da imagem.
export const FILTRO_DO_GRADE =
  "contrast(1.09) saturate(1.16) brightness(1.03) sepia(0.06)";

export const Acabamento: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Calor nos meios-tons: puxa a luz de rua pro laranja da casa */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 55% at 50% 42%, rgba(255,170,80,0.10), rgba(255,170,80,0) 75%)",
          mixBlendMode: "soft-light",
        }}
      />
      {/* Sombras levemente azuladas: separa o apresentador do fundo */}
      <AbsoluteFill
        style={{
          backgroundColor: "rgba(20,34,58,0.10)",
          mixBlendMode: "multiply",
        }}
      />
      {/* Vinheta suave: fecha as bordas e leva o olho pro centro */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(95% 78% at 50% 44%, rgba(0,0,0,0) 58%, rgba(8,5,2,0.42) 100%)",
        }}
      />
      {/* Grão de filme, com semente por frame (determinístico) */}
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="grao">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed={frame % 12}
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grao)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
