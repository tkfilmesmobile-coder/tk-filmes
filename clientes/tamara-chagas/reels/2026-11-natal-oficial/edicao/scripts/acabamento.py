"""Acabamento cinematográfico sobre o vídeo renderizado: brilho suave nas luzes (halation/bloom: só as altas luzes,
desfocadas e somadas em tela) e grão de filme fino só na luminância. O som passa sem mexer.
uso: python scripts/acabamento.py <entrada.mp4> <saida.mp4>"""
import subprocess, sys

FF = r"C:\Users\kumyt\tools\python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
ent, sai = sys.argv[1], sys.argv[2]
fc = ("[0:v]format=gbrp,split[a][b];"
      "[b]curves=all='0/0 0.72/0 1/1',gblur=sigma=28,colorbalance=rh=0.06:bh=-0.04[brilho];"
      "[a][brilho]blend=all_mode=screen:all_opacity=0.28,format=yuv420p,"
      "noise=c0s=5:c0f=t+u[v]")
subprocess.run([FF, "-y", "-loglevel", "error", "-i", ent, "-filter_complex", fc, "-map", "[v]", "-map", "0:a", "-c:v", "libx264", "-crf", "16",
                "-preset", "slow", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
                "-c:a", "copy", "-movflags", "+faststart", sai], check=True)
print("ok", sai)
