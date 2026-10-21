import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { MONTSERRAT, PLAYFAIR, Subtitulo, TagFio, TituloRose, Veu } from "../periodontite/Bloco";
import { Ancora, Legendas } from "../periodontite/Legendas";

// Depoimento da paciente Mari com a Dra. Camilla (1010.mp4, corte da Talyta, 187 s). Perfil de vídeo da
// doutora: abertura com zoom de ênfase no rosto + headline "B" (escolhida em 2026-10-21: caixa alta, serifa
// grande e selo vinho, texto branco direto na imagem, sem véu); fotos do caso entrando como
// cortes em tela cheia no momento exato da fala (antes → depois com cortina), legenda Nunito centralizada,
// trilha "acolhimento" sob a voz e efeitos graves (regra de 14/10: nada de whoosh fininho).
// Tempos em segundos do vídeo, medidos na transcrição (scripts/cache/1010.palavras.json).
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.45, 0, 0.2, 1);
const REVELA = Easing.bezier(0.16, 1, 0.3, 1);
const F = (s: number) => Math.round(s * 30);
const { fontFamily: POPPINS } = loadPoppins("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] });
export type EstiloHeadline = "rose" | "A" | "B" | "C";

export const T1010 = {
  headlineDe: 0.1,
  headlineAte: 3.45, // "Um sorriso perfeito, ele depende muito da ajuda do paciente."
  zoomAte: 0.4,
  descida: 300,
  // fotos (cortes em tela cheia)
  antesDe: 13.3, // "iniciou com um aparelho… dentinhos fora de posição"
  antesAte: 17.45,
  compDe: 20.65, // "fez o clareamento… ajustes do sorriso dela em resina"
  compRevela: 22.55, // "depois os ajustes"
  compAte: 25.4,
  espelhoDe: 26.05, // "finalizamos o tratamento dela e está linda até hoje"
  espelhoAte: 29.15,
  exemploDe: 35.0, // "É uma paciente que a gente chama de paciente exemplo…"
  exemploAte: 40.95,
  caninoDe: 48.6, // "por conta do canino… fora de posição"
  caninoAte: 53.2,
  gravidezDe: 112.5, // "a gravidez de Jade e Arthur… ficou sendo acompanhada aqui"
  gravidezAte: 116.0,
  familiaDe: 141.0, // "indico você… toda a minha família está em suas mãos"
  familiaAte: 147.4,
  trilhaTrocaDe: 154.6, // "é um recado que fica pra você": acolhimento → clareza
  trilhaTrocaAte: 155.6,
  assinaturaDe: 181.2, // "fica um exemplo de paciente… convite pra conhecer a doutora Camilla"
  // ênfases de zoom (multiplicador, interpolado com suavização)
  enfases: [
    [0, 1], [58.3, 1], [58.8, 1.07], // "doutora, daqui pro meu casamento…"
    [70.5, 1.07], [71.2, 1.0],
    [83.2, 1.0], [83.7, 1.09], // "radiante"
    [88.6, 1.09], [89.3, 1.0],
    [103.2, 1.0], [103.7, 1.07], // "confio demais nela… indico de olhos fechados"
    [107.0, 1.07], [107.6, 1.0],
    [153.5, 1.0], [154.0, 1.08], // "muito obrigada por tudo"
    [154.8, 1.08], [155.3, 1.0],
    [163.0, 1.0], [163.5, 1.06], // "esse é um recado pra você"
    [172.8, 1.06], [173.4, 1.0],
    [200, 1.0],
  ] as [number, number][],
};
const T = T1010;

// vídeo de base: zoom de ênfase na abertura (desce a imagem pra o rosto ficar abaixo da headline)
// e respiração lenta de câmera no resto (1 → 1,05 em ciclos longos, sem pulsar a cada frase)
const Base: React.FC<{ estilo: EstiloHeadline }> = ({ estilo }) => {
  const s = useCurrentFrame() / 30;
  const k = estilo === "rose" ? interpolate(s, [0, T.zoomAte, T.headlineAte - 0.45, T.headlineAte], [0, 1, 1, 0], { ...clamp, easing: SUAVE }) : 0;
  const enfase = estilo === "rose" ? 1 : interpolate(s, [0, 1.2, T.headlineAte - 0.3, T.headlineAte + 0.3], [1.0, 1.1, 1.12, 1.0], { ...clamp, easing: SUAVE });
  const respira =
    (1 + 0.05 * (0.5 - 0.5 * Math.cos((Math.max(0, s - T.headlineAte) / 14) * Math.PI))) *
    interpolate(s, T.enfases.map((e) => e[0]), T.enfases.map((e) => e[1]), { ...clamp, easing: SUAVE });
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#F3E6E2" }}>
      <Video
        name="Depoimento (corte da Talyta)"
        src={staticFile("midia/1010.mp4")}
        muted
        style={{ width: 1080, height: 1920, transformOrigin: estilo === "rose" ? "540px 0px" : "540px 640px", scale: (1 + 0.14 * k) * respira * enfase, translate: `0px ${T.descida * k}px` }}
      />
    </AbsoluteFill>
  );
};

