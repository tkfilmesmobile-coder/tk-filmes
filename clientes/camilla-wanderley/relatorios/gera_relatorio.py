"""Relatório de métricas do @dra.camillawanderley (antes x depois do início do trabalho da TK, 03/09/2026).
Lê relatorios/dados/coleta-<data>.json (Graph API, dados/coleta.py), monta o HTML A4 na identidade da TK
(_contexto/marca/design-guide.md: creme, marrom, caramelo, Instrument Serif + Montserrat) e imprime em PDF.
Uso: python clientes/camilla-wanderley/relatorios/gera_relatorio.py
"""
import json, os, statistics as st, subprocess, html

AQUI = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
DADOS = f"{AQUI}/dados/coleta-2026-10-15.json"
SAIDA = f"{AQUI}/2026-10-relatorio-camilla-wanderley-tecnico"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
INICIO = "2026-09-03"   # contrato e 1ª diária de captação
ANTES_DE = "2026-06-03"  # 3 meses antes, pra comparar

d = json.load(open(DADOS, encoding="utf-8"))

def tipo(m):
    if m.get("media_product_type") == "REELS":
        return "reels"
    return {"CAROUSEL_ALBUM": "carrossel", "IMAGE": "imagem"}.get(m["media_type"], "vídeo")

posts = []
for m in d["midia"]:
    i = m["insights"] if isinstance(m.get("insights"), dict) else {}
    posts.append(dict(data=m["timestamp"][:10], tipo=tipo(m), likes=m.get("like_count", 0), com=m.get("comments_count", 0),
                      reach=i.get("reach"), views=i.get("views"), inter=i.get("total_interactions"), sh=i.get("shares"),
                      wt=i.get("ig_reels_avg_watch_time"), titulo=(m.get("caption") or "").split("\n")[0], link=m["permalink"]))
posts.sort(key=lambda p: p["data"])
antes = [p for p in posts if ANTES_DE <= p["data"] < INICIO]
depois = [p for p in posts if p["data"] >= INICIO]

def med(ps, k, zeros=True):
    v = [p[k] for p in ps if p[k] is not None and (zeros or p[k] > 0)]
    return st.median(v) if v else None

def soma(ps, k):
    return sum(p[k] or 0 for p in ps)

def fmt(v):
    if v is None:
        return "–"
    v = round(v) if isinstance(v, float) else v
    return f"{v:,}".replace(",", ".")

def var(a, b):
    if not a:
        return ""
    p = (b - a) / a * 100
    cls = "up" if p > 0 else "down" if p < 0 else ""
    return f'<span class="var {cls}">{"+" if p > 0 else ""}{p:.0f}%</span>'.replace(".", ",")

# conta em janelas de 28 dias (mais antiga → mais recente)
JAN = []
for nome in ["reach", "views", "total_interactions", "accounts_engaged", "follower_count"]:
    for x in d["conta_insights"][nome]:
        dd = x["r"]["data"][0]
        v = dd["total_value"]["value"] if "total_value" in dd else sum(y["value"] for y in dd["values"])
        JAN.append((nome, x["de"], x["ate"], v))
janelas = sorted({(a, b) for _, a, b, _ in JAN})
def serie(nome):
    return [next(v for n, a, b, v in JAN if n == nome and (a, b) == j) for j in janelas]
def dm(s):
    a, m_, dd = s.split("-")
    return f"{dd}/{m_}"
rotulos = [f"{dm(a)} a {dm(b)}" for a, b in janelas]

def barras(nome, titulo, nota):
    s = serie(nome)
    mx = max(s)
    linhas = "".join(
        f'<div class="br"><span class="bl">{rotulos[k]}</span><span class="bt"><span class="bf{" ult" if k == len(s) - 1 else ""}" style="width:{v / mx * 100:.0f}%"></span></span><span class="bv">{fmt(v)}</span></div>'
        for k, v in enumerate(s))
    return f'<div class="card"><div class="ct">{titulo}</div>{linhas}<div class="cn">{nota} {var(s[-2], s[-1])} <span class="cnl">última janela x anterior</span></div></div>'

semanas_antes = 13.1  # 03/06 a 02/09
semanas_depois = 6.1  # 03/09 a 15/10
seg = d["conta"]["followers_count"]

