import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useDelayRender } from "remotion";
import { Audio, Video } from "@remotion/media";
import { useEffect, useState } from "react";
import { loadFont } from "@remotion/google-fonts/BarlowCondensed";
import { Legendas, LEGENDA_V3 } from "../Legendas";
import type { PalavraLegenda } from "../tipos";
import segmentos from "./segmentos.json";
import track from "./rosto_track.json";

// "Sensibilidade x Canal" · vídeo completo no padrão da abertura aprovada (2026-09-30):
// cena como composição (reenquadramento real posição + escala), animações geradas no Wan 2.2 e recortadas
// com alfa (public/motion/*.webm), headlines escalonadas, legenda V3 escondida durante headline,
// trilha PROVISÓRIA + sound design discreto. Tempos em segundos do corte da Talyta, medidos no áudio.
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
// X −45 com escala ≥1,09 abre espaço à direita sem mostrar borda (origem no rosto).
type K = [number, number, number, number];
const CAMERA: K[] = [
  [0, 1.0, 0, 0],
  [1.2, 1.0, 0, 0], [1.57, 1.09, -45, 0], // M1
  [2.4, 1.09, -45, 0], [2.47, 1.09, -45, 5], [2.5, 1.12, 0, 5], [2.57, 1.12, 0, 0], // match cut
  [5.7, 1.12, 0, 0], [6.03, 1.02, 0, 0], // "vou te explicar": mais aberto
  [8.1, 1.02, 0, 0], [8.43, 1.1, -45, 0], // M2/M3: espaço à direita
  [12.0, 1.1, -45, 0], [12.17, 1.14, -45, 0], // "mais aguda": ênfase
  [13.4, 1.14, -45, 0], [13.57, 1.1, -45, 0],
  [16.5, 1.1, -45, 0], [16.6, 1.1, -45, 0], // corte: o push-in da Talyta já faz a ênfase (1,15 cobria o rosto)
  [19.9, 1.1, -45, 0], [20.1, 1.1, -45, 0], // 05 insert rápido
  [21.5, 1.1, -45, 0], [21.85, 1.02, 0, 0], // limpa: "cárie grande"
  [23.9, 1.02, 0, 0], [24.25, 1.1, -45, 0], // M5 quente
  [31.3, 1.1, -45, 0], [31.66, 1.1, -45, 4], [31.73, 1.12, 0, 4], [31.8, 1.12, 0, 0], // diagnóstico: limpa, mais fechado
  [34.0, 1.12, 0, 0], [34.3, 1.12, -45, 0], // M7 lupa
  [35.35, 1.12, -45, 0], [35.4, 1.03, 0, 0], // corte
  [36.9, 1.03, 0, 0], [37.2, 1.1, -45, 0], // M8 instrumentos
  [38.36, 1.1, -45, 0], [38.43, 1.12, 0, 0], // "procure um profissional": close moderado
  [44.55, 1.12, 0, 0], [44.6, 1.05, 0, 0], [45.0, 1.05, 0, 0], // micro punch-out + corte seco
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
        <filter id="grade-completo" colorInterpolationFilters="sRGB">
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
          filter: `url(#grade-completo)${blur > 0.2 ? ` blur(${blur}px)` : ""}`,
        }}
      />
      <AbsoluteFill style={{ backdropFilter: "saturate(0.86)", maskImage: mascara, WebkitMaskImage: mascara }} />
    </AbsoluteFill>
  );
};

