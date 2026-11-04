import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { BOIL, COR, FPS, MAO, clamp } from "./marca";
import rosto from "./rosto.json";

// Rabiscos de giz de cera (referências da Talyta, 2026-11-04): o traço se desenha, entra com pulinho,
// fica "fervendo" como desenho à mão (muda a cada 3 quadros) e balança de leve. Nunca encosta no rosto:
// se o rosto chega perto, o rabisco é empurrado pro lado (e some se não couber).

export type Tipo =
  | "sol" | "estrela" | "coracao" | "flor" | "nuvem" | "brilho" | "risquinhos" | "laco" | "coroa" | "balao"
  | "interrogacao" | "exclamacao" | "relogio" | "celular" | "seta" | "circulo" | "abelha" | "calendario" | "ponto" | "onda"
  | "flecha";

export type Rab = {
  tipo: Tipo; x: number; y: number; tam: number; em: number; ate: number;
  cor?: string; cor2?: string; rot?: number; espelha?: boolean; w?: number; h?: number;
  // deslocamento ao longo da vida (px), pra coisas que sobem (balão, coração) ou voam (abelha)
  voa?: [number, number];
  // false = não desvia do rosto (ex.: círculo em volta da sacola, num plano sem rosto)
  desvia?: boolean;
};

const R = rosto as { x0: number[]; y0: number[]; x1: number[]; y1: number[] };
function caixaRosto(fr: number) {
  // média de ±4 quadros pra o empurrão não tremer
  let x0 = 0, y0 = 0, x1 = 0, y1 = 0, n = 0;
  fr = Math.min(fr, R.x0.length - 5); // no quadro congelado do fim vale o rosto do último quadro
  for (let i = fr - 4; i <= fr + 4; i++) {
    if (i < 0 || i >= R.x0.length || R.x1[i] <= R.x0[i]) continue;
    x0 += R.x0[i]; y0 += R.y0[i]; x1 += R.x1[i]; y1 += R.y1[i]; n++;
  }
  return n ? { x0: x0 / n, y0: y0 / n, x1: x1 / n, y1: y1 / n } : null;
}

