// Exemplo animado da fala "imagine uma mulher que fez abdominoplastia... enfermeira... precisa dos braços":
// enfermeira mais cheinha → emagrece e aparece a cicatriz na barriga → hospital → ergue a caixa com os braços
// → dor na barriga → X: não é compatível com o trabalho.
// v2 (pedido da Talyta, 19/10): sem quadro branco, direto sobre o vídeo, ilustração com volume, respiração,
// piscar de olhos e transições suaves. Legenda no estilo das headlines.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "600", "700", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "900"], subsets: ["latin", "latin-ext"] });
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const CHAMPANHE = "#E6D3B8", TAUPE = "#8C7B6B", VERMELHO = "#C9564D";
const EASE = Easing.bezier(0.42, 0, 0.58, 1);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// tempos (s, relativos ao início do bloco = 42,5 s do vídeo), presos à fala
const T = { emagrece: [1.8, 4.2], cicatriz: [3.9, 5.3], hospital: 9.0, bracos: [14.7, 15.9], dor: 15.7, x: 16.0 };

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/* braço com manga do uniforme + antebraço em pele; ang 0 = caído · 1 = erguido */
const Braco: React.FC<{ x: number; y: number; ang: number; lado: 1 | -1; t: number }> = ({ x, y, ang, lado, t }) => {
  const balanço = Math.sin(t * 2.2) * 2 * (1 - ang);
  const a = (lerp(16, 166, ang) + balanço) * (Math.PI / 180);
  const L1 = 70, L2 = 66;
  const ex = x + lado * Math.sin(a) * L1, ey = y + Math.cos(a) * L1;
  const a2 = a + lado * 0 - (ang > 0.5 ? 0.12 : -0.08) * lado * lado;
  const hx = ex + lado * Math.sin(a2) * L2, hy = ey + Math.cos(a2) * L2;
  return (
    <g>
      <path d={`M${x},${y} L${ex},${ey}`} stroke="#F4F0EB" strokeWidth={30} strokeLinecap="round" />
      <path d={`M${ex},${ey} L${hx},${hy}`} stroke="#C99A7A" strokeWidth={21} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={13} fill="url(#pele)" />
    </g>
  );
};

