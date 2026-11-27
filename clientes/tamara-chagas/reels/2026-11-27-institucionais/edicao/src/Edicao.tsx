// Tamara Chagas · 2 vídeos institucionais gravados no escritório (27/11/2026).
// v1 "Recepção": bom dia, horário, localização e chamada pro carrossel do golpe da falsa central (publicado 27/11).
// v2 "Coluna": dor na coluna e benefício por incapacidade (curadoria: frase solta "que persiste na manutenção da sua renda" fora,
//    pausas entre frases cortadas no silêncio, nenhuma emenda dentro de frase). Cortes e palavras em dados.json (gerado por ../prep.py).
// Fontes dos cartões: Agência Gov / Ministério da Previdência Social, "Novo Atestmed acelera a decisão de análise de benefícios
// por incapacidade temporária" (24/03/2026; Portaria Conjunta MPS/INSS nº 13/2026: até 90 dias); EC nº 103/2019 (nomes atuais).
import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";
import dados from "./dados.json";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "400", "500", "600", "700"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.42, 0, 0.58, 1);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const CHAMPANHE = "#E6D3B8", GRAFITE = "#141414", TAUPE = "#8C7B6B";

type Palavra = [number, number, string];
type Clip = { de: number; ate: number; ini: number; palavras: Palavra[] };
type Video = { clips: Clip[]; dur: number };
const D = dados as unknown as Record<"v1" | "v2", Video>;

// junta "auxílio" + "-doença"
const palavras = (v: Video): Palavra[] => {
  const out: Palavra[] = [];
  v.clips.forEach((c) => c.palavras.forEach((p) => {
    if (p[2].startsWith("-") && out.length) { const u = out[out.length - 1]; out[out.length - 1] = [u[0], p[1], u[2] + p[2]]; }
    else out.push([...p] as Palavra);
  }));
  return out;
};
const limpa = (s: string) => s.toLowerCase().replace(/[.,?!]/g, "");
// tempo (s, na edição) da 1ª palavra igual a `w` depois de `depois`
const achaW = (P: Palavra[]) => (w: string, depois = 0) => {
  const p = P.find((x) => x[0] >= depois - 0.01 && limpa(x[2]) === limpa(w));
  if (!p) throw new Error("palavra não achada: " + w);
  return p[0];
};

/* ---------- vídeo cortado, com aproximação alternada a cada corte ---------- */
const Fala: React.FC<{ v: Video; src: string; zooms?: number[]; origem?: string }> = ({ v, src, zooms = [], origem = "50% 30%" }) => {
  const f = useCurrentFrame();
  return (
    <>
      {v.clips.map((c, i) => {
        const n = fr(c.ate - c.de);
        return (
          <Sequence key={i} from={fr(c.ini)} durationInFrames={n}>
            <Trecho src={src} de={c.de} n={n} base={i % 2 ? 1.09 : 1.0} zooms={zooms.map((z) => z - c.ini)} origem={origem} />
          </Sequence>
        );
      })}
    </>
  );
};
const Trecho: React.FC<{ src: string; de: number; n: number; base: number; zooms: number[]; origem: string }> = ({ src, de, n, base, zooms, origem }) => {
  const f = useCurrentFrame();
  const passos = zooms.filter((z) => z > 0 && fr(z) <= f).length; // "corte" de enquadramento dentro do plano único
  const k = (passos % 2 ? (base > 1 ? 1.0 : 1.09) : base) + 0.02 * interpolate(f, [0, n], [0, 1], cl);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: origem }}>
        <OffthreadVideo src={staticFile(src)} startFrom={fr(de)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,.42) 0%,rgba(0,0,0,0) 20%,rgba(0,0,0,0) 58%,rgba(0,0,0,.55) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------- legenda palavra a palavra (frase curta, palavra falada em champanhe) ---------- */
