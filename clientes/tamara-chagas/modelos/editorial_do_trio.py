"""Monta o editorial.json (versão do escritório) a partir do trio.json (versão pessoal) de um post,
pra seguir a regra: post em colaboração → mesmo conteúdo nos dois perfis, visual diferente.

uso: python modelos/editorial_do_trio.py <pasta-com-trio.json> "<kicker>" "<titulo fino <b>forte</b>>" [foto]
Telas: 1 capa (título do post + foto da Tamara) · 2 o que saber (notas) · 3 dúvida comum (conversa) · 4 fecho.
"""
import json, re, sys, pathlib

EMOJI = re.compile(r"[\U0001F000-\U0001FAFF☀-➿️⬀-⯿]+")
limpa = lambda s: EMOJI.sub("", s).strip()
cap = lambda s: s[:1].upper() + s[1:] if s else s
def frase(s):
    s = limpa(s)
    return s if s[-1:] in ".!?" else s + "."

def main():
    pasta = pathlib.Path(sys.argv[1]); kicker, titulo = sys.argv[2], sys.argv[3]
    foto = sys.argv[4] if len(sys.argv) > 4 else "tamara/tamara-estudio-0046.jpg"
    t = json.loads((pasta / "trio.json").read_text(encoding="utf-8-sig"))
    n = t["notas"]
    pergunta = next(x[1] for x in t["conversa"] if x[0] == "in")
    respostas = " ".join(cap(frase(x[1])) for x in t["conversa"] if x[0] == "out")
    telas = [
        {"kicker": kicker, "titulo": titulo, "foto": foto, "foto_css": "left:330px;top:900px;width:1100px",
         "texto": "O post completo tá no feed. Aqui vai o resumo 👇"},
        {"kicker": "O QUE SABER", "titulo": cap(limpa(n["titulo"]).rstrip("?.")) + ("?" if limpa(n["titulo"]).endswith("?") else "."),
         "tam": 84, "texto": "<br><br>".join(n["linhas"])},
        {"kicker": "DÚVIDA COMUM", "titulo": "“" + cap(limpa(pergunta).replace("Doutora, ", "")) + "”", "tam": 64,
         "texto": respostas},
        {"kicker": "TAMARA CHAGAS ADVOCACIA", "titulo": "Cada caso <b>é único.</b>",
         "texto": "Na dúvida, procure orientação profissional.<br><br>Conteúdo em colaboração com <b>@dra.tamarachagas_</b>.",
         "foto": "tamara/tamara-estudio-0110.jpg", "foto_css": "left:330px;top:980px;width:1100px"},
    ]
    (pasta / "editorial.json").write_text(json.dumps({"fonte": t["fonte"], "telas": telas}, ensure_ascii=False, indent=1), encoding="utf8")
    print("ok", pasta / "editorial.json")

if __name__ == "__main__":
    main()
