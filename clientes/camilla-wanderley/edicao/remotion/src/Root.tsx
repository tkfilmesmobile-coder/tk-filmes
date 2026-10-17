import "./index.css";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { Reel } from "./Reel";
import { Finalizacao, carregarFinal, vazioFinal } from "./Finalizacao";
import type { ReelProps } from "./tipos";
import { SensibilidadeXCanal, SXC_ABERTURA, SXC_DURACAO } from "./sxc/SensibilidadeXCanal";
import { AberturaV3, ABERTURA_V3 } from "./sxc/AberturaV3";
import { TesteAlfa } from "./sxc/TesteAlfa";
import { Completo, COMPLETO_DURACAO } from "./sxc/Completo";
import posicoes from "../public/motion/posicoes.json";
import { CanalDoi, CANAL_DOI_DURACAO, CANAL_DOI_PREVIA } from "./sxc/CanalDoi";

// A partir de 2026-09-30: a Talyta entrega o corte da fala; aqui só a finalização por cima.
// Um vídeo = scripts/fin/<id>.json -> python scripts/finalizar.py <id> -> public/reels/<id>/edicao.json
const FINAIS = ["sensibilidade-x-canal-previa", "sensibilidade-x-canal"];

// Tentativas antigas (corte feito aqui, abandonado em 2026-09-30). Ficam só pra consulta.
const REELS = ["6065-previa", "6064-sensibilidade-ou-canal", "6065-canal-doi"];

const vazio: ReelProps = { fonte: "", clipes: [], headlines: [], cards: [], cta: null, legendas: [] };

const carregar =
  (id: string): CalculateMetadataFunction<ReelProps> =>
  async () => {
    const dados = await (await fetch(staticFile(`reels/${id}/edicao.json`))).json();
    return { durationInFrames: dados.durationInFrames, fps: dados.fps, props: dados.props };
  };

export const RemotionRoot: React.FC = () => (
  <>
    {/* Correção técnica de 2026-09-30: abertura refeita como composição */}
    {/* Vídeo completo no padrão aprovado, com as animações geradas (Wan 2.2) */}
    <Composition id="canal-doi" component={CanalDoi} durationInFrames={CANAL_DOI_DURACAO} fps={30} width={1080} height={1920} />
    <Composition id="canal-doi-previa" component={CanalDoi} durationInFrames={CANAL_DOI_PREVIA} fps={30} width={1080} height={1920} defaultProps={{ fim: CANAL_DOI_PREVIA }} />
    <Composition id="sxc-final" component={Completo} durationInFrames={COMPLETO_DURACAO} fps={30} width={1080} height={1920} defaultProps={{ posicoes }} />
    <Composition id="teste-alfa" component={TesteAlfa} durationInFrames={90} fps={30} width={1080} height={1920} />
    <Composition id="sxc-abertura-v3" component={AberturaV3} durationInFrames={ABERTURA_V3} fps={30} width={1080} height={1920} />
    {/* Direção de edição de 2026-09-30 (2ª versão): vídeo inteiro */}
    <Composition
      id="sxc-completo"
      component={SensibilidadeXCanal}
      durationInFrames={SXC_DURACAO}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ ate: SXC_DURACAO / 30 }}
    />
    <Composition
      id="sxc-abertura"
      component={SensibilidadeXCanal}
      durationInFrames={SXC_ABERTURA}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ ate: SXC_ABERTURA / 30 }}
    />
    {FINAIS.map((id) => (
      <Composition
        key={id}
        id={id}
        component={Finalizacao}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={vazioFinal}
        calculateMetadata={carregarFinal(id)}
      />
    ))}
    {REELS.map((id) => (
      <Composition
        key={id}
        id={id}
        component={Reel}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={vazio}
        calculateMetadata={carregar(id)}
      />
    ))}
  </>
);
