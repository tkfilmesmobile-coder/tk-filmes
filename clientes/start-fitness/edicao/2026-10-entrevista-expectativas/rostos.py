"""Caixa que cobre TODOS os rostos do quadro (entrevista: apresentador + entrevistado), pra headline nunca chegar
perto de rosto nenhum (regra da Talyta, 2026-10-28). Mesmo método do rosto.py do vídeo 1 (YuNet), só que junta as
detecções boas em vez de pegar uma.
Saída: ../video/src/entrevista-rosto.json {fps, x0[], y0[], x1[], y1[]} + analise/rosto-prova.jpg
"""
import json
import os

import cv2
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.join(AQUI, "..", "video", "public", "midia", "entrevista.mp4")
MODELO = os.path.join(os.environ["LOCALAPPDATA"], "Programs", "modelos", "yunet.onnx")
SAIDA = os.path.join(AQUI, "..", "video", "src", "entrevista-rosto.json")
ESC = 0.5

cap = cv2.VideoCapture(VIDEO)
fps = cap.get(cv2.CAP_PROP_FPS)
det = cv2.FaceDetectorYN.create(MODELO, "", (540, 960), 0.7, 0.3, 50)
caixas = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    p = cv2.resize(f, None, fx=ESC, fy=ESC)
    det.setInputSize((p.shape[1], p.shape[0]))
    _, faces = det.detect(p)
    boas = [r[:4] / ESC for r in (faces if faces is not None else []) if r[-1] > 0.75 and 60 < r[3] / ESC < 700]
    if not boas:
        caixas.append(None); continue
    x0 = min(x - 0.1 * w for x, y, w, h in boas); x1 = max(x + 1.1 * w for x, y, w, h in boas)
    y0 = min(y - 0.35 * h for x, y, w, h in boas); y1 = max(y + 1.08 * h for x, y, w, h in boas)
    caixas.append((x0, y0, x1, y1))
n = len(caixas)
achados = [i for i, c in enumerate(caixas) if c is not None]
print(f"{n} quadros, rosto achado em {len(achados)}")
arr = np.array([caixas[i] for i in achados])
cheio = np.stack([np.interp(np.arange(n), achados, arr[:, k]) for k in range(4)], 1)
seg = cheio.copy()
for i in range(n):
    a, b = max(0, i - 3), min(n, i + 4)
    seg[i] = [cheio[a:b, 0].min(), cheio[a:b, 1].min(), cheio[a:b, 2].max(), cheio[a:b, 3].max()]
json.dump({"fps": fps, "x0": seg[:, 0].round(0).tolist(), "y0": seg[:, 1].round(0).tolist(),
           "x1": seg[:, 2].round(0).tolist(), "y1": seg[:, 3].round(0).tolist()}, open(SAIDA, "w"))

cap = cv2.VideoCapture(VIDEO)
ims = []
for i in range(0, n, 48):
    cap.set(cv2.CAP_PROP_POS_FRAMES, i)
    ok, f = cap.read()
    x0, y0, x1, y1 = seg[i].astype(int)
    cv2.rectangle(f, (x0, y0), (x1, y1), (0, 255, 255) if caixas[i] else (0, 0, 255), 8)
    cv2.putText(f, f"{i / fps:.0f}", (20, 1880), 0, 3, (0, 255, 255), 6)
    ims.append(cv2.resize(f, (180, 320)))
while len(ims) % 13:
    ims.append(np.zeros_like(ims[0]))
cv2.imwrite(os.path.join(AQUI, "analise", "rosto-prova.jpg"), np.vstack([np.hstack(ims[k:k + 13]) for k in range(0, len(ims), 13)]))
