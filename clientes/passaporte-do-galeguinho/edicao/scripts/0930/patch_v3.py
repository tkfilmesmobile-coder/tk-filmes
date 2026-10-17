# Patch único da prévia v3 (selo com logo e nome da casa + mais sons). Pode apagar depois de aplicado.
s = open('src/Abertura.tsx', encoding='utf-8').read()
a = s.index("// 3. Selo de localização"); b = s.index("// O bloco inteiro (perfil, vídeos, selo)")
novo = '''// 3. Selo de localização: a logo da casa cai no lugar, a pílula abre e aparecem o nome e a cidade.
export const SeloDeLocal: React.FC<{
  cidade: string;
  duracao: number;
}> = ({ cidade, duracao }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 2 * (ALTURA_CARD + VAO),
        width: LARGURA,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          height: 100,
          borderRadius: 50,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          ...VIDRO,
          opacity: interpolate(
            frame,
            [0, 5, duracao - 8, duracao],
            [0, 1, 1, 0],
            TRAVA,
          ),
          // a pílula nasce do tamanho da logo e abre pros lados
          width: interpolate(frame, [7, 24], [100, 590], {
            ...TRAVA,
            easing: SUAVE,
          }),
          translate: interpolate(
            frame,
            [duracao - 8, duracao],
            ["0px 0px", "0px 14px"],
            { ...TRAVA, easing: Easing.in(Easing.cubic) },
          ),
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 100,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            translate: interpolate(
              frame,
              [0, 10],
              ["0px -40px", "0px 0px"],
              { ...TRAVA, easing: ELASTICO },
            ),
            scale: interpolate(frame, [0, 10], [0.7, 1], {
              ...TRAVA,
              easing: ELASTICO,
            }),
          }}
        >
          <Img
            src={staticFile("intro/logo.jpg")}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${MARCA.dourado}`,
            }}
          />
        </div>
        <div
          style={{
            whiteSpace: "nowrap",
            paddingLeft: 8,
            paddingRight: 36,
            opacity: interpolate(frame, [12, 22], [0, 1], TRAVA),
            translate: interpolate(
              frame,
              [12, 24],
              ["-14px 0px", "0px 0px"],
              { ...TRAVA, easing: SUAVE },
            ),
          }}
        >
          <div
            style={{
              fontFamily: montserrat,
              fontWeight: 800,
              fontSize: 29,
              letterSpacing: "0.01em",
              color: MARCA.creme,
            }}
          >
            Passaporte do{" "}
            <span style={{ color: MARCA.laranja }}>Galeguinho</span>
          </div>
          <div
            style={{
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: montserrat,
              fontWeight: 600,
              fontSize: 23,
              color: "rgba(255,246,233,0.78)",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              style={{
                translate: interpolate(
                  frame,
                  [16, 26],
                  ["0px -12px", "0px 0px"],
                  { ...TRAVA, easing: ELASTICO },
                ),
              }}
            >
              <path
                d="M12 22s-7.5-6.6-7.5-12a7.5 7.5 0 0 1 15 0c0 5.4-7.5 12-7.5 12z"
                fill={MARCA.laranja}
              />
              <circle cx="12" cy="10" r="2.8" fill={MARCA.escuro} />
            </svg>
            {cidade}
          </div>
        </div>
      </div>
    </div>
  );
};

'''
s = s[:a] + novo + s[b:]
a = s.index('      <Som nome="perfil entra"'); b = s.index('    </>\n  );\n};', a)
sons = '''      <Som nome="perfil entra" em={2} arquivo="whoosh" volume={0.26} />
      <Som nome="perfil assenta" em={9} arquivo="switch" volume={0.14} />
      <Som nome="números do perfil" em={13} arquivo="mouse-click" volume={0.14} />
      <Som nome="vídeos entram" em={21} arquivo="whip" volume={0.16} />
      <Som nome="vídeo 1" em={23} arquivo="switch" volume={0.2} />
      <Som nome="vídeo 2" em={27} arquivo="switch" volume={0.2} />
      <Som nome="vídeo 3" em={31} arquivo="switch" volume={0.2} />
      <Som nome="brilho 480 mil" em={39} arquivo="ding" volume={0.09} />
      <Som nome="brilho 153 mil" em={42} arquivo="ding" volume={0.08} />
      <Som nome="brilho 118 mil" em={45} arquivo="ding" volume={0.07} />
      <Som nome="bloco sai" em={95} arquivo="whoosh" volume={0.18} />
'''
s = s[:a] + sons + s[b:]
s = s.replace('const Som: React.FC<{', 'export const Som: React.FC<{')
open('src/Abertura.tsx', 'w', encoding='utf-8').write(s)

c = open('src/Composition.tsx', encoding='utf-8').read()
a = c.index('      <Sequence name="Localização"'); b = c.index('      <Legendas arquivo')
loc = '''      <Sequence name="Localização" from={70} durationInFrames={76}>
        <Bloco ancora={ancora}>
          <SeloDeLocal cidade="São José da Laje · AL" duracao={76} />
        </Bloco>
      </Sequence>
      <Som nome="logo cai" em={70} arquivo="mouse-click" volume={0.32} />
      <Som nome="pílula abre" em={76} arquivo="whip" volume={0.14} />
      <Som nome="nome aparece" em={82} arquivo="page-turn" volume={0.14} />
      <Som nome="pino da cidade" em={87} arquivo="switch" volume={0.16} />
      <Som nome="selo sai" em={138} arquivo="whoosh" volume={0.12} />
      {/* "passaporte do galeguinho" entra maior em 4,93 s: um sopro e um brilho marcam a entrada */}
      <Som nome="nome da casa" em={146} arquivo="whoosh" volume={0.2} />
      <Som nome="nome da casa brilha" em={150} arquivo="ding" volume={0.08} />

'''
c = c[:a] + loc + c[b:]
c = c.replace('import { Abertura, Bloco, LARGURA, SeloDeLocal } from "./Abertura";', 'import { Abertura, Bloco, LARGURA, SeloDeLocal, Som } from "./Abertura";')
c = c.replace('import { Audio, Video } from "@remotion/media";', 'import { Video } from "@remotion/media";')
c = c.replace('''  staticFile,
  useCurrentFrame,
} from "remotion";''', '''  staticFile,
  useCurrentFrame,
} from "remotion";''')
open('src/Composition.tsx', 'w', encoding='utf-8').write(c)

r = open('src/Rastreio.ts', encoding='utf-8').read().replace('topo: limitar(queixo + altura * 0.7, 780, 880),', 'topo: limitar(queixo + altura * 0.7, 770, 868),')
open('src/Rastreio.ts', 'w', encoding='utf-8').write(r)
print('ok')
