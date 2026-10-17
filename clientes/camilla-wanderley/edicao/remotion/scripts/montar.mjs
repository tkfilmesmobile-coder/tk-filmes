// Monta um reel a partir da EDL (scripts/edl/<id>.json):
//   - tomadas do bruto (início/fim em segundos da fonte), com o enquadramento A/B/C do perfil
//   - palavras transcritas (scripts/cache/<fonte>.palavras.json) recortadas e levadas pro tempo da edição
//   - rosto medido por tomada (scripts/rosto.py, OpenCV) pro zoom girar em volta dele
//   - headlines, cards e CTA ancorados em segundos da fonte
// Saída: public/reels/<id>/edicao.json
// Uso: node scripts/montar.mjs <id>
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const id = process.argv[2];
if (!id) throw new Error("uso: node scripts/montar.mjs <id>");
const edl = JSON.parse(fs.readFileSync(`scripts/edl/${id}.json`, "utf8"));
const fps = edl.fps ?? 30;
const F = (s) => Math.round(s * fps);
const PY = process.env.ROSTO_PY ?? path.resolve("../../../../projetos/curso-mestres-ai/remotion/.venv-tracking/Scripts/python.exe");
const ROSTO = path.resolve("../../../../projetos/curso-mestres-ai/aula-6/scripts/rosto.py");

const ESCALA = { A: 1.0, B: 1.14, C: 1.32 };

// Áudio 16 kHz mono da fonte: usado pra achar o silêncio mais perto de cada palavra e cortar ali,
// sem comer o início ou o fim da fala e sem deixar entrar a voz de quem dirige.
const wavBuf = fs.readFileSync(`scripts/cache/${edl.wav}`);
const SR = 16000, JAN = 160; // 10 ms
const pcm = new Int16Array(wavBuf.buffer, wavBuf.byteOffset + 44, (wavBuf.length - 44) / 2);
const rmsEm = (seg) => {
  const i = Math.max(0, Math.round(seg * SR));
  let s = 0;
  for (let k = i; k < Math.min(pcm.length, i + JAN); k++) s += (pcm[k] / 32768) ** 2;
  return Math.sqrt(s / JAN);
};
const nivelFala = (a, b) => {
  const v = [];
  for (let t = a; t < b; t += 0.01) v.push(rmsEm(t));
  v.sort((x, y) => x - y);
  return v[Math.floor(v.length * 0.5)] ?? 0.02;
};
// Começa no último silêncio antes da primeira palavra; termina no primeiro silêncio depois da última.
const bordas = (ini, fim) => {
  const thr = Math.max(0.006, nivelFala(ini, fim) * 0.28);
  let a = ini - 0.05;
  for (let t = ini - 0.02; t > ini - 0.4; t -= 0.01) { if (rmsEm(t) < thr) { a = t - 0.03; break; } }
  let b = fim + 0.08;
  for (let t = fim + 0.02; t < fim + 0.4; t += 0.01) { if (rmsEm(t) < thr) { b = t + 0.04; break; } }
  return [Math.max(0, a), b];
};
// Divide a tomada em grupos de palavras separados por pausa (> 0,45 s): a pausa sai (respiração,
// hesitação, voz de quem dirige) e cada grupo vira um clipe com bordas no silêncio.
const grupos = (t) => {
  const ps = palavrasTodas.filter((p) => p.startMs / 1000 >= t.inicio - 0.05 && p.endMs / 1000 <= t.fim + 0.25);
  const gs = [];
  let g = [];
  for (const p of ps) {
    if (g.length && p.startMs - g[g.length - 1].endMs > 450) { gs.push(g); g = []; }
    g.push(p);
  }
  if (g.length) gs.push(g);
  return gs.map((g) => {
    const [a, b] = bordas(g[0].startMs / 1000, g[g.length - 1].endMs / 1000);
    return { inicio: Math.max(t.inicio - 0.3, a), fim: Math.min(t.fim + 0.3, b), palavras: g };
  });
};
const fonteMp4 = `public/${edl.fonte}`;
const palavrasTodas = JSON.parse(fs.readFileSync(`scripts/cache/${edl.palavras}`, "utf8"));
const correcoes = edl.correcoes ?? {};
// correcoes: { "palavra": "certa" } vale pra todas; { "palavra@12340": "certa" } só naquele startMs
const corrige = (t, startMs) => {
  const base = t.trim();
  const pont = base.match(/[.,?!…]+$/)?.[0] ?? "";
  const nu = base.slice(0, base.length - pont.length);
  const c = correcoes[`${nu.toLowerCase()}@${startMs}`] ?? correcoes[nu.toLowerCase()];
  return " " + (c ?? nu) + pont;
};

