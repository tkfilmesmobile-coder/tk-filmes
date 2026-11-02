// Quadro "Bastidor TK" (2026-10-30, v2 · linha premium): dois formatos com os brutos reais dos clientes,
// na estética da marca (marrom do site, creme, caramelo só em detalhe, Instrument Serif), com pouca coisa na tela.
//  · AntesDepois ("Sem direção × Com direção"): takes que não deram certo, em tela cheia e som original → o vídeo pronto.
//  · AntesDepoisEdicao ("Antes × Depois da edição"): o bruto e o editado lado a lado, a frase fixa da TK e o logo.
// Cada episódio é src/bastidor-<id>.json; mídia em public/bastidor/<id>/ (scripts em tk-filmes/quadros/bastidor/scripts/).
import { AbsoluteFill, Easing, Img, Loop, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Audio } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadRound } from "@remotion/google-fonts/Nunito";
import { loadFont as loadInst } from "@remotion/google-fonts/InstrumentSerif";

const { fontFamily: _mont } = loadFont("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] });
const sans = "Nunito, sans-serif";
// fonte sóbria e arredondada (pedido da Talyta, 2026-10-30): Nunito nos títulos e na frase
const { fontFamily: serif } = loadRound("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin", "latin-ext"] });
const serifIt = serif;
// serifa itálica da referência "resultado em 3, 2, 1" (só no formato 1)
const { fontFamily: inst } = loadInst("italic", { subsets: ["latin", "latin-ext"] });

const COR = { fundo: "#1E130E", fundo2: "#2B1A14", creme: "#F3E9DF", creme2: "rgba(243,233,223,.62)", caramelo: "#CD9365", fio: "rgba(243,233,223,.22)" };
const FPS = 24;
const s = (seg: number) => Math.round(seg * FPS);
const suave = Easing.bezier(0.2, 0.7, 0.1, 1);
const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const FRASE_TK = "Cada corte, imagem e detalhe precisa dar continuidade ao trabalho realizado antes e durante a gravação, respeitando a identidade visual do cliente e fortalecendo sua marca.";

export type Falha = { src: string; ini: number; dur: number; take: string; rotulo: string; comp?: number }; // comp: segundos no compilado (o fim do trecho)
export type Lado = { antes: { src: string; ini: number }; depois: { src: string; ini: number }; dur: number };
export type Episodio = {
  cliente: string; peca: string; falhas: Falha[];
  final: { src: string; ini: number; dur: number };
  quadros: string[]; lado: Lado;
};

// ---------- acabamento comum: grão e vinheta ----------
const Grao: React.FC<{ forca?: number }> = ({ forca = 0.1 }) => {
  const f = useCurrentFrame(); const seed = (f * 31) % 89;
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: forca, pointerEvents: "none" }}>
      <svg width="100%" height="100%"><filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter={`url(#g${seed})`} /></svg>
    </AbsoluteFill>
  );
};
const Vinheta: React.FC<{ forca?: number }> = ({ forca = 0.5 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 90% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(14,8,5,${forca}) 100%)` }} />
);

// título que sobe palavra a palavra, como no site
const Titulo: React.FC<{ texto: string; tam: number; atraso?: number; italico?: boolean; cor?: string; largura?: number; passo?: number; linha?: number }> = ({ texto, tam, atraso = 0, italico, cor = COR.creme, largura = 920, passo = 2, linha = 1.08 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ fontFamily: italico ? serifIt : serif, fontWeight: 700, fontSize: tam, lineHeight: linha, color: cor, textAlign: "center", maxWidth: largura, letterSpacing: "-0.01em" }}>
      {texto.split(" ").map((p, i) => {
        const k = interpolate(f, [atraso + i * passo, atraso + i * passo + 14], [0, 1], { ...lim, easing: suave });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - k) * 105}%)` }}>{p}&nbsp;</span>
          </span>
        );
      })}
    </div>
  );
};

