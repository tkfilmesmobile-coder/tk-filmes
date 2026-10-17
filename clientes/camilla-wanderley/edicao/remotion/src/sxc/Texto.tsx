import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/BarlowCondensed";

const { fontFamily: BARLOW } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin", "latin-ext"] });

// Paleta (direção de 2026-09-30, 2ª versão): rosa nos destaques (tirado dos assets, #FA6285, clareado
// pra ler sobre vídeo), branco/marfim de apoio, vermelho só pra dor/inflamação. Azul não é cor principal.
export const ROSA = "#FF86A6";
export const AZUL = "#CFE6F7";
export const VERMELHO = "#FF5A5F";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PRECISO = Easing.bezier(0.2, 0.9, 0.25, 1);

export type LinhaHeadline = { t: string; cor?: "rosa" | "vermelho" | "azul" };

// Headline conceitual: condensada, caixa alta. Entra subindo 24 px + opacidade + tracking fechando,
// em 6 quadros, sem quique. Sai em 3 quadros.
export const HeadlineClinica: React.FC<{ linhas: LinhaHeadline[]; dur: number; y: number; tamanho?: number }> = ({
  linhas,
  dur,
  y,
  tamanho = 118,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: y,
          width: "100%",
          textAlign: "center",
          fontFamily: BARLOW,
          fontWeight: 700,
          fontSize: tamanho,
          lineHeight: 0.95,
          color: "#FFFFFF",
          textShadow: "0 3px 20px rgba(0,20,40,0.45)",
          opacity: interpolate(frame, [0, 5, dur - 3, dur], [0, 1, 1, 0], clamp),
          translate: interpolate(frame, [0, 6], ["0px 24px", "0px 0px"], { ...clamp, easing: PRECISO }),
          letterSpacing: interpolate(frame, [0, 8], [0.06, 0.01], { ...clamp, easing: PRECISO }) + "em",
        }}
      >
        {linhas.map((l, i) => (
          <div key={i} style={{ color: l.cor === "rosa" ? ROSA : l.cor === "azul" ? AZUL : l.cor === "vermelho" ? VERMELHO : "#FFFFFF" }}>
            {l.t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Um lado da comparação: palavra + traço que se desenha (máscara) + ponto indicador. Sem tela dividida.
export const LadoComparacao: React.FC<{
  texto: string;
  x: number;
  y: number;
  alinhar: "left" | "right";
  cor?: "rosa" | "branco";
  sai: number; // quadro (local) em que sai
}> = ({ texto, x, y, alinhar, cor = "branco", sai }) => {
  const frame = useCurrentFrame();
  const vis = interpolate(frame, [0, 4, sai, sai + 4], [0, 1, 1, 0], clamp);
  const traco = interpolate(frame, [2, 10], [0, 1], { ...clamp, easing: PRECISO });
  const c = cor === "rosa" ? ROSA : "#FFFFFF";
  return (
    <div
      style={{
        position: "absolute",
        left: alinhar === "left" ? x : undefined,
        right: alinhar === "right" ? 1080 - x : undefined,
        top: y,
        textAlign: alinhar,
        opacity: vis,
        translate: interpolate(frame, [0, 6], ["0px 16px", "0px 0px"], { ...clamp, easing: PRECISO }),
      }}
    >
      <div
        style={{
          fontFamily: BARLOW,
          fontWeight: 700,
          fontSize: 74,
          lineHeight: 1,
          letterSpacing: "0.02em",
          color: c,
          textShadow: "0 2px 16px rgba(0,20,40,0.5)",
        }}
      >
        {texto}
      </div>
      <div style={{ display: "flex", justifyContent: alinhar === "left" ? "flex-start" : "flex-end", alignItems: "center", gap: 10, marginTop: 12 }}>
        {alinhar === "right" ? <div style={{ width: 9, height: 9, borderRadius: 9, background: c, opacity: traco }} /> : null}
        <div
          style={{
            width: 120,
            height: 3,
            borderRadius: 2,
            background: c,
            scale: `${traco} 1`,
            transformOrigin: alinhar === "left" ? "left center" : "right center",
          }}
        />
        {alinhar === "left" ? <div style={{ width: 9, height: 9, borderRadius: 9, background: c, opacity: traco }} /> : null}
      </div>
    </div>
  );
};
