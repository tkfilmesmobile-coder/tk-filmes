// Vídeo 2 de 2: entrevista "quais as expectativas pra 2ª Corrida" (2026-10-28). Tempos em segundos do vídeo JÁ
// CORTADO (public/midia/entrevista.mp4, montado por edicao/2026-10-entrevista-expectativas/cortar.py). As palavras
// com tempo estão em src/entrevista-edl.json. Mesma identidade do vídeo 1 (Anton inclinada, extrusão, tags, faixa).
import type { Bloco } from "../plano";
import edl from "../entrevista-edl.json";

export const VIDEO = (edl as { total: number }).total; // 74,1 s de entrevista
export const FIM = { de: VIDEO, ate: VIDEO + 1.9 }; // cartela final em cima do último quadro congelado
export const TOTAL = FIM.ate;

type Trecho = { de: number; ate: number; quem: string; papel: string };
export const TRECHOS = (edl as { trechos: Trecho[] }).trechos;
// emenda que abre pergunta (ou o convite) ganha luz vazando; troca de entrevistado, só um soco leve
export const CORTES = TRECHOS.slice(1).map((t) => ({ em: t.de, forte: t.papel.startsWith("p") || t.papel === "convite" }));

// fala: palavras com folga, juntando respiros menores que 0,7 s (a trilha só sobe em respiro de verdade)
const PAL = (edl as { palavras: { ini: number; fim: number }[] }).palavras;
export const FALA: [number, number][] = PAL.reduce<[number, number][]>((acc, w) => {
  const u = acc[acc.length - 1];
  if (u && w.ini - u[1] < 0.7) u[1] = w.fim;
  else acc.push([w.ini, w.fim]);
  return acc;
}, []);

export type BlocoE = Bloco & { pergunta?: number };

