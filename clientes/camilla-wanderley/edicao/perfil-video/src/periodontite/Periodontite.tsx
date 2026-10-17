import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AberturaVideo } from "./Abertura";
import { CORMORANT, MONTSERRAT, ROSE, VINHO } from "./Bloco";
import { Enquadramento } from "./Enquadramento";
import { Headline3D } from "./Headline3D";
import { Ancora, Legendas } from "./Legendas";
import { ConfigLimpeza, Limpeza3D } from "./Limpeza3D";
import { ConfigLinha, LinhaDoTempo3D } from "./LinhaDoTempo3D";
import { T } from "./tempos";

// "Periodontite na gestação" · primeiro vídeo do perfil de vídeo da Dra. Camilla (aprovado em 2026-10-06).
// Linguagem orgânica (captação de consulta). Abertura: a filmagem com zoom de ênfase e uma headline única
// na estética dos posts, com a maquete 3D dentro dela. Depois, enquadramento na doutora com ênfases de zoom,
// legenda centralizada em frase (até duas linhas) e o mesmo bloco gráfico nos momentos-chave
// (2º trimestre, antes de engravidar, limpeza). Trilha muda com a intenção da cena; cada animação tem som.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const F = (s: number) => Math.round(s * 30);

const TRIMESTRE: ConfigLinha = {
  de: T.triDe,
  foco: T.triFoco,
  ate: T.triAte,
  tituloEm: T.triFoco - 0.25,
  subEm: T.triFoco + 0.15,
  partida: 1,
  focoIdx: 2,
  tag: "QUANDO TRATAR NA GESTAÇÃO",
  titulo: "2º trimestre",
  sub: "a fase mais indicada pra tratar",
};
const ANTES: ConfigLinha = {
  de: T.antesDe,
  foco: T.antesFoco,
  ate: T.antesAte,
  tituloEm: T.antesTitulo,
  subEm: T.antesSub,
  partida: 1,
  focoIdx: 0,
  tag: "O IDEAL",
  titulo: "Antes de engravidar",
  sub: "saúde bucal também é planejamento",
};
const LIMPEZA: ConfigLimpeza = {
  de: T.limpezaDe,
  limpaEm: T.limpezaEm,
  ate: T.limpezaAte,
  tag: "DURANTE A GESTAÇÃO",
  titulo: "Limpeza",
  antes: "placa e tártaro",
  depois: "acompanhamento e prevenção",
};

const Sfx: React.FC<{ em: number; nome: string; volume: number }> = ({ em, nome, volume }) => (
  <Sequence name={`SFX · ${nome}`} from={F(em)} durationInFrames={F(1.2)} layout="none">
    <Audio src={staticFile(`sfx/${nome}.wav`)} volume={volume} />
  </Sequence>
);

// sons de um bloco de linha do tempo (véu, fio, pérolas em notas subindo, destaque)
const SfxLinha: React.FC<{ c: ConfigLinha }> = ({ c }) => (
  <>
    <Sfx em={c.de} nome="air-whoosh" volume={0.1} />
    <Sfx em={c.de + 0.1} nome="tonal-tick" volume={0.06} />
    <Sfx em={c.de + 0.2} nome="micro-whoosh" volume={0.06} />
    <Sfx em={c.de + 0.25} nome="perola-1" volume={0.11} />
    <Sfx em={c.de + 0.43} nome="perola-2" volume={0.11} />
    <Sfx em={c.de + 0.61} nome="perola-3" volume={0.11} />
    <Sfx em={c.tituloEm} nome="soft-hit" volume={0.08} />
    <Sfx em={c.foco - 0.2} nome="glint" volume={0.13} />
    <Sfx em={c.subEm} nome="ui-click" volume={0.06} />
    <Sfx em={c.ate - 0.4} nome="micro-whoosh" volume={0.1} />
  </>
);

// assinatura discreta no fim, no alto, na mesma linguagem do bloco
const Assinatura: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const sai = interpolate(f, [dur - 6, dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <AbsoluteFill
        style={{
          background: "linear-gradient(to bottom, rgba(248,236,232,0.95) 0%, rgba(246,232,228,0.85) 14%, rgba(244,229,225,0) 26%)",
          opacity: e,
        }}
      />
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", opacity: e, translate: `0px ${(1 - e) * 14}px` }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
          <div style={{ width: 44 * e, height: 1.5, background: ROSE }} />
          <div style={{ fontFamily: MONTSERRAT, fontWeight: 600, fontSize: 24, letterSpacing: 7, color: VINHO }}>DRA. CAMILLA WANDERLEY</div>
          <div style={{ width: 44 * e, height: 1.5, background: ROSE }} />
        </div>
        <div style={{ fontFamily: CORMORANT, fontStyle: "italic", fontWeight: 500, fontSize: 46, color: ROSE, marginTop: 10 }}>Clínica Geral e Endodontia</div>
      </div>
    </AbsoluteFill>
  );
};

// legenda centralizada na tela, numa altura fixa (acima dos controles do Reels, abaixo do rosto)
const ancora: Ancora = () => ({ x: 540, y: 1330, escura: false });

