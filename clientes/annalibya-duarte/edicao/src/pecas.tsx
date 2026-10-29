import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, FPS, NOME_COMPLETO, clamp, entrada, sans, serif, sombra, suave } from "./estilo";

// Peças da 2ª versão (pedido da Talyta, 2026-10-29).
const s = (seg: number) => Math.round(seg * FPS);

// ── Cartão estilo perfil do Instagram com um toque no link da bio ("Clica no link da bio")
// Mostra só o que é dela e confirmado: foto, nome, profissão, cidade. Sem @ (o perfil ainda não existe)
// e sem endereço de link inventado: o link aparece como "Agende seu horário".
// `toque`: quadro (relativo à Sequence) em que o dedo toca o link, junto com a palavra "link".
export const CartaoInstagram: React.FC<{ dur: number; toque: number }> = ({ dur, toque }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 18, stiffness: 140 } });
  const sai = interpolate(frame, [dur - 8, dur], [1, 0], clamp);
  // dedo: aparece, vai até o link, aperta e solta
  const chega = toque - 4;
  const dedoOp = interpolate(frame, [chega - 12, chega - 6, toque + 14, toque + 20], [0, 1, 1, 0], clamp);
  const dedoX = interpolate(frame, [chega - 12, chega], [560, 300], { ...clamp, easing: suave });
  const dedoY = interpolate(frame, [chega - 12, chega], [330, 222], { ...clamp, easing: suave });
  const aperta = interpolate(frame, [toque - 2, toque, toque + 4], [1, 0.78, 1], clamp);
  const onda = interpolate(frame, [toque, toque + 14], [0, 1], clamp);
  const realce = interpolate(frame, [toque, toque + 3, toque + 26], [0, 1, 0.35], clamp);
  const pulo = 1 + 0.025 * Math.sin(interpolate(frame, [toque, toque + 8], [0, Math.PI], clamp));

  return (
    <div
      style={{
        position: "absolute",
        left: 100,
        top: 1100,
        width: 780,
        opacity: sai * entra,
        translate: `0px ${interpolate(entra, [0, 1], [60, 0])}px`,
        scale: String(interpolate(entra, [0, 1], [0.94, 1]) * pulo),
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 38,
          padding: "34px 36px 30px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)",
          fontFamily: sans,
          color: "#000",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* anel em degradê, como o de stories */}
          <div
            style={{
              width: 136,
              height: 136,
              borderRadius: "50%",
              padding: 5,
              background: "conic-gradient(from 200deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75)",
              flexShrink: 0,
            }}
          >
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", padding: 4, backgroundColor: "#fff" }}>
              <Img src={staticFile("marca/avatar.jpg")} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
            </div>
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontWeight: 600, fontSize: 31 }}>Dra. {NOME_COMPLETO}</div>
            <div style={{ fontSize: 23, color: "#737373", marginTop: 2 }}>Dentista</div>
            <div style={{ fontSize: 23, marginTop: 6 }}>Cirurgiã-dentista · União dos Palmares/AL</div>
          </div>
        </div>
        {/* link da bio */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 26,
            padding: "10px 14px",
            marginLeft: -14,
            borderRadius: 14,
            backgroundColor: `rgba(0,55,107,${0.09 * realce})`,
            width: "fit-content",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00376B" strokeWidth="2.2" strokeLinecap="round">
            <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
          </svg>
          <div style={{ fontWeight: 600, fontSize: 28, color: "#00376B" }}>Agende seu horário</div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
          <div style={{ flex: 1, textAlign: "center", backgroundColor: "#0095F6", color: "#fff", fontWeight: 600, fontSize: 25, borderRadius: 14, padding: "15px 0" }}>
            Seguir
          </div>
          <div style={{ flex: 1, textAlign: "center", backgroundColor: "#EFEFEF", fontWeight: 600, fontSize: 25, borderRadius: 14, padding: "15px 0" }}>
            Mensagem
          </div>
        </div>
      </div>
      {/* toque do dedo no link */}
      <div style={{ position: "absolute", left: dedoX - 40, top: dedoY - 40, width: 80, height: 80, opacity: dedoOp }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid rgba(0,149,246,0.8)",
            scale: String(1 + onda * 1.4),
            opacity: onda > 0 ? 1 - onda : 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            backgroundColor: "rgba(40,40,40,0.38)",
            border: "4px solid rgba(255,255,255,0.95)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
            scale: String(aperta),
          }}
        />
      </div>
    </div>
  );
};

