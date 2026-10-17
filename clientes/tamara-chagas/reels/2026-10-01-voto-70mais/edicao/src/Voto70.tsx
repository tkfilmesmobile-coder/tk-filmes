import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";
import transcricao from "../public/transcricao.json";
import { criarCamera } from "./camera";

const { fontFamily } = loadFont("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin", "latin-ext"] });

export const FPS = 30;
export const DURACAO = Math.ceil(25.1 * FPS);
const camera = criarCamera(DURACAO, FPS);
const f = (s: number) => Math.round(s * FPS);
const EASE = Easing.bezier(0.42, 0, 0.58, 1); // Easy Ease

// Paleta do escritório: rosa, vinho, branco, grafite e rose-gold.
const ROSA = "#F4A3C0";
const VINHO = "#7A1E3A";
const ROSE_GOLD = "linear-gradient(90deg,#c98f72,#f3d2bf,#c98f72)";

/* ---------------- enquadramento (BASE 100–104 · ÊNFASE 109–114 · CLOSE 120–126) ---------------- */
type Plano = { t: number; s: number; ate?: number; dur?: number; x: number; suaveX?: boolean };
const PLANOS: Plano[] = [
  { t: 0, s: 1.04, ate: 1.11, dur: 6, x: 0 }, // abre no rosto + punch-in
  { t: 2.93, s: 1.03, x: 0 }, // BASE
  { t: 7.05, s: 1.04, x: 0 }, // reframe sutil pra abrir espaço ao calendário
  { t: 9.17, s: 1.11, x: 0 }, // ÊNFASE: 70 anos ou mais
  { t: 13.0, s: 1.04, x: 0 }, // BASE: sem multa
  { t: 16.76, s: 1.12, ate: 1.04, dur: 8, x: 0 }, // punch-out: pode ficar tranquilo
  { t: 18.13, s: 1.22, x: 0 }, // CLOSE EDITORIAL: reforço
  { t: 21.65, s: 1.04, x: 0 }, // BASE + espaço pra urna
];

function plano(frame: number) {
  let i = 0;
  for (let k = 0; k < PLANOS.length; k++) if (frame >= f(PLANOS[k].t)) i = k;
  const p = PLANOS[i], ini = f(p.t);
  const s = p.ate ? interpolate(frame, [ini, ini + (p.dur ?? 6)], [p.s, p.ate], { extrapolateRight: "clamp", easing: EASE }) : p.s;
  const xAnt = i > 0 ? PLANOS[i - 1].x : 0;
  const x = p.suaveX ? interpolate(frame, [ini, ini + 8], [xAnt, p.x], { extrapolateRight: "clamp", easing: EASE }) : p.x;
  const limite = (s - 1) * 540; // nunca deixa aparecer borda preta
  return { s, x: Math.max(-limite, Math.min(limite, x)) };
}

/* ---------------- headline ---------------- */
const Headline: React.FC<{ de: number; ate: number; l1: React.ReactNode; l2?: React.ReactNode; atraso2?: number; grande2?: boolean }> = ({ de, ate, l1, l2, atraso2 = 4, grande2 }) => {
  const frame = useCurrentFrame();
  const entra = (d: number) => interpolate(frame, [de + d, de + d + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const sai = interpolate(frame, [ate - 5, ate], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < de || frame > ate) return null;
  const a = entra(0), b = entra(atraso2);
  return (
    <div style={{ position: "absolute", left: 72, right: 72, top: 1290, fontFamily, opacity: sai }}>
      <div style={{ width: 64 * a, height: 5, borderRadius: 3, background: ROSE_GOLD, marginBottom: 22 }} />
      <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.02em", color: "#fff", opacity: a, translate: `0 ${(1 - a) * 20}px`, textShadow: "0 4px 30px rgba(40,10,25,.45)" }}>{l1}</div>
      {l2 && (
        <div style={{ marginTop: 14, fontSize: grande2 ? 78 : 46, fontWeight: grande2 ? 800 : 600, letterSpacing: grande2 ? "-0.02em" : "0.04em", lineHeight: 1.05, color: "#fff", opacity: b, translate: `0 ${(1 - b) * 20}px`, textShadow: "0 4px 30px rgba(40,10,25,.45)" }}>{l2}</div>
      )}
    </div>
  );
};
const R: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: ROSA }}>{children}</span>;

