import { FastifyRequest, FastifyReply } from 'fastify';
import { ENV } from '../../config/env';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Ignora autenticação na documentação do Swagger, Health Check e Dashboard Web / PWA
  const url = request.url;
  if (
    url.startsWith('/documentation') ||
    url === '/health' ||
    url === '/' ||
    url.startsWith('/dashboard') ||
    url === '/manifest.json' ||
    url.startsWith('/events/recent') ||
    url === '/favicon.ico'
  ) {
    return;
  }

  const authHeader = request.headers.authorization;
  const apiKeyHeader = request.headers['x-api-key'] as string;

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (apiKeyHeader) {
    token = apiKeyHeader.trim();
  }

  if (!token || token !== ENV.API_SECRET_KEY) {
    reply.status(401).send({
      success: false,
      error: 'Não autorizado. Forneça uma API Key válida no header Authorization: Bearer <TOKEN> ou x-api-key.'
    });
  }
}
