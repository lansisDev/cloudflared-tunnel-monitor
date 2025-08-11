import axios from 'axios';
import { NotificationMessage } from './types';
import logger from './logger';

export class TelegramNotifier {
  private botToken: string;
  private baseUrl: string;

  constructor(botToken: string) {
    this.botToken = botToken;
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  async sendMessage(message: NotificationMessage): Promise<boolean> {
    try {
      logger.info(`Sending Telegram notification to chat ${message.chatId}`);

      const response = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: message.chatId,
        text: message.text,
        parse_mode: 'HTML'
      });

      if (response.data.ok) {
        logger.info('Telegram notification sent successfully');
        return true;
      } else {
        logger.error(`Telegram API error: ${response.data.description}`);
        return false;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to send Telegram notification: ${errorMessage}`);
      return false;
    }
  }

  async sendTunnelDownAlert(tunnelUrl: string, chatId: string, error?: string): Promise<boolean> {
    const timestamp = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires'
    });

    const message = `
🚨 <b>TUNNEL DOWN ALERT</b> 🚨

📍 <b>URL:</b> ${tunnelUrl}
⏰ <b>Time:</b> ${timestamp}
${error ? `❌ <b>Error:</b> ${error}` : ''}

The Cloudflare tunnel is currently offline!
    `.trim();

    return this.sendMessage({
      text: message,
      chatId: chatId
    });
  }

  async sendTunnelRecoveredAlert(tunnelUrl: string, chatId: string, responseTime?: number): Promise<boolean> {
    const timestamp = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires'
    });

    const message = `
✅ <b>TUNNEL RECOVERED</b> ✅

📍 <b>URL:</b> ${tunnelUrl}
⏰ <b>Time:</b> ${timestamp}
${responseTime ? `⚡ <b>Response time:</b> ${responseTime}ms` : ''}

The Cloudflare tunnel is back online!
    `.trim();

    return this.sendMessage({
      text: message,
      chatId: chatId
    });
  }
}
