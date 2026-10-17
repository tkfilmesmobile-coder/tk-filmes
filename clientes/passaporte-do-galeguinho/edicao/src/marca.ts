// Identidade do Passaporte do Galeguinho, na dose de vídeo: os mesmos tons dos posts, usados com parcimônia.
export const MARCA = {
  creme: "#FFF6E9",
  dourado: "#FFB01F",
  laranja: "#F5820A",
  escuro: "#0E0A05",
} as const;

// Vidro escuro quente dos cards: o fundo dos posts, translúcido, com fio dourado.
export const VIDRO: React.CSSProperties = {
  backgroundColor: "rgba(14,10,5,0.78)",
  border: "1.5px solid rgba(255,176,31,0.42)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
};

// Faixa de segurança: tudo que é gráfico vive abaixo do rosto e acima dos controles do Reels.
export const FAIXA = {
  cardTopo: 950, // topo do bloco de cards (abertura)
  chipTopo: 1222, // selo de localização
  legendaCentro: 1425, // linha central da legenda
} as const;
