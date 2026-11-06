"""Outdoor da Dra. Anna Libya, v3 (2026-11-04), na linha das 2 referências que a cliente mandou
(fundo escuro na cor da marca, lista de tratamentos à esquerda, ela recortada no centro, logo à direita
com endereço e contato). Mantém a headline que a Talyta escolheu: "Sorria sem medo de ir ao dentista."

Técnico (igual à v2, gera.py):
- escala 1:10: 900 x 300 mm de corte + 10 mm de sangria = 920 x 320 mm, 300 DPI;
- CMYK (perfil CMYK do Adobe, ver ICC_CMYK); fundo + foto numa imagem DeviceCMYK, textos e logo em vetor CMYK;
- margem de segurança: nada de texto a menos de 30 mm do corte;
- tudo em curvas: textos pelas fontes do Windows e a logo pelos contornos do PDF dela (fontes embutidas
  no PDF do Canva, desenhadas glifo a glifo), nenhuma fonte no arquivo final;
- PDF com estrutura PDF/X-1a + JPEG CMYK 300 DPI.
Logo: C:\\Users\\kumyt\\Downloads\\Logo AL.pdf (enviada pela cliente em 2026-11-04), montada em versão vertical.
Uso: python gera_v3.py
"""
import io
import os

import cv2
import numpy as np
import pymupdf as fitz
from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from PIL import Image, ImageCms

AQUI = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(AQUI, "..", "..", "marca", "logo-al.pdf")   # cópia do "Logo AL.pdf" que a cliente mandou
# perfil CMYK do Adobe (vem com o Premiere). O RSWOP do Windows, usado na v2, não segura azul escuro:
# o petróleo da marca virava cinza-marrom. Este devolve as cores da logo com erro de ~1 ponto.
ICC_CMYK = r"C:\Program Files\Adobe\Adobe Premiere Pro 2026\icc\ai_cmyk_default.icc"
ICC_NOME = "Adobe Illustrator Printer Default"
FONTES = r"C:\Windows\Fonts"
SAIDA = os.path.join(AQUI, "saida")
NOME_SAIDA = "outdoor-dra-anna-libya-escala-1-10-v3"

DPI = 300
SANGRIA = 10.0
CORTE_W, CORTE_H = 900.0, 300.0
W_MM, H_MM = CORTE_W + 2 * SANGRIA, CORTE_H + 2 * SANGRIA
px = lambda mm: int(round(mm * DPI / 25.4))
pt = lambda mm: mm * 72 / 25.4
W, H = px(W_MM), px(H_MM)
X = lambda mm: mm + SANGRIA          # mm do corte -> mm da página
Y = lambda mm: mm + SANGRIA

# cores da logo (azul petróleo e dourado, tirados do PDF dela) + variações pro degradê
RGB = {
    "petroleo": (27, 74, 88),
    "escuro": (13, 42, 52),
    "luz": (56, 112, 126),
    "fundo_logo": (7, 28, 36),
    "dourado": (199, 169, 120),
    "branco": (255, 255, 255),
}
srgb = ImageCms.createProfile("sRGB")
para_cmyk = ImageCms.buildTransform(srgb, ImageCms.getOpenProfile(ICC_CMYK), "RGB", "CMYK",
                                    renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC)


def cmyk_de(rgb):
    c = ImageCms.applyTransform(Image.new("RGB", (1, 1), rgb), para_cmyk).getpixel((0, 0))
    return tuple(v / 255 for v in c)


CMYK = {k: cmyk_de(v) for k, v in RGB.items()}
CMYK["branco"] = (0, 0, 0, 0)

# ── a logo: contornos do dente e textos (com as fontes que vieram dentro do PDF) ──────────────────
logo = fitz.open(LOGO)[0]
dente = [d for d in logo.get_drawings() if d.get("fill") and abs(d["fill"][0] - 0.78) < 0.01]
spans = logo.get_texttrace()
_doc_logo = logo.parent
fontes_logo = {}
for f in logo.get_fonts():
    buf = _doc_logo.extract_font(f[0])[3]
    fontes_logo[f[3].split("+")[-1]] = TTFont(io.BytesIO(buf))


def fonte_do_span(sp):
    for nome, f in fontes_logo.items():
        if nome.startswith(sp["font"][:14]):
            return f
    raise KeyError(sp["font"])


