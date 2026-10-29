import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ALERTA, clamp, MONTSERRAT, PLAYFAIR, ROSE, ROSE_CLARO, Serifa, some, surge, SUAVE, Tag, Texto, VERDE_OK, Vidro } from "./Vidro";

// Gráficos explicativos em vidro escuro (sem fundo branco) pros vídeos de clareamento da Dra. Camilla.
// Todos recebem os tempos em segundos da montagem (t.de é o início da Sequence).
const FPS = 30;
const useS = (de: number) => useCurrentFrame() / FPS + de;
const visivel = (s: number, de: number, ate: number) => Math.min(surge(s, de, 0.5), some(s, ate, 0.4));

// ---------- semana com as horas da placa ----------
export type TSemana = { de: number; ate: number; dias: number[]; aumenta: number; noite: number };
export const SemanaPlaca: React.FC<{ t: TSemana }> = ({ t }) => {
  const s = useS(t.de);
  const vis = visivel(s, t.de, t.ate);
  const nomes = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
  const ALT = 300;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Vidro x={90} y={330} w={900} p={surge(s, t.de, 0.6)} destaque>
        <Tag texto="Clareamento caseiro" />
        <Serifa texto="o tempo com a placa" tamanho={60} style={{ marginTop: 10 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: ALT + 90, marginTop: 34 }}>
          {nomes.map((n, i) => {
            const em = i < 4 ? t.dias[i] : i < 6 ? t.aumenta + (i - 4) * 0.35 : t.noite;
            const horas = i < 4 ? 2 : i < 6 ? 4 : 8;
            const h = surge(s, em, 0.7) * (horas / 8) * ALT;
            const rotulo = i === 6 ? "noite" : `${horas}h`;
            const ativo = surge(s, em, 0.4);
            return (
              <div key={n} style={{ width: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <div style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 34, color: "#FFFFFF", opacity: ativo }}>{rotulo}</div>
                <div style={{ position: "relative", width: 58, height: ALT, borderRadius: 29, background: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: h, borderRadius: 29, background: `linear-gradient(to top, ${ROSE}, ${ROSE_CLARO})`, boxShadow: "0 0 24px rgba(246,201,207,0.45)" }} />
                </div>
                <div style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 22, letterSpacing: 3, color: "rgba(255,255,255,0.8)" }}>{n}</div>
              </div>
            );
          })}
        </div>
      </Vidro>
    </AbsoluteFill>
  );
};

