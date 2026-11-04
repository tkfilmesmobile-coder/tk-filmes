import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ARCO, BOIL, COR, F, FPS, FREDOKA, clamp } from "./marca";
import { BICHOS, CONTORNO, CORRIDAS, FALAS, FIM_VIDEO, FINS, MACACOS, RABISCOS, RECORTES, SELO, SETAS, TITULOS, TOTAL, type Fala, type Titulo } from "./plano";
import { Rabisco, type Rab } from "./rabiscos";
import { BichoGrande, MacacoArvore, SetaSacola, Velocidade } from "./animais";

// Chamada "Live Black Day" · Pingo de Gente (2026-11-04)

// trilha escolhida pela Talyta (2026-11-04): instrumental infantil do TikTok @llamahappykids
// (Downloads\llamahappykids_mp3.mp3, 2 min 21 s, volume constante, sem voz cantada)
type Trilha = { arquivo: string; volume: number; inicio?: number };
export const TRILHA = { arquivo: "trilha.mp3", volume: 0.8, inicio: 0 } as Trilha | null;

// ---------- texto com contorno (duas camadas: o contorno fica por trás do preenchimento) ----------
const Contorno: React.FC<{ t: string; tam: number; cor: string; borda: string; esp: number; sombra?: string }> = ({ t, tam, cor, borda, esp, sombra }) => (
  <span style={{ position: "relative", display: "inline-block", fontFamily: FREDOKA, fontWeight: 700, fontSize: tam, lineHeight: 1.05, whiteSpace: "pre" }}>
    <span style={{ position: "absolute", inset: 0, color: borda, WebkitTextStroke: `${esp}px ${borda}`, textShadow: sombra }}>{t}</span>
    <span style={{ position: "relative", color: cor }}>{t}</span>
  </span>
);

// letras coloridas que pulam uma a uma (como o "Pingo de Gente" do logo)
const Letras: React.FC<{ t: string; tam: number; em: number; s: number; atraso?: number; desloc?: number; seed: string }> = ({ t, tam, em, s, atraso = 0.045, desloc = 0, seed }) => {
  const fr = Math.round(s * FPS);
  const boil = Math.floor(fr / BOIL);
  let n = 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end" }}>
      {[...t].map((c, i) => {
        if (c === " ") return <span key={i} style={{ display: "inline-block", width: tam * 0.28 }} />;
        const k = s - (em + i * atraso);
        const sc = interpolate(k, [0, 0.07, 0.15, 0.24], [0, 1.32, 0.9, 1], clamp);
        const sobe = interpolate(k, [0, 0.08, 0.2], [tam * 0.35, -tam * 0.12, 0], clamp);
        const rot = (random(`${seed}${i}`) - 0.5) * 14 + (random(`${seed}${i}-${boil}`) - 0.5) * 3;
        const cor = ARCO[(n++ + desloc) % ARCO.length];
        return (
          <span key={i} style={{ display: "inline-block", transform: `translateY(${sobe}px) rotate(${rot}deg) scale(${sc})`, transformOrigin: "50% 80%", margin: `0 ${tam * 0.01}px` }}>
            <Contorno t={c} tam={tam} cor={cor} borda={COR.branco} esp={tam * 0.16} sombra={`0 ${tam * 0.07}px 0 ${COR.marinho}, 0 ${tam * 0.12}px ${tam * 0.18}px rgba(10,20,60,0.45)`} />
          </span>
        );
      })}
    </span>
  );
};

const TituloG: React.FC<{ ti: Titulo }> = ({ ti }) => {
  const s = useCurrentFrame() / FPS;
  if (s < ti.de || s > ti.ate + 0.25) return null;
  const sai = interpolate(s, [ti.ate - 0.05, ti.ate + 0.18], [0, 1], clamp);
  const balanca = Math.sin((s - ti.de) * 3) * 1.5;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: ti.y - ti.tam * 0.55, display: "flex", justifyContent: "center",
      transform: `rotate(${(ti.rot ?? 0) + balanca}deg) scale(${1 - sai * 0.6})`, opacity: 1 - sai }}>
      <Letras t={ti.t} tam={ti.tam} em={ti.de} s={s} seed={ti.t} />
    </div>
  );
};

