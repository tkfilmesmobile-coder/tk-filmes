"""Story em vídeo feito de um trecho de outro vídeo (Reels, vlog, bruto), sem o som original: entra a trilha, com o
texto elegante por cima (regra: vídeo sem fala sai com música; edição fluida, entrada e saída suaves). Criado em
03/11/2026 pros stories da saga de Natal.

uso: python modelos/stories_trecho_musica.py <pasta-do-lote> <spec.json> <trilha.wav>
spec.json: [{"id": "01-papai-noel", "src": "caminho/do/video.mp4", "a": 240, "b": 262, "rate": 4,
             "kicker": "SAGA DE NATAL", "texto": "O Papai Noel <b>chegou</b>.", "pos": "baixo", "trilha_ini": 12}]
Vídeo HDR (HLG do iPhone) vira SDR bt709; sem a marcação de rotação; 1080x1920 a 30 fps, avanço suave da câmera.
"""
import json, pathlib, subprocess, sys
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
AQUI = pathlib.Path(__file__).resolve().parent
SDR = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,"
       "zscale=p=bt709,tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,")


def hdr(arq):
    info = subprocess.run([FF, "-hide_banner", "-i", str(arq)], capture_output=True, text=True, errors="replace").stderr
    return "arib-std-b67" in info


lote, spec, trilha = pathlib.Path(sys.argv[1]), json.load(open(sys.argv[2], encoding="utf-8-sig")), sys.argv[3]
tmp = lote / "_tmp"; tmp.mkdir(parents=True, exist_ok=True)
for s in spec:
    rate = s.get("rate", 1)
    dur = round((s["b"] - s["a"]) / rate, 3)
    png = tmp / f"{s['id']}-texto.png"
    subprocess.run([sys.executable, str(AQUI / "overlay_elegante.py"), str(png), s["kicker"], s["texto"], s.get("pos", "baixo")], check=True)
    n = round(dur * 30)
    v = (f"[0:v]{SDR if hdr(s['src']) else ''}sidedata=mode=delete:type=DISPLAYMATRIX,setpts=(PTS-STARTPTS)/{rate},fps=30,"
         f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
         f"scale=w='trunc(1080*(1+0.05*n/{n})/2)*2':h='trunc(1920*(1+0.05*n/{n})/2)*2':eval=frame,crop=1080:1920,setsar=1[cam];"
         f"[cam][1:v]overlay=0:0,fade=in:st=0:d=0.3,fade=out:st={dur - 0.35}:d=0.35,format=yuv420p[v]")
    a = f"[2:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=in:st=0:d=0.4,afade=out:st={dur - 0.6}:d=0.6,volume=0.8[a]"
    out = lote / f"{s['id']}.mp4"
    subprocess.run([FF, "-y", "-loglevel", "error", "-ss", str(s["a"]), "-t", str(s["b"] - s["a"]), "-i", s["src"],
                    "-loop", "1", "-i", str(png), "-ss", str(s.get("trilha_ini", 0)), "-i", trilha,
                    "-filter_complex", f"{v};{a}", "-map", "[v]", "-map", "[a]", "-t", str(dur),
                    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)], check=True)
    print("ok", out.name, f"{dur}s")
