import { Audio } from "@remotion/media";
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ANTON, BARLOW, COR, F, FPS, INCLINA, MANUSCRITA, REVELA, SUAVE, clamp, extrusao } from "../marca";
import { LinhaTexto, Raios, Textura, Vazamento, altura, tamanho } from "../Chamada";
import { BLOCOS, CONTAGEM, CORTES, FIM, FIM_FALA, FOTOS, IMPACTOS, RAIOS, SFX, TOTAL, VIDEO, type BlocoF } from "./plano";
import musica from "../musica-feed.json";
import rosto from "../feed-rosto.json";

// Feed da 2ª Corrida Start Fitness (1º/11/2026): o corte e a curadoria saem do montar.py; aqui entram headlines,
// contagem, câmera e som, na identidade dos dois vídeos aprovados (2026-10-28).

const ROSTO = rosto as { x0: number[]; y0: number[]; x1: number[]; y1: number[] };
const baixoDoRosto = (de: number, ate: number) => {
  let b = 0;
  for (let i = Math.max(0, F(de)); i <= Math.min(ROSTO.y1.length - 1, F(ate)); i++) b = Math.max(b, ROSTO.y1[i]);
  return b;
};
const FOLGA = 45, CHAO = 1560;
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
  // flash branco de câmera em cada foto
  for (const em of FOTOS) {
    const d = s - em;
    if (d >= 0 && d < 0.2) flash += 0.6 * Math.exp(-d / 0.05);
  }
  const b = BATIDAS.filter((x) => x <= s).pop();
  if (b !== undefined) z += 0.012 * Math.exp(-(s - b) / 0.1);
  const fr = Math.round(s * FPS);
  return { z, dx: (random(`x${fr}`) - 0.5) * 2 * amp, dy: (random(`y${fr}`) - 0.5) * 2 * amp, rot: (random(`r${fr}`) - 0.5) * amp * 0.04, flash: Math.min(flash, 1.2) };
}

// ---------- manuscrita que "se escreve" (mesma do "em premiação" aprovado) ----------
const Escrita: React.FC<{ t: string; s: number; em: number; cor?: "branco" | "vermelho"; tam?: number }> = ({ t, s, em, cor = "branco", tam = 150 }) => {
  const p = interpolate(s, [em, em + 0.5], [0, 1], { ...clamp, easing: SUAVE });
  const brilho = cor === "vermelho"
    ? "0 0 10px rgba(255,60,50,0.95), 0 0 28px rgba(255,20,20,0.8), 0 0 60px rgba(255,0,0,0.5), 0 8px 22px rgba(0,0,0,0.7)"
    : "0 0 12px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.55), 0 8px 22px rgba(0,0,0,0.7)";
  return (
    <div style={{ clipPath: `inset(-40% ${(1 - p) * 100}% -40% -10%)`, transform: "rotate(-4deg)", marginTop: -10 }}>
      <div style={{ fontFamily: MANUSCRITA, fontSize: tam, lineHeight: 1.15, color: cor === "vermelho" ? "#FF2A22" : COR.branco, whiteSpace: "nowrap", textShadow: brilho }}>{t}</div>
    </div>
  );
};

// ---------- bloco de headline ----------
const BlocoTexto: React.FC<{ b: BlocoF }> = ({ b }) => {
  const s = useCurrentFrame() / FPS + b.de;
  const larg = b.larg ?? 840;
  const sai = interpolate(s, [b.ate - 0.13, b.ate], [0, 1], { ...clamp, easing: (x) => x * x });
  const H = b.linhas.reduce((a, l) => a + altura(l, tamanho(l, larg)), 0) + 8 * (b.linhas.length - 1) + (b.escrita ? (b.escrita.tam ?? 150) * 1.1 : 0);
  const y = b.livre ? Math.min(b.y, CHAO - H) : Math.min(Math.max(b.y, baixoDoRosto(b.de, b.ate) + FOLGA), CHAO - H * 0.55);
  const escala = Math.min(1, Math.max(0.55, (CHAO - y) / H));
  return (
    <div style={{
      position: "absolute", top: y, left: b.x - 540, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      opacity: 1 - sai, transform: `translateX(${-sai * 260}px) scale(${escala}) scaleX(${1 + sai * 0.25})`, transformOrigin: "center top", filter: sai > 0 ? `blur(${sai * 14}px)` : undefined,
    }}>
      {b.linhas.map((l, i) => <LinhaTexto key={i} l={l} s={s} alinha="centro" larg={larg} pulso={1} />)}
      {b.escrita && s >= b.escrita.em ? <Escrita s={s} {...b.escrita} /> : null}
    </div>
  );
};

