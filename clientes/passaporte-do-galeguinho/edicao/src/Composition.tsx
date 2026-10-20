import {
  AbsoluteFill,
  Composition,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Video } from "@remotion/media";
import { Abertura, Bloco, LARGURA, SeloDeLocal } from "./Abertura";
import { Acabamento, FILTRO_DO_GRADE } from "./Acabamento";
import { Cardapio3D } from "./Cardapio3D";
import { Ingredientes } from "./Ingredientes";
import { Legendas } from "./Legendas";
import type { ZonaDeLegenda } from "./Legendas";
import { MARCA } from "./marca";
import { ancoraDoBloco, useRastreio } from "./Rastreio";
import { SomDaCasa } from "./Sons";
import { DURACAO_6498, Edicao6498, FPS_6498 } from "./Edicao6498";

const FPS = 30;

// Quando o lanche de verdade está em cena, a legenda sai de cima dele.
const ZONAS_0930: ZonaDeLegenda[] = [
  // 23,6–31,2 s · ingredientes na tela: headline menor, encostada na base
  { de: 708, ate: 936, esquerda: 90, direita: 90, centro: 1440, base: 1540, enfase: 80 },
  // 33,7–46,4 s · ele segura o prato à esquerda: tudo na metade direita, sobre a camisa
  { de: 1010, ate: 1392, esquerda: 500, direita: 50, centro: 1425, base: 1530, enfase: 84 },
  // 46,4 s em diante · sentado, prato na mesa: legenda e headline abaixo do prato
  { de: 1392, ate: 1635, esquerda: 90, direita: 90, centro: 1505, base: 1562, enfase: 84 },
];
// O vídeo gravado tem 1635 frames (54,5 s). A edição acompanha a duração dele.
const DURACAO_0930 = 1635;

type Props = {
  video: string;
  legendas: string;
  rastreio: string;
};

