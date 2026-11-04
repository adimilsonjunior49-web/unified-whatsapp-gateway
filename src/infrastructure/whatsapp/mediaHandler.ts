import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { ENV } from '../../config/env';

export class MediaHandler {
  /**
   * Converte qualquer áudio para Opus/OGG mono 16kHz (Formato de áudio de voz oficial do WhatsApp PTT)
   */
  static async convertToWhatsAppVoice(inputPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(ENV.FFMPEG_PATH, [
        '-y',
        '-loglevel', 'error',
        '-i', inputPath,
        '-c:a', 'libopus',
        '-b:a', '32k',
        '-vbr', 'on',
        '-compression_level', '10',
        '-ar', '16000',
        '-ac', '1',
        outputPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
          resolve(outputPath);
        } else {
          reject(new Error(`Falha no FFmpeg ao converter áudio para voz do WhatsApp (Código de saída: ${code})`));
        }
      });

      ffmpeg.on('error', (err) => {
        reject(err);
      });
    });
  }
}
