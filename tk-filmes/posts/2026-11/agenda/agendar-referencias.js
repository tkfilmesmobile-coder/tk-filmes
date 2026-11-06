#!/usr/bin/env node
/**
 * Agenda os 17 posts feitos a partir das referências (aprovados pela Talyta em 2026-11-04) no Instagram (@tk.filmes)
 * e no TikTok (Tk Filmes), ao meio-dia, um por dia. Artes em tk-filmes/posts/2026-11/referencias/artes,
 * legendas em referencias/legendas.md. Instagram recebe PNG (ordem do carrossel conferida); TikTok recebe JPG
 * (1ª linha da legenda vira o título). Retoma de onde parou (agendados-referencias.jsonl). Nunca imprime tokens.
 *
 * uso (na raiz do sistema): node --env-file=.env tk-filmes/posts/2026-11/agenda/agendar-referencias.js [--dry-run]
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const API = "https://api.postforme.dev";
const KEY = (process.env.POSTFORME_API_KEY || "").trim();
const DRY = process.argv.includes("--dry-run");
const REF = path.join("tk-filmes", "posts", "2026-11", "referencias");
const ARTES = path.join(REF, "artes");
const JPG = path.join(REF, "tiktok-jpg");
const LOG = path.join("tk-filmes", "posts", "2026-11", "agenda", "agendados-referencias.jsonl");
const FF = "C:\\Users\\kumyt\\AppData\\Local\\CapCut\\Apps\\9.6.0.4097\\ffmpeg.exe";
const CONTA = { instagram: "spc_3o1UyIWZkCpXMV3jwRS41", tiktok: "spc_dzTk21vgIiyZyAYUjTDbg" };
const NOME = { instagram: "tk.filmes", tiktok: "Tk Filmes" };
const PAUSA = 75;
const h = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const dormir = (s) => new Promise((r) => setTimeout(r, s * 1000));

const GRADE = [
  ["2026-11-14", "tweet-23h"], ["2026-11-15", "carrossel-melancia"],
  ["2026-11-21", "tweet-intencionalidade"], ["2026-11-22", "carrossel-verdades"],
  ["2026-11-28", "tweet-malabarista"], ["2026-11-29", "carrossel-planta"],
  ["2026-12-02", "frase-um-pra-cem"], ["2026-12-03", "carrossel-repeticao"], ["2026-12-04", "tweet-coragem"],
  ["2026-12-05", "frase-dia-bom"], ["2026-12-06", "tweet-grama-do-vizinho"], ["2026-12-07", "carrossel-custa-sozinho"],
  ["2026-12-08", "tweet-lembrado"], ["2026-12-09", "frase-talento-parado"], ["2026-12-10", "tweet-regra-aparecer"],
  ["2026-12-11", "tweet-videozinho"], ["2026-12-12", "frase-so-postar"],
];

function legendas() {
  const txt = fs.readFileSync(path.join(REF, "legendas.md"), "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const m = {};
  for (const bloco of txt.split(/\n---\n/)) {
    const lin = bloco.trim().split("\n");
    const cab = lin.findIndex((l) => l.startsWith("## "));
    if (cab < 0) continue;
    const slug = lin[cab].slice(3).split(" ")[0];
    m[slug] = lin.slice(cab + 1).join("\n").trim();
  }
  return m;
}
async function api(ep, opt = {}) {
  for (let t = 1; t <= 4; t++) {
    const r = await fetch(API + ep, { ...opt, headers: h });
    const txt = await r.text();
    if (r.status === 429) { console.log("  429, esperando 90 s..."); await dormir(90); continue; }
    if (!r.ok) throw new Error(`API ${r.status} em ${ep}: ${txt.slice(0, 300)}`);
    return txt ? JSON.parse(txt) : {};
  }
  throw new Error(`API 429 repetido em ${ep}`);
}
async function subir(arquivo) {
  const { upload_url, media_url } = await api("/v1/media/create-upload-url", { method: "POST", body: "{}" });
  const tipo = arquivo.endsWith(".png") ? "image/png" : "image/jpeg";
  const r = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": tipo }, body: fs.readFileSync(arquivo) });
  if (!r.ok) throw new Error(`upload falhou ${r.status}`);
  return media_url;
}
const md5 = (b) => crypto.createHash("md5").update(b).digest("hex");
function jpg(png) {
  const d = path.join(JPG, path.basename(png).replace(/\.png$/, ".jpg"));
  if (!fs.existsSync(d)) {
    const r = spawnSync(FF, ["-y", "-loglevel", "error", "-i", png, "-q:v", "2", d]);
    if (r.status !== 0) throw new Error(`não converti ${png}`);
  }
  return d;
}
function tituloELegenda(cap) {
  const [primeira, ...resto] = cap.split("\n");
  const t = primeira.trim();
  if (t.length <= 90 && resto.join("\n").trim()) return { title: t, caption: resto.join("\n").trim() };
  return { title: t.slice(0, 87).replace(/\s+\S*$/, "") + "…", caption: cap };
}

(async () => {
  if (!KEY) throw new Error("POSTFORME_API_KEY não encontrada no .env");
  fs.mkdirSync(JPG, { recursive: true });
  const contas = await api("/v1/social-accounts?limit=50");
  for (const [rede, id] of Object.entries(CONTA)) {
    const a = (contas.data || contas).find((c) => c.id === id && c.status === "connected");
    if (!a || a.username !== NOME[rede]) throw new Error(`conta ${rede} da TK (${id}) não está conectada`);
  }
  const LEG = legendas();
  const feitos = new Set(fs.existsSync(LOG) ? fs.readFileSync(LOG, "utf8").split("\n").filter(Boolean).map((l) => { const j = JSON.parse(l); return `${j.slug}|${j.rede}`; }) : []);
  let criados = 0;

  for (const [dia, slug] of GRADE) {
    const cap = LEG[slug];
    if (!cap) throw new Error(`${slug}: legenda não achada no legendas.md`);
    const pngs = fs.readdirSync(ARTES).filter((f) => f === `${slug}.png` || new RegExp(`^${slug}-\\d\\d\\.png$`).test(f)).sort().map((f) => path.join(ARTES, f));
    if (!pngs.length) throw new Error(`${slug}: artes não achadas`);
    const quando = `${dia}T12:00:00-03:00`;
    for (const rede of ["instagram", "tiktok"]) {
      if (feitos.has(`${slug}|${rede}`)) { console.log(`= ${slug} ${rede} já agendado`); continue; }
      const locais = rede === "tiktok" ? pngs.map(jpg) : pngs;
      let corpoCap = cap, cfg = {};
      if (rede === "tiktok") { const tl = tituloELegenda(cap); corpoCap = tl.caption; cfg = { tiktok: { privacy_status: "public", title: tl.title, auto_add_music: true } }; }
      if (corpoCap.length > 2200) throw new Error(`${slug}: legenda longa demais`);
      const resumo = `${dia} 12h · ${rede} · ${slug} · ${locais.length} imagem(ns) · "${(cfg.tiktok ? cfg.tiktok.title : cap.split("\n")[0]).slice(0, 45)}"`;
      if (DRY) { console.log(`DRY ${resumo}`); continue; }
      if (criados > 0) await dormir(PAUSA);
      const urls = []; for (const f of locais) urls.push(await subir(f));
      let post = null;
      for (let t = 1; t <= 3 && !post; t++) {
        const corpo = { caption: corpoCap, social_accounts: [CONTA[rede]], media: urls.map((url) => ({ url })), scheduled_at: new Date(quando).toISOString() };
        if (Object.keys(cfg).length) corpo.platform_configurations = cfg;
        const p = await api("/v1/social-posts", { method: "POST", body: JSON.stringify(corpo) });
        if (locais.length < 2) { post = p; break; }
        const g = await api(`/v1/social-posts/${p.id}`);
        const esp = locais.map((f) => md5(fs.readFileSync(f)));
        const got = []; for (const m of g.media || []) got.push(md5(Buffer.from(await (await fetch(m.url)).arrayBuffer())));
        if (got.join() === esp.join()) { console.log("  ordem do carrossel conferida"); post = p; break; }
        console.log("  ordem errada, apagando e criando de novo...");
        await api(`/v1/social-posts/${p.id}`, { method: "DELETE" }); await dormir(20);
      }
      if (!post) throw new Error(`${slug} ${rede}: carrossel saiu fora de ordem 3 vezes`);
      fs.appendFileSync(LOG, JSON.stringify({ slug, rede, id: post.id, quando }) + "\n");
      console.log(`ok ${post.id} · ${resumo}`);
      criados++;
    }
  }
  console.log(`\nfim: ${criados} criados nesta rodada.`);
})().catch((e) => { console.error(`\nErro: ${e.message}`); process.exit(1); });
