"""Monta clientes/camilla-wanderley/publicacao/<AAAA-MM-DD>/ pra cada post do calendário 26/10 a 31/12/2026:
- post: 01.jpg (foto única), 01..NN.jpg (carrossel) ou video.mp4 (reels, recomprimido pra caber no upload);
- legenda.md;
- stories: story-01.jpg, -02, -03 (do post); no reels, story-01.jpg é a capa do vídeo (a API não reposta reels no story).
O robô (modelos/publicar-agendado.ps1) publica o que estiver na pasta do dia. Reels da Mari: o arquivo vem do Drive
(VÍDEOS EDITADOS/2026-10, nome com "Mari"); o robô procura na hora se não estiver aqui."""
import glob, importlib.util, os, shutil, subprocess
import cv2
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
CLI = os.path.dirname(AQUI)
POSTS = os.path.join(CLI, "posts")
PUB = os.path.join(CLI, "publicacao")
DRIVE = r"H:\Meu Drive\Dra. Camilla Wanderlley"
FF = os.path.join(CLI, "edicao", "perfil-video", "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffmpeg.exe")
spec = importlib.util.spec_from_file_location("m", os.path.join(AQUI, "monta_calendario_2026-11-12.py"))
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)


def jpg(src, dst):
    if not os.path.exists(dst):
        Image.open(src).convert("RGB").save(dst, quality=92)


def video(src, dst, capa):
    cap = cv2.VideoCapture(src)
    dur = cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)
    cap.set(cv2.CAP_PROP_POS_MSEC, 1600); ok, fr = cap.read()
    if ok and not os.path.exists(capa):
        fr = cv2.resize(fr, (1080, 1920)); cv2.imwrite(capa, fr, [cv2.IMWRITE_JPEG_QUALITY, 92])
    if os.path.exists(dst):
        return
    kbps = int(min(9000, 88 * 8 * 1024 / dur))  # no máximo ~88 MB (o upload aceita até 128 MB)
    subprocess.run([FF, "-v", "error", "-y", "-i", src, "-vf", "scale=1080:1920,format=yuv420p", "-c:v", "h264_nvenc", "-preset", "p5", "-b:v", f"{kbps}k",
                    "-maxrate", f"{int(kbps * 1.3)}k", "-bufsize", f"{kbps * 2}k", "-r", "30", "-c:a", "aac", "-b:a", "160k",
                    "-ar", "48000", "-movflags", "+faststart", dst], check=True)


feed = m.agenda()
for d, (fmt, tema, fonte, leg) in feed.items():
    pasta = os.path.join(PUB, f"{d:%Y-%m-%d}")
    os.makedirs(pasta, exist_ok=True)
    open(os.path.join(pasta, "fonte.txt"), "w", encoding="utf-8").write(f"{fmt} · {tema}\n{fonte}\n")
    if leg:  # reels
        texto = m.LEG_VIDEO[leg] + m.ASSINA if m.LEG_VIDEO[leg] else ""
        if leg == "mari":
            texto = open(os.path.join(POSTS, "2026-10", "depoimento-mari", "legenda.md"), encoding="utf-8").read().strip()
            jpg(os.path.join(POSTS, "2026-10", "07-carrossel-mari", "01.png"), os.path.join(pasta, "story-01.jpg"))
        else:
            src = os.path.join(DRIVE, fonte.replace("Drive: ", "").replace("/", os.sep))
            video(src, os.path.join(pasta, "video.mp4"), os.path.join(pasta, "story-01.jpg"))
        open(os.path.join(pasta, "legenda.md"), "w", encoding="utf-8").write(texto + "\n")
    else:
        orig = os.path.join(POSTS, fonte.replace("posts/", "").replace("/", os.sep))
        slides = sorted(f for f in glob.glob(os.path.join(orig, "[0-9][0-9].png")))
        for i, s in enumerate(slides, 1):
            jpg(s, os.path.join(pasta, f"{i:02d}.jpg"))
        for s in sorted(glob.glob(os.path.join(orig, "story-*.png"))):
            jpg(s, os.path.join(pasta, os.path.basename(s).replace(".png", ".jpg")))
        shutil.copy(os.path.join(orig, "legenda.md"), os.path.join(pasta, "legenda.md"))
    arqs = sorted(os.listdir(pasta))
    print(f"{d:%Y-%m-%d} {fmt:13} {', '.join(a for a in arqs if a != 'fonte.txt')}")
