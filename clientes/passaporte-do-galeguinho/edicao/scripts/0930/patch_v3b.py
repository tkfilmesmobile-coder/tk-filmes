# Patch da edição v3: headlines ancoradas por baixo, zonas novas e trilha de efeitos refeita.
# Pode apagar depois de aplicado.
import re

def troca(path, pares):
    s = open(path, encoding='utf-8').read()
    for a, b in pares:
        assert a in s, (path, a[:60])
        s = s.replace(a, b)
    open(path, 'w', encoding='utf-8').write(s)

# --- legendas: o último headline sem apoio (cabe abaixo do prato)
troca('scripts/0930/legendas.py', [
    ('    (51.55, 52.75, "vem simbora provar|o melhor!", True),',
     '    (51.55, 52.30, "vem simbora provar", False),\n    (52.30, 52.75, "|o melhor!", True),'),
])

# --- Legendas.tsx: headline ancorada pela base (cresce pra cima, nunca invade os controles)
troca('src/Legendas.tsx', [
    ('''  centro: number;
  enfase: number; // tamanho máximo do título da headline
};''', '''  centro: number; // linha central da legenda corrente
  base: number; // linha de baixo da headline (ela cresce pra cima)
  enfase: number; // tamanho máximo do título da headline
};'''),
    ('''  centro: FAIXA.legendaCentro,
  enfase: 136,
};''', '''  centro: FAIXA.legendaCentro,
  base: 1530,
  enfase: 112,
};'''),
    ('''          left: zona.esquerda,
          right: zona.direita,
          top: zona.centro,
          translate: "0px -50%",
          textAlign: "center",
          opacity: interpolate(
            frame,
            [duracao - 3, duracao],
            [1, 0],
            TRAVA,
          ),''', '''          left: zona.esquerda,
          right: zona.direita,
          bottom: 1920 - zona.base,
          textAlign: "center",
          opacity: interpolate(
            frame,
            [duracao - 3, duracao],
            [1, 0],
            TRAVA,
          ),'''),
])

# --- Abertura: trilha refeita com os sons da casa
s = open('src/Abertura.tsx', encoding='utf-8').read()
a = s.index('      <Som nome="perfil entra"'); b = s.index('    </>\n  );\n};', a)
s = s[:a] + '''      <SomDaCasa nome="perfil entra" em={1} som="sopro" volume={0.5} />
      <SomDaCasa nome="perfil assenta" em={9} som="estouro" volume={0.36} />
      <SomDaCasa nome="números do perfil" em={13} som="toque" volume={0.3} />
      <SomDaCasa nome="vídeos entram" em={20} som="sopro" volume={0.26} />
      <SomDaCasa nome="vídeo 1" em={23} som="estouro" volume={0.42} />
      <SomDaCasa nome="vídeo 2" em={27} som="estouro" volume={0.38} />
      <SomDaCasa nome="vídeo 3" em={31} som="estouro" volume={0.34} />
      <SomDaCasa nome="números acendem" em={39} som="brilho" volume={0.24} />
      <SomDaCasa nome="bloco sai" em={94} som="sopro" volume={0.34} />
''' + s[b:]
s = s.replace('import { MARCA, VIDRO } from "./marca";', 'import { MARCA, VIDRO } from "./marca";\nimport { SomDaCasa } from "./Sons";')
open('src/Abertura.tsx', 'w', encoding='utf-8').write(s)

# --- Composição: zonas e trilha
c = open('src/Composition.tsx', encoding='utf-8').read()
a = c.index('const ZONAS_0930'); b = c.index('];', a) + 2
c = c[:a] + '''const ZONAS_0930: ZonaDeLegenda[] = [
  // 23,6–31,2 s · ingredientes na tela: headline menor, encostada na base
  { de: 708, ate: 936, esquerda: 90, direita: 90, centro: 1440, base: 1540, enfase: 80 },
  // 33,7–46,4 s · ele segura o prato à esquerda: tudo na metade direita, sobre a camisa
  { de: 1010, ate: 1392, esquerda: 500, direita: 50, centro: 1425, base: 1530, enfase: 84 },
  // 46,4 s em diante · sentado, prato na mesa: legenda e headline abaixo do prato
  { de: 1392, ate: 1635, esquerda: 90, direita: 90, centro: 1505, base: 1562, enfase: 84 },
];''' + c[b:]

