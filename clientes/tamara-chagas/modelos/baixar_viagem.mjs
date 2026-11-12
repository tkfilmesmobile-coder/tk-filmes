// Baixa as mídias que a Dra. Tamara publicou no perfil pessoal (@dra.tamarachagas_): stories no ar (24 h) e posts do
// feed a partir de uma data. Pedido da Talyta (12/11/2026): usar as imagens da viagem da Doutora nos stories do
// escritório ("mesmo com a Doutora viajando, o escritório segue funcionando"). Não repete o que já baixou.
// uso: node --env-file=.env clientes/tamara-chagas/modelos/baixar_viagem.mjs <pasta-destino> <desde AAAA-MM-DD>
import fs from "node:fs";
import path from "node:path";

const [destino, desde] = process.argv.slice(2);
const TOK = process.env.INSTAGRAM_ACCESS_TOKEN_DRA_TAMARACHAGAS_;
const ID = process.env.INSTAGRAM_USER_ID_DRA_TAMARACHAGAS_;
const G = "https://graph.instagram.com/v21.0";
fs.mkdirSync(destino, { recursive: true });
const indice = path.join(destino, "indice.json");
const feito = fs.existsSync(indice) ? JSON.parse(fs.readFileSync(indice, "utf8")) : {};
const get = async (u) => (await fetch(`${u}${u.includes("?") ? "&" : "?"}access_token=${TOK}`)).json();

async function baixar(id, url, tipo, quando, origem, legenda) {
  const ext = tipo === "VIDEO" ? "mp4" : "jpg";
  const nome = `${quando.slice(0, 10)}_${origem}_${id}.${ext}`;
  if (feito[nome]) return;
  const r = await fetch(url);
  if (!r.ok) { console.log(`falhou ${nome}: ${r.status}`); return; }
  fs.writeFileSync(path.join(destino, nome), Buffer.from(await r.arrayBuffer()));
  feito[nome] = { id, tipo, quando, origem, legenda: (legenda || "").slice(0, 200) };
  console.log("ok", nome);
}

// stories no ar
const st = await get(`${G}/${ID}/stories?fields=id,media_type,media_url,timestamp`);
for (const s of st.data || []) {
  if (s.media_url) await baixar(s.id, s.media_url, s.media_type, s.timestamp, "story");
  else console.log(`story ${s.id} (${s.timestamp}) sem media_url: o Instagram não entrega (música da biblioteca ou figurinha)`);
}
// feed desde a data
let u = `${G}/${ID}/media?fields=id,media_type,media_url,timestamp,caption,children{media_type,media_url}&limit=30`;
const lim = new Date(`${desde}T00:00:00-03:00`);
fora: while (u) {
  const p = await get(u);
  for (const m of p.data || []) {
    if (new Date(m.timestamp) < lim) break fora;
    if (m.media_type === "CAROUSEL_ALBUM") for (const c of m.children?.data || []) await baixar(`${m.id}-${c.id}`, c.media_url, c.media_type, m.timestamp, "feed", m.caption);
    else if (m.media_url) await baixar(m.id, m.media_url, m.media_type, m.timestamp, "feed", m.caption);
    else console.log(`post ${m.id} sem media_url`);
  }
  u = p.paging?.next ? p.paging.next.replace(/[?&]access_token=[^&]+/, "") : null;
}
fs.writeFileSync(indice, JSON.stringify(feito, null, 1));
console.log(`fim: ${Object.keys(feito).length} arquivos em ${destino}`);
