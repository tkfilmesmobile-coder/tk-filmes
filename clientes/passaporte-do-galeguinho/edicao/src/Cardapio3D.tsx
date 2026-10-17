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
const ELASTICO = Easing.bezier(0.34, 1.56, 0.64, 1);
const TRAVA = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// O cardápio online da casa, recortado em linhas (public/insercoes/cardapio-*.png, 860 px de largura).
// Só entram os lanches que têm foto no cardápio.
const ESCALA = 0.44;
const LARGURA = 860 * ESCALA;
const ALTURA_CABECALHO = 160 * ESCALA;
const ALTURA_TITULO = 76 * ESCALA;
const ALTURA_LINHA = 272 * ESCALA;
const LINHAS = ["bacontella", "capiana", "duplo", "smash", "supremo"];
const ESCOLHIDO = 1; // o Capiana
const JANELA = ALTURA_CABECALHO + ALTURA_TITULO + 3.55 * ALTURA_LINHA;
const TOPO_DO_ESCOLHIDO =
  ALTURA_CABECALHO + ALTURA_TITULO + ESCOLHIDO * ALTURA_LINHA;

// Cartão em perspectiva: chega de lado e se abre pra câmera. Quando ele escolhe (destaqueEm),
// os outros lanches apagam e o Capiana salta pra frente do cartão, com moldura, brilho e etiqueta.
// esquerda = posição do cartão, calculada no pai pra ficar sempre à esquerda do rosto.
export const Cardapio3D: React.FC<{
  duracao: number;
  destaqueEm: number;
  esquerda: number;
}> = ({ duracao, destaqueEm, esquerda }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ perspective: 1400 }}>
      <div
        style={{
          position: "absolute",
          left: esquerda,
          top: 560,
          width: LARGURA,
          height: JANELA,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          opacity: interpolate(
            frame,
            [0, 7, duracao - 8, duracao],
            [0, 1, 1, 0],
            TRAVA,
          ),
          transform: `rotateY(${interpolate(
            frame,
            [0, 22, duracao],
            [46, 20, 12],
            { ...TRAVA, easing: [SUAVE, Easing.linear] },
          )}deg) rotateX(${interpolate(frame, [0, duracao], [5, 2], TRAVA)}deg) translateZ(${interpolate(
            frame,
            [0, 22, duracao - 8, duracao],
            [-160, 0, 0, -120],
            {
              ...TRAVA,
              easing: [SUAVE, Easing.linear, Easing.in(Easing.cubic)],
            },
          )}px)`,
        }}
      >
        {/* o cartão */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 30,
            overflow: "hidden",
            backgroundColor: "#fff",
            border: "1.5px solid rgba(255,176,31,0.55)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
          }}
        >
          <Img
            src={staticFile("insercoes/cardapio-cabecalho.png")}
            style={{ width: LARGURA, display: "block" }}
          />
          <Img
            src={staticFile("insercoes/cardapio-titulo.png")}
            style={{ width: LARGURA, display: "block" }}
          />
          {LINHAS.map((nome, i) => (
            <Img
              key={nome}
              src={staticFile(`insercoes/cardapio-${nome}.png`)}
              style={{
                width: LARGURA,
                display: "block",
                // as linhas entram em cascata; na escolha, as outras apagam
                opacity:
                  interpolate(
                    frame,
                    [10 + i * 4, 18 + i * 4],
                    [0, 1],
                    TRAVA,
                  ) *
                  (i === ESCOLHIDO
                    ? 1
                    : interpolate(
                        frame,
                        [destaqueEm, destaqueEm + 8],
                        [1, 0.28],
                        TRAVA,
                      )),
                translate: interpolate(
                  frame,
                  [10 + i * 4, 22 + i * 4],
                  ["0px 26px", "0px 0px"],
                  { ...TRAVA, easing: SUAVE },
                ),
                filter:
                  i === ESCOLHIDO
                    ? "none"
                    : `grayscale(${interpolate(
                        frame,
                        [destaqueEm, destaqueEm + 8],
                        [0, 0.8],
                        TRAVA,
                      )})`,
              }}
            />
          ))}
          {/* reflexo passando pelo vidro */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 60%)",
              translate: interpolate(
                frame,
                [8, 44],
                ["-120% 0px", "120% 0px"],
                TRAVA,
              ),
            }}
          />
        </div>

        {/* o escolhido salta pra frente do cartão */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: TOPO_DO_ESCOLHIDO,
            width: LARGURA,
            height: ALTURA_LINHA,
            borderRadius: 18,
            overflow: "hidden",
            backgroundColor: "#fff",
            border: `4px solid ${MARCA.dourado}`,
            opacity: interpolate(
              frame,
              [destaqueEm, destaqueEm + 3],
              [0, 1],
              TRAVA,
            ),
            boxShadow: `0 22px 50px rgba(0,0,0,0.55), 0 0 ${interpolate(
              frame,
              [destaqueEm, destaqueEm + 7, destaqueEm + 30],
              [0, 70, 26],
              TRAVA,
            )}px rgba(255,176,31,0.95)`,
            transform: `translateZ(${interpolate(
              frame,
              [destaqueEm, destaqueEm + 14],
              [0, 90],
              { ...TRAVA, easing: ELASTICO },
            )}px) scale(${interpolate(
              frame,
              [destaqueEm, destaqueEm + 14],
              [1, 1.16],
              { ...TRAVA, easing: ELASTICO },
            )})`,
          }}
        >
          <Img
            src={staticFile("insercoes/cardapio-capiana.png")}
            style={{ width: LARGURA, display: "block", marginTop: -2 }}
          />
          {/* brilho que varre o escolhido */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg, rgba(255,214,120,0) 35%, rgba(255,214,120,0.6) 50%, rgba(255,214,120,0) 65%)",
              translate: interpolate(
                frame,
                [destaqueEm + 4, destaqueEm + 22],
                ["-120% 0px", "120% 0px"],
                TRAVA,
              ),
            }}
          />
        </div>
        {/* etiqueta do escolhido */}
        <div
          style={{
            position: "absolute",
            right: -34,
            top: TOPO_DO_ESCOLHIDO - 30,
            padding: "8px 16px",
            borderRadius: 30,
            backgroundColor: MARCA.dourado,
            color: MARCA.escuro,
            fontFamily,
            fontWeight: 800,
            fontSize: 21,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            boxShadow: "0 10px 26px rgba(0,0,0,0.45)",
            opacity: interpolate(
              frame,
              [destaqueEm + 6, destaqueEm + 10],
              [0, 1],
              TRAVA,
            ),
            transform: `translateZ(130px) scale(${interpolate(
              frame,
              [destaqueEm + 6, destaqueEm + 18],
              [0.5, 1],
              { ...TRAVA, easing: ELASTICO },
            )}) rotate(-4deg)`,
          }}
        >
          a escolha dele
        </div>
      </div>
    </AbsoluteFill>
  );
};
