import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import type { PalavraLegenda } from "./tipos";

const { fontFamily } = loadFont("normal", { weights: ["600"], subsets: ["latin", "latin-ext"] });

// Legenda base do perfil: branca, sem caixa, poucas palavras por vez, centro-inferior,
// acima da área dos botões do Reels. Só acompanha a fala; não compete com ela.
type Pagina = { palavras: PalavraLegenda[]; startMs: number; endMs: number };

const paginar = (palavras: PalavraLegenda[]): Pagina[] => {
  const paginas: Pagina[] = [];
  let atual: PalavraLegenda[] = [];
  const fecha = () => {
    if (atual.length) {
      paginas.push({ palavras: atual, startMs: atual[0].startMs, endMs: atual[atual.length - 1].endMs });
      atual = [];
    }
  };
  for (const p of palavras) {
    const pausa = atual.length && p.startMs - atual[atual.length - 1].endMs > 700;
    const longa = atual.length && p.startMs - atual[0].startMs > 1800;
    if (pausa || longa || atual.length >= 4) fecha();
    atual.push(p);
    if (/[.?!…:]$/.test(p.text.trim())) fecha();
  }
  fecha();
  return paginas;
};

// Destaque: só a palavra-chave, em rosa (vermelho só se for dor). Nunca duas na mesma frase.
const COR_DESTAQUE = { rosa: "#FF86A6", azul: "#8CCDF6", vermelho: "#FF5A5F" } as const;

const Palavra: React.FC<{ texto: string; entraEm: number; cor?: "rosa" | "azul" | "vermelho" }> = ({ texto, entraEm, cor }) => {
  void entraEm;
  return (
    <span style={{ display: "inline-block", color: cor ? COR_DESTAQUE[cor] : undefined }}>{texto}</span>
  );
};

// Estilo padrão (versões antigas) e estilo da correção técnica de 2026-09-30: maior, 120 px mais alta,
// sombra/contorno só pra leitura.
export type EstiloLegenda = { base: number; tamanho: number; sombra: string };
const PADRAO: EstiloLegenda = { base: 470, tamanho: 44, sombra: "0 2px 14px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.5)" };
export const LEGENDA_V3: EstiloLegenda = { base: 590, tamanho: 54, sombra: "0 1px 2px rgba(0,0,0,0.35), 0 0 14px rgba(0,0,0,0.22)" };

const Frase: React.FC<{ pagina: Pagina; duracao: number; estilo: EstiloLegenda }> = ({ pagina, duracao, estilo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: estilo.base,
        paddingLeft: 100,
        paddingRight: 100,
        opacity: duracao < 6 ? 1 : interpolate(frame, [0, 2, duracao - 2, duracao], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 600,
          fontSize: estilo.tamanho,
          lineHeight: 1.22,
          color: "#FFFFFF",
          textAlign: "center",
          textWrap: "balance",
          maxWidth: 880,
          textShadow: estilo.sombra,
        }}
      >
        {pagina.palavras.map((p, i) => (
          <span key={i}>
            {i > 0 ? " " : null}
            <Palavra texto={p.text.trim()} cor={p.cor} entraEm={Math.round(((p.startMs - pagina.startMs) / 1000) * fps)} />
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// "ocultar": janelas (ms) em que a legenda sai da tela (headline ocupando a cena). A frase que
// estiver no ar é encerrada no início da janela.
export const Legendas: React.FC<{ palavras: PalavraLegenda[]; estilo?: EstiloLegenda; ocultar?: [number, number][] }> = ({
  palavras,
  estilo = PADRAO,
  ocultar = [],
}) => {
  const { fps } = useVideoConfig();
  const dentro = (ms: number) => ocultar.some(([a, b]) => ms >= a && ms < b);
  const paginas = paginar(palavras.filter((p) => !dentro(p.startMs)));
  return (
    <AbsoluteFill>
      {paginas.map((pg, i) => {
        const inicio = Math.round((pg.startMs / 1000) * fps);
        const proxima = paginas[i + 1];
        const fimFala = Math.round((pg.endMs / 1000) * fps) + 12;
        const proxJanela = ocultar.map(([a]) => a).filter((a) => a > pg.startMs).sort((x, y) => x - y)[0];
        let fim = proxima ? Math.min(fimFala, Math.round((proxima.startMs / 1000) * fps)) : fimFala;
        if (proxJanela !== undefined) fim = Math.min(fim, Math.round((proxJanela / 1000) * fps));
        // frase que sobraria com menos de 1/4 s (cortada pela headline) não entra: pisca e não se lê
        if (fim - inicio < 8) return null;
        return (
          <Sequence key={i} name={`Legenda ${i + 1}`} from={inicio} durationInFrames={fim - inicio}>
            <Frase pagina={pg} duracao={fim - inicio} estilo={estilo} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
