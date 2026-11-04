export type WebhookEvent = 
  | 'qrcode.updated' 
  | 'pairing_code.generated'
  | 'connection.updated' 
  | 'messages.upsert' 
  | 'messages.update';

export interface WebhookPayload<T = any> {
  event: WebhookEvent;
  sessionId: string;
  timestamp: number;
  data: T;
}
