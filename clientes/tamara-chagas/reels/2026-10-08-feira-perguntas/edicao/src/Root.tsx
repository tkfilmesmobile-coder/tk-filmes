import { Composition } from "remotion";
import { DURACAO, FPS, Humor } from "./Humor";

export const RemotionRoot: React.FC = () => (
  <Composition id="Humor" component={Humor} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
