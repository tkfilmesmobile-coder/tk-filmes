"""Junta as transcrições da diária num texto só, com os tempos (transcricoes/_todas.txt)."""
import json, glob, os

AQUI = os.path.dirname(os.path.abspath(__file__))
linhas = []
for p in sorted(glob.glob(os.path.join(AQUI, "transcricoes", "IMG_*.json"))):
    j = json.load(open(p, encoding="utf-8"))
    linhas.append(f"\n## {j['arquivo']} ({j['duracao']}s)")
    for s in j["segmentos"]:
        linhas.append(f"  [{s['ini']:.1f}-{s['fim']:.1f}] {s['texto']}")
open(os.path.join(AQUI, "transcricoes", "_todas.txt"), "w", encoding="utf-8").write("\n".join(linhas))
