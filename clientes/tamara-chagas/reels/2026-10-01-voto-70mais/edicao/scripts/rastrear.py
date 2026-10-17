"""Rastreia o rosto da apresentadora quadro a quadro (YuNet/OpenCV) e grava public/rastreio.json.
Cada ponto: t (s), x/y = centro do rosto (0-1), w = largura do rosto (0-1).
uso: <python do .venv-tracking> scripts/rastrear.py"""
import json, os, sys, pathlib
import cv2

BASE = pathlib.Path(__file__).resolve().parent.parent
VIDEO = str(BASE / "public" / "midia" / "bruto.mov")
MODELO = os.path.join(os.path.dirname(sys.executable), "..", "yunet.onnx")
cap = cv2.VideoCapture(VIDEO)
fps = cap.get(cv2.CAP_PROP_FPS) or 30
det, pontos, i = None, [], 0
while True:
    ok, img = cap.read()
    if not ok:
        break
    if i % 2 == 0:  # a cada 2 quadros (15 por segundo)
        h, w = img.shape[:2]
        peq = cv2.resize(img, (540, int(h * 540 / w)))
        ph, pw = peq.shape[:2]
        if det is None:
            det = cv2.FaceDetectorYN.create(MODELO, "", (pw, ph), 0.6)
        _, rs = det.detect(peq)
        if rs is not None and len(rs):
            x, y, fw, fh = map(float, max(rs, key=lambda r: r[2] * r[3])[:4])
            pontos.append({"t": round(i / fps, 3), "x": (x + fw / 2) / pw, "y": (y + fh / 2) / ph, "w": fw / pw})
    i += 1
(BASE / "public" / "rastreio.json").write_text(json.dumps(pontos), encoding="utf8")
xs = [p["x"] for p in pontos]; ys = [p["y"] for p in pontos]
print(f"{len(pontos)} pontos de {i} quadros | x {min(xs):.3f}-{max(xs):.3f} | y {min(ys):.3f}-{max(ys):.3f}")
