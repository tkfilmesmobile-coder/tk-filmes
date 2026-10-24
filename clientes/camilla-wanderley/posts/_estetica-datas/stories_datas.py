"""Stories (1080x1920) da estética "homenagem" pras datas de nov/dez 2026 da Dra. Camilla.
Em cada data: story 1 com foto dela (diferente da foto do post), stories 2 e 3 tipográficos, pra nenhuma imagem se
repetir dentro da mesma data. Texto dentro da zona segura (x 60–920, y 250–1500, `clientes/_regras.md`).
Palavra nunca dividida em duas linhas. Uso: python stories_datas.py [slug ...]"""
import os, sys
from gera_datas import montar, css_veu, css_rostos, js_rostos, render, POSTS, NOITE, NUDE, CREME, ROSE, VINHO, ICONE_CORACAO, ICONE_DENTE

BASE = """@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden}
body{font-family:'Outfit',sans-serif;position:relative;color:#fff}
.abs{position:absolute} .nb{white-space:nowrap}
.ic{width:70px;height:70px;border-radius:50%;background:rgba(246,239,234,.16);border:1px solid rgba(246,239,234,.45);color:#F6EFEA;display:flex;align-items:center;justify-content:center}
.pill{left:60px;top:270px;padding:9px 22px;border:1px solid rgba(246,239,234,.6);border-radius:99px;font-size:21px;font-weight:500;letter-spacing:5px;color:#F6EFEA;background:rgba(34,8,13,.35)}
.pre{font-size:56px;font-weight:600;letter-spacing:-1.5px;margin-left:12px;margin-bottom:-4px}
.big{font-size:300px;font-weight:800;line-height:1;display:inline-block;align-self:flex-start;
  background:linear-gradient(90deg,#fff 0%,#fff 38%,#EADBD3 55%,#D99AA5 78%,#c25a6e 100%);-webkit-background-clip:text;color:transparent}
.tags{display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.tags span{background:rgba(34,8,13,.88);padding:8px 16px;font-size:30px;color:#F6EFEA}
.rod{left:60px;width:860px;top:1420px;display:flex;justify-content:space-between;align-items:flex-end;font-size:22px;color:#EADBD3}
.rod b{font-weight:600;color:#fff;font-size:24px}
.cw{text-align:right;line-height:1.1} .cw b{font-size:46px;letter-spacing:2px;font-weight:300}
.orbita{width:1100px;height:1100px;border:1.5px solid rgba(246,239,234,.28);border-radius:50%}
"""
RODAPE = """<div class="abs rod"><div class="nb">às quintas na CIP<br><b>União dos Palmares</b></div><div class="cw nb"><b>CW</b><br>@dra.camillawanderley</div></div>"""
# título: cada linha cabe em 860 px (fonte até 300 px)
AJUSTE = """<script>
document.fonts.ready.then(()=>{
  const linhas=[...document.querySelectorAll('.big')]; let tam=TAMMAX;
  linhas.forEach(l=>l.style.fontSize=tam+'px');
  while(linhas.some(l=>l.scrollWidth>860) && tam>80){ tam-=4; linhas.forEach(l=>l.style.fontSize=tam+'px'); }
  linhas.forEach(l=>l.style.letterSpacing=(-tam*0.034)+'px');
  POSICIONA
});
</script>"""


def story_foto(s):
    """Foto inteira dela, cor natural tratada, vinho só no ambiente; frases e título no terço de baixo."""
    foto, rostos = montar(s["foto"], 1080, 1920, s.get("tam", "cover"), s.get("pos", "center top"), s.get("tratada", True),
                          s["chave"])
    cx, cy, ew, eh = s.get("elipse", (50, 32, 52, 46))
    tags = "".join(f"<span>{f}</span>" for f in s["frases"])
    big = "".join(f'<div class="big nb">{l}</div>' for l in s["titulo"])
    topo = s.get("texto") == "topo"
    if topo:  # texto no alto (rostos no meio da foto): título logo abaixo da pílula, frases embaixo do título
        pos = """const b=document.querySelector('.bloco'); b.style.top='350px';
  document.querySelector('.tags').style.top=(350+b.getBoundingClientRect().height+36)+'px';"""
    else:  # bloco (pre + título) termina em y 1380; frases logo acima do bloco
        pos = """const b=document.querySelector('.bloco'); b.style.top=(1380-b.getBoundingClientRect().height)+'px';
  const t=document.querySelector('.tags'); t.style.top=(1380-b.getBoundingClientRect().height-t.getBoundingClientRect().height-40)+'px';
  if(window.foge) foge(t,60);"""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE}
