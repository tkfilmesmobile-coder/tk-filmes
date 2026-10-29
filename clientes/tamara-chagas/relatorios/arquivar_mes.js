// Arquiva no Drive da cliente (CONTEÚDO/AAAA-MM MÊS/REELS|FEED) tudo o que foi publicado no mês nos dois perfis,
// baixando direto do Instagram, e completa o registro de publicações (relatorios/publicacoes.csv).
// uso: node --env-file=.env clientes/tamara-chagas/relatorios/arquivar_mes.js 2026-10
const fs = require("fs"), path = require("path");
const G = "https://graph.instagram.com/v21.0";
const DRIVE = "G:/Meu Drive/Tamara Chagas/CONTEÚDO";
const REG = path.resolve("clientes/tamara-chagas/relatorios/publicacoes.csv");
const MESES = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
const [ano, mes] = (process.argv[2] || new Date().toISOString().slice(0, 7)).split("-").map(Number);
const pastaMes = path.join(DRIVE, `${ano}-${String(mes).padStart(2, "0")} ${MESES[mes - 1]}`);

async function baixar(url, destino) {
  if (fs.existsSync(destino)) return false;
  const r = await fetch(url); if (!r.ok) throw new Error(`download ${r.status}`);
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer())); return true;
}

(async () => {
  if (!fs.existsSync(REG)) fs.writeFileSync(REG, "data_hora;conta;tipo;media_id;link;arquivos\n");
  const ja = fs.readFileSync(REG, "utf8");
  for (const conta of ["TAMARACHAGAS_PREV", "DRA_TAMARACHAGAS_"]) {
    const T = process.env[`INSTAGRAM_ACCESS_TOKEN_${conta}`], U = process.env[`INSTAGRAM_USER_ID_${conta}`];
    let url = `${G}/${U}/media?fields=id,media_type,media_product_type,timestamp,permalink,media_url,children{media_url,media_type}&limit=50&access_token=${T}`;
    let n = 0, fim = false;
    while (url && !fim) {
      const j = await (await fetch(url)).json();
      if (j.error) throw new Error(j.error.message);
      for (const m of j.data) {
        const d = new Date(m.timestamp);
        if (d.getFullYear() < ano || (d.getFullYear() === ano && d.getMonth() + 1 < mes)) { fim = true; break; }
        if (d.getFullYear() !== ano || d.getMonth() + 1 !== mes) continue;
        const tipo = m.media_product_type === "REELS" ? "REELS" : "FEED";
        const pasta = path.join(pastaMes, tipo); fs.mkdirSync(pasta, { recursive: true });
        const dia = m.timestamp.slice(0, 10), base = `${dia}_${conta.toLowerCase()}_${m.id}`;
        const itens = m.children ? m.children.data : [{ media_url: m.media_url, media_type: m.media_type }];
        const nomes = [];
        for (let i = 0; i < itens.length; i++) {
          const it = itens[i]; if (!it.media_url) continue;
          const ext = it.media_type === "VIDEO" ? "mp4" : "jpg";
          const nome = itens.length > 1 ? `${base}_${String(i + 1).padStart(2, "0")}.${ext}` : `${base}.${ext}`;
          try { if (await baixar(it.media_url, path.join(pasta, nome))) n++; nomes.push(nome); } catch (e) { console.log("  falhou", nome, e.message); }
        }
        if (!ja.includes(m.id)) fs.appendFileSync(REG, `${m.timestamp};${conta};${tipo};${m.id};${m.permalink};${nomes.join("|")}\n`);
      }
      url = fim ? null : j.paging?.next;
    }
    console.log(`${conta}: ${n} arquivo(s) novo(s) em ${pastaMes}`);
  }
})().catch(e => { console.error(e.message); process.exit(1); });
