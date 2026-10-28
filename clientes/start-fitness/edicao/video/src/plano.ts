// Plano da chamada da 2ª Corrida Start Fitness, v2 "adrenalina". Tempos em segundos do vídeo original (já cortado
// e com cor), tirados da transcrição palavra a palavra (edicao/2026-10-corrida-2a-edicao/analise/transcricao.json).

export type Estilo = "mega" | "vermelho" | "contorno" | "tag" | "tagVermelho" | "faixa";
export type Linha = { t: string; em: number; estilo: Estilo; max?: number; anim?: "slam" | "letras" };
export type Bloco = {
  id: string;
  de: number;
  ate: number;
  x: number; // centro (alinha "centro") ou borda esquerda (alinha "esq")
  y: number; // topo do bloco
  larg?: number; // largura que o texto grande enche
  alinha?: "centro" | "esq";
  linhas: Linha[];
  pulsos?: { em: number; linha: number }[];
  rastreio?: { trecho: string; dx: number; dy: number; leve: number; base?: boolean }; // base: o ponto é o pé do bloco
};

export const TOTAL = 37.67;

// fala (palavras com folga): a música desce aqui e sobe nos respiros
export const FALA: [number, number][] = [
  [0.0, 23.0],
  [24.04, 24.92],
  [26.8, 37.04],
];

// cortes internos do vídeo (histograma, analise/): ganham flash, luz vazando e pancada
export const CORTES = [4.79, 8.42, 10.92, 25.38, 27.5];

export const BLOCOS: Bloco[] = [
  { id: "desafio", de: 0.04, ate: 1.66, x: 495, y: 1010, linhas: [
    { t: "O SEU PRÓXIMO", em: 0.04, estilo: "tag", max: 56 },
    { t: "DESAFIO", em: 1.08, estilo: "contorno" },
    { t: "DESAFIO", em: 1.0, estilo: "mega" },
    { t: "DESAFIO", em: 1.12, estilo: "contorno" },
  ] },
  { id: "data", de: 1.68, ate: 2.98, x: 495, y: 1090, linhas: [
    { t: "JÁ TEM DATA", em: 1.68, estilo: "mega", max: 170 },
    { t: "MARCADA", em: 2.25, estilo: "faixa", max: 150 },
  ] },
  { id: "tempo", de: 3.02, ate: 4.7, x: 495, y: 1150, linhas: [
    { t: "O TEMPO ESTÁ", em: 3.06, estilo: "tag", max: 56 },
    { t: "CORRENDO", em: 3.7, estilo: "vermelho", anim: "letras" },
  ] },
  { id: "corrida", de: 4.79, ate: 7.82, x: 495, y: 1040, linhas: [
    { t: "INSCRIÇÕES PARA A", em: 4.79, estilo: "tag", max: 52 },
    { t: "2ª CORRIDA", em: 5.62, estilo: "mega" },
    { t: "START FITNESS", em: 6.9, estilo: "faixa", max: 130 },
  ] },
  { id: "vagas", de: 9.0, ate: 10.88, x: 495, y: 1120, linhas: [
    { t: "AS VAGAS ESTÃO", em: 9.0, estilo: "tag", max: 56 },
    { t: "VOANDO", em: 9.98, estilo: "mega", anim: "letras" },
  ] },
  { id: "dia", de: 10.92, ate: 14.5, x: 495, y: 1010, linhas: [
    { t: "DIA 1º", em: 10.98, estilo: "mega", max: 290 },
    { t: "DE NOVEMBRO", em: 11.44, estilo: "faixa", max: 140 },
    { t: "TODOS REUNIDOS NESSE NOVO DESAFIO", em: 12.2, estilo: "tag", max: 40 },
  ] },
  { id: "melhor", de: 14.52, ate: 15.74, x: 495, y: 1110, linhas: [
    { t: "E SABE O QUE É", em: 14.52, estilo: "tag", max: 60 },
    { t: "MELHOR?", em: 15.22, estilo: "vermelho" },
  ] },
  // 15,8 a 18,3: "são R$ 4.000 em premiação" vira contador de roleta (componente Contador)
  // 1, 2, 3: cada número em cima do SEU dedo, acompanhando (Talyta, 2026-10-28). O "1" segue o indicador do
  // começo ao fim; no "2" entra o 2 no segundo dedo (o 1 continua); no "3" entra o 3 no terceiro.
  // Pontas marcadas quadro a quadro (edicao/2026-10-corrida-2a-edicao/dedos.py); a base do número fica 24 px acima
  { id: "nao-e", de: 18.38, ate: 19.95, x: 495, y: 1180, linhas: [
    { t: "NÃO É", em: 18.38, estilo: "tag", max: 64 },
  ] },
  { id: "um", de: 18.5, ate: 19.95, x: 0, y: 0, larg: 110, rastreio: { trecho: "dedo-1", dx: 0, dy: -24, leve: 1, base: true }, linhas: [
    { t: "1", em: 18.6, estilo: "mega", max: 170 },
  ] },
  { id: "dois", de: 19.05, ate: 19.95, x: 0, y: 0, larg: 110, rastreio: { trecho: "dedo-2", dx: 0, dy: -24, leve: 1, base: true }, linhas: [
    { t: "2", em: 19.12, estilo: "mega", max: 170 },
  ] },
  { id: "tres", de: 19.6, ate: 19.95, x: 0, y: 0, larg: 110, rastreio: { trecho: "dedo-3", dx: 0, dy: -24, leve: 1, base: true }, linhas: [
    { t: "3", em: 19.66, estilo: "vermelho", max: 170 },
  ] },
  // 19,94 a 21,95: o prêmio tem componente próprio (Premio)
  { id: "acabou", de: 22.14, ate: 23.5, x: 495, y: 880, linhas: [
    { t: "TÁ ACHANDO QUE", em: 22.16, estilo: "tag", max: 60 },
    { t: "ACABOU?", em: 22.78, estilo: "vermelho", max: 250 },
  ] },
  // a fala aqui não é clara nem no original ("joga o kit"?): só entra o que é certo. [confirmar com a Talyta]
  { id: "kit", de: 24.4, ate: 25.36, x: 495, y: 1100, linhas: [
    { t: "O KIT!", em: 24.56, estilo: "faixa", max: 240 },
  ] },
  // distribuição do kit: coluna da esquerda, em cima da parede (o rosto fica no centro e a sacola embaixo)
  { id: "distribuicao", de: 27.5, ate: 36.24, x: 70, y: 262, larg: 330, alinha: "esq", linhas: [
    { t: "DISTRIBUIÇÃO", em: 31.5, estilo: "tagVermelho", max: 44 },
    { t: "DO KIT", em: 31.6, estilo: "tagVermelho", max: 44 },
    { t: "NESSA", em: 27.5, estilo: "tag", max: 40 },
    { t: "QUINTA", em: 27.5, estilo: "mega", max: 130 },
    { t: "DIA 29", em: 28.3, estilo: "mega", max: 130 },
    { t: "17H", em: 29.92, estilo: "vermelho", max: 250 },
  ], pulsos: [{ em: 33.76, linha: 5 }, { em: 35.12, linha: 3 }] },
  { id: "fim", de: 36.28, ate: 37.67, x: 70, y: 290, larg: 330, alinha: "esq", linhas: [
    { t: "ESPERAMOS", em: 36.3, estilo: "mega", max: 120 },
    { t: "VOCÊS!", em: 36.84, estilo: "faixa", max: 130 },
    { t: "2ª CORRIDA START FITNESS", em: 36.95, estilo: "tag", max: 28 },
    { t: "1º DE NOVEMBRO", em: 37.02, estilo: "tag", max: 28 },
  ] },
];

