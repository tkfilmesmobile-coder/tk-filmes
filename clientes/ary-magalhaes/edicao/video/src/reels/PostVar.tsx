import { AbsoluteFill, Img, staticFile } from "remotion";
import { BODONI, BODONI_IT, COR, GILDA, POPPINS } from "./marca";

// Posts fixos pós-reel com formato variado (pedido da Talyta, 2026-10-28): cada post usa um modelo
// diferente do guia (marca/design-guide.md), na estética dos posts aprovados de outubro
// (foto quente, só a base escurece, Bodoni creme, Poppins, assinatura entre fios).
const CREME = "#F6EFE4";
const FILTRO = "sepia(0.12) contrast(1.06) brightness(0.95)";
const base = (de: number) =>
  `linear-gradient(to bottom, rgba(20,15,11,0) ${de}%, rgba(20,15,11,0.6) ${de + 16}%, rgba(20,15,11,0.88) ${de + 34}%, rgba(20,15,11,0.94) 100%)`;

const Foto: React.FC<{ src: string; pos?: string; blur?: number; de?: number; escala?: number }> = ({ src, pos = "center 30%", blur = 0, de = 46, escala = 1 }) => (
  <>
    <Img
      src={staticFile(`midia/fotos/${src}`)}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, filter: `${FILTRO}${blur ? ` blur(${blur}px)` : ""}`, transform: `scale(${blur ? 1.08 * escala : escala})` }}
    />
    <AbsoluteFill style={{ background: base(de) }} />
  </>
);

const Assin: React.FC<{ t?: string }> = ({ t = "ARY MAGALHÃES" }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
    <div style={{ width: 50, height: 1.5, background: COR.dourado }} />
    <div style={{ fontFamily: POPPINS, fontWeight: 400, fontSize: 19, letterSpacing: 6, color: CREME }}>{t}</div>
    <div style={{ width: 50, height: 1.5, background: COR.dourado }} />
  </div>
);

const Tit: React.FC<{ children: React.ReactNode; tam?: number; style?: React.CSSProperties }> = ({ children, tam = 104, style }) => (
  <div style={{ fontFamily: BODONI, fontWeight: 400, fontSize: tam, lineHeight: 1.02, color: COR.champanhe, ...style }}>{children}</div>
);
const Txt: React.FC<{ children: React.ReactNode; tam?: number; style?: React.CSSProperties }> = ({ children, tam = 31, style }) => (
  <div style={{ fontFamily: POPPINS, fontWeight: 400, fontSize: tam, lineHeight: 1.42, color: CREME, ...style }}>{children}</div>
);
const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <b style={{ fontWeight: 600 }}>{children}</b>;
const It: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ fontFamily: BODONI_IT, fontStyle: "italic" }}>{children}</span>;
const Num: React.FC<{ children: React.ReactNode; tam?: number }> = ({ children, tam = 190 }) => (
  <div style={{ fontFamily: GILDA, fontSize: tam, lineHeight: 0.9, color: COR.champanhe }}>{children}</div>
);
const Bloco: React.FC<{ children: React.ReactNode; top?: number; bottom?: number }> = ({ children, top, bottom = 130 }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top, bottom: top === undefined ? bottom : undefined }}>{children}</div>
);

