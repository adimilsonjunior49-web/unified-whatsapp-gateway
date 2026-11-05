import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { messageService } from '../../application/messageService';
import { SendMessageRequest } from '../../domain/message';
import { ttsEngine } from '../../infrastructure/audio/ttsEngine';

export async function messageRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Enviar mensagem de texto ou mídia
  fastify.post('/messages/:sessionId/send', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const body = request.body as SendMessageRequest;

    try {
      const result = await messageService.send(sessionId, body);
      return reply.status(200).send({
        success: true,
        messageId: result?.key?.id,
        status: 'ENVIADO'
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message
      });
    }
  });

  // Alias para envio padrão na sessão principal
  fastify.post('/messages/send', async (request, reply) => {
    const body = request.body as SendMessageRequest & { sessionId?: string };
    const sessionId = body.sessionId || 'whatsapp_principal';

    try {
      const result = await messageService.send(sessionId, body);
      return reply.status(200).send({
        success: true,
        messageId: result?.key?.id,
        status: 'ENVIADO'
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message
      });
    }
  });

  // Enviar Nota de Voz PTT gerada por Síntese de Voz (TTS)
  fastify.post('/messages/send-voice-tts', async (request, reply) => {
    const body = request.body as { sessionId?: string; to: string; text: string };
    const sessionId = body.sessionId || 'whatsapp_principal';
    const { to, text } = body;

    if (!to || !text) {
      return reply.status(400).send({ success: false, error: 'Campos "to" e "text" são obrigatórios.' });
    }

    try {
      const result = await ttsEngine.sendVoiceMessage(sessionId, to, text);
      return reply.status(200).send({
        success: true,
        messageId: result?.key?.id,
        status: 'AUDIO_PTT_ENVIADO'
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: err.message
      });
    }
  });
}
