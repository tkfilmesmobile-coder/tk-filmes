import sys, pathlib
from playwright.sync_api import sync_playwright
# uso: python render_overlay.py <arquivo.html> [pasta]  -> cada section.slide vira <id>.png com fundo transparente
src = pathlib.Path(sys.argv[1]).resolve(); out = pathlib.Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else src.parent
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.goto(src.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
    for el in pg.query_selector_all("section.slide"):
        el.screenshot(path=str(out / f"{el.get_attribute('id')}.png"), omit_background=True); print("ok", el.get_attribute("id"))
    b.close()
