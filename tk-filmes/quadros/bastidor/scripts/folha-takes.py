"""Folha de conferência dos takes: 5 quadros por take (uma linha por take), com nome e tempo.
uso: python folha-takes.py <pasta_dos_brutos> <saida_prefixo> [takes_por_folha]
"""
import sys, os, glob, cv2, numpy as np
pasta, pref = sys.argv[1], sys.argv[2]
por = int(sys.argv[3]) if len(sys.argv) > 3 else 10
arqs = sorted(set(glob.glob(os.path.join(pasta, "*.MOV")) + glob.glob(os.path.join(pasta, "*.mov"))))
linhas = []
for a in arqs:
    if os.path.getsize(a) < 200_000: continue
    cap = cv2.VideoCapture(a); fps = cap.get(5) or 30; n = int(cap.get(7)); d = n / fps
    ims = []
    for k in range(5):
        t = d * (k + 0.5) / 5
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, f = cap.read()
        if not ok: f = np.zeros((1920, 1080, 3), np.uint8)
        h, w = f.shape[:2]
        im = cv2.resize(f, (int(170 * w / h), 170)) if h >= w else cv2.resize(f, (170, int(170 * h / w)))
        tela = np.zeros((170, 170 if h < w else im.shape[1], 3), np.uint8); tela[:im.shape[0], :im.shape[1]] = im
        cv2.putText(tela, f"{t:.0f}s", (3, 165), 0, .4, (0, 255, 255), 1)
        ims.append(tela)
    linha = np.hstack(ims)
    cab = np.zeros((170, 120, 3), np.uint8)
    cv2.putText(cab, os.path.splitext(os.path.basename(a))[0], (4, 40), 0, .5, (255, 255, 255), 1)
    cv2.putText(cab, f"{d:.0f}s", (4, 70), 0, .5, (0, 255, 255), 1)
    linhas.append(np.hstack([cab, linha]))
W = max(l.shape[1] for l in linhas)
linhas = [np.pad(l, ((0, 0), (0, W - l.shape[1]), (0, 0))) for l in linhas]
for i in range(0, len(linhas), por):
    cv2.imwrite(f"{pref}-{i // por + 1}.jpg", np.vstack(linhas[i:i + por]), [cv2.IMWRITE_JPEG_QUALITY, 80])
print(len(linhas), "takes")
