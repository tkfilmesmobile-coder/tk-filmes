"""PDF de entrega do calendário de postagens da Dra. Camilla (26/10 a 31/12/2026), no padrão visual da TK
(modelo: calendário da Tamara de 2026-10). Lê a agenda de monta_calendario_2026-11-12.py.
Saída: calendarios/2026-11-12-calendario-camilla-wanderley.pdf"""
import glob, html, importlib.util, os, subprocess
import cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, "..", "..", ".."))
POSTS = os.path.normpath(os.path.join(AQUI, "..", "posts"))
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
spec = importlib.util.spec_from_file_location("m", os.path.join(AQUI, "monta_calendario_2026-11-12.py"))
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
url = lambda p: "file:///" + p.replace("\\", "/").replace(" ", "%20")

# capas dos vídeos (quadro aos 1,6 s, onde aparece o título)
CAPAS = os.path.join(AQUI, "capas-videos")
os.makedirs(CAPAS, exist_ok=True)
for fmt, tema, fonte, leg in m.SEQUENCIA + m.SEQUENCIA_DEZ:
    if leg and fonte.startswith("Drive") and not os.path.exists(os.path.join(CAPAS, leg + ".jpg")):
        mp4 = fonte.replace("Drive: ", r"H:\Meu Drive\Dra. Camilla Wanderlley" + "\\").replace("/", "\\")
        cap = cv2.VideoCapture(mp4); cap.set(cv2.CAP_PROP_POS_MSEC, 1600); ok, fr = cap.read()
        h, w = fr.shape[:2]
        cv2.imwrite(os.path.join(CAPAS, leg + ".jpg"), cv2.resize(fr, (540, int(540 * h / w))), [cv2.IMWRITE_JPEG_QUALITY, 86])

MINI = os.path.join(AQUI, "_mini")
os.makedirs(MINI, exist_ok=True)


def mini(caminho, largura):
    """Miniatura JPG pro PDF não ficar pesado."""
    from PIL import Image
    nome = os.path.relpath(caminho, POSTS).replace(os.sep, "_").rsplit(".", 1)[0] + f"-{largura}.jpg"
    dst = os.path.join(MINI, nome)
    if not os.path.exists(dst):
        im = Image.open(caminho).convert("RGB"); im.thumbnail((largura, largura * 2)); im.save(dst, quality=80)
    return url(dst)


feed = m.agenda()
tudo = dict(sorted({**feed, **{d: (*v, None) for d, v in m.SO_STORIES.items()}}.items()))
E = html.escape

linhas, blocos = [], []
for i, (d, (fmt, tema, fonte, leg)) in enumerate(tudo.items(), 1):
    dia = f"{m.DIAS[d.weekday()]} {d:%d/%m}"
    pasta = os.path.join(POSTS, fonte.replace("posts/", "").replace("/", os.sep)) if fonte.startswith("posts/") else None
    st = sorted(glob.glob(os.path.join(pasta, "story-*.png"))) if pasta else []
    linhas.append(f"<tr><td>{i}</td><td class='nb'>{dia}</td><td>{E(fmt)}</td><td>{E(tema)}</td><td>{len(st) or ('repost' if leg else '')}</td></tr>")
    if leg == "mari":  # reels que está no notebook; capa = o carrossel da Mari
        img = mini(os.path.join(POSTS, "2026-10", "07-carrossel-mari", "01.png"), 620); arq = fonte.replace("Notebook: ", "Notebook · ")
        legenda = "A legenda vai junto com o arquivo no notebook."
    elif leg:
        img = url(os.path.join(CAPAS, leg + ".jpg")); arq = fonte.replace("Drive: ", "Drive · ")
        legenda = m.LEG_VIDEO[leg] + m.ASSINA
    else:
        capa = os.path.join(pasta, "01.png") if os.path.exists(os.path.join(pasta, "01.png")) else (st[0] if st else "")
        img = mini(capa, 620); arq = "Drive · POSTS/" + fonte.replace("posts/", "")
        legenda = m.ler(fonte)
    sts = "".join(f"<img src='{mini(s, 200)}'>" for s in st)
    blocos.append(f"""<section class="post"><div class="cab"><span class="num">{i}</span><h3>{dia} · {E(fmt)} · {E(tema)}</h3></div>
<div class="grid"><div><img class="capa-post" src="{img}">{f'<div class="sts">{sts}</div>' if sts else ''}</div><div>
<p class="rot">ARQUIVO</p><p class="arte">{E(arq)}</p>
{f'<p class="rot">LEGENDA</p><pre>{E(legenda)}</pre>' if legenda else '<p class="arte">Só stories: os 3 stories da data, sem post no feed.</p>'}
</div></div></section>""")

