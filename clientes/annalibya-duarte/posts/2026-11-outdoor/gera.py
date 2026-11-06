"""Outdoor da Dra. Anna Libya (esboço, 2026-11-04), na estética da referência que a Talyta mandou
(fundo bege, texto terracota com palavras finas e em negrito, arcos finos atrás da pessoa).

Técnico (pedido da Talyta):
- escala 1:10: 900 x 300 mm de corte + 10 mm de sangria em volta = 920 x 320 mm;
- 300 DPI no arquivo em escala (dá 30 DPI no tamanho real);
- CMYK: fundo e foto viram uma imagem CMYK (perfil RSWOP, o único CMYK instalado aqui); textos em vetor CMYK;
- margem de segurança: texto e assinatura a 40 mm ou mais do corte;
- textos convertidos em curvas (contornos das fontes via fontTools, nenhuma fonte embutida);
- PDF com estrutura PDF/X-1a (caixas de corte e sangria, perfil de saída, sem transparência) + JPEG CMYK 300 DPI.
Foto: IDENTIDADE VISUAL/FOTOS/DSC09470 (jaleco), dentro de um arco, a forma das paredes do consultório.
Uso: python gera.py
"""
import io
import os

import cv2
import fitz
import numpy as np
from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from PIL import Image, ImageCms

AQUI = os.path.dirname(os.path.abspath(__file__))
FOTO = r"H:\Meu Drive\Dra. Annalibya\IDENTIDADE VISUAL\FOTOS\DSC09470-Editar.jpg.jpeg"
ICC_CMYK = r"C:\Windows\System32\spool\drivers\color\RSWOP.icm"
FONTES = r"C:\Windows\Fonts"
SAIDA = os.path.join(AQUI, "saida")
os.makedirs(SAIDA, exist_ok=True)

DPI = 300
SANGRIA = 10.0                      # mm
CORTE_W, CORTE_H = 900.0, 300.0     # mm (escala 1:10 de 9 x 3 m)
W_MM, H_MM = CORTE_W + 2 * SANGRIA, CORTE_H + 2 * SANGRIA
px = lambda mm: int(round(mm * DPI / 25.4))
pt = lambda mm: mm * 72 / 25.4
W, H = px(W_MM), px(H_MM)
# tudo é desenhado em mm a partir do canto do CORTE (sem a sangria)
X = lambda mm: mm + SANGRIA

# cores pensadas em RGB e convertidas pro CMYK pelo mesmo perfil da imagem (o vetor bate com o fundo)
# paleta tirada da foto dela (fundo caramelo do estúdio, bordado dourado do jaleco) na lógica da referência
RGB = {
    "bege": (233, 221, 204),
    "bege_claro": (243, 235, 223),
    "bege_fundo": (224, 209, 189),
    "painel": (240, 231, 218),
    "arco": (219, 201, 178),
    "sombra": (92, 60, 38),
    "terracota": (138, 66, 32),
    "dourado": (184, 137, 77),
}
srgb = ImageCms.createProfile("sRGB")
cmyk_prof = ImageCms.getOpenProfile(ICC_CMYK)
para_cmyk = ImageCms.buildTransform(srgb, cmyk_prof, "RGB", "CMYK", renderingIntent=ImageCms.Intent.PERCEPTUAL)


def cmyk_de(rgb):
    c = ImageCms.applyTransform(Image.new("RGB", (1, 1), rgb), para_cmyk).getpixel((0, 0))
    return tuple(v / 255 for v in c)


CMYK = {k: cmyk_de(v) for k, v in RGB.items()}

