"""Seg 12/10 (tweet satírico do Dia das Crianças) e ter 13/10 (carrossel: parabéns União + feriados que entram ou não)."""
import sys, pathlib
AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parents[1] / "modelos"))
from pecas import tweet, frase, render, _pagina, _moldura, _dest, AQUI as MOD, U

S = lambda t: f'<span style="display:block;font-size:.5em;line-height:1.35;margin-top:.5em;opacity:.85">{t}</span>'

render([tweet(["Feliz Dia das Crianças! 🎈",
               "Em homenagem a todo mundo que promete postar “semana que vem” com a mesma firmeza de criança prometendo arrumar o quarto. 🤡"])],
       "2026-10-12-tweet-dia-das-criancas", AQUI)

def capa_escura(num=1):
    """Capa do carrossel: papel escuro, o número 195 enorme em caramelo, a cidade em caixa alta fina e a linha irônica."""
    cab, rod = _moldura(num)
    extra = f"""
.s{{background:url('{U(MOD/"papel-escuro.jpg")}');color:#F4EBE1}} .sh{{opacity:.35}}
.cab,.rod{{color:#F4EBE1;opacity:.8}}
.t{{position:absolute;left:80px;right:80px;top:50%;transform:translateY(-50%);text-align:center;z-index:3}}
.n{{font-size:420px;line-height:.9;color:#CD9365;letter-spacing:-.04em}}
.cid{{font-size:22px;line-height:1.9;letter-spacing:.42em;text-transform:uppercase;font-weight:500;opacity:.85;margin-top:26px}}
.par{{font-size:64px;line-height:1.08;margin-top:54px}}
.iro{{font-size:30px;line-height:1.3;margin-top:44px;color:#CD9365;opacity:.95}}
.fio2{{width:72px;height:1px;background:#CD9365;margin:40px auto 0;opacity:.7}}"""
    corpo = f"""<div class="s"><div class="sh"></div>{cab}
<div class="t"><div class="n serif">195</div><div class="cid">anos de União dos Palmares<br>13 de outubro</div>
<div class="par serif">Parabéns, minha cidade.</div><div class="fio2"></div>
<div class="iro">Mas calma: não precisa postar em todo feriado.</div></div>{rod}</div>"""
    return _pagina(corpo, extra)

def pagina_escura(rotulo, titulo, sub="", num=2, tam=84):
    """Páginas internas no mesmo papel escuro da capa: rótulo em caixa alta fina, título serif creme com destaque caramelo, linha de apoio menor."""
    cab, rod = _moldura(num)
    extra = f"""
.s{{background:url('{U(MOD/"papel-escuro.jpg")}');color:#F4EBE1}} .sh{{opacity:.35}}
.cab,.rod{{color:#F4EBE1;opacity:.8}} .rot{{color:#F4EBE1}}
.t{{position:absolute;left:80px;right:80px;top:50%;transform:translateY(-52%);text-align:center;z-index:3}}
.t .rot{{margin-bottom:52px}} .t h2{{font-size:{tam}px;line-height:1.04;font-weight:400}}
.c{{color:#CD9365}} .el::before{{border-color:#CD9365}}
.sub{{font-size:30px;line-height:1.4;margin-top:48px;opacity:.85;font-weight:400}}
.ass{{margin-top:72px;color:#F4EBE1}}"""
    corpo = f"""<div class="s"><div class="sh"></div>{cab}
<div class="t"><div class="rot">{rotulo}</div><h2 class="serif">{_dest(titulo)}</h2>{f'<div class="sub">{_dest(sub, elipse=False)}</div>' if sub else ''}<div class="ass">Talyta Kumy</div></div>{rod}</div>"""
    return _pagina(corpo, extra)

paginas = [
    capa_escura(1),
    pagina_escura("Gente, calma", "Antes de postar qualquer data,<br>me responde uma coisa:<br>[[o seu cliente liga pra isso?]]", num=2),
    pagina_escura("Entra, sim", "O dia da sua profissão.<br>O aniversário da sua cidade.<br>A data que o seu cliente vive.",
                  sub="Dia do Médico, 18/10 · Dia do Cirurgião-Dentista, 25/10 · Dia do Advogado, 11/08 · e hoje, aqui em União.", num=3, tam=78),
    pagina_escura("Agora", "Dentista postando Halloween.<br>Advogado no Dia do Nutricionista.<br>[[Pois é. Não entra.]]",
                  sub="Ninguém entende por quê. Nem você, se parar pra pensar.", num=4, tam=78),
    pagina_escura("Olha", "Postou porque todo mundo postou?<br>Isso tem até nome:<br>[[post sem intenção.]]", num=5),
    pagina_escura("Mas entenda uma coisa", "Feriado é pra descansar.<br>Post é pra quem tem<br>[[o que dizer.]]",
                  sub="Salva pra lembrar na próxima data.", num=6),
]
print(*render(paginas, "2026-10-13-carrossel-feriados", AQUI), sep=" ")
