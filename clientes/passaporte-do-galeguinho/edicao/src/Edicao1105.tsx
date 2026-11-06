import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Bloco, LARGURA, SeloDeLocal } from "./Abertura";
import { Acabamento, FILTRO_DO_GRADE } from "./Acabamento";
import { Legendas } from "./Legendas";
import type { ZonaDeLegenda } from "./Legendas";
import { MARCA, VIDRO } from "./marca";
import { SomDaCasa } from "./Sons";
import edl from "../public/legendas/1105-edl.json";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

// Visita ao Açougue Diniz, fornecedor da carne dos hambúrgueres (gravação de 2026-11-05).
// O vídeo-base já vem cortado pelo scripts/1105/montar.py (trechos e porquês em scripts/1105/trechos.py);
// aqui entra a linha visual do Galeguinho: grade, legenda, headlines, selo da casa, card do fornecedor, trilha e sons.
export const FPS_1105 = 30;
export const DURACAO_1105 = Math.round(edl.total * FPS_1105);

const TRAVA = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);
const ELASTICO = Easing.bezier(0.34, 1.56, 0.64, 1);
const f = (s: number) => Math.round(s * FPS_1105);
const trecho = (id: string) => edl.trechos.find((t) => t.id === id)!;

// Falas (do corte ao corte): a trilha fica baixa nelas e sobe nos respiros sem fala (regra 16 da curadoria).
const FALAS = edl.trechos.filter((t) => t.som).map((t) => [t.de, t.ate] as const);

// quanto de "fala" há no instante t: 1 dentro de uma fala, 0 nos respiros, rampa de 0,3 s nas bordas
const RAMPA = 0.3;
const pesoDaFala = (t: number) => {
  let p = 0;
  for (const [de, ate] of FALAS) {
    if (t >= de - RAMPA && t <= ate + RAMPA) {
      p = Math.max(
        p,
        t < de ? interpolate(t, [de - RAMPA, de], [0, 1], TRAVA) : t > ate ? interpolate(t, [ate, ate + RAMPA], [1, 0], TRAVA) : 1,
      );
    }
  }
  return p;
};
const bordas = (t: number, total: number) =>
  interpolate(t, [0, 0.6], [0, 1], TRAVA) * interpolate(t, [total - 1.6, total], [1, 0], TRAVA);
// Duas versões da mesma trilha (scripts/gerar-trilha.py), no mesmo tempo: por baixo da fala vai a sem bateria,
// baixinha (a batida numa pausa da fala fazia "parceria" soar "bateria"); nos respiros entra a completa.
const BAIXO = 0.06;
const ALTO = 0.3;
const volumeCheia = (frame: number, fps: number, total: number) =>
  ALTO * (1 - pesoDaFala(frame / fps)) * bordas(frame / fps, total / fps);
const volumeSemBateria = (frame: number, fps: number, total: number) =>
  BAIXO * pesoDaFala(frame / fps) * bordas(frame / fps, total / fps);

// Onde a legenda e a headline ficam em cada trecho (zonas seguras do reels, 2026-10-12: legenda logo abaixo do
// rosto, y 900–1080; headline na faixa de baixo, base até 1500). Ajustado por quadro em scripts/1105/REVISAR.md.
const zona = (
  id: string,
  z: Omit<ZonaDeLegenda, "de" | "ate">,
): ZonaDeLegenda => ({ de: f(trecho(id).de), ate: f(trecho(id).ate), ...z });
const PADRAO = { esquerda: 90, direita: 90, centro: 1000, base: 1440, enfase: 104 };
const insertDaPlaca = trecho("parceria").imagens[1]; // a placa do Açougue Diniz (IMG_1320)
const abre = trecho("abre");
const ZONAS_1105: ZonaDeLegenda[] = [
  // abertura: depois da inserção da câmara fria ele chega perto da câmera (queixo em ~y 1000): o texto desce
  { de: f(abre.imagens[2].de) - 6, ate: f(abre.ate), ...PADRAO, centro: 1250, base: 1500, enfase: 96 },
  zona("abre", PADRAO),
  // durante a placa do Diniz a legenda desce, pra não cobrir o nome na logo
  { de: f(insertDaPlaca.de) - 8, ate: f(insertDaPlaca.ate), ...PADRAO, centro: 1430 },
  zona("parceria", PADRAO),
  zona("eduardo", PADRAO),
  zona("blend", PADRAO),
  zona("exclusiva", PADRAO),
  zona("camara", PADRAO),
  // moagem: a carne sai na bandeja (y 1080 pra baixo); legenda e headline sobem pro corpo da máquina
  zona("moagem", { ...PADRAO, centro: 880, base: 1020, enfase: 96 }),
  // "crua": a carne ocupa o meio e a direita do quadro; o texto fica em cima, à esquerda, sobre o metal da máquina
  zona("crua", { ...PADRAO, centro: 400, base: 470, headlineEsquerda: 60, headlineDireita: 440 }),
  // ele segura o saco de carne moída na altura da cintura (y 1080–1440): tudo entre o rosto e o saco
  zona("todo-dia", { ...PADRAO, centro: 985, base: 1075, enfase: 84 }),
  // o saco de carne fica no balcão, à esquerda (x 0–260): a headline vai pra direita
  zona("chamada", { ...PADRAO, headlineEsquerda: 300, headlineDireita: 70 }),
];

