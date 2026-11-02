// Vídeo do feed da 2ª Corrida Start Fitness (1º/11/2026). Tempos em segundos do vídeo-base JÁ CORTADO
// (public/midia/feed.mp4, montado por edicao/2026-11-corrida-feed/montar.py; palavras e planos em src/feed-edl.json).
// Mesma identidade dos dois vídeos aprovados: Anton inclinada com extrusão, tags Barlow, faixa vermelha, manuscrita
// Kaushan com brilho nos momentos de emoção.
import type { Linha } from "../plano";
import edl from "../feed-edl.json";

type Imagem = { de: number; ate: number; fonte: string; tipo: string };
type Trecho = { id: string; de: number; ate: number; imagens: Imagem[]; som: unknown };
export const TRECHOS = (edl as { trechos: Trecho[] }).trechos;
export const VIDEO = (edl as { total: number }).total; // 83,94 s
export const FIM = { de: VIDEO, ate: VIDEO + 2.6 };
export const TOTAL = FIM.ate;
const T = (id: string) => TRECHOS.find((t) => t.id === id)!;

// todo corte de imagem (troca de plano), pra luz vazando / soco de câmera
export const CORTES = TRECHOS.flatMap((t) => t.imagens.map((im) => ({ em: im.de, forte: im.de === t.de })).filter((c) => c.em > 0.05));
// fotos (aproximação feita no corte; aqui ganham flash de câmera)
export const FOTOS = TRECHOS.flatMap((t) => t.imagens.filter((im) => im.tipo === "f").map((im) => im.de));

const PAL = (edl as { palavras: { ini: number; fim: number }[] }).palavras;
export const FALA: [number, number][] = PAL.reduce<[number, number][]>((acc, w) => {
  const u = acc[acc.length - 1];
  if (u && w.ini - u[1] < 0.7) u[1] = w.fim;
  else acc.push([w.ini, w.fim]);
  return acc;
}, []);

// contagem: tempo de cada grito no vídeo montado (início de cada grito na forma de onda do IMG_0867; a multidão
// grita "...cinco, quatro, três, dois, LARGOU!", sem o "um")
const C0 = T("contagem").de - 5.85;
export const CONTAGEM = { numeros: [["5", 6.2], ["4", 7.6], ["3", 9.15], ["2", 10.65]].map(([n, t]) => ({ n: n as string, em: C0 + (t as number) })), largou: C0 + 11.8 };

export type BlocoF = {
  id: string; de: number; ate: number; x: number; y: number; larg?: number;
  livre?: boolean; // plano sem rosto relevante (multidão, B-roll): não desce por causa de rosto
  linhas: Linha[];
  escrita?: { t: string; em: number; cor?: "branco" | "vermelho"; tam?: number }; // manuscrita que "se escreve"
};

