// Plano da chamada da 2ª Corrida Start Fitness. Tempos em segundos do vídeo original (já cortado e com cor),
// tirados da transcrição palavra a palavra (edicao/2026-10-corrida-2a-edicao/analise/transcricao.json).

export type Estilo = "grande" | "faixa" | "apoio" | "vermelho";
export type Linha = { t: string; em: number; tam: number; estilo?: Estilo };
export type Bloco = {
  id: string;
  de: number;
  ate: number;
  x: number; // centro (alinha "centro") ou borda esquerda (alinha "esq")
  y: number; // topo do bloco
  alinha?: "centro" | "esq";
  linhas: Linha[];
  pulsos?: { em: number; linha: number }[]; // ênfase quando ele repete a informação
  rastreio?: { trecho: string; dx: number; dy: number; leve: number }; // segue a mão
};

export const TOTAL = 37.67;

// fala (palavras com folga): a música desce aqui e sobe nos respiros
export const FALA: [number, number][] = [
  [0.0, 23.0],
  [24.04, 24.92],
  [26.8, 37.04],
];

export const BLOCOS: Bloco[] = [
  { id: "desafio", de: 0.08, ate: 1.66, x: 540, y: 1150, linhas: [
    { t: "O SEU PRÓXIMO", em: 0.08, tam: 62, estilo: "apoio" },
    { t: "DESAFIO", em: 1.0, tam: 190 },
  ] },
  { id: "data", de: 1.68, ate: 2.98, x: 540, y: 1150, linhas: [
    { t: "JÁ TEM DATA", em: 1.68, tam: 112 },
    { t: "MARCADA", em: 2.2, tam: 138, estilo: "faixa" },
  ] },
  { id: "tempo", de: 3.02, ate: 4.66, x: 540, y: 1180, linhas: [
    { t: "O TEMPO ESTÁ", em: 3.06, tam: 62, estilo: "apoio" },
    { t: "CORRENDO", em: 3.7, tam: 160 },
  ] },
  { id: "corrida", de: 4.72, ate: 7.4, x: 540, y: 1100, linhas: [
    { t: "INSCRIÇÕES PARA A", em: 4.72, tam: 56, estilo: "apoio" },
    { t: "2ª CORRIDA", em: 5.62, tam: 150 },
    { t: "START FITNESS", em: 6.9, tam: 104, estilo: "faixa" },
  ] },
  { id: "vagas", de: 9.0, ate: 10.7, x: 540, y: 1150, linhas: [
    { t: "AS VAGAS ESTÃO", em: 9.0, tam: 62, estilo: "apoio" },
    { t: "VOANDO", em: 9.98, tam: 190 },
  ] },
  { id: "dia", de: 10.74, ate: 14.5, x: 540, y: 1080, linhas: [
    { t: "DIA 1º", em: 10.76, tam: 196 },
    { t: "DE NOVEMBRO", em: 11.36, tam: 108, estilo: "faixa" },
    { t: "TODOS REUNIDOS NESSE NOVO DESAFIO", em: 12.2, tam: 44, estilo: "apoio" },
  ] },
  { id: "melhor", de: 14.52, ate: 15.66, x: 540, y: 1150, linhas: [
    { t: "E SABE O QUE", em: 14.52, tam: 80 },
    { t: "É MELHOR?", em: 15.0, tam: 150, estilo: "vermelho" },
  ] },
  // a mão com 4 dedos: o texto acompanha a mão, leve
  { id: "quatro-mil", de: 15.8, ate: 18.3, x: 0, y: 0, rastreio: { trecho: "quatro-mil", dx: 120, dy: 240, leve: 0.6 }, linhas: [
    { t: "SÃO", em: 15.8, tam: 60, estilo: "apoio" },
    { t: "R$ 4 MIL", em: 16.55, tam: 140 },
    { t: "EM PREMIAÇÃO", em: 17.35, tam: 58, estilo: "faixa" },
  ] },
  { id: "um", de: 18.38, ate: 18.96, x: 0, y: 0, rastreio: { trecho: "um", dx: 40, dy: 250, leve: 0.65 }, linhas: [
    { t: "NÃO É", em: 18.38, tam: 54, estilo: "apoio" },
    { t: "1", em: 18.6, tam: 230 },
  ] },
  { id: "dois", de: 18.96, ate: 19.5, x: 0, y: 0, rastreio: { trecho: "dois", dx: 60, dy: 250, leve: 0.65 }, linhas: [
    { t: "NÃO É", em: 18.96, tam: 54, estilo: "apoio" },
    { t: "2", em: 19.1, tam: 230 },
  ] },
  { id: "tres", de: 19.5, ate: 19.95, x: 0, y: 0, rastreio: { trecho: "tres", dx: 60, dy: 230, leve: 0.65 }, linhas: [
    { t: "NÃO É", em: 19.5, tam: 54, estilo: "apoio" },
    { t: "3", em: 19.58, tam: 230 },
  ] },
  // 19,94 a 21,95: headline grande do prêmio (componente próprio, Premio.tsx)
  { id: "acabou", de: 22.14, ate: 23.5, x: 540, y: 900, linhas: [
    { t: "TÁ ACHANDO", em: 22.16, tam: 112 },
    { t: "QUE ACABOU?", em: 22.6, tam: 112, estilo: "faixa" },
  ] },
  { id: "kit", de: 24.02, ate: 25.46, x: 540, y: 1140, linhas: [
    { t: "JOGA", em: 24.04, tam: 120 },
    { t: "O KIT!", em: 24.56, tam: 180, estilo: "faixa" },
  ] },
  // distribuição do kit: coluna da esquerda, em cima da parede (o rosto fica no centro e a sacola embaixo)
  // largura máxima ~330 px (x 70–400): o rosto começa em x ≈ 400 nesses planos
  { id: "distribuicao", de: 26.8, ate: 36.24, x: 70, y: 262, alinha: "esq", linhas: [
    { t: "DISTRIBUIÇÃO", em: 31.5, tam: 44, estilo: "faixa" },
    { t: "DO KIT", em: 31.62, tam: 44, estilo: "faixa" },
    { t: "NESSA", em: 26.8, tam: 46, estilo: "apoio" },
    { t: "QUINTA", em: 27.46, tam: 88 },
    { t: "DIA 29", em: 28.3, tam: 88 },
    { t: "17H", em: 29.92, tam: 170, estilo: "vermelho" },
  ], pulsos: [{ em: 33.76, linha: 5 }, { em: 35.12, linha: 3 }] },
  { id: "fim", de: 36.28, ate: 37.67, x: 70, y: 300, alinha: "esq", linhas: [
    { t: "ESPERAMOS", em: 36.3, tam: 62 },
    { t: "VOCÊS!", em: 36.84, tam: 100, estilo: "faixa" },
    { t: "2ª CORRIDA START FITNESS", em: 36.95, tam: 28, estilo: "apoio" },
    { t: "1º DE NOVEMBRO", em: 37.02, tam: 28, estilo: "apoio" },
  ] },
];

