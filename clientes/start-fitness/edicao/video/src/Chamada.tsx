import { Audio } from "@remotion/media";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ANTON, BARLOW, COR, F, FPS, INCLINA, MANUSCRITA, MONTSERRAT, REVELA, SUAVE, aberracao, cabe, clamp, extrusao } from "./marca";
import { BLOCOS, CARIMBO, CONTADOR, CORTES, FALA, IMPACTOS, PREMIO, RAIOS, RELOGIO, SFX, TOTAL, VOANDO, type Bloco, type Linha } from "./plano";
import rastreio from "./rastreio.json";
import musica from "./musica.json";

// Chamada da 2ª Corrida Start Fitness (1º/11/2026), v2 "adrenalina". O vídeo chega cortado e com cor: aqui entram
// headlines, assets, som (trilha com ducking + efeitos pesados) e a câmera (soco, tremida, flash, pulso na batida).

type Trecho = { de: number; ate: number; x: number[]; y: number[] };
const TRECHOS = (rastreio as { trechos: Record<string, Trecho> }).trechos;
const BATIDAS = (musica as { batidas: number[] }).batidas;
const GRANDES = new Set(["mega", "vermelho", "faixa"]);

// cada headline grande que bate na tela dá um soco na câmera
const TODOS_IMPACTOS = [
  ...IMPACTOS,
  ...BLOCOS.flatMap((b) => b.linhas.filter((l) => GRANDES.has(l.estilo)).map((l) => ({ em: l.em, forca: l.anim === "letras" ? 0.3 : 0.5 }))),
];

// ---------- câmera ----------
function camera(s: number) {
  let z = 1, amp = 0, flash = 0;
  for (const { em, forca } of TODOS_IMPACTOS) {
    const d = s - em;
    if (d < 0 || d > 0.6) continue;
    z += 0.055 * forca * Math.exp(-d / 0.13);
    amp += 18 * forca * Math.exp(-d / 0.08);
    flash += 0.55 * forca * Math.exp(-d / 0.045);
  }
  // pulso leve em cada batida da música
  const b = BATIDAS.filter((x) => x <= s).pop();
  if (b !== undefined) z += 0.014 * Math.exp(-(s - b) / 0.1);
  // prêmio: segura um zoom um pouco maior enquanto o número está na tela
  z *= interpolate(s, [PREMIO.mil, PREMIO.mil + 0.3, PREMIO.ate - 0.1, PREMIO.ate + 0.2], [1, 1.05, 1.05, 1], { ...clamp, easing: SUAVE });
  const fr = Math.round(s * FPS);
  return { z, dx: (random(`x${fr}`) - 0.5) * 2 * amp, dy: (random(`y${fr}`) - 0.5) * 2 * amp, rot: (random(`r${fr}`) - 0.5) * amp * 0.04, flash: Math.min(flash, 1.2) };
}

// ---------- uma linha ----------
const tamanho = (l: Linha, larg: number) =>
  l.estilo === "tag" || l.estilo === "tagVermelho" ? l.max ?? 50 : cabe(l.t, larg * (l.estilo === "faixa" ? 0.86 : 1), l.max ?? 400);
const altura = (l: Linha, tam: number) => (l.estilo.startsWith("tag") ? tam * 1.45 : tam * 0.9 + (l.estilo === "faixa" ? tam * 0.22 : 0));

