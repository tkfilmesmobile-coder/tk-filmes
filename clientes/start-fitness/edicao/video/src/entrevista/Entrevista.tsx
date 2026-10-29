import { Audio } from "@remotion/media";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ANTON, BARLOW, COR, F, FPS, INCLINA, MANUSCRITA, MONTSERRAT, REVELA, SUAVE, clamp } from "../marca";
import { LinhaTexto, Raios, Textura, Vazamento, altura, brilhoVermelho, tamanho } from "../Chamada";
import { BLOCOS, CORTES, DINHEIRO, FALA, FIM, IMPACTOS, RAIOS, SFX, TOTAL, VIDEO, type BlocoE } from "./plano";
import musica from "../musica-longa.json";
import rosto from "../entrevista-rosto.json";

// Vídeo 2: entrevista "expectativas pra 2ª Corrida". O corte e a curadoria saem do cortar.py; aqui entram headlines,
// cartões de pergunta, assets, câmera e som, na identidade do vídeo 1 (aprovado em 2026-10-28).

// caixa que junta TODOS os rostos do quadro (apresentador + entrevistado): headline nunca chega perto de rosto
const ROSTO = rosto as { x0: number[]; y0: number[]; x1: number[]; y1: number[] };
function rostoNoTrecho(de: number, ate: number) {
  const a = Math.max(0, F(de)), b = Math.min(ROSTO.y1.length - 1, F(ate));
  let baixo = 0;
  for (let i = a; i <= b; i++) baixo = Math.max(baixo, ROSTO.y1[i]);
  return { baixo };
}
const FOLGA = 45;
const CHAO = 1560;
const BATIDAS = (musica as { batidas: number[] }).batidas;
const GRANDES = new Set(["mega", "vermelho", "faixa"]);
const TODOS_IMPACTOS = [
  ...IMPACTOS,
  ...BLOCOS.flatMap((b) => b.linhas.filter((l) => GRANDES.has(l.estilo)).map((l) => ({ em: l.em, forca: l.anim === "letras" ? 0.25 : 0.4 }))),
];

function camera(s: number) {
  let z = 1, amp = 0, flash = 0;
  for (const { em, forca } of TODOS_IMPACTOS) {
    const d = s - em;
    if (d < 0 || d > 0.6) continue;
    z += 0.05 * forca * Math.exp(-d / 0.13);
    amp += 16 * forca * Math.exp(-d / 0.08);
    flash += 0.5 * forca * Math.exp(-d / 0.045);
  }
  const b = BATIDAS.filter((x) => x <= s).pop();
  if (b !== undefined) z += 0.012 * Math.exp(-(s - b) / 0.1);
  const fr = Math.round(s * FPS);
  return { z, dx: (random(`x${fr}`) - 0.5) * 2 * amp, dy: (random(`y${fr}`) - 0.5) * 2 * amp, rot: (random(`r${fr}`) - 0.5) * amp * 0.04, flash: Math.min(flash, 1.1) };
}

