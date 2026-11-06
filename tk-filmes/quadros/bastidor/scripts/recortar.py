"""Recorta a pessoa de uma foto (MediaPipe selfie segmenter + filtro guiado pra acertar o cabelo) e grava PNG com
transparência. Usado no carrossel pra pôr o texto ATRÁS da pessoa (camadas: foto → texto → recorte).
uso: python recortar.py <foto> <saida.png>
"""
import sys, os, cv2, numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision
foto, saida = sys.argv[1], sys.argv[2]
MODELO = r"C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES\tk-filmes\videos\remotion\scripts\selfie_segmenter.tflite"
img = cv2.imread(foto); h, w = img.shape[:2]
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(base_options=mpp.BaseOptions(model_asset_path=MODELO), output_confidence_masks=True))
m = np.asarray(seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB))).confidence_masks[0].numpy_view(), dtype=np.float32)
if m.ndim == 3: m = m[..., 0]
m = cv2.resize(m, (w, h))
if m[h // 2, w // 2] < 0.5 and m.mean() > 0.5: m = 1 - m
def guiado(I, p, r, eps):
    box = lambda x: cv2.boxFilter(x, -1, (r, r))
    mI, mp_ = box(I), box(p); a = (box(I * p) - mI * mp_) / (box(I * I) - mI * mI + eps); b = mp_ - a * mI
    return box(a) * I + box(b)
I = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
a = np.clip((guiado(I, m, 25, 1e-3) - 0.3) / 0.45, 0, 1)
a = cv2.GaussianBlur(a, (0, 0), 1.0)
cv2.imwrite(saida, np.dstack([img, (a * 255).astype(np.uint8)]))
print("ok", saida)
