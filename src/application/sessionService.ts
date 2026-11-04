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
}

export const sessionService = new SessionService();
