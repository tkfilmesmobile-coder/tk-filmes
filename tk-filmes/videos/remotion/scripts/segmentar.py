"""Recorta a apresentadora do fundo (MediaPipe, selfie segmenter) num trecho do vídeo e grava PNGs RGBA
por frame, pra uma camada "pessoa" ficar por cima de textos que devem parecer atrás dela.
uso: python scripts/segmentar.py <video> <pasta_saida> <fps> <t0> <t1>
saída: <pasta_saida>/f%05d.png (índice = frame da composição)
"""
import sys, os, urllib.request, cv2, numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision

video, saida, fps, t0, t1 = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
os.makedirs(saida, exist_ok=True)
modelo = os.path.join(os.path.dirname(__file__), "selfie_segmenter.tflite")
if not os.path.exists(modelo):
    urllib.request.urlretrieve("https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite", modelo)

opts = vision.ImageSegmenterOptions(base_options=mpp.BaseOptions(model_asset_path=modelo), running_mode=vision.RunningMode.VIDEO, output_category_mask=False, output_confidence_masks=True)
seg = vision.ImageSegmenter.create_from_options(opts)
cap = cv2.VideoCapture(video)
vfps = cap.get(cv2.CAP_PROP_FPS)
f0, f1 = int(round(t0 * fps)), int(round(t1 * fps))
n = 0
for f in range(f0, f1 + 1):
    t = f / fps
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, img = cap.read()
    if not ok: break
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    res = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), int(t * 1000))
    m = np.asarray(res.confidence_masks[0].numpy_view(), dtype=np.float32)
    if m.ndim == 3: m = m[..., 0]
    # decide pelo centro do quadro: ali está a pessoa; se o centro for baixo, a máscara está invertida
    h, w = m.shape
    if m[h // 2, w // 2] < 0.5: m = 1 - m
    a = np.clip((m - 0.35) / 0.3, 0, 1)
    a = cv2.GaussianBlur((a * 255).astype(np.uint8), (0, 0), 2.5)
    rgba = np.dstack([img, a])
    cv2.imwrite(os.path.join(saida, f"f{f:05d}.png"), rgba)
    n += 1
print(n, "frames", f0, "-", f1)
