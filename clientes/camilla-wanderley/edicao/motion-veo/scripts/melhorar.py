"""Acabamento das animações geradas no Wan (16 fps, 480×832): interpolação por fluxo óptico pra 30 fps
e ampliação 2× com nitidez leve. Roda antes do recorte (scripts/recortar_chroma.py).

Interpolação: para cada instante intermediário, calcula o fluxo óptico (DIS) nos dois sentidos entre os
quadros vizinhos, desloca os dois pra aquele instante e mistura pesando pela distância. Onde os dois
discordam muito (oclusão), puxa pro quadro mais próximo, evitando fantasma.
Uso: python scripts/melhorar.py <entrada.mp4> <saida.mp4> [--fps 30] [--escala 2]
"""
import argparse, os, subprocess, tempfile, shutil
import numpy as np
import cv2

FF = r"C:/Users/tamar/TK FILMES/projetos/curso-mestres-ai/remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
ap = argparse.ArgumentParser()
ap.add_argument("entrada"); ap.add_argument("saida")
ap.add_argument("--fps", type=float, default=30)
ap.add_argument("--escala", type=float, default=2)
a = ap.parse_args()

cap = cv2.VideoCapture(a.entrada)
fps_in = cap.get(cv2.CAP_PROP_FPS)
quadros = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    quadros.append(f)
cap.release()
n = len(quadros)
h, w = quadros[0].shape[:2]
dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
cinza = [cv2.cvtColor(q, cv2.COLOR_BGR2GRAY) for q in quadros]
grade = np.dstack(np.meshgrid(np.arange(w), np.arange(h))).astype(np.float32)


def desloca(img, fluxo, t):
    mapa = grade + fluxo * t
    return cv2.remap(img, mapa[..., 0], mapa[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


fluxos = {}
def fluxo(i, j):
    if (i, j) not in fluxos:
        fluxos[(i, j)] = dis.calc(cinza[i], cinza[j], None)
    return fluxos[(i, j)]


dur = (n - 1) / fps_in
total = int(round(dur * a.fps)) + 1
tmp = tempfile.mkdtemp(prefix="melhorar_")
nw, nh = int(round(w * a.escala / 2) * 2), int(round(h * a.escala / 2) * 2)
for k in range(total):
    pos = k / a.fps * fps_in
    i = min(int(np.floor(pos)), n - 2)
    t = pos - i
    if t < 1e-3:
        q = quadros[i]
    elif t > 1 - 1e-3:
        q = quadros[i + 1]
    else:
        # quadro no instante t: parte de A olhando pra B e de B olhando pra A
        fab, fba = fluxo(i, i + 1), fluxo(i + 1, i)
        a_t = desloca(quadros[i], fba, t)        # A trazido até t
        b_t = desloca(quadros[i + 1], fab, 1 - t)  # B trazido até t
        dif = np.abs(a_t.astype(np.float32) - b_t.astype(np.float32)).mean(axis=2, keepdims=True)
        peso_b = np.clip(t + (dif / 60.0) * (0.5 - (t < 0.5)) * -1, 0, 1)  # oclusão: puxa pro mais próximo
        q = (a_t * (1 - peso_b) + b_t * peso_b).astype(np.uint8)
    q = cv2.resize(q, (nw, nh), interpolation=cv2.INTER_LANCZOS4)
    borrado = cv2.GaussianBlur(q, (0, 0), 1.2)
    q = cv2.addWeighted(q, 1.35, borrado, -0.35, 0)  # nitidez leve (unsharp)
    cv2.imwrite(os.path.join(tmp, f"q{k:05d}.png"), q)
subprocess.run([FF, "-y", "-v", "error", "-framerate", str(a.fps), "-i", os.path.join(tmp, "q%05d.png"),
                "-c:v", "libx264", "-pix_fmt", "yuv444p", "-crf", "12", a.saida], check=True)
shutil.rmtree(tmp)
print(f"{n} quadros a {fps_in:.0f} fps ({w}x{h}) -> {total} quadros a {a.fps:.0f} fps ({nw}x{nh}): {a.saida}")
