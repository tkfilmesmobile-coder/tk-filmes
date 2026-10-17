"""Peças de feed da TK Filmes (imagem única, 1080x1350). Formatos: frase, tweet, conversa e bastidor.

Linha visual aprovada em 2026-09-29 (versão "B"): papel claro com luz de folhagem entrando pelo canto,
Instrument Serif centralizada, destaque só pela cor caramelo com elipse fina em volta, rótulo pequeno em
caixa alta, moldura com fios finos (Talyta Kumy · Nº / Direção de conteúdo · @tk.filmes).
Regras: sem itálico, sem caixa alta no destaque, sem carrossel. Fotos só de `tk-filmes/fotos/` (ver `_uso.md`).

uso:
    from pecas import frase, tweet, conversa, bastidor, render
    render([frase("Seu cliente visita o seu<br>Instagram antes de<br>[[visitar você.]]",
                  rotulo="Uma verdade sobre presença", num=1)], "2026-10-21-frase", pasta)
[[ ]] marca o destaque. <br> controla a quebra de linha (sempre quebrar à mão, pensando no desenho).
Rodando direto (python pecas.py) gera as amostras em tk-filmes/posts/amostras/.
"""
import re, pathlib
from playwright.sync_api import sync_playwright

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
FOTOS = RAIZ / "tk-filmes" / "fotos"
POSTS = RAIZ / "tk-filmes" / "posts"
U = lambda p: pathlib.Path(p).as_uri()
FONTES = "https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Montserrat:wght@400;500;600&display=swap"

CSS = f"""
*{{margin:0;padding:0;box-sizing:border-box}} html,body{{width:1080px;height:1350px;overflow:hidden}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:'Montserrat',sans-serif;color:#3E2A22;
  background:url('{U(AQUI/"papel-claro.jpg")}');-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}}
.sh{{position:absolute;inset:0;background:url('{U(AQUI/"sombra-folhas.png")}');z-index:6;pointer-events:none}}
.serif{{font-family:'Instrument Serif',serif;font-weight:400;font-style:normal;letter-spacing:-.018em;font-kerning:normal}}
.c{{color:#B07A52}}
.el{{position:relative;display:inline-block;padding:0 26px}}
.el::before{{content:'';position:absolute;left:-10px;right:-10px;top:12%;bottom:-6%;border:1.2px solid #B07A52;
  border-radius:50%;transform:rotate(-4deg);opacity:.6}}
.cab,.rod{{position:absolute;left:96px;right:96px;display:flex;justify-content:space-between;align-items:center;
  font-size:13px;letter-spacing:.32em;text-transform:uppercase;font-weight:500;opacity:.72;z-index:5}}
.cab{{top:84px}} .rod{{bottom:84px}}
.fio{{height:1px;background:currentColor;opacity:.35;flex:1;margin:0 28px}}
.rot{{font-size:14px;letter-spacing:.34em;text-transform:uppercase;font-weight:500;opacity:.7}}
.ass{{font-size:14px;letter-spacing:.34em;text-transform:uppercase;font-weight:500;opacity:.75}}
"""

def _dest(t, elipse=True):
    alvo = r'<span class="el"><span class="c">\1</span></span>' if elipse else r'<span class="c">\1</span>'
    return re.sub(r"\[\[(.+?)\]\]", alvo, t)

def _moldura(num):
    cab = f'<div class="cab"><span>Talyta Kumy</span><span class="fio"></span><span>Nº {num:02d}</span></div>'
    rod = '<div class="rod"><span>Direção de conteúdo</span><span class="fio"></span><span>@tk.filmes</span></div>'
    return cab, rod

def _pagina(corpo, extra=""):
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><link href="{FONTES}" rel="stylesheet">'
            f"<style>{CSS}{extra}</style></head><body>{corpo}</body></html>")

def frase(texto, rotulo="", num=1, tam=108, assinatura="Talyta Kumy"):
    """Frase centralizada. O formato-mãe da linha visual."""
    cab, rod = _moldura(num)
    extra = f"""
.t{{position:absolute;left:80px;right:80px;top:50%;transform:translateY(-52%);text-align:center;z-index:3}}
.t .rot{{margin-bottom:56px}} .t h2{{font-size:{tam}px;line-height:1.02}} .t .ass{{margin-top:78px}}"""
    rot = f'<div class="rot">{rotulo}</div>' if rotulo else ""
    corpo = f"""<div class="s"><div class="sh"></div>{cab}
<div class="t">{rot}<h2 class="serif">{_dest(texto)}</h2><div class="ass">{assinatura}</div></div>{rod}</div>"""
    return _pagina(corpo, extra)

