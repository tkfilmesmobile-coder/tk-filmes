import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useDelayRender } from "remotion";
import { Audio, Video } from "@remotion/media";
import { useEffect, useState } from "react";
import { loadFont } from "@remotion/google-fonts/BarlowCondensed";
import { Legendas, LEGENDA_V3 } from "../Legendas";
import type { PalavraLegenda } from "../tipos";
import segmentos from "./segmentos_0930.json";
import track from "./rosto_track_0930.json";

// "Fazer canal dói?" (0930.mp4, corte da Talyta) · mesmo tratamento aprovado no "Sensibilidade x Canal"
// (2026-09-30): reenquadramento posição + escala, objetos rastreados no espaço negativo sem cobrir o rosto,
// lettering cinético, legenda V3 escondida durante headline, trilha PROVISÓRIA + sound design discreto.
// Tempos em segundos do corte, medidos no áudio (scripts/cache/0930.*). A fala não é tocada.
const { fontFamily: BARLOW } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin", "latin-ext"] });
const FPS = 30;
const F = (s: number) => Math.round(s * FPS);
const ROSA = "#FF86A6";
const VERMELHO = "#FF5A5F";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.25, 0.1, 0.25, 1);

const rosto = (f: number) => {
  const s = f / FPS;
  return (segmentos.find((x) => s >= x.de && s < x.ate) ?? segmentos[segmentos.length - 1]).rosto;
};


// ---- Câmera virtual ----
// [segundo, escala, deslocamento X, blur]. Faixas: base 1,00–1,04 · ênfase 1,09–1,15 · close ≤1,30.
type K = [number, number, number, number];
const CAMERA: K[] = [
  [0, 1.0, 0, 0],
  [1.9, 1.0, 0, 0], [2.3, 1.09, -45, 0], // "será que fazer canal dói?": espaço à direita pro molar
  [4.52, 1.09, -45, 0], [4.56, 1.09, -45, 5], [4.64, 1.02, 0, 5], [4.7, 1.02, 0, 0], // match cut no corte da Talyta
  [5.95, 1.02, 0, 0], [6.3, 1.09, -45, 0], // "consultório": instrumentos à direita
  [7.72, 1.09, -45, 0], [8.05, 1.12, 0, 0], // "queixa de dor muito forte": ênfase, tela limpa
  [9.36, 1.12, 0, 0], [9.4, 1.12, 0, 5], [9.47, 1.02, 0, 5], [9.53, 1.02, 0, 0], // corte da Talyta
  [9.6, 1.02, 0, 0], [9.95, 1.09, -45, 0], // "tratamento do canal": molar em corte à direita
  [11.5, 1.09, -45, 0], [11.85, 1.02, 0, 0], // "fique tranquilo": tela limpa
  [13.7, 1.02, 0, 0], [14.0, 1.06, 0, 0], // "anestesia": ênfase leve
  [14.7, 1.06, 0, 0], [14.74, 1.06, 0, 5], [14.8, 1.02, 0, 5], [14.87, 1.02, 0, 0], // match cut
  [15.4, 1.02, 0, 0], [15.62, 1.12, 0, 0], // "fazer canal não dói": punch
  [16.9, 1.12, 0, 0], [17.25, 1.02, 0, 0],
  [18.2, 1.02, 0, 0], [18.55, 1.09, -45, 0], // cuidado → tecnologia: espaço à direita
  [23.8, 1.09, -45, 0], [23.95, 1.04, 0, 0], [24.2, 1.04, 0, 0], // micro punch-out no fecho
];

const camera = (frame: number) => {
  const fs = CAMERA.map((k) => F(k[0]));
  return {
    s: interpolate(frame, fs, CAMERA.map((k) => k[1]), { ...clamp, easing: SUAVE }),
    x: interpolate(frame, fs, CAMERA.map((k) => k[2]), { ...clamp, easing: SUAVE }),
    blur: interpolate(frame, fs, CAMERA.map((k) => k[3]), clamp),
  };
};

