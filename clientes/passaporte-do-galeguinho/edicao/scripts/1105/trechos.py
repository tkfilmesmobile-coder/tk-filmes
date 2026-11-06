"""Trechos escolhidos da visita ao Açougue Diniz (gravação de 2026-11-05, curadoria de 2026-11-06).
Cada início e fim saiu do detector de voz (voz.py) e, onde a fala emenda sem pausa, do espectrograma (espectro.py);
nunca do tempo de palavra da transcrição.

Quem fala: o dono do Passaporte do Galeguinho (camisa marrom; "eu, como proprietário", IMG_1322) e o Eduardo, o "Dudu",
do Açougue Diniz (camisa azul com a logo do Diniz). Boca × voz conferida por quadro em cada trecho com rosto.

FICOU DE FORA, e por quê:
- IMG_1310 "Fala, pessoal, beleza? Bom dia, bom dia" (saudação; o gancho é o "dia inédito") e "Mas agora sim é o momento...
  bora comigo" (a abertura fica curta; o resto da fala vem colado, sem pausa pra cortar).
- IMG_1316: 2ª tentativa da fala do Eduardo (IMG_1315 é a boa: as duas passadas do Whisper ouvem "Passaporte do Galeguinho";
  na 1316 elas ouvem "Galeguinha").
- IMG_1320 (conversa de bastidor: água com gás, "pega lá duas picanhas"), IMG_1321 (começo abortado, repetido na 1322),
  IMG_1332 0–4 s ("se tu quiser ir falando, tu vai falando": orientação de quem grava).
- IMG_1322 inteira: repete o que a 1312 e a 1329 dizem melhor (rigidez, "julgar só pelo valor").
- IMG_1329: "esse cara é muito f*da, desculpa o palavrão" (palavrão, e vem colado no "que é a nossa carne": o blend fecha em
  "nosso blend"); "por trás de toda a... de todo o produto" (tropeço no meio da frase); "você quer me comprometer" (brincadeira
  de bastidor); fala sobre preço ("o cara reclama do preço da carne... vai atacar o lanche"), que soa como bronca no cliente;
  "Porra, tá aqui gelinho gostoso".
- IMG_1330: a voz do começo é sobre a câmera apontada pro chão (sem imagem); a história do carrinho é boa, mas o vídeo já
  passa de 1 min 40 s e ela repete a ideia do "fazer o certo".
- IMG_1331 (filé mignon): é o sanduíche de filé, não a carne do hambúrguer; fica pra um vídeo próprio.
- IMG_1332 "o correto dá trabalho... grão de feijão... agradecer a Deus" e o disco de moer: bons, mas alongam; ficam de reserva.
- IMG_1333 "eu como dono... nada diferente ele vai ser entregue" (frase atropelada) e "lembrando, lembrando, com a melhor carne"
  (repetição colada na brincadeira "briga você").
- IMG_1338: o dono indica o serviço de marketing da TK. Não é assunto do perfil do Galeguinho; fica pra TK, se ela quiser.

v3 (2026-11-06, pedido da Talyta: "as falas sobre o padrão de qualidade"): entraram confianca (dono: escolher açougue pelas
pessoas, não pela aparência), preza (Eduardo: "se o cliente pediu tal carne, vai tal carne"), higiene (Eduardo: o padrão
segue todo dia, não só na filmagem) e temperatura (dono: o fornecedor segue o padrão lá e ele segue o dele na casa).
Das mesmas falas ficaram de fora: "Ele falou um pouco aqui da questão de manter a qualidade" (só aponta pro dono), "não
adianta eu chegar, dizer ah tem, colocar outra carne no lugar do... da carne" (tropeço) e "aí anda a confiança do cliente
e do fornecedor" (a câmera vira no meio e a frase troca de pessoa); "Até porque uma câmara... higienizada passa o cheiro"
(tropeço); "Aqui nós segue um padrão de higiene, é água, sabão neutro" (vem colado no "passa pra carne", sem pausa).

Imagem: ("v", clipe, início, duração). Duração None = o que sobrar do trecho.
B-roll sem repetição (regra 5 da curadoria): a máquina de moer aparece só onde ela é o assunto (moagem, "crua", fecho);
as inserções usam a câmara fria (abre), o Eduardo abrindo a câmara (confianca), as mãos ensacando a carne moída (blend),
o Eduardo de costas na loja (preza), a vitrine e a faca (ponte1), a peça de carne pendurada na mão dele e a peça na
balança (ponte2), cada uma uma vez.
"""

