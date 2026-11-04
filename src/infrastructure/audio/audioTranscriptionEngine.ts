import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { WaveFile } from 'wavefile';

const execAsync = promisify(exec);

export class AudioTranscriptionEngine {
  private static instance: AudioTranscriptionEngine;
  private transcriber: any = null;
  private isInitializing: boolean = false;
  private ffmpegPath: string;

  private constructor() {
    this.ffmpegPath = 'C:\\Users\\Home\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe';
    if (!fs.existsSync(this.ffmpegPath)) {
      this.ffmpegPath = 'ffmpeg';
    }
  }

  public static getInstance(): AudioTranscriptionEngine {
    if (!AudioTranscriptionEngine.instance) {
      AudioTranscriptionEngine.instance = new AudioTranscriptionEngine();
    }
    return AudioTranscriptionEngine.instance;
  }

  private async getTranscriber(): Promise<any> {
    if (this.transcriber) return this.transcriber;
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise(r => setTimeout(r, 200));
      }
      return this.transcriber;
    }

    this.isInitializing = true;
    try {
      const { pipeline } = await import('@xenova/transformers');
      this.transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
        quantized: true
      });
    } finally {
      this.isInitializing = false;
    }
    return this.transcriber;
  }

  /**
   * Transcreve arquivo de áudio ou buffer com Whisper na íntegra em Português
   */
  public async transcribe(audioInput: Buffer | string): Promise<string> {
    const tempDir = path.resolve(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempId = `transcribe_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const inputPath = typeof audioInput === 'string' ? audioInput : path.join(tempDir, `${tempId}.ogg`);
    const wavPath = path.join(tempDir, `${tempId}.wav`);

    try {
      if (typeof audioInput !== 'string') {
        fs.writeFileSync(inputPath, audioInput);
      }

      // Converte áudio para WAV 16kHz mono (formato padrão de entrada do Whisper)
      await execAsync(`"${this.ffmpegPath}" -y -i "${inputPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}"`);

      if (!fs.existsSync(wavPath)) {
        throw new Error('Falha na conversão de áudio pelo FFmpeg');
      }

      // Lê o WAV e extrai os dados em Float32Array 16kHz
      const wavBuffer = fs.readFileSync(wavPath);
      const wav = new WaveFile(wavBuffer);
      wav.toBitDepth('32f');
      wav.toSampleRate(16000);
      let audioData: any = wav.getSamples();
      if (Array.isArray(audioData)) {
        if (audioData.length > 1) {
          const sc = audioData[0].length;
          const merged = new Float32Array(sc);
          for (let i = 0; i < sc; ++i) {
            merged[i] = 0.5 * (audioData[0][i] + audioData[1][i]);
          }
          audioData = merged;
        } else {
          audioData = audioData[0];
        }
      }

      const transcriber = await this.getTranscriber();
      const output = await transcriber(audioData, {
        language: 'portuguese',
        task: 'transcribe'
      });

      const resultText = (output?.text || '').trim();
      return resultText;
    } catch (err: any) {
      console.error('[Whisper Error]', err.message);
      return '';
    } finally {
      // Limpeza de arquivos temporários
      try {
        if (typeof audioInput !== 'string' && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
      } catch (_) {}
    }
  }
}

export const audioTranscriptionEngine = AudioTranscriptionEngine.getInstance();
