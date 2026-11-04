import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';

import { ENV } from '../../config/env';
import { WhatsAppSession, SessionStatus } from '../../domain/session';
import { NormalizedMessage, SendMessageRequest } from '../../domain/message';
import { eventBus } from '../queue/eventBus';
import { agencyHub } from '../agents/agencyHub';

export interface ChatSummary {
  remoteJid: string;
  name: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
  messages: NormalizedMessage[];
}

export class BaileysEngine {
  private activeSockets: Map<string, any> = new Map();
  private sessionsState: Map<string, WhatsAppSession> = new Map();
  private chatStore: Map<string, Map<string, ChatSummary>> = new Map();
  private logger = pino({ level: 'info' });

  public getSession(sessionId: string): WhatsAppSession | undefined {
    return this.sessionsState.get(sessionId);
  }

  public getAllSessions(): WhatsAppSession[] {
    return Array.from(this.sessionsState.values());
  }

  public getChats(sessionId: string): ChatSummary[] {
    const sessionChats = this.chatStore.get(sessionId);
    if (!sessionChats) return [];
    return Array.from(sessionChats.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  public getChatMessages(sessionId: string, remoteJid: string): NormalizedMessage[] {
    const sessionChats = this.chatStore.get(sessionId);
    if (!sessionChats) return [];
    const chat = sessionChats.get(remoteJid);
    return chat ? chat.messages : [];
  }

  private saveToChatStore(sessionId: string, msg: NormalizedMessage): void {
    if (!this.chatStore.has(sessionId)) {
      this.chatStore.set(sessionId, new Map());
    }
    const sessionChats = this.chatStore.get(sessionId)!;
    const existing = sessionChats.get(msg.remoteJid);

    const messages = existing ? [...existing.messages, msg] : [msg];
    // Mantém no máximo 100 mensagens no histórico por contato
    if (messages.length > 100) messages.shift();

    sessionChats.set(msg.remoteJid, {
      remoteJid: msg.remoteJid,
      name: msg.senderName || msg.remoteJid.split('@')[0],
      lastMessage: msg.text || (msg.mediaType ? `[${msg.mediaType}]` : ''),
      timestamp: msg.timestamp,
      unreadCount: msg.isFromMe ? 0 : (existing ? existing.unreadCount + 1 : 1),
      messages
    });
  }

  /**
   * Inicializa ou restaura uma sessão independente
   */
  public async initSession(sessionId: string): Promise<WhatsAppSession> {
    const existing = this.sessionsState.get(sessionId);
    if (existing && existing.status === 'CONNECTED') {
      return existing;
    }

    const sessionDir = path.join(ENV.SESSIONS_DIR, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const sessionData: WhatsAppSession = {
      id: sessionId,
      status: 'CONNECTING',
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date()
    };
    this.sessionsState.set(sessionId, sessionData);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      browser: Browsers.ubuntu('Chrome'),
      syncFullHistory: false,
      defaultQueryTimeoutMs: 60000
    });

    this.activeSockets.set(sessionId, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        sessionData.status = 'SCAN_QR_CODE';
        sessionData.qrCode = await QRCode.toDataURL(qr);
        sessionData.updatedAt = new Date();
        this.sessionsState.set(sessionId, sessionData);

        eventBus.publish({
          event: 'qrcode.updated',
          sessionId,
          timestamp: Date.now(),
          data: { qrCode: sessionData.qrCode }
        });
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        this.logger.warn(`[Sessão ${sessionId}] Conexão fechada. Status: ${statusCode}. Reconectar: ${shouldReconnect}`);

        if (shouldReconnect) {
          sessionData.status = 'CONNECTING';
          this.sessionsState.set(sessionId, sessionData);
          setTimeout(() => this.initSession(sessionId), 4000);
        } else {
          sessionData.status = 'DISCONNECTED';
          sessionData.qrCode = undefined;
          this.sessionsState.set(sessionId, sessionData);
          this.activeSockets.delete(sessionId);
          try {
            fs.rmSync(sessionDir, { recursive: true, force: true });
          } catch (_) {}
        }

        eventBus.publish({
          event: 'connection.updated',
          sessionId,
          timestamp: Date.now(),
          data: { status: sessionData.status, reason: statusCode }
        });
      } else if (connection === 'open') {
        sessionData.status = 'CONNECTED';
        sessionData.qrCode = undefined;
        sessionData.userJid = sock.user?.id;
        sessionData.phoneNumber = sock.user?.id ? sock.user.id.split(':')[0] : undefined;
        sessionData.updatedAt = new Date();
        this.sessionsState.set(sessionId, sessionData);
        this.activeSockets.set(sessionId, sock);

        this.logger.info(`[Sessão ${sessionId}] CONECTADA com sucesso! Usuário: ${sessionData.phoneNumber}`);

        eventBus.publish({
          event: 'connection.updated',
          sessionId,
          timestamp: Date.now(),
          data: { status: 'CONNECTED', phoneNumber: sessionData.phoneNumber }
        });
      }
    });

