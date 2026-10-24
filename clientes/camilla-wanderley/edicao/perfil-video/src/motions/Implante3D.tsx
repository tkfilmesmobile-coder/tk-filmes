import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Ambiente } from "../periodontite/Bloco";
import { geoCoroa, geoRaiz, texturaRuido } from "../periodontite/Modelo";
import { ALERTA, clamp, REVELA, ROSE_CLARO, Rotulo, SUAVE, Serifa, surge, Tag, Vidro, some } from "./Vidro";

// Implante em 3D, contado no ritmo da fala da Dra. Camilla (vídeo "Implante sem abrir a gengiva", 2026-10-22).
// Rebordo (osso + gengiva translúcidos) com dois dentes vizinhos; no centro acontece cada etapa da fala:
// hoje (furo na gengiva) · antes (gengiva rebatida, broca no osso) · hoje de novo · extração → alvéolo →
// implante rosqueando → pilar e coroa. Modo "partes": implante, pilar e coroa separados (cirúrgica × prótese).
// Eixos: X = arcada, Y = para cima, Z = vestibular (pra câmera).

const FPS = 30;

// ---------- geometrias ----------
const extrusao = (forma: THREE.Shape, x0: number, x1: number, chanfro = 0) => {
  const g = new THREE.ExtrudeGeometry(forma, {
    depth: x1 - x0,
    bevelEnabled: chanfro > 0,
    bevelThickness: chanfro,
    bevelSize: chanfro * 0.75,
    bevelSegments: 4,
    curveSegments: 28,
  });
  // perfil desenhado no plano (z, y) → extrusão ao longo de X
  g.rotateY(Math.PI / 2);
  g.translate(x0, 0, 0);
  g.computeVertexNormals();
  return g;
};

const formaOsso = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.55, -2.15);
  s.lineTo(-0.6, -1.2);
  s.lineTo(-0.53, -0.56);
  s.quadraticCurveTo(-0.5, -0.3, -0.3, -0.28);
  s.quadraticCurveTo(0, -0.21, 0.3, -0.28);
  s.quadraticCurveTo(0.5, -0.3, 0.53, -0.56);
  s.lineTo(0.6, -1.2);
  s.lineTo(0.55, -2.15);
  s.lineTo(-0.55, -2.15);
  return s;
};

// gengiva: casca entre a superfície de fora e o osso. lado: 0 = inteira, -1/1 = só uma metade (retalho)
const formaGengiva = (lado: 0 | -1 | 1) => {
  const s = new THREE.Shape();
  const ext = (z: number) => z; // perfil simétrico
  if (lado === 0) {
    s.moveTo(-0.68, -0.85);
    s.lineTo(-0.66, -0.45);
    s.quadraticCurveTo(-0.64, -0.05, -0.32, 0.0);
    s.quadraticCurveTo(0, 0.07, 0.32, 0.0);
    s.quadraticCurveTo(0.64, -0.05, 0.66, -0.45);
    s.lineTo(0.68, -0.85);
    s.lineTo(0.56, -0.85);
    s.lineTo(0.535, -0.56);
    s.quadraticCurveTo(0.51, -0.27, 0.3, -0.255);
    s.quadraticCurveTo(0, -0.19, -0.3, -0.255);
    s.quadraticCurveTo(-0.51, -0.27, -0.535, -0.56);
    s.lineTo(-0.56, -0.85);
    s.lineTo(-0.68, -0.85);
    return s;
  }
  const k = lado;
  s.moveTo(0, 0.07);
  s.quadraticCurveTo(ext(0.32 * k) * 0.5, 0.06, 0.32 * k, 0.0);
  s.quadraticCurveTo(0.64 * k, -0.05, 0.66 * k, -0.45);
  s.lineTo(0.68 * k, -0.85);
  s.lineTo(0.56 * k, -0.85);
  s.lineTo(0.535 * k, -0.56);
  s.quadraticCurveTo(0.51 * k, -0.27, 0.3 * k, -0.255);
  s.quadraticCurveTo(0.15 * k, -0.2, 0, -0.19);
  s.lineTo(0, 0.07);
  return s;
};

