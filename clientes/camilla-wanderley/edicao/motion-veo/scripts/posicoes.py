"""Mede onde está o objeto (alfa > 200) no 1º quadro de cada motion/*_alfa.webm e grava posicoes.json
pro Remotion escalar e centrar cada animação no espaço aberto da cena."""
import json, os, subprocess, tempfile, glob
import cv2, numpy as np
FF = r"C:/Users/tamar/TK FILMES/projetos/curso-mestres-ai/remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
PASTA = r"C:/Users/tamar/TK FILMES/clientes/camilla-wanderley/edicao/remotion/public/motion"
pos = {}
for w in sorted(glob.glob(os.path.join(PASTA, "m*_alfa.webm"))):
    nome = os.path.basename(w).split("_")[0]
    t = tempfile.mktemp(suffix=".png")
    subprocess.run([FF, "-y", "-v", "error", "-c:v", "libvpx-vp9", "-i", w, "-frames:v", "1", "-pix_fmt", "rgba", t], check=True)
    a = cv2.imread(t, cv2.IMREAD_UNCHANGED)[..., 3]
    ys, xs = np.where(a > 200)
    pos[nome] = {"x0": int(xs.min()), "x1": int(xs.max()), "y0": int(ys.min()), "y1": int(ys.max())}
    os.remove(t)
    print(nome, pos[nome])
json.dump(pos, open(os.path.join(PASTA, "posicoes.json"), "w"), indent=1)
