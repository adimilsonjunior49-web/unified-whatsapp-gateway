import { EventEmitter } from 'events';
import { WebhookPayload } from '../../domain/webhook';

class EventBus extends EventEmitter {
  private static instance: EventBus;

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
    // Dispara evento em background sem bloquear a execução
    setImmediate(() => {
      this.emit('webhook_event', payload);
      this.emit(payload.event, payload);
    });
  }
}

export const eventBus = EventBus.getInstance();
