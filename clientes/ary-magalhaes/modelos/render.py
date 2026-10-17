import sys, pathlib
from playwright.sync_api import sync_playwright
# uso: python render.py <slides.html> [pasta de saída]
# Cada <section class="slide" id="sN"> vira sN.png (1080x1350; stories: 1080x1920).
src = pathlib.Path(sys.argv[1]).resolve()
out = pathlib.Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else src.parent
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.goto(src.as_uri())
    pg.wait_for_load_state("networkidle")
    pg.evaluate("document.fonts.ready")
    # página na altura total: seção abaixo da área visível saía cortada (story do aviso, 2026-10-16)
    pg.set_viewport_size({"width": 1080, "height": pg.evaluate("document.documentElement.scrollHeight")})
    pg.wait_for_timeout(300)
    for el in pg.query_selector_all("section.slide"):
        nome = el.get_attribute("id")
        el.screenshot(path=str(out / f"{nome}.png"))
        print("ok", nome)
    b.close()
