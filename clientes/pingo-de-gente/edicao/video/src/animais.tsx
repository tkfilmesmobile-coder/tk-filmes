import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { BOIL, COR, FPS, clamp } from "./marca";
import corpo from "./corpo.json";
import rastreio from "./rastreio.json";
import { Rabisco } from "./rabiscos";

// Bichos grandes desenhados à mão POR TRÁS da menina (referência 1 da Talyta: elefante de corações atrás
// das crianças) e linhas de velocidade a lápis atrás dela quando corre (pedido de 2026-11-04).
// Ficam entre o fundo e o recorte dela (public/midia/recorte/*.mov).

const LARANJA = "#FF9F1C", LARANJA_E = "#E06A00", MARROM = "#B5733A", MARROM_E = "#7A4520";

const Giz: React.FC<{ id: string; seed: number; forte?: number; grao?: number }> = ({ id, seed, forte = 3.5, grao = 0.85 }) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed % 97} result="w" />
    <feDisplacementMap in="SourceGraphic" in2="w" scale={forte} xChannelSelector="R" yChannelSelector="G" result="d" />
    <feTurbulence type="fractalNoise" baseFrequency={grao} numOctaves={1} seed={(seed + 5) % 97} result="g" />
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 2.0" result="ga" />
    <feComposite in="d" in2="ga" operator="in" />
  </filter>
);
const Hach: React.FC<{ id: string; cor: string; seed: number }> = ({ id, cor, seed }) => (
  <pattern id={id} patternUnits="userSpaceOnUse" width={5} height={5} patternTransform={`rotate(${36 + (seed % 3) * 5})`}>
    <rect width={5} height={5} fill={cor} opacity={0.8} />
    <line x1={1.2} y1={0} x2={1.2} y2={5} stroke={cor} strokeWidth={3} />
  </pattern>
);
const cor = (x: number, y: number, s: number) =>
  `M${x} ${y + 3 * s} C ${x - 4 * s} ${y - 1 * s}, ${x - 2 * s} ${y - 5 * s}, ${x} ${y - 2.6 * s} C ${x + 2 * s} ${y - 5 * s}, ${x + 4 * s} ${y - 1 * s}, ${x} ${y + 3 * s} Z`;

type Bicho = "elefante" | "girafa" | "macaco";
type Peca = { d: string; fill?: string; stroke?: string; sw?: number };