// ---------- dias feitos e o dia esquecido ----------
export type TDias = { de: number; ate: number; feitos: number[]; esqueceu: number; zero: number };
export const DiasEsquecidos: React.FC<{ t: TDias }> = ({ t }) => {
  const s = useS(t.de);
  const vis = visivel(s, t.de, t.ate);
  const nomes = ["SEG", "TER", "QUA", "QUI", "SEX"];
  const erro = surge(s, t.esqueceu, 0.5);
  const zero = surge(s, t.zero, 0.6);
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Vidro x={90} y={380} w={900} p={surge(s, t.de, 0.6)} destaque={erro < 0.5} style={erro > 0.5 ? { border: `1.5px solid rgba(255,140,140,${0.4 + 0.4 * erro})` } : undefined}>
        <Tag texto="Uso da placa" />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 34 }}>
          {nomes.map((n, i) => {
            const falhou = i === 4;
            const p = falhou ? erro : surge(s, t.feitos[Math.min(i, t.feitos.length - 1)] + (i === 3 ? 0.4 : 0), 0.45);
            const cor = falhou ? ALERTA : VERDE_OK;
            return (
              <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: 110, height: 110, borderRadius: 55, border: `2px solid ${p > 0.05 ? cor : "rgba(255,255,255,0.3)"}`, background: p > 0.05 ? `${cor}22` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", scale: 0.85 + 0.15 * p }}>
                  <div style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 58, color: cor, opacity: p }}>{falhou ? "✕" : "✓"}</div>
                </div>
                <div style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 24, letterSpacing: 3, color: falhou && erro > 0.5 ? ALERTA : "rgba(255,255,255,0.85)" }}>{n}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 40, opacity: erro, translate: `0px ${(1 - erro) * 12}px` }}>
          <Serifa texto="esqueceu um dia?" tamanho={56} cor="#FFFFFF" />
          <Texto texto="a saliva fecha o caminho do gel" tamanho={30} style={{ marginTop: 8 }} />
        </div>
        {/* barra de progresso do clareamento que volta pro zero */}
        <div style={{ marginTop: 34, opacity: Math.max(erro, zero) }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 20, letterSpacing: 4, color: "rgba(255,255,255,0.75)" }}>
            <span>CLAREAMENTO</span>
            <span style={{ color: zero > 0.5 ? ALERTA : "rgba(255,255,255,0.75)" }}>{zero > 0.5 ? "DO ZERO" : `${Math.round(70 * (1 - zero))}%`}</span>
          </div>
          <div style={{ marginTop: 12, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${70 * (1 - interpolate(zero, [0, 1], [0, 1], { ...clamp, easing: SUAVE }))}%`, borderRadius: 8, background: `linear-gradient(to right, ${ROSE}, ${ROSE_CLARO})` }} />
          </div>
        </div>
      </Vidro>
    </AbsoluteFill>
  );
};

// ---------- 21 dias ----------
export type TVinteUm = { de: number; ate: number };
export const VinteUmDias: React.FC<{ t: TVinteUm }> = ({ t }) => {
  const s = useS(t.de);
  const vis = visivel(s, t.de, t.ate);
  const prog = interpolate(s, [t.de + 0.3, t.de + 2.2], [0, 1], { ...clamp, easing: SUAVE });
  const R = 150;
  const C = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Vidro x={240} y={360} w={600} p={surge(s, t.de, 0.6)} destaque style={{ textAlign: "center" }}>
        <Tag texto="Só o caseiro" />
        <div style={{ position: "relative", width: 360, height: 360, margin: "26px auto 0" }}>
          <svg width={360} height={360} style={{ position: "absolute", inset: 0, rotate: "-90deg" }}>
            <circle cx={180} cy={180} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={14} />
            <circle cx={180} cy={180} r={R} fill="none" stroke={ROSE_CLARO} strokeWidth={14} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - prog)} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 150, lineHeight: 1, color: "#FFFFFF" }}>{Math.round(21 * prog)}</div>
            <div style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 26, letterSpacing: 8, color: ROSE_CLARO }}>DIAS</div>
          </div>
        </div>
      </Vidro>
    </AbsoluteFill>
  );
};

// ---------- consultório + caseiro ----------
export type TDois = { de: number; ate: number; consultorio: number; caseiro: number };
export const DoisJuntos: React.FC<{ t: TDois }> = ({ t }) => {
  const s = useS(t.de);
  const vis = visivel(s, t.de, t.ate);
  const card = (x: number, em: number, tag: string, titulo: string, texto: string) => (
    <Vidro x={x} y={420} w={430} p={surge(s, em, 0.6)} destaque>
      <Tag texto={tag} tamanho={20} />
      <Serifa texto={titulo} tamanho={50} style={{ marginTop: 10 }} />
      <Texto texto={texto} tamanho={26} style={{ marginTop: 12 }} />
    </Vidro>
  );
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {card(80, t.caseiro, "Em casa", "Caseiro", "placa com gel, todo dia")}
      {card(570, t.consultorio, "Na cadeira", "Consultório", "gel mais forte, acelera")}
      <div style={{ position: "absolute", left: 510, top: 520, width: 60, textAlign: "center", fontFamily: PLAYFAIR, fontSize: 70, color: ROSE_CLARO, opacity: surge(s, Math.max(t.caseiro, t.consultorio), 0.5) }}>+</div>
    </AbsoluteFill>
  );
};

// ---------- planejamento até o casamento ----------
export type TPlano = { de: number; ate: number; datas: number; acelera: number; demora: number; dia11: number; parte?: "calendario" | "barras" };
export const PlanoCasamento: React.FC<{ t: TPlano }> = ({ t }) => {
  const s = useS(t.de);
  const vis = visivel(s, t.de, t.ate);
  if (t.parte === "barras") return <Comparacao t={t} />;
  const soCalendario = t.parte === "calendario";
  // 3 semanas; consultório nos dias 1, 8 e 15; casamento no 21
  const dias = Array.from({ length: 21 }, (_, i) => i + 1);
  const marca = surge(s, t.datas, 0.8);
  const barra = (em: number, alvo: number) => interpolate(s, [em, em + 1.6], [0, alvo], { ...clamp, easing: SUAVE });
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Vidro x={70} y={260} w={940} p={surge(s, t.de, 0.6)} destaque>
        <Tag texto="Planejamento" />
        <Serifa texto="até o grande dia" tamanho={58} style={{ marginTop: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14, marginTop: 30 }}>
          {dias.map((d, i) => {
            const consultorio = d === 1 || d === 8 || d === 15;
            const casamento = d === 21;
            const p = surge(s, t.datas + i * 0.05, 0.4);
            return (
              <div key={d} style={{ height: 92, borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: 0.35 + 0.65 * p, background: casamento ? "rgba(246,201,207,0.22)" : "rgba(255,255,255,0.06)", border: casamento ? `2px solid ${ROSE_CLARO}` : "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,0.85)" }}>{casamento ? "♡" : d}</div>
                <div style={{ width: consultorio ? 22 : 10, height: consultorio ? 22 : 10, borderRadius: 11, background: consultorio ? ROSE : "rgba(246,201,207,0.6)", scale: marca, boxShadow: consultorio ? "0 0 14px rgba(229,154,166,0.8)" : undefined }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 30, marginTop: 20, fontFamily: MONTSERRAT, fontSize: 20, letterSpacing: 2, color: "rgba(255,255,255,0.75)", opacity: marca }}>
          <span><span style={{ color: ROSE }}>●</span> consultório</span>
          <span><span style={{ color: ROSE_CLARO }}>•</span> caseiro</span>
          <span><span style={{ color: ROSE_CLARO }}>♡</span> casamento</span>
        </div>
        {(soCalendario ? [] : [
          { em: t.demora, nome: "Só caseiro", alvo: 0.55, cor: "rgba(255,255,255,0.45)" },
          { em: t.acelera, nome: "Consultório + caseiro", alvo: 1, cor: `linear-gradient(to right, ${ROSE}, ${ROSE_CLARO})` },
        ]).map((b) => (
          <div key={b.nome} style={{ marginTop: 26, opacity: surge(s, b.em, 0.5) }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 20, letterSpacing: 3, color: "rgba(255,255,255,0.85)" }}>
              <span>{b.nome.toUpperCase()}</span>
              <span>{Math.round(barra(b.em, b.alvo) * 100)}%</span>
            </div>
            <div style={{ marginTop: 10, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barra(b.em, b.alvo) * 100}%`, background: b.cor, borderRadius: 7 }} />
            </div>
          </div>
        ))}
      </Vidro>
    </AbsoluteFill>
  );
};

