"""Mostra as palavras de um trecho com o tempo de início. Uso: python palavras.py IMG_xxxx de ate [IMG_yyyy de ate ...]"""
import json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
a = sys.argv[1:]
for i in range(0, len(a), 3):
    arq, de, ate = a[i], float(a[i + 1]), float(a[i + 2])
    j = json.load(open(os.path.join(AQUI, "transcricoes", arq + ".json"), encoding="utf-8"))
    ws = [w for s in j["segmentos"] for w in s["palavras"] if de <= w["ini"] <= ate]
    print(arq, " ".join(f"{w['p']}@{w['ini']}" for w in ws))
