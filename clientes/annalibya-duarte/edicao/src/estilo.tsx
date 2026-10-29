import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";

// Linha visual da Dra. Annalibya (2026-10-28): elegante e clean, a partir das referências do Cosmos
// (Dentafly: título em duas pesagens; Clínica Neiva: luz suave e cenário limpo).
// Serifa fina em itálico pro nome, sans espaçada pros detalhes, um fio champanhe como único acento.

// os vídeos dela vêm do iPhone a 24 fps: a edição segue no mesmo ritmo
export const FPS = 24;

// nome como está no letreiro do consultório: "Dra. Anna Líbya Duarte" (com acento no í, Talyta 2026-10-29)
export const NOME = "Dra. Anna Líbya";
export const NOME_COMPLETO = "Anna Líbya Duarte";

export const COR = {
  branco: "#FFFFFF",
  marfim: "#F7F3EC",
  champanhe: "#D6C1A1",
  tinta: "#24303B",
};

loadCormorant("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] });
export const serif = loadCormorant("italic", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const sans = loadMontserrat("normal", { weights: ["400", "500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;

// Zonas seguras do reels (regra geral de 2026-10-12): x 60–920, y 250–1500.
export const ZONA = { x0: 60, x1: 920, y0: 250, y1: 1500, centroX: 490 };

// CRO obrigatório em toda peça de cirurgião-dentista (CFO). Número passado pela Talyta em 2026-10-29.
export const CRO = "CRO-AL 3773";

export const suave = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const sombra = "0 2px 10px rgba(0,0,0,0.35), 0 6px 30px rgba(0,0,0,0.25)";

// entrada padrão: sobe 14 px, tira o desfoque e acende
export const entrada = (frame: number, de: number, dur = 12) => ({
  opacity: interpolate(frame, [de, de + dur], [0, 1], clamp),
  translate: `0px ${interpolate(frame, [de, de + dur], [14, 0], { ...clamp, easing: suave })}px`,
  filter: `blur(${interpolate(frame, [de, de + dur], [5, 0], clamp)}px)`,
});

// ── Fundo: o vídeo bruto (ou a imagem de referência, na prévia) com cor limpa e leve aproximação
export const Fundo: React.FC<{ src: string; tipo: "video" | "imagem"; trimBefore?: number }> = ({
  src,
  tipo,
  trimBefore,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const estilo: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: 1080,
    height: 1920,
    objectFit: "cover",
    // cor clean: o vídeo já vem bonito; só um toque de luz e saturação contida
    filter: "brightness(1.02) saturate(0.96)",
    scale: String(interpolate(frame, [0, durationInFrames], [1, 1.04], clamp)),
  };
  return (
    <AbsoluteFill>
      {tipo === "video" ? (
        <Video src={staticFile(src)} trimBefore={trimBefore} style={estilo} />
      ) : (
        <Img src={staticFile(src)} style={estilo} />
      )}
      {/* sombra suave só no pé do quadro, pra o texto respirar sem caixa */}
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 52%, rgba(0,0,0,0.32) 78%, rgba(0,0,0,0.42) 100%)" }}
      />
    </AbsoluteFill>
  );
};

// ── Título de abertura: linha pequena espaçada + nome em serifa itálica + fio + complemento
export const Titulo: React.FC<{ acima: string; principal: string; abaixo?: string; dur: number }> = ({
  acima,
  principal,
  abaixo,
  dur,
}) => {
  const frame = useCurrentFrame();
  const sai = interpolate(frame, [dur - 12, dur], [1, 0], clamp);
  const fio = interpolate(frame, [22, 44], [0, 150], { ...clamp, easing: suave });
  return (
    <div style={{ position: "absolute", left: 90, right: 1080 - ZONA.x1, top: 1150, opacity: sai }}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 28,
          letterSpacing: "0.34em",
          textTransform: "uppercase",
          color: COR.branco,
          textShadow: sombra,
          ...entrada(frame, 4),
        }}
      >
        {acima}
      </div>
      <div
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 132,
          lineHeight: 1,
          marginTop: 14,
          color: COR.branco,
          textShadow: sombra,
        }}
      >
        {principal.split(" ").map((p, i) => (
          <span key={i} style={{ display: "inline-block", marginRight: "0.22em", ...entrada(frame, 10 + i * 6, 14) }}>
            {p}
          </span>
        ))}
      </div>
      <div style={{ width: fio, height: 2, backgroundColor: COR.champanhe, marginTop: 26 }} />
      {abaixo ? (
        <div
          style={{
            fontFamily: sans,
            fontWeight: 400,
            fontSize: 26,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: COR.branco,
            marginTop: 22,
            textShadow: sombra,
            ...entrada(frame, 34),
          }}
        >
          {abaixo}
        </div>
      ) : null}
    </div>
  );
};