export const BLOCOS: BlocoF[] = [
  // abertura: o 621 de joelhos na chegada (flash-forward) + título lá em cima, no céu
  { id: "titulo", de: 0.0, ate: 1.22, x: 495, y: 300, livre: true, linhas: [
    { t: "1º DE NOVEMBRO · 2026", em: 0.02, estilo: "tag", max: 46 },
    { t: "2ª CORRIDA", em: 0.1, estilo: "mega", max: 230 },
    { t: "START FITNESS", em: 0.42, estilo: "faixa", max: 120 },
  ] },
  { id: "energia", de: 1.27, ate: 3.78, x: 495, y: 1120, livre: true, linhas: [
    { t: "UMA CORRIDA,", em: 1.27, estilo: "tag", max: 60 },
    { t: "MUITA ENERGIA", em: 1.87, estilo: "mega" },
    { t: "E SUPERAÇÃO", em: 2.97, estilo: "faixa", max: 130 },
  ] },
  { id: "acompanha", de: 4.0, ate: 7.52, x: 495, y: 1100, linhas: [
    { t: "ACOMPANHA COM A GENTE A", em: 4.03, estilo: "tag", max: 44 },
    { t: "2ª EDIÇÃO", em: 5.29, estilo: "mega", max: 260 },
    { t: "CORRIDA START FITNESS", em: 6.07, estilo: "faixa", max: 96 },
  ] },
  { id: "aquecimento", de: 8.58, ate: 10.72, x: 495, y: 1400, livre: true, linhas: [
    { t: "AQUECIMENTO", em: 8.6, estilo: "tagVermelho", max: 64 },
  ] },
  // Gabriel: o que fez ele voltar
  { id: "voltar", de: 10.8, ate: 15.9, x: 495, y: 1150, linhas: [
    { t: "O QUE FEZ VOCÊ VOLTAR?", em: 10.8, estilo: "tagVermelho", max: 48 },
    { t: "ORGANIZAÇÃO", em: 13.74, estilo: "mega" },
  ] },
  { id: "percurso-def", de: 15.98, ate: 19.82, x: 495, y: 1150, linhas: [
    { t: "PERCURSO BEM DEFINIDO", em: 17.12, estilo: "tag", max: 52 },
    { t: "SEM ERROS", em: 18.78, estilo: "vermelho", max: 250 },
  ] },
  { id: "nervoso", de: 21.95, ate: 24.08, x: 495, y: 1150, linhas: [
    { t: "SEMPRE BATE AQUELE", em: 22.03, estilo: "tag", max: 56 },
    { t: "NERVOSO", em: 22.79, estilo: "vermelho", anim: "letras" },
  ] },
  { id: "hora-largada", de: 24.1, ate: 25.08, x: 495, y: 1250, livre: true, linhas: [
    { t: "NA HORA DA", em: 24.1, estilo: "tag", max: 60 },
    { t: "LARGADA", em: 24.1, estilo: "mega" },
  ] },
  // 25,1 a 32,85: contagem (componente Contagem) e LARGOU!
  { id: "km", de: 32.9, ate: 37.38, x: 495, y: 1300, livre: true, linhas: [
    { t: "5 KM · 10 KM", em: 32.9, estilo: "tag", max: 60 },
    { t: "PERCURSO", em: 33.27, estilo: "mega", max: 260 },
  ] },
  // chegada do 621: o locutor anuncia
  { id: "primeiro", de: 39.75, ate: 44.7, x: 495, y: 1340, livre: true, linhas: [
    { t: "O PRIMEIRO A CHEGAR", em: 39.77, estilo: "tagVermelho", max: 70 },
  ] },
  { id: "adriano", de: 45.25, ate: 47.26, x: 495, y: 1330, livre: true, linhas: [
    { t: "ADRIANO BARBOSA", em: 45.29, estilo: "faixa", max: 110 },
    { t: "PARABÉNS!", em: 46.47, estilo: "vermelho", max: 230 },
  ] },
  // campeã dos 5 km
  { id: "vencedora", de: 50.5, ate: 52.86, x: 495, y: 1250, livre: true, linhas: [
    { t: "VENCEDORA", em: 50.51, estilo: "mega" },
    { t: "DOS 5 KM", em: 51.63, estilo: "faixa", max: 150 },
  ] },
  { id: "mais-rapido", de: 52.9, ate: 56.93, x: 495, y: 1180, linhas: [
    { t: "A MULHER QUE CHEGOU", em: 52.91, estilo: "tag", max: 52 },
    { t: "MAIS RÁPIDO", em: 54.13, estilo: "vermelho" },
  ] },
  { id: "dedico", de: 60.05, ate: 62.93, x: 495, y: 1150, linhas: [
    { t: "EU DEDICO AO MEU FILHO", em: 60.07, estilo: "tag", max: 48 },
  ], escrita: { t: "mãe atleta", em: 61.95, cor: "branco", tam: 150 } },
  { id: "cuidar", de: 63.7, ate: 67.84, x: 495, y: 1150, linhas: [
    { t: "A CORRIDA START FITNESS", em: 63.76, estilo: "tag", max: 46 },
    { t: "SABE CUIDAR", em: 66.44, estilo: "mega" },
    { t: "DA GALERA", em: 67.44, estilo: "faixa", max: 140 },
  ] },
  { id: "fisio", de: 69.0, ate: 70.66, x: 495, y: 1250, livre: true, linhas: [
    { t: "FISIOTERAPIA", em: 69.8, estilo: "faixa", max: 130 },
  ] },
  { id: "teve-tudo", de: 72.66, ate: 74.8, x: 495, y: 1250, livre: true, linhas: [
    { t: "TEVE TUDO", em: 72.99, estilo: "mega", max: 260 },
    { t: "E MAIS UM POUCO", em: 74.15, estilo: "faixa", max: 120 },
  ] },
  { id: "expectativas", de: 74.87, ate: 76.7, x: 495, y: 1180, linhas: [
    { t: "SUPEROU TODAS AS", em: 74.87, estilo: "tag", max: 56 },
    { t: "EXPECTATIVAS", em: 75.99, estilo: "vermelho", anim: "letras" },
  ] },
  { id: "banana", de: 76.75, ate: 78.92, x: 495, y: 1180, linhas: [
    { t: "NÃO É SÓ", em: 76.75, estilo: "tag", max: 60 },
    { t: "MEDALHA", em: 77.87, estilo: "mega", max: 250 },
    { t: "E BANANA!", em: 78.39, estilo: "faixa", max: 140 },
  ] },
  { id: "gratidao", de: 79.7, ate: 81.46, x: 495, y: 1150, linhas: [
    { t: "UM SENTIMENTO DE", em: 79.77, estilo: "tag", max: 56 },
  ], escrita: { t: "gratidão", em: 80.29, cor: "vermelho", tam: 170 } },
  { id: "presente", de: 81.52, ate: 83.92, x: 495, y: 1300, livre: true, linhas: [
    { t: "VER O PESSOAL", em: 81.52, estilo: "tag", max: 60 },
    { t: "AQUI PRESENTE", em: 83.21, estilo: "faixa", max: 130 },
  ] },
];

