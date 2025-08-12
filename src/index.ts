import * as cron from 'node-cron';
import { config, validateConfig } from './config';
import { TunnelMonitor } from './tunnel-monitor';
import { TelegramNotifier } from './telegram-notifier';
import { TunnelStatus } from './types';
import logger from './logger';

class TunnelMonitorApp {
  private monitors: TunnelMonitor[] = [];
  private notifier: TelegramNotifier;
  private lastStatuses: Map<string, boolean> = new Map();
  private isRunning = false;
  private cronTask: cron.ScheduledTask | null = null;

  constructor() {
    validateConfig(config);
    
    this.monitors = config.tunnels.map(tunnel => 
      new TunnelMonitor(tunnel, config.timeoutMs)
    );
    this.notifier = new TelegramNotifier(config.telegramBotToken);
  }

  async checkTunnels(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Previous check still running, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      // Check all tunnels in parallel
      const statusPromises = this.monitors.map(monitor => monitor.checkStatus());
      const statuses = await Promise.allSettled(statusPromises);

      for (let i = 0; i < statuses.length; i++) {
        const result = statuses[i];
        
        if (result.status === 'fulfilled') {
          const status = result.value;
          await this.handleTunnelStatus(status);
        } else {
          logger.error(`Failed to check tunnel ${config.tunnels[i].name}: ${result.reason}`);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error during tunnel checks: ${errorMessage}`);
    } finally {
      this.isRunning = false;
    }
  }

  private async handleTunnelStatus(status: TunnelStatus): Promise<void> {
    const lastStatus = this.lastStatuses.get(status.tunnelName);
    
    // Check if status changed
    if (lastStatus !== undefined && lastStatus !== status.isOnline) {
      if (status.isOnline) {
        // Tunnel recovered
        await this.notifier.sendTunnelRecoveredAlert(
          status.tunnelName,
          config.telegramChatId,
          status.responseTime
        );
      } else {
        // Tunnel went down
        await this.notifier.sendTunnelDownAlert(
          status.tunnelName,
          config.telegramChatId,
          status.error
        );
      }
    }

    this.lastStatuses.set(status.tunnelName, status.isOnline);

    if (status.isOnline) {
      logger.info(`✅ ${status.tunnelName} is online (${status.responseTime}ms)`);
    } else {
      logger.error(`❌ ${status.tunnelName} is offline: ${status.error}`);
    }
  }

  start(): void {
    logger.info('🚀 Starting Cloudflare Tunnel Monitor');
    logger.info(`📍 Monitoring ${config.tunnels.length} tunnel(s):`);
    
    config.tunnels.forEach(tunnel => {
      logger.info(`   - ${tunnel.name}: ${tunnel.url}`);
    });
    
    logger.info(`⏰ Check interval: ${config.checkIntervalMinutes} minutes`);
    logger.info(`💬 Telegram notifications enabled`);

    // Run initial check
    this.checkTunnels();

    // Schedule periodic checks
    const cronExpression = `*/${config.checkIntervalMinutes} * * * *`;
    this.cronTask = cron.schedule(cronExpression, () => {
      this.checkTunnels();
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