// ---- Objeto animado (WebM com alfa) como hero, no espaço aberto à direita ----
// bbox: onde o objeto está no 1º quadro do clipe (960×1664); o componente escala pra "largura" e centra em (cx, cy).
type Bbox = { x0: number; x1: number; y0: number; y1: number };
const MotionObjeto: React.FC<{ src: string; bbox: Bbox; largura: number; cx: number; cy: number; dur: number; inicio?: number }> = ({
  src,
  bbox,
  largura,
  cx,
  cy,
  dur,
  inicio = 0,
}) => {
  const frame = useCurrentFrame();
  const e = { ...clamp, easing: SUAVE };
  const esc = largura / (bbox.x1 - bbox.x0);
  const ox = (bbox.x0 + bbox.x1) / 2;
  const oy = (bbox.y0 + bbox.y1) / 2;
  return (
    <AbsoluteFill style={{ perspective: 1200 }}>
      <div
        style={{
          position: "absolute",
          left: cx - ox * esc,
          top: cy - oy * esc,
          width: 960 * esc,
          height: 1664 * esc,
          opacity: interpolate(frame, [0, 9, dur - 4, dur], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [0, 9], [0.92, 1], e),
          translate: `0px ${interpolate(frame, [0, 9], [20, 0], e) + 3 * Math.sin(frame / 17)}px`,
          rotate: `y ${interpolate(frame, [0, 9], [-6, 0], e)}deg`,
          filter: "drop-shadow(16px 26px 26px rgba(40,22,12,0.28)) drop-shadow(0 0 18px rgba(255,238,224,0.18))",
        }}
      >
        <OffthreadVideo src={staticFile(src)} transparent muted trimBefore={inicio} style={{ width: "100%", height: "100%" }} />
      </div>
    </AbsoluteFill>
  );
};

// Substituto enquanto a animação não foi gerada: o PNG aprovado com o mesmo tratamento de hero.
// bbox dos PNGs (1254²) medida no pacote de assets.
const PNG: Record<string, { arq: string; bbox: Bbox }> = {
  m2: { arq: "02_molar_corte_anatomico", bbox: { x0: 246, x1: 1046, y0: 49, y1: 1200 } },
  m3: { arq: "02_molar_corte_anatomico", bbox: { x0: 246, x1: 1046, y0: 49, y1: 1200 } },
  m4: { arq: "03_molar_polpa_inflamada", bbox: { x0: 242, x1: 1038, y0: 25, y1: 1198 } },
  m6: { arq: "04_molar_efeito_refrescante", bbox: { x0: 206, x1: 1034, y0: 55, y1: 1206 } },
  m7: { arq: "07_dente_anatomia_com_lupa", bbox: { x0: 194, x1: 1253, y0: 72, y1: 1185 } },
  m8: { arq: "06_instrumentos_odontologicos", bbox: { x0: 19, x1: 1220, y0: 40, y1: 1217 } },
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

// Inserto estático (05, rosto): entra lateral, micro-movimento, sai rápido.
const InsertoRapido: React.FC<{ src: string; x: number; y: number; lado: number; dur: number }> = ({ src, x, y, lado, dur }) => {
  const frame = useCurrentFrame();
  const e = { ...clamp, easing: SUAVE };
  return (
    <AbsoluteFill style={{ perspective: 1200 }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: lado,
          height: lado,
          opacity: interpolate(frame, [0, 8, dur - 5, dur], [0, 1, 1, 0], clamp),
          scale: interpolate(frame, [0, 9], [0.92, 1], e) * (1 + 0.015 * (frame / dur)),
          translate: `${interpolate(frame, [0, 10], [40, 0], e)}px ${2 * Math.sin(frame / 15)}px`,
          rotate: `y ${interpolate(frame, [0, 10], [-6, 0], e) + 1.5 * Math.sin(frame / 25)}deg`,
          filter: "drop-shadow(14px 22px 24px rgba(40,22,12,0.28))",
        }}
      />
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

// SENSIBILIDADE × CANAL? cinético: SENSIBILIDADE revela por máscara; em "canal" sobe e recua, o fio rosa
// se desenha e CANAL? revela maior, em rosa. Tudo cresce devagar e sai com desfoque.
const ComparacaoCinetica: React.FC<{ dur: number; canalEm: number }> = ({ dur, canalEm }) => {
  const frame = useCurrentFrame();
  const e = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };
  const sobe = interpolate(frame, [canalEm, canalEm + 9], [0, -30], e);
  const recua = interpolate(frame, [canalEm, canalEm + 9], [1, 0.84], e);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 64, top: 868, scale: interpolate(frame, [0, dur], [1, 1.035], clamp), transformOrigin: "left top" }}>
        <div style={{ translate: `0px ${sobe}px`, opacity: recua }}>
          <LinhaCinetica l={{ t: "SENSIBILIDADE" }} at={0} dur={dur} tamanho={92} alinhar="left" />
        </div>
        <div
          style={{
            width: 150,
            height: 4,
            borderRadius: 2,
            background: ROSA,
            margin: "6px 0 4px",
            scale: `${interpolate(frame, [5, 14], [0, 1], e) * interpolate(frame, [dur - 6, dur], [1, 0], clamp)} 1`,
            transformOrigin: "left center",
            translate: `0px ${sobe}px`,
            boxShadow: "0 0 10px rgba(255,134,166,0.45)",
          }}
        />
        <div style={{ translate: `0px ${sobe}px` }}>
          <LinhaCinetica l={{ t: "CANAL?", cor: "rosa" }} at={canalEm} dur={dur} tamanho={128} alinhar="left" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Hook cinético: SENSIBILIDADE e, 4 quadros depois, OU CANAL? (rosa).
