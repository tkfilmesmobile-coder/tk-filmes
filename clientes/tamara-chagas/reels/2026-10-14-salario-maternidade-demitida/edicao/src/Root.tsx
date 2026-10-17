import { Composition } from "remotion";
import { Afastado, DURACAO, FPS } from "./Afastado";

export const RemotionRoot: React.FC = () => (
  <Composition id="Afastado" component={Afastado} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