// ---------- contagem: números gigantes no grito da multidão, e o LARGOU! ----------
const Contagem: React.FC = () => {
  const s = useCurrentFrame() / FPS + CONTAGEM.numeros[0].em - 0.05;
  const atual = [...CONTAGEM.numeros].reverse().find((c) => s >= c.em);
  const largou = s >= CONTAGEM.largou;
  const k = largou ? (s - CONTAGEM.largou) * FPS : atual ? (s - atual.em) * FPS : -1;
  if (k < 0) return null;
  const sc = interpolate(k, [0, 1, 2, 3, 4, 6], [2.6, 1.5, 1, 0.94, 1.03, 1], clamp);
  const desfoque = interpolate(k, [0, 2], [18, 0], clamp);
  const onda = interpolate(k, [1, 10], [0, 1], clamp);
  const ultimo = atual?.n === "2";
  if (largou) {
    const sai = interpolate(s, [CONTAGEM.largou + 1.35, CONTAGEM.largou + 1.6], [0, 1], clamp);
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - sai }}>
        <div style={{ transform: `skewX(${INCLINA}deg) scale(${sc * (1 + sai * 0.3)})`, filter: desfoque ? `blur(${desfoque}px)` : undefined, marginTop: -260, position: "relative", padding: "16px 40px 6px" }}>
          <div style={{ position: "absolute", inset: 0, background: COR.vermelho, transform: `scaleX(${interpolate(k, [0, 3], [0, 1], { ...clamp, easing: REVELA })})`, transformOrigin: "left", boxShadow: "16px 16px 0 #000, 0 30px 60px rgba(0,0,0,0.5)" }} />
          <div style={{ position: "relative", fontFamily: ANTON, fontSize: 250, lineHeight: 0.95, color: COR.branco, textShadow: "6px 6px 0 #5A0508", whiteSpace: "nowrap" }}>LARGOU!</div>
        </div>
      </AbsoluteFill>
    );
  }
  const n = atual!.n;
  const tam = 620;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* escurece um pouco o fundo pra o número saltar */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 38%, rgba(0,0,0,0.45), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "relative", marginTop: -330, transform: `skewX(${INCLINA}deg) scale(${sc})`, filter: desfoque ? `blur(${desfoque}px)` : undefined }}>
        {onda < 1 ? <div style={{ position: "absolute", inset: 0, fontFamily: ANTON, fontSize: tam, lineHeight: 1, color: "transparent", WebkitTextStroke: `8px rgba(255,255,255,${0.8 * (1 - onda)})`, transform: `scale(${1 + onda * 0.5})` }}>{n}</div> : null}
        <div style={{ fontFamily: ANTON, fontSize: tam, lineHeight: 1, color: ultimo ? COR.vermelho : COR.branco, textShadow: ultimo ? extrusao(tam, "#5A0508", "#120102", 14) : extrusao(tam, "#B3121A", "#2A0306", 14) }}>{n}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- cartela final (v3: a Talyta não gostou do selo "VALEU, GALERA!") ----------
