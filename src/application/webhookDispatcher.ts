import axios from 'axios';
import crypto from 'crypto';
import { eventBus } from '../infrastructure/queue/eventBus';
import { highCapacityStore } from '../infrastructure/storage/highCapacityStore';
import { ENV } from '../config/env';

export interface WebhookEventPayload {
  event: string;
  timestamp: number;
  data: any;
  deliveryId?: string;
}

export class WebhookDispatcher {
  public static init(): void {
    // Escuta evento genérico de webhook
    eventBus.on('webhook_event', async (payload: any) => {
      await WebhookDispatcher.dispatchToAll(payload?.event || 'generic.event', payload);
    });

    // Escuta novas mensagens para webhooks
    eventBus.on('messages.upsert', async (payload: any) => {
      await WebhookDispatcher.dispatchToAll('message.upsert', payload);
    });
  }

  /**
   * Dispara um evento para todos os endpoints de Webhooks ativos registrados no banco
   */
  public static async dispatchToAll(eventName: string, data: any): Promise<void> {
    try {
      const activeWebhooks = highCapacityStore.getWebhooks().filter(w => w.status === 'ACTIVE');

      // Se houver DEFAULT_WEBHOOK_URL nas variáveis de ambiente e não estiver na lista, adiciona dinamicamente
      if (ENV.DEFAULT_WEBHOOK_URL && !activeWebhooks.some(w => w.url === ENV.DEFAULT_WEBHOOK_URL)) {
        activeWebhooks.push({
          id: 'wh_env_default',
          url: ENV.DEFAULT_WEBHOOK_URL,
          secret: 'whsec_default_env_key',
          events: ['*']
        });
      }

      for (const hook of activeWebhooks) {
        // Verifica se o webhook assina esse evento (ou '*')
        const subscribes = hook.events.includes('*') || hook.events.includes(eventName);
        if (!subscribes) continue;

        WebhookDispatcher.deliver(hook, eventName, data).catch(() => {});
      }
    } catch (err: any) {
      console.warn(`[WEBHOOK DISPATCHER] Erro geral ao disparar para webhooks:`, err.message);
    }
  }

  /**
   * Realiza a entrega individual de um payload com assinatura HMAC-SHA256 padrão GitHub/Stripe
   */
  public static async deliver(hook: any, eventName: string, data: any): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    const deliveryId = 'del_' + crypto.randomBytes(8).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000);

    const payload: WebhookEventPayload = {
      event: eventName,
      timestamp,
      deliveryId,
      data
    };

    const payloadString = JSON.stringify(payload);
    // Assinatura HMAC-SHA256 padrão GitHub (X-Hub-Signature-256)
    const signature = crypto
      .createHmac('sha256', hook.secret || 'default_secret')
      .update(payloadString)
      .digest('hex');

    try {
      const response = await axios.post(hook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Atlas-Loggi-Webhook-Dispatcher/1.0',
          'X-Atlas-Delivery': deliveryId,
          'X-Atlas-Event': eventName,
          'X-Atlas-Timestamp': String(timestamp),
          'X-Atlas-Signature-256': `sha256=${signature}`
        },
        timeout: 5000
      });

      if (hook.id && hook.id !== 'wh_env_default') {
        highCapacityStore.logWebhookDispatch(hook.id, eventName, response.status, true);
      }

      return { success: true, statusCode: response.status };
    } catch (err: any) {
      const statusCode = err.response ? err.response.status : 0;
      const errorMsg = err.response ? `HTTP ${err.response.status}` : err.message;

      if (hook.id && hook.id !== 'wh_env_default') {
        highCapacityStore.logWebhookDispatch(hook.id, eventName, statusCode, false, errorMsg);
      }

      return { success: false, statusCode, error: errorMsg };
    }
  }
}