# tabela antes x depois por tipo
def linha_tipo(t, rot):
    a = antes if t == "todos" else [p for p in antes if p["tipo"] == t]
    b = depois if t == "todos" else [p for p in depois if p["tipo"] == t]
    ra, rb = med(a, "reach"), med(b, "reach", zeros=False)
    ia, ib = med(a, "inter"), med(b, "inter", zeros=False)
    va, vb = med(a, "views"), med(b, "views", zeros=False)
    return (f"<tr><td>{rot}</td><td>{len(a)}</td><td>{len(b)}</td><td>{fmt(ra)}</td><td>{fmt(rb)} {var(ra, rb)}</td>"
            f"<td>{fmt(va)}</td><td>{fmt(vb)} {var(va, vb)}</td><td>{fmt(ia)}</td><td>{fmt(ib)} {var(ia, ib)}</td></tr>")

tab_tipos = "".join(linha_tipo(t, r) for t, r in [("todos", "Todos"), ("reels", "Reels"), ("imagem", "Post de imagem"), ("carrossel", "Carrossel")])

def nome_post(p):
    t = html.escape(p["titulo"].replace("🦷", "").replace("✨", "").replace("❄️", "").replace("💕", "").replace("🤍", "").strip())
    return t[:36] + ("…" if len(t) > 36 else "")

