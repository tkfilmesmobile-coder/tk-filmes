import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useDelayRender } from "remotion";
import { Audio } from "@remotion/media";
import { useEffect, useState } from "react";
import { Legendas } from "../Legendas";
import type { PalavraLegenda } from "../tipos";
import { VideoBase, type Punch } from "./VideoBase";
import { HeadlineClinica, LadoComparacao } from "./Texto";
import segmentos from "./segmentos.json";

// "Sensibilidade x Canal" · Dra. Camilla Wanderley · finalização sobre o corte da Talyta.
// Direção de edição de 2026-09-30 (2ª versão): rosa nos destaques, assets PNG realistas, um asset por vez,
// ~70% talking head. Tempos em segundos do corte, medidos no áudio (scripts/falas.py + forma de onda).
const FPS = 30;
const F = (s: number) => Math.round(s * FPS);
const T = {
  hook: 0.1,
  consumir: 1.3,
  gelado: 1.96,
  corte1: 2.5,
  sensibilidade: 3.6,
  canal: 5.16,
  euVou: 5.7,
  acontece: 8.36,
  gelado2: 10.32,
  dor: 11.56,
  aguda: 12.02,
  tira: 14.63, // medido na forma de onda (Whisper marcava 14,40)
  para: 15.88,
  corteCanal: 16.6, // corte da Talyta: "Já a dor que pode indicar um canal"
  dorIntensa: 18.3,
  fimIntensa: 19.55,
  ePode: 19.92,
  coisas: 21.5,
  dorConsumir: 24.0,
  quente: 25.72,
  corte7: 26.5,
  ateGelado: 26.88,
  gelado3: 27.3,
  diminuir: 29.34,
  canalFim: 31.3,
  corteDiag: 31.73,
  diagnostico: 32.7,
  lupa: 34.0,
  corte10: 35.4,
  avaliado: 37.22,
  corteFinal: 38.43,
  procure: 39.85,
  tratamento: 43.14,
  fim: 45.0,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);
const ASSET = (n: string) => staticFile(`assets-odonto/${n}.png`);

const rostoEm = (f: number) => {
  const s = f / FPS;
  const seg = segmentos.find((x) => s >= x.de && s < x.ate) ?? segmentos[segmentos.length - 1];
  return seg.rosto;
};

// Punch-in só em frase importante; micro punch-out no fim (sai de 1.06 pra 1.0 perto do corte final).
const PUNCHES: Punch[] = [
  { de: 0, ate: F(0.2), escala: 1.08 }, // entrada
  { de: F(T.aguda), ate: F(13.4), escala: 1.1 }, // "dor mais aguda… intensa"
  { de: F(T.corteCanal), ate: F(T.fimIntensa), escala: 1.14 }, // "dor que pode indicar um canal": mais forte
  { de: F(T.corteDiag), ate: F(T.corte10), escala: 1.1 }, // diagnóstico: plano mais fechado
  { de: F(T.corteFinal), ate: F(44.6), escala: 1.06 }, // procure um profissional: close moderado
];

const Sfx: React.FC<{ em: number; nome: string; volume: number }> = ({ em, nome, volume }) => (
  <Sequence name={`SFX · ${nome}`} from={F(em)} durationInFrames={F(1)} layout="none">
    <Audio src={staticFile(`sfx/${nome}.wav`)} volume={volume} />
  </Sequence>
);

// Inserção de asset: entra com rotação Y + escala (profundidade), deriva devagar (parallax), sai suave.
// Sem giro contínuo, sem quique. Filhos ficam presos ao asset (pulso da dor, texto pequeno).
const Insert: React.FC<{
  src: string;
  x: number;
  y: number;
  lado: number;
  dur: number;
  rot?: [number, number];
  deslize?: number;
  children?: React.ReactNode;
}> = ({ src, x, y, lado, dur, rot = [24, 8], deslize = 0, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ perspective: 1100 }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: lado,
          height: lado,
          opacity: interpolate(frame, [0, 6, dur - 6, dur], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [0, 10, dur - 6, dur], [0.9, 1, 1, 0.96], { ...clamp, easing: SUAVE }),
          rotate: `y ${interpolate(frame, [0, 14], rot, { ...clamp, easing: SUAVE })}deg`,
          translate: `${interpolate(frame, [0, 12], [deslize, 0], { ...clamp, easing: SUAVE })}px ${interpolate(frame, [0, dur], [8, -8], clamp)}px`,
        }}
      >
        <Img src={src} style={{ width: "100%", height: "100%", filter: "drop-shadow(0 14px 20px rgba(0,0,0,0.3))" }} />
        {children}
      </div>
    </AbsoluteFill>
  );
};

