"""Câmera lenta fluida por interpolação de quadros (minterpolate, compensação de movimento), sem travadas.
Gera um clipe que, tocado em velocidade normal na timeline, sai na velocidade pedida.
uso: python scripts/lento.py <entrada.mp4> <saida.mp4> <inicio_s> <quadros_de_saida> <velocidade>
ex.: velocidade 0,6 e 86 quadros de saída -> usa 86/30*0,6 = 1,72 s do bruto a partir do início."""
import subprocess, sys

FF = r"C:\Users\kumyt\tools\python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
ent, sai, ini, n, vel = sys.argv[1], sys.argv[2], float(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5])
bruto = n / 30 * vel
fps_alvo = round(30 / vel, 3)
vf = (f"minterpolate=fps={fps_alvo}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:me=epzs:vsbmc=1:scd=none,"
      f"setpts=N/(30*TB),fps=30,format=yuv420p")
subprocess.run([FF, "-y", "-loglevel", "error", "-ss", f"{ini:.3f}", "-t", f"{bruto + 0.4:.3f}", "-i", ent, "-map", "0:v:0", "-vf", vf,
                "-frames:v", str(n + 2), "-c:v", "libx264", "-crf", "14", "-preset", "medium",
                "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv", "-movflags", "+faststart", sai], check=True)
print("ok", sai, f"{bruto:.2f} s do bruto -> {n} quadros ({n / 30:.2f} s)")
