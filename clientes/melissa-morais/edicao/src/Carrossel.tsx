import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

// Carrossel 1080x1350 no estilo da referência: pessoas recortadas sobre o preto, uma um pouco à frente
// da outra, miras finas na testa e setas na região do maxilar nos perfis. Sem texto: a Dra. Melissa
// insere os textos dela. Só a logo entra. Recortes: os da Talyta, alinhados às fotos originais por
// scripts/alinhar-recortes.py.
export const SLIDES = 6;
export const SW = 1080;
export const SH = 1350;

type Recorte = { src: string; w: number; h: number };
const R = {
  antesSobr: { src: "recortes/antes-sobrancelha-levantada.png", w: 1200, h: 1600 },
  depoisSobr: { src: "recortes/depois-sobrancelha-levantada.png", w: 736, h: 1600 },
  antesFranzir: { src: "recortes/antes-franzir.png", w: 1200, h: 1600 },
  depoisFranzir: { src: "recortes/depois-franzir.png", w: 736, h: 1600 },
  antesRepouso: { src: "recortes/antes-repouso.png", w: 736, h: 1600 },
  depoisRepouso: { src: "recortes/depois-repouso.png", w: 1200, h: 1600 },
  antesPerfil: { src: "recortes/perfil-clinica-b.png", w: 1200, h: 1600 },
  depoisPerfil: { src: "recortes/perfil-clinica-a.png", w: 1200, h: 1600 },
} satisfies Record<string, Recorte>;

// Olhos (meio) e distância entre eles, em px da foto original
const OLHOS = {
  antesRepouso: { x: 335, y: 684, d: 163 },
  depoisRepouso: { x: 546, y: 656, d: 252 },
  antesSobr: { x: 557, y: 733, d: 274 },
  depoisSobr: { x: 360, y: 672, d: 217 },
  antesFranzir: { x: 587, y: 703, d: 266 },
  depoisFranzir: { x: 362, y: 711, d: 208 },
};

const BORDA =
  "linear-gradient(to bottom, #000 0%, #000 72%, rgba(0,0,0,0) 97%), linear-gradient(to right, rgba(0,0,0,0) 0%, #000 7%, #000 93%, rgba(0,0,0,0) 100%)";

// A foto recortada entra com o ponto (ax, ay) da foto em (x, y) do slide, na escala s.
const Pessoa: React.FC<{
  r: Recorte;
  ax: number;
  ay: number;
  x: number;
  y: number;
  s: number;
  // polígono (px da foto original) do que fica visível; o resto some sem degradê
  mantem?: [number, number][];
  // giro (graus, sentido horário) em torno do ponto de referência
  gira?: number;
  // sem o esfumado nas bordas da foto
  semBorda?: boolean;
  // espelha na horizontal (o rosto passa a olhar pro outro lado)
  espelha?: boolean;
}> = ({ r, ax, ay, x, y, s, mantem, gira = 0, semBorda = false, espelha = false }) => (
  <Img
    src={staticFile(r.src)}
    style={{
      position: "absolute",
      width: r.w * s,
      height: r.h * s,
      left: x - ax * s,
      top: y - ay * s,
      // a borda da foto original nunca aparece como linha reta: some no preto
      WebkitMaskImage: semBorda ? undefined : BORDA,
      maskImage: semBorda ? undefined : BORDA,
      WebkitMaskComposite: "source-in",
      maskComposite: "intersect",
      transformOrigin: `${ax * s}px ${ay * s}px`,
      rotate: `${gira}deg`,
      scale: espelha ? "-1 1" : undefined,
      clipPath: mantem ? `polygon(${mantem.map(([px, py]) => `${px * s}px ${py * s}px`).join(", ")})` : undefined,
    }}
  />
);

const Mira: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const L = Math.max(14, Math.min(26, w * 0.12));
  const c = "rgba(255,255,255,0.92)";
  const canto = (pos: React.CSSProperties): React.CSSProperties => ({ position: "absolute", width: L, height: L, ...pos });
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h }}>
      <div style={canto({ left: 0, top: 0, borderLeft: `2px solid ${c}`, borderTop: `2px solid ${c}` })} />
      <div style={canto({ right: 0, top: 0, borderRight: `2px solid ${c}`, borderTop: `2px solid ${c}` })} />
      <div style={canto({ left: 0, bottom: 0, borderLeft: `2px solid ${c}`, borderBottom: `2px solid ${c}` })} />
      <div style={canto({ right: 0, bottom: 0, borderRight: `2px solid ${c}`, borderBottom: `2px solid ${c}` })} />
    </div>
  );
};

