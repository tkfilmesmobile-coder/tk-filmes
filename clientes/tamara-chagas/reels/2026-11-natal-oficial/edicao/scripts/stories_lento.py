"""Câmeras lentas em pé (1080x1920) pros stories do vídeo oficial: mesmo recorte e zoom do vídeo vertical (quadro
fechado, sem os cantos da sala), interpolação de quadros como o lento.py, só que depois do recorte (mais leve).
uso: python scripts/stories_lento.py <spec.json> <pasta_saida>
spec: [{"id": "e1", "src": "public/g-IMG_7303.mp4", "ini": 8.0, "quadros": 165, "vel": 0.6,
        "cx": 0.58, "zoom": 1.12, "ganho": 1.0, "caber": false}]
caber = fonte 1920x1080 (fachada inteira): entra inteira no meio, sobre ela mesma desfocada e escurecida."""
import json, pathlib, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

FF = r"C:\Users\kumyt\tools\python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
spec = json.load(open(sys.argv[1], encoding="utf-8-sig"))
saida = pathlib.Path(sys.argv[2]); saida.mkdir(parents=True, exist_ok=True)


def um(s):
    n, vel = s["quadros"], s["vel"]
    bruto = n / 30 * vel
    ganho = s.get("ganho", 1.0)
    luz = f",colorchannelmixer=rr={ganho}:gg={ganho}:bb={ganho}" if ganho != 1.0 else ""
    interp = (f"minterpolate=fps={round(30 / vel, 3)}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:me=epzs:vsbmc=1:scd=none,"
              f"setpts=N/(30*TB),fps=30,format=yuv420p")
    if s.get("caber"):
        fc = (f"[0:v]format=yuv420p{luz},split[a][b];"
              f"[b]scale=-2:1920,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.12[fundo];"
              f"[a]scale=1080:-2[frente];[fundo][frente]overlay=0:(H-h)/2,{interp}[v]")
    else:
        z, cx = s.get("zoom", 1.12), s.get("cx", 0.5)
        # janela 9:16 na altura toda, fechada pelo zoom, centrada em cx (horizontal) e 42% (vertical)
        fc = (f"[0:v]crop=w='trunc(ih*9/16/{z}/2)*2':h='trunc(ih/{z}/2)*2':"
              f"x='max(0,min(iw-ow,iw*{cx}-ow/2))':y='max(0,min(ih-oh,ih*0.42-oh/2))',"
              f"scale=1080:1920:flags=lanczos{luz},{interp}[v]")
    out = saida / f"{s['id']}-lento.mp4"
    subprocess.run([FF, "-y", "-loglevel", "error", "-ss", f"{s['ini']:.3f}", "-t", f"{bruto + 0.4:.3f}", "-i", s["src"],
                    "-filter_complex", fc, "-map", "[v]", "-frames:v", str(n), "-c:v", "libx264", "-crf", "15",
                    "-preset", "medium", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                    "-color_range", "tv", "-an", "-movflags", "+faststart", str(out)], check=True)
    return f"ok {out.name} ({bruto:.2f} s do bruto -> {n / 30:.2f} s)"


with ThreadPoolExecutor(4) as ex:
    for r in ex.map(um, spec):
        print(r, flush=True)
