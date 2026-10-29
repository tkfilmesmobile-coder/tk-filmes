import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CENAS, SONS_CENA } from "./Cenas";
import { Fio, PassosFio } from "./Fio";
import { Legendas } from "./Legendas";
import { BODONI, COR, COR_VIDEO, F, GILDA, POPPINS, REVELA, SUAVE, TEMA, ZONA, clamp, corTitulo, tamTitulo } from "./marca";
import { Assinatura, Rico, Veu } from "./Texto";
import planos from "./planos.json";

// Reels da Ary falando pra câmera (diária de 2026-10-24). Plano gerado por edicao/2026-10-24/montar.py.
// Linguagem: leve, sem trilha (só a voz dela e efeitos macios), B-roll do próprio salão por cima da fala,
// cartões com foto ao lado da cabeça seguindo o rosto, explicação técnica em animação na faixa de baixo.
// Nada de gráfico em cima do rosto.

type Trecho = { src: string; arq: string; inicio: number; dur: number; srcDe: number; tipo: string; zoom: number; track: [number, number, number, number][] };
type Broll = { de: number; ate: number; src: string; video?: string; foto?: string; srcDe?: number; num?: string; titulo?: string; linha?: string; pos?: string; modo?: "post" };
type Cartao = { de: number; ate: number; src: string | null; rotulo: string; lado: "esq" | "dir"; dy?: number; longe?: boolean; tam?: number };
type Zoom = { de: number; ate: number; z: number };
type Sfx = { em: number; nome: string; vol?: number };
export type Plano = {
  id: string;
  nome: string;
  total: number;
  fimVideo: number;
  headline: { caps: string; titulo: string; italico: string; de: number; ate: number };
  trechos: Trecho[];
  fotoFinal: { src: string; dur: number; titulo: string; chamada: string; pos?: string } | null;
  brolls: Broll[];
  cartoes: Cartao[];
  motions: { tipo: string; passos: Record<string, number> }[];
  textos: { de: number; ate: number; num: string; titulo: string }[];
  sfx: Sfx[];
  zooms: Zoom[];
};
export const PLANOS = planos as unknown as Record<string, Plano>;

// câmera: zoom do trecho × ênfases × respiração lenta; o rosto (rastreado) é o centro do zoom
function camera(pl: Plano, s: number) {
  const tr = pl.trechos.find((t) => s >= t.inicio && s < t.inicio + t.dur) ?? pl.trechos[pl.trechos.length - 1];
  const local = s - tr.inicio;
  let cx = 540, cy = 540, fw = 300;
  if (tr.track.length) {
    const ts = tr.track.map((k) => k[0]);
    if (tr.track.length > 1) {
      cx = interpolate(local, ts, tr.track.map((k) => k[1]), clamp);
      cy = interpolate(local, ts, tr.track.map((k) => k[2]), clamp);
      fw = interpolate(local, ts, tr.track.map((k) => k[3]), clamp);
    } else [, cx, cy, fw] = tr.track[0];
  }
  // rampa de entrada/saída que se ajusta a zoom curto (a faixa de tempo precisa ser sempre crescente)
  const enfase = pl.zooms.reduce((acc, z) => {
    const meio = (z.de + z.ate) / 2;
    const b = Math.min(z.de + 0.22, meio - 0.01);
    const c = Math.max(z.ate - 0.25, meio + 0.01);
    return acc * interpolate(s, [z.de, b, c, Math.max(z.ate, c + 0.01)], [1, z.z, z.z, 1], { ...clamp, easing: SUAVE });
  }, 1);
  const respira = 1 + 0.018 * (0.5 - 0.5 * Math.cos((s / 7) * Math.PI));
  const z = tr.zoom * enfase * respira;
  // zoom com o rosto como centro (ele fica onde está; a imagem cresce em volta), sem mostrar borda
  const tx = Math.min(0, Math.max(1080 - 1080 * z, cx * (1 - z)));
  const ty = Math.min(0, Math.max(1920 - 1920 * z, cy * (1 - z)));
  return { tr, z, tx, ty, rosto: { x: tx + z * cx, y: ty + z * cy, w: z * fw } };
}

