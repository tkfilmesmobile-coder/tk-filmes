# Vigia o Drive da Ary até o envio dos vídeos da diária terminar.
# Termina quando aparece vídeo novo e o Drive fica 8 minutos sem nada novo (envio do celular acabou),
# ou depois de 4 horas. Imprime a lista dos arquivos novos.
param([int]$quietoMin = 8, [int]$maxHoras = 4)
$raiz = "H:\Meu Drive\Ary Magalhães"
$conhecidos = @{}
Get-ChildItem $raiz -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object { $conhecidos[$_.FullName] = $true }
$inicio = Get-Date; $ultimoNovo = $null; $novos = @{}
while (((Get-Date) - $inicio).TotalHours -lt $maxHoras) {
  Start-Sleep 60
  Get-ChildItem $raiz -Recurse -File -ErrorAction SilentlyContinue | Where-Object { -not $conhecidos.ContainsKey($_.FullName) } | ForEach-Object {
    $chave = $_.FullName
    if (-not $novos.ContainsKey($chave) -or $novos[$chave] -ne $_.Length) { $novos[$chave] = $_.Length; $ultimoNovo = Get-Date }
  }
  $temVideo = @($novos.Keys | Where-Object { $_ -match '\.(mov|mp4)$' }).Count -gt 0
  if ($temVideo -and $ultimoNovo -and ((Get-Date) - $ultimoNovo).TotalMinutes -ge $quietoMin) { break }
}
"novos: $($novos.Count) (vigiou $([int]((Get-Date) - $inicio).TotalMinutes) min)"
$novos.Keys | Sort-Object | ForEach-Object { "{0}  {1:N1} MB" -f $_, ($novos[$_] / 1MB) }
