import { Easing } from "remotion";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadPatrick } from "@remotion/google-fonts/PatrickHand";

// Pingo de Gente · moda infantil (2026-11-04). Cores tiradas do logo da sacola e da estampa "Black day":
// letras coloridas (azul, vermelho, amarelo, verde, rosa), coração vermelho, amarelo-sol e azul-marinho no contorno.
// Estética pedida pela Talyta: "infantil e divertida" (3 referências do Pinterest: rabiscos de giz de cera
// animados em volta da criança, sol com carinha, estrelas, flores, risquinhos de movimento).
export const COR = {
  azul: "#1F6FE0",
  vermelho: "#EE3B45",
  amarelo: "#FFC21A",
  verde: "#2DBE5A",
  rosa: "#FF5FA8",
  laranja: "#FF8A1F",
  roxo: "#8B5CF6",
  ceu: "#5EC8F2",
  marinho: "#152E6B",
  branco: "#FFFFFF",
};
// ordem das letras coloridas, como no "Pingo de Gente" do logo
export const ARCO = [COR.azul, COR.vermelho, COR.amarelo, COR.verde, COR.rosa, COR.laranja, COR.roxo];

export const FREDOKA = loadFredoka("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;
export const MAO = loadPatrick("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

export const FPS = 24;
export const F = (s: number) => Math.round(s * FPS);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
// "boil" de desenho feito à mão: o traço muda a cada 3 quadros (8 por segundo)
export const BOIL = 3;

// zonas seguras do reels (clientes/_regras.md, 2026-10-12)
export const ZONA = { x0: 60, x1: 920, y0: 250, y1: 1500 };
