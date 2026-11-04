"""Recorta a menina do fundo (RobustVideoMatting, ONNX na CPU) nas cenas onde entram animais grandes ou linhas
de velocidade atrás dela. Cada cena vira um .mov ProRes 4444 com transparência (a menina por cima de tudo),
e a caixa dela quadro a quadro vai pra um JSON (posição e direção da corrida).
Saída: ../video/public/midia/recorte/<cena>.mov e ../video/src/corpo.json
Modelo: %LOCALAPPDATA%/Programs/modelos/rvm_mobilenetv3_fp32.onnx (github.com/PeterL1n/RobustVideoMatting, v1.0.0)
"""
import json
import os
import subprocess
import sys
import time

import cv2
import numpy as np
import onnxruntime as ort

AQUI = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.join(AQUI, "..", "video", "public", "midia", "video.mp4")
SAIDA = os.path.join(AQUI, "..", "video", "public", "midia", "recorte")
JSON = os.path.join(AQUI, "..", "video", "src", "corpo.json")
MODELO = os.path.join(os.environ["LOCALAPPDATA"], "Programs", "modelos", "rvm_mobilenetv3_fp32.onnx")
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
FPS = 24
# cenas (segundos, dos cortes do vídeo): nome, início, fim
CENAS = [
    ("balanco", 0.0, 4.583), ("caminho", 12.792, 15.542), ("vemai", 15.542, 16.667), ("corrida", 16.667, 18.333),
    ("ponte", 22.958, 24.917), ("raios", 24.917, 26.75), ("final", 38.292, 44.33),
]
so = sys.argv[1:]  # opcional: só algumas cenas

os.makedirs(SAIDA, exist_ok=True)
opc = ort.SessionOptions()
opc.intra_op_num_threads = max(2, (os.cpu_count() or 4) - 2)
sess = ort.InferenceSession(MODELO, opc, providers=["CPUExecutionProvider"])
cap = cv2.VideoCapture(VIDEO)
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
corpo = json.load(open(JSON)) if os.path.exists(JSON) else {}
corpo.setdefault("caixas", [None] * total)

for nome, de, ate in CENAS:
    if so and nome not in so:
        continue
    f0, f1 = round(de * FPS), min(total, round(ate * FPS))
    t0 = time.time()
    cap.set(cv2.CAP_PROP_POS_FRAMES, f0)
    ok, quadro = cap.read()
    h, w = quadro.shape[:2]
    saida = os.path.join(SAIDA, f"{nome}.mov")
    enc = subprocess.Popen([FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{w}x{h}", "-r", str(FPS), "-i", "-",
                            "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-vendor", "apl0", saida],
                           stdin=subprocess.PIPE)
    rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4
    dr = np.array([0.25], np.float32)
    cap.set(cv2.CAP_PROP_POS_FRAMES, f0)
    for i in range(f0, f1):
        ok, quadro = cap.read()
        if not ok:
            break
        rgb = cv2.cvtColor(quadro, cv2.COLOR_BGR2RGB)
        src = (rgb.astype(np.float32) / 255).transpose(2, 0, 1)[None]
        voltas = 4 if i == f0 else 1  # aquece a memória do modelo no 1º quadro da cena
        for _ in range(voltas):
            _, pha, *rec = sess.run(None, {"src": src, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": dr})
        a = np.clip((pha[0, 0] - 0.04) / 0.92, 0, 1)
        a8 = (a * 255).astype(np.uint8)
        rgba = np.dstack([rgb * (a8[..., None] > 0), a8])
        enc.stdin.write(rgba.astype(np.uint8).tobytes())
        ys, xs = np.where(a8 > 128)
        corpo["caixas"][i] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())] if len(xs) > 500 else None
    enc.stdin.close()
    enc.wait()
    print(f"{nome}: {f1 - f0} quadros em {time.time() - t0:.0f}s -> {saida}", flush=True)
    json.dump(corpo, open(JSON, "w"))
print("pronto")
