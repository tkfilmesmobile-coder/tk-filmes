# v3 do vídeo oficial do Natal: câmeras lentas (em paralelo) -> render vertical e horizontal -> acabamento (brilho + grão)
Set-Location (Split-Path $PSScriptRoot -Parent)
$py = "C:\Users\kumyt\tools\python312\python.exe"
$lentos = @(
  @("public/g-IMG_7303.mp4", "public/lento-B2.mp4", "8.0", "86", "0.6"),
  @("public/g-IMG_7304.mp4", "public/lento-C2.mp4", "13.23", "116", "0.6"),
  @("public/g-IMG_7304.mp4", "public/lento-D.mp4", "7.53", "128", "0.75"),
  @("public/g-fachada-inteira.mp4", "public/lento-G2.mp4", "2.23", "104", "0.7"),
  @("public/g-IMG_7302.mp4", "public/lento-H2.mp4", "3.83", "116", "0.6"),
  @("public/g-fachada-inteira.mp4", "public/lento-I.mp4", "7.4", "120", "0.6")
)
$procs = foreach ($l in $lentos) { Start-Process -FilePath $py -ArgumentList (@("scripts/lento.py") + $l) -NoNewWindow -PassThru }
$procs | Wait-Process
foreach ($l in $lentos) { "{0}: {1}" -f $l[1], $(if (Test-Path $l[1]) { "ok" } else { "FALTOU" }) }
$env:Path = "C:\Users\kumyt\AppData\Local\Programs\node;" + $env:Path
$c = "--browser-executable=C:\Program Files\Google\Chrome\Application\chrome.exe"
& npx.cmd remotion render src/index.ts NatalHorizontal out/v3-horizontal-bruto.mp4 --codec=h264 --crf=15 --log=error $c
"render horizontal: $LASTEXITCODE"
& npx.cmd remotion render src/index.ts Natal out/v3-vertical-bruto.mp4 --codec=h264 --crf=15 --log=error $c
"render vertical: $LASTEXITCODE"
& $py scripts/acabamento.py out/v3-horizontal-bruto.mp4 out/natal-oficial-horizontal.mp4
& $py scripts/acabamento.py out/v3-vertical-bruto.mp4 out/natal-oficial.mp4
"fim"
