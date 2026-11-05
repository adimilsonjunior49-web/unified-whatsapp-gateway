import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { eventBus } from '../../infrastructure/queue/eventBus';
import fs from 'fs';
import path from 'path';

export async function dashboardRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Ícone Executivo SVG
  fastify.get('/icon.svg', async (_req, reply) => {
    const iconPath = path.resolve(process.cwd(), 'app_icon.svg');
    if (fs.existsSync(iconPath)) {
      return reply.type('image/svg+xml').send(fs.readFileSync(iconPath));
    }
    return reply.status(404).send({ error: 'Ícone não encontrado.' });
  });

  // Manifesto PWA
  fastify.get('/manifest.json', async (_req, reply) => {
    return reply.type('application/json').send({
      name: 'Atlas Loggi Command Center',
      short_name: 'Atlas Loggi',
      description: 'Painel Executivo WhatsApp, Grupos Loggi, Feed de Menções, Notícias de Mercado e IA, e Torre de Controle',
      start_url: '/',
      display: 'standalone',
      background_color: '#07090E',
      theme_color: '#0284c7',
      icons: [
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    });
  });

  // Eventos recentes
  fastify.get('/events/recent', async (_req, reply) => {
    return reply.send({
      success: true,
      data: eventBus.getRecentEvents()
    });
  });

  // Servir arquivos de áudio transcritos
  fastify.get('/audio/:filename', async (req, reply) => {
    const { filename } = req.params as { filename: string };
    const audioPath = path.resolve(process.cwd(), 'storage', 'audio', filename);
    if (fs.existsSync(audioPath)) {
      return reply.type('audio/ogg').send(fs.createReadStream(audioPath));
    }
    return reply.status(404).send({ error: 'Arquivo de áudio não encontrado.' });
  });

  // HTML da aplicação completa
  fastify.get('/', async (_req, reply) => {
    const htmlPath = path.resolve(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
      return reply.type('text/html').send(fs.readFileSync(htmlPath, 'utf8'));
    }
    return reply.type('text/html').send('<h1>Atlas Loggi Command Center</h1>');
  });

  fastify.get('/dashboard', async (_req, reply) => {
    const htmlPath = path.resolve(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
      return reply.type('text/html').send(fs.readFileSync(htmlPath, 'utf8'));
    }
    return reply.type('text/html').send('<h1>Atlas Loggi Command Center</h1>');
  });
}
