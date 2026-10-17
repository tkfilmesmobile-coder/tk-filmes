import { Composition } from "remotion";
import { DURACAO, FPS, Tamara } from "./Tamara";

export const RemotionRoot: React.FC = () => (
  <Composition id="Tamara" component={Tamara} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
