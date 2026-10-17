// Monta a edição a partir da fala real.
// Entrada: scripts/edicao/edl.json (tomadas do bruto) e scripts/edicao/insercoes.json (imagem + palavra-âncora).
// Para cada tomada: recorta o áudio, transcreve com Whisper local, corrige termos conferidos no ouvido
// e mede o rosto. Depois ancora cada inserção na palavra falada e grava:
//   public/edicao.json            clipes, enquadramento e inserções (em frames)
//   public/legendas/edicao.json   legenda por palavra, no tempo da edição
// Uso: node scripts/montar-edicao.mjs
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const raiz = process.cwd();
const edl = JSON.parse(fs.readFileSync("scripts/edicao/edl.json", "utf8"));
const ins = JSON.parse(fs.readFileSync("scripts/edicao/insercoes.json", "utf8"));
const fps = edl.fps;
const cache = path.join(raiz, "scripts/edicao/cache");
fs.mkdirSync(cache, { recursive: true });

const WHISPER = process.env.WHISPER_DIR ?? path.join(raiz, "whisper.cpp");
const PY =
  process.env.ROSTO_PY ??
  path.join(raiz, "../remotion/.venv-tracking/Scripts/python.exe");
const versao = "1.5.5";
const modelo = "medium";

// Termos conferidos (o Whisper ouve diferente; ver roteiro-IMG_0397.txt)
const CORRECOES = {
  volta: "vota",
  voltar: "votar",
  computado: "computada",
  transchorros: "transtornos",
  trantornos: "transtornos",
  trunchos: "transtornos",
  tranchô: "transtornos",
};

// Pontuação conferida com o roteiro: a vírgula vem depois de "votar", não de "urnas".
const PONTUACAO = [[["urnas,", "votar"], ["urnas", "votar,"]]];
const corrigePontuacao = (ps) => {
  for (let i = 0; i < ps.length - 1; i++) {
    for (const [de, para] of PONTUACAO) {
      if (ps[i].text === de[0] && ps[i + 1].text === de[1]) {
        ps[i].text = para[0];
        ps[i + 1].text = para[1];
      }
    }
  }
  return ps;
};

const ffmpeg = (args) =>
  execFileSync("npx", ["remotion", "ffmpeg", "-v", "error", ...args], {
    shell: true,
    stdio: "inherit",
  });

