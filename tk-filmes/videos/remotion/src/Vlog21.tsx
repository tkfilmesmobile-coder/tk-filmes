import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio, Video } from "@remotion/media";
import { Legenda, type Trecho } from "./AlanaVlog";

// Vlog da Dra. Alana, diária de 21/10/2026. Espinha: IMG_6555 (ela explicando Botox, hialurônico e fios de PDO).
// Cenas de apoio: IMG_6556 (consulta), só planos em que a paciente não aparece de frente.
// Tempos abaixo em segundos do IMG_6555 (T0 = onde o vídeo começa); transcrição em scripts/v21a-palavras.json.
const FPS = 24;
const T0 = 4.5;
const FIM = 52.2;
export const DURACAO_VLOG21 = Math.round((FIM - T0) * FPS);
const f = (t: number) => Math.round((t - T0) * FPS); // segundos do bruto -> frame da edição
const TRAVA = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);

const TRECHOS: Trecho[] = [
  { texto: "O *Botox* é um dos nossos grandes aliados", de: 6.46, ate: 9.1, estilo: "gancho" },
  { texto: "para suavizar as linhas de expressões.", de: 9.15, ate: 11.4 },
  { texto: "*Porém,*", de: 11.5, ate: 12.1, estilo: "forte" },
  { texto: "ele não consegue fazer tudo sozinho.", de: 12.14, ate: 14.7 },
  { texto: "Algumas marcas e linhas de expressões", de: 14.82, ate: 17.3 },
  { texto: "precisam de outras abordagens,", de: 17.4, ate: 19.2 },
  { texto: "como, por exemplo,", de: 19.26, ate: 20.25 },
  { texto: "o preenchimento com ácido *hialurônico.*", de: 20.28, ate: 22.45 },
  { texto: "Então, é durante a *avaliação*", de: 23.0, ate: 25.6 },
  { texto: "que entendemos a individualidade", de: 25.65, ate: 27.58 },
  { texto: "de cada rosto e podemos associar", de: 27.63, ate: 29.9 },
  { texto: "os tratamentos para obter", de: 29.94, ate: 31.4 },
  { texto: "os melhores *resultados.*", de: 31.42, ate: 32.7 },
  { texto: "No caso desse paciente,", de: 32.76, ate: 33.95 },
  { texto: "como já existe profundidade", de: 33.98, ate: 35.58 },
  { texto: "dessas linhas,", de: 35.62, ate: 36.43 },
  { texto: "o ideal é que a gente faça", de: 36.46, ate: 37.95 },
  { texto: "a estimulação de *colágeno*", de: 37.97, ate: 39.82 },
  { texto: "com os *fios de PDO.*", de: 39.86, ate: 40.9 },
  { texto: "Os fios de PDO,", de: 40.92, ate: 42.02 },
  { texto: "eles são inseridos", de: 42.06, ate: 43.68 },
  { texto: "sobre a pele", de: 43.71, ate: 44.57 },
  { texto: "e aí eles vão estimular o colágeno,", de: 44.59, ate: 46.95 },
  { texto: "suavizar as linhas finas", de: 46.98, ate: 48.64 },
  { texto: "e trazendo mais *firmeza*", de: 48.66, ate: 50.24 },
  { texto: "para a pele.", de: 50.26, ate: 51.6 },
];

// Cenas de apoio da consulta (IMG_6556): de/ate no tempo do IMG_6555; ini = segundo do IMG_6556 onde a cena começa.
const APOIO = [
  { de: 24.2, ate: 27.4, ini: 4.0 }, // "durante a avaliação": ela explicando à paciente, de costas
  { de: 28.4, ate: 31.0, ini: 74.0 }, // "associar os tratamentos": ela ao lado da paciente
];

// Cortes secos do IMG_6555 (frame @24 do bruto), de scripts/cortes.mjs.
const CORTES = [147, 349, 542, 787, 981].map((c) => c - Math.round(T0 * FPS));

// Trilha: o mesmo trecho de música do vlog de 14/10 (19,3 s a 42,2 s do bruto dele), repetido com 0,6 s de fusão.
const MUSICA = { ini: 19.3, dur: 22.9, fusao: 14 };