// ---------- legenda palavra a palavra: branca com contorno marinho; palavra-chave em letras coloridas ----------
const Legenda: React.FC<{ f: Fala; i: number }> = ({ f, i }) => {
  const s = useCurrentFrame() / FPS;
  if (s < f.de - 0.1 || s > f.ate + 0.2) return null;
  const sai = interpolate(s, [f.ate, f.ate + 0.16], [0, 1], clamp);
  const linhas: Fala["palavras"][] = [[]];
  f.palavras.forEach((p) => { if (p.quebra) linhas.push([]); linhas[linhas.length - 1].push(p); });
  const TAM = 78;
  const atual = [...f.palavras].reverse().find((p) => s >= p.em - 0.04);
  return (
    <div style={{ position: "absolute", left: (f.x ?? 540) - (f.larg ?? 960) / 2, width: f.larg ?? 960, top: f.y, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      opacity: 1 - sai, transform: `scale(${1 - sai * 0.3})` }}>
      {linhas.map((l, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "nowrap", justifyContent: "center", alignItems: "flex-end", gap: 28 }}>
          {l.map((p, pi) => {
            const k = s - (p.em - 0.04);
            if (k < 0) return <span key={pi} style={{ visibility: "hidden" }}><Contorno t={p.p} tam={p.destaque ? TAM * 1.25 : TAM} cor="#fff" borda="#fff" esp={12} /></span>;
            const sc = interpolate(k, [0, 0.07, 0.15], [0.5, 1.12, 1], clamp) * (atual === p ? 1.06 : 1);
            return (
              <span key={pi} style={{ display: "inline-block", transform: `scale(${sc})`, transformOrigin: "50% 85%" }}>
                {p.destaque
                  ? <Letras t={p.p} tam={TAM * 1.25} em={p.em - 0.04} s={s} atraso={0.025} desloc={pi + li * 3 + i} seed={`${i}-${p.p}`} />
                  : <Contorno t={p.p} tam={TAM} cor={atual === p ? COR.amarelo : COR.branco} borda={COR.marinho} esp={13} sombra={`0 6px 0 ${COR.marinho}, 0 10px 18px rgba(0,0,0,0.35)`} />}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---------- selo final: ● LIVE · SÁBADO · 19H ----------
const Selo: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  if (s < SELO.de) return null;
  const k = s - SELO.de;
  const sc = interpolate(k, [0, 0.08, 0.17, 0.26], [0.2, 1.15, 0.95, 1], clamp);
  const pisca = Math.floor(k * 2.2) % 2 === 0 ? 1 : 0.35;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: SELO.y, display: "flex", justifyContent: "center", transform: `rotate(-3deg) scale(${sc})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: COR.amarelo, borderRadius: 999, padding: "14px 34px 14px 18px",
        border: `7px solid ${COR.branco}`, boxShadow: `0 9px 0 ${COR.marinho}, 0 16px 28px rgba(10,20,60,0.4)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: COR.vermelho, borderRadius: 999, padding: "8px 24px 6px" }}>
          <div style={{ width: 26, height: 26, borderRadius: 13, background: COR.branco, opacity: pisca }} />
          <span style={{ fontFamily: FREDOKA, fontWeight: 700, fontSize: 64, color: COR.branco, lineHeight: 1 }}>LIVE</span>
        </div>
        <span style={{ fontFamily: FREDOKA, fontWeight: 700, fontSize: 68, color: COR.marinho, lineHeight: 1 }}>SÁBADO · 19H</span>
      </div>
    </div>
  );
};

// ---------- câmera: pulinho de zoom quando entra título ou palavra-chave ----------
const PULOS = [
  ...TITULOS.map((t) => t.de),
  ...FALAS.flatMap((f) => f.palavras.filter((p) => p.destaque && ["SÁBADO!", "19H", "preparado?"].includes(p.p)).map((p) => p.em)),
  SELO.de,
];
function zoom(s: number) {
  let z = 1;
  for (const p of PULOS) {
    const d = s - p;
    if (d >= 0 && d < 0.8) z += 0.035 * Math.exp(-d / 0.16);
  }
  return z;
}

// ---------- efeitos sonoros (kit fofo: xilofone, boop, bolhinha, patinho, apito, bzz, tic-tac, mola, zuuum) ----------
const DUR: Record<string, number> = {
  "pop.wav": 0.12, "pop2.wav": 0.1, "boing.wav": 0.55, "plim.wav": 0.7, "brilho.wav": 0.9, "giz.wav": 0.32, "whoosh.wav": 0.4,
  "boop.wav": 0.16, "bolha.wav": 0.11, "squeak.wav": 0.24, "apito.wav": 0.6, "bzz.wav": 0.7, "tictac.wav": 0.42, "zum.wav": 0.55,
  "mola.wav": 0.5, "xilo-escada.wav": 0.9, "macaco.wav": 0.45, ...Object.fromEntries([0, 1, 2, 3, 4, 5].map((i) => [`xilo${i}.wav`, 0.45])),
};
const VOL: Record<string, number> = {
  "boop.wav": 0.42, "bolha.wav": 0.38, "squeak.wav": 0.35, "apito.wav": 0.3, "bzz.wav": 0.28, "tictac.wav": 0.5, "plim.wav": 0.45,
  "giz.wav": 0.45, "mola.wav": 0.5, "zum.wav": 0.6, "brilho.wav": 0.4, "xilo-escada.wav": 0.5, "boing.wav": 0.42, "pop.wav": 0.3, "pop2.wav": 0.3,
};
const SOM_DO: Partial<Record<Rab["tipo"], string>> = {
  coracao: "boop.wav", balao: "apito.wav", abelha: "bzz.wav", nuvem: "bolha.wav", sol: "bolha.wav", flor: "bolha.wav",
  interrogacao: "squeak.wav", exclamacao: "boing.wav", relogio: "tictac.wav", calendario: "plim.wav", celular: "plim.wav",
  coroa: "brilho.wav", risquinhos: "pop.wav", circulo: "giz.wav", seta: "giz.wav", laco: "giz.wav", onda: "giz.wav",
};
const FALA_DE = 31.1, FALA_ATE = 43.5;
type Som = { em: number; a: string; v: number };
function sons(): Som[] {
  const lista: Som[] = [];
  RABISCOS.forEach((r, i) => {
    const a = SOM_DO[r.tipo] ?? `xilo${i % 6}.wav`; // estrela, brilho e pontinho: uma nota de xilofone cada
    lista.push({ em: r.em, a, v: VOL[a] ?? 0.35 });
  });
  TITULOS.forEach((t) => lista.push({ em: t.de, a: t.t === "VEM AÍ!" ? "boing.wav" : "xilo-escada.wav", v: t.t === "VEM AÍ!" ? 0.32 : 0.5 }));
  BICHOS.forEach((b) => lista.push({ em: b.em + 0.05, a: "mola.wav", v: VOL["mola.wav"] }));
  CORRIDAS.forEach((c) => lista.push({ em: c.de, a: "zum.wav", v: VOL["zum.wav"] }));
  SETAS.forEach((a) => lista.push({ em: a.em, a: "giz.wav", v: VOL["giz.wav"] }));
  MACACOS.forEach((m) => lista.push({ em: m.em + 0.08, a: "macaco.wav", v: 0.42 }));
  lista.push({ em: SELO.de + 0.3, a: "plim.wav", v: 0.45 });
  lista.sort((a, b) => a.em - b.em);
  const fora: Som[] = [];
  for (const x of lista) {
    const fim = x.em + DUR[x.a];
    if (FINS.some(([a, b]) => x.em < b && fim > a)) continue; // nunca em cima da última palavra da frase
    const ultimo = fora[fora.length - 1];
    if (ultimo && x.em - ultimo.em < 0.14) { if (["zum.wav", "mola.wav", "xilo-escada.wav", "boing.wav"].includes(x.a)) fora[fora.length - 1] = x; continue; }
    // durante a fala os efeitos ficam bem baixinhos (no teste da v1 cobriam a voz dela)
    fora.push({ ...x, v: x.em >= FALA_DE && x.em <= FALA_ATE ? x.v * 0.3 : x.v });
  }
  return fora;
}
const SONS = sons();

// trilha baixa durante toda a fala, do começo ao fim de cada trecho falado (regra 16)
const FALADO: [number, number][] = [[15.4, 16.65], [31.1, 43.5]];
function volTrilha(s: number, base: number) {
  let v = 1;
  // na fala a trilha cai pra 28% (cerca de 20 dB abaixo da voz dela)
  for (const [a, b] of FALADO) v = Math.min(v, 1 - interpolate(s, [a - 0.35, a, b, b + 0.5], [0, 0.72, 0.72, 0], clamp));
  return base * v * interpolate(s, [TOTAL - 1.2, TOTAL], [1, 0], clamp);
}

// a menina recortada, por cima dos bichos e das linhas de velocidade; nas cenas de CONTORNO, com borda branca de giz
const Frente: React.FC<{ s: number }> = ({ s }) => {
  const seed = Math.floor(Math.round(s * FPS) / BOIL);
  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="contorno" x="-5%" y="-5%" width="110%" height="110%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={10} result="dil" />
          <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves={2} seed={seed % 97} result="w" />
          <feDisplacementMap in="dil" in2="w" scale={12} xChannelSelector="R" yChannelSelector="G" result="dd" />
          <feFlood floodColor="#FFFFFF" />
          <feComposite in2="dd" operator="in" result="borda" />
          <feMerge><feMergeNode in="borda" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </svg>
      {RECORTES.map((r) => {
        const de = F(r.de), dur = F(r.ate) - F(r.de);
        const comBorda = CONTORNO.includes(r.nome) && interpolate(s, [r.de, r.de + 0.12], [0, 1], clamp) > 0.5;
        return (
          <Sequence key={r.nome} from={de} durationInFrames={dur + (r.nome === "final" ? F(TOTAL) : 0)} layout="none">
            <AbsoluteFill style={{ filter: comBorda ? "url(#contorno)" : undefined }}>
              {s < FIM_VIDEO ? (
                <OffthreadVideo src={staticFile(`midia/recorte/${r.nome}.mov`)} transparent muted />
              ) : (
                <Freeze frame={F(FIM_VIDEO) - de}><OffthreadVideo src={staticFile(`midia/recorte/${r.nome}.mov`)} transparent muted /></Freeze>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
};

export const Pingo: React.FC = () => {
  const fr = useCurrentFrame();
  const s = fr / FPS;
  const z = zoom(s);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z * (1 + Math.max(0, s - FIM_VIDEO) * 0.02)})` }}>
        {s < FIM_VIDEO ? (
          <OffthreadVideo src={staticFile("midia/video.mp4")} />
        ) : (
          <Freeze frame={F(FIM_VIDEO)}><OffthreadVideo src={staticFile("midia/video.mp4")} muted /></Freeze>
        )}
        {/* linhas de velocidade por trás dos bichos (no balanço passam atrás da girafa) */}
        {CORRIDAS.map((c, i) => <Velocidade key={i} c={c} id={`v${i}`} />)}
        {BICHOS.map((b, i) => <BichoGrande key={i} g={b} id={`b${i}`} />)}
        {MACACOS.map((m, i) => <MacacoArvore key={i} m={m} id={`m${i}`} />)}
        <Frente s={s} />
        {SETAS.map((a, i) => <SetaSacola key={i} a={a} id={`s${i}`} />)}
      </AbsoluteFill>
      <AbsoluteFill>
        {RABISCOS.map((r, i) => <Rabisco key={i} r={r} id={`r${i}`} />)}
        {TITULOS.map((t, i) => <TituloG key={i} ti={t} />)}
        {FALAS.map((f, i) => <Legenda key={i} f={f} i={i} />)}
        <Selo />
      </AbsoluteFill>
      {SONS.map((x, i) => (
        <Sequence key={i} from={F(x.em)} durationInFrames={F(DUR[x.a] + 0.3)}>
          <Audio src={staticFile(`sfx/${x.a}`)} volume={x.v} />
        </Sequence>
      ))}
      {TRILHA ? (
        <Audio src={staticFile(`midia/${TRILHA.arquivo}`)} trimBefore={F(TRILHA.inicio ?? 0)} volume={(f) => volTrilha(f / FPS, TRILHA.volume)} />
      ) : null}
    </AbsoluteFill>
  );
};
