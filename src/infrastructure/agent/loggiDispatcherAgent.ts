export interface DispatcherKnowledge {
  topic: string;
  keywords: string[];
  answer: string;
}

export class LoggiDispatcherAgent {
  private static instance: LoggiDispatcherAgent;

  // Base de Conhecimento Operacional (RAG Loggi) - Respostas 100% Humanizadas
  private knowledgeBase: DispatcherKnowledge[] = [
    {
      topic: 'Docas e Carregamento Cajamar',
      keywords: ['doca cajamar', 'carregamento cajamar', 'doca', 'carreta sp-rj', 'doca 04'],
      answer: 'Olá! As carretas de transferência SP-RJ operam aqui nas docas de 01 a 06 em Cajamar. O carregamento do turno noturno começa pontualmente às 20h30, com a conferência no leitor de código de barras. Qualquer dúvida na chegada me avisa por aqui!'
    },
    {
      topic: 'Horário de Corte (Cutoff)',
      keywords: ['horário de corte', 'horario de corte', 'cutoff', 'corte', 'janela'],
      answer: 'O horário limite de corte pras rotas expressas D+0 é até às 19h30. Já as transferências estaduais têm janela estendida até às 21h15 aqui no CD Cajamar.'
    },
    {
      topic: 'Procedimento de Pacote Recusado ou Ausente',
      keywords: ['cliente ausente', 'recusado', 'não atendeu', 'devolução', 'avaria', 'insucesso'],
      answer: 'Para casos de cliente ausente ou entrega não realizada, o procedimento é o seguinte: 1) Tira a foto da fachada com o número no aplicativo; 2) Faz uma segunda tentativa de ligação pro cliente pelo softphone; 3) Se não atender em até 5 minutos, marca como "Destinatário Ausente" e traz o pacote de volta pro polo pra reentrega no dia seguinte.'
    },
    {
      topic: 'Contingência e Bloqueio de Rodovias',
      keywords: ['trânsito', 'transito', 'bloqueio', 'acidente', 'chuva', 'anhanguera', 'linha vermelha', 'rodoanel'],
      answer: 'Obrigado pelo aviso! Já registrei o alerta aqui na Torre de Controle. Se o bloqueio passar de 30 minutos, a equipe de supervisão já aciona uma rota alternativa.'
    },
    {
      topic: 'Contato do Plantão da Diretoria',
      keywords: ['plantão', 'plantao', 'supervisor', 'diretor', 'adimilson', 'urgência', 'emergência'],
      answer: 'O plantão da operação tá acompanhando tudo em tempo real. Se for uma urgência na rota, nosso canal com o Adimilson Júnior e a supervisão tá ativo.'
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
   * Responde dúvidas operacionais usando a base de conhecimento da Loggi de maneira calorosa e humana
   */
  public query(question: string): { answered: boolean; response: string; topic?: string } {
    const q = question.toLowerCase();

    for (const item of this.knowledgeBase) {
      for (const kw of item.keywords) {
        if (q.includes(kw)) {
          return {
            answered: true,
            topic: item.topic,
            response: item.answer
          };
        }
      }
    }

    return {
      answered: false,
      response: 'Entendido! Anotei sua mensagem e já passei pra equipe da Torre de Controle. Qualquer novidade te aviso por aqui.'
    };
  }
}

export const loggiDispatcherAgent = LoggiDispatcherAgent.getInstance();
