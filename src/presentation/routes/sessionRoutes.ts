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
