import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { sessionService } from '../../application/sessionService';

export async function sessionRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Iniciar sessão
  fastify.post('/sessions/:sessionId/start', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const session = await sessionService.startSession(sessionId);
    return reply.status(200).send({
      success: true,
      data: session
    });
  });

  // Solicitar Código de Pareamento de 8 Dígitos (Link with Phone Number)
  fastify.post('/sessions/:sessionId/pairing-code', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const body = request.body as { phoneNumber: string };

    if (!body?.phoneNumber) {
      return reply.status(400).send({
        success: false,
        error: 'O campo "phoneNumber" é obrigatório (ex: 5511976258311).'
      });
    }

    try {
      const code = await sessionService.requestPairingCode(sessionId, body.phoneNumber);
      return reply.status(200).send({
        success: true,
        pairingCode: code,
        phoneNumber: body.phoneNumber
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: err.message
      });
    }
  });

  // Consultar status e QR Code da sessão
  fastify.get('/sessions/:sessionId/status', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const session = sessionService.getSession(sessionId);
    if (!session) {
      return reply.status(404).send({
        success: false,
        error: `Sessão "${sessionId}" não encontrada.`
      });
    }
    return reply.status(200).send({
      success: true,
      data: session
    });
  });

  // Listar todas as sessões
  fastify.get('/sessions', async (_request, reply) => {
    const sessions = sessionService.getAllSessions();
    return reply.status(200).send({
      success: true,
      count: sessions.length,
      data: sessions
    });
  });

  // Desconectar e excluir sessão
  fastify.delete('/sessions/:sessionId', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const deleted = await sessionService.deleteSession(sessionId);
    return reply.status(200).send({
      success: true,
      deleted
    });
  });
}
