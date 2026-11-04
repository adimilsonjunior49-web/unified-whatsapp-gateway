export type SessionStatus = 
  | 'DISCONNECTED' 
  | 'SCAN_QR_CODE' 
  | 'CONNECTING' 
  | 'CONNECTED';

export interface WhatsAppSession {
  id: string;
  name?: string;
  status: SessionStatus;
  userJid?: string;
  phoneNumber?: string;
  qrCode?: string;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
