import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./marca";

// Caixinha de perguntas no visual do Instagram (pedido da Talyta, 2026-11-04: "a mesma estética da caixinha,
// sem adicionar nada"): faixa preta com o "Faça uma pergunta", a pergunta em preto no branco.
// Fica na faixa de baixo (nunca em cima do rosto) e entra com o pulinho do sticker.
const INTER = loadInter("normal", { weights: ["400", "500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily;

export type CaixinhaDef = { de: number; ate: number; texto: string; prompt?: string; y?: number };

export const Caixinha: React.FC<{ c: CaixinhaDef; dur: number }> = ({ c, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: f, fps, config: { damping: 13, stiffness: 170, mass: 0.7 } });
  const sai = interpolate(f, [dur - 8, dur], [0, 1], clamp);
  const W = 720;
  const tam = c.texto.length > 70 ? 40 : c.texto.length > 45 ? 44 : 48;
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - W) / 2,
        top: c.y ?? 1110,
        width: W,
        transformOrigin: "50% 40%",
        transform: `scale(${(0.6 + 0.4 * entra) * (1 - 0.08 * sai)}) rotate(${(1 - entra) * -3}deg)`,
        opacity: Math.min(1, entra * 1.6) * (1 - sai),
        filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.28))",
      }}
    >
      {/* sem foto de perfil: estes vídeos vão pro perfil pessoal da Ary, não pro do salão (Talyta, 2026-11-04) */}
      <div style={{ borderRadius: 30, overflow: "hidden", background: "#fff" }}>
        <div style={{ background: "#000", padding: "32px 40px 30px", textAlign: "center", fontFamily: INTER, fontWeight: 500, fontSize: 34, color: "#fff", letterSpacing: -0.2 }}>
          {c.prompt ?? "Faça uma pergunta"}
        </div>
        <div style={{ padding: "34px 44px 40px", textAlign: "center", fontFamily: INTER, fontWeight: 500, fontSize: tam, lineHeight: 1.22, color: "#000", letterSpacing: -0.4 }}>
          {c.texto}
        </div>
      </div>
    </div>
  );
};
