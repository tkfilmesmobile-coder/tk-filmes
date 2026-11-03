import { Composition } from "remotion";
import { Maternidade, DURACAO, FPS } from "./Maternidade";

export const RemotionRoot: React.FC = () => (
  <Composition id="Maternidade" component={Maternidade} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} />
);
