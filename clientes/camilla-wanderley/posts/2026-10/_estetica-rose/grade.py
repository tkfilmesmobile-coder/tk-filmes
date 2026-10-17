"""Tratamento de foto da estética rosé: clara, limpa e viva (sem véu rosa por cima).
As pessoas são separadas do fundo (rembg, fotos/<n>_mask.png); só o FUNDO vira um ambiente claro
bege-rosado (a parede de madeira some); as pessoas ganham só exposição e um toque rosado nas luzes."""
import sys, numpy as np
from PIL import Image, ImageFilter

W = np.array([0.299, 0.587, 0.114], np.float32)

def grade(n):
    im = np.asarray(Image.open(f"fotos/{n}.jpg").convert("RGB")).astype(np.float32) / 255
    m = Image.open(f"fotos/{n}_mask.png").convert("L").filter(ImageFilter.GaussianBlur(6))
    pessoa = (np.asarray(m).astype(np.float32) / 255)[..., None]
    # fundo: desfoca de leve, tira cor e leva pra um bege-rosado claro mantendo a textura suave
    fundo = np.asarray(Image.fromarray((im * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
    lf = (fundo @ W)[..., None]
    claro = np.array([0.975, 0.905, 0.88], np.float32)
    fundo = claro * (0.93 + 0.32 * (lf - lf.mean()))  # textura discreta
    # pessoas: levanta sombras/meios-tons (high key) sem estourar
    gente = 1 - (1 - im) ** 1.22
    gente = gente * 0.95 + 0.04
    lg = (gente @ W)[..., None]
    gente = lg + (gente - lg) * 0.92
    gente = gente * (1 + (np.array([1.03, 0.99, 0.995], np.float32) - 1) * np.clip((lg - 0.5) / 0.35, 0, 1))
    # luz do refletor: amarelo forte na pele vira um tom mais rosado e menos saturado
    hsv = np.asarray(Image.fromarray((np.clip(gente, 0, 1) * 255).astype(np.uint8)).convert("HSV")).astype(np.float32) / 255
    h, sat = hsv[..., 0] * 360, hsv[..., 1]
    amarelo = (np.clip(1 - np.abs(h - 45) / 18, 0, 1) * np.clip((sat - 0.35) / 0.25, 0, 1))[..., None]
    lg = (gente @ W)[..., None]
    pele = lg + (gente - lg) * 0.55
    pele = pele * np.array([1.04, 0.97, 0.96], np.float32)
    gente = gente * (1 - amarelo * 0.8) + pele * (amarelo * 0.8)
    out = gente * pessoa + fundo * (1 - pessoa)
    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(f"fotos/{n}_g.jpg", quality=94)

if __name__ == "__main__":
    for n in sys.argv[1:]:
        grade(n); print(n)
