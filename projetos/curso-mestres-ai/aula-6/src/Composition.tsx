import { AbsoluteFill, Composition, Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { Legendas } from "./Legendas";
import { CartaoFoto, CartaoUrnaData, SeloCheck } from "./Apoios";
import { Edicao, calcularEdicao } from "./Edicao";

// Amostra de 8 s: enquadramento vertical + legenda + apoios visuais.
// Fonte: cópia de trabalho do bruto (public/midia/IMG_0397.mp4); o .mov original não é tocado.
// Tempos em frames a 30 fps, tirados do bruto:
//   Clipe A  0,000 s → 2,033 s   "Acabou a prova de vida no INSS."
//   Clipe B 25,033 s → 31,000 s  "Você sabia que ... já é computada" (tomada boa)
export const Amostra8s: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Video
        name="Clipe A · Acabou a prova de vida"
        src={staticFile("midia/IMG_0397.mp4")}
        trimBefore={0}
        durationInFrames={61}
        objectFit="cover"
        style={{ scale: 1.09, translate: "-44px 0px" }}
      />
      <Video
        name="Clipe B · Você sabia"
        src={staticFile("midia/IMG_0397.mp4")}
        trimBefore={751}
        from={61}
        durationInFrames={179}
        objectFit="cover"
        style={{ scale: 1.15, translate: "-37px 0px" }}
      />
      {/* Apoios nos momentos-chave da fala (frames a partir dos tempos das palavras) */}
      <Sequence name="Apoio · prova de vida" from={3} durationInFrames={57}>
        <CartaoFoto />
      </Sequence>
      <Sequence name="Apoio · urna e 4/10" from={138} durationInFrames={69}>
        <CartaoUrnaData dataEntraEm={43} />
      </Sequence>
      <Sequence name="Apoio · computada" from={210} durationInFrames={30}>
        <SeloCheck />
      </Sequence>
      <Legendas arquivo="legendas/amostra-8s.json" />
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="Aula6-Amostra8s"
        component={Amostra8s}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Edição completa: duração e tempos vêm da fala (public/edicao.json) */}
      <Composition
        id="Aula6-Edicao"
        component={Edicao}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ clipes: [], insercoes: [] }}
        calculateMetadata={calcularEdicao}
      />
    </>
  );
};
