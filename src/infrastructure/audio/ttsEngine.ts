import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { baileysEngine } from '../whatsapp/baileysEngine';

const execAsync = promisify(exec);

export class TtsEngine {
  private static instance: TtsEngine;
  private audioDir: string;

  private constructor() {
    this.audioDir = path.resolve(process.cwd(), 'storage', 'audio');
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  public static getInstance(): TtsEngine {
    if (!TtsEngine.instance) {
      TtsEngine.instance = new TtsEngine();
    }
    return TtsEngine.instance;
  }

  /**
   * Converte texto em nota de voz PTT em formato Opus (.ogg) nativo do WhatsApp
   */
  public async synthesizeVoicePtt(text: string): Promise<string> {
    const timestamp = Date.now();
    const wavPath = path.join(this.audioDir, `tts_${timestamp}.wav`);
    const oggPath = path.join(this.audioDir, `tts_${timestamp}.ogg`);

    // Escapa aspas simples e caracteres especiais no texto para o PowerShell
    const sanitizedText = text.replace(/'/g, "''").replace(/[\r\n]+/g, ' ');

    const psCommand = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SetOutputToWaveFile('${wavPath.replace(/\\/g, '/')}'); $s.Speak('${sanitizedText}'); $s.Dispose(); ffmpeg -y -i '${wavPath.replace(/\\/g, '/')}' -c:a libopus -b:a 32k -vbr on '${oggPath.replace(/\\/g, '/')}'`;

    try {
      await execAsync(`powershell -NoProfile -NonInteractive -Command "${psCommand}"`);

      // Remove o WAV intermediário para economizar espaço
      if (fs.existsSync(wavPath)) {
        try { fs.unlinkSync(wavPath); } catch (_) {}
      }

      if (fs.existsSync(oggPath)) {
        return oggPath;
      }
      throw new Error('Falha ao gerar arquivo de áudio Opus.');
    } catch (err: any) {
      throw new Error(`Erro na síntese de voz: ${err.message}`);
    }
  }

  /**
   * Sintetiza o texto e despacha diretamente como áudio de voz PTT no WhatsApp
   */
  public async sendVoiceMessage(sessionId: string, to: string, text: string): Promise<any> {
    const oggPath = await this.synthesizeVoicePtt(text);
    const audioBuffer = fs.readFileSync(oggPath);
    const base64Audio = `data:audio/ogg;base64,${audioBuffer.toString('base64')}`;

    return await baileysEngine.sendMessage(sessionId, {
      to,
      audioBase64: base64Audio,
      mediaType: 'voice',
      text
    });
  }
}

export const ttsEngine = TtsEngine.getInstance();
