// Carrossel "Bastidor TK" (2026-10-30): 3 imagens 1080x1350 que acompanham cada episódio do quadro.
//  · Capa: editorial em papel claro, foto da Talyta (pasta de fotos dela no Drive), moldura de fios, cabeçalho de 3 itens,
//    frase de impacto à direita com uma palavra em destaque, linha em caixa alta e um detalhe manuscrito (ref. "Alice de Santana").
//  · Página 2 (clara): cabeçalho de 3 itens, ícones do Instagram, título com a última linha em negrito, linha de apoio,
//    foto do cliente à direita (ref. "Nem todo post é sobre vendas").
//  · Página 3 (escura): foto do cliente em tela cheia, "Você está aqui" na etapa do processo, marcadores,
//    título embaixo à esquerda e texto à direita (refs. "Sem previsibilidade" e "Nem sempre o design é tudo").
// Conteúdo de cada carrossel: src/carrossel-<id>.json. Imagens: public/carrossel/<id>/ e public/carrossel/talyta.png.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadScript } from "@remotion/google-fonts/MrsSaintDelafield";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

const { fontFamily: outfit } = loadOutfit("normal", { weights: ["300", "400", "500", "600", "700"], subsets: ["latin", "latin-ext"] });
const { fontFamily: script } = loadScript("normal", { subsets: ["latin"] });
const { fontFamily: serif } = loadSerif("italic", { subsets: ["latin", "latin-ext"] });

export type Carrossel = {
  cliente: string;
  capa: { chamada: string; chamadaNegrito?: string; grande: string; sub: string; subDestaque?: string; foto?: string; recorte?: string; foco?: number; tam?: number; base?: number; degrade?: number; brilho?: number };
  p2: { foto: string; recorte?: string; linhas: string[]; negrito: string; sub: string; enquadre?: { z: number; dx: number; dy: number; foco: number; cor: "claro" | "escuro"; lado?: "esquerda" | "direita"; topo?: number; largura?: number; tam?: number; subTopo?: number; subLargura?: number } };
  p3: { foto: string; foco?: number; etapa: number; marcas: string[]; marca: number; titulo: string[]; texto: string };
};
const ETAPAS = ["Conversa", "Objetivo", "Estratégia", "Roteiro", "Gravação", "Edição"];
const C = { tinta: "#2B1A14", tinta2: "#5A3A2E", caramelo: "#A8714A", creme: "#F3E9DF" };

const Grao: React.FC<{ forca: number; modo?: "multiply" | "overlay" }> = ({ forca, modo = "multiply" }) => (
  <AbsoluteFill style={{ opacity: forca, mixBlendMode: modo, pointerEvents: "none" }}>
    <svg width="100%" height="100%"><filter id="papel"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={3} seed={4} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#papel)" /></svg>
  </AbsoluteFill>
);

