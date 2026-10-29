import { loadFont as loadBodoni } from "@remotion/google-fonts/BodoniModa";
import { loadFont as loadGilda } from "@remotion/google-fonts/GildaDisplay";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { Easing, getInputProps } from "remotion";

// Marca da Ary (marca/design-guide.md): preto, bege e dourado champagne, sem rosa.
// Títulos em Bodoni Moda 400; número sempre na Gilda Display; texto e etiquetas em Poppins.
export const BODONI = loadBodoni("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const BODONI_IT = loadBodoni("italic", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const GILDA = loadGilda("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const POPPINS = loadPoppins("normal", { weights: ["300", "400", "500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;

export const COR = {
  preto: "#141210",
  cafe: "#5A3E2B",
  cafeEscuro: "#2B1E15",
  bege: "#EDE6DC",
  begeMedio: "#D8C9B5",
  dourado: "#CBA14F",
  douradoEscuro: "#A9803F",
  champanhe: "#EAD9B8",
  brancoQuente: "#FAF7F2",
  caramelo: "#C9A475",
  terracota: "#A4553F",
};
// título sobre fundo claro: degradê café → caramelo
export const DEGRADE_CAFE = `linear-gradient(100deg, ${COR.cafe} 0%, #8E6440 55%, ${COR.caramelo} 100%)`;

// Tratamento dos textos e animações por cima do vídeo (escolha da Talyta entre 3 opções, 2026-10-24).
// Padrão dos posts aprovados: título Bodoni creme, linha em Poppins com palavra-chave em negrito, assinatura entre fios.
//  A: creme com sombra quase imperceptível · B: café → caramelo direto no vídeo claro, sem sombra ·
//  C: creme com um sombreado bem suave só atrás do bloco de texto.
const ESTILO = ((getInputProps() as { estilo?: string }).estilo ?? "C") as "A" | "B" | "C"; // escolhida: C (2026-10-24)
const CREME = "#F6EFE4";
export const TEMA = {
  A: { estilo: "A", titulo: CREME, texto: CREME, acento: COR.dourado, grad: null as string | null, sombraTxt: "0 1px 18px rgba(25,15,8,0.30)", filtro: "drop-shadow(0 1px 10px rgba(25,15,8,0.22))", veu: false },
  B: { estilo: "B", titulo: COR.cafe, texto: COR.cafeEscuro, acento: COR.douradoEscuro, grad: DEGRADE_CAFE as string | null, sombraTxt: "none", filtro: "none", veu: false },
  C: { estilo: "C", titulo: CREME, texto: CREME, acento: COR.dourado, grad: null as string | null, sombraTxt: "none", filtro: "none", veu: true },
}[ESTILO];
// estilo do título conforme o tema (degradê café no B, cor sólida no A e no C)
export const corTitulo = (): React.CSSProperties =>
  TEMA.grad ? { backgroundImage: TEMA.grad, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" } : { color: TEMA.titulo };

// título longo diminui pra não sobrar palavra sozinha na segunda linha
export const tamTitulo = (t: string, base: number, limite = 16) => (t.length <= limite ? base : Math.max(Math.round(base * 0.72), Math.round((base * limite) / t.length)));

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
export const REVELA = Easing.bezier(0.16, 1, 0.3, 1);
export const F = (s: number) => Math.round(s * 30);

// zonas seguras do reels (clientes/_regras.md): área útil x 60–920, y 250–1500
export const ZONA = { x0: 60, x1: 920, y0: 250, y1: 1500 };

// Estética aprovada nos posts (2026-10): foto quente, só a BASE escurece em café/preto, título claro.
// Nada de fundo branco/bege nem clareado claro (recusado pela Talyta em 2026-10-24).
export const VIDRO: React.CSSProperties = {
  background: "rgba(24, 18, 14, 0.74)",
  backdropFilter: "blur(16px)",
  border: `1px solid rgba(203, 161, 79, 0.45)`,
  borderRadius: 28,
  boxShadow: "0 18px 50px rgba(0, 0, 0, 0.35)",
};
// base escura dos posts: transparente até a metade, café quase preto embaixo
export const BASE_ESCURA = "linear-gradient(to bottom, rgba(20,15,11,0) 48%, rgba(20,15,11,0.55) 64%, rgba(20,15,11,0.85) 82%, rgba(20,15,11,0.92) 100%)";
// tratamento de cor do vídeo: quente e editorial (a parede branca vira bege quente, realce segurado)
export const COR_VIDEO = "sepia(0.16) saturate(0.98) contrast(1.07) brightness(0.93)";
