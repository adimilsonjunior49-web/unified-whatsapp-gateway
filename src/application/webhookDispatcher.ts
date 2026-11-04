import axios from 'axios';
import { eventBus } from '../infrastructure/queue/eventBus';
import { WebhookPayload } from '../domain/webhook';
import { ENV } from '../config/env';

export class WebhookDispatcher {
  public static init(): void {
    eventBus.on('webhook_event', async (payload: WebhookPayload) => {
      const targetUrl = ENV.DEFAULT_WEBHOOK_URL;
      if (!targetUrl) return;

      try {
        await axios.post(targetUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Gateway-Session': payload.sessionId,
            'X-Gateway-Event': payload.event
          },
          timeout: 6000
        });
      } catch (err: any) {
        console.warn(`[WEBHOOK] Erro ao entregar evento ${payload.event} para ${targetUrl}: ${err.message}`);
      }
    });
  }
}
