import { EventEmitter } from 'events';
import { WebhookPayload } from '../../domain/webhook';

class EventBus extends EventEmitter {
  private static instance: EventBus;
  private recentEvents: WebhookPayload[] = [];
  private readonly MAX_EVENTS = 100;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public publish(payload: WebhookPayload): void {
    // Armazena no buffer circular de eventos recentes para o Dashboard
    this.recentEvents.unshift(payload);
    if (this.recentEvents.length > this.MAX_EVENTS) {
      this.recentEvents.pop();
    }

    // Dispara evento em background sem bloquear a execução
    setImmediate(() => {
      this.emit('webhook_event', payload);
      this.emit(payload.event, payload);
    });
  }

  public getRecentEvents(): WebhookPayload[] {
    return [...this.recentEvents];
  }
}

export const eventBus = EventBus.getInstance();

