import json, pathlib
p = json.loads((pathlib.Path(__file__).resolve().parent.parent / "public" / "rastreio.json").read_text(encoding="utf8"))
for a in range(0, 26):
    seg = [x for x in p if a <= x["t"] < a + 1]
    if seg:
        print(f"{a:2d}s  x {min(s['x'] for s in seg):.3f}-{max(s['x'] for s in seg):.3f}  y {min(s['y'] for s in seg):.3f}-{max(s['y'] for s in seg):.3f}  w {min(s['w'] for s in seg):.3f}-{max(s['w'] for s in seg):.3f}  n={len(seg)}")
