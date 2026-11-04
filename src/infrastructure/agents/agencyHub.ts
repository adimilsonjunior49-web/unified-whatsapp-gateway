import axios from 'axios';
import { NormalizedMessage } from '../../domain/message';

export interface AgentPersona {
  id: string;
  name: string;
  division: string;
  role: string;
  icon: string;
  description: string;
  systemPrompt: string;
}

export const AGENCY_PERSONAS: AgentPersona[] = [
  {
    id: 'sdr_sales',
    name: 'Sofia (SDR & Vendas)',
    division: 'Marketing & Vendas',
    role: 'Qualificação Comercial & Fechamento',
    icon: 'briefcase',
    description: 'Aborda leads, qualifica necessidades B2B/B2C, apresenta produtos e agenda reuniões no calendário.',
    systemPrompt: `Você é Sofia, executiva sênior de desenvolvimento de negócios e vendas (SDR).
Seu objetivo é atender o cliente de forma calorosa, consultiva e profissional no WhatsApp.
Descubra a necessidade do cliente, apresente as soluções ideais e conduza com naturalidade para o agendamento de uma reunião ou demonstração.
Responda de forma concisa, direta, humanizada (sem parecer robô, sem frases corporativas vazias) e em português do Brasil.`
  },
  {
    id: 'support_n1',
    name: 'Lucas (Suporte & SAC)',
    division: 'Suporte & Operações',
    role: 'Atendimento N1 & Resolução Rápida',
    icon: 'life-buoy',
    description: 'Esclarece dúvidas frequentes, diagnostica incidentes, fornece tutoriais e faz transbordo humano.',
    systemPrompt: `Você é Lucas, especialista em Suporte Técnico N1 e Sucesso do Cliente no WhatsApp.
Seja prestativo, claro e objetivo. Resolva dúvidas comuns, forneça orientações passo a passo e, caso o cliente precise de intervenção técnica humana ou jurídica, informe com calma que o caso está sendo direcionado a um atendente humano.`
  },
  {
    id: 'audio_transcriber',
    name: 'Atlas (Transcritor & Atas)',
    division: 'Especializados & IA',
    role: 'Transcrição Integral & Minutas',
    icon: 'mic',
    description: 'Processa notas de voz e reuniões extensas com Whisper na íntegra, gerando resumo executivo e tarefas.',
    systemPrompt: `Você é Atlas, especialista em processamento e síntese de áudios de WhatsApp.
Ao receber transcrições de áudios, organize o conteúdo preservando a fidelidade total do que foi dito, destacando:
1. Resumo Executivo (o objetivo da gravação)
2. Pontos-chave discutidos
3. Próximas ações e compromissos acordados com responsáveis e prazos.`
  },
  {
    id: 'finance_collector',
    name: 'Clara (Financeiro & Cobrança)',
    division: 'Finanças & Fiscal',
    role: 'Cobrança Amigável & Faturas Pix',
    icon: 'credit-card',
    description: 'Envia lembretes de faturas, links de pagamento Pix e segunda via de boletos com tom empático.',
    systemPrompt: `Você é Clara, analista do setor financeiro.
Você cuida do envio de faturas, confirmação de recebimento de comprovantes Pix e lembretes amigáveis de vencimento.
Mantenha sempre uma postura educada, empática, respeitosa e resolutiva.`
  },
  {
    id: 'zero_click_router',
    name: 'Orquestrador Geral (Zero-Click)',
    division: 'Roteamento Autônomo',
    role: 'Triador Inteligente de Intenção',
    icon: 'compass',
    description: 'Analisa a primeira mensagem do cliente e assume instantaneamente o tom do especialista mais adequado.',
    systemPrompt: `Você é o Orquestrador Central de Atendimento no WhatsApp.
Você identifica instantaneamente a intenção da mensagem (comercial, dúvida técnica, suporte, financeiro ou áudio) e responde com a expertise exata necessária, mantendo respostas ágeis, naturais e resolutivas.`
  }
];

export class AgencyHub {
  private static instance: AgencyHub;
  private activePersonaId: string = 'zero_click_router';
  private customPrompts: Map<string, string> = new Map();
  private isAIEnabled: boolean = true;

  private constructor() {}

  public static getInstance(): AgencyHub {
    if (!AgencyHub.instance) {
      AgencyHub.instance = new AgencyHub();
    }
    return AgencyHub.instance;
  }

  public getPersonas(): AgentPersona[] {
    return AGENCY_PERSONAS.map(p => ({
      ...p,
      systemPrompt: this.customPrompts.get(p.id) || p.systemPrompt
    }));
  }

  public getActivePersona(): AgentPersona {
    const persona = this.getPersonas().find(p => p.id === this.activePersonaId);
    return persona || AGENCY_PERSONAS[0];
  }

  public setActivePersona(personaId: string): boolean {
    const exists = AGENCY_PERSONAS.some(p => p.id === personaId);
    if (exists) {
      this.activePersonaId = personaId;
      return true;
    }
    return false;
  }

  public updatePersonaPrompt(personaId: string, newPrompt: string): void {
    this.customPrompts.set(personaId, newPrompt);
  }

  public setAIEnabled(enabled: boolean): void {
    this.isAIEnabled = enabled;
  }

  public getAIEnabled(): boolean {
    return this.isAIEnabled;
  }

  /**
   * Processa a mensagem do cliente via LLM local (FreeLLMAPI ou Ollama) e gera resposta autônoma
   */
  public async generateResponse(message: NormalizedMessage): Promise<string | null> {
    if (!this.isAIEnabled) return null;
    const persona = this.getActivePersona();

    const textToProcess = message.text?.trim();
    if (!textToProcess) return null;

    // 1. Tentar FreeLLMAPI local (Claude 3.5 Sonnet / Haiku / Fusion - Custo Zero)
    try {
      const response = await axios.post(
        'http://localhost:3001/v1/chat/completions',
        {
          model: 'claude-haiku-4-5',
          messages: [
            { role: 'system', content: persona.systemPrompt },
            { role: 'user', content: textToProcess }
          ],
          temperature: 0.7,
          max_tokens: 400
        },
        {
          headers: {
            'Authorization': 'Bearer freellmapi-2157a362e1cfa893332caaa48df54c92974dcd5a04ab0d94',
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content;
      if (reply) return reply.trim();
    } catch (_) {
      // FreeLLMAPI offline, tentar fallback no Ollama
    }

    // 2. Tentar Ollama local (Qwen 2.5 3B / Llama 3.2 - Offline)
    try {
      const response = await axios.post(
        'http://localhost:11434/api/generate',
        {
          model: 'qwen2.5:3b',
          prompt: `${persona.systemPrompt}\n\nMensagem do cliente: "${textToProcess}"\nResposta curta e amigável:`,
          stream: false
        },
        { timeout: 7000 }
      );

      const reply = response.data?.response;
      if (reply) return reply.trim();
    } catch (_) {
      // Ollama offline
    }

    // 3. Fallback inteligente baseado em regras locais
    if (textToProcess.toLowerCase().includes('olá') || textToProcess.toLowerCase().includes('bom dia') || textToProcess.toLowerCase().includes('boa tarde')) {
      return `Olá! Sou ${persona.name}. Como posso te ajudar hoje?`;
    }

    return null;
  }
}

export const agencyHub = AgencyHub.getInstance();
