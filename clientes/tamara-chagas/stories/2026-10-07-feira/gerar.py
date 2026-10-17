"""Stories de bastidor da feira (07/10/2026) pro @tamarachagas_prev: 3 vídeos curtos do bruto com etiqueta
orgânica + 3 cartões editoriais (quiz, resposta com fonte, "essa é a Rita"). uso: python gerar.py"""
import json, pathlib, subprocess, base64
from playwright.sync_api import sync_playwright
AQUI = pathlib.Path(__file__).resolve().parent
FF = "C:/Users/tamar/AppData/Roaming/Python/Python314/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe"
BRUTO = "C:/Users/tamar/Downloads/Mobile Devices/copy_8269CA7F-75FD-4F7A-986D-83577F23EA49.MOV"
LOGO = (AQUI.parent.parent / "marca" / "logo-claro-recortado.png").as_uri()
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet">'
CSS = """*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;background:transparent;font-family:'Inter',sans-serif}
.et{position:absolute;left:70px;max-width:900px;background:#fff;color:#141414;font-weight:700;font-size:50px;line-height:1.15;padding:18px 30px;border-radius:22px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.et.s{font-size:34px;font-weight:600;background:#141414;color:#fff;padding:12px 24px;border-radius:999px}
.logo{position:absolute;left:70px;top:230px;width:120px;opacity:.95;filter:drop-shadow(0 2px 8px rgba(0,0,0,.4))}"""
VIDEOS = [
    ("01", 29.5, 37.0, '<div class="et s" style="top:1330px;transform:rotate(-2deg)">hoje a Rita virou repórter 🎤</div><div class="et" style="top:1420px">partiu feira de União! 🛵</div>'),
    ("02", 57.8, 63.4, '<div class="et s" style="top:1330px;transform:rotate(2deg)">a Rita chegando na feira:</div><div class="et" style="top:1420px">“acho que eu não conheço ninguém” 😂</div>'),
    ("03", 361.45, 364.9, '<div class="et" style="top:1420px;transform:rotate(-2deg)">pausa pro lanche 🍇</div>'),
]

def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        for n, a, z, html in VIDEOS:
            h = AQUI / "saida" / f"_ov{n}.html"
            h.write_text(f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{CSS}</style></head><body><img class="logo" src="{LOGO}">{html}</body></html>', encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.goto(h.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            png = AQUI / "saida" / f"_ov{n}.png"; pg.screenshot(path=str(png), omit_background=True); pg.close(); h.unlink()
            d = z - a
            subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", str(a), "-t", f"{d:.2f}", "-i", BRUTO, "-i", str(png),
                            "-filter_complex", f"[0:v]scale=1080:1920,setsar=1[b];[b][1:v]overlay=0:0,format=yuv420p[v];[0:a]afade=t=in:d=0.2,afade=t=out:st={d-0.4:.2f}:d=0.4[aa]",
                            "-map", "[v]", "-map", "[aa]", "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-r", "30", "-c:a", "aac", "-b:a", "128k",
                            "-movflags", "+faststart", str(AQUI / "saida" / f"{n}.mp4")], check=True)
        b.close()
    print("ok videos")

if __name__ == "__main__":
    main()