// Três setas finas, como na referência. `angulo` gira o conjunto (0 = pra cima).
const Setas: React.FC<{ x: number; y: number; angulo: number; escala?: number }> = ({ x, y, angulo, escala = 0.85 }) => (
  <svg
    width={140}
    height={170}
    viewBox="-70 -85 140 170"
    style={{
      position: "absolute",
      left: x - 70,
      top: y - 85,
      overflow: "visible",
      rotate: `${angulo}deg`,
      scale: String(escala),
      filter: "drop-shadow(0 0 5px rgba(0,0,0,0.5))",
    }}
  >
    {[-30, 0, 30].map((dx, i) => {
      const topo = i === 1 ? -62 : -52;
      const base = i === 1 ? 52 : 62;
      return (
        <g key={dx} stroke="rgba(255,255,255,0.85)" strokeWidth={2.6} strokeLinecap="round" fill="none">
          <line x1={dx} y1={base} x2={dx} y2={topo} />
          <polyline points={`${dx - 9},${topo + 14} ${dx},${topo} ${dx + 9},${topo + 14}`} />
        </g>
      );
    })}
  </svg>
);

const Logo: React.FC<{ largura: number; style?: React.CSSProperties }> = ({ largura, style }) => (
  <Img src={staticFile("marca/logo-branca.png")} style={{ width: largura, height: (largura * 697) / 1600, ...style }} />
);

// O pé das fotos some no preto, como na referência; a faixa de baixo fica livre pro texto dela.
const Pe: React.FC<{ de: number; ate: number }> = ({ de, ate }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      width: SW,
      top: de,
      height: SH - de,
      background: `linear-gradient(to bottom, rgba(0,0,0,0) 0px, #000 ${ate - de}px, #000 100%)`,
    }}
  />
);

// Par frontal: antes atrás à esquerda, depois um pouco à frente à direita
const ParFrontal: React.FC<{
  antes: Recorte;
  depois: Recorte;
  oa: { x: number; y: number; d: number };
  od: { x: number; y: number; d: number };
  D: number;
  xa: number;
  xd: number;
  y: number;
  mira: { altura: number; larg: number; alt: number };
}> = ({ antes, depois, oa, od, D, xa, xd, y, mira }) => (
  <>
    <Pessoa r={antes} ax={oa.x} ay={oa.y} x={xa} y={y} s={D / oa.d} />
    <Mira x={xa} y={y - mira.altura * D} w={mira.larg * D} h={mira.alt * D} />
    <Pessoa r={depois} ax={od.x} ay={od.y} x={xd} y={y} s={D / od.d} />
    <Mira x={xd} y={y - mira.altura * D} w={mira.larg * D} h={mira.alt * D} />
  </>
);

const MIRA_TESTA = { altura: 0.9, larg: 1.2, alt: 0.8 };
const MIRA_GLABELA = { altura: 0.62, larg: 0.9, alt: 0.6 };

// Slide principal, como o 1º da referência: rosto em repouso, antes e depois lado a lado, grandes, sem marcação
const Principal: React.FC = () => {
  // os dois rostos inteiros à mostra (pedido da cliente): só o cabelo encosta, nenhum rosto cobre o outro
  const D = 215;
  const y = 610;
  return (
    <>
      <Pessoa r={R.antesRepouso} ax={OLHOS.antesRepouso.x} ay={OLHOS.antesRepouso.y} x={265} y={y} s={D / OLHOS.antesRepouso.d} />
      <Pessoa r={R.depoisRepouso} ax={OLHOS.depoisRepouso.x} ay={OLHOS.depoisRepouso.y} x={815} y={y} s={D / OLHOS.depoisRepouso.d} />
      <Pe de={960} ate={1170} />
    </>
  );
};

const Capa: React.FC = () => (
  <>
    <ParFrontal
      antes={R.antesSobr}
      depois={R.depoisSobr}
      oa={OLHOS.antesSobr}
      od={OLHOS.depoisSobr}
      D={255}
      xa={285}
      xd={800}
      y={600}
      mira={MIRA_TESTA}
    />
    <Pe de={960} ate={1170} />
  </>
);

// Perfis da sala de atendimento, frente a frente (pedido da Talyta, 2026-10-17): o da esquerda olha pra direita;
// o da direita, um pouco mais alto, é espelhado e olha pra esquerda, como se os rostos se encontrassem. Assim a nuca
// cortada das duas fotos fica nas bordas do slide. Girados pra ficarem em pé e no mesmo tamanho (olho ao queixo).
// Setas: na da esquerda pra cima; na da direita pra baixo (correção da Talyta).
const OLHO_QUEIXO = 410;
const PERFIS = {
  esquerda: { olho: [464, 819], queixo: [777, 1006], seta: [526, 1043] }, // perfil-clinica-b
  direita: { olho: [410, 819], queixo: [801, 1018], seta: [444, 1093] }, // perfil-clinica-a
};
// ponto da foto -> ponto do slide (escala, espelho e giro em torno do olho)
const noSlide = (p: number[], olho: number[], s: number, graus: number, x: number, y: number, espelha: boolean) => {
  const r = (graus * Math.PI) / 180;
  const dx = (p[0] - olho[0]) * s * (espelha ? -1 : 1);
  const dy = (p[1] - olho[1]) * s;
  return [x + dx * Math.cos(r) - dy * Math.sin(r), y + dx * Math.sin(r) + dy * Math.cos(r)];
};

