// Gera quadros de prévia (PNG) das composições, num bundle só.
// Uso: node scripts/previa.mjs
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const QUADROS = {
  // quadros a 24 fps: título, legendas, fechamento
  // abertura: escada, mão, Alexa, luz; título; headline fase 1 e lista; cartão do link (antes e depois do toque)
  Apresentacao: [20, 60, 120, 170, 250, 627, 668, 808, 1131, 1150],
  // corte do tour (antes/depois), assinatura, cartão do link, fechamento
  Consultorio: [720, 735, 760, 1295, 1312, 1395],
};

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const [id, frames] of Object.entries(QUADROS)) {
  const composition = await selectComposition({ serveUrl, id });
  for (const frame of frames) {
    const output = path.resolve(`out/previa/${id}-${String(frame).padStart(3, "0")}.png`);
    await renderStill({ composition, serveUrl, frame, output });
    console.log(output);
  }
}
