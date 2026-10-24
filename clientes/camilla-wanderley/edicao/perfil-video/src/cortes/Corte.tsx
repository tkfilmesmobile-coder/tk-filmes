import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { MONTSERRAT, PLAYFAIR } from "../periodontite/Bloco";
import { Ancora, EstiloLegenda, Legendas } from "../periodontite/Legendas";
import { ImplanteCirurgia, ImplantePartes } from "../motions/Implante3D";
import { DiasEsquecidos, DoisJuntos, MedidorSensibilidade, PlanoCasamento, SemanaPlaca, VinteUmDias } from "../motions/Graficos";
import planos from "./planos.json";

// Vídeos da diária de 2026-10-22 (vlog e unitários), montados a partir de src/cortes/planos.json
// (gerado por edicao/2026-10-22/montar.py). Perfil da doutora: abertura com zoom de ênfase + headline "B"
// (caixa alta, serifa grande, selo vinho, texto branco direto na imagem), enquadramento seguindo o rosto,
// legenda Nunito centralizada, trilha por intenção com ducking, efeitos graves e assinatura no fim.
// Sem imagem de procedimento em andamento (Res. CFO 196/2019, art. 3º).

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
const REVELA = Easing.bezier(0.16, 1, 0.3, 1);
const F = (s: number) => Math.round(s * 30);
const SOMBRA = "0 2px 24px rgba(20,8,12,0.55), 0 1px 3px rgba(20,8,12,0.45)";

type Trecho = { src: string; arq: string; inicio: number; dur: number; srcDe: number; tipo: "voz" | "natural" | "musica"; zoom: number; track: [number, number, number][] | null };
export type Plano = {
  id: string;
  nome: string;
  total: number;
  musica: string;
  ganhoMusica: number;
  fala: number[];
  motions: { tipo: string; de: number; ate: number; foco: number; [k: string]: number | string }[];
  headline: { caps: string; serifa: string; selo: string; ate: number };
  trechos: Trecho[];
  fotoFinal: { src: string; dur: number } | null;
  assinatura: number;
  alvo: [number, number];
};
export const PLANOS = planos as unknown as Record<string, Plano>;

