"""Rastreio pra os desenhos acompanharem o movimento (pedido da Talyta, 2026-11-04):
- sacola (cena 9, 18,33–19,83 s): caixa da sacola branca quadro a quadro, pras setas apontarem pra ela;
- ponte (cena 12, 22,96–24,92 s): movimento da copa das árvores e do corrimão (fluxo óptico, sem a menina),
  pros macaquinhos ficarem presos nas árvores.
Saída: ../video/src/rastreio.json + analise/rastreio-prova.jpg
"""
import json
import os
import subprocess

import cv2
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.join(AQUI, "..", "video", "public", "midia", "video.mp4")
REC = os.path.join(AQUI, "..", "video", "public", "midia", "recorte", "ponte.mov")
SAIDA = os.path.join(AQUI, "..", "video", "src", "rastreio.json")
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
FPS, W, H = 24, 1080, 1920


def quadros(de, ate):
    cap = cv2.VideoCapture(VIDEO)
    f0, f1 = round(de * FPS), round(ate * FPS)
    cap.set(cv2.CAP_PROP_POS_FRAMES, f0)
    out = []
    for _ in range(f0, f1):
        ok, q = cap.read()
        if not ok:
            break
        out.append(q)
    return f0, out


def seguir(cinza, REF, masc_ref, masc_fn=None):
    """Transformação (escala + giro + deslocamento) que leva um ponto do quadro REF pra cada quadro."""
    mov = [None] * len(cinza)
    mov[REF] = np.eye(2, 3).tolist()
    for passo in (1, -1):
        acum = np.vstack([np.eye(2, 3), [0, 0, 1]])
        i, masc = REF, masc_ref
        while 0 <= i + passo < len(cinza):
            j = i + passo
            m = masc if masc_fn is None else masc_fn(i, acum)
            p = cv2.goodFeaturesToTrack(cinza[i], 400, 0.01, 10, mask=m)
            q2, st, _ = cv2.calcOpticalFlowPyrLK(cinza[i], cinza[j], p, None, winSize=(31, 31), maxLevel=3)
            bons = st.ravel() == 1
            M, _ = cv2.estimateAffinePartial2D(p[bons], q2[bons], method=cv2.RANSAC, ransacReprojThreshold=3)
            acum = np.vstack([M, [0, 0, 1]]) @ acum
            mov[j] = acum[:2].tolist()
            i = j
    return mov


# ---------- sacola: pontos no logo e nas alças, a partir do quadro 458 (19,08 s), onde ela aparece nítida ----------
f0, qs_s = quadros(18.333, 19.833)
cinza_s = [cv2.cvtColor(q, cv2.COLOR_BGR2GRAY) for q in qs_s]
REF_S = 458 - f0
CAIXA = np.array([776, 930, 1080, 1316], float)  # sacola no quadro de referência (cortada na beira direita)


def masc_sacola(i, acum):
    # a máscara anda junto com a sacola: caixa de referência levada pro quadro i
    M = acum[:2]
    (x0, y0), (x1, y1) = [M @ [x, y, 1] for x, y in ((CAIXA[0], CAIXA[1]), (CAIXA[2], CAIXA[3]))]
    m = np.zeros((H, W), np.uint8)
    m[int(max(0, y0 + 10)):int(min(H, y1 - 10)), int(max(0, x0 + 10)):int(min(W, x1 - 4))] = 255
    return m


mov_s = seguir(cinza_s, REF_S, None, masc_sacola)
liso = {}
for k, M in enumerate(mov_s):
    M = np.array(M)
    (x0, y0), (x1, y1) = M @ [CAIXA[0], CAIXA[1], 1], M @ [CAIXA[2], CAIXA[3], 1]
    liso[f0 + k] = [round(float(v), 1) for v in (x0, y0, x1, y1)]
print("sacola:", len(liso), "quadros", liso[f0], "->", liso[f0 + len(qs_s) - 1])

# ---------- ponte: movimento das árvores (copa) e do corrimão ----------
f0p, qs = quadros(22.958, 24.917)
alfa = np.frombuffer(subprocess.run([FF, "-v", "error", "-i", REC, "-vf", "alphaextract", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
                                    capture_output=True, check=True).stdout, np.uint8).reshape(-1, H, W)
REF = len(qs) // 2  # quadro de referência: o do meio da cena
zonas = {"copa": (0, 640), "corrimao": (640, 1500)}
mov = {z: [None] * len(qs) for z in zonas}
cinza = [cv2.cvtColor(q, cv2.COLOR_BGR2GRAY) for q in qs]
for z, (ya, yb) in zonas.items():
    mov[z][REF] = np.eye(2, 3).tolist()
    for passo in (1, -1):
        acum = np.vstack([np.eye(2, 3), [0, 0, 1]])
        i = REF
        while 0 <= i + passo < len(qs):
            j = i + passo
            masc = np.zeros((H, W), np.uint8)
            masc[ya:yb] = 255
            masc[cv2.dilate(alfa[i], np.ones((25, 25), np.uint8)) > 20] = 0  # sem a menina
            p = cv2.goodFeaturesToTrack(cinza[i], 400, 0.01, 12, mask=masc)
            q2, st, _ = cv2.calcOpticalFlowPyrLK(cinza[i], cinza[j], p, None, winSize=(31, 31), maxLevel=3)
            bons = st.ravel() == 1
            M, _ = cv2.estimateAffinePartial2D(p[bons], q2[bons], method=cv2.RANSAC, ransacReprojThreshold=3)
            acum = np.vstack([M, [0, 0, 1]]) @ acum  # leva ponto do REF pro quadro j
            mov[z][j] = acum[:2].tolist()
            i = j
    dx = [m[0][2] for m in mov[z]]
    print(z, "deslocamento x do 1º ao último quadro:", round(dx[0]), "->", round(dx[-1]))

json.dump({"sacola": {str(k): v for k, v in liso.items()},
           "ponte": {"de": f0p, "ref": f0p + REF, **{z: mov[z] for z in zonas}}}, open(SAIDA, "w"))

# prova: caixa da sacola e uma grade de pontos da copa seguindo o movimento
ims = []
for k in range(0, len(qs_s), 5):
    q = qs_s[k].copy()
    b = liso.get(f0 + k)
    if b:
        cv2.rectangle(q, (int(b[0]), int(b[1])), (int(b[2]), int(b[3])), (0, 0, 255), 10)
    ims.append(cv2.resize(q, (270, 480)))
cv2.imwrite(os.path.join(AQUI, "analise", "rastreio-sacola.jpg"), np.hstack(ims))
# copa: um ponto preso num galho no quadro do meio, visto em 5 momentos
ims = []
for k in range(0, len(qs), 11):
    q = qs[k].copy()
    for (x, y), cor in (((540, 300), (0, 255, 255)), ((300, 450), (255, 0, 255)), ((800, 200), (0, 0, 255))):
        X, Y = np.array(mov["copa"][k]) @ [x, y, 1]
        cv2.circle(q, (int(X), int(Y)), 26, cor, -1)
    ims.append(cv2.resize(q[:900], (270, 225)))
cv2.imwrite(os.path.join(AQUI, "analise", "rastreio-copa.jpg"), np.hstack(ims))