const TrechoVideo: React.FC<{ tr: Trecho; pl: Plano }> = ({ tr, pl }) => {
  const s = useCurrentFrame() / 30 + tr.inicio;
  const { z, tx, ty } = camera(pl, s);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(tr.src)}
        trimBefore={F(tr.srcDe)}
        muted
        style={{ position: "absolute", width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})`, filter: COR_VIDEO }}
      />
    </AbsoluteFill>
  );
};

// B-roll em tela cheia por cima da fala (vídeo do salão ou foto de cliente), com título opcional embaixo
const BrollCheio: React.FC<{ b: Broll; dur: number }> = ({ b, dur }) => {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 6], [0, 1], { ...clamp, easing: REVELA });
  const sai = interpolate(f, [dur - 4, dur], [0, 1], clamp);
  const kb = interpolate(f, [0, dur], [1.0, 1.08], clamp);
  const tit = interpolate(f, [5, 16], [0, 1], { ...clamp, easing: REVELA });
  return (
    <AbsoluteFill style={{ opacity: entra * (1 - sai), scale: String(1.06 - 0.06 * entra), backgroundColor: COR.preto }}>
      {b.video ? (
        <OffthreadVideo src={staticFile(b.src)} trimBefore={F(b.srcDe ?? 0)} muted style={{ width: 1080, height: 1920, objectFit: "cover", scale: String(kb), filter: COR_VIDEO }} />
      ) : b.modo === "post" ? (
        // post publicado mostrado inteiro (prova do que ela fala): cartão no centro sobre a própria imagem desfocada
        <AbsoluteFill>
          <Img src={staticFile(b.src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(28px) brightness(0.55)", scale: "1.15" }} />
          <Img src={staticFile(b.src)} style={{ position: "absolute", left: 90, top: 330, width: 900, borderRadius: 22, boxShadow: "0 20px 50px rgba(0,0,0,0.45)", scale: String(0.98 + 0.03 * kb) }} />
        </AbsoluteFill>
      ) : (
        <Img src={staticFile(b.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: b.pos ?? "center 35%", scale: String(kb) }} />
      )}
      {b.titulo || b.num ? (
        <>
          {/* sobre o B-roll (imagem variada) o texto é sempre creme, como nos posts com foto */}
          <Veu x={ZONA.x0} y={1140} w={ZONA.x1 - ZONA.x0} h={b.titulo ? 300 : 170} vis={tit} />
          <div style={{ position: "absolute", left: ZONA.x0, width: ZONA.x1 - ZONA.x0, top: 1150, textAlign: "center", opacity: tit, translate: `0px ${(1 - tit) * 24}px`, textShadow: "0 1px 18px rgba(25,15,8,0.35)" }}>
            {b.num ? <div style={{ fontFamily: GILDA, fontSize: 130, lineHeight: 0.9, color: "#F6EFE4" }}>{b.num}</div> : null}
            <div style={{ fontFamily: BODONI, fontWeight: 400, fontSize: 76, color: "#F6EFE4", lineHeight: 1.05 }}>{b.titulo}</div>
            {b.linha ? <div style={{ marginTop: 10 }}><Rico t={b.linha} tamanho={30} cor="#F6EFE4" /></div> : null}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// cartão com foto ao lado da cabeça: segue o rosto, entra com "pop" e brilho champanhe em volta
const CartaoRosto: React.FC<{ c: Cartao; pl: Plano; inicio: number; dur: number }> = ({ c, pl, inicio, dur }) => {
  const f = useCurrentFrame();
  const s = f / 30 + inicio;
  const { rosto } = camera(pl, s);
  const entra = interpolate(f, [0, 9], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) * Math.cos(x * 2.2) });
  const sai = interpolate(f, [dur - 6, dur], [0, 1], { ...clamp, easing: SUAVE });
  const L = 200 * (c.tam ?? 1), A = 250 * (c.tam ?? 1);
  // largura real: cartão com foto = L; palavra solta = tamanho do texto (Bodoni 64 ≈ 36 px por letra), com mais folga do rosto
  const Lt = c.src ? L : c.rotulo.length * 36;
  const dx = rosto.w * (c.src ? (c.longe ? 0.85 : 0.62) : 0.85) + Lt / 2 + 10;
  const cx = c.lado === "esq" ? Math.max(ZONA.x0 + Lt / 2 + 10, rosto.x - dx) : Math.min(ZONA.x1 - Lt / 2 - 10, rosto.x + dx);
  const cy = Math.max(ZONA.y0 + A / 2 + 30, rosto.y - 10) + (c.dy ?? 0);
  const gira = c.lado === "esq" ? -4 : 4;
  const k = entra * (1 - sai);
  return (
    <div style={{ position: "absolute", left: cx - L / 2, top: cy - A / 2, width: L, opacity: Math.min(1, k * 1.4), scale: String(0.55 + 0.45 * k), rotate: `${gira * (1.6 - 0.6 * k)}deg` }}>
      {c.src ? (
        <div style={{ width: L, height: A, borderRadius: 18, overflow: "hidden", border: `3px solid #F6EFE4`, boxShadow: "0 10px 26px rgba(25,15,8,0.22)" }}>
          <Img src={staticFile(c.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        </div>
      ) : null}
      {!c.src ? (
        // cartão só com palavra (ex.: "MÃE", "ESPOSA"): Bodoni grande ao lado da cabeça, com o sombreado suave do tema
        <div style={{ position: "relative", textAlign: "center" }}>
          <Veu x={-20} y={40} w={L + 40} h={120} />
          <div style={{ position: "relative", fontFamily: BODONI, fontSize: 64, lineHeight: 1, color: TEMA.titulo, textShadow: TEMA.sombraTxt, marginTop: 70, whiteSpace: "nowrap" }}>
            {c.rotulo.charAt(0) + c.rotulo.slice(1).toLowerCase()}
          </div>
        </div>
      ) : null}
      <div style={{ marginTop: c.src ? -22 : 0, textAlign: "center", display: c.src ? "block" : "none" }}>
        <span style={{ display: "inline-block", marginTop: 30, fontFamily: POPPINS, fontWeight: 500, fontSize: 20, letterSpacing: 5, color: TEMA.texto, textShadow: TEMA.sombraTxt }}>
          {c.rotulo}
        </span>
      </div>
    </div>
  );
};

