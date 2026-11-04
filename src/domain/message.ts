export type MediaType = 'text' | 'voice' | 'image' | 'video' | 'document';

export interface NormalizedMessage {
  id: string;
  sessionId: string;
  remoteJid: string;
  senderJid: string;
  senderName: string;
  isFromMe: boolean;
  isGroup: boolean;
  text: string;
  mediaType: MediaType;
  mediaUrl?: string;
  fileName?: string;
  durationSec?: number;
  timestamp: number;
}

export interface SendMessageRequest {
  to: string; // Número com DDI ou JID (ex: 5511999998888)
  text?: string;
  mediaType?: MediaType;
  mediaUrl?: string;
  fileName?: string;
  quotedMsgId?: string;
  audioBase64?: string;
}
