import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import type { Caption } from "@remotion/captions";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["500"],
  subsets: ["latin", "latin-ext"],
});

// Legenda delicada: no máximo 2 linhas curtas por página, linhas equilibradas.
const MAX_CARACTERES = 34; // ~17 por linha: menos palavras de uma vez, leitura tranquila
const PAUSA_QUEBRA_MS = 450; // pausa maior que isso abre página nova
const FONTE_PX = 42;
const ESMAECE = 4; // quadros de entrada e saída de cada página

// Área segura do Reels/TikTok: fica acima da legenda/usuário da plataforma
// (base a 480px do fim) e longe dos botões da direita.
const BASE_PX = 480;
const LARGURA_MAX_PX = 720;

type Pagina = { texto: string; inicioMs: number; fimMs: number };

const paginar = (legendas: Caption[]): Pagina[] => {
  const paginas: Pagina[] = [];
  let atual: Pagina | null = null;

  for (const palavra of legendas) {
    const texto = palavra.text.trim();
    if (!texto) continue;

    const cabe =
      atual !== null &&
      (atual.texto + " " + texto).length <= MAX_CARACTERES &&
      palavra.startMs - atual.fimMs <= PAUSA_QUEBRA_MS;

    if (atual && cabe) {
      atual.texto += " " + texto;
      atual.fimMs = palavra.endMs;
    } else {
      if (atual) paginas.push(atual);
      atual = { texto, inicioMs: palavra.startMs, fimMs: palavra.endMs };
    }

    if ((palavra.pageBreakAfter || /[.?!]$/.test(texto)) && atual) {
      paginas.push(atual);
      atual = null;
    }
  }
  if (atual) paginas.push(atual);
  return paginas;
};

const Pagina: React.FC<{ texto: string; duracao: number }> = ({
  texto,
  duracao,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [
      0,
      ESMAECE,
      Math.max(ESMAECE, duracao - ESMAECE),
      Math.max(ESMAECE + 1, duracao),
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: BASE_PX,
      }}
    >
      <div
        style={{
          maxWidth: LARGURA_MAX_PX,
          fontFamily,
          fontWeight: 500,
          fontSize: FONTE_PX,
          lineHeight: 1.45,
          letterSpacing: "0.015em",
          wordSpacing: "0.06em",
          textWrap: "balance",
          color: "#FFFFFF",
          textAlign: "center",
          opacity,
          // sem fundo: só uma sombra suave pra dar leitura em cima da imagem
          textShadow:
            "0 1px 2px rgba(0, 0, 0, 0.30), 0 2px 14px rgba(0, 0, 0, 0.40)",
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// `inicioOrigemMs`: em que ponto do vídeo original esta composição começa.
export const Legendas: React.FC<{
  arquivo: string;
  inicioOrigemMs: number;
}> = ({ arquivo, inicioOrigemMs }) => {
  const { fps } = useVideoConfig();
  const [legendas, setLegendas] = useState<Caption[] | null>(null);
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

  const paginas = useMemo(
    () => (legendas ? paginar(legendas) : []),
    [legendas],
  );

  return (
    <AbsoluteFill>
      {paginas.map((pagina, i) => {
        const proxima = paginas[i + 1];
        const inicio = Math.round(
          ((pagina.inicioMs - inicioOrigemMs) / 1000) * fps,
        );
        // segura a página até a próxima fala, sem passar de 0,6 s de silêncio
        const fimMs = Math.min(
          proxima ? proxima.inicioMs : Infinity,
          pagina.fimMs + 600,
        );
        const fim = Math.round(((fimMs - inicioOrigemMs) / 1000) * fps);
        const de = Math.max(inicio, 0);
        if (fim - de <= 0) return null;
        return (
          <Sequence
            key={i}
            from={de}
            durationInFrames={fim - de}
            name={pagina.texto}
          >
            <Pagina texto={pagina.texto} duracao={fim - de} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
