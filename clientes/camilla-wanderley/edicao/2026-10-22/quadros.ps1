# Tira quadros de teste de uma composição e junta numa folha. Uso: quadros.ps1 <id> <seg1,seg2,...> <saida.jpg>
param([string]$id, [string]$segs, [string]$saida)
$env:Path = "$env:LOCALAPPDATA\Programs\node;$env:Path"
Set-Location (Join-Path $PSScriptRoot '..\perfil-video')
$tmp = Join-Path $env:TEMP "quadros-$id"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Force $tmp | Out-Null
$lista = $segs -split ','
foreach ($s in $lista) {
  $fr = [int]([double]::Parse($s, [Globalization.CultureInfo]::InvariantCulture) * 30)
  & npx.cmd remotion still $id "$tmp\$('{0:D5}' -f $fr).jpg" --frame=$fr --log=error 2>&1 | Out-Null
}
& "$env:LOCALAPPDATA\Programs\Python312\python.exe" -c "import sys,glob,os; from PIL import Image, ImageDraw; fs=sorted(glob.glob(os.path.join(sys.argv[1],'*.jpg'))); W,H=360,640; col=min(5,len(fs)); g=Image.new('RGB',(col*W,((len(fs)+col-1)//col)*(H+22)),'white')
for i,p in enumerate(fs):
  im=Image.open(p).resize((W,H)); x=(i%col)*W; y=(i//col)*(H+22); g.paste(im,(x,y+22)); ImageDraw.Draw(g).text((x+4,y+5),'%.1fs' % (int(os.path.basename(p)[:5])/30),fill='black')
g.save(sys.argv[2],quality=88)" $tmp $saida
