// Vídeo do feed da 2ª Corrida Start Fitness (1º/11/2026), v2. O vídeo-base cortado é public/midia/feed.mp4
// (edicao/2026-11-corrida-feed/montar.py; trechos, planos e palavras em src/feed-edl.json).
// Os tempos daqui são ANCORADOS NO CLIPE ORIGINAL: w("trecho", segundo_no_clipe) vira o tempo no vídeo montado.
// Assim, se um corte muda (v2: frases inteiras, Talyta 2026-11-01), headlines e efeitos acompanham sozinhos.
// Mesma identidade dos dois vídeos aprovados: Anton inclinada com extrusão, tags Barlow, faixa vermelha, manuscrita
// Kaushan com brilho nos momentos de emoção.
import type { Linha } from "../plano";
import edl from "../feed-edl.json";

type Imagem = { de: number; ate: number; fonte: string; tipo: string };
type Trecho = { id: string; de: number; ate: number; imagens: Imagem[]; som: [string, number, number] | null };
export const TRECHOS = (edl as { trechos: Trecho[] }).trechos;
export const VIDEO = (edl as { total: number }).total;
export const FIM = { de: VIDEO, ate: VIDEO + 2.6 };
export const TOTAL = FIM.ate;
const T = (id: string) => TRECHOS.find((t) => t.id === id)!;
// a transcrição marca as palavras uns 0,1–0,3 s cedo: a headline entra um pouco depois do início marcado
const w = (id: string, src: number) => T(id).de + (src - T(id).som![1]) + 0.1;
const img = (id: string, k: number) => T(id).imagens[k].de;
const fim = (id: string) => T(id).ate - 0.03;

export const CORTES = TRECHOS.flatMap((t) => t.imagens.map((im) => ({ em: im.de, forte: im.de === t.de })).filter((c) => c.em > 0.05));
export const FOTOS = TRECHOS.flatMap((t) => t.imagens.filter((im) => im.tipo === "f").map((im) => im.de));

const PAL = (edl as { palavras: { ini: number; fim: number }[] }).palavras;
export const FALA: [number, number][] = PAL.reduce<[number, number][]>((acc, p) => {
  const u = acc[acc.length - 1];
  if (u && p.ini - u[1] < 0.7) u[1] = p.fim;
  else acc.push([p.ini, p.fim]);
  return acc;
}, []);
// fim de cada trecho falado (a voz vai até o corte, que agora é o fim real da frase)
export const FIM_FALA = TRECHOS.filter((t) => t.som).map((t) => [t.de, t.ate] as [number, number]);

// contagem: início de cada grito na forma de onda do IMG_0867 ("...cinco, quatro, três, dois, LARGOU!", sem o "um")
const C0 = T("contagem").de - 5.85;
export const CONTAGEM = { numeros: [["5", 6.2], ["4", 7.6], ["3", 9.15], ["2", 10.65]].map(([n, t]) => ({ n: n as string, em: C0 + (t as number) })), largou: C0 + 11.8 };
// o 621 cai de joelhos na chegada (IMG_0871, 8,1 s)
export const JOELHOS = T("chegada").de + (8.1 - T("chegada").som![1]);

export type BlocoF = {
  id: string; de: number; ate: number; x: number; y: number; larg?: number;
  livre?: boolean; // plano sem rosto relevante (multidão, B-roll): não desce por causa de rosto
  linhas: Linha[];
  escrita?: { t: string; em: number; cor?: "branco" | "vermelho"; tam?: number };
};

