"""Quem está falando? Mede o movimento da boca de quem está na câmera, quadro a quadro.
Detecta o rosto (YuNet) e os cantos da boca; recorta a região da boca e mede a diferença
entre quadros vizinhos. Voz no áudio SEM boca mexendo = outra pessoa (direção de quem grava).
Grava <saida>.json com {t, mov} por quadro.
Uso: python scripts/labios.py <video> <saida.json> [ini fim]
"""
import sys, os, json
import cv2
import numpy as np

video, saida = sys.argv[1], sys.argv[2]
ini = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
fim = float(sys.argv[4]) if len(sys.argv) > 4 else 1e9
MODELO = os.path.join(os.path.dirname(sys.executable), "..", "yunet.onnx")

cap = cv2.VideoCapture(video)
fps = cap.get(cv2.CAP_PROP_FPS)
cap.set(cv2.CAP_PROP_POS_MSEC, ini * 1000)
det = None
ant = None
caixa = None
out = []
i = int(round(ini * fps))
while True:
    ok, img = cap.read()
    t = i / fps
    if not ok or t > fim:
        break
    h, w = img.shape[:2]
    esc = 480 / w
    peq = cv2.resize(img, (480, int(h * esc)))
    if det is None:
        det = cv2.FaceDetectorYN.create(MODELO, "", (peq.shape[1], peq.shape[0]), 0.6)
    _, rs = det.detect(peq)
    if rs is not None and len(rs):
        r = max(rs, key=lambda r: r[2] * r[3])
        fw = r[2] / esc
        # landmarks: olho d (4,5), olho e (6,7), nariz (8,9), boca d (10,11), boca e (12,13)
        bx1, by1, bx2, by2 = r[10] / esc, r[11] / esc, r[12] / esc, r[13] / esc
        cx, cy = (bx1 + bx2) / 2, (by1 + by2) / 2
        lw = max(abs(bx2 - bx1) * 1.6, fw * 0.35)
        lh = fw * 0.28
        nova = (cx - lw / 2, cy - lh * 0.45, lw, lh)
        caixa = nova if caixa is None else tuple(0.7 * a + 0.3 * b for a, b in zip(caixa, nova))
    mov = None
    if caixa is not None:
        x, y, cw, ch = [int(v) for v in caixa]
        x, y = max(0, x), max(0, y)
        roi = cv2.cvtColor(img[y:y + ch, x:x + cw], cv2.COLOR_BGR2GRAY)
        if roi.size:
            roi = cv2.resize(roi, (96, 48)).astype(np.float32)
            roi = cv2.GaussianBlur(roi, (3, 3), 0)
            if ant is not None:
                mov = float(np.mean(np.abs(roi - ant)))
            ant = roi
    out.append({"t": round(t, 3), "mov": None if mov is None else round(mov, 3)})
    i += 1
json.dump(out, open(saida, "w"))
print(len(out), "quadros")