const Headline: React.FC<{ h: Plano["headline"]; dur: number }> = ({ h, dur }) => {
  const f = useCurrentFrame();
  const p = (de: number) => interpolate(f, [de, de + 12], [0, 1], { ...clamp, easing: REVELA });
  const sai = interpolate(f, [dur - 8, dur], [0, 1], { ...clamp, easing: SUAVE });
  // padrão dos posts aprovados: (data/tema em caixa alta pequena) + título Bodoni grande + linha Poppins com negrito + assinatura
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <Veu x={ZONA.x0} y={1150} w={ZONA.x1 - ZONA.x0} h={360} vis={p(0)} />
      <div style={{ position: "absolute", left: ZONA.x0, width: ZONA.x1 - ZONA.x0, top: 1160, textAlign: "center", filter: TEMA.filtro }}>
        {h.caps ? <div style={{ fontFamily: POPPINS, fontWeight: 400, fontSize: 20, letterSpacing: 6, color: TEMA.texto, textShadow: TEMA.sombraTxt, opacity: p(3) }}>{h.caps}</div> : null}
        <div style={{ fontFamily: BODONI, fontWeight: 400, fontSize: tamTitulo(h.titulo, 96, 14), lineHeight: 1.0, marginTop: 12, letterSpacing: -1, opacity: p(6), translate: `0px ${(1 - p(6)) * 18}px`, textShadow: TEMA.sombraTxt }}>
          <span style={corTitulo()}>{h.titulo}</span>
        </div>
        {h.italico ? <div style={{ marginTop: 14, opacity: p(11), translate: `0px ${(1 - p(11)) * 14}px` }}><Rico t={h.italico} tamanho={32} /></div> : null}
        <div style={{ marginTop: 26 }}><Assinatura vis={p(15)} /></div>
      </div>
    </AbsoluteFill>
  );
};

