"""Corta as pausas de um take único (corte seco, ritmo dos reels da TK) e gera o vídeo base 1080x1920 24 fps.
Também reescreve os tempos das palavras pro vídeo cortado (sem precisar transcrever de novo).
uso: python scripts/cortar-pausas.py <bruto> <palavras-bruto.json> <saida.mp4> <palavras-saida.json> [pausa_max=0.35]
"""
import sys, json, subprocess, os
FFMPEG = os.environ.get("FFMPEG", r"C:\Users\kumyt\AppData\Local\CapCut\Apps\9.6.0.4097\ffmpeg.exe")
bruto, pj, saida, pjs = sys.argv[1:5]
PAUSA = float(sys.argv[5]) if len(sys.argv) > 5 else 0.35
P = json.load(open(pj, encoding="utf-8"))
ANTES, DEPOIS = 0.10, 0.16  # respiro antes da primeira e depois da última palavra de cada trecho

# trechos de fala: junta palavras separadas por menos de PAUSA
trechos = []
for p in P:
    if trechos and p["ini"] - trechos[-1]["fim"] <= PAUSA:
        trechos[-1]["fim"] = p["fim"]
    else:
        trechos.append({"ini": p["ini"], "fim": p["fim"]})
seg = []
for t in trechos:
    a, b = max(0.0, t["ini"] - ANTES), t["fim"] + DEPOIS
    if seg and a <= seg[-1][1]: seg[-1][1] = b
    else: seg.append([a, b])

# corta cada trecho recodificando (corte exato, sem depender de filtros) e junta tudo sem recodificar de novo
import tempfile
tmp = tempfile.mkdtemp(prefix="tk-cortes-")
lista = os.path.join(tmp, "lista.txt")
with open(lista, "w", encoding="utf-8") as L:
    for i, (a, b) in enumerate(seg):
        parte = os.path.join(tmp, f"p{i:03d}.mp4")
        subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{a:.3f}", "-i", bruto, "-t", f"{b - a:.3f}",
                        "-r", "24", "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", parte], check=True)
        L.write(f"file '{parte}'\n")
subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista,
                "-c", "copy", "-movflags", "+faststart", saida], check=True)

# novos tempos das palavras
def novo(t):
    acc = 0.0
    for a, b in seg:
        if a <= t <= b: return round(acc + (t - a), 3)
        acc += b - a
    return round(acc, 3)
Q = [{**p, "ini": novo(p["ini"]), "fim": novo(p["fim"])} for p in P]
json.dump(Q, open(pjs, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
total = sum(b - a for a, b in seg)
print(f"{len(seg)} trechos · {P[-1]['fim']:.1f}s de fala no bruto -> {total:.1f}s cortado")
