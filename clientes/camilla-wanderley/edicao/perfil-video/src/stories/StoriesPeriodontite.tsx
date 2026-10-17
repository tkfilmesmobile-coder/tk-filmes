import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Ambiente, CORMORANT, MONTSERRAT, ROSE, Subtitulo, TagFio, TituloRose, VINHO } from "../periodontite/Bloco";
import { Enquadramento } from "../periodontite/Enquadramento";
import { LinhaDoTempo3D } from "../periodontite/LinhaDoTempo3D";
import { ModeloPerio } from "../periodontite/Modelo";

// Sequência de stories do reels "Periodontite na gestação" (regra da Talyta: todo post leva no mínimo
// 3 stories ligados ao assunto). Modelo escolhido pela Talyta em 2026-10-07 ("primeiro modelo"): fundo
// blush, mesmo bloco de texto do vídeo (fio + caixa alta, título rosé, itálico) e o 3D do vídeo.
// (Recusados: versão com fotos tratadas e versão orgânica de app, ver posts/2026-10/periodontite-reels/.)
// Cada quadro da composição é um story (`remotion still --frame=N`).
// Área segura dos stories: nada importante nos 250 px de cima nem nos 330 px de baixo.
const DESCE = 230; // o bloco de texto do vídeo começa em 118 px; nos stories, 230 px mais pra baixo

const FUNDO = "radial-gradient(120% 80% at 30% 20%, #FAF0EC 0%, #F3E3DE 50%, #EAD3CD 100%)";

const Maquete: React.FC<{ separa: number; doenca: number; y: number; escala: number; giro: number }> = ({ separa, doenca, y, escala, giro }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows="soft" camera={{ fov: 30, near: 0.1, far: 60, position: [0.1, 0.45, 9.6] }} gl={{ alpha: true, antialias: true }}>
        <Ambiente intensidade={0.7} />
        <ambientLight intensity={0.15} />
        <hemisphereLight args={["#FFF7F4", "#E4C6C0", 0.25]} />
        <directionalLight position={[2.4, 5, 5.5]} intensity={1.25} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#FFD9D3" />
        <mesh position={[0, y - 0.57 * escala, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[12, 12]} />
          <shadowMaterial opacity={0.13} />
        </mesh>
        <group position={[-0.1, y, 0]} rotation={[0.3, giro, 0]} scale={escala}>
          <ModeloPerio separa={separa} doenca={doenca} />
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const Texto: React.FC<{ children: React.ReactNode; top: number }> = ({ children, top }) => (
  <div style={{ position: "absolute", top, left: 110, right: 110, textAlign: "center", fontFamily: MONTSERRAT, fontWeight: 500, fontSize: 38, lineHeight: 1.45, color: VINHO }}>
    {children}
  </div>
);

const Assinatura: React.FC<{ top?: number }> = ({ top = 1500 }) => (
  <div style={{ position: "absolute", top, width: "100%", textAlign: "center" }}>
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
      <div style={{ width: 40, height: 1.5, background: ROSE }} />
      <div style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 22, letterSpacing: 7, color: VINHO }}>DRA. CAMILLA WANDERLEY</div>
      <div style={{ width: 40, height: 1.5, background: ROSE }} />
    </div>
    <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontWeight: 500, fontSize: 40, color: ROSE, marginTop: 8 }}>Clínica Geral e Endodontia</div>
  </div>
);

const Bloco: React.FC<{ tag: string; titulo: string; sub?: string }> = ({ tag, titulo, sub }) => (
  <AbsoluteFill style={{ translate: `0px ${DESCE}px` }}>
    <TagFio texto={tag} p={1} />
    <TituloRose texto={titulo} p={1} />
    {sub ? <Subtitulo texto={sub} opacidade={1} dy={0} /> : null}
  </AbsoluteFill>
);

