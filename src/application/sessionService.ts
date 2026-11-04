import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env';
import { baileysEngine } from '../infrastructure/whatsapp/baileysEngine';
import { WhatsAppSession } from '../domain/session';

export class SessionService {
  public async startSession(sessionId: string): Promise<WhatsAppSession> {
    return await baileysEngine.initSession(sessionId);
  }

  public getSession(sessionId: string): WhatsAppSession | undefined {
    return baileysEngine.getSession(sessionId);
  }

  public getAllSessions(): WhatsAppSession[] {
    return baileysEngine.getAllSessions();
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    return await baileysEngine.deleteSession(sessionId);
  }

  public async requestPairingCode(sessionId: string, phoneNumber: string): Promise<string> {
    return await baileysEngine.requestPairingCode(sessionId, phoneNumber);
  }

  public async restoreExistingSessions(): Promise<void> {
    const sessionsDir = path.resolve(process.cwd(), ENV.SESSIONS_DIR);
    if (fs.existsSync(sessionsDir)) {
      const dirs = fs.readdirSync(sessionsDir).filter(f => {
        try {
          return fs.statSync(path.join(sessionsDir, f)).isDirectory();
        } catch (_) {
          return false;
        }
      });
      for (const sId of dirs) {
        try {
          await baileysEngine.initSession(sId);
        } catch (_) {}
      }
    }
  }
}

export const sessionService = new SessionService();
