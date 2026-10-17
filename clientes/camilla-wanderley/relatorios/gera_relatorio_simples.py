"""Relatório "pra quem não é da área" do @dra.camillawanderley: antes x depois da TK (início 03/09/2026),
em linguagem simples e visual leve na paleta da doutora (blush, vinho, rosé). Foco no objetivo maior:
construir uma base sólida da imagem dela (não caçar visualização), sem deixar de mostrar as métricas.
Os números vêm de relatorios/dados/coleta-2026-10-15.json (API do Instagram, dados/coleta.py).
A versão técnica (tabelas completas) é a gera_relatorio.py.
Uso: python clientes/camilla-wanderley/relatorios/gera_relatorio_simples.py
"""
import json, os, statistics as st, subprocess

AQUI = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
D = json.load(open(f"{AQUI}/dados/coleta-2026-10-15.json", encoding="utf-8"))
SAIDA = f"{AQUI}/2026-10-relatorio-camilla-wanderley"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
FOTO = "file:///" + os.path.abspath(f"{AQUI}/../posts/2026-10/05-uniao-195-anos/fotos/0164.jpg").replace("\\", "/")
TH = lambda n: f"file:///{AQUI}/dados/thumbs/{n}.jpg"

# ---------- números (todos calculados dos dados) ----------
INICIO, ANTES_DE = "2026-09-03", "2026-06-03"
posts = []
for m in D["midia"]:
    i = m["insights"] if isinstance(m.get("insights"), dict) else {}
    posts.append(dict(data=m["timestamp"][:10], reach=i.get("reach"), sh=i.get("shares") or 0, sav=i.get("saved") or 0))
antes = [p for p in posts if ANTES_DE <= p["data"] < INICIO]
depois = [p for p in posts if p["data"] >= INICIO]
alc_antes = st.median([p["reach"] for p in antes])
alc_depois = st.median([p["reach"] for p in depois if p["reach"]])
sh_antes, sh_depois = sum(p["sh"] for p in antes), sum(p["sh"] for p in depois)
sav_antes, sav_depois = sum(p["sav"] for p in antes), sum(p["sav"] for p in depois)
freq_antes, freq_depois = len(antes) / 13.1, len(depois) / 6.1

def janela(nome):
    vals = []
    for x in D["conta_insights"][nome]:
        dd = x["r"]["data"][0]
        vals.append((x["de"], dd["total_value"]["value"] if "total_value" in dd else sum(y["value"] for y in dd["values"])))
    vals.sort()
    return [v for _, v in vals]  # da mais antiga pra mais recente (4 janelas de 28 dias)
views, inter, reach, novos = janela("views"), janela("total_interactions"), janela("reach"), janela("follower_count")
seg = D["conta"]["followers_count"]

br = lambda v: f"{v:,.0f}".replace(",", ".")
dec = lambda v: f"{v:.1f}".replace(".", ",")
pct = lambda a, b: f"{(b - a) / a * 100:+.0f}%".replace("+", "+")

# posts por semana, de 03/06 a 15/10 (pra faixa de bolinhas)
import datetime as dt
ini = dt.date(2026, 6, 3)
sem = [0] * 20
for p in posts:
    if p["data"] >= "2026-06-03":
        k = (dt.date.fromisoformat(p["data"]) - ini).days // 7
        if k < 20:
            sem[k] += 1
SEM_TK = (dt.date(2026, 9, 3) - ini).days // 7

def faixa():
    cols = []
    for k, n in enumerate(sem):
        d0 = ini + dt.timedelta(days=7 * k)
        bolas = "".join(f'<i class="{"tk" if k >= SEM_TK else ""}"></i>' for _ in range(n)) or '<i class="vazio"></i>'
        cols.append(f'<div class="sem">{bolas}<span>{d0.day:02d}/{d0.month:02d}</span></div>')
    return "".join(cols)

