"""Extrai quadros dos vídeos da diária (versão com o color grade da cliente) pra usar como foto em post.
Uso: python quadros_fotos.py <pasta saída> IMG_6626:10 IMG_6615:55 ...  (segundos do vídeo original)
Grava <IMG>_<seg>.jpg (1080x1920, qualidade 95) e _folha.jpg com todos."""
import json, os, sys
import cv2
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
MIDIA = os.path.join(AQUI, "..", "perfil-video", "public", "midia", "2026-10-23")
JAN = json.load(open(os.path.join(MIDIA, "grade", "janelas.json"), encoding="utf-8"))


def quadro(arq, seg):
    for a, b, nome in JAN.get(arq, []):
        if a <= seg <= b:
            cap = cv2.VideoCapture(os.path.join(MIDIA, "grade", nome))
            cap.set(cv2.CAP_PROP_POS_MSEC, (seg - a) * 1000)
            ok, img = cap.read()
            if ok:
                return img, "grade"
    cap = cv2.VideoCapture(os.path.join(MIDIA, "sdr", arq + ".mp4"))  # fora das janelas: sem o grade
    cap.set(cv2.CAP_PROP_POS_MSEC, seg * 1000)
    ok, img = cap.read()
    return (img, "sdr") if ok else (None, None)


out = sys.argv[1]
os.makedirs(out, exist_ok=True)
thumbs = []
for item in sys.argv[2:]:
    arq, seg = item.split(":")
    img, origem = quadro(arq, float(seg))
    if img is None:
        print("sem quadro", item)
        continue
    nome = f"{arq}_{float(seg):05.1f}".replace(".", "-")
    cv2.imwrite(os.path.join(out, nome + ".jpg"), img, [cv2.IMWRITE_JPEG_QUALITY, 95])
    t = cv2.resize(img, (216, 384))
    cv2.putText(t, f"{nome} {origem}", (4, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 255, 255), 1, cv2.LINE_AA)
    thumbs.append(t)
col = 8
while len(thumbs) % col:
    thumbs.append(np.full((384, 216, 3), 255, np.uint8))
linhas = [np.hstack(thumbs[i:i + col]) for i in range(0, len(thumbs), col)]
cv2.imwrite(os.path.join(out, "_folha.jpg"), np.vstack(linhas), [cv2.IMWRITE_JPEG_QUALITY, 85])
print(len(sys.argv) - 2, "quadros")