function pecas(b: Bicho, h: (c: string) => string): { vb: string; p: Peca[] } {
  const M = COR.marinho;
  if (b === "elefante") {
    return {
      vb: "0 -10 200 170",
      p: [
        { d: "M176 64 Q 192 74, 186 94 M183 92 l 6 7 M184 93 l -3 8", stroke: M, sw: 3.5 },
        { d: "M72 44 C 98 22, 152 24, 172 50 C 186 70, 184 100, 174 112 L 174 146 Q 174 152 166 152 L 154 152 Q 148 152 148 146 L 148 122 C 132 126, 112 126, 98 122 L 98 146 Q 98 152 90 152 L 78 152 Q 72 152 72 146 L 72 114 C 64 108, 58 100, 56 90 C 46 92, 38 86, 34 74 C 28 60, 26 42, 32 28 C 35 20, 45 20, 45 28 C 41 42, 43 58, 52 66 C 54 54, 60 48, 72 44 Z", fill: h(LARANJA), stroke: M, sw: 3.5 },
        { d: "M80 54 C 98 46, 118 58, 114 82 C 110 100, 90 102, 82 90 C 76 80, 74 64, 80 54 Z", fill: h(COR.amarelo), stroke: M, sw: 3 },
        { d: [cor(132, 62, 4), cor(152, 90, 4.4), cor(124, 100, 3.6), cor(156, 58, 3.2), cor(100, 108, 3)].join(" "), fill: COR.rosa, stroke: "#C2185B", sw: 1.6 },
        { d: "M64 61 l0.1 0.1", stroke: M, sw: 6 },
        { d: "M60 74 Q 64 78, 68 74", stroke: M, sw: 2.2 },
        // flor na ponta da tromba
        { d: "M38 20 C 30 10, 32 2, 38 -2 C 44 2, 46 10, 38 20 Z M38 20 C 26 16, 22 8, 24 4 C 32 6, 36 12, 38 20 Z M38 20 C 50 16, 54 8, 52 4 C 44 6, 40 12, 38 20 Z", fill: COR.rosa, stroke: "#C2185B", sw: 1.8 },
        { d: "M84 152 l0 -6 M90 152 l0 -6 M160 152 l0 -6 M166 152 l0 -6", stroke: M, sw: 2 },
      ],
    };
  }
  if (b === "girafa") {
    const manchas = [[70, 162, 9], [88, 182, 8], [56, 188, 7], [82, 120, 6], [84, 92, 6], [86, 66, 5], [44, 166, 6]]
      .map(([x, y, r]) => `M${x + r} ${y} C ${x + r} ${y + r * 1.2}, ${x - r} ${y + r * 0.9}, ${x - r} ${y} C ${x - r * 1.1} ${y - r}, ${x + r * 0.8} ${y - r * 1.2}, ${x + r} ${y} Z`).join(" ");
    return {
      vb: "0 0 130 250",
      p: [
        { d: "M28 160 Q 14 170, 18 186", stroke: COR.marinho, sw: 3 },
        { d: "M30 156 C 30 138, 96 136, 102 156 L 102 230 Q 102 236 96 236 L 90 236 Q 84 236 84 230 L 84 186 L 50 186 L 50 230 Q 50 236 44 236 L 38 236 Q 32 236 32 230 Z", fill: h(COR.amarelo), stroke: COR.marinho, sw: 3.2 },
        { d: "M74 150 L 80 52 L 98 52 L 100 150 Z", fill: h(COR.amarelo), stroke: COR.marinho, sw: 3.2 },
        { d: "M84 18 L 82 4 M100 16 L 102 2", stroke: COR.marinho, sw: 3.5 },
        { d: "M82 4 l0.1 0 M102 2 l0.1 0", stroke: LARANJA_E, sw: 8 },
        { d: "M72 32 C 72 16, 108 12, 116 32 C 120 46, 110 54, 100 54 L 84 54 C 76 54, 72 46, 72 32 Z", fill: h(COR.amarelo), stroke: COR.marinho, sw: 3.2 },
        { d: "M74 26 C 64 20, 62 30, 72 32", fill: COR.amarelo, stroke: COR.marinho, sw: 2.5 },
        { d: manchas, fill: LARANJA, stroke: LARANJA_E, sw: 1.5 },
        { d: "M90 30 l0.1 0.1", stroke: COR.marinho, sw: 6 },
        { d: "M104 44 Q 108 47, 112 44", stroke: COR.marinho, sw: 2.2 },
        { d: "M98 38 l0.1 0.1", stroke: COR.rosa, sw: 7 },
        { d: "M84 54 L 82 150", stroke: LARANJA_E, sw: 1.2 },
      ],
    };
  }
  // macaco sentado, de rabo enrolado (marrom: o azul-céu sumia no verde da ponte, teste de 2026-11-04)
  return {
    vb: "0 0 140 140",
    p: [
      { d: "M86 112 C 120 116, 132 92, 118 78 C 108 68, 96 80, 106 88", stroke: MARROM_E, sw: 5 },
      { d: "M44 126 C 36 96, 46 74, 66 72 C 88 72, 98 96, 90 126 Z", fill: h(MARROM), stroke: COR.marinho, sw: 3.2 },
      { d: "M56 126 C 54 106, 60 96, 67 96 C 76 96, 80 106, 78 126 Z", fill: "#FFE1B8", stroke: COR.marinho, sw: 2 },
      { d: "M30 40 A12 12 0 1 1 29.9 39.9 Z M104 40 A12 12 0 1 1 103.9 39.9 Z", fill: h(MARROM), stroke: COR.marinho, sw: 3 },
      { d: "M42 44 C 42 18, 92 18, 92 44 C 92 66, 42 66, 42 44 Z", fill: h(MARROM), stroke: COR.marinho, sw: 3.2 },
      { d: "M62 22 Q 66 12, 72 20", stroke: MARROM_E, sw: 3 },
      { d: "M50 48 C 50 34, 84 34, 84 48 C 84 62, 50 62, 50 48 Z", fill: "#FFE1B8", stroke: COR.marinho, sw: 2 },
      { d: "M59 44 l0.1 0.1 M75 44 l0.1 0.1", stroke: COR.marinho, sw: 6 },
      { d: "M60 53 Q 67 59, 74 53", stroke: COR.marinho, sw: 2.4 },
      { d: "M38 102 C 26 96, 24 84, 34 82 M96 102 C 108 96, 110 84, 100 82", stroke: COR.marinho, sw: 4 },
    ],
  };
}

