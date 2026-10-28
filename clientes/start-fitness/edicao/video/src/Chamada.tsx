import { Audio } from "@remotion/media";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { BARLOW, COR, ESTALO, F, FPS, KANIT, REVELA, SOMBRA, SUAVE, clamp } from "./marca";
import { BLOCOS, CARIMBO, FALA, PREMIO, RELOGIO, SFX, TOTAL, VOANDO, ZOOMS, type Bloco, type Linha } from "./plano";
import rastreio from "./rastreio.json";

// Chamada da 2ª Corrida Start Fitness (1º/11/2026). O vídeo chega cortado e com cor: aqui entram só
// headlines, assets, som (trilha com ducking + efeitos) e o movimento de câmera de ênfase.

type Trecho = { de: number; ate: number; x: number[]; y: number[] };
const TRECHOS = (rastreio as { trechos: Record<string, Trecho> }).trechos;

// ---------- câmera: zoom de ênfase + soco do prêmio + tremida ----------
function camera(s: number) {
  let z = 1;
  for (const k of ZOOMS) {
    const meio = (k.de + k.ate) / 2;
    const b = Math.min(k.de + 0.2, meio - 0.01);
    const c = Math.max(k.ate - 0.25, meio + 0.01);
    z *= interpolate(s, [k.de, b, c, Math.max(k.ate, c + 0.01)], [1, k.z, k.z, 1], { ...clamp, easing: SUAVE });
  }
  // prêmio: soco rápido pra 1,14 e assenta em 1,06 até sair
  const soco = interpolate(s, [PREMIO.mil - 0.02, PREMIO.mil + 0.1, PREMIO.mil + 0.5, PREMIO.ate - 0.1, PREMIO.ate + 0.25], [1, 1.14, 1.07, 1.06, 1], { ...clamp, easing: SUAVE });
  z *= soco;
  // tremida: forte no prêmio, curta no carimbo e no kit
  const treme = (em: number, amp: number, dur: number) => (s >= em && s < em + dur ? amp * Math.exp(-(s - em) / (dur / 3)) : 0);
  const amp = treme(PREMIO.mil, 22, 0.55) + treme(CARIMBO.de + 0.06, 9, 0.3) + treme(24.56, 8, 0.3);
  const fr = Math.round(s * FPS);
  return { z, dx: (random(`x${fr}`) - 0.5) * 2 * amp, dy: (random(`y${fr}`) - 0.5) * 2 * amp };
}

// ---------- uma linha de texto ----------
const LinhaTexto: React.FC<{ l: Linha; s: number; alinha: "centro" | "esq"; pulso: number }> = ({ l, s, alinha, pulso }) => {
  const p = interpolate(s, [l.em, l.em + 0.26], [0, 1], clamp);
  if (p <= 0) return <div style={{ height: alturaLinha(l), visibility: "hidden" }} />;
  const sobe = ESTALO(p);
  const grande = !l.estilo || l.estilo === "grande" || l.estilo === "vermelho";
  const escala = grande ? interpolate(p, [0, 0.5, 1], [1.35, 0.97, 1]) : 1;
  const base: React.CSSProperties = {
    fontFamily: KANIT, fontWeight: 900, fontStyle: "italic", fontSize: l.tam, lineHeight: 0.98,
    color: l.estilo === "vermelho" ? COR.vermelho : COR.branco, textShadow: SOMBRA, letterSpacing: "-0.01em", whiteSpace: "nowrap",
  };
  let conteudo: React.ReactNode = l.t;
  if (l.estilo === "apoio") {
    Object.assign(base, { fontFamily: BARLOW, fontWeight: 700, fontStyle: "normal", letterSpacing: "0.06em", lineHeight: 1.1 });
  } else if (l.estilo === "faixa") {
    // faixa vermelha inclinada atrás do texto (como o "A" vermelho do logo)
    const larg = interpolate(s, [l.em, l.em + 0.18], [0, 1], { ...clamp, easing: REVELA });
    conteudo = (
      <span style={{ position: "relative", display: "inline-block", padding: "0.04em 0.24em 0.02em" }}>
        <span style={{ position: "absolute", inset: 0, background: COR.vermelho, transform: `skewX(-12deg) scaleX(${larg})`, transformOrigin: alinha === "esq" ? "left" : "center", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }} />
        <span style={{ position: "relative", textShadow: "none" }}>{l.t}</span>
      </span>
    );
  }
  return (
    <div style={{ overflow: "hidden", padding: "0.06em 0.12em", margin: "-0.06em -0.12em" }}>
      <div style={{ ...base, transform: `translateY(${(1 - sobe) * 105}%) scale(${escala * pulso})`, transformOrigin: alinha === "esq" ? "left center" : "center" }}>
        {conteudo}
      </div>
    </div>
  );
};
const alturaLinha = (l: Linha) => l.tam * (l.estilo === "apoio" ? 1.1 : 0.98) + (l.estilo === "faixa" ? l.tam * 0.06 : 0);

