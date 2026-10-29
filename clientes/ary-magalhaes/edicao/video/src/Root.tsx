import { Composition, Still } from "remotion";
import { Reel, PLANOS } from "./reels/Reel";
import { Capa, CAPAS } from "./reels/Capa";
import { Post, POSTS } from "./reels/Post";
import { PostVar, POSTS_VAR } from "./reels/PostVar";

const F = (s: number) => Math.round(s * 30);

export const RemotionRoot: React.FC = () => (
  <>
    {/* reels da diária de 2026-10-24 (planos em src/reels/planos.json, gerados por edicao/2026-10-24/montar.py) */}
    {Object.values(PLANOS).map((p) => (
      <Composition key={p.id} id={p.id} component={Reel} durationInFrames={F(p.total)} fps={30} width={1080} height={1920} defaultProps={{ id: p.id }} />
    ))}
    {/* capas dos reels (1080x1920; o essencial fica no miolo 1080x1440 que aparece na grade do perfil) */}
    {CAPAS.map((c) => (
      <Still key={c.id} id={`capa-${c.id}`} component={Capa} width={1080} height={1920} defaultProps={{ id: c.id }} />
    ))}
    {/* post fixo de imagem que acompanha cada reel (feed 1080x1350) */}
    {POSTS.map((p) => (
      <Still key={p.id} id={`post-${p.id}`} component={Post} width={1080} height={1350} defaultProps={{ id: p.id }} />
    ))}
    {/* posts pós-reel com formato variado (2026-10-28): pv-<id>-<slide> */}
    {POSTS_VAR.flatMap((p) =>
      p.slides.map((_, n) => <Still key={`${p.id}-${n}`} id={`pv-${p.id}-${n + 1}`} component={PostVar} width={1080} height={1350} defaultProps={{ id: p.id, n }} />)
    )}
  </>
);