export const Periodontite: React.FC<{ fim: number }> = ({ fim }) => {
  const troca = (f: number) => interpolate(f, [F(T.trilhaTrocaDe), F(T.trilhaTrocaAte)], [0, 1], clamp);
  const troca2 = (f: number) => interpolate(f, [F(T.trilha2De), F(T.trilha2Ate)], [0, 1], clamp);
  const troca3 = (f: number) => interpolate(f, [F(T.trilha3De), F(T.trilha3Ate)], [0, 1], clamp);
  const fade = (f: number) => interpolate(f, [fim - 12, fim], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#F3E6E2" }}>
      <Sequence name="Abertura (vídeo + zoom)" durationInFrames={F(T.saiAte) + 1}>
        <AberturaVideo />
      </Sequence>
      <Sequence name="Enquadramento na doutora" from={F(T.saiAte)}>
        <Enquadramento de={F(T.saiAte)} />
      </Sequence>
      <Sequence name="Headline + maquete 3D" durationInFrames={F(T.saiAte)}>
        <Headline3D />
      </Sequence>
      <Sequence name="Bloco · 2º trimestre" from={F(TRIMESTRE.de)} durationInFrames={F(TRIMESTRE.ate) - F(TRIMESTRE.de)}>
        <LinhaDoTempo3D c={TRIMESTRE} />
      </Sequence>
      <Sequence name="Bloco · antes de engravidar" from={F(ANTES.de)} durationInFrames={F(ANTES.ate) - F(ANTES.de)}>
        <LinhaDoTempo3D c={ANTES} />
      </Sequence>
      <Sequence name="Bloco · limpeza" from={F(LIMPEZA.de)} durationInFrames={F(LIMPEZA.ate) - F(LIMPEZA.de)}>
        <Limpeza3D c={LIMPEZA} />
      </Sequence>
      <Sequence name="Assinatura" from={F(T.assinaturaDe)} durationInFrames={Math.max(1, fim - F(T.assinaturaDe))}>
        <Assinatura dur={Math.max(1, fim - F(T.assinaturaDe))} />
      </Sequence>

      {/* nos blocos o texto já diz o que ela fala: a legenda sai */}
      <Legendas
        arquivo="legendas/periodontite.json"
        ancora={ancora}
        ocultar={[
          [0, 2.8],
          [TRIMESTRE.de, TRIMESTRE.ate],
          [ANTES.de, ANTES.ate],
          [LIMPEZA.de, LIMPEZA.ate],
        ]}
      />

      {/* voz original nivelada (scripts/nivelar_voz.py): mesmo timbre, mesmo nível do começo ao fim */}
      <Audio name="Voz (original, nivelada)" src={staticFile("midia/voz_nivelada.wav")} />
      {/* trilha por intenção: clínica (técnico) → acolhimento (gestante) → clareza (orientação) → acolhimento (bebê) */}
      <Audio name="Trilha · clínica" src={staticFile("trilha/clinico.wav")} volume={(f) => interpolate(f, [0, 10], [0, 1], clamp) * (1 - troca(f))} />
      <Audio
        name="Trilha · acolhimento"
        src={staticFile("trilha/acolhimento.wav")}
        volume={(f) => Math.max(troca(f) * (1 - troca2(f)), troca3(f)) * fade(f)}
      />
      <Audio name="Trilha · clareza" src={staticFile("trilha/clareza.wav")} volume={(f) => troca2(f) * (1 - troca3(f)) * fade(f)} />

      {/* sound design: cada animação tem o seu som, sempre abaixo da voz */}
      {/* abertura */}
      <Sfx em={0.0} nome="soft-hit" volume={0.12} />
      <Sfx em={T.zoomDe + 0.03} nome="micro-whoosh" volume={0.1} />
      <Sfx em={T.headlineDe} nome="air-whoosh" volume={0.08} />
      <Sfx em={T.maqueteDe} nome="pop" volume={0.16} />
      <Sfx em={T.subDe} nome="ui-click" volume={0.07} />
      <Sfx em={T.separaDe} nome="separa" volume={0.16} />
      <Sfx em={T.inflamaDe} nome="low-pulse" volume={0.13} />
      <Sfx em={T.inflamaDe + 0.02} nome="ui-click" volume={0.05} />
      <Sfx em={T.perioDe} nome="low-impact" volume={0.12} />
      <Sfx em={T.perioDe + 0.05} nome="tonal-sting" volume={0.07} />
      <Sfx em={T.juntaDe} nome="separa" volume={0.11} />
      <Sfx em={T.juntaAte - 0.05} nome="soft-hit" volume={0.1} />
      <Sfx em={T.saiDe} nome="micro-whoosh" volume={0.12} />
      {/* ênfases de zoom na doutora */}
      {T.enfases
        .filter(([s, v], i) => i > 0 && s < 50 && v > T.enfases[i - 1][1])
        .map(([s]) => (
          <Sfx key={s} em={s - 0.4} nome="micro-whoosh" volume={0.06} />
        ))}
      {/* blocos */}
      <SfxLinha c={TRIMESTRE} />
      <SfxLinha c={ANTES} />
      <Sfx em={LIMPEZA.de} nome="air-whoosh" volume={0.1} />
      <Sfx em={LIMPEZA.de + 0.1} nome="pop" volume={0.14} />
      <Sfx em={LIMPEZA.de + 0.5} nome="ui-click" volume={0.06} />
      <Sfx em={LIMPEZA.limpaEm} nome="separa" volume={0.12} />
      <Sfx em={LIMPEZA.limpaEm + 0.15} nome="glint" volume={0.15} />
      <Sfx em={LIMPEZA.limpaEm + 0.3} nome="ui-click" volume={0.06} />
      <Sfx em={LIMPEZA.ate - 0.4} nome="micro-whoosh" volume={0.1} />
      {/* fecho */}
      <Sfx em={T.assinaturaDe} nome="tonal-release" volume={0.08} />
    </AbsoluteFill>
  );
};
