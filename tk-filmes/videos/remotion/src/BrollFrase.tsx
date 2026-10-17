import React from "react";
import { AbsoluteFill, Loop, OffthreadVideo, staticFile, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { ZONA } from "./Voltei";

const serif = loadSerif("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;

// Post em b-roll com uma frase (formato "áudio em alta"). Sem som: o áudio entra no celular na hora de postar.
// Aprovado pela Talyta em 2026-10-12: sem escurecimento, frase do primeiro ao último quadro, serif branca centralizada
// na faixa do foco (zonas seguras). Nos clipes do casamento (BR-001 a BR-018) entra um véu escuro (`veu`) pra frase
// ganhar destaque e o vídeo ir pro segundo plano (pedido dela, 2026-10-13). A frase entra LITERAL (texto) e quebra sozinha; o tamanho cai conforme o comprimento.
export type BrollFraseProps = { clipe: string; clipeSegundos?: number; texto?: string; linhas?: string[]; segundos?: number; veu?: number; centroY?: number };

const LARGURA = ZONA.dir - ZONA.esq - 40; // 820 px
const tamanhoPara = (texto: string) => {
  for (let fs = 96; fs >= 52; fs -= 4) {
    const porLinha = Math.floor(LARGURA / (0.44 * fs));
    if (Math.ceil(texto.length / porLinha) <= 4) return fs;
  }
  return 52;
};

export const BrollFrase: React.FC<BrollFraseProps> = ({ clipe, clipeSegundos = 5, texto, linhas, veu = 0, centroY = 905 }) => {
  const { fps } = useVideoConfig();
  const conteudo = texto ?? (linhas ?? []).join(" ");
  const fs = tamanhoPara(conteudo);
  return (
    <AbsoluteFill style={{ background: "#0d0b09" }}>
      <Loop durationInFrames={Math.max(1, Math.floor(clipeSegundos * fps))}>
        <OffthreadVideo src={staticFile(`broll/${clipe}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Loop>
      {veu > 0 ? <AbsoluteFill style={{ background: `rgba(10,7,5,${veu})` }} /> : null}
      <div style={{ position: "absolute", left: ZONA.esq + 20, width: LARGURA, top: centroY, transform: "translateY(-50%)", textAlign: "center", fontFamily: serif, fontSize: fs, lineHeight: 1.12, color: "#FFFFFF", letterSpacing: "-0.01em", textShadow: "0 2px 14px rgba(20,12,8,.45)", textWrap: "balance" as React.CSSProperties["textWrap"] }}>
        {texto ?? (linhas ?? []).map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </AbsoluteFill>
  );
};
