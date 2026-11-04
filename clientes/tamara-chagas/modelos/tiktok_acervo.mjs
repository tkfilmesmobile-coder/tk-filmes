// Agenda o acervo do Instagram da Tamara no TikTok @tamarachagas.prev pela Post for Me (pedido da Talyta, 04/11/2026).
// Lê a planilha do levantamento (só pro_tiktok = "sim"), tira repetidos (mesma legenda nos dois perfis), ordena do mais
// recente pro mais antigo e distribui 5 por dia nos horários de HORAS, a partir de INICIO. Busca no Instagram, na hora,
// a legenda inteira e a mídia (vídeo, imagem ou fotos do carrossel; vídeo dentro de carrossel fica de fora).
// Retomável: o que já foi agendado fica em <fila.json> e não repete.
// uso: node --env-file=.env clientes/tamara-chagas/modelos/tiktok_acervo.mjs <planilha.json> <fila.json> [--so N] [--dry-run]
//      (planilha.json = Import-Csv relatorios/2026-11-tiktok-acervo.csv -Delimiter ";" | ConvertTo-Json)
import fs from "node:fs";

const [csvPath, filaPath, ...rest] = process.argv.slice(2);
const SO = rest.includes("--so") ? Number(rest[rest.indexOf("--so") + 1]) : Infinity;
const DRY = rest.includes("--dry-run");
const HORAS = ["09:00", "11:00", "13:00", "18:00", "20:00"];
// horários fixos (não dependem da hora em que o script roda, pra rodar de novo sem embaralhar a fila):
// pedido da Talyta em 04/11: o 1º sai na hora (19h03), o 2º às 20h e daí 5 por dia nos horários de HORAS
const PRIMEIRO = "2026-11-04T19:03:00-03:00", DEPOIS = "2026-11-04T20:00:00-03:00";
function horarios(n) {
  const out = [PRIMEIRO];
  for (let d = 0; out.length < n; d++) {
    const dia = new Date(`${DEPOIS.slice(0, 10)}T12:00:00-03:00`); dia.setDate(dia.getDate() + d);
    for (const h of HORAS) { const q = `${dia.toISOString().slice(0, 10)}T${h}:00-03:00`; if (q >= DEPOIS) out.push(q); }
  }
  return out.slice(0, n);
}
const K = (process.env.POSTFORME_API_KEY || "").trim();
const TIKTOK = "spc_g6lNwLeEP3fjAqqTFdYAi"; // @tamarachagas.prev
const TOK = { "@dra.tamarachagas_": process.env.INSTAGRAM_ACCESS_TOKEN_DRA_TAMARACHAGAS_, "@tamarachagas_prev": process.env.INSTAGRAM_ACCESS_TOKEN_TAMARACHAGAS_PREV };
const dormir = (s) => new Promise((r) => setTimeout(r, s * 1000));

async function pfm(endpoint, opts = {}) {
  for (let t = 1; t <= 5; t++) {
    const r = await fetch(`https://api.postforme.dev${endpoint}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${K}`, ...(opts.headers || {}) } });
    if (r.status === 429) { await dormir(60); continue; }
    const txt = await r.text();
    if (!r.ok) throw new Error(`Post for Me ${r.status}: ${txt.slice(0, 300)}`);
    return txt ? JSON.parse(txt) : {};
  }
  throw new Error("Post for Me: muitos 429 seguidos");
}
async function subir(url, ext) {
  const v = await fetch(url);
  if (!v.ok) throw new Error(`download do Instagram falhou ${v.status}`);
  const buf = Buffer.from(await v.arrayBuffer());
  const { upload_url, media_url } = await pfm("/v1/media/create-upload-url", { method: "POST", body: "{}" });
  const up = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": ext === "mp4" ? "video/mp4" : "image/jpeg" }, body: buf });
  if (!up.ok) throw new Error(`upload falhou ${up.status}`);
  return media_url;
}
// legenda do TikTok: a do Instagram, sem a linha de colaboração do Instagram
const legenda = (c) => (c || "").replace(/\r\n/g, "\n").split("\n").filter((l) => !/em colabora[cç][aã]o com @/i.test(l)).join("\n").trim().slice(0, 2200) || "Tamara Chagas Advocacia";

// a planilha vem convertida pra JSON (Import-Csv ... | ConvertTo-Json): o assunto pode ter ";" dentro
const itens = JSON.parse(fs.readFileSync(csvPath, "utf8").replace(/^﻿/, ""))
  .filter((x) => x.pro_tiktok === "sim").sort((a, b) => (a.data < b.data ? 1 : -1));
