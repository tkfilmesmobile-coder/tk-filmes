"""Stories da TK Filmes (1080x1920), linha editorial (2026-10-10).

Estética: paleta bege/taupe/oliva com caramelo de destaque; rótulos em caixa alta fina e espaçada nos cantos;
títulos em fonte arredondada, limpa e sóbria (Nunito), sem itálico; texto centralizado; círculos numerados;
rodapé "salva isso". Fotos entram com grade suave (menos saturação, véu bege). Zonas seguras do Instagram
respeitadas (250 px em cima, 320 px embaixo).

uso:
    from stories import capa, cartao, lista, render
    render([capa(foto, "rótulo", "Título", "texto"), lista("rótulo", "Título", ["a", "b", "c"])], "nome", pasta)
[[ ]] marca o destaque em caramelo. <br> controla a quebra de linha.
"""
import re, pathlib
from playwright.sync_api import sync_playwright

AQUI = pathlib.Path(__file__).resolve().parent
U = lambda p: pathlib.Path(p).as_uri()
FONTES = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Montserrat:wght@300;400;500&display=swap"

BEGE, CARTAO, TINTA, OLIVA, TAUPE, CARAMELO = "#E6DFD3", "#F2EDE5", "#3A332C", "#7A8066", "#B8A99A", "#B07A52"

CSS = f"""
*{{margin:0;padding:0;box-sizing:border-box}} html,body{{width:1080px;height:1920px;overflow:hidden}}
.s{{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:'Nunito',sans-serif;color:{TINTA};
  background:{BEGE};-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}}
.foto{{position:absolute;inset:0;background-size:cover;background-position:center;
  filter:saturate(.5) contrast(.82) brightness(1.25)}}
.veu{{position:absolute;inset:0;background:linear-gradient(180deg,rgba(58,51,44,.30) 0%,rgba(58,51,44,.08) 30%,rgba(230,223,211,0) 42%,rgba(230,223,211,.97) 58%,{BEGE} 100%)}}
.veu-escuro{{position:absolute;inset:0;background:linear-gradient(180deg,rgba(184,169,154,.18),rgba(58,51,44,.42))}}
.papel{{position:absolute;inset:0;background:url('{U(AQUI/"papel-claro.jpg")}');background-size:cover;opacity:.55;mix-blend-mode:multiply}}
.rot{{position:absolute;font-family:'Montserrat',sans-serif;font-weight:400;font-size:19px;letter-spacing:.38em;
  text-transform:uppercase;z-index:5;font-size:16px;opacity:.6}}
.rot.cl{{color:{CARTAO};opacity:.9}} .rot.es{{color:{TINTA};opacity:.72}}
.te{{top:250px;left:72px}} .td{{top:250px;right:72px;text-align:right}}
.be{{bottom:330px;left:72px}} .bd{{bottom:330px;right:72px;text-align:right}}
.c{{color:{CARAMELO}}}
.titulo{{font-weight:500;font-size:84px;line-height:1.18;letter-spacing:-.008em;text-align:center}}
.texto{{font-weight:400;font-size:32px;line-height:1.5;text-align:center;opacity:.85}}
.tag{{font-family:'Montserrat',sans-serif;font-weight:300;font-size:17px;letter-spacing:.4em;text-transform:uppercase;
  text-align:center;color:{OLIVA}}}
.fio{{width:72px;height:1px;background:{OLIVA};opacity:.6;margin:34px auto}}
.circ{{width:72px;height:72px;border-radius:50%;border:1.6px solid {OLIVA};display:flex;align-items:center;
  justify-content:center;font-family:'Montserrat',sans-serif;font-weight:400;font-size:22px;letter-spacing:.1em;color:{OLIVA};flex:none}}
.rodape{{position:absolute;left:0;right:0;bottom:380px;text-align:center;font-family:'Montserrat',sans-serif;
  font-weight:300;font-size:17px;letter-spacing:.4em;text-transform:uppercase;color:{OLIVA};z-index:5}}
"""

def _d(t):
    return re.sub(r"\[\[(.+?)\]\]", r'<span class="c">\1</span>', t)

def _rotulos(claro, esq="TK Filmes", dir="@tk.filmes", besq="", bdir=""):
    k = "cl" if claro else "es"
    h = f'<div class="rot {k} te">{esq}</div><div class="rot {k} td">{dir}</div>'
    if besq: h += f'<div class="rot {k} be">{besq}</div>'
    if bdir: h += f'<div class="rot {k} bd">{bdir}</div>'
    return h

