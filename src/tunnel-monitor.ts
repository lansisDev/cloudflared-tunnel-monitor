import axios from 'axios';
import { TunnelStatus, TunnelConfig } from './types';
import logger from './logger';

export class TunnelMonitor {
  constructor(
    private tunnelConfig: TunnelConfig,
    private timeoutMs: number = 10000
  ) {}

  async checkStatus(): Promise<TunnelStatus> {
    const startTime = Date.now();
    
    try {
      logger.info(`Checking tunnel status: ${this.tunnelConfig.name} (${this.tunnelConfig.url})`);
      
      const response = await axios.get(this.tunnelConfig.url, {
        timeout: this.timeoutMs,
        validateStatus: (status: number) => status < 500 // Accept any status code < 500
      });

      const responseTime = Date.now() - startTime;
      const isOnline = response.status >= 200 && response.status < 400;

      logger.info(`Tunnel check completed for ${this.tunnelConfig.name}. Status: ${response.status}, Response time: ${responseTime}ms`);

      return {
        tunnelName: this.tunnelConfig.name,
        isOnline,
        responseTime,
        checkedAt: new Date()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`Tunnel check failed for ${this.tunnelConfig.name}: ${errorMessage}`);

      return {
        tunnelName: this.tunnelConfig.name,
        isOnline: false,
        responseTime,
        error: errorMessage,
        checkedAt: new Date()
      };
    }
  }
}
