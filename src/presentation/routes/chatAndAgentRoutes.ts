import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { baileysEngine } from '../../infrastructure/whatsapp/baileysEngine';
import { agencyHub } from '../../infrastructure/agents/agencyHub';

export async function chatAndAgentRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Listar todas as conversas recentes de uma sessão
  fastify.get('/chats/:sessionId', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const chats = baileysEngine.getChats(sessionId);
    return reply.send({
      success: true,
      count: chats.length,
      data: chats
    });
  });

  // Obter histórico de mensagens de um contato
  fastify.get('/chats/:sessionId/:jid/messages', async (request, reply) => {
    const { sessionId, jid } = request.params as { sessionId: string; jid: string };
    const messages = baileysEngine.getChatMessages(sessionId, decodeURIComponent(jid));
    return reply.send({
      success: true,
      count: messages.length,
      data: messages
    });
  });

  // Listar personas disponíveis do AgencyHub
  fastify.get('/agents', async (_request, reply) => {
    const personas = agencyHub.getPersonas();
    const active = agencyHub.getActivePersona();
    const isEnabled = agencyHub.getAIEnabled();
    return reply.send({
      success: true,
      enabled: isEnabled,
      activePersona: active,
      personas
    });
  });

  // Alterar persona ativa do AgencyHub
  fastify.post('/agents/active', async (request, reply) => {
    const body = request.body as { personaId: string };
    if (!body?.personaId) {
      return reply.status(400).send({ success: false, error: 'personaId é obrigatório' });
    }
    const success = agencyHub.setActivePersona(body.personaId);
    return reply.send({
      success,
      activePersona: agencyHub.getActivePersona()
    });
  });

  // Ativar ou Pausar a IA globalmente
  fastify.post('/agents/toggle', async (request, reply) => {
    const body = request.body as { enabled: boolean };
    agencyHub.setAIEnabled(Boolean(body?.enabled));
    return reply.send({
      success: true,
      enabled: agencyHub.getAIEnabled()
    });
  });
}