export const Enfermeira: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const entra = spring({ frame: f, fps: FPS, config: { damping: 15, mass: 0.8 } });
  const sai = interpolate(f, [fr(dur) - 10, fr(dur)], [1, 0], { ...cl, easing: EASE });

  const g = interpolate(t, T.emagrece, [1, 0.2], { ...cl, easing: EASE }); // 1 = mais cheinha
  const cic = interpolate(t, T.cicatriz, [0, 1], { ...cl, easing: EASE });
  const hosp = interpolate(t, [T.hospital, T.hospital + 0.8], [0, 1], { ...cl, easing: EXPO });
  const braco = interpolate(t, T.bracos, [0, 1], { ...cl, easing: Easing.bezier(0.33, 0, 0.2, 1) });
  const tremor = t > T.dor ? Math.sin(t * 38) * 1.6 : 0;
  const dor = t > T.dor ? interpolate(t, [T.dor, T.dor + 0.25], [0, 1], cl) * (0.6 + 0.4 * Math.sin(t * 16)) : 0;
  const xk = spring({ frame: f - fr(T.x), fps: FPS, config: { damping: 13, mass: 0.7 } });
  const respira = Math.sin(t * 2.4) * 1.6; // respiração leve
  const pisca = (t % 3.1) > 3.0 ? 0.15 : 1;

  const cx = 200;
  const ombro = 64 + 18 * g;   // meia-largura nos ombros
  const barriga = 58 + 54 * g; // meia-largura na barriga
  const quadril = 60 + 30 * g;
  const ombroY = 222 + respira * 0.4;

  // legenda por etapa (estilo das headlines)
  const etapas = [
    { k: "IMAGINE", fino: "uma mulher que fez", forte: "ABDOMINOPLASTIA", ini: 0.3 },
    { k: "DEPOIS DA CIRURGIA", fino: "vai passar", forte: "MESES EM RECUPERAÇÃO", ini: T.emagrece[1] + 0.6 },
    { k: "ELA É ENFERMEIRA", fino: "no hospital, precisa", forte: "DOS BRAÇOS", ini: T.hospital },
    { k: "RESULTADO", fino: "não é compatível", forte: "COM O TRABALHO", ini: T.x },
  ];
  const atual = etapas.reduce((acc, e, i) => (t >= e.ini ? i : acc), 0);
  const e = etapas[atual];
  const legK = interpolate(t, [e.ini, e.ini + 0.45], [0, 1], { ...cl, easing: EXPO });
  const prox = etapas[atual + 1];
  const legSai = prox ? interpolate(t, [prox.ini - 0.25, prox.ini], [1, 0], cl) : 1;

  return (
    <AbsoluteFill style={{ fontFamily, opacity: sai }}>
      {/* degradê escuro embaixo (mesmo das headlines), sem quadro */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(20,20,20,0) 46%,rgba(20,20,20,.62) 70%,rgba(20,20,20,.78) 100%)", opacity: entra }} />

      <svg viewBox="0 0 400 520" style={{ position: "absolute", left: 20, top: 1190, width: 470, height: 611,
        opacity: Math.min(1, entra * 1.3), transform: `translateY(${(1 - entra) * 120}px) translateX(${tremor}px)` }}>
        <defs>
          <linearGradient id="uniforme" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E4DDD5" />
          </linearGradient>
          <linearGradient id="pele" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D9AC8B" /><stop offset="1" stopColor="#B9876A" />
          </linearGradient>
          <linearGradient id="cabelo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3B2D25" /><stop offset="1" stopColor="#1C1511" />
          </linearGradient>
          <linearGradient id="calca" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A08E7D" /><stop offset="1" stopColor="#7E6D5E" />
          </linearGradient>
          <radialGradient id="sombra"><stop offset="0" stopColor="rgba(0,0,0,.45)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient>
          <radialGradient id="brilho" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="rgba(230,211,184,.35)" /><stop offset="1" stopColor="rgba(230,211,184,0)" /></radialGradient>
        </defs>

        {/* halo suave atrás da personagem */}
        <circle cx={cx} cy={270} r={190} fill="url(#brilho)" />

        {/* hospital: símbolo "+" em champanhe (sem o emblema da Cruz Vermelha) */}
        <g opacity={hosp} transform={`translate(${330}, ${150 - (1 - hosp) * 20})`}>
          <circle r={34} fill="rgba(230,211,184,.18)" stroke={CHAMPANHE} strokeWidth={2} />
          <rect x={-6} y={-18} width={12} height={36} rx={3} fill={CHAMPANHE} />
          <rect x={-18} y={-6} width={36} height={12} rx={3} fill={CHAMPANHE} />
        </g>

        {/* sombra no chão */}
        <ellipse cx={cx} cy={492} rx={lerp(70, 110, g)} ry={12} fill="url(#sombra)" />

        {/* pernas */}
        <path d={`M${cx - 18 - 14 * g},395 L${cx - 22 - 10 * g},480`} stroke="#8F7E6E" strokeWidth={30} strokeLinecap="round" />
        <path d={`M${cx + 18 + 14 * g},395 L${cx + 22 + 10 * g},480`} stroke="#8F7E6E" strokeWidth={30} strokeLinecap="round" />
        <ellipse cx={cx - 24 - 10 * g} cy={486} rx={20} ry={8} fill="#EDE7E1" />
        <ellipse cx={cx + 24 + 10 * g} cy={486} rx={20} ry={8} fill="#EDE7E1" />

        {/* tronco (uniforme) com volume: ombros → barriga → quadril */}
        <path d={`M${cx - ombro},${ombroY}
                  Q${cx},${ombroY - 18} ${cx + ombro},${ombroY}
                  C${cx + barriga + 10},${ombroY + 60} ${cx + barriga + 6},${340 + respira} ${cx + quadril},${400}
                  Q${cx},${410} ${cx - quadril},${400}
                  C${cx - barriga - 6},${340 + respira} ${cx - barriga - 10},${ombroY + 60} ${cx - ombro},${ombroY} Z`}
          fill="url(#uniforme)" />
        {/* sombreado lateral */}
        <path d={`M${cx + ombro},${ombroY} C${cx + barriga + 10},${ombroY + 60} ${cx + barriga + 6},${340} ${cx + quadril},${400} L${cx + quadril - 22},${400} C${cx + barriga - 14},${340} ${cx + barriga - 10},${ombroY + 60} ${cx + ombro - 18},${ombroY + 4} Z`}
          fill="rgba(140,123,107,.16)" />
        {/* gola em V e bolso */}
        <path d={`M${cx - 26},${ombroY - 8} L${cx},${ombroY + 30} L${cx + 26},${ombroY - 8}`} stroke={TAUPE} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={cx - ombro * 0.75} y={ombroY + 38} width={28} height={32} rx={6} fill="none" stroke="rgba(140,123,107,.6)" strokeWidth={3} />
        <rect x={cx - ombro * 0.75 + 8} y={ombroY + 32} width={4} height={18} rx={2} fill={TAUPE} />

        {/* cicatriz da abdominoplastia: linha desenhada + pontos */}
        <g opacity={cic > 0 ? 1 : 0}>
          <path d={`M${cx - 62},${360} Q${cx},${374} ${cx + 62},${360}`} stroke={VERMELHO} strokeWidth={4} fill="none" strokeLinecap="round"
            strokeDasharray={140} strokeDashoffset={140 * (1 - cic)} />
          {[-48, -29, -10, 9, 28, 47].map((d, i) => {
            const y0 = 360 + 14 * (1 - Math.pow(d / 62, 2)) * 0.5;
            const k = interpolate(cic, [(i + 1) / 8, (i + 2) / 8], [0, 1], cl);
            return <line key={i} x1={cx + d} y1={y0 - 7 * k} x2={cx + d} y2={y0 + 7 * k} stroke={VERMELHO} strokeWidth={2.5} strokeLinecap="round" />;
          })}
        </g>

        {/* dor: faíscas pulsando na barriga */}
        <g opacity={dor} stroke={VERMELHO} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${cx - 92},${352} l-16,-9 l11,-7 l-16,-9`} />
          <path d={`M${cx + 92},${352} l16,-9 l-11,-7 l16,-9`} />
          <circle cx={cx} cy={366} r={30 + dor * 8} stroke="rgba(201,86,77,.45)" strokeWidth={3} />
        </g>

        {/* braços erguidos (na frente) segurando a caixa de material */}
        {braco >= 0.35 && (
          <g transform={`translate(0, ${(1 - braco) * 70})`} opacity={interpolate(braco, [0.4, 0.8], [0, 1], cl)}>
            <rect x={cx - 92} y={34} width={184} height={58} rx={10} fill="#E9DCC7" />
            <rect x={cx - 92} y={34} width={184} height={14} rx={7} fill="rgba(140,123,107,.25)" />
            <rect x={cx - 7} y={48} width={14} height={34} rx={3} fill={TAUPE} />
            <rect x={cx - 17} y={58} width={34} height={14} rx={3} fill={TAUPE} />
          </g>
        )}
        <Braco x={cx - ombro + 6} y={ombroY + 12} ang={braco} lado={-1} t={t} />
        <Braco x={cx + ombro - 6} y={ombroY + 12} ang={braco} lado={1} t={t} />

        {/* pescoço, cabelo e rosto */}
        <rect x={cx - 13} y={178} width={26} height={34} rx={10} fill="url(#pele)" />
        <path d={`M${cx - 48},${150} Q${cx - 52},${84} ${cx},${82} Q${cx + 52},${84} ${cx + 48},${150} Q${cx + 52},${186} ${cx + 30},${192} L${cx - 30},${192} Q${cx - 52},${186} ${cx - 48},${150} Z`} fill="url(#cabelo)" />
        <ellipse cx={cx} cy={142} rx={39 + 5 * g} ry={44 + 3 * g} fill="url(#pele)" />
        <path d={`M${cx - 44},${132} Q${cx - 34},${92} ${cx},${96} Q${cx + 34},${92} ${cx + 44},${132} Q${cx + 22},${110} ${cx + 2},${114} Q${cx - 24},${110} ${cx - 44},${132} Z`} fill="url(#cabelo)" />
        {/* touca */}
        <path d={`M${cx - 36},${102} Q${cx},${88} ${cx + 36},${102} L${cx + 28},${76} Q${cx},${68} ${cx - 28},${76} Z`} fill="url(#uniforme)" />
        <rect x={cx - 3} y={78} width={6} height={15} rx={2} fill={TAUPE} />
        <rect x={cx - 7.5} y={82.5} width={15} height={6} rx={2} fill={TAUPE} />
        {/* olhos (piscam), sobrancelhas e boca: tranquila → dor */}
        <ellipse cx={cx - 14} cy={142} rx={4} ry={4.5 * pisca} fill="#2B211C" />
        <ellipse cx={cx + 14} cy={142} rx={4} ry={4.5 * pisca} fill="#2B211C" />
        {t > T.dor
          ? <>
              <path d={`M${cx - 22},${128} L${cx - 8},${132}`} stroke="#2B211C" strokeWidth={3} strokeLinecap="round" />
              <path d={`M${cx + 22},${128} L${cx + 8},${132}`} stroke="#2B211C" strokeWidth={3} strokeLinecap="round" />
              <path d={`M${cx - 11},${170} Q${cx},${161} ${cx + 11},${170}`} stroke="#2B211C" strokeWidth={3.5} fill="none" strokeLinecap="round" />
            </>
          : <path d={`M${cx - 11},${161} Q${cx},${170} ${cx + 11},${161}`} stroke="#2B211C" strokeWidth={3.5} fill="none" strokeLinecap="round" />}
        <ellipse cx={cx - 26} cy={158} rx={8} ry={5} fill="#E39B8A" opacity={0.45} />
        <ellipse cx={cx + 26} cy={158} rx={8} ry={5} fill="#E39B8A" opacity={0.45} />
      </svg>

      {/* X fino desenhado, com brilho: não é compatível com o trabalho */}
      <svg viewBox="0 0 200 200" style={{ position: "absolute", left: 85, top: 1290, width: 340, height: 340,
        opacity: Math.min(1, xk * 1.3), transform: `scale(${0.7 + 0.3 * xk})`, filter: "drop-shadow(0 0 18px rgba(201,86,77,.55))" }}>
        <circle cx={100} cy={100} r={86} fill="rgba(201,86,77,.10)" stroke={VERMELHO} strokeWidth={6}
          strokeDasharray={541} strokeDashoffset={541 * (1 - Math.min(1, xk * 1.2))} />
        <path d="M60,60 L140,140" stroke={VERMELHO} strokeWidth={12} strokeLinecap="round" strokeDasharray={114} strokeDashoffset={114 * (1 - Math.min(1, Math.max(0, xk * 1.6 - 0.3)))} />
        <path d="M140,60 L60,140" stroke={VERMELHO} strokeWidth={12} strokeLinecap="round" strokeDasharray={114} strokeDashoffset={114 * (1 - Math.min(1, Math.max(0, xk * 1.6 - 0.6)))} />
      </svg>

      {/* legenda da etapa, no estilo das headlines */}
      <div style={{ position: "absolute", left: 500, right: 60, top: 1430, opacity: legK * legSai, transform: `translateY(${(1 - legK) * 28}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46 * legK, height: 3, background: CHAMPANHE }} />
          <div style={{ fontSize: 20, letterSpacing: "0.28em", fontWeight: 700, color: CHAMPANHE }}>{e.k}</div>
        </div>
        <div style={{ marginTop: 12, fontSize: 52, lineHeight: 1, fontWeight: 200, fontStyle: "italic", color: "#fff", letterSpacing: "-0.04em" }}>{e.fino}</div>
        <div style={{ marginTop: 6, fontSize: e.forte.length > 14 ? 54 : 66, lineHeight: 0.95, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.05em",
          color: atual === 3 ? "#F0B3AC" : CHAMPANHE, textShadow: "0 0 22px rgba(230,211,184,.35)" }}>{e.forte}</div>
      </div>
    </AbsoluteFill>
  );
};
