import axios from 'axios';
import { ENV } from '../../config/env';
import { NormalizedMessage } from '../../domain/message';

export class TypebotConnector {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ENV.TYPEBOT.BASE_URL;
  }

  public isEnabled(): boolean {
    return ENV.TYPEBOT.ENABLED && Boolean(this.baseUrl);
  }

  /**
   * Encaminha mensagem do WhatsApp para a sessão do Typebot
   */
  public async forwardMessage(typebotId: string, msg: NormalizedMessage): Promise<any> {
    if (!this.isEnabled()) return null;

    try {
      const url = `${this.baseUrl}/api/v1/typebots/${typebotId}/startChat`;
      const res = await axios.post(url, {
        isStreamEnabled: false,
        message: msg.text,
        prefilledVariables: {
          userPhone: msg.remoteJid.replace('@s.whatsapp.net', ''),
          userName: msg.senderName
        }
      });
      return res.data;
    } catch (e: any) {
      console.warn(`[TYPEBOT] Erro ao disparar fluxo: ${e.message}`);
      return null;
    }
  }
}