// Pulso de dor (08) sobre a polpa. "forca" 0–1 vem da fala; o pulso respira, sem piscar.
const PulsoDor: React.FC<{ cx: number; cy: number; lado: number; forca: number; ritmo?: number }> = ({ cx, cy, lado, forca, ritmo = 9 }) => {
  const frame = useCurrentFrame();
  const r = 0.5 + 0.5 * Math.sin(frame / ritmo);
  return (
    <Img
      src={ASSET("08_alvo_de_dor_rosa")}
      style={{
        position: "absolute",
        left: cx - lado / 2,
        top: cy - lado / 2,
        width: lado,
        height: lado,
        opacity: forca * (0.78 + 0.22 * r),
        scale: 0.82 + 0.18 * r,
        filter: "saturate(1.15) drop-shadow(0 0 10px rgba(250,98,133,0.55))",
      }}
    />
  );
};

// Ar gelado (09) ou energia térmica (10) que se aproxima pela direita e pode se afastar ("tira").
const Estimulo: React.FC<{ src: string; x: number; y: number; lado: number; chega: number; sai?: number }> = ({ src, x, y, lado, chega, sai }) => {
  const frame = useCurrentFrame();
  const entra = interpolate(frame, [chega, chega + 14], [0, 1], { ...clamp, easing: SUAVE });
  const vai = sai === undefined ? 0 : interpolate(frame, [sai, sai + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <Img
      src={src}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: lado,
        height: lado,
        opacity: 0.92 * entra * (1 - vai),
        translate: `${(1 - entra) * 110 + vai * 190}px 0px`,
        rotate: `${interpolate(frame, [chega, chega + 60], [10, -4], clamp)}deg`,
      }}
    />
  );
};

// ---- Blocos ----

// 1 · "consumir algo gelado": 01 + 09
const BlocoGelado: React.FC<{ dur: number }> = ({ dur }) => (
  <>
    <Insert src={ASSET("01_molar_realista")} x={700} y={400} lado={360} dur={dur} rot={[30, 8]} />
    <Estimulo src={ASSET("09_vortice_ar_gelado")} x={850} y={390} lado={250} chega={F(T.gelado - T.consumir)} />
  </>
);

// 3–5 · sensibilidade: 02 em corte; frio chega em "gelado"; pulso em "dor"; "tira" → frio sai e a dor apaga
const BlocoSensibilidade: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const L = 380;
  const k = (s: number) => F(s - T.acontece);
  const dor = interpolate(frame, [k(T.dor), k(T.dor) + 4, k(T.tira), k(T.tira) + 10], [0, 1, 1, 0], clamp);
  return (
    <>
      <Insert src={ASSET("02_molar_corte_anatomico")} x={690} y={410} lado={L} dur={dur} rot={[26, 6]}>
        <PulsoDor cx={L * 0.537} cy={L * 0.47} lado={L * 0.36} forca={dor} ritmo={4} />
      </Insert>
      <Estimulo src={ASSET("09_vortice_ar_gelado")} x={860} y={400} lado={240} chega={k(T.gelado2)} sai={k(T.tira)} />
    </>
  );
};

// 6 · canal: 03 maior, brilho que não apaga
const BlocoCanal: React.FC<{ dur: number }> = ({ dur }) => {
  const L = 430;
  return (
    <Insert src={ASSET("03_molar_polpa_inflamada")} x={665} y={380} lado={L} dur={dur} rot={[20, 6]}>
      <PulsoDor cx={L * 0.564} cy={L * 0.486} lado={L * 0.46} forca={0.9} ritmo={14} />
    </Insert>
  );
};

// 8 · "algo quente": 03 + 10
const BlocoQuente: React.FC<{ dur: number }> = ({ dur }) => {
  const L = 380;
  return (
    <>
      <Insert src={ASSET("03_molar_polpa_inflamada")} x={690} y={410} lado={L} dur={dur} rot={[24, 6]}>
        <PulsoDor cx={L * 0.564} cy={L * 0.486} lado={L * 0.4} forca={0.55} ritmo={12} />
      </Insert>
      <Estimulo src={ASSET("10_espiral_energia_termica")} x={860} y={400} lado={240} chega={F(T.quente - T.dorConsumir) - 6} />
    </>
  );
};

