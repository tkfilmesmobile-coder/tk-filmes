"""Rastreia o movimento da câmera pelo FUNDO (sem a Tamara) nos primeiros segundos e grava public/camera.json:
para cada quadro t, a homografia 3x3 que leva coordenadas do quadro 0 (1080x1920) ao quadro t.
Assim o comentário fica "preso" no espaço da sala principal enquanto a câmera recua pro corredor.
Usa os recortes de public/fg (alfa = pessoa) como máscara pra não pegar pontos no corpo dela."""
import json, glob, os
import cv2, numpy as np

fr = sorted(glob.glob("out/fr/*.png"))
S = 1080 / 720  # escala pro 1080x1920
orb = cv2.ORB_create(3000)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

def carregar(i):
    img = cv2.imread(fr[i], cv2.IMREAD_GRAYSCALE)
    fg = cv2.imread(f"public/fg/{i:04d}.png", cv2.IMREAD_UNCHANGED)
    pessoa = (fg[:, :, 3] > 30).astype(np.uint8) if fg is not None and fg.shape[2] == 4 else np.zeros_like(img)
    pessoa = cv2.dilate(pessoa, np.ones((25, 25), np.uint8))
    return img, (1 - pessoa) * 255

Hs = [np.eye(3)]
img0, m0 = carregar(0)
k0, d0 = orb.detectAndCompute(img0, m0)
for i in range(1, len(fr)):
    img1, m1 = carregar(i)
    k1, d1 = orb.detectAndCompute(img1, m1)
    H = np.eye(3)
    if d0 is not None and d1 is not None:
        ms = sorted(bf.match(d0, d1), key=lambda m: m.distance)[:600]
        if len(ms) >= 12:
            a = np.float32([k0[m.queryIdx].pt for m in ms]); b = np.float32([k1[m.trainIdx].pt for m in ms])
            Hn, inl = cv2.findHomography(a, b, cv2.RANSAC, 3.0)
            if Hn is not None and inl.sum() > 15:
                H = Hn
    Hs.append(H @ Hs[-1])
    k0, d0 = k1, d1

# converte pra coordenadas 1080x1920
T = np.diag([S, S, 1]); Ti = np.linalg.inv(T)
out = [(T @ H @ Ti / (T @ H @ Ti)[2, 2]).tolist() for H in Hs]
json.dump(out, open("public/camera.json", "w"))
c = np.array([540, 1150, 1])
for i in range(0, len(out), 15):
    p = np.array(out[i]) @ c; print(i, (p[:2] / p[2]).round(0))
