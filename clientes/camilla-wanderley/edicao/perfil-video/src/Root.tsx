import { Composition } from "remotion";
import { Periodontite } from "./periodontite/Periodontite";
import { StoriesPeriodontite } from "./stories/StoriesPeriodontite";
import { Depoimento1010 } from "./depoimento1010/Depoimento1010";
import { AMOSTRA_S, PREVIA_S, TOTAL_S } from "./periodontite/tempos";
import { Corte, PLANOS } from "./cortes/Corte";

const F = (s: number) => Math.round(s * 30);

export const RemotionRoot: React.FC = () => (
  <>
    {/* depoimento da Mari (1010.mp4): prévia até "…cuidados em casa." (41,0 s) e o vídeo inteiro */}
    <Composition id="depoimento-1010-previa" component={Depoimento1010} durationInFrames={F(41.0)} fps={30} width={1080} height={1920} defaultProps={{ fim: F(41.0) }} />
    <Composition id="depoimento-1010-opcoes" component={Depoimento1010} durationInFrames={F(4)} fps={30} width={1080} height={1920} defaultProps={{ fim: F(4), estilo: "A" as const }} />
    <Composition id="depoimento-1010" component={Depoimento1010} durationInFrames={F(186.95)} fps={30} width={1080} height={1920} defaultProps={{ fim: F(186.95) }} />
    {/* diária de 2026-10-22: vlog e vídeos por tema (planos em src/cortes/planos.json) */}
    {Object.values(PLANOS).map((p) => (
      <Composition key={p.id} id={p.id} component={Corte} durationInFrames={F(p.total)} fps={30} width={1080} height={1920} defaultProps={{ id: p.id }} />
    ))}
    {/* stories do reels: cada quadro é um story (remotion still --frame=0..3) */}
    <Composition id="stories-periodontite" component={StoriesPeriodontite} durationInFrames={4} fps={30} width={1080} height={1920} />
    <Composition
      id="periodontite-amostra"
      component={Periodontite}
      durationInFrames={F(AMOSTRA_S)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ fim: F(AMOSTRA_S) }}
    />
    <Composition
      id="periodontite-previa"
      component={Periodontite}
      durationInFrames={F(PREVIA_S)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ fim: F(PREVIA_S) }}
    />
    <Composition
      id="periodontite"
      component={Periodontite}
      durationInFrames={F(TOTAL_S)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ fim: F(TOTAL_S) }}
    />
  </>
);
