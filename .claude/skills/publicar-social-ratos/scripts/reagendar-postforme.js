#!/usr/bin/env node
/**
 * Muda só a DATA de posts já agendados na Post for Me (customização TK Filmes, 2026-11-04).
 * A API exige o post inteiro no PUT; o script lê cada post e reenvia legenda, conta e mídia iguais, com a data nova.
 * Nunca imprime tokens (a API devolve o token da conta dentro de social_accounts).
 *
 * uso: node --env-file=.env reagendar-postforme.js sp_xxx=2026-11-27T12:00:00-03:00 sp_yyy=... [--dry-run]
 */
const API = "https://api.postforme.dev";
const KEY = (process.env.POSTFORME_API_KEY || "").trim();
if (!KEY) { console.error("POSTFORME_API_KEY não encontrada no .env"); process.exit(1); }
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const pares = args.filter((a) => a.includes("=")).map((a) => a.split("="));
const h = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

(async () => {
  for (const [id, quando] of pares) {
    if (!/[+-]\d\d:\d\d$|Z$/.test(quando)) { console.error(`${id}: horário sem fuso (${quando}), pulei`); continue; }
    const r = await fetch(`${API}/v1/social-posts/${id}`, { headers: h });
    if (!r.ok) { console.error(`${id}: não achei (${r.status})`); continue; }
    const p = await r.json();
    if (p.status !== "scheduled") { console.error(`${id}: status ${p.status}, não mexi`); continue; }
    const corpo = {
      caption: p.caption,
      social_accounts: (p.social_accounts || []).map((s) => s.id),
      media: (p.media || []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0)).map((m) => ({ url: m.url, ...(m.thumbnail_url ? { thumbnail_url: m.thumbnail_url } : {}) })),
      platform_configurations: p.platform_configurations || {},
      ...(p.account_configurations ? { account_configurations: p.account_configurations } : {}),
      scheduled_at: new Date(quando).toISOString(),
    };
    const antes = p.scheduled_at;
    if (dry) { console.log(`DRY ${id}: ${antes} -> ${corpo.scheduled_at} · ${corpo.media.length} mídia(s) · "${(p.caption || "").split("\n")[0].slice(0, 50)}"`); continue; }
    const u = await fetch(`${API}/v1/social-posts/${id}`, { method: "PUT", headers: h, body: JSON.stringify(corpo) });
    const txt = await u.text();
    if (!u.ok) { console.error(`${id}: falhou (${u.status}) ${txt.slice(0, 200)}`); continue; }
    const novo = JSON.parse(txt);
    console.log(`ok ${id}: ${antes} -> ${novo.scheduled_at} · "${(p.caption || "").split("\n")[0].slice(0, 50)}"`);
    await new Promise((res) => setTimeout(res, 1500));
  }
})();
