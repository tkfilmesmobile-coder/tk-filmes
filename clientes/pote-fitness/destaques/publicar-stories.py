# Publica nos stories do @potefitness os stories dos destaques, agrupados por destaque e em ordem.
# Registro em publicados.log. Rodar da raiz do sistema:
#   python clientes/pote-fitness/destaques/publicar-stories.py
import pathlib, subprocess, time

BASE = pathlib.Path(__file__).resolve().parent
RAIZ = BASE.parents[2]
LOG = BASE / "publicados.log"
SCRIPT = RAIZ / ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
ORDEM = ["cardapio", "como-pedir", "horarios", "entregas", "clientes", "bastidores"]
PAUSA = 40

import sys
LIMITE = int(sys.argv[1]) if len(sys.argv) > 1 else 999  # quantos stories nesta rodada (evita bloqueio)
feitos = set(LOG.read_text(encoding="utf-8").split()) if LOG.exists() else set()
fila = [a for d in ORDEM for a in sorted((BASE / "imagens").glob(f"{d}-*.jpg"))]

for img in fila:
    if img.stem in feitos:
        continue
    if LIMITE <= 0:
        print("LOTE: fim desta rodada.", flush=True)
        break
    LIMITE -= 1
    print(f"[{time.strftime('%H:%M:%S')}] story {img.stem}", flush=True)
    r = subprocess.run(["node", "--env-file=.env", str(SCRIPT), "--conta", "POTEFITNESS", "--story", "--images", str(img)],
                       cwd=RAIZ, capture_output=True, text=True, encoding="utf-8")
    saida = (r.stdout + r.stderr).strip()
    if "Story publicado!" not in saida:
        print(saida[-1500:], flush=True)
        print(f"PAROU em {img.stem}. Os anteriores estão em publicados.log.", flush=True)
        break
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"{img.stem} {time.strftime('%Y-%m-%d %H:%M')}\n")
    print("  ok", flush=True)
    time.sleep(PAUSA)
else:
    print("FIM: todos os stories publicados.", flush=True)