const LinhaTexto: React.FC<{ l: Linha; s: number; alinha: "centro" | "esq"; larg: number; pulso: number }> = ({ l, s, alinha, larg, pulso }) => {
  const tam = tamanho(l, larg);
  const h = altura(l, tam);
  const k = (s - l.em) * FPS; // quadros desde a entrada
  if (k < 0) return <div style={{ height: h }} />;
  const origem = alinha === "esq" ? "left center" : "center";
  const ab = interpolate(k, [0, 5], [tam * 0.07, 0], clamp);

  if (l.estilo === "tag" || l.estilo === "tagVermelho") {
    const p = interpolate(k, [0, 4], [0, 1], { ...clamp, easing: REVELA });
    return (
      <div style={{ height: h, display: "flex", alignItems: "center" }}>
        <div style={{
          fontFamily: BARLOW, fontWeight: 700, fontStyle: "italic", fontSize: tam, lineHeight: 1, letterSpacing: "0.08em", color: COR.branco,
          background: l.estilo === "tag" ? "rgba(8,8,9,0.88)" : COR.vermelho, padding: "0.14em 0.45em 0.1em", transform: `skewX(${INCLINA}deg)`,
          clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, boxShadow: "6px 6px 0 rgba(0,0,0,0.55)", whiteSpace: "nowrap",
        }}>{l.t}</div>
      </div>
    );
  }

  const baseTexto: React.CSSProperties = { fontFamily: ANTON, fontSize: tam, lineHeight: 0.9, whiteSpace: "nowrap", letterSpacing: "0.005em" };

  if (l.estilo === "contorno") {
    const p = interpolate(k, [0, 4], [0, 1], { ...clamp, easing: REVELA });
    return (
      <div style={{ height: h, display: "flex", justifyContent: alinha === "esq" ? "flex-start" : "center" }}>
        <div style={{ ...baseTexto, color: "transparent", WebkitTextStroke: `${Math.max(2, tam * 0.018)}px rgba(255,255,255,0.85)`, opacity: p * 0.9, transform: `skewX(${INCLINA}deg) scale(${(0.82 + 0.18 * p) * (1 + 0.01 * k)})`, transformOrigin: origem }}>{l.t}</div>
      </div>
    );
  }

  const cor = l.estilo === "vermelho" ? COR.vermelho : COR.branco;
  const sombra = l.estilo === "vermelho" ? extrusao(tam, "#5A0508", "#120102") : extrusao(tam);
  const slam = l.anim !== "letras";
  const sc = slam ? interpolate(k, [0, 1, 2, 3, 4, 6], l.estilo === "faixa" ? [1.7, 1.2, 1, 0.97, 1.01, 1] : [2.3, 1.45, 1, 0.95, 1.02, 1], clamp) : 1;
  const desfoque = slam ? interpolate(k, [0, 1, 2], [16, 6, 0], clamp) : 0;
  const onda = interpolate(k, [1, 9], [0, 1], clamp); // contorno que se expande depois da pancada

  const letras = l.anim === "letras"
    ? [...l.t].map((c, i) => {
        const ki = k - i * 1.1;
        const p = interpolate(ki, [0, 4], [0, 1], { ...clamp, easing: REVELA });
        return <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateX(${(1 - p) * 300}px) scaleX(${1 + (1 - p) * 0.8})`, filter: p < 1 ? `blur(${(1 - p) * 14}px)` : undefined }}>{c === " " ? " " : c}</span>;
      })
    : l.t;

  const texto = (
    <div style={{ position: "relative" }}>
      {slam && onda < 1 ? (
        <div style={{ ...baseTexto, position: "absolute", inset: 0, color: "transparent", WebkitTextStroke: `${Math.max(2, tam * 0.015)}px rgba(255,255,255,${0.8 * (1 - onda)})`, transform: `scale(${1 + onda * 0.4})`, transformOrigin: origem }}>{l.t}</div>
      ) : null}
      <div style={{ ...baseTexto, color: l.estilo === "faixa" ? COR.branco : cor, textShadow: l.estilo === "faixa" ? `${aberracao(ab)}4px 4px 0 #5A0508` : aberracao(ab) + sombra }}>{letras}</div>
    </div>
  );

  return (
    <div style={{ height: h, display: "flex", alignItems: "center", justifyContent: alinha === "esq" ? "flex-start" : "center" }}>
      <div style={{ transform: `skewX(${INCLINA}deg) scale(${sc * pulso})`, transformOrigin: origem, filter: desfoque ? `blur(${desfoque}px)` : undefined, opacity: interpolate(k, [0, 1], [0.5, 1], clamp) }}>
        {l.estilo === "faixa" ? (
          <div style={{ position: "relative", padding: `${tam * 0.1}px ${tam * 0.22}px ${tam * 0.06}px` }}>
            <div style={{ position: "absolute", inset: 0, background: COR.vermelho, transform: `scaleX(${interpolate(k, [0, 3], [0, 1], { ...clamp, easing: REVELA })})`, transformOrigin: "left", boxShadow: `${tam * 0.08}px ${tam * 0.08}px 0 #000, 0 ${tam * 0.15}px ${tam * 0.3}px rgba(0,0,0,0.5)` }} />
            {texto}
          </div>
        ) : texto}
      </div>
    </div>
  );
};

// ---------- bloco de headline (fixo ou seguindo a mão) ----------
const BlocoTexto: React.FC<{ b: Bloco }> = ({ b }) => {
  const s = useCurrentFrame() / FPS + b.de;
  const alinha = b.alinha ?? "centro";
  const larg = b.larg ?? 840;
  const sai = interpolate(s, [b.ate - 0.13, b.ate], [0, 1], { ...clamp, easing: (x) => x * x });
  let x = b.x, y = b.y;
  if (b.rastreio) {
    const tr = TRECHOS[b.rastreio.trecho];
    const n = tr.x.length;
    const k = Math.min(n - 1, Math.max(0, Math.round(s * FPS) - tr.de));
    const mx = tr.x.reduce((a, v) => a + v, 0) / n, my = tr.y.reduce((a, v) => a + v, 0) / n;
    x = mx + b.rastreio.leve * (tr.x[k] - mx) + b.rastreio.dx;
    y = my + b.rastreio.leve * (tr.y[k] - my) + b.rastreio.dy;
    if (b.rastreio.base) {
      // o ponto rastreado é o pé do bloco (ex.: o número em cima da ponta do dedo)
      const alturaBloco = b.linhas.reduce((a, l) => a + altura(l, tamanho(l, larg)), 0) + 8 * (b.linhas.length - 1);
      y = Math.max(120, y - alturaBloco);
    }
    // nunca sai da zona segura (número em cima do dedo pode chegar mais perto da borda: o dedo vai até x ≈ 40)
    const margem = b.rastreio.base ? 20 : 60;
    x = Math.min(920 - larg / 2, Math.max(margem + larg / 2, x));
  }
  const pulsoDe = (i: number) =>
    (b.pulsos ?? []).filter((p) => p.linha === i).reduce((acc, p) => acc * interpolate(s, [p.em, p.em + 0.08, p.em + 0.35], [1, 1.16, 1], { ...clamp, easing: SUAVE }), 1);
  return (
    <div style={{
      position: "absolute", top: y, left: alinha === "esq" ? x : x - 540, width: alinha === "esq" ? 900 : 1080,
      display: "flex", flexDirection: "column", alignItems: alinha === "esq" ? "flex-start" : "center", gap: 8,
      opacity: 1 - sai, transform: `translateX(${-sai * 260}px) scaleX(${1 + sai * 0.25})`, filter: sai > 0 ? `blur(${sai * 14}px)` : undefined,
    }}>
      {b.linhas.map((l, i) => <LinhaTexto key={i} l={l} s={s} alinha={alinha} larg={larg} pulso={pulsoDe(i)} />)}
    </div>
  );
};

// ---------- selo "INSCRIÇÕES ABERTAS" ----------
const Carimbo: React.FC = () => {
  const s = useCurrentFrame() / FPS + CARIMBO.de;
  const k = (s - CARIMBO.de) * FPS;
  const sc = interpolate(k, [0, 2, 3, 4, 6], [3.2, 1, 0.94, 1.03, 1], clamp);
  const sai = interpolate(s, [CARIMBO.ate - 0.12, CARIMBO.ate], [0, 1], clamp);
  const anel = interpolate(k, [2, 10], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: CARIMBO.y - 200, height: 400, display: "flex", justifyContent: "center", alignItems: "center", opacity: interpolate(k, [0, 1], [0.4, 1], clamp) * (1 - sai) }}>
      <div style={{ position: "absolute", width: 900 * anel, height: 900 * anel, borderRadius: "50%", border: `${14 * (1 - anel)}px solid rgba(255,255,255,${0.7 * (1 - anel)})` }} />
      <div style={{
        border: `12px solid ${COR.branco}`, background: COR.vermelho, padding: "16px 50px 10px", textAlign: "center", marginLeft: -90,
        transform: `rotate(${-8 + (1 - Math.min(1, k / 2)) * 10}deg) scale(${sc})`, boxShadow: "14px 14px 0 #000, 0 30px 60px rgba(0,0,0,0.5)",
        filter: k < 2 ? `blur(${(2 - k) * 6}px)` : undefined,
      }}>
        <div style={{ fontFamily: BARLOW, fontWeight: 700, fontStyle: "italic", fontSize: 66, letterSpacing: "0.14em", color: COR.branco, lineHeight: 1 }}>{CARIMBO.linhas[0]}</div>
        <div style={{ fontFamily: ANTON, fontSize: 190, color: COR.branco, lineHeight: 0.92, textShadow: "6px 6px 0 #5A0508" }}>{CARIMBO.linhas[1]}</div>
      </div>
    </div>
  );
};

