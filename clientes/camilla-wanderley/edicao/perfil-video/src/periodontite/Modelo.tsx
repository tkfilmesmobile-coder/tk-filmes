import { useMemo } from "react";
import * as THREE from "three";

// Maquete periodontal em geometria 3D local (sem modelo comprado), com acabamento realista:
// - dentes: molar de torno com cúspides e fossa central, duas raízes divergentes, esmalte → dentina
//   por cor de vértice;
// - gengiva: superfície paramétrica orgânica ao longo da arcada, com papilas entre os dentes, bossas
//   sobre as raízes, pontas arredondadas e microtextura úmida;
// - osso alveolar: mesma construção, mais estreito, crista com septos interdentais e textura porosa;
// - placa/tártaro: aglomerados irregulares no colo, por vestibular.
// Eixos locais: X = arcada, Y = para cima (coroa), Z = profundidade (vestibular +Z).

const L = 2.4; // comprimento da arcada
const DENTES = [-0.84, -0.28, 0.28, 0.84];
const META = 0.28; // meia distância entre dentes

// ---------- utilidades determinísticas ----------
export const semente = (s: number) => () => {
  s = (s * 16807) % 2147483647;
  return (s - 1) / 2147483646;
};
export const suave = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// textura de ruído (bump) gerada em canvas, sempre igual
export const texturaRuido = (seed: number, escala: number, poros: boolean) => {
  const N = 256;
  const c = new OffscreenCanvas(N, N);
  const g = c.getContext("2d")!;
  const img = g.createImageData(N, N);
  const r = semente(seed);
  const base = new Float32Array(N * N).map(() => r());
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      // média de vizinhos (ruído suave) + poros pontuais
      let s = 0;
      for (let dy = -escala; dy <= escala; dy++)
        for (let dx = -escala; dx <= escala; dx++) s += base[((y + dy + N) % N) * N + ((x + dx + N) % N)];
      let v = s / ((2 * escala + 1) ** 2);
      if (poros && base[y * N + x] > 0.985) v -= 0.35;
      const i = (y * N + x) * 4;
      const b = Math.max(0, Math.min(255, Math.round(v * 255)));
      img.data[i] = img.data[i + 1] = img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

// ---------- dente ----------
const PERFIL_COROA: [number, number][] = [
  [0.0, -0.2],
  [0.16, -0.2],
  [0.2, -0.1],
  [0.215, 0.0],
  [0.25, 0.1],
  [0.3, 0.26],
  [0.315, 0.4],
  [0.295, 0.52],
  [0.22, 0.6],
  [0.12, 0.62],
  [0.0, 0.58],
];
const ESMALTE = new THREE.Color("#F8F4EC");
const DENTINA = new THREE.Color("#EAD7B5");

export const geoCoroa = () => {
  const g = new THREE.LatheGeometry(PERFIL_COROA.map(([r, y]) => new THREE.Vector2(r, y)), 96, 0, Math.PI * 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  const cores = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    const th = Math.atan2(z, x);
    const r = Math.hypot(x, z);
    // seção levemente quadrada (molar) e mais larga no sentido da arcada
    const q = 1 + 0.06 * Math.cos(4 * th) * suave(0.05, 0.3, y);
    x *= q * 1.06;
    z *= q * 0.94;
    // cúspides nos quatro cantos + fossa central
    const topo = suave(0.4, 0.6, y);
    const rr = Math.min(1, r / 0.3);
    y += topo * (0.045 * Math.max(0, Math.cos(4 * th + Math.PI / 4)) * rr - 0.07 * (1 - rr) ** 2);
    p.setXYZ(i, x, y, z);
    const c = DENTINA.clone().lerp(ESMALTE, suave(-0.04, 0.08, y));
    cores.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(cores, 3));
  g.computeVertexNormals();
  return g;
};

export const geoRaiz = () => {
  const perfil: [number, number][] = [
    [0.0, -1.02],
    [0.035, -0.98],
    [0.07, -0.8],
    [0.1, -0.5],
    [0.12, -0.25],
    [0.13, -0.1],
    [0.0, -0.1],
  ];
  const g = new THREE.LatheGeometry(perfil.map(([r, y]) => new THREE.Vector2(r, y)), 48);
  const p = g.attributes.position as THREE.BufferAttribute;
  const cores = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    p.setZ(i, p.getZ(i) * 0.78); // raiz achatada
    cores.set([DENTINA.r, DENTINA.g, DENTINA.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(cores, 3));
  g.computeVertexNormals();
  return g;
};

// ---------- gengiva e osso: superfície paramétrica ao longo da arcada ----------
type Crista = (x: number) => number;
const geoArcada = (opts: {
  largura: number;
  base: number;
  crista: Crista; // altura do topo em cada x
  bossa: number; // saliência vestibular sobre as raízes
  comprimento: number;
}) => {
  const NX = 180;
  const NV = 56;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const { largura, base, crista, bossa, comprimento } = opts;
  for (let i = 0; i <= NX; i++) {
    const u = i / NX;
    const x = (u - 0.5) * comprimento;
    // pontas arredondadas (cápsula)
    const ponta = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x) / (comprimento / 2), 6)), 0.5);
    const dDente = Math.min(...DENTES.map((d) => Math.abs(x - d))) / META; // 0 no dente, 1 entre dentes
    const topo = crista(x);
    const meiaL = (largura / 2) * ponta * (1 + bossa * Math.pow(1 - Math.min(1, dDente), 2));
    const topoP = base + (topo - base) * Math.sqrt(ponta);
    const yc = topoP - Math.min(0.22, (topoP - base) * 0.6);
    for (let j = 0; j <= NV; j++) {
      const v = j / NV;
      let z: number;
      let y: number;
      if (v < 0.2) {
        z = -meiaL;
        y = base + (yc - base) * (v / 0.2);
      } else if (v < 0.8) {
        const f = Math.PI * (1 - (v - 0.2) / 0.6);
        z = meiaL * Math.cos(f);
        y = yc + (topoP - yc) * Math.sin(f);
      } else {
        z = meiaL;
        y = yc + (base - yc) * ((v - 0.8) / 0.2);
      }
      pos.push(x, y, z);
      uv.push(u * 4, v);
    }
  }
  for (let i = 0; i < NX; i++)
    for (let j = 0; j < NV; j++) {
      const a = i * (NV + 1) + j;
      const b = a + NV + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1); // faces viradas pra fora
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