// Rosto por tomada: mediana das medições (a Dra. está sentada; o rosto quase não sai do lugar)
const rostoDe = (inicio, fim) => {
  const arq = `scripts/cache/${id}-${inicio}-${fim}-rosto.json`;
  if (!fs.existsSync(arq)) {
    execFileSync(`"${PY}"`, [`"${ROSTO}"`, `"${fonteMp4}"`, `"${arq}"`, `${inicio}-${fim}`], { shell: true, stdio: "inherit" });
  }
  const pts = JSON.parse(fs.readFileSync(arq, "utf8"));
  const med = (k) => {
    const s = pts.map((p) => p[k]).sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)] ?? 0.5;
  };
  return pts.length ? { x: Math.round(med("x") * 1080), y: Math.round(med("y") * 1920), w: Math.round(med("w") * 1080) } : { x: 540, y: 700, w: 300 };
};

// Mapa: segundo da fonte -> frame da edição (só dentro das tomadas)
const mapa = [];
const clipes = [];
const legendas = [];
let cursor = 0;
for (const t of edl.tomadas) {
  const gs = t.exato
    ? [{ inicio: t.inicio, fim: t.fim, palavras: palavrasTodas.filter((p) => p.startMs / 1000 < t.fim && p.endMs / 1000 > t.inicio) }]
    : grupos(t);
  if (!gs.length) throw new Error(`tomada ${t.id} sem palavras`);
  const rosto = rostoDe(t.inicio, t.fim);
  const base = ESCALA[t.zoom ?? "A"] ?? 1;
  const deriva = t.deriva ?? 0.03;
  const durTotal = gs.reduce((s, g) => s + (g.fim - g.inicio), 0);
  let acum = 0;
  gs.forEach((g, k) => {
    const dur = Math.max(1, Math.ceil((g.fim - g.inicio) * fps));
    const e0 = base + deriva * (acum / durTotal);
    const e1 = base + deriva * ((acum + g.fim - g.inicio) / durTotal);
    const lat = t.lateral ?? 0;
    const l0 = lat * (acum / durTotal), l1 = lat * ((acum + g.fim - g.inicio) / durTotal);
    let quadros = [{ f: 0, escala: e0, tx: l0, ty: 0 }, { f: dur, escala: e1, tx: l1, ty: 0 }];
    if (t.punch && t.punch.em >= g.inicio && t.punch.em <= g.fim) {
      const pf = F(t.punch.em - g.inicio);
      const ez = ESCALA[t.punch.zoom] ?? base + 0.14;
      quadros = [{ f: 0, escala: e0, tx: l0, ty: 0 }, { f: pf, escala: e0, tx: l0, ty: 0 }, { f: pf + 1, escala: ez, tx: l0, ty: 0 }, { f: dur, escala: ez + 0.02, tx: l1, ty: 0 }];
    }
    clipes.push({ id: gs.length > 1 ? `${t.id}-${k + 1}` : t.id, trimBefore: Math.floor(g.inicio * fps), from: cursor, durationInFrames: dur, rosto, quadros });
    mapa.push({ inicio: g.inicio, fim: g.fim, from: cursor });
    for (const p of g.palavras) {
      const desloc = (cursor / fps - g.inicio) * 1000;
      legendas.push({ text: corrige(p.text, p.startMs), startMs: Math.round(Math.max(0, p.startMs + desloc)), endMs: Math.round(p.endMs + desloc) });
    }
    cursor += dur;
    acum += g.fim - g.inicio;
  });
}
const tomadaDe = (seg) => {
  const m = mapa.find((x) => seg >= x.inicio && seg <= x.fim);
  if (!m) throw new Error(`segundo ${seg} não está em nenhuma tomada`);
  return m;
};
const emEdicao = (seg) => { const m = tomadaDe(seg); return m.from + F(seg - m.inicio); };
// Elemento nunca atravessa o corte: termina junto com a tomada em que nasceu
const duracao = (seg, dur) => F(Math.min(dur, tomadaDe(seg).fim - seg));

const headlines = (edl.headlines ?? []).map((h) => ({ from: emEdicao(h.em), durationInFrames: duracao(h.em, h.dur ?? 2.2), linhas: h.linhas, pos: h.pos ?? "baixo" }));
const cards = (edl.cards ?? []).map((c) => ({ from: emEdicao(c.em), durationInFrames: duracao(c.em, c.dur ?? 3.5), etiqueta: c.etiqueta, texto: c.texto }));
let cta = null;
if (edl.cta) {
  cta = { from: cursor, durationInFrames: F(edl.cta.dur ?? 2.6), texto: edl.cta.texto, sub: edl.cta.sub };
  cursor += cta.durationInFrames;
}

const saida = { fps, durationInFrames: cursor, props: { fonte: edl.fonte, clipes, headlines, cards, cta, legendas } };
fs.mkdirSync(`public/reels/${id}`, { recursive: true });
fs.writeFileSync(`public/reels/${id}/edicao.json`, JSON.stringify(saida, null, 1));
console.log(`${id}: ${clipes.length} tomadas, ${legendas.length} palavras, ${(cursor / fps).toFixed(1)} s`);
