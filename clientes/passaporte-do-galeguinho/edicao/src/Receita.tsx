import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { MARCA, VIDRO } from "./marca";

const { fontFamily } = loadFont("normal", {
  weights: ["700", "800"],
  subsets: ["latin", "latin-ext"],
});

const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);
const ELASTICO = Easing.bezier(0.34, 1.56, 0.64, 1);
const TRAVA = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export type ItemDaReceita = {
  nome: string;
  entraEm: number; // frame (relativo) em que o ingrediente entra no lanche
};

// Lista da montagem: cada ingrediente é riscado em dourado quando entra no lanche, na ordem do vídeo.
// Fica no alto, onde não tem rosto nem lanche durante o preparo.
export const Receita: React.FC<{
  titulo: string;
  itens: ItemDaReceita[];
  duracao: number;
  esquerda: number;
  topo: number;
}> = ({ titulo, itens, duracao, esquerda, topo }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: esquerda,
          top: topo,
          width: 470,
          padding: "22px 26px 18px",
          borderRadius: 28,
          ...VIDRO,
          fontFamily,
          opacity: interpolate(
            frame,
            [0, 7, duracao - 8, duracao],
            [0, 1, 1, 0],
            TRAVA,
          ),
          translate: interpolate(
            frame,
            [0, 14],
            ["0px -30px", "0px 0px"],
            { ...TRAVA, easing: SUAVE },
          ),
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 21,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: MARCA.laranja,
            marginBottom: 12,
          }}
        >
          {titulo}
        </div>
        {itens.map((item) => {
          const feito = frame >= item.entraEm;
          return (
            <div
              key={item.nome}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "7px 0",
                fontWeight: 700,
                fontSize: 28,
                color: feito ? MARCA.creme : "rgba(255,246,233,0.55)",
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: `2px solid ${feito ? MARCA.dourado : "rgba(255,246,233,0.35)"}`,
                  backgroundColor: feito ? MARCA.dourado : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  scale: interpolate(
                    frame,
                    [item.entraEm, item.entraEm + 10],
                    [1, 1],
                    TRAVA,
                  ),
                  boxShadow: feito
                    ? `0 0 ${interpolate(
                        frame,
                        [item.entraEm, item.entraEm + 6, item.entraEm + 24],
                        [0, 26, 8],
                        TRAVA,
                      )}px rgba(255,176,31,0.9)`
                    : "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    fill="none"
                    stroke={MARCA.escuro}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={interpolate(
                      frame,
                      [item.entraEm + 2, item.entraEm + 12],
                      [1, 0],
                      { ...TRAVA, easing: SUAVE },
                    )}
                  />
                </svg>
              </div>
              <span
                style={{
                  display: "inline-block",
                  scale: interpolate(
                    frame,
                    [item.entraEm, item.entraEm + 12],
                    [1, 1.04],
                    { ...TRAVA, easing: ELASTICO },
                  ),
                }}
              >
                {item.nome}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