export type EstadoPerio = {
  separa: number; // 0 = montado · 1 = camadas afastadas em profundidade
  doenca: number; // 0 = saudável · 0,5 = inflamação · 1 = periodontite
};

const mistura = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);

export const ModeloPerio: React.FC<EstadoPerio> = ({ separa, doenca }) => {
  const d = Math.round(Math.max(0, Math.min(1, doenca)) * 50) / 50; // geometria muda em passos finos

  const fixos = useMemo(
    () => ({
      coroa: geoCoroa(),
      raiz: geoRaiz(),
      tartaro: new THREE.IcosahedronGeometry(0.04, 1),
      bumpGengiva: texturaRuido(3, 2, false),
      bumpOsso: texturaRuido(9, 1, true),
    }),
    [],
  );

  const inflama = Math.min(1, d / 0.5);
  const perio = Math.max(0, (d - 0.5) / 0.5);

  const gengiva = useMemo(() => {
    // papilas entre os dentes; inflamação incha a papila; periodontite retrai a margem
    const crista: Crista = (x) => {
      const dd = Math.min(...DENTES.map((t) => Math.abs(x - t))) / META;
      return 0.07 + 0.1 * Math.pow(Math.min(1, dd), 1.6) + 0.025 * inflama * Math.pow(Math.min(1, dd), 2) - 0.13 * perio * (1 - 0.4 * Math.min(1, dd));
    };
    return geoArcada({ largura: 0.82 + 0.05 * inflama, base: -0.46, crista, bossa: 0.1, comprimento: L });
  }, [inflama, perio]);

  const osso = useMemo(() => {
    // crista óssea com septos entre os dentes; periodontite: perda de suporte (horizontal + vertical)
    const crista: Crista = (x) => {
      const dd = Math.min(...DENTES.map((t) => Math.abs(x - t))) / META;
      return -0.06 + 0.05 * Math.min(1, dd) - perio * (0.26 + 0.06 * (1 - Math.min(1, dd)));
    };
    return geoArcada({ largura: 0.66, base: -0.98, crista, bossa: 0.06, comprimento: L - 0.14 });
  }, [perio]);

  const corGengiva = d < 0.5 ? mistura("#E57F8A", "#D2475A", d / 0.5) : mistura("#D2475A", "#A92A3E", (d - 0.5) / 0.5);
  const placa = Math.min(1, d / 0.6);
  const r = semente(21);
  const pedras = useMemo(
    () =>
      DENTES.flatMap((tx, i) =>
        Array.from({ length: 9 }, (_, k) => ({
          dente: i,
          x: tx - 0.17 + (k / 8) * 0.34 + (r() - 0.5) * 0.03,
          y: 0.05 + (r() - 0.5) * 0.05,
          s: 0.6 + r() * 0.7,
          rot: r() * 6,
        })),
      ),
    [],
  );

  return (
    <group>
      {/* camada 1 · dentes (+ placa/tártaro) */}
      <group position={[0, 0.05 * separa, 0.85 * separa]}>
        {DENTES.map((tx, i) => (
          <group key={i} position={[tx, 0, 0]} scale={i === 0 || i === 3 ? 0.94 : 1}>
            <mesh geometry={fixos.coroa} castShadow receiveShadow>
              <meshPhysicalMaterial vertexColors roughness={0.2} clearcoat={1} clearcoatRoughness={0.12} ior={1.62} sheen={0.25} sheenColor="#FFF1EA" />
            </mesh>
            {[-1, 1].map((lado) => (
              <mesh key={lado} geometry={fixos.raiz} position={[lado * 0.1, 0, 0]} rotation={[0, 0, lado * 0.1]} castShadow receiveShadow>
                <meshPhysicalMaterial vertexColors roughness={0.55} clearcoat={0.3} />
              </mesh>
            ))}
          </group>
        ))}
        {pedras.map((p, k) => (
          <mesh
            key={k}
            geometry={fixos.tartaro}
            position={[p.x, p.y, 0.235]}
            rotation={[p.rot, p.rot * 0.7, 0]}
            scale={[placa * p.s * 1.1, placa * p.s * 0.7, placa * p.s * 0.55]}
            castShadow
          >
            <meshStandardMaterial color="#D9C38C" roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* camada 2 · gengiva */}
      <mesh geometry={gengiva} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={corGengiva}
          roughness={0.38}
          clearcoat={0.55}
          clearcoatRoughness={0.3}
          sheen={0.8}
          sheenColor="#FFD6D9"
          sheenRoughness={0.5}
          bumpMap={fixos.bumpGengiva}
          bumpScale={0.6}
          emissive="#6E0F1E"
          emissiveIntensity={0.18 * d}
        />
      </mesh>

      {/* camada 3 · osso alveolar */}
      <mesh geometry={osso} position={[0, -0.06 * separa, -0.9 * separa]} castShadow receiveShadow>
        <meshStandardMaterial color="#E2D2B6" roughness={0.9} bumpMap={fixos.bumpOsso} bumpScale={1.4} />
      </mesh>
    </group>
  );
};
