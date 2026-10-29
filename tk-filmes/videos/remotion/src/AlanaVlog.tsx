import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont as loadSerif } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadSerifItalico } from "@remotion/google-fonts/CormorantGaramond";

// Vlog da Dra. Alana (diária de 14/10/2026). Referência: legenda serifada do Cosmos 774222431:
// gancho em caixa branca, fala corrida em branco miúdo, trecho "citado" em vidro fosco com o vídeo em preto e branco.
const serif = loadSerif("normal", { weights: ["600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
const serifItalico = loadSerifItalico("italic", { weights: ["600"], subsets: ["latin", "latin-ext"] }).fontFamily;

const FPS = 24;
const COBRE = "#F0B391"; // cobre/rosé da sacola da Alana, clareado pra ler sobre vídeo

type Estilo = "gancho" | "normal" | "citado" | "forte";
export type Trecho = {
  texto: string; // palavras entre *asteriscos* ficam em cobre itálico
  de: number; // segundos
  ate: number;
  estilo?: Estilo;
};

// Tempos vêm do Whisper (scripts/alana-palavras.json). Os trechos marcados "A CONFIRMAR" a música atrapalhou a transcrição.
const TRECHOS: Trecho[] = [
  { texto: "Eu sei que muita gente já conhece sobre o Botox,", de: 0.05, ate: 2.9, estilo: "gancho" },
  { texto: "mas também tem bastante receio sobre fazê-lo,", de: 2.95, ate: 6.05, estilo: "citado" },
  { texto: "mas *calma,*", de: 6.13, ate: 7.05, estilo: "forte" },
  { texto: "o Botox ele bem aplicado", de: 7.08, ate: 8.8 },
  { texto: "por um profissional,", de: 8.85, ate: 10.5 },
  { texto: "ele pode realçar ainda mais", de: 10.59, ate: 12.1 },
  { texto: "a sua *beleza natural,*", de: 12.13, ate: 13.45 },
  { texto: "hoje aqui em União dos Palmares.", de: 13.53, ate: 15.5 },
  { texto: "ter um dia *exclusivo* de beleza,", de: 15.59, ate: 17.65 }, // A CONFIRMAR (início da frase)
  { texto: "apenas com Botox.", de: 17.72, ate: 19.0 },
  { texto: "Viram aí,", de: 42.65, ate: 43.15, estilo: "forte" },
  { texto: "Hoje muitas mulheres já vieram realçar", de: 43.21, ate: 45.5 },
  { texto: "sua *beleza.*", de: 45.58, ate: 46.75 },
  { texto: "E *você?*", de: 46.82, ate: 47.5, estilo: "forte" },
  { texto: "Tá esperando o que pra mim também?", de: 47.58, ate: 49.1 }, // A CONFIRMAR (final da frase)
];

// Trecho em preto e branco (a "voz do receio"), em segundos.
const PB = { de: 2.95, ate: 6.1 };

// Cortes secos do vídeo (frame @24 fps), de scripts/cortes.mjs. Cada um ganha um soco de zoom que assenta.
const CORTES = [323, 457, 491, 518, 543, 610, 628, 652, 677, 706, 777, 807, 858, 903, 946, 1018];

const f = (s: number) => Math.round(s * FPS);
const TRAVA = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);

const Texto: React.FC<{ texto: string; tam: number; cor?: string }> = ({ texto, tam, cor = "#fff" }) => (
  <>
    {texto.split(/(\*[^*]+\*)/).map((p, i) =>
      p.startsWith("*") ? (
        <span key={i} style={{ color: COBRE, fontFamily: serifItalico, fontStyle: "italic", fontWeight: 600, fontSize: tam * 1.06 }}>
          {p.slice(1, -1)}
        </span>
      ) : (
        <span key={i} style={{ color: cor }}>{p}</span>
      ),
    )}
  </>
);

export const Legenda: React.FC<{ t: Trecho; duracao: number }> =({ t, duracao }) => {
  const frame = useCurrentFrame();
  const estilo = t.estilo ?? "normal";
  const entra = interpolate(frame, [0, 6], [0, 1], { ...TRAVA, easing: SUAVE });
  const sai = interpolate(frame, [duracao - 4, duracao], [1, 0], TRAVA);
  const opacity = Math.min(entra, sai);
  const sobe = interpolate(frame, [0, 8], [18, 0], { ...TRAVA, easing: SUAVE });
  const desfoque = interpolate(frame, [0, 6], [8, 0], TRAVA);

  const base: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    top: 1160,
    display: "flex",
    justifyContent: "center",
    padding: "0 110px",
    opacity,
    translate: `0px ${sobe}px`,
    filter: `blur(${desfoque}px)`,
  };

  if (estilo === "gancho") {
    return (
      <div style={base}>
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "26px 40px 30px",
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.08,
            textAlign: "center",
            color: "#111",
            textWrap: "balance",
            boxShadow: "0 14px 40px rgba(0,0,0,0.28)",
            scale: interpolate(frame, [0, 10], [0.94, 1], { ...TRAVA, easing: SUAVE }),
          }}
        >
          <Texto texto={t.texto} tam={64} cor="#111" />
        </div>
      </div>
    );
  }

  if (estilo === "citado") {
    return (
      <div style={base}>
        <div
          style={{
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            border: "1.5px solid rgba(255,255,255,0.4)",
            borderRadius: 34,
            padding: "30px 46px 34px",
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 60,
            lineHeight: 1.1,
            textAlign: "center",
            textWrap: "balance",
            textShadow: "0 2px 18px rgba(0,0,0,0.45)",
            scale: interpolate(frame, [0, 10], [0.94, 1], { ...TRAVA, easing: SUAVE }),
          }}
        >
          <Texto texto={t.texto} tam={60} />
        </div>
      </div>
    );
  }

  const tam = estilo === "forte" ? 104 : 58;
  return (
    <div style={base}>
      <div
        style={{
          fontFamily: serif,
          fontWeight: estilo === "forte" ? 700 : 600,
          fontSize: tam,
          lineHeight: 1.08,
          textAlign: "center",
          textWrap: "balance",
          textShadow: "0 2px 22px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.35)",
          scale: estilo === "forte" ? interpolate(frame, [0, 12], [1.12, 1], { ...TRAVA, easing: SUAVE }) : 1,
        }}
      >
        <Texto texto={t.texto} tam={tam} />
      </div>
    </div>
  );
};