// comparação do tempo até clarear (segunda metade do planejamento)
const Comparacao: React.FC<{ t: TPlano }> = ({ t }) => {
  const s = useS(t.de);
  const vis = visivel(s, t.de, t.ate);
  const barra = (em: number, alvo: number) => interpolate(s, [em, em + 1.6], [0, alvo], { ...clamp, easing: SUAVE });
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Vidro x={70} y={260} w={940} p={surge(s, t.de, 0.6)} destaque>
        <Tag texto="Até o casamento" />
        {[
          { em: t.demora, nome: "Só caseiro", alvo: 0.55, cor: "rgba(255,255,255,0.45)" },
          { em: t.acelera, nome: "Consultório + caseiro", alvo: 1, cor: `linear-gradient(to right, ${ROSE}, ${ROSE_CLARO})` },
        ].map((b) => (
          <div key={b.nome} style={{ marginTop: 30, opacity: surge(s, b.em, 0.5) }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 30, letterSpacing: 3, color: "rgba(255,255,255,0.9)" }}>
              <span>{b.nome.toUpperCase()}</span>
              <span>{Math.round(barra(b.em, b.alvo) * 100)}%</span>
            </div>
            <div style={{ marginTop: 14, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barra(b.em, b.alvo) * 100}%`, background: b.cor, borderRadius: 11 }} />
            </div>
          </div>
        ))}
      </Vidro>
    </AbsoluteFill>
  );
};

// ---------- medidor de sensibilidade ----------
export type TMedidor = { de: number; ate: number; controlavel: number };
export const MedidorSensibilidade: React.FC<{ t: TMedidor }> = ({ t }) => {
  const s = useS(t.de);
  const vis = visivel(s, t.de, t.ate);
  const ang = interpolate(s, [t.de + 0.4, t.controlavel - 0.2, t.controlavel + 0.4], [-80, 15, -8], { ...clamp, easing: SUAVE });
  const ok = surge(s, t.controlavel, 0.5);
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Vidro x={170} y={400} w={740} p={surge(s, t.de, 0.6)} destaque style={{ textAlign: "center" }}>
        <Tag texto="Sensibilidade" />
        <svg width={600} height={330} viewBox="0 0 600 330" style={{ marginTop: 20 }}>
          <defs>
            <linearGradient id="arco" x1="0" x2="1">
              <stop offset="0" stopColor={VERDE_OK} />
              <stop offset="0.55" stopColor={ROSE_CLARO} />
              <stop offset="1" stopColor={ALERTA} />
            </linearGradient>
          </defs>
          <path d="M 60 300 A 240 240 0 0 1 540 300" fill="none" stroke="url(#arco)" strokeWidth={22} strokeLinecap="round" opacity={0.9} />
          <g transform={`translate(300 300) rotate(${ang})`}>
            <line x1={0} y1={0} x2={0} y2={-205} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
            <circle cx={0} cy={0} r={16} fill="#FFFFFF" />
          </g>
          <text x={70} y={325} fill="rgba(255,255,255,0.7)" fontFamily={MONTSERRAT} fontSize={20} letterSpacing={3}>LEVE</text>
          <text x={470} y={325} fill="rgba(255,255,255,0.7)" fontFamily={MONTSERRAT} fontSize={20} letterSpacing={3}>FORTE</text>
        </svg>
        <Serifa texto="controlável" tamanho={64} style={{ marginTop: 6, opacity: ok, translate: `0px ${(1 - ok) * 12}px` }} />
      </Vidro>
    </AbsoluteFill>
  );
};
