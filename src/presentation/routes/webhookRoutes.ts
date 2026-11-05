import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { highCapacityStore } from '../../infrastructure/storage/highCapacityStore';
import { WebhookDispatcher } from '../../application/webhookDispatcher';

export async function webhookRoutes(app: FastifyInstance) {
  /**
   * GET /webhooks
   * Lista todos os webhooks registrados e logs recentes de auditoria
   */
  app.get('/webhooks', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const webhooks = highCapacityStore.getWebhooks();
      const logs = highCapacityStore.getWebhookLogs(undefined, 25);
      return reply.send({
        success: true,
        count: webhooks.length,
        webhooks,
        recentDeliveries: logs
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  /**
   * POST /webhooks
   * Cadastra um novo endpoint de webhook com geração automática de segredo HMAC-SHA256
   */
  app.post('/webhooks', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      if (!body || !body.url) {
        return reply.status(400).send({ success: false, error: 'A URL do webhook é obrigatória.' });
      }

      const events = Array.isArray(body.events) && body.events.length > 0 ? body.events : ['*'];
      const webhook = highCapacityStore.createWebhook(body.url.trim(), events);

      return reply.send({
        success: true,
        message: 'Webhook cadastrado com sucesso!',
        webhook
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  /**
   * DELETE /webhooks/:id
   * Exclui um endpoint de webhook existente
   */
  app.delete('/webhooks/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const deleted = highCapacityStore.deleteWebhook(id);
      return reply.send({ success: deleted });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  /**
   * POST /webhooks/test-dispatch
   * Dispara um evento sintético de ping/teste para validar conectividade e assinatura HMAC
   */
  app.post('/webhooks/test-dispatch', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = (request.body as any) || {};
      const targetUrl = body.url;
      const secret = body.secret || 'whsec_demo_signature_key';

      if (!targetUrl) {
        return reply.status(400).send({ success: false, error: 'URL alvo necessária para o disparo de teste.' });
      }

      const testPayload = {
        event: 'atlas.ping',
        source: 'Atlas Control Tower Loggi',
        testMessage: 'Disparo de verificação de webhook criptografado com HMAC-SHA256',
        timestamp: Math.floor(Date.now() / 1000)
      };

      const result = await WebhookDispatcher.deliver(
        { id: body.webhookId || null, url: targetUrl, secret },
        'atlas.ping',
        testPayload
      );

      return reply.send({
        success: result.success,
        statusCode: result.statusCode,
        error: result.error,
        message: result.success
          ? `Webhook entregue com sucesso! (HTTP ${result.statusCode})`
          : `Falha na entrega do webhook: ${result.error}`
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
