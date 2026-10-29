import { Composition } from "remotion";
import { Chamada } from "./Chamada";
import { Entrevista } from "./entrevista/Entrevista";
import { TOTAL as TOTAL_ENTREVISTA } from "./entrevista/plano";
import { FPS } from "./marca";
import { TOTAL } from "./plano";

export const RemotionRoot: React.FC = () => (
  <>
    {/* vídeo 1 de 2: chamada da 2ª Corrida Start Fitness (24 fps, igual ao original) */}
    <Composition id="chamada-corrida" component={Chamada} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1080} height={1920} />
    {/* vídeo 2 de 2: entrevista "quais as expectativas pra 2ª Corrida" */}
    <Composition id="entrevista-expectativas" component={Entrevista} durationInFrames={Math.round(TOTAL_ENTREVISTA * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
