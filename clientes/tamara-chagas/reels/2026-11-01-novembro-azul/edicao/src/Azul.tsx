// Dra. Tamara · Novembro Azul (bruto já com as falas certas, 01/11/2026). Estética do escritório com acento azul do tema.
import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["200", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = Math.round(85.1 * FPS);
const OFF = "#ECEBE9", GRAFITE = "#141414", AZUL = "#7DBDF2", AZUL_FORTE = "#1F5FA8";
const fr = (s: number) => Math.round(s * FPS);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const EASE = Easing.bezier(0.42, 0, 0.58, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ZOOMS: [number, number, number, number][] = [
  [33.9, 37.2, 1.12, 0.28], // "não espere adoecer"
  [58.9, 62.5, 1.1, 0.28], // "nenhum benefício substitui a sua saúde"
  [78.3, 84.7, 1.1, 0.28], // "amor próprio"
];
function camera(f: number) {
  for (const [a, b, s, oy] of ZOOMS) {
    const fa = fr(a), fb = fr(b);
    if (f >= fa && f < fb) {
      const k = Math.min(interpolate(f, [fa, fa + 6], [0, 1], { ...cl, easing: EXPO }), interpolate(f, [fb - 8, fb], [1, 0], { ...cl, easing: EASE }));
      return { transform: `scale(${1 + (s - 1) * k})`, transformOrigin: `50% ${oy * 100}%` };
    }
  }
  return { transform: "scale(1)", transformOrigin: "50% 30%" };
}

// laço do Novembro Azul
const Laco: React.FC<{ s?: number; cor?: string }> = ({ s = 34, cor = AZUL }) => (
  <svg width={s} height={s * 1.3} viewBox="0 0 40 52">
    <path d="M20 22c-5-6-8-10-8-14a8 8 0 0 1 16 0c0 4-3 8-8 14z" fill="none" stroke={cor} strokeWidth={5} />
    <path d="M20 22L9 48M20 22l11 26" stroke={cor} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

const Headline: React.FC<{ kicker: string; fino: string; forte: string; dur: number }> = ({ kicker, fino, forte, dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 12], [0, 1], { ...cl, easing: EXPO });
  const b = spring({ frame: f - 6, fps: FPS, config: { damping: 12, mass: 0.6 } });
  const fio = interpolate(f, [4, 22], [0, 1], { ...cl, easing: EXPO });
  const sai = interpolate(f, [fr(dur) - 8, fr(dur)], [1, 0], cl);
  const tam = Math.min(132, Math.floor(1700 / Math.max(6, forte.length)));
  return (
    <AbsoluteFill style={{ fontFamily, opacity: sai }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(8,20,40,0) 52%,rgba(8,20,40,.78) 80%)", opacity: a }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1300 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 70 * fio, height: 3, background: AZUL }} />
          <div style={{ fontSize: 22, letterSpacing: "0.3em", fontWeight: 700, color: AZUL, opacity: fio }}>{kicker}</div>
        </div>
        <div style={{ marginTop: 14, fontSize: 80, lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 200, fontStyle: "italic", color: "#fff", opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>{fino}</div>
        <div style={{ fontSize: tam, lineHeight: 0.95, letterSpacing: "-0.055em", fontWeight: 900, fontStyle: "italic", color: AZUL, transform: `translateX(${(1 - b) * -80}px) scale(${0.85 + 0.15 * b})`, transformOrigin: "left center", opacity: Math.min(1, b * 1.3), textShadow: "0 0 24px rgba(125,189,242,.45)" }}>{forte}</div>
      </div>
    </AbsoluteFill>
  );
};

const Selo: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const e = spring({ frame: f, fps: FPS, config: { damping: 11, mass: 0.5 } });
  const sai = interpolate(f, [fr(dur) - 8, fr(dur)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", right: 60, top: 220, fontFamily, opacity: Math.min(1, e * 1.3) * sai, transform: `scale(${e}) rotate(${(1 - e) * 8}deg)`, transformOrigin: "right top" }}>
      <div style={{ background: OFF, borderRadius: 26, padding: "16px 26px", boxShadow: "0 18px 40px rgba(0,0,0,.3)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: AZUL_FORTE, display: "flex", alignItems: "center", justifyContent: "center" }}><Laco s={30} cor="#fff" /></div>
        <div>
          <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", color: GRAFITE, lineHeight: 1 }}>NOVEMBRO</div>
          <div style={{ fontSize: 22, letterSpacing: "0.28em", fontWeight: 800, color: AZUL_FORTE, marginTop: 4 }}>AZUL</div>
        </div>
      </div>
    </div>
  );
};

const Cards: React.FC<{ titulo: string; itens: [string, string][]; dur: number }> = ({ titulo, itens, dur }) => {
  const f = useCurrentFrame();
  const sai = interpolate(f, [fr(dur) - 8, fr(dur)], [1, 0], cl);
  const t = interpolate(f, [0, 10], [0, 1], { ...cl, easing: EXPO });
  return (
    <AbsoluteFill style={{ fontFamily, opacity: sai }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(8,20,40,0) 50%,rgba(8,20,40,.75) 78%)", opacity: t }} />
      <div style={{ position: "absolute", left: 70, top: 1250, fontSize: 22, letterSpacing: "0.3em", fontWeight: 700, color: AZUL, opacity: t }}>{titulo}</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1300, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {itens.map(([ic, txt], i) => {
          const sp = spring({ frame: f - 4 - i * 12, fps: FPS, config: { damping: 12, mass: 0.5 } });
          const escuro = i % 3 === 0;
          return (
            <div key={i} style={{ background: escuro ? AZUL_FORTE : OFF, color: escuro ? "#fff" : GRAFITE, borderRadius: 22, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16,
              boxShadow: "0 16px 36px rgba(0,0,0,.3)", transform: `translateY(${(1 - sp) * 120}px) rotate(${(1 - sp) * 5}deg)`, opacity: Math.min(1, sp * 1.5) }}>
              <span style={{ fontSize: 44 }}>{ic}</span>
              <span style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{txt}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const S = (t: number, nome: string, v: number) => <Sequence from={fr(t)}><Audio src={staticFile(`sfx/${nome}.wav`)} volume={v} /></Sequence>;
const Q = (t0: number, t1: number, el: React.ReactNode) => <Sequence from={fr(t0)} durationInFrames={fr(t1 - t0)}>{el}</Sequence>;
const H: [number, number, string, string, string][] = [
  [0.1, 5.6, "NOVEMBRO AZUL", "mês da", "SAÚDE DO HOMEM."],
  [5.7, 10.3, "PREVENÇÃO", "em especial, o", "CÂNCER DE PRÓSTATA."],
  [14.4, 21.3, "NO ESCRITÓRIO", "uma vida inteira", "TRABALHANDO."],
  [21.4, 25.7, "E A SAÚDE?", "fica sempre", "PRA DEPOIS."],
  [26.6, 33.6, "O QUE ACONTECE", "só procuram ajuda quando", "JÁ NÃO TRABALHAM."],
  [33.8, 37.5, "MAS ATENÇÃO", "não espere", "ADOECER."],
  [52.8, 58.6, "PREVIDÊNCIA SOCIAL", "existe para", "PROTEGER O TRABALHADOR."],
  [58.8, 62.9, "MAS LEMBRE", "nenhum benefício", "SUBSTITUI A SAÚDE."],
  [63.2, 70.8, "CUIDAR DA SAÚDE", "é cuidar da", "SUA FAMÍLIA."],
  [74.2, 78.2, "FICA O RECADO", "homem,", "SEM PRECONCEITO."],
  [78.3, 85.1, "SE CUIDAR É", "responsabilidade e", "AMOR PRÓPRIO."],
];

export const Azul: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={camera(f)}><OffthreadVideo src={staticFile("video.mp4")} /></AbsoluteFill>
      {H.map(([a, b, k, fi, fo]) => <React.Fragment key={a}>{Q(a, b, <Headline kicker={k} fino={fi} forte={fo} dur={b - a} />)}</React.Fragment>)}
      {Q(0.4, 9.8, <Selo dur={9.4} />)}
      {Q(37.6, 52.7, <Cards titulo="EXAME DE PRÓSTATA" dur={15.1} itens={[["🩺", "A partir dos 50 anos"], ["⚠️", "Antes, se houver risco"], ["💬", "Converse com o médico"], ["✔️", "Decisão individual"]]} />)}
      {Q(71.0, 73.9, <Selo dur={2.9} />)}
      {H.map(([a], i) => <React.Fragment key={`s${i}`}>{S(Math.max(0, a - 0.25), i % 2 ? "whoosh-grave" : "whoosh-grave-impacto", 0.55)}{S(a + 0.2, i % 2 ? "thump" : "thump2", 0.6)}</React.Fragment>)}
      {S(37.35, "whoosh-grave-cards", 0.7)}
      {[0, 1, 2, 3].map((i) => <React.Fragment key={`c${i}`}>{S(37.75 + i * 0.4, `card-${i + 1}`, 0.5)}</React.Fragment>)}
      {S(0.4, "pop", 0.45)}{S(71.0, "pop", 0.45)}
    </AbsoluteFill>
  );
};