body{{background:{NOITE}}}
.foto{{left:0;top:0;width:1080px;height:1920px;background:url('file:///{foto}') no-repeat 0 0/1080px 1920px}}
{css_rostos(foto, rostos, 1080, 1920)}
.tinge{{left:0;top:0;width:1080px;height:1920px;mix-blend-mode:color;
  background:radial-gradient(ellipse {ew}% {eh}% at {cx}% {cy}%,rgba(142,39,55,0) 0%,rgba(142,39,55,0) 62%,rgba(142,39,55,.85) 100%)}}
.vinheta{{left:0;top:0;width:1080px;height:1920px;mix-blend-mode:multiply;
  background:radial-gradient(ellipse {ew + 10}% {eh + 4}% at {cx}% {cy}%,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 58%,rgba(120,40,52,.75) 100%)}}
.veu{{left:0;top:0;width:1080px;height:1920px;background:{css_veu(rostos, 1920, s.get('rampa', 0.10), topo)}}}
.bloco{{left:48px;display:flex;flex-direction:column}}
.tags{{left:60px}}
</style></head><body>
<div class="abs foto"></div><div class="abs tinge"></div><div class="abs vinheta"></div><div class="abs veu"></div>{'<div class="abs rostos"></div>' if rostos else ''}
{js_rostos(rostos)}
<div class="abs orbita" style="left:-640px;top:160px"></div>
<div class="abs ic" style="left:{s.get('ic', (800, 420))[0]}px;top:{s.get('ic', (800, 420))[1]}px">{ICONE_CORACAO}</div>
<div class="abs pill nb">{s['pill']}</div>
<div class="abs tags nb" style="{s.get('tags_css', '')}">{tags}</div>
<div class="abs bloco"><div class="pre nb">{s.get('pre', '')}</div>{big}</div>
{RODAPE}
{AJUSTE.replace('TAMMAX', '300').replace('POSICIONA', pos)}
</body></html>"""


def story_tipo(s):
    """Sem foto: fundo noite com brilho vinho, arco e ícones; título grande no meio e frases em faixas embaixo."""
    tags = "".join(f"<span>{f}</span>" for f in s["frases"])
    big = "".join(f'<div class="big nb">{l}</div>' for l in s["titulo"])
    pos = """const b=document.querySelector('.bloco'); const h=b.getBoundingClientRect().height;
  b.style.top=(760-h/2)+'px'; document.querySelector('.tags').style.top=(760+h/2+60)+'px';"""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE}
body{{background:
  radial-gradient(ellipse 70% 45% at 85% 12%,rgba(142,39,55,.75) 0%,rgba(142,39,55,0) 70%),
  radial-gradient(ellipse 60% 40% at 0% 70%,rgba(110,28,42,.55) 0%,rgba(110,28,42,0) 70%),
  {NOITE}}}
.bloco{{left:48px;display:flex;flex-direction:column}}
.tags{{left:60px}}
.marca{{right:-40px;top:1080px;font-size:520px;font-weight:800;color:rgba(246,239,234,.045);letter-spacing:-20px;line-height:1}}
</style></head><body>
<div class="abs marca nb">{s.get('marca', '')}</div>
<div class="abs orbita" style="left:-620px;top:240px"></div>
<div class="abs ic" style="left:820px;top:330px">{ICONE_DENTE}</div>
<div class="abs ic" style="left:{s.get('ic', (420, 1290))[0]}px;top:{s.get('ic', (420, 1290))[1]}px">{ICONE_CORACAO}</div>
<div class="abs pill nb">{s['pill']}</div>
<div class="abs bloco"><div class="pre nb">{s.get('pre', '')}</div>{big}</div>
<div class="abs tags nb">{tags}</div>
{RODAPE}
{AJUSTE.replace('TAMMAX', str(s.get('tammax', 300))).replace('POSICIONA', pos)}
</body></html>"""