// O vídeo gravado já é vertical 1080 × 1920: entra inteiro, sem corte nem zoom, com o áudio original.
const Edicao: React.FC<Props> = ({ video, legendas, rastreio }) => {
  const frame = useCurrentFrame();
  const pontos = useRastreio(rastreio);

  if (!pontos) {
    return null;
  }

  // Os gráficos seguem o apresentador: a âncora vem do rastreio do rosto, frame a frame.
  const ancora = ancoraDoBloco(pontos, frame, LARGURA);
  // O cardápio fica sempre à esquerda do rosto; os ingredientes, sempre abaixo do queixo.
  const cardapioEsquerda = Math.min(64, Math.max(16, ancora.rosto.esquerda - 380));
  const ingredientesTopo = Math.min(900, Math.max(860, ancora.rosto.queixo + 46));

  return (
    <AbsoluteFill style={{ backgroundColor: MARCA.escuro }}>
      <Video
        name="Vídeo gravado"
        src={staticFile(video)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: FILTRO_DO_GRADE,
        }}
      />
      <Acabamento />

      {/* 0–3,4 s · quem está falando: perfil + vídeos com visualizações */}
      <Abertura ancora={ancora} />

      {/* 2,3–4,9 s · ele diz "São José da Laje": selo com a logo da casa */}
      <Sequence name="Localização" from={70} durationInFrames={76}>
        <Bloco ancora={ancora}>
          <SeloDeLocal cidade="São José da Laje · AL" duracao={76} />
        </Bloco>
      </Sequence>
      <SomDaCasa nome="logo cai" em={70} som="estouro" volume={0.46} />
      <SomDaCasa nome="logo assenta" em={72} som="impacto" volume={0.22} />
      <SomDaCasa nome="pílula abre" em={76} som="sopro" volume={0.3} />
      <SomDaCasa nome="nome aparece" em={83} som="toque" volume={0.28} />
      <SomDaCasa nome="pino da cidade" em={88} som="estouro" volume={0.28} />
      <SomDaCasa nome="selo sai" em={137} som="sopro" volume={0.24} />

      {/* 11,2–19,1 s · "no cardápio... hoje eu vou de Capiana": cardápio online em perspectiva */}
      <Sequence name="Cardápio 3D" from={336} durationInFrames={236}>
        <Cardapio3D duracao={236} destaqueEm={160} esquerda={cardapioEsquerda} />
      </Sequence>
      <SomDaCasa nome="cardápio chega" em={333} som="sopro" volume={0.5} />
      <SomDaCasa nome="lanche 1" em={346} som="toque" volume={0.26} />
      <SomDaCasa nome="lanche 2" em={350} som="toque" volume={0.26} />
      <SomDaCasa nome="lanche 3" em={354} som="toque" volume={0.26} />
      <SomDaCasa nome="lanche 4" em={358} som="toque" volume={0.26} />
      <SomDaCasa nome="lanche 5" em={362} som="toque" volume={0.26} />
      {/* a escolha: o Capiana salta do cartão junto com a headline "CAPIANA!" */}
      <SomDaCasa nome="capiana salta" em={497} som="estouro" volume={0.4} />
      <SomDaCasa nome="etiqueta da escolha" em={504} som="estouro" volume={0.32} />
      <SomDaCasa nome="cardápio sai" em={561} som="sopro" volume={0.32} />

      {/* 23,6–31,2 s · "tem bacon, cebola caramelizada, tem cheddar": o lanche aberto em camadas */}
      <Sequence name="Ingredientes" from={708} durationInFrames={228}>
        <Ingredientes duracao={228} topo={ingredientesTopo} />
      </Sequence>
      <SomDaCasa nome="lanche entra" em={706} som="sopro" volume={0.46} />
      <SomDaCasa nome="camada 1 abre" em={716} som="estouro" volume={0.3} />
      <SomDaCasa nome="camada 2 abre" em={718} som="estouro" volume={0.28} />
      <SomDaCasa nome="camada 3 abre" em={720} som="estouro" volume={0.26} />
      <SomDaCasa nome="camada 4 abre" em={722} som="estouro" volume={0.24} />
      <SomDaCasa nome="etiquetas" em={733} som="toque" volume={0.24} />
      <SomDaCasa nome="camadas fecham" em={904} som="sopro" volume={0.3} />
      <SomDaCasa nome="lanche monta" em={919} som="impacto" volume={0.36} />
      <SomDaCasa nome="lanche sai" em={927} som="sopro" volume={0.24} />


      {/* 49,6–54,3 s · "não perde tempo não, vem simbora": o selo da casa volta pra fechar */}
      {/* o selo fica acima da cabeça dele: longe do rosto e do lanche que ele levanta no fim */}
      <Sequence name="Fechamento" from={1487} durationInFrames={140}>
        <Bloco
          ancora={{
            x: ancora.x,
            topo: Math.max(190, ancora.rosto.cima - 150),
          }}
        >
          <SeloDeLocal
            cidade="São José da Laje · AL"
            duracao={140}
            topoInterno={0}
          />
        </Bloco>
      </Sequence>
      <SomDaCasa nome="selo final cai" em={1487} som="estouro" volume={0.44} />
      <SomDaCasa nome="selo final assenta" em={1489} som="impacto" volume={0.2} />
      <SomDaCasa nome="selo final abre" em={1493} som="sopro" volume={0.28} />
      <SomDaCasa nome="selo final nome" em={1500} som="toque" volume={0.26} />

      <Legendas arquivo={legendas} zonas={ZONAS_0930} />
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <>
      {/* Edição completa do vídeo de 30/09 */}
      <Composition
        id="Edicao0930"
        component={Edicao}
        durationInFrames={DURACAO_0930}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          video: "midia/0930.mp4",
          legendas: "legendas/0930.json",
          rastreio: "rastreio/0930.json",
        }}
      />
      {/* Vídeo IMG_6498 (atendente monta o Passaporte de Frango), 24 fps */}
      <Composition
        id="Edicao6498"
        component={Edicao6498}
        durationInFrames={DURACAO_6498}
        fps={FPS_6498}
        width={1080}
        height={1920}
        defaultProps={{
          video: "midia/6498.mov",
          legendas: "legendas/6498.json",
          rastreio: "rastreio/6498.json",
        }}
      />
      <Composition
        id="Previa6498"
        component={Edicao6498}
        durationInFrames={9 * FPS_6498}
        fps={FPS_6498}
        width={1080}
        height={1920}
        defaultProps={{
          video: "midia/6498.mov",
          legendas: "legendas/6498.json",
          rastreio: "rastreio/6498.json",
        }}
      />
      {/* Prévia de 9 s (abertura), pra conferir ajuste rápido sem renderizar tudo */}
      <Composition
        id="Previa0930"
        component={Edicao}
        durationInFrames={9 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          video: "midia/0930.mp4",
          legendas: "legendas/0930.json",
          rastreio: "rastreio/0930.json",
        }}
      />
    </>
  );
};
