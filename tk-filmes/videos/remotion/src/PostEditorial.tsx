// Post de imagem única · linha editorial escura (2026-11-04, refs. da Talyta: "pouco seguidor" e "VOCÊ").
// A anterior (PostReel, grade H + etiquetas caramelo) ela achou horrível.
// Camadas: foto escurecida e dessaturada (clima de cinema) → elemento translúcido atrás da cabeça (perfil do Instagram ou
// painel) → palavra GIGANTE em serifa atrás da cabeça → a Talyta recortada por cima (profundidade) → na frente: serifa fina
// grande, texto sans em dois tons (branco + cinza), etiquetas de vidro no topo, rótulos minúsculos nos cantos.
// Conteúdo: src/posts-editorial.json · fotos e recortes: public/posts-reels/
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadBodoni } from "@remotion/google-fonts/BodoniModa";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadSans } from "@remotion/google-fonts/InstrumentSans";

const bodoni = loadBodoni("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] }).fontFamily;
const playfair = loadPlayfair("normal", { weights: ["800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
const playfairIt = loadPlayfair("italic", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily;
const sans = loadSans("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
const sansIt = loadSans("italic", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily;

const CREME = "#F3E8DC", CINZA = "rgba(243,232,220,.55)", BRANCO = "#FFFFFF";
const FILTRO = "brightness(.74) contrast(1.14) saturate(.6) sepia(.16)";

type Trecho = { t: string; cor?: "branco" | "cinza"; forte?: boolean; italico?: boolean };
export type PostEditorialProps = {
  foto: string; recorte?: string; foco?: number;
  gigante?: { texto: string; y: number; tam: number; fonte?: "playfair" | "bodoni"; opacidade?: number };
  perfil?: { x: number; y: number; nome: string; numeros: [string, string][]; bio: string[]; link: string; foto?: string };
  // outras dela, desfocadas, ao redor e atrás (ref. "VOCÊ"): recortes de outras fotos da mesma sessão
  fundo?: { src: string; x: number; y: number; altura: number; desfoque: number; opacidade?: number; espelho?: boolean }[];
  painel?: { x: number; y: number; titulo: string; linhas: [string, string][] };
  pilulas?: { y: number; tam?: number; itens: { icone: string; texto: string }[] };
  serifa?: { x: number; y: number; linhas: string[]; tam: number };
  lado?: { x: number; y: number; largura: number; linhas: Trecho[][]; tam: number };
  texto?: { y: number; x?: number; linhas: Trecho[][]; tam: number; sub?: Trecho[][] };
  botao?: { y: number; texto?: string };
  cantos?: { esquerda: string[]; direita: string[]; centro: string };
  // força do escurecido (0-1): topo e base. Padrão 1 = o mais denso
  escuro?: { topo?: number; base?: number };
  // luz de contorno atrás dela (separa o cabelo do fundo, como na ref. "VOCÊ")
  luz?: { x: number; y: number; raio: number; forca: number };
};

const Linha: React.FC<{ l: Trecho[]; tam: number }> = ({ l, tam }) => (
  <div style={{ fontSize: tam, lineHeight: 1.16, whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,.55)" }}>
    {l.map((s, i) => (
      <span key={i} style={{ fontFamily: s.italico ? sansIt : sans, fontWeight: s.forte ? 700 : 500, fontStyle: s.italico ? "italic" : "normal", color: s.cor === "cinza" ? CINZA : BRANCO }}>{s.t}</span>
    ))}
  </div>
);

export const PostEditorial: React.FC<PostEditorialProps> = (p) => {
  const foto = { position: "absolute" as const, inset: 0, width: "100%", height: "100%", objectFit: "cover" as const, objectPosition: `50% ${p.foco ?? 33}%`, filter: FILTRO };
  const vidroUI: React.CSSProperties = { background: "rgba(30,24,22,.42)", border: "1px solid rgba(255,255,255,.14)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" };
  return (
    <AbsoluteFill style={{ background: "#0f0b0a" }}>
      <Img src={staticFile(`posts-reels/${p.foto}`)} style={foto} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 40%, rgba(0,0,0,0) 40%, rgba(10,7,6,.72) 100%)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, rgba(10,7,6,${0.55 * (p.escuro?.topo ?? 1)}) 0%, rgba(10,7,6,0) 22%, rgba(10,7,6,0) 48%, rgba(10,7,6,${0.78 * (p.escuro?.base ?? 1)}) 78%, rgba(10,7,6,${0.92 * (p.escuro?.base ?? 1)}) 100%)` }} />

      {/* outras dela, desfocadas e mais escuras, ao redor e atrás (ref. 2) */}
      {p.fundo?.map((f, i) => (
        <Img key={`fd${i}`} src={staticFile(`posts-reels/${f.src}`)} style={{ position: "absolute", left: f.x, top: f.y, height: f.altura, opacity: f.opacidade ?? 0.85, filter: `${FILTRO} brightness(.92) blur(${f.desfoque}px)`, transform: f.espelho ? "scaleX(-1)" : undefined }} />
      ))}
      {/* atrás da cabeça: o perfil translúcido (ref. 1) */}
      {p.perfil ? (
        <div style={{ position: "absolute", left: p.perfil.x, top: p.perfil.y, width: 900, opacity: 0.62, filter: "blur(.6px)", fontFamily: sans, color: CREME }}>
          <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
            <div style={{ width: 150, height: 150, borderRadius: 75, padding: 6, background: "conic-gradient(from 210deg, #F9CE34, #EE2A7B, #6228D7, #F9CE34)" }}>
              {p.perfil.foto
                ? <Img src={staticFile(`posts-reels/${p.perfil.foto}`)} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "5px solid #1a1311" }} />
                : <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#3a2d28", border: "5px solid #1a1311" }} />}
            </div>
            <div>
              <div style={{ fontSize: 38, fontWeight: 600, marginBottom: 18 }}>{p.perfil.nome}</div>
              <div style={{ display: "flex", gap: 46 }}>
                {p.perfil.numeros.map(([n, r], i) => <div key={i}><div style={{ fontSize: 40, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 30, opacity: .8 }}>{r}</div></div>)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.35, marginTop: 26, opacity: .85 }}>{p.perfil.bio.map((b, i) => <div key={i}>{b}</div>)}</div>
          <div style={{ fontSize: 32, marginTop: 14, color: "#9db4ff", opacity: .8 }}>🔗 {p.perfil.link}</div>
        </div>
      ) : null}
      {/* atrás da cabeça: um painel translúcido (a conta do tempo) */}
      {p.painel ? (
        <div style={{ position: "absolute", left: p.painel.x, top: p.painel.y, width: 440, opacity: 0.7, fontFamily: sans, color: CREME, ...vidroUI, borderRadius: 26, padding: "26px 30px" }}>
          <div style={{ fontSize: 22, letterSpacing: ".2em", textTransform: "uppercase", opacity: .75, marginBottom: 18 }}>{p.painel.titulo}</div>
          {p.painel.linhas.map(([a, b], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 32, padding: "10px 0", borderTop: i ? "1px solid rgba(255,255,255,.12)" : "none" }}><span>{a}</span><span style={{ fontWeight: 700 }}>{b}</span></div>
          ))}
        </div>
      ) : null}
      {/* palavra gigante atrás da cabeça (ref. 2) */}
      {p.gigante ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: p.gigante.y, textAlign: "center", fontFamily: p.gigante.fonte === "bodoni" ? bodoni : playfair, fontWeight: p.gigante.fonte === "bodoni" ? 400 : 900, fontSize: p.gigante.tam, lineHeight: 0.9, letterSpacing: "-0.02em", color: CREME, opacity: p.gigante.opacidade ?? 0.96, whiteSpace: "nowrap", textShadow: "0 10px 60px rgba(0,0,0,.35)" }}>{p.gigante.texto}</div>
      ) : null}

      {/* a Talyta recortada por cima: profundidade */}
      {p.luz ? <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(circle ${p.luz.raio}px at ${p.luz.x}px ${p.luz.y}px, rgba(232,206,180,${p.luz.forca}) 0%, rgba(232,206,180,${p.luz.forca * 0.45}) 45%, rgba(232,206,180,0) 100%)` }} /> : null}
      {/* com as cópias desfocadas atrás, sem sombra no recorte (a sombra fazia um contorno escuro no cabelo) */}
      {/* sem recorte = a foto fica intacta (cópias já compostas no fundo por scripts/compor-fundo.py) */}
      {p.recorte ? <Img src={staticFile(`posts-reels/${p.recorte}`)} style={{ ...foto, filter: p.fundo?.length ? FILTRO : `${FILTRO} drop-shadow(0 0 30px rgba(0,0,0,.35))` }} /> : null}
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, rgba(10,7,6,0) 52%, rgba(10,7,6,${0.55 * (p.escuro?.base ?? 1)}) 76%, rgba(10,7,6,${0.86 * (p.escuro?.base ?? 1)}) 100%)` }} />

      {/* na frente */}
      {p.pilulas ? (
        <div style={{ position: "absolute", top: p.pilulas.y, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12 }}>
          {p.pilulas.itens.map((it, i) => (
            <div key={i} style={{ ...vidroUI, borderRadius: 999, padding: `${(p.pilulas!.tam ?? 26) * 0.45}px ${(p.pilulas!.tam ?? 26) * 1.0}px`, display: "flex", alignItems: "center", gap: 10, fontFamily: sans, fontWeight: 500, fontSize: p.pilulas!.tam ?? 26, color: CREME, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: (p.pilulas!.tam ?? 26) * 0.92 }}>{it.icone}</span>{it.texto}
            </div>
          ))}
        </div>
      ) : null}
      {p.serifa ? (
        <div style={{ position: "absolute", left: p.serifa.x, top: p.serifa.y, fontFamily: bodoni, fontWeight: 400, fontSize: p.serifa.tam, lineHeight: 0.86, letterSpacing: "-0.035em", color: CREME, textShadow: "0 8px 40px rgba(0,0,0,.55), 0 2px 10px rgba(0,0,0,.45)" }}>
          {p.serifa.linhas.map((l, i) => <div key={i} style={{ whiteSpace: "nowrap" }}>{l}</div>)}
        </div>
      ) : null}
      {p.lado ? (
        <div style={{ position: "absolute", left: p.lado.x, top: p.lado.y, width: p.lado.largura }}>
          {p.lado.linhas.map((l, i) => <Linha key={i} l={l} tam={p.lado!.tam} />)}
        </div>
      ) : null}
      {p.texto ? (
        <div style={{ position: "absolute", left: p.texto.x ?? 0, right: p.texto.x === undefined ? 0 : undefined, top: p.texto.y, textAlign: p.texto.x === undefined ? "center" : "left" }}>
          {p.texto.linhas.map((l, i) => <Linha key={i} l={l} tam={p.texto!.tam} />)}
          {p.texto.sub ? <div style={{ marginTop: 22 }}>{p.texto.sub.map((l, i) => <Linha key={i} l={l} tam={p.texto!.tam * 0.52} />)}</div> : null}
        </div>
      ) : null}
      {p.botao ? (
        <div style={{ position: "absolute", top: p.botao.y, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ ...vidroUI, borderRadius: 999, padding: "10px 14px 10px 30px", display: "flex", alignItems: "center", gap: 18, fontFamily: sans, fontWeight: 500, fontSize: 22, color: CREME }}>
            {p.botao.texto ?? ""}<span style={{ width: 34, height: 34, borderRadius: 17, background: CREME, color: "#1a1311", display: "grid", placeItems: "center", fontSize: 20, fontWeight: 700 }}>›</span>
          </div>
        </div>
      ) : null}
      {p.cantos ? (
        <>
          <div style={{ position: "absolute", top: 58, left: 70, fontFamily: sans, fontSize: 17, lineHeight: 1.35, color: "rgba(243,232,220,.7)", letterSpacing: ".04em", textTransform: "uppercase" }}>{p.cantos.esquerda.map((t, i) => <div key={i}>{t}</div>)}</div>
          <div style={{ position: "absolute", top: 58, right: 70, textAlign: "right", fontFamily: sans, fontSize: 17, lineHeight: 1.35, color: "rgba(243,232,220,.7)", letterSpacing: ".04em", textTransform: "uppercase" }}>{p.cantos.direita.map((t, i) => <div key={i}>{t}</div>)}</div>
          <div style={{ position: "absolute", top: 66, left: 0, right: 0, textAlign: "center", fontFamily: sans, fontSize: 16, color: "rgba(243,232,220,.7)", letterSpacing: ".42em", textTransform: "uppercase" }}>{p.cantos.centro}</div>
          <div style={{ position: "absolute", bottom: 54, left: 70, fontFamily: sans, fontSize: 17, lineHeight: 1.35, color: "rgba(243,232,220,.7)", letterSpacing: ".04em", textTransform: "uppercase" }}>{p.cantos.esquerda.map((t, i) => <div key={i}>{t}</div>)}</div>
          <div style={{ position: "absolute", bottom: 54, right: 70, textAlign: "right", fontFamily: sans, fontSize: 17, lineHeight: 1.35, color: "rgba(243,232,220,.7)", letterSpacing: ".04em", textTransform: "uppercase" }}>{p.cantos.direita.map((t, i) => <div key={i}>{t}</div>)}</div>
          <div style={{ position: "absolute", bottom: 62, left: 0, right: 0, textAlign: "center", fontFamily: sans, fontSize: 16, color: "rgba(243,232,220,.7)", letterSpacing: ".42em", textTransform: "uppercase" }}>{p.cantos.centro}</div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
