"""Stories de b-roll com escrita elegante (pedido da Talyta, 21/10/2026: sem emoji de carinha, estética mais elegante).
Foto em tela cheia, degradê suave, título pequeno espaçado em champanhe, frase em Inter fina com uma palavra forte,
filete fino e assinatura discreta. Sem caixas de texto e sem emoji.

uso: python modelos/stories_elegante.py <pasta-de-saida> <conteudo.json>
conteudo.json: [{"id": "01-bom-dia", "foto": "b-roll/estrutura-01-vaso.jpg", "kicker": "QUARTA-FEIRA",
                 "texto": "Bom dia. Mais um dia de <b>trabalho</b> por aqui.", "pos": "baixo|meio|alto", "posicao": "50% 50%"}]
Grava <id>.png e <id>.jpg (1080x1920).
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

FOTOS = (pathlib.Path(__file__).resolve().parent.parent / "marca" / "fotos").as_uri()
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;600;700&display=swap" rel="stylesheet">'
CSS = """*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;font-family:'Inter',sans-serif}
.s{position:relative;width:1080px;height:1920px;overflow:hidden;background:#141414}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.92) contrast(.97) brightness(1.02)}
.veu{position:absolute;inset:0}
.txt{position:absolute;left:96px;right:96px}
.k{display:flex;align-items:center;gap:18px;font-size:24px;letter-spacing:.34em;font-weight:600;color:#E6D3B8}
.k i{display:block;width:56px;height:2px;background:#E6D3B8}
.t{margin-top:30px;font-size:66px;line-height:1.16;font-weight:200;letter-spacing:-.025em;color:#fff}
.t b{font-weight:700}
.sub{margin-top:34px;font-size:38px;line-height:1.42;font-weight:300;color:rgba(255,255,255,.92)}.sub b{font-weight:600}
.f{margin-top:28px;font-size:22px;letter-spacing:.06em;color:rgba(255,255,255,.7);font-weight:300}
.ass{position:absolute;left:96px;bottom:150px;font-size:20px;letter-spacing:.32em;font-weight:600;color:rgba(255,255,255,.78)}
"""
VEUS = {
    "baixo": "linear-gradient(180deg,rgba(20,20,20,0) 38%,rgba(20,20,20,.55) 68%,rgba(20,20,20,.82) 100%)",
    "meio": "linear-gradient(180deg,rgba(20,20,20,.15) 0%,rgba(20,20,20,.55) 45%,rgba(20,20,20,.55) 60%,rgba(20,20,20,.2) 100%)",
    "alto": "linear-gradient(180deg,rgba(20,20,20,.8) 0%,rgba(20,20,20,.5) 34%,rgba(20,20,20,0) 62%)",
}
TOPO = {"baixo": "bottom:250px", "meio": "top:780px", "alto": "top:300px"}


def html(s):
    pos = s.get("pos", "baixo")
    return (f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{CSS}</style></head><body><div class="s">'
            f'<img class="bg" style="object-position:{s.get("posicao", "50% 50%")}" src="{FOTOS}/{s["foto"]}">'
            f'<div class="veu" style="background:{VEUS[pos]}"></div>'
            f'<div class="txt" style="{TOPO[pos]}"><div class="k"><i></i>{s.get("kicker", "")}</div>'
            f'<div class="t" style="font-size:{s.get("tam", 66)}px">{s["texto"]}</div>'
            + (f'<div class="sub">{s["sub"]}</div>' if s.get("sub") else '')
            + (f'<div class="f">Fonte: {s["fonte"]}</div>' if s.get("fonte") else '') + '</div>'
            f'<div class="ass">TAMARA CHAGAS ADVOCACIA</div></div></body></html>')


def main():
    saida = pathlib.Path(sys.argv[1]).resolve(); saida.mkdir(parents=True, exist_ok=True)
    itens = json.loads(pathlib.Path(sys.argv[2]).read_text(encoding="utf-8"))
    with sync_playwright() as p:
        b = p.chromium.launch()
        for s in itens:
            arq = saida / f'{s["id"]}.html'; arq.write_text(html(s), encoding="utf-8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.goto(arq.as_uri()); pg.wait_for_timeout(900)
            png = saida / f'{s["id"]}.png'; pg.screenshot(path=str(png)); pg.close()
            Image.open(png).convert("RGB").save(saida / f'{s["id"]}.jpg', quality=93)
            print("ok", s["id"])
        b.close()


if __name__ == "__main__":
    main()
