"""Legendas dos posts de datas comemorativas (nov/dez 2026), na voz da Dra. Camilla. Grava legenda.md em cada pasta."""
import os

POSTS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSINA = "\n\nDra. Camilla Wanderley · Clínica Geral e Endodontia · às quintas na CIP, União dos Palmares"

LEG = {
    "2026-11/02-semana-cancer-bucal": """Uma ferida na boca que não sara em 15 dias não é "só uma afta".

Começa hoje a Semana Nacional de Prevenção do Câncer Bucal, e ela cai bem no Novembro Azul. O câncer de boca é mais comum em homens depois dos 40, justamente quem mais adia a consulta.

Mancha branca ou avermelhada, caroço, ferida que insiste, prótese que machuca sempre no mesmo lugar: o corpo avisa. Quanto antes alguém olha, mais simples costuma ser o caminho.

Se você conhece um homem que "só vai ao dentista quando dói", manda isso pra ele. 🤍

#novembroazul #cancerbucal #saudebucal #uniaodospalmares""",

    "2026-11/14-dia-mundial-do-diabetes": """Diabetes e gengiva conversam mais do que a gente imagina.

A inflamação da gengiva dificulta o controle da glicose, e a glicose alta deixa a gengiva mais frágil. Uma coisa puxa a outra.

Sangramento ao escovar, gengiva inchada, mau hálito que não passa: em quem tem diabetes, esses sinais pedem atenção. Cuidar da boca também faz parte do tratamento.

Neste Dia Mundial do Diabetes, se você ou alguém da sua casa tem o diagnóstico, vale incluir o dentista na rotina de cuidados. 🤍

#diamundialdodiabetes #diabetes #gengiva #saudebucal""",

    "2026-11/17-prematuridade": """Meu pai passou a vida cuidando de quem chega ao mundo.

Hoje, Dia Mundial da Prematuridade, eu penso nele e em tantas mães que ele acompanhou aqui em União. E penso no meu pedaço desse cuidado: o sorriso da mãe.

A gengiva inflamada na gestação é estudada como um dos fatores que podem estar ligados ao parto prematuro. A ciência ainda debate o tamanho dessa relação, mas uma coisa é certa: dentista também faz parte do pré-natal.

Se você está grávida ou planejando, me chama no direct. 🤍

#novembroroxo #prematuridade #prenatal #gestante""",

    "2026-11/20-consciencia-negra": """Toda quinta eu chego à terra de Zumbi dos Palmares.

União dos Palmares guarda a Serra da Barriga, onde o Quilombo dos Palmares resistiu por quase um século. Uma cidade que ensina o Brasil a resistir.

Hoje, Dia Nacional de Zumbi e da Consciência Negra, é dia de lembrar, respeitar e honrar essa história. 🤍

#consciencianegra #zumbidospalmares #serradabarriga #uniaodospalmares""",

    "2026-12/08-dia-da-familia": """Na minha casa, cuidar de gente sempre foi assunto de mesa.

Cresci vendo meu pai cuidar das famílias de União. Hoje divido a vida e a profissão com quem também escolheu cuidar de sorrisos. E é por eles que eu entendo o que significa confiar a saúde de alguém que a gente ama.

Feliz Dia Nacional da Família. Que a sua tenha sempre quem cuide dela. 🤍

#diadafamilia #familia #uniaodospalmares""",

    "2026-12/25-natal": """Que o seu Natal tenha mesa cheia, gente querida e muitos motivos pra sorrir de verdade.

Obrigada por cada quinta, cada conversa e cada sorriso confiado a mim neste ano. Feliz Natal! 🤍

#natal #felizNatal #uniaodospalmares""",
}

for pasta, texto in LEG.items():
    p = os.path.join(POSTS, pasta.replace("/", os.sep))
    with open(os.path.join(p, "legenda.md"), "w", encoding="utf-8") as f:
        f.write(texto + ASSINA + "\n")
    print(pasta)
