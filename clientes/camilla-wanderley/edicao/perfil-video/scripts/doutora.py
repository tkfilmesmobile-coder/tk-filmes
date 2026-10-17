"""Rastreio da doutora no plano aberto: em cada quadro, o rosto mais à direita (x > 600) é ela.
Quadros sem detecção são interpolados; suavização gaussiana (sigma 6 quadros). Saída: [[x, y, w], ...]."""
import json, numpy as np
q = json.load(open("scripts/cache/rostos.json"))
n = len(q)
xs, ys, ws = np.full(n, np.nan), np.full(n, np.nan), np.full(n, np.nan)
for i, rs in enumerate(q):
    cand = [r for r in rs if r[0] > 600 and r[3] > 0.6]
    if cand:
        r = max(cand, key=lambda r: r[0])
        xs[i], ys[i], ws[i] = r[0], r[1], r[2]
idx = np.arange(n)
ok = ~np.isnan(xs)
out = []
for arr in (xs, ys, ws):
    a = np.interp(idx, idx[ok], arr[ok])
    k = np.exp(-0.5 * (np.arange(-18, 19) / 6) ** 2); k /= k.sum()
    a = np.convolve(np.pad(a, 18, mode="edge"), k, mode="valid")
    out.append(a)
track = [[round(float(out[0][i]), 1), round(float(out[1][i]), 1), round(float(out[2][i]), 1)] for i in range(n)]
json.dump(track, open("src/periodontite/doutora.json", "w"))
print(n, "quadros; primeiro com a doutora:", int(np.argmax(ok)) / 30, "s")
for t in [4.6, 5, 6, 7, 8, 9, 10]:
    print(t, track[int(t * 30)])
