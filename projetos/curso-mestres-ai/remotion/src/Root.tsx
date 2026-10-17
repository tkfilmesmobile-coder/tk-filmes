import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { DURACAO, FPS, Img0397 } from "./reels/Img0397";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="IMG0397"
        component={Img0397}
        durationInFrames={DURACAO}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
