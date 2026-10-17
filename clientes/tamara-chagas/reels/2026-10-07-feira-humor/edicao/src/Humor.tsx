// Reels de humor (entrevista de rua) · manual em clientes/tamara-chagas/modelos/manual-edicao-humor.md
// Tudo vem de public/dados.json (gerado por scripts/montar.py a partir do edl.json).
import React from "react";
import { AbsoluteFill, Audio as AudioR, Easing, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";
import dados from "../public/dados.json";

const { fontFamily } = loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = Math.ceil(dados.duracao * FPS);
const ROSA = "#F4A3C0", VINHO = "#7A1E3A", OFF = "#F7F2EE";
const fr = (s: number) => Math.round(s * FPS);
const EASE = Easing.bezier(0.33, 0, 0.2, 1);

type Zoom = { t: number; dur: number; s: number; x?: number; y?: number; rampa?: number };
type Insert = { t: number; dur: number; tipo: string; encolhe?: boolean; emoji?: string; cor?: string; y?: number; x?: number; rot?: number; texto?: string; linhas?: string[]; sub?: string; fonte?: string; tempos?: number[] };

/* -------- câmera: punch-ins digitais (corte seco ou rampa curta) -------- */
function camera(frame: number) {
  let s = 1, x = 0.5, y = 0.4;
  for (const z of dados.zooms as Zoom[]) {
    const a = fr(z.t), b = fr(z.t + z.dur);
    if (frame >= a && frame < b) {
      const r = z.rampa ?? 0;
      s = r ? interpolate(frame, [a, a + r], [1, z.s], { extrapolateRight: "clamp", easing: EASE }) : z.s;
      x = z.x ?? 0.5; y = z.y ?? 0.4;
    }
  }
  // origem do zoom no ponto de interesse, sem nunca mostrar borda
  return { transform: `scale(${s})`, transformOrigin: `${x * 100}% ${y * 100}%` };
}
const emPB = (frame: number) => (dados.pb as number[][]).some(([a, b]) => frame >= fr(a) && frame < fr(b));
const insertAtivo = (frame: number, tipos: string[]) =>
  (dados.inserts as Insert[]).find((i) => tipos.includes(i.tipo) && frame >= fr(i.t) && frame < fr(i.t + i.dur));

/* -------- legenda normal: Inter 600 minúscula, branca, sombra, 68% da altura -------- */
const Legenda: React.FC = () => {
  const frame = useCurrentFrame(), t = frame / FPS;
  if (insertAtivo(frame, ["tv-erro", "meme", "cartao", "sistema", "abertura"])) return null;
  const l = (dados.legendas as { ini: number; fim: number; palavras: [number, number, string][] }[]).find((x) => t >= x.ini && t < x.fim);
  if (!l) return null;
  const e = interpolate(frame, [fr(l.ini), fr(l.ini) + 3], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1250, textAlign: "center", fontFamily, fontWeight: 700, fontSize: 52,
      lineHeight: 1.15, color: "#fff", textShadow: "0 2px 3px rgba(0,0,0,.65), 0 0 18px rgba(0,0,0,.45)", opacity: e,
      transform: `scale(${0.96 + 0.04 * e})` }}>
      {l.palavras.map(([, , p], i) => {
        const limpa = p.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
        const dest = (dados.destaques as string[]).includes(limpa);
        return <span key={i} style={{ color: dest ? ROSA : "#fff" }}>{p.toLowerCase()} </span>;
      })}
    </div>
  );
};