// Card do fornecedor: a logo do Açougue Diniz (recortada da placa filmada na visita), o nome e o @ da placa.
const CardDoFornecedor: React.FC<{ duracao: number }> = ({ duracao }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: LARGURA,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "16px 34px 16px 16px",
          borderRadius: 70,
          ...VIDRO,
          opacity: interpolate(frame, [0, 6, duracao - 7, duracao], [0, 1, 1, 0], TRAVA),
          scale: interpolate(frame, [0, 14], [0.9, 1], { ...TRAVA, easing: ELASTICO }),
          translate: interpolate(frame, [duracao - 8, duracao], ["0px 0px", "0px 16px"], {
            ...TRAVA,
            easing: Easing.in(Easing.cubic),
          }),
        }}
      >
        <Img
          src={staticFile("intro/diniz-logo.png")}
          style={{
            width: 104,
            height: 104,
            borderRadius: "50%",
            border: `3px solid ${MARCA.dourado}`,
            rotate: `${interpolate(frame, [0, 16], [-40, 0], { ...TRAVA, easing: ELASTICO })}deg`,
          }}
        />
        <div
          style={{
            opacity: interpolate(frame, [8, 18], [0, 1], TRAVA),
            translate: interpolate(frame, [8, 20], ["-14px 0px", "0px 0px"], { ...TRAVA, easing: SUAVE }),
          }}
        >
          <div style={{ fontFamily, fontWeight: 600, fontSize: 21, color: "rgba(255,246,233,0.72)" }}>
            fornecedor da carne
          </div>
          <div style={{ fontFamily, fontWeight: 800, fontSize: 34, color: MARCA.creme, lineHeight: 1.1 }}>
            Açougue <span style={{ color: MARCA.laranja }}>Diniz</span>
          </div>
          <div style={{ fontFamily, fontWeight: 600, fontSize: 22, color: MARCA.dourado }}>@acouguediniz</div>
        </div>
      </div>
    </div>
  );
};

// Horário da casa, na pílula abaixo do selo, no fechamento (o mesmo do vídeo de 17/10).
const Horario: React.FC<{ duracao: number }> = ({ duracao }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: LARGURA, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: "14px 30px",
          borderRadius: 40,
          backgroundColor: "rgba(14,10,5,0.78)",
          border: "1.5px solid rgba(255,176,31,0.42)",
          fontFamily,
          fontWeight: 700,
          fontSize: 27,
          color: MARCA.creme,
          opacity: interpolate(frame, [0, 6, duracao - 6, duracao], [0, 1, 1, 0], TRAVA),
          translate: interpolate(frame, [0, 12], ["0px -16px", "0px 0px"], { ...TRAVA, easing: SUAVE }),
        }}
      >
        de terça a domingo · <span style={{ color: MARCA.dourado }}>18h às 23h</span>
      </div>
    </div>
  );
};