// fecha repetindo o título da abertura, e o agradecimento vem na manuscrita com brilho (a mesma do "mãe atleta")
const Cartela: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const k = s * FPS;
  const sc = interpolate(k, [0, 1, 2, 3, 4, 6], [2.3, 1.45, 1, 0.95, 1.02, 1], clamp);
  const desfoque = interpolate(k, [0, 2], [16, 0], clamp);
  const pFaixa = interpolate(s, [0.3, 0.45], [0, 1], { ...clamp, easing: REVELA });
  const pTag = interpolate(s, [0.5, 0.65], [0, 1], { ...clamp, easing: REVELA });
  const pEscrita = interpolate(s, [0.75, 1.35], [0, 1], { ...clamp, easing: SUAVE });
  const onda = interpolate(k, [1, 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,8,9,0.55) 0%, rgba(8,8,9,0.78) 55%, rgba(8,8,9,0.9) 100%)", opacity: interpolate(k, [0, 3], [0, 1], clamp) }} />
      <div style={{ position: "absolute", left: 0, width: 990, top: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", transform: `skewX(${INCLINA}deg) scale(${sc})`, filter: desfoque ? `blur(${desfoque}px)` : undefined }}>
          {onda < 1 ? <div style={{ position: "absolute", inset: 0, fontFamily: ANTON, fontSize: 230, lineHeight: 0.95, color: "transparent", WebkitTextStroke: `4px rgba(255,255,255,${0.8 * (1 - onda)})`, transform: `scale(${1 + onda * 0.4})`, whiteSpace: "nowrap" }}>2ª CORRIDA</div> : null}
          <div style={{ fontFamily: ANTON, fontSize: 230, lineHeight: 0.95, color: COR.branco, textShadow: extrusao(230), whiteSpace: "nowrap" }}>2ª CORRIDA</div>
        </div>
        <div style={{ position: "relative", padding: "14px 34px 8px", transform: `skewX(${INCLINA}deg)` }}>
          <div style={{ position: "absolute", inset: 0, background: COR.vermelho, transform: `scaleX(${pFaixa})`, transformOrigin: "left", boxShadow: "12px 12px 0 #000" }} />
          <div style={{ position: "relative", fontFamily: ANTON, fontSize: 120, lineHeight: 1, color: COR.branco, textShadow: "4px 4px 0 #5A0508", whiteSpace: "nowrap", clipPath: `inset(0 ${(1 - pFaixa) * 100}% 0 0)` }}>START FITNESS</div>
        </div>
        <div style={{ clipPath: `inset(0 ${(1 - pTag) * 100}% 0 0)`, marginTop: 10 }}>
          <div style={{ fontFamily: BARLOW, fontWeight: 700, fontStyle: "italic", fontSize: 50, letterSpacing: "0.1em", color: COR.branco, background: "rgba(8,8,9,0.9)", padding: "8px 26px 4px", transform: `skewX(${INCLINA}deg)`, boxShadow: "6px 6px 0 rgba(0,0,0,0.55)" }}>1º DE NOVEMBRO · 2026</div>
        </div>
        <div style={{ clipPath: `inset(-40% ${(1 - pEscrita) * 100}% -40% -10%)`, transform: "rotate(-4deg)", marginTop: 30 }}>
          <div style={{ fontFamily: MANUSCRITA, fontSize: 170, lineHeight: 1.15, color: COR.branco, whiteSpace: "nowrap", textShadow: "0 0 12px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.55), 0 8px 22px rgba(0,0,0,0.7)" }}>obrigado!</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- trilha: baixa na fala; segura baixa na contagem (o grito da galera manda) e explode no LARGOU! ----------
const GANHO = 0.7;
const ALTA = 0.6, BAIXA = 0.03, RAMPA = 0.28; // 0,03: com 0,08 a trilha ficava a 0,5 dB do "-ness" de "Fitness" (curadoria 2026-11-01)
function volumeTrilha(s: number) {
  let peso = 0;
  // v2: baixa no trecho falado INTEIRO (do corte ao corte), não palavra a palavra: a transcrição marca o fim das
  // palavras cedo e a trilha subia em cima do fim da frase
  for (const [a, b] of FIM_FALA) {
    const ini = a - 0.1, fim = b + 0.05;
    peso = Math.max(peso, interpolate(s, [ini - RAMPA, ini, fim, fim + RAMPA], [0, 1, 1, 0], { ...clamp, easing: SUAVE }));
  }
  const c0 = CONTAGEM.numeros[0].em - 0.4;
  peso = Math.max(peso, interpolate(s, [c0 - 0.2, c0, CONTAGEM.largou - 0.05, CONTAGEM.largou], [0, 0.85, 0.85, 0], clamp));
  const fade = interpolate(s, [0, 0.15, TOTAL - 0.8, TOTAL], [0, 1, 1, 0], clamp);
  return (ALTA + (BAIXA - ALTA) * peso) * fade * GANHO;
}

export const Feed: React.FC<{ mix?: "completo" | "sem-voz" }> = ({ mix = "completo" }) => {
  const s = useCurrentFrame() / FPS;
  const { z, dx, dy, rot, flash } = camera(s);
  const filtro = flash > 0.01 ? `brightness(${1 + flash}) contrast(${1 + flash * 0.25})` : undefined;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.preto, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)` }}>
        <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "540px 760px" }}>
          <Sequence durationInFrames={F(VIDEO)} layout="none">
            <OffthreadVideo src={staticFile("midia/feed.mp4")} muted={mix === "sem-voz"} volume={GANHO} style={{ width: 1080, height: 1920, filter: filtro }} />
          </Sequence>
          <Sequence from={F(VIDEO)} layout="none">
            <Freeze frame={F(VIDEO) - 2}>
              <OffthreadVideo src={staticFile("midia/feed.mp4")} muted style={{ width: 1080, height: 1920, filter: "blur(10px)" }} />
            </Freeze>
          </Sequence>
        </AbsoluteFill>
        <Textura />
        {CORTES.map((c, i) => (c.forte ? <Sequence key={`c${i}`} from={F(c.em) - 1} durationInFrames={F(0.45)} layout="none"><Vazamento semente={i + 13} /></Sequence> : null))}
        {RAIOS.map((r, i) => <Sequence key={`r${i}`} from={F(r.em)} durationInFrames={F(r.dur)} layout="none"><Raios dur={r.dur} cy={r.cy} /></Sequence>)}
        <Sequence from={F(CONTAGEM.numeros[0].em - 0.05)} durationInFrames={F(CONTAGEM.largou + 1.6 - CONTAGEM.numeros[0].em + 0.05)} layout="none"><Contagem /></Sequence>
        {BLOCOS.map((b) => <Sequence key={b.id} from={F(b.de)} durationInFrames={Math.max(1, F(b.ate) - F(b.de))} layout="none"><BlocoTexto b={b} /></Sequence>)}
        <Sequence from={F(FIM.de)} layout="none"><Cartela /></Sequence>
      </AbsoluteFill>
      <Audio src={staticFile("midia/musica-feed.wav")} volume={(fr) => volumeTrilha(fr / FPS)} />
      {SFX.map((x, i) => <Sequence key={i} from={F(x.em)} layout="none"><Audio src={staticFile(`sfx/${x.nome}.wav`)} volume={(x.vol ?? 0.6) * GANHO} /></Sequence>)}
    </AbsoluteFill>
  );
};
