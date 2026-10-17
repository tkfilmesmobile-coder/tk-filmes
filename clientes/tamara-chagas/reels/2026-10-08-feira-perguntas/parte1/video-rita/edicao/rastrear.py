"""Rastreia o rosto da Rita (YuNet) quadro a quadro e grava public/rastreio.json com centro, largura e olhos.
O cartão da chamada se ancora ao lado do rosto, onde está o celular (lado esquerdo da tela)."""
import json, os, sys, cv2
MODELO = os.path.join(os.path.dirname(sys.executable), "..", "yunet.onnx")
cap = cv2.VideoCapture("public/rita.mp4"); fps = cap.get(cv2.CAP_PROP_FPS) or 30
det, pts, i = None, [], 0
while True:
    ok, img = cap.read()
    if not ok: break
    h, w = img.shape[:2]; peq = cv2.resize(img, (540, int(h * 540 / w))); ph, pw = peq.shape[:2]
    if det is None: det = cv2.FaceDetectorYN.create(MODELO, "", (pw, ph), 0.5)
    _, rs = det.detect(peq)
    if rs is not None and len(rs):
        r = max(rs, key=lambda r: r[2] * r[3]); x, y, fw, fh = map(float, r[:4])
        pts.append({"f": i, "x": (x + fw / 2) / pw, "y": (y + fh / 2) / ph, "w": fw / pw, "h": fh / ph})
    i += 1
json.dump(pts, open("public/rastreio.json", "w"))
print(len(pts), "de", i)
