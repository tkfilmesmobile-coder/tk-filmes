import { Composition } from "remotion";
import { Cirurgia, DURACAO, FPS } from "./Cirurgia";

export const RemotionRoot: React.FC = () => (
  <Composition id="Cirurgia" component={Cirurgia} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
