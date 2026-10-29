import "./index.css";
import { Composition } from "remotion";
import { Voltei, calcularVideo, type VolteiProps } from "./Voltei";
import { StorySumi } from "./StorySumi";
import { BrollFrase } from "./BrollFrase";
import { AlanaVlog } from "./AlanaVlog";
import { UmDia, DURACAO_DIA } from "./UmDia";

// Cada vídeo da TK é uma composição. O tempo vem do public/<id>/edicao.json (gerado pelos scripts).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Voltei"
        component={Voltei}
        calculateMetadata={calcularVideo("voltei")}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={300}
        defaultProps={{ clipes: [], textos: [], etapa: "cortes" } satisfies VolteiProps}
      />
      <Composition
        id="PodeOuNaoPode"
        component={Voltei}
        calculateMetadata={calcularVideo("pode")}
        width={1080}
        height={1920}
        fps={24}
        durationInFrames={300}
        defaultProps={{ clipes: [], textos: [], etapa: "cortes" } satisfies VolteiProps}
      />
      <Composition id="Pesquisa" component={Voltei} calculateMetadata={calcularVideo("pesquisa")} width={1080} height={1920} fps={24} durationInFrames={300} defaultProps={{ clipes: [], textos: [], etapa: "cortes" } satisfies VolteiProps} />
      <Composition id="Amador" component={Voltei} calculateMetadata={calcularVideo("amador")} width={1080} height={1920} fps={24} durationInFrames={300} defaultProps={{ clipes: [], textos: [], etapa: "cortes" } satisfies VolteiProps} />
      <Composition id="Eleicao" component={Voltei} calculateMetadata={calcularVideo("eleicao")} width={1080} height={1920} fps={24} durationInFrames={300} defaultProps={{ clipes: [], textos: [], etapa: "cortes" } satisfies VolteiProps} />
      <Composition id="Solto" component={Voltei} calculateMetadata={calcularVideo("solto")} width={1080} height={1920} fps={24} durationInFrames={300} defaultProps={{ clipes: [], textos: [], etapa: "cortes" } satisfies VolteiProps} />
      <Composition id="UmDia" component={UmDia} durationInFrames={DURACAO_DIA} fps={24} width={1080} height={1920} />
      <Composition id="AlanaVlog" component={AlanaVlog} durationInFrames={1179} fps={24} width={1080} height={1920} />
      <Composition id="BrollFrase" component={BrollFrase} durationInFrames={24 * 9} fps={24} width={1080} height={1920} calculateMetadata={async ({ props }) => ({ durationInFrames: Math.round((props.segundos ?? 9) * 24) })} defaultProps={{ clipe: "BR-006", clipeSegundos: 12, texto: "", segundos: 9 }} />
          <Composition id="StorySumi" component={StorySumi} durationInFrames={24 * 15} fps={24} width={1080} height={1920} defaultProps={{ inicio: 12 }} />
</>
  );
};