const geoImplante = () => {
  // núcleo levemente cônico + ponta arredondada
  const perfil: [number, number][] = [
    [0.0, -1.47],
    [0.07, -1.45],
    [0.11, -1.38],
    [0.135, -1.2],
    [0.142, -0.6],
    [0.145, -0.34],
    [0.15, -0.3],
    [0.0, -0.3],
  ];
  const nucleo = new THREE.LatheGeometry(perfil.map(([r, y]) => new THREE.Vector2(r, y)), 64);
  // rosca: hélice de verdade em volta do núcleo
  const voltas = 10.5;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 600; i++) {
    const t = i / 600;
    const y = -0.36 - t * 0.98;
    const r = 0.152 - 0.025 * Math.max(0, (t - 0.8) / 0.2);
    const a = t * voltas * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  const rosca = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 900, 0.026, 10, false);
  return { nucleo, rosca };
};

const geoPilar = () =>
  new THREE.LatheGeometry(
    (
      [
        [0.0, -0.3],
        [0.12, -0.3],
        [0.115, -0.15],
        [0.1, 0.0],
        [0.085, 0.12],
        [0.0, 0.14],
      ] as [number, number][]
    ).map(([r, y]) => new THREE.Vector2(r, y)),
    48,
  );

// ---------- materiais ----------
const Titanio: React.FC<{ opacidade?: number }> = ({ opacidade = 1 }) => (
  <meshPhysicalMaterial color="#C9CED4" metalness={1} roughness={0.28} clearcoat={0.4} clearcoatRoughness={0.25} transparent={opacidade < 1} opacity={opacidade} envMapIntensity={1.3} />
);
const Esmalte: React.FC<{ opacidade?: number }> = ({ opacidade = 1 }) => (
  <meshPhysicalMaterial vertexColors roughness={0.2} clearcoat={1} clearcoatRoughness={0.12} ior={1.62} sheen={0.25} sheenColor="#FFF1EA" transparent={opacidade < 1} opacity={opacidade} />
);

// ---------- estado da cena em função do tempo (s = segundos da montagem) ----------
export type TemposImplante = {
  de: number; // entra
  furo1: number; // "eu furo a gengiva assim"
  antes: number; // "não abre mais como antigamente"
  rebate: number; // "rebate a gengiva"
  broca: number; // "chegar no osso pra furar"
  hoje: number; // "hoje não"
  furo2: number; // "ele fura"
  raiz: number; // "quando você tira essa raiz"
  extrai: number; // "raiz" (dente sai)
  buraco: number; // "buraco formado"
  rosqueia: number; // "rosqueia"
  coroa: number; // implante completo
  ate: number; // sai
};

// câmera olhando a face do corte (x = 0) de lado e um pouco de frente; aproxima de leve nas etapas
const Camera: React.FC<{ s: number; t: TemposImplante }> = ({ s, t }) => {
  const { camera } = useThree();
  const d = interpolate(s, [t.de, t.rebate, t.broca + 0.6, t.hoje + 0.6, t.raiz, t.ate], [13.4, 12.4, 12.1, 12.9, 12.6, 12.2], { ...clamp, easing: SUAVE });
  const ang = interpolate(s, [t.de, t.ate], [1.05, 0.92], clamp); // ângulo em volta do eixo Y (0 = de frente)
  useLayoutEffect(() => {
    camera.position.set(Math.sin(ang) * d - 0.4, 1.6, Math.cos(ang) * d);
    camera.lookAt(-0.35, -1.25, 0);
    camera.updateProjectionMatrix();
  });
  return null;
};

