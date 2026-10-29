"""Folha de contato de uma pasta de fotos (JPG/HEIC), com o nome de cada uma.
Uso: python folha_fotos.py <pasta> <saida.jpg> [colunas]"""
import glob, os, sys
from PIL import Image, ImageDraw, ImageOps
import pillow_heif

pillow_heif.register_heif_opener()
pasta, saida = sys.argv[1], sys.argv[2]
col = int(sys.argv[3]) if len(sys.argv) > 3 else 10
fs = sorted(f for f in glob.glob(os.path.join(pasta, "*")) if f.lower().endswith((".jpg", ".jpeg", ".heic", ".png")))
W, H = 180, 240
lin = (len(fs) + col - 1) // col
g = Image.new("RGB", (col * W, lin * H), "white")
d = ImageDraw.Draw(g)
for i, f in enumerate(fs):
    try:
        im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        im.thumbnail((W, H - 16))
        x, y = (i % col) * W, (i // col) * H
        g.paste(im, (x + (W - im.width) // 2, y))
        d.text((x + 4, y + H - 15), os.path.splitext(os.path.basename(f))[0][-8:], fill=(0, 0, 0))
    except Exception as e:
        print("erro", f, e)
g.save(saida, quality=80)
print(len(fs), "fotos")
