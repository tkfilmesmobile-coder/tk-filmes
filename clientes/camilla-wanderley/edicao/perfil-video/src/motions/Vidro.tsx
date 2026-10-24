import { Easing, interpolate } from "remotion";
import { MONTSERRAT, PLAYFAIR } from "../periodontite/Bloco";

// Linguagem das animações explicativas da Dra. Camilla (pedido da Talyta em 2026-10-23: "sofisticada,
// profissional e elegante, sem fundo branco"): vidro escuro translúcido por cima do próprio vídeo, filete
// fino claro, caixa alta espaçada (Montserrat), números e palavras-chave em serifa (Playfair), acento rosé.
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const REVELA = Easing.bezier(0.16, 1, 0.3, 1);
export const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
export const ROSE_CLARO = "#F6C9CF";
export const ROSE = "#E59AA6";
export const VERDE_OK = "#BFE8D2";
export const ALERTA = "#FF8C8C";
export { MONTSERRAT, PLAYFAIR };

// entrada/saída padrão de um elemento: p (0..1) com revelação suave; s em segundos locais
export const surge = (s: number, de: number, dur = 0.55) => interpolate(s, [de, de + dur], [0, 1], { ...clamp, easing: REVELA });
export const some = (s: number, ate: number, dur = 0.4) => interpolate(s, [ate - dur, ate], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) });

export const Vidro: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  p: number;
  children: React.ReactNode;
  raio?: number;
  pad?: number;
  destaque?: boolean;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, p, children, raio = 34, pad = 34, destaque = false, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      padding: pad,
      boxSizing: "border-box",
      borderRadius: raio,
      background: "linear-gradient(160deg, rgba(36,18,24,0.52) 0%, rgba(20,10,14,0.40) 100%)",
      backdropFilter: "blur(22px) saturate(1.2)",
      WebkitBackdropFilter: "blur(22px) saturate(1.2)",
      border: `1.5px solid ${destaque ? "rgba(246,201,207,0.75)" : "rgba(255,255,255,0.28)"}`,
      boxShadow: "0 24px 60px rgba(10,4,6,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
      opacity: p,
      translate: `0px ${(1 - p) * 26}px`,
      scale: 0.96 + 0.04 * p,
      color: "#FFFFFF",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Tag: React.FC<{ texto: string; cor?: string; tamanho?: number; style?: React.CSSProperties }> = ({ texto, cor = ROSE_CLARO, tamanho = 22, style }) => (
  <div style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: tamanho, letterSpacing: 6, color: cor, textTransform: "uppercase", ...style }}>{texto}</div>
);

export const Serifa: React.FC<{ texto: React.ReactNode; tamanho?: number; cor?: string; style?: React.CSSProperties }> = ({ texto, tamanho = 64, cor = "#FFFFFF", style }) => (
  <div style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: tamanho, lineHeight: 1.05, letterSpacing: -1, color: cor, ...style }}>{texto}</div>
);

export const Texto: React.FC<{ texto: React.ReactNode; tamanho?: number; cor?: string; style?: React.CSSProperties }> = ({ texto, tamanho = 28, cor = "rgba(255,255,255,0.86)", style }) => (
  <div style={{ fontFamily: MONTSERRAT, fontWeight: 500, fontSize: tamanho, lineHeight: 1.3, color: cor, ...style }}>{texto}</div>
);

// rótulo com fio (aponta pra algo na tela): ponto + fio + texto
export const Rotulo: React.FC<{ x: number; y: number; lado: "esq" | "dir"; fio: number; p: number; tag: string; texto: string }> = ({ x, y, lado, fio, p, tag, texto }) => {
  const dir = lado === "dir" ? 1 : -1;
  const L = fio * p;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", opacity: Math.min(1, p * 1.6) }}>
      <div style={{ position: "absolute", left: x - 7, top: y - 7, width: 14, height: 14, borderRadius: 7, background: "#FFFFFF", boxShadow: "0 0 18px rgba(255,255,255,0.9)", scale: p }} />
      <div style={{ position: "absolute", left: dir > 0 ? x : x - L, top: y - 1, width: L, height: 2, background: "rgba(255,255,255,0.85)" }} />
      <div
        style={{
          position: "absolute",
          top: y - 46,
          left: dir > 0 ? x + fio + 18 : undefined,
          right: dir < 0 ? 1080 - (x - fio - 18) : undefined,
          textAlign: dir > 0 ? "left" : "right",
          opacity: interpolate(p, [0.5, 1], [0, 1], clamp),
          textShadow: "0 2px 18px rgba(10,4,6,0.6)",
        }}
      >
        <Tag texto={tag} tamanho={20} />
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 44, color: "#FFFFFF", marginTop: 6, whiteSpace: "nowrap" }}>{texto}</div>
      </div>
    </div>
  );
};
