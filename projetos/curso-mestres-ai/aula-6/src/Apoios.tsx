import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/LibreBaskerville";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

// Identidade da Tamara Chagas: grafite, prata e branco; Libre Baskerville + Inter.
const { fontFamily: serif } = loadSerif("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});
const { fontFamily: sans } = loadSans("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
});

// Todos os apoios ficam no mesmo lugar: no peito, entre o queixo e a legenda.
const Espaco: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 770 }}
  >
    {children}
  </AbsoluteFill>
);

// Traço que se desenha: pathLength=1 e o offset vai de 1 a 0 no intervalo de frames.
const tracado = (frame: number, inicio: number, fim: number) =>
  interpolate(frame, [inicio, fim], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

// 1 · "Acabou a prova de vida no INSS." · foto + etiqueta
export const CartaoFoto: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <Espaco>
      <Interactive.Div
        name="Cartão foto"
        style={{
          position: "relative",
          width: 500,
          height: 390,
          opacity: interpolate(
            frame,
            [0, 8, durationInFrames - 6, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          scale: interpolate(
            frame,
            [0, 14, durationInFrames - 6, durationInFrames],
            [0.86, 1, 1, 0.96],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              output: "perceptual-scale",
            },
          ),
          translate: interpolate(frame, [0, 14], ["0px 36px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          rotate: interpolate(frame, [0, 14], ["-3deg", "-1.5deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div
          style={{
            width: 500,
            height: 390,
            borderRadius: 28,
            overflow: "hidden",
            border: "5px solid rgba(255,255,255,0.92)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          }}
        >
          <Img
            name="Foto idosa"
            src={staticFile("imagens/idosa-camisa-rosa-junior-reis-unsplash.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "60% 30%",
              scale: interpolate(frame, [0, durationInFrames], [1.04, 1.12], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        </div>
        <Interactive.Div
          name="Etiqueta prova de vida"
          style={{
            position: "absolute",
            left: "50%",
            bottom: -30,
            translate: "-50% 0px",
            whiteSpace: "nowrap",
            backgroundColor: "rgba(26,26,28,0.94)",
            color: "#FFFFFF",
            borderRadius: 999,
            padding: "14px 30px",
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "0.18em",
            border: "1.5px solid rgba(201,204,209,0.55)",
            opacity: interpolate(frame, [8, 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          PROVA DE VIDA{" "}
          <span style={{ color: "#C9CCD1", fontFamily: serif, fontWeight: 700, letterSpacing: "0.06em" }}>
            · INSS
          </span>
        </Interactive.Div>
      </Interactive.Div>
    </Espaco>
  );
};

// 2 · "vai nas urnas votar, agora dia 4/10" · urna em traço, depois a data
export const CartaoUrnaData: React.FC<{ dataEntraEm: number }> = ({
  dataEntraEm,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const prata = "#C9CCD1";

  return (
    <Espaco>
      <Interactive.Div
        name="Cartão urna e data"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 34,
          padding: "30px 44px 30px 30px",
          borderRadius: 40,
          backgroundColor: "rgba(26,26,28,0.92)",
          border: "1.5px solid rgba(201,204,209,0.35)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          opacity: interpolate(
            frame,
            [0, 7, durationInFrames - 5, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          translate: interpolate(frame, [0, 12], ["0px 30px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {/* Urna eletrônica em linha fina dentro do círculo, como os ícones da marca */}
        <svg width={170} height={170} viewBox="0 0 170 170" fill="none">
          <circle cx={85} cy={85} r={80} stroke={prata} strokeWidth={2.5} pathLength={1}
            strokeDasharray={1} strokeDashoffset={tracado(frame, 0, 16)} />
          <rect x={38} y={56} width={94} height={62} rx={8} stroke="#FFFFFF" strokeWidth={4}
            pathLength={1} strokeDasharray={1} strokeDashoffset={tracado(frame, 4, 20)} />
          <rect x={48} y={66} width={40} height={30} rx={3} stroke="#FFFFFF" strokeWidth={3.5}
            pathLength={1} strokeDasharray={1} strokeDashoffset={tracado(frame, 10, 22)} />
          <path d="M100 68h4M112 68h4M100 78h4M112 78h4M100 88h4M112 88h4M100 100h16"
            stroke={prata} strokeWidth={4} strokeLinecap="round"
            opacity={interpolate(frame, [16, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          <path d="M30 126h110" stroke={prata} strokeWidth={3} strokeLinecap="round" pathLength={1}
            strokeDasharray={1} strokeDashoffset={tracado(frame, 12, 24)} />
        </svg>

        {/* Data: entra quando ele fala "4/10" */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            opacity: interpolate(frame, [dataEntraEm, dataEntraEm + 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: `${interpolate(frame, [dataEntraEm, dataEntraEm + 10], [-18, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}px 0px`,
          }}
        >
          <div style={{ width: 1.5, height: 130, backgroundColor: "rgba(201,204,209,0.5)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 118, lineHeight: 1, color: "#FFFFFF" }}>
              4
            </div>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 26, letterSpacing: "0.3em", color: prata, marginTop: 8, marginRight: "-0.3em" }}>
              OUT
            </div>
          </div>
        </div>
      </Interactive.Div>
    </Espaco>
  );
};

// 3 · "já é computada" · selo de check que se desenha
export const SeloCheck: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <Espaco>
      <Interactive.Div
        name="Selo check"
        style={{
          marginTop: 20,
          width: 210,
          height: 210,
          borderRadius: 999,
          backgroundColor: "rgba(26,26,28,0.92)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: interpolate(
            frame,
            [0, 6, durationInFrames - 5, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          scale: interpolate(frame, [0, 12], [0.7, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 14 }),
            output: "perceptual-scale",
          }),
        }}
      >
        <svg width={170} height={170} viewBox="0 0 170 170" fill="none">
          <circle cx={85} cy={85} r={78} stroke="#C9CCD1" strokeWidth={2.5} pathLength={1}
            strokeDasharray={1} strokeDashoffset={tracado(frame, 0, 14)} />
          <path d="M52 88l22 22 46-50" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round"
            strokeLinejoin="round" pathLength={1} strokeDasharray={1}
            strokeDashoffset={tracado(frame, 6, 16)} />
        </svg>
      </Interactive.Div>
    </Espaco>
  );
};