// selo carimbado em "abertas"
export const CARIMBO = { de: 7.86, ate: 8.4, x: 495, y: 1250, linhas: ["INSCRIÇÕES", "ABERTAS"] };
// cronômetro em "o tempo está correndo"
export const RELOGIO = { de: 3.02, ate: 4.7, x: 495, y: 1020 };
// rastro de velocidade em "voando"
export const VOANDO = { em: 9.98, ate: 10.88 };

// contador de roleta no 1º "R$ 4.000" (referência: tutorial de number counter no Cosmos, 2026-10-28).
// Cada dígito gira e trava em sequência no "4.000" (16,58–16,96 s); fica em cima da cabeça (topo dela em y ≈ 380)
export const CONTADOR = {
  de: 15.8, ate: 18.3, y: 180, tam: 150,
  partes: ["R$", " ", "4", ".", "0", "0", "0"],
  trava: [16.62, 16.74, 16.83, 16.92], // um tempo por dígito, na ordem
  premiacao: 17.4, // "em premiação" entra embaixo
};

// prêmio: "é R$ 4.000 em premiação" (estética do print "$30,000 Business": vermelho com brilho + manuscrita)
export const PREMIO = { de: 19.94, rs: 20.08, mil: 20.5, em: 21.0, ate: 21.95 };

// linhas de velocidade radiais (anime) nos momentos mais fortes
export const RAIOS: { em: number; dur: number }[] = [
  { em: 24.56, dur: 0.35 },
  { em: 10.98, dur: 0.3 },
];

