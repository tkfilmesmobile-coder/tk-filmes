import { Composition } from "remotion";
import { Natal, DURACAO, FPS } from "./Natal";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Natal" component={Natal} durationInFrames={DURACAO} fps={FPS} width={1080} height={1920} defaultProps={{ horizontal: false }} />
    <Composition id="NatalHorizontal" component={Natal} durationInFrames={DURACAO} fps={FPS} width={1920} height={1080} defaultProps={{ horizontal: true }} />
  </>
);
