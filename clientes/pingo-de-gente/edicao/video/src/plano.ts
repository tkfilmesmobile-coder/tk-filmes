import { COR } from "./marca";
import type { Rab } from "./rabiscos";
import type { BichoG, Corrida, Macaco, Seta } from "./animais";
import cenas from "./cenas.json";

// Roteiro da edição da chamada "Live Black Day" da Pingo de Gente (vídeo unitário, gravado em 2026-11-04).
// O vídeo chegou cortado e com as falas: aqui entram só rabiscos, títulos, legenda, trilha e efeitos.

// o último quadro congela 1,5 s pra o selo final respirar (o vídeo original acaba 1,3 s depois da fala)
export const CONGELA = 1.5;
export const FIM_VIDEO = cenas.fim - 1 / 24;
export const TOTAL = cenas.fim + CONGELA; // 45,83 s

// ---------- fala (média dos tempos do large-v3 e do medium; texto do medium, que fecha a frase) ----------
// [A CONFIRMAR com a Talyta] "Você JÁ está preparado?" (só o medium ouve o "já") e "perder A Black Day"
// (o large-v3 ouve "perder! Da Black Day").
export type Palavra = { p: string; em: number; destaque?: boolean; quebra?: boolean };
// x/larg: centro e largura do bloco (padrão: a tela toda, centralizado)
export type Fala = { de: number; ate: number; y: number; x?: number; larg?: number; palavras: Palavra[] };
export const FALAS: Fala[] = [
  { de: 31.2, ate: 33.45, y: 300, palavras: [
    { p: "Você", em: 31.29 }, { p: "já", em: 32.06 }, { p: "está", em: 32.24 }, { p: "preparado?", em: 32.4, destaque: true },
  ] },
  // à direita da mão dela (embaixo cobria o "Pingo de Gente" da estampa)
  { de: 33.5, ate: 35.0, y: 800, x: 760, larg: 470, palavras: [
    { p: "Já", em: 33.55 }, { p: "é", em: 33.97 }, { p: "SÁBADO!", em: 34.13, destaque: true, quebra: true },
  ] },
  { de: 35.08, ate: 38.25, y: 290, palavras: [
    { p: "19H", em: 35.18, destaque: true }, { p: "no", em: 36.14 }, { p: "perfil", em: 36.57 },
    { p: "da", em: 37.01, quebra: true }, { p: "Pingo", em: 37.17, destaque: true }, { p: "de", em: 37.51, destaque: true }, { p: "Gente", em: 37.78, destaque: true },
  ] },
  { de: 38.3, ate: 40.45, y: 790, palavras: [
    { p: "Você", em: 38.31 }, { p: "não", em: 38.64 }, { p: "pode", em: 39.14 }, { p: "perder", em: 39.56, destaque: true },
  ] },
  { de: 40.5, ate: 43.45, y: 790, palavras: [
    { p: "a", em: 40.54 }, { p: "Black", em: 40.99, destaque: true }, { p: "Day", em: 41.34, destaque: true },
    { p: "da", em: 41.8, quebra: true }, { p: "Pingo", em: 42.05, destaque: true }, { p: "de", em: 42.5, destaque: true }, { p: "Gente!", em: 42.79, destaque: true },
  ] },
];

// títulos grandes em letras coloridas (como o logo)
export type Titulo = { t: string; de: number; ate: number; y: number; tam: number; x?: number; rot?: number };
export const TITULOS: Titulo[] = [
  // a voz do "Vem aí!" vai de 15,5 a 16,5 (medido no volume; os dois modelos marcaram cedo): o título entra antes
  { t: "VEM AÍ!", de: 14.85, ate: 16.6, y: 1040, tam: 210, rot: -4 },
  // entra quando a legenda sai (antes repetia o "Black Day" da legenda ao mesmo tempo)
  { t: "BLACK DAY", de: 43.45, ate: 46.5, y: 860, tam: 172, rot: -3 },
];
// selo final: a live, o dia e a hora que ela fala
export const SELO = { de: 43.75, y: 1340 };

// fins de frase: efeito sonoro nunca em cima deles (clientes/_regras.md, curadoria item 16)
// o "Vem aí!" é baixinho e curto: protegido inteiro
export const FINS: [number, number][] = [[15.45, 16.65], [32.1, 33.9], [33.9, 35.4], [37.55, 38.5], [39.4, 40.9], [42.5, 43.43]];

