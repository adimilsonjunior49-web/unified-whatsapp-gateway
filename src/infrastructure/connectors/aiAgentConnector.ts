import { NormalizedMessage } from '../../domain/message';

export interface AIAgentConfig {
  pausedConversations: Set<string>; // JIDs onde a IA está pausada para operador humano
  aiEndpoint?: string;
}

export class AIAgentConnector {
  private config: AIAgentConfig = {
    pausedConversations: new Set()
  };

  /**
   * Pausa o agente de IA para um contato específico (quando o humano assume o atendimento)
   */
  public pauseAI(remoteJid: string): void {
    this.config.pausedConversations.add(remoteJid);
  }

  /**
   * Reativa o agente de IA para o contato
   */
  public resumeAI(remoteJid: string): void {
    this.config.pausedConversations.delete(remoteJid);
  }

  /**
   * Verifica se o agente de IA pode responder
   */
  public canProcess(msg: NormalizedMessage): boolean {
    if (msg.isFromMe) return false;
    if (this.config.pausedConversations.has(msg.remoteJid)) return false;
    return true;
  }
}
