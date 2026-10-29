import { POPPINS, TEMA } from "./marca";

// Linha em Poppins com palavra-chave em negrito, como nos posts aprovados ("aberta pras *festas de fim de ano*").
export const Rico: React.FC<{ t: string; tamanho?: number; cor?: string; peso?: number }> = ({ t, tamanho = 30, cor = TEMA.texto, peso = 400 }) => (
  <span style={{ fontFamily: POPPINS, fontWeight: peso, fontSize: tamanho, color: cor, textShadow: TEMA.sombraTxt, lineHeight: 1.3 }}>
    {t.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith("*") ? <b key={i} style={{ fontWeight: 600 }}>{p.slice(1, -1)}</b> : <span key={i}>{p}</span>))}
  </span>
);

// assinatura entre fios (como nos posts)
export const Assinatura: React.FC<{ vis?: number; tamanho?: number }> = ({ vis = 1, tamanho = 19 }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, opacity: vis }}>
    <div style={{ width: 46, height: 1.2, background: TEMA.acento }} />
    <div style={{ fontFamily: POPPINS, fontWeight: 400, fontSize: tamanho, letterSpacing: 6, color: TEMA.texto, textShadow: TEMA.sombraTxt }}>ARY MAGALHÃES</div>
    <div style={{ width: 46, height: 1.2, background: TEMA.acento }} />
  </div>
);

// opção C: sombreado bem suave só atrás do bloco de texto (nada de faixa na tela)
export const Veu: React.FC<{ x: number; y: number; w: number; h: number; vis?: number }> = ({ x, y, w, h, vis = 1 }) =>
  TEMA.veu ? (
    <div
      style={{
        position: "absolute",
        left: x - w * 0.15,
        top: y - h * 0.2,
        width: w * 1.3,
        height: h * 1.4,
        background: "radial-gradient(ellipse at center, rgba(25,16,10,0.34) 0%, rgba(25,16,10,0.18) 45%, rgba(25,16,10,0) 72%)",
        filter: "blur(10px)",
        opacity: vis,
        pointerEvents: "none",
      }}
    />
  ) : null;
