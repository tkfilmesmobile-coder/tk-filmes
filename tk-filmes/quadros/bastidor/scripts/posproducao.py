"""Material do formato "Pós-produção × Resultado final":
1) public/bastidor/<id>/posproducao.mp4: timelapse dos takes da peça (cada take acelerado 5x, um atrás do outro, sem som).
2) "onda" no src/bastidor-<id>.json: o volume real do vídeo pronto (160 pontos de 0 a 1) no trecho mostrado.
uso: python posproducao.py <id> <pasta_brutos> <primeiro_take> <ultimo_take>   (ex.: start "H:\...\Bruto" IMG_0525 IMG_0548)
"""
import sys, os, glob, json, subprocess, tempfile, wave
import numpy as np
FF = r"C:\Users\kumyt\AppData\Local\CapCut\Apps\9.6.0.4097\ffmpeg.exe"
RAIZ = r"C:\Users\kumyt\Documents\Projeto TK FILMES\TK FILMES\tk-filmes\videos\remotion"
ident, pasta, ini, fim = sys.argv[1:5]
dest = os.path.join(RAIZ, "public", "bastidor", ident)
takes = [a for a in sorted(glob.glob(os.path.join(pasta, "*.MOV"))) if ini <= os.path.splitext(os.path.basename(a))[0] <= fim and os.path.getsize(a) > 500_000]
# 1) timelapse: 4 s de cada take a 5x (0,8 s na tela)
args, fc = [FF, "-v", "error", "-y"], ""
for i, a in enumerate(takes):
    args += ["-ss", "0.4", "-t", "4", "-i", a]
    fc += f"[{i}:v]setpts=PTS/5,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=24,setsar=1[v{i}];"
fc += "".join(f"[v{i}]" for i in range(len(takes))) + f"concat=n={len(takes)}:v=1:a=0[v]"
args += ["-filter_complex", fc, "-map", "[v]", "-c:v", "h264_nvenc", "-preset", "p5", "-cq", "21", "-an", os.path.join(dest, "posproducao.mp4")]
subprocess.run(args, check=True)
# 2) onda real do vídeo pronto
jf = os.path.join(RAIZ, "src", f"bastidor-{ident}.json")
ep = json.load(open(jf, encoding="utf-8"))
L = ep["lado"]
wav = os.path.join(tempfile.gettempdir(), "tk-onda.wav")
subprocess.run([FF, "-v", "error", "-y", "-ss", str(L["depois"]["ini"]), "-t", str(L["dur"]), "-i", os.path.join(dest, L["depois"]["src"]), "-ac", "1", "-ar", "8000", wav], check=True)
with wave.open(wav) as w:
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
n = 160
rms = np.array([np.sqrt(np.mean(b ** 2)) if len(b) else 0 for b in np.array_split(a, n)])
rms = rms / (rms.max() or 1)
ep["onda"] = [round(float(x), 3) for x in rms]
ep["lado"]["antes"] = {"src": "posproducao.mp4", "ini": 0}
json.dump(ep, open(jf, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(ident, len(takes), "takes no timelapse ·", round(len(takes) * 0.8, 1), "s · onda ok")