def caixa(itens):
    """bbox (x0, y0, x1, y1) de spans do texto ou de desenhos da logo, em pt da logo."""
    xs0, ys0, xs1, ys1 = [], [], [], []
    for it in itens:
        if "chars" in it:
            for c in it["chars"]:
                if c[0] != 32:
                    xs0.append(c[3][0]); ys0.append(c[3][1]); xs1.append(c[3][2]); ys1.append(c[3][3])
        else:
            r = it["rect"]
            xs0.append(r.x0); ys0.append(r.y0); xs1.append(r.x1); ys1.append(r.y1)
    return min(xs0), min(ys0), max(xs1), max(ys1)


nome_logo = [s for s in spans if s["font"].startswith("Baskerville")]
sub_logo = [s for s in spans if s["font"].startswith("Montserrat")]
BX_DENTE = caixa(dente)
BX_NOME = caixa(nome_logo)
BX_SUB = caixa(sub_logo)


def mapa(sx0, sy0, k, dx, dy):
    """Leva um ponto da logo (pt) pra página (pt): (sx0, sy0) vai pra (dx, dy) mm do corte, escala k mm/pt."""
    return lambda p: fitz.Point(pt(X(dx + (p[0] - sx0) * k)), pt(Y(dy + (p[1] - sy0) * k)))


# ── 1. cena (imagem): fundo petróleo com luz atrás dela, dente gigante bem apagado, ela recortada ──
CAB = (px(X(452)), px(Y(80)))       # centro da cabeça dela na arte
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
dist = np.sqrt(((xx - CAB[0]) / px(300)) ** 2 + ((yy - CAB[1]) / px(230)) ** 2)
t = np.clip(dist / 2.2, 0, 1)[..., None] ** 0.9
cena = np.array(RGB["petroleo"], np.float32) * (1 - t) + np.array(RGB["escuro"], np.float32) * t
luz = (np.clip(1 - dist, 0, 1) ** 1.8)[..., None]
cena = cena * (1 - luz) + np.array(RGB["luz"], np.float32) * luz
# fundo mais escuro atrás da logo (pedido da Talyta, 2026-11-04: a logo tem que se destacar do fundo)
CX = 740                            # centro da coluna da logo (mm do corte)
dl = np.sqrt(((xx - px(X(CX))) / px(185)) ** 2 + ((yy - px(Y(135))) / px(150)) ** 2)
fundo_logo = (np.clip(1 - dl, 0, 1) ** 0.8)[..., None] * 0.6
cena = cena * (1 - fundo_logo) + np.array(RGB["fundo_logo"], np.float32) * fundo_logo
del yy, xx, dist, t, luz, dl, fundo_logo


def mascara_dente(altura_mm, cx_mm, topo_mm):
    """O dente da logo rasterizado na resolução da arte (marca d'água)."""
    tmp = fitz.open()
    pg = tmp.new_page(width=pt(W_MM), height=pt(H_MM))
    k = altura_mm / (BX_DENTE[3] - BX_DENTE[1])
    T = mapa(BX_DENTE[0], BX_DENTE[1], k, cx_mm - (BX_DENTE[2] - BX_DENTE[0]) * k / 2, topo_mm)
    desenha_paths(pg, dente, T, (0, 0, 0))
    esc_px = W / pg.rect.width
    pix = pg.get_pixmap(matrix=fitz.Matrix(esc_px, esc_px), colorspace=fitz.csGRAY, alpha=False)
    return 1 - np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width)[:H, :W].astype(np.float32) / 255


def desenha_paths(page, paths, T, cor):
    forma = page.new_shape()
    for d in paths:
        for it in d["items"]:
            if it[0] == "l":
                forma.draw_line(T(it[1]), T(it[2]))
            elif it[0] == "c":
                forma.draw_bezier(T(it[1]), T(it[2]), T(it[3]), T(it[4]))
            elif it[0] == "re":
                r = it[1]
                forma.draw_polyline([T((r.x0, r.y0)), T((r.x1, r.y0)), T((r.x1, r.y1)), T((r.x0, r.y1)), T((r.x0, r.y0))])
        forma.finish(fill=cor, color=None, width=0, even_odd=bool(d.get("even_odd")), closePath=True)
    forma.commit()


# dente gigante atrás dela, como o monograma apagado da referência
md = mascara_dente(330, 452, -18)[..., None] * 0.075
cena = cena * (1 - md) + np.array(RGB["dourado"], np.float32) * md
del md

