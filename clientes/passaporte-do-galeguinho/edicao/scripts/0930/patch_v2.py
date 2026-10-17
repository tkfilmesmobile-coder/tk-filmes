# Patch da edição completa v2: nada cobre rosto nem lanche. Pode apagar depois de aplicado.
def troca(path, pares):
    s = open(path, encoding='utf-8').read()
    for a, b in pares:
        assert a in s, (path, a[:60])
        s = s.replace(a, b)
    open(path, 'w', encoding='utf-8').write(s)

# --- Rastreio: devolve também a caixa do rosto, suavizada
troca('src/Rastreio.ts', [
    ('''export const ancoraDoBloco = (
  pontos: PontoDoRosto[],
  frame: number,
  largura: number,
): { x: number; topo: number } => {
  let x = 0;
  let queixo = 0;
  let altura = 0;
  let n = 0;''', '''export type Ancora = {
  x: number; // centro do bloco de gráficos
  topo: number; // topo do bloco (altura do peito)
  rosto: { esquerda: number; cima: number; queixo: number }; // caixa do rosto, em px
};

export const ancoraDoBloco = (
  pontos: PontoDoRosto[],
  frame: number,
  largura: number,
): Ancora => {
  let x = 0;
  let queixo = 0;
  let altura = 0;
  let esquerda = 0;
  let n = 0;'''),
    ('''    altura += p.h * 1920;
    n++;''', '''    altura += p.h * 1920;
    esquerda += (p.x - p.w / 2) * 1080;
    n++;'''),
    ('''  altura /= n;

  const margem = 60;
  return {
    x: limitar(x, margem + largura / 2, 1080 - margem - largura / 2),
    topo: limitar(queixo + altura * 0.7, 770, 868),
  };''', '''  altura /= n;
  esquerda /= n;

  const margem = 60;
  return {
    x: limitar(x, margem + largura / 2, 1080 - margem - largura / 2),
    topo: limitar(queixo + altura * 0.7, 770, 868),
    rosto: { esquerda, cima: queixo - altura, queixo },
  };'''),
])

# --- Selo: posição interna configurável (o fechamento usa o selo sozinho, acima da cabeça)
troca('src/Abertura.tsx', [
    ('''export const SeloDeLocal: React.FC<{
  cidade: string;
  duracao: number;
}> = ({ cidade, duracao }) => {''', '''export const SeloDeLocal: React.FC<{
  cidade: string;
  duracao: number;
  topoInterno?: number;
}> = ({ cidade, duracao, topoInterno = 2 * (ALTURA_CARD + VAO) }) => {'''),
    ('''        left: 0,
        top: 2 * (ALTURA_CARD + VAO),
        width: LARGURA,
        display: "flex",
        justifyContent: "center",''', '''        left: 0,
        top: topoInterno,
        width: LARGURA,
        display: "flex",
        justifyContent: "center",'''),
    ('''export const Bloco: React.FC<{
  ancora: { x: number; topo: number };''', '''export const Bloco: React.FC<{
  ancora: { x: number; topo: number };'''),
])

# --- Cardápio 3D: menor e desviando do rosto
troca('src/Cardapio3D.tsx', [
    ('const ESCALA = 0.5;', 'const ESCALA = 0.44;'),
    ('const JANELA = 640; // altura visível do cartão', 'const JANELA = 580; // altura visível do cartão'),
    ('''export const Cardapio3D: React.FC<{
  duracao: number;
  destaqueEm: number;
  deriva: number;
}> = ({ duracao, destaqueEm, deriva }) => {''', '''// esquerda = posição do cartão, calculada no pai pra ficar sempre à esquerda do rosto.
export const Cardapio3D: React.FC<{
  duracao: number;
  destaqueEm: number;
  esquerda: number;
}> = ({ duracao, destaqueEm, esquerda }) => {'''),
    ('          left: 64 + deriva,\n          top: 520,', '          left: esquerda,\n          top: 540,'),
    ('["0px 0px", "0px -180px"]', '["0px 0px", "0px -158px"]'),
    ('            fontSize: 21,\n            letterSpacing: "0.08em",', '            fontSize: 19,\n            letterSpacing: "0.06em",'),
])

# --- Ingredientes: compacto, abaixo do queixo, etiquetas maiores
troca('src/Ingredientes.tsx', [
    ('const ESCALA = 0.36;', 'const ESCALA = 0.3;'),
    ('y: 0, abre: -150, rotulo: "pão australiano"', 'y: 0, abre: -108, rotulo: "pão australiano"'),
    ('y: 282, abre: -62, rotulo: "cebola caramelizada"', 'y: 282, abre: -44, rotulo: "cebola caramelizada"'),
    ('y: 362, abre: 30, rotulo: "bacon crocante + cheddar duplo"', 'y: 362, abre: 22, rotulo: "bacon + cheddar duplo"'),
    ('y: 512, abre: 130, rotulo: "blend 160 g"', 'y: 512, abre: 96, rotulo: "blend 160 g"'),
    ('          padding: "9px 18px",', '          padding: "8px 18px",'),
    ('          fontSize: 21,\n          letterSpacing: "0.03em",', '          fontSize: 24,\n          letterSpacing: "0.02em",'),
    ('''export const Ingredientes: React.FC<{ duracao: number; deriva: number }> = ({
  duracao,
  deriva,
}) => {''', '''// topo = onde o bloco começa, calculado no pai pra ficar sempre abaixo do queixo dele.
export const Ingredientes: React.FC<{ duracao: number; topo: number }> = ({
  duracao,
  topo,
}) => {'''),
    ('          left: 44 + deriva,\n          top: 560,\n          width: 620,\n          height: 640,', '          left: 50,\n          top: topo,\n          width: 700,\n          height: 450,'),
    ('''            left: 170,
            top: 60,
            width: 470,
            height: 520,''', '''            left: 300,
            top: -20,
            width: 440,
            height: 490,'''),
    ('          const topoMontado = 150 + c.y * ESCALA;', '          const topoMontado = 112 + c.y * ESCALA;'),
    ('                  left: 250 + c.x * ESCALA,', '                  left: 388 + c.x * ESCALA,'),
    ('topo={topoMontado + c.abre + (c.altura * ESCALA) / 2 - 22}', 'topo={topoMontado + c.abre + (c.altura * ESCALA) / 2 - 24}'),
])

