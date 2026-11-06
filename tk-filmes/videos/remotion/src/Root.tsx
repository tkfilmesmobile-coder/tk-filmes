import "./index.css";
import { Composition } from "remotion";
import { Voltei, calcularVideo, type VolteiProps } from "./Voltei";
import { StorySumi } from "./StorySumi";
import { BrollFrase } from "./BrollFrase";
import { AlanaVlog } from "./AlanaVlog";
import { Vlog21, DURACAO_VLOG21 } from "./Vlog21";
import { UmDia, DURACAO_DIA } from "./UmDia";
import { AntesDepois, AntesDepoisEdicao, duracaoAntesDepois, duracaoEdicao, type Episodio } from "./Bastidor";
import epStart from "./bastidor-start.json";
import epAnna from "./bastidor-annalibya.json";
import { Still } from "remotion";
import { CapaCarrossel, Pagina2Carrossel, Pagina3Carrossel, type Carrossel } from "./Carrossel";
import { PostReel, type PostReelProps } from "./PostReel";
import postsReels from "./posts-reels.json";
import { PostEditorial, type PostEditorialProps } from "./PostEditorial";
import postsEditorial from "./posts-editorial.json";
import carStart from "./carrossel-start.json";
import carAnna from "./carrossel-annalibya.json";
import carPingo from "./carrossel-pingo.json";
import epPingo from "./bastidor-pingo.json";

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
      {/* reels da TK de 2026-11 (brutos de 28/10 e 04/11): "Quanto tempo leva 1 minuto", "Viralizar", "Postar por postar é barulho" */}
      <Composition id="Tempo" component={Voltei} calculateMetadata={calcularVideo("tempo")} width={1080} height={1920} fps={24} durationInFrames={300} defaultProps={{ clipes: [], textos: [], etapa: "cortes" } satisfies VolteiProps} />
      <Composition id="Viralizar" component={Voltei} calculateMetadata={calcularVideo("viralizar")} width={1080} height={1920} fps={24} durationInFrames={300} defaultProps={{ clipes: [], textos: [], etapa: "cortes" } satisfies VolteiProps} />
      <Composition id="Barulho" component={Voltei} calculateMetadata={calcularVideo("barulho")} width={1080} height={1920} fps={24} durationInFrames={300} defaultProps={{ clipes: [], textos: [], etapa: "cortes" } satisfies VolteiProps} />
      {/* posts de imagem única que acompanham cada reel (estética dos reels) */}
      {(["tempo", "viralizar", "barulho"] as const).map((k) => (
        <Still key={`post-${k}`} id={`Post${k[0].toUpperCase()}${k.slice(1)}`} component={PostReel} width={1080} height={1350} defaultProps={postsReels[k] as PostReelProps} />
      ))}
      {/* v2 dos posts (linha editorial escura, refs. "pouco seguidor" e "VOCÊ") */}
      {(["tempo", "viralizar", "barulho"] as const).map((k) => (
        <Still key={`ed-${k}`} id={`Editorial${k[0].toUpperCase()}${k.slice(1)}`} component={PostEditorial} width={1080} height={1350} defaultProps={postsEditorial[k] as unknown as PostEditorialProps} />
      ))}
      <Composition id="Solto" component={Voltei} calculateMetadata={calcularVideo("solto")} width={1080} height={1920} fps={24} durationInFrames={300} defaultProps={{ clipes: [], textos: [], etapa: "cortes" } satisfies VolteiProps} />
      <Composition id="UmDia" component={UmDia} durationInFrames={DURACAO_DIA} fps={24} width={1080} height={1920} />
      <Composition id="AntesDepoisStart" component={AntesDepois} durationInFrames={duracaoAntesDepois(epStart as Episodio)} fps={24} width={1080} height={1920} defaultProps={{ ep: epStart as Episodio, id: "start" }} />
      <Composition id="AntesDepoisAnna" component={AntesDepois} durationInFrames={duracaoAntesDepois(epAnna as Episodio)} fps={24} width={1080} height={1920} defaultProps={{ ep: epAnna as Episodio, id: "annalibya" }} />
      {([["Start", carStart, "start"], ["Anna", carAnna, "annalibya"], ["Pingo", carPingo, "pingo"]] as const).map(([n, c, id]) => (
        <>
          <Still key={`c1${n}`} id={`Carrossel${n}1`} component={CapaCarrossel} width={1080} height={1350} defaultProps={{ c: c as Carrossel, id }} />
          <Still key={`c2${n}`} id={`Carrossel${n}2`} component={Pagina2Carrossel} width={1080} height={1350} defaultProps={{ c: c as Carrossel, id }} />
          <Still key={`c3${n}`} id={`Carrossel${n}3`} component={Pagina3Carrossel} width={1080} height={1350} defaultProps={{ c: c as Carrossel, id }} />
        </>
      ))}
      <Composition id="EdicaoStart" component={AntesDepoisEdicao} durationInFrames={duracaoEdicao(epStart)} fps={24} width={1080} height={1920} defaultProps={{ ep: epStart as Episodio, id: "start" }} />
      <Composition id="EdicaoAnna" component={AntesDepoisEdicao} durationInFrames={duracaoEdicao(epAnna)} fps={24} width={1080} height={1920} defaultProps={{ ep: epAnna as Episodio, id: "annalibya" }} />
      {/* Pingo de Gente (04/11/2026): só o formato pós-produção × resultado final (o vídeo chegou cortado, sem takes de erro) */}
      <Composition id="EdicaoPingo" component={AntesDepoisEdicao} durationInFrames={duracaoEdicao(epPingo)} fps={24} width={1080} height={1920} defaultProps={{ ep: epPingo as Episodio, id: "pingo" }} />
      <Composition id="AlanaVlog" component={AlanaVlog} durationInFrames={1179} fps={24} width={1080} height={1920} />
      <Composition id="Vlog21" component={Vlog21} durationInFrames={DURACAO_VLOG21} fps={24} width={1080} height={1920} />
      <Composition id="BrollFrase" component={BrollFrase} durationInFrames={24 * 9} fps={24} width={1080} height={1920} calculateMetadata={async ({ props }) => ({ durationInFrames: Math.round((props.segundos ?? 9) * 24) })} defaultProps={{ clipe: "BR-006", clipeSegundos: 12, texto: "", segundos: 9 }} />
          <Composition id="StorySumi" component={StorySumi} durationInFrames={24 * 15} fps={24} width={1080} height={1920} defaultProps={{ inicio: 12 }} />
</>
  );
};