# ── 1. cena (imagem): fundo bege nos tons da foto, painel e arco largo atrás, ela recortada com sombra ──
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
# luz suave: mais clara atrás da cabeça dela, um pouco mais quente nas bordas
CAB = (px(X(668)), px(SANGRIA + 105))                     # centro da cabeça na arte
dist = np.sqrt(((xx - CAB[0]) / px(520)) ** 2 + ((yy - CAB[1]) / px(330)) ** 2)
luz = np.clip(1 - dist, 0, 1) ** 1.6
base = np.array(RGB["bege"], np.float32)
claro = np.array(RGB["bege_claro"], np.float32)
borda = np.array(RGB["bege_fundo"], np.float32)
t = np.clip(dist / 1.4, 0, 1)[..., None]
cena = borda * t + base * (1 - t)
cena = cena * (1 - luz[..., None]) + claro * luz[..., None]
# painel vertical de topo arredondado atrás dela (bem sutil, como o retângulo claro da referência)
painel = np.zeros((H, W), np.uint8)
PX0, PX1, PTOP = px(X(560)), px(X(842)), px(SANGRIA + 16)
pr = (PX1 - PX0) // 2
cv2.rectangle(painel, (PX0, PTOP + pr), (PX1, H), 255, -1)
cv2.ellipse(painel, (PX0 + pr, PTOP + pr), (pr, pr), 0, 180, 360, 255, -1, lineType=cv2.LINE_AA)
pa = (painel.astype(np.float32) / 255)[..., None] * 0.55
cena = cena * (1 - pa) + np.array(RGB["painel"], np.float32) * pa
# arco largo, como a faixa curva da referência, passando por trás dela
arco = np.zeros((H, W), np.uint8)
cv2.circle(arco, (px(X(640)), px(SANGRIA + 205)), px(232), 255, px(15), lineType=cv2.LINE_AA)
aa = (arco.astype(np.float32) / 255)[..., None] * 0.9
cena = cena * (1 - aa) + np.array(RGB["arco"], np.float32) * aa

