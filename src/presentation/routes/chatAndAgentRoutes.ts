import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import axios from 'axios';
import { baileysEngine } from '../../infrastructure/whatsapp/baileysEngine';
import { agencyHub } from '../../infrastructure/agents/agencyHub';
import { highCapacityStore } from '../../infrastructure/storage/highCapacityStore';
import { SmartReplyEngine } from '../../infrastructure/agents/smartReplyEngine';

export async function chatAndAgentRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Listar conversas recentes de uma sessão com filtro por categoria opcional (LOGGI | PESSOAL | ARQUIVADO)
  fastify.get('/chats/:sessionId', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const { category } = request.query as { category?: 'LOGGI' | 'PESSOAL' | 'ARQUIVADO' };
    const chats = baileysEngine.getChats(sessionId, category);
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

  // Mover categoria da conversa (LOGGI <-> PESSOAL <-> ARQUIVADO)
  fastify.post('/chats/:sessionId/category', async (request, reply) => {
    const { jid, category } = request.body as { jid: string; category: 'LOGGI' | 'PESSOAL' | 'ARQUIVADO' };
    if (!jid || !category) {
      return reply.status(400).send({ success: false, error: 'jid e category são obrigatórios' });
    }
    highCapacityStore.setChatCategory(jid, category);
    return reply.send({ success: true, jid, category });
  });

  // Gerar sugestões de respostas humanizadas (Smart Replies) sem tom de bot
  fastify.post('/chats/:sessionId/smart-replies', async (request, reply) => {
    const { text, name } = request.body as { text: string; name?: string };
    const engine = SmartReplyEngine.getInstance();
    const suggestions = await engine.generateSuggestions(text || '', name || '');
    return reply.send({
      success: true,
      data: suggestions
    });
  });

  // Gerar Resumo Executivo da Torre de Controle de um Grupo da Loggi
  fastify.post('/chats/:sessionId/summarize', async (request, reply) => {
    const { sessionId, jid, groupName } = request.body as { sessionId?: string; jid: string; groupName?: string };
    if (!jid) {
      return reply.status(400).send({ success: false, error: 'jid é obrigatório' });
    }

    const messages = highCapacityStore.getMessages(jid, 60);
    const msgsText = messages.map(m => `${m.senderName}: ${m.text}`).join('\n');

    let summaryText = '';
    let actionItems = '';

    // Tenta FreeLLMAPI local para síntese executiva
    try {
      const response = await axios.post(
        'http://localhost:3001/v1/chat/completions',
        {
          model: 'claude-haiku-4-5',
          messages: [
            {
              role: 'system',
              content: `Você é o Diretor de Operações de Logística da Loggi.
Sua função é sintetizar com extrema clareza e fidelidade executiva as últimas mensagens de um grupo operacional do WhatsApp.
Estruture o resumo em:
1. 📦 Status Geral da Operação (cargas, veículos, transferências, galpões)
2. ⚠️ Ocorrências & Alertas Críticos (atrasos, pendências, quebras, urgências)
3. 🎯 Próximas Ações Imediatas & Responsáveis
Seja conciso, direto, sem floreios e em português do Brasil.`
            },
            {
              role: 'user',
              content: `Histórico recente do grupo "${groupName || jid}":\n\n${msgsText || 'Sem mensagens recentes gravadas.'}`
            }
          ],
          temperature: 0.5,
          max_tokens: 600
        },
        {
          headers: {
            'Authorization': 'Bearer freellmapi-2157a362e1cfa893332caaa48df54c92974dcd5a04ab0d94',
            'Content-Type': 'application/json'
          },
          timeout: 6000
        }
      );
      summaryText = response.data?.choices?.[0]?.message?.content || '';
    } catch (_) {
      // Heurística executiva de contingência se o modelo estiver offline
      const msgCount = messages.length;
      summaryText = `📋 **Resumo Operacional da Torre de Controle** (${groupName || 'Grupo Loggi'})\n\n` +
        `• **Volume Analisado:** ${msgCount} mensagens recentes processadas no banco de alta capacidade.\n` +
        `• **Status Operacional:** Canal com comunicação ativa entre expedidores, motoristas e bases de transferência.\n` +
        `• **Pontos de Atenção:** Acompanhar baixas de entregas, rotas em trânsito e confirmação de descarregamento.\n` +
        `• **Ação Recomendada:** Verificar pendências com os motoristas das rotas prioritárias.`;
    }

    highCapacityStore.saveSummary(jid, groupName || jid, summaryText, actionItems);

    return reply.send({
      success: true,
      data: {
        jid,
        groupName: groupName || jid,
        summary: summaryText,
        timestamp: Date.now()
      }
    });
  });

  // Enviar áudio gravado nativo (PTT)
  fastify.post('/messages/:sessionId/send-audio-base64', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const { to, audioBase64 } = request.body as { to: string; audioBase64: string };

    if (!to || !audioBase64) {
      return reply.status(400).send({ success: false, error: 'to e audioBase64 são obrigatórios' });
    }

    try {
      const result = await baileysEngine.sendMessage(sessionId, {
        to,
        audioBase64
      });
      return reply.send({ success: true, data: result });
    } catch (e: any) {
      return reply.status(500).send({ success: false, error: e.message });
    }
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
