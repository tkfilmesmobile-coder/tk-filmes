import { useThree } from "@react-three/fiber";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ModeloPerio } from "./Modelo";
import { T } from "./tempos";

// Headline da abertura na estética dos posts (capa "Canal dói", a mais próxima aprovada): fio + caixa alta
// espaçada, título em serifa com degradê rosé, linha fina em itálico logo abaixo. A maquete 3D faz parte da
// headline: fica embaixo do texto, sobre um véu blush que dissolve a filmagem no alto. Um bloco só; a única
// informação que muda é a linha de baixo, acompanhando a evolução da gengiva no modelo.
const { fontFamily: CORMORANT } = loadCormorant("italic", { weights: ["500"], subsets: ["latin", "latin-ext"] });
const { fontFamily: PLAYFAIR } = loadPlayfair("normal", { weights: ["600"], subsets: ["latin", "latin-ext"] });
const { fontFamily: MONTSERRAT } = loadMontserrat("normal", { weights: ["500"], subsets: ["latin", "latin-ext"] });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
const REVELA = Easing.bezier(0.16, 1, 0.3, 1);
const ROSE = "#B5797E";

const Ambiente: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.035).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.7;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

// câmera fixa com uma aproximação lenta (sem atravessar a geometria)
const Camera: React.FC = () => {
  const s = useCurrentFrame() / 30;
  const { camera } = useThree();
  const z = interpolate(s, [T.maqueteDe, T.saiDe], [10.4, 9.4], { ...clamp, easing: SUAVE });
  useLayoutEffect(() => {
    camera.position.set(0.1, 0.45, z);
    camera.lookAt(0, -0.2, 0);
    camera.updateProjectionMatrix();
  });
  return null;
};

const Maquete: React.FC = () => {
  const s = useCurrentFrame() / 30;
  const entra = interpolate(s, [T.maqueteDe, T.maqueteAte], [0, 1], { ...clamp, easing: REVELA });
  const separa = interpolate(s, [T.separaDe, T.separaAte, T.juntaDe, T.juntaAte], [0, 1, 1, 0], { ...clamp, easing: SUAVE });
  const doenca = interpolate(s, [T.inflamaDe, T.inflamaAte, T.perioDe, T.perioAte], [0, 0.5, 0.5, 1], { ...clamp, easing: SUAVE });
  const giro = interpolate(s, [T.maqueteDe, T.saiAte], [-0.95, -0.7], clamp);
  return (
    <group position={[-0.12, 0.86 - (1 - entra) * 0.25, 0]} rotation={[0.3, giro, 0]} scale={0.54 * (0.9 + 0.1 * entra) * Math.max(0.001, entra)}>
      <ModeloPerio separa={separa} doenca={doenca} />
    </group>
  );
};

const LINHAS = [
  { t: "uma doença da gengiva", de: T.subDe, ate: T.inflamaDe },
  { t: "a gengiva inflama", de: T.inflamaDe, ate: T.perioDe },
  { t: "e o dente perde sustentação", de: T.perioDe, ate: T.saiAte },
];

export const Headline3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = frame / fps;
  const sai = interpolate(s, [T.saiDe, T.saiAte], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  // o véu acompanha o zoom que leva o rosto pra baixo: nunca cobre o rosto
  const veu = interpolate(s, [T.zoomDe, T.zoomDe + 0.12], [0, 1], { ...clamp, easing: SUAVE }) * (1 - sai);
  const titulo = interpolate(s, [T.headlineDe, T.headlineDe + 0.5], [0, 1], { ...clamp, easing: REVELA });
  return (
    <AbsoluteFill>
      {/* véu blush: a filmagem se dissolve no rosa no alto (como a foto nos posts) */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(248,236,232,0.97) 0%, rgba(246,232,228,0.94) 30%, rgba(244,229,225,0.6) 39%, rgba(244,229,225,0) 47%)",
          opacity: veu,
        }}
      />
      <AbsoluteFill style={{ opacity: 1 - sai, filter: `blur(${sai * 6}px)`, translate: `0px ${-sai * 30}px` }}>
        {/* fio + caixa alta */}
        <div style={{ position: "absolute", top: 118, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
          <div style={{ width: interpolate(s, [T.headlineDe, T.headlineDe + 0.5], [0, 56], { ...clamp, easing: REVELA }), height: 1.5, background: ROSE }} />
          <div style={{ fontFamily: MONTSERRAT, fontWeight: 500, fontSize: 21, letterSpacing: 7, color: ROSE, opacity: titulo }}>SAÚDE BUCAL NA GESTAÇÃO</div>
          <div style={{ width: interpolate(s, [T.headlineDe, T.headlineDe + 0.5], [0, 56], { ...clamp, easing: REVELA }), height: 1.5, background: ROSE }} />
        </div>
        {/* título */}
        <div style={{ position: "absolute", top: 160, width: "100%", textAlign: "center", overflow: "hidden", paddingBottom: 16 }}>
          <div
            style={{
              display: "inline-block",
              fontFamily: PLAYFAIR,
              fontWeight: 600,
              fontSize: 116,
              lineHeight: 1.12,
              letterSpacing: -1.5,
              background: "linear-gradient(100deg,#8C4A53 0%,#B9777C 45%,#D9A39E 62%,#A9656C 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              translate: `0px ${(1 - titulo) * 120}px`,
              scale: interpolate(s, [T.headlineDe, T.saiDe], [1, 1.03], clamp),
            }}
          >
            Periodontite
          </div>
        </div>
        {/* maquete 3D, parte da headline */}
        <AbsoluteFill>
          <ThreeCanvas width={width} height={height} shadows="soft" camera={{ fov: 30, near: 0.1, far: 60, position: [0, 2, 10] }} gl={{ alpha: true, antialias: true }}>
            <Camera />
            <Ambiente />
            <ambientLight intensity={0.15} />
            <hemisphereLight args={["#FFF7F4", "#E4C6C0", 0.25]} />
            <directionalLight
              position={[2.4, 5, 5.5]}
              intensity={1.25}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-left={-3}
              shadow-camera-right={3}
              shadow-camera-top={3}
              shadow-camera-bottom={-1}
              shadow-bias={-0.0004}
            />
            <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#FFD9D3" />
            {/* chão invisível que só recebe a sombra da maquete */}
            <mesh position={[0, 0.29, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[12, 12]} />
              <shadowMaterial opacity={0.13} />
            </mesh>
            <Maquete />
          </ThreeCanvas>
        </AbsoluteFill>
        {/* a única linha que muda, acompanhando o modelo */}
        <div style={{ position: "absolute", top: 296, width: "100%", height: 70, textAlign: "center" }}>
          {LINHAS.map((l, i) => {
            const vis = interpolate(s, [l.de, l.de + 0.18, l.ate - 0.1, l.ate], [0, 1, 1, i === LINHAS.length - 1 ? 1 : 0], clamp);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  fontFamily: CORMORANT,
                  fontStyle: "italic",
                  fontSize: 58,
                  fontWeight: 500,
                  color: i === 0 ? "#6E2B38" : "#8E1F31",
                  opacity: vis,
                  translate: `0px ${interpolate(s, [l.de, l.de + 0.3], [12, 0], { ...clamp, easing: REVELA })}px`,
                  filter: `blur(${interpolate(s, [l.de, l.de + 0.18], [4, 0], clamp)}px)`,
                }}
              >
                {l.t}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
