import { Composition } from "remotion";
import { AntesDepois, DURACAO, FPS, schema } from "./AntesDepois";
import { Carrossel, SH, SLIDES, SW } from "./Carrossel";

// CRO obrigatório em toda comunicação do cirurgião-dentista (Res. CFO-196/2019, art. 4º).
// Enquanto o número não vem, o rascunho mostra o aviso.
const IDENTIFICACAO = "CRO [nº a confirmar]";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AntesDepois"
        component={AntesDepois}
        durationInFrames={DURACAO}
        fps={FPS}
        width={1080}
        height={1920}
        schema={schema}
        defaultProps={{ identificacao: IDENTIFICACAO }}
      />
      {/* um quadro por slide: renderizar com --sequence */}
      <Composition
        id="Carrossel"
        component={Carrossel}
        durationInFrames={SLIDES}
        fps={FPS}
        width={SW}
        height={SH}
        schema={schema}
        defaultProps={{ identificacao: IDENTIFICACAO }}
      />
    </>
  );
};
