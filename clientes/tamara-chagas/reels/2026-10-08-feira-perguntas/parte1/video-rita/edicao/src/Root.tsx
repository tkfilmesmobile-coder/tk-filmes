import { Composition } from "remotion";
import { DURACAO, FPS, Rita } from "./Rita";

export const RemotionRoot: React.FC = () => (
  <Composition id="Rita" component={Rita} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
