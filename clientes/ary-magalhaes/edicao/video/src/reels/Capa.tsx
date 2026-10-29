import { AbsoluteFill, Img, staticFile } from "remotion";
import { BASE_ESCURA, BODONI, COR, POPPINS, tamTitulo } from "./marca";
import { Rico } from "./Texto";

// Capas dos reels da Ary (fotos da diária de 2026-10-24). 1080x1920; título e assinatura dentro do miolo
// 1080x1440 (y 240–1680), que é o que aparece na grade do perfil. Texto nunca em cima do rosto.
// Padrão dos posts aprovados ("1 ano", "AGENDA", "União"): só a base da foto escurece, caixa alta pequena opcional,
// título grande em Bodoni creme, uma linha em Poppins com a palavra-chave em negrito, assinatura entre fios.
// Nada de itálico nem dourado no título (recusado em 2026-10-24).
type CapaDef = { id: string; foto: string; caps?: string; titulo: string; linha?: string; pos?: string };
const CREME = "#F6EFE4";

export const CAPAS: CapaDef[] = [
  { id: "mechas-antes-ou-depois", foto: "midia/fotos/IMG_6485.jpg", caps: "A DÚVIDA QUE EU MAIS ESCUTO", titulo: "Mechas ou alisamento?", linha: "qual vem *primeiro*?", pos: "center 30%" },
  { id: "selagem-3-coisas", foto: "midia/fotos/IMG_6482.jpg", titulo: "Selagem", linha: "três coisas que você faz em casa e *acabam com ela*", pos: "center 25%" },
  { id: "sobrancelha", foto: "midia/fotos/quadro-IMG_6489-97s.jpg", titulo: "Sobrancelha", linha: "pouca gente sabe, mas *eu também faço*", pos: "center 20%" },
  { id: "estetica-ou-saude", foto: "midia/fotos/IMG_6506.jpg", titulo: "Estética ou saúde?", linha: "cuidar do cabelo é *os dois*, meu amor", pos: "center 22%" },
  { id: "cabelo-de-salao-em-casa", foto: "midia/fotos/IMG_6486.jpg", titulo: "Cabelo de salão", linha: "como manter *em casa*", pos: "center 25%" },
  { id: "muito-prazer", foto: "midia/fotos/quadro-IMG_6502-138s.jpg", caps: "SE VOCÊ CHEGOU AGORA", titulo: "Muito prazer", linha: "eu sou a *Ary Magalhães*", pos: "center 20%" },
];

export const Capa: React.FC<{ id: string }> = ({ id }) => {
  const c = CAPAS.find((x) => x.id === id)!;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.preto }}>
      <Img src={staticFile(c.foto)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: c.pos ?? "center 30%", filter: "sepia(0.16) saturate(0.98) contrast(1.07) brightness(0.92)" }} />
      <AbsoluteFill style={{ background: BASE_ESCURA }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1270, textAlign: "center" }}>
        {c.caps ? <div style={{ fontFamily: POPPINS, fontWeight: 400, fontSize: 22, letterSpacing: 7, color: CREME }}>{c.caps}</div> : null}
        <div style={{ fontFamily: BODONI, fontWeight: 400, fontSize: tamTitulo(c.titulo, 116, 14), lineHeight: 1.0, marginTop: 14, letterSpacing: -1, color: CREME }}>{c.titulo}</div>
        {c.linha ? <div style={{ marginTop: 18 }}><Rico t={c.linha} tamanho={34} cor={CREME} /></div> : null}
        <div style={{ marginTop: 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <div style={{ width: 56, height: 1.2, background: COR.dourado }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 400, fontSize: 21, letterSpacing: 7, color: CREME }}>ARY MAGALHÃES</div>
          <div style={{ width: 56, height: 1.2, background: COR.dourado }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
