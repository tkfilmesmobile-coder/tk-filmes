import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { loadFont as bebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as montserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as caveat } from "@remotion/google-fonts/Caveat";
import type { Card as CardT, Headline as HeadlineT, Cta as CtaT } from "./tipos";

const BEBAS = bebas("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
const MONT = montserrat("normal", { weights: ["600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
const CAVEAT = caveat("normal", { weights: ["600"], subsets: ["latin", "latin-ext"] }).fontFamily;

// Cor de assinatura: cobre/âmbar (decidido em 2026-09-30)
export const COBRE = "#E0A45A";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);

// Headline: graphic emphasis. Condensed, caixa alta, palavra-chave em cobre. Rara.
// Entra em 5 quadros (acomoda de 104% pra 100%), sai seco. Sem som, sem quique.
export const Headline: React.FC<{ h: HeadlineT }> = ({ h }) => {
  const frame = useCurrentFrame();
  const topo = h.pos === "topo";
  return (
    <AbsoluteFill
      style={{
        justifyContent: topo ? "flex-start" : "flex-end",
        alignItems: "center",
        paddingTop: topo ? 220 : 0,
        paddingBottom: topo ? 0 : 640,
        paddingLeft: 70,
        paddingRight: 70,
      }}
    >
      <div
        style={{
          fontFamily: BEBAS,
          fontSize: 132,
          lineHeight: 0.92,
          letterSpacing: "0.01em",
          textAlign: "center",
          color: "#fff",
          textShadow: "0 3px 22px rgba(0,0,0,0.45)",
          opacity: interpolate(frame, [0, 4, h.durationInFrames - 2, h.durationInFrames], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [0, 5], [1.04, 1], { ...clamp, easing: SUAVE }),
        }}
      >
        {h.linhas.map((l, i) => (
          <div key={i} style={{ color: l.cor ? COBRE : "#fff" }}>
            {l.t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Card editorial: etiqueta em cobre + painel claro com texto curto. Centro-inferior.
// Sobe 14 px em 7 quadros e some em 3.
export const Card: React.FC<{ c: CardT }> = ({ c }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 640 }}>
      <div
        style={{
          maxWidth: 780,
          textAlign: "center",
          opacity: interpolate(frame, [0, 5, c.durationInFrames - 3, c.durationInFrames], [0, 1, 1, 0], clamp),
          translate: interpolate(frame, [0, 7], ["0px 14px", "0px 0px"], { ...clamp, easing: SUAVE }),
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontFamily: MONT,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "0.2em",
            color: "#241A1C",
            background: COBRE,
            padding: "9px 20px",
            borderRadius: 6,
            marginBottom: -12,
            position: "relative",
            zIndex: 2,
          }}
        >
          {c.etiqueta.toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: MONT,
            fontWeight: 600,
            fontSize: 34,
            lineHeight: 1.32,
            color: "#241A1C",
            background: "rgba(250,247,243,0.95)",
            padding: "30px 38px 26px",
            borderRadius: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
          }}
        >
          {c.texto}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Fechamento: sai do talking head. Fundo escuro, frase manuscrita, quase nada além disso.
export const Cta: React.FC<{ c: CtaT }> = ({ c }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#1C1416", justifyContent: "center", alignItems: "center", padding: 90 }}>
      <div
        style={{
          fontFamily: CAVEAT,
          fontWeight: 600,
          fontSize: 128,
          lineHeight: 1.05,
          color: "#fff",
          textAlign: "center",
          opacity: interpolate(frame, [0, 8], [0, 1], clamp),
          translate: interpolate(frame, [0, 10], ["0px 12px", "0px 0px"], { ...clamp, easing: SUAVE }),
        }}
      >
        {c.texto}
      </div>
      <div
        style={{
          marginTop: 56,
          fontFamily: MONT,
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: "0.22em",
          color: COBRE,
          opacity: interpolate(frame, [8, 18], [0, 1], clamp),
        }}
      >
        {(c.sub ?? "DRA. CAMILLA WANDERLEY · ENDODONTIA").toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};
