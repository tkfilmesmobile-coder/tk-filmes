// Instagram de verdade (pedido da Talyta, 16/11/2026: "exemplos reais, uma estética real da rede social"):
// notificações de "começou a seguir você" no alto e uma publicação da @tk.filmes no visual claro do app; na fala,
// o coração do toque duplo + curtidas subindo, um comentário sendo escrito e o aviso "Enviado". Nomes fictícios.
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
const roboto = loadRoboto("normal", { weights: ["400", "500", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;

export type FigInstagram = { tipo: "instagram"; from: number; durationInFrames: number; foto: string; seguir: number; curtida: number; comentario: number; compartilhar: number };

const Coracao: React.FC<{ cheio: boolean; tam?: number; cor?: string }> = ({ cheio, tam = 46, cor = "#FF3040" }) => (
  <svg width={tam} height={tam} viewBox="0 0 48 48">
    <path d="M24 41s-15-9.2-15-20.2C9 15 13 11 18 11c3 0 5 1.6 6 3.6C25 12.6 27 11 30 11c5 0 9 4 9 9.8C39 31.8 24 41 24 41z" fill={cheio ? cor : "none"} stroke={cheio ? cor : "#111"} strokeWidth="3.4" strokeLinejoin="round" />
  </svg>
);
const IcoComentario = () => (
  <svg width="46" height="46" viewBox="0 0 48 48"><path d="M41 23.5c0 9-7.6 16-17 16-2.7 0-5.2-.5-7.4-1.5L8 40l2.3-7.3C8.8 30 7 27 7 23.5c0-9 7.6-16 17-16s17 7 17 16z" fill="none" stroke="#111" strokeWidth="3.4" strokeLinejoin="round" /></svg>
);
const IcoEnviar: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width="46" height="46" viewBox="0 0 48 48" style={{ transform: `scale(${s})` }}><path d="M42 7L20 28M42 7L29 42l-9-14L6 19z" fill="none" stroke="#111" strokeWidth="3.4" strokeLinejoin="round" /></svg>
);
const IcoSalvar = () => (
  <svg width="46" height="46" viewBox="0 0 48 48"><path d="M12 7h24v34L24 30 12 41z" fill="none" stroke="#111" strokeWidth="3.4" strokeLinejoin="round" /></svg>
);
const Avatar: React.FC<{ letra: string; cor: string; tam?: number }> = ({ letra, cor, tam = 64 }) => (
  <div style={{ width: tam, height: tam, borderRadius: tam / 2, background: cor, color: "#fff", fontFamily: roboto, fontWeight: 700, fontSize: tam * 0.42, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{letra}</div>
);

export const Instagram: React.FC<{ f: FigInstagram }> = ({ f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const D = f.durationInFrames;
  const entra = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });
  const sai = interpolate(frame, [D - 7, D], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vis = Math.min(entra, sai);
  const pop = spring({ frame: frame - f.curtida, fps, config: { damping: 9, stiffness: 180 } });
  const somePop = interpolate(frame - f.curtida, [10, 18], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const curtiu = frame >= f.curtida;
  const n = Math.round(interpolate(frame, [f.curtida, f.curtida + 22], [37, 1248], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const comentario = "Esse conteúdo me ajudou demais, salvei";
  const letras = Math.floor(interpolate(frame, [f.comentario, f.comentario + 16], [0, comentario.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const envia = spring({ frame: frame - f.compartilhar, fps, config: { damping: 10, stiffness: 200 } });
  const toast = interpolate(frame - f.compartilhar, [4, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const notif = (k: number, nome: string, cor: string) => {
    const e = spring({ frame: frame - f.seguir - k * 7, fps, config: { damping: 15, stiffness: 170 } });
    return (
      <div key={k} style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(250,250,250,.95)", borderRadius: 28, padding: "16px 22px", width: 780, boxShadow: "0 10px 30px rgba(0,0,0,.25)",
        opacity: e, transform: `translateY(${(1 - e) * -40}px)`, marginBottom: 12 }}>
        <Avatar letra={nome[0].toUpperCase()} cor={cor} tam={54} />
        <div style={{ fontFamily: roboto, fontSize: 25, color: "#111", lineHeight: 1.25 }}>
          <div style={{ fontSize: 19, color: "#777", marginBottom: 2 }}>Instagram · agora</div>
          <b>{nome}</b> começou a seguir você.
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.38 * vis})` }} />
      <div style={{ position: "absolute", top: 252, left: 150, opacity: sai }}>
        {frame >= f.seguir ? notif(0, "ana.bezerra", "#C2185B") : null}
        {frame >= f.seguir + 7 ? notif(1, "joaovitor.m", "#3949AB") : null}
      </div>
      <div style={{ position: "absolute", left: 150, top: 470, width: 780, background: "#fff", borderRadius: 26, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.35)",
        opacity: vis, transform: `translateY(${(1 - entra) * 60}px) scale(${0.94 + 0.06 * entra})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px" }}>
          <div style={{ width: 58, height: 58, borderRadius: 29, background: "#FAF6F3", border: "2px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Img src={staticFile("marca/logo-2.0.svg")} style={{ height: 44 }} />
          </div>
          <div style={{ fontFamily: roboto, fontWeight: 700, fontSize: 26, color: "#111" }}>tk.filmes</div>
          <div style={{ marginLeft: "auto", fontFamily: roboto, fontWeight: 700, fontSize: 30, color: "#111", letterSpacing: 2 }}>···</div>
        </div>
        <div style={{ position: "relative", width: 780, height: 560, overflow: "hidden" }}>
          <Img src={staticFile(f.foto)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {curtiu ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: somePop, transform: `scale(${0.4 + 0.8 * pop})`, filter: "drop-shadow(0 6px 18px rgba(0,0,0,.35))" }}>
              <Coracao cheio tam={200} cor="#fff" />
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "16px 22px 6px" }}>
          <div style={{ transform: `scale(${curtiu ? 0.8 + 0.2 * pop : 1})` }}><Coracao cheio={curtiu} /></div>
          <IcoComentario />
          <IcoEnviar s={frame >= f.compartilhar ? 0.85 + 0.15 * envia : 1} />
          <div style={{ marginLeft: "auto" }}><IcoSalvar /></div>
        </div>
        <div style={{ fontFamily: roboto, fontSize: 25, color: "#111", padding: "6px 24px" }}>Curtido por <b>ana.bezerra</b> e outras <b>{n.toLocaleString("pt-BR")}</b> pessoas</div>
        <div style={{ fontFamily: roboto, fontSize: 25, color: "#111", padding: "4px 24px 22px", minHeight: 40, opacity: frame >= f.comentario ? 1 : 0 }}>
          <b>joaovitor.m</b> {comentario.slice(0, letras)}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 94 + 560 - 86, display: "flex", justifyContent: "center", opacity: toast }}>
          <div style={{ background: "rgba(38,38,38,.92)", color: "#fff", fontFamily: roboto, fontWeight: 500, fontSize: 24, borderRadius: 14, padding: "14px 26px" }}>Enviado</div>
        </div>
      </div>
      <Sequence from={f.curtida} durationInFrames={14}><Audio src={staticFile("sfx/positivo.wav")} volume={0.3} /></Sequence>
      <Sequence from={f.compartilhar} durationInFrames={14}><Audio src={staticFile("sfx/check.wav")} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};
