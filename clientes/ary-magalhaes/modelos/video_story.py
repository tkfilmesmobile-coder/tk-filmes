# Story em vídeo: corta o trecho, converte HDR do iPhone pra SDR, cola o PNG transparente por cima e codifica 1080x1920.
# O ffmpeg do Remotion é enxuto (sem overlay nem rawvideo), por isso passa por sequência de imagens.
# uso: python video_story.py <video> <inicio_s> <duracao_s> <overlay.png> <saida.mp4> [editorial]
import sys, subprocess, tempfile, glob, os
from PIL import Image, ImageEnhance
# correção de cor: o HDR do iPhone convertido puxa pro rosado; aproxima da foto HEIC tirada na mesma hora (2026-10-12)
def corrige(im):
    R, G, B = im.split()
    im = Image.merge("RGB", (R.point(lambda v: int(v * .935)), G, B.point(lambda v: min(255, int(v * 1.02)))))
    return ImageEnhance.Color(im).enhance(.86)
FF = r"C:/Users/tamar/TK FILMES/tk-filmes/videos/remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
src, ini, dur, ov, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], os.path.abspath(sys.argv[5])
modo = sys.argv[6] if len(sys.argv) > 6 else ""
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import grade
W, H = 1080, 1920
TM = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,"
      "zscale=t=bt709:m=bt709:r=tv,format=yuv420p,")
vf = TM + f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"
tmp = tempfile.mkdtemp(prefix="story_")
run = lambda a: subprocess.run(a, check=True, stdin=subprocess.DEVNULL)
run([FF, "-y", "-v", "error", "-ss", ini, "-t", dur, "-i", src, "-vf", vf, "-r", "30", "-q:v", "2", os.path.join(tmp, "f%04d.jpg")])
over = Image.open(ov).convert("RGBA").resize((W, H))
fs = sorted(glob.glob(os.path.join(tmp, "f*.jpg")))
for i, f in enumerate(fs):
    fr = corrige(Image.open(f).convert("RGB"))
    if modo == "editorial": fr = grade.editorial(fr, i)
    fr = fr.convert("RGBA"); fr.alpha_composite(over); fr.convert("RGB").save(f, quality=93)
run([FF, "-y", "-v", "error", "-framerate", "30", "-i", os.path.join(tmp, "f%04d.jpg"), "-ss", ini, "-t", dur, "-i", src,
     "-map", "0:v", "-map", "1:a:0?", "-vf", "scale=out_range=tv,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
     "-c:a", "aac", "-b:a", "128k", "-af", "volume=0.7", "-shortest", "-movflags", "+faststart", out])
for f in fs: os.remove(f)
os.rmdir(tmp)
print("ok", out, len(fs), "quadros")