// selo carimbado em "abertas"
export const CARIMBO = { de: 7.86, ate: 8.95, x: 540, y: 1250, linhas: ["INSCRIÇÕES", "ABERTAS"] };
// cronômetro em "o tempo está correndo"
export const RELOGIO = { de: 3.02, ate: 4.66, x: 540, y: 1040 };
// rastro de velocidade em "voando"
export const VOANDO = { em: 9.98, ate: 10.7 };

// prêmio: "é R$ 4.000 em premiação"
export const PREMIO = { de: 19.94, rs: 20.08, mil: 20.5, em: 20.98, ate: 21.95 };

// zoom de ênfase no vídeo (centro no rosto)
export const ZOOMS: { de: number; ate: number; z: number; cx?: number; cy?: number }[] = [
  { de: 1.0, ate: 1.66, z: 1.05 },
  { de: 7.86, ate: 8.95, z: 1.06 },
  { de: 10.76, ate: 12.0, z: 1.05 },
  { de: 16.5, ate: 17.75, z: 1.06, cy: 650 },
  { de: 24.5, ate: 25.4, z: 1.05 },
];

export const SFX: { em: number; nome: string; vol?: number }[] = [
  { em: 0.08, nome: "whoosh-curto", vol: 0.35 },
  { em: 0.98, nome: "whoosh", vol: 0.45 },
  { em: 1.66, nome: "whoosh-curto", vol: 0.35 },
  { em: 2.18, nome: "pop", vol: 0.5 },
  { em: 3.02, nome: "relogio", vol: 0.45 },
  { em: 3.66, nome: "whoosh", vol: 0.4 },
  { em: 4.7, nome: "whoosh-curto", vol: 0.35 },
  { em: 5.6, nome: "whoosh", vol: 0.45 },
  { em: 6.88, nome: "pop", vol: 0.5 },
  { em: 7.86, nome: "carimbo", vol: 0.75 },
  { em: 9.0, nome: "whoosh-curto", vol: 0.3 },
  { em: 9.9, nome: "whoosh-grave", vol: 0.6 },
  { em: 10.74, nome: "whoosh-curto", vol: 0.4 },
  { em: 11.34, nome: "pop", vol: 0.5 },
  { em: 14.5, nome: "whoosh-curto", vol: 0.35 },
  { em: 14.98, nome: "pop", vol: 0.5 },
  { em: 15.78, nome: "whoosh-curto", vol: 0.35 },
  { em: 16.53, nome: "pancada", vol: 0.55 },
  { em: 17.33, nome: "pop", vol: 0.45 },
  { em: 18.58, nome: "pancada", vol: 0.55 },
  { em: 19.08, nome: "pancada", vol: 0.55 },
  { em: 19.56, nome: "pancada", vol: 0.6 },
  { em: 20.06, nome: "whoosh-curto", vol: 0.45 },
  { em: 20.43, nome: "dinheiro", vol: 0.95 },
  { em: 20.5, nome: "impacto", vol: 0.8 },
  { em: 20.96, nome: "pop", vol: 0.5 },
  { em: 21.88, nome: "whoosh", vol: 0.4 },
  { em: 22.14, nome: "whoosh-curto", vol: 0.35 },
  { em: 22.58, nome: "pop", vol: 0.5 },
  { em: 24.02, nome: "whoosh", vol: 0.45 },
  { em: 24.54, nome: "impacto", vol: 0.45 },
  { em: 26.78, nome: "whoosh-curto", vol: 0.35 },
  { em: 27.44, nome: "pop", vol: 0.4 },
  { em: 28.28, nome: "pop", vol: 0.4 },
  { em: 29.9, nome: "pancada", vol: 0.5 },
  { em: 31.48, nome: "pop", vol: 0.45 },
  { em: 36.26, nome: "whoosh", vol: 0.4 },
  { em: 36.84, nome: "brilho", vol: 0.45 },
];