// ---------- recorte da menina (recortar.py): o que fica ATRÁS dela só existe nessas cenas ----------
export const RECORTES = [
  { nome: "balanco", de: 0.0, ate: 4.583 }, { nome: "caminho", de: 12.792, ate: 15.542 }, { nome: "vemai", de: 15.542, ate: 16.667 },
  { nome: "corrida", de: 16.667, ate: 18.333 }, { nome: "ponte", de: 22.958, ate: 24.917 }, { nome: "raios", de: 24.917, ate: 26.75 },
  { nome: "final", de: 38.292, ate: 44.33 },
];
// contorno branco desenhado à mão em volta dela (cara de figurinha recortada)
export const CONTORNO = ["vemai", "final"];

// bichos grandes por trás dela (referência 1: elefante de corações atrás das crianças)
export const BICHOS: BichoG[] = [
  // no balanço ela vai e volta pela direita: a girafa fica na grama da esquerda (cabeça na altura do balanço)
  { b: "girafa", x: 230, base: 1540, larg: 540, em: 0.3, ate: 4.45 },
  // final: o elefante espia pela direita (virado pra fora, tromba pra cima soltando corações) e a girafa pela
  // esquerda, os dois por trás dela na altura do rosto. Entram depois do "Gente." (37,96–38,24), pra mola não cair no fim da frase
  { b: "elefante", x: 700, base: 1150, larg: 900, em: 38.55, ate: 45.9, espelha: true },
  { b: "girafa", x: 140, base: 1250, larg: 480, em: 38.75, ate: 45.9, rot: 3 },
];

// setas apontando pra sacola, presas nela (rastreio.json): Talyta não gostou do círculo (2026-11-04)
// ang = pra onde a seta aponta (graus, 0 = direita); alvo = ponto da sacola (fração da largura e da altura)
export const SETAS: Seta[] = [
  { em: 18.45, ate: 19.8, ang: 0, alvo: [0, 0.5], cor: COR.vermelho },
  { em: 18.62, ate: 19.8, ang: 42, alvo: [0.18, 0.04], cor: COR.azul },
  { em: 18.79, ate: 19.8, ang: -38, alvo: [0.1, 0.94], cor: COR.rosa },
];

// macaquinhos saindo de dentro das árvores da ponte, presos à copa e ao corrimão (x, y = no quadro em que entram)
// O fundo corre ~500 px/s pra direita (a câmera vira acompanhando a menina): cada um entra pela esquerda, fica
// ~0,9 s e volta pra dentro das folhas antes de chegar nela (no 1º teste eles se amontoavam perto da cabeça dela).
export const MACACOS: Macaco[] = [
  // espalhados a cada instante: um à esquerda, um no alto do meio (acima da cabeça dela), um no corrimão
  { tipo: "espia", x: 180, y: 440, larg: 240, em: 23.0, ate: 23.85, zona: "copa" },
  { tipo: "pendurado", x: 520, y: 250, larg: 240, em: 23.2, ate: 23.95, zona: "copa" },
  { tipo: "sentado", x: 150, y: 700, larg: 280, em: 23.35, ate: 24.2, zona: "corrimao" },
  // entra quando o primeiro volta pras folhas (antes os dois se cruzavam)
  { tipo: "espia", x: 560, y: 300, larg: 210, em: 23.88, ate: 24.6, zona: "copa", espelha: true },
  { tipo: "espia", x: 300, y: 450, larg: 200, em: 24.1, ate: 24.88, zona: "copa" },
];

// linhas de velocidade a lápis + "zuuum" quando ela passa correndo.
// Talyta (2026-11-04): só no balanço (ela pula e sai correndo pra direita) e na corrida inclinada do meio;
// no caminho do arbusto, na ponte e indo pegar a sacola, não.
export const CORRIDAS: Corrida[] = [
  { de: 4.08, ate: 4.583, dir: "dir", forca: 1.0, largCorpo: 230 },
  { de: 16.7, ate: 18.3, dir: "auto", forca: 1.15 },
];

// ---------- rabiscos, cena a cena ----------
const az = { cor: COR.azul, cor2: COR.marinho };
const rs = { cor: COR.rosa, cor2: "#D63384" };
const bc = { cor: COR.branco, cor2: COR.ceu };
const am = { cor: COR.amarelo, cor2: COR.laranja };
const rx = { cor: COR.roxo, cor2: "#5B30C9" };

