import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { ENV } from './config/env';
import { authMiddleware } from './presentation/middlewares/authMiddleware';
import { sessionRoutes } from './presentation/routes/sessionRoutes';
import { messageRoutes } from './presentation/routes/messageRoutes';
import { healthRoutes } from './presentation/routes/healthRoutes';
import { dashboardRoutes } from './presentation/routes/dashboardRoutes';
import { chatAndAgentRoutes } from './presentation/routes/chatAndAgentRoutes';
import { WebhookDispatcher } from './application/webhookDispatcher';

const app = Fastify({
  logger: {
    level: ENV.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: ENV.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined
  }
});

async function bootstrap() {
  // 1. Plugins de Segurança e Documentação
  await app.register(cors, { origin: '*' });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Unified WhatsApp Enterprise Gateway',
        description: 'Gateway de Alta Concorrência para WhatsApp, Bots, Chatwoot e IA (Engine Baileys sem navegador)',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  // 2. Middlewares Globais
  app.addHook('onRequest', authMiddleware);

  // 3. Registro de Rotas
  await app.register(dashboardRoutes);
  await app.register(healthRoutes);
  await app.register(sessionRoutes);
  await app.register(messageRoutes);
  await app.register(chatAndAgentRoutes);

  // 4. Inicialização de Serviços de Fundo (Webhooks)
  WebhookDispatcher.init();

  // 5. Start Server
  try {
    await app.listen({ port: ENV.PORT, host: ENV.HOST });
    app.log.info(`🚀 [GATEWAY] Servidor ativo em http://${ENV.HOST}:${ENV.PORT}`);
    app.log.info(`📚 [SWAGGER] Documentação OpenAPI em http://${ENV.HOST}:${ENV.PORT}/documentation`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
