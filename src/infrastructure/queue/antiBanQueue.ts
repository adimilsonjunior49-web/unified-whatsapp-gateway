import { baileysEngine } from '../whatsapp/baileysEngine';

export interface QueuedMessage {
  id: string;
  sessionId: string;
  to: string;
  content: any;
  priority: number;
  addedAt: number;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

export class AntiBanQueue {
  private static instance: AntiBanQueue;
  private queue: QueuedMessage[] = [];
  private isProcessing: boolean = false;
  private sentInLastHour: number = 0;
  private hourlyWindowStart: number = Date.now();
  private maxPerHour: number = 600; // Limite conservador e ultra-seguro contra bans da Meta

  private constructor() {
    // Limpa contador da janela horária a cada 60 minutos
    setInterval(() => {
      this.sentInLastHour = 0;
      this.hourlyWindowStart = Date.now();
    }, 3600000);
  }

  public static getInstance(): AntiBanQueue {
    if (!AntiBanQueue.instance) {
      AntiBanQueue.instance = new AntiBanQueue();
    }
    return AntiBanQueue.instance;
  }

  /**
   * Enfileira uma mensagem com espaçamento orgânico e proteção anti-bloqueio
   */
  public enqueue(sessionId: string, to: string, content: any, priority: number = 1): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = 'msg_q_' + Math.floor(Math.random() * 1000000);
      this.queue.push({
        id,
        sessionId,
        to,
        content,
        priority,
        addedAt: Date.now(),
        resolve,
        reject
      });

      // Ordena por prioridade decrescente
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processNext();
    });
  }

  /**
   * Processador com Jitter Orgânico (2.2s a 4.8s de intervalo)
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const item = this.queue.shift();

    if (!item) {
      this.isProcessing = false;
      return;
    }

    try {
      const sock = baileysEngine.getSocket(item.sessionId);
      if (!sock) {
        throw new Error(`Sessão ${item.sessionId} não está com socket ativo.`);
      }

      // 1. Simula presença humana "Digitando..." (composing) por um intervalo orgânico
      const isGroup = item.to.includes('@g.us');
      const jitterMs = Math.floor(Math.random() * 2600) + (isGroup ? 2500 : 1800);

      try {
        await sock.sendPresenceUpdate('composing', item.to);
      } catch (_) {}

      // Aguarda o intervalo simulando digitação humana
      await new Promise(r => setTimeout(r, jitterMs));

      // 2. Dispara a mensagem
      const result = await sock.sendMessage(item.to, item.content);

      try {
        await sock.sendPresenceUpdate('paused', item.to);
      } catch (_) {}

      this.sentInLastHour++;
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    } finally {
      this.isProcessing = false;

      // Se ainda houver itens na fila, agenda o próximo após pequeno respiro
      if (this.queue.length > 0) {
        const cooldown = Math.floor(Math.random() * 1200) + 800;
        setTimeout(() => this.processNext(), cooldown);
      }
    }
  }

  /**
   * Retorna telemetria e o indicador de saúde Anti-Ban
   */
  public getTelemetry(): {
    queueLength: number;
    sentInLastHour: number;
    maxPerHour: number;
    healthScore: number;
    status: 'EXCELLENT' | 'GOOD' | 'THROTTLED';
    estimatedWaitSeconds: number;
  } {
    const queueLength = this.queue.length;
    const usageRatio = this.sentInLastHour / this.maxPerHour;
    let healthScore = Math.max(10, Math.round((1 - usageRatio) * 100));

    let status: 'EXCELLENT' | 'GOOD' | 'THROTTLED' = 'EXCELLENT';
    if (healthScore < 40) status = 'THROTTLED';
    else if (healthScore < 75) status = 'GOOD';

    const estimatedWaitSeconds = Math.round(queueLength * 3.5);

    return {
      queueLength,
      sentInLastHour: this.sentInLastHour,
      maxPerHour: this.maxPerHour,
      healthScore,
      status,
      estimatedWaitSeconds
    };
  }
}

export const antiBanQueue = AntiBanQueue.getInstance();