n = lambda mes: sum(1 for x in feed if x.month == mes)
LOGO = url(os.path.join(RAIZ, "_contexto", "marca", "logo.svg"))
doc = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<style>
@page{{size:A4;margin:0}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Open Sans',sans-serif;color:#5A3A2E;background:#FAF6F3}}
.pag{{width:210mm;min-height:297mm;padding:18mm 16mm 20mm;page-break-after:always;position:relative}}
.capa{{display:flex;flex-direction:column;justify-content:center}}
.capa img{{width:170px}}
.capa small{{margin-top:60px;font-size:11pt;letter-spacing:.35em;color:#CD9365;font-weight:600}}
.capa h1{{font-size:38pt;font-weight:800;line-height:1.05;margin-top:12px;text-transform:uppercase}}
.capa p{{margin-top:18px;font-size:12.5pt;color:#8D6545;max-width:150mm;line-height:1.55}}
.capa .fio{{width:60px;height:2px;background:#CD9365;margin-top:30px}}
h2{{font-size:18pt;font-weight:800;text-transform:uppercase;margin-bottom:10px}}
h2 small{{display:block;font-size:9pt;letter-spacing:.3em;color:#CD9365;font-weight:600;margin-bottom:4px}}
table{{width:100%;border-collapse:collapse;font-size:9pt;background:#fff;border-radius:12px;overflow:hidden}}
td{{padding:6px 8px;border-bottom:1px solid #eee2d8;vertical-align:top}}
tr:nth-child(odd) td{{background:#fffaf6}}
.nb{{white-space:nowrap}}
.leg{{margin-top:14px;font-size:8.8pt;color:#8D6545;line-height:1.65}}
.post{{background:#fff;border-radius:18px;padding:12px 14px;margin-bottom:10px;page-break-inside:avoid}}
.cab{{display:flex;align-items:center;gap:10px;margin-bottom:8px}}
.num{{background:#CD9365;color:#fff;font-weight:800;border-radius:999px;min-width:26px;height:26px;display:grid;place-items:center;font-size:10pt}}
h3{{font-size:10.5pt;font-weight:700}}
.grid{{display:grid;grid-template-columns:52mm 1fr;gap:12px}}
.capa-post{{width:52mm;border-radius:8px;display:block}}
.sts{{display:flex;gap:2mm;margin-top:2mm}} .sts img{{width:16mm;border-radius:4px}}
.rot{{font-size:7pt;letter-spacing:.3em;color:#CD9365;font-weight:700;margin-top:4px}}
.arte{{font-size:8pt;line-height:1.45;margin-bottom:4px;color:#8D6545}}
pre{{white-space:pre-wrap;font-family:'Open Sans',sans-serif;font-size:7.8pt;line-height:1.45;color:#5A3A2E}}
.nota{{font-size:9pt;line-height:1.65}} .nota li{{margin-bottom:6px}}
.rodape{{position:absolute;bottom:9mm;left:16mm;right:16mm;font-size:7.5pt;color:#C4AE98;letter-spacing:.2em;display:flex;justify-content:space-between}}
</style></head><body>
<div class="pag capa"><img src="{LOGO}"><small>CALENDÁRIO DE POSTAGENS · 26/10 A 31/12/2026</small>
<h1>Dra. Camilla<br>Wanderley</h1><div class="fio"></div>
<p>@dra.camillawanderley · Clínica Geral e Endodontia · às quintas na CIP, União dos Palmares<br>
{len(feed)} posts no feed ({n(10)} no fim de outubro, {n(11)} em novembro, {n(12)} em dezembro) e 2 datas só nos stories.
O reels do depoimento da Mari, os vídeos e carrosséis da diária de 22/10, três vídeos gravados em setembro e as datas comemorativas de novembro e dezembro.</p>
<div class="rodape"><span>TK FILMES</span><span>PRODUÇÃO AUDIOVISUAL E CRIATIVA</span></div></div>
<div class="pag"><h2><small>VISÃO GERAL</small>A agenda</h2>
<table><tr><td><b>#</b></td><td><b>data</b></td><td><b>formato</b></td><td><b>conteúdo</b></td><td><b>stories</b></td></tr>{''.join(linhas)}</table>
<p class="leg">Regras: data comemorativa sai no dia dela. Cada vídeo é seguido do carrossel feito em cima dele. Um dia livre entre um post
e outro. Se um vídeo ou carrossel cai em dia de data comemorativa (mesmo as que vão só nos stories), ele pula pro dia seguinte e o
resto segue com um dia de espaço.
Finados (02/11) fica sem post. Cada post leva 3 stories; nos reels, o próprio vídeo vai pro story.</p>
<div class="rodape"><span>TK FILMES</span><span>DRA. CAMILLA WANDERLEY · NOV/DEZ 2026</span></div></div>
<div class="pag">{''.join(blocos)}</div>
<div class="pag"><h2><small>ANTES DE PUBLICAR</small>O que falta</h2><ul class="nota">
<li>Termos de autorização de imagem dos pacientes que aparecem nos vídeos e carrosséis. Sem termo, o post não sai.</li>
<li>Confirmar com a doutora as frases sobre o pai (17/11 e 08/12) e se a filha pode aparecer (08/12 e stories de Natal).</li>
<li>Conferir a palavra "abraçada" na legenda do vídeo da colaboradora.</li>
<li>Renovar o acesso do Instagram da doutora antes de 27/11.</li>
<li>Dezembro tem 5 posts no feed, como no contrato. Ainda cabem: o vídeo do implante (falta a animação) e a próxima diária.</li>
<li>Consciência Negra: fotos do Ministério da Cultura (CC BY 2.0), com o crédito na legenda.</li></ul>
<div class="rodape"><span>TK FILMES</span><span>DRA. CAMILLA WANDERLEY · NOV/DEZ 2026</span></div></div>
</body></html>"""
hp = os.path.join(AQUI, "_calendario-pdf.html")
open(hp, "w", encoding="utf-8").write(doc)
pdf = os.path.join(AQUI, "2026-11-12-calendario-camilla-wanderley.pdf")
if os.path.exists(pdf): os.remove(pdf)
perfil = os.path.join(AQUI, ".chrome")
subprocess.run([CHROME, "--headless=new", f"--user-data-dir={perfil}", "--no-pdf-header-footer", "--virtual-time-budget=10000",
                f"--print-to-pdf={pdf}", url(hp)], capture_output=True)
subprocess.run([CHROME, "--headless=new", f"--user-data-dir={perfil}", "--hide-scrollbars", "--window-size=794,6000",
                "--virtual-time-budget=10000", f"--screenshot={os.path.join(AQUI, '_conferencia.png')}", url(hp)], capture_output=True)
print(pdf, os.path.getsize(pdf))
