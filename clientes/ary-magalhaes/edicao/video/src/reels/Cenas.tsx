import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FioSvg, GEO, W, rnd } from "./FioBase";
import { Veu } from "./Texto";
import { BODONI, BODONI_IT, COR, GILDA, POPPINS, REVELA, SUAVE, clamp, TEMA } from "./marca";

// Animações explicativas dos reels da Ary. Regras (Talyta, 2026-10-24): sem cartão; o desenho fica solto sobre o
// vídeo com sombra suave, a faixa de baixo escurece de leve; sempre na faixa y 1090–1500, nunca em cima do rosto.
// Cada cena recebe "passos" (segundos da montagem) e o início da Sequence.
export type Passos = Record<string, number>;
type Cena = React.FC<{ p: Passos; inicio: number }>;

const SOMBRA_TXT = TEMA.sombraTxt;
// sem esmaecido no fundo (recusado em 2026-10-24): só sombra leve em volta de cada elemento

function usaTempo(p: Passos, inicio: number) {
  const s = useCurrentFrame() / 30 + inicio;
  const prog = (de: number | undefined, dur: number, ease: (x: number) => number = SUAVE) =>
    de == null ? 0 : interpolate(s, [de, de + dur], [0, 1], { ...clamp, easing: ease });
  const entra = prog(p.entra, 0.5, REVELA);
  const sai = prog(p.sai - 0.35, 0.35);
  return { s, prog, entra, sai };
}

// palco comum: escurece a base, sombra suave em tudo, título que troca por fase
const Palco: React.FC<{ entra: number; sai: number; fases: [number, string, string][]; s: number; children: React.ReactNode; semTitulo?: number }> = ({ entra, sai, fases, s, children, semTitulo = 0 }) => {
  const atual = fases.filter(([t]) => s >= t).length - 1;
  const troca = atual >= 0 ? interpolate(s, [fases[atual][0], fases[atual][0] + 0.35], [0, 1], { ...clamp, easing: REVELA }) : 0;
  return (
    <AbsoluteFill style={{ opacity: entra * (1 - sai) }}>
     <Veu x={80} y={1090} w={W} h={410} />
      <div style={{ position: "absolute", left: 80, top: 1090 + (1 - entra) * 60, width: W, height: 410, filter: TEMA.filtro }}>
        {atual >= 0 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", opacity: troca * (1 - semTitulo), translate: `0px ${(1 - troca) * 10}px`, whiteSpace: "nowrap", textShadow: SOMBRA_TXT }}>
            <span style={{ fontFamily: BODONI, fontSize: 60, color: TEMA.titulo }}>{fases[atual][1]}</span>
            <span style={{ fontFamily: POPPINS, fontSize: 28, fontWeight: 500, color: TEMA.texto, display: "block", marginTop: 2 }}>{fases[atual][2]}</span>
          </div>
        ) : null}
        {children}
      </div>
    </AbsoluteFill>
  );
};

const Rotulo: React.FC<{ x: number; y: number; tx: number; ty: number; texto: string; vis: number; ancora?: "start" | "end" }> = ({ x, y, tx, ty, texto, vis, ancora = "start" }) => (
  <g opacity={vis}>
    <line x1={x} y1={y} x2={tx} y2={ty + (ty < y ? 6 : -18)} stroke={TEMA.acento} strokeWidth={2} />
    <circle cx={x} cy={y} r={5} fill={TEMA.acento} />
    <text x={tx + (ancora === "start" ? 6 : -6)} y={ty} textAnchor={ancora} fontFamily={POPPINS} fontWeight={600} fontSize={22} letterSpacing={4} fill={TEMA.titulo}>
      {texto}
    </text>
  </g>
);

