"""Confere o vídeo cortado: compara a transcrição NOVA dele com o texto escolhido na curadoria, palavra por palavra.
Diferença perto de um corte = palavra comida ou sílaba sobrando. Diferença longe de corte costuma ser só a transcrição.
uso: python scripts/conferir-cortes.py <id>   (lê scripts/<id>-palavras.json e scripts/<id>-conferencia.json)
"""
import sys, json, difflib, unicodedata, pathlib
R = pathlib.Path(__file__).resolve().parent
id = sys.argv[1]
esp = json.load(open(R / f"{id}-palavras.json", encoding="utf-8-sig"))
obt = json.load(open(R / f"{id}-conferencia.json", encoding="utf-8-sig"))
def n(t):
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn" and c.isalnum())
A, B = [n(p["texto"]) for p in esp], [n(p["texto"]) for p in obt]
sm = difflib.SequenceMatcher(None, A, B, autojunk=False)
print(f"[{id}] semelhança {sm.ratio():.3f} · {len(A)} esperadas · {len(B)} ouvidas")
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "equal": continue
    t = obt[j1]["ini"] if j1 < len(obt) else obt[-1]["fim"]
    ctx = " ".join(p["texto"] for p in esp[max(0, i1 - 3):i1])
    print(f"  {t:7.2f}s {op:8s} esperado: {' '.join(p['texto'] for p in esp[i1:i2]) or '-':30s} ouvido: {' '.join(p['texto'] for p in obt[j1:j2]) or '-':30s} (depois de: …{ctx})")
