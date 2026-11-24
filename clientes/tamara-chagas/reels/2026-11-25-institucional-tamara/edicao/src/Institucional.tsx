// Tamara Chagas · vídeo institucional do 25 de novembro (Dra. Tamara, gravado em 24/11/2026).
// Pedido da Talyta: editar com assets de notícias oficiais sobre os direitos da mulher, acompanhando o que ela fala.
// Fontes: MPS 09/10/2026 (Benefício de Afastamento Protetivo, Portaria Conjunta MPS/INSS 48/2026; Lei 11.340/2006, art. 9º);
// Ministério das Mulheres 01/10/2026 (benefício assistencial pra quem não é segurada); Agência Brasil 19/11/2026 (21 Dias de Ativismo).
import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "400", "500", "600", "700"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.42, 0, 0.58, 1);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const CHAMPANHE = "#E6D3B8", GRAFITE = "#141414", TAUPE = "#8C7B6B";

type Bloco = [number, string];
type Seg = { dur: number; leg: Bloco[] };
const SEGS: Seg[] = [
  { dur: 7.92, leg: [[0.12, "Quantas mulheres continuam vivendo uma situação de <b>violência</b>"], [3.32, "porque têm medo de não conseguir sustentar a própria casa e os próprios filhos?"]] },
  { dur: 5.26, leg: [[0.11, "Porque muitas vezes, além do medo da agressão,"], [2.87, "existe o medo de <b>não ter como recomeçar.</b>"]] },
  { dur: 5.05, leg: [[0.16, "Mas nenhuma mulher deveria ter que escolher"], [2.24, "entre a própria <b>segurança</b> e o <b>sustento</b> da família."]] },
  { dur: 11.79, leg: [[0.06, "O que muita gente não sabe é que a mulher vítima de violência doméstica"], [4.64, "que precisa ser afastada do trabalho por determinação da Justiça"], [8.42, "pode ter direito a receber um <b>benefício do INSS</b>, caso seja segurada."]] },
  { dur: 5.71, leg: [[0.07, "E mesmo que não seja segurada,"], [1.55, "pode ter direito a <b>assistência financeira</b> paga pelo poder público."]] },
  { dur: 6.74, leg: [[0.09, "Por quê?"], [0.79, "Porque proteger uma mulher também significa garantir condições"], [4.07, "para que ela possa <b>reconstruir a sua vida.</b>"]] },
  { dur: 3.33, leg: [[0.12, "Nesse <b>25 de novembro</b>, o nosso posicionamento é claro."]] },
  { dur: 6.56, leg: [[0.18, "Nenhuma violência deve ser <b>normalizada</b>,"], [2.44, "nenhuma ameaça deve ser <b>ignorada</b>"], [4.08, "e nenhuma mulher deve ser <b>silenciada.</b>"]] },
  { dur: 4.99, leg: [[0.21, "Não espere a violência deixar marcas para <b>procurar ajuda.</b>"]] },
  { dur: 7.07, leg: [[0.17, "Você tem <b>direitos</b>, você merece <b>respeito</b>"], [3.05, "e, acima de tudo, você merece <b>viver sem medo.</b>"]] },
];
const INI: number[] = []; SEGS.reduce((a, s) => { INI.push(a); return a + s.dur; }, 0);
const FALA = SEGS.reduce((a, s) => a + s.dur, 0);
const FINAL = 4.5;
export const DURACAO = fr(FALA + FINAL);

/* ---------- legenda: frase inteira, até 2 linhas ---------- */
const Legenda: React.FC<{ blocos: Bloco[]; dur: number }> = ({ blocos, dur }) => {
  const f = useCurrentFrame();
  return (
    <>
      {blocos.map(([t, txt], i) => {
        const a = fr(t), b = i + 1 < blocos.length ? fr(blocos[i + 1][0]) : fr(dur);
        if (f < a - 1 || f >= b) return null;
        const o = interpolate(f, [a - 1, a + 3], [0, 1], cl);
        return (
          <div key={i} style={{ position: "absolute", left: 90, right: 90, top: 1500, fontFamily, textAlign: "center", color: "#fff", fontSize: 44, lineHeight: 1.28,
            fontWeight: 400, letterSpacing: "-0.01em", textShadow: "0 2px 18px rgba(0,0,0,.75), 0 0 2px rgba(0,0,0,.5)", opacity: o, transform: `translateY(${(1 - o) * 8}px)` }}
            dangerouslySetInnerHTML={{ __html: txt.replace(/<b>/g, '<b style="font-weight:700">') }} />
        );
      })}
    </>
  );
};