// ---------- bloco de headline (abaixo do queixo de todo mundo; encolhe se não couber) ----------
const BlocoTexto: React.FC<{ b: BlocoE }> = ({ b }) => {
  const s = useCurrentFrame() / FPS + b.de;
  const larg = b.larg ?? 840;
  const sai = interpolate(s, [b.ate - 0.13, b.ate], [0, 1], { ...clamp, easing: (x) => x * x });
  const H = b.linhas.reduce((a, l) => a + altura(l, tamanho(l, larg)), 0) + 8 * (b.linhas.length - 1);
  // desce pra baixo do queixo e encolhe se não couber, mas nunca menos que 55% (nem de cabeça pra baixo)
  const y = Math.min(Math.max(b.y, rostoNoTrecho(b.de, b.ate).baixo + FOLGA), CHAO - H * 0.55);
  const escala = Math.min(1, Math.max(0.55, (CHAO - y) / H));
  // cartão de pergunta: "?" gigante vazado atrás, girando devagar
  const kq = (s - b.de) * FPS;
  const interrog = b.pergunta ? (
    <div style={{
      position: "absolute", left: b.x + 150, top: y - 120, fontFamily: ANTON, fontSize: 620, lineHeight: 1, color: "transparent",
      WebkitTextStroke: "6px rgba(227,20,27,0.85)", opacity: interpolate(kq, [0, 4], [0, 0.9], clamp) * (1 - sai),
      transform: `skewX(${INCLINA}deg) rotate(${8 + (s - b.de) * 3}deg) scale(${interpolate(kq, [0, 5], [1.6, 1], { ...clamp, easing: REVELA })})`,
      filter: "drop-shadow(0 0 18px rgba(227,20,27,0.5))",
    }}>?</div>
  ) : null;
  return (
    <>
      {interrog}
      <div style={{
        position: "absolute", top: y, left: b.x - 540, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        opacity: 1 - sai, transform: `translateX(${-sai * 260}px) scale(${escala}) scaleX(${1 + sai * 0.25})`, transformOrigin: "center top", filter: sai > 0 ? `blur(${sai * 14}px)` : undefined,
      }}>
        {b.linhas.map((l, i) => <LinhaTexto key={i} l={l} s={s} alinha="centro" larg={larg} pulso={1} />)}
      </div>
    </>
  );
};

// ---------- "mais premiações, mais dinheiro" (mesma estética do prêmio do vídeo 1) ----------
const Dinheiro: React.FC = () => {
  const s = useCurrentFrame() / FPS + DINHEIRO.de;
  const sai = interpolate(s, [DINHEIRO.ate + 1.05, DINHEIRO.ate + 1.2], [0, 1], { ...clamp, easing: (x) => x * x });
  const t0 = s - DINHEIRO.dinheiro;
  const k = t0 * FPS;
  const escrita = interpolate(s, [DINHEIRO.premiacoes, DINHEIRO.premiacoes + 0.45], [0, 1], { ...clamp, easing: SUAVE });
  const sc = k >= 0 ? interpolate(k, [0, 1, 2, 3, 4, 6], [1.9, 1.3, 1, 0.96, 1.02, 1], clamp) : 0;
  const g = k >= 0 ? 1 + 0.7 * Math.exp(-t0 / 0.12) : 0;
  const anel = interpolate(k, [0, 9], [0, 1], clamp);
  const topo = Math.max(1000, rostoNoTrecho(DINHEIRO.de, DINHEIRO.ate + 1.2).baixo + FOLGA);
  const T = 150;
  return (
    <AbsoluteFill style={{ opacity: 1 - sai, filter: sai > 0 ? `blur(${sai * 12}px)` : undefined }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 46%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.85) 100%)", opacity: interpolate(s, [DINHEIRO.de, DINHEIRO.de + 0.2], [0, 1], clamp) }} />
      {k >= 0 && anel < 1 ? <div style={{ position: "absolute", left: 495 - 1000 * anel, top: topo + 230 - 1000 * anel, width: 2000 * anel, height: 2000 * anel, borderRadius: "50%", border: `${26 * (1 - anel)}px solid rgba(255,40,40,${0.8 * (1 - anel)})` }} /> : null}
      {t0 > 0 && Array.from({ length: 16 }, (_, i) => {
        const nota = i % 2 === 0;
        const ang = (0.045 + random(`da${i}`) * 0.3) * Math.PI;
        const v = 1100 + random(`dv${i}`) * 1900;
        const lado = random(`dl${i}`) > 0.5 ? 1 : -1;
        const x = 495 + Math.cos(ang) * v * t0 * lado * 0.85;
        const yy = topo + 240 - Math.sin(ang) * v * t0 * 0.75 + 1500 * t0 * t0;
        const rot = (random(`dr${i}`) - 0.5) * 1100 * t0;
        const esc = 0.7 + random(`de${i}`) * 0.8;
        return nota ? (
          <div key={i} style={{ position: "absolute", left: x - 90, top: yy - 43, width: 180, height: 86, borderRadius: 8, background: "linear-gradient(135deg,#4FD27F,#1C6E3B)", border: "4px solid #C8F7D8", transform: `rotate(${rot}deg) scale(${esc})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 46, color: "#EFFFF4", boxShadow: "0 8px 18px rgba(0,0,0,0.4)" }}>R$</div>
        ) : (
          <div key={i} style={{ position: "absolute", left: x - 45, top: yy - 45, width: 90, height: 90, borderRadius: 45, background: "radial-gradient(circle at 35% 30%,#FFF6C2,#F7C844 45%,#A8740A)", border: "4px solid #FFE58A", transform: `rotate(${rot}deg) scale(${esc}) scaleX(${0.3 + 0.7 * Math.abs(Math.cos(t0 * 14 + i))})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 44, color: "#7A4E00" }}>$</div>
        );
      })}
      <div style={{ position: "absolute", left: 0, width: 990, top: topo, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* "mais premiações" se escreve, manuscrita branca com brilho */}
        <div style={{ clipPath: `inset(-40% ${(1 - escrita) * 100}% -40% -10%)`, transform: "rotate(-4deg)", marginBottom: -20 }}>
          <div style={{ fontFamily: MANUSCRITA, fontSize: 120, lineHeight: 1.15, color: COR.branco, whiteSpace: "nowrap", textShadow: "0 0 12px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.55), 0 8px 22px rgba(0,0,0,0.7)" }}>mais premiações</div>
        </div>
        {/* "+ DINHEIRO" vermelho com brilho, entra em pancada */}
        <div style={{ position: "relative", transform: `scale(${sc})`, filter: k >= 0 && k < 2 ? `blur(${(2 - k) * 8}px)` : undefined }}>
          <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: T, lineHeight: 1, letterSpacing: "-0.02em", color: "#FF1F1F", textShadow: brilhoVermelho(g), whiteSpace: "nowrap" }}>+DINHEIRO</div>
          <div style={{ position: "absolute", inset: 0, fontFamily: MONTSERRAT, fontWeight: 900, fontSize: T, lineHeight: 1, letterSpacing: "-0.02em", background: "linear-gradient(180deg, #FF7468 0%, #FF2A22 46%, #D40A0A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", whiteSpace: "nowrap" }}>+DINHEIRO</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- cartela final: último quadro congelado e escurecido + selo das inscrições ----------