# ela, da cabeça até a cintura com os braços cruzados; o corpo sai pela base (sangria)
rec = cv2.imdecode(np.fromfile(os.path.join(SAIDA, "recorte.png"), np.uint8), cv2.IMREAD_UNCHANGED)
fh, fw = rec.shape[:2]
topo_cabelo = int(np.nonzero(rec[:, :, 3].max(1) > 128)[0][0])
corte_baixo = int(fh * 0.68)
TOPO = Y(16)                                     # topo do cabelo a 16 mm do corte
esc = (H - px(TOPO)) / (corte_baixo - topo_cabelo)
rec = cv2.resize(rec[topo_cabelo:corte_baixo], (int(fw * esc), H - px(TOPO)), interpolation=cv2.INTER_LANCZOS4)
rgb_p = rec[:, :, 2::-1].astype(np.float32)
al_p = rec[:, :, 3].astype(np.float32) / 255
ox, oy = CAB[0] - int(0.46 * fw * esc), px(TOPO)
camada = np.zeros((H, W), np.float32)
pessoa = np.zeros((H, W, 3), np.float32)
x0, x1 = max(ox, 0), min(ox + rec.shape[1], W)
camada[oy:, x0:x1] = al_p[:, x0 - ox:x1 - ox]
pessoa[oy:, x0:x1] = rgb_p[:, x0 - ox:x1 - ox]
cols = np.nonzero(camada.max(0) > 0.5)[0]
print(f"ela ocupa de {cols[0] * 25.4 / DPI - SANGRIA:.0f} a {cols[-1] * 25.4 / DPI - SANGRIA:.0f} mm")
# volume: um halo claro bem largo em volta dela e uma sombra curta escura colada (separa do fundo)
q = 8
peq = cv2.resize(camada, (W // q, H // q), interpolation=cv2.INTER_AREA)
halo = cv2.resize(cv2.GaussianBlur(peq, (0, 0), px(22) / q), (W, H), interpolation=cv2.INTER_CUBIC)[..., None] * 0.30
cena = cena * (1 - halo) + np.array(RGB["luz"], np.float32) * halo
somb = cv2.warpAffine(peq, np.float32([[1, 0, px(5) / q], [0, 1, px(2) / q]]), (W // q, H // q))
somb = cv2.resize(cv2.GaussianBlur(somb, (0, 0), px(5) / q), (W, H), interpolation=cv2.INTER_CUBIC)[..., None] * 0.35
cena = cena * (1 - somb) + np.array(RGB["escuro"], np.float32) * 0.6 * somb
cena = cena * (1 - camada[..., None]) + pessoa * camada[..., None]
fundo = cena.clip(0, 255).astype(np.uint8)
faixa = camada[px(Y(100)):px(Y(215))].max(0) > 0.3
print(f"entre 100 e 215 mm de altura ela começa em {np.nonzero(faixa)[0][0] * 25.4 / DPI - SANGRIA:.0f} mm")
del cena, pessoa, halo, somb, camada


# ── 2. textos e logo em curvas ───────────────────────────────────────────────────────────────────
class Caminho(BasePen):
    """Contornos de um glifo em pt da página (y pra baixo), só retas e cúbicas."""

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


def glifo(forma, gs, nome_glifo, ox, oy, esc):
    cam = Caminho(gs, ox, oy, esc)
    gs[nome_glifo].draw(cam)
    for sub in cam.subs:
        ini = ponto = sub[0][1]
        for seg in sub[1:]:
            if seg[0] == "l":
                forma.draw_line(ponto, seg[1]); ponto = seg[1]
            else:
                forma.draw_bezier(ponto, seg[1], seg[2], seg[3]); ponto = seg[3]
        if ponto != ini:
            forma.draw_line(ponto, ini)


_fontes = {}


def fonte(nome):
    if nome not in _fontes:
        _fontes[nome] = TTFont(os.path.join(FONTES, nome))
    return _fontes[nome]


def largura(nome, s, tam_mm, track=0.0):
    f = fonte(nome)
    upm, cmap, hmtx = f["head"].unitsPerEm, f.getBestCmap(), f["hmtx"]
    return sum(hmtx[cmap[ord(ch)]][0] for ch in s) * tam_mm / upm + track * tam_mm * (len(s) - 1)


def texto(page, nome, s, tam_mm, x_mm, base_mm, cor, track=0.0):
    """`s` em curvas a partir de (x, linha de base), em mm do corte. Devolve a largura em mm."""
    f = fonte(nome)
    upm, cmap, hmtx, gs = f["head"].unitsPerEm, f.getBestCmap(), f["hmtx"], f.getGlyphSet()
    esc = pt(tam_mm) / upm
    x, y = pt(X(x_mm)), pt(Y(base_mm))
    forma = page.new_shape()
    for ch in s:
        g = cmap[ord(ch)]
        glifo(forma, gs, g, x, y, esc)
        x += hmtx[g][0] * esc + pt(track * tam_mm)
    forma.finish(fill=cor, color=None, width=0, even_odd=False, closePath=True)
    forma.commit()
    return largura(nome, s, tam_mm, track)


def centro(page, nome, s, tam_mm, cx_mm, base_mm, cor, track=0.0):
    return texto(page, nome, s, tam_mm, cx_mm - largura(nome, s, tam_mm, track) / 2, base_mm, cor, track)


def spans_logo(page, sps, T, k, cor):
    """Textos da logo glifo a glifo, nas posições exatas do PDF dela. k = mm da arte por pt da logo."""
    forma = page.new_shape()
    for sp in sps:
        f = fonte_do_span(sp)
        gs, ordem, upm = f.getGlyphSet(), f.getGlyphOrder(), f["head"].unitsPerEm
        esc = sp["size"] * pt(k) / upm
        for uc, gid, origem, _ in sp["chars"]:
            if uc == 32:
                continue
            o = T(origem)
            glifo(forma, gs, ordem[gid], o.x, o.y, esc)
    forma.finish(fill=cor, color=None, width=0, even_odd=False, closePath=True)
    forma.commit()


def dente_em(page, altura_mm, cx_mm, topo_mm, cor):
    k = altura_mm / (BX_DENTE[3] - BX_DENTE[1])
    desenha_paths(page, dente, mapa(BX_DENTE[0], BX_DENTE[1], k, cx_mm - (BX_DENTE[2] - BX_DENTE[0]) * k / 2, topo_mm), cor)


def logo_vertical(page, cor):
    """A logo dela em versão vertical: dente em cima, "Dra. Anna Líbya Duarte" e a linha do CRO embaixo.
    A linha do CRO fica da largura do nome (no original ela é menor), pra ler de longe."""
    dente_em(page, 58, CX, 28, cor)
    k_n = 252 / (BX_NOME[2] - BX_NOME[0])
    topo_nome = 98
    spans_logo(page, nome_logo, mapa(BX_NOME[0], BX_NOME[1], k_n, CX - 126, topo_nome), k_n, cor)
    base_nome = topo_nome + (nome_logo[0]["chars"][0][2][1] - BX_NOME[1]) * k_n
    k_s = 252 / (BX_SUB[2] - BX_SUB[0])
    base_sub_src = sub_logo[0]["chars"][0][2][1]
    base_sub = base_nome + 23
    spans_logo(page, sub_logo, mapa(BX_SUB[0], base_sub_src, k_s, CX - 126, base_sub), k_s, cor)
    return base_nome, base_sub, sub_logo[0]["size"] * k_s


# sombra da logo no fundo: a logo desenhada em preto, desfocada e um pouco deslocada (dá relevo ao dourado)
tmp = fitz.open()
pg = tmp.new_page(width=pt(W_MM), height=pt(H_MM))
logo_vertical(pg, (0, 0, 0))
c0 = px(X(560))                                   # só a coluna da direita
pix = pg.get_pixmap(matrix=fitz.Matrix(W / pg.rect.width, W / pg.rect.width), colorspace=fitz.csGRAY, alpha=False,
                    clip=fitz.Rect(c0 * pg.rect.width / W, 0, pg.rect.width, pg.rect.height))
m = 1 - np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width).astype(np.float32) / 255
m = np.pad(m, ((0, max(0, H - m.shape[0])), (0, max(0, W - c0 - m.shape[1]))))[:H, :W - c0]
m = cv2.warpAffine(m, np.float32([[1, 0, px(0.6)], [0, 1, px(1.0)]]), (m.shape[1], m.shape[0]))
sombra_logo = (np.clip(cv2.GaussianBlur(m, (0, 0), px(0.9)) * 0.85 + cv2.GaussianBlur(m, (0, 0), px(6)) * 0.45, 0, 0.9))[..., None]
reg = fundo[:, c0:].astype(np.float32)
fundo[:, c0:] = (reg * (1 - sombra_logo) + np.array((2, 14, 19), np.float32) * sombra_logo).clip(0, 255).astype(np.uint8)
del tmp, pg, pix, m, sombra_logo, reg

img_cmyk = ImageCms.applyTransform(Image.fromarray(fundo, "RGB"), para_cmyk)
buf = io.BytesIO()
img_cmyk.save(buf, "JPEG", quality=95, dpi=(DPI, DPI))
del fundo, img_cmyk

doc = fitz.open()
page = doc.new_page(width=pt(W_MM), height=pt(H_MM))
page.insert_image(page.rect, stream=buf.getvalue())
for im in page.get_images(full=True):
    doc.xref_set_key(im[0], "ColorSpace", "/DeviceCMYK")

LEVE, FORTE = "GOTHIC.TTF", "GOTHICB.TTF"      # Century Gothic: geométrica como a Montserrat da logo
BR, OURO = CMYK["branco"], CMYK["dourado"]

# ── coluna da esquerda: headline + tratamentos + Instagram ──
ML = 40
tam = 25.0
# headline nova (Talyta, 2026-11-06); a anterior era "Sorria sem medo de ir ao dentista."
l1 = [(LEVE, "Sorriso "), (FORTE, "bonito,")]
l2 = [(LEVE, "é sorriso "), (FORTE, "saudável!")]
maior = max(sum(largura(n, s, tam, -0.01) for n, s in ln) for ln in (l1, l2))
tam = min(tam, tam * 262 / maior)
for i, ln in enumerate((l1, l2)):
    x = ML
    for n, s in ln:
        x += texto(page, n, s, tam, x, 56 + i * tam * 1.12, OURO if n == FORTE else BR, track=-0.01)
print(f"headline: {tam:.1f} mm")
r = page.new_shape()
r.draw_rect(fitz.Rect(pt(X(ML)), pt(Y(96)), pt(X(ML + 46)), pt(Y(97.2))))
r.finish(fill=OURO, color=None, width=0)
r.commit()

# o que ela falou no vídeo de apresentação (restauração, limpeza, clareamento, prótese) + a bio
# (Clínica Geral | Endodontista; canal entra como procedimento, sem o título de especialista)
# + ortodontia e implante (pedido da Talyta, 2026-11-04). 8 itens em 2 colunas de 4
COLUNAS = [["Clínica geral", "Limpeza", "Restauração", "Clareamento"],
           ["Ortodontia", "Implante", "Prótese", "Tratamento de canal"]]
TAM_T, PASSO = 13.5, 22
x_col2 = ML + 15 + max(largura(FORTE, t_, TAM_T) for t_ in COLUNAS[0]) + 16
for c, col in enumerate(COLUNAS):
    xc = ML if c == 0 else x_col2
    for i, t_ in enumerate(col):
        base = 126 + i * PASSO
        dente_em(page, 10.2, xc + 4.5, base - 9.9, OURO)
        fim = xc + 15 + texto(page, FORTE, t_, TAM_T, xc + 15, base, BR)
print(f"lista: 2ª coluna de {x_col2:.0f} a {fim:.0f} mm")

# Instagram: ícone em traço dourado + @
# maior e em negrito (Talyta, 2026-11-06: mais visibilidade pro @)
iy, ix, lado = 214, ML, 17
ic = page.new_shape()
ic.draw_rect(fitz.Rect(pt(X(ix)), pt(Y(iy)), pt(X(ix + lado)), pt(Y(iy + lado))), radius=0.28)
ic.draw_circle(fitz.Point(pt(X(ix + lado / 2)), pt(Y(iy + lado / 2))), pt(lado * 0.24))
ic.finish(color=OURO, fill=None, width=pt(1.7))
ic.draw_circle(fitz.Point(pt(X(ix + lado * 0.76)), pt(Y(iy + lado * 0.24))), pt(1.15))
ic.finish(fill=OURO, color=None, width=0)
ic.commit()
TAM_IG = 15
fim_ig = ix + lado + 6 + texto(page, FORTE, "@draannalibyaduarte", TAM_IG, ix + lado + 6, iy + lado / 2 + TAM_IG * 0.36, BR)
print(f"@ do Instagram: termina em {fim_ig:.0f} mm")

# ── coluna da direita: a logo em versão vertical + endereço + WhatsApp ──
base_nome, base_sub, tam_sub = logo_vertical(page, OURO)
print(f"nome da logo: base {base_nome:.0f} mm | linha do CRO: base {base_sub:.0f} mm, letra de {tam_sub:.1f} mm")

r = page.new_shape()
r.draw_rect(fitz.Rect(pt(X(CX - 60)), pt(Y(base_sub + 15)), pt(X(CX + 60)), pt(Y(base_sub + 15.8))))
r.finish(fill=OURO, color=None, width=0)
r.commit()
# endereço com pontinhos dourados desenhados (o "·" da Century Gothic fica torto entre os espaços)
partes, tam_end, vao = ["Rua Costa Rego, 278", "Centro", "União dos Palmares/AL"], 8.2, 6.0
# em negrito pra ler de longe (pedido da Talyta, 2026-11-04)
total = sum(largura(FORTE, p_, tam_end, 0.01) for p_ in partes) + vao * (len(partes) - 1)
print(f"endereço: {total:.0f} mm de largura")
x, base_end = CX - total / 2, base_sub + 33
for i, p_ in enumerate(partes):
    x += texto(page, FORTE, p_, tam_end, x, base_end, BR, track=0.01)
    if i < len(partes) - 1:
        pto = page.new_shape()
        pto.draw_circle(fitz.Point(pt(X(x + vao / 2)), pt(Y(base_end - tam_end * 0.27))), pt(0.75))
        pto.finish(fill=OURO, color=None, width=0)
        pto.commit()
        x += vao
centro(page, FORTE, "AGENDE PELO WHATSAPP", 7, CX, base_sub + 55, OURO, track=0.2)
centro(page, FORTE, "(82) 99151-6831", 23, CX, base_sub + 82, BR)
print(f"telefone: base {base_sub + 82:.0f} mm")

# caixas de impressão e marcas de PDF/X-1a
page.set_bleedbox(page.mediabox)
mb = page.mediabox
page.set_trimbox(fitz.Rect(mb.x0 + pt(SANGRIA), mb.y0 + pt(SANGRIA), mb.x1 - pt(SANGRIA), mb.y1 - pt(SANGRIA)))
icc = doc.get_new_xref()
doc.update_object(icc, "<< /N 4 >>")
doc.update_stream(icc, open(ICC_CMYK, "rb").read())
intent = doc.get_new_xref()
doc.update_object(intent, f"<< /Type /OutputIntent /S /GTS_PDFX /OutputConditionIdentifier (Custom) "
                          f"/Info ({ICC_NOME}) /DestOutputProfile {icc} 0 R >>")
doc.xref_set_key(doc.pdf_catalog(), "OutputIntents", f"[{intent} 0 R]")
doc.set_metadata({"title": "Outdoor Dra. Anna Libya Duarte - escala 1:10 - v3", "author": "TK Filmes", "creator": "TK Filmes"})
info = doc.xref_get_key(-1, "Info")[1].split()[0]
doc.xref_set_key(int(info), "GTS_PDFXVersion", "(PDF/X-1:2001)")
doc.xref_set_key(int(info), "GTS_PDFXConformance", "(PDF/X-1a:2001)")
doc.xref_set_key(int(info), "Trapped", "/False")
pdf = os.path.join(SAIDA, NOME_SAIDA + ".pdf")
doc.save(pdf, garbage=3, deflate=True)
print("PDF:", pdf)

esc_px = W / doc[0].rect.width
pix = doc[0].get_pixmap(matrix=fitz.Matrix(esc_px, esc_px), colorspace=fitz.csCMYK, alpha=False)
final = Image.frombytes("CMYK", (pix.width, pix.height), pix.samples)
final.save(os.path.join(SAIDA, NOME_SAIDA + ".jpg"), "JPEG", quality=95, dpi=(DPI, DPI),
           icc_profile=open(ICC_CMYK, "rb").read())
# prévia pela conversão do perfil (a da PyMuPDF é ingênua e acinzenta o CMYK)
volta = ImageCms.buildTransform(ImageCms.getOpenProfile(ICC_CMYK), srgb, "CMYK", "RGB",
                                renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC)
ImageCms.applyTransform(final.resize((1840, 640), Image.LANCZOS), volta).save(os.path.join(SAIDA, "previa-v3.png"))
print("JPEG:", pix.width, "x", pix.height, "px")
