# Detecta o rosto do apresentador nos trechos usados e grava a posição (normalizada 0-1).
# Uso: python scripts/rosto.py <video> <saida.json> "a-b,c-d,..."
import sys, json, cv2

video, saida, faixas = sys.argv[1], sys.argv[2], sys.argv[3]
faixas = [tuple(map(float, f.split("-"))) for f in faixas.split(",")]
cap = cv2.VideoCapture(video)
fps = cap.get(cv2.CAP_PROP_FPS)
import os
det = None
MODELO = os.path.join(os.path.dirname(sys.executable), "..", "yunet.onnx")
pontos = []
for a, b in faixas:
    t = a
    while t <= b:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, img = cap.read()
        if not ok:
            break
        h, w = img.shape[:2]
        esc = 540 / w
        peq = cv2.resize(img, (540, int(h * esc)))
        ph, pw = peq.shape[:2]
        if det is None:
            det = cv2.FaceDetectorYN.create(MODELO, "", (pw, ph), 0.7)
        _, rs = det.detect(peq)
        if rs is not None and len(rs):
            x, y, fw, fh = map(float, max(rs, key=lambda r: r[2] * r[3])[:4])
            pontos.append({"t": round(t, 3), "x": (x + fw / 2) / pw, "y": (y + fh / 2) / ph,
                           "w": fw / pw, "topo": y / ph})
        t += 0.2
print(w, h, fps, len(pontos), "pontos")
json.dump(pontos, open(saida, "w"))
