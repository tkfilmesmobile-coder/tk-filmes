# 2ª tentativa das cenas do implante que saíram erradas (i1, i3, i4), duas sementes cada.
Set-Location $PSScriptRoot
$py = "$env:LOCALAPPDATA\Programs\Python312\python.exe"
$base = "Same hyperrealistic medical 3D style: glossy moist pink gingiva, ivory cortical bone, porous spongy bone, brushed titanium, natural white porcelain. Octane render."
$cenas = [ordered]@{
  'i1b_partes'  = "Exploded view of a dental implant system, three separate objects stacked vertically with clear gaps between them and nothing else: at the bottom a long threaded titanium screw (the implant), in the middle a small smooth titanium abutment connector, at the top a single white porcelain molar crown. No gum, no bone, no other teeth. Product photography. $base"
  'i3b_retalho' = "Close-up 3D cross-section block of a lower jaw at a missing-tooth gap: the pink gum has been surgically cut along the top and the two sides of gum tissue are peeled open outward like two open flaps, leaving the bare cream-colored jawbone crest exposed in the middle. Educational dental surgery illustration, clean, no blood, no tools. $base"
  'i4b_alveolo' = "Close-up 3D cross-section block of jawbone with pink gum on top: in the center an empty cone-shaped tooth socket hole goes down into the bone, open at the top, completely empty, no tooth, no crown, no implant inside. Educational dental illustration, clean, no blood. $base"
}
foreach ($k in $cenas.Keys) {
  foreach ($s in 7, 31) {
    $n = "${k}_$s"
    if (Test-Path "entradas\$n.png") { continue }
    & $py scripts\gerar_imagem.py --name $n --seed $s --prompt $cenas[$k] 2>&1 | Select-Object -Last 1
    if (Test-Path "entradas\$n.webp") { & $py -c "from PIL import Image; Image.open(r'entradas\$n.webp').convert('RGB').save(r'entradas\$n.png')" }
  }
}
& $py -c "from PIL import Image; import glob,os; fs=sorted(glob.glob('entradas/i[134]b_*.png')); ims=[Image.open(f).resize((300,525)) for f in fs]; g=Image.new('RGB',(310*len(ims),545),'white'); [g.paste(im,(i*310,20)) for i,im in enumerate(ims)]; g.save('entradas/_implante_cenas2.jpg',quality=88); print([os.path.basename(f) for f in fs])"