const HookCinetico: React.FC<{ dur: number }> = ({ dur }) => (
  <Headline y={870} dur={dur} tamanho={124} linhas={[{ t: "SENSIBILIDADE" }, { t: "OU CANAL?", cor: "rosa" }]} />
);

// Rótulo pequeno (ALÍVIO MOMENTÂNEO): discreto, sob o objeto.
const Rotulo: React.FC<{ texto: string; x: number; y: number; dur: number }> = ({ texto, x, y, dur }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x - 250,
        width: 500,
        top: y,
        textAlign: "center",
        fontFamily: BARLOW,
        fontWeight: 600,
        fontSize: 32,
        color: "#FFFFFF",
        textShadow: "0 1px 8px rgba(0,0,0,0.4)",
        opacity: interpolate(frame, [0, 6, dur - 4, dur], [0, 1, 1, 0], clamp),
        translate: interpolate(frame, [0, 7], ["0px 10px", "0px 0px"], { ...clamp, easing: SUAVE }),
        letterSpacing: `${interpolate(frame, [0, 12], [0.4, 0.16], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}em`,
        filter: `blur(${interpolate(frame, [0, 6], [4, 0], clamp)}px)`,
      }}
    >
      {texto}
      <div style={{ width: 70, height: 3, borderRadius: 2, background: ROSA, margin: "10px auto 0", boxShadow: "0 0 8px rgba(255,134,166,0.4)" }} />
    </div>
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

// Posições dos objetos: centro (858, 580) no espaço aberto à direita; largura do objeto na tela.
const HERO = { cx: 858, cy: 580 };

export type Posicoes = Record<string, Bbox>;
export const COMPLETO_DURACAO = F(45.0);

// Janelas de headline (ms): legenda sai da tela
const HEADLINES: [number, number][] = [
  [100, 1200],
  [3600, 5700],
  [12020, 13350],
  [18300, 19550],
  [32700, 34000],
  [39850, 41500],
];