const UmPerfil: React.FC<{
  r: Recorte;
  p: (typeof PERFIS)["esquerda"];
  gira: number;
  x: number;
  y: number;
  setaAngulo: number; // direção final da seta no slide (0 = pra cima, sentido horário)
  espelha?: boolean;
}> = ({ r, p, gira, x, y, setaAngulo, espelha = false }) => {
  const s = OLHO_QUEIXO / Math.hypot(p.queixo[0] - p.olho[0], p.queixo[1] - p.olho[1]);
  const [sx, sy] = noSlide(p.seta, p.olho, s, gira, x, y, espelha);
  return (
    <>
      <Pessoa r={r} ax={p.olho[0]} ay={p.olho[1]} x={x} y={y} s={s} gira={gira} espelha={espelha} />
      <Setas x={sx} y={sy} angulo={setaAngulo} />
    </>
  );
};

const PERFIL_POS = { xe: 255, ye: 550, xd: 825, yd: 480 };

const Perfil: React.FC = () => (
  <>
    {/* esquerda: setas pra cima, rumo à maçã do rosto */}
    <UmPerfil r={R.antesPerfil} p={PERFIS.esquerda} gira={40} x={PERFIL_POS.xe} y={PERFIL_POS.ye} setaAngulo={-15} />
    {/* direita, espelhada: setas pra baixo, rumo ao queixo */}
    <UmPerfil
      r={R.depoisPerfil}
      p={PERFIS.direita}
      gira={-44}
      x={PERFIL_POS.xd}
      y={PERFIL_POS.yd}
      setaAngulo={195}
      espelha
    />
    <Pe de={960} ate={1170} />
  </>
);

// Grade como no slide 3 da referência: duas fileiras, a de baixo se sobrepondo à de cima
const Grade: React.FC = () => (
  <>
    <ParFrontal
      antes={R.antesSobr}
      depois={R.depoisSobr}
      oa={OLHOS.antesSobr}
      od={OLHOS.depoisSobr}
      D={180}
      xa={270}
      xd={810}
      y={340}
      mira={MIRA_TESTA}
    />
    <ParFrontal
      antes={R.antesFranzir}
      depois={R.depoisFranzir}
      oa={OLHOS.antesFranzir}
      od={OLHOS.depoisFranzir}
      D={180}
      xa={270}
      xd={810}
      y={800}
      mira={MIRA_GLABELA}
    />
    <Pe de={1080} ate={1250} />
  </>
);

// Depois em três ângulos, só com os recortes da Talyta: franzindo (atrás, à esquerda), perfil IMG_6841
// (atrás, à direita) e olhando pra cima (na frente, no meio). Mira na testa de cada uma.
const Movimento: React.FC = () => {
  const D = 180;
  const y = 600;
  // perfil: olho em (1436, 1760), testa em (1478, 1478) e queixo em (1570, 2444) da foto 3024x4032
  // perfil maior que os outros dois, ocupando a sobra da direita (pedido da Talyta)
  const sp = (1.6 * D) / 697;
  const xp = 905;
  return (
    <>
      <Pessoa r={{ src: "recortes/depois-perfil-1.png", w: 3024, h: 4032 }} ax={1436} ay={1760} x={xp} y={y} s={sp} />
      <Mira x={xp + (1478 - 1436) * sp} y={y + (1478 - 1760) * sp} w={1.15 * D} h={0.75 * D} />
      <Pessoa r={R.depoisFranzir} ax={OLHOS.depoisFranzir.x} ay={OLHOS.depoisFranzir.y} x={215} y={y} s={D / OLHOS.depoisFranzir.d} />
      <Mira x={215} y={y - MIRA_TESTA.altura * D} w={MIRA_TESTA.larg * D} h={MIRA_TESTA.alt * D} />
      <Pessoa r={R.depoisSobr} ax={OLHOS.depoisSobr.x} ay={OLHOS.depoisSobr.y} x={545} y={y + 20} s={(D * 1.08) / OLHOS.depoisSobr.d} />
      <Mira x={545} y={y + 20 - MIRA_TESTA.altura * D * 1.08} w={MIRA_TESTA.larg * D * 1.08} h={MIRA_TESTA.alt * D * 1.08} />
      <Pe de={960} ate={1170} />
    </>
  );
};

export const Carrossel: React.FC<{ identificacao: string }> = () => {
  const slide = useCurrentFrame(); // um quadro por slide
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {slide === 0 && <Principal />}
      {slide === 1 && <Perfil />}
      {slide === 2 && <Grade />}
      {slide === 3 && <Capa />}
      {slide === 4 && <Movimento />}
      {slide === 5 ? (
        <Logo largura={680} style={{ position: "absolute", left: (SW - 680) / 2, top: 500 }} />
      ) : (
        <Logo largura={170} style={{ position: "absolute", left: 40, top: 38 }} />
      )}
    </AbsoluteFill>
  );
};