// ---------- cronômetro ----------
const Relogio: React.FC = () => {
  const s = useCurrentFrame() / FPS + RELOGIO.de;
  const d = s - RELOGIO.de;
  const p = interpolate(d, [0, 0.12, 0.2], [0, 1.15, 1], clamp);
  const sai = interpolate(s, [RELOGIO.ate - 0.13, RELOGIO.ate], [0, 1], clamp);
  const ang = d * 900; // ponteiro correndo
  const r = 74;
  return (
    <svg width={240} height={260} viewBox="-120 -140 240 260" style={{ position: "absolute", left: RELOGIO.x - 120, top: RELOGIO.y - 140, opacity: 1 - sai, transform: `scale(${p}) rotate(${Math.sin(d * 40) * 4}deg)`, filter: "drop-shadow(0 0 22px rgba(227,20,27,0.7)) drop-shadow(6px 6px 0 #000)" }}>
      <rect x={-16} y={-r - 40} width={32} height={20} rx={4} fill={COR.branco} />
      <rect x={-7} y={-r - 22} width={14} height={14} fill={COR.branco} />
      <circle r={r} fill="rgba(11,11,12,0.8)" stroke={COR.branco} strokeWidth={12} />
      <path d={`M 0 0 L 0 ${-r + 16} A ${r - 16} ${r - 16} 0 ${(ang % 360) > 180 ? 1 : 0} 1 ${Math.sin((ang * Math.PI) / 180) * (r - 16)} ${-Math.cos((ang * Math.PI) / 180) * (r - 16)} Z`} fill="rgba(227,20,27,0.55)" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-r + 14} x2={0} y2={-r + (i % 3 === 0 ? 30 : 22)} stroke={COR.branco} strokeWidth={5} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={10} x2={0} y2={-r + 18} stroke={COR.vermelho} strokeWidth={8} strokeLinecap="round" transform={`rotate(${ang})`} />
      <circle r={9} fill={COR.vermelho} stroke={COR.branco} strokeWidth={3} />
    </svg>
  );
};