export const AlanaVlog: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Zoom de base nos planos em que ela fala: aproxima nas ênfases ("mas calma", "beleza natural", "E você?").
  const base = interpolate(
    frame,
    [0, f(6.13) - 1, f(6.13) + 6, f(10.59), f(10.59) + 8, f(12.13), f(12.13) + 6, f(13.46) - 1, f(13.46), f(15.59), f(15.59) + 6, f(17.72), f(19.04), f(42.42), f(46.82) - 1, f(46.82) + 6, durationInFrames],
    [1, 1.025, 1.1, 1.12, 1.03, 1.04, 1.1, 1.12, 1, 1.02, 1.08, 1.1, 1, 1, 1.03, 1.1, 1.13],
    { ...TRAVA, easing: SUAVE },
  );
  // Soco de zoom em cada corte seco: entra aproximado e assenta.
  const soco = CORTES.reduce(
    (acc, c) => acc + (frame < c ? 0 : interpolate(frame, [c, c + 9], [0.07, 0], { ...TRAVA, easing: Easing.out(Easing.cubic) })),
    0,
  );

  const pb = interpolate(frame, [f(PB.de) - 3, f(PB.de) + 3, f(PB.ate) - 1, f(PB.ate) + 4], [0, 1, 1, 0], TRAVA);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: base + soco, filter: `grayscale(${pb}) contrast(${1 + pb * 0.08}) brightness(${1 - pb * 0.12})` }}>
        <Video src={staticFile("midia/alana-bruto.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      {/* Escurece o pé do quadro pra legenda ler em qualquer plano; cobre mais no trecho em P&B */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,${0.32 + pb * 0.12}) 0%, rgba(0,0,0,0) 45%), radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${0.18 + pb * 0.22}) 100%)`,
        }}
      />

      {TRECHOS.map((t, i) => (
        <Sequence key={i} from={f(t.de)} durationInFrames={Math.max(8, f(t.ate) - f(t.de) + 3)} layout="none">
          <Legenda t={t} duracao={Math.max(8, f(t.ate) - f(t.de) + 3)} />
        </Sequence>
      ))}

      {/* Sons: poucos, graves e fortes, só nas viradas da fala */}
      <Sequence from={f(PB.de)} durationInFrames={30}><Audio src={staticFile("sfx/negativo.wav")} volume={0.5} /></Sequence>
      <Sequence from={f(6.13)} durationInFrames={30}><Audio src={staticFile("sfx/impacto.wav")} volume={0.6} /></Sequence>
      <Sequence from={f(42.65)} durationInFrames={30}><Audio src={staticFile("sfx/impacto.wav")} volume={0.5} /></Sequence>
      <Sequence from={f(46.82)} durationInFrames={20}><Audio src={staticFile("sfx/positivo.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
