"""Põe "outras dela" desfocadas no FUNDO de uma foto sem recortar a pessoa principal (ref. "VOCÊ", 2026-11-04).
A foto principal fica intacta (o cabelo não ganha borda de recorte); as cópias entram só onde é fundo e somem
suavemente antes de chegar perto dela (máscara da pessoa principal dilatada e esfumada).
uso: python scripts/compor-fundo.py <foto.jpg> <recorte-principal.png> <saida.jpg> <copia1.png>:<x>:<y>:<altura> [...]
     x, y, altura em px do post 1080x1350 (a foto entra em cover, objectPosition 50% 33%, como no PostEditorial)
"""
import sys, cv2, numpy as np
foto, rec, saida = sys.argv[1:4]
base = cv2.imread(foto).astype(np.float32)
H, W = base.shape[:2]
s = 1080 / W; desl = (H * s - 1350) * 0.33          # canvas -> foto: (x/s, (y + desl)/s)
mask = cv2.imread(rec, cv2.IMREAD_UNCHANGED)[..., 3].astype(np.float32) / 255
mask = cv2.resize(mask, (W, H))
# área protegida: a pessoa principal + uma margem que se desfaz aos poucos (~90 px), sem borda
prot = cv2.dilate((mask > 0.3).astype(np.float32), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
prot = np.clip(cv2.GaussianBlur(prot, (0, 0), 38) * 1.25, 0, 1)
saida_img = base.copy()
for arg in sys.argv[4:]:
    src, x, y, alt = arg.rsplit(":", 3); x, y, alt = float(x), float(y), float(alt)
    c = cv2.imread(src, cv2.IMREAD_UNCHANGED).astype(np.float32)
    ch = int(alt / s); cw = int(c.shape[1] * ch / c.shape[0])
    c = cv2.resize(c, (cw, ch), interpolation=cv2.INTER_AREA)
    # desfoque com alfa pré-multiplicado (sem auréola escura)
    a = c[..., 3:] / 255; rgb = c[..., :3] * a
    k = 15 / s
    rgb = cv2.GaussianBlur(rgb, (0, 0), k); a = cv2.GaussianBlur(a, (0, 0), k)[..., None]
    rgb = rgb / np.maximum(a, 1e-3)
    camada = np.zeros_like(base); alfa = np.zeros((H, W, 1), np.float32)
    x0, y0 = int(x / s), int((y + desl) / s)
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + cw), min(H, y0 + ch)
    if xb <= xa or yb <= ya: continue
    camada[ya:yb, xa:xb] = rgb[ya - y0:yb - y0, xa - x0:xb - x0]
    alfa[ya:yb, xa:xb] = a[ya - y0:yb - y0, xa - x0:xb - x0]
    alfa *= (1 - prot)[..., None] * 0.92
    camada *= 0.74  # escuras, como na ref.: misturam com o fundo e não desenham contorno
    saida_img = saida_img * (1 - alfa) + camada * alfa
cv2.imwrite(saida, np.clip(saida_img, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 95])
print("ok", saida)
