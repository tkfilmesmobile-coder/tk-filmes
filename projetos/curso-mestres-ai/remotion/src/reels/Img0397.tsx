import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio, Video } from "@remotion/media";
import { Enquadrado } from "./Enquadrado";
import { Legendas } from "./Legendas";
import { TRACKING, ZOOM } from "./img0397-tracking";

// Reels Tamara Chagas · IMG_0397 (gravado em 28.09.26).
// Original intocado em projetos/curso-mestres-ai/.claude/TAMARA CHAGAS/.../28.09.26/IMG_0397.mov
// Cópias de trabalho em public/midia/ (fora do GitHub):
//  - IMG_0397.mp4: mesmo vídeo, só trocado de .mov pra .mp4, sem recomprimir, sem áudio
//  - IMG_0397-voz-tratada.wav: voz isolada (Demucs) + scripts/tratar-audio.py (-16 LUFS, pico -1,5)
//
// Corte v3: só a voz do apresentador, sem respiros, cada trecho começa na fala.
// Emendas: o som cruza em 4 quadros em todas (sem estalo). A imagem dissolve em 8 quadros só
// nas emendas de pulo grande (medido: 1→2, 5→6, 7→8); nas outras, corte seco.
// O cruzamento usa um pouco do original antes/depois do trecho (a duração não muda).
//  1. 0:00,0  "Acabou a prova de vida no INSS."
//  2-5. 0:25,2–0:37,7  "Você sabia que... novo sistema." (3 respiros cortados)
//  6-7. 2:01,6–2:05,1  "A partir do momento que você vota nas eleições, já fica registrado."
//  8-9. 2:11,7–2:15,9  "Você não precisa ir nas agências... muito mais fácil, né?"
// Tracking: rosto detectado com YuNet (scripts/rosto.py), caminho suavizado em img0397-tracking.ts.

export const FPS = 30;
export const DURACAO = 631;

const VIDEO = staticFile("midia/IMG_0397.mp4");
const VOZ = staticFile("midia/IMG_0397-voz-tratada.wav");

const DISSOLVE = 8; // quadros de imagem cruzando em cada emenda
const CRUZA_SOM = 4; // quadros de som cruzando em cada emenda

// Um trecho do original colocado na linha do tempo em `de`, com `duracao` quadros,
// começando no quadro `trim` do original. As bordas avançam meio cruzamento pra cada lado.
const Trecho: React.FC<{
  nome: string;
  de: number;
  duracao: number;
  trim: number;
  primeiro?: boolean;
  ultimo?: boolean;
  entraDissolvendo?: boolean; // este trecho entra com dissolve
  saiDissolvendo?: boolean; // o próximo trecho entra com dissolve
}> = ({ nome, de, duracao, trim, primeiro, ultimo, entraDissolvendo, saiDissolvendo }) => {
  const v = DISSOLVE / 2;
  const vAntes = entraDissolvendo ? v : 0;
  const vDepois = saiDissolvendo ? v : 0;
  const s = CRUZA_SOM / 2;
  const sAntes = primeiro ? 0 : s;
  const sDepois = ultimo ? 0 : s;
  const somDur = duracao + sAntes + sDepois;

  return (
    <>
      <Sequence name={nome} from={de - vAntes} durationInFrames={duracao + vAntes + vDepois}>
        <DissolveEntrada quadros={entraDissolvendo ? DISSOLVE : 0}>
          <Enquadrado inicioOrigem={(trim - vAntes) / FPS} zoom={ZOOM} pontos={TRACKING}>
            <Video
              src={VIDEO}
              trimBefore={trim - vAntes}
              muted
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </Enquadrado>
        </DissolveEntrada>
      </Sequence>
      <Sequence name={`${nome} · som`} from={de - sAntes} durationInFrames={somDur} layout="none">
        <Audio
          src={VOZ}
          trimBefore={trim - sAntes}
          volume={(f) =>
            Math.min(
              primeiro ? 1 : interpolate(f, [0, CRUZA_SOM], [0, 1], { extrapolateRight: "clamp" }),
              ultimo
                ? 1
                : interpolate(f, [somDur - CRUZA_SOM, somDur], [1, 0], { extrapolateLeft: "clamp" }),
            )
          }
        />
      </Sequence>
    </>
  );
};

// O trecho que entra aparece por cima do anterior, de transparente a opaco.
const DissolveEntrada: React.FC<{ quadros: number; children: React.ReactNode }> = ({
  quadros,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = quadros ? interpolate(frame, [0, quadros], [0, 1], { extrapolateRight: "clamp" }) : 1;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const Img0397: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Trecho nome="1 · Acabou a prova de vida" de={0} duracao={59} trim={1} primeiro saiDissolvendo />
      <Trecho nome="2 · Você sabia que..." de={59} duracao={128} trim={755} entraDissolvendo />
      <Trecho nome="3 · já é computada..." de={187} duracao={81} trim={894} />
      <Trecho nome="4 · a sua prova de vida?" de={268} duracao={36} trim={983} />
      <Trecho nome="5 · A Receita Federal..." de={304} duracao={106} trim={1025} saiDissolvendo />
      <Trecho nome="6 · A partir do momento..." de={410} duracao={66} trim={3647} entraDissolvendo />
      <Trecho nome="7 · já fica registrado." de={476} duracao={35} trim={3719} saiDissolvendo />
      <Trecho nome="8 · Você não precisa..." de={511} duracao={75} trim={3952} entraDissolvendo />
      <Trecho nome="9 · Agora ficou mais fácil" de={586} duracao={45} trim={4032} ultimo />
      <Legendas arquivo="legendas/IMG_0397.json" inicioOrigemMs={0} />
    </AbsoluteFill>
  );
};
