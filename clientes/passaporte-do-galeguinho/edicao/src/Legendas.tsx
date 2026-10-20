import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import type { Caption } from "@remotion/captions";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadGreatVibes } from "@remotion/google-fonts/GreatVibes";
import { FAIXA, MARCA } from "./marca";
import { SomDaCasa } from "./Sons";

const { fontFamily: montserrat } = loadMontserrat("normal", {
  weights: ["700"],
  subsets: ["latin", "latin-ext"],
});
const { fontFamily: anton } = loadAnton("normal", {
  weights: ["400"],
  subsets: ["latin", "latin-ext"],
});
const { fontFamily: manuscrito } = loadGreatVibes("normal", {
  weights: ["400"],
  subsets: ["latin", "latin-ext"],
});

// A legenda do JSON segue o tipo Caption do Remotion, com dois campos a mais:
// enfase marca o bloco que vira headline; apoio marca as palavras de entrada dela (manuscrito pequeno).
type Legenda = Caption & { enfase?: boolean; apoio?: boolean };

type Bloco = {
  palavras: Legenda[];
  inicioMs: number;
  fimMs: number;
  enfase: boolean;
};

// Onde a legenda fica num trecho do vídeo. Serve pra desviar do lanche e dos inserts.
export type ZonaDeLegenda = {
  de: number; // frame inicial (inclusive)
  ate: number; // frame final (exclusive)
  esquerda: number;
  direita: number;
  centro: number; // linha central da legenda corrente
  base: number; // linha de baixo da headline (ela cresce pra cima)
  enfase: number; // tamanho máximo do título da headline
  headlineEsquerda?: number; // quando a headline precisa desviar pra um lado (lanche em cena)
  headlineDireita?: number;
};

const ZONA_PADRAO = {
  esquerda: 90,
  direita: 90,
  centro: FAIXA.legendaCentro,
  base: 1530,
  enfase: 112,
};

const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);
const ELASTICO = Easing.bezier(0.34, 1.56, 0.64, 1);
const TRAVA = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Legenda corrente: poucas palavras, minúsculas, brilho suave. Entra com foco e leve aproximação.
const BlocoDeLegenda: React.FC<{
  bloco: Bloco;
  duracao: number;
  zona: Omit<ZonaDeLegenda, "de" | "ate">;
}> = ({ bloco, duracao, zona }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: zona.esquerda,
          right: zona.direita,
          top: zona.centro,
          translate: "0px -50%",
          textAlign: "center",
          textWrap: "balance",
          fontFamily: montserrat,
          fontWeight: 700,
          fontSize: 58,
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          color: MARCA.creme,
          textShadow:
            "0 0 24px rgba(255,246,233,0.45), 0 2px 12px rgba(14,10,5,0.8)",
          opacity: interpolate(
            frame,
            [0, 4, duracao - 2, duracao],
            [0, 1, 1, 0],
            TRAVA,
          ),
          scale: interpolate(frame, [0, 7], [0.93, 1], {
            ...TRAVA,
            easing: SUAVE,
          }),
          filter: `blur(${interpolate(frame, [0, 5], [7, 0], TRAVA)}px)`,
        }}
      >
        {bloco.palavras.map((p) => p.text.trim()).join(" ")}
      </div>
    </AbsoluteFill>
  );
};

// Quebra o título em linhas curtas, pra caber grande.
const linhasDoTitulo = (palavras: string[], maxPorLinha: number) => {
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    if (atual && (atual + " " + p).length > maxPorLinha) {
      linhas.push(atual);
      atual = p;
    } else {
      atual = atual ? atual + " " + p : p;
    }
  }
  if (atual) {
    linhas.push(atual);
  }
  return linhas;
};

