import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";
import { POPPINS, REVELA, TEMA, clamp } from "./marca";
import { Veu } from "./Texto";

// Legenda no padrão da linha dos posts aprovados (2026-10-24): Poppins regular, menor, palavra-chave em negrito.

// Legenda da Ary: frase curta (até ~28 letras por página), Poppins 600, café escuro com um halo claro
// (o salão é claro: parede branca e roupa clara), palavra-chave em caramelo. Logo abaixo do rosto.
type Palavra = { text: string; startMs: number; endMs: number; destaque?: boolean; quebra?: boolean };
type Pagina = { palavras: Palavra[]; de: number; ate: number };

const MAX = 32;

const paginar = (ps: Palavra[]): Pagina[] => {
  const paginas: Pagina[] = [];
  let atual: Palavra[] = [];
  const fecha = () => {
    if (atual.length) paginas.push({ palavras: atual, de: atual[0].startMs, ate: atual[atual.length - 1].endMs });
    atual = [];
  };
  for (const p of ps) {
    const texto = (atual.map((x) => x.text).join("") + p.text).trim();
    if (atual.length && (texto.length > MAX || p.quebra)) fecha();
    atual.push(p);
    const agora = atual.map((x) => x.text).join("").trim();
    if (/[.?!]$/.test(p.text.trim()) || (/,$/.test(p.text.trim()) && agora.length > MAX * 0.4)) fecha();
  }
  fecha();
  return paginas.map((pg, i) => ({ ...pg, ate: Math.min(paginas[i + 1]?.de ?? Infinity, pg.ate + 400) }));
};

const PaginaLegenda: React.FC<{ pagina: Pagina; dur: number; y: number }> = ({ pagina, dur, y }) => {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 5], [0, 1], { ...clamp, easing: REVELA });
  const sai = interpolate(f, [dur - 3, dur], [0, 1], clamp);
  return (
    <>
    <Veu x={200} y={y - 6} w={580} h={70} vis={entra * (1 - sai)} />
    <div
      style={{
        position: "absolute",
        left: 100,
        width: 780,
        top: y,
        textAlign: "center",
        fontFamily: POPPINS,
        fontWeight: 400,
        fontSize: 35,
        lineHeight: 1.3,
        color: TEMA.texto,
        textShadow: TEMA.sombraTxt,
        opacity: entra * (1 - sai),
        translate: `0px ${(1 - entra) * 12}px`,
        
      }}
    >
      {pagina.palavras.map((p, i) => (
        <span key={i} style={p.destaque ? { fontWeight: 600 } : undefined}>
          {i === 0 ? p.text.trimStart() : p.text}
        </span>
      ))}
    </div>
    </>
  );
};

export const Legendas: React.FC<{ arquivo: string; ocultar: [number, number][]; y: (s: number) => number }> = ({ arquivo, ocultar, y }) => {
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
        const e = pg.ate / 1000;
        // some a frase que começa dentro de um intervalo oculto ou passa mais da metade dela sobre ele
        if (ocultar.some(([a, b]) => (s >= a && s < b) || Math.max(0, Math.min(e, b) - Math.max(s, a)) > 0.5 * (e - s))) return null;
        const de = Math.round(s * fps);
        const dur = Math.round((pg.ate / 1000) * fps) - de;
        if (dur < 2) return null;
        return (
          <Sequence key={i} name={`Legenda · ${pg.palavras.map((p) => p.text).join("").trim()}`} from={de} durationInFrames={dur} layout="none">
            <PaginaLegenda pagina={pg} dur={dur} y={y(s)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