// ---------- bloco de headline (fixo ou seguindo a mão) ----------
const BlocoTexto: React.FC<{ b: Bloco }> = ({ b }) => {
  const s = useCurrentFrame() / FPS + b.de;
  const sai = interpolate(s, [b.ate - 0.16, b.ate], [0, 1], clamp);
  const alinha = b.alinha ?? "centro";
  let x = b.x, y = b.y;
  if (b.rastreio) {
    const tr = TRECHOS[b.rastreio.trecho];
    const n = tr.x.length;
    const k = Math.min(n - 1, Math.max(0, Math.round(s * FPS) - tr.de));
    const mx = tr.x.reduce((a, v) => a + v, 0) / n, my = tr.y.reduce((a, v) => a + v, 0) / n;
    x = mx + b.rastreio.leve * (tr.x[k] - mx) + b.rastreio.dx;
    y = my + b.rastreio.leve * (tr.y[k] - my) + b.rastreio.dy;
    x = Math.min(800, Math.max(280, x)); // o texto nunca sai da zona segura
  }
  const pulsoDe = (i: number) =>
    (b.pulsos ?? []).filter((p) => p.linha === i).reduce((acc, p) => acc * interpolate(s, [p.em, p.em + 0.12, p.em + 0.4], [1, 1.14, 1], { ...clamp, easing: SUAVE }), 1);
  return (
    <div style={{
      position: "absolute", top: y, left: alinha === "esq" ? x : x - 540, width: alinha === "esq" ? 900 : 1080,
      display: "flex", flexDirection: "column", alignItems: alinha === "esq" ? "flex-start" : "center", gap: 10,
      opacity: 1 - sai, transform: `translateY(${sai * 40}px)`, filter: sai > 0 ? `blur(${sai * 8}px)` : undefined,
    }}>
      {b.linhas.map((l, i) => <LinhaTexto key={i} l={l} s={s} alinha={alinha} pulso={pulsoDe(i)} />)}
    </div>
  );
};

// ---------- selo "INSCRIÇÕES ABERTAS" ----------
const Carimbo: React.FC = () => {
  const s = useCurrentFrame() / FPS + CARIMBO.de;
  const p = interpolate(s, [CARIMBO.de, CARIMBO.de + 0.14], [0, 1], clamp);
  const sai = interpolate(s, [CARIMBO.ate - 0.15, CARIMBO.ate], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: CARIMBO.y - 170, display: "flex", justifyContent: "center", opacity: Math.min(1, p * 3) * (1 - sai) }}>
      <div style={{
        border: `10px solid ${COR.branco}`, background: "rgba(227,20,27,0.92)", padding: "18px 46px 12px", textAlign: "center",
        transform: `rotate(${-7 + (1 - p) * 6}deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`, boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
      }}>
        <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 64, letterSpacing: "0.12em", color: COR.branco, lineHeight: 1 }}>{CARIMBO.linhas[0]}</div>
        <div style={{ fontFamily: KANIT, fontWeight: 900, fontStyle: "italic", fontSize: 150, color: COR.branco, lineHeight: 0.95 }}>{CARIMBO.linhas[1]}</div>
      </div>
    </div>
  );
};

// ---------- cronômetro ----------
const Relogio: React.FC = () => {
  const s = useCurrentFrame() / FPS + RELOGIO.de;
  const p = interpolate(s, [RELOGIO.de, RELOGIO.de + 0.25], [0, 1], { ...clamp, easing: ESTALO });
  const sai = interpolate(s, [RELOGIO.ate - 0.16, RELOGIO.ate], [0, 1], clamp);
  const ang = Math.floor((s - RELOGIO.de) / 0.25) * 30 + 30 * Math.min(1, ((s - RELOGIO.de) % 0.25) / 0.05);
  const r = 62;
  return (
    <svg width={200} height={220} viewBox="-100 -120 200 220" style={{ position: "absolute", left: RELOGIO.x - 100, top: RELOGIO.y - 120, opacity: (1 - sai) * Math.min(1, p * 2), transform: `scale(${p})`, filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.5))" }}>
      <rect x={-14} y={-r - 34} width={28} height={18} rx={4} fill={COR.branco} />
      <rect x={-6} y={-r - 18} width={12} height={12} fill={COR.branco} />
      <circle r={r} fill="rgba(11,11,12,0.55)" stroke={COR.branco} strokeWidth={10} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={0} y1={-r + 14} x2={0} y2={-r + (i % 3 === 0 ? 26 : 20)} stroke={COR.branco} strokeWidth={4} transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={8} x2={0} y2={-r + 18} stroke={COR.vermelho} strokeWidth={7} strokeLinecap="round" transform={`rotate(${ang})`} />
      <circle r={8} fill={COR.vermelho} />
    </svg>
  );
};

