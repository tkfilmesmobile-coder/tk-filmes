"""Stories da palestra de Outubro Rosa (sexta, 02/10/2026) pro perfil do escritório.
Estética do escritório (Inter, limpo, logo) em tons de rosa. Foto em cima, texto embaixo: nunca texto em rosto.
uso: python gerar.py   -> grava stories/NN.png/.jpg e _overlay-video.png (texto do story em vídeo)
"""
import pathlib
from playwright.sync_api import sync_playwright
from PIL import Image

AQUI = pathlib.Path(__file__).resolve().parent
FOTOS = (AQUI / "fotos").as_uri()
MARCA = (AQUI.parent.parent / "marca").as_uri()
F = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">'
CSS = """*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;font-family:'Inter',sans-serif;background:#f5e9e9;color:#2b1a20}
.ft{position:absolute;left:0;top:0;width:1080px;height:1180px;overflow:hidden}
.ft img{width:100%;height:100%;object-fit:cover}
.ft:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(43,26,32,.35) 0%,rgba(43,26,32,0) 16%,rgba(245,233,233,0) 72%,#f5e9e9 100%)}
.grade{position:absolute;left:0;top:0;width:1080px;height:1180px;display:grid;gap:10px;background:#f5e9e9}
.grade img{width:100%;height:100%;min-height:0;min-width:0;object-fit:cover;display:block}
.grade:after{content:"";position:absolute;left:0;right:0;bottom:0;height:200px;background:linear-gradient(180deg,rgba(245,233,233,0),#f5e9e9)}
.logo{position:absolute;left:72px;top:150px;width:150px;z-index:3}
.pag{position:absolute;right:72px;top:178px;font-size:24px;letter-spacing:.2em;color:#fff;font-weight:600;z-index:3}
.b{position:absolute;left:84px;right:84px;top:1130px;z-index:2}
.k{display:flex;align-items:center;gap:16px;font-size:24px;letter-spacing:.3em;font-weight:600;color:#b05f78}
.k:before{content:"";width:46px;height:2px;background:#b05f78}
h1{margin-top:22px;font-size:92px;line-height:1.02;letter-spacing:-.045em;font-weight:200}
h1 b{font-weight:800;color:#a24e69}
.t{margin-top:30px;font-size:38px;line-height:1.45;color:#4a3239;max-width:900px}
.t b{font-weight:700;color:#2b1a20}
.assin{position:absolute;left:84px;bottom:270px;font-size:22px;letter-spacing:.25em;font-weight:600;color:#b05f78}
.laco{position:absolute;right:84px;bottom:255px;width:54px;opacity:.9}
"""

LACO = """<svg class="laco" viewBox="0 0 60 90"><path d="M30 34 C14 14 18 2 30 2 C42 2 46 14 30 34 Z M30 34 L10 86 L20 88 L30 50 L40 88 L50 86 Z" fill="none" stroke="#b05f78" stroke-width="4" stroke-linejoin="round"/></svg>"""


def topo(n, total, branco=True):
    logo = "logo-claro-recortado.png" if branco else "logo-escuro-recortado.png"
    cor = "" if branco else ' style="color:#a24e69"'
    return f'<img class="logo" src="{MARCA}/{logo}"><div class="pag"{cor}>{n}/{total}</div>'


def foto(arq, pos):
    return f'<div class="ft"><img src="{FOTOS}/{arq}" style="object-position:{pos}"></div>'


def grade(fotos, cols, rows):
    imgs = "".join(f'<img src="{FOTOS}/{a}" style="object-position:{p};{extra}">' for a, p, extra in fotos)
    return f'<div class="grade" style="grid-template-columns:{cols};grid-template-rows:{rows}">{imgs}</div>'


def texto(kicker, titulo, t):
    return f'<div class="b"><div class="k">{kicker}</div><h1>{titulo}</h1><p class="t">{t}</p></div>'


RODAPE = f'<div class="assin">TAMARA CHAGAS ADVOCACIA</div>{LACO}'

TELAS = [
    foto("evento-25.jpg", "50% 30%") + texto(
        "OUTUBRO ROSA · SEXTA, 02/10",
        "Sexta foi dia de <b>cuidar da gente.</b>",
        "A gente parou o escritório pra um momento só nosso, das mulheres que fazem a Tamara Chagas Advocacia acontecer todos os dias 💗"),
    None,
    foto("evento-15.jpg", "50% 45%") + texto(
        "UMA CONVERSA QUE CUIDA",
        "Informação <b>também é cuidado.</b>",
        "Recebemos uma palestra linda sobre a <b>prevenção do câncer de mama</b>: os sinais que o corpo dá, a mamografia e a importância de não deixar pra depois."),
    None,
    foto("evento-16.jpg", "50% 22%") + texto(
        "NA PRÁTICA",
        "Aprendemos <b>o autoexame.</b>",
        "Passo a passo, com calma e sem vergonha nenhuma. E ficou o recado: o autoexame ajuda a conhecer o corpo, mas <b>não substitui a consulta e os exames.</b>"),
    None,
    grade([("evento-21.jpg", "55% 30%", "grid-row:1/3"), ("evento-22.jpg", "50% 40%", ""), ("evento-20.jpg", "40% 35%", "")],
          "1fr 1fr", "585px 585px") + texto(
        "OUVIDOS ATENTOS",
        "Coração <b>aberto.</b>",
        "Cada uma ali cuida de tantas famílias no dia a dia. Nesse dia, o cuidado foi com elas."),
    grade([("evento-13.jpg", "50% 25%", ""), ("evento-12.jpg", "60% 30%", ""), ("evento-14.jpg", "60% 42%", "grid-column:1/3")],
          "1fr 1fr", "585px 585px") + texto(
        "FOI DE VERDADE",
        "Teve riso, <b>teve emoção.</b>",
        "Teve quem riu, teve quem chorou, e todo mundo saiu de lá um pouquinho diferente."),
    None,
    foto("evento-18.jpg", "50% 45%") + texto(
        "UM RECADO PRA VOCÊ",
        "Cuide de você. <b>Faça seus exames.</b>",
        "Esse cuidado também é pra você 💗 Obrigada à nossa palestrante por tanto carinho. Marque uma mulher que você ama."),
]