linhas_posts = "".join(
    f'<tr class="{"zero" if p["reach"] == 0 else ""}"><td>{p["data"][8:]}/{p["data"][5:7]}</td><td>{p["tipo"]}</td><td class="tt">{nome_post(p)}</td>'
    f'<td>{fmt(p["reach"])}</td><td>{fmt(p["views"])}</td><td>{fmt(p["likes"])}</td><td>{fmt(p["com"])}</td><td>{fmt(p["sh"])}</td>'
    f'<td>{(str(round(p["wt"] / 1000, 1)).replace(".", ",") + " s") if p["wt"] else "–"}</td></tr>'
    for p in depois)

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Montserrat:wght@400;500;600;700&display=swap');
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Montserrat,sans-serif;color:#5A3A2E;background:#FAF6F3;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:22mm 20mm 18mm;position:relative;page-break-after:always;overflow:hidden;background:#FAF6F3}
.pg:last-child{page-break-after:auto}
h1{font-family:'Instrument Serif',serif;font-weight:400;font-size:46pt;line-height:1;color:#5A3A2E}
h2{font-family:'Instrument Serif',serif;font-weight:400;font-size:27pt;line-height:1.05;margin-bottom:5mm}
.k{font-size:7.5pt;letter-spacing:3px;text-transform:uppercase;color:#CD9365;font-weight:600;margin-bottom:3mm}
p,li{font-size:9.3pt;line-height:1.6;color:#6b4a3a}
p+p{margin-top:2.5mm}
b{color:#5A3A2E}
.fio{width:22mm;height:1px;background:#CD9365;margin:6mm 0}
.rod{position:absolute;bottom:10mm;left:20mm;right:20mm;display:flex;justify-content:space-between;font-size:7pt;letter-spacing:2px;color:#a88a74;text-transform:uppercase}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm}
.card{background:#fff;border:1px solid #eadfd5;padding:5mm 5mm 4mm}
.ct{font-size:8pt;letter-spacing:2px;text-transform:uppercase;font-weight:600;color:#8D6545;margin-bottom:3mm}
.br{display:grid;grid-template-columns:26mm 1fr 14mm;align-items:center;gap:2mm;margin:1.4mm 0;font-size:7.5pt;color:#8D6545}
.bt{height:3.2mm;background:#f2ebe4;display:block}
.bf{display:block;height:100%;background:#C4AE98}.bf.ult{background:#CD9365}
.bv{text-align:right;font-weight:600;color:#5A3A2E}
.cn{margin-top:3mm;font-size:7.8pt;color:#8D6545}.cnl{color:#b39a86}
.var{font-weight:700;font-size:7.5pt;margin-left:1mm}.var.up{color:#5f8a52}.var.down{color:#b0563f}
.big{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin:6mm 0}
.n{background:#fff;border:1px solid #eadfd5;padding:4mm}
.n .v{font-family:'Instrument Serif',serif;font-size:26pt;line-height:1;color:#5A3A2E}
.n .l{font-size:7pt;letter-spacing:1.5px;text-transform:uppercase;color:#8D6545;margin-top:2mm;line-height:1.4}
table{width:100%;border-collapse:collapse;font-size:7.6pt;color:#5A3A2E}
th{font-size:6.6pt;letter-spacing:1.2px;text-transform:uppercase;color:#8D6545;font-weight:600;text-align:left;padding:2mm 1.5mm;border-bottom:1px solid #CD9365}
td{padding:1.3mm 1.5mm;border-bottom:1px solid #eee3da;vertical-align:top}
td.tt{white-space:nowrap}
tr.zero td{color:#b0563f}
.nota{font-size:7.6pt;color:#9c7f6a;margin-top:3mm;line-height:1.5}
.cap{display:flex;flex-direction:column;justify-content:space-between;height:100%}
ol{padding-left:5mm}ol li{margin-bottom:2.5mm}
.dest{background:#fff;border-left:2px solid #CD9365;padding:4mm 5mm;margin:4mm 0}
"""

tops = sorted([p for p in depois if p["reach"]], key=lambda p: -p["reach"])

html_doc = f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>

<section class="pg"><div class="cap">
<div><div class="k">TK Filmes · relatório de desempenho</div>
<h1>Dra. Camilla<br>Wanderley</h1>
<div class="fio"></div>
<p><b>@dra.camillawanderley</b> · Clínica Geral e Endodontia</p>
<p>O antes e o depois do início do trabalho da TK Filmes (contrato e 1ª diária de captação em <b>03/09/2026</b>):
os 3 meses anteriores (03/06 a 02/09) contra as 6 semanas seguintes (03/09 a 15/10/2026).</p></div>
<div class="big">
<div class="n"><div class="v">{fmt(seg)}</div><div class="l">seguidores<br>em 15/10</div></div>
<div class="n"><div class="v">{len(depois)}</div><div class="l">posts desde<br>03/09</div></div>
<div class="n"><div class="v">{fmt(serie('views')[-1])}</div><div class="l">visualizações<br>últimos 28 dias</div></div>
<div class="n"><div class="v">{fmt(serie('total_interactions')[-1])}</div><div class="l">interações<br>últimos 28 dias</div></div>
</div>
<p class="nota">Fonte: dados oficiais da conta (API do Instagram), coletados em 15/10/2026. Números da conta em janelas de 28 dias;
números dos posts por publicação. Stories não entram (o Instagram só guarda as métricas de story por 24 h).</p>
</div><div class="rod"><span>TK Filmes</span><span>outubro de 2026</span></div></section>

<section class="pg">
<div class="k">1 · visão geral</div><h2>A conta, de 28 em 28 dias</h2>
<p>As quatro janelas cobrem de 25/06 a 15/10. A TK entrou em 03/09, no meio da 3ª janela; a 4ª (17/09 a 15/10) é a primeira inteira com o nosso trabalho.</p>
<div class="grid" style="margin-top:6mm">
{barras('views', 'Visualizações', 'A maior das quatro janelas.')}
{barras('total_interactions', 'Interações com o conteúdo', 'Volta ao pico de julho/agosto.')}
{barras('reach', 'Contas alcançadas', 'Caiu na última janela.')}
{barras('follower_count', 'Novos seguidores', 'Ritmo de quase 1 por dia.')}
</div>
<div class="dest"><p><b>Leitura:</b> o perfil está sendo <b>mais visto e mais respondido</b> (visualizações +34% e interações +71% em relação à janela anterior),
mas por <b>menos gente diferente</b> (alcance −15%). Ou seja: quem já segue está vendo e reagindo mais; o conteúdo ainda não está saindo
da bolha dos seguidores. É o ponto a atacar agora.</p></div>
<div class="rod"><span>Dra. Camilla Wanderley</span><span>2</span></div></section>

<section class="pg">
<div class="k">2 · antes x depois</div><h2>Ritmo e desempenho por post</h2>
<div class="big">
<div class="n"><div class="v">{f"{len(antes) / semanas_antes:.1f}".replace(".", ",")}</div><div class="l">posts por semana<br>antes</div></div>
<div class="n"><div class="v">{f"{len(depois) / semanas_depois:.1f}".replace(".", ",")}</div><div class="l">posts por semana<br>depois</div></div>
<div class="n"><div class="v">{fmt(soma(antes, 'sh'))}</div><div class="l">compartilhamentos<br>em 3 meses antes</div></div>
<div class="n"><div class="v">{fmt(soma(depois, 'sh'))}</div><div class="l">compartilhamentos<br>em 6 semanas depois</div></div>
</div>
<table><tr><th>mediana por post</th><th>posts antes</th><th>depois</th><th>alcance antes</th><th>depois</th><th>visualiz. antes</th><th>depois</th><th>interações antes</th><th>depois</th></tr>
{tab_tipos}</table>
<p class="nota">Mediana = o post "do meio" (não distorce com um post que explodiu). No depois, os 2 posts que ficaram com alcance zero (05/10 e 12/10) estão fora da mediana: ver página 4.</p>
<div class="dest"><p><b>O que mudou:</b> a frequência foi de <b>1,2 para 2,1 posts por semana</b> (+75%) sem perder alcance por post: a mediana ficou no mesmo patamar
(234 → 237). O <b>post de imagem melhorou</b> (alcance e interações maiores), os <b>compartilhamentos</b> de 6 semanas já igualam os de 3 meses inteiros,
e o <b>reels continua sendo o formato que mais alcança</b>. Dois pontos caíram: a <b>mediana dos reels</b> (406 → 295: o melhor reels do período foi um dos maiores do ano,
mas os outros ficaram abaixo dos de antes) e as <b>interações por post</b> (18 → 15). E os salvamentos estão em zero desde setembro: o conteúdo é visto, mas ainda não é "guardado".</p></div>
<div class="rod"><span>Dra. Camilla Wanderley</span><span>3</span></div></section>

<section class="pg">
<div class="k">3 · os conteúdos</div><h2>Post a post desde 03/09</h2>
<table><tr><th>data</th><th>tipo</th><th>conteúdo</th><th>alcance</th><th>visualiz.</th><th>curtidas</th><th>coment.</th><th>compart.</th><th>assistido</th></tr>
{linhas_posts}</table>
<div class="grid" style="margin-top:5mm">
<div class="card"><div class="ct">o que puxou resultado</div>
<p><b>Mancha branca no sulco</b> (reels, 11/09): {fmt(tops[0]['reach'])} contas, o <b>2º maior alcance do perfil nos últimos 12 meses</b>. Ela explicando uma dúvida real, direto.</p>
<p><b>Primeira consulta da criança</b> (reels, 08/10): 12 compartilhamentos, o mais compartilhado do período.</p>
<p><b>195 anos de União</b> (13/10): o post de imagem mais forte de outubro, com 27 interações e 4 comentários.</p></div>
<div class="card"><div class="ct">o que pede atenção</div>
<p><b>05/10 e 12/10 com alcance zero</b>: nenhuma conta, nenhuma curtida. Indica post arquivado, oculto do perfil ou com falha na publicação. Conferir no app.</p>
<p><b>Periodontite na gestação</b> (07/10): a maior retenção de todos os reels (12,4 s assistidos em média), mas alcance baixo (191). Foi publicado às 15h30 de uma quarta, fora do horário de costume.</p></div>
</div>
<div class="rod"><span>Dra. Camilla Wanderley</span><span>4</span></div></section>

<section class="pg">
<div class="k">4 · diagnóstico e próximos passos</div><h2>Onde estamos e o que fazer</h2>
<p><b>Diagnóstico.</b> Em seis semanas, o perfil quase dobrou o ritmo de publicação mantendo o alcance por post, e a conta voltou a crescer em visualizações e interações.
Por post, as interações ainda estão um pouco abaixo de antes (mediana 18 → 15).
O conteúdo de vídeo com a doutora explicando é o que mais alcança e mais segura a atenção. O que ainda não aconteceu é o salto de alcance para fora dos seguidores:
a última janela alcançou menos contas que as anteriores. A virada para o público adulto (endodontia, "salvar o dente") começou em 07/10, com só três posts: é cedo para julgar.</p>
<div class="fio"></div>
<div class="k">oportunidades</div>
<ol>
<li><b>Mais reels com ela falando.</b> Os três maiores alcances do ano são reels com ela na tela. Meta: 1 reels por semana da diária de captação.</li>
<li><b>Conteúdo que dá vontade de salvar.</b> Zero salvamentos desde setembro. Carrosséis com lista prática ("os 4 sinais de que o dente precisa de canal") e chamada "salva pra lembrar".</li>
<li><b>Gancho nos 3 primeiros segundos.</b> O tempo médio assistido dos reels vai de 6 a 12 s. Abrir com a pergunta ou a frase forte, antes de qualquer contexto.</li>
<li><b>Horário consistente.</b> Testar 12h (o de costume) contra 19h por 4 semanas e ficar com o que alcançar mais.</li>
<li><b>Stories todo post.</b> Três stories ligados a cada post levam o seguidor de volta ao feed e ajudam a distribuição.</li>
</ol>
<div class="fio"></div>
<div class="k">próximo relatório</div>
<p>Em meados de novembro, com 30 dias da nova linha (feed adulto, estética foto editorial, reels editados no padrão novo), comparando com este.</p>
<div class="rod"><span>Dra. Camilla Wanderley</span><span>5</span></div></section>
</body></html>"""

open(SAIDA + ".html", "w", encoding="utf-8").write(html_doc)
subprocess.run([CHROME, "--headless=new", f"--user-data-dir={AQUI}/.chrome-render", "--no-pdf-header-footer", "--virtual-time-budget=8000",
                f"--print-to-pdf={SAIDA}.pdf", "file:///" + SAIDA + ".html"], capture_output=True)
print("ok", SAIDA + ".pdf")