/* ---------- cartão de notícia oficial ---------- */
const Noticia: React.FC<{ orgao: string; data: string; titulo: string; texto?: string; chips?: string[]; fonte: string; dur: number }> = ({ orgao, data, titulo, texto, chips = [], fonte, dur }) => {
  const f = useCurrentFrame(), n = fr(dur);
  const e = interpolate(f, [0, 16], [0, 1], { ...cl, easing: EXPO });
  const s = interpolate(f, [n - 12, n], [1, 0], { ...cl, easing: SUAVE });
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 930, fontFamily, opacity: Math.min(e, s), transform: `translateY(${(1 - e) * 60}px)` }}>
      <div style={{ background: "rgba(247,245,242,.97)", borderRadius: 28, padding: "30px 34px 28px", boxShadow: "0 24px 60px rgba(0,0,0,.35)", color: GRAFITE }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: GRAFITE, color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: "0.18em", padding: "7px 12px", borderRadius: 8 }}>NOTÍCIA OFICIAL</div>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "0.12em", color: TAUPE }}>{orgao} · {data}</div>
        </div>
        <div style={{ marginTop: 18, fontSize: 36, lineHeight: 1.2, fontWeight: 600, letterSpacing: "-0.02em" }}>{titulo}</div>
        {texto && <div style={{ marginTop: 14, fontSize: 26, lineHeight: 1.38, fontWeight: 400, color: "#3a3734" }} dangerouslySetInnerHTML={{ __html: texto }} />}
        {chips.length > 0 && (
          <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {chips.map((c, i) => {
              const k = interpolate(f, [8 + i * 5, 20 + i * 5], [0, 1], { ...cl, easing: EXPO });
              return <div key={i} style={{ fontSize: 22, fontWeight: 600, padding: "8px 16px", borderRadius: 999, background: i === 0 ? GRAFITE : "#E9E4DD", color: i === 0 ? "#fff" : GRAFITE, opacity: k, transform: `scale(${0.85 + 0.15 * k})` }}>{c}</div>;
            })}
          </div>
        )}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(20,20,20,.12)", fontSize: 17, color: TAUPE, letterSpacing: "0.02em" }}>Fonte: {fonte}</div>
      </div>
    </div>
  );
};

/* ---------- selo do topo ---------- */
const Selo: React.FC<{ texto: string; sub?: string; dur: number }> = ({ texto, sub, dur }) => {
  const f = useCurrentFrame(), n = fr(dur);
  const o = Math.min(interpolate(f, [0, 14], [0, 1], { ...cl, easing: SUAVE }), interpolate(f, [n - 12, n], [1, 0], { ...cl, easing: SUAVE }));
  return (
    <div style={{ position: "absolute", top: 220, left: 0, right: 0, textAlign: "center", fontFamily, opacity: o, color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,.55)" }}>
      <div style={{ fontSize: 22, letterSpacing: "0.38em", fontWeight: 600, color: CHAMPANHE }}>{texto}</div>
      {sub && <div style={{ marginTop: 10, fontSize: 20, letterSpacing: "0.06em", fontWeight: 400 }}>{sub}</div>}
    </div>
  );
};

const Trecho: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame(), s = SEGS[i], n = fr(s.dur);
  const base = i % 2 ? 1.1 : 1.0; // aproximação alternada a cada frase (corte seco)
  const k = base + 0.025 * interpolate(f, [0, n], [0, 1], cl);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: "50% 28%" }}>
        <OffthreadVideo src={staticFile(`c/s${String(i + 1).padStart(2, "0")}.mp4`)} volume={VOZ} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 18%,rgba(0,0,0,0) 62%,rgba(0,0,0,.45) 100%)" }} />
      <Legenda blocos={s.leg} dur={s.dur} />
    </AbsoluteFill>
  );
};
const VOZ = 1.6;