export type BichoG = { b: Bicho; x: number; base: number; larg: number; em: number; ate: number; espelha?: boolean; rot?: number };

export const BichoGrande: React.FC<{ g: BichoG; id: string }> = ({ g, id }) => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  if (s < g.em || s > g.ate + 0.3) return null;
  const k = s - g.em;
  const seed = Math.floor(fr / BOIL) + Math.round(random(id) * 50);
  const { vb, p } = pecas(g.b, (c) => `url(#h-${id}-${c.slice(1)})`);
  const [, , vw, vh] = vb.split(" ").map(Number);
  const alt = g.larg * (vh / vw);
  // entra subindo de trás (como quem aparece por trás dela), com mola
  const sobe = interpolate(k, [0, 0.3, 0.42, 0.52], [alt * 0.55, -alt * 0.04, alt * 0.015, 0], clamp);
  const estica = interpolate(k, [0, 0.3, 0.42, 0.52], [0.9, 1.04, 0.98, 1], clamp);
  const sai = interpolate(s, [g.ate, g.ate + 0.28], [0, 1], clamp);
  const balanca = Math.sin(k * 2.1) * 2.2 + (g.rot ?? 0);
  const respira = 1 + Math.sin(k * 3.2) * 0.012;
  const cores = [LARANJA, COR.amarelo, COR.ceu, MARROM];
  return (
    <svg viewBox={vb} width={g.larg} height={alt} style={{
      position: "absolute", left: g.x - g.larg / 2, top: g.base - alt, overflow: "visible",
      transform: `translateY(${sobe + sai * alt * 0.6}px) rotate(${balanca}deg) scaleY(${estica * respira}) ${g.espelha ? "scaleX(-1)" : ""}`,
      transformOrigin: "50% 100%", opacity: 1 - sai,
      filter: "drop-shadow(0 0 3px rgba(255,255,255,0.9)) drop-shadow(0 12px 14px rgba(20,30,70,0.3))",
    }}>
      <defs>
        <Giz id={`f-${id}`} seed={seed} forte={2.6} grao={0.9} />
        {cores.map((c) => <Hach key={c} id={`h-${id}-${c.slice(1)}`} cor={c} seed={seed} />)}
      </defs>
      <g filter={`url(#f-${id})`}>
        {p.map((x, i) => (
          <path key={i} d={x.d} fill={x.fill ?? "none"} stroke={x.stroke} strokeWidth={x.sw} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </g>
    </svg>
  );
};

// ---------- rastreio (rastrear.py): sacola da cena 9 e árvores da ponte ----------
type Afim = number[][];
const RAS = rastreio as { sacola: Record<string, number[]>; ponte: { de: number; ref: number; copa: Afim[]; corrimao: Afim[] } };
const aplica = (M: Afim, x: number, y: number) => [M[0][0] * x + M[0][1] * y + M[0][2], M[1][0] * x + M[1][1] * y + M[1][2]];
function inversa(M: Afim): Afim {
  const [[a, b, tx], [c, d, ty]] = M;
  const det = a * d - b * c;
  const ia = d / det, ib = -b / det, ic = -c / det, id = a / det;
  return [[ia, ib, -(ia * tx + ib * ty)], [ic, id, -(ic * tx + id * ty)]];
}
const escala = (M: Afim) => Math.sqrt(Math.abs(M[0][0] * M[1][1] - M[0][1] * M[1][0]));

// setas que apontam pra sacola e andam/crescem com ela (no lugar do círculo, pedido da Talyta 2026-11-04)
export type Seta = { em: number; ate: number; ang: number; alvo: [number, number]; cor?: string };
export const SetaSacola: React.FC<{ a: Seta; id: string }> = ({ a, id }) => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  const b = RAS.sacola[String(Math.min(fr, Math.round(a.ate * FPS)))];
  if (!b || s < a.em - 0.01 || s > a.ate + 0.25) return null;
  const [x0, y0, x1, y1] = b;
  const h = y1 - y0;
  const tx = x0 + (x1 - x0) * a.alvo[0], ty = y0 + h * a.alvo[1];
  const tam = Math.min(250, Math.max(110, h * 0.42));
  const L = tam * 1.3;
  const r = (a.ang * Math.PI) / 180;
  // cutucadas na direção da sacola
  const cutuca = 22 + Math.sin((s - a.em) * 9 + a.ang) * 16;
  const cx = tx - Math.cos(r) * (L / 2 + cutuca), cy = ty - Math.sin(r) * (L / 2 + cutuca);
  return <Rabisco id={id} r={{ tipo: "flecha", x: cx, y: cy, tam, em: a.em, ate: a.ate, rot: a.ang, desvia: false, cor: a.cor }} />;
};

// macaquinhos presos nas árvores da ponte (pedido da Talyta 2026-11-04: "surgindo de dentro das árvores")
export type Macaco = { tipo: "espia" | "pendurado" | "sentado"; x: number; y: number; larg: number; em: number; ate: number; zona: "copa" | "corrimao"; espelha?: boolean };

function pecasMacaco(h: (c: string) => string): Peca[] {
  return pecas("macaco", h).p;
}

export const MacacoArvore: React.FC<{ m: Macaco; id: string }> = ({ m, id }) => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  const P = RAS.ponte;
  const k = fr - P.de, ke = Math.round(m.em * FPS) - P.de;
  const movs = P[m.zona];
  if (k < 0 || k >= movs.length || s < m.em || s > m.ate + 0.3) return null;
  const Mk = movs[k], Me = movs[Math.max(0, Math.min(movs.length - 1, ke))];
  // ponto marcado no quadro em que o macaco entra, levado pro quadro atual
  const [ax0, ay0] = aplica(inversa(Me), m.x, m.y);
  const [ax, ay] = aplica(Mk, ax0, ay0);
  const esc = escala(Mk) / escala(Me);
  const larg = m.larg * esc;
  const kk = s - m.em;
  const sai = interpolate(s, [m.ate, m.ate + 0.25], [0, 1], clamp);
  const seed = Math.floor(fr / BOIL) + Math.round(random(id) * 50);
  const hach = (c: string) => `url(#h-${id}-${c.slice(1)})`;
  const corpo = pecasMacaco(hach);
  const filtro = (
    <defs>
      <Giz id={`f-${id}`} seed={seed} forte={2.4} grao={0.9} />
      {[MARROM, COR.verde, "#1E8A40"].map((c) => <Hach key={c} id={`h-${id}-${c.slice(1)}`} cor={c} seed={seed} />)}
      <clipPath id={`c-${id}`}><rect x={-20} y={-60} width={180} height={168} /></clipPath>
    </defs>
  );
  const sombra = "drop-shadow(0 0 3px rgba(255,255,255,0.9)) drop-shadow(0 8px 10px rgba(20,30,70,0.3))";
  const desenha = (ps: Peca[]) => ps.map((x, i) => <path key={i} d={x.d} fill={x.fill ?? "none"} stroke={x.stroke} strokeWidth={x.sw} strokeLinecap="round" strokeLinejoin="round" />);

  if (m.tipo === "espia") {
    // sobe de trás de uma moita de folhas desenhada (ponto marcado = meio da moita)
    const sobe = interpolate(kk, [0, 0.28, 0.38, 0.48], [78, -6, 3, 0], clamp) + sai * 80;
    const mexe = Math.sin(kk * 14) * 5 * Math.exp(-kk / 0.4);
    const acena = Math.sin(kk * 7) * 6;
    const alt = larg;
    return (
      <svg viewBox="0 0 140 140" width={larg} height={alt} style={{ position: "absolute", left: ax - larg / 2, top: ay - alt * 0.72, overflow: "visible", filter: sombra, opacity: 1 - sai }}>
        {filtro}
        <g filter={`url(#f-${id})`}>
          <g clipPath={`url(#c-${id})`}>
            <g transform={`translate(0 ${sobe}) rotate(${acena} 70 60) ${m.espelha ? "translate(140 0) scale(-1 1)" : ""}`}>{desenha(corpo)}</g>
          </g>
          <g transform={`rotate(${mexe} 70 130)`}>
            <path d="M-6 140 C -8 108, 18 92, 34 104 C 36 82, 62 78, 70 96 C 78 76, 106 80, 108 102 C 124 90, 148 104, 146 140 Z" fill={hach(COR.verde)} stroke="#1E8A40" strokeWidth={3.2} strokeLinejoin="round" />
            <path d="M20 128 L 30 110 M52 124 L 58 100 M88 124 L 86 100 M118 128 L 112 110" stroke="#1E8A40" strokeWidth={2.4} strokeLinecap="round" />
          </g>
        </g>
      </svg>
    );
  }
  if (m.tipo === "pendurado") {
    // pendurado pelo rabo no galho (ponto marcado = galho), desce com mola e balança
    const desce = interpolate(kk, [0, 0.3, 0.42, 0.52], [-larg * 0.9, larg * 0.06, -larg * 0.02, 0], clamp);
    const balanca = Math.sin(kk * 4.2) * 9;
    const alt = larg * (200 / 140);
    return (
      <svg viewBox="0 0 140 200" width={larg} height={alt} style={{ position: "absolute", left: ax - larg / 2, top: ay, overflow: "visible", filter: sombra, opacity: 1 - sai,
        transform: `translateY(${desce}px) rotate(${balanca}deg)`, transformOrigin: "50% 0%" }}>
        {filtro}
        <g filter={`url(#f-${id})`}>
          <path d="M70 2 C 56 2, 54 16, 68 18 C 82 20, 84 36, 72 46 C 64 54, 68 64, 70 70" fill="none" stroke={MARROM_E} strokeWidth={5} strokeLinecap="round" />
          <g transform="translate(0 56) rotate(180 70 70)">{desenha(corpo.slice(1))}</g>
        </g>
      </svg>
    );
  }
  // sentado no corrimão (ponto marcado = onde ele senta)
  const pula = interpolate(kk, [0, 0.25, 0.36, 0.46], [larg * 0.5, -larg * 0.08, larg * 0.02, 0], clamp);
  const alt = larg;
  return (
    <svg viewBox="0 0 140 140" width={larg} height={alt} style={{ position: "absolute", left: ax - larg / 2, top: ay - alt * 0.9, overflow: "visible", filter: sombra, opacity: 1 - sai * 1,
      transform: `translateY(${pula + sai * 40}px) rotate(${Math.sin(kk * 2.5) * 3}deg)`, transformOrigin: "50% 100%" }}>
      {filtro}
      <g filter={`url(#f-${id})`}>{desenha(corpo)}</g>
    </svg>
  );
};