export const BLOCOS: BlocoF[] = [
  // abertura: o 621 de joelhos na chegada (flash-forward) + título no céu
  { id: "titulo", de: 0.0, ate: T("abre").ate - 0.03, x: 495, y: 300, livre: true, linhas: [
    { t: "1º DE NOVEMBRO · 2026", em: 0.02, estilo: "tag", max: 46 },
    { t: "2ª CORRIDA", em: 0.1, estilo: "mega", max: 230 },
    { t: "START FITNESS", em: 0.42, estilo: "faixa", max: 120 },
  ] },
  { id: "energia", de: T("gancho").de + 0.02, ate: w("gancho", 2.62), x: 495, y: 1120, livre: true, linhas: [
    { t: "UMA CORRIDA,", em: T("gancho").de + 0.02, estilo: "tag", max: 60 },
    { t: "MUITA ENERGIA", em: w("gancho", 0.62), estilo: "mega" },
    { t: "E SUPERAÇÃO", em: w("gancho", 1.72), estilo: "faixa", max: 130 },
  ] },
  { id: "acompanha", de: w("gancho", 2.7), ate: fim("gancho"), x: 495, y: 1100, linhas: [
    { t: "ACOMPANHA COM A GENTE A", em: w("gancho", 2.78), estilo: "tag", max: 44 },
    { t: "2ª EDIÇÃO", em: w("gancho", 4.04), estilo: "mega", max: 260 },
    { t: "CORRIDA START FITNESS", em: w("gancho", 4.82), estilo: "faixa", max: 96 },
  ] },
  { id: "aquecimento", de: img("ponte", 1) + 0.03, ate: fim("ponte"), x: 495, y: 1400, livre: true, linhas: [
    { t: "AQUECIMENTO", em: img("ponte", 1) + 0.05, estilo: "tagVermelho", max: 64 },
  ] },
  // Gabriel: o que fez ele voltar
  { id: "voltar", de: T("organizacao").de + 0.05, ate: img("organizacao", 1) - 0.03, x: 495, y: 1150, linhas: [
    { t: "O QUE FEZ VOCÊ VOLTAR?", em: T("organizacao").de + 0.05, estilo: "tagVermelho", max: 48 },
    { t: "ORGANIZAÇÃO", em: w("organizacao", 17.84), estilo: "mega" },
  ] },
  { id: "percurso-def", de: img("organizacao", 1) + 0.03, ate: fim("organizacao"), x: 495, y: 1150, linhas: [
    { t: "PERCURSO BEM DEFINIDO", em: w("organizacao", 21.22), estilo: "tag", max: 52 },
    { t: "SEM ERROS", em: w("organizacao", 22.88), estilo: "vermelho", max: 250 },
  ] },
  { id: "nervoso", de: w("nervoso", 66.7), ate: fim("nervoso"), x: 495, y: 1150, linhas: [
    { t: "SEMPRE BATE AQUELE", em: w("nervoso", 66.78), estilo: "tag", max: 56 },
    { t: "NERVOSO", em: w("nervoso", 67.54), estilo: "vermelho", anim: "letras" },
  ] },
  { id: "hora-largada", de: T("alinhados").de, ate: fim("alinhados"), x: 495, y: 1250, livre: true, linhas: [
    { t: "NA HORA DA", em: T("alinhados").de, estilo: "tag", max: 60 },
    { t: "LARGADA", em: T("alinhados").de, estilo: "mega" },
  ] },
  // contagem: componente Contagem
  { id: "km", de: T("percurso").de + 0.05, ate: fim("percurso"), x: 495, y: 1300, livre: true, linhas: [
    { t: "5 KM · 10 KM", em: T("percurso").de + 0.05, estilo: "tag", max: 60 },
    { t: "PERCURSO", em: img("percurso", 1), estilo: "mega", max: 260 },
  ] },
  // chegada do 621: o locutor anuncia
  { id: "primeiro", de: w("chegada", 3.1), ate: JOELHOS - 0.05, x: 495, y: 1340, livre: true, linhas: [
    { t: "O PRIMEIRO A CHEGAR", em: w("chegada", 3.1), estilo: "tagVermelho", max: 70 },
  ] },
  { id: "adriano", de: w("chegada", 8.55), ate: w("chegada", 10.5), x: 495, y: 1330, livre: true, linhas: [
    { t: "ADRIANO BARBOSA", em: w("chegada", 8.62), estilo: "faixa", max: 110 },
    { t: "PARABÉNS!", em: w("chegada", 9.8), estilo: "vermelho", max: 230 },
  ] },
  { id: "palmas", de: w("chegada", 10.55), ate: fim("chegada"), x: 495, y: 1380, livre: true, linhas: [
    { t: "CADÊ AS PALMAS?", em: w("chegada", 10.58), estilo: "tag", max: 64 },
  ] },
  // campeã dos 5 km
  { id: "vencedora", de: w("campea", 1.85), ate: img("campea", 2) - 0.03, x: 495, y: 1250, livre: true, linhas: [
    { t: "VENCEDORA", em: w("campea", 1.92), estilo: "mega" },
    { t: "DOS 5 KM", em: w("campea", 3.24), estilo: "faixa", max: 150 },
  ] },
  { id: "mais-rapido", de: img("campea", 2) + 0.02, ate: fim("campea"), x: 495, y: 1180, linhas: [
    { t: "A MULHER QUE CHEGOU", em: w("campea", 4.8), estilo: "tag", max: 52 },
    { t: "MAIS RÁPIDO", em: w("campea", 5.78), estilo: "vermelho" },
  ] },
  { id: "podio", de: T("dedica").de + 0.15, ate: w("dedica", 74.6), x: 495, y: 1150, linhas: [
    { t: "EU QUERO AGRADECER A DEUS", em: T("dedica").de + 0.15, estilo: "tag", max: 46 },
    { t: "PELO PÓDIO", em: w("dedica", 73.42) + 0.2, estilo: "faixa", max: 150 },
  ] },
  { id: "dedico", de: w("dedica", 77.9), ate: fim("dedica"), x: 495, y: 1150, linhas: [
    { t: "EU DEDICO AO MEU FILHO", em: w("dedica", 78.06), estilo: "tag", max: 48 },
  ], escrita: { t: "mãe atleta", em: w("dedica", 79.98) + 0.1, cor: "branco", tam: 150 } },
  { id: "cuidar", de: w("cuidar", 0.75), ate: img("cuidar", 1) - 0.03, x: 495, y: 1150, linhas: [
    { t: "A CORRIDA START FITNESS", em: w("cuidar", 0.8), estilo: "tag", max: 46 },
    { t: "SABE CUIDAR", em: w("cuidar", 3.48), estilo: "mega" },
    { t: "DA GALERA", em: w("cuidar", 4.48), estilo: "faixa", max: 140 },
  ] },
  { id: "fisio", de: img("cuidar", 1) + 0.03, ate: fim("cuidar"), x: 495, y: 1250, livre: true, linhas: [
    { t: "FISIOTERAPIA", em: w("cuidar", 6.84) + 0.15, estilo: "faixa", max: 130 },
  ] },
  // Catiana: a resposta inteira
  { id: "diferencial", de: T("catiana").de + 0.03, ate: img("catiana", 1) - 0.03, x: 495, y: 1180, linhas: [
    { t: "QUAL O DIFERENCIAL?", em: T("catiana").de + 0.03, estilo: "tagVermelho", max: 50 },
    { t: "MARAVILHOSO", em: w("catiana", 30.19), estilo: "mega" },
  ] },
  { id: "teve-tudo", de: img("catiana", 1) + 0.02, ate: img("catiana", 3) - 0.03, x: 495, y: 1250, livre: true, linhas: [
    { t: "TEVE TUDO", em: w("catiana", 31.57), estilo: "mega", max: 260 },
    { t: "E MAIS UM POUCO", em: w("catiana", 33.09), estilo: "faixa", max: 120 },
  ] },
  { id: "expectativas", de: img("catiana", 3) + 0.03, ate: w("catiana", 35.62), x: 495, y: 1180, linhas: [
    { t: "SUPEROU TODAS AS", em: w("catiana", 33.81), estilo: "tag", max: 56 },
    { t: "EXPECTATIVAS", em: w("catiana", 34.93), estilo: "vermelho", anim: "letras" },
  ] },
  { id: "banana", de: w("catiana", 35.66), ate: fim("catiana"), x: 495, y: 1180, linhas: [
    { t: "NÃO É SÓ", em: w("catiana", 35.69), estilo: "tag", max: 60 },
    { t: "MEDALHA", em: w("catiana", 36.81), estilo: "mega", max: 250 },
    { t: "E BANANA!", em: w("catiana", 37.33), estilo: "faixa", max: 140 },
  ] },
  // organizador: até o fim do pensamento
  { id: "gratidao", de: T("gratidao").de + 0.05, ate: img("gratidao", 1) - 0.03, x: 495, y: 1150, linhas: [
    { t: "UM SENTIMENTO DE", em: w("gratidao", 21.78), estilo: "tag", max: 56 },
  ], escrita: { t: "gratidão", em: w("gratidao", 22.3), cor: "vermelho", tam: 170 } },
  { id: "presente", de: img("gratidao", 1) + 0.03, ate: img("gratidao", 2) - 0.03, x: 495, y: 1300, livre: true, linhas: [
    { t: "VER O PESSOAL", em: img("gratidao", 1) + 0.05, estilo: "tag", max: 60 },
    { t: "AQUI PRESENTE", em: w("gratidao", 25.22), estilo: "faixa", max: 130 },
  ] },
  { id: "saude", de: img("gratidao", 2) + 0.03, ate: w("gratidao", 29.2), x: 495, y: 1150, linhas: [
    { t: "A GENTE ESTÁ PROMOVENDO", em: w("gratidao", 27.4), estilo: "tag", max: 46 },
    { t: "SAÚDE", em: w("gratidao", 28.24), estilo: "vermelho", max: 280 },
  ] },
  { id: "lazer", de: w("gratidao", 29.25), ate: fim("gratidao"), x: 495, y: 1150, linhas: [
    { t: "UM DIA DIFERENTE,", em: w("gratidao", 29.3), estilo: "tag", max: 56 },
    { t: "DE LAZER", em: w("gratidao", 31.35), estilo: "faixa", max: 170 },
  ] },
];

