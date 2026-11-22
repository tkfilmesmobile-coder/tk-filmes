// Baixa as capas (thumbnails) dos posts de maior alcance do levantamento de 6 meses e a faixa etária dos seguidores.
// Não imprime token.
// uso (da raiz): node --env-file=.env clientes/tamara-chagas/relatorios/capas_destaques.mjs <levantamento.json> <pasta-saida>
import fs from "node:fs";
import path from "node:path";
const [arq, pasta] = process.argv.slice(2);
const G = "https://graph.instagram.com/v21.0";
const dados = JSON.parse(fs.readFileSync(arq, "utf8"));
fs.mkdirSync(pasta, { recursive: true });
const quantos = { DRA_TAMARACHAGAS_: 8, TAMARACHAGAS_PREV: 4 };
const saida = { destaques: [], publico: {} };
for (const c of Object.keys(quantos)) {
  const tok = process.env[`INSTAGRAM_ACCESS_TOKEN_${c}`], id = process.env[`INSTAGRAM_USER_ID_${c}`];
  const get = async (u) => (await fetch(`${u}${u.includes("?") ? "&" : "?"}access_token=${tok}`)).json();
  const top = [...dados[c].posts].sort((a, b) => (b.reach || 0) - (a.reach || 0)).slice(0, quantos[c]);
  const querer = new Set(top.map((p) => p.link));
  const achados = {};
  let u = `${G}/${id}/media?fields=id,permalink,media_type,thumbnail_url,media_url,timestamp,children{media_type,media_url,thumbnail_url}&limit=50`;
  while (u && Object.keys(achados).length < querer.size) {
    const p = await get(u);
    if (p.error) { console.log(c, "erro", p.error.message); break; }
    for (const m of p.data || []) if (querer.has(m.permalink)) achados[m.permalink] = m;
    if ((p.data || []).some((m) => m.timestamp < "2026-05-20")) break;
    u = p.paging?.next ? p.paging.next.replace(/[?&]access_token=[^&]+/, "") : null;
  }
  for (const [i, p] of top.entries()) {
    const m = achados[p.link];
    const filho = m?.children?.data?.[0];
    const url = m?.thumbnail_url || (m?.media_type === "IMAGE" ? m.media_url : null) || filho?.thumbnail_url || filho?.media_url;
    const nome = `${c === "DRA_TAMARACHAGAS_" ? "pessoal" : "escritorio"}-${String(i + 1).padStart(2, "0")}.jpg`;
    if (url) fs.writeFileSync(path.join(pasta, nome), Buffer.from(await (await fetch(url)).arrayBuffer()));
    saida.destaques.push({ conta: c, pos: i + 1, arquivo: url ? nome : null, ts: p.ts, link: p.link, reach: p.reach, views: p.views,
      comentarios: p.comentarios, shares: p.shares, tipo: p.tipo, legenda: p.legenda });
    console.log(c, i + 1, p.ts.slice(0, 10), p.reach, url ? "capa ok" : "sem capa");
  }
  for (const b of ["age", "gender"]) {
    const r = await get(`${G}/${id}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=${b}`);
    saida.publico[`${c}_${b}`] = r.error ? r.error.message : r.data?.[0]?.total_value?.breakdowns?.[0]?.results?.map((x) => [x.dimension_values[0], x.value]);
  }
}
fs.writeFileSync(path.join(pasta, "destaques.json"), JSON.stringify(saida, null, 1));
console.log(JSON.stringify(saida.publico));