const Rebordo: React.FC<{ s: number; t: TemposImplante }> = ({ s, t }) => {
  const g = useMemo(() => {
    // rebordo em corte: vai de x = -1.7 até a face do corte em x = 0 (onde fica o implante)
    const cortical = extrusao(formaOsso(), -1.7, 0);
    const esponjoso = extrusao(formaOssoInterno(), -1.69, 0.004); // a face dele fica à frente: aparece no corte
    const gResto = extrusao(formaGengiva(0), -1.7, -0.45);
    const gVest = extrusao(formaGengiva(-1), -0.45, 0);
    const gLing = extrusao(formaGengiva(1), -0.45, 0);
    const imp = geoImplante();
    return { cortical, esponjoso, gResto, gVest, gLing, imp, pilar: geoPilar(), coroa: geoCoroa(), raiz: geoRaiz(), bumpOsso: texturaRuido(9, 1, true), bumpGengiva: texturaRuido(3, 2, false) };
  }, []);

  // retalho (antes): abre em "rebate", fecha em "hoje"
  const abre = interpolate(s, [t.rebate - 0.3, t.rebate + 0.7, t.hoje + 0.1, t.hoje + 0.9], [0, 1, 1, 0], { ...clamp, easing: SUAVE });
  // furo na gengiva (hoje): anel desce, disco sai, buraco fica
  const furo = (em: number) => ({
    anel: interpolate(s, [em - 0.35, em, em + 0.5, em + 0.8], [0, 1, 1, 0], clamp),
    disco: interpolate(s, [em + 0.1, em + 0.55], [0, 1], { ...clamp, easing: SUAVE }),
  });
  const f1 = furo(t.furo1);
  const f2 = furo(t.furo2);
  const buraco1 = interpolate(s, [t.furo1 + 0.3, t.furo1 + 0.6, t.antes, t.antes + 0.4], [0, 1, 1, 0], clamp);
  const buraco2 = interpolate(s, [t.furo2 + 0.3, t.furo2 + 0.6, t.raiz - 0.5, t.raiz], [0, 1, 1, 0], clamp);
  // broca (antes)
  const broca = interpolate(s, [t.broca - 0.6, t.broca + 0.4, t.hoje, t.hoje + 0.35], [0, 1, 1, 0], { ...clamp, easing: SUAVE });
  const brocaY = interpolate(s, [t.broca - 0.6, t.broca + 0.4], [2.2, 0.15], { ...clamp, easing: SUAVE });
  // dente do meio aparece, sai (extração) e deixa o alvéolo
  const dente = interpolate(s, [t.raiz - 0.4, t.raiz + 0.1], [0, 1], clamp);
  const sobe = interpolate(s, [t.extrai, t.extrai + 0.9], [0, 1], { ...clamp, easing: SUAVE });
  const alveolo = interpolate(s, [t.extrai + 0.4, t.buraco + 0.2, t.coroa, t.coroa + 0.6], [0, 1, 1, 0.25], clamp);
  // implante desce girando até o osso; pilar e coroa por cima
  const imp = interpolate(s, [t.rosqueia - 1.3, t.rosqueia + 0.9], [0, 1], { ...clamp, easing: SUAVE });
  const coroa = interpolate(s, [t.coroa - 0.2, t.coroa + 0.7], [0, 1], { ...clamp, easing: REVELA });
  const op = interpolate(s, [t.de, t.de + 0.5], [0, 1], clamp);

  const matGengiva = (
    <meshPhysicalMaterial color="#D9727F" roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.28} sheen={0.9} sheenColor="#FFD3D8" sheenRoughness={0.5} bumpMap={g.bumpGengiva} bumpScale={0.5} transparent={op < 1} opacity={op} />
  );
  return (
    <group>
      {/* osso: cortical (casca) e esponjoso (aparece na face do corte) */}
      <mesh geometry={g.cortical}>
        <meshPhysicalMaterial color="#F1E6D2" roughness={0.75} clearcoat={0.15} bumpMap={g.bumpOsso} bumpScale={0.5} transparent={op < 1} opacity={op} />
      </mesh>
      <mesh geometry={g.esponjoso}>
        <meshStandardMaterial color="#DCC39A" roughness={0.95} bumpMap={g.bumpOsso} bumpScale={2.4} transparent={op < 1} opacity={op} />
      </mesh>
      {/* gengiva: bloco fixo + retalho vestibular e lingual perto do corte */}
      <mesh geometry={g.gResto}>{matGengiva}</mesh>
      <group position={[0, -0.85, 0.68]} rotation={[abre * 1.25, 0, 0]}>
        <mesh geometry={g.gVest} position={[0, 0.85, -0.68]}>
          {matGengiva}
        </mesh>
      </group>
      <group position={[0, -0.85, -0.68]} rotation={[-abre * 0.95, 0, 0]}>
        <mesh geometry={g.gLing} position={[0, 0.85, 0.68]}>
          {matGengiva}
        </mesh>
      </group>

      {/* furo na gengiva: anel de luz, disco que sai e o buraco que fica (no corte aparece como um entalhe) */}
      {[f1, f2].map((f, i) => (
        <group key={i}>
          <mesh position={[-0.02, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.6 + 0.4 * f.anel}>
            <torusGeometry args={[0.19, 0.013, 12, 64]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={f.anel} />
          </mesh>
          {f.anel > 0 || (f.disco > 0 && f.disco < 1) ? (
            <mesh position={[-0.02, -0.06 + f.disco * 0.45, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.26, 40]} />
              <meshPhysicalMaterial color="#D9727F" roughness={0.42} clearcoat={0.6} transparent opacity={1 - f.disco} />
            </mesh>
          ) : null}
        </group>
      ))}
      {Math.max(buraco1, buraco2) > 0.01 ? (
        <mesh position={[-0.09, -0.06, 0]}>
          <boxGeometry args={[0.2, 0.27, 0.36]} />
          <meshStandardMaterial color="#4A0F19" roughness={0.7} transparent opacity={Math.max(buraco1, buraco2)} />
        </mesh>
      ) : null}

      {/* broca (antes) */}
      {broca > 0.01 ? (
        <group position={[-0.02, brocaY, 0]} rotation={[0, s * 40, 0]}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 1.2, 24]} />
            <Titanio opacidade={broca} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.07, 0.03, 0.36, 24]} />
            <meshPhysicalMaterial color="#D9C27A" metalness={1} roughness={0.35} transparent opacity={broca} />
          </mesh>
        </group>
      ) : null}

      {/* dente vizinho */}
      <group position={[-0.95, 0.17, 0]} scale={0.95}>
        <mesh geometry={g.coroa}>
          <Esmalte opacidade={op} />
        </mesh>
      </group>

      {/* dente do meio (extração) */}
      {dente > 0.01 && sobe < 0.999 ? (
        <group position={[-0.02, 0.17 + sobe * 2.6, 0]} rotation={[0, 0, -sobe * 0.3]}>
          <mesh geometry={g.coroa}>
            <Esmalte opacidade={dente * (1 - sobe * sobe)} />
          </mesh>
          {[-1, 1].map((lado) => (
            <mesh key={lado} geometry={g.raiz} position={[lado * 0.1, 0, 0]} rotation={[0, 0, lado * 0.1]}>
              <meshPhysicalMaterial vertexColors roughness={0.55} transparent opacity={dente * (1 - sobe * sobe)} />
            </mesh>
          ))}
        </group>
      ) : null}

      {/* alvéolo (o "buraco formado") desenhado na face do corte */}
      {alveolo > 0.01 ? (
        <mesh geometry={ALVEOLO} position={[0.008, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <meshStandardMaterial color="#5E1420" roughness={0.8} transparent opacity={alveolo * 0.92} side={THREE.DoubleSide} />
        </mesh>
      ) : null}

      {/* implante (rosqueando), pilar e coroa */}
      {imp > 0.001 ? (
        <group position={[-0.02, (1 - imp) * 2.8, 0]} rotation={[0, (1 - imp) * Math.PI * 7, 0]}>
          <mesh geometry={g.imp.nucleo}>
            <Titanio opacidade={Math.min(1, imp * 3)} />
          </mesh>
          <mesh geometry={g.imp.rosca}>
            <Titanio opacidade={Math.min(1, imp * 3)} />
          </mesh>
        </group>
      ) : null}
      {coroa > 0.001 ? (
        <group position={[-0.02, (1 - coroa) * 1.3, 0]}>
          <mesh geometry={g.pilar}>
            <Titanio opacidade={coroa} />
          </mesh>
          <mesh geometry={g.coroa} position={[0, 0.2, 0]} scale={0.98}>
            <Esmalte opacidade={coroa} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

// forma do alvéolo (raiz que saiu) no plano da face do corte: largo em cima, afunilando
const ALVEOLO = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.2, -0.24);
  s.quadraticCurveTo(-0.17, -0.7, -0.1, -1.0);
  s.quadraticCurveTo(0, -1.08, 0.1, -1.0);
  s.quadraticCurveTo(0.17, -0.7, 0.2, -0.24);
  s.lineTo(-0.2, -0.24);
  return new THREE.ShapeGeometry(s, 24);
})();

const formaOssoInterno = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.48, -2.09);
  s.lineTo(-0.53, -1.2);
  s.lineTo(-0.47, -0.58);
  s.quadraticCurveTo(-0.44, -0.36, -0.28, -0.34);
  s.quadraticCurveTo(0, -0.28, 0.28, -0.34);
  s.quadraticCurveTo(0.44, -0.36, 0.47, -0.58);
  s.lineTo(0.53, -1.2);
  s.lineTo(0.48, -2.09);
  s.lineTo(-0.48, -2.09);
  return s;
};