// ── Legenda: leve, sem caixa, palavra por palavra, logo abaixo do rosto (y 900–1080)
// Tempos em quadros, relativos à Sequence da legenda. Vêm da retranscrição do áudio final, nunca de memória.
export type Palavra = { texto: string; de: number; ate: number; quebra?: boolean };

export const Legenda: React.FC<{ palavras: Palavra[]; top?: number }> = ({ palavras, top = 960 }) => {
  const frame = useCurrentFrame();
  // um bloco por frase curta: fecha na palavra marcada com quebra (nunca corta a frase no meio)
  const blocos: Palavra[][] = [];
  palavras.forEach((p) => {
    const atual = blocos[blocos.length - 1];
    if (!atual || atual[atual.length - 1].quebra) blocos.push([p]);
    else atual.push(p);
  });
  // cada bloco fica até a última palavra acabar (+ folga do legendas.py), ou até o próximo começar
  const bloco = blocos.find(
    (b, i) => frame >= b[0].de && frame < Math.min(blocos[i + 1]?.[0].de ?? Infinity, b[b.length - 1].ate),
  );
  if (!bloco) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: ZONA.x0,
        width: ZONA.x1 - ZONA.x0,
        top,
        textAlign: "center",
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 58,
        lineHeight: 1.15,
        color: COR.branco,
        textShadow: sombra,
      }}
    >
      {bloco.map((p, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "0.26em",
            opacity: interpolate(frame, [p.de, p.de + 4], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [p.de, p.de + 5], [8, 0], { ...clamp, easing: suave })}px`,
          }}
        >
          {p.texto}
        </span>
      ))}
    </div>
  );
};

// monta a lista de palavras com ritmo fixo (só pra prévia, antes da retranscrição)
export const ritmo = (frases: string[], passo = 7, pausa = 10): Palavra[] => {
  const out: Palavra[] = [];
  let t = 0;
  frases.forEach((f) => {
    const ps = f.split(" ");
    ps.forEach((texto, i) => {
      out.push({ texto, de: t, ate: t + passo, quebra: i === ps.length - 1 });
      t += passo;
    });
    t += pausa;
  });
  return out;
};

// ── Assinatura: nome e profissão no pé do quadro, quando ela aparece falando
export const Assinatura: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const sai = interpolate(frame, [dur - 12, dur], [1, 0], clamp);
  const fio = interpolate(frame, [8, 26], [0, 110], { ...clamp, easing: suave });
  return (
    <div style={{ position: "absolute", left: 90, top: 1300, opacity: sai }}>
      <div
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 76,
          lineHeight: 1,
          color: COR.branco,
          textShadow: sombra,
          ...entrada(frame, 0, 14),
        }}
      >
        {NOME}
      </div>
      <div style={{ width: fio, height: 2, backgroundColor: COR.champanhe, margin: "18px 0 16px" }} />
      <div
        style={{
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 24,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: COR.branco,
          textShadow: sombra,
          ...entrada(frame, 14),
        }}
      >
        Cirurgiã-dentista
      </div>
    </div>
  );
};

// ── Rótulo de ambiente (vídeo do consultório): fio + nome do espaço, no alto à esquerda
export const Rotulo: React.FC<{ texto: string; dur: number }> = ({ texto, dur }) => {
  const frame = useCurrentFrame();
  const sai = interpolate(frame, [dur - 10, dur], [1, 0], clamp);
  const fio = interpolate(frame, [0, 16], [0, 56], { ...clamp, easing: suave });
  return (
    <div style={{ position: "absolute", left: 90, top: 300, display: "flex", alignItems: "center", gap: 20, opacity: sai }}>
      <div style={{ width: fio, height: 2, backgroundColor: COR.champanhe }} />
      <div
        style={{
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: COR.branco,
          textShadow: sombra,
          ...entrada(frame, 6),
        }}
      >
        {texto}
      </div>
    </div>
  );
};

// ── Cartão de endereço (vídeo do consultório): cada linha entra quando ela fala aquele pedaço.
// `linhas`: quadro de entrada (relativo à Sequence) de cada linha.
export const Endereco: React.FC<{ dur: number; linhas: [number, number, number] }> = ({ dur, linhas }) => {
  const frame = useCurrentFrame();
  const sai = interpolate(frame, [dur - 10, dur], [1, 0], clamp);
  const fio = interpolate(frame, [0, 16], [0, 56], { ...clamp, easing: suave });
  const pequena: React.CSSProperties = {
    fontFamily: sans,
    fontWeight: 500,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: COR.branco,
    textShadow: sombra,
  };
  return (
    <div style={{ position: "absolute", left: 90, top: 1170, opacity: sai }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: fio, height: 2, backgroundColor: COR.champanhe }} />
        <div style={{ ...pequena, fontSize: 24, ...entrada(frame, 4) }}>Onde estamos</div>
      </div>
      <div
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 84,
          lineHeight: 1.05,
          marginTop: 22,
          color: COR.branco,
          textShadow: sombra,
          ...entrada(frame, linhas[0], 14),
        }}
      >
        Rua Costa Rego, 278
      </div>
      <div style={{ ...pequena, fontSize: 26, marginTop: 24, ...entrada(frame, linhas[1]) }}>Centro · União dos Palmares</div>
      <div style={{ ...pequena, fontWeight: 400, fontSize: 24, marginTop: 14, ...entrada(frame, linhas[2]) }}>
        Praça do Rocha
      </div>
    </div>
  );
};

// ── Fechamento: cartão marfim com nome, profissão, CRO e cidade
export const Fecho: React.FC = () => {
  const frame = useCurrentFrame();
  const fundo = interpolate(frame, [0, 8], [0, 1], clamp);
  const fio = interpolate(frame, [12, 28], [0, 160], { ...clamp, easing: suave });
  const linha = (de: number): React.CSSProperties => ({
    fontFamily: sans,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: COR.tinta,
    ...entrada(frame, de),
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COR.marfim,
        opacity: fundo,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div style={{ ...linha(4), fontWeight: 500, fontSize: 28, marginBottom: 18 }}>Dra.</div>
      <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 118, lineHeight: 1, color: COR.tinta, ...entrada(frame, 6, 14) }}>
        {NOME_COMPLETO}
      </div>
      <div style={{ width: fio, height: 2, backgroundColor: COR.champanhe, margin: "40px 0 36px" }} />
      <div style={{ ...linha(16), fontWeight: 500, fontSize: 30 }}>Cirurgiã-dentista</div>
      <div style={{ ...linha(20), fontWeight: 400, fontSize: 24, marginTop: 22, opacity: 0.75 * entrada(frame, 20).opacity }}>
        {CRO}
      </div>
      <div style={{ ...linha(24), fontWeight: 400, fontSize: 24, marginTop: 70, opacity: 0.6 * entrada(frame, 24).opacity }}>
        União dos Palmares · AL
      </div>
    </AbsoluteFill>
  );
};
