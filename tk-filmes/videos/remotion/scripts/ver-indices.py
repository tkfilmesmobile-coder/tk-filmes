"""Lista palavra por palavra (índice, tempo, texto) num intervalo de índices, pra marcar os cortes da curadoria.
uso: python scripts/ver-indices.py <palavras.json> <i0>-<i1> [<i0>-<i1> ...]
"""
import sys, json
P = json.load(open(sys.argv[1], encoding="utf-8"))
for faixa in sys.argv[2:]:
    a, b = map(int, faixa.split("-"))
    print(f"--- {a}-{b}")
    print("  ".join(f"{i}:{P[i]['texto']}@{P[i]['ini']:.2f}" for i in range(a, min(b, len(P) - 1) + 1)))
