import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";

// Legenda (v4): a frase em até duas linhas, centralizada na tela, em sans neutra arredondada (Nunito),
// branca, num tamanho só, sem caixa, com sombra macia. Palavra-chave só muda pra rosé claro.
const { fontFamily: NUNITO } = loadNunito("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] });

type Palavra = { text: string; startMs: number; endMs: number; destaque?: boolean };
type Pagina = { palavras: Palavra[]; de: number; ate: number };
export type Ancora = (frame: number) => { x: number; y: number; escura: boolean };

const MAX_CARACTERES = 50; // duas linhas de ~25 letras

const paginar = (ps: Palavra[]): Pagina[] => {
  const paginas: Pagina[] = [];
  let atual: Palavra[] = [];
  const fecha = () => {
    if (atual.length) paginas.push({ palavras: atual, de: atual[0].startMs, ate: atual[atual.length - 1].endMs });
    atual = [];
  };
  for (const p of ps) {
    const texto = (atual.map((x) => x.text).join("") + p.text).trim();
    if (atual.length && texto.length > MAX_CARACTERES) fecha();
    atual.push(p);
    const agora = atual.map((x) => x.text).join("").trim();
    // frase termina: fecha; vírgula fecha só se a página já tem corpo
    if (/[.?!]$/.test(p.text.trim()) || (/,$/.test(p.text.trim()) && agora.length > 22)) fecha();
  }
  fecha();
  return paginas.map((pg, i) => ({ ...pg, ate: Math.min(paginas[i + 1]?.de ?? Infinity, pg.ate + 450) }));
};

const PaginaLegenda: React.FC<{ pagina: Pagina; dur: number; ancora: Ancora; de: number }> = ({ pagina, dur, ancora, de }) => {
  const frame = useCurrentFrame();
  const { x, y, escura } = ancora(de + frame);
  const ease = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) } as const;
  const entra = interpolate(frame, [0, 5], [0, 1], ease);
  const sai = interpolate(frame, [dur - 3, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: x - 440,
          width: 880,
          top: y,
          textAlign: "center",
          fontFamily: NUNITO,
          fontWeight: 700,
          fontSize: 52,
          lineHeight: 1.18,
          letterSpacing: 0.2,
          translate: `0px ${(1 - entra) * 10}px`,
          color: escura ? "#5E2533" : "#FFFFFF",
          textShadow: escura ? "none" : "0 0 28px rgba(20,8,12,0.55), 0 2px 10px rgba(20,8,12,0.6), 0 1px 2px rgba(20,8,12,0.5)",
          opacity: entra * (1 - sai),
          whiteSpace: "pre-wrap",
        }}
      >
        {pagina.palavras.map((p, i) => (
          <span key={i} style={p.destaque ? { color: escura ? "#9B2737" : "#FFC9D1" } : undefined}>
            {i === 0 ? p.text.trimStart() : p.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Legendas: React.FC<{ arquivo: string; ancora: Ancora; ocultar: [number, number][] }> = ({ arquivo, ancora, ocultar }) => {
  const { fps } = useVideoConfig();
  const [palavras, setPalavras] = useState<Palavra[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [h] = useState(() => delayRender("legendas"));
  useEffect(() => {
    fetch(staticFile(arquivo))
      .then((r) => r.json())
      .then((l: Palavra[]) => {
        setPalavras(l);
        continueRender(h);
      })
      .catch((e) => cancelRender(e));
  }, [arquivo, continueRender, cancelRender, h]);
  const paginas = useMemo(() => (palavras ? paginar(palavras) : []), [palavras]);
  return (
    <AbsoluteFill>
      {paginas.map((pg, i) => {
        const s = pg.de / 1000;
        if (ocultar.some(([a, b]) => s >= a && s < b)) return null;
        const de = Math.round(s * fps);
        const dur = Math.round((pg.ate / 1000) * fps) - de;
        if (dur < 2) return null;
        return (
          <Sequence key={i} name={`Legenda · ${pg.palavras.map((p) => p.text).join("").trim()}`} from={de} durationInFrames={dur}>
            <PaginaLegenda pagina={pg} dur={dur} ancora={ancora} de={de} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
