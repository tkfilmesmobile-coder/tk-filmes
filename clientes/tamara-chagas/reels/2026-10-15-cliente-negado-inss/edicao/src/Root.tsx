import { Composition } from "remotion";
import { Negado, DURACAO, FPS } from "./Negado";

export const RemotionRoot: React.FC = () => (
  <Composition id="Negado" component={Negado} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
