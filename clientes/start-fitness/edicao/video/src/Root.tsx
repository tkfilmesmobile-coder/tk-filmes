import { Composition } from "remotion";
import { Chamada } from "./Chamada";
import { FPS } from "./marca";
import { TOTAL } from "./plano";

export const RemotionRoot: React.FC = () => (
  <>
    {/* vídeo 1 de 2: chamada da 2ª Corrida Start Fitness (24 fps, igual ao original) */}
    <Composition id="chamada-corrida" component={Chamada} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
