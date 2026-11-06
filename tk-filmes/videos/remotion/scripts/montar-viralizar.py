"""Monta public/viralizar/edicao.json do reels "Viralizar não é o objetivo" (bruto IMG_1128, 04/11/2026).
v2 (04/11): headlines fortes com zoom alto, movimento acompanhando o rosto, exemplo na prática (curte ✓ comenta ✓ compra ✕).
uso: python scripts/montar-viralizar.py
"""
from montar_base import Reel, CARAMELO
r = Reel("viralizar")
a = r.acha

# 0 · gancho: o que ela mais escuta
t_escuto = a("escuto"); t_viral = a("viralizar", t_escuto); t_ah = a("ah", t_viral)
r.headline(t_escuto - 0.3, t_ah - 0.1, [("o que mais escuto:", t_escuto - 0.2, None), ("quero viralizar", t_viral, CARAMELO)], forte=True)
t_sera = a("sera", t_ah); t_objetivo = a("objetivo", t_sera); t_pensa = a("pensa", t_objetivo)
r.frase(t_sera - 0.2, t_pensa - 0.15, "Será que viralizar chega no seu objetivo final?", t_objetivo)
r.acompanha(t_sera - 0.2, t_pensa - 0.15, 1.1)

# 1 · viralizou… pra outras cidades
t_uniao = a("uniao", t_pensa); t_viraliza = a("viraliza", t_uniao); t_cidades = a("cidades", t_viraliza)
t_pessoal = a("pessoal", t_cidades)
r.headline(t_uniao - 0.4, t_pessoal - 0.6, [("daqui de União", t_uniao - 0.2, None), ("viralizou", t_viraliza, CARAMELO), ("pra outras cidades", t_cidades, None)], forte=True)
# exemplo na prática: curte ✓ comenta ✓ … compra? ✕
t_curte = a("curte", t_pessoal); t_comenta = a("comenta", t_curte); t_consumo = a("consumo", t_comenta)
t_procurar = a("procurar", t_consumo); t_entenda = a("entenda", t_procurar)
r.cartao(t_pessoal - 0.2, t_entenda - 0.2, [("curtiu", t_curte, "pos"), ("comentou", t_comenta, "pos"), ("comprou", t_procurar, "neg")], etiqueta="o viral")
r.zoom(t_procurar, 1.14)
r.acompanha(t_consumo, t_entenda - 0.2, 1.1)

# 2 · entretenimento ≠ consumo
t_ent = a("entretenimento", t_entenda); t_cons2 = a("consumo", t_ent); t_pessoa2 = a("pessoa", t_cons2)
r.headline(t_ent - 0.4, t_pessoa2 - 0.2, [("entretenimento", t_ent, None), ("≠ consumo", t_cons2, CARAMELO)], forte=True)
t_crit = a("criterioso", t_pessoa2); t_publico2 = a("publico", t_crit)
r.sutil(t_crit - 0.3, t_publico2 + 2.5, "público criterioso")
r.acompanha(t_crit - 0.3, t_publico2 + 2.5, 1.12)
t_viraliz = a("viralizacao", t_publico2); t_quando = a("quando", t_viraliz)
r.headline(t_viraliz - 0.4, t_quando - 0.2, [("viralizar", t_viraliz, None), ("não é o meio certo", t_viraliz + 0.7, CARAMELO)], forte=True)
t_engr = a("engracado", t_quando); t_prof = a("profissional", t_engr); t_mostre = a("mostre", t_prof)
r.cartao(t_engr - 0.6, t_mostre + 2.0, [("o vídeo engraçado", t_engr, "neg"), ("o profissional certo", t_prof, "pos")], etiqueta="na hora de marcar")
r.acompanha(t_mostre, t_mostre + 4.0, 1.1)

# 3 · o que falta não é postar
t_falta = a("falta", t_mostre); t_postar = a("postar", t_falta); t_viralizar3 = a("viralizar", t_postar)
t_bombar = a("bombar", t_viralizar3); t_estr = a("estrategia", t_bombar); t_se = a("se", t_estr)
r.headline(t_postar - 0.4, t_se - 0.15, [("não é postar", t_postar, None), ("não é viralizar", t_viralizar3, None), ("não é bombar", t_bombar, None), ("é estratégia", t_estr, CARAMELO)], forte=True)
t_qualif = a("qualificados", t_se); t_porque = a("porque", t_qualif)
r.sutil(t_qualif - 0.4, t_porque - 0.3, "clientes qualificados")
r.acompanha(t_se, t_porque - 0.3, 1.1)

# 4 · sorte × constância
t_sorte = a("sorte", t_porque); t_lembrado = a("lembrado", t_sorte); t_const = a("constancia", t_lembrado)
t_prim = a("primeiro", t_const)
r.headline(t_porque - 0.2, t_prim - 0.2, [("viralizar é sorte", t_sorte - 0.6, None), ("ser lembrado", t_lembrado, None), ("é constância", t_const, CARAMELO)], forte=True)
t_solida = a("solida", t_prim); t_publicos = a("publicos", t_solida); t_tudo = a("tudo", t_publicos)
r.chips(t_prim - 0.1, t_tudo - 0.2, [("1 · base sólida", t_solida, "pos"), ("2 · novos públicos", t_publicos, "pos")])
r.acompanha(t_prim - 0.1, t_tudo - 0.2, 1.1)
t_pir = a("piramide", t_tudo)
r.headline(t_pir - 0.5, t_pir + 2.6, [("uma pirâmide", t_pir, CARAMELO), ("feita aos poucos", t_pir + 1.2, None)], forte=True)
r.gravar()
