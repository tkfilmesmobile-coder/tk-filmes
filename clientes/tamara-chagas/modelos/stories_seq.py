"""Sequência livre de stories nos 3 formatos aprovados (card, notas, conversa), em qualquer ordem e quantidade.
uso: python modelos/stories_seq.py <pasta>   (lê <pasta>/sequencia.json, grava <pasta>/stories/NN-tipo.png/.jpg)
sequencia.json: {"data": "...", "fonte": "...", "itens": [
   {"tipo": "card", "selo": "vídeo novo no perfil 🎬", "card": "..."},
   {"tipo": "notas", "hora": "10:01", "titulo": "...", "linhas": [...], "marca": "..."},
   {"tipo": "conversa", "conversa": [["in", "...", "10:02"], ...]} ]}
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import stories_trio as T

def main():
    pasta = pathlib.Path(sys.argv[1]).resolve()
    s = json.loads((pasta / "sequencia.json").read_text(encoding="utf-8-sig"))
    out = pasta / "stories"; out.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        for i, it in enumerate(s["itens"], 1):
            c = {"data": s["data"], "fonte": s["fonte"]}
            if it["tipo"] == "card":
                c.update(card=it["card"], selo=it.get("selo", "post novo no feed 📌")); corpo = T.card(c)
            elif it["tipo"] == "notas":
                c["notas"] = it; corpo = T.notas(c)
            else:
                c["conversa"] = it["conversa"]; corpo = T.conversa(c)
            nome = f"{i:02d}-{it['tipo']}"
            h = out / f"{nome}.html"
            h.write_text(f'<!doctype html><html><head><meta charset="utf-8">{T.F}<style>{T.BASE}</style></head><body>{corpo}</body></html>', encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.goto(h.as_uri())
            pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            png = out / f"{nome}.png"; pg.screenshot(path=str(png)); pg.close()
            Image.open(png).convert("RGB").save(out / f"{nome}.jpg", quality=92)
        b.close()
    print("ok", out)

if __name__ == "__main__":
    main()
