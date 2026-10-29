"""Rastreia a mão nos gestos (fluxo óptico Lucas-Kanade do OpenCV, sem modelo baixado).
Cada trecho tem um ponto-semente (onde a mão está num quadro conferido a olho); o script segue os pontos
da mão pra frente e pra trás, tira a mediana do deslocamento e suaviza forte (o texto acompanha leve,
sem tremer). Saída: ../video/src/rastreio.json com x, y por quadro (resolução cheia 1080x1920, 24 fps).
Uso: python rastrear_mao.py
"""
import json
import os

import cv2
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.join(AQUI, "bruto", "chamada.mp4")
SAIDA = os.path.join(AQUI, "..", "video", "src", "rastreio.json")
ESC = 0.5  # rastreia em 540x960 (mais rápido, mesmo resultado)

# id: (início s, fim s, semente s, x, y, raio) — x, y em 1080x1920, conferidos em analise/gestos.png
TRECHOS = {
    "quatro-mil": (16.40, 17.75, 16.70, 356, 940, 150),
    "um": (18.30, 19.00, 18.70, 324, 760, 150),
    "dois": (18.95, 19.55, 19.30, 172, 860, 140),
    "tres": (19.50, 20.00, 19.75, 194, 950, 140),
}

cap = cv2.VideoCapture(VIDEO)
FPS = cap.get(cv2.CAP_PROP_FPS)
quadros = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    quadros.append(cv2.cvtColor(cv2.resize(f, None, fx=ESC, fy=ESC), cv2.COLOR_BGR2GRAY))
print(len(quadros), "quadros", FPS, "fps")

LK = dict(winSize=(31, 31), maxLevel=3, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))


def pontos_em(img, cx, cy, r):
    masc = np.zeros_like(img)
    cv2.circle(masc, (int(cx), int(cy)), int(r), 255, -1)
    p = cv2.goodFeaturesToTrack(img, maxCorners=80, qualityLevel=0.01, minDistance=4, mask=masc)
    return p


def seguir(i0, i1, passo, cx, cy, r):
    """Segue de i0 até i1 (inclusive) andando 'passo' (+1 ou -1). Devolve {quadro: (x, y)}."""
    pos = {i0: (cx, cy)}
    p = pontos_em(quadros[i0], cx, cy, r)
    i = i0
    while i != i1:
        j = i + passo
        if p is None or len(p) < 6:
            p = pontos_em(quadros[i], cx, cy, r)
        if p is None:
            pos[j] = (cx, cy); i = j; continue
        q, st, _ = cv2.calcOpticalFlowPyrLK(quadros[i], quadros[j], p, None, **LK)
        bom = st.ravel() == 1
        if bom.sum() >= 4:
            d = np.median(q[bom] - p[bom], axis=0).ravel()
            cx, cy = cx + float(d[0]), cy + float(d[1])
            p = q[bom].reshape(-1, 1, 2)
        pos[j] = (cx, cy)
        i = j
    return pos


def suavizar(v, a=0.35):
    """Média móvel exponencial ida e volta (sem atraso)."""
    v = np.array(v, float)
    f = v.copy()
    for k in range(1, len(v)):
        f[k] = a * v[k] + (1 - a) * f[k - 1]
    b = f.copy()
    for k in range(len(v) - 2, -1, -1):
        b[k] = a * f[k] + (1 - a) * b[k + 1]
    return b


saida = {"fps": FPS, "trechos": {}}
for nome, (t0, t1, ts, x, y, r) in TRECHOS.items():
    i0, i1, iss = round(t0 * FPS), min(round(t1 * FPS), len(quadros) - 1), round(ts * FPS)
    cx, cy, rr = x * ESC, y * ESC, r * ESC
    pos = seguir(iss, i1, 1, cx, cy, rr)
    pos.update(seguir(iss, i0, -1, cx, cy, rr))
    idx = sorted(pos)
    xs = suavizar([pos[k][0] / ESC for k in idx])
    ys = suavizar([pos[k][1] / ESC for k in idx])
    saida["trechos"][nome] = {"de": idx[0], "ate": idx[-1], "x": [round(v, 1) for v in xs], "y": [round(v, 1) for v in ys]}
    print(f"{nome}: quadros {idx[0]}–{idx[-1]}, x {min(xs):.0f}–{max(xs):.0f}, y {min(ys):.0f}–{max(ys):.0f}")

os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
json.dump(saida, open(SAIDA, "w"), indent=1)

# prova visual: um quadro por trecho com o caminho desenhado
cap = cv2.VideoCapture(VIDEO)
provas = []
for nome, d in saida["trechos"].items():
    meio = (d["de"] + d["ate"]) // 2
    cap.set(cv2.CAP_PROP_POS_FRAMES, meio)
    ok, f = cap.read()
    pts = np.array(list(zip(d["x"], d["y"])), np.int32)
    cv2.polylines(f, [pts], False, (0, 255, 255), 6)
    k = meio - d["de"]
    cv2.circle(f, (int(d["x"][k]), int(d["y"][k])), 22, (0, 0, 255), -1)
    provas.append(cv2.resize(f, (360, 640)))
cv2.imwrite(os.path.join(AQUI, "analise", "rastreio-prova.jpg"), np.hstack(provas))
