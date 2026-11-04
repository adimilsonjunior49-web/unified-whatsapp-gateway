import axios from 'axios';

export interface SmartReplyOption {
  id: string;
  label: string;
  text: string;
  tone: 'direct' | 'resolutive' | 'cordial';
}

export class SmartReplyEngine {
  private static instance: SmartReplyEngine;

  private constructor() {}

  public static getInstance(): SmartReplyEngine {
    if (!SmartReplyEngine.instance) {
      SmartReplyEngine.instance = new SmartReplyEngine();
    }
    return SmartReplyEngine.instance;
  }

  /**
   * Gera 3 sugestões humanizadas de respostas sem parecer bot
   */
  public async generateSuggestions(incomingText: string, contextName: string = ''): Promise<SmartReplyOption[]> {
    const text = (incomingText || '').trim();
    if (!text) return this.getDefaultFallbackSuggestions();

    // Tenta FreeLLMAPI local para respostas hiper-contextualizadas
    try {
      const response = await axios.post(
        'http://localhost:3001/v1/chat/completions',
        {
          model: 'claude-haiku-4-5',
          messages: [
            {
              role: 'system',
              content: `Você é um assistente de sugestões de resposta para WhatsApp corporativo no Brasil (foco em logística e negócios).
O usuário recebeu uma mensagem e precisa de 3 opções de resposta rápidas, 100% humanas e naturais (sem jargão robótico, sem "como posso ajudar", sem travessões excessivos).
Retorne APENAS um JSON no formato:
[
  {"id": "1", "label": "Rápida", "text": "resposta 1", "tone": "direct"},
  {"id": "2", "label": "Resolutiva", "text": "resposta 2", "tone": "resolutive"},
  {"id": "3", "label": "Cordial", "text": "resposta 3", "tone": "cordial"}
]`
            },
            {
              role: 'user',
              content: `Mensagem recebida de ${contextName}: "${text}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': 'Bearer freellmapi-2157a362e1cfa893332caaa48df54c92974dcd5a04ab0d94',
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );

      const raw = response.data?.choices?.[0]?.message?.content;
      if (raw) {
        const cleaned = raw.substring(raw.indexOf('['), raw.lastIndexOf(']') + 1);
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}

    return this.generateRuleBasedSuggestions(text);
  }

  private generateRuleBasedSuggestions(text: string): SmartReplyOption[] {
    const lower = text.toLowerCase();
    if (lower.includes('chegou') || lower.includes('entregue') || lower.includes('finalizado')) {
      return [
        { id: '1', label: 'Confirmar', text: 'Excelente, já dei baixa aqui no sistema!', tone: 'resolutive' },
        { id: '2', label: 'Agradecer', text: 'Perfeito, obrigado pela confirmação rápida!', tone: 'cordial' },
        { id: '3', label: 'Ciente', text: 'Show de bola, recebido!', tone: 'direct' }
      ];
    }
    if (lower.includes('atraso') || lower.includes('problema') || lower.includes('urgente') || lower.includes('ajuda')) {
      return [
        { id: '1', label: 'Verificando', text: 'Já estou verificando isso agora mesmo para resolver.', tone: 'resolutive' },
        { id: '2', label: 'Alinhando', text: 'Certo, estou em contato com a equipe da base.', tone: 'direct' },
        { id: '3', label: 'Prioridade', text: 'Entendido, vou dar prioridade total nisso aqui.', tone: 'cordial' }
      ];
    }
    return this.getDefaultFallbackSuggestions();
  }

  private getDefaultFallbackSuggestions(): SmartReplyOption[] {
    return [
      { id: '1', label: 'Ciente', text: 'Beleza, entendido por aqui!', tone: 'direct' },
      { id: '2', label: 'Resolutivo', text: 'Perfeito, já estou acompanhando o andamento.', tone: 'resolutive' },
      { id: '3', label: 'Cordial', text: 'Obrigado pelo aviso, qualquer coisa me avise!', tone: 'cordial' }
    ];
  }
}

export const smartReplyEngine = SmartReplyEngine.getInstance();
