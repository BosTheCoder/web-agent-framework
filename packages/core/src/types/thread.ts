export interface Thread {
  threadId: string;
  preview: string;
  timestamp: Date;
}

export interface Message {
  from: string;
  text: string;
  timestamp: Date;
}

export interface ThreadDetail {
  threadId: string;
  messages: Message[];
  metadata?: Record<string, unknown>;
}