const Legenda: React.FC<{ P: Palavra[]; fim: number }> = ({ P, fim }) => {
  const f = useCurrentFrame(), t = f / FPS;
  // frase a frase (quebra no ponto, na vírgula ou na pausa), cada frase dividida em pedaços equilibrados de até 6 palavras
  const blocos: Palavra[][] = []; let frase: Palavra[] = [];
  const fecha = () => {
    if (!frase.length) return;
    const n = Math.ceil(frase.length / 6), tam = Math.ceil(frase.length / n);
    for (let i = 0; i < frase.length; i += tam) blocos.push(frase.slice(i, i + tam));
    frase = [];
  };
  P.forEach((p, i) => {
    frase.push(p);
    const prox = P[i + 1];
    if (!prox || /[.?]$/.test(p[2]) || (/,$/.test(p[2]) && frase.length >= 3) || prox[0] - p[1] > 0.6) fecha();
  });
  const b = blocos.findIndex((bl, i) => t >= bl[0][0] - 0.05 && t < (blocos[i + 1] ? blocos[i + 1][0][0] - 0.05 : Math.min(bl[bl.length - 1][1] + 0.5, fim)));
  if (b < 0) return null;
  const bl = blocos[b];
  if (t > bl[bl.length - 1][1] + 0.7) return null;
  const o = interpolate(t, [bl[0][0] - 0.05, bl[0][0] + 0.07], [0, 1], cl);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1470, fontFamily, textAlign: "center", fontSize: 52, lineHeight: 1.25, letterSpacing: "-0.01em",
      color: "#fff", fontWeight: 500, textShadow: "0 2px 18px rgba(0,0,0,.8), 0 0 3px rgba(0,0,0,.6)", opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
      {bl.map((p, i) => {
        const ativa = t >= p[0] - 0.03;
        return <span key={i} style={{ color: ativa ? CHAMPANHE : "#fff", fontWeight: ativa ? 700 : 500 }}>{p[2]}{i < bl.length - 1 ? " " : ""}</span>;
      })}
    </div>
  );
};

/* ---------- selo do topo (assunto do trecho) ---------- */
const Selo: React.FC<{ texto: string; titulo?: string; dur: number }> = ({ texto, titulo, dur }) => {
  const f = useCurrentFrame(), n = fr(dur);
  const o = Math.min(interpolate(f, [0, 12], [0, 1], { ...cl, easing: SUAVE }), interpolate(f, [n - 10, n], [1, 0], { ...cl, easing: SUAVE }));
  const e = interpolate(f, [0, 18], [0, 1], { ...cl, easing: EXPO });
  return (
    <div style={{ position: "absolute", top: 150, left: 80, right: 80, textAlign: "center", fontFamily, opacity: o, color: "#fff", textShadow: "0 2px 16px rgba(0,0,0,.6)" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 16, fontSize: 26, letterSpacing: "0.32em", fontWeight: 600, color: CHAMPANHE }}>
        <span style={{ width: 40 * e, height: 2, background: CHAMPANHE, display: "inline-block" }} />{texto}<span style={{ width: 40 * e, height: 2, background: CHAMPANHE, display: "inline-block" }} />
      </div>
      {titulo && <div style={{ marginTop: 16, fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.035em", fontWeight: 200, transform: `translateY(${(1 - e) * 20}px)` }}
        dangerouslySetInnerHTML={{ __html: titulo.replace(/<b>/g, '<b style="font-weight:700">') }} />}
    </div>
  );
};

/* ---------- cartão (lista, nota ou notícia oficial) ---------- */
type Chip = [string, number]; // texto, segundos depois da entrada do cartão
const Cartao: React.FC<{ dur: number; kicker: string; tag?: string; titulo?: string; texto?: string; chips?: Chip[]; linhas?: [string, string][]; fonte?: string }> =
  ({ dur, kicker, tag, titulo, texto, chips = [], linhas = [], fonte }) => {
  const f = useCurrentFrame(), n = fr(dur);
  const e = interpolate(f, [0, 16], [0, 1], { ...cl, easing: EXPO });
  const s = interpolate(f, [n - 10, n], [1, 0], { ...cl, easing: SUAVE });
  const b = (h: string) => h.replace(/<b>/g, '<b style="font-weight:700">');
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1010, fontFamily, opacity: Math.min(e, s), transform: `translateY(${(1 - e) * 50}px)` }}>
      <div style={{ background: "rgba(247,245,242,.97)", borderRadius: 28, padding: "28px 34px 26px", boxShadow: "0 24px 60px rgba(0,0,0,.35)", color: GRAFITE }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {tag && <div style={{ background: GRAFITE, color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: "0.18em", padding: "7px 12px", borderRadius: 8 }}>{tag}</div>}
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "0.16em", color: TAUPE }}>{kicker}</div>
        </div>
        {titulo && <div style={{ marginTop: 14, fontSize: 38, lineHeight: 1.18, fontWeight: 400, letterSpacing: "-0.02em" }} dangerouslySetInnerHTML={{ __html: b(titulo) }} />}
        {texto && <div style={{ marginTop: 12, fontSize: 25, lineHeight: 1.38, color: "#3a3734" }} dangerouslySetInnerHTML={{ __html: b(texto) }} />}
        {linhas.map(([de, para], i) => {
          const k = interpolate(f, [6 + i * 10, 20 + i * 10], [0, 1], { ...cl, easing: EXPO });
          return (
            <div key={i} style={{ marginTop: 16, opacity: k, transform: `translateX(${(1 - k) * 20}px)` }}>
              <div style={{ fontSize: 22, color: TAUPE, textDecoration: "line-through", textDecorationColor: "rgba(140,123,107,.6)" }}>{de}</div>
              <div style={{ fontSize: 33, fontWeight: 400, letterSpacing: "-0.015em", marginTop: 2 }} dangerouslySetInnerHTML={{ __html: b(para) }} />
            </div>
          );
        })}
        {chips.length > 0 && (
          <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 12 }}>
            {chips.map(([c, t], i) => {
              const k = interpolate(f, [fr(t), fr(t) + 10], [0, 1], { ...cl, easing: EXPO });
              return <div key={i} style={{ fontSize: 30, fontWeight: 600, padding: "10px 20px", borderRadius: 999, background: i === 0 ? GRAFITE : "#E9E4DD", color: i === 0 ? "#fff" : GRAFITE, opacity: k, transform: `scale(${0.85 + 0.15 * k})` }}>{c}</div>;
            })}
          </div>
        )}
        {fonte && <div style={{ marginTop: 18, paddingTop: 12, borderTop: "1px solid rgba(20,20,20,.12)", fontSize: 17, color: TAUPE }}>Fonte: {fonte}</div>}
      </div>
    </div>
  );
};