# apaga todos os sons antigos da composição e reescreve a trilha
c = re.sub(r'\n      \{/\* "passaporte do galeguinho" entra maior[^\n]*\n', '\n', c)
c = re.sub(r'\n      \{/\* 33,8 s em diante[^\n]*\n', '\n', c)
c = re.sub(r'      <Som nome="[^"]*" em=\{\d+\} arquivo="[^"]*" volume=\{[\d.]+\} />\n', '', c)

def depois(marca, texto):
    global c
    assert marca in c, marca[:50]
    c = c.replace(marca, marca + texto)

depois('''          <SeloDeLocal cidade="São José da Laje · AL" duracao={76} />
        </Bloco>
      </Sequence>
''', '''      <SomDaCasa nome="logo cai" em={70} som="estouro" volume={0.46} />
      <SomDaCasa nome="logo assenta" em={72} som="impacto" volume={0.22} />
      <SomDaCasa nome="pílula abre" em={76} som="sopro" volume={0.3} />
      <SomDaCasa nome="nome aparece" em={83} som="toque" volume={0.28} />
      <SomDaCasa nome="pino da cidade" em={88} som="estouro" volume={0.28} />
      <SomDaCasa nome="selo sai" em={137} som="sopro" volume={0.24} />
''')
depois('''<Cardapio3D duracao={236} destaqueEm={160} esquerda={cardapioEsquerda} />
      </Sequence>
''', '''      <SomDaCasa nome="cardápio chega" em={333} som="sopro" volume={0.5} />
      <SomDaCasa nome="lanche 1" em={346} som="toque" volume={0.26} />
      <SomDaCasa nome="lanche 2" em={350} som="toque" volume={0.26} />
      <SomDaCasa nome="lanche 3" em={354} som="toque" volume={0.26} />
      <SomDaCasa nome="lanche 4" em={358} som="toque" volume={0.26} />
      <SomDaCasa nome="lanche 5" em={362} som="toque" volume={0.26} />
      {/* a escolha: o Capiana salta do cartão junto com a headline "CAPIANA!" */}
      <SomDaCasa nome="capiana salta" em={497} som="estouro" volume={0.4} />
      <SomDaCasa nome="etiqueta da escolha" em={504} som="estouro" volume={0.32} />
      <SomDaCasa nome="cardápio sai" em={561} som="sopro" volume={0.32} />
''')
depois('''<Ingredientes duracao={228} topo={ingredientesTopo} />
      </Sequence>
''', '''      <SomDaCasa nome="lanche entra" em={706} som="sopro" volume={0.46} />
      <SomDaCasa nome="camada 1 abre" em={716} som="estouro" volume={0.3} />
      <SomDaCasa nome="camada 2 abre" em={718} som="estouro" volume={0.28} />
      <SomDaCasa nome="camada 3 abre" em={720} som="estouro" volume={0.26} />
      <SomDaCasa nome="camada 4 abre" em={722} som="estouro" volume={0.24} />
      <SomDaCasa nome="etiquetas" em={733} som="toque" volume={0.24} />
      <SomDaCasa nome="camadas fecham" em={904} som="sopro" volume={0.3} />
      <SomDaCasa nome="lanche monta" em={919} som="impacto" volume={0.36} />
      <SomDaCasa nome="lanche sai" em={927} som="sopro" volume={0.24} />
''')
depois('''            topoInterno={0}
          />
        </Bloco>
      </Sequence>
''', '''      <SomDaCasa nome="selo final cai" em={1487} som="estouro" volume={0.44} />
      <SomDaCasa nome="selo final assenta" em={1489} som="impacto" volume={0.2} />
      <SomDaCasa nome="selo final abre" em={1493} som="sopro" volume={0.28} />
      <SomDaCasa nome="selo final nome" em={1500} som="toque" volume={0.26} />
''')
c = c.replace('import { Abertura, Bloco, LARGURA, SeloDeLocal, Som } from "./Abertura";', 'import { Abertura, Bloco, LARGURA, SeloDeLocal } from "./Abertura";')
c = c.replace('import { ancoraDoBloco, useRastreio } from "./Rastreio";', 'import { ancoraDoBloco, useRastreio } from "./Rastreio";\nimport { SomDaCasa } from "./Sons";')
open('src/Composition.tsx', 'w', encoding='utf-8').write(c)
print('ok')
