import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { MARCA, VIDRO } from "./marca";
import { SomDaCasa } from "./Sons";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});
const { fontFamily: anton } = loadAnton("normal", {
  weights: ["400"],
  subsets: ["latin", "latin-ext"],
});

const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);
const ELASTICO = Easing.bezier(0.34, 1.56, 0.64, 1);
const TRAVA = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const LARGURA = 660;
const ALTURA_CARD = 190;
const VAO = 14;

const Olho: React.FC<{ tamanho: number }> = ({ tamanho }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
    <path
      d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z"
      stroke={MARCA.creme}
      strokeWidth="2.2"
    />
    <circle cx="12" cy="12" r="3.6" fill={MARCA.creme} />
  </svg>
);

// 1. Três vídeos do apresentador com a contagem de visualizações (como na referência).
const CardVideo: React.FC<{
  indice: number;
  imagem: string;
  visualizacoes: string;
}> = ({ indice, imagem, visualizacoes }) => {
  const frame = useCurrentFrame();
  const entra = indice * 4;

  return (
    <div
      style={{
        position: "relative",
        width: 208,
        height: ALTURA_CARD,
        borderRadius: 24,
        overflow: "hidden",
        ...VIDRO,
        opacity: interpolate(frame, [entra, entra + 8], [0, 1], TRAVA),
        translate: interpolate(
          frame,
          [entra, entra + 14],
          ["0px 46px", "0px 0px"],
          { ...TRAVA, easing: SUAVE },
        ),
        scale: interpolate(frame, [entra, entra + 14], [0.88, 1], {
          ...TRAVA,
          easing: ELASTICO,
        }),
      }}
    >
      <Img
        src={staticFile(imagem)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 18%",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(14,10,5,0) 45%, rgba(14,10,5,0.88) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 14,
          bottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: montserrat,
          fontWeight: 800,
          fontSize: 28,
          color: MARCA.creme,
          // o brilho passa pelos números, um card de cada vez
          textShadow: `0 0 ${interpolate(
            frame,
            [16 + indice * 3, 22 + indice * 3, 32 + indice * 3],
            [0, 26, 6],
            TRAVA,
          )}px rgba(255,246,233,0.95)`,
        }}
      >
        <Olho tamanho={28} />
        {visualizacoes}
      </div>
    </div>
  );
};

const CardsDeVideos: React.FC<{ duracao: number }> = ({ duracao }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: ALTURA_CARD + VAO,
        width: LARGURA,
        display: "flex",
        justifyContent: "space-between",
        opacity: interpolate(frame, [duracao - 7, duracao], [1, 0], TRAVA),
        translate: interpolate(
          frame,
          [duracao - 8, duracao],
          ["0px 0px", "0px 18px"],
          { ...TRAVA, easing: Easing.in(Easing.cubic) },
        ),
      }}
    >
      <CardVideo indice={0} imagem="intro/video-1.jpg" visualizacoes="480 mil" />
      <CardVideo indice={1} imagem="intro/video-3.jpg" visualizacoes="153 mil" />
      <CardVideo indice={2} imagem="intro/video-2.jpg" visualizacoes="118 mil" />
    </div>
  );
};

const Numero: React.FC<{ valor: string; rotulo: string }> = ({
  valor,
  rotulo,
}) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        fontFamily: anton,
        fontSize: 38,
        lineHeight: 1,
        color: MARCA.creme,
        letterSpacing: "0.01em",
      }}
    >
      {valor}
    </div>
    <div
      style={{
        marginTop: 4,
        fontFamily: montserrat,
        fontWeight: 600,
        fontSize: 19,
        color: "rgba(255,246,233,0.72)",
      }}
    >
      {rotulo}
    </div>
  </div>
);

// 2. Card do perfil do apresentador: foto, nome, @ e números.
const CardDePerfil: React.FC<{ duracao: number }> = ({ duracao }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: LARGURA,
        height: ALTURA_CARD,
        borderRadius: 30,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 30px",
        ...VIDRO,
        opacity: interpolate(
          frame,
          [0, 7, duracao - 7, duracao],
          [0, 1, 1, 0],
          TRAVA,
        ),
        scale: interpolate(frame, [0, 14], [0.93, 1], {
          ...TRAVA,
          easing: ELASTICO,
        }),
        translate: interpolate(
          frame,
          [duracao - 8, duracao],
          ["0px 0px", "0px 18px"],
          { ...TRAVA, easing: Easing.in(Easing.cubic) },
        ),
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 132,
          height: 132,
          borderRadius: "50%",
          padding: 5,
          background: `linear-gradient(135deg, ${MARCA.dourado}, ${MARCA.laranja})`,
        }}
      >
        <Img
          src={staticFile("intro/avatar.jpg")}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            border: `5px solid ${MARCA.escuro}`,
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: montserrat,
            fontWeight: 800,
            fontSize: 32,
            color: MARCA.creme,
            letterSpacing: "-0.01em",
          }}
        >
          Maycon de Quipapá
          <svg width="28" height="28" viewBox="0 0 24 24">
            <path
              d="M12 1.5l2.6 2 3.3-.2 1 3.1 2.8 1.7-1 3.1 1 3.1-2.8 1.7-1 3.1-3.3-.2-2.6 2-2.6-2-3.3.2-1-3.1L2.3 14.3l1-3.1-1-3.1L5.1 6.4l1-3.1 3.3.2z"
              fill="#3897F0"
            />
            <path
              d="M8 12.2l2.7 2.7L16 9.6"
              stroke="#fff"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            marginTop: 2,
            fontFamily: montserrat,
            fontWeight: 600,
            fontSize: 22,
            color: MARCA.dourado,
          }}
        >
          @maycondequipapaof
        </div>
        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            paddingRight: 18,
            opacity: interpolate(frame, [8, 18], [0, 1], TRAVA),
            translate: interpolate(
              frame,
              [8, 20],
              ["0px 12px", "0px 0px"],
              { ...TRAVA, easing: SUAVE },
            ),
          }}
        >
          <Numero valor="2.863" rotulo="posts" />
          <Numero valor="196 mil" rotulo="seguidores" />
          <Numero valor="2.883" rotulo="seguindo" />
        </div>
      </div>
    </div>
  );
};

