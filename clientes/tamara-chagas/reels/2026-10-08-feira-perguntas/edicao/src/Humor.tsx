// Série "O povo da feira sabe de INSS?" · Reels de humor (entrevista de rua) na ESTÉTICA DO ESCRITÓRIO
// (off-white #ECEBE9, grafite #141414, taupe #8C7B6B, champanhe #E6D3B8, Inter fino + negrito, faixa preta, logo).
// Manual: clientes/tamara-chagas/modelos/manual-edicao-humor.md. Tudo vem de public/dados.json (scripts/montar.py + edl).
import React from "react";
import { AbsoluteFill, Audio as AudioR, Easing, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";
import dados from "../public/dados.json";

const { fontFamily } = loadFont("normal", { weights: ["200", "300", "500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadFont("italic", { weights: ["200", "300", "800", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
export const DURACAO = Math.ceil(dados.duracao * FPS);
// paleta do escritório
const OFF = "#ECEBE9", GRAFITE = "#141414", TAUPE = "#8C7B6B", CHAMPANHE = "#E6D3B8", BRANCO = "#FFFFFF";
const fr = (s: number) => Math.round(s * FPS);
const EASE = Easing.bezier(0.33, 0, 0.2, 1);
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Zoom = { t: number; dur: number; s: number; x?: number; y?: number; rampa?: number };
type Insert = { t: number; dur: number; tipo: string; encolhe?: boolean; emoji?: string; cor?: string; y?: number; x?: number; rot?: number;
  texto?: string; linhas?: string[]; sub?: string; fonte?: string; tempos?: number[]; parte?: number; tema?: string;
  blocos?: Bloco[]; atras?: boolean; itens?: string[]; destaque?: number };
type Bloco = { de: number; txt: string; estilo?: "fino" | "forte" | "brilho" | "contorno"; cor?: string; tam?: number; x?: number; y?: number };
type Headline = { de: number; ate: number; parte: number; tema: string };

/* -------- câmera: punch-ins digitais + whip nas trocas da abertura -------- */
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
  let tx = 0, blur = 0;
  for (const w of (dados as { whips?: number[] }).whips ?? []) {
    const d = frame - fr(w);
    if (d >= -3 && d <= 3) { tx = -d * 90; blur = (4 - Math.abs(d)) * 6; s = Math.max(s, 1.08); }
  }
  return { transform: `translateX(${tx}px) scale(${s})`, transformOrigin: `${x * 100}% ${y * 100}%`, blur };
}
const emPB = (frame: number) => (dados.pb as number[][]).some(([a, b]) => frame >= fr(a) && frame < fr(b));
const insertAtivo = (frame: number, tipos: string[]) =>
  (dados.inserts as Insert[]).find((i) => tipos.includes(i.tipo) && frame >= fr(i.t) && frame < fr(i.t + i.dur));

/* -------- legenda: Inter 700 minúscula, branca com sombra; palavra-chave em champanhe e mais pesada -------- */
const Legenda: React.FC = () => {
  const frame = useCurrentFrame(), t = frame / FPS;
  if (insertAtivo(frame, ["tv-erro", "meme", "cartao", "sistema", "abertura", "cinetico"])) return null;
  const l = (dados.legendas as { ini: number; fim: number; palavras: [number, number, string][] }[]).find((x) => t >= x.ini && t < x.fim);
  if (!l) return null;
  const e = interpolate(frame, [fr(l.ini), fr(l.ini) + 3], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1250, textAlign: "center", fontFamily, fontWeight: 700, fontSize: 52,
      lineHeight: 1.15, color: BRANCO, textShadow: "0 2px 3px rgba(0,0,0,.7), 0 0 18px rgba(0,0,0,.5)", opacity: e,
      transform: `scale(${0.96 + 0.04 * e})` }}>
      {l.palavras.map(([, , p], i) => {
        const limpa = p.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");
        const dest = (dados.destaques as string[]).includes(limpa);
        return <span key={i} style={{ color: dest ? CHAMPANHE : BRANCO, fontWeight: dest ? 900 : 700 }}>{p.toLowerCase()} </span>;
      })}
    </div>
  );
};

/* -------- headline fixa: PARTE N · TEMA (pílula off-white com logo) -------- */
const HeadlineFixa: React.FC = () => {
  const frame = useCurrentFrame();
  const h = (dados as { headline?: Headline }).headline;
  if (!h || frame < fr(h.de) || frame > fr(h.ate)) return null;
  if (insertAtivo(frame, ["cartao", "tv-erro"]) || (dados.inserts as Insert[]).some((i) => i.tipo === "meme" && i.encolhe && frame >= fr(i.t) && frame < fr(i.t + i.dur))) return null;
  const e = interpolate(frame, [fr(h.de), fr(h.de) + 10], [0, 1], { ...cl, easing: EXPO });
  return (
    <div style={{ position: "absolute", left: 60, top: 150, display: "flex", alignItems: "center", gap: 0, fontFamily, opacity: e,
      transform: `translateX(${(1 - e) * -40}px)`, boxShadow: "0 10px 30px rgba(0,0,0,.25)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ background: GRAFITE, color: BRANCO, fontWeight: 800, fontSize: 24, letterSpacing: "0.22em", padding: "14px 22px" }}>PARTE {h.parte}</div>
      <div style={{ background: OFF, color: GRAFITE, fontWeight: 600, fontSize: 24, letterSpacing: "0.12em", padding: "14px 24px" }}>{h.tema}</div>
    </div>
  );
};

/* -------- abertura (motion aprimorado, estética do escritório) -------- */
const Abertura: React.FC<{ parte: number; tema: string; linhas: string[]; dur: number }> = ({ parte, tema, linhas, dur }) => {
  const frame = useCurrentFrame();
  const total = fr(dur);
  const sai = interpolate(frame, [total - 7, total], [0, 1], { ...cl, easing: EASE });
  // painel off-white sobe do rodapé (máscara), conteúdo entra em camadas
  const painel = interpolate(frame, [2, 14], [0, 1], { ...cl, easing: EXPO });
  const linha = (i: number) => interpolate(frame, [10 + i * 5, 24 + i * 5], [0, 1], { ...cl, easing: EXPO });
  const num = spring({ frame: frame - 18, fps: FPS, config: { damping: 14, mass: 0.7 } });
  const faixa = interpolate(frame, [30, 42], [0, 1], { ...cl, easing: EXPO });
  const fio = interpolate(frame, [8, 34], [0, 1], { ...cl, easing: EASE });
  const luz = interpolate(frame, [0, total], [-30, 130]);
  const logo = interpolate(frame, [4, 16], [0, 1], { ...cl, easing: EXPO });
  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* véu escuro em cima do b-roll + varredura de luz suave */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(20,20,20,.45) 0%,rgba(20,20,20,.05) 40%,rgba(20,20,20,.25) 100%)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(105deg,transparent ${luz - 18}%,rgba(255,255,255,.18) ${luz}%,transparent ${luz + 18}%)`, mixBlendMode: "screen" }} />
      <Img src={staticFile("simbolo-claro.png")} style={{ position: "absolute", left: 70, top: 170, width: 110, opacity: logo * (1 - sai), transform: `translateY(${(1 - logo) * -20}px)` }} />
      <div style={{ position: "absolute", left: 186, top: 192, color: BRANCO, fontSize: 20, letterSpacing: "0.3em", fontWeight: 600, opacity: logo * (1 - sai) }}>TAMARA CHAGAS ADVOCACIA</div>
      {/* painel */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 900, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: OFF, transform: `translateY(${(1 - painel) * 100 + sai * 100}%)`, borderTopLeftRadius: 0 }}>
          {/* número da parte, grande, contorno */}
          <div style={{ position: "absolute", right: 60, top: 40, fontSize: 380, fontWeight: 900, lineHeight: 0.8, letterSpacing: "-0.06em",
            color: "transparent", WebkitTextStroke: `3px ${GRAFITE}`, opacity: 0.12 + 0.12 * num, transform: `translateY(${(1 - num) * 80}px)` }}>{String(parte).padStart(2, "0")}</div>
          <div style={{ position: "absolute", left: 80, top: 90, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 70 * fio, height: 2, background: TAUPE }} />
            <div style={{ fontSize: 26, letterSpacing: "0.32em", fontWeight: 700, color: TAUPE, opacity: fio }}>PARTE {parte}</div>
          </div>
          {linhas.map((l, i) => (
            <div key={i} style={{ position: "absolute", left: 76, top: 160 + i * 128, height: 132, overflow: "hidden" }}>
              <div style={{ fontSize: 124, lineHeight: 1.02, letterSpacing: "-0.045em", color: GRAFITE, fontWeight: i === linhas.length - 1 ? 800 : 200,
                transform: `translateY(${(1 - linha(i)) * 110}%)` }}>{l}</div>
            </div>
          ))}
          <div style={{ position: "absolute", left: 80, top: 190 + linhas.length * 128, overflow: "hidden" }}>
            <div style={{ background: GRAFITE, color: BRANCO, fontSize: 40, fontWeight: 600, letterSpacing: "0.04em", padding: "16px 30px",
              clipPath: `inset(0 ${(1 - faixa) * 100}% 0 0)` }}>{tema}</div>
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, bottom: 120, height: 1, background: "rgba(20,20,20,.18)", transform: `scaleX(${fio})`, transformOrigin: "left" }} />
          <div style={{ position: "absolute", left: 80, bottom: 70, fontSize: 20, letterSpacing: "0.28em", fontWeight: 600, color: TAUPE, opacity: fio }}>NA RUA · UNIÃO DOS PALMARES</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* -------- tipografia cinética (ref. Talyta 08/10: itálico fino + itálico extranegrito, texto atrás da pessoa) -------- */
const Cinetico: React.FC<{ blocos: Bloco[]; dur: number }> = ({ blocos, dur }) => {
  const frame = useCurrentFrame();
  const total = fr(dur);
  const sai = interpolate(frame, [total - 5, total], [0, 1], { ...cl, easing: EASE });
  return (
    <AbsoluteFill style={{ fontFamily }}>
      {blocos.map((b, i) => {
        const de = fr(b.de);
        if (frame < de) return null;
        const sp = spring({ frame: frame - de, fps: FPS, config: { damping: 13, mass: 0.55, stiffness: 170 } });
        const est = b.estilo ?? "fino";
        const forte = est !== "fino";
        const tam = b.tam ?? (forte ? 190 : 110);
        const cor = b.cor ?? (est === "brilho" ? CHAMPANHE : BRANCO);
        return (
          <div key={i} style={{ position: "absolute", left: b.x ?? 70, top: b.y ?? 400 + i * 150, whiteSpace: "nowrap",
            fontStyle: "italic", fontWeight: forte ? 900 : 200, fontSize: tam, lineHeight: 0.9, letterSpacing: forte ? "-0.05em" : "-0.02em",
            color: est === "contorno" ? "transparent" : cor, WebkitTextStroke: est === "contorno" ? `3px ${cor}` : undefined,
            textShadow: est === "brilho" ? `0 0 18px ${CHAMPANHE}, 0 0 50px rgba(230,211,184,.7)` : "0 6px 30px rgba(0,0,0,.35)",
            opacity: Math.min(1, sp * 1.3) * (1 - sai), transform: `translate(${(1 - sp) * (forte ? -60 : 40)}px, ${(1 - sp) * 30 - sai * 60}px) scale(${0.85 + 0.15 * sp})`,
            transformOrigin: "left center" }}>{b.txt}</div>
        );
      })}
    </AbsoluteFill>
  );
};

/* -------- fileira de cards (ref.: os cards de calendário) com os benefícios -------- */
const Cards: React.FC<{ itens: string[]; destaque?: number; dur: number; y?: number }> = ({ itens, destaque, dur, y = 1400 }) => {
  const frame = useCurrentFrame();
  const total = fr(dur);
  const deriva = interpolate(frame, [0, total], [120, -260]);
  const sai = interpolate(frame, [total - 6, total], [0, 1], cl);
  return (
    <div style={{ position: "absolute", left: 0, top: y, display: "flex", gap: 22, transform: `translateX(${deriva}px)`, opacity: 1 - sai, fontFamily }}>
      {itens.map((it, i) => {
        const sp = spring({ frame: frame - i * 3, fps: FPS, config: { damping: 12, mass: 0.5 } });
        const ativo = i === destaque;
        return (
          <div key={i} style={{ width: 300, height: 190, borderRadius: 22, background: ativo ? GRAFITE : OFF, color: ativo ? BRANCO : GRAFITE,
            boxShadow: "0 18px 40px rgba(0,0,0,.35)", padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between",
            transform: `translateY(${(1 - sp) * 140}px) rotate(${(1 - sp) * 6}deg)`, opacity: Math.min(1, sp * 1.5) }}>
            <div style={{ fontSize: 18, letterSpacing: "0.26em", fontWeight: 700, color: ativo ? CHAMPANHE : TAUPE }}>INSS · {String(i + 1).padStart(2, "0")}</div>
            <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.03em" }}>{it}</div>
          </div>
        );
      })}
    </div>
  );
};

/* -------- identificação de quem apresenta (lower third) -------- */
const Identifica: React.FC<{ texto?: string; sub?: string; dur: number; y?: number }> = ({ texto, sub, dur, y = 232 }) => {
  // mesmo layout da headline "PARTE N · TEMA", logo abaixo dela
  const frame = useCurrentFrame();
  const e = interpolate(frame, [0, 10], [0, 1], { ...cl, easing: EXPO }), s2 = interpolate(frame, [4, 14], [0, 1], { ...cl, easing: EXPO });
  const sai = interpolate(frame, [fr(dur) - 6, fr(dur)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", left: 60, top: y, display: "flex", fontFamily, opacity: sai, boxShadow: "0 10px 30px rgba(0,0,0,.25)", borderRadius: 999, overflow: "hidden",
      clipPath: `inset(0 ${(1 - e) * 100}% 0 0 round 999px)` }}>
      <div style={{ background: GRAFITE, color: BRANCO, fontWeight: 800, fontSize: 24, letterSpacing: "0.22em", padding: "14px 22px" }}>{texto}</div>
      <div style={{ background: OFF, color: GRAFITE, fontWeight: 600, fontSize: 24, letterSpacing: "0.12em", padding: "14px 24px", opacity: s2 }}>{sub}</div>
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
        color: "#fff", letterSpacing: "-0.02em", textShadow: "6px 6px 0 #000" }}>{texto}</div>}
    </AbsoluteFill>
  );
};

// texto-meme: CAIXA ALTA extranegrito, palavra por palavra; nunca em cima de rosto
const Meme: React.FC<{ linhas: string[]; tempos?: number[]; dur: number; encolhe?: boolean }> = ({ linhas, tempos, dur, encolhe }) => {
  const frame = useCurrentFrame();
  const passo = (dur * 0.7) / linhas.length;
  return (
    <AbsoluteFill style={{ background: encolhe ? "transparent" : "linear-gradient(180deg,rgba(20,20,20,0) 35%,rgba(20,20,20,.8) 62%)", justifyContent: "flex-end", padding: encolhe ? "0 70px 290px" : "0 70px 330px" }}>
      {linhas.map((p, i) => {
        const de = fr(tempos?.[i] ?? i * passo);
        if (frame < de) return null;
        const pop = interpolate(frame, [de, de + 3], [1.18, 1], { extrapolateRight: "clamp" });
        const tam = Math.min(encolhe ? 150 : 190, Math.floor(940 / (p.length * 0.6)));
        return <div key={i} style={{ fontFamily, fontWeight: 900, fontSize: tam, lineHeight: 0.92, letterSpacing: "-0.04em",
          color: i === linhas.length - 1 ? CHAMPANHE : BRANCO, transform: `scale(${pop})`, transformOrigin: "left center",
          textShadow: "0 8px 40px rgba(0,0,0,.5)" }}>{p}</div>;
      })}
    </AbsoluteFill>
  );
};

// cartão final: igual aos stories editoriais do escritório (off-white, grafite, faixa preta, fonte)
const Cartao: React.FC<{ texto?: string; sub?: string; fonte?: string; parte?: number; tema?: string }> = ({ texto, sub, fonte, parte, tema }) => {
  const frame = useCurrentFrame();
  const e = (d: number) => interpolate(frame, [d, d + 12], [0, 1], { ...cl, easing: EXPO });
  return (
    <AbsoluteFill style={{ background: OFF, fontFamily, color: GRAFITE }}>
      <Img src={staticFile("logo-escuro.png")} style={{ position: "absolute", left: 84, top: 240, width: 140, opacity: e(0) }} />
      <div style={{ position: "absolute", left: 84, right: 84, top: 520 }}>
        <div style={{ fontSize: 26, letterSpacing: "0.3em", fontWeight: 700, color: TAUPE, opacity: e(2) }}>{parte ? `PARTE ${parte} · ${tema}` : "A RESPOSTA"}</div>
        <div style={{ marginTop: 26, fontSize: 92, lineHeight: 1.02, letterSpacing: "-0.045em", fontWeight: 200, transform: `translateY(${(1 - e(4)) * 40}px)`, opacity: e(4) }}
          dangerouslySetInnerHTML={{ __html: texto ?? "" }} />
        {sub && <div style={{ marginTop: 36, fontSize: 40, lineHeight: 1.45, color: "#333", maxWidth: 880, opacity: e(9) }} dangerouslySetInnerHTML={{ __html: sub }} />}
        <div style={{ marginTop: 40, display: "inline-block", background: GRAFITE, color: BRANCO, padding: "16px 28px", fontSize: 32, fontWeight: 500,
          clipPath: `inset(0 ${(1 - e(14)) * 100}% 0 0)` }}>Cada caso é único. Procure orientação.</div>
      </div>
      {fonte && <div style={{ position: "absolute", left: 84, right: 84, bottom: 250, fontSize: 24, color: "#555", opacity: e(10) }}>
        <b style={{ fontWeight: 600, letterSpacing: "0.2em", fontSize: 20, marginRight: 10 }}>FONTE</b>{fonte}</div>}
    </AbsoluteFill>
  );
};

/* -------- figurinha/selo de meme (feita por nós), na paleta do escritório -------- */
const Sticker: React.FC<{ texto?: string; emoji?: string; cor?: string; y?: number; x?: number; rot?: number; dur: number }> = ({ texto, emoji, cor = BRANCO, y = 330, x = 60, rot = -4, dur }) => {
  const frame = useCurrentFrame();
  const sp = spring({ frame, fps: FPS, config: { damping: 9, mass: 0.5, stiffness: 180 } });
  const sai = interpolate(frame, [fr(dur) - 4, fr(dur)], [1, 0], cl);
  const balanco = Math.sin(frame / 4) * 1.5;
  const escuro = cor === GRAFITE;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${sp}) rotate(${rot + balanco}deg)`, transformOrigin: "left center", opacity: sai,
      display: "flex", alignItems: "center", gap: 18, background: cor, color: escuro ? BRANCO : GRAFITE, fontFamily, fontWeight: 900, fontSize: 60,
      letterSpacing: "-0.02em", padding: "16px 32px", borderRadius: 22, border: `4px solid ${GRAFITE}`, boxShadow: `8px 8px 0 ${escuro ? CHAMPANHE : GRAFITE}` }}>
      {emoji && <span style={{ fontSize: texto ? 74 : 140 }}>{emoji}</span>}{texto && <span>{texto}</span>}
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
  const filtro = emPB(frame) ? "grayscale(1) contrast(1.35) brightness(1.05)" : "saturate(1.04) contrast(1.04)";
  const cam = camera(frame);
  const enc = (dados.inserts as Insert[]).find((i) => i.tipo === "meme" && i.encolhe && frame >= fr(i.t) && frame < fr(i.t + i.dur));
  const k = enc ? interpolate(frame, [fr(enc.t), fr(enc.t) + 4], [0, 1], { extrapolateRight: "clamp", easing: EASE }) : 0;
  const atrasAtivo = (dados.inserts as Insert[]).some((i) => i.tipo === "cinetico" && i.atras && frame >= fr(i.t) && frame < fr(i.t + i.dur));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {enc && <AbsoluteFill style={{ background: GRAFITE }} />}
      <AbsoluteFill style={{ transform: `scale(${1 - 0.42 * k}) translateY(${-6 * k}%)`, transformOrigin: "50% 4%", borderRadius: 30 * k, overflow: "hidden", boxShadow: k ? "0 30px 80px rgba(0,0,0,.5)" : undefined }}>
        <AbsoluteFill style={{ transform: cam.transform, transformOrigin: cam.transformOrigin, filter: `${filtro}${cam.blur ? ` blur(${cam.blur}px)` : ""}` }}>
          <Video src={staticFile("rough.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {(dados.inserts as Insert[]).filter((i) => i.tipo === "cinetico" && i.atras).map((i, n) => (
            <Sequence key={`ca${n}`} from={fr(i.t)} durationInFrames={Math.max(1, fr(i.dur))}><Cinetico blocos={i.blocos ?? []} dur={i.dur} /></Sequence>
          ))}
          {atrasAtivo && <Img src={staticFile(`fg/${String(frame).padStart(4, "0")}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />}
        </AbsoluteFill>
      </AbsoluteFill>
      <Legenda />
      <HeadlineFixa />
      {(dados.inserts as Insert[]).map((i, n) => (
        <Sequence key={n} from={fr(i.t)} durationInFrames={Math.max(1, fr(i.dur))}>
          {i.tipo === "tv-erro" && <TvErro texto={i.texto} />}
          {i.tipo === "meme" && <Meme linhas={i.linhas ?? []} tempos={i.tempos} dur={i.dur} encolhe={i.encolhe} />}
          {i.tipo === "cartao" && <Cartao texto={i.texto} sub={i.sub} fonte={i.fonte} parte={i.parte} tema={i.tema} />}
          {i.tipo === "abertura" && <Abertura parte={i.parte ?? 1} tema={i.tema ?? ""} linhas={i.linhas ?? []} dur={i.dur} />}
          {i.tipo === "identifica" && <Identifica texto={i.texto} sub={i.sub} dur={i.dur} y={i.y} />}
          {i.tipo === "cinetico" && !i.atras && <Cinetico blocos={i.blocos ?? []} dur={i.dur} />}
          {i.tipo === "cards" && <Cards itens={i.itens ?? []} destaque={i.destaque} dur={i.dur} y={i.y} />}
          {i.tipo === "sticker" && <Sticker texto={i.texto} emoji={i.emoji} cor={i.cor} y={i.y} x={i.x} rot={i.rot} dur={i.dur} />}
        </Sequence>
      ))}
      {(dados.trilha as number[][]).length > 0 && <AudioR src={staticFile("sfx/trilha-feira.wav")} volume={volTrilha} />}
      {(dados.sfx as [number, string, number][]).map(([t, nome, vol], n) => (
        <Sequence key={`s${n}`} from={fr(t)} durationInFrames={fr(4)}>
          <Audio src={staticFile(`sfx/${nome}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