// ── reel 2 · protetor térmico: a camada segura o calor; sem ela, poroso, frizz e espigado
export const CenaProtetor: Cena = ({ p, inicio }) => {
  const { s, prog, entra, sai } = usaTempo(p, inicio);
  const camada = prog(p.camada, 0.9) * (1 - prog(p.sem, 0.5));
  const calor = prog(p.calor, 0.4);
  const sem = prog(p.sem, 0.5);
  const lev = (i: number) => 0.85 * prog((p.poroso ?? 0) + i * 0.03, 0.5, REVELA);
  // ondas de calor descendo; batem na camada (param e somem) ou no fio (sem protetor)
  const ondas = Array.from({ length: 6 }, (_, i) => {
    const ciclo = ((s - (p.calor ?? 0)) * 0.9 + i / 6) % 1;
    if (s < (p.calor ?? 0) || ciclo < 0) return null;
    const x = 110 + i * 120;
    const parada = camada > 0.5 ? 70 : 104;
    const y = -10 + ciclo * (parada + 10);
    const op = calor * Math.sin(Math.min(1, ciclo) * Math.PI) * (1 - prog(p.sai - 1.2, 0.6));
    return <path key={i} d={`M${x},${y - 34} q10,8 0,17 q-10,8 0,17`} fill="none" stroke={camada > 0.5 ? "#F0A15F" : "#E27A45"} strokeWidth={4} strokeLinecap="round" opacity={op} />;
  });
  const palavras: [number | undefined, string][] = [[p.poroso, "poroso"], [p.frizz, "frizz"], [p.espigado, "espigado"]];
  return (
    <Palco entra={entra} sai={sai} s={s} fases={[[p.entra, "Protetor térmico", "faz uma camada na fibra do cabelo"], [p.calor, "Protetor térmico", "protege do calor da chapinha e do secador"], [p.sem, "Sem protetor", ""]]}>
      <svg viewBox={`0 0 ${W} 290`} width={W} height={290} style={{ position: "absolute", left: 0, top: 128 }}>
        <g transform="translate(0 20)">{ondas}</g>
        <FioSvg id="pt" cy={160} e={{ camada, lev, poros: prog(p.poroso, 0.5), frizz: prog(p.frizz, 0.6), pontas: prog(p.espigado, 0.6), brilho: 0.6 * (1 - sem) }} />
        <Rotulo x={GEO.X0 + 4 * GEO.PASSO} y={160 + 68} tx={GEO.X0 + 4 * GEO.PASSO + 30} ty={278} texto="CAMADA PROTETORA" vis={prog(p.camada + 0.5, 0.4, REVELA) * (1 - sem)} />
      </svg>
      {/* sem protetor: as três palavras acendem quando ela fala */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 96, display: "flex", justifyContent: "center", gap: 34, opacity: sem, textShadow: SOMBRA_TXT }}>
        {palavras.map(([t, w]) => {
          const v = prog(t, 0.35, REVELA);
          return (
            <span key={w} style={{ fontFamily: BODONI_IT, fontSize: 46, color: TEMA.titulo, opacity: v > 0.5 ? 1 : 0.35, scale: String(0.9 + 0.1 * v) }}>
              {w}
            </span>
          );
        })}
      </div>
    </Palco>
  );
};

// ── reel 2 · cabelo molhado: o fio molhado é mais frágil que o seco; o atrito do travesseiro arranca a cutícula
export const CenaMolhado: Cena = ({ p, inicio }) => {
  const { s, prog, entra, sai } = usaTempo(p, inicio);
  const atrito = prog(p.atrito, 0.5);
  const vai = atrito > 0 ? Math.sin((s - p.atrito) * 7) : 0;
  const dano = prog(p.atrito + 0.6, 1.6);
  return (
    <Palco entra={entra} sai={sai} s={s} fases={[[p.entra, "Molhado é mais frágil", "do que o cabelo seco"], [p.atrito, "Atrito no travesseiro", "a cutícula não aguenta"]]}>
      <svg viewBox={`0 0 ${W} 300`} width={W} height={300} style={{ position: "absolute", left: 0, top: 140 }}>
        <g opacity={1 - atrito * 0.85}>
          <FioSvg id="seco" cy={66} meio={30} e={{ brilho: 0.7 }} />
          <text x={W - 20} y={30} textAnchor="end" fontFamily={POPPINS} fontWeight={600} fontSize={20} letterSpacing={4} fill={TEMA.titulo}>SECO</text>
        </g>
        <g transform={`translate(0 ${-atrito * 70})`}>
          <FioSvg id="molh" cy={200} meio={36} e={{ gotas: prog(p.entra + 0.3, 0.8), lev: (i) => 0.25 + 0.15 * rnd(i) + 0.4 * dano, quebra: dano * 0.7, frizz: dano * 0.8 }} />
          <text x={W - 20} y={268} textAnchor="end" fontFamily={POPPINS} fontWeight={600} fontSize={20} letterSpacing={4} fill={TEMA.titulo} opacity={1 - atrito}>MOLHADO</text>
        </g>
        {/* travesseiro indo e voltando por cima do fio */}
        <defs>
          <linearGradient id="almofada" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4ECDF" stopOpacity={0.9} />
            <stop offset="1" stopColor="#C9B595" stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <g opacity={atrito} transform={`translate(${230 + vai * 110} ${18})`}>
          <path d="M14,8 Q180,-6 346,8 Q362,32 346,56 Q180,68 14,56 Q-2,32 14,8 Z" fill="url(#almofada)" stroke="rgba(234,217,184,0.9)" strokeWidth={1.5} />
          <path d="M40,32 Q180,24 320,32" fill="none" stroke="rgba(120,95,70,0.35)" strokeWidth={1.5} strokeDasharray="6 6" />
        </g>
      </svg>
    </Palco>
  );
};