// ---------- rastro de velocidade atrás do "VOANDO" ----------
const Rastro: React.FC = () => {
  const s = useCurrentFrame() / FPS + VOANDO.em;
  const sai = interpolate(s, [VOANDO.ate - 0.2, VOANDO.ate], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: sai }}>
      {Array.from({ length: 26 }, (_, i) => {
        const y = 1250 + (random(`ry${i}`) - 0.5) * 380;
        const vel = 3200 + random(`rv${i}`) * 2600;
        const atraso = random(`rd${i}`) * 0.35;
        const x = -700 + (s - VOANDO.em - atraso) * vel;
        const w = 260 + random(`rw${i}`) * 480;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: 5 + random(`rh${i}`) * 10, borderRadius: 8, background: i % 3 === 0 ? COR.vermelho : "rgba(255,255,255,0.9)", opacity: s - VOANDO.em > atraso ? 1 : 0, filter: "blur(1px)" }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- linhas de velocidade radiais ----------
const Raios: React.FC<{ dur: number; cx?: number; cy?: number }> = ({ dur, cx = 540, cy = 1150 }) => {
  const f = useCurrentFrame();
  const d = f / FPS;
  const op = interpolate(d, [0, 0.04, dur * 0.6, dur], [0, 0.85, 0.5, 0], clamp);
  const sem = Math.floor(f / 2);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: op }}>
      {Array.from({ length: 90 }, (_, i) => {
        const a = (i / 90) * Math.PI * 2 + random(`ra${i}-${sem}`) * 0.05;
        const r0 = 380 + random(`r0${i}-${sem}`) * 380;
        const w = 0.006 + random(`rw${i}`) * 0.012;
        const R = 2000;
        const p = (r: number, aa: number) => `${cx + Math.cos(aa) * r},${cy + Math.sin(aa) * r}`;
        return <polygon key={i} points={`${p(r0, a)} ${p(R, a - w)} ${p(R, a + w)}`} fill={i % 5 === 0 ? "rgba(255,60,60,0.8)" : "rgba(255,255,255,0.75)"} />;
      })}
    </svg>
  );
};