// um trecho do vídeo original, enquadrado no rosto (ou inteiro) e com respiração lenta de câmera
const TrechoVideo: React.FC<{ tr: Trecho; alvo: [number, number]; i: number }> = ({ tr, alvo, i }) => {
  const f = useCurrentFrame();
  const s = f / 30;
  const respira = 1 + 0.025 * (0.5 - 0.5 * Math.cos(((s + i * 3) / 9) * Math.PI));
  const z = tr.zoom * respira;
  let cx = 540;
  let cy = 960;
  let ax = 540;
  let ay = 960;
  if (tr.track && tr.track.length) {
    const ts = tr.track.map((k) => k[0]);
    cx = tr.track.length > 1 ? interpolate(s, ts, tr.track.map((k) => k[1]), clamp) : tr.track[0][1];
    cy = tr.track.length > 1 ? interpolate(s, ts, tr.track.map((k) => k[2]), clamp) : tr.track[0][2];
    ax = alvo[0];
    ay = alvo[1];
  }
  const tx = Math.min(0, Math.max(1080 - 1080 * z, ax - z * cx));
  const ty = Math.min(0, Math.max(1920 - 1920 * z, ay - z * cy));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#1a1012" }}>
      {/* OffthreadVideo: quadros extraídos pelo ffmpeg do Remotion (o <Video> do @remotion/media travava no render longo) */}
      <OffthreadVideo
        name={`${tr.arq} ${tr.srcDe.toFixed(1)}s`}
        src={staticFile(tr.src)}
        trimBefore={F(tr.srcDe)}
        muted
        style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})` }}
      />
    </AbsoluteFill>
  );
};

// headline "B" (aprovada em 2026-10-21 no depoimento da Mari)
const Headline: React.FC<{ h: Plano["headline"] }> = ({ h }) => {
  const s = useCurrentFrame() / 30;
  const sai = interpolate(s, [h.ate - 0.35, h.ate], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const p = (de: number) => interpolate(s, [de, de + 0.5], [0, 1], { ...clamp, easing: REVELA });
  const linha = (de: number, conteudo: React.ReactNode, estilo: React.CSSProperties) => (
    <div style={{ overflow: "hidden", paddingBottom: 6 }}>
      <div style={{ translate: `0px ${(1 - p(de)) * 100}%`, ...estilo }}>{conteudo}</div>
    </div>
  );
  const tamSerifa = Math.min(112, Math.round(1900 / Math.max(1, h.serifa.length)));
  return (
    <AbsoluteFill style={{ opacity: 1 - sai, filter: `blur(${sai * 6}px)` }}>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 48%, rgba(20,8,12,0.55) 72%, rgba(20,8,12,0.65) 100%)", opacity: p(0) }} />
      <div style={{ position: "absolute", top: 1070, width: "100%", textAlign: "center", color: "#FFFFFF", textShadow: SOMBRA }}>
        {linha(0.05, h.caps, { fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 36, letterSpacing: 1, textTransform: "uppercase" })}
        {linha(0.2, h.serifa, { fontFamily: PLAYFAIR, fontWeight: 600, fontSize: tamSerifa, lineHeight: 1.0, letterSpacing: -2 })}
        <div style={{ marginTop: 22, opacity: p(1.0), translate: `0px ${(1 - p(1.0)) * 14}px` }}>
          <span style={{ display: "inline-block", background: "#8E2737", padding: "14px 26px", fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 30, textTransform: "uppercase", letterSpacing: 1, textShadow: "none" }}>
            {h.selo}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// foto em tela cheia com movimento lento e entrada/saída suaves
const FotoCheia: React.FC<{ src: string; dur: number }> = ({ src, dur }) => {
  const f = useCurrentFrame();
  const vis = interpolate(f, [0, 8, dur - 2, dur], [0, 1, 1, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: vis, backgroundColor: "#1a1012" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%", scale: interpolate(f, [0, dur], [1.0, 1.07], clamp) }} />
    </AbsoluteFill>
  );
};

const Assinatura: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const p = (de: number) => interpolate(f, [de, de + 14], [0, 1], { ...clamp, easing: REVELA });
  const sai = interpolate(f, [dur - 8, dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(20,8,12,0.6) 0%, rgba(20,8,12,0.35) 20%, rgba(20,8,12,0) 34%)", opacity: p(0) }} />
      <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", color: "#FFFFFF", textShadow: SOMBRA }}>
        <div style={{ fontFamily: MONTSERRAT, fontWeight: 500, fontSize: 30, letterSpacing: 6, opacity: p(0), translate: `0px ${(1 - p(0)) * 14}px` }}>CONHEÇA A</div>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 92, lineHeight: 1.05, letterSpacing: -1.5, opacity: p(6), translate: `0px ${(1 - p(6)) * 20}px` }}>
          Dra. Camilla Wanderley
        </div>
        <div style={{ marginTop: 20, opacity: p(14), translate: `0px ${(1 - p(14)) * 14}px` }}>
          <span style={{ display: "inline-block", background: "#8E2737", padding: "14px 26px", fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 28, textTransform: "uppercase", letterSpacing: 1, textShadow: "none" }}>
            Clínica Geral e Endodontia
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ em: number; nome: string; volume: number }> = ({ em, nome, volume }) => (
  <Sequence name={`SFX · ${nome}`} from={Math.max(0, F(em))} durationInFrames={F(1.5)} layout="none">
    <Audio src={staticFile(`sfx/${nome}.wav`)} volume={volume} />
  </Sequence>
);

// legenda menor (pedido da Talyta em 2026-10-23: "ocupando muito espaço"): 40 px, até ~30 letras por página
const LEGENDA: EstiloLegenda = { tamanho: 40, maxCaracteres: 30, largura: 760 };
const ancora: Ancora = () => ({ x: 540, y: 1380, escura: false });

// faixa da tela onde os gráficos ficam (abaixo do rosto, acima da legenda em 1380) e a caixa de cada gráfico
// no desenho original (topo e altura em px), pra reduzir e encaixar nessa faixa
const FAIXA: [number, number] = [930, 1340];
const CAIXAS: Record<string, { top: number; h: number }> = {
  "semana-placa": { top: 330, h: 560 },
  "dias-esquecidos": { top: 380, h: 640 },
  "vinte-um-dias": { top: 360, h: 560 },
  "dois-juntos": { top: 420, h: 250 },
  "plano-casamento": { top: 260, h: 600 },
  "plano-comparacao": { top: 260, h: 300 },
  "medidor-sensibilidade": { top: 400, h: 560 },
};

// animações explicativas disponíveis (tipo → componente); tempos em segundos da montagem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOTIONS: Record<string, React.FC<{ t: any }>> = {
  "implante-partes": ImplantePartes,
  "implante-cirurgia": ImplanteCirurgia,
  "semana-placa": SemanaPlaca,
  "dias-esquecidos": DiasEsquecidos,
  "vinte-um-dias": VinteUmDias,
  "dois-juntos": DoisJuntos,
  "plano-casamento": PlanoCasamento,
  "plano-comparacao": PlanoCasamento,
  "medidor-sensibilidade": MedidorSensibilidade,
};

export const Corte: React.FC<{ id: string }> = ({ id }) => {
  const pl = PLANOS[id];
  const fim = F(pl.total);
  const fimVideo = pl.trechos.length ? pl.trechos[pl.trechos.length - 1].inicio + pl.trechos[pl.trechos.length - 1].dur : 0;
  // música: ganho fixo do kit + ducking pela fala (envelope a cada 0,1 s): sob a voz ela desce ~16 dB
  const volMusica = (f: number) => {
    const k = (f / 30) * 10;
    const i = Math.min(pl.fala.length - 1, Math.floor(k));
    const fala = i < 0 ? 0 : pl.fala[i] + (pl.fala[Math.min(pl.fala.length - 1, i + 1)] - pl.fala[i]) * (k - i);
    return pl.ganhoMusica * (1 - 0.84 * fala) * interpolate(f, [0, 12, fim - 24, fim], [0, 1, 1, 0], clamp);
  };
  // foco das animações: o vídeo escurece, desfoca e perde um pouco de cor enquanto uma animação está na tela
  const foco = (f: number) =>
    Math.max(0, ...pl.motions.map((m) => interpolate(f / 30, [m.de, m.de + 0.45, m.ate - 0.45, m.ate], [0, m.foco, m.foco, 0], clamp)));
  // abertura: zoom de ênfase no primeiro trecho
  const enfase = (f: number) => interpolate(f / 30, [0, 1.2, pl.headline.ate - 0.3, pl.headline.ate + 0.3], [1.0, 1.1, 1.12, 1.0], { ...clamp, easing: SUAVE });
  const f = useCurrentFrame();
  const fo = foco(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1012" }}>
      <AbsoluteFill style={{ scale: enfase(f) * (1 + 0.03 * fo), transformOrigin: "540px 640px", filter: fo > 0.001 ? `brightness(${1 - 0.5 * fo}) blur(${7 * fo}px) saturate(${1 - 0.35 * fo})` : undefined }}>
        {pl.trechos.map((tr, i) => (
          <Sequence key={i} name={`Trecho ${i + 1} · ${tr.arq} (${tr.tipo})`} from={F(tr.inicio)} durationInFrames={F(tr.inicio + tr.dur) - F(tr.inicio)}>
            <TrechoVideo tr={tr} alvo={pl.alvo} i={i} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {pl.fotoFinal ? (
        <Sequence name="Foto final" from={F(fimVideo)} durationInFrames={fim - F(fimVideo)}>
          <FotoCheia src={pl.fotoFinal.src} dur={fim - F(fimVideo)} />
        </Sequence>
      ) : null}
      {pl.motions.map((m, i) => {
        const C = MOTIONS[m.tipo];
        // gráfico menor e na faixa de baixo (entre o peito e a legenda), sem cobrir o rosto (pedido de 2026-10-23)
        const caixa = CAIXAS[m.tipo];
        const k = caixa ? Math.min(0.62, (FAIXA[1] - FAIXA[0]) / caixa.h) : 1;
        const dy = caixa ? FAIXA[1] - (caixa.top + caixa.h) : 0;
        return C ? (
          <Sequence key={`m${i}`} name={`Animação · ${m.tipo}`} from={F(m.de)} durationInFrames={F(m.ate) - F(m.de)}>
            <AbsoluteFill style={caixa ? { transformOrigin: `540px ${caixa.top + caixa.h}px`, transform: `translateY(${dy}px) scale(${k})` } : undefined}>
              <C t={m} />
            </AbsoluteFill>
          </Sequence>
        ) : null;
      })}
      <Sequence name="Headline" from={0} durationInFrames={F(pl.headline.ate)}>
        <Headline h={pl.headline} />
      </Sequence>
      <Sequence name="Assinatura" from={fim - F(pl.assinatura)} durationInFrames={F(pl.assinatura)}>
        <Assinatura dur={F(pl.assinatura)} />
      </Sequence>
      {/* sombra suave atrás da legenda (consultório tem mesa e parede brancas); some na headline e na assinatura */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to bottom, rgba(20,8,12,0) 64%, rgba(20,8,12,0.28) 70%, rgba(20,8,12,0.28) 77%, rgba(20,8,12,0) 83%)",
          opacity: interpolate(f, [F(pl.headline.ate) - 6, F(pl.headline.ate) + 6, fim - F(pl.assinatura) - 6, fim - F(pl.assinatura) + 6], [0, 1, 1, 0], clamp),
        }}
      />
      <Legendas arquivo={`cortes/${id}/legendas.json`} ancora={ancora} ocultar={[[0, pl.headline.ate], [pl.total - pl.assinatura, 9999]]} estilo={LEGENDA} />
      <Audio name="Voz (montada e nivelada)" src={staticFile(`cortes/${id}/voz.wav`)} />
      <Audio name="Música (kit da cliente)" src={staticFile(pl.musica)} volume={volMusica} />
      <Sfx em={0.02} nome="whoosh-grave-impacto" volume={0.6} />
      {pl.fotoFinal ? <Sfx em={fimVideo - 0.25} nome="whoosh-grave" volume={0.55} /> : null}
      <Sfx em={pl.total - pl.assinatura} nome="whoosh-grave-cards" volume={0.55} />
    </AbsoluteFill>
  );
};
