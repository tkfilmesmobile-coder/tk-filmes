import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption, TikTokPage } from "@remotion/captions";
import { loadFont } from "@remotion/google-fonts/DMSans";

const { fontFamily } = loadFont("normal", {
  weights: ["500"],
  subsets: ["latin", "latin-ext"],
});

// Cada palavra entra no tempo em que é dita: fade, leve subida e desfoque que some.
const Palavra: React.FC<{ texto: string; entraEm: number }> = ({
  texto,
  entraEm,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [entraEm, entraEm + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <span
      style={{
        display: "inline-block",
        opacity: t,
        translate: `0px ${(1 - t) * 12}px`,
        filter: `blur(${(1 - t) * 6}px)`,
      }}
    >
      {texto}
    </span>
  );
};

// Uma frase por vez, no máximo duas linhas, na altura do peito:
// longe do rosto e acima da área dos botões e do texto do Reels.
const Frase: React.FC<{ pagina: TikTokPage; duracao: number }> = ({
  pagina,
  duracao,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 490,
        paddingLeft: 120,
        paddingRight: 120,
        opacity: interpolate(frame, [duracao - 4, duracao], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div style={{ position: "relative", maxWidth: 840 }}>
        {/* Sombra difusa atrás do texto: dá contraste na camisa clara sem virar caixa */}
        <div
          style={{
            position: "absolute",
            inset: "-70px -90px",
            background:
              "radial-gradient(ellipse closest-side, rgba(0,0,0,0.5), rgba(0,0,0,0))",
            opacity: interpolate(frame, [0, 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        <div
          style={{
            position: "relative",
            fontFamily,
            fontWeight: 500,
            fontSize: 58,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            color: "#FFFFFF",
            textAlign: "center",
            textWrap: "balance",
            textShadow:
              "0 2px 18px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.45)",
          }}
        >
          {pagina.tokens.map((token, i) => (
            <span key={i}>
              {i > 0 ? " " : null}
              <Palavra
                texto={token.text.trim()}
                entraEm={Math.round(
                  ((token.fromMs - pagina.startMs) / 1000) * fps,
                )}
              />
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Legendas: React.FC<{ arquivo: string }> = ({ arquivo }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const [legendas, setLegendas] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());

  const carregar = useCallback(async () => {
    try {
      const resposta = await fetch(staticFile(arquivo));
      setLegendas(await resposta.json());
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [arquivo, continueRender, cancelRender, handle]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // As frases são definidas pelo pageBreakAfter do JSON; a janela larga só evita quebra extra.
  const paginas = useMemo(
    () =>
      legendas
        ? createTikTokStyleCaptions({
            captions: legendas,
            combineTokensWithinMilliseconds: 3000,
          }).pages
        : [],
    [legendas],
  );

  if (!legendas) {
    return null;
  }

  return (
    <AbsoluteFill>
      {paginas.map((pagina, i) => {
        const inicio = Math.round((pagina.startMs / 1000) * fps);
        const proxima = paginas[i + 1];
        const fim = proxima
          ? Math.round((proxima.startMs / 1000) * fps)
          : durationInFrames;
        if (fim <= inicio) {
          return null;
        }
        return (
          <Sequence
            key={i}
            name={`Legenda ${i + 1}`}
            from={inicio}
            durationInFrames={fim - inicio}
          >
            <Frase pagina={pagina} duracao={fim - inicio} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