def conversa(msgs, num=1, rotulo="", avatar="acao-gravando-celular.jpg"):
    """Print estilizado de conversa (código do WhatsApp, sem imitar o app). `msgs` = lista de (quem, texto, hora),
    quem = "cliente" ou "eu". Emoji: <span class="emo">😅</span>. O cliente nunca é alvo da piada."""
    cab, rod = _moldura(num)
    extra = """
.t{position:absolute;left:130px;right:130px;top:50%;transform:translateY(-50%);z-index:3}
.t .rot{text-align:center;margin-bottom:46px}
.bar{display:flex;align-items:center;gap:18px;padding-bottom:26px;margin-bottom:34px;border-bottom:1px solid rgba(176,122,82,.35)}
.bar img{width:66px;height:66px;border-radius:50%;object-fit:cover;object-position:50% 20%}
.bar .n{font-weight:600;font-size:24px} .bar .o{font-size:18px;opacity:.6;margin-top:2px}
.m{max-width:80%;padding:22px 28px 16px;border-radius:26px;font-size:31px;line-height:1.36;margin-bottom:18px;position:relative}
.m .h{display:block;text-align:right;font-size:15px;opacity:.5;margin-top:8px;letter-spacing:.04em}
.cliente{background:#FFFDFB;border:1px solid rgba(176,122,82,.18);border-bottom-left-radius:8px}
.eu{background:#E8D5C3;margin-left:auto;border-bottom-right-radius:8px}
.emo{font-family:'Segoe UI Emoji','Apple Color Emoji',sans-serif}
.eu .c{color:#8A5534;font-weight:600}
.tw-emo{height:1.05em;width:1.05em;vertical-align:-.16em;margin:0 .04em}"""
    bolhas = "".join(f'<div class="m {q}">{_twemoji(_dest(t, elipse=False))}<span class="h">{h}</span></div>' for q, t, h in msgs)
    rot = f'<div class="rot">{rotulo}</div>' if rotulo else ""
    corpo = f"""<div class="s">{cab}
<div class="t">{rot}<div class="bar"><img src="{U(FOTOS/avatar)}"><div><div class="n">Talyta Kumy</div><div class="o">direção de conteúdo</div></div></div>
{bolhas}</div>{rod}</div>"""
    return _pagina(corpo, extra)

def bastidor(titulo, principal, detalhes, rotulo="Bastidor", num=1, legendas=None, pos="50% 30%", tam=84):
    """Folha de contato de filmmaker: 1 foto principal + 2 detalhes, com numeração de quadro. Prova do trabalho.
    `detalhes` = [arquivo, arquivo]. `legendas` = 3 textos curtos (ex.: "roteiro", "luz", "REC")."""
    cab, rod = _moldura(num)
    leg = legendas or ["", "", ""]
    extra = f"""
.grade{{position:absolute;left:96px;right:96px;top:160px;height:700px;display:grid;grid-template-columns:1.45fr 1fr;
  grid-template-rows:1fr 1fr;gap:18px;z-index:2}}
.q{{position:relative;overflow:hidden;border-radius:4px;box-shadow:0 18px 40px rgba(62,42,34,.10)}}
.q img{{width:100%;height:100%;object-fit:cover}}
.q.g{{grid-row:1 / span 2}} .q.g img{{object-position:{pos}}}
.q .fr{{position:absolute;left:14px;bottom:12px;font-size:13px;letter-spacing:.28em;color:#F7EEE6;font-weight:600;
  text-shadow:0 1px 6px rgba(0,0,0,.35);text-transform:uppercase}}
.t{{position:absolute;left:80px;right:80px;top:935px;text-align:center;z-index:3}}
.t .rot{{margin-bottom:30px}} .t h2{{font-size:{tam}px;line-height:1.04}}"""
    rot = f'<div class="rot">{rotulo}</div>' if rotulo else ""
    corpo = f"""<div class="s"><div class="sh"></div>{cab}
<div class="grade"><div class="q g"><img src="{U(FOTOS/principal)}"><span class="fr">01A · {leg[0]}</span></div>
<div class="q"><img src="{U(FOTOS/detalhes[0])}"><span class="fr">02A · {leg[1]}</span></div>
<div class="q"><img src="{U(FOTOS/detalhes[1])}"><span class="fr">03A · {leg[2]}</span></div></div>
<div class="t">{rot}<h2 class="serif">{_dest(titulo)}</h2></div>{rod}</div>"""
    return _pagina(corpo, extra)

_EMOJI = re.compile("[🌀-🫿☀-➿]️?")

def _twemoji(t):
    """Troca emoji pelo desenho do próprio Twitter (Twemoji), pra o print ficar fiel."""
    def img(m):
        cod = "-".join(f"{ord(c):x}" for c in m.group(0) if c != "️")
        return f'<img class="tw-emo" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/{cod}.svg">'
    t = re.sub(r" (?=[🌀-🫿☀-➿])", "&nbsp;", t)  # emoji nunca fica sozinho na linha
    return _EMOJI.sub(img, t)

