#!/usr/bin/env node
/**
 * Tira da agenda da Post for Me posts que ainda estão agendados (customização TK Filmes, 2026-11-16).
 * Só apaga post com status "scheduled": publicado ou com erro fica como está. Os arquivos locais não são tocados.
 * Nunca imprime tokens.
 *
 * uso: node --env-file=.env remover-postforme.js sp_xxx sp_yyy [--dry-run]
 */
const API = "https://api.postforme.dev";
const KEY = (process.env.POSTFORME_API_KEY || "").trim();
if (!KEY) { console.error("POSTFORME_API_KEY não encontrada no .env"); process.exit(1); }
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const ids = args.filter((a) => a.startsWith("sp_"));
const h = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

(async () => {
  for (const id of ids) {
    const r = await fetch(`${API}/v1/social-posts/${id}`, { headers: h });
    if (!r.ok) { console.error(`${id}: não achei (${r.status})`); continue; }
    const p = await r.json();
    const quando = p.scheduled_at || "?";
    const legenda = (p.caption || "").split("\n")[0].slice(0, 60);
    if (p.status !== "scheduled") { console.error(`${id}: status ${p.status}, não mexi`); continue; }
    if (dry) { console.log(`[teste] removeria ${id} (${quando}) "${legenda}"`); continue; }
    const d = await fetch(`${API}/v1/social-posts/${id}`, { method: "DELETE", headers: h });
    console.log(d.ok ? `removido ${id} (${quando}) "${legenda}"` : `${id}: falhou ao remover (${d.status})`);
  }
})();