/* -------- rupturas -------- */
const TvErro: React.FC<{ texto?: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const cores = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ display: "flex", height: "68%" }}>{cores.map((c) => <div key={c} style={{ flex: 1, background: c }} />)}</div>
      <div style={{ display: "flex", height: "8%" }}>{[...cores].reverse().map((c, i) => <div key={i} style={{ flex: 1, background: i % 2 ? "#111" : c }} />)}</div>
      <div style={{ display: "flex", height: "24%" }}>{["#00214c", "#fff", "#32006a", "#131313", "#090909", "#1d1d1d"].map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}</div>
      <AbsoluteFill style={{ opacity: 0.18, background: `repeating-linear-gradient(0deg,#000 0 2px,transparent 2px ${3 + (frame % 3)}px)` }} />
      {texto && <div style={{ position: "absolute", top: 720, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 96,
        color: "#fff", letterSpacing: "-0.02em", textShadow: "0 0 0 #000, 6px 6px 0 #000" }}>{texto}</div>}
    </AbsoluteFill>
  );
};

const Sistema: React.FC<{ texto?: string; sub?: string }> = ({ texto, sub }) => {
  const frame = useCurrentFrame();
  const tremor = frame < 6 ? (random(`s${frame}`) - 0.5) * 30 : 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.35)" }}>
      <div style={{ width: 860, background: "#ece9e2", border: "3px solid #fff", boxShadow: "8px 8px 0 #000", transform: `translateX(${tremor}px)`, fontFamily }}>
        <div style={{ background: "linear-gradient(90deg,#0a246a,#a6caf0)", color: "#fff", padding: "14px 22px", fontWeight: 700, fontSize: 34, display: "flex", justifyContent: "space-between" }}>
          <span>Meu INSS.exe</span><span>✕</span></div>
        <div style={{ padding: "44px 40px", display: "flex", gap: 34, alignItems: "center" }}>
          <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#d40000", color: "#fff", fontSize: 80, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</div>
          <div><div style={{ fontSize: 46, fontWeight: 800, color: "#111", lineHeight: 1.1 }}>{texto}</div>
            {sub && <div style={{ fontSize: 30, color: "#333", marginTop: 12 }}>{sub}</div>}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 40px 34px" }}>
          <div style={{ border: "2px solid #111", padding: "10px 46px", fontSize: 32, fontWeight: 600 }}>OK</div></div>
      </div>
    </AbsoluteFill>
  );
};

// texto-meme: CAIXA ALTA extranegrito, palavra por palavra (tempos relativos ao início do insert)
const Meme: React.FC<{ linhas: string[]; tempos?: number[]; dur: number; encolhe?: boolean }> = ({ linhas, tempos, dur, encolhe }) => {
  // regra da Talyta: texto nunca em cima de rosto -> o texto-meme fica na metade de baixo, sobre um degradê escuro
  const frame = useCurrentFrame();
  const passo = (dur * 0.7) / linhas.length;
  return (
    <AbsoluteFill style={{ background: encolhe ? "transparent" : "linear-gradient(180deg,rgba(20,8,14,0) 35%,rgba(20,8,14,.78) 62%)", justifyContent: "flex-end", padding: encolhe ? "0 70px 290px" : "0 70px 330px" }}>
      {linhas.map((p, i) => {
        const de = fr(tempos?.[i] ?? i * passo);
        if (frame < de) return null;
        const pop = interpolate(frame, [de, de + 3], [1.18, 1], { extrapolateRight: "clamp" });
        const tam = Math.min(encolhe ? 150 : 190, Math.floor(940 / (p.length * 0.6)));
        return <div key={i} style={{ fontFamily, fontWeight: 900, fontSize: tam, lineHeight: 0.92, letterSpacing: "-0.04em",
          color: i === linhas.length - 1 ? ROSA : OFF, transform: `scale(${pop})`, transformOrigin: "left center",
          textShadow: "0 8px 40px rgba(0,0,0,.5)" }}>{p}</div>;
      })}
    </AbsoluteFill>
  );
};