const normal = (t) => t.toLowerCase().replace(/[.,?!…:;"]/g, "").trim();

// Junta pedaços de palavra (tokens sem espaço na frente) e aplica as correções.
const palavrasDe = (captions) => {
  const out = [];
  for (const c of captions) {
    const colado = !c.text.startsWith(" ") && out.length > 0;
    if (colado) {
      const p = out[out.length - 1];
      p.text += c.text;
      p.endMs = c.endMs;
    } else {
      out.push({ text: c.text.trim(), startMs: c.startMs, endMs: c.endMs });
    }
  }
  return out
    .filter((p) => p.text.length > 0)
    .map((p) => {
      const pont = p.text.match(/[.,?!…]+$/)?.[0] ?? "";
      const base = p.text.slice(0, p.text.length - pont.length);
      const corr = CORRECOES[base.toLowerCase()];
      return { ...p, text: (corr ?? base) + pont };
    });
};

// Posição do rosto na tela ao longo do clipe (frames da edição), suavizada,
// para as inserções acompanharem o movimento de quem fala.
const trilhaDoRosto = (arq, c, from, escala, tx, ty) => {
  const pts = JSON.parse(fs.readFileSync(arq, "utf8")).filter((p) => p.t >= c.inicio && p.t <= c.fim);
  const tela = pts.map((p) => ({
    f: from + Math.round((p.t - c.inicio) * fps),
    x: 540 + (p.x * 1080 - 540) * escala + tx,
    y: 960 + (p.y * 1920 - 960) * escala + ty,
    w: p.w * 1080 * escala,
  }));
  const media = (i, k) => {
    const viz = tela.slice(Math.max(0, i - 2), i + 3);
    return viz.reduce((s, p) => s + p[k], 0) / viz.length;
  };
  return tela.map((p, i) => ({ f: p.f, x: Math.round(media(i, "x")), y: Math.round(media(i, "y")), w: Math.round(media(i, "w")) }));
};

const mediana = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

await installWhisperCpp({ to: WHISPER, version: versao });
await downloadWhisperModel({ model: modelo, folder: WHISPER });

const clipes = [];
const legendas = [];
let cursor = 0;

for (const c of edl.clipes) {
  const chave = `${c.id}-${c.inicio}-${c.fim}`;
  const wav = path.join(cache, `${chave}.wav`);
  const trans = path.join(cache, `${chave}.json`);
  const rosto = path.join(cache, `${chave}-rosto.json`);

  if (!fs.existsSync(trans)) {
    ffmpeg(["-i", `"${edl.audio16k}"`, "-ss", c.inicio, "-t", (c.fim - c.inicio).toFixed(3),
      "-c:a", "pcm_s16le", "-y", `"${wav}"`]);
    const out = await transcribe({
      model: modelo, whisperPath: WHISPER, whisperCppVersion: versao,
      inputPath: wav, tokenLevelTimestamps: true, language: "pt",
    });
    fs.writeFileSync(trans, JSON.stringify(toCaptions({ whisperCppOutput: out }).captions, null, 2));
  }
  if (!fs.existsSync(rosto)) {
    execFileSync(`"${PY}"`, ["scripts/rosto.py", `"${edl.fonte}"`, `"${rosto}"`, `${c.inicio}-${c.fim}`],
      { shell: true, stdio: "inherit" });
  }

  // Enquadramento da gravação original: só o zoom mínimo pra centralizar o rosto na horizontal.
  const pts = [];
  for (const o of edl.clipes.filter((o) => (o.grupo ?? o.id) === (c.grupo ?? c.id))) {
    const arq = path.join(cache, `${o.id}-${o.inicio}-${o.fim}-rosto.json`);
    if (!fs.existsSync(arq)) {
      execFileSync(`"${PY}"`, ["scripts/rosto.py", `"${edl.fonte}"`, `"${arq}"`, `${o.inicio}-${o.fim}`],
        { shell: true, stdio: "inherit" });
    }
    pts.push(...JSON.parse(fs.readFileSync(arq, "utf8")));
  }
  const x = mediana(pts.map((p) => p.x)) * 1080;
  const dx = Math.abs(x - 540);
  const escala = 540 / (540 - dx); // sem sobra nas laterais
  const tx = -(x - 540) * escala;
  const ty = 0;

  const duracao = Math.round((c.fim - c.inicio) * fps);
  const from = cursor;
  clipes.push({
    id: c.id,
    grupo: c.grupo ?? c.id,
    trimBefore: Math.round(c.inicio * fps),
    from,
    durationInFrames: duracao,
    enquadramento: { escala: +escala.toFixed(3), tx: Math.round(tx), ty: Math.round(ty) },
    rosto: trilhaDoRosto(rosto, c, from, escala, tx, ty),
  });

  const offsetMs = (from / fps) * 1000;
  for (const p of corrigePontuacao(palavrasDe(JSON.parse(fs.readFileSync(trans, "utf8"))))) {
    const fimClipeMs = (duracao / fps) * 1000;
    if (p.startMs >= fimClipeMs) continue;
    legendas.push({
      clipe: c.id,
      grupo: c.grupo ?? c.id,
      text: p.text,
      startMs: Math.round(p.startMs + offsetMs),
      endMs: Math.round(Math.min(p.endMs, fimClipeMs) + offsetMs),
    });
  }
  cursor += duracao;
}

// Quebra de frase: pontuação, limite de ~30 caracteres (2 linhas) ou troca de clipe.
const saidaLegendas = legendas.map((p, i) => {
  const prox = legendas[i + 1];
  return {
    text: (i === 0 ? "" : " ") + p.text,
    startMs: p.startMs,
    endMs: p.endMs,
    timestampMs: null,
    confidence: null,
    _clipe: p.grupo,
    _prox: prox,
  };
});
let tamanho = 0;
for (const p of saidaLegendas) {
  tamanho += p.text.length;
  const quebra =
    /[.,?!…]$/.test(p.text) || !p._prox || p._prox.grupo !== p._clipe || tamanho + p._prox.text.length > 30;
  if (quebra) {
    p.pageBreakAfter = true;
    tamanho = 0;
  }
  delete p._clipe;
  delete p._prox;
}

// Inserções: começam na palavra-âncora (um pouco antes), uma de cada vez.
const r = ins.regras;
const insercoes = [];
for (const it of ins.insercoes) {
  const palavra = legendas.find(
    (p) => (p.clipe === it.clipe || p.grupo === it.clipe) && normal(p.text) === normal(it.ancora),
  );
  const clipe = palavra && clipes.find((c) => c.id === palavra.clipe);
  if (!clipe || !palavra) {
    console.warn(`!! âncora não achada: "${it.ancora}" no clipe ${it.clipe} (inserção ignorada)`);
    continue;
  }
  const from = Math.max(clipe.from, Math.round((palavra.startMs / 1000) * fps) - r.antecipaFrames);
  const fimClipe = clipe.from + clipe.durationInFrames;
  const fim = it.ateFimDoClipe ? fimClipe : Math.min(from + r.duracaoMaxFrames, fimClipe);
  insercoes.push({ arquivo: `assets/${it.arquivo}`, ancora: palavra.text, from, fim, clipe: clipe.id, lado: it.lado });
}
insercoes.sort((a, b) => a.from - b.from);
for (let i = 0; i < insercoes.length; i++) {
  const prox = insercoes[i + 1];
  if (prox && insercoes[i].fim > prox.from - r.folgaEntreFrames) {
    insercoes[i].fim = prox.from - r.folgaEntreFrames;
  }
}
const validas = insercoes
  .map((i) => ({ arquivo: i.arquivo, ancora: i.ancora, clipe: i.clipe, lado: i.lado, from: i.from, durationInFrames: i.fim - i.from }))
  .filter((i) => {
    if (i.durationInFrames < r.duracaoMinFrames) console.warn(`!! "${i.ancora}" ficou curta demais e saiu`);
    return i.durationInFrames >= r.duracaoMinFrames;
  });

validas.forEach((i, n) => {
  i.lado = i.lado ?? (n % 2 === 0 ? "esquerda" : "direita");
});

// Copia só as imagens usadas da pasta assets/ para public/assets/ (o Remotion serve a partir de public/).
for (const i of validas) {
  const origem = path.join(ins.pasta, i.arquivo.replace(/^assets\//, ""));
  const destino = path.join("public", i.arquivo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.copyFileSync(origem, destino);
}

fs.writeFileSync("public/edicao.json", JSON.stringify({ fps, durationInFrames: cursor, clipes, insercoes: validas }, null, 2));
fs.mkdirSync("public/legendas", { recursive: true });
fs.writeFileSync("public/legendas/edicao.json", JSON.stringify(saidaLegendas, null, 2));

console.log(`\nDuração: ${(cursor / fps).toFixed(2)} s (${cursor} frames)`);
for (const c of clipes) {
  const txt = legendas.filter((p) => p.clipe === c.id).map((p) => p.text).join(" ");
  console.log(`[${(c.from / fps).toFixed(2)}s] ${c.id} ${JSON.stringify(c.enquadramento)}\n   ${txt}`);
}
console.log("\nInserções:");
for (const i of validas) {
  console.log(`  ${(i.from / fps).toFixed(2)}s → ${((i.from + i.durationInFrames) / fps).toFixed(2)}s  "${i.ancora}"  ${i.lado}  ${path.basename(i.arquivo)}`);
}
