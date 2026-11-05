"""Tratamento cinematográfico das fontes do vídeo oficial do Natal (pedido da Talyta, 05/11/2026).
Cadeia: redução de ruído (hqdn3d, leve no espaço e no tempo) -> curva em S suave com pretos erguidos e altas roladas
-> sombras frias e altas quentes (colorbalance) -> verde mais escuro e menos amarelo, vermelho do veludo profundo
(hue/huesat) -> saturação leve -> nitidez adaptativa (cas).
uso:
  python scripts/cor.py teste <saida.jpg> <video>:<t> [<video>:<t> ...]   (antes x depois lado a lado)
  python scripts/cor.py tratar <entrada.mp4> <saida.mp4>
"""
import subprocess, sys, pathlib, tempfile
from PIL import Image, ImageDraw

FF = r"C:\Users\kumyt\tools\python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
COR = ("hqdn3d=2.5:2:4:4,"
       "curves=master='0/0.035 0.18/0.16 0.5/0.525 0.82/0.865 1/0.97',"
       "colorbalance=rs=-0.03:gs=0.0:bs=0.05:rm=0.02:gm=-0.01:bm=-0.01:rh=0.05:gh=0.02:bh=-0.05,"
       "huesaturation=hue=-6:saturation=-0.12:colors=y+g,"
       "huesaturation=saturation=0.08:intensity=-0.02:colors=r,"
       "eq=saturation=1.05,"
       "cas=0.45")

modo = sys.argv[1]
if modo == "teste":
    out, itens = sys.argv[2], sys.argv[3:]
    tmp = pathlib.Path(tempfile.mkdtemp())
    linhas = []
    for k, it in enumerate(itens):
        v, t = it.rsplit(":", 1)
        a, b = tmp / f"{k}a.png", tmp / f"{k}b.png"
        subprocess.run([FF, "-y", "-loglevel", "error", "-ss", t, "-i", v, "-frames:v", "1", "-vf", "scale=960:-2", str(a)], check=True)
        subprocess.run([FF, "-y", "-loglevel", "error", "-ss", t, "-i", v, "-frames:v", "1", "-vf", f"scale=960:-2,{COR}", str(b)], check=True)
        ia, ib = Image.open(a).convert("RGB"), Image.open(b).convert("RGB")
        row = Image.new("RGB", (ia.width * 2, ia.height)); row.paste(ia, (0, 0)); row.paste(ib, (ia.width, 0))
        d = ImageDraw.Draw(row); d.text((8, 8), "antes", fill=(255, 255, 0)); d.text((ia.width + 8, 8), "depois", fill=(255, 255, 0))
        linhas.append(row)
    s = Image.new("RGB", (linhas[0].width, sum(r.height for r in linhas)))
    y = 0
    for r in linhas:
        s.paste(r, (0, y)); y += r.height
    s.save(out, quality=90)
    print("ok", out)
elif modo == "tratar":
    ent, sai = sys.argv[2], sys.argv[3]
    subprocess.run([FF, "-y", "-loglevel", "error", "-i", ent, "-map", "0:v:0", "-vf", f"{COR},format=yuv420p", "-c:v", "libx264", "-crf", "14",
                    "-preset", "medium", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
                    "-movflags", "+faststart", sai], check=True)
    print("ok", sai)