TRECHOS = [
    # gancho: "Olha" começa em 4,58 (silêncio 4,35–4,58); "antes" termina em 12,74 (silêncio até 13,18)
    dict(id="abre", txt="Olha, dia inédito para o Passaporte do Galeguinho. Vou mostrar de perto a nossa produção de carne, coisa que eu nunca mostrei antes.",
         som=("IMG_1310", 4.45, 12.95),
         img=[("v", "IMG_1310", 4.45, 3.6), ("v", "IMG_1329", 185.4, 1.7), ("v", "IMG_1310", 9.75, None)]),
    # a parceria: a voz começa em 0,2 s (o "Aí" está inteiro); "topada" termina em 20,61
    dict(id="parceria", txt="Aí vocês acham que o melhor Passaporte de São José da Laje, com o peso do nome que tem, eu ia escolher outro frigorífico? Ó, Açougue Diniz, melhor que tem em São José da Laje. O parceiro aqui abraçou a causa de pegar pra fazer a melhor carne de hambúrguer do estado de Alagoas. Então, Açougue Diniz, parceria topada.",
         som=("IMG_1312", 0.05, 20.75),
         img=[("v", "IMG_1312", 0.05, 7.7), ("v", "IMG_1320", 2.2, 3.0), ("v", "IMG_1312", 10.75, None)]),
    # o Eduardo (1ª tentativa, a boa): voz de 0,83 a 6,78
    dict(id="eduardo", txt="Aqui a gente garante a melhor qualidade e não poderia ser diferente com o Passaporte do Galeguinho.",
         som=("IMG_1315", 0.60, 6.92), img=[("v", "IMG_1315", 0.60, None)]),
    # respiro: vitrine e faca na carne, sem fala (a trilha sobe)
    dict(id="ponte1", dur=2.6, img=[("v", "IMG_1319", 0.3, 1.0), ("v", "IMG_1323", 2.0, None)]),
    # v3 (pedido da Talyta, 2026-11-06): o dono sobre escolher fornecedor. Voz de 26,11 ("Também", colado no "existe":
    # o "galera, é o seguinte" antes vem emendado no tropeço "e uma coisa muito") até 46,59 ("certo"); emenda direto no
    # blend. Na parte "pessoas competentes" a imagem vai pro Eduardo trabalhando (abrindo a câmara fria).
    dict(id="confianca", txt="Também existe muito a questão de você confiar no açougue que você está pegando. Porque muitas vezes a galera escolhe, ah, porque é um açougue bonito, que é isso, que é aquilo. Mas de nada adianta se o açougue for bonito, mas dentro dele não tiver pessoas competentes, pessoas que trabalham pelo certo.",
         som=("IMG_1329", 26.00, 46.72),
         img=[("v", "IMG_1329", 26.00, 15.6), ("v", "IMG_1329", 9.4, None)]),
    # o blend: "E eu" começa em 46,88 (silêncio 46,59–46,88); o "blend" acaba no vale de 56,05, antes do "que é a nossa carne"
    dict(id="blend", txt="E eu, juntamente com o Eduardo, a gente construiu uma amizade muito forte. E aí, a gente conversando e tal, a gente chegou à conclusão do nosso blend.",
         som=("IMG_1329", 46.72, 56.03),
         img=[("v", "IMG_1329", 46.72, 5.0), ("v", "IMG_1333", 6.5, 2.0), ("v", "IMG_1329", 53.72, None)]),
    # o Eduardo: a carne exclusiva. Voz de 152,58 a 165,54; o "também" (165,79) fica fora
    # v3: sem o "Verdade" das versões anteriores. O espectrograma tem silêncio de 151,95 a 152,55 e a fala começa colada
    # em "A carne"; cortando em 152,62 os dois modelos ouvem "A carne dele" inteiro, então não cabe "Verdade" ali. O large
    # inventava a palavra a partir do "né, Dudu?" que vem antes (no clipe inteiro ele mesmo não ouve).
    dict(id="exclusiva", txt="A carne dele tem uma carne que eu não cedo pra ninguém. A carne é só pra ele. Porque se eu cedesse pra vender no balcão, ia faltar a carne de eu servir pra sair na qualidade que ele precisa.",
         som=("IMG_1329", 152.30, 165.65), img=[("v", "IMG_1329", 152.30, None)]),
    # v3: o Eduardo sobre o padrão do Diniz. Voz de 114,14 ("A gente"; "qualidade" anterior acaba em 113,73) a 122,27
    # ("vai tal carne"; "não adianta" só em 122,75). Abre com ele de costas na loja (IMG_1313, sem fala) pra não
    # emendar o rosto dele em outro plano do rosto dele.
    dict(id="preza", txt="A gente aqui no Açougue Diniz preza a qualidade para o cliente. Se o cliente pediu tal carne, vai tal carne.",
         som=("IMG_1329", 113.95, 122.50), img=[("v", "IMG_1313", 5.2, 1.6), ("v", "IMG_1329", 115.55, None)]),
    # câmara fria: voz de 225,50 a 231,26 ("Para vocês verem" só em 231,62)
    dict(id="camara", txt="Galera, a gente tá dentro do coração do frigorífico. É a câmara fria.",
         som=("IMG_1329", 225.35, 231.42), img=[("v", "IMG_1329", 225.35, None)]),
    # v3: o Eduardo, dentro da câmara, sobre o padrão de higiene. "Na hora da limpeza" acaba em 304,07 colado no "E esse"
    # (pausa de 0,05 s): o corte fica no vale de 304,10. O "E" é dele (cortando em 304,14, 304,18 e 304,24 os dois modelos
    # ainda ouvem "E esse"). "diferente" acaba em 311,15; o "Até" vem logo depois.
    dict(id="higiene", txt="E esse padrão de higiene, nós seguimos normalmente todo dia. Não é porque hoje nós estamos filmando que poderia ser diferente.",
         som=("IMG_1329", 304.10, 311.20), img=[("v", "IMG_1329", 304.10, None)]),
    # v3: o dono sobre o fornecedor seguir o mesmo padrão que ele segue na casa. Voz de 373,02 a 385,02 ("lá"; o "por
    # isso que eu lembro" só em 385,31). "Câmara" sai "câmera" na fala (as duas passadas); "no meu lado": o large ouve
    # "lado" com certeza, o medium "lá".
    dict(id="temperatura", txt="Câmara fria dentro dos padrões de temperatura, que isso é uma coisa muito importante, que a galera não segue à risca. Eles seguem aqui e eu sigo no meu lado. Eu tenho o meu padrão de temperatura lá.",
         som=("IMG_1329", 372.86, 385.12), img=[("v", "IMG_1329", 372.86, None)]),
    dict(id="ponte2", dur=2.0, img=[("v", "IMG_1329", 261.0, 1.0), ("v", "IMG_1325", 1.0, None)]),
    # moagem: "A gente acabou de sair" começa em 55,30 (silêncio 54,82–55,30); "saindo" termina em 65,79
    dict(id="moagem", txt="A gente acabou de sair da câmara frigorífica, a gente está num ambiente climatizado, então tá tudo dentro do padrão. Você vê a qualidade da carne que está saindo.",
         som=("IMG_1332", 55.25, 66.00), img=[("v", "IMG_1332", 55.25, None)]),
    # o momento leve: voz de 241,4 a 244,58 ("vamos modelar" só em 245,8)
    dict(id="crua", txt="Dá vontade de comer crua. Oxe, tu é doido, mano.",
         som=("IMG_1332", 241.30, 244.55), img=[("v", "IMG_1332", 241.30, None)]),
    # carne buscada todo dia: "Se" começa em 77,98; "você" acaba no vale de 90,96, antes do "Eduardo" (é "pra você", no singular:
    # no espectrograma não há "s" entre o "cê" e o "E" de Eduardo; as passadas no clipe inteiro deduziram "vocês")
    dict(id="todo-dia", txt="Se você tem um frigorífico que te entrega todo dia, por que você vai pegar a carne pra passar 3, 4, 5 dias? Cara, eu não vou. Eu vou dar trabalho pra ele, vou dar trabalho todos os dias pra ele. Eu não quero nem saber, eu quero entregar o melhor pra você.",
         som=("IMG_1333", 77.85, 90.96), img=[("v", "IMG_1333", 77.85, None)]),
    # a chamada: "Você" começa em 126,85 (o "cara" anterior acaba em 126,62); "vida" acaba em 133,18
    dict(id="chamada", txt="Você não sabe o que você tá perdendo. Você vai comer o melhor hambúrguer da sua vida.",
         som=("IMG_1333", 126.74, 133.30), img=[("v", "IMG_1333", 126.74, None)]),
    # fecho: selo da casa e horário sobre a carne saindo da máquina
    dict(id="fecho", dur=3.6, img=[("v", "IMG_1332", 270.0, None)]),
]