const Headline: React.FC = () => {
  const s = useCurrentFrame() / 30 + T.headlineDe;
  const sai = interpolate(s, [T.headlineAte - 0.4, T.headlineAte], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const p = (de: number) => interpolate(s, [de, de + 0.55], [0, 1], { ...clamp, easing: REVELA });
  return (
    <AbsoluteFill>
      <Veu opacidade={interpolate(s, [0, 0.12], [0, 1], clamp) * (1 - sai)} />
      <AbsoluteFill style={{ opacity: 1 - sai, filter: `blur(${sai * 6}px)`, translate: `0px ${-sai * 30}px` }}>
        <TagFio texto="PACIENTE HÁ MAIS DE 7 ANOS" p={p(0.1)} />
        <TituloRose texto="Um sorriso perfeito" p={p(0.25)} />
        <Subtitulo texto="depende muito de você" opacidade={p(1.2)} dy={(1 - p(1.2)) * 12} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// alternativas de abertura (sem véu): texto branco direto sobre a imagem, abaixo do rosto
const SOMBRA = "0 2px 24px rgba(20,8,12,0.55), 0 1px 3px rgba(20,8,12,0.45)";
const HeadlineFoto: React.FC<{ estilo: "A" | "B" | "C" }> = ({ estilo }) => {
  const s = useCurrentFrame() / 30 + T.headlineDe;
  const sai = interpolate(s, [T.headlineAte - 0.35, T.headlineAte], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const p = (de: number) => interpolate(s, [de, de + 0.5], [0, 1], { ...clamp, easing: REVELA });
  const linha = (de: number, conteudo: React.ReactNode, estiloLinha: React.CSSProperties) => (
    <div style={{ overflow: "hidden", paddingBottom: 6 }}>
      <div style={{ translate: `0px ${(1 - p(de)) * 100}%`, ...estiloLinha }}>{conteudo}</div>
    </div>
  );
  const caps: React.CSSProperties = { fontFamily: MONTSERRAT, fontWeight: 500, fontSize: 36, letterSpacing: 1, textTransform: "uppercase" };
  return (
    <AbsoluteFill style={{ opacity: 1 - sai, filter: `blur(${sai * 6}px)` }}>
      {/* sombra em degradê só onde o texto entra */}
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 48%, rgba(20,8,12,0.55) 72%, rgba(20,8,12,0.65) 100%)", opacity: p(0) }} />
      <div style={{ position: "absolute", top: estilo === "C" ? 1180 : 1070, width: "100%", textAlign: "center", color: "#FFFFFF", textShadow: SOMBRA }}>
        {estilo === "A" ? (
          <>
            {linha(0.15, "Um sorriso perfeito", caps)}
            {linha(0.3, "depende de", { fontFamily: POPPINS, fontWeight: 700, fontSize: 148, lineHeight: 0.95, letterSpacing: -5 })}
            {linha(0.4, "você", { fontFamily: POPPINS, fontWeight: 700, fontSize: 148, lineHeight: 0.95, letterSpacing: -5 })}
            {linha(1.2, "7 anos de cuidado juntas", { ...caps, fontSize: 30, marginTop: 14 })}
          </>
        ) : estilo === "B" ? (
          <>
            {linha(0.15, <>UM SORRISO <b style={{ fontWeight: 700 }}>PERFEITO</b></>, { ...caps, fontSize: 36 })}
            {linha(0.3, "depende de você", { fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 112, lineHeight: 1.0, letterSpacing: -2 })}
            <div style={{ marginTop: 22, opacity: p(1.2), translate: `0px ${(1 - p(1.2)) * 14}px` }}>
              <span style={{ display: "inline-block", background: "#8E2737", padding: "14px 26px", fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 30, textTransform: "uppercase", letterSpacing: 1, textShadow: "none" }}>
                paciente há mais de 7 anos
              </span>
            </div>
          </>
        ) : (
          <>
            <div style={{ opacity: p(0.1), translate: `0px ${(1 - p(0.1)) * 14}px`, marginBottom: 26 }}>
              <span style={{ display: "inline-block", border: "1.6px solid rgba(255,255,255,0.9)", borderRadius: 40, padding: "12px 32px", fontFamily: MONTSERRAT, fontWeight: 500, fontSize: 22, letterSpacing: 6 }}>
                PACIENTE HÁ MAIS DE 7 ANOS
              </span>
            </div>
            {linha(0.35, "um sorriso perfeito", { fontFamily: MONTSERRAT, fontWeight: 300, fontSize: 64, letterSpacing: -1, textTransform: "uppercase" })}
            {linha(0.5, "depende de você", { fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 64, letterSpacing: -1, textTransform: "uppercase" })}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

// etiqueta em pílula sobre a foto (ANTES / DEPOIS / legenda curta)
const Etiqueta: React.FC<{ texto: string; p: number; topo?: number }> = ({ texto, p, topo = 250 }) => (
  <div style={{ position: "absolute", top: topo, width: "100%", display: "flex", justifyContent: "center", opacity: p, translate: `0px ${(1 - p) * 14}px` }}>
    <div
      style={{
        fontFamily: MONTSERRAT,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: 7,
        color: "#FFFFFF",
        background: "rgba(126,42,56,0.82)",
        padding: "12px 30px",
        borderRadius: 40,
        boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
      }}
    >
      {texto}
    </div>
  </div>
);

// foto em tela cheia com movimento lento (Ken Burns) e entrada/saída suaves
const FotoCheia: React.FC<{ src: string; dur: number; pos?: string; etiqueta?: string; zoom?: [number, number]; fundo?: boolean }> = ({
  src,
  dur,
  pos = "center",
  etiqueta,
  zoom = [1.04, 1.12],
  fundo = true,
}) => {
  const f = useCurrentFrame();
  const vis = interpolate(f, [0, 7, dur - 7, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {fundo ? (
        // fundo desfocado da própria foto pra fotos que não são verticais
        <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.75)", scale: 1.2 }} />
      ) : null}
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: fundo ? "contain" : "cover",
          objectPosition: pos,
          scale: interpolate(f, [0, dur], zoom, clamp),
        }}
      />
      {etiqueta ? <Etiqueta texto={etiqueta} p={interpolate(f, [6, 16], [0, 1], { ...clamp, easing: REVELA })} /> : null}
    </AbsoluteFill>
  );
};

// antes → depois: as duas fotos clínicas na mesma moldura; a cortina abre o "depois" da esquerda pra direita
const AntesDepois: React.FC<{ dur: number; revela: number }> = ({ dur, revela }) => {
  const f = useCurrentFrame();
  const vis = interpolate(f, [0, 7, dur - 7, dur], [0, 1, 1, 0], clamp);
  const c = interpolate(f, [revela, revela + 18], [0, 100], { ...clamp, easing: SUAVE });
  const z = interpolate(f, [0, dur], [1.0, 1.06], clamp);
  const foto = (src: string) => (
    <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", scale: z }} />
  );
  return (
    <AbsoluteFill style={{ opacity: vis, background: "#1a1012" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 800, overflow: "hidden" }}>
        {foto("fotos-1010/02.jpg")}
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - c}% 0 0)` }}>{foto("fotos-1010/07.jpg")}</div>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${c}%`, width: 4, background: "#FFFFFF", opacity: c > 0 && c < 100 ? 0.9 : 0, boxShadow: "0 0 18px rgba(255,255,255,0.8)" }} />
      </div>
      <Etiqueta texto="ANTES" p={interpolate(f, [6, 16, revela, revela + 6], [0, 1, 1, 0], clamp)} topo={440} />
      <Etiqueta texto="DEPOIS" p={interpolate(f, [revela + 10, revela + 20], [0, 1], { ...clamp, easing: REVELA })} topo={440} />
    </AbsoluteFill>
  );
};

const Assinatura: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const p = (de: number) => interpolate(f, [de, de + 14], [0, 1], { ...clamp, easing: REVELA });
  const sai = interpolate(f, [dur - 8, dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(20,8,12,0.6) 0%, rgba(20,8,12,0.35) 20%, rgba(20,8,12,0) 34%)", opacity: p(0) }} />
      <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", color: "#FFFFFF", textShadow: SOMBRA }}>
        <div style={{ fontFamily: MONTSERRAT, fontWeight: 500, fontSize: 30, letterSpacing: 6, opacity: p(0), translate: `0px ${(1 - p(0)) * 14}px` }}>
          CONHEÇA A
        </div>
        <div style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 92, lineHeight: 1.05, letterSpacing: -1.5, opacity: p(6), translate: `0px ${(1 - p(6)) * 20}px` }}>
          Dra. Camilla Wanderley
        </div>
        <div style={{ marginTop: 20, opacity: p(14), translate: `0px ${(1 - p(14)) * 14}px` }}>
          <span style={{ display: "inline-block", background: "#8E2737", padding: "14px 26px", fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 28, textTransform: "uppercase", letterSpacing: 1, textShadow: "none" }}>
            Clínica Geral e Endodontia
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ em: number; nome: string; volume: number }> = ({ em, nome, volume }) => (
  <Sequence name={`SFX · ${nome}`} from={F(em)} durationInFrames={F(1.5)} layout="none">
    <Audio src={staticFile(`sfx/${nome}.wav`)} volume={volume} />
  </Sequence>
);

