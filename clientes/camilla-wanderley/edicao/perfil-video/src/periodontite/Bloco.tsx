import { useThree } from "@react-three/fiber";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { useLayoutEffect } from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Peças do "bloco" gráfico do perfil de vídeo da Dra. Camilla (estética dos posts, capa "Canal dói"):
// véu blush no alto · fio + caixa alta espaçada · título em serifa com degradê rosé · linha em itálico.
// Todo bloco 3D (headline de abertura, linha do tempo, limpeza) usa estas mesmas peças.
export const { fontFamily: CORMORANT } = loadCormorant("italic", { weights: ["500"], subsets: ["latin", "latin-ext"] });
export const { fontFamily: PLAYFAIR } = loadPlayfair("normal", { weights: ["600"], subsets: ["latin", "latin-ext"] });
export const { fontFamily: MONTSERRAT } = loadMontserrat("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] });

export const ROSE = "#B5797E";
export const VINHO = "#6E2B38";

export const Veu: React.FC<{ opacidade: number }> = ({ opacidade }) => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to bottom, rgba(248,236,232,0.97) 0%, rgba(246,232,228,0.94) 30%, rgba(244,229,225,0.6) 39%, rgba(244,229,225,0) 47%)",
      opacity: opacidade,
    }}
  />
);

export const TagFio: React.FC<{ texto: string; p: number }> = ({ texto, p }) => (
  <div style={{ position: "absolute", top: 118, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
    <div style={{ width: 56 * p, height: 1.5, background: ROSE }} />
    <div style={{ fontFamily: MONTSERRAT, fontWeight: 500, fontSize: 21, letterSpacing: 7, color: ROSE, opacity: p }}>{texto}</div>
    <div style={{ width: 56 * p, height: 1.5, background: ROSE }} />
  </div>
);

// títulos longos diminuem pra caber com margem (máx. ~940 px de largura)
export const TituloRose: React.FC<{ texto: string; p: number; escala?: number }> = ({ texto, p, escala = 1 }) => (
  <div style={{ position: "absolute", top: 160, width: "100%", textAlign: "center", overflow: "hidden", paddingBottom: 16 }}>
    <div
      style={{
        display: "inline-block",
        fontFamily: PLAYFAIR,
        fontWeight: 600,
        fontSize: Math.min(116, Math.round(1640 / Math.max(1, texto.length))),
        lineHeight: 1.12,
        letterSpacing: -1.5,
        background: "linear-gradient(100deg,#8C4A53 0%,#B9777C 45%,#D9A39E 62%,#A9656C 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        translate: `0px ${(1 - p) * 120}px`,
        scale: escala,
      }}
    >
      {texto}
    </div>
  </div>
);

// linha em itálico logo abaixo do título (opacidade e deslocamento vêm de fora)
export const Subtitulo: React.FC<{ texto: string; opacidade: number; dy: number; cor?: string; blur?: number }> = ({ texto, opacidade, dy, cor = VINHO, blur = 0 }) => (
  <div
    style={{
      position: "absolute",
      top: 296,
      width: "100%",
      textAlign: "center",
      fontFamily: CORMORANT,
      fontStyle: "italic",
      fontWeight: 500,
      fontSize: 58,
      color: cor,
      opacity: opacidade,
      translate: `0px ${dy}px`,
      filter: blur ? `blur(${blur}px)` : undefined,
    }}
  >
    {texto}
  </div>
);

// luz de ambiente de estúdio (RoomEnvironment do próprio three) + tone mapping, igual em todas as cenas 3D
export const Ambiente: React.FC<{ intensidade?: number }> = ({ intensidade = 0.75 }) => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.035).texture;
    scene.environment = env;
    scene.environmentIntensity = intensidade;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene, intensidade]);
  return null;
};
