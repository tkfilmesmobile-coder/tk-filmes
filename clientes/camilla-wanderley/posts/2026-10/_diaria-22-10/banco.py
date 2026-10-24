"""Copia fotos escolhidas do banco do Drive pra fotos/ (JPG, orientação certa, lado maior 2000 px) e monta uma folha
grande pra conferir olhos e foco. Uso: python banco.py <saida_folha.jpg> 2026-09-03:0163 2026-09-24:0355 ..."""
import glob, os, sys
from PIL import Image, ImageDraw, ImageOps
import pillow_heif

pillow_heif.register_heif_opener()
AQUI = os.path.dirname(os.path.abspath(__file__))
BANCO = r"H:\Meu Drive\Dra. Camilla Wanderlley\BRUTO\FOTOS"
DEST = os.path.join(AQUI, "fotos")
os.makedirs(DEST, exist_ok=True)
thumbs = []
for item in sys.argv[2:]:
    data, num = item.split(":")
    fs = glob.glob(os.path.join(BANCO, f"{data} · Diária consultório", f"IMG_{num}.*"))
    if not fs:
        print("não achei", item); continue
    im = ImageOps.exif_transpose(Image.open(fs[0])).convert("RGB")
    im.thumbnail((2000, 2000))
    nome = f"{data[5:].replace('-', '')}-{num}"
    im.save(os.path.join(DEST, nome + ".jpg"), quality=93)
    t = im.copy(); t.thumbnail((330, 440))
    c = Image.new("RGB", (330, 460), "white"); c.paste(t, ((330 - t.width) // 2, 20))
    ImageDraw.Draw(c).text((4, 3), nome, fill=(0, 0, 0))
    thumbs.append(c)
col = 7
g = Image.new("RGB", (col * 330, ((len(thumbs) + col - 1) // col) * 460), "white")
for i, t in enumerate(thumbs):
    g.paste(t, ((i % col) * 330, (i // col) * 460))
g.save(sys.argv[1], quality=85)
print(len(thumbs), "fotos")
