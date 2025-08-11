import dotenv from 'dotenv';
import { Config } from './types';

dotenv.config();

export const config: Config = {
  tunnelUrl: process.env.TUNNEL_URL || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  checkIntervalMinutes: parseInt(process.env.CHECK_INTERVAL_MINUTES || '5'),
  timeoutMs: parseInt(process.env.TIMEOUT_MS || '10000')
};

export function validateConfig(config: Config): void {
  const errors: string[] = [];

  if (!config.tunnelUrl) {
    errors.push('TUNNEL_URL is required');
  }
  
  if (!config.telegramBotToken) {
    errors.push('TELEGRAM_BOT_TOKEN is required');
  }
  
  if (!config.telegramChatId) {
    errors.push('TELEGRAM_CHAT_ID is required');
  }

  if (config.checkIntervalMinutes < 1) {
    errors.push('CHECK_INTERVAL_MINUTES must be at least 1');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