const r = (tipo: Rab["tipo"], x: number, y: number, tam: number, em: number, ate: number, extra: Partial<Rab> = {}): Rab => ({ tipo, x, y, tam, em, ate, ...extra });

// confete de rabiscos saindo do centro no "Black Day"
const CONFETE: Rab[] = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 + 0.3;
  const tipos: Rab["tipo"][] = ["estrela", "coracao", "ponto", "brilho"];
  const cores = [am, { cor: COR.vermelho, cor2: "#B31B27" }, az, rs, bc, { cor: COR.verde, cor2: "#1E8A40" }];
  const raio = 300 + (i % 3) * 70;
  return r(tipos[i % 4], 540 + Math.cos(a) * 120, 900 + Math.sin(a) * 120, 60 + (i % 3) * 18, 43.45 + (i % 4) * 0.04, 45.9, {
    ...cores[i % cores.length], voa: [Math.cos(a) * raio, Math.sin(a) * raio * 1.2], rot: i * 30,
  });
});

export const RABISCOS: Rab[] = [
  // 1 · balanço (0–4,6)
  r("sol", 180, 380, 230, 0.15, 4.45),
  r("nuvem", 560, 290, 0, 0.55, 4.45, { w: 230, h: 150 }),
  r("estrela", 960, 420, 100, 0.85, 4.45),
  r("risquinhos", 110, 760, 140, 1.3, 4.45),
  r("flor", 960, 1420, 150, 1.7, 4.45),
  r("flor", 170, 1400, 150, 1.95, 4.45, am),
  r("abelha", 360, 1180, 150, 2.5, 4.45, { voa: [360, -160] }),

  // 2 e 3 · janela amarela (4,6–7,0): no amarelo, azul, rosa e branco
  r("coracao", 190, 430, 120, 4.68, 6.95, { voa: [0, -130] }),
  r("balao", 900, 460, 160, 4.8, 6.95, { voa: [0, -170] }),
  r("estrela", 220, 1260, 115, 4.95, 6.95, az),
  r("estrela", 860, 1300, 95, 5.1, 6.95, rs),
  r("brilho", 790, 860, 75, 5.3, 6.95, bc),
  r("risquinhos", 150, 860, 120, 6.3, 6.95, bc),

  // 4 · grama e de costas (7,0–10,2)
  r("flor", 190, 1340, 160, 7.1, 10.1, rx),
  r("estrela", 890, 1150, 110, 7.4, 10.1),
  r("sol", 870, 360, 210, 8.1, 10.1),
  r("laco", 280, 520, 0, 8.6, 10.1, { w: 240, h: 130 }),
  r("brilho", 160, 860, 80, 9.1, 10.1, bc),

  // 5 · rosto perto, casinha amarela (10,2–12,8)
  r("risquinhos", 100, 430, 150, 10.3, 12.7, bc),
  r("risquinhos", 980, 430, 150, 10.3, 12.7, { ...bc, espelha: true }),
  r("coracao", 900, 960, 120, 10.8, 12.7),
  r("estrela", 170, 1030, 100, 11.2, 12.7, az),
  r("brilho", 920, 1290, 80, 11.6, 12.7),

  // 6 · corrida no caminho e o papel (12,8–15,5)
  r("onda", 540, 1440, 0, 12.9, 15.45, { w: 520, h: 90 }),
  r("estrela", 300, 900, 70, 13.1, 15.45, rs),
  r("ponto", 790, 800, 55, 13.3, 15.45, am),
  r("interrogacao", 200, 520, 150, 14.15, 15.45),

  // 7 · "VEM AÍ!" (15,5–16,7)
  r("brilho", 170, 420, 110, 15.25, 16.6),
  r("brilho", 920, 360, 90, 15.4, 16.6, bc),
  r("estrela", 160, 1250, 90, 15.6, 16.6, rs),

  // 8 · correndo inclinada (16,7–18,3)
  r("risquinhos", 880, 900, 160, 16.75, 18.25, { ...bc, espelha: true }),
  r("estrela", 220, 520, 100, 17.0, 18.25),
  r("nuvem", 760, 380, 0, 17.2, 18.25, { w: 210, h: 140 }),

  // 9 · ponte de troncos: a sacola lá no fundo (18,3–19,8): só as SETAS rastreadas (abaixo), sem círculo

  // 10 · sacola de perto (19,8–21,8): brilho em volta, coroa em cima das alças, balão de coração como no logo
  r("brilho", 170, 470, 110, 19.95, 21.75, { desvia: false }),
  r("coroa", 640, 400, 150, 20.15, 21.75, { desvia: false }),
  r("balao", 150, 1150, 130, 20.35, 21.75, { voa: [0, -260], desvia: false }),
  r("coracao", 930, 330, 95, 20.55, 21.75, { desvia: false }),
  r("brilho", 950, 1560, 80, 20.75, 21.75, { ...bc, desvia: false }),

  // 11 · camiseta de perto, rindo (21,8–23,0): só nas bordas, longe da estampa
  r("coracao", 130, 560, 100, 21.9, 22.9, { voa: [0, -120] }),
  r("estrela", 960, 900, 95, 22.05, 22.9, rs),
  r("brilho", 130, 1250, 85, 22.2, 22.9, bc),

  // 12 · ponte, andando (23,0–24,9): a copa fica com os MACACOS (abaixo)
  r("estrela", 860, 1200, 100, 23.6, 24.85),

  // 13 · correndo pra sacola, raios de sol (24,9–26,75)
  r("brilho", 230, 360, 120, 25.0, 26.7),
  r("risquinhos", 200, 1150, 130, 25.4, 26.7, bc),
  r("risquinhos", 880, 1150, 130, 25.4, 26.7, { ...bc, espelha: true }),
  r("estrela", 880, 520, 100, 25.8, 26.7, rs),

  // 14 · abrindo a sacola (26,75–28,2): coisas saindo de dentro
  r("risquinhos", 140, 620, 150, 26.9, 28.1, bc),
  r("risquinhos", 940, 620, 150, 26.9, 28.1, { ...bc, espelha: true }),
  r("estrela", 420, 1250, 90, 27.2, 28.1, { voa: [-60, -300] }),
  r("estrela", 650, 1250, 80, 27.35, 28.1, { ...az, voa: [80, -320] }),
  r("coracao", 540, 1300, 90, 27.5, 28.1, { voa: [0, -360] }),

  // 15 · o cartaz "Vem nossa LIVE Black Day" (28,2–29,5): nada em cima do cartaz
  r("brilho", 910, 360, 110, 28.25, 29.4, { desvia: false }),
  r("risquinhos", 950, 720, 140, 28.45, 29.4, { ...am, espelha: true, desvia: false }),
  r("exclamacao", 910, 980, 110, 28.65, 29.4, { desvia: false }),
  r("brilho", 140, 1080, 80, 28.8, 29.4, { ...bc, desvia: false }),

  // 16 · lendo o papel (29,5–31,1)
  r("coracao", 880, 470, 120, 29.6, 31.05),
  r("coracao", 965, 640, 80, 29.8, 31.05, rs),
  r("brilho", 860, 1160, 90, 30.0, 31.05),

  // 17 · "Você já está preparado?" (31,1–33,7)
  r("estrela", 120, 720, 90, 31.35, 33.6),
  r("brilho", 960, 820, 90, 31.55, 33.6, bc),
  r("interrogacao", 940, 560, 150, 32.45, 33.6),

  // 18 · "Já é sábado!" (33,7–35,0)
  r("calendario", 900, 1080, 160, 33.75, 35.0),
  r("estrela", 930, 520, 90, 34.0, 35.0, rs),

  // 19 · "19h no perfil da Pingo de Gente" (35,0–38,3)
  r("relogio", 910, 680, 200, 35.12, 38.25),
  r("celular", 165, 760, 170, 36.2, 38.25),
  r("coracao", 250, 560, 70, 36.9, 38.25, { voa: [0, -110] }),

  // 20 · "Você não pode perder a Black Day da Pingo de Gente!" (38,3–44,3)
  // (o espaço dos lados fica com os bichos) corações saindo da tromba do elefante
  r("coracao", 975, 500, 70, 39.1, 45.9, { voa: [-90, -260], desvia: false }),
  r("coracao", 995, 520, 55, 39.9, 45.9, { ...rs, voa: [-40, -280], desvia: false }),
  r("coracao", 965, 510, 62, 41.0, 45.9, { voa: [-120, -250], desvia: false }),
  ...CONFETE,
];