// ---------- capa (v2, 2026-10-30): refs. "eu revelo", "público certo" e "Branding?" ----------
// Foto da Talyta com ambiente, em tela cheia e no fundo original; brilho suave em volta dela (recorte com drop-shadow claro);
// faixa de vidro no topo com o perfil; chamada numa etiqueta clara, palavra gigante em serifa itálica por cima do corpo,
// linha de apoio com a palavra-chave sublinhada; etiquetas pequenas nos cantos de baixo.
// Degradê só no topo e embaixo, nunca no rosto.
const AMARELO = "#F4E4C1";
const Sublinhado: React.FC<{ texto: string; destaque?: string }> = ({ texto, destaque }) => {
  const i = destaque ? texto.indexOf(destaque) : -1;
  if (!destaque || i < 0) return <>{texto}</>;
  return <>{texto.slice(0, i)}<b style={{ fontWeight: 700, color: AMARELO, textDecoration: "underline", textDecorationColor: C.caramelo, textDecorationThickness: 3, textUnderlineOffset: 8 }}>{destaque}</b>{texto.slice(i + destaque.length)}</>;
};
export const CapaCarrossel: React.FC<{ c: Carrossel; id: string }> = ({ c, id }) => {
  const k = c.capa;
  const pos = `50% ${k.foco ?? 30}%`;
  const foto = { position: "absolute" as const, inset: 0, width: "100%", height: "100%", objectFit: "cover" as const, objectPosition: pos };
  const vidro = { background: "rgba(18,12,9,.30)", backdropFilter: "blur(10px)", boxShadow: "inset 0 0 0 1px rgba(243,233,223,.18)" };
  return (
    <AbsoluteFill style={{ background: "#0F0A08", fontFamily: outfit, color: C.creme }}>
      <Img src={staticFile(`carrossel/${id}/${k.foto ?? "capa.jpg"}`)} style={{ ...foto, filter: "brightness(.86) saturate(.95)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,6,4,.6) 0%, rgba(10,6,4,0) 16%)" }} />
      {/* brilho em volta dela */}
      {k.recorte ? <Img src={staticFile(`carrossel/${id}/${k.recorte}`)} style={{ ...foto, filter: `brightness(.86) saturate(.95) drop-shadow(0 0 18px rgba(255,236,212,${k.brilho ?? 0.45})) drop-shadow(0 0 60px rgba(255,226,190,${(k.brilho ?? 0.45) / 2}))` }} /> : null}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,6,4,0) ${k.degrade ?? 58}%, rgba(10,6,4,.62) 78%, rgba(10,6,4,.9) 100%)` }} />
      {/* faixa de vidro no topo */}
      <div style={{ position: "absolute", top: 40, left: 40, right: 40, height: 92, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", fontSize: 21, letterSpacing: "0.06em", ...vidro }}>
        <span style={{ width: 230 }}>BASTIDOR TK</span>
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Img src={staticFile("marca/icone-k-fundo-marrom.svg")} style={{ width: 56, height: 56, borderRadius: 28, boxShadow: "0 0 0 2px rgba(243,233,223,.35)" }} />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, letterSpacing: 0 }}>
            <b style={{ fontWeight: 600, fontSize: 23 }}>TK Filmes</b><span style={{ fontSize: 19, opacity: 0.75 }}>@tk.filmes</span>
          </span>
        </span>
        <span style={{ width: 230, textAlign: "right" }}>DIREÇÃO</span>
      </div>
      {/* chamada + palavra gigante + apoio */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: k.base ?? 150, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ position: "relative", zIndex: 2, padding: "10px 26px", borderRadius: 14, background: "rgba(244,228,193,.92)", color: "#2B1A14", fontSize: 38, letterSpacing: "-0.01em", fontWeight: 400, boxShadow: "0 10px 30px rgba(0,0,0,.25)", transform: "rotate(-2deg)" }}>
          <Sublinhado texto={k.chamada} />{k.chamadaNegrito ? <b style={{ fontWeight: 700 }}> {k.chamadaNegrito}</b> : null}
        </div>
        <div style={{ marginTop: -38, fontFamily: serif, fontStyle: "italic", fontSize: k.tam ?? 250, lineHeight: 0.92, letterSpacing: "-0.03em", color: AMARELO, whiteSpace: "nowrap",
          textShadow: "0 0 40px rgba(255,228,190,.35), 0 6px 30px rgba(0,0,0,.45)" }}>{k.grande}</div>
        <div style={{ marginTop: 18, fontSize: 38, fontWeight: 300, letterSpacing: "-0.01em", textShadow: "0 2px 16px rgba(0,0,0,.6)" }}><Sublinhado texto={k.sub} destaque={k.subDestaque} /></div>
      </div>
      {/* cantos de baixo */}
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 56, display: "flex", justifyContent: "space-between", fontSize: 19, letterSpacing: "0.1em", color: "rgba(243,233,223,.8)" }}>
        <span>DIREÇÃO DE CONTEÚDO</span><span>ARRASTE PRO LADO →</span>
      </div>
      <Grao forca={0.1} modo="overlay" />
    </AbsoluteFill>
  );
};

// ícones simples do Instagram
const Icones: React.FC<{ cor: string }> = ({ cor }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
    <span style={{ fontFamily: script, fontSize: 46, color: cor, lineHeight: 1 }}>Instagram</span>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.8" strokeLinejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.8" strokeLinejoin="round"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L4 21l1.6-4.2A8.5 8.5 0 1 1 21 12z" /></svg>
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth="1.8" strokeLinejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" /></svg>
  </div>
);

// ---------- página 2: foto do cliente em tela cheia, com o fundo original (sem degradê branco) ----------
// enquadre: z (zoom), dx/dy (deslocamento em %, pra abrir espaço pro texto), cor do texto ("escuro" em fundo claro, "claro" em fundo escuro)
export const Pagina2Carrossel: React.FC<{ c: Carrossel; id: string }> = ({ c, id }) => {
  const e = c.p2.enquadre ?? { z: 1, dx: 0, dy: 0, foco: 30, cor: "escuro" };
  const claro = e.cor === "claro";
  const dir = e.lado === "direita";
  const tinta = claro ? C.creme : C.tinta;
  const sombra = claro ? "0 2px 18px rgba(0,0,0,.45)" : "0 1px 14px rgba(255,255,255,.35)";
  const vidro = claro ? { background: "rgba(20,12,8,.42)", boxShadow: "0 0 0 1px rgba(243,233,223,.18)" } : { background: "rgba(255,255,255,.5)", boxShadow: "0 0 0 1px rgba(43,26,20,.08)" };
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: outfit, color: tinta }}>
      <Img src={staticFile(`carrossel/${id}/${c.p2.foto}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${e.foco}%`,
        transform: `translate(${e.dx}%, ${e.dy}%) scale(${e.z})`, transformOrigin: `50% ${e.foco}%` }} />
      <div style={{ position: "absolute", top: 64, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 400, textShadow: sombra }}>
        <span>{c.cliente}</span><span>2026</span><span>Bastidor TK</span>
      </div>
      <div style={{ position: "absolute", ...(dir ? { right: 80 } : { left: 80 }), top: c.p2.recorte ? 120 : (e.topo ?? 380) - 90, filter: claro ? "drop-shadow(0 2px 10px rgba(0,0,0,.4))" : "none" }}><Icones cor={tinta} /></div>
      {/* título: com recorte, fica ATRÁS da pessoa (foto → título → pessoa recortada → caixa de texto) */}
      <div style={{ position: "absolute", ...(dir ? { right: 80, textAlign: "right" as const } : { left: 80 }), top: e.topo ?? 380, width: e.largura ?? 520,
        fontSize: e.tam ?? 78, lineHeight: 1.0, letterSpacing: "-0.035em", fontWeight: 400, textShadow: c.p2.recorte ? "none" : sombra }}>
        {c.p2.linhas.map((l) => <div key={l}>{l}</div>)}
        <div style={{ fontWeight: 700 }}>{c.p2.negrito}</div>
      </div>
      {c.p2.recorte ? (
        <Img src={staticFile(`carrossel/${id}/${c.p2.recorte}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${e.foco}%`,
          transform: `translate(${e.dx}%, ${e.dy}%) scale(${e.z})`, transformOrigin: `50% ${e.foco}%`, filter: "drop-shadow(0 18px 30px rgba(0,0,0,.35))" }} />
      ) : null}
      {/* caixa de texto: largura do próprio texto, com respiro */}
      <div style={{ position: "absolute", ...(dir ? { right: 80 } : { left: 80 }), top: e.subTopo ?? ((e.topo ?? 380) + (e.tam ?? 78) * 3.1 + 30), maxWidth: e.subLargura ?? 500,
        fontSize: 29, lineHeight: 1.4, letterSpacing: "0", fontWeight: 400, padding: "24px 30px", borderRadius: 22, backdropFilter: "blur(14px)", textAlign: dir ? "right" : "left", ...vidro }}>{c.p2.sub}</div>
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 70, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 26px", borderRadius: 999, backdropFilter: "blur(12px)", fontSize: 22, ...vidro }}>
        <span style={{ fontWeight: 600 }}>@tk.filmes</span><span>Direção de conteúdo | 2026</span>
      </div>
      <Grao forca={0.1} modo="overlay" />
    </AbsoluteFill>
  );
};
// ---------- página 3 (escura) ----------
export const Pagina3Carrossel: React.FC<{ c: Carrossel; id: string }> = ({ c, id }) => (
  <AbsoluteFill style={{ background: "#0F0A08", fontFamily: outfit, color: C.creme }}>
    <Img src={staticFile(`carrossel/${id}/${c.p3.foto}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${c.p3.foco ?? 25}%`, filter: "brightness(.8) saturate(.9) contrast(1.04)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,6,4,.78) 0%, rgba(10,6,4,.22) 22%, rgba(10,6,4,.08) 48%, rgba(10,6,4,.85) 80%, rgba(10,6,4,.97) 100%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 80% 85%, rgba(205,147,101,.18) 0%, rgba(205,147,101,0) 70%)" }} />
    {/* você está aqui: a etapa do processo */}
    <div style={{ position: "absolute", top: 136, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 30, fontSize: 30, fontWeight: 300, letterSpacing: "-0.01em" }}>
        {ETAPAS.map((e, i) => (
          <div key={e} style={{ position: "relative", color: i === c.p3.etapa ? C.creme : i < c.p3.etapa ? "rgba(243,233,223,.38)" : "rgba(243,233,223,.75)", fontWeight: i === c.p3.etapa ? 500 : 300 }}>
            {i === c.p3.etapa ? (
              <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 10, whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 26, fontWeight: 400 }}>Você está aqui</span>
                <svg width="22" height="18" viewBox="0 0 22 18" style={{ marginTop: 6 }}><path d="M0 0 H22 L11 18 Z" fill={C.creme} /></svg>
              </div>
            ) : null}
            {e}
          </div>
        ))}
      </div>
      <div style={{ alignSelf: "flex-start", marginLeft: 110, marginTop: 44, display: "flex", flexDirection: "column", gap: 16, fontSize: 30, fontWeight: 300 }}>
        {c.p3.marcas.map((m, i) => (
          <div key={m} style={{ display: "flex", alignItems: "center", gap: 20, color: i === c.p3.marca ? C.creme : "rgba(243,233,223,.55)" }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${C.creme}`, background: i === c.p3.marca ? C.creme : "transparent" }} />{m}
          </div>
        ))}
      </div>
    </div>
    {/* título embaixo à esquerda, texto à direita */}
    <div style={{ position: "absolute", left: 90, bottom: 110, width: 470 }}>
      <div style={{ fontSize: 22, fontWeight: 400, color: "rgba(243,233,223,.8)", marginBottom: 14 }}>@<b style={{ fontWeight: 700 }}>tk</b>.filmes</div>
      <div style={{ fontSize: 76, lineHeight: 1.0, letterSpacing: "-0.035em", fontWeight: 400 }}>{c.p3.titulo.map((l) => <div key={l}>{l}</div>)}</div>
    </div>
    <div style={{ position: "absolute", right: 90, bottom: 116, width: 400, fontSize: 32, lineHeight: 1.28, letterSpacing: "-0.01em", fontWeight: 300, color: "rgba(243,233,223,.92)" }}>{c.p3.texto}</div>
    <Grao forca={0.14} modo="overlay" />
  </AbsoluteFill>
);
