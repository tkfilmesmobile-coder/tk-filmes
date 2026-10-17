# Rastreia o rosto do apresentador quadro a quadro (YuNet, OpenCV) e grava a posição suavizada.
# Uso: python scripts/rosto.py <video> <saida.json> <inicio_s> <fim_s>
# Saída: uma entrada por frame {f, x, y, w, h} em fração do quadro (0-1); x,y = centro do rosto.
import sys, json, os, cv2
import numpy as np

video, saida, ini, fim = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
cap = cv2.VideoCapture(video)
fps = cap.get(cv2.CAP_PROP_FPS)
MODELO = os.path.join(os.path.dirname(sys.executable), "..", "yunet.onnx")
det = None
cap.set(cv2.CAP_PROP_POS_MSEC, ini * 1000)
f0 = int(round(ini * fps)); n = int(round((fim - ini) * fps))
brutos = []
ultimo = None
for i in range(n):
    ok, img = cap.read()
    if not ok:
        break
    h, w = img.shape[:2]
    peq = cv2.resize(img, (540, int(h * 540 / w)))
    ph, pw = peq.shape[:2]
    if det is None:
        det = cv2.FaceDetectorYN.create(MODELO, "", (pw, ph), 0.6)
    _, rs = det.detect(peq)
    if rs is not None and len(rs):
        # o maior rosto perto do último conhecido: o apresentador, não quem passa no fundo
        def nota(r):
            area = r[2] * r[3]
            if ultimo is None:
                return area
            d = abs((r[0] + r[2] / 2) / pw - ultimo[0]) + abs((r[1] + r[3] / 2) / ph - ultimo[1])
            return area * (1 - min(d, 0.9))
        x, y, fw, fh = map(float, max(rs, key=nota)[:4])
        ultimo = [(x + fw / 2) / pw, (y + fh / 2) / ph, fw / pw, fh / ph]
    brutos.append(list(ultimo) if ultimo else None)

# preenche o começo sem detecção e suaviza (média móvel) pra tirar o tremor do detector
prim = next(b for b in brutos if b)
brutos = [b or prim for b in brutos]
a = np.array(brutos)
jan = 9
k = np.ones(jan) / jan
suave = np.stack([np.convolve(np.pad(a[:, c], (jan // 2, jan // 2), mode="edge"), k, mode="valid") for c in range(4)], axis=1)
pontos = [{"f": f0 + i, "x": round(float(s[0]), 4), "y": round(float(s[1]), 4), "w": round(float(s[2]), 4), "h": round(float(s[3]), 4)} for i, s in enumerate(suave)]
json.dump({"fps": fps, "pontos": pontos}, open(saida, "w"))
print(len(pontos), "frames", "fps", fps)