const Cartela: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const k = s * FPS;
  const sc = interpolate(k, [0, 2, 3, 4, 6], [3.2, 1, 0.94, 1.03, 1], clamp);
  const anel = interpolate(k, [2, 10], [0, 1], clamp);
  const pTag = interpolate(s, [0.35, 0.55], [0, 1], { ...clamp, easing: REVELA });
  const pData = interpolate(s, [0.55, 0.75], [0, 1], { ...clamp, easing: REVELA });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(8,8,9,0.62)", opacity: interpolate(k, [0, 3], [0, 1], clamp) }} />
      <div style={{ position: "absolute", left: 0, width: 990, top: 620, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ position: "absolute", width: 900 * anel, height: 900 * anel, borderRadius: "50%", border: `${14 * (1 - anel)}px solid rgba(255,255,255,${0.7 * (1 - anel)})` }} />
          <div style={{
            border: `12px solid ${COR.branco}`, background: COR.vermelho, padding: "16px 50px 10px", textAlign: "center",
            transform: `rotate(${-8 + (1 - Math.min(1, k / 2)) * 10}deg) scale(${sc})`, boxShadow: "14px 14px 0 #000, 0 30px 60px rgba(0,0,0,0.5)",
            filter: k < 2 ? `blur(${(2 - k) * 6}px)` : undefined,
          }}>
            <div style={{ fontFamily: BARLOW, fontWeight: 700, fontStyle: "italic", fontSize: 66, letterSpacing: "0.14em", color: COR.branco, lineHeight: 1 }}>INSCRIÇÕES</div>
            <div style={{ fontFamily: ANTON, fontSize: 190, color: COR.branco, lineHeight: 0.92, textShadow: "6px 6px 0 #5A0508" }}>ABERTAS</div>
          </div>
        </div>
        <div style={{ clipPath: `inset(0 ${(1 - pTag) * 100}% 0 0)`, marginTop: 40 }}>
          <div style={{ fontFamily: BARLOW, fontWeight: 700, fontStyle: "italic", fontSize: 54, letterSpacing: "0.08em", color: COR.branco, background: "rgba(8,8,9,0.9)", padding: "8px 26px 4px", transform: `skewX(${INCLINA}deg)`, boxShadow: "6px 6px 0 rgba(0,0,0,0.55)" }}>2ª CORRIDA START FITNESS</div>
        </div>
        <div style={{ clipPath: `inset(0 ${(1 - pData) * 100}% 0 0)` }}>
          <div style={{ fontFamily: ANTON, fontSize: 120, lineHeight: 1, color: COR.branco, background: COR.vermelho, padding: "12px 30px 6px", transform: `skewX(${INCLINA}deg)`, boxShadow: "10px 10px 0 #000", textShadow: "4px 4px 0 #5A0508" }}>1º DE NOVEMBRO</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- trilha: bem baixa na fala, sobe nos respiros e na cartela ----------
