' Abre o sincronizar-tudo.ps1 sem mostrar janela (o Agendador chama este a cada 15 min).
Dim pasta, cmd
pasta = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & pasta & "\sincronizar-tudo.ps1"""
CreateObject("WScript.Shell").Run cmd, 0, True
