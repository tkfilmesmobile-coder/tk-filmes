"""Posts da TK feitos a partir das 18 referências que a Talyta mandou (2026-11-04).
Texto reescrito no jeito dela (DNA da linguagem), não copiado. Tweets na estética do tweet da TK
(foto de perfil atual, @tk.filmes). Carrosséis completos na linha do papel.
uso (na raiz do sistema): python tk-filmes/posts/2026-11/referencias/gerar.py [slug ...]
"""
import sys, pathlib
AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parents[2] / "modelos"))
from pecas import tweet, frase, meme, render

AV = "perfil-instagram-atual.jpg"  # foto de perfil atual do @tk.filmes (baixada do perfil em 04/11)
TW = lambda linhas, **k: tweet(linhas, avatar=AV, **k)
ARR = "arraste →"

def pags(lista, rotulo="", ultima_rod="@tk.filmes"):
    """Carrossel na linha do papel: numera, tira a assinatura, 'arraste' no rodapé até a última."""
    n = len(lista); out = []
    for i, p in enumerate(lista, 1):
        t = p if isinstance(p, tuple) else (p,)
        texto, sub, tam = (t + ("", 96)[len(t) - 1:])[:3]
        out.append(frase(texto, rotulo=rotulo if i == 1 else "", num=i, tam=tam, assinatura="", sub=sub,
                         rodape=ARR if i < n else ultima_rod))
    return out