export const BLOCOS: BlocoE[] = [
  // ---------- abertura (apresentador) ----------
  { id: "edicao", de: 0.04, ate: 2.5, x: 495, y: 1080, linhas: [
    { t: "A SEGUNDA EDIÇÃO DA", em: 0.04, estilo: "tag", max: 50 },
    { t: "CORRIDA", em: 1.14, estilo: "mega", max: 260 },
    { t: "START FITNESS", em: 1.46, estilo: "faixa", max: 130 },
  ] },
  { id: "porta", de: 2.54, ate: 4.5, x: 495, y: 1120, linhas: [
    { t: "ESTÁ BATENDO", em: 2.56, estilo: "tag", max: 60 },
    { t: "NA PORTA", em: 3.12, estilo: "mega", max: 230 },
  ] },
  { id: "expectativas", de: 4.54, ate: 7.9, x: 495, y: 1080, linhas: [
    { t: "QUAIS SÃO AS", em: 4.56, estilo: "tag", max: 56 },
    { t: "EXPECTATIVAS", em: 5.14, estilo: "vermelho", anim: "letras" },
    { t: "DO PESSOAL?", em: 6.04, estilo: "faixa", max: 130 },
  ] },

  // ---------- pergunta 1: já se inscreveu? ----------
  { id: "p1", de: 7.94, ate: 11.36, x: 495, y: 1060, pergunta: 1, linhas: [
    { t: "PERGUNTA 01", em: 7.96, estilo: "tagVermelho", max: 50 },
    { t: "JÁ SE", em: 7.97, estilo: "mega", max: 200 },
    { t: "INSCREVEU?", em: 8.41, estilo: "mega" },
  ] },
  { id: "r1-nisse", de: 11.38, ate: 12.27, x: 495, y: 1150, linhas: [
    { t: "COM CERTEZA!", em: 11.41, estilo: "faixa", max: 150 },
  ] },
  { id: "r1-wendel", de: 12.5, ate: 16.3, x: 495, y: 1100, linhas: [
    { t: "ASSIM QUE", em: 12.76, estilo: "tag", max: 60 },
    { t: "LANÇOU", em: 13.16, estilo: "mega", max: 250 },
    { t: "JÁ ME INSCREVI", em: 13.66, estilo: "faixa", max: 120 },
  ] },
  { id: "r1-terceiro", de: 16.46, ate: 17.39, x: 495, y: 1150, linhas: [
    { t: "COM CERTEZA!", em: 16.49, estilo: "vermelho", max: 200 },
  ] },

  // ---------- pergunta 2: correu ano passado? ----------
  { id: "p2", de: 17.43, ate: 20.62, x: 495, y: 1060, pergunta: 2, linhas: [
    { t: "PERGUNTA 02", em: 17.45, estilo: "tagVermelho", max: 50 },
    { t: "E NO ANO", em: 17.62, estilo: "mega", max: 200 },
    { t: "PASSADO?", em: 18.34, estilo: "mega" },
  ] },
  { id: "r2-nisse", de: 20.98, ate: 22.39, x: 495, y: 1120, linhas: [
    { t: "INFELIZMENTE", em: 21.06, estilo: "tag", max: 56 },
    { t: "NÃO DEU", em: 21.54, estilo: "contorno", max: 230 },
  ] },
  { id: "r2-wendel", de: 22.6, ate: 26.9, x: 495, y: 1080, linhas: [
    { t: "PARTICIPEI", em: 22.65, estilo: "tag", max: 56 },
    { t: "MAIS ANSIOSO", em: 24.31, estilo: "mega" },
    { t: "PRA MELHORAR", em: 25.01, estilo: "faixa", max: 120 },
  ] },
  { id: "r2-terceiro", de: 27.0, ate: 29.35, x: 495, y: 1100, linhas: [
    { t: "SEGUNDO ANO", em: 27.51, estilo: "tag", max: 60 },
    { t: "A EXPECTATIVA", em: 28.19, estilo: "mega" },
    { t: "SÓ AUMENTA", em: 28.69, estilo: "faixa", max: 130 },
  ] },

  // ---------- pergunta 3: expectativas ----------
  { id: "p3", de: 29.39, ate: 32.96, x: 495, y: 1060, pergunta: 3, linhas: [
    { t: "PERGUNTA 03", em: 29.41, estilo: "tagVermelho", max: 50 },
    { t: "QUAIS SÃO AS SUAS", em: 31.0, estilo: "tag", max: 52 },
    { t: "EXPECTATIVAS?", em: 31.6, estilo: "mega" },
  ] },
  { id: "r3-melhores", de: 33.0, ate: 35.12, x: 495, y: 1150, linhas: [
    { t: "AS MELHORES", em: 33.02, estilo: "tag", max: 60 },
    { t: "POSSÍVEIS", em: 33.62, estilo: "mega", max: 230 },
  ] },
  { id: "r3-ansiosa", de: 35.16, ate: 36.8, x: 495, y: 1150, linhas: [
    { t: "MUITO", em: 35.2, estilo: "tag", max: 60 },
    { t: "ANSIOSA", em: 35.62, estilo: "vermelho", anim: "letras", max: 230 },
  ] },
  { id: "r3-roupinha", de: 36.84, ate: 39.14, x: 495, y: 1150, linhas: [
    { t: "A ROUPINHA JÁ ESTÁ", em: 36.88, estilo: "tag", max: 50 },
    { t: "GUARDADA", em: 38.16, estilo: "faixa", max: 150 },
  ] },
  { id: "r3-organizacao", de: 39.3, ate: 41.22, x: 495, y: 1080, linhas: [
    { t: "ANO PASSADO", em: 39.33, estilo: "tag", max: 56 },
    { t: "SUPER", em: 40.27, estilo: "mega", max: 200 },
    { t: "ORGANIZAÇÃO", em: 40.61, estilo: "faixa", max: 120 },
  ] },
  // o que ele lembra da 1ª edição: um item entra em cada fala, com plin subindo (dó, mi, sol)
  { id: "r3-lista", de: 41.26, ate: 47.8, x: 495, y: 1100, linhas: [
    { t: "✓ FISIOTERAPIA", em: 42.21, estilo: "tag", max: 54 },
    { t: "✓ ÁGUA DE COCO", em: 44.01, estilo: "tag", max: 54 },
    { t: "✓ MESA DE FRUTAS", em: 46.89, estilo: "tagVermelho", max: 54 },
  ] },
  // 47,85 a 51,8: "mais premiações, mais dinheiro" tem componente próprio (Dinheiro)
  { id: "r3-empolgacao", de: 50.62, ate: 51.78, x: 495, y: 1430, linhas: [
    { t: "A EMPOLGAÇÃO SÓ AUMENTA", em: 50.67, estilo: "tag", max: 40 },
  ] },

  // ---------- pergunta 4: pódio ou diversão? ----------
  { id: "p4", de: 51.82, ate: 57.7, x: 495, y: 1060, pergunta: 4, linhas: [
    { t: "PERGUNTA 04", em: 51.84, estilo: "tagVermelho", max: 50 },
    { t: "VAI DISPUTAR", em: 53.14, estilo: "tag", max: 56 },
    { t: "PÓDIO", em: 54.96, estilo: "mega", max: 250 },
    { t: "OU DIVERSÃO?", em: 55.6, estilo: "faixa", max: 130 },
  ] },
  { id: "r4-wendel", de: 57.76, ate: 60.88, x: 495, y: 1080, linhas: [
    { t: "MINHA META:", em: 57.76, estilo: "tag", max: 56 },
    { t: "NO MÍNIMO O", em: 59.0, estilo: "tag", max: 56 },
    { t: "10º LUGAR", em: 59.66, estilo: "vermelho", max: 250 },
  ] },
  { id: "r4-terceiro", de: 61.1, ate: 62.98, x: 495, y: 1150, linhas: [
    { t: "VAMOS", em: 61.91, estilo: "mega", max: 220 },
    { t: "TENTAR!", em: 62.43, estilo: "faixa", max: 160 },
  ] },

  // ---------- convite (apresentador pra câmera) ----------
  { id: "e-voce", de: 63.2, ate: 65.44, x: 495, y: 1100, linhas: [
    { t: "E VOCÊ?", em: 63.22, estilo: "mega", max: 260 },
    { t: "JÁ FEZ A SUA INSCRIÇÃO?", em: 64.34, estilo: "tagVermelho", max: 44 },
  ] },
  { id: "de-fora", de: 66.9, ate: 70.96, x: 495, y: 1080, linhas: [
    { t: "QUEM CORREU A 1ª EDIÇÃO", em: 66.96, estilo: "tag", max: 44 },
    { t: "NÃO FICA", em: 69.08, estilo: "mega", max: 230 },
    { t: "DE FORA!", em: 69.9, estilo: "faixa", max: 150 },
  ] },
  { id: "vem", de: 71.0, ate: VIDEO, x: 495, y: 1080, linhas: [
    { t: "VEM", em: 71.02, estilo: "mega", max: 260 },
    { t: "FAZER PARTE", em: 71.96, estilo: "faixa", max: 140 },
    { t: "DESSA EXPERIÊNCIA", em: 72.94, estilo: "tag", max: 50 },
  ] },
];