def barra(rot, a, b, txta, txtb):
    mx = max(a, b)
    return f"""<div class="cmp"><div class="cmpt">{rot}</div>
<div class="lin"><span class="lab">antes</span><span class="trilho"><span class="b a" style="width:{a / mx * 100:.0f}%"></span></span><span class="val">{txta}</span></div>
<div class="lin"><span class="lab"><b>com a TK</b></span><span class="trilho"><span class="b d" style="width:{b / mx * 100:.0f}%"></span></span><span class="val"><b>{txtb}</b></span></div></div>"""

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Nunito,sans-serif;color:#4A2F33;background:#FBF4F2;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:18mm 17mm 16mm;position:relative;page-break-after:always;overflow:hidden;background:#FBF4F2}
.pg:last-child{page-break-after:auto}
h1{font-family:'Playfair Display',serif;font-weight:600;font-size:40pt;line-height:1.02;color:#7E2A38}
h2{font-family:'Playfair Display',serif;font-weight:600;font-size:25pt;line-height:1.1;color:#7E2A38;margin-bottom:2mm}
.sub{font-size:11pt;color:#8a5f66;line-height:1.5;margin-bottom:6mm}
.tag{display:inline-block;background:#F3D9DC;color:#7E2A38;font-weight:800;font-size:8pt;letter-spacing:2px;text-transform:uppercase;padding:1.6mm 4mm;border-radius:20px;margin-bottom:4mm}
p{font-size:10.5pt;line-height:1.6}
b{color:#7E2A38}
.rod{position:absolute;bottom:8mm;left:17mm;right:17mm;display:flex;justify-content:space-between;font-size:8pt;color:#b78c92}
/* capa */
.capa{display:grid;grid-template-columns:1fr 78mm;gap:8mm;height:100%}
.capa .foto{border-radius:6mm;overflow:hidden;height:100%}
.capa .foto img{width:100%;height:100%;object-fit:cover;object-position:19% center}
.capa .txt{display:flex;flex-direction:column;justify-content:center}
.capa .assina{margin-top:10mm;font-size:9.5pt;color:#8a5f66;line-height:1.6}
/* ganhos */
.ganhos{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:4mm}
.g{background:#fff;border-radius:5mm;padding:6mm;box-shadow:0 2mm 6mm rgba(126,42,56,.06)}
.g .ic{font-size:22pt}
.g .num{font-family:'Playfair Display',serif;font-weight:700;font-size:30pt;color:#7E2A38;line-height:1;margin-top:2mm}
.g .tit{font-weight:800;font-size:11.5pt;margin-top:2mm;color:#4A2F33}
.g .ex{font-size:9.3pt;color:#8a5f66;margin-top:1.5mm;line-height:1.5}
.up{display:inline-block;background:#E3F1E6;color:#3E7B4F;font-weight:800;font-size:8.5pt;border-radius:10px;padding:.6mm 2.5mm;margin-left:1mm;vertical-align:middle}
.nota{background:#7E2A38;color:#fff;border-radius:5mm;padding:6mm 7mm;margin-top:6mm}
.nota p{color:#fff}.nota b{color:#FFD3DA}
/* antes x depois */
.cmp{background:#fff;border-radius:4mm;padding:3mm 5mm;margin-bottom:2.4mm}
.cmpt{font-weight:800;font-size:10pt;margin-bottom:2mm}
.lin{display:grid;grid-template-columns:20mm 1fr 30mm;align-items:center;gap:3mm;margin:1.2mm 0;font-size:9pt;color:#8a5f66}
.trilho{height:4.2mm;background:#F6E9E8;border-radius:3mm;overflow:hidden;display:block}
.b{display:block;height:100%;border-radius:3mm}.b.a{background:#E2C2C6}.b.d{background:#C9566A}
.val{text-align:right}
.faixa{display:flex;gap:1.6mm;align-items:flex-end;background:#fff;border-radius:4mm;padding:3mm 5mm 2mm;margin-top:2mm}
.sem{display:flex;flex-direction:column-reverse;align-items:center;gap:1mm;flex:1}
.sem i{width:3.2mm;height:3.2mm;border-radius:50%;background:#E2C2C6;display:block}
.sem i.tk{background:#C9566A}.sem i.vazio{background:transparent;border:1px dashed #e3cfd2}
.sem span{font-size:6pt;color:#b78c92;margin-top:1mm}
.leg{font-size:8.5pt;color:#8a5f66;margin-top:2mm}
.leg i{display:inline-block;width:3mm;height:3mm;border-radius:50%;vertical-align:middle;margin:0 1mm 0 3mm}
/* imagem */
.pilares{display:grid;grid-template-columns:1fr 1fr;gap:4.5mm}
.pl{background:#fff;border-radius:5mm;padding:5.5mm}
.pl .n{width:8mm;height:8mm;border-radius:50%;background:#F3D9DC;color:#7E2A38;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:10pt}
.pl .t{font-family:'Playfair Display',serif;font-weight:600;font-size:13.5pt;color:#7E2A38;margin:2.5mm 0 1.5mm}
.pl p{font-size:9.3pt;line-height:1.55;color:#5c3d42}
.pl .prova{margin-top:2.5mm;font-size:8.6pt;background:#FBF0F0;border-radius:3mm;padding:2.2mm 3mm;color:#7E2A38}
/* destaques */
.dest{display:grid;grid-template-columns:repeat(3,1fr);gap:4.5mm}
.dc{background:#fff;border-radius:5mm;overflow:hidden}
.dc img{width:100%;height:58mm;object-fit:cover;object-position:center 25%;display:block}
.dc .in{padding:4mm}
.dc .num{font-family:'Playfair Display',serif;font-weight:700;font-size:20pt;color:#7E2A38;line-height:1}
.dc .t{font-weight:800;font-size:9.5pt;margin-top:1.5mm}
.dc .ex{font-size:8.5pt;color:#8a5f66;margin-top:1mm;line-height:1.45}
.at{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:5mm}
.ai{background:#fff;border-radius:4mm;padding:4.5mm;border-left:2mm solid #E8A9B3}
.ai .t{font-weight:800;font-size:10pt}
.ai p{font-size:8.9pt;color:#5c3d42;margin-top:1mm;line-height:1.5}
/* próximos */
.passos{display:grid;gap:3.5mm}
.ps{background:#fff;border-radius:4mm;padding:4.5mm 5mm;display:grid;grid-template-columns:10mm 1fr;gap:3mm;align-items:start}
.ps .ic{font-size:17pt}
.ps .t{font-weight:800;font-size:10.5pt}
.ps p{font-size:9.2pt;color:#5c3d42;line-height:1.5}
.glos{background:#F3E1E3;border-radius:5mm;padding:5mm 6mm;margin-top:6mm}
.glos .t{font-weight:800;font-size:10pt;color:#7E2A38;margin-bottom:2mm}
.glos p{font-size:8.8pt;line-height:1.6;color:#5c3d42}
"""

html = f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>

<section class="pg"><div class="capa">
<div class="txt">
<span class="tag">relatório · outubro 2026</span>
<h1>Seu Instagram,<br>6 semanas<br>depois</h1>
<p class="sub" style="margin-top:6mm">O que mudou no <b>@dra.camillawanderley</b> desde que começamos a trabalhar juntas,
em 03/09/2026, até 15/10/2026. Em linguagem simples, com os números certinhos.</p>
<div class="assina">Preparado pela <b>TK Filmes</b><br>para a Dra. Camilla Wanderley · Clínica Geral e Endodontia</div>
</div>
<div class="foto"><img src="{FOTO}"></div>
</div></section>

<section class="pg">
<span class="tag">em 30 segundos</span>
<h2>O que a gente conquistou</h2>
<p class="sub">Comparando com os 3 meses antes de começarmos.</p>
<div class="ganhos">
<div class="g"><div class="ic">📅</div><div class="num">{dec(freq_depois)}<span style="font-size:13pt"> posts/semana</span></div>
<div class="tit">Quase o dobro de presença</div><div class="ex">Antes eram {dec(freq_antes)} por semana. Você passou a aparecer com constância, que é o que faz as pessoas lembrarem de você.</div></div>
<div class="g"><div class="ic">👀</div><div class="num">{br(views[-1])}</div>
<div class="tit">Mais gente assistindo <span class="up">{pct(views[-2], views[-1])}</span></div><div class="ex">Visualizações nos últimos 28 dias: a maior marca dos últimos 4 meses.</div></div>
<div class="g"><div class="ic">💬</div><div class="num">{br(inter[-1])}</div>
<div class="tit">Mais conversa <span class="up">{pct(inter[-2], inter[-1])}</span></div><div class="ex">Curtidas, comentários, compartilhamentos e mensagens nos últimos 28 dias, contra {br(inter[-2])} nos 28 dias anteriores.</div></div>
<div class="g"><div class="ic">🏆</div><div class="num">1.013</div>
<div class="tit">Um vídeo campeão</div><div class="ex">Pessoas que viram o reels da mancha branca (11/09): o 2º maior alcance do seu perfil nos últimos 12 meses.</div></div>
</div>
<div class="nota"><p><b>E o mais importante:</b> o nosso objetivo não é viralizar, é construir uma <b>imagem sólida</b> da Dra. Camilla:
a dentista em quem as pessoas confiam pra cuidar do dente, e principalmente pra <b>salvar o dente com o canal</b>.
Na página 4 está o que já foi construído nesse sentido.</p></div>
<div class="rod"><span>TK Filmes · Dra. Camilla Wanderley</span><span>2</span></div></section>

<section class="pg">
<span class="tag">antes x depois</span>
<h2>O antes e o depois, lado a lado</h2>
<p class="sub">"Antes" = 03/06 a 02/09 (3 meses) · "com a TK" = 03/09 a 15/10 (6 semanas).</p>
{barra("📅 Publicações por semana", freq_antes, freq_depois, dec(freq_antes), dec(freq_depois))}
{barra("🙋 Pessoas que cada post alcança (post típico)", alc_antes, alc_depois, br(alc_antes), br(alc_depois))}
{barra("👀 Visualizações em 28 dias", views[-2], views[-1], br(views[-2]), br(views[-1]))}
{barra("💬 Interações em 28 dias", inter[-2], inter[-1], br(inter[-2]), br(inter[-1]))}
{barra("➕ Novos seguidores em 28 dias", novos[-2], novos[-1], br(novos[-2]), br(novos[-1]))}
{barra("📤 Compartilhamentos (gente mandando seu post pra alguém)", sh_antes, sh_depois, f"{sh_antes} em 3 meses", f"{sh_depois} em 6 semanas")}
<p style="font-size:9.3pt;color:#5c3d42;margin-top:1mm"><b>O que isso quer dizer:</b> você passou a postar quase o dobro, e <b>cada post continua chegando no mesmo número de pessoas</b>
({br(alc_antes)} → {br(alc_depois)}). Ou seja, mais presença sem cansar o público. E os compartilhamentos de 6 semanas já empataram com os de 3 meses inteiros.</p>
<div class="cmpt" style="margin-top:3mm">Como ficou a constância, semana a semana (cada bolinha é um post)</div>
<div class="faixa">{faixa()}</div>
<div class="leg"><i style="background:#E2C2C6"></i>antes <i style="background:#C9566A"></i>com a TK (desde 03/09)</div>
<div class="rod"><span>TK Filmes · Dra. Camilla Wanderley</span><span>3</span></div></section>

<section class="pg">
<span class="tag">o objetivo maior</span>
<h2>O que já construímos pra sua imagem</h2>
<p class="sub">Número é consequência. O que a gente está levantando é a base: quem é a Dra. Camilla pra quem ainda não te conhece.</p>
<div class="pilares">
<div class="pl"><div class="n">1</div><div class="t">Ficou claro quem você é</div>
<p>Clínica Geral e <b>Endodontia (canal)</b>, falando com o adulto. O calendário de outubro foi pensado em cima disso: o medo de dentista,
"dente doía e arrancava", a dor que some sozinha, "canal dói?". Temas que fazem a pessoa pensar e se reconhecer, sem "vender" tratamento.</p>
<div class="prova">✔ A nova linha começou em 07/10 e o post de União já foi o de imagem com mais comentários do mês.</div></div>
<div class="pl"><div class="n">2</div><div class="t">Um visual com a sua cara</div>
<p>Uma estética própria e aprovada: <b>foto real sua</b>, texto elegante, nada de imagem de banco. E um padrão de vídeo próprio,
com título, animação 3D, legenda e trilha. Quem passar pelo seu perfil vai reconhecer o seu conteúdo.</p>
<div class="prova">✔ Estética e padrão de vídeo registrados, pra todo conteúdo novo sair no mesmo nível.</div></div>
<div class="pl"><div class="n">3</div><div class="t">Você no centro</div>
<p>Duas diárias de captação no consultório (03/09 e 24/09), um banco com <b>115 fotos</b> organizado no Drive e vídeos com você explicando.
As pessoas confiam em quem elas veem.</p>
<div class="prova">✔ Os 6 maiores alcances do seu perfil no último ano foram todos vídeos (reels).</div></div>
<div class="pl"><div class="n">4</div><div class="t">Confiança antes da consulta</div>
<p>Conteúdo que explica e acolhe: periodontite na gestação, medo de dentista, "canal dói?". Quem assiste chega na consulta já confiando em você.</p>
<div class="prova">✔ O vídeo da periodontite teve o maior tempo assistido de todos (12,4 s em média): quem começa, fica.</div></div>
</div>
<div class="nota" style="margin-top:5mm"><p><b>E um laço com a cidade:</b> no aniversário de 195 anos de União, o post "Toda quinta eu pego a estrada de Maceió até aqui"
mostrou o seu compromisso com quem você atende. Foi o post de imagem mais forte de outubro.</p></div>
<div class="rod"><span>TK Filmes · Dra. Camilla Wanderley</span><span>4</span></div></section>

<section class="pg">
<span class="tag">destaques</span>
<h2>Os conteúdos que mais se destacaram</h2>
<div class="dest" style="margin-top:4mm">
<div class="dc"><img src="{TH('mancha')}"><div class="in"><div class="num">1.013</div><div class="t">pessoas alcançadas</div><div class="ex">Reels "Mancha branca no sulco do dente" (11/09). Também teve 1.395 visualizações e 5 comentários.</div></div></div>
<div class="dc"><img src="{TH('primeira-consulta')}"><div class="in"><div class="num">12</div><div class="t">compartilhamentos</div><div class="ex">Reels "A primeira consulta da criança" (08/10): o mais enviado de pessoa pra pessoa no período.</div></div></div>
<div class="dc"><img src="{TH('uniao')}" style="object-position:center 30%"><div class="in"><div class="num">27</div><div class="t">interações</div><div class="ex">"195 anos de União" (13/10): 320 pessoas alcançadas e 4 comentários.</div></div></div>
</div>
<h2 style="font-size:17pt;margin-top:7mm">O que ainda dá pra melhorar</h2>
<div class="at">
<div class="ai"><div class="t">Chegar em quem ainda não te conhece</div><p>Nos últimos 28 dias o conteúdo chegou a {br(reach[-1])} pessoas diferentes, contra {br(reach[-2])} antes ({pct(reach[-2], reach[-1])}). Quem já te segue está vendo mais; o próximo passo é alcançar gente nova.</p></div>
<div class="ai"><div class="t">Conteúdo pra guardar</div><p>Ninguém salvou um post desde setembro (antes foram {sav_antes}). Posts com dicas práticas e "salva pra lembrar" ajudam muito o Instagram a mostrar o seu perfil.</p></div>
<div class="ai"><div class="t">2 posts sem alcance</div><p>Os posts de 05/10 e 12/10 aparecem com zero pessoas alcançadas. Pode ser que tenham sido arquivados ou ocultados: vale conferir no app.</p></div>
<div class="ai"><div class="t">Capa dos vídeos</div><p>No perfil, o reels da periodontite aparece com a imagem da paciente, e não com o título. Escolher uma capa bonita faz mais gente clicar.</p></div>
</div>
<div class="rod"><span>TK Filmes · Dra. Camilla Wanderley</span><span>5</span></div></section>

<section class="pg">
<span class="tag">próximos passos</span>
<h2>Pra continuar construindo</h2>
<p class="sub">O plano pras próximas semanas, já com o que os números mostraram.</p>
<div class="passos">
<div class="ps"><div class="ic">🎥</div><div><div class="t">1 vídeo por semana com você explicando</div><p>É o formato que mais alcança e mais gera confiança. Saem das diárias de captação.</p></div></div>
<div class="ps"><div class="ic">📌</div><div><div class="t">Posts que dá vontade de guardar</div><p>Carrosséis com dicas práticas sobre canal e saúde da boca, com o convite "salva pra lembrar".</p></div></div>
<div class="ps"><div class="ic">🖼️</div><div><div class="t">Capa caprichada em todo reels</div><p>A capa é a vitrine do perfil: título claro e o seu visual, nunca um quadro aleatório do vídeo.</p></div></div>
<div class="ps"><div class="ic">📲</div><div><div class="t">Stories em todo post</div><p>Três stories ligados a cada post levam quem te segue até o conteúdo novo.</p></div></div>
<div class="ps"><div class="ic">📊</div><div><div class="t">Novo relatório em meados de novembro</div><p>Com 30 dias completos da nova linha, pra ver a imagem se firmando mês a mês.</p></div></div>
</div>
<div class="glos"><div class="t">Mini dicionário</div>
<p><b>Alcance:</b> quantas pessoas diferentes viram seu conteúdo. · <b>Visualizações:</b> quantas vezes ele foi visto (a mesma pessoa pode ver mais de uma vez).
· <b>Interações:</b> curtidas, comentários, compartilhamentos, salvamentos e respostas. · <b>Compartilhamento:</b> quando alguém manda o seu post pra outra pessoa.
· <b>Salvamento:</b> quando alguém guarda o post pra ver depois.</p></div>
<p style="font-size:8pt;color:#b78c92;margin-top:4mm">Fonte: dados oficiais da sua conta no Instagram, coletados em 15/10/2026. Os stories não entram: o Instagram só guarda os números de story por 24 horas.</p>
<div class="rod"><span>TK Filmes · Dra. Camilla Wanderley</span><span>6</span></div></section>
</body></html>"""

open(SAIDA + ".html", "w", encoding="utf-8").write(html)
subprocess.run([CHROME, "--headless=new", f"--user-data-dir={AQUI}/.chrome-render", "--no-pdf-header-footer", "--virtual-time-budget=10000",
                f"--print-to-pdf={SAIDA}.pdf", "file:///" + SAIDA + ".html"], capture_output=True)
print("ok", SAIDA + ".pdf")