// ---------- modo "partes": implante (cirúrgica) e prótese (pilar + coroa) separados ----------
export type TemposPartes = { de: number; cirurgica: number; protese: number; ate: number };

const CenaPartes: React.FC<{ s: number; t: TemposPartes }> = ({ s, t }) => {
  const g = useMemo(() => ({ imp: geoImplante(), pilar: geoPilar(), coroa: geoCoroa() }), []);
  const p = surge(s, t.de, 0.7);
  const giro = interpolate(s, [t.de, t.ate], [0, 1.4], clamp);
  const sep = interpolate(s, [t.de, t.de + 1.2], [0, 1], { ...clamp, easing: SUAVE });
  const brilhoC = interpolate(s, [t.cirurgica - 0.2, t.cirurgica + 0.3, t.protese - 0.2, t.protese], [0, 1, 1, 0.3], clamp);
  const brilhoP = interpolate(s, [t.protese - 0.2, t.protese + 0.3], [0, 1], clamp);
  return (
    <group position={[0, 0.2, 0]} scale={0.8 * (0.92 + 0.08 * p)} rotation={[0.12, giro, 0]}>
      <pointLight position={[1.2, -0.8, 1.4]} intensity={4 * brilhoC} distance={3} color="#FFF4F0" />
      <pointLight position={[1.2, 1.2, 1.4]} intensity={4 * brilhoP} distance={3} color="#FFF4F0" />
      <group position={[0, -0.25 * sep, 0]}>
        <mesh geometry={g.imp.nucleo}>
          <Titanio opacidade={p} />
        </mesh>
        <mesh geometry={g.imp.rosca}>
          <Titanio opacidade={p} />
        </mesh>
      </group>
      <group position={[0, 0.45 * sep, 0]}>
        <mesh geometry={g.pilar}>
          <Titanio opacidade={p} />
        </mesh>
        <mesh geometry={g.coroa} position={[0, 0.2 + 0.35 * sep, 0]}>
          <Esmalte opacidade={p} />
        </mesh>
      </group>
    </group>
  );
};

