"""Rostos por quadro (YuNet) no vídeo: grava [[x, y, w, score] por rosto] por quadro, em px do vídeo 1080x1920.
Uso: <venv-tracking>/python scripts/rostos.py <video> <saida.json>"""
import sys, json, cv2
video, saida = sys.argv[1], sys.argv[2]
MODELO = r"C:\Users\tamar\TK FILMES\projetos\curso-mestres-ai\remotion\.venv-tracking\yunet.onnx"
cap = cv2.VideoCapture(video)
ESC = 0.5
det = None
quadros = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    p = cv2.resize(f, None, fx=ESC, fy=ESC)
    if det is None:
        det = cv2.FaceDetectorYN.create(MODELO, "", (p.shape[1], p.shape[0]), 0.6, 0.3, 5000)
    _, fs = det.detect(p)
    rs = []
    if fs is not None:
        for r in fs:
            x, y, w, h = r[:4] / ESC
            rs.append([round(float(x + w / 2)), round(float(y + h / 2)), round(float(w)), round(float(r[-1]), 2)])
    quadros.append(rs)
json.dump(quadros, open(saida, "w"))
print(len(quadros), "quadros")