const ancora: Ancora = () => ({ x: 540, y: 1330, escura: false });

export const Depoimento1010: React.FC<{ fim: number; estilo?: EstiloHeadline }> = ({ fim, estilo = "B" }) => {
  const d = (a: number, b: number) => F(b) - F(a);
  return (
    <AbsoluteFill style={{ backgroundColor: "#F3E6E2" }}>
      <Base estilo={estilo} />
      <Sequence name="Headline" from={F(T.headlineDe)} durationInFrames={d(T.headlineDe, T.headlineAte)}>
        {estilo === "rose" ? <Headline /> : <HeadlineFoto estilo={estilo} />}
      </Sequence>
      <Sequence name="Foto · antes (afastador)" from={F(T.antesDe)} durationInFrames={d(T.antesDe, T.antesAte)}>
        <FotoCheia src="fotos-1010/02.jpg" dur={d(T.antesDe, T.antesAte)} etiqueta="ANTES" />
      </Sequence>
      <Sequence name="Antes → depois" from={F(T.compDe)} durationInFrames={d(T.compDe, T.compAte)}>
        <AntesDepois dur={d(T.compDe, T.compAte)} revela={F(T.compRevela) - F(T.compDe)} />
      </Sequence>
      <Sequence name="Foto · espelho" from={F(T.espelhoDe)} durationInFrames={d(T.espelhoDe, T.espelhoAte)}>
        <FotoCheia src="fotos-1010/06.jpg" dur={d(T.espelhoDe, T.espelhoAte)} pos="center 30%" fundo={false} zoom={[1.0, 1.08]} />
      </Sequence>
      <Sequence name="Foto · paciente exemplo" from={F(T.exemploDe)} durationInFrames={d(T.exemploDe, T.exemploAte)}>
        <FotoCheia src="fotos-1010/04.jpg" dur={d(T.exemploDe, T.exemploAte)} pos="center 25%" fundo={false} zoom={[1.0, 1.07]} etiqueta="PACIENTE EXEMPLO" />
      </Sequence>

      <Sequence name="Foto · canino (de lado)" from={F(T.caninoDe)} durationInFrames={d(T.caninoDe, T.caninoAte)}>
        <FotoCheia src="fotos-1010/01.jpg" dur={d(T.caninoDe, T.caninoAte)} zoom={[1.04, 1.14]} />
      </Sequence>
      <Sequence name="Foto · selfie com o filho" from={F(T.gravidezDe)} durationInFrames={d(T.gravidezDe, T.gravidezAte)}>
        <FotoCheia src="fotos-1010/03.jpg" dur={d(T.gravidezDe, T.gravidezAte)} pos="center 30%" fundo={false} zoom={[1.0, 1.07]} />
      </Sequence>
      <Sequence name="Foto · com a doutora e o Dr. Jadson" from={F(T.familiaDe)} durationInFrames={d(T.familiaDe, T.familiaAte)}>
        <FotoCheia src="fotos-1010/05.jpg" dur={d(T.familiaDe, T.familiaAte)} pos="center 25%" fundo={false} zoom={[1.0, 1.07]} />
      </Sequence>
      {fim > F(T.assinaturaDe) ? (
        <Sequence name="Assinatura" from={F(T.assinaturaDe)} durationInFrames={fim - F(T.assinaturaDe)}>
          <Assinatura dur={fim - F(T.assinaturaDe)} />
        </Sequence>
      ) : null}

      <Legendas arquivo="legendas/1010.json" ancora={ancora} ocultar={[[0, T.headlineAte]]} />

      {/* voz original */}
      <Audio name="Voz (original)" src={staticFile("midia/1010.mp4")} />
      {/* trilha por intenção: acolhimento (a história) → clareza (o recado da doutora) */}
      <Audio name="Trilha · acolhimento" src={staticFile("trilha-1010/acolhimento.wav")} volume={(f) => interpolate(f, [0, 12, fim - 15, fim], [0, 1, 1, 0], clamp) * (1 - interpolate(f, [F(T.trilhaTrocaDe), F(T.trilhaTrocaAte)], [0, 1], clamp))} />
      {fim > F(T.trilhaTrocaDe) ? (
        <Audio name="Trilha · clareza" src={staticFile("trilha-1010/clareza.wav")} volume={(f) => interpolate(f, [F(T.trilhaTrocaDe), F(T.trilhaTrocaAte), fim - 15, fim], [0, 1, 1, 0], clamp)} />
      ) : null}
      {/* efeitos graves (whoosh encorpado, impacto) */}
      <Sfx em={0.05} nome="whoosh-grave-impacto" volume={0.65} />
      <Sfx em={T.antesDe - 0.25} nome="whoosh-grave" volume={0.6} />
      <Sfx em={T.antesAte - 0.25} nome="whoosh-grave" volume={0.45} />
      <Sfx em={T.compDe - 0.25} nome="whoosh-grave" volume={0.6} />
      <Sfx em={T.compRevela - 0.1} nome="whoosh-grave-cards" volume={0.7} />
      <Sfx em={T.espelhoDe - 0.2} nome="whoosh-grave" volume={0.55} />
      <Sfx em={T.exemploDe - 0.25} nome="whoosh-grave-impacto" volume={0.6} />
      <Sfx em={T.caninoDe - 0.25} nome="whoosh-grave" volume={0.6} />
      <Sfx em={T.caninoAte - 0.25} nome="whoosh-grave" volume={0.45} />
      <Sfx em={T.gravidezDe - 0.25} nome="whoosh-grave" volume={0.6} />
      <Sfx em={T.familiaDe - 0.25} nome="whoosh-grave-cards" volume={0.65} />
      <Sfx em={T.familiaAte - 0.25} nome="whoosh-grave" volume={0.45} />
      <Sfx em={T.assinaturaDe} nome="whoosh-grave-impacto" volume={0.65} />
    </AbsoluteFill>
  );
};