/* ---------- B-roll (foto do escritório, avanço suave) ---------- */
const BRoll: React.FC<{ src: string; dur: number }> = ({ src, dur }) => {
  const f = useCurrentFrame(), n = fr(dur);
  const o = Math.min(interpolate(f, [0, 8], [0, 1], cl), interpolate(f, [n - 8, n], [1, 0], cl));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: "#000" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + 0.08 * f / n})`, transformOrigin: "55% 40%" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,.42) 0%,rgba(0,0,0,0) 20%,rgba(0,0,0,0) 58%,rgba(0,0,0,.55) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------- tela final ---------- */
const Final: React.FC<{ kicker: string; titulo: string; sub: string }> = ({ kicker, titulo, sub }) => {
  const f = useCurrentFrame();
  const a = (d: number) => interpolate(f, [d, d + 18], [0, 1], cl);
  const up = (d: number) => `translateY(${(1 - a(d)) * 16}px)`;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0d0d", fontFamily, color: "#fff", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 96px", opacity: interpolate(f, [0, 8], [0, 1], cl) }}>
      <div style={{ fontSize: 24, letterSpacing: "0.42em", fontWeight: 600, color: CHAMPANHE, opacity: a(2), transform: up(2) }}>{kicker}</div>
      <div style={{ width: 70, height: 2, background: CHAMPANHE, margin: "34px 0", opacity: a(6) }} />
      <div style={{ fontSize: 76, lineHeight: 1.1, letterSpacing: "-0.035em", fontWeight: 200, opacity: a(10), transform: up(10) }} dangerouslySetInnerHTML={{ __html: titulo.replace(/<b>/g, '<b style="font-weight:700">') }} />
      <div style={{ marginTop: 44, fontSize: 32, lineHeight: 1.4, fontWeight: 300, opacity: a(22), transform: up(22), maxWidth: 820 }}>{sub}</div>
      <Img src={staticFile("logo.png")} style={{ position: "absolute", bottom: 230, width: 230, opacity: a(30) * 0.95 }} />
    </AbsoluteFill>
  );
};

const Musica: React.FC<{ fala: number; final: number; leito: number }> = ({ fala, final, leito }) => (
  <Audio src={staticFile("piano.mp3")} loop volume={(x) => interpolate(x, [0, fr(1), fr(fala) - fr(0.2), fr(fala) + fr(0.6), fr(fala + final) - fr(0.8), fr(fala + final)], [0, leito, leito, 0.42, 0.42, 0], cl)} />
);

const Em: React.FC<{ de: number; ate: number; children: React.ReactNode }> = ({ de, ate, children }) => (
  <Sequence from={fr(de)} durationInFrames={Math.max(1, fr(ate) - fr(de))}>{children}</Sequence>
);

/* =================== v1 · Recepção =================== */
const P1 = palavras(D.v1), w1 = achaW(P1);
const F1 = D.v1.dur, FIM1 = 3.6;
export const DUR1 = fr(F1 + FIM1);
export const Recepcao: React.FC = () => {
  const esc = w1("escritório"), prox = w1("próximo"), hoje = w1("Hoje"), golpe = w1("golpe");
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={fr(F1)}><Fala v={D.v1} src="v1.mp4" zooms={[esc - 0.2, hoje - 0.1]} origem="50% 28%" /></Sequence>
      <Em de={prox - 0.1} ate={hoje - 0.1}><BRoll src="equipe-08-recepcao-logo.jpg" dur={hoje - prox} /></Em>
      <Em de={0} ate={esc - 0.25}><Selo texto="BOM DIA" dur={esc - 0.25} /></Em>
      <Em de={w1("Iniciamos às") - 0.2} ate={esc - 0.25}><Cartao dur={esc - 0.05 - w1("Iniciamos às")} kicker="HORÁRIO DE ATENDIMENTO" titulo="Das <b>8h</b> às <b>13h</b>" /></Em>
      <Em de={esc - 0.2} ate={hoje - 0.15}><Selo texto="ONDE ESTAMOS" dur={hoje - esc + 0.05} /></Em>
      <Em de={esc} ate={prox - 0.15}><Cartao dur={prox - 0.15 - esc} kicker="LOCALIZAÇÃO" chips={[["Em frente à Clínica Francis", w1("frente") - esc], ["Perto do Restaurante Aquarius", prox - esc]]} /></Em>
      <Em de={hoje - 0.1} ate={F1}><Selo texto="HOJE NO PERFIL" dur={F1 - hoje + 0.1} /></Em>
      <Em de={golpe - 0.3} ate={F1}><Cartao dur={F1 - golpe + 0.3} tag="ALERTA" kicker="GOLPE" titulo="Golpe da <b>falsa central</b> do banco" /></Em>
      <Sequence durationInFrames={fr(F1)}><Legenda P={P1} fim={F1} /></Sequence>
      <Sequence from={fr(F1)}><Final kicker="ALERTA · GOLPE" titulo="Golpe da<br/><b>falsa central</b>" sub="Veja no carrossel como ele funciona e como se proteger." /></Sequence>
      <Sequence durationInFrames={fr(F1 + FIM1)}><Musica fala={F1} final={FIM1} leito={0.06} /></Sequence>
    </AbsoluteFill>
  );
};

/* =================== v2 · Dor na coluna =================== */
const P2 = palavras(D.v2), w2 = achaW(P2), C = D.v2.clips;
const F2 = D.v2.dur, FIM2 = 4.5;
export const DUR2 = fr(F2 + FIM2);
export const Coluna: React.FC = () => {
  const q = w2("Quais");
  const s = [C[1].ini, C[3].ini, C[5].ini, C[7].ini, q, C[8].ini, F2];
  const card = (de: number, ate: number, props: Omit<React.ComponentProps<typeof Cartao>, "dur">) =>
    <Em de={de} ate={ate}><Cartao dur={ate - de} {...props} /></Em>;
  const k1 = w2("incapacitar") - 0.4, k2 = w2("pedreiro") - 0.3, k3 = w2("comprovar") - 0.3, k4 = w2("exames,") - 0.3;
  const k5 = w2("carteira") - 0.3, k6 = w2("auxílio-doença") - 0.3, k7 = w2("documentação") - 0.3;
  const k8 = C[8].ini + 0.1, k9 = w2("grave,") - 0.3, k10 = w2("laudos,", C[8].ini) - 0.3, k11 = w2("Ou", w2("prazo.", C[8].ini)) - 0.2;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={fr(F2)}><Fala v={D.v2} src="v2.mp4" zooms={[w2("Quais"), w2("pode,")]} origem="45% 26%" /></Sequence>
      {/* gancho e assuntos no topo (acima da cabeça) */}
      <Em de={0} ate={s[0]}><Selo texto="DOR NA COLUNA" titulo="Dá direito a <b>benefício</b>?" dur={s[0]} /></Em>
      <Em de={s[0]} ate={s[1]}><Selo texto="PARA FINS DE BENEFÍCIO" dur={s[1] - s[0]} /></Em>
      <Em de={s[1]} ate={s[2]}><Selo texto="TRABALHOS QUE FORÇAM A COLUNA" dur={s[2] - s[1]} /></Em>
      <Em de={s[2]} ate={s[3]}><Selo texto="O QUE PRECISA SER COMPROVADO" dur={s[3] - s[2]} /></Em>
      <Em de={s[3]} ate={s[4]}><Selo texto="QUALIDADE DE SEGURADO" dur={s[4] - s[3]} /></Em>
      <Em de={s[4]} ate={s[5]}><Selo texto="DOR NA COLUNA" titulo="Quais benefícios podem ser <b>concedidos</b>?" dur={s[5] - s[4]} /></Em>
      <Em de={s[5]} ate={s[6]}><Selo texto="BENEFÍCIOS POSSÍVEIS" dur={s[6] - s[5]} /></Em>
      {/* cartões no tronco, nunca no rosto */}
      {card(k1, C[3].ini, { kicker: "PARA FINS DE BENEFÍCIO", titulo: "A dor precisa <b>incapacitar para o trabalho</b>" })}
      {card(k2, C[5].ini, { kicker: "EXEMPLOS", chips: [["Pedreiro", 0.3], ["Trabalhador rural", w2("trabalhador") - k2], ["Postura curvada", w2("curvada,") - k2]] })}
      {card(k3, C[6].ini, { kicker: "É PRECISO COMPROVAR", chips: [["Dor que persiste", w2("persiste") - k3], ["Incapacidade para o trabalho", w2("incapacita") - k3]] })}
      {card(k4, C[7].ini, { kicker: "DOCUMENTOS MÉDICOS", chips: [["Exames", 0.3], ["Atestados", w2("atestados,") - k4], ["Laudos médicos", w2("laudos") - k4]] })}
      {card(k5, k6 - 0.1, { kicker: "QUALIDADE DE SEGURADO", chips: [["Carteira assinada", 0.3], ["Trabalhador rural", w2("trabalhador", k5) - k5], ["Segurado especial", w2("especial,") - k5]] })}
      {card(k6, k7 - 0.1, { kicker: "NOMES ATUAIS DOS BENEFÍCIOS", linhas: [["auxílio-doença", "Auxílio por <b>incapacidade temporária</b>"], ["aposentadoria por invalidez", "Aposentadoria por <b>incapacidade permanente</b>"]], fonte: "Emenda Constitucional nº 103/2019" })}
      {card(k7, q - 0.1, { kicker: "O QUE SE ANALISA", chips: [["Documentação", 0.3], ["CNIS", w2("CNIS,") - k7], ["Qualidade de segurado", w2("qualidade", k7) - k7]], texto: "CNIS: Cadastro Nacional de Informações Sociais, o histórico de contribuições no INSS." })}
      {card(k8, k9 - 0.1, { tag: "NOTÍCIA OFICIAL", kicker: "PREVIDÊNCIA · 24/03/2026", titulo: "Novo Atestmed acelera a decisão de análise de benefícios por <b>incapacidade temporária</b>", chips: [["Análise documental", 0.6], ["Até 90 dias", 1.2]], fonte: "gov.br/previdencia · Portaria Conjunta MPS/INSS nº 13/2026" })}
      {card(k9, k10 - 0.1, { kicker: "CASOS MAIS GRAVES", titulo: "Aposentadoria por <b>incapacidade permanente</b>" })}
      {card(k10, k11 - 0.1, { kicker: "PARA COMPROVAR", chips: [["Laudos", 0.3], ["Exames", w2("exames,", k10) - k10], ["Receituário", w2("receituário,") - k10]] })}
      {card(k11, F2, { kicker: "CURTO PRAZO", titulo: "Auxílio por incapacidade temporária pelo <b>Atestmed</b>" })}
      <Sequence durationInFrames={fr(F2)}><Legenda P={P2} fim={F2} /></Sequence>
      <Sequence from={fr(F2)}><Final kicker="DOR NA COLUNA" titulo="Cada caso<br/>é <b>único</b>." sub="Na dúvida, procure orientação profissional." /></Sequence>
      <Sequence durationInFrames={fr(F2 + FIM2)}><Musica fala={F2} final={FIM2} leito={0.05} /></Sequence>
    </AbsoluteFill>
  );
};
