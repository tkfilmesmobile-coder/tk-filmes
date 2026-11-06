"""Monta a foto da capa do carrossel (1080x1350) com o FUNDO ORIGINAL da foto da Talyta estendido pra abrir espaço pro texto.
A foto entra menor, presa embaixo à direita (ou à esquerda), e o resto da tela continua o próprio fundo dela:
 · nas laterais, a borda da foto é esticada só na horizontal (mesa e parede continuam no mesmo nível, sem borrar a linha da mesa);
 · em cima, a borda de cima é esticada e desfocada.
As emendas têm transição suave. Funciona bem em foto de fundo liso (parede lisa, mesa).
uso: python compor-capa.py <foto> <saida.jpg> [escala=0.76] [lado=direita|esquerda]
"""
import sys, cv2, numpy as np
foto, saida = sys.argv[1], sys.argv[2]
esc = float(sys.argv[3]) if len(sys.argv) > 3 else 0.76
lado = sys.argv[4] if len(sys.argv) > 4 else "direita"
W, H = 1080, 1350
img = cv2.imdecode(np.fromfile(foto, np.uint8), cv2.IMREAD_COLOR)
h, w = img.shape[:2]
s = H * esc / h
fw, fh = int(round(w * s)), int(round(h * s))
p = cv2.resize(img, (fw, fh), interpolation=cv2.INTER_AREA).astype(np.float32)
x0 = W - fw if lado == "direita" else 0
y0 = H - fh
left, right = x0, W - fw - x0
F = 60  # largura da emenda

def rampa(n, sobe):  # 0→1 suave em n pixels
    t = np.linspace(0, 1, n, dtype=np.float32); t = t * t * (3 - 2 * t)
    return t if sobe else t[::-1]

# 1) laterais: estica a borda na horizontal; desfoca forte em x e quase nada em y
lin = cv2.copyMakeBorder(p, 0, 0, left, right, cv2.BORDER_REPLICATE)
lat = cv2.GaussianBlur(lin, (0, 0), sigmaX=40, sigmaY=1.2)
mx = np.zeros(W, np.float32); mx[x0:x0 + fw] = 1
if left: mx[x0:x0 + F] = rampa(F, True)
if right: mx[x0 + fw - F:x0 + fw] = rampa(F, False)
lin = lin * mx[None, :, None] + lat * (1 - mx[None, :, None])
# 2) topo: estica a borda de cima e desfoca
full = cv2.copyMakeBorder(lin, y0, 0, 0, 0, cv2.BORDER_REPLICATE)
topo = cv2.GaussianBlur(full, (0, 0), 45)
my = np.zeros(H, np.float32); my[y0:] = 1
if y0: my[y0:y0 + F] = rampa(F, True)
out = full * my[:, None, None] + topo * (1 - my[:, None, None])
# ruído leve pra não formar faixas no degradê
out += np.random.default_rng(3).normal(0, 1.6, out.shape).astype(np.float32)
cv2.imwrite(saida, np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 95])
print("ok", saida, "foto em", x0, y0, fw, fh)
