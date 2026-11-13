// Métricas do Instagram dos dois perfis da Tamara (Graph API, conta profissional): desempenho de cada post desde uma
// data e o perfil de quem segue (idade, gênero, cidade). Saída em JSON. Não imprime token.
// uso: node --env-file=.env clientes/tamara-chagas/relatorios/metricas_ig.mjs <desde AAAA-MM-DD> <saida.json>
import fs from "node:fs";
const [desde, saida] = process.argv.slice(2);
const G = "https://graph.instagram.com/v21.0";
const out = {};
for (const c of ["TAMARACHAGAS_PREV", "DRA_TAMARACHAGAS_"]) {
  const tok = process.env[`INSTAGRAM_ACCESS_TOKEN_${c}`], id = process.env[`INSTAGRAM_USER_ID_${c}`];
  const get = async (u) => (await fetch(`${u}${u.includes("?") ? "&" : "?"}access_token=${tok}`)).json();
  const perfil = await get(`${G}/${id}?fields=username,followers_count,media_count`);
  const demo = {};
  for (const b of ["age", "gender", "city"]) {
    const r = await get(`${G}/${id}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value&breakdown=${b}`);
    demo[b] = r.error ? `erro: ${r.error.message}` : (r.data?.[0]?.total_value?.breakdowns?.[0]?.results || []).map((x) => [x.dimension_values.join("/"), x.value]);
  }
  const conta = await get(`${G}/${id}/insights?metric=reach,views,accounts_engaged,follows_and_unfollows&period=day&metric_type=total_value&since=${Math.floor(Date.now() / 1000) - 28 * 86400}&until=${Math.floor(Date.now() / 1000)}`);
  const posts = [];
  let u = `${G}/${id}/media?fields=id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count&limit=50`;
  const lim = new Date(`${desde}T00:00:00-03:00`);
  fora: while (u) {
    const p = await get(u);
    for (const m of p.data || []) {
      if (new Date(m.timestamp) < lim) break fora;
      const met = m.media_product_type === "REELS" ? "reach,views,saved,shares,total_interactions" : "reach,views,saved,shares,total_interactions";
      const ins = await get(`${G}/${m.id}/insights?metric=${met}`);
      const v = Object.fromEntries((ins.data || []).map((x) => [x.name, x.values?.[0]?.value ?? x.total_value?.value]));
      posts.push({ data: m.timestamp.slice(0, 10), tipo: m.media_product_type === "REELS" ? "reels" : m.media_type.toLowerCase(),
        link: m.permalink, curtidas: m.like_count, comentarios: m.comments_count, ...v,
        legenda: (m.caption || "").replace(/\s+/g, " ").slice(0, 110), erro: ins.error?.message });
    }
    u = p.paging?.next ? p.paging.next.replace(/[?&]access_token=[^&]+/, "") : null;
  }
  out[c] = { perfil, demografia: demo, conta_28d: conta.error ? conta.error.message : (conta.data || []).map((x) => [x.name, x.total_value?.value]), posts };
  console.log(c, perfil.followers_count, "seguidores ·", posts.length, "posts desde", desde);
}
fs.writeFileSync(saida, JSON.stringify(out, null, 1));
