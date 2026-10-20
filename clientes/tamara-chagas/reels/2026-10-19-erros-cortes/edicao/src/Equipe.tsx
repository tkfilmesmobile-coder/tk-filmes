// Reels com a equipe (Rita e Sales) · Tamara Chagas Advocacia · 19/10/2026
// Pedido da Talyta: esse tipo de vídeo não pede headline forte, e sim zoom in / zoom out pra dar intensidade.
// Cortes: só as tentativas boas, inteiras, com respiro curto antes e depois da fala.
// Camadas: vídeo por EDL (zoom preso ao tempo do bruto) · legenda falada discreta · nome de quem fala · cartão final com a fonte.
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
const OFF = "#ECEBE9", GRAFITE = "#141414", TAUPE = "#8C7B6B", CHAMPANHE = "#E6D3B8";
const fr = (s: number) => Math.round(s * FPS);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE = Easing.bezier(0.42, 0, 0.58, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Corte = { a: number; b: number };
type Zoom = [number, number, number]; // [início, fim, escala] no tempo do BRUTO
type Fala = [number, number, string]; // [início, fim, texto] no tempo do BRUTO
type Nome = [number, string, string]; // [tempo do bruto, nome, função]
export type Roteiro = {
  src: string; cortes: Corte[]; zooms: Zoom[]; falas: Fala[]; nomes: Nome[];
  selo: string; fim: { kicker: string; forte: string; texto: string; fonte: string };
};

const FIM_CARD = fr(4.2);
export const duracao = (r: Roteiro) => r.cortes.reduce((s, c) => s + fr(c.b) - fr(c.a), 0) + FIM_CARD;
const inicios = (r: Roteiro) => r.cortes.map((_, i) => r.cortes.slice(0, i).reduce((s, c) => s + fr(c.b) - fr(c.a), 0));
// tempo do bruto -> frame do vídeo editado (null se o trecho foi cortado)
const noVideo = (r: Roteiro, t: number) => {
  const ini = inicios(r);
  for (let i = 0; i < r.cortes.length; i++) if (t >= r.cortes[i].a && t < r.cortes[i].b) return ini[i] + fr(t - r.cortes[i].a);
  return null;
};

/* zoom in nas ênfases e zoom out pra respirar, contínuo entre os cortes */
const escala = (zooms: Zoom[], t: number) => {
  let s = 1;
  for (const [a, b, z] of zooms) {
    const k = Math.min(interpolate(t, [a, a + 0.22], [0, 1], { ...cl, easing: EXPO }), interpolate(t, [b - 0.3, b], [1, 0], { ...cl, easing: EASE }));
    s = Math.max(s, 1 + (z - 1) * k);
  }
  return s;
};

const Clipe: React.FC<{ r: Roteiro; c: Corte }> = ({ r, c }) => {
  const f = useCurrentFrame();
  const t = c.a + f / FPS;
  const respira = 1 + 0.012 * Math.sin(t * 0.9); // leve "câmera viva" mesmo sem ênfase
  return (
    <AbsoluteFill style={{ transform: `scale(${escala(r.zooms, t) * respira})`, transformOrigin: "50% 34%" }}>
      <OffthreadVideo src={staticFile(r.src)} trimBefore={fr(c.a)} trimAfter={fr(c.b)} />
    </AbsoluteFill>
  );
};

/* legenda falada: discreta, minúscula, branca com sombra, a ~70% da altura (fora do rosto) */
const Legenda: React.FC<{ txt: string; dur: number }> = ({ txt, dur }) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 5], [0, 1], { ...cl, easing: EXPO });
  const sai = interpolate(f, [dur - 3, dur], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1340, textAlign: "center", fontFamily, opacity: e * sai, transform: `translateY(${(1 - e) * 12}px)` }}>
      <span style={{ fontSize: 50, fontWeight: 700, color: "#fff", lineHeight: 1.25, letterSpacing: "-0.01em",
        textShadow: "0 3px 12px rgba(0,0,0,.75), 0 0 2px rgba(0,0,0,.9)" }}>{txt}</span>
    </div>
  );
};

