"""Rastreia o rosto (YuNet) num vídeo SDR, a cada 3 quadros, em coordenadas de 1080x1920.
Também mede a boca aberta (distância entre os cantos da boca e o nariz não serve; usa a altura do rosto) — não:
só centro e tamanho do rosto. Uso: python rosto.py <nome>  →  midia/rosto/<nome>.json
"""
import json, os, sys
import cv2
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
YUNET = os.path.join(os.environ["LOCALAPPDATA"], "Programs", "modelos", "yunet.onnx")


def main(nome):
    cap = cv2.VideoCapture(os.path.join(AQUI, "midia", "sdr", nome + ".mp4"))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    det = cv2.FaceDetectorYN.create(YUNET, "", (540, 960), 0.6, 0.3, 5000)
    pts, f = [], 0
    while True:
        ok, img = cap.read()
        if not ok:
            break
        if f % 3 == 0:
            p = cv2.resize(img, (540, 960))
            _, faces = det.detect(p)
            if faces is not None and len(faces):
                x, y, w, h = faces[0][:4]
                pts.append([round(f / fps, 3), round(float(x + w / 2) * 2, 1), round(float(y + h / 2) * 2, 1),
                            round(float(w) * 2, 1), round(float(h) * 2, 1)])
        f += 1
    os.makedirs(os.path.join(AQUI, "midia", "rosto"), exist_ok=True)
    json.dump({"fps": fps, "pts": pts}, open(os.path.join(AQUI, "midia", "rosto", nome + ".json"), "w"))
    a = np.array(pts)
    print(nome, len(pts), "amostras; centro médio", a[:, 1].mean().round(), a[:, 2].mean().round(),
          "altura do rosto", a[:, 4].mean().round())


if __name__ == "__main__":
    main(sys.argv[1])