# stories em vídeo: trechos do vídeo bruto, com a fala dela em legenda (tempos absolutos do vídeo, transcrição whisper)
VIDEO = "C:/Users/tamar/Downloads/Mobile Devices/copy_44F048E2-75A7-4D9A-B327-46AE14D48DC9.MOV"
VIDEOS = {
    2: {"ini": 0, "fim": 20, "kicker": "A PALESTRA", "falas": [(0, 20, "“Todo guerreiro carrega uma marca. <b>E é verdade.</b>”")]},
    4: {"ini": 20, "fim": 40, "kicker": "A HISTÓRIA DELA", "falas": [
        (20, 27.5, "“A marca do guerreiro pode estar <b>no corpo físico.</b>”"),
        (27.5, 31, "“Como? <b>Eu mostro bem aqui.</b>”"),
        (31, 36, "“Eu não peguei de outras pessoas. <b>Eu trago a minha história.</b>”"),
        (36, 40, "“É fácil? <b>Não.</b>”")]},
    6: {"ini": 57, "fim": 73, "kicker": "PRA REFLETIR", "falas": [
        (57, 63, "“O seco é processo. <b>O verde, propósito.</b>”"),
        (63, 73, "“As pessoas ainda têm medo, vergonha, <b>e associam câncer à morte.</b>”")]},
    9: {"ini": 100, "fim": 115, "kicker": "E NO FINAL", "titulo": "Terminou <b>em abraço.</b>",
        "texto": "O momento mais bonito do dia ficou aqui 💗"},
}

PAINEL = '<div style="position:absolute;left:0;right:0;bottom:0;height:760px;background:linear-gradient(180deg,rgba(245,233,233,0) 0%,rgba(245,233,233,.9) 40%,#f5e9e9 62%)"></div>'


def overlay_fala(v, fala):
    if fala is None:
        return PAINEL + f'<div class="b" style="top:1330px"><div class="k">{v["kicker"]}</div><h1 style="font-size:84px">{v["titulo"]}</h1><p class="t" style="font-size:36px">{v["texto"]}</p></div>'
    return PAINEL + f'<div class="b" style="top:1330px"><div class="k">{v["kicker"]}</div><h1 style="font-size:58px;line-height:1.15;letter-spacing:-.03em;font-weight:300">{fala}</h1></div>'


FF = "C:/Users/tamar/AppData/Roaming/Python/Python314/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe"


def montar_video(n, v, pngs):
    import subprocess
    ini, fim = v["ini"], v["fim"]; dur = fim - ini
    cmd = [FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", str(ini), "-t", str(dur), "-i", VIDEO]
    for png, _, _ in pngs: cmd += ["-i", str(png)]
    cadeia, ult = [], "0:v"
    for k, (_, a, b) in enumerate(pngs, 1):
        cadeia.append(f"[{ult}][{k}:v]overlay=0:0:enable='between(t,{a - ini:.2f},{b - ini:.2f})'[v{k}]"); ult = f"v{k}"
    cadeia.append(f"[{ult}]format=yuv420p[vf]")
    cadeia.append(f"[0:a]afade=t=in:d=0.4,afade=t=out:st={dur - 0.8}:d=0.8[af]")
    cmd += ["-filter_complex", ";".join(cadeia), "-map", "[vf]", "-map", "[af]", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-r", "30", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(AQUI / "stories" / f"{n:02d}.mp4")]
    subprocess.run(cmd, check=True)


def main():
    out = AQUI / "stories"; out.mkdir(exist_ok=True)
    for velho in out.glob("*"):
        velho.unlink()
    tmp = AQUI / "_overlays"; tmp.mkdir(exist_ok=True)
    total = len(TELAS)
    with sync_playwright() as p:
        b = p.chromium.launch()

        def render(corpo, destino, transparente=False):
            bg = "<style>body{background:transparent}</style>" if transparente else ""
            h = destino.with_suffix(".html")
            h.write_text(f'<!doctype html><html><head><meta charset="utf-8">{F}<style>{CSS}</style>{bg}</head><body>{corpo}</body></html>', encoding="utf8")
            pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.goto(h.as_uri())
            pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready")
            pg.screenshot(path=str(destino), omit_background=transparente); pg.close(); h.unlink()

        for i, corpo in enumerate(TELAS, 1):
            if corpo is None:
                v = VIDEOS[i]; pngs = []
                falas = v.get("falas") or [(v["ini"], v["fim"], None)]
                for k, (a, bb, fala) in enumerate(falas, 1):
                    png = tmp / f"{i:02d}-{k}.png"
                    render(topo(i, total) + overlay_fala(v, fala) + RODAPE, png, transparente=True)
                    pngs.append((png, a, bb))
                montar_video(i, v, pngs)
                continue
            png = out / f"{i:02d}.png"
            render(topo(i, total) + corpo + RODAPE, png)
            Image.open(png).convert("RGB").save(out / f"{i:02d}.jpg", quality=92); png.unlink()
        b.close()
    print("ok", out)


if __name__ == "__main__":
    main()