def _pagina(corpo, extra=""):
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><link href="{FONTES}" rel="stylesheet">'
            f"<style>{CSS}{extra}</style></head><body>{corpo}</body></html>")

def capa(foto, tag, titulo, texto="", pos="center 30%", rodape="", tam=72):
    """Foto em cima, véu bege subindo, título e texto embaixo. O formato de abertura."""
    extra = f""".bloco{{position:absolute;left:84px;right:84px;bottom:440px;text-align:center;z-index:4}}
.bloco .tag{{color:{TINTA};opacity:.75}} .titulo{{font-size:{tam}px}}"""
    corpo = f'''<div class="s"><div class="foto" style="background-image:url('{U(foto)}');background-position:{pos}"></div>
<div class="veu"></div>{_rotulos(True)}
<div class="bloco"><div class="tag">{tag}</div><div class="fio"></div><div class="titulo">{_d(titulo)}</div>
{f'<div class="texto" style="margin-top:36px">{_d(texto)}</div>' if texto else ''}</div>
{f'<div class="rodape">{rodape}</div>' if rodape else ''}</div>'''
    return _pagina(corpo, extra)

def cartao(foto, tag, titulo, texto="", pos="center", rodape="", tam=76, topo=None):
    """Foto escurecida ao fundo e um cartão bege arredondado no meio com o conteúdo."""
    extra = f""".card{{position:absolute;left:84px;right:84px;{'top:'+str(topo)+'px' if topo else 'top:50%;transform:translateY(-50%)'};background:{CARTAO};
  border-radius:40px;padding:96px 76px;text-align:center;z-index:4;box-shadow:0 30px 80px rgba(20,14,10,.25)}}
.titulo{{font-size:{tam}px}}"""
    corpo = f'''<div class="s"><div class="foto" style="background-image:url('{U(foto)}');background-position:{pos}"></div>
<div class="veu-escuro"></div>{_rotulos(True)}
<div class="card"><div class="tag">{tag}</div><div class="fio"></div><div class="titulo">{_d(titulo)}</div>
{f'<div class="texto" style="margin-top:36px">{_d(texto)}</div>' if texto else ''}</div>
{f'<div class="rodape" style="color:{CARTAO}">{rodape}</div>' if rodape else ''}</div>'''
    return _pagina(corpo, extra)

def sobre(foto, tag, titulo, texto="", pos="center", rodape="", tam=68, topo=None):
    """Texto claro direto sobre a foto escurecida, sem cartão. topo em px; sem topo, centraliza."""
    extra = f""".bloco{{position:absolute;left:84px;right:84px;{'top:'+str(topo)+'px' if topo else 'top:50%;transform:translateY(-50%)'};
  text-align:center;z-index:4;color:{CARTAO}}}
.bloco .tag{{color:{CARTAO};opacity:.8}} .bloco .fio{{background:{CARTAO}}} .titulo{{font-size:{tam}px;text-shadow:0 1px 10px rgba(20,14,10,.25)}}
.texto{{text-shadow:0 1px 8px rgba(20,14,10,.3)}}"""
    corpo = f'''<div class="s"><div class="foto" style="background-image:url('{U(foto)}');background-position:{pos}"></div>
<div class="veu-escuro"></div>{_rotulos(True)}
<div class="bloco"><div class="tag">{tag}</div><div class="fio"></div><div class="titulo">{_d(titulo)}</div>
{f'<div class="texto" style="margin-top:36px">{_d(texto)}</div>' if texto else ''}</div>
{f'<div class="rodape" style="color:{CARTAO}">{rodape}</div>' if rodape else ''}</div>'''
    return _pagina(corpo, extra)

