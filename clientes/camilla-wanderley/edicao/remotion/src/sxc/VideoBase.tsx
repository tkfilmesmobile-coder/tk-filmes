import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";

// O corte da Talyta, contínuo (imagem e som intocados na montagem).
// Cor (roteiro): contraste moderado, brancos limpos, um pouco menos de amarelo, pele natural;
// fundo levemente menos saturado que o rosto (máscara oval em volta do rosto).
// Enquadramento: punch-in/out seco por intervalo, em volta do rosto. Sem zoom deslizando.
export type Punch = { de: number; ate: number; escala: number };

export const VideoBase: React.FC<{
  fonte: string;
  punches: Punch[];
  rosto: (f: number) => { x: number; y: number; w: number };
}> = ({ fonte, punches, rosto }) => {
  const frame = useCurrentFrame();
  const p = punches.find((x) => frame >= x.de && frame < x.ate);
  const r = rosto(frame);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="grade-clinica" colorInterpolationFilters="sRGB">
          {/* balanço: tira um pouco do amarelo sem esfriar a pele */}
          <feColorMatrix type="matrix" values="0.985 0 0 0 0  0 1 0 0 0  0 0 1.035 0 0  0 0 0 1 0" />
          {/* contraste +5% em volta do meio-tom, sem abrir as altas */}
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.05" intercept="-0.025" />
            <feFuncG type="linear" slope="1.05" intercept="-0.025" />
            <feFuncB type="linear" slope="1.05" intercept="-0.025" />
          </feComponentTransfer>
        </filter>
      </svg>
      <Video
        name="Corte da Talyta"
        src={staticFile(fonte)}
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          filter: "url(#grade-clinica)",
          transformOrigin: `${r.x}px ${r.y}px`,
          scale: p ? p.escala : 1,
        }}
      />
      {/* fundo um pouco menos saturado que o rosto */}
      <AbsoluteFill
        style={{
          backdropFilter: "saturate(0.86)",
          maskImage: `radial-gradient(ellipse ${r.w * 1.25}px ${r.w * 1.6}px at ${r.x}px ${r.y + r.w * 0.2}px, transparent 55%, black 100%)`,
          WebkitMaskImage: `radial-gradient(ellipse ${r.w * 1.25}px ${r.w * 1.6}px at ${r.x}px ${r.y + r.w * 0.2}px, transparent 55%, black 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
