# Rastreia o rosto no vídeo (cascatas Haar do OpenCV: frontal e perfil) e grava a posição suavizada.
# Uso: python scripts/rosto.py <video> <saida.json>
# Saída: um ponto por frame {f, x, y, w, h}, em fração do quadro (0-1); x,y = centro do rosto.
import sys, json
import cv2
import numpy as np

video, saida = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(video)
fps = cap.get(cv2.CAP_PROP_FPS)
H = cv2.data.haarcascades
frontal = cv2.CascadeClassifier(H + "haarcascade_frontalface_alt2.xml")
perfil = cv2.CascadeClassifier(H + "haarcascade_profileface.xml")

brutos, ultimo = [], None
while True:
    ok, img = cap.read()
    if not ok:
        break
    h, w = img.shape[:2]
    esc = 540 / w
    g = cv2.equalizeHist(cv2.cvtColor(cv2.resize(img, (540, int(h * esc))), cv2.COLOR_BGR2GRAY))
    ph, pw = g.shape
    achados = []
    for r in frontal.detectMultiScale(g, 1.08, 4, minSize=(90, 90)):
        achados.append((r, 1.0))
    for r in perfil.detectMultiScale(g, 1.08, 4, minSize=(90, 90)):
        achados.append((r, 0.8))
    for r in perfil.detectMultiScale(cv2.flip(g, 1), 1.08, 4, minSize=(90, 90)):
        achados.append(((pw - r[0] - r[2], r[1], r[2], r[3]), 0.8))
    melhor = None
    for (x, y, fw, fh), peso in achados:
        c = [(x + fw / 2) / pw, (y + fh / 2) / ph, fw / pw, fh / ph]
        # o rosto fica na metade de cima do quadro e perto do último conhecido
        nota = fw * fh * peso
        if ultimo is not None:
            nota *= 1 - min(abs(c[0] - ultimo[0]) + abs(c[1] - ultimo[1]), 0.95)
        if melhor is None or nota > melhor[0]:
            melhor = (nota, c)
    if melhor:
        ultimo = melhor[1]
        brutos.append(list(ultimo))
    else:
        brutos.append(None)

n = len(brutos)
ok_idx = [i for i, b in enumerate(brutos) if b]
print("detectado em", len(ok_idx), "de", n, "frames")
a = np.array([brutos[i] for i in ok_idx])
# interpola os buracos
cheio = np.stack([np.interp(np.arange(n), ok_idx, a[:, c]) for c in range(4)], axis=1)
# tira picos (mediana) e suaviza (média móvel)
def med(v, j=7):
    p = np.pad(v, (j // 2, j // 2), mode="edge")
    return np.array([np.median(p[i:i + j]) for i in range(len(v))])
def mm(v, j=9):
    k = np.ones(j) / j
    return np.convolve(np.pad(v, (j // 2, j // 2), mode="edge"), k, mode="valid")
suave = np.stack([mm(med(cheio[:, c])) for c in range(4)], axis=1)
pontos = [{"f": i, "x": round(float(s[0]), 4), "y": round(float(s[1]), 4), "w": round(float(s[2]), 4), "h": round(float(s[3]), 4)} for i, s in enumerate(suave)]
json.dump({"fps": fps, "pontos": pontos}, open(saida, "w"))
print(n, "frames, fps", fps)
