export interface DispatcherKnowledge {
  topic: string;
  keywords: string[];
  answer: string;
}

export class LoggiDispatcherAgent {
  private static instance: LoggiDispatcherAgent;

  // Base de Conhecimento Operacional (RAG Loggi)
  private knowledgeBase: DispatcherKnowledge[] = [
    {
      topic: 'Docas e Carregamento Cajamar',
      keywords: ['doca cajamar', 'carregamento cajamar', 'doca', 'carreta sp-rj', 'doca 04'],
      answer: 'Central Cajamar: Carretas de transferência SP-RJ operam nas Docas 01 a 06. Carregamento de turno noturno inicia pontualmente às 20:30 com conferência via leitor de código de barras.'
    },
    {
      topic: 'Horário de Corte (Cutoff)',
      keywords: ['horário de corte', 'horario de corte', 'cutoff', 'corte', 'janela'],
      answer: 'O horário limite de corte (Cutoff) para rotas Expressas D+0 é 19:30. Transferências estaduais têm janela estendida até às 21:15 no CD Cajamar.'
    },
    {
      topic: 'Procedimento de Pacote Recusado / Ausente',
      keywords: ['cliente ausente', 'recusado', 'não atendeu', 'devolução', 'avaria', 'insucesso'],
      answer: 'Para insucesso na entrega: 1) Registre foto da fachada/número no app; 2) Efetue a 2ª tentativa de contato telefônico via softphone; 3) Se não houver retorno em 5 minutos, marque "Destinatário Ausente" e retorne a encomenda ao polo para reentrega no dia seguinte.'
    },
    {
      topic: 'Contingência e Bloqueio de Rodovias',
      keywords: ['trânsito', 'transito', 'bloqueio', 'acidente', 'chuva', 'anhanguera', 'linha vermelha', 'rodoanel'],
      answer: 'Alerta Operacional registrado na Torre de Controle. Em caso de bloqueio superior a 30 minutos, acione o botão "Alerta Vermelho de Plantão" na Torre para despacho de rota alternativa pela supervisão.'
    },
    {
      topic: 'Contato do Plantão da Diretoria',
      keywords: ['plantão', 'plantao', 'supervisor', 'diretor', 'adimilson', 'urgência', 'emergência'],
      answer: 'Plantão Executivo da Loggi ativo via Telegram @AtlasJuniorBot ou diretamente com Adimilson Júnior (Diretor de Logística).'
    }
  ];

  private constructor() {}

  public static getInstance(): LoggiDispatcherAgent {
    if (!LoggiDispatcherAgent.instance) {
      LoggiDispatcherAgent.instance = new LoggiDispatcherAgent();
    }
    return LoggiDispatcherAgent.instance;
  }

  /**
   * Responde dúvidas operacionais usando a base de conhecimento da Loggi
   */
  public query(question: string): { answered: boolean; response: string; topic?: string } {
    const q = question.toLowerCase();

    for (const item of this.knowledgeBase) {
      for (const kw of item.keywords) {
        if (q.includes(kw)) {
          return {
            answered: true,
            topic: item.topic,
            response: `🤖 *[DESPACHANTE LOGGI - IA AUTÔNOMA]*\n\n📌 *${item.topic}*\n${item.answer}`
          };
        }
      }
    }

    return {
      answered: false,
      response: 'Dúvida operacional encaminhada para a supervisão da Torre de Controle Loggi.'
    };
  }
}

export const loggiDispatcherAgent = LoggiDispatcherAgent.getInstance();
