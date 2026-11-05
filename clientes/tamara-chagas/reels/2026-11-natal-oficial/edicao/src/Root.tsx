import { Composition } from "remotion";
import { Natal, DURACAO, FPS } from "./Natal";

export const RemotionRoot: React.FC = () => (
  <Composition id="Natal" component={Natal} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