// 1 · gancho
const Story1: React.FC = () => (
  <AbsoluteFill style={{ background: FUNDO }}>
    <Bloco tag="GRÁVIDA OU QUERENDO ENGRAVIDAR?" titulo="Periodontite" sub="você já ouviu falar?" />
    <Maquete separa={0} doenca={1} y={0.46} escala={0.62} giro={-0.82} />
    <Texto top={1180}>
      Uma doença da gengiva que merece <b style={{ color: "#9B2737" }}>atenção especial</b> na gestação.
    </Texto>
    <Assinatura />
  </AbsoluteFill>
);

// 2 · o que é (camadas separadas: dente, gengiva, osso)
const Story2: React.FC = () => (
  <AbsoluteFill style={{ background: FUNDO }}>
    <Bloco tag="O QUE É" titulo="Periodontite" sub="inflamação que tira a sustentação do dente" />
    <Maquete separa={1} doenca={0.85} y={0.5} escala={0.58} giro={-0.95} />
    <Texto top={1150}>
      Começa na gengiva e atinge o osso que segura o dente. Na gestação, está <b style={{ color: "#9B2737" }}>associada a maior risco de parto prematuro</b>.
    </Texto>
  </AbsoluteFill>
);

// 3 · quando tratar (linha do tempo, foco no 2º trimestre)
const Story3: React.FC = () => (
  <AbsoluteFill style={{ background: FUNDO }}>
    {/* o véu do bloco desce junto: completa o topo com a mesma cor pra não aparecer emenda */}
    <AbsoluteFill style={{ height: DESCE + 4, background: "rgba(248,236,232,0.97)" }} />
    {/* a linha do tempo anima pela timeline: começa 3 s "adiantada" pra aparecer no estado final */}
    <Sequence from={-90} layout="none">
      <AbsoluteFill style={{ translate: `0px ${DESCE}px` }}>
        <LinhaDoTempo3D
          c={{
            de: 0,
            foco: 1.0,
            ate: 1000,
            tituloEm: 0.8,
            subEm: 1.0,
            partida: 1,
            focoIdx: 2,
            tag: "QUANDO TRATAR NA GESTAÇÃO",
            titulo: "2º trimestre",
            sub: "a fase mais indicada",
          }}
        />
      </AbsoluteFill>
    </Sequence>
    <Texto top={1150}>
      E o ideal mesmo é cuidar <b style={{ color: "#9B2737" }}>antes de engravidar</b>: saúde bucal também é planejamento.
    </Texto>
    <Assinatura />
  </AbsoluteFill>
);

// 4 · chamada: a doutora (quadro do vídeo) + vídeo novo no perfil + direct
const Story4: React.FC = () => (
  <AbsoluteFill style={{ background: FUNDO }}>
    <AbsoluteFill style={{ translate: "-70px 230px", scale: 1.14 }}>
      <Enquadramento de={Math.round(13.4 * 30)} />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        background: "linear-gradient(to bottom, rgba(248,236,232,1) 0%, rgba(246,232,228,0.97) 33%, rgba(244,229,225,0.6) 42%, rgba(244,229,225,0) 50%)",
      }}
    />
    <Bloco tag="VÍDEO NOVO NO PERFIL" titulo="Periodontite" sub="e a gestação" />
    <div
      style={{
        position: "absolute",
        bottom: 380,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: MONTSERRAT,
        fontWeight: 600,
        fontSize: 40,
        color: "#FFFFFF",
        textShadow: "0 0 24px rgba(20,8,12,0.55), 0 2px 8px rgba(20,8,12,0.5)",
        lineHeight: 1.4,
      }}
    >
      Ficou com dúvida?
      <br />
      <span style={{ color: "#FFC9D1" }}>me chama no direct</span>
    </div>
  </AbsoluteFill>
);

export const StoriesPeriodontite: React.FC = () => {
  const f = useCurrentFrame();
  if (f === 0) return <Story1 />;
  if (f === 1) return <Story2 />;
  if (f === 2) return <Story3 />;
  return <Story4 />;
};