const Rotulo: React.FC<{ texto: string; cor?: string; tam?: number }> = ({ texto, cor = COR.caramelo, tam = 22 }) => (
  <div style={{ fontFamily: sans, fontWeight: 600, fontSize: tam, letterSpacing: "0.34em", color: cor, textTransform: "uppercase" }}>{texto}</div>
);

// cartela de abertura de cada parte: rótulo pequeno + título grande + fio que cresce
const Cartela: React.FC<{ topo: string; titulo: string; sub?: string; dur: number }> = ({ topo, titulo, sub, dur }) => {
  const f = useCurrentFrame();
  const fio = interpolate(f, [6, 22], [0, 1], { ...lim, easing: suave });
  const sai = interpolate(f, [dur - 6, dur], [1, 0], lim);
  const topoO = interpolate(f, [0, 10], [0, 1], lim);
  return (
    <AbsoluteFill style={{ background: COR.fundo, alignItems: "center", justifyContent: "center", opacity: sai }}>
      <div style={{ opacity: topoO }}><Rotulo texto={topo} /></div>
      <div style={{ marginTop: 30 }}><Titulo texto={titulo} tam={112} atraso={4} passo={4} /></div>
      <div style={{ width: 140 * fio, height: 2, background: COR.caramelo, marginTop: 40 }} />
      {sub ? <div style={{ marginTop: 34, fontFamily: sans, fontWeight: 500, fontSize: 28, color: COR.creme2, opacity: interpolate(f, [14, 26], [0, 1], lim) }}>{sub}</div> : null}
      <Grao forca={0.08} />
    </AbsoluteFill>
  );
};

const Assinatura: React.FC<{ frase: string; dur: number; tam?: number }> = ({ frase, dur, tam = 84 }) => {
  const f = useCurrentFrame();
  const logo = interpolate(f, [18, 32], [0, 1], { ...lim, easing: suave });
  return (
    <AbsoluteFill style={{ background: COR.fundo, alignItems: "center", justifyContent: "center", opacity: interpolate(f, [dur - 8, dur], [1, 0], lim) }}>
      <Titulo texto={frase} tam={tam} atraso={2} passo={2} largura={880} />
      <Img src={staticFile("marca/logo-creme.svg")} style={{ height: 64, marginTop: 70, opacity: logo, transform: `translateY(${(1 - logo) * 16}px)` }} />
      <Grao forca={0.08} />
    </AbsoluteFill>
  );
};

// ---------- formato 1: sem direção × com direção ----------
const Take: React.FC<{ fa: Falha; i: number; total: number; id: string; n: number }> = ({ fa, i, total, id, n }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, n], [1.06, 1.0], { ...lim, easing: suave });
  const leg = interpolate(f, [3, 12, n - 4, n], [0, 1, 1, 0], lim);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <OffthreadVideo src={staticFile(`bastidor/${id}/${fa.src}`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.72) contrast(.94) brightness(.96)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(14,8,5,.45) 0%, rgba(14,8,5,0) 18%, rgba(14,8,5,0) 62%, rgba(14,8,5,.78) 100%)" }} />
      <Vinheta forca={0.45} />
      {/* canto de cima: contagem discreta */}
      <div style={{ position: "absolute", top: 120, left: 80, right: 80, display: "flex", justifyContent: "space-between", opacity: 0.85 }}>
        <Rotulo texto="sem direção" cor={COR.creme} tam={20} />
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 20, letterSpacing: "0.2em", color: COR.creme, fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")} — {String(total).padStart(2, "0")}</div>
      </div>
      {/* legenda: o take e o que deu errado, em serifa itálica */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 330, opacity: leg, transform: `translateY(${(1 - leg) * 14}px)` }}>
        <Rotulo texto={fa.take} cor={COR.caramelo} tam={20} />
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 58, lineHeight: 1.08, color: COR.creme, marginTop: 12 }}>{fa.rotulo}</div>
      </div>
      <Grao forca={0.12} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ id: string; src: string; ini: number; n: number; etiqueta: string }> = ({ id, src, ini, n, etiqueta }) => {
  const f = useCurrentFrame();
  const et = interpolate(f, [6, 16, 46, 58], [0, 1, 1, 0], lim);
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(`bastidor/${id}/${src}`)} startFrom={s(ini)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: et }}>
        <div style={{ padding: "12px 24px", borderRadius: 999, background: "rgba(30,19,14,.55)", backdropFilter: "blur(8px)" }}><Rotulo texto={etiqueta} cor={COR.creme} tam={20} /></div>
      </div>
      <AbsoluteFill style={{ background: COR.fundo, opacity: interpolate(f, [n - 8, n], [0, 1], lim) }} />
    </AbsoluteFill>
  );
};