const vistos = new Set(), fila0 = [];
for (const x of itens) { const k = x.assunto.slice(0, 60).toLowerCase(); if (k && vistos.has(k)) continue; vistos.add(k); fila0.push(x); }
// saga de Natal sai em ordem de episódio: os itens dela trocam de lugar entre si (do mais antigo pro mais novo)
const SAGA = /saga da decora|decora[cç][aã]o de natal|vlog de natal|finalizamos/i;
const pos = fila0.map((x, i) => (SAGA.test(x.assunto) ? i : -1)).filter((i) => i >= 0);
const saga = pos.map((i) => fila0[i]).sort((a, b) => (a.data < b.data ? -1 : 1));
pos.forEach((p, k) => { fila0[p] = saga[k]; });
const fila = fs.existsSync(filaPath) ? JSON.parse(fs.readFileSync(filaPath, "utf8")) : {};
console.log(`acervo: ${itens.length} · sem repetidos: ${fila0.length} · já agendados antes: ${Object.keys(fila).length}`);

// o que o Instagram não entrega (vídeo com música da biblioteca dele) sai da fila e não ocupa horário
const filaOk = fila0.filter((x) => !fila[x.id]?.erro || fila[x.id]?.post);
const slots = horarios(filaOk.length);
console.log(`na fila: ${filaOk.length} · de fora (o Instagram não entrega a mídia): ${fila0.length - filaOk.length} · de ${slots[0]} a ${slots[slots.length - 1]}`);

// remarca o que já foi agendado com horário antigo (a API exige o post inteiro no PUT)
async function remarcar(id, quando) {
  const p = await pfm(`/v1/social-posts/${id}`);
  if (p.status !== "scheduled") return `status ${p.status}, não mexi`;
  const corpo = { caption: p.caption, social_accounts: (p.social_accounts || []).map((s) => s.id),
    media: (p.media || []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0)).map((m) => ({ url: m.url, ...(m.thumbnail_url ? { thumbnail_url: m.thumbnail_url } : {}) })),
    platform_configurations: p.platform_configurations || {}, ...(p.account_configurations ? { account_configurations: p.account_configurations } : {}),
    scheduled_at: new Date(quando).toISOString() };
  await pfm(`/v1/social-posts/${id}`, { method: "PUT", body: JSON.stringify(corpo) });
  return "ok";
}

let feitos = 0;
for (let i = 0; i < filaOk.length && feitos < SO; i++) {
  const x = filaOk[i], quando = slots[i];
  if (fila[x.id]?.post) {
    if (fila[x.id].quando !== quando && !DRY) {
      try { const r = await remarcar(fila[x.id].post, quando); if (r === "ok") { fila[x.id].quando = quando; console.log(`remarcado ${quando} ${fila[x.id].post}`); } else console.log(`${fila[x.id].post}: ${r}`); }
      catch (e) { console.log(`ERRO ao remarcar ${fila[x.id].post}: ${e.message}`); }
      fs.writeFileSync(filaPath, JSON.stringify(fila, null, 1)); await dormir(1.5);
    }
    continue;
  }
  try {
    const m = await (await fetch(`https://graph.instagram.com/v21.0/${x.id}?fields=caption,media_type,media_url,children{media_type,media_url}&access_token=${TOK[x.conta]}`)).json();
    if (m.error) throw new Error(`Instagram: ${m.error.message}`);
    let midias;
    if (m.media_type === "VIDEO") midias = [[m.media_url, "mp4"]];
    else if (m.media_type === "IMAGE") midias = [[m.media_url, "jpg"]];
    else midias = (m.children?.data || []).filter((c) => c.media_type === "IMAGE").map((c) => [c.media_url, "jpg"]).slice(0, 35);
    if (!midias.length) throw new Error("sem mídia que o TikTok aceite");
    if (DRY) { console.log(`[teste] ${quando} ${x.tipo} ${x.data} ${x.assunto.slice(0, 50)}`); feitos++; continue; }
    const urls = []; for (const [u, e] of midias) urls.push(await subir(u, e));
    const post = await pfm("/v1/social-posts", { method: "POST", body: JSON.stringify({ caption: legenda(m.caption), social_accounts: [TIKTOK], media: urls.map((url) => ({ url })), scheduled_at: new Date(quando).toISOString() }) });
    fila[x.id] = { post: post.id, quando, tipo: x.tipo, data: x.data, link: x.link, assunto: x.assunto.slice(0, 80) };
    console.log(`ok ${quando} ${post.id} ${x.tipo} ${x.data} ${x.assunto.slice(0, 50)}`);
    feitos++;
  } catch (e) {
    fila[x.id] = { erro: String(e.message).slice(0, 200), quando, link: x.link };
    console.log(`ERRO ${quando} ${x.link}: ${e.message}`);
  }
  fs.writeFileSync(filaPath, JSON.stringify(fila, null, 1));
  await dormir(2);
}
console.log(`fim: ${feitos} agendados nesta rodada`);
