import { COR } from "./marca";

// O fio de cabelo visto de perto (tubo com volume + telhas da cutícula), usado pelas animações explicativas.
// Tudo por estado (0..1), sem tempo: a cena calcula o estado a cada quadro.
export type EstadoFio = {
  lev?: (i: number) => number; // quanto cada telha está levantada
  tint?: number; // 0 castanho → 1 loiro
  brilho?: number; // reflexo no alto do fio
  varre?: number | null; // posição x da varredura de brilho
  camada?: number; // película do protetor térmico (0..1, cresce da esquerda pra direita)
  gotas?: number; // água: fio inchado + gotinhas
  frizz?: number; // fios arrepiados saindo da silhueta
  pontas?: number; // ponta espigada (direita)
  poros?: number; // pontinhos escuros no fio (poroso)
  nucleo?: number; // córtex aparecendo por dentro (saúde)
  quebra?: number; // telhas arrancadas pelo atrito
};

export const W = 820;
const N = 14;
const PASSO = 52;
const X0 = 40;
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function mix(a: string, b: string, k: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, k))).toString(16).padStart(2, "0")).join("");
}

// desenha o fio centrado em cy; id deixa os gradientes únicos quando há dois fios na mesma cena
export const FioSvg: React.FC<{ e: EstadoFio; cy: number; id: string; meio?: number }> = ({ e, cy, id, meio = 54 }) => {
  const g = e.gotas ?? 0;
  const M = meio * (1 + 0.14 * g);
  const TOPO = cy - M;
  const BASE = cy + M;
  const FIM = X0 + N * PASSO + 10;
  const tint = e.tint ?? 0;
  const lev = e.lev ?? (() => 0);
  const quebra = e.quebra ?? 0;
  const molhado = (c: string) => mix(c, "#4A3324", 0.35 * g);
  const telhas = Array.from({ length: N }, (_, i) => {
    const x = X0 + i * PASSO;
    const L = lev(i);
    const ang = 38 * L;
    const comp = 30 + 8 * L;
    const some = quebra > rnd(i + 31) ? Math.min(1, (quebra - rnd(i + 31)) * 4) : 0; // telha arrancada
    return { x, L, ang, comp, some };
  });
  const pontas = e.pontas ?? 0;
  return (
    <g>
      <defs>
        <linearGradient id={`tubo${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={molhado(mix("#5A3E2B", "#A87E44", tint))} />
          <stop offset="0.28" stopColor={molhado(mix("#D9B88A", "#F7E2B0", tint))} />
          <stop offset="0.45" stopColor={molhado(mix("#A97F56", "#E6C47F", tint))} />
          <stop offset="0.8" stopColor={molhado(mix("#7E5A3C", "#C29A58", tint))} />
          <stop offset="1" stopColor={molhado(mix("#5A3E2B", "#9C7742", tint))} />
        </linearGradient>
        <linearGradient id={`aba${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={mix("#B88D62", "#E8C98E", tint)} />
          <stop offset="1" stopColor={mix("#E5CDA6", "#F6E3B8", tint)} />
        </linearGradient>
        <linearGradient id={`faixa${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.7} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`nucleo${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF1C9" />
          <stop offset="1" stopColor="#E2B866" />
        </radialGradient>
        <filter id={`sombra${id}`} x="-10%" y="-30%" width="120%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        <filter id={`luz${id}`} x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`clip${id}`}>
          <rect x={X0 - 16} y={TOPO} width={FIM - X0 + 16} height={2 * M} rx={M} />
        </clipPath>
      </defs>
      {/* película do protetor (atrás e na frente do fio, levemente maior) */}
      {(e.camada ?? 0) > 0 ? (
        <g opacity={Math.min(1, (e.camada ?? 0) * 1.5)}>
          <rect x={X0 - 28} y={TOPO - 14} width={(FIM - X0 + 40) * (e.camada ?? 0)} height={2 * M + 28} rx={M + 14} fill="rgba(234,217,184,0.16)" stroke={COR.champanhe} strokeWidth={2} filter={`url(#luz${id})`} />
          <rect x={X0 - 28} y={TOPO - 14} width={(FIM - X0 + 40) * (e.camada ?? 0)} height={2 * M + 28} rx={M + 14} fill="rgba(234,217,184,0.12)" stroke="rgba(234,217,184,0.9)" strokeWidth={1.5} />
        </g>
      ) : null}
      <rect x={X0 - 16} y={TOPO} width={FIM - X0 + 16} height={2 * M} rx={M} fill={`url(#tubo${id})`} filter={`url(#sombra${id})`} />
      {/* córtex por dentro (saúde) */}
      {(e.nucleo ?? 0) > 0 ? (
        <g clipPath={`url(#clip${id})`} opacity={e.nucleo}>
          <rect x={X0 - 16} y={TOPO} width={FIM - X0 + 16} height={2 * M} fill="rgba(30,20,12,0.45)" />
          <rect x={X0 + 6} y={cy - M * 0.42} width={FIM - X0 - 30} height={M * 0.84} rx={M * 0.42} fill={`url(#nucleo${id})`} />
          <rect x={X0 + 6} y={cy - M * 0.42} width={FIM - X0 - 30} height={M * 0.84} rx={M * 0.42} fill="#FFE6A8" opacity={0.6} filter={`url(#luz${id})`} />
        </g>
      ) : null}
      <g clipPath={`url(#clip${id})`}>
        {telhas.map((t, i) => (
          <g key={i} opacity={1 - 0.7 * t.some}>
            <path d={`M${t.x + 3},${TOPO + 2} C${t.x + 23},${TOPO + 30} ${t.x + 23},${BASE - 30} ${t.x + 3},${BASE - 2}`} fill="none" stroke="#2B1A10" strokeWidth={1.5 + 6 * t.L} opacity={0.18 + 0.5 * t.L} strokeLinecap="round" />
            <path d={`M${t.x},${TOPO + 1} C${t.x + 20},${TOPO + 30} ${t.x + 20},${BASE - 30} ${t.x},${BASE - 1}`} fill="none" stroke="#F3E2C3" strokeWidth={2.2} opacity={(0.55 + 0.3 * (1 - t.L)) * (1 - (e.nucleo ?? 0) * 0.6)} strokeLinecap="round" />
          </g>
        ))}
        {/* poros */}
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={X0 + 10 + rnd(i + 3) * (FIM - X0 - 30)} cy={cy - M * 0.7 + rnd(i + 70) * M * 1.4} r={2 + 3 * rnd(i + 5)} fill="#2B1A10" opacity={(e.poros ?? 0) * 0.55} />
        ))}
      </g>
      {/* abas (telhas na silhueta), voando quando o atrito arranca */}
      {telhas.map((t, i) =>
        [false, true].map((baixo) => {
          const voa = t.some;
          const dx = voa * (30 + 40 * rnd(i + (baixo ? 9 : 4)));
          const dy = voa * (baixo ? 1 : -1) * (25 + 30 * rnd(i + 2));
          return (
            <g key={`${i}${baixo}`} transform={`translate(${t.x + dx} ${(baixo ? BASE : TOPO) + dy}) scale(1 ${baixo ? -1 : 1}) rotate(${-t.ang - voa * 60})`} opacity={(0.35 + 0.65 * Math.min(1, t.L * 2.2)) * (1 - voa)}>
              <path d={`M-2,0 C${t.comp * 0.3},-5 ${t.comp * 0.7},-7 ${t.comp},-4 L${t.comp + 2},5 C${t.comp * 0.6},6 ${t.comp * 0.3},8 -2,10 Z`} fill={`url(#aba${id})`} stroke={COR.cafe} strokeWidth={1.2} strokeLinejoin="round" />
            </g>
          );
        }),
      )}
      {/* frizz: fiozinhos arrepiados */}
      {Array.from({ length: 16 }, (_, i) => {
        const x = X0 + 30 + rnd(i + 40) * (FIM - X0 - 60);
        const baixo = i % 2 === 1;
        const y0 = baixo ? BASE - 4 : TOPO + 4;
        const h = (26 + 30 * rnd(i + 8)) * (e.frizz ?? 0);
        const s = baixo ? 1 : -1;
        return <path key={i} d={`M${x},${y0} C${x + 10},${y0 + s * h * 0.4} ${x - 12},${y0 + s * h * 0.7} ${x + 6},${y0 + s * h}`} fill="none" stroke={mix("#C9A475", "#F1D9A6", tint)} strokeWidth={1.6} opacity={Math.min(1, (e.frizz ?? 0) * 2)} strokeLinecap="round" />;
      })}
      {/* ponta espigada */}
      {pontas > 0 ? (
        <g opacity={Math.min(1, pontas * 2)}>
          {[-1, 0, 1].map((k) => (
            <path key={k} d={`M${FIM - 30},${cy + k * M * 0.45} Q${FIM + 10},${cy + k * M * 0.6} ${FIM + 20 + 40 * pontas},${cy + k * (M * 0.6 + 34 * pontas)}`} fill="none" stroke={mix("#B48A5A", "#E6C68C", tint)} strokeWidth={10 - 2 * Math.abs(k)} strokeLinecap="round" />
          ))}
        </g>
      ) : null}
      {/* reflexo e varredura */}
      <rect x={X0} y={TOPO + 18} width={FIM - X0 - 30} height={7} rx={3.5} fill="#FFF6E6" opacity={0.18 + 0.5 * (e.brilho ?? 0)} clipPath={`url(#clip${id})`} />
      {e.varre != null ? (
        <g clipPath={`url(#clip${id})`} style={{ mixBlendMode: "screen" }}>
          <rect x={e.varre - 80} y={TOPO - 20} width={160} height={2 * M + 40} fill={`url(#faixa${id})`} transform="skewX(-20)" />
        </g>
      ) : null}
      {/* gotas d'água */}
      {g > 0
        ? Array.from({ length: 12 }, (_, i) => {
            const x = X0 + 30 + rnd(i + 90) * (FIM - X0 - 60);
            const y = (i % 2 ? BASE : TOPO) + (i % 2 ? 6 : -6) + Math.sin(i) * 3;
            const r = (6 + 5 * rnd(i + 13)) * g;
            return (
              <g key={i} opacity={g}>
                <path d={`M${x},${y - r * 1.5} C${x + r},${y - r * 0.2} ${x + r},${y + r} ${x},${y + r} C${x - r},${y + r} ${x - r},${y - r * 0.2} ${x},${y - r * 1.5} Z`} fill="rgba(200,225,240,0.55)" stroke="rgba(255,255,255,0.8)" strokeWidth={1.2} />
                <circle cx={x - r * 0.3} cy={y} r={r * 0.25} fill="#FFFFFF" opacity={0.8} />
              </g>
            );
          })
        : null}
    </g>
  );
};

// pontas do fio, pra rótulos apontarem
export const GEO = { X0, PASSO, N, FIM: X0 + N * PASSO + 10 };
