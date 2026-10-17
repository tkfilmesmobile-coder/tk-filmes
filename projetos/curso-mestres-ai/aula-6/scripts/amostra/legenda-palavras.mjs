// Monta a legenda por palavra da amostra (tempos do Whisper por clipe + deslocamento do clipe na edição).
// Correções de ouvido: "voltar" -> "votar" (contexto das urnas), "computado" -> "computada" (a prova de vida).
// Uso: node scripts/amostra/legenda-palavras.mjs
import fs from "fs";
const B = 2033; // clipe B entra no frame 61 (2,033 s)
const palavras = [
  ["Acabou", 90], ["a", 480], ["prova", 560], ["de", 970], ["vida", 1130], ["no", 1460], ["INSS.", 1750, true],
  ["Você", B + 200], ["sabia", B + 360], ["que", B + 680], ["a", B + 940], ["partir", B + 1020], ["do", B + 1350], ["momento", B + 1480, true],
  ["que", B + 2000], ["você", B + 2150], ["vai", B + 2410], ["nas", B + 2580], ["urnas", B + 2730], ["votar,", B + 3140, true],
  ["agora", B + 3500], ["dia", B + 3840], ["4/10,", B + 4010, true],
  ["já", B + 4880], ["é", B + 5000], ["computada", B + 5400, true],
];
const legendas = palavras.map(([t, ini, quebra], i) => ({
  text: (i === 0 ? "" : " ") + t,
  startMs: ini,
  endMs: palavras[i + 1]?.[1] ?? 8000,
  timestampMs: null,
  confidence: null,
  ...(quebra ? { pageBreakAfter: true } : {}),
}));
fs.writeFileSync("public/legendas/amostra-8s.json", JSON.stringify(legendas, null, 2));
console.log(legendas.length, "palavras");
