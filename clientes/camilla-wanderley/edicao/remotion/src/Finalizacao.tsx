import { AbsoluteFill, CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { Legendas } from "./Legendas";
import { Card, Cta, Headline } from "./Componentes";
import type { Card as CardT, Cta as CtaT, Headline as HeadlineT, PalavraLegenda } from "./tipos";

// Finalização em cima do corte da Talyta: o vídeo dela toca inteiro e contínuo (imagem e som
// intocados). Só entram camadas por cima: enquadramento por trecho, legenda, headline, card, CTA.
// Tudo em frames, gerado por scripts/finalizar.py a partir de scripts/fin/<id>.json.

// Enquadramento de um trecho: escala em volta do rosto (o rosto fica no mesmo ponto da tela).
export type Quadro = { de: number; ate: number; escala: number; ox: number; oy: number };

export type FinalizacaoProps = {
  fonte: string;
  videoFrames: number;
  quadros: Quadro[];
  legendas: PalavraLegenda[];
  headlines: HeadlineT[];
  cards: CardT[];
  cta: CtaT | null;
};

export const vazioFinal: FinalizacaoProps = { fonte: "", videoFrames: 1, quadros: [], legendas: [], headlines: [], cards: [], cta: null };

export const carregarFinal =
  (id: string): CalculateMetadataFunction<FinalizacaoProps> =>
  async () => {
    const dados = await (await fetch(staticFile(`reels/${id}/edicao.json`))).json();
    return { durationInFrames: dados.durationInFrames, fps: dados.fps, props: dados.props };
  };

// Troca de enquadramento é seca, no quadro exato (como um corte de câmera), nunca deslizando.
const Enquadrado: React.FC<{ fonte: string; quadros: Quadro[] }> = ({ fonte, quadros }) => {
  const frame = useCurrentFrame();
  const q = quadros.find((x) => frame >= x.de && frame < x.ate) ?? quadros[quadros.length - 1];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        name="Corte da Talyta"
        src={staticFile(fonte)}
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: `${q?.ox ?? 540}px ${q?.oy ?? 700}px`,
          scale: q?.escala ?? 1,
        }}
      />
    </AbsoluteFill>
  );
};

export const Finalizacao: React.FC<FinalizacaoProps> = ({ fonte, videoFrames, quadros, legendas, headlines, cards, cta }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1C1416" }}>
      <Sequence name="Vídeo" durationInFrames={videoFrames}>
        <Enquadrado fonte={fonte} quadros={quadros} />
      </Sequence>
      <Sequence name="Legenda" durationInFrames={videoFrames}>
        <Legendas palavras={legendas} />
      </Sequence>
      {headlines.map((h, i) => (
        <Sequence key={`h${i}`} name={`Headline · ${h.linhas.map((l) => l.t).join(" ")}`} from={h.from} durationInFrames={h.durationInFrames}>
          <Headline h={h} />
        </Sequence>
      ))}
      {cards.map((c, i) => (
        <Sequence key={`c${i}`} name={`Card · ${c.etiqueta}`} from={c.from} durationInFrames={c.durationInFrames}>
          <Card c={c} />
        </Sequence>
      ))}
      {cta ? (
        <Sequence name="CTA" from={cta.from} durationInFrames={cta.durationInFrames}>
          <Cta c={cta} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
