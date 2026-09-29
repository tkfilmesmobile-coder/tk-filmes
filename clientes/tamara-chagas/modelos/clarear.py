"""Aplica o tema claro num post.html (e story.html) já montado no modelo escuro.
uso: python modelos/clarear.py <arquivo.html> [<arquivo2.html> ...]"""
import sys, pathlib
css = (pathlib.Path(__file__).resolve().parent / "tema-claro.css").read_text(encoding="utf8")
for arq in sys.argv[1:]:
    p = pathlib.Path(arq); h = p.read_text(encoding="utf8")
    if "tema-claro" not in h:
        h = h.replace("</head>", f"<style>/* tema-claro */\n{css}</style>\n</head>", 1)
    h = h.replace("simbolo-transparente.png", "simbolo-escuro.png").replace("logo-transparente.png", "logo-escuro.png")
    p.write_text(h, encoding="utf8"); print("ok", p.name)
