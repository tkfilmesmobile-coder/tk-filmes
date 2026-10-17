// Tudo o que é tempo está em frames da edição (30 fps). Gerado por scripts/montar.mjs.
export type Quadro = { f: number; escala: number; tx: number; ty: number };

export type Clipe = {
  id: string;
  trimBefore: number;
  from: number;
  durationInFrames: number;
  // Rosto na tela (px de 1080x1920, sem zoom): o zoom gira em volta dele
  rosto: { x: number; y: number; w: number };
  // Enquadramento virtual ao longo do clipe (A ~1.0, B ~1.15, C ~1.35)
  quadros: Quadro[];
};

export type Linha = { t: string; cor?: boolean };
export type Headline = {
  from: number;
  durationInFrames: number;
  linhas: Linha[];
  pos?: "topo" | "baixo";
};

export type Card = {
  from: number;
  durationInFrames: number;
  etiqueta: string;
  texto: string;
};

export type Cta = { from: number; durationInFrames: number; texto: string; sub?: string };

export type PalavraLegenda = { text: string; startMs: number; endMs: number; cor?: "rosa" | "azul" | "vermelho" };

export type ReelProps = {
  fonte: string;
  clipes: Clipe[];
  headlines: Headline[];
  cards: Card[];
  cta: Cta | null;
  legendas: PalavraLegenda[];
};