// ---------- formato 1, v3 (2026-10-30, ref. TikTok "resultado em 3, 2, 1"): ----------
// compilado rápido dos erros (som original) com a frase no centro "com / marketing estratégico / em:" e a contagem 3, 2, 1
// → clarão de luz → o resultado. Sem cartela, sem legenda de take, sem assinatura, sem "já!" (ela tirou).
// Erros com imagem lavada (desbotada, sem cor), não cinza; headline forte com etiqueta dourada; efeitos sonoros fortes.
const PICO = 0.3; // o resultado entra no pico do clarão
const DOURADO = "#F6D58E";
// cada erro entra INTEIRO (com a pausa e a reação depois): cortes em cima um do outro não passam a sensação de estar perdido
const compilado = (ep: Episodio) => ep.falhas.map((fa) => { const d = Math.min(fa.dur, fa.comp ?? fa.dur); return { src: fa.src, ini: fa.ini + fa.dur - d, n: s(d) }; });
const sombraTexto = "0 4px 24px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.5)";

const Entra: React.FC<{ atraso: number; children: React.ReactNode }> = ({ atraso, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const k = spring({ frame: f - atraso, fps, config: { damping: 14, stiffness: 160 } });
  return <div style={{ opacity: interpolate(f - atraso, [0, 5], [0, 1], lim), transform: `translateY(${(1 - k) * 26}px) scale(${0.9 + 0.1 * k})` }}>{children}</div>;
};

const Numero: React.FC<{ n: string; dur: number }> = ({ n, dur }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const k = spring({ frame: f, fps, config: { damping: 11, stiffness: 190 } });
  const sai = interpolate(f, [dur - 4, dur], [1, 0], lim);
  return <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 380, lineHeight: 0.85, color: "#FFF8EE", opacity: sai, transform: `scale(${1.4 - 0.4 * k})`, filter: `blur(${(1 - sai) * 6}px)`,
    textShadow: "0 0 50px rgba(255,236,200,.55), 0 0 110px rgba(246,213,142,.35), 0 8px 30px rgba(0,0,0,.55)" }}>{n}</div>;
};

// headline com batida: entra grande e assenta, com um tranco leve
const Batida: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const k = spring({ frame: f, fps, config: { damping: 9, stiffness: 260 } });
  const tranco = interpolate(f, [0, 3, 6], [0, 6, 0], lim) * Math.sin(f * 2.4);
  return <div style={{ opacity: interpolate(f, [0, 2], [0, 1], lim), transform: `translateX(${tranco}px) scale(${1.12 - 0.12 * k})` }}>{children}</div>;
};

// um erro do compilado: imagem lavada (pouca cor, contraste baixo), com uma escurecida curta na entrada e na saída (respiro entre um erro e outro)
const RESPIRO = 5; // quadros
const Erro: React.FC<{ src: string; ini: number; n: number; primeiro: boolean }> = ({ src, ini, n, primeiro }) => {
  const f = useCurrentFrame();
  const luz = interpolate(f, [0, primeiro ? 1 : RESPIRO, n - RESPIRO, n], [primeiro ? 1 : 0, 1, 1, 0], lim);
  return (
    <AbsoluteFill style={{ transform: "scale(1.04)", opacity: luz }}>
      <OffthreadVideo src={staticFile(src)} startFrom={s(ini)} volume={(q) => interpolate(q, [0, 3, n - 3, n], [primeiro ? 0.85 : 0, 0.85, 0.85, 0], lim)}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.38) contrast(.78) brightness(1.06)" }} />
      {/* pretos levantados, como filme desbotado */}
      <AbsoluteFill style={{ background: "rgba(232,224,214,.10)" }} />
    </AbsoluteFill>
  );
};