const Final: React.FC = () => {
  const f = useCurrentFrame();
  const a = (d: number) => interpolate(f, [d, d + 18], [0, 1], cl);
  const up = (d: number) => `translateY(${(1 - a(d)) * 16}px)`;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0d0d", fontFamily, color: "#fff", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 96px" }}>
      <div style={{ fontSize: 26, letterSpacing: "0.42em", fontWeight: 600, color: CHAMPANHE, opacity: a(2), transform: up(2) }}>25 DE NOVEMBRO</div>
      <div style={{ width: 70, height: 2, background: CHAMPANHE, margin: "34px 0", opacity: a(6) }} />
      <div style={{ fontSize: 78, lineHeight: 1.1, letterSpacing: "-0.035em", fontWeight: 200, opacity: a(10), transform: up(10) }}>Você merece<br /><b style={{ fontWeight: 700 }}>viver sem medo.</b></div>
      <div style={{ marginTop: 56, fontSize: 40, fontWeight: 600, opacity: a(24), transform: up(24) }}>
        Ligue <span style={{ color: CHAMPANHE }}>180</span> · Emergências <span style={{ color: CHAMPANHE }}>190</span>
      </div>
      <Img src={staticFile("logo.png")} style={{ position: "absolute", bottom: 230, width: 230, opacity: a(34) * 0.95 }} />
    </AbsoluteFill>
  );
};

const em = (seg: number, t: number) => fr(INI[seg] + t);

export const Institucional: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SEGS.map((s, i) => <Sequence key={i} from={fr(INI[i])} durationInFrames={fr(s.dur)}><Trecho i={i} /></Sequence>)}
    <Sequence from={0} durationInFrames={fr(6.5)}><Selo texto="25 DE NOVEMBRO" sub="Dia Internacional pela Eliminação da Violência contra a Mulher" dur={6.5} /></Sequence>
    {/* benefício do INSS (segurada) */}
    <Sequence from={em(3, 4.4)} durationInFrames={em(4, 0) - em(3, 4.4)}>
      <Noticia dur={(em(4, 0) - em(3, 4.4)) / FPS} orgao="MINISTÉRIO DA PREVIDÊNCIA SOCIAL" data="09/10/2026"
        titulo="Benefício Lei Maria da Penha, do INSS, garante renda à mulher afastada do trabalho por situação de violência doméstica"
        chips={["Até 6 meses", "Sem perícia", "Sem carência", "Meu INSS ou 135"]}
        fonte="gov.br/previdencia · Portaria Conjunta MPS/INSS nº 48/2026 · Lei 11.340/2006, art. 9º" />
    </Sequence>
    {/* quem não é segurada */}
    <Sequence from={em(4, 0.4)} durationInFrames={fr(SEGS[4].dur - 0.4)}>
      <Noticia dur={SEGS[4].dur - 0.4} orgao="MINISTÉRIO DAS MULHERES" data="01/10/2026"
        titulo="Novo parecer garante afastamento remunerado do trabalho a mulheres vítimas de violência doméstica e familiar"
        texto="Quem não é segurada pode receber <b>benefício assistencial</b>, pago pelo estado, DF ou município, conforme indicado pelo juiz."
        fonte="gov.br/mulheres · STF, RE 1.520.468 (Tema 1.370)" />
    </Sequence>
    {/* campanha do 25 de novembro */}
    <Sequence from={em(6, 0.3)} durationInFrames={em(8, 0) - em(6, 0.3)}>
      <Noticia dur={(em(8, 0) - em(6, 0.3)) / FPS} orgao="AGÊNCIA BRASIL" data="19/11/2026"
        titulo="Governo lança campanha para proteger mulheres no meio digital"
        texto="Denúncias de violência digital ao Ligue 180 subiram <b>36,5%</b>: de 4.575 em 2025 para 6.245 até outubro de 2026."
        chips={["21 Dias de Ativismo", "20/11 a 10/12"]}
        fonte="agenciabrasil.ebc.com.br · Ministério das Mulheres" />
    </Sequence>
    <Sequence from={em(8, 0)} durationInFrames={fr(SEGS[8].dur + SEGS[9].dur)}>
      <Selo texto="LIGUE 180 · EMERGÊNCIAS 190" dur={SEGS[8].dur + SEGS[9].dur} />
    </Sequence>
    <Sequence from={fr(FALA)}><Final /></Sequence>
    <Audio src={staticFile("trilha.wav")} volume={(x) => interpolate(x, [0, fr(1.5), fr(FALA) - fr(1), fr(FALA) + fr(0.8), DURACAO - fr(1.2), DURACAO], [0, 0.1, 0.12, 0.45, 0.45, 0], cl)} />
  </AbsoluteFill>
);
