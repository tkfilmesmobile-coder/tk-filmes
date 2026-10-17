# Publica no @potefitness, em ordem, os posts prontos do posts.json que ainda não saíram.
# Registro em publicados.log (um post por linha). Rodar da raiz do sistema:
#   python clientes/pote-fitness/feed-inicial/publicar-lote.py
import json, pathlib, subprocess, time

BASE = pathlib.Path(__file__).resolve().parent
RAIZ = BASE.parents[2]
LOG = BASE / "publicados.log"
SCRIPT = RAIZ / ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
PAUSA = 45  # segundos entre posts, pra conta nova não parecer robô

feitos = {int(l.split()[0]) for l in LOG.read_text(encoding="utf-8").splitlines() if l.strip()} if LOG.exists() else set()
posts = sorted(json.loads((BASE / "posts.json").read_text(encoding="utf-8")), key=lambda p: p["n"])

for p in posts:
    if p["n"] in feitos:
        continue
    if p.get("slides"):
        imgs = [BASE / f"posts/{p['n']:02d}-{p['slug']}-{i}.jpg" for i in range(1, len(p["slides"]) + 1)]
    else:
        imgs = [BASE / f"posts/{p['n']:02d}-{p['slug']}.jpg"]
    cmd = ["node", "--env-file=.env", str(SCRIPT), "--conta", "POTEFITNESS",
           "--images", ",".join(str(i) for i in imgs), "--caption-file", str(BASE / f"legendas/{p['n']:02d}.txt")]
    print(f"[{time.strftime('%H:%M:%S')}] publicando {p['n']:02d} {p['slug']}", flush=True)
    r = subprocess.run(cmd, cwd=RAIZ, capture_output=True, text=True, encoding="utf-8")
    saida = (r.stdout + r.stderr).strip()
    link = next((w for w in saida.split() if "instagram.com/" in w), "(sem link)")
    if "Publicado!" not in saida:
        print(saida[-1500:], flush=True)
        print(f"PAROU no post {p['n']:02d}. Os anteriores estão em publicados.log.", flush=True)
        break
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"{p['n']:02d} {p['slug']} {time.strftime('%Y-%m-%d %H:%M')} {link}\n")
    print(f"  ok {link}", flush=True)
    time.sleep(PAUSA)
else:
    print("FIM: todos os posts prontos foram publicados.", flush=True)
