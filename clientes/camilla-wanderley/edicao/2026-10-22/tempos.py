"""Palavras da legenda de um vídeo montado, com o segundo em que cada uma começa (tempo da montagem).
Uso: python tempos.py <id> [<id> ...]"""
import json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
for vid in sys.argv[1:]:
    ws = json.load(open(os.path.join(AQUI, "..", "perfil-video", "public", "cortes", vid, "legendas.json"), encoding="utf-8"))
    print("##", vid)
    print(" ".join(f"{w['text'].strip()}@{w['startMs'] / 1000:.1f}" for w in ws))
