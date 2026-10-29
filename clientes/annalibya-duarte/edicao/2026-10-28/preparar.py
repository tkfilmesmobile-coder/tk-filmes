"""Prepara a mídia da 2ª versão (pedido da Talyta, 2026-10-29):
1. abertura do vídeo 1 com os brutos: escada, mão no puxador, porta + "Alexa, ligar as luzes do consultório", luz acendendo;
2. vídeo 2 sem a 2ª entrada no consultório (a porta abria duas vezes seguidas: 24–30,7 s e 30,7–37,7 s).
   A imagem corta em 30,57 → 37,88 e o som em 30,09 → 37,40 (os dois tiram 7,31 s): assim o "Esse espaço",
   que começa em 37,44 s, fica inteiro. O som do tour é silêncio digital, então o corte do som não come nada.
3. foto do rosto dela pro cartão do Instagram (link na bio).
Uso: python preparar.py
"""
import os
import subprocess

AQUI = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(os.environ["LOCALAPPDATA"], "CapCut", "Apps", "9.6.0.4097", "ffmpeg.exe")
BRUTO = r"H:\Meu Drive\Dra. Annalibya\Bruto"
PUB = os.path.join(AQUI, "..", "public")
ENC = ["-c:v", "h264_nvenc", "-preset", "p7", "-rc", "vbr", "-cq", "16", "-b:v", "16M", "-pix_fmt", "yuv420p",
       "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
       "-c:a", "aac", "-b:a", "256k", "-ar", "48000"]

# (arquivo, início, fim, com som?)
ABERTURA = [
    ("IMG_0617.MOV", 3.00, 4.50, False),  # subindo a escada até a porta com o letreiro
    ("IMG_0617.MOV", 5.50, 6.90, False),  # a mão pegando o puxador
    ("IMG_0618.MOV", 1.30, 4.05, True),   # a porta abre e ela fala "Alexa, ligar as luzes do consultório"
    ("IMG_0619.MOV", 3.20, 5.40, False),  # o consultório escuro e a luz acendendo (~3,7 s); sem som: ela repete "Alexa"
]

entradas, filtros, conc = [], [], ""
for i, (arq, a, b, som) in enumerate(ABERTURA):
    entradas += ["-i", os.path.join(BRUTO, arq)]
    d = b - a
    filtros.append(f"[{i}:v]trim={a}:{b},setpts=PTS-STARTPTS,scale=1080:1920,fps=24,format=yuv420p[v{i}]")
    if som:
        filtros.append(f"[{i}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
                       f"afade=t=in:d=0.03,afade=t=out:st={d - 0.05}:d=0.05[a{i}]")
    else:
        filtros.append(f"aevalsrc=0|0:d={d}:s=48000,aformat=channel_layouts=stereo[a{i}]")
    conc += f"[v{i}][a{i}]"
filtros.append(conc + f"concat=n={len(ABERTURA)}:v=1:a=1[v][a]")
subprocess.run([FF, "-v", "error", "-y", *entradas, "-filter_complex", ";".join(filtros), "-map", "[v]", "-map", "[a]",
                *ENC, os.path.join(PUB, "brutos", "abertura.mp4")], check=True)
print("abertura:", round(sum(b - a for _, a, b, _ in ABERTURA), 2), "s")

V2 = os.path.join(PUB, "brutos", "video2.mp4")
filtros = [
    # imagem: 37,71–37,88 é um quadro solto das prateleiras no original; a volta começa em 37,88 (ela falando)
    "[0:v]trim=0:30.57,setpts=PTS-STARTPTS[v0]", "[0:v]trim=start=37.88,setpts=PTS-STARTPTS[v1]",
    "[0:a]atrim=0:30.09,asetpts=PTS-STARTPTS,afade=t=out:st=30.07:d=0.02[a0]",
    "[0:a]atrim=start=37.40,asetpts=PTS-STARTPTS,afade=t=in:d=0.02[a1]",
    "[v0][v1]concat=n=2:v=1:a=0[v]", "[a0][a1]concat=n=2:v=0:a=1[a]",
]
subprocess.run([FF, "-v", "error", "-y", "-i", V2, "-filter_complex", ";".join(filtros), "-map", "[v]", "-map", "[a]",
                *ENC, os.path.join(PUB, "brutos", "video2-corte.mp4")], check=True)
print("vídeo 2 cortado: 63,58 - 7,31 = 56,27 s")

os.makedirs(os.path.join(PUB, "marca"), exist_ok=True)
subprocess.run([FF, "-v", "error", "-y", "-ss", "2.6", "-i", os.path.join(PUB, "brutos", "video1.mp4"), "-frames:v", "1",
                os.path.join(AQUI, "analise", "quadro-avatar.png")], check=True)
print("quadro do avatar salvo em analise/quadro-avatar.png")
