import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useDelayRender } from "remotion";
import { Audio, Video } from "@remotion/media";
import { useEffect, useState } from "react";
import { loadFont } from "@remotion/google-fonts/BarlowCondensed";
import { Legendas, LEGENDA_V3 } from "../Legendas";
import type { PalavraLegenda } from "../tipos";
import segmentos from "./segmentos.json";

// Abertura (0–7,43 s) · correção técnica de 2026-09-30: a cena vira composição.
// Reenquadramento real (posição + escala, sem mostrar borda), match cut no corte da Talyta,
// dente como hero, frio volumétrico com rastro, headline escalonada, legenda maior e mais alta.
const { fontFamily: BARLOW } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin", "latin-ext"] });
const FPS = 30;
const F = (s: number) => Math.round(s * FPS);
const ROSA = "#FF86A6";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.25, 0.1, 0.25, 1); // easy ease
const ASSET = (n: string) => staticFile(`assets-odonto/${n}.png`);

const T = { hook: 0.1, some: 1.2, dente: 1.33, gelado: 1.96, corte: 2.5, sensib: 3.6, canal: 5.16, explicar: 5.7, fim: 7.43 };

const rosto = (f: number) => {
  const s = f / FPS;
  return (segmentos.find((x) => s >= x.de && s < x.ate) ?? segmentos[0]).rosto;
};

// Câmera virtual: [quadro, escala, deslocamento X, desfoque de movimento]
// 1,20→1,57 s abre espaço à direita (108%→109%, X −45) · 2,50 corte: entra a 112% com 3 quadros de blur ·
// 5,70 "vou te explicar": volta pro plano mais aberto.
const CAMERA: [number, number, number, number][] = [
  [0, 1.0, 0, 0],
  [F(1.2), 1.0, 0, 0],
  [F(1.57), 1.09, -45, 0],
  [F(T.corte) - 3, 1.09, -45, 0],
  [F(T.corte) - 1, 1.09, -45, 5],
  [F(T.corte), 1.12, 0, 5],
  [F(T.corte) + 2, 1.12, 0, 0],
  [F(T.explicar), 1.12, 0, 0],
  [F(T.explicar) + 10, 1.02, 0, 0],
  [F(T.fim), 1.02, 0, 0],
];