// ── reel 2 · mito × verdade (sem fio, só tipografia)
export const CenaMito: Cena = ({ p, inicio }) => {
  const { prog, entra, sai, s } = usaTempo(p, inicio);
  const risca = prog(p.mentira, 0.4);
  const verdade = prog(p.verdade, 0.45, REVELA);
  return (
    <Palco entra={entra} sai={sai} s={s} fases={[]}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", textShadow: SOMBRA_TXT }}>
        <span style={{ display: "inline-block", padding: "8px 20px", borderRadius: 30, border: `1.5px solid ${COR.terracota}`, fontFamily: POPPINS, fontWeight: 600, fontSize: 20, letterSpacing: 5, color: TEMA.estilo === "B" ? COR.terracota : "#E9A48E" }}>MITO</span>
        <div style={{ position: "relative", display: "inline-block", marginTop: 14 }}>
          <div style={{ fontFamily: BODONI_IT, fontSize: 56, color: TEMA.titulo, opacity: risca > 0.5 ? 0.55 : 1 }}>“A selagem afina o cabelo”</div>
          <div style={{ position: "absolute", left: 0, top: "54%", height: 3, width: `${risca * 100}%`, background: COR.terracota }} />
        </div>
        <div style={{ marginTop: 34, opacity: verdade, translate: `0px ${(1 - verdade) * 14}px` }}>
          <span style={{ display: "inline-block", padding: "8px 20px", borderRadius: 30, background: TEMA.acento, fontFamily: POPPINS, fontWeight: 600, fontSize: 20, letterSpacing: 5, color: COR.preto }}>VERDADE</span>
          <div style={{ fontFamily: BODONI, fontSize: 64, color: TEMA.titulo, marginTop: 12 }}>É falta de cuidado.</div>
        </div>
      </div>
    </Palco>
  );
};

// ── reel 8 · estética por fora, saúde por dentro
export const CenaSaude: Cena = ({ p, inicio }) => {
  const { s, prog, entra, sai } = usaTempo(p, inicio);
  const nucleo = prog(p.saude, 0.6) * (1 - 0.55 * prog(p.consequencia, 0.6));
  const varre = interpolate(s, [p.entra + 0.5, p.entra + 1.6], [-160, W + 160], clamp);
  const varre2 = interpolate(s, [p.consequencia, p.consequencia + 1.2], [-160, W + 160], clamp);
  const chips: [number, string][] = [[p.brilho, "brilho"], [p.glamour, "glamour"], [p.hidratado, "hidratado"]];
  const chipsS: [number, string][] = [[p.resistencia, "resistência do fio"], [p.interna, "saúde interna"]];
  return (
    <Palco entra={entra} sai={sai} s={s} fases={[[p.entra, "Estética", "o que a gente vê por fora"], [p.saude, "Saúde", "o que sustenta tudo, por dentro"], [p.consequencia, "Saúde em dia", "a estética é consequência"]]}>
      <svg viewBox={`0 0 ${W} 290`} width={W} height={290} style={{ position: "absolute", left: 0, top: 150 }}>
        <FioSvg id="sd" cy={110} e={{ brilho: 0.8, varre: s < (p.saude ?? 99) ? varre : varre2, nucleo, tint: 0.35 }} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", gap: 26, textShadow: SOMBRA_TXT }}>
        {(s < p.saude ? chips : chipsS).map(([t, w]) => {
          const v = prog(t, 0.35, REVELA);
          return (
            <span key={w} style={{ fontFamily: POPPINS, fontWeight: 500, fontSize: 26, letterSpacing: 3, color: TEMA.titulo, opacity: v, translate: `0px ${(1 - v) * 10}px`, textTransform: "uppercase" }}>
              {w}
            </span>
          );
        })}
      </div>
    </Palco>
  );
};

