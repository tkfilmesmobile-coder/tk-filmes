import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Ambiente, Subtitulo, TagFio, TituloRose, Veu } from "./Bloco";
import { ModeloPerio } from "./Modelo";

// "…deveriam fazer o tratamento durante a gestação, limpeza.": a maquete da abertura volta com placa e
// tártaro; em "limpeza" o tártaro some, a gengiva volta ao rosa saudável e uma luz passa pelos dentes.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
const REVELA = Easing.bezier(0.16, 1, 0.3, 1);
const FPS = 30;

export type ConfigLimpeza = { de: number; limpaEm: number; ate: number; tag: string; titulo: string; antes: string; depois: string };

const Camera: React.FC<{ c: ConfigLimpeza }> = ({ c }) => {
  const s = useCurrentFrame() / FPS + c.de;
  const { camera } = useThree();
  const z = interpolate(s, [c.de, c.ate], [10.2, 9.3], { ...clamp, easing: SUAVE });
  useLayoutEffect(() => {
    camera.position.set(0.1, 0.45, z);
    camera.lookAt(0, -0.2, 0);
    camera.updateProjectionMatrix();
  });
  return null;
};

const Cena: React.FC<{ c: ConfigLimpeza }> = ({ c }) => {
  const s = useCurrentFrame() / FPS + c.de;
  const entra = interpolate(s, [c.de + 0.1, c.de + 0.7], [0, 1], { ...clamp, easing: REVELA });
  const doenca = interpolate(s, [c.limpaEm, c.limpaEm + 0.7], [0.48, 0], { ...clamp, easing: SUAVE });
  const giro = interpolate(s, [c.de, c.ate], [-0.9, -0.62], clamp);
  // luz que varre os dentes no momento da limpeza
  const varre = interpolate(s, [c.limpaEm, c.limpaEm + 0.9], [-2.2, 2.2], { ...clamp, easing: SUAVE });
  const brilho = interpolate(s, [c.limpaEm, c.limpaEm + 0.2, c.limpaEm + 0.7, c.limpaEm + 0.9], [0, 6, 6, 0], clamp);
  return (
    <>
      <pointLight position={[varre, 1.9, 1.4]} intensity={brilho} distance={3.5} color="#FFFFFF" />
      <group position={[-0.12, 0.86 - (1 - entra) * 0.25, 0]} rotation={[0.3, giro, 0]} scale={0.54 * (0.9 + 0.1 * entra) * Math.max(0.001, entra)}>
        <ModeloPerio separa={0} doenca={doenca} />
      </group>
    </>
  );
};

export const Limpeza3D: React.FC<{ c: ConfigLimpeza }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = frame / FPS + c.de;
  const entra = interpolate(s, [c.de, c.de + 0.35], [0, 1], { ...clamp, easing: SUAVE });
  const sai = interpolate(s, [c.ate - 0.4, c.ate], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const titulo = interpolate(s, [c.limpaEm - 0.1, c.limpaEm + 0.45], [0, 1], { ...clamp, easing: REVELA });
  const antes = interpolate(s, [c.de + 0.5, c.de + 0.85, c.limpaEm - 0.15, c.limpaEm], [0, 1, 1, 0], clamp);
  const depois = interpolate(s, [c.limpaEm + 0.3, c.limpaEm + 0.65], [0, 1], { ...clamp, easing: REVELA });
  return (
    <AbsoluteFill>
      <Veu opacidade={entra * (1 - sai)} />
      <AbsoluteFill style={{ opacity: entra * (1 - sai), filter: `blur(${sai * 6}px)`, translate: `0px ${-sai * 30}px` }}>
        <TagFio texto={c.tag} p={interpolate(s, [c.de + 0.1, c.de + 0.6], [0, 1], { ...clamp, easing: REVELA })} />
        <TituloRose texto={c.titulo} p={titulo} />
        {/* antes da limpeza: o que tem no dente; depois: o que ela traz */}
        <Subtitulo texto={c.antes} opacidade={antes} dy={0} cor="#8E1F31" />
        <Subtitulo texto={c.depois} opacidade={depois} dy={(1 - depois) * 12} />
        <AbsoluteFill>
          <ThreeCanvas width={width} height={height} shadows="soft" camera={{ fov: 30, near: 0.1, far: 60, position: [0, 0.5, 10] }} gl={{ alpha: true, antialias: true }}>
            <Camera c={c} />
            <Ambiente intensidade={0.7} />
            <ambientLight intensity={0.15} />
            <hemisphereLight args={["#FFF7F4", "#E4C6C0", 0.25]} />
            <directionalLight position={[2.4, 5, 5.5]} intensity={1.25} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} />
            <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#FFD9D3" />
            <mesh position={[0, 0.29, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[12, 12]} />
              <shadowMaterial opacity={0.13} />
            </mesh>
            <Cena c={c} />
          </ThreeCanvas>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
