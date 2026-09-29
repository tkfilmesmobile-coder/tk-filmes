"""Stories com cara de feitos no próprio Instagram (orgânico), 1080x1920.

uso: python modelos/stories_organico.py <pasta-de-saida> <conteudo.json>
Cada story: {"id", "fundo": "#cor" ou "foto:<arquivo em marca/fotos>", "escurecer": 0-1,
             "blocos": [ {"t": "texto", "estilo": "caixa|caixa-escura|solto|pequeno|fonte", "tam": px, "giro": graus} | {"espaco": px} ],
             "alinhar": "center|left", "topo": px}
Estilos imitam o texto do app: caixa = fundo branco com letra preta (o "destaque" do Instagram).
"""
import json, sys, pathlib, html
from playwright.sync_api import sync_playwright

FOTOS = (pathlib.Path(__file__).resolve().parent.parent / "marca" / "fotos").as_uri()

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden}
.s{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:'Inter',sans-serif}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.veu{position:absolute;inset:0;background:#000}
.conteudo{position:absolute;left:90px;right:90px;display:flex;flex-direction:column;gap:26px}
.b{line-height:1.42;font-weight:600;letter-spacing:-.005em}
.b span{padding:6px 18px;border-radius:12px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.caixa span{background:#fff;color:#111}
.caixa-escura span{background:rgba(0,0,0,.72);color:#fff}
.solto{color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.25)}
.solto.escuro{color:#1c1a18;text-shadow:none}
.pequeno{font-weight:500;opacity:.92}
.fonte{font-family:'Courier Prime',monospace;font-weight:400;font-size:28px;opacity:.9}
"""

def story(s):
    fundo = s.get("fundo", "#1c1c1c")
    partes = ['<div class="s">']
    if fundo.startswith("foto:"):
        # zoom + origem = recorte fechado de celular; filtro "celular" = tom levemente quente, menos cara de estúdio
        zoom = s.get("zoom", 1)
        filtro = "saturate(1.06) contrast(.95) brightness(1.03) sepia(.08)" if s.get("celular") else "none"
        partes.append(f'<img class="bg" style="object-position:{s.get("posicao","50% 50%")};transform:scale({zoom});'
                      f'transform-origin:{s.get("origem","50% 30%")};filter:{filtro}" src="{FOTOS}/{fundo[5:]}">')
        cor_texto_escura = False
    else:
        partes.append(f'<div class="bg" style="background:{fundo}"></div>')
        cor_texto_escura = s.get("texto_escuro", False)
    if s.get("escurecer"):
        partes.append(f'<div class="veu" style="opacity:{s["escurecer"]}"></div>')
    alinhar = s.get("alinhar", "center")
    partes.append(f'<div class="conteudo" style="top:{s.get("topo", 330)}px;align-items:{"center" if alinhar=="center" else "flex-start"};text-align:{alinhar}">')
    for b in s["blocos"]:
        if "espaco" in b:
            partes.append(f'<div style="height:{b["espaco"]}px"></div>'); continue
        estilo = b.get("estilo", "caixa")
        classes = "b " + estilo + (" escuro" if estilo in ("solto", "pequeno", "fonte") and cor_texto_escura else "")
        if estilo in ("pequeno", "fonte"):
            classes += " solto"
        tam = b.get("tam", 50)
        giro = b.get("giro", 0)
        texto = b["t"]  # aceita <b>
        inner = f"<span>{texto}</span>" if estilo.startswith("caixa") else texto
        partes.append(f'<div class="{classes}" style="font-size:{tam}px;transform:rotate({giro}deg);max-width:900px">{inner}</div>')
    partes.append("</div></div>")
    return ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
            '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Courier+Prime&display=swap" rel="stylesheet">'
            f'<style>{CSS}</style></head><body>{"".join(partes)}</body></html>')

def main():
    saida = pathlib.Path(sys.argv[1]).resolve(); saida.mkdir(parents=True, exist_ok=True)
    itens = json.loads(pathlib.Path(sys.argv[2]).read_text(encoding="utf8"))
    with sync_playwright() as p:
        b = p.chromium.launch()
        for s in itens:
            h = saida / f'{s["id"]}.html'
            h.write_text(story(s), encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920})
            pg.goto(h.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            pg.screenshot(path=str(saida / f'{s["id"]}.png')); pg.close()
            print("ok", s["id"])
        b.close()

if __name__ == "__main__":
    main()