// ── reel 9 · lista de cuidados que vai se montando
export const CenaLista: Cena = ({ p, inicio }) => {
  const { s, prog, entra, sai } = usaTempo(p, inicio);
  const itens: [number, string, string][] = [
    [p.i1, "1", "Protetor térmico de boa qualidade"],
    [p.i2, "2", "Nada de dormir com o cabelo molhado"],
    [p.i3, "3", "Cronograma capilar à risca"],
  ];
  return (
    <Palco entra={entra} sai={sai} s={s} fases={[[p.entra, "Cabelo de salão em casa", ""]]}>
      <div style={{ position: "absolute", left: 40, right: 20, top: 110, display: "flex", flexDirection: "column", gap: 18, textShadow: SOMBRA_TXT }}>
        {itens.map(([t, n, txt]) => {
          const v = prog(t, 0.45, REVELA);
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 20, opacity: v, translate: `${(1 - v) * -30}px 0px` }}>
              <div style={{ fontFamily: GILDA, fontSize: 64, lineHeight: 1, color: TEMA.acento, width: 44, textAlign: "center" }}>{n}</div>
              <div style={{ fontFamily: BODONI, fontSize: 40, color: TEMA.titulo, lineHeight: 1.1, whiteSpace: "nowrap" }}>{txt}</div>
            </div>
          );
        })}
      </div>
    </Palco>
  );
};