export const RAIOS: { em: number; dur: number; cy?: number }[] = [
  { em: CONTAGEM.largou, dur: 0.45, cy: 900 },
  { em: JOELHOS, dur: 0.4, cy: 1100 },
];

export const IMPACTOS: { em: number; forca: number }[] = [
  ...CORTES.map((c) => ({ em: c.em, forca: c.forte ? 0.55 : 0.3 })),
  ...CONTAGEM.numeros.map((c) => ({ em: c.em, forca: 0.6 })),
  { em: CONTAGEM.largou, forca: 1.7 },
  { em: JOELHOS, forca: 1.1 },
  { em: 0.02, forca: 1.2 },
  { em: FIM.de + 0.05, forca: 1.0 },
];

// cada momento com o seu som (regra da Talyta: nada de efeito igual pra tudo). Efeito em cima de fala só baixo
// (≤ 0,3) e nunca em cima da última palavra de uma frase; os fortes ficam nos trechos sem fala.
export const SFX: { em: number; nome: string; vol?: number }[] = [
  { em: 0.02, nome: "boom", vol: 0.85 },
  { em: 0.1, nome: "tambor", vol: 0.6 },
  { em: 0.42, nome: "metal", vol: 0.45 },
  { em: T("gancho").de - 0.1, nome: "whoosh", vol: 0.45 },
  { em: w("gancho", 0.62), nome: "hit-leve", vol: 0.25 },
  { em: w("gancho", 1.72), nome: "caixa", vol: 0.25 },
  { em: w("gancho", 4.04), nome: "tambor", vol: 0.22 },
  // ponte em B-roll (sem fala)
  { em: T("ponte").de - 0.05, nome: "whoosh-forte", vol: 0.5 },
  { em: img("ponte", 1), nome: "passos", vol: 0.45 },
  { em: img("ponte", 2) - 0.03, nome: "swish", vol: 0.4 },
  { em: T("organizacao").de - 0.05, nome: "whoosh", vol: 0.35 },
  { em: w("organizacao", 17.84), nome: "hit", vol: 0.25 },
  { em: w("nervoso", 67.54), nome: "relogio", vol: 0.28 },
  // o riser sobe só depois do "largada" (antes ele cobria o fim da frase)
  { em: T("alinhados").de - 0.1, nome: "riser", vol: 0.55 },
  { em: T("alinhados").de, nome: "boom-leve", vol: 0.45 },
  ...CONTAGEM.numeros.map((c) => ({ em: c.em, nome: "hit-leve", vol: 0.3 })),
  { em: CONTAGEM.largou, nome: "tiro", vol: 0.75 },
  { em: CONTAGEM.largou + 0.02, nome: "boom", vol: 0.85 },
  // fotos do percurso (sem fala): clique de câmera em cada uma
  ...T("percurso").imagens.filter((im) => im.tipo === "f").map((im) => ({ em: im.de, nome: "obturador", vol: 0.35 })),
  { em: img("percurso", 8) - 0.05, nome: "whoosh", vol: 0.4 },
  { em: T("chegada").de - 0.05, nome: "whoosh-saida", vol: 0.35 },
  { em: w("chegada", 3.1), nome: "tambor", vol: 0.28 },
  { em: JOELHOS, nome: "boom", vol: 0.5 },
  { em: JOELHOS + 0.03, nome: "brilho", vol: 0.28 },
  // "cadê as palmas?": as palmas entram no fim da fala e seguem por cima da foto dele emocionado
  { em: T("chegada").ate - 0.12, nome: "palmas", vol: 0.55 },
  { em: T("emocao").de, nome: "obturador", vol: 0.4 },
  { em: T("campea").de - 0.4, nome: "swish", vol: 0.3 }, // longe do "Pessoal"
  { em: w("campea", 1.92), nome: "hit", vol: 0.22 },
  { em: w("dedica", 79.98) + 0.1, nome: "brilho", vol: 0.28 },
  { em: w("cuidar", 3.48), nome: "caixa", vol: 0.22 },
  { em: img("cuidar", 1), nome: "swish", vol: 0.28 },
  { em: img("catiana", 1), nome: "swish", vol: 0.28 },
  { em: img("catiana", 2), nome: "metal", vol: 0.25 },
  { em: w("catiana", 34.93), nome: "boom-leve", vol: 0.28 },
  { em: w("gratidao", 22.3), nome: "brilho", vol: 0.3 },
  { em: w("gratidao", 28.24), nome: "hit-leve", vol: 0.22 },
  // cartela final (sem fala)
  { em: FIM.de + 0.05, nome: "carimbo", vol: 0.9 },
  { em: FIM.de + 0.1, nome: "boom", vol: 0.6 },
  { em: FIM.de + 0.6, nome: "apito", vol: 0.45 },
];