def tweet(linhas, avatar="perfil-instagram.jpg", nome="Talyta Kumy", user="@tk.filmes", tam=52):
    """Print de tweet fiel ao formato que circula (ref. @xtrategi.mkt): fundo branco, foto de perfil real,
    nome, @ e texto. Sem moldura, sem sombra: o signo é a própria convenção do Twitter."""
    extra = f"""
.s.tw{{background:#fff;color:#0F1419;font-family:'Inter','Helvetica Neue',Arial,sans-serif}}
.tw .box{{position:absolute;left:96px;right:96px;top:50%;transform:translateY(-50%)}}
.tw .who{{display:flex;align-items:center;gap:22px}}
.tw .av{{width:104px;height:104px;border-radius:50%;object-fit:cover}}
.tw .nome{{font-weight:700;font-size:34px;letter-spacing:-.01em}} .tw .user{{font-size:30px;color:#536471;margin-top:2px}}
.tw .txt{{margin-top:40px;font-size:{tam}px;line-height:1.32;letter-spacing:-.012em;font-weight:400}}
.tw .txt p+p{{margin-top:{int(tam*0.9)}px}}
.tw .tw-emo{{height:1.05em;width:1.05em;vertical-align:-.16em;margin:0 .06em}}"""
    ps = "".join(f"<p>{_twemoji(l)}</p>" for l in linhas)
    corpo = f"""<div class="s tw"><div class="box"><div class="who"><img class="av" src="{U(FOTOS/avatar)}">
<div><div class="nome">{nome}</div><div class="user">{user}</div></div></div><div class="txt">{ps}</div></div></div>"""
    return _pagina(corpo.replace("<link", "<link"), extra).replace(
        "family=Montserrat", "family=Inter:wght@400;700&family=Montserrat")

def bastidor2(titulo, fotos, legendas, rotulo="Bastidor", num=1, pos=("50% 30%", "50% 50%"), tam=84):
    """Bastidor em duas fotos lado a lado, sem sombra por cima, legenda fina embaixo de cada uma."""
    cab, rod = _moldura(num)
    extra = f"""
.duo{{position:absolute;left:96px;right:96px;top:168px;display:grid;grid-template-columns:1.35fr 1fr;gap:22px;z-index:2}}
.duo .ph{{height:640px;overflow:hidden;border-radius:3px}}
.duo img{{width:100%;height:100%;object-fit:cover}}
.duo .lg{{margin-top:16px;font-size:13px;letter-spacing:.3em;text-transform:uppercase;font-weight:500;opacity:.7;display:flex;gap:14px;align-items:center}}
.duo .lg i{{width:34px;height:1px;background:#B07A52}}
.t{{position:absolute;left:80px;right:80px;top:935px;text-align:center;z-index:3}}
.t .rot{{margin-bottom:30px}} .t h2{{font-size:{tam}px;line-height:1.04}}"""
    cols = "".join(f'<div><div class="ph"><img src="{U(FOTOS/f)}" style="object-position:{p}"></div><div class="lg"><span>0{i+1}</span><i></i><span>{l}</span></div></div>'
                   for i, (f, l, p) in enumerate(zip(fotos, legendas, pos)))
    rot = f'<div class="rot">{rotulo}</div>' if rotulo else ""
    corpo = f"""<div class="s">{cab}<div class="duo">{cols}</div>
<div class="t">{rot}<h2 class="serif">{_dest(titulo)}</h2></div>{rod}</div>"""
    return _pagina(corpo, extra)

def render(paginas, nome, pasta=None):
    """Renderiza cada página em PNG: <pasta>/<nome>.png (ou -01, -02… se forem várias)."""
    pasta = pathlib.Path(pasta) if pasta else POSTS / "amostras"
    pasta.mkdir(parents=True, exist_ok=True)
    saidas = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1350})
        for i, h in enumerate(paginas, 1):
            base = nome if len(paginas) == 1 else f"{nome}-{i:02d}"
            f = pasta / f"{base}.html"; f.write_text(h, encoding="utf-8")
            pg.goto(f.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(400)
            o = pasta / f"{base}.png"; pg.screenshot(path=str(o)); f.unlink(); saidas.append(o)
        b.close()
    return saidas

if __name__ == "__main__":
    render([tweet(["Meu Instagram tá parado porque eu não tenho tempo.",
                   "Tempo pra assistir 3 horas de reels dos outros eu tenho. 🤡"])], "v8-tweet-1")
    render([tweet(["“Semana que vem eu começo a postar.”",
                   "— eu, há 3 anos 🤡"])], "v8-tweet-2")
    render([tweet(["“Não sei falar na câmera.”",
                   "Mas explica o próprio trabalho pro cliente todo santo dia, sem gaguejar. 🤔"])], "v8-tweet-3")
    print("ok")
