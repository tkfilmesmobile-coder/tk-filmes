// Post de imagem única (1080x1350) que acompanha cada reel da TK (2026-11-04).
// Estética dos REELS, não a do carrossel do Bastidor: foto da Talyta em tela cheia com a grade H (caramelo + contraste +
// sombras frias), vinheta e grão; título em Nunito 900 caixa alta; a palavra-chave numa etiqueta caramelo com texto escuro;
// rótulo em caps com fio caramelo; cartão de vidro com ✓/✕ (o exemplo na prática); assinatura @tk.filmes com o K.
// Conteúdo de cada post: src/posts-reels.json · fotos: public/posts-reels/
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadRound } from "@remotion/google-fonts/Nunito";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const redonda = loadRound("normal", { weights: ["800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
const mont = loadMont("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;
const inter = loadInter("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;

const CREME = "#FBF4EC", CARAMELO = "#E3B48C", ESCURO = "#2B1A14";
const CAPS: React.CSSProperties = { fontFamily: mont, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".22em" };
const VIDRO: React.CSSProperties = { background: "rgba(43,26,20,.48)", border: "1px solid rgba(251,244,236,.3)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: "0 24px 60px rgba(20,12,8,.35)" };
const SOMBRA = "0 6px 30px rgba(20,12,8,.6), 0 2px 8px rgba(20,12,8,.45)";

type Pos = { x: number; y: number };
export type PostReelProps = {
  foto: string; foco?: number; zoom?: number;
  escurece?: "topo" | "base" | "ambos";
  rotulo?: Pos & { texto: string };
  titulo: Pos & { linhas: string[]; tam: number; alinha?: "left" | "center" };
  etiqueta?: Pos & { texto: string; tam: number };
  sub?: Pos & { texto: string; largura?: number; caps?: boolean };
  cartao?: Pos & { etiqueta?: string; linhas: { texto: string; tom: "pos" | "neg" }[] };
  assinatura?: { lado: "esquerda" | "direita"; y?: number };
};

export const PostReel: React.FC<PostReelProps> = (p) => {
  const g = p.escurece ?? "base";
  return (
    <AbsoluteFill style={{ background: "#1c130f" }}>
      {/* foto com a grade H dos reels */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img src={staticFile(`posts-reels/${p.foto}`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${p.foco ?? 30}%`, scale: p.zoom ?? 1, filter: "brightness(1.03) contrast(1.07) saturate(0.95)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#1E3238", mixBlendMode: "lighten", opacity: 0.55 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #CD9365 0%, #B97F55 100%)", mixBlendMode: "soft-light", opacity: 0.32 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(40,26,20,.34) 100%)" }} />
      {/* luz caindo onde mora o texto */}
      {g !== "topo" ? <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(28,19,15,.72) 0%, rgba(28,19,15,.38) 28%, rgba(28,19,15,0) 50%)" }} /> : null}
      {g !== "base" ? <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(28,19,15,.62) 0%, rgba(28,19,15,.25) 22%, rgba(28,19,15,0) 40%)" }} /> : null}
      <AbsoluteFill style={{ opacity: 0.1, mixBlendMode: "overlay", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />

      {p.rotulo ? (
        <div style={{ position: "absolute", left: p.rotulo.x, top: p.rotulo.y }}>
          <div style={{ width: 64, height: 2, background: CARAMELO, marginBottom: 16 }} />
          <div style={{ ...CAPS, fontSize: 26, color: CREME, textShadow: SOMBRA }}>{p.rotulo.texto}</div>
        </div>
      ) : null}

      <div style={{ position: "absolute", left: p.titulo.x, top: p.titulo.y, right: p.titulo.alinha === "center" ? p.titulo.x : undefined, textAlign: p.titulo.alinha ?? "left" }}>
        {p.titulo.linhas.map((l, i) => (
          <div key={i} style={{ fontFamily: redonda, fontWeight: 900, fontSize: p.titulo.tam, lineHeight: 0.98, letterSpacing: "-0.02em", textTransform: "uppercase", color: CREME, textShadow: SOMBRA, whiteSpace: "nowrap" }}>{l}</div>
        ))}
      </div>

      {p.etiqueta ? (
        <div style={{ position: "absolute", left: p.etiqueta.x, top: p.etiqueta.y, transform: "rotate(-3deg)", transformOrigin: "left center" }}>
          <span style={{ display: "inline-block", fontFamily: redonda, fontWeight: 900, fontSize: p.etiqueta.tam, lineHeight: 1.08, letterSpacing: "-0.02em", textTransform: "uppercase", color: ESCURO, background: CARAMELO, padding: "6px 34px 2px", borderRadius: 28, boxShadow: "0 18px 44px rgba(20,12,8,.45), 0 0 60px rgba(227,180,140,.35)", whiteSpace: "nowrap" }}>{p.etiqueta.texto}</span>
        </div>
      ) : null}

      {p.sub ? (
        <div style={{ position: "absolute", left: p.sub.x, top: p.sub.y, width: p.sub.largura ?? 620, ...(p.sub.caps ? { ...CAPS, fontSize: 24, lineHeight: 1.6, letterSpacing: ".16em" } : { fontFamily: redonda, fontWeight: 800, fontSize: 40, lineHeight: 1.2 }), color: CREME, textShadow: SOMBRA }}>{p.sub.texto}</div>
      ) : null}

      {p.cartao ? (
        <div style={{ position: "absolute", left: p.cartao.x, top: p.cartao.y, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          {p.cartao.etiqueta ? <div style={{ ...VIDRO, borderRadius: 999, padding: "10px 22px", ...CAPS, fontSize: 18, color: CARAMELO }}>{p.cartao.etiqueta}</div> : null}
          {p.cartao.linhas.map((l, i) => (
            <div key={i} style={{ ...VIDRO, borderRadius: 999, padding: "14px 28px 14px 22px", display: "inline-flex", alignItems: "center", gap: 16, borderColor: l.tom === "neg" ? "rgba(227,180,140,.85)" : "rgba(251,244,236,.3)" }}>
              <span style={{ fontFamily: inter, fontWeight: 800, fontSize: 32, color: CARAMELO, lineHeight: 1 }}>{l.tom === "neg" ? "✕" : "✓"}</span>
              <span style={{ ...CAPS, fontSize: 32, letterSpacing: ".16em", color: l.tom === "neg" ? CARAMELO : CREME, textDecoration: l.tom === "neg" ? "line-through" : "none", textDecorationThickness: 3 }}>{l.texto}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* assinatura */}
      <div style={{ position: "absolute", top: p.assinatura?.y ?? 1262, ...(p.assinatura?.lado === "esquerda" ? { left: 70 } : { right: 70 }), display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("marca/icone-k-fundo-marrom.svg")} style={{ width: 46, height: 46, borderRadius: 23, boxShadow: "0 0 0 2px rgba(251,244,236,.35)" }} />
        <span style={{ fontFamily: inter, fontWeight: 700, fontSize: 24, color: CREME, textShadow: SOMBRA }}>@tk.filmes</span>
      </div>
    </AbsoluteFill>
  );
};
