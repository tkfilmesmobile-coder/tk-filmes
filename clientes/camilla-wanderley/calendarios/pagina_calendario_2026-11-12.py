"""Página do calendário de postagens (semanas seg-dom com miniaturas), publicada como artifact
(https://claude.ai/artifact/Wti2fzAqFPfeirymwfd57D). Lê a agenda de monta_calendario_2026-11-12.py.
Saída: calendarios/_pagina/agenda.html + _pagina/img/ (fora do git)."""
import datetime as dt, importlib.util, os
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
POSTS = os.path.normpath(os.path.join(AQUI, "..", "posts"))
OUT = os.path.join(AQUI, "_pagina")
os.makedirs(os.path.join(OUT, "img"), exist_ok=True)
spec = importlib.util.spec_from_file_location("m", os.path.join(AQUI, "monta_calendario_2026-11-12.py"))
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
feed = m.agenda()
MESES = {10: "outubro", 11: "novembro", 12: "dezembro", 1: "janeiro"}
TIPO = {"reels": ("Reels", "t-reels"), "carrossel": ("Carrossel", "t-car"), "post de data": ("Data", "t-data"), "só stories": ("Só stories", "t-story")}


def mini(d, fonte, leg):
    nome = f"img/d-{d:%m%d}.jpg"
    if leg == "mari":
        src = os.path.join(POSTS, "2026-10", "07-carrossel-mari", "01.png")
    elif leg:
        src = os.path.join(AQUI, "capas-videos", leg + ".jpg")
    else:
        src = os.path.join(POSTS, fonte.replace("posts/", "").replace("/", os.sep), "01.png")
    im = Image.open(src).convert("RGB"); im.thumbnail((360, 640)); im.save(os.path.join(OUT, nome), quality=82)
    return nome


ini = dt.date(2026, 10, 26); fim = dt.date(2027, 1, 3)
celulas, lista = [], []
d = ini
while d <= fim:
    item = feed.get(d)
    cls = "dia" + (" fora" if d.month == 1 else "") + (" vazio" if not item else "")
    rot = f'<span class="n">{d.day}</span>' + (f'<span class="m">{MESES[d.month][:3]}</span>' if d.day == 1 or d == ini else "")
    corpo = ""
    if item:
        fmt, tema, fonte, leg = item
        t, c = TIPO[fmt]
        corpo = f'<img src="{mini(d, fonte, leg)}" alt="{tema}" loading="lazy"><span class="tipo {c}">{t}</span><span class="tema">{tema}</span>'
        lista.append(f'<li><b class="nb">{m.DIAS[d.weekday()]} {d:%d/%m}</b><span class="tipo {c}">{t}</span><span>{tema}</span></li>')
    celulas.append(f'<div class="{cls}"><div class="cab">{rot}</div>{corpo}</div>')
    d += dt.timedelta(days=1)