const Final: React.FC<{ fin: NonNullable<Plano["fotoFinal"]>; dur: number }> = ({ fin, dur }) => {
  const f = useCurrentFrame();
  const p = (de: number) => interpolate(f, [de, de + 14], [0, 1], { ...clamp, easing: REVELA });
  return (
    <AbsoluteFill style={{ opacity: p(0), backgroundColor: COR.preto }}>
      <Img src={staticFile(fin.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: fin.pos ?? "center 20%", scale: String(interpolate(f, [0, dur], [1.04, 1.0], clamp)), filter: "sepia(0.1) contrast(1.05) brightness(0.95)" }} />
      <Veu x={ZONA.x0} y={1200} w={ZONA.x1 - ZONA.x0} h={330} vis={p(0)} />
      <div style={{ position: "absolute", left: ZONA.x0, width: ZONA.x1 - ZONA.x0, top: 1210, textAlign: "center", filter: TEMA.filtro }}>
        <div style={{ fontFamily: BODONI, fontWeight: 400, fontSize: tamTitulo(fin.titulo, 88, 17), lineHeight: 1.02, opacity: p(4), translate: `0px ${(1 - p(4)) * 18}px`, textShadow: TEMA.sombraTxt }}>
          <span style={corTitulo()}>{fin.titulo}</span>
        </div>
        <div style={{ marginTop: 20, opacity: p(10), translate: `0px ${(1 - p(10)) * 14}px` }}>
          <Rico t={fin.chamada} tamanho={32} />
        </div>
        <div style={{ marginTop: 30 }}><Assinatura vis={p(16)} /></div>
      </div>
    </AbsoluteFill>
  );
};

// título numerado de cada passo (1 · protetor térmico...), na base escura, sem cartão
const PassoTitulo: React.FC<{ num: string; titulo: string; dur: number }> = ({ num, titulo, dur }) => {
  const f = useCurrentFrame();
  const p = (de: number) => interpolate(f, [de, de + 12], [0, 1], { ...clamp, easing: REVELA });
  const sai = interpolate(f, [dur - 8, dur], [0, 1], { ...clamp, easing: SUAVE });
  return (
    <AbsoluteFill style={{ opacity: 1 - sai }}>
      <Veu x={ZONA.x0} y={1150} w={ZONA.x1 - ZONA.x0} h={260} vis={p(0)} />
      <div style={{ position: "absolute", left: ZONA.x0, width: ZONA.x1 - ZONA.x0, top: 1160, textAlign: "center", filter: TEMA.filtro, textShadow: TEMA.sombraTxt }}>
        <div style={{ fontFamily: GILDA, fontSize: 130, lineHeight: 0.9, opacity: p(0), scale: String(0.85 + 0.15 * p(0)) }}><span style={corTitulo()}>{num}</span></div>
        <div style={{ fontFamily: BODONI, fontWeight: 400, fontSize: tamTitulo(titulo, 76, 18), lineHeight: 1.05, opacity: p(5), translate: `0px ${(1 - p(5)) * 16}px` }}><span style={corTitulo()}>{titulo}</span></div>
      </div>
    </AbsoluteFill>
  );
};


const Som: React.FC<Sfx> = ({ em, nome, vol = 0.5 }) => (
  <Sequence name={`SFX · ${nome}`} from={Math.max(0, F(em))} durationInFrames={F(1.6)} layout="none">
    <Audio src={staticFile(`sfx/${nome}.wav`)} volume={vol} />
  </Sequence>
);