export const Completo: React.FC<{ posicoes: Posicoes }> = ({ posicoes }) => {
  const [legendas, setLegendas] = useState<PalavraLegenda[] | null>(null);
  const { delayRender, continueRender } = useDelayRender();
  const [h] = useState(() => delayRender("legendas"));
  useEffect(() => {
    fetch(staticFile("reels/sxc/legendas.json"))
      .then((r) => r.json())
      .then((l: PalavraLegenda[]) => {
        setLegendas(l);
        continueRender(h);
      });
  }, [continueRender, h]);
  const P = (n: string) => posicoes[n] ?? { x0: 272, x1: 739, y0: 449, y1: 1095 };

  return (
    <AbsoluteFill style={{ backgroundColor: "#140C10" }}>
      <Cena />

      {/* 1 · hook + M1 */}
      <B de={0.1} ate={1.2} nome="Hook · SENSIBILIDADE / OU CANAL?" rastreio={0.4}>
        <HookCinetico dur={d(0.1, 1.2)} />
      </B>
      <B de={1.33} ate={2.5} nome="M1 · molar + ar gelado" alvo={{ x: 858, y: 580, r: 175 }}>
        <MotionObjeto src="motion/m1_alfa.webm" bbox={P("m1")} largura={330} {...HERO} dur={d(1.33, 2.5)} />
      </B>

      {/* 2 · SENSIBILIDADE × CANAL? */}
      <B de={3.6} ate={5.7} nome="SENSIBILIDADE × CANAL?" rastreio={0.4}>
        <ComparacaoCinetica dur={d(3.6, 5.7)} canalEm={F(5.16) - F(3.6)} />
      </B>

      {/* 3–5 · sensibilidade: M2 (frio chega) → M3 (dor aguda, frio sai, dor para) */}
      <B de={8.36} ate={11.5} nome="M2 · corte + frio" alvo={{ x: 858, y: 580, r: 180 }}>
        {posicoes["m2"] ? (
          <MotionObjeto src="motion/m2_alfa.webm" bbox={P("m2")} largura={340} {...HERO} dur={d(8.36, 11.5)} />
        ) : (
          <ObjetoPng nome="m2" largura={340} {...HERO} dur={d(8.36, 11.5)} />
        )}
      </B>
      <B de={11.5} ate={16.3} nome="M3 · dor aguda → frio sai → dor para" alvo={{ x: 858, y: 580, r: 180 }}>
        {posicoes["m3"] ? (
          <MotionObjeto src="motion/m3_alfa.webm" bbox={P("m3")} largura={340} {...HERO} dur={d(11.5, 16.3)} />
        ) : (
          <ObjetoPng nome="m3" largura={340} {...HERO} dur={d(11.5, 16.3)} dor={[F(11.56) - F(11.5), F(14.63) - F(11.5)]} />
        )}
      </B>
      <B de={12.02} ate={13.35} nome="Headline · DOR AGUDA" rastreio={0.4}>
        <Headline y={1010} dur={d(12.02, 13.35)} linhas={[{ t: "DOR" }, { t: "AGUDA", cor: "vermelho" }]} />
      </B>

      {/* 6 · canal: M4 (inflamação que continua) */}
      <B de={16.6} ate={19.9} nome="M4 · inflamação persistente" alvo={{ x: 850, y: 590, r: 200 }}>
        {posicoes["m4"] ? (
          <MotionObjeto src="motion/m4_alfa.webm" bbox={P("m4")} largura={380} cx={850} cy={590} dur={d(16.6, 19.9)} />
        ) : (
          <ObjetoPng nome="m4" largura={380} cx={850} cy={590} dur={d(16.6, 19.9)} />
        )}
      </B>
      <B de={18.3} ate={19.55} nome="Headline · DOR QUE CONTINUA" rastreio={0.4}>
        <Headline y={1010} dur={d(18.3, 19.55)} linhas={[{ t: "DOR QUE" }, { t: "CONTINUA", cor: "vermelho" }]} />
      </B>

      {/* 7 · outras coisas: 05 rápido */}
      <B de={19.92} ate={21.45} nome="05 · dor facial (rápido)" alvo={{ x: 860, y: 560, r: 200 }}>
        <InsertoRapido src="assets-odonto/05_dor_facial_inflamacao_mandibula.png" x={660} y={360} lado={400} dur={d(19.92, 21.45)} />
      </B>

      {/* 8 · quente: M5 */}
      <B de={24.0} ate={26.45} nome="M5 · energia térmica" alvo={{ x: 858, y: 580, r: 180 }}>
        <MotionObjeto src="motion/m5_alfa.webm" bbox={P("m5")} largura={340} {...HERO} dur={d(24.0, 26.45)} />
      </B>

      {/* 9 · alívio: M6 */}
      <B de={26.88} ate={31.3} nome="M6 · frio reduz a inflamação" alvo={{ x: 858, y: 580, r: 180 }}>
        {posicoes["m6"] ? (
          <MotionObjeto src="motion/m6_alfa.webm" bbox={P("m6")} largura={340} {...HERO} dur={d(26.88, 31.3)} />
        ) : (
          <ObjetoPng nome="m6" largura={340} {...HERO} dur={d(26.88, 31.3)} />
        )}
      </B>
      <B de={29.4} ate={31.2} nome="ALÍVIO MOMENTÂNEO" rastreio={0.4}>
        <Rotulo texto="ALÍVIO MOMENTÂNEO" x={858} y={850} dur={d(29.4, 31.2)} />
      </B>

      {/* 10 · diagnóstico: tela limpa, depois M7 */}
      <B de={32.7} ate={34.0} nome="Headline · DIAGNÓSTICO" rastreio={0.4}>
        <Headline y={1050} dur={d(32.7, 34.0)} linhas={[{ t: "DIAGNÓSTICO", cor: "rosa" }]} />
      </B>
      <B de={34.0} ate={35.35} nome="M7 · lupa" alvo={{ x: 858, y: 580, r: 190 }}>
        {posicoes["m7"] ? (
          <MotionObjeto src="motion/m7_alfa.webm" bbox={P("m7")} largura={360} {...HERO} dur={d(34.0, 35.35)} />
        ) : (
          <ObjetoPng nome="m7" largura={360} {...HERO} dur={d(34.0, 35.35)} />
        )}
      </B>

      {/* 11 · avaliado com um dentista: M8 */}
      <B de={37.22} ate={38.4} nome="M8 · instrumentos" alvo={{ x: 858, y: 580, r: 200 }}>
        {posicoes["m8"] ? (
          <MotionObjeto src="motion/m8_alfa.webm" bbox={P("m8")} largura={380} {...HERO} dur={d(37.22, 38.4)} />
        ) : (
          <ObjetoPng nome="m8" largura={380} {...HERO} dur={d(37.22, 38.4)} />
        )}
      </B>

      {/* 12 · procure um dentista */}
      <B de={39.85} ate={41.5} nome="Headline · PROCURE UM DENTISTA" rastreio={0.4}>
        <Headline y={1040} dur={d(39.85, 41.5)} linhas={[{ t: "PROCURE UM" }, { t: "DENTISTA", cor: "rosa" }]} />
      </B>

      {/* 13 · fechamento respira: detalhe pequeno */}
      <B de={43.14} ate={44.55} nome="M9 · detalhe final" alvo={{ x: 900, y: 420, r: 110 }}>
        {posicoes["m9"] ? (
          <MotionObjeto src="motion/m9_alfa.webm" bbox={P("m9")} largura={200} cx={900} cy={420} dur={d(43.14, 44.55)} />
        ) : (
          <ObjetoPng nome="m9" largura={200} cx={900} cy={420} dur={d(43.14, 44.55)} />
        )}
      </B>

      {legendas ? <Legendas palavras={legendas} estilo={LEGENDA_V3} ocultar={HEADLINES} /> : null}

      {/* trilha (provisória) sobe ~1,5 dB no fecho */}
      <Audio src={staticFile("trilha/provisoria.wav")} volume={(f) => interpolate(f, [F(42.9), F(43.6)], [1, 1.19], clamp)} />
      <Sfx em={0.1} nome="soft-hit" volume={0.1} />
      <Sfx em={1.33} nome="low-impact" volume={0.1} />
      <Sfx em={1.91} nome="air-whoosh" volume={0.22} />
      <Sfx em={2.42} nome="micro-whoosh" volume={0.18} />
      <Sfx em={3.6} nome="soft-hit" volume={0.08} />
      <Sfx em={5.16} nome="tonal-tick" volume={0.14} />
      <Sfx em={5.7} nome="micro-whoosh" volume={0.12} />
      <Sfx em={8.36} nome="low-impact" volume={0.08} />
      <Sfx em={10.3} nome="air-whoosh" volume={0.18} />
      <Sfx em={11.56} nome="tonal-sting" volume={0.16} />
      <Sfx em={14.63} nome="tonal-release" volume={0.14} />
      <Sfx em={16.6} nome="low-pulse" volume={0.22} />
      <Sfx em={18.3} nome="soft-hit" volume={0.08} />
      <Sfx em={19.92} nome="tonal-tick" volume={0.1} />
      <Sfx em={24.0} nome="low-impact" volume={0.08} />
      <Sfx em={25.5} nome="air-whoosh" volume={0.16} />
      <Sfx em={26.9} nome="air-whoosh" volume={0.14} />
      <Sfx em={29.34} nome="tonal-release" volume={0.1} />
      <Sfx em={31.66} nome="micro-whoosh" volume={0.12} />
      <Sfx em={32.7} nome="low-impact" volume={0.2} />
      <Sfx em={34.0} nome="tonal-tick" volume={0.1} />
      <Sfx em={37.22} nome="metal-tick" volume={0.22} />
      <Sfx em={38.36} nome="micro-whoosh" volume={0.1} />
      <Sfx em={39.85} nome="soft-hit" volume={0.1} />
    </AbsoluteFill>
  );
};
