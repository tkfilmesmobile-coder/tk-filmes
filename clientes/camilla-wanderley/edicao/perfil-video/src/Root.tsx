import { Composition } from "remotion";
import { Periodontite } from "./periodontite/Periodontite";
import { StoriesPeriodontite } from "./stories/StoriesPeriodontite";
import { AMOSTRA_S, PREVIA_S, TOTAL_S } from "./periodontite/tempos";

const F = (s: number) => Math.round(s * 30);

export const RemotionRoot: React.FC = () => (
  <>
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
