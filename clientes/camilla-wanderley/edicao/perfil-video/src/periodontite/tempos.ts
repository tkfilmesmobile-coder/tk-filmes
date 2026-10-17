// Tempos (segundos do vídeo original, medidos na transcrição e no áudio de PERIODONTITE.mp4).
// 0,13–2,56 "A periodontite é uma doença da gengiva." · 2,86–4,9 "Ela causa parto prematuro."
// 5,04–10,36 "Por isso que a grávida, a gestante, tem que cuidar durante a gestação."
export const T = {
  // abertura: a própria filmagem, zoom de ênfase ancorado no rosto + headline
  zoomDe: 0.0,
  zoomAte: 0.4,
  descida: 290, // quanto a imagem desce no zoom da abertura (rosto abaixo da headline)
  headlineDe: 0.1,
  // maquete (parte da headline, v3)
  maqueteDe: 0.55,
  maqueteAte: 1.15,
  subDe: 1.45, // "doença da gengiva"
  separaDe: 1.6,
  separaAte: 2.2,
  inflamaDe: 2.3, // "gengiva"
  inflamaAte: 2.75,
  perioDe: 2.9, // "Ela causa parto prematuro"
  perioAte: 3.35,
  juntaDe: 3.5,
  juntaAte: 3.95,
  saiDe: 4.25, // headline sai, a filmagem volta ao quadro normal
  saiAte: 4.7,
  // enquadramento na doutora (plano aberto)
  pushDe: 4.75,
  pushAte: 5.9,
  // ênfases de zoom na doutora: [segundo, multiplicador] (interpolado com suavização)
  enfases: [
    [0, 1],
    [7.55, 1], [7.95, 1.07], // "cuidar"
    [11.9, 1.07], [12.25, 1.0], // nova frase: respira
    [15.05, 1.0], [15.4, 1.08], // "parto prematuro"
    [17.9, 1.08], [18.3, 1.0],
    [24.7, 1.0], [25.1, 1.05], // "pra bebê e pra dentista"
    [32.2, 1.05], [32.6, 1.0], // "mas que todas as grávidas…": respira
    [39.3, 1.0], [39.7, 1.06], // "quando nasce"
    [42.5, 1.06], [42.9, 1.11], // "amamentando e com dor de dente"
    [44.2, 1.11], [44.6, 1.02], // "Eu já tive pacientes assim": abre, mais humano
    [47.0, 1.02], [47.4, 1.07], // "levavam neném recém-nascido"
    [60, 1.07],
  ] as [number, number][],
  // 2º trimestre: o bloco da headline volta com a linha do tempo 3D
  triDe: 18.75, // "a melhor fase"
  triFoco: 21.2, // "segundo trimestre"
  triAte: 22.55,
  // "o ideal é tratar antes de engravidar": linha do tempo com foco em "antes"
  antesDe: 26.5, // "Agora, o ideal…"
  antesTitulo: 27.75,
  antesSub: 28.7, // "fazer o tratamento odontológico"
  antesFoco: 30.75, // "antes de engravidar"
  antesAte: 32.25,
  // "deveriam fazer o tratamento durante a gestação, limpeza."
  limpezaDe: 34.85, // "deveriam fazer o tratamento"
  limpezaEm: 37.45, // "limpeza"
  limpezaAte: 38.75,
  // assinatura no fim
  assinaturaDe: 48.4,
  // trilha: clínica (técnico) → acolhimento (fala humana)
  trilhaTrocaDe: 4.45,
  trilhaTrocaAte: 5.2,
  // acolhimento → clareza (orientação: quando tratar, planejamento, limpeza)
  trilha2De: 18.1,
  trilha2Ate: 18.9,
  // clareza → acolhimento (depois que o bebê nasce: fala humana)
  trilha3De: 38.6,
  trilha3Ate: 39.6,
};

export const AMOSTRA_S = 10.4; // termina depois de "gestação." (fala acaba em 10,36 s)
export const PREVIA_S = 26.85; // termina depois de "…pra dentista, sabe?" (silêncio antes do "Agora" em 27,0 s)
export const TOTAL_S = 50.34;