    // Escuta de mensagens recebidas
    sock.ev.on('messages.upsert', async (m) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          const normalized = this.normalizeMessage(sessionId, msg);
          if (normalized) {
            this.saveToChatStore(sessionId, normalized);

            eventBus.publish({
              event: 'messages.upsert',
              sessionId,
              timestamp: Date.now(),
              data: normalized
            });

            // Resposta autônoma de IA via AgencyHub (se ativada)
            if (!normalized.isFromMe && !normalized.isGroup && normalized.text) {
              this.handleAIResponse(sessionId, normalized);
            }
          }
        }
      }
    });

    return sessionData;
  }

  /**
   * Encerra e desconecta uma sessão ativa
   */
  public async deleteSession(sessionId: string): Promise<boolean> {
    const sock = this.activeSockets.get(sessionId);
    if (sock) {
      try {
        await sock.logout();
      } catch (_) {}
      this.activeSockets.delete(sessionId);
    }

    const sessionDir = path.join(ENV.SESSIONS_DIR, sessionId);
    if (fs.existsSync(sessionDir)) {
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      } catch (_) {}
    }

    this.sessionsState.delete(sessionId);
    return true;
  }

  /**
   * Envia uma mensagem estruturada pelo WhatsApp
   */
  public async sendMessage(sessionId: string, payload: SendMessageRequest): Promise<any> {
    const sock = this.activeSockets.get(sessionId);
    if (!sock) {
      throw new Error(`Sessão ${sessionId} não está ativa.`);
    }

    const rawTo = payload.to.replace(/\D/g, '');
    const jid = payload.to.includes('@') ? payload.to : `${rawTo}@s.whatsapp.net`;
    let result: any;

    // 1. Mensagem de Texto
    if (payload.text && !payload.mediaUrl) {
      result = await sock.sendMessage(jid, { text: payload.text });
    } else if (payload.mediaType === 'voice' && payload.mediaUrl) {
      // 2. Áudio Nativo de Voz (PTT com Waveform Opus)
      result = await sock.sendMessage(jid, {
        audio: { url: payload.mediaUrl },
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      });
    } else if (payload.mediaUrl) {
      // 3. Mídia Geral (Imagem, Vídeo ou Documento)
      const type = payload.mediaType || 'document';
      result = await sock.sendMessage(jid, {
        [type]: { url: payload.mediaUrl },
        caption: payload.text,
        fileName: payload.fileName
      });
    } else {
      throw new Error('Payload de envio inválido.');
    }

    // Registra envio no Chat Store
    const sentMsg: NormalizedMessage = {
      id: result?.key?.id || `MSG-${Date.now()}`,
      sessionId,
      remoteJid: jid,
      senderJid: sock.user?.id || 'me',
      senderName: 'Você',
      isFromMe: true,
      isGroup: jid.endsWith('@g.us'),
      text: payload.text || (payload.mediaType === 'voice' ? '[Áudio de Voz PTT]' : '[Mídia]'),
      mediaType: payload.mediaType || 'text',
      timestamp: Math.floor(Date.now() / 1000)
    };
    this.saveToChatStore(sessionId, sentMsg);

    return result;
  }

  /**
   * Responde de forma autônoma utilizando a Persona ativa do AgencyHub
   */
  private async handleAIResponse(sessionId: string, msg: NormalizedMessage): Promise<void> {
    try {
      const sock = this.activeSockets.get(sessionId);
      if (!sock) return;

      const aiReply = await agencyHub.generateResponse(msg);
      if (!aiReply) return;

      // Simulação humana: "Digitando..." por 2 a 3 segundos
      await sock.sendPresenceUpdate('composing', msg.remoteJid);
      await new Promise(r => setTimeout(r, 2500));

      await this.sendMessage(sessionId, {
        to: msg.remoteJid,
        text: aiReply
      });

      await sock.sendPresenceUpdate('paused', msg.remoteJid);
    } catch (err: any) {
      this.logger.error(`[IA Agent] Falha ao despachar resposta: ${err.message}`);
    }
  }

  /**
   * Normaliza payload do Baileys para o contrato universal de mensagem
   */
  private normalizeMessage(sessionId: string, msg: proto.IWebMessageInfo): NormalizedMessage | null {
    if (!msg.key || !msg.message) return null;

    const remoteJid = msg.key.remoteJid || '';
    const isGroup = remoteJid.endsWith('@g.us');
    const senderJid = msg.key.participant || remoteJid;
    const isFromMe = Boolean(msg.key.fromMe);

    let text = '';
    let mediaType: NormalizedMessage['mediaType'] = 'text';

    if (msg.message.conversation) {
      text = msg.message.conversation;
    } else if (msg.message.extendedTextMessage?.text) {
      text = msg.message.extendedTextMessage.text;
    } else if (msg.message.audioMessage) {
      mediaType = 'voice';
      text = '[Mensagem de Voz]';
    } else if (msg.message.imageMessage) {
      mediaType = 'image';
      text = msg.message.imageMessage.caption || '[Imagem]';
    } else if (msg.message.videoMessage) {
      mediaType = 'video';
      text = msg.message.videoMessage.caption || '[Vídeo]';
    } else if (msg.message.documentMessage) {
      mediaType = 'document';
      text = msg.message.documentMessage.fileName || '[Documento]';
    }

    return {
      id: msg.key.id || `MSG-${Date.now()}`,
      sessionId,
      remoteJid,
      senderJid,
      senderName: msg.pushName || senderJid.split('@')[0],
      isFromMe,
      isGroup,
      text,
      mediaType,
      timestamp: Number(msg.messageTimestamp) || Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Solicita um código de pareamento de 8 dígitos para conectar via número de telefone
   */
  public async requestPairingCode(sessionId: string, phoneNumber: string): Promise<string> {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    let sock = this.activeSockets.get(sessionId);

    if (!sock) {
      await this.initSession(sessionId);
      await new Promise((r) => setTimeout(r, 2000));
      sock = this.activeSockets.get(sessionId);
    }

    if (!sock) {
      throw new Error(`Socket da sessão "${sessionId}" não está ativo.`);
    }

    try {
      const code = await sock.requestPairingCode(cleanedNumber);
      const sessionData = this.sessionsState.get(sessionId);
      if (sessionData) {
        sessionData.pairingCode = code;
        sessionData.phoneNumber = cleanedNumber;
        sessionData.updatedAt = new Date();
        this.sessionsState.set(sessionId, sessionData);
      }

      eventBus.publish({
        event: 'pairing_code.generated',
        sessionId,
        timestamp: Date.now(),
        data: { pairingCode: code, phoneNumber: cleanedNumber }
      });

      return code;
    } catch (err: any) {
      this.logger.error(`Erro ao solicitar pairing code para ${cleanedNumber}: ${err.message}`);
      throw new Error(`Falha ao gerar código de pareamento: ${err.message}`);
    }
  }
}

export const baileysEngine = new BaileysEngine();
