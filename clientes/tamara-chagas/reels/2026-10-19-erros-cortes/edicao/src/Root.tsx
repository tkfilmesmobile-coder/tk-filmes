import { Composition } from "remotion";
import { Equipe, FPS, RURAL, VIZINHA, duracao } from "./Equipe";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Vizinha" component={Equipe} defaultProps={{ r: VIZINHA }} durationInFrames={duracao(VIZINHA)} fps={FPS} width={1080} height={1920} />
    <Composition id="Rural" component={Equipe} defaultProps={{ r: RURAL }} durationInFrames={duracao(RURAL)} fps={FPS} width={1080} height={1920} />
  </>
);
