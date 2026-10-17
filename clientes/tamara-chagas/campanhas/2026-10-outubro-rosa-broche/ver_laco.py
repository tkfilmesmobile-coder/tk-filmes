import pathlib
from playwright.sync_api import sync_playwright
d = pathlib.Path(__file__).resolve().parent
h = d / "_laco.html"
h.write_text('<html><body style="margin:0;background:#f8e4ea"><img src="laco.svg" style="width:600px"></body></html>', encoding="utf8")
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 600, "height": 1000})
    pg.goto(h.as_uri()); pg.wait_for_timeout(400); pg.screenshot(path=str(d / "_laco.png")); b.close()
print("ok")
