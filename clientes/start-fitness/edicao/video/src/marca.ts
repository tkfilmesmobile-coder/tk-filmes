import { Easing } from "remotion";
import { loadFont as loadKanit } from "@remotion/google-fonts/Kanit";
import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowCondensed";

// Marca da Start Fitness tirada do material que ela já usa (logo SF na camiseta, letreiro da academia,
// sacola do kit): preto, vermelho e branco/prata, letra pesada e inclinada. Ainda sem brand book.
export const COR = {
  preto: "#0B0B0C",
  vermelho: "#E3141B",
  vermelhoEscuro: "#A50D12",
  branco: "#FFFFFF",
  prata: "#D9DADC",
  ouro: "#F5C542",
  verde: "#2FA35A",
};

export const KANIT = loadKanit("italic", { weights: ["800", "900"], subsets: ["latin"] }).fontFamily;
export const BARLOW = loadBarlow("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;

export const FPS = 24;
export const F = (s: number) => Math.round(s * FPS);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
export const REVELA = Easing.bezier(0.16, 1, 0.3, 1);
// entra com um pequeno passo além do ponto e volta (pegada de esporte)
export const ESTALO = (x: number) => 1 - Math.pow(1 - x, 3) * Math.cos(x * 2.6);

// zonas seguras do reels (clientes/_regras.md, 2026-10-12)
export const ZONA = { x0: 60, x1: 920, y0: 250, y1: 1500 };

// sombra que separa o texto do vídeo (suave, sem contorno)
export const SOMBRA = "0 6px 22px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.35)";
