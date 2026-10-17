import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { MARCA } from "./marca";

const { fontFamily } = loadFont("normal", {
  weights: ["800"],
  subsets: ["latin", "latin-ext"],
});

const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);
const ELASTICO = Easing.bezier(0.34, 1.4, 0.64, 1);
const TRAVA = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Fatias da foto real do Burguer Capiana (ensaio do cliente), recortadas em scripts.
// y = posição montada (px, dentro do bloco) · abre = quanto a fatia sobe/desce na vista explodida.
// acende = frame (relativo) em que o ingrediente é dito; null = não é dito, entra junto com o resto.
const ESCALA = 0.3;
const CAMADAS: {
  arquivo: string;
  largura: number;
  altura: number;
  x: number;
  y: number;
  abre: number;
  rotulo: string;
  acende: number | null;
}[] = [
  { arquivo: "burger-1-pao-cima.png", largura: 856, altura: 316, x: 8, y: 0, abre: -108, rotulo: "pão australiano", acende: null },
  { arquivo: "burger-2-cebola.png", largura: 880, altura: 172, x: 24, y: 282, abre: -44, rotulo: "cebola caramelizada", acende: 32 },
  { arquivo: "burger-3-bacon-cheddar.png", largura: 1040, altura: 204, x: -176, y: 362, abre: 22, rotulo: "bacon + cheddar duplo", acende: 22 },
  { arquivo: "burger-4-carne-pao.png", largura: 854, altura: 275, x: -11, y: 512, abre: 96, rotulo: "blend 160 g", acende: null },
];

const Etiqueta: React.FC<{
  texto: string;
  topo: number;
  entraEm: number;
  aceso: boolean;
  acendeEm: number;
}> = ({ texto, topo, entraEm, aceso, acendeEm }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: topo,
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: interpolate(frame, [entraEm, entraEm + 7], [0, 1], TRAVA),
        translate: interpolate(
          frame,
          [entraEm, entraEm + 12],
          ["-22px 0px", "0px 0px"],
          { ...TRAVA, easing: SUAVE },
        ),
      }}
    >
      <div
        style={{
          padding: "8px 18px",
          borderRadius: 30,
          backgroundColor: "rgba(14,10,5,0.78)",
          border: `1.5px solid ${aceso ? MARCA.dourado : "rgba(255,246,233,0.3)"}`,
          fontFamily,
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          color: aceso ? MARCA.dourado : MARCA.creme,
          boxShadow: aceso
            ? `0 0 ${interpolate(
                frame,
                [acendeEm, acendeEm + 6, acendeEm + 22],
                [0, 30, 10],
                TRAVA,
              )}px rgba(255,176,31,0.75)`
            : "none",
        }}
      >
        {texto}
      </div>
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: MARCA.dourado,
        }}
      />
    </div>
  );
};

// Vista explodida do lanche: entra montado, abre em camadas e cada ingrediente acende quando é dito.
// No fim as camadas voltam a se juntar e o bloco sai.
// topo = onde o bloco começa, calculado no pai pra ficar sempre abaixo do queixo dele.
export const Ingredientes: React.FC<{ duracao: number; topo: number }> = ({
  duracao,
  topo,
}) => {
  const frame = useCurrentFrame();
  const fecha = duracao - 30;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 50,
          top: topo,
          width: 700,
          height: 450,
          opacity: interpolate(
            frame,
            [0, 7, duracao - 8, duracao],
            [0, 1, 1, 0],
            TRAVA,
          ),
          scale: interpolate(frame, [0, 14], [0.9, 1], {
            ...TRAVA,
            easing: ELASTICO,
          }),
        }}
      >
        {/* luz quente atrás do lanche: separa do fundo sem virar caixa */}
        <div
          style={{
            position: "absolute",
            left: 300,
            top: -20,
            width: 440,
            height: 490,
            background:
              "radial-gradient(closest-side, rgba(14,10,5,0.82), rgba(14,10,5,0.5) 60%, rgba(14,10,5,0))",
          }}
        />
        {CAMADAS.map((c, i) => {
          const topoMontado = 112 + c.y * ESCALA;
          return (
            <div key={c.arquivo}>
              <Img
                src={staticFile(`insercoes/${c.arquivo}`)}
                style={{
                  position: "absolute",
                  left: 388 + c.x * ESCALA,
                  top: topoMontado,
                  width: c.largura * ESCALA,
                  // abre com um quique, segura, e fecha de volta
                  translate: interpolate(
                    frame,
                    [8 + i * 2, 24 + i * 2, fecha, fecha + 14],
                    ["0px 0px", `0px ${c.abre}px`, `0px ${c.abre}px`, "0px 0px"],
                    {
                      ...TRAVA,
                      easing: [ELASTICO, Easing.linear, Easing.inOut(Easing.cubic)],
                    },
                  ),
                  filter:
                    c.acende === null
                      ? "none"
                      : `brightness(${interpolate(
                          frame,
                          [c.acende, c.acende + 6, c.acende + 24],
                          [1, 1.28, 1.06],
                          TRAVA,
                        )})`,
                }}
              />
              <div
                style={{
                  opacity: interpolate(
                    frame,
                    [fecha - 4, fecha + 4],
                    [1, 0],
                    TRAVA,
                  ),
                }}
              >
                <Etiqueta
                  texto={c.rotulo}
                  topo={topoMontado + c.abre + (c.altura * ESCALA) / 2 - 24}
                  entraEm={c.acende ?? 22 + i * 3}
                  aceso={c.acende !== null && frame >= c.acende}
                  acendeEm={c.acende ?? 0}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
