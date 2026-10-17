import { Easing,
  AbsoluteFill,
  Img,
  CalculateMetadataFunction,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadRound } from "@remotion/google-fonts/Nunito";
const redonda = loadRound("normal", { weights: ["800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
const lora = loadLora("normal", { weights: ["600"], subsets: ["latin", "latin-ext"] }).fontFamily;
const inter = loadInter("normal", { weights: ["600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
const serif = loadSerif("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;

const { fontFamily } = loadFont("normal", { weights: ["300", "500", "800"], subsets: ["latin", "latin-ext"] });

// Etapas de aprovação: "cortes" (só a montagem) → "cor" (+ tratamento) → "completo" (+ textos e efeitos).
export type Etapa = "cortes" | "cor" | "completo";

type Clipe = {
  id: string;
  trimBefore: number; // frame do bruto (proxy 1080x1920, 30 fps) onde o take começa
  from: number; // frame da edição
  durationInFrames: number;
  zoom: number; // 1 = plano original; 1.12 = leve aproximação pra variar o jump cut
};

type Texto = {
  from: number;
  durationInFrames: number;
  forte: string; // palavra em peso 800
  leve?: string; // continuação em peso 300
  pos?: "alto" | "baixo";
  y?: number; // sobe o texto em px (pra empilhar: a primeira palavra dita fica mais alta)
  cor?: string; // cor da palavra forte (padrão: creme; caramelo = "#E3B48C")
  tam?: number; // tamanho da palavra forte (padrão 96)
  pilula?: boolean; // etiqueta de interface (ref. 4), em vez de texto solto
};
type Zoom = { from: number; durationInFrames: number; escala: number };
// Figuras de design (etapa "completo"): cartões e chips de vidro fosco, na paleta da marca.
// atraso: frames depois da figura aparecer · fala: frame (relativo à figura) em que a palavra é dita, pra pulsar
// tom: "neg" (som descendo, surdo) ou "pos" (som subindo, claro), conforme o sentido do que se diz
type Tom = "neg" | "pos";
type Linha = { texto: string; atraso?: number; cor?: string; fala?: number; tom?: Tom };
type PontoRosto = { t: number; x: number; y: number; w: number; topo: number }; // normalizado 0-1, do rosto.py
type Rosto = { x: number; y: number; w: number; topo: number }; // em px da tela
type Figura =
  | { tipo: "cartao"; from: number; durationInFrames: number; pos: "alto" | "baixo"; avatar?: string; titulo?: string; etiqueta?: string; linhas?: Linha[]; tom?: Tom; fala?: number; segue?: boolean }
  | { tipo: "chips"; from: number; durationInFrames: number; pos: "alto" | "baixo"; linhas: Linha[]; segue?: boolean }
  | { tipo: "fecho"; from: number; durationInFrames: number; titulo: string; sub?: string; fala?: number }
  // headline: palavras grandes, fonte arredondada, surgindo ATRÁS da cabeça (o rosto é recortado por cima), uma por vez
  | { tipo: "headline"; from: number; durationInFrames: number; palavras: { texto: string; fala: number }[]; pessoa?: string }
  // titulo: título em fonte arredondada acima da cabeça, com brilho varrendo e som "brilho"
  | { tipo: "titulo"; from: number; durationInFrames: number; texto: string; sub?: string; fala?: number }
  // sutil: uma linha pequena em caps, sem pílula, com fio caramelo
  | { tipo: "sutil"; from: number; durationInFrames: number; texto: string }
  // stickers: dois adesivos de pergunta estilo rede social, lado a lado, com exemplos
  | { tipo: "stickers"; from: number; durationInFrames: number; exemplos: string[] }
  // salvar: botão "Salvar" com o marcador, estilo rede social, que preenche ao ser "tocado"
  | { tipo: "salvar"; from: number; durationInFrames: number; fala?: number }
  // frase: uma frase simples em fonte arredondada, centrada, no máximo duas linhas (sem pílula)
  | { tipo: "frase"; from: number; durationInFrames: number; texto: string; pos?: "alto" | "baixo"; fala?: number }
  // tres: três exemplos práticos (vídeo, stories, print de conversa) desenhados, cada um entrando na palavra dita
  | { tipo: "tres"; from: number; durationInFrames: number; falas: [number, number, number]; itens?: { rotulo: string; desenho: "video" | "stories" | "print" | "luz" | "lente" | "mic" }[] }
  // calendario: um mês com dois dias fixos por semana, atrás da apresentadora (recorte em `pessoa`), subindo de baixo
  | { tipo: "calendario"; from: number; durationInFrames: number; dias: number[]; fala: number; pessoa: string }
  // fixar: um feed em grade; o melhor post sobe pro topo e ganha o alfinete (na palavra "topo")
  | { tipo: "fixar"; from: number; durationInFrames: number; fala: number }
  // rolar: um feed rolando lá pra baixo, rápido (na palavra "rolar")
  | { tipo: "rolar"; from: number; durationInFrames: number; fala: number }
  // logo: fecho de todos os vídeos: fundo creme sobe e a marca entra com mola
  | { tipo: "logo"; from: number; durationInFrames: number }
  // assets: ícones/logos desenhados (sem pílula), cada um entrando na palavra dita
  | { tipo: "assets"; from: number; durationInFrames: number; itens: { icone: "whatsapp" | "stories" | "play"; rotulo: string; fala: number }[] }
  // comentario: um comentário sendo escrito em movimento e a resposta logo abaixo
  | { tipo: "comentario"; from: number; durationInFrames: number; usuario: string; pergunta: string; resposta: string; fala: number }
  // porta: uma porta abrindo atrás da apresentadora (recorte em `pessoa`), com luz saindo pela abertura
  | { tipo: "porta"; from: number; durationInFrames: number; fala: number; pessoa: string };
// Legenda normal (palavra por palavra agrupada), mostrada só quando não há arte na tela.
type Legenda = { from: number; durationInFrames: number; texto: string };
// Reenquadramento: num trecho, o vídeo dá um zoom leve e acompanha o rosto, mantendo a apresentadora centrada.
type Reenquadramento = { from: number; durationInFrames: number; escala: number }; // aproximação rápida numa palavra-chave

export type Estilo = "sans" | "serif" | "caps" | "legenda";
export type Grade = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
export type VolteiProps = { clipes: Clipe[]; textos: Texto[]; figuras?: Figura[]; legendas?: Legenda[]; zooms?: Zoom[]; reenquadramentos?: Reenquadramento[]; rosto?: PontoRosto[]; etapa: Etapa; grade?: Grade; estilo?: Estilo; fonte?: string; forcar?: { etapa?: Etapa; grade?: Grade; estilo?: Estilo } };

// Cada vídeo mora em public/<pasta>/ (edicao.json, rosto.json, mídia). O componente é o mesmo pra todos.
export const calcularVideo = (pasta: string): CalculateMetadataFunction<VolteiProps> => async ({ props }) => {
  const r = await fetch(staticFile(`${pasta}/edicao.json`));
  const d = await r.json();
  let rosto: PontoRosto[] = [];
  try { rosto = await (await fetch(staticFile(`${pasta}/rosto.json`))).json(); } catch { rosto = []; }
  const total = d.clipes.reduce((m: number, c: Clipe) => Math.max(m, c.from + c.durationInFrames), 0);
  return {
    durationInFrames: d.previa ? Math.min(total, d.previa) : total,
    fps: d.fps ?? 30,
    props: { clipes: d.clipes, textos: d.textos ?? [], figuras: d.figuras ?? [], legendas: d.legendas ?? [], zooms: d.zooms ?? [], reenquadramentos: d.reenquadramentos ?? [], rosto, etapa: props.forcar?.etapa ?? d.etapa ?? "cortes", grade: props.forcar?.grade ?? d.grade ?? "A", estilo: props.forcar?.estilo ?? d.estilo ?? "sans", fonte: d.fonte ?? "voltei/IMG_0511.mp4" },
  };
};

// Tratamentos de cor (etapa "cor"). `filtro` vale pro vídeo inteiro; `camada` é uma cor por cima, com modo de mistura.
//  A · quente fosco (sépia leve) · B · claro limpo · C · cinema (contraste, dessaturado)
//  D · papel: claro, fosco e aéreo, puxando pro off-white do feed
//  E · caramelo: base natural com um banho da cor da marca nas luzes
//  F · teal & orange leve: sombras frias, luzes quentes (o look clássico de cinema, bem contido)
//  G · natural nítido: sem tingir nada, só contraste e vinheta
type Camada = { background: string; mix: React.CSSProperties["mixBlendMode"]; opacity: number };
type Tratamento = { filtro: string; camada?: Camada; camadas?: Camada[] };
const GRADES: Record<Grade, Tratamento> = {
  A: { filtro: "brightness(1.04) contrast(0.94) saturate(0.88) sepia(0.14)" },
  B: { filtro: "brightness(1.07) contrast(1.0) saturate(0.95) sepia(0.06)" },
  C: { filtro: "brightness(1.0) contrast(1.06) saturate(0.78) sepia(0.22)" },
  D: { filtro: "brightness(1.09) contrast(0.9) saturate(0.78) sepia(0.1)", camada: { background: "#F4EBE1", mix: "screen", opacity: 0.12 } },
  E: { filtro: "brightness(1.03) contrast(0.98) saturate(0.95)", camada: { background: "linear-gradient(180deg, #CD9365 0%, #B97F55 100%)", mix: "soft-light", opacity: 0.35 } },
  F: { filtro: "brightness(1.02) contrast(1.04) saturate(1.0)", camada: { background: "linear-gradient(180deg, #F0C9A0 0%, #1F3A3F 100%)", mix: "soft-light", opacity: 0.28 } },
  G: { filtro: "brightness(1.02) contrast(1.05) saturate(1.02)" },
  // H · caramelo + contraste + sombras frias (pedido da Talyta): o banho caramelo da E, mais contraste,
  //     e um azul-petróleo só nas sombras ("lighten" só alcança o que é mais escuro que a cor), pra separar do fundo.
  H: { filtro: "brightness(1.03) contrast(1.07) saturate(0.95)", camadas: [
    { background: "#1E3238", mix: "lighten", opacity: 0.55 },
    { background: "linear-gradient(180deg, #CD9365 0%, #B97F55 100%)", mix: "soft-light", opacity: 0.32 } ] },
  // I · igual à H, com as sombras mais frias e mais contraste
  I: { filtro: "brightness(1.03) contrast(1.11) saturate(0.92)", camadas: [
    { background: "#1B3540", mix: "lighten", opacity: 0.8 },
    { background: "linear-gradient(180deg, #CD9365 0%, #B97F55 100%)", mix: "soft-light", opacity: 0.3 } ] },
};

const Tomada: React.FC<{ clipe: Clipe; cor: boolean; grade: Grade; fonte: string }> = ({ clipe, cor, grade, fonte }) => (
  <AbsoluteFill>
    <Video
      name={`Take ${clipe.id}`}
      src={staticFile(fonte)}
      trimBefore={clipe.trimBefore}
      objectFit="cover"
      style={{ width: "100%", height: "100%", scale: clipe.zoom, filter: cor ? GRADES[grade].filtro : undefined }}
    />
    {cor
      ? [...(GRADES[grade].camada ? [GRADES[grade].camada!] : []), ...(GRADES[grade].camadas ?? [])].map((c, i) => (
          <AbsoluteFill key={i} style={{ background: c.background, mixBlendMode: c.mix, opacity: c.opacity, pointerEvents: "none" }} />
        ))
      : null}
  </AbsoluteFill>
);

const Grao: React.FC = () => (
  <AbsoluteFill
    style={{
      opacity: 0.12,
      mixBlendMode: "overlay",
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
    }}
  />
);

const Vinheta: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(40,26,20,.28) 100%)" }} />
);

// Texto na tela. Quatro estilos pra aprovar com a Talyta:
//  sans    · Montserrat pesada, creme, com sombra (a primeira versão)
//  serif   · Instrument Serif grande, creme, sem sombra: a mesma linguagem dos posts do feed
//  caps    · sans leve em caixa alta e espaçada, com fio caramelo: o "rótulo" do feed, discreto
//  legenda · frase inteira em sans média, a palavra do momento em caramelo (legenda viva)
const TextoNaTela: React.FC<{ t: Texto; estilo: Estilo }> = ({ t, estilo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 16, stiffness: 110 } });
  const sai = interpolate(frame, [t.durationInFrames - 8, t.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(entra, [0, 1], [18, 0]);
  const base: React.CSSProperties = {
    position: "absolute",
    left: 80,
    right: 80,
    top: t.pos === "alto" ? 150 + (t.y ?? 0) : undefined,
    bottom: t.pos === "alto" ? undefined : 380 + (t.y ?? 0),
    opacity: entra * sai,
    transform: `translateY(${y}px)`,
    lineHeight: 1.05,
  };
  if (t.pilula) {
    const pil: React.CSSProperties = estilo === "serif" || estilo === "caps"
      ? { background: "rgba(62,42,34,.55)", color: "#FBF4EC", border: "1px solid rgba(251,244,236,.35)", backdropFilter: "blur(8px)" }
      : { background: "rgba(251,244,236,.94)", color: "#3E2A22", boxShadow: "0 18px 40px rgba(40,26,20,.25)" };
    return (
      <div style={{ ...base, right: "auto", display: "inline-block", padding: "18px 30px", borderRadius: 999, fontFamily, fontSize: 34, fontWeight: 500, letterSpacing: estilo === "caps" ? ".18em" : "0", textTransform: estilo === "caps" ? "uppercase" : "none", ...pil }}>
        <span style={{ fontWeight: estilo === "caps" ? 500 : 800 }}>{t.forte}</span>
        {t.leve ? <span> {t.leve}</span> : null}
      </div>
    );
  }
  if (estilo === "serif") {
    return (
      <div style={{ ...base, fontFamily: serif, color: t.cor ?? "#FBF4EC", textAlign: "center", textShadow: "0 1px 10px rgba(0,0,0,.18)" }}>
        <span style={{ fontSize: (t.tam ?? 96) * 1.15, letterSpacing: "-0.015em" }}>{t.forte}</span>
        {t.leve ? <span style={{ fontSize: (t.tam ?? 96) * 0.8, marginLeft: 16, opacity: .9 }}>{t.leve}</span> : null}
      </div>
    );
  }
  if (estilo === "caps") {
    return (
      <div style={{ ...base, fontFamily, color: t.cor ?? "#FBF4EC", textAlign: "center", fontSize: 30, fontWeight: 500, letterSpacing: ".3em", textTransform: "uppercase", textShadow: "0 1px 8px rgba(0,0,0,.25)" }}>
        <div style={{ width: 70, height: 1, background: "#E3B48C", margin: "0 auto 18px" }} />
        {t.forte}{t.leve ? ` ${t.leve}` : ""}
      </div>
    );
  }
  if (estilo === "legenda") {
    return (
      <div style={{ ...base, fontFamily, color: "#FBF4EC", textAlign: "center", fontSize: 54, fontWeight: 600, textShadow: "0 2px 14px rgba(0,0,0,.45)", lineHeight: 1.25 }}>
        {t.leve ? <span style={{ opacity: .92 }}>{t.leve} </span> : null}
        <span style={{ color: "#E3B48C" }}>{t.forte}</span>
      </div>
    );
  }
  return (
    <div style={{ ...base, fontFamily, color: "#FBF4EC", textShadow: "0 2px 18px rgba(0,0,0,.35)", letterSpacing: "-0.02em" }}>
      <span style={{ fontSize: t.tam ?? 96, fontWeight: 800, color: t.cor }}>{t.forte}</span>
      {t.leve ? <span style={{ fontSize: 64, fontWeight: 300, marginLeft: 18 }}>{t.leve}</span> : null}
    </div>
  );
};

// ---------- Figuras de design ----------
const VIDRO: React.CSSProperties = {
  background: "rgba(62,42,34,.42)",
  border: "1px solid rgba(251,244,236,.28)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 24px 60px rgba(20,12,8,.28)",
  color: "#FBF4EC",
};
const CAPS: React.CSSProperties = { fontFamily, fontSize: 26, fontWeight: 500, letterSpacing: ".28em", textTransform: "uppercase" };

const useEntrada = (duracao: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const sai = interpolate(frame, [duracao - 10, duracao], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { opacity: entra * sai, y: interpolate(entra, [0, 1], [26, 0]) };
};

// Pulso quando a palavra é dita: cresce 14% e acende em caramelo, depois assenta.
const usePulso = (fala: number | undefined, frame: number, fps: number) => {
  if (fala === undefined) return { escala: 1, acende: 0 };
  const f = frame - fala;
  if (f < 0) return { escala: 1, acende: 0 };
  const e = spring({ frame: f, fps, config: { damping: 9, stiffness: 180 } });
  const volta = interpolate(f, [6, 22], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { escala: 1 + 0.14 * e * volta, acende: Math.max(e * volta, f > 6 ? 0.6 : 0) };
};
const mistura = (a: string, b: string, k: number) => (k > 0.5 ? b : a);

const somDoTom = (tom?: Tom) => (tom === "neg" ? "sfx/negativo.wav" : tom === "pos" ? "sfx/positivo.wav" : "sfx/tique.wav");

// Zonas seguras do reels (regra fixa, 2026-10-12, vale pra qualquer cliente): a interface do Instagram cobre
// o topo (cabeçalho), a coluna da direita (curtir, comentar, compartilhar) e o rodapé (perfil, legenda, trilha).
// Nenhum elemento fora da área útil. O foco principal fica na linha dos olhos; a legenda logo abaixo do foco,
// perto do rosto (ler e ver ao mesmo tempo); ilustrações na faixa de baixo, sem dominar o vídeo.
export const ZONA = { esq: 60, dir: 920, topo: 250, base: 1500, olhos: [300, 900], legenda: [900, 1080], ilustra: [1080, 1500] } as const;
const LARG_UTIL = ZONA.dir - ZONA.esq; // 860

// Topo de um texto na zona da legenda: logo abaixo do queixo, nunca sobre o rosto, nunca fora da área útil.
let TOPO_CABECA: number | null = null; // ponto mais alto da cabeça no vídeo inteiro: a legenda fica parada logo acima
let QUEIXO_FIXO: number | null = null; // queixo mais baixo do vídeo inteiro: a legenda fica parada abaixo dele
const abaixoDoQueixo = (rosto: Rosto | null, altura: number) => {
  const queixo = QUEIXO_FIXO ?? (rosto ? rosto.y + (rosto.w * 1.3) / 2 : ZONA.legenda[0]);
  return Math.max(ZONA.legenda[0] + 20, Math.min(queixo + 40, ZONA.base - altura));
};

// Onde a figura fica em relação ao rosto (se `segue`). O enquadramento é fechado (o rosto ocupa metade da
// largura), então "alto" = logo acima da cabeça e "baixo" = logo abaixo do queixo, sempre centrado no rosto.
const posicaoJuntoAoRosto = (rosto: Rosto | null, pos: "alto" | "baixo", largura: number, altura = 150): React.CSSProperties => {
  if (!rosto) return pos === "alto" ? { left: ZONA.esq + 20, top: ZONA.topo } : { left: ZONA.esq + 20, bottom: 1920 - ZONA.base };
  const left = Math.max(ZONA.esq, Math.min(rosto.x - largura / 2, ZONA.dir - largura));
  const alturaRosto = rosto.w * 1.3;
  if (pos === "alto") return { left, top: Math.max(ZONA.topo, rosto.topo - altura - 36) };
  const queixo = rosto.y + alturaRosto / 2;
  return { left, top: Math.max(ZONA.legenda[0], Math.min(queixo + 70, ZONA.base - altura)) };
};

const Cartao: React.FC<{ f: Extract<Figura, { tipo: "cartao" }>; rosto: Rosto | null }> = ({ f, rosto }) => {
  const { opacity, y } = useEntrada(f.durationInFrames);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const altura = 80 + (f.linhas?.length ?? 0) * 78 + (f.avatar || f.titulo ? 110 : 0);
  const anc = f.segue ? posicaoJuntoAoRosto(rosto, f.pos, 520, altura) : (f.pos === "alto" ? { left: ZONA.esq + 20, top: ZONA.topo } : { left: ZONA.esq + 20, bottom: 1920 - ZONA.base });
  const pulso = usePulso(f.fala, frame, fps);
  const PIL: React.CSSProperties = { ...VIDRO, borderRadius: 999, padding: "14px 26px", display: "inline-flex", alignItems: "center", gap: 16 };
  return (
    <>
    <Audio src={staticFile("sfx/vidro.wav")} volume={0.3} />
    {f.tom ? <Sequence from={f.fala ?? 4} durationInFrames={14}><Audio src={staticFile(somDoTom(f.tom))} volume={0.3} /></Sequence> : null}
    {f.linhas?.map((l, i) => (
      <Sequence key={`s${i}`} from={l.fala ?? l.atraso ?? 0} durationInFrames={14}>
        <Audio src={staticFile(somDoTom(l.tom))} volume={l.tom ? 0.3 : 0.22} />
      </Sequence>
    ))}
    <div style={{ position: "absolute", ...anc, maxWidth: LARG_UTIL - 20, opacity, transform: `translateY(${y}px)`, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
      {f.avatar || f.titulo ? (
        <div style={{ ...PIL, padding: "10px 26px 10px 10px", transform: `scale(${pulso.escala})`, transformOrigin: "left center" }}>
          {f.avatar ? <Img src={staticFile(f.avatar)} style={{ width: 72, height: 72, borderRadius: 36, objectFit: "cover", border: "2px solid rgba(251,244,236,.6)" }} /> : null}
          <div>
            {f.titulo ? <div style={{ fontFamily: serif, fontSize: 42, lineHeight: 1 }}>{f.titulo}</div> : null}
            {f.etiqueta ? <div style={{ ...CAPS, fontSize: 18, color: "#E3B48C", marginTop: 6, opacity: 0.75 + 0.25 * pulso.acende }}>{f.etiqueta}</div> : null}
          </div>
        </div>
      ) : f.etiqueta ? (
        <div style={{ ...PIL, padding: "10px 22px", ...CAPS, fontSize: 18, color: "#E3B48C" }}>{f.etiqueta}</div>
      ) : null}
      {f.linhas?.map((l, i) => {
        const fr = frame - (l.atraso ?? 0);
        if (fr < 0) return null;
        const e = spring({ frame: fr, fps, config: { damping: 14, stiffness: 150 } });
        const pl = usePulso(l.fala, frame, fps);
        return (
          <div key={i} style={{ ...PIL, transform: `scale(${(0.9 + 0.1 * e) * pl.escala})`, transformOrigin: "left center", opacity: e, borderColor: mistura("rgba(251,244,236,.28)", "rgba(227,180,140,.9)", pl.acende) }}>
            {l.tom === "neg" ? <span style={{ fontFamily: inter, fontWeight: 700, fontSize: 24, color: "#E3B48C", lineHeight: 1 }}>✕</span> : <div style={{ width: 10, height: 10, borderRadius: 5, background: l.cor ?? "#E3B48C" }} />}
            <span style={{ ...CAPS, fontSize: 26, color: l.cor ?? mistura("#FBF4EC", "#E3B48C", pl.acende), textDecoration: l.tom === "neg" ? "line-through" : "none", textDecorationColor: "rgba(227,180,140,.7)" }}>{l.texto}</span>
          </div>
        );
      })}
    </div>
    </>
  );
};

const Chip: React.FC<{ l: Linha }> = ({ l }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fr = frame - (l.atraso ?? 0);
  if (fr < 0) return null;
  const e = spring({ frame: fr, fps, config: { damping: 14, stiffness: 150 } });
  const { escala, acende } = usePulso(l.fala, frame, fps);
  return (
    <div style={{ ...VIDRO, borderRadius: 999, padding: "16px 28px 16px 20px", display: "flex", alignItems: "center", gap: 16, transform: `scale(${(0.9 + 0.1 * e) * escala})`, transformOrigin: "left center", opacity: e, borderColor: mistura("rgba(251,244,236,.28)", "rgba(227,180,140,.9)", acende) }}>
      <div style={{ width: 30, height: 30, borderRadius: 15, background: l.cor ?? "#CD9365", display: "grid", placeItems: "center", color: "#2a1a12", fontSize: 18, fontWeight: 800 }}>✓</div>
      <span style={{ ...CAPS, fontSize: 28, color: mistura("#FBF4EC", "#E3B48C", acende) }}>{l.texto}</span>
    </div>
  );
};

const Chips: React.FC<{ f: Extract<Figura, { tipo: "chips" }>; rosto: Rosto | null }> = ({ f, rosto }) => {
  const { opacity } = useEntrada(f.durationInFrames);
  const anc = f.segue ? posicaoJuntoAoRosto(rosto, f.pos, 420, 230) : (f.pos === "alto" ? { left: ZONA.esq + 20, top: ZONA.topo } : { left: ZONA.esq + 20, bottom: 1920 - ZONA.base });
  return (
    <>
    {f.linhas.map((l, i) => (
      <Sequence key={`s${i}`} from={l.fala ?? l.atraso ?? 0} durationInFrames={14}>
        <Audio src={staticFile(somDoTom(l.tom ?? "pos"))} volume={0.3} />
      </Sequence>
    ))}
    <div style={{ position: "absolute", ...anc, maxWidth: LARG_UTIL - 20, opacity, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
      {f.linhas.map((l, i) => <Chip key={i} l={l} />)}
    </div>
    </>
  );
};

const Fecho: React.FC<{ f: Extract<Figura, { tipo: "fecho" }> }> = ({ f }) => {
  const { opacity, y } = useEntrada(f.durationInFrames);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulso = usePulso(f.fala, frame, fps);
  return (
    <>
    <Sequence from={f.fala ?? 0} durationInFrames={45}><Audio src={staticFile("sfx/sino.wav")} volume={0.3} /></Sequence>
    <div style={{ position: "absolute", left: ZONA.esq + 20, right: 1080 - ZONA.dir + 20, bottom: 1920 - ZONA.base, textAlign: "center", opacity, transform: `translateY(${y}px) scale(${pulso.escala})` }}>
      <div style={{ fontFamily: serif, fontSize: 132, color: mistura("#FBF4EC", "#E3B48C", pulso.acende), lineHeight: 1, textShadow: "0 2px 16px rgba(0,0,0,.25)" }}>{f.titulo}</div>
      {f.sub ? (
        <div style={{ display: "inline-block", marginTop: 26, ...VIDRO, borderRadius: 999, padding: "14px 26px", ...CAPS, fontSize: 24, color: "#E3B48C" }}>{f.sub}</div>
      ) : null}
    </div>
    </>
  );
};

// Headline: cada palavra entra com impacto (escala 1.6 → 1, som "impacto") na altura do topo da cabeça.
// A apresentadora recortada do fundo (scripts/segmentar.py → PNG RGBA por frame) fica POR CIMA do texto,
// então a palavra nasce atrás dela de verdade, sem cobrir testa nem cabelo.
const Headline: React.FC<{ f: Extract<Figura, { tipo: "headline" }>; rosto: Rosto | null; frameAbs: number; transformVideo: React.CSSProperties }> = ({ f, rosto, frameAbs, transformVideo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const atual = [...f.palavras].reverse().find((p) => frame >= p.fala);
  const topo = rosto ? rosto.topo : 300;
  const yTexto = Math.max(ZONA.topo + 115, topo - 200); // acima da cabeça, mas nunca fora da área útil
  let texto: React.ReactNode = null;
  if (atual) {
    const fr = frame - atual.fala;
    const e = spring({ frame: fr, fps, config: { damping: 11, stiffness: 160 } });
    const escala = interpolate(e, [0, 1], [1.22, 1]);
    // cabe sempre no quadro: o tamanho vem da largura da palavra (com folga pra escala de entrada)
    const tamanho = Math.min(220, Math.floor((LARG_UTIL - 40) / (atual.texto.length * 0.6)));
    texto = (
      <div style={{ position: "absolute", left: ZONA.esq, width: LARG_UTIL, top: yTexto - 115, textAlign: "center", fontFamily: redonda, fontWeight: 900, fontSize: tamanho, letterSpacing: "-0.02em", color: "#FBF4EC", textShadow: "0 6px 30px rgba(20,12,8,.35)", transform: `scale(${escala})`, opacity: e, textTransform: "uppercase", whiteSpace: "nowrap" }}>
        {atual.texto}
      </div>
    );
  }
  const pessoa = f.pessoa && f.pessoa !== "" ? staticFile(`${f.pessoa}/f${String(frameAbs).padStart(5, "0")}.png`) : null;
  return (
    <>
    {f.palavras.map((p, i) => (
      <Sequence key={i} from={p.fala} durationInFrames={20}><Audio src={staticFile("sfx/impacto.wav")} volume={0.45} /></Sequence>
    ))}
    <AbsoluteFill style={{ pointerEvents: "none" }}>{texto}</AbsoluteFill>
    {pessoa ? <AbsoluteFill style={{ ...transformVideo, pointerEvents: "none" }}><Img src={pessoa} style={{ width: "100%", height: "100%" }} /></AbsoluteFill> : null}
    </>
  );
};

// Título arredondado acima da cabeça: entra com mola e "reluz": um halo esfumado atrás das letras pulsa
// duas vezes (brilho que acende e assenta), com som "brilho". Linha de apoio com sombra pra ler em fundo claro.
const Titulo: React.FC<{ f: Extract<Figura, { tipo: "titulo" }>; rosto: Rosto | null }> = ({ f, rosto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  const sai = interpolate(frame, [f.durationInFrames - 10, f.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ini = f.fala ?? 6;
  const t = Math.max(0, frame - ini);
  // dois pulsos de brilho: forte e depois suave, assentando num brilho leve constante
  const pulso = Math.max(0, Math.sin((t / 14) * Math.PI)) * interpolate(t, [0, 28], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brilho = frame >= ini ? 0.25 + 0.75 * pulso : 0;
  const topo = rosto ? rosto.topo : 300;
  const cx = rosto ? rosto.x : 540;
  const left = Math.max(60, Math.min(cx - 460, 1080 - 60 - 920));
  const sombra = `0 4px 18px rgba(20,12,8,.45), 0 0 ${18 + 50 * brilho}px rgba(255,236,210,${0.35 + 0.55 * brilho}), 0 0 ${40 + 90 * brilho}px rgba(227,180,140,${0.2 + 0.5 * brilho})`;
  return (
    <>
    <Sequence from={ini} durationInFrames={30}><Audio src={staticFile("sfx/brilho.wav")} volume={0.35} /></Sequence>
    <div style={{ position: "absolute", left, width: 920, top: Math.max(80, topo - 250), textAlign: "center", opacity: e * sai, transform: `scale(${0.8 + 0.2 * e}) translateY(${(1 - e) * 20}px)` }}>
      <div style={{ position: "absolute", left: "10%", right: "10%", top: -40, height: 180, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(255,236,210,.55), rgba(227,180,140,0) 70%)", filter: "blur(24px)", opacity: brilho, pointerEvents: "none" }} />
      <div style={{ position: "relative", fontFamily: redonda, fontWeight: 900, fontSize: 96, lineHeight: 1.05, letterSpacing: "-0.02em", color: mistura("#FBF4EC", "#FFF6EA", brilho), textShadow: sombra }}>
        {f.texto}
      </div>
      {f.sub ? <div style={{ position: "relative", fontFamily: redonda, fontWeight: 800, fontSize: 34, color: "#FBF4EC", marginTop: 10, textShadow: "0 2px 10px rgba(20,12,8,.6), 0 0 24px rgba(20,12,8,.35)" }}>{f.sub}</div> : null}
    </div>
    </>
  );
};

// Frase simples: fonte arredondada, centrada, até duas linhas, sem pílula. Pulsa na palavra dita.
const Frase: React.FC<{ f: Extract<Figura, { tipo: "frase" }>; rosto: Rosto | null }> = ({ f, rosto }) => {
  const { opacity, y } = useEntrada(f.durationInFrames);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulso = { ...usePulso(f.fala, frame, fps), escala: 1 };
  // na zona da legenda (logo abaixo do foco), sempre abaixo do queixo, dentro da área útil
  const anc: React.CSSProperties = f.pos === "alto" ? { top: ZONA.topo } : { top: abaixoDoQueixo(rosto, 150) };
  return (
    <div style={{ position: "absolute", left: ZONA.esq + 40, right: 1080 - ZONA.dir + 40, ...anc, textAlign: "center", opacity, transform: `translateY(${y}px) scale(${pulso.escala})`, fontFamily: redonda, fontWeight: 800, fontSize: 38, lineHeight: 1.25, color: "#FFFFFF", textShadow: "0 3px 14px rgba(20,12,8,.6)" }}>
      {f.texto}
    </div>
  );
};

// Legenda normal: arredondada, centrada, até duas linhas, só quando não há arte na tela.
const LegendaNormal: React.FC<{ l: Legenda; rosto: Rosto | null }> = ({ l }) => {
  // Estilo da referência da Talyta (2026-10-13): serif seminegrito branca, sem caixa nem contorno, sombra leve,
  // de duas a três palavras por vez, parada no alto, logo acima da cabeça (nunca acima da área útil).
  const tamanho = 46;
  const top = Math.max(ZONA.topo, (TOPO_CABECA ?? 420) - tamanho * 1.25 - 36);
  return (
    <div style={{ position: "absolute", left: ZONA.esq + 40, right: 1080 - ZONA.dir + 40, top, textAlign: "center", fontFamily: lora, fontWeight: 600, fontSize: tamanho, lineHeight: 1.2, color: "#FFFFFF", textShadow: "0 1px 6px rgba(0,0,0,.35)" }}>
      {l.texto}
    </div>
  );
};

// Linha sutil: caps pequeno com fio caramelo, sem pílula.
const Sutil: React.FC<{ f: Extract<Figura, { tipo: "sutil" }>; rosto: Rosto | null }> = ({ f, rosto }) => {
  const { opacity, y } = useEntrada(f.durationInFrames);
  const anc = posicaoJuntoAoRosto(rosto, "baixo", 700, 60);
  return (
    <div style={{ position: "absolute", ...anc, width: 700, textAlign: "center", opacity, transform: `translateY(${y}px)` }}>
      <div style={{ width: 60, height: 1.5, background: "#E3B48C", margin: "0 auto 12px" }} />
      <div style={{ ...CAPS, fontSize: 22, color: "#FBF4EC", textShadow: "0 1px 8px rgba(0,0,0,.35)" }}>{f.texto}</div>
    </div>
  );
};

// Adesivos de pergunta (estilo rede social): dois exemplos lado a lado, entrando com giro.
const Stickers: React.FC<{ f: Extract<Figura, { tipo: "stickers" }>; rosto: Rosto | null }> = ({ f, rosto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sai = interpolate(frame, [f.durationInFrames - 10, f.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const anc = posicaoJuntoAoRosto(rosto, "baixo", 900, 200);
  return (
    <>
    {f.exemplos.map((_, i) => (
      <Sequence key={`s${i}`} from={i * 8} durationInFrames={12}><Audio src={staticFile("sfx/tique.wav")} volume={0.3} /></Sequence>
    ))}
    <div style={{ position: "absolute", ...anc, width: 900, display: "flex", gap: 20, justifyContent: "center", opacity: sai, perspective: 900 }}>
      {f.exemplos.map((ex, i) => {
        const e = spring({ frame: frame - i * 8, fps, config: { damping: 13, stiffness: 140 } });
        return (
          <div key={i} style={{ width: 430, background: "#fff", borderRadius: 22, overflow: "hidden", boxShadow: "0 18px 40px rgba(20,12,8,.28)", opacity: e, transform: `rotateX(${(1 - e) * -70}deg) scale(${0.85 + 0.15 * e})`, transformOrigin: "top center" }}>
            <div style={{ background: "linear-gradient(90deg, #CD9365, #B97F55)", color: "#fff", fontFamily: inter, fontWeight: 700, fontSize: 20, letterSpacing: ".04em", padding: "12px 20px", textTransform: "uppercase" }}>Faça uma pergunta</div>
            <div style={{ padding: "22px 22px 26px", fontFamily: inter, fontWeight: 600, fontSize: 30, color: "#262626", lineHeight: 1.25 }}>{ex}</div>
          </div>
        );
      })}
    </div>
    </>
  );
};

// Botão "Salvar" estilo rede social: marcador vazio que preenche quando a palavra é dita.
const Salvar: React.FC<{ f: Extract<Figura, { tipo: "salvar" }> }> = ({ f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 11, stiffness: 160 } });
  const sai = interpolate(frame, [f.durationInFrames - 8, f.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const toque = f.fala ?? 10;
  const p = spring({ frame: frame - toque, fps, config: { damping: 8, stiffness: 220 } });
  const cheio = frame >= toque;
  const pulso = frame >= toque ? 1 + 0.18 * p * interpolate(frame - toque, [4, 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <>
    <Sequence from={toque} durationInFrames={14}><Audio src={staticFile("sfx/check.wav")} volume={0.35} /></Sequence>
    <div style={{ position: "absolute", left: ZONA.esq, width: LARG_UTIL, bottom: 1920 - ZONA.base + 20, display: "flex", justifyContent: "center", opacity: e * sai, transform: `scale(${(0.8 + 0.2 * e) * pulso})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#fff", borderRadius: 999, padding: "20px 38px 20px 26px", boxShadow: "0 18px 40px rgba(20,12,8,.3)" }}>
        <svg width="40" height="44" viewBox="0 0 24 26"><path d="M4 2h16v22l-8-6-8 6z" fill={cheio ? "#262626" : "none"} stroke="#262626" strokeWidth="2.2" strokeLinejoin="round" /></svg>
        <span style={{ fontFamily: inter, fontWeight: 700, fontSize: 40, color: "#262626" }}>{cheio ? "Salvo" : "Salvar"}</span>
      </div>
    </div>
    </>
  );
};

// Três exemplos práticos, desenhados: vídeo (celular com play), stories (anel com barrinhas) e print de conversa
// (dois balões). Cada painel entra com mola no instante da palavra, lado a lado sobre a parte baixa do quadro.
const Tres: React.FC<{ f: Extract<Figura, { tipo: "tres" }> }> = ({ f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sai = interpolate(frame, [f.durationInFrames - 10, f.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const C = "#E3B48C", B = "#FBF4EC";
  const desenhos = [
    <svg key="v" width="150" height="150" viewBox="0 0 150 150"><rect x="42" y="12" width="66" height="126" rx="14" fill="none" stroke={B} strokeWidth="4" /><rect x="52" y="24" width="46" height="90" rx="6" fill="rgba(251,244,236,.12)" /><path d="M68 56 L92 69 L68 82 Z" fill={C} /><rect x="56" y="122" width="38" height="4" rx="2" fill={B} opacity=".7" /><rect x="56" y="122" width="22" height="4" rx="2" fill={C} /></svg>,
    <svg key="s" width="150" height="150" viewBox="0 0 150 150"><rect x="30" y="18" width="26" height="5" rx="2.5" fill={C} /><rect x="62" y="18" width="26" height="5" rx="2.5" fill={B} opacity=".5" /><rect x="94" y="18" width="26" height="5" rx="2.5" fill={B} opacity=".5" /><circle cx="75" cy="86" r="42" fill="none" stroke={C} strokeWidth="5" /><circle cx="75" cy="86" r="30" fill="rgba(251,244,236,.18)" stroke={B} strokeWidth="2" /><circle cx="75" cy="78" r="10" fill={B} /><path d="M55 108 Q75 92 95 108" fill={B} /></svg>,
    <svg key="p" width="150" height="150" viewBox="0 0 150 150"><path d="M20 40 h70 a12 12 0 0 1 12 12 v22 a12 12 0 0 1 -12 12 h-50 l-14 12 v-12 h-6 a12 12 0 0 1 -12 -12 v-22 a12 12 0 0 1 12 -12 z" fill="rgba(251,244,236,.22)" stroke={B} strokeWidth="2" /><rect x="32" y="54" width="48" height="4" rx="2" fill={B} opacity=".8" /><rect x="32" y="66" width="30" height="4" rx="2" fill={B} opacity=".5" /><path d="M130 86 h-70 a12 12 0 0 0 -12 12 v22 a12 12 0 0 0 12 12 h50 l14 12 v-12 h6 a12 12 0 0 0 12 -12 v-22 a12 12 0 0 0 -12 -12 z" fill={C} /><rect x="60" y="100" width="56" height="4" rx="2" fill="#3E2A22" opacity=".7" /><rect x="60" y="112" width="34" height="4" rx="2" fill="#3E2A22" opacity=".45" /></svg>,
  ];
  const extras: Record<string, React.ReactNode> = {
    luz: <svg width="150" height="150" viewBox="0 0 150 150"><rect x="30" y="22" width="90" height="106" rx="8" fill="none" stroke={B} strokeWidth="4" /><line x1="75" y1="22" x2="75" y2="128" stroke={B} strokeWidth="3" opacity=".7" /><line x1="30" y1="75" x2="120" y2="75" stroke={B} strokeWidth="3" opacity=".7" /><circle cx="52" cy="52" r="14" fill={C} /><path d="M52 30 v-8 M52 74 v8 M30 52 h-8 M74 52 h8 M36 36 l-5 -5 M68 36 l5 -5 M36 68 l-5 5 M68 68 l5 5" stroke={C} strokeWidth="3" strokeLinecap="round" /></svg>,
    lente: <svg width="150" height="150" viewBox="0 0 150 150"><rect x="52" y="14" width="46" height="90" rx="10" fill="none" stroke={B} strokeWidth="4" /><circle cx="75" cy="40" r="7" fill={C} /><line x1="20" y1="40" x2="46" y2="40" stroke={C} strokeWidth="3" strokeDasharray="5 5" /><line x1="104" y1="40" x2="130" y2="40" stroke={C} strokeWidth="3" strokeDasharray="5 5" /><rect x="40" y="108" width="70" height="10" rx="3" fill={B} opacity=".6" /><rect x="44" y="120" width="62" height="10" rx="3" fill={B} opacity=".45" /><rect x="48" y="132" width="54" height="8" rx="3" fill={B} opacity=".3" /></svg>,
    mic: <svg width="150" height="150" viewBox="0 0 150 150"><rect x="58" y="18" width="34" height="66" rx="17" fill={C} /><path d="M44 72 a31 31 0 0 0 62 0" fill="none" stroke={B} strokeWidth="4" strokeLinecap="round" /><line x1="75" y1="104" x2="75" y2="126" stroke={B} strokeWidth="4" /><line x1="56" y1="128" x2="94" y2="128" stroke={B} strokeWidth="4" strokeLinecap="round" /><path d="M26 56 q-10 19 0 38 M124 56 q10 19 0 38" fill="none" stroke={B} strokeWidth="3" opacity=".55" strokeLinecap="round" /></svg>,
  };
  const padrao = [{ rotulo: "vídeo", desenho: "video" }, { rotulo: "stories", desenho: "stories" }, { rotulo: "print de conversa", desenho: "print" }] as const;
  const itens = f.itens ?? padrao;
  const desenhoDe = (d: string, i: number) => (d === "video" ? desenhos[0] : d === "stories" ? desenhos[1] : d === "print" ? desenhos[2] : extras[d] ?? desenhos[i]);
  return (
    <>
    {f.falas.map((fa, i) => (
      <Sequence key={`a${i}`} from={fa} durationInFrames={14}><Audio src={staticFile("sfx/positivo.wav")} volume={0.3} /></Sequence>
    ))}
    <div style={{ position: "absolute", left: ZONA.esq, width: LARG_UTIL, bottom: 1920 - ZONA.base, display: "flex", justifyContent: "center", gap: 18, opacity: sai }}>
      {f.falas.map((fa, i) => {
        const e = spring({ frame: Math.max(0, frame - fa), fps, config: { damping: 12, stiffness: 150 } });
        const vis = frame >= fa ? e : 0;
        return (
          <div key={i} style={{ ...VIDRO, borderRadius: 32, width: 272, height: 272, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: vis, transform: `translateY(${(1 - vis) * 60}px) scale(${0.85 + 0.15 * vis})` }}>
            {desenhoDe(itens[i].desenho, i)}
            <div style={{ ...CAPS, fontSize: 20, color: "#FBF4EC", textAlign: "center", lineHeight: 1.3, padding: "0 12px" }}>{itens[i].rotulo}</div>
          </div>
        );
      })}
    </div>
    </>
  );
};

// Calendário de um mês atrás da apresentadora: sobe de baixo pra cima na altura das headlines; a cada semana,
// os dois dias fixos acendem em caramelo. A camada `pessoa` (recorte) fica por cima, então ele parece atrás dela.
const PessoaRecortada: React.FC<{ src: string; grade: Grade; transformVideo: React.CSSProperties }> = ({ src, grade, transformVideo }) => {
  const camadas = [...(GRADES[grade].camada ? [GRADES[grade].camada!] : []), ...(GRADES[grade].camadas ?? [])];
  const mascara: React.CSSProperties = { maskImage: `url(${src})`, WebkitMaskImage: `url(${src})`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" };
  return (
    <AbsoluteFill style={{ ...transformVideo, pointerEvents: "none" }}>
      <Img src={src} style={{ width: "100%", height: "100%", filter: GRADES[grade].filtro }} />
      {camadas.map((c, i) => (
        <AbsoluteFill key={i} style={{ ...mascara, background: c.background, mixBlendMode: c.mix, opacity: c.opacity }} />
      ))}
    </AbsoluteFill>
  );
};

const Calendario: React.FC<{ f: Extract<Figura, { tipo: "calendario" }>; rosto: Rosto | null; frameAbs: number; transformVideo: React.CSSProperties; grade: Grade }> = ({ f, rosto, frameAbs, transformVideo, grade }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const sai = interpolate(frame, [f.durationInFrames - 12, f.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const topo = rosto ? rosto.topo : 300;
  const cel = 82, W = cel * 7, H = cel * 4 + 60 + 44;
  const top = Math.max(90, topo - 40 - H); // a grade fica logo acima da cabeça, na altura das headlines
  const left = Math.max(60, Math.min((rosto ? rosto.x : 540) - W / 2, 1080 - 60 - W));
  const cabecalho = ["S", "T", "Q", "Q", "S", "S", "D"];
  const pessoa = staticFile(`${f.pessoa}/f${String(frameAbs).padStart(5, "0")}.png`);
  return (
    <>
    <Sequence from={0} durationInFrames={30}><Audio src={staticFile("sfx/sopro.wav")} volume={0.3} /></Sequence>
    {[0, 1, 2, 3].map((w) => (
      <Sequence key={`t${w}`} from={f.fala + w * 10} durationInFrames={12}><Audio src={staticFile("sfx/tique.wav")} volume={0.25} /></Sequence>
    ))}
    <div style={{ position: "absolute", left, top, width: W, opacity: entra * sai, transform: `translateY(${(1 - entra) * 520}px)` }}>
      <div style={{ ...CAPS, fontSize: 22, color: "#FBF4EC", marginBottom: 18, paddingLeft: 8, textShadow: "0 2px 10px rgba(20,12,8,.4)" }}>um mês · dois dias fixos</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cel}px)`, gridAutoRows: `${cel}px`, gap: 0 }}>
        {cabecalho.map((d, i) => (
          <div key={`h${i}`} style={{ ...CAPS, fontSize: 22, color: "#FBF4EC", opacity: 0.75, display: "flex", alignItems: "center", justifyContent: "center", height: 44 }}>{d}</div>
        ))}
        {Array.from({ length: 28 }, (_, i) => {
          const semana = Math.floor(i / 7), dia = i % 7;
          const fixo = f.dias.includes(dia);
          const fr = frame - (f.fala + semana * 10);
          const a = fixo && fr >= 0 ? spring({ frame: fr, fps, config: { damping: 10, stiffness: 170 } }) : 0;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: -38 }}>
              <div style={{ width: cel - 12, height: cel - 12, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: redonda, fontWeight: 800, fontSize: 28, color: a > 0.5 ? "#3E2A22" : "#FBF4EC", background: a > 0 ? `rgba(227,180,140,${0.95 * a})` : "rgba(62,42,34,.34)", border: "1px solid rgba(251,244,236,.22)", transform: `scale(${1 + 0.45 * a * (fr < 10 ? 1 : 0.25)})`, boxShadow: a > 0 ? `0 0 ${30 * a}px rgba(227,180,140,${0.9 * a}), 0 0 ${70 * a}px rgba(227,180,140,${0.5 * a})` : undefined, zIndex: a > 0 ? 2 : 1, position: "relative", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
                {i + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    <PessoaRecortada src={pessoa} grade={grade} transformVideo={transformVideo} />
    </>
  );
};

// Feed em grade (3x3): o melhor post, em caramelo, sobe pro topo e ganha o alfinete.
const Fixar: React.FC<{ f: Extract<Figura, { tipo: "fixar" }> }> = ({ f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const sai = interpolate(frame, [f.durationInFrames - 10, f.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const m = spring({ frame: Math.max(0, frame - f.fala), fps, config: { damping: 13, stiffness: 110 } });
  const sobe = frame >= f.fala ? m : 0;
  const pin = spring({ frame: Math.max(0, frame - f.fala - 10), fps, config: { damping: 9, stiffness: 200 } });
  const cel = 150, gap = 10, W = cel * 3 + gap * 2;
  const left = ZONA.esq + (LARG_UTIL - W) / 2, top = ZONA.base - 60 - (cel * 3 + gap * 2);
  // o post escolhido sai da posição 7 (linha 3, coluna 1) e vai pra 0 (linha 1, coluna 1)
  const dy = -2 * (cel + gap) * sobe;
  return (
    <>
    <Sequence from={0} durationInFrames={20}><Audio src={staticFile("sfx/vidro.wav")} volume={0.25} /></Sequence>
    <Sequence from={f.fala} durationInFrames={20}><Audio src={staticFile("sfx/positivo.wav")} volume={0.3} /></Sequence>
    <Sequence from={f.fala + 10} durationInFrames={14}><Audio src={staticFile("sfx/check.wav")} volume={0.3} /></Sequence>
    <div style={{ position: "absolute", left, top, width: W, opacity: entra * sai, transform: `translateY(${(1 - entra) * 40}px)` }}>
      <div style={{ ...CAPS, fontSize: 20, color: "#FBF4EC", textAlign: "center", marginBottom: 14, textShadow: "0 2px 10px rgba(20,12,8,.4)" }}>o melhor, fixado no topo</div>
      <div style={{ position: "relative", width: W, height: cel * 3 + gap * 2 }}>
        {Array.from({ length: 9 }, (_, i) => {
          const r = Math.floor(i / 3), c = i % 3;
          const escolhido = i === 6;
          // os outros posts da coluna 1 descem uma casa quando o escolhido sobe
          const desce = !escolhido && c === 0 && r < 2 ? (cel + gap) * sobe : 0;
          return (
            <div key={i} style={{ position: "absolute", left: c * (cel + gap), top: r * (cel + gap) + desce + (escolhido ? dy : 0), width: cel, height: cel, borderRadius: 18, ...VIDRO, background: escolhido ? "rgba(227,180,140,.92)" : "rgba(62,42,34,.34)", border: escolhido ? "1px solid rgba(251,244,236,.6)" : VIDRO.border, zIndex: escolhido ? 2 : 1, display: "flex", alignItems: "center", justifyContent: "center", transform: escolhido ? `scale(${1 + 0.08 * sobe})` : undefined }}>
              {escolhido ? (
                <svg width="52" height="52" viewBox="0 0 24 24" style={{ opacity: pin, transform: `scale(${0.6 + 0.4 * pin}) rotate(${-30 * (1 - pin)}deg)` }}><path d="M16 3l5 5-4 1-3 3 1 5-2 1-3.5-3.5L5 19l-1-1 4.5-4.5L5 10l1-2 5 1 3-3z" fill="#3E2A22" /></svg>
              ) : (
                <div style={{ width: cel * 0.55, height: 6, borderRadius: 3, background: "rgba(251,244,236,.35)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
};

// Feed rolando lá pra baixo: uma coluna comprida de posts desliza rápido dentro de um celular, com fade nas pontas.
const Rolar: React.FC<{ f: Extract<Figura, { tipo: "rolar" }> }> = ({ f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const sai = interpolate(frame, [f.durationInFrames - 10, f.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = Math.max(0, frame - f.fala);
  const rol = interpolate(t, [0, 36], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const W = 360, H = 520, cel = 150, gap = 10;
  const left = ZONA.esq + (LARG_UTIL - W) / 2, top = ZONA.base - 60 - H;
  const total = 10 * (cel + gap);
  return (
    <>
    <Sequence from={f.fala} durationInFrames={30}><Audio src={staticFile("sfx/sopro.wav")} volume={0.3} /></Sequence>
    <div style={{ position: "absolute", left, top, width: W, opacity: entra * sai, transform: `translateY(${(1 - entra) * 40}px)` }}>
      <div style={{ ...CAPS, fontSize: 20, color: "#FBF4EC", textAlign: "center", marginBottom: 14, textShadow: "0 2px 10px rgba(20,12,8,.4)" }}>sem rolar lá pra baixo</div>
      <div style={{ ...VIDRO, borderRadius: 40, width: W, height: H, overflow: "hidden", position: "relative", padding: 14 }}>
        <div style={{ position: "absolute", left: 14, top: 14, width: W - 28, transform: `translateY(${-(total - H + 28) * rol}px)` }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ display: "flex", gap, marginBottom: gap }}>
              {[0, 1].map((c) => (
                <div key={c} style={{ width: (W - 28 - gap) / 2, height: cel, borderRadius: 16, background: i === 0 && c === 0 ? "rgba(227,180,140,.85)" : "rgba(251,244,236,.16)", border: "1px solid rgba(251,244,236,.2)" }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(62,42,34,.5) 0%, rgba(62,42,34,0) 18%, rgba(62,42,34,0) 82%, rgba(62,42,34,.5) 100%)", pointerEvents: "none" }} />
      </div>
    </div>
    </>
  );
};

// Fecho da marca: o creme do papel sobe por cima do vídeo e a logo entra com mola, com o @ embaixo.
const Logo: React.FC<{ f: Extract<Figura, { tipo: "logo" }> }> = ({ f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fundo = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const e = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 12, stiffness: 120 } });
  const texto = interpolate(frame, [22, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
    <AbsoluteFill style={{ background: "#F4EBE1", opacity: fundo }} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fundo }}>
      <Img src={staticFile("marca/logo.svg")} style={{ width: 620, height: 620, opacity: e, transform: `scale(${0.86 + 0.14 * e})` }} />
      <div style={{ ...CAPS, fontSize: 24, color: "#8D6545", marginTop: -40, opacity: texto, transform: `translateY(${(1 - texto) * 10}px)` }}>@tk.filmes</div>
    </AbsoluteFill>
    </>
  );
};

// Ícones desenhados (sem pílula): WhatsApp, anel de stories e vídeo com play.
const IconeAsset: React.FC<{ nome: "whatsapp" | "stories" | "play" }> = ({ nome }) => {
  if (nome === "whatsapp")
    return (
      <svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="62" fill="#25D366" /><path d="M70 28a40 40 0 0 0-34 61l-5 22 23-6A40 40 0 1 0 70 28z" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" /><path d="M57 54c2-3 5-3 6 0l3 7c1 2-2 4-3 6 3 6 8 10 14 13 2-1 4-4 6-3l7 4c2 1 2 4-1 7-9 7-27-2-36-20-3-6-2-10 4-14z" fill="#fff" /></svg>
    );
  if (nome === "stories")
    return (
      <svg width="140" height="140" viewBox="0 0 140 140"><defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#F9A03F" /><stop offset=".5" stopColor="#E1306C" /><stop offset="1" stopColor="#7B3FE4" /></linearGradient></defs><circle cx="70" cy="70" r="62" fill="none" stroke="url(#ig)" strokeWidth="8" /><circle cx="70" cy="70" r="48" fill="rgba(251,244,236,.22)" /><circle cx="70" cy="60" r="16" fill="#FBF4EC" /><path d="M38 104q32-34 64 0" fill="#FBF4EC" /><circle cx="108" cy="108" r="16" fill="#E3B48C" /><path d="M108 100v16M100 108h16" stroke="#3E2A22" strokeWidth="4" strokeLinecap="round" /></svg>
    );
  return (
    <svg width="140" height="140" viewBox="0 0 140 140"><rect x="38" y="10" width="64" height="120" rx="14" fill="rgba(62,42,34,.55)" stroke="#FBF4EC" strokeWidth="4" /><path d="M62 52L90 70L62 88Z" fill="#E3B48C" /><rect x="50" y="108" width="40" height="4" rx="2" fill="#FBF4EC" opacity=".6" /><rect x="50" y="108" width="14" height="4" rx="2" fill="#E3B48C" /></svg>
  );
};

const Assets: React.FC<{ f: Extract<Figura, { tipo: "assets" }> }> = ({ f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sai = interpolate(frame, [f.durationInFrames - 10, f.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
    {f.itens.map((it, i) => (
      <Sequence key={`a${i}`} from={it.fala} durationInFrames={14}><Audio src={staticFile("sfx/positivo.wav")} volume={0.28} /></Sequence>
    ))}
    <div style={{ position: "absolute", left: ZONA.esq, width: LARG_UTIL, bottom: 1920 - ZONA.base, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 70, opacity: sai }}>
      {f.itens.map((it, i) => {
        const e = frame >= it.fala ? spring({ frame: frame - it.fala, fps, config: { damping: 10, stiffness: 170 } }) : 0;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: Math.min(1, e), transform: `translateY(${(1 - e) * 50}px) scale(${0.6 + 0.4 * e})`, filter: "drop-shadow(0 10px 22px rgba(20,12,8,.4))" }}>
            <div style={{ transform: "scale(1.8)", transformOrigin: "center bottom", marginBottom: 70 }}><IconeAsset nome={it.icone} /></div>
            <div style={{ ...CAPS, fontSize: 21, color: "#FBF4EC", textAlign: "center", textShadow: "0 2px 10px rgba(20,12,8,.6)", maxWidth: 300 }}>{it.rotulo}</div>
          </div>
        );
      })}
    </div>
    </>
  );
};

// Comentário em movimento: avatar, @usuário, texto sendo digitado, coração; depois a resposta da TK, também digitada.
const Comentario: React.FC<{ f: Extract<Figura, { tipo: "comentario" }> }> = ({ f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const sai = interpolate(frame, [f.durationInFrames - 10, f.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ritmo = 1.3;
  const n1 = Math.max(0, Math.min(f.pergunta.length, Math.floor((frame - f.fala) / ritmo)));
  const fimP = f.fala + f.pergunta.length * ritmo;
  const n2 = Math.max(0, Math.min(f.resposta.length, Math.floor((frame - fimP - 14) / ritmo)));
  const coracao = frame >= fimP + 8 ? spring({ frame: frame - fimP - 8, fps, config: { damping: 8, stiffness: 200 } }) : 0;
  const L = (nome: string, cor: string) => (
    <div style={{ width: 64, height: 64, borderRadius: 32, background: cor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: redonda, fontWeight: 800, fontSize: 24, color: "#3E2A22", flex: "none" }}>{nome}</div>
  );
  const sombra = "0 2px 12px rgba(20,12,8,.7), 0 0 2px rgba(20,12,8,.6)";
  return (
    <>
    <Sequence from={f.fala} durationInFrames={Math.round(f.pergunta.length * ritmo) + 6}><Audio src={staticFile("sfx/tique.wav")} volume={0.12} loop /></Sequence>
    <div style={{ position: "absolute", left: ZONA.esq + 20, width: LARG_UTIL - 40, bottom: 1920 - ZONA.base, opacity: entra * sai, transform: `translateY(${(1 - entra) * 40}px)`, display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {L("C", "#FBF4EC")}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: redonda, fontWeight: 800, fontSize: 28, color: "#FBF4EC", textShadow: sombra }}>cliente</div>
          <div style={{ fontFamily: redonda, fontWeight: 600, fontSize: 38, lineHeight: 1.25, color: "#FBF4EC", textShadow: sombra }}>{f.pergunta.slice(0, n1)}<span style={{ opacity: frame % 16 < 8 && n1 < f.pergunta.length ? 1 : 0 }}>|</span></div>
        </div>
        <svg width="34" height="34" viewBox="0 0 24 24" style={{ marginTop: 10, transform: `scale(${coracao})`, opacity: Math.min(1, coracao) }}><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.800-8 11-8 11z" fill="#E1306C" /></svg>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginLeft: 70, opacity: n2 > 0 ? 1 : 0 }}>
        {L("TK", "#E3B48C")}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: redonda, fontWeight: 800, fontSize: 28, color: "#E3B48C", textShadow: sombra }}>tk.filmes</div>
          <div style={{ fontFamily: redonda, fontWeight: 600, fontSize: 38, lineHeight: 1.25, color: "#FBF4EC", textShadow: sombra }}>{f.resposta.slice(0, n2)}</div>
        </div>
      </div>
    </div>
    </>
  );
};

// Porta abrindo atrás da apresentadora: batente, folha em perspectiva girando e luz quente saindo pela abertura.
const Porta: React.FC<{ f: Extract<Figura, { tipo: "porta" }>; rosto: Rosto | null; frameAbs: number; transformVideo: React.CSSProperties; grade: Grade }> = ({ f, rosto, frameAbs, transformVideo, grade }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const sai = interpolate(frame, [f.durationInFrames - 12, f.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const abre = frame >= f.fala ? spring({ frame: frame - f.fala, fps, config: { damping: 20, stiffness: 55 } }) : 0;
  const W = 860, H = 1180;
  const cx = 540;
  const left = Math.max(ZONA.esq, Math.min(cx - W / 2, ZONA.dir - W));
  const top = ZONA.topo + 60;
  const pessoa = staticFile(`${f.pessoa}/f${String(frameAbs).padStart(5, "0")}.png`);
  return (
    <>
    <Sequence from={f.fala} durationInFrames={40}><Audio src={staticFile("sfx/sopro.wav")} volume={0.3} /></Sequence>
    <div style={{ position: "absolute", left, top, width: W, height: H, opacity: entra * sai, perspective: 1600 }}>
      <div style={{ position: "absolute", inset: -26, borderRadius: 18, background: "#3E2A22", boxShadow: "0 30px 80px rgba(20,12,8,.45)" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #FFF3DA 0%, #F7D9A8 55%, #E3B48C 100%)`, opacity: 0.25 + 0.75 * abre }} />
      <div style={{ position: "absolute", left: "10%", right: "10%", top: "20%", bottom: "-6%", background: "radial-gradient(ellipse at 50% 70%, rgba(255,236,200,.95), rgba(255,236,200,0) 70%)", opacity: abre, filter: "blur(20px)" }} />
      <div style={{ position: "absolute", inset: 0, transformOrigin: "left center", transform: `rotateY(${-70 * abre}deg)`, background: "linear-gradient(90deg, #7A5538 0%, #8D6545 60%, #9A7050 100%)", borderRadius: 6, boxShadow: "0 0 40px rgba(20,12,8,.4)" }}>
        <div style={{ position: "absolute", left: 80, right: 80, top: 90, height: 400, border: "7px solid rgba(62,42,34,.35)", borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 80, right: 80, top: 570, height: 480, border: "7px solid rgba(62,42,34,.35)", borderRadius: 6 }} />
        <div style={{ position: "absolute", right: 44, top: 600, width: 38, height: 38, borderRadius: 19, background: "#E3B48C", boxShadow: "0 4px 8px rgba(20,12,8,.4)" }} />
      </div>
    </div>
    <PessoaRecortada src={pessoa} grade={grade} transformVideo={transformVideo} />
    </>
  );
};

const FiguraNaTela: React.FC<{ f: Figura; rosto: Rosto | null; frameAbs: number; transformVideo: React.CSSProperties; grade: Grade }> = ({ f, rosto, frameAbs, transformVideo, grade }) =>
  f.tipo === "cartao" ? <Cartao f={f} rosto={rosto} />
  : f.tipo === "chips" ? <Chips f={f} rosto={rosto} />
  : f.tipo === "headline" ? <Headline f={f} rosto={rosto} frameAbs={frameAbs} transformVideo={transformVideo} />
  : f.tipo === "titulo" ? <Titulo f={f} rosto={rosto} />
  : f.tipo === "sutil" ? <Sutil f={f} rosto={rosto} />
  : f.tipo === "stickers" ? <Stickers f={f} rosto={rosto} />
  : f.tipo === "salvar" ? <Salvar f={f} />
  : f.tipo === "frase" ? <Frase f={f} rosto={rosto} />
  : f.tipo === "tres" ? <Tres f={f} />
  : f.tipo === "calendario" ? <Calendario f={f} rosto={rosto} frameAbs={frameAbs} transformVideo={transformVideo} grade={grade} />
  : f.tipo === "fixar" ? <Fixar f={f} />
  : f.tipo === "rolar" ? <Rolar f={f} />
  : f.tipo === "logo" ? <Logo f={f} />
  : f.tipo === "assets" ? <Assets f={f} />
  : f.tipo === "comentario" ? <Comentario f={f} />
  : f.tipo === "porta" ? <Porta f={f} rosto={rosto} frameAbs={frameAbs} transformVideo={transformVideo} grade={grade} />
  : <Fecho f={f} />;

// Posição do rosto no frame atual (px), suavizada com média de ±0,35 s sobre os pontos do rastreio.
// Posição do rosto no instante: média ponderada (gaussiana, sigma 0,3 s) dos pontos do rastreio, avaliada a cada
// frame, então o movimento é contínuo e sem degraus mesmo com a amostragem de 0,2 s do detector.
const rostoNoFrame = (pontos: PontoRosto[], frame: number, fps: number): Rosto | null => {
  if (!pontos.length) return null;
  const t = frame / fps, sigma = 0.3;
  let sw = 0, x = 0, y = 0, w = 0, topo = 0;
  for (const p of pontos) {
    const d = (p.t - t) / sigma;
    if (Math.abs(d) > 3) continue;
    const g = Math.exp(-0.5 * d * d);
    sw += g; x += g * p.x; y += g * p.y; w += g * p.w; topo += g * p.topo;
  }
  if (sw === 0) { const q = pontos.reduce((m, p) => (Math.abs(p.t - t) < Math.abs(m.t - t) ? p : m)); return { x: q.x * 1080, y: q.y * 1920, w: q.w * 1080, topo: q.topo * 1920 }; }
  return { x: (x / sw) * 1080, y: (y / sw) * 1920, w: (w / sw) * 1080, topo: (topo / sw) * 1920 };
};

export const Voltei: React.FC<VolteiProps> = ({ clipes, textos, figuras = [], legendas = [], zooms = [], reenquadramentos = [], rosto = [], etapa, grade = "A", estilo = "sans", fonte = "voltei/IMG_0511.mp4" }) => {
  const cor = etapa !== "cortes";
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Aproximação rápida (etapa "completo"): entra com mola e volta devagar.
  let escala = 1;
  if (etapa === "completo") {
    for (const z of zooms) {
      const f = frame - z.from;
      if (f >= 0 && f < z.durationInFrames) {
        const entra = spring({ frame: f, fps, config: { damping: 200, stiffness: 300 } });
        const volta = interpolate(f, [z.durationInFrames * 0.55, z.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        escala = 1 + (z.escala - 1) * entra * volta;
      }
    }
  }
  // altura típica do topo da cabeça (percentil 15: só nos momentos mais altos a legenda encosta no cabelo)
  TOPO_CABECA = rosto.length ? [...rosto.map((q) => q.topo * 1920)].sort((x, y) => x - y)[Math.floor(rosto.length * 0.15)] : null;
  QUEIXO_FIXO = rosto.length ? Math.max(...rosto.map((q) => q.y * 1920 + (q.w * 1080 * 1.3) / 2)) : null;
  const rostoAgora = rostoNoFrame(rosto, frame, fps);
  // Reenquadramento ativo: zoom leve e deslocamento pra manter o rosto no centro, com rampa de 12 frames.
  let re = 0, reEscala = 1;
  for (const r of reenquadramentos) {
    const f = frame - r.from;
    if (f >= -12 && f < r.durationInFrames + 12) {
      const entra = interpolate(f, [-12, 0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const sai = interpolate(f, [r.durationInFrames - 12, r.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      re = Math.max(re, Math.min(entra, sai)); reEscala = r.escala;
    }
  }
  const alvoX = rostoAgora ? rostoAgora.x : 540, alvoY = rostoAgora ? rostoAgora.y : 800;
  const zoomTotal = escala * (1 + (reEscala - 1) * re);
  // o zoom cresce a partir do rosto (ele não sai do lugar) e o quadro desliza 60% do caminho até centralizar
  const tx = re * (540 - alvoX) * 0.6;
  // respiro: o topo da cabeça nunca sobe além de 70 px da borda, mesmo com o zoom
  const topoRosto = rostoAgora ? rostoAgora.topo : 300;
  const tyMin = (alvoY - topoRosto) * (zoomTotal - 1) - (topoRosto - 70);
  const ty = Math.max(re * (780 - alvoY) * 0.6, re > 0 ? tyMin : -Infinity);
  const origem = re > 0 ? `${alvoX}px ${alvoY}px` : "50% 42%";
  const transformVideo: React.CSSProperties = { scale: zoomTotal, translate: `${tx}px ${ty}px`, transformOrigin: origem };
  return (
    <AbsoluteFill style={{ background: "#1c130f" }}>
      <AbsoluteFill style={transformVideo}>
      {clipes.map((c) => (
        <Sequence key={c.id} from={c.from} durationInFrames={c.durationInFrames} name={`Take ${c.id}`}>
          <Tomada clipe={c} cor={cor} grade={grade} fonte={fonte} />
        </Sequence>
      ))}
      </AbsoluteFill>
      {cor ? <Vinheta /> : null}
      {cor ? <Grao /> : null}
      {etapa === "completo"
        ? zooms.map((z, i) => (
            <Sequence key={`z${i}`} from={z.from} durationInFrames={12} name="Sopro">
              <Audio src={staticFile("sfx/sopro.wav")} volume={0.22} />
            </Sequence>
          ))
        : null}
      {etapa === "completo"
        ? figuras.map((f, i) => (
            <Sequence key={`f${i}`} from={f.from} durationInFrames={f.durationInFrames} name={`Figura · ${f.tipo}`}>
              <FiguraNaTela f={f} rosto={rostoAgora} frameAbs={frame} transformVideo={transformVideo} grade={grade} />
            </Sequence>
          ))
        : null}
      {etapa === "completo"
        ? legendas.map((l, i) => (
            <Sequence key={`l${i}`} from={l.from} durationInFrames={l.durationInFrames} name="Legenda">
              <LegendaNormal l={l} rosto={rostoAgora} />
            </Sequence>
          ))
        : null}
      {etapa === "completo"
        ? textos.map((t, i) => (
            <Sequence key={i} from={t.from} durationInFrames={t.durationInFrames} name={`Texto · ${t.forte}`}>
              <TextoNaTela t={t} estilo={estilo} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
