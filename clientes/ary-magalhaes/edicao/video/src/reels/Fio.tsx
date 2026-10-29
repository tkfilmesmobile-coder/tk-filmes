import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Veu } from "./Texto";
import { BODONI, COR, POPPINS, REVELA, SUAVE, clamp, TEMA } from "./marca";

// Estrutura do fio (reel "mechas antes ou depois"): o fio visto de perto, como um tubo com volume, e a
// cutícula como telhas sobrepostas na superfície. Passos (segundos da montagem):
// entra · alinha (a selagem alinha e fecha) · brilho · cuticula (rótulo) · abre (as mechas abrem a cutícula) ·
// cor (o pigmento entra no córtex) · ordem (qual vem primeiro) · certo · sai.
// Fica no cartão de vidro bege na faixa de baixo (y 1090–1500), nunca em cima do rosto.
export type PassosFio = { entra: number; alinha: number; cuticula: number; brilho: number; abre: number; cor: number; ordem: number; certo: number; sai: number };

const W = 820;
const H = 290;
const N = 14; // telhas da cutícula
const X0 = 40;
const PASSO = 52;
const CY = 150;
const MEIO = 54; // meia espessura do fio
const TOPO = CY - MEIO;
const BASE = CY + MEIO;
const FIM = X0 + N * PASSO + 10;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Fio: React.FC<{ p: PassosFio; inicio: number }> = ({ p, inicio }) => {
  const s = useCurrentFrame() / 30 + inicio;
  const prog = (de: number, dur: number, ease = SUAVE) => interpolate(s, [de, de + dur], [0, 1], { ...clamp, easing: ease });
  const entra = prog(p.entra, 0.5, REVELA);
  const sai = prog(p.sai - 0.35, 0.35);
  const ordem = prog(p.ordem, 0.45);
  const brilho = prog(p.brilho, 0.7);
  const corP = prog(p.cor + 0.3, 1.4);
  const fases: [number, string, string][] = [
    [p.entra, "Selagem", "alinha e fecha a cutícula"],
    [p.abre, "Mechas", "precisam abrir a cutícula"],
    [p.cor, "Mechas", "a nova cor entra no fio"],
    [p.ordem, "Qual vem primeiro?", "o que a Ary recomenda"],
  ];
  const atual = fases.filter(([t]) => s >= t).length - 1;
  const troca = atual >= 0 ? prog(fases[atual][0], 0.35, REVELA) : 0;

  // quanto cada telha está levantada (0 = deitada e alinhada; 1 = aberta)
  const lev = (i: number) => {
    const atraso = i * 0.045;
    const solta = 0.32 + 0.3 * rnd(i); // antes da selagem: telhas desalinhadas
    const alinha = prog(p.alinha + atraso, 0.45);
    const abre = prog(p.abre + atraso, 0.5, REVELA);
    return solta * (1 - alinha) + (0.85 + 0.15 * rnd(i + 7)) * abre;
  };

  const telhas = Array.from({ length: N }, (_, i) => {
    const x = X0 + i * PASSO;
    const L = lev(i);
    const curva = 20;
    const ang = 38 * L; // a borda da telha levanta pra fora do fio
    const comp = 30 + 8 * L;
    return (
      <g key={i}>
        {/* sombra da fresta entre as telhas: cresce quando abrem */}
        <path d={`M${x + 3},${TOPO + 2} C${x + 3 + curva},${TOPO + 30} ${x + 3 + curva},${BASE - 30} ${x + 3},${BASE - 2}`} fill="none" stroke="#2B1A10" strokeWidth={1.5 + 6 * L} opacity={0.18 + 0.5 * L} strokeLinecap="round" />
        {/* borda da telha (linha clara) */}
        <path d={`M${x},${TOPO + 1} C${x + curva},${TOPO + 30} ${x + curva},${BASE - 30} ${x},${BASE - 1}`} fill="none" stroke="#F3E2C3" strokeWidth={2.2} opacity={0.55 + 0.3 * (1 - L)} strokeLinecap="round" />
        {/* aba de cima e de baixo que se levanta na silhueta */}
        {[false, true].map((baixo) => (
          <g key={String(baixo)} transform={`translate(${x} ${baixo ? BASE : TOPO}) scale(1 ${baixo ? -1 : 1}) rotate(${-ang})`}>
            <path d={`M-2,0 C${comp * 0.3},-5 ${comp * 0.7},-7 ${comp},-4 L${comp + 2},5 C${comp * 0.6},6 ${comp * 0.3},8 -2,10 Z`} fill="url(#aba)" stroke={COR.cafe} strokeWidth={1.2} strokeLinejoin="round" opacity={0.35 + 0.65 * Math.min(1, L * 2.2)} />
          </g>
        ))}
      </g>
    );
  });

  const pigmento = Array.from({ length: 46 }, (_, i) => {
    const de = p.cor + 0.035 * i + rnd(i) * 0.25;
    const k = prog(de, 0.85, (x) => 1 - Math.pow(1 - x, 2));
    if (k <= 0 || k >= 1) return null;
    const baixo = i % 3 === 0;
    const x = X0 + 16 + ((i * 37) % (N - 1)) * PASSO + 10;
    const y0 = baixo ? H + 6 : -6;
    const alvo = CY + (baixo ? 18 : -18);
    const y = y0 + (alvo - y0) * k;
    return <circle key={i} cx={x + Math.sin(k * 5 + i) * 5} cy={y} r={9 - 3 * k} fill="#F6D88E" opacity={Math.sin(k * Math.PI) * 0.95} filter="url(#luz)" />;
  });

  const varre = interpolate(s, [p.brilho, p.brilho + 1.1], [-160, W + 160], clamp);
  const rotulo = prog(p.cuticula, 0.4, REVELA);
  const rotCortex = prog(p.cor + 0.6, 0.4, REVELA);
  const xi = X0 + 11 * PASSO; // telha apontada pelo rótulo

  return (
    <AbsoluteFill style={{ opacity: entra * (1 - sai) }}>
      {/* sem cartão (pedido da Talyta, 2026-10-24): a base do vídeo escurece de leve e cada elemento tem sombra suave */}
     <Veu x={80} y={1090} w={W} h={410} />
      <div style={{ position: "absolute", left: 80, top: 1090 + (1 - entra) * 60, width: W, height: 410, filter: TEMA.filtro }}>
        
        {atual >= 0 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", opacity: troca, translate: `0px ${(1 - troca) * 10}px`, whiteSpace: "nowrap", textShadow: SOMBRA_TXT }}>
            <span style={{ fontFamily: BODONI, fontSize: 60, color: TEMA.titulo }}>{fases[atual][1]}</span>
            <span style={{ fontFamily: POPPINS, fontSize: 28, fontWeight: 500, color: TEMA.texto, display: "block", marginTop: 2 }}>{fases[atual][2]}</span>
          </div>
        ) : null}
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", left: 0, top: 128, opacity: 1 - ordem }}>
          <defs>
            <linearGradient id="tubo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={mix("#5A3E2B", "#A87E44", corP)} />
              <stop offset="0.28" stopColor={mix("#D9B88A", "#F7E2B0", corP)} />
              <stop offset="0.45" stopColor={mix("#A97F56", "#E6C47F", corP)} />
              <stop offset="0.8" stopColor={mix("#7E5A3C", "#C29A58", corP)} />
              <stop offset="1" stopColor={mix("#5A3E2B", "#9C7742", corP)} />
            </linearGradient>
            <linearGradient id="aba" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={mix("#B88D62", "#E8C98E", corP)} />
              <stop offset="1" stopColor={mix("#E5CDA6", "#F6E3B8", corP)} />
            </linearGradient>
            <linearGradient id="faixa" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
              <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.7} />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </linearGradient>
            <filter id="luz" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="sombra" x="-10%" y="-30%" width="120%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.45" />
            </filter>
            <clipPath id="clipTubo">
              <rect x={X0 - 16} y={TOPO} width={FIM - X0 + 16} height={2 * MEIO} rx={MEIO} />
            </clipPath>
          </defs>
          {/* o fio */}
          <rect x={X0 - 16} y={TOPO} width={FIM - X0 + 16} height={2 * MEIO} rx={MEIO} fill="url(#tubo)" filter="url(#sombra)" />
          <g clipPath="url(#clipTubo)">{telhas.map((t, i) => <g key={i}>{t.props.children.slice(0, 2)}</g>)}</g>
          {telhas.map((t, i) => <g key={`a${i}`}>{t.props.children[2]}</g>)}
          {/* reflexo do fio: fica mais forte depois da selagem e some quando a cutícula abre */}
          <rect x={X0} y={TOPO + 18} width={FIM - X0 - 30} height={7} rx={3.5} fill="#FFF6E6" opacity={0.18 + 0.5 * brilho * (1 - prog(p.abre, 0.5))} clipPath="url(#clipTubo)" />
          <g clipPath="url(#clipTubo)" style={{ mixBlendMode: "screen" }}>
            <rect x={varre - 80} y={TOPO - 20} width={160} height={2 * MEIO + 40} fill="url(#faixa)" transform="skewX(-20)" />
          </g>
          {pigmento}
          <g opacity={rotulo}>
            <line x1={xi + 14} y1={TOPO - 12} x2={xi + 34} y2={30} stroke={TEMA.acento} strokeWidth={2} />
            <circle cx={xi + 14} cy={TOPO - 10} r={5} fill={TEMA.acento} />
            <text x={xi + 40} y={30} fontFamily={POPPINS} fontWeight={600} fontSize={22} letterSpacing={4} fill={TEMA.titulo}>CUTÍCULA</text>
          </g>
          <g opacity={rotCortex}>
            <line x1={X0 + 2 * PASSO + 26} y1={CY + 6} x2={X0 + 2 * PASSO + 20} y2={BASE + 46} stroke={TEMA.acento} strokeWidth={2} />
            <circle cx={X0 + 2 * PASSO + 26} cy={CY + 6} r={5} fill="#FFF6E6" stroke={TEMA.acento} strokeWidth={2} />
            <text x={X0 + 2 * PASSO + 34} y={BASE + 62} fontFamily={POPPINS} fontWeight={600} fontSize={20} letterSpacing={3} fill={TEMA.titulo}>CÓRTEX · ONDE A COR FICA</text>
          </g>
        </svg>
        <div style={{ position: "absolute", left: 60, right: 20, top: 178, opacity: ordem, textShadow: SOMBRA_TXT }}>
          <Linha ok={false} a="Selagem" b="Mechas" nota="a selagem fecha o que a cor precisa abrir" vis={prog(p.ordem + 0.15, 0.45, REVELA)} />
          <div style={{ height: 22 }} />
          <Linha ok a="Mechas" b="Selagem" nota="com o cabelo saudável" vis={prog(p.certo, 0.45, REVELA)} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Linha: React.FC<{ ok: boolean; a: string; b: string; nota: string; vis: number }> = ({ ok, a, b, nota, vis }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: vis, translate: `${(1 - vis) * -30}px 0px` }}>
    <div
      style={{
        width: 76,
        height: 76,
        borderRadius: 38,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ok ? COR.dourado : "transparent",
        border: ok ? "none" : `3px solid ${COR.terracota}`,
        scale: String(0.6 + 0.4 * vis),
      }}
    >
      <svg width={36} height={36} viewBox="0 0 36 36">
        {ok ? (
          <path d="M7 19 L15 27 L30 10" fill="none" stroke="#FFFFFF" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 9 L27 27 M27 9 L9 27" fill="none" stroke={COR.terracota} strokeWidth={4.5} strokeLinecap="round" />
        )}
      </svg>
    </div>
    <div>
      <div style={{ fontFamily: BODONI, fontSize: 46, color: TEMA.titulo, opacity: ok ? 1 : 0.75, lineHeight: 1.05, textDecoration: ok ? "none" : "line-through", textDecorationThickness: 2 }}>
        {a} <span style={{ fontFamily: POPPINS, fontSize: 34, color: TEMA.acento }}>→</span> {b}
      </div>
      <div style={{ fontFamily: POPPINS, fontSize: 25, fontWeight: 500, color: TEMA.texto, marginTop: 4 }}>{nota}</div>
    </div>
  </div>
);

const SOMBRA_TXT = TEMA.sombraTxt;

function mix(a: string, b: string, k: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, "0")).join("");
}
