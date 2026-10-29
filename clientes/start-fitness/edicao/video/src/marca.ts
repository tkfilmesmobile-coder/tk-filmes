import { Easing } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadKaushan } from "@remotion/google-fonts/KaushanScript";

// Marca da Start Fitness tirada do material que ela já usa (logo SF na camiseta, letreiro da academia,
// sacola do kit): preto, vermelho e branco/prata. v2 (2026-10-28, pedido da Talyta: "força, adrenalina"):
// Anton (condensada, enche a largura) inclinada como o logo, com extrusão 3D vermelho-escura.
export const COR = {
  preto: "#0B0B0C",
  vermelho: "#E3141B",
  vermelhoEscuro: "#7A0A0E",
  branco: "#FFFFFF",
  ouro1: "#FFF3B0",
  ouro2: "#F7C844",
  ouro3: "#B87A0A",
};

export const ANTON = loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const BARLOW = loadBarlow("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;
loadBarlow("italic", { weights: ["700"], subsets: ["latin"] });
// os dois momentos do prêmio seguem as referências da Talyta (2026-10-28): contador de roleta (tutorial no Cosmos)
// e "R$ 4.000" vermelho com brilho + palavra manuscrita branca (print do "$30,000 Business")
export const MONTSERRAT = loadMontserrat("normal", { weights: ["800", "900"], subsets: ["latin"] }).fontFamily;
export const MANUSCRITA = loadKaushan("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

export const FPS = 24;
export const F = (s: number) => Math.round(s * FPS);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
export const REVELA = Easing.bezier(0.16, 1, 0.3, 1);

// zonas seguras do reels (clientes/_regras.md, 2026-10-12)
export const ZONA = { x0: 60, x1: 920, y0: 250, y1: 1500 };
export const INCLINA = -8; // graus, como o logo

// largura aproximada de cada letra da Anton (em "em"), pra encher a largura sem estourar a zona segura
const LARG: Record<string, number> = {
  I: 0.25, J: 0.33, M: 0.66, W: 0.72, E: 0.42, F: 0.4, L: 0.4, T: 0.44, Z: 0.42, S: 0.47, "1": 0.34, " ": 0.2,
  "!": 0.25, "?": 0.45, ".": 0.22, ",": 0.22, "º": 0.3, "ª": 0.3, "$": 0.48, ":": 0.22, "·": 0.22, "/": 0.35,
};
const tira = (c: string) => c.normalize("NFD").replace(/[̀-ͯ]/g, "");
export const largAnton = (t: string) => [...t.toUpperCase()].reduce((a, c) => a + (LARG[c] ?? LARG[tira(c)] ?? 0.5), 0);
export const cabe = (t: string, largura: number, max: number) => Math.min(max, largura / (largAnton(t) * 1.02 + 0.12));

// extrusão 3D (camadas de sombra dura na diagonal) + sombra suave embaixo
export function extrusao(tam: number, de = "#B3121A", ate = "#2A0306", camadas = 10) {
  const passo = Math.max(1, tam / 110);
  const mix = (a: string, b: string, k: number) => {
    const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [A, B] = [p(a), p(b)];
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",")})`;
  };
  const s = Array.from({ length: camadas }, (_, i) => `${((i + 1) * passo).toFixed(1)}px ${((i + 1) * passo).toFixed(1)}px 0 ${mix(de, ate, i / (camadas - 1))}`);
  s.push(`0 ${(tam * 0.14).toFixed(0)}px ${(tam * 0.28).toFixed(0)}px rgba(0,0,0,0.6)`);
  return s.join(", ");
}

// separação de cor (RGB) na entrada do texto, some em ~5 quadros
export const aberracao = (a: number) => (a > 0.3 ? `${-a}px 0 0 rgba(0,240,255,0.75), ${a}px 0 0 rgba(255,0,70,0.75), ` : "");
