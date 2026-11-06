"""Monta public/barulho/edicao.json do reels "Postar por postar é barulho" (bruto IMG_1132, 04/11/2026).
v2 (pedido da Talyta, 04/11): headlines fortes com zoom alto, movimento acompanhando o rosto, perfil rolando no celular
quando fala do perfil, exemplos na prática, e "estética ✓ / intenção ✕" bem mais forte.
uso: python scripts/montar-barulho.py
"""
from montar_base import Reel, CARAMELO
r = Reel("barulho")
a = r.acha

# 0 · gancho: dois tipos de pessoa
t_dois = a("dois"); t_redes = a("redes", t_dois); t_aquela = a("aquela", t_redes)
r.headline(t_dois - 0.2, t_aquela - 0.1, [("2 tipos", t_dois, CARAMELO), ("de pessoa", t_dois + 0.6, None), ("nas redes", t_redes, None)], forte=True)
t_naoposta = a("nao", t_aquela); t_verg = a("vergonha", t_naoposta); t_mas = a("mas", t_verg)
t_posta = a("posta", t_mas); t_monte = a("monte", t_posta); t_quando = a("quando", t_monte)
r.cartao(t_aquela - 0.1, t_quando - 0.2, [("não posta: tem vergonha", t_naoposta, "neg"), ("posta um monte", t_posta, "pos")], etiqueta="as duas reclamam")
r.zoom(t_monte, 1.12)
t_result = a("resultado", t_quando); t_quando2 = a("quando", t_result)
r.headline(t_result - 0.7, t_quando2 - 0.15, [("sem resultado", t_result - 0.4, CARAMELO)], forte=True)

# 1 · estética tem, intenção não (o diagnóstico, bem forte)
t_analisar = a("analisar", t_quando2)
t_estet = a("estetica", t_analisar); t_intenc = a("intencionalidade", t_estet); t_cliente = a("cliente", t_intenc)
r.acompanha(t_quando2 - 0.1, t_estet - 0.3, 1.1)
r.headline(t_estet - 0.3, t_cliente - 0.25, [("estética ✓", t_estet, None), ("intenção ✕", t_intenc, CARAMELO)], forte=True)
r.zoom(t_estet, 1.1)
t_pensado = a("pensado", t_cliente); t_como = a("como", t_pensado)
r.frase(t_cliente - 0.2, t_como - 0.15, "O cliente não sente que aquilo foi pensado pra ele.", t_pensado)

# 2 · postar por postar é barulho → o perfil "barulhento" rolando
t_sem = a("sem", t_como); t_barulho = a("barulho", t_sem); t_nada = a("nada", t_barulho)
r.headline(t_sem - 0.5, t_barulho + 1.0, [("postar por postar", t_sem, None), ("é barulho", t_barulho, CARAMELO)], forte=True)
t_no2 = a("barulho", t_nada)
r.headline(t_nada - 0.4, t_nada + 0.9, [("nada.", t_nada, CARAMELO)], forte=True)

# 3 · o cliente entra no perfil, olha tudo, não entende e vai embora (celular rolando e jogado pra fora)
t_entra = a("entra", t_no2); t_olha = a("olha", t_entra); t_entende = a("entende", t_olha); t_embora = a("embora", t_entende); t_porque = a("porque", t_embora)
r.feed(t_entra - 0.4, t_porque + 0.2, t_olha, rotulo="o seu perfil", modo="barulho", t_sai=t_embora)

# 4 · estratégia: a dor, o motivo, o serviço, o alívio
t_estrat = a("estrategia", t_porque); t_dor = a("dor", t_estrat); t_qual = a("qual", t_dor)
r.headline(t_estrat - 0.4, t_qual - 0.2, [("estratégia", t_estrat, None), ("a dor do cliente", t_dor - 0.3, CARAMELO)], forte=True)
t_motivo = a("motivo", t_qual); t_serv = a("servico", t_motivo); t_alivio = a("alivio", t_serv); t_mostrar = a("mostrar", t_alivio)
r.chips(t_qual - 0.1, t_mostrar + 1.2, [("o motivo da busca", t_motivo, "pos"), ("o serviço que você oferece", t_serv, "pos"), ("o alívio que você entrega", t_alivio, "pos")])
r.acompanha(t_qual - 0.1, t_mostrar + 1.2, 1.1)
t_meu = a("meu", t_mostrar); t_feito = a("feito", t_meu); t_entao = a("entao", t_feito)
r.frase(t_meu - 0.2, t_feito - 0.6, "“Meu Deus, como eu vivi sem achar esse perfil?”", t_meu)
r.headline(t_feito - 0.5, t_entao - 0.2, [("feito pra mim", t_feito - 0.3, CARAMELO)], forte=True)

# 5 · fecho: analisa o perfil (celular com o Instagram), postar por postar é barulho, estratégia mais profunda
t_anal = a("analisa", t_entao); t_anal2 = a("analisa", t_anal + 0.3); t_entenda = a("entenda", t_anal2)
r.celular(t_anal - 0.3, t_entenda - 0.15, [("painel", t_anal), ("publico", t_anal2)])
t_barulho3 = a("barulho", t_entenda); t_e = a("e", t_barulho3)
r.headline(t_entenda - 0.1, t_e - 0.1, [("postar por postar", t_entenda + 0.3, None), ("é só barulho", t_barulho3, CARAMELO)], forte=True)
t_estr = a("estrategia", t_e); t_prof = a("profunda", t_estr)
r.headline(t_estr - 0.4, t_prof + 1.0, [("estratégia", t_estr, None), ("mais profunda", t_prof, CARAMELO)], forte=True)
r.acompanha(t_e, t_prof + 0.8, 1.12)
r.gravar()
