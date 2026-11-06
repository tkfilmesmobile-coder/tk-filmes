"""Mostra a transcrição palavra a palavra em linhas com tempo, índice da 1ª palavra e marca de pausa,
pra fazer a curadoria (escolher takes e onde cortar).
uso: python scripts/ver-palavras.py <palavras.json>
"""
import sys, json
P = json.load(open(sys.argv[1], encoding="utf-8"))
linha, t0, i0, ult = [], None, 0, None
for i, p in enumerate(P):
    gap = p["ini"] - ult if ult is not None else 0
    if linha and (gap > 0.6 or len(linha) >= 14):
        print(f"#{i0:<4} [{t0:6.2f}-{ult:6.2f}] " + " ".join(linha) + (f"   ‖ pausa {gap:.1f}s" if gap > 0.6 else ""))
        linha = []
    if not linha: t0, i0 = p["ini"], i
    linha.append(p["texto"] + ("" if p["prob"] > 0.5 else "(?)"))
    ult = p["fim"]
print(f"#{i0:<4} [{t0:6.2f}-{ult:6.2f}] " + " ".join(linha))