/* nome de quem fala (pílula no alto, longe do rosto) */
const NomeTag: React.FC<{ nome: string; funcao: string }> = ({ nome, funcao }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f, fps: FPS, config: { damping: 12, mass: 0.5 } });
  const sai = interpolate(f, [fr(2.6) - 8, fr(2.6)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: 60, top: 220, fontFamily, opacity: Math.min(1, e * 1.3) * sai, transform: `translateX(${(1 - e) * -60}px)` }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: OFF, borderRadius: 999, padding: "12px 26px 12px 12px", boxShadow: "0 14px 32px rgba(0,0,0,.28)" }}>
        <div style={{ background: GRAFITE, color: CHAMPANHE, borderRadius: 999, padding: "8px 18px", fontSize: 24, fontWeight: 800, letterSpacing: "0.12em" }}>{nome}</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: TAUPE }}>{funcao}</div>
      </div>
    </div>
  );
};

/* selo da série no começo */
const Selo: React.FC<{ txt: string }> = ({ txt }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f, fps: FPS, config: { damping: 13, mass: 0.6 } });
  const sai = interpolate(f, [fr(3.2) - 8, fr(3.2)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily, opacity: Math.min(1, e * 1.3) * sai, transform: `translateY(${(1 - e) * -30}px)` }}>
      <span style={{ background: GRAFITE, color: CHAMPANHE, borderRadius: 999, padding: "12px 28px", fontSize: 26, fontWeight: 800, letterSpacing: "0.22em" }}>{txt}</span>
    </div>
  );
};

/* cartão final com a informação correta e a fonte (exigência da OAB e regra da casa) */
const Fim: React.FC<{ fim: Roteiro["fim"] }> = ({ fim }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 12], [0, 1], { ...cl, easing: EXPO });
  const b = spring({ frame: f - 6, fps: FPS, config: { damping: 12, mass: 0.6 } });
  return (
    <AbsoluteFill style={{ background: OFF, fontFamily, padding: "0 90px", justifyContent: "center", opacity: a }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 70 * a, height: 3, background: TAUPE }} />
        <div style={{ fontSize: 24, letterSpacing: "0.3em", fontWeight: 700, color: TAUPE }}>{fim.kicker}</div>
      </div>
      <div style={{ marginTop: 30, fontSize: 84, lineHeight: 1, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.05em", color: GRAFITE, transform: `translateY(${(1 - b) * 40}px)`, opacity: Math.min(1, b * 1.3) }}
        dangerouslySetInnerHTML={{ __html: fim.forte }} />
      <div style={{ marginTop: 34, fontSize: 40, lineHeight: 1.35, fontWeight: 300, color: "#333", opacity: b }} dangerouslySetInnerHTML={{ __html: fim.texto }} />
      <div style={{ marginTop: 60, fontSize: 24, color: "#555", opacity: b }}><b style={{ letterSpacing: "0.2em", fontSize: 20, marginRight: 12 }}>FONTE</b>{fim.fonte}</div>
      <div style={{ position: "absolute", bottom: 210, left: 90, fontSize: 26, fontWeight: 600, letterSpacing: "0.14em", color: TAUPE }}>TAMARA CHAGAS ADVOCACIA · CADA CASO É ÚNICO</div>
    </AbsoluteFill>
  );
};

const S = (fq: number | null, nome: string, v: number) => (fq === null ? null : <Sequence from={Math.max(0, fq)}><Audio src={staticFile(`sfx/${nome}.wav`)} volume={v} /></Sequence>);

