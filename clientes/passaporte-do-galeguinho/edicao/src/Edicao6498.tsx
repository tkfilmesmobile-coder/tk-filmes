import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { Bloco, LARGURA, SeloDeLocal } from "./Abertura";
import { Acabamento, FILTRO_DO_GRADE } from "./Acabamento";
import { Cardapio3D } from "./Cardapio3D";
import { Legendas } from "./Legendas";
import type { ZonaDeLegenda } from "./Legendas";
import { MARCA } from "./marca";
import { ancoraDoBloco, useRastreio } from "./Rastreio";
import { Receita } from "./Receita";
import { SomDaCasa } from "./Sons";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Easing, interpolate } from "remotion";

const { fontFamily } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin", "latin-ext"],
});

// Vídeo IMG_6498 (2026-10-17): atendente apresenta o Passaporte de Frango com Batata Palha e monta o lanche.
// 24 fps, 920 frames (38,3 s). A composição roda a 24 fps pra casar com o rastreio.
export const FPS_6498 = 24;
export const DURACAO_6498 = 920;

// Zonas seguras do reels (regra de 2026-10-12): legenda perto do rosto (y 900–1080), ilustração embaixo
// (y 1080–1500). A headline cresce pra cima a partir de 1440; o bloco rastreado começa em 1100.
const ZONAS_6498: ZonaDeLegenda[] = [
  // 0–25 s · o cardápio ocupa a esquerda da faixa de baixo: headline fica à direita, sobre o peito
  { de: 0, ate: 600, esquerda: 90, direita: 90, centro: 1000, base: 1440, enfase: 84, headlineEsquerda: 500, headlineDireita: 40 },
  // 25–32 s · sentada, com o lanche na bandeja à esquerda: headline no lado direito, sobre o ombro
  { de: 600, ate: DURACAO_6498, esquerda: 90, direita: 90, centro: 980, base: 1320, enfase: 84, headlineEsquerda: 540, headlineDireita: 40 },
];

