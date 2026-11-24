import { Composition } from "remotion";
import { Violencia, DURACAO, FPS } from "./Violencia";
export const RemotionRoot: React.FC = () => (
  <Composition id="Violencia" component={Violencia} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
