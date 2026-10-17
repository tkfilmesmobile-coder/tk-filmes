// Câmera virtual que segue o rosto da apresentadora (rastreio YuNet em public/rastreio.json).
// Mantém o rosto centralizado na horizontal e na altura-alvo, suave como um operador de câmera,
// e nunca deixa aparecer borda: se precisar deslocar mais, aumenta o zoom só o necessário.
import rastreio from "../public/rastreio.json";

type Ponto = { t: number; x: number; y: number; w: number };
const W = 1080, H = 1920, ALVO_Y = 0.34;

function mediana(v: number[]) { const s = [...v].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }

// suavização centrada (não atrasa o movimento: o vídeo é renderizado, não ao vivo)
function suavizar(v: number[], raio: number) {
  return v.map((_, i) => {
    let soma = 0, peso = 0;
    for (let k = -raio; k <= raio; k++) {
      const j = Math.min(v.length - 1, Math.max(0, i + k));
      const p = 0.5 + 0.5 * Math.cos((Math.PI * k) / (raio + 1)); // janela de Hann
      soma += v[j] * p; peso += p;
    }
    return soma / peso;
  });
}

export function criarCamera(total: number, fps: number) {
  const ps = rastreio as Ponto[];
  // descarta leituras falsas: longe da mediana local
  const bons = ps.filter((p, i) => {
    const viz = ps.slice(Math.max(0, i - 4), i + 5);
    return Math.abs(p.y - mediana(viz.map((v) => v.y))) < 0.05 && Math.abs(p.x - mediana(viz.map((v) => v.x))) < 0.06;
  });
  const naHora = (t: number, k: "x" | "y") => {
    if (t <= bons[0].t) return bons[0][k];
    for (let i = 1; i < bons.length; i++) if (bons[i].t >= t) {
      const a = bons[i - 1], b = bons[i], r = (t - a.t) / (b.t - a.t || 1);
      return a[k] + (b[k] - a[k]) * r;
    }
    return bons[bons.length - 1][k];
  };
  const fx = suavizar(Array.from({ length: total }, (_, i) => naHora(i / fps, "x")), 14);
  const fy = suavizar(Array.from({ length: total }, (_, i) => naHora(i / fps, "y")), 14);

  // zoom mínimo pra centralizar sem borda, em cada quadro
  const precisa = fx.map((x, i) => {
    for (let s = 1; s < 1.5; s += 0.002) {
      const tx = -(x - 0.5) * W * s, ty = ALVO_Y * H - ((fy[i] - 0.5) * H * s + H / 2);
      if (Math.abs(tx) <= ((s - 1) * W) / 2 && Math.abs(ty) <= ((s - 1) * H) / 2) return s;
    }
    return 1.5;
  });
  // o zoom não pode ficar abaixo do necessário em nenhum quadro: envelope máximo e depois suaviza
  const env = precisa.map((_, i) => Math.max(...precisa.slice(Math.max(0, i - 12), i + 13)));
  const zoomMin = suavizar(env, 12).map((v, i) => Math.max(v, precisa[i]));

  return (frame: number, zoomPlano: number) => {
    const i = Math.min(total - 1, Math.max(0, frame));
    const s = Math.max(zoomPlano, zoomMin[i]);
    let tx = -(fx[i] - 0.5) * W * s, ty = ALVO_Y * H - ((fy[i] - 0.5) * H * s + H / 2);
    const lx = ((s - 1) * W) / 2, ly = ((s - 1) * H) / 2;
    tx = Math.max(-lx, Math.min(lx, tx)); ty = Math.max(-ly, Math.min(ly, ty));
    return { s, tx, ty };
  };
}
