import axios from 'axios';
import { ENV } from '../../config/env';
import { NormalizedMessage } from '../../domain/message';

export class ChatwootConnector {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = ENV.CHATWOOT.BASE_URL;
    this.apiToken = ENV.CHATWOOT.API_TOKEN;
  }

  public isEnabled(): boolean {
    return ENV.CHATWOOT.ENABLED && Boolean(this.baseUrl && this.apiToken);
  }

  /**
   * Encaminha mensagem recebida do WhatsApp para a caixa de entrada do Chatwoot
   */
  public async syncIncomingMessage(accountId: number, inboxId: number, msg: NormalizedMessage): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const contactIdentifier = msg.remoteJid.replace('@s.whatsapp.net', '');
      
      // 1. Localiza ou cria o contato
      const contactUrl = `${this.baseUrl}/api/v1/accounts/${accountId}/contacts`;
      const contactRes = await axios.post(
        contactUrl,
        {
          name: msg.senderName || contactIdentifier,
          phone_number: `+${contactIdentifier}`
        },
        {
          headers: { api_access_token: this.apiToken }
        }
      ).catch(() => null);

      const contactId = contactRes?.data?.payload?.contact?.id;

      // 2. Cria ou localiza a conversa e insere a mensagem
      const convUrl = `${this.baseUrl}/api/v1/accounts/${accountId}/conversations`;
      await axios.post(
        convUrl,
        {
          inbox_id: inboxId,
          contact_id: contactId,
          message: {
            content: msg.text,
            message_type: 'incoming'
          }
        },
        {
          headers: { api_access_token: this.apiToken }
        }
      );
    } catch (error: any) {
      // Falhas no Chatwoot não devem derrubar o gateway
      console.warn(`[CHATWOOT] Erro ao sincronizar mensagem: ${error.message}`);
    }
  }
}