// Cena de apoio: o relógio aqui é o da Sequence (começa em 0), por isso mora em componente próprio.
const CenaDeApoio: React.FC<{ ini: number; duracao: number }> = ({ ini, duracao }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [0, 4, duracao - 4, duracao], [0, 1, 1, 0], TRAVA) }}>
      <Video src={staticFile("midia/v21-6556.mp4")} trimBefore={Math.round(ini * FPS)} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

export const Vlog21: React.FC = () => {
  const frame = useCurrentFrame();

  const base = interpolate(
    frame,
    [0, f(6.13) - 1, f(6.13), f(11.4), f(11.75), f(14.5), f(14.54), f(20.2), f(20.5), f(22.5), f(22.58), f(31.4), f(31.6), f(32.7), f(32.79), f(39.8), f(39.95), f(40.85), f(40.88), f(49.6), f(49.8), DURACAO_VLOG21],
    [1, 1.02, 1, 1.02, 1.09, 1.1, 1, 1.02, 1.08, 1.09, 1, 1.03, 1.08, 1.08, 1, 1, 1.07, 1.07, 1, 1, 1.07, 1.08],
    { ...TRAVA, easing: SUAVE },
  );
  const soco = CORTES.reduce(
    (acc, c) => acc + (frame < c ? 0 : interpolate(frame, [c, c + 9], [0.07, 0], { ...TRAVA, easing: Easing.out(Easing.cubic) })),
    0,
  );

  const mestre = interpolate(frame, [0, 14, DURACAO_VLOG21 - 30, DURACAO_VLOG21], [0, 1, 1, 0], TRAVA);
  const passo = MUSICA.dur * FPS - MUSICA.fusao;
  const voltas = Math.ceil(DURACAO_VLOG21 / passo);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: base + soco }}>
        <Video src={staticFile("midia/v21-6555.mp4")} trimBefore={Math.round(T0 * FPS)} volume={1.4} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {APOIO.map((a, i) => (
          <Sequence key={i} from={f(a.de)} durationInFrames={f(a.ate) - f(a.de)} layout="absolute-fill">
            <CenaDeApoio ini={a.ini} duracao={f(a.ate) - f(a.de)} />
          </Sequence>
        ))}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0) 45%), radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.2) 100%)",
        }}
      />

      {TRECHOS.map((t, i) => {
        const dur = Math.max(8, f(t.ate) - f(t.de) + 3);
        return (
          <Sequence key={i} from={f(t.de)} durationInFrames={dur} layout="none">
            <Legenda t={t} duracao={dur} />
          </Sequence>
        );
      })}

      {/* Trilha repetida com fusão, bem baixa por baixo da voz */}
      {Array.from({ length: voltas }).map((_, k) => (
        <Sequence key={`m${k}`} from={k * passo} durationInFrames={MUSICA.dur * FPS} layout="none">
          <Audio
            src={staticFile("midia/alana-bruto.mp4")}
            trimBefore={Math.round(MUSICA.ini * FPS)}
            volume={(n) => {
              const dentro = interpolate(n, [0, MUSICA.fusao, MUSICA.dur * FPS - MUSICA.fusao, MUSICA.dur * FPS], [k === 0 ? 1 : 0, 1, 1, 0], TRAVA);
              // Abaixa quando ela fala (6,4 s a 51,5 s do bruto) e sobe de novo antes e depois da fala
              const abs = k * passo + n;
              const fundo = interpolate(abs, [f(5.9), f(6.4), f(51.5), f(52.1)], [0.2, 0.022, 0.022, 0.2], TRAVA);
              return fundo * dentro * mestre;
            }}
          />
        </Sequence>
      ))}

      {/* Sons: poucos, graves e fortes, nas viradas da fala */}
      <Sequence from={f(6.46)} durationInFrames={24}><Audio src={staticFile("sfx/vidro.wav")} volume={0.3} /></Sequence>
      <Sequence from={f(11.5)} durationInFrames={30}><Audio src={staticFile("sfx/impacto.wav")} volume={0.55} /></Sequence>
      <Sequence from={f(24.2)} durationInFrames={20}><Audio src={staticFile("sfx/positivo.wav")} volume={0.35} /></Sequence>
      <Sequence from={f(39.86)} durationInFrames={30}><Audio src={staticFile("sfx/impacto.wav")} volume={0.5} /></Sequence>
    </AbsoluteFill>
  );
};
