"""Folha de revisão de um post: slides (4:5) e stories (9:16) lado a lado. Uso: python grade_revisao.py <pasta> <saida.jpg>"""
import glob, os, sys
from PIL import Image

pasta, saida = sys.argv[1], sys.argv[2]
sl = sorted(glob.glob(os.path.join(pasta, "[0-9][0-9].png")))
st = sorted(glob.glob(os.path.join(pasta, "story-*.png")))
H = 480
ims = [Image.open(f).convert("RGB").resize((int(H * 1080 / 1350), H)) for f in sl]
ims += [Image.open(f).convert("RGB").resize((int(H * 1080 / 1920), H)) for f in st]
g = Image.new("RGB", (sum(i.width for i in ims) + 8 * len(ims), H), "white")
x = 0
for im in ims:
    g.paste(im, (x, 0)); x += im.width + 8
g.save(saida, quality=85)
