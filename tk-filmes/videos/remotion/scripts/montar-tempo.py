"""Monta public/tempo/edicao.json do reels "Quanto tempo leva 1 minuto de vídeo" (bruto IMG_0651, 28/10/2026).
A conta cresce na tela: uma etiqueta por etapa e o tempo de cada uma entrando forte na palavra dita; no fim, o total.
v2 (04/11): headlines fortes com zoom alto, movimento acompanhando o rosto, exemplos na prática (roteiro: chat genérico
× com sabedoria; pós: a lista das etapas se completando).
uso: python scripts/montar-tempo.py
"""
from montar_base import Reel, CARAMELO
r = Reel("tempo")
a = r.acha

# 0 · gancho
t_quanto = a("quanto"); t_minuto = a("minuto", t_quanto); t_simples = a("simples", t_minuto)
r.headline(t_quanto - 0.2, t_simples - 0.15, [("quanto tempo leva", t_quanto, None), ("1 minuto?", t_minuto, CARAMELO)], forte=True)
t_vamos = a("vamos", t_simples); t_contas = a("contas", t_vamos)
r.sutil(t_simples - 0.05, t_vamos - 0.1, "um simples videozinho")
r.headline(t_vamos - 0.1, t_contas + 0.9, [("vamos fazer", t_vamos, None), ("as contas", t_contas, CARAMELO)], forte=True)

# 1 · a conversa (escuta) → +1 hora
t_prim = a("primeiro", t_contas)
t_escuta = a("escuta", t_prim)
t_botar = a("botar", t_escuta); t_hora = a("hora", t_botar)
t_roteiro = a("roteiro", t_hora)
r.sutil(t_prim - 0.05, t_prim + 2.4, "1 · a conversa")
r.acompanha(t_prim + 2.5, t_escuta - 0.3, 1.1)
r.frase(t_escuta - 0.1, t_botar - 0.4, "Escuta ativa e presencial.", t_escuta)
r.headline(t_botar - 0.3, t_roteiro - 0.6, [("+1 hora", t_hora, CARAMELO)], forte=True)

# 2 · o roteiro → +30 min · exemplo na prática: texto genérico do chat × ferramenta com sabedoria
t_chat = a("chat", t_roteiro); t_sabedoria = a("sabedoria", t_chat); t_30 = a("30", t_sabedoria)
r.sutil(t_roteiro - 0.1, t_chat - 0.3, "2 · o roteiro")
r.cartao(t_chat - 0.2, t_30 - 1.0, [("texto genérico do chat", t_chat, "neg"), ("ferramenta com sabedoria", t_sabedoria, "pos")], etiqueta="roteiro")
t_depois = a("depois", t_30)
r.headline(t_30 - 0.5, t_depois - 0.15, [("+30 min", t_30, CARAMELO)], forte=True)

# 3 · a gravação → +30 min
t_grav = a("gravacao", t_depois)
t_ling = a("linguagem", t_grav); t_nao = a("nao", t_ling)
t_meia = a("meia", t_nao)
r.sutil(t_grav - 0.1, t_ling - 0.3, "3 · a gravação")
r.acompanha(t_grav + 1.0, t_ling - 0.4, 1.1)
r.headline(t_ling - 0.2, t_ling + 3.6, [("linguagem verbal", t_ling, None), ("e não verbal", t_nao, CARAMELO)], forte=True)
r.acompanha(t_ling + 3.8, t_meia - 1.0, 1.12)
t_pos = a("pos", t_meia)
r.headline(t_meia - 0.6, t_pos - 0.3, [("+30 min", t_meia, CARAMELO)], forte=True)

# 4 · a pós-produção → a lista se completando → +1h30
t_edicao = a("edicao", t_pos); t_color = a("colorimetria", t_edicao); t_letter = a("lettering", t_color)
t_efeitos = a("efeitos", t_letter); t_head = a("headline", t_efeitos)
r.sutil(t_pos - 0.3, t_edicao - 0.1, "4 · a pós-produção")
r.chips(t_edicao - 0.1, t_head + 1.6, [("edição", t_edicao, "pos"), ("colorimetria", t_color, "pos"), ("lettering", t_letter, "pos"), ("efeitos sonoros", t_efeitos, "pos"), ("headline", t_head, "pos")])
t_mais = a("mais", t_head); t_hora2 = a("hora", t_mais); t_eai = a("e", a("facilmente", t_hora2))
r.headline(t_mais - 0.2, t_eai - 0.1, [("+1h30", t_hora2, CARAMELO)], forte=True)

# a soma
t_soma = a("somatoria", t_eai); t_nunca = a("nunca", t_soma)
r.headline(t_eai - 0.05, t_nunca - 1.3, [("total:", t_soma - 0.3, None), ("3h30", t_soma, CARAMELO)], forte=True)
t_entao = a("entao", t_nunca)
r.frase(t_nunca - 0.9, t_entao - 0.15, "Um videozinho nunca é só um videozinho.", t_nunca)
r.acompanha(t_nunca - 0.9, t_entao - 0.15, 1.12)
t_preco = a("preco", t_entao); t_voce = a("voce", t_preco)
r.headline(t_preco - 0.5, t_voce - 0.1, [("não coloca preço", t_preco, None), ("no serviço das pessoas", a("servico", t_preco), CARAMELO)], forte=True)
r.acompanha(t_voce, t_voce + 3.0, 1.1)
r.gravar()
