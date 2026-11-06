"""Recorta a doutora da foto profissional (fundo de estúdio marrom, liso) pro outdoor.
1. MODNet (matting de retrato, modelo local do Edvid; nada sobe pra fora) dá a silhueta;
2. a borda é recalculada pela cor: o fundo de estúdio é um degradê liso, então dá pra estimar o fundo atrás de cada
   pixel e medir quanto aquele pixel é pessoa (cabelo fio a fio, sem halo);
3. a cor da borda é descontaminada (tira o marrom do fundo que fica nos fios): F = B + (I - B) / alfa.
Saída: saida/recorte.png (RGBA, resolução cheia) + saida/recorte-teste.jpg (sobre claro e escuro + zoom no cabelo).
Uso: python recortar.py [foto]
"""
import os
import sys

import cv2
import numpy as np
import onnxruntime as ort

AQUI = os.path.dirname(os.path.abspath(__file__))
FOTO = sys.argv[1] if len(sys.argv) > 1 else r"H:\Meu Drive\Dra. Annalibya\IDENTIDADE VISUAL\FOTOS\DSC09470-Editar.jpg.jpeg"
MODELO = r"C:\Users\kumyt\AppData\Local\Programs\Edvid\models\modnet-fp16\modnet_fp16.onnx"
SAIDA = os.path.join(AQUI, "saida")
os.makedirs(SAIDA, exist_ok=True)

img = cv2.imdecode(np.fromfile(FOTO, np.uint8), cv2.IMREAD_COLOR)  # BGR
h, w = img.shape[:2]
I = img.astype(np.float32)

# 1. silhueta pelo MODNet (lado maior ~1280 px, múltiplo de 32)
esc = 1280 / max(h, w)
mh, mw = int(round(h * esc / 32) * 32), int(round(w * esc / 32) * 32)
x = cv2.resize(img, (mw, mh), interpolation=cv2.INTER_AREA)[:, :, ::-1].astype(np.float32) / 255
x = ((x - 0.5) / 0.5).transpose(2, 0, 1)[None]
sess = ort.InferenceSession(MODELO, providers=["CPUExecutionProvider"])
a0 = cv2.resize(sess.run(None, {"input": x})[0][0, 0], (w, h), interpolation=cv2.INTER_LINEAR).clip(0, 1)

# 2. fundo estimado: média ponderada só dos pixels que com certeza são fundo, espalhada pra área toda
k = np.ones((61, 61), np.uint8)
fundo_certo = cv2.erode((a0 < 0.03).astype(np.uint8), k).astype(np.float32)
B = np.zeros_like(I)
falta = np.ones((h, w), bool)
for sigma in (40, 120, 400):
    num = cv2.GaussianBlur(I * fundo_certo[..., None], (0, 0), sigma)
    den = cv2.GaussianBlur(fundo_certo, (0, 0), sigma)
    ok = falta & (den > 0.02)
    B[ok] = num[ok] / den[ok, None]
    falta &= ~ok
B[falta] = I[fundo_certo > 0].mean(0)

# faixa de dúvida: a borda da silhueta, com folga
borda = ((a0 > 0.02) & (a0 < 0.98)).astype(np.uint8)
duvida = cv2.dilate(borda, np.ones((31, 31), np.uint8)) > 0
dentro = (a0 >= 0.5) & ~duvida
fora = (a0 < 0.5) & ~duvida

# alfa pela distância de cor entre o pixel e o fundo estimado (em Lab), na faixa de dúvida
lab = lambda z: cv2.cvtColor(z.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
d = np.linalg.norm(lab(I) - lab(B), axis=2)
ac = np.clip((d - 7) / (38 - 7), 0, 1)
# o MODNet manda no "onde": longe da silhueta dele não vira pessoa (evita manchas do fundo)
perto = cv2.dilate((a0 > 0.1).astype(np.uint8), np.ones((45, 45), np.uint8)) > 0
a = np.where(dentro, 1.0, np.where(fora, 0.0, ac * perto))
# onde o MODNet tem certeza que é pessoa (raiz escura do cabelo, gola preta, sombra), continua pessoa
a = np.maximum(a, np.clip((a0 - 0.55) / 0.35, 0, 1))
a = np.maximum(a, (cv2.erode((a0 > 0.9).astype(np.uint8), np.ones((25, 25), np.uint8)) > 0).astype(np.float32))
a = cv2.GaussianBlur(a.astype(np.float32), (0, 0), 0.8).clip(0, 1)
a = np.where(a < 0.03, 0, np.where(a > 0.985, 1, a)).astype(np.float32)

# 3. descontamina a cor da borda
al = np.maximum(a, 0.08)[..., None]
Fd = (B + (I - B) / al).clip(0, 255)
# nos fios mais finos a conta exagera (fica branco ou azulado): ali a cor vem da média do cabelo em volta
peso = a ** 4
M = cv2.blur(I * peso[..., None], (41, 41)) / np.maximum(cv2.blur(peso, (41, 41)), 1e-4)[..., None]
t = np.clip((a - 0.2) / 0.5, 0, 1)[..., None]
t = t * t * (3 - 2 * t)
F = Fd * t + M * (1 - t)
# e nunca se afasta demais da cor real do pixel nem da média
F = np.clip(F, np.minimum(I, M) - 25, np.maximum(I, M) + 25)
F = np.where((a < 0.985)[..., None], F, I).clip(0, 255)

rgba = np.dstack([F.astype(np.uint8), (a * 255).astype(np.uint8)])
cv2.imencode(".png", rgba)[1].tofile(os.path.join(SAIDA, "recorte.png"))


def sobre(cor):
    base = np.full_like(F, cor)
    return (F * a[..., None] + base * (1 - a[..., None])).astype(np.uint8)


cl, es = sobre((205, 222, 236)), sobre((25, 25, 25))
p = cv2.resize(np.hstack([cl, es]), None, fx=0.15, fy=0.15, interpolation=cv2.INTER_AREA)
# zoom no alto da cabeça e no ombro esquerdo, em tamanho real
ys, xs = np.nonzero(a > 0.5)
topo, esq = ys.min(), xs[ys < ys.min() + 600].min()
z1 = (slice(max(topo - 150, 0), topo + 650), slice(max(esq - 200, 0), esq + 700))
zoom = np.hstack([cl[z1], es[z1]])
zoom = cv2.resize(zoom, (p.shape[1], int(zoom.shape[0] * p.shape[1] / zoom.shape[1])))
cv2.imencode(".jpg", np.vstack([p, zoom]), [cv2.IMWRITE_JPEG_QUALITY, 90])[1].tofile(os.path.join(SAIDA, "recorte-teste.jpg"))
print("recorte:", w, "x", h, "| faixa de dúvida:", int(duvida.sum()), "px")
