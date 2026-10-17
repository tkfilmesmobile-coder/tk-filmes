"""Mapa de fala de uma gravação: onde há voz de verdade, medido no áudio (não no Whisper).
- Envelope de energia a cada 10 ms (dB), piso de ruído = percentil 10.
- Região de voz = energia acima do piso + margem, por pelo menos 80 ms; buracos < 250 ms são
  unidos (respiração dentro da frase não quebra a fala).
- Cada região recebe as palavras do Whisper que caem nela. Região com voz e SEM palavra é marcada
  como suspeita (direção de quem grava, ruído).
- Desenha a forma de onda com as regiões e as palavras em <saida>.png para conferência visual.
Uso: python scripts/falas.py <wav16k> <palavras.json> <saida_prefixo> [ini fim]
"""
import sys, json, wave
import numpy as np
import librosa
from PIL import Image, ImageDraw, ImageFont

wav, pal, saida = sys.argv[1:4]
ini = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
fim = float(sys.argv[5]) if len(sys.argv) > 5 else None

with wave.open(wav) as w:
    sr = w.getframerate()
    y = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
dur = len(y) / sr
fim = fim or dur
H = sr // 100
n = len(y) // H
rms = np.sqrt(np.mean(y[: n * H].reshape(n, H) ** 2, axis=1) + 1e-12)
db = 20 * np.log10(rms)
piso = np.percentile(db, 10)
fala_db = np.percentile(db, 90)
limiar = piso + max(8.0, (fala_db - piso) * 0.30)

ativo = db > limiar
reg = []
i = 0
while i < n:
    if ativo[i]:
        j = i
        while j < n and ativo[j]:
            j += 1
        if j - i >= 8:
            reg.append([i, j])
        i = j
    else:
        i += 1
uni = []
for a, b in reg:
    if uni and a - uni[-1][1] < 25:
        uni[-1][1] = b
    else:
        uni.append([a, b])

palavras = json.load(open(pal, encoding="utf-8"))
f0, vo, _ = librosa.pyin(y, fmin=90, fmax=420, sr=sr, frame_length=1024, hop_length=H)

out = []
for a, b in uni:
    s, e = a / 100, b / 100
    ps = [p for p in palavras if p["startMs"] / 1000 < e and p["endMs"] / 1000 > s]
    f = f0[a:b]
    f = f[~np.isnan(f)]
    out.append({
        "de": round(s, 2), "ate": round(e, 2),
        "pico_db": round(float(db[a:b].max()), 1),
        "media_db": round(float(db[a:b].mean()), 1),
        "f0": round(float(np.median(f))) if len(f) else 0,
        "texto": " ".join(p["text"].strip() for p in ps),
    })
json.dump({"piso_db": round(float(piso), 1), "limiar_db": round(float(limiar), 1), "regioes": out},
          open(saida + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"piso {piso:.1f} dB | limiar {limiar:.1f} dB | fala tipica {fala_db:.1f} dB")
for r in out:
    if r["ate"] < ini or r["de"] > fim:
        continue
    marca = "  " if r["texto"] else "??"
    print(f"{marca} [{r['de']:6.2f} - {r['ate']:6.2f}] pico {r['pico_db']:6.1f} dB | f0 {r['f0']:3d} Hz | {r['texto'][:95]}")

seg = 10.0
faixas = int(np.ceil((fim - ini) / seg))
W, FH = 2000, 170
img = Image.new("RGB", (W, faixas * FH), "white")
d = ImageDraw.Draw(img)
try:
    fonte = ImageFont.truetype("arial.ttf", 13)
except Exception:
    fonte = ImageFont.load_default()
for k in range(faixas):
    t0 = ini + k * seg
    y0 = k * FH
    px = lambda t: int((t - t0) / seg * W)
    for r in out:
        if r["ate"] < t0 or r["de"] > t0 + seg:
            continue
        cor = (215, 235, 215) if r["texto"] else (250, 205, 205)
        d.rectangle([px(r["de"]), y0 + 18, px(r["ate"]), y0 + 118], fill=cor)
    a0, a1 = int(t0 * 100), min(n, int((t0 + seg) * 100))
    for i in range(a0, a1):
        v = (db[i] - piso) / max(1, fala_db - piso + 6)
        h = int(max(0, min(1, v)) * 48)
        x = px(i / 100)
        d.line([x, y0 + 68 - h, x, y0 + 68 + h], fill=(60, 60, 70))
    yl = y0 + 68 - int((limiar - piso) / max(1, fala_db - piso + 6) * 48)
    d.line([0, yl, W, yl], fill=(200, 80, 80))
    alt = 0
    for p in palavras:
        s = p["startMs"] / 1000
        if t0 <= s < t0 + seg:
            d.line([px(s), y0 + 120, px(s), y0 + 128], fill=(30, 90, 200))
            d.text((px(s) + 1, y0 + 128 + alt * 14), p["text"].strip(), fill=(30, 90, 200), font=fonte)
            alt = 1 - alt
    for s in range(int(t0), int(t0 + seg) + 1):
        d.text((px(s) + 2, y0 + 2), f"{s}s", fill=(120, 120, 120), font=fonte)
        d.line([px(s), y0 + 14, px(s), y0 + 18], fill=(120, 120, 120))
img.save(saida + ".png")