def leve(foto, tag, titulo, texto="", pos="center", rodape="", tam=54, topo=None, itens=None):
    """Foto inteira, véu mínimo, tipografia fina e pequena. Texto fica onde a foto tem ar (topo em px)."""
    extra = f""".foto{{filter:saturate(.7) contrast(.95) brightness(1.0)}}
.vm{{position:absolute;inset:0;background:rgba(40,34,28,.16)}}
.bloco{{position:absolute;left:96px;right:96px;{'top:'+str(topo)+'px' if topo else 'top:50%;transform:translateY(-50%)'};text-align:center;z-index:4;color:{CARTAO}}}
.bloco::before{{content:'';position:absolute;left:-160px;right:-160px;top:-140px;bottom:-140px;background:radial-gradient(ellipse at center,rgba(30,25,20,.55),rgba(30,25,20,0) 68%);z-index:-1;filter:blur(10px)}}
.bloco .tag{{color:{CARTAO};opacity:.75;font-size:15px}} .bloco .fio{{background:{CARTAO};width:48px;margin:26px auto}}
.titulo{{font-size:{tam}px;font-weight:400;line-height:1.28;text-shadow:0 1px 14px rgba(20,14,10,.35)}}
.texto{{font-size:27px;line-height:1.6;opacity:.9;text-shadow:0 1px 10px rgba(20,14,10,.35)}}
.item{{display:flex;align-items:center;gap:26px;margin:0 0 26px;text-align:left}}
.item .texto{{text-align:left;font-size:27px;line-height:1.5}}
.circ{{width:56px;height:56px;border-color:{CARTAO};color:{CARTAO};font-size:18px;opacity:.85}}
.rodape{{color:{CARTAO};font-size:15px;opacity:.75;bottom:340px}}"""
    its = "".join(f'<div class="item"><div class="circ">{i:02d}</div><div class="texto">{_d(t)}</div></div>' for i, t in enumerate(itens or [], 1))
    corpo = f'''<div class="s"><div class="foto" style="background-image:url('{U(foto)}');background-position:{pos}"></div>
<div class="vm"></div>{_rotulos(True)}
<div class="bloco"><div class="tag">{tag}</div><div class="fio"></div><div class="titulo">{_d(titulo)}</div>
{f'<div class="texto" style="margin-top:28px">{_d(texto)}</div>' if texto else ''}{f'<div style="margin-top:44px">{its}</div>' if its else ''}
{f'<div class="rodape" style="position:static;margin-top:30px">{rodape}</div>' if rodape and its else ''}</div>
{f'<div class="rodape">{rodape}</div>' if rodape and not its else ''}</div>'''
    return _pagina(corpo, extra)

def lista(tag, titulo, itens, rodape="salva isso", tam=60, foto=None, pos="center", escuro=False, claro=False):
    """Fundo bege (ou foto bem velada), título e itens numerados em círculos. Lista de ensino."""
    extra = f""".bloco{{position:absolute;left:84px;right:84px;top:50%;transform:translateY(-50%);z-index:4}}
.titulo{{font-size:{tam}px;margin-bottom:56px}}
.item{{display:flex;align-items:center;gap:32px;margin:0 0 40px;text-align:left}}
.item .texto{{text-align:left;font-size:31px;line-height:1.45}}
.fv{{position:absolute;inset:0;background:rgba(230,223,211,.93)}}
{f".fv{{background:linear-gradient(180deg,rgba(184,169,154,.2),rgba(58,51,44,.5))}} .bloco{{color:{CARTAO}}} .bloco .tag{{color:{CARTAO};opacity:.8}} .bloco .fio{{background:{CARTAO}}} .circ{{border-color:{CARTAO};color:{CARTAO};opacity:.85}} .rodape{{color:{CARTAO}}} .papel{{display:none}}" if escuro else ""}"""
    if claro:  # foto em cima, véu bege subindo, lista embaixo (mesmo desenho da capa)
        extra += f".fv{{background:linear-gradient(180deg,rgba(58,51,44,.30) 0%,rgba(58,51,44,.08) 18%,rgba(230,223,211,0) 28%,rgba(230,223,211,.97) 42%,{BEGE} 100%)}} .bloco{{top:auto;transform:none;bottom:430px}} .bloco .tag{{color:{TINTA};opacity:.7}} .papel{{display:none}}"
    fundo = f'''<div class="foto" style="background-image:url('{U(foto)}');background-position:{pos}"></div><div class="fv"></div>''' if foto else ''
    its = "".join(f'<div class="item"><div class="circ">{i:02d}</div><div class="texto">{_d(t)}</div></div>' for i, t in enumerate(itens, 1))
    corpo = f'''<div class="s">{fundo}<div class="papel"></div>{_rotulos(False)}
<div class="bloco"><div class="tag">{tag}</div><div class="fio"></div><div class="titulo">{_d(titulo)}</div>{its}</div>
{f'<div class="rodape">{rodape}</div>' if rodape else ''}</div>'''
    return _pagina(corpo, extra)

def render(paginas, nome, pasta):
    pasta = pathlib.Path(pasta); pasta.mkdir(parents=True, exist_ok=True)
    saidas = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1920})
        for i, h in enumerate(paginas, 1):
            base = nome if len(paginas) == 1 else f"{nome}-{i:02d}"
            f = pasta / f"{base}.html"; f.write_text(h, encoding="utf-8")
            pg.goto(f.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(500)
            o = pasta / f"{base}.png"; pg.screenshot(path=str(o)); f.unlink(); saidas.append(o)
        b.close()
    return saidas
