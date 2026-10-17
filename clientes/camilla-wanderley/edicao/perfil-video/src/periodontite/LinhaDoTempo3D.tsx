import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Ambiente, MONTSERRAT, ROSE, Subtitulo, TagFio, TituloRose, Veu } from "./Bloco";

// Linha do tempo da gestação em 3D (fio rosé-dourado em arco com pérolas): antes de engravidar · 1º · 2º · 3º.
// A câmera desliza até a pérola em foco, que cresce e fica rosé; as outras recuam. Usada no "2º trimestre"
// e no "antes de engravidar", com o mesmo bloco de texto da headline.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
const REVELA = Easing.bezier(0.16, 1, 0.3, 1);
const FPS = 30;

const PEROLAS = [
  new THREE.Vector3(-1.4, -0.06, 0),
  new THREE.Vector3(-0.7, 0.02, 0),
  new THREE.Vector3(0, 0.12, 0),
  new THREE.Vector3(0.7, 0.02, 0),
];
const ROTULOS: [string, string][] = [
  ["antes", "DE ENGRAVIDAR"],
  ["1º", "TRIMESTRE"],
  ["2º", "TRIMESTRE"],
  ["3º", "TRIMESTRE"],
];

export type ConfigLinha = {
  de: number; // entra (s, absoluto)
  foco: number; // câmera chega e a pérola se destaca
  ate: number; // sai
  tituloEm: number;
  subEm: number;
  partida: number; // índice da pérola onde a câmera começa
  focoIdx: number;
  tag: string;
  titulo: string;
  sub: string;
};

const cameraEm = (c: ConfigLinha, s: number) => {
  const p = interpolate(s, [c.de + 0.2, c.foco], [0, 1], { ...clamp, easing: SUAVE });
  const x = PEROLAS[c.partida].x + (PEROLAS[c.focoIdx].x - PEROLAS[c.partida].x) * p;
  return { pos: new THREE.Vector3(x + 0.1, 0.35, 6.6 - 0.4 * p), alvo: new THREE.Vector3(x, -0.64, 0) };
};

const Camera: React.FC<{ c: ConfigLinha }> = ({ c }) => {
  const s = useCurrentFrame() / FPS + c.de;
  const { camera } = useThree();
  const { pos, alvo } = cameraEm(c, s);
  useLayoutEffect(() => {
    camera.position.copy(pos);
    camera.lookAt(alvo);
    camera.updateProjectionMatrix();
  });
  return null;
};

const Linha: React.FC<{ c: ConfigLinha }> = ({ c }) => {
  const s = useCurrentFrame() / FPS + c.de;
  const desenha = interpolate(s, [c.de + 0.1, c.de + 0.8], [0, 1], { ...clamp, easing: SUAVE });
  const destaque = interpolate(s, [c.foco - 0.2, c.foco + 0.4], [0, 1], { ...clamp, easing: REVELA });
  const tubo = useMemo(() => {
    const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.3, -0.16, 0), ...PEROLAS, new THREE.Vector3(1.6, -0.12, 0)]);
    return new THREE.TubeGeometry(curva, 260, 0.009, 12, false);
  }, []);
  const perola = useMemo(() => new THREE.SphereGeometry(0.11, 64, 48), []);
  const total = tubo.index ? tubo.index.count : 0;
  tubo.setDrawRange(0, Math.floor((total * desenha) / 6) * 6);
  const corFoco = new THREE.Color("#F4EEE8").lerp(new THREE.Color("#E9A6AE"), destaque);
  return (
    <group>
      <mesh geometry={tubo} castShadow>
        <meshPhysicalMaterial color="#D7A39C" metalness={0.85} roughness={0.25} clearcoat={1} />
      </mesh>
      {PEROLAS.map((p, i) => {
        const ordem = Math.abs(i - c.partida);
        const aparece = interpolate(s, [c.de + 0.25 + ordem * 0.18, c.de + 0.6 + ordem * 0.18], [0, 1], { ...clamp, easing: REVELA });
        const foco = i === c.focoIdx;
        const esc = aparece * (foco ? 1 + 0.4 * destaque : 1 - 0.15 * destaque);
        return (
          <mesh key={i} geometry={perola} position={[p.x, p.y + (foco ? 0.05 * destaque : 0), p.z]} scale={Math.max(0.001, esc)} castShadow>
            <meshPhysicalMaterial
              color={foco ? corFoco : "#F4EEE8"}
              roughness={0.18}
              clearcoat={1}
              clearcoatRoughness={0.08}
              sheen={1}
              sheenColor="#FFD9DE"
              iridescence={0.35}
              iridescenceIOR={1.3}
              emissive={foco ? "#E78C98" : "#000000"}
              emissiveIntensity={foco ? 0.12 * destaque : 0}
            />
          </mesh>
        );
      })}
      <mesh position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <shadowMaterial opacity={0.1} />
      </mesh>
    </group>
  );
};