const CameraPartes: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(0, 0.35, 8.2);
    camera.lookAt(0, 0.05, 0);
    camera.updateProjectionMatrix();
  });
  return null;
};

const Luzes: React.FC = () => (
  <>
    <Ambiente intensidade={0.9} />
    <ambientLight intensity={0.25} />
    <hemisphereLight args={["#FFF7F4", "#E4C6C0", 0.35]} />
    <directionalLight position={[2.4, 5, 5.5]} intensity={1.6} />
    <directionalLight position={[-3, 1.5, -2.5]} intensity={0.9} color="#FFD9D3" />
  </>
);

// ---------- componentes de tela (3D + textos) ----------
export const ImplantePartes: React.FC<{ t: TemposPartes }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const s = useCurrentFrame() / FPS + t.de;
  const vis = Math.min(surge(s, t.de, 0.5), some(s, t.ate, 0.45));
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <AbsoluteFill style={{ top: -60 }}>
        <ThreeCanvas width={width} height={height} camera={{ fov: 30, near: 0.1, far: 60, position: [0, 0.3, 6.2] }} gl={{ alpha: true, antialias: true }}>
          <CameraPartes />
          <Luzes />
          <CenaPartes s={s} t={t} />
        </ThreeCanvas>
      </AbsoluteFill>
      <Rotulo x={600} y={1000} lado="dir" fio={120} p={surge(s, t.cirurgica, 0.6)} tag="1 · parte cirúrgica" texto="o implante" />
      <Rotulo x={600} y={560} lado="dir" fio={120} p={surge(s, t.protese, 0.6)} tag="2 · parte da prótese" texto="a coroa" />
    </AbsoluteFill>
  );
};