# ela: cabeça, ombros e o começo dos braços cruzados; o corpo sai pela base (sangria)
rec = cv2.imdecode(np.fromfile(os.path.join(SAIDA, "recorte.png"), np.uint8), cv2.IMREAD_UNCHANGED)
fh, fw = rec.shape[:2]
alfa_src = rec[:, :, 3]
topo_cabelo = int(np.nonzero(alfa_src.max(1) > 128)[0][0])
corte_baixo = int(fh * 0.56)                                # peito e começo dos braços cruzados
ALTURA_TOPO = SANGRIA + 20                                  # topo do cabelo a 20 mm do corte
esc = (H - px(ALTURA_TOPO)) / (corte_baixo - topo_cabelo)
rec = rec[topo_cabelo:corte_baixo]
rec = cv2.resize(rec, (int(fw * esc), H - px(ALTURA_TOPO)), interpolation=cv2.INTER_LANCZOS4)
rgb_p = rec[:, :, 2::-1].astype(np.float32)
al_p = rec[:, :, 3].astype(np.float32) / 255
# rosto (x ~46% da foto) na posição da cabeça da arte
ox = CAB[0] - int(0.46 * fw * esc)
oy = px(ALTURA_TOPO)
camada = np.zeros((H, W), np.float32)
pessoa = np.zeros((H, W, 3), np.float32)
x0, x1 = max(ox, 0), min(ox + rec.shape[1], W)
camada[oy:, x0:x1] = al_p[:, x0 - ox:x1 - ox]
pessoa[oy:, x0:x1] = rgb_p[:, x0 - ox:x1 - ox]
# sombra suave projetada no fundo (dá o volume): silhueta deslocada pra esquerda e pra baixo, bem desfocada
q = 8
pequena = cv2.resize(camada, (W // q, H // q), interpolation=cv2.INTER_AREA)
M = np.float32([[1, 0, -px(14) / q], [0, 1, px(5) / q]])
sombra = cv2.warpAffine(pequena, M, (W // q, H // q))
sombra = cv2.GaussianBlur(sombra, (0, 0), px(16) / q)
sombra = cv2.resize(sombra, (W, H), interpolation=cv2.INTER_CUBIC)[..., None] * 0.38
cena = cena * (1 - sombra) + np.array(RGB["sombra"], np.float32) * sombra
# sombra de contato, mais curta e mais firme
contato = cv2.GaussianBlur(cv2.warpAffine(pequena, np.float32([[1, 0, -px(4) / q], [0, 1, px(2) / q]]), (W // q, H // q)), (0, 0), px(3) / q)
contato = cv2.resize(contato, (W, H), interpolation=cv2.INTER_CUBIC)[..., None] * 0.18
cena = cena * (1 - contato) + np.array(RGB["sombra"], np.float32) * contato
cena = cena * (1 - camada[..., None]) + pessoa * camada[..., None]
fundo = cena.clip(0, 255).astype(np.uint8)
del yy, xx, dist, luz, cena, pessoa

img_cmyk = ImageCms.applyTransform(Image.fromarray(fundo, "RGB"), para_cmyk)
buf = io.BytesIO()
# sem ICC embutido: no PDF/X-1a a imagem tem que ser DeviceCMYK (o perfil vai só no OutputIntent)
img_cmyk.save(buf, "JPEG", quality=95, dpi=(DPI, DPI))
print("fundo CMYK:", img_cmyk.size, img_cmyk.mode)


# ── 2. textos em curvas ──────────────────────────────────────────────────────────────────────────
class Caminho(BasePen):
    """Grava os contornos dos glifos em coordenadas da página (pt, y pra baixo), só com retas e cúbicas."""

    def __init__(self, glyphset, ox, oy, esc):
        super().__init__(glyphset)
        self.ox, self.oy, self.esc, self.subs, self.atual = ox, oy, esc, [], None

    def _p(self, p):
        return fitz.Point(self.ox + p[0] * self.esc, self.oy - p[1] * self.esc)

    def _moveTo(self, p):
        self.atual = [("m", self._p(p))]
        self.subs.append(self.atual)

    def _lineTo(self, p):
        self.atual.append(("l", self._p(p)))

    def _curveToOne(self, a, b, c):
        self.atual.append(("c", self._p(a), self._p(b), self._p(c)))

    def _qCurveToOne(self, a, b):
        p0 = self._getCurrentPoint()
        c1 = (p0[0] + 2 / 3 * (a[0] - p0[0]), p0[1] + 2 / 3 * (a[1] - p0[1]))
        c2 = (b[0] + 2 / 3 * (a[0] - b[0]), b[1] + 2 / 3 * (a[1] - b[1]))
        self._curveToOne(c1, c2, b)

    def _closePath(self):
        pass


_fontes = {}


def fonte(nome):
    if nome not in _fontes:
        _fontes[nome] = TTFont(os.path.join(FONTES, nome))
    return _fontes[nome]


def largura(nome, texto, tam_mm, track=0.0):
    f = fonte(nome)
    upm, cmap, hmtx = f["head"].unitsPerEm, f.getBestCmap(), f["hmtx"]
    return sum(hmtx[cmap[ord(ch)]][0] for ch in texto) * tam_mm / upm + track * tam_mm * (len(texto) - 1)


def texto(page, nome, s, tam_mm, x_mm, base_mm, cor, track=0.0):
    """Desenha `s` em curvas a partir de (x, linha de base), em mm do corte. Devolve a largura em mm."""
    f = fonte(nome)
    upm, cmap, hmtx, gs = f["head"].unitsPerEm, f.getBestCmap(), f["hmtx"], f.getGlyphSet()
    esc = pt(tam_mm) / upm
    x = pt(X(x_mm))
    y = pt(SANGRIA + base_mm)
    forma = page.new_shape()
    for ch in s:
        g = cmap[ord(ch)]
        cam = Caminho(gs, x, y, esc)
        gs[g].draw(cam)
        for sub in cam.subs:
            ini = sub[0][1]
            ponto = ini
            for seg in sub[1:]:
                if seg[0] == "l":
                    forma.draw_line(ponto, seg[1]); ponto = seg[1]
                else:
                    forma.draw_bezier(ponto, seg[1], seg[2], seg[3]); ponto = seg[3]
            if ponto != ini:
                forma.draw_line(ponto, ini)
        x += hmtx[g][0] * esc + pt(track * tam_mm)
    forma.finish(fill=cor, color=None, width=0, even_odd=False, closePath=True)
    forma.commit()
    return largura(nome, s, tam_mm, track)


doc = fitz.open()
page = doc.new_page(width=pt(W_MM), height=pt(H_MM))
page.insert_image(page.rect, stream=buf.getvalue())
# a PyMuPDF marca o JPEG CMYK como ICCBased; o PDF/X-1a pede DeviceCMYK
for im in page.get_images(full=True):
    doc.xref_set_key(im[0], "ColorSpace", "/DeviceCMYK")

LEVE, FORTE = "segoeuisl.ttf", "seguisb.ttf"      # Segoe UI Semilight e Semibold
SERIF, SERIF_I = "BOD_R.TTF", "BOD_I.TTF"           # Bodoni, como o nome em didone da referência
ML = 50  # margem esquerda do texto (mm do corte; a margem de segurança é 25 a 50 mm)
LARG_MAX = 430
# título: 3 linhas, fino e negrito alternados, como na referência. Escolha da Talyta (2026-11-04), a partir da fala
# dela no vídeo de apresentação ("eu sei que é comum ter medo de dentista")
linhas = [
    [(LEVE, "Sorria")],
    [(FORTE, "sem medo")],
    [(LEVE, "de ir ao "), (FORTE, "dentista.")],
]
tam = 50.0
maior = max(sum(largura(n, t, tam, -0.01) for n, t in ln) for ln in linhas)
tam = min(tam, tam * LARG_MAX / maior)
for i, ln in enumerate(linhas):
    x = ML
    for n, t in ln:
        x += texto(page, n, t, tam, x, 76 + i * tam * 1.04, CMYK["terracota"], track=-0.01)
print(f"título: {tam:.1f} mm")

# assinatura, no desenho da referência: nome em didone caixa alta, especialidade embaixo
# (CFO: nome + CRO em toda peça; o número ainda não veio)
Y = 231
texto(page, SERIF_I, "Dra.", 13, ML, Y - 19, CMYK["terracota"])
texto(page, SERIF, "ANNA LIBYA DUARTE", 23, ML, Y, CMYK["terracota"], track=0.02)
w_nome = largura(SERIF, "ANNA LIBYA DUARTE", 23, 0.02)
forma = page.new_shape()
forma.draw_rect(fitz.Rect(pt(X(ML)), pt(SANGRIA + Y + 6), pt(X(ML + w_nome)), pt(SANGRIA + Y + 6.6)))
forma.finish(fill=CMYK["dourado"], color=None, width=0)
forma.commit()
sub = "CIRURGIÃ-DENTISTA  ·  CRO [Nº A CONFIRMAR]"
tam_sub = 6.6
track_sub = (w_nome - largura(LEVE, sub, tam_sub)) / (tam_sub * (len(sub) - 1))  # mesma largura do nome
texto(page, LEVE, sub, tam_sub, ML, Y + 16, CMYK["terracota"], track=track_sub)
texto(page, LEVE, "Rua Costa Rego, 278 · Centro · União dos Palmares", 7.2, ML, Y + 28, CMYK["terracota"], track=0.02)

# caixas de impressão: mídia = sangria, corte 10 mm pra dentro
page.set_bleedbox(page.mediabox)
mb = page.mediabox
page.set_trimbox(fitz.Rect(mb.x0 + pt(SANGRIA), mb.y0 + pt(SANGRIA), mb.x1 - pt(SANGRIA), mb.y1 - pt(SANGRIA)))

# PDF/X-1a: perfil de saída CMYK + marcas no Info
icc = doc.get_new_xref()
doc.update_object(icc, "<< /N 4 >>")
doc.update_stream(icc, open(ICC_CMYK, "rb").read())
intent = doc.get_new_xref()
doc.update_object(intent, f"<< /Type /OutputIntent /S /GTS_PDFX /OutputConditionIdentifier (CGATS TR 001) "
                          f"/RegistryName (http://www.color.org) /Info (U.S. Web Coated SWOP) /DestOutputProfile {icc} 0 R >>")
doc.xref_set_key(doc.pdf_catalog(), "OutputIntents", f"[{intent} 0 R]")
doc.set_metadata({"title": "Outdoor Dra. Anna Libya Duarte - escala 1:10", "author": "TK Filmes", "creator": "TK Filmes"})
info = doc.xref_get_key(-1, "Info")[1].split()[0]
doc.xref_set_key(int(info), "GTS_PDFXVersion", "(PDF/X-1:2001)")
doc.xref_set_key(int(info), "GTS_PDFXConformance", "(PDF/X-1a:2001)")
doc.xref_set_key(int(info), "Trapped", "/False")
pdf = os.path.join(SAIDA, "outdoor-dra-anna-libya-escala-1-10.pdf")
doc.save(pdf, garbage=3, deflate=True)
print("PDF:", pdf)

# JPEG CMYK 300 DPI (texto já rasterizado) e prévia RGB leve
esc_px = W / doc[0].rect.width  # exatamente W x H pixels (920 x 320 mm a 300 DPI)
pix = doc[0].get_pixmap(matrix=fitz.Matrix(esc_px, esc_px), colorspace=fitz.csCMYK, alpha=False)
Image.frombytes("CMYK", (pix.width, pix.height), pix.samples).save(
    os.path.join(SAIDA, "outdoor-dra-anna-libya-escala-1-10.jpg"), "JPEG", quality=95, dpi=(DPI, DPI),
    icc_profile=open(ICC_CMYK, "rb").read())
prev = doc[0].get_pixmap(dpi=40, alpha=False)
prev.save(os.path.join(SAIDA, "previa.png"))
print("JPEG:", pix.width, "x", pix.height, "px")