/* ---------------- asset hero: entrada 8 frames + micro movimento ---------------- */
const Asset: React.FC<{ src: string; de: number; ate: number; left: number; top: number; largura: number; lateral?: boolean; rotulo?: React.ReactNode }> = ({ src, de, ate, left, top, largura, lateral, rotulo }) => {
  const frame = useCurrentFrame();
  if (frame < de || frame > ate) return null;
  const t = interpolate(frame, [de, de + 8], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const saida = interpolate(frame, [ate - 5, ate], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vivo = (frame - de) / FPS;
  const micro = 1 + 0.015 * (0.5 - 0.5 * Math.cos(vivo * 1.6)); // 100% → 101,5%
  const dx = Math.sin(vivo * 1.3) * 3, dy = Math.cos(vivo * 1.1) * 3; // 2–4 px
  const escala = (0.92 + 0.08 * t) * micro;
  const y = (1 - t) * (lateral ? 0 : 24);
  const x = lateral ? (1 - t) * 160 : 0;
  const rot = lateral ? (1 - t) * 10 : -(1 - t) * 4;
  const blur = (1 - t) * 3; // motion blur só durante o deslocamento
  return (
    <div style={{ position: "absolute", left, top, width: largura, opacity: Math.min(t * 1.4, 1) * saida, perspective: 1200 }}>
      <Img src={staticFile(src)} style={{ width: "100%", transform: `translate(${x + dx}px, ${y + dy}px) rotateY(${rot}deg) rotateZ(${lateral ? 0 : rot * 0.4}deg) scale(${escala})`, filter: `drop-shadow(0 34px 38px rgba(60,10,30,.38)) blur(${blur}px)` }} />
      {rotulo && (
        <div style={{ marginTop: 18, textAlign: "center", fontFamily, fontSize: 30, fontWeight: 700, letterSpacing: "0.06em", color: "#fff", textShadow: "0 3px 18px rgba(40,10,25,.6)", opacity: interpolate(frame, [de + 6, de + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{rotulo}</div>
      )}
    </div>
  );
};

/* ---------------- bonequinha: entra no espaço vazio, no máximo 1 s ---------------- */
const Bonequinha: React.FC<{ src: string; de: number; ate: number }> = ({ src, de, ate }) => {
  const frame = useCurrentFrame();
  if (frame < de || frame > ate) return null;
  const t = interpolate(frame, [de, de + 7], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const s = interpolate(frame, [ate - 6, ate], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const v = Math.min(t, s);
  return (
    <Img src={staticFile(src)} style={{ position: "absolute", right: -20, top: 760, width: 400, opacity: v, WebkitMaskImage: "linear-gradient(180deg,#000 72%,transparent 100%)", transform: `translateX(${(1 - v) * 60}px) scale(${0.92 + 0.08 * v})`, filter: `drop-shadow(0 26px 30px rgba(60,10,30,.35)) blur(${(1 - t) * 2}px)` }} />
  );
};

/* ---------------- legendas: máx. 2 linhas, uma palavra em rosa por bloco ---------------- */
type Palavra = { texto: string; de: number; ate: number };
const DESTAQUES = ["obrigado", "outubro", "idoso", "domingo", "votar", "70", "justificar", "penalidade", "tranquilo", "quiser", "disposição"];
function blocos(): { palavras: Palavra[]; de: number; ate: number }[] {
  const ps: Palavra[] = (transcricao as { transcription: { text: string; offsets: { from: number; to: number } }[] }).transcription
    .filter((s) => s.text.trim())
    .map((s) => ({ texto: s.text.trim(), de: s.offsets.from / 1000, ate: s.offsets.to / 1000 }));
  const out: { palavras: Palavra[]; de: number; ate: number }[] = [];
  let atual: Palavra[] = [];
  ps.forEach((p, i) => {
    atual.push(p);
    const prox = ps[i + 1], chars = atual.map((x) => x.texto).join(" ").length;
    if (!prox || prox.de - p.ate > 0.3 || atual.length >= 5 || chars > 24) {
      out.push({ palavras: atual, de: atual[0].de, ate: prox ? Math.min(prox.de, p.ate + 0.4) : p.ate + 0.5 });
      atual = [];
    }
  });
  return out;
}
const Legenda: React.FC<{ escondida: (s: number) => boolean }> = ({ escondida }) => {
  const frame = useCurrentFrame();
  const bs = useMemo(blocos, []);
  const t = frame / FPS;
  const b = bs.find((x) => t >= x.de && t < x.ate);
  if (!b || escondida(t)) return null;
  const alvo = b.palavras.findIndex((p) => DESTAQUES.some((d) => p.texto.toLowerCase().replace(/[^\p{L}\d]/gu, "").startsWith(d)));
  const e = interpolate(frame, [f(b.de), f(b.de) + 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1450, textAlign: "center", fontFamily, fontSize: 54, fontWeight: 600, lineHeight: 1.18, color: "#fff", textShadow: "0 3px 16px rgba(0,0,0,.55)", opacity: e, translate: `0 ${(1 - e) * 8}px` }}>
      {b.palavras.map((p, i) => (
        <span key={i} style={{ color: i === alvo ? ROSA : "#fff" }}>{p.texto} </span>
      ))}
    </div>
  );
};

/* ---------------- lockup: ícone 3D + fio rose-gold + título, como uma assinatura só ---------------- */
type Texto = { de: number; ate: number; l1: React.ReactNode; l2?: React.ReactNode };
const Lockup: React.FC<{ src: string; de: number; ate: number; textos: Texto[]; icone?: number; esmaecer?: boolean; retrato?: boolean }> = ({ src, de, ate, textos, icone = 230, esmaecer, retrato }) => {
  const frame = useCurrentFrame();
  if (frame < de || frame > ate) return null;
  const t = interpolate(frame, [de, de + 8], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const saida = interpolate(frame, [ate - 5, ate], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vivo = (frame - de) / FPS;
  const micro = 1 + 0.015 * (0.5 - 0.5 * Math.cos(vivo * 1.6));
  const dx = Math.sin(vivo * 1.3) * 2.5, dy = Math.cos(vivo * 1.1) * 2.5;
  const fio = interpolate(frame, [de + 3, de + 11], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const sombraTexto = "0 4px 26px rgba(40,10,25,.5)";
  // troca de texto em transição cruzada: o antigo sai enquanto o novo entra (sem tela vazia no meio)
  const camadas = textos.map((x, k) => {
    const ini = k === 0 ? de + 3 : x.de - 1;
    const ent = (d: number) => interpolate(frame, [ini + d, ini + d + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
    // quem sai sobe e some em 4 quadros; quem entra vem de baixo logo em seguida
    const sai = k < textos.length - 1 ? interpolate(frame, [x.ate - 3, x.ate + 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE }) : 1;
    const sobe = (1 - sai) * -18;
    return { x, a: ent(0) * sai, b: ent(3) * sai, ya: (1 - ent(0)) * 20 + sobe, yb: (1 - ent(3)) * 16 + sobe };
  });
  return (
    <div style={{ position: "absolute", left: 64, right: 56, top: 1310, height: 290, display: "flex", alignItems: "center", gap: 30, fontFamily, opacity: saida }}>
      <div style={{ flex: `0 0 ${icone}px`, perspective: 1000, opacity: Math.min(t * 1.4, 1) }}>
        {retrato ? (
          <div style={{ width: icone, height: icone, borderRadius: "50%", padding: 5, background: "linear-gradient(135deg,#c98f72,#f3d2bf 45%,#b97a5f)", transform: `translate(${dx}px, ${(1 - t) * 20 + dy}px) scale(${(0.92 + 0.08 * t) * micro})`, filter: `drop-shadow(0 18px 22px rgba(40,8,24,.45)) blur(${(1 - t) * 2.5}px)` }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#f4e6ea", backgroundImage: `url(${staticFile(src)})`, backgroundSize: "165%", backgroundPosition: "50% 8%", backgroundRepeat: "no-repeat" }} />
          </div>
        ) : <Img src={staticFile(src)} style={{ width: "100%", WebkitMaskImage: esmaecer ? "linear-gradient(180deg,#000 70%,transparent 100%)" : undefined, transform: `translate(${dx}px, ${(1 - t) * 20 + dy}px) rotateY(${-(1 - t) * 4}deg) scale(${(0.92 + 0.08 * t) * micro})`, filter: `drop-shadow(0 22px 26px rgba(40,8,24,.45)) blur(${(1 - t) * 2.5}px)` }} />}
      </div>
      <div style={{ flex: "0 0 2px", alignSelf: "center", height: 170 * fio, background: "linear-gradient(180deg,#c98f72,#f3d2bf,#c98f72)", borderRadius: 2 }} />
      <div style={{ flex: 1, display: "grid", alignItems: "center" }}>
        {camadas.filter((c) => c.a > 0.001 || c.b > 0.001).map((c, k) => (
          <div key={k} style={{ gridArea: "1 / 1" }}>
            <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.02em", color: "#fff", opacity: c.a, translate: `0 ${c.ya}px`, textShadow: sombraTexto }}>{c.x.l1}</div>
            {c.x.l2 && <div style={{ marginTop: 14, fontSize: 34, fontWeight: 600, letterSpacing: "0.05em", lineHeight: 1.25, color: "#fff", opacity: c.b, translate: `0 ${c.yb}px`, textShadow: sombraTexto }}>{c.x.l2}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- composição ---------------- */
const SFX: [number, string, number][] = [
  [0.0, "soft-hit", 0.35], [0.33, "tonal-tick", 0.25], [7.05, "air-whoosh", 0.3], [9.25, "low-impact", 0.4],
  [13.03, "confirm-tick", 0.3], [21.75, "air-whoosh", 0.3],
];
// Headlines ativas (a legenda some quando a headline já diz o mesmo).
const HEADS: [number, number][] = [[0.1, 2.9], [7.05, 9.12], [9.2, 12.95], [13.03, 16.7], [21.8, 25.1]];

export const Voto70: React.FC = () => {
  const frame = useCurrentFrame();
  const { s: zoomPlano } = plano(frame);
  const { s, tx, ty } = camera(frame, zoomPlano); // câmera segue o rosto, sempre sem borda
  const temHead = HEADS.some(([a, b]) => frame >= f(a) && frame <= f(b));
  const sombraTopo = interpolate(Number(temHead), [0, 1], [0, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#1c1c1e" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: "50% 50%" }}>
        <Video src={staticFile("midia/bruto.mov")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {/* leitura da headline e da legenda: véu vinho/grafite discreto */}
      <AbsoluteFill style={{ background: "linear-gradient(0deg,rgba(43,16,28,.8) 0%,rgba(43,16,28,.55) 20%,rgba(43,16,28,0) 40%)", opacity: sombraTopo }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg,rgba(28,28,30,.55) 0%,rgba(28,28,30,0) 30%)" }} />

      {/* 1 · Você sabia */}
      <Lockup src="assets/01_tamara_apontando.png" de={f(0.1)} ate={f(2.9)} retrato icone={200} textos={[{ de: f(0.1), ate: f(2.9), l1: "VOCÊ SABIA?", l2: <><R>70+</R> TEM VOTO FACULTATIVO</> }]} />

      {/* 2 · domingo, 4 de outubro: calendário + título */}
      <Lockup src="assets/03_calendario_04_outubro_2026.png" de={f(7.05)} ate={f(9.12)} textos={[{ de: f(7.05), ate: f(9.12), l1: <>DOMINGO, <R>4 DE OUTUBRO</R></>, l2: "1º TURNO DAS ELEIÇÕES 2026" }]} />

      {/* 3–4 · 70 anos ou mais → voto facultativo (o selo é o hero: maior) */}
      <Lockup src="assets/02_selo_70mais_3d.png" de={f(9.2)} ate={f(12.95)} icone={250} textos={[
        { de: f(9.2), ate: f(11.2), l1: "70 ANOS OU MAIS", l2: <R>VOTO FACULTATIVO</R> },
        { de: f(11.2), ate: f(12.95), l1: <>VOTO <R>FACULTATIVO</R></>, l2: "PODE VOTAR, MAS NÃO É OBRIGADO" },
      ]} />

      {/* 5 · sem multa */}
      <Lockup src="assets/04_documento_check_sem_penalidade.png" de={f(13.03)} ate={f(16.7)} textos={[{ de: f(13.03), ate: f(16.7), l1: <>SEM <R>MULTA</R></>, l2: "SEM JUSTIFICATIVA OBRIGATÓRIA" }]} />

      {/* 6 · pode ficar tranquilo: tela limpa, só a apresentadora */}

      {/* 7 · se quiser, pode votar */}
      <Lockup src="assets/01_urna_eletronica_3d.png" de={f(21.75)} ate={DURACAO + 10} textos={[{ de: f(21.8), ate: DURACAO + 10, l1: <>SE QUISER, <R>PODE VOTAR</R></>, l2: "A ESCOLHA É SUA" }]} />
      <Legenda escondida={(t) => HEADS.some(([a, b]) => t >= a && t <= b)} />

      {SFX.map(([t, nome, vol]) => (
        <Sequence key={nome + t} from={f(t)} durationInFrames={f(1.2)}>
          <Audio src={staticFile(`sfx/${nome}.wav`)} volume={vol} />
        </Sequence>
      ))}
      <Audio src={staticFile("sfx/trilha.wav")} volume={0.07} />
    </AbsoluteFill>
  );
};