// Rosto NA TELA em cada quadro: tracking do corte (rosto_track.json, todos os quadros, suavizado)
// passado pela câmera virtual. É a âncora do tracking dos objetos e letterings.
const rostoTela = (frame: number) => {
  const f = Math.max(0, Math.min(track.length - 1, Math.round(frame)));
  const [tx, ty, tw] = track[f];
  const r = rosto(f);
  const c = camera(f);
  return { x: r.x + (tx - r.x) * c.s + c.x, y: r.y + (ty - r.y) * c.s, w: tw * c.s };
};

// Tracking: a camada acompanha o movimento da cena (cabeça, zooms da Talyta e câmera virtual),
// mantendo a posição relativa ao rosto do início do bloco. forca 1 = preso à cena; 0,4 = parallax.
// alvo: centro e meia-largura do objeto na tela. Com alvo, o objeto cresce em torno do PRÓPRIO centro,
// segue o deslocamento da cena e nunca passa da margem segura da borda (40 px).
type Alvo = { x: number; y: number; r: number };
const Rastreio: React.FC<{ de: number; forca: number; alvo?: Alvo; children: React.ReactNode }> = ({ de, forca, alvo, children }) => {
  const frame = useCurrentFrame();
  const g0 = F(de);
  const ref = rostoTela(g0 + 1);
  const agora = rostoTela(g0 + frame);
  const k = 1 + (Math.pow(agora.w / ref.w, 0.85) - 1) * forca;
  let dx = (agora.x - ref.x) * forca;
  let dy = (agora.y - ref.y) * forca;
  let origem = `${ref.x}px ${ref.y}px`;
  let escala = k;
  if (alvo) {
    // o objeto também se afasta do rosto na proporção do zoom (mantém a relação)
    const cx = alvo.x + dx + (alvo.x - ref.x) * (k - 1) * 0.5;
    const cy = alvo.y + dy + (alvo.y - ref.y) * (k - 1) * 0.5;
    // segurança: nunca entra no rosto (olhos/boca) nem passa da borda; se não couber, diminui
    const minX = agora.x + agora.w * 0.62 + 16;
    const maxX = 1080 - 40;
    const cabe = (maxX - minX) / (2 * alvo.r);
    escala = Math.max(0.6, Math.min(k, cabe));
    const meia = alvo.r * escala;
    const cxOk = Math.min(maxX - meia, Math.max(minX + meia, cx));
    const cyOk = Math.min(1500 - meia, Math.max(120 + meia, cy));
    dx = cxOk - alvo.x;
    dy = cyOk - alvo.y;
    origem = `${alvo.x}px ${alvo.y}px`;
  }
  return <AbsoluteFill style={{ transformOrigin: origem, translate: `${dx}px ${dy}px`, scale: escala }}>{children}</AbsoluteFill>;
};

const Cena: React.FC = () => {
  const frame = useCurrentFrame();
  const { s, x, blur } = camera(frame);
  const r = rosto(frame);
  const mascara = `radial-gradient(ellipse ${r.w * 1.35}px ${r.w * 1.7}px at ${r.x + x}px ${r.y + r.w * 0.2}px, transparent 55%, black 100%)`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="grade-0930" colorInterpolationFilters="sRGB">
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
        src={staticFile("midia/0930.mp4")}
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: `${r.x}px ${r.y}px`,
          scale: s,
          translate: `${x}px 0px`,
          filter: `url(#grade-0930)${blur > 0.2 ? ` blur(${blur}px)` : ""}`,
        }}
      />
      <AbsoluteFill style={{ backdropFilter: "saturate(0.86)", maskImage: mascara, WebkitMaskImage: mascara }} />
    </AbsoluteFill>
  );
};

