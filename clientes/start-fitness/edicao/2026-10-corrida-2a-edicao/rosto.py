"""Caixa do rosto em cada quadro (YuNet), pra as headlines nunca chegarem perto do rosto (Talyta, 2026-10-28:
"as headlines chegam a quase cobrir o rosto, não gosto").
Onde a mão cobre o rosto e o detector perde, interpola. A caixa ganha folga: cabelo em cima, queixo embaixo.
Saída: ../video/src/rosto.json  {fps, x0[], y0[], x1[], y1[]} por quadro (1080x1920) + analise/rosto-prova.jpg
Uso: python rosto.py
"""
import json
import os

import cv2
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.join(AQUI, "bruto", "chamada.mp4")
MODELO = os.path.join(os.environ["LOCALAPPDATA"], "Programs", "modelos", "yunet.onnx")
SAIDA = os.path.join(AQUI, "..", "video", "src", "rosto.json")
ESC = 0.5

cap = cv2.VideoCapture(VIDEO)
fps = cap.get(cv2.CAP_PROP_FPS)
det = cv2.FaceDetectorYN.create(MODELO, "", (540, 960), 0.6, 0.3, 50)
caixas = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    p = cv2.resize(f, None, fx=ESC, fy=ESC)
    det.setInputSize((p.shape[1], p.shape[0]))
    _, faces = det.detect(p)
    if faces is None or len(faces) == 0:
        caixas.append(None); continue
    x, y, w, h = max(faces, key=lambda r: r[-1])[:4] / ESC  # a de maior confiança (a maior às vezes é falsa)
    # folga: cabelo (35% da altura em cima), queixo (8% embaixo), orelhas (10% de cada lado)
    caixas.append((x - 0.1 * w, y - 0.35 * h, x + 1.1 * w, y + 1.08 * h))
n = len(caixas)
# descarta detecção absurda (ex.: 12 s, caixa pegando o corpo todo): tamanho fora de 0,65–1,45x a mediana vizinha
alt = np.array([c[3] - c[1] if c else np.nan for c in caixas])
for i, c in enumerate(caixas):
    if c is None:
        continue
    viz = alt[max(0, i - 36):i + 37]
    med = np.nanmedian(viz)
    if not (0.65 * med <= alt[i] <= 1.45 * med):
        caixas[i] = None
achados = [i for i, c in enumerate(caixas) if c is not None]
print(f"{n} quadros, rosto achado em {len(achados)}")
arr = np.array([caixas[i] for i in achados])
cheio = np.stack([np.interp(np.arange(n), achados, arr[:, k]) for k in range(4)], 1)
# segura a caixa: em cada quadro vale a maior entre ±3 quadros (o texto não "persegue" o rosto tremendo)
seg = cheio.copy()
for i in range(n):
    a, b = max(0, i - 3), min(n, i + 4)
    seg[i] = [cheio[a:b, 0].min(), cheio[a:b, 1].min(), cheio[a:b, 2].max(), cheio[a:b, 3].max()]
json.dump({"fps": fps, "x0": seg[:, 0].round(0).tolist(), "y0": seg[:, 1].round(0).tolist(),
           "x1": seg[:, 2].round(0).tolist(), "y1": seg[:, 3].round(0).tolist()}, open(SAIDA, "w"))

# prova: um quadro a cada 1,5 s com a caixa
cap = cv2.VideoCapture(VIDEO)
ims = []
for i in range(0, n, 36):
    cap.set(cv2.CAP_PROP_POS_FRAMES, i)
    ok, f = cap.read()
    x0, y0, x1, y1 = seg[i].astype(int)
    cv2.rectangle(f, (x0, y0), (x1, y1), (0, 255, 255) if caixas[i] else (0, 0, 255), 8)
    cv2.putText(f, f"{i / fps:.1f}", (20, 1880), 0, 3, (0, 255, 255), 6)
    ims.append(cv2.resize(f, (216, 384)))
while len(ims) % 9:
    ims.append(np.zeros_like(ims[0]))
cv2.imwrite(os.path.join(AQUI, "analise", "rosto-prova.jpg"), np.vstack([np.hstack(ims[k:k + 9]) for k in range(0, len(ims), 9)]))