export const Equipe: React.FC<{ r: Roteiro }> = ({ r }) => {
  const ini = inicios(r);
  const total = duracao(r) - FIM_CARD;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {r.cortes.map((c, i) => <Sequence key={i} from={ini[i]} durationInFrames={fr(c.b) - fr(c.a)}><Clipe r={r} c={c} /></Sequence>)}
      {r.falas.map(([a, b, txt], i) => {
        const fa = noVideo(r, a), fb = noVideo(r, Math.min(b, r.cortes.find((c) => a >= c.a && a < c.b)?.b ?? b) - 0.001);
        if (fa === null || fb === null) return null;
        return <Sequence key={`l${i}`} from={fa} durationInFrames={Math.max(6, fb - fa)}><Legenda txt={txt} dur={Math.max(6, fb - fa)} /></Sequence>;
      })}
      {r.nomes.map(([t, n, fn], i) => { const fq = noVideo(r, t); return fq === null ? null : <Sequence key={`n${i}`} from={fq} durationInFrames={fr(2.6)}><NomeTag nome={n} funcao={fn} /></Sequence>; })}
      <Sequence from={4} durationInFrames={fr(3.2)}><Selo txt={r.selo} /></Sequence>
      <Sequence from={total} durationInFrames={FIM_CARD}><Fim fim={r.fim} /></Sequence>
      {/* trilha própria bem baixa (a rua já tem som) e sobe no cartão final */}
      <Audio src={staticFile("sfx/trilha-feira.wav")} loop volume={(f) => (f >= total ? 0.3 : 0.05)} />
      {/* SFX graves nos zoom-ins fortes (regra de 14/10) */}
      {r.zooms.filter(([, , z]) => z >= 1.18).map(([a], i) => <React.Fragment key={`z${i}`}>{S(noVideo(r, a) === null ? null : (noVideo(r, a) as number) - 5, "whoosh-grave", 0.35)}</React.Fragment>)}
      {r.nomes.map(([t], i) => <React.Fragment key={`p${i}`}>{S(noVideo(r, t), "pop", 0.35)}</React.Fragment>)}
      {S(total - 6, "whoosh-grave-impacto", 0.7)}{S(total + 5, "thump2", 0.65)}
    </AbsoluteFill>
  );
};

/* ---------------- roteiros ---------------- */
// 1 · "A vizinha disse" · aposentado pode fazer bico? (bruto b.mp4 · 85,6 s)
export const VIZINHA: Roteiro = {
  src: "b.mp4",
  // correção de 20/10 (Talyta: takes errados, falas cortadas, legenda errada) · limites conferidos com whisper em janelas
  cortes: [
    { a: 18.6, b: 28.0 },    // Sales, 2ª tentativa (completa): "Ô Rita, tu soube... aposentadoria todinha"
    { a: 32.55, b: 45.5 },   // Rita: "Ô menino... auxílio-doença, foi? ... arrumar um bico." (antes cortava "um bico")
    { a: 49.5, b: 54.0 },    // Sales, 1ª tentativa limpa: "Oxe, mas ele se aposentou. E minha comadre disse..."
    { a: 77.8, b: 85.45 },   // Rita sai brava (mão na cabeça, joga os braços) e o Sales: "Isso é doido, homem!" · "É mesmo?" + risadas
  ],
  zooms: [
    [21.0, 22.3, 1.14], [24.0, 25.0, 1.24], [25.6, 28.0, 1.12],
    [32.6, 34.9, 1.1], [38.3, 40.9, 1.18], [42.3, 45.5, 1.2],
    [49.6, 51.0, 1.2], [52.4, 54.0, 1.24], [81.7, 85.45, 1.12],
  ],
  // legendas presas às palavras (whisper -ml 1 por corte, beam padrão), texto conferido à mão
  falas: [
    [18.6, 22.6, "ô Rita, tu soube que seu Aristide se aposentou?"],
    [22.6, 24.95, "e agora arrumou um bico."],
    [25.0, 28.0, "aquele velho vai perder a aposentadoria todinha 😱"],
    [32.55, 35.8, "ô menino, tu não bota na tua cabeça, não."],
    [35.8, 38.7, "vem cá. e ele se aposentou?"],
    [38.73, 40.55, "ele foi afastado por auxílio-doença, foi?"],
    [40.55, 45.5, "ele é doente? é que ele não pode se aposentar e arrumar um bico."],
    [49.5, 51.26, "oxe, mas ele se aposentou."],
    [51.26, 54.0, "e minha comadre disse que quem se aposenta não pode trabalhar, não 🤔"],
    [81.5, 83.5, "isso é doido, homem!"],
    [83.5, 84.2, "é mesmo?"],
    [84.2, 85.45, "😂😂😂"],
  ],
  nomes: [[18.7, "SALES", "a fofoca"], [32.6, "RITA", "financeiro"]],
  selo: "A VIZINHA DISSE · EP. 01",
  fim: {
    kicker: "A VIZINHA DISSE... MAS NÃO É BEM ASSIM",
    forte: "Aposentado por idade ou tempo de contribuição <span style='color:#8C7B6B'>pode trabalhar.</span>",
    texto: "Quem recebe <b>por incapacidade</b> (auxílio-doença ou aposentadoria por incapacidade) é que não pode voltar a trabalhar e continuar recebendo.",
    fonte: "Lei 8.213/1991, arts. 18, §2º; 46 e 60, §6º",
  },
};