const GANHO = 0.7;
const ALTA = 0.55, BAIXA = 0.08, RAMPA = 0.28;
function volumeTrilha(s: number) {
  let peso = 0;
  for (const [a, b] of FALA) {
    const ini = a - 0.15, fim = b + 0.25;
    peso = Math.max(peso, interpolate(s, [ini - RAMPA, ini, fim, fim + RAMPA], [0, 1, 1, 0], { ...clamp, easing: SUAVE }));
  }
  const fade = interpolate(s, [0, 0.2, TOTAL - 0.8, TOTAL], [0, 1, 1, 0], clamp);
  return (ALTA + (BAIXA - ALTA) * peso) * fade * GANHO;
}

export const Entrevista: React.FC<{ mix?: "completo" | "sem-voz" }> = ({ mix = "completo" }) => {
  const s = useCurrentFrame() / FPS;
  const { z, dx, dy, rot, flash } = camera(s);
  const filtro = flash > 0.01 ? `brightness(${1 + flash}) contrast(${1 + flash * 0.25})` : undefined;
  const video = <OffthreadVideo src={staticFile("midia/entrevista.mp4")} muted={mix === "sem-voz"} volume={GANHO} style={{ width: 1080, height: 1920, filter: filtro }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.preto, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)` }}>
        <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "540px 700px" }}>
          <Sequence durationInFrames={F(VIDEO)} layout="none">{video}</Sequence>
          <Sequence from={F(VIDEO)} layout="none">
            <Freeze frame={F(VIDEO) - 2}>
              <OffthreadVideo src={staticFile("midia/entrevista.mp4")} muted style={{ width: 1080, height: 1920, filter: "blur(10px)" }} />
            </Freeze>
          </Sequence>
        </AbsoluteFill>
        <Textura />
        {CORTES.map((c, i) => (c.forte ? <Sequence key={`c${i}`} from={F(c.em) - 1} durationInFrames={F(0.45)} layout="none"><Vazamento semente={i + 7} /></Sequence> : null))}
        {RAIOS.map((r, i) => <Sequence key={`r${i}`} from={F(r.em)} durationInFrames={F(r.dur)} layout="none"><Raios dur={r.dur} cy={1250} /></Sequence>)}
        {BLOCOS.map((b) => <Sequence key={b.id} from={F(b.de)} durationInFrames={Math.max(1, F(b.ate) - F(b.de))} layout="none"><BlocoTexto b={b} /></Sequence>)}
        <Sequence from={F(DINHEIRO.de)} durationInFrames={F(DINHEIRO.ate + 1.2 - DINHEIRO.de)} layout="none"><Dinheiro /></Sequence>
        <Sequence from={F(FIM.de)} layout="none"><Cartela /></Sequence>
      </AbsoluteFill>

      <Audio src={staticFile("midia/musica-longa.wav")} volume={(fr) => volumeTrilha(fr / FPS)} />
      {SFX.map((x, i) => <Sequence key={i} from={F(x.em)} layout="none"><Audio src={staticFile(`sfx/${x.nome}.wav`)} volume={(x.vol ?? 0.6) * GANHO} /></Sequence>)}
    </AbsoluteFill>
  );
};
