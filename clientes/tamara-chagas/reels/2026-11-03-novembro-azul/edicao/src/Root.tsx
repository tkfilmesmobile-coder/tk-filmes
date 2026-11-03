import { Composition } from "remotion";
import { Azul, DURACAO, FPS } from "./Azul";

export const RemotionRoot: React.FC = () => (
  <Composition id="Azul" component={Azul} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
