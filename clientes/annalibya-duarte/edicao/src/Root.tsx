import { Composition } from "remotion";
import { FPS } from "./estilo";
import { Apresentacao, Consultorio, DURACAO_1, DURACAO_2 } from "./Videos";

export const RemotionRoot: React.FC = () => (
  <>
    {/* 2026-10-28: vídeo 1, apresentação da doutora */}
    <Composition id="Apresentacao" component={Apresentacao} durationInFrames={DURACAO_1} fps={FPS} width={1080} height={1920} />
    {/* 2026-10-28: vídeo 2, o consultório */}
    <Composition id="Consultorio" component={Consultorio} durationInFrames={DURACAO_2} fps={FPS} width={1080} height={1920} />
  </>
);
