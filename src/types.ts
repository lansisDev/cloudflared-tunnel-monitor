export interface Config {
  tunnelUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  checkIntervalMinutes: number;
  timeoutMs: number;
}

export interface TunnelStatus {
  isOnline: boolean;
  responseTime?: number;
  error?: string;
  checkedAt: Date;
}

export interface NotificationMessage {
  text: string;
  chatId: string;
}