// ---------- 1 · mechas: carrossel "1º / 2º" (capa foto + títulos; slides de número em Gilda) ----------
const mechas = [
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="cliente-IMG_0588.jpg" pos="center 22%" />
      <Bloco>
        <Tit tam={118}>Mechas <It>ou</It><br />selagem?</Tit>
        <Txt style={{ marginTop: 26 }}>Arrasta pro lado que eu te conto <B>a ordem certa</B>, meu amor.</Txt>
      </Bloco>
      <Assin />
    </AbsoluteFill>
  ),
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="ig-2017-10-21-mechas-aluminio.jpg" pos="center 40%" de={40} />
      <Bloco>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
          <Num>1º</Num>
          <Tit tam={96} style={{ paddingBottom: 14 }}>as mechas</Tit>
        </div>
        <Txt style={{ marginTop: 28 }}>Pra cor nova entrar, a cutícula do fio <B>precisa abrir</B>. Por isso elas vêm primeiro.</Txt>
      </Bloco>
      <Assin />
    </AbsoluteFill>
  ),
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="atend-quadro-IMG_6333-12s.jpg" pos="center 35%" de={40} />
      <Bloco>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
          <Num>2º</Num>
          <Tit tam={96} style={{ paddingBottom: 14 }}>a selagem</Tit>
        </div>
        <Txt style={{ marginTop: 28 }}>Ela <B>alinha e fecha</B> a cutícula. Entra depois, com o cabelo saudável, pra cor e liso durarem.</Txt>
      </Bloco>
      <Assin t="@CABELOSMAGALHAES" />
    </AbsoluteFill>
  ),
];

// ---------- 2 · sobrancelha: foto desfocada + palavra grande + frase (modelo dos avisos/agenda) ----------
const sobrancelha = [
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="ensaio-ary-11.jpg" pos="center 25%" blur={14} de={30} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 300, textAlign: "center" }}>
        <Tit tam={150} style={{ color: CREME }}>Cabelo</Tit>
        <Tit tam={70} style={{ color: CREME, margin: "10px 0 6px" }}><It>e</It></Tit>
        <Tit tam={150} style={{ color: CREME }}>Sobrancelha</Tit>
        <Txt style={{ marginTop: 50, padding: "0 30px" }}>
          Não adianta o cabelo impecável e a sobrancelha não acompanhar, né? Aqui você faz <B>os dois</B>, no desenho do seu rosto.
        </Txt>
      </div>
      <Assin />
    </AbsoluteFill>
  ),
];

// ---------- 3 · estética ou saúde: comparativo em duas colunas ----------
const Coluna: React.FC<{ rot: string; itens: string[] }> = ({ rot, itens }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontFamily: POPPINS, fontWeight: 500, fontSize: 20, letterSpacing: 6, color: COR.dourado }}>{rot}</div>
    <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
      {itens.map((t) => (
        <Txt key={t} tam={29} style={{ lineHeight: 1.3 }}>{t}</Txt>
      ))}
    </div>
  </div>
);
const estetica = [
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="cliente-IMG_2485.jpg" pos="center 22%" de={30} />
      <Bloco bottom={120}>
        <Tit tam={92}>Estética <It>ou</It> saúde?</Tit>
        <Txt tam={33} style={{ marginTop: 14 }}>Os dois, meu amor.</Txt>
        <div style={{ display: "flex", gap: 40, marginTop: 40, alignItems: "stretch" }}>
          <Coluna rot="ESTÉTICA" itens={["brilho", "glamour", "cabelo hidratado"]} />
          <div style={{ width: 1.5, background: COR.dourado, opacity: 0.8 }} />
          <Coluna rot="SAÚDE" itens={["resistência do fio", "bulbo capilar saudável", "o que sustenta tudo"]} />
        </div>
        <Txt tam={29} style={{ marginTop: 40, opacity: 0.92 }}>Com a saúde em dia, a estética é <B>consequência</B>.</Txt>
      </Bloco>
      <Assin />
    </AbsoluteFill>
  ),
];