// 3. Selo de localização: a logo da casa cai no lugar, a pílula abre e aparecem o nome e a cidade.
export const SeloDeLocal: React.FC<{
  cidade: string;
  duracao: number;
  topoInterno?: number;
}> = ({ cidade, duracao, topoInterno = 2 * (ALTURA_CARD + VAO) }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: topoInterno,
        width: LARGURA,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          height: 100,
          borderRadius: 50,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          ...VIDRO,
          opacity: interpolate(
            frame,
            [0, 5, duracao - 8, duracao],
            [0, 1, 1, 0],
            TRAVA,
          ),
          // a pílula nasce do tamanho da logo e abre pros lados
          width: interpolate(frame, [7, 24], [100, 590], {
            ...TRAVA,
            easing: SUAVE,
          }),
          translate: interpolate(
            frame,
            [duracao - 8, duracao],
            ["0px 0px", "0px 14px"],
            { ...TRAVA, easing: Easing.in(Easing.cubic) },
          ),
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 100,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            translate: interpolate(
              frame,
              [0, 10],
              ["0px -40px", "0px 0px"],
              { ...TRAVA, easing: ELASTICO },
            ),
            scale: interpolate(frame, [0, 10], [0.7, 1], {
              ...TRAVA,
              easing: ELASTICO,
            }),
          }}
        >
          <Img
            src={staticFile("intro/logo.jpg")}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${MARCA.dourado}`,
            }}
          />
        </div>
        <div
          style={{
            whiteSpace: "nowrap",
            paddingLeft: 8,
            paddingRight: 36,
            opacity: interpolate(frame, [12, 22], [0, 1], TRAVA),
            translate: interpolate(
              frame,
              [12, 24],
              ["-14px 0px", "0px 0px"],
              { ...TRAVA, easing: SUAVE },
            ),
          }}
        >
          <div
            style={{
              fontFamily: montserrat,
              fontWeight: 800,
              fontSize: 29,
              letterSpacing: "0.01em",
              color: MARCA.creme,
            }}
          >
            Passaporte do{" "}
            <span style={{ color: MARCA.laranja }}>Galeguinho</span>
          </div>
          <div
            style={{
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: montserrat,
              fontWeight: 600,
              fontSize: 23,
              color: "rgba(255,246,233,0.78)",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              style={{
                translate: interpolate(
                  frame,
                  [16, 26],
                  ["0px -12px", "0px 0px"],
                  { ...TRAVA, easing: ELASTICO },
                ),
              }}
            >
              <path
                d="M12 22s-7.5-6.6-7.5-12a7.5 7.5 0 0 1 15 0c0 5.4-7.5 12-7.5 12z"
                fill={MARCA.laranja}
              />
              <circle cx="12" cy="10" r="2.8" fill={MARCA.escuro} />
            </svg>
            {cidade}
          </div>
        </div>
      </div>
    </div>
  );
};

// O bloco inteiro (perfil, vídeos, selo) é posicionado pelo rastreio do rosto: ancora.x é o centro
// e ancora.topo é o topo do bloco, calculados no componente pai a cada frame.
export const Bloco: React.FC<{
  ancora: { x: number; topo: number };
  children: React.ReactNode;
}> = ({ ancora, children }) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        left: ancora.x - LARGURA / 2,
        top: ancora.topo,
        width: LARGURA,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

export const Som: React.FC<{
  nome: string;
  em: number;
  arquivo: string;
  volume: number;
}> = ({ nome, em, arquivo, volume }) => (
  <Sequence name={`SFX ${nome}`} from={em} durationInFrames={45} layout="none">
    <Audio src={`https://remotion.media/${arquivo}.wav`} volume={volume} />
  </Sequence>
);

// Abertura: card de perfil primeiro; embaixo dele, os vídeos com as visualizações.
export const Abertura: React.FC<{ ancora: { x: number; topo: number } }> = ({
  ancora,
}) => {
  return (
    <>
      <Sequence name="Card de perfil" from={3} durationInFrames={100}>
        <Bloco ancora={ancora}>
          <CardDePerfil duracao={100} />
        </Bloco>
      </Sequence>
      <Sequence name="Vídeos + visualizações" from={22} durationInFrames={81}>
        <Bloco ancora={ancora}>
          <CardsDeVideos duracao={81} />
        </Bloco>
      </Sequence>

      <SomDaCasa nome="perfil entra" em={1} som="sopro" volume={0.5} />
      <SomDaCasa nome="perfil assenta" em={9} som="estouro" volume={0.36} />
      <SomDaCasa nome="números do perfil" em={13} som="toque" volume={0.3} />
      <SomDaCasa nome="vídeos entram" em={20} som="sopro" volume={0.26} />
      <SomDaCasa nome="vídeo 1" em={23} som="estouro" volume={0.42} />
      <SomDaCasa nome="vídeo 2" em={27} som="estouro" volume={0.38} />
      <SomDaCasa nome="vídeo 3" em={31} som="estouro" volume={0.34} />
      <SomDaCasa nome="números acendem" em={39} som="brilho" volume={0.24} />
      <SomDaCasa nome="bloco sai" em={94} som="sopro" volume={0.34} />
    </>
  );
};
