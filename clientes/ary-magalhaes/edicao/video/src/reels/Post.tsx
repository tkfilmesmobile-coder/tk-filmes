import { AbsoluteFill, Img, staticFile } from "remotion";
import { BASE_ESCURA, BODONI, COR, POPPINS } from "./marca";

// Post fixo de imagem (feed 1080x1350) que acompanha cada reel, sobre o mesmo tema.
// Modelo "dicas e cuidados" do guia: texto direto sobre a foto de cabelo, etiqueta de contorno e checks;
// só a base da foto escurece (estética dos posts aprovados), nada de fundo claro.
type PostDef = { id: string; foto: string; pos?: string; etiqueta: string; titulo: string; italico: string; itens: string[] };

export const POSTS: PostDef[] = [
  {
    id: "mechas-antes-ou-depois",
    foto: "midia/fotos/cliente-IMG_0588.jpg",
    pos: "center 20%",
    etiqueta: "MECHAS + ALISAMENTO",
    titulo: "Primeiro as mechas,",
    italico: "depois a selagem.",
    itens: ["Pra cor nova entrar, a cutícula do fio precisa abrir.", "A selagem alinha e fecha a cutícula. Por isso ela vem depois, com o cabelo saudável."],
  },
  {
    id: "selagem-3-coisas",
    foto: "midia/fotos/atend-quadro-IMG_6333-12s.jpg",
    pos: "center 30%",
    etiqueta: "SELAGEM",
    titulo: "Pra sua selagem durar,",
    italico: "faça a sua parte em casa.",
    itens: ["Protetor térmico sempre que usar chapinha ou secador.", "Cronograma capilar em dia e nada de dormir com o cabelo molhado."],
  },
  {
    id: "cabelo-de-salao-em-casa",
    foto: "midia/fotos/cliente-IMG_2624.jpg",
    pos: "center 25%",
    etiqueta: "CABELO DE SALÃO EM CASA",
    titulo: "O cuidado continua",
    italico: "em casa.",
    itens: ["Em casa: protetor térmico, cronograma capilar e nada de dormir com o cabelo molhado.", "No salão: retoque e tratamento no tempo certo."],
  },
  {
    id: "sobrancelha",
    foto: "midia/fotos/sobrancelha-kt-leung-unsplash.jpg",
    pos: "center 40%",
    etiqueta: "SOBRANCELHA",
    titulo: "Do jeitinho",
    italico: "do seu rosto.",
    itens: ["Desenho que acompanha o formato do seu rosto e a sua beleza natural.", "Agende junto com o cabelo: o seu dia de beleza completo."],
  },
  {
    id: "estetica-ou-saude",
    foto: "midia/fotos/cliente-IMG_2485.jpg",
    pos: "center 30%",
    etiqueta: "ESTÉTICA + SAÚDE",
    titulo: "Cabelo bonito",
    italico: "é cabelo saudável.",
    itens: ["Estética é o que a gente vê: brilho, glamour, cabelo hidratado.", "Saúde é o que sustenta tudo. Com ela em dia, a estética é consequência."],
  },
  {
    id: "muito-prazer",
    foto: "midia/fotos/ensaio-IMG_2197.jpg",
    pos: "center 20%",
    etiqueta: "MUITO PRAZER",
    titulo: "Eu sou a",
    italico: "Ary Magalhães.",
    itens: ["Mãe, esposa e cabeleireira há mais de 14 anos.", "Na Praça Padre Cícero, acima da ANP Advocacia, próximo à Salgaderia Palmarina."],
  },
];

const Check: React.FC = () => (
  <svg width={34} height={34} viewBox="0 0 34 34" style={{ flexShrink: 0, marginTop: 4 }}>
    <circle cx={17} cy={17} r={15.5} fill="none" stroke={COR.dourado} strokeWidth={1.6} />
    <path d="M10 17.5 L15 22.5 L24.5 12" fill="none" stroke="#F6EFE4" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Post: React.FC<{ id: string }> = ({ id }) => {
  const p = POSTS.find((x) => x.id === id)!;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Img src={staticFile(p.foto)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "center 30%", filter: "sepia(0.12) contrast(1.06) brightness(0.95)" }} />
      <AbsoluteFill style={{ background: BASE_ESCURA }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 830 }}>
        <span style={{ display: "inline-block", padding: "10px 22px", borderRadius: 30, border: `1px solid ${COR.dourado}`, fontFamily: POPPINS, fontWeight: 400, fontSize: 20, letterSpacing: 5, color: "#F6EFE4" }}>
          {p.etiqueta}
        </span>
        <div style={{ fontFamily: BODONI, fontWeight: 400, fontSize: 78, lineHeight: 1.04, color: "#F6EFE4", marginTop: 26 }}>{p.titulo}<br />{p.italico}</div>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 16 }}>
          {p.itens.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <Check />
              <div style={{ fontFamily: POPPINS, fontWeight: 400, fontSize: 28, lineHeight: 1.35, color: "#F6EFE4" }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 50, height: 1.5, background: COR.dourado }} />
        <div style={{ fontFamily: POPPINS, fontWeight: 400, fontSize: 19, letterSpacing: 6, color: "#F6EFE4" }}>ARY MAGALHÃES</div>
        <div style={{ width: 50, height: 1.5, background: COR.dourado }} />
      </div>
    </AbsoluteFill>
  );
};
