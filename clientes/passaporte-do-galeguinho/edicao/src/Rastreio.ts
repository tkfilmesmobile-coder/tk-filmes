import { useCallback, useEffect, useState } from "react";
import { staticFile, useDelayRender } from "remotion";

// Um ponto por frame do vídeo gravado, em fração do quadro (0-1): x,y = centro do rosto.
// Gerado por scripts/rosto.py (YuNet, local).
export type PontoDoRosto = {
  f: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const useRastreio = (arquivo: string): PontoDoRosto[] | null => {
  const [pontos, setPontos] = useState<PontoDoRosto[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());

  const carregar = useCallback(async () => {
    try {
      const resposta = await fetch(staticFile(arquivo));
      const dados = await resposta.json();
      setPontos(dados.pontos);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [arquivo, continueRender, cancelRender, handle]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return pontos;
};

const limitar = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// Onde o bloco de gráficos fica em cada frame: centrado no apresentador e logo abaixo do queixo,
// na altura do peito. A média de ±JANELA frames deixa o movimento macio (segue, não treme).
// Os limites mantêm o bloco dentro da margem lateral e acima da legenda.
const JANELA = 7;

export type Ancora = {
  x: number; // centro do bloco de gráficos
  topo: number; // topo do bloco (altura do peito)
  rosto: { esquerda: number; cima: number; queixo: number }; // caixa do rosto, em px
};

export const ancoraDoBloco = (
  pontos: PontoDoRosto[],
  frame: number,
  largura: number,
): Ancora => {
  let x = 0;
  let queixo = 0;
  let altura = 0;
  let esquerda = 0;
  let n = 0;
  for (let i = frame - JANELA; i <= frame + JANELA; i++) {
    const p = pontos[limitar(i, 0, pontos.length - 1)];
    x += p.x * 1080;
    queixo += (p.y + p.h / 2) * 1920;
    altura += p.h * 1920;
    esquerda += (p.x - p.w / 2) * 1080;
    n++;
  }
  x /= n;
  queixo /= n;
  altura /= n;
  esquerda /= n;

  const margem = 60;
  return {
    x: limitar(x, margem + largura / 2, 1080 - margem - largura / 2),
    topo: limitar(queixo + altura * 0.7, 770, 868),
    rosto: { esquerda, cima: queixo - altura, queixo },
  };
};
