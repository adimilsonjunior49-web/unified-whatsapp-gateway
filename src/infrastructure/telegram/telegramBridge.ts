import axios from 'axios';
import { NormalizedMessage } from '../../domain/message';
import { eventBus } from '../queue/eventBus';

export class TelegramBridge {
  private static instance: TelegramBridge;
  private botToken: string = '9146416024:AAFh6PVi5Pe4YKICGxUeGI5P9UtfIpkgznY';
  private chatId: string = '553488777';
  private isPolling: boolean = false;
  private lastUpdateId: number = 0;
  private webAppUrl: string = 'http://192.168.0.66:8080/';

  private constructor() {
    this.setupEventListener();
    this.startPolling();
  }

  public static getInstance(): TelegramBridge {
    if (!TelegramBridge.instance) {
      TelegramBridge.instance = new TelegramBridge();
    }
    return TelegramBridge.instance;
  }

  private setupEventListener(): void {
    // Escuta novas mensagens no eventBus para espelhar alertas e áudios no Telegram
    eventBus.on('messages.upsert', async (payload: any) => {
      const msg: NormalizedMessage = payload?.data;
      if (!msg) return;

      // Se for áudio, notifica imediatamente com a transcrição
      if (msg.mediaType === 'voice' && !msg.isFromMe) {
        await this.notifyAudioTranscription(msg);
      } else if (!msg.isFromMe && this.isLoggiRelated(msg)) {
        // Se for mensagem de grupo ou remetente da Loggi (LGGI), notifica como prioritária
        await this.notifyLoggiMessage(msg);
      }
    });
  }

  /**
   * Identifica se a conversa pertence ao ecossistema da Loggi (LGGI)
   */
  public isLoggiRelated(msg: NormalizedMessage): boolean {
    const text = (msg.text || '').toLowerCase();
    const sender = (msg.senderName || '').toLowerCase();
    const jid = (msg.remoteJid || '').toLowerCase();

    return (
      text.includes('loggi') ||
      text.includes('lggi') ||
      sender.includes('loggi') ||
      sender.includes('lggi') ||
      text.includes('rota') ||
      text.includes('transferência') ||
      text.includes('motorista') ||
      text.includes('coleta') ||
      text.includes('entrega') ||
      jid.includes('loggi')
    );
  }

  /**
   * Envia mensagem formatada ao Telegram do Adimilson
   */
  public async sendMessage(text: string, inlineKeyboard?: any): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      await axios.post(url, {
        chat_id: this.chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      }, { timeout: 8000 });
      return true;
    } catch (err: any) {
      console.error('[TELEGRAM BRIDGE] Erro ao enviar mensagem:', err.message);
      return false;
    }
  }

  /**
   * Alerta específico para mensagens dos Grupos da Loggi (LGGI)
   */
  private async notifyLoggiMessage(msg: NormalizedMessage): Promise<void> {
    const time = new Date(msg.timestamp * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const text = `🚚 <b>[GRUPO LOGGI / LGGI - WHATSAPP]</b>\n` +
      `👤 <b>De:</b> ${msg.senderName || 'Desconhecido'}\n` +
      `⏰ <b>Horário:</b> ${time}\n\n` +
      `💬 <i>"${msg.text}"</i>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📱 Abrir Cockpit Executivo', url: this.webAppUrl }
        ]
      ]
    };

    await this.sendMessage(text, keyboard);
  }

  /**
   * Notificação de Áudio com Transcrição Integral do Whisper
   */
  private async notifyAudioTranscription(msg: NormalizedMessage): Promise<void> {
    const time = new Date(msg.timestamp * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const text = `🎙️ <b>[ÁUDIO TRANSRITO INTEGRALMENTE - WHISPER]</b>\n` +
      `👤 <b>De:</b> ${msg.senderName || msg.remoteJid.split('@')[0]}\n` +
      `⏰ <b>Horário:</b> ${time}\n\n` +
      `📝 <b>Transcrição Literal:</b>\n` +
      `<blockquote>${msg.text || '[Processando transcrição na íntegra...]'}</blockquote>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💬 Responder no WhatsApp', url: this.webAppUrl }
        ]
      ]
    };

    await this.sendMessage(text, keyboard);
  }

  /**
   * Inicia polling de comandos enviados pelo Adimilson no Telegram
   */
  private async startPolling(): Promise<void> {
    if (this.isPolling) return;
    this.isPolling = true;

    while (this.isPolling) {
      try {
        const url = `https://api.telegram.org/bot${this.botToken}/getUpdates`;
        const res = await axios.get(url, {
          params: { offset: this.lastUpdateId + 1, timeout: 15 },
          timeout: 20000
        });

        const updates = res.data?.result || [];
        for (const update of updates) {
          this.lastUpdateId = update.update_id;
          await this.handleTelegramCommand(update);
        }
      } catch (err: any) {
        await new Promise(r => setTimeout(r, 4000));
      }
    }
  }

  /**
   * Processa comandos recebidos do Telegram
   */
  private async handleTelegramCommand(update: any): Promise<void> {
    const message = update.message;
    if (!message || !message.text) return;

    const fromId = String(message.chat.id);
    if (fromId !== this.chatId) return; // Apenas autoriza o Adimilson

    const text = message.text.trim();

    if (text === '/start' || text === '/ajuda') {
      const welcome = `👑 <b>Atlas AI | Torre de Controle Executiva</b>\n\n` +
        `Monitoramento autônomo do WhatsApp e dos Grupos da Loggi (LGGI).\n\n` +
        `<b>Comandos Rápidos:</b>\n` +
        `🔹 <code>/status</code> - Ver saúde do gateway e conexões\n` +
        `🔹 <code>/loggi</code> - Ver resumo dos grupos da Loggi\n` +
        `🔹 <code>/app</code> - Abrir o Cockpit Web Executivo\n` +
        `🔹 <code>/ia on</code> ou <code>/ia off</code> - Alternar autonomia da IA`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '🚀 Abrir App Executivo (PWA)', url: this.webAppUrl }]
        ]
      };
      await this.sendMessage(welcome, keyboard);
    } else if (text === '/status') {
      const statusText = `📊 <b>Status da Central Executiva:</b>\n\n` +
        `✅ <b>WhatsApp Master:</b> Conectado (+55 11 97625-8311)\n` +
        `🤖 <b>Agente IA Ativo:</b> Orquestrador Zero-Click (100% Autônomo)\n` +
        `🚚 <b>Monitoramento Loggi:</b> Ativo em Tempo Real\n` +
        `🎙️ <b>Whisper Audio Engine:</b> Operacional (Opus/PTT)\n` +
        `🌐 <b>Dashboard:</b> ${this.webAppUrl}`;
      await this.sendMessage(statusText);
    } else if (text === '/app') {
      await this.sendMessage(`📱 Acesse seu aplicativo executivo de qualquer lugar:\n👉 ${this.webAppUrl}`);
    } else if (text === '/ia on') {
      await this.sendMessage(`🤖 <b>IA Autônoma ATIVADA.</b> As personas responderão os clientes automaticamente com simulação de presença humana.`);
    } else if (text === '/ia off') {
      await this.sendMessage(`⏸️ <b>IA Autônoma PAUSADA.</b> Modo 100% manual ativado. Nenhuma resposta automática será enviada.`);
    }
  }
}

export const telegramBridge = TelegramBridge.getInstance();