const Cartao: React.FC<{ texto?: string; sub?: string; fonte?: string }> = ({ texto, sub, fonte }) => {
  const frame = useCurrentFrame();
  const e = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(170deg,#2a1219 0%,#4a1c2c 60%,#7A1E3A 100%)", alignItems: "center", justifyContent: "center", fontFamily }}>
      <Img src={staticFile("simbolo-claro.png")} style={{ width: 170, opacity: e, marginBottom: 50 }} />
      <div style={{ color: OFF, fontSize: 74, fontWeight: 800, textAlign: "center", lineHeight: 1.05, letterSpacing: "-0.03em", padding: "0 90px",
        opacity: e, transform: `translateY(${(1 - e) * 24}px)` }}>{texto}</div>
      {sub && <div style={{ color: ROSA, fontSize: 38, fontWeight: 600, marginTop: 28, textAlign: "center", padding: "0 100px", opacity: e }}>{sub}</div>}
      <div style={{ position: "absolute", bottom: 300, color: "rgba(247,242,238,.75)", fontSize: 26, letterSpacing: "0.2em", fontWeight: 700 }}>TAMARA CHAGAS ADVOCACIA</div>
      {fonte && <div style={{ position: "absolute", bottom: 250, color: "rgba(247,242,238,.55)", fontSize: 22 }}>Fonte: {fonte}</div>}
    </AbsoluteFill>
  );
};

/* -------- abertura com motion (sobre o b-roll da feira) -------- */
const Abertura: React.FC<{ linhas: string[]; sub?: string; dur: number }> = ({ linhas, sub, dur }) => {
  const frame = useCurrentFrame();
  const sai = interpolate(frame, [fr(dur) - 5, fr(dur)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barra = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(42,18,25,.35) 0%,rgba(42,18,25,.15) 35%,rgba(42,18,25,.82) 70%)", opacity: sai }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1080, fontFamily }}>
        <div style={{ display: "inline-block", background: ROSA, color: VINHO, fontWeight: 800, fontSize: 30, letterSpacing: "0.16em", padding: "10px 22px", borderRadius: 999,
          transform: `scale(${spring({ frame, fps: FPS, config: { damping: 12 } })})`, transformOrigin: "left center" }}>{sub}</div>
        {linhas.map((l, i) => {
          const sp = spring({ frame: frame - 4 - i * 5, fps: FPS, config: { damping: 11, mass: 0.6 } });
          return <div key={i} style={{ marginTop: i ? 0 : 26, fontWeight: 900, fontSize: 132, lineHeight: 0.95, letterSpacing: "-0.045em",
            color: i === linhas.length - 1 ? ROSA : OFF, transform: `translateY(${(1 - sp) * 80}px) scale(${0.8 + 0.2 * sp})`, opacity: Math.min(1, sp * 1.4),
            transformOrigin: "left bottom", textShadow: "0 10px 40px rgba(0,0,0,.45)" }}>{l}</div>;
        })}
        <div style={{ marginTop: 26, height: 10, width: `${barra * 62}%`, background: ROSA, borderRadius: 10 }} />
      </div>
      <Img src={staticFile("simbolo-claro.png")} style={{ position: "absolute", left: 70, top: 230, width: 120, opacity: 0.9 * sai }} />
    </AbsoluteFill>
  );
};

