import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { Legendas } from "./Legendas";
import { Card, Cta, Headline } from "./Componentes";
import type { Clipe, ReelProps } from "./tipos";

// Tomada com enquadramento virtual: o zoom gira em volta do rosto (punch-in como pontuação)
// e o corte é seco. Tratamento de cor quente e contraste um pouco mais alto, sem cara de LUT.
const Tomada: React.FC<{ clipe: Clipe; fonte: string }> = ({ clipe, fonte }) => {
  const frame = useCurrentFrame();
  const fs = clipe.quadros.map((q) => q.f);
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.linear } as const;
  const escala = fs.length > 1 ? interpolate(frame, fs, clipe.quadros.map((q) => q.escala), opts) : clipe.quadros[0].escala;
  const tx = fs.length > 1 ? interpolate(frame, fs, clipe.quadros.map((q) => q.tx), opts) : clipe.quadros[0].tx;
  const ty = fs.length > 1 ? interpolate(frame, fs, clipe.quadros.map((q) => q.ty), opts) : clipe.quadros[0].ty;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        name={`Tomada · ${clipe.id}`}
        src={staticFile(fonte)}
        trimBefore={clipe.trimBefore}
        // Fade de 2 quadros nas bordas: o corte cai no silêncio e não estala
        volume={(f) =>
          interpolate(f, [0, 2, clipe.durationInFrames - 2, clipe.durationInFrames], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: `${clipe.rosto.x}px ${clipe.rosto.y}px`,
          transform: `translate(${tx}px, ${ty}px) scale(${escala})`,
          filter: "contrast(1.03) saturate(0.96)",
        }}
      />
      {/* Sombras levemente fechadas nas bordas, fundo mais quente que o rosto */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.14) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({ fonte, clipes, headlines, cards, cta, legendas }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1C1416" }}>
      {clipes.map((c) => (
        <Sequence key={c.id} name={c.id} from={c.from} durationInFrames={c.durationInFrames}>
          <Tomada clipe={c} fonte={fonte} />
        </Sequence>
      ))}
      <Legendas palavras={legendas} />
      {headlines.map((h, i) => (
        <Sequence key={`h${i}`} name={`Headline · ${h.linhas.map((l) => l.t).join(" ")}`} from={h.from} durationInFrames={h.durationInFrames}>
          <Headline h={h} />
        </Sequence>
      ))}
      {cards.map((c, i) => (
        <Sequence key={`c${i}`} name={`Card · ${c.etiqueta}`} from={c.from} durationInFrames={c.durationInFrames}>
          <Card c={c} />
        </Sequence>
      ))}
      {cta ? (
        <Sequence name="CTA" from={cta.from} durationInFrames={cta.durationInFrames}>
          <Cta c={cta} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