export const Edicao1105: React.FC<{ video: string; legendas: string }> = ({ video, legendas }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const centro = { x: 540 };

  // momentos (em segundos no vídeo final), tirados do 1105-edl.json e do analise/legendas.txt
  const seloEm = f(trecho("parceria").de + 2.75); // "São José da Laje"
  const cardEm = f(trecho("eduardo").de + 2.4); // depois da headline "a melhor qualidade"
  const cardDur = f(trecho("eduardo").ate) - cardEm - 4;
  const fecho = trecho("fecho");

  return (
    <AbsoluteFill style={{ backgroundColor: MARCA.escuro }}>
      <Video
        name="Vídeo-base (cortado)"
        src={staticFile(video)}
        // a voz já vem forte do celular; com trilha e efeitos por cima o "da sua vida!" passava de 0 dBFS.
        // O volume final (−14 LUFS, pico −1,5 dBTP) sai no scripts/1105/finalizar.ps1
        volume={0.82}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: FILTRO_DO_GRADE }}
      />
      <Acabamento />

      <Audio
        name="Trilha completa (respiros)"
        src={staticFile("audio/trilha.wav")}
        volume={(fr) => volumeCheia(fr, fps, durationInFrames)}
      />
      <Audio
        name="Trilha sem bateria (sob a fala)"
        src={staticFile("audio/trilha-sem-bateria.wav")}
        volume={(fr) => volumeSemBateria(fr, fps, durationInFrames)}
      />

      {/* "o melhor Passaporte de São José da Laje": o selo da casa, na faixa de baixo */}
      <Sequence name="Selo da casa" from={seloEm} durationInFrames={72}>
        <Bloco ancora={{ x: centro.x, topo: 1170 }}>
          <SeloDeLocal cidade="São José da Laje · AL" duracao={72} topoInterno={0} />
        </Bloco>
      </Sequence>
      <SomDaCasa nome="logo cai" em={seloEm} som="estouro" volume={0.46} />
      <SomDaCasa nome="logo assenta" em={seloEm + 2} som="impacto" volume={0.22} />
      <SomDaCasa nome="pílula abre" em={seloEm + 6} som="sopro" volume={0.3} />
      <SomDaCasa nome="nome aparece" em={seloEm + 13} som="toque" volume={0.28} />
      <SomDaCasa nome="pino" em={seloEm + 18} som="estouro" volume={0.26} />
      <SomDaCasa nome="selo sai" em={seloEm + 64} som="sopro" volume={0.22} />

      {/* o Eduardo fala: card do Açougue Diniz */}
      <Sequence name="Card do fornecedor" from={cardEm} durationInFrames={cardDur}>
        <Bloco ancora={{ x: centro.x, topo: 1170 }}>
          <CardDoFornecedor duracao={cardDur} />
        </Bloco>
      </Sequence>
      <SomDaCasa nome="card entra" em={cardEm} som="sopro" volume={0.4} />
      <SomDaCasa nome="logo gira" em={cardEm + 4} som="estouro" volume={0.4} />
      <SomDaCasa nome="nome do fornecedor" em={cardEm + 10} som="toque" volume={0.28} />
      {/* sem som na saída do card: ela cai no "Galeguinho", a última palavra da frase (regra 16) */}

      {/* respiros sem fala: um sopro na troca de imagem */}
      {["ponte1", "ponte2", "fecho"].map((id) => (
        <SomDaCasa key={id} nome={`respiro ${id}`} em={f(trecho(id).de)} som="sopro" volume={0.3} />
      ))}

      {/* fechamento: selo da casa e horário no alto, sobre o metal da máquina (a carne fica livre embaixo) */}
      <Sequence name="Selo final" from={f(fecho.de) + 3} durationInFrames={f(fecho.ate - fecho.de) - 3}>
        <Bloco ancora={{ x: centro.x, topo: 290 }}>
          <SeloDeLocal cidade="São José da Laje · AL" duracao={f(fecho.ate - fecho.de) - 3} topoInterno={0} />
        </Bloco>
      </Sequence>
      <SomDaCasa nome="selo final cai" em={f(fecho.de) + 3} som="estouro" volume={0.44} />
      <SomDaCasa nome="selo final assenta" em={f(fecho.de) + 5} som="impacto" volume={0.24} />
      <SomDaCasa nome="selo final nome" em={f(fecho.de) + 16} som="toque" volume={0.26} />
      <Sequence name="Horário" from={f(fecho.de) + 24} durationInFrames={f(fecho.ate - fecho.de) - 24}>
        <Bloco ancora={{ x: centro.x, topo: 415 }}>
          <Horario duracao={f(fecho.ate - fecho.de) - 24} />
        </Bloco>
      </Sequence>
      <SomDaCasa nome="horário" em={f(fecho.de) + 24} som="estouro" volume={0.3} />
      <SomDaCasa nome="horário brilha" em={f(fecho.de) + 26} som="brilho" volume={0.16} />

      <Legendas arquivo={legendas} zonas={ZONAS_1105} />
    </AbsoluteFill>
  );
};