R = "75784_1"
STORIES = {
    "2026-11/02-semana-cancer-bucal": [
        dict(tipo="foto", foto="2025-06-26_36515", tam="1080px auto", pos="0 -60px", pill="POST NOVO", pre="Novembro", titulo=["Azul"],
             frases=["A ferida que não sara", "em 15 dias merece um olhar."]),
        dict(tipo="tipo", pill="SINAIS DE ALERTA", pre="Fique de olho por", titulo=["15 dias"], marca="15",
             frases=["Ferida que não cicatriza", "Mancha branca ou avermelhada", "Caroço ou endurecimento", "Prótese que machuca sempre no mesmo lugar"]),
        dict(tipo="tipo", pill="MANDA PRA ELE", pre="Conhece um homem que", titulo=["só vai", "quando dói?"], tammax=220, marca="40+",
             frases=["O câncer de boca é mais comum", "em homens depois dos 40.", "Manda esse post pra ele."]),
    ],
    "2026-11/14-dia-mundial-do-diabetes": [
        dict(tipo="foto", foto="2025-09-29_75784_2", tam="auto 1920px", pos="-180px 0", pill="POST NOVO", pre="Dia Mundial do", titulo=["Diabetes"],
             frases=["Diabetes e gengiva conversam", "mais do que a gente imagina."]),
        dict(tipo="tipo", pill="MÃO DUPLA", pre="Uma puxa a", titulo=["outra"], marca="14",
             frases=["Gengiva inflamada dificulta", "o controle da glicose.", "Glicose alta deixa", "a gengiva mais frágil."]),
        dict(tipo="tipo", pill="SE LIGA NOS SINAIS", pre="Tem diabetes e", titulo=["sangra?"], marca="14",
             frases=["Sangramento ao escovar,", "gengiva inchada ou mau hálito", "que não passa pedem atenção.", "Me chama no direct."]),
    ],
    "2026-11/17-prematuridade": [
        dict(tipo="foto", foto="2025-09-29_75784_1", tam="auto 1920px", pos="-180px 0", pill="POST NOVO", pre="Dia Mundial da",
             titulo=["Prematuridade"], frases=["Hoje é dia de falar", "de quem chega antes da hora."]),
        dict(tipo="tipo", pill="NOVEMBRO ROXO", pre="Sorriso também é", titulo=["pré-natal"], marca="17",
             frases=["A gengiva inflamada na gravidez", "é estudada como um dos fatores", "ligados ao parto prematuro."]),
        dict(tipo="tipo", pill="GESTANTE", pre="Está", titulo=["grávida?"], marca="17",
             frases=["Dentista também", "faz parte do pré-natal.", "Me chama no direct."]),
    ],
    "2026-11/20-consciencia-negra": [
        # foto: Ministério da Cultura, CC BY 2.0 (Wikimedia Commons), 20 de novembro no Parque Memorial Quilombo dos Palmares
        dict(tipo="foto", foto="commons-estatuas-celebracao", tratada=False, tam="cover", pos="center 0", texto="topo", rampa=0.06,
             elipse=(55, 62, 70, 40), pill="20 DE NOVEMBRO", pre="Dia da", titulo=["Consciência", "Negra"], ic=(880, 1180),
             frases=["Na Serra da Barriga, em União,", "o 20 de novembro é celebração."]),
        dict(tipo="tipo", pill="SERRA DA BARRIGA", pre="Aqui em União,", titulo=["Palmares"], marca="20",
             frases=["Por quase um século,", "o Quilombo dos Palmares", "resistiu nesta serra."]),
        dict(tipo="tipo", pill="ZUMBI DOS PALMARES", pre="Hoje e sempre,", titulo=["respeito"], marca="20",
             frases=["Lembrar, respeitar", "e honrar essa história."]),
    ],
    "2026-12/05-maceio-211-anos": [
        dict(tipo="foto", foto="2025-09-29_75784_2", tam="auto 1920px", pos="-180px 0", pill="5 DE DEZEMBRO", pre="Parabéns,",
             titulo=["Maceió"], frases=["211 anos da cidade", "onde eu moro."]),
        dict(tipo="tipo", pill="ENTRE DUAS CIDADES", pre="Toda quinta,", titulo=["na estrada"], marca="211",
             frases=["Moro em Maceió", "e toda quinta pego a estrada", "até União dos Palmares."]),
        dict(tipo="tipo", pill="211 ANOS", pre="Obrigada por ser", titulo=["casa"], marca="211",
             frases=["Parabéns, Maceió.", "Que venham muitos anos", "de mar, sol e sorrisos."]),
    ],
    "2026-12/08-dia-da-familia": [
        dict(tipo="foto", foto="2026-08-09_83710_5", tam="auto 1920px", pos="-380px 0", elipse=(56, 30, 60, 46), pill="POST NOVO",
             pre="Dia Nacional da", titulo=["Família"], frases=["A família que me", "ensinou a cuidar."], ic=(820, 1000)),
        dict(tipo="tipo", pill="DIA DA FAMÍLIA", pre="Na minha casa,", titulo=["cuidar"], marca="08",
             frases=["Cuidar de gente sempre foi", "assunto de mesa de jantar."]),
        dict(tipo="tipo", pill="MARCA AQUI", pre="Quem cuida de", titulo=["todo mundo?"], tammax=220, marca="08",
             frases=["Marca aquela pessoa da sua família", "que cuida de todo mundo", "e merece um carinho hoje."]),
    ],
    "2026-12/25-natal": [
        dict(tipo="foto", foto="2020-12-25_07558", tam="1080px auto", pos="0 230px", elipse=(48, 30, 66, 40), pill="FELIZ NATAL",
             pre="Feliz", titulo=["Natal"], frases=["Da minha família", "pra sua."], ic=(860, 330)),
        dict(tipo="tipo", pill="OBRIGADA", pre="Por este", titulo=["2026"], marca="25",
             frases=["Obrigada por cada quinta,", "cada conversa", "e cada sorriso confiado a mim."]),
        dict(tipo="tipo", pill="BOAS FESTAS", pre="Que o seu sorriso", titulo=["brilhe"], marca="25",
             frases=["Que o seu sorriso seja", "o mais bonito da mesa de Natal."]),
    ],
    "2026-12/31-reveillon": [
        dict(tipo="foto", foto="2026-07-27_11360", tam="auto 1920px", pos="-500px 0", elipse=(50, 30, 46, 46), pill="31 DE DEZEMBRO",
             pre="Feliz", titulo=["2027"], frases=["Que o novo ano venha leve", "e cheio de sorrisos."]),
        dict(tipo="tipo", pill="PROMESSA DE ANO NOVO", pre="Aquele dente que ficou", titulo=["pra depois"], tammax=220, marca="27",
             frases=["Que ele seja o primeiro", "cuidado de 2027.", "Me chama no direct."]),
        dict(tipo="tipo", pill="ATÉ 2027", pre="Nos vemos em", titulo=["janeiro"], marca="27",
             frases=["Obrigada por este ano.", "Feliz Ano-Novo!"]),
    ],
}

if __name__ == "__main__":
    so = set(sys.argv[1:])
    for slug, lista in STORIES.items():
        if so and slug not in so:
            continue
        for i, s in enumerate(lista, 1):
            s["chave"] = f"{slug.replace('/', '_')}-story{i}"
            html = story_foto(s) if s["tipo"] == "foto" else story_tipo(s)
            render(html, f"{POSTS}/{slug}", f"story-{i:02d}", 1920)