/* -------- figurinha/selo de meme (feita por nós) -------- */
const Sticker: React.FC<{ texto?: string; emoji?: string; cor?: string; y?: number; x?: number; rot?: number; dur: number }> = ({ texto, emoji, cor = "#fff", y = 300, x = 70, rot = -4, dur }) => {
  const frame = useCurrentFrame();
  const sp = spring({ frame, fps: FPS, config: { damping: 9, mass: 0.5, stiffness: 180 } });
  const sai = interpolate(frame, [fr(dur) - 4, fr(dur)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const balanco = Math.sin(frame / 4) * 1.5;
  const escuro = cor === "#fff" || cor === OFF || cor === ROSA;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${sp}) rotate(${rot + balanco}deg)`, transformOrigin: "left center", opacity: sai,
      display: "flex", alignItems: "center", gap: 18, background: cor, color: escuro ? "#1c1014" : "#fff", fontFamily, fontWeight: 900, fontSize: 64,
      letterSpacing: "-0.02em", padding: "18px 34px", borderRadius: 26, border: "5px solid #1c1014", boxShadow: "10px 10px 0 #1c1014" }}>
      {emoji && <span style={{ fontSize: texto ? 80 : 150 }}>{emoji}</span>}{texto && <span>{texto}</span>}
    </div>
  );
};

// volume da trilha: trechos [ini, fim, vol] com rampa de 8 quadros
const volTrilha = (f: number) => {
  let v = 0;
  for (const [a, b, vol] of (dados.trilha as number[][])) {
    const fa = fr(a), fb = fr(b);
    if (f >= fa - 8 && f <= fb + 8) v = Math.max(v, vol * Math.min(1, (f - fa + 8) / 8, (fb + 8 - f) / 8));
  }
  return Math.max(0, v);
};

/* -------- composição -------- */
export const Humor: React.FC = () => {
  const frame = useCurrentFrame();
  const glitch = insertAtivo(frame, ["glitch"]);
  const g = glitch ? random(`g${frame}`) : 0;
  const filtro = [emPB(frame) ? "grayscale(1) contrast(1.35) brightness(1.05)" : "saturate(1.08) contrast(1.04)",
    glitch ? `hue-rotate(${Math.round(g * 180)}deg) contrast(1.8) saturate(2.4)` : ""].join(" ");
  const cam = camera(frame);
  const enc = (dados.inserts as Insert[]).find((i) => i.tipo === "meme" && i.encolhe && frame >= fr(i.t) && frame < fr(i.t + i.dur));
  const k = enc ? interpolate(frame, [fr(enc.t), fr(enc.t) + 4], [0, 1], { extrapolateRight: "clamp", easing: EASE }) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {enc && <AbsoluteFill style={{ background: "linear-gradient(170deg,#2a1219 0%,#4a1c2c 60%,#7A1E3A 100%)" }} />}
      <AbsoluteFill style={{ transform: `scale(${1 - 0.42 * k}) translateY(${-6 * k}%)`, transformOrigin: "50% 4%", borderRadius: 36 * k, overflow: "hidden", boxShadow: k ? "0 30px 80px rgba(0,0,0,.45)" : undefined }}>
      <AbsoluteFill style={{ ...cam, filter: filtro, translate: glitch ? `${(g - 0.5) * 60}px 0` : undefined }}>
        <Video src={staticFile("rough.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      </AbsoluteFill>
      {glitch && <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.55, background: `linear-gradient(0deg, transparent ${g * 70}%, rgba(255,0,80,.8) ${g * 70}%, rgba(0,255,255,.6) ${g * 70 + 6}%, transparent ${g * 70 + 9}%)` }} />}
      <Legenda />
      {(dados.inserts as Insert[]).map((i, k) => (
        <Sequence key={k} from={fr(i.t)} durationInFrames={Math.max(1, fr(i.dur))}>
          {i.tipo === "tv-erro" && <TvErro texto={i.texto} />}
          {i.tipo === "sistema" && <Sistema texto={i.texto} sub={i.sub} />}
          {i.tipo === "meme" && <Meme linhas={i.linhas ?? []} tempos={i.tempos} dur={i.dur} encolhe={i.encolhe} />}
          {i.tipo === "cartao" && <Cartao texto={i.texto} sub={i.sub} fonte={i.fonte} />}
          {i.tipo === "abertura" && <Abertura linhas={i.linhas ?? []} sub={i.sub} dur={i.dur} />}
          {i.tipo === "sticker" && <Sticker texto={i.texto} emoji={i.emoji} cor={i.cor} y={i.y} x={i.x} rot={i.rot} dur={i.dur} />}
        </Sequence>
      ))}
      {(dados.trilha as number[][]).length > 0 && <AudioR src={staticFile("sfx/trilha-feira.wav")} volume={volTrilha} />}
      {(dados.sfx as [number, string, number][]).map(([t, nome, vol], k) => (
        <Sequence key={`s${k}`} from={fr(t)} durationInFrames={fr(4)}>
          <Audio src={staticFile(`sfx/${nome}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