// Horário da casa, na pílula abaixo do selo, no fechamento.
const Horario: React.FC<{ duracao: number }> = ({ duracao }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: LARGURA,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "14px 30px",
          borderRadius: 40,
          backgroundColor: "rgba(14,10,5,0.78)",
          border: "1.5px solid rgba(255,176,31,0.42)",
          fontFamily,
          fontWeight: 700,
          fontSize: 27,
          color: MARCA.creme,
          opacity: interpolate(
            frame,
            [0, 6, duracao - 6, duracao],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          translate: interpolate(frame, [0, 12], ["0px -16px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        de terça a domingo · <span style={{ color: MARCA.dourado }}>18h às 23h</span>
      </div>
    </div>
  );
};

type Props = { video: string; legendas: string; rastreio: string };

export const Edicao6498: React.FC<Props> = ({ video, legendas, rastreio }) => {
  const frame = useCurrentFrame();
  const pontos = useRastreio(rastreio);

  if (!pontos) {
    return null;
  }

  // O bloco rastreado vive na faixa de ilustração (y 1100 em diante), seguindo o apresentador no eixo x.
  const ancora = ancoraDoBloco(pontos, frame, LARGURA, 1100, 1130);
  // acima da cabeça, sem sair da área útil (y ≥ 250)
  const acima = { x: ancora.x, topo: Math.max(250, ancora.rosto.cima - 150) };

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

      {/* 1,6–2,9 s · "aqui do Passaporte do Galeguinho": o selo da casa (logo, nome e cidade).
          Card com números de perfil é só pra influenciador convidado (regra da Talyta, 2026-10-17). */}
      <Sequence name="Selo da casa (abertura)" from={39} durationInFrames={32}>
        <Bloco ancora={ancora}>
          <SeloDeLocal cidade="São José da Laje · AL" duracao={32} topoInterno={0} />
        </Bloco>
      </Sequence>
      <SomDaCasa nome="logo cai" em={39} som="estouro" volume={0.46} />
      <SomDaCasa nome="logo assenta" em={41} som="impacto" volume={0.22} />
      <SomDaCasa nome="pílula abre" em={45} som="sopro" volume={0.3} />
      <SomDaCasa nome="nome aparece" em={52} som="toque" volume={0.28} />
      <SomDaCasa nome="selo sai" em={66} som="sopro" volume={0.24} />

      {/* 3–8 s · "o meu lanche favorito é o Passaporte de Frango": o cardápio mostra os Passaportes
          (com a foto real do ensaio no lugar do prato cinza) e o de Frango salta, com o adicional */}
      <Sequence name="Cardápio · Passaportes" from={72} durationInFrames={120}>
        <Cardapio3D
          duracao={120}
          destaqueEm={46}
          esquerda={20}
          topo={1088}
          escala={0.4}
          titulo="cardapio-titulo-passaportes"
          linhas={["passaporte-misto", "passaporte-frango", "passaporte-carne"]}
          escolhido={1}
          etiqueta="a escolha dela"
          etiqueta2="+ adicional de batata palha"
        />
      </Sequence>
      <SomDaCasa nome="cardápio chega" em={70} som="sopro" volume={0.5} />
      <SomDaCasa nome="passaporte 1" em={82} som="toque" volume={0.26} />
      <SomDaCasa nome="passaporte 2" em={86} som="toque" volume={0.26} />
      <SomDaCasa nome="passaporte 3" em={90} som="toque" volume={0.26} />
      <SomDaCasa nome="frango salta" em={119} som="estouro" volume={0.4} />
      <SomDaCasa nome="etiqueta" em={126} som="estouro" volume={0.32} />
      <SomDaCasa nome="adicional" em={134} som="estouro" volume={0.3} />
      <SomDaCasa nome="cardápio sai" em={186} som="sopro" volume={0.32} />

      {/* 8–25,5 s · montagem do lanche: a receita risca cada ingrediente quando ele entra */}
      <Sequence name="Receita" from={192} durationInFrames={420}>
        <Receita
          titulo="Passaporte de Frango"
          itens={[
            { nome: "pão seda", entraEm: 10 },
            { nome: "salsicha", entraEm: 36 },
            { nome: "frango desfiado", entraEm: 84 },
            { nome: "milho com ervilha", entraEm: 228 },
            { nome: "ketchup e maionese", entraEm: 264 },
            { nome: "batata palha", entraEm: 372 },
          ]}
          duracao={420}
          esquerda={60}
          topo={270}
        />
      </Sequence>
      <SomDaCasa nome="receita entra" em={191} som="sopro" volume={0.42} />
      <SomDaCasa nome="pão" em={202} som="estouro" volume={0.32} />
      <SomDaCasa nome="salsicha" em={228} som="estouro" volume={0.32} />
      <SomDaCasa nome="frango" em={276} som="estouro" volume={0.32} />
      <SomDaCasa nome="milho" em={420} som="estouro" volume={0.32} />
      <SomDaCasa nome="molhos" em={456} som="estouro" volume={0.32} />
      <SomDaCasa nome="batata palha" em={564} som="estouro" volume={0.34} />
      <SomDaCasa nome="batata palha brilha" em={566} som="brilho" volume={0.18} />
      <SomDaCasa nome="receita sai" em={606} som="sopro" volume={0.3} />

      {/* 29,5 s em diante · "a gente sempre busca o melhor": selo da casa e depois o horário,
          os dois acima da cabeça dela (o lanche ocupa a faixa de baixo nessa parte) */}
      <Sequence name="Selo da casa" from={708} durationInFrames={108}>
        <Bloco ancora={acima}>
          <SeloDeLocal cidade="São José da Laje · AL" duracao={108} topoInterno={0} />
        </Bloco>
      </Sequence>
      <SomDaCasa nome="logo cai" em={708} som="estouro" volume={0.46} />
      <SomDaCasa nome="logo assenta" em={710} som="impacto" volume={0.22} />
      <SomDaCasa nome="pílula abre" em={714} som="sopro" volume={0.3} />
      <SomDaCasa nome="nome aparece" em={721} som="toque" volume={0.28} />
      <SomDaCasa nome="pino" em={726} som="estouro" volume={0.28} />
      <SomDaCasa nome="selo sai" em={810} som="sopro" volume={0.24} />
      <Sequence name="Horário" from={816} durationInFrames={104}>
        <Bloco ancora={acima}>
          <Horario duracao={104} />
        </Bloco>
      </Sequence>
      <SomDaCasa nome="horário" em={816} som="estouro" volume={0.3} />
      <SomDaCasa nome="horário brilha" em={818} som="brilho" volume={0.16} />

      <Legendas arquivo={legendas} zonas={ZONAS_6498} />
    </AbsoluteFill>
  );
};