// ---- Objeto animado (WebM com alfa) como hero, no espaço aberto à direita ----
type Bbox = { x0: number; x1: number; y0: number; y1: number };
// Substituto enquanto a animação não foi gerada: o PNG aprovado com o mesmo tratamento de hero.
// bbox dos PNGs (1254²) medida no pacote de assets.
const PNG: Record<string, { arq: string; bbox: Bbox }> = {
  m4: { arq: "03_molar_polpa_inflamada", bbox: { x0: 242, x1: 1038, y0: 25, y1: 1198 } },
  m8: { arq: "06_instrumentos_odontologicos", bbox: { x0: 19, x1: 1220, y0: 40, y1: 1217 } },
  m2: { arq: "02_molar_corte_anatomico", bbox: { x0: 246, x1: 1046, y0: 49, y1: 1200 } },
  m7: { arq: "07_dente_anatomia_com_lupa", bbox: { x0: 194, x1: 1253, y0: 72, y1: 1185 } },
  m9: { arq: "01_molar_realista", bbox: { x0: 228, x1: 1074, y0: 40, y1: 1209 } },
};
const ObjetoPng: React.FC<{ nome: string; largura: number; cx: number; cy: number; dur: number; dor?: [number, number] }> = ({ nome, largura, cx, cy, dur, dor }) => {
  const frame = useCurrentFrame();
  const e = { ...clamp, easing: SUAVE };
  const { arq, bbox } = PNG[nome];
  const esc = largura / (bbox.x1 - bbox.x0);
  const lado = 1254 * esc;
  const forca = dor ? interpolate(frame, [dor[0], dor[0] + 4, dor[1], dor[1] + 10], [0, 1, 1, 0], clamp) : 0;
  const r = 0.5 + 0.5 * Math.sin(frame / 4);
  return (
    <AbsoluteFill style={{ perspective: 1200 }}>
      <div
        style={{
          position: "absolute",
          left: cx - ((bbox.x0 + bbox.x1) / 2) * esc,
          top: cy - ((bbox.y0 + bbox.y1) / 2) * esc,
          width: lado,
          height: lado,
          opacity: interpolate(frame, [0, 9, dur - 4, dur], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [0, 9], [0.92, 1], e) * (1 + 0.015 * (frame / dur)),
          translate: `0px ${interpolate(frame, [0, 9], [20, 0], e) + 3 * Math.sin(frame / 17)}px`,
          rotate: `y ${interpolate(frame, [0, 9], [-6, 0], e) + 2 * Math.sin(frame / 22)}deg`,
          filter: "drop-shadow(16px 26px 26px rgba(40,22,12,0.28)) drop-shadow(0 0 18px rgba(255,238,224,0.18))",
        }}
      >
        <Img src={staticFile(`assets-odonto/${arq}.png`)} style={{ width: "100%", height: "100%" }} />
        {dor ? (
          <Img
            src={staticFile("assets-odonto/08_alvo_de_dor_rosa.png")}
            style={{
              position: "absolute",
              left: lado * 0.537 - lado * 0.18,
              top: lado * 0.47 - lado * 0.18,
              width: lado * 0.36,
              height: lado * 0.36,
              opacity: forca * (0.78 + 0.22 * r),
              scale: 0.82 + 0.18 * r,
              filter: "drop-shadow(0 0 10px rgba(250,98,133,0.55))",
            }}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// Lettering cinético: cada linha é revelada por máscara (sobe de dentro de uma janela), com o espaçamento
// entre letras fechando e desfoque de movimento na entrada; enquanto está na tela, cresce devagar (1→1,035);
// sai subindo com desfoque. Linhas escalonadas em 4 quadros. Sem quique.
type Linha = { t: string; cor?: "rosa" | "vermelho"; tamanho?: number };
const LinhaCinetica: React.FC<{ l: Linha; at: number; dur: number; tamanho: number; alinhar?: "center" | "left" }> = ({ l, at, dur, tamanho, alinhar = "center" }) => {
  const frame = useCurrentFrame();
  const e = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };
  const entra = interpolate(frame, [at, at + 9], [0, 1], e);
  const sai = interpolate(frame, [dur - 6, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const t = l.tamanho ?? tamanho;
  return (
    <div style={{ overflow: "hidden", paddingTop: t * 0.06, paddingBottom: t * 0.04, textAlign: alinhar }}>
      <div
        style={{
          fontFamily: BARLOW,
          fontWeight: 700,
          fontSize: t,
          lineHeight: 0.92,
          color: l.cor === "rosa" ? ROSA : l.cor === "vermelho" ? VERMELHO : "#FFFFFF",
          textShadow: "0 2px 10px rgba(0,0,0,0.22)",
          translate: `0px ${(1 - entra) * t * 0.95 - sai * 26}px`,
          letterSpacing: `${0.1 * (1 - entra) - 0.005}em`,
          filter: `blur(${(1 - entra) * 5 + sai * 6}px)`,
          opacity: Math.min(1, entra * 1.4) * (1 - sai),
        }}
      >
        {l.t}
      </div>
    </div>
  );
};

const Headline: React.FC<{ linhas: Linha[]; dur: number; y: number; tamanho?: number }> = ({ linhas, dur, y, tamanho = 118 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: y, width: "100%", scale: interpolate(frame, [0, dur], [1, 1.035], clamp) }}>
        {linhas.map((l, i) => (
          <LinhaCinetica key={i} l={l} at={i * 4} dur={dur} tamanho={tamanho} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ em: number; nome: string; volume: number }> = ({ em, nome, volume }) => (
  <Sequence name={`SFX · ${nome}`} from={F(em)} durationInFrames={F(1)} layout="none">
    <Audio src={staticFile(`sfx/${nome}.wav`)} volume={volume} />
  </Sequence>
);

const B: React.FC<{ de: number; ate: number; nome: string; rastreio?: number; alvo?: Alvo; children: React.ReactNode }> = ({
  de,
  ate,
  nome,
  rastreio = 1,
  alvo,
  children,
}) => (
  <Sequence name={nome} from={F(de)} durationInFrames={F(ate) - F(de)}>
    <Rastreio de={de} forca={rastreio} alvo={alvo}>
      {children}
    </Rastreio>
  </Sequence>
);
const d = (de: number, a: number) => F(a) - F(de);

export const CANAL_DOI_DURACAO = F(24.2);
export const CANAL_DOI_PREVIA = F(9.4); // termina depois de "dor muito forte." (fala acaba 9,18 s; corte 9,43 s)

// Janelas de headline (ms): legenda sai da tela
const HEADLINES: [number, number][] = [
  [100, 1800],
  [8250, 9430],
  [13900, 14770],
  [15550, 16900],
];

export const CanalDoi: React.FC<{ fim?: number }> = ({ fim = CANAL_DOI_DURACAO }) => {
  const [legendas, setLegendas] = useState<PalavraLegenda[] | null>(null);
  const { delayRender, continueRender } = useDelayRender();
  const [h] = useState(() => delayRender("legendas"));
  useEffect(() => {
    fetch(staticFile("reels/0930/legendas.json"))
      .then((r) => r.json())
      .then((l: PalavraLegenda[]) => {
        setLegendas(l);
        continueRender(h);
      });
  }, [continueRender, h]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#140C10" }}>
      <Cena />

      {/* 1 · hook: "morre de medo de fazer canal" */}
      <B de={0.1} ate={1.8} nome="Hook · MEDO DE / FAZER CANAL?" rastreio={0.4}>
        <Headline y={1000} dur={d(0.1, 1.8)} tamanho={124} linhas={[{ t: "MEDO DE" }, { t: "FAZER CANAL?", cor: "rosa" }]} />
      </B>

      {/* 2 · "será que fazer canal dói?": molar inflamado, o alvo de dor pulsa em "dói" */}
      <B de={2.3} ate={4.56} nome="Molar inflamado · dói?" alvo={{ x: 858, y: 580, r: 190 }}>
        <ObjetoPng nome="m4" largura={360} cx={858} cy={580} dur={d(2.3, 4.56)} dor={[F(3.98) - F(2.3), F(4.4) - F(2.3)]} />
      </B>

      {/* 3 · "aqui no consultório": instrumentos */}
      <B de={6.2} ate={7.75} nome="Instrumentos · consultório" alvo={{ x: 860, y: 600, r: 200 }}>
        <ObjetoPng nome="m8" largura={390} cx={860} cy={600} dur={d(6.2, 7.75)} />
      </B>

      {/* 4 · "queixa de dor muito forte" */}
      <B de={8.25} ate={9.43} nome="Headline · DOR MUITO FORTE" rastreio={0.4}>
        <Headline y={1040} dur={d(8.25, 9.43)} linhas={[{ t: "DOR" }, { t: "MUITO FORTE", cor: "vermelho" }]} />
      </B>

      {/* 5 · "o tratamento do canal é um pouco mais complexo": molar em corte (os canais à mostra) */}
      <B de={9.7} ate={11.6} nome="Molar em corte · complexo" alvo={{ x: 870, y: 560, r: 160 }}>
        <ObjetoPng nome="m2" largura={300} cx={870} cy={560} dur={d(9.7, 11.6)} />
      </B>

      {/* 6 · "feito todo com anestesia" */}
      <B de={13.9} ate={14.77} nome="Headline · COM ANESTESIA" rastreio={0.4}>
        <Headline y={1040} dur={d(13.9, 14.77)} linhas={[{ t: "TODO COM" }, { t: "ANESTESIA", cor: "rosa" }]} />
      </B>

      {/* 7 · "fazer canal não dói" */}
      <B de={15.55} ate={16.9} nome="Headline · NÃO DÓI" rastreio={0.4}>
        <Headline y={1040} dur={d(15.55, 16.9)} tamanho={124} linhas={[{ t: "FAZER CANAL" }, { t: "NÃO DÓI", cor: "rosa" }]} />
      </B>

      {/* 8 · "feito com muito cuidado e carinho": molar saudável */}
      <B de={18.6} ate={21.7} nome="Molar saudável · cuidado" alvo={{ x: 870, y: 560, r: 150 }}>
        <ObjetoPng nome="m9" largura={280} cx={870} cy={560} dur={d(18.6, 21.7)} />
      </B>

      {/* 9 · "tecnologias muito modernas": lupa */}
      <B de={21.86} ate={23.85} nome="Lupa · tecnologia" alvo={{ x: 860, y: 560, r: 170 }}>
        <ObjetoPng nome="m7" largura={330} cx={860} cy={560} dur={d(21.86, 23.85)} />
      </B>

      {legendas ? <Legendas palavras={legendas} estilo={LEGENDA_V3} ocultar={HEADLINES} /> : null}

      {/* trilha (provisória, com ducking na voz deste vídeo); na prévia, some nos últimos 0,3 s */}
      <Audio src={staticFile("trilha/provisoria_0930.wav")} volume={(f) => interpolate(f, [fim - 9, fim], [1, 0], clamp)} />
      <Sfx em={0.1} nome="soft-hit" volume={0.1} />
      <Sfx em={2.3} nome="low-impact" volume={0.1} />
      <Sfx em={3.98} nome="tonal-sting" volume={0.14} />
      <Sfx em={4.52} nome="micro-whoosh" volume={0.14} />
      <Sfx em={6.2} nome="metal-tick" volume={0.2} />
      <Sfx em={7.72} nome="micro-whoosh" volume={0.1} />
      <Sfx em={8.25} nome="low-pulse" volume={0.2} />
      <Sfx em={9.36} nome="micro-whoosh" volume={0.1} />
      <Sfx em={9.7} nome="soft-hit" volume={0.08} />
      <Sfx em={13.9} nome="tonal-release" volume={0.12} />
      <Sfx em={14.7} nome="micro-whoosh" volume={0.12} />
      <Sfx em={15.55} nome="low-impact" volume={0.14} />
      <Sfx em={16.48} nome="tonal-tick" volume={0.12} />
      <Sfx em={18.6} nome="air-whoosh" volume={0.12} />
      <Sfx em={21.86} nome="ping" volume={0.12} />
      <Sfx em={23.8} nome="micro-whoosh" volume={0.1} />
    </AbsoluteFill>
  );
};
