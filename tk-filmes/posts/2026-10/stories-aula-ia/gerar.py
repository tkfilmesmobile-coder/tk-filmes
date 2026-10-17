"""Stories 2026-10-10: noite estudando IA. Versão leve: foto inteira, tipografia fina. Gera os PNGs nesta pasta."""
import sys, pathlib
AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parents[2] / "modelos"))
from stories import leve, render

F = AQUI / "fotos"
paginas = [
    leve(F / "laptop-aula.jpg", "Sexta · 22h · estudando",
         "Hoje a noite foi<br>de [[estudo.]]",
         "Inteligência artificial aplicada a vídeo.<br>As produções seguem na rua.<br>Eu sigo aprendendo o que te serve.",
         pos="center 40%", topo=1150),
    leve(F / "talyta-escuro.jpg", "O que eu tô entendendo",
         "A IA acelera.<br>Ela não decide.",
         "Escreve, corta e organiza rápido.<br>O que mostrar, pra quem e por quê<br>continua sendo decisão sua.",
         pos="center 0%", topo=1180),
    leve(F / "projecao.jpg", "Pra quem já posta",
         "Três coisas que a IA<br>já faz pelo seu Instagram",
         itens=["Transcreve o vídeo que você gravou e devolve a [[legenda]] pra você corrigir.",
                "Transforma a dúvida que o cliente repete toda semana num [[roteiro]] de 40 segundos.",
                "Organiza o mês: você diz o que atende, ela monta o [[calendário]] pra você ajustar."],
         pos="center 12%", topo=1120, rodape="salva isso"),
    leve(F / "laptop-tiago.jpg", "O que ela não faz",
         "Ela não sabe o que<br>o seu cliente precisa ouvir.",
         "Não escolhe o que mostrar. Não tem a sua voz.<br>Isso é [[direção,]] e continua sendo gente.",
         pos="center 30%", topo=1180),
    leve(F / "talyta-sorrindo.jpg", "Faz um teste agora comigo",
         "Começa hoje<br>pelo mais fácil",
         itens=["Grava um áudio de um minuto respondendo a dúvida que mais te perguntam.",
                "Cola numa IA e pede: “vira legenda de Instagram, do jeito que eu falo”.",
                "Lê em voz alta. O que não soa como você, [[corta.]] O resto, posta."],
         pos="right 18%", topo=1040, rodape="salva pra fazer amanhã"),
]
print(*render(paginas, "2026-10-10-stories-aula-ia", AQUI), sep="\n")