// rótulos presos às pérolas (projeção com a mesma câmera da cena 3D)
const Rotulos: React.FC<{ c: ConfigLinha; s: number }> = ({ c, s }) => {
  const { width, height } = useVideoConfig();
  const cam = useMemo(() => new THREE.PerspectiveCamera(30, width / height, 0.1, 60), [width, height]);
  const { pos, alvo } = cameraEm(c, s);
  cam.position.copy(pos);
  cam.lookAt(alvo);
  cam.updateMatrixWorld();
  const destaque = interpolate(s, [c.foco - 0.2, c.foco + 0.4], [0, 1], { ...clamp, easing: REVELA });
  return (
    <>
      {PEROLAS.map((p, i) => {
        const foco = i === c.focoIdx;
        const v = p.clone().add(new THREE.Vector3(0, -0.24 - (foco ? 0.05 * destaque : 0), 0)).project(cam);
        const x = (v.x * 0.5 + 0.5) * width;
        const y = (-v.y * 0.5 + 0.5) * height;
        const ordem = Math.abs(i - c.partida);
        const aparece = interpolate(s, [c.de + 0.45 + ordem * 0.18, c.de + 0.8 + ordem * 0.18], [0, 1], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 120,
              top: y - 20,
              width: 240,
              textAlign: "center",
              fontFamily: MONTSERRAT,
              fontWeight: foco ? 600 : 500,
              fontSize: foco ? 30 + 6 * destaque : 26,
              letterSpacing: 4,
              color: foco ? "#8E1F31" : ROSE,
              opacity: aparece * (foco ? 1 : 1 - 0.35 * destaque),
            }}
          >
            {ROTULOS[i][0]}
            <div style={{ fontSize: 15, letterSpacing: 5, marginTop: 4, fontWeight: 500 }}>{ROTULOS[i][1]}</div>
          </div>
        );
      })}
    </>
  );
};

export const LinhaDoTempo3D: React.FC<{ c: ConfigLinha }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = frame / FPS + c.de;
  const entra = interpolate(s, [c.de, c.de + 0.35], [0, 1], { ...clamp, easing: SUAVE });
  const sai = interpolate(s, [c.ate - 0.4, c.ate], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const titulo = interpolate(s, [c.tituloEm, c.tituloEm + 0.55], [0, 1], { ...clamp, easing: REVELA });
  const sub = interpolate(s, [c.subEm, c.subEm + 0.35], [0, 1], { ...clamp, easing: REVELA });
  return (
    <AbsoluteFill>
      <Veu opacidade={entra * (1 - sai)} />
      <AbsoluteFill style={{ opacity: entra * (1 - sai), filter: `blur(${sai * 6}px)`, translate: `0px ${-sai * 30}px` }}>
        <TagFio texto={c.tag} p={interpolate(s, [c.de + 0.1, c.de + 0.6], [0, 1], { ...clamp, easing: REVELA })} />
        <TituloRose texto={c.titulo} p={titulo} />
        <Subtitulo texto={c.sub} opacidade={sub} dy={(1 - sub) * 12} />
        <AbsoluteFill>
          <ThreeCanvas width={width} height={height} shadows="soft" camera={{ fov: 30, near: 0.1, far: 60, position: [0, 1, 7] }} gl={{ alpha: true, antialias: true }}>
            <Camera c={c} />
            <Ambiente />
            <ambientLight intensity={0.15} />
            <directionalLight position={[1.5, 4, 4]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#FFD9D3" />
            <Linha c={c} />
          </ThreeCanvas>
        </AbsoluteFill>
        <Rotulos c={c} s={s} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
