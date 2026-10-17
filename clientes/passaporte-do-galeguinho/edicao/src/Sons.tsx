import { Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";

// Efeitos sintetizados no projeto (scripts/gerar-sfx.mjs → public/sfx).
// impacto: batida grave de headline · subida: ar que cresce até a batida · sopro: entrada/saída
// estouro: "pop" de card · brilho: cintilar de destaque · toque: clique de interface
export type SomDaCasaNome =
  | "impacto"
  | "subida"
  | "sopro"
  | "estouro"
  | "brilho"
  | "toque";

export const SomDaCasa: React.FC<{
  nome: string;
  em: number;
  som: SomDaCasaNome;
  volume: number;
}> = ({ nome, em, som, volume }) => (
  <Sequence
    name={`SFX ${nome}`}
    from={Math.max(0, em)}
    durationInFrames={40}
    layout="none"
  >
    <Audio src={staticFile(`sfx/${som}.wav`)} volume={volume} />
  </Sequence>
);
