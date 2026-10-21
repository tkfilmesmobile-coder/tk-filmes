# Corta os trechos escolhidos dos takes da cliente e converte pra 1080x1920, 30 fps, H.264, sem áudio.
# Uso: python scripts/preparar-takes.py <pasta dos .MOV>  ->  public/takes/<nome>.mp4
# Cada trecho leva 0,3 s de folga nas pontas pra fusão entre as cenas.
import subprocess, sys, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
ORIGEM = sys.argv[1]
TRECHOS = {  # nome: (arquivo, início s, fim s)
    "c1-labios": ("IMG_4022", 4.0, 7.0),
    "c2-doutora": ("IMG_4033", 4.0, 7.0),
    "c3-maos": ("IMG_3993", 0.0, 2.6),
    "c4-clinica": ("IMG_4073", 5.0, 8.0),
    "c5-perfil": ("IMG_4047", 3.0, 6.3),
    "c6-espelho": ("IMG_4036", 1.8, 5.2),
    "c7-sorriso": ("IMG_4052", 8.0, 11.3),
    "c8-final": ("IMG_4076", 7.0, 10.3),
}
for nome, (arq, ini, fim) in TRECHOS.items():
    ini = max(0.0, ini - 0.3)
    fim = fim + 0.3
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", str(ini), "-to", str(fim),
                    "-i", f"{ORIGEM}/{arq}.MOV", "-an",
                    "-vf", "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,"
                           "eq=brightness=0.02:contrast=1.03:saturation=1.03",
                    "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p",
                    f"public/takes/{nome}.mp4"], check=True)
    print(nome, arq, ini, fim)
