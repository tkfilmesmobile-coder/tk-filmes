import sys, pathlib
from playwright.sync_api import sync_playwright
# uso: python render.py <entrada.html> <saida.png> [altura]   (1350 = feed, 1920 = stories)
src = pathlib.Path(sys.argv[1]).resolve()
out = sys.argv[2]
altura = int(sys.argv[3]) if len(sys.argv) > 3 else 1350
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": altura})
    pg.goto(src.as_uri())
    pg.wait_for_load_state("networkidle")
    pg.evaluate("document.fonts.ready")
    pg.screenshot(path=out)
    b.close()
print("ok", out)