n = lambda mes: sum(1 for x in feed if x.month == mes)
html = f'''<title>Agenda Camilla nov-dez</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;600;700&display=swap">
<style>
/* Layout: grade de semanas seg-dom (desktop) que vira lista de datas no celular; resumo e regras no topo */
:root{{--bg:#f6f2ef;--fg:#2b2224;--muted:#776669;--line:#e3d8d4;--card:#fffdfc;--vinho:#8e2737;
  --reels:#2f5f8a;--reels-bg:#e2ecf5;--car:#8a5a12;--car-bg:#f6ead3;--data:#8e2737;--data-bg:#f6e1e4;--st:#5b5560;--st-bg:#ebe7ea;
  --display:"Fraunces",Georgia,serif;--body:"Manrope",system-ui,sans-serif}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#1b1617;--fg:#f2e9e7;--muted:#ab9a9c;--line:#3a2f31;--card:#241d1f;--vinho:#d98a98;
  --reels:#9cc3e6;--reels-bg:#1d2b38;--car:#e6be7a;--car-bg:#3a2e17;--data:#f0a3b0;--data-bg:#3d2228;--st:#c9c2cc;--st-bg:#2e2a2f;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#1b1617;--fg:#f2e9e7;--muted:#ab9a9c;--line:#3a2f31;--card:#241d1f;--vinho:#d98a98;
  --reels:#9cc3e6;--reels-bg:#1d2b38;--car:#e6be7a;--car-bg:#3a2e17;--data:#f0a3b0;--data-bg:#3d2228;--st:#c9c2cc;--st-bg:#2e2a2f;color-scheme:dark}}
body{{background:var(--bg);color:var(--fg);font-family:var(--body);font-size:15px;line-height:1.5}}
.wrap{{max-width:1320px;margin:0 auto;padding-block:28px 56px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:flex;flex-direction:column;gap:26px}}
h1{{font-family:var(--display);font-weight:600;font-size:clamp(28px,4vw,40px);margin:0;text-wrap:balance}}
.sub{{margin:4px 0 0;color:var(--muted);max-width:72ch}}
.resumo{{display:flex;flex-wrap:wrap;gap:10px}}
.resumo div{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 14px;min-width:0}}
.resumo b{{font-family:var(--display);font-size:24px;font-variant-numeric:tabular-nums;display:block}}
.resumo span{{color:var(--muted);font-size:12px;letter-spacing:.06em;text-transform:uppercase}}
.regras{{margin:0;padding-left:18px;color:var(--muted);display:flex;flex-direction:column;gap:3px;max-width:80ch}}
.semana{{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}}
.cabdias{{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}}
.dia{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px;min-height:120px;min-width:0}}
.dia.vazio{{background:transparent}} .dia.fora{{opacity:.45}}
.cab{{display:flex;gap:6px;align-items:baseline}} .n{{font-family:var(--display);font-size:18px;font-variant-numeric:tabular-nums}} .m{{font-size:11px;color:var(--vinho);text-transform:uppercase;letter-spacing:.06em}}
.dia img{{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:5px;display:block}}
.tipo{{align-self:flex-start;font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:2px 7px;border-radius:99px}}
.t-reels{{color:var(--reels);background:var(--reels-bg)}} .t-car{{color:var(--car);background:var(--car-bg)}} .t-data{{color:var(--data);background:var(--data-bg)}} .t-story{{color:var(--st);background:var(--st-bg)}}
.tema{{font-size:12.5px;line-height:1.3}}
.lista{{display:none;list-style:none;margin:0;padding:0;flex-direction:column;gap:8px}}
.lista li{{display:flex;gap:10px;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:8px}}
.lista b{{font-variant-numeric:tabular-nums;min-width:70px}}
.nb{{white-space:nowrap}}
.aviso{{border-left:3px solid var(--vinho);padding:10px 14px;background:var(--card);border-radius:0 8px 8px 0;max-width:80ch}}
.aviso p{{margin:0}}
@media (max-width:760px){{.semana,.cabdias{{display:none}}.lista{{display:flex}}}}
</style>
<main class="wrap">
  <div><h1>Agenda da Dra. Camilla · 26/10 a 31/12</h1>
  <p class="sub">Conteúdo aprovado, publicado sozinho às 12h: datas comemorativas no dia certo, cada vídeo seguido do carrossel dele e um dia livre entre um post e outro.</p></div>
  <div class="resumo">
    <div><b>{n(10)}</b><span>feed em out (26–31)</span></div>
    <div><b>{n(11)}</b><span>feed em novembro</span></div>
    <div><b>{n(12)}</b><span>feed em dezembro</span></div>
    <div><b>{len(m.DATAS)}</b><span>datas comemorativas</span></div>
  </div>
  <ul class="regras">
    <li>Data comemorativa sai no dia dela.</li>
    <li>Postou hoje, o próximo sai depois de amanhã.</li>
    <li>Vídeo ou carrossel que cai em dia de data comemorativa pula pro dia seguinte; o resto segue com um dia de espaço.</li>
    <li>Finados (02/11) fica sem post.</li>
  </ul>
  <div class="cabdias"><span>seg</span><span>ter</span><span>qua</span><span>qui</span><span>sex</span><span>sáb</span><span>dom</span></div>
  <div class="semana">{"".join(celulas)}</div>
  <ul class="lista">{"".join(lista)}</ul>
  <div class="aviso"><p><b>Ajuste de 03/11:</b> o Novembro Azul não saiu em 01/11 (o computador estava em suspensão) e foi publicado em 03/11; o reels da noiva foi pra 04/11. O resto ficou igual.</p></div>
  <div class="aviso"><p><b>Dezembro está com 7 posts no feed:</b> três vídeos gravados em setembro e as datas de 05, 08, 25 e 31/12.</p></div>
</main>
'''
open(os.path.join(OUT, "agenda.html"), "w", encoding="utf-8").write(html)
print(sorted(os.listdir(os.path.join(OUT, "img"))))