const Cena: React.FC = () => {
  const frame = useCurrentFrame();
  const fs = CAMERA.map((k) => k[0]);
  const op = { ...clamp, easing: SUAVE };
  const s = interpolate(frame, fs, CAMERA.map((k) => k[1]), op);
  const x = interpolate(frame, fs, CAMERA.map((k) => k[2]), op);
  const blur = interpolate(frame, fs, CAMERA.map((k) => k[3]), clamp);
  const r = rosto(frame);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="grade-v3" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.985 0 0 0 0  0 1 0 0 0  0 0 1.035 0 0  0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.05" intercept="-0.025" />
            <feFuncG type="linear" slope="1.05" intercept="-0.025" />
            <feFuncB type="linear" slope="1.05" intercept="-0.025" />
          </feComponentTransfer>
        </filter>
      </svg>
      <Video
        name="Corte da Talyta"
        src={staticFile("midia/sensibilidade-x-canal.mp4")}
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: `${r.x}px ${r.y}px`,
          scale: s,
          translate: `${x}px 0px`,
          filter: `url(#grade-v3)${blur > 0.2 ? ` blur(${blur}px)` : ""}`,
        }}
      />
      <AbsoluteFill
        style={{
          backdropFilter: "saturate(0.86)",
          maskImage: `radial-gradient(ellipse ${r.w * 1.35}px ${r.w * 1.7}px at ${r.x + x}px ${r.y + r.w * 0.2}px, transparent 55%, black 100%)`,
          WebkitMaskImage: `radial-gradient(ellipse ${r.w * 1.35}px ${r.w * 1.7}px at ${r.x + x}px ${r.y + r.w * 0.2}px, transparent 55%, black 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Headline de abertura: SENSIBILIDADE entra, OU CANAL? 4 quadros depois. Sai assim que cumpre a função.
export const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const linha = (atraso: number) => ({
    opacity: interpolate(frame, [atraso, atraso + 7, dur - 4, dur], [0, 1, 1, 0], clamp),
    translate: interpolate(frame, [atraso, atraso + 7], ["0px 18px", "0px 0px"], { ...clamp, easing: SUAVE }),
    scale: interpolate(frame, [atraso, atraso + 7], [0.96, 1], { ...clamp, easing: SUAVE }),
  });
  const base = { fontFamily: BARLOW, fontWeight: 700, fontSize: 124, lineHeight: 0.92, letterSpacing: "-0.005em", textShadow: "0 2px 10px rgba(0,0,0,0.22)" } as const;
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 870, width: "100%", textAlign: "center" }}>
        <div style={{ ...base, color: "#FFFFFF", ...linha(0) }}>SENSIBILIDADE</div>
        <div style={{ ...base, color: ROSA, ...linha(4) }}>OU CANAL?</div>
      </div>
    </AbsoluteFill>
  );
};

// Dente hero: 30% da largura, no espaço aberto à direita. Entrada 9 quadros (92→100%, Y +20→0,
// rotação Y −6→0°, opacidade), micro-movimento contínuo, sombra na parede e luz fria quando o frio chega.
export const DenteHeroPng: React.FC<{ dur: number; frioEm: number }> = ({ dur, frioEm }) => {
  const frame = useCurrentFrame();
  const e = { ...clamp, easing: SUAVE };
  const frio = interpolate(frame, [frioEm + 8, frioEm + 16], [0, 1], clamp);
  const micro = {
    rot: 2 * Math.sin(frame / 22),
    y: 3 * Math.sin(frame / 17),
    s: 1 + 0.015 * (frame / dur),
  };
  return (
    <AbsoluteFill style={{ perspective: 1200 }}>
      <Img
        src={ASSET("01_molar_realista")}
        style={{
          position: "absolute",
          left: 606,
          top: 335,
          width: 480,
          height: 480,
          opacity: interpolate(frame, [0, 9, dur - 3, dur], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [0, 9], [0.92, 1], e) * micro.s,
          translate: `0px ${interpolate(frame, [0, 9], [20, 0], e) + micro.y}px`,
          rotate: `y ${interpolate(frame, [0, 9], [-6, 0], e) + micro.rot}deg`,
          filter: [
            "drop-shadow(16px 26px 26px rgba(40,22,12,0.30))", // sombra na parede (luz vem da esquerda)
            "drop-shadow(0 0 18px rgba(255,238,224,0.22))", // luz ambiente da sala envolvendo a borda
            `drop-shadow(0 0 ${20 * frio}px rgba(214,232,255,${0.55 * frio}))`, // luz fria só no dente
          ].join(" "),
        }}
      />
    </AbsoluteFill>
  );
};

// Frio volumétrico: percorre uma curva de fora do quadro até o dente, crescendo (vem em direção à câmera),
// com rastro desfocado só enquanto se move. Depois respira devagar.
export const FrioPng: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = (f: number) => interpolate(f, [0, 16], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0.05, 0.2, 1) });
  const pos = (k: number) => {
    // curva quadrática: (1180,40) → controle (1080,420) → (800,300)
    const a = [1190, 110], c = [1100, 500], b = [810, 375];
    const u = 1 - k;
    return [u * u * a[0] + 2 * u * k * c[0] + k * k * b[0], u * u * a[1] + 2 * u * k * c[1] + k * k * b[1]];
  };
  const copia = (atraso: number, alfa: number, desfoque: number) => {
    const k = p(frame - atraso);
    const [x, y] = pos(k);
    const tam = 350 * (0.55 + 0.45 * k);
    const movendo = frame - atraso < 18 ? 1 : 0;
    return (
      <Img
        key={atraso}
        src={ASSET("09_vortice_ar_gelado")}
        style={{
          position: "absolute",
          left: x - tam / 2,
          top: y - tam / 2,
          width: tam,
          height: tam,
          opacity: alfa * interpolate(frame - atraso, [0, 4], [0, 1], clamp) * interpolate(frame, [dur - 4, dur], [1, 0], clamp) * (atraso > 0 ? movendo : 1),
          rotate: `${interpolate(frame, [0, dur], [14, -6], clamp)}deg`,
          filter: `blur(${desfoque * (1 - k)}px)`,
        }}
      />
    );
  };
  return (
    <AbsoluteFill>
      {copia(3, 0.25, 10)}
      {copia(1.5, 0.4, 6)}
      {copia(0, 0.88, 3)}
    </AbsoluteFill>
  );
};


// M1 · animação gerada no Wan 2.2 (Hugging Face, gratuito) a partir do 01 + prompt do frio, recortada do
// chroma com alfa. O dente do 1º quadro é o asset aprovado; o ar gelado envolve a coroa por volta de "gelado".
// Clipe 960×1664: dente em x 272–739, y 449–1095 → exibido a 70,7% com o dente centrado em (858, 580).
const MotionHero: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const e = { ...clamp, easing: SUAVE };
  const esc = 330 / 467;
  return (
    <AbsoluteFill style={{ perspective: 1200 }}>
      <div
        style={{
          position: "absolute",
          left: 858 - 505.5 * esc,
          top: 580 - 772 * esc,
          width: 960 * esc,
          height: 1664 * esc,
          opacity: interpolate(frame, [0, 9, dur - 3, dur], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [0, 9], [0.92, 1], e),
          translate: `0px ${interpolate(frame, [0, 9], [20, 0], e) + 3 * Math.sin(frame / 17)}px`,
          rotate: `y ${interpolate(frame, [0, 9], [-6, 0], e)}deg`,
          filter: "drop-shadow(16px 26px 26px rgba(40,22,12,0.28)) drop-shadow(0 0 18px rgba(255,238,224,0.18))",
        }}
      >
        <OffthreadVideo src={staticFile("motion/m1_alfa.webm")} transparent muted style={{ width: "100%", height: "100%" }} />
      </div>
    </AbsoluteFill>
  );
};

// SENSIBILIDADE × CANAL?: uma composição só, à esquerda, sobre o jaleco (não nos cantos).
// Em "canal" SENSIBILIDADE sobe e recua, CANAL? entra embaixo em rosa; o fio rosa separa as duas ideias.
export const Comparacao: React.FC<{ dur: number; canalEm: number }> = ({ dur, canalEm }) => {
  const frame = useCurrentFrame();
  const e = { ...clamp, easing: SUAVE };
  const sai = interpolate(frame, [dur - 5, dur], [1, 0], clamp);
  const sobe = interpolate(frame, [canalEm, canalEm + 8], [0, -30], e);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 64, top: 868, opacity: sai, translate: `0px ${interpolate(frame, [dur - 5, dur], [0, -10], clamp)}px` }}>
        <div
          style={{
            fontFamily: BARLOW,
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            color: "#FFFFFF",
            textShadow: "0 2px 10px rgba(0,0,0,0.22)",
            opacity: interpolate(frame, [0, 7], [0, 1], clamp) * interpolate(frame, [canalEm, canalEm + 8], [1, 0.82], clamp),
            translate: `0px ${interpolate(frame, [0, 7], [18, 0], e) + sobe}px`,
            scale: interpolate(frame, [0, 7], [0.96, 1], e),
            transformOrigin: "left center",
          }}
        >
          SENSIBILIDADE
        </div>
        <div
          style={{
            width: 150,
            height: 4,
            borderRadius: 2,
            background: ROSA,
            marginTop: 14,
            scale: `${interpolate(frame, [4, 13], [0, 1], e)} 1`,
            transformOrigin: "left center",
            translate: `0px ${sobe}px`,
            boxShadow: "0 0 10px rgba(255,134,166,0.45)",
          }}
        />
        <div
          style={{
            fontFamily: BARLOW,
            fontWeight: 700,
            fontSize: 128,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            color: ROSA,
            textShadow: "0 2px 10px rgba(0,0,0,0.22)",
            marginTop: 4,
            opacity: interpolate(frame, [canalEm, canalEm + 7], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [canalEm, canalEm + 7], [18, 0], e) + sobe}px`,
            scale: interpolate(frame, [canalEm, canalEm + 7], [0.96, 1], e),
            transformOrigin: "left center",
          }}
        >
          CANAL?
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ em: number; nome: string; volume: number }> = ({ em, nome, volume }) => (
  <Sequence name={`SFX · ${nome}`} from={F(em)} durationInFrames={F(1)} layout="none">
    <Audio src={staticFile(`sfx/${nome}.wav`)} volume={volume} />
  </Sequence>
);

