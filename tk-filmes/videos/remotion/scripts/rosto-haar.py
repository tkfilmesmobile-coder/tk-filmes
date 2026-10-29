"""Rosto da apresentadora a cada 0,2 s (YuNet em %LOCALAPPDATA%/Programs/modelos/yunet.onnx), no formato do rosto.py
(x, y, w, topo normalizados 0-1), com suavização e falhas preenchidas.
uso: python scripts/rosto-haar.py <video> <saida.json>
"""
import sys, json, os, cv2
video, saida = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(video)
dur = cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)
YUNET = os.path.join(os.environ["LOCALAPPDATA"], "Programs", "modelos", "yunet.onnx")
det = None
pts, t = [], 0.0
while t <= dur:
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, img = cap.read()
    if not ok: break
    h, w = img.shape[:2]
    pw = 360; ph = int(h * pw / w)
    peq = cv2.resize(img, (pw, ph))
    if det is None: det = cv2.FaceDetectorYN.create(YUNET, "", (pw, ph), 0.7)
    _, rs = det.detect(peq)
    if rs is not None and len(rs):
        x, y, fw, fh = map(float, max(rs, key=lambda r: r[2] * r[3])[:4])
        pts.append({"t": round(t, 2), "x": (x + fw / 2) / pw, "y": (y + fh / 2) / ph, "w": fw / pw, "topo": y / ph})
    else:
        pts.append(None)
    t += 0.2
# preenche falhas com o vizinho e suaviza (média móvel de 5)
ult = next(p for p in pts if p)
for i, p in enumerate(pts):
    if p is None: pts[i] = {**ult, "t": round(i * 0.2, 2)}
    else: ult = p
liso = []
for i, p in enumerate(pts):
    viz = pts[max(0, i - 2): i + 3]
    liso.append({"t": p["t"], **{k: sum(v[k] for v in viz) / len(viz) for k in ("x", "y", "w", "topo")}})
json.dump(liso, open(saida, "w"))
print(len(liso), "pontos ·", sum(1 for p in pts if p) , "com rosto")