// ---------- rastro de velocidade atrás do "VOANDO" ----------
const Rastro: React.FC = () => {
  const s = useCurrentFrame() / FPS + VOANDO.em;
  const sai = interpolate(s, [VOANDO.ate - 0.2, VOANDO.ate], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: sai }}>
      {Array.from({ length: 14 }, (_, i) => {
        const y = 1215 + (random(`ry${i}`) - 0.5) * 230;
        const vel = 2600 + random(`rv${i}`) * 1800;
        const atraso = random(`rd${i}`) * 0.25;
        const x = -500 + (s - VOANDO.em - atraso) * vel;
        const w = 180 + random(`rw${i}`) * 320;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: 6 + random(`rh${i}`) * 6, borderRadius: 6, background: i % 3 === 0 ? COR.vermelho : "rgba(255,255,255,0.85)", opacity: s - VOANDO.em > atraso ? 1 : 0 }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- prêmio: "R$ 4.000 EM PREMIAÇÃO" (o momento mais forte do vídeo) ----------
const Premio: React.FC = () => {
  const s = useCurrentFrame() / FPS + PREMIO.de;
  const pRs = interpolate(s, [PREMIO.rs, PREMIO.rs + 0.2], [0, 1], clamp);
  const pMil = interpolate(s, [PREMIO.mil, PREMIO.mil + 0.2], [0, 1], clamp);
  const pEm = interpolate(s, [PREMIO.em, PREMIO.em + 0.22], [0, 1], clamp);
  const sai = interpolate(s, [PREMIO.ate - 0.2, PREMIO.ate], [0, 1], clamp);
  const brilho = s >= PREMIO.mil ? 0.5 + 0.5 * Math.sin((s - PREMIO.mil) * 9) : 0;
  const flash = interpolate(s, [PREMIO.mil, PREMIO.mil + 0.04, PREMIO.mil + 0.2], [0, 0.75, 0], clamp);
  const t0 = s - PREMIO.mil;
  return (
    <AbsoluteFill style={{ opacity: 1 - sai, transform: `scale(${1 + sai * 0.25})` }}>
      {/* dinheiro explodindo do número e caindo */}
      {t0 > 0 && Array.from({ length: 46 }, (_, i) => {
        const nota = i % 2 === 0;
        const ang = (random(`a${i}`) * 0.9 + 0.05) * Math.PI; // pra cima, abrindo pros lados
        const v = 900 + random(`v${i}`) * 1500;
        const g = 2600;
        const x = 540 + Math.cos(ang) * v * t0 * (random(`l${i}`) > 0.5 ? 1 : -1) * 0.8;
        const y = 1230 - Math.sin(ang) * v * t0 + 0.5 * g * t0 * t0;
        const rot = (random(`r${i}`) - 0.5) * 900 * t0;
        const esc = 0.6 + random(`e${i}`) * 0.7;
        return nota ? (
          <div key={i} style={{ position: "absolute", left: x - 70, top: y - 34, width: 140, height: 68, borderRadius: 6, background: "linear-gradient(135deg,#3FBF6E,#1F7A42)", border: "3px solid #BDF2CF", transform: `rotate(${rot}deg) scale(${esc}) rotateY(${t0 * 700 * (random(`f${i}`) - 0.5)}deg)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: KANIT, fontWeight: 900, fontStyle: "italic", fontSize: 34, color: "#E8FFF0", boxShadow: "0 6px 14px rgba(0,0,0,0.35)" }}>R$</div>
        ) : (
          <div key={i} style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 34, background: "radial-gradient(circle at 35% 30%,#FFF1A8,#F5C542 45%,#B8860B)", border: "3px solid #FFE27A", transform: `rotate(${rot}deg) scale(${esc}) scaleX(${0.35 + 0.65 * Math.abs(Math.cos(t0 * 12 + i))})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: KANIT, fontWeight: 900, fontSize: 30, color: "#8A5A00", boxShadow: "0 6px 14px rgba(0,0,0,0.35)" }}>$</div>
        );
      })}
      <div style={{ position: "absolute", left: 0, width: 1080, top: 960, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ alignSelf: "flex-start", marginLeft: 150, fontFamily: KANIT, fontWeight: 900, fontStyle: "italic", fontSize: 120, color: COR.branco, textShadow: SOMBRA, lineHeight: 1, opacity: pRs, transform: `translateX(${(1 - ESTALO(pRs)) * -260}px)` }}>R$</div>
        <div style={{ position: "relative", marginTop: -18, opacity: pMil > 0 ? 1 : 0 }}>
          {/* faixa vermelha atrás do número */}
          <div style={{ position: "absolute", left: -90, right: -90, top: 40, bottom: 20, background: COR.vermelho, transform: `skewX(-12deg) scaleX(${interpolate(pMil, [0, 0.6], [0, 1], { ...clamp, easing: REVELA })})`, boxShadow: `0 0 ${60 + 50 * brilho}px rgba(227,20,27,${0.55 + 0.3 * brilho})` }} />
          <div style={{
            position: "relative", fontFamily: KANIT, fontWeight: 900, fontStyle: "italic", fontSize: 280, lineHeight: 1, color: COR.branco, letterSpacing: "-0.02em",
            transform: `scale(${interpolate(pMil, [0, 0.45, 0.7, 1], [2.6, 0.94, 1.03, 1])})`, filter: pMil < 0.4 ? `blur(${(0.4 - pMil) * 30}px)` : undefined,
            textShadow: "0 10px 0 #7A0A0E, 0 18px 40px rgba(0,0,0,0.5)",
          }}>4.000</div>
        </div>
        <div style={{ marginTop: 10, overflow: "hidden" }}>
          <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 86, letterSpacing: "0.1em", color: COR.preto, background: COR.branco, padding: "2px 30px 0", transform: `translateY(${(1 - ESTALO(pEm)) * 110}%) skewX(-12deg)`, opacity: pEm > 0 ? 1 : 0 }}>EM PREMIAÇÃO</div>
        </div>
      </div>
      <AbsoluteFill style={{ background: COR.branco, opacity: flash }} />
    </AbsoluteFill>
  );
};