// 9 · "o gelado pode ajudar a diminuir": 04 sozinho; o brilho da inflamação baixa em "diminuir"
const BlocoAlivio: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const L = 400;
  const k = F(T.diminuir - T.ateGelado);
  const brilho = interpolate(frame, [0, 8, k, k + 24], [0, 0.9, 0.9, 0.12], clamp);
  const texto = interpolate(frame, [k + 4, k + 10, dur - 8, dur - 4], [0, 1, 1, 0], clamp);
  return (
    <Insert src={ASSET("04_molar_efeito_refrescante")} x={680} y={395} lado={L} dur={dur} rot={[22, 6]}>
      <PulsoDor cx={L * 0.58} cy={L * 0.49} lado={L * 0.4} forca={brilho} ritmo={12} />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: L,
          top: L * 0.98,
          textAlign: "center",
          fontFamily: "Barlow Condensed",
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.16em",
          color: "#FFFFFF",
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          opacity: texto,
        }}
      >
        ALÍVIO MOMENTÂNEO
      </div>
    </Insert>
  );
};

const Bloco: React.FC<{ de: number; ate: number; nome: string; children: React.ReactNode }> = ({ de, ate, nome, children }) => (
  <Sequence name={nome} from={F(de)} durationInFrames={F(ate) - F(de)}>
    {children}
  </Sequence>
);
const d = (de: number, a: number) => F(a) - F(de);

