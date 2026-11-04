import { baileysEngine } from '../infrastructure/whatsapp/baileysEngine';
import { SendMessageRequest } from '../domain/message';

export class MessageService {
  public async send(sessionId: string, request: SendMessageRequest): Promise<any> {
    if (!request.to) {
      throw new Error('O campo "to" (destinatário) é obrigatório.');
    }
    if (!request.text && !request.mediaUrl) {
      throw new Error('É obrigatório informar "text" ou "mediaUrl".');
    }

    return await baileysEngine.sendMessage(sessionId, request);
  }
}

export const messageService = new MessageService();
