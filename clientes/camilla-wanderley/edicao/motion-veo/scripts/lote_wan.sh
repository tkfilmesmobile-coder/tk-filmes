#!/bin/bash
# Lote das animações do "Sensibilidade x Canal" no Wan 2.2 (Hugging Face, gratuito). Uma por vez.
cd "$(dirname "$0")/.."
PY=.venv/Scripts/python.exe
export PYTHONIOENCODING=utf-8
gera() { # nome space dur img fim prompt
  [ -s "saidas/$1.mp4" ] && { echo "$1: já existe"; return; }
  if [ -n "$5" ]; then $PY scripts/gerar_wan.py --space "$2" --dur "$3" --image "entradas/$4_verde.png" --end-image "entradas/$5_verde.png" --name "$1" --prompt "$6" 2>&1 | grep -v -i "warn\|loaded as" | tail -2
  else $PY scripts/gerar_wan.py --space "$2" --dur "$3" --image "entradas/$4_verde.png" --name "$1" --prompt "$6" 2>&1 | grep -v -i "warn\|loaded as" | tail -2; fi
}
gera m2_wan rapido 3.5 02_molar_corte_anatomico "" "Cross-section of a molar showing enamel, dentin and pulp. Thin wisps of cold white mist, like icy breath in the air, drift in from the right side and softly touch the enamel surface, leaving a faint frost sheen. The mist is airy, translucent and weightless: no liquid, no tube, no nozzle, no instrument. Almost no camera movement."
gera m3_wan flf 4.5 02_molar_corte_anatomico 02_molar_corte_anatomico "Cross-section of a molar. A brief sharp pink-red pain pulse lights up inside the pulp and radiates once through the nerve canals, then fades out completely as a thin stream of cold air moves away to the right. The tooth ends calm, exactly like the start."
gera m4_wan flf 3.5 02_molar_corte_anatomico 03_molar_polpa_inflamada "Cross-section of a molar. The pulp gradually becomes inflamed: a controlled red glow spreads through the pulp chamber and nerve canals and stays lit, slowly throbbing. The inflammation persists."
gera m5_wan rapido 3.5 03_molar_polpa_inflamada "" "Inflamed molar cross-section. A soft spiral of warm orange-pink thermal energy, not fire and no flames, curls in from the right side and approaches the tooth; the red glow inside intensifies slightly."
gera m6_wan flf 4.5 03_molar_polpa_inflamada 04_molar_efeito_refrescante "Inflamed molar cross-section. A gentle cool lilac-white air swirl wraps around the crown and the red glow inside the pulp slowly dims to a softer level. Calm, reassuring, clinical."
gera m7_wan rapido 3.5 07_dente_anatomia_com_lupa "" "A magnifying glass glides slowly across a molar cross-section, revealing the pulp and nerve canals in sharper detail. Subtle glass reflections, very slow and precise."
gera m8_wan rapido 3.5 06_instrumentos_odontologicos "" "A dental mirror and a dental probe float side by side and rotate a few degrees on their vertical axis; a soft specular highlight travels along the polished steel. Minimal and elegant."
gera m9_wan rapido 3.5 01_molar_realista "" "A realistic molar tooth slowly rotates a few degrees on its vertical axis under soft studio light, a gentle specular highlight glides over the enamel. Calm, minimal, premium."
echo FIM
