# Imagens de partida das cenas do implante (diária 2026-10-22). Mesmo estilo da amostra aprovada (implante_real_11).
Set-Location $PSScriptRoot
$py = "$env:LOCALAPPDATA\Programs\Python312\python.exe"
$base = "Hyperrealistic medical visualization in the same style: glossy moist pink gingiva with subtle subsurface scattering, ivory cortical bone, porous trabecular spongy bone with organic texture, brushed titanium, translucent natural porcelain. Octane render, specular highlights."
$cenas = [ordered]@{
  'i1_partes'   = "Three dental implant components floating vertically aligned with clear empty space between them: at the bottom a threaded titanium implant screw, in the middle a titanium abutment, on top a natural white porcelain crown. Exploded view, product shot. $base"
  'i2_furinho'  = "Anatomical cross-section of a human jaw segment with a missing tooth: intact healthy pink gum over the bone, and a threaded titanium dental implant being screwed in through a tiny round opening in the gum, without any incision or open flap, half of the implant already inside the bone. $base"
  'i3_retalho'  = "Anatomical cross-section of a human jaw segment showing the old open surgery: the pink gum tissue is cut and folded back to both sides like open flaps, exposing the bare jawbone crest underneath, ready for drilling. Clinical, clean, no blood. $base"
  'i4_alveolo'  = "Anatomical cross-section of a human jaw segment right after a tooth extraction: an empty fresh tooth socket, a cone-shaped hole in the jawbone where the root used to be, surrounded by pink gum, the neighboring molar intact beside it. Clinical, clean, no blood. $base"
}
foreach ($k in $cenas.Keys) {
  if (Test-Path "entradas\$k.png") { continue }
  & $py scripts\gerar_imagem.py --name $k --seed 11 --prompt $cenas[$k] 2>&1 | Select-Object -Last 1
  & $py -c "from PIL import Image; Image.open(r'entradas\$k.webp').convert('RGB').save(r'entradas\$k.png')"
}
& $py -c "from PIL import Image; import glob; fs=[f'entradas/{k}.png' for k in ['i1_partes','i2_furinho','i3_retalho','i4_alveolo']]; ims=[Image.open(f).resize((384,672)) for f in fs]; g=Image.new('RGB',(384*4+30,672),'white'); [g.paste(im,(i*394,0)) for i,im in enumerate(ims)]; g.save('entradas/_implante_cenas.jpg',quality=88)"