// ---------- linhas de velocidade a lápis atrás dela ----------
const C = (corpo as { caixas: (number[] | null)[] }).caixas;
function caixa(i: number) {
  // média de ±3 quadros
  let n = 0; const a = [0, 0, 0, 0];
  for (let j = i - 3; j <= i + 3; j++) { const c = C[j]; if (!c) continue; c.forEach((v, q) => (a[q] += v)); n++; }
  return n ? a.map((v) => v / n) : null;
}

// largCorpo: quando o recorte pega coisa junto atrás dela (o pneu do balanço), as costas saem da frente do corpo
// menos essa largura, em vez da borda de trás do recorte
export type Corrida = { de: number; ate: number; dir?: "esq" | "dir" | "auto" | "ambos"; forca?: number; largCorpo?: number };

const GRAFITE = "#1F1F2A";

// borda da silhueta por altura (borda.py), média de ±2 quadros
const BORDAS = (corpo as { bordas?: Record<string, number[][]> }).bordas ?? {};
function bordas(fr: number) {
  const base = BORDAS[String(fr)];
  if (!base) return null;
  return base.map((l, i) => {
    let n = 0, y = 0, a = 0, b = 0;
    for (let j = fr - 2; j <= fr + 2; j++) {
      const o = BORDAS[String(j)]?.[i];
      if (!o) continue;
      y += o[0]; a += o[1]; b += o[2]; n++;
    }
    return [y / n, a / n, b / n];
  });
}

