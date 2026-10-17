# Plano de motions · "Sensibilidade x Canal" · Dra. Camilla Wanderley

Gerados no Veo 3.1 (kit `motion-veo`) a partir dos PNGs aprovados, sobre chroma verde, depois
recortados com `scripts/recortar_chroma.py` → WebM VP9 com alfa → edição no Remotion
(`edicao/remotion/public/motion/`). Pipeline testado em 2026-09-30 (simulação: recorte limpo e
transparência funcionando sobre o vídeo).

Fluxo por motion: prévia (`--mode preview`, Veo Fast) → aprovação → final (`--mode final`).
Entradas prontas em `entradas/*_verde.png` (1080×1920, objeto centralizado).

| # | trecho da fala (tempo no corte) | 1º quadro → último | dur. | prompt (cena) |
|---|---|---|---|---|
| M1 | "consumir algo gelado" (1,3–2,5 s) | 01 → — | 4 s | A realistic molar tooth slowly turns a few degrees on its Y axis under soft studio light. Midway, a translucent swirl of cold white-lilac air curves in from the upper right and wraps gently around the crown, leaving a faint frost sheen on the enamel. Calm, precise, premium. |
| M2 | "a sensibilidade acontece… algo gelado" (8,4–11,5 s) | 02 → — | 6 s | Cross-section of a molar showing enamel, dentin and pulp. A soft stream of cold pearl-white air flows in from the right side and touches the enamel surface. Almost no camera movement, very subtle parallax. |
| M3 | "aquela dor mais aguda… à medida que você tira, ela já para" (11,5–15,9 s) | 02 → 02 | 6 s | Cross-section of a molar. A brief sharp pink-red pain pulse lights up inside the pulp, radiating once through the nerve canals. Then the cold air stream pulls away to the right and the pulse fades out completely, leaving the tooth calm. Start and end identical. |
| M4 | "já a dor que pode indicar um canal" (16,6–19,9 s) | 02 → 03 | 6 s | Cross-section of a molar. The pulp gradually becomes inflamed: a controlled red glow spreads through the pulp chamber and nerve canals and stays lit, slowly throbbing. The inflammation persists until the end. |
| M5 | "dor ao consumir algo quente" (24,0–26,4 s) | 03 → — | 4 s | Inflamed molar cross-section. A soft spiral of warm orange-pink thermal energy (not fire, no flames) curls in from the right and approaches the tooth; the red glow inside intensifies slightly. |
| M6 | "às vezes até o gelado pode ajudar a diminuir" (26,9–31,3 s) | 03 → 04 | 6 s | Inflamed molar cross-section. A gentle cool lilac-white air swirl wraps around the crown and the red glow inside the pulp slowly dims to a softer level. Calm, reassuring, clinical. |
| M7 | "a diferenciação do diagnóstico" (34,0–35,4 s) | 07 → — | 4 s | A magnifying glass glides slowly across a molar cross-section, revealing the pulp and nerve canals in sharper detail. Subtle glass reflections, very slow and precise. |
| M8 | "avaliado com um dentista" (37,2–38,4 s) | 06 → — | 4 s | A dental mirror and a dental probe float side by side and rotate a few degrees on the Y axis; a soft specular highlight travels along the polished steel. Minimal, elegant. |

Fora do Veo (continuam como na edição aprovada): 05 (rosto, insert rápido), 08 (pulso: substituído
pelo M3/M4), 09 e 10 (entram dentro de M1/M2/M5/M6).

Comandos (depois do `.env` configurado):
```
python scripts/generate_motion.py --mode preview --duration 4 --name m1 --image entradas/01_molar_realista_verde.png --prompt "<M1>"
python scripts/generate_motion.py --mode preview --duration 6 --name m4 --image entradas/02_molar_corte_anatomico_verde.png --last-image entradas/03_molar_polpa_inflamada_verde.png --prompt "<M4>"
python scripts/recortar_chroma.py saidas/m1.mp4 saidas/m1_alfa.webm --previa saidas/m1_previa.png
```
