"""Centro horizontal do rosto de quem fala (0 a 1), a cada 0,25 s, pra o recorte vertical seguir a pessoa.
uso: python scripts/rosto.py <video> <ini> <fim> <esq|dir>
esq = a pessoa mais à esquerda (Ronaldo), dir = a mais à direita (Tamara). Usa o face_landmarker do Bastidor TK.
Imprime "t cx" e uma linha final com os pontos já suavizados (média móvel de 1 s)."""
import sys
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision

MODELO = r"C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES\tk-filmes\quadros\bastidor\scripts\face_landmarker.task"
video, ini, fim, lado = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path=MODELO), num_faces=4))
cap = cv2.VideoCapture(video)
pts = []
t = ini
while t <= fim + 1e-6:
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, img = cap.read()
    if not ok:
        break
    small = cv2.resize(img, (1280, 720))
    res = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(small, cv2.COLOR_BGR2RGB)))
    xs = [float(np.mean([p.x for p in f])) for f in res.face_landmarks]
    cx = (min(xs) if lado == "esq" else max(xs)) if xs else None
    pts.append((round(t, 2), cx))
    print(f"{t:6.2f} {'-' if cx is None else f'{cx:.3f}'}  ({len(xs)} rosto(s))")
    t += 0.25
# preenche buracos e suaviza
v = np.array([np.nan if c is None else c for _, c in pts])
idx = np.arange(len(v)); ok = ~np.isnan(v)
v = np.interp(idx, idx[ok], v[ok]) if ok.any() else v
k = 4
sv = np.convolve(np.pad(v, (k // 2, k // 2), mode="edge"), np.ones(k + 1) / (k + 1), mode="valid")[: len(v)]
print("SUAVE", " ".join(f"{t}:{c:.3f}" for (t, _), c in zip(pts, sv)))