// um lado das linhas de velocidade: feixes de 3 riscos finos de grafite que nascem colados nas costas dela
function lado(id: string, dir: number, ls: number[][], seed: number, forca: number, inclina: number, largCorpo?: number) {
  const tracos: { d: string; w: number; op: number }[] = [];
  const uso = ls.slice(1, 7); // da altura do ombro até a canela
  uso.forEach(([yy0, xmin, xmax], i) => {
    const costas = largCorpo
      ? (dir > 0 ? xmax - largCorpo : xmin + largCorpo)
      : (dir > 0 ? xmin + 18 : xmax - 18); // um tico por dentro: o corpo dela cobre o começo
    const L = (200 + random(`${id}c${i}`) * 230) * forca * (0.85 + random(`${id}v${i}${seed}`) * 0.3);
    const queda = inclina * L * (i < uso.length / 2 ? -0.14 : 0.14);
    [[-8, 1, 4.5], [0, 0.78, 6.5], [8, 0.55, 4.2]].forEach(([dy, k, w], j) => {
      const yy = yy0 + dy + (random(`${id}y${i}${j}${seed}`) - 0.5) * 5;
      const xb = costas - dir * L * k, yb = yy + queda * k + (random(`${id}j${i}${j}${seed}`) - 0.5) * 6;
      const meio = (random(`${id}m${i}${j}${seed}`) - 0.5) * 10;
      tracos.push({ d: `M${costas.toFixed(0)} ${yy.toFixed(0)} Q ${((costas + xb) / 2).toFixed(0)} ${((yy + yb) / 2 + meio).toFixed(0)}, ${xb.toFixed(0)} ${yb.toFixed(0)}`, w, op: 0.88 });
    });
    // risquinho solto de lápis (vai e volta) em algumas linhas
    if (i % 2 === 1) {
      const xm = costas - dir * L * (0.62 + random(`${id}r${i}`) * 0.25);
      tracos.push({ d: `M${xm.toFixed(0)} ${yy0 - 18} l ${-dir * 26} 9 l ${dir * 20} 9 l ${-dir * 26} 9`, w: 2.6, op: 0.75 });
    }
  });
  // nuvenzinhas de poeira saindo do pé, ficando pra trás
  const [pe, pxmin, pxmax] = ls[ls.length - 1];
  const pePos = largCorpo ? (dir > 0 ? pxmax - largCorpo * 0.6 : pxmin + largCorpo * 0.6) : (dir > 0 ? pxmin : pxmax) + 10 * dir;
  const poeira = [0, 1, 2].map((i) => {
    const t = (seed / 4 + i / 3) % 1;
    const px = pePos - dir * (30 + t * 240 + i * 15), r = 30 + t * 44;
    return { px, r, a: Math.min(1, (1 - t) * 1.6) };
  });
  return { tracos, poeira, pe: pe + 60 };
}