# --- Legendas: zonas (o lanche de verdade em cena empurra a legenda pro lado ou pra baixo)
troca('src/Legendas.tsx', [
    ('''// Poucas palavras por vez, em minúsculas, com um brilho suave: entra com foco e uma leve aproximação.
const BlocoDeLegenda: React.FC<{ bloco: Bloco; duracao: number }> = ({
  bloco,
  duracao,
}) => {
  const frame = useCurrentFrame();
''', '''// Onde a legenda fica num trecho do vídeo. Serve pra desviar do lanche quando ele está em cena.
export type ZonaDeLegenda = {
  de: number; // frame inicial (inclusive)
  ate: number; // frame final (exclusive)
  esquerda: number;
  direita: number;
  centro: number;
  enfase: number; // tamanho da fonte do bloco em ênfase
};

const ZONA_PADRAO = {
  esquerda: 110,
  direita: 110,
  centro: FAIXA.legendaCentro,
  enfase: 84,
};

// Poucas palavras por vez, em minúsculas, com um brilho suave: entra com foco e uma leve aproximação.
const BlocoDeLegenda: React.FC<{
  bloco: Bloco;
  duracao: number;
  zona: Omit<ZonaDeLegenda, "de" | "ate">;
}> = ({ bloco, duracao, zona }) => {
  const frame = useCurrentFrame();
'''),
    ('''          left: 110,
          right: 110,
          top: FAIXA.legendaCentro,''', '''          left: zona.esquerda,
          right: zona.direita,
          top: zona.centro,'''),
    ('          fontSize: bloco.enfase ? 84 : 58,', '          fontSize: bloco.enfase ? zona.enfase : 58,'),
    ('''export const Legendas: React.FC<{ arquivo: string }> = ({ arquivo }) => {''', '''export const Legendas: React.FC<{
  arquivo: string;
  zonas?: ZonaDeLegenda[];
}> = ({ arquivo, zonas = [] }) => {'''),
    ('            <BlocoDeLegenda bloco={bloco} duracao={fim - inicio} />', '''            <BlocoDeLegenda
              bloco={bloco}
              duracao={fim - inicio}
              zona={
                zonas.find((z) => inicio >= z.de && inicio < z.ate) ??
                ZONA_PADRAO
              }
            />'''),
])

# --- Composição
troca('src/Composition.tsx', [
    ('import { Legendas } from "./Legendas";', 'import { Legendas } from "./Legendas";\nimport type { ZonaDeLegenda } from "./Legendas";'),
    ('''const FPS = 30;''', '''const FPS = 30;

// Quando o lanche de verdade está em cena, a legenda sai de cima dele.
const ZONAS_0930: ZonaDeLegenda[] = [
  // 33,7–46,4 s · ele segura o prato à esquerda: legenda na metade direita, sobre a camisa
  { de: 1010, ate: 1392, esquerda: 500, direita: 50, centro: 1425, enfase: 64 },
  // 46,4 s em diante · sentado, prato na mesa: legenda mais baixa, abaixo do prato
  { de: 1392, ate: 1635, esquerda: 110, direita: 110, centro: 1505, enfase: 78 },
];'''),
    ('''  // Os inserts do lado esquerdo derivam de leve no sentido oposto ao dele (sensação de profundidade).
  const deriva = (540 - ancora.x) * 0.08;
''', '''  // O cardápio fica sempre à esquerda do rosto; os ingredientes, sempre abaixo do queixo.
  const cardapioEsquerda = Math.min(64, Math.max(16, ancora.rosto.esquerda - 380));
  const ingredientesTopo = Math.min(900, Math.max(860, ancora.rosto.queixo + 46));
'''),
    ('<Cardapio3D duracao={236} destaqueEm={160} deriva={deriva} />', '<Cardapio3D duracao={236} destaqueEm={160} esquerda={cardapioEsquerda} />'),
    ('<Ingredientes duracao={228} deriva={deriva} />', '<Ingredientes duracao={228} topo={ingredientesTopo} />'),
    ('''      <Sequence name="Fechamento" from={1487} durationInFrames={140}>
        <Bloco ancora={{ x: ancora.x, topo: ancora.topo - 120 }}>
          <SeloDeLocal cidade="São José da Laje · AL" duracao={140} />
        </Bloco>
      </Sequence>''', '''      {/* o selo fica acima da cabeça dele: longe do rosto e do lanche que ele levanta no fim */}
      <Sequence name="Fechamento" from={1487} durationInFrames={140}>
        <Bloco
          ancora={{
            x: ancora.x,
            topo: Math.max(190, ancora.rosto.cima - 150),
          }}
        >
          <SeloDeLocal
            cidade="São José da Laje · AL"
            duracao={140}
            topoInterno={0}
          />
        </Bloco>
      </Sequence>'''),
    ('      <Legendas arquivo={legendas} />', '      <Legendas arquivo={legendas} zonas={ZONAS_0930} />'),
])
print('ok')
