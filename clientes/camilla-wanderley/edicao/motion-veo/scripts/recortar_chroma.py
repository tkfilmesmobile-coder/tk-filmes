"""Recorte de chroma verde → vídeo com transparência (WebM VP9 com canal alfa) pra usar na edição.
O Veo não gera alfa: a animação é gerada sobre verde uniforme e este script tira o verde quadro a quadro.

Matte: quanto o verde domina (G − max(R,B)), relativo à cor-chave amostrada nas bordas do quadro.
Bordas suaves (sem serrilhado), limpeza de ruído no fundo, despill (tira o verde que "vaza" na borda
do objeto) e sombra de contato opcional preservada como sombra neutra.
Uso: python scripts/recortar_chroma.py <entrada.mp4> <saida.webm> [--previa <png>] [--fps 30]
"""
import argparse, os, subprocess, tempfile, shutil
import numpy as np
import cv2

FF = r"C:/Users/tamar/TK FILMES/projetos/curso-mestres-ai/remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"

ap = argparse.ArgumentParser()
ap.add_argument("entrada"); ap.add_argument("saida")
ap.add_argument("--previa", default=None)
ap.add_argument("--fps", type=float, default=30)
ap.add_argument("--forca", type=float, default=1.0, help="rigor do recorte (↑ corta mais verde)")
a = ap.parse_args()

tmp = tempfile.mkdtemp(prefix="chroma_")
cap = cv2.VideoCapture(a.entrada)
fps_in = cap.get(cv2.CAP_PROP_FPS)
if not fps_in or fps_in <= 0:
    fps_in = a.fps
chave = None
i = 0
previa_feita = False
while True:
    ok, bgr = cap.read()
    if not ok:
        break
    f = bgr.astype(np.float32) / 255.0
    b, g, r = f[..., 0], f[..., 1], f[..., 2]
    if chave is None:
        # cor-chave = mediana das bordas do primeiro quadro (onde só há fundo)
        borda = np.concatenate([f[:12].reshape(-1, 3), f[-12:].reshape(-1, 3), f[:, :12].reshape(-1, 3), f[:, -12:].reshape(-1, 3)])
        chave = np.median(borda, axis=0)
        dom_chave = chave[1] - (chave[0] + chave[2]) / 2
    # dominância do verde contra a MÉDIA de R e B (com o máximo, fumaça azulada parecia opaca e ficava ciano)
    dom = g - (r + b) / 2
    # alfa: 1 no objeto, 0 no fundo, transição suave
    t0, t1 = dom_chave * 0.08 / a.forca, dom_chave * 0.9 / a.forca
    alfa = 1.0 - np.clip((dom - t0) / max(1e-4, t1 - t0), 0, 1)
    # limpeza: abre ruído do fundo, fecha buracos pequenos, suaviza 1 px
    alfa = cv2.morphologyEx(alfa, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    alfa = cv2.GaussianBlur(alfa, (3, 3), 0)
    # desmistura: em área semitransparente (fumaça, ar, brilho) a cor vista = α·objeto + (1−α)·verde.
    # Recupera a cor real do objeto: F = (C − (1−α)·K) / α. Sem isso a fumaça branca vira ciano.
    K = chave[::-1]  # chave está em BGR; aqui trabalhamos em RGB
    C = np.stack([r, g, b], axis=-1)
    al = np.clip(alfa, 0.06, 1)[..., None]
    rgb = np.clip((C - (1 - alfa[..., None]) * K) / al, 0, 1)
    # despill final: o verde nunca passa do maior entre vermelho e azul (tira halo remanescente)
    rgb[..., 1] = np.minimum(rgb[..., 1], np.maximum(rgb[..., 0], rgb[..., 2]) * 1.02)
    # sombra do fundo verde (escurecido) vira sombra neutra semi-transparente
    lum_chave = float(chave.mean())
    sombra = np.clip((lum_chave - f.mean(axis=2)) / max(1e-4, lum_chave), 0, 1) * (1 - alfa) * 0.6
    alfa_final = np.clip(alfa + sombra, 0, 1)
    rgb = np.where(alfa[..., None] > 0.02, rgb, 0)  # área de sombra pura: preto com alfa parcial
    rgba = np.dstack([rgb[..., 2], rgb[..., 1], rgb[..., 0], alfa_final])  # BGR + A pro OpenCV
    cv2.imwrite(os.path.join(tmp, f"q{i:05d}.png"), (np.clip(rgba, 0, 1) * 255).astype(np.uint8))
    if a.previa and not previa_feita and i >= 15:
        # prévia sobre xadrez pra conferir borda e halo
        h, w = alfa.shape
        xad = ((np.indices((h, w)).sum(axis=0) // 32) % 2)[..., None] * 0.25 + 0.55
        comp = rgb[..., ::-1] * alfa_final[..., None] + xad * (1 - alfa_final[..., None])
        cv2.imwrite(a.previa, (np.clip(comp, 0, 1) * 255).astype(np.uint8))
        previa_feita = True
    i += 1
cap.release()
if i == 0:
    raise SystemExit(f"nenhum quadro lido de {a.entrada}")
subprocess.run([FF, "-y", "-v", "error", "-framerate", str(fps_in), "-i", os.path.join(tmp, "q%05d.png"),
                "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "22", "-auto-alt-ref", "0",
                "-r", str(a.fps), a.saida], check=True)
shutil.rmtree(tmp)
print(f"{i} quadros | cor-chave RGB {np.round(chave[::-1] * 255).astype(int)} -> {a.saida}")