// ── reel 6 · sobrancelha que acompanha o formato do rosto (traço champanhe)
export const CenaRosto: Cena = ({ p, inicio }) => {
  const { s, prog, entra, sai } = usaTempo(p, inicio);
  const rostos = [
    { nome: "OVAL", d: "M0,-95 C52,-95 66,-40 62,10 C58,62 30,98 0,98 C-30,98 -58,62 -62,10 C-66,-40 -52,-95 0,-95 Z", sob: "M-48,-28 Q-30,-44 -10,-36 M10,-36 Q30,-44 48,-28" },
    { nome: "REDONDO", d: "M0,-88 C58,-88 80,-40 80,6 C80,58 48,90 0,90 C-48,90 -80,58 -80,6 C-80,-40 -58,-88 0,-88 Z", sob: "M-54,-24 L-32,-44 L-12,-36 M12,-36 L32,-44 L54,-24" },
    { nome: "QUADRADO", d: "M-64,-92 L64,-92 C72,-92 76,-86 76,-78 L74,60 C72,82 50,94 0,94 C-50,94 -72,82 -74,60 L-76,-78 C-76,-86 -72,-92 -64,-92 Z", sob: "M-54,-30 Q-32,-40 -10,-34 M10,-34 Q32,-40 54,-30" },
  ];
  return (
    <Palco entra={entra} sai={sai} s={s} fases={[[p.entra, "Sobrancelha que valoriza", "a sua beleza natural"], [p.formato, "Do formato do seu rosto", "cada rosto pede um desenho"]]}>
      <svg viewBox={`0 0 ${W} 300`} width={W} height={300} style={{ position: "absolute", left: 0, top: 120 }}>
        {rostos.map((r, i) => {
          const v = prog((p.entra ?? 0) + 0.3 + i * 0.25, 0.6, REVELA);
          const sob = prog((p.formato ?? 0) + i * 0.35, 0.7);
          return (
            <g key={r.nome} transform={`translate(${170 + i * 240} 150) scale(${0.85 + 0.15 * v})`} opacity={v}>
              <path d={r.d} fill="none" stroke={TEMA.titulo} strokeWidth={2.4} />
              <path d={r.sob} fill="none" stroke={TEMA.acento} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${sob} 1`} />
              <text x={0} y={128} textAnchor="middle" fontFamily={POPPINS} fontWeight={600} fontSize={19} letterSpacing={4} fill={TEMA.titulo}>{r.nome}</text>
            </g>
          );
        })}
      </svg>
    </Palco>
  );
};

// ── reel 7 · onde fica o salão: o pin cai na Praça Padre Cícero e as referências entram quando ela fala
export const CenaLocal: Cena = ({ p, inicio }) => {
  const { s, prog, entra, sai } = usaTempo(p, inicio);
  const cai = prog(p.entra + 0.15, 0.6, (x) => 1 - Math.abs(Math.cos(x * Math.PI * 1.5)) * (1 - x));
  const onda = (s - (p.entra + 0.7)) % 1.8;
  const refs: [number, string, string][] = [
    [p.anp, "acima da", "ANP Advocacia"],
    [p.salgaderia, "próximo à", "Salgaderia Palmarina"],
  ];
  return (
    <Palco entra={entra} sai={sai} s={s} fases={[[p.entra, "Praça Padre Cícero", "União dos Palmares"]]}>
      <svg viewBox="0 0 120 150" width={84} height={105} style={{ position: "absolute", left: W / 2 - 42, top: -86 + (1 - cai) * -60, opacity: Math.min(1, cai * 2) }}>
        <ellipse cx={60} cy={138} rx={20 + 26 * Math.max(0, onda / 1.8)} ry={6 + 8 * Math.max(0, onda / 1.8)} fill="none" stroke={TEMA.acento} strokeWidth={2} opacity={s > p.entra + 0.7 ? 1 - onda / 1.8 : 0} />
        <path d="M60,138 C60,138 18,86 18,56 C18,32 37,14 60,14 C83,14 102,32 102,56 C102,86 60,138 60,138 Z" fill={TEMA.acento} />
        <circle cx={60} cy={56} r={16} fill={TEMA.titulo} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textShadow: SOMBRA_TXT }}>
        {refs.map(([t, a, b]) => {
          const v = prog(t, 0.45, REVELA);
          return (
            <div key={b} style={{ opacity: v, translate: `0px ${(1 - v) * 14}px`, whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: POPPINS, fontWeight: 400, fontSize: 28, color: TEMA.texto }}>{a} </span>
              <span style={{ fontFamily: BODONI, fontSize: 44, color: TEMA.titulo }}>{b}</span>
            </div>
          );
        })}
      </div>
    </Palco>
  );
};

// efeitos sonoros de cada cena (segundos da montagem)
export const SONS_CENA: Record<string, (p: Passos) => { em: number; nome: string; vol?: number }[]> = {
  protetor: (p) => [{ em: p.entra - 0.1, nome: "whoosh", vol: 0.32 }, { em: p.camada, nome: "brilho", vol: 0.3 }, { em: p.calor, nome: "sopro", vol: 0.32 }, { em: p.sem, nome: "erro", vol: 0.35 }, { em: p.poroso, nome: "pop-agudo", vol: 0.3 }, { em: p.frizz, nome: "pop-agudo", vol: 0.3 }, { em: p.espigado, nome: "pop-agudo", vol: 0.3 }],
  molhado: (p) => [{ em: p.entra - 0.1, nome: "whoosh", vol: 0.32 }, { em: p.atrito, nome: "varrida", vol: 0.35 }, { em: p.atrito + 0.7, nome: "abre", vol: 0.35 }],
  mito: (p) => [{ em: p.entra - 0.1, nome: "whoosh", vol: 0.3 }, { em: p.mentira, nome: "erro", vol: 0.38 }, { em: p.verdade, nome: "check", vol: 0.4 }],
  saude: (p) => [{ em: p.entra - 0.1, nome: "whoosh", vol: 0.32 }, { em: p.entra + 0.5, nome: "brilho", vol: 0.3 }, { em: p.saude, nome: "sopro", vol: 0.32 }, { em: p.consequencia, nome: "brilho", vol: 0.32 }],
  lista: (p) => [{ em: p.entra - 0.1, nome: "whoosh", vol: 0.3 }, { em: p.i1, nome: "check", vol: 0.32 }, { em: p.i2, nome: "check", vol: 0.32 }, { em: p.i3, nome: "check", vol: 0.32 }],
  rosto: (p) => [{ em: p.entra - 0.1, nome: "whoosh", vol: 0.3 }, { em: p.formato, nome: "brilho", vol: 0.3 }],
  local: (p) => [{ em: p.entra - 0.1, nome: "whoosh", vol: 0.3 }, { em: p.entra + 0.6, nome: "pop", vol: 0.38 }, { em: p.anp, nome: "clique", vol: 0.35 }, { em: p.salgaderia, nome: "clique", vol: 0.35 }],
};

export const CENAS: Record<string, Cena> = { protetor: CenaProtetor, molhado: CenaMolhado, mito: CenaMito, saude: CenaSaude, lista: CenaLista, rosto: CenaRosto, local: CenaLocal };