POSTS = {
    # 1 · ref. @luispaiva.agromkt (tweet)
    "tweet-regra-aparecer": [TW(["Regra do marketing:",
        "Postou uma vez e já quer vender? Gente, calma. 🤡",
        "O cliente precisa te ver, te reconhecer, lembrar de você e confiar. Só depois ele compra.",
        "Quem aparece uma vez é visto. Quem aparece sempre é lembrado."], tam=46)],
    # 2 · ref. @eu_amandanogueira (carrossel)
    "carrossel-repeticao": pags([
        ("Gravar sempre no<br>mesmo lugar<br>[[é marketing.]]",),
        ("Usar sempre os<br>mesmos tons de roupa<br>[[é marketing.]]",),
        ("Ter os mesmos<br>objetos em cena<br>[[é marketing.]]",),
        ("Tudo que você repete<br>vira [[memória]]<br>pra quem te assiste.",),
        ("Quando o cliente te<br>reconhece antes de<br>ler o seu nome,<br>[[tá funcionando.]]", "", 90),
        ("Marketing é tudo<br>que [[comunica]]<br>a sua marca.",),
        ("E você,<br>o que [[repete]]<br>nos seus vídeos?", "Me conta aqui embaixo."),
    ], rotulo="Repetição"),
    # 3 · ref. reel @lucasdavoic (vira tweet)
    "tweet-grama-do-vizinho": [TW(["A grama do vizinho não é mais verde por sorte.", "Ele rega toda semana. 🌱"])],
    # 4 · ref. @kauerodrigues.o (tweet)
    "tweet-lembrado": [TW(["Viral te dá seguidor por dois dias.", "Ser lembrado te dá cliente o ano inteiro."])],
    # 5 · ref. @agenciajeffersonmonteiro (frase)
    "frase-so-postar": [frase("Se pra você<br>marketing é só postar,<br>[[você tá só postando.]]", rotulo="Aceita que dói menos", tam=92)],
    # 7 · ref. @thesocialmediacollab (carrossel)
    "carrossel-verdades": pags([
        ("Verdades duras<br>sobre [[marketing.]]", "Arraste. Vai doer um pouquinho.", 104),
        ("Não existe<br>[[horário mágico]]<br>pra viralizar.",),
        ("O que funcionou<br>pro vizinho pode<br>[[não funcionar pra você.]]", "", 90),
        ("Desconfia de quem<br>[[promete resultado.]]",),
        ("Trend não é<br>estratégia.<br>[[É trend.]]",),
        ("Postar todo dia<br>não adianta se você<br>[[não tem o que dizer.]]", "", 90),
        ("O post que vende<br>nem sempre é<br>[[o que mais engaja.]]",),
        ("Não tem fórmula.<br>Tem [[método.]]", "Estratégia, teste e constância. Nessa ordem.", 104),
    ], rotulo="Sem filtro"),
    # 8 · ref. @marimarinhomkt (frase)
    "frase-um-pra-cem": [frase("Enquanto você explica<br>o seu trabalho<br>pra uma pessoa,<br>[[um vídeo explica pra cem.]]",
        rotulo="O valor de um vídeo", tam=80, sub="E você nem precisa estar lá.")],
    # 9 · ref. @creativeuai (carrossel)
    "carrossel-custa-sozinho": pags([
        ("Quanto custa cuidar<br>do Instagram<br>[[sozinho?]]", "", 100),
        ("Custa ter um perfil<br>que não mostra a<br>[[qualidade]] do<br>seu trabalho.", "", 92),
        ("Custa virar<br>[[mais uma tarefa]]<br>no fim do dia.", "Enquanto você atende, o perfil fica esperando."),
        ("Custa tempo,<br>cliente e<br>[[paz.]]",),
        ("Se ainda não dá<br>pra delegar,<br>[[organiza.]]", "Um dia fixo pra gravar. Dois dias fixos pra postar."),
    ], rotulo="Faz as contas"),
    # 10 · ref. @stefanioliveira.oficial (tweet)
    "tweet-coragem": [TW(["Pelo menos uma vez na vida, vai com mais coragem do que certeza.",
        "(Foi assim que eu postei o meu primeiro vídeo.)"])],
    # 11 · ref. @olivamktig (meme)
    "tweet-intencionalidade": [TW(["às vezes eu falo “intencionalidade” na reunião só pra parecer mais estratégica 😎"])],
    # 12 · ref. @olivamktig (meme) · tweet só com texto (ela não quer tweet com foto, 2026-11-04)
    "tweet-23h": [TW(["9h: não tenho nenhuma ideia de conteúdo", "23h, deitada: 14 roteiros prontos na cabeça 🤡"])],
    # 13 · ref. @sigocaos (frase)
    "frase-dia-bom": [frase("Tem dia que o celular<br>é só cliente, pix e elogio.<br>Aí você lembra<br>[[por que começou.]]",
        rotulo="Dia bom", tam=82)],
    # 14 · ref. @giubeckers (tweet)
    "tweet-videozinho": [TW(["“É só um videozinho.”", "— disse alguém que nunca regravou o mesmo vídeo sete vezes. 🤡"])],
    # 15 · ref. @geniodocelular_rc (frase)
    "frase-talento-parado": [frase("Ser bom no que faz<br>e não aparecer é<br>[[talento parado.]]", rotulo="Verdade inconveniente", tam=96)],
    # 16 · ref. @xtrategi.mkt (tweet, piada trocada: a original usa "hospício")
    "tweet-malabarista": [TW(["A diferença entre quem trabalha com marketing e um malabarista:",
        "o malabarista sabe quantas bolinhas tem no ar. 🤡"])],
    # 17 · ref. @bersotgabriel (carrossel de tweets)
    "carrossel-melancia": [
        TW(["Um senhorzinho vendia melancia na beira da estrada.", "A placa dizia:", "<b>1 por R$ 3<br>3 por R$ 10</b>"], tam=48),
        TW(["Um rapaz parou e comprou uma.", "<span class='cz'>“R$ 3”</span>, disse o velho.",
            "Ele comprou mais uma. Depois outra. Pagou R$ 3 em cada."], tam=48),
        TW(["Aí virou pro velho, todo orgulhoso:",
            "<span class='cz'>“Ô, seu moço, percebeu? Levei três por R$ 9 em vez de R$ 10. Negócio não é a sua praia, né?”</span>"], tam=48),
        TW(["O velho sorriu e balançou a cabeça:",
            "<span class='cz'>“Engraçado… toda vez que alguém tenta me ensinar a fazer negócio, leva três melancias em vez de uma.”</span>"], tam=48),
        TW(["Tem gente que vai tentar te corrigir.", "Às vezes, é a mesma pessoa que tá levando três melancias. 🍉"], tam=50, escuro=True),
    ],
    # 18 · ref. @marketing.aurea (carrossel)
    "carrossel-planta": pags([
        ("O marketing<br>é como uma<br>[[planta.]]", "", 104),
        ("Tudo começa com<br>uma [[semente.]]", "Estratégia: pra quem você fala e o que quer dizer."),
        ("Depois, é preciso<br>[[regar.]]", "Constância: nos mesmos dias, toda semana."),
        ("Por um tempo,<br>parece que<br>[[nada acontece.]]",),
        ("Mas embaixo da terra,<br>[[tudo tá crescendo.]]", "Confiança, lembrança, autoridade.", 90),
        ("Até que os frutos<br>[[chegam.]]", "Mensagem no WhatsApp. Cliente novo. Indicação."),
        ("Planta certo.<br>Rega sempre.<br>[[Colhe.]]", "Em que fase você tá hoje: semente, rega ou espera?"),
    ], rotulo="Uma metáfora"),
}

if __name__ == "__main__":
    alvo = sys.argv[1:] or list(POSTS)
    for slug in alvo:
        print(slug, [p.name for p in render(POSTS[slug], slug, AQUI / "artes")])
