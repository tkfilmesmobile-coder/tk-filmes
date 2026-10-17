"""Remove restos de recorte dos PNGs: mantém só o maior objeto (componente conectado do alfa) e corta a sobra."""
import pathlib
import numpy as np
from PIL import Image

PASTA = pathlib.Path(__file__).resolve().parent.parent / "public" / "assets"

def maior_componente(alfa):
    h, w = alfa.shape
    vis = np.zeros_like(alfa, dtype=bool); melhor = None; tam_melhor = 0
    pontos = np.argwhere(alfa)
    for y0, x0 in pontos[:: max(1, len(pontos) // 4000)]:
        if vis[y0, x0]:
            continue
        pilha = [(y0, x0)]; vis[y0, x0] = True; comp = []
        while pilha:
            y, x = pilha.pop(); comp.append((y, x))
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and alfa[ny, nx] and not vis[ny, nx]:
                    vis[ny, nx] = True; pilha.append((ny, nx))
        if len(comp) > tam_melhor:
            tam_melhor, melhor = len(comp), comp
    m = np.zeros_like(alfa, dtype=bool)
    ys, xs = zip(*melhor); m[list(ys), list(xs)] = True
    return m

for f in sorted(PASTA.glob("*.png")):
    im = Image.open(f).convert("RGBA"); a = np.array(im)
    alfa = a[:, :, 3] > 20
    m = maior_componente(alfa)
    # mantém a borda suave do objeto principal: dilata a máscara em 3 px
    for _ in range(3):
        m = m | np.roll(m, 1, 0) | np.roll(m, -1, 0) | np.roll(m, 1, 1) | np.roll(m, -1, 1)
    a[:, :, 3] = np.where(m, a[:, :, 3], 0)
    out = Image.fromarray(a); out = out.crop(out.getbbox())
    out.save(f); print(f.name, im.size, "->", out.size)
