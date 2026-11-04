const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// 1. Gera áudio falado via SAPI em português
const testWav = path.join(__dirname, 'fala_teste.wav');
const psCommand = `Add-Type -AssemblyName System.Speech; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; $synth.SetOutputToWaveFile('${testWav.replace(/\\/g, '\\\\')}'); $synth.Speak('Olá Adimilson, carga da Loggi descarregada com sucesso.'); $synth.Dispose()`;

try {
  execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
  console.log('Audio de teste gerado com sucesso:', fs.existsSync(testWav));
} catch (e) {
  console.error('Falha ao gerar áudio:', e.message);
}

// 2. Transcreve com Whisper
async function run() {
  const { audioTranscriptionEngine } = require('../dist/infrastructure/audio/audioTranscriptionEngine.js');
  console.log('Iniciando transcrição com Whisper...');
  const text = await audioTranscriptionEngine.transcribe(testWav);
  console.log('--- RESULTADO DA TRANSCRIÇÃO ---');
  console.log('Texto Transcrito:', text);
  try { fs.unlinkSync(testWav); } catch (_) {}
}

// Compila primeiro
execSync('npm run build', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
run().catch(console.error);