// ---------- 4 · muito prazer: carrossel-história (modelo do post de 1 ano) ----------
const prazer = [
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="ensaio-ary-05.jpg" pos="center 18%" />
      <Bloco>
        <Tit tam={124}>Muito prazer,</Tit>
        <Txt tam={34} style={{ marginTop: 20 }}>eu sou a <B>Ary Magalhães</B>.</Txt>
      </Bloco>
      <Assin />
    </AbsoluteFill>
  ),
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="ig-2019-03-10-familia-ary-everton-filhos.jpg" pos="center 30%" de={44} />
      <Bloco>
        <Tit tam={108}>Mãe <It>e</It> esposa.</Tit>
        <Txt style={{ marginTop: 22 }}>Do Matheus, do Murilo e do Everton.</Txt>
      </Bloco>
      <Assin />
    </AbsoluteFill>
  ),
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="ig-2020-08-04-ary-e-clientes.jpg" pos="center 30%" de={42} />
      <Bloco>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 22 }}>
          <Num tam={170}>14</Num>
          <Tit tam={104} style={{ paddingBottom: 8 }}>anos</Tit>
        </div>
        <Txt style={{ marginTop: 24 }}>cuidando de cabelo, com <B>carinho e atenção</B> em cada atendimento.</Txt>
      </Bloco>
      <Assin />
    </AbsoluteFill>
  ),
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="ensaio-ary-10.jpg" pos="center 20%" />
      <Bloco>
        <Tit tam={100}>Praça<br />Padre Cícero</Tit>
        <Txt style={{ marginTop: 22 }}>Acima da ANP Advocacia, próximo à Salgaderia Palmarina. <B>Agende o seu horário</B>: o link está na bio.</Txt>
      </Bloco>
      <Assin t="@CABELOSMAGALHAES" />
    </AbsoluteFill>
  ),
];

// ---------- 5 · selagem: lista numerada (modelo do slide "como garantir o seu horário") ----------
const Linha: React.FC<{ n: string; t: string }> = ({ n, t }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 30, padding: "20px 0", borderTop: "1px solid rgba(234,217,184,0.38)" }}>
    <div style={{ fontFamily: GILDA, fontSize: 44, color: COR.champanhe, width: 60 }}>{n}</div>
    <div style={{ fontFamily: POPPINS, fontWeight: 500, fontSize: 24, letterSpacing: 2.5, color: CREME, lineHeight: 1.3 }}>{t}</div>
  </div>
);
const selagem = [
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="atend-quadro-IMG_6333-3s.jpg" pos="center 30%" de={26} />
      <Bloco bottom={118}>
        <Tit tam={86}>Não faça isso com<br />a sua <It>selagem</It>.</Tit>
        <div style={{ marginTop: 36 }}>
          <Linha n="01" t="CHAPINHA E SECADOR SEM PROTETOR TÉRMICO" />
          <Linha n="02" t="ESQUECER O CRONOGRAMA CAPILAR" />
          <Linha n="03" t="DORMIR COM O CABELO MOLHADO" />
        </div>
      </Bloco>
      <Assin />
    </AbsoluteFill>
  ),
];

// ---------- 6 · cabelo de salão em casa: citação da Ary (fala dela no reel) ----------
const salao = [
  () => (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Foto src="ensaio-ary-12.jpg" pos="center 20%" de={34} />
      <Bloco>
        <div style={{ fontFamily: GILDA, fontSize: 200, lineHeight: 0.5, color: COR.dourado, height: 80 }}>“</div>
        <div style={{ fontFamily: BODONI_IT, fontStyle: "italic", fontSize: 64, lineHeight: 1.14, color: COR.champanhe }}>
          Procure um lugar que cuide bem não só dos seus cabelos, mas também de você.
        </div>
        <Txt tam={33} style={{ marginTop: 28 }}>E vocês já sabem, né? <B>Esse lugar é aqui.</B></Txt>
      </Bloco>
      <Assin />
    </AbsoluteFill>
  ),
];

export const POSTS_VAR: { id: string; slides: (() => JSX.Element)[] }[] = [
  { id: "mechas-antes-ou-depois", slides: mechas },
  { id: "sobrancelha", slides: sobrancelha },
  { id: "estetica-ou-saude", slides: estetica },
  { id: "muito-prazer", slides: prazer },
  { id: "selagem-3-coisas", slides: selagem },
  { id: "cabelo-de-salao-em-casa", slides: salao },
];

export const PostVar: React.FC<{ id: string; n: number }> = ({ id, n }) => POSTS_VAR.find((p) => p.id === id)!.slides[n]();