// 2 · Trabalhador rural tem direito sem contribuir? (bruto a.mp4 · 96,4 s)
export const RURAL: Roteiro = {
  src: "a.mp4",
  cortes: [
    { a: 27.35, b: 33.05 },  // Rita, 3ª tentativa (a única completa)
    { a: 64.85, b: 94.2 },   // Sales, 3ª tentativa (sem as risadas antes), inteira até "procura alguém que entende"
  ],
  zooms: [
    [29.6, 30.8, 1.14], [31.8, 33.05, 1.2],
    [65.0, 66.6, 1.22], [67.9, 70.6, 1.12], [72.2, 74.5, 1.15], [76.9, 78.5, 1.2],
    [79.6, 81.9, 1.12], [83.0, 89.2, 1.08], [91.4, 92.6, 1.25], [92.7, 94.2, 1.1],
  ],
  falas: [
    [27.5, 30.7, "quem trabalha na roça e nunca pagou o INSS"],
    [30.7, 33.05, "tem direito de receber um auxílio-doença? 🤔"],
    [65.0, 66.9, "claro que sim."],
    [67.0, 70.6, "o INSS reconhece o trabalhador rural como segurado especial."],
    [70.7, 72.2, "isso já garante um benefício,"],
    [72.2, 74.5, "como salário-maternidade, auxílio-doença"],
    [74.5, 76.5, "e até aposentadoria também,"],
    [76.5, 78.5, "sem ter pago nenhuma contribuição."],
    [78.5, 82.0, "pra isso, a gente precisa comprovar que a pessoa é agricultor."],
    [82.1, 85.8, "existem infinitas formas de provar: documentação da terra,"],
    [85.9, 89.4, "de sindicato, de cadastros bancários."],
    [89.4, 91.35, "e isso já garante a ele um benefício."],
    [91.4, 92.55, "quer uma dica?"],
    [92.6, 94.2, "procura alguém que entende 😉"],
  ],
  nomes: [[27.5, "RITA", "financeiro"], [65.0, "SALES", "equipe"]],
  selo: "PERGUNTA PRO SALES",
  fim: {
    kicker: "PRA LEMBRAR",
    forte: "Trabalhador rural é <span style='color:#8C7B6B'>segurado especial.</span>",
    texto: "Quem trabalha na roça em regime de economia familiar <b>pode ter direito</b> a benefícios sem contribuir mês a mês, <b>provando o trabalho no campo</b>.",
    fonte: "Lei 8.213/1991, arts. 11, VII; 39 e 106",
  },
};
