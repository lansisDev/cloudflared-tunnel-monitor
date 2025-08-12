export interface TunnelConfig {
  name: string;
  url: string;
}

export interface Config {
  tunnels: TunnelConfig[];
  telegramBotToken: string;
  telegramChatId: string;
  checkIntervalMinutes: number;
  timeoutMs: number;
}

export interface TunnelStatus {
  tunnelName: string;
  isOnline: boolean;
  responseTime?: number;
  error?: string;
  checkedAt: Date;
}

export interface NotificationMessage {
  text: string;
  chatId: string;
}