// ---------- desenhos (viewBox 0 0 100 100) ----------
const est = (cx: number, cy: number, R1: number, r1: number, n = 5) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rr = i % 2 ? r1 : R1;
    return `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ") + " Z";
const CORACAO = "M50 86 C 20 66, 6 44, 22 26 C 34 14, 47 21, 50 32 C 53 21, 66 14, 78 26 C 94 44, 80 66, 50 86 Z";

type Traço = { d: string; fill?: string; stroke?: string; sw?: number; hach?: boolean; texto?: never };
type Txt = { texto: string; x: number; y: number; fs: number; fill: string };
type Peça = Traço | Txt;

function desenho(tipo: Tipo, c1: string, c2: string): Peça[] {
  switch (tipo) {
    case "sol": {
      const raios = Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r0 = 31, r1 = i % 2 ? 42 : 47;
        return `M${(50 + r0 * Math.cos(a)).toFixed(1)} ${(50 + r0 * Math.sin(a)).toFixed(1)} L${(50 + r1 * Math.cos(a)).toFixed(1)} ${(50 + r1 * Math.sin(a)).toFixed(1)}`;
      }).join(" ");
      return [
        { d: "M50 26 A24 24 0 1 1 49.9 26 Z", fill: c1, stroke: c2, sw: 4.5, hach: true },
        { d: raios, stroke: c2, sw: 5 },
        { d: "M40 44 l0.1 5 M60 44 l0.1 5", stroke: COR.marinho, sw: 5 },
        { d: "M38 56 Q50 68 62 56", stroke: COR.marinho, sw: 4 },
        { d: "M33 57 l0.1 0.1 M67 57 l0.1 0.1", stroke: COR.rosa, sw: 7 },
      ];
    }
    case "estrela": return [{ d: est(50, 53, 44, 19), fill: c1, stroke: c2, sw: 4.5, hach: true }];
    case "coracao": return [{ d: CORACAO, fill: c1, stroke: c2, sw: 4.5, hach: true }];
    case "balao": return [
      { d: "M50 74 Q 42 84, 52 92 Q 60 98, 50 106", stroke: COR.marinho, sw: 2.5 },
      { d: "M50 70 C 24 54, 14 36, 27 22 C 37 12, 48 18, 50 27 C 52 18, 63 12, 73 22 C 86 36, 76 54, 50 70 Z", fill: c1, stroke: c2, sw: 4, hach: true },
      { d: "M33 30 Q 35 24, 41 23", stroke: COR.branco, sw: 4 },
    ];
    case "flor": {
      const pet = Array.from({ length: 5 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        const cx = 50 + 17 * Math.cos(a), cy = 38 + 17 * Math.sin(a);
        return { d: `M${cx + 12} ${cy} A12 12 0 1 1 ${cx + 11.9} ${cy - 0.1} Z`, fill: c1, stroke: c2, sw: 3.5, hach: true } as Traço;
      });
      return [
        { d: "M50 52 Q 45 74, 50 98", stroke: COR.verde, sw: 4.5 },
        { d: "M48 78 Q 30 66, 26 76 Q 34 86, 48 80", fill: COR.verde, stroke: "#1E8A40", sw: 3, hach: true },
        ...pet,
        { d: "M59 38 A9 9 0 1 1 58.9 37.9 Z", fill: COR.amarelo, stroke: COR.laranja, sw: 3.5, hach: true },
      ];
    }
    case "nuvem": return [{ d: "M22 70 Q6 70 8 55 Q10 42 25 44 Q27 26 45 28 Q58 14 71 30 Q89 28 89 46 Q97 52 91 64 Q87 71 76 70 Z", fill: COR.branco, stroke: c2, sw: 4, hach: true }];
    case "brilho": return [{ d: "M50 4 Q54 44 96 50 Q54 56 50 96 Q46 56 4 50 Q46 44 50 4 Z", fill: c1, stroke: c2, sw: 3.5, hach: true }];
    case "risquinhos": return [{ d: "M20 30 L36 42 M16 52 L36 52 M20 74 L36 62 M44 20 L50 36 M44 84 L50 68", stroke: c1, sw: 6 }];
    case "laco": return [{ d: "M4 62 C 22 30, 46 26, 44 52 C 42 76, 18 66, 32 46 C 50 22, 74 40, 96 28", stroke: c1, sw: 5 }];
    case "onda": return [{ d: "M2 50 Q 14 30, 26 50 T 50 50 T 74 50 T 98 50", stroke: c1, sw: 6 }];
    case "coroa": return [
      { d: "M14 76 L18 34 L35 54 L50 22 L65 54 L82 34 L86 76 Z", fill: c1, stroke: c2, sw: 4.5, hach: true },
      { d: "M18 34 l0.1 0 M50 22 l0.1 0 M82 34 l0.1 0", stroke: COR.vermelho, sw: 9 },
    ];
    case "interrogacao": return [
      { d: "M30 34 Q30 10 52 10 Q74 10 74 32 Q74 48 56 54 Q50 57 50 68", stroke: c1, sw: 11 },
      { d: "M50 86 l0.1 0.1", stroke: c1, sw: 13 },
    ];
    case "exclamacao": return [
      { d: "M50 10 L50 64", stroke: c1, sw: 12 },
      { d: "M50 86 l0.1 0.1", stroke: c1, sw: 14 },
    ];
    case "relogio": {
      const marcas = Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return `M${(50 + 31 * Math.sin(a)).toFixed(1)} ${(50 - 31 * Math.cos(a)).toFixed(1)} L${(50 + 36 * Math.sin(a)).toFixed(1)} ${(50 - 36 * Math.cos(a)).toFixed(1)}`;
      }).join(" ");
      // 19h = ponteiro pequeno no 7, grande no 12
      const a7 = (7 / 12) * Math.PI * 2;
      return [
        { d: "M50 8 A42 42 0 1 1 49.9 8 Z", fill: COR.branco, stroke: c2, sw: 5, hach: true },
        { d: "M22 14 L12 4 M78 14 L88 4", stroke: c2, sw: 5 },
        { d: marcas, stroke: c2, sw: 3 },
        { d: `M50 50 L${(50 + 20 * Math.sin(a7)).toFixed(1)} ${(50 - 20 * Math.cos(a7)).toFixed(1)}`, stroke: c1, sw: 6 },
        { d: "M50 50 L50 20", stroke: COR.marinho, sw: 4.5 },
        { d: "M50 50 l0.1 0.1", stroke: COR.marinho, sw: 8 },
      ];
    }
    case "calendario": return [
      { d: "M12 22 L88 22 L88 90 L12 90 Z", fill: COR.branco, stroke: c2, sw: 4.5, hach: true },
      { d: "M12 22 L88 22 L88 40 L12 40 Z", fill: c1, stroke: c2, sw: 4.5, hach: true },
      { d: "M30 12 L30 30 M70 12 L70 30", stroke: COR.marinho, sw: 5 },
      { texto: "SÁB", x: 50, y: 76, fs: 30, fill: COR.marinho },
    ];
    case "celular": return [
      { d: "M28 6 Q22 6 22 12 L22 88 Q22 94 28 94 L72 94 Q78 94 78 88 L78 12 Q78 6 72 6 Z", fill: COR.marinho, stroke: c2, sw: 4 },
      { d: "M28 16 L72 16 L72 80 L28 80 Z", fill: COR.ceu, stroke: COR.branco, sw: 2.5, hach: true },
      { d: "M50 64 C 38 56, 34 48, 40 42 C 44 38, 49 40, 50 45 C 51 40, 56 38, 60 42 C 66 48, 62 56, 50 64 Z", fill: COR.vermelho, stroke: COR.branco, sw: 2.5 },
      { d: "M44 87 L56 87", stroke: COR.branco, sw: 3 },
    ];
    case "seta": return [
      { d: "M8 84 Q 34 20, 84 30", stroke: c1, sw: 6 },
      { d: "M66 16 L86 30 L68 46", stroke: c1, sw: 6 },
    ];
    case "circulo": return [{ d: "M50 6 C 92 6, 98 58, 62 90 C 22 102, -2 62, 12 30 C 24 8, 62 2, 86 22", stroke: c1, sw: 3.2 }];
    // seta reta desenhada à mão, apontando pra direita (gira com rot)
    case "flecha": return [
      { d: "M4 52 Q 30 44, 58 50 Q 72 53, 84 50", stroke: c2, sw: 13 },
      { d: "M62 30 Q 76 42, 90 50 Q 76 58, 62 70", stroke: c2, sw: 13 },
      { d: "M4 52 Q 30 44, 58 50 Q 72 53, 84 50", stroke: c1, sw: 7.5 },
      { d: "M62 30 Q 76 42, 90 50 Q 76 58, 62 70", stroke: c1, sw: 7.5 },
    ];
    case "abelha": return [
      { d: "M4 70 Q 14 52, 22 66 Q 30 80, 38 62", stroke: COR.marinho, sw: 2.5 },
      { d: "M48 30 Q 40 6, 54 10 Q 62 16, 56 34 M62 32 Q 70 10, 80 18 Q 84 28, 66 36", fill: COR.branco, stroke: COR.ceu, sw: 3 },
      { d: "M40 54 C 40 36, 82 34, 84 52 C 86 70, 40 72, 40 54 Z", fill: COR.amarelo, stroke: COR.marinho, sw: 3.5, hach: true },
      { d: "M56 40 Q 52 54, 56 68 M68 40 Q 64 54, 68 68", stroke: COR.marinho, sw: 5 },
      { d: "M78 49 l0.1 0.1", stroke: COR.marinho, sw: 4.5 },
    ];
    case "ponto": return [{ d: "M50 30 A20 20 0 1 1 49.9 30 Z", fill: c1, stroke: c2, sw: 3, hach: true }];
  }
}

const PADRAO: Record<Tipo, [string, string]> = {
  sol: [COR.amarelo, COR.laranja], estrela: [COR.amarelo, COR.laranja], coracao: [COR.vermelho, "#B31B27"],
  balao: [COR.vermelho, "#B31B27"], flor: [COR.rosa, "#D63384"], nuvem: [COR.branco, COR.ceu],
  brilho: [COR.amarelo, COR.laranja], risquinhos: [COR.branco, COR.branco], laco: [COR.branco, COR.branco],
  onda: [COR.ceu, COR.ceu], coroa: [COR.amarelo, COR.laranja], interrogacao: [COR.azul, COR.azul],
  exclamacao: [COR.vermelho, COR.vermelho], relogio: [COR.vermelho, COR.azul], calendario: [COR.vermelho, COR.azul],
  celular: [COR.ceu, COR.branco], seta: [COR.branco, COR.branco], circulo: [COR.amarelo, COR.amarelo],
  abelha: [COR.amarelo, COR.marinho], ponto: [COR.rosa, COR.rosa], flecha: [COR.vermelho, COR.branco],
};

export const Rabisco: React.FC<{ r: Rab; id: string }> = ({ r, id }) => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  if (s < r.em - 0.01 || s > r.ate + 0.25) return null;
  const k = s - r.em;
  const vida = Math.max(0.01, r.ate - r.em);
  const [c1, c2] = [r.cor ?? PADRAO[r.tipo][0], r.cor2 ?? PADRAO[r.tipo][1]];
  const pecas = desenho(r.tipo, c1, c2);
  const traco = interpolate(k, [0, 0.38], [0, 1], clamp); // o giz desenhando
  const enche = interpolate(k, [0.18, 0.45], [0, 1], clamp);
  const pulo = interpolate(k, [0, 0.1, 0.2, 0.3], [0.35, 1.18, 0.94, 1], clamp);
  const sai = interpolate(s, [r.ate, r.ate + 0.22], [0, 1], clamp);
  const seed = Math.floor(fr / BOIL);
  const balanco = Math.sin(k * 2.4 + random(id) * 6) * 5 + (random(`${id}-${seed}`) - 0.5) * 2.4;
  const flutua = Math.sin(k * 1.8 + random(`${id}f`) * 6) * 7;
  const [vx, vy] = r.voa ?? [0, 0];
  const pv = Math.min(1, k / vida);
  let x = r.x + vx * pv, y = r.y + vy * pv + flutua;
  // 1,3x: no primeiro teste os rabiscos ficaram miúdos perto das referências
  const w = (r.w ?? r.tam) * 1.3, h = (r.h ?? r.tam) * 1.3;
  let alfa = 1 - sai;
  if (r.desvia !== false) {
    const c = caixaRosto(fr);
    if (c) {
      const fol = 18;
      const sobre = x + w / 2 > c.x0 - fol && x - w / 2 < c.x1 + fol && y + h / 2 > c.y0 - fol && y - h / 2 < c.y1 + fol;
      if (sobre) {
        const esq = c.x0 - fol - w / 2, dir = c.x1 + fol + w / 2;
        const nx = Math.abs(x - esq) < Math.abs(dir - x) ? esq : dir;
        if (nx - w / 2 < -w * 0.25 || nx + w / 2 > 1080 + w * 0.25) alfa *= 0; // não cabe: some
        else x = nx;
      }
    }
  }
  const escala = pulo * (1 - sai * 0.7);
  return (
    <svg
      viewBox="0 0 100 100" width={w} height={h} preserveAspectRatio="none"
      style={{
        position: "absolute", left: x - w / 2, top: y - h / 2, overflow: "visible", opacity: alfa,
        transform: `rotate(${(r.rot ?? 0) + balanco}deg) scale(${escala}) ${r.espelha ? "scaleX(-1)" : ""}`,
        filter: "drop-shadow(0 0 2.5px rgba(255,255,255,0.95)) drop-shadow(0 5px 6px rgba(20,30,70,0.28))",
      }}
    >
      <defs>
        <filter id={`g-${id}`} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={seed % 97} result="w" />
          <feDisplacementMap in="SourceGraphic" in2="w" scale={4.5} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves={1} seed={(seed + 11) % 97} result="gr" />
          <feColorMatrix in="gr" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.4 0 0 0 2.05" result="ga" />
          <feComposite in="d" in2="ga" operator="in" />
        </filter>
        {[c1, c2, COR.verde, COR.amarelo, COR.branco, COR.ceu, COR.vermelho].map((c, i) => (
          <pattern key={i} id={`h-${id}-${i}`} patternUnits="userSpaceOnUse" width={4.2} height={4.2} patternTransform={`rotate(${38 + (seed % 3) * 4})`}>
            <rect width={4.2} height={4.2} fill={c} opacity={0.62} />
            <line x1={1} y1={0} x2={1} y2={4.2} stroke={c} strokeWidth={2.6} />
          </pattern>
        ))}
      </defs>
      <g filter={`url(#g-${id})`}>
        {pecas.map((p, i) => {
          if ("texto" in p && p.texto) {
            return <text key={i} x={p.x} y={p.y} fontSize={p.fs} fontFamily={MAO} fill={p.fill} textAnchor="middle" opacity={enche}>{p.texto}</text>;
          }
          const t = p as Traço;
          const idx = [c1, c2, COR.verde, COR.amarelo, COR.branco, COR.ceu, COR.vermelho].indexOf(t.fill ?? "");
          const fill = t.fill ? (t.hach && idx >= 0 ? `url(#h-${id}-${idx})` : t.fill) : "none";
          return (
            <g key={i}>
              {t.fill ? <path d={t.d} fill={fill} opacity={enche} /> : null}
              {t.stroke ? (
                <path d={t.d} fill="none" stroke={t.stroke} strokeWidth={t.sw ?? 4} strokeLinecap="round" strokeLinejoin="round"
                  pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - traco} />
              ) : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
};