// "mais premiações, mais dinheiro": estética do prêmio aprovado no vídeo 1 (manuscrita branca + vermelho com
// brilho + dinheiro voando pros lados)
export const DINHEIRO = { de: 49.25, premiacoes: 49.29, dinheiro: 50.19, ate: 50.6 };

// raios radiais nos momentos de pico
export const RAIOS: { em: number; dur: number }[] = [
  { em: 59.66, dur: 0.35 },
  { em: 50.19, dur: 0.3 },
];

export const IMPACTOS: { em: number; forca: number }[] = [
  ...CORTES.map((c) => ({ em: c.em, forca: c.forte ? 0.7 : 0.35 })),
  { em: 50.19, forca: 1.4 },
  { em: 59.66, forca: 0.9 },
  { em: FIM.de + 0.05, forca: 1.0 },
];

// cada momento com o seu som (regra da Talyta, 2026-10-28: nada de efeito igual pra tudo). Pancada forte só
// em respiro ou junto de começo de headline; nada em cima de palavra baixa.
export const SFX: { em: number; nome: string; vol?: number }[] = [
  // abertura: tambor no CORRIDA, anilha no START FITNESS, duas batidas na porta no respiro depois de "porta"
  { em: 1.14, nome: "tambor", vol: 0.55 },
  { em: 1.46, nome: "metal", vol: 0.45 },
  { em: 3.47, nome: "porta", vol: 0.75 },
  { em: 5.14, nome: "letras", vol: 0.3 },
  { em: 6.04, nome: "caixa", vol: 0.35 },
  // perguntas: whoosh na emenda + pancada no cartão (cada uma com um timbre diferente)
  { em: 7.86, nome: "whoosh", vol: 0.45 },
  { em: 7.97, nome: "hit", vol: 0.45 },
  { em: 17.36, nome: "whoosh", vol: 0.45 },
  { em: 17.45, nome: "caixa", vol: 0.45 },
  { em: 29.32, nome: "whoosh", vol: 0.45 },
  { em: 31.6, nome: "tambor", vol: 0.45 },
  { em: 51.75, nome: "whoosh", vol: 0.45 },
  { em: 54.96, nome: "tiro", vol: 0.4 },
  // respostas
  { em: 11.41, nome: "palmas", vol: 0.4 },
  { em: 12.3, nome: "swish", vol: 0.3 },
  { em: 13.16, nome: "hit-leve", vol: 0.4 },
  { em: 16.36, nome: "swish", vol: 0.3 },
  { em: 16.49, nome: "carimbo", vol: 0.45 },
  { em: 22.2, nome: "arranhao", vol: 0.4 }, // depois do "não deu" (em 21,95 abafava o "deu")
  { em: 22.42, nome: "swish", vol: 0.3 },
  { em: 24.31, nome: "relogio", vol: 0.4 }, // ansioso: relógio correndo
  { em: 25.01, nome: "passos", vol: 0.45 },
  { em: 27.51, nome: "dois", vol: 0.6 }, // segundo ano: o plin do "2"
  { em: 28.69, nome: "boom-leve", vol: 0.45 },
  { em: 33.62, nome: "sino", vol: 0.35 },
  { em: 35.62, nome: "letras", vol: 0.3 },
  { em: 38.16, nome: "pagina", vol: 0.5 },
  { em: 39.2, nome: "swish", vol: 0.3 },
  { em: 40.27, nome: "hit", vol: 0.4 },
  { em: 42.21, nome: "um", vol: 0.6 },
  { em: 44.01, nome: "dois", vol: 0.6 },
  { em: 46.89, nome: "tres", vol: 0.65 },
  // mais premiações (brilho na manuscrita) · mais dinheiro (caixa registradora + boom)
  { em: 49.29, nome: "brilho", vol: 0.4 },
  { em: 50.12, nome: "dinheiro", vol: 0.85 },
  { em: 50.19, nome: "boom", vol: 0.65 },
  { em: 57.76, nome: "obturador", vol: 0.45 },
  { em: 59.66, nome: "boom-leve", vol: 0.6 },
  { em: 60.92, nome: "swish", vol: 0.3 },
  { em: 61.91, nome: "palmas", vol: 0.35 },
  // convite
  { em: 62.95, nome: "whoosh-forte", vol: 0.45 },
  { em: 63.22, nome: "hit", vol: 0.45 },
  { em: 69.08, nome: "caixa", vol: 0.45 },
  { em: 69.9, nome: "tambor", vol: 0.5 },
  { em: 71.02, nome: "hit-leve", vol: 0.4 },
  // cartela final (depois da fala): carimbo das inscrições + apito + boom
  { em: FIM.de + 0.05, nome: "carimbo", vol: 0.9 },
  { em: FIM.de + 0.1, nome: "boom", vol: 0.6 },
  { em: FIM.de + 0.6, nome: "apito", vol: 0.45 },
];
