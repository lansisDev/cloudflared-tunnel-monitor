import * as cron from 'node-cron';
import { config, validateConfig } from './config';
import { TunnelMonitor } from './tunnel-monitor';
import { TelegramNotifier } from './telegram-notifier';
import logger from './logger';

class TunnelMonitorApp {
  private monitor: TunnelMonitor;
  private notifier: TelegramNotifier;
  private lastStatus: boolean | null = null;
  private isRunning = false;
  private cronTask: cron.ScheduledTask | null = null;

  constructor() {
    validateConfig(config);
    
    this.monitor = new TunnelMonitor(config.tunnelUrl, config.timeoutMs);
    this.notifier = new TelegramNotifier(config.telegramBotToken);
  }

  async checkTunnel(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Previous check still running, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      const status = await this.monitor.checkStatus();
      
      // Check if status changed
      if (this.lastStatus !== null && this.lastStatus !== status.isOnline) {
        if (status.isOnline) {
          // Tunnel recovered
          await this.notifier.sendTunnelRecoveredAlert(
            config.tunnelUrl,
            config.telegramChatId,
            status.responseTime
          );
        } else {
          // Tunnel went down
          await this.notifier.sendTunnelDownAlert(
            config.tunnelUrl,
            config.telegramChatId,
            status.error
          );
        }
      }

      this.lastStatus = status.isOnline;

      if (status.isOnline) {
        logger.info(`✅ Tunnel is online (${status.responseTime}ms)`);
      } else {
        logger.error(`❌ Tunnel is offline: ${status.error}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error during tunnel check: ${errorMessage}`);
    } finally {
      this.isRunning = false;
    }
  }

  start(): void {
    logger.info('🚀 Starting Cloudflare Tunnel Monitor');
    logger.info(`📍 Monitoring URL: ${config.tunnelUrl}`);
    logger.info(`⏰ Check interval: ${config.checkIntervalMinutes} minutes`);
    logger.info(`💬 Telegram notifications enabled`);

    // Run initial check
    this.checkTunnel();

    // Schedule periodic checks
    const cronExpression = `*/${config.checkIntervalMinutes} * * * *`;
    this.cronTask = cron.schedule(cronExpression, () => {
      this.checkTunnel();
    });

    logger.info(`⏰ Scheduled checks every ${config.checkIntervalMinutes} minutes`);
  }

  async stop(): Promise<void> {
    logger.info('🛑 Stopping Cloudflare Tunnel Monitor');
    if (this.cronTask) {
      this.cronTask.stop();
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the application
const app = new TunnelMonitorApp();
app.start();