export const Reel: React.FC<{ id: string }> = ({ id }) => {
  const pl = PLANOS[id];
  const f = useCurrentFrame();
  const s = f / 30;
  const fio = pl.motions.find((m) => m.tipo === "fio") as { tipo: string; passos: PassosFio } | undefined;
  const outras = pl.motions.filter((m) => m.tipo !== "fio" && CENAS[m.tipo]);
  // efeitos de cada animação (sempre abaixo da voz)
  const sons: Sfx[] = [
    ...pl.brolls.map((b) => ({ em: b.de - 0.12, nome: "varrida", vol: 0.32 })),
    ...pl.cartoes.map((c) => ({ em: c.de, nome: c.src ? "pop" : "pop-agudo", vol: 0.42 })),
    ...pl.zooms.map((z) => ({ em: z.de - 0.1, nome: "whoosh-curto", vol: 0.26 })),
    { em: pl.headline.de + 0.05, nome: "impacto", vol: 0.45 },
    ...(fio
      ? [
          { em: fio.passos.entra - 0.1, nome: "whoosh", vol: 0.32 },
          { em: fio.passos.alinha, nome: "fecha", vol: 0.42 },
          { em: fio.passos.cuticula, nome: "clique", vol: 0.4 },
          { em: fio.passos.brilho, nome: "brilho", vol: 0.32 },
          { em: fio.passos.abre, nome: "abre", vol: 0.42 },
          { em: fio.passos.cor, nome: "sopro", vol: 0.35 },
          { em: fio.passos.ordem + 0.15, nome: "erro", vol: 0.4 },
          { em: fio.passos.certo, nome: "check", vol: 0.42 },
        ]
      : []),
    ...outras.flatMap((m) => SONS_CENA[m.tipo](m.passos)),
    ...(pl.textos ?? []).map((t) => ({ em: t.de, nome: "impacto", vol: 0.32 })),
    ...(pl.fotoFinal ? [{ em: pl.fimVideo - 0.2, nome: "whoosh-grave", vol: 0.38 }] : []),
    ...pl.sfx,
  ];
  // legenda logo abaixo do rosto; some no título de abertura, no B-roll com título e no fim
  const ocultar: [number, number][] = [[pl.headline.de, pl.headline.ate], [pl.fimVideo, 9999], ...pl.brolls.filter((b) => b.titulo || b.modo === "post").map((b) => [b.de, b.ate] as [number, number])];
  return (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      {pl.trechos.map((tr, i) => (
        <Sequence key={i} name={`Fala ${i + 1} · ${tr.srcDe.toFixed(1)}s`} from={F(tr.inicio)} durationInFrames={F(tr.inicio + tr.dur) - F(tr.inicio)}>
          <TrechoVideo tr={tr} pl={pl} />
        </Sequence>
      ))}
      {/* vinheta quente: bordas em café, deixa a parede clara mais íntima (sem escurecer o rosto) */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 34%, rgba(30,20,12,0) 55%, rgba(30,20,12,0.38) 100%)", pointerEvents: "none" }} />
      {pl.cartoes.map((c, i) => (
        <Sequence key={`c${i}`} name={`Cartão · ${c.rotulo}`} from={F(c.de)} durationInFrames={F(c.ate) - F(c.de)} layout="none">
          <CartaoRosto c={c} pl={pl} inicio={F(c.de) / 30} dur={F(c.ate) - F(c.de)} />
        </Sequence>
      ))}
      {fio ? (
        <Sequence name="Animação · estrutura do fio" from={F(fio.passos.entra)} durationInFrames={F(fio.passos.sai) - F(fio.passos.entra)}>
          <Fio p={fio.passos} inicio={F(fio.passos.entra) / 30} />
        </Sequence>
      ) : null}
      {outras.map((m, i) => {
        const C = CENAS[m.tipo];
        return (
          <Sequence key={`m${i}`} name={`Animação · ${m.tipo}`} from={F(m.passos.entra)} durationInFrames={F(m.passos.sai) - F(m.passos.entra)}>
            <C p={m.passos} inicio={F(m.passos.entra) / 30} />
          </Sequence>
        );
      })}
      {(pl.textos ?? []).map((t, i) => (
        <Sequence key={`t${i}`} name={`Título · ${t.num} ${t.titulo}`} from={F(t.de)} durationInFrames={F(t.ate) - F(t.de)}>
          <PassoTitulo num={t.num} titulo={t.titulo} dur={F(t.ate) - F(t.de)} />
        </Sequence>
      ))}
      {pl.brolls.map((b, i) => (
        <Sequence key={`b${i}`} name={`B-roll · ${b.video ?? b.foto}`} from={F(b.de)} durationInFrames={F(b.ate) - F(b.de)}>
          <BrollCheio b={b} dur={F(b.ate) - F(b.de)} />
        </Sequence>
      ))}
      <Sequence name="Título de abertura" from={F(pl.headline.de)} durationInFrames={F(pl.headline.ate) - F(pl.headline.de)} layout="none">
        <Headline h={pl.headline} dur={F(pl.headline.ate) - F(pl.headline.de)} />
      </Sequence>
      {pl.fotoFinal ? (
        <Sequence name="Fecho · chamada" from={F(pl.fimVideo)} durationInFrames={F(pl.total) - F(pl.fimVideo)}>
          <Final fin={pl.fotoFinal} dur={F(pl.total) - F(pl.fimVideo)} />
        </Sequence>
      ) : null}
      <Legendas arquivo={`reels/${id}/legendas.json`} ocultar={ocultar} y={() => (fio && s >= fio.passos.entra && s < fio.passos.sai ? 930 : 940)} />
      <Audio name="Voz (montada e nivelada)" src={staticFile(`reels/${id}/voz.wav`)} />
      {sons.map((x, i) => (
        <Som key={i} {...x} />
      ))}
    </AbsoluteFill>
  );
};