// ---------- luz vazando nos cortes ----------
const Vazamento: React.FC<{ semente: number }> = ({ semente }) => {
  const d = useCurrentFrame() / FPS;
  const op = interpolate(d, [0, 0.05, 0.42], [0, 0.95, 0], clamp);
  const x = interpolate(d, [0, 0.42], [-300, 1300]);
  const y = 400 + random(`vz${semente}`) * 1100;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: op }}>
      <div style={{ position: "absolute", left: x - 700, top: y - 700, width: 1400, height: 1400, background: "radial-gradient(circle, rgba(255,90,40,0.95) 0%, rgba(227,20,27,0.6) 35%, rgba(227,20,27,0) 70%)" }} />
      <AbsoluteFill style={{ background: "rgba(255,255,255,0.35)", opacity: interpolate(d, [0, 0.08], [1, 0], clamp) }} />
    </AbsoluteFill>
  );
};

// ---------- contador de roleta: "são R$ 4.000 em premiação" (referência: tutorial no Cosmos) ----------
// cada dígito é uma fita 0–9 que gira com desfoque de movimento vertical, desacelera e trava com um quique,
// um depois do outro; em cima e embaixo a fita some num degradê (máscara)
const Contador: React.FC = () => {
  const s = useCurrentFrame() / FPS + CONTADOR.de;
  const { tam } = CONTADOR;
  const lh = tam * 1.08;
  const entra = interpolate(s, [CONTADOR.de, CONTADOR.de + 0.15], [0, 1], { ...clamp, easing: REVELA });
  const sai = interpolate(s, [CONTADOR.ate - 0.14, CONTADOR.ate], [0, 1], { ...clamp, easing: (x) => x * x });
  const pPrem = interpolate(s, [CONTADOR.premiacao, CONTADOR.premiacao + 0.18], [0, 1], { ...clamp, easing: REVELA });
  let d = -1;
  const estilo: React.CSSProperties = { fontFamily: MONTSERRAT, fontWeight: 800, fontSize: tam, lineHeight: 1, color: COR.branco, textShadow: "0 6px 22px rgba(0,0,0,0.55)" };
  return (
    <div style={{ position: "absolute", left: 0, width: 990, top: CONTADOR.y, display: "flex", flexDirection: "column", alignItems: "center", opacity: entra * (1 - sai), transform: `translateX(${-sai * 240}px) scale(${0.9 + 0.1 * entra})`, filter: sai > 0 ? `blur(${sai * 12}px)` : undefined }}>
      <div style={{ display: "flex", alignItems: "center", height: lh }}>
        {CONTADOR.partes.map((c, i) => {
          if (!/\d/.test(c)) return <div key={i} style={{ ...estilo, width: c === " " ? tam * 0.22 : undefined, padding: c === "." ? "0 0.02em" : undefined }}>{c === " " ? "" : c}</div>;
          d += 1;
          const alvo = Number(c);
          const trava = CONTADOR.trava[d];
          const ini = CONTADOR.de + 0.06 + d * 0.04;
          const D = 20 + alvo; // duas voltas inteiras e para no número
          const u = Math.min(1, Math.max(0, (s - ini) / (trava - ini)));
          let p = D * (1 - Math.pow(1 - u, 3));
          let vel = s > ini && s < trava ? (D * 3 * Math.pow(1 - u, 2)) / (trava - ini) : 0; // dígitos por segundo
          if (s >= trava) {
            const q = s - trava;
            p = D + 0.28 * Math.exp(-q / 0.07) * Math.sin(q * 38); // quique ao travar
            vel = 0.28 * 38 * Math.exp(-q / 0.07);
          }
          const borrao = Math.min(70, ((vel * lh) / FPS) * 0.16);
          const base = Math.floor(p);
          return (
            <div key={i} style={{ position: "relative", width: tam * 0.74, height: lh * 2.4, margin: `${-lh * 0.7}px 0`, WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 34%, #000 66%, transparent 100%)", maskImage: "linear-gradient(180deg, transparent 0%, #000 34%, #000 66%, transparent 100%)" }}>
              <svg width={0} height={0} style={{ position: "absolute" }}><filter id={`borrao${d}`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={`0 ${borrao.toFixed(1)}`} /></filter></svg>
              <div style={{ position: "absolute", inset: 0, filter: borrao > 0.4 ? `url(#borrao${d})` : undefined }}>
                {[-2, -1, 0, 1, 2].map((j) => {
                  const n = base + j;
                  // os vizinhos só aparecem enquanto a fita gira; parado, fica só o número
                  const op = Math.abs(n - p) < 0.5 ? 1 : Math.min(1, vel / 8);
                  return <div key={j} style={{ ...estilo, position: "absolute", left: 0, width: "100%", textAlign: "center", top: lh * 1.2 - lh / 2 + (n - p) * lh, opacity: op }}>{((n % 10) + 10) % 10}</div>;
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* "em premiação" embaixo, quando ele fala */}
      <div style={{ marginTop: 6, clipPath: `inset(0 ${(1 - pPrem) * 100}% 0 0)` }}>
        <div style={{ fontFamily: BARLOW, fontWeight: 700, fontStyle: "italic", fontSize: 46, letterSpacing: "0.14em", color: COR.branco, background: COR.vermelho, padding: "6px 22px 3px", transform: `skewX(${INCLINA}deg)`, boxShadow: "6px 6px 0 rgba(0,0,0,0.55)" }}>EM PREMIAÇÃO</div>
      </div>
    </div>
  );
};

// ---------- prêmio: "R$ 4.000 em premiação" (estética do print "$30,000 Business") ----------
// número grosso vermelho com brilho forte + palavra manuscrita branca com brilho por cima, degradê escuro embaixo
const brilhoVermelho = (g: number) =>
  `0 0 ${8 * g}px rgba(255,60,50,0.95), 0 0 ${24 * g}px rgba(255,20,20,0.85), 0 0 ${56 * g}px rgba(255,0,0,0.6), 0 0 ${110 * g}px rgba(255,0,0,0.4)`;
const Premio: React.FC = () => {
  const s = useCurrentFrame() / FPS + PREMIO.de;
  const kRs = (s - PREMIO.rs) * FPS, kMil = (s - PREMIO.mil) * FPS;
  const sai = interpolate(s, [PREMIO.ate - 0.16, PREMIO.ate], [0, 1], { ...clamp, easing: (x) => x * x });
  const t0 = s - PREMIO.mil;
  const T = 172, S = 150;
  const sc = kMil >= 0 ? interpolate(kMil, [0, 1, 2, 3, 4, 6], [1.9, 1.3, 1, 0.96, 1.02, 1], clamp) : interpolate(kRs, [0, 3], [1.3, 1], clamp);
  // brilho: explode no "4", depois respira na batida da música
  const batida = t0 > 0.3 ? 0.12 * Math.max(0, Math.cos((t0 - 0.3) * Math.PI * 2 * (95.7 / 60))) : 0;
  const g = kMil >= 0 ? 1 + 0.7 * Math.exp(-t0 / 0.12) + batida : 0.6;
  const escrita = interpolate(s, [PREMIO.em, PREMIO.em + 0.42], [0, 1], { ...clamp, easing: SUAVE }); // a manuscrita "se escreve"
  const anel = interpolate(kMil, [0, 9], [0, 1], clamp);
  const texto = kMil >= 0 ? "R$4.000" : "R$";
  return (
    <AbsoluteFill style={{ opacity: 1 - sai, transform: `scale(${1 + sai * 0.4})`, filter: sai > 0 ? `blur(${sai * 12}px)` : undefined }}>
      {/* degradê escuro de baixo, como na referência (o rosto fica acima de y ≈ 820) */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 46%, rgba(0,0,0,0.6) 62%, rgba(0,0,0,0.88) 100%)", opacity: interpolate(kRs, [0, 5], [0, 1], clamp) }} />
      {/* onda de choque vermelha */}
      {kMil >= 0 && anel < 1 ? <div style={{ position: "absolute", left: 495 - 1000 * anel, top: 1220 - 1000 * anel, width: 2000 * anel, height: 2000 * anel, borderRadius: "50%", border: `${26 * (1 - anel)}px solid rgba(255,40,40,${0.8 * (1 - anel)})`, boxShadow: `0 0 60px rgba(255,0,0,${0.6 * (1 - anel)})` }} /> : null}
      {/* dinheiro explodindo pros lados, por trás do número */}
      {t0 > 0 && Array.from({ length: 16 }, (_, i) => {
        const nota = i % 2 === 0;
        // abre pros lados (8° a 62° da horizontal): não sobe reto, então não cobre o rosto dele
        const ang = (0.045 + random(`a${i}`) * 0.3) * Math.PI;
        const v = 1100 + random(`v${i}`) * 1900;
        const gr = 3000;
        const lado = random(`l${i}`) > 0.5 ? 1 : -1;
        const x = 495 + Math.cos(ang) * v * t0 * lado * 0.85;
        const y = 1230 - Math.sin(ang) * v * t0 * 0.75 + 0.5 * gr * t0 * t0;
        const rot = (random(`r${i}`) - 0.5) * 1100 * t0;
        const esc = 0.7 + random(`e${i}`) * 0.8;
        return nota ? (
          <div key={i} style={{ position: "absolute", left: x - 90, top: y - 43, width: 180, height: 86, borderRadius: 8, background: "linear-gradient(135deg,#4FD27F,#1C6E3B)", border: "4px solid #C8F7D8", transform: `rotate(${rot}deg) scale(${esc}) rotateY(${t0 * 800 * (random(`f${i}`) - 0.5)}deg)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 46, color: "#EFFFF4", boxShadow: "0 8px 18px rgba(0,0,0,0.4)" }}>R$</div>
        ) : (
          <div key={i} style={{ position: "absolute", left: x - 45, top: y - 45, width: 90, height: 90, borderRadius: 45, background: "radial-gradient(circle at 35% 30%,#FFF6C2,#F7C844 45%,#A8740A)", border: "4px solid #FFE58A", transform: `rotate(${rot}deg) scale(${esc}) scaleX(${0.3 + 0.7 * Math.abs(Math.cos(t0 * 14 + i))})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 44, color: "#7A4E00", boxShadow: "0 8px 18px rgba(0,0,0,0.4)" }}>$</div>
        );
      })}
      <div style={{ position: "absolute", left: 0, width: 990, top: 1110, display: "flex", flexDirection: "column", alignItems: "center", opacity: kRs >= 0 ? 1 : 0 }}>
        {/* R$4.000 vermelho com brilho */}
        <div style={{ position: "relative", transform: `scale(${sc})`, filter: kMil >= 0 && kMil < 2 ? `blur(${(2 - kMil) * 8}px)` : undefined }}>
          <div style={{ fontFamily: MONTSERRAT, fontWeight: 900, fontSize: T, lineHeight: 1, letterSpacing: "-0.02em", color: "#FF1F1F", textShadow: brilhoVermelho(g), whiteSpace: "nowrap" }}>{texto}</div>
          <div style={{ position: "absolute", inset: 0, fontFamily: MONTSERRAT, fontWeight: 900, fontSize: T, lineHeight: 1, letterSpacing: "-0.02em", background: "linear-gradient(180deg, #FF7468 0%, #FF2A22 46%, #D40A0A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", whiteSpace: "nowrap" }}>{texto}</div>
        </div>
        {/* manuscrita branca por cima do pé do número */}
        <div style={{ marginTop: -T * 0.48, marginLeft: T * 0.6, clipPath: `inset(-40% ${(1 - escrita) * 100}% -40% -10%)`, transform: "rotate(-4deg)" }}>
          <div style={{ fontFamily: MANUSCRITA, fontSize: S, lineHeight: 1.1, color: COR.branco, whiteSpace: "nowrap", textShadow: "0 0 12px rgba(255,255,255,0.95), 0 0 32px rgba(255,255,255,0.55), 0 8px 22px rgba(0,0,0,0.7)" }}>em premiação</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- grão de filme + vinheta (textura de comercial esportivo) ----------
const Textura: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.22 }}>
        <filter id={`grao${f % 8}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 8} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={1080} height={1920} filter={`url(#grao${f % 8})`} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- trilha: alta nos respiros, bem baixa (só o fundo) quando ele fala ----------
// GANHO: tudo entra 3 dB abaixo (a voz original já bate em -2,8 dBFS); o volume final é acertado no
// render_final.ps1 (loudnorm -14 LUFS + limitador), sem estourar
const GANHO = 0.7;
const ALTA = 0.55, BAIXA = 0.08, RAMPA = 0.28;
function volumeTrilha(s: number) {
  let peso = 0;
  for (const [a, b] of FALA) {
    const ini = a - 0.15, fim = b + 0.25;
    peso = Math.max(peso, interpolate(s, [ini - RAMPA, ini, fim, fim + RAMPA], [0, 1, 1, 0], { ...clamp, easing: SUAVE }));
  }
  const fade = interpolate(s, [0, 0.25, TOTAL - 0.7, TOTAL], [0, 1, 1, 0], clamp);
  // a trilha some no fim do riser e volta junto com o boom do prêmio
  const queda = interpolate(s, [PREMIO.mil - 0.22, PREMIO.mil - 0.08, PREMIO.mil, PREMIO.mil + 0.1], [1, 0, 0, 1], clamp);
  return (ALTA + (BAIXA - ALTA) * peso) * fade * queda * GANHO;
}

// mix "sem-voz" serve só pra curadoria medir a trilha e os efeitos separados da fala
export const Chamada: React.FC<{ mix?: "completo" | "sem-voz" }> = ({ mix = "completo" }) => {
  const s = useCurrentFrame() / FPS;
  const { z, dx, dy, rot, flash } = camera(s);
  return (
    <AbsoluteFill style={{ backgroundColor: COR.preto, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)` }}>
        <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "540px 640px" }}>
          <OffthreadVideo src={staticFile("midia/chamada.mp4")} muted={mix === "sem-voz"} volume={GANHO} style={{ width: 1080, height: 1920, filter: flash > 0.01 ? `brightness(${1 + flash}) contrast(${1 + flash * 0.25})` : undefined }} />
        </AbsoluteFill>
        <Textura />
        {CORTES.map((c, i) => <Sequence key={`c${i}`} from={F(c) - 1} durationInFrames={F(0.45)} layout="none"><Vazamento semente={i} /></Sequence>)}
        {RAIOS.map((r, i) => <Sequence key={`r${i}`} from={F(r.em)} durationInFrames={F(r.dur)} layout="none"><Raios dur={r.dur} /></Sequence>)}
        <Sequence from={F(RELOGIO.de)} durationInFrames={F(RELOGIO.ate - RELOGIO.de)} layout="none"><Relogio /></Sequence>
        <Sequence from={F(VOANDO.em)} durationInFrames={F(VOANDO.ate - VOANDO.em)} layout="none"><Rastro /></Sequence>
        {BLOCOS.map((b) => <Sequence key={b.id} from={F(b.de)} durationInFrames={Math.max(1, F(b.ate) - F(b.de))} layout="none"><BlocoTexto b={b} /></Sequence>)}
        <Sequence from={F(CONTADOR.de)} durationInFrames={F(CONTADOR.ate - CONTADOR.de)} layout="none"><Contador /></Sequence>
        <Sequence from={F(CARIMBO.de)} durationInFrames={F(CARIMBO.ate - CARIMBO.de)} layout="none"><Carimbo /></Sequence>
        <Sequence from={F(PREMIO.de)} durationInFrames={F(PREMIO.ate - PREMIO.de)} layout="none"><Premio /></Sequence>
      </AbsoluteFill>

      <Audio src={staticFile("midia/musica.wav")} volume={(fr) => volumeTrilha(fr / FPS)} />
      {SFX.map((x, i) => <Sequence key={i} from={F(x.em)} layout="none"><Audio src={staticFile(`sfx/${x.nome}.wav`)} volume={(x.vol ?? 0.6) * GANHO} /></Sequence>)}
    </AbsoluteFill>
  );
};
