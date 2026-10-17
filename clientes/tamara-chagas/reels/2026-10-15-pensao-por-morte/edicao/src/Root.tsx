import { Composition } from "remotion";
import { Pensao, DURACAO, FPS } from "./Pensao";

export const RemotionRoot: React.FC = () => (
  <Composition id="Pensao" component={Pensao} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
