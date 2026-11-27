import { Composition } from "remotion";
import { Recepcao, Coluna, DUR1, DUR2, FPS } from "./Edicao";
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Recepcao" component={Recepcao} durationInFrames={DUR1} fps={FPS} width={1080} height={1920} />
    <Composition id="Coluna" component={Coluna} durationInFrames={DUR2} fps={FPS} width={1080} height={1920} />
  </>
);
