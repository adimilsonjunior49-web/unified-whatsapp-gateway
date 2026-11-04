import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { sessionService } from '../../application/sessionService';

export async function healthRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.get('/health', async (_request, reply) => {
    const memory = process.memoryUsage();
    const sessions = sessionService.getAllSessions();
    const connectedSessions = sessions.filter(s => s.status === 'CONNECTED').length;

    return reply.status(200).send({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      sessions: {
        total: sessions.length,
        connected: connectedSessions
      },
      memory: {
        rssMB: Math.round(memory.rss / 1024 / 1024),
        heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024)
      }
    });
  });

  fastify.get('/', async (_request, reply) => {
    return reply.status(200).send({
      name: 'Unified WhatsApp Enterprise Gateway',
      version: '1.0.0',
      docs: '/documentation'
    });
  });
}
