import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Assinatura, Endereco, FPS, Fecho, Fundo, Legenda, NOME, Palavra, Titulo } from "./estilo";
import { CartaoInstagram, Clarao, HeadlineTratamentos } from "./pecas";
import legendas from "./legendas.json";

// Os 2 vídeos gravados em 2026-10-28 (Drive da cliente, arquivos copy_*.mov), já cortados.
// A TK põe a linha visual por cima: título, legenda palavra a palavra, cartões, trilha e fechamento.
// Legendas: 2026-10-28/legendas.py (conferidas com a transcrição). Trilha: scripts/gerar-trilha.py.
// 2ª versão (2026-10-29): abertura com os brutos no vídeo 1, headline dos tratamentos, cartão do Instagram
// no "link da bio" e, no vídeo 2, só uma entrada no consultório (2026-10-28/preparar.py).

const s = (seg: number) => Math.round(seg * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T_FECHO = s(2.5);

// trilha baixinha sob a fala e mais presente onde ela não fala; some no fim
const volumeTrilha = (falas: [number, number][], total: number, baixo: number, alto: number) => (f: number) => {
  const t = f / FPS;
  const dentro = falas.some(([a, b]) => t >= a && t <= b);
  let v = alto;
  if (dentro) v = baixo;
  else {
    const dist = Math.min(...falas.map(([a, b]) => (t < a ? a - t : t - b)));
    v = interpolate(dist, [0, 0.6], [baixo, alto], clamp);
  }
  const entra = interpolate(f, [0, s(0.5)], [0, 1], clamp);
  const sai = interpolate(f, [total - s(1.6), total - 1], [1, 0], clamp);
  return v * entra * sai;
};

// ── Vídeo 1: quem é a doutora
// abertura (7,85 s): escada, mão no puxador, "Alexa, ligar as luzes do consultório" (2,9–5,6 s), luz acendendo
const ABERTURA = s(7.85);
const LUZ = s(6.15); // a luz acende
const V1 = s(41.5);
export const DURACAO_1 = ABERTURA + V1 + T_FECHO - s(0.25);
const v1 = (seg: number) => s(seg); // tempos do vídeo original, dentro da Sequence "Fala"

export const Apresentacao: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Audio
      src={staticFile("audio/trilha.wav")}
      volume={volumeTrilha([[3.0, 5.6], [7.85, 7.85 + 41.0]], DURACAO_1, 0.07, 0.34)}
    />
    <Sequence name="Abertura" durationInFrames={ABERTURA} layout="none">
      <Fundo src="brutos/abertura.mp4" tipo="video" />
    </Sequence>
    <Sequence name="Som da luz" from={LUZ - 2} durationInFrames={s(1.5)} layout="none">
      <Audio src={staticFile("sfx/brilho.wav")} volume={0.35} />
    </Sequence>
    <Sequence name="Fala" from={ABERTURA} durationInFrames={V1 + T_FECHO} layout="none">
      <Sequence name="Vídeo" durationInFrames={V1} layout="none">
        <Fundo src="brutos/video1.mp4" tipo="video" />
      </Sequence>
      {/* o título é a própria fala: "Muito prazer, eu sou a Anna Líbya, sou cirurgiã-dentista há 12 anos" */}
      <Sequence name="Título" durationInFrames={v1(4.4)} layout="none">
        <Titulo acima="Muito prazer, eu sou a" principal={NOME} abaixo="Cirurgiã-dentista há 12 anos" dur={v1(4.4)} />
      </Sequence>
      <Sequence name="Legenda" durationInFrames={V1} layout="none">
        <Legenda palavras={legendas.v1 as Palavra[]} />
      </Sequence>
      {/* "o seu tratamento completo ... tudo aqui" (16,45–26,2 s) */}
      <Sequence name="Headline tratamentos" from={v1(16.45)} durationInFrames={v1(26.2) - v1(16.45)} layout="none">
        <HeadlineTratamentos dur={v1(26.2) - v1(16.45)} />
      </Sequence>
      {/* "Clica no link da bio e vem!" (39,44 s); o dedo toca em "link" (39,72 s) */}
      <Sequence name="Link na bio" from={v1(38.95)} durationInFrames={V1 - s(0.25) - v1(38.95)} layout="none">
        <CartaoInstagram dur={V1 - s(0.25) - v1(38.95)} toque={v1(39.72) - v1(38.95)} />
      </Sequence>
      <Sequence name="Clique" from={v1(39.72)} durationInFrames={s(0.6)} layout="none">
        <Audio src={staticFile("sfx/clique.wav")} volume={0.5} />
      </Sequence>
      <Sequence name="Fecho" from={V1 - s(0.25)} durationInFrames={T_FECHO} layout="none">
        <Fecho />
      </Sequence>
    </Sequence>
    <Clarao meio={ABERTURA} />
  </AbsoluteFill>
);

// ── Vídeo 2: o consultório (56,27 s depois de tirar a 2ª entrada no consultório; tudo depois de 37,40 s andou 7,31 s)
const V2 = s(56.27);
export const DURACAO_2 = V2 + T_FECHO - s(0.25);
const FALAS_2: [number, number][] = [
  [0, 11.45],
  [30.13, 34.99],
  [50.59, 56.09],
];

export const Consultorio: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Audio src={staticFile("audio/trilha.wav")} volume={volumeTrilha(FALAS_2, DURACAO_2, 0.07, 0.42)} />
    <Sequence name="Vídeo" durationInFrames={V2} layout="none">
      <Fundo src="brutos/video2-corte.mp4" tipo="video" />
    </Sequence>
    {/* "Seja muito bem-vindo ao meu consultório" */}
    <Sequence name="Título" durationInFrames={s(2.75)} layout="none">
      <Titulo acima="Seja muito bem-vindo ao" principal="meu consultório" abaixo={NOME} dur={s(2.75)} />
    </Sequence>
    {/* endereço que ela fala (4,78–11,42 s): a linha entra junto com a fala */}
    <Sequence name="Endereço" from={s(4.75)} durationInFrames={s(7.2)} layout="none">
      <Endereco dur={s(7.2)} linhas={[s(5.36 - 4.75), s(7.78 - 4.75), s(10.14 - 4.75)]} />
    </Sequence>
    {/* ela volta a aparecer falando em 30,57 s */}
    <Sequence name="Assinatura" from={s(30.62)} durationInFrames={s(4.5)} layout="none">
      <Assinatura dur={s(4.5)} />
    </Sequence>
    <Sequence name="Legenda" durationInFrames={V2} layout="none">
      <Legenda palavras={legendas.v2 as Palavra[]} />
    </Sequence>
    {/* "Clica no link da bio e agenda teu horário" (53,63 s); o dedo toca em "link" (54,45 s) */}
    <Sequence name="Link na bio" from={s(53.15)} durationInFrames={V2 - s(0.25) - s(53.15)} layout="none">
      <CartaoInstagram dur={V2 - s(0.25) - s(53.15)} toque={s(54.45) - s(53.15)} />
    </Sequence>
    <Sequence name="Clique" from={s(54.45)} durationInFrames={s(0.6)} layout="none">
      <Audio src={staticFile("sfx/clique.wav")} volume={0.5} />
    </Sequence>
    <Sequence name="Fecho" from={V2 - s(0.25)} durationInFrames={T_FECHO} layout="none">
      <Fecho />
    </Sequence>
  </AbsoluteFill>
);