export const RAIOS: { em: number; dur: number; cy?: number }[] = [
  { em: CONTAGEM.largou, dur: 0.45, cy: 900 },
  { em: 44.77, dur: 0.4, cy: 1100 }, // ele cai de joelhos na chegada
];

export const IMPACTOS: { em: number; forca: number }[] = [
  ...CORTES.map((c) => ({ em: c.em, forca: c.forte ? 0.55 : 0.3 })),
  ...CONTAGEM.numeros.map((c) => ({ em: c.em, forca: 0.6 })),
  { em: CONTAGEM.largou, forca: 1.7 },
  { em: 44.77, forca: 1.1 },
  { em: 0.02, forca: 1.2 },
  { em: FIM.de + 0.05, forca: 1.0 },
];

// cada momento com o seu som (regra da Talyta: nada de efeito igual pra tudo); efeito em cima de fala, só baixo
export const SFX: { em: number; nome: string; vol?: number }[] = [
  { em: 0.02, nome: "boom", vol: 0.85 },
  { em: 0.1, nome: "tambor", vol: 0.6 },
  { em: 0.42, nome: "metal", vol: 0.45 },
  { em: 1.15, nome: "whoosh", vol: 0.45 },
  { em: 1.87, nome: "hit-leve", vol: 0.3 },
  { em: 2.97, nome: "caixa", vol: 0.3 },
  // (sem anilha no "START FITNESS" de 6,07: a cauda dela cobria o "-ness"; curadoria 2026-11-01)
  { em: 5.29, nome: "tambor", vol: 0.25 },
  // ponte em B-roll (sem fala): cortes no ritmo
  { em: 7.5, nome: "whoosh-forte", vol: 0.5 },
  { em: 8.55, nome: "passos", vol: 0.45 },
  { em: 9.72, nome: "swish", vol: 0.4 },
  { em: 10.7, nome: "whoosh", vol: 0.35 },
  { em: 13.74, nome: "hit", vol: 0.3 },
  { em: 18.78, nome: "carimbo", vol: 0.35 },
  { em: 22.79, nome: "relogio", vol: 0.35 },
  { em: 23.9, nome: "riser", vol: 0.55 },
  { em: 24.1, nome: "boom-leve", vol: 0.45 },
  // contagem: pancada baixa em cada número, largada com tiro + boom
  ...CONTAGEM.numeros.map((c) => ({ em: c.em, nome: "hit-leve", vol: 0.3 })),
  { em: CONTAGEM.largou, nome: "tiro", vol: 0.75 },
  { em: CONTAGEM.largou + 0.02, nome: "boom", vol: 0.85 },
  // fotos do percurso: clique de câmera em cada uma
  ...[32.85, 33.27, 33.69, 34.11, 34.53, 34.95, 35.37, 35.79].map((em) => ({ em, nome: "obturador", vol: 0.35 })),
  { em: 36.15, nome: "whoosh", vol: 0.4 },
  { em: 37.35, nome: "whoosh-saida", vol: 0.35 },
  { em: 39.77, nome: "tambor", vol: 0.35 },
  { em: 44.77, nome: "boom", vol: 0.7 },
  { em: 44.8, nome: "brilho", vol: 0.35 },
  { em: 46.47, nome: "palmas", vol: 0.45 },
  { em: 47.29, nome: "obturador", vol: 0.45 },
  { em: 48.55, nome: "swish", vol: 0.3 },
  { em: 50.51, nome: "hit", vol: 0.3 },
  { em: 52.89, nome: "obturador", vol: 0.5 },
  { em: 52.95, nome: "sino", vol: 0.3 },
  { em: 61.95, nome: "brilho", vol: 0.45 },
  { em: 66.44, nome: "caixa", vol: 0.3 },
  { em: 67.84, nome: "swish", vol: 0.35 },
  { em: 69.8, nome: "hit-leve", vol: 0.3 },
  { em: 72.6, nome: "swish", vol: 0.3 },
  { em: 73.7, nome: "metal", vol: 0.3 },
  { em: 75.99, nome: "boom-leve", vol: 0.35 },
  { em: 77.87, nome: "hit-leve", vol: 0.3 },
  { em: 80.29, nome: "brilho", vol: 0.4 },
  // (sem clique na foto de 81,49: caía em cima do "Ver o pessoal")
  // cartela final
  { em: FIM.de + 0.05, nome: "carimbo", vol: 0.9 },
  { em: FIM.de + 0.1, nome: "boom", vol: 0.6 },
  { em: FIM.de + 0.6, nome: "apito", vol: 0.45 },
];
