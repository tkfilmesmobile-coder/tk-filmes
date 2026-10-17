import { useCurrentFrame } from "remotion";

// Dente molar semi-realista (luz de estúdio vinda do alto à esquerda, sombra macia embaixo).
// frio: 0–1 (luz de contorno azul fria, só no elemento) · dor: 0–1 (brilho vermelho interno)
// calor: 0–1 (luz de contorno quente) · corte: mostra o corte (esmalte, dentina, polpa).
// Nunca muda a cor do rosto: tudo acontece dentro do SVG.

const CONTORNO =
  "M30 72 C29 42 54 26 70 39 C83 22 117 22 130 39 C146 26 171 42 170 72 C171 101 165 124 158 141 C150 176 150 214 140 261 C136 280 120 282 118 262 C114 230 108 201 100 190 C92 201 86 230 82 262 C80 282 64 280 60 261 C50 214 50 176 42 141 C35 124 29 101 30 72 Z";
const DENTINA =
  "M42 76 C42 54 58 43 70 52 C83 38 117 38 130 52 C142 43 158 54 158 76 C158 100 153 120 147 136 C140 170 140 210 131 254 C128 266 124 266 123 254 C119 224 112 198 100 184 C88 198 81 224 77 254 C76 266 72 266 69 254 C60 210 60 170 53 136 C47 120 42 100 42 76 Z";
const POLPA =
  "M70 96 C71 82 80 80 84 92 C90 101 110 101 116 92 C120 80 129 82 130 96 C132 116 128 134 124 150 C120 185 124 224 128 256 C129 263 124 265 123 259 C116 224 112 190 104 173 C101 168 99 168 96 173 C88 190 84 224 77 259 C76 265 71 263 72 256 C76 224 80 185 76 150 C72 134 68 116 70 96 Z";

export const Dente: React.FC<{
  largura: number;
  frio?: number;
  dor?: number;
  calor?: number;
  corte?: boolean;
  id: string;
}> = ({ largura, frio = 0, dor = 0, calor = 0, corte = false, id }) => {
  const frame = useCurrentFrame();
  // pulso da dor: respiração curta, sem piscar
  const pulso = dor > 0 ? 0.75 + 0.25 * Math.sin(frame / 3.2) : 0;
  const g = (s: string) => `${id}-${s}`;
  return (
    <svg width={largura} height={largura * 1.5} viewBox="0 0 200 300" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={g("corpo")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FCFAF6" />
          <stop offset="0.42" stopColor="#F3EEE6" />
          <stop offset="0.5" stopColor="#E9DFCE" />
          <stop offset="1" stopColor="#CDB590" />
        </linearGradient>
        <radialGradient id={g("oclusao")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3A2C20" stopOpacity="0.28" />
          <stop offset="1" stopColor="#3A2C20" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g("volume")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="0.38" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.7" stopColor="#6B5846" stopOpacity="0.12" />
          <stop offset="1" stopColor="#4A3A2C" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id={g("dentina")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2DDBE" />
          <stop offset="1" stopColor="#E3C89F" />
        </linearGradient>
        <radialGradient id={g("polpa")} cx="0.5" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#E9A8A2" />
          <stop offset="1" stopColor="#CF7F7A" />
        </radialGradient>
        <filter id={g("sombra")} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.22" />
        </filter>
        <filter id={g("brilho")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={g("suave")}>
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <clipPath id={g("forma")}>
          <path d={CONTORNO} />
        </clipPath>
      </defs>

      {/* sombra de contato, macia */}
      <ellipse cx="100" cy="292" rx="52" ry="7" fill="#000" opacity="0.14" filter={`url(#${g("brilho")})`} />

      <g filter={`url(#${g("sombra")})`}>
        <path d={CONTORNO} fill={`url(#${g("corpo")})`} />
      </g>

      <g clipPath={`url(#${g("forma")})`}>
        {corte ? (
          <>
            <path d={DENTINA} fill={`url(#${g("dentina")})`} />
            <path d={POLPA} fill={`url(#${g("polpa")})`} />
          </>
        ) : null}
        <path d={CONTORNO} fill={`url(#${g("volume")})`} />
        {/* oclusão entre as raízes e sob a coroa: dá profundidade */}
        <ellipse cx="100" cy="205" rx="26" ry="60" fill={`url(#${g("oclusao")})`} />
        <ellipse cx="100" cy="150" rx="70" ry="14" fill={`url(#${g("oclusao")})`} opacity="0.7" />
        {/* linha cervical sutil (transição esmalte/raiz) */}
        {!corte ? <path d="M42 140 C75 150 125 150 158 140" stroke="#BFA88A" strokeOpacity="0.35" strokeWidth="2" fill="none" filter={`url(#${g("suave")})`} /> : null}
        {/* luz de contorno fria/quente: só no elemento */}
        <path d={CONTORNO} fill="none" stroke="#8FD2FF" strokeWidth="16" opacity={0.75 * frio} filter={`url(#${g("brilho")})`} />
        <path d={CONTORNO} fill="none" stroke="#FFB070" strokeWidth="16" opacity={0.7 * calor} filter={`url(#${g("brilho")})`} />
        {/* realce especular de estúdio */}
        <ellipse cx="72" cy="58" rx="20" ry="9" fill="#FFFFFF" opacity="0.8" transform="rotate(-18 72 58)" filter={`url(#${g("suave")})`} />
        <ellipse cx="128" cy="52" rx="8" ry="4" fill="#FFFFFF" opacity="0.5" filter={`url(#${g("suave")})`} />
      </g>

      {/* dor: brilho vermelho controlado, dentro do dente */}
      {dor > 0 ? (
        <g clipPath={`url(#${g("forma")})`}>
          <path d={POLPA} fill="#E0433B" opacity={0.85 * dor * pulso} filter={`url(#${g("brilho")})`} />
          <path d={POLPA} fill="#F2645B" opacity={0.55 * dor * pulso} />
        </g>
      ) : null}
    </svg>
  );
};
