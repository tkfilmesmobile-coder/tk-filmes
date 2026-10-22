import { Composition } from "remotion";
import { Vlog, DURACAO, FPS } from "./Vlog";

export const RemotionRoot: React.FC = () => (
  <Composition id="Vlog" component={Vlog} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
