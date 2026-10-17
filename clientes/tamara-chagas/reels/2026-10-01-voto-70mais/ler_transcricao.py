import json, pathlib
d = json.loads((pathlib.Path(__file__).parent / "transcricao.json").read_text(encoding="utf8"))
print(" ".join(f"[{s['offsets']['from']/1000:.2f}]{s['text'].strip()}" for s in d["transcription"] if s["text"].strip()))