// impactos extras na câmera (além de cada headline grande, que já gera o seu)
export const IMPACTOS: { em: number; forca: number }[] = [
  ...CORTES.map((em) => ({ em, forca: 0.7 })),
  { em: 7.86, forca: 0.9 },
  { em: 16.62, forca: 0.45 },
  { em: 16.92, forca: 0.35 },
  { em: 20.5, forca: 1.7 },
  { em: 37.28, forca: 0.6 },
];

export const SFX: { em: number; nome: string; vol?: number }[] = [
  // o "O" de "O seu próximo" sai junto com o começo: abertura só com grave baixo, sem chiado por cima
  { em: 1.0, nome: "hit", vol: 0.95 },
  { em: 1.62, nome: "whoosh-saida", vol: 0.55 },
  { em: 1.68, nome: "hit-leve", vol: 0.7 },
  { em: 2.25, nome: "hit", vol: 0.85 },
  { em: 3.02, nome: "relogio", vol: 0.75 },
  { em: 3.7, nome: "letras", vol: 0.7 },
  { em: 3.78, nome: "hit-leve", vol: 0.7 },
  { em: 4.62, nome: "whoosh", vol: 0.55 },
  { em: 4.79, nome: "hit", vol: 0.75 },
  { em: 5.62, nome: "hit", vol: 0.9 },
  { em: 6.9, nome: "hit", vol: 0.85 },
  { em: 7.86, nome: "carimbo", vol: 1.0 },
  { em: 8.36, nome: "whoosh-saida", vol: 0.5 },
  { em: 8.42, nome: "hit-leve", vol: 0.6 },
  { em: 9.0, nome: "swish", vol: 0.5 },
  { em: 9.9, nome: "whoosh-forte", vol: 0.85 },
  { em: 9.98, nome: "letras", vol: 0.7 },
  { em: 10.82, nome: "whoosh-saida", vol: 0.5 },
  { em: 10.92, nome: "boom-leve", vol: 0.85 },
  { em: 10.98, nome: "hit", vol: 0.9 },
  { em: 11.44, nome: "hit", vol: 0.75 },
  { em: 12.2, nome: "swish", vol: 0.4 },
  { em: 14.52, nome: "swish", vol: 0.5 },
  { em: 15.22, nome: "hit", vol: 0.95 },
  { em: 15.8, nome: "swish", vol: 0.45 },
  { em: 15.86, nome: "contador", vol: 0.75 },
  { em: 16.62, nome: "hit", vol: 0.8 },
  { em: 17.4, nome: "swish", vol: 0.5 },
  { em: 18.6, nome: "hit", vol: 0.95 },
  { em: 18.9, nome: "riser", vol: 0.85 },
  { em: 19.1, nome: "hit", vol: 0.95 },
  { em: 19.58, nome: "hit", vol: 1.0 },
  { em: 20.08, nome: "hit-leve", vol: 0.7 },
  { em: 20.43, nome: "dinheiro", vol: 1.0 },
  { em: 20.5, nome: "boom", vol: 1.0 },
  { em: 21.0, nome: "swish", vol: 0.6 },
  { em: 21.02, nome: "brilho", vol: 0.45 },
  { em: 21.86, nome: "whoosh-saida", vol: 0.6 },
  { em: 22.16, nome: "swish", vol: 0.5 },
  { em: 22.78, nome: "hit", vol: 0.95 },
  { em: 23.42, nome: "whoosh-saida", vol: 0.5 },
  // "joga o kit": a voz real vai de 24,4 a 25,0 s (medido na energia; a transcrição marcou antes) e sai mais
  // baixa. Só toques curtos e baixos; o impacto grande fica no corte pro preto e branco (25,38)
  { em: 24.04, nome: "hit-leve", vol: 0.3 },
  { em: 24.25, nome: "swish", vol: 0.25 },
  { em: 25.38, nome: "boom", vol: 0.8 },
  { em: 27.5, nome: "hit", vol: 0.8 },
  { em: 28.3, nome: "hit-leve", vol: 0.7 },
  { em: 29.92, nome: "hit", vol: 0.95 },
  { em: 31.5, nome: "hit-leve", vol: 0.7 },
  { em: 33.76, nome: "hit-leve", vol: 0.55 },
  { em: 35.12, nome: "hit-leve", vol: 0.55 },
  { em: 36.2, nome: "whoosh", vol: 0.55 },
  // "esperamos vocês" (36,30–37,04): o boom final espera a fala acabar
  { em: 36.3, nome: "hit", vol: 0.6 },
  { em: 36.84, nome: "hit-leve", vol: 0.35 },
  { em: 37.28, nome: "boom", vol: 0.85 },
  { em: 37.3, nome: "brilho", vol: 0.5 },
];
