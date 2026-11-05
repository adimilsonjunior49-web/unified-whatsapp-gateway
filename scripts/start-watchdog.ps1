# Watchdog Daemon Resiliente - Atlas Loggi Gateway
$ProjectDir = "C:\Users\Home\.gemini\antigravity\scratch\unified-whatsapp-gateway"
Set-Location -Path $ProjectDir

Write-Host "🛡️ [WATCHDOG] Iniciando monitoramento resiliente 24/7 do Atlas Loggi Gateway..." -ForegroundColor Cyan

while ($true) {
    try {
        Write-Host "🚀 [WATCHDOG] Subindo processo Node.js na porta 8080..." -ForegroundColor Green
        $proc = Start-Process -FilePath "node" -ArgumentList "dist/index.js" -WorkingDirectory $ProjectDir -PassThru -Wait
        Write-Host "⚠️ [WATCHDOG] Processo encerrou com código: $($proc.ExitCode). Reiniciando em 3 segundos..." -ForegroundColor Yellow
    } catch {
        Write-Host "❌ [WATCHDOG] Erro ao iniciar processo: $_" -ForegroundColor Red
    }
    Start-Sleep -Seconds 3
}
