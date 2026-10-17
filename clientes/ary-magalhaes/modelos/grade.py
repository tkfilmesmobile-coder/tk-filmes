# Tratamentos de cor das peças da Ary.
# "editorial" = ref 07 (stories editoriais de skincare): dessaturado, quente, preto levantado, granulação de filme. (2026-10-12)
import random
from PIL import Image, ImageEnhance

_graos = {}
def _grao(size, i):
    k = (size, i % 4)
    if k not in _graos:
        random.seed(i)
        _graos[k] = Image.effect_noise(size, 22).convert("RGB")
    return _graos[k]

def editorial(im, i=0):
    im = im.convert("RGB")
    # revisão 2026-10-12: mais saturação e contraste (a 1ª versão ficou apagada demais)
    im = ImageEnhance.Color(im).enhance(1.02)
    im = Image.blend(im, Image.new("RGB", im.size, (176, 138, 100)), .05)
    im = ImageEnhance.Contrast(im).enhance(1.1)
    im = im.point(lambda v: int(6 + v * .975))
    return Image.blend(im, _grao(im.size, i), .028)
