"""Carrossel "As raízes da sua marca", o post do reels "O marketing é como uma planta" (IMG_1713, aprovado em
16/11/2026). Ensina o que o vídeo traz de novo em relação ao carrossel-planta das referências (29/11): as quatro
raízes, uma por página, cada uma com um exemplo do dia a dia. Linha do papel (mesma do carrossel-planta).
uso (na raiz do sistema): python tk-filmes/posts/2026-11/raizes/gerar.py
"""
import sys, pathlib
AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parents[2] / "modelos"))
from pecas import frase, render

ARR = "arraste →"

def pags(lista, rotulo="", ultima_rod="@tk.filmes"):
    n = len(lista); out = []
    for i, p in enumerate(lista, 1):
        t = p if isinstance(p, tuple) else (p,)
        texto, sub, tam = (t + ("", 96)[len(t) - 1:])[:3]
        out.append(frase(texto, rotulo=rotulo if i == 1 else "", num=i, tam=tam, assinatura="", sub=sub,
                         rodape=ARR if i < n else ultima_rod))
    return out

PAGINAS = pags([
    ("Seu perfil parou<br>de crescer ou está<br>criando [[raízes?]]", "", 100),
    ("No começo,<br>[[tudo cresce.]]", "Gente chegando, curtida, comentário, compartilhamento."),
    ("Aí parece que<br>[[tudo trava.]]", "É aqui que muita gente desiste. Bem na hora errada."),
    ("Raiz 1<br>[[reconhecimento.]]", "O cliente vê o seu post e sabe que é seu antes de ler o nome."),
    ("Raiz 2<br>[[posicionamento.]]", "Ele sabe o que você faz, pra quem, e por que é com você."),
    ("Raiz 3<br>[[confiança.]]", "Ele acredita no que você mostra, porque você mostra sempre."),
    ("Raiz 4<br>[[relacionamento.]]", "Ele conversa com você. Não só assiste."),
    ("Marketing não é<br>sobre [[amanhã.]]", "É sobre construir algo concreto, ao longo do tempo."),
    ("Qual raiz a sua<br>marca precisa<br>[[regar primeiro?]]", "Me conta aqui embaixo."),
], rotulo="As raízes da sua marca")

if __name__ == "__main__":
    print(*[p.name for p in render(PAGINAS, "carrossel-raizes", AQUI)], sep="\n")
