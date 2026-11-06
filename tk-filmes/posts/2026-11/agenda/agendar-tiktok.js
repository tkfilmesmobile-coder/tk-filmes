#!/usr/bin/env node
/**
 * Agenda no TikTok (conta Tk Filmes, via Post for Me) os posts da TK de novembro (2026-11-04, pedido da Talyta).
 * - O que vai sair no Instagram: mesmo dia e hora, legenda e mídia copiadas do post do Instagram.
 * - O que já saiu no Instagram: às 19h, como segundo post do dia.
 * - Frases em b-roll: rascunho no TikTok (ela põe o áudio em alta no app e publica).
 * Artes viram JPG (o TikTok não aceita PNG em post de foto); a 1ª linha da legenda vira o título da foto.
 * Retoma de onde parou: o que já está em tiktok-agendados.jsonl não é criado de novo. Nunca imprime tokens.
 *
 * uso (na raiz do sistema): node --env-file=.env tk-filmes/posts/2026-11/agenda/agendar-tiktok.js [--dry-run]
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const API = "https://api.postforme.dev";
const KEY = (process.env.POSTFORME_API_KEY || "").trim();
const DRY = process.argv.includes("--dry-run");
const AG = path.join("tk-filmes", "posts", "2026-11", "agenda");
const DIR = path.join(AG, "tiktok");
const LOG = path.join(AG, "tiktok-agendados.jsonl");
const OUT10 = path.join("tk-filmes", "posts", "2026-10");
const DRIVE = "H:\\Meu Drive";
const FRASES = path.join(DRIVE, "TK FILMES", "02 CONTEÚDO TK", "04 Frases em b-roll (out e nov 2026)");
const FF = "C:\\Users\\kumyt\\AppData\\Local\\CapCut\\Apps\\9.6.0.4097\\ffmpeg.exe";
const PAUSA = 75;
const h = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const dormir = (s) => new Promise((r) => setTimeout(r, s * 1000));
const drive = (nome) => path.join(DRIVE, nome);

// ---- a grade (aprovada por ela em 2026-11-04) ----
const IG = (dia, id, tipo, nome, imagens) => ({ chave: `${dia}-${nome}`, ig: id, tipo, imagens });
const LOTE = [
  // mesmo dia e hora do Instagram
  IG("11-05", "sp_WNjXVeBjTArOhdFuDKPr1", "foto", "tweet-abandonado", [path.join(OUT10, "2026-10-27-tweet-abandonado.png")]),
  IG("11-06", "sp_R84nmzpHtBgNoW5rzvj", "video", "bastidor-start"),
  IG("11-09", "sp_yPVseapfKNNNbnGsi7f99", "foto", "carrossel-start", [1, 2, 3].map((n) => drive(`Bastidor TK - Start - carrossel ${n}.png`))),
  IG("11-10", "sp_rgAqZSSYyXfdg7NnX", "video", "reels-tempo"),
  IG("11-11", "sp_O7qHZ0dL2A5yj02KzKs4", "foto", "post-tempo", [drive("Post TK - Quanto tempo leva 1 minuto.png")]),
  IG("11-12", "sp_QiLhjt0haYEFMekFFbfNA", "video", "bastidor-anna"),
  IG("11-13", "sp_KKBVNE9NxIwomzR3KE7JY", "foto", "carrossel-anna", [1, 2, 3].map((n) => drive(`Bastidor TK - Anna Líbya - carrossel ${n}.png`))),
  IG("11-16", "sp_B8hXWm9yd5e4xseUn29p", "video", "reels-viralizar"),
  IG("11-17", "sp_H7rMDr2m5xH81nUs5u0z", "foto", "post-viralizar", [drive("Post TK - Viralizar é sorte.png")]),
  IG("11-18", "sp_kR1Yk4s9LSVNtUZhUGdd", "video", "bastidor-start-pos"),
  IG("11-19", "sp_e3heFboyPyFw6gFiAUif", "foto", "conversa-viral", [path.join(OUT10, "2026-10-26-conversa-viral.png")]),
  IG("11-23", "sp_N0h8iW7t8Qoj0JtPbglQv", "video", "reels-barulho"),
  IG("11-24", "sp_uEwvyzZG7UhTDPD0gUfe", "foto", "post-barulho", [drive("Post TK - Postar por postar é barulho.png")]),
  IG("11-25", "sp_u16X5pPgpOGJton9sOEz", "video", "bastidor-anna-pos"),
  IG("11-26", "sp_8doUlovTrYaxiPSMSe7S", "foto", "tweet-nao-sei-falar", [path.join(OUT10, "2026-10-28-tweet-nao-sei-falar.png")]),
  IG("11-27", "sp_hDqCfUHPez3Oc5Gx9AQzG", "foto", "conversa-bombar", [path.join(OUT10, "2026-10-29-conversa-bombar-escondido.png")]),
  IG("11-30", "sp_hTX6wHEESITR9T9S6bE4", "foto", "frase-boleto", [path.join(OUT10, "2026-10-30-frase-boleto.png")]),
  IG("12-01", "sp_o21G1UqD5r9ss9vTUukxb", "foto", "conversa-sarado", [path.join(OUT10, "2026-10-19-conversa-academia.png")]),
];
// o que já saiu no Instagram: 19h
const AS19 = (dia) => `2026-${dia}T19:00:00-03:00`;
const leg10 = (n) => path.join(OUT10, `${n}-legenda.md`);
LOTE.push(
  { chave: "11-05-voltei", quando: AS19("11-05"), tipo: "video", url: "https://files.catbox.moe/7lo2r9.mp4", legenda: leg10("2026-10-06-reels-voltei") },
  { chave: "11-06-chegou-agora", quando: AS19("11-06"), tipo: "foto", imagens: [path.join(OUT10, "2026-10-09-bastidor-chegou-agora.png")], legenda: leg10("2026-10-09-bastidor-chegou-agora") },
  { chave: "11-09-manifesto", quando: AS19("11-09"), tipo: "foto", imagens: [path.join(OUT10, "2026-10-05-frase-manifesto.png")], legenda: leg10("2026-10-05-frase-manifesto") },
  { chave: "11-11-um-dia", quando: AS19("11-11"), tipo: "video", arquivo: drive("Um dia na TK - EDITADO.mp4"), legendaDe: "sp_Qnv7qh47q2mkYFkYV4Z0" },
  { chave: "11-12-semana-que-vem", quando: AS19("11-12"), tipo: "foto", imagens: [path.join(OUT10, "2026-10-07-tweet-semana-que-vem.png")], legenda: leg10("2026-10-07-tweet-semana-que-vem") },
  { chave: "11-13-pesquisa", quando: AS19("11-13"), tipo: "video", url: "https://files.catbox.moe/ya92bx.mp4", legenda: leg10("2026-10-15-reels-pesquisa") },
  { chave: "11-17-stalkeia", quando: AS19("11-17"), tipo: "foto", imagens: [path.join(OUT10, "2026-10-21-frase-stalkeia.png")], legenda: leg10("2026-10-21-frase-stalkeia") },
  { chave: "11-18-video-ou-vender", quando: AS19("11-18"), tipo: "foto", imagens: [path.join(OUT10, "2026-10-23-conversa-video-ou-vender.png")], legenda: leg10("2026-10-23-conversa-video-ou-vender") },
  { chave: "11-19-virada", quando: AS19("11-19"), tipo: "video", arquivo: drive("A virada não foi sorte - EDITADO.mp4"), legendaDe: "sp_Q8s4AgH463z603MJDmwK0" },
);
// frases em b-roll: rascunho. 01 a 06 chegam agora; 07 a 14 às 9h do dia delas.
const FRASE_DATA = { "01": "10-17", "02": "10-18", "03": "10-24", "04": "10-25", "05": "10-31", "06": "11-01", "07": "11-07", "08": "11-08", "09": "11-14", "10": "11-15", "11": "11-21", "12": "11-22", "13": "11-28", "14": "11-29" };
for (const [n, dia] of Object.entries(FRASE_DATA)) {
  const mes = dia.startsWith("10") ? "Outubro" : "Novembro";
  LOTE.push({
    chave: `frase-${n}`, tipo: "video", rascunho: true, frase: n,
    // frase 06 falhou em 04/11: o TikTok só aceita 5 rascunhos pendentes de uma vez. Reenviada pra 06/11 9h.
    quando: Number(n) >= 7 ? `2026-${dia}T09:00:00-03:00` : n === "06" ? "2026-11-06T09:00:00-03:00" : null,
    arquivo: path.join(FRASES, mes, `2026-${dia}-frase-${n}.mp4`),
  });
}

// ---- utilidades ----
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
function legendaFrase(n) {
  const txt = fs.readFileSync(path.join(FRASES, "Legendas e datas.txt"), "utf8").replace(/\r\n/g, "\n");
  const bloco = txt.split(/\n## /).find((b) => b.startsWith(`${n} `));
  if (!bloco) throw new Error(`legenda da frase ${n} não achada`);
  const linhas = bloco.split("\n---")[0].split("\n");
  const i = linhas.findIndex((l) => l.startsWith("Frase:"));
  return linhas.slice(i + 1).join("\n").trim();
}
const lerTxt = (f) => fs.readFileSync(f, "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
function jpg(png, destino) {
  if (fs.existsSync(destino)) return destino;
  const r = spawnSync(FF, ["-y", "-loglevel", "error", "-i", png, "-q:v", "2", destino]);
  if (r.status !== 0 || !fs.existsSync(destino)) throw new Error(`não converti ${png}: ${r.stderr}`);
  return destino;
}
async function baixar(url, destino) {
  if (fs.existsSync(destino) && fs.statSync(destino).size > 0) return destino;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`não baixei ${url} (${r.status})`);
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
  return destino;
}
async function subir(arquivo) {
  const { upload_url, media_url } = await api("/v1/media/create-upload-url", { method: "POST", body: "{}" });
  const ext = path.extname(arquivo).toLowerCase();
  const tipo = { ".jpg": "image/jpeg", ".mp4": "video/mp4", ".mov": "video/quicktime" }[ext] || "application/octet-stream";
  const buf = fs.readFileSync(arquivo);
  const r = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": tipo }, body: buf });
  if (!r.ok) throw new Error(`upload falhou ${r.status}`);
  console.log(`  subiu ${path.basename(arquivo)} (${(buf.length / 1048576).toFixed(1)} MB)`);
  return media_url;
}
const md5 = (b) => crypto.createHash("md5").update(b).digest("hex");
function tituloELegenda(cap) {
  const [primeira, ...resto] = cap.split("\n");
  const t = primeira.trim();
  if (t.length <= 90 && resto.join("\n").trim()) return { title: t, caption: resto.join("\n").trim() };
  let curto = t.slice(0, 88);
  curto = curto.slice(0, curto.lastIndexOf(" ")) + "…";
  return { title: curto, caption: cap };
}

// ---- principal ----
(async () => {
  if (!KEY) throw new Error("POSTFORME_API_KEY não encontrada no .env");
  fs.mkdirSync(DIR, { recursive: true });
  const contas = await api("/v1/social-accounts?platform=tiktok");
  // Há mais de um TikTok na mesma chave (o da Tk Filmes e o tamarachagas.prev): escolher pelo id, nunca o primeiro da lista.
  const TT_TK = "spc_dzTk21vgIiyZyAYUjTDbg";
  const tt = (contas.data || contas).find((a) => a.id === TT_TK && a.status === "connected");
  if (!tt || tt.username !== "Tk Filmes") throw new Error(`conta TikTok da Tk Filmes (${TT_TK}) não está conectada`);
  console.log(`TikTok: ${tt.username} (${tt.id})`);
  const feitos = new Set(fs.existsSync(LOG) ? fs.readFileSync(LOG, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l).chave) : []);
  let criados = 0;

  for (const it of LOTE) {
    if (feitos.has(it.chave)) { console.log(`= ${it.chave} já agendado, pulei`); continue; }
    // legenda, horário e mídia
    let caption, quando = it.quando, mediaUrls = [], locais = [];
    if (it.ig) {
      const p = await api(`/v1/social-posts/${it.ig}`);
      if (p.status !== "scheduled") throw new Error(`${it.ig} não está agendado (${p.status})`);
      caption = p.caption; quando = p.scheduled_at;
      if (it.tipo === "video") mediaUrls = [p.media[0].url];
    } else if (it.legendaDe) {
      caption = (await api(`/v1/social-posts/${it.legendaDe}`)).caption;
    } else if (it.legenda) caption = lerTxt(it.legenda);
    else if (it.frase) caption = legendaFrase(it.frase);
    if (!caption) throw new Error(`${it.chave} sem legenda`);

    if (it.tipo === "foto") {
      locais = it.imagens.map((png, i) => {
        if (!fs.existsSync(png)) throw new Error(`arquivo não encontrado: ${png}`);
        return jpg(png, path.join(DIR, `${it.chave}-${String(i + 1).padStart(2, "0")}.jpg`));
      });
    } else if (!mediaUrls.length) {
      const arq = it.url ? await baixar(it.url, path.join(DIR, `${it.chave}.mp4`)) : it.arquivo;
      if (!fs.existsSync(arq)) throw new Error(`arquivo não encontrado: ${arq}`);
      locais = [arq];
    }

    const cfg = { privacy_status: "public" };
    let corpoCap = caption;
    if (it.tipo === "foto") { const tl = tituloELegenda(caption); cfg.title = tl.title; corpoCap = tl.caption; cfg.auto_add_music = true; }
    if (it.rascunho) cfg.is_draft = true;
    if (corpoCap.length > 2200) throw new Error(`${it.chave}: legenda com ${corpoCap.length} caracteres (limite 2.200)`);
    const resumo = `${it.chave} · ${it.tipo}${it.rascunho ? " (rascunho)" : ""} · ${quando ? new Date(quando).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "agora"} · ${locais.length || mediaUrls.length} mídia(s) · "${(cfg.title || corpoCap.split("\n")[0]).slice(0, 50)}"`;
    if (DRY) { console.log(`DRY ${resumo}`); continue; }

    if (criados > 0) await dormir(PAUSA);
    for (const f of locais) mediaUrls.push(await subir(f));
    let post;
    for (let t = 1; t <= 3; t++) {
      const corpo = { caption: corpoCap, social_accounts: [tt.id], media: mediaUrls.map((url) => ({ url })), platform_configurations: { tiktok: cfg } };
      if (quando) corpo.scheduled_at = new Date(quando).toISOString();
      post = await api("/v1/social-posts", { method: "POST", body: JSON.stringify(corpo) });
      if (locais.length < 2 || it.tipo !== "foto") break;
      // carrossel: confere a ordem guardada
      const g = await api(`/v1/social-posts/${post.id}`);
      const esperado = locais.map((f) => md5(fs.readFileSync(f)));
      const guardado = [];
      for (const m of g.media || []) guardado.push(md5(Buffer.from(await (await fetch(m.url)).arrayBuffer())));
      if (guardado.join() === esperado.join()) { console.log("  ordem do carrossel conferida"); break; }
      console.log("  ordem errada, apagando e criando de novo...");
      await api(`/v1/social-posts/${post.id}`, { method: "DELETE" });
      post = null; await dormir(20);
    }
    if (!post) throw new Error(`${it.chave}: carrossel saiu fora de ordem 3 vezes`);
    fs.appendFileSync(LOG, JSON.stringify({ chave: it.chave, id: post.id, quando: quando || "agora", rascunho: !!it.rascunho, tipo: it.tipo }) + "\n");
    console.log(`ok ${post.id} · ${resumo}`);
    criados++;
  }
  console.log(`\nfim: ${criados} criados nesta rodada.`);
})().catch((e) => { console.error(`\nErro: ${e.message}`); process.exit(1); });
