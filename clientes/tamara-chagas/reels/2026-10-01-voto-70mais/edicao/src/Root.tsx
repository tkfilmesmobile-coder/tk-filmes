import { Composition } from "remotion";
import { DURACAO, FPS, Voto70 } from "./Voto70";

export const RemotionRoot: React.FC = () => (
  <Composition id="Voto70" component={Voto70} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