// ── Headline dos tratamentos (vídeo 1). Tempos relativos à Sequence, que começa em 16,45 s do vídeo:
// "o seu tratamento completo, tudo em um só lugar. Tratamentos como restauração, limpeza, clareamento,
// prótese e muito mais, tudo aqui." Cada tratamento entra quando ela fala.
const T = {
  tratamento: s(16.76 - 16.45),
  completo: s(17.24 - 16.45),
  lugar: s(17.86 - 16.45),
  troca: s(19.0 - 16.45),
  lista: [s(19.78 - 16.45), s(20.92 - 16.45), s(22.04 - 16.45), s(23.3 - 16.45)],
  mais: s(24.16 - 16.45),
  tudo: s(25.5 - 16.45),
};
const TRATAMENTOS = ["Restauração", "Limpeza", "Clareamento", "Prótese"];

export const HeadlineTratamentos: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const fundo = interpolate(frame, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp);
  const fase1 = interpolate(frame, [T.troca - 8, T.troca], [1, 0], clamp);
  const fase2 = interpolate(frame, [dur - 10, dur], [1, 0], clamp);
  const fio = interpolate(frame, [T.troca, T.troca + 18], [0, 120], { ...clamp, easing: suave });
  // o último tratamento falado fica aceso; os anteriores baixam um pouco, até "tudo aqui" acender todos
  const atual = T.lista.reduce((acc, t, i) => (frame >= t ? i : acc), -1);
  return (
    <AbsoluteFill>
      {/* sombra mais forte no pé do quadro, só enquanto a headline está na tela */}
      <AbsoluteFill
        style={{
          opacity: fundo,
          background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.38) 62%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      {/* fase 1: tratamento completo, tudo em um só lugar */}
      <div style={{ position: "absolute", left: 90, top: 1090, opacity: fase1 }}>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 150, lineHeight: 0.95, color: COR.branco, textShadow: sombra }}>
          <div style={entrada(frame, T.tratamento, 12)}>Tratamento</div>
          <div style={{ ...entrada(frame, T.completo, 12), color: COR.champanhe }}>completo</div>
        </div>
        <div
          style={{
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: COR.branco,
            marginTop: 30,
            textShadow: sombra,
            ...entrada(frame, T.lugar),
          }}
        >
          Tudo em um só lugar
        </div>
      </div>
      {/* fase 2: a lista, um por um */}
      {frame >= T.troca - 2 ? (
        <div style={{ position: "absolute", left: 90, top: 990, opacity: fase2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: fio, height: 2, backgroundColor: COR.champanhe }} />
            <div
              style={{
                fontFamily: sans,
                fontWeight: 500,
                fontSize: 26,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: COR.branco,
                textShadow: sombra,
                ...entrada(frame, T.troca),
              }}
            >
              Tratamentos
            </div>
          </div>
          {TRATAMENTOS.map((t, i) => {
            const aceso = frame >= T.tudo || i === atual ? 1 : 0.5;
            return (
              <div key={t} style={{ display: "flex", alignItems: "baseline", gap: 22, marginTop: i === 0 ? 26 : 4, ...entrada(frame, T.lista[i], 10) }}>
                <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 24, color: COR.champanhe, width: 40, textShadow: sombra }}>
                  0{i + 1}
                </div>
                <div
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: 96,
                    lineHeight: 1.02,
                    color: COR.branco,
                    textShadow: sombra,
                    opacity: interpolate(aceso, [0.5, 1], [0.5, 1]),
                  }}
                >
                  {t}
                </div>
              </div>
            );
          })}
          <div
            style={{
              fontFamily: sans,
              fontWeight: 500,
              fontSize: 26,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: COR.champanhe,
              marginTop: 18,
              marginLeft: 62,
              textShadow: sombra,
              ...entrada(frame, T.mais),
            }}
          >
            e muito mais
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── Clarão branco curto na passagem da abertura (luz acesa) pra fala
export const Clarao: React.FC<{ meio: number }> = ({ meio }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [meio - 4, meio, meio + 7], [0, 0.85, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: COR.marfim, opacity: op }} />;
};