export const ImplanteCirurgia: React.FC<{ t: TemposImplante }> = ({ t }) => {
  const { width, height } = useVideoConfig();
  const s = useCurrentFrame() / FPS + t.de;
  const vis = Math.min(surge(s, t.de, 0.5), some(s, t.ate, 0.45));
  // título da etapa no alto (vidro), trocando com a fala
  const etapa = (de: number, ate: number) => Math.min(surge(s, de, 0.45), some(s, ate, 0.3));
  const etapas: { de: number; ate: number; tag: string; titulo: string; cor?: string }[] = [
    { de: t.de, ate: t.antes, tag: "Hoje", titulo: "sem abrir a gengiva" },
    { de: t.antes, ate: t.hoje, tag: "Antes", titulo: "a gengiva era aberta", cor: ALERTA },
    { de: t.hoje, ate: t.raiz, tag: "Hoje", titulo: "só um acesso pequeno" },
    { de: t.raiz, ate: t.ate, tag: "Depois da extração", titulo: "o implante entra no lugar" },
  ];
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <AbsoluteFill style={{ top: 40 }}>
        <ThreeCanvas width={width} height={height} camera={{ fov: 30, near: 0.1, far: 60, position: [0, 1.1, 7.4] }} gl={{ alpha: true, antialias: true }}>
          <Camera s={s} t={t} />
          <Luzes />
          <Rebordo s={s} t={t} />
        </ThreeCanvas>
      </AbsoluteFill>
      {etapas.map((e, i) => {
        const p = etapa(e.de, e.ate);
        return p > 0.001 ? (
          <Vidro key={i} x={150} y={190} w={780} p={p} pad={30} destaque={!e.cor} style={{ textAlign: "center" }}>
            <Tag texto={e.tag} cor={e.cor ?? ROSE_CLARO} />
            <Serifa texto={e.titulo} tamanho={56} style={{ marginTop: 10 }} />
          </Vidro>
        ) : null;
      })}
      {/* rótulo do retalho no "antes" */}
      <Rotulo x={700} y={760} lado="dir" fio={70} p={Math.min(surge(s, t.rebate + 0.4, 0.5), some(s, t.hoje, 0.3))} tag="retalho" texto="gengiva rebatida" />

    </AbsoluteFill>
  );
};
