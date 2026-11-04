import { Composition } from "remotion";
import { FPS } from "./marca";
import { Pingo } from "./Pingo";
import { TOTAL } from "./plano";

export const RemotionRoot: React.FC = () => (
  <>
    {/* chamada "Live Black Day" da Pingo de Gente (vídeo unitário, 24 fps como o original) */}
    <Composition id="live-black-day" component={Pingo} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
