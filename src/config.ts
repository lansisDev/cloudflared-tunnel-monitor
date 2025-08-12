import dotenv from 'dotenv';
import { Config, TunnelConfig } from './types';

dotenv.config();

function parseTunnels(): TunnelConfig[] {
  const tunnelsEnv = process.env.TUNNELS;
  if (!tunnelsEnv) {
    // Fallback para compatibilidad con configuración anterior
    const legacyUrl = process.env.TUNNEL_URL;
    if (legacyUrl) {
      return [{ name: 'Legacy Tunnel', url: legacyUrl }];
    }
    return [];
  }

  try {
    return JSON.parse(tunnelsEnv);
  } catch (error) {
    throw new Error('Invalid TUNNELS JSON format. Expected: [{"name":"tunnel1","url":"https://..."},{"name":"tunnel2","url":"https://..."}]');
  }
}

export const config: Config = {
  tunnels: parseTunnels(),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  checkIntervalMinutes: parseInt(process.env.CHECK_INTERVAL_MINUTES || '5'),
  timeoutMs: parseInt(process.env.TIMEOUT_MS || '10000')
};

export function validateConfig(config: Config): void {
  const errors: string[] = [];

  if (!config.tunnels || config.tunnels.length === 0) {
    errors.push('At least one tunnel must be configured. Use TUNNELS environment variable or legacy TUNNEL_URL.');
  }

  for (const tunnel of config.tunnels) {
    if (!tunnel.name) {
      errors.push('Each tunnel must have a name');
    }
    if (!tunnel.url) {
      errors.push(`Tunnel "${tunnel.name}" must have a URL`);
    }
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
