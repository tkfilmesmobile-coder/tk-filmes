import { Composition } from "remotion";
import { Institucional, DURACAO, FPS } from "./Institucional";
export const RemotionRoot: React.FC = () => (
  <Composition id="Institucional" component={Institucional} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
