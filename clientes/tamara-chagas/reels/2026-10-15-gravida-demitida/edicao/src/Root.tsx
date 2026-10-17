import { Composition } from "remotion";
import { Gravida, DURACAO, FPS } from "./Gravida";

export const RemotionRoot: React.FC = () => (
  <Composition id="Gravida" component={Gravida} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
