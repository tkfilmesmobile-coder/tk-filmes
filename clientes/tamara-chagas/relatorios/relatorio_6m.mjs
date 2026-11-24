// Levantamento de 6 meses dos dois perfis da Tamara (Graph API): todos os posts com métricas e o alcance/views da conta
// mês a mês (janelas de até 30 dias, limite da API). Não imprime token.
// uso: node --env-file=.env clientes/tamara-chagas/relatorios/relatorio_6m.mjs <desde AAAA-MM-DD> <saida.json>
import fs from "node:fs";
const [desde, saida] = process.argv.slice(2);
const G = "https://graph.instagram.com/v21.0";
const out = {};
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
for (const c of ["TAMARACHAGAS_PREV", "DRA_TAMARACHAGAS_"]) {
  const tok = process.env[`INSTAGRAM_ACCESS_TOKEN_${c}`], id = process.env[`INSTAGRAM_USER_ID_${c}`];
  const get = async (u) => (await fetch(`${u}${u.includes("?") ? "&" : "?"}access_token=${tok}`)).json();
  const perfil = await get(`${G}/${id}?fields=username,followers_count,follows_count,media_count`);
  // conta: janelas de 30 dias
  const janelas = [];
  let ini = new Date(`${desde}T00:00:00-03:00`).getTime() / 1000;
  const fim = Math.floor(Date.now() / 1000);
  while (ini < fim) {
    const ate = Math.min(ini + 30 * 86400, fim);
    const r = await get(`${G}/${id}/insights?metric=reach,views,accounts_engaged,total_interactions,profile_links_taps&period=day&metric_type=total_value&since=${Math.floor(ini)}&until=${Math.floor(ate)}`);
    janelas.push({ de: new Date(ini * 1000).toISOString().slice(0, 10), ate: new Date(ate * 1000).toISOString().slice(0, 10),
      valores: r.error ? { erro: r.error.message } : Object.fromEntries((r.data || []).map((x) => [x.name, x.total_value?.value])) });
    ini = ate;
  }
  const seg = await get(`${G}/${id}/insights?metric=follower_count&period=day&since=${fim - 29 * 86400}&until=${fim}`);
  const posts = [];
  let u = `${G}/${id}/media?fields=id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count,children{media_type}&limit=50`;
  const lim = new Date(`${desde}T00:00:00-03:00`);
  fora: while (u) {
    const p = await get(u);
    if (p.error) { console.log("erro", p.error.message); break; }
    for (const m of p.data || []) {
      if (new Date(m.timestamp) < lim) break fora;
      const ins = await get(`${G}/${m.id}/insights?metric=reach,views,saved,shares,total_interactions`);
      const v = Object.fromEntries((ins.data || []).map((x) => [x.name, x.values?.[0]?.value ?? x.total_value?.value]));
      posts.push({ ts: m.timestamp, tipo: m.media_product_type === "REELS" ? "reels" : m.media_type === "CAROUSEL_ALBUM" ? "carrossel" : m.media_type === "VIDEO" ? "video" : "imagem",
        slides: m.children?.data?.length || 0, link: m.permalink, curtidas: m.like_count, comentarios: m.comments_count, ...v,
        legenda: (m.caption || "").replace(/\s+/g, " ").slice(0, 160), erro: ins.error?.message });
      await dormir(120);
    }
    u = p.paging?.next ? p.paging.next.replace(/[?&]access_token=[^&]+/, "") : null;
  }
  out[c] = { perfil, janelas, seguidores_30d: seg.error ? seg.error.message : seg.data?.[0]?.values, posts };
  console.log(c, perfil.followers_count, "seguidores ·", posts.length, "posts desde", desde);
}
fs.writeFileSync(saida, JSON.stringify(out, null, 1));