// ---------- trilha: alta nos respiros, bem baixa (só o fundo) quando ele fala ----------
// GANHO: tudo entra 3 dB abaixo (a voz original já bate em -2,8 dBFS); o volume final é acertado no
// render_final.ps1 (loudnorm -14 LUFS + limitador), sem estourar
const GANHO = 0.7;
const ALTA = 0.55, BAIXA = 0.075, RAMPA = 0.28;
function volumeTrilha(s: number) {
  let peso = 0;
  for (const [a, b] of FALA) {
    const ini = a - 0.15, fim = b + 0.25;
    peso = Math.max(peso, interpolate(s, [ini - RAMPA, ini, fim, fim + RAMPA], [0, 1, 1, 0], { ...clamp, easing: SUAVE }));
  }
  const fade = interpolate(s, [0, 0.25, TOTAL - 0.7, TOTAL], [0, 1, 1, 0], clamp);
  return (ALTA + (BAIXA - ALTA) * peso) * fade * GANHO;
}

// mix "sem-voz" serve só pra curadoria medir a trilha e os efeitos separados da fala
export const Chamada: React.FC<{ mix?: "completo" | "sem-voz" }> = ({ mix = "completo" }) => {
  const f = useCurrentFrame();
  const s = f / FPS;
  const { z, dx, dy } = camera(s);
  const zoomCentro = ZOOMS.find((k) => s >= k.de && s < k.ate);
  const cx = zoomCentro?.cx ?? 540, cy = zoomCentro?.cy ?? 620;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.preto, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${cx}px ${cy}px` }}>
          <OffthreadVideo src={staticFile("midia/chamada.mp4")} muted={mix === "sem-voz"} volume={GANHO} style={{ width: 1080, height: 1920 }} />
        </AbsoluteFill>

        <Sequence from={F(RELOGIO.de)} durationInFrames={F(RELOGIO.ate - RELOGIO.de)} layout="none"><Relogio /></Sequence>
        <Sequence from={F(VOANDO.em)} durationInFrames={F(VOANDO.ate - VOANDO.em)} layout="none"><Rastro /></Sequence>
        {BLOCOS.map((b) => (
          <Sequence key={b.id} from={F(b.de)} durationInFrames={Math.max(1, F(b.ate) - F(b.de))} layout="none"><BlocoTexto b={b} /></Sequence>
        ))}
        <Sequence from={F(CARIMBO.de)} durationInFrames={F(CARIMBO.ate - CARIMBO.de)} layout="none"><Carimbo /></Sequence>
        <Sequence from={F(PREMIO.de)} durationInFrames={F(PREMIO.ate - PREMIO.de)} layout="none"><Premio /></Sequence>
      </AbsoluteFill>

      <Audio src={staticFile("midia/musica.wav")} volume={(fr) => volumeTrilha(fr / FPS)} />
      {SFX.map((x, i) => (
        <Sequence key={i} from={F(x.em)} layout="none"><Audio src={staticFile(`sfx/${x.nome}.wav`)} volume={(x.vol ?? 0.5) * GANHO} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