export const SensibilidadeXCanal: React.FC<{ ate: number }> = ({ ate }) => {
  const [legendas, setLegendas] = useState<PalavraLegenda[] | null>(null);
  const { delayRender, continueRender } = useDelayRender();
  const [h] = useState(() => delayRender("legendas"));
  useEffect(() => {
    fetch(staticFile("reels/sxc/legendas.json"))
      .then((r) => r.json())
      .then((l: PalavraLegenda[]) => {
        setLegendas(l.filter((p) => p.startMs < ate * 1000));
        continueRender(h);
      });
  }, [ate, continueRender, h]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#140C10" }}>
      <VideoBase fonte="midia/sensibilidade-x-canal.mp4" rosto={rostoEm} punches={PUNCHES} />

      {/* 1 · HOOK */}
      <Bloco de={T.hook} ate={T.consumir} nome="Headline · SENSIBILIDADE OU CANAL?">
        <HeadlineClinica y={930} dur={d(T.hook, T.consumir)} linhas={[{ t: "SENSIBILIDADE" }, { t: "OU CANAL?", cor: "rosa" }]} />
      </Bloco>
      <Bloco de={T.consumir} ate={T.corte1 - 0.03} nome="01 molar + 09 ar gelado">
        <BlocoGelado dur={d(T.consumir, T.corte1 - 0.03)} />
      </Bloco>

      {/* 2 · comparação só com texto */}
      <Bloco de={T.sensibilidade} ate={T.euVou} nome="SENSIBILIDADE">
        <LadoComparacao texto="SENSIBILIDADE" x={48} y={400} alinhar="left" sai={d(T.sensibilidade, T.euVou) - 4} />
      </Bloco>
      <Bloco de={T.canal} ate={T.euVou} nome="OU CANAL?">
        <LadoComparacao texto="OU CANAL?" x={1032} y={400} alinhar="right" cor="rosa" sai={d(T.canal, T.euVou) - 4} />
      </Bloco>

      {/* 3–5 · sensibilidade: corte, frio, dor aguda, frio sai → dor para */}
      <Bloco de={T.acontece} ate={16.3} nome="02 corte + 09 frio + 08 pulso">
        <BlocoSensibilidade dur={d(T.acontece, 16.3)} />
      </Bloco>
      <Bloco de={T.aguda} ate={13.35} nome="Headline · DOR AGUDA">
        <HeadlineClinica y={960} dur={d(T.aguda, 13.35)} linhas={[{ t: "DOR" }, { t: "AGUDA", cor: "vermelho" }]} />
      </Bloco>

      {/* 6 · canal */}
      <Bloco de={T.corteCanal} ate={T.ePode - 0.05} nome="03 polpa inflamada">
        <BlocoCanal dur={d(T.corteCanal, T.ePode - 0.05)} />
      </Bloco>
      <Bloco de={T.dorIntensa} ate={T.fimIntensa} nome="Headline · DOR QUE CONTINUA">
        <HeadlineClinica y={960} dur={d(T.dorIntensa, T.fimIntensa)} linhas={[{ t: "DOR QUE" }, { t: "CONTINUA", cor: "vermelho" }]} />
      </Bloco>

      {/* 7 · outras coisas: insert rápido lateral */}
      <Bloco de={T.ePode} ate={T.coisas} nome="05 dor facial">
        <Insert src={ASSET("05_dor_facial_inflamacao_mandibula")} x={700} y={380} lado={350} dur={d(T.ePode, T.coisas)} rot={[16, 4]} deslize={60} />
      </Bloco>

      {/* 8 · quente */}
      <Bloco de={T.dorConsumir} ate={T.corte7 - 0.05} nome="03 + 10 energia térmica">
        <BlocoQuente dur={d(T.dorConsumir, T.corte7 - 0.05)} />
      </Bloco>

      {/* 9 · alívio momentâneo */}
      <Bloco de={T.ateGelado} ate={T.canalFim} nome="04 efeito refrescante">
        <BlocoAlivio dur={d(T.ateGelado, T.canalFim)} />
      </Bloco>

      {/* 10 · diagnóstico: tela limpa, depois a lupa */}
      <Bloco de={T.diagnostico} ate={T.lupa} nome="Headline · DIAGNÓSTICO">
        <HeadlineClinica y={1045} dur={d(T.diagnostico, T.lupa)} linhas={[{ t: "DIAGNÓSTICO", cor: "rosa" }]} />
      </Bloco>
      <Bloco de={T.lupa} ate={T.corte10 - 0.05} nome="07 anatomia com lupa">
        <Insert src={ASSET("07_dente_anatomia_com_lupa")} x={690} y={400} lado={370} dur={d(T.lupa, T.corte10 - 0.05)} rot={[22, 6]} />
      </Bloco>

      {/* 11 · avaliado com um dentista: instrumentos */}
      <Bloco de={T.avaliado} ate={T.corteFinal - 0.03} nome="06 instrumentos">
        <Insert src={ASSET("06_instrumentos_odontologicos")} x={650} y={360} lado={430} dur={d(T.avaliado, T.corteFinal - 0.03)} rot={[26, 8]} deslize={90} />
      </Bloco>

      {/* 12 · procure um dentista */}
      <Bloco de={T.procure} ate={41.5} nome="Headline · PROCURE UM DENTISTA">
        <HeadlineClinica y={1035} dur={d(T.procure, 41.5)} linhas={[{ t: "PROCURE UM" }, { t: "DENTISTA", cor: "rosa" }]} />
      </Bloco>

      {/* 13 · fechamento respira: só um detalhe pequeno */}
      <Bloco de={T.tratamento} ate={44.55} nome="01 detalhe final">
        <Insert src={ASSET("01_molar_realista")} x={830} y={360} lado={210} dur={d(T.tratamento, 44.55)} rot={[18, 8]} />
      </Bloco>

      {legendas ? <Legendas palavras={legendas} /> : null}

      {/* Sound design: só quando há ação visual; volumes baixos (medidos no render) */}
      <Sfx em={T.hook} nome="soft-hit" volume={0.12} />
      <Sfx em={T.gelado} nome="air-whoosh" volume={0.3} />
      <Sfx em={T.sensibilidade} nome="ui-click" volume={0.2} />
      <Sfx em={T.canal} nome="ui-click" volume={0.2} />
      <Sfx em={T.gelado2} nome="air-whoosh" volume={0.24} />
      <Sfx em={T.dor} nome="tonal-sting" volume={0.2} />
      <Sfx em={T.tira} nome="tonal-release" volume={0.18} />
      <Sfx em={T.corteCanal} nome="low-pulse" volume={0.3} />
      <Sfx em={T.quente - 0.2} nome="air-whoosh" volume={0.2} />
      <Sfx em={T.diagnostico} nome="low-impact" volume={0.28} />
      <Sfx em={T.avaliado} nome="metal-tick" volume={0.3} />
      <Sfx em={T.procure} nome="soft-hit" volume={0.12} />
    </AbsoluteFill>
  );
};

export const SXC_DURACAO = F(T.fim);
export const SXC_ABERTURA = F(7.43) - 1;
