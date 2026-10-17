import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Story em vídeo (2026-10-10): trecho dela estudando à noite, grade suave, trilha e o texto
// "Sumi, mas continuo por aqui: produzindo e aprimorando." Entra com fade, sai com fade.
export const StorySumi: React.FC<{ inicio: number }> = ({ inicio }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, fps * 0.8], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - fps, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const texto = interpolate(frame, [fps * 1.2, fps * 2.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vol = Math.min(fadeIn, fadeOut) * 0.55;
  return (
    <AbsoluteFill style={{ background: "#0d0b09" }}>
      <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
        <OffthreadVideo src={staticFile("story-sumi/bruto.mov")} startFrom={Math.round(inicio * fps)} muted
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.7) contrast(.95) brightness(1.05)" }} />
        <AbsoluteFill style={{ background: "rgba(40,34,28,.16)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 68%, rgba(30,25,20,.5), rgba(30,25,20,0) 60%)" }} />
        <Img src={staticFile("story-sumi/texto.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: texto, transform: `translateY(${(1 - texto) * 12}px)` }} />
      </AbsoluteFill>
      <Audio src={staticFile("story-sumi/trilha.wav")} volume={vol} />
    </AbsoluteFill>
  );
};