const Clarao: React.FC<{ n: number }> = ({ n }) => {
  const f = useCurrentFrame();
  const pico = s(PICO);
  const luz = interpolate(f, [0, pico, n], [0, 1, 0], { ...lim, easing: Easing.inOut(Easing.quad) });
  const raio = interpolate(f, [0, pico, n], [20, 120, 190], lim);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <AbsoluteFill style={{ opacity: luz, background: `radial-gradient(circle at 50% 46%, #FFFFFF 0%, #FFF6E6 ${raio * 0.35}%, rgba(255,196,128,.85) ${raio * 0.6}%, rgba(205,147,101,0) ${raio}%)` }} />
      {/* no pico a tela fica quase toda branca */}
      <AbsoluteFill style={{ opacity: interpolate(f, [pico - 4, pico, pico + 7], [0, 0.92, 0], lim), background: "#FFF7EA" }} />
      {/* vazamento de luz quente na lateral */}
      <AbsoluteFill style={{ opacity: luz * 0.8, background: "linear-gradient(100deg, rgba(255,170,90,0) 30%, rgba(255,170,90,.75) 70%, rgba(255,230,190,.9) 100%)" }} />
    </AbsoluteFill>
  );
};

export const AntesDepois: React.FC<{ ep: Episodio; id: string }> = ({ ep, id }) => {
  const f = useCurrentFrame();
  let t = 0;
  const seq = compilado(ep).map((c) => { const de = t; t += c.n; return { ...c, de }; });
  const L = t;                       // fim do compilado
  const res = L;                     // o clarão sai do último erro e o resultado entra no pico dele
  const flash = res - s(PICO), nFlash = s(PICO) + s(0.55);
  const conta = L - s(3);            // a frase só aparece quando a contagem começa
  const contagem = ["3", "2", "1"].map((n, i) => ({ n, de: conta + s(i) }));
  const fraseO = interpolate(f, [L - 4, L], [1, 0], lim);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* compilado dos erros */}
      {seq.map((c, i) => (
        <Sequence key={i} from={c.de} durationInFrames={c.n}><Erro src={`bastidor/${id}/${c.src}`} ini={c.ini} n={c.n} primeiro={i === 0} /></Sequence>
      ))}
      <Sequence durationInFrames={L}><Vinheta forca={0.3} /></Sequence>
      {/* escurece o centro só durante a contagem, pra frase ler bem */}
      <Sequence from={conta} durationInFrames={L - conta}><AbsoluteFill style={{ background: "radial-gradient(ellipse 95% 50% at 50% 42%, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 100%)", opacity: fraseO }} /></Sequence>
      {/* frase no centro + contagem */}
      <Sequence from={conta} durationInFrames={L - conta}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: fraseO, paddingBottom: 120 }}>
          {/* número em cima, grande e com brilho */}
          <div style={{ height: 330, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {contagem.map(({ n, de }) => (
              <Sequence key={n} from={de - conta} durationInFrames={s(1)} layout="none"><Numero n={n} dur={s(1)} /></Sequence>
            ))}
          </div>
          {/* frase pedida pela Talyta, em caixa alta, em duas linhas bem juntas */}
          <Batida>
            <div style={{ marginTop: 26, fontFamily: serif, fontWeight: 900, fontSize: 86, lineHeight: 0.94, letterSpacing: "-0.01em", color: COR.creme, textShadow: sombraTexto, whiteSpace: "nowrap" }}>
              <div>COM <span style={{ color: DOURADO }}>MARKETING</span></div>
              <div><span style={{ color: DOURADO }}>ESTRATÉGICO</span> EM</div>
            </div>
          </Batida>
        </AbsoluteFill>
      </Sequence>
      {/* efeitos sonoros: impacto na headline, tique forte em cada número, sopro subindo pro clarão */}
      <Sequence from={conta} durationInFrames={s(1.5)}><Audio src={staticFile("sfx/impacto.wav")} volume={1} /></Sequence>
      {contagem.map(({ n, de }) => <Sequence key={`t${n}`} from={de} durationInFrames={s(0.5)}><Audio src={staticFile("sfx/tique.wav")} volume={1} /></Sequence>)}
      <Sequence from={flash - s(0.5)} durationInFrames={s(1.5)}><Audio src={staticFile("sfx/sopro.wav")} volume={1} /></Sequence>
      {/* o resultado */}
      <Sequence from={res} durationInFrames={s(ep.final.dur)}>
        <OffthreadVideo src={staticFile(`bastidor/${id}/${ep.final.src}`)} startFrom={s(ep.final.ini)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
      {/* clarão de luz que revela o resultado */}
      <Sequence from={flash} durationInFrames={nFlash}>
        <Clarao n={nFlash} />
        <Audio src={staticFile("sfx/brilho.wav")} volume={1} />
      </Sequence>
      <Grao forca={0.08} />
    </AbsoluteFill>
  );
};
export const duracaoAntesDepois = (ep: Episodio) => compilado(ep).reduce((a, c) => a + c.n, 0) + s(ep.final.dur);

// ---------- formato 2: pós-produção × resultado final (v3, 2026-10-30) ----------
// Na linha da referência do Pinterest: dois vídeos sobrepostos em 3D. Atrás e menor, a "Pós-produção" (timelapse dos
// takes da peça, acelerado); na frente e em destaque, o "Resultado final" com sombra e reflexo. Poeira brilhando na luz.
// Embaixo, a frase fixa da TK (pequena), o logo e a linha do tempo de verdade: quadros do vídeo pronto + a onda real do som.
// Sem abertura e sem fechamento: só a linha do tempo, do começo ao fim do trecho.
type EpEdicao = Episodio & { onda: number[]; posDur?: number; pos?: { bruto: string; pronto: string; offset: number; dur: number } };
const ruido = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

const Poeira: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* feixe de luz quente vindo do alto à direita */}
      <AbsoluteFill style={{ background: "linear-gradient(118deg, rgba(255,214,170,0) 30%, rgba(255,214,170,.07) 48%, rgba(255,214,170,0) 66%)", mixBlendMode: "screen" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="bokeh"><feGaussianBlur stdDeviation="3.5" /></filter>
          <filter id="fino"><feGaussianBlur stdDeviation="0.6" /></filter>
        </defs>
        {Array.from({ length: 80 }).map((_, i) => {
          const r1 = ruido(i), r2 = ruido(i + 101), r3 = ruido(i + 202), r4 = ruido(i + 303);
          const grande = i % 7 === 0;
          const x = ((r1 * 1180 + Math.sin(t * 0.25 + i) * 30 + t * (6 + r3 * 10)) % 1180) - 50;
          const y = ((r2 * 2000 - t * (14 + r4 * 26)) % 2000 + 2000) % 2000 - 40;
          // mais poeira dentro do feixe (diagonal)
          const noFeixe = Math.max(0, 1 - Math.abs((x / 1080) - (1 - y / 1920) * 0.9 - 0.15) * 2.4);
          const pisca = 0.55 + 0.45 * Math.sin(t * (1 + r3 * 2) + i * 3);
          const o = (grande ? 0.16 : 0.5) * pisca * (0.25 + noFeixe * 0.75);
          return <circle key={i} cx={x} cy={y} r={grande ? 9 + r4 * 10 : 1.2 + r4 * 2.4} fill="#FFE6C9" opacity={o} filter={grande ? "url(#bokeh)" : "url(#fino)"} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Etiqueta: React.FC<{ texto: string; destaque?: boolean }> = ({ texto, destaque }) => (
  <div style={{ position: "absolute", top: 22, left: 22, padding: "10px 18px", borderRadius: 999, background: destaque ? "rgba(205,147,101,.92)" : "rgba(20,12,8,.6)",
    fontFamily: sans, fontWeight: 800, fontSize: 19, letterSpacing: "0.18em", color: destaque ? COR.fundo : COR.creme, textTransform: "uppercase" }}>{texto}</div>
);

export const AntesDepoisEdicao: React.FC<{ ep: EpEdicao; id: string }> = ({ ep, id }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const L = ep.lado; const t = f / fps;
  const prog = Math.min(1, t / L.dur);
  const boia = Math.sin(t * 0.9) * 6, boia2 = Math.sin(t * 0.7 + 1.3) * 5;
  // tudo acima da área que o Instagram cobre com legenda e botões (último ~quarto da tela)
  const B = { x: 60, y: 200, w: 450, h: 800 };     // pós-produção (atrás, mas em destaque)
  const F = { x: 420, y: 240, w: 540, h: 960 };    // resultado final (frente)
  const TL = { x: 70, y: 1262, w: 940 };
  // timelapse da pós-produção: o bruto acelerado e, a cada ciclo, a edição aplicada por uma linha de luz
  const P = ep.pos ?? { bruto: "bruto.mp4", pronto: "pronto.mp4", offset: 0, dur: L.dur };
  const VEL = 4, CICLO = s(1.5);
  const loopN = Math.floor(s(P.dur) / VEL);
  const fase = (f % CICLO) / CICLO;
  const wipe = interpolate(fase, [0.18, 0.62], [0, 100], { ...lim, easing: suave });
  const ETAPAS = ["corte", "cor", "legenda", "efeitos", "som"];
  const etapa = ETAPAS[Math.floor(f / CICLO) % ETAPAS.length];
  const tc = (seg: number) => `${String(Math.floor(seg / 60)).padStart(2, "0")}:${String(Math.floor(seg % 60)).padStart(2, "0")}`;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 60% at 62% 32%, #3A251C 0%, ${COR.fundo2} 38%, ${COR.fundo} 78%)` }}>
      {/* topo */}
      <div style={{ position: "absolute", top: 120, left: 90, right: 90, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 21, letterSpacing: "0.32em", color: COR.caramelo }}>BASTIDOR TK</div>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 23, color: COR.creme2 }}>{ep.cliente} · {ep.peca}</div>
      </div>
      <AbsoluteFill style={{ perspective: 1800 }}>
        {/* pós-produção: atrás, em destaque — a edição sendo aplicada no bruto, acelerada */}
        <div style={{ position: "absolute", left: B.x, top: B.y + boia2, width: B.w, height: B.h, borderRadius: 26, overflow: "hidden",
          transform: "rotateY(13deg) translateZ(-30px)", transformOrigin: "100% 50%", filter: "brightness(.9)",
          boxShadow: `0 0 0 1.5px rgba(243,233,223,.3), 0 36px 70px -20px rgba(0,0,0,.75)` }}>
          <Loop durationInFrames={loopN}>
            <OffthreadVideo src={staticFile(`bastidor/${id}/${P.bruto}`)} muted playbackRate={VEL} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
              <OffthreadVideo src={staticFile(`bastidor/${id}/${P.pronto}`)} muted playbackRate={VEL} startFrom={s(P.offset)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </Loop>
          {/* linha de luz que aplica a edição */}
          {wipe > 0 && wipe < 100 ? <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wipe}%`, width: 3, background: COR.creme, boxShadow: "0 0 18px 4px rgba(255,226,196,.75)" }} /> : null}
          <Etiqueta texto="Pós-produção" />
          {/* etapa sendo aplicada */}
          <div style={{ position: "absolute", left: 22, bottom: 22, padding: "9px 16px", borderRadius: 999, background: "rgba(20,12,8,.62)", display: "flex", alignItems: "center", gap: 10,
            fontFamily: sans, fontWeight: 800, fontSize: 18, letterSpacing: "0.16em", color: COR.creme, textTransform: "uppercase" }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, background: COR.caramelo, opacity: 0.5 + 0.5 * Math.sin(f / 3) }} />+ {etapa}
          </div>
          <div style={{ position: "absolute", right: 22, bottom: 26, fontFamily: sans, fontWeight: 800, fontSize: 18, letterSpacing: "0.12em", color: "rgba(243,233,223,.75)" }}>{VEL}×</div>
        </div>
        {/* reflexo do resultado final no "chão" */}
        <div style={{ position: "absolute", left: F.x, top: F.y + F.h + 8 + boia, width: F.w, height: 110, borderRadius: 30, overflow: "hidden", opacity: 0.2,
          transform: "rotateY(-7deg) scaleY(-1)", transformOrigin: "0% 50%",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,0) 85%)", maskImage: "linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,0) 85%)", filter: "blur(2px)" }}>
          <OffthreadVideo src={staticFile(`bastidor/${id}/${L.depois.src}`)} muted startFrom={s(L.depois.ini)} style={{ width: "100%", height: F.h, objectFit: "cover", position: "absolute", bottom: 0 }} />
        </div>
        {/* resultado final: na frente, em destaque */}
        <div style={{ position: "absolute", left: F.x, top: F.y + boia, width: F.w, height: F.h, borderRadius: 30, overflow: "hidden",
          transform: "rotateY(-7deg)", transformOrigin: "0% 50%",
          boxShadow: "0 0 0 1.5px rgba(243,233,223,.35), 0 50px 90px -24px rgba(0,0,0,.8), 0 0 60px rgba(205,147,101,.12)" }}>
          <OffthreadVideo src={staticFile(`bastidor/${id}/${L.depois.src}`)} startFrom={s(L.depois.ini)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {/* brilho de vidro passando */}
          <AbsoluteFill style={{ background: `linear-gradient(115deg, rgba(255,255,255,0) ${30 + Math.sin(t * 0.5) * 20}%, rgba(255,255,255,.08) ${40 + Math.sin(t * 0.5) * 20}%, rgba(255,255,255,0) ${52 + Math.sin(t * 0.5) * 20}%)` }} />
          <Etiqueta texto="Resultado final" destaque />
        </div>
      </AbsoluteFill>
      <Poeira />
      {/* frase da TK, pequena, e o logo */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 1512, textAlign: "center", fontFamily: sans, fontWeight: 600, fontSize: 28, lineHeight: 1.42, color: "rgba(243,233,223,.86)" }}>{FRASE_TK}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1652, display: "flex", justifyContent: "center" }}>
        <Img src={staticFile("marca/logo-creme.svg")} style={{ height: 40, opacity: 0.95 }} />
      </div>
      {/* linha do tempo: quadros reais do vídeo + onda real do som + cursor */}
      <div style={{ position: "absolute", left: TL.x, top: TL.y, width: TL.w, padding: "18px 20px 16px", borderRadius: 22, background: "rgba(14,8,5,.55)", boxShadow: `0 0 0 1px ${COR.fio}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontWeight: 700, fontSize: 18, letterSpacing: "0.16em", color: COR.creme2, marginBottom: 12, fontVariantNumeric: "tabular-nums" }}>
          <span>LINHA DO TEMPO</span><span>{tc(t)} / {tc(L.dur)}</span>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 3, height: 104, borderRadius: 10, overflow: "hidden" }}>
            {ep.quadros.map((q) => <Img key={q} src={staticFile(`bastidor/${id}/quadros/${q}`)} style={{ flex: 1, height: "100%", objectFit: "cover" }} />)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 2, height: 46, marginTop: 8 }}>
            {ep.onda.map((v, i) => <div key={i} style={{ flex: 1, height: `${10 + v * 90}%`, borderRadius: 2, background: i / ep.onda.length < prog ? COR.caramelo : "rgba(205,147,101,.38)" }} />)}
          </div>
          <div style={{ position: "absolute", top: -8, bottom: -6, width: 3, borderRadius: 2, background: COR.creme, left: `${prog * 100}%`, boxShadow: "0 0 14px rgba(255,230,201,.9)" }} />
        </div>
      </div>
      <Vinheta forca={0.4} />
      <Grao forca={0.06} />
    </AbsoluteFill>
  );
};
export const duracaoEdicao = (ep: { lado: Lado }) => s(ep.lado.dur);