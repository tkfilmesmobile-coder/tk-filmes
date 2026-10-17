import { interpolate, useCurrentFrame } from "remotion";

// Fluxo térmico que se aproxima do dente vindo de um lado: frio (azul, parece temperatura, não água)
// ou quente (laranja suave, nunca chama). "ativo" 0–1 controla a presença; "afasta" 0–1 leva o fluxo
// embora (o estímulo sai). Ondas finas + poucas partículas, sem decoração.
export const Termico: React.FC<{
  tipo: "frio" | "quente";
  ativo: number;
  afasta?: number;
  largura: number;
  lado: "direita" | "esquerda";
}> = ({ tipo, ativo, afasta = 0, largura, lado }) => {
  const frame = useCurrentFrame();
  const cor = tipo === "frio" ? "#A9DDFF" : "#FFB27A";
  const nucleo = tipo === "frio" ? "#E6F6FF" : "#FFE2C8";
  const dx = afasta * 140;
  const ondas = [0, 1, 2, 3];
  const parts = [0, 1, 2, 3, 4, 5];
  return (
    <svg
      width={largura}
      height={largura * 0.9}
      viewBox="0 0 220 200"
      style={{ overflow: "visible", scale: lado === "esquerda" ? "-1 1" : "1 1", opacity: ativo * (1 - afasta) }}
    >
      <defs>
        <filter id={`termico-${tipo}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <g transform={`translate(${dx} 0)`} filter={`url(#termico-${tipo})`}>
        {ondas.map((i) => {
          // cada onda viaja da direita (x alto) pro dente (x baixo) em ciclo de ~26 quadros
          const fase = ((frame + i * 9) % 26) / 26;
          const x = interpolate(fase, [0, 1], [200, 30]);
          const a = interpolate(fase, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
          const y = 46 + i * 34;
          const amp = tipo === "frio" ? 7 : 10;
          return (
            <path
              key={i}
              d={`M${x} ${y} q 14 -${amp} 28 0 t 28 0 t 28 0`}
              stroke={cor}
              strokeWidth={tipo === "frio" ? 4.2 : 4.6}
              strokeLinecap="round"
              fill="none"
              opacity={0.95 * a}
            />
          );
        })}
        {parts.map((i) => {
          const fase = ((frame * 1.1 + i * 13) % 34) / 34;
          const x = interpolate(fase, [0, 1], [210, 40]);
          const y = 50 + ((i * 37) % 120) + Math.sin((frame + i * 7) / 6) * 4;
          const a = interpolate(fase, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
          return <circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 4} fill={nucleo} opacity={a} />;
        })}
      </g>
    </svg>
  );
};