// Headline: o par dos posts (manuscrito + Anton dourado). O apoio entra primeiro, em manuscrito;
// o título bate quando a palavra é dita, com subida de ar, impacto grave e um fio dourado embaixo.
const Headline: React.FC<{
  bloco: Bloco;
  duracao: number;
  zona: Omit<ZonaDeLegenda, "de" | "ate">;
}> = ({ bloco, duracao, zona }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const apoio = bloco.palavras
    .filter((p) => p.apoio)
    .map((p) => p.text.trim())
    .join(" ");
  const titulo = bloco.palavras.filter((p) => !p.apoio);
  const bate = Math.round(
    ((titulo[0].startMs - bloco.inicioMs) / 1000) * fps,
  );

  const esquerda = zona.headlineEsquerda ?? zona.esquerda;
  const direita = zona.headlineDireita ?? zona.direita;
  const largura = 1080 - esquerda - direita;
  const linhas = linhasDoTitulo(
    titulo.map((p) => p.text.trim().toUpperCase()),
    largura > 700 ? 14 : 11,
  );
  const maisLonga = Math.max(...linhas.map((l) => l.length));
  // Anton ocupa ~0,5 em por caractere; o título cresce até caber na largura da zona
  const tamanho = Math.min(zona.enfase, Math.floor(largura / (maisLonga * 0.5)));

  return (
    <AbsoluteFill>
      <SomDaCasa nome="headline sobe" em={bate - 9} som="subida" volume={0.34} />
      <SomDaCasa nome="headline bate" em={bate} som="impacto" volume={0.62} />
      <SomDaCasa nome="headline brilha" em={bate + 2} som="brilho" volume={0.2} />
      <div
        style={{
          position: "absolute",
          left: esquerda,
          right: direita,
          bottom: 1920 - zona.base,
          textAlign: "center",
          opacity: interpolate(
            frame,
            [duracao - 3, duracao],
            [1, 0],
            TRAVA,
          ),
        }}
      >
        {apoio ? (
          <div
            style={{
              fontFamily: manuscrito,
              fontSize: 70,
              lineHeight: 1,
              color: MARCA.creme,
              marginBottom: -4,
              textShadow:
                "0 0 20px rgba(255,246,233,0.4), 0 2px 12px rgba(14,10,5,0.85)",
              opacity: interpolate(frame, [0, 5], [0, 1], TRAVA),
              translate: interpolate(
                frame,
                [0, 8],
                ["0px 12px", "0px 0px"],
                { ...TRAVA, easing: SUAVE },
              ),
            }}
          >
            {apoio}
          </div>
        ) : null}
        <div
          style={{
            display: "inline-block",
            fontFamily: anton,
            fontSize: tamanho,
            lineHeight: 1.02,
            letterSpacing: "0.01em",
            color: MARCA.dourado,
            textShadow: `0 0 ${interpolate(
              frame,
              [bate, bate + 4, bate + 20],
              [0, 70, 22],
              TRAVA,
            )}px rgba(255,176,31,0.75), 0 4px 18px rgba(14,10,5,0.85)`,
            opacity: interpolate(frame, [bate, bate + 3], [0, 1], TRAVA),
            scale: interpolate(frame, [bate, bate + 10], [1.42, 1], {
              ...TRAVA,
              easing: ELASTICO,
            }),
            filter: `blur(${interpolate(frame, [bate, bate + 4], [12, 0], TRAVA)}px)`,
          }}
        >
          {linhas.map((linha) => (
            <div key={linha}>{linha}</div>
          ))}
          {/* fio dourado que risca embaixo do título */}
          <div
            style={{
              height: 8,
              marginTop: 10,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${MARCA.dourado}, ${MARCA.laranja})`,
              transformOrigin: "left center",
              scale: `${interpolate(frame, [bate + 3, bate + 13], [0, 1], {
                ...TRAVA,
                easing: SUAVE,
              })} 1`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Legendas: React.FC<{
  arquivo: string;
  zonas?: ZonaDeLegenda[];
}> = ({ arquivo, zonas = [] }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const [legendas, setLegendas] = useState<Legenda[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());

  const carregar = useCallback(async () => {
    try {
      const resposta = await fetch(staticFile(arquivo));
      setLegendas(await resposta.json());
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [arquivo, continueRender, cancelRender, handle]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Os blocos são definidos pelo pageBreakAfter do JSON.
  const blocos = useMemo(() => {
    const lista: Bloco[] = [];
    let atual: Legenda[] = [];
    const fecha = () => {
      if (atual.length > 0) {
        lista.push({
          palavras: atual,
          inicioMs: atual[0].startMs,
          fimMs: atual[atual.length - 1].endMs,
          enfase: atual.some((p) => p.enfase),
        });
        atual = [];
      }
    };
    for (const palavra of legendas ?? []) {
      atual.push(palavra);
      if (palavra.pageBreakAfter) {
        fecha();
      }
    }
    fecha();
    return lista;
  }, [legendas]);

  if (!legendas) {
    return null;
  }

  return (
    <AbsoluteFill>
      {blocos.map((bloco, i) => {
        const inicio = Math.round((bloco.inicioMs / 1000) * fps);
        const proximo = blocos[i + 1];
        // some quando a próxima entra, ou logo depois de a fala acabar (trecho sem legenda fica limpo)
        const fim = Math.min(
          proximo
            ? Math.round((proximo.inicioMs / 1000) * fps)
            : durationInFrames,
          Math.round((bloco.fimMs / 1000) * fps) + 6,
          durationInFrames,
        );
        if (fim <= inicio) {
          return null;
        }
        const zona =
          zonas.find((z) => inicio >= z.de && inicio < z.ate) ?? ZONA_PADRAO;
        return (
          <Sequence
            key={i}
            name={`${bloco.enfase ? "Headline" : "Legenda"} ${i + 1}`}
            from={inicio}
            durationInFrames={fim - inicio}
          >
            {bloco.enfase ? (
              <Headline bloco={bloco} duracao={fim - inicio} zona={zona} />
            ) : (
              <BlocoDeLegenda bloco={bloco} duracao={fim - inicio} zona={zona} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