export const ABERTURA_V3 = F(T.fim) - 1;

export const AberturaV3: React.FC = () => {
  const [legendas, setLegendas] = useState<PalavraLegenda[] | null>(null);
  const { delayRender, continueRender } = useDelayRender();
  const [h] = useState(() => delayRender("legendas"));
  useEffect(() => {
    fetch(staticFile("reels/sxc/legendas.json"))
      .then((r) => r.json())
      .then((l: PalavraLegenda[]) => {
        setLegendas(l.filter((p) => p.startMs < T.fim * 1000));
        continueRender(h);
      });
  }, [continueRender, h]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#140C10" }}>
      <Cena />

      <Sequence name="Hook · SENSIBILIDADE / OU CANAL?" from={F(T.hook)} durationInFrames={F(T.some) - F(T.hook)}>
        <Hook dur={F(T.some) - F(T.hook)} />
      </Sequence>

      <Sequence name="M1 · molar + ar gelado (Wan 2.2)" from={F(T.dente)} durationInFrames={F(T.corte) - F(T.dente)}>
        <MotionHero dur={F(T.corte) - F(T.dente)} />
      </Sequence>

      <Sequence name="SENSIBILIDADE × CANAL?" from={F(T.sensib)} durationInFrames={F(T.explicar) - F(T.sensib)}>
        <Comparacao dur={F(T.explicar) - F(T.sensib)} canalEm={F(T.canal) - F(T.sensib)} />
      </Sequence>

      {legendas ? (
        <Legendas
          palavras={legendas}
          estilo={LEGENDA_V3}
          ocultar={[
            [T.hook * 1000, T.some * 1000],
            [T.sensib * 1000, T.explicar * 1000],
          ]}
        />
      ) : null}

      <Audio src={staticFile("trilha/provisoria.wav")} volume={1} />
      <Sfx em={T.hook} nome="soft-hit" volume={0.1} />
      <Sfx em={T.dente} nome="low-impact" volume={0.1} />
      <Sfx em={T.gelado - 0.05} nome="air-whoosh" volume={0.22} />
      <Sfx em={T.corte - 0.08} nome="micro-whoosh" volume={0.18} />
      <Sfx em={T.sensib} nome="soft-hit" volume={0.08} />
      <Sfx em={T.canal} nome="tonal-tick" volume={0.14} />
      <Sfx em={T.explicar} nome="micro-whoosh" volume={0.12} />
    </AbsoluteFill>
  );
};
