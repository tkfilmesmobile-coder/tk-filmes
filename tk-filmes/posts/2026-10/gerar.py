"""Gera as artes estáticas de outubro/2026 da TK (texto em tk-filmes/calendarios/2026-10-calendario.md).
uso: python tk-filmes/posts/2026-10/gerar.py
"""
import sys, pathlib
AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parents[1] / "modelos"))
from pecas import frase, tweet, conversa, bastidor2, render

P = [
    ("2026-10-05-frase-manifesto", frase("Seu celular filma em 4K.<br>O problema é<br>[[o que você fala.]]", rotulo="Manifesto", num=1)),
    ("2026-10-07-tweet-semana-que-vem", tweet(["“Semana que vem eu começo a postar.”", "— eu, há 3 anos 🤡"])),
    ("2026-10-09-bastidor-chegou-agora", bastidor2("Você cuida do negócio.<br>[[Eu cuido de como ele aparece.]]",
        ["acao-gravando-celular.jpg", "detalhe-mao-notebook.jpg"], ["direção", "roteiro"],
        rotulo="Chegou agora?", num=2, pos=("58% 30%", "45% 50%"), tam=70)),
    ("2026-10-12-tweet-abandonado", tweet(["5 jeitos de deixar seu Instagram com cara de abandonado:",
        "1. bio “amor pelo que faço”<br>2. arte pronta de data comemorativa<br>3. nenhum vídeo seu<br>4. último post: 2023<br>5. nenhum jeito de falar com você 🤡"], tam=44)),
    ("2026-10-14-conversa-bombar-escondido", conversa([
        ("cliente", "Quero bombar no Instagram.", "10:02"),
        ("eu", "Bora! Vamos gravar?", "10:02"),
        ("cliente", "Gravar não. Não gosto de aparecer.", "10:03"),
        ("eu", "[[Então vamos bombar escondido?]] 🤡", "10:03")], rotulo="Toda semana", num=3)),
    ("2026-10-16-frase-boleto", frase("Vergonha de aparecer<br>[[não paga boleto.]]", rotulo="Verdade inconveniente", num=4)),
    ("2026-10-19-conversa-academia", conversa([
        ("cliente", "Quero resultado em 7 dias.", "08:40"),
        ("eu", "Você faz academia?", "08:40"),
        ("cliente", "Faço.", "08:41"),
        ("eu", "[[Ficou sarado em 7 dias?]] 🤡", "08:41")], rotulo="Expectativa × realidade", num=5)),
    ("2026-10-21-frase-stalkeia", frase("Seu cliente te stalkeia<br>[[antes de te pagar.]]", rotulo="Aceita que dói menos", num=6)),
    ("2026-10-23-conversa-video-ou-vender", conversa([
        ("cliente", "Quanto custa um vídeo?", "14:10"),
        ("eu", "Você quer um vídeo ou quer vender?", "14:10"),
        ("cliente", "Vender, né.", "14:11"),
        ("eu", "[[Então não é um vídeo.]] Me chama no WhatsApp 😉", "14:11")], rotulo="Perguntas que eu recebo", num=7)),
    ("2026-10-26-conversa-viral", conversa([
        ("cliente", "Faz um vídeo viral pra mim?", "09:05"),
        ("eu", "Faço. O que você vende?", "09:05"),
        ("cliente", "Ainda tô definindo.", "09:06"),
        ("eu", "[[Viral de quê, então?]] 🤡", "09:06")], rotulo="Toda semana", num=8)),
    ("2026-10-28-tweet-nao-sei-falar", tweet(["“Não sei falar na câmera.”",
        "Mas explica o próprio trabalho pro cliente todo santo dia, sem gaguejar. 🤔"])),
]

if __name__ == "__main__":
    for nome, html in P:
        for o in render([html], nome, AQUI):
            print(o.name)
