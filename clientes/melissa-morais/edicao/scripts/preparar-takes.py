# Corta os trechos escolhidos dos takes da cliente e converte pra 1080x1920, 30 fps, H.264, sem áudio.
# Uso: python scripts/preparar-takes.py <pasta dos .MOV>  ->  public/takes/<nome>.mp4
# Cada trecho leva 0,3 s de folga nas pontas pra fusão entre as cenas.
import subprocess, sys, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
ORIGEM = sys.argv[1]
TRECHOS = {  # nome: (arquivo, início s, fim s)
    # abertura pedida pela cliente (2026-10-22): IMG_4072 a partir de 3,75 s, mais perto (zoom 1,6x
    # centrado na doutora e na paciente, como no print dela)
    "c0-abertura": ("IMG_4072", 3.75, 7.75, "crop=iw/1.6:ih/1.6:iw*0.546-iw/3.2:ih*0.498-ih/3.2"),
    "c1-labios": ("IMG_4022", 4.0, 7.0),
    "c2-doutora": ("IMG_4033", 4.0, 7.0),
    "c3-maos": ("IMG_3993", 0.0, 2.6),
    "c4-clinica": ("IMG_4073", 5.0, 8.0),
    "c5-perfil": ("IMG_4047", 3.0, 6.3),
    "c6-espelho": ("IMG_4036", 1.8, 5.2),
    "c7-sorriso": ("IMG_4052", 8.0, 11.3),
    "c8-final": ("IMG_4076", 7.0, 10.3),
}
import os
for nome, (arq, ini, fim, *extra) in TRECHOS.items():
    if os.path.exists(f"public/takes/{nome}.mp4"):
        continue  # já cortado
    ini = max(0.0, ini - 0.3)
    fim = fim + 0.3
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", str(ini), "-to", str(fim),
                    "-i", f"{ORIGEM}/{arq}.MOV", "-an",
                    "-vf", (extra[0] + "," if extra else "") + "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,"
                           "eq=brightness=0.02:contrast=1.03:saturation=1.03",
                    "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p",
                    f"public/takes/{nome}.mp4"], check=True)
    print(nome, arq, ini, fim)
