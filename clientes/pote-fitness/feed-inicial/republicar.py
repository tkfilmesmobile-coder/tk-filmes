# Republica os posts 31 e 32 (correção do WhatsApp, 2026-10-11) no @potefitness, nessa ordem.
# Registro em republicados.log. Sai com código 1 se o Instagram recusar (bloqueio), 0 se os dois já saíram.
#   python clientes/pote-fitness/feed-inicial/republicar.py
import json, pathlib, subprocess, sys, time

BASE = pathlib.Path(__file__).resolve().parent
RAIZ = BASE.parents[2]
LOG = BASE / "republicados.log"
SCRIPT = RAIZ / ".claude/skills/publicar-social-ratos/scripts/publish-graph-api.js"
posts = {p["n"]: p for p in json.loads((BASE / "posts.json").read_text(encoding="utf-8"))}
feitos = {int(l.split()[0]) for l in LOG.read_text(encoding="utf-8").splitlines() if l.strip()} if LOG.exists() else set()

for n in (31, 32):
    if n in feitos:
        continue
    p = posts[n]
    if p.get("slides"):
        imgs = [BASE / f"posts/{n:02d}-{p['slug']}-{i}.jpg" for i in range(1, len(p["slides"]) + 1)]
    else:
        imgs = [BASE / f"posts/{n:02d}-{p['slug']}.jpg"]
    r = subprocess.run(["node", "--env-file=.env", str(SCRIPT), "--conta", "POTEFITNESS", "--images", ",".join(map(str, imgs)),
                        "--caption-file", str(BASE / f"legendas/{n:02d}.txt")], cwd=RAIZ, capture_output=True, text=True, encoding="utf-8")
    saida = (r.stdout + r.stderr).strip()
    if "Publicado!" not in saida:
        print(f"post {n}: recusado -> {saida.splitlines()[-1] if saida else '?'}", flush=True)
        sys.exit(1)
    link = next((w for w in saida.split() if "instagram.com/" in w), "(sem link)")
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"{n:02d} {p['slug']} {time.strftime('%Y-%m-%d %H:%M')} {link}\n")
    print(f"post {n}: ok {link}", flush=True)
    time.sleep(60)