export const Velocidade: React.FC<{ c: Corrida; id: string }> = ({ c, id }) => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  if (s < c.de || s > c.ate) return null;
  const b = caixa(fr);
  if (!b) return null;
  const antes = caixa(fr - 4) ?? b;
  const vx = (b[0] + b[2]) / 2 - (antes[0] + antes[2]) / 2;
  const dirs = c.dir === "ambos" ? [1, -1] : [c.dir === "esq" ? -1 : c.dir === "dir" ? 1 : vx >= 0 ? 1 : -1];
  const alfa = interpolate(s, [c.de, c.de + 0.15, c.ate - 0.15, c.ate], [0, 1, 1, 0], clamp);
  const seed = Math.floor(fr / 2); // lápis "vibra" mais rápido que os rabiscos
  const ls = bordas(fr);
  if (!ls || ls.length < 4) return null;
  // as linhas "esticam" quando a corrida começa
  const estica = interpolate(s, [c.de, c.de + 0.25], [0.25, 1], clamp);
  const lados = dirs.map((d) => lado(`${id}${d}`, d, ls, seed, (c.forca ?? 1) * estica, c.dir === "ambos" ? 0.6 : 0, c.largCorpo));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: alfa, overflow: "visible",
      filter: "drop-shadow(0 0 3px rgba(255,255,255,0.95)) drop-shadow(0 0 1px rgba(255,255,255,1))" }}>
      <defs>
        <filter id={`l-${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={seed % 97} result="w" />
          <feDisplacementMap in="SourceGraphic" in2="w" scale={6} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={(seed + 3) % 97} result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.8 0 0 0 1.75" result="ga" />
          <feComposite in="d" in2="ga" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#l-${id})`}>
        {lados.map((l, li) => (
          <g key={li}>
            {/* borda branca por baixo de cada risco: o lápis "salta" da foto */}
            {l.tracos.map((t, i) => <path key={`b${i}`} d={t.d} fill="none" stroke="#FFFFFF" strokeWidth={t.w + 6} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />)}
            {l.tracos.map((t, i) => <path key={i} d={t.d} fill="none" stroke={GRAFITE} strokeWidth={t.w} strokeLinecap="round" strokeLinejoin="round" opacity={t.op} />)}
            {l.poeira.map((p, i) => (
              <path key={`p${i}`} opacity={p.a}
                d={`M${p.px - p.r} ${l.pe} C ${p.px - p.r * 1.1} ${l.pe - p.r * 0.9}, ${p.px - p.r * 0.3} ${l.pe - p.r * 1.3}, ${p.px} ${l.pe - p.r * 0.85} C ${p.px + p.r * 0.35} ${l.pe - p.r * 1.45}, ${p.px + p.r * 1.15} ${l.pe - p.r}, ${p.px + p.r} ${l.pe} Z`}
                fill="#FFFFFF" stroke={GRAFITE} strokeWidth={4.5} strokeLinejoin="round" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
};
